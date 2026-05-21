import React, { useState, useEffect } from 'react';
import './RockPaperScissorsGame.css';

const RockPaperScissorsGame = () => {
  // Game state
  const [playerChoice, setPlayerChoice] = useState(null);
  const [computerChoice, setComputerChoice] = useState(null);
  const [result, setResult] = useState(null);
  const [scores, setScores] = useState({ player: 0, computer: 0, ties: 0 });
  const [gameMode, setGameMode] = useState('single'); // 'single', 'best-of-3', 'best-of-5'
  const [roundsToWin, setRoundsToWin] = useState(1);
  const [currentRound, setCurrentRound] = useState(1);
  const [seriesWinner, setSeriesWinner] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [history, setHistory] = useState([]);

  // Game choices
  const CHOICES = {
    rock: { emoji: '🪨', name: 'Rock', beats: 'scissors' },
    paper: { emoji: '📄', name: 'Paper', beats: 'rock' },
    scissors: { emoji: '✂️', name: 'Scissors', beats: 'paper' }
  };

  // Load scores from localStorage
  useEffect(() => {
    const savedScores = localStorage.getItem('rpsScores');
    if (savedScores) {
      setScores(JSON.parse(savedScores));
    }
  }, []);

  // Save scores to localStorage
  const saveScores = (newScores) => {
    setScores(newScores);
    localStorage.setItem('rpsScores', JSON.stringify(newScores));
  };

  // Set rounds to win based on game mode
  useEffect(() => {
    switch (gameMode) {
      case 'single':
        setRoundsToWin(1);
        break;
      case 'best-of-3':
        setRoundsToWin(2);
        break;
      case 'best-of-5':
        setRoundsToWin(3);
        break;
      default:
        setRoundsToWin(1);
    }
    resetSeries();
  }, [gameMode]);

  // Get computer choice
  const getComputerChoice = () => {
    const choices = Object.keys(CHOICES);
    return choices[Math.floor(Math.random() * choices.length)];
  };

  // Determine winner
  const determineWinner = (playerChoice, computerChoice) => {
    if (playerChoice === computerChoice) {
      return 'tie';
    }
    return CHOICES[playerChoice].beats === computerChoice ? 'player' : 'computer';
  };

  // Handle player choice
  const handlePlayerChoice = (choice) => {
    if (isPlaying || seriesWinner) return;

    setIsPlaying(true);
    setPlayerChoice(choice);
    setShowResult(false);

    // Simulate computer thinking with animation
    let computerChoiceAnimation = setInterval(() => {
      const choices = Object.keys(CHOICES);
      setComputerChoice(choices[Math.floor(Math.random() * choices.length)]);
    }, 100);

    setTimeout(() => {
      clearInterval(computerChoiceAnimation);
      const finalComputerChoice = getComputerChoice();
      setComputerChoice(finalComputerChoice);
      
      const roundResult = determineWinner(choice, finalComputerChoice);
      setResult(roundResult);
      setShowResult(true);

      // Update scores
      const newScores = { ...scores };
      if (roundResult === 'player') {
        newScores.player += 1;
      } else if (roundResult === 'computer') {
        newScores.computer += 1;
      } else {
        newScores.ties += 1;
      }
      saveScores(newScores);

      // Add to history
      setHistory(prev => [...prev, {
        round: currentRound,
        playerChoice: choice,
        computerChoice: finalComputerChoice,
        result: roundResult
      }]);

      // Check for series winner
      if (newScores.player >= roundsToWin) {
        setSeriesWinner('player');
      } else if (newScores.computer >= roundsToWin) {
        setSeriesWinner('computer');
      } else if (gameMode !== 'single') {
        setCurrentRound(prev => prev + 1);
      }

      setIsPlaying(false);
    }, 2000);
  };

  // Reset current series
  const resetSeries = () => {
    setPlayerChoice(null);
    setComputerChoice(null);
    setResult(null);
    setCurrentRound(1);
    setSeriesWinner(null);
    setIsPlaying(false);
    setShowResult(false);
    setHistory([]);
    setScores({ player: 0, computer: 0, ties: 0 });
  };

  // Reset all scores
  const resetAllScores = () => {
    const emptyScores = { player: 0, computer: 0, ties: 0 };
    saveScores(emptyScores);
    localStorage.removeItem('rpsScores');
    resetSeries();
  };

  // Play again
  const playAgain = () => {
    setPlayerChoice(null);
    setComputerChoice(null);
    setResult(null);
    setShowResult(false);
  };

  // Get result message
  const getResultMessage = () => {
    if (!result) return '';
    
    switch (result) {
      case 'player':
        return '🎉 You Win!';
      case 'computer':
        return '🤖 Computer Wins!';
      case 'tie':
        return '🤝 It\'s a Tie!';
      default:
        return '';
    }
  };

  // Get result description
  const getResultDescription = () => {
    if (!playerChoice || !computerChoice || !result) return '';
    
    if (result === 'tie') {
      return `Both chose ${CHOICES[playerChoice].name}`;
    }
    
    const winner = result === 'player' ? playerChoice : computerChoice;
    const loser = result === 'player' ? computerChoice : playerChoice;
    
    return `${CHOICES[winner].name} beats ${CHOICES[loser].name}`;
  };

  // Get series status
  const getSeriesStatus = () => {
    if (gameMode === 'single') return '';
    
    if (seriesWinner) {
      return seriesWinner === 'player' ? 
        '🏆 You Won the Series!' : 
        '🏆 Computer Won the Series!';
    }
    
    return `Round ${currentRound} - First to ${roundsToWin} wins`;
  };

  return (
    <div className="rps-game">
      <div className="game-header">
        <h2>Rock Paper Scissors</h2>
        <div className="game-mode-selector">
          <label>Game Mode:</label>
          <select 
            value={gameMode} 
            onChange={(e) => setGameMode(e.target.value)}
            disabled={isPlaying || (currentRound > 1 && !seriesWinner)}
          >
            <option value="single">Single Round</option>
            <option value="best-of-3">Best of 3</option>
            <option value="best-of-5">Best of 5</option>
          </select>
        </div>
        <div className="series-status">
          {getSeriesStatus()}
        </div>
      </div>

      <div className="game-arena">
        <div className="player-section">
          <h3>You</h3>
          <div className={`choice-display ${isPlaying ? 'thinking' : ''}`}>
            {playerChoice ? (
              <div className="choice-item">
                <div className="choice-emoji">{CHOICES[playerChoice].emoji}</div>
                <div className="choice-name">{CHOICES[playerChoice].name}</div>
              </div>
            ) : (
              <div className="choice-placeholder">❓</div>
            )}
          </div>
        </div>

        <div className="vs-section">
          <div className="vs-text">VS</div>
          {showResult && (
            <div className={`result-display ${result}`}>
              <div className="result-message">{getResultMessage()}</div>
              <div className="result-description">{getResultDescription()}</div>
            </div>
          )}
        </div>

        <div className="computer-section">
          <h3>Computer</h3>
          <div className={`choice-display ${isPlaying ? 'thinking' : ''}`}>
            {computerChoice && !isPlaying ? (
              <div className="choice-item">
                <div className="choice-emoji">{CHOICES[computerChoice].emoji}</div>
                <div className="choice-name">{CHOICES[computerChoice].name}</div>
              </div>
            ) : (
              <div className="choice-placeholder">
                {isPlaying ? '🤔' : '❓'}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="player-choices">
        <h4>Make Your Choice:</h4>
        <div className="choices-grid">
          {Object.entries(CHOICES).map(([key, choice]) => (
            <button
              key={key}
              className={`choice-btn ${playerChoice === key ? 'selected' : ''}`}
              onClick={() => handlePlayerChoice(key)}
              disabled={isPlaying || seriesWinner}
            >
              <div className="choice-emoji">{choice.emoji}</div>
              <div className="choice-name">{choice.name}</div>
            </button>
          ))}
        </div>
      </div>

      <div className="game-stats">
        <div className="score-board">
          <h4>Score Board</h4>
          <div className="scores">
            <div className="score-item player">
              <span className="score-label">You</span>
              <span className="score-value">{scores.player}</span>
            </div>
            <div className="score-item ties">
              <span className="score-label">Ties</span>
              <span className="score-value">{scores.ties}</span>
            </div>
            <div className="score-item computer">
              <span className="score-label">Computer</span>
              <span className="score-value">{scores.computer}</span>
            </div>
          </div>
        </div>
      </div>

      {seriesWinner && (
        <div className="series-complete">
          <h3>{seriesWinner === 'player' ? '🎉 Congratulations!' : '😔 Better Luck Next Time!'}</h3>
          <p>{seriesWinner === 'player' ? 'You' : 'Computer'} won the series!</p>
        </div>
      )}

      <div className="game-controls">
        {showResult && !seriesWinner && gameMode === 'single' && (
          <button className="btn btn-primary" onClick={playAgain}>
            Play Again
          </button>
        )}
        
        {(seriesWinner || (gameMode === 'single' && showResult)) && (
          <button className="btn btn-primary" onClick={resetSeries}>
            New {gameMode === 'single' ? 'Game' : 'Series'}
          </button>
        )}
        
        <button className="btn btn-secondary" onClick={resetAllScores}>
          Reset All Scores
        </button>
      </div>

      {history.length > 0 && (
        <div className="game-history">
          <h4>Game History</h4>
          <div className="history-list">
            {history.slice(-5).reverse().map((round, index) => (
              <div key={index} className={`history-item ${round.result}`}>
                <span className="round-number">R{round.round}</span>
                <span className="round-choices">
                  {CHOICES[round.playerChoice].emoji} vs {CHOICES[round.computerChoice].emoji}
                </span>
                <span className="round-result">
                  {round.result === 'player' ? 'Win' : 
                   round.result === 'computer' ? 'Loss' : 'Tie'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="game-instructions">
        <h4>How to Play</h4>
        <p>• Rock beats Scissors</p>
        <p>• Scissors beats Paper</p>
        <p>• Paper beats Rock</p>
        <p>• Choose your weapon and compete against the computer!</p>
        <p>• Select different game modes for varying challenges</p>
      </div>
    </div>
  );
};

export default RockPaperScissorsGame;