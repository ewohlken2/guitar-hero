import { Text, StyleSheet } from 'react-native';
import { colors, fontSize } from '../constants/theme';

export const ScoreDisplay = ({ score }: { score: number }) => {
  return <Text style={styles.text}>Score {score}</Text>;
};

const styles = StyleSheet.create({
  text: {
    fontSize: fontSize.md,
    fontWeight: '700',
    color: colors.text,
  },
});
