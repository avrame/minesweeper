import React, { useState } from 'react';
import Section from './components/section';
import './App.css';

function App() {
  const [field, setField] = useState([
    [{ status: 'h', content:  1 }, { status: 'h', content:  1 }, { status: 'h', content:  1 }, { status: 'h', content:  0 }, { status: 'h', content:  0 }],
    [{ status: 'h', content:  1 }, { status: 'h', content: -1 }, { status: 'h', content:  2 }, { status: 'h', content:  1 }, { status: 'h', content:  0 }],
    [{ status: 'h', content:  1 }, { status: 'h', content:  2 }, { status: 'h', content: -1 }, { status: 'h', content:  1 }, { status: 'h', content:  0 }],
    [{ status: 'h', content:  0 }, { status: 'h', content:  1 }, { status: 'h', content:  1 }, { status: 'h', content:  1 }, { status: 'h', content:  0 }],
    [{ status: 'h', content:  0 }, { status: 'h', content:  0 }, { status: 'h', content:  0 }, { status: 'h', content:  0 }, { status: 'h', content:  0 }],
  ]);

  const fieldStyle = {
    width: `${field[0].length * 34}px`,
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
  }

  return (
    <div className="App">
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
