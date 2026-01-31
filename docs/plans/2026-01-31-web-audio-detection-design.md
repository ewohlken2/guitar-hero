# Web Audio Detection Design

## Overview

Add real-time pitch detection to the web platform, achieving full parity with iOS and Android implementations.

## Goals

- Match native pitch detection accuracy and latency
- Support modern evergreen browsers (Chrome, Firefox, Safari, Edge latest versions)
- No changes required to existing hooks, stores, or UI components

## Architecture

### File Structure

```
modules/audio-detection/
├── ios/                          # Existing - unchanged
├── android/                      # Existing - unchanged
├── web/
│   ├── AudioDetectionModule.ts   # Main module matching native API
│   ├── AudioWorkletProcessor.ts  # Runs FFT on audio thread
│   └── fftProcessor.ts           # FFT + pitch detection logic
├── index.ts                      # Updated to detect platform
└── src/AudioDetection.types.ts   # Shared types - unchanged
```

### Audio Pipeline

1. User triggers "start" → `startListening()` called
2. Request microphone permission via `navigator.mediaDevices.getUserMedia()`
3. Connect `MediaStreamSource` → `AudioWorkletNode`
4. Worklet accumulates 128-sample chunks until 4096-sample buffer is full
5. Run FFT analysis, find peaks, post pitch data to main thread
6. Main thread emits `onPitchDetected` events matching native format

### Platform Detection

Update `index.ts` to detect web platform:

```typescript
import { Platform } from 'react-native';

let AudioDetectionModule;

if (Platform.OS === 'web') {
  AudioDetectionModule = require('./web/AudioDetectionModule').default;
} else {
  try {
    AudioDetectionModule = require('./src/AudioDetectionModule').default;
  } catch {
    AudioDetectionModule = mockImplementation;
  }
}
```

## FFT Processing

### Parameters (matching native implementations)

| Parameter | Value |
|-----------|-------|
| Sample rate | 44100 Hz |
| FFT size | 4096 samples |
| Buffer latency | ~93ms |
| Window function | Hann |
| Frequency range | 82 Hz - 1500 Hz (E2 to ~E6) |
| Confidence threshold | 0.3 |
| Max pitches returned | 5-6 |

### Processing Pipeline

1. Apply Hann window to 4096-sample buffer
2. Run real FFT via `fft.js` library (~3KB minified)
3. Calculate magnitudes from complex output
4. Find peaks in guitar frequency range
5. Apply parabolic interpolation for sub-bin accuracy
6. Filter by confidence threshold
7. Return top pitches with frequencies and confidence scores

### Output Format

Matches existing `PitchData` type:

```typescript
{
  pitches: [
    { note: "E2", frequency: 82.41, confidence: 0.85 },
    { note: "B3", frequency: 246.94, confidence: 0.72 },
    // ...
  ]
}
```

## Module API

Exports match native implementations exactly:

- `startListening(): Promise<void>` - Requests mic permission, starts AudioWorklet
- `stopListening(): Promise<void>` - Disconnects audio nodes, releases mic
- `addListener(event, callback): Subscription` - Subscribes to `onPitchDetected`
- `removeListeners(event): void` - Cleanup

No changes needed to `useAudioDetection.ts`, `useAudioStore.ts`, or components.

## Error Handling

### Permission Errors

| Scenario | Error Type | Handling |
|----------|------------|----------|
| User denies microphone | `PermissionDeniedError` | Surface through hook's error state |
| Insecure context | `NotAllowedError` | Surface through hook's error state |
| No microphone found | `NotFoundError` | Surface through hook's error state |

### Audio Context Restrictions

- Browsers require user interaction before starting AudioContext
- Permission request on first use satisfies this requirement
- Catch and surface errors if called without interaction

### Device Issues

- Microphone disconnected mid-session → detect silence, emit warning event
- Tab goes to background → detect via `visibilitychange`, pause/warn user

### Graceful Degradation

- AudioWorklet unsupported → fall back to ScriptProcessorNode with warning
- Web Audio API missing → fall back to existing mock implementation

## Testing Strategy

### Unit Tests

- Test `fftProcessor.ts` with known audio samples
- Verify Hann window application
- Test peak detection with synthetic frequency data
- Validate parabolic interpolation accuracy

### Integration Tests

- Mock `navigator.mediaDevices.getUserMedia` with test audio streams
- Verify `startListening`/`stopListening` lifecycle
- Test event emission format matches `PitchData` type
- Test permission denial handling

### Manual Testing

- Compare detection accuracy against iOS/Android with same guitar input
- Test across Chrome, Firefox, Safari, Edge
- Verify tab lifecycle handling (background/foreground)

## Dependencies

New dependencies:

- `fft.js` (or similar) - ~3KB minified JavaScript FFT library

No other new dependencies required. Uses Web Audio API built into browsers.

## Browser Support

| Browser | Minimum Version | Notes |
|---------|-----------------|-------|
| Chrome | Latest | Full support |
| Firefox | Latest | Full support |
| Safari | Latest | Full support |
| Edge | Latest | Full support |

AudioWorklet is supported in all target browsers. No polyfills needed.
