import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import EntryForm from '../components/Dashboard/EntryForm';

describe('EntryForm', () => {
  it('submits description, calories and macros', () => {
    const onSubmit = vi.fn();
    render(<EntryForm onSubmit={onSubmit} onCancel={() => {}} />);

    fireEvent.change(screen.getByLabelText('What did you eat?'), {
      target: { value: 'Protein shake' },
    });
    fireEvent.change(screen.getByLabelText('Calories'), { target: { value: '250' } });
    fireEvent.change(screen.getByLabelText('Protein (g)'), { target: { value: '30' } });
    fireEvent.change(screen.getByLabelText('Carbs (g)'), { target: { value: '10' } });
    fireEvent.change(screen.getByLabelText('Fat (g)'), { target: { value: '5' } });
    fireEvent.click(screen.getByText('Save'));

    expect(onSubmit).toHaveBeenCalledWith({
      description: 'Protein shake',
      calories: 250,
      protein_g: 30,
      carbs_g: 10,
      fat_g: 5,
    });
  });

  it('calls onCancel when Cancel is clicked', () => {
    const onCancel = vi.fn();
    render(<EntryForm onSubmit={() => {}} onCancel={onCancel} />);
    fireEvent.click(screen.getByText('Cancel'));
    expect(onCancel).toHaveBeenCalled();
  });

  it('pre-fills fields when initialData is provided', () => {
    render(
      <EntryForm
        initialData={{
          id: '64b0000000000000000000a1',
          date: '2026-06-20',
          description: 'Dinner',
          calories: 600,
          protein_g: 35,
          carbs_g: 50,
          fat_g: 20,
          created_at: '',
        }}
        onSubmit={() => {}}
        onCancel={() => {}}
      />
    );
    expect(screen.getByDisplayValue('Dinner')).toBeInTheDocument();
    expect(screen.getByDisplayValue('600')).toBeInTheDocument();
    expect(screen.getByDisplayValue('35')).toBeInTheDocument();
  });
});
