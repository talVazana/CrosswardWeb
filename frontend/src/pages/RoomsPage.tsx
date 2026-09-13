import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { RoomService } from '../services/RoomService';
import type { RoomState } from '../domain/game/GameEngine';

const RoomsPage: React.FC = () => {
  const [rooms, setRooms] = useState<RoomState[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    setRooms(RoomService.getRooms());
  }, []);

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-center text-blue-700">חדרי משחק (Rooms)</h1>
      
      {rooms.length === 0 ? (
        <div className="text-center p-8 bg-white shadow rounded border border-gray-200">
          <p className="text-lg text-gray-600">אין חדרים פעילים כרגע.</p>
          <p className="text-sm text-gray-500 mt-2">No active rooms yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {rooms.map(room => (
            <div key={room.roomId} className="bg-white p-6 shadow rounded border border-blue-100 hover:shadow-md transition">
              <h2 className="text-xl font-semibold mb-2">חדר #{room.roomId}</h2>
              <div className="mb-4">
                <span className={`inline-block px-2 py-1 text-xs rounded font-bold ${
                  room.status === 'OPEN' ? 'bg-green-100 text-green-800' :
                  room.status === 'ACTIVE' ? 'bg-blue-100 text-blue-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {room.status === 'OPEN' ? 'פתוח (Open)' : room.status === 'ACTIVE' ? 'פעיל (Active)' : 'סגור (Closed)'}
                </span>
              </div>
              <p className="text-sm text-gray-600 mb-4">
                גודל: {room.puzzle.rows}x{room.puzzle.cols} <br />
                שחקנים: {Object.keys(room.playerScores || {}).length}
              </p>
              <button 
                onClick={() => navigate(`/room/${room.roomId}`)}
                className="w-full bg-blue-600 text-white font-bold py-2 rounded hover:bg-blue-700 transition disabled:bg-gray-400"
                disabled={room.status === 'CLOSED'}
              >
                הצטרף לחדר
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RoomsPage;
