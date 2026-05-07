import { BOARD_W, BOARD_H, BOARD_BUFFER_H, GRAVITY_MS, SCORE } from './constants';
import { PIECES, SPAWN_ROW, SPAWN_COL, getKicks, shuffleBag, PieceType } from './tetrominoes';

export type Cell = PieceType | null;
export type Board = Cell[][];

export interface ActivePiece {
  type: PieceType;
  rot: 0 | 1 | 2 | 3;
  row: number;
  col: number;
}

export const TOTAL_ROWS = BOARD_H + BOARD_BUFFER_H;

export function createEmptyBoard(): Board {
  return Array.from({ length: TOTAL_ROWS }, () => Array<Cell>(BOARD_W).fill(null));
}

export function getPieceCells(piece: ActivePiece): [number, number][] {
  return PIECES[piece.type][piece.rot].map(
    ([dr, dc]) => [piece.row + dr, piece.col + dc] as [number, number]
  );
}

export function isValidPos(
  board: Board,
  type: PieceType,
  rot: number,
  row: number,
  col: number
): boolean {
  for (const [dr, dc] of PIECES[type][rot]) {
    const r = row + dr;
    const c = col + dc;
    if (r < 0 || r >= TOTAL_ROWS || c < 0 || c >= BOARD_W) return false;
    if (board[r]?.[c] !== null) return false;
  }
  return true;
}

export function spawnPiece(board: Board, type: PieceType): ActivePiece | null {
  if (!isValidPos(board, type, 0, SPAWN_ROW, SPAWN_COL)) return null;
  return { type, rot: 0, row: SPAWN_ROW, col: SPAWN_COL };
}

export function getGhostRow(board: Board, piece: ActivePiece): number {
  let row = piece.row;
  while (isValidPos(board, piece.type, piece.rot, row + 1, piece.col)) {
    row++;
  }
  return row;
}

export function isOnGround(board: Board, piece: ActivePiece): boolean {
  return !isValidPos(board, piece.type, piece.rot, piece.row + 1, piece.col);
}

export function tryMove(
  board: Board,
  piece: ActivePiece,
  dx: number,
  dy: number
): ActivePiece | null {
  const newRow = piece.row + dy;
  const newCol = piece.col + dx;
  if (isValidPos(board, piece.type, piece.rot, newRow, newCol)) {
    return { ...piece, row: newRow, col: newCol };
  }
  return null;
}

export function tryRotate(
  board: Board,
  piece: ActivePiece,
  dir: 'CW' | 'CCW'
): ActivePiece | null {
  const nextRot = ((dir === 'CW' ? piece.rot + 1 : piece.rot + 3) % 4) as 0 | 1 | 2 | 3;
  const kicks = getKicks(piece.type, piece.rot, nextRot);
  for (const [dc, drUp] of kicks) {
    const newRow = piece.row - drUp;
    const newCol = piece.col + dc;
    if (isValidPos(board, piece.type, nextRot, newRow, newCol)) {
      return { ...piece, rot: nextRot, row: newRow, col: newCol };
    }
  }
  return null;
}

export function lockPieceOnBoard(board: Board, piece: ActivePiece): Board {
  const newBoard = board.map((row) => [...row]);
  for (const [r, c] of getPieceCells(piece)) {
    if (r >= 0 && r < TOTAL_ROWS && c >= 0 && c < BOARD_W) {
      newBoard[r][c] = piece.type;
    }
  }
  return newBoard;
}

export function clearLines(board: Board): { board: Board; cleared: number } {
  const filtered = board.filter((row) => row.some((cell) => cell === null));
  const cleared = TOTAL_ROWS - filtered.length;
  const emptyRows = Array.from({ length: cleared }, () => Array<Cell>(BOARD_W).fill(null));
  return { board: [...emptyRows, ...filtered], cleared };
}

export function calcLineScore(lines: number, level: number): number {
  switch (lines) {
    case 1: return SCORE.SINGLE * level;
    case 2: return SCORE.DOUBLE * level;
    case 3: return SCORE.TRIPLE * level;
    case 4: return SCORE.TETRIS * level;
    default: return 0;
  }
}

export function getGravityMs(level: number): number {
  const key = Math.min(level, 15);
  return GRAVITY_MS[key] ?? GRAVITY_MS[15];
}

export function buildInitialQueue(): { queue: PieceType[]; bag: PieceType[] } {
  let bag = shuffleBag();
  const queue: PieceType[] = [];
  for (let i = 0; i < 5; i++) {
    if (bag.length === 0) bag = shuffleBag();
    queue.push(bag.shift()!);
  }
  return { queue, bag };
}

export { shuffleBag };
