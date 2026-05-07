import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { PIECES, PieceType } from '@/game/tetrominoes';
import { useGame } from '@/context/GameContext';
import Block from './Block';

const MINI_CELL = 10;

export default function NextQueue() {
  const { state } = useGame();
  const next = state.queue.slice(0, 3);

  return (
    <View style={styles.container}>
      <Text style={styles.label}>NEXT</Text>
      {next.map((type, i) => (
        <View key={i} style={styles.pieceBox}>
          <MiniPiece type={type} />
        </View>
      ))}
    </View>
  );
}

function MiniPiece({ type }: { type: PieceType }) {
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
    color: '#6B7BA8',
    letterSpacing: 1.5,
  },
  pieceBox: {
    width: 44,
    height: 36,
    backgroundColor: '#0B0E1F',
    borderWidth: 1,
    borderColor: '#1a1f3a',
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  miniRow: {
    flexDirection: 'row',
  },
});
