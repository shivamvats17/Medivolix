import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import AdminDashboard from '../pages/AdminDashboard';
import { adminService } from '../services/adminService';
import * as AuthContextModule from '../context/AuthContext';

// Mock dependencies
vi.mock('../services/adminService', () => ({
  adminService: {
    getOverview: vi.fn(),
    getPharmacies: vi.fn(),
    getUsers: vi.fn(),
    approvePharmacy: vi.fn(),
    suspendPharmacy: vi.fn(),
  },
}));

describe('AdminDashboard - Edit Profile Feature', () => {
  const mockUpdateProfile = vi.fn();
  const mockUser = {
    id: 1,
    fullName: 'Dr. Rajesh Sharma',
    email: 'admin@medivolix.com',
    phone: '+91 98290 00001',
    role: 'SYSTEM_ADMIN',
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(AuthContextModule, 'useAuth').mockReturnValue({
      user: mockUser,
      updateProfile: mockUpdateProfile,
    });
    adminService.getOverview.mockResolvedValue({
      totalUsers: 12,
      totalCustomers: 4,
      totalPharmacies: 9,
      approvedPharmacies: 8,
      pendingPharmacies: 1,
      totalMedicines: 10,
    });
    adminService.getPharmacies.mockResolvedValue([]);
    adminService.getUsers.mockResolvedValue([mockUser]);
  });

  it('renders "Edit Admin Profile" button in header', async () => {
    render(<AdminDashboard />);

    await waitFor(() => {
      expect(screen.getByTestId('edit-admin-profile-btn')).toBeInTheDocument();
    });
  });

  it('opens Edit Administrator Profile modal on button click and allows name update', async () => {
    mockUpdateProfile.mockResolvedValue({
      ...mockUser,
      fullName: 'Shivam Vats',
    });

    render(<AdminDashboard />);

    await waitFor(() => {
      expect(screen.getByTestId('edit-admin-profile-btn')).toBeInTheDocument();
    });

    const editBtn = screen.getByTestId('edit-admin-profile-btn');
    fireEvent.click(editBtn);

    expect(screen.getByText('Edit Administrator Profile')).toBeInTheDocument();
    const nameInput = screen.getByLabelText('Administrator Full Name');
    expect(nameInput.value).toBe('Dr. Rajesh Sharma');

    fireEvent.change(nameInput, { target: { value: 'Shivam Vats' } });
    expect(nameInput.value).toBe('Shivam Vats');

    const saveBtn = screen.getByRole('button', { name: /Save Profile Changes/i });
    fireEvent.click(saveBtn);

    await waitFor(() => {
      expect(mockUpdateProfile).toHaveBeenCalledWith({
        fullName: 'Shivam Vats',
        phone: '+91 98290 00001',
      });
    });
  });
});
