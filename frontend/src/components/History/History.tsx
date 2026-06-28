import React, { useState, useEffect } from 'react';
import apiClient from '../../api/client';
import { HistoryDay } from '../../types';

const History: React.FC = () => {
  const [days, setDays] = useState<HistoryDay[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await apiClient.get<HistoryDay[]>('/history', {
          params: { days: 7 },
        });
        setDays(response.data);
      } catch (error) {
        console.error('Failed to fetch history:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  return (
    <main className="max-w-md mx-auto p-4">
      <h2 className="text-sm font-medium text-gray-500 mb-3">Last 7 days</h2>

      {loading && <p className="text-sm text-gray-400">Loading…</p>}

      {!loading && days.length === 0 && (
        <p className="text-sm text-gray-400">No history yet — log some food on the Today page.</p>
      )}

      <ul>
        {days.map((day) => (
          <li
            key={day.date}
            className="flex items-center justify-between bg-white px-4 py-3 rounded-xl border border-gray-100 mb-2"
          >
            <div>
              <p className="text-sm font-medium text-gray-800">{day.date}</p>
              <p className="text-xs text-gray-400 mt-0.5">
                P {day.protein_g}g · C {day.carbs_g}g · F {day.fat_g}g
              </p>
            </div>
            <span className="text-sm font-semibold text-gray-700">{day.calories} kcal</span>
          </li>
        ))}
      </ul>
    </main>
  );
};

export default History;
