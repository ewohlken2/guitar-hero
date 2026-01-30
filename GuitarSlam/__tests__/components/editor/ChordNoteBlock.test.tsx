import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { ChordNoteBlock } from '../../../src/components/editor/ChordNoteBlock';

describe('ChordNoteBlock', () => {
  const defaultProps = {
    note: { id: 'note-1', chord: 'G', time: 0, duration: 2 },
    pixelsPerSecond: 60,
    isSelected: false,
    onPress: jest.fn(),
    onLongPress: jest.fn(),
    onResizeStart: jest.fn(),
  };

  it('renders the chord name', () => {
    const { getByText } = render(<ChordNoteBlock {...defaultProps} />);
    expect(getByText('G')).toBeTruthy();
  });

  it('shows selected state', () => {
    const { getByTestId } = render(
      <ChordNoteBlock {...defaultProps} isSelected={true} />
    );
    const block = getByTestId('chord-note-block');
    expect(block.props.style).toEqual(
      expect.arrayContaining([expect.objectContaining({ borderColor: expect.any(String) })])
    );
  });

  it('calls onPress when tapped', () => {
    const onPress = jest.fn();
    const { getByTestId } = render(
      <ChordNoteBlock {...defaultProps} onPress={onPress} />
    );

    fireEvent.press(getByTestId('chord-note-block'));
    expect(onPress).toHaveBeenCalledWith('note-1');
  });

  it('calls onLongPress when long pressed', () => {
    const onLongPress = jest.fn();
    const { getByTestId } = render(
      <ChordNoteBlock {...defaultProps} onLongPress={onLongPress} />
    );

    fireEvent(getByTestId('chord-note-block'), 'longPress');
    expect(onLongPress).toHaveBeenCalledWith('note-1');
  });

  it('calculates width based on duration and pixelsPerSecond', () => {
    const { getByTestId } = render(
      <ChordNoteBlock
        {...defaultProps}
        note={{ ...defaultProps.note, duration: 4 }}
        pixelsPerSecond={60}
      />
    );

    const block = getByTestId('chord-note-block');
    // duration (4) * pixelsPerSecond (60) = 240 width
    expect(block.props.style).toEqual(
      expect.arrayContaining([expect.objectContaining({ width: 240 })])
    );
  });

  it('positions based on time and pixelsPerSecond', () => {
    const { getByTestId } = render(
      <ChordNoteBlock
        {...defaultProps}
        note={{ ...defaultProps.note, time: 2 }}
        pixelsPerSecond={60}
      />
    );

    const block = getByTestId('chord-note-block');
    // time (2) * pixelsPerSecond (60) = 120 left
    expect(block.props.style).toEqual(
      expect.arrayContaining([expect.objectContaining({ left: 120 })])
    );
  });
});
