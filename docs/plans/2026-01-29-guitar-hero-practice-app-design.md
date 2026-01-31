# Real Guitar Hero - Practice App Design

**Date:** 2026-01-29
**Status:** Design Complete, Ready for Implementation

---

## Overview

A cross-platform iOS/Android mobile app that combines real-time guitar chord recognition with Guitar Hero-style gameplay. Users can practice chords in freeplay mode, learn songs through progressive difficulty levels, and create custom practice sequences.

### Core Features

1. **Freeplay Mode** - Real-time chord recognition with visual feedback
2. **Game Mode** - Guitar Hero-style rhythm game with falling chord notes
3. **Chord Reference** - Searchable library of 100+ chord diagrams
4. **Custom Song Editor** - Visual timeline for creating practice sequences
5. **Optional Cloud Sync** - Guest mode with optional account creation

---

## Technology Stack

- **Framework:** React Native with Expo (SDK 52+)
- **Navigation:** Expo Router
- **Build System:** EAS Build (for iOS builds from Windows)
- **Native Audio:** Expo Dev Client with custom native modules
- **State Management:** Zustand or Context API
- **Animations:** React Native Reanimated
- **Local Storage:** AsyncStorage
- **Cloud Sync:** Firebase or Supabase (optional accounts)
- **Development Environment:** Windows laptop + iPhone for testing

---

## 1. High-Level Architecture

### App Structure

Four main sections accessible via tab navigation:

1. **Home/Dashboard**
   - Quick access to all modes
   - Recent songs and progress summary
   - Daily practice streaks

2. **Game Mode**
   - Song selection with difficulty ratings
   - Guitar Hero-style gameplay
   - Score tracking and progress

3. **Freeplay Mode**
   - Real-time chord detection practice
   - No scoring, pure feedback

4. **Library**
   - Chord reference database
   - Song library (pre-bundled + custom)
   - Custom song editor

### Development Workflow (Windows + iPhone)

**Initial Setup:**

```bash
npx create-expo-app@latest GuitarSlam --template blank-typescript
cd GuitarSlam
npx expo install expo-router expo-dev-client
eas build:configure
```

**Creating iOS Development Build:**

```bash
eas build --profile development --platform ios
```

- EAS builds in cloud, provides download link/QR code
- Install directly on iPhone via link
- Not via TestFlight (that's for production/beta)

**Day-to-Day Development:**

```bash
npx expo start --dev-client
```

- iPhone connects via same WiFi network
- Scan QR code with Expo Dev Client app
- Live reload for JavaScript changes
- Rebuild via EAS when native modules change

---

## 2. Audio Processing Pipeline

### Technical Approach: Polyphonic Pitch Detection

**iOS Implementation:**

- Use AudioKit for low-latency audio capture (AVAudioEngine)
- **Constant-Q Transform (CQT)** for polyphonic analysis
  - Logarithmic frequency spacing matches musical pitch
  - Better low-frequency resolution for guitar (82-659Hz)
  - 12 bins per octave covering E2-E5
- Alternative: Spectral peak extraction + harmonic grouping
  - Extract FFT peaks
  - Group harmonics by f, 2f, 3f, 4f relationships
  - Determine fundamentals from harmonic series patterns

**Android Implementation:**

- TarsosDSP library
- MPM (McLeod Pitch Method) or YIN with multiple candidate extraction
- Harmonic product spectrum (HPS) for polyphonic separation

**Processing Pipeline:**

1. **Capture** - 44.1kHz sample rate, 4096 sample buffer (~93ms latency)
2. **CQT Analysis** - 12 bins/octave, E2-E5 range + harmonics
3. **Salience Mapping** - Identify perceptually prominent pitches via harmonic summation
4. **Note Extraction** - Extract 2-6 simultaneous notes with confidence scores
5. **Chord Matching** - Fuzzy match note combinations to chord database
6. **Temporal Smoothing** - Median filter over 3-5 frames to reduce flutter
7. **Bridge to JavaScript** - Send results every ~100ms

**Forgiving Detection:**

- Recognizes chords regardless of voicing (open, barre, partial)
- Example: G major detected from [G3, B3, D4] or [G2, B2, D3, G3]
- Ignores muted strings and missing notes
- Confidence threshold filters false positives

**Native Module Structure:**

```
modules/
├── audio-detection/
│   ├── ios/
│   │   └── AudioDetectionModule.swift
│   └── android/
│       └── AudioDetectionModule.kt
```

---

## 3. Game Mode Implementation

### Falling Notes System

**Visual Design:**

- Notes spawn at top, fall vertically at constant speed (calibrated to BPM)
- Each note displays chord name (e.g., "Gmaj", "Em7")
- Color-coded status:
  - Gray: Approaching
  - Green: In hit zone
  - Red: Missed
- **Future:** Strumming arrows (↓↑) on notes for advanced levels

### Hit Zone & Detection

- **Fixed hit zone** - Bar at bottom 20% of screen
- **250ms timing window** - ±125ms from center of hit zone
- **Fuzzy chord matching** - Forgiving detection algorithm
- **Hit types:**
  - Perfect: Within 100ms (100 points)
  - Good: 100-250ms (50 points)
  - Miss: Wrong chord or too late (0 points, reset combo)

### Visual Feedback

**On Hit:**

- **Text popup** - "Perfect!" (green), "Good!" (yellow) fades upward from hit zone
- **Ring effect** - Colored ring expands from hit zone
  - Perfect: Bright green, quick expansion
  - Good: Yellow, medium expansion
- **Note highlight** - Successfully hit notes flash and shrink
- **Combo milestones** - Burst effect at 10x, 20x, 50x combos

**UI Elements:**

- **Combo counter** - Large, animated display in top-right (pulses on each hit)
- **Score display** - Running total in top-left
- **Side panel** - Static chord diagram for next upcoming chord

### Scoring System

```
Base Points:
- Perfect = 100
- Good = 50
- Miss = 0

Combo Multiplier:
- 1x: 0-9 combo
- 2x: 10-19 combo
- 3x: 20-49 combo
- 4x: 50+ combo

Final Score = Σ(base_points × combo_multiplier)
```

### Audio Feedback (Toggleable)

- **Audience cheering** on each hit
  - Volume increases with combo:
    - 1x: Quiet applause
    - 2x: Medium cheering
    - 3x: Loud cheering
    - 4x: Roaring crowd
- **Crowd disappointment** sound on miss
- **Combo milestone** - Special cheer on 10x, 20x, 50x
- Toggle on/off in settings

### Song Progression System

Each song has multiple levels that progressively teach the full song:

**Level 1: Chord Basics**

- Just play the right chords at the right time
- No rhythm complexity
- Focus on chord shapes and transitions

**Level 2+: Progressive Complexity**

- Add isolated sections (intro, verse, chorus)
- Introduce rhythm elements
- **Future:** Add strumming patterns with arrows

**Final Level: Full Song**

- Play complete song from start to finish
- All sections and patterns included

**Song Difficulty Rating (1-5):**

- 1: Simple open chords (G, C, D, Em)
- 2: Adds Am, E, Dm
- 3: Introduces barre chords (F, Bm)
- 4: Complex voicings (7ths, sus, add9)
- 5: Jazz chords, rapid changes, unconventional shapes

---

## 4. Song Data Format

### JSON Structure

```json
{
  "id": "wonderwall-oasis",
  "title": "Wonderwall",
  "artist": "Oasis",
  "difficulty": 3,
  "bpm": 87,
  "audioUrl": "songs/wonderwall.mp3",
  "levels": [
    {
      "levelNumber": 1,
      "name": "Chord Basics",
      "description": "Learn the chord progression",
      "chart": [
        { "time": 0.0, "chord": "Em7", "duration": 2.0 },
        { "time": 2.0, "chord": "G", "duration": 2.0 },
        { "time": 4.0, "chord": "Dsus4", "duration": 2.0 },
        { "time": 6.0, "chord": "A7sus4", "duration": 2.0 }
      ]
    },
    {
      "levelNumber": 2,
      "name": "Verse Section",
      "description": "Focus on the verse",
      "chart": [
        // Specific section with more detail
      ]
    },
    {
      "levelNumber": 3,
      "name": "Full Song",
      "description": "Play it all together",
      "chart": [
        // Complete song chart
      ]
    }
  ]
}
```

### Storage Strategy

**Pre-bundled Songs:**

- Stored in `assets/songs/` directory
- Shipped with app
- Curated collection of popular songs

**User-Created Songs:**

- Saved to AsyncStorage as JSON
- Keyed by unique song ID (UUID)
- Synced to cloud if user has account

**Chord Diagrams:**

- Separate JSON database
- 100+ common chord fingerings
- Structure:
  ```json
  {
    "chordName": "Gmaj",
    "alternateNames": ["G", "GM"],
    "notes": ["G", "B", "D"],
    "diagram": {
      "strings": [3, 2, 0, 0, 0, 3],
      "fingers": [2, 1, 0, 0, 0, 3],
      "fret": 0
    }
  }
  ```

---

## 5. Custom Song Editor

### Visual Timeline Interface

**Layout:**

- **Top:** Playhead scrubber (drag to navigate)
- **Middle:** Timeline grid with beat markers (4/4 time)
- **Bottom:** Chord palette (swipeable, searchable)

### Navigation Gestures

- **One-finger horizontal drag** - Primary pan method (scroll timeline)
- **Pinch** - Zoom in/out only (dedicated gesture)
- **Two-finger drag** - Alternative pan (not primary, reduces accidental zoom)

### Chord Placement Interaction

**Ghost Chord Preview (iOS-style):**

1. **Tap empty space** → Ghost chord appears, snapped to grid
2. **Slide finger left/right** → Ghost follows, snapping to beat positions
3. **Release** → Chord is placed
4. **Tap Cancel** → Dismiss without placing

Mimics iOS time pickers and DAW clip placement - familiar and precise.

### Chord Block Editing

**Interaction:**

- **Tap existing chord** → Edit or delete options modal
- **Long-press** → Enter drag mode, reposition with ghost preview
- **Resize handles** → Drag edges to adjust duration
  - Invisible hit area extended 20px beyond visual handles
  - Visual feedback (glow/scale) when finger is near

**Chord Block Display:**

- Chord name (large text)
- Duration (visual width proportional to beats)
- Resize handles on left/right edges

### Editor Features

**Core Tools:**

- **Undo/Redo** - Top toolbar buttons
  - Keyboard shortcuts: Ctrl+Z / Ctrl+Shift+Z
  - Tracks: placement, deletion, repositioning, duration, BPM
  - Maintains last 50 actions
  - Visual indicator for undo history position
  - Cleared on save
- **Snap-to-grid toggle** - On by default
- **BPM adjuster** - Slider to set song tempo
- **Metronome playback** - Hear beat while editing
- **Preview mode** - Test with falling notes before saving

**Metadata Fields:**

- Song title
- Artist name
- Difficulty rating (1-5)
- Description/notes

### Song Creation Flow

1. Tap "Create Song" from library
2. Enter metadata (title, artist, BPM, difficulty)
3. Place chords on timeline using ghost preview
4. Adjust durations with resize handles
5. Preview with falling notes
6. Save to library (local or cloud sync)

---

## 6. Freeplay Mode

### Real-Time Chord Display

Simple, distraction-free interface for exploring and practicing.

**Layout:**

**Center:**

- **Large chord name display** - Currently detected chord in bold text
  - Updates in real-time as user strums
  - Fades to gray after 500ms of no detection
  - Color-coded confidence:
    - Green: High confidence (>80%)
    - Yellow: Medium confidence (50-80%)
    - Gray: Low/no detection (<50%)

**Top-Right:**

- **Chord diagram** - Finger positions for current chord
  - Updates smoothly on chord change
  - Includes finger numbers (1-4) and fret positions
  - Shows X (muted) and O (open) strings

**Bottom:**

- **Individual note indicators** - Six circles for strings (E A D G B E)
  - Light up when each string's note is detected
  - Shows which strings contribute to detected chord
  - Helps diagnose muted or unclear notes

**Bottom Strip:**

- **Chord history timeline** - Last 8 chords played (scrollable)
  - Helps visualize practice progression
  - Tap to see diagram for past chord

### Features

- **Confidence meter** - Small visual bar showing detection strength
- **Detection sensitivity slider** - Adjust threshold for chord recognition
- **Tuning reference toggle** - Show standard tuning notes per string

### Use Cases

- Practice chord transitions slowly
- Verify you're playing chords correctly
- Explore new chord shapes and discover names
- Warm-up before game mode
- **No scoring, no pressure** - just immediate feedback

---

## 7. Chord Reference Library

### Chord Lookup Interface

Searchable database of 100+ common guitar chords.

**Search & Browse:**

- **Search bar** - Type chord name (fuzzy matching: "Gmaj", "Am7", "Dsus4")
- **Filter by type** - Tabs for:
  - Major, Minor, 7th, Sus, Augmented, Diminished, Extended
- **Filter by difficulty** - Badges:
  - Beginner (open chords)
  - Intermediate (barre chords)
  - Advanced (jazz voicings)
- **Favorites** - Star commonly used chords for quick access

### Chord Detail View

**Display Elements:**

- **Large chord diagram** - Clear fretboard visualization
  - Dots show finger positions with numbers (1=index, 2=middle, 3=ring, 4=pinky)
  - X = muted string, O = open string
  - Fret numbers on left side
- **Chord name & alternates** - Primary name + aliases
  - Example: "Cmaj7" aka "CM7", "CΔ7"
- **Notes in chord** - Lists constituent notes
  - Example: "C E G B"
- **Alternative voicings** - Expandable section
  - 2-3 other ways to play same chord
  - Useful for different positions on neck

### Interaction Features

- **Tap chord from list** → Full-screen detail view
- **Play button** → Hear synthesized chord sound
- **Test yourself button** → Hide diagram, play chord, see if detection matches
- **Add to favorites** → Star icon in top-right

### Chord Database Content

**Essential Chords (100+):**

- All major chords (12)
- All minor chords (12)
- 7th chords (major7, minor7, dominant7)
- Sus chords (sus2, sus4)
- Extended chords (add9, 6, 9, 11, 13)
- Power chords
- Common jazz voicings
- Diminished and augmented

**Data Structure:**

```json
{
  "id": "Gmaj",
  "primaryName": "G",
  "alternateNames": ["Gmaj", "GM"],
  "type": "major",
  "difficulty": "beginner",
  "notes": ["G", "B", "D"],
  "diagram": {
    "strings": [3, 2, 0, 0, 0, 3],
    "fingers": [2, 1, 0, 0, 0, 3],
    "baseFret": 0,
    "mutedStrings": [],
    "openStrings": [2, 3, 4]
  },
  "alternateVoicings": [
    { "diagram": {...}, "position": "barre" }
  ]
}
```

---

## 8. User Accounts & Data Sync

### Guest Mode (Default)

**No login required:**

- App opens immediately to dashboard
- All data stored locally via AsyncStorage:
  - Custom songs (JSON)
  - Game progress (scores per song/level)
  - Settings and preferences
  - Practice history and streaks
  - Favorites
- Banner in settings: "Sign up to sync your progress across devices"

### Optional Account Creation

**Triggers:**

- Manual: Tap "Sign Up" in settings
- Soft prompts:
  - After creating first custom song
  - After achieving personal best score
  - After 7-day practice streak
- Never intrusive or blocking

**Authentication Methods:**

- Email/password
- Social auth: Google Sign-In, Apple Sign-In
- **Seamless migration** - All local data automatically uploaded on account creation

### Cloud Sync (Firebase/Supabase)

**What Syncs:**

- Custom songs (full JSON)
- Game progress per song (best scores, stars, completion %)
- Favorite/starred chords
- App settings and preferences
- Practice streaks and statistics

**What Stays Local:**

- Real-time audio processing (never recorded)
- Temporary cache
- Session data

**Sync Strategy:**

- **On app open** - Pull latest data from cloud (if connected)
- **On change** - Push updates in background (debounced 5s)
- **Conflict resolution:**
  - Settings: Last-write-wins
  - Songs: Merge strategy (keep both if different, show conflict UI)
  - Scores: Keep highest

### Account Management

**Profile Screen:**

- Email address
- Display name (editable)
- Account created date
- Storage used (for custom songs)

**Data Control:**

- **Export all data** - Download JSON file
- **Delete account** - Option to preserve local data
- **Log out** - Keep local data, stop syncing

### Privacy & Security

- **No audio recorded or uploaded** - Only chord detection results
- **Anonymous usage analytics** - Opt-in only
  - Tracks: app opens, mode usage, song completions
  - Never tracks: personal info, audio, specific songs played
- Clear data policy link in settings
- GDPR compliant (if shipping in EU)

---

## 9. Development Workflow

### Initial Project Setup

**1. Install Tools on Windows:**

```bash
# Node.js LTS from nodejs.org
# Git from git-scm.com
npm install -g eas-cli
```

**2. Create Expo App:**

```bash
npx create-expo-app@latest GuitarSlam --template blank-typescript
cd GuitarSlam
npx expo install expo-router expo-dev-client
```

**3. Configure EAS:**

```bash
eas login
eas build:configure
```

Creates `eas.json`:

```json
{
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal"
    },
    "preview": {
      "distribution": "internal"
    },
    "production": {}
  }
}
```

### Building for iOS (from Windows)

**Create Development Build:**

```bash
eas build --profile development --platform ios
```

- EAS builds in cloud (no Mac required)
- Provides download link and QR code
- **Install on iPhone:**
  - Open link on iPhone via Safari
  - Or scan QR code with camera app
  - Installs directly (not via TestFlight)

**When to Rebuild:**

- When adding/updating native modules
- When changing app config (`app.json`)
- When updating native dependencies

### Day-to-Day Development

**Start Metro Bundler:**

```bash
npx expo start --dev-client
```

**Connect iPhone:**

- Ensure iPhone and Windows laptop on same WiFi network
- Open installed Expo Dev Client app on iPhone
- Scan QR code from terminal
- App loads with live reload enabled

**Development Loop:**

1. Edit JavaScript/TypeScript code
2. Save file
3. App reloads automatically on iPhone
4. No rebuild needed for JS-only changes

### Native Module Development

**Project Structure:**

```
GuitarSlam/
├── modules/
│   └── audio-detection/
│       ├── ios/
│       │   ├── AudioDetectionModule.swift
│       │   └── AudioDetectionModule.h
│       ├── android/
│       │   └── AudioDetectionModule.kt
│       └── index.ts
├── app/
├── assets/
└── package.json
```

**iOS Audio Module (Swift):**

- Use Expo Modules API
- Implement CQT-based pitch detection
- Use AudioKit or Accelerate framework
- Export functions to JavaScript:
  ```swift
  @objc func startListening() { ... }
  @objc func stopListening() { ... }
  ```

**Android Audio Module (Kotlin):**

- Use Expo Modules API
- Integrate TarsosDSP library
- Implement polyphonic detection
- Export to JavaScript bridge

**Testing Native Modules:**

- iOS: Must build via EAS and install on iPhone
- Android: Can build locally on Windows
  ```bash
  npx expo run:android
  ```

### Testing Strategy

**Unit Tests (Jest):**

- Chord matching algorithms
- Song data parsing
- Scoring logic

**Component Tests (React Native Testing Library):**

- UI components
- Navigation flows
- User interactions

**Audio Processing Tests:**

- Requires physical device (iPhone) and real guitar
- Test detection accuracy across chord types
- Measure latency and performance

**Cross-Platform Testing:**

- Primary: iPhone (daily development)
- Periodic: Android emulator on Windows
- Pre-release: Test on multiple Android devices

### Deployment

**Internal Testing:**

- Use EAS Build preview profile
- Distribute via direct links

**Production:**

```bash
eas build --profile production --platform ios
eas submit --platform ios
```

- Creates production build
- Submits to App Store Connect
- Repeat for Android (Google Play)

---

## Implementation Priorities

### Phase 1: MVP (Core Functionality)

1. Basic audio capture and monophonic pitch detection
2. Freeplay mode with real-time chord display
3. Chord reference library (50 basic chords)
4. Simple game mode with 3 pre-bundled songs

### Phase 2: Enhanced Gameplay

1. Full polyphonic CQT-based detection
2. Complete chord database (100+ chords)
3. Scoring, combo system, visual feedback
4. Song progression system (multi-level)
5. 10+ pre-bundled songs with difficulty ratings

### Phase 3: Content Creation

1. Custom song editor with visual timeline
2. User-created song library
3. Song preview and testing

### Phase 4: Cloud & Social

1. Optional user accounts
2. Cloud sync for custom songs and progress
3. Guest mode with seamless migration

### Phase 5: Advanced Features

1. Strumming pattern detection and display
2. Advanced practice modes (section looping, slow-mo)
3. Achievements and streaks
4. Community song sharing

---

## Technical Risks & Mitigations

### Risk 1: Audio Processing Accuracy

**Challenge:** Real-time polyphonic guitar detection is complex
**Mitigation:**

- Start with monophonic detection for MVP
- Implement CQT gradually
- Allow user to adjust sensitivity
- Focus on common chords first

### Risk 2: Latency

**Challenge:** Audio processing + UI updates must be <100ms
**Mitigation:**

- Native module processing (not JavaScript)
- Optimize buffer sizes (4096 samples)
- Test on target devices early
- Profile and optimize hot paths

### Risk 3: EAS Build Costs

**Challenge:** iOS builds via EAS cost build minutes
**Mitigation:**

- Use development builds sparingly
- Batch native module changes
- Consider paid EAS plan if needed
- Android testing on local emulator (free)

### Risk 4: Song Licensing

**Challenge:** Using copyrighted songs requires licenses
**Mitigation:**

- Phase 1: Use public domain songs
- Provide chord-only data (no audio)
- Let users supply their own backing tracks
- Explore licensing options for Phase 5

---

## Success Metrics

**Engagement:**

- Daily active users
- Average session length
- Songs completed per week

**Learning Effectiveness:**

- Chord accuracy improvement over time
- Song progression completion rates
- Freeplay mode usage

**Retention:**

- Day 1, Day 7, Day 30 retention rates
- Practice streaks (consecutive days)

**Content Creation:**

- Custom songs created per user
- Sharing/download rates (Phase 5)

---

## Future Enhancements

- **Strumming patterns** with arrows and rhythm detection
- **Tablature display** alongside chord names
- **Section looping** in game mode for practice
- **Slow-mo mode** to practice difficult sections
- **Multi-guitar support** for ensemble practice
- **Video lessons** integrated with chord library
- **Community features** - Share custom songs, leaderboards
- **Other instruments** - Bass, ukulele detection

---

## Conclusion

This design provides a comprehensive roadmap for building Real Guitar Hero - a mobile app that makes guitar practice engaging through gamification, real-time feedback, and progressive learning. By starting with core features (freeplay, game mode, chord reference) and iterating based on user feedback, the app can grow into a powerful tool for guitarists of all skill levels.

The technical foundation (React Native + Expo + native audio processing) balances development speed with the performance requirements for real-time audio analysis. The Windows + iPhone development workflow is fully supported through EAS Build.

Ready to move forward with implementation planning.
