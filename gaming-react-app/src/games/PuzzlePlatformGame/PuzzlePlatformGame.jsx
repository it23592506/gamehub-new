import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Star, 
  Key, 
  Diamond, 
  Heart,
  Crown,
  Trophy,
  Settings,
  Map,
  Volume2,
  Home,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  ArrowDown,
  Zap
} from 'lucide-react';
import './PuzzlePlatformGame.css';

const PuzzlePlatformGame = () => {
  const canvasRef = useRef(null);
  const gameLoopRef = useRef(null);
  const [gameState, setGameState] = useState('menu');
  const [currentWorld, setCurrentWorld] = useState(1);
  const [currentLevel, setCurrentLevel] = useState(1);
  const [cameraX, setCameraX] = useState(0);
  const [cameraY, setCameraY] = useState(0);
  
  const [player, setPlayer] = useState({
    x: 100,
    y: 400,
    width: 24,
    height: 32,
    velocityX: 0,
    velocityY: 0,
    onGround: false,
    facingRight: true,
    health: 3,
    maxHealth: 3,
    hasDoubleJump: false,
    canDoubleJump: false,
    invulnerable: 0,
    respawnPoint: { x: 100, y: 400 }
  });

  const [gameStats, setGameStats] = useState({
    lives: 3,
    score: 0,
    coins: 0,
    keys: 0,
    gems: 0,
    totalTime: 0,
    levelTime: 0,
    worldsCompleted: 0,
    levelsCompleted: 0
  });

  const [levelData, setLevelData] = useState({
    platforms: [
      { x: 50, y: 450, width: 200, height: 20, type: 'normal' },
      { x: 300, y: 350, width: 100, height: 20, type: 'normal' },
      { x: 500, y: 250, width: 150, height: 20, type: 'moving', startX: 500, endX: 650, speed: 1, direction: 1 },
      { x: 700, y: 400, width: 100, height: 20, type: 'breakable', health: 3 },
      { x: 900, y: 300, width: 80, height: 20, type: 'ice' },
      { x: 1100, y: 200, width: 200, height: 20, type: 'normal' }
    ],
    spikes: [
      { x: 250, y: 440, width: 40, height: 20 },
      { x: 850, y: 390, width: 30, height: 20 }
    ],
    enemies: [
      { id: 1, x: 320, y: 320, width: 20, height: 20, type: 'walker', direction: 1, speed: 0.5, startX: 300, endX: 400 },
      { id: 2, x: 720, y: 370, width: 16, height: 16, type: 'jumper', jumpCooldown: 0, patrol: true },
      { id: 3, x: 920, y: 270, width: 24, height: 24, type: 'shooter', shootCooldown: 0, bullets: [] }
    ],
    collectibles: [
      { id: 1, x: 180, y: 410, type: 'coin', value: 10, collected: false },
      { id: 2, x: 380, y: 310, type: 'coin', value: 10, collected: false },
      { id: 3, x: 780, y: 360, type: 'key', value: 1, collected: false },
      { id: 4, x: 980, y: 260, type: 'gem', value: 50, collected: false },
      { id: 5, x: 1180, y: 160, type: 'heart', value: 1, collected: false }
    ],
    switches: [
      { id: 1, x: 600, y: 420, width: 20, height: 20, pressed: false, target: 'door1' }
    ],
    doors: [
      { id: 'door1', x: 1000, y: 350, width: 20, height: 100, open: false, keyRequired: false }
    ],
    portals: [
      { x: 1200, y: 150, width: 30, height: 40, destination: 'next' }
    ],
    checkpoints: [
      { x: 500, y: 200, active: false },
      { x: 1000, y: 250, active: false }
    ]
  });

  const [particles, setParticles] = useState([]);
  const [powerUps, setPowerUps] = useState([]);
  const [screenShake, setScreenShake] = useState(0);
  const [keys, setKeys] = useState({});

  // Input handling
  useEffect(() => {
    const handleKeyDown = (e) => {
      setKeys(prev => ({ ...prev, [e.key.toLowerCase()]: true }));
      
      // Prevent page scrolling
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
        e.preventDefault();
      }
    };

    const handleKeyUp = (e) => {
      setKeys(prev => ({ ...prev, [e.key.toLowerCase()]: false }));
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
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
  }, [gameState, player, levelData]);

  const updateGame = () => {
    updatePlayer();
    updateEnemies();
    updatePlatforms();
    updateParticles();
    updateCamera();
    checkCollisions();
    updateGameStats();
    
    if (screenShake > 0) {
      setScreenShake(prev => prev - 1);
    }
  };

  const updatePlayer = () => {
    setPlayer(prev => {
      let newPlayer = { ...prev };
      
      // Invulnerability timer
      if (newPlayer.invulnerable > 0) {
        newPlayer.invulnerable--;
      }
      
      // Horizontal movement
      const moveSpeed = 3;
      if (keys['a'] || keys['arrowleft']) {
        newPlayer.velocityX = Math.max(newPlayer.velocityX - 0.5, -moveSpeed);
        newPlayer.facingRight = false;
      } else if (keys['d'] || keys['arrowright']) {
        newPlayer.velocityX = Math.min(newPlayer.velocityX + 0.5, moveSpeed);
        newPlayer.facingRight = true;
      } else {
        // Friction
        newPlayer.velocityX *= 0.8;
        if (Math.abs(newPlayer.velocityX) < 0.1) {
          newPlayer.velocityX = 0;
        }
      }
      
      // Jumping
      if ((keys[' '] || keys['w'] || keys['arrowup']) && newPlayer.onGround) {
        newPlayer.velocityY = -12;
        newPlayer.onGround = false;
        newPlayer.canDoubleJump = newPlayer.hasDoubleJump;
      } else if ((keys[' '] || keys['w'] || keys['arrowup']) && newPlayer.canDoubleJump && !newPlayer.onGround) {
        newPlayer.velocityY = -10;
        newPlayer.canDoubleJump = false;
        
        // Double jump particle effect
        addParticles(newPlayer.x + newPlayer.width/2, newPlayer.y + newPlayer.height, 'doubleJump');
      }
      
      // Gravity
      newPlayer.velocityY += 0.6;
      if (newPlayer.velocityY > 15) {
        newPlayer.velocityY = 15;
      }
      
      // Apply velocity
      newPlayer.x += newPlayer.velocityX;
      newPlayer.y += newPlayer.velocityY;
      
      // World boundaries
      if (newPlayer.x < 0) {
        newPlayer.x = 0;
        newPlayer.velocityX = 0;
      }
      if (newPlayer.x > 1400) {
        newPlayer.x = 1400;
        newPlayer.velocityX = 0;
      }
      
      // Death from falling
      if (newPlayer.y > 600) {
        respawnPlayer();
        return prev;
      }
      
      return newPlayer;
    });
  };

  const updateEnemies = () => {
    setLevelData(prev => ({
      ...prev,
      enemies: prev.enemies.map(enemy => {
        let newEnemy = { ...enemy };
        
        if (enemy.type === 'walker') {
          newEnemy.x += enemy.direction * enemy.speed;
          
          // Reverse direction at patrol bounds
          if (newEnemy.x <= enemy.startX || newEnemy.x >= enemy.endX) {
            newEnemy.direction *= -1;
          }
        } else if (enemy.type === 'jumper') {
          if (enemy.jumpCooldown > 0) {
            newEnemy.jumpCooldown--;
          } else if (Math.random() < 0.01) {
            // Random jump
            newEnemy.jumpCooldown = 120;
            // Add jump velocity logic here
          }
        } else if (enemy.type === 'shooter') {
          if (enemy.shootCooldown > 0) {
            newEnemy.shootCooldown--;
          } else {
            // Check if player is in range
            const playerDistance = Math.abs(player.x - enemy.x);
            if (playerDistance < 200) {
              newEnemy.shootCooldown = 180;
              // Create bullet
              const bullet = {
                x: enemy.x,
                y: enemy.y,
                velocityX: player.x > enemy.x ? 2 : -2,
                velocityY: 0
              };
              newEnemy.bullets = [...(enemy.bullets || []), bullet];
            }
          }
          
          // Update bullets
          if (newEnemy.bullets) {
            newEnemy.bullets = newEnemy.bullets.filter(bullet => {
              bullet.x += bullet.velocityX;
              bullet.y += bullet.velocityY;
              
              // Remove bullets that are off-screen
              return bullet.x > -50 && bullet.x < 1500 && bullet.y > -50 && bullet.y < 650;
            });
          }
        }
        
        return newEnemy;
      })
    }));
  };

  const updatePlatforms = () => {
    setLevelData(prev => ({
      ...prev,
      platforms: prev.platforms.map(platform => {
        if (platform.type === 'moving') {
          let newPlatform = { ...platform };
          
          newPlatform.x += platform.direction * platform.speed;
          
          if (newPlatform.x <= platform.startX || newPlatform.x >= platform.endX) {
            newPlatform.direction *= -1;
          }
          
          return newPlatform;
        }
        return platform;
      })
    }));
  };

  const updateParticles = () => {
    setParticles(prev => prev.filter(particle => {
      particle.x += particle.velocityX;
      particle.y += particle.velocityY;
      particle.velocityY += 0.2; // Gravity for particles
      particle.life--;
      particle.alpha = particle.life / particle.maxLife;
      
      return particle.life > 0;
    }));
  };

  const updateCamera = () => {
    const targetX = player.x - 400; // Center player horizontally
    const targetY = player.y - 300; // Center player vertically
    
    // Smooth camera follow
    setCameraX(prev => prev + (targetX - prev) * 0.1);
    setCameraY(prev => prev + (targetY - prev) * 0.1);
  };

  const updateGameStats = () => {
    setGameStats(prev => ({
      ...prev,
      totalTime: prev.totalTime + 1,
      levelTime: prev.levelTime + 1
    }));
  };

  const checkCollisions = () => {
    // Platform collisions
    setPlayer(prev => {
      let newPlayer = { ...prev };
      newPlayer.onGround = false;
      
      levelData.platforms.forEach(platform => {
        if (platform.type === 'breakable' && platform.health <= 0) return;
        
        // Check collision
        if (newPlayer.x < platform.x + platform.width &&
            newPlayer.x + newPlayer.width > platform.x &&
            newPlayer.y < platform.y + platform.height &&
            newPlayer.y + newPlayer.height > platform.y) {
          
          // Determine collision side
          const overlapX = Math.min(newPlayer.x + newPlayer.width - platform.x, platform.x + platform.width - newPlayer.x);
          const overlapY = Math.min(newPlayer.y + newPlayer.height - platform.y, platform.y + platform.height - newPlayer.y);
          
          if (overlapX < overlapY) {
            // Horizontal collision
            if (newPlayer.x < platform.x) {
              newPlayer.x = platform.x - newPlayer.width;
            } else {
              newPlayer.x = platform.x + platform.width;
            }
            newPlayer.velocityX = 0;
          } else {
            // Vertical collision
            if (newPlayer.y < platform.y) {
              newPlayer.y = platform.y - newPlayer.height;
              newPlayer.velocityY = 0;
              newPlayer.onGround = true;
              
              // Ice platform sliding
              if (platform.type === 'ice') {
                newPlayer.velocityX *= 1.1;
              }
              
              // Moving platform
              if (platform.type === 'moving') {
                newPlayer.x += platform.direction * platform.speed;
              }
            } else {
              newPlayer.y = platform.y + platform.height;
              newPlayer.velocityY = 0;
            }
          }
        }
      });
      
      return newPlayer;
    });
    
    // Collectible collisions
    setLevelData(prev => ({
      ...prev,
      collectibles: prev.collectibles.map(collectible => {
        if (!collectible.collected &&
            player.x < collectible.x + 20 &&
            player.x + player.width > collectible.x &&
            player.y < collectible.y + 20 &&
            player.y + player.height > collectible.y) {
          
          // Collect item
          collectItem(collectible);
          return { ...collectible, collected: true };
        }
        return collectible;
      })
    }));
    
    // Enemy collisions
    levelData.enemies.forEach(enemy => {
      if (player.invulnerable > 0) return;
      
      // Player-enemy collision
      if (player.x < enemy.x + enemy.width &&
          player.x + player.width > enemy.x &&
          player.y < enemy.y + enemy.height &&
          player.y + player.height > enemy.y) {
        
        // Check if player is falling on enemy
        if (player.velocityY > 0 && player.y < enemy.y - 10) {
          // Player defeats enemy
          defeatEnemy(enemy);
          setPlayer(prev => ({ ...prev, velocityY: -8 })); // Bounce
        } else {
          // Player takes damage
          takeDamage();
        }
      }
      
      // Bullet collisions
      if (enemy.bullets) {
        enemy.bullets.forEach(bullet => {
          if (player.invulnerable > 0) return;
          
          if (player.x < bullet.x + 8 &&
              player.x + player.width > bullet.x &&
              player.y < bullet.y + 8 &&
              player.y + player.height > bullet.y) {
            takeDamage();
          }
        });
      }
    });
    
    // Spike collisions
    levelData.spikes.forEach(spike => {
      if (player.invulnerable > 0) return;
      
      if (player.x < spike.x + spike.width &&
          player.x + player.width > spike.x &&
          player.y < spike.y + spike.height &&
          player.y + player.height > spike.y) {
        takeDamage();
      }
    });
    
    // Switch collisions
    levelData.switches.forEach((switchObj, index) => {
      if (player.x < switchObj.x + switchObj.width &&
          player.x + player.width > switchObj.x &&
          player.y < switchObj.y + switchObj.height &&
          player.y + player.height > switchObj.y) {
        
        if (!switchObj.pressed) {
          activateSwitch(index);
        }
      }
    });
    
    // Portal collisions
    levelData.portals.forEach(portal => {
      if (player.x < portal.x + portal.width &&
          player.x + player.width > portal.x &&
          player.y < portal.y + portal.height &&
          player.y + player.height > portal.y) {
        
        if (portal.destination === 'next') {
          completeLevel();
        }
      }
    });
  };

  const collectItem = (item) => {
    setGameStats(prev => {
      let newStats = { ...prev };
      
      if (item.type === 'coin') {
        newStats.coins += 1;
        newStats.score += item.value;
      } else if (item.type === 'gem') {
        newStats.gems += 1;
        newStats.score += item.value;
      } else if (item.type === 'key') {
        newStats.keys += 1;
      } else if (item.type === 'heart') {
        setPlayer(prevPlayer => ({
          ...prevPlayer,
          health: Math.min(prevPlayer.health + 1, prevPlayer.maxHealth)
        }));
      }
      
      return newStats;
    });
    
    // Add collection particle effect
    addParticles(item.x + 10, item.y + 10, 'collect');
  };

  const defeatEnemy = (enemy) => {
    setGameStats(prev => ({ ...prev, score: prev.score + 100 }));
    
    // Remove enemy
    setLevelData(prev => ({
      ...prev,
      enemies: prev.enemies.filter(e => e.id !== enemy.id)
    }));
    
    // Add defeat effect
    addParticles(enemy.x + enemy.width/2, enemy.y + enemy.height/2, 'defeat');
  };

  const takeDamage = () => {
    setPlayer(prev => {
      let newPlayer = { ...prev };
      newPlayer.health -= 1;
      newPlayer.invulnerable = 120; // 2 seconds of invulnerability
      
      if (newPlayer.health <= 0) {
        // Player dies
        setGameStats(prevStats => ({ ...prevStats, lives: prevStats.lives - 1 }));
        
        if (gameStats.lives <= 1) {
          setGameState('gameOver');
        } else {
          respawnPlayer();
        }
      }
      
      return newPlayer;
    });
    
    // Screen shake and damage effect
    setScreenShake(20);
    addParticles(player.x + player.width/2, player.y + player.height/2, 'damage');
  };

  const respawnPlayer = () => {
    setPlayer(prev => ({
      ...prev,
      x: prev.respawnPoint.x,
      y: prev.respawnPoint.y,
      velocityX: 0,
      velocityY: 0,
      health: prev.maxHealth,
      invulnerable: 180
    }));
  };

  const activateSwitch = (index) => {
    setLevelData(prev => {
      const newData = { ...prev };
      newData.switches[index].pressed = true;
      
      // Find and open corresponding door
      const switchObj = newData.switches[index];
      const door = newData.doors.find(d => d.id === switchObj.target);
      if (door) {
        door.open = true;
      }
      
      return newData;
    });
    
    addParticles(levelData.switches[index].x + 10, levelData.switches[index].y + 10, 'switch');
  };

  const completeLevel = () => {
    setGameStats(prev => ({
      ...prev,
      levelsCompleted: prev.levelsCompleted + 1,
      score: prev.score + Math.max(1000 - prev.levelTime, 100), // Time bonus
      levelTime: 0
    }));
    
    if (currentLevel >= 3) {
      // Complete world
      setGameStats(prev => ({ ...prev, worldsCompleted: prev.worldsCompleted + 1 }));
      
      if (currentWorld >= 3) {
        setGameState('victory');
      } else {
        setCurrentWorld(prev => prev + 1);
        setCurrentLevel(1);
        loadLevel(currentWorld + 1, 1);
      }
    } else {
      setCurrentLevel(prev => prev + 1);
      loadLevel(currentWorld, currentLevel + 1);
    }
  };

  const loadLevel = (world, level) => {
    // Reset player position
    setPlayer(prev => ({
      ...prev,
      x: 100,
      y: 400,
      velocityX: 0,
      velocityY: 0,
      health: prev.maxHealth,
      respawnPoint: { x: 100, y: 400 }
    }));
    
    // Generate level based on world and level
    generateLevel(world, level);
  };

  const generateLevel = (world, level) => {
    // This would normally load different level configurations
    // For now, we'll use the default level with some variations
    const baseLevel = {
      platforms: [
        { x: 50, y: 450, width: 200, height: 20, type: 'normal' },
        { x: 300, y: 350, width: 100, height: 20, type: 'normal' },
        { x: 500, y: 250, width: 150, height: 20, type: 'moving', startX: 500, endX: 650, speed: 1, direction: 1 },
        { x: 700, y: 400, width: 100, height: 20, type: 'breakable', health: 3 },
        { x: 900, y: 300, width: 80, height: 20, type: 'ice' },
        { x: 1100, y: 200, width: 200, height: 20, type: 'normal' }
      ],
      spikes: [
        { x: 250, y: 440, width: 40, height: 20 },
        { x: 850, y: 390, width: 30, height: 20 }
      ],
      enemies: [
        { id: 1, x: 320, y: 320, width: 20, height: 20, type: 'walker', direction: 1, speed: 0.5, startX: 300, endX: 400 },
        { id: 2, x: 720, y: 370, width: 16, height: 16, type: 'jumper', jumpCooldown: 0, patrol: true }
      ],
      collectibles: [
        { id: 1, x: 180, y: 410, type: 'coin', value: 10, collected: false },
        { id: 2, x: 380, y: 310, type: 'coin', value: 10, collected: false },
        { id: 3, x: 780, y: 360, type: 'key', value: 1, collected: false },
        { id: 4, x: 980, y: 260, type: 'gem', value: 50, collected: false },
        { id: 5, x: 1180, y: 160, type: 'heart', value: 1, collected: false }
      ],
      switches: [
        { id: 1, x: 600, y: 420, width: 20, height: 20, pressed: false, target: 'door1' }
      ],
      doors: [
        { id: 'door1', x: 1000, y: 350, width: 20, height: 100, open: false, keyRequired: false }
      ],
      portals: [
        { x: 1200, y: 150, width: 30, height: 40, destination: 'next' }
      ],
      checkpoints: [
        { x: 500, y: 200, active: false },
        { x: 1000, y: 250, active: false }
      ]
    };
    
    setLevelData(baseLevel);
  };

  const addParticles = (x, y, type) => {
    const particleCount = type === 'defeat' ? 8 : 5;
    const newParticles = [];
    
    for (let i = 0; i < particleCount; i++) {
      newParticles.push({
        x: x + (Math.random() - 0.5) * 20,
        y: y + (Math.random() - 0.5) * 20,
        velocityX: (Math.random() - 0.5) * 4,
        velocityY: (Math.random() - 0.5) * 4 - 2,
        life: 30 + Math.random() * 20,
        maxLife: 30 + Math.random() * 20,
        alpha: 1,
        color: type === 'collect' ? '#ffd700' : type === 'defeat' ? '#ff6b6b' : type === 'damage' ? '#ff0000' : '#ffffff',
        size: 3 + Math.random() * 3
      });
    }
    
    setParticles(prev => [...prev, ...newParticles]);
  };

  const render = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, 800, 600);
    
    // Apply camera transform and screen shake
    ctx.save();
    const shakeX = screenShake > 0 ? (Math.random() - 0.5) * screenShake : 0;
    const shakeY = screenShake > 0 ? (Math.random() - 0.5) * screenShake : 0;
    ctx.translate(-cameraX + shakeX, -cameraY + shakeY);
    
    // Draw background
    const gradient = ctx.createLinearGradient(0, 0, 0, 600);
    gradient.addColorStop(0, '#87ceeb');
    gradient.addColorStop(1, '#98fb98');
    ctx.fillStyle = gradient;
    ctx.fillRect(cameraX - 100, cameraY - 100, 1000, 800);
    
    // Draw clouds (parallax background)
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    for (let i = 0; i < 5; i++) {
      const cloudX = (cameraX * 0.1) + i * 300;
      const cloudY = cameraY * 0.1 + 50 + i * 30;
      ctx.beginPath();
      ctx.arc(cloudX, cloudY, 20, 0, Math.PI * 2);
      ctx.arc(cloudX + 25, cloudY, 30, 0, Math.PI * 2);
      ctx.arc(cloudX + 50, cloudY, 20, 0, Math.PI * 2);
      ctx.fill();
    }
    
    // Draw platforms
    levelData.platforms.forEach(platform => {
      if (platform.type === 'breakable' && platform.health <= 0) return;
      
      let color = '#8B4513';
      if (platform.type === 'moving') color = '#4169E1';
      else if (platform.type === 'ice') color = '#87CEEB';
      else if (platform.type === 'breakable') color = '#CD853F';
      
      ctx.fillStyle = color;
      ctx.fillRect(platform.x, platform.y, platform.width, platform.height);
      
      // Platform highlight
      ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
      ctx.fillRect(platform.x, platform.y, platform.width, 4);
    });
    
    // Draw spikes
    levelData.spikes.forEach(spike => {
      ctx.fillStyle = '#FF4500';
      ctx.beginPath();
      for (let i = 0; i < spike.width; i += 10) {
        ctx.moveTo(spike.x + i, spike.y + spike.height);
        ctx.lineTo(spike.x + i + 5, spike.y);
        ctx.lineTo(spike.x + i + 10, spike.y + spike.height);
      }
      ctx.closePath();
      ctx.fill();
    });
    
    // Draw collectibles
    levelData.collectibles.forEach(collectible => {
      if (collectible.collected) return;
      
      const time = Date.now() * 0.005;
      const bobY = collectible.y + Math.sin(time + collectible.id) * 3;
      
      ctx.save();
      ctx.translate(collectible.x + 10, bobY + 10);
      ctx.rotate(time + collectible.id);
      
      if (collectible.type === 'coin') {
        ctx.fillStyle = '#FFD700';
        ctx.beginPath();
        ctx.arc(0, 0, 8, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#FFA500';
        ctx.beginPath();
        ctx.arc(0, 0, 5, 0, Math.PI * 2);
        ctx.fill();
      } else if (collectible.type === 'gem') {
        ctx.fillStyle = '#FF69B4';
        ctx.beginPath();
        ctx.moveTo(0, -8);
        ctx.lineTo(6, -4);
        ctx.lineTo(6, 4);
        ctx.lineTo(0, 8);
        ctx.lineTo(-6, 4);
        ctx.lineTo(-6, -4);
        ctx.closePath();
        ctx.fill();
      } else if (collectible.type === 'key') {
        ctx.fillStyle = '#FFD700';
        ctx.fillRect(-2, -8, 4, 12);
        ctx.fillRect(2, -6, 4, 2);
        ctx.fillRect(2, -2, 4, 2);
      } else if (collectible.type === 'heart') {
        ctx.fillStyle = '#FF1493';
        ctx.beginPath();
        ctx.moveTo(0, 2);
        ctx.bezierCurveTo(-8, -6, -16, 2, 0, 16);
        ctx.bezierCurveTo(16, 2, 8, -6, 0, 2);
        ctx.fill();
      }
      
      ctx.restore();
    });
    
    // Draw enemies
    levelData.enemies.forEach(enemy => {
      ctx.fillStyle = enemy.type === 'walker' ? '#FF6B6B' : enemy.type === 'jumper' ? '#4ECDC4' : '#FF8C42';
      ctx.fillRect(enemy.x, enemy.y, enemy.width, enemy.height);
      
      // Enemy eyes
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(enemy.x + 2, enemy.y + 2, 4, 4);
      ctx.fillRect(enemy.x + enemy.width - 6, enemy.y + 2, 4, 4);
      
      // Draw bullets
      if (enemy.bullets) {
        enemy.bullets.forEach(bullet => {
          ctx.fillStyle = '#FF0000';
          ctx.beginPath();
          ctx.arc(bullet.x, bullet.y, 4, 0, Math.PI * 2);
          ctx.fill();
        });
      }
    });
    
    // Draw switches and doors
    levelData.switches.forEach(switchObj => {
      ctx.fillStyle = switchObj.pressed ? '#00FF00' : '#FF0000';
      ctx.fillRect(switchObj.x, switchObj.y, switchObj.width, switchObj.height);
    });
    
    levelData.doors.forEach(door => {
      if (!door.open) {
        ctx.fillStyle = '#8B4513';
        ctx.fillRect(door.x, door.y, door.width, door.height);
        
        // Door handle
        ctx.fillStyle = '#FFD700';
        ctx.beginPath();
        ctx.arc(door.x + door.width - 5, door.y + door.height/2, 3, 0, Math.PI * 2);
        ctx.fill();
      }
    });
    
    // Draw portals
    levelData.portals.forEach(portal => {
      const time = Date.now() * 0.01;
      ctx.save();
      ctx.translate(portal.x + portal.width/2, portal.y + portal.height/2);
      
      // Portal swirl effect
      for (let i = 0; i < 8; i++) {
        ctx.strokeStyle = `hsl(${(time * 50 + i * 45) % 360}, 70%, 50%)`;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(0, 0, 10 + i * 2, time + i * 0.5, time + i * 0.5 + Math.PI);
        ctx.stroke();
      }
      
      ctx.restore();
    });
    
    // Draw player
    ctx.save();
    
    // Player flashing when invulnerable
    if (player.invulnerable > 0 && Math.floor(player.invulnerable / 5) % 2 === 0) {
      ctx.globalAlpha = 0.5;
    }
    
    ctx.fillStyle = '#4169E1';
    ctx.fillRect(player.x, player.y, player.width, player.height);
    
    // Player face
    ctx.fillStyle = '#FFFFFF';
    const eyeOffset = player.facingRight ? 4 : -4;
    ctx.fillRect(player.x + 6 + eyeOffset, player.y + 8, 3, 3);
    ctx.fillRect(player.x + 12 + eyeOffset, player.y + 8, 3, 3);
    
    // Player mouth
    ctx.fillStyle = '#000000';
    ctx.fillRect(player.x + 8 + eyeOffset, player.y + 16, 6, 2);
    
    ctx.restore();
    
    // Draw particles
    particles.forEach(particle => {
      ctx.save();
      ctx.globalAlpha = particle.alpha;
      ctx.fillStyle = particle.color;
      ctx.beginPath();
      ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });
    
    ctx.restore(); // Restore camera transform
  };

  const startGame = () => {
    setGameState('playing');
    setCurrentWorld(1);
    setCurrentLevel(1);
    setGameStats({
      lives: 3,
      score: 0,
      coins: 0,
      keys: 0,
      gems: 0,
      totalTime: 0,
      levelTime: 0,
      worldsCompleted: 0,
      levelsCompleted: 0
    });
    loadLevel(1, 1);
  };

  const pauseGame = () => {
    setGameState(gameState === 'paused' ? 'playing' : 'paused');
  };

  const restartGame = () => {
    setGameState('menu');
  };

  return (
    <div className="puzzle-platform-game">
      <canvas
        ref={canvasRef}
        width={800}
        height={600}
        className="game-canvas"
      />
      
      {/* Game HUD */}
      {gameState === 'playing' && (
        <div className="game-hud">
          {/* Top HUD */}
          <div className="top-hud">
            <div className="player-stats">
              <div className="health-display">
                {[...Array(player.maxHealth)].map((_, i) => (
                  <Heart 
                    key={i} 
                    size={20} 
                    className={i < player.health ? 'heart filled' : 'heart empty'} 
                  />
                ))}
              </div>
              <div className="lives-display">
                <Crown size={16} />
                <span>x{gameStats.lives}</span>
              </div>
            </div>
            
            <div className="level-info">
              <h3>World {currentWorld} - Level {currentLevel}</h3>
              <div className="time">Time: {Math.floor(gameStats.levelTime / 60)}:{(gameStats.levelTime % 60).toString().padStart(2, '0')}</div>
            </div>
            
            <div className="collectibles-display">
              <div className="collectible-item">
                <div className="coin-icon">🪙</div>
                <span>{gameStats.coins}</span>
              </div>
              <div className="collectible-item">
                <Key size={16} />
                <span>{gameStats.keys}</span>
              </div>
              <div className="collectible-item">
                <Diamond size={16} />
                <span>{gameStats.gems}</span>
              </div>
              <div className="collectible-item">
                <Star size={16} />
                <span>{gameStats.score}</span>
              </div>
            </div>
          </div>
          
          {/* Controls HUD */}
          <div className="controls-hud">
            <button onClick={pauseGame} className="control-btn">
              <Pause size={16} />
            </button>
            <button onClick={restartGame} className="control-btn">
              <RotateCcw size={16} />
            </button>
          </div>
          
          {/* Mobile Controls */}
          <div className="mobile-controls">
            <div className="d-pad">
              <button className="d-pad-btn up" onTouchStart={() => setKeys(prev => ({ ...prev, 'w': true }))} onTouchEnd={() => setKeys(prev => ({ ...prev, 'w': false }))}>
                <ArrowUp size={20} />
              </button>
              <button className="d-pad-btn left" onTouchStart={() => setKeys(prev => ({ ...prev, 'a': true }))} onTouchEnd={() => setKeys(prev => ({ ...prev, 'a': false }))}>
                <ArrowLeft size={20} />
              </button>
              <button className="d-pad-btn right" onTouchStart={() => setKeys(prev => ({ ...prev, 'd': true }))} onTouchEnd={() => setKeys(prev => ({ ...prev, 'd': false }))}>
                <ArrowRight size={20} />
              </button>
              <button className="d-pad-btn down" onTouchStart={() => setKeys(prev => ({ ...prev, 's': true }))} onTouchEnd={() => setKeys(prev => ({ ...prev, 's': false }))}>
                <ArrowDown size={20} />
              </button>
            </div>
            
            <button className="jump-btn" onTouchStart={() => setKeys(prev => ({ ...prev, ' ': true }))} onTouchEnd={() => setKeys(prev => ({ ...prev, ' ': false }))}>
              <Zap size={24} />
              Jump
            </button>
          </div>
        </div>
      )}

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
              <h1>Puzzle Platform Adventure</h1>
              <p>Navigate through challenging worlds filled with puzzles, enemies, and treasures!</p>
              
              <div className="game-features">
                <div className="feature">
                  <Map size={20} />
                  <span>3 Unique Worlds</span>
                </div>
                <div className="feature">
                  <Trophy size={20} />
                  <span>Physics Puzzles</span>
                </div>
                <div className="feature">
                  <Diamond size={20} />
                  <span>Collectible Treasures</span>
                </div>
                <div className="feature">
                  <Crown size={20} />
                  <span>Boss Battles</span>
                </div>
              </div>
              
              <div className="controls-info">
                <h3>Controls</h3>
                <div className="control-item">
                  <span>Move:</span>
                  <div className="key-combo">
                    <span className="key">A</span>
                    <span className="key">D</span>
                    <span>or Arrow Keys</span>
                  </div>
                </div>
                <div className="control-item">
                  <span>Jump:</span>
                  <div className="key-combo">
                    <span className="key">Space</span>
                    <span>or</span>
                    <span className="key">W</span>
                  </div>
                </div>
              </div>
              
              <button className="start-btn" onClick={startGame}>
                <Play size={20} />
                Start Adventure
              </button>
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
              <h2>Game Over</h2>
              
              <div className="final-stats">
                <div className="final-stat">
                  <Star size={20} />
                  <span>Final Score: {gameStats.score}</span>
                </div>
                <div className="final-stat">
                  <Trophy size={20} />
                  <span>Levels Completed: {gameStats.levelsCompleted}</span>
                </div>
                <div className="final-stat">
                  <Diamond size={20} />
                  <span>Gems Collected: {gameStats.gems}</span>
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

      {/* Victory Screen */}
      <AnimatePresence>
        {gameState === 'victory' && (
          <motion.div
            className="victory-screen"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
          >
            <div className="victory-content">
              <h2>🎉 VICTORY! 🎉</h2>
              <p>Congratulations! You've completed all worlds!</p>
              
              <div className="final-stats">
                <div className="final-stat">
                  <Star size={20} />
                  <span>Final Score: {gameStats.score}</span>
                </div>
                <div className="final-stat">
                  <Crown size={20} />
                  <span>Worlds Completed: {gameStats.worldsCompleted}</span>
                </div>
                <div className="final-stat">
                  <Trophy size={20} />
                  <span>Total Time: {Math.floor(gameStats.totalTime / 3600)}:{Math.floor((gameStats.totalTime % 3600) / 60).toString().padStart(2, '0')}:{(gameStats.totalTime % 60).toString().padStart(2, '0')}</span>
                </div>
              </div>
              
              <div className="victory-buttons">
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

export default PuzzlePlatformGame;