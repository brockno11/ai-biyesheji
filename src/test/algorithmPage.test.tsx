import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, it, expect, beforeAll } from 'vitest';
import AlgorithmPage from '../pages/AlgorithmPage';

beforeAll(() => {
  // jsdom does not implement scrollIntoView
  Element.prototype.scrollIntoView = () => {};
});

describe('AlgorithmPage', () => {
  it('renders algorithm detail page by id', () => {
    render(
      <MemoryRouter initialEntries={['/algorithms/linear-regression']}>
        <Routes>
          <Route path="/algorithms/:id" element={<AlgorithmPage />} />
        </Routes>
      </MemoryRouter>
    );
    expect(screen.getByText('线性回归')).toBeInTheDocument();
  });
});
