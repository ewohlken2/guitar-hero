import { View, Text, StyleSheet, Pressable, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useEffect, useMemo, useRef, useState } from 'react';
import FallingNote from '../../src/components/FallingNote';
import { sampleSongs } from '../../src/constants/songs';
import { colors, spacing, fontSize } from '../../src/constants/theme';
import { useGameStore } from '../../src/stores/useGameStore';
import { useMockAudioDetection } from '../../src/hooks/useMockAudioDetection';

const TRAVEL_TIME = 3.5; // seconds from spawn to hit zone
const HIT_WINDOW = 0.25; // seconds around target time
const PERFECT_WINDOW = 0.1;

export default function GameScreen() {
  const { setSong, setLevel, startGame, endGame, addHit, addMiss, isPlaying, score, combo, hits, misses } = useGameStore();
  const { currentChord, start, stop } = useMockAudioDetection();
  const [currentTime, setCurrentTime] = useState(0);
  const [noteStatus, setNoteStatus] = useState<Record<string, 'upcoming' | 'hit' | 'miss'>>({});
  const [lastHit, setLastHit] = useState<'perfect' | 'good' | 'miss' | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const rafRef = useRef<number | null>(null);

  const song = sampleSongs[0];
  const level = song.levels[0];
  const screenHeight = Dimensions.get('window').height;
  const hitZoneY = screenHeight * 0.75;

  useEffect(() => {
    setSong(song);
    setLevel(level.levelNumber);
  }, [setSong, setLevel, song, level.levelNumber]);

  const notes = useMemo(() => level.chart, [level.chart]);

  useEffect(() => {
    if (!isPlaying) {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
      return;
    }

    startTimeRef.current = Date.now();

    const loop = () => {
      const elapsed = (Date.now() - (startTimeRef.current ?? Date.now())) / 1000;
      setCurrentTime(elapsed);
      rafRef.current = requestAnimationFrame(loop);
    };

    rafRef.current = requestAnimationFrame(loop);

    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };
  }, [isPlaying]);

  useEffect(() => {
    if (isPlaying) {
      start();
    } else {
      stop();
    }
  }, [isPlaying, start, stop]);

  useEffect(() => {
    if (!isPlaying) return;

    setNoteStatus((prev) => {
      let changed = false;
      const next = { ...prev };

      notes.forEach((note) => {
        const status = prev[note.id] ?? 'upcoming';
        if (status !== 'upcoming') return;

        const timeUntil = note.time - currentTime;
        const inWindow = Math.abs(timeUntil) <= HIT_WINDOW;

        if (inWindow && currentChord?.name === note.chord) {
          const isPerfect = Math.abs(timeUntil) <= PERFECT_WINDOW;
          next[note.id] = 'hit';
          changed = true;
          addHit(isPerfect ? 'perfect' : 'good');
          setLastHit(isPerfect ? 'perfect' : 'good');
          return;
        }

        if (timeUntil < -HIT_WINDOW) {
          next[note.id] = 'miss';
          changed = true;
          addMiss();
          setLastHit('miss');
        }
      });

      return changed ? next : prev;
    });
  }, [addHit, addMiss, currentChord?.name, currentTime, isPlaying, notes]);

  useEffect(() => {
    if (!lastHit) return;
    const timer = setTimeout(() => setLastHit(null), 700);
    return () => clearTimeout(timer);
  }, [lastHit]);

  const handleStart = () => {
    setNoteStatus({});
    setCurrentTime(0);
    setLastHit(null);
    startGame();
  };

  const handleStop = () => {
    endGame();
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Game Mode</Text>
        <Text style={styles.subtitle}>{song.title} · Level {level.levelNumber}</Text>
      </View>

      <View style={styles.scoreRow}>
        <Text style={styles.score}>Score {score}</Text>
        <Text style={styles.combo}>Combo {combo}</Text>
        <Text style={styles.stats}>H {hits} / M {misses}</Text>
      </View>

      <View style={styles.playfield}>
        <View style={[styles.hitZone, { top: hitZoneY }]}>
          <Text style={styles.hitZoneText}>HIT ZONE</Text>
        </View>

        {lastHit && (
          <View style={styles.hitToast}>
            <Text style={styles.hitToastText}>{lastHit.toUpperCase()}</Text>
          </View>
        )}

        {notes.map((note) => {
          const timeUntil = note.time - currentTime;
          const progress = 1 - timeUntil / TRAVEL_TIME;
          const y = Math.max(-100, Math.min(hitZoneY, progress * hitZoneY));
          const status = noteStatus[note.id] ?? 'upcoming';

          return <FallingNote key={note.id} label={note.chord} y={y} status={status} />;
        })}
      </View>

      <View style={styles.controls}>
        <Pressable onPress={isPlaying ? handleStop : handleStart} style={styles.button}>
          <Text style={styles.buttonText}>{isPlaying ? 'Stop' : 'Start'}</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: spacing.lg,
  },
  header: {
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
  },
  title: {
    fontSize: fontSize.xl,
    fontWeight: '700',
    color: colors.text,
  },
  subtitle: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  scoreRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: spacing.sm,
  },
  score: {
    color: colors.text,
    fontWeight: '700',
  },
  combo: {
    color: colors.good,
    fontWeight: '700',
  },
  stats: {
    color: colors.textSecondary,
  },
  playfield: {
    flex: 1,
    marginVertical: spacing.md,
    backgroundColor: colors.backgroundDark,
    borderRadius: 16,
    overflow: 'hidden',
  },
  hitZone: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 40,
    borderTopWidth: 2,
    borderBottomWidth: 2,
    borderColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  hitZoneText: {
    color: colors.primary,
    fontSize: fontSize.xs,
    letterSpacing: 2,
  },
  hitToast: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: '60%',
    alignItems: 'center',
  },
  hitToastText: {
    color: colors.text,
    fontSize: fontSize.lg,
    fontWeight: '800',
  },
  controls: {
    paddingBottom: spacing.lg,
  },
  button: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  buttonText: {
    color: colors.text,
    fontWeight: '700',
  },
});
