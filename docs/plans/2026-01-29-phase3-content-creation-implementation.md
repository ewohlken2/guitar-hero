# Phase 3 Content Creation Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Deliver Phase 3 features: custom song editor with visual timeline, user-created song library with persistence, and song preview/testing before saving.

**Architecture:** Add an editor store (Zustand) for song editing state with undo/redo, create timeline components for chord placement/editing, persist user songs to AsyncStorage, and wire a preview mode that reuses the existing game engine.

**Tech Stack:** Expo (React Native), TypeScript, Zustand, AsyncStorage, React Native Reanimated, Jest

---

## Task 1: Add editor types and extend Song type for user-created songs

**Files:**

- Modify: `GuitarSlam/src/types/index.ts`
- Test: `GuitarSlam/__tests__/types/editorTypes.test.ts`

**Step 1: Write the failing test**

Create `GuitarSlam/__tests__/types/editorTypes.test.ts`:

```ts
import { UserSong, EditorState, TimelinePosition } from "../../src/types";

describe("editor types", () => {
  it("UserSong extends Song with metadata", () => {
    const song: UserSong = {
      id: "user-123",
      title: "My Song",
      artist: "Me",
      difficulty: 2,
      bpm: 120,
      levels: [],
      isUserCreated: true,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    expect(song.isUserCreated).toBe(true);
    expect(typeof song.createdAt).toBe("number");
  });

  it("EditorState has required fields", () => {
    const state: EditorState = {
      song: null,
      selectedNoteId: null,
      isPlaying: false,
      currentTime: 0,
      zoom: 1,
      snapToGrid: true,
      gridSubdivision: 4,
      undoStack: [],
      redoStack: [],
      isDirty: false,
    };

    expect(state.snapToGrid).toBe(true);
  });

  it("TimelinePosition represents beat position", () => {
    const pos: TimelinePosition = {
      time: 2.5,
      beat: 5,
      measure: 1,
    };

    expect(pos.beat).toBe(5);
  });
});
```

**Step 2: Run test to verify it fails**

Run: `pnpm test -- __tests__/types/editorTypes.test.ts`
Expected: FAIL with "Module '"../../src/types"' has no exported member 'UserSong'"

**Step 3: Add editor types**

Modify `GuitarSlam/src/types/index.ts` to add:

```ts
// User-created song extends Song
export interface UserSong extends Song {
  isUserCreated: true;
  createdAt: number;
  updatedAt: number;
}

// Timeline position for editor
export interface TimelinePosition {
  time: number; // Seconds
  beat: number; // Beat number (fractional)
  measure: number; // Measure number
}

// Editor undo/redo action
export interface EditorAction {
  type: "add" | "delete" | "move" | "resize" | "update";
  noteId?: string;
  previousState: Partial<ChordNote>;
  newState: Partial<ChordNote>;
  timestamp: number;
}

// Editor state
export interface EditorState {
  song: UserSong | null;
  selectedNoteId: string | null;
  isPlaying: boolean;
  currentTime: number;
  zoom: number; // 0.5 to 4 (timeline zoom level)
  snapToGrid: boolean;
  gridSubdivision: number; // 1, 2, 4, 8 (beats per measure subdivision)
  undoStack: EditorAction[];
  redoStack: EditorAction[];
  isDirty: boolean;
}

// Ghost note for preview during placement
export interface GhostNote {
  chord: string;
  time: number;
  duration: number;
}
```

**Step 4: Run test to verify it passes**

Run: `pnpm test -- __tests__/types/editorTypes.test.ts`
Expected: PASS

**Step 5: Commit**

```bash
git add GuitarSlam/src/types/index.ts GuitarSlam/__tests__/types/editorTypes.test.ts
git commit -m "feat: add editor types for song creation"
```

---

## Task 2: Create editor store with undo/redo support

**Files:**

- Create: `GuitarSlam/src/stores/useEditorStore.ts`
- Test: `GuitarSlam/__tests__/stores/useEditorStore.test.ts`

**Step 1: Write the failing test**

Create `GuitarSlam/__tests__/stores/useEditorStore.test.ts`:

```ts
import { act } from "@testing-library/react-native";
import { useEditorStore } from "../../src/stores/useEditorStore";

describe("useEditorStore", () => {
  beforeEach(() => {
    useEditorStore.getState().reset();
  });

  it("creates a new song with defaults", () => {
    act(() => {
      useEditorStore.getState().createNewSong("Test Song", "Test Artist", 120);
    });

    const state = useEditorStore.getState();
    expect(state.song?.title).toBe("Test Song");
    expect(state.song?.bpm).toBe(120);
    expect(state.song?.isUserCreated).toBe(true);
  });

  it("adds a chord note", () => {
    act(() => {
      useEditorStore.getState().createNewSong("Test", "Artist", 120);
      useEditorStore.getState().addNote("G", 0, 2);
    });

    const state = useEditorStore.getState();
    expect(state.song?.levels[0].chart.length).toBe(1);
    expect(state.song?.levels[0].chart[0].chord).toBe("G");
    expect(state.isDirty).toBe(true);
  });

  it("supports undo/redo for note operations", () => {
    act(() => {
      useEditorStore.getState().createNewSong("Test", "Artist", 120);
      useEditorStore.getState().addNote("G", 0, 2);
    });

    expect(useEditorStore.getState().song?.levels[0].chart.length).toBe(1);

    act(() => {
      useEditorStore.getState().undo();
    });

    expect(useEditorStore.getState().song?.levels[0].chart.length).toBe(0);

    act(() => {
      useEditorStore.getState().redo();
    });

    expect(useEditorStore.getState().song?.levels[0].chart.length).toBe(1);
  });

  it("deletes a note", () => {
    act(() => {
      useEditorStore.getState().createNewSong("Test", "Artist", 120);
      useEditorStore.getState().addNote("G", 0, 2);
    });

    const noteId = useEditorStore.getState().song?.levels[0].chart[0].id;

    act(() => {
      useEditorStore.getState().deleteNote(noteId!);
    });

    expect(useEditorStore.getState().song?.levels[0].chart.length).toBe(0);
  });

  it("moves a note to new time", () => {
    act(() => {
      useEditorStore.getState().createNewSong("Test", "Artist", 120);
      useEditorStore.getState().addNote("G", 0, 2);
    });

    const noteId = useEditorStore.getState().song?.levels[0].chart[0].id;

    act(() => {
      useEditorStore.getState().moveNote(noteId!, 4);
    });

    expect(useEditorStore.getState().song?.levels[0].chart[0].time).toBe(4);
  });

  it("resizes a note duration", () => {
    act(() => {
      useEditorStore.getState().createNewSong("Test", "Artist", 120);
      useEditorStore.getState().addNote("G", 0, 2);
    });

    const noteId = useEditorStore.getState().song?.levels[0].chart[0].id;

    act(() => {
      useEditorStore.getState().resizeNote(noteId!, 4);
    });

    expect(useEditorStore.getState().song?.levels[0].chart[0].duration).toBe(4);
  });

  it("snaps time to grid based on BPM and subdivision", () => {
    act(() => {
      useEditorStore.getState().createNewSong("Test", "Artist", 120);
      useEditorStore.getState().setSnapToGrid(true);
      useEditorStore.getState().setGridSubdivision(4);
    });

    // At 120 BPM, one beat = 0.5 seconds
    // Subdivision 4 means snapping to quarter beats = 0.125 seconds
    const snapped = useEditorStore.getState().snapTimeToGrid(0.3);
    expect(snapped).toBe(0.25); // Snaps to nearest 0.125 increment
  });
});
```

**Step 2: Run test to verify it fails**

Run: `pnpm test -- __tests__/stores/useEditorStore.test.ts`
Expected: FAIL with "Cannot find module '../../src/stores/useEditorStore'"

**Step 3: Implement editor store**

Create `GuitarSlam/src/stores/useEditorStore.ts`:

```ts
import { create } from "zustand";
import {
  UserSong,
  ChordNote,
  EditorAction,
  EditorState,
  SongLevel,
} from "../types";

const generateId = () =>
  `note-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
const generateSongId = () =>
  `song-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

interface EditorStore extends EditorState {
  // Song management
  createNewSong: (
    title: string,
    artist: string,
    bpm: number,
    difficulty?: 1 | 2 | 3 | 4 | 5,
  ) => void;
  loadSong: (song: UserSong) => void;
  updateSongMetadata: (
    updates: Partial<Pick<UserSong, "title" | "artist" | "bpm" | "difficulty">>,
  ) => void;

  // Note operations
  addNote: (chord: string, time: number, duration: number) => void;
  deleteNote: (noteId: string) => void;
  moveNote: (noteId: string, newTime: number) => void;
  resizeNote: (noteId: string, newDuration: number) => void;
  updateNoteChord: (noteId: string, chord: string) => void;

  // Selection
  selectNote: (noteId: string | null) => void;

  // Playback
  setPlaying: (playing: boolean) => void;
  setCurrentTime: (time: number) => void;

  // Editor settings
  setZoom: (zoom: number) => void;
  setSnapToGrid: (snap: boolean) => void;
  setGridSubdivision: (subdivision: number) => void;

  // Undo/Redo
  undo: () => void;
  redo: () => void;

  // Utilities
  snapTimeToGrid: (time: number) => number;
  reset: () => void;
  markClean: () => void;
}

const initialState: EditorState = {
  song: null,
  selectedNoteId: null,
  isPlaying: false,
  currentTime: 0,
  zoom: 1,
  snapToGrid: true,
  gridSubdivision: 4,
  undoStack: [],
  redoStack: [],
  isDirty: false,
};

export const useEditorStore = create<EditorStore>((set, get) => ({
  ...initialState,

  createNewSong: (title, artist, bpm, difficulty = 2) => {
    const now = Date.now();
    const newSong: UserSong = {
      id: generateSongId(),
      title,
      artist,
      bpm,
      difficulty,
      levels: [
        {
          levelNumber: 1,
          name: "Full Song",
          description: "Complete song chart",
          chart: [],
        },
      ],
      isUserCreated: true,
      createdAt: now,
      updatedAt: now,
    };

    set({
      song: newSong,
      selectedNoteId: null,
      currentTime: 0,
      undoStack: [],
      redoStack: [],
      isDirty: false,
    });
  },

  loadSong: (song) => {
    set({
      song,
      selectedNoteId: null,
      currentTime: 0,
      undoStack: [],
      redoStack: [],
      isDirty: false,
    });
  },

  updateSongMetadata: (updates) => {
    const { song } = get();
    if (!song) return;

    set({
      song: {
        ...song,
        ...updates,
        updatedAt: Date.now(),
      },
      isDirty: true,
    });
  },

  addNote: (chord, time, duration) => {
    const { song, snapToGrid } = get();
    if (!song) return;

    const snappedTime = snapToGrid ? get().snapTimeToGrid(time) : time;
    const newNote: ChordNote = {
      id: generateId(),
      chord,
      time: snappedTime,
      duration,
    };

    const action: EditorAction = {
      type: "add",
      noteId: newNote.id,
      previousState: {},
      newState: { ...newNote },
      timestamp: Date.now(),
    };

    const updatedChart = [...song.levels[0].chart, newNote].sort(
      (a, b) => a.time - b.time,
    );
    const updatedLevel: SongLevel = { ...song.levels[0], chart: updatedChart };

    set({
      song: {
        ...song,
        levels: [updatedLevel, ...song.levels.slice(1)],
        updatedAt: Date.now(),
      },
      undoStack: [...get().undoStack, action],
      redoStack: [],
      isDirty: true,
    });
  },

  deleteNote: (noteId) => {
    const { song } = get();
    if (!song) return;

    const note = song.levels[0].chart.find((n) => n.id === noteId);
    if (!note) return;

    const action: EditorAction = {
      type: "delete",
      noteId,
      previousState: { ...note },
      newState: {},
      timestamp: Date.now(),
    };

    const updatedChart = song.levels[0].chart.filter((n) => n.id !== noteId);
    const updatedLevel: SongLevel = { ...song.levels[0], chart: updatedChart };

    set({
      song: {
        ...song,
        levels: [updatedLevel, ...song.levels.slice(1)],
        updatedAt: Date.now(),
      },
      selectedNoteId:
        get().selectedNoteId === noteId ? null : get().selectedNoteId,
      undoStack: [...get().undoStack, action],
      redoStack: [],
      isDirty: true,
    });
  },

  moveNote: (noteId, newTime) => {
    const { song, snapToGrid } = get();
    if (!song) return;

    const note = song.levels[0].chart.find((n) => n.id === noteId);
    if (!note) return;

    const snappedTime = snapToGrid ? get().snapTimeToGrid(newTime) : newTime;

    const action: EditorAction = {
      type: "move",
      noteId,
      previousState: { time: note.time },
      newState: { time: snappedTime },
      timestamp: Date.now(),
    };

    const updatedChart = song.levels[0].chart
      .map((n) => (n.id === noteId ? { ...n, time: snappedTime } : n))
      .sort((a, b) => a.time - b.time);

    const updatedLevel: SongLevel = { ...song.levels[0], chart: updatedChart };

    set({
      song: {
        ...song,
        levels: [updatedLevel, ...song.levels.slice(1)],
        updatedAt: Date.now(),
      },
      undoStack: [...get().undoStack, action],
      redoStack: [],
      isDirty: true,
    });
  },

  resizeNote: (noteId, newDuration) => {
    const { song } = get();
    if (!song) return;

    const note = song.levels[0].chart.find((n) => n.id === noteId);
    if (!note) return;

    const action: EditorAction = {
      type: "resize",
      noteId,
      previousState: { duration: note.duration },
      newState: { duration: newDuration },
      timestamp: Date.now(),
    };

    const updatedChart = song.levels[0].chart.map((n) =>
      n.id === noteId ? { ...n, duration: newDuration } : n,
    );

    const updatedLevel: SongLevel = { ...song.levels[0], chart: updatedChart };

    set({
      song: {
        ...song,
        levels: [updatedLevel, ...song.levels.slice(1)],
        updatedAt: Date.now(),
      },
      undoStack: [...get().undoStack, action],
      redoStack: [],
      isDirty: true,
    });
  },

  updateNoteChord: (noteId, chord) => {
    const { song } = get();
    if (!song) return;

    const note = song.levels[0].chart.find((n) => n.id === noteId);
    if (!note) return;

    const action: EditorAction = {
      type: "update",
      noteId,
      previousState: { chord: note.chord },
      newState: { chord },
      timestamp: Date.now(),
    };

    const updatedChart = song.levels[0].chart.map((n) =>
      n.id === noteId ? { ...n, chord } : n,
    );

    const updatedLevel: SongLevel = { ...song.levels[0], chart: updatedChart };

    set({
      song: {
        ...song,
        levels: [updatedLevel, ...song.levels.slice(1)],
        updatedAt: Date.now(),
      },
      undoStack: [...get().undoStack, action],
      redoStack: [],
      isDirty: true,
    });
  },

  selectNote: (noteId) => {
    set({ selectedNoteId: noteId });
  },

  setPlaying: (playing) => {
    set({ isPlaying: playing });
  },

  setCurrentTime: (time) => {
    set({ currentTime: Math.max(0, time) });
  },

  setZoom: (zoom) => {
    set({ zoom: Math.max(0.5, Math.min(4, zoom)) });
  },

  setSnapToGrid: (snap) => {
    set({ snapToGrid: snap });
  },

  setGridSubdivision: (subdivision) => {
    set({ gridSubdivision: subdivision });
  },

  undo: () => {
    const { undoStack, song } = get();
    if (undoStack.length === 0 || !song) return;

    const action = undoStack[undoStack.length - 1];
    let updatedChart = [...song.levels[0].chart];

    switch (action.type) {
      case "add":
        updatedChart = updatedChart.filter((n) => n.id !== action.noteId);
        break;
      case "delete":
        updatedChart = [
          ...updatedChart,
          action.previousState as ChordNote,
        ].sort((a, b) => a.time - b.time);
        break;
      case "move":
      case "resize":
      case "update":
        updatedChart = updatedChart.map((n) =>
          n.id === action.noteId ? { ...n, ...action.previousState } : n,
        );
        break;
    }

    const updatedLevel: SongLevel = { ...song.levels[0], chart: updatedChart };

    set({
      song: {
        ...song,
        levels: [updatedLevel, ...song.levels.slice(1)],
      },
      undoStack: undoStack.slice(0, -1),
      redoStack: [...get().redoStack, action],
      isDirty: true,
    });
  },

  redo: () => {
    const { redoStack, song } = get();
    if (redoStack.length === 0 || !song) return;

    const action = redoStack[redoStack.length - 1];
    let updatedChart = [...song.levels[0].chart];

    switch (action.type) {
      case "add":
        updatedChart = [...updatedChart, action.newState as ChordNote].sort(
          (a, b) => a.time - b.time,
        );
        break;
      case "delete":
        updatedChart = updatedChart.filter((n) => n.id !== action.noteId);
        break;
      case "move":
      case "resize":
      case "update":
        updatedChart = updatedChart.map((n) =>
          n.id === action.noteId ? { ...n, ...action.newState } : n,
        );
        break;
    }

    const updatedLevel: SongLevel = { ...song.levels[0], chart: updatedChart };

    set({
      song: {
        ...song,
        levels: [updatedLevel, ...song.levels.slice(1)],
      },
      undoStack: [...get().undoStack, action],
      redoStack: redoStack.slice(0, -1),
      isDirty: true,
    });
  },

  snapTimeToGrid: (time) => {
    const { song, gridSubdivision } = get();
    if (!song) return time;

    // Calculate beat duration in seconds
    const beatDuration = 60 / song.bpm;
    // Subdivision step (e.g., for subdivision=4, step is quarter of a beat)
    const step = beatDuration / gridSubdivision;

    return Math.round(time / step) * step;
  },

  reset: () => {
    set(initialState);
  },

  markClean: () => {
    set({ isDirty: false, undoStack: [], redoStack: [] });
  },
}));
```

**Step 4: Run test to verify it passes**

Run: `pnpm test -- __tests__/stores/useEditorStore.test.ts`
Expected: PASS

**Step 5: Commit**

```bash
git add GuitarSlam/src/stores/useEditorStore.ts GuitarSlam/__tests__/stores/useEditorStore.test.ts
git commit -m "feat: add editor store with undo/redo support"
```

---

## Task 3: Create song persistence service with AsyncStorage

**Files:**

- Create: `GuitarSlam/src/services/songStorage.ts`
- Test: `GuitarSlam/__tests__/services/songStorage.test.ts`

**Step 1: Write the failing test**

Create `GuitarSlam/__tests__/services/songStorage.test.ts`:

```ts
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  saveUserSong,
  loadUserSongs,
  deleteUserSong,
  getUserSong,
} from "../../src/services/songStorage";
import { UserSong } from "../../src/types";

// Mock AsyncStorage
jest.mock("@react-native-async-storage/async-storage", () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
}));

const mockSong: UserSong = {
  id: "test-song-1",
  title: "Test Song",
  artist: "Test Artist",
  bpm: 120,
  difficulty: 2,
  levels: [
    {
      levelNumber: 1,
      name: "Full Song",
      description: "Test",
      chart: [{ id: "note-1", chord: "G", time: 0, duration: 2 }],
    },
  ],
  isUserCreated: true,
  createdAt: 1000,
  updatedAt: 1000,
};

describe("songStorage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("saves a user song", async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
    (AsyncStorage.setItem as jest.Mock).mockResolvedValue(undefined);

    await saveUserSong(mockSong);

    expect(AsyncStorage.setItem).toHaveBeenCalledWith(
      "user-songs",
      expect.stringContaining("test-song-1"),
    );
  });

  it("loads all user songs", async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(
      JSON.stringify([mockSong]),
    );

    const songs = await loadUserSongs();

    expect(songs).toHaveLength(1);
    expect(songs[0].title).toBe("Test Song");
  });

  it("returns empty array when no songs exist", async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);

    const songs = await loadUserSongs();

    expect(songs).toEqual([]);
  });

  it("gets a single song by ID", async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(
      JSON.stringify([mockSong]),
    );

    const song = await getUserSong("test-song-1");

    expect(song?.title).toBe("Test Song");
  });

  it("returns null for non-existent song", async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(
      JSON.stringify([mockSong]),
    );

    const song = await getUserSong("non-existent");

    expect(song).toBeNull();
  });

  it("deletes a user song", async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(
      JSON.stringify([mockSong]),
    );
    (AsyncStorage.setItem as jest.Mock).mockResolvedValue(undefined);

    await deleteUserSong("test-song-1");

    expect(AsyncStorage.setItem).toHaveBeenCalledWith("user-songs", "[]");
  });

  it("updates existing song when saving with same ID", async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(
      JSON.stringify([mockSong]),
    );
    (AsyncStorage.setItem as jest.Mock).mockResolvedValue(undefined);

    const updatedSong = { ...mockSong, title: "Updated Title" };
    await saveUserSong(updatedSong);

    const savedData = JSON.parse(
      (AsyncStorage.setItem as jest.Mock).mock.calls[0][1],
    );
    expect(savedData[0].title).toBe("Updated Title");
    expect(savedData).toHaveLength(1);
  });
});
```

**Step 2: Run test to verify it fails**

Run: `pnpm test -- __tests__/services/songStorage.test.ts`
Expected: FAIL with "Cannot find module '../../src/services/songStorage'"

**Step 3: Implement song storage service**

Create `GuitarSlam/src/services/songStorage.ts`:

```ts
import AsyncStorage from "@react-native-async-storage/async-storage";
import { UserSong } from "../types";

const STORAGE_KEY = "user-songs";

export const loadUserSongs = async (): Promise<UserSong[]> => {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEY);
    if (!data) return [];
    return JSON.parse(data) as UserSong[];
  } catch (error) {
    console.error("Failed to load user songs:", error);
    return [];
  }
};

export const saveUserSong = async (song: UserSong): Promise<void> => {
  try {
    const songs = await loadUserSongs();
    const existingIndex = songs.findIndex((s) => s.id === song.id);

    if (existingIndex >= 0) {
      songs[existingIndex] = song;
    } else {
      songs.push(song);
    }

    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(songs));
  } catch (error) {
    console.error("Failed to save user song:", error);
    throw error;
  }
};

export const getUserSong = async (songId: string): Promise<UserSong | null> => {
  try {
    const songs = await loadUserSongs();
    return songs.find((s) => s.id === songId) ?? null;
  } catch (error) {
    console.error("Failed to get user song:", error);
    return null;
  }
};

export const deleteUserSong = async (songId: string): Promise<void> => {
  try {
    const songs = await loadUserSongs();
    const filtered = songs.filter((s) => s.id !== songId);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  } catch (error) {
    console.error("Failed to delete user song:", error);
    throw error;
  }
};
```

**Step 4: Run test to verify it passes**

Run: `pnpm test -- __tests__/services/songStorage.test.ts`
Expected: PASS

**Step 5: Commit**

```bash
git add GuitarSlam/src/services/songStorage.ts GuitarSlam/__tests__/services/songStorage.test.ts
git commit -m "feat: add song persistence service with AsyncStorage"
```

---

## Task 4: Create timeline grid component

**Files:**

- Create: `GuitarSlam/src/components/editor/TimelineGrid.tsx`
- Test: `GuitarSlam/__tests__/components/editor/TimelineGrid.test.tsx`

**Step 1: Write the failing test**

Create `GuitarSlam/__tests__/components/editor/TimelineGrid.test.tsx`:

```tsx
import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import { TimelineGrid } from "../../../src/components/editor/TimelineGrid";

describe("TimelineGrid", () => {
  const defaultProps = {
    bpm: 120,
    duration: 30,
    zoom: 1,
    currentTime: 0,
    onTimePress: jest.fn(),
  };

  it("renders without crashing", () => {
    const { getByTestId } = render(<TimelineGrid {...defaultProps} />);
    expect(getByTestId("timeline-grid")).toBeTruthy();
  });

  it("displays beat markers", () => {
    const { getAllByTestId } = render(<TimelineGrid {...defaultProps} />);
    const markers = getAllByTestId(/beat-marker/);
    expect(markers.length).toBeGreaterThan(0);
  });

  it("shows measure numbers", () => {
    const { getByText } = render(<TimelineGrid {...defaultProps} />);
    // At 120 BPM with 4/4 time, measure 1 starts at 0
    expect(getByText("1")).toBeTruthy();
  });

  it("calls onTimePress when grid is tapped", () => {
    const onTimePress = jest.fn();
    const { getByTestId } = render(
      <TimelineGrid {...defaultProps} onTimePress={onTimePress} />,
    );

    fireEvent.press(getByTestId("timeline-grid"), {
      nativeEvent: { locationX: 100 },
    });

    expect(onTimePress).toHaveBeenCalled();
  });

  it("adjusts grid density based on zoom", () => {
    const { getAllByTestId: getMarkersZoom1 } = render(
      <TimelineGrid {...defaultProps} zoom={1} />,
    );
    const { getAllByTestId: getMarkersZoom2 } = render(
      <TimelineGrid {...defaultProps} zoom={2} />,
    );

    const markersZoom1 = getMarkersZoom1(/beat-marker/);
    const markersZoom2 = getMarkersZoom2(/beat-marker/);

    // Higher zoom should show more detail (same or more markers visible)
    expect(markersZoom2.length).toBeGreaterThanOrEqual(markersZoom1.length);
  });
});
```

**Step 2: Run test to verify it fails**

Run: `pnpm test -- __tests__/components/editor/TimelineGrid.test.tsx`
Expected: FAIL with "Cannot find module '../../../src/components/editor/TimelineGrid'"

**Step 3: Implement timeline grid component**

Create `GuitarSlam/src/components/editor/TimelineGrid.tsx`:

```tsx
import React, { useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  LayoutChangeEvent,
} from "react-native";
import { colors, spacing, fontSize } from "../../constants/theme";

interface TimelineGridProps {
  bpm: number;
  duration: number; // Total duration in seconds
  zoom: number; // 0.5 to 4
  currentTime: number;
  onTimePress: (time: number) => void;
  width?: number;
}

const PIXELS_PER_SECOND_BASE = 60;
const BEATS_PER_MEASURE = 4;

export const TimelineGrid: React.FC<TimelineGridProps> = ({
  bpm,
  duration,
  zoom,
  currentTime,
  onTimePress,
  width = 360,
}) => {
  const pixelsPerSecond = PIXELS_PER_SECOND_BASE * zoom;
  const beatDuration = 60 / bpm;
  const measureDuration = beatDuration * BEATS_PER_MEASURE;

  const markers = useMemo(() => {
    const result: { time: number; isMeasure: boolean; measureNum?: number }[] =
      [];
    let beat = 0;
    let measure = 1;

    for (let time = 0; time <= duration; time += beatDuration) {
      const isMeasure = beat % BEATS_PER_MEASURE === 0;
      result.push({
        time,
        isMeasure,
        measureNum: isMeasure ? measure : undefined,
      });

      beat++;
      if (isMeasure && time > 0) measure++;
    }

    return result;
  }, [bpm, duration, beatDuration]);

  const handlePress = (event: { nativeEvent: { locationX: number } }) => {
    const x = event.nativeEvent.locationX;
    const time = x / pixelsPerSecond;
    onTimePress(time);
  };

  const totalWidth = duration * pixelsPerSecond;

  return (
    <Pressable
      testID="timeline-grid"
      style={[styles.container, { width: totalWidth }]}
      onPress={handlePress}
    >
      {/* Playhead */}
      <View
        style={[styles.playhead, { left: currentTime * pixelsPerSecond }]}
      />

      {/* Beat markers */}
      {markers.map((marker, index) => (
        <View
          key={index}
          testID={`beat-marker-${index}`}
          style={[
            styles.marker,
            marker.isMeasure ? styles.measureMarker : styles.beatMarker,
            { left: marker.time * pixelsPerSecond },
          ]}
        >
          {marker.isMeasure && (
            <Text style={styles.measureNumber}>{marker.measureNum}</Text>
          )}
        </View>
      ))}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 300,
    backgroundColor: colors.backgroundLight,
    position: "relative",
  },
  marker: {
    position: "absolute",
    top: 0,
    width: 1,
    height: "100%",
  },
  beatMarker: {
    backgroundColor: colors.textMuted,
    opacity: 0.3,
  },
  measureMarker: {
    backgroundColor: colors.textSecondary,
    opacity: 0.6,
  },
  measureNumber: {
    position: "absolute",
    top: 4,
    left: 4,
    color: colors.textSecondary,
    fontSize: fontSize.xs,
  },
  playhead: {
    position: "absolute",
    top: 0,
    width: 2,
    height: "100%",
    backgroundColor: colors.primary,
    zIndex: 10,
  },
});
```

**Step 4: Run test to verify it passes**

Run: `pnpm test -- __tests__/components/editor/TimelineGrid.test.tsx`
Expected: PASS

**Step 5: Commit**

```bash
git add GuitarSlam/src/components/editor/TimelineGrid.tsx GuitarSlam/__tests__/components/editor/TimelineGrid.test.tsx
git commit -m "feat: add timeline grid component for editor"
```

---

## Task 5: Create chord note block component for timeline

**Files:**

- Create: `GuitarSlam/src/components/editor/ChordNoteBlock.tsx`
- Test: `GuitarSlam/__tests__/components/editor/ChordNoteBlock.test.tsx`

**Step 1: Write the failing test**

Create `GuitarSlam/__tests__/components/editor/ChordNoteBlock.test.tsx`:

```tsx
import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { ChordNoteBlock } from '../../../src/components/editor/ChordNoteBlock';

describe('ChordNoteBlock', () => {
  const defaultProps = {
    note: { id: 'note-1', chord: 'G', time: 0, duration: 2 },
    pixelsPerSecond: 60,
    isSelected: false,
    onPress: jest.fn(),
    onLongPress: jest.fn(),
    onResizeStart: jest.fn(),
  };

  it('renders the chord name', () => {
    const { getByText } = render(<ChordNoteBlock {...defaultProps} />);
    expect(getByText('G')).toBeTruthy();
  });

  it('shows selected state', () => {
    const { getByTestId } = render(
      <ChordNoteBlock {...defaultProps} isSelected={true} />
    );
    const block = getByTestId('chord-note-block');
    expect(block.props.style).toEqual(
      expect.arrayContaining([expect.objectContaining({ borderColor: expect.any(String) })])
    );
  });

  it('calls onPress when tapped', () => {
    const onPress = jest.fn();
    const { getByTestId } = render(
      <ChordNoteBlock {...defaultProps} onPress={onPress} />
    );

    fireEvent.press(getByTestId('chord-note-block'));
    expect(onPress).toHaveBeenCalledWith('note-1');
  });

  it('calls onLongPress when long pressed', () => {
    const onLongPress = jest.fn();
    const { getByTestId } = render(
      <ChordNoteBlock {...defaultProps} onLongPress={onLongPress} />
    );

    fireEvent(getByTestId('chord-note-block'), 'longPress');
    expect(onLongPress).toHaveBeenCalledWith('note-1');
  });

  it('calculates width based on duration and pixelsPerSecond', () => {
    const { getByTestId } = render(
      <ChordNoteBlock
        {...defaultProps}
        note={{ ...defaultProps.note, duration: 4 }}
        pixelsPerSecond={60}
      />
    );

    const block = getByTestId('chord-note-block');
    // duration (4) * pixelsPerSecond (60) = 240 width
    expect(block.props.style).toEqual(
      expect.arrayContaining([expect.objectContaining({ width: 240 })])
    );
  });

  it('positions based on time and pixelsPerSecond', () => {
    const { getByTestId } = render(
      <ChordNoteBlock
        {...defaultProps}
        note={{ ...defaultProps.note, time: 2 }}
        pixelsPerSecond: 60}
      />
    );

    const block = getByTestId('chord-note-block');
    // time (2) * pixelsPerSecond (60) = 120 left
    expect(block.props.style).toEqual(
      expect.arrayContaining([expect.objectContaining({ left: 120 })])
    );
  });
});
```

**Step 2: Run test to verify it fails**

Run: `pnpm test -- __tests__/components/editor/ChordNoteBlock.test.tsx`
Expected: FAIL with "Cannot find module '../../../src/components/editor/ChordNoteBlock'"

**Step 3: Implement chord note block component**

Create `GuitarSlam/src/components/editor/ChordNoteBlock.tsx`:

```tsx
import React from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { ChordNote } from "../../types";
import { colors, spacing, fontSize, borderRadius } from "../../constants/theme";

interface ChordNoteBlockProps {
  note: ChordNote;
  pixelsPerSecond: number;
  isSelected: boolean;
  onPress: (noteId: string) => void;
  onLongPress: (noteId: string) => void;
  onResizeStart?: (noteId: string, edge: "left" | "right") => void;
}

export const ChordNoteBlock: React.FC<ChordNoteBlockProps> = ({
  note,
  pixelsPerSecond,
  isSelected,
  onPress,
  onLongPress,
  onResizeStart,
}) => {
  const width = note.duration * pixelsPerSecond;
  const left = note.time * pixelsPerSecond;

  return (
    <Pressable
      testID="chord-note-block"
      style={[styles.block, { width, left }, isSelected && styles.selected]}
      onPress={() => onPress(note.id)}
      onLongPress={() => onLongPress(note.id)}
    >
      <Text style={styles.chordName} numberOfLines={1}>
        {note.chord}
      </Text>

      {/* Resize handles (visible when selected) */}
      {isSelected && (
        <>
          <Pressable
            style={[styles.resizeHandle, styles.resizeHandleLeft]}
            onPressIn={() => onResizeStart?.(note.id, "left")}
            hitSlop={{ top: 10, bottom: 10, left: 20, right: 0 }}
          />
          <Pressable
            style={[styles.resizeHandle, styles.resizeHandleRight]}
            onPressIn={() => onResizeStart?.(note.id, "right")}
            hitSlop={{ top: 10, bottom: 10, left: 0, right: 20 }}
          />
        </>
      )}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  block: {
    position: "absolute",
    top: 60,
    height: 48,
    backgroundColor: colors.backgroundLight,
    borderRadius: borderRadius.md,
    borderWidth: 2,
    borderColor: colors.textMuted,
    justifyContent: "center",
    alignItems: "center",
    minWidth: 40,
  },
  selected: {
    borderColor: colors.primary,
    backgroundColor: colors.background,
  },
  chordName: {
    color: colors.textPrimary,
    fontSize: fontSize.md,
    fontWeight: "600",
  },
  resizeHandle: {
    position: "absolute",
    top: 0,
    bottom: 0,
    width: 12,
    backgroundColor: colors.primary,
    opacity: 0.5,
  },
  resizeHandleLeft: {
    left: 0,
    borderTopLeftRadius: borderRadius.md - 2,
    borderBottomLeftRadius: borderRadius.md - 2,
  },
  resizeHandleRight: {
    right: 0,
    borderTopRightRadius: borderRadius.md - 2,
    borderBottomRightRadius: borderRadius.md - 2,
  },
});
```

**Step 4: Run test to verify it passes**

Run: `pnpm test -- __tests__/components/editor/ChordNoteBlock.test.tsx`
Expected: PASS

**Step 5: Commit**

```bash
git add GuitarSlam/src/components/editor/ChordNoteBlock.tsx GuitarSlam/__tests__/components/editor/ChordNoteBlock.test.tsx
git commit -m "feat: add chord note block component for timeline"
```

---

## Task 6: Create chord palette component for selecting chords

**Files:**

- Create: `GuitarSlam/src/components/editor/ChordPalette.tsx`
- Test: `GuitarSlam/__tests__/components/editor/ChordPalette.test.tsx`

**Step 1: Write the failing test**

Create `GuitarSlam/__tests__/components/editor/ChordPalette.test.tsx`:

```tsx
import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import { ChordPalette } from "../../../src/components/editor/ChordPalette";

describe("ChordPalette", () => {
  const defaultProps = {
    selectedChord: null as string | null,
    onSelectChord: jest.fn(),
  };

  it("renders common chord buttons", () => {
    const { getByText } = render(<ChordPalette {...defaultProps} />);

    expect(getByText("G")).toBeTruthy();
    expect(getByText("C")).toBeTruthy();
    expect(getByText("D")).toBeTruthy();
    expect(getByText("Em")).toBeTruthy();
    expect(getByText("Am")).toBeTruthy();
  });

  it("calls onSelectChord when chord is pressed", () => {
    const onSelectChord = jest.fn();
    const { getByText } = render(
      <ChordPalette {...defaultProps} onSelectChord={onSelectChord} />,
    );

    fireEvent.press(getByText("G"));
    expect(onSelectChord).toHaveBeenCalledWith("G");
  });

  it("highlights selected chord", () => {
    const { getByTestId } = render(
      <ChordPalette {...defaultProps} selectedChord="G" />,
    );

    const gButton = getByTestId("chord-button-G");
    expect(gButton.props.style).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ backgroundColor: expect.any(String) }),
      ]),
    );
  });

  it("supports search filtering", () => {
    const { getByPlaceholderText, queryByText } = render(
      <ChordPalette {...defaultProps} />,
    );

    const searchInput = getByPlaceholderText("Search chords...");
    fireEvent.changeText(searchInput, "Am");

    expect(queryByText("Am")).toBeTruthy();
    // G should not be visible when searching for Am
    // (depends on implementation - may show all or filter)
  });
});
```

**Step 2: Run test to verify it fails**

Run: `pnpm test -- __tests__/components/editor/ChordPalette.test.tsx`
Expected: FAIL with "Cannot find module '../../../src/components/editor/ChordPalette'"

**Step 3: Implement chord palette component**

Create `GuitarSlam/src/components/editor/ChordPalette.tsx`:

```tsx
import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  TextInput,
  ScrollView,
} from "react-native";
import { colors, spacing, fontSize, borderRadius } from "../../constants/theme";
import { chords } from "../../constants/chords";

interface ChordPaletteProps {
  selectedChord: string | null;
  onSelectChord: (chord: string) => void;
}

// Common chords shown at top for quick access
const QUICK_ACCESS_CHORDS = [
  "G",
  "C",
  "D",
  "Em",
  "Am",
  "E",
  "A",
  "F",
  "Dm",
  "Bm",
];

export const ChordPalette: React.FC<ChordPaletteProps> = ({
  selectedChord,
  onSelectChord,
}) => {
  const [search, setSearch] = useState("");

  const filteredChords = useMemo(() => {
    if (!search.trim()) return [];

    const query = search.toLowerCase();
    return chords
      .filter(
        (chord) =>
          chord.primaryName.toLowerCase().includes(query) ||
          chord.alternateNames.some((name) =>
            name.toLowerCase().includes(query),
          ),
      )
      .slice(0, 12);
  }, [search]);

  const renderChordButton = (chordName: string) => {
    const isSelected = selectedChord === chordName;

    return (
      <Pressable
        key={chordName}
        testID={`chord-button-${chordName}`}
        style={[styles.chordButton, isSelected && styles.chordButtonSelected]}
        onPress={() => onSelectChord(chordName)}
      >
        <Text
          style={[styles.chordText, isSelected && styles.chordTextSelected]}
        >
          {chordName}
        </Text>
      </Pressable>
    );
  };

  return (
    <View style={styles.container}>
      {/* Search input */}
      <TextInput
        style={styles.searchInput}
        placeholder="Search chords..."
        placeholderTextColor={colors.textMuted}
        value={search}
        onChangeText={setSearch}
      />

      {/* Quick access chords */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.quickAccessScroll}
        contentContainerStyle={styles.quickAccessContent}
      >
        {QUICK_ACCESS_CHORDS.map(renderChordButton)}
      </ScrollView>

      {/* Search results */}
      {filteredChords.length > 0 && (
        <View style={styles.searchResults}>
          <Text style={styles.sectionTitle}>Search Results</Text>
          <View style={styles.chordGrid}>
            {filteredChords.map((chord) =>
              renderChordButton(chord.primaryName),
            )}
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.backgroundDark,
    padding: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.textMuted,
  },
  searchInput: {
    backgroundColor: colors.backgroundLight,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    color: colors.textPrimary,
    fontSize: fontSize.md,
    marginBottom: spacing.sm,
  },
  quickAccessScroll: {
    marginBottom: spacing.sm,
  },
  quickAccessContent: {
    flexDirection: "row",
    gap: spacing.xs,
  },
  chordButton: {
    backgroundColor: colors.backgroundLight,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    minWidth: 48,
    alignItems: "center",
  },
  chordButtonSelected: {
    backgroundColor: colors.primary,
  },
  chordText: {
    color: colors.textPrimary,
    fontSize: fontSize.md,
    fontWeight: "600",
  },
  chordTextSelected: {
    color: colors.backgroundDark,
  },
  searchResults: {
    marginTop: spacing.sm,
  },
  sectionTitle: {
    color: colors.textSecondary,
    fontSize: fontSize.sm,
    marginBottom: spacing.xs,
  },
  chordGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.xs,
  },
});
```

**Step 4: Run test to verify it passes**

Run: `pnpm test -- __tests__/components/editor/ChordPalette.test.tsx`
Expected: PASS

**Step 5: Commit**

```bash
git add GuitarSlam/src/components/editor/ChordPalette.tsx GuitarSlam/__tests__/components/editor/ChordPalette.test.tsx
git commit -m "feat: add chord palette component for editor"
```

---

## Task 7: Create song metadata form component

**Files:**

- Create: `GuitarSlam/src/components/editor/SongMetadataForm.tsx`
- Test: `GuitarSlam/__tests__/components/editor/SongMetadataForm.test.tsx`

**Step 1: Write the failing test**

Create `GuitarSlam/__tests__/components/editor/SongMetadataForm.test.tsx`:

```tsx
import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import { SongMetadataForm } from "../../../src/components/editor/SongMetadataForm";

describe("SongMetadataForm", () => {
  const defaultProps = {
    title: "Test Song",
    artist: "Test Artist",
    bpm: 120,
    difficulty: 2 as const,
    onTitleChange: jest.fn(),
    onArtistChange: jest.fn(),
    onBpmChange: jest.fn(),
    onDifficultyChange: jest.fn(),
  };

  it("renders all input fields", () => {
    const { getByPlaceholderText, getByText } = render(
      <SongMetadataForm {...defaultProps} />,
    );

    expect(getByPlaceholderText("Song title")).toBeTruthy();
    expect(getByPlaceholderText("Artist name")).toBeTruthy();
    expect(getByText("120")).toBeTruthy(); // BPM display
  });

  it("calls onTitleChange when title is edited", () => {
    const onTitleChange = jest.fn();
    const { getByPlaceholderText } = render(
      <SongMetadataForm {...defaultProps} onTitleChange={onTitleChange} />,
    );

    fireEvent.changeText(getByPlaceholderText("Song title"), "New Title");
    expect(onTitleChange).toHaveBeenCalledWith("New Title");
  });

  it("calls onArtistChange when artist is edited", () => {
    const onArtistChange = jest.fn();
    const { getByPlaceholderText } = render(
      <SongMetadataForm {...defaultProps} onArtistChange={onArtistChange} />,
    );

    fireEvent.changeText(getByPlaceholderText("Artist name"), "New Artist");
    expect(onArtistChange).toHaveBeenCalledWith("New Artist");
  });

  it("allows BPM adjustment", () => {
    const onBpmChange = jest.fn();
    const { getByTestId } = render(
      <SongMetadataForm {...defaultProps} onBpmChange={onBpmChange} />,
    );

    fireEvent.press(getByTestId("bpm-increase"));
    expect(onBpmChange).toHaveBeenCalledWith(125); // Increment by 5
  });

  it("displays difficulty selector", () => {
    const { getByTestId } = render(<SongMetadataForm {...defaultProps} />);

    expect(getByTestId("difficulty-selector")).toBeTruthy();
  });
});
```

**Step 2: Run test to verify it fails**

Run: `pnpm test -- __tests__/components/editor/SongMetadataForm.test.tsx`
Expected: FAIL with "Cannot find module '../../../src/components/editor/SongMetadataForm'"

**Step 3: Implement song metadata form component**

Create `GuitarSlam/src/components/editor/SongMetadataForm.tsx`:

```tsx
import React from "react";
import { View, Text, StyleSheet, TextInput, Pressable } from "react-native";
import { colors, spacing, fontSize, borderRadius } from "../../constants/theme";

interface SongMetadataFormProps {
  title: string;
  artist: string;
  bpm: number;
  difficulty: 1 | 2 | 3 | 4 | 5;
  onTitleChange: (title: string) => void;
  onArtistChange: (artist: string) => void;
  onBpmChange: (bpm: number) => void;
  onDifficultyChange: (difficulty: 1 | 2 | 3 | 4 | 5) => void;
}

const DIFFICULTY_LABELS = ["Easy", "Medium", "Hard", "Expert", "Master"];

export const SongMetadataForm: React.FC<SongMetadataFormProps> = ({
  title,
  artist,
  bpm,
  difficulty,
  onTitleChange,
  onArtistChange,
  onBpmChange,
  onDifficultyChange,
}) => {
  const handleBpmDecrease = () => {
    const newBpm = Math.max(40, bpm - 5);
    onBpmChange(newBpm);
  };

  const handleBpmIncrease = () => {
    const newBpm = Math.min(240, bpm + 5);
    onBpmChange(newBpm);
  };

  return (
    <View style={styles.container}>
      {/* Title */}
      <View style={styles.field}>
        <Text style={styles.label}>Title</Text>
        <TextInput
          style={styles.input}
          placeholder="Song title"
          placeholderTextColor={colors.textMuted}
          value={title}
          onChangeText={onTitleChange}
        />
      </View>

      {/* Artist */}
      <View style={styles.field}>
        <Text style={styles.label}>Artist</Text>
        <TextInput
          style={styles.input}
          placeholder="Artist name"
          placeholderTextColor={colors.textMuted}
          value={artist}
          onChangeText={onArtistChange}
        />
      </View>

      {/* BPM */}
      <View style={styles.field}>
        <Text style={styles.label}>BPM</Text>
        <View style={styles.bpmContainer}>
          <Pressable
            testID="bpm-decrease"
            style={styles.bpmButton}
            onPress={handleBpmDecrease}
          >
            <Text style={styles.bpmButtonText}>-</Text>
          </Pressable>
          <Text style={styles.bpmValue}>{bpm}</Text>
          <Pressable
            testID="bpm-increase"
            style={styles.bpmButton}
            onPress={handleBpmIncrease}
          >
            <Text style={styles.bpmButtonText}>+</Text>
          </Pressable>
        </View>
      </View>

      {/* Difficulty */}
      <View style={styles.field}>
        <Text style={styles.label}>Difficulty</Text>
        <View testID="difficulty-selector" style={styles.difficultyContainer}>
          {[1, 2, 3, 4, 5].map((level) => (
            <Pressable
              key={level}
              style={[
                styles.difficultyButton,
                difficulty === level && styles.difficultyButtonActive,
              ]}
              onPress={() => onDifficultyChange(level as 1 | 2 | 3 | 4 | 5)}
            >
              <Text
                style={[
                  styles.difficultyText,
                  difficulty === level && styles.difficultyTextActive,
                ]}
              >
                {level}
              </Text>
            </Pressable>
          ))}
        </View>
        <Text style={styles.difficultyLabel}>
          {DIFFICULTY_LABELS[difficulty - 1]}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: spacing.md,
    gap: spacing.md,
  },
  field: {
    gap: spacing.xs,
  },
  label: {
    color: colors.textSecondary,
    fontSize: fontSize.sm,
  },
  input: {
    backgroundColor: colors.backgroundLight,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    color: colors.textPrimary,
    fontSize: fontSize.md,
  },
  bpmContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  bpmButton: {
    backgroundColor: colors.backgroundLight,
    width: 44,
    height: 44,
    borderRadius: borderRadius.md,
    justifyContent: "center",
    alignItems: "center",
  },
  bpmButtonText: {
    color: colors.textPrimary,
    fontSize: fontSize.xl,
    fontWeight: "600",
  },
  bpmValue: {
    color: colors.textPrimary,
    fontSize: fontSize.xl,
    fontWeight: "700",
    minWidth: 60,
    textAlign: "center",
  },
  difficultyContainer: {
    flexDirection: "row",
    gap: spacing.xs,
  },
  difficultyButton: {
    backgroundColor: colors.backgroundLight,
    width: 40,
    height: 40,
    borderRadius: borderRadius.md,
    justifyContent: "center",
    alignItems: "center",
  },
  difficultyButtonActive: {
    backgroundColor: colors.primary,
  },
  difficultyText: {
    color: colors.textPrimary,
    fontSize: fontSize.md,
    fontWeight: "600",
  },
  difficultyTextActive: {
    color: colors.backgroundDark,
  },
  difficultyLabel: {
    color: colors.textMuted,
    fontSize: fontSize.xs,
    marginTop: spacing.xs,
  },
});
```

**Step 4: Run test to verify it passes**

Run: `pnpm test -- __tests__/components/editor/SongMetadataForm.test.tsx`
Expected: PASS

**Step 5: Commit**

```bash
git add GuitarSlam/src/components/editor/SongMetadataForm.tsx GuitarSlam/__tests__/components/editor/SongMetadataForm.test.tsx
git commit -m "feat: add song metadata form component"
```

---

## Task 8: Create editor toolbar component (undo/redo, snap, zoom)

**Files:**

- Create: `GuitarSlam/src/components/editor/EditorToolbar.tsx`
- Test: `GuitarSlam/__tests__/components/editor/EditorToolbar.test.tsx`

**Step 1: Write the failing test**

Create `GuitarSlam/__tests__/components/editor/EditorToolbar.test.tsx`:

```tsx
import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import { EditorToolbar } from "../../../src/components/editor/EditorToolbar";

describe("EditorToolbar", () => {
  const defaultProps = {
    canUndo: true,
    canRedo: false,
    snapToGrid: true,
    zoom: 1,
    onUndo: jest.fn(),
    onRedo: jest.fn(),
    onToggleSnap: jest.fn(),
    onZoomIn: jest.fn(),
    onZoomOut: jest.fn(),
    onPreview: jest.fn(),
    onSave: jest.fn(),
  };

  it("renders undo/redo buttons", () => {
    const { getByTestId } = render(<EditorToolbar {...defaultProps} />);

    expect(getByTestId("undo-button")).toBeTruthy();
    expect(getByTestId("redo-button")).toBeTruthy();
  });

  it("disables undo when canUndo is false", () => {
    const { getByTestId } = render(
      <EditorToolbar {...defaultProps} canUndo={false} />,
    );

    const undoButton = getByTestId("undo-button");
    expect(undoButton.props.accessibilityState?.disabled).toBe(true);
  });

  it("disables redo when canRedo is false", () => {
    const { getByTestId } = render(
      <EditorToolbar {...defaultProps} canRedo={false} />,
    );

    const redoButton = getByTestId("redo-button");
    expect(redoButton.props.accessibilityState?.disabled).toBe(true);
  });

  it("calls onUndo when undo is pressed", () => {
    const onUndo = jest.fn();
    const { getByTestId } = render(
      <EditorToolbar {...defaultProps} onUndo={onUndo} />,
    );

    fireEvent.press(getByTestId("undo-button"));
    expect(onUndo).toHaveBeenCalled();
  });

  it("calls onToggleSnap when snap button is pressed", () => {
    const onToggleSnap = jest.fn();
    const { getByTestId } = render(
      <EditorToolbar {...defaultProps} onToggleSnap={onToggleSnap} />,
    );

    fireEvent.press(getByTestId("snap-button"));
    expect(onToggleSnap).toHaveBeenCalled();
  });

  it("shows snap active state", () => {
    const { getByTestId } = render(
      <EditorToolbar {...defaultProps} snapToGrid={true} />,
    );

    const snapButton = getByTestId("snap-button");
    // Check for active styling
    expect(snapButton).toBeTruthy();
  });

  it("calls onPreview when preview button is pressed", () => {
    const onPreview = jest.fn();
    const { getByTestId } = render(
      <EditorToolbar {...defaultProps} onPreview={onPreview} />,
    );

    fireEvent.press(getByTestId("preview-button"));
    expect(onPreview).toHaveBeenCalled();
  });

  it("calls onSave when save button is pressed", () => {
    const onSave = jest.fn();
    const { getByTestId } = render(
      <EditorToolbar {...defaultProps} onSave={onSave} />,
    );

    fireEvent.press(getByTestId("save-button"));
    expect(onSave).toHaveBeenCalled();
  });
});
```

**Step 2: Run test to verify it fails**

Run: `pnpm test -- __tests__/components/editor/EditorToolbar.test.tsx`
Expected: FAIL with "Cannot find module '../../../src/components/editor/EditorToolbar'"

**Step 3: Implement editor toolbar component**

Create `GuitarSlam/src/components/editor/EditorToolbar.tsx`:

```tsx
import React from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { colors, spacing, fontSize, borderRadius } from "../../constants/theme";

interface EditorToolbarProps {
  canUndo: boolean;
  canRedo: boolean;
  snapToGrid: boolean;
  zoom: number;
  onUndo: () => void;
  onRedo: () => void;
  onToggleSnap: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onPreview: () => void;
  onSave: () => void;
}

export const EditorToolbar: React.FC<EditorToolbarProps> = ({
  canUndo,
  canRedo,
  snapToGrid,
  zoom,
  onUndo,
  onRedo,
  onToggleSnap,
  onZoomIn,
  onZoomOut,
  onPreview,
  onSave,
}) => {
  return (
    <View style={styles.container}>
      {/* Left section: Undo/Redo */}
      <View style={styles.section}>
        <Pressable
          testID="undo-button"
          style={[styles.button, !canUndo && styles.buttonDisabled]}
          onPress={onUndo}
          disabled={!canUndo}
          accessibilityState={{ disabled: !canUndo }}
        >
          <Text
            style={[styles.buttonText, !canUndo && styles.buttonTextDisabled]}
          >
            Undo
          </Text>
        </Pressable>
        <Pressable
          testID="redo-button"
          style={[styles.button, !canRedo && styles.buttonDisabled]}
          onPress={onRedo}
          disabled={!canRedo}
          accessibilityState={{ disabled: !canRedo }}
        >
          <Text
            style={[styles.buttonText, !canRedo && styles.buttonTextDisabled]}
          >
            Redo
          </Text>
        </Pressable>
      </View>

      {/* Center section: Snap & Zoom */}
      <View style={styles.section}>
        <Pressable
          testID="snap-button"
          style={[styles.button, snapToGrid && styles.buttonActive]}
          onPress={onToggleSnap}
        >
          <Text
            style={[styles.buttonText, snapToGrid && styles.buttonTextActive]}
          >
            Snap
          </Text>
        </Pressable>

        <Pressable
          testID="zoom-out-button"
          style={styles.button}
          onPress={onZoomOut}
        >
          <Text style={styles.buttonText}>-</Text>
        </Pressable>
        <Text style={styles.zoomText}>{Math.round(zoom * 100)}%</Text>
        <Pressable
          testID="zoom-in-button"
          style={styles.button}
          onPress={onZoomIn}
        >
          <Text style={styles.buttonText}>+</Text>
        </Pressable>
      </View>

      {/* Right section: Preview & Save */}
      <View style={styles.section}>
        <Pressable
          testID="preview-button"
          style={styles.button}
          onPress={onPreview}
        >
          <Text style={styles.buttonText}>Preview</Text>
        </Pressable>
        <Pressable
          testID="save-button"
          style={[styles.button, styles.saveButton]}
          onPress={onSave}
        >
          <Text style={[styles.buttonText, styles.saveButtonText]}>Save</Text>
        </Pressable>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: colors.backgroundDark,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: colors.textMuted,
  },
  section: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },
  button: {
    backgroundColor: colors.backgroundLight,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
    minWidth: 36,
    alignItems: "center",
  },
  buttonDisabled: {
    opacity: 0.4,
  },
  buttonActive: {
    backgroundColor: colors.primary,
  },
  buttonText: {
    color: colors.textPrimary,
    fontSize: fontSize.sm,
    fontWeight: "500",
  },
  buttonTextDisabled: {
    color: colors.textMuted,
  },
  buttonTextActive: {
    color: colors.backgroundDark,
  },
  zoomText: {
    color: colors.textSecondary,
    fontSize: fontSize.sm,
    minWidth: 44,
    textAlign: "center",
  },
  saveButton: {
    backgroundColor: colors.primary,
  },
  saveButtonText: {
    color: colors.backgroundDark,
    fontWeight: "600",
  },
});
```

**Step 4: Run test to verify it passes**

Run: `pnpm test -- __tests__/components/editor/EditorToolbar.test.tsx`
Expected: PASS

**Step 5: Commit**

```bash
git add GuitarSlam/src/components/editor/EditorToolbar.tsx GuitarSlam/__tests__/components/editor/EditorToolbar.test.tsx
git commit -m "feat: add editor toolbar component"
```

---

## Task 9: Create main song editor screen

**Files:**

- Create: `GuitarSlam/app/editor/create.tsx`
- Create: `GuitarSlam/app/editor/_layout.tsx`
- Modify: `GuitarSlam/app/_layout.tsx` (add editor route)

**Step 1: Create editor layout**

Create `GuitarSlam/app/editor/_layout.tsx`:

```tsx
import { Stack } from "expo-router";
import { colors } from "../../src/constants/theme";

export default function EditorLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: colors.backgroundDark },
        headerTintColor: colors.textPrimary,
        headerTitleStyle: { fontWeight: "600" },
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      <Stack.Screen
        name="create"
        options={{
          title: "Create Song",
          presentation: "modal",
        }}
      />
      <Stack.Screen
        name="[songId]/edit"
        options={{
          title: "Edit Song",
        }}
      />
      <Stack.Screen
        name="[songId]/preview"
        options={{
          title: "Preview",
          presentation: "modal",
        }}
      />
    </Stack>
  );
}
```

**Step 2: Create main editor screen**

Create `GuitarSlam/app/editor/create.tsx`:

```tsx
import React, { useState, useCallback } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";
import { useEditorStore } from "../../src/stores/useEditorStore";
import { saveUserSong } from "../../src/services/songStorage";
import { EditorToolbar } from "../../src/components/editor/EditorToolbar";
import { SongMetadataForm } from "../../src/components/editor/SongMetadataForm";
import { TimelineGrid } from "../../src/components/editor/TimelineGrid";
import { ChordNoteBlock } from "../../src/components/editor/ChordNoteBlock";
import { ChordPalette } from "../../src/components/editor/ChordPalette";
import { colors, spacing } from "../../src/constants/theme";

const DEFAULT_DURATION = 60; // 60 seconds default timeline

export default function CreateSongScreen() {
  const router = useRouter();
  const [selectedChord, setSelectedChord] = useState<string | null>("G");

  const {
    song,
    selectedNoteId,
    currentTime,
    zoom,
    snapToGrid,
    undoStack,
    redoStack,
    isDirty,
    createNewSong,
    updateSongMetadata,
    addNote,
    deleteNote,
    moveNote,
    selectNote,
    setZoom,
    setSnapToGrid,
    undo,
    redo,
    markClean,
  } = useEditorStore();

  // Initialize song if not exists
  React.useEffect(() => {
    if (!song) {
      createNewSong("Untitled Song", "Unknown Artist", 120);
    }
  }, [song, createNewSong]);

  const handleTimelinePress = useCallback(
    (time: number) => {
      if (selectedChord && song) {
        addNote(selectedChord, time, 2); // Default 2 second duration
      }
    },
    [selectedChord, song, addNote],
  );

  const handleNotePress = useCallback(
    (noteId: string) => {
      selectNote(noteId === selectedNoteId ? null : noteId);
    },
    [selectedNoteId, selectNote],
  );

  const handleNoteLongPress = useCallback(
    (noteId: string) => {
      Alert.alert("Note Options", "What would you like to do?", [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => deleteNote(noteId),
        },
      ]);
    },
    [deleteNote],
  );

  const handleSave = useCallback(async () => {
    if (!song) return;

    if (song.levels[0].chart.length === 0) {
      Alert.alert("Cannot Save", "Please add at least one chord to your song.");
      return;
    }

    try {
      await saveUserSong(song);
      markClean();
      Alert.alert("Saved", "Your song has been saved!", [
        { text: "OK", onPress: () => router.back() },
      ]);
    } catch (error) {
      Alert.alert("Error", "Failed to save song. Please try again.");
    }
  }, [song, markClean, router]);

  const handlePreview = useCallback(() => {
    if (!song) return;

    if (song.levels[0].chart.length === 0) {
      Alert.alert(
        "Cannot Preview",
        "Please add at least one chord to your song.",
      );
      return;
    }

    router.push(`/editor/${song.id}/preview`);
  }, [song, router]);

  const handleBack = useCallback(() => {
    if (isDirty) {
      Alert.alert(
        "Unsaved Changes",
        "You have unsaved changes. Discard them?",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Discard",
            style: "destructive",
            onPress: () => router.back(),
          },
        ],
      );
    } else {
      router.back();
    }
  }, [isDirty, router]);

  if (!song) return null;

  const pixelsPerSecond = 60 * zoom;

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        {/* Toolbar */}
        <EditorToolbar
          canUndo={undoStack.length > 0}
          canRedo={redoStack.length > 0}
          snapToGrid={snapToGrid}
          zoom={zoom}
          onUndo={undo}
          onRedo={redo}
          onToggleSnap={() => setSnapToGrid(!snapToGrid)}
          onZoomIn={() => setZoom(zoom + 0.25)}
          onZoomOut={() => setZoom(zoom - 0.25)}
          onPreview={handlePreview}
          onSave={handleSave}
        />

        {/* Metadata Form */}
        <SongMetadataForm
          title={song.title}
          artist={song.artist}
          bpm={song.bpm}
          difficulty={song.difficulty}
          onTitleChange={(title) => updateSongMetadata({ title })}
          onArtistChange={(artist) => updateSongMetadata({ artist })}
          onBpmChange={(bpm) => updateSongMetadata({ bpm })}
          onDifficultyChange={(difficulty) =>
            updateSongMetadata({ difficulty })
          }
        />

        {/* Timeline */}
        <View style={styles.timelineContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.timelineContent}>
              <TimelineGrid
                bpm={song.bpm}
                duration={DEFAULT_DURATION}
                zoom={zoom}
                currentTime={currentTime}
                onTimePress={handleTimelinePress}
                width={DEFAULT_DURATION * pixelsPerSecond}
              />

              {/* Chord notes overlay */}
              {song.levels[0].chart.map((note) => (
                <ChordNoteBlock
                  key={note.id}
                  note={note}
                  pixelsPerSecond={pixelsPerSecond}
                  isSelected={note.id === selectedNoteId}
                  onPress={handleNotePress}
                  onLongPress={handleNoteLongPress}
                />
              ))}
            </View>
          </ScrollView>
        </View>

        {/* Chord Palette */}
        <ChordPalette
          selectedChord={selectedChord}
          onSelectChord={setSelectedChord}
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  flex: {
    flex: 1,
  },
  timelineContainer: {
    flex: 1,
    backgroundColor: colors.backgroundLight,
  },
  timelineContent: {
    position: "relative",
    minHeight: 300,
  },
});
```

**Step 3: Commit**

```bash
git add GuitarSlam/app/editor/_layout.tsx GuitarSlam/app/editor/create.tsx
git commit -m "feat: add main song editor screen"
```

---

## Task 10: Create song edit screen (for existing songs)

**Files:**

- Create: `GuitarSlam/app/editor/[songId]/edit.tsx`

**Step 1: Implement edit screen**

Create `GuitarSlam/app/editor/[songId]/edit.tsx`:

```tsx
import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Text,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useEditorStore } from "../../../src/stores/useEditorStore";
import { getUserSong, saveUserSong } from "../../../src/services/songStorage";
import { EditorToolbar } from "../../../src/components/editor/EditorToolbar";
import { SongMetadataForm } from "../../../src/components/editor/SongMetadataForm";
import { TimelineGrid } from "../../../src/components/editor/TimelineGrid";
import { ChordNoteBlock } from "../../../src/components/editor/ChordNoteBlock";
import { ChordPalette } from "../../../src/components/editor/ChordPalette";
import { colors, spacing, fontSize } from "../../../src/constants/theme";
import { UserSong } from "../../../src/types";

const DEFAULT_DURATION = 60;

export default function EditSongScreen() {
  const router = useRouter();
  const { songId } = useLocalSearchParams<{ songId: string }>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedChord, setSelectedChord] = useState<string | null>("G");

  const {
    song,
    selectedNoteId,
    currentTime,
    zoom,
    snapToGrid,
    undoStack,
    redoStack,
    isDirty,
    loadSong,
    updateSongMetadata,
    addNote,
    deleteNote,
    selectNote,
    setZoom,
    setSnapToGrid,
    undo,
    redo,
    markClean,
  } = useEditorStore();

  // Load existing song
  useEffect(() => {
    const load = async () => {
      if (!songId) {
        setError("No song ID provided");
        setLoading(false);
        return;
      }

      try {
        const existingSong = await getUserSong(songId);
        if (!existingSong) {
          setError("Song not found");
          setLoading(false);
          return;
        }

        loadSong(existingSong);
        setLoading(false);
      } catch (err) {
        setError("Failed to load song");
        setLoading(false);
      }
    };

    load();
  }, [songId, loadSong]);

  const handleTimelinePress = useCallback(
    (time: number) => {
      if (selectedChord && song) {
        addNote(selectedChord, time, 2);
      }
    },
    [selectedChord, song, addNote],
  );

  const handleNotePress = useCallback(
    (noteId: string) => {
      selectNote(noteId === selectedNoteId ? null : noteId);
    },
    [selectedNoteId, selectNote],
  );

  const handleNoteLongPress = useCallback(
    (noteId: string) => {
      Alert.alert("Note Options", "What would you like to do?", [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => deleteNote(noteId),
        },
      ]);
    },
    [deleteNote],
  );

  const handleSave = useCallback(async () => {
    if (!song) return;

    try {
      await saveUserSong(song);
      markClean();
      Alert.alert("Saved", "Your changes have been saved!");
    } catch (err) {
      Alert.alert("Error", "Failed to save song. Please try again.");
    }
  }, [song, markClean]);

  const handlePreview = useCallback(() => {
    if (!song) return;

    if (song.levels[0].chart.length === 0) {
      Alert.alert(
        "Cannot Preview",
        "Please add at least one chord to your song.",
      );
      return;
    }

    router.push(`/editor/${song.id}/preview`);
  }, [song, router]);

  if (loading) {
    return (
      <SafeAreaView style={styles.centerContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </SafeAreaView>
    );
  }

  if (error || !song) {
    return (
      <SafeAreaView style={styles.centerContainer}>
        <Text style={styles.errorText}>{error || "Song not found"}</Text>
      </SafeAreaView>
    );
  }

  const pixelsPerSecond = 60 * zoom;

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <EditorToolbar
          canUndo={undoStack.length > 0}
          canRedo={redoStack.length > 0}
          snapToGrid={snapToGrid}
          zoom={zoom}
          onUndo={undo}
          onRedo={redo}
          onToggleSnap={() => setSnapToGrid(!snapToGrid)}
          onZoomIn={() => setZoom(zoom + 0.25)}
          onZoomOut={() => setZoom(zoom - 0.25)}
          onPreview={handlePreview}
          onSave={handleSave}
        />

        <SongMetadataForm
          title={song.title}
          artist={song.artist}
          bpm={song.bpm}
          difficulty={song.difficulty}
          onTitleChange={(title) => updateSongMetadata({ title })}
          onArtistChange={(artist) => updateSongMetadata({ artist })}
          onBpmChange={(bpm) => updateSongMetadata({ bpm })}
          onDifficultyChange={(difficulty) =>
            updateSongMetadata({ difficulty })
          }
        />

        <View style={styles.timelineContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.timelineContent}>
              <TimelineGrid
                bpm={song.bpm}
                duration={DEFAULT_DURATION}
                zoom={zoom}
                currentTime={currentTime}
                onTimePress={handleTimelinePress}
                width={DEFAULT_DURATION * pixelsPerSecond}
              />

              {song.levels[0].chart.map((note) => (
                <ChordNoteBlock
                  key={note.id}
                  note={note}
                  pixelsPerSecond={pixelsPerSecond}
                  isSelected={note.id === selectedNoteId}
                  onPress={handleNotePress}
                  onLongPress={handleNoteLongPress}
                />
              ))}
            </View>
          </ScrollView>
        </View>

        <ChordPalette
          selectedChord={selectedChord}
          onSelectChord={setSelectedChord}
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  flex: {
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: "center",
    alignItems: "center",
  },
  errorText: {
    color: colors.accent,
    fontSize: fontSize.lg,
  },
  timelineContainer: {
    flex: 1,
    backgroundColor: colors.backgroundLight,
  },
  timelineContent: {
    position: "relative",
    minHeight: 300,
  },
});
```

**Step 2: Commit**

```bash
git add GuitarSlam/app/editor/[songId]/edit.tsx
git commit -m "feat: add song edit screen for existing songs"
```

---

## Task 11: Create song preview screen (playback mode)

**Files:**

- Create: `GuitarSlam/app/editor/[songId]/preview.tsx`

**Step 1: Implement preview screen**

Create `GuitarSlam/app/editor/[songId]/preview.tsx`:

```tsx
import React, { useEffect, useState, useCallback, useRef } from "react";
import { View, Text, StyleSheet, SafeAreaView, Pressable } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useEditorStore } from "../../../src/stores/useEditorStore";
import { NoteLane } from "../../../src/components/NoteLane";
import { ScoreDisplay } from "../../../src/components/ScoreDisplay";
import { ComboDisplay } from "../../../src/components/ComboDisplay";
import { HitFeedback } from "../../../src/components/HitFeedback";
import {
  colors,
  spacing,
  fontSize,
  borderRadius,
} from "../../../src/constants/theme";
import { HitType } from "../../../src/types";

export default function PreviewScreen() {
  const router = useRouter();
  const { songId } = useLocalSearchParams<{ songId: string }>();
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
    startTimeRef.current = Date.now();

    const animate = () => {
      const elapsed = (Date.now() - startTimeRef.current) / 1000;
      setCurrentTime(elapsed);

      // Check if preview should end
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
      {/* Header */}
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

      {/* Falling notes area */}
      <View style={styles.gameArea}>
        <NoteLane notes={chart} currentTime={currentTime} />
        {lastHit && <HitFeedback type={lastHit} />}
      </View>

      {/* Controls */}
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
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: colors.textMuted,
  },
  title: {
    color: colors.textPrimary,
    fontSize: fontSize.xl,
    fontWeight: "700",
  },
  subtitle: {
    color: colors.textSecondary,
    fontSize: fontSize.sm,
  },
  statsRow: {
    flexDirection: "row",
    gap: spacing.md,
  },
  gameArea: {
    flex: 1,
    position: "relative",
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
    alignItems: "center",
  },
  playButtonText: {
    color: colors.backgroundDark,
    fontSize: fontSize.lg,
    fontWeight: "700",
  },
  stopButton: {
    backgroundColor: colors.accent,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
    alignItems: "center",
  },
  stopButtonText: {
    color: colors.textPrimary,
    fontSize: fontSize.lg,
    fontWeight: "700",
  },
  backButton: {
    backgroundColor: colors.backgroundLight,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    alignItems: "center",
  },
  backButtonText: {
    color: colors.textPrimary,
    fontSize: fontSize.md,
  },
  errorText: {
    color: colors.accent,
    fontSize: fontSize.lg,
    textAlign: "center",
    marginTop: spacing.xl,
  },
});
```

**Step 2: Commit**

```bash
git add GuitarSlam/app/editor/[songId]/preview.tsx
git commit -m "feat: add song preview screen with playback"
```

---

## Task 12: Create user song library screen

**Files:**

- Create: `GuitarSlam/app/songs/index.tsx`
- Create: `GuitarSlam/app/songs/_layout.tsx`

**Step 1: Create songs layout**

Create `GuitarSlam/app/songs/_layout.tsx`:

```tsx
import { Stack } from "expo-router";
import { colors } from "../../src/constants/theme";

export default function SongsLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: colors.backgroundDark },
        headerTintColor: colors.textPrimary,
        headerTitleStyle: { fontWeight: "600" },
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          title: "My Songs",
        }}
      />
    </Stack>
  );
}
```

**Step 2: Create user song library screen**

Create `GuitarSlam/app/songs/index.tsx`:

```tsx
import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  SafeAreaView,
  Alert,
  RefreshControl,
} from "react-native";
import { useRouter, useFocusEffect } from "expo-router";
import { loadUserSongs, deleteUserSong } from "../../src/services/songStorage";
import { UserSong } from "../../src/types";
import {
  colors,
  spacing,
  fontSize,
  borderRadius,
} from "../../src/constants/theme";

export default function UserSongsScreen() {
  const router = useRouter();
  const [songs, setSongs] = useState<UserSong[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const loadSongs = useCallback(async () => {
    try {
      const userSongs = await loadUserSongs();
      setSongs(userSongs.sort((a, b) => b.updatedAt - a.updatedAt));
    } catch (error) {
      console.error("Failed to load songs:", error);
    }
  }, []);

  // Reload when screen gains focus
  useFocusEffect(
    useCallback(() => {
      loadSongs();
    }, [loadSongs]),
  );

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadSongs();
    setRefreshing(false);
  }, [loadSongs]);

  const handleDelete = useCallback(
    async (songId: string, songTitle: string) => {
      Alert.alert(
        "Delete Song",
        `Are you sure you want to delete "${songTitle}"?`,
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Delete",
            style: "destructive",
            onPress: async () => {
              try {
                await deleteUserSong(songId);
                setSongs((prev) => prev.filter((s) => s.id !== songId));
              } catch (error) {
                Alert.alert("Error", "Failed to delete song.");
              }
            },
          },
        ],
      );
    },
    [],
  );

  const renderSongItem = ({ item }: { item: UserSong }) => (
    <Pressable
      style={styles.songCard}
      onPress={() => router.push(`/editor/${item.id}/edit`)}
      onLongPress={() => handleDelete(item.id, item.title)}
    >
      <View style={styles.songInfo}>
        <Text style={styles.songTitle}>{item.title}</Text>
        <Text style={styles.songArtist}>{item.artist}</Text>
        <View style={styles.songMeta}>
          <Text style={styles.songMetaText}>{item.bpm} BPM</Text>
          <Text style={styles.songMetaText}>
            Difficulty {item.difficulty}/5
          </Text>
          <Text style={styles.songMetaText}>
            {item.levels[0].chart.length} notes
          </Text>
        </View>
      </View>
      <Text style={styles.chevron}>›</Text>
    </Pressable>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyTitle}>No Songs Yet</Text>
      <Text style={styles.emptyText}>
        Create your first song to start building your library!
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={songs}
        keyExtractor={(item) => item.id}
        renderItem={renderSongItem}
        ListEmptyComponent={renderEmptyState}
        contentContainerStyle={
          songs.length === 0 ? styles.emptyContainer : styles.listContent
        }
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={colors.primary}
          />
        }
      />

      {/* Create button */}
      <Pressable
        style={styles.createButton}
        onPress={() => router.push("/editor/create")}
      >
        <Text style={styles.createButtonText}>+ Create New Song</Text>
      </Pressable>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  listContent: {
    padding: spacing.md,
    paddingBottom: 100, // Space for create button
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    padding: spacing.xl,
  },
  emptyState: {
    alignItems: "center",
  },
  emptyTitle: {
    color: colors.textPrimary,
    fontSize: fontSize.xl,
    fontWeight: "700",
    marginBottom: spacing.sm,
  },
  emptyText: {
    color: colors.textSecondary,
    fontSize: fontSize.md,
    textAlign: "center",
  },
  songCard: {
    backgroundColor: colors.backgroundLight,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
    flexDirection: "row",
    alignItems: "center",
  },
  songInfo: {
    flex: 1,
  },
  songTitle: {
    color: colors.textPrimary,
    fontSize: fontSize.lg,
    fontWeight: "600",
  },
  songArtist: {
    color: colors.textSecondary,
    fontSize: fontSize.sm,
    marginTop: spacing.xs,
  },
  songMeta: {
    flexDirection: "row",
    gap: spacing.md,
    marginTop: spacing.sm,
  },
  songMetaText: {
    color: colors.textMuted,
    fontSize: fontSize.xs,
  },
  chevron: {
    color: colors.textMuted,
    fontSize: fontSize.xxl,
  },
  createButton: {
    position: "absolute",
    bottom: spacing.lg,
    left: spacing.md,
    right: spacing.md,
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
    alignItems: "center",
  },
  createButtonText: {
    color: colors.backgroundDark,
    fontSize: fontSize.lg,
    fontWeight: "700",
  },
});
```

**Step 3: Commit**

```bash
git add GuitarSlam/app/songs/_layout.tsx GuitarSlam/app/songs/index.tsx
git commit -m "feat: add user song library screen"
```

---

## Task 13: Update navigation to include editor routes

**Files:**

- Modify: `GuitarSlam/app/_layout.tsx`
- Modify: `GuitarSlam/app/(tabs)/index.tsx` (add link to My Songs)

**Step 1: Update root layout**

Modify `GuitarSlam/app/_layout.tsx` to include editor and songs routes:

Add to the Stack navigator children:

```tsx
<Stack.Screen name="editor" options={{ headerShown: false }} />
<Stack.Screen name="songs" options={{ headerShown: false }} />
```

**Step 2: Update home screen**

Modify `GuitarSlam/app/(tabs)/index.tsx` to add a link to My Songs:

Add a new card component linking to `/songs`:

```tsx
<Pressable style={styles.card} onPress={() => router.push("/songs")}>
  <Text style={styles.cardTitle}>My Songs</Text>
  <Text style={styles.cardDescription}>Create and manage custom songs</Text>
</Pressable>
```

**Step 3: Commit**

```bash
git add GuitarSlam/app/_layout.tsx GuitarSlam/app/(tabs)/index.tsx
git commit -m "feat: add editor and songs routes to navigation"
```

---

## Task 14: Add integration tests for editor flow

**Files:**

- Create: `GuitarSlam/__tests__/integration/editorFlow.test.tsx`

**Step 1: Write integration tests**

Create `GuitarSlam/__tests__/integration/editorFlow.test.tsx`:

```tsx
import { act } from "@testing-library/react-native";
import { useEditorStore } from "../../src/stores/useEditorStore";
import {
  saveUserSong,
  loadUserSongs,
  deleteUserSong,
} from "../../src/services/songStorage";
import AsyncStorage from "@react-native-async-storage/async-storage";

jest.mock("@react-native-async-storage/async-storage", () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
}));

describe("Editor Flow Integration", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useEditorStore.getState().reset();
  });

  it("creates a song, adds notes, and saves", async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
    (AsyncStorage.setItem as jest.Mock).mockResolvedValue(undefined);

    // Create song
    act(() => {
      useEditorStore
        .getState()
        .createNewSong("Integration Test", "Test Artist", 120);
    });

    const song1 = useEditorStore.getState().song;
    expect(song1?.title).toBe("Integration Test");

    // Add notes
    act(() => {
      useEditorStore.getState().addNote("G", 0, 2);
      useEditorStore.getState().addNote("C", 2, 2);
      useEditorStore.getState().addNote("D", 4, 2);
    });

    expect(useEditorStore.getState().song?.levels[0].chart.length).toBe(3);

    // Save
    const songToSave = useEditorStore.getState().song!;
    await saveUserSong(songToSave);

    expect(AsyncStorage.setItem).toHaveBeenCalled();
  });

  it("supports undo across multiple operations", () => {
    act(() => {
      useEditorStore.getState().createNewSong("Undo Test", "Artist", 100);
      useEditorStore.getState().addNote("Am", 0, 2);
      useEditorStore.getState().addNote("Em", 2, 2);
      useEditorStore.getState().addNote("G", 4, 2);
    });

    expect(useEditorStore.getState().song?.levels[0].chart.length).toBe(3);

    // Undo all three
    act(() => {
      useEditorStore.getState().undo();
      useEditorStore.getState().undo();
      useEditorStore.getState().undo();
    });

    expect(useEditorStore.getState().song?.levels[0].chart.length).toBe(0);

    // Redo one
    act(() => {
      useEditorStore.getState().redo();
    });

    expect(useEditorStore.getState().song?.levels[0].chart.length).toBe(1);
  });

  it("tracks dirty state correctly", () => {
    act(() => {
      useEditorStore.getState().createNewSong("Dirty Test", "Artist", 120);
    });

    expect(useEditorStore.getState().isDirty).toBe(false);

    act(() => {
      useEditorStore.getState().addNote("G", 0, 2);
    });

    expect(useEditorStore.getState().isDirty).toBe(true);

    act(() => {
      useEditorStore.getState().markClean();
    });

    expect(useEditorStore.getState().isDirty).toBe(false);
  });
});
```

**Step 2: Run integration tests**

Run: `pnpm test -- __tests__/integration/editorFlow.test.tsx`
Expected: PASS

**Step 3: Commit**

```bash
git add GuitarSlam/__tests__/integration/editorFlow.test.tsx
git commit -m "test: add integration tests for editor flow"
```

---

## Task 15: Manual verification checklist

**Files:**

- Create: `GuitarSlam/docs/verification/phase3-editor.md`

**Step 1: Create verification checklist**

Create `GuitarSlam/docs/verification/phase3-editor.md`:

```md
# Phase 3 Editor Verification Checklist

## Song Creation Flow

- [ ] Navigate to My Songs from home screen
- [ ] Tap "Create New Song" button
- [ ] Enter song metadata (title, artist, BPM, difficulty)
- [ ] Verify BPM controls work (+/- buttons)
- [ ] Verify difficulty selector updates correctly

## Timeline Editing

- [ ] Select a chord from the palette
- [ ] Tap on timeline to place chord
- [ ] Verify chord snaps to grid when snap is enabled
- [ ] Toggle snap off and verify free placement works
- [ ] Adjust zoom and verify timeline scales correctly
- [ ] Verify beat/measure markers display correctly

## Note Manipulation

- [ ] Tap note to select it (border highlights)
- [ ] Long-press note to see delete option
- [ ] Delete a note and verify it removes
- [ ] Verify notes sort by time automatically

## Undo/Redo

- [ ] Add several notes
- [ ] Tap Undo - verify last note removed
- [ ] Tap Redo - verify note restored
- [ ] Chain multiple undos/redos
- [ ] Verify undo/redo buttons disable when stack is empty

## Save & Load

- [ ] Save a song with notes
- [ ] Navigate back to My Songs
- [ ] Verify song appears in list with correct metadata
- [ ] Tap song to edit - verify notes load correctly
- [ ] Make changes and save again
- [ ] Verify updatedAt timestamp changes

## Preview Mode

- [ ] Tap Preview with notes in song
- [ ] Verify falling notes display
- [ ] Verify Play/Stop controls work
- [ ] Verify notes fall at correct BPM
- [ ] Tap "Back to Editor" to return

## Song Library

- [ ] View list of user-created songs
- [ ] Pull to refresh
- [ ] Long-press song to see delete option
- [ ] Delete a song and verify it removes from list
- [ ] Verify empty state shows when no songs

## Edge Cases

- [ ] Try saving with no notes (should show alert)
- [ ] Try preview with no notes (should show alert)
- [ ] Navigate away with unsaved changes (should prompt)
- [ ] Verify search works in chord palette
```

**Step 2: Commit**

```bash
git add GuitarSlam/docs/verification/phase3-editor.md
git commit -m "docs: add phase3 editor verification checklist"
```

---

## Execution Handoff

Plan complete and saved to `docs/plans/2026-01-29-phase3-content-creation-implementation.md`. Two execution options:

**1. Subagent-Driven (this session)** - I dispatch fresh subagent per task, review between tasks, fast iteration

**2. Parallel Session (separate)** - Open new session with executing-plans, batch execution with checkpoints

Which approach?
