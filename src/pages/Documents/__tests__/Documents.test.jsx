import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderAuthenticated } from '../../../test/helpers';
import Documents from '../index';

const { mockFetchDocuments } = vi.hoisted(() => ({
  mockFetchDocuments: vi.fn(),
}));

const mockUploadDocument   = vi.fn();
const mockReplaceDocument  = vi.fn();
const mockDeleteDocument   = vi.fn();
const mockOpenDocumentFile = vi.fn();

vi.mock('../../../api/documents', () => ({
  fetchDocuments:    () => mockFetchDocuments(),
  uploadDocument:    (...args) => mockUploadDocument(...args),
  replaceDocument:   (...args) => mockReplaceDocument(...args),
  deleteDocument:    (...args) => mockDeleteDocument(...args),
  openDocumentFile:  (...args) => mockOpenDocumentFile(...args),
}));

const DOC_FRONT = {
  id: 1,
  documentType: 'drivers_license',
  status: 'pending',
  uploadedAt: '2024-01-01',
  originalFileName: 'license_front.jpg',
};

const DOC_BACK = {
  id: 2,
  documentType: 'drivers_license',
  status: 'verified',
  uploadedAt: '2024-01-02',
  originalFileName: 'license_back.jpg',
};

const DOC_PASSPORT = {
  id: 3,
  documentType: 'passport',
  status: 'verified',
  uploadedAt: '2024-03-01',
  originalFileName: 'passport.jpg',
};

describe('Documents Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFetchDocuments.mockResolvedValue([DOC_FRONT, DOC_BACK, DOC_PASSPORT]);
    mockUploadDocument.mockResolvedValue({
      id: 99, documentType: 'state_id', status: 'pending',
      uploadedAt: '2024-06-01', originalFileName: 'state_id.jpg',
    });
    mockReplaceDocument.mockResolvedValue({ ...DOC_FRONT, status: 'pending', originalFileName: 'license_new.jpg' });
    mockDeleteDocument.mockResolvedValue(undefined);
    mockOpenDocumentFile.mockResolvedValue(undefined);
  });

  async function renderDocuments() {
    renderAuthenticated(<Documents />);
    await waitFor(() => expect(mockFetchDocuments).toHaveBeenCalled());
  }

  async function openModal() {
    const user = userEvent.setup();
    await renderDocuments();
    await user.click(screen.getByRole('button', { name: /upload document/i }));
    await screen.findByRole('heading', { name: /upload document/i });
    return user;
  }

  // ── Page rendering ────────────────────────────────────────

  it('renders the page heading', async () => {
    await renderDocuments();
    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('Documents');
  });

  it('renders upload trigger button', async () => {
    await renderDocuments();
    expect(screen.getByRole('button', { name: /upload document/i })).toBeInTheDocument();
  });

  it('renders empty state when no documents', async () => {
    mockFetchDocuments.mockResolvedValue([]);
    await renderDocuments();
    expect(await screen.findByText(/no documents uploaded/i)).toBeInTheDocument();
  });

  it('renders error state with retry on fetch failure', async () => {
    mockFetchDocuments.mockRejectedValue(new Error('Network error'));
    renderAuthenticated(<Documents />);
    expect(await screen.findByText(/network error/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /retry/i })).toBeInTheDocument();
  });

  // ── Grouping ──────────────────────────────────────────────

  it('groups documents by type and shows group headers', async () => {
    await renderDocuments();
    expect(await screen.findByText("Driver's License")).toBeInTheDocument();
    expect(screen.getByText('Passport')).toBeInTheDocument();
  });

  it('shows file count badge in group header', async () => {
    await renderDocuments();
    expect(await screen.findByText('2 files')).toBeInTheDocument();
    expect(screen.getByText('1 file')).toBeInTheDocument();
  });

  it('shows all filenames inside expanded groups', async () => {
    await renderDocuments();
    expect(await screen.findByText('license_front.jpg')).toBeInTheDocument();
    expect(screen.getByText('license_back.jpg')).toBeInTheDocument();
    expect(screen.getByText('passport.jpg')).toBeInTheDocument();
  });

  it('shows group status as pending when any file is pending', async () => {
    await renderDocuments();
    // drivers_license has one pending + one verified → group shows pending
    const statuses = await screen.findAllByText(/pending/i);
    expect(statuses.length).toBeGreaterThan(0);
  });

  it('collapses group when header is clicked', async () => {
    const user = userEvent.setup();
    await renderDocuments();
    await screen.findByText('license_front.jpg');

    await user.click(screen.getByText("Driver's License").closest('button'));
    expect(screen.queryByText('license_front.jpg')).not.toBeInTheDocument();
  });

  it('re-expands group when header is clicked again', async () => {
    const user = userEvent.setup();
    await renderDocuments();
    await screen.findByText('license_front.jpg');

    const groupHeader = screen.getByText("Driver's License").closest('button');
    await user.click(groupHeader); // collapse
    await user.click(groupHeader); // expand
    expect(screen.getByText('license_front.jpg')).toBeInTheDocument();
  });

  // ── Per-file actions ──────────────────────────────────────

  it('renders View, Replace, Remove buttons for each file', async () => {
    await renderDocuments();
    await screen.findByText('license_front.jpg');

    const viewBtns    = screen.getAllByRole('button', { name: /^view$/i });
    const removeBtns  = screen.getAllByRole('button', { name: /^remove$/i });
    // Replace uses a <label>, not a button — find by text
    const replaceBtns = screen.getAllByText(/^replace$/i);

    expect(viewBtns.length).toBe(3);    // 3 files total
    expect(removeBtns.length).toBe(3);
    expect(replaceBtns.length).toBe(3);
  });

  it('calls openDocumentFile when View is clicked', async () => {
    const user = userEvent.setup();
    await renderDocuments();
    const viewBtns = await screen.findAllByRole('button', { name: /^view$/i });
    await user.click(viewBtns[0]);
    await waitFor(() => expect(mockOpenDocumentFile).toHaveBeenCalledWith(DOC_FRONT.id));
  });

  it('calls replaceDocument when a replacement file is uploaded', async () => {
    const user = userEvent.setup();
    await renderDocuments();
    await screen.findByText('license_front.jpg');

    // The Replace label wraps a hidden file input — upload via the input
    const inputs = document.querySelectorAll('input[type="file"][accept="image/*,.pdf"]:not([multiple])');
    const newFile = new File(['new'], 'license_new.jpg', { type: 'image/jpeg' });
    await user.upload(inputs[0], newFile);

    await waitFor(() =>
      expect(mockReplaceDocument).toHaveBeenCalledWith(DOC_FRONT.id, newFile)
    );
  });

  it('updates the filename in the list after replace', async () => {
    const user = userEvent.setup();
    await renderDocuments();
    await screen.findByText('license_front.jpg');

    const inputs = document.querySelectorAll('input[type="file"][accept="image/*,.pdf"]:not([multiple])');
    await user.upload(inputs[0], new File(['new'], 'license_new.jpg', { type: 'image/jpeg' }));

    await waitFor(() => expect(screen.getByText('license_new.jpg')).toBeInTheDocument());
    expect(screen.queryByText('license_front.jpg')).not.toBeInTheDocument();
  });

  it('calls deleteDocument and removes file from list', async () => {
    const user = userEvent.setup();
    await renderDocuments();
    const removeBtns = await screen.findAllByRole('button', { name: /^remove$/i });
    await user.click(removeBtns[0]);
    await waitFor(() => expect(mockDeleteDocument).toHaveBeenCalledWith(DOC_FRONT.id));
    expect(screen.queryByText('license_front.jpg')).not.toBeInTheDocument();
  });

  it('removes group card when last file in group is deleted', async () => {
    mockFetchDocuments.mockResolvedValue([DOC_PASSPORT]);
    mockDeleteDocument.mockResolvedValue(undefined);
    const user = userEvent.setup();
    await renderDocuments();

    await screen.findByText('Passport');
    await user.click(screen.getByRole('button', { name: /^remove$/i }));
    await waitFor(() => expect(mockDeleteDocument).toHaveBeenCalledWith(DOC_PASSPORT.id));
    expect(screen.queryByText('Passport')).not.toBeInTheDocument();
  });

  // ── Upload modal ──────────────────────────────────────────

  it('opens upload modal when trigger button is clicked', async () => {
    await openModal();
    expect(screen.getByText(/choose a document type/i)).toBeInTheDocument();
  });

  it('closes modal when Cancel is clicked', async () => {
    const user = await openModal();
    await user.click(screen.getByRole('button', { name: /cancel/i }));
    expect(screen.queryByText(/choose a document type/i)).not.toBeInTheDocument();
  });

  it('submit button is disabled until a doc type and file are selected', async () => {
    const user = await openModal();
    expect(screen.getByRole('button', { name: /upload & submit/i })).toBeDisabled();
  });

  it('shows State field for drivers_license', async () => {
    const user = await openModal();
    await user.click(screen.getByRole('button', { name: "Driver's License" }));
    expect(screen.getByLabelText(/state/i)).toBeInTheDocument();
  });

  it('hides issuer field for SSN card', async () => {
    const user = await openModal();
    await user.click(screen.getByText('Social Security Card'));
    expect(screen.queryByLabelText(/state|country|issuer|provider|branch/i)).not.toBeInTheDocument();
  });

  it('assigns Front and Back labels for two uploaded files', async () => {
    const user = await openModal();
    await user.click(screen.getByRole('button', { name: "Driver's License" }));

    const input = document.querySelector('input[type="file"][multiple]');
    await user.upload(input, [
      new File(['f'], 'front.jpg', { type: 'image/jpeg' }),
      new File(['b'], 'back.jpg', { type: 'image/jpeg' }),
    ]);

    expect(screen.getByDisplayValue('Front')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Back')).toBeInTheDocument();
  });

  it('calls uploadDocument once per file and adds new group', async () => {
    const user = await openModal();
    await user.click(screen.getByText('State ID Card'));

    const input = document.querySelector('input[type="file"][multiple]');
    await user.upload(input, [
      new File(['f'], 'front.jpg', { type: 'image/jpeg' }),
    ]);

    await user.click(screen.getByRole('button', { name: /upload & submit/i }));
    await waitFor(() => expect(mockUploadDocument).toHaveBeenCalledTimes(1));
    await waitFor(() =>
      expect(screen.queryByText(/choose a document type/i)).not.toBeInTheDocument()
    );
  });
});
