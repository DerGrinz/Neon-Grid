export const BOARD_W = 10;
export const BOARD_H = 20;
export const BOARD_BUFFER_H = 2;

export const DAS_MS = 167;
export const ARR_MS = 33;

export const SOFT_DROP_MULT = 20;

export const GRAVITY_MS: Record<number, number> = {
  1: 1000, 2: 793, 3: 618, 4: 473, 5: 355,
  6: 262, 7: 190, 8: 135, 9: 94, 10: 64,
  11: 43, 12: 28, 13: 18, 14: 11, 15: 7,
};

export const LOCK_DELAY_MS = 500;
export const LOCK_RESETS_MAX = 15;

export const SCORE = {
  SINGLE: 100, DOUBLE: 300, TRIPLE: 500, TETRIS: 800,
  SOFT_DROP_PER_CELL: 1, HARD_DROP_PER_CELL: 2,
} as const;

export const SWIPE_MIN_DISTANCE = 30;
export const SWIPE_MAX_DURATION = 300;
export const TAP_MAX_DURATION = 200;
export const TAP_MAX_DISTANCE = 10;
export const LONG_PRESS_MIN_DURATION = 400;
export const HORIZONTAL_BIAS = 1.5;
