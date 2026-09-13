import { describe, it, expect, vi } from 'vitest';
import { MockPuzzleProcessor, RenderPuzzleProcessor } from './PuzzleProcessor';
import fixtureData from '../fixtures/a_output.json';

describe('MockPuzzleProcessor', () => {
  it('should resolve with valid puzzle data', async () => {
    const processor = new MockPuzzleProcessor(fixtureData, 10);
    const blob = new Blob(['dummy'], { type: 'image/jpeg' });
    const puzzle = await processor.processImage(blob);
    expect(puzzle.rows).toBe(11);
  });

  it('should reject with invalid puzzle data', async () => {
    const processor = new MockPuzzleProcessor({ rows: -1 }, 10);
    const blob = new Blob(['dummy'], { type: 'image/jpeg' });
    await expect(processor.processImage(blob)).rejects.toThrow();
  });
});

describe('RenderPuzzleProcessor', () => {
  it('should successfully process image and parse response', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(fixtureData),
    });
    global.fetch = mockFetch;

    const processor = new RenderPuzzleProcessor('http://example.com/api', 1000);
    const blob = new Blob(['dummy'], { type: 'image/jpeg' });
    const puzzle = await processor.processImage(blob);

    expect(puzzle.rows).toBe(11);
    expect(mockFetch).toHaveBeenCalled();
  });

  it('should handle timeout', async () => {
    // Create a fetch that doesn't resolve in time
    const mockFetch = vi.fn().mockImplementation(() => {
      return new Promise((_, reject) => {
        setTimeout(() => {
          const err = new Error('AbortError');
          err.name = 'AbortError';
          reject(err);
        }, 50);
      });
    });
    global.fetch = mockFetch;

    const processor = new RenderPuzzleProcessor('http://example.com/api', 10);
    const blob = new Blob(['dummy'], { type: 'image/jpeg' });
    await expect(processor.processImage(blob)).rejects.toThrow('Processor timeout');
  });

  it('should handle server errors', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
      statusText: 'Internal Server Error'
    });
    global.fetch = mockFetch;

    const processor = new RenderPuzzleProcessor('http://example.com/api', 1000);
    const blob = new Blob(['dummy'], { type: 'image/jpeg' });
    await expect(processor.processImage(blob)).rejects.toThrow('Processor API error: 500 Internal Server Error');
  });
});
