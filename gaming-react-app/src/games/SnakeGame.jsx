import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import './SnakeGame.css';

const SnakeGame = () => {
  const BOARD_SIZE = 20;
  const INITIAL_SNAKE = [{ x: 10, y: 10 }];
  const INITIAL_FOOD = { x: 15, y: 15 };
  const INITIAL_DIRECTION = { x: 0, y: -1 };

  const [snake, setSnake] = useState(INITIAL_SNAKE);
  const [food, setFood] = useState(INITIAL_FOOD);
  const [direction, setDirection] = useState(INITIAL_DIRECTION);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [highScore, setHighScore] = useState(() => {
    return parseInt(localStorage.getItem('snakeHighScore') || '0');
  });

  const generateFood = useCallback(() => {
    let newFood;
    do {
      newFood = {
        x: Math.floor(Math.random() * BOARD_SIZE),
        y: Math.floor(Math.random() * BOARD_SIZE)
      };
    } while (snake.some(segment => segment.x === newFood.x && segment.y === newFood.y));
    return newFood;
  }, [snake]);

  const resetGame = () => {
    setSnake(INITIAL_SNAKE);
    setFood(INITIAL_FOOD);
    setDirection(INITIAL_DIRECTION);
    setGameOver(false);
    setScore(0);
    setIsPlaying(true);
  };

  const handleKeyPress = useCallback((event) => {
    if (!isPlaying || gameOver) return;

    const keyMap = {
      'ArrowUp': { x: 0, y: -1 },
      'ArrowDown': { x: 0, y: 1 },
      'ArrowLeft': { x: -1, y: 0 },
      'ArrowRight': { x: 1, y: 0 },
      'w': { x: 0, y: -1 },
      's': { x: 0, y: 1 },
      'a': { x: -1, y: 0 },
      'd': { x: 1, y: 0 }
    };

    const newDirection = keyMap[event.key];
    if (newDirection) {
      // Prevent reversing into itself
      if (newDirection.x !== -direction.x || newDirection.y !== -direction.y) {
        setDirection(newDirection);
      }
    }
  }, [direction, isPlaying, gameOver]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [handleKeyPress]);

  useEffect(() => {
    if (!isPlaying || gameOver) return;

    const moveSnake = () => {
      setSnake(currentSnake => {
        const newSnake = [...currentSnake];
        const head = { ...newSnake[0] };
        
        head.x += direction.x;
        head.y += direction.y;

        // Check wall collision
        if (head.x < 0 || head.x >= BOARD_SIZE || head.y < 0 || head.y >= BOARD_SIZE) {
          setGameOver(true);
          setIsPlaying(false);
          return currentSnake;
        }

        // Check self collision
        if (newSnake.some(segment => segment.x === head.x && segment.y === head.y)) {
          setGameOver(true);
          setIsPlaying(false);
          return currentSnake;
        }

        newSnake.unshift(head);

        // Check food collision
        if (head.x === food.x && head.y === food.y) {
          setScore(prevScore => {
            const newScore = prevScore + 10;
            if (newScore > highScore) {
              setHighScore(newScore);
              localStorage.setItem('snakeHighScore', newScore.toString());
            }
            return newScore;
          });
          setFood(generateFood());
        } else {
          newSnake.pop();
        }

        return newSnake;
      });
    };

    const gameLoop = setInterval(moveSnake, 150);
    return () => clearInterval(gameLoop);
  }, [direction, food, isPlaying, gameOver, generateFood, highScore]);

  const handleMobileControl = (newDirection) => {
    if (!isPlaying || gameOver) return;
    if (newDirection.x !== -direction.x || newDirection.y !== -direction.y) {
      setDirection(newDirection);
    }
  };

  return (
    <div className="snake-game">
      <div className="game-header">
        <h2>🐍 Snake Game</h2>
        <div className="score-board">
          <div className="score">Score: {score}</div>
          <div className="high-score">High Score: {highScore}</div>
        </div>
      </div>

      <div className="game-container">
        <div className="game-board">
          {Array.from({ length: BOARD_SIZE * BOARD_SIZE }, (_, index) => {
            const x = index % BOARD_SIZE;
            const y = Math.floor(index / BOARD_SIZE);
            
            const isSnakeSegment = snake.some(segment => segment.x === x && segment.y === y);
            const isSnakeHead = snake[0] && snake[0].x === x && snake[0].y === y;
            const isFood = food.x === x && food.y === y;

            return (
              <div
                key={index}
                className={`cell ${isSnakeSegment ? 'snake' : ''} ${isSnakeHead ? 'snake-head' : ''} ${isFood ? 'food' : ''}`}
              />
            );
          })}
        </div>

        {/* Mobile Controls */}
        <div className="mobile-controls">
          <div className="control-row">
            <button
              className="control-btn"
              onClick={() => handleMobileControl({ x: 0, y: -1 })}
            >
              ↑
            </button>
          </div>
          <div className="control-row">
            <button
              className="control-btn"
              onClick={() => handleMobileControl({ x: -1, y: 0 })}
            >
              ←
            </button>
            <button
              className="control-btn"
              onClick={() => handleMobileControl({ x: 1, y: 0 })}
            >
              →
            </button>
          </div>
          <div className="control-row">
            <button
              className="control-btn"
              onClick={() => handleMobileControl({ x: 0, y: 1 })}
            >
              ↓
            </button>
          </div>
        </div>
      </div>

      <div className="game-controls">
        {!isPlaying && !gameOver && (
          <motion.button
            className="btn btn-primary"
            onClick={resetGame}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Start Game
          </motion.button>
        )}

        {gameOver && (
          <div className="game-over">
            <h3>Game Over!</h3>
            <p>Final Score: {score}</p>
            {score === highScore && score > 0 && <p className="new-record">🎉 New High Score!</p>}
            <motion.button
              className="btn btn-primary"
              onClick={resetGame}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Play Again
            </motion.button>
          </div>
        )}

        {isPlaying && (
          <motion.button
            className="btn btn-secondary"
            onClick={() => setIsPlaying(false)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Pause
          </motion.button>
        )}
      </div>

      <div className="game-instructions">
        <h4>How to Play:</h4>
        <p>🎮 Use arrow keys or WASD to control the snake</p>
        <p>🍎 Eat the red food to grow and increase your score</p>
        <p>⚠️ Don't hit the walls or your own tail!</p>
        <p>📱 Use the on-screen buttons on mobile devices</p>
      </div>
    </div>
  );
};

export default SnakeGame;