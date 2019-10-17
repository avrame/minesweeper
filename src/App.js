import React, { useState, useEffect, useRef } from 'react';
import Section from './components/section';
import { DIFFICULTY } from './constants';
import './App.css';

const FIELD_WIDTH = {
  [DIFFICULTY.EASY]: 5,
  [DIFFICULTY.MED]: 10,
  [DIFFICULTY.HARD]: 25
};
const FIELD_HEIGHT = {
  [DIFFICULTY.EASY]: 5,
  [DIFFICULTY.MED]: 10,
  [DIFFICULTY.HARD]: 15
};
const BOMB_FREQ = .15;

let setDifficulty = DIFFICULTY.MED;
let timerID;

function App() {
  const [tempDifficulty, setTempDifficulty] = useState(DIFFICULTY.MED);
  const [field, setField] = useState([]);
  const [gameWon, setGameWon] = useState(false);
  const [gameLost, setGameLost] = useState(false);
  const [seconds, setSeconds] = useState(0);

  const fieldStyle = {
    width: `${FIELD_WIDTH[setDifficulty] * 34}px`,
  }

  const savedCallback = useRef();

  useEffect(() => {
    startNewGame();
    return () => clearInterval(timerID);
  }, []);

  useEffect(() => {
    savedCallback.current = callback;
  });

  function callback() {
    setSeconds(seconds + 1);
  }

  function startNewGame() {
    setDifficulty = tempDifficulty;

    // Clear out the won/lost states
    setGameWon(false);
    setGameLost(false);
    setSeconds(0);

    // Initialize the mine field
    let initialField = initializeField();
    initialField = calculateBombCounts(initialField);

    clearInterval(timerID);
    timerID = setInterval(() => { savedCallback.current() }, 1000);
    
    setField(initialField);
  }

  function changeDifficulty(e) {
    setTempDifficulty(e.target.value);
  }

  function initializeField() {
    let initialField = [];

    // Set the intial field state with bombs
    for (let rowIdx = 0; rowIdx < FIELD_HEIGHT[setDifficulty]; rowIdx++) {
      let row = [];
      for (let colIdx = 0; colIdx < FIELD_WIDTH[setDifficulty]; colIdx++) {
        const content = (Math.random() <= BOMB_FREQ) ? -1 : 0;
        row.push({ status: 'h', content });
      }
      initialField.push(row);
    }

    return initialField;
  }

  function calculateBombCounts(field) {
    for (let rowIdx = 0; rowIdx < FIELD_HEIGHT[setDifficulty]; rowIdx++) {
      for (let colIdx = 0; colIdx < FIELD_WIDTH[setDifficulty]; colIdx++) {
        if (field[rowIdx][colIdx].content === 0) {
          for (let r = rowIdx - 1; r <= rowIdx + 1; r++) {
            for (let c = colIdx - 1; c <= colIdx + 1; c++) {
              if (field[r] && field[r][c] && (r !== rowIdx || c !== colIdx)) {
                if (field[r][c].content === -1) {
                  field[rowIdx][colIdx].content++;
                }
              }
            }
          }
        }
      }
    }
    return field;
  }

  function updateField (row, col, cb) {
    const newField = field.map((rowArr, rowIdx) => {
      return rowArr.map((section, colIdx) => {
        let newSection = {...section};
        if (row === rowIdx && col === colIdx) {
          newSection = cb(newSection);
        }
        return newSection;
      });
    });
    return newField;
  }

  function handleFlag (row, col) {
    const newField = updateField(row, col, section => {
      if (section.status === 'f') {
        section.status = 'h';
      } else {
        section.status = 'f';
      }
      return section;
    });
    setField(newField);
  }

  function revealSection (row, col, andNeighbors) {
    if (field[row][col].content === -1) {
      endGame();
      return;
    }
    const newField = updateField(row, col, section => {
      section.status = 'r';
      return section;
    });
    if (andNeighbors) {
      revealNeighbors(newField, row, col);
    }
    setField(newField);
    if (hasWonGame(newField)) {
      clearInterval(timerID);
      setGameWon(true);
    }
  }

  function hasWonGame(field) {
    for (let row = 0; row < FIELD_HEIGHT[setDifficulty]; row++) {
      for (let col = 0; col < FIELD_WIDTH[setDifficulty]; col++) {
        if (field[row][col].content !== -1 && field[row][col].status === 'h') {
          return false;
        }
      }
    }
    return true;
  }

  function revealNeighbors(newField, row, col) {
    for (let r = row - 1; r <= row + 1; r++) {
      for (let c = col - 1; c <= col + 1; c++) {
        if (newField[r] && newField[r][c] && (r !== row || c !== col)) {
          if (newField[r][c].content !== -1 && newField[r][c].status === 'h') {
            newField[r][c].status = 'r';
            if (newField[r][c].content === 0) {                
              revealNeighbors(newField, r, c);
            }
          }
        }
      }
    }
  }

  function handleRevealSections (row, col) {
    // If the game has been won or lost, don't reveal the section
    if (gameWon || gameLost) return;

    if (field[row][col].content === -1) {
      // We revealed a bomb!
      endGame(row, col);
    } else if (field[row][col].content === 0) {
      // section is empty with no neighboring bombs, reveal neighboring sections
      revealSection(row, col, true);
    } else {
      // section is empty with neighboring bombs, just reveal itself
      revealSection(row, col);
    }
  }

  function endGame(row, col) {
    clearInterval(timerID);
    const newField = field.map((rowArr, rowIdx) => {
      return rowArr.map((section, colIdx) => {
        let newSection = { ...section };
        if (row === rowIdx && col === colIdx) {
          newSection.status = 'e';
        } else {
          newSection.status = 'r';
        }
        return newSection;
      });
    });
    setField(newField);
    setGameLost(true);
  }

  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;

  let minutesStr;
  let secondsStr;

  if (minutes < 10) {
    minutesStr = `0${minutes}`;
  } else {
    minutesStr = minutes;
  }
  if (secs < 10) {
    secondsStr = `0${secs}`
  } else {
    secondsStr = secs;
  }

  return (
    <div className="App">
      <h1>Minesweeper</h1>

      <p>
        <button onClick={startNewGame}>Start a New Game</button>
        &nbsp;with&nbsp;
        <select onChange={changeDifficulty} value={tempDifficulty}>
          <option value={DIFFICULTY.EASY}>Easy</option>
          <option value={DIFFICULTY.MED}>Medium</option>
          <option value={DIFFICULTY.HARD}>Hard</option>
        </select>
        &nbsp;difficulty.
      </p>

      <div>
        Time: <span>{minutesStr}:{secondsStr}</span>
      </div>

      { gameWon ? <h2 className="game-won">You Won! <span role="img" aria-label="happy face">😄</span></h2> : null }

      { gameLost ? <h2 className="game-lost">You Lost <span role="img" aria-label="sad face">😢</span></h2> : null }

      <div className="field" style={fieldStyle}>
        {
          field.map((row, rowIdx) => {
            return row.map((data, colIdx) => {
              return (
                <Section data={data}
                         key={`r${rowIdx}c${colIdx}`}
                         row={rowIdx}
                         col={colIdx}
                         onFlag={handleFlag}
                         onRevealSections={handleRevealSections} />
              )
            });
          })
        }
      </div>
    </div>
  );
}

export default App;
