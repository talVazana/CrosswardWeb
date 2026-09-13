import React, { useState } from 'react';
import { usePlayer } from '../domain/player/PlayerContext';

const PlayerIdentity: React.FC = () => {
  const { player, login, logout } = usePlayer();
  const [nameInput, setNameInput] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    login(nameInput);
    setNameInput('');
  };

  if (player) {
    return (
      <div className="flex items-center space-x-2 space-x-reverse">
        <span 
          className="w-6 h-6 rounded-full inline-block" 
          style={{ backgroundColor: player.color }} 
          title="Your Color"
        ></span>
        <span className="font-medium text-sm">שלום, {player.name}</span>
        <button 
          onClick={logout}
          className="text-xs bg-white text-blue-600 px-2 py-1 rounded hover:bg-gray-100"
        >
          יציאה
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleLogin} className="flex items-center space-x-2 space-x-reverse">
      <input
        type="text"
        placeholder="הכנס שם..."
        value={nameInput}
        onChange={(e) => setNameInput(e.target.value)}
        className="px-2 py-1 text-sm text-black rounded border border-gray-300"
        required
      />
      <button 
        type="submit"
        className="text-xs bg-white text-blue-600 px-2 py-1 rounded hover:bg-gray-100"
      >
        היכנס
      </button>
    </form>
  );
};

export default PlayerIdentity;
