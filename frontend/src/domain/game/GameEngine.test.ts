import { expect, test, describe } from 'vitest';
import { GameEngine, PlayerRoomState, RoomState } from './GameEngine';
import { PuzzleSchema } from '../puzzle';

const mockPuzzle: PuzzleSchema = {
    rows: 3,
    cols: 3,
    matrix: [
        [2, 1, 0],
        [1, 0, 0],
        [0, 0, 0]
    ],
    clues: [
        { clue_number: 1, row: 0, col: 0, horizontal: true, vertical: true }
    ]
};

const createMockRoom = (): RoomState => ({
    roomId: 'room1',
    status: 'ACTIVE',
    puzzle: mockPuzzle,
    authoritativeSolutions: { '1_true': 'AB' }, // Remember RTL leftward, horizontal length 2 (col 0, then col -1? wait. RTL means leftward, so if start is 0,0, col -1 is out of bounds).
    solvedClues: {},
    playerScores: {},
    revealedClues: {},
    playerOnePointClues: {}
});

// Fix mock puzzle for Hebrew RTL parsing (starts at col 1, goes to col 0)
const validMockPuzzle: PuzzleSchema = {
    rows: 2,
    cols: 2,
    matrix: [
        [1, 2], // col 1 is start, col 0 is next
        [0, 1]
    ],
    clues: [
        { clue_number: 1, row: 0, col: 1, horizontal: true, vertical: true }
    ]
};

const createValidMockRoom = (): RoomState => ({
    roomId: 'room1',
    status: 'ACTIVE',
    puzzle: validMockPuzzle,
    authoritativeSolutions: { '1_true': 'AB' },
    solvedClues: {},
    playerScores: {},
    revealedClues: {},
    playerOnePointClues: {}
});

describe('GameEngine', () => {
    test('getClueLength calculates length correctly RTL', () => {
        const len = GameEngine.getClueLength(validMockPuzzle, 0, 1, true);
        expect(len).toBe(2);
    });

    test('submitClue returns null for incomplete clue', () => {
        const playerState: PlayerRoomState = {
            playerId: 'p1',
            roomId: 'room1',
            grid: { '0,1': 'A' } // Missing '0,0'
        };
        const room = createValidMockRoom();
        const submission = GameEngine.submitClue(playerState, validMockPuzzle.clues[0], true, room);
        expect(submission).toBeNull();
    });

    test('submitClue creates submission when complete', () => {
        const playerState: PlayerRoomState = {
            playerId: 'p1',
            roomId: 'room1',
            grid: { '0,1': 'A', '0,0': 'B' }
        };
        const room = createValidMockRoom();
        const submission = GameEngine.submitClue(playerState, validMockPuzzle.clues[0], true, room);
        expect(submission).not.toBeNull();
        expect(submission?.solution).toBe('AB');
    });

    test('processSubmission scores 2 points for first solver', () => {
        const room = createValidMockRoom();
        const submission = GameEngine.submitClue(
            { playerId: 'p1', roomId: 'room1', grid: { '0,1': 'A', '0,0': 'B' } },
            validMockPuzzle.clues[0], true, room
        )!;
        
        const nextRoom = GameEngine.processSubmission(submission, room);
        expect(nextRoom.playerScores['p1']).toBe(2);
        expect(nextRoom.solvedClues['1_true'].winnerId).toBe('p1');
    });

    test('processSubmission scores 1 point for second solver', () => {
        const room = createValidMockRoom();
        room.solvedClues['1_true'] = {
            clueNumber: 1, horizontal: true, winnerId: 'p2', solution: 'AB'
        };
        room.playerScores['p2'] = 2;

        const submission = GameEngine.submitClue(
            { playerId: 'p1', roomId: 'room1', grid: { '0,1': 'A', '0,0': 'B' } },
            validMockPuzzle.clues[0], true, room
        )!;
        
        const nextRoom = GameEngine.processSubmission(submission, room);
        expect(nextRoom.playerScores['p1']).toBe(1);
        expect(nextRoom.solvedClues['1_true'].winnerId).toBe('p2'); // Winner doesn't change
    });
    
    test('revealClue prevents scoring', () => {
        let room = createValidMockRoom();
        room = GameEngine.revealClue('p1', 1, true, room);
        
        const submission = GameEngine.submitClue(
            { playerId: 'p1', roomId: 'room1', grid: { '0,1': 'A', '0,0': 'B' } },
            validMockPuzzle.clues[0], true, room
        )!;
        
        room = GameEngine.processSubmission(submission, room);
        expect(room.playerScores['p1']).toBeUndefined(); // No points
    });
});

