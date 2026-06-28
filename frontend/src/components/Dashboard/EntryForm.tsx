import React, { useState } from 'react';
import { Entry, EntryFormData } from '../../types';

interface EntryFormProps {
  initialData?: Entry | null;
  onSubmit: (data: EntryFormData) => void;
  onCancel: () => void;
}

const EntryForm: React.FC<EntryFormProps> = ({ initialData, onSubmit, onCancel }) => {
  const [description, setDescription] = useState(initialData?.description ?? '');
  const [calories, setCalories] = useState(initialData?.calories ?? 0);
  const [protein, setProtein] = useState(initialData?.protein_g ?? 0);
  const [carbs, setCarbs] = useState(initialData?.carbs_g ?? 0);
  const [fat, setFat] = useState(initialData?.fat_g ?? 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      description,
      calories,
      protein_g: protein,
      carbs_g: carbs,
      fat_g: fat,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mb-4">
      <label htmlFor="entry-description" className="block text-xs font-medium text-gray-500 mb-1">
        What did you eat?
      </label>
      <input
        id="entry-description"
        type="text"
        required
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="e.g. Grilled chicken salad"
        className="w-full border border-gray-200 rounded-lg px-3 py-2 mb-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
      />

      <div className="grid grid-cols-4 gap-3 mb-4">
        <div>
          <label htmlFor="entry-calories" className="block text-xs font-medium text-gray-500 mb-1">Calories</label>
          <input
            id="entry-calories"
            type="number"
            required
            min={1}
            value={calories}
            onChange={(e) => setCalories(Number(e.target.value))}
            className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
        <div>
          <label htmlFor="entry-protein" className="block text-xs font-medium text-gray-500 mb-1">Protein (g)</label>
          <input
            id="entry-protein"
            type="number"
            min={0}
            value={protein}
            onChange={(e) => setProtein(Number(e.target.value))}
            className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
        <div>
          <label htmlFor="entry-carbs" className="block text-xs font-medium text-gray-500 mb-1">Carbs (g)</label>
          <input
            id="entry-carbs"
            type="number"
            min={0}
            value={carbs}
            onChange={(e) => setCarbs(Number(e.target.value))}
            className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
        <div>
          <label htmlFor="entry-fat" className="block text-xs font-medium text-gray-500 mb-1">Fat (g)</label>
          <input
            id="entry-fat"
            type="number"
            min={0}
            value={fat}
            onChange={(e) => setFat(Number(e.target.value))}
            className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
      </div>

      <div className="flex gap-2">
        <button type="submit" className="bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-medium">
          Save
        </button>
        <button type="button" onClick={onCancel} className="px-4 py-2 rounded-lg text-sm border border-gray-200 text-gray-600">
          Cancel
        </button>
      </div>
    </form>
  );
};

export default EntryForm;
