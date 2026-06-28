import React from 'react';
import { Entry } from '../../types';

interface EntryItemProps {
  entry: Entry;
  onEdit: (entry: Entry) => void;
  onDelete: (id: string) => void;
}

const EntryItem: React.FC<EntryItemProps> = ({ entry, onEdit, onDelete }) => {
  return (
    <li className="flex items-center justify-between bg-white px-4 py-3 rounded-xl border border-gray-100 mb-2">
      <div>
        <p className="text-sm font-medium text-gray-800">{entry.description}</p>
        <p className="text-xs text-gray-400 mt-0.5">
          P {entry.protein_g}g · C {entry.carbs_g}g · F {entry.fat_g}g
        </p>
      </div>
      <div className="flex items-center gap-3">
        <span className="text-sm font-semibold text-gray-700">{entry.calories} kcal</span>
        <button onClick={() => onEdit(entry)} className="text-xs text-gray-400 hover:text-emerald-600">
          Edit
        </button>
        <button onClick={() => onDelete(entry.id)} className="text-xs text-gray-400 hover:text-red-500">
          Delete
        </button>
      </div>
    </li>
  );
};

export default EntryItem;
