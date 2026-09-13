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
    let roomNow = RoomService.getRoom(room.roomId) || room;
    const submission = GameEngine.submitClue(playerState, clue, horizontal, roomNow);
    if (!submission) {
      alert("אנא מלא את כל התאים במילה זו לפני השליחה.");
      return;
    }

    // Evaluate submission through engine
    roomNow = GameEngine.processSubmission(submission, roomNow);
    RoomService.updateRoom(roomNow);
    setRoom(roomNow);

    // Save submission to log for admin
    const subs = RoomService.getSubmissions(room.roomId);
    subs.push(submission);
    RoomService.saveSubmissions(room.roomId, subs);

    alert(`נשלח פתרון: ${submission.solution}\nסטטוס: ${submission.status}`);
  };

  const handleRevealClue = (clue: import('../domain/puzzle').ClueMetadata, horizontal: boolean) => {
    if (!room || !player) return;
    const key = `${clue.clue_number}_${horizontal}`;
    const auth = room.authoritativeSolutions[key];
    if (!auth) {
      alert("רמז זה טרם פורסם על ידי המנהל, לא ניתן לגלות.");
      return;
    }

    const length = GameEngine.getClueLength(room.puzzle, clue.row, clue.col, horizontal);
    
    // Fill the player's grid with the authoritative solution
    const newGrid = [...gridValues];
    for (let i = 0; i < length; i++) {
      const r = horizontal ? clue.row : clue.row + i;
      const c = horizontal ? clue.col - i : clue.col;
      newGrid[r] = [...newGrid[r]];
      newGrid[r][c] = auth[i] || '';
    }
    handleGridChange(newGrid);

    // Track 0 points
    let roomNow = RoomService.getRoom(room.roomId) || room;
    roomNow = GameEngine.revealClue(player.id, clue.clue_number, horizontal, roomNow);
    RoomService.updateRoom(roomNow);
    setRoom(roomNow);
    alert(`רמז נחשף. לא יוענקו עליו נקודות.`);
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
        <div className={`mb-4 text-sm px-4 py-2 rounded font-medium ${room.status === 'CLOSED' ? 'bg-red-100 text-red-800 text-lg' : 'bg-blue-50 text-blue-800'}`}>
          מצב החדר: {room.status === 'CLOSED' ? 'המשחק הסתיים (Game Over)' : room.status}
        </div>
      )}
      
      {room && room.status === 'CLOSED' && (
        <div className="mb-6 p-6 border-4 border-yellow-400 bg-yellow-50 rounded-lg text-center shadow-lg w-full max-w-2xl">
          <h2 className="text-3xl font-bold mb-4 text-yellow-700">המנצחים!</h2>
          <ul className="text-xl">
            {Object.entries(room.playerScores).sort((a,b)=>b[1]-a[1]).map(([pid, score], idx) => (
              <li key={pid} className="mb-2">
                #{idx + 1}: {pid === player.id ? `${pid} (אתה)` : pid} עם {score} נקודות
              </li>
            ))}
            {Object.keys(room.playerScores).length === 0 && <p>אין ניקוד לאף שחקן.</p>}
          </ul>
        </div>
      )}

      {room && gridValues.length > 0 ? (
        <div className="flex flex-col md:flex-row gap-6 items-start w-full max-w-5xl">
          <div className="flex-1 overflow-auto bg-white/90 p-4 rounded-xl shadow-lg border border-blue-100">
            <CrosswordGrid 
              puzzle={room.puzzle} 
              gridValues={gridValues}
              onGridChange={handleGridChange}
              onSubmitClue={handleSubmitClue}
              onRevealClue={handleRevealClue}
              roomState={room}
              currentPlayerId={player.id}
            />
          </div>
          
          <div className="w-full md:w-80 flex flex-col gap-4 self-start">
            <div className="p-4 border rounded-xl bg-white/90 shadow-lg border-blue-100">
              <h2 className="font-bold text-xl mb-4 border-b pb-2 text-blue-900">תמונת מקור</h2>
              <img src="/a.jpg" alt="Original Crossword" className="w-full h-auto rounded border border-gray-200" />
            </div>

            <div className="p-4 border rounded-xl bg-white/90 shadow-lg border-blue-100">
              <h2 className="font-bold text-xl mb-4 border-b pb-2 text-blue-900">ניקוד (Scores)</h2>
            {Object.keys(room.playerScores).length === 0 ? (
              <p className="text-gray-500">עדיין אין ניקוד.</p>
            ) : (
              <ul className="space-y-2">
                {Object.entries(room.playerScores).sort((a,b)=>b[1]-a[1]).map(([pid, score]) => (
                  <li key={pid} className="flex justify-between items-center bg-gray-50 p-2 rounded border">
                    <span className="font-semibold truncate">{pid === player.id ? `${pid} (אתה)` : pid}</span>
                    <span className="font-bold text-blue-600">{score} נק'</span>
                  </li>
                ))}
              </ul>
            )}
            </div>
          </div>
        </div>
      ) : (
        <p>טוען תשבץ...</p>
      )}
    </div>
  );
};

export default RoomPage;
