import React, { useState, useEffect, useCallback, useRef } from 'react';
import './FlappyBirdGame.css';

const FlappyBirdGame = () => {
  const canvasRef = useRef(null);
  const gameLoopRef = useRef(null);
  const animationRef = useRef(null);

  // Game constants
  const CANVAS_WIDTH = 400;
  const CANVAS_HEIGHT = 600;
  const BIRD_SIZE = 25;
  const PIPE_WIDTH = 50;
  const PIPE_GAP = 180;
  const GRAVITY = 0.5;
  const JUMP_FORCE = -10;
  const PIPE_SPEED = 3;
  const SPAWN_RATE = 120; // frames between pipe spawns

  // Game state
  const [gameRunning, setGameRunning] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(() => {
    const saved = localStorage.getItem('flappybird-high-score');
    return saved ? parseInt(saved) : 0;
  });

  // Game objects
  const [bird, setBird] = useState({
    x: 100,
    y: CANVAS_HEIGHT / 2,
    width: BIRD_SIZE,
    height: BIRD_SIZE,
    velocityY: 0,
    rotation: 0
  });

  const [pipes, setPipes] = useState([]);
  const [frameCount, setFrameCount] = useState(0);
  const [background, setBackground] = useState({ x: 0 });

  // Initialize game
  const initializeGame = useCallback(() => {
    setBird({
      x: 100,
      y: CANVAS_HEIGHT / 2,
      width: BIRD_SIZE,
      height: BIRD_SIZE,
      velocityY: 0,
      rotation: 0
    });
    setPipes([]);
    setFrameCount(0);
    setBackground({ x: 0 });
    setScore(0);
    setGameOver(false);
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

  // Jump function
  const jump = useCallback(() => {
    if (gameRunning && !gameOver) {
      setBird(prev => ({
        ...prev,
        velocityY: JUMP_FORCE,
        rotation: -20
      }));
    }
  }, [gameRunning, gameOver]);

  // Handle keyboard input
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.code === 'Space' || event.key === 'ArrowUp' || event.key === 'w' || event.key === 'W') {
        event.preventDefault();
        jump();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [jump]);

  // Handle canvas click
  const handleCanvasClick = () => {
    jump();
  };

  // Collision detection
  const checkCollision = (bird, pipe) => {
    // Check collision with top pipe
    if (
      bird.x < pipe.x + pipe.width &&
      bird.x + bird.width > pipe.x &&
      bird.y < pipe.topHeight
    ) {
      return true;
    }

    // Check collision with bottom pipe
    if (
      bird.x < pipe.x + pipe.width &&
      bird.x + bird.width > pipe.x &&
      bird.y + bird.height > pipe.topHeight + PIPE_GAP
    ) {
      return true;
    }

    return false;
  };

  // Generate pipes
  const generatePipe = (x) => {
    const minHeight = 50;
    const maxHeight = CANVAS_HEIGHT - PIPE_GAP - minHeight;
    const topHeight = Math.random() * (maxHeight - minHeight) + minHeight;
    
    return {
      x: x,
      width: PIPE_WIDTH,
      topHeight: topHeight,
      bottomY: topHeight + PIPE_GAP,
      bottomHeight: CANVAS_HEIGHT - (topHeight + PIPE_GAP),
      scored: false
    };
  };

  // Game loop
  const gameLoop = useCallback(() => {
    if (!gameRunning || gameOver) return;

    // Update frame count
    setFrameCount(prev => prev + 1);

    // Update bird
    setBird(prev => {
      let newBird = {
        ...prev,
        velocityY: prev.velocityY + GRAVITY,
        y: prev.y + prev.velocityY + GRAVITY,
        rotation: Math.min(prev.rotation + 3, 90)
      };

      // Check boundaries
      if (newBird.y < 0) {
        newBird.y = 0;
        newBird.velocityY = 0;
      }

      if (newBird.y + newBird.height > CANVAS_HEIGHT - 50) { // Ground level
        setGameOver(true);
        setGameRunning(false);
        // Update high score
        setHighScore(prevHigh => {
          const newHigh = Math.max(prevHigh, score);
          localStorage.setItem('flappybird-high-score', newHigh.toString());
          return newHigh;
        });
      }

      return newBird;
    });

    // Update pipes
    setPipes(prev => {
      let newPipes = [...prev];

      // Add new pipe
      if (frameCount % SPAWN_RATE === 0) {
        newPipes.push(generatePipe(CANVAS_WIDTH));
      }

      // Move pipes and check collisions
      newPipes = newPipes.map(pipe => {
        const updatedPipe = { ...pipe, x: pipe.x - PIPE_SPEED };

        // Check collision with bird
        if (checkCollision(bird, updatedPipe)) {
          setGameOver(true);
          setGameRunning(false);
          setHighScore(prevHigh => {
            const newHigh = Math.max(prevHigh, score);
            localStorage.setItem('flappybird-high-score', newHigh.toString());
            return newHigh;
          });
        }

        // Check scoring
        if (!updatedPipe.scored && updatedPipe.x + updatedPipe.width < bird.x) {
          updatedPipe.scored = true;
          setScore(prevScore => prevScore + 1);
        }

        return updatedPipe;
      });

      // Remove pipes that are off screen
      newPipes = newPipes.filter(pipe => pipe.x + pipe.width > 0);

      return newPipes;
    });

    // Update background
    setBackground(prev => ({
      x: (prev.x - 1) % 50
    }));

  }, [gameRunning, gameOver, bird, frameCount, score]);

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
    
    // Clear canvas with sky gradient
    const gradient = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
    gradient.addColorStop(0, '#87CEEB');
    gradient.addColorStop(1, '#98D8E8');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Draw moving background pattern
    ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
    for (let i = 0; i < Math.ceil(CANVAS_WIDTH / 50) + 1; i++) {
      const x = (i * 50) + background.x;
      for (let j = 0; j < Math.ceil(CANVAS_HEIGHT / 50); j++) {
        const y = j * 50;
        if ((i + j) % 2 === 0) {
          ctx.fillRect(x, y, 25, 25);
        }
      }
    }

    // Draw ground
    ctx.fillStyle = '#DEB887';
    ctx.fillRect(0, CANVAS_HEIGHT - 50, CANVAS_WIDTH, 50);
    
    // Draw ground pattern
    ctx.fillStyle = '#D2691E';
    for (let i = 0; i < CANVAS_WIDTH; i += 20) {
      ctx.fillRect(i, CANVAS_HEIGHT - 50, 10, 50);
    }

    // Draw pipes
    pipes.forEach(pipe => {
      // Top pipe
      const topGradient = ctx.createLinearGradient(pipe.x, 0, pipe.x + pipe.width, 0);
      topGradient.addColorStop(0, '#228B22');
      topGradient.addColorStop(0.5, '#32CD32');
      topGradient.addColorStop(1, '#228B22');
      ctx.fillStyle = topGradient;
      ctx.fillRect(pipe.x, 0, pipe.width, pipe.topHeight);
      
      // Top pipe cap
      ctx.fillStyle = '#1F7A1F';
      ctx.fillRect(pipe.x - 5, pipe.topHeight - 30, pipe.width + 10, 30);

      // Bottom pipe
      const bottomGradient = ctx.createLinearGradient(pipe.x, pipe.bottomY, pipe.x + pipe.width, pipe.bottomY);
      bottomGradient.addColorStop(0, '#228B22');
      bottomGradient.addColorStop(0.5, '#32CD32');
      bottomGradient.addColorStop(1, '#228B22');
      ctx.fillStyle = bottomGradient;
      ctx.fillRect(pipe.x, pipe.bottomY, pipe.width, pipe.bottomHeight);
      
      // Bottom pipe cap
      ctx.fillStyle = '#1F7A1F';
      ctx.fillRect(pipe.x - 5, pipe.bottomY, pipe.width + 10, 30);

      // Pipe highlights
      ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
      ctx.fillRect(pipe.x, 0, 3, pipe.topHeight);
      ctx.fillRect(pipe.x, pipe.bottomY, 3, pipe.bottomHeight);
    });

    // Draw bird
    ctx.save();
    ctx.translate(bird.x + bird.width / 2, bird.y + bird.height / 2);
    ctx.rotate((bird.rotation * Math.PI) / 180);

    // Bird body
    const birdGradient = ctx.createRadialGradient(0, 0, 0, 0, 0, bird.width / 2);
    birdGradient.addColorStop(0, '#FFD700');
    birdGradient.addColorStop(1, '#FFA500');
    ctx.fillStyle = birdGradient;
    ctx.beginPath();
    ctx.arc(0, 0, bird.width / 2, 0, Math.PI * 2);
    ctx.fill();

    // Bird wing
    ctx.fillStyle = '#FF6347';
    ctx.beginPath();
    ctx.ellipse(-5, 0, 8, 12, 0, 0, Math.PI * 2);
    ctx.fill();

    // Bird eye
    ctx.fillStyle = 'white';
    ctx.beginPath();
    ctx.arc(3, -5, 4, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.fillStyle = 'black';
    ctx.beginPath();
    ctx.arc(4, -5, 2, 0, Math.PI * 2);
    ctx.fill();

    // Bird beak
    ctx.fillStyle = '#FF4500';
    ctx.beginPath();
    ctx.moveTo(bird.width / 2 - 5, -2);
    ctx.lineTo(bird.width / 2 + 5, 0);
    ctx.lineTo(bird.width / 2 - 5, 2);
    ctx.closePath();
    ctx.fill();

    ctx.restore();

    // Draw score
    ctx.fillStyle = 'white';
    ctx.font = 'bold 36px Arial';
    ctx.textAlign = 'center';
    ctx.strokeStyle = 'black';
    ctx.lineWidth = 3;
    ctx.strokeText(score.toString(), CANVAS_WIDTH / 2, 50);
    ctx.fillText(score.toString(), CANVAS_WIDTH / 2, 50);

    // Draw clouds
    const drawCloud = (x, y, size) => {
      ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
      ctx.beginPath();
      ctx.arc(x, y, size, 0, Math.PI * 2);
      ctx.arc(x + size * 0.6, y, size * 0.8, 0, Math.PI * 2);
      ctx.arc(x + size * 1.2, y, size, 0, Math.PI * 2);
      ctx.arc(x + size * 1.8, y, size * 0.8, 0, Math.PI * 2);
      ctx.arc(x + size * 2.4, y, size, 0, Math.PI * 2);
      ctx.fill();
    };

    // Static clouds
    drawCloud(100 + background.x * 0.3, 100, 20);
    drawCloud(400 + background.x * 0.2, 80, 25);
    drawCloud(650 + background.x * 0.4, 120, 18);

  }, [bird, pipes, score, background]);

  return (
    <div className="flappy-bird-game">
      <div className="game-header">
        <h2>Flappy Bird</h2>
        <div className="game-stats">
          <div className="stat">
            <span className="stat-label">Score</span>
            <span className="stat-value">{score}</span>
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
            <p>Score: <span className="highlight">{score}</span></p>
            <p>Best: <span className="highlight">{highScore}</span></p>
            {score === highScore && score > 0 && (
              <p className="new-record">🎉 New High Score!</p>
            )}
          </div>
        </div>
      )}

      <div className="game-container">
        <canvas
          ref={canvasRef}
          width={CANVAS_WIDTH}
          height={CANVAS_HEIGHT}
          className="game-canvas"
          onClick={handleCanvasClick}
        />
        {!gameRunning && !gameOver && (
          <div className="start-overlay">
            <div className="start-message">
              <h3>🐦 Ready to Fly?</h3>
              <p>Tap or press SPACE to flap your wings!</p>
              <p>Avoid the pipes and score as high as you can!</p>
            </div>
          </div>
        )}
      </div>

      <div className="mobile-controls">
        <button className="flap-btn" onClick={jump}>
          🐦 FLAP
        </button>
      </div>

      <div className="game-controls">
        <button 
          className={gameRunning ? "btn btn-secondary" : "btn btn-primary"}
          onClick={gameRunning ? resetGame : startGame}
        >
          {gameRunning ? 'Reset Game' : gameOver ? 'Play Again' : 'Start Game'}
        </button>
      </div>

      <div className="game-instructions">
        <h4>How to Play</h4>
        <p>• Press SPACE, click, or tap to make the bird flap</p>
        <p>• Avoid hitting the green pipes or the ground</p>
        <p>• Score points by passing through pipe gaps</p>
        <p>• The bird falls due to gravity - keep flapping!</p>
        <p>• Try to beat your high score!</p>
      </div>
    </div>
  );
};

export default FlappyBirdGame;