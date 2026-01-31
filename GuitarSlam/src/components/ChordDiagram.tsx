import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Chord } from '../types';
import { colors, spacing, fontSize } from '../constants/theme';

interface ChordDiagramProps {
  chord: Chord;
  size?: 'small' | 'medium' | 'large';
  showName?: boolean;
}

const sizeConfig = {
  small: { width: 80, fretHeight: 16, fontSize: fontSize.sm },
  medium: { width: 120, fretHeight: 24, fontSize: fontSize.md },
  large: { width: 180, fretHeight: 36, fontSize: fontSize.lg },
};

export function ChordDiagram({ chord, size = 'medium', showName = true }: ChordDiagramProps) {
  const config = sizeConfig[size];
  const stringSpacing = config.width / 6;
  const fretCount = 5;
  const dotSize = config.fretHeight * 0.6;

  const renderStrings = () => {
    return (
      <View style={styles.stringsContainer}>
        {[0, 1, 2, 3, 4, 5].map((stringIndex) => (
          <View
            key={stringIndex}
            style={[
              styles.string,
              {
                left: stringIndex * stringSpacing + stringSpacing / 2,
                height: config.fretHeight * fretCount,
              },
            ]}
          />
        ))}
      </View>
    );
  };

  const renderFrets = () => {
    return (
      <View style={styles.fretsContainer}>
        {[0, 1, 2, 3, 4, 5].map((fretIndex) => (
          <View
            key={fretIndex}
            style={[
              styles.fret,
              {
                top: fretIndex * config.fretHeight,
                width: config.width - stringSpacing,
                left: stringSpacing / 2,
              },
              fretIndex === 0 && styles.nutFret,
            ]}
          />
        ))}
      </View>
    );
  };

  const renderFingerPositions = () => {
    return chord.diagram.strings.map((fretNum, stringIndex) => {
      if (fretNum <= 0) return null;

      const finger = chord.diagram.fingers[stringIndex];
      const x = stringIndex * stringSpacing + stringSpacing / 2;
      const y = (fretNum - 0.5) * config.fretHeight;

      return (
        <View
          key={`dot-${stringIndex}`}
          style={[
            styles.dot,
            {
              width: dotSize,
              height: dotSize,
              borderRadius: dotSize / 2,
              left: x - dotSize / 2,
              top: y - dotSize / 2,
            },
          ]}
        >
          {finger > 0 && (
            <Text style={[styles.fingerText, { fontSize: dotSize * 0.6 }]}>{finger}</Text>
          )}
        </View>
      );
    });
  };

  const renderStringMarkers = () => {
    return chord.diagram.strings.map((fretNum, stringIndex) => {
      const x = stringIndex * stringSpacing + stringSpacing / 2;
      const markerSize = dotSize * 0.6;

      if (fretNum === -1) {
        return (
          <Text
            key={`marker-${stringIndex}`}
            style={[
              styles.muteMarker,
              {
                left: x - markerSize / 2,
                top: -config.fretHeight * 0.8,
                fontSize: markerSize,
              },
            ]}
          >
            X
          </Text>
        );
      }
      if (fretNum === 0) {
        return (
          <View
            key={`marker-${stringIndex}`}
            style={[
              styles.openMarker,
              {
                width: markerSize,
                height: markerSize,
                borderRadius: markerSize / 2,
                left: x - markerSize / 2,
                top: -config.fretHeight * 0.7,
              },
            ]}
          />
        );
      }
      return null;
    });
  };

  return (
    <View style={styles.container}>
      {showName && (
        <Text style={[styles.chordName, { fontSize: config.fontSize * 1.5 }]}>
          {chord.primaryName}
        </Text>
      )}
      <View
        style={[
          styles.diagramContainer,
          {
            width: config.width,
            height: config.fretHeight * fretCount + config.fretHeight,
            paddingTop: config.fretHeight,
          },
        ]}
      >
        {renderFrets()}
        {renderStrings()}
        {renderFingerPositions()}
        {renderStringMarkers()}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  chordName: {
    color: colors.text,
    fontWeight: 'bold',
    marginBottom: spacing.sm,
  },
  diagramContainer: {
    position: 'relative',
  },
  stringsContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  string: {
    position: 'absolute',
    width: 2,
    backgroundColor: colors.textSecondary,
    top: 0,
  },
  fretsContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  fret: {
    position: 'absolute',
    height: 2,
    backgroundColor: colors.textSecondary,
  },
  nutFret: {
    height: 6,
    backgroundColor: colors.text,
  },
  dot: {
    position: 'absolute',
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fingerText: {
    color: colors.backgroundDark,
    fontWeight: 'bold',
  },
  muteMarker: {
    position: 'absolute',
    color: colors.textSecondary,
  },
  openMarker: {
    position: 'absolute',
    borderWidth: 2,
    borderColor: colors.textSecondary,
    backgroundColor: 'transparent',
  },
});
