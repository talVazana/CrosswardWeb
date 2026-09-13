import { ClueMetadata, MatrixValue, PuzzleSchema } from '../puzzle';

export type PlayerId = string;
export type RoomId = string;
export type ClueNumber = number;

export interface PlayerRoomState {
    playerId: PlayerId;
    roomId: RoomId;
    grid: Record<string, string>; // e.g. "row,col" -> "א"
}

export interface Submission {
    id: string;
    roomId: RoomId;
    playerId: PlayerId;
    clueNumber: ClueNumber;
    horizontal: boolean;
    solution: string;
    submittedAt: number;
    status: 'PENDING' | 'APPROVED' | 'DECLINED' | 'AUTO_APPROVED';
}

export interface SolvedClue {
    clueNumber: ClueNumber;
    horizontal: boolean;
    winnerId: PlayerId;
    solution: string;
}

export interface RoomState {
    roomId: RoomId;
    status: 'OPEN' | 'ACTIVE' | 'CLOSED';
    puzzle: PuzzleSchema;
    authoritativeSolutions: Record<string, string>; // "\_\"
    solvedClues: Record<string, SolvedClue>; // "\_\"
    playerScores: Record<PlayerId, number>;
    revealedClues: Record<PlayerId, string[]>; // For 0 points tracking
    playerOnePointClues: Record<PlayerId, string[]>; // Prevent duplicate 1-point awards
}

export class GameEngine {
    static getClueLength(puzzle: PuzzleSchema, startRow: number, startCol: number, horizontal: boolean): number {
        let len = 0;
        let r = startRow;
        let c = startCol;
        
        while (r >= 0 && r < puzzle.rows && c >= 0 && c < puzzle.cols) {
            if (puzzle.matrix[r][c] === 0) break;
            len++;
            if (horizontal) {
                c--; // Hebrew RTL: leftward
            } else {
                r++; // Downward
            }
        }
        return len;
    }

    static submitClue(
        playerState: PlayerRoomState,
        clue: ClueMetadata,
        horizontal: boolean,
        room: RoomState
    ): Submission | null {
        if (room.status === 'CLOSED') return null;

        const length = this.getClueLength(room.puzzle, clue.row, clue.col, horizontal);
        let solution = '';
        
        for (let i = 0; i < length; i++) {
            const r = horizontal ? clue.row : clue.row + i;
            const c = horizontal ? clue.col - i : clue.col;
            const cellKey = `${r},${c}`;
            const letter = playerState.grid[cellKey];
            if (!letter || letter.trim() === '') {
                return null; // Incomplete clue
            }
            solution += letter;
        }

        return {
            id: Math.random().toString(36).substring(7),
            roomId: room.roomId,
            playerId: playerState.playerId,
            clueNumber: clue.clue_number,
            horizontal,
            solution,
            submittedAt: Date.now(),
            status: 'PENDING'
        };
    }

    static processSubmission(submission: Submission, room: RoomState): RoomState {
        if (room.status === 'CLOSED') return room;

        const key = `${submission.clueNumber}_${submission.horizontal}`;
        const authSolution = room.authoritativeSolutions[key];
        if (!authSolution) {
            return room; // No admin solution yet, stays pending
        }

        const isCorrect = submission.solution === authSolution;
        submission.status = isCorrect ? 'AUTO_APPROVED' : 'DECLINED';

        if (isCorrect) {
            // Scoring logic
            room.revealedClues[submission.playerId] = room.revealedClues[submission.playerId] || [];
            room.playerOnePointClues[submission.playerId] = room.playerOnePointClues[submission.playerId] || [];
            
            const hasRevealed = room.revealedClues[submission.playerId].includes(key);
            
            if (!hasRevealed) {
                if (!room.solvedClues[key]) {
                    // First solver (MS20)
                    room.solvedClues[key] = {
                        clueNumber: submission.clueNumber,
                        horizontal: submission.horizontal,
                        winnerId: submission.playerId,
                        solution: authSolution
                    };
                    room.playerScores[submission.playerId] = (room.playerScores[submission.playerId] || 0) + 2;
                } else {
                    // Already solved by someone else
                    // Can get 1 point if not the winner and hasn't received point for this yet
                    const alreadyGotPoint = room.playerOnePointClues[submission.playerId].includes(key);
                    if (room.solvedClues[key].winnerId !== submission.playerId && !alreadyGotPoint) {
                         room.playerScores[submission.playerId] = (room.playerScores[submission.playerId] || 0) + 1;
                         room.playerOnePointClues[submission.playerId].push(key);
                    }
                }
            }
        }
        return room;
    }

    static revealClue(playerId: PlayerId, clueNumber: ClueNumber, horizontal: boolean, room: RoomState): RoomState {
        if (room.status === 'CLOSED') return room;
        const key = `${clueNumber}_${horizontal}`;
        room.revealedClues[playerId] = room.revealedClues[playerId] || [];
        if (!room.revealedClues[playerId].includes(key)) {
            room.revealedClues[playerId].push(key);
        }
        return room;
    }
    
    static closeRoom(room: RoomState): RoomState {
        room.status = 'CLOSED';
        return room;
    }
}

