import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CrosswordGrid } from '../components/CrosswordGrid';
import { RoomService } from '../services/RoomService';
import { usePlayer } from '../domain/player/PlayerContext';
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
        />
      ) : (
        <p>טוען תשבץ...</p>
      )}
    </div>
  );
};

export default RoomPage;
