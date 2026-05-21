import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Hammer, 
  Zap, 
  Shield, 
  Users, 
  Coins, 
  Home, 
  Swords,
  Crown,
  Settings,
  Play,
  Pause,
  RotateCcw,
  Plus,
  Target,
  Wrench,
  Star,
  Trophy,
  Map
} from 'lucide-react';
import './RTSGame.css';

const RTSGame = () => {
  const canvasRef = useRef(null);
  const gameLoopRef = useRef(null);
  const [gameState, setGameState] = useState('menu');
  const [selectedUnits, setSelectedUnits] = useState([]);
  const [selectedBuilding, setSelectedBuilding] = useState(null);
  const [buildMode, setBuildMode] = useState(null);
  const [dragSelection, setDragSelection] = useState({ active: false, start: null, end: null });
  
  const [resources, setResources] = useState({
    gold: 1000,
    wood: 500,
    stone: 300,
    food: 200,
    population: 5,
    maxPopulation: 20
  });

  const [gameStats, setGameStats] = useState({
    unitsProduced: 0,
    buildingsConstructed: 0,
    enemiesDefeated: 0,
    score: 0,
    gameTime: 0
  });

  const [buildings, setBuildings] = useState([
    { id: 1, type: 'townhall', x: 100, y: 150, health: 500, maxHealth: 500, player: 'human', constructionProgress: 100 },
    { id: 2, type: 'barracks', x: 200, y: 200, health: 300, maxHealth: 300, player: 'human', constructionProgress: 100 },
    { id: 3, type: 'townhall', x: 600, y: 400, health: 500, maxHealth: 500, player: 'ai', constructionProgress: 100 }
  ]);

  const [units, setUnits] = useState([
    { id: 1, type: 'worker', x: 120, y: 180, health: 50, maxHealth: 50, player: 'human', target: null, task: 'idle', moveTarget: null },
    { id: 2, type: 'soldier', x: 220, y: 220, health: 100, maxHealth: 100, player: 'human', target: null, task: 'idle', moveTarget: null },
    { id: 3, type: 'archer', x: 180, y: 250, health: 80, maxHealth: 80, player: 'human', target: null, task: 'idle', moveTarget: null },
    { id: 4, type: 'soldier', x: 620, y: 420, health: 100, maxHealth: 100, player: 'ai', target: null, task: 'patrol', moveTarget: null }
  ]);

  const [resources_sources, setResourceSources] = useState([
    { id: 1, type: 'gold', x: 300, y: 100, amount: 1000 },
    { id: 2, type: 'wood', x: 400, y: 300, amount: 800 },
    { id: 3, type: 'stone', x: 150, y: 450, amount: 600 },
    { id: 4, type: 'gold', x: 650, y: 200, amount: 1000 }
  ]);

  const [projectiles, setProjectiles] = useState([]);
  const [effects, setEffects] = useState([]);
  const [aiLastAction, setAiLastAction] = useState(0);

  const buildingTypes = {
    townhall: { name: "Town Hall", cost: { gold: 400, wood: 300, stone: 200 }, health: 500, size: 40, produces: [], description: "Main building" },
    barracks: { name: "Barracks", cost: { gold: 150, wood: 100 }, health: 300, size: 30, produces: ['soldier', 'archer'], description: "Trains military units" },
    farm: { name: "Farm", cost: { gold: 50, wood: 75 }, health: 150, size: 25, produces: [], description: "Increases food production" },
    mine: { name: "Mine", cost: { gold: 100, wood: 50, stone: 25 }, health: 200, size: 25, produces: [], description: "Increases gold production" },
    tower: { name: "Guard Tower", cost: { gold: 200, wood: 100, stone: 150 }, health: 400, size: 20, produces: [], description: "Defensive structure" }
  };

  const unitTypes = {
    worker: { name: "Worker", cost: { gold: 50, food: 1 }, health: 50, speed: 1.5, damage: 5, range: 20, description: "Gathers resources and builds" },
    soldier: { name: "Soldier", cost: { gold: 100, food: 2 }, health: 100, speed: 1.2, damage: 25, range: 30, description: "Melee combat unit" },
    archer: { name: "Archer", cost: { gold: 80, food: 1 }, health: 80, speed: 1.3, damage: 20, range: 100, description: "Ranged combat unit" },
    knight: { name: "Knight", cost: { gold: 200, food: 3 }, health: 150, speed: 1.0, damage: 40, range: 30, description: "Heavy combat unit" }
  };

  // Input handling
  const [keys, setKeys] = useState({});
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

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

  // Canvas interaction
  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      canvas.addEventListener('mousedown', handleMouseDown);
      canvas.addEventListener('mousemove', handleMouseMove);
      canvas.addEventListener('mouseup', handleMouseUp);
      canvas.addEventListener('contextmenu', handleRightClick);
      
      return () => {
        canvas.removeEventListener('mousedown', handleMouseDown);
        canvas.removeEventListener('mousemove', handleMouseMove);
        canvas.removeEventListener('mouseup', handleMouseUp);
        canvas.removeEventListener('contextmenu', handleRightClick);
      };
    }
  }, [buildMode, selectedUnits]);

  const getMousePos = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
  };

  const handleMouseDown = (e) => {
    if (gameState !== 'playing') return;
    
    const pos = getMousePos(e);
    
    if (buildMode) {
      tryBuildStructure(pos.x, pos.y);
      return;
    }

    // Start drag selection
    setDragSelection({
      active: true,
      start: pos,
      end: pos
    });
  };

  const handleMouseMove = (e) => {
    const pos = getMousePos(e);
    setMousePos(pos);
    
    if (dragSelection.active) {
      setDragSelection(prev => ({
        ...prev,
        end: pos
      }));
    }
  };

  const handleMouseUp = (e) => {
    if (gameState !== 'playing') return;
    
    const pos = getMousePos(e);
    
    if (dragSelection.active) {
      // Complete selection
      const selection = getUnitsInSelection(dragSelection.start, pos);
      setSelectedUnits(selection.filter(unit => unit.player === 'human'));
      
      setDragSelection({ active: false, start: null, end: null });
    }
  };

  const handleRightClick = (e) => {
    e.preventDefault();
    if (gameState !== 'playing') return;
    
    const pos = getMousePos(e);
    
    if (selectedUnits.length > 0) {
      // Check for target
      const targetBuilding = buildings.find(building => 
        Math.sqrt(Math.pow(building.x - pos.x, 2) + Math.pow(building.y - pos.y, 2)) < building.size ||
        (building.player !== 'human' && Math.sqrt(Math.pow(building.x - pos.x, 2) + Math.pow(building.y - pos.y, 2)) < 50)
      );
      
      const targetUnit = units.find(unit => 
        unit.player !== 'human' && 
        Math.sqrt(Math.pow(unit.x - pos.x, 2) + Math.pow(unit.y - pos.y, 2)) < 20
      );

      const resourceSource = resources_sources.find(source =>
        Math.sqrt(Math.pow(source.x - pos.x, 2) + Math.pow(source.y - pos.y, 2)) < 30
      );

      if (targetBuilding && targetBuilding.player !== 'human') {
        // Attack building
        setSelectedUnits(prev => prev.map(unit => ({
          ...unit,
          target: targetBuilding,
          task: 'attack',
          moveTarget: { x: targetBuilding.x, y: targetBuilding.y }
        })));
      } else if (targetUnit) {
        // Attack unit
        setSelectedUnits(prev => prev.map(unit => ({
          ...unit,
          target: targetUnit,
          task: 'attack',
          moveTarget: { x: targetUnit.x, y: targetUnit.y }
        })));
      } else if (resourceSource) {
        // Gather resources (workers only)
        setSelectedUnits(prev => prev.map(unit => {
          if (unit.type === 'worker') {
            return {
              ...unit,
              target: resourceSource,
              task: 'gather',
              moveTarget: { x: resourceSource.x, y: resourceSource.y }
            };
          }
          return {
            ...unit,
            target: null,
            task: 'move',
            moveTarget: pos
          };
        }));
      } else {
        // Move command
        setSelectedUnits(prev => prev.map(unit => ({
          ...unit,
          target: null,
          task: 'move',
          moveTarget: pos
        })));
      }
      
      // Update units in main state
      setUnits(prev => prev.map(unit => {
        const selected = selectedUnits.find(su => su.id === unit.id);
        return selected || unit;
      }));
    }
  };

  const getUnitsInSelection = (start, end) => {
    const minX = Math.min(start.x, end.x);
    const maxX = Math.max(start.x, end.x);
    const minY = Math.min(start.y, end.y);
    const maxY = Math.max(start.y, end.y);

    return units.filter(unit => 
      unit.x >= minX && unit.x <= maxX && 
      unit.y >= minY && unit.y <= maxY
    );
  };

  const tryBuildStructure = (x, y) => {
    if (!buildMode) return;
    
    const buildingType = buildingTypes[buildMode];
    if (!canAfford(buildingType.cost)) return;
    
    // Check if position is clear
    const tooClose = buildings.some(building => 
      Math.sqrt(Math.pow(building.x - x, 2) + Math.pow(building.y - y, 2)) < building.size + buildingType.size
    );
    
    if (tooClose) return;
    
    // Build structure
    const newBuilding = {
      id: Date.now(),
      type: buildMode,
      x,
      y,
      health: buildingType.health,
      maxHealth: buildingType.health,
      player: 'human',
      constructionProgress: 0
    };
    
    setBuildings(prev => [...prev, newBuilding]);
    
    // Deduct resources
    setResources(prev => ({
      ...prev,
      gold: prev.gold - (buildingType.cost.gold || 0),
      wood: prev.wood - (buildingType.cost.wood || 0),
      stone: prev.stone - (buildingType.cost.stone || 0)
    }));
    
    setGameStats(prev => ({ ...prev, buildingsConstructed: prev.buildingsConstructed + 1 }));
    setBuildMode(null);
  };

  const canAfford = (cost) => {
    return (
      resources.gold >= (cost.gold || 0) &&
      resources.wood >= (cost.wood || 0) &&
      resources.stone >= (cost.stone || 0) &&
      resources.food >= (cost.food || 0)
    );
  };

  const trainUnit = (unitType) => {
    if (!selectedBuilding || !buildingTypes[selectedBuilding.type].produces.includes(unitType)) return;
    
    const cost = unitTypes[unitType].cost;
    if (!canAfford(cost) || resources.population >= resources.maxPopulation) return;
    
    // Create unit near building
    const angle = Math.random() * Math.PI * 2;
    const distance = 50;
    const newUnit = {
      id: Date.now(),
      type: unitType,
      x: selectedBuilding.x + Math.cos(angle) * distance,
      y: selectedBuilding.y + Math.sin(angle) * distance,
      health: unitTypes[unitType].health,
      maxHealth: unitTypes[unitType].health,
      player: 'human',
      target: null,
      task: 'idle',
      moveTarget: null
    };
    
    setUnits(prev => [...prev, newUnit]);
    
    // Deduct resources
    setResources(prev => ({
      ...prev,
      gold: prev.gold - (cost.gold || 0),
      wood: prev.wood - (cost.wood || 0),
      stone: prev.stone - (cost.stone || 0),
      food: prev.food - (cost.food || 0),
      population: prev.population + 1
    }));
    
    setGameStats(prev => ({ ...prev, unitsProduced: prev.unitsProduced + 1 }));
  };

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

  const updateGame = () => {
    setGameStats(prev => ({ ...prev, gameTime: prev.gameTime + 1 }));
    updateUnits();
    updateBuildings();
    updateProjectiles();
    updateEffects();
    updateAI();
    updateResources();
  };

  const updateUnits = () => {
    setUnits(prev => prev.map(unit => {
      // Movement
      if (unit.moveTarget) {
        const dx = unit.moveTarget.x - unit.x;
        const dy = unit.moveTarget.y - unit.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const speed = unitTypes[unit.type].speed;
        
        if (distance > 5) {
          unit.x += (dx / distance) * speed;
          unit.y += (dy / distance) * speed;
        } else {
          // Reached target
          if (unit.task === 'move') {
            unit.task = 'idle';
            unit.moveTarget = null;
          } else if (unit.task === 'gather' && unit.target) {
            // Start gathering
            gatherResource(unit, unit.target);
          } else if (unit.task === 'attack' && unit.target) {
            // Start attacking
            attackTarget(unit, unit.target);
          }
        }
      }
      
      // AI for enemy units
      if (unit.player === 'ai' && unit.task === 'patrol') {
        if (!unit.moveTarget || Math.random() < 0.01) {
          unit.moveTarget = {
            x: 400 + Math.random() * 200,
            y: 300 + Math.random() * 200
          };
        }
      }
      
      return unit;
    }));
  };

  const updateBuildings = () => {
    setBuildings(prev => prev.map(building => {
      if (building.constructionProgress < 100) {
        building.constructionProgress += 2;
      }
      return building;
    }));
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
        dealDamage(projectile.targetId, projectile.damage, projectile.targetType);
        
        // Add hit effect
        setEffects(prev => [...prev, {
          x: projectile.targetX,
          y: projectile.targetY,
          type: 'hit',
          life: 10,
          color: '#ff6b6b'
        }]);
        
        return false;
      }
    }));
  };

  const updateEffects = () => {
    setEffects(prev => prev.filter(effect => {
      effect.life--;
      return effect.life > 0;
    }));
  };

  const updateAI = () => {
    const now = Date.now();
    if (now - aiLastAction > 5000) { // AI acts every 5 seconds
      setAiLastAction(now);
      
      // Simple AI: try to build units if possible
      const aiBarracks = buildings.find(b => b.type === 'barracks' && b.player === 'ai');
      if (aiBarracks && Math.random() < 0.5) {
        // Try to "train" an AI unit (simplified)
        if (units.filter(u => u.player === 'ai').length < 8) {
          const newUnit = {
            id: Date.now() + Math.random(),
            type: Math.random() < 0.7 ? 'soldier' : 'archer',
            x: aiBarracks.x + (Math.random() - 0.5) * 80,
            y: aiBarracks.y + (Math.random() - 0.5) * 80,
            health: 100,
            maxHealth: 100,
            player: 'ai',
            target: null,
            task: 'patrol',
            moveTarget: null
          };
          
          setUnits(prev => [...prev, newUnit]);
        }
      }
    }
  };

  const updateResources = () => {
    setResources(prev => ({
      ...prev,
      gold: prev.gold + 2, // Passive income
      maxPopulation: buildings.filter(b => b.type === 'farm' && b.player === 'human').length * 5 + 20
    }));
  };

  const gatherResource = (unit, source) => {
    if (source.amount > 0) {
      const gathered = Math.min(10, source.amount);
      source.amount -= gathered;
      
      setResources(prev => ({
        ...prev,
        [source.type]: prev[source.type] + gathered
      }));
      
      if (source.amount <= 0) {
        setResourceSources(prev => prev.filter(s => s.id !== source.id));
      }
    }
  };

  const attackTarget = (attacker, target) => {
    const attackRange = unitTypes[attacker.type].range;
    const distance = Math.sqrt(
      Math.pow(target.x - attacker.x, 2) + Math.pow(target.y - attacker.y, 2)
    );
    
    if (distance <= attackRange) {
      if (unitTypes[attacker.type].range > 40) {
        // Ranged attack - create projectile
        const projectile = {
          id: Date.now() + Math.random(),
          x: attacker.x,
          y: attacker.y,
          targetX: target.x,
          targetY: target.y,
          targetId: target.id,
          targetType: target.health ? 'unit' : 'building',
          damage: unitTypes[attacker.type].damage,
          speed: 8
        };
        
        setProjectiles(prev => [...prev, projectile]);
      } else {
        // Melee attack - instant damage
        dealDamage(target.id, unitTypes[attacker.type].damage, target.health ? 'unit' : 'building');
      }
    }
  };

  const dealDamage = (targetId, damage, targetType) => {
    if (targetType === 'unit') {
      setUnits(prev => prev.map(unit => {
        if (unit.id === targetId) {
          const newHealth = unit.health - damage;
          if (newHealth <= 0) {
            setGameStats(prevStats => ({ 
              ...prevStats, 
              enemiesDefeated: unit.player !== 'human' ? prevStats.enemiesDefeated + 1 : prevStats.enemiesDefeated,
              score: prevStats.score + (unit.player !== 'human' ? 100 : 0)
            }));
            return null;
          }
          return { ...unit, health: newHealth };
        }
        return unit;
      }).filter(Boolean));
    } else {
      setBuildings(prev => prev.map(building => {
        if (building.id === targetId) {
          const newHealth = building.health - damage;
          if (newHealth <= 0) {
            setGameStats(prevStats => ({ 
              ...prevStats, 
              score: prevStats.score + (building.player !== 'human' ? 200 : 0)
            }));
            return null;
          }
          return { ...building, health: newHealth };
        }
        return building;
      }).filter(Boolean));
    }
  };

  const render = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, 800, 600);
    
    // Draw background
    const gradient = ctx.createLinearGradient(0, 0, 800, 600);
    gradient.addColorStop(0, '#3a5f3a');
    gradient.addColorStop(0.5, '#4a6f4a');
    gradient.addColorStop(1, '#2a4f2a');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 800, 600);
    
    // Draw grid
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.lineWidth = 1;
    for (let x = 0; x < 800; x += 50) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, 600);
      ctx.stroke();
    }
    for (let y = 0; y < 600; y += 50) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(800, y);
      ctx.stroke();
    }
    
    // Draw resource sources
    resources_sources.forEach(source => {
      ctx.fillStyle = source.type === 'gold' ? '#ffd700' : source.type === 'wood' ? '#8b4513' : '#708090';
      ctx.beginPath();
      ctx.arc(source.x, source.y, 15, 0, Math.PI * 2);
      ctx.fill();
      
      // Amount text
      ctx.fillStyle = '#ffffff';
      ctx.font = '10px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(source.amount.toString(), source.x, source.y - 20);
    });
    
    // Draw buildings
    buildings.forEach(building => {
      const buildingType = buildingTypes[building.type];
      const size = buildingType.size;
      
      // Building body
      ctx.fillStyle = building.player === 'human' ? '#4a90e2' : '#e74c3c';
      if (building.constructionProgress < 100) {
        ctx.fillStyle = '#888888';
      }
      
      ctx.fillRect(building.x - size/2, building.y - size/2, size, size);
      
      // Construction progress
      if (building.constructionProgress < 100) {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.fillRect(building.x - size/2, building.y + size/2 - 8, (size * building.constructionProgress / 100), 4);
      }
      
      // Health bar
      const barWidth = size;
      const barHeight = 4;
      const healthPercent = building.health / building.maxHealth;
      
      ctx.fillStyle = '#ff0000';
      ctx.fillRect(building.x - barWidth/2, building.y - size/2 - 10, barWidth, barHeight);
      ctx.fillStyle = '#00ff00';
      ctx.fillRect(building.x - barWidth/2, building.y - size/2 - 10, barWidth * healthPercent, barHeight);
      
      // Building name
      ctx.fillStyle = '#ffffff';
      ctx.font = '10px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(buildingType.name, building.x, building.y - size/2 - 15);
      
      // Selection highlight
      if (selectedBuilding && selectedBuilding.id === building.id) {
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.strokeRect(building.x - size/2 - 5, building.y - size/2 - 5, size + 10, size + 10);
      }
    });
    
    // Draw units
    units.forEach(unit => {
      const unitType = unitTypes[unit.type];
      const size = 12;
      
      // Unit body
      ctx.fillStyle = unit.player === 'human' ? '#4a90e2' : '#e74c3c';
      if (unit.type === 'worker') {
        ctx.fillStyle = unit.player === 'human' ? '#f39c12' : '#e67e22';
      }
      
      ctx.beginPath();
      ctx.arc(unit.x, unit.y, size, 0, Math.PI * 2);
      ctx.fill();
      
      // Health bar
      const barWidth = 20;
      const barHeight = 3;
      const healthPercent = unit.health / unit.maxHealth;
      
      ctx.fillStyle = '#ff0000';
      ctx.fillRect(unit.x - barWidth/2, unit.y - size - 8, barWidth, barHeight);
      ctx.fillStyle = '#00ff00';
      ctx.fillRect(unit.x - barWidth/2, unit.y - size - 8, barWidth * healthPercent, barHeight);
      
      // Selection highlight
      if (selectedUnits.some(su => su.id === unit.id)) {
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(unit.x, unit.y, size + 5, 0, Math.PI * 2);
        ctx.stroke();
      }
      
      // Movement target
      if (unit.moveTarget && selectedUnits.some(su => su.id === unit.id)) {
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.lineWidth = 1;
        ctx.setLineDash([5, 5]);
        ctx.beginPath();
        ctx.moveTo(unit.x, unit.y);
        ctx.lineTo(unit.moveTarget.x, unit.moveTarget.y);
        ctx.stroke();
        ctx.setLineDash([]);
      }
    });
    
    // Draw projectiles
    projectiles.forEach(projectile => {
      ctx.fillStyle = '#ffff00';
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
        ctx.arc(effect.x, effect.y, 8, 0, Math.PI * 2);
        ctx.fill();
      }
    });
    ctx.globalAlpha = 1;
    
    // Draw drag selection
    if (dragSelection.active && dragSelection.start && dragSelection.end) {
      const minX = Math.min(dragSelection.start.x, dragSelection.end.x);
      const minY = Math.min(dragSelection.start.y, dragSelection.end.y);
      const width = Math.abs(dragSelection.end.x - dragSelection.start.x);
      const height = Math.abs(dragSelection.end.y - dragSelection.start.y);
      
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
      ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
      ctx.lineWidth = 1;
      ctx.fillRect(minX, minY, width, height);
      ctx.strokeRect(minX, minY, width, height);
    }
    
    // Draw build preview
    if (buildMode && mousePos) {
      const buildingType = buildingTypes[buildMode];
      const size = buildingType.size;
      
      ctx.fillStyle = 'rgba(74, 144, 226, 0.5)';
      ctx.fillRect(mousePos.x - size/2, mousePos.y - size/2, size, size);
      
      ctx.strokeStyle = '#4a90e2';
      ctx.lineWidth = 2;
      ctx.strokeRect(mousePos.x - size/2, mousePos.y - size/2, size, size);
    }
  };

  const startGame = () => {
    setGameState('playing');
    setResources({
      gold: 1000,
      wood: 500,
      stone: 300,
      food: 200,
      population: 5,
      maxPopulation: 20
    });
    setGameStats({
      unitsProduced: 0,
      buildingsConstructed: 0,
      enemiesDefeated: 0,
      score: 0,
      gameTime: 0
    });
  };

  const pauseGame = () => {
    setGameState(gameState === 'paused' ? 'playing' : 'paused');
  };

  const restartGame = () => {
    setGameState('menu');
  };

  return (
    <div className="rts-game">
      <canvas
        ref={canvasRef}
        width={800}
        height={600}
        className="game-canvas"
      />
      
      {/* Game HUD */}
      {gameState === 'playing' && (
        <div className="game-hud">
          {/* Resource Panel */}
          <div className="resource-panel">
            <div className="resource-item">
              <Coins size={16} />
              <span>{resources.gold}</span>
            </div>
            <div className="resource-item">
              <div className="wood-icon">🌳</div>
              <span>{resources.wood}</span>
            </div>
            <div className="resource-item">
              <div className="stone-icon">🗿</div>
              <span>{resources.stone}</span>
            </div>
            <div className="resource-item">
              <div className="food-icon">🌾</div>
              <span>{resources.food}</span>
            </div>
            <div className="resource-item">
              <Users size={16} />
              <span>{resources.population}/{resources.maxPopulation}</span>
            </div>
          </div>

          {/* Control Panel */}
          <div className="control-panel">
            <button onClick={pauseGame} className="control-btn">
              <Pause size={16} />
            </button>
            <button onClick={restartGame} className="control-btn">
              <RotateCcw size={16} />
            </button>
            <div className="game-time">
              Time: {Math.floor(gameStats.gameTime / 60)}:{(gameStats.gameTime % 60).toString().padStart(2, '0')}
            </div>
          </div>

          {/* Build Panel */}
          <div className="build-panel">
            <h3>Buildings</h3>
            <div className="build-buttons">
              {Object.entries(buildingTypes).map(([type, data]) => (
                <button
                  key={type}
                  className={`build-btn ${buildMode === type ? 'selected' : ''} ${!canAfford(data.cost) ? 'disabled' : ''}`}
                  onClick={() => setBuildMode(buildMode === type ? null : type)}
                  disabled={!canAfford(data.cost)}
                  title={`${data.name} - Gold: ${data.cost.gold || 0}, Wood: ${data.cost.wood || 0}, Stone: ${data.cost.stone || 0}`}
                >
                  <div className="building-icon">
                    {type === 'townhall' && <Home size={20} />}
                    {type === 'barracks' && <Swords size={20} />}
                    {type === 'farm' && <div>🌾</div>}
                    {type === 'mine' && <div>⛏️</div>}
                    {type === 'tower' && <Crown size={20} />}
                  </div>
                  <div className="building-name">{data.name}</div>
                  <div className="building-cost">G:{data.cost.gold || 0}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Unit Info Panel */}
          {selectedUnits.length > 0 && (
            <div className="unit-panel">
              <h3>Selected Units ({selectedUnits.length})</h3>
              <div className="unit-info">
                {selectedUnits.slice(0, 3).map(unit => (
                  <div key={unit.id} className="unit-item">
                    <div className="unit-icon">
                      {unit.type === 'worker' && <Wrench size={16} />}
                      {unit.type === 'soldier' && <Swords size={16} />}
                      {unit.type === 'archer' && <Target size={16} />}
                    </div>
                    <div className="unit-details">
                      <div>{unitTypes[unit.type].name}</div>
                      <div className="health-bar">
                        <div 
                          className="health-fill" 
                          style={{ width: `${(unit.health / unit.maxHealth) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Building Panel */}
          {selectedBuilding && (
            <div className="building-panel">
              <h3>{buildingTypes[selectedBuilding.type].name}</h3>
              <div className="building-health">
                Health: {selectedBuilding.health}/{selectedBuilding.maxHealth}
              </div>
              
              {buildingTypes[selectedBuilding.type].produces.length > 0 && (
                <div className="unit-production">
                  <h4>Train Units</h4>
                  <div className="production-buttons">
                    {buildingTypes[selectedBuilding.type].produces.map(unitType => (
                      <button
                        key={unitType}
                        className={`production-btn ${!canAfford(unitTypes[unitType].cost) || resources.population >= resources.maxPopulation ? 'disabled' : ''}`}
                        onClick={() => trainUnit(unitType)}
                        disabled={!canAfford(unitTypes[unitType].cost) || resources.population >= resources.maxPopulation}
                        title={`${unitTypes[unitType].name} - Gold: ${unitTypes[unitType].cost.gold}, Food: ${unitTypes[unitType].cost.food}`}
                      >
                        <div className="unit-icon">
                          {unitType === 'worker' && <Wrench size={16} />}
                          {unitType === 'soldier' && <Swords size={16} />}
                          {unitType === 'archer' && <Target size={16} />}
                          {unitType === 'knight' && <Crown size={16} />}
                        </div>
                        <div>{unitTypes[unitType].name}</div>
                        <div className="unit-cost">G:{unitTypes[unitType].cost.gold}</div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Stats Panel */}
          <div className="stats-panel">
            <div className="stat-item">
              <Users size={16} />
              <span>Units: {gameStats.unitsProduced}</span>
            </div>
            <div className="stat-item">
              <Home size={16} />
              <span>Buildings: {gameStats.buildingsConstructed}</span>
            </div>
            <div className="stat-item">
              <Swords size={16} />
              <span>Enemies: {gameStats.enemiesDefeated}</span>
            </div>
            <div className="stat-item">
              <Star size={16} />
              <span>Score: {gameStats.score}</span>
            </div>
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
              <h1>Real-Time Strategy</h1>
              <p>Build your empire, command your army, and conquer your enemies!</p>
              
              <div className="game-features">
                <div className="feature">
                  <Home size={20} />
                  <span>Base Building</span>
                </div>
                <div className="feature">
                  <Users size={20} />
                  <span>Unit Management</span>
                </div>
                <div className="feature">
                  <Coins size={20} />
                  <span>Resource Economy</span>
                </div>
                <div className="feature">
                  <Swords size={20} />
                  <span>Strategic Combat</span>
                </div>
              </div>
              
              <button className="start-btn" onClick={startGame}>
                <Play size={20} />
                Start Campaign
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default RTSGame;