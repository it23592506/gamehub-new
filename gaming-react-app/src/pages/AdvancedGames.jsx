import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Play, 
  Star, 
  Trophy, 
  Gamepad2, 
  Zap, 
  Crown,
  Filter,
  ArrowRight,
  Users,
  Clock,
  Award
} from 'lucide-react';
import './AdvancedGames.css';

const AdvancedGames = () => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [hoveredGame, setHoveredGame] = useState(null);

  const advancedGames = [
    {
      id: 16,
      title: "Battle Royale Arena",
      category: "Action",
      rating: 4.9,
      players: "100 Players",
      duration: "20-30 min",
      difficulty: "Hard",
      image: "https://via.placeholder.com/400x250/1a1a2e/ff6b6b?text=🔫+Battle+Royale",
      description: "Intense 100-player battle royale with weapon systems, shrinking zone, and real-time combat!",
      features: ["100 Players", "Weapon Systems", "Shrinking Zone", "Real-time Combat", "Leaderboards"],
      highlights: ["Tactical Combat", "Survival Strategy", "Dynamic Zones"],
      path: "/game/16"
    },
    {
      id: 17,
      title: "Racing Championship",
      category: "Sports",
      rating: 4.8,
      players: "1-8 Players",
      duration: "10-15 min",
      difficulty: "Medium",
      image: "https://via.placeholder.com/400x250/1a1a2e/45b7d1?text=🏎️+Racing",
      description: "High-speed racing with multiple tracks, car customization, and competitive AI opponents!",
      features: ["Multiple Tracks", "Car Selection", "AI Opponents", "Lap Timing", "Power-ups"],
      highlights: ["Speed Racing", "Track Variety", "Customization"],
      path: "/game/17"
    },
    {
      id: 18,
      title: "Tower Defense Strategy",
      category: "Strategy",
      rating: 4.9,
      players: "1 Player",
      duration: "30-45 min",
      difficulty: "Hard",
      image: "https://via.placeholder.com/400x250/1a1a2e/32cd32?text=🗼+Tower+Defense",
      description: "Strategic tower defense with 5 unique tower types, upgrade paths, and challenging enemy waves!",
      features: ["5 Tower Types", "Upgrade System", "Enemy Waves", "Strategic Gameplay", "Special Effects"],
      highlights: ["Strategic Depth", "Tower Upgrades", "Wave Defense"],
      path: "/game/18"
    },
    {
      id: 19,
      title: "MMORPG Quest Adventure",
      category: "RPG",
      rating: 4.8,
      players: "Multiplayer",
      duration: "60+ min",
      difficulty: "Medium",
      image: "https://via.placeholder.com/400x250/1a1a2e/ffd700?text=⚔️+MMORPG",
      description: "Epic RPG with character progression, quest system, inventory management, and multiplayer interactions!",
      features: ["Character Progression", "Quest System", "Inventory Management", "Skills", "NPCs"],
      highlights: ["Character Growth", "Epic Quests", "Social Features"],
      path: "/game/19"
    },
    {
      id: 20,
      title: "Real-Time Strategy",
      category: "Strategy",
      rating: 4.9,
      players: "1-4 Players",
      duration: "45-60 min",
      difficulty: "Hard",
      image: "https://via.placeholder.com/400x250/1a1a2e/8b4513?text=🏰+RTS",
      description: "Complex RTS with resource management, base building, unit production, and tactical combat!",
      features: ["Resource Management", "Base Building", "Unit Production", "AI Opponents", "Tactical Combat"],
      highlights: ["Base Building", "Resource Economy", "Tactical Warfare"],
      path: "/game/20"
    },
    {
      id: 21,
      title: "Puzzle Platform Adventure",
      category: "Puzzle",
      rating: 4.8,
      players: "1 Player",
      duration: "20-40 min",
      difficulty: "Medium",
      image: "https://via.placeholder.com/400x250/1a1a2e/9b59b6?text=🧩+Platform",
      description: "Advanced platformer with physics puzzles, multiple worlds, collectibles, and challenging gameplay!",
      features: ["Physics Puzzles", "Multiple Worlds", "Collectibles", "Platform Mechanics", "Boss Battles"],
      highlights: ["Physics Puzzles", "World Exploration", "Collectible Hunt"],
      path: "/game/21"
    }
  ];

  const categories = [
    { id: 'all', name: 'All Games', icon: '🎮' },
    { id: 'action', name: 'Action', icon: '⚔️' },
    { id: 'strategy', name: 'Strategy', icon: '♟️' },
    { id: 'sports', name: 'Sports', icon: '⚽' },
    { id: 'rpg', name: 'RPG', icon: '🗡️' },
    { id: 'puzzle', name: 'Puzzle', icon: '🧩' }
  ];

  const filteredGames = selectedCategory === 'all' 
    ? advancedGames 
    : advancedGames.filter(game => game.category.toLowerCase() === selectedCategory);

  const getDifficultyColor = (difficulty) => {
    switch (difficulty.toLowerCase()) {
      case 'easy': return '#4ade80';
      case 'medium': return '#fbbf24';
      case 'hard': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.6,
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6 }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { duration: 0.4 }
    },
    exit: {
      opacity: 0,
      scale: 0.9,
      transition: { duration: 0.3 }
    }
  };

  return (
    <motion.div 
      className="advanced-games"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Hero Section */}
      <section className="advanced-hero">
        <div className="hero-background">
          <div className="hero-particles"></div>
          <div className="hero-overlay"></div>
        </div>
        
        <div className="container">
          <motion.div className="hero-content" variants={itemVariants}>
            <div className="hero-badge">
              <Crown size={16} />
              Premium Gaming Experience
            </div>
            <h1 className="hero-title">
              Advanced <span className="gradient-text">Game Collection</span>
            </h1>
            <p className="hero-subtitle">
              Immerse yourself in sophisticated gameplay with our collection of advanced games. 
              From intense battle royales to strategic tower defense, experience gaming at its finest.
            </p>
            
            <div className="hero-stats">
              <div className="stat">
                <Gamepad2 className="stat-icon" />
                <div>
                  <div className="stat-number">6</div>
                  <div className="stat-label">Premium Games</div>
                </div>
              </div>
              <div className="stat">
                <Users className="stat-icon" />
                <div>
                  <div className="stat-number">100+</div>
                  <div className="stat-label">Players Online</div>
                </div>
              </div>
              <div className="stat">
                <Trophy className="stat-icon" />
                <div>
                  <div className="stat-number">4.8</div>
                  <div className="stat-label">Avg Rating</div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Filter Section */}
      <section className="filter-section">
        <div className="container">
          <motion.div className="filter-header" variants={itemVariants}>
            <h2>
              <Filter size={24} />
              Choose Your Adventure
            </h2>
          </motion.div>
          
          <motion.div className="category-filters" variants={itemVariants}>
            {categories.map((category) => (
              <button
                key={category.id}
                className={`filter-btn ${selectedCategory === category.id ? 'active' : ''}`}
                onClick={() => setSelectedCategory(category.id)}
              >
                <span className="filter-icon">{category.icon}</span>
                {category.name}
              </button>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Games Grid */}
      <section className="games-showcase">
        <div className="container">
          <AnimatePresence mode="wait">
            <motion.div 
              key={selectedCategory}
              className="games-grid"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              {filteredGames.map((game, index) => (
                <motion.div
                  key={game.id}
                  className="advanced-game-card"
                  variants={cardVariants}
                  whileHover={{ 
                    y: -10, 
                    scale: 1.02,
                    transition: { duration: 0.3 }
                  }}
                  onHoverStart={() => setHoveredGame(game.id)}
                  onHoverEnd={() => setHoveredGame(null)}
                >
                  <div className="game-image">
                    <img src={game.image} alt={game.title} />
                    <div className="game-overlay">
                      <Link to={game.path} className="play-btn">
                        <Play size={20} />
                        Play Now
                      </Link>
                    </div>
                  </div>
                  
                  <div className="game-content">
                    <div className="game-header">
                      <h3 className="game-title">{game.title}</h3>
                      <div className="game-rating">
                        <Star size={14} fill="currentColor" />
                        {game.rating}
                      </div>
                    </div>
                    
                    <p className="game-description">{game.description}</p>
                    
                    <div className="game-highlights">
                      {game.highlights.map((highlight, idx) => (
                        <span key={idx} className="highlight-badge">
                          {highlight}
                        </span>
                      ))}
                    </div>
                    
                    <div className="game-meta">
                      <div className="meta-item">
                        <Users size={14} />
                        {game.players}
                      </div>
                      <div className="meta-item">
                        <Clock size={14} />
                        {game.duration}
                      </div>
                      <div className="meta-item">
                        <Award 
                          size={14} 
                          color={getDifficultyColor(game.difficulty)}
                        />
                        {game.difficulty}
                      </div>
                    </div>
                    
                    <div className="game-footer">
                      <Link to={game.path} className="play-button">
                        <Play size={16} />
                        Launch Game
                        <ArrowRight size={16} />
                      </Link>
                    </div>
                  </div>
                  
                  {hoveredGame === game.id && (
                    <motion.div
                      className="game-features-popup"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 20 }}
                    >
                      <div className="features-header">
                        <Zap size={16} />
                        Key Features
                      </div>
                      <ul className="features-list">
                        {game.features.slice(0, 3).map((feature, idx) => (
                          <li key={idx}>{feature}</li>
                        ))}
                      </ul>
                    </motion.div>
                  )}
                </motion.div>
              ))}
            </motion.div>
          </AnimatePresence>
        </div>
      </section>

      {/* Call to Action */}
      <section className="cta-section">
        <div className="container">
          <motion.div className="cta-content" variants={itemVariants}>
            <h2>Ready to Experience Advanced Gaming?</h2>
            <p>Join thousands of players in our premium gaming collection</p>
            <Link to="/games" className="cta-button">
              <Gamepad2 size={20} />
              Explore All Games
              <ArrowRight size={20} />
            </Link>
          </motion.div>
        </div>
      </section>
    </motion.div>
  );
};

export default AdvancedGames;