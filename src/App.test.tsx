import React from 'react';
import { render } from '@testing-library/react';
import App from './App';

test('dummy', () => {
  render(<App />);
  expect(true).toBeTruthy();
});
