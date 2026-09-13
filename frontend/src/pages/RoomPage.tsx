import React from 'react';
import { useParams } from 'react-router-dom';

const RoomPage: React.FC = () => {
  const { roomId } = useParams<{ roomId: string }>();

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Room {roomId}</h1>
      <p>Room page placeholder.</p>
    </div>
  );
};

export default RoomPage;
