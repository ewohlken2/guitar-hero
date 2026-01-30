import { startListening, stopListening, addListener } from '../../modules/audio-detection';

describe('audio detection module bridge', () => {
  it('exposes start/stop functions', () => {
    expect(typeof startListening).toBe('function');
    expect(typeof stopListening).toBe('function');
    expect(typeof addListener).toBe('function');
  });
});
