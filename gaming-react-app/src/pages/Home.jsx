import React from 'react';
import { Link } from 'react-router-dom';
import { Play, ArrowRight, TrendingUp, Star, Users } from 'lucide-react';
import { motion } from 'framer-motion';
import GameCard from '../components/games/GameCard';
import { gamesData, featuredGames, trendingGames, categories } from '../data/games';
import './Home.css';

const Home = () => {
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
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6 }
    }
  };

  return (
    <motion.div 
      className="home"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-background">
          <div className="hero-overlay"></div>
        </div>
        <div className="container">
          <motion.div className="hero-content" variants={itemVariants}>
            <h1 className="hero-title">
              Welcome to <span className="gradient-text">GameHub</span>
            </h1>
            <p className="hero-subtitle">
              Discover, play, and experience the best games from around the world. 
              Join millions of gamers in the ultimate gaming destination.
            </p>
            <div className="hero-stats">
              <div className="stat">
                <span className="stat-number">10K+</span>
                <span className="stat-label">Games</span>
              </div>
              <div className="stat">
                <span className="stat-number">1M+</span>
                <span className="stat-label">Players</span>
              </div>
              <div className="stat">
                <span className="stat-number">50K+</span>
                <span className="stat-label">Reviews</span>
              </div>
            </div>
            <div className="hero-actions">
              <Link to="/games" className="btn btn-primary hero-btn">
                <Play />
                Start Playing
              </Link>
              <Link to="/advanced-games" className="btn btn-premium hero-btn">
                <Star />
                Advanced Games
              </Link>
              <Link to="/about" className="btn btn-secondary hero-btn">
                Learn More
                <ArrowRight />
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Featured Games Section */}
      <section className="featured-games">
        <div className="container">
          <motion.div className="section-header" variants={itemVariants}>
            <h2 className="section-title">
              <Star className="section-icon" />
              Featured Games
            </h2>
            <p className="section-subtitle">
              Hand-picked games that define the gaming experience
            </p>
          </motion.div>
          
          <div className="games-grid">
            {featuredGames.map((game, index) => (
              <GameCard key={game.id} game={game} index={index} />
            ))}
          </div>
          
          <motion.div className="section-footer" variants={itemVariants}>
            <Link to="/games" className="btn btn-outline">
              View All Games
              <ArrowRight />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="categories">
        <div className="container">
          <motion.div className="section-header" variants={itemVariants}>
            <h2 className="section-title">
              Game Categories
            </h2>
            <p className="section-subtitle">
              Explore games by your favorite genres
            </p>
          </motion.div>
          
          <div className="categories-grid">
            {categories.slice(1).map((category, index) => (
              <motion.div
                key={category.id}
                className="category-card"
                variants={itemVariants}
                whileHover={{ scale: 1.05, y: -5 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link to={`/games?category=${category.id}`}>
                  <div className="category-icon">{category.icon}</div>
                  <h3 className="category-name">{category.name}</h3>
                  <div className="category-count">
                    {gamesData.filter(game => 
                      game.category.toLowerCase() === category.id
                    ).length} games
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Advanced Games Promotion */}
      <section className="advanced-games-promo">
        <div className="container">
          <motion.div className="promo-content" variants={itemVariants}>
            <div className="promo-background">
              <div className="promo-overlay"></div>
            </div>
            <div className="promo-text">
              <motion.div className="promo-badge" variants={itemVariants}>
                <Star className="badge-icon" />
                Premium Collection
              </motion.div>
              <motion.h2 className="promo-title" variants={itemVariants}>
                Experience <span className="gradient-text">Advanced Gaming</span>
              </motion.h2>
              <motion.p className="promo-subtitle" variants={itemVariants}>
                Dive into our collection of sophisticated games featuring complex mechanics, 
                strategic gameplay, and cutting-edge features. From battle royales to tower defense!
              </motion.p>
              <motion.div className="promo-features" variants={itemVariants}>
                <div className="promo-feature">
                  <div className="feature-icon">🔫</div>
                  <span>Battle Royale Arena</span>
                </div>
                <div className="promo-feature">
                  <div className="feature-icon">🏰</div>
                  <span>Real-Time Strategy</span>
                </div>
                <div className="promo-feature">
                  <div className="feature-icon">⚔️</div>
                  <span>MMORPG Adventure</span>
                </div>
                <div className="promo-feature">
                  <div className="feature-icon">🗼</div>
                  <span>Tower Defense</span>
                </div>
              </motion.div>
              <motion.div className="promo-actions" variants={itemVariants}>
                <Link to="/advanced-games" className="btn btn-premium promo-btn">
                  <Play />
                  Explore Advanced Games
                  <ArrowRight />
                </Link>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Trending Games Section */}
      <section className="trending-games">
        <div className="container">
          <motion.div className="section-header" variants={itemVariants}>
            <h2 className="section-title">
              <TrendingUp className="section-icon" />
              Trending Now
            </h2>
            <p className="section-subtitle">
              The hottest games that everyone's playing
            </p>
          </motion.div>
          
          <div className="games-grid">
            {trendingGames.map((game, index) => (
              <GameCard key={game.id} game={game} index={index} />
            ))}
          </div>
        </div>
      </section>

      {/* Community Section */}
      <section className="community">
        <div className="container">
          <motion.div className="community-content" variants={itemVariants}>
            <div className="community-text">
              <h2 className="community-title">
                <Users className="section-icon" />
                Join Our Gaming Community
              </h2>
              <p className="community-description">
                Connect with fellow gamers, share your experiences, 
                and discover new friends who share your passion for gaming.
              </p>
              <div className="community-features">
                <div className="feature">
                  <span className="feature-icon">🎮</span>
                  <span>Weekly Tournaments</span>
                </div>
                <div className="feature">
                  <span className="feature-icon">👥</span>
                  <span>Gaming Groups</span>
                </div>
                <div className="feature">
                  <span className="feature-icon">🏆</span>
                  <span>Achievements</span>
                </div>
                <div className="feature">
                  <span className="feature-icon">💬</span>
                  <span>Game Reviews</span>
                </div>
              </div>
              <Link to="/community" className="btn btn-primary">
                Join Community
                <ArrowRight />
              </Link>
            </div>
            <div className="community-image">
              <div className="community-stats">
                <div className="stat-card">
                  <span className="stat-number">1M+</span>
                  <span className="stat-label">Active Players</span>
                </div>
                <div className="stat-card">
                  <span className="stat-number">500K+</span>
                  <span className="stat-label">Games Played</span>
                </div>
                <div className="stat-card">
                  <span className="stat-number">50K+</span>
                  <span className="stat-label">Tournaments</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </motion.div>
  );
};

export default Home;