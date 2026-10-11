import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import FreshnessBadge from '../components/common/FreshnessBadge';

describe('FreshnessBadge', () => {
  it('renders Fresh badge for updates within 24 hours', () => {
    const recentDate = new Date().toISOString();
    render(<FreshnessBadge lastUpdated={recentDate} />);
    const badge = screen.getByText(/Fresh/i);
    expect(badge).toBeInTheDocument();
  });

  it('renders Outdated badge for updates older than 24 hours', () => {
    const oldDate = new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString();
    render(<FreshnessBadge lastUpdated={oldDate} />);
    const badge = screen.getByText(/Outdated/i);
    expect(badge).toBeInTheDocument();
  });
});
