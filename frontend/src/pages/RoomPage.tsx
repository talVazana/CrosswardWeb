import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { CrosswordGrid } from '../components/CrosswordGrid';
import { validatePuzzle } from '../domain/puzzle';
import type { PuzzleSchema } from '../domain/puzzle';
import aOutput from '../fixtures/a_output.json';

const RoomPage: React.FC = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const [puzzle, setPuzzle] = useState<PuzzleSchema | null>(null);

  useEffect(() => {
    try {
      const validated = validatePuzzle(aOutput);
      setPuzzle(validated);
    } catch (e) {
      console.error(e);
    }
  }, []);

  return (
    <div className="p-4 flex flex-col items-center">
      <h1 className="text-2xl font-bold mb-4">חדר: {roomId}</h1>
      
      {puzzle ? (
        <CrosswordGrid puzzle={puzzle} />
      ) : (
        <p>טוען תשבץ...</p>
      )}
    </div>
  );
};

export default RoomPage;
