import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, Filter, Grid, List, ArrowRight } from 'lucide-react';
import GameCard from '../components/games/GameCard';
import { gamesData, categories } from '../data/games';
import './Categories.css';

const Categories = () => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('grid');
  const [sortBy, setSortBy] = useState('name');

  // Calculate games count for each category
  const categoriesWithCount = useMemo(() => {
    return categories.map(category => ({
      ...category,
      gameCount: category.id === 'all' 
        ? gamesData.length 
        : gamesData.filter(game => game.category.toLowerCase() === category.id).length
    }));
  }, []);

  // Filter games based on selected category and search term
  const filteredGames = useMemo(() => {
    let games = selectedCategory === 'all' 
      ? gamesData 
      : gamesData.filter(game => game.category.toLowerCase() === selectedCategory);

    if (searchTerm) {
      games = games.filter(game =>
        game.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        game.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        game.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Sort games
    games.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.title.localeCompare(b.title);
        case 'rating':
          return b.rating - a.rating;
        case 'reviews':
          return b.reviews - a.reviews;
        case 'newest':
          return new Date(b.releaseDate) - new Date(a.releaseDate);
        default:
          return 0;
      }
    });

    return games;
  }, [selectedCategory, searchTerm, sortBy]);

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

  const selectedCategoryData = categoriesWithCount.find(cat => cat.id === selectedCategory);

  return (
    <motion.div 
      className="categories-page"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Hero Section */}
      <section className="categories-hero">
        <div className="container">
          <motion.div className="hero-content" variants={itemVariants}>
            <h1 className="page-title">Game Categories</h1>
            <p className="page-subtitle">
              Explore our extensive collection of games organized by genres and categories
            </p>
          </motion.div>
        </div>
      </section>

      {/* Category Navigation */}
      <section className="category-navigation">
        <div className="container">
          <motion.div className="category-tabs" variants={itemVariants}>
            {categoriesWithCount.map((category) => (
              <button
                key={category.id}
                className={`category-tab ${selectedCategory === category.id ? 'active' : ''}`}
                onClick={() => setSelectedCategory(category.id)}
              >
                <span className="category-icon">{category.icon}</span>
                <span className="category-name">{category.name}</span>
                <span className="category-count">({category.gameCount})</span>
              </button>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Category Header */}
      {selectedCategory !== 'all' && (
        <section className="category-header">
          <div className="container">
            <motion.div className="category-info" variants={itemVariants}>
              <div className="category-icon-large">{selectedCategoryData?.icon}</div>
              <div className="category-details">
                <h2 className="category-title">{selectedCategoryData?.name} Games</h2>
                <p className="category-description">
                  {selectedCategoryData?.gameCount} games available in this category
                </p>
              </div>
            </motion.div>
          </div>
        </section>
      )}

      {/* Controls */}
      <section className="category-controls">
        <div className="container">
          <motion.div className="controls-wrapper" variants={itemVariants}>
            {/* Search */}
            <div className="search-container">
              <Search className="search-icon" />
              <input
                type="text"
                placeholder="Search games in this category..."
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
                <option value="reviews">Sort by Popularity</option>
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
            </div>
          </motion.div>
        </div>
      </section>

      {/* Games Grid */}
      <section className="category-games">
        <div className="container">
          {filteredGames.length > 0 ? (
            <motion.div 
              className={`games-grid ${viewMode}`}
              variants={containerVariants}
            >
              {filteredGames.map((game, index) => (
                <motion.div key={game.id} variants={itemVariants}>
                  <GameCard game={game} index={index} />
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <motion.div className="no-games" variants={itemVariants}>
              <div className="no-games-icon">🎮</div>
              <h3>No Games Found</h3>
              <p>
                {searchTerm 
                  ? `No games match your search "${searchTerm}" in this category.`
                  : `No games available in this category yet.`
                }
              </p>
              {searchTerm && (
                <button 
                  className="clear-search-btn"
                  onClick={() => setSearchTerm('')}
                >
                  Clear Search
                </button>
              )}
            </motion.div>
          )}
        </div>
      </section>

      {/* Category Stats */}
      <section className="category-stats">
        <div className="container">
          <motion.div className="stats-grid" variants={itemVariants}>
            <div className="stat-card">
              <div className="stat-number">{gamesData.length}</div>
              <div className="stat-label">Total Games</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">{categories.length - 1}</div>
              <div className="stat-label">Categories</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">
                {gamesData.reduce((sum, game) => sum + game.reviews, 0).toLocaleString()}
              </div>
              <div className="stat-label">Total Reviews</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">
                {(gamesData.reduce((sum, game) => sum + game.rating, 0) / gamesData.length).toFixed(1)}
              </div>
              <div className="stat-label">Average Rating</div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="category-cta">
        <div className="container">
          <motion.div className="cta-content" variants={itemVariants}>
            <h2>Can't Find What You're Looking For?</h2>
            <p>Explore all our games or check out our featured collection</p>
            <div className="cta-buttons">
              <Link to="/games" className="btn btn-primary">
                Browse All Games
                <ArrowRight />
              </Link>
              <Link to="/" className="btn btn-outline">
                View Featured
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </motion.div>
  );
};

export default Categories;