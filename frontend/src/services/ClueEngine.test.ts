import { describe, it, expect } from 'vitest';
import { calculateClues } from './ClueEngine';
import fixtureData from '../fixtures/a_output.json';
import { MatrixValue } from '../domain/puzzle';

describe('ClueEngine', () => {
  it('should calculate clues correctly from the fixture matrix', () => {
    const clues = calculateClues(fixtureData.matrix as MatrixValue[][]);
    
    // According to a_output.json, there are 21 clues (where some numbers have both horiz and vert, but they share the same clue number).
    // Let's check how many total calculated directions we got.
    
    // In a_output.json:
    // Clue 1: horiz & vert
    // Clue 2: vert
    // Clue 3: vert
    // Clue 4: horiz & vert
    // Clue 5: vert
    // Clue 6: vert
    // Clue 7: horiz
    // Clue 8: horiz
    // Clue 9: horiz
    // Clue 10: vert
    // Clue 11: horiz
    // Clue 12: vert
    // Clue 13: vert
    // Clue 14: horiz
    // Clue 15: horiz
    // Clue 16: vert
    // Clue 17: vert
    // Clue 18: horiz
    // Clue 19: horiz & vert
    // Clue 20: horiz
    // Clue 21: horiz

    // That is a total of 1 + 1 (1) + 1 (2) + 1 (3) ... wait
    // Let's count them:
    // 1: H, V (2)
    // 2: V (1)
    // 3: V (1)
    // 4: H, V (2)
    // 5: V (1)
    // 6: V (1)
    // 7: H (1)
    // 8: H (1)
    // 9: H (1)
    // 10: V (1)
    // 11: H (1)
    // 12: V (1)
    // 13: V (1)
    // 14: H (1)
    // 15: H (1)
    // 16: V (1)
    // 17: V (1)
    // 18: H (1)
    // 19: H, V (2)
    // 20: H (1)
    // 21: H (1)
    // Total = 2 + 1 + 1 + 2 + 1 + 1 + 1 + 1 + 1 + 1 + 1 + 1 + 1 + 1 + 1 + 1 + 1 + 1 + 2 + 1 + 1 = 24 items in our calculatedClues array.
    
    expect(clues.length).toBe(24);
    
    // Check clue 1
    const clue1 = clues.filter(c => c.clueNumber === 1);
    expect(clue1.length).toBe(2);
    expect(clue1.find(c => c.direction === 'horizontal')?.length).toBe(5); // In matrix, from col 10 to col 6 (inclusive is 5, but wait: 10,9,8,7,6? Let's verify: matrix[0][10..6] are 2,1,2,1,2)
    
    // Check that clue 21 exists
    const clue21 = clues.filter(c => c.clueNumber === 21);
    expect(clue21.length).toBe(1);
    expect(clue21[0].direction).toBe('horizontal');
  });

  it('should correctly traverse right-to-left for horizontal cells', () => {
    const clues = calculateClues(fixtureData.matrix as MatrixValue[][]);
    const horizClue1 = clues.find(c => c.clueNumber === 1 && c.direction === 'horizontal');
    expect(horizClue1).toBeDefined();
    
    // Cells should go from right to left
    // col 10 -> col 9 -> col 8 ...
    expect(horizClue1?.cells[0].c).toBe(10);
    expect(horizClue1?.cells[1].c).toBe(9);
    
    // Verify it doesn't traverse through 0
    expect(horizClue1?.cells.some(cell => fixtureData.matrix[cell.r][cell.c] === 0)).toBe(false);
  });
});
