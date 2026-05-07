import {
  Orbitron_700Bold,
  useFonts as useOrbitron,
} from '@expo-google-fonts/orbitron';
import {
  Rajdhani_600SemiBold,
  Rajdhani_700Bold,
  useFonts as useRajdhani,
} from '@expo-google-fonts/rajdhani';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import React, { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { ErrorBoundary } from '@/components/ErrorBoundary';
import { GameProvider } from '@/context/GameContext';
import { SettingsProvider } from '@/context/SettingsContext';

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

export default function RootLayout() {
  const [orbitronLoaded, orbitronError] = useOrbitron({ Orbitron_700Bold });
  const [rajdhaniLoaded, rajdhaniError] = useRajdhani({ Rajdhani_600SemiBold, Rajdhani_700Bold });

  const fontsLoaded = orbitronLoaded && rajdhaniLoaded;
  const fontError = orbitronError || rajdhaniError;

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) return null;

  return (
    <SafeAreaProvider>
      <ErrorBoundary>
        <QueryClientProvider client={queryClient}>
          <GestureHandlerRootView style={{ flex: 1 }}>
            <SettingsProvider>
              <GameProvider>
                <Stack screenOptions={{ headerShown: false }}>
                  <Stack.Screen name="index" />
                </Stack>
              </GameProvider>
            </SettingsProvider>
          </GestureHandlerRootView>
        </QueryClientProvider>
      </ErrorBoundary>
    </SafeAreaProvider>
  );
}
