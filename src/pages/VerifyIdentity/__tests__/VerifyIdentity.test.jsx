import { describe, it, expect } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderAuthenticated, MOCK_USER } from '../../../test/helpers';
import VerifyIdentity from '../index';

const PENDING_USER = { ...MOCK_USER, accountStatus: 'PENDING' };

describe('VerifyIdentity Page', () => {
  describe('when already verified', () => {
    it('shows verified banner for ACTIVE user', () => {
      renderAuthenticated(<VerifyIdentity />);
      expect(screen.getByText('Identity Verified')).toBeInTheDocument();
    });

    it('shows verification details', () => {
      renderAuthenticated(<VerifyIdentity />);
      expect(screen.getByText('Verification Level')).toBeInTheDocument();
      expect(screen.getByText('IAL2 — Strong Identity')).toBeInTheDocument();
    });
  });

  describe('when not yet verified', () => {
    it('renders the verification page heading', () => {
      renderAuthenticated(<VerifyIdentity />, { user: PENDING_USER });
      expect(screen.getByText('Verify Your Identity')).toBeInTheDocument();
    });

    it('renders the stepper', () => {
      renderAuthenticated(<VerifyIdentity />, { user: PENDING_USER });
      expect(screen.getByText('ID Type')).toBeInTheDocument();
      expect(screen.getByText('Upload')).toBeInTheDocument();
    });

    it('shows ID type selection on first step', () => {
      renderAuthenticated(<VerifyIdentity />, { user: PENDING_USER });
      expect(screen.getByText("Driver's License")).toBeInTheDocument();
      expect(screen.getByText('Passport Card')).toBeInTheDocument();
    });

    it('continue button requires ID type selection', async () => {
      const user = userEvent.setup();
      renderAuthenticated(<VerifyIdentity />, { user: PENDING_USER });

      const continueBtn = screen.getByRole('button', { name: /continue/i });
      expect(continueBtn).toBeDisabled();

      const driverOption = screen.getByText("Driver's License");
      await user.click(driverOption);

      expect(continueBtn).not.toBeDisabled();
    });
  });
});
