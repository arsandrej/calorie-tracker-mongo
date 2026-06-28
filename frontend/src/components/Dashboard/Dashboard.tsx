import React, { useState, useEffect } from 'react';
import apiClient from '../../api/client';
import SummaryCard from './SummaryCard';
import EntryList from './EntryList';
import EntryForm from './EntryForm';
import { DailyLog, Entry, EntryFormData } from '../../types';

const emptyLog: DailyLog = {
  date: new Date().toISOString().split('T')[0],
  entries: [],
  totals: { calories: 0, protein_g: 0, carbs_g: 0, fat_g: 0 },
};

const Dashboard: React.FC = () => {
  const [log, setLog] = useState<DailyLog>(emptyLog);
  const [loading, setLoading] = useState(true);
  const [editingEntry, setEditingEntry] = useState<Entry | null>(null);
  const [showForm, setShowForm] = useState(false);

  const fetchToday = async () => {
    try {
      const response = await apiClient.get<DailyLog>('/entries');
      setLog(response.data);
    } catch (error) {
      console.error('Failed to fetch entries:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (data: EntryFormData) => {
    await apiClient.post('/entries', data);
    await fetchToday();
    setShowForm(false);
  };

  const handleUpdate = async (id: string, data: EntryFormData) => {
    await apiClient.put(`/entries/${id}`, data);
    await fetchToday();
    setEditingEntry(null);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Delete this entry?')) {
      await apiClient.delete(`/entries/${id}`);
      await fetchToday();
    }
  };

  useEffect(() => {
    fetchToday();
  }, []);

  return (
    <main className="max-w-md mx-auto p-4">
      <p className="text-xs text-gray-400 mb-2">{log.date}</p>
      <SummaryCard totals={log.totals} />

      <button
        onClick={() => setShowForm(true)}
        className="w-full bg-emerald-600 text-white py-2.5 rounded-xl text-sm font-medium mb-4"
      >
        + Log food
      </button>

      {showForm && <EntryForm onSubmit={handleCreate} onCancel={() => setShowForm(false)} />}

      {editingEntry && (
        <EntryForm
          initialData={editingEntry}
          onSubmit={(data) => handleUpdate(editingEntry.id, data)}
          onCancel={() => setEditingEntry(null)}
        />
      )}

      <EntryList
        entries={log.entries}
        onEdit={setEditingEntry}
        onDelete={handleDelete}
        loading={loading}
      />
    </main>
  );
};

export default Dashboard;
