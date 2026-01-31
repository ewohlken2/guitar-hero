import { chords } from '../../src/constants/chords';
import {
  FLAT_TO_SHARP,
  normalizePitchClass,
  matchChordFromNotes,
} from '../../src/utils/chordMatching';
import { DetectedPitch } from '../../src/types';

describe('normalizePitchClass', () => {
  it('converts flat notes to sharp equivalents', () => {
    expect(normalizePitchClass('Db')).toBe('C#');
    expect(normalizePitchClass('Eb')).toBe('D#');
    expect(normalizePitchClass('Gb')).toBe('F#');
    expect(normalizePitchClass('Ab')).toBe('G#');
    expect(normalizePitchClass('Bb')).toBe('A#');
  });

  it('returns natural notes unchanged', () => {
    expect(normalizePitchClass('C')).toBe('C');
    expect(normalizePitchClass('D')).toBe('D');
    expect(normalizePitchClass('E')).toBe('E');
    expect(normalizePitchClass('F')).toBe('F');
    expect(normalizePitchClass('G')).toBe('G');
    expect(normalizePitchClass('A')).toBe('A');
    expect(normalizePitchClass('B')).toBe('B');
  });

  it('returns sharp notes unchanged', () => {
    expect(normalizePitchClass('C#')).toBe('C#');
    expect(normalizePitchClass('D#')).toBe('D#');
    expect(normalizePitchClass('F#')).toBe('F#');
    expect(normalizePitchClass('G#')).toBe('G#');
    expect(normalizePitchClass('A#')).toBe('A#');
  });

  it('handles lowercase input', () => {
    expect(normalizePitchClass('db')).toBe('C#');
    expect(normalizePitchClass('eb')).toBe('D#');
    expect(normalizePitchClass('c')).toBe('C');
  });
});

describe('FLAT_TO_SHARP', () => {
  it('contains all flat to sharp mappings', () => {
    expect(FLAT_TO_SHARP).toEqual({
      Db: 'C#',
      Eb: 'D#',
      Fb: 'E',
      Gb: 'F#',
      Ab: 'G#',
      Bb: 'A#',
      Cb: 'B',
    });
  });
});

describe('matchChordFromNotes', () => {
  const createPitches = (notes: string[]): DetectedPitch[] => {
    return notes.map((note, index) => ({
      note,
      frequency: 440 + index * 100,
      confidence: 0.9,
    }));
  };

  it('matches exact chord notes to a chord', () => {
    // C major: C, E, G
    const pitches = createPitches(['C', 'E', 'G']);
    const result = matchChordFromNotes(pitches, chords, Date.now());

    expect(result).not.toBeNull();
    expect(result?.chord.primaryName).toBe('C');
    expect(result?.score).toBe(1); // Perfect match
  });

  it('returns null when no pitches detected', () => {
    const result = matchChordFromNotes([], chords, Date.now());
    expect(result).toBeNull();
  });

  it('returns null when notes do not match any chord well', () => {
    // Notes that don't form any recognizable chord pattern
    // Using only one note - won't reach 50% threshold for 3+ note chords
    // and won't match power chords (which need 2 specific notes)
    const pitches = createPitches(['C#']);
    const result = matchChordFromNotes(pitches, chords, Date.now());

    // Single note C# won't match 50% of any chord (even power chords need 2 notes)
    expect(result).toBeNull();
  });

  it('handles flat notes by normalizing to sharps', () => {
    // F minor contains Ab which should be normalized to G#
    // Fm: F, Ab, C -> F, G#, C
    const pitches = createPitches(['F', 'Ab', 'C']);
    const result = matchChordFromNotes(pitches, chords, Date.now());

    expect(result).not.toBeNull();
    expect(result?.chord.primaryName).toBe('Fm');
  });

  it('calculates score based on note overlap', () => {
    // D major: D, F#, A - but we only detect D and F#
    const pitches = createPitches(['D', 'F#']);
    const result = matchChordFromNotes(pitches, chords, Date.now());

    // Should match D major with 2/3 notes = 0.67 score
    expect(result).not.toBeNull();
    // Score should be less than 1 since not all notes detected
    expect(result!.score).toBeLessThan(1);
    expect(result!.score).toBeGreaterThan(0);
    // 2 out of 3 notes for D major
    expect(result!.score).toBeCloseTo(2 / 3, 2);
  });

  it('includes timestamp in the result', () => {
    const timestamp = 1234567890;
    const pitches = createPitches(['C', 'E', 'G']);
    const result = matchChordFromNotes(pitches, chords, timestamp);

    expect(result?.timestamp).toBe(timestamp);
  });

  it('prefers chords with higher overlap scores', () => {
    // G major: G, B, D
    // Em: E, G, B
    // If we detect G, B we should get one of these
    const pitches = createPitches(['G', 'B', 'D']);
    const result = matchChordFromNotes(pitches, chords, Date.now());

    expect(result).not.toBeNull();
    expect(result?.chord.primaryName).toBe('G');
    expect(result?.score).toBe(1);
  });

  it('handles duplicate detected notes', () => {
    // Multiple octaves of the same note
    const pitches = createPitches(['C', 'E', 'G', 'C', 'E']);
    const result = matchChordFromNotes(pitches, chords, Date.now());

    expect(result).not.toBeNull();
    expect(result?.chord.primaryName).toBe('C');
  });

  it('filters low confidence pitches', () => {
    const pitches: DetectedPitch[] = [
      { note: 'C', frequency: 261.63, confidence: 0.9 },
      { note: 'E', frequency: 329.63, confidence: 0.9 },
      { note: 'G', frequency: 392.0, confidence: 0.9 },
      { note: 'X', frequency: 100, confidence: 0.1 }, // Low confidence, should be ignored
    ];
    const result = matchChordFromNotes(pitches, chords, Date.now());

    expect(result).not.toBeNull();
    expect(result?.chord.primaryName).toBe('C');
  });

  it('requires minimum confidence threshold', () => {
    const pitches: DetectedPitch[] = [
      { note: 'C', frequency: 261.63, confidence: 0.3 },
      { note: 'E', frequency: 329.63, confidence: 0.3 },
      { note: 'G', frequency: 392.0, confidence: 0.3 },
    ];
    const result = matchChordFromNotes(pitches, chords, Date.now(), 0.5);

    // All pitches below threshold, should return null
    expect(result).toBeNull();
  });
});
