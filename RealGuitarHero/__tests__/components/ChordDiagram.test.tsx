import React from 'react';
import { render, screen } from '@testing-library/react-native';
import { ChordDiagram } from '../../src/components/ChordDiagram';
import { chords } from '../../src/constants/chords';

describe('ChordDiagram', () => {
  const gMajor = chords.find((c) => c.id === 'g-major')!;

  it('renders chord name', () => {
    render(<ChordDiagram chord={gMajor} />);
    expect(screen.getByText('G')).toBeTruthy();
  });

  it('renders with custom size', () => {
    render(<ChordDiagram chord={gMajor} size="large" />);
    expect(screen.getByText('G')).toBeTruthy();
  });
});
