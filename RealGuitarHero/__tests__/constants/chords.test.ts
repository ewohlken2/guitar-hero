import { chords } from '../../src/constants/chords';

describe('chords', () => {
  it('contains at least 100 chords', () => {
    expect(chords.length).toBeGreaterThanOrEqual(100);
  });

  it('has all unique ids', () => {
    const ids = chords.map((chord) => chord.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(ids.length);
  });

  it('has valid chord structure for all entries', () => {
    chords.forEach((chord) => {
      expect(chord.id).toBeDefined();
      expect(chord.primaryName).toBeDefined();
      expect(Array.isArray(chord.alternateNames)).toBe(true);
      expect(['major', 'minor', '7th', 'sus', 'aug', 'dim', 'extended', 'power']).toContain(chord.type);
      expect(['beginner', 'intermediate', 'advanced']).toContain(chord.difficulty);
      expect(Array.isArray(chord.notes)).toBe(true);
      expect(chord.notes.length).toBeGreaterThan(0);
      expect(chord.diagram).toBeDefined();
      expect(chord.diagram.strings.length).toBe(6);
      expect(chord.diagram.fingers.length).toBe(6);
      expect(typeof chord.diagram.baseFret).toBe('number');
    });
  });
});
