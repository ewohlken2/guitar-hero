import React from 'react';
import { render } from '@testing-library/react-native';
import RootLayout from '../../app/_layout';

jest.mock('expo-router', () => {
  const React = require('react');
  const { Text } = require('react-native');

  const Stack = ({ children }: { children: React.ReactNode }) => <>{children}</>;
  Stack.Screen = ({ name }: { name: string }) => <Text>{name}</Text>;

  return { Stack };
});

jest.mock('expo-status-bar', () => ({
  StatusBar: () => null,
}));

describe('RootLayout', () => {
  it('includes editor and songs routes', () => {
    const { getByText } = render(<RootLayout />);

    expect(getByText('(tabs)')).toBeTruthy();
    expect(getByText('editor')).toBeTruthy();
    expect(getByText('songs')).toBeTruthy();
  });
});
