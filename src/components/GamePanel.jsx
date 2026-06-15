import React, { useState } from 'react';

const RESULT_CLASS = {
  correct: 'tile-correct',
  present: 'tile-present',
  absent: 'tile-absent',
};

export default function GamePanel({
  word,
  hint,
  guesses,
  current,
  recognised,
  status,
  wordLen,
  maxAttempts,
  onNext,
  onDelete,
}) {
  const [hintOpen, setHintOpen] = useState(false);
  const progress = recognised?.progress || 0;
  const candidate = recognised?.candidate;

  const rows = [];
  for (let r = 0; r < maxAttempts; r++) {
    if (r < guesses.length) {
      rows.push({ type: 'done', letters: guesses[r].letters, result: guesses[r].result });
    } else if (r === guesses.length && status === 'playing') {
      rows.push({ type: 'current' });
    } else {
      rows.push({ type: 'empty' });
    }
  }

  return (
    <div className="bottom-panel">
      <div className="tries-grid">
        {rows.map((row, r) => (
          <div className="tries-row" key={r}>
            {Array.from({ length: wordLen }).map((_, c) => {
              if (row.type === 'done') {
                const l = row.letters[c];
                const cls = `tile ${RESULT_CLASS[row.result[c]]}`;
                return <div key={c} className={cls}>{l}</div>;
              }
              if (row.type === 'current') {
                const filled = c < current.length;
                const active = c === current.length;
                let cls = 'tile';
                if (filled) cls += ' tile-filled';
                else if (active) cls += ' tile-active';
                else cls += ' tile-wait';
                return (
                  <div key={c} className={cls}>
                    {filled ? current[c] : active && candidate ? candidate : ''}
                    {active && progress > 0 && (
                      <div className="tile-progress" style={{ width: `${Math.round(progress * 100)}%` }} />
                    )}
                  </div>
                );
              }
              return <div key={c} className="tile tile-wait" />;
            })}
          </div>
        ))}
      </div>

      {status === 'playing' && (
        <button className="hint-toggle" onClick={onDelete} disabled={current.length === 0}>
          apagar última letra
        </button>
      )}

      {status !== 'playing' && (
        <div className={`result-banner ${status === 'won' ? 'result-won' : 'result-lost'}`}>
          <span className="result-text">
            {status === 'won' ? 'ACERTASTE! 🎉' : `A PALAVRA ERA: ${word}`}
          </span>
          <button className="btn-next" onClick={onNext}>
            [ PRÓXIMA PALAVRA ]
          </button>
        </div>
      )}

      <button className="hint-toggle" onClick={() => setHintOpen((o) => !o)}>
        {hintOpen ? 'esconder pista' : 'ver pista'}
      </button>
      {hintOpen && <div className="hint-box">{hint}</div>}
    </div>
  );
}
