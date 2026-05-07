import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useGame } from '@/context/GameContext';
import MenuScreen from '@/screens/MenuScreen';
import GameScreen from '@/screens/GameScreen';
import GameOverScreen from '@/screens/GameOverScreen';
import HighScoresScreen from '@/screens/HighScoresScreen';
import SettingsScreen from '@/screens/SettingsScreen';

type Screen = 'menu' | 'game' | 'gameover' | 'highscores' | 'settings';

interface GameResult {
  score: number;
  lines: number;
  level: number;
}

export default function RootScreen() {
  const [screen, setScreen] = useState<Screen>('menu');
  const [gameResult, setGameResult] = useState<GameResult>({ score: 0, lines: 0, level: 1 });
  const { startGame } = useGame();

  function handlePlay() {
    startGame();
    setScreen('game');
  }

  function handleGameOver(score: number, lines: number, level: number) {
    setGameResult({ score, lines, level });
    setScreen('gameover');
  }

  function handlePlayAgain() {
    startGame();
    setScreen('game');
  }

  function handleMenu() {
    setScreen('menu');
  }

  return (
    <View style={styles.root}>
      {screen === 'menu' && (
        <MenuScreen
          onPlay={handlePlay}
          onHighScores={() => setScreen('highscores')}
          onSettings={() => setScreen('settings')}
        />
      )}
      {screen === 'game' && (
        <GameScreen onGameOver={handleGameOver} onMenu={handleMenu} />
      )}
      {screen === 'gameover' && (
        <GameOverScreen
          score={gameResult.score}
          lines={gameResult.lines}
          level={gameResult.level}
          onPlayAgain={handlePlayAgain}
          onMenu={handleMenu}
        />
      )}
      {screen === 'highscores' && (
        <HighScoresScreen onBack={handleMenu} />
      )}
      {screen === 'settings' && (
        <SettingsScreen onBack={handleMenu} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#05060F',
  },
});
