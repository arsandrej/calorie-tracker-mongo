import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import History from '../components/History/History';
import apiClient from '../api/client';

vi.mock('../api/client', () => ({
  default: { get: vi.fn() },
}));

describe('History', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders daily totals once loaded', async () => {
    (apiClient.get as any).mockResolvedValue({
      data: [
        { date: '2026-06-27', calories: 1800, protein_g: 100, carbs_g: 150, fat_g: 60 },
        { date: '2026-06-26', calories: 2100, protein_g: 110, carbs_g: 200, fat_g: 70 },
      ],
    });

    render(<History />);

    await waitFor(() => {
      expect(screen.getByText('1800 kcal')).toBeInTheDocument();
    });
    expect(screen.getByText('2026-06-27')).toBeInTheDocument();
    expect(screen.getByText('2026-06-26')).toBeInTheDocument();
  });

  it('shows an empty state when there is no history', async () => {
    (apiClient.get as any).mockResolvedValue({ data: [] });
    render(<History />);

    await waitFor(() => {
      expect(screen.getByText(/No history yet/)).toBeInTheDocument();
    });
  });
});
