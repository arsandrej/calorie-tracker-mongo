import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Navbar: React.FC = () => {
  const { logout, isAuthenticated } = useAuth();

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
      isActive ? 'bg-emerald-600 text-white' : 'text-gray-600 hover:bg-gray-100'
    }`;

  return (
    <nav className="bg-white border-b border-gray-200 px-4 py-3 flex justify-between items-center">
      <span className="text-lg font-semibold text-gray-800">CalTrack</span>
      {isAuthenticated && (
        <div className="flex items-center gap-2">
          <NavLink to="/" className={linkClass} end>
            Today
          </NavLink>
          <NavLink to="/history" className={linkClass}>
            History
          </NavLink>
          <button
            onClick={logout}
            className="ml-2 text-sm text-gray-400 hover:text-red-500"
          >
            Log out
          </button>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
