import React from 'react';
import { Link } from 'react-router-dom';
import { Star, Heart, ShoppingCart, Play } from 'lucide-react';
import { useFavorites } from '../../hooks/useFavorites';
import { formatPrice, generateStars } from '../../utils/gameUtils';
import { motion } from 'framer-motion';
import './GameCard.css';

const GameCard = ({ game, index = 0 }) => {
  const { toggleFavorite, isFavorite } = useFavorites();
  const stars = generateStars(game.rating);

  const cardVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        duration: 0.6, 
        delay: index * 0.1 
      }
    }
  };

  return (
    <motion.div 
      className="game-card"
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      whileHover={{ 
        y: -10, 
        scale: 1.02,
        transition: { duration: 0.3 }
      }}
    >
      <div className="game-card-image">
        <img 
          src={game.image || '/images/placeholder-game.jpg'} 
          alt={game.title}
          onError={(e) => {
            e.target.src = '/images/placeholder-game.jpg';
          }}
        />
        <div className="game-card-overlay">
          <button 
            className={`favorite-btn ${isFavorite(game.id) ? 'active' : ''}`}
            onClick={(e) => {
              e.preventDefault();
              toggleFavorite(game.id);
            }}
            aria-label="Add to favorites"
          >
            <Heart />
          </button>
          <div className="game-card-actions">
            <Link to={`/game/${game.id}`} className="play-btn">
              <Play />
              <span>Play Now</span>
            </Link>
          </div>
        </div>
        <div className="game-price">
          {formatPrice(game.price)}
        </div>
      </div>

      <div className="game-card-content">
        <div className="game-category">{game.category}</div>
        
        <h3 className="game-title">
          <Link to={`/game/${game.id}`}>{game.title}</Link>
        </h3>
        
        <p className="game-description">{game.description}</p>
        
        <div className="game-rating">
          <div className="stars">
            {[...Array(stars.full)].map((_, i) => (
              <Star key={i} className="star filled" />
            ))}
            {stars.half && <Star className="star half" />}
            {[...Array(stars.empty)].map((_, i) => (
              <Star key={i} className="star" />
            ))}
          </div>
          <span className="rating-text">
            {game.rating} ({game.reviews} reviews)
          </span>
        </div>

        <div className="game-features">
          {game.features?.slice(0, 3).map((feature, index) => (
            <span key={index} className="feature-tag">
              {feature}
            </span>
          ))}
        </div>

        <div className="game-meta">
          <span className="developer">{game.developer}</span>
          <span className="release-date">{game.releaseDate}</span>
        </div>

        <div className="game-card-footer">
          <Link to={`/game/${game.id}`} className="btn btn-primary">
            <Play />
            Play Game
          </Link>
          <button className="btn btn-secondary">
            <ShoppingCart />
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default GameCard;