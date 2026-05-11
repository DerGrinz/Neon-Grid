import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { PIECES, PIECE_COLORS, PieceType } from '@/game/tetrominoes';
import { useGame } from '@/context/GameContext';
import Block from './Block';

const MINI_CELL = 12;

export default function HoldSlot() {
  const { state } = useGame();
  const { hold, holdUsed } = state;

  return (
    <View style={styles.container}>
      <Text style={styles.label}>HOLD</Text>
      <View style={[styles.preview, holdUsed && styles.dimmed]}>
        <MiniPiece type={hold} />
      </View>
    </View>
  );
}

function MiniPiece({ type }: { type: PieceType | null }) {
  if (!type) {
    return <View style={styles.emptyGrid} />;
  }
  const cells = PIECES[type][0];
  const maxRow = Math.max(...cells.map(([r]) => r));
  const maxCol = Math.max(...cells.map(([, c]) => c));
  const cellSet = new Set(cells.map(([r, c]) => `${r},${c}`));

  return (
    <View>
      {Array.from({ length: maxRow + 1 }, (_, r) => (
        <View key={r} style={styles.miniRow}>
          {Array.from({ length: maxCol + 1 }, (_, c) => (
            <Block key={c} type={cellSet.has(`${r},${c}`) ? type : null} size={MINI_CELL} />
          ))}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: 4,
  },
  label: {
    fontFamily: 'Orbitron_700Bold',
    fontSize: 8,
    color: '#5A6478',
    letterSpacing: 1.5,
  },
  preview: {
    width: 52,
    height: 44,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D0D5DD',
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dimmed: {
    opacity: 0.35,
  },
  emptyGrid: {
    width: 36,
    height: 24,
  },
  miniRow: {
    flexDirection: 'row',
  },
});
