import React, { useState, useEffect, useCallback } from 'react';
import './TicTacToeGame.css';

const TicTacToeGame = () => {
  // Game state
  const [board, setBoard] = useState(Array(9).fill(null));
  const [isXNext, setIsXNext] = useState(true);
  const [gameMode, setGameMode] = useState('pvp'); // 'pvp' or 'ai'
  const [winner, setWinner] = useState(null);
  const [gameOver, setGameOver] = useState(false);
  const [scores, setScores] = useState({ X: 0, O: 0, draws: 0 });
  const [winningLine, setWinningLine] = useState([]);
  const [aiDifficulty, setAiDifficulty] = useState('medium'); // 'easy', 'medium', 'hard'

  // Winning combinations
  const WINNING_LINES = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
    [0, 4, 8], [2, 4, 6] // Diagonals
  ];

  // Check for winner
  const calculateWinner = useCallback((squares) => {
    for (let line of WINNING_LINES) {
      const [a, b, c] = line;
      if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
        return { winner: squares[a], line };
      }
    }
    return null;
  }, [WINNING_LINES]);

  // Check if board is full
  const isBoardFull = (squares) => {
    return squares.every(square => square !== null);
  };

  // AI logic
  const getAIMove = useCallback((squares, difficulty) => {
    const availableMoves = squares
      .map((square, index) => square === null ? index : null)
      .filter(val => val !== null);

    if (availableMoves.length === 0) return null;

    // Easy AI - random move
    if (difficulty === 'easy') {
      return availableMoves[Math.floor(Math.random() * availableMoves.length)];
    }

    // Medium and Hard AI - minimax with varying depth
    const minimax = (squares, depth, isMaximizing, alpha = -Infinity, beta = Infinity) => {
      const result = calculateWinner(squares);
      
      if (result && result.winner === 'O') return 10 - depth;
      if (result && result.winner === 'X') return depth - 10;
      if (isBoardFull(squares)) return 0;
      
      // Limit depth for medium difficulty
      if (difficulty === 'medium' && depth > 4) return 0;

      if (isMaximizing) {
        let maxEval = -Infinity;
        for (let i = 0; i < squares.length; i++) {
          if (squares[i] === null) {
            squares[i] = 'O';
            const eval1 = minimax(squares, depth + 1, false, alpha, beta);
            squares[i] = null;
            maxEval = Math.max(maxEval, eval1);
            alpha = Math.max(alpha, eval1);
            if (beta <= alpha) break;
          }
        }
        return maxEval;
      } else {
        let minEval = Infinity;
        for (let i = 0; i < squares.length; i++) {
          if (squares[i] === null) {
            squares[i] = 'X';
            const eval1 = minimax(squares, depth + 1, true, alpha, beta);
            squares[i] = null;
            minEval = Math.min(minEval, eval1);
            beta = Math.min(beta, eval1);
            if (beta <= alpha) break;
          }
        }
        return minEval;
      }
    };

    let bestMove = -1;
    let bestValue = -Infinity;

    for (let i = 0; i < squares.length; i++) {
      if (squares[i] === null) {
        squares[i] = 'O';
        const moveValue = minimax(squares, 0, false);
        squares[i] = null;

        if (moveValue > bestValue) {
          bestMove = i;
          bestValue = moveValue;
        }
      }
    }

    // Add some randomness for medium difficulty
    if (difficulty === 'medium' && Math.random() < 0.2) {
      return availableMoves[Math.floor(Math.random() * availableMoves.length)];
    }

    return bestMove;
  }, [calculateWinner]);

  // Handle square click
  const handleSquareClick = (index) => {
    if (board[index] || gameOver) return;

    const newBoard = [...board];
    newBoard[index] = isXNext ? 'X' : 'O';
    setBoard(newBoard);

    const result = calculateWinner(newBoard);
    if (result) {
      setWinner(result.winner);
      setWinningLine(result.line);
      setGameOver(true);
      setScores(prev => ({
        ...prev,
        [result.winner]: prev[result.winner] + 1
      }));
    } else if (isBoardFull(newBoard)) {
      setGameOver(true);
      setScores(prev => ({
        ...prev,
        draws: prev.draws + 1
      }));
    } else {
      setIsXNext(!isXNext);
    }
  };

  // AI move effect
  useEffect(() => {
    if (gameMode === 'ai' && !isXNext && !gameOver) {
      const timer = setTimeout(() => {
        const aiMove = getAIMove(board, aiDifficulty);
        if (aiMove !== null) {
          handleSquareClick(aiMove);
        }
      }, 500); // Small delay for better UX

      return () => clearTimeout(timer);
    }
  }, [gameMode, isXNext, gameOver, board, aiDifficulty, getAIMove]);

  // Reset game
  const resetGame = () => {
    setBoard(Array(9).fill(null));
    setIsXNext(true);
    setWinner(null);
    setGameOver(false);
    setWinningLine([]);
  };

  // Reset scores
  const resetScores = () => {
    setScores({ X: 0, O: 0, draws: 0 });
  };

  // Change game mode
  const changeGameMode = (mode) => {
    setGameMode(mode);
    resetGame();
  };

  // Get current player for display
  const getCurrentPlayer = () => {
    if (gameOver) {
      if (winner) {
        return gameMode === 'ai' ? 
          (winner === 'X' ? 'You Win!' : 'AI Wins!') : 
          `Player ${winner} Wins!`;
      } else {
        return "It's a Draw!";
      }
    }
    return gameMode === 'ai' ? 
      (isXNext ? 'Your Turn' : 'AI Turn') : 
      `Player ${isXNext ? 'X' : 'O'}'s Turn`;
  };

  // Render square
  const renderSquare = (index) => {
    const isWinningSquare = winningLine.includes(index);
    return (
      <button
        key={index}
        className={`square ${isWinningSquare ? 'winning' : ''} ${board[index] ? 'filled' : ''}`}
        onClick={() => handleSquareClick(index)}
        disabled={gameOver || (gameMode === 'ai' && !isXNext)}
      >
        <span className={`symbol ${board[index]}`}>
          {board[index]}
        </span>
      </button>
    );
  };

  return (
    <div className="tictactoe-game">
      <div className="game-header">
        <h2>Tic Tac Toe</h2>
        <div className="game-status">
          <p className="current-player">{getCurrentPlayer()}</p>
        </div>
      </div>

      <div className="game-modes">
        <button 
          className={`mode-btn ${gameMode === 'pvp' ? 'active' : ''}`}
          onClick={() => changeGameMode('pvp')}
        >
          Player vs Player
        </button>
        <button 
          className={`mode-btn ${gameMode === 'ai' ? 'active' : ''}`}
          onClick={() => changeGameMode('ai')}
        >
          Player vs AI
        </button>
      </div>

      {gameMode === 'ai' && (
        <div className="ai-difficulty">
          <label>AI Difficulty:</label>
          <select 
            value={aiDifficulty} 
            onChange={(e) => setAiDifficulty(e.target.value)}
            disabled={!gameOver && board.some(square => square !== null)}
          >
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>
        </div>
      )}

      <div className="game-board">
        <div className="board-grid">
          {Array(9).fill(null).map((_, index) => renderSquare(index))}
        </div>
      </div>

      <div className="game-stats">
        <div className="score-board">
          <h4>Score Board</h4>
          <div className="scores">
            <div className="score-item">
              <span className="score-label">
                {gameMode === 'ai' ? 'You (X)' : 'Player X'}
              </span>
              <span className="score-value">{scores.X}</span>
            </div>
            <div className="score-item">
              <span className="score-label">Draws</span>
              <span className="score-value">{scores.draws}</span>
            </div>
            <div className="score-item">
              <span className="score-label">
                {gameMode === 'ai' ? 'AI (O)' : 'Player O'}
              </span>
              <span className="score-value">{scores.O}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="game-controls">
        <button className="btn btn-primary" onClick={resetGame}>
          New Game
        </button>
        <button className="btn btn-secondary" onClick={resetScores}>
          Reset Scores
        </button>
      </div>

      <div className="game-instructions">
        <h4>How to Play</h4>
        <p>• Get 3 in a row horizontally, vertically, or diagonally to win</p>
        <p>• Player X always goes first</p>
        <p>• In AI mode, you are always X (first player)</p>
        <p>• Choose AI difficulty: Easy (random), Medium (smart with mistakes), Hard (perfect play)</p>
      </div>
    </div>
  );
};

export default TicTacToeGame;