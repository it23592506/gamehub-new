import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import './TetrisGame.css';

const TetrisGame = () => {
  const BOARD_WIDTH = 10;
  const BOARD_HEIGHT = 20;
  const EMPTY_BOARD = Array(BOARD_HEIGHT).fill().map(() => Array(BOARD_WIDTH).fill(0));

  const TETROMINOS = {
    I: { shape: [[1,1,1,1]], color: '#00d4ff' },
    O: { shape: [[1,1],[1,1]], color: '#ffaa00' },
    T: { shape: [[0,1,0],[1,1,1]], color: '#aa00ff' },
    S: { shape: [[0,1,1],[1,1,0]], color: '#00ff00' },
    Z: { shape: [[1,1,0],[0,1,1]], color: '#ff0000' },
    J: { shape: [[1,0,0],[1,1,1]], color: '#0066ff' },
    L: { shape: [[0,0,1],[1,1,1]], color: '#ff6600' }
  };

  const [board, setBoard] = useState(EMPTY_BOARD);
  const [currentPiece, setCurrentPiece] = useState(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [lines, setLines] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  const getRandomPiece = () => {
    const pieces = Object.keys(TETROMINOS);
    const randomPiece = pieces[Math.floor(Math.random() * pieces.length)];
    return {
      shape: TETROMINOS[randomPiece].shape,
      color: TETROMINOS[randomPiece].color
    };
  };

  const rotatePiece = (piece) => {
    const rotated = piece[0].map((_, index) =>
      piece.map(row => row[index]).reverse()
    );
    return rotated;
  };

  const isValidMove = (piece, pos, boardState = board) => {
    for (let y = 0; y < piece.length; y++) {
      for (let x = 0; x < piece[y].length; x++) {
        if (piece[y][x]) {
          const newX = pos.x + x;
          const newY = pos.y + y;
          
          if (newX < 0 || newX >= BOARD_WIDTH || newY >= BOARD_HEIGHT) {
            return false;
          }
          
          if (newY >= 0 && boardState[newY][newX]) {
            return false;
          }
        }
      }
    }
    return true;
  };

  const placePiece = () => {
    const newBoard = board.map(row => [...row]);
    
    for (let y = 0; y < currentPiece.shape.length; y++) {
      for (let x = 0; x < currentPiece.shape[y].length; x++) {
        if (currentPiece.shape[y][x]) {
          const boardY = position.y + y;
          const boardX = position.x + x;
          if (boardY >= 0) {
            newBoard[boardY][boardX] = currentPiece.color;
          }
        }
      }
    }
    
    setBoard(newBoard);
    clearLines(newBoard);
    spawnNewPiece();
  };

  const clearLines = (boardState) => {
    const newBoard = [];
    let linesCleared = 0;
    
    for (let y = BOARD_HEIGHT - 1; y >= 0; y--) {
      if (boardState[y].every(cell => cell !== 0)) {
        linesCleared++;
      } else {
        newBoard.unshift(boardState[y]);
      }
    }
    
    while (newBoard.length < BOARD_HEIGHT) {
      newBoard.unshift(Array(BOARD_WIDTH).fill(0));
    }
    
    if (linesCleared > 0) {
      setBoard(newBoard);
      setLines(prev => prev + linesCleared);
      setScore(prev => prev + linesCleared * 100 * level);
      setLevel(prev => Math.floor((lines + linesCleared) / 10) + 1);
    }
  };

  const spawnNewPiece = () => {
    const newPiece = getRandomPiece();
    const startPos = { x: Math.floor(BOARD_WIDTH / 2) - 1, y: 0 };
    
    if (!isValidMove(newPiece.shape, startPos)) {
      setGameOver(true);
      setIsPlaying(false);
      return;
    }
    
    setCurrentPiece(newPiece);
    setPosition(startPos);
  };

  const movePiece = (dir) => {
    const newPos = { ...position, x: position.x + dir };
    if (isValidMove(currentPiece.shape, newPos)) {
      setPosition(newPos);
    }
  };

  const dropPiece = () => {
    const newPos = { ...position, y: position.y + 1 };
    if (isValidMove(currentPiece.shape, newPos)) {
      setPosition(newPos);
    } else {
      placePiece();
    }
  };

  const rotatePieceAction = () => {
    const rotated = rotatePiece(currentPiece.shape);
    if (isValidMove(rotated, position)) {
      setCurrentPiece({ ...currentPiece, shape: rotated });
    }
  };

  const hardDrop = () => {
    let newPos = { ...position };
    while (isValidMove(currentPiece.shape, { ...newPos, y: newPos.y + 1 })) {
      newPos.y += 1;
    }
    setPosition(newPos);
    placePiece();
  };

  const handleKeyPress = useCallback((event) => {
    if (!isPlaying || gameOver) return;

    switch (event.key) {
      case 'ArrowLeft':
      case 'a':
        event.preventDefault();
        movePiece(-1);
        break;
      case 'ArrowRight':
      case 'd':
        event.preventDefault();
        movePiece(1);
        break;
      case 'ArrowDown':
      case 's':
        event.preventDefault();
        dropPiece();
        break;
      case 'ArrowUp':
      case 'w':
        event.preventDefault();
        rotatePieceAction();
        break;
      case ' ':
        event.preventDefault();
        hardDrop();
        break;
    }
  }, [isPlaying, gameOver, currentPiece, position]);

  const startGame = () => {
    setBoard(EMPTY_BOARD);
    setScore(0);
    setLevel(1);
    setLines(0);
    setGameOver(false);
    setIsPlaying(true);
    spawnNewPiece();
  };

  const pauseGame = () => {
    setIsPlaying(!isPlaying);
  };

  const resetGame = () => {
    setBoard(EMPTY_BOARD);
    setCurrentPiece(null);
    setPosition({ x: 0, y: 0 });
    setScore(0);
    setLevel(1);
    setLines(0);
    setGameOver(false);
    setIsPlaying(false);
  };

  // Game loop
  useEffect(() => {
    if (!isPlaying || gameOver) return;

    const gameInterval = setInterval(() => {
      dropPiece();
    }, Math.max(100, 1000 - (level - 1) * 100));
    
    return () => clearInterval(gameInterval);
  }, [isPlaying, gameOver, level, position, currentPiece]);

  // Handle keyboard input
  useEffect(() => {
    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [handleKeyPress]);

  const renderBoard = () => {
    const displayBoard = board.map(row => [...row]);
    
    // Add current piece to display
    if (currentPiece && position) {
      for (let y = 0; y < currentPiece.shape.length; y++) {
        for (let x = 0; x < currentPiece.shape[y].length; x++) {
          if (currentPiece.shape[y][x]) {
            const boardY = position.y + y;
            const boardX = position.x + x;
            if (boardY >= 0 && boardY < BOARD_HEIGHT && boardX >= 0 && boardX < BOARD_WIDTH) {
              displayBoard[boardY][boardX] = currentPiece.color;
            }
          }
        }
      }
    }
    
    return displayBoard;
  };

  return (
    <motion.div 
      className="tetris-game"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="tetris-container">
        <div className="tetris-sidebar">
          <div className="tetris-info">
            <h2>TETRIS</h2>
            <div className="score">Score: {score}</div>
            <div className="level">Level: {level}</div>
            <div className="lines">Lines: {lines}</div>
          </div>
          
          <div className="tetris-controls">
            {!isPlaying && !gameOver && (
              <button onClick={startGame} className="game-button start">
                Start Game
              </button>
            )}
            
            {isPlaying && (
              <button onClick={pauseGame} className="game-button pause">
                Pause
              </button>
            )}
            
            <button onClick={resetGame} className="game-button reset">
              Reset
            </button>
          </div>
          
          {gameOver && (
            <div className="game-over">
              <h3>Game Over!</h3>
              <button onClick={startGame} className="game-button restart">
                Play Again
              </button>
            </div>
          )}
          
          <div className="tetris-instructions">
            <h4>Controls:</h4>
            <p>← → Move</p>
            <p>↓ Soft Drop</p>
            <p>↑ Rotate</p>
            <p>Space: Hard Drop</p>
          </div>
        </div>
        
        <div className="tetris-board">
          {renderBoard().map((row, rowIndex) => (
            <div key={rowIndex} className="tetris-row">
              {row.map((cell, colIndex) => (
                <div
                  key={`${rowIndex}-${colIndex}`}
                  className={`tetris-cell ${cell ? 'filled' : ''}`}
                  style={{ backgroundColor: cell || '#1a1a1a' }}
                />
              ))}
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default TetrisGame;