import { chords } from '../../src/constants/chords';
import { getMockDetectedChord } from '../../src/utils/mockAudio';

describe('getMockDetectedChord', () => {
  it('returns a deterministic chord from the list', () => {
    const first = getMockDetectedChord(0, 123);
    const second = getMockDetectedChord(chords.length, 456);

    expect(first.name).toBe(chords[0].primaryName);
    expect(first.notes).toEqual(chords[0].notes);
    expect(first.timestamp).toBe(123);

    expect(second.name).toBe(chords[0].primaryName);
    expect(second.timestamp).toBe(456);
  });
});
