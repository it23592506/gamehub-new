import React, { useState, useEffect, useCallback } from 'react';
import './MemoryGame.css';

const MemoryGame = () => {
  // Game state
  const [cards, setCards] = useState([]);
  const [flippedCards, setFlippedCards] = useState([]);
  const [matchedCards, setMatchedCards] = useState([]);
  const [moves, setMoves] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameWon, setGameWon] = useState(false);
  const [time, setTime] = useState(0);
  const [difficulty, setDifficulty] = useState('easy');
  const [bestScores, setBestScores] = useState({
    easy: { moves: null, time: null },
    medium: { moves: null, time: null },
    hard: { moves: null, time: null }
  });

  // Card symbols for different difficulties
  const CARD_SETS = {
    easy: ['🎮', '🎯', '🎲', '🎪', '🎨', '🎭'], // 6 pairs = 12 cards
    medium: ['🎮', '🎯', '🎲', '🎪', '🎨', '🎭', '🎸', '🎹', '🎺', '🎻'], // 10 pairs = 20 cards
    hard: ['🎮', '🎯', '🎲', '🎪', '🎨', '🎭', '🎸', '🎹', '🎺', '🎻', '🎤', '🎧', '🎼', '🎵', '🎶'] // 15 pairs = 30 cards
  };

  // Load best scores from localStorage
  useEffect(() => {
    const savedScores = localStorage.getItem('memoryGameBestScores');
    if (savedScores) {
      setBestScores(JSON.parse(savedScores));
    }
  }, []);

  // Save best scores to localStorage
  const saveBestScores = (newScores) => {
    setBestScores(newScores);
    localStorage.setItem('memoryGameBestScores', JSON.stringify(newScores));
  };

  // Shuffle array function
  const shuffleArray = (array) => {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
  };

  // Initialize game
  const initializeGame = useCallback(() => {
    const symbols = CARD_SETS[difficulty];
    const cardPairs = symbols.flatMap((symbol, index) => [
      { id: index * 2, symbol, matched: false },
      { id: index * 2 + 1, symbol, matched: false }
    ]);
    
    const shuffledCards = shuffleArray(cardPairs);
    setCards(shuffledCards);
    setFlippedCards([]);
    setMatchedCards([]);
    setMoves(0);
    setTime(0);
    setGameStarted(false);
    setGameWon(false);
  }, [difficulty]);

  // Initialize game when difficulty changes
  useEffect(() => {
    initializeGame();
  }, [initializeGame]);

  // Timer effect
  useEffect(() => {
    let interval;
    if (gameStarted && !gameWon) {
      interval = setInterval(() => {
        setTime(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [gameStarted, gameWon]);

  // Check for game completion
  useEffect(() => {
    if (matchedCards.length === cards.length && cards.length > 0) {
      setGameWon(true);
      setGameStarted(false);
      
      // Check for new best score
      const currentBest = bestScores[difficulty];
      const isNewBest = (!currentBest.moves || moves < currentBest.moves) || 
                       (!currentBest.time || time < currentBest.time);
      
      if (isNewBest) {
        const newBestScores = {
          ...bestScores,
          [difficulty]: {
            moves: !currentBest.moves || moves < currentBest.moves ? moves : currentBest.moves,
            time: !currentBest.time || time < currentBest.time ? time : currentBest.time
          }
        };
        saveBestScores(newBestScores);
      }
    }
  }, [matchedCards, cards.length, moves, time, difficulty, bestScores]);

  // Handle card click
  const handleCardClick = (clickedCard) => {
    if (!gameStarted) {
      setGameStarted(true);
    }

    // Prevent clicking if card is already flipped or matched
    if (flippedCards.includes(clickedCard.id) || matchedCards.includes(clickedCard.id)) {
      return;
    }

    // Prevent clicking if two cards are already flipped
    if (flippedCards.length === 2) {
      return;
    }

    const newFlippedCards = [...flippedCards, clickedCard.id];
    setFlippedCards(newFlippedCards);

    if (newFlippedCards.length === 2) {
      setMoves(prev => prev + 1);
      
      const [firstCardId, secondCardId] = newFlippedCards;
      const firstCard = cards.find(card => card.id === firstCardId);
      const secondCard = cards.find(card => card.id === secondCardId);

      if (firstCard.symbol === secondCard.symbol) {
        // Match found
        setTimeout(() => {
          setMatchedCards(prev => [...prev, firstCardId, secondCardId]);
          setFlippedCards([]);
        }, 600);
      } else {
        // No match
        setTimeout(() => {
          setFlippedCards([]);
        }, 1000);
      }
    }
  };

  // Reset game
  const resetGame = () => {
    initializeGame();
  };

  // Reset best scores
  const resetBestScores = () => {
    const emptyScores = {
      easy: { moves: null, time: null },
      medium: { moves: null, time: null },
      hard: { moves: null, time: null }
    };
    saveBestScores(emptyScores);
  };

  // Format time display
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Get grid class based on difficulty
  const getGridClass = () => {
    switch (difficulty) {
      case 'easy': return 'grid-easy';
      case 'medium': return 'grid-medium';
      case 'hard': return 'grid-hard';
      default: return 'grid-easy';
    }
  };

  // Render card
  const renderCard = (card) => {
    const isFlipped = flippedCards.includes(card.id) || matchedCards.includes(card.id);
    const isMatched = matchedCards.includes(card.id);
    
    return (
      <div
        key={card.id}
        className={`memory-card ${isFlipped ? 'flipped' : ''} ${isMatched ? 'matched' : ''}`}
        onClick={() => handleCardClick(card)}
      >
        <div className="card-inner">
          <div className="card-front">
            <div className="card-pattern">?</div>
          </div>
          <div className="card-back">
            <div className="card-symbol">{card.symbol}</div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="memory-game">
      <div className="game-header">
        <h2>Memory Card Game</h2>
        <div className="game-stats">
          <div className="stat">
            <span className="stat-label">Moves</span>
            <span className="stat-value">{moves}</span>
          </div>
          <div className="stat">
            <span className="stat-label">Time</span>
            <span className="stat-value">{formatTime(time)}</span>
          </div>
          <div className="stat">
            <span className="stat-label">Pairs</span>
            <span className="stat-value">{matchedCards.length / 2}/{cards.length / 2}</span>
          </div>
        </div>
      </div>

      <div className="difficulty-selector">
        <label>Difficulty:</label>
        <select 
          value={difficulty} 
          onChange={(e) => setDifficulty(e.target.value)}
          disabled={gameStarted && !gameWon}
        >
          <option value="easy">Easy (6 pairs)</option>
          <option value="medium">Medium (10 pairs)</option>
          <option value="hard">Hard (15 pairs)</option>
        </select>
      </div>

      {gameWon && (
        <div className="game-won">
          <h3>🎉 Congratulations! 🎉</h3>
          <p>You completed the game in {moves} moves and {formatTime(time)}!</p>
          {bestScores[difficulty].moves && (
            <p className="best-score">
              Best: {bestScores[difficulty].moves} moves, {formatTime(bestScores[difficulty].time)}
            </p>
          )}
        </div>
      )}

      <div className={`game-board ${getGridClass()}`}>
        {cards.map(card => renderCard(card))}
      </div>

      <div className="game-controls">
        <button className="btn btn-primary" onClick={resetGame}>
          New Game
        </button>
        <button className="btn btn-secondary" onClick={resetBestScores}>
          Reset Best Scores
        </button>
      </div>

      <div className="best-scores">
        <h4>Best Scores</h4>
        <div className="scores-grid">
          {Object.entries(bestScores).map(([level, scores]) => (
            <div key={level} className="score-item">
              <h5>{level.charAt(0).toUpperCase() + level.slice(1)}</h5>
              <p>
                {scores.moves ? `${scores.moves} moves` : 'No record'}
              </p>
              <p>
                {scores.time ? formatTime(scores.time) : 'No record'}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="game-instructions">
        <h4>How to Play</h4>
        <p>• Click cards to flip them and reveal the symbols</p>
        <p>• Find matching pairs by remembering card positions</p>
        <p>• Match all pairs with the fewest moves and fastest time</p>
        <p>• Choose difficulty: Easy (6 pairs), Medium (10 pairs), Hard (15 pairs)</p>
      </div>
    </div>
  );
};

export default MemoryGame;