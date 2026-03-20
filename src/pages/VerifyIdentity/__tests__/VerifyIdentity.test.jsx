import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderAuthenticated, MOCK_USER } from '../../../test/helpers';
import VerifyIdentity from '../index';

const PENDING_USER = { ...MOCK_USER, accountStatus: 'PENDING' };

const { mockFetchVerificationStatus } = vi.hoisted(() => ({
  mockFetchVerificationStatus: vi.fn(),
}));

vi.mock('../../../api/verifyIdentity', () => ({
  fetchVerificationStatus: () => mockFetchVerificationStatus(),
  submitVerification: vi.fn(),
}));

describe('VerifyIdentity Page', () => {
  describe('when already verified', () => {
    beforeEach(() => {
      mockFetchVerificationStatus.mockResolvedValue({
        status: 'verified',
        submittedAt: '2024-06-01',
        idType: 'drivers_license',
      });
    });

    it('shows verified banner for ACTIVE user', async () => {
      renderAuthenticated(<VerifyIdentity />);
      expect(await screen.findByText('Identity Verified')).toBeInTheDocument();
    });

    it('shows verification details', async () => {
      renderAuthenticated(<VerifyIdentity />);
      expect(await screen.findByText('Verification Level')).toBeInTheDocument();
      expect(screen.getByText('IAL2 — Strong Identity')).toBeInTheDocument();
    });
  });

  describe('when not yet verified', () => {
    beforeEach(() => {
      mockFetchVerificationStatus.mockResolvedValue({ status: 'none' });
    });

    it('renders the verification page heading', async () => {
      renderAuthenticated(<VerifyIdentity />, { user: PENDING_USER });
      expect(await screen.findByText('Verify Your Identity')).toBeInTheDocument();
    });

    it('renders the stepper', async () => {
      renderAuthenticated(<VerifyIdentity />, { user: PENDING_USER });
      expect(await screen.findByText('ID Type')).toBeInTheDocument();
      expect(screen.getByText('Selfie')).toBeInTheDocument();
    });

    it('shows ID type selection on first step', async () => {
      renderAuthenticated(<VerifyIdentity />, { user: PENDING_USER });
      await screen.findByText('Select Your Document Type');
      expect(screen.getByText("Driver's License")).toBeInTheDocument();
      expect(screen.getByText('Passport Card')).toBeInTheDocument();
    });

    it('continue button requires ID type selection', async () => {
      const user = userEvent.setup();
      renderAuthenticated(<VerifyIdentity />, { user: PENDING_USER });

      const continueBtn = await screen.findByRole('button', { name: /continue/i });
      expect(continueBtn).toBeDisabled();

      const driverOption = screen.getByText("Driver's License");
      await user.click(driverOption);

      expect(continueBtn).not.toBeDisabled();
    });
  });
});
