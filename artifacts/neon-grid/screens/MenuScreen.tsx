import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface MenuScreenProps {
  onPlay: () => void;
  onHighScores: () => void;
  onSettings: () => void;
}

export default function MenuScreen({ onPlay, onHighScores, onSettings }: MenuScreenProps) {
  const insets = useSafeAreaInsets();
  const glowAnim = useRef(new Animated.Value(0.4)).current;
  const floatAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, { toValue: 1, duration: 1400, useNativeDriver: false }),
        Animated.timing(glowAnim, { toValue: 0.4, duration: 1400, useNativeDriver: false }),
      ])
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, { toValue: -8, duration: 2000, useNativeDriver: false }),
        Animated.timing(floatAnim, { toValue: 8, duration: 2000, useNativeDriver: false }),
      ])
    ).start();
  }, []);

  return (
    <View style={[styles.container, { paddingTop: insets.top + 40, paddingBottom: insets.bottom + 24 }]}>
      <View style={styles.logoArea}>
        <Animated.View style={[styles.tetroRow, { transform: [{ translateY: floatAnim }] }]}>
          <MiniBlock color="#00F0FF" />
          <MiniBlock color="#00F0FF" />
          <MiniBlock color="#00F0FF" />
          <MiniBlock color="#00F0FF" />
        </Animated.View>
        <Animated.Text style={[styles.title, { opacity: glowAnim }]}>
          NEON
        </Animated.Text>
        <Text style={styles.titleSub}>GRID</Text>
        <View style={styles.tetroRow2}>
          <MiniBlock color="#8B00FF" />
          <MiniBlock color="#8B00FF" />
          <MiniBlock color="#8B00FF" />
          <View style={styles.miniBlockGap} />
          <MiniBlock color="#FF00E5" />
          <MiniBlock color="#FF00E5" />
          <View style={styles.miniBlockGap} />
          <MiniBlock color="#FFD600" />
        </View>
      </View>

      <View style={styles.menuButtons}>
        <MenuButton label="PLAY" onPress={onPlay} primary />
        <MenuButton label="HIGH SCORES" onPress={onHighScores} />
        <MenuButton label="SETTINGS" onPress={onSettings} />
      </View>

      <View style={styles.controls}>
        <Text style={styles.controlsTitle}>CONTROLS</Text>
        <View style={styles.controlGrid}>
          <ControlRow icon="👆" label="Tap — Rotate" />
          <ControlRow icon="⬅️" label="Swipe Left/Right — Move" />
          <ControlRow icon="⬇️" label="Swipe Down — Soft Drop" />
          <ControlRow icon="⬆️" label="Swipe Up — Hard Drop" />
          <ControlRow icon="⏱️" label="Long Press — Hold" />
        </View>
      </View>
    </View>
  );
}

function MiniBlock({ color }: { color: string }) {
  return (
    <View style={[styles.miniBlock, {
      backgroundColor: color,
      shadowColor: color,
      shadowOpacity: 0.8,
      shadowRadius: 6,
      shadowOffset: { width: 0, height: 0 },
    }]} />
  );
}

function MenuButton({ label, onPress, primary }: { label: string; onPress: () => void; primary?: boolean }) {
  return (
    <TouchableOpacity
      style={[styles.btn, primary && styles.btnPrimary]}
      onPress={onPress}
      activeOpacity={0.75}
    >
      <Text style={[styles.btnText, primary && styles.btnTextPrimary]}>{label}</Text>
    </TouchableOpacity>
  );
}

function ControlRow({ icon, label }: { icon: string; label: string }) {
  return (
    <View style={styles.controlRow}>
      <Text style={styles.controlLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#05060F',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
  },
  logoArea: {
    alignItems: 'center',
    gap: 4,
  },
  tetroRow: {
    flexDirection: 'row',
    gap: 3,
    marginBottom: 12,
  },
  tetroRow2: {
    flexDirection: 'row',
    gap: 3,
    marginTop: 10,
  },
  miniBlock: {
    width: 14,
    height: 14,
    borderRadius: 2,
  },
  miniBlockGap: {
    width: 3,
  },
  title: {
    fontFamily: 'Orbitron_700Bold',
    fontSize: 52,
    color: '#00F0FF',
    letterSpacing: 10,
    textShadowColor: '#00F0FF',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 24,
  },
  titleSub: {
    fontFamily: 'Orbitron_700Bold',
    fontSize: 32,
    color: '#8B00FF',
    letterSpacing: 20,
    textShadowColor: '#8B00FF',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 16,
  },
  menuButtons: {
    width: '100%',
    gap: 10,
  },
  btn: {
    borderWidth: 1,
    borderColor: '#1a1f3a',
    borderRadius: 4,
    paddingVertical: 16,
    alignItems: 'center',
    backgroundColor: '#0B0E1F',
  },
  btnPrimary: {
    borderColor: '#00F0FF',
    backgroundColor: 'rgba(0, 240, 255, 0.08)',
  },
  btnText: {
    fontFamily: 'Orbitron_700Bold',
    fontSize: 13,
    color: '#6B7BA8',
    letterSpacing: 2,
  },
  btnTextPrimary: {
    color: '#00F0FF',
    textShadowColor: '#00F0FF',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
  },
  controls: {
    width: '100%',
    gap: 8,
  },
  controlsTitle: {
    fontFamily: 'Orbitron_700Bold',
    fontSize: 9,
    color: '#6B7BA8',
    letterSpacing: 2,
    textAlign: 'center',
  },
  controlGrid: {
    gap: 3,
  },
  controlRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  controlLabel: {
    fontFamily: 'Rajdhani_600SemiBold',
    fontSize: 13,
    color: '#6B7BA8',
  },
});
