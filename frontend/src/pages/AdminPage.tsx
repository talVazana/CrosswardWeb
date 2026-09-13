import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getPuzzleProcessor } from '../services/PuzzleProcessor';
import { RoomService } from '../services/RoomService';
import type { PuzzleSchema } from '../domain/puzzle';

const AdminPage: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');
  const [puzzle, setPuzzle] = useState<PuzzleSchema | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setError('');
      setPuzzle(null);
      if (imageUrl) {
        URL.revokeObjectURL(imageUrl);
      }
      setImageUrl(URL.createObjectURL(e.target.files[0]));
    }
  };

  const handleProcess = async () => {
    if (!file) return;
    setProcessing(true);
    setError('');
    
    try {
      const processor = getPuzzleProcessor();
      const result = await processor.processImage(file);
      setPuzzle(result);
    } catch (err: any) {
      setError(err.message || 'Failed to process puzzle');
    } finally {
      setProcessing(false);
    }
  };

  const handleCreateRoom = () => {
    if (!puzzle) return;
    // We should ideally convert the blob to base64 or upload to storage, 
    // but for local MS12 demo, we'll store a mock URL.
    const room = RoomService.createRoom(puzzle, 'local_image_ref');
    navigate(`/room/${room.roomId}`);
  };

  return (
    <div className="p-4 max-w-2xl mx-auto bg-white shadow rounded">
      <h1 className="text-2xl font-bold mb-4">ניהול מנהל - יצירת חדר</h1>
      
      <div className="mb-6 p-4 border rounded bg-gray-50">
        <h2 className="font-semibold mb-2">1. העלאת תמונה</h2>
        <input 
          type="file" 
          accept="image/*"
          onChange={handleFileChange}
          className="mb-2"
        />
        {imageUrl && (
          <img src={imageUrl} alt="Preview" className="w-full max-w-xs h-auto mt-2 border rounded" />
        )}
        
        <button 
          onClick={handleProcess}
          disabled={!file || processing}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded disabled:bg-gray-400"
        >
          {processing ? 'מעבד תמונה...' : 'עבד תמונה'}
        </button>
        {error && <p className="text-red-600 mt-2">{error}</p>}
      </div>

      {puzzle && (
        <div className="mb-6 p-4 border rounded bg-green-50">
          <h2 className="font-semibold mb-2">2. אישור תצורה</h2>
          <p>שורות: {puzzle.rows}</p>
          <p>עמודות: {puzzle.cols}</p>
          <p>הגדרות (Clues): {puzzle.clues.length}</p>
          
          <button 
            onClick={handleCreateRoom}
            className="mt-4 px-4 py-2 bg-green-600 text-white rounded font-bold hover:bg-green-700"
          >
            צור חדר והתחל משחק
          </button>
        </div>
      )}

      <div className="mt-8 p-4 border rounded bg-white">
        <h2 className="font-semibold mb-4 text-xl">חדרים קיימים (ניהול)</h2>
        <div className="space-y-2">
          {RoomService.getRooms().map(room => (
            <div key={room.roomId} className="flex justify-between items-center p-3 border rounded">
              <span>חדר: {room.roomId} ({room.status})</span>
              <button
                onClick={() => navigate(`/admin/room/${room.roomId}`)}
                className="bg-purple-600 text-white px-3 py-1 rounded hover:bg-purple-700"
              >
                נהל חדר
              </button>
            </div>
          ))}
          {RoomService.getRooms().length === 0 && <p className="text-gray-500">אין חדרים כרגע.</p>}
        </div>
      </div>
    </div>
  );
};

export default AdminPage;
