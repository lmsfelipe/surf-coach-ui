/**
 * Procedural ocean shaders — ported verbatim from the surf-hero.html prototype.
 *
 * Three summed directional sine waves displace a plane on the GPU; the normal is
 * derived analytically from the partial derivatives of that same sum (rather than
 * from the geometry), which is what keeps the specular highlight crisp at low
 * segment counts. The fragment stage fades alpha to 0 with distance so the mesh
 * dissolves into the CSS gradient sky instead of ending on a hard horizon line.
 *
 * Do not "clean up" the magic numbers — they are the visual design.
 */

export const oceanVertexShader = /* glsl */ `
uniform float uTime;
varying float vHeight;
varying vec3 vNormal;
varying vec3 vPosition;

void main() {
  vec3 pos = position;

  float freq1 = 0.15; float amp1 = 0.35; vec2 dir1 = normalize(vec2(1.0, 0.4));
  float freq2 = 0.28; float amp2 = 0.18; vec2 dir2 = normalize(vec2(0.6, -1.0));
  float freq3 = 0.55; float amp3 = 0.08; vec2 dir3 = normalize(vec2(-0.8, 0.5));

  float speed1 = 0.6; float speed2 = 0.9; float speed3 = 1.4;

  float phase1 = dot(pos.xz, dir1) * freq1 + uTime * speed1;
  float phase2 = dot(pos.xz, dir2) * freq2 + uTime * speed2;
  float phase3 = dot(pos.xz, dir3) * freq3 + uTime * speed3;

  float height = amp1 * sin(phase1) + amp2 * sin(phase2) + amp3 * sin(phase3);

  float dHdx = amp1*cos(phase1)*freq1*dir1.x + amp2*cos(phase2)*freq2*dir2.x + amp3*cos(phase3)*freq3*dir3.x;
  float dHdz = amp1*cos(phase1)*freq1*dir1.y + amp2*cos(phase2)*freq2*dir2.y + amp3*cos(phase3)*freq3*dir3.y;

  vec3 tangentX = normalize(vec3(1.0, dHdx, 0.0));
  vec3 tangentZ = normalize(vec3(0.0, dHdz, 1.0));
  vec3 n = normalize(cross(tangentZ, tangentX));

  pos.y += height;

  vHeight = height;
  vNormal = normalize(normalMatrix * n);
  vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
  vPosition = mvPosition.xyz;
  gl_Position = projectionMatrix * mvPosition;
}
`;

export const oceanFragmentShader = /* glsl */ `
precision mediump float;
varying float vHeight;
varying vec3 vNormal;
varying vec3 vPosition;

uniform vec3 uDeep;
uniform vec3 uMid;
uniform vec3 uFoam;
uniform vec3 uSun;
uniform vec3 uGlow;
uniform float uFogNear;
uniform float uFogFar;

void main() {
  float h = clamp(vHeight * 1.6 + 0.5, 0.0, 1.0);
  vec3 base = mix(uDeep, uMid, h);
  base = mix(base, uFoam, smoothstep(0.42, 0.5, vHeight) * 0.35);

  vec3 N = normalize(vNormal);
  vec3 V = normalize(-vPosition);
  vec3 L = normalize(uSun);
  vec3 Hv = normalize(L + V);
  float spec = pow(max(dot(N, Hv), 0.0), 70.0);
  vec3 color = base + uGlow * spec * 1.5;

  float depth = length(vPosition);
  float fadeOut = smoothstep(uFogNear, uFogFar, depth);

  gl_FragColor = vec4(color, 1.0 - fadeOut);
}
`;

/** Wave palette, matching the `--deep/--mid/--foam/--glow` CSS tokens. */
export const OCEAN_COLORS = {
  deep: 0x0a1b28,
  mid: 0x1c5a63,
  foam: 0xdceee6,
  glow: 0xf6c667,
} as const;
