import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Crosshair, 
  Shield, 
  Heart, 
  Zap, 
  Users, 
  Crown, 
  Target,
  Gauge,
  Trophy,
  MapPin,
  Timer,
  Swords,
  Settings
} from 'lucide-react';
import './BattleRoyaleGame.css';

const BattleRoyaleGame = () => {
  const canvasRef = useRef(null);
  const gameLoopRef = useRef(null);
  const [gameState, setGameState] = useState('menu'); // menu, lobby, playing, gameOver
  const [playerStats, setPlayerStats] = useState({
    health: 100,
    armor: 100,
    ammo: 30,
    kills: 0,
    position: { x: 400, y: 300 },
    weapon: 'assault_rifle',
    inventory: []
  });
  const [gameStats, setGameStats] = useState({
    playersAlive: 100,
    playersTotal: 100,
    zone: { x: 0, y: 0, radius: 500, shrinking: false },
    timeLeft: 300,
    rank: 1,
    match: 1
  });
  const [enemies, setEnemies] = useState([]);
  const [bullets, setBullets] = useState([]);
  const [powerUps, setPowerUps] = useState([]);
  const [explosions, setExplosions] = useState([]);
  const [keys, setKeys] = useState({});
  const [mouse, setMouse] = useState({ x: 0, y: 0, clicked: false });
  const [leaderboard, setLeaderboard] = useState([
    { name: "ProGamer2025", kills: 12, rank: 1 },
    { name: "BattleMaster", kills: 9, rank: 2 },
    { name: "WarriorX", kills: 8, rank: 3 },
    { name: "You", kills: 0, rank: 100 }
  ]);

  const weapons = {
    assault_rifle: { damage: 25, fireRate: 150, ammo: 30, range: 300, name: "AR-15" },
    sniper: { damage: 80, fireRate: 800, ammo: 5, range: 500, name: "Sniper" },
    shotgun: { damage: 60, fireRate: 600, ammo: 8, range: 100, name: "Shotgun" },
    pistol: { damage: 15, fireRate: 100, ammo: 15, range: 200, name: "Pistol" }
  };

  // Initialize game
  useEffect(() => {
    generateEnemies();
    generatePowerUps();
    const interval = setInterval(() => {
      setGameStats(prev => ({
        ...prev,
        timeLeft: Math.max(0, prev.timeLeft - 1)
      }));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Game loop
  useEffect(() => {
    if (gameState === 'playing') {
      gameLoopRef.current = setInterval(() => {
        updateGame();
        render();
      }, 16);
    } else {
      clearInterval(gameLoopRef.current);
    }
    return () => clearInterval(gameLoopRef.current);
  }, [gameState, keys, mouse]);

  // Input handling
  useEffect(() => {
    const handleKeyDown = (e) => {
      setKeys(prev => ({ ...prev, [e.key.toLowerCase()]: true }));
    };
    const handleKeyUp = (e) => {
      setKeys(prev => ({ ...prev, [e.key.toLowerCase()]: false }));
    };
    const handleMouseMove = (e) => {
      const canvas = canvasRef.current;
      if (canvas) {
        const rect = canvas.getBoundingClientRect();
        setMouse(prev => ({
          ...prev,
          x: e.clientX - rect.left,
          y: e.clientY - rect.top
        }));
      }
    };
    const handleMouseDown = () => setMouse(prev => ({ ...prev, clicked: true }));
    const handleMouseUp = () => setMouse(prev => ({ ...prev, clicked: false }));

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  const generateEnemies = () => {
    const newEnemies = [];
    for (let i = 0; i < 20; i++) {
      newEnemies.push({
        id: i,
        x: Math.random() * 800,
        y: Math.random() * 600,
        health: 100,
        weapon: Object.keys(weapons)[Math.floor(Math.random() * 4)],
        ai: {
          target: null,
          lastShot: 0,
          moveDirection: Math.random() * Math.PI * 2
        }
      });
    }
    setEnemies(newEnemies);
  };

  const generatePowerUps = () => {
    const newPowerUps = [];
    const types = ['health', 'armor', 'ammo', 'weapon'];
    for (let i = 0; i < 10; i++) {
      newPowerUps.push({
        id: i,
        x: Math.random() * 800,
        y: Math.random() * 600,
        type: types[Math.floor(Math.random() * types.length)],
        respawnTime: 0
      });
    }
    setPowerUps(newPowerUps);
  };

  const updateGame = () => {
    // Update player position
    setPlayerStats(prev => {
      let newX = prev.position.x;
      let newY = prev.position.y;
      const speed = 3;

      if (keys['w'] || keys['arrowup']) newY -= speed;
      if (keys['s'] || keys['arrowdown']) newY += speed;
      if (keys['a'] || keys['arrowleft']) newX -= speed;
      if (keys['d'] || keys['arrowright']) newX += speed;

      // Boundary checking
      newX = Math.max(10, Math.min(790, newX));
      newY = Math.max(10, Math.min(590, newY));

      return { ...prev, position: { x: newX, y: newY } };
    });

    // Handle shooting
    if (mouse.clicked && playerStats.ammo > 0) {
      shoot();
    }

    // Update enemies AI
    updateEnemiesAI();

    // Update bullets
    updateBullets();

    // Check collisions
    checkCollisions();

    // Update zone
    updateZone();

    // Update game statistics
    updateGameStats();
  };

  const shoot = useCallback(() => {
    if (playerStats.ammo <= 0) return;

    const angle = Math.atan2(
      mouse.y - playerStats.position.y,
      mouse.x - playerStats.position.x
    );

    setBullets(prev => [...prev, {
      id: Date.now(),
      x: playerStats.position.x,
      y: playerStats.position.y,
      dx: Math.cos(angle) * 8,
      dy: Math.sin(angle) * 8,
      damage: weapons[playerStats.weapon].damage,
      owner: 'player',
      life: weapons[playerStats.weapon].range / 8
    }]);

    setPlayerStats(prev => ({ ...prev, ammo: prev.ammo - 1 }));
  }, [mouse, playerStats]);

  const updateEnemiesAI = () => {
    setEnemies(prev => prev.map(enemy => {
      const distToPlayer = Math.sqrt(
        Math.pow(enemy.x - playerStats.position.x, 2) +
        Math.pow(enemy.y - playerStats.position.y, 2)
      );

      // AI behavior
      if (distToPlayer < 200) {
        // Attack player
        const angle = Math.atan2(
          playerStats.position.y - enemy.y,
          playerStats.position.x - enemy.x
        );
        
        if (Date.now() - enemy.ai.lastShot > weapons[enemy.weapon].fireRate) {
          setBullets(prev => [...prev, {
            id: Date.now() + enemy.id,
            x: enemy.x,
            y: enemy.y,
            dx: Math.cos(angle) * 6,
            dy: Math.sin(angle) * 6,
            damage: weapons[enemy.weapon].damage,
            owner: 'enemy',
            life: weapons[enemy.weapon].range / 6
          }]);
          enemy.ai.lastShot = Date.now();
        }
      } else {
        // Random movement
        enemy.x += Math.cos(enemy.ai.moveDirection) * 1;
        enemy.y += Math.sin(enemy.ai.moveDirection) * 1;
        
        if (Math.random() < 0.02) {
          enemy.ai.moveDirection = Math.random() * Math.PI * 2;
        }
      }

      // Boundary checking
      enemy.x = Math.max(10, Math.min(790, enemy.x));
      enemy.y = Math.max(10, Math.min(590, enemy.y));

      return enemy;
    }));
  };

  const updateBullets = () => {
    setBullets(prev => prev.filter(bullet => {
      bullet.x += bullet.dx;
      bullet.y += bullet.dy;
      bullet.life--;
      
      return bullet.life > 0 && 
             bullet.x > 0 && bullet.x < 800 && 
             bullet.y > 0 && bullet.y < 600;
    }));
  };

  const checkCollisions = () => {
    // Bullet vs Player
    setBullets(prev => prev.filter(bullet => {
      if (bullet.owner === 'enemy') {
        const dist = Math.sqrt(
          Math.pow(bullet.x - playerStats.position.x, 2) +
          Math.pow(bullet.y - playerStats.position.y, 2)
        );
        
        if (dist < 20) {
          setPlayerStats(prev => ({
            ...prev,
            health: Math.max(0, prev.health - bullet.damage)
          }));
          return false;
        }
      }
      return true;
    }));

    // Bullet vs Enemies
    setBullets(prev => prev.filter(bullet => {
      if (bullet.owner === 'player') {
        let hit = false;
        setEnemies(prevEnemies => prevEnemies.filter(enemy => {
          const dist = Math.sqrt(
            Math.pow(bullet.x - enemy.x, 2) +
            Math.pow(bullet.y - enemy.y, 2)
          );
          
          if (dist < 20) {
            hit = true;
            enemy.health -= bullet.damage;
            
            if (enemy.health <= 0) {
              setPlayerStats(prev => ({ ...prev, kills: prev.kills + 1 }));
              setGameStats(prev => ({ ...prev, playersAlive: prev.playersAlive - 1 }));
              
              // Add explosion effect
              setExplosions(prev => [...prev, {
                x: enemy.x,
                y: enemy.y,
                time: Date.now()
              }]);
              
              return false;
            }
          }
          return true;
        }));
        return !hit;
      }
      return true;
    }));

    // Player vs PowerUps
    setPowerUps(prev => prev.map(powerUp => {
      if (powerUp.respawnTime <= Date.now()) {
        const dist = Math.sqrt(
          Math.pow(powerUp.x - playerStats.position.x, 2) +
          Math.pow(powerUp.y - playerStats.position.y, 2)
        );
        
        if (dist < 30) {
          collectPowerUp(powerUp);
          return { ...powerUp, respawnTime: Date.now() + 30000 };
        }
      }
      return powerUp;
    }));
  };

  const collectPowerUp = (powerUp) => {
    setPlayerStats(prev => {
      switch (powerUp.type) {
        case 'health':
          return { ...prev, health: Math.min(100, prev.health + 50) };
        case 'armor':
          return { ...prev, armor: Math.min(100, prev.armor + 50) };
        case 'ammo':
          return { ...prev, ammo: prev.ammo + 30 };
        case 'weapon':
          const weaponKeys = Object.keys(weapons);
          const newWeapon = weaponKeys[Math.floor(Math.random() * weaponKeys.length)];
          return { ...prev, weapon: newWeapon, ammo: weapons[newWeapon].ammo };
        default:
          return prev;
      }
    });
  };

  const updateZone = () => {
    setGameStats(prev => {
      if (prev.timeLeft < 200 && !prev.zone.shrinking) {
        return { ...prev, zone: { ...prev.zone, shrinking: true } };
      }
      
      if (prev.zone.shrinking && prev.zone.radius > 100) {
        const newRadius = prev.zone.radius - 0.5;
        
        // Damage player if outside zone
        const distFromCenter = Math.sqrt(
          Math.pow(playerStats.position.x - 400, 2) +
          Math.pow(playerStats.position.y - 300, 2)
        );
        
        if (distFromCenter > newRadius) {
          setPlayerStats(prevPlayer => ({
            ...prevPlayer,
            health: Math.max(0, prevPlayer.health - 1)
          }));
        }
        
        return { ...prev, zone: { ...prev.zone, radius: newRadius } };
      }
      
      return prev;
    });
  };

  const updateGameStats = () => {
    // Check win condition
    if (gameStats.playersAlive <= 1 && gameState === 'playing') {
      setGameState('gameOver');
      setGameStats(prev => ({ ...prev, rank: 1 }));
    }
    
    // Check lose condition
    if (playerStats.health <= 0 && gameState === 'playing') {
      setGameState('gameOver');
    }
  };

  const render = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, 800, 600);
    
    // Render background
    ctx.fillStyle = '#2a4d3a';
    ctx.fillRect(0, 0, 800, 600);
    
    // Render zone
    ctx.strokeStyle = gameStats.zone.shrinking ? '#ff4444' : '#4444ff';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(400, 300, gameStats.zone.radius, 0, Math.PI * 2);
    ctx.stroke();
    
    // Render power-ups
    powerUps.forEach(powerUp => {
      if (powerUp.respawnTime <= Date.now()) {
        ctx.fillStyle = powerUp.type === 'health' ? '#00ff00' :
                       powerUp.type === 'armor' ? '#0088ff' :
                       powerUp.type === 'ammo' ? '#ffaa00' : '#ff00ff';
        ctx.fillRect(powerUp.x - 8, powerUp.y - 8, 16, 16);
      }
    });
    
    // Render enemies
    enemies.forEach(enemy => {
      ctx.fillStyle = '#ff4444';
      ctx.fillRect(enemy.x - 10, enemy.y - 10, 20, 20);
      
      // Health bar
      ctx.fillStyle = '#ff0000';
      ctx.fillRect(enemy.x - 15, enemy.y - 20, 30, 4);
      ctx.fillStyle = '#00ff00';
      ctx.fillRect(enemy.x - 15, enemy.y - 20, (enemy.health / 100) * 30, 4);
    });
    
    // Render player
    ctx.fillStyle = '#00ff00';
    ctx.fillRect(playerStats.position.x - 10, playerStats.position.y - 10, 20, 20);
    
    // Render crosshair
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(mouse.x - 10, mouse.y);
    ctx.lineTo(mouse.x + 10, mouse.y);
    ctx.moveTo(mouse.x, mouse.y - 10);
    ctx.lineTo(mouse.x, mouse.y + 10);
    ctx.stroke();
    
    // Render bullets
    bullets.forEach(bullet => {
      ctx.fillStyle = bullet.owner === 'player' ? '#ffff00' : '#ff8800';
      ctx.fillRect(bullet.x - 2, bullet.y - 2, 4, 4);
    });
    
    // Render explosions
    setExplosions(prev => prev.filter(explosion => {
      const age = Date.now() - explosion.time;
      if (age < 500) {
        const opacity = 1 - (age / 500);
        const size = (age / 500) * 40;
        ctx.globalAlpha = opacity;
        ctx.fillStyle = '#ff6600';
        ctx.fillRect(explosion.x - size/2, explosion.y - size/2, size, size);
        ctx.globalAlpha = 1;
        return true;
      }
      return false;
    }));
  };

  const startGame = () => {
    setGameState('playing');
    setPlayerStats(prev => ({ ...prev, health: 100, armor: 100, kills: 0 }));
    setGameStats(prev => ({ ...prev, playersAlive: 100, timeLeft: 300, rank: 100 }));
    generateEnemies();
  };

  const restartGame = () => {
    setGameState('menu');
    setPlayerStats({
      health: 100,
      armor: 100,
      ammo: 30,
      kills: 0,
      position: { x: 400, y: 300 },
      weapon: 'assault_rifle',
      inventory: []
    });
    setGameStats({
      playersAlive: 100,
      playersTotal: 100,
      zone: { x: 0, y: 0, radius: 500, shrinking: false },
      timeLeft: 300,
      rank: 1,
      match: 1
    });
    setEnemies([]);
    setBullets([]);
    setExplosions([]);
  };

  return (
    <div className="battle-royale-game">
      <canvas
        ref={canvasRef}
        width={800}
        height={600}
        className="game-canvas"
      />
      
      {/* Game UI */}
      <div className="game-ui">
        {/* Health & Stats */}
        <div className="player-stats">
          <div className="stat-item">
            <Heart className="stat-icon" />
            <div className="stat-bar">
              <div 
                className="stat-fill health" 
                style={{ width: `${playerStats.health}%` }}
              />
            </div>
            <span>{playerStats.health}</span>
          </div>
          
          <div className="stat-item">
            <Shield className="stat-icon" />
            <div className="stat-bar">
              <div 
                className="stat-fill armor" 
                style={{ width: `${playerStats.armor}%` }}
              />
            </div>
            <span>{playerStats.armor}</span>
          </div>
          
          <div className="stat-item">
            <Target className="stat-icon" />
            <span>{playerStats.ammo}</span>
          </div>
          
          <div className="stat-item">
            <Swords className="stat-icon" />
            <span>{weapons[playerStats.weapon].name}</span>
          </div>
        </div>

        {/* Game Stats */}
        <div className="game-stats">
          <div className="stat-item">
            <Users className="stat-icon" />
            <span>{gameStats.playersAlive}/{gameStats.playersTotal}</span>
          </div>
          
          <div className="stat-item">
            <Timer className="stat-icon" />
            <span>{Math.floor(gameStats.timeLeft / 60)}:{(gameStats.timeLeft % 60).toString().padStart(2, '0')}</span>
          </div>
          
          <div className="stat-item">
            <Crown className="stat-icon" />
            <span>#{gameStats.rank}</span>
          </div>
          
          <div className="stat-item">
            <Trophy className="stat-icon" />
            <span>{playerStats.kills} kills</span>
          </div>
        </div>

        {/* Zone Warning */}
        {gameStats.zone.shrinking && (
          <div className="zone-warning">
            <Zap className="warning-icon" />
            <span>ZONE SHRINKING!</span>
          </div>
        )}
      </div>

      {/* Menu Screen */}
      <AnimatePresence>
        {gameState === 'menu' && (
          <motion.div
            className="game-menu"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="menu-content">
              <h1>Battle Royale Arena</h1>
              <p>100 players. One survivor. Epic battles await!</p>
              
              <div className="menu-buttons">
                <button className="play-btn" onClick={startGame}>
                  <Users size={20} />
                  Join Battle
                </button>
                
                <button className="settings-btn">
                  <Settings size={20} />
                  Settings
                </button>
              </div>
              
              <div className="game-features">
                <div className="feature">
                  <Target size={16} />
                  <span>Multiple Weapons</span>
                </div>
                <div className="feature">
                  <MapPin size={16} />
                  <span>Shrinking Zone</span>
                </div>
                <div className="feature">
                  <Shield size={16} />
                  <span>Power-ups & Loot</span>
                </div>
                <div className="feature">
                  <Crown size={16} />
                  <span>Real-time Leaderboard</span>
                </div>
              </div>
            </div>
            
            {/* Leaderboard */}
            <div className="menu-leaderboard">
              <h3>Top Players Today</h3>
              {leaderboard.map((player, index) => (
                <div key={index} className={`leaderboard-item ${player.name === 'You' ? 'current-player' : ''}`}>
                  <span className="rank">#{player.rank}</span>
                  <span className="name">{player.name}</span>
                  <span className="kills">{player.kills} kills</span>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Game Over Screen */}
      <AnimatePresence>
        {gameState === 'gameOver' && (
          <motion.div
            className="game-over"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
          >
            <div className="game-over-content">
              <h2>{gameStats.rank === 1 ? 'WINNER!' : 'GAME OVER'}</h2>
              <div className="final-stats">
                <div className="final-stat">
                  <Crown size={24} />
                  <span>Rank: #{gameStats.rank}</span>
                </div>
                <div className="final-stat">
                  <Trophy size={24} />
                  <span>Kills: {playerStats.kills}</span>
                </div>
                <div className="final-stat">
                  <Timer size={24} />
                  <span>Survived: {Math.floor((300 - gameStats.timeLeft) / 60)}m {(300 - gameStats.timeLeft) % 60}s</span>
                </div>
              </div>
              
              <div className="game-over-buttons">
                <button className="play-again-btn" onClick={startGame}>
                  Play Again
                </button>
                <button className="menu-btn" onClick={restartGame}>
                  Main Menu
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Controls Help */}
      <div className="controls-help">
        <h4>Controls:</h4>
        <div className="control-item">WASD / Arrow Keys - Move</div>
        <div className="control-item">Mouse - Aim & Shoot</div>
        <div className="control-item">Collect power-ups to survive!</div>
      </div>
    </div>
  );
};

export default BattleRoyaleGame;