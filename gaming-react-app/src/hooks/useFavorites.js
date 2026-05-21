import { useState, useEffect } from 'react';

export const useFavorites = () => {
  const [favorites, setFavorites] = useState([]);

  useEffect(() => {
    const savedFavorites = localStorage.getItem('gamingFavorites');
    if (savedFavorites) {
      setFavorites(JSON.parse(savedFavorites));
    }
  }, []);

  const addToFavorites = (gameId) => {
    const newFavorites = [...favorites, gameId];
    setFavorites(newFavorites);
    localStorage.setItem('gamingFavorites', JSON.stringify(newFavorites));
  };

  const removeFromFavorites = (gameId) => {
    const newFavorites = favorites.filter(id => id !== gameId);
    setFavorites(newFavorites);
    localStorage.setItem('gamingFavorites', JSON.stringify(newFavorites));
  };

  const toggleFavorite = (gameId) => {
    if (favorites.includes(gameId)) {
      removeFromFavorites(gameId);
    } else {
      addToFavorites(gameId);
    }
  };

  const isFavorite = (gameId) => {
    return favorites.includes(gameId);
  };

  return {
    favorites,
    addToFavorites,
    removeFromFavorites,
    toggleFavorite,
    isFavorite
  };
};