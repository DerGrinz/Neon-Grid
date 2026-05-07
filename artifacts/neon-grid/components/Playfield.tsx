import React, { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { BOARD_BUFFER_H, BOARD_H, BOARD_W } from '@/game/constants';
import { getPieceCells } from '@/game/engine';
import { PIECE_COLORS, PieceType } from '@/game/tetrominoes';
import { useGame } from '@/context/GameContext';
import Block from './Block';

interface PlayfieldProps {
  cellSize: number;
}

export default function Playfield({ cellSize }: PlayfieldProps) {
  const { state, ghostRow } = useGame();
  const { board, current } = state;

  const currentCells = useMemo(() => {
    if (!current) return new Set<string>();
    return new Set(getPieceCells(current).map(([r, c]) => `${r},${c}`));
  }, [current]);

  const ghostCells = useMemo(() => {
    if (!current || ghostRow === current.row) return new Set<string>();
    const ghost = { ...current, row: ghostRow };
    return new Set(getPieceCells(ghost).map(([r, c]) => `${r},${c}`));
  }, [current, ghostRow]);

  const playfieldWidth = cellSize * BOARD_W;
  const playfieldHeight = cellSize * BOARD_H;

  return (
    <View style={[styles.container, { width: playfieldWidth, height: playfieldHeight }]}>
      <View style={[styles.grid, { width: playfieldWidth }]}>
        {Array.from({ length: BOARD_H }, (_, visRow) => {
          const absRow = visRow + BOARD_BUFFER_H;
          return (
            <View key={visRow} style={styles.row}>
              {Array.from({ length: BOARD_W }, (_, col) => {
                const key = `${absRow},${col}`;
                let cellType: PieceType | 'ghost' | null = null;

                if (currentCells.has(key)) {
                  cellType = current!.type;
                } else if (ghostCells.has(key)) {
                  cellType = 'ghost';
                } else if (board[absRow]?.[col]) {
                  cellType = board[absRow][col] as PieceType;
                }

                return (
                  <Block key={col} type={cellType} size={cellSize} />
                );
              })}
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#0B0E1F',
    borderWidth: 1,
    borderColor: '#00F0FF',
    borderRadius: 2,
    overflow: 'hidden',
    shadowColor: '#00F0FF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 12,
    elevation: 8,
  },
  grid: {
    flexDirection: 'column',
  },
  row: {
    flexDirection: 'row',
  },
});
