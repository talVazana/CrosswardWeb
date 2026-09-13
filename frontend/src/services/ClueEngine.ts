import { MatrixValue, ClueMetadata } from '../domain/puzzle';

export interface CalculatedClue {
  clueNumber: number;
  row: number;
  col: number;
  direction: 'horizontal' | 'vertical';
  length: number;
  cells: { r: number; c: number }[];
}

export function calculateClues(matrix: MatrixValue[][]): CalculatedClue[] {
  const rows = matrix.length;
  if (rows === 0) return [];
  const cols = matrix[0].length;

  const calculatedClues: CalculatedClue[] = [];
  let currentClueNumber = 1;

  for (let r = 0; r < rows; r++) {
    // Traverse right-to-left visually, meaning col from (cols - 1) down to 0
    for (let c = cols - 1; c >= 0; c--) {
      if (matrix[r][c] === 2) {
        // It's a clue start cell
        // Check if it starts a horizontal and/or vertical clue
        
        // A cell can start a horizontal clue if it's the right-most cell of a word.
        // In Hebrew RTL, right-most means the start of the word. So it moves left (decreasing c).
        // It's a valid horizontal clue start if the cell to its right (c+1) is a block (0) or boundary,
        // AND the cell to its left (c-1) is a valid letter cell (1 or 2).
        const isHorizStart = (c === cols - 1 || matrix[r][c + 1] === 0) && (c - 1 >= 0 && matrix[r][c - 1] !== 0);
        
        // Vertical goes top-down. 
        // It's a valid vertical clue start if the cell above (r-1) is a block (0) or boundary,
        // AND the cell below (r+1) is a valid letter cell (1 or 2).
        const isVertStart = (r === 0 || matrix[r - 1][c] === 0) && (r + 1 < rows && matrix[r + 1][c] !== 0);

        // If for some reason it's marked as 2 but doesn't fit the strict start criteria,
        // but let's assume the matrix provided has correct 2s, we can just trace it anyway if it can move.
        // Let's actually trace it and check length > 1.
        
        const horizCells = [];
        let curC = c;
        while (curC >= 0 && matrix[r][curC] !== 0) {
          horizCells.push({ r, c: curC });
          curC--;
        }

        const vertCells = [];
        let curR = r;
        while (curR < rows && matrix[curR][c] !== 0) {
          vertCells.push({ r: curR, c });
          curR++;
        }

        const addHoriz = horizCells.length > 1 && (c === cols - 1 || matrix[r][c + 1] === 0);
        const addVert = vertCells.length > 1 && (r === 0 || matrix[r - 1][c] === 0);

        if (addHoriz || addVert) {
          if (addHoriz) {
            calculatedClues.push({
              clueNumber: currentClueNumber,
              row: r,
              col: c,
              direction: 'horizontal',
              length: horizCells.length,
              cells: horizCells
            });
          }
          if (addVert) {
            calculatedClues.push({
              clueNumber: currentClueNumber,
              row: r,
              col: c,
              direction: 'vertical',
              length: vertCells.length,
              cells: vertCells
            });
          }
          currentClueNumber++;
        }
      }
    }
  }

  return calculatedClues;
}
