import React from 'react';
import { Entry } from '../../types';
import EntryItem from './EntryItem';

interface EntryListProps {
  entries: Entry[];
  loading: boolean;
  onEdit: (entry: Entry) => void;
  onDelete: (id: string) => void;
}

const EntryList: React.FC<EntryListProps> = ({ entries, loading, onEdit, onDelete }) => {
  if (loading) {
    return <p className="text-sm text-gray-400">Loading…</p>;
  }

  if (entries.length === 0) {
    return <p className="text-sm text-gray-400">No food logged today yet.</p>;
  }

  return (
    <ul>
      {entries.map((entry) => (
        <EntryItem key={entry.id} entry={entry} onEdit={onEdit} onDelete={onDelete} />
      ))}
    </ul>
  );
};

export default EntryList;
