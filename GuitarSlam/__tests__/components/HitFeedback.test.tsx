import { render } from '@testing-library/react-native';
import { HitFeedback } from '../../src/components/HitFeedback';

describe('HitFeedback', () => {
  it('renders hit text in uppercase', () => {
    const { getByText } = render(<HitFeedback type="perfect" />);
    expect(getByText('PERFECT')).toBeTruthy();
  });
});
