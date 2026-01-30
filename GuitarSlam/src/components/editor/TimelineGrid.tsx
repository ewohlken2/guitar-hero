import React, { useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
} from "react-native";
import { colors, fontSize } from "../../constants/theme";

interface TimelineGridProps {
  bpm: number;
  duration: number; // Total duration in seconds
  zoom: number; // 0.5 to 4
  currentTime: number;
  onTimePress: (time: number) => void;
  width?: number;
}

const PIXELS_PER_SECOND_BASE = 60;
const BEATS_PER_MEASURE = 4;

export const TimelineGrid: React.FC<TimelineGridProps> = ({
  bpm,
  duration,
  zoom,
  currentTime,
  onTimePress,
  width = 360,
}) => {
  const pixelsPerSecond = PIXELS_PER_SECOND_BASE * zoom;
  const beatDuration = 60 / bpm;

  const markers = useMemo(() => {
    const result: { time: number; isMeasure: boolean; measureNum?: number }[] =
      [];
    let beat = 0;
    let measure = 1;

    for (let time = 0; time <= duration; time += beatDuration) {
      const isMeasure = beat % BEATS_PER_MEASURE === 0;
      result.push({
        time,
        isMeasure,
        measureNum: isMeasure ? measure : undefined,
      });

      beat++;
      if (isMeasure && time > 0) measure++;
    }

    return result;
  }, [bpm, duration, beatDuration]);

  const handlePress = (event: { nativeEvent: { locationX: number } }) => {
    const x = event.nativeEvent.locationX;
    const time = x / pixelsPerSecond;
    onTimePress(time);
  };

  const totalWidth = duration * pixelsPerSecond;

  return (
    <Pressable
      testID="timeline-grid"
      style={[styles.container, { width: totalWidth }]}
      onPress={handlePress}
    >
      {/* Playhead */}
      <View
        style={[styles.playhead, { left: currentTime * pixelsPerSecond }]}
      />

      {/* Beat markers */}
      {markers.map((marker, index) => (
        <View
          key={index}
          testID={`beat-marker-${index}`}
          style={[
            styles.marker,
            marker.isMeasure ? styles.measureMarker : styles.beatMarker,
            { left: marker.time * pixelsPerSecond },
          ]}
        >
          {marker.isMeasure && (
            <Text style={styles.measureNumber}>{marker.measureNum}</Text>
          )}
        </View>
      ))}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 300,
    backgroundColor: colors.backgroundLight,
    position: "relative",
  },
  marker: {
    position: "absolute",
    top: 0,
    width: 1,
    height: "100%",
  },
  beatMarker: {
    backgroundColor: colors.textMuted,
    opacity: 0.3,
  },
  measureMarker: {
    backgroundColor: colors.textSecondary,
    opacity: 0.6,
  },
  measureNumber: {
    position: "absolute",
    top: 4,
    left: 4,
    color: colors.textSecondary,
    fontSize: fontSize.xs,
  },
  playhead: {
    position: "absolute",
    top: 0,
    width: 2,
    height: "100%",
    backgroundColor: colors.primary,
    zIndex: 10,
  },
});
