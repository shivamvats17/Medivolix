import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import UserDashboard from '../pages/UserDashboard';
import { requestService } from '../services/requestService';
import * as AuthContextModule from '../context/AuthContext';

vi.mock('../services/requestService', () => ({
  requestService: {
    getMyRequests: vi.fn(),
    cancelRequest: vi.fn(),
  },
}));

describe('UserDashboard - Edit Profile Feature', () => {
  const mockUpdateProfile = vi.fn();
  const mockUser = {
    id: 5,
    fullName: 'Rahul Sharma',
    email: 'rahul@example.com',
    phone: '+91 98765 43210',
    role: 'CUSTOMER',
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(AuthContextModule, 'useAuth').mockReturnValue({
      user: mockUser,
      updateProfile: mockUpdateProfile,
    });
    requestService.getMyRequests.mockResolvedValue([]);
  });

  it('renders "Edit Profile" button in customer banner', async () => {
    render(
      <MemoryRouter>
        <UserDashboard />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByTestId('edit-user-profile-btn')).toBeInTheDocument();
    });
  });

  it('opens modal and allows customer profile update', async () => {
    mockUpdateProfile.mockResolvedValue({
      ...mockUser,
      fullName: 'Rahul S. Sharma',
    });

    render(
      <MemoryRouter>
        <UserDashboard />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByTestId('edit-user-profile-btn')).toBeInTheDocument();
    });

    const editBtn = screen.getByTestId('edit-user-profile-btn');
    fireEvent.click(editBtn);

    expect(screen.getByText('Edit My Profile')).toBeInTheDocument();
    const nameInput = screen.getByLabelText('Full Name');
    expect(nameInput.value).toBe('Rahul Sharma');

    fireEvent.change(nameInput, { target: { value: 'Rahul S. Sharma' } });
    expect(nameInput.value).toBe('Rahul S. Sharma');

    const saveBtn = screen.getByRole('button', { name: /Save Profile Changes/i });
    fireEvent.click(saveBtn);

    await waitFor(() => {
      expect(mockUpdateProfile).toHaveBeenCalledWith({
        fullName: 'Rahul S. Sharma',
        phone: '+91 98765 43210',
      });
    });
  });
});
