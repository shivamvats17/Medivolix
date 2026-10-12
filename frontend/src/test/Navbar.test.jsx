import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Navbar from '../components/common/Navbar';
import * as AuthContext from '../context/AuthContext';
import { ThemeProvider } from '../context/ThemeContext';

describe('Navbar', () => {
  it('renders brand wordmark and default public navigation links', () => {
    vi.spyOn(AuthContext, 'useAuth').mockReturnValue({
      user: null,
      isAuthenticated: false,
      isCustomer: false,
      isPharmacyAdmin: false,
      isSystemAdmin: false,
      logout: vi.fn()
    });

    render(
      <ThemeProvider>
        <MemoryRouter>
          <Navbar />
        </MemoryRouter>
      </ThemeProvider>
    );


    expect(screen.getByText('Medivolix')).toBeInTheDocument();
    expect(screen.getByText('Search Medicines')).toBeInTheDocument();
    expect(screen.getByText('API Docs')).toBeInTheDocument();
  });

  it('renders pharmacy portal link when authenticated as PHARMACY_ADMIN', () => {
    vi.spyOn(AuthContext, 'useAuth').mockReturnValue({
      user: { id: 2, fullName: 'Ramesh Rao', role: 'PHARMACY_ADMIN' },
      isAuthenticated: true,
      isCustomer: false,
      isPharmacyAdmin: true,
      isSystemAdmin: false,
      logout: vi.fn()
    });

    render(
      <ThemeProvider>
        <MemoryRouter>
          <Navbar />
        </MemoryRouter>
      </ThemeProvider>
    );


    expect(screen.getByText('Pharmacy Portal')).toBeInTheDocument();
    expect(screen.getByText('Ramesh Rao')).toBeInTheDocument();
  });
});
