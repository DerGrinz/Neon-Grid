import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';

export interface HighScore {
  name: string;
  score: number;
  lines: number;
  level: number;
  date: string;
}

export interface Settings {
  soundEnabled: boolean;
  vibrationEnabled: boolean;
  showTouchButtons: boolean;
}

interface SettingsContextValue {
  settings: Settings;
  highScores: HighScore[];
  updateSetting: <K extends keyof Settings>(key: K, value: Settings[K]) => void;
  addHighScore: (entry: Omit<HighScore, 'date'>) => void;
  resetHighScores: () => void;
}

const DEFAULT_SETTINGS: Settings = {
  soundEnabled: true,
  vibrationEnabled: true,
  showTouchButtons: false,
};

const SettingsContext = createContext<SettingsContextValue | null>(null);

const SETTINGS_KEY = '@neon_grid_settings';
const SCORES_KEY = '@neon_grid_scores';

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [highScores, setHighScores] = useState<HighScore[]>([]);

  useEffect(() => {
    AsyncStorage.multiGet([SETTINGS_KEY, SCORES_KEY]).then(([settingsResult, scoresResult]) => {
      if (settingsResult[1]) {
        try { setSettings(JSON.parse(settingsResult[1])); } catch {}
      }
      if (scoresResult[1]) {
        try { setHighScores(JSON.parse(scoresResult[1])); } catch {}
      }
    });
  }, []);

  const updateSetting = useCallback(<K extends keyof Settings>(key: K, value: Settings[K]) => {
    setSettings((prev) => {
      const next = { ...prev, [key]: value };
      AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const addHighScore = useCallback((entry: Omit<HighScore, 'date'>) => {
    setHighScores((prev) => {
      const newScore: HighScore = { ...entry, date: new Date().toLocaleDateString() };
      const next = [...prev, newScore]
        .sort((a, b) => b.score - a.score)
        .slice(0, 10);
      AsyncStorage.setItem(SCORES_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const resetHighScores = useCallback(() => {
    setHighScores([]);
    AsyncStorage.removeItem(SCORES_KEY);
  }, []);

  return (
    <SettingsContext.Provider value={{ settings, highScores, updateSetting, addHighScore, resetHighScores }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings(): SettingsContextValue {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error('useSettings must be used within SettingsProvider');
  return ctx;
}
