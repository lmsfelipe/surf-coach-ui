import * as React from 'react';

const TARGET_SCORE = 7.2;
const COUNT_UP_MS = 1100;

/**
 * The "session score" HUD card from the prototype: a sample review result, with
 * the overall score counting up on mount. Static at the target value when the
 * visitor prefers reduced motion.
 */
export function ScoreCard() {
  const [score, setScore] = React.useState(0);

  React.useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setScore(TARGET_SCORE);
      return;
    }

    let frame = 0;
    let start: number | null = null;
    const step = (timestamp: number) => {
      if (start === null) start = timestamp;
      const progress = Math.min((timestamp - start) / COUNT_UP_MS, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setScore(eased * TARGET_SCORE);
      if (progress < 1) frame = requestAnimationFrame(step);
    };
    frame = requestAnimationFrame(step);

    return () => cancelAnimationFrame(frame);
  }, []);

  return (
    <div className="score-card">
      <div className="label">Sessão de exemplo</div>
      <div className="session-line">Canal 1 · Santos/SP · 25/05</div>
      <div className="score-main">
        <span className="value">{score.toFixed(1)}</span>
        <span className="value-label">Nota geral</span>
      </div>
      <div className="score-sub-row">
        <div>
          <span className="value">0.9m</span>
          <span className="label">Onda</span>
        </div>
        <div>
          <span className="value">Pranchinha</span>
          <span className="label">Prancha</span>
        </div>
      </div>
    </div>
  );
}
