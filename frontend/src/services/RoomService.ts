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

  static createRoom(puzzle: PuzzleSchema, imageUrl?: string, roomName?: string): RoomState {
    const rooms = this.getRooms();
    const newRoom: RoomState = {
      roomId: Math.random().toString(36).substring(2, 9),
      roomName,
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

  static updateRoom(room: RoomState): void {
    const rooms = this.getRooms();
    const idx = rooms.findIndex(r => r.roomId === room.roomId);
    if (idx !== -1) {
      rooms[idx] = room;
      localStorage.setItem(ROOMS_KEY, JSON.stringify(rooms));
    }
  }

  static getAdminDrafts(roomId: string): Record<string, string> {
    const data = localStorage.getItem(`crossward_drafts_${roomId}`);
    return data ? JSON.parse(data) : {};
  }

  static saveAdminDrafts(roomId: string, drafts: Record<string, string>): void {
    localStorage.setItem(`crossward_drafts_${roomId}`, JSON.stringify(drafts));
  }

  // Pending submissions mock for MVP local
  static getSubmissions(roomId: string): any[] {
    const data = localStorage.getItem(`crossward_subs_${roomId}`);
    return data ? JSON.parse(data) : [];
  }

  static saveSubmissions(roomId: string, subs: any[]): void {
    localStorage.setItem(`crossward_subs_${roomId}`, JSON.stringify(subs));
  }
}

