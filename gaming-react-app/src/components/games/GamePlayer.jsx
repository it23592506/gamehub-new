import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { gamesData } from '../../data/games';

// Import all game components
import SnakeGame from '../../games/SnakeGame';
import TetrisGame from '../../games/TetrisGame';
import TicTacToeGame from '../../games/TicTacToeGame';
import MemoryGame from '../../games/MemoryGame';
import RockPaperScissorsGame from '../../games/RockPaperScissorsGame';
import Game2048 from '../../games/Game2048';
import SpaceInvadersGame from '../../games/SpaceInvadersGame';
import PongGame from '../../games/PongGame';
import FlappyBirdGame from '../../games/FlappyBirdGame';
import BreakoutGame from '../../games/BreakoutGame';
import PacManGame from '../../games/PacManGame';
import FroggerGame from '../../games/FroggerGame';
import DoodleJumpGame from '../../games/DoodleJumpGame';
import AsteroidsGame from '../../games/AsteroidsGame';
import ConnectFourGame from '../../games/ConnectFourGame';
import BattleRoyaleGame from '../../games/BattleRoyaleGame/BattleRoyaleGame';
import RacingGame from '../../games/RacingGame/RacingGame';
import TowerDefenseGame from '../../games/TowerDefenseGame/TowerDefenseGame';
import MMORPGGame from '../../games/MMORPGGame/MMORPGGame';
import RTSGame from '../../games/RTSGame/RTSGame';
import PuzzlePlatformGame from '../../games/PuzzlePlatformGame/PuzzlePlatformGame';

import './GamePlayer.css';

const GamePlayer = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // Find the game data
  const game = gamesData.find(g => g.id === parseInt(id));

  if (!game) {
    return (
      <div className="game-player-container">
        <div className="game-not-found">
          <h2>Game Not Found</h2>
          <p>The game you're looking for doesn't exist.</p>
          <button onClick={() => navigate('/games')} className="back-btn">
            <ArrowLeft size={20} />
            Back to Games
          </button>
        </div>
      </div>
    );
  }

  // Map component names to actual components
  const gameComponents = {
    SnakeGame,
    TetrisGame,
    TicTacToeGame,
    MemoryGame,
    RockPaperScissorsGame,
    Game2048,
    SpaceInvadersGame,
    PongGame,
    FlappyBirdGame,
    BreakoutGame,
    PacManGame,
    FroggerGame,
    DoodleJumpGame,
    AsteroidsGame,
    ConnectFourGame,
    BattleRoyaleGame,
    RacingGame,
    TowerDefenseGame,
    MMORPGGame,
    RTSGame,
    PuzzlePlatformGame
  };

  const GameComponent = gameComponents[game.component];

  if (!GameComponent) {
    return (
      <div className="game-player-container">
        <div className="game-not-found">
          <h2>Game Component Not Found</h2>
          <p>The game component for "{game.title}" is not available.</p>
          <button onClick={() => navigate('/games')} className="back-btn">
            <ArrowLeft size={20} />
            Back to Games
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="game-player-container">
      <div className="game-header">
        <button onClick={() => navigate('/games')} className="back-btn">
          <ArrowLeft size={20} />
          Back to Games
        </button>
        <div className="game-info">
          <h1>{game.title}</h1>
          <p>{game.description}</p>
          <div className="game-meta">
            <span className="category">{game.category}</span>
            <span className="rating">⭐ {game.rating}</span>
            <span className="price">{game.price}</span>
          </div>
        </div>
      </div>
      
      <div className="game-content">
        <GameComponent />
      </div>
    </div>
  );
};

export default GamePlayer;