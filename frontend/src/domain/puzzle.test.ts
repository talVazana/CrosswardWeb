import { describe, it, expect } from 'vitest';
import { validatePuzzle } from './puzzle';
import fixtureData from '../fixtures/a_output.json';

describe('validatePuzzle', () => {
  it('should accept valid fixture data', () => {
    const result = validatePuzzle(fixtureData);
    expect(result).toBeDefined();
    expect(result.rows).toBe(11);
    expect(result.cols).toBe(11);
  });

  it('should reject invalid dimensions', () => {
    expect(() => validatePuzzle({ ...fixtureData, rows: 0 })).toThrow(/must be a positive number/);
    expect(() => validatePuzzle({ ...fixtureData, rows: 12 })).toThrow(/dimensions mismatch rows/);
  });

  it('should reject invalid matrix values', () => {
    const invalidData = JSON.parse(JSON.stringify(fixtureData));
    invalidData.matrix[0][0] = 3;
    expect(() => validatePuzzle(invalidData)).toThrow(/must be 0, 1, or 2/);
  });

  it('should reject clues with coordinates out of bounds', () => {
    const invalidData = JSON.parse(JSON.stringify(fixtureData));
    invalidData.clues[0].row = 11;
    expect(() => validatePuzzle(invalidData)).toThrow(/coordinates out of bounds/);
  });

  it('should reject clues that do not start on a 2 cell', () => {
    const invalidData = JSON.parse(JSON.stringify(fixtureData));
    invalidData.matrix[invalidData.clues[0].row][invalidData.clues[0].col] = 1; // not 2
    expect(() => validatePuzzle(invalidData)).toThrow(/start cell must be 2/);
  });

  it('should reject duplicate clue numbers', () => {
    const invalidData = JSON.parse(JSON.stringify(fixtureData));
    invalidData.clues[1].clue_number = invalidData.clues[0].clue_number;
    expect(() => validatePuzzle(invalidData)).toThrow(/duplicate clue_number/);
  });
});
