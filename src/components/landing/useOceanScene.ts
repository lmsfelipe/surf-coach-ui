import * as React from 'react';
import { oceanFragmentShader, oceanVertexShader, OCEAN_COLORS } from './oceanShaders';

/** Below this width we halve the wave grid — see `SEGMENTS`. */
const NARROW_VIEWPORT = 720;

const SEGMENTS = {
  narrow: { x: 90, y: 60 },
  wide: { x: 180, y: 120 },
} as const;

/** Retina is worth it; 3x on a full-viewport WebGL canvas is not. */
const MAX_PIXEL_RATIO = 2;

/**
 * Mounts the procedural ocean into a container element with vanilla three.js.
 * Returns a ref to attach to that container.
 *
 * three is imported dynamically so it lands in its own chunk: the sky gradient,
 * headline and CTA are real DOM that paint immediately, and ~190KB gzip of WebGL
 * never blocks the app entry or the landing's LCP. If the import or the GL context
 * fails, nothing is appended and the CSS gradient sky stands on its own.
 *
 * Honors `prefers-reduced-motion` the way the prototype did: the scene is still
 * built and rendered, but as a single static frame with no animation loop.
 */
export function useOceanScene(): React.MutableRefObject<HTMLDivElement | null> {
  const containerRef = React.useRef<HTMLDivElement | null>(null);

  React.useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Guards the async import against an unmount that lands first — including
    // StrictMode's double-invoke in dev, which would otherwise leak a context.
    let cancelled = false;
    let teardown: (() => void) | null = null;

    void (async () => {
      let THREE: typeof import('three');
      try {
        THREE = await import('three');
      } catch {
        return; // Offline or chunk failed to load; gradient sky remains.
      }
      if (cancelled) return;

      // The canvas is created here rather than rendered by React on purpose:
      // `forceContextLoss()` in teardown permanently poisons a canvas element
      // (getContext then hands the *same* lost context to the next renderer, so
      // it draws nothing). Owning the element means every mount — including Fast
      // Refresh and StrictMode — starts from a clean one.
      const canvas = document.createElement('canvas');
      canvas.className = 'ocean';
      canvas.setAttribute('aria-hidden', 'true');
      container.appendChild(canvas);

      const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      const segments = window.innerWidth < NARROW_VIEWPORT ? SEGMENTS.narrow : SEGMENTS.wide;

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 100);
      camera.position.set(0, 1.5, 4.5);
      camera.lookAt(0, 0.3, -10);

      let renderer: import('three').WebGLRenderer;
      try {
        renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
      } catch {
        canvas.remove(); // No WebGL on this device; gradient sky remains.
        return;
      }
      if (cancelled) {
        renderer.dispose();
        canvas.remove();
        return;
      }

      renderer.setPixelRatio(Math.min(window.devicePixelRatio, MAX_PIXEL_RATIO));
      renderer.setClearColor(0x000000, 0);
      // The prototype ran on three r128, which applied no output color transform
      // and stored hex colors raw. r152+ defaults to sRGB output and converts
      // Color() inputs into linear working space — both would visibly shift this
      // palette. Opting out of each keeps the ported hero pixel-faithful.
      renderer.outputColorSpace = THREE.LinearSRGBColorSpace;
      const rawColor = (hex: number) => new THREE.Color().setHex(hex, THREE.LinearSRGBColorSpace);

      const geometry = new THREE.PlaneGeometry(60, 40, segments.x, segments.y);
      geometry.rotateX(-Math.PI / 2);

      const uniforms = {
        uTime: { value: 0 },
        uDeep: { value: rawColor(OCEAN_COLORS.deep) },
        uMid: { value: rawColor(OCEAN_COLORS.mid) },
        uFoam: { value: rawColor(OCEAN_COLORS.foam) },
        uSun: { value: new THREE.Vector3(0.3, 0.35, -1.0).normalize() },
        uGlow: { value: rawColor(OCEAN_COLORS.glow) },
        uFogNear: { value: 6.0 },
        uFogFar: { value: 16.0 },
      };

      const material = new THREE.ShaderMaterial({
        uniforms,
        vertexShader: oceanVertexShader,
        fragmentShader: oceanFragmentShader,
        transparent: true,
      });

      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.z = -6;
      scene.add(mesh);

      // CSS owns the canvas's layout size (inset: 0), so `setSize` updates only the
      // drawing buffer — passing updateStyle: false stops three from writing inline
      // width/height that would fight the stylesheet.
      const resize = () => {
        const width = canvas.clientWidth;
        const height = canvas.clientHeight;
        if (!width || !height) return;
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        renderer.setSize(width, height, false);
        // The prototype resized without redrawing, so a reduced-motion user who
        // rotated their phone was left with a stretched single frame. Repaint.
        if (reduceMotion) renderer.render(scene, camera);
      };

      // ResizeObserver rather than window.resize: this also catches the dvh shifts
      // from the mobile URL bar collapsing, which never fire a window resize.
      const observer = new ResizeObserver(resize);
      observer.observe(canvas);
      resize();

      // Plain performance.now() rather than THREE.Clock, which is deprecated as of
      // r185 and warns on every landing visit. Same value: seconds since setup.
      const startedAt = performance.now();
      let frame = 0;
      const animate = () => {
        frame = requestAnimationFrame(animate);
        uniforms.uTime.value = (performance.now() - startedAt) / 1000;
        renderer.render(scene, camera);
      };

      if (reduceMotion) {
        renderer.render(scene, camera);
      } else {
        animate();
      }
      // Fade the canvas in now that a frame exists, so the lazy chunk's arrival
      // doesn't pop over the gradient.
      canvas.classList.add('is-ready');

      teardown = () => {
        cancelAnimationFrame(frame);
        observer.disconnect();
        geometry.dispose();
        material.dispose();
        renderer.dispose();
        // Browsers cap concurrent WebGL contexts (~16); without this, navigating
        // in and out of the landing would eventually exhaust them.
        renderer.forceContextLoss();
        canvas.remove();
      };
    })();

    return () => {
      cancelled = true;
      teardown?.();
    };
  }, []);

  return containerRef;
}
