import { Text, StyleSheet } from 'react-native';
import { colors, fontSize } from '../constants/theme';

export const ComboDisplay = ({ combo }: { combo: number }) => {
  return <Text style={styles.text}>Combo x{combo}</Text>;
};

const styles = StyleSheet.create({
  text: {
    fontSize: fontSize.md,
    fontWeight: '700',
    color: colors.primary,
  },
});
