import { Chord, DetectedPitch, DetectedChordMatch } from '../types';

/**
 * Mapping of flat notes to their sharp equivalents.
 * Used to normalize pitch detection results for consistent chord matching.
 */
export const FLAT_TO_SHARP: Record<string, string> = {
  Db: 'C#',
  Eb: 'D#',
  Fb: 'E',
  Gb: 'F#',
  Ab: 'G#',
  Bb: 'A#',
  Cb: 'B',
};

/**
 * Normalizes a pitch class name by converting flats to sharps.
 * This ensures consistent comparison between detected notes and chord databases.
 *
 * @param pitchClass - The pitch class to normalize (e.g., 'Db', 'C#', 'C')
 * @returns The normalized pitch class using sharps (e.g., 'C#', 'C#', 'C')
 */
export function normalizePitchClass(pitchClass: string): string {
  // Capitalize the first letter, lowercase the rest for consistent lookup
  const normalized =
    pitchClass.charAt(0).toUpperCase() + pitchClass.slice(1).toLowerCase();

  // Check if it's a flat note and convert to sharp
  if (FLAT_TO_SHARP[normalized]) {
    return FLAT_TO_SHARP[normalized];
  }

  // Return the normalized version (handles naturals and sharps)
  return normalized;
}

/**
 * Default minimum confidence threshold for pitch detection.
 */
const DEFAULT_MIN_CONFIDENCE = 0.5;

/**
 * Minimum overlap score required to consider a chord match valid.
 */
const MIN_MATCH_SCORE = 0.5;

/**
 * Matches detected pitch data to the best matching chord from the database.
 *
 * The algorithm:
 * 1. Filters out low-confidence pitches
 * 2. Normalizes all detected notes (flats to sharps)
 * 3. Calculates overlap score for each chord in the database
 * 4. Returns the chord with the highest score above the threshold
 *
 * @param detectedPitches - Array of detected pitches from audio analysis
 * @param chordDatabase - Array of chords to match against
 * @param timestamp - When the detection occurred
 * @param minConfidence - Minimum confidence threshold (default: 0.5)
 * @returns The best matching chord with score, or null if no match found
 */
export function matchChordFromNotes(
  detectedPitches: DetectedPitch[],
  chordDatabase: Chord[],
  timestamp: number,
  minConfidence: number = DEFAULT_MIN_CONFIDENCE
): DetectedChordMatch | null {
  // Return null if no pitches detected
  if (detectedPitches.length === 0) {
    return null;
  }

  // Filter pitches by confidence threshold
  const confidentPitches = detectedPitches.filter(
    (p) => p.confidence >= minConfidence
  );

  // Return null if no pitches pass the confidence threshold
  if (confidentPitches.length === 0) {
    return null;
  }

  // Normalize detected notes and remove duplicates
  const detectedNotes = new Set(
    confidentPitches.map((p) => normalizePitchClass(p.note))
  );

  let bestMatch: { chord: Chord; score: number } | null = null;

  for (const chord of chordDatabase) {
    // Normalize chord notes for comparison
    const chordNotes = new Set(chord.notes.map(normalizePitchClass));

    // Calculate overlap score
    const score = calculateOverlapScore(detectedNotes, chordNotes);

    // Update best match if this chord has a higher score
    if (score > 0 && (!bestMatch || score > bestMatch.score)) {
      bestMatch = { chord, score };
    }
  }

  // Return null if no match found or score too low
  if (!bestMatch || bestMatch.score < MIN_MATCH_SCORE) {
    return null;
  }

  return {
    chord: bestMatch.chord,
    score: bestMatch.score,
    timestamp,
  };
}

/**
 * Calculates the overlap score between detected notes and chord notes.
 *
 * Score formula: (intersection size) / (chord notes size)
 * This measures what percentage of the chord's notes were detected.
 *
 * @param detectedNotes - Set of normalized detected note names
 * @param chordNotes - Set of normalized chord note names
 * @returns Score from 0 to 1, where 1 means all chord notes were detected
 */
function calculateOverlapScore(
  detectedNotes: Set<string>,
  chordNotes: Set<string>
): number {
  if (chordNotes.size === 0) {
    return 0;
  }

  // Count how many chord notes were detected
  let matchCount = 0;
  for (const note of chordNotes) {
    if (detectedNotes.has(note)) {
      matchCount++;
    }
  }

  return matchCount / chordNotes.size;
}
