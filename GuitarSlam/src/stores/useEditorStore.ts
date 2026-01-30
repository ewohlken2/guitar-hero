import { create } from 'zustand';
import { UserSong, ChordNote, EditorAction, SongLevel } from '../types';

interface EditorStoreState {
  song: UserSong | null;
  selectedNoteId: string | null;
  isPlaying: boolean;
  currentTime: number;
  zoom: number;
  snapToGrid: boolean;
  gridSubdivision: number;
  undoStack: EditorAction[];
  redoStack: EditorAction[];
  isDirty: boolean;

  // Actions
  createNewSong: (title: string, artist: string, bpm: number) => void;
  loadSong: (song: UserSong) => void;
  updateSongMetadata: (updates: Partial<Pick<UserSong, 'title' | 'artist' | 'bpm' | 'difficulty'>>) => void;
  addNote: (chord: string, time: number, duration: number) => void;
  deleteNote: (noteId: string) => void;
  moveNote: (noteId: string, newTime: number) => void;
  resizeNote: (noteId: string, newDuration: number) => void;
  updateNoteChord: (noteId: string, newChord: string) => void;
  selectNote: (noteId: string | null) => void;
  setPlaying: (isPlaying: boolean) => void;
  setCurrentTime: (time: number) => void;
  setZoom: (zoom: number) => void;
  setSnapToGrid: (snap: boolean) => void;
  setGridSubdivision: (subdivision: number) => void;
  undo: () => void;
  redo: () => void;
  snapTimeToGrid: (time: number) => number;
  reset: () => void;
  markClean: () => void;
}

const generateId = (): string => {
  return `note_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

const createDefaultLevels = (): SongLevel[] => [
  {
    levelNumber: 1,
    name: 'Easy',
    description: 'Basic chord progression',
    chart: [],
  },
  {
    levelNumber: 2,
    name: 'Medium',
    description: 'More complex patterns',
    chart: [],
  },
  {
    levelNumber: 3,
    name: 'Hard',
    description: 'Full song arrangement',
    chart: [],
  },
];

const initialState = {
  song: null,
  selectedNoteId: null,
  isPlaying: false,
  currentTime: 0,
  zoom: 1,
  snapToGrid: true,
  gridSubdivision: 4,
  undoStack: [] as EditorAction[],
  redoStack: [] as EditorAction[],
  isDirty: false,
};

export const useEditorStore = create<EditorStoreState>((set, get) => ({
  ...initialState,

  createNewSong: (title, artist, bpm) => {
    const now = Date.now();
    const newSong: UserSong = {
      id: `song_${now}`,
      title,
      artist,
      bpm,
      difficulty: 1,
      levels: createDefaultLevels(),
      isUserCreated: true,
      createdAt: now,
      updatedAt: now,
    };
    set({
      song: newSong,
      selectedNoteId: null,
      isPlaying: false,
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
      isPlaying: false,
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
    const { song, undoStack } = get();
    if (!song) return;

    const newNote: ChordNote = {
      id: generateId(),
      chord,
      time,
      duration,
    };

    const action: EditorAction = {
      type: 'add',
      noteId: newNote.id,
      previousState: {},
      newState: { ...newNote },
      timestamp: Date.now(),
    };

    const updatedLevels = song.levels.map((level, index) => {
      if (index === 0) {
        return {
          ...level,
          chart: [...level.chart, newNote],
        };
      }
      return level;
    });

    set({
      song: {
        ...song,
        levels: updatedLevels,
        updatedAt: Date.now(),
      },
      undoStack: [...undoStack, action],
      redoStack: [],
      isDirty: true,
    });
  },

  deleteNote: (noteId) => {
    const { song, undoStack } = get();
    if (!song) return;

    // Find the note to delete
    let deletedNote: ChordNote | undefined;
    for (const level of song.levels) {
      deletedNote = level.chart.find((note) => note.id === noteId);
      if (deletedNote) break;
    }

    if (!deletedNote) return;

    const action: EditorAction = {
      type: 'delete',
      noteId,
      previousState: { ...deletedNote },
      newState: {},
      timestamp: Date.now(),
    };

    const updatedLevels = song.levels.map((level) => ({
      ...level,
      chart: level.chart.filter((note) => note.id !== noteId),
    }));

    set({
      song: {
        ...song,
        levels: updatedLevels,
        updatedAt: Date.now(),
      },
      selectedNoteId: get().selectedNoteId === noteId ? null : get().selectedNoteId,
      undoStack: [...undoStack, action],
      redoStack: [],
      isDirty: true,
    });
  },

  moveNote: (noteId, newTime) => {
    const { song, undoStack } = get();
    if (!song) return;

    // Find the note to move
    let originalNote: ChordNote | undefined;
    for (const level of song.levels) {
      originalNote = level.chart.find((note) => note.id === noteId);
      if (originalNote) break;
    }

    if (!originalNote) return;

    const action: EditorAction = {
      type: 'move',
      noteId,
      previousState: { time: originalNote.time },
      newState: { time: newTime },
      timestamp: Date.now(),
    };

    const updatedLevels = song.levels.map((level) => ({
      ...level,
      chart: level.chart.map((note) =>
        note.id === noteId ? { ...note, time: newTime } : note
      ),
    }));

    set({
      song: {
        ...song,
        levels: updatedLevels,
        updatedAt: Date.now(),
      },
      undoStack: [...undoStack, action],
      redoStack: [],
      isDirty: true,
    });
  },

  resizeNote: (noteId, newDuration) => {
    const { song, undoStack } = get();
    if (!song) return;

    // Find the note to resize
    let originalNote: ChordNote | undefined;
    for (const level of song.levels) {
      originalNote = level.chart.find((note) => note.id === noteId);
      if (originalNote) break;
    }

    if (!originalNote) return;

    const action: EditorAction = {
      type: 'resize',
      noteId,
      previousState: { duration: originalNote.duration },
      newState: { duration: newDuration },
      timestamp: Date.now(),
    };

    const updatedLevels = song.levels.map((level) => ({
      ...level,
      chart: level.chart.map((note) =>
        note.id === noteId ? { ...note, duration: newDuration } : note
      ),
    }));

    set({
      song: {
        ...song,
        levels: updatedLevels,
        updatedAt: Date.now(),
      },
      undoStack: [...undoStack, action],
      redoStack: [],
      isDirty: true,
    });
  },

  updateNoteChord: (noteId, newChord) => {
    const { song, undoStack } = get();
    if (!song) return;

    // Find the note to update
    let originalNote: ChordNote | undefined;
    for (const level of song.levels) {
      originalNote = level.chart.find((note) => note.id === noteId);
      if (originalNote) break;
    }

    if (!originalNote) return;

    const action: EditorAction = {
      type: 'update',
      noteId,
      previousState: { chord: originalNote.chord },
      newState: { chord: newChord },
      timestamp: Date.now(),
    };

    const updatedLevels = song.levels.map((level) => ({
      ...level,
      chart: level.chart.map((note) =>
        note.id === noteId ? { ...note, chord: newChord } : note
      ),
    }));

    set({
      song: {
        ...song,
        levels: updatedLevels,
        updatedAt: Date.now(),
      },
      undoStack: [...undoStack, action],
      redoStack: [],
      isDirty: true,
    });
  },

  selectNote: (noteId) => {
    set({ selectedNoteId: noteId });
  },

  setPlaying: (isPlaying) => {
    set({ isPlaying });
  },

  setCurrentTime: (time) => {
    set({ currentTime: time });
  },

  setZoom: (zoom) => {
    // Clamp zoom between 0.5 and 4
    const clampedZoom = Math.max(0.5, Math.min(4, zoom));
    set({ zoom: clampedZoom });
  },

  setSnapToGrid: (snap) => {
    set({ snapToGrid: snap });
  },

  setGridSubdivision: (subdivision) => {
    // Only allow valid subdivisions: 1, 2, 4, 8
    if ([1, 2, 4, 8].includes(subdivision)) {
      set({ gridSubdivision: subdivision });
    }
  },

  undo: () => {
    const { song, undoStack, redoStack } = get();
    if (!song || undoStack.length === 0) return;

    const lastAction = undoStack[undoStack.length - 1];
    const newUndoStack = undoStack.slice(0, -1);

    let updatedLevels = song.levels;

    switch (lastAction.type) {
      case 'add':
        // Remove the added note
        updatedLevels = song.levels.map((level) => ({
          ...level,
          chart: level.chart.filter((note) => note.id !== lastAction.noteId),
        }));
        break;

      case 'delete':
        // Re-add the deleted note
        if (lastAction.previousState.id) {
          const restoredNote: ChordNote = {
            id: lastAction.noteId!,
            chord: lastAction.previousState.chord!,
            time: lastAction.previousState.time!,
            duration: lastAction.previousState.duration!,
          };
          updatedLevels = song.levels.map((level, index) => {
            if (index === 0) {
              return {
                ...level,
                chart: [...level.chart, restoredNote],
              };
            }
            return level;
          });
        }
        break;

      case 'move':
        // Restore original time
        updatedLevels = song.levels.map((level) => ({
          ...level,
          chart: level.chart.map((note) =>
            note.id === lastAction.noteId
              ? { ...note, time: lastAction.previousState.time! }
              : note
          ),
        }));
        break;

      case 'resize':
        // Restore original duration
        updatedLevels = song.levels.map((level) => ({
          ...level,
          chart: level.chart.map((note) =>
            note.id === lastAction.noteId
              ? { ...note, duration: lastAction.previousState.duration! }
              : note
          ),
        }));
        break;

      case 'update':
        // Restore original chord
        updatedLevels = song.levels.map((level) => ({
          ...level,
          chart: level.chart.map((note) =>
            note.id === lastAction.noteId
              ? { ...note, chord: lastAction.previousState.chord! }
              : note
          ),
        }));
        break;
    }

    set({
      song: {
        ...song,
        levels: updatedLevels,
        updatedAt: Date.now(),
      },
      undoStack: newUndoStack,
      redoStack: [...redoStack, lastAction],
      isDirty: true,
    });
  },

  redo: () => {
    const { song, undoStack, redoStack } = get();
    if (!song || redoStack.length === 0) return;

    const lastAction = redoStack[redoStack.length - 1];
    const newRedoStack = redoStack.slice(0, -1);

    let updatedLevels = song.levels;

    switch (lastAction.type) {
      case 'add':
        // Re-add the note
        const newNote: ChordNote = {
          id: lastAction.noteId!,
          chord: lastAction.newState.chord!,
          time: lastAction.newState.time!,
          duration: lastAction.newState.duration!,
        };
        updatedLevels = song.levels.map((level, index) => {
          if (index === 0) {
            return {
              ...level,
              chart: [...level.chart, newNote],
            };
          }
          return level;
        });
        break;

      case 'delete':
        // Re-delete the note
        updatedLevels = song.levels.map((level) => ({
          ...level,
          chart: level.chart.filter((note) => note.id !== lastAction.noteId),
        }));
        break;

      case 'move':
        // Apply new time
        updatedLevels = song.levels.map((level) => ({
          ...level,
          chart: level.chart.map((note) =>
            note.id === lastAction.noteId
              ? { ...note, time: lastAction.newState.time! }
              : note
          ),
        }));
        break;

      case 'resize':
        // Apply new duration
        updatedLevels = song.levels.map((level) => ({
          ...level,
          chart: level.chart.map((note) =>
            note.id === lastAction.noteId
              ? { ...note, duration: lastAction.newState.duration! }
              : note
          ),
        }));
        break;

      case 'update':
        // Apply new chord
        updatedLevels = song.levels.map((level) => ({
          ...level,
          chart: level.chart.map((note) =>
            note.id === lastAction.noteId
              ? { ...note, chord: lastAction.newState.chord! }
              : note
          ),
        }));
        break;
    }

    set({
      song: {
        ...song,
        levels: updatedLevels,
        updatedAt: Date.now(),
      },
      undoStack: [...undoStack, lastAction],
      redoStack: newRedoStack,
      isDirty: true,
    });
  },

  snapTimeToGrid: (time) => {
    const { song, snapToGrid, gridSubdivision } = get();
    if (!song || !snapToGrid) return time;

    // Calculate grid interval based on BPM and subdivision
    // At 120 BPM: 1 beat = 0.5 seconds
    // Subdivision 4 = quarter notes = 0.125 seconds per grid line
    const secondsPerBeat = 60 / song.bpm;
    const gridInterval = secondsPerBeat / gridSubdivision;

    // Snap to nearest grid line
    return Math.round(time / gridInterval) * gridInterval;
  },

  reset: () => {
    set(initialState);
  },

  markClean: () => {
    set({ isDirty: false });
  },
}));
