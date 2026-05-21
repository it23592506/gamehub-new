import React, { useState, useEffect, useCallback, useRef } from 'react';
import './SpaceInvadersGame.css';

const SpaceInvadersGame = () => {
  const canvasRef = useRef(null);
  const gameLoopRef = useRef(null);
  
  // Game state
  const [gameRunning, setGameRunning] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [level, setLevel] = useState(1);
  const [highScore, setHighScore] = useState(0);

  // Game objects
  const [player, setPlayer] = useState({ x: 375, y: 550, width: 50, height: 30 });
  const [bullets, setBullets] = useState([]);
  const [enemies, setEnemies] = useState([]);
  const [enemyBullets, setEnemyBullets] = useState([]);
  const [powerUps, setPowerUps] = useState([]);

  // Game constants
  const CANVAS_WIDTH = 800;
  const CANVAS_HEIGHT = 600;
  const PLAYER_SPEED = 5;
  const BULLET_SPEED = 7;
  const ENEMY_SPEED = 1;
  const ENEMY_BULLET_SPEED = 3;

  // Load high score
  useEffect(() => {
    const savedHighScore = localStorage.getItem('spaceInvadersHighScore');
    if (savedHighScore) {
      setHighScore(parseInt(savedHighScore));
    }
  }, []);

  // Save high score
  const saveHighScore = (newScore) => {
    if (newScore > highScore) {
      setHighScore(newScore);
      localStorage.setItem('spaceInvadersHighScore', newScore.toString());
    }
  };

  // Create enemy grid
  const createEnemies = useCallback(() => {
    const newEnemies = [];
    const rows = 5;
    const cols = 10;
    const enemyWidth = 40;
    const enemyHeight = 30;
    const enemySpacing = 60;
    const startX = 100;
    const startY = 50;

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        newEnemies.push({
          x: startX + col * enemySpacing,
          y: startY + row * 50,
          width: enemyWidth,
          height: enemyHeight,
          type: row < 2 ? 'fast' : row < 4 ? 'medium' : 'slow',
          alive: true
        });
      }
    }
    return newEnemies;
  }, []);

  // Initialize game
  const initializeGame = useCallback(() => {
    setPlayer({ x: 375, y: 550, width: 50, height: 30 });
    setBullets([]);
    setEnemies(createEnemies());
    setEnemyBullets([]);
    setPowerUps([]);
    setScore(0);
    setLives(3);
    setLevel(1);
    setGameOver(false);
  }, [createEnemies]);

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
  const handleKeyPress = useCallback((event) => {
    if (!gameRunning || gameOver) return;

    switch (event.key) {
      case 'ArrowLeft':
      case 'a':
      case 'A':
        event.preventDefault();
        setPlayer(prev => ({ 
          ...prev, 
          x: Math.max(0, prev.x - PLAYER_SPEED) 
        }));
        break;
      case 'ArrowRight':
      case 'd':
      case 'D':
        event.preventDefault();
        setPlayer(prev => ({ 
          ...prev, 
          x: Math.min(CANVAS_WIDTH - prev.width, prev.x + PLAYER_SPEED) 
        }));
        break;
      case ' ':
      case 'ArrowUp':
      case 'w':
      case 'W':
        event.preventDefault();
        setBullets(prev => [...prev, {
          x: player.x + player.width / 2 - 2,
          y: player.y,
          width: 4,
          height: 10,
          speed: BULLET_SPEED
        }]);
        break;
      default:
        break;
    }
  }, [gameRunning, gameOver, player]);

  // Add keyboard event listeners
  useEffect(() => {
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [handleKeyPress]);

  // Collision detection
  const checkCollision = (rect1, rect2) => {
    return rect1.x < rect2.x + rect2.width &&
           rect1.x + rect1.width > rect2.x &&
           rect1.y < rect2.y + rect2.height &&
           rect1.y + rect1.height > rect2.y;
  };

  // Game loop
  const gameLoop = useCallback(() => {
    if (!gameRunning || gameOver) return;

    // Move bullets
    setBullets(prev => prev
      .map(bullet => ({ ...bullet, y: bullet.y - bullet.speed }))
      .filter(bullet => bullet.y > -bullet.height)
    );

    // Move enemy bullets
    setEnemyBullets(prev => prev
      .map(bullet => ({ ...bullet, y: bullet.y + bullet.speed }))
      .filter(bullet => bullet.y < CANVAS_HEIGHT)
    );

    // Move enemies
    setEnemies(prev => {
      let shouldMoveDown = false;
      const newEnemies = prev.map(enemy => {
        if (!enemy.alive) return enemy;
        
        const newX = enemy.x + ENEMY_SPEED;
        if (newX <= 0 || newX >= CANVAS_WIDTH - enemy.width) {
          shouldMoveDown = true;
        }
        return enemy;
      });

      if (shouldMoveDown) {
        return newEnemies.map(enemy => ({
          ...enemy,
          x: enemy.x,
          y: enemy.y + 30
        }));
      } else {
        return newEnemies.map(enemy => ({
          ...enemy,
          x: enemy.x + ENEMY_SPEED
        }));
      }
    });

    // Enemy shooting
    setEnemies(prev => {
      const shootingEnemies = prev.filter(enemy => enemy.alive && Math.random() < 0.001);
      if (shootingEnemies.length > 0) {
        const shooter = shootingEnemies[0];
        setEnemyBullets(prevBullets => [...prevBullets, {
          x: shooter.x + shooter.width / 2 - 2,
          y: shooter.y + shooter.height,
          width: 4,
          height: 10,
          speed: ENEMY_BULLET_SPEED
        }]);
      }
      return prev;
    });

    // Check bullet-enemy collisions
    setBullets(prevBullets => {
      const remainingBullets = [];
      const hitEnemies = [];

      prevBullets.forEach(bullet => {
        let hit = false;
        setEnemies(prevEnemies => {
          return prevEnemies.map(enemy => {
            if (enemy.alive && checkCollision(bullet, enemy)) {
              hit = true;
              hitEnemies.push(enemy);
              return { ...enemy, alive: false };
            }
            return enemy;
          });
        });

        if (!hit) {
          remainingBullets.push(bullet);
        }
      });

      // Update score
      if (hitEnemies.length > 0) {
        setScore(prev => {
          const newScore = prev + hitEnemies.length * 10;
          saveHighScore(newScore);
          return newScore;
        });
      }

      return remainingBullets;
    });

    // Check enemy bullet-player collisions
    setEnemyBullets(prevBullets => {
      return prevBullets.filter(bullet => {
        if (checkCollision(bullet, player)) {
          setLives(prev => {
            const newLives = prev - 1;
            if (newLives <= 0) {
              setGameOver(true);
              setGameRunning(false);
            }
            return newLives;
          });
          return false;
        }
        return true;
      });
    });

    // Check if all enemies are defeated
    setEnemies(prev => {
      const aliveEnemies = prev.filter(enemy => enemy.alive);
      if (aliveEnemies.length === 0) {
        // Next level
        setLevel(prevLevel => prevLevel + 1);
        setTimeout(() => {
          setEnemies(createEnemies());
        }, 1000);
      }
      return prev;
    });

    // Check if enemies reached player
    setEnemies(prev => {
      const hasReachedPlayer = prev.some(enemy => 
        enemy.alive && enemy.y + enemy.height >= player.y
      );
      if (hasReachedPlayer) {
        setGameOver(true);
        setGameRunning(false);
      }
      return prev;
    });

  }, [gameRunning, gameOver, player, createEnemies]);

  // Game loop effect
  useEffect(() => {
    if (gameRunning && !gameOver) {
      gameLoopRef.current = setInterval(gameLoop, 1000/60); // 60 FPS
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
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Draw stars background
    ctx.fillStyle = '#fff';
    for (let i = 0; i < 100; i++) {
      const x = (i * 37) % CANVAS_WIDTH;
      const y = (i * 73) % CANVAS_HEIGHT;
      ctx.fillRect(x, y, 1, 1);
    }

    // Draw player
    ctx.fillStyle = '#00d4ff';
    ctx.fillRect(player.x, player.y, player.width, player.height);
    
    // Draw player bullets
    ctx.fillStyle = '#ffff00';
    bullets.forEach(bullet => {
      ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
    });

    // Draw enemies
    enemies.forEach(enemy => {
      if (enemy.alive) {
        switch (enemy.type) {
          case 'fast':
            ctx.fillStyle = '#ff0000';
            break;
          case 'medium':
            ctx.fillStyle = '#ff8800';
            break;
          case 'slow':
            ctx.fillStyle = '#00ff00';
            break;
          default:
            ctx.fillStyle = '#ffffff';
        }
        ctx.fillRect(enemy.x, enemy.y, enemy.width, enemy.height);
      }
    });

    // Draw enemy bullets
    ctx.fillStyle = '#ff0066';
    enemyBullets.forEach(bullet => {
      ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
    });

  }, [player, bullets, enemies, enemyBullets]);

  // Mobile controls
  const moveLeft = () => {
    if (gameRunning && !gameOver) {
      setPlayer(prev => ({ 
        ...prev, 
        x: Math.max(0, prev.x - PLAYER_SPEED * 2) 
      }));
    }
  };

  const moveRight = () => {
    if (gameRunning && !gameOver) {
      setPlayer(prev => ({ 
        ...prev, 
        x: Math.min(CANVAS_WIDTH - prev.width, prev.x + PLAYER_SPEED * 2) 
      }));
    }
  };

  const shoot = () => {
    if (gameRunning && !gameOver) {
      setBullets(prev => [...prev, {
        x: player.x + player.width / 2 - 2,
        y: player.y,
        width: 4,
        height: 10,
        speed: BULLET_SPEED
      }]);
    }
  };

  return (
    <div className="space-invaders-game">
      <div className="game-header">
        <h2>Space Invaders</h2>
        <div className="game-stats">
          <div className="stat">
            <span className="stat-label">Score</span>
            <span className="stat-value">{score.toLocaleString()}</span>
          </div>
          <div className="stat">
            <span className="stat-label">Lives</span>
            <span className="stat-value">{lives}</span>
          </div>
          <div className="stat">
            <span className="stat-label">Level</span>
            <span className="stat-value">{level}</span>
          </div>
          <div className="stat">
            <span className="stat-label">High Score</span>
            <span className="stat-value">{highScore.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {gameOver && (
        <div className="game-over">
          <h3>Game Over!</h3>
          <p>Final Score: {score.toLocaleString()}</p>
          <p>Level Reached: {level}</p>
          {score === highScore && score > 0 && (
            <p className="new-high-score">🏆 New High Score!</p>
          )}
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
          <button className="control-btn shoot" onClick={shoot}>
            🚀 SHOOT
          </button>
        </div>
        <div className="control-row">
          <button className="control-btn move" onClick={moveLeft}>
            ← LEFT
          </button>
          <button className="control-btn move" onClick={moveRight}>
            RIGHT →
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
        <p>• Use arrow keys or A/D to move left/right</p>
        <p>• Press spacebar, up arrow, or W to shoot</p>
        <p>• Destroy all enemies to advance to the next level</p>
        <p>• Avoid enemy bullets and don't let enemies reach you</p>
        <p>• Red enemies: 10 points, Orange: 10 points, Green: 10 points</p>
      </div>
    </div>
  );
};

export default SpaceInvadersGame;