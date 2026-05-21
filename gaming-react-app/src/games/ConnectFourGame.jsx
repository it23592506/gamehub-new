import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import './ConnectFourGame.css';

const ConnectFourGame = () => {
  const ROWS = 6;
  const COLS = 7;
  const EMPTY = 0;
  const PLAYER = 1;
  const COMPUTER = 2;

  const [board, setBoard] = useState(() => 
    Array(ROWS).fill().map(() => Array(COLS).fill(EMPTY))
  );
  const [currentPlayer, setCurrentPlayer] = useState(PLAYER);
  const [gameOver, setGameOver] = useState(false);
  const [winner, setWinner] = useState(null);
  const [winningCells, setWinningCells] = useState([]);
  const [score, setScore] = useState({ player: 0, computer: 0, draws: 0 });
  const [difficulty, setDifficulty] = useState('medium');
  const [gameRunning, setGameRunning] = useState(false);

  // Check if a move is valid
  const isValidMove = (col) => {
    return board[0][col] === EMPTY;
  };

  // Get the next available row in a column
  const getNextRow = (col) => {
    for (let row = ROWS - 1; row >= 0; row--) {
      if (board[row][col] === EMPTY) {
        return row;
      }
    }
    return -1;
  };

  // Check for four in a row
  const checkWin = useCallback((board, row, col, player) => {
    const directions = [
      [0, 1],   // horizontal
      [1, 0],   // vertical
      [1, 1],   // diagonal /
      [1, -1]   // diagonal \
    ];

    for (let [dx, dy] of directions) {
      let count = 1;
      let cells = [[row, col]];

      // Check positive direction
      let r = row + dx;
      let c = col + dy;
      while (r >= 0 && r < ROWS && c >= 0 && c < COLS && board[r][c] === player) {
        cells.push([r, c]);
        count++;
        r += dx;
        c += dy;
      }

      // Check negative direction
      r = row - dx;
      c = col - dy;
      while (r >= 0 && r < ROWS && c >= 0 && c < COLS && board[r][c] === player) {
        cells.push([r, c]);
        count++;
        r -= dx;
        c -= dy;
      }

      if (count >= 4) {
        return cells;
      }
    }
    return null;
  }, []);

  // Check if board is full
  const isBoardFull = (board) => {
    return board[0].every(cell => cell !== EMPTY);
  };

  // AI evaluation function
  const evaluateWindow = (window, piece) => {
    let score = 0;
    const oppPiece = piece === PLAYER ? COMPUTER : PLAYER;

    const pieceCount = window.filter(cell => cell === piece).length;
    const emptyCount = window.filter(cell => cell === EMPTY).length;
    const oppCount = window.filter(cell => cell === oppPiece).length;

    if (pieceCount === 4) score += 100;
    else if (pieceCount === 3 && emptyCount === 1) score += 10;
    else if (pieceCount === 2 && emptyCount === 2) score += 2;

    if (oppCount === 3 && emptyCount === 1) score -= 80;

    return score;
  };

  // Score the board position
  const scorePosition = (board, piece) => {
    let score = 0;

    // Center column preference
    const centerArray = board.map(row => row[Math.floor(COLS/2)]);
    const centerCount = centerArray.filter(cell => cell === piece).length;
    score += centerCount * 3;

    // Horizontal
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS - 3; c++) {
        const window = board[r].slice(c, c + 4);
        score += evaluateWindow(window, piece);
      }
    }

    // Vertical
    for (let c = 0; c < COLS; c++) {
      for (let r = 0; r < ROWS - 3; r++) {
        const window = [board[r][c], board[r+1][c], board[r+2][c], board[r+3][c]];
        score += evaluateWindow(window, piece);
      }
    }

    // Positive diagonal
    for (let r = 0; r < ROWS - 3; r++) {
      for (let c = 0; c < COLS - 3; c++) {
        const window = [board[r][c], board[r+1][c+1], board[r+2][c+2], board[r+3][c+3]];
        score += evaluateWindow(window, piece);
      }
    }

    // Negative diagonal
    for (let r = 0; r < ROWS - 3; r++) {
      for (let c = 3; c < COLS; c++) {
        const window = [board[r][c], board[r+1][c-1], board[r+2][c-2], board[r+3][c-3]];
        score += evaluateWindow(window, piece);
      }
    }

    return score;
  };

  // Minimax algorithm with alpha-beta pruning
  const minimax = (board, depth, alpha, beta, maximizingPlayer) => {
    const validColumns = [];
    for (let col = 0; col < COLS; col++) {
      if (isValidMove(col)) validColumns.push(col);
    }

    const isTerminal = validColumns.length === 0 || depth === 0;

    if (isTerminal) {
      if (isBoardFull(board)) return [null, 0];
      return [null, scorePosition(board, COMPUTER)];
    }

    if (maximizingPlayer) {
      let maxEval = -Infinity;
      let bestCol = validColumns[Math.floor(Math.random() * validColumns.length)];

      for (let col of validColumns) {
        const row = getNextRow(col);
        if (row === -1) continue;

        const newBoard = board.map(row => [...row]);
        newBoard[row][col] = COMPUTER;

        const [, eval_score] = minimax(newBoard, depth - 1, alpha, beta, false);

        if (eval_score > maxEval) {
          maxEval = eval_score;
          bestCol = col;
        }

        alpha = Math.max(alpha, eval_score);
        if (beta <= alpha) break;
      }

      return [bestCol, maxEval];
    } else {
      let minEval = Infinity;
      let bestCol = validColumns[Math.floor(Math.random() * validColumns.length)];

      for (let col of validColumns) {
        const row = getNextRow(col);
        if (row === -1) continue;

        const newBoard = board.map(row => [...row]);
        newBoard[row][col] = PLAYER;

        const [, eval_score] = minimax(newBoard, depth - 1, alpha, beta, true);

        if (eval_score < minEval) {
          minEval = eval_score;
          bestCol = col;
        }

        beta = Math.min(beta, eval_score);
        if (beta <= alpha) break;
      }

      return [bestCol, minEval];
    }
  };

  // Computer move
  const makeComputerMove = useCallback(() => {
    if (!gameRunning || gameOver || currentPlayer !== COMPUTER) return;

    setTimeout(() => {
      let col;
      
      if (difficulty === 'easy') {
        // Random move
        const validCols = [];
        for (let i = 0; i < COLS; i++) {
          if (isValidMove(i)) validCols.push(i);
        }
        col = validCols[Math.floor(Math.random() * validCols.length)];
      } else if (difficulty === 'medium') {
        // Medium difficulty - look ahead 3 moves
        const [bestCol] = minimax(board, 3, -Infinity, Infinity, true);
        col = bestCol;
      } else {
        // Hard difficulty - look ahead 5 moves
        const [bestCol] = minimax(board, 5, -Infinity, Infinity, true);
        col = bestCol;
      }

      if (col !== null && isValidMove(col)) {
        makeMove(col, COMPUTER);
      }
    }, 500); // Delay for better UX
  }, [board, currentPlayer, gameOver, gameRunning, difficulty]);

  // Make a move
  const makeMove = (col, player) => {
    if (!gameRunning || gameOver || !isValidMove(col)) return;

    const row = getNextRow(col);
    if (row === -1) return;

    const newBoard = board.map(row => [...row]);
    newBoard[row][col] = player;
    setBoard(newBoard);

    // Check for win
    const winCells = checkWin(newBoard, row, col, player);
    if (winCells) {
      setWinner(player);
      setWinningCells(winCells);
      setGameOver(true);
      setGameRunning(false);
      
      setScore(prev => ({
        ...prev,
        [player === PLAYER ? 'player' : 'computer']: prev[player === PLAYER ? 'player' : 'computer'] + 1
      }));
    } else if (isBoardFull(newBoard)) {
      setGameOver(true);
      setGameRunning(false);
      setScore(prev => ({ ...prev, draws: prev.draws + 1 }));
    } else {
      setCurrentPlayer(player === PLAYER ? COMPUTER : PLAYER);
    }
  };

  // Handle column click
  const handleColumnClick = (col) => {
    if (currentPlayer === PLAYER && gameRunning && !gameOver) {
      makeMove(col, PLAYER);
    }
  };

  // Start new game
  const startNewGame = () => {
    setBoard(Array(ROWS).fill().map(() => Array(COLS).fill(EMPTY)));
    setCurrentPlayer(PLAYER);
    setGameOver(false);
    setWinner(null);
    setWinningCells([]);
    setGameRunning(true);
  };

  // Reset score
  const resetScore = () => {
    setScore({ player: 0, computer: 0, draws: 0 });
  };

  // Computer move effect
  useEffect(() => {
    if (currentPlayer === COMPUTER && !gameOver && gameRunning) {
      makeComputerMove();
    }
  }, [currentPlayer, gameOver, gameRunning, makeComputerMove]);

  const getCellClass = (row, col) => {
    const cell = board[row][col];
    let className = 'connect-four-cell';
    
    if (cell === PLAYER) className += ' player';
    else if (cell === COMPUTER) className += ' computer';
    
    // Check if this cell is part of winning combination
    const isWinning = winningCells.some(([r, c]) => r === row && c === col);
    if (isWinning) className += ' winning';
    
    return className;
  };

  const getColumnClass = (col) => {
    let className = 'connect-four-column';
    if (currentPlayer === PLAYER && gameRunning && !gameOver && isValidMove(col)) {
      className += ' playable';
    }
    return className;
  };

  return (
    <motion.div 
      className="connect-four-game"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="connect-four-container">
        <div className="connect-four-sidebar">
          <div className="connect-four-info">
            <h2>CONNECT FOUR</h2>
            <div className="score-board">
              <div className="score-item">
                <span className="score-label">You:</span>
                <span className="score-value player-score">{score.player}</span>
              </div>
              <div className="score-item">
                <span className="score-label">Computer:</span>
                <span className="score-value computer-score">{score.computer}</span>
              </div>
              <div className="score-item">
                <span className="score-label">Draws:</span>
                <span className="score-value">{score.draws}</span>
              </div>
            </div>
            
            <div className="current-player">
              {gameRunning && !gameOver && (
                <p>Current Player: 
                  <span className={currentPlayer === PLAYER ? 'player-turn' : 'computer-turn'}>
                    {currentPlayer === PLAYER ? ' You' : ' Computer'}
                  </span>
                </p>
              )}
            </div>
          </div>
          
          <div className="difficulty-selector">
            <h4>Difficulty:</h4>
            <div className="difficulty-buttons">
              {['easy', 'medium', 'hard'].map(level => (
                <button
                  key={level}
                  className={`difficulty-btn ${difficulty === level ? 'active' : ''}`}
                  onClick={() => setDifficulty(level)}
                  disabled={gameRunning}
                >
                  {level.charAt(0).toUpperCase() + level.slice(1)}
                </button>
              ))}
            </div>
          </div>
          
          <div className="connect-four-controls">
            <button onClick={startNewGame} className="game-button start">
              {gameRunning ? 'New Game' : 'Start Game'}
            </button>
            
            <button onClick={resetScore} className="game-button reset">
              Reset Score
            </button>
          </div>
          
          {gameOver && (
            <div className="game-over">
              <h3>Game Over!</h3>
              {winner === PLAYER && <p className="win-message">🎉 You Win!</p>}
              {winner === COMPUTER && <p className="lose-message">🤖 Computer Wins!</p>}
              {!winner && <p className="draw-message">🤝 It's a Draw!</p>}
              <button onClick={startNewGame} className="game-button restart">
                Play Again
              </button>
            </div>
          )}
          
          <div className="connect-four-instructions">
            <h4>How to Play:</h4>
            <p>🔴 You are red pieces</p>
            <p>🟡 Computer is yellow pieces</p>
            <p>Click a column to drop your piece</p>
            <p>Get 4 in a row to win!</p>
            <p>(horizontal, vertical, or diagonal)</p>
          </div>
        </div>
        
        <div className="connect-four-board-container">
          <div className="connect-four-board">
            {Array.from({ length: COLS }, (_, col) => (
              <div
                key={col}
                className={getColumnClass(col)}
                onClick={() => handleColumnClick(col)}
              >
                {Array.from({ length: ROWS }, (_, row) => (
                  <div
                    key={`${row}-${col}`}
                    className={getCellClass(row, col)}
                  >
                    <div className="piece" />
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ConnectFourGame;