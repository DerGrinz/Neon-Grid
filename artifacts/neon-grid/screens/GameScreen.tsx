import React, { useEffect, useRef } from 'react';
import { Dimensions, PanResponder, Platform, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import {
  BOARD_W, HORIZONTAL_BIAS, LONG_PRESS_MIN_DURATION,
  SWIPE_MIN_DISTANCE, TAP_MAX_DISTANCE, TAP_MAX_DURATION,
} from '@/game/constants';
import { useGame } from '@/context/GameContext';
import Playfield from '@/components/Playfield';
import HUD from '@/components/HUD';
import HoldSlot from '@/components/HoldSlot';
import NextQueue from '@/components/NextQueue';
import PauseOverlay from '@/components/PauseOverlay';

interface GameScreenProps {
  onGameOver: (score: number, lines: number, level: number) => void;
  onMenu: () => void;
}

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');

function computeCellSize(screenW: number, screenH: number, insetTop: number, insetBottom: number) {
  const maxFromWidth = Math.floor((screenW * 0.72) / BOARD_W);
  const availableH = screenH - insetTop - insetBottom - 100;
  const maxFromHeight = Math.floor(availableH / 20);
  return Math.min(maxFromWidth, maxFromHeight, 32);
}

export default function GameScreen({ onGameOver, onMenu }: GameScreenProps) {
  const insets = useSafeAreaInsets();
  const {
    state, startGame, pauseGame, resumeGame,
    setMoveInput, setRotateInput, setSoftDrop,
    triggerHardDrop, triggerHold,
    startDAS, stopDAS,
  } = useGame();

  const cellSize = computeCellSize(SCREEN_W, SCREEN_H, insets.top, insets.bottom);

  // Touch tracking — stored in refs so PanResponder callbacks never go stale
  const touchRef = useRef<{
    startX: number;
    startY: number;
    startTime: number;
    classified: boolean;
    longPressTimer: ReturnType<typeof setTimeout> | null;
  }>({ startX: 0, startY: 0, startTime: 0, classified: false, longPressTimer: null });

  useEffect(() => {
    if (state.status === 'gameover') {
      onGameOver(state.score, state.lines, state.level);
    }
  }, [state.status]);

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,

    onPanResponderGrant: (evt) => {
      const { pageX, pageY } = evt.nativeEvent;
      touchRef.current = {
        startX: pageX,
        startY: pageY,
        startTime: Date.now(),
        classified: false,
        longPressTimer: setTimeout(() => {
          // Long press: trigger hold (write to input buffer)
          if (!touchRef.current.classified) {
            touchRef.current.classified = true;
            triggerHold();
          }
        }, LONG_PRESS_MIN_DURATION),
      };
    },

    onPanResponderMove: (_, gestureState) => {
      if (touchRef.current.classified) return;
      const { dx, dy } = gestureState;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < SWIPE_MIN_DISTANCE) return;

      // Cancel long press timer — gesture is a swipe
      touchRef.current.classified = true;
      if (touchRef.current.longPressTimer) {
        clearTimeout(touchRef.current.longPressTimer);
        touchRef.current.longPressTimer = null;
      }

      const isHorizontal = Math.abs(dx) > HORIZONTAL_BIAS * Math.abs(dy);
      if (isHorizontal) {
        const dir = (dx > 0 ? 1 : -1) as 1 | -1;
        setMoveInput(dir);   // immediate single move (RAF loop will consume)
        startDAS(dir);       // start DAS/ARR
      } else if (dy > 0) {
        setSoftDrop(true);
      } else {
        triggerHardDrop();
        if (Platform.OS !== 'web') {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy).catch(() => {});
        }
      }
    },

    onPanResponderRelease: (_, gestureState) => {
      if (touchRef.current.longPressTimer) {
        clearTimeout(touchRef.current.longPressTimer);
        touchRef.current.longPressTimer = null;
      }

      // Always release DAS and soft drop on release
      stopDAS();
      setSoftDrop(false);

      // Tap: not classified as swipe → rotate
      if (!touchRef.current.classified) {
        const duration = Date.now() - touchRef.current.startTime;
        const dist = Math.sqrt(gestureState.dx ** 2 + gestureState.dy ** 2);
        if (duration < TAP_MAX_DURATION && dist < TAP_MAX_DISTANCE) {
          setRotateInput('CW');
        }
      }
      touchRef.current.classified = false;
    },

    onPanResponderTerminate: () => {
      if (touchRef.current.longPressTimer) {
        clearTimeout(touchRef.current.longPressTimer);
        touchRef.current.longPressTimer = null;
      }
      stopDAS();
      setSoftDrop(false);
      touchRef.current.classified = false;
    },
  });

  const isPaused = state.status === 'paused';

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <HUD onPause={pauseGame} />

      <View style={styles.gameArea} {...panResponder.panHandlers}>
        <View style={styles.sidebar}>
          <HoldSlot />
        </View>

        <Playfield cellSize={cellSize} />

        <View style={styles.sidebar}>
          <NextQueue />
        </View>
      </View>

      {isPaused && (
        <PauseOverlay
          onResume={resumeGame}
          onRestart={startGame}
          onMenu={onMenu}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0F2F5',
  },
  gameArea: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 4,
  },
  sidebar: {
    width: 60,
    alignItems: 'center',
    gap: 12,
  },
});
