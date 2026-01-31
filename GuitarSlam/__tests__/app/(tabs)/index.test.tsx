import React from 'react';
import { render } from '@testing-library/react-native';
import HomeScreen from '../../../app/(tabs)/index';

jest.mock('expo-router', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}));

describe('HomeScreen', () => {
  it('shows My Songs card', () => {
    const { getByText } = render(<HomeScreen />);

    expect(getByText('My Songs')).toBeTruthy();
    expect(getByText('Create and manage custom songs')).toBeTruthy();
  });
});
