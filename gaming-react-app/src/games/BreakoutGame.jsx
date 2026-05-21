import React, { useState, useEffect, useCallback, useRef } from 'react';
import './BreakoutGame.css';

const BreakoutGame = () => {
  const canvasRef = useRef(null);
  const gameLoopRef = useRef(null);
  const keysRef = useRef({ left: false, right: false });

  // Game constants
  const CANVAS_WIDTH = 800;
  const CANVAS_HEIGHT = 600;
  const PADDLE_WIDTH = 100;
  const PADDLE_HEIGHT = 10;
  const BALL_SIZE = 10;
  const PADDLE_SPEED = 8;
  const BALL_SPEED = 5;
  const BRICK_ROWS = 8;
  const BRICK_COLS = 10;
  const BRICK_WIDTH = 70;
  const BRICK_HEIGHT = 25;
  const BRICK_PADDING = 5;
  const BRICK_OFFSET_TOP = 80;

  // Game state
  const [gameRunning, setGameRunning] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [gameWon, setGameWon] = useState(false);
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [lives, setLives] = useState(3);
  const [highScore, setHighScore] = useState(() => {
    const saved = localStorage.getItem('breakout-high-score');
    return saved ? parseInt(saved) : 0;
  });

  // Game objects
  const [paddle, setPaddle] = useState({
    x: CANVAS_WIDTH / 2 - PADDLE_WIDTH / 2,
    y: CANVAS_HEIGHT - 30,
    width: PADDLE_WIDTH,
    height: PADDLE_HEIGHT,
    speed: PADDLE_SPEED
  });

  const [ball, setBall] = useState({
    x: CANVAS_WIDTH / 2 - BALL_SIZE / 2,
    y: CANVAS_HEIGHT / 2,
    width: BALL_SIZE,
    height: BALL_SIZE,
    velocityX: BALL_SPEED,
    velocityY: -BALL_SPEED,
    stuck: true
  });

  const [bricks, setBricks] = useState([]);
  const [powerUps, setPowerUps] = useState([]);

  // Brick colors by row (top to bottom)
  const brickColors = [
    '#FF6B6B', '#FF8E53', '#FF6B9D', '#4ECDC4',
    '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD'
  ];

  // Initialize bricks
  const initializeBricks = useCallback(() => {
    const newBricks = [];
    for (let row = 0; row < BRICK_ROWS; row++) {
      for (let col = 0; col < BRICK_COLS; col++) {
        newBricks.push({
          x: col * (BRICK_WIDTH + BRICK_PADDING) + BRICK_PADDING + 35,
          y: row * (BRICK_HEIGHT + BRICK_PADDING) + BRICK_OFFSET_TOP,
          width: BRICK_WIDTH,
          height: BRICK_HEIGHT,
          color: brickColors[row],
          visible: true,
          points: (BRICK_ROWS - row) * 10 // Higher rows worth more points
        });
      }
    }
    return newBricks;
  }, []);

  // Initialize game
  const initializeGame = useCallback(() => {
    setPaddle({
      x: CANVAS_WIDTH / 2 - PADDLE_WIDTH / 2,
      y: CANVAS_HEIGHT - 30,
      width: PADDLE_WIDTH,
      height: PADDLE_HEIGHT,
      speed: PADDLE_SPEED
    });

    setBall({
      x: CANVAS_WIDTH / 2 - BALL_SIZE / 2,
      y: CANVAS_HEIGHT / 2,
      width: BALL_SIZE,
      height: BALL_SIZE,
      velocityX: BALL_SPEED * (Math.random() > 0.5 ? 1 : -1),
      velocityY: -BALL_SPEED,
      stuck: true
    });

    setBricks(initializeBricks());
    setPowerUps([]);
    setGameOver(false);
    setGameWon(false);
  }, [initializeBricks]);

  // Start new game
  const startNewGame = () => {
    setScore(0);
    setLevel(1);
    setLives(3);
    initializeGame();
    setGameRunning(true);
  };

  // Next level
  const nextLevel = useCallback(() => {
    setLevel(prev => prev + 1);
    setBricks(initializeBricks());
    setBall(prev => ({
      ...prev,
      x: CANVAS_WIDTH / 2 - BALL_SIZE / 2,
      y: CANVAS_HEIGHT / 2,
      velocityX: BALL_SPEED * (Math.random() > 0.5 ? 1 : -1) * (1 + level * 0.1),
      velocityY: -BALL_SPEED * (1 + level * 0.1),
      stuck: true
    }));
    setPowerUps([]);
    setGameWon(false);
  }, [initializeBricks, level]);

  // Release ball
  const releaseBall = useCallback(() => {
    if (ball.stuck) {
      setBall(prev => ({ ...prev, stuck: false }));
    }
  }, [ball.stuck]);

  // Handle keyboard input
  useEffect(() => {
    const handleKeyDown = (event) => {
      switch (event.key) {
        case 'ArrowLeft':
        case 'a':
        case 'A':
          event.preventDefault();
          keysRef.current.left = true;
          break;
        case 'ArrowRight':
        case 'd':
        case 'D':
          event.preventDefault();
          keysRef.current.right = true;
          break;
        case ' ':
          event.preventDefault();
          releaseBall();
          break;
        default:
          break;
      }
    };

    const handleKeyUp = (event) => {
      switch (event.key) {
        case 'ArrowLeft':
        case 'a':
        case 'A':
          keysRef.current.left = false;
          break;
        case 'ArrowRight':
        case 'd':
        case 'D':
          keysRef.current.right = false;
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
  }, [releaseBall]);

  // Collision detection
  const checkCollision = (rect1, rect2) => {
    return rect1.x < rect2.x + rect2.width &&
           rect1.x + rect1.width > rect2.x &&
           rect1.y < rect2.y + rect2.height &&
           rect1.y + rect1.height > rect2.y;
  };

  // Reset ball after life lost
  const resetBall = useCallback(() => {
    setBall({
      x: CANVAS_WIDTH / 2 - BALL_SIZE / 2,
      y: CANVAS_HEIGHT / 2,
      width: BALL_SIZE,
      height: BALL_SIZE,
      velocityX: BALL_SPEED * (Math.random() > 0.5 ? 1 : -1),
      velocityY: -BALL_SPEED,
      stuck: true
    });
  }, []);

  // Create power-up
  const createPowerUp = (x, y) => {
    const powerUpTypes = [
      { type: 'expand', color: '#4CAF50', symbol: '⬌' },
      { type: 'multiball', color: '#2196F3', symbol: '●●●' },
      { type: 'slowball', color: '#FF9800', symbol: '🐌' }
    ];
    
    const powerUp = powerUpTypes[Math.floor(Math.random() * powerUpTypes.length)];
    return {
      x: x,
      y: y,
      radius: 15,
      velocityY: 2,
      ...powerUp
    };
  };

  // Game loop
  const gameLoop = useCallback(() => {
    if (!gameRunning || gameOver || gameWon) return;

    // Update paddle
    setPaddle(prev => {
      let newX = prev.x;
      if (keysRef.current.left && newX > 0) {
        newX = Math.max(0, newX - prev.speed);
      }
      if (keysRef.current.right && newX < CANVAS_WIDTH - prev.width) {
        newX = Math.min(CANVAS_WIDTH - prev.width, newX + prev.speed);
      }
      return { ...prev, x: newX };
    });

    // Update ball
    setBall(prev => {
      if (prev.stuck) {
        return {
          ...prev,
          x: paddle.x + paddle.width / 2 - prev.width / 2,
          y: paddle.y - prev.height - 5
        };
      }

      let newBall = {
        ...prev,
        x: prev.x + prev.velocityX,
        y: prev.y + prev.velocityY
      };

      // Ball collision with walls
      if (newBall.x <= 0 || newBall.x >= CANVAS_WIDTH - newBall.width) {
        newBall.velocityX = -newBall.velocityX;
        newBall.x = newBall.x <= 0 ? 0 : CANVAS_WIDTH - newBall.width;
      }

      if (newBall.y <= 0) {
        newBall.velocityY = -newBall.velocityY;
        newBall.y = 0;
      }

      // Ball falls below paddle (life lost)
      if (newBall.y > CANVAS_HEIGHT) {
        setLives(prevLives => {
          const newLives = prevLives - 1;
          if (newLives <= 0) {
            setGameOver(true);
            setGameRunning(false);
            setHighScore(prevHigh => {
              const newHigh = Math.max(prevHigh, score);
              localStorage.setItem('breakout-high-score', newHigh.toString());
              return newHigh;
            });
          } else {
            setTimeout(resetBall, 1000);
          }
          return newLives;
        });
        return prev; // Don't update ball position this frame
      }

      // Ball collision with paddle
      if (checkCollision(newBall, paddle)) {
        const paddleCenter = paddle.x + paddle.width / 2;
        const ballCenter = newBall.x + newBall.width / 2;
        const hitPos = (ballCenter - paddleCenter) / (paddle.width / 2);
        
        newBall.velocityY = -Math.abs(newBall.velocityY);
        newBall.velocityX = hitPos * BALL_SPEED;
        newBall.y = paddle.y - newBall.height;
      }

      return newBall;
    });

    // Update bricks (check collisions)
    setBricks(prev => {
      return prev.map(brick => {
        if (!brick.visible || !checkCollision(ball, brick)) {
          return brick;
        }

        // Brick hit - determine bounce direction
        const ballCenterX = ball.x + ball.width / 2;
        const ballCenterY = ball.y + ball.height / 2;
        const brickCenterX = brick.x + brick.width / 2;
        const brickCenterY = brick.y + brick.height / 2;

        const dx = ballCenterX - brickCenterX;
        const dy = ballCenterY - brickCenterY;

        if (Math.abs(dx / brick.width) > Math.abs(dy / brick.height)) {
          setBall(prevBall => ({ ...prevBall, velocityX: -prevBall.velocityX }));
        } else {
          setBall(prevBall => ({ ...prevBall, velocityY: -prevBall.velocityY }));
        }

        // Add score
        setScore(prevScore => prevScore + brick.points);

        // Sometimes create power-up
        if (Math.random() < 0.15) {
          setPowerUps(prevPowerUps => [
            ...prevPowerUps,
            createPowerUp(brick.x + brick.width / 2, brick.y + brick.height)
          ]);
        }

        return { ...brick, visible: false };
      });
    });

    // Check win condition
    setBricks(prev => {
      const visibleBricks = prev.filter(brick => brick.visible);
      if (visibleBricks.length === 0) {
        setGameWon(true);
        setTimeout(nextLevel, 2000);
      }
      return prev;
    });

    // Update power-ups
    setPowerUps(prev => {
      return prev.filter(powerUp => {
        powerUp.y += powerUp.velocityY;

        // Check collision with paddle
        const distance = Math.sqrt(
          Math.pow(powerUp.x - (paddle.x + paddle.width / 2), 2) +
          Math.pow(powerUp.y - paddle.y, 2)
        );

        if (distance < powerUp.radius + 10) {
          // Apply power-up effect
          switch (powerUp.type) {
            case 'expand':
              setPaddle(prevPaddle => ({
                ...prevPaddle,
                width: Math.min(150, prevPaddle.width + 20)
              }));
              break;
            case 'slowball':
              setBall(prevBall => ({
                ...prevBall,
                velocityX: prevBall.velocityX * 0.7,
                velocityY: prevBall.velocityY * 0.7
              }));
              break;
            case 'multiball':
              // This would require more complex implementation
              setScore(prevScore => prevScore + 100);
              break;
            default:
              break;
          }
          return false; // Remove power-up
        }

        return powerUp.y < CANVAS_HEIGHT + 50; // Keep if still on screen
      });
    });

  }, [gameRunning, gameOver, gameWon, ball, paddle, score, resetBall, nextLevel]);

  // Game loop effect
  useEffect(() => {
    if (gameRunning && !gameOver && !gameWon) {
      gameLoopRef.current = setInterval(gameLoop, 1000 / 60); // 60 FPS
    }
    return () => {
      if (gameLoopRef.current) {
        clearInterval(gameLoopRef.current);
      }
    };
  }, [gameLoop, gameRunning, gameOver, gameWon]);

  // Render game
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    
    // Clear canvas with gradient background
    const gradient = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
    gradient.addColorStop(0, '#1a1a2e');
    gradient.addColorStop(1, '#16213e');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Draw bricks
    bricks.forEach(brick => {
      if (brick.visible) {
        const brickGradient = ctx.createLinearGradient(brick.x, brick.y, brick.x, brick.y + brick.height);
        brickGradient.addColorStop(0, brick.color);
        brickGradient.addColorStop(1, brick.color + '99');
        
        ctx.fillStyle = brickGradient;
        ctx.fillRect(brick.x, brick.y, brick.width, brick.height);
        
        // Brick border
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.lineWidth = 1;
        ctx.strokeRect(brick.x, brick.y, brick.width, brick.height);
        
        // Brick highlight
        ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
        ctx.fillRect(brick.x, brick.y, brick.width, 3);
      }
    });

    // Draw paddle
    const paddleGradient = ctx.createLinearGradient(paddle.x, paddle.y, paddle.x, paddle.y + paddle.height);
    paddleGradient.addColorStop(0, '#00d4ff');
    paddleGradient.addColorStop(1, '#0099cc');
    ctx.fillStyle = paddleGradient;
    ctx.fillRect(paddle.x, paddle.y, paddle.width, paddle.height);
    
    // Paddle highlight
    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.fillRect(paddle.x, paddle.y, paddle.width, 2);

    // Draw ball
    const ballGradient = ctx.createRadialGradient(
      ball.x + ball.width / 2, ball.y + ball.height / 2, 0,
      ball.x + ball.width / 2, ball.y + ball.height / 2, ball.width / 2
    );
    ballGradient.addColorStop(0, '#fff');
    ballGradient.addColorStop(1, '#ddd');
    ctx.fillStyle = ballGradient;
    ctx.beginPath();
    ctx.arc(ball.x + ball.width / 2, ball.y + ball.height / 2, ball.width / 2, 0, Math.PI * 2);
    ctx.fill();

    // Draw power-ups
    powerUps.forEach(powerUp => {
      ctx.fillStyle = powerUp.color;
      ctx.beginPath();
      ctx.arc(powerUp.x, powerUp.y, powerUp.radius, 0, Math.PI * 2);
      ctx.fill();
      
      ctx.fillStyle = 'white';
      ctx.font = '12px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(powerUp.symbol, powerUp.x, powerUp.y + 4);
    });

    // Draw UI
    ctx.fillStyle = 'white';
    ctx.font = 'bold 20px Arial';
    ctx.textAlign = 'left';
    ctx.fillText(`Score: ${score}`, 20, 30);
    ctx.fillText(`Level: ${level}`, 20, 55);
    
    ctx.textAlign = 'right';
    ctx.fillText(`Lives: ${lives}`, CANVAS_WIDTH - 20, 30);
    ctx.fillText(`Best: ${highScore}`, CANVAS_WIDTH - 20, 55);

    // Draw instructions if ball is stuck
    if (ball.stuck) {
      ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
      ctx.font = '18px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('Press SPACE to launch the ball!', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 50);
    }

  }, [paddle, ball, bricks, powerUps, score, level, lives, highScore]);

  // Mobile controls
  const moveLeft = () => {
    if (gameRunning && !gameOver && !gameWon) {
      setPaddle(prev => ({
        ...prev,
        x: Math.max(0, prev.x - prev.speed * 2)
      }));
    }
  };

  const moveRight = () => {
    if (gameRunning && !gameOver && !gameWon) {
      setPaddle(prev => ({
        ...prev,
        x: Math.min(CANVAS_WIDTH - prev.width, prev.x + prev.speed * 2)
      }));
    }
  };

  return (
    <div className="breakout-game">
      <div className="game-header">
        <h2>Breakout</h2>
        <div className="game-stats">
          <div className="stat">
            <span className="stat-label">Score</span>
            <span className="stat-value">{score}</span>
          </div>
          <div className="stat">
            <span className="stat-label">Level</span>
            <span className="stat-value">{level}</span>
          </div>
          <div className="stat">
            <span className="stat-label">Lives</span>
            <span className="stat-value">{lives}</span>
          </div>
          <div className="stat">
            <span className="stat-label">Best</span>
            <span className="stat-value">{highScore}</span>
          </div>
        </div>
      </div>

      {gameOver && (
        <div className="game-over">
          <h3>Game Over!</h3>
          <div className="final-stats">
            <p>Final Score: <span className="highlight">{score}</span></p>
            <p>Level Reached: <span className="highlight">{level}</span></p>
            <p>High Score: <span className="highlight">{highScore}</span></p>
            {score === highScore && score > 0 && (
              <p className="new-record">🎉 New High Score!</p>
            )}
          </div>
        </div>
      )}

      {gameWon && (
        <div className="level-complete">
          <h3>Level {level} Complete!</h3>
          <p>🎊 Great job! Moving to next level...</p>
          <p>Score: <span className="highlight">{score}</span></p>
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
          <button className="control-btn left" onClick={moveLeft}>
            ← LEFT
          </button>
          <button className="control-btn launch" onClick={releaseBall}>
            🚀 LAUNCH
          </button>
          <button className="control-btn right" onClick={moveRight}>
            RIGHT →
          </button>
        </div>
      </div>

      <div className="game-controls">
        <button 
          className="btn btn-primary"
          onClick={startNewGame}
        >
          {gameRunning ? 'New Game' : 'Start Game'}
        </button>
      </div>

      <div className="game-instructions">
        <h4>How to Play</h4>
        <p>• Use arrow keys or A/D to move the paddle</p>
        <p>• Press SPACE to launch the ball</p>
        <p>• Break all bricks to advance to the next level</p>
        <p>• Catch power-ups for special abilities!</p>
        <p>• Don't let the ball fall below the paddle</p>
        <p>• Higher bricks are worth more points</p>
      </div>
    </div>
  );
};

export default BreakoutGame;