import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import EntryItem from '../components/Dashboard/EntryItem';
import { Entry } from '../types';

const sampleEntry: Entry = {
  id: '64b0000000000000000000a1',
  date: '2026-06-27',
  description: 'Grilled chicken salad',
  calories: 450,
  protein_g: 40,
  carbs_g: 15,
  fat_g: 18,
  created_at: '2026-06-27T12:00:00Z',
};

describe('EntryItem', () => {
  it('renders description, calories and macros', () => {
    render(<EntryItem entry={sampleEntry} onEdit={() => {}} onDelete={() => {}} />);
    expect(screen.getByText('Grilled chicken salad')).toBeInTheDocument();
    expect(screen.getByText('450 kcal')).toBeInTheDocument();
    expect(screen.getByText(/P 40g/)).toBeInTheDocument();
  });

  it('calls onEdit with the entry when Edit is clicked', () => {
    const onEdit = vi.fn();
    render(<EntryItem entry={sampleEntry} onEdit={onEdit} onDelete={() => {}} />);
    fireEvent.click(screen.getByText('Edit'));
    expect(onEdit).toHaveBeenCalledWith(sampleEntry);
  });

  it('calls onDelete with the entry id when Delete is clicked', () => {
    const onDelete = vi.fn();
    render(<EntryItem entry={sampleEntry} onEdit={() => {}} onDelete={onDelete} />);
    fireEvent.click(screen.getByText('Delete'));
    expect(onDelete).toHaveBeenCalledWith(1);
  });
});
