import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import { renderAuthenticated } from '../../../test/helpers';
import Documents from '../index';

const { mockFetchDocuments } = vi.hoisted(() => ({
  mockFetchDocuments: vi.fn(),
}));

vi.mock('../../../api/documents', () => ({
  fetchDocuments: () => mockFetchDocuments(),
  uploadDocument: vi.fn(),
  deleteDocument: vi.fn(),
  openDocumentFile: vi.fn(),
}));

describe('Documents Page', () => {
  beforeEach(() => {
    mockFetchDocuments.mockResolvedValue([
      {
        id: 1,
        documentType: 'drivers_license',
        status: 'verified',
        uploadedAt: '2024-01-01',
        originalFileName: 'license.jpg',
      },
    ]);
  });

  async function renderDocuments() {
    renderAuthenticated(<Documents />);
    await waitFor(() => expect(mockFetchDocuments).toHaveBeenCalled());
  }

  it('renders the page heading', async () => {
    await renderDocuments();
    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('Documents');
  });

  it('renders upload trigger button', async () => {
    await renderDocuments();
    const uploadBtns = screen.getAllByText(/upload/i);
    expect(uploadBtns.length).toBeGreaterThan(0);
  });

  it('renders document list', async () => {
    await renderDocuments();
    expect(screen.getByText(/driver/i)).toBeInTheDocument();
  });
});
