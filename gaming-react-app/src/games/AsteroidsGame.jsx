import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import './AsteroidsGame.css';

const AsteroidsGame = () => {
  const canvasRef = useRef(null);
  const CANVAS_WIDTH = 800;
  const CANVAS_HEIGHT = 600;

  const [ship, setShip] = useState({
    x: CANVAS_WIDTH / 2,
    y: CANVAS_HEIGHT / 2,
    angle: 0,
    vx: 0,
    vy: 0,
    thrust: false
  });
  const [bullets, setBullets] = useState([]);
  const [asteroids, setAsteroids] = useState([]);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [gameRunning, setGameRunning] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [level, setLevel] = useState(1);
  const [keys, setKeys] = useState({
    left: false,
    right: false,
    thrust: false,
    shoot: false
  });
  const [highScore, setHighScore] = useState(
    parseInt(localStorage.getItem('asteroids-highscore')) || 0
  );

  const generateAsteroids = useCallback((count = 4 + level) => {
    const newAsteroids = [];
    
    for (let i = 0; i < count; i++) {
      // Spawn asteroids away from ship
      let x, y;
      do {
        x = Math.random() * CANVAS_WIDTH;
        y = Math.random() * CANVAS_HEIGHT;
      } while (
        Math.sqrt((x - ship.x) ** 2 + (y - ship.y) ** 2) < 100
      );

      newAsteroids.push({
        x,
        y,
        vx: (Math.random() - 0.5) * 2,
        vy: (Math.random() - 0.5) * 2,
        angle: Math.random() * Math.PI * 2,
        rotation: (Math.random() - 0.5) * 0.1,
        size: 'large',
        radius: 40
      });
    }
    
    setAsteroids(newAsteroids);
  }, [level, ship.x, ship.y]);

  const updateShip = useCallback(() => {
    if (!gameRunning || gameOver) return;

    setShip(prev => {
      let newAngle = prev.angle;
      let newVx = prev.vx;
      let newVy = prev.vy;
      let newX = prev.x;
      let newY = prev.y;

      // Rotation
      if (keys.left) newAngle -= 0.15;
      if (keys.right) newAngle += 0.15;

      // Thrust
      if (keys.thrust) {
        const thrustPower = 0.3;
        newVx += Math.cos(newAngle) * thrustPower;
        newVy += Math.sin(newAngle) * thrustPower;
      }

      // Apply friction
      newVx *= 0.99;
      newVy *= 0.99;

      // Limit velocity
      const maxSpeed = 8;
      const speed = Math.sqrt(newVx ** 2 + newVy ** 2);
      if (speed > maxSpeed) {
        newVx = (newVx / speed) * maxSpeed;
        newVy = (newVy / speed) * maxSpeed;
      }

      // Update position
      newX += newVx;
      newY += newVy;

      // Wrap around screen
      if (newX < 0) newX = CANVAS_WIDTH;
      if (newX > CANVAS_WIDTH) newX = 0;
      if (newY < 0) newY = CANVAS_HEIGHT;
      if (newY > CANVAS_HEIGHT) newY = 0;

      return {
        x: newX,
        y: newY,
        angle: newAngle,
        vx: newVx,
        vy: newVy,
        thrust: keys.thrust
      };
    });
  }, [keys, gameRunning, gameOver]);

  const updateBullets = useCallback(() => {
    if (!gameRunning || gameOver) return;

    setBullets(prev => 
      prev.map(bullet => ({
        ...bullet,
        x: bullet.x + bullet.vx,
        y: bullet.y + bullet.vy,
        life: bullet.life - 1
      })).filter(bullet => 
        bullet.life > 0 && 
        bullet.x > 0 && bullet.x < CANVAS_WIDTH &&
        bullet.y > 0 && bullet.y < CANVAS_HEIGHT
      )
    );
  }, [gameRunning, gameOver]);

  const updateAsteroids = useCallback(() => {
    if (!gameRunning || gameOver) return;

    setAsteroids(prev => 
      prev.map(asteroid => {
        let newX = asteroid.x + asteroid.vx;
        let newY = asteroid.y + asteroid.vy;

        // Wrap around screen
        if (newX < 0) newX = CANVAS_WIDTH;
        if (newX > CANVAS_WIDTH) newX = 0;
        if (newY < 0) newY = CANVAS_HEIGHT;
        if (newY > CANVAS_HEIGHT) newY = 0;

        return {
          ...asteroid,
          x: newX,
          y: newY,
          angle: asteroid.angle + asteroid.rotation
        };
      })
    );
  }, [gameRunning, gameOver]);

  const shootBullet = useCallback(() => {
    if (!gameRunning || gameOver) return;

    setBullets(prev => {
      // Limit bullets on screen
      if (prev.length >= 4) return prev;

      const bulletSpeed = 10;
      const newBullet = {
        x: ship.x,
        y: ship.y,
        vx: Math.cos(ship.angle) * bulletSpeed,
        vy: Math.sin(ship.angle) * bulletSpeed,
        life: 60 // 1 second at 60fps
      };

      return [...prev, newBullet];
    });
  }, [ship, gameRunning, gameOver]);

  const checkCollisions = useCallback(() => {
    if (!gameRunning || gameOver) return;

    // Bullet-asteroid collisions
    setBullets(prevBullets => {
      const remainingBullets = [];

      prevBullets.forEach(bullet => {
        let bulletHit = false;

        setAsteroids(prevAsteroids => {
          const newAsteroids = [];

          prevAsteroids.forEach(asteroid => {
            const dx = bullet.x - asteroid.x;
            const dy = bullet.y - asteroid.y;
            const distance = Math.sqrt(dx ** 2 + dy ** 2);

            if (distance < asteroid.radius && !bulletHit) {
              bulletHit = true;
              
              // Score points
              let points = 0;
              if (asteroid.size === 'large') points = 20;
              else if (asteroid.size === 'medium') points = 50;
              else points = 100;
              
              setScore(prev => prev + points);

              // Break asteroid into smaller pieces
              if (asteroid.size === 'large') {
                for (let i = 0; i < 2; i++) {
                  newAsteroids.push({
                    x: asteroid.x,
                    y: asteroid.y,
                    vx: (Math.random() - 0.5) * 3,
                    vy: (Math.random() - 0.5) * 3,
                    angle: Math.random() * Math.PI * 2,
                    rotation: (Math.random() - 0.5) * 0.15,
                    size: 'medium',
                    radius: 20
                  });
                }
              } else if (asteroid.size === 'medium') {
                for (let i = 0; i < 2; i++) {
                  newAsteroids.push({
                    x: asteroid.x,
                    y: asteroid.y,
                    vx: (Math.random() - 0.5) * 4,
                    vy: (Math.random() - 0.5) * 4,
                    angle: Math.random() * Math.PI * 2,
                    rotation: (Math.random() - 0.5) * 0.2,
                    size: 'small',
                    radius: 10
                  });
                }
              }
            } else {
              newAsteroids.push(asteroid);
            }
          });

          return newAsteroids;
        });

        if (!bulletHit) {
          remainingBullets.push(bullet);
        }
      });

      return remainingBullets;
    });

    // Ship-asteroid collisions
    const shipHit = asteroids.some(asteroid => {
      const dx = ship.x - asteroid.x;
      const dy = ship.y - asteroid.y;
      const distance = Math.sqrt(dx ** 2 + dy ** 2);
      return distance < asteroid.radius + 10; // Ship radius ~10
    });

    if (shipHit) {
      setLives(prev => {
        const newLives = prev - 1;
        if (newLives <= 0) {
          setGameOver(true);
          setGameRunning(false);
          if (score > highScore) {
            setHighScore(score);
            localStorage.setItem('asteroids-highscore', score.toString());
          }
        } else {
          // Reset ship position
          setShip(prev => ({
            ...prev,
            x: CANVAS_WIDTH / 2,
            y: CANVAS_HEIGHT / 2,
            vx: 0,
            vy: 0
          }));
        }
        return newLives;
      });
    }

    // Check if all asteroids destroyed
    if (asteroids.length === 0) {
      setLevel(prev => prev + 1);
      generateAsteroids();
    }
  }, [ship, asteroids, bullets, gameRunning, gameOver, score, highScore, generateAsteroids]);

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
      case 'ArrowUp':
      case 'w':
        event.preventDefault();
        setKeys(prev => ({ ...prev, thrust: true }));
        break;
      case ' ':
        event.preventDefault();
        if (!keys.shoot) {
          setKeys(prev => ({ ...prev, shoot: true }));
          shootBullet();
        }
        break;
    }
  }, [keys.shoot, shootBullet]);

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
      case 'ArrowUp':
      case 'w':
        event.preventDefault();
        setKeys(prev => ({ ...prev, thrust: false }));
        break;
      case ' ':
        event.preventDefault();
        setKeys(prev => ({ ...prev, shoot: false }));
        break;
    }
  }, []);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    
    // Clear canvas with space background
    ctx.fillStyle = '#000011';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Draw stars
    ctx.fillStyle = '#FFFFFF';
    for (let i = 0; i < 100; i++) {
      const x = (i * 37) % CANVAS_WIDTH;
      const y = (i * 73) % CANVAS_HEIGHT;
      ctx.fillRect(x, y, 1, 1);
    }

    // Draw ship
    ctx.save();
    ctx.translate(ship.x, ship.y);
    ctx.rotate(ship.angle);
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(15, 0);
    ctx.lineTo(-10, -8);
    ctx.lineTo(-5, 0);
    ctx.lineTo(-10, 8);
    ctx.closePath();
    ctx.stroke();

    // Draw thrust
    if (ship.thrust) {
      ctx.strokeStyle = '#FF6B6B';
      ctx.beginPath();
      ctx.moveTo(-5, 0);
      ctx.lineTo(-15, 0);
      ctx.stroke();
    }
    ctx.restore();

    // Draw bullets
    ctx.fillStyle = '#FFFF00';
    bullets.forEach(bullet => {
      ctx.beginPath();
      ctx.arc(bullet.x, bullet.y, 2, 0, 2 * Math.PI);
      ctx.fill();
    });

    // Draw asteroids
    asteroids.forEach(asteroid => {
      ctx.save();
      ctx.translate(asteroid.x, asteroid.y);
      ctx.rotate(asteroid.angle);
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 2;
      ctx.beginPath();
      
      const sides = 8;
      for (let i = 0; i <= sides; i++) {
        const angle = (i / sides) * Math.PI * 2;
        const radiusVariation = asteroid.radius + Math.sin(angle * 3) * 5;
        const x = Math.cos(angle) * radiusVariation;
        const y = Math.sin(angle) * radiusVariation;
        
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      
      ctx.stroke();
      ctx.restore();
    });

    // Draw UI
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '20px Arial';
    ctx.fillText(`Score: ${score}`, 20, 30);
    ctx.fillText(`Lives: ${lives}`, 20, 55);
    ctx.fillText(`Level: ${level}`, 20, 80);
    ctx.fillText(`High Score: ${highScore}`, CANVAS_WIDTH - 200, 30);
  }, [ship, bullets, asteroids, score, lives, level, highScore]);

  const startGame = () => {
    setShip({
      x: CANVAS_WIDTH / 2,
      y: CANVAS_HEIGHT / 2,
      angle: 0,
      vx: 0,
      vy: 0,
      thrust: false
    });
    setBullets([]);
    setScore(0);
    setLives(3);
    setLevel(1);
    setGameRunning(true);
    setGameOver(false);
    setKeys({ left: false, right: false, thrust: false, shoot: false });
    generateAsteroids(4);
  };

  const pauseGame = () => {
    setGameRunning(!gameRunning);
  };

  // Game loop
  useEffect(() => {
    if (!gameRunning || gameOver) return;

    const gameLoop = setInterval(() => {
      updateShip();
      updateBullets();
      updateAsteroids();
      checkCollisions();
    }, 16); // ~60fps

    return () => clearInterval(gameLoop);
  }, [gameRunning, gameOver, updateShip, updateBullets, updateAsteroids, checkCollisions]);

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

  return (
    <motion.div 
      className="asteroids-game"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="asteroids-container">
        <div className="asteroids-sidebar">
          <div className="asteroids-info">
            <h2>ASTEROIDS</h2>
            <div className="score">Score: {score}</div>
            <div className="high-score">High Score: {highScore}</div>
            <div className="lives">Lives: {lives}</div>
            <div className="level">Level: {level}</div>
          </div>
          
          <div className="asteroids-controls">
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
          
          <div className="asteroids-instructions">
            <h4>Controls:</h4>
            <p>← → or A/D: Rotate ship</p>
            <p>↑ or W: Thrust</p>
            <p>Space: Shoot</p>
            <br />
            <h4>Scoring:</h4>
            <p>Large asteroid: 20 pts</p>
            <p>Medium asteroid: 50 pts</p>
            <p>Small asteroid: 100 pts</p>
          </div>
        </div>
        
        <div className="asteroids-canvas-container">
          <canvas
            ref={canvasRef}
            width={CANVAS_WIDTH}
            height={CANVAS_HEIGHT}
            className="asteroids-canvas"
          />
        </div>
      </div>
    </motion.div>
  );
};

export default AsteroidsGame;