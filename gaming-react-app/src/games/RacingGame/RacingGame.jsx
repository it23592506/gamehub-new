import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Car, 
  Trophy, 
  Timer, 
  Zap, 
  Settings, 
  Play,
  Pause,
  RotateCcw,
  MapPin,
  Medal,
  Crown,
  Gauge
} from 'lucide-react';
import './RacingGame.css';

const RacingGame = () => {
  const canvasRef = useRef(null);
  const gameLoopRef = useRef(null);
  const [gameState, setGameState] = useState('menu'); // menu, racing, paused, finished
  const [selectedTrack, setSelectedTrack] = useState(0);
  const [selectedCar, setSelectedCar] = useState(0);
  
  const [raceData, setRaceData] = useState({
    lap: 1,
    totalLaps: 3,
    time: 0,
    bestTime: null,
    speed: 0,
    position: 1,
    totalCars: 8,
    checkpoints: []
  });

  const [player, setPlayer] = useState({
    x: 100,
    y: 300,
    angle: 0,
    speed: 0,
    maxSpeed: 8,
    acceleration: 0.3,
    friction: 0.85,
    turnSpeed: 0.08,
    nitro: 100,
    usingNitro: false
  });

  const [opponents, setOpponents] = useState([]);
  const [powerUps, setPowerUps] = useState([]);
  const [particles, setParticles] = useState([]);
  const [keys, setKeys] = useState({});

  const tracks = [
    {
      name: "Speed Circuit",
      difficulty: "Easy",
      laps: 3,
      record: "1:45.23",
      background: "#2d5a27",
      checkpoints: [
        { x: 200, y: 150 },
        { x: 600, y: 100 },
        { x: 700, y: 400 },
        { x: 300, y: 500 }
      ]
    },
    {
      name: "Mountain Pass",
      difficulty: "Medium", 
      laps: 4,
      record: "2:12.45",
      background: "#4a4a4a",
      checkpoints: [
        { x: 150, y: 200 },
        { x: 400, y: 80 },
        { x: 650, y: 200 },
        { x: 500, y: 450 },
        { x: 200, y: 400 }
      ]
    },
    {
      name: "City Grand Prix",
      difficulty: "Hard",
      laps: 5,
      record: "2:58.12",
      background: "#1a1a2e",
      checkpoints: [
        { x: 180, y: 120 },
        { x: 450, y: 100 },
        { x: 720, y: 200 },
        { x: 650, y: 450 },
        { x: 350, y: 500 },
        { x: 150, y: 350 }
      ]
    }
  ];

  const cars = [
    {
      name: "Speedster",
      maxSpeed: 8,
      acceleration: 0.3,
      handling: 0.08,
      color: "#ff4444",
      nitroCapacity: 100
    },
    {
      name: "Thunder",
      maxSpeed: 7,
      acceleration: 0.4,
      handling: 0.1,
      color: "#4444ff",
      nitroCapacity: 120
    },
    {
      name: "Lightning",
      maxSpeed: 9,
      acceleration: 0.25,
      handling: 0.06,
      color: "#ffaa00",
      nitroCapacity: 90
    },
    {
      name: "Phantom",
      maxSpeed: 7.5,
      acceleration: 0.35,
      handling: 0.09,
      color: "#aa44ff",
      nitroCapacity: 110
    }
  ];

  // Initialize game
  useEffect(() => {
    generateOpponents();
    generatePowerUps();
  }, []);

  // Game loop
  useEffect(() => {
    if (gameState === 'racing') {
      gameLoopRef.current = setInterval(() => {
        updateGame();
        render();
      }, 16);
    } else {
      clearInterval(gameLoopRef.current);
    }
    return () => clearInterval(gameLoopRef.current);
  }, [gameState, keys]);

  // Input handling
  useEffect(() => {
    const handleKeyDown = (e) => {
      setKeys(prev => ({ ...prev, [e.key.toLowerCase()]: true }));
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

  // Timer
  useEffect(() => {
    let interval;
    if (gameState === 'racing') {
      interval = setInterval(() => {
        setRaceData(prev => ({ ...prev, time: prev.time + 0.01 }));
      }, 10);
    }
    return () => clearInterval(interval);
  }, [gameState]);

  const generateOpponents = () => {
    const newOpponents = [];
    const currentTrack = tracks[selectedTrack];
    
    for (let i = 0; i < 7; i++) {
      newOpponents.push({
        id: i,
        x: 80 + (i * 15),
        y: 300 + (i * 5),
        angle: 0,
        speed: 0,
        maxSpeed: 6 + Math.random() * 2,
        color: `hsl(${Math.random() * 360}, 70%, 50%)`,
        ai: {
          targetCheckpoint: 0,
          aggressiveness: Math.random(),
          skill: 0.7 + Math.random() * 0.3
        },
        lap: 1,
        totalTime: 0
      });
    }
    setOpponents(newOpponents);
  };

  const generatePowerUps = () => {
    const newPowerUps = [];
    const currentTrack = tracks[selectedTrack];
    const types = ['nitro', 'speed', 'shield', 'repair'];
    
    for (let i = 0; i < 8; i++) {
      newPowerUps.push({
        id: i,
        x: Math.random() * 700 + 50,
        y: Math.random() * 500 + 50,
        type: types[Math.floor(Math.random() * types.length)],
        collected: false,
        respawnTime: 0,
        angle: 0
      });
    }
    setPowerUps(newPowerUps);
  };

  const updateGame = () => {
    updatePlayer();
    updateOpponents();
    updatePowerUps();
    updateParticles();
    checkCollisions();
    checkCheckpoints();
    updateRacePosition();
  };

  const updatePlayer = () => {
    setPlayer(prev => {
      let newPlayer = { ...prev };
      const selectedCarData = cars[selectedCar];

      // Handle input
      if (keys['arrowup'] || keys['w']) {
        newPlayer.speed = Math.min(newPlayer.speed + selectedCarData.acceleration, selectedCarData.maxSpeed);
        
        // Nitro boost
        if ((keys['shift'] || keys[' ']) && newPlayer.nitro > 0 && !newPlayer.usingNitro) {
          newPlayer.usingNitro = true;
          newPlayer.speed *= 1.5;
          newPlayer.nitro -= 2;
        } else if (!(keys['shift'] || keys[' ']) && newPlayer.usingNitro) {
          newPlayer.usingNitro = false;
        }
      }
      
      if (keys['arrowdown'] || keys['s']) {
        newPlayer.speed = Math.max(newPlayer.speed - selectedCarData.acceleration, -selectedCarData.maxSpeed * 0.5);
      }
      
      if (keys['arrowleft'] || keys['a']) {
        newPlayer.angle -= selectedCarData.handling * Math.max(0.3, Math.abs(newPlayer.speed) / selectedCarData.maxSpeed);
      }
      
      if (keys['arrowright'] || keys['d']) {
        newPlayer.angle += selectedCarData.handling * Math.max(0.3, Math.abs(newPlayer.speed) / selectedCarData.maxSpeed);
      }

      // Apply friction
      newPlayer.speed *= 0.98;

      // Update position
      newPlayer.x += Math.cos(newPlayer.angle) * newPlayer.speed;
      newPlayer.y += Math.sin(newPlayer.angle) * newPlayer.speed;

      // Boundary checking with track bounds
      newPlayer.x = Math.max(20, Math.min(780, newPlayer.x));
      newPlayer.y = Math.max(20, Math.min(580, newPlayer.y));

      // Regenerate nitro slowly
      if (newPlayer.nitro < selectedCarData.nitroCapacity && !newPlayer.usingNitro) {
        newPlayer.nitro += 0.1;
      }

      // Create particles when moving fast
      if (Math.abs(newPlayer.speed) > 4) {
        setParticles(prevParticles => [...prevParticles, {
          x: newPlayer.x - Math.cos(newPlayer.angle) * 20,
          y: newPlayer.y - Math.sin(newPlayer.angle) * 20,
          vx: (Math.random() - 0.5) * 2,
          vy: (Math.random() - 0.5) * 2,
          life: 20,
          color: newPlayer.usingNitro ? '#00ffff' : '#888888'
        }]);
      }

      return newPlayer;
    });

    // Update speed display
    setRaceData(prev => ({ ...prev, speed: Math.abs(player.speed * 20) }));
  };

  const updateOpponents = () => {
    setOpponents(prev => prev.map(opponent => {
      const currentTrack = tracks[selectedTrack];
      const targetCheckpoint = currentTrack.checkpoints[opponent.ai.targetCheckpoint];
      
      if (targetCheckpoint) {
        // AI steering towards checkpoint
        const dx = targetCheckpoint.x - opponent.x;
        const dy = targetCheckpoint.y - opponent.y;
        const targetAngle = Math.atan2(dy, dx);
        
        let angleDiff = targetAngle - opponent.angle;
        while (angleDiff > Math.PI) angleDiff -= 2 * Math.PI;
        while (angleDiff < -Math.PI) angleDiff += 2 * Math.PI;
        
        opponent.angle += Math.sign(angleDiff) * Math.min(Math.abs(angleDiff), 0.1) * opponent.ai.skill;
        
        // AI speed control
        const distanceToCheckpoint = Math.sqrt(dx * dx + dy * dy);
        if (distanceToCheckpoint > 50) {
          opponent.speed = Math.min(opponent.speed + 0.2, opponent.maxSpeed * opponent.ai.skill);
        } else {
          opponent.speed *= 0.9;
        }
      }

      // Update position
      opponent.x += Math.cos(opponent.angle) * opponent.speed;
      opponent.y += Math.sin(opponent.angle) * opponent.speed;
      
      // Boundary checking
      opponent.x = Math.max(20, Math.min(780, opponent.x));
      opponent.y = Math.max(20, Math.min(580, opponent.y));
      
      return opponent;
    }));
  };

  const updatePowerUps = () => {
    setPowerUps(prev => prev.map(powerUp => {
      powerUp.angle += 0.05;
      
      if (powerUp.collected && Date.now() > powerUp.respawnTime) {
        powerUp.collected = false;
      }
      
      return powerUp;
    }));
  };

  const updateParticles = () => {
    setParticles(prev => prev.filter(particle => {
      particle.x += particle.vx;
      particle.y += particle.vy;
      particle.life--;
      return particle.life > 0;
    }));
  };

  const checkCollisions = () => {
    // Player vs PowerUps
    setPowerUps(prev => prev.map(powerUp => {
      if (!powerUp.collected) {
        const dx = powerUp.x - player.x;
        const dy = powerUp.y - player.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < 25) {
          applyPowerUp(powerUp.type);
          powerUp.collected = true;
          powerUp.respawnTime = Date.now() + 15000;
        }
      }
      return powerUp;
    }));
  };

  const applyPowerUp = (type) => {
    switch (type) {
      case 'nitro':
        setPlayer(prev => ({ ...prev, nitro: Math.min(cars[selectedCar].nitroCapacity, prev.nitro + 30) }));
        break;
      case 'speed':
        setPlayer(prev => ({ ...prev, maxSpeed: prev.maxSpeed + 1 }));
        setTimeout(() => {
          setPlayer(prev => ({ ...prev, maxSpeed: cars[selectedCar].maxSpeed }));
        }, 5000);
        break;
      case 'shield':
        // Temporary invincibility effect
        break;
      case 'repair':
        // Restore car condition
        break;
    }
  };

  const checkCheckpoints = () => {
    const currentTrack = tracks[selectedTrack];
    const nextCheckpoint = raceData.checkpoints.length;
    
    if (nextCheckpoint < currentTrack.checkpoints.length) {
      const checkpoint = currentTrack.checkpoints[nextCheckpoint];
      const dx = checkpoint.x - player.x;
      const dy = checkpoint.y - player.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      if (distance < 40) {
        setRaceData(prev => ({
          ...prev,
          checkpoints: [...prev.checkpoints, nextCheckpoint]
        }));
        
        // Check if lap completed
        if (nextCheckpoint === currentTrack.checkpoints.length - 1) {
          completeLap();
        }
      }
    }
  };

  const completeLap = () => {
    setRaceData(prev => {
      const newLap = prev.lap + 1;
      
      if (newLap > prev.totalLaps) {
        // Race finished
        setGameState('finished');
        return {
          ...prev,
          bestTime: prev.bestTime ? Math.min(prev.bestTime, prev.time) : prev.time
        };
      }
      
      return {
        ...prev,
        lap: newLap,
        checkpoints: []
      };
    });
  };

  const updateRacePosition = () => {
    // Simple position calculation based on lap and checkpoints
    const playerProgress = raceData.lap * 1000 + raceData.checkpoints.length * 100;
    let position = 1;
    
    opponents.forEach(opponent => {
      const opponentProgress = opponent.lap * 1000 + (opponent.ai.targetCheckpoint * 100);
      if (opponentProgress > playerProgress) {
        position++;
      }
    });
    
    setRaceData(prev => ({ ...prev, position }));
  };

  const render = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const currentTrack = tracks[selectedTrack];
    
    // Clear canvas
    ctx.fillStyle = currentTrack.background;
    ctx.fillRect(0, 0, 800, 600);
    
    // Draw track elements
    drawTrack(ctx, currentTrack);
    
    // Draw power-ups
    powerUps.forEach(powerUp => {
      if (!powerUp.collected) {
        drawPowerUp(ctx, powerUp);
      }
    });
    
    // Draw particles
    particles.forEach(particle => {
      ctx.globalAlpha = particle.life / 20;
      ctx.fillStyle = particle.color;
      ctx.fillRect(particle.x - 2, particle.y - 2, 4, 4);
    });
    ctx.globalAlpha = 1;
    
    // Draw opponents
    opponents.forEach(opponent => {
      drawCar(ctx, opponent, opponent.color);
    });
    
    // Draw player
    drawCar(ctx, player, cars[selectedCar].color);
    
    // Draw checkpoints
    currentTrack.checkpoints.forEach((checkpoint, index) => {
      const passed = raceData.checkpoints.includes(index);
      ctx.fillStyle = passed ? '#00ff00' : '#ffff00';
      ctx.globalAlpha = 0.7;
      ctx.beginPath();
      ctx.arc(checkpoint.x, checkpoint.y, 30, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;
      
      ctx.fillStyle = '#000000';
      ctx.font = '16px Arial';
      ctx.textAlign = 'center';
      ctx.fillText((index + 1).toString(), checkpoint.x, checkpoint.y + 5);
    });
  };

  const drawTrack = (ctx, track) => {
    // Draw track boundaries and decorations
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 3;
    ctx.setLineDash([10, 5]);
    
    // Draw start/finish line
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 5;
    ctx.setLineDash([]);
    ctx.beginPath();
    ctx.moveTo(80, 280);
    ctx.lineTo(120, 320);
    ctx.stroke();
  };

  const drawCar = (ctx, car, color) => {
    ctx.save();
    ctx.translate(car.x, car.y);
    ctx.rotate(car.angle);
    
    // Car body
    ctx.fillStyle = color;
    ctx.fillRect(-15, -8, 30, 16);
    
    // Car details
    ctx.fillStyle = '#333333';
    ctx.fillRect(-12, -6, 24, 4);
    ctx.fillRect(-12, 2, 24, 4);
    
    // Wheels
    ctx.fillStyle = '#000000';
    ctx.fillRect(-10, -10, 4, 4);
    ctx.fillRect(-10, 6, 4, 4);
    ctx.fillRect(6, -10, 4, 4);
    ctx.fillRect(6, 6, 4, 4);
    
    ctx.restore();
  };

  const drawPowerUp = (ctx, powerUp) => {
    ctx.save();
    ctx.translate(powerUp.x, powerUp.y);
    ctx.rotate(powerUp.angle);
    
    const colors = {
      nitro: '#00ffff',
      speed: '#ffaa00',
      shield: '#0088ff',
      repair: '#00ff00'
    };
    
    ctx.fillStyle = colors[powerUp.type];
    ctx.fillRect(-8, -8, 16, 16);
    
    ctx.restore();
  };

  const startRace = () => {
    setGameState('racing');
    setRaceData({
      lap: 1,
      totalLaps: tracks[selectedTrack].laps,
      time: 0,
      bestTime: null,
      speed: 0,
      position: 1,
      totalCars: 8,
      checkpoints: []
    });
    setPlayer(prev => ({ ...prev, x: 100, y: 300, angle: 0, speed: 0, nitro: cars[selectedCar].nitroCapacity }));
    generateOpponents();
  };

  const pauseRace = () => {
    setGameState(gameState === 'paused' ? 'racing' : 'paused');
  };

  const restartRace = () => {
    setGameState('menu');
    setRaceData({
      lap: 1,
      totalLaps: 3,
      time: 0,
      bestTime: null,
      speed: 0,
      position: 1,
      totalCars: 8,
      checkpoints: []
    });
  };

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = (time % 60).toFixed(2);
    return `${minutes}:${seconds.padStart(5, '0')}`;
  };

  return (
    <div className="racing-game">
      <canvas
        ref={canvasRef}
        width={800}
        height={600}
        className="game-canvas"
      />
      
      {/* Race HUD */}
      {gameState === 'racing' && (
        <div className="race-hud">
          <div className="hud-top">
            <div className="race-info">
              <div className="info-item">
                <Timer size={16} />
                <span>{formatTime(raceData.time)}</span>
              </div>
              <div className="info-item">
                <Medal size={16} />
                <span>Lap {raceData.lap}/{raceData.totalLaps}</span>
              </div>
              <div className="info-item">
                <Crown size={16} />
                <span>Position: {raceData.position}/{raceData.totalCars}</span>
              </div>
            </div>
            
            <div className="controls">
              <button onClick={pauseRace} className="control-btn">
                {gameState === 'paused' ? <Play size={20} /> : <Pause size={20} />}
              </button>
              <button onClick={restartRace} className="control-btn">
                <RotateCcw size={20} />
              </button>
            </div>
          </div>
          
          <div className="hud-bottom">
            <div className="speed-gauge">
              <Gauge size={20} />
              <div className="speed-bar">
                <div 
                  className="speed-fill" 
                  style={{ width: `${(raceData.speed / (cars[selectedCar].maxSpeed * 20)) * 100}%` }}
                />
              </div>
              <span>{Math.round(raceData.speed)} MPH</span>
            </div>
            
            <div className="nitro-gauge">
              <Zap size={20} />
              <div className="nitro-bar">
                <div 
                  className="nitro-fill" 
                  style={{ width: `${player.nitro}%` }}
                />
              </div>
              <span>{Math.round(player.nitro)}%</span>
            </div>
          </div>
        </div>
      )}

      {/* Menu Screen */}
      <AnimatePresence>
        {gameState === 'menu' && (
          <motion.div
            className="race-menu"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="menu-header">
              <h1>Racing Championship</h1>
              <p>Choose your track and car to begin the ultimate racing experience!</p>
            </div>
            
            <div className="menu-content">
              <div className="track-selection">
                <h3>Select Track</h3>
                <div className="track-grid">
                  {tracks.map((track, index) => (
                    <div 
                      key={index}
                      className={`track-card ${selectedTrack === index ? 'selected' : ''}`}
                      onClick={() => setSelectedTrack(index)}
                    >
                      <div className="track-preview" style={{ background: track.background }}>
                        <MapPin size={24} />
                      </div>
                      <div className="track-info">
                        <h4>{track.name}</h4>
                        <p className={`difficulty ${track.difficulty.toLowerCase()}`}>
                          {track.difficulty}
                        </p>
                        <p>{track.laps} Laps</p>
                        <p className="record">Record: {track.record}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="car-selection">
                <h3>Select Car</h3>
                <div className="car-grid">
                  {cars.map((car, index) => (
                    <div 
                      key={index}
                      className={`car-card ${selectedCar === index ? 'selected' : ''}`}
                      onClick={() => setSelectedCar(index)}
                    >
                      <div className="car-preview" style={{ background: car.color }}>
                        <Car size={32} />
                      </div>
                      <div className="car-info">
                        <h4>{car.name}</h4>
                        <div className="car-stats">
                          <div className="stat">
                            <span>Speed:</span>
                            <div className="stat-bar">
                              <div style={{ width: `${(car.maxSpeed / 10) * 100}%` }} />
                            </div>
                          </div>
                          <div className="stat">
                            <span>Accel:</span>
                            <div className="stat-bar">
                              <div style={{ width: `${(car.acceleration / 0.5) * 100}%` }} />
                            </div>
                          </div>
                          <div className="stat">
                            <span>Handle:</span>
                            <div className="stat-bar">
                              <div style={{ width: `${(car.handling / 0.12) * 100}%` }} />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="menu-footer">
              <button className="start-race-btn" onClick={startRace}>
                <Play size={20} />
                Start Race
              </button>
              
              <div className="controls-info">
                <h4>Controls:</h4>
                <div className="control-list">
                  <span>↑/W - Accelerate</span>
                  <span>↓/S - Brake</span>
                  <span>←→/AD - Steer</span>
                  <span>SHIFT/SPACE - Nitro</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Paused Screen */}
      <AnimatePresence>
        {gameState === 'paused' && (
          <motion.div
            className="pause-screen"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="pause-content">
              <h2>Race Paused</h2>
              <div className="pause-buttons">
                <button onClick={pauseRace} className="resume-btn">
                  <Play size={20} />
                  Resume
                </button>
                <button onClick={restartRace} className="menu-btn">
                  Menu
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Finished Screen */}
      <AnimatePresence>
        {gameState === 'finished' && (
          <motion.div
            className="finish-screen"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
          >
            <div className="finish-content">
              <h2>{raceData.position === 1 ? 'VICTORY!' : 'RACE COMPLETE'}</h2>
              
              <div className="race-results">
                <div className="result-item">
                  <Trophy size={24} />
                  <span>Position: {raceData.position}/{raceData.totalCars}</span>
                </div>
                <div className="result-item">
                  <Timer size={24} />
                  <span>Time: {formatTime(raceData.time)}</span>
                </div>
                {raceData.bestTime && (
                  <div className="result-item">
                    <Medal size={24} />
                    <span>Best: {formatTime(raceData.bestTime)}</span>
                  </div>
                )}
              </div>
              
              <div className="finish-buttons">
                <button onClick={startRace} className="race-again-btn">
                  Race Again
                </button>
                <button onClick={restartRace} className="menu-btn">
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

export default RacingGame;