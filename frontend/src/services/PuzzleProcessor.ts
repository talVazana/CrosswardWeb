import { validatePuzzle } from '../domain/puzzle';
import type { PuzzleSchema } from '../domain/puzzle';

export interface PuzzleProcessor {
  processImage(imageBlob: Blob): Promise<PuzzleSchema>;
}

export class MockPuzzleProcessor implements PuzzleProcessor {
  constructor(private mockData: any, private delayMs: number = 500) {}

  async processImage(imageBlob: Blob): Promise<PuzzleSchema> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        try {
          resolve(validatePuzzle(this.mockData));
        } catch (err) {
          reject(err);
        }
      }, this.delayMs);
    });
  }
}

export class RenderPuzzleProcessor implements PuzzleProcessor {
  constructor(private url: string, private timeoutMs: number = 60000) {}

  async processImage(imageBlob: Blob): Promise<PuzzleSchema> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeoutMs);

    try {
      const formData = new FormData();
      formData.append('file', imageBlob);

      const response = await fetch(this.url, {
        method: 'POST',
        body: formData,
        signal: controller.signal,
      });

      if (!response.ok) {
        throw new Error(`Processor API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return validatePuzzle(data);
    } catch (err: any) {
      if (err.name === 'AbortError') {
        throw new Error('Processor timeout');
      }
      throw err;
    } finally {
      clearTimeout(timeoutId);
    }
  }
}

import mockFixture from '../fixtures/a_output.json';

export function getPuzzleProcessor(): PuzzleProcessor {
  const mode = import.meta.env.VITE_PUZZLE_PROCESSOR_MODE;
  if (mode === 'render') {
    const url = import.meta.env.VITE_PUZZLE_PROCESSOR_URL;
    if (!url) {
      throw new Error('Missing VITE_PUZZLE_PROCESSOR_URL for render mode');
    }
    return new RenderPuzzleProcessor(url);
  } else {
    return new MockPuzzleProcessor(mockFixture);
  }
}
