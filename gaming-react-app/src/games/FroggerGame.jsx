import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import './FroggerGame.css';

const FroggerGame = () => {
  const BOARD_WIDTH = 15;
  const BOARD_HEIGHT = 13;
  const CELL_SIZE = 40;

  const [frog, setFrog] = useState({ x: 7, y: 12 });
  const [cars, setCars] = useState([]);
  const [logs, setLogs] = useState([]);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [gameRunning, setGameRunning] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [level, setLevel] = useState(1);
  const [highScore, setHighScore] = useState(
    parseInt(localStorage.getItem('frogger-highscore')) || 0
  );

  const initializeCars = () => {
    const carRows = [9, 10, 8, 7]; // Road rows
    const newCars = [];
    
    carRows.forEach((row, index) => {
      const direction = index % 2 === 0 ? 1 : -1; // Alternate directions
      const speed = 0.5 + (level * 0.2);
      const carCount = 2 + Math.floor(Math.random() * 2);
      
      for (let i = 0; i < carCount; i++) {
        newCars.push({
          x: direction > 0 ? -3 - (i * 5) : BOARD_WIDTH + 3 + (i * 5),
          y: row,
          direction,
          speed,
          width: 1 + Math.floor(Math.random() * 2), // 1-2 cells wide
          color: ['#ff4444', '#44ff44', '#4444ff', '#ffff44', '#ff44ff'][Math.floor(Math.random() * 5)]
        });
      }
    });
    
    setCars(newCars);
  };

  const initializeLogs = () => {
    const logRows = [2, 3, 4, 5]; // Water rows
    const newLogs = [];
    
    logRows.forEach((row, index) => {
      const direction = index % 2 === 0 ? -1 : 1; // Alternate directions
      const speed = 0.3 + (level * 0.1);
      const logCount = 2 + Math.floor(Math.random() * 2);
      
      for (let i = 0; i < logCount; i++) {
        newLogs.push({
          x: direction > 0 ? -4 - (i * 6) : BOARD_WIDTH + 4 + (i * 6),
          y: row,
          direction,
          speed,
          width: 2 + Math.floor(Math.random() * 2), // 2-3 cells wide
          color: '#8B4513'
        });
      }
    });
    
    setLogs(newLogs);
  };

  const moveFrog = useCallback((direction) => {
    if (!gameRunning || gameOver) return;

    let newX = frog.x;
    let newY = frog.y;

    switch (direction) {
      case 'UP':
        newY = Math.max(0, frog.y - 1);
        break;
      case 'DOWN':
        newY = Math.min(BOARD_HEIGHT - 1, frog.y + 1);
        break;
      case 'LEFT':
        newX = Math.max(0, frog.x - 1);
        break;
      case 'RIGHT':
        newX = Math.min(BOARD_WIDTH - 1, frog.x + 1);
        break;
    }

    setFrog({ x: newX, y: newY });

    // Score for moving forward
    if (direction === 'UP' && newY < frog.y) {
      setScore(prev => prev + 10);
    }

    // Check if reached the top (win condition)
    if (newY === 0) {
      setScore(prev => prev + 100 * level);
      setLevel(prev => prev + 1);
      setFrog({ x: 7, y: 12 }); // Reset frog position
      initializeCars();
      initializeLogs();
    }
  }, [frog, gameRunning, gameOver, level]);

  const handleKeyPress = useCallback((event) => {
    if (!gameRunning) return;

    switch (event.key) {
      case 'ArrowUp':
      case 'w':
        event.preventDefault();
        moveFrog('UP');
        break;
      case 'ArrowDown':
      case 's':
        event.preventDefault();
        moveFrog('DOWN');
        break;
      case 'ArrowLeft':
      case 'a':
        event.preventDefault();
        moveFrog('LEFT');
        break;
      case 'ArrowRight':
      case 'd':
        event.preventDefault();
        moveFrog('RIGHT');
        break;
    }
  }, [moveFrog, gameRunning]);

  const updateGameObjects = useCallback(() => {
    if (!gameRunning || gameOver) return;

    // Update cars
    setCars(prevCars => 
      prevCars.map(car => {
        let newX = car.x + (car.direction * car.speed);
        
        // Wrap around screen
        if (car.direction > 0 && newX > BOARD_WIDTH + 5) {
          newX = -5;
        } else if (car.direction < 0 && newX < -5) {
          newX = BOARD_WIDTH + 5;
        }
        
        return { ...car, x: newX };
      })
    );

    // Update logs
    setLogs(prevLogs => 
      prevLogs.map(log => {
        let newX = log.x + (log.direction * log.speed);
        
        // Wrap around screen
        if (log.direction > 0 && newX > BOARD_WIDTH + 5) {
          newX = -5;
        } else if (log.direction < 0 && newX < -5) {
          newX = BOARD_WIDTH + 5;
        }
        
        return { ...log, x: newX };
      })
    );
  }, [gameRunning, gameOver]);

  const checkCollisions = useCallback(() => {
    if (!gameRunning || gameOver) return;

    const frogRow = frog.y;
    
    // Check if frog is on road (rows 7-10)
    if (frogRow >= 7 && frogRow <= 10) {
      const hitByCar = cars.some(car => {
        if (car.y === frogRow) {
          const carLeft = car.x;
          const carRight = car.x + car.width;
          return frog.x >= carLeft && frog.x < carRight;
        }
        return false;
      });

      if (hitByCar) {
        // Frog hit by car
        setLives(prev => {
          const newLives = prev - 1;
          if (newLives <= 0) {
            setGameOver(true);
            setGameRunning(false);
            if (score > highScore) {
              setHighScore(score);
              localStorage.setItem('frogger-highscore', score.toString());
            }
          } else {
            setFrog({ x: 7, y: 12 }); // Reset frog position
          }
          return newLives;
        });
      }
    }
    
    // Check if frog is on water (rows 2-5)
    if (frogRow >= 2 && frogRow <= 5) {
      const onLog = logs.some(log => {
        if (log.y === frogRow) {
          const logLeft = log.x;
          const logRight = log.x + log.width;
          return frog.x >= logLeft && frog.x < logRight;
        }
        return false;
      });

      if (!onLog) {
        // Frog drowned
        setLives(prev => {
          const newLives = prev - 1;
          if (newLives <= 0) {
            setGameOver(true);
            setGameRunning(false);
            if (score > highScore) {
              setHighScore(score);
              localStorage.setItem('frogger-highscore', score.toString());
            }
          } else {
            setFrog({ x: 7, y: 12 }); // Reset frog position
          }
          return newLives;
        });
      } else {
        // Move frog with log
        const currentLog = logs.find(log => {
          if (log.y === frogRow) {
            const logLeft = log.x;
            const logRight = log.x + log.width;
            return frog.x >= logLeft && frog.x < logRight;
          }
          return false;
        });

        if (currentLog) {
          setFrog(prev => ({
            ...prev,
            x: Math.max(0, Math.min(BOARD_WIDTH - 1, prev.x + (currentLog.direction * currentLog.speed)))
          }));
        }
      }
    }
  }, [frog, cars, logs, gameRunning, gameOver, score, highScore]);

  const startGame = () => {
    setFrog({ x: 7, y: 12 });
    setScore(0);
    setLives(3);
    setLevel(1);
    setGameRunning(true);
    setGameOver(false);
    initializeCars();
    initializeLogs();
  };

  const pauseGame = () => {
    setGameRunning(!gameRunning);
  };

  // Game loop
  useEffect(() => {
    if (!gameRunning || gameOver) return;

    const gameInterval = setInterval(() => {
      updateGameObjects();
      checkCollisions();
    }, 50);

    return () => clearInterval(gameInterval);
  }, [gameRunning, gameOver, updateGameObjects, checkCollisions]);

  // Initialize game objects on start
  useEffect(() => {
    if (gameRunning && !gameOver) {
      initializeCars();
      initializeLogs();
    }
  }, [gameRunning, gameOver]);

  // Keyboard controls
  useEffect(() => {
    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [handleKeyPress]);

  const getRowType = (row) => {
    if (row === 0) return 'goal';
    if (row === 1) return 'safe';
    if (row >= 2 && row <= 5) return 'water';
    if (row === 6) return 'safe';
    if (row >= 7 && row <= 10) return 'road';
    if (row >= 11) return 'safe';
    return 'safe';
  };

  const renderCell = (x, y) => {
    const rowType = getRowType(y);
    let className = `frogger-cell ${rowType}`;
    let content = null;

    // Add frog
    if (frog.x === x && frog.y === y) {
      content = <div className="frog">🐸</div>;
    }

    // Add cars
    cars.forEach(car => {
      if (car.y === y && x >= Math.floor(car.x) && x < Math.floor(car.x) + car.width) {
        content = <div className="car" style={{ backgroundColor: car.color }}>🚗</div>;
      }
    });

    // Add logs
    logs.forEach(log => {
      if (log.y === y && x >= Math.floor(log.x) && x < Math.floor(log.x) + log.width) {
        content = <div className="log">🪵</div>;
      }
    });

    return <div key={`${x}-${y}`} className={className}>{content}</div>;
  };

  return (
    <motion.div 
      className="frogger-game"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="frogger-container">
        <div className="frogger-sidebar">
          <div className="frogger-info">
            <h2>FROGGER</h2>
            <div className="score">Score: {score}</div>
            <div className="high-score">High Score: {highScore}</div>
            <div className="lives">Lives: {lives}</div>
            <div className="level">Level: {level}</div>
          </div>
          
          <div className="frogger-controls">
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
              {score === highScore && <p>🎉 New High Score!</p>}
              <button onClick={startGame} className="game-button restart">
                Play Again
              </button>
            </div>
          )}
          
          <div className="frogger-instructions">
            <h4>How to Play:</h4>
            <p>🐸 Cross the road and river</p>
            <p>🚗 Avoid the cars</p>
            <p>🪵 Jump on logs in water</p>
            <p>🏁 Reach the top to win!</p>
            <br />
            <h4>Controls:</h4>
            <p>WASD or Arrow Keys</p>
          </div>
        </div>
        
        <div className="frogger-board">
          {Array.from({ length: BOARD_HEIGHT }, (_, y) => (
            <div key={y} className="frogger-row">
              {Array.from({ length: BOARD_WIDTH }, (_, x) => renderCell(x, y))}
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default FroggerGame;