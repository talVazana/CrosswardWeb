export type MatrixValue = 0 | 1 | 2;

export interface ClueMetadata {
  clue_number: number;
  row: number;
  col: number;
  horizontal: boolean;
  vertical: boolean;
}

export interface PuzzleSchema {
  rows: number;
  cols: number;
  matrix: MatrixValue[][];
  clues: ClueMetadata[];
  originalImageRef?: string;
}

export function validatePuzzle(data: any): PuzzleSchema {
  if (!data || typeof data !== 'object') {
    throw new Error('Puzzle must be an object');
  }

  const { rows, cols, matrix, clues, originalImageRef } = data;

  if (typeof rows !== 'number' || rows <= 0) {
    throw new Error('Invalid rows: must be a positive number');
  }
  if (typeof cols !== 'number' || cols <= 0) {
    throw new Error('Invalid cols: must be a positive number');
  }

  if (!Array.isArray(matrix) || matrix.length !== rows) {
    throw new Error('Invalid matrix: dimensions mismatch rows');
  }

  for (let r = 0; r < rows; r++) {
    const rowArray = matrix[r];
    if (!Array.isArray(rowArray) || rowArray.length !== cols) {
      throw new Error(`Invalid matrix: row ${r} dimensions mismatch cols`);
    }
    for (let c = 0; c < cols; c++) {
      const val = rowArray[c];
      if (val !== 0 && val !== 1 && val !== 2) {
        throw new Error(`Invalid matrix value at (${r}, ${c}): must be 0, 1, or 2`);
      }
    }
  }

  if (!Array.isArray(clues)) {
    throw new Error('Invalid clues: must be an array');
  }

  const clueNumbers = new Set<number>();
  for (const clue of clues) {
    if (typeof clue.clue_number !== 'number') {
      throw new Error('Invalid clue: missing clue_number');
    }
    if (clueNumbers.has(clue.clue_number)) {
      throw new Error(`Invalid clue: duplicate clue_number ${clue.clue_number}`);
    }
    clueNumbers.add(clue.clue_number);

    if (
      typeof clue.row !== 'number' || clue.row < 0 || clue.row >= rows ||
      typeof clue.col !== 'number' || clue.col < 0 || clue.col >= cols
    ) {
      throw new Error(`Invalid clue ${clue.clue_number}: coordinates out of bounds`);
    }

    if (matrix[clue.row][clue.col] !== 2) {
      throw new Error(`Invalid clue ${clue.clue_number}: start cell must be 2`);
    }

    if (typeof clue.horizontal !== 'boolean' || typeof clue.vertical !== 'boolean') {
      throw new Error(`Invalid clue ${clue.clue_number}: missing direction`);
    }
    
    if (!clue.horizontal && !clue.vertical) {
      throw new Error(`Invalid clue ${clue.clue_number}: must have at least one direction`);
    }
  }

  return {
    rows,
    cols,
    matrix,
    clues,
    originalImageRef: typeof originalImageRef === 'string' ? originalImageRef : undefined,
  };
}
