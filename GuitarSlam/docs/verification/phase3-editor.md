# Phase 3 Editor Verification Checklist

## Song Creation Flow

- [ ] Navigate to My Songs from home screen
- [ ] Tap "Create New Song" button
- [ ] Enter song metadata (title, artist, BPM, difficulty)
- [ ] Verify BPM controls work (+/- buttons)
- [ ] Verify difficulty selector updates correctly

## Timeline Editing

- [ ] Select a chord from the palette
- [ ] Tap on timeline to place chord
- [ ] Verify chord snaps to grid when snap is enabled
- [ ] Toggle snap off and verify free placement works
- [ ] Adjust zoom and verify timeline scales correctly
- [ ] Verify beat/measure markers display correctly

## Note Manipulation

- [ ] Tap note to select it (border highlights)
- [ ] Long-press note to see delete option
- [ ] Delete a note and verify it removes
- [ ] Verify notes sort by time automatically

## Undo/Redo

- [ ] Add several notes
- [ ] Tap Undo - verify last note removed
- [ ] Tap Redo - verify note restored
- [ ] Chain multiple undos/redos
- [ ] Verify undo/redo buttons disable when stack is empty

## Save & Load

- [ ] Save a song with notes
- [ ] Navigate back to My Songs
- [ ] Verify song appears in list with correct metadata
- [ ] Tap song to edit - verify notes load correctly
- [ ] Make changes and save again
- [ ] Verify updatedAt timestamp changes

## Preview Mode

- [ ] Tap Preview with notes in song
- [ ] Verify falling notes display
- [ ] Verify Play/Stop controls work
- [ ] Verify notes fall at correct BPM
- [ ] Tap "Back to Editor" to return

## Song Library

- [ ] View list of user-created songs
- [ ] Pull to refresh
- [ ] Long-press song to see delete option
- [ ] Delete a song and verify it removes from list
- [ ] Verify empty state shows when no songs

## Edge Cases

- [ ] Try saving with no notes (should show alert)
- [ ] Try preview with no notes (should show alert)
- [ ] Navigate away with unsaved changes (should prompt)
- [ ] Verify search works in chord palette
