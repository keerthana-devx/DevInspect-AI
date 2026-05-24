import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Gamepad2, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

/* ── Typing Speed Test ─────────────────────────────────────────── */
const SNIPPETS = [
  'const greet = (name) => `Hello, ${name}!`;',
  'function fibonacci(n) { return n <= 1 ? n : fibonacci(n-1) + fibonacci(n-2); }',
  'const arr = [1,2,3].map(x => x * 2).filter(x => x > 2);',
  'async function fetchData(url) { const res = await fetch(url); return res.json(); }',
  'class Stack { constructor() { this.items = []; } push(x) { this.items.push(x); } }',
];

const TypingGame = () => {
  const [snippet] = useState(() => SNIPPETS[Math.floor(Math.random() * SNIPPETS.length)]);
  const [typed, setTyped] = useState('');
  const [startTime, setStartTime] = useState(null);
  const [wpm, setWpm] = useState(null);
  const [accuracy, setAccuracy] = useState(100);
  const inputRef = useRef(null);

  useEffect(() => { inputRef.current?.focus(); }, []);

  const handleChange = (e) => {
    const val = e.target.value;
    if (!startTime && val.length === 1) setStartTime(Date.now());
    setTyped(val);

    // Accuracy
    let correct = 0;
    for (let i = 0; i < val.length; i++) {
      if (val[i] === snippet[i]) correct++;
    }
    setAccuracy(val.length ? Math.round((correct / val.length) * 100) : 100);

    // Done
    if (val === snippet) {
      const elapsed = (Date.now() - startTime) / 1000 / 60;
      const words = snippet.split(' ').length;
      setWpm(Math.round(words / elapsed));
    }
  };

  const reset = () => { setTyped(''); setStartTime(null); setWpm(null); setAccuracy(100); inputRef.current?.focus(); };

  return (
    <div className="space-y-4">
      <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Typing Speed Test</p>
      <div className="p-4 bg-muted/30 rounded-xl border border-border/20 font-mono text-sm leading-relaxed select-none">
        {snippet.split('').map((char, i) => {
          let cls = 'text-muted-foreground';
          if (i < typed.length) cls = typed[i] === char ? 'text-green-500' : 'text-destructive bg-destructive/10';
          else if (i === typed.length) cls = 'text-foreground underline';
          return <span key={i} className={cls}>{char}</span>;
        })}
      </div>
      {wpm ? (
        <div className="flex items-center gap-4 p-4 bg-primary/10 rounded-xl border border-primary/20">
          <div className="text-center"><p className="text-2xl font-black text-primary">{wpm}</p><p className="text-xs text-muted-foreground">WPM</p></div>
          <div className="text-center"><p className="text-2xl font-black text-green-500">{accuracy}%</p><p className="text-xs text-muted-foreground">Accuracy</p></div>
          <Button onClick={reset} size="sm" className="ml-auto btn-secondary h-8 text-xs"><RefreshCw className="w-3.5 h-3.5 mr-1" />Retry</Button>
        </div>
      ) : (
        <textarea
          ref={inputRef}
          value={typed}
          onChange={handleChange}
          className="w-full h-20 p-3 font-mono text-sm bg-background/50 border border-border/30 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-primary/30"
          placeholder="Start typing the snippet above..."
          spellCheck={false}
        />
      )}
      {!wpm && <div className="flex justify-between text-xs text-muted-foreground"><span>Accuracy: {accuracy}%</span><span>{typed.length}/{snippet.length} chars</span></div>}
    </div>
  );
};

/* ── Snake Game ────────────────────────────────────────────────── */
const GRID = 15;
const CELL = 20;

const SnakeGame = () => {
  const canvasRef = useRef(null);
  const stateRef = useRef({
    snake: [{ x: 7, y: 7 }],
    dir: { x: 1, y: 0 },
    food: { x: 3, y: 3 },
    score: 0,
    alive: true,
  });
  const [score, setScore] = useState(0);
  const [alive, setAlive] = useState(true);
  const loopRef = useRef(null);

  const randomFood = (snake) => {
    let pos;
    do { pos = { x: Math.floor(Math.random() * GRID), y: Math.floor(Math.random() * GRID) }; }
    while (snake.some(s => s.x === pos.x && s.y === pos.y));
    return pos;
  };

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const s = stateRef.current;

    // Clear canvas with dark background
    ctx.fillStyle = '#0f0f1a';
    ctx.fillRect(0, 0, GRID * CELL, GRID * CELL);

    // Draw food
    ctx.fillStyle = '#ec4899';
    ctx.beginPath();
    ctx.arc(s.food.x * CELL + CELL / 2, s.food.y * CELL + CELL / 2, CELL / 2 - 2, 0, Math.PI * 2);
    ctx.fill();

    // Draw snake
    s.snake.forEach((seg, i) => {
      ctx.fillStyle = i === 0 ? '#6366f1' : '#818cf8';
      ctx.fillRect(seg.x * CELL + 1, seg.y * CELL + 1, CELL - 2, CELL - 2);
    });
  }, []);

  const tick = useCallback(() => {
    const s = stateRef.current;
    if (!s.alive) return;
    const head = { x: s.snake[0].x + s.dir.x, y: s.snake[0].y + s.dir.y };
    if (head.x < 0 || head.x >= GRID || head.y < 0 || head.y >= GRID || s.snake.some(seg => seg.x === head.x && seg.y === head.y)) {
      s.alive = false; setAlive(false); return;
    }
    s.snake.unshift(head);
    if (head.x === s.food.x && head.y === s.food.y) {
      s.score++; setScore(s.score); s.food = randomFood(s.snake);
    } else { s.snake.pop(); }
    draw();
  }, [draw]);

  useEffect(() => {
    // Wait one frame so canvas ref is mounted
    const raf = requestAnimationFrame(() => {
      draw();
      loopRef.current = setInterval(tick, 150);
    });
    const onKey = (e) => {
      const s = stateRef.current;
      if (!s.alive) return;
      if (e.key === 'ArrowUp'    && s.dir.y !== 1)  s.dir = { x: 0, y: -1 };
      if (e.key === 'ArrowDown'  && s.dir.y !== -1) s.dir = { x: 0, y: 1 };
      if (e.key === 'ArrowLeft'  && s.dir.x !== 1)  s.dir = { x: -1, y: 0 };
      if (e.key === 'ArrowRight' && s.dir.x !== -1) s.dir = { x: 1, y: 0 };
    };
    window.addEventListener('keydown', onKey);
    return () => { 
      cancelAnimationFrame(raf);
      clearInterval(loopRef.current); 
      window.removeEventListener('keydown', onKey); 
    };
  }, [tick, draw]);

  const restart = () => {
    stateRef.current = { snake: [{ x: 7, y: 7 }], dir: { x: 1, y: 0 }, food: { x: 3, y: 3 }, score: 0, alive: true };
    setScore(0); setAlive(true);
    clearInterval(loopRef.current);
    loopRef.current = setInterval(tick, 150);
    draw();
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Snake — Use Arrow Keys</p>
        <span className="text-sm font-bold text-primary">Score: {score}</span>
      </div>
      <div className="flex justify-center">
        <canvas 
          ref={canvasRef} 
          width={GRID * CELL} 
          height={GRID * CELL} 
          className="rounded-xl border border-border/30" 
          style={{ background: '#0f0f1a' }}
        />
      </div>
      {!alive && (
        <div className="text-center space-y-2">
          <p className="text-sm font-bold text-destructive">Game Over! Score: {score}</p>
          <Button onClick={restart} size="sm" className="btn-primary h-8 text-xs"><RefreshCw className="w-3.5 h-3.5 mr-1" />Restart</Button>
        </div>
      )}
    </div>
  );
};

/* ── Main Modal ────────────────────────────────────────────────── */
const MiniGameModal = ({ isOpen, onClose }) => {
  const [game, setGame] = useState('typing');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const backdropRef = useRef(null);

  // Handle escape key and fullscreen
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isOpen) return;
      
      if (e.key === 'Escape') {
        if (isFullscreen) {
          exitFullscreen();
        } else {
          onClose();
        }
      }
      if (e.key === 'F11') {
        e.preventDefault();
        toggleFullscreen();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isFullscreen, onClose]);

  const toggleFullscreen = () => {
    if (!isFullscreen) {
      const el = backdropRef.current;
      if (el?.requestFullscreen) {
        el.requestFullscreen();
      } else if (el?.webkitRequestFullscreen) {
        el.webkitRequestFullscreen();
      }
    } else {
      exitFullscreen();
    }
  };

  const exitFullscreen = () => {
    if (document.exitFullscreen) document.exitFullscreen();
    else if (document.webkitExitFullscreen) document.webkitExitFullscreen();
  };

  // Listen for fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
    };
  }, []);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          ref={backdropRef}
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={(e) => e.target === e.currentTarget && onClose()}>
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }} 
            animate={{ scale: 1, opacity: 1 }} 
            exit={{ scale: 0.9, opacity: 0 }}
            className={`card-glass p-6 rounded-3xl space-y-5 ${isFullscreen ? 'w-full h-full max-w-none overflow-y-auto' : 'w-full max-w-lg'}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Gamepad2 className="w-5 h-5 text-primary" />
                <h3 className="font-bold text-lg">Developer Mini-Games</h3>
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={toggleFullscreen}
                  className="text-muted-foreground hover:text-foreground transition-colors p-2 hover:bg-muted/50 rounded-lg"
                  title={isFullscreen ? 'Exit Fullscreen (Esc)' : 'Fullscreen (F11)'}
                >
                  {isFullscreen ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 9V4.5M9 9H4.5M9 9L3.5 3.5M15 9h4.5M15 9V4.5M15 9l5.5-5.5M9 15v4.5M9 15H4.5M9 15l-5.5 5.5M15 15h4.5M15 15v4.5m0-4.5l5.5 5.5" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                    </svg>
                  )}
                </button>
                <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="flex gap-2">
              {[{id: 'typing', label: '⌨️ Typing Speed'}, {id: 'snake', label: '🐍 Snake'}].map((g) => (
                <button key={g.id} onClick={() => setGame(g.id)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors ${game === g.id ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-muted/80'}`}>
                  {g.label}
                </button>
              ))}
            </div>

            <div className={isFullscreen ? 'h-[calc(100vh-200px)] overflow-y-auto' : ''}>
              {game === 'typing' && <TypingGame key="typing" />}
              {game === 'snake' && <SnakeGame key="snake" />}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default MiniGameModal;
