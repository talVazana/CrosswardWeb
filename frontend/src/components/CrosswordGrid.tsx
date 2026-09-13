import React, { useState, useRef, useEffect } from 'react';
import type { PuzzleSchema, ClueMetadata } from '../domain/puzzle';

interface CrosswordGridProps {
  puzzle: PuzzleSchema;
}

type Direction = 'horizontal' | 'vertical';

export const CrosswordGrid: React.FC<CrosswordGridProps> = ({ puzzle }) => {
  const [gridValues, setGridValues] = useState<string[][]>(() => 
    Array(puzzle.rows).fill(null).map(() => Array(puzzle.cols).fill(''))
  );
  
  const [selectedCell, setSelectedCell] = useState<{r: number, c: number} | null>(null);
  const [currentDirection, setCurrentDirection] = useState<Direction>('horizontal');
  const [activeClue, setActiveClue] = useState<ClueMetadata | null>(null);

  const inputRefs = useRef<HTMLInputElement[][]>([]);
  useEffect(() => {
    inputRefs.current = Array(puzzle.rows).fill(null).map(() => Array(puzzle.cols).fill(null));
  }, [puzzle.rows, puzzle.cols]);

  const isBlocked = (r: number, c: number) => puzzle.matrix[r][c] === 0;

  // Determine active clue based on selected cell and direction
  useEffect(() => {
    if (!selectedCell) {
      setActiveClue(null);
      return;
    }
    const {r, c} = selectedCell;
    // Find clue that covers this cell in the current direction
    // For RTL, horizontal clues start at higher col index and go left (lower col index)
    // Actually, let's just highlight the current row/col depending on direction up to blocked cells
    
    // A more rigorous clue determination requires tracing back to the clue start
    let startR = r;
    let startC = c;
    if (currentDirection === 'horizontal') {
      // trace right in RTL, so trace to higher col index until blocked
      while (startC < puzzle.cols - 1 && !isBlocked(r, startC + 1)) {
        startC++;
      }
    } else {
      // trace up to lower row index until blocked
      while (startR > 0 && !isBlocked(startR - 1, c)) {
        startR--;
      }
    }
    
    // Find clue that starts here
    const clue = puzzle.clues.find(cl => cl.row === startR && cl.col === startC && cl[currentDirection]);
    setActiveClue(clue || null);
  }, [selectedCell, currentDirection, puzzle]);

  const handleCellClick = (r: number, c: number) => {
    if (isBlocked(r, c)) return;
    
    if (selectedCell?.r === r && selectedCell?.c === c) {
      setCurrentDirection(prev => prev === 'horizontal' ? 'vertical' : 'horizontal');
    } else {
      setSelectedCell({r, c});
    }
  };

  const moveToNextCell = (r: number, c: number) => {
    let nextR = r;
    let nextC = c;
    if (currentDirection === 'horizontal') {
      nextC = c - 1; // RTL: next cell is to the left
    } else {
      nextR = r + 1;
    }

    if (nextR >= 0 && nextR < puzzle.rows && nextC >= 0 && nextC < puzzle.cols && !isBlocked(nextR, nextC)) {
      setSelectedCell({r: nextR, c: nextC});
      inputRefs.current[nextR]?.[nextC]?.focus();
    }
  };

  const moveToPrevCell = (r: number, c: number) => {
    let nextR = r;
    let nextC = c;
    if (currentDirection === 'horizontal') {
      nextC = c + 1; // RTL: prev cell is to the right
    } else {
      nextR = r - 1;
    }

    if (nextR >= 0 && nextR < puzzle.rows && nextC >= 0 && nextC < puzzle.cols && !isBlocked(nextR, nextC)) {
      setSelectedCell({r: nextR, c: nextC});
      inputRefs.current[nextR]?.[nextC]?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, r: number, c: number) => {
    if (e.key === 'Backspace' && gridValues[r][c] === '') {
      moveToPrevCell(r, c);
    } else if (e.key === 'ArrowRight') {
      if (currentDirection === 'horizontal') moveToPrevCell(r, c);
      else setCurrentDirection('horizontal');
    } else if (e.key === 'ArrowLeft') {
      if (currentDirection === 'horizontal') moveToNextCell(r, c);
      else setCurrentDirection('horizontal');
    } else if (e.key === 'ArrowDown') {
      if (currentDirection === 'vertical') moveToNextCell(r, c);
      else setCurrentDirection('vertical');
    } else if (e.key === 'ArrowUp') {
      if (currentDirection === 'vertical') moveToPrevCell(r, c);
      else setCurrentDirection('vertical');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>, r: number, c: number) => {
    const val = e.target.value.trim().slice(-1); // Take only the last typed character
    
    // Only allow Hebrew characters (roughly) or empty
    if (val && !/[\u0590-\u05FF]/.test(val)) return;

    const newVals = [...gridValues];
    newVals[r] = [...newVals[r]];
    newVals[r][c] = val;
    setGridValues(newVals);

    if (val !== '') {
      moveToNextCell(r, c);
    }
  };

  // Helper to check if a cell is highlighted
  const isHighlighted = (r: number, c: number) => {
    if (!activeClue) return false;
    if (currentDirection === 'horizontal' && r === activeClue.row) {
      // Check if it's within the clue span
      let endC = activeClue.col;
      while (endC >= 0 && !isBlocked(r, endC)) endC--;
      return c <= activeClue.col && c > endC;
    }
    if (currentDirection === 'vertical' && c === activeClue.col) {
      let endR = activeClue.row;
      while (endR < puzzle.rows && !isBlocked(endR, c)) endR++;
      return r >= activeClue.row && r < endR;
    }
    return false;
  };

  return (
    <div className="flex flex-col items-center select-none" dir="rtl">
      <div 
        className="grid bg-black gap-px p-1" 
        style={{ 
          gridTemplateColumns: `repeat(${puzzle.cols}, minmax(0, 1fr))` 
        }}
      >
        {puzzle.matrix.map((row, r) => (
          row.map((cellType, c) => {
            const blocked = cellType === 0;
            const clueStart = puzzle.clues.find(cl => cl.row === r && cl.col === c);
            const selected = selectedCell?.r === r && selectedCell?.c === c;
            const highlighted = isHighlighted(r, c);

            if (blocked) {
              return (
                <div 
                  key={`${r}-${c}`} 
                  className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 bg-blue-800"
                />
              );
            }

            return (
              <div 
                key={`${r}-${c}`} 
                className={`relative w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 flex items-center justify-center cursor-text transition-colors duration-200
                  ${selected ? 'bg-yellow-300' : highlighted ? 'bg-blue-100' : 'bg-white'}`}
                onClick={() => handleCellClick(r, c)}
              >
                {clueStart && (
                  <span className="absolute top-0 right-1 text-[0.6rem] text-gray-700 font-bold leading-none mt-1">
                    {clueStart.clue_number}
                  </span>
                )}
                <input
                  ref={el => { if (inputRefs.current[r]) inputRefs.current[r][c] = el as HTMLInputElement; }}
                  type="text"
                  value={gridValues[r][c]}
                  onChange={(e) => handleChange(e, r, c)}
                  onKeyDown={(e) => handleKeyDown(e, r, c)}
                  onFocus={() => { if (!selected) setSelectedCell({r, c}); }}
                  className="w-full h-full text-center text-lg sm:text-xl font-bold bg-transparent outline-none p-0 border-none uppercase focus:ring-0"
                  maxLength={2}
                  dir="rtl"
                />
              </div>
            );
          })
        ))}
      </div>
      
      {activeClue && (
        <div className="mt-4 p-3 bg-white rounded shadow text-lg font-medium">
          רמז פעיל: {activeClue.clue_number} {currentDirection === 'horizontal' ? 'מאוזן' : 'מאונך'}
        </div>
      )}
    </div>
  );
};
