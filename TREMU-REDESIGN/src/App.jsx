import React, { useCallback, useRef, useState } from 'react';
import CameraView from './components/CameraView.jsx';
import GamePanel from './components/GamePanel.jsx';
import AlphabetGuide from './components/AlphabetGuide.jsx';
import { pickRandomWord } from './lib/words.js';

const HOLD_FRAMES = 14;

export default function App() {
  const [started, setStarted] = useState(false);
  const [round, setRound] = useState(() => newRound([]));
  const [letterIndex, setLetterIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [solved, setSolved] = useState(0);
  const [recognised, setRecognised] = useState({ letter: null, confidence: 0, progress: 0 });
  const [showGuide, setShowGuide] = useState(false);
  const historyRef = useRef([]);

  function newRound(history) {
    const [word, hint] = pickRandomWord(history);
    return { word, hint, letters: word.split('') };
  }

  const advance = useCallback(() => {
    if (letterIndex + 1 < round.letters.length) {
      setLetterIndex((i) => i + 1);
      setScore((s) => s + 10);
    } else {
      setScore((s) => s + 25);
      setSolved((s) => s + 1);
      historyRef.current = [...historyRef.current, round.word].slice(-20);
      setRound(newRound(historyRef.current));
      setLetterIndex(0);
    }
  }, [letterIndex, round]);

  const skip = useCallback(() => {
    historyRef.current = [...historyRef.current, round.word].slice(-20);
    setRound(newRound(historyRef.current));
    setLetterIndex(0);
  }, [round]);

  const target = round.letters[letterIndex];

  const onRecognition = useCallback((info) => {
    setRecognised(info);
    if (info.committed && info.committed === target) advance();
  }, [advance, target]);

  if (!started) {
    return (
      <div className="splash">
        <div className="splash-inner">
          <div className="splash-header">
            <span className="splash-eyebrow">LGP.SYS v2.0 — inicializado</span>
            <div className="splash-title">
              LGP
              <div className="splash-title-sub">.gestual</div>
            </div>
          </div>

          <p className="splash-desc">
            Aprende o alfabeto da Língua Gestual Portuguesa jogando — letra a letra, gesto a gesto.
          </p>

          <div className="splash-steps">
            <div className="step-row">
              <span className="step-num">01</span>
              <span>Aparece uma palavra de 4 letras no ecrã</span>
            </div>
            <div className="step-row">
              <span className="step-num">02</span>
              <span>Faz o gesto de cada letra à câmara</span>
            </div>
            <div className="step-row">
              <span className="step-num">03</span>
              <span>Mantém o gesto firme até a tecla acender</span>
            </div>
          </div>

          <div className="splash-actions">
            <button className="btn-start" onClick={() => setStarted(true)}>
              [ INICIAR JOGO ]
            </button>
            <button className="btn-guide" onClick={() => setShowGuide(true)}>
              ver gestos LGP suportados
            </button>
          </div>

          <p className="splash-footer">câmara usada só no teu dispositivo — nenhum dado é enviado</p>
        </div>

        {showGuide && <AlphabetGuide onClose={() => setShowGuide(false)} />}
      </div>
    );
  }

  return (
    <div className="game-shell">
      <div className="hud-top">
        {/* Botão guia */}
        <button className="hud-btn" onClick={() => setShowGuide(true)} title="Ver gestos">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="8" x2="12" y2="12"/>
            <line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
        </button>

        {/* Score */}
        <div className="hud-score">
          <span className="hud-score-val">{score}</span>
          <span className="hud-score-sep">/</span>
          <span className="hud-score-label">pts</span>
        </div>

        {/* Streak */}
        <div className="hud-streak">
          {Array.from({ length: Math.min(solved, 5) }).map((_, i) => (
            <span key={i} className="hud-star">◆</span>
          ))}
          {solved === 0 && <span className="hud-streak-empty">0 words</span>}
        </div>

        {/* Skip */}
        <button className="hud-btn" onClick={skip} title="Saltar palavra">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="5 4 15 12 5 20 5 4"/>
            <line x1="19" y1="5" x2="19" y2="19"/>
          </svg>
        </button>
      </div>

      <CameraView
        target={target}
        holdFrames={HOLD_FRAMES}
        onRecognition={onRecognition}
        recognised={recognised}
      />

      <GamePanel
        word={round.word}
        hint={round.hint}
        letterIndex={letterIndex}
        recognised={recognised}
      />

      {showGuide && <AlphabetGuide onClose={() => setShowGuide(false)} />}
    </div>
  );
}
