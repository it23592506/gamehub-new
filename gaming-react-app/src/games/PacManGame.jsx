import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import './PacManGame.css';

const PacManGame = () => {
  const BOARD_WIDTH = 19;
  const BOARD_HEIGHT = 21;
  const CELL_SIZE = 20;

  // Game board layout (1 = wall, 0 = empty, 2 = pellet, 3 = power pellet)
  const INITIAL_BOARD = [
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    [1,2,2,2,2,2,2,2,2,1,2,2,2,2,2,2,2,2,1],
    [1,3,1,1,1,2,1,1,1,1,1,1,1,2,1,1,1,3,1],
    [1,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,1],
    [1,2,1,1,1,2,1,2,1,1,1,2,1,2,1,1,1,2,1],
    [1,2,2,2,2,2,1,2,2,1,2,2,1,2,2,2,2,2,1],
    [1,1,1,1,1,2,1,1,0,1,0,1,1,2,1,1,1,1,1],
    [0,0,0,0,1,2,1,0,0,0,0,0,1,2,1,0,0,0,0],
    [1,1,1,1,1,2,1,0,1,0,1,0,1,2,1,1,1,1,1],
    [0,0,0,0,0,2,0,0,1,0,1,0,0,2,0,0,0,0,0],
    [1,1,1,1,1,2,1,0,1,1,1,0,1,2,1,1,1,1,1],
    [0,0,0,0,1,2,1,0,0,0,0,0,1,2,1,0,0,0,0],
    [1,1,1,1,1,2,1,1,0,1,0,1,1,2,1,1,1,1,1],
    [1,2,2,2,2,2,2,2,2,1,2,2,2,2,2,2,2,2,1],
    [1,2,1,1,1,2,1,1,1,1,1,1,1,2,1,1,1,2,1],
    [1,3,2,2,1,2,2,2,2,2,2,2,2,2,1,2,2,3,1],
    [1,1,1,2,1,2,1,2,1,1,1,2,1,2,1,2,1,1,1],
    [1,2,2,2,2,2,1,2,2,1,2,2,1,2,2,2,2,2,1],
    [1,2,1,1,1,1,1,1,2,1,2,1,1,1,1,1,1,2,1],
    [1,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,1],
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
  ];

  const [board, setBoard] = useState(INITIAL_BOARD);
  const [pacman, setPacman] = useState({ x: 9, y: 15, direction: 'RIGHT' });
  const [ghosts, setGhosts] = useState([
    { x: 9, y: 9, direction: 'UP', color: 'red', scared: false },
    { x: 8, y: 9, direction: 'DOWN', color: 'pink', scared: false },
    { x: 10, y: 9, direction: 'LEFT', color: 'cyan', scared: false },
    { x: 9, y: 10, direction: 'RIGHT', color: 'orange', scared: false }
  ]);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [gameRunning, setGameRunning] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [powerMode, setPowerMode] = useState(false);
  const [powerModeTimer, setPowerModeTimer] = useState(0);

  const directions = {
    UP: { x: 0, y: -1 },
    DOWN: { x: 0, y: 1 },
    LEFT: { x: -1, y: 0 },
    RIGHT: { x: 1, y: 0 }
  };

  const isValidMove = (x, y) => {
    if (x < 0 || x >= BOARD_WIDTH || y < 0 || y >= BOARD_HEIGHT) {
      return false;
    }
    return board[y][x] !== 1;
  };

  const movePacman = useCallback((direction) => {
    if (!gameRunning || gameOver) return;

    const dx = directions[direction].x;
    const dy = directions[direction].y;
    const newX = pacman.x + dx;
    const newY = pacman.y + dy;

    if (isValidMove(newX, newY)) {
      const newBoard = board.map(row => [...row]);
      let newScore = score;

      // Eat pellet or power pellet
      if (board[newY][newX] === 2) {
        newBoard[newY][newX] = 0;
        newScore += 10;
      } else if (board[newY][newX] === 3) {
        newBoard[newY][newX] = 0;
        newScore += 50;
        setPowerMode(true);
        setPowerModeTimer(10000); // 10 seconds
        setGhosts(prev => prev.map(ghost => ({ ...ghost, scared: true })));
      }

      setBoard(newBoard);
      setScore(newScore);
      setPacman({ x: newX, y: newY, direction });

      // Check win condition
      const pelletsLeft = newBoard.flat().filter(cell => cell === 2 || cell === 3).length;
      if (pelletsLeft === 0) {
        setGameRunning(false);
        alert('You Win!');
      }
    }
  }, [pacman, directions, board, gameRunning, gameOver, score]);

  const moveGhosts = useCallback(() => {
    if (!gameRunning || gameOver) return;

    setGhosts(prevGhosts => 
      prevGhosts.map(ghost => {
        const possibleMoves = Object.keys(directions).filter(dir => {
          const dx = directions[dir].x;
          const dy = directions[dir].y;
          const newX = ghost.x + dx;
          const newY = ghost.y + dy;
          return isValidMove(newX, newY);
        });

        if (possibleMoves.length === 0) return ghost;

        // Simple AI: move towards pacman if not scared, away if scared
        let chosenDirection;
        if (ghost.scared) {
          // Move away from pacman
          const awayMoves = possibleMoves.filter(dir => {
            const dx = directions[dir].x;
            const dy = directions[dir].y;
            const newX = ghost.x + dx;
            const newY = ghost.y + dy;
            const distanceFromPacman = Math.abs(newX - pacman.x) + Math.abs(newY - pacman.y);
            const currentDistance = Math.abs(ghost.x - pacman.x) + Math.abs(ghost.y - pacman.y);
            return distanceFromPacman > currentDistance;
          });
          chosenDirection = awayMoves.length > 0 ? 
            awayMoves[Math.floor(Math.random() * awayMoves.length)] :
            possibleMoves[Math.floor(Math.random() * possibleMoves.length)];
        } else {
          // Move towards pacman
          const towardMoves = possibleMoves.filter(dir => {
            const dx = directions[dir].x;
            const dy = directions[dir].y;
            const newX = ghost.x + dx;
            const newY = ghost.y + dy;
            const distanceFromPacman = Math.abs(newX - pacman.x) + Math.abs(newY - pacman.y);
            const currentDistance = Math.abs(ghost.x - pacman.x) + Math.abs(ghost.y - pacman.y);
            return distanceFromPacman < currentDistance;
          });
          chosenDirection = towardMoves.length > 0 ? 
            towardMoves[Math.floor(Math.random() * towardMoves.length)] :
            possibleMoves[Math.floor(Math.random() * possibleMoves.length)];
        }

        const dx = directions[chosenDirection].x;
        const dy = directions[chosenDirection].y;

        return {
          ...ghost,
          x: ghost.x + dx,
          y: ghost.y + dy,
          direction: chosenDirection
        };
      })
    );
  }, [gameRunning, gameOver, pacman, directions]);

  const checkCollisions = useCallback(() => {
    ghosts.forEach(ghost => {
      if (ghost.x === pacman.x && ghost.y === pacman.y) {
        if (ghost.scared) {
          // Eat ghost
          setScore(prev => prev + 200);
          setGhosts(prev => prev.map(g => 
            g === ghost ? { ...g, x: 9, y: 9, scared: false } : g
          ));
        } else {
          // Pacman dies
          setLives(prev => {
            const newLives = prev - 1;
            if (newLives <= 0) {
              setGameOver(true);
              setGameRunning(false);
            } else {
              // Reset positions
              setPacman({ x: 9, y: 15, direction: 'RIGHT' });
              setGhosts([
                { x: 9, y: 9, direction: 'UP', color: 'red', scared: false },
                { x: 8, y: 9, direction: 'DOWN', color: 'pink', scared: false },
                { x: 10, y: 9, direction: 'LEFT', color: 'cyan', scared: false },
                { x: 9, y: 10, direction: 'RIGHT', color: 'orange', scared: false }
              ]);
            }
            return newLives;
          });
        }
      }
    });
  }, [ghosts, pacman]);

  const handleKeyPress = useCallback((event) => {
    if (!gameRunning) return;

    switch (event.key) {
      case 'ArrowUp':
      case 'w':
        event.preventDefault();
        movePacman('UP');
        break;
      case 'ArrowDown':
      case 's':
        event.preventDefault();
        movePacman('DOWN');
        break;
      case 'ArrowLeft':
      case 'a':
        event.preventDefault();
        movePacman('LEFT');
        break;
      case 'ArrowRight':
      case 'd':
        event.preventDefault();
        movePacman('RIGHT');
        break;
    }
  }, [movePacman, gameRunning]);

  const startGame = () => {
    setBoard(INITIAL_BOARD);
    setPacman({ x: 9, y: 15, direction: 'RIGHT' });
    setGhosts([
      { x: 9, y: 9, direction: 'UP', color: 'red', scared: false },
      { x: 8, y: 9, direction: 'DOWN', color: 'pink', scared: false },
      { x: 10, y: 9, direction: 'LEFT', color: 'cyan', scared: false },
      { x: 9, y: 10, direction: 'RIGHT', color: 'orange', scared: false }
    ]);
    setScore(0);
    setLives(3);
    setGameRunning(true);
    setGameOver(false);
    setPowerMode(false);
    setPowerModeTimer(0);
  };

  const pauseGame = () => {
    setGameRunning(!gameRunning);
  };

  // Game loop
  useEffect(() => {
    if (!gameRunning || gameOver) return;

    const gameInterval = setInterval(() => {
      moveGhosts();
      checkCollisions();
    }, 200);

    return () => clearInterval(gameInterval);
  }, [gameRunning, gameOver, moveGhosts, checkCollisions]);

  // Power mode timer
  useEffect(() => {
    if (powerModeTimer > 0) {
      const timer = setTimeout(() => {
        setPowerModeTimer(prev => prev - 100);
      }, 100);
      return () => clearTimeout(timer);
    } else if (powerMode) {
      setPowerMode(false);
      setGhosts(prev => prev.map(ghost => ({ ...ghost, scared: false })));
    }
  }, [powerModeTimer, powerMode]);

  // Keyboard controls
  useEffect(() => {
    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [handleKeyPress]);

  const renderCell = (x, y) => {
    const cell = board[y][x];
    let content = null;

    if (cell === 1) {
      content = <div className="wall" />;
    } else if (cell === 2) {
      content = <div className="pellet" />;
    } else if (cell === 3) {
      content = <div className="power-pellet" />;
    }

    // Add pacman
    if (pacman.x === x && pacman.y === y) {
      content = <div className={`pacman ${pacman.direction.toLowerCase()}`} />;
    }

    // Add ghosts
    ghosts.forEach(ghost => {
      if (ghost.x === x && ghost.y === y) {
        content = (
          <div 
            className={`ghost ${ghost.scared ? 'scared' : ''}`}
            style={{ backgroundColor: ghost.scared ? 'blue' : ghost.color }}
          />
        );
      }
    });

    return content;
  };

  return (
    <motion.div 
      className="pacman-game"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="pacman-container">
        <div className="pacman-sidebar">
          <div className="pacman-info">
            <h2>PAC-MAN</h2>
            <div className="score">Score: {score}</div>
            <div className="lives">Lives: {lives}</div>
            {powerMode && (
              <div className="power-mode">
                Power Mode: {Math.ceil(powerModeTimer / 1000)}s
              </div>
            )}
          </div>
          
          <div className="pacman-controls">
            {!gameRunning && !gameOver && (
              <button onClick={startGame} className="game-button start">
                Start Game
              </button>
            )}
            
            {gameRunning && (
              <button onClick={pauseGame} className="game-button pause">
                Pause
              </button>
            )}
            
            <button onClick={startGame} className="game-button reset">
              Reset
            </button>
          </div>
          
          {gameOver && (
            <div className="game-over">
              <h3>Game Over!</h3>
              <p>Final Score: {score}</p>
              <button onClick={startGame} className="game-button restart">
                Play Again
              </button>
            </div>
          )}
          
          <div className="pacman-instructions">
            <h4>Controls:</h4>
            <p>WASD or Arrow Keys</p>
            <p>🟡 = Pellet (10 pts)</p>
            <p>⭐ = Power Pellet (50 pts)</p>
            <p>👻 = Ghost (200 pts when scared)</p>
          </div>
        </div>
        
        <div className="pacman-board">
          {board.map((row, y) => (
            <div key={y} className="pacman-row">
              {row.map((cell, x) => (
                <div key={`${x}-${y}`} className="pacman-cell">
                  {renderCell(x, y)}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default PacManGame;