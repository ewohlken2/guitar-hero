import { render } from '@testing-library/react-native';
import { ComboDisplay } from '../../src/components/ComboDisplay';

describe('ComboDisplay', () => {
  it('renders the combo text', () => {
    const { getByText } = render(<ComboDisplay combo={3} />);
    expect(getByText('Combo x3')).toBeTruthy();
  });
});
