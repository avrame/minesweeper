import { FIELD_WIDTH, FIELD_HEIGHT, BOMB_FREQ } from '../constants';

export function initializeField(setDifficulty) {
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

export function calculateBombCounts(field, setDifficulty) {
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

export function revealNeighbors(newField, row, col) {
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

export function updateField (field, row, col, cb) {
  return field.map((rowArr, rowIdx) => {
    return rowArr.map((section, colIdx) => {
      let newSection = {...section};
      if (row === rowIdx && col === colIdx) {
        newSection = cb(newSection);
      }
      return newSection;
    });
  });
}

export function hasWonGame(field, setDifficulty) {
  for (let row = 0; row < FIELD_HEIGHT[setDifficulty]; row++) {
    for (let col = 0; col < FIELD_WIDTH[setDifficulty]; col++) {
      if (field[row][col].content !== -1 && field[row][col].status === 'h') {
        return false;
      }
    }
  }
  return true;
}