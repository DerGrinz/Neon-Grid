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
          <MiniBlock color="#0090A0" />
          <MiniBlock color="#0090A0" />
          <MiniBlock color="#0090A0" />
          <MiniBlock color="#0090A0" />
        </Animated.View>
        <Animated.Text style={[styles.title, { opacity: glowAnim }]}>
          NEON
        </Animated.Text>
        <Text style={styles.titleSub}>GRID</Text>
        <View style={styles.tetroRow2}>
          <MiniBlock color="#7000CC" />
          <MiniBlock color="#7000CC" />
          <MiniBlock color="#7000CC" />
          <View style={styles.miniBlockGap} />
          <MiniBlock color="#D000B8" />
          <MiniBlock color="#D000B8" />
          <View style={styles.miniBlockGap} />
          <MiniBlock color="#C8A800" />
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
    backgroundColor: '#F0F2F5',
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
    color: '#0090A0',
    letterSpacing: 10,
    textShadowColor: '#0090A0',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 24,
  },
  titleSub: {
    fontFamily: 'Orbitron_700Bold',
    fontSize: 32,
    color: '#7000CC',
    letterSpacing: 20,
    textShadowColor: '#7000CC',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 16,
  },
  menuButtons: {
    width: '100%',
    gap: 10,
  },
  btn: {
    borderWidth: 1,
    borderColor: '#D0D5DD',
    borderRadius: 4,
    paddingVertical: 16,
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  btnPrimary: {
    borderColor: '#0090A0',
    backgroundColor: 'rgba(0, 144, 160, 0.08)',
  },
  btnText: {
    fontFamily: 'Orbitron_700Bold',
    fontSize: 13,
    color: '#5A6478',
    letterSpacing: 2,
  },
  btnTextPrimary: {
    color: '#0090A0',
    textShadowColor: '#0090A0',
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
    color: '#5A6478',
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
    color: '#5A6478',
  },
});
