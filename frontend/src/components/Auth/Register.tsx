import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Register: React.FC = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await register(email, password);
      navigate('/login');
    } catch (err: any) {
      setError(err?.response?.data?.detail || 'Registration failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-2xl shadow-sm w-full max-w-sm border border-gray-100">
        <h1 className="text-xl font-semibold text-gray-800 mb-1">Create account</h1>
        <p className="text-sm text-gray-400 mb-6">Start tracking your daily calories</p>
        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
        <label htmlFor="register-email" className="block text-xs font-medium text-gray-500 mb-1">Email</label>
        <input
          id="register-email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full border border-gray-200 rounded-lg px-3 py-2 mb-4 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
        />
        <label htmlFor="register-password" className="block text-xs font-medium text-gray-500 mb-1">Password</label>
        <input
          id="register-password"
          type="password"
          required
          minLength={6}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full border border-gray-200 rounded-lg px-3 py-2 mb-6 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
        />
        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-emerald-600 text-white py-2 rounded-lg text-sm font-medium disabled:opacity-50"
        >
          {submitting ? 'Creating account…' : 'Register'}
        </button>
        <p className="mt-4 text-sm text-center text-gray-500">
          Already have an account? <Link to="/login" className="text-emerald-600 font-medium">Log in</Link>
        </p>
      </form>
    </div>
  );
};

export default Register;
