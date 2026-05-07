import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import {
  ActivePiece, Board,
  buildInitialQueue, calcLineScore, clearLines, createEmptyBoard,
  getGhostRow, getGravityMs, isOnGround, lockPieceOnBoard,
  spawnPiece, tryMove, tryRotate,
} from '@/game/engine';
import { PieceType, shuffleBag } from '@/game/tetrominoes';
import {
  ARR_MS, DAS_MS, LOCK_DELAY_MS, LOCK_RESETS_MAX, SCORE, SOFT_DROP_MULT,
} from '@/game/constants';

export type GameStatus = 'menu' | 'playing' | 'paused' | 'gameover';

export interface GameState {
  board: Board;
  current: ActivePiece | null;
  hold: PieceType | null;
  holdUsed: boolean;
  queue: PieceType[];
  bag: PieceType[];
  score: number;
  level: number;
  lines: number;
  status: GameStatus;
}

interface InputBuffer {
  moveX: number;
  rotate: 'CW' | 'CCW' | null;
  hardDrop: boolean;
  hold: boolean;
  softDrop: boolean;
  dasDir: -1 | 0 | 1;
}

interface GameContextValue {
  state: GameState;
  ghostRow: number;
  startGame: () => void;
  pauseGame: () => void;
  resumeGame: () => void;
  setMoveInput: (dx: number) => void;
  setRotateInput: (dir: 'CW' | 'CCW') => void;
  setSoftDrop: (active: boolean) => void;
  triggerHardDrop: () => void;
  triggerHold: () => void;
  startDAS: (dir: -1 | 1) => void;
  stopDAS: () => void;
}

const GameContext = createContext<GameContextValue | null>(null);

function createInitialState(): GameState {
  return {
    board: createEmptyBoard(),
    current: null,
    hold: null,
    holdUsed: false,
    queue: [],
    bag: [],
    score: 0,
    level: 1,
    lines: 0,
    status: 'menu',
  };
}

function spawnNext(
  board: Board,
  queue: PieceType[],
  bag: PieceType[]
): { current: ActivePiece | null; queue: PieceType[]; bag: PieceType[]; status: GameStatus } {
  const nextType = queue[0];
  let newQueue = queue.slice(1);
  let newBag = [...bag];
  while (newQueue.length < 5) {
    if (newBag.length === 0) newBag = shuffleBag();
    newQueue.push(newBag.shift()!);
  }
  const newPiece = spawnPiece(board, nextType);
  return { current: newPiece, queue: newQueue, bag: newBag, status: newPiece ? 'playing' : 'gameover' };
}

export function GameProvider({ children }: { children: React.ReactNode }) {
  const initialState = createInitialState();

  // Mutable game state — RAF loop reads/writes this directly (no stale closures)
  const gsRef = useRef<GameState>(initialState);

  // React state for rendering — synced from gsRef once per frame
  const [renderState, setRenderState] = useState<GameState>(initialState);

  // Input buffer — written by event handlers, consumed by RAF loop
  const inputRef = useRef<InputBuffer>({
    moveX: 0, rotate: null, hardDrop: false, hold: false, softDrop: false, dasDir: 0,
  });

  // Timing refs
  const rafRef = useRef<number>(0);
  const lastTimestampRef = useRef<number>(0);
  const gravAccumRef = useRef(0);
  const lockTimerRef = useRef(0);
  const lockResetsRef = useRef(0);
  const dasAccumRef = useRef(0);
  const dasArrActiveRef = useRef(false);

  const ghostRow = renderState.current
    ? getGhostRow(renderState.board, renderState.current)
    : 0;

  // ── Input API (write to buffer, no setState) ────────────────────────────
  const setMoveInput = useCallback((dx: number) => {
    inputRef.current.moveX = dx;
  }, []);

  const setRotateInput = useCallback((dir: 'CW' | 'CCW') => {
    inputRef.current.rotate = dir;
  }, []);

  const setSoftDrop = useCallback((active: boolean) => {
    inputRef.current.softDrop = active;
  }, []);

  const triggerHardDrop = useCallback(() => {
    inputRef.current.hardDrop = true;
  }, []);

  const triggerHold = useCallback(() => {
    inputRef.current.hold = true;
  }, []);

  const startDAS = useCallback((dir: -1 | 1) => {
    inputRef.current.dasDir = dir;
    dasAccumRef.current = 0;
    dasArrActiveRef.current = false;
  }, []);

  const stopDAS = useCallback(() => {
    inputRef.current.dasDir = 0;
    dasAccumRef.current = 0;
    dasArrActiveRef.current = false;
  }, []);

  // ── Game commands (called externally, modify gsRef immediately) ─────────
  const startGame = useCallback(() => {
    const board = createEmptyBoard();
    let bag = shuffleBag();
    const queue: PieceType[] = [];
    for (let i = 0; i < 6; i++) {
      if (bag.length === 0) bag = shuffleBag();
      queue.push(bag.shift()!);
    }
    const currentType = queue.shift()!;
    const current = spawnPiece(board, currentType);

    gravAccumRef.current = 0;
    lockTimerRef.current = 0;
    lockResetsRef.current = 0;
    lastTimestampRef.current = 0;
    dasAccumRef.current = 0;
    dasArrActiveRef.current = false;
    inputRef.current = { moveX: 0, rotate: null, hardDrop: false, hold: false, softDrop: false, dasDir: 0 };

    const next: GameState = { board, current, hold: null, holdUsed: false, queue, bag, score: 0, level: 1, lines: 0, status: 'playing' };
    gsRef.current = next;
    setRenderState(next);
  }, []);

  const pauseGame = useCallback(() => {
    if (gsRef.current.status !== 'playing') return;
    gsRef.current = { ...gsRef.current, status: 'paused' };
    setRenderState(gsRef.current);
  }, []);

  const resumeGame = useCallback(() => {
    if (gsRef.current.status !== 'paused') return;
    lastTimestampRef.current = 0;
    gsRef.current = { ...gsRef.current, status: 'playing' };
    setRenderState(gsRef.current);
  }, []);

  // ── RAF game loop ────────────────────────────────────────────────────────
  useEffect(() => {
    const loop = (timestamp: number) => {
      const s = gsRef.current;
      if (s.status !== 'playing') {
        rafRef.current = requestAnimationFrame(loop);
        return;
      }

      if (lastTimestampRef.current === 0) lastTimestampRef.current = timestamp;
      const delta = Math.min(timestamp - lastTimestampRef.current, 100);
      lastTimestampRef.current = timestamp;

      const inp = inputRef.current;
      let { board, current, hold, holdUsed, queue, bag, score, level, lines, status } = s;
      if (!current) {
        rafRef.current = requestAnimationFrame(loop);
        return;
      }

      // ── Hard drop ─────────────────────────────────────────────────
      if (inp.hardDrop) {
        inp.hardDrop = false;
        const ghost = getGhostRow(board, current);
        const cellsDropped = ghost - current.row;
        const dropped = { ...current, row: ghost };
        board = lockPieceOnBoard(board, dropped);
        const cl = clearLines(board);
        board = cl.board;
        const newLines = lines + cl.cleared;
        const newLevel = Math.max(level, Math.floor(newLines / 10) + 1);
        score += cellsDropped * SCORE.HARD_DROP_PER_CELL + calcLineScore(cl.cleared, level);
        lines = newLines; level = newLevel;
        gravAccumRef.current = 0; lockTimerRef.current = 0; lockResetsRef.current = 0; holdUsed = false;
        const sp = spawnNext(board, queue, bag);
        queue = sp.queue; bag = sp.bag; current = sp.current!; status = sp.status;
        if (status === 'gameover') {
          const next = { board, current: null, hold, holdUsed, queue, bag, score, level, lines, status };
          gsRef.current = next; setRenderState(next);
          rafRef.current = requestAnimationFrame(loop); return;
        }
      }

      // ── Hold ──────────────────────────────────────────────────────
      if (inp.hold && !holdUsed) {
        inp.hold = false;
        const currentType = current.type;
        let newPieceType: PieceType;
        let newQueue = queue;
        let newBag = bag;
        if (hold === null) {
          newPieceType = newQueue[0];
          newQueue = newQueue.slice(1);
          let b = [...newBag];
          while (newQueue.length < 5) { if (b.length === 0) b = shuffleBag(); newQueue.push(b.shift()!); }
          newBag = b;
        } else {
          newPieceType = hold;
        }
        const newPiece = spawnPiece(board, newPieceType);
        if (!newPiece) { status = 'gameover'; }
        else { current = newPiece; hold = currentType; holdUsed = true; queue = newQueue; bag = newBag; }
        gravAccumRef.current = 0; lockTimerRef.current = 0; lockResetsRef.current = 0;
        inp.hold = false;
      } else {
        inp.hold = false;
      }

      if (status === 'gameover') {
        const next = { board, current: null, hold, holdUsed, queue, bag, score, level, lines, status };
        gsRef.current = next; setRenderState(next);
        rafRef.current = requestAnimationFrame(loop); return;
      }

      // ── Rotate ────────────────────────────────────────────────────
      if (inp.rotate) {
        const rotated = tryRotate(board, current, inp.rotate);
        if (rotated) {
          const wasOnGround = isOnGround(board, current);
          const stillOnGround = isOnGround(board, rotated);
          if (wasOnGround && stillOnGround && lockResetsRef.current < LOCK_RESETS_MAX) {
            lockTimerRef.current = 0; lockResetsRef.current++;
          }
          current = rotated;
        }
        inp.rotate = null;
      }

      // ── Immediate move (single tap / swipe) ──────────────────────
      if (inp.moveX !== 0) {
        const moved = tryMove(board, current, inp.moveX, 0);
        if (moved) {
          const wasOnGround = isOnGround(board, current);
          const stillOnGround = isOnGround(board, moved);
          if (wasOnGround && stillOnGround && lockResetsRef.current < LOCK_RESETS_MAX) {
            lockTimerRef.current = 0; lockResetsRef.current++;
          }
          current = moved;
        }
        inp.moveX = 0;
      }

      // ── DAS / ARR ────────────────────────────────────────────────
      if (inp.dasDir !== 0) {
        dasAccumRef.current += delta;
        const threshold = dasArrActiveRef.current ? ARR_MS : DAS_MS;
        while (dasAccumRef.current >= threshold) {
          dasAccumRef.current -= threshold;
          if (!dasArrActiveRef.current) dasArrActiveRef.current = true;
          const moved = tryMove(board, current, inp.dasDir, 0);
          if (moved) {
            const wasOnGround = isOnGround(board, current);
            const stillOnGround = isOnGround(board, moved);
            if (wasOnGround && stillOnGround && lockResetsRef.current < LOCK_RESETS_MAX) {
              lockTimerRef.current = 0; lockResetsRef.current++;
            }
            current = moved;
          } else break;
        }
      }

      // ── Gravity ──────────────────────────────────────────────────
      const softMult = inp.softDrop ? SOFT_DROP_MULT : 1;
      gravAccumRef.current += delta * softMult;
      const gravMs = getGravityMs(level);
      while (gravAccumRef.current >= gravMs) {
        gravAccumRef.current -= gravMs;
        const moved = tryMove(board, current, 0, 1);
        if (moved) {
          current = moved;
          if (inp.softDrop) score += SCORE.SOFT_DROP_PER_CELL;
        } else {
          gravAccumRef.current = 0;
          break;
        }
      }

      // ── Lock delay ───────────────────────────────────────────────
      if (isOnGround(board, current)) {
        lockTimerRef.current += delta;
        if (lockTimerRef.current >= LOCK_DELAY_MS || lockResetsRef.current >= LOCK_RESETS_MAX) {
          board = lockPieceOnBoard(board, current);
          const cl = clearLines(board);
          board = cl.board;
          const newLines = lines + cl.cleared;
          const newLevel = Math.max(level, Math.floor(newLines / 10) + 1);
          score += calcLineScore(cl.cleared, level);
          lines = newLines; level = newLevel;
          gravAccumRef.current = 0; lockTimerRef.current = 0; lockResetsRef.current = 0; holdUsed = false;
          const sp = spawnNext(board, queue, bag);
          queue = sp.queue; bag = sp.bag; current = sp.current!; status = sp.status;
        }
      } else {
        lockTimerRef.current = 0;
      }

      // ── Sync to React ────────────────────────────────────────────
      const next: GameState = { board, current: status === 'gameover' ? null : current, hold, holdUsed, queue, bag, score, level, lines, status };
      gsRef.current = next;
      setRenderState(next);

      rafRef.current = requestAnimationFrame(loop);
    };

    rafRef.current = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(rafRef.current);
      lastTimestampRef.current = 0;
    };
  }, []);

  return (
    <GameContext.Provider value={{
      state: renderState, ghostRow,
      startGame, pauseGame, resumeGame,
      setMoveInput, setRotateInput, setSoftDrop,
      triggerHardDrop, triggerHold,
      startDAS, stopDAS,
    }}>
      {children}
    </GameContext.Provider>
  );
}

export function useGame(): GameContextValue {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error('useGame must be used within GameProvider');
  return ctx;
}
