import { render } from '@testing-library/react-native';
import { ScoreDisplay } from '../../src/components/ScoreDisplay';

describe('ScoreDisplay', () => {
  it('renders the score text', () => {
    const { getByText } = render(<ScoreDisplay score={1200} />);
    expect(getByText('Score 1200')).toBeTruthy();
  });
});
