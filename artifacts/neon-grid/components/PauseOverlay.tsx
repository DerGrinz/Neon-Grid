import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface PauseOverlayProps {
  onResume: () => void;
  onRestart: () => void;
  onMenu: () => void;
}

export default function PauseOverlay({ onResume, onRestart, onMenu }: PauseOverlayProps) {
  return (
    <View style={styles.overlay}>
      <Text style={styles.title}>PAUSED</Text>
      <View style={styles.buttons}>
        <PauseButton label="RESUME" onPress={onResume} primary />
        <PauseButton label="RESTART" onPress={onRestart} />
        <PauseButton label="MAIN MENU" onPress={onMenu} />
      </View>
    </View>
  );
}

function PauseButton({ label, onPress, primary }: { label: string; onPress: () => void; primary?: boolean }) {
  return (
    <TouchableOpacity
      style={[styles.btn, primary && styles.btnPrimary]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Text style={[styles.btnText, primary && styles.btnTextPrimary]}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(5, 6, 15, 0.92)',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 32,
    zIndex: 100,
  },
  title: {
    fontFamily: 'Orbitron_700Bold',
    fontSize: 32,
    color: '#00F0FF',
    letterSpacing: 6,
    textShadowColor: '#00F0FF',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 20,
  },
  buttons: {
    gap: 12,
    width: 220,
  },
  btn: {
    borderWidth: 1,
    borderColor: '#1a1f3a',
    borderRadius: 4,
    paddingVertical: 14,
    alignItems: 'center',
    backgroundColor: '#0B0E1F',
  },
  btnPrimary: {
    borderColor: '#00F0FF',
    backgroundColor: 'rgba(0, 240, 255, 0.1)',
  },
  btnText: {
    fontFamily: 'Orbitron_700Bold',
    fontSize: 13,
    color: '#6B7BA8',
    letterSpacing: 2,
  },
  btnTextPrimary: {
    color: '#00F0FF',
  },
});
