import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import StatusBadge from '../components/common/StatusBadge';

describe('StatusBadge', () => {
  it('renders AVAILABLE status with badge-available class', () => {
    render(<StatusBadge status="AVAILABLE" />);
    const badge = screen.getByText('AVAILABLE');
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveClass('badge-available');
  });

  it('renders PENDING status with badge-low class', () => {
    render(<StatusBadge status="pending" />);
    const badge = screen.getByText('PENDING');
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveClass('badge-low');
  });

  it('renders UNAVAILABLE status with badge-out class', () => {
    render(<StatusBadge status="UNAVAILABLE" />);
    const badge = screen.getByText('UNAVAILABLE');
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveClass('badge-out');
  });

  it('renders OUTDATED status with badge-stale class', () => {
    render(<StatusBadge status="OUTDATED" />);
    const badge = screen.getByText('OUTDATED');
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveClass('badge-stale');
  });
});
