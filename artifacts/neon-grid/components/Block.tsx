import React from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import { PIECE_COLORS, PieceType } from '@/game/tetrominoes';

interface BlockProps {
  type: PieceType | 'ghost' | null;
  size: number;
}

export default function Block({ type, size }: BlockProps) {
  if (!type) {
    return <View style={[styles.empty, { width: size, height: size }]} />;
  }

  const color = type === 'ghost'
    ? '#6B7BA8'
    : PIECE_COLORS[type as PieceType];

  if (type === 'ghost') {
    return (
      <View style={[{ width: size, height: size }, styles.ghostOuter]}>
        <View style={[
          styles.ghost,
          { width: size - 2, height: size - 2, borderColor: color },
        ]} />
      </View>
    );
  }

  return (
    <View style={[{ width: size, height: size }, styles.cellOuter]}>
      <View style={[
        styles.cell,
        {
          width: size - 1,
          height: size - 1,
          backgroundColor: color,
          ...Platform.select({
            ios: {
              shadowColor: color,
              shadowOffset: { width: 0, height: 0 },
              shadowOpacity: 0.9,
              shadowRadius: size * 0.4,
            },
            android: { elevation: 4 },
          }),
        },
      ]}>
        <View style={[styles.highlight, { backgroundColor: 'rgba(255,255,255,0.25)' }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  empty: {
    backgroundColor: 'transparent',
  },
  cellOuter: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  cell: {
    borderRadius: 1,
    overflow: 'hidden',
  },
  highlight: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: '50%',
    height: '45%',
  },
  ghostOuter: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  ghost: {
    borderWidth: 1,
    borderRadius: 1,
    opacity: 0.5,
  },
});
