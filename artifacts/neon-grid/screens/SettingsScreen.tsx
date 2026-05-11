import React, { useState } from 'react';
import { Alert, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useSettings } from '@/context/SettingsContext';

interface SettingsScreenProps {
  onBack: () => void;
}

export default function SettingsScreen({ onBack }: SettingsScreenProps) {
  const insets = useSafeAreaInsets();
  const { settings, updateSetting, resetHighScores } = useSettings();

  function confirmReset() {
    Alert.alert(
      'Reset High Scores',
      'Are you sure? This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Reset', style: 'destructive', onPress: resetHighScores },
      ]
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top + 20, paddingBottom: insets.bottom + 24 }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn} activeOpacity={0.7}>
          <Text style={styles.backText}>← BACK</Text>
        </TouchableOpacity>
        <Text style={styles.title}>SETTINGS</Text>
        <View style={{ width: 60 }} />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>GAMEPLAY</Text>
        <ToggleRow
          label="Vibration"
          value={settings.vibrationEnabled}
          onChange={(v) => updateSetting('vibrationEnabled', v)}
        />
        <ToggleRow
          label="Touch Buttons"
          value={settings.showTouchButtons}
          onChange={(v) => updateSetting('showTouchButtons', v)}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>DATA</Text>
        <TouchableOpacity style={styles.dangerBtn} onPress={confirmReset} activeOpacity={0.7}>
          <Text style={styles.dangerText}>RESET HIGH SCORES</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>SWIPE UP — HARD DROP</Text>
        <Text style={styles.footerText}>SWIPE DOWN — SOFT DROP</Text>
        <Text style={styles.footerText}>TAP — ROTATE CW</Text>
        <Text style={styles.footerText}>LONG PRESS — HOLD</Text>
      </View>
    </View>
  );
}

function ToggleRow({ label, value, onChange }: { label: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <View style={styles.toggleRow}>
      <Text style={styles.toggleLabel}>{label}</Text>
      <Switch
        value={value}
        onValueChange={onChange}
        trackColor={{ false: '#D0D5DD', true: 'rgba(0, 144, 160, 0.3)' }}
        thumbColor={value ? '#0090A0' : '#5A6478'}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0F2F5',
    paddingHorizontal: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 24,
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
  section: {
    marginBottom: 32,
    gap: 8,
  },
  sectionTitle: {
    fontFamily: 'Orbitron_700Bold',
    fontSize: 9,
    color: '#5A6478',
    letterSpacing: 2,
    marginBottom: 4,
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D0D5DD',
    borderRadius: 6,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  toggleLabel: {
    fontFamily: 'Rajdhani_600SemiBold',
    fontSize: 15,
    color: '#1A1A2E',
  },
  dangerBtn: {
    borderWidth: 1,
    borderColor: '#D000B8',
    borderRadius: 6,
    paddingVertical: 14,
    alignItems: 'center',
    backgroundColor: 'rgba(255, 0, 229, 0.05)',
  },
  dangerText: {
    fontFamily: 'Orbitron_700Bold',
    fontSize: 12,
    color: '#D000B8',
    letterSpacing: 2,
  },
  footer: {
    marginTop: 'auto',
    gap: 4,
    borderTopWidth: 1,
    borderTopColor: '#D0D5DD',
    paddingTop: 20,
  },
  footerText: {
    fontFamily: 'Rajdhani_600SemiBold',
    fontSize: 12,
    color: '#D0D5DD',
    letterSpacing: 1,
  },
});
