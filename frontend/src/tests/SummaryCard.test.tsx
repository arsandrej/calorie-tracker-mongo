import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import SummaryCard from '../components/Dashboard/SummaryCard';

describe('SummaryCard', () => {
  it('renders calorie total and goal', () => {
    render(
      <SummaryCard totals={{ calories: 1200, protein_g: 80, carbs_g: 100, fat_g: 40 }} goalCalories={2000} />
    );
    expect(screen.getByText('1200')).toBeInTheDocument();
    expect(screen.getByText('of 2000 kcal goal')).toBeInTheDocument();
  });

  it('shows remaining calories when under goal', () => {
    render(
      <SummaryCard totals={{ calories: 1200, protein_g: 80, carbs_g: 100, fat_g: 40 }} goalCalories={2000} />
    );
    expect(screen.getByText('800 kcal left')).toBeInTheDocument();
  });

  it('shows over-goal message when over goal', () => {
    render(
      <SummaryCard totals={{ calories: 2200, protein_g: 80, carbs_g: 100, fat_g: 40 }} goalCalories={2000} />
    );
    expect(screen.getByText('200 kcal over')).toBeInTheDocument();
  });

  it('renders macro grams for protein, carbs and fat', () => {
    render(
      <SummaryCard totals={{ calories: 1200, protein_g: 80, carbs_g: 100, fat_g: 40 }} goalCalories={2000} />
    );
    expect(screen.getByText('80g')).toBeInTheDocument();
    expect(screen.getByText('100g')).toBeInTheDocument();
    expect(screen.getByText('40g')).toBeInTheDocument();
  });
});
