# Phase 1 MVP Remaining Tasks Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Implement Tasks 9-15 (mock audio detection hook, Freeplay screen, sample songs, Game screen with falling notes, hit detection + scoring UI, Home navigation cards, and native module placeholders).

**Architecture:** Keep state in existing Zustand stores and drive UI from hooks/screens. Mock audio detection updates `useAudioStore` on an interval; Freeplay and Game consume store state. Game mode uses a simple time-based loop to compute note positions and hit detection without audio playback.

**Tech Stack:** React Native (Expo Router), TypeScript, Zustand, React Native Animated, Jest

---

### Task 9: Create mock audio detection hook

**Files:**

- Create: `GuitarSlam/src/utils/mockAudio.ts`
- Create: `GuitarSlam/src/hooks/useMockAudioDetection.ts`
- Test: `GuitarSlam/__tests__/utils/mockAudio.test.ts`

**Step 1: Write the failing test**

Create `GuitarSlam/__tests__/utils/mockAudio.test.ts`:

```ts
import { chords } from "../../src/constants/chords";
import { getMockDetectedChord } from "../../src/utils/mockAudio";

describe("getMockDetectedChord", () => {
  it("returns a deterministic chord from the list", () => {
    const first = getMockDetectedChord(0, 123);
    const second = getMockDetectedChord(chords.length, 456);

    expect(first.name).toBe(chords[0].primaryName);
    expect(first.notes).toEqual(chords[0].notes);
    expect(first.timestamp).toBe(123);

    // Wraps around
    expect(second.name).toBe(chords[0].primaryName);
    expect(second.timestamp).toBe(456);
  });
});
```

**Step 2: Run test to verify it fails**

Run: `pnpm test -- __tests__/utils/mockAudio.test.ts`
Expected: FAIL with "Cannot find module '../utils/mockAudio'"

**Step 3: Write minimal implementation**

Create `GuitarSlam/src/utils/mockAudio.ts`:

```ts
import { chords } from "../constants/chords";
import { DetectedChord } from "../types";

export const getMockDetectedChord = (
  index: number,
  timestamp = Date.now(),
): DetectedChord => {
  const chord = chords[index % chords.length];

  return {
    name: chord.primaryName,
    confidence: 0.82,
    notes: chord.notes,
    timestamp,
  };
};
```

Create `GuitarSlam/src/hooks/useMockAudioDetection.ts`:

```ts
import { useCallback, useEffect, useRef } from "react";
import { useAudioStore } from "../stores/useAudioStore";
import { getMockDetectedChord } from "../utils/mockAudio";

const TICK_MS = 900;

export const useMockAudioDetection = () => {
  const {
    isListening,
    currentChord,
    chordHistory,
    setListening,
    setCurrentChord,
    addToHistory,
    setError,
  } = useAudioStore();
  const indexRef = useRef(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const start = useCallback(() => {
    setError(null);
    setListening(true);
  }, [setError, setListening]);

  const stop = useCallback(() => {
    setListening(false);
  }, [setListening]);

  useEffect(() => {
    if (!isListening) {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      return;
    }

    timerRef.current = setInterval(() => {
      const chord = getMockDetectedChord(indexRef.current);
      indexRef.current += 1;
      setCurrentChord(chord);
      addToHistory(chord);
    }, TICK_MS);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [isListening, setCurrentChord, addToHistory]);

  return {
    isListening,
    currentChord,
    chordHistory,
    start,
    stop,
  };
};
```

**Step 4: Run test to verify it passes**

Run: `pnpm test -- __tests__/utils/mockAudio.test.ts`
Expected: PASS

**Step 5: Commit**

```bash
git add GuitarSlam/src/utils/mockAudio.ts GuitarSlam/src/hooks/useMockAudioDetection.ts GuitarSlam/__tests__/utils/mockAudio.test.ts
git commit -m "feat: add mock audio detection hook"
```

---

### Task 10: Build Freeplay Mode screen

**Files:**

- Modify: `GuitarSlam/app/(tabs)/freeplay.tsx`

**Step 1: Update screen UI to use mock detection hook**

Edit `GuitarSlam/app/(tabs)/freeplay.tsx`:

```tsx
import { View, Text, StyleSheet, Pressable, FlatList } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useMockAudioDetection } from "../../src/hooks/useMockAudioDetection";
import { colors, spacing, fontSize } from "../../src/constants/theme";

export default function FreeplayScreen() {
  const { isListening, currentChord, chordHistory, start, stop } =
    useMockAudioDetection();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Freeplay Mode</Text>
        <Text style={styles.subtitle}>
          Play any chord and see instant feedback
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>Detected Chord</Text>
        <Text style={styles.chordName}>{currentChord?.name ?? "—"}</Text>
        <Text style={styles.confidence}>
          Confidence:{" "}
          {currentChord ? `${Math.round(currentChord.confidence * 100)}%` : "—"}
        </Text>
      </View>

      <Pressable
        onPress={isListening ? stop : start}
        style={[
          styles.button,
          isListening ? styles.buttonStop : styles.buttonStart,
        ]}
      >
        <Text style={styles.buttonText}>
          {isListening ? "Stop Listening" : "Start Listening"}
        </Text>
      </Pressable>

      <View style={styles.history}>
        <Text style={styles.historyTitle}>Recent</Text>
        <FlatList
          data={chordHistory}
          keyExtractor={(item) => `${item.timestamp}`}
          renderItem={({ item }) => (
            <View style={styles.historyItem}>
              <Text style={styles.historyChord}>{item.name}</Text>
              <Text style={styles.historyNotes}>{item.notes.join("-")}</Text>
            </View>
          )}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: spacing.lg,
  },
  header: {
    marginBottom: spacing.lg,
  },
  title: {
    fontSize: fontSize.xl,
    fontWeight: "700",
    color: colors.text,
  },
  subtitle: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  card: {
    backgroundColor: colors.backgroundLight,
    borderRadius: 16,
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  label: {
    color: colors.textMuted,
    fontSize: fontSize.sm,
  },
  chordName: {
    color: colors.text,
    fontSize: fontSize.huge,
    fontWeight: "800",
    marginVertical: spacing.sm,
  },
  confidence: {
    color: colors.textSecondary,
    fontSize: fontSize.sm,
  },
  button: {
    paddingVertical: spacing.md,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: spacing.lg,
  },
  buttonStart: {
    backgroundColor: colors.primary,
  },
  buttonStop: {
    backgroundColor: colors.accent,
  },
  buttonText: {
    color: colors.text,
    fontWeight: "700",
  },
  history: {
    flex: 1,
  },
  historyTitle: {
    color: colors.text,
    fontSize: fontSize.md,
    fontWeight: "600",
    marginBottom: spacing.sm,
  },
  historyItem: {
    paddingVertical: spacing.sm,
    borderBottomColor: colors.backgroundLight,
    borderBottomWidth: 1,
  },
  historyChord: {
    color: colors.text,
    fontSize: fontSize.md,
    fontWeight: "600",
  },
  historyNotes: {
    color: colors.textSecondary,
    fontSize: fontSize.sm,
  },
});
```

**Step 2: Manual check**

Run: `pnpm start`
Expected: Freeplay screen shows current chord + history when Start Listening is tapped.

**Step 3: Commit**

```bash
git add GuitarSlam/app/(tabs)/freeplay.tsx
git commit -m "feat: build freeplay mode screen"
```

---

### Task 11: Create sample songs data

**Files:**

- Create: `GuitarSlam/src/constants/songs.ts`
- Test: `GuitarSlam/__tests__/constants/songs.test.ts`

**Step 1: Write the failing test**

Create `GuitarSlam/__tests__/constants/songs.test.ts`:

```ts
import { sampleSongs } from "../../src/constants/songs";

describe("sampleSongs", () => {
  it("includes at least 3 songs with charts", () => {
    expect(sampleSongs.length).toBeGreaterThanOrEqual(3);
    sampleSongs.forEach((song) => {
      expect(song.levels.length).toBeGreaterThan(0);
      song.levels.forEach((level) => {
        expect(level.chart.length).toBeGreaterThan(0);
      });
    });
  });

  it("has non-decreasing time order per chart", () => {
    sampleSongs.forEach((song) => {
      song.levels.forEach((level) => {
        const times = level.chart.map((note) => note.time);
        const sorted = [...times].sort((a, b) => a - b);
        expect(times).toEqual(sorted);
      });
    });
  });
});
```

**Step 2: Run test to verify it fails**

Run: `pnpm test -- __tests__/constants/songs.test.ts`
Expected: FAIL with "Cannot find module '../constants/songs'"

**Step 3: Write minimal implementation**

Create `GuitarSlam/src/constants/songs.ts`:

```ts
import { Song } from "../types";

export const sampleSongs: Song[] = [
  {
    id: "song-1",
    title: "Chord Parade",
    artist: "Practice Crew",
    difficulty: 2,
    bpm: 90,
    levels: [
      {
        levelNumber: 1,
        name: "Warmup",
        description: "Open chords at an easy tempo",
        chart: [
          { id: "s1-n1", chord: "C", time: 1.0, duration: 1.5 },
          { id: "s1-n2", chord: "G", time: 3.0, duration: 1.5 },
          { id: "s1-n3", chord: "Am", time: 5.0, duration: 1.5 },
          { id: "s1-n4", chord: "F", time: 7.0, duration: 1.5 },
          { id: "s1-n5", chord: "C", time: 9.0, duration: 1.5 },
          { id: "s1-n6", chord: "G", time: 11.0, duration: 1.5 },
        ],
      },
    ],
  },
  {
    id: "song-2",
    title: "Midnight Strum",
    artist: "Open Strings",
    difficulty: 3,
    bpm: 110,
    levels: [
      {
        levelNumber: 1,
        name: "Moonlight",
        description: "Smooth changes with steady timing",
        chart: [
          { id: "s2-n1", chord: "Em", time: 1.0, duration: 1.0 },
          { id: "s2-n2", chord: "G", time: 2.5, duration: 1.0 },
          { id: "s2-n3", chord: "D", time: 4.0, duration: 1.0 },
          { id: "s2-n4", chord: "C", time: 5.5, duration: 1.0 },
          { id: "s2-n5", chord: "Em", time: 7.0, duration: 1.0 },
          { id: "s2-n6", chord: "G", time: 8.5, duration: 1.0 },
          { id: "s2-n7", chord: "D", time: 10.0, duration: 1.0 },
        ],
      },
    ],
  },
  {
    id: "song-3",
    title: "Campfire Loop",
    artist: "Strum Circle",
    difficulty: 1,
    bpm: 80,
    levels: [
      {
        levelNumber: 1,
        name: "Easy Loop",
        description: "Slow and steady practice",
        chart: [
          { id: "s3-n1", chord: "A", time: 1.0, duration: 2.0 },
          { id: "s3-n2", chord: "D", time: 4.0, duration: 2.0 },
          { id: "s3-n3", chord: "E", time: 7.0, duration: 2.0 },
          { id: "s3-n4", chord: "A", time: 10.0, duration: 2.0 },
        ],
      },
    ],
  },
];
```

**Step 4: Run test to verify it passes**

Run: `pnpm test -- __tests__/constants/songs.test.ts`
Expected: PASS

**Step 5: Commit**

```bash
git add GuitarSlam/src/constants/songs.ts GuitarSlam/__tests__/constants/songs.test.ts
git commit -m "feat: add sample songs data"
```

---

### Task 12: Build Game Mode screen with falling notes

**Files:**

- Create: `GuitarSlam/src/components/FallingNote.tsx`
- Modify: `GuitarSlam/app/(tabs)/game.tsx`

**Step 1: Create falling note component**

Create `GuitarSlam/src/components/FallingNote.tsx`:

```tsx
import { View, Text, StyleSheet } from "react-native";
import { colors, spacing, fontSize, borderRadius } from "../constants/theme";

interface FallingNoteProps {
  label: string;
  y: number;
  status: "upcoming" | "hit" | "miss";
}

export default function FallingNote({ label, y, status }: FallingNoteProps) {
  return (
    <View
      style={[styles.note, { transform: [{ translateY: y }] }, styles[status]]}
    >
      <Text style={styles.noteText}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  note: {
    position: "absolute",
    left: spacing.lg,
    right: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    alignItems: "center",
  },
  noteText: {
    color: colors.text,
    fontSize: fontSize.md,
    fontWeight: "700",
  },
  upcoming: {
    backgroundColor: colors.backgroundLight,
  },
  hit: {
    backgroundColor: colors.success,
  },
  miss: {
    backgroundColor: colors.error,
  },
});
```

**Step 2: Add simple falling-note loop**

Edit `GuitarSlam/app/(tabs)/game.tsx`:

```tsx
import { View, Text, StyleSheet, Pressable, Dimensions } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useEffect, useMemo, useRef, useState } from "react";
import FallingNote from "../../src/components/FallingNote";
import { sampleSongs } from "../../src/constants/songs";
import { colors, spacing, fontSize } from "../../src/constants/theme";
import { useGameStore } from "../../src/stores/useGameStore";

const TRAVEL_TIME = 3.5; // seconds from spawn to hit zone
const HIT_WINDOW = 0.25; // seconds around target time

export default function GameScreen() {
  const {
    setSong,
    setLevel,
    startGame,
    endGame,
    isPlaying,
    score,
    combo,
    hits,
    misses,
  } = useGameStore();
  const [currentTime, setCurrentTime] = useState(0);
  const [noteStatus, setNoteStatus] = useState<
    Record<string, "upcoming" | "hit" | "miss">
  >({});
  const startTimeRef = useRef<number | null>(null);
  const rafRef = useRef<number | null>(null);

  const song = sampleSongs[0];
  const level = song.levels[0];
  const screenHeight = Dimensions.get("window").height;
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
      const elapsed =
        (Date.now() - (startTimeRef.current ?? Date.now())) / 1000;
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

  const handleStart = () => {
    setNoteStatus({});
    setCurrentTime(0);
    startGame();
  };

  const handleStop = () => {
    endGame();
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Game Mode</Text>
        <Text style={styles.subtitle}>
          {song.title} · Level {level.levelNumber}
        </Text>
      </View>

      <View style={styles.scoreRow}>
        <Text style={styles.score}>Score {score}</Text>
        <Text style={styles.combo}>Combo {combo}</Text>
        <Text style={styles.stats}>
          H {hits} / M {misses}
        </Text>
      </View>

      <View style={styles.playfield}>
        <View style={[styles.hitZone, { top: hitZoneY }]}>
          <Text style={styles.hitZoneText}>HIT ZONE</Text>
        </View>

        {notes.map((note) => {
          const timeUntil = note.time - currentTime;
          const progress = 1 - timeUntil / TRAVEL_TIME;
          const y = Math.max(-100, Math.min(hitZoneY, progress * hitZoneY));
          const status = noteStatus[note.id] ?? "upcoming";

          if (timeUntil < -HIT_WINDOW && status === "upcoming") {
            setNoteStatus((prev) => ({ ...prev, [note.id]: "miss" }));
          }

          return (
            <FallingNote
              key={note.id}
              label={note.chord}
              y={y}
              status={status}
            />
          );
        })}
      </View>

      <View style={styles.controls}>
        <Pressable
          onPress={isPlaying ? handleStop : handleStart}
          style={styles.button}
        >
          <Text style={styles.buttonText}>{isPlaying ? "Stop" : "Start"}</Text>
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
    fontWeight: "700",
    color: colors.text,
  },
  subtitle: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  scoreRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: spacing.sm,
  },
  score: {
    color: colors.text,
    fontWeight: "700",
  },
  combo: {
    color: colors.good,
    fontWeight: "700",
  },
  stats: {
    color: colors.textSecondary,
  },
  playfield: {
    flex: 1,
    marginVertical: spacing.md,
    backgroundColor: colors.backgroundDark,
    borderRadius: 16,
    overflow: "hidden",
  },
  hitZone: {
    position: "absolute",
    left: 0,
    right: 0,
    height: 40,
    borderTopWidth: 2,
    borderBottomWidth: 2,
    borderColor: colors.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  hitZoneText: {
    color: colors.primary,
    fontSize: fontSize.xs,
    letterSpacing: 2,
  },
  controls: {
    paddingBottom: spacing.lg,
  },
  button: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: spacing.md,
    alignItems: "center",
  },
  buttonText: {
    color: colors.text,
    fontWeight: "700",
  },
});
```

**Step 3: Manual check**

Run: `pnpm start`
Expected: Falling notes animate down the playfield and hit zone is visible.

**Step 4: Commit**

```bash
git add GuitarSlam/app/(tabs)/game.tsx GuitarSlam/src/components/FallingNote.tsx
git commit -m "feat: add falling notes game screen"
```

---

### Task 13: Implement hit detection and scoring UI

**Files:**

- Modify: `GuitarSlam/app/(tabs)/game.tsx`

**Step 1: Add hit detection against mock audio**

Edit `GuitarSlam/app/(tabs)/game.tsx` (extend the existing implementation):

```tsx
import { useAudioStore } from "../../src/stores/useAudioStore";
import { useMockAudioDetection } from "../../src/hooks/useMockAudioDetection";

const PERFECT_WINDOW = 0.1;

// inside GameScreen
const { currentChord } = useAudioStore();
useMockAudioDetection();

// inside map/render loop, replace miss-only logic with detection
const inWindow = Math.abs(timeUntil) <= HIT_WINDOW;
const isPerfect = Math.abs(timeUntil) <= PERFECT_WINDOW;
const alreadyResolved = status !== "upcoming";

if (inWindow && !alreadyResolved && currentChord?.name === note.chord) {
  setNoteStatus((prev) => ({ ...prev, [note.id]: "hit" }));
  addHit(isPerfect ? "perfect" : "good");
}

if (timeUntil < -HIT_WINDOW && status === "upcoming") {
  setNoteStatus((prev) => ({ ...prev, [note.id]: "miss" }));
  addMiss();
}
```

**Step 2: Add visual hit feedback UI**

Add a `lastHit` state to display "Perfect!" or "Good!" near the hit zone:

```tsx
const [lastHit, setLastHit] = useState<"perfect" | "good" | "miss" | null>(
  null,
);

// when hit
setLastHit(isPerfect ? "perfect" : "good");

// when miss
setLastHit("miss");

// in render
{
  lastHit && (
    <View style={styles.hitToast}>
      <Text style={styles.hitToastText}>{lastHit.toUpperCase()}</Text>
    </View>
  );
}
```

**Step 3: Manual check**

Run: `pnpm start`
Expected: When mock chords match notes in the hit window, score/combo increase and "PERFECT"/"GOOD" shows.

**Step 4: Commit**

```bash
git add GuitarSlam/app/(tabs)/game.tsx
git commit -m "feat: add hit detection and scoring UI"
```

---

### Task 14: Add Home screen with navigation cards

**Files:**

- Modify: `GuitarSlam/app/(tabs)/index.tsx`

**Step 1: Build navigation cards**

Edit `GuitarSlam/app/(tabs)/index.tsx`:

```tsx
import { View, Text, StyleSheet, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { colors, spacing, fontSize } from "../../src/constants/theme";

const cards = [
  {
    title: "Freeplay",
    description: "Practice chords with real-time feedback",
    route: "/(tabs)/freeplay",
  },
  {
    title: "Game Mode",
    description: "Play along with falling notes",
    route: "/(tabs)/game",
  },
  {
    title: "Library",
    description: "Browse chord diagrams",
    route: "/(tabs)/library",
  },
];

export default function HomeScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Real Guitar Hero</Text>
        <Text style={styles.subtitle}>Pick a mode to start practicing</Text>
      </View>

      {cards.map((card) => (
        <Pressable
          key={card.title}
          style={styles.card}
          onPress={() => router.push(card.route)}
        >
          <Text style={styles.cardTitle}>{card.title}</Text>
          <Text style={styles.cardDescription}>{card.description}</Text>
        </Pressable>
      ))}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: spacing.lg,
  },
  header: {
    marginBottom: spacing.lg,
  },
  title: {
    fontSize: fontSize.xl,
    fontWeight: "700",
    color: colors.text,
  },
  subtitle: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  card: {
    backgroundColor: colors.backgroundLight,
    borderRadius: 16,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  cardTitle: {
    color: colors.text,
    fontWeight: "700",
    fontSize: fontSize.lg,
  },
  cardDescription: {
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
});
```

**Step 2: Manual check**

Run: `pnpm start`
Expected: Home screen shows 3 tappable cards that navigate to each tab.

**Step 3: Commit**

```bash
git add GuitarSlam/app/(tabs)/index.tsx
git commit -m "feat: add home navigation cards"
```

---

### Task 15: Native audio module placeholder (iOS/Android)

**Files:**

- Create: `GuitarSlam/modules/audio-detection/README.md`
- Create: `GuitarSlam/modules/audio-detection/ios/AudioDetectionModule.swift`
- Create: `GuitarSlam/modules/audio-detection/android/src/main/java/com/GuitarSlam/audiodetection/AudioDetectionModule.kt`

**Step 1: Add placeholder README**

Create `GuitarSlam/modules/audio-detection/README.md`:

```md
# Audio Detection Module (Placeholder)

This folder reserves the native module for real-time chord detection.

- iOS: Swift module placeholder
- Android: Kotlin module placeholder

TODO: Implement audio capture + pitch detection and wire to JS.
```

**Step 2: Add iOS placeholder**

Create `GuitarSlam/modules/audio-detection/ios/AudioDetectionModule.swift`:

```swift
import Foundation

@objc(AudioDetectionModule)
class AudioDetectionModule: NSObject {
  @objc
  func start() {
    // TODO: Implement audio capture and chord detection
  }

  @objc
  func stop() {
    // TODO: Stop audio processing
  }
}
```

**Step 3: Add Android placeholder**

Create `GuitarSlam/modules/audio-detection/android/src/main/java/com/GuitarSlam/audiodetection/AudioDetectionModule.kt`:

```kotlin
package com.GuitarSlam.audiodetection

class AudioDetectionModule {
  fun start() {
    // TODO: Implement audio capture and chord detection
  }

  fun stop() {
    // TODO: Stop audio processing
  }
}
```

**Step 4: Manual check**

Run: `pnpm start`
Expected: App still runs; native placeholders are not referenced yet.

**Step 5: Commit**

```bash
git add GuitarSlam/modules/audio-detection
git commit -m "chore: add native audio module placeholders"
```
