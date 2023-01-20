import React from 'react';
import '@testing-library/jest-dom/extend-expect';
import { render, screen } from '@testing-library/react';
import App from '@lentovaraukset/frontend/src/App';

test('renders content', () => {
  render(App());
  const element = screen.getByText('Lentovaraukset');
  expect(element).toBeDefined();
});
