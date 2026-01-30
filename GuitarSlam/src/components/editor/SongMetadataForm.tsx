import React from "react";
import { View, Text, StyleSheet, TextInput, Pressable } from "react-native";
import { colors, spacing, fontSize, borderRadius } from "../../constants/theme";

interface SongMetadataFormProps {
  title: string;
  artist: string;
  bpm: number;
  difficulty: 1 | 2 | 3 | 4 | 5;
  onTitleChange: (title: string) => void;
  onArtistChange: (artist: string) => void;
  onBpmChange: (bpm: number) => void;
  onDifficultyChange: (difficulty: 1 | 2 | 3 | 4 | 5) => void;
}

const DIFFICULTY_LABELS = ["Easy", "Medium", "Hard", "Expert", "Master"];

export const SongMetadataForm: React.FC<SongMetadataFormProps> = ({
  title,
  artist,
  bpm,
  difficulty,
  onTitleChange,
  onArtistChange,
  onBpmChange,
  onDifficultyChange,
}) => {
  const handleBpmDecrease = () => {
    const newBpm = Math.max(40, bpm - 5);
    onBpmChange(newBpm);
  };

  const handleBpmIncrease = () => {
    const newBpm = Math.min(240, bpm + 5);
    onBpmChange(newBpm);
  };

  return (
    <View style={styles.container}>
      {/* Title Input */}
      <View style={styles.inputRow}>
        <Text style={styles.label}>Title</Text>
        <TextInput
          style={styles.textInput}
          value={title}
          onChangeText={onTitleChange}
          placeholder="Song title"
          placeholderTextColor={colors.textMuted}
        />
      </View>

      {/* Artist Input */}
      <View style={styles.inputRow}>
        <Text style={styles.label}>Artist</Text>
        <TextInput
          style={styles.textInput}
          value={artist}
          onChangeText={onArtistChange}
          placeholder="Artist name"
          placeholderTextColor={colors.textMuted}
        />
      </View>

      {/* BPM Control */}
      <View style={styles.inputRow}>
        <Text style={styles.label}>BPM</Text>
        <View style={styles.bpmControl}>
          <Pressable
            testID="bpm-decrease"
            style={styles.bpmButton}
            onPress={handleBpmDecrease}
          >
            <Text style={styles.bpmButtonText}>-</Text>
          </Pressable>
          <Text style={styles.bpmValue}>{bpm}</Text>
          <Pressable
            testID="bpm-increase"
            style={styles.bpmButton}
            onPress={handleBpmIncrease}
          >
            <Text style={styles.bpmButtonText}>+</Text>
          </Pressable>
        </View>
      </View>

      {/* Difficulty Selector */}
      <View style={styles.inputRow}>
        <Text style={styles.label}>Difficulty</Text>
        <View testID="difficulty-selector" style={styles.difficultyContainer}>
          {([1, 2, 3, 4, 5] as const).map((level) => (
            <Pressable
              key={level}
              testID={`difficulty-${level}`}
              style={[
                styles.difficultyButton,
                difficulty === level && styles.difficultyButtonActive,
              ]}
              onPress={() => onDifficultyChange(level)}
            >
              <Text
                style={[
                  styles.difficultyText,
                  difficulty === level && styles.difficultyTextActive,
                ]}
              >
                {level}
              </Text>
              <Text style={styles.difficultyLabel}>
                {DIFFICULTY_LABELS[level - 1]}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: spacing.md,
    backgroundColor: colors.backgroundLight,
    borderRadius: borderRadius.lg,
    gap: spacing.md,
  },
  inputRow: {
    gap: spacing.xs,
  },
  label: {
    color: colors.textSecondary,
    fontSize: fontSize.sm,
    fontWeight: "600",
  },
  textInput: {
    backgroundColor: colors.backgroundDark,
    color: colors.text,
    fontSize: fontSize.md,
    padding: spacing.sm,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.textMuted,
  },
  bpmControl: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  bpmButton: {
    width: 40,
    height: 40,
    backgroundColor: colors.primary,
    borderRadius: borderRadius.md,
    justifyContent: "center",
    alignItems: "center",
  },
  bpmButtonText: {
    color: colors.backgroundDark,
    fontSize: fontSize.xl,
    fontWeight: "bold",
  },
  bpmValue: {
    color: colors.text,
    fontSize: fontSize.xl,
    fontWeight: "bold",
    minWidth: 60,
    textAlign: "center",
  },
  difficultyContainer: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  difficultyButton: {
    flex: 1,
    backgroundColor: colors.backgroundDark,
    borderRadius: borderRadius.md,
    padding: spacing.sm,
    alignItems: "center",
    borderWidth: 2,
    borderColor: "transparent",
  },
  difficultyButtonActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primary,
  },
  difficultyText: {
    color: colors.text,
    fontSize: fontSize.md,
    fontWeight: "600",
  },
  difficultyTextActive: {
    color: colors.backgroundDark,
  },
  difficultyLabel: {
    color: colors.textMuted,
    fontSize: fontSize.xs,
    marginTop: spacing.xs,
  },
});
