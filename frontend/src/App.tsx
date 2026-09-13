import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import RoomsPage from './pages/RoomsPage';
import RoomPage from './pages/RoomPage';
import AdminPage from './pages/AdminPage';
import AdminRoomPage from './pages/AdminRoomPage';
import { PlayerProvider } from './domain/player/PlayerContext';

function App() {
  return (
    <PlayerProvider>
      <BrowserRouter>
        <div className="min-h-screen bg-gray-50 text-gray-900" dir="rtl">
          <Header />
          <main className="container mx-auto p-4">
            <Routes>
              <Route path="/" element={<RoomsPage />} />
              <Route path="/room/:roomId" element={<RoomPage />} />
              <Route path="/admin" element={<AdminPage />} />
              <Route path="/admin/room/:roomId" element={<AdminRoomPage />} />
            </Routes>
          </main>
        </div>
      </BrowserRouter>
    </PlayerProvider>
  );
}

export default App;
