import React, { useState, useEffect, useCallback } from 'react';
import './Game2048.css';

const Game2048 = () => {
  // Game state
  const [board, setBoard] = useState([]);
  const [score, setScore] = useState(0);
  const [bestScore, setBestScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [won, setWon] = useState(false);
  const [continueAfterWin, setContinueAfterWin] = useState(false);
  const [history, setHistory] = useState([]);
  const [canUndo, setCanUndo] = useState(false);

  // Initialize empty board
  const createEmptyBoard = () => {
    return Array(4).fill().map(() => Array(4).fill(0));
  };

  // Load best score from localStorage
  useEffect(() => {
    const savedBestScore = localStorage.getItem('2048BestScore');
    if (savedBestScore) {
      setBestScore(parseInt(savedBestScore));
    }
  }, []);

  // Save best score
  const saveBestScore = (newScore) => {
    if (newScore > bestScore) {
      setBestScore(newScore);
      localStorage.setItem('2048BestScore', newScore.toString());
    }
  };

  // Get random empty cell
  const getRandomEmptyCell = (board) => {
    const emptyCells = [];
    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 4; j++) {
        if (board[i][j] === 0) {
          emptyCells.push({ row: i, col: j });
        }
      }
    }
    return emptyCells.length > 0 ? 
      emptyCells[Math.floor(Math.random() * emptyCells.length)] : null;
  };

  // Add random tile (2 or 4)
  const addRandomTile = (board) => {
    const emptyCell = getRandomEmptyCell(board);
    if (emptyCell) {
      const newBoard = board.map(row => [...row]);
      newBoard[emptyCell.row][emptyCell.col] = Math.random() < 0.9 ? 2 : 4;
      return newBoard;
    }
    return board;
  };

  // Initialize game
  const initializeGame = useCallback(() => {
    let newBoard = createEmptyBoard();
    newBoard = addRandomTile(newBoard);
    newBoard = addRandomTile(newBoard);
    setBoard(newBoard);
    setScore(0);
    setGameOver(false);
    setWon(false);
    setContinueAfterWin(false);
    setHistory([]);
    setCanUndo(false);
  }, []);

  // Initialize game on component mount
  useEffect(() => {
    initializeGame();
  }, [initializeGame]);

  // Move tiles in a direction
  const moveLeft = (board) => {
    const newBoard = [];
    let scoreGain = 0;
    let moved = false;

    for (let i = 0; i < 4; i++) {
      const row = board[i].filter(cell => cell !== 0);
      const newRow = [];
      
      for (let j = 0; j < row.length; j++) {
        if (j < row.length - 1 && row[j] === row[j + 1]) {
          newRow.push(row[j] * 2);
          scoreGain += row[j] * 2;
          j++; // Skip the next element as it's merged
        } else {
          newRow.push(row[j]);
        }
      }
      
      while (newRow.length < 4) {
        newRow.push(0);
      }
      
      newBoard.push(newRow);
      
      // Check if anything moved
      for (let k = 0; k < 4; k++) {
        if (board[i][k] !== newRow[k]) {
          moved = true;
        }
      }
    }

    return { board: newBoard, scoreGain, moved };
  };

  const moveRight = (board) => {
    const reversedBoard = board.map(row => [...row].reverse());
    const result = moveLeft(reversedBoard);
    return {
      ...result,
      board: result.board.map(row => [...row].reverse())
    };
  };

  const moveUp = (board) => {
    const transposedBoard = board[0].map((_, colIndex) => 
      board.map(row => row[colIndex])
    );
    const result = moveLeft(transposedBoard);
    const finalBoard = result.board[0].map((_, colIndex) => 
      result.board.map(row => row[colIndex])
    );
    return { ...result, board: finalBoard };
  };

  const moveDown = (board) => {
    const transposedBoard = board[0].map((_, colIndex) => 
      board.map(row => row[colIndex])
    );
    const reversedBoard = transposedBoard.map(row => [...row].reverse());
    const result = moveLeft(reversedBoard);
    const transposedResult = result.board[0].map((_, colIndex) => 
      result.board.map(row => row[colIndex])
    );
    const finalBoard = transposedResult.map(row => [...row].reverse());
    return { ...result, board: finalBoard };
  };

  // Check if game is over
  const isGameOver = (board) => {
    // Check for empty cells
    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 4; j++) {
        if (board[i][j] === 0) return false;
      }
    }

    // Check for possible moves
    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 4; j++) {
        const current = board[i][j];
        if (
          (i > 0 && board[i - 1][j] === current) ||
          (i < 3 && board[i + 1][j] === current) ||
          (j > 0 && board[i][j - 1] === current) ||
          (j < 3 && board[i][j + 1] === current)
        ) {
          return false;
        }
      }
    }

    return true;
  };

  // Check if player won (reached 2048)
  const checkWin = (board) => {
    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 4; j++) {
        if (board[i][j] === 2048) return true;
      }
    }
    return false;
  };

  // Make a move
  const makeMove = (direction) => {
    if (gameOver || (won && !continueAfterWin)) return;

    let result;
    switch (direction) {
      case 'left':
        result = moveLeft(board);
        break;
      case 'right':
        result = moveRight(board);
        break;
      case 'up':
        result = moveUp(board);
        break;
      case 'down':
        result = moveDown(board);
        break;
      default:
        return;
    }

    if (!result.moved) return;

    // Save current state for undo
    setHistory([{ board: [...board.map(row => [...row])], score }]);
    setCanUndo(true);

    // Add random tile
    const newBoard = addRandomTile(result.board);
    const newScore = score + result.scoreGain;
    
    setBoard(newBoard);
    setScore(newScore);
    saveBestScore(newScore);

    // Check win condition
    if (!won && checkWin(newBoard)) {
      setWon(true);
    }

    // Check game over
    if (isGameOver(newBoard)) {
      setGameOver(true);
    }
  };

  // Handle keyboard input
  useEffect(() => {
    const handleKeyPress = (event) => {
      switch (event.key) {
        case 'ArrowLeft':
          event.preventDefault();
          makeMove('left');
          break;
        case 'ArrowRight':
          event.preventDefault();
          makeMove('right');
          break;
        case 'ArrowUp':
          event.preventDefault();
          makeMove('up');
          break;
        case 'ArrowDown':
          event.preventDefault();
          makeMove('down');
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [board, gameOver, won, continueAfterWin, score]);

  // Undo last move
  const undoMove = () => {
    if (history.length > 0) {
      const lastState = history[history.length - 1];
      setBoard(lastState.board);
      setScore(lastState.score);
      setHistory([]);
      setCanUndo(false);
      setGameOver(false);
    }
  };

  // Continue after winning
  const continueGame = () => {
    setContinueAfterWin(true);
  };

  // Get tile color class
  const getTileClass = (value) => {
    if (value === 0) return 'tile tile-empty';
    return `tile tile-${value}`;
  };

  // Format number display
  const formatNumber = (num) => {
    return num.toLocaleString();
  };

  return (
    <div className="game-2048">
      <div className="game-header">
        <h2>2048</h2>
        <div className="game-stats">
          <div className="stat">
            <span className="stat-label">Score</span>
            <span className="stat-value">{formatNumber(score)}</span>
          </div>
          <div className="stat">
            <span className="stat-label">Best</span>
            <span className="stat-value">{formatNumber(bestScore)}</span>
          </div>
        </div>
      </div>

      {won && !continueAfterWin && (
        <div className="game-won">
          <h3>🎉 You Win! 🎉</h3>
          <p>You reached 2048!</p>
          <div className="win-controls">
            <button className="btn btn-primary" onClick={continueGame}>
              Keep Going
            </button>
            <button className="btn btn-secondary" onClick={initializeGame}>
              Try Again
            </button>
          </div>
        </div>
      )}

      {gameOver && (
        <div className="game-over">
          <h3>Game Over!</h3>
          <p>No more moves available</p>
          <p>Final Score: {formatNumber(score)}</p>
          {score === bestScore && (
            <p className="new-best">🏆 New Best Score!</p>
          )}
        </div>
      )}

      <div className="game-board">
        <div className="board-background">
          {Array(16).fill().map((_, index) => (
            <div key={index} className="cell-background" />
          ))}
        </div>
        <div className="tiles-container">
          {board.map((row, rowIndex) =>
            row.map((value, colIndex) => {
              // Responsive tile positioning
              const isMobile = window.innerWidth <= 768;
              const isSmallMobile = window.innerWidth <= 480;
              let tileSize;
              if (isSmallMobile) tileSize = 70;
              else if (isMobile) tileSize = 80;
              else tileSize = 125;
              
              return (
                <div
                  key={`${rowIndex}-${colIndex}`}
                  className={getTileClass(value)}
                  style={{
                    transform: `translate(${colIndex * tileSize}px, ${rowIndex * tileSize}px)`
                  }}
                >
                  {value !== 0 && <span className="tile-text">{value}</span>}
                </div>
              );
            })
          )}
        </div>
      </div>

      <div className="mobile-controls">
        <div className="control-row">
          <button 
            className="control-btn up" 
            onClick={() => makeMove('up')}
            disabled={gameOver || (won && !continueAfterWin)}
          >
            ↑
          </button>
        </div>
        <div className="control-row">
          <button 
            className="control-btn left" 
            onClick={() => makeMove('left')}
            disabled={gameOver || (won && !continueAfterWin)}
          >
            ←
          </button>
          <button 
            className="control-btn down" 
            onClick={() => makeMove('down')}
            disabled={gameOver || (won && !continueAfterWin)}
          >
            ↓
          </button>
          <button 
            className="control-btn right" 
            onClick={() => makeMove('right')}
            disabled={gameOver || (won && !continueAfterWin)}
          >
            →
          </button>
        </div>
      </div>

      <div className="game-controls">
        <button className="btn btn-primary" onClick={initializeGame}>
          New Game
        </button>
        
        {canUndo && !gameOver && (
          <button className="btn btn-secondary" onClick={undoMove}>
            Undo
          </button>
        )}
      </div>

      <div className="game-instructions">
        <h4>How to Play</h4>
        <p>• Use arrow keys (or buttons on mobile) to move tiles</p>
        <p>• When two tiles with the same number touch, they merge into one</p>
        <p>• Reach the 2048 tile to win!</p>
        <p>• Keep playing after winning to achieve even higher scores</p>
        <p>• Use the undo button to reverse your last move</p>
      </div>
    </div>
  );
};

export default Game2048;