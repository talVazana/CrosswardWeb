import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CrosswordGrid } from '../components/CrosswordGrid';
import { RoomService } from '../services/RoomService';
import { usePlayer } from '../domain/player/PlayerContext';
import { GameEngine } from '../domain/game/GameEngine';
import type { RoomState } from '../domain/game/GameEngine';

const RoomPage: React.FC = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();
  const { player } = usePlayer();
  const [room, setRoom] = useState<RoomState | null>(null);
  const [gridValues, setGridValues] = useState<string[][]>([]);

  useEffect(() => {
    if (!roomId) return;
    const r = RoomService.getRoom(roomId);
    if (!r) {
      alert("Room not found");
      navigate('/');
      return;
    }
    setRoom(r);
  }, [roomId, navigate]);

  useEffect(() => {
    if (!room || !player) return;
    
    // Load grid state from local storage for this player and room
    const key = `crossward_grid_${room.roomId}_${player.id}`;
    const saved = localStorage.getItem(key);
    if (saved) {
      try {
        setGridValues(JSON.parse(saved));
        return;
      } catch (e) {
        console.error('Failed to load grid state', e);
      }
    }
    
    // Initialize empty
    setGridValues(
      Array(room.puzzle.rows).fill(null).map(() => Array(room.puzzle.cols).fill(''))
    );
  }, [room, player]);

  const handleGridChange = (newGrid: string[][]) => {
    setGridValues(newGrid);
    if (room && player) {
      const key = `crossward_grid_${room.roomId}_${player.id}`;
      localStorage.setItem(key, JSON.stringify(newGrid));
    }
  };

  const handleSubmitClue = (clue: import('../domain/puzzle').ClueMetadata, horizontal: boolean) => {
    if (!room || !player) return;

    // Import GameEngine on the fly or normally (assuming we import it above)
    // We'll import GameEngine at the top
    const gridRecord: Record<string, string> = {};
    for (let r = 0; r < room.puzzle.rows; r++) {
      for (let c = 0; c < room.puzzle.cols; c++) {
        if (gridValues[r][c] && gridValues[r][c].trim() !== '') {
          gridRecord[`${r},${c}`] = gridValues[r][c];
        }
      }
    }

    const playerState = {
      playerId: player.id,
      roomId: room.roomId,
      grid: gridRecord
    };

    // Need to use GameEngine.submitClue. We'll fix the import.
    const submission = GameEngine.submitClue(playerState, clue, horizontal, room);
    if (!submission) {
      alert("אנא מלא את כל התאים במילה זו לפני השליחה.");
      return;
    }

    alert(`נשלח פתרון: ${submission.solution}\nמצב ביניים נרשם (Pending).`);
  };

  if (!player) {
    return (
      <div className="p-4 text-center text-red-600 font-bold text-xl mt-10">
        אנא הכנס שם (התחבר) כדי להשתתף בחדר.
      </div>
    );
  }

  return (
    <div className="p-4 flex flex-col items-center">
      <h1 className="text-2xl font-bold mb-2">חדר: {roomId}</h1>
      {room && (
        <div className="mb-4 text-sm bg-blue-50 px-4 py-2 rounded text-blue-800 font-medium">
          מצב החדר: {room.status}
        </div>
      )}
      
      {room && gridValues.length > 0 ? (
        <CrosswordGrid 
          puzzle={room.puzzle} 
          gridValues={gridValues}
          onGridChange={handleGridChange}
          onSubmitClue={handleSubmitClue}
        />
      ) : (
        <p>טוען תשבץ...</p>
      )}
    </div>
  );
};

export default RoomPage;
