import React, { useState, useCallback } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";
import { useEditorStore } from "../../src/stores/useEditorStore";
import { saveUserSong } from "../../src/services/songStorage";
import { EditorToolbar } from "../../src/components/editor/EditorToolbar";
import { SongMetadataForm } from "../../src/components/editor/SongMetadataForm";
import { TimelineGrid } from "../../src/components/editor/TimelineGrid";
import { ChordNoteBlock } from "../../src/components/editor/ChordNoteBlock";
import { ChordPalette } from "../../src/components/editor/ChordPalette";
import { colors } from "../../src/constants/theme";

const DEFAULT_DURATION = 60; // 60 seconds default timeline

export default function CreateSongScreen() {
  const router = useRouter();
  const [selectedChord, setSelectedChord] = useState<string | null>("G");

  const {
    song,
    selectedNoteId,
    currentTime,
    zoom,
    snapToGrid,
    undoStack,
    redoStack,
    isDirty,
    createNewSong,
    updateSongMetadata,
    addNote,
    deleteNote,
    selectNote,
    setZoom,
    setSnapToGrid,
    undo,
    redo,
    markClean,
  } = useEditorStore();

  // Initialize song if not exists
  React.useEffect(() => {
    if (!song) {
      createNewSong("Untitled Song", "Unknown Artist", 120);
    }
  }, [song, createNewSong]);

  const handleTimelinePress = useCallback(
    (time: number) => {
      if (selectedChord && song) {
        addNote(selectedChord, time, 2); // Default 2 second duration
      }
    },
    [selectedChord, song, addNote],
  );

  const handleNotePress = useCallback(
    (noteId: string) => {
      selectNote(noteId === selectedNoteId ? null : noteId);
    },
    [selectedNoteId, selectNote],
  );

  const handleNoteLongPress = useCallback(
    (noteId: string) => {
      Alert.alert("Note Options", "What would you like to do?", [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => deleteNote(noteId),
        },
      ]);
    },
    [deleteNote],
  );

  const handleSave = useCallback(async () => {
    if (!song) return;

    if (song.levels[0].chart.length === 0) {
      Alert.alert("Cannot Save", "Please add at least one chord to your song.");
      return;
    }

    try {
      await saveUserSong(song);
      markClean();
      Alert.alert("Saved", "Your song has been saved!", [
        { text: "OK", onPress: () => router.back() },
      ]);
    } catch (error) {
      Alert.alert("Error", "Failed to save song. Please try again.");
    }
  }, [song, markClean, router]);

  const handlePreview = useCallback(() => {
    if (!song) return;

    if (song.levels[0].chart.length === 0) {
      Alert.alert(
        "Cannot Preview",
        "Please add at least one chord to your song.",
      );
      return;
    }

    router.push(`/editor/${song.id}/preview`);
  }, [song, router]);

  if (!song) return null;

  const pixelsPerSecond = 60 * zoom;

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        {/* Toolbar */}
        <EditorToolbar
          canUndo={undoStack.length > 0}
          canRedo={redoStack.length > 0}
          snapToGrid={snapToGrid}
          zoom={zoom}
          onUndo={undo}
          onRedo={redo}
          onToggleSnap={() => setSnapToGrid(!snapToGrid)}
          onZoomIn={() => setZoom(Math.min(4, zoom + 0.25))}
          onZoomOut={() => setZoom(Math.max(0.5, zoom - 0.25))}
          onPreview={handlePreview}
          onSave={handleSave}
        />

        {/* Metadata Form */}
        <SongMetadataForm
          title={song.title}
          artist={song.artist}
          bpm={song.bpm}
          difficulty={song.difficulty}
          onTitleChange={(title) => updateSongMetadata({ title })}
          onArtistChange={(artist) => updateSongMetadata({ artist })}
          onBpmChange={(bpm) => updateSongMetadata({ bpm })}
          onDifficultyChange={(difficulty) =>
            updateSongMetadata({ difficulty })
          }
        />

        {/* Timeline */}
        <View style={styles.timelineContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.timelineContent}>
              <TimelineGrid
                bpm={song.bpm}
                duration={DEFAULT_DURATION}
                zoom={zoom}
                currentTime={currentTime}
                onTimePress={handleTimelinePress}
                width={DEFAULT_DURATION * pixelsPerSecond}
              />

              {/* Chord notes overlay */}
              {song.levels[0].chart.map((note) => (
                <ChordNoteBlock
                  key={note.id}
                  note={note}
                  pixelsPerSecond={pixelsPerSecond}
                  isSelected={note.id === selectedNoteId}
                  onPress={handleNotePress}
                  onLongPress={handleNoteLongPress}
                />
              ))}
            </View>
          </ScrollView>
        </View>

        {/* Chord Palette */}
        <ChordPalette
          selectedChord={selectedChord}
          onSelectChord={setSelectedChord}
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  flex: {
    flex: 1,
  },
  timelineContainer: {
    flex: 1,
    backgroundColor: colors.backgroundLight,
  },
  timelineContent: {
    position: "relative",
    minHeight: 300,
  },
});
