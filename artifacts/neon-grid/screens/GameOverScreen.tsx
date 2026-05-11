import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useSettings } from '@/context/SettingsContext';

interface GameOverScreenProps {
  score: number;
  lines: number;
  level: number;
  onPlayAgain: () => void;
  onMenu: () => void;
}

export default function GameOverScreen({ score, lines, level, onPlayAgain, onMenu }: GameOverScreenProps) {
  const insets = useSafeAreaInsets();
  const { highScores, addHighScore } = useSettings();
  const [name, setName] = useState('');
  const [saved, setSaved] = useState(false);

  const isHighScore = highScores.length < 10 || score > (highScores[highScores.length - 1]?.score ?? 0);

  function handleSave() {
    if (!name.trim()) return;
    addHighScore({ name: name.trim().slice(0, 12).toUpperCase(), score, lines, level });
    setSaved(true);
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top + 40, paddingBottom: insets.bottom + 24 }]}>
      <View style={styles.header}>
        <Text style={styles.title}>GAME OVER</Text>
        {isHighScore && !saved && (
          <Text style={styles.newHighScore}>NEW HIGH SCORE!</Text>
        )}
      </View>

      <View style={styles.statsCard}>
        <StatRow label="SCORE" value={score.toLocaleString()} highlight />
        <View style={styles.divider} />
        <StatRow label="LEVEL" value={level.toString()} />
        <StatRow label="LINES" value={lines.toString()} />
      </View>

      {isHighScore && !saved && (
        <View style={styles.nameEntry}>
          <Text style={styles.nameLabel}>ENTER YOUR NAME</Text>
          <TextInput
            style={styles.nameInput}
            value={name}
            onChangeText={setName}
            maxLength={12}
            autoCapitalize="characters"
            placeholder="PLAYER"
            placeholderTextColor="#D0D5DD"
            autoFocus
          />
          <TouchableOpacity
            style={[styles.saveBtn, !name.trim() && styles.saveBtnDisabled]}
            onPress={handleSave}
            disabled={!name.trim()}
            activeOpacity={0.7}
          >
            <Text style={styles.saveBtnText}>SAVE SCORE</Text>
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.buttons}>
        <TouchableOpacity style={styles.btnPrimary} onPress={onPlayAgain} activeOpacity={0.75}>
          <Text style={styles.btnTextPrimary}>PLAY AGAIN</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.btn} onPress={onMenu} activeOpacity={0.75}>
          <Text style={styles.btnText}>MAIN MENU</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

function StatRow({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <View style={styles.statRow}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={[styles.statValue, highlight && styles.statValueHighlight]}>{value}</Text>
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
  header: {
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontFamily: 'Orbitron_700Bold',
    fontSize: 28,
    color: '#D000B8',
    letterSpacing: 4,
    textShadowColor: '#D000B8',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 16,
  },
  newHighScore: {
    fontFamily: 'Orbitron_700Bold',
    fontSize: 11,
    color: '#C8A800',
    letterSpacing: 3,
    textShadowColor: '#C8A800',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
  },
  statsCard: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D0D5DD',
    borderRadius: 8,
    padding: 20,
    gap: 12,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statLabel: {
    fontFamily: 'Orbitron_700Bold',
    fontSize: 10,
    color: '#5A6478',
    letterSpacing: 2,
  },
  statValue: {
    fontFamily: 'Rajdhani_700Bold',
    fontSize: 24,
    color: '#1A1A2E',
  },
  statValueHighlight: {
    color: '#0090A0',
    textShadowColor: '#0090A0',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  divider: {
    height: 1,
    backgroundColor: '#D0D5DD',
  },
  nameEntry: {
    width: '100%',
    gap: 10,
  },
  nameLabel: {
    fontFamily: 'Orbitron_700Bold',
    fontSize: 9,
    color: '#C8A800',
    letterSpacing: 2,
    textAlign: 'center',
  },
  nameInput: {
    borderWidth: 1,
    borderColor: '#C8A800',
    borderRadius: 4,
    paddingVertical: 12,
    paddingHorizontal: 16,
    fontFamily: 'Rajdhani_700Bold',
    fontSize: 20,
    color: '#1A1A2E',
    backgroundColor: '#FFFFFF',
    textAlign: 'center',
    letterSpacing: 3,
  },
  saveBtn: {
    borderWidth: 1,
    borderColor: '#C8A800',
    borderRadius: 4,
    paddingVertical: 14,
    alignItems: 'center',
    backgroundColor: 'rgba(255, 214, 0, 0.08)',
  },
  saveBtnDisabled: {
    opacity: 0.4,
  },
  saveBtnText: {
    fontFamily: 'Orbitron_700Bold',
    fontSize: 12,
    color: '#C8A800',
    letterSpacing: 2,
  },
  buttons: {
    width: '100%',
    gap: 10,
  },
  btnPrimary: {
    borderWidth: 1,
    borderColor: '#0090A0',
    borderRadius: 4,
    paddingVertical: 16,
    alignItems: 'center',
    backgroundColor: 'rgba(0, 144, 160, 0.08)',
  },
  btn: {
    borderWidth: 1,
    borderColor: '#D0D5DD',
    borderRadius: 4,
    paddingVertical: 16,
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  btnTextPrimary: {
    fontFamily: 'Orbitron_700Bold',
    fontSize: 13,
    color: '#0090A0',
    letterSpacing: 2,
  },
  btnText: {
    fontFamily: 'Orbitron_700Bold',
    fontSize: 13,
    color: '#5A6478',
    letterSpacing: 2,
  },
});
