import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const links = [
  { to: '/dashboard',    label: 'Dashboard',    icon: '📊' },
  { to: '/jobs',         label: 'My Jobs',       icon: '💼' },
  { to: '/resume-ai',   label: 'Resume AI',     icon: '📄' },
  { to: '/cover-letter', label: 'Cover Letter',  icon: '✉️'  },
];

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside className="w-60 min-h-screen bg-white border-r border-gray-100 flex flex-col">
      {/* Logo */}
      <div className="px-6 py-5 border-b border-gray-100">
        <h1 className="text-lg font-semibold text-indigo-600">JobTracker</h1>
        <p className="text-xs text-gray-400 mt-0.5">AI-Powered</p>
      </div>

      {/* Nav links */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {links.map(link => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition ${
                isActive
                  ? 'bg-indigo-50 text-indigo-600 font-medium'
                  : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'
              }`
            }
          >
            <span className="text-base">{link.icon}</span>
            {link.label}
          </NavLink>
        ))}
      </nav>

      {/* User info + logout */}
      <div className="px-4 py-4 border-t border-gray-100">
        <p className="text-sm font-medium text-gray-700 truncate">{user?.name}</p>
        <p className="text-xs text-gray-400 truncate mb-3">{user?.email}</p>
        <button
          onClick={handleLogout}
          className="w-full text-left text-sm text-red-400 hover:text-red-600 transition"
        >
          Logout
        </button>
      </div>
    </aside>
  );
}