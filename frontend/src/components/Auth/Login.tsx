import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Login: React.FC = () => {
  const { login } = useAuth();
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
      await login(email, password);
      navigate('/');
    } catch {
      setError('Invalid email or password');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-2xl shadow-sm w-full max-w-sm border border-gray-100">
        <h1 className="text-xl font-semibold text-gray-800 mb-1">CalTrack</h1>
        <p className="text-sm text-gray-400 mb-6">Log in to track today's calories</p>
        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
        <label htmlFor="login-email" className="block text-xs font-medium text-gray-500 mb-1">Email</label>
        <input
          id="login-email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full border border-gray-200 rounded-lg px-3 py-2 mb-4 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
        />
        <label htmlFor="login-password" className="block text-xs font-medium text-gray-500 mb-1">Password</label>
        <input
          id="login-password"
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full border border-gray-200 rounded-lg px-3 py-2 mb-6 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
        />
        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-emerald-600 text-white py-2 rounded-lg text-sm font-medium disabled:opacity-50"
        >
          {submitting ? 'Logging in…' : 'Log In'}
        </button>
        <p className="mt-4 text-sm text-center text-gray-500">
          No account? <Link to="/register" className="text-emerald-600 font-medium">Register</Link>
        </p>
      </form>
    </div>
  );
};

export default Login;
