import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import {
  ActivePiece, Board, Cell, TOTAL_ROWS,
  buildInitialQueue, calcLineScore, clearLines, createEmptyBoard,
  getGhostRow, getGravityMs, isOnGround, lockPieceOnBoard,
  spawnPiece, tryMove, tryRotate,
} from '@/game/engine';
import { PieceType, shuffleBag } from '@/game/tetrominoes';
import { BOARD_W, DAS_MS, ARR_MS, LOCK_DELAY_MS, LOCK_RESETS_MAX, SCORE, SOFT_DROP_MULT } from '@/game/constants';

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

interface GameContextValue {
  state: GameState;
  ghostRow: number;
  startGame: () => void;
  pauseGame: () => void;
  resumeGame: () => void;
  move: (dx: number) => void;
  rotatePiece: (dir: 'CW' | 'CCW') => void;
  setSoftDrop: (active: boolean) => void;
  doHardDrop: () => void;
  holdPiece: () => void;
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
  return {
    current: newPiece,
    queue: newQueue,
    bag: newBag,
    status: newPiece ? 'playing' : 'gameover',
  };
}

export function GameProvider({ children }: { children: React.ReactNode }) {
  const [state, setGameState] = useState<GameState>(createInitialState);

  const gravAccumRef = useRef(0);
  const lockTimerRef = useRef(0);
  const lockResetsRef = useRef(0);
  const lastTickRef = useRef(0);
  const softDropRef = useRef(false);
  const dasRef = useRef<{ dir: -1 | 0 | 1; accum: number; arrActive: boolean }>({
    dir: 0, accum: 0, arrActive: false,
  });

  const ghostRow = state.current
    ? getGhostRow(state.board, state.current)
    : 0;

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
    lastTickRef.current = Date.now();
    softDropRef.current = false;
    dasRef.current = { dir: 0, accum: 0, arrActive: false };

    setGameState({
      board, current, hold: null, holdUsed: false,
      queue, bag, score: 0, level: 1, lines: 0, status: 'playing',
    });
  }, []);

  const pauseGame = useCallback(() => {
    setGameState((prev) => prev.status === 'playing' ? { ...prev, status: 'paused' } : prev);
  }, []);

  const resumeGame = useCallback(() => {
    lastTickRef.current = Date.now();
    setGameState((prev) => prev.status === 'paused' ? { ...prev, status: 'playing' } : prev);
  }, []);

  const move = useCallback((dx: number) => {
    setGameState((prev) => {
      if (!prev.current || prev.status !== 'playing') return prev;
      const moved = tryMove(prev.board, prev.current, dx, 0);
      if (!moved) return prev;
      const wasOnGround = isOnGround(prev.board, prev.current);
      const stillOnGround = isOnGround(prev.board, moved);
      if (wasOnGround && stillOnGround && lockResetsRef.current < LOCK_RESETS_MAX) {
        lockTimerRef.current = 0;
        lockResetsRef.current++;
      }
      return { ...prev, current: moved };
    });
  }, []);

  const rotatePiece = useCallback((dir: 'CW' | 'CCW') => {
    setGameState((prev) => {
      if (!prev.current || prev.status !== 'playing') return prev;
      const rotated = tryRotate(prev.board, prev.current, dir);
      if (!rotated) return prev;
      const wasOnGround = isOnGround(prev.board, prev.current);
      const stillOnGround = isOnGround(prev.board, rotated);
      if (wasOnGround && stillOnGround && lockResetsRef.current < LOCK_RESETS_MAX) {
        lockTimerRef.current = 0;
        lockResetsRef.current++;
      }
      return { ...prev, current: rotated };
    });
  }, []);

  const setSoftDrop = useCallback((active: boolean) => {
    softDropRef.current = active;
  }, []);

  const doHardDrop = useCallback(() => {
    setGameState((prev) => {
      if (!prev.current || prev.status !== 'playing') return prev;
      const ghost = getGhostRow(prev.board, prev.current);
      const cellsDropped = ghost - prev.current.row;
      const dropped = { ...prev.current, row: ghost };
      let board = lockPieceOnBoard(prev.board, dropped);
      const { board: clearedBoard, cleared } = clearLines(board);
      board = clearedBoard;

      const addedScore = cellsDropped * SCORE.HARD_DROP_PER_CELL + calcLineScore(cleared, prev.level);
      const newLines = prev.lines + cleared;
      const newLevel = Math.max(prev.level, Math.floor(newLines / 10) + 1);

      gravAccumRef.current = 0;
      lockTimerRef.current = 0;
      lockResetsRef.current = 0;

      const spawned = spawnNext(board, prev.queue, prev.bag);
      return {
        ...prev,
        board,
        current: spawned.current,
        queue: spawned.queue,
        bag: spawned.bag,
        holdUsed: false,
        score: prev.score + addedScore,
        lines: newLines,
        level: newLevel,
        status: spawned.status,
      };
    });
  }, []);

  const holdPiece = useCallback(() => {
    setGameState((prev) => {
      if (!prev.current || prev.holdUsed || prev.status !== 'playing') return prev;
      const currentType = prev.current.type;

      let newPieceType: PieceType;
      let newQueue = prev.queue;
      let newBag = prev.bag;

      if (prev.hold === null) {
        newPieceType = newQueue[0];
        newQueue = newQueue.slice(1);
        let bag = [...newBag];
        while (newQueue.length < 5) {
          if (bag.length === 0) bag = shuffleBag();
          newQueue.push(bag.shift()!);
        }
        newBag = bag;
      } else {
        newPieceType = prev.hold;
      }

      const newPiece = spawnPiece(prev.board, newPieceType);

      gravAccumRef.current = 0;
      lockTimerRef.current = 0;
      lockResetsRef.current = 0;

      return {
        ...prev,
        current: newPiece,
        hold: currentType,
        holdUsed: true,
        queue: newQueue,
        bag: newBag,
        status: newPiece ? prev.status : 'gameover',
      };
    });
  }, []);

  const startDAS = useCallback((dir: -1 | 1) => {
    dasRef.current = { dir, accum: 0, arrActive: false };
  }, []);

  const stopDAS = useCallback(() => {
    dasRef.current = { dir: 0, accum: 0, arrActive: false };
  }, []);

  useEffect(() => {
    if (state.status !== 'playing') return;

    const interval = setInterval(() => {
      const now = Date.now();
      if (lastTickRef.current === 0) lastTickRef.current = now;
      const delta = Math.min(now - lastTickRef.current, 100);
      lastTickRef.current = now;

      setGameState((prev) => {
        if (prev.status !== 'playing' || !prev.current) return prev;

        let board = prev.board;
        let current = prev.current;
        let score = prev.score;
        let lines = prev.lines;
        let level = prev.level;
        let holdUsed = prev.holdUsed;
        let status: GameStatus = prev.status;
        let queue = prev.queue;
        let bag = prev.bag;

        const softMult = softDropRef.current ? SOFT_DROP_MULT : 1;
        gravAccumRef.current += delta * softMult;
        const gravMs = getGravityMs(level);

        while (gravAccumRef.current >= gravMs) {
          gravAccumRef.current -= gravMs;
          const moved = tryMove(board, current, 0, 1);
          if (moved) {
            current = moved;
            if (softDropRef.current) score += SCORE.SOFT_DROP_PER_CELL;
          } else {
            gravAccumRef.current = 0;
            break;
          }
        }

        if (isOnGround(board, current)) {
          lockTimerRef.current += delta;
          if (lockTimerRef.current >= LOCK_DELAY_MS || lockResetsRef.current >= LOCK_RESETS_MAX) {
            board = lockPieceOnBoard(board, current);
            const { board: clearedBoard, cleared } = clearLines(board);
            board = clearedBoard;

            const newLines = lines + cleared;
            const newLevel = Math.max(level, Math.floor(newLines / 10) + 1);
            score += calcLineScore(cleared, level);
            lines = newLines;
            level = newLevel;

            lockTimerRef.current = 0;
            lockResetsRef.current = 0;
            gravAccumRef.current = 0;

            const spawned = spawnNext(board, queue, bag);
            queue = spawned.queue;
            bag = spawned.bag;
            current = spawned.current!;
            holdUsed = false;
            status = spawned.status;

            if (status === 'gameover') {
              return { ...prev, board, current: null, queue, bag, score, lines, level, status };
            }
          }
        } else {
          lockTimerRef.current = 0;
        }

        if (dasRef.current.dir !== 0) {
          dasRef.current.accum += delta;
          const threshold = dasRef.current.arrActive ? ARR_MS : DAS_MS;
          while (dasRef.current.accum >= threshold) {
            dasRef.current.accum -= threshold;
            if (!dasRef.current.arrActive) dasRef.current.arrActive = true;
            const moved = tryMove(board, current, dasRef.current.dir, 0);
            if (moved) {
              const wasOnGround = isOnGround(board, current);
              const stillOnGround = isOnGround(board, moved);
              if (wasOnGround && stillOnGround && lockResetsRef.current < LOCK_RESETS_MAX) {
                lockTimerRef.current = 0;
                lockResetsRef.current++;
              }
              current = moved;
            } else {
              break;
            }
          }
        }

        return { ...prev, board, current, queue, bag, score, lines, level, holdUsed, status };
      });
    }, 16);

    return () => clearInterval(interval);
  }, [state.status]);

  return (
    <GameContext.Provider value={{
      state, ghostRow,
      startGame, pauseGame, resumeGame,
      move, rotatePiece, setSoftDrop, doHardDrop, holdPiece,
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
