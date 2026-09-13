import { PuzzleSchema, validatePuzzle } from '../domain/puzzle';

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
  constructor(private url: string, private timeoutMs: number = 10000) {}

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

export function getPuzzleProcessor(): PuzzleProcessor {
  const mode = import.meta.env.VITE_PUZZLE_PROCESSOR_MODE;
  if (mode === 'render') {
    const url = import.meta.env.VITE_PUZZLE_PROCESSOR_URL;
    if (!url) {
      throw new Error('Missing VITE_PUZZLE_PROCESSOR_URL for render mode');
    }
    return new RenderPuzzleProcessor(url);
  } else {
    // Return mock processor by default during dev
    // Dynamically loading the fixture might be tricky in sync, 
    // but we can import it or pass it. 
    // To avoid coupling to UI bundle, we will just fetch it or hardcode for now.
    // For simplicity, we just throw if not implemented correctly or provide a basic stub.
    throw new Error('Mock processing should be injected or handled via a factory with data');
  }
}
