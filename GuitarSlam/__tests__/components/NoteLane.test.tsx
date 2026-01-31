import { render } from '@testing-library/react-native';
import NoteLane from '../../src/components/NoteLane';
import { ChordNote } from '../../src/types';

describe('NoteLane', () => {
  it('renders note labels', () => {
    const notes: ChordNote[] = [
      { id: 'n1', chord: 'C', time: 0, duration: 1 },
      { id: 'n2', chord: 'G', time: 1, duration: 1 },
    ];

    const { getByText } = render(
      <NoteLane notes={notes} currentTime={0} hitZoneY={300} />
    );

    expect(getByText('C')).toBeTruthy();
    expect(getByText('G')).toBeTruthy();
  });
});
