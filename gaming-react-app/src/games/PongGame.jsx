import React, { useState, useEffect, useCallback, useRef } from 'react';
import './PongGame.css';

const PongGame = () => {
  const canvasRef = useRef(null);
  const gameLoopRef = useRef(null);
  const keysRef = useRef({ up: false, down: false });

  // Game constants
  const CANVAS_WIDTH = 800;
  const CANVAS_HEIGHT = 400;
  const PADDLE_WIDTH = 10;
  const PADDLE_HEIGHT = 80;
  const BALL_SIZE = 10;
  const PADDLE_SPEED = 6;
  const WINNING_SCORE = 11;

  // Game state
  const [gameRunning, setGameRunning] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [winner, setWinner] = useState(null);
  const [aiDifficulty, setAiDifficulty] = useState('medium');
  const [scores, setScores] = useState({ player: 0, ai: 0 });

  // Game objects
  const [leftPaddle, setLeftPaddle] = useState({
    x: 20,
    y: CANVAS_HEIGHT / 2 - PADDLE_HEIGHT / 2,
    width: PADDLE_WIDTH,
    height: PADDLE_HEIGHT,
    speed: PADDLE_SPEED
  });

  const [rightPaddle, setRightPaddle] = useState({
    x: CANVAS_WIDTH - 30,
    y: CANVAS_HEIGHT / 2 - PADDLE_HEIGHT / 2,
    width: PADDLE_WIDTH,
    height: PADDLE_HEIGHT,
    speed: PADDLE_SPEED
  });

  const [ball, setBall] = useState({
    x: CANVAS_WIDTH / 2 - BALL_SIZE / 2,
    y: CANVAS_HEIGHT / 2 - BALL_SIZE / 2,
    width: BALL_SIZE,
    height: BALL_SIZE,
    velocityX: 4,
    velocityY: 3
  });

  // Initialize game
  const initializeGame = useCallback(() => {
    setLeftPaddle({
      x: 20,
      y: CANVAS_HEIGHT / 2 - PADDLE_HEIGHT / 2,
      width: PADDLE_WIDTH,
      height: PADDLE_HEIGHT,
      speed: PADDLE_SPEED
    });

    setRightPaddle({
      x: CANVAS_WIDTH - 30,
      y: CANVAS_HEIGHT / 2 - PADDLE_HEIGHT / 2,
      width: PADDLE_WIDTH,
      height: PADDLE_HEIGHT,
      speed: PADDLE_SPEED
    });

    setBall({
      x: CANVAS_WIDTH / 2 - BALL_SIZE / 2,
      y: CANVAS_HEIGHT / 2 - BALL_SIZE / 2,
      width: BALL_SIZE,
      height: BALL_SIZE,
      velocityX: Math.random() > 0.5 ? 4 : -4,
      velocityY: (Math.random() - 0.5) * 6
    });

    setScores({ player: 0, ai: 0 });
    setGameOver(false);
    setWinner(null);
  }, []);

  // Start game
  const startGame = () => {
    initializeGame();
    setGameRunning(true);
  };

  // Reset game
  const resetGame = () => {
    setGameRunning(false);
    initializeGame();
  };

  // Handle keyboard input
  useEffect(() => {
    const handleKeyDown = (event) => {
      switch (event.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
          event.preventDefault();
          keysRef.current.up = true;
          break;
        case 'ArrowDown':
        case 's':
        case 'S':
          event.preventDefault();
          keysRef.current.down = true;
          break;
        default:
          break;
      }
    };

    const handleKeyUp = (event) => {
      switch (event.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
          keysRef.current.up = false;
          break;
        case 'ArrowDown':
        case 's':
        case 'S':
          keysRef.current.down = false;
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // Collision detection
  const checkCollision = (rect1, rect2) => {
    return rect1.x < rect2.x + rect2.width &&
           rect1.x + rect1.width > rect2.x &&
           rect1.y < rect2.y + rect2.height &&
           rect1.y + rect1.height > rect2.y;
  };

  // Reset ball position
  const resetBall = useCallback((direction) => {
    setBall({
      x: CANVAS_WIDTH / 2 - BALL_SIZE / 2,
      y: CANVAS_HEIGHT / 2 - BALL_SIZE / 2,
      width: BALL_SIZE,
      height: BALL_SIZE,
      velocityX: direction * 4,
      velocityY: (Math.random() - 0.5) * 6
    });
  }, []);

  // AI logic
  const updateAI = useCallback((rightPaddle, ball) => {
    const paddleCenter = rightPaddle.y + rightPaddle.height / 2;
    const ballCenter = ball.y + ball.height / 2;
    
    let aiSpeed = rightPaddle.speed;
    
    // Adjust AI speed based on difficulty
    switch (aiDifficulty) {
      case 'easy':
        aiSpeed *= 0.6;
        break;
      case 'medium':
        aiSpeed *= 0.8;
        break;
      case 'hard':
        aiSpeed *= 1.1;
        break;
      default:
        break;
    }

    // Add some randomness for lower difficulties
    const randomFactor = aiDifficulty === 'easy' ? 0.7 : aiDifficulty === 'medium' ? 0.9 : 1;
    
    if (Math.random() < randomFactor) {
      if (ballCenter < paddleCenter - 10) {
        return Math.max(0, rightPaddle.y - aiSpeed);
      } else if (ballCenter > paddleCenter + 10) {
        return Math.min(CANVAS_HEIGHT - rightPaddle.height, rightPaddle.y + aiSpeed);
      }
    }
    
    return rightPaddle.y;
  }, [aiDifficulty]);

  // Game loop
  const gameLoop = useCallback(() => {
    if (!gameRunning || gameOver) return;

    // Update player paddle
    setLeftPaddle(prev => {
      let newY = prev.y;
      if (keysRef.current.up && newY > 0) {
        newY = Math.max(0, newY - prev.speed);
      }
      if (keysRef.current.down && newY < CANVAS_HEIGHT - prev.height) {
        newY = Math.min(CANVAS_HEIGHT - prev.height, newY + prev.speed);
      }
      return { ...prev, y: newY };
    });

    // Update AI paddle
    setRightPaddle(prev => ({
      ...prev,
      y: updateAI(prev, ball)
    }));

    // Update ball
    setBall(prev => {
      let newBall = {
        ...prev,
        x: prev.x + prev.velocityX,
        y: prev.y + prev.velocityY
      };

      // Ball collision with top and bottom walls
      if (newBall.y <= 0 || newBall.y >= CANVAS_HEIGHT - newBall.height) {
        newBall.velocityY = -newBall.velocityY;
        newBall.y = newBall.y <= 0 ? 0 : CANVAS_HEIGHT - newBall.height;
      }

      // Ball collision with paddles
      if (checkCollision(newBall, leftPaddle)) {
        if (newBall.velocityX < 0) {
          newBall.velocityX = -newBall.velocityX;
          newBall.x = leftPaddle.x + leftPaddle.width;
          
          // Add spin based on paddle position
          const paddleCenter = leftPaddle.y + leftPaddle.height / 2;
          const ballCenter = newBall.y + newBall.height / 2;
          const spinFactor = (ballCenter - paddleCenter) / (leftPaddle.height / 2);
          newBall.velocityY += spinFactor * 2;
        }
      }

      if (checkCollision(newBall, rightPaddle)) {
        if (newBall.velocityX > 0) {
          newBall.velocityX = -newBall.velocityX;
          newBall.x = rightPaddle.x - newBall.width;
          
          // Add spin based on paddle position
          const paddleCenter = rightPaddle.y + rightPaddle.height / 2;
          const ballCenter = newBall.y + newBall.height / 2;
          const spinFactor = (ballCenter - paddleCenter) / (rightPaddle.height / 2);
          newBall.velocityY += spinFactor * 2;
        }
      }

      // Ball goes off screen (scoring)
      if (newBall.x < 0) {
        // AI scores
        setScores(prevScores => {
          const newScores = { ...prevScores, ai: prevScores.ai + 1 };
          if (newScores.ai >= WINNING_SCORE) {
            setWinner('AI');
            setGameOver(true);
            setGameRunning(false);
          }
          return newScores;
        });
        setTimeout(() => resetBall(1), 1000);
        return prev; // Don't update ball position this frame
      }

      if (newBall.x > CANVAS_WIDTH) {
        // Player scores
        setScores(prevScores => {
          const newScores = { ...prevScores, player: prevScores.player + 1 };
          if (newScores.player >= WINNING_SCORE) {
            setWinner('Player');
            setGameOver(true);
            setGameRunning(false);
          }
          return newScores;
        });
        setTimeout(() => resetBall(-1), 1000);
        return prev; // Don't update ball position this frame
      }

      return newBall;
    });

  }, [gameRunning, gameOver, ball, leftPaddle, rightPaddle, updateAI, resetBall]);

  // Game loop effect
  useEffect(() => {
    if (gameRunning && !gameOver) {
      gameLoopRef.current = setInterval(gameLoop, 1000 / 60); // 60 FPS
    }
    return () => {
      if (gameLoopRef.current) {
        clearInterval(gameLoopRef.current);
      }
    };
  }, [gameLoop, gameRunning, gameOver]);

  // Render game
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    
    // Clear canvas
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Draw center line
    ctx.setLineDash([5, 15]);
    ctx.beginPath();
    ctx.moveTo(CANVAS_WIDTH / 2, 0);
    ctx.lineTo(CANVAS_WIDTH / 2, CANVAS_HEIGHT);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.setLineDash([]);

    // Draw paddles
    ctx.fillStyle = '#00d4ff';
    ctx.fillRect(leftPaddle.x, leftPaddle.y, leftPaddle.width, leftPaddle.height);
    
    ctx.fillStyle = '#ff00ff';
    ctx.fillRect(rightPaddle.x, rightPaddle.y, rightPaddle.width, rightPaddle.height);

    // Draw ball
    ctx.fillStyle = '#fff';
    ctx.fillRect(ball.x, ball.y, ball.width, ball.height);

    // Draw scores
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.font = '48px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(scores.player.toString(), CANVAS_WIDTH / 4, 60);
    ctx.fillText(scores.ai.toString(), (CANVAS_WIDTH * 3) / 4, 60);

  }, [leftPaddle, rightPaddle, ball, scores]);

  // Mobile controls
  const moveUp = () => {
    if (gameRunning && !gameOver) {
      setLeftPaddle(prev => ({
        ...prev,
        y: Math.max(0, prev.y - prev.speed * 3)
      }));
    }
  };

  const moveDown = () => {
    if (gameRunning && !gameOver) {
      setLeftPaddle(prev => ({
        ...prev,
        y: Math.min(CANVAS_HEIGHT - prev.height, prev.y + prev.speed * 3)
      }));
    }
  };

  return (
    <div className="pong-game">
      <div className="game-header">
        <h2>Pong</h2>
        <div className="game-info">
          <div className="scores">
            <div className="score-section player">
              <h3>Player</h3>
              <div className="score">{scores.player}</div>
            </div>
            <div className="vs">VS</div>
            <div className="score-section ai">
              <h3>AI</h3>
              <div className="score">{scores.ai}</div>
            </div>
          </div>
          
          <div className="difficulty-selector">
            <label>AI Difficulty:</label>
            <select 
              value={aiDifficulty} 
              onChange={(e) => setAiDifficulty(e.target.value)}
              disabled={gameRunning}
            >
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
          </div>
        </div>
      </div>

      {gameOver && (
        <div className="game-over">
          <h3>{winner === 'Player' ? '🎉 You Win!' : '🤖 AI Wins!'}</h3>
          <p>Final Score: {scores.player} - {scores.ai}</p>
          <p>First to {WINNING_SCORE} wins!</p>
        </div>
      )}

      <div className="game-container">
        <canvas
          ref={canvasRef}
          width={CANVAS_WIDTH}
          height={CANVAS_HEIGHT}
          className="game-canvas"
        />
      </div>

      <div className="mobile-controls">
        <div className="control-row">
          <button className="control-btn up" onClick={moveUp}>
            ↑ UP
          </button>
        </div>
        <div className="control-row">
          <button className="control-btn down" onClick={moveDown}>
            ↓ DOWN
          </button>
        </div>
      </div>

      <div className="game-controls">
        <button 
          className={gameRunning ? "btn btn-secondary" : "btn btn-primary"}
          onClick={gameRunning ? resetGame : startGame}
        >
          {gameRunning ? 'Reset Game' : gameOver ? 'New Game' : 'Start Game'}
        </button>
      </div>

      <div className="game-instructions">
        <h4>How to Play</h4>
        <p>• Use arrow keys or W/S to move your paddle (left side)</p>
        <p>• Prevent the ball from reaching your side</p>
        <p>• First player to reach {WINNING_SCORE} points wins!</p>
        <p>• Ball bounces with spin based on paddle hit position</p>
        <p>• Choose AI difficulty: Easy, Medium, or Hard</p>
      </div>
    </div>
  );
};

export default PongGame;