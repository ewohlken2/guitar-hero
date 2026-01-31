import React, { useEffect, useState, useCallback, useRef } from 'react';
import { View, Text, StyleSheet, SafeAreaView, Pressable } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useEditorStore } from '../../../src/stores/useEditorStore';
import NoteLane from '../../../src/components/NoteLane';
import { ScoreDisplay } from '../../../src/components/ScoreDisplay';
import { ComboDisplay } from '../../../src/components/ComboDisplay';
import { HitFeedback } from '../../../src/components/HitFeedback';
import { colors, spacing, fontSize, borderRadius } from '../../../src/constants/theme';
import { HitType } from '../../../src/types';

const HIT_ZONE_Y = 240;

export default function PreviewScreen() {
  const router = useRouter();
  useLocalSearchParams<{ songId: string }>();
  const { song } = useEditorStore();

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [lastHit, setLastHit] = useState<HitType | null>(null);

  const animationRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);

  const startPreview = useCallback(() => {
    setIsPlaying(true);
    setCurrentTime(0);
    setScore(0);
    setCombo(0);
    setLastHit(null);
    startTimeRef.current = Date.now();

    const animate = () => {
      const elapsed = (Date.now() - startTimeRef.current) / 1000;
      setCurrentTime(elapsed);

      const maxTime =
        song?.levels[0].chart.reduce(
          (max, note) => Math.max(max, note.time + note.duration),
          0,
        ) ?? 0;

      if (elapsed < maxTime + 2) {
        animationRef.current = requestAnimationFrame(animate);
      } else {
        setIsPlaying(false);
      }
    };

    animationRef.current = requestAnimationFrame(animate);
  }, [song]);

  const stopPreview = useCallback(() => {
    setIsPlaying(false);
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
  }, []);

  useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  if (!song) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.errorText}>No song to preview</Text>
      </SafeAreaView>
    );
  }

  const chart = song.levels[0].chart;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>{song.title}</Text>
          <Text style={styles.subtitle}>
            {song.artist} - {song.bpm} BPM
          </Text>
        </View>
        <View style={styles.statsRow}>
          <ScoreDisplay score={score} />
          <ComboDisplay combo={combo} />
        </View>
      </View>

      <View style={styles.gameArea}>
        <NoteLane notes={chart} currentTime={currentTime} hitZoneY={HIT_ZONE_Y} />
        {lastHit && <HitFeedback type={lastHit} />}
      </View>

      <View style={styles.controls}>
        {!isPlaying ? (
          <Pressable style={styles.playButton} onPress={startPreview}>
            <Text style={styles.playButtonText}>Play Preview</Text>
          </Pressable>
        ) : (
          <Pressable style={styles.stopButton} onPress={stopPreview}>
            <Text style={styles.stopButtonText}>Stop</Text>
          </Pressable>
        )}

        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>Back to Editor</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    padding: spacing.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: colors.textMuted,
  },
  title: {
    color: colors.textPrimary,
    fontSize: fontSize.xl,
    fontWeight: '700',
  },
  subtitle: {
    color: colors.textSecondary,
    fontSize: fontSize.sm,
  },
  statsRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  gameArea: {
    flex: 1,
    position: 'relative',
  },
  controls: {
    padding: spacing.md,
    gap: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.textMuted,
  },
  playButton: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
  },
  playButtonText: {
    color: colors.backgroundDark,
    fontSize: fontSize.lg,
    fontWeight: '700',
  },
  stopButton: {
    backgroundColor: colors.accent,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
  },
  stopButtonText: {
    color: colors.textPrimary,
    fontSize: fontSize.lg,
    fontWeight: '700',
  },
  backButton: {
    backgroundColor: colors.backgroundLight,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  backButtonText: {
    color: colors.textPrimary,
    fontSize: fontSize.md,
  },
  errorText: {
    color: colors.accent,
    fontSize: fontSize.lg,
    textAlign: 'center',
    marginTop: spacing.xl,
  },
});
