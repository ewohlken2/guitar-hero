import React from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { ChordNote } from "../../types";
import { colors, spacing, fontSize, borderRadius } from "../../constants/theme";

interface ChordNoteBlockProps {
  note: ChordNote;
  pixelsPerSecond: number;
  isSelected: boolean;
  onPress: (noteId: string) => void;
  onLongPress: (noteId: string) => void;
  onResizeStart?: (noteId: string, edge: "left" | "right") => void;
}

export const ChordNoteBlock: React.FC<ChordNoteBlockProps> = ({
  note,
  pixelsPerSecond,
  isSelected,
  onPress,
  onLongPress,
  onResizeStart,
}) => {
  const width = note.duration * pixelsPerSecond;
  const left = note.time * pixelsPerSecond;

  return (
    <Pressable
      testID="chord-note-block"
      style={[styles.block, { width, left }, isSelected && styles.selected]}
      onPress={() => onPress(note.id)}
      onLongPress={() => onLongPress(note.id)}
    >
      <Text style={styles.chordName} numberOfLines={1}>
        {note.chord}
      </Text>

      {/* Resize handles (visible when selected) */}
      {isSelected && (
        <>
          <Pressable
            style={[styles.resizeHandle, styles.resizeHandleLeft]}
            onPressIn={() => onResizeStart?.(note.id, "left")}
            hitSlop={{ top: 10, bottom: 10, left: 20, right: 0 }}
          />
          <Pressable
            style={[styles.resizeHandle, styles.resizeHandleRight]}
            onPressIn={() => onResizeStart?.(note.id, "right")}
            hitSlop={{ top: 10, bottom: 10, left: 0, right: 20 }}
          />
        </>
      )}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  block: {
    position: "absolute",
    top: 60,
    height: 48,
    backgroundColor: colors.backgroundLight,
    borderRadius: borderRadius.md,
    borderWidth: 2,
    borderColor: colors.textMuted,
    justifyContent: "center",
    alignItems: "center",
    minWidth: 40,
  },
  selected: {
    borderColor: colors.primary,
    backgroundColor: colors.backgroundDark,
  },
  chordName: {
    color: colors.text,
    fontSize: fontSize.md,
    fontWeight: "bold",
  },
  resizeHandle: {
    position: "absolute",
    top: 0,
    bottom: 0,
    width: 8,
    backgroundColor: colors.primary,
    opacity: 0.7,
  },
  resizeHandleLeft: {
    left: 0,
    borderTopLeftRadius: borderRadius.md - 2,
    borderBottomLeftRadius: borderRadius.md - 2,
  },
  resizeHandleRight: {
    right: 0,
    borderTopRightRadius: borderRadius.md - 2,
    borderBottomRightRadius: borderRadius.md - 2,
  },
});
