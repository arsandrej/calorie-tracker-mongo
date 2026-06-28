import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import EntryList from '../components/Dashboard/EntryList';
import { Entry } from '../types';

const entries: Entry[] = [
  { id: '64b0000000000000000000a1', date: '2026-06-27', description: 'Lunch', calories: 500, protein_g: 30, carbs_g: 50, fat_g: 15, created_at: '' },
  { id: '64b0000000000000000000a2', date: '2026-06-27', description: 'Snack', calories: 200, protein_g: 5, carbs_g: 20, fat_g: 10, created_at: '' },
];

describe('EntryList', () => {
  it('shows a loading message while loading', () => {
    render(<EntryList entries={[]} loading={true} onEdit={() => {}} onDelete={() => {}} />);
    expect(screen.getByText('Loading…')).toBeInTheDocument();
  });

  it('shows an empty state when there are no entries', () => {
    render(<EntryList entries={[]} loading={false} onEdit={() => {}} onDelete={() => {}} />);
    expect(screen.getByText(/No food logged today/)).toBeInTheDocument();
  });

  it('renders one item per entry', () => {
    render(<EntryList entries={entries} loading={false} onEdit={() => {}} onDelete={() => {}} />);
    expect(screen.getByText('Lunch')).toBeInTheDocument();
    expect(screen.getByText('Snack')).toBeInTheDocument();
  });
});
