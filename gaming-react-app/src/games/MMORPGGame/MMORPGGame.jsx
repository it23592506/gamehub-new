import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, 
  Sword, 
  Shield, 
  Heart, 
  Zap, 
  Package, 
  Map, 
  Users, 
  Crown,
  Star,
  Coins,
  BookOpen,
  Settings,
  MessageCircle,
  Trophy,
  Target,
  Plus,
  X,
  Play,
  Pause
} from 'lucide-react';
import './MMORPGGame.css';

const MMORPGGame = () => {
  const canvasRef = useRef(null);
  const gameLoopRef = useRef(null);
  const [gameState, setGameState] = useState('menu');
  const [activeTab, setActiveTab] = useState('inventory');
  const [chatVisible, setChatVisible] = useState(false);
  const [questLogVisible, setQuestLogVisible] = useState(false);
  
  const [character, setCharacter] = useState({
    name: "Hero",
    level: 1,
    experience: 0,
    maxExperience: 100,
    health: 100,
    maxHealth: 100,
    mana: 50,
    maxMana: 50,
    strength: 10,
    defense: 8,
    intelligence: 12,
    agility: 15,
    x: 400,
    y: 300,
    direction: 0,
    isMoving: false,
    class: "Warrior"
  });

  const [inventory, setInventory] = useState([
    { id: 1, name: "Iron Sword", type: "weapon", damage: 15, rarity: "common", equipped: true },
    { id: 2, name: "Leather Armor", type: "armor", defense: 10, rarity: "common", equipped: true },
    { id: 3, name: "Health Potion", type: "consumable", healing: 30, quantity: 5 },
    { id: 4, name: "Mana Potion", type: "consumable", mana: 25, quantity: 3 },
    { id: 5, name: "Steel Shield", type: "shield", defense: 8, rarity: "uncommon", equipped: false }
  ]);

  const [quests, setQuests] = useState([
    {
      id: 1,
      title: "Defeat the Goblins",
      description: "Eliminate 10 goblins threatening the village",
      type: "kill",
      target: "goblin",
      progress: 3,
      goal: 10,
      reward: { experience: 150, gold: 50 },
      status: "active"
    },
    {
      id: 2,
      title: "Collect Mystic Herbs",
      description: "Gather 5 mystic herbs for the village healer",
      type: "collect",
      target: "herb",
      progress: 2,
      goal: 5,
      reward: { experience: 100, gold: 30, item: "Healing Elixir" },
      status: "active"
    },
    {
      id: 3,
      title: "Explore Ancient Ruins",
      description: "Discover the secrets of the ancient temple",
      type: "explore",
      target: "temple",
      progress: 0,
      goal: 1,
      reward: { experience: 300, gold: 100 },
      status: "available"
    }
  ]);

  const [npcs, setNpcs] = useState([
    { id: 1, name: "Village Elder", x: 200, y: 200, type: "questgiver", dialogue: "Welcome, brave warrior!" },
    { id: 2, name: "Merchant", x: 600, y: 150, type: "shop", dialogue: "Looking for quality gear?" },
    { id: 3, name: "Blacksmith", x: 100, y: 400, type: "upgrade", dialogue: "I can enhance your weapons!" },
    { id: 4, name: "Guild Master", x: 700, y: 500, type: "guild", dialogue: "Join our guild for epic adventures!" }
  ]);

  const [enemies, setEnemies] = useState([
    { id: 1, name: "Goblin Scout", x: 300, y: 100, health: 40, maxHealth: 40, level: 2, aggressive: false },
    { id: 2, name: "Orc Warrior", x: 500, y: 400, health: 80, maxHealth: 80, level: 4, aggressive: true },
    { id: 3, name: "Forest Wolf", x: 150, y: 350, health: 35, maxHealth: 35, level: 3, aggressive: false }
  ]);

  const [items, setItems] = useState([
    { id: 1, name: "Mystic Herb", x: 250, y: 450, type: "herb", rarity: "common" },
    { id: 2, name: "Gold Coin", x: 450, y: 200, type: "currency", value: 25 },
    { id: 3, name: "Magic Crystal", x: 350, y: 350, type: "crystal", rarity: "rare" }
  ]);

  const [chatMessages, setChatMessages] = useState([
    { id: 1, player: "Player1", message: "Anyone want to party up?", timestamp: Date.now() - 300000 },
    { id: 2, player: "GuildMaster", message: "Guild event starting in 30 minutes!", timestamp: Date.now() - 180000 },
    { id: 3, player: "Warrior99", message: "Looking for healer for dungeon run", timestamp: Date.now() - 60000 }
  ]);

  const [playerStats, setPlayerStats] = useState({
    gold: 250,
    playersOnline: 1247,
    guildMembers: 45,
    worldLevel: 12
  });

  const [keys, setKeys] = useState({});
  const [selectedTarget, setSelectedTarget] = useState(null);
  const [interactionMenu, setInteractionMenu] = useState({ show: false, target: null, x: 0, y: 0 });

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

  // Canvas click handling
  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      canvas.addEventListener('click', handleCanvasClick);
      canvas.addEventListener('contextmenu', handleCanvasRightClick);
      return () => {
        canvas.removeEventListener('click', handleCanvasClick);
        canvas.removeEventListener('contextmenu', handleCanvasRightClick);
      };
    }
  }, []);

  const handleCanvasClick = (e) => {
    if (gameState !== 'playing') return;
    
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Check for NPC interaction
    const clickedNPC = npcs.find(npc => {
      const dist = Math.sqrt(Math.pow(npc.x - x, 2) + Math.pow(npc.y - y, 2));
      return dist < 30;
    });

    if (clickedNPC) {
      interactWithNPC(clickedNPC);
      return;
    }

    // Check for enemy targeting
    const clickedEnemy = enemies.find(enemy => {
      const dist = Math.sqrt(Math.pow(enemy.x - x, 2) + Math.pow(enemy.y - y, 2));
      return dist < 25;
    });

    if (clickedEnemy) {
      setSelectedTarget(clickedEnemy);
      return;
    }

    // Move character
    moveCharacterTo(x, y);
    setSelectedTarget(null);
  };

  const handleCanvasRightClick = (e) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Check for items
    const clickedItem = items.find(item => {
      const dist = Math.sqrt(Math.pow(item.x - x, 2) + Math.pow(item.y - y, 2));
      return dist < 20;
    });

    if (clickedItem) {
      setInteractionMenu({ show: true, target: clickedItem, x: e.clientX, y: e.clientY });
    } else {
      setInteractionMenu({ show: false, target: null, x: 0, y: 0 });
    }
  };

  const interactWithNPC = (npc) => {
    if (npc.type === 'questgiver') {
      setQuestLogVisible(true);
    } else if (npc.type === 'shop') {
      openShop();
    } else if (npc.type === 'upgrade') {
      openUpgradeShop();
    } else if (npc.type === 'guild') {
      openGuildPanel();
    }
  };

  const moveCharacterTo = (targetX, targetY) => {
    const dx = targetX - character.x;
    const dy = targetY - character.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    if (distance > 5) {
      const speed = 2;
      const newX = character.x + (dx / distance) * speed;
      const newY = character.y + (dy / distance) * speed;
      
      setCharacter(prev => ({
        ...prev,
        x: newX,
        y: newY,
        direction: Math.atan2(dy, dx),
        isMoving: true
      }));
    }
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
  }, [gameState, character, enemies, items]);

  const updateGame = () => {
    handleMovement();
    updateEnemies();
    checkItemPickup();
    updateQuests();
  };

  const handleMovement = () => {
    let dx = 0;
    let dy = 0;
    let moving = false;

    if (keys['w'] || keys['arrowup']) { dy = -2; moving = true; }
    if (keys['s'] || keys['arrowdown']) { dy = 2; moving = true; }
    if (keys['a'] || keys['arrowleft']) { dx = -2; moving = true; }
    if (keys['d'] || keys['arrowright']) { dx = 2; moving = true; }

    if (moving) {
      setCharacter(prev => ({
        ...prev,
        x: Math.max(20, Math.min(780, prev.x + dx)),
        y: Math.max(20, Math.min(580, prev.y + dy)),
        direction: Math.atan2(dy, dx),
        isMoving: true
      }));
    } else {
      setCharacter(prev => ({ ...prev, isMoving: false }));
    }
  };

  const updateEnemies = () => {
    setEnemies(prev => prev.map(enemy => {
      // Simple AI - move towards player if aggressive and in range
      if (enemy.aggressive) {
        const dist = Math.sqrt(
          Math.pow(enemy.x - character.x, 2) + Math.pow(enemy.y - character.y, 2)
        );
        
        if (dist < 150 && dist > 30) {
          const dx = character.x - enemy.x;
          const dy = character.y - enemy.y;
          const speed = 1;
          
          enemy.x += (dx / dist) * speed;
          enemy.y += (dy / dist) * speed;
        }
      }
      
      return enemy;
    }));
  };

  const checkItemPickup = () => {
    const nearbyItems = items.filter(item => {
      const dist = Math.sqrt(
        Math.pow(item.x - character.x, 2) + Math.pow(item.y - character.y, 2)
      );
      return dist < 30;
    });

    nearbyItems.forEach(item => {
      pickupItem(item);
    });
  };

  const pickupItem = (item) => {
    if (item.type === 'currency') {
      setPlayerStats(prev => ({ ...prev, gold: prev.gold + item.value }));
    } else if (item.type === 'herb') {
      // Update quest progress
      setQuests(prev => prev.map(quest => {
        if (quest.type === 'collect' && quest.target === 'herb' && quest.status === 'active') {
          return { ...quest, progress: Math.min(quest.progress + 1, quest.goal) };
        }
        return quest;
      }));
    } else {
      // Add to inventory
      setInventory(prev => [...prev, { 
        id: Date.now(), 
        name: item.name, 
        type: item.type, 
        rarity: item.rarity 
      }]);
    }

    // Remove item from world
    setItems(prev => prev.filter(i => i.id !== item.id));
  };

  const updateQuests = () => {
    // Check quest completion
    setQuests(prev => prev.map(quest => {
      if (quest.progress >= quest.goal && quest.status === 'active') {
        // Complete quest
        completeQuest(quest);
        return { ...quest, status: 'completed' };
      }
      return quest;
    }));
  };

  const completeQuest = (quest) => {
    // Award rewards
    setCharacter(prev => ({
      ...prev,
      experience: prev.experience + quest.reward.experience
    }));
    
    setPlayerStats(prev => ({
      ...prev,
      gold: prev.gold + quest.reward.gold
    }));

    // Check for level up
    checkLevelUp();
  };

  const checkLevelUp = () => {
    setCharacter(prev => {
      if (prev.experience >= prev.maxExperience) {
        const newLevel = prev.level + 1;
        const newMaxExp = newLevel * 100;
        const leftoverExp = prev.experience - prev.maxExperience;
        
        return {
          ...prev,
          level: newLevel,
          experience: leftoverExp,
          maxExperience: newMaxExp,
          maxHealth: prev.maxHealth + 20,
          health: prev.maxHealth + 20,
          maxMana: prev.maxMana + 10,
          mana: prev.maxMana + 10,
          strength: prev.strength + 2,
          defense: prev.defense + 1,
          intelligence: prev.intelligence + 1,
          agility: prev.agility + 1
        };
      }
      return prev;
    });
  };

  const attackTarget = () => {
    if (!selectedTarget) return;
    
    const distance = Math.sqrt(
      Math.pow(selectedTarget.x - character.x, 2) + 
      Math.pow(selectedTarget.y - character.y, 2)
    );
    
    if (distance <= 50) {
      const damage = character.strength + Math.floor(Math.random() * 10);
      
      setEnemies(prev => prev.map(enemy => {
        if (enemy.id === selectedTarget.id) {
          const newHealth = enemy.health - damage;
          
          if (newHealth <= 0) {
            // Enemy killed
            const expGain = enemy.level * 20;
            setCharacter(prevChar => ({
              ...prevChar,
              experience: prevChar.experience + expGain
            }));
            
            // Update kill quests
            setQuests(prevQuests => prevQuests.map(quest => {
              if (quest.type === 'kill' && quest.target === 'goblin' && quest.status === 'active') {
                return { ...quest, progress: Math.min(quest.progress + 1, quest.goal) };
              }
              return quest;
            }));
            
            return null;
          }
          
          return { ...enemy, health: newHealth };
        }
        return enemy;
      }).filter(Boolean));
      
      if (selectedTarget && selectedTarget.health <= 0) {
        setSelectedTarget(null);
      }
    }
  };

  const useItem = (item) => {
    if (item.type === 'consumable') {
      if (item.healing) {
        setCharacter(prev => ({
          ...prev,
          health: Math.min(prev.health + item.healing, prev.maxHealth)
        }));
      }
      
      if (item.mana) {
        setCharacter(prev => ({
          ...prev,
          mana: Math.min(prev.mana + item.mana, prev.maxMana)
        }));
      }
      
      // Reduce quantity or remove item
      setInventory(prev => prev.map(invItem => {
        if (invItem.id === item.id) {
          if (invItem.quantity > 1) {
            return { ...invItem, quantity: invItem.quantity - 1 };
          }
          return null;
        }
        return invItem;
      }).filter(Boolean));
    }
  };

  const equipItem = (item) => {
    if (item.type === 'weapon' || item.type === 'armor' || item.type === 'shield') {
      setInventory(prev => prev.map(invItem => {
        if (invItem.type === item.type) {
          return { ...invItem, equipped: invItem.id === item.id };
        }
        return invItem;
      }));
    }
  };

  const render = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, 800, 600);
    
    // Draw background
    const gradient = ctx.createLinearGradient(0, 0, 800, 600);
    gradient.addColorStop(0, '#4a7c59');
    gradient.addColorStop(0.5, '#6b8e23');
    gradient.addColorStop(1, '#228b22');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 800, 600);
    
    // Draw terrain features
    ctx.fillStyle = '#8b4513';
    ctx.fillRect(50, 100, 150, 20); // Path
    ctx.fillRect(200, 100, 20, 150);
    ctx.fillRect(200, 250, 200, 20);
    
    // Draw water
    ctx.fillStyle = '#4169e1';
    ctx.beginPath();
    ctx.arc(600, 400, 80, 0, Math.PI * 2);
    ctx.fill();
    
    // Draw items
    items.forEach(item => {
      ctx.fillStyle = item.rarity === 'rare' ? '#ffd700' : '#90ee90';
      ctx.beginPath();
      ctx.arc(item.x, item.y, 8, 0, Math.PI * 2);
      ctx.fill();
      
      // Item name
      ctx.fillStyle = '#ffffff';
      ctx.font = '10px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(item.name, item.x, item.y - 15);
    });
    
    // Draw NPCs
    npcs.forEach(npc => {
      ctx.fillStyle = '#4169e1';
      ctx.fillRect(npc.x - 10, npc.y - 10, 20, 20);
      
      // NPC name
      ctx.fillStyle = '#ffffff';
      ctx.font = '12px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(npc.name, npc.x, npc.y - 15);
      
      // Quest indicator
      if (npc.type === 'questgiver') {
        ctx.fillStyle = '#ffd700';
        ctx.fillText('!', npc.x + 15, npc.y - 15);
      }
    });
    
    // Draw enemies
    enemies.forEach(enemy => {
      // Enemy body
      ctx.fillStyle = enemy.aggressive ? '#ff4444' : '#ff8844';
      ctx.fillRect(enemy.x - 12, enemy.y - 12, 24, 24);
      
      // Health bar
      const barWidth = 30;
      const barHeight = 4;
      const healthPercent = enemy.health / enemy.maxHealth;
      
      ctx.fillStyle = '#ff0000';
      ctx.fillRect(enemy.x - barWidth/2, enemy.y - 20, barWidth, barHeight);
      ctx.fillStyle = '#00ff00';
      ctx.fillRect(enemy.x - barWidth/2, enemy.y - 20, barWidth * healthPercent, barHeight);
      
      // Enemy name and level
      ctx.fillStyle = '#ffffff';
      ctx.font = '10px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(`${enemy.name} (${enemy.level})`, enemy.x, enemy.y - 25);
      
      // Selection indicator
      if (selectedTarget && selectedTarget.id === enemy.id) {
        ctx.strokeStyle = '#ff0000';
        ctx.lineWidth = 2;
        ctx.strokeRect(enemy.x - 15, enemy.y - 15, 30, 30);
      }
    });
    
    // Draw character
    ctx.fillStyle = '#4169e1';
    ctx.beginPath();
    ctx.arc(character.x, character.y, 15, 0, Math.PI * 2);
    ctx.fill();
    
    // Character direction indicator
    if (character.isMoving) {
      const dirX = Math.cos(character.direction) * 20;
      const dirY = Math.sin(character.direction) * 20;
      
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(character.x, character.y);
      ctx.lineTo(character.x + dirX, character.y + dirY);
      ctx.stroke();
    }
    
    // Character name and level
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 12px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(`${character.name} (${character.level})`, character.x, character.y - 25);
    
    // Health/Mana bars
    const barWidth = 40;
    const barHeight = 4;
    
    // Health bar
    ctx.fillStyle = '#ff0000';
    ctx.fillRect(character.x - barWidth/2, character.y - 35, barWidth, barHeight);
    ctx.fillStyle = '#00ff00';
    ctx.fillRect(character.x - barWidth/2, character.y - 35, barWidth * (character.health / character.maxHealth), barHeight);
    
    // Mana bar
    ctx.fillStyle = '#0000ff';
    ctx.fillRect(character.x - barWidth/2, character.y - 30, barWidth, barHeight);
    ctx.fillStyle = '#00ffff';
    ctx.fillRect(character.x - barWidth/2, character.y - 30, barWidth * (character.mana / character.maxMana), barHeight);
  };

  const startGame = () => {
    setGameState('playing');
  };

  const openShop = () => {
    // Shop functionality
    console.log("Opening shop...");
  };

  const openUpgradeShop = () => {
    // Upgrade shop functionality
    console.log("Opening upgrade shop...");
  };

  const openGuildPanel = () => {
    // Guild panel functionality
    console.log("Opening guild panel...");
  };

  return (
    <div className="mmorpg-game">
      <canvas
        ref={canvasRef}
        width={800}
        height={600}
        className="game-canvas"
      />
      
      {/* Game HUD */}
      {gameState === 'playing' && (
        <div className="game-hud">
          {/* Character Panel */}
          <div className="character-panel">
            <div className="character-avatar">
              <User size={40} />
            </div>
            <div className="character-info">
              <h3>{character.name}</h3>
              <div className="level-info">
                <Crown size={16} />
                <span>Level {character.level}</span>
              </div>
              <div className="experience-bar">
                <div 
                  className="exp-fill" 
                  style={{ width: `${(character.experience / character.maxExperience) * 100}%` }}
                ></div>
                <span>{character.experience}/{character.maxExperience}</span>
              </div>
            </div>
          </div>

          {/* Stats Panel */}
          <div className="stats-panel">
            <div className="health-mana">
              <div className="stat-bar health">
                <Heart size={16} />
                <div className="bar">
                  <div 
                    className="fill" 
                    style={{ width: `${(character.health / character.maxHealth) * 100}%` }}
                  ></div>
                </div>
                <span>{character.health}/{character.maxHealth}</span>
              </div>
              <div className="stat-bar mana">
                <Zap size={16} />
                <div className="bar">
                  <div 
                    className="fill" 
                    style={{ width: `${(character.mana / character.maxMana) * 100}%` }}
                  ></div>
                </div>
                <span>{character.mana}/{character.maxMana}</span>
              </div>
            </div>
            
            <div className="attributes">
              <div className="attribute">
                <Sword size={14} />
                <span>{character.strength}</span>
              </div>
              <div className="attribute">
                <Shield size={14} />
                <span>{character.defense}</span>
              </div>
              <div className="attribute">
                <BookOpen size={14} />
                <span>{character.intelligence}</span>
              </div>
              <div className="attribute">
                <Target size={14} />
                <span>{character.agility}</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="action-buttons">
            <button 
              onClick={attackTarget} 
              disabled={!selectedTarget}
              className="action-btn attack"
            >
              <Sword size={16} />
              Attack
            </button>
            <button onClick={() => setQuestLogVisible(true)} className="action-btn quest">
              <BookOpen size={16} />
              Quests
            </button>
            <button onClick={() => setChatVisible(true)} className="action-btn chat">
              <MessageCircle size={16} />
              Chat
            </button>
          </div>

          {/* Mini-map */}
          <div className="minimap">
            <div className="minimap-content">
              <div 
                className="player-dot" 
                style={{ 
                  left: `${(character.x / 800) * 100}%`, 
                  top: `${(character.y / 600) * 100}%` 
                }}
              ></div>
              {enemies.map(enemy => (
                <div 
                  key={enemy.id}
                  className="enemy-dot" 
                  style={{ 
                    left: `${(enemy.x / 800) * 100}%`, 
                    top: `${(enemy.y / 600) * 100}%` 
                  }}
                ></div>
              ))}
              {npcs.map(npc => (
                <div 
                  key={npc.id}
                  className="npc-dot" 
                  style={{ 
                    left: `${(npc.x / 800) * 100}%`, 
                    top: `${(npc.y / 600) * 100}%` 
                  }}
                ></div>
              ))}
            </div>
          </div>

          {/* Status Info */}
          <div className="status-info">
            <div className="info-item">
              <Coins size={16} />
              <span>{playerStats.gold}</span>
            </div>
            <div className="info-item">
              <Users size={16} />
              <span>{playerStats.playersOnline}</span>
            </div>
          </div>
        </div>
      )}

      {/* Inventory Panel */}
      <AnimatePresence>
        {gameState === 'playing' && (
          <motion.div
            className="inventory-panel"
            initial={{ x: 300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 300, opacity: 0 }}
          >
            <div className="panel-tabs">
              <button 
                className={`tab ${activeTab === 'inventory' ? 'active' : ''}`}
                onClick={() => setActiveTab('inventory')}
              >
                <Package size={16} />
                Inventory
              </button>
              <button 
                className={`tab ${activeTab === 'character' ? 'active' : ''}`}
                onClick={() => setActiveTab('character')}
              >
                <User size={16} />
                Character
              </button>
              <button 
                className={`tab ${activeTab === 'skills' ? 'active' : ''}`}
                onClick={() => setActiveTab('skills')}
              >
                <Star size={16} />
                Skills
              </button>
            </div>

            <div className="panel-content">
              {activeTab === 'inventory' && (
                <div className="inventory-grid">
                  {inventory.map(item => (
                    <div 
                      key={item.id} 
                      className={`inventory-item ${item.rarity} ${item.equipped ? 'equipped' : ''}`}
                      onClick={() => item.type === 'consumable' ? useItem(item) : equipItem(item)}
                    >
                      <div className="item-icon">
                        {item.type === 'weapon' && <Sword size={20} />}
                        {item.type === 'armor' && <Shield size={20} />}
                        {item.type === 'consumable' && <Heart size={20} />}
                        {item.type === 'shield' && <Shield size={20} />}
                      </div>
                      <div className="item-name">{item.name}</div>
                      {item.quantity && <div className="item-quantity">{item.quantity}</div>}
                      {item.equipped && <div className="equipped-indicator">E</div>}
                    </div>
                  ))}
                </div>
              )}

              {activeTab === 'character' && (
                <div className="character-stats">
                  <div className="stat-group">
                    <h4>Combat Stats</h4>
                    <div className="stat-line">
                      <span>Strength:</span>
                      <span>{character.strength}</span>
                    </div>
                    <div className="stat-line">
                      <span>Defense:</span>
                      <span>{character.defense}</span>
                    </div>
                    <div className="stat-line">
                      <span>Intelligence:</span>
                      <span>{character.intelligence}</span>
                    </div>
                    <div className="stat-line">
                      <span>Agility:</span>
                      <span>{character.agility}</span>
                    </div>
                  </div>
                  
                  <div className="stat-group">
                    <h4>Vitals</h4>
                    <div className="stat-line">
                      <span>Health:</span>
                      <span>{character.health}/{character.maxHealth}</span>
                    </div>
                    <div className="stat-line">
                      <span>Mana:</span>
                      <span>{character.mana}/{character.maxMana}</span>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'skills' && (
                <div className="skills-tree">
                  <div className="skill-category">
                    <h4>Combat Skills</h4>
                    <div className="skill-item">
                      <Sword size={20} />
                      <span>Sword Mastery</span>
                      <div className="skill-level">Level 3</div>
                    </div>
                    <div className="skill-item">
                      <Shield size={20} />
                      <span>Defense</span>
                      <div className="skill-level">Level 2</div>
                    </div>
                  </div>
                  
                  <div className="skill-category">
                    <h4>Magic Skills</h4>
                    <div className="skill-item">
                      <Zap size={20} />
                      <span>Fire Magic</span>
                      <div className="skill-level">Level 1</div>
                    </div>
                    <div className="skill-item">
                      <Heart size={20} />
                      <span>Healing</span>
                      <div className="skill-level">Level 2</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Quest Log */}
      <AnimatePresence>
        {questLogVisible && (
          <motion.div
            className="quest-log"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
          >
            <div className="quest-header">
              <h3>Quest Log</h3>
              <button onClick={() => setQuestLogVisible(false)}>
                <X size={20} />
              </button>
            </div>
            
            <div className="quest-list">
              {quests.map(quest => (
                <div key={quest.id} className={`quest-item ${quest.status}`}>
                  <div className="quest-title">{quest.title}</div>
                  <div className="quest-description">{quest.description}</div>
                  <div className="quest-progress">
                    Progress: {quest.progress}/{quest.goal}
                    <div className="progress-bar">
                      <div 
                        className="progress-fill" 
                        style={{ width: `${(quest.progress / quest.goal) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                  <div className="quest-reward">
                    Reward: {quest.reward.experience} XP, {quest.reward.gold} Gold
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chat Panel */}
      <AnimatePresence>
        {chatVisible && (
          <motion.div
            className="chat-panel"
            initial={{ y: 300, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 300, opacity: 0 }}
          >
            <div className="chat-header">
              <h3>Global Chat</h3>
              <button onClick={() => setChatVisible(false)}>
                <X size={20} />
              </button>
            </div>
            
            <div className="chat-messages">
              {chatMessages.map(msg => (
                <div key={msg.id} className="chat-message">
                  <span className="player-name">{msg.player}:</span>
                  <span className="message-text">{msg.message}</span>
                </div>
              ))}
            </div>
            
            <div className="chat-input">
              <input type="text" placeholder="Type your message..." />
              <button>Send</button>
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
              <h1>MMORPG Quest</h1>
              <p>Embark on epic adventures in a vast online world!</p>
              
              <div className="game-features">
                <div className="feature">
                  <User size={20} />
                  <span>Character Progression</span>
                </div>
                <div className="feature">
                  <BookOpen size={20} />
                  <span>Epic Quests</span>
                </div>
                <div className="feature">
                  <Users size={20} />
                  <span>Multiplayer World</span>
                </div>
                <div className="feature">
                  <Trophy size={20} />
                  <span>Guild System</span>
                </div>
              </div>
              
              <button className="start-btn" onClick={startGame}>
                <Play size={20} />
                Enter World
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Interaction menu */}
      <AnimatePresence>
        {interactionMenu.show && (
          <motion.div
            className="interaction-menu"
            style={{ left: interactionMenu.x, top: interactionMenu.y }}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
          >
            <button onClick={() => {
              pickupItem(interactionMenu.target);
              setInteractionMenu({ show: false, target: null, x: 0, y: 0 });
            }}>
              Pick Up {interactionMenu.target?.name}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MMORPGGame;