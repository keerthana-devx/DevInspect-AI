import React, { useState, useEffect, useRef, useCallback, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Gamepad2, RefreshCw, Brain, Zap, Play, Pause } from 'lucide-react';
import { Button } from '@/components/ui/button';

/* ── Snake Game ─────────────────────────────────────────────────── */
const SnakeGame = ({ isPaused, onGameEnd }) => {
  const [snake, setSnake] = useState([{ x: 10, y: 10 }]);
  const [food, setFood] = useState({ x: 5, y: 5 });
  const [direction, setDirection] = useState({ x: 0, y: 0 });
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const [gamePaused, setGamePaused] = useState(false);
  const intervalRef = useRef(null);
  const gameContainerRef = useRef(null);

  const gridSize = 20;
  const canvasSize = 300;

  // Game loop with proper cleanup
  useEffect(() => {
    if (!gameStarted || gameOver || isPaused || gamePaused) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    const moveSnake = () => {
      setSnake(currentSnake => {
        if (direction.x === 0 && direction.y === 0) return currentSnake;
        
        const newSnake = [...currentSnake];
        const head = { ...newSnake[0] };
        head.x += direction.x;
        head.y += direction.y;

        // Check walls
        if (head.x < 0 || head.x >= gridSize || head.y < 0 || head.y >= gridSize) {
          setGameOver(true);
          onGameEnd?.(score);
          return currentSnake;
        }

        // Check self collision
        if (newSnake.some(segment => segment.x === head.x && segment.y === head.y)) {
          setGameOver(true);
          onGameEnd?.(score);
          return currentSnake;
        }

        newSnake.unshift(head);

        // Check food
        if (head.x === food.x && head.y === food.y) {
          setScore(s => s + 10);
          // Generate new food position avoiding snake body
          let newFood;
          do {
            newFood = {
              x: Math.floor(Math.random() * gridSize),
              y: Math.floor(Math.random() * gridSize)
            };
          } while (newSnake.some(segment => segment.x === newFood.x && segment.y === newFood.y));
          setFood(newFood);
        } else {
          newSnake.pop();
        }

        return newSnake;
      });
    };

    intervalRef.current = setInterval(moveSnake, 150);
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [direction, food, gameStarted, gameOver, isPaused, gamePaused, score, onGameEnd]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  // Keyboard controls
  const handleKeyPress = useCallback((e) => {
    if (!gameStarted || gameOver || isPaused) return;
    
    e.preventDefault();
    switch (e.key) {
      case 'ArrowUp':
      case 'w':
      case 'W':
        if (direction.y !== 1) setDirection({ x: 0, y: -1 });
        break;
      case 'ArrowDown':
      case 's':
      case 'S':
        if (direction.y !== -1) setDirection({ x: 0, y: 1 });
        break;
      case 'ArrowLeft':
      case 'a':
      case 'A':
        if (direction.x !== 1) setDirection({ x: -1, y: 0 });
        break;
      case 'ArrowRight':
      case 'd':
      case 'D':
        if (direction.x !== -1) setDirection({ x: 1, y: 0 });
        break;
      case ' ':
        setGamePaused(p => !p);
        break;
    }
  }, [gameStarted, gameOver, isPaused, direction]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [handleKeyPress]);

  const startGame = () => {
    setSnake([{ x: 10, y: 10 }]);
    setFood({ x: 5, y: 5 });
    setDirection({ x: 1, y: 0 });
    setScore(0);
    setGameOver(false);
    setGameStarted(true);
    setGamePaused(false);
  };

  const togglePause = () => {
    setGamePaused(p => !p);
  };

  const cellSize = canvasSize / gridSize;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm font-bold text-primary flex items-center gap-2">
          <Zap className="w-4 h-4 text-green-500" /> Snake Game
        </p>
        <span className="text-sm font-bold">Score: {score}</span>
      </div>
      
      <div className="flex flex-col items-center space-y-4">
        <div className="flex items-center gap-2">
          {!gameStarted ? (
            <Button onClick={startGame} size="sm" className="btn-primary h-8 text-xs">
              <Play className="w-3 h-3 mr-1" />Start Game
            </Button>
          ) : gameOver ? (
            <Button onClick={startGame} size="sm" className="btn-secondary h-8 text-xs">
              <RefreshCw className="w-3 h-3 mr-1" />Play Again
            </Button>
          ) : (
            <>
              <Button onClick={togglePause} size="sm" className="btn-secondary h-8 text-xs">
                {gamePaused ? <Play className="w-3 h-3 mr-1" /> : <Pause className="w-3 h-3 mr-1" />}
                {gamePaused ? 'Resume' : 'Pause'}
              </Button>
              <span className="text-xs text-muted-foreground">WASD or Arrow keys</span>
            </>
          )}
        </div>
        
        <div 
          ref={gameContainerRef}
          className="relative border-2 border-border/30 rounded-lg overflow-hidden bg-background/50 mx-auto"
          style={{ width: canvasSize, height: canvasSize }}
        >
          {/* Snake */}
          {snake.map((segment, index) => (
            <div
              key={index}
              className={`absolute ${index === 0 ? 'bg-green-500' : 'bg-green-400'} rounded-sm transition-all duration-75`}
              style={{
                left: segment.x * cellSize,
                top: segment.y * cellSize,
                width: cellSize - 1,
                height: cellSize - 1
              }}
            />
          ))}
          
          {/* Food */}
          <div
            className="absolute bg-red-500 rounded-full animate-pulse"
            style={{
              left: food.x * cellSize + 2,
              top: food.y * cellSize + 2,
              width: cellSize - 4,
              height: cellSize - 4
            }}
          />
          
          {/* Game Over Overlay */}
          {gameOver && (
            <div className="absolute inset-0 bg-black/70 flex items-center justify-center backdrop-blur-sm">
              <div className="text-center p-4">
                <p className="text-white font-bold mb-2 text-lg">Game Over!</p>
                <p className="text-white/80 text-sm mb-3">Final Score: {score}</p>
                <Button onClick={startGame} size="sm" className="btn-primary">
                  Play Again
                </Button>
              </div>
            </div>
          )}
          
          {/* Pause Overlay */}
          {gameStarted && !gameOver && (gamePaused || isPaused) && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center backdrop-blur-sm">
              <div className="text-center">
                <Pause className="w-8 h-8 text-white mx-auto mb-2" />
                <p className="text-white font-bold">Paused</p>
                <p className="text-white/80 text-xs mt-1">Press Space or Resume</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

/* ── Typing Speed Test ─────────────────────────────────────────── */
const TypingGame = ({ isPaused, onGameEnd }) => {
  const [snippet, setSnippet] = useState('');
  const [typed, setTyped] = useState('');
  const [start, setStart] = useState(null);
  const [wpm, setWpm] = useState(null);
  const [accuracy, setAccuracy] = useState(100);
  const [gameStarted, setGameStarted] = useState(false);
  const ref = useRef(null);
  
  const SNIPPETS = [
    'const greet = name => `Hello, ${name}!`;',
    'const sum = (a, b) => a + b;',
    'async function load(url) { return fetch(url).then(r => r.json()); }',
    'const unique = arr => [...new Set(arr)];',
    'function debounce(fn, ms) { let t; return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), ms); }; }',
    'const fibonacci = n => n <= 1 ? n : fibonacci(n-1) + fibonacci(n-2);',
    'const deepClone = obj => JSON.parse(JSON.stringify(obj));'
  ];

  useEffect(() => {
    if (!gameStarted) {
      const randomSnippet = SNIPPETS[Math.floor(Math.random() * SNIPPETS.length)];
      setSnippet(randomSnippet);
    }
  }, [gameStarted]);

  useEffect(() => {
    if (gameStarted && ref.current && !isPaused) {
      ref.current.focus();
    }
  }, [gameStarted, isPaused]);

  const startGame = () => {
    setGameStarted(true);
    setTyped('');
    setStart(null);
    setWpm(null);
    setAccuracy(100);
    setTimeout(() => ref.current?.focus(), 100);
  };

  const resetGame = () => {
    setGameStarted(false);
    setTyped('');
    setStart(null);
    setWpm(null);
    setAccuracy(100);
    const randomSnippet = SNIPPETS[Math.floor(Math.random() * SNIPPETS.length)];
    setSnippet(randomSnippet);
  };

  const onChange = e => {
    if (isPaused) return;
    
    const v = e.target.value;
    if (!start && v.length === 1) setStart(Date.now());
    setTyped(v);
    
    // Calculate accuracy
    let correct = 0;
    for (let i = 0; i < Math.min(v.length, snippet.length); i++) {
      if (v[i] === snippet[i]) correct++;
    }
    const acc = v.length > 0 ? Math.round((correct / v.length) * 100) : 100;
    setAccuracy(acc);
    
    // Check completion
    if (v === snippet && start) {
      const mins = (Date.now() - start) / 60000;
      const wordsTyped = snippet.split(' ').length;
      const calculatedWpm = Math.round(wordsTyped / mins);
      setWpm(calculatedWpm);
      onGameEnd?.(calculatedWpm);
    }
  };

  const getCharacterClass = (char, index) => {
    if (index >= typed.length) {
      return index === typed.length ? 'text-foreground bg-primary/20 animate-pulse' : 'text-muted-foreground';
    }
    return typed[index] === char ? 'text-green-500' : 'text-red-500 bg-red-500/10';
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm font-bold text-primary flex items-center gap-2">
          <Zap className="w-4 h-4 text-blue-500" /> Typing Speed Test
        </p>
        <div className="flex items-center gap-4 text-xs">
          {gameStarted && (
            <>
              <span>Accuracy: <strong className={accuracy >= 95 ? 'text-green-500' : accuracy >= 80 ? 'text-yellow-500' : 'text-red-500'}>{accuracy}%</strong></span>
              {wpm && <span>WPM: <strong className="text-primary">{wpm}</strong></span>}
            </>
          )}
        </div>
      </div>
      
      {!gameStarted ? (
        <div className="text-center space-y-4">
          <div className="p-4 bg-muted/30 rounded-xl border border-border/20">
            <p className="text-sm text-muted-foreground mb-2">Ready to test your typing speed?</p>
            <p className="text-xs text-muted-foreground">Type the code snippet as fast and accurately as possible!</p>
          </div>
          <Button onClick={startGame} className="btn-primary">
            <Play className="w-4 h-4 mr-2" />Start Typing Test
          </Button>
        </div>
      ) : (
        <>
          <div className="p-4 bg-muted/30 rounded-xl border border-border/20 font-mono text-sm leading-relaxed select-none">
            {snippet.split('').map((char, i) => (
              <span key={i} className={`${getCharacterClass(char, i)} transition-colors duration-75`}>
                {char}
              </span>
            ))}
          </div>
          
          {wpm ? (
            <div className="text-center space-y-4">
              <div className="p-4 bg-primary/10 rounded-xl border border-primary/20">
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <p className="text-2xl font-black text-primary">{wpm}</p>
                    <p className="text-xs text-muted-foreground">Words Per Minute</p>
                  </div>
                  <div>
                    <p className="text-2xl font-black text-green-500">{accuracy}%</p>
                    <p className="text-xs text-muted-foreground">Accuracy</p>
                  </div>
                </div>
              </div>
              <Button onClick={resetGame} className="btn-secondary">
                <RefreshCw className="w-4 h-4 mr-2" />Try Again
              </Button>
            </div>
          ) : (
            <div className="space-y-2">
              <textarea 
                ref={ref} 
                value={typed} 
                onChange={onChange}
                disabled={isPaused}
                className="w-full h-20 p-3 font-mono text-sm bg-background/50 border border-border/30 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-primary/30 disabled:opacity-50"
                placeholder={isPaused ? "Game paused..." : "Start typing the code above..."} 
                spellCheck={false} 
              />
              <div className="flex justify-between items-center">
                <Button onClick={resetGame} size="sm" variant="outline" className="text-xs">
                  <RefreshCw className="w-3 h-3 mr-1" />New Snippet
                </Button>
                <span className="text-xs text-muted-foreground">
                  {typed.length}/{snippet.length} characters
                </span>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

/* ── Debug the Bug ─────────────────────────────────────────────── */
const DebugGame = ({ isPaused, onGameEnd }) => {
  const [currentBug, setCurrentBug] = useState(null);
  const [guess, setGuess] = useState('');
  const [checked, setChecked] = useState(false);
  const [score, setScore] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  
  const BUGS = [
    { 
      code: `function sum(a, b) {\n  return a - b;\n}`, 
      bug: 'Should use + not -', 
      fix: 'return a + b;',
      difficulty: 'easy'
    },
    { 
      code: `const arr = [1,2,3];\nfor (let i = 0; i <= arr.length; i++) {\n  console.log(arr[i]);\n}`, 
      bug: 'Off-by-one: <= should be <', 
      fix: 'i < arr.length',
      difficulty: 'easy'
    },
    { 
      code: `async function getData() {\n  const res = fetch("/api/data");\n  return res.json();\n}`, 
      bug: 'Missing await before fetch', 
      fix: 'const res = await fetch(...)',
      difficulty: 'medium'
    },
    { 
      code: `const obj = null;\nconsole.log(obj.name);`, 
      bug: 'Null reference — obj is null', 
      fix: 'Check obj != null first',
      difficulty: 'easy'
    },
    { 
      code: `let x = "5";\nif (x == 5) console.log("equal");`, 
      bug: 'Loose equality — use === for type safety', 
      fix: 'if (x === "5")',
      difficulty: 'medium'
    }
  ];

  const startGame = () => {
    setGameStarted(true);
    setScore(0);
    nextBug();
  };

  const nextBug = () => {
    const randomBug = BUGS[Math.floor(Math.random() * BUGS.length)];
    setCurrentBug(randomBug);
    setGuess('');
    setChecked(false);
  };

  const checkAnswer = () => {
    setChecked(true);
    const isCorrect = guess.toLowerCase().includes(currentBug.bug.toLowerCase().split(' ')[0]) ||
                     currentBug.bug.toLowerCase().includes(guess.toLowerCase());
    
    if (isCorrect) {
      const points = currentBug.difficulty === 'hard' ? 30 : currentBug.difficulty === 'medium' ? 20 : 10;
      setScore(prev => prev + points);
    }
    
    onGameEnd?.(score + (isCorrect ? (currentBug.difficulty === 'hard' ? 30 : currentBug.difficulty === 'medium' ? 20 : 10) : 0));
  };

  const getDifficultyColor = (difficulty) => {
    switch(difficulty) {
      case 'easy': return 'text-green-500 bg-green-500/10';
      case 'medium': return 'text-yellow-500 bg-yellow-500/10';
      case 'hard': return 'text-red-500 bg-red-500/10';
      default: return 'text-muted-foreground bg-muted/10';
    }
  };

  if (!gameStarted) {
    return (
      <div className="space-y-4 text-center">
        <div className="flex items-center justify-center gap-2 mb-4">
          <Brain className="w-5 h-5 text-amber-500" />
          <p className="text-sm font-bold text-primary">Debug the Bug Challenge</p>
        </div>
        <div className="p-4 bg-muted/30 rounded-xl border border-border/20">
          <p className="text-sm text-muted-foreground mb-2">Find bugs in code snippets!</p>
          <p className="text-xs text-muted-foreground">Identify what's wrong and earn points based on difficulty.</p>
        </div>
        <Button onClick={startGame} className="btn-primary">
          <Play className="w-4 h-4 mr-2" />Start Debug Challenge
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm font-bold text-primary flex items-center gap-2">
          <Brain className="w-4 h-4 text-amber-500" /> Debug Challenge
        </p>
        <div className="flex items-center gap-2">
          <span className={`px-2 py-1 rounded text-xs font-bold ${getDifficultyColor(currentBug?.difficulty)}`}>
            {currentBug?.difficulty?.toUpperCase()}
          </span>
          <span className="text-sm font-bold">Score: {score}</span>
        </div>
      </div>
      
      {currentBug && (
        <>
          <pre className="p-4 bg-muted/30 rounded-xl border border-border/20 font-mono text-sm text-foreground/90 overflow-x-auto whitespace-pre">
            {currentBug.code}
          </pre>
          
          <div className="space-y-3">
            <p className="text-sm font-medium">What's the bug? Describe the issue:</p>
            <textarea 
              value={guess} 
              onChange={e => setGuess(e.target.value)} 
              disabled={checked || isPaused}
              className="w-full h-20 p-3 text-sm bg-background/50 border border-border/30 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-primary/30 disabled:opacity-50"
              placeholder={isPaused ? "Game paused..." : "Describe the bug you found..."} 
            />
            
            {!checked ? (
              <div className="flex gap-2">
                <Button 
                  onClick={checkAnswer} 
                  disabled={!guess.trim() || isPaused} 
                  className="btn-primary flex-1"
                >
                  Check Answer
                </Button>
                <Button onClick={nextBug} variant="outline" size="sm">
                  Skip
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="p-4 bg-green-500/10 rounded-xl border border-green-500/20">
                  <div className="space-y-2 text-sm">
                    <p><strong className="text-green-400">Bug:</strong> <span className="text-green-300">{currentBug.bug}</span></p>
                    <p><strong className="text-green-400">Fix:</strong> <span className="text-green-300">{currentBug.fix}</span></p>
                  </div>
                </div>
                <Button onClick={nextBug} className="btn-secondary w-full">
                  <RefreshCw className="w-4 h-4 mr-2" />Next Bug
                </Button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

/* ── Tic Tac Toe Game ───────────────────────────────────────────── */
const TicTacToeGame = ({ isPaused, onGameEnd }) => {
  const [board, setBoard] = useState(Array(9).fill(''));
  const [isXNext, setIsXNext] = useState(true);
  const [gameOver, setGameOver] = useState(false);
  const [winner, setWinner] = useState(null); // 'X', 'O', 'Draw'
  const [highScore, setHighScore] = useState(() => {
    try {
      const stored = localStorage.getItem('devinspect-tictactoe-score');
      return stored ? JSON.parse(stored) : { wins: 0, losses: 0, draws: 0 };
    } catch {
      return { wins: 0, losses: 0, draws: 0 };
    }
  });

  const checkWinner = useCallback((squares) => {
    const lines = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8],
      [0, 3, 6], [1, 4, 7], [2, 5, 8],
      [0, 4, 8], [2, 4, 6]
    ];
    for (let i = 0; i < lines.length; i++) {
      const [a, b, c] = lines[i];
      if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
        return squares[a];
      }
    }
    if (squares.every(s => s !== '')) return 'Draw';
    return null;
  }, []);

  // AI minimax move
  const makeAIMove = useCallback((currentBoard) => {
    if (gameOver || isPaused) return;

    const evaluateBoard = (b) => {
      const w = checkWinner(b);
      if (w === 'O') return 10;
      if (w === 'X') return -10;
      return 0;
    };

    const minimax = (b, depth, isMax) => {
      const score = evaluateBoard(b);
      if (score === 10) return score - depth;
      if (score === -10) return score + depth;
      if (b.every(s => s !== '')) return 0;

      if (isMax) {
        let best = -1000;
        for (let i = 0; i < 9; i++) {
          if (b[i] === '') {
            b[i] = 'O';
            best = Math.max(best, minimax(b, depth + 1, false));
            b[i] = '';
          }
        }
        return best;
      } else {
        let best = 1000;
        for (let i = 0; i < 9; i++) {
          if (b[i] === '') {
            b[i] = 'X';
            best = Math.min(best, minimax(b, depth + 1, true));
            b[i] = '';
          }
        }
        return best;
      }
    };

    let bestVal = -1000;
    let bestMove = -1;
    for (let i = 0; i < 9; i++) {
      if (currentBoard[i] === '') {
        currentBoard[i] = 'O';
        let moveVal = minimax(currentBoard, 0, false);
        currentBoard[i] = '';
        if (moveVal > bestVal) {
          bestVal = moveVal;
          bestMove = i;
        }
      }
    }

    if (bestMove !== -1) {
      const newBoard = [...currentBoard];
      newBoard[bestMove] = 'O';
      setBoard(newBoard);
      
      const gameWinner = checkWinner(newBoard);
      if (gameWinner) {
        setGameOver(true);
        setWinner(gameWinner);
        updateScore(gameWinner);
      } else {
        setIsXNext(true);
      }
    }
  }, [gameOver, isPaused, checkWinner]);

  const updateScore = (gameWinner) => {
    setHighScore(prev => {
      const next = { ...prev };
      if (gameWinner === 'X') {
        next.wins += 1;
        onGameEnd?.(100);
      } else if (gameWinner === 'O') {
        next.losses += 1;
      } else {
        next.draws += 1;
        onGameEnd?.(30);
      }
      localStorage.setItem('devinspect-tictactoe-score', JSON.stringify(next));
      return next;
    });
  };

  const handleCellClick = (index) => {
    if (board[index] !== '' || gameOver || !isXNext || isPaused) return;

    const newBoard = [...board];
    newBoard[index] = 'X';
    setBoard(newBoard);

    const gameWinner = checkWinner(newBoard);
    if (gameWinner) {
      setGameOver(true);
      setWinner(gameWinner);
      updateScore(gameWinner);
    } else {
      setIsXNext(false);
      setTimeout(() => makeAIMove(newBoard), 500);
    }
  };

  const restartGame = () => {
    setBoard(Array(9).fill(''));
    setIsXNext(true);
    setGameOver(false);
    setWinner(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm font-bold text-primary flex items-center gap-2">
          ⭕ Tic Tac Toe (vs AI)
        </p>
        <div className="text-xs font-semibold text-muted-foreground flex gap-3">
          <span>Wins: <strong className="text-green-500">{highScore.wins}</strong></span>
          <span>Losses: <strong className="text-red-500">{highScore.losses}</strong></span>
          <span>Draws: <strong className="text-amber-500">{highScore.draws}</strong></span>
        </div>
      </div>

      <div className="flex flex-col items-center space-y-4">
        <div className="grid grid-cols-3 gap-2.5 w-[240px] h-[240px] mx-auto">
          {board.map((cell, idx) => (
            <button
              key={idx}
              disabled={cell !== '' || gameOver || !isXNext || isPaused}
              onClick={() => handleCellClick(idx)}
              className="w-full h-full rounded-2xl border border-border/30 bg-background/50 hover:bg-muted/40 transition-all flex items-center justify-center font-black text-2xl"
              style={{ color: cell === 'X' ? 'hsl(var(--primary))' : 'hsl(var(--secondary))' }}
            >
              {cell}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          {gameOver ? (
            <div className="text-center space-y-2">
              <p className="text-sm font-bold">
                {winner === 'X' ? '🎉 You Won! (+10 XP)' : winner === 'O' ? '🤖 AI Won!' : '🤝 It\'s a Draw! (+3 XP)'}
              </p>
              <Button onClick={restartGame} size="sm" className="btn-primary h-8 text-xs">
                Play Again
              </Button>
            </div>
          ) : (
            <Button onClick={restartGame} size="sm" variant="outline" className="h-8 text-xs">
              Restart
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

/* ── Memory Match Game ─────────────────────────────────────────── */
const MemoryMatchGame = ({ isPaused, onGameEnd }) => {
  const EMOJIS = ['💻', '🚀', '🧠', '👾', '🔒', '🔑', '🌐', '💾'];
  const [cards, setCards] = useState([]);
  const [flippedIndices, setFlippedIndices] = useState([]);
  const [moves, setMoves] = useState(0);
  const [matches, setMatches] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [bestScore, setBestScore] = useState(() => {
    const val = localStorage.getItem('devinspect-memory-best');
    return val ? parseInt(val, 10) : null;
  });

  const initializeCards = useCallback(() => {
    const doubleList = [...EMOJIS, ...EMOJIS].map((emoji, index) => ({
      id: index,
      emoji,
      isFlipped: false,
      isMatched: false
    }));
    for (let i = doubleList.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [doubleList[i], doubleList[j]] = [doubleList[j], doubleList[i]];
    }
    setCards(doubleList);
    setFlippedIndices([]);
    setMoves(0);
    setMatches(0);
    setGameOver(false);
  }, []);

  useEffect(() => {
    initializeCards();
  }, [initializeCards]);

  const handleCardClick = (idx) => {
    if (cards[idx].isFlipped || cards[idx].isMatched || flippedIndices.length >= 2 || isPaused) return;

    const newCards = [...cards];
    newCards[idx].isFlipped = true;
    setCards(newCards);

    const newFlipped = [...flippedIndices, idx];
    setFlippedIndices(newFlipped);

    if (newFlipped.length === 2) {
      setMoves(m => m + 1);
      const [first, second] = newFlipped;
      if (cards[first].emoji === cards[second].emoji) {
        setTimeout(() => {
          setCards(prev => {
            const updated = [...prev];
            updated[first].isMatched = true;
            updated[second].isMatched = true;
            return updated;
          });
          setMatches(m => {
            const nextMatches = m + 1;
            if (nextMatches === EMOJIS.length) {
              setGameOver(true);
              setMoves(currentMoves => {
                const points = Math.max(10, 100 - currentMoves * 3);
                onGameEnd?.(points);
                setBestScore(prev => {
                  if (!prev || currentMoves < prev) {
                    localStorage.setItem('devinspect-memory-best', String(currentMoves));
                    return currentMoves;
                  }
                  return prev;
                });
                return currentMoves;
              });
            }
            return nextMatches;
          });
          setFlippedIndices([]);
        }, 600);
      } else {
        setTimeout(() => {
          setCards(prev => {
            const updated = [...prev];
            updated[first].isFlipped = false;
            updated[second].isFlipped = false;
            return updated;
          });
          setFlippedIndices([]);
        }, 1000);
      }
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm font-bold text-primary flex items-center gap-2">
          🃏 Memory Match
        </p>
        <div className="text-xs font-semibold text-muted-foreground flex gap-4">
          <span>Moves: <strong className="text-foreground">{moves}</strong></span>
          <span>Best: <strong className="text-green-500">{bestScore !== null ? bestScore : '-'}</strong></span>
        </div>
      </div>

      <div className="flex flex-col items-center space-y-4">
        <div className="grid grid-cols-4 gap-2.5 w-[260px] mx-auto">
          {cards.map((card, idx) => (
            <button
              key={card.id}
              onClick={() => handleCardClick(idx)}
              className={`w-14 h-14 rounded-xl border border-border/30 transition-all duration-300 flex items-center justify-center text-xl ${
                card.isFlipped || card.isMatched
                  ? 'bg-primary/20 text-foreground scale-100 rotate-0'
                  : 'bg-muted hover:bg-muted/80 text-transparent scale-95'
              }`}
            >
              {(card.isFlipped || card.isMatched) ? card.emoji : '❓'}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          {gameOver ? (
            <div className="text-center space-y-2">
              <p className="text-sm font-bold">🎉 Complete! Moves: {moves}</p>
              <Button onClick={initializeCards} size="sm" className="btn-primary h-8 text-xs">
                Play Again
              </Button>
            </div>
          ) : (
            <Button onClick={initializeCards} size="sm" variant="outline" className="h-8 text-xs">
              Restart
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

/* ── Waiting Modal ─────────────────────────────────────────────── */
const GAMES = [
  { id: 'snake', label: '🐍 Snake', component: SnakeGame },
  { id: 'tictactoe', label: '⭕ Tic Tac Toe', component: TicTacToeGame },
  { id: 'memory', label: '🃏 Memory Match', component: MemoryMatchGame },
  { id: 'typing', label: '⌨️ Typing Speed', component: TypingGame },
  { id: 'debug', label: '🐛 Debug Challenge', component: DebugGame }
];

/**
 * WaitingGameModal — auto-shows when loading=true, auto-closes when loading=false
 * Also supports manual control via onClose prop
 * Props: loading (bool), onXpEarned (fn), onClose (fn)
 */
const WaitingGameModal = ({ loading, initialGame, onXpEarned, onClose }) => {
  const [open, setOpen] = useState(false);
  const [game, setGame] = useState('snake');

  useEffect(() => {
    if (initialGame) {
      setGame(initialGame);
    }
  }, [initialGame]);
  const [isPaused, setIsPaused] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const openedRef = useRef(false);
  const modalRef = useRef(null);

  // Auto-open after 2s of loading, auto-close when done, or manual control
  useEffect(() => {
    if (loading) {
      if (onClose) {
        // Manual mode - open immediately
        setOpen(true);
        openedRef.current = true;
      } else {
        // Auto mode - open after delay
        const t = setTimeout(() => { setOpen(true); openedRef.current = true; }, 2000);
        return () => clearTimeout(t);
      }
    } else {
      if (openedRef.current) {
        // Small delay so user sees the close animation
        const t = setTimeout(() => { setOpen(false); openedRef.current = false; }, 400);
        return () => clearTimeout(t);
      }
    }
  }, [loading, onClose]);

  // Handle escape key and fullscreen
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && open) {
        if (isFullscreen) {
          exitFullscreen();
        } else {
          handleClose();
        }
      }
      if (e.key === 'F11' && open) {
        e.preventDefault();
        toggleFullscreen();
      }
    };

    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [open, isFullscreen]);

  const handleClose = () => {
    if (isFullscreen) {
      exitFullscreen();
    }
    setOpen(false);
    openedRef.current = false;
    setIsPaused(false);
    onClose?.();
  };

  const toggleFullscreen = () => {
    if (!isFullscreen) {
      if (modalRef.current?.requestFullscreen) {
        modalRef.current.requestFullscreen();
        setIsFullscreen(true);
      }
    } else {
      exitFullscreen();
    }
  };

  const exitFullscreen = () => {
    if (document.exitFullscreen) {
      document.exitFullscreen();
    }
    setIsFullscreen(false);
  };

  // Listen for fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const handleGameEnd = (score) => {
    onXpEarned?.(Math.floor(score / 10)); // Convert score to XP
  };

  const GameComponent = GAMES.find(g => g.id === game)?.component || SnakeGame;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={(e) => e.target === e.currentTarget && handleClose()}
        >
          <motion.div
            ref={modalRef}
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            transition={{ duration: 0.2 }}
            className={`w-full ${isFullscreen ? 'h-screen max-w-none' : 'max-w-2xl max-h-[85vh]'} card-glass rounded-3xl border border-border/30 shadow-2xl overflow-hidden flex flex-col`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-border/20 bg-primary/5 flex-shrink-0">
              <div className="flex items-center gap-3">
                {!onClose ? (
                  <>
                    <motion.div 
                      animate={{ rotate: 360 }} 
                      transition={{ repeat: Infinity, duration: 2, ease: 'linear' }}
                      className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full" 
                    />
                    <span className="text-sm font-bold text-primary">Play while AI thinks...</span>
                  </>
                ) : (
                  <>
                    <Gamepad2 className="w-5 h-5 text-primary" />
                    <span className="text-sm font-bold text-primary">Mini Games</span>
                  </>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Button
                  onClick={() => setIsPaused(!isPaused)}
                  size="sm"
                  variant="ghost"
                  className="h-8 w-8 p-0"
                  title={isPaused ? 'Resume Game' : 'Pause Game'}
                >
                  {isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
                </Button>
                <Button
                  onClick={toggleFullscreen}
                  size="sm"
                  variant="ghost"
                  className="h-8 w-8 p-0"
                  title={isFullscreen ? 'Exit Fullscreen (Esc)' : 'Fullscreen (F11)'}
                >
                  {isFullscreen ? (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 9V4.5M9 9H4.5M9 9L3.5 3.5M15 9h4.5M15 9V4.5M15 9l5.5-5.5M9 15v4.5M9 15H4.5M9 15l-5.5 5.5M15 15h4.5M15 15v4.5m0-4.5l5.5 5.5" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                    </svg>
                  )}
                </Button>
                <button 
                  onClick={handleClose} 
                  className="text-muted-foreground hover:text-foreground transition-colors p-2 hover:bg-muted/50 rounded-lg"
                  title="Close (Esc)"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Game tabs */}
            <div className="flex gap-2 px-6 pt-4 flex-shrink-0 overflow-x-auto">
              {GAMES.map(g => (
                <button 
                  key={g.id} 
                  onClick={() => setGame(g.id)}
                  className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors whitespace-nowrap ${
                    game === g.id 
                      ? 'bg-primary text-primary-foreground shadow-sm' 
                      : 'bg-muted text-muted-foreground hover:bg-muted/80'
                  }`}
                >
                  {g.label}
                </button>
              ))}
            </div>

            {/* Game content */}
            <div className="flex-1 p-6 overflow-y-auto">
              <GameComponent 
                key={game} 
                isPaused={isPaused} 
                onGameEnd={handleGameEnd}
              />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default memo(WaitingGameModal);