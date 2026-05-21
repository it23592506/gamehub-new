import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, Grid, List, SortAsc } from 'lucide-react';
import GameCard from '../components/games/GameCard';
import { gamesData, categories } from '../data/games';
import { filterGamesByCategory, searchGames, sortGames } from '../utils/gameUtils';
import { useSearch } from '../hooks/useSearch';
import './Games.css';

const Games = () => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [viewMode, setViewMode] = useState('grid');
  const [showFilters, setShowFilters] = useState(false);

  const { searchTerm, setSearchTerm, filteredData } = useSearch(gamesData, searchGames);

  const processedGames = useMemo(() => {
    let processed = filteredData;
    
    // Apply category filter
    processed = filterGamesByCategory(processed, selectedCategory);
    
    // Apply sorting
    processed = sortGames(processed, sortBy);
    
    return processed;
  }, [filteredData, selectedCategory, sortBy]);

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
      className="games-page"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <div className="container">
        {/* Page Header */}
        <motion.div className="games-header" variants={itemVariants}>
          <h1 className="page-title">
            All Games
            <span className="games-count">({processedGames.length} games)</span>
          </h1>
          <p className="page-subtitle">
            Discover your next favorite game from our extensive collection
          </p>
        </motion.div>

        {/* Search and Filters */}
        <motion.div className="games-controls" variants={itemVariants}>
          <div className="search-section">
            <div className="search-container">
              <Search className="search-icon" />
              <input
                type="text"
                placeholder="Search games..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
            </div>
            
            <button 
              className="filter-toggle"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter />
              Filters
            </button>
          </div>

          <div className={`filters-section ${showFilters ? 'show' : ''}`}>
            {/* Category Filter */}
            <div className="filter-group">
              <label>Category</label>
              <div className="category-filters">
                {categories.map((category) => (
                  <button
                    key={category.id}
                    className={`category-btn ${selectedCategory === category.id ? 'active' : ''}`}
                    onClick={() => setSelectedCategory(category.id)}
                  >
                    <span className="category-icon">{category.icon}</span>
                    {category.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Sort Options */}
            <div className="filter-group">
              <label>Sort By</label>
              <select 
                value={sortBy} 
                onChange={(e) => setSortBy(e.target.value)}
                className="sort-select"
              >
                <option value="newest">Newest</option>
                <option value="rating">Rating</option>
                <option value="name">Name</option>
                <option value="price">Price</option>
              </select>
            </div>

            {/* View Mode */}
            <div className="filter-group">
              <label>View</label>
              <div className="view-toggle">
                <button
                  className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
                  onClick={() => setViewMode('grid')}
                >
                  <Grid />
                </button>
                <button
                  className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
                  onClick={() => setViewMode('list')}
                >
                  <List />
                </button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Games Grid */}
        <motion.div 
          className={`games-container ${viewMode}`}
          variants={itemVariants}
        >
          {processedGames.length > 0 ? (
            <div className={`games-grid ${viewMode}`}>
              {processedGames.map((game, index) => (
                <GameCard 
                  key={game.id} 
                  game={game} 
                  index={index}
                  viewMode={viewMode}
                />
              ))}
            </div>
          ) : (
            <div className="no-games">
              <div className="no-games-icon">🎮</div>
              <h3>No games found</h3>
              <p>Try adjusting your search or filter criteria</p>
              <button 
                className="btn btn-primary"
                onClick={() => {
                  setSearchTerm('');
                  setSelectedCategory('all');
                }}
              >
                Reset Filters
              </button>
            </div>
          )}
        </motion.div>
      </div>
    </motion.div>
  );
};

export default Games;