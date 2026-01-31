# Phase 1 MVP Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a working MVP with basic audio capture, monophonic pitch detection, freeplay mode, chord library (50 chords), and simple game mode with 3 pre-bundled songs.

**Architecture:** React Native + Expo SDK 52+ with TypeScript, Expo Router for navigation, native audio modules for pitch detection (iOS Swift, Android Kotlin), Zustand for state management.

**Tech Stack:** Expo, TypeScript, Expo Router, Expo Dev Client, React Native Reanimated, Zustand, AsyncStorage, Jest

---

## Prerequisites

- Node.js LTS installed
- Git installed
- EAS CLI installed globally (`npm install -g eas-cli`)
- Expo account created (for EAS builds)
- iPhone for testing (connected to same WiFi as dev machine)

---

## Task 1: Initialize Expo Project

**Files:**

- Create: `GuitarSlam/` (project directory)
- Create: `GuitarSlam/package.json`
- Create: `GuitarSlam/app.json`
- Create: `GuitarSlam/tsconfig.json`

**Step 1: Create Expo project**

Run:

```bash
wsl
cd ~/projects/guitar-slam
npx create-expo-app@latest GuitarSlam --template blank-typescript
```

Expected: Project created with TypeScript template

**Step 2: Navigate to project directory**

Run:

```bash
cd GuitarSlam
```

**Step 3: Install core dependencies**

Run:

```bash
npx expo install expo-router expo-dev-client expo-linking expo-constants expo-status-bar react-native-safe-area-context react-native-screens react-native-gesture-handler react-native-reanimated
```

Expected: Dependencies installed successfully

**Step 4: Install additional dependencies**

Run:

```bash
npm install zustand @react-native-async-storage/async-storage
npx expo install @react-native-async-storage/async-storage
```

Expected: Zustand and AsyncStorage installed

**Step 5: Install dev dependencies**

Run:

```bash
npm install -D jest @testing-library/react-native @testing-library/jest-native @types/jest
```

Expected: Test dependencies installed

**Step 6: Commit**

```bash
git add .
git commit -m "feat: initialize Expo project with TypeScript and core dependencies

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>"
```

---

## Task 2: Configure Expo Router

**Files:**

- Modify: `GuitarSlam/package.json`
- Modify: `GuitarSlam/app.json`
- Create: `GuitarSlam/app/_layout.tsx`
- Create: `GuitarSlam/app/(tabs)/_layout.tsx`
- Create: `GuitarSlam/app/(tabs)/index.tsx`
- Create: `GuitarSlam/app/(tabs)/game.tsx`
- Create: `GuitarSlam/app/(tabs)/freeplay.tsx`
- Create: `GuitarSlam/app/(tabs)/library.tsx`
- Delete: `GuitarSlam/App.tsx`

**Step 1: Update package.json main entry**

Edit `package.json` to set main entry point:

```json
{
  "main": "expo-router/entry"
}
```

**Step 2: Update app.json for Expo Router**

Edit `app.json`:

```json
{
  "expo": {
    "name": "Guitar Slam",
    "slug": "guitar-slam",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/icon.png",
    "userInterfaceStyle": "light",
    "splash": {
      "image": "./assets/splash.png",
      "resizeMode": "contain",
      "backgroundColor": "#1a1a2e"
    },
    "assetBundlePatterns": ["**/*"],
    "ios": {
      "supportsTablet": true,
      "bundleIdentifier": "com.guitarslam.app",
      "infoPlist": {
        "NSMicrophoneUsageDescription": "Guitar Slam needs microphone access to detect the chords you play on your guitar."
      }
    },
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#1a1a2e"
      },
      "package": "com.guitarslam.app",
      "permissions": ["android.permission.RECORD_AUDIO"]
    },
    "web": {
      "favicon": "./assets/favicon.png"
    },
    "scheme": "guitarslam",
    "plugins": ["expo-router"]
  }
}
```

**Step 3: Delete old App.tsx**

Run:

```bash
rm App.tsx
```

**Step 4: Create root layout**

Create `app/_layout.tsx`:

```tsx
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";

export default function RootLayout() {
  return (
    <>
      <StatusBar style="light" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
      </Stack>
    </>
  );
}
```

**Step 5: Create tabs layout**

Create `app/(tabs)/_layout.tsx`:

```tsx
import { Tabs } from "expo-router";
import { Text } from "react-native";

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: "#1a1a2e",
          borderTopColor: "#2d2d44",
        },
        tabBarActiveTintColor: "#4ecdc4",
        tabBarInactiveTintColor: "#888",
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color }) => (
            <Text style={{ color, fontSize: 20 }}>🏠</Text>
          ),
        }}
      />
      <Tabs.Screen
        name="game"
        options={{
          title: "Game",
          tabBarIcon: ({ color }) => (
            <Text style={{ color, fontSize: 20 }}>🎮</Text>
          ),
        }}
      />
      <Tabs.Screen
        name="freeplay"
        options={{
          title: "Freeplay",
          tabBarIcon: ({ color }) => (
            <Text style={{ color, fontSize: 20 }}>🎸</Text>
          ),
        }}
      />
      <Tabs.Screen
        name="library"
        options={{
          title: "Library",
          tabBarIcon: ({ color }) => (
            <Text style={{ color, fontSize: 20 }}>📚</Text>
          ),
        }}
      />
    </Tabs>
  );
}
```

**Step 6: Create Home tab placeholder**

Create `app/(tabs)/index.tsx`:

```tsx
import { View, Text, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function HomeScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Real Guitar Hero</Text>
        <Text style={styles.subtitle}>
          Practice guitar with real-time feedback
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1a1a2e",
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: "#888",
    textAlign: "center",
  },
});
```

**Step 7: Create Game tab placeholder**

Create `app/(tabs)/game.tsx`:

```tsx
import { View, Text, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function GameScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Game Mode</Text>
        <Text style={styles.subtitle}>Coming soon...</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1a1a2e",
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: "#888",
  },
});
```

**Step 8: Create Freeplay tab placeholder**

Create `app/(tabs)/freeplay.tsx`:

```tsx
import { View, Text, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function FreeplayScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Freeplay Mode</Text>
        <Text style={styles.subtitle}>Coming soon...</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1a1a2e",
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: "#888",
  },
});
```

**Step 9: Create Library tab placeholder**

Create `app/(tabs)/library.tsx`:

```tsx
import { View, Text, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function LibraryScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Chord Library</Text>
        <Text style={styles.subtitle}>Coming soon...</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1a1a2e",
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: "#888",
  },
});
```

**Step 10: Verify app starts**

Run:

```bash
npx expo start
```

Expected: Metro bundler starts, QR code displayed, app loads on device/simulator with tab navigation

**Step 11: Commit**

```bash
git add .
git commit -m "feat: configure Expo Router with tab navigation

- Add root layout with Stack navigator
- Add tabs layout with 4 tabs (Home, Game, Freeplay, Library)
- Create placeholder screens for each tab
- Configure dark theme styling

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>"
```

---

## Task 3: Configure EAS Build

**Files:**

- Create: `GuitarSlam/eas.json`

**Step 1: Login to EAS**

Run:

```bash
eas login
```

Expected: Prompted for Expo credentials, successful login

**Step 2: Configure EAS**

Run:

```bash
eas build:configure
```

Expected: Creates `eas.json` file

**Step 3: Update eas.json**

Edit `eas.json`:

```json
{
  "cli": {
    "version": ">= 5.0.0"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal",
      "ios": {
        "simulator": false
      }
    },
    "preview": {
      "distribution": "internal"
    },
    "production": {}
  },
  "submit": {
    "production": {}
  }
}
```

**Step 4: Commit**

```bash
git add eas.json
git commit -m "feat: configure EAS Build for iOS development

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>"
```

---

## Task 4: Set Up Project Structure

**Files:**

- Create: `GuitarSlam/src/components/.gitkeep`
- Create: `GuitarSlam/src/hooks/.gitkeep`
- Create: `GuitarSlam/src/stores/.gitkeep`
- Create: `GuitarSlam/src/types/index.ts`
- Create: `GuitarSlam/src/constants/theme.ts`
- Create: `GuitarSlam/src/constants/chords.ts`
- Create: `GuitarSlam/src/utils/.gitkeep`
- Create: `GuitarSlam/assets/songs/.gitkeep`

**Step 1: Create directory structure**

Run:

```bash
mkdir -p src/components src/hooks src/stores src/types src/constants src/utils assets/songs
touch src/components/.gitkeep src/hooks/.gitkeep src/stores/.gitkeep src/utils/.gitkeep assets/songs/.gitkeep
```

**Step 2: Create types file**

Create `src/types/index.ts`:

```ts
// Chord types
export interface ChordDiagram {
  strings: number[]; // Fret number for each string (0 = open, -1 = muted)
  fingers: number[]; // Finger number for each string (0 = none, 1-4 = index-pinky)
  baseFret: number; // Starting fret position
  barres?: number[]; // Frets with barre
}

export interface Chord {
  id: string;
  primaryName: string;
  alternateNames: string[];
  type:
    | "major"
    | "minor"
    | "7th"
    | "sus"
    | "aug"
    | "dim"
    | "extended"
    | "power";
  difficulty: "beginner" | "intermediate" | "advanced";
  notes: string[];
  diagram: ChordDiagram;
  alternateVoicings?: ChordDiagram[];
}

// Audio detection types
export interface DetectedChord {
  name: string;
  confidence: number; // 0-1
  notes: string[];
  timestamp: number;
}

export interface AudioState {
  isListening: boolean;
  currentChord: DetectedChord | null;
  chordHistory: DetectedChord[];
  error: string | null;
}

// Game types
export interface ChordNote {
  id: string;
  chord: string;
  time: number; // Time in seconds when chord should be hit
  duration: number; // How long the chord is held
}

export interface SongLevel {
  levelNumber: number;
  name: string;
  description: string;
  chart: ChordNote[];
}

export interface Song {
  id: string;
  title: string;
  artist: string;
  difficulty: 1 | 2 | 3 | 4 | 5;
  bpm: number;
  levels: SongLevel[];
}

export interface GameState {
  currentSong: Song | null;
  currentLevel: number;
  score: number;
  combo: number;
  maxCombo: number;
  hits: number;
  misses: number;
  isPlaying: boolean;
}

// Hit result types
export type HitType = "perfect" | "good" | "miss";

export interface HitResult {
  type: HitType;
  points: number;
  noteId: string;
  timestamp: number;
}
```

**Step 3: Create theme constants**

Create `src/constants/theme.ts`:

```ts
export const colors = {
  // Background colors
  background: "#1a1a2e",
  backgroundLight: "#2d2d44",
  backgroundDark: "#0f0f1a",

  // Primary colors
  primary: "#4ecdc4",
  primaryDark: "#3db3ab",

  // Accent colors
  accent: "#ff6b6b",
  accentDark: "#e55555",

  // Text colors
  text: "#ffffff",
  textSecondary: "#888888",
  textMuted: "#555555",

  // Status colors
  success: "#4ecdc4",
  warning: "#ffd93d",
  error: "#ff6b6b",

  // Game specific
  perfect: "#4ecdc4",
  good: "#ffd93d",
  miss: "#ff6b6b",

  // Chord confidence
  highConfidence: "#4ecdc4",
  mediumConfidence: "#ffd93d",
  lowConfidence: "#888888",
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const fontSize = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 20,
  xl: 24,
  xxl: 32,
  huge: 48,
};

export const borderRadius = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  round: 9999,
};
```

**Step 4: Create initial chord database (first 10 chords)**

Create `src/constants/chords.ts`:

```ts
import { Chord } from "../types";

export const chords: Chord[] = [
  // Major chords
  {
    id: "c-major",
    primaryName: "C",
    alternateNames: ["Cmaj", "CM"],
    type: "major",
    difficulty: "beginner",
    notes: ["C", "E", "G"],
    diagram: {
      strings: [-1, 3, 2, 0, 1, 0],
      fingers: [0, 3, 2, 0, 1, 0],
      baseFret: 0,
    },
  },
  {
    id: "d-major",
    primaryName: "D",
    alternateNames: ["Dmaj", "DM"],
    type: "major",
    difficulty: "beginner",
    notes: ["D", "F#", "A"],
    diagram: {
      strings: [-1, -1, 0, 2, 3, 2],
      fingers: [0, 0, 0, 1, 3, 2],
      baseFret: 0,
    },
  },
  {
    id: "e-major",
    primaryName: "E",
    alternateNames: ["Emaj", "EM"],
    type: "major",
    difficulty: "beginner",
    notes: ["E", "G#", "B"],
    diagram: {
      strings: [0, 2, 2, 1, 0, 0],
      fingers: [0, 2, 3, 1, 0, 0],
      baseFret: 0,
    },
  },
  {
    id: "g-major",
    primaryName: "G",
    alternateNames: ["Gmaj", "GM"],
    type: "major",
    difficulty: "beginner",
    notes: ["G", "B", "D"],
    diagram: {
      strings: [3, 2, 0, 0, 0, 3],
      fingers: [2, 1, 0, 0, 0, 3],
      baseFret: 0,
    },
  },
  {
    id: "a-major",
    primaryName: "A",
    alternateNames: ["Amaj", "AM"],
    type: "major",
    difficulty: "beginner",
    notes: ["A", "C#", "E"],
    diagram: {
      strings: [-1, 0, 2, 2, 2, 0],
      fingers: [0, 0, 1, 2, 3, 0],
      baseFret: 0,
    },
  },
  // Minor chords
  {
    id: "a-minor",
    primaryName: "Am",
    alternateNames: ["Amin"],
    type: "minor",
    difficulty: "beginner",
    notes: ["A", "C", "E"],
    diagram: {
      strings: [-1, 0, 2, 2, 1, 0],
      fingers: [0, 0, 2, 3, 1, 0],
      baseFret: 0,
    },
  },
  {
    id: "d-minor",
    primaryName: "Dm",
    alternateNames: ["Dmin"],
    type: "minor",
    difficulty: "beginner",
    notes: ["D", "F", "A"],
    diagram: {
      strings: [-1, -1, 0, 2, 3, 1],
      fingers: [0, 0, 0, 2, 3, 1],
      baseFret: 0,
    },
  },
  {
    id: "e-minor",
    primaryName: "Em",
    alternateNames: ["Emin"],
    type: "minor",
    difficulty: "beginner",
    notes: ["E", "G", "B"],
    diagram: {
      strings: [0, 2, 2, 0, 0, 0],
      fingers: [0, 2, 3, 0, 0, 0],
      baseFret: 0,
    },
  },
  // 7th chords
  {
    id: "a7",
    primaryName: "A7",
    alternateNames: ["Adom7"],
    type: "7th",
    difficulty: "beginner",
    notes: ["A", "C#", "E", "G"],
    diagram: {
      strings: [-1, 0, 2, 0, 2, 0],
      fingers: [0, 0, 1, 0, 2, 0],
      baseFret: 0,
    },
  },
  {
    id: "e7",
    primaryName: "E7",
    alternateNames: ["Edom7"],
    type: "7th",
    difficulty: "beginner",
    notes: ["E", "G#", "B", "D"],
    diagram: {
      strings: [0, 2, 0, 1, 0, 0],
      fingers: [0, 2, 0, 1, 0, 0],
      baseFret: 0,
    },
  },
];

// Helper function to find chord by name
export function findChordByName(name: string): Chord | undefined {
  const normalizedName = name.toLowerCase().trim();
  return chords.find(
    (chord) =>
      chord.primaryName.toLowerCase() === normalizedName ||
      chord.alternateNames.some((alt) => alt.toLowerCase() === normalizedName),
  );
}

// Helper function to get chords by type
export function getChordsByType(type: Chord["type"]): Chord[] {
  return chords.filter((chord) => chord.type === type);
}

// Helper function to get chords by difficulty
export function getChordsByDifficulty(
  difficulty: Chord["difficulty"],
): Chord[] {
  return chords.filter((chord) => chord.difficulty === difficulty);
}
```

**Step 5: Commit**

```bash
git add .
git commit -m "feat: set up project structure with types, theme, and initial chords

- Add TypeScript types for chords, audio, game state
- Add theme constants (colors, spacing, typography)
- Add initial chord database (10 beginner chords)
- Create directory structure for components, hooks, stores

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>"
```

---

## Task 5: Create Zustand Store for App State

**Files:**

- Create: `GuitarSlam/src/stores/useAppStore.ts`
- Create: `GuitarSlam/src/stores/useAudioStore.ts`
- Create: `GuitarSlam/src/stores/useGameStore.ts`
- Test: `GuitarSlam/__tests__/stores/useGameStore.test.ts`

**Step 1: Write failing test for game store**

Create `__tests__/stores/useGameStore.test.ts`:

```ts
import { useGameStore } from "../../src/stores/useGameStore";

describe("useGameStore", () => {
  beforeEach(() => {
    useGameStore.getState().reset();
  });

  it("should start with initial state", () => {
    const state = useGameStore.getState();
    expect(state.score).toBe(0);
    expect(state.combo).toBe(0);
    expect(state.isPlaying).toBe(false);
  });

  it("should add score with combo multiplier", () => {
    const { addHit } = useGameStore.getState();

    // First hit: 1x multiplier
    addHit("perfect");
    expect(useGameStore.getState().score).toBe(100);
    expect(useGameStore.getState().combo).toBe(1);

    // More hits to build combo
    for (let i = 0; i < 9; i++) {
      addHit("perfect");
    }
    // 10th hit: now at 2x multiplier
    expect(useGameStore.getState().combo).toBe(10);

    addHit("perfect");
    // 11th hit with 2x: 100 * 2 = 200 added
    expect(useGameStore.getState().score).toBe(1000 + 200);
  });

  it("should reset combo on miss", () => {
    const { addHit, addMiss } = useGameStore.getState();

    addHit("perfect");
    addHit("perfect");
    expect(useGameStore.getState().combo).toBe(2);

    addMiss();
    expect(useGameStore.getState().combo).toBe(0);
    expect(useGameStore.getState().misses).toBe(1);
  });

  it("should track max combo", () => {
    const { addHit, addMiss } = useGameStore.getState();

    for (let i = 0; i < 5; i++) {
      addHit("perfect");
    }
    expect(useGameStore.getState().maxCombo).toBe(5);

    addMiss();
    addHit("perfect");
    addHit("perfect");

    // Max combo should still be 5
    expect(useGameStore.getState().maxCombo).toBe(5);
    expect(useGameStore.getState().combo).toBe(2);
  });
});
```

**Step 2: Run test to verify it fails**

Run:

```bash
npm test -- __tests__/stores/useGameStore.test.ts
```

Expected: FAIL - Cannot find module '../../src/stores/useGameStore'

**Step 3: Create app store**

Create `src/stores/useAppStore.ts`:

```ts
import { create } from "zustand";

interface AppState {
  isInitialized: boolean;
  setInitialized: (value: boolean) => void;
}

export const useAppStore = create<AppState>((set) => ({
  isInitialized: false,
  setInitialized: (value) => set({ isInitialized: value }),
}));
```

**Step 4: Create audio store**

Create `src/stores/useAudioStore.ts`:

```ts
import { create } from "zustand";
import { DetectedChord } from "../types";

interface AudioState {
  isListening: boolean;
  currentChord: DetectedChord | null;
  chordHistory: DetectedChord[];
  error: string | null;

  // Actions
  setListening: (value: boolean) => void;
  setCurrentChord: (chord: DetectedChord | null) => void;
  addToHistory: (chord: DetectedChord) => void;
  clearHistory: () => void;
  setError: (error: string | null) => void;
}

const MAX_HISTORY = 8;

export const useAudioStore = create<AudioState>((set) => ({
  isListening: false,
  currentChord: null,
  chordHistory: [],
  error: null,

  setListening: (value) => set({ isListening: value }),

  setCurrentChord: (chord) => set({ currentChord: chord }),

  addToHistory: (chord) =>
    set((state) => ({
      chordHistory: [chord, ...state.chordHistory].slice(0, MAX_HISTORY),
    })),

  clearHistory: () => set({ chordHistory: [] }),

  setError: (error) => set({ error }),
}));
```

**Step 5: Create game store**

Create `src/stores/useGameStore.ts`:

```ts
import { create } from "zustand";
import { Song, HitType } from "../types";

interface GameState {
  currentSong: Song | null;
  currentLevel: number;
  score: number;
  combo: number;
  maxCombo: number;
  hits: number;
  misses: number;
  isPlaying: boolean;

  // Actions
  setSong: (song: Song) => void;
  setLevel: (level: number) => void;
  startGame: () => void;
  endGame: () => void;
  addHit: (type: HitType) => void;
  addMiss: () => void;
  reset: () => void;
}

const getComboMultiplier = (combo: number): number => {
  if (combo >= 50) return 4;
  if (combo >= 20) return 3;
  if (combo >= 10) return 2;
  return 1;
};

const getPointsForHit = (type: HitType): number => {
  switch (type) {
    case "perfect":
      return 100;
    case "good":
      return 50;
    default:
      return 0;
  }
};

const initialState = {
  currentSong: null,
  currentLevel: 1,
  score: 0,
  combo: 0,
  maxCombo: 0,
  hits: 0,
  misses: 0,
  isPlaying: false,
};

export const useGameStore = create<GameState>((set) => ({
  ...initialState,

  setSong: (song) => set({ currentSong: song }),

  setLevel: (level) => set({ currentLevel: level }),

  startGame: () =>
    set({
      isPlaying: true,
      score: 0,
      combo: 0,
      maxCombo: 0,
      hits: 0,
      misses: 0,
    }),

  endGame: () => set({ isPlaying: false }),

  addHit: (type) =>
    set((state) => {
      const newCombo = state.combo + 1;
      const multiplier = getComboMultiplier(state.combo); // Use current combo for multiplier
      const points = getPointsForHit(type) * multiplier;

      return {
        score: state.score + points,
        combo: newCombo,
        maxCombo: Math.max(state.maxCombo, newCombo),
        hits: state.hits + 1,
      };
    }),

  addMiss: () =>
    set((state) => ({
      combo: 0,
      misses: state.misses + 1,
    })),

  reset: () => set(initialState),
}));
```

**Step 6: Run test to verify it passes**

Run:

```bash
npm test -- __tests__/stores/useGameStore.test.ts
```

Expected: PASS

**Step 7: Commit**

```bash
git add .
git commit -m "feat: add Zustand stores for app, audio, and game state

- Add useAppStore for global app state
- Add useAudioStore for audio detection state
- Add useGameStore with scoring and combo logic
- Add tests for game store

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>"
```

---

## Task 6: Create Chord Diagram Component

**Files:**

- Create: `GuitarSlam/src/components/ChordDiagram.tsx`
- Test: `GuitarSlam/__tests__/components/ChordDiagram.test.tsx`

**Step 1: Write failing test**

Create `__tests__/components/ChordDiagram.test.tsx`:

```tsx
import React from "react";
import { render, screen } from "@testing-library/react-native";
import { ChordDiagram } from "../../src/components/ChordDiagram";
import { chords } from "../../src/constants/chords";

describe("ChordDiagram", () => {
  const gMajor = chords.find((c) => c.id === "g-major")!;

  it("renders chord name", () => {
    render(<ChordDiagram chord={gMajor} />);
    expect(screen.getByText("G")).toBeTruthy();
  });

  it("renders with custom size", () => {
    render(<ChordDiagram chord={gMajor} size="large" />);
    expect(screen.getByText("G")).toBeTruthy();
  });
});
```

**Step 2: Run test to verify it fails**

Run:

```bash
npm test -- __tests__/components/ChordDiagram.test.tsx
```

Expected: FAIL - Cannot find module

**Step 3: Create ChordDiagram component**

Create `src/components/ChordDiagram.tsx`:

```tsx
import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Chord } from "../types";
import { colors, spacing, fontSize } from "../constants/theme";

interface ChordDiagramProps {
  chord: Chord;
  size?: "small" | "medium" | "large";
  showName?: boolean;
}

const sizeConfig = {
  small: { width: 80, fretHeight: 16, fontSize: fontSize.sm },
  medium: { width: 120, fretHeight: 24, fontSize: fontSize.md },
  large: { width: 180, fretHeight: 36, fontSize: fontSize.lg },
};

export function ChordDiagram({
  chord,
  size = "medium",
  showName = true,
}: ChordDiagramProps) {
  const config = sizeConfig[size];
  const stringSpacing = config.width / 6;
  const fretCount = 5;
  const dotSize = config.fretHeight * 0.6;

  const renderStrings = () => {
    return (
      <View style={styles.stringsContainer}>
        {[0, 1, 2, 3, 4, 5].map((stringIndex) => (
          <View
            key={stringIndex}
            style={[
              styles.string,
              {
                left: stringIndex * stringSpacing + stringSpacing / 2,
                height: config.fretHeight * fretCount,
              },
            ]}
          />
        ))}
      </View>
    );
  };

  const renderFrets = () => {
    return (
      <View style={styles.fretsContainer}>
        {[0, 1, 2, 3, 4, 5].map((fretIndex) => (
          <View
            key={fretIndex}
            style={[
              styles.fret,
              {
                top: fretIndex * config.fretHeight,
                width: config.width - stringSpacing,
                left: stringSpacing / 2,
              },
              fretIndex === 0 && styles.nutFret,
            ]}
          />
        ))}
      </View>
    );
  };

  const renderFingerPositions = () => {
    return chord.diagram.strings.map((fretNum, stringIndex) => {
      if (fretNum <= 0) return null;

      const finger = chord.diagram.fingers[stringIndex];
      const x = stringIndex * stringSpacing + stringSpacing / 2;
      const y = (fretNum - 0.5) * config.fretHeight;

      return (
        <View
          key={`dot-${stringIndex}`}
          style={[
            styles.dot,
            {
              width: dotSize,
              height: dotSize,
              borderRadius: dotSize / 2,
              left: x - dotSize / 2,
              top: y - dotSize / 2,
            },
          ]}
        >
          {finger > 0 && (
            <Text style={[styles.fingerText, { fontSize: dotSize * 0.6 }]}>
              {finger}
            </Text>
          )}
        </View>
      );
    });
  };

  const renderStringMarkers = () => {
    return chord.diagram.strings.map((fretNum, stringIndex) => {
      const x = stringIndex * stringSpacing + stringSpacing / 2;
      const markerSize = dotSize * 0.6;

      if (fretNum === -1) {
        return (
          <Text
            key={`marker-${stringIndex}`}
            style={[
              styles.muteMarker,
              {
                left: x - markerSize / 2,
                top: -config.fretHeight * 0.8,
                fontSize: markerSize,
              },
            ]}
          >
            ✕
          </Text>
        );
      }
      if (fretNum === 0) {
        return (
          <View
            key={`marker-${stringIndex}`}
            style={[
              styles.openMarker,
              {
                width: markerSize,
                height: markerSize,
                borderRadius: markerSize / 2,
                left: x - markerSize / 2,
                top: -config.fretHeight * 0.7,
              },
            ]}
          />
        );
      }
      return null;
    });
  };

  return (
    <View style={styles.container}>
      {showName && (
        <Text style={[styles.chordName, { fontSize: config.fontSize * 1.5 }]}>
          {chord.primaryName}
        </Text>
      )}
      <View
        style={[
          styles.diagramContainer,
          {
            width: config.width,
            height: config.fretHeight * fretCount + config.fretHeight,
            paddingTop: config.fretHeight,
          },
        ]}
      >
        {renderFrets()}
        {renderStrings()}
        {renderFingerPositions()}
        {renderStringMarkers()}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
  },
  chordName: {
    color: colors.text,
    fontWeight: "bold",
    marginBottom: spacing.sm,
  },
  diagramContainer: {
    position: "relative",
  },
  stringsContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  string: {
    position: "absolute",
    width: 2,
    backgroundColor: colors.textSecondary,
    top: 0,
  },
  fretsContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  fret: {
    position: "absolute",
    height: 2,
    backgroundColor: colors.textSecondary,
  },
  nutFret: {
    height: 6,
    backgroundColor: colors.text,
  },
  dot: {
    position: "absolute",
    backgroundColor: colors.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  fingerText: {
    color: colors.backgroundDark,
    fontWeight: "bold",
  },
  muteMarker: {
    position: "absolute",
    color: colors.textSecondary,
  },
  openMarker: {
    position: "absolute",
    borderWidth: 2,
    borderColor: colors.textSecondary,
    backgroundColor: "transparent",
  },
});
```

**Step 4: Run test to verify it passes**

Run:

```bash
npm test -- __tests__/components/ChordDiagram.test.tsx
```

Expected: PASS

**Step 5: Commit**

```bash
git add .
git commit -m "feat: add ChordDiagram component

- Renders fretboard with strings and frets
- Shows finger positions as colored dots
- Displays mute (X) and open (O) string markers
- Supports small, medium, large sizes

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>"
```

---

## Task 7: Create Chord Library Screen

**Files:**

- Modify: `GuitarSlam/app/(tabs)/library.tsx`
- Create: `GuitarSlam/app/chord/[id].tsx`

**Step 1: Update Library screen with chord list**

Replace `app/(tabs)/library.tsx`:

```tsx
import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  Pressable,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { chords } from "../../src/constants/chords";
import { ChordDiagram } from "../../src/components/ChordDiagram";
import {
  colors,
  spacing,
  fontSize,
  borderRadius,
} from "../../src/constants/theme";
import { Chord } from "../../src/types";

type FilterType = "all" | "major" | "minor" | "7th";

export default function LibraryScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState<FilterType>("all");

  const filteredChords = useMemo(() => {
    return chords.filter((chord) => {
      const matchesSearch =
        searchQuery === "" ||
        chord.primaryName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        chord.alternateNames.some((name) =>
          name.toLowerCase().includes(searchQuery.toLowerCase()),
        );

      const matchesFilter = filter === "all" || chord.type === filter;

      return matchesSearch && matchesFilter;
    });
  }, [searchQuery, filter]);

  const renderChordItem = ({ item }: { item: Chord }) => (
    <Pressable
      style={({ pressed }) => [
        styles.chordCard,
        pressed && styles.chordCardPressed,
      ]}
      onPress={() => router.push(`/chord/${item.id}`)}
    >
      <ChordDiagram chord={item} size="small" />
      <View style={styles.chordInfo}>
        <Text style={styles.chordType}>{item.type}</Text>
        <Text style={styles.chordDifficulty}>{item.difficulty}</Text>
      </View>
    </Pressable>
  );

  const filters: { key: FilterType; label: string }[] = [
    { key: "all", label: "All" },
    { key: "major", label: "Major" },
    { key: "minor", label: "Minor" },
    { key: "7th", label: "7th" },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Chord Library</Text>
        <TextInput
          style={styles.searchInput}
          placeholder="Search chords..."
          placeholderTextColor={colors.textMuted}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        <View style={styles.filterRow}>
          {filters.map((f) => (
            <TouchableOpacity
              key={f.key}
              style={[
                styles.filterButton,
                filter === f.key && styles.filterButtonActive,
              ]}
              onPress={() => setFilter(f.key)}
            >
              <Text
                style={[
                  styles.filterText,
                  filter === f.key && styles.filterTextActive,
                ]}
              >
                {f.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <FlatList
        data={filteredChords}
        renderItem={renderChordItem}
        keyExtractor={(item) => item.id}
        numColumns={2}
        contentContainerStyle={styles.listContent}
        columnWrapperStyle={styles.row}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No chords found</Text>
          </View>
        }
      />
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
  },
  title: {
    fontSize: fontSize.xxl,
    fontWeight: "bold",
    color: colors.text,
    marginBottom: spacing.md,
  },
  searchInput: {
    backgroundColor: colors.backgroundLight,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    color: colors.text,
    fontSize: fontSize.md,
    marginBottom: spacing.md,
  },
  filterRow: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  filterButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.round,
    backgroundColor: colors.backgroundLight,
  },
  filterButtonActive: {
    backgroundColor: colors.primary,
  },
  filterText: {
    color: colors.textSecondary,
    fontSize: fontSize.sm,
  },
  filterTextActive: {
    color: colors.backgroundDark,
    fontWeight: "bold",
  },
  listContent: {
    padding: spacing.md,
    paddingTop: 0,
  },
  row: {
    justifyContent: "space-between",
  },
  chordCard: {
    width: "48%",
    backgroundColor: colors.backgroundLight,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    alignItems: "center",
  },
  chordCardPressed: {
    opacity: 0.7,
  },
  chordInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginTop: spacing.sm,
  },
  chordType: {
    color: colors.textSecondary,
    fontSize: fontSize.xs,
    textTransform: "capitalize",
  },
  chordDifficulty: {
    color: colors.primary,
    fontSize: fontSize.xs,
    textTransform: "capitalize",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: spacing.xxl,
  },
  emptyText: {
    color: colors.textSecondary,
    fontSize: fontSize.md,
  },
});
```

**Step 2: Create chord detail screen**

Create `app/chord/[id].tsx`:

```tsx
import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { chords } from "../../src/constants/chords";
import { ChordDiagram } from "../../src/components/ChordDiagram";
import {
  colors,
  spacing,
  fontSize,
  borderRadius,
} from "../../src/constants/theme";

export default function ChordDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const chord = chords.find((c) => c.id === id);

  if (!chord) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Chord not found</Text>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>

        <View style={styles.headerSection}>
          <Text style={styles.chordName}>{chord.primaryName}</Text>
          {chord.alternateNames.length > 0 && (
            <Text style={styles.alternateNames}>
              Also known as: {chord.alternateNames.join(", ")}
            </Text>
          )}
        </View>

        <View style={styles.diagramSection}>
          <ChordDiagram chord={chord} size="large" showName={false} />
        </View>

        <View style={styles.infoSection}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Type</Text>
            <Text style={styles.infoValue}>{chord.type}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Difficulty</Text>
            <Text style={styles.infoValue}>{chord.difficulty}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Notes</Text>
            <Text style={styles.infoValue}>{chord.notes.join(" - ")}</Text>
          </View>
        </View>

        <View style={styles.tipsSection}>
          <Text style={styles.sectionTitle}>Tips</Text>
          <Text style={styles.tipText}>
            • Numbers on dots indicate which finger to use (1=index, 2=middle,
            3=ring, 4=pinky)
          </Text>
          <Text style={styles.tipText}>• X means don't play that string</Text>
          <Text style={styles.tipText}>
            • O means play the string open (no finger)
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.lg,
  },
  backButton: {
    marginBottom: spacing.lg,
  },
  backButtonText: {
    color: colors.primary,
    fontSize: fontSize.md,
  },
  headerSection: {
    alignItems: "center",
    marginBottom: spacing.xl,
  },
  chordName: {
    fontSize: fontSize.huge,
    fontWeight: "bold",
    color: colors.text,
  },
  alternateNames: {
    color: colors.textSecondary,
    fontSize: fontSize.sm,
    marginTop: spacing.xs,
  },
  diagramSection: {
    alignItems: "center",
    marginBottom: spacing.xl,
    backgroundColor: colors.backgroundLight,
    padding: spacing.xl,
    borderRadius: borderRadius.lg,
  },
  infoSection: {
    backgroundColor: colors.backgroundLight,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.xl,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.backgroundDark,
  },
  infoLabel: {
    color: colors.textSecondary,
    fontSize: fontSize.md,
  },
  infoValue: {
    color: colors.text,
    fontSize: fontSize.md,
    fontWeight: "600",
    textTransform: "capitalize",
  },
  tipsSection: {
    backgroundColor: colors.backgroundLight,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
  },
  sectionTitle: {
    color: colors.text,
    fontSize: fontSize.lg,
    fontWeight: "bold",
    marginBottom: spacing.md,
  },
  tipText: {
    color: colors.textSecondary,
    fontSize: fontSize.sm,
    marginBottom: spacing.sm,
    lineHeight: 20,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorText: {
    color: colors.error,
    fontSize: fontSize.lg,
    marginBottom: spacing.lg,
  },
});
```

**Step 3: Verify app works**

Run:

```bash
npx expo start
```

Expected: Library tab shows chord grid, tapping a chord opens detail screen

**Step 4: Commit**

```bash
git add .
git commit -m "feat: add Chord Library screen with search and filtering

- Add searchable chord list with filter tabs
- Add chord detail screen with diagram and info
- Support navigation from list to detail view

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>"
```

---

## Task 8: Expand Chord Database to 50 Chords

**Files:**

- Modify: `GuitarSlam/src/constants/chords.ts`

**Step 1: Add remaining chords**

Expand `src/constants/chords.ts` to include 50 chords. Add the following chords to the existing array:

```ts
// Add after existing chords in the array:

  // More Major chords
  {
    id: 'f-major',
    primaryName: 'F',
    alternateNames: ['Fmaj', 'FM'],
    type: 'major',
    difficulty: 'intermediate',
    notes: ['F', 'A', 'C'],
    diagram: {
      strings: [1, 1, 2, 3, 3, 1],
      fingers: [1, 1, 2, 3, 4, 1],
      baseFret: 0,
      barres: [1],
    },
  },
  {
    id: 'b-major',
    primaryName: 'B',
    alternateNames: ['Bmaj', 'BM'],
    type: 'major',
    difficulty: 'intermediate',
    notes: ['B', 'D#', 'F#'],
    diagram: {
      strings: [-1, 2, 4, 4, 4, 2],
      fingers: [0, 1, 2, 3, 4, 1],
      baseFret: 0,
      barres: [2],
    },
  },
  // More Minor chords
  {
    id: 'b-minor',
    primaryName: 'Bm',
    alternateNames: ['Bmin'],
    type: 'minor',
    difficulty: 'intermediate',
    notes: ['B', 'D', 'F#'],
    diagram: {
      strings: [-1, 2, 4, 4, 3, 2],
      fingers: [0, 1, 3, 4, 2, 1],
      baseFret: 0,
      barres: [2],
    },
  },
  {
    id: 'f-minor',
    primaryName: 'Fm',
    alternateNames: ['Fmin'],
    type: 'minor',
    difficulty: 'intermediate',
    notes: ['F', 'Ab', 'C'],
    diagram: {
      strings: [1, 1, 1, 3, 3, 1],
      fingers: [1, 1, 1, 3, 4, 1],
      baseFret: 0,
      barres: [1],
    },
  },
  {
    id: 'c-minor',
    primaryName: 'Cm',
    alternateNames: ['Cmin'],
    type: 'minor',
    difficulty: 'intermediate',
    notes: ['C', 'Eb', 'G'],
    diagram: {
      strings: [-1, 3, 5, 5, 4, 3],
      fingers: [0, 1, 3, 4, 2, 1],
      baseFret: 0,
      barres: [3],
    },
  },
  {
    id: 'g-minor',
    primaryName: 'Gm',
    alternateNames: ['Gmin'],
    type: 'minor',
    difficulty: 'intermediate',
    notes: ['G', 'Bb', 'D'],
    diagram: {
      strings: [3, 3, 5, 5, 3, 3],
      fingers: [1, 1, 3, 4, 1, 1],
      baseFret: 0,
      barres: [3],
    },
  },
  // 7th chords
  {
    id: 'd7',
    primaryName: 'D7',
    alternateNames: ['Ddom7'],
    type: '7th',
    difficulty: 'beginner',
    notes: ['D', 'F#', 'A', 'C'],
    diagram: {
      strings: [-1, -1, 0, 2, 1, 2],
      fingers: [0, 0, 0, 2, 1, 3],
      baseFret: 0,
    },
  },
  {
    id: 'g7',
    primaryName: 'G7',
    alternateNames: ['Gdom7'],
    type: '7th',
    difficulty: 'beginner',
    notes: ['G', 'B', 'D', 'F'],
    diagram: {
      strings: [3, 2, 0, 0, 0, 1],
      fingers: [3, 2, 0, 0, 0, 1],
      baseFret: 0,
    },
  },
  {
    id: 'c7',
    primaryName: 'C7',
    alternateNames: ['Cdom7'],
    type: '7th',
    difficulty: 'beginner',
    notes: ['C', 'E', 'G', 'Bb'],
    diagram: {
      strings: [-1, 3, 2, 3, 1, 0],
      fingers: [0, 3, 2, 4, 1, 0],
      baseFret: 0,
    },
  },
  {
    id: 'b7',
    primaryName: 'B7',
    alternateNames: ['Bdom7'],
    type: '7th',
    difficulty: 'beginner',
    notes: ['B', 'D#', 'F#', 'A'],
    diagram: {
      strings: [-1, 2, 1, 2, 0, 2],
      fingers: [0, 2, 1, 3, 0, 4],
      baseFret: 0,
    },
  },
  // Minor 7th chords
  {
    id: 'am7',
    primaryName: 'Am7',
    alternateNames: ['Amin7'],
    type: '7th',
    difficulty: 'beginner',
    notes: ['A', 'C', 'E', 'G'],
    diagram: {
      strings: [-1, 0, 2, 0, 1, 0],
      fingers: [0, 0, 2, 0, 1, 0],
      baseFret: 0,
    },
  },
  {
    id: 'em7',
    primaryName: 'Em7',
    alternateNames: ['Emin7'],
    type: '7th',
    difficulty: 'beginner',
    notes: ['E', 'G', 'B', 'D'],
    diagram: {
      strings: [0, 2, 0, 0, 0, 0],
      fingers: [0, 1, 0, 0, 0, 0],
      baseFret: 0,
    },
  },
  {
    id: 'dm7',
    primaryName: 'Dm7',
    alternateNames: ['Dmin7'],
    type: '7th',
    difficulty: 'beginner',
    notes: ['D', 'F', 'A', 'C'],
    diagram: {
      strings: [-1, -1, 0, 2, 1, 1],
      fingers: [0, 0, 0, 2, 1, 1],
      baseFret: 0,
    },
  },
  // Sus chords
  {
    id: 'dsus2',
    primaryName: 'Dsus2',
    alternateNames: ['D2'],
    type: 'sus',
    difficulty: 'beginner',
    notes: ['D', 'E', 'A'],
    diagram: {
      strings: [-1, -1, 0, 2, 3, 0],
      fingers: [0, 0, 0, 1, 2, 0],
      baseFret: 0,
    },
  },
  {
    id: 'dsus4',
    primaryName: 'Dsus4',
    alternateNames: ['D4'],
    type: 'sus',
    difficulty: 'beginner',
    notes: ['D', 'G', 'A'],
    diagram: {
      strings: [-1, -1, 0, 2, 3, 3],
      fingers: [0, 0, 0, 1, 2, 3],
      baseFret: 0,
    },
  },
  {
    id: 'asus2',
    primaryName: 'Asus2',
    alternateNames: ['A2'],
    type: 'sus',
    difficulty: 'beginner',
    notes: ['A', 'B', 'E'],
    diagram: {
      strings: [-1, 0, 2, 2, 0, 0],
      fingers: [0, 0, 1, 2, 0, 0],
      baseFret: 0,
    },
  },
  {
    id: 'asus4',
    primaryName: 'Asus4',
    alternateNames: ['A4'],
    type: 'sus',
    difficulty: 'beginner',
    notes: ['A', 'D', 'E'],
    diagram: {
      strings: [-1, 0, 2, 2, 3, 0],
      fingers: [0, 0, 1, 2, 3, 0],
      baseFret: 0,
    },
  },
  {
    id: 'esus4',
    primaryName: 'Esus4',
    alternateNames: ['E4'],
    type: 'sus',
    difficulty: 'beginner',
    notes: ['E', 'A', 'B'],
    diagram: {
      strings: [0, 2, 2, 2, 0, 0],
      fingers: [0, 2, 3, 4, 0, 0],
      baseFret: 0,
    },
  },
  // Major 7th chords
  {
    id: 'cmaj7',
    primaryName: 'Cmaj7',
    alternateNames: ['CM7', 'CΔ7'],
    type: '7th',
    difficulty: 'beginner',
    notes: ['C', 'E', 'G', 'B'],
    diagram: {
      strings: [-1, 3, 2, 0, 0, 0],
      fingers: [0, 3, 2, 0, 0, 0],
      baseFret: 0,
    },
  },
  {
    id: 'gmaj7',
    primaryName: 'Gmaj7',
    alternateNames: ['GM7', 'GΔ7'],
    type: '7th',
    difficulty: 'beginner',
    notes: ['G', 'B', 'D', 'F#'],
    diagram: {
      strings: [3, 2, 0, 0, 0, 2],
      fingers: [2, 1, 0, 0, 0, 3],
      baseFret: 0,
    },
  },
  {
    id: 'dmaj7',
    primaryName: 'Dmaj7',
    alternateNames: ['DM7', 'DΔ7'],
    type: '7th',
    difficulty: 'beginner',
    notes: ['D', 'F#', 'A', 'C#'],
    diagram: {
      strings: [-1, -1, 0, 2, 2, 2],
      fingers: [0, 0, 0, 1, 1, 1],
      baseFret: 0,
    },
  },
  {
    id: 'amaj7',
    primaryName: 'Amaj7',
    alternateNames: ['AM7', 'AΔ7'],
    type: '7th',
    difficulty: 'beginner',
    notes: ['A', 'C#', 'E', 'G#'],
    diagram: {
      strings: [-1, 0, 2, 1, 2, 0],
      fingers: [0, 0, 2, 1, 3, 0],
      baseFret: 0,
    },
  },
  {
    id: 'emaj7',
    primaryName: 'Emaj7',
    alternateNames: ['EM7', 'EΔ7'],
    type: '7th',
    difficulty: 'beginner',
    notes: ['E', 'G#', 'B', 'D#'],
    diagram: {
      strings: [0, 2, 1, 1, 0, 0],
      fingers: [0, 3, 1, 2, 0, 0],
      baseFret: 0,
    },
  },
  // Power chords
  {
    id: 'e5',
    primaryName: 'E5',
    alternateNames: ['E power'],
    type: 'power',
    difficulty: 'beginner',
    notes: ['E', 'B'],
    diagram: {
      strings: [0, 2, 2, -1, -1, -1],
      fingers: [0, 1, 2, 0, 0, 0],
      baseFret: 0,
    },
  },
  {
    id: 'a5',
    primaryName: 'A5',
    alternateNames: ['A power'],
    type: 'power',
    difficulty: 'beginner',
    notes: ['A', 'E'],
    diagram: {
      strings: [-1, 0, 2, 2, -1, -1],
      fingers: [0, 0, 1, 2, 0, 0],
      baseFret: 0,
    },
  },
  {
    id: 'd5',
    primaryName: 'D5',
    alternateNames: ['D power'],
    type: 'power',
    difficulty: 'beginner',
    notes: ['D', 'A'],
    diagram: {
      strings: [-1, -1, 0, 2, 3, -1],
      fingers: [0, 0, 0, 1, 2, 0],
      baseFret: 0,
    },
  },
  {
    id: 'g5',
    primaryName: 'G5',
    alternateNames: ['G power'],
    type: 'power',
    difficulty: 'beginner',
    notes: ['G', 'D'],
    diagram: {
      strings: [3, 5, 5, -1, -1, -1],
      fingers: [1, 3, 4, 0, 0, 0],
      baseFret: 0,
    },
  },
  {
    id: 'c5',
    primaryName: 'C5',
    alternateNames: ['C power'],
    type: 'power',
    difficulty: 'beginner',
    notes: ['C', 'G'],
    diagram: {
      strings: [-1, 3, 5, 5, -1, -1],
      fingers: [0, 1, 3, 4, 0, 0],
      baseFret: 0,
    },
  },
  {
    id: 'f5',
    primaryName: 'F5',
    alternateNames: ['F power'],
    type: 'power',
    difficulty: 'beginner',
    notes: ['F', 'C'],
    diagram: {
      strings: [1, 3, 3, -1, -1, -1],
      fingers: [1, 3, 4, 0, 0, 0],
      baseFret: 0,
    },
  },
  // Add9 chords
  {
    id: 'cadd9',
    primaryName: 'Cadd9',
    alternateNames: ['C(add9)'],
    type: 'extended',
    difficulty: 'beginner',
    notes: ['C', 'E', 'G', 'D'],
    diagram: {
      strings: [-1, 3, 2, 0, 3, 0],
      fingers: [0, 2, 1, 0, 3, 0],
      baseFret: 0,
    },
  },
  {
    id: 'gadd9',
    primaryName: 'Gadd9',
    alternateNames: ['G(add9)'],
    type: 'extended',
    difficulty: 'beginner',
    notes: ['G', 'B', 'D', 'A'],
    diagram: {
      strings: [3, 0, 0, 2, 0, 3],
      fingers: [2, 0, 0, 1, 0, 3],
      baseFret: 0,
    },
  },
  {
    id: 'dadd9',
    primaryName: 'Dadd9',
    alternateNames: ['D(add9)'],
    type: 'extended',
    difficulty: 'beginner',
    notes: ['D', 'F#', 'A', 'E'],
    diagram: {
      strings: [-1, -1, 0, 2, 3, 0],
      fingers: [0, 0, 0, 1, 2, 0],
      baseFret: 0,
    },
  },
  // Remaining major chords
  {
    id: 'ab-major',
    primaryName: 'Ab',
    alternateNames: ['Abmaj', 'G#'],
    type: 'major',
    difficulty: 'intermediate',
    notes: ['Ab', 'C', 'Eb'],
    diagram: {
      strings: [4, 4, 6, 6, 6, 4],
      fingers: [1, 1, 3, 3, 3, 1],
      baseFret: 0,
      barres: [4],
    },
  },
  {
    id: 'bb-major',
    primaryName: 'Bb',
    alternateNames: ['Bbmaj', 'A#'],
    type: 'major',
    difficulty: 'intermediate',
    notes: ['Bb', 'D', 'F'],
    diagram: {
      strings: [1, 1, 3, 3, 3, 1],
      fingers: [1, 1, 2, 3, 4, 1],
      baseFret: 0,
      barres: [1],
    },
  },
  {
    id: 'eb-major',
    primaryName: 'Eb',
    alternateNames: ['Ebmaj', 'D#'],
    type: 'major',
    difficulty: 'intermediate',
    notes: ['Eb', 'G', 'Bb'],
    diagram: {
      strings: [-1, 6, 5, 3, 4, 3],
      fingers: [0, 4, 3, 1, 2, 1],
      baseFret: 0,
      barres: [3],
    },
  },
  // Additional minor chords
  {
    id: 'ab-minor',
    primaryName: 'Abm',
    alternateNames: ['G#m'],
    type: 'minor',
    difficulty: 'intermediate',
    notes: ['Ab', 'B', 'Eb'],
    diagram: {
      strings: [4, 4, 6, 6, 5, 4],
      fingers: [1, 1, 3, 4, 2, 1],
      baseFret: 0,
      barres: [4],
    },
  },
  {
    id: 'bb-minor',
    primaryName: 'Bbm',
    alternateNames: ['A#m'],
    type: 'minor',
    difficulty: 'intermediate',
    notes: ['Bb', 'Db', 'F'],
    diagram: {
      strings: [1, 1, 3, 3, 2, 1],
      fingers: [1, 1, 3, 4, 2, 1],
      baseFret: 0,
      barres: [1],
    },
  },
  {
    id: 'eb-minor',
    primaryName: 'Ebm',
    alternateNames: ['D#m'],
    type: 'minor',
    difficulty: 'intermediate',
    notes: ['Eb', 'Gb', 'Bb'],
    diagram: {
      strings: [-1, 6, 8, 8, 7, 6],
      fingers: [0, 1, 3, 4, 2, 1],
      baseFret: 0,
      barres: [6],
    },
  },
  // Diminished chords
  {
    id: 'bdim',
    primaryName: 'Bdim',
    alternateNames: ['Bo'],
    type: 'dim',
    difficulty: 'intermediate',
    notes: ['B', 'D', 'F'],
    diagram: {
      strings: [-1, 2, 3, 4, 3, -1],
      fingers: [0, 1, 2, 4, 3, 0],
      baseFret: 0,
    },
  },
  {
    id: 'cdim',
    primaryName: 'Cdim',
    alternateNames: ['Co'],
    type: 'dim',
    difficulty: 'intermediate',
    notes: ['C', 'Eb', 'Gb'],
    diagram: {
      strings: [-1, 3, 4, 2, 4, -1],
      fingers: [0, 2, 3, 1, 4, 0],
      baseFret: 0,
    },
  },
  // Augmented chords
  {
    id: 'caug',
    primaryName: 'Caug',
    alternateNames: ['C+'],
    type: 'aug',
    difficulty: 'intermediate',
    notes: ['C', 'E', 'G#'],
    diagram: {
      strings: [-1, 3, 2, 1, 1, 0],
      fingers: [0, 4, 3, 1, 2, 0],
      baseFret: 0,
    },
  },
  {
    id: 'eaug',
    primaryName: 'Eaug',
    alternateNames: ['E+'],
    type: 'aug',
    difficulty: 'intermediate',
    notes: ['E', 'G#', 'C'],
    diagram: {
      strings: [0, 3, 2, 1, 1, 0],
      fingers: [0, 4, 3, 1, 2, 0],
      baseFret: 0,
    },
  },
  // 6th chords
  {
    id: 'a6',
    primaryName: 'A6',
    alternateNames: ['Amaj6'],
    type: 'extended',
    difficulty: 'beginner',
    notes: ['A', 'C#', 'E', 'F#'],
    diagram: {
      strings: [-1, 0, 2, 2, 2, 2],
      fingers: [0, 0, 1, 1, 1, 1],
      baseFret: 0,
    },
  },
  {
    id: 'e6',
    primaryName: 'E6',
    alternateNames: ['Emaj6'],
    type: 'extended',
    difficulty: 'beginner',
    notes: ['E', 'G#', 'B', 'C#'],
    diagram: {
      strings: [0, 2, 2, 1, 2, 0],
      fingers: [0, 2, 3, 1, 4, 0],
      baseFret: 0,
    },
  },
  {
    id: 'd6',
    primaryName: 'D6',
    alternateNames: ['Dmaj6'],
    type: 'extended',
    difficulty: 'beginner',
    notes: ['D', 'F#', 'A', 'B'],
    diagram: {
      strings: [-1, -1, 0, 2, 0, 2],
      fingers: [0, 0, 0, 1, 0, 2],
      baseFret: 0,
    },
  },
  // Minor 6th
  {
    id: 'am6',
    primaryName: 'Am6',
    alternateNames: ['Amin6'],
    type: 'extended',
    difficulty: 'intermediate',
    notes: ['A', 'C', 'E', 'F#'],
    diagram: {
      strings: [-1, 0, 2, 2, 1, 2],
      fingers: [0, 0, 2, 3, 1, 4],
      baseFret: 0,
    },
  },
  {
    id: 'em6',
    primaryName: 'Em6',
    alternateNames: ['Emin6'],
    type: 'extended',
    difficulty: 'beginner',
    notes: ['E', 'G', 'B', 'C#'],
    diagram: {
      strings: [0, 2, 2, 0, 2, 0],
      fingers: [0, 1, 2, 0, 3, 0],
      baseFret: 0,
    },
  },
```

**Step 2: Update filter options**

Update `app/(tabs)/library.tsx` to include more filter options:

```tsx
// Update the filters array and FilterType
type FilterType =
  | "all"
  | "major"
  | "minor"
  | "7th"
  | "sus"
  | "power"
  | "extended";

// ...

const filters: { key: FilterType; label: string }[] = [
  { key: "all", label: "All" },
  { key: "major", label: "Major" },
  { key: "minor", label: "Minor" },
  { key: "7th", label: "7th" },
  { key: "sus", label: "Sus" },
  { key: "power", label: "Power" },
];
```

**Step 3: Verify chord count**

Run:

```bash
npx expo start
```

Expected: Library shows 50 chords, filtering works for all types

**Step 4: Commit**

```bash
git add .
git commit -m "feat: expand chord database to 50 chords

- Add major chords (F, B, Ab, Bb, Eb)
- Add minor chords (Bm, Fm, Cm, Gm, Abm, Bbm, Ebm)
- Add 7th chords (D7, G7, C7, B7, Am7, Em7, Dm7)
- Add major 7th chords (Cmaj7, Gmaj7, Dmaj7, Amaj7, Emaj7)
- Add sus chords (Dsus2, Dsus4, Asus2, Asus4, Esus4)
- Add power chords (E5, A5, D5, G5, C5, F5)
- Add add9 chords (Cadd9, Gadd9, Dadd9)
- Add 6th chords (A6, E6, D6, Am6, Em6)
- Add diminished chords (Bdim, Cdim)
- Add augmented chords (Caug, Eaug)
- Update library filters

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>"
```

---

## Summary & Next Tasks

**Completed in this plan:**

1. Project initialization with Expo and TypeScript
2. Expo Router configuration with tab navigation
3. EAS Build configuration
4. Project structure with types, theme, and constants
5. Zustand stores for app, audio, and game state
6. ChordDiagram component
7. Chord Library screen with search and filtering
8. 50-chord database

**Remaining for Phase 1 MVP (next plan document):**

- Task 9: Create mock audio detection hook
- Task 10: Build Freeplay Mode screen
- Task 11: Create sample songs data
- Task 12: Build Game Mode screen with falling notes
- Task 13: Implement hit detection and scoring UI
- Task 14: Add Home screen with navigation cards
- Task 15: Native audio module placeholder (iOS/Android)

---

Plan complete and saved to `docs/plans/2026-01-29-phase1-mvp-implementation.md`.

**Two execution options:**

**1. Subagent-Driven (this session)** - I dispatch fresh subagent per task, review between tasks, fast iteration

**2. Parallel Session (separate)** - Open new session with executing-plans, batch execution with checkpoints

**Which approach?**
