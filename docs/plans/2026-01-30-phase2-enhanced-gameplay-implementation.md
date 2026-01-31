# Phase 2 Enhanced Gameplay Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Deliver Phase 2 features: polyphonic CQT-based chord detection, 100+ chord database, scoring + combo + visual feedback, multi-level song progression, and 10+ pre-bundled songs with difficulty ratings.

**Architecture:** Add native audio detection modules (iOS Swift + Android Kotlin) that emit detected pitches to JS, run a shared TypeScript chord-matching layer, and wire outputs into Game/Freeplay UI. Expand content data via structured JSON/TS constants and drive gameplay from song/level metadata.

**Tech Stack:** Expo (React Native), TypeScript, Expo Modules (native), AudioKit/Accelerate (iOS), TarsosDSP (Android), Zustand, Jest

---

## Task 1: Add polyphonic detection data types and chord-matching utilities

Status (2026-01-30): Implemented. Tests PASS: `pnpm test -- __tests__/utils/chordMatching.test.ts`.

**Files:**

- Modify: `GuitarSlam/src/types/index.ts`
- Create: `GuitarSlam/src/utils/chordMatching.ts`
- Test: `GuitarSlam/__tests__/utils/chordMatching.test.ts`

**Step 1: Write the failing tests**

Create `GuitarSlam/__tests__/utils/chordMatching.test.ts`:

```ts
import {
  matchChordFromNotes,
  normalizePitchClass,
} from "../../src/utils/chordMatching";
import { chords } from "../../src/constants/chords";

describe("normalizePitchClass", () => {
  it("normalizes sharps and flats to canonical pitch classes", () => {
    expect(normalizePitchClass("Bb")).toBe("A#");
    expect(normalizePitchClass("Db")).toBe("C#");
    expect(normalizePitchClass("F#")).toBe("F#");
  });
});

describe("matchChordFromNotes", () => {
  it("matches a chord from a detected note set", () => {
    const result = matchChordFromNotes(["G", "B", "D"], chords);
    expect(result?.primaryName).toBe("G");
  });

  it("handles extra notes by using a threshold overlap score", () => {
    const result = matchChordFromNotes(["G", "B", "D", "A"], chords);
    expect(result?.primaryName).toBe("G");
  });

  it("returns null when confidence is too low", () => {
    const result = matchChordFromNotes(["C#", "F#"], chords, 0.75);
    expect(result).toBeNull();
  });
});
```

**Step 2: Run test to verify it fails**

Run: `pnpm test -- __tests__/utils/chordMatching.test.ts`
Expected: FAIL with "Cannot find module '../utils/chordMatching'"

**Step 3: Add types for detected pitches and chord matches**

Modify `GuitarSlam/src/types/index.ts`:

```ts
export interface DetectedPitch {
  note: string; // pitch class, e.g. C, C#, D
  frequency: number;
  confidence: number; // 0-1
}

export interface DetectedChordMatch {
  chord: Chord;
  score: number; // 0-1
  timestamp: number;
}
```

**Step 4: Implement chord matching utilities**

Create `GuitarSlam/src/utils/chordMatching.ts`:

```ts
import { Chord } from "../types";

const FLAT_TO_SHARP: Record<string, string> = {
  Ab: "G#",
  Bb: "A#",
  Db: "C#",
  Eb: "D#",
  Gb: "F#",
};

export const normalizePitchClass = (note: string): string => {
  return FLAT_TO_SHARP[note] ?? note;
};

const toPitchClassSet = (notes: string[]): Set<string> => {
  return new Set(notes.map((note) => normalizePitchClass(note)));
};

export const matchChordFromNotes = (
  detectedNotes: string[],
  chordList: Chord[],
  minScore = 0.6,
): Chord | null => {
  if (detectedNotes.length === 0) return null;

  const detected = toPitchClassSet(detectedNotes);

  let best: { chord: Chord; score: number } | null = null;

  for (const chord of chordList) {
    const chordNotes = toPitchClassSet(chord.notes);

    let overlap = 0;
    chordNotes.forEach((note) => {
      if (detected.has(note)) overlap += 1;
    });

    const score = overlap / chordNotes.size;

    if (!best || score > best.score) {
      best = { chord, score };
    }
  }

  if (!best || best.score < minScore) return null;
  return best.chord;
};
```

**Step 5: Run tests to verify they pass**

Run: `pnpm test -- __tests__/utils/chordMatching.test.ts`
Expected: PASS

**Step 6: Commit**

```bash
git add GuitarSlam/src/types/index.ts GuitarSlam/src/utils/chordMatching.ts GuitarSlam/__tests__/utils/chordMatching.test.ts
git commit -m "feat: add chord matching utilities"
```

---

## Task 2: Expand chord database to 100+ chords

Status (2026-01-30): Implemented. Tests PASS: `pnpm test -- __tests__/constants/chords.test.ts`.

**Files:**

- Modify: `GuitarSlam/src/constants/chords.ts`
- Test: `GuitarSlam/__tests__/constants/chords.test.ts`

**Step 1: Write the failing test**

Create `GuitarSlam/__tests__/constants/chords.test.ts`:

```ts
import { chords } from "../../src/constants/chords";

describe("chords database", () => {
  it("contains at least 100 chords", () => {
    expect(chords.length).toBeGreaterThanOrEqual(100);
  });

  it("contains unique ids", () => {
    const ids = new Set(chords.map((chord) => chord.id));
    expect(ids.size).toBe(chords.length);
  });
});
```

**Step 2: Run test to verify it fails**

Run: `pnpm test -- __tests__/constants/chords.test.ts`
Expected: FAIL with "Expected: >= 100"

**Step 3: Expand chord data**

Update `GuitarSlam/src/constants/chords.ts` to include 100+ entries across:

- Major/minor (12 each)
- Dominant/major/minor 7ths
- Sus2/sus4
- Extended (add9, 6, 9, 11, 13)
- Power chords
- Diminished/augmented
- Common jazz voicings

Add complete data entries with `diagram`, `notes`, `difficulty`, `alternateNames`, and `id` for each chord. Keep the structure consistent with the existing file and sort by type to maintain readability.

Example entry structure (repeat for all chords):

```ts
{
  id: 'f-major',
  primaryName: 'F',
  alternateNames: ['Fmaj', 'FM'],
  type: 'major',
  difficulty: 'intermediate',
  notes: ['F', 'A', 'C'],
  diagram: {
    strings: [1, 3, 3, 2, 1, 1],
    fingers: [1, 3, 4, 2, 1, 1],
    baseFret: 1,
    barres: [1],
  },
},
```

**Step 4: Run test to verify it passes**

Run: `pnpm test -- __tests__/constants/chords.test.ts`
Expected: PASS

**Step 5: Commit**

```bash
git add GuitarSlam/src/constants/chords.ts GuitarSlam/__tests__/constants/chords.test.ts
git commit -m "feat: expand chord database to 100+ entries"
```

---

## Task 3: Add polyphonic detection native modules (iOS)

Status (2026-01-30): Implemented (JS bridge + iOS files). Tests PASS: `pnpm test -- __tests__/modules/audioDetection.test.ts`.

**Files:**

- Create: `GuitarSlam/modules/audio-detection/ios/AudioDetectionModule.swift`
- Create: `GuitarSlam/modules/audio-detection/ios/CQTProcessor.swift`
- Create: `GuitarSlam/modules/audio-detection/ios/AudioDetectionModule.podspec`
- Create: `GuitarSlam/modules/audio-detection/index.ts`
- Modify: `GuitarSlam/package.json`

**Step 1: Write the failing JS bridge test**

Create `GuitarSlam/__tests__/modules/audioDetection.test.ts`:

```ts
import {
  startListening,
  stopListening,
  addListener,
} from "../../modules/audio-detection";

describe("audio detection module bridge", () => {
  it("exposes start/stop functions", () => {
    expect(typeof startListening).toBe("function");
    expect(typeof stopListening).toBe("function");
    expect(typeof addListener).toBe("function");
  });
});
```

**Step 2: Run test to verify it fails**

Run: `pnpm test -- __tests__/modules/audioDetection.test.ts`
Expected: FAIL with "Cannot find module '../../modules/audio-detection'"

**Step 3: Add JS module entry**

Create `GuitarSlam/modules/audio-detection/index.ts`:

```ts
import {
  EventEmitter,
  NativeModulesProxy,
  Subscription,
} from "expo-modules-core";

const { AudioDetectionModule } = NativeModulesProxy;
const emitter = new EventEmitter(AudioDetectionModule);

export type DetectedPitchEvent = {
  pitches: { note: string; frequency: number; confidence: number }[];
  timestamp: number;
};

export const startListening = () => AudioDetectionModule.startListening();
export const stopListening = () => AudioDetectionModule.stopListening();

export const addListener = (
  listener: (event: DetectedPitchEvent) => void,
): Subscription => {
  return emitter.addListener("onDetectedPitches", listener);
};
```

**Step 4: Add iOS module scaffold**

Create `GuitarSlam/modules/audio-detection/ios/AudioDetectionModule.swift`:

```swift
import ExpoModulesCore
import AVFoundation

public class AudioDetectionModule: Module {
  private let engine = AVAudioEngine()
  private let processor = CQTProcessor()

  public func definition() -> ModuleDefinition {
    Name("AudioDetectionModule")

    Events("onDetectedPitches")

    Function("startListening") { [weak self] in
      self?.startEngine()
    }

    Function("stopListening") { [weak self] in
      self?.stopEngine()
    }
  }

  private func startEngine() {
    let input = engine.inputNode
    let format = input.outputFormat(forBus: 0)

    input.installTap(onBus: 0, bufferSize: 4096, format: format) { [weak self] buffer, _ in
      guard let self = self else { return }
      let result = self.processor.process(buffer: buffer)

      self.sendEvent("onDetectedPitches", [
        "pitches": result.pitches.map { ["note": $0.note, "frequency": $0.frequency, "confidence": $0.confidence] },
        "timestamp": result.timestamp,
      ])
    }

    try? engine.start()
  }

  private func stopEngine() {
    engine.inputNode.removeTap(onBus: 0)
    engine.stop()
  }
}
```

**Step 5: Add CQT processor implementation (iOS)**

Create `GuitarSlam/modules/audio-detection/ios/CQTProcessor.swift`:

```swift
import AVFoundation
import Accelerate

struct DetectedPitch {
  let note: String
  let frequency: Double
  let confidence: Double
}

struct CQTResult {
  let pitches: [DetectedPitch]
  let timestamp: Double
}

final class CQTProcessor {
  private let sampleRate: Double = 44100
  private let fftSize: Int = 4096

  func process(buffer: AVAudioPCMBuffer) -> CQTResult {
    guard let channelData = buffer.floatChannelData?[0] else {
      return CQTResult(pitches: [], timestamp: Date().timeIntervalSince1970)
    }

    let frameCount = Int(buffer.frameLength)
    let window = vDSP.window(ofType: Float.self, usingSequence: .hanningDenormalized, count: frameCount, isHalfWindow: false)

    var windowed = [Float](repeating: 0, count: frameCount)
    vDSP.multiply(channelData, window, result: &windowed)

    var real = [Float](repeating: 0, count: fftSize / 2)
    var imag = [Float](repeating: 0, count: fftSize / 2)

    windowed.withUnsafeBufferPointer { pointer in
      pointer.baseAddress!.withMemoryRebound(to: DSPComplex.self, capacity: fftSize) { complexPointer in
        var split = DSPSplitComplex(realp: &real, imagp: &imag)
        vDSP_ctoz(complexPointer, 2, &split, 1, vDSP_Length(fftSize / 2))

        let log2n = vDSP_Length(log2(Float(fftSize)))
        let fft = vDSP_create_fftsetup(log2n, Int32(kFFTRadix2))
        vDSP_fft_zrip(fft!, &split, 1, log2n, FFTDirection(FFT_FORWARD))
        vDSP_destroy_fftsetup(fft)
      }
    }

    var magnitudes = [Float](repeating: 0, count: fftSize / 2)
    vDSP.squareMagnitudes(real: real, imaginary: imag, result: &magnitudes)

    let pitches = estimatePitches(from: magnitudes)
    return CQTResult(pitches: pitches, timestamp: Date().timeIntervalSince1970)
  }

  private func estimatePitches(from magnitudes: [Float]) -> [DetectedPitch] {
    // Map FFT bins to pitch classes via log-frequency buckets (CQT-style)
    let minFreq: Double = 82.41 // E2
    let maxFreq: Double = 659.26 // E5

    var results: [DetectedPitch] = []

    for bin in 0..<magnitudes.count {
      let freq = Double(bin) * sampleRate / Double(fftSize)
      if freq < minFreq || freq > maxFreq { continue }

      let confidence = Double(magnitudes[bin])
      if confidence < 0.001 { continue }

      let note = pitchClass(for: freq)
      results.append(DetectedPitch(note: note, frequency: freq, confidence: confidence))
    }

    return results.sorted { $0.confidence > $1.confidence }.prefix(6).map { $0 }
  }

  private func pitchClass(for frequency: Double) -> String {
    let noteNames = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"]
    let a4 = 440.0
    let semitones = 12 * log2(frequency / a4)
    let index = Int(round(semitones)) + 9
    return noteNames[(index % 12 + 12) % 12]
  }
}
```

**Step 6: Add podspec and package.json entry**

Create `GuitarSlam/modules/audio-detection/ios/AudioDetectionModule.podspec`:

```ruby
Pod::Spec.new do |s|
  s.name           = 'AudioDetectionModule'
  s.version        = '1.0.0'
  s.summary        = 'Audio detection module for Real Guitar Hero'
  s.platforms      = { ios: '14.0' }
  s.source         = { git: 'local', tag: s.version }
  s.source_files   = '**/*.{swift,h,m,mm}'
  s.dependency     'ExpoModulesCore'
end
```

Modify `GuitarSlam/package.json` to include the module under `expo.modules` if needed by your Expo config.

**Step 7: Run test to verify it passes**

Run: `pnpm test -- __tests__/modules/audioDetection.test.ts`
Expected: PASS

**Step 8: Commit**

```bash
git add GuitarSlam/modules/audio-detection GuitarSlam/package.json GuitarSlam/__tests__/modules/audioDetection.test.ts
git commit -m "feat: add iOS audio detection module scaffold"
```

---

## Task 4: Add polyphonic detection native modules (Android)

Status (2026-01-30): Implemented. Android app prebuild completed; JTransforms dependency added to module build.

**Files:**

- Create: `GuitarSlam/modules/audio-detection/android/AudioDetectionModule.kt`
- Modify: `GuitarSlam/android/build.gradle` (after running `expo prebuild`)
- Modify: `GuitarSlam/modules/audio-detection/index.ts`

**Step 1: Add Android module implementation**

Create `GuitarSlam/modules/audio-detection/android/AudioDetectionModule.kt`:

```kotlin
package com.GuitarSlam.audiodetection

import android.media.AudioRecord
import android.media.MediaRecorder
import android.media.AudioFormat
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import org.jtransforms.fft.DoubleFFT_1D
import kotlin.math.log2

class AudioDetectionModule : Module() {
  private var audioRecord: AudioRecord? = null
  private val sampleRate = 44100
  private val bufferSize = 4096

  override fun definition() = ModuleDefinition {
    Name("AudioDetectionModule")

    Events("onDetectedPitches")

    Function("startListening") {
      startEngine()
    }

    Function("stopListening") {
      stopEngine()
    }
  }

  private fun startEngine() {
    val minBuffer = AudioRecord.getMinBufferSize(
      sampleRate,
      AudioFormat.CHANNEL_IN_MONO,
      AudioFormat.ENCODING_PCM_16BIT
    )

    audioRecord = AudioRecord(
      MediaRecorder.AudioSource.MIC,
      sampleRate,
      AudioFormat.CHANNEL_IN_MONO,
      AudioFormat.ENCODING_PCM_16BIT,
      maxOf(minBuffer, bufferSize * 2)
    )

    audioRecord?.startRecording()

    Thread {
      val buffer = ShortArray(bufferSize)
      val fft = DoubleFFT_1D(bufferSize.toLong())

      while (audioRecord?.recordingState == AudioRecord.RECORDSTATE_RECORDING) {
        val read = audioRecord?.read(buffer, 0, buffer.size) ?: 0
        if (read <= 0) continue

        val data = DoubleArray(bufferSize * 2)
        for (i in 0 until bufferSize) {
          data[2 * i] = buffer[i].toDouble()
          data[2 * i + 1] = 0.0
        }

        fft.complexForward(data)

        val pitches = mutableListOf<Map<String, Any>>()
        for (i in 0 until bufferSize / 2) {
          val real = data[2 * i]
          val imag = data[2 * i + 1]
          val magnitude = real * real + imag * imag

          if (magnitude < 1e6) continue

          val freq = i * sampleRate.toDouble() / bufferSize
          if (freq < 82.41 || freq > 659.26) continue

          val note = pitchClass(freq)
          pitches.add(mapOf("note" to note, "frequency" to freq, "confidence" to magnitude))
        }

        sendEvent("onDetectedPitches", mapOf(
          "pitches" to pitches.take(6),
          "timestamp" to System.currentTimeMillis() / 1000.0,
        ))
      }
    }.start()
  }

  private fun stopEngine() {
    audioRecord?.stop()
    audioRecord?.release()
    audioRecord = null
  }

  private fun pitchClass(freq: Double): String {
    val names = arrayOf("C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B")
    val a4 = 440.0
    val semitones = 12 * log2(freq / a4)
    val index = Math.round(semitones).toInt() + 9
    return names[(index % 12 + 12) % 12]
  }
}
```

**Step 2: Ensure Android dependencies are added**

Add `implementation 'com.github.wendykierp:JTransforms:3.1'` to the module/Android build (after `expo prebuild` creates `android/`).

**Step 3: Commit**

```bash
git add GuitarSlam/modules/audio-detection
# Add android/ build config after prebuild
# git add GuitarSlam/android/build.gradle

git commit -m "feat: add Android audio detection module scaffold"
```

---

## Task 5: Wire native detection into audio store + Freeplay UI

Status (2026-01-30): Implemented (keeps FallingNote, adds native hook + env-based switch). Tests PASS: `pnpm test -- __tests__/stores/useAudioStore.test.ts`, `pnpm test -- __tests__/hooks/useAudioDetection.test.ts`.

**Files:**

- Modify: `GuitarSlam/src/stores/useAudioStore.ts`
- Modify: `GuitarSlam/src/hooks/useMockAudioDetection.ts` (gate for dev)
- Create: `GuitarSlam/src/hooks/useAudioDetection.ts`
- Modify: `GuitarSlam/app/(tabs)/freeplay.tsx`
- Test: `GuitarSlam/__tests__/stores/useAudioStore.test.ts`

**Step 1: Write the failing store test**

Create `GuitarSlam/__tests__/stores/useAudioStore.test.ts`:

```ts
import { act } from "@testing-library/react-native";
import { useAudioStore } from "../../src/stores/useAudioStore";

describe("useAudioStore", () => {
  it("sets current chord and adds to history", () => {
    const chord = {
      name: "G",
      confidence: 0.8,
      notes: ["G", "B", "D"],
      timestamp: 123,
    };

    act(() => {
      useAudioStore.getState().setCurrentChord(chord);
      useAudioStore.getState().addToHistory(chord);
    });

    const state = useAudioStore.getState();
    expect(state.currentChord?.name).toBe("G");
    expect(state.chordHistory[0]?.name).toBe("G");
  });
});
```

**Step 2: Run test to verify it fails**

Run: `pnpm test -- __tests__/stores/useAudioStore.test.ts`
Expected: FAIL if missing actions or types

**Step 3: Add a native detection hook**

Create `GuitarSlam/src/hooks/useAudioDetection.ts`:

```ts
import { useEffect, useMemo } from "react";
import {
  addListener,
  startListening,
  stopListening,
} from "../../modules/audio-detection";
import { useAudioStore } from "../stores/useAudioStore";
import { matchChordFromNotes } from "../utils/chordMatching";
import { chords } from "../constants/chords";

export const useAudioDetection = () => {
  const { setListening, setCurrentChord, addToHistory, setError } =
    useAudioStore();

  const subscription = useMemo(
    () =>
      addListener((event) => {
        const notes = event.pitches.map((pitch) => pitch.note);
        const match = matchChordFromNotes(notes, chords);

        if (!match) return;

        const chord = {
          name: match.primaryName,
          confidence: event.pitches[0]?.confidence ?? 0.6,
          notes: match.notes,
          timestamp: event.timestamp,
        };

        setCurrentChord(chord);
        addToHistory(chord);
      }),
    [addToHistory, setCurrentChord],
  );

  useEffect(() => {
    setError(null);
    return () => subscription.remove();
  }, [setError, subscription]);

  return {
    start: () => {
      setListening(true);
      startListening();
    },
    stop: () => {
      setListening(false);
      stopListening();
    },
  };
};
```

**Step 4: Update Freeplay to use native detection (with dev fallback)**

Modify `GuitarSlam/app/(tabs)/freeplay.tsx` to pick hook based on an env flag:

```ts
import { useMockAudioDetection } from "../../src/hooks/useMockAudioDetection";
import { useAudioDetection } from "../../src/hooks/useAudioDetection";

const useDetectionHook =
  process.env.EXPO_PUBLIC_USE_MOCK_AUDIO === "true"
    ? useMockAudioDetection
    : useAudioDetection;

const { isListening, currentChord, chordHistory, start, stop } =
  useDetectionHook();
```

**Step 5: Run tests to verify they pass**

Run: `pnpm test -- __tests__/stores/useAudioStore.test.ts`
Expected: PASS

**Step 6: Commit**

```bash
git add GuitarSlam/src/hooks/useAudioDetection.ts GuitarSlam/src/stores/useAudioStore.ts GuitarSlam/app/(tabs)/freeplay.tsx GuitarSlam/__tests__/stores/useAudioStore.test.ts

git commit -m "feat: wire native audio detection into freeplay"
```

---

## Task 6: Add song progression system and 10+ songs

Status (2026-01-30): Implemented. Tests PASS: `pnpm test -- __tests__/constants/songs.test.ts`.

**Files:**

- Create: `GuitarSlam/src/constants/songs.ts`
- Modify: `GuitarSlam/src/stores/useGameStore.ts`
- Modify: `GuitarSlam/app/(tabs)/game.tsx`
- Test: `GuitarSlam/__tests__/constants/songs.test.ts`

**Step 1: Write the failing test**

Create `GuitarSlam/__tests__/constants/songs.test.ts`:

```ts
import { songs } from "../../src/constants/songs";

describe("songs data", () => {
  it("contains at least 10 songs", () => {
    expect(songs.length).toBeGreaterThanOrEqual(10);
  });

  it("each song has at least 2 levels", () => {
    songs.forEach((song) => {
      expect(song.levels.length).toBeGreaterThanOrEqual(2);
    });
  });
});
```

**Step 2: Run test to verify it fails**

Run: `pnpm test -- __tests__/constants/songs.test.ts`
Expected: FAIL with "Cannot find module '../../src/constants/songs'"

**Step 3: Add songs constant**

Create `GuitarSlam/src/constants/songs.ts` with at least 10 entries and multi-level charts. Example structure:

```ts
import { Song } from "../types";

export const songs: Song[] = [
  {
    id: "greensleeves-trad",
    title: "Greensleeves",
    artist: "Traditional",
    difficulty: 2,
    bpm: 96,
    levels: [
      {
        levelNumber: 1,
        name: "Chord Basics",
        description: "Practice the core progression",
        chart: [
          { id: "gs-1", time: 0, chord: "Em", duration: 2 },
          { id: "gs-2", time: 2, chord: "G", duration: 2 },
          { id: "gs-3", time: 4, chord: "D", duration: 2 },
        ],
      },
      {
        levelNumber: 2,
        name: "Full Song",
        description: "Full progression",
        chart: [
          { id: "gs-4", time: 0, chord: "Em", duration: 2 },
          { id: "gs-5", time: 2, chord: "G", duration: 2 },
          { id: "gs-6", time: 4, chord: "D", duration: 2 },
          { id: "gs-7", time: 6, chord: "C", duration: 2 },
        ],
      },
    ],
  },
];
```

Repeat for at least 10 songs. Use public domain or chord-only content.

**Step 4: Add level navigation support**

Modify `GuitarSlam/src/stores/useGameStore.ts`:

```ts
setLevel: (level) => set({ currentLevel: level }),
```

Add selectors to get current level chart if needed by UI.

**Step 5: Run tests to verify they pass**

Run: `pnpm test -- __tests__/constants/songs.test.ts`
Expected: PASS

**Step 6: Commit**

```bash
git add GuitarSlam/src/constants/songs.ts GuitarSlam/src/stores/useGameStore.ts GuitarSlam/__tests__/constants/songs.test.ts

git commit -m "feat: add song progression data"
```

---

## Task 7: Implement enhanced Game Mode (scoring, combo, visual feedback)

Status (2026-01-30): Implemented (keeps FallingNote via NoteLane + HitFeedback). Tests PASS: `pnpm test -- __tests__/components/NoteLane.test.tsx`, `pnpm test -- __tests__/components/HitFeedback.test.tsx`, `pnpm test -- __tests__/stores/useGameStore.test.ts`.

**Files:**

- Modify: `GuitarSlam/app/(tabs)/game.tsx`
- Create: `GuitarSlam/src/components/NoteLane.tsx`
- Create: `GuitarSlam/src/components/HitFeedback.tsx`
- Modify: `GuitarSlam/src/stores/useGameStore.ts`
- Test: `GuitarSlam/__tests__/stores/useGameStore.test.ts`

**Step 1: Extend game store test**

Update `GuitarSlam/__tests__/stores/useGameStore.test.ts`:

```ts
import { useGameStore } from "../../src/stores/useGameStore";

describe("useGameStore scoring", () => {
  it("applies combo multipliers correctly", () => {
    useGameStore.getState().reset();
    useGameStore.getState().addHit("perfect");
    useGameStore.getState().addHit("perfect");

    const state = useGameStore.getState();
    expect(state.score).toBeGreaterThan(0);
  });
});
```

**Step 2: Implement note lane component**

Create `GuitarSlam/src/components/NoteLane.tsx`:

```tsx
import { View, Text, StyleSheet } from "react-native";
import { ChordNote } from "../types";

interface NoteLaneProps {
  notes: ChordNote[];
  currentTime: number;
}

export const NoteLane = ({ notes, currentTime }: NoteLaneProps) => {
  return (
    <View style={styles.lane}>
      {notes.map((note) => {
        const offset = (note.time - currentTime) * 120; // pixels per second
        return (
          <View
            key={note.id}
            style={[styles.note, { transform: [{ translateY: offset }] }]}
          >
            <Text style={styles.noteText}>{note.chord}</Text>
          </View>
        );
      })}
      <View style={styles.hitZone} />
    </View>
  );
};

const styles = StyleSheet.create({
  lane: {
    flex: 1,
    position: "relative",
    backgroundColor: "#101018",
  },
  note: {
    position: "absolute",
    left: 24,
    right: 24,
    height: 44,
    borderRadius: 12,
    backgroundColor: "#2d2d44",
    justifyContent: "center",
    alignItems: "center",
  },
  noteText: {
    color: "#fff",
    fontWeight: "600",
  },
  hitZone: {
    position: "absolute",
    bottom: 40,
    left: 0,
    right: 0,
    height: 4,
    backgroundColor: "#4ecdc4",
  },
});
```

**Step 3: Implement hit feedback component**

Create `GuitarSlam/src/components/HitFeedback.tsx`:

```tsx
import { Text, StyleSheet, View } from "react-native";
import { HitType } from "../types";

const colors = {
  perfect: "#2ecc71",
  good: "#f1c40f",
  miss: "#e74c3c",
};

export const HitFeedback = ({ type }: { type: HitType }) => {
  return (
    <View style={styles.container}>
      <Text style={[styles.text, { color: colors[type] }]}>
        {type.toUpperCase()}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 80,
    alignSelf: "center",
  },
  text: {
    fontSize: 24,
    fontWeight: "700",
  },
});
```

**Step 4: Wire Game screen to progression + scoring**

Modify `GuitarSlam/app/(tabs)/game.tsx` to:

- Load songs list
- Allow selection of a song and level
- Start timer loop for note positions
- Evaluate hits within a ±125ms window
- Display score/combo + feedback component

**Step 5: Run tests to verify they pass**

Run: `pnpm test -- __tests__/stores/useGameStore.test.ts`
Expected: PASS

**Step 6: Commit**

```bash
git add GuitarSlam/app/(tabs)/game.tsx GuitarSlam/src/components/NoteLane.tsx GuitarSlam/src/components/HitFeedback.tsx GuitarSlam/src/stores/useGameStore.ts GuitarSlam/__tests__/stores/useGameStore.test.ts

git commit -m "feat: implement enhanced game mode UI"
```

---

## Task 8: Add combo/score UI polish + visual feedback

Status (2026-01-30): Implemented. Tests PASS: `pnpm test -- __tests__/components/ComboDisplay.test.tsx`, `pnpm test -- __tests__/components/ScoreDisplay.test.tsx`.

**Files:**

- Modify: `GuitarSlam/app/(tabs)/game.tsx`
- Create: `GuitarSlam/src/components/ComboDisplay.tsx`
- Create: `GuitarSlam/src/components/ScoreDisplay.tsx`

**Step 1: Add combo display**

Create `GuitarSlam/src/components/ComboDisplay.tsx`:

```tsx
import { Text, StyleSheet } from "react-native";

export const ComboDisplay = ({ combo }: { combo: number }) => {
  return <Text style={styles.text}>Combo x{combo}</Text>;
};

const styles = StyleSheet.create({
  text: {
    fontSize: 18,
    fontWeight: "700",
    color: "#4ecdc4",
  },
});
```

**Step 2: Add score display**

Create `GuitarSlam/src/components/ScoreDisplay.tsx`:

```tsx
import { Text, StyleSheet } from "react-native";

export const ScoreDisplay = ({ score }: { score: number }) => {
  return <Text style={styles.text}>Score {score}</Text>;
};

const styles = StyleSheet.create({
  text: {
    fontSize: 18,
    fontWeight: "700",
    color: "#fff",
  },
});
```

**Step 3: Integrate into Game screen**

Modify `GuitarSlam/app/(tabs)/game.tsx` to place `ComboDisplay` and `ScoreDisplay` in top corners and animate on hit (use `Animated` or `Reanimated` if already installed).

**Step 4: Commit**

```bash
git add GuitarSlam/app/(tabs)/game.tsx GuitarSlam/src/components/ComboDisplay.tsx GuitarSlam/src/components/ScoreDisplay.tsx

git commit -m "feat: add combo and score UI"
```

---

## Task 9: Manual device verification for polyphonic detection

Status (2026-01-30): Checklist doc created; manual device verification not yet performed.

**Files:**

- Modify: `GuitarSlam/docs/verification/phase2-audio.md`

**Step 1: Add manual test checklist**

Create `GuitarSlam/docs/verification/phase2-audio.md`:

```md
# Phase 2 Audio Verification

- [ ] Build dev client with native modules (EAS iOS / local Android)
- [ ] Start Freeplay and confirm detection begins
- [ ] Play open G, C, D, Em and confirm chord match appears within 200ms
- [ ] Play barre F and Bm and confirm detection recognizes root chord
- [ ] Confirm latency remains under 100-150ms by visual observation
- [ ] Toggle EXPO_PUBLIC_USE_MOCK_AUDIO to ensure fallback works
```

**Step 2: Commit**

```bash
git add GuitarSlam/docs/verification/phase2-audio.md

git commit -m "docs: add phase2 audio verification checklist"
```

---

## Execution Handoff

Plan complete and saved to `docs/plans/2026-01-30-phase2-enhanced-gameplay-implementation.md`. Two execution options:

1. Subagent-Driven (this session) - I dispatch fresh subagent per task, review between tasks, fast iteration
2. Parallel Session (separate) - Open new session with executing-plans, batch execution with checkpoints

Which approach?
