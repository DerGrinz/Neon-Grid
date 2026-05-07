import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useGame } from '@/context/GameContext';

interface HUDProps {
  onPause: () => void;
}

export default function HUD({ onPause }: HUDProps) {
  const { state } = useGame();
  const { score, level, lines } = state;

  return (
    <View style={styles.container}>
      <View style={styles.stats}>
        <StatBox label="SCORE" value={score.toString().padStart(7, '0')} />
        <StatBox label="LEVEL" value={level.toString()} />
        <StatBox label="LINES" value={lines.toString()} />
      </View>
      <TouchableOpacity style={styles.pauseBtn} onPress={onPause} activeOpacity={0.7}>
        <Text style={styles.pauseIcon}>⏸</Text>
      </TouchableOpacity>
    </View>
  );
}

function StatBox({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.statBox}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={styles.statValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  stats: {
    flexDirection: 'row',
    gap: 16,
  },
  statBox: {
    alignItems: 'center',
  },
  statLabel: {
    fontFamily: 'Orbitron_700Bold',
    fontSize: 9,
    color: '#6B7BA8',
    letterSpacing: 1.5,
  },
  statValue: {
    fontFamily: 'Rajdhani_700Bold',
    fontSize: 20,
    color: '#00F0FF',
    letterSpacing: 1,
  },
  pauseBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#1a1f3a',
    borderRadius: 18,
  },
  pauseIcon: {
    fontSize: 16,
    color: '#6B7BA8',
  },
});
