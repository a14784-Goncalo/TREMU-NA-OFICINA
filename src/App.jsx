import React, { useCallback, useRef, useState } from 'react';
import CameraView from './components/CameraView.jsx';
import GamePanel from './components/GamePanel.jsx';
import AlphabetGuide from './components/AlphabetGuide.jsx';
import { pickRandomWord, evaluateGuess } from './lib/words.js';

const HOLD_FRAMES = 14;
const WORD_LEN = 4;
const MAX_ATTEMPTS = 6;

export default function App() {
  const [started, setStarted] = useState(false);
  const [round, setRound] = useState(() => newRound([]));
  const [guesses, setGuesses] = useState([]); // [{ letters: ['B','O','L','A'], result: ['correct',...] }]
  const [current, setCurrent] = useState([]); // letras da tentativa atual, ex: ['B','O']
  const [score, setScore] = useState(0);
  const [solved, setSolved] = useState(0);
  const [status, setStatus] = useState('playing'); // 'playing' | 'won' | 'lost'
  const [recognised, setRecognised] = useState({ letter: null, confidence: 0, progress: 0 });
  const [showGuide, setShowGuide] = useState(false);
  const historyRef = useRef([]);
  const submittingRef = useRef(false);

  function newRound(history) {
    const [word, hint] = pickRandomWord(history);
    return { word, hint };
  }

  const startNewRound = useCallback(() => {
    historyRef.current = [...historyRef.current, round.word].slice(-20);
    submittingRef.current = false;
    setRound(newRound(historyRef.current));
    setGuesses([]);
    setCurrent([]);
    setStatus('playing');
  }, [round]);

  const skip = useCallback(() => {
    startNewRound();
  }, [startNewRound]);

  const removeLetter = useCallback(() => {
    if (status !== 'playing') return;
    setCurrent((cur) => cur.slice(0, -1));
  }, [status]);

  const submitGuess = useCallback((finalLetters) => {
    if (submittingRef.current) return;
    submittingRef.current = true;

    const guessWord = finalLetters.join('');
    const result = evaluateGuess(guessWord, round.word);
    const entry = { letters: finalLetters, result };

    setGuesses((gs) => {
      const next = [...gs, entry];

      if (guessWord === round.word) {
        setScore((s) => s + 50);
        setSolved((s) => s + 1);
        setStatus('won');
      } else if (next.length >= MAX_ATTEMPTS) {
        setStatus('lost');
      } else {
        setScore((s) => s + 5);
      }

      return next;
    });

    setCurrent([]);
    submittingRef.current = false;
  }, [round]);

  const addLetter = useCallback((letter) => {
    if (status !== 'playing') return;
    setCurrent((cur) => {
      if (cur.length >= WORD_LEN) return cur;
      const next = [...cur, letter];
      if (next.length === WORD_LEN) {
        // pequeno atraso para o jogador ver a última letra colocada antes de avaliar
        setTimeout(() => submitGuess(next), 350);
      }
      return next;
    });
  }, [status, submitGuess]);

  const onRecognition = useCallback((info) => {
    setRecognised(info);
    if (info.committed) addLetter(info.committed);
  }, [addLetter]);

  if (!started) {
    return (
      <div className="splash">
        <div className="splash-inner">
          <div className="splash-header">
            <span className="splash-eyebrow">LGP.SYS v2.0 — inicializado</span>
            <div className="splash-title">
              Termo
              <div className="splash-title-sub">.LGP</div>
            </div>
          </div>

          <p className="splash-desc">
            O clássico jogo da palavra de 4 letras — mas soletrada à mão, em Língua Gestual Portuguesa.
          </p>

          <div className="splash-steps">
            <div className="step-row">
              <span className="step-num">01</span>
              <span>Soletra uma palavra de 4 letras à câmara, gesto a gesto</span>
            </div>
            <div className="step-row">
              <span className="step-num">02</span>
              <span>Mantém cada gesto firme até a letra ser aceite</span>
            </div>
            <div className="step-row">
              <span className="step-num">03</span>
              <span>Verde = certo no lugar certo. Amarelo = existe mas no lugar errado. Cinzento = não existe</span>
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

        {/* Skip / Nova palavra */}
        <button className="hud-btn" onClick={skip} title="Nova palavra">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="5 4 15 12 5 20 5 4"/>
            <line x1="19" y1="5" x2="19" y2="19"/>
          </svg>
        </button>
      </div>

      <CameraView
        holdFrames={HOLD_FRAMES}
        onRecognition={onRecognition}
        recognised={recognised}
        current={current}
        wordLen={WORD_LEN}
      />

      <GamePanel
        word={round.word}
        hint={round.hint}
        guesses={guesses}
        current={current}
        recognised={recognised}
        status={status}
        wordLen={WORD_LEN}
        maxAttempts={MAX_ATTEMPTS}
        onNext={startNewRound}
        onDelete={removeLetter}
      />

      {showGuide && <AlphabetGuide onClose={() => setShowGuide(false)} />}
    </div>
  );
}