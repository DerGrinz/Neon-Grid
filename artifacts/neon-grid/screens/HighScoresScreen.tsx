import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useSettings } from '@/context/SettingsContext';

interface HighScoresScreenProps {
  onBack: () => void;
}

const RANK_COLORS = ['#C8A800', '#8090A0', '#D07000'];

export default function HighScoresScreen({ onBack }: HighScoresScreenProps) {
  const insets = useSafeAreaInsets();
  const { highScores } = useSettings();

  return (
    <View style={[styles.container, { paddingTop: insets.top + 20, paddingBottom: insets.bottom + 24 }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn} activeOpacity={0.7}>
          <Text style={styles.backText}>← BACK</Text>
        </TouchableOpacity>
        <Text style={styles.title}>HIGH SCORES</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {highScores.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyText}>NO SCORES YET</Text>
            <Text style={styles.emptySubText}>Play a game to set a record</Text>
          </View>
        ) : (
          highScores.map((entry, i) => (
            <View key={i} style={[styles.row, i === 0 && styles.rowFirst]}>
              <Text style={[styles.rank, { color: RANK_COLORS[i] ?? '#5A6478' }]}>
                #{i + 1}
              </Text>
              <View style={styles.rowInfo}>
                <Text style={styles.name}>{entry.name}</Text>
                <Text style={styles.date}>{entry.date} · LV{entry.level}</Text>
              </View>
              <View style={styles.rowScore}>
                <Text style={[styles.score, i === 0 && styles.scoreFirst]}>
                  {entry.score.toLocaleString()}
                </Text>
                <Text style={styles.lines}>{entry.lines}L</Text>
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0F2F5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  backBtn: {
    width: 60,
  },
  backText: {
    fontFamily: 'Orbitron_700Bold',
    fontSize: 10,
    color: '#5A6478',
    letterSpacing: 1,
  },
  title: {
    fontFamily: 'Orbitron_700Bold',
    fontSize: 14,
    color: '#0090A0',
    letterSpacing: 3,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    gap: 8,
  },
  empty: {
    alignItems: 'center',
    paddingTop: 80,
    gap: 8,
  },
  emptyText: {
    fontFamily: 'Orbitron_700Bold',
    fontSize: 14,
    color: '#5A6478',
    letterSpacing: 2,
  },
  emptySubText: {
    fontFamily: 'Rajdhani_600SemiBold',
    fontSize: 14,
    color: '#D0D5DD',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D0D5DD',
    borderRadius: 6,
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 12,
  },
  rowFirst: {
    borderColor: '#C8A800',
    backgroundColor: 'rgba(255, 214, 0, 0.04)',
  },
  rank: {
    fontFamily: 'Orbitron_700Bold',
    fontSize: 13,
    width: 28,
  },
  rowInfo: {
    flex: 1,
    gap: 2,
  },
  name: {
    fontFamily: 'Rajdhani_700Bold',
    fontSize: 16,
    color: '#1A1A2E',
    letterSpacing: 1,
  },
  date: {
    fontFamily: 'Rajdhani_600SemiBold',
    fontSize: 11,
    color: '#5A6478',
  },
  rowScore: {
    alignItems: 'flex-end',
    gap: 2,
  },
  score: {
    fontFamily: 'Rajdhani_700Bold',
    fontSize: 18,
    color: '#1A1A2E',
  },
  scoreFirst: {
    color: '#C8A800',
    textShadowColor: '#C8A800',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
  },
  lines: {
    fontFamily: 'Rajdhani_600SemiBold',
    fontSize: 11,
    color: '#5A6478',
  },
});
