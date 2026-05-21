import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import './DoodleJumpGame.css';

const DoodleJumpGame = () => {
  const canvasRef = useRef(null);
  const CANVAS_WIDTH = 400;
  const CANVAS_HEIGHT = 600;
  const DOODLE_SIZE = 30;
  const PLATFORM_WIDTH = 80;
  const PLATFORM_HEIGHT = 15;
  const GRAVITY = 0.5;
  const JUMP_FORCE = -12;

  const [doodle, setDoodle] = useState({
    x: CANVAS_WIDTH / 2,
    y: CANVAS_HEIGHT - 100,
    vx: 0,
    vy: 0,
    direction: 'right'
  });
  const [platforms, setPlatforms] = useState([]);
  const [camera, setCamera] = useState(0);
  const [score, setScore] = useState(0);
  const [gameRunning, setGameRunning] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [keys, setKeys] = useState({ left: false, right: false });
  const [highScore, setHighScore] = useState(
    parseInt(localStorage.getItem('doodle-jump-highscore')) || 0
  );

  const generatePlatforms = useCallback(() => {
    const newPlatforms = [];
    
    // Starting platform
    newPlatforms.push({
      x: CANVAS_WIDTH / 2 - PLATFORM_WIDTH / 2,
      y: CANVAS_HEIGHT - 50,
      type: 'normal'
    });

    // Generate platforms going up
    for (let i = 1; i < 100; i++) {
      const y = CANVAS_HEIGHT - 50 - (i * 100);
      const x = Math.random() * (CANVAS_WIDTH - PLATFORM_WIDTH);
      
      let type = 'normal';
      const rand = Math.random();
      
      if (rand < 0.1) type = 'spring'; // 10% spring platforms
      else if (rand < 0.15) type = 'moving'; // 5% moving platforms
      else if (rand < 0.18) type = 'breakable'; // 3% breakable platforms

      newPlatforms.push({
        x,
        y,
        type,
        vx: type === 'moving' ? (Math.random() > 0.5 ? 1 : -1) : 0,
        broken: false
      });
    }
    
    setPlatforms(newPlatforms);
  }, []);

  const updateDoodle = useCallback(() => {
    if (!gameRunning || gameOver) return;

    setDoodle(prev => {
      let newX = prev.x;
      let newY = prev.y;
      let newVx = prev.vx;
      let newVy = prev.vy;
      let newDirection = prev.direction;

      // Horizontal movement
      if (keys.left) {
        newVx = Math.max(newVx - 0.5, -5);
        newDirection = 'left';
      } else if (keys.right) {
        newVx = Math.min(newVx + 0.5, 5);
        newDirection = 'right';
      } else {
        newVx *= 0.9; // Friction
      }

      newX += newVx;

      // Wrap around screen horizontally
      if (newX < -DOODLE_SIZE) newX = CANVAS_WIDTH;
      if (newX > CANVAS_WIDTH) newX = -DOODLE_SIZE;

      // Vertical movement
      newVy += GRAVITY;
      newY += newVy;

      // Platform collision (only when falling)
      if (newVy > 0) {
        platforms.forEach(platform => {
          if (!platform.broken &&
              newX + DOODLE_SIZE > platform.x &&
              newX < platform.x + PLATFORM_WIDTH &&
              newY + DOODLE_SIZE > platform.y &&
              newY + DOODLE_SIZE < platform.y + PLATFORM_HEIGHT + 10) {
            
            if (platform.type === 'spring') {
              newVy = JUMP_FORCE * 1.5; // Higher jump
            } else if (platform.type === 'breakable') {
              platform.broken = true;
              newVy = JUMP_FORCE;
            } else {
              newVy = JUMP_FORCE;
            }
          }
        });
      }

      return {
        x: newX,
        y: newY,
        vx: newVx,
        vy: newVy,
        direction: newDirection
      };
    });
  }, [gameRunning, gameOver, keys, platforms]);

  const updatePlatforms = useCallback(() => {
    if (!gameRunning || gameOver) return;

    setPlatforms(prev => 
      prev.map(platform => {
        if (platform.type === 'moving') {
          let newX = platform.x + platform.vx;
          let newVx = platform.vx;

          if (newX <= 0 || newX >= CANVAS_WIDTH - PLATFORM_WIDTH) {
            newVx = -newVx;
          }

          return { ...platform, x: newX, vx: newVx };
        }
        return platform;
      })
    );
  }, [gameRunning, gameOver]);

  const updateCamera = useCallback(() => {
    if (!gameRunning || gameOver) return;

    setCamera(prev => {
      const targetY = doodle.y - CANVAS_HEIGHT / 2;
      if (targetY < prev) {
        const newScore = Math.max(0, Math.floor((prev - targetY) / 10));
        setScore(prevScore => Math.max(prevScore, newScore));
        return targetY;
      }
      return prev;
    });

    // Check if doodle fell below camera view
    if (doodle.y > camera + CANVAS_HEIGHT + 100) {
      setGameOver(true);
      setGameRunning(false);
      if (score > highScore) {
        setHighScore(score);
        localStorage.setItem('doodle-jump-highscore', score.toString());
      }
    }
  }, [doodle.y, camera, gameRunning, gameOver, score, highScore]);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    
    // Clear canvas with gradient background
    const gradient = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
    gradient.addColorStop(0, '#87CEEB');
    gradient.addColorStop(1, '#E0F6FF');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Draw platforms
    platforms.forEach(platform => {
      const screenY = platform.y - camera;
      
      if (screenY > -PLATFORM_HEIGHT && screenY < CANVAS_HEIGHT + PLATFORM_HEIGHT) {
        if (!platform.broken) {
          switch (platform.type) {
            case 'spring':
              ctx.fillStyle = '#FF6B6B';
              break;
            case 'moving':
              ctx.fillStyle = '#4ECDC4';
              break;
            case 'breakable':
              ctx.fillStyle = '#FFE66D';
              break;
            default:
              ctx.fillStyle = '#95E1D3';
          }
          
          ctx.fillRect(platform.x, screenY, PLATFORM_WIDTH, PLATFORM_HEIGHT);
          
          // Add platform details
          if (platform.type === 'spring') {
            ctx.fillStyle = '#FF4757';
            ctx.fillRect(platform.x + 30, screenY - 5, 20, 5);
          } else if (platform.type === 'moving') {
            ctx.fillStyle = '#2ED573';
            ctx.fillRect(platform.x + 5, screenY + 2, PLATFORM_WIDTH - 10, 3);
          }
        }
      }
    });

    // Draw doodle
    const doodleScreenY = doodle.y - camera;
    ctx.fillStyle = '#FF6B6B';
    
    // Simple doodle shape
    ctx.beginPath();
    ctx.arc(doodle.x + DOODLE_SIZE/2, doodleScreenY + DOODLE_SIZE/2, DOODLE_SIZE/2, 0, 2 * Math.PI);
    ctx.fill();
    
    // Eyes
    ctx.fillStyle = '#FFF';
    ctx.beginPath();
    ctx.arc(doodle.x + 8, doodleScreenY + 8, 4, 0, 2 * Math.PI);
    ctx.arc(doodle.x + 22, doodleScreenY + 8, 4, 0, 2 * Math.PI);
    ctx.fill();
    
    ctx.fillStyle = '#000';
    ctx.beginPath();
    ctx.arc(doodle.x + 8, doodleScreenY + 8, 2, 0, 2 * Math.PI);
    ctx.arc(doodle.x + 22, doodleScreenY + 8, 2, 0, 2 * Math.PI);
    ctx.fill();

    // Score
    ctx.fillStyle = '#000';
    ctx.font = 'bold 20px Arial';
    ctx.fillText(`Score: ${score}`, 10, 30);
    ctx.fillText(`High: ${highScore}`, 10, 55);
  }, [doodle, platforms, camera, score, highScore]);

  const handleKeyDown = useCallback((event) => {
    switch (event.key) {
      case 'ArrowLeft':
      case 'a':
        event.preventDefault();
        setKeys(prev => ({ ...prev, left: true }));
        break;
      case 'ArrowRight':
      case 'd':
        event.preventDefault();
        setKeys(prev => ({ ...prev, right: true }));
        break;
    }
  }, []);

  const handleKeyUp = useCallback((event) => {
    switch (event.key) {
      case 'ArrowLeft':
      case 'a':
        event.preventDefault();
        setKeys(prev => ({ ...prev, left: false }));
        break;
      case 'ArrowRight':
      case 'd':
        event.preventDefault();
        setKeys(prev => ({ ...prev, right: false }));
        break;
    }
  }, []);

  const startGame = () => {
    setDoodle({
      x: CANVAS_WIDTH / 2,
      y: CANVAS_HEIGHT - 100,
      vx: 0,
      vy: 0,
      direction: 'right'
    });
    setCamera(0);
    setScore(0);
    setGameRunning(true);
    setGameOver(false);
    setKeys({ left: false, right: false });
    generatePlatforms();
  };

  const pauseGame = () => {
    setGameRunning(!gameRunning);
  };

  // Game loop
  useEffect(() => {
    if (!gameRunning || gameOver) return;

    const gameLoop = setInterval(() => {
      updateDoodle();
      updatePlatforms();
      updateCamera();
    }, 16); // ~60fps

    return () => clearInterval(gameLoop);
  }, [gameRunning, gameOver, updateDoodle, updatePlatforms, updateCamera]);

  // Drawing loop
  useEffect(() => {
    const drawLoop = setInterval(draw, 16);
    return () => clearInterval(drawLoop);
  }, [draw]);

  // Keyboard events
  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('keyup', handleKeyUp);
    };
  }, [handleKeyDown, handleKeyUp]);

  // Initialize platforms on mount
  useEffect(() => {
    generatePlatforms();
  }, [generatePlatforms]);

  return (
    <motion.div 
      className="doodle-jump-game"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="doodle-jump-container">
        <div className="doodle-jump-sidebar">
          <div className="doodle-jump-info">
            <h2>DOODLE JUMP</h2>
            <div className="score">Score: {score}</div>
            <div className="high-score">High Score: {highScore}</div>
          </div>
          
          <div className="doodle-jump-controls">
            {!gameRunning && !gameOver && (
              <button onClick={startGame} className="game-button start">
                Start Game
              </button>
            )}
            
            {gameRunning && (
              <button onClick={pauseGame} className="game-button pause">
                {gameRunning ? 'Pause' : 'Resume'}
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
          
          <div className="doodle-jump-legend">
            <h4>Platform Types:</h4>
            <div className="legend-item">
              <div className="legend-color normal"></div>
              <span>Normal - Regular jump</span>
            </div>
            <div className="legend-item">
              <div className="legend-color spring"></div>
              <span>Spring - High jump</span>
            </div>
            <div className="legend-item">
              <div className="legend-color moving"></div>
              <span>Moving - Moves left/right</span>
            </div>
            <div className="legend-item">
              <div className="legend-color breakable"></div>
              <span>Breakable - Breaks after use</span>
            </div>
          </div>
          
          <div className="doodle-jump-instructions">
            <h4>Controls:</h4>
            <p>← → or A/D: Move left/right</p>
            <p>Jump automatically when landing on platforms</p>
          </div>
        </div>
        
        <div className="doodle-jump-canvas-container">
          <canvas
            ref={canvasRef}
            width={CANVAS_WIDTH}
            height={CANVAS_HEIGHT}
            className="doodle-jump-canvas"
          />
          
          {/* Mobile controls */}
          <div className="mobile-controls">
            <button 
              className="mobile-btn left"
              onTouchStart={() => setKeys(prev => ({ ...prev, left: true }))}
              onTouchEnd={() => setKeys(prev => ({ ...prev, left: false }))}
              onMouseDown={() => setKeys(prev => ({ ...prev, left: true }))}
              onMouseUp={() => setKeys(prev => ({ ...prev, left: false }))}
            >
              ←
            </button>
            <button 
              className="mobile-btn right"
              onTouchStart={() => setKeys(prev => ({ ...prev, right: true }))}
              onTouchEnd={() => setKeys(prev => ({ ...prev, right: false }))}
              onMouseDown={() => setKeys(prev => ({ ...prev, right: true }))}
              onMouseUp={() => setKeys(prev => ({ ...prev, right: false }))}
            >
              →
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default DoodleJumpGame;