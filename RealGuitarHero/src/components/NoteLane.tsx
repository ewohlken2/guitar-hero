import { View, StyleSheet } from 'react-native';
import { ChordNote } from '../types';
import FallingNote from './FallingNote';

type NoteStatus = 'upcoming' | 'hit' | 'miss';

interface NoteLaneProps {
  notes: ChordNote[];
  currentTime: number;
  hitZoneY: number;
  travelTime?: number;
  noteStatus?: Record<string, NoteStatus>;
}

const clamp = (value: number, min: number, max: number) => {
  return Math.max(min, Math.min(max, value));
};

export default function NoteLane({
  notes,
  currentTime,
  hitZoneY,
  travelTime = 3.5,
  noteStatus,
}: NoteLaneProps) {
  return (
    <View style={styles.lane}>
      {notes.map((note) => {
        const timeUntil = note.time - currentTime;
        const progress = 1 - timeUntil / travelTime;
        const y = clamp(progress * hitZoneY, -100, hitZoneY);
        const status = noteStatus?.[note.id] ?? 'upcoming';

        return <FallingNote key={note.id} label={note.chord} y={y} status={status} />;
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  lane: {
    flex: 1,
  },
});
