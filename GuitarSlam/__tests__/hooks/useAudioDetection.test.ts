import { useAudioDetection } from '../../src/hooks/useAudioDetection';

describe('useAudioDetection', () => {
  it('exports a hook', () => {
    expect(typeof useAudioDetection).toBe('function');
  });
});
