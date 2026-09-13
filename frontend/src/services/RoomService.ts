import type { RoomState } from '../domain/game/GameEngine';
import type { PuzzleSchema } from '../domain/puzzle';

const ROOMS_KEY = 'crossward_rooms';

export class RoomService {
  static getRooms(): RoomState[] {
    const data = localStorage.getItem(ROOMS_KEY);
    return data ? JSON.parse(data) : [];
  }

  static getRoom(roomId: string): RoomState | undefined {
    return this.getRooms().find(r => r.roomId === roomId);
  }

  static createRoom(puzzle: PuzzleSchema, imageUrl?: string): RoomState {
    const rooms = this.getRooms();
    const newRoom: RoomState = {
      roomId: Math.random().toString(36).substring(2, 9),
      status: 'OPEN',
      puzzle,
      authoritativeSolutions: {},
      solvedClues: {},
      playerScores: {},
      revealedClues: {},
      playerOnePointClues: {}
    };
    rooms.push(newRoom);
    localStorage.setItem(ROOMS_KEY, JSON.stringify(rooms));
    
    if (imageUrl) {
      localStorage.setItem(`crossward_img_${newRoom.roomId}`, imageUrl);
    }
    return newRoom;
  }
}
