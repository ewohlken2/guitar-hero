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
  type: 'major' | 'minor' | '7th' | 'sus' | 'aug' | 'dim' | 'extended' | 'power';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  notes: string[];
  diagram: ChordDiagram;
  alternateVoicings?: ChordDiagram[];
}

// Pitch detection types
export interface DetectedPitch {
  note: string; // Note name (e.g., 'C', 'F#', 'Bb')
  frequency: number; // Detected frequency in Hz
  confidence: number; // Confidence score 0-1
}

export interface DetectedChordMatch {
  chord: Chord;
  score: number; // Overlap score 0-1
  timestamp: number; // When the match was detected
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
export type HitType = 'perfect' | 'good' | 'miss';

export interface HitResult {
  type: HitType;
  points: number;
  noteId: string;
  timestamp: number;
}

// Editor types for custom song creation
export interface UserSong extends Song {
  isUserCreated: true; // Literal type to distinguish user-created songs
  createdAt: number; // Timestamp when song was created
  updatedAt: number; // Timestamp when song was last modified
}

export interface TimelinePosition {
  time: number; // Time in seconds
  beat: number; // Beat number (can be fractional)
  measure: number; // Measure number
}

export interface EditorAction {
  type: 'add' | 'delete' | 'move' | 'resize' | 'update';
  noteId?: string;
  previousState: Partial<ChordNote>;
  newState: Partial<ChordNote>;
  timestamp: number;
}

export interface EditorState {
  song: UserSong | null;
  selectedNoteId: string | null;
  isPlaying: boolean;
  currentTime: number;
  zoom: number; // Range: 0.5 to 4
  snapToGrid: boolean;
  gridSubdivision: number; // Values: 1, 2, 4, 8
  undoStack: EditorAction[];
  redoStack: EditorAction[];
  isDirty: boolean;
}

export interface GhostNote {
  chord: string;
  time: number;
  duration: number;
}
