import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Text,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useEditorStore } from "../../../src/stores/useEditorStore";
import { getUserSong, saveUserSong } from "../../../src/services/songStorage";
import { EditorToolbar } from "../../../src/components/editor/EditorToolbar";
import { SongMetadataForm } from "../../../src/components/editor/SongMetadataForm";
import { TimelineGrid } from "../../../src/components/editor/TimelineGrid";
import { ChordNoteBlock } from "../../../src/components/editor/ChordNoteBlock";
import { ChordPalette } from "../../../src/components/editor/ChordPalette";
import { colors, fontSize } from "../../../src/constants/theme";

const DEFAULT_DURATION = 60;

export default function EditSongScreen() {
  const router = useRouter();
  const { songId } = useLocalSearchParams<{ songId: string }>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedChord, setSelectedChord] = useState<string | null>("G");

  const {
    song,
    selectedNoteId,
    currentTime,
    zoom,
    snapToGrid,
    undoStack,
    redoStack,
    loadSong,
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

  // Load existing song
  useEffect(() => {
    const load = async () => {
      if (!songId) {
        setError("No song ID provided");
        setLoading(false);
        return;
      }

      try {
        const existingSong = await getUserSong(songId);
        if (!existingSong) {
          setError("Song not found");
          setLoading(false);
          return;
        }

        loadSong(existingSong);
        setLoading(false);
      } catch (err) {
        setError("Failed to load song");
        setLoading(false);
      }
    };

    load();
  }, [songId, loadSong]);

  const handleTimelinePress = useCallback(
    (time: number) => {
      if (selectedChord && song) {
        addNote(selectedChord, time, 2);
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

    try {
      await saveUserSong(song);
      markClean();
      Alert.alert("Saved", "Your changes have been saved!");
    } catch (err) {
      Alert.alert("Error", "Failed to save song. Please try again.");
    }
  }, [song, markClean]);

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

  if (loading) {
    return (
      <SafeAreaView style={styles.centerContainer}>
        <ActivityIndicator testID="loading-indicator" size="large" color={colors.primary} />
      </SafeAreaView>
    );
  }

  if (error || !song) {
    return (
      <SafeAreaView style={styles.centerContainer}>
        <Text testID="error-text" style={styles.errorText}>{error || "Song not found"}</Text>
      </SafeAreaView>
    );
  }

  const pixelsPerSecond = 60 * zoom;

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
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
  centerContainer: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: "center",
    alignItems: "center",
  },
  errorText: {
    color: colors.accent,
    fontSize: fontSize.lg,
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
