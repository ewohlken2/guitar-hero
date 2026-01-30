import type {
  UserSong,
  TimelinePosition,
  EditorAction,
  EditorState,
  GhostNote,
  Song,
  SongLevel,
  ChordNote,
} from '../../src/types';

describe('Editor Types', () => {
  describe('UserSong', () => {
    it('extends Song with required user-created fields', () => {
      const sampleLevel: SongLevel = {
        levelNumber: 1,
        name: 'Easy',
        description: 'Beginner level',
        chart: [],
      };

      const userSong: UserSong = {
        id: 'user-song-1',
        title: 'My Custom Song',
        artist: 'User',
        difficulty: 3,
        bpm: 120,
        levels: [sampleLevel],
        isUserCreated: true,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      expect(userSong.isUserCreated).toBe(true);
      expect(typeof userSong.createdAt).toBe('number');
      expect(typeof userSong.updatedAt).toBe('number');
      expect(userSong.title).toBe('My Custom Song');
      expect(userSong.bpm).toBe(120);
    });

    it('isUserCreated must be literal true', () => {
      const userSong: UserSong = {
        id: 'test',
        title: 'Test',
        artist: 'Test',
        difficulty: 1,
        bpm: 100,
        levels: [],
        isUserCreated: true,
        createdAt: 1000,
        updatedAt: 2000,
      };

      // TypeScript ensures isUserCreated is always true
      expect(userSong.isUserCreated).toBe(true);
    });
  });

  describe('TimelinePosition', () => {
    it('has correct structure with time, beat, and measure', () => {
      const position: TimelinePosition = {
        time: 5.5,
        beat: 22.5,
        measure: 6,
      };

      expect(typeof position.time).toBe('number');
      expect(typeof position.beat).toBe('number');
      expect(typeof position.measure).toBe('number');
      expect(position.time).toBe(5.5);
      expect(position.beat).toBe(22.5);
      expect(position.measure).toBe(6);
    });

    it('allows fractional beats', () => {
      const position: TimelinePosition = {
        time: 1.25,
        beat: 2.75,
        measure: 1,
      };

      expect(position.beat).toBe(2.75);
    });
  });

  describe('EditorAction', () => {
    it('supports add action type', () => {
      const action: EditorAction = {
        type: 'add',
        noteId: 'note-1',
        previousState: {},
        newState: { chord: 'Am', time: 1.0, duration: 0.5 },
        timestamp: Date.now(),
      };

      expect(action.type).toBe('add');
      expect(action.noteId).toBe('note-1');
      expect(action.newState.chord).toBe('Am');
    });

    it('supports delete action type', () => {
      const action: EditorAction = {
        type: 'delete',
        noteId: 'note-1',
        previousState: { chord: 'G', time: 2.0, duration: 1.0 },
        newState: {},
        timestamp: Date.now(),
      };

      expect(action.type).toBe('delete');
      expect(action.previousState.chord).toBe('G');
    });

    it('supports move action type', () => {
      const action: EditorAction = {
        type: 'move',
        noteId: 'note-1',
        previousState: { time: 1.0 },
        newState: { time: 2.0 },
        timestamp: Date.now(),
      };

      expect(action.type).toBe('move');
    });

    it('supports resize action type', () => {
      const action: EditorAction = {
        type: 'resize',
        noteId: 'note-1',
        previousState: { duration: 0.5 },
        newState: { duration: 1.0 },
        timestamp: Date.now(),
      };

      expect(action.type).toBe('resize');
    });

    it('supports update action type', () => {
      const action: EditorAction = {
        type: 'update',
        noteId: 'note-1',
        previousState: { chord: 'C' },
        newState: { chord: 'Cm' },
        timestamp: Date.now(),
      };

      expect(action.type).toBe('update');
    });

    it('noteId is optional', () => {
      const action: EditorAction = {
        type: 'add',
        previousState: {},
        newState: { chord: 'D' },
        timestamp: Date.now(),
      };

      expect(action.noteId).toBeUndefined();
    });
  });

  describe('EditorState', () => {
    it('has all required fields with correct types', () => {
      const sampleUserSong: UserSong = {
        id: 'song-1',
        title: 'Test Song',
        artist: 'Test Artist',
        difficulty: 2,
        bpm: 100,
        levels: [],
        isUserCreated: true,
        createdAt: 1000,
        updatedAt: 2000,
      };

      const editorState: EditorState = {
        song: sampleUserSong,
        selectedNoteId: 'note-1',
        isPlaying: false,
        currentTime: 0,
        zoom: 1,
        snapToGrid: true,
        gridSubdivision: 4,
        undoStack: [],
        redoStack: [],
        isDirty: false,
      };

      expect(editorState.song).toBe(sampleUserSong);
      expect(editorState.selectedNoteId).toBe('note-1');
      expect(editorState.isPlaying).toBe(false);
      expect(typeof editorState.currentTime).toBe('number');
      expect(typeof editorState.zoom).toBe('number');
      expect(typeof editorState.snapToGrid).toBe('boolean');
      expect(typeof editorState.gridSubdivision).toBe('number');
      expect(Array.isArray(editorState.undoStack)).toBe(true);
      expect(Array.isArray(editorState.redoStack)).toBe(true);
      expect(typeof editorState.isDirty).toBe('boolean');
    });

    it('allows null song', () => {
      const editorState: EditorState = {
        song: null,
        selectedNoteId: null,
        isPlaying: false,
        currentTime: 0,
        zoom: 1,
        snapToGrid: true,
        gridSubdivision: 1,
        undoStack: [],
        redoStack: [],
        isDirty: false,
      };

      expect(editorState.song).toBeNull();
    });

    it('allows null selectedNoteId', () => {
      const editorState: EditorState = {
        song: null,
        selectedNoteId: null,
        isPlaying: false,
        currentTime: 0,
        zoom: 2,
        snapToGrid: false,
        gridSubdivision: 8,
        undoStack: [],
        redoStack: [],
        isDirty: true,
      };

      expect(editorState.selectedNoteId).toBeNull();
    });

    it('supports valid zoom range values', () => {
      const stateMinZoom: EditorState = {
        song: null,
        selectedNoteId: null,
        isPlaying: false,
        currentTime: 0,
        zoom: 0.5,
        snapToGrid: true,
        gridSubdivision: 4,
        undoStack: [],
        redoStack: [],
        isDirty: false,
      };

      const stateMaxZoom: EditorState = {
        song: null,
        selectedNoteId: null,
        isPlaying: false,
        currentTime: 0,
        zoom: 4,
        snapToGrid: true,
        gridSubdivision: 4,
        undoStack: [],
        redoStack: [],
        isDirty: false,
      };

      expect(stateMinZoom.zoom).toBe(0.5);
      expect(stateMaxZoom.zoom).toBe(4);
    });

    it('supports valid gridSubdivision values', () => {
      const subdivisions = [1, 2, 4, 8];

      subdivisions.forEach((subdivision) => {
        const state: EditorState = {
          song: null,
          selectedNoteId: null,
          isPlaying: false,
          currentTime: 0,
          zoom: 1,
          snapToGrid: true,
          gridSubdivision: subdivision,
          undoStack: [],
          redoStack: [],
          isDirty: false,
        };

        expect(state.gridSubdivision).toBe(subdivision);
      });
    });

    it('can hold EditorActions in undo/redo stacks', () => {
      const action: EditorAction = {
        type: 'add',
        noteId: 'note-1',
        previousState: {},
        newState: { chord: 'E' },
        timestamp: Date.now(),
      };

      const editorState: EditorState = {
        song: null,
        selectedNoteId: null,
        isPlaying: false,
        currentTime: 0,
        zoom: 1,
        snapToGrid: true,
        gridSubdivision: 4,
        undoStack: [action],
        redoStack: [],
        isDirty: true,
      };

      expect(editorState.undoStack.length).toBe(1);
      expect(editorState.undoStack[0].type).toBe('add');
    });
  });

  describe('GhostNote', () => {
    it('has correct structure for placement preview', () => {
      const ghostNote: GhostNote = {
        chord: 'F',
        time: 3.5,
        duration: 0.5,
      };

      expect(typeof ghostNote.chord).toBe('string');
      expect(typeof ghostNote.time).toBe('number');
      expect(typeof ghostNote.duration).toBe('number');
      expect(ghostNote.chord).toBe('F');
      expect(ghostNote.time).toBe(3.5);
      expect(ghostNote.duration).toBe(0.5);
    });
  });
});
