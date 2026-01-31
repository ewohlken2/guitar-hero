import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing, fontSize, borderRadius } from '../constants/theme';

interface FallingNoteProps {
  label: string;
  y: number;
  status: 'upcoming' | 'hit' | 'miss';
}

export default function FallingNote({ label, y, status }: FallingNoteProps) {
  return (
    <View style={[styles.note, { transform: [{ translateY: y }] }, styles[status]]}>
      <Text style={styles.noteText}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  note: {
    position: 'absolute',
    left: spacing.lg,
    right: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  noteText: {
    color: colors.text,
    fontSize: fontSize.md,
    fontWeight: '700',
  },
  upcoming: {
    backgroundColor: colors.backgroundLight,
  },
  hit: {
    backgroundColor: colors.success,
  },
  miss: {
    backgroundColor: colors.error,
  },
});
