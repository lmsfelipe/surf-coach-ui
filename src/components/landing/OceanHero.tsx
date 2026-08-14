import { Link } from '@tanstack/react-router';
import { ScoreCard } from './ScoreCard';
import { useOceanScene } from './useOceanScene';
import './hero.css';

/**
 * Public landing hero: a CSS gradient sky, a procedural WebGL ocean layered over
 * it, and the copy/CTA/score-card stack on top.
 *
 * Layer order is z-index 0→3: sky, ocean canvas, scrim, content. Everything below
 * the content layer is decorative and hidden from assistive tech.
 */
export function OceanHero() {
  // The hook owns the <canvas> inside this container — see useOceanScene.
  const oceanRef = useOceanScene();

  return (
    <div className="surf-hero">
      <div className="sky" aria-hidden="true" />
      <div className="ocean-mount" ref={oceanRef} aria-hidden="true" />
      <div className="scrim" aria-hidden="true" />

      <div className="layer">
        <div className="top-row">
          <div className="wordmark">SurfRise</div>
          <div className="locale-tag">SANTOS · SP</div>
        </div>

        <div className="main-row">
          <div className="copy">
            <div className="eyebrow">Análise de surf com IA</div>
            <h1>
              <span>Grave.</span>
              <span>Envie.</span>
              <span>Evolua.</span>
            </h1>
            <p className="subhead">
              Suba o vídeo da sua sessão em Santos e receba notas de pop-up, equilíbrio e leitura de
              onda em minutos — sem precisar de coach.
            </p>
            <Link to="/login" className="cta">
              Analisar minha sessão →
            </Link>
          </div>

          <ScoreCard />
        </div>
      </div>
    </div>
  );
}
