# Phase 2 Audio Verification

## Prerequisites

- EAS CLI installed
- Physical iOS device or Android device with microphone
- Acoustic guitar

## Build Steps

1. Build dev client with native modules:
   ```bash
   # iOS
   eas build --profile development --platform ios

   # Android
   eas build --profile development --platform android
   ```

2. Install dev client on device

## Manual Test Checklist

### Basic Detection

- [ ] Start Freeplay and confirm detection begins (listening indicator active)
- [ ] Play open G chord - confirm chord match appears within 200ms
- [ ] Play open C chord - confirm chord match appears within 200ms
- [ ] Play open D chord - confirm chord match appears within 200ms
- [ ] Play open Em chord - confirm chord match appears within 200ms

### Barre Chord Detection

- [ ] Play barre F chord - confirm detection recognizes F major
- [ ] Play barre Bm chord - confirm detection recognizes B minor

### Latency Verification

- [ ] Visual observation: latency remains under 100-150ms
- [ ] No noticeable lag between strumming and UI update

### Fallback Testing

- [ ] Set `EXPO_PUBLIC_USE_MOCK_AUDIO=true` in environment
- [ ] Verify mock detection fallback works correctly in Freeplay
- [ ] Mock chords cycle through as expected

### Edge Cases

- [ ] Background noise handling - detection remains stable
- [ ] Rapid chord changes - detection keeps up
- [ ] Single note vs chord discrimination

## Expected Results

| Test | Expected |
|------|----------|
| Open chord detection | >90% accuracy |
| Barre chord detection | >80% accuracy |
| Detection latency | <150ms |
| False positive rate | <10% |

## Troubleshooting

### No detection on iOS
- Check microphone permissions in Settings
- Verify AVAudioSession category is correctly configured

### No detection on Android
- Check RECORD_AUDIO permission granted
- Verify minimum SDK level is 23+

### High latency
- Reduce FFT buffer size (trade-off: lower frequency resolution)
- Check for background processes consuming CPU
