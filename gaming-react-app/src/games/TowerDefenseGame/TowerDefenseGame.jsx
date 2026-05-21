import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Zap, 
  Shield, 
  Target, 
  Coins, 
  Heart, 
  Play, 
  Pause, 
  RotateCcw,
  TrendingUp,
  Swords,
  Star,
  Crown,
  Settings
} from 'lucide-react';
import './TowerDefenseGame.css';

const TowerDefenseGame = () => {
  const canvasRef = useRef(null);
  const gameLoopRef = useRef(null);
  const [gameState, setGameState] = useState('menu'); // menu, playing, paused, gameOver, victory
  const [selectedTowerType, setSelectedTowerType] = useState(0);
  const [selectedTower, setSelectedTower] = useState(null);
  
  const [gameStats, setGameStats] = useState({
    wave: 1,
    lives: 20,
    gold: 500,
    score: 0,
    enemiesKilled: 0,
    level: 1
  });

  const [towers, setTowers] = useState([]);
  const [enemies, setEnemies] = useState([]);
  const [projectiles, setProjectiles] = useState([]);
  const [effects, setEffects] = useState([]);
  const [waveInProgress, setWaveInProgress] = useState(false);
  const [upgradeMenu, setUpgradeMenu] = useState({ show: false, tower: null });

  // Game path for enemies
  const gamePath = [
    { x: 0, y: 300 },
    { x: 150, y: 300 },
    { x: 150, y: 150 },
    { x: 400, y: 150 },
    { x: 400, y: 450 },
    { x: 600, y: 450 },
    { x: 600, y: 200 },
    { x: 750, y: 200 },
    { x: 800, y: 200 }
  ];

  const towerTypes = [
    {
      name: "Cannon Tower",
      cost: 100,
      damage: 50,
      range: 80,
      fireRate: 1000,
      color: "#ff4444",
      icon: "💥",
      description: "High damage, slow firing"
    },
    {
      name: "Machine Gun",
      cost: 80,
      damage: 15,
      range: 70,
      fireRate: 200,
      color: "#ffaa00",
      icon: "🔫",
      description: "Fast firing, lower damage"
    },
    {
      name: "Freeze Tower",
      cost: 120,
      damage: 5,
      range: 90,
      fireRate: 500,
      color: "#00aaff",
      icon: "❄️",
      description: "Slows enemies, low damage"
    },
    {
      name: "Laser Tower",
      cost: 200,
      damage: 80,
      range: 100,
      fireRate: 800,
      color: "#aa00ff",
      icon: "🔥",
      description: "High tech, piercing damage"
    },
    {
      name: "Missile Tower",
      cost: 300,
      damage: 150,
      range: 120,
      fireRate: 2000,
      color: "#00ff00",
      icon: "🚀",
      description: "Area damage, expensive"
    }
  ];

  const enemyTypes = [
    {
      name: "Scout",
      health: 100,
      speed: 2,
      reward: 10,
      color: "#666666",
      size: 8
    },
    {
      name: "Soldier",
      health: 200,
      speed: 1.5,
      reward: 20,
      color: "#aa6666",
      size: 10
    },
    {
      name: "Tank",
      health: 500,
      speed: 1,
      reward: 50,
      color: "#666666",
      size: 15
    },
    {
      name: "Fast Runner",
      health: 80,
      speed: 4,
      reward: 15,
      color: "#66aa66",
      size: 6
    },
    {
      name: "Boss",
      health: 1000,
      speed: 0.8,
      reward: 100,
      color: "#aa66aa",
      size: 20
    }
  ];

  // Initialize game
  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      canvas.addEventListener('click', handleCanvasClick);
      return () => canvas.removeEventListener('click', handleCanvasClick);
    }
  }, [selectedTowerType, gameState]);

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
  }, [gameState]);

  const handleCanvasClick = (e) => {
    if (gameState !== 'playing') return;
    
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Check if clicking on existing tower
    const clickedTower = towers.find(tower => {
      const dist = Math.sqrt(Math.pow(tower.x - x, 2) + Math.pow(tower.y - y, 2));
      return dist < 25;
    });

    if (clickedTower) {
      setSelectedTower(clickedTower);
      setUpgradeMenu({ show: true, tower: clickedTower });
      return;
    }

    // Try to place new tower
    if (canPlaceTower(x, y) && gameStats.gold >= towerTypes[selectedTowerType].cost) {
      placeTower(x, y);
    }
  };

  const canPlaceTower = (x, y) => {
    // Check if too close to path
    for (let i = 0; i < gamePath.length - 1; i++) {
      const pathStart = gamePath[i];
      const pathEnd = gamePath[i + 1];
      const dist = distanceToLineSegment(x, y, pathStart.x, pathStart.y, pathEnd.x, pathEnd.y);
      if (dist < 40) return false;
    }

    // Check if too close to other towers
    for (const tower of towers) {
      const dist = Math.sqrt(Math.pow(tower.x - x, 2) + Math.pow(tower.y - y, 2));
      if (dist < 50) return false;
    }

    return true;
  };

  const distanceToLineSegment = (px, py, x1, y1, x2, y2) => {
    const A = px - x1;
    const B = py - y1;
    const C = x2 - x1;
    const D = y2 - y1;

    const dot = A * C + B * D;
    const lenSq = C * C + D * D;
    let param = -1;
    if (lenSq !== 0) {
      param = dot / lenSq;
    }

    let xx, yy;
    if (param < 0) {
      xx = x1;
      yy = y1;
    } else if (param > 1) {
      xx = x2;
      yy = y2;
    } else {
      xx = x1 + param * C;
      yy = y1 + param * D;
    }

    const dx = px - xx;
    const dy = py - yy;
    return Math.sqrt(dx * dx + dy * dy);
  };

  const placeTower = (x, y) => {
    const towerType = towerTypes[selectedTowerType];
    const newTower = {
      id: Date.now(),
      x,
      y,
      type: selectedTowerType,
      level: 1,
      damage: towerType.damage,
      range: towerType.range,
      fireRate: towerType.fireRate,
      lastShot: 0,
      target: null,
      kills: 0,
      totalDamage: 0
    };

    setTowers(prev => [...prev, newTower]);
    setGameStats(prev => ({ ...prev, gold: prev.gold - towerType.cost }));
  };

  const upgradeTower = (towerId) => {
    setTowers(prev => prev.map(tower => {
      if (tower.id === towerId && tower.level < 3) {
        const upgradeCost = towerTypes[tower.type].cost * tower.level;
        
        if (gameStats.gold >= upgradeCost) {
          setGameStats(prevStats => ({ ...prevStats, gold: prevStats.gold - upgradeCost }));
          
          return {
            ...tower,
            level: tower.level + 1,
            damage: tower.damage * 1.5,
            range: tower.range * 1.2,
            fireRate: tower.fireRate * 0.8
          };
        }
      }
      return tower;
    }));
    setUpgradeMenu({ show: false, tower: null });
  };

  const sellTower = (towerId) => {
    const tower = towers.find(t => t.id === towerId);
    if (tower) {
      const sellPrice = Math.floor(towerTypes[tower.type].cost * tower.level * 0.7);
      setGameStats(prev => ({ ...prev, gold: prev.gold + sellPrice }));
      setTowers(prev => prev.filter(t => t.id !== towerId));
    }
    setUpgradeMenu({ show: false, tower: null });
  };

  const startWave = () => {
    if (waveInProgress) return;
    
    setWaveInProgress(true);
    const wave = gameStats.wave;
    const enemyCount = 10 + wave * 2;
    
    let enemiesSpawned = 0;
    const spawnInterval = setInterval(() => {
      if (enemiesSpawned >= enemyCount) {
        clearInterval(spawnInterval);
        
        // Check if wave is complete
        setTimeout(() => {
          if (enemies.length === 0) {
            completeWave();
          }
        }, 3000);
        return;
      }

      // Determine enemy type based on wave
      let enemyTypeIndex = 0;
      if (wave > 5) enemyTypeIndex = Math.floor(Math.random() * 3);
      if (wave > 10) enemyTypeIndex = Math.floor(Math.random() * 4);
      if (wave % 10 === 0) enemyTypeIndex = 4; // Boss every 10 waves

      spawnEnemy(enemyTypeIndex);
      enemiesSpawned++;
    }, 1000 - Math.min(wave * 50, 800));
  };

  const spawnEnemy = (typeIndex) => {
    const enemyType = enemyTypes[typeIndex];
    const waveMultiplier = 1 + (gameStats.wave - 1) * 0.2;
    
    const newEnemy = {
      id: Date.now() + Math.random(),
      type: typeIndex,
      x: gamePath[0].x,
      y: gamePath[0].y,
      health: enemyType.health * waveMultiplier,
      maxHealth: enemyType.health * waveMultiplier,
      speed: enemyType.speed,
      pathIndex: 0,
      progress: 0,
      effects: [],
      reward: Math.floor(enemyType.reward * waveMultiplier)
    };

    setEnemies(prev => [...prev, newEnemy]);
  };

  const completeWave = () => {
    setWaveInProgress(false);
    setGameStats(prev => ({
      ...prev,
      wave: prev.wave + 1,
      gold: prev.gold + 50 + (prev.wave * 10),
      score: prev.score + (prev.wave * 100)
    }));
  };

  const updateGame = () => {
    updateEnemies();
    updateTowers();
    updateProjectiles();
    updateEffects();
    checkGameState();
  };

  const updateEnemies = () => {
    setEnemies(prev => prev.filter(enemy => {
      // Move enemy along path
      if (enemy.pathIndex < gamePath.length - 1) {
        const currentPoint = gamePath[enemy.pathIndex];
        const nextPoint = gamePath[enemy.pathIndex + 1];
        
        const dx = nextPoint.x - currentPoint.x;
        const dy = nextPoint.y - currentPoint.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance > 0) {
          const speed = enemy.speed * (enemy.effects.includes('freeze') ? 0.5 : 1);
          enemy.progress += speed / distance;
          
          if (enemy.progress >= 1) {
            enemy.pathIndex++;
            enemy.progress = 0;
            enemy.x = nextPoint.x;
            enemy.y = nextPoint.y;
          } else {
            enemy.x = currentPoint.x + (dx * enemy.progress);
            enemy.y = currentPoint.y + (dy * enemy.progress);
          }
        }
        
        // Remove expired effects
        enemy.effects = enemy.effects.filter(() => Math.random() > 0.02);
        
        return true;
      } else {
        // Enemy reached end
        setGameStats(prevStats => ({ ...prevStats, lives: prevStats.lives - 1 }));
        return false;
      }
    }));
  };

  const updateTowers = () => {
    towers.forEach(tower => {
      // Find target
      let target = null;
      let closestDistance = tower.range;

      enemies.forEach(enemy => {
        const distance = Math.sqrt(
          Math.pow(enemy.x - tower.x, 2) + Math.pow(enemy.y - tower.y, 2)
        );
        
        if (distance <= tower.range && distance < closestDistance) {
          target = enemy;
          closestDistance = distance;
        }
      });

      tower.target = target;

      // Shoot at target
      if (target && Date.now() - tower.lastShot > tower.fireRate) {
        shoot(tower, target);
        tower.lastShot = Date.now();
      }
    });
  };

  const shoot = (tower, target) => {
    const towerType = towerTypes[tower.type];
    
    const newProjectile = {
      id: Date.now() + Math.random(),
      x: tower.x,
      y: tower.y,
      targetX: target.x,
      targetY: target.y,
      targetId: target.id,
      damage: tower.damage,
      speed: 8,
      type: tower.type,
      color: towerType.color
    };

    setProjectiles(prev => [...prev, newProjectile]);
  };

  const updateProjectiles = () => {
    setProjectiles(prev => prev.filter(projectile => {
      // Move projectile
      const dx = projectile.targetX - projectile.x;
      const dy = projectile.targetY - projectile.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      if (distance > projectile.speed) {
        projectile.x += (dx / distance) * projectile.speed;
        projectile.y += (dy / distance) * projectile.speed;
        return true;
      } else {
        // Hit target
        hitEnemy(projectile.targetId, projectile.damage, projectile.type);
        
        // Add hit effect
        setEffects(prev => [...prev, {
          x: projectile.targetX,
          y: projectile.targetY,
          type: 'hit',
          life: 10,
          color: projectile.color
        }]);
        
        return false;
      }
    }));
  };

  const hitEnemy = (enemyId, damage, projectileType) => {
    setEnemies(prev => prev.map(enemy => {
      if (enemy.id === enemyId) {
        enemy.health -= damage;
        
        // Apply special effects
        if (projectileType === 2) { // Freeze tower
          enemy.effects.push('freeze');
        }
        
        if (enemy.health <= 0) {
          // Enemy killed
          setGameStats(prevStats => ({
            ...prevStats,
            gold: prevStats.gold + enemy.reward,
            score: prevStats.score + enemy.reward * 2,
            enemiesKilled: prevStats.enemiesKilled + 1
          }));
          
          // Add death effect
          setEffects(prev => [...prev, {
            x: enemy.x,
            y: enemy.y,
            type: 'death',
            life: 20,
            color: '#ffaa00'
          }]);
          
          return null;
        }
      }
      return enemy;
    }).filter(Boolean));
  };

  const updateEffects = () => {
    setEffects(prev => prev.filter(effect => {
      effect.life--;
      return effect.life > 0;
    }));
  };

  const checkGameState = () => {
    if (gameStats.lives <= 0) {
      setGameState('gameOver');
    }
    
    if (!waveInProgress && enemies.length === 0 && gameStats.wave > 20) {
      setGameState('victory');
    }
  };

  const render = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, 800, 600);
    
    // Draw background
    ctx.fillStyle = '#2a4d3a';
    ctx.fillRect(0, 0, 800, 600);
    
    // Draw path
    ctx.strokeStyle = '#8B4513';
    ctx.lineWidth = 30;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.beginPath();
    gamePath.forEach((point, index) => {
      if (index === 0) {
        ctx.moveTo(point.x, point.y);
      } else {
        ctx.lineTo(point.x, point.y);
      }
    });
    ctx.stroke();
    
    // Draw towers
    towers.forEach(tower => {
      const towerType = towerTypes[tower.type];
      
      // Tower range (when selected)
      if (selectedTower && selectedTower.id === tower.id) {
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(tower.x, tower.y, tower.range, 0, Math.PI * 2);
        ctx.stroke();
      }
      
      // Tower base
      ctx.fillStyle = towerType.color;
      ctx.fillRect(tower.x - 15, tower.y - 15, 30, 30);
      
      // Tower level indicator
      ctx.fillStyle = '#ffffff';
      ctx.font = '12px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(tower.level.toString(), tower.x, tower.y - 20);
      
      // Targeting line
      if (tower.target) {
        ctx.strokeStyle = 'rgba(255, 0, 0, 0.5)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(tower.x, tower.y);
        ctx.lineTo(tower.target.x, tower.target.y);
        ctx.stroke();
      }
    });
    
    // Draw enemies
    enemies.forEach(enemy => {
      const enemyType = enemyTypes[enemy.type];
      
      // Enemy body
      ctx.fillStyle = enemyType.color;
      ctx.beginPath();
      ctx.arc(enemy.x, enemy.y, enemyType.size, 0, Math.PI * 2);
      ctx.fill();
      
      // Health bar
      const barWidth = enemyType.size * 2;
      const barHeight = 4;
      const healthPercent = enemy.health / enemy.maxHealth;
      
      ctx.fillStyle = '#ff0000';
      ctx.fillRect(enemy.x - barWidth/2, enemy.y - enemyType.size - 10, barWidth, barHeight);
      ctx.fillStyle = '#00ff00';
      ctx.fillRect(enemy.x - barWidth/2, enemy.y - enemyType.size - 10, barWidth * healthPercent, barHeight);
      
      // Status effects
      if (enemy.effects.includes('freeze')) {
        ctx.fillStyle = 'rgba(0, 150, 255, 0.5)';
        ctx.beginPath();
        ctx.arc(enemy.x, enemy.y, enemyType.size + 3, 0, Math.PI * 2);
        ctx.fill();
      }
    });
    
    // Draw projectiles
    projectiles.forEach(projectile => {
      ctx.fillStyle = projectile.color;
      ctx.beginPath();
      ctx.arc(projectile.x, projectile.y, 3, 0, Math.PI * 2);
      ctx.fill();
    });
    
    // Draw effects
    effects.forEach(effect => {
      ctx.globalAlpha = effect.life / 20;
      ctx.fillStyle = effect.color;
      
      if (effect.type === 'hit') {
        ctx.beginPath();
        ctx.arc(effect.x, effect.y, 5, 0, Math.PI * 2);
        ctx.fill();
      } else if (effect.type === 'death') {
        ctx.fillRect(effect.x - 10, effect.y - 10, 20, 20);
      }
    });
    ctx.globalAlpha = 1;
  };

  const startGame = () => {
    setGameState('playing');
    setGameStats({
      wave: 1,
      lives: 20,
      gold: 500,
      score: 0,
      enemiesKilled: 0,
      level: 1
    });
    setTowers([]);
    setEnemies([]);
    setProjectiles([]);
    setEffects([]);
    setWaveInProgress(false);
  };

  const pauseGame = () => {
    setGameState(gameState === 'paused' ? 'playing' : 'paused');
  };

  const restartGame = () => {
    setGameState('menu');
  };

  return (
    <div className="tower-defense-game">
      <canvas
        ref={canvasRef}
        width={800}
        height={600}
        className="game-canvas"
      />
      
      {/* Game HUD */}
      {gameState === 'playing' && (
        <div className="game-hud">
          <div className="hud-top">
            <div className="game-stats">
              <div className="stat-item">
                <Crown size={16} />
                <span>Wave: {gameStats.wave}</span>
              </div>
              <div className="stat-item">
                <Heart size={16} />
                <span>Lives: {gameStats.lives}</span>
              </div>
              <div className="stat-item">
                <Coins size={16} />
                <span>Gold: {gameStats.gold}</span>
              </div>
              <div className="stat-item">
                <Star size={16} />
                <span>Score: {gameStats.score}</span>
              </div>
            </div>
            
            <div className="game-controls">
              <button 
                onClick={startWave} 
                disabled={waveInProgress}
                className="wave-btn"
              >
                {waveInProgress ? 'Wave in Progress' : 'Start Wave'}
              </button>
              <button onClick={pauseGame} className="control-btn">
                <Pause size={16} />
              </button>
              <button onClick={restartGame} className="control-btn">
                <RotateCcw size={16} />
              </button>
            </div>
          </div>
          
          <div className="tower-panel">
            <h3>Towers</h3>
            <div className="tower-buttons">
              {towerTypes.map((tower, index) => (
                <button
                  key={index}
                  className={`tower-btn ${selectedTowerType === index ? 'selected' : ''} ${gameStats.gold < tower.cost ? 'disabled' : ''}`}
                  onClick={() => setSelectedTowerType(index)}
                  disabled={gameStats.gold < tower.cost}
                >
                  <div className="tower-icon">{tower.icon}</div>
                  <div className="tower-info">
                    <div className="tower-name">{tower.name}</div>
                    <div className="tower-cost">${tower.cost}</div>
                  </div>
                </button>
              ))}
            </div>
            
            {selectedTowerType !== null && (
              <div className="tower-details">
                <h4>{towerTypes[selectedTowerType].name}</h4>
                <p>{towerTypes[selectedTowerType].description}</p>
                <div className="tower-stats">
                  <div>Damage: {towerTypes[selectedTowerType].damage}</div>
                  <div>Range: {towerTypes[selectedTowerType].range}</div>
                  <div>Rate: {(1000 / towerTypes[selectedTowerType].fireRate).toFixed(1)}/s</div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Upgrade Menu */}
      <AnimatePresence>
        {upgradeMenu.show && upgradeMenu.tower && (
          <motion.div
            className="upgrade-menu"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
          >
            <div className="upgrade-content">
              <h3>{towerTypes[upgradeMenu.tower.type].name}</h3>
              <div className="tower-current-stats">
                <div>Level: {upgradeMenu.tower.level}</div>
                <div>Damage: {Math.round(upgradeMenu.tower.damage)}</div>
                <div>Range: {Math.round(upgradeMenu.tower.range)}</div>
                <div>Kills: {upgradeMenu.tower.kills}</div>
              </div>
              
              <div className="upgrade-buttons">
                {upgradeMenu.tower.level < 3 && (
                  <button 
                    onClick={() => upgradeTower(upgradeMenu.tower.id)}
                    className="upgrade-btn"
                    disabled={gameStats.gold < towerTypes[upgradeMenu.tower.type].cost * upgradeMenu.tower.level}
                  >
                    <TrendingUp size={16} />
                    Upgrade (${towerTypes[upgradeMenu.tower.type].cost * upgradeMenu.tower.level})
                  </button>
                )}
                
                <button 
                  onClick={() => sellTower(upgradeMenu.tower.id)}
                  className="sell-btn"
                >
                  <Coins size={16} />
                  Sell (${Math.floor(towerTypes[upgradeMenu.tower.type].cost * upgradeMenu.tower.level * 0.7)})
                </button>
                
                <button 
                  onClick={() => setUpgradeMenu({ show: false, tower: null })}
                  className="cancel-btn"
                >
                  Cancel
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

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
              <h1>Tower Defense Strategy</h1>
              <p>Defend your base against waves of enemies using strategic tower placement!</p>
              
              <div className="game-features">
                <div className="feature">
                  <Target size={20} />
                  <span>5 Unique Tower Types</span>
                </div>
                <div className="feature">
                  <Swords size={20} />
                  <span>Multiple Enemy Types</span>
                </div>
                <div className="feature">
                  <TrendingUp size={20} />
                  <span>Tower Upgrades</span>
                </div>
                <div className="feature">
                  <Crown size={20} />
                  <span>Endless Waves</span>
                </div>
              </div>
              
              <button className="start-btn" onClick={startGame}>
                <Play size={20} />
                Start Defense
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Game Over Screen */}
      <AnimatePresence>
        {(gameState === 'gameOver' || gameState === 'victory') && (
          <motion.div
            className="game-over"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
          >
            <div className="game-over-content">
              <h2>{gameState === 'victory' ? 'VICTORY!' : 'DEFEAT!'}</h2>
              
              <div className="final-stats">
                <div className="final-stat">
                  <Crown size={20} />
                  <span>Waves Survived: {gameStats.wave - 1}</span>
                </div>
                <div className="final-stat">
                  <Swords size={20} />
                  <span>Enemies Killed: {gameStats.enemiesKilled}</span>
                </div>
                <div className="final-stat">
                  <Star size={20} />
                  <span>Final Score: {gameStats.score}</span>
                </div>
              </div>
              
              <div className="game-over-buttons">
                <button onClick={startGame} className="play-again-btn">
                  Play Again
                </button>
                <button onClick={restartGame} className="menu-btn">
                  Main Menu
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TowerDefenseGame;