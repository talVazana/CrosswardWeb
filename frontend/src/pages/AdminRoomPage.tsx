import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CrosswordGrid } from '../components/CrosswordGrid';
import { RoomService } from '../services/RoomService';
import { GameEngine } from '../domain/game/GameEngine';
import type { RoomState, Submission } from '../domain/game/GameEngine';

const AdminRoomPage: React.FC = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();
  const [room, setRoom] = useState<RoomState | null>(null);
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [gridValues, setGridValues] = useState<string[][]>([]);

  useEffect(() => {
    if (!roomId) return;
    const r = RoomService.getRoom(roomId);
    if (!r) {
      alert("Room not found");
      navigate('/admin');
      return;
    }
    setRoom(r);
    setDrafts(RoomService.getAdminDrafts(roomId));
    setSubmissions(RoomService.getSubmissions(roomId));
    
    // For admin, we could load authoritative solutions into grid
    const emptyGrid = Array(r.puzzle.rows).fill(null).map(() => Array(r.puzzle.cols).fill(''));
    const adminDrafts = RoomService.getAdminDrafts(roomId);
    
    // Fill grid with authoritative solutions and drafts
    const populate = (dict: Record<string, string>) => {
      for (const key in dict) {
        const [clueNumStr, isHorizStr] = key.split('_');
        const clueNum = parseInt(clueNumStr);
        const isHoriz = isHorizStr === 'true';
        const clue = r.puzzle.clues.find(c => c.clue_number === clueNum && (isHoriz ? c.horizontal : c.vertical));
        if (clue) {
          const length = GameEngine.getClueLength(r.puzzle, clue.row, clue.col, isHoriz);
          for (let i = 0; i < length; i++) {
            const row = isHoriz ? clue.row : clue.row + i;
            const col = isHoriz ? clue.col - i : clue.col;
            if (dict[key][i] && dict[key][i] !== ' ') {
              emptyGrid[row][col] = dict[key][i];
            }
          }
        }
      }
    };
    
    populate(r.authoritativeSolutions);
    populate(adminDrafts);
    
    setGridValues(emptyGrid);
  }, [roomId, navigate]);

  const handlePublish = () => {
    if (!room) return;
    const confirm = window.confirm("האם לפרסם פתרונות ולהפוך אותם לרשמיים?");
    if (!confirm) return;

    const newRoom = { ...room };
    let publishedCount = 0;
    
    // Move drafts to authoritative
    for (const [key, sol] of Object.entries(drafts)) {
      if (sol.trim() !== '') {
        newRoom.authoritativeSolutions[key] = sol;
        publishedCount++;
      }
    }
    
    RoomService.updateRoom(newRoom);
    setRoom(newRoom);
    alert(`פורסמו ${publishedCount} פתרונות.`);
  };

  const handleApprove = (sub: Submission) => {
    if (!room) return;
    const newRoom = { ...room };
    const key = `${sub.clueNumber}_${sub.horizontal}`;
    
    if (!newRoom.authoritativeSolutions[key]) {
      newRoom.authoritativeSolutions[key] = sub.solution; // Make it authoritative
    }
    
    if (!newRoom.solvedClues[key]) {
      newRoom.solvedClues[key] = {
        clueNumber: sub.clueNumber,
        horizontal: sub.horizontal,
        winnerId: sub.playerId,
        solution: sub.solution
      };
      newRoom.playerScores[sub.playerId] = (newRoom.playerScores[sub.playerId] || 0) + 2;
    }
    
    RoomService.updateRoom(newRoom);
    setRoom(newRoom);
    
    // Update submission status
    const subs = [...submissions];
    const s = subs.find(x => x.id === sub.id);
    if (s) s.status = 'APPROVED';
    RoomService.saveSubmissions(room.roomId, subs);
    setSubmissions(subs);

    // Update grid
    const length = GameEngine.getClueLength(newRoom.puzzle, sub.clueNumber, 0, sub.horizontal); // wait, need to find the clue row/col!
    const clue = newRoom.puzzle.clues.find(c => c.clue_number === sub.clueNumber && (sub.horizontal ? c.horizontal : c.vertical));
    if (clue) {
      const realLength = GameEngine.getClueLength(newRoom.puzzle, clue.row, clue.col, sub.horizontal);
      const newGrid = [...gridValues];
      for (let i = 0; i < realLength; i++) {
        const r = sub.horizontal ? clue.row : clue.row + i;
        const c = sub.horizontal ? clue.col - i : clue.col;
        newGrid[r] = [...newGrid[r]];
        newGrid[r][c] = sub.solution[i] || '';
      }
      setGridValues(newGrid);
    }
  };

  const handleDecline = (sub: Submission) => {
    if (!room) return;
    const subs = [...submissions];
    const s = subs.find(x => x.id === sub.id);
    if (s) s.status = 'DECLINED';
    RoomService.saveSubmissions(room.roomId, subs);
    setSubmissions(subs);
  };

  const handleGridSubmit = (clue: import('../domain/puzzle').ClueMetadata, horizontal: boolean) => {
    if (!room) return;
    
    let solution = '';
    const length = clue[horizontal ? 'horizontal' : 'vertical'] ? 
      GameEngine.getClueLength(room.puzzle, clue.row, clue.col, horizontal) : 0;
      
    for (let i = 0; i < length; i++) {
      const r = horizontal ? clue.row : clue.row + i;
      const c = horizontal ? clue.col - i : clue.col;
      solution += gridValues[r]?.[c] || '';
    }

    if (solution.length !== length) {
      alert('יש למלא את כל המילה');
      return;
    }
    
    const newDrafts = { ...drafts, [`${clue.clue_number}_${horizontal}`]: solution };
    setDrafts(newDrafts);
    RoomService.saveAdminDrafts(room.roomId, newDrafts);
    alert('טיוטה נשמרה בהצלחה');
  };

  if (!room) return null;

  return (
    <div className="p-4 flex flex-col md:flex-row gap-6">
      <div className="flex-1">
        <h1 className="text-3xl font-bold mb-4 text-blue-900 bg-white/70 px-4 py-2 rounded-2xl inline-block drop-shadow-sm">
          ניהול חדר: {room.roomName || roomId}
        </h1>
        
        <div className="mb-6 p-4 border rounded bg-gray-50">
          <h2 className="font-bold text-lg mb-2">טיוטות ופרסום פתרונות (MS16, MS17)</h2>
          <p className="text-sm mb-4">הקלד בתשבץ ולחץ על 'שלח' כדי לשמור טיוטת פתרון.</p>
          <ul className="mb-4 text-sm bg-white p-2 border rounded">
            {Object.entries(drafts).map(([k, v]) => (
              <li key={k} className="border-b py-1">רמז {k}: {v}</li>
            ))}
          </ul>
          <button 
            onClick={handlePublish}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 ml-2"
          >
            פרסם טיוטות (Publish)
          </button>
          <button 
            onClick={() => {
              if (window.confirm("האם לסיים את המשחק ולסגור את החדר?")) {
                let roomNow = { ...room };
                roomNow = GameEngine.closeRoom(roomNow);
                RoomService.updateRoom(roomNow);
                setRoom(roomNow);
                alert("החדר נסגר.");
              }
            }}
            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 mt-2 block"
            disabled={room.status === 'CLOSED'}
          >
            סגור חדר (End Game)
          </button>
        </div>

        <div className="p-4 border rounded bg-yellow-50">
          <h2 className="font-bold text-lg mb-2">אישור שחקנים (MS18)</h2>
          {submissions.length === 0 ? (
            <p>אין בקשות ממתינות.</p>
          ) : (
            <div className="space-y-2">
              {submissions.map(sub => (
                <div key={sub.id} className="bg-white p-2 border rounded flex justify-between items-center">
                  <div>
                    <span className="font-bold">שחקן {sub.playerId}</span>{' '}
                    רמז {sub.clueNumber} {sub.horizontal ? 'מאוזן' : 'מאונך'}: <b>{sub.solution}</b>
                    <div className="text-xs text-gray-500">סטטוס: {sub.status}</div>
                  </div>
                  {sub.status === 'PENDING' && (
                    <div className="flex gap-2">
                      <button onClick={() => handleApprove(sub)} className="bg-green-500 text-white px-2 py-1 rounded text-sm">אישור</button>
                      <button onClick={() => handleDecline(sub)} className="bg-red-500 text-white px-2 py-1 rounded text-sm">דחייה</button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="p-4 border rounded-xl bg-white/90 shadow-lg border-blue-100 mt-6">
          <h2 className="font-bold text-lg mb-2 text-blue-900">תמונת מקור</h2>
          <img src="/a.jpg" alt="Original Crossword" className="w-full h-auto rounded border border-gray-200" />
        </div>
      </div>
      
      <div className="flex-1 bg-white/90 p-4 rounded-xl shadow-lg border border-blue-100 overflow-auto">
        <CrosswordGrid 
          puzzle={room.puzzle}
          gridValues={gridValues}
          onGridChange={setGridValues}
          onSubmitClue={handleGridSubmit}
        />
      </div>
    </div>
  );
};

export default AdminRoomPage;
