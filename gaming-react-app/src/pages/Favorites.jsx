import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Heart, Search, Grid, List, Trash2, Star, Calendar, ArrowRight } from 'lucide-react';
import GameCard from '../components/games/GameCard';
import { useFavorites } from '../hooks/useFavorites';
import { gamesData } from '../data/games';
import './Favorites.css';

const Favorites = () => {
  const { favorites, removeFromFavorites } = useFavorites();
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('grid');
  const [sortBy, setSortBy] = useState('name');

  // Get favorite games data
  const favoriteGames = useMemo(() => {
    return gamesData.filter(game => favorites.includes(game.id));
  }, [favorites]);

  // Filter and sort favorite games
  const filteredFavorites = useMemo(() => {
    let games = favoriteGames;

    if (searchTerm) {
      games = games.filter(game =>
        game.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        game.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        game.category.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Sort games
    games.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.title.localeCompare(b.title);
        case 'rating':
          return b.rating - a.rating;
        case 'category':
          return a.category.localeCompare(b.category);
        case 'newest':
          return new Date(b.releaseDate) - new Date(a.releaseDate);
        default:
          return 0;
      }
    });

    return games;
  }, [favoriteGames, searchTerm, sortBy]);

  const clearAllFavorites = () => {
    favorites.forEach(gameId => removeFromFavorites(gameId));
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
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6 }
    }
  };

  // Calculate statistics
  const stats = useMemo(() => {
    if (favoriteGames.length === 0) return null;

    const totalRating = favoriteGames.reduce((sum, game) => sum + game.rating, 0);
    const totalReviews = favoriteGames.reduce((sum, game) => sum + game.reviews, 0);
    const categories = [...new Set(favoriteGames.map(game => game.category))];

    return {
      totalGames: favoriteGames.length,
      averageRating: (totalRating / favoriteGames.length).toFixed(1),
      totalReviews: totalReviews.toLocaleString(),
      categories: categories.length
    };
  }, [favoriteGames]);

  return (
    <motion.div 
      className="favorites-page"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Hero Section */}
      <section className="favorites-hero">
        <div className="container">
          <motion.div className="hero-content" variants={itemVariants}>
            <div className="hero-icon">
              <Heart className="heart-icon" />
            </div>
            <h1 className="page-title">My Favorites</h1>
            <p className="page-subtitle">
              Your personally curated collection of amazing games
            </p>
          </motion.div>
        </div>
      </section>

      {favoriteGames.length > 0 ? (
        <>
          {/* Statistics */}
          <section className="favorites-stats">
            <div className="container">
              <motion.div className="stats-grid" variants={itemVariants}>
                <div className="stat-card">
                  <div className="stat-icon">🎮</div>
                  <div className="stat-number">{stats.totalGames}</div>
                  <div className="stat-label">Favorite Games</div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon">⭐</div>
                  <div className="stat-number">{stats.averageRating}</div>
                  <div className="stat-label">Average Rating</div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon">📝</div>
                  <div className="stat-number">{stats.totalReviews}</div>
                  <div className="stat-label">Total Reviews</div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon">📂</div>
                  <div className="stat-number">{stats.categories}</div>
                  <div className="stat-label">Categories</div>
                </div>
              </motion.div>
            </div>
          </section>

          {/* Controls */}
          <section className="favorites-controls">
            <div className="container">
              <motion.div className="controls-wrapper" variants={itemVariants}>
                {/* Search */}
                <div className="search-container">
                  <Search className="search-icon" />
                  <input
                    type="text"
                    placeholder="Search your favorites..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="search-input"
                  />
                </div>

                {/* Sort and View Controls */}
                <div className="control-group">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="sort-select"
                  >
                    <option value="name">Sort by Name</option>
                    <option value="rating">Sort by Rating</option>
                    <option value="category">Sort by Category</option>
                    <option value="newest">Sort by Newest</option>
                  </select>

                  <div className="view-toggle">
                    <button
                      className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
                      onClick={() => setViewMode('grid')}
                    >
                      <Grid size={20} />
                    </button>
                    <button
                      className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
                      onClick={() => setViewMode('list')}
                    >
                      <List size={20} />
                    </button>
                  </div>

                  <button
                    className="clear-all-btn"
                    onClick={clearAllFavorites}
                    title="Clear all favorites"
                  >
                    <Trash2 size={20} />
                    Clear All
                  </button>
                </div>
              </motion.div>
            </div>
          </section>

          {/* Games Grid */}
          <section className="favorites-games">
            <div className="container">
              {filteredFavorites.length > 0 ? (
                <motion.div 
                  className={`games-grid ${viewMode}`}
                  variants={containerVariants}
                >
                  {filteredFavorites.map((game, index) => (
                    <motion.div key={game.id} variants={itemVariants}>
                      <GameCard game={game} index={index} />
                    </motion.div>
                  ))}
                </motion.div>
              ) : (
                <motion.div className="no-results" variants={itemVariants}>
                  <div className="no-results-icon">🔍</div>
                  <h3>No matches found</h3>
                  <p>No favorites match your search "{searchTerm}"</p>
                  <button 
                    className="clear-search-btn"
                    onClick={() => setSearchTerm('')}
                  >
                    Clear Search
                  </button>
                </motion.div>
              )}
            </div>
          </section>

          {/* Category Breakdown */}
          <section className="category-breakdown">
            <div className="container">
              <motion.div className="breakdown-content" variants={itemVariants}>
                <h2>Your Favorite Categories</h2>
                <div className="category-list">
                  {[...new Set(favoriteGames.map(game => game.category))].map(category => {
                    const count = favoriteGames.filter(game => game.category === category).length;
                    const percentage = ((count / favoriteGames.length) * 100).toFixed(1);
                    
                    return (
                      <div key={category} className="category-item">
                        <div className="category-info">
                          <span className="category-name">{category}</span>
                          <span className="category-count">{count} games</span>
                        </div>
                        <div className="category-bar">
                          <div 
                            className="category-fill" 
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                        <span className="category-percentage">{percentage}%</span>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            </div>
          </section>
        </>
      ) : (
        /* Empty State */
        <section className="empty-favorites">
          <div className="container">
            <motion.div className="empty-content" variants={itemVariants}>
              <div className="empty-icon">
                <Heart className="heart-outline" />
              </div>
              <h2>No Favorites Yet</h2>
              <p>
                Start building your personal game collection by clicking the heart icon 
                on games you love!
              </p>
              <div className="empty-features">
                <div className="feature">
                  <Heart className="feature-icon" />
                  <span>Save your favorite games</span>
                </div>
                <div className="feature">
                  <Star className="feature-icon" />
                  <span>Quick access to top picks</span>
                </div>
                <div className="feature">
                  <Calendar className="feature-icon" />
                  <span>Build your gaming wishlist</span>
                </div>
              </div>
              <Link to="/games" className="btn btn-primary">
                Discover Games
                <ArrowRight />
              </Link>
            </motion.div>
          </div>
        </section>
      )}

      {/* Quick Tips */}
      <section className="favorites-tips">
        <div className="container">
          <motion.div className="tips-content" variants={itemVariants}>
            <h3>💡 Pro Tips</h3>
            <div className="tips-grid">
              <div className="tip">
                <div className="tip-icon">❤️</div>
                <p>Click the heart on any game card to add it to your favorites</p>
              </div>
              <div className="tip">
                <div className="tip-icon">🔍</div>
                <p>Use the search to quickly find specific games in your collection</p>
              </div>
              <div className="tip">
                <div className="tip-icon">📊</div>
                <p>Your favorites are saved locally and sync across sessions</p>
              </div>
              <div className="tip">
                <div className="tip-icon">🎮</div>
                <p>Build different collections for different moods and occasions</p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </motion.div>
  );
};

export default Favorites;