export const formatPrice = (price) => {
  if (price === "Free" || price === "free") return "Free";
  return price;
};

export const formatRating = (rating) => {
  return rating.toFixed(1);
};

export const generateStars = (rating) => {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 !== 0;
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
  
  return {
    full: fullStars,
    half: hasHalfStar,
    empty: emptyStars
  };
};

export const filterGamesByCategory = (games, category) => {
  if (category === "all") return games;
  return games.filter(game => 
    game.category.toLowerCase() === category.toLowerCase()
  );
};

export const searchGames = (games, searchTerm) => {
  if (!searchTerm) return games;
  
  const term = searchTerm.toLowerCase();
  return games.filter(game => 
    game.title.toLowerCase().includes(term) ||
    game.category.toLowerCase().includes(term) ||
    game.tags.some(tag => tag.toLowerCase().includes(term)) ||
    game.developer.toLowerCase().includes(term)
  );
};

export const sortGames = (games, sortBy) => {
  const gamesCopy = [...games];
  
  switch (sortBy) {
    case "rating":
      return gamesCopy.sort((a, b) => b.rating - a.rating);
    case "name":
      return gamesCopy.sort((a, b) => a.title.localeCompare(b.title));
    case "price":
      return gamesCopy.sort((a, b) => {
        const priceA = a.price === "Free" ? 0 : parseFloat(a.price.replace("$", ""));
        const priceB = b.price === "Free" ? 0 : parseFloat(b.price.replace("$", ""));
        return priceA - priceB;
      });
    case "newest":
      return gamesCopy.sort((a, b) => b.id - a.id);
    default:
      return gamesCopy;
  }
};

export const getGameById = (games, id) => {
  return games.find(game => game.id === parseInt(id));
};

export const getRelatedGames = (games, currentGame, limit = 3) => {
  return games
    .filter(game => 
      game.id !== currentGame.id && 
      (game.category === currentGame.category || 
       game.tags.some(tag => currentGame.tags.includes(tag)))
    )
    .slice(0, limit);
};