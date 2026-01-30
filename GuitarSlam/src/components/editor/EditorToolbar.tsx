import React from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { colors, spacing, fontSize, borderRadius } from "../../constants/theme";

interface EditorToolbarProps {
  canUndo: boolean;
  canRedo: boolean;
  snapToGrid: boolean;
  zoom: number;
  onUndo: () => void;
  onRedo: () => void;
  onToggleSnap: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onPreview: () => void;
  onSave: () => void;
}

export const EditorToolbar: React.FC<EditorToolbarProps> = ({
  canUndo,
  canRedo,
  snapToGrid,
  zoom,
  onUndo,
  onRedo,
  onToggleSnap,
  onZoomIn,
  onZoomOut,
  onPreview,
  onSave,
}) => {
  return (
    <View style={styles.container}>
      {/* Left section: Undo/Redo */}
      <View style={styles.section}>
        <Pressable
          testID="undo-button"
          style={[styles.button, !canUndo && styles.buttonDisabled]}
          onPress={onUndo}
          disabled={!canUndo}
          accessibilityState={{ disabled: !canUndo }}
        >
          <Text style={[styles.buttonText, !canUndo && styles.buttonTextDisabled]}>
            Undo
          </Text>
        </Pressable>
        <Pressable
          testID="redo-button"
          style={[styles.button, !canRedo && styles.buttonDisabled]}
          onPress={onRedo}
          disabled={!canRedo}
          accessibilityState={{ disabled: !canRedo }}
        >
          <Text style={[styles.buttonText, !canRedo && styles.buttonTextDisabled]}>
            Redo
          </Text>
        </Pressable>
      </View>

      {/* Center section: Snap and Zoom */}
      <View style={styles.section}>
        <Pressable
          testID="snap-button"
          style={[styles.button, snapToGrid && styles.buttonActive]}
          onPress={onToggleSnap}
        >
          <Text style={[styles.buttonText, snapToGrid && styles.buttonTextActive]}>
            Snap
          </Text>
        </Pressable>
        <Pressable
          testID="zoom-out-button"
          style={styles.button}
          onPress={onZoomOut}
        >
          <Text style={styles.buttonText}>-</Text>
        </Pressable>
        <Text style={styles.zoomText}>{Math.round(zoom * 100)}%</Text>
        <Pressable
          testID="zoom-in-button"
          style={styles.button}
          onPress={onZoomIn}
        >
          <Text style={styles.buttonText}>+</Text>
        </Pressable>
      </View>

      {/* Right section: Preview and Save */}
      <View style={styles.section}>
        <Pressable
          testID="preview-button"
          style={styles.button}
          onPress={onPreview}
        >
          <Text style={styles.buttonText}>Preview</Text>
        </Pressable>
        <Pressable
          testID="save-button"
          style={[styles.button, styles.saveButton]}
          onPress={onSave}
        >
          <Text style={[styles.buttonText, styles.saveButtonText]}>Save</Text>
        </Pressable>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: colors.backgroundDark,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.textMuted,
  },
  section: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },
  button: {
    backgroundColor: colors.backgroundLight,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    minWidth: 40,
    alignItems: "center",
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonActive: {
    backgroundColor: colors.primary,
  },
  buttonText: {
    color: colors.text,
    fontSize: fontSize.sm,
    fontWeight: "600",
  },
  buttonTextDisabled: {
    color: colors.textMuted,
  },
  buttonTextActive: {
    color: colors.backgroundDark,
  },
  zoomText: {
    color: colors.text,
    fontSize: fontSize.sm,
    minWidth: 48,
    textAlign: "center",
  },
  saveButton: {
    backgroundColor: colors.primary,
  },
  saveButtonText: {
    color: colors.backgroundDark,
  },
});
