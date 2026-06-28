import React from 'react';
import { Totals } from '../../types';

interface SummaryCardProps {
  totals: Totals;
  goalCalories?: number;
}

const MacroBar: React.FC<{ label: string; grams: number; colorClass: string }> = ({
  label,
  grams,
  colorClass,
}) => (
  <div className="flex-1">
    <div className="flex justify-between text-xs text-gray-500 mb-1">
      <span>{label}</span>
      <span className="font-medium text-gray-700">{grams}g</span>
    </div>
    <div className="h-1.5 rounded-full bg-gray-100">
      <div
        className={`h-1.5 rounded-full ${colorClass}`}
        style={{ width: `${Math.min(100, grams)}%` }}
      />
    </div>
  </div>
);

const SummaryCard: React.FC<SummaryCardProps> = ({ totals, goalCalories = 2000 }) => {
  const remaining = goalCalories - totals.calories;
  const pct = Math.min(100, Math.round((totals.calories / goalCalories) * 100));

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6">
      <div className="flex items-end justify-between mb-4">
        <div>
          <p className="text-3xl font-semibold text-gray-800">{totals.calories}</p>
          <p className="text-xs text-gray-400">of {goalCalories} kcal goal</p>
        </div>
        <p className={`text-sm font-medium ${remaining >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
          {remaining >= 0 ? `${remaining} kcal left` : `${Math.abs(remaining)} kcal over`}
        </p>
      </div>

      <div className="h-2 rounded-full bg-gray-100 mb-6">
        <div
          className="h-2 rounded-full bg-emerald-500 transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>

      <div className="flex gap-4">
        <MacroBar label="Protein" grams={totals.protein_g} colorClass="bg-blue-500" />
        <MacroBar label="Carbs" grams={totals.carbs_g} colorClass="bg-amber-500" />
        <MacroBar label="Fat" grams={totals.fat_g} colorClass="bg-rose-500" />
      </div>
    </div>
  );
};

export default SummaryCard;
