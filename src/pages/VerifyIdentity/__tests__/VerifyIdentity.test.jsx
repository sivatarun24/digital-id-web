import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderAuthenticated, MOCK_USER } from '../../../test/helpers';
import VerifyIdentity from '../index';

const PENDING_USER = { ...MOCK_USER, accountStatus: 'PENDING' };

const { mockFetchVerificationStatus } = vi.hoisted(() => ({
  mockFetchVerificationStatus: vi.fn(),
}));

const mockSubmitVerification = vi.fn();

vi.mock('../../../api/verifyIdentity', () => ({
  fetchVerificationStatus: () => mockFetchVerificationStatus(),
  submitVerification: (...args) => mockSubmitVerification(...args),
}));

// ── Camera mocks ──────────────────────────────────────────────
let mockStream;

beforeEach(() => {
  vi.clearAllMocks();

  mockStream = {
    getTracks: () => [{ stop: vi.fn() }],
  };

  Object.defineProperty(navigator, 'mediaDevices', {
    writable: true,
    configurable: true,
    value: {
      getUserMedia: vi.fn().mockResolvedValue(mockStream),
    },
  });

  // jsdom doesn't implement URL.createObjectURL — needed for selfie preview
  globalThis.URL.createObjectURL = vi.fn(() => 'blob:mock-selfie-url');

  // Make canvas 2d context a no-op so capturePhoto doesn't throw in jsdom
  HTMLCanvasElement.prototype.getContext = vi.fn(() => ({ drawImage: vi.fn() }));

  // Make canvas.toBlob synchronously call back with a fake jpeg blob
  HTMLCanvasElement.prototype.toBlob = vi.fn(function (callback) {
    callback(new Blob(['fake-image'], { type: 'image/jpeg' }));
  });
});

afterEach(() => {
  delete globalThis.URL.createObjectURL;
  HTMLCanvasElement.prototype.getContext = undefined;
  HTMLCanvasElement.prototype.toBlob = undefined;
});

// ── Helpers ────────────────────────────────────────────────────
async function navigateToStep(targetStep, opts = {}) {
  const user = userEvent.setup();
  renderAuthenticated(<VerifyIdentity />, { user: opts.user ?? PENDING_USER });
  await screen.findByText('Select Your Document Type');

  // Step 0 → pick ID type
  await user.click(screen.getByText("Driver's License"));

  if (targetStep === 0) return user;

  // Step 0 → 1
  await user.click(screen.getByRole('button', { name: /continue/i }));
  await screen.findByText('Upload Your Document');

  if (targetStep === 1) return user;

  // Step 1 → upload front file then continue to step 2
  const input = document.querySelector('input[type="file"]');
  await user.upload(input, new File(['img'], 'front.jpg', { type: 'image/jpeg' }));
  await user.click(screen.getByRole('button', { name: /continue/i }));
  await screen.findByText('Take a Selfie');

  return user;
}

describe('VerifyIdentity Page', () => {

  describe('when already verified', () => {
    beforeEach(() => {
      mockFetchVerificationStatus.mockResolvedValue({
        status: 'verified',
        submittedAt: '2024-06-01',
        idType: 'drivers_license',
      });
    });

    it('shows verified banner', async () => {
      renderAuthenticated(<VerifyIdentity />);
      expect(await screen.findByText('Identity Verified')).toBeInTheDocument();
    });

    it('shows verification details', async () => {
      renderAuthenticated(<VerifyIdentity />);
      expect(await screen.findByText('Verification Level')).toBeInTheDocument();
      expect(screen.getByText('IAL2 — Strong Identity')).toBeInTheDocument();
    });

    it('shows successful biometric match status', async () => {
      renderAuthenticated(<VerifyIdentity />);
      await screen.findByText('Identity Verified');
      expect(screen.getByText('Confirmed ✅')).toBeInTheDocument();
    });
  });

  describe('when verification is pending', () => {
    beforeEach(() => {
      mockFetchVerificationStatus.mockResolvedValue({ status: 'pending' });
    });

    it('shows under review message', async () => {
      renderAuthenticated(<VerifyIdentity />);
      expect(await screen.findByRole('heading', { name: /under review/i })).toBeInTheDocument();
    });
  });

  describe('when not yet verified', () => {
    beforeEach(() => {
      mockFetchVerificationStatus.mockResolvedValue({ status: 'none' });
    });

    // ── Step 0: ID type ──────────────────────────────────────

    it('renders the verification page heading', async () => {
      renderAuthenticated(<VerifyIdentity />, { user: PENDING_USER });
      expect(await screen.findByText('Verify Your Identity')).toBeInTheDocument();
    });

    it('renders the stepper labels', async () => {
      renderAuthenticated(<VerifyIdentity />, { user: PENDING_USER });
      await screen.findByText('ID Type');
      expect(screen.getByText('Upload')).toBeInTheDocument();
      expect(screen.getByText('Selfie')).toBeInTheDocument();
      expect(screen.getByText('Review')).toBeInTheDocument();
    });

    it('shows ID type selection on first step', async () => {
      renderAuthenticated(<VerifyIdentity />, { user: PENDING_USER });
      await screen.findByText('Select Your Document Type');
      expect(screen.getByText("Driver's License")).toBeInTheDocument();
      expect(screen.getByText('Passport Card')).toBeInTheDocument();
    });

    it('continue button is disabled until ID type is selected', async () => {
      const user = userEvent.setup();
      renderAuthenticated(<VerifyIdentity />, { user: PENDING_USER });

      const continueBtn = await screen.findByRole('button', { name: /continue/i });
      expect(continueBtn).toBeDisabled();

      await user.click(screen.getByText("Driver's License"));
      expect(continueBtn).not.toBeDisabled();
    });

    // ── Step 1: Upload ────────────────────────────────────────

    it('navigates to upload step after selecting ID type', async () => {
      await navigateToStep(1);
      expect(screen.getByText('Upload Your Document')).toBeInTheDocument();
    });

    it('continue is disabled until front file is uploaded', async () => {
      const user = await navigateToStep(1);
      expect(screen.getByRole('button', { name: /continue/i })).toBeDisabled();

      const input = document.querySelector('input[type="file"]');
      await user.upload(input, new File(['img'], 'front.jpg', { type: 'image/jpeg' }));
      expect(screen.getByRole('button', { name: /continue/i })).not.toBeDisabled();
    });

    it('back button returns to ID type step', async () => {
      await navigateToStep(1);
      const user = userEvent.setup();
      await user.click(screen.getByRole('button', { name: /back/i }));
      expect(await screen.findByText('Select Your Document Type')).toBeInTheDocument();
    });

    // ── Step 2: Selfie (camera) ───────────────────────────────

    it('shows Open Camera button on selfie step', async () => {
      await navigateToStep(2);
      expect(screen.getByRole('button', { name: /open camera/i })).toBeInTheDocument();
    });

    it('continue button is disabled before selfie is taken', async () => {
      await navigateToStep(2);
      expect(screen.getByRole('button', { name: /continue/i })).toBeDisabled();
    });

    it('clicking Open Camera calls getUserMedia', async () => {
      const user = await navigateToStep(2);
      await user.click(screen.getByRole('button', { name: /open camera/i }));
      expect(navigator.mediaDevices.getUserMedia).toHaveBeenCalledWith({
        video: { facingMode: 'user' },
        audio: false,
      });
    });

    it('shows Take Photo and Cancel buttons after camera opens', async () => {
      const user = await navigateToStep(2);
      await user.click(screen.getByRole('button', { name: /open camera/i }));
      await waitFor(() =>
        expect(screen.getByRole('button', { name: /take photo/i })).toBeInTheDocument()
      );
      expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
    });

    it('Cancel stops the camera and restores Open Camera button', async () => {
      const user = await navigateToStep(2);
      await user.click(screen.getByRole('button', { name: /open camera/i }));
      await waitFor(() => screen.getByRole('button', { name: /cancel/i }));

      await user.click(screen.getByRole('button', { name: /cancel/i }));
      expect(screen.getByRole('button', { name: /open camera/i })).toBeInTheDocument();
    });

    it('taking a photo enables the Continue button', async () => {
      const user = await navigateToStep(2);
      await user.click(screen.getByRole('button', { name: /open camera/i }));
      await waitFor(() => screen.getByRole('button', { name: /take photo/i }));

      await user.click(screen.getByRole('button', { name: /take photo/i }));
      await waitFor(() =>
        expect(screen.getByRole('button', { name: /continue/i })).not.toBeDisabled()
      );
    });

    it('shows Retake Selfie button after photo is captured', async () => {
      const user = await navigateToStep(2);
      await user.click(screen.getByRole('button', { name: /open camera/i }));
      await waitFor(() => screen.getByRole('button', { name: /take photo/i }));
      await user.click(screen.getByRole('button', { name: /take photo/i }));

      await waitFor(() =>
        expect(screen.getByRole('button', { name: /retake selfie/i })).toBeInTheDocument()
      );
    });

    it('shows camera error message when getUserMedia is denied', async () => {
      navigator.mediaDevices.getUserMedia = vi.fn().mockRejectedValue(new Error('NotAllowedError'));

      const user = await navigateToStep(2);
      await user.click(screen.getByRole('button', { name: /open camera/i }));

      await waitFor(() =>
        expect(screen.getByText(/camera access denied/i)).toBeInTheDocument()
      );
    });

    // ── Step 3: Review & Submit ───────────────────────────────

    it('navigates to review step with captured selfie', async () => {
      const user = await navigateToStep(2);
      await user.click(screen.getByRole('button', { name: /open camera/i }));
      await waitFor(() => screen.getByRole('button', { name: /take photo/i }));
      await user.click(screen.getByRole('button', { name: /take photo/i }));
      await waitFor(() =>
        expect(screen.getByRole('button', { name: /continue/i })).not.toBeDisabled()
      );
      await user.click(screen.getByRole('button', { name: /continue/i }));

      expect(await screen.findByText('Review & Submit')).toBeInTheDocument();
      expect(screen.getByText("Driver's License")).toBeInTheDocument();
      expect(screen.getByText('Captured')).toBeInTheDocument();
    });

    it('calls submitVerification on submit and shows pending state', async () => {
      mockSubmitVerification.mockResolvedValue({ status: 'pending' });

      const user = await navigateToStep(2);
      await user.click(screen.getByRole('button', { name: /open camera/i }));
      await waitFor(() => screen.getByRole('button', { name: /take photo/i }));
      await user.click(screen.getByRole('button', { name: /take photo/i }));
      await waitFor(() =>
        expect(screen.getByRole('button', { name: /continue/i })).not.toBeDisabled()
      );
      await user.click(screen.getByRole('button', { name: /continue/i }));

      await screen.findByText('Review & Submit');
      await user.click(screen.getByRole('button', { name: /submit verification/i }));

      await waitFor(() => expect(mockSubmitVerification).toHaveBeenCalledOnce());
      expect(await screen.findByRole('heading', { name: /analyzing your identity/i })).toBeInTheDocument();
    });
  });
});
