import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FaTimes } from 'react-icons/fa';

const links = [
  { to: '/dashboard', label: 'Dashboard', icon: '📊' },
  { to: '/jobs', label: 'My Jobs', icon: '💼' },
  { to: '/resume-ai', label: 'Resume AI', icon: '📄' },
  { to: '/cover-letter', label: 'Cover Letter', icon: '✉️' },
];

export default function Sidebar({ onClose }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside className="w-64 h-screen bg-slate-800/95 backdrop-blur-sm border-r border-white/10 flex flex-col sticky top-0">
      {/* Logo - Fixed at top */}
      <div className="px-6 py-5 border-b border-white/10 flex justify-between items-center flex-shrink-0">
        <div className="flex items-center gap-3">
          {/*  LOGO IMAGE PLACED HERE */}
          <img 
            src="/Logo.png" 
            alt="CareerLens Logo" 
            className="w-9 h-9 object-contain rounded-xl"
            onError={(e) => {
              console.log('Logo failed to load. Make sure logo.png exists in public folder');
              e.target.style.display = 'none';
            }}
          />
          <div>
            <h1 className="text-lg font-semibold text-indigo-400">
              Career<span className="text-white">Lens</span>
            </h1>
            <p className="text-xs text-white/30 mt-0.5">AI-Powered Job Tracker</p>
          </div>
        </div>
        {/* Close button - mobile only */}
        <button
          onClick={onClose}
          className="md:hidden p-1 rounded-lg hover:bg-white/10 text-white/40 hover:text-white transition"
        >
          <FaTimes className="text-white/40" />
        </button>
      </div>

      {/* Nav links - Scrollable middle section */}
      {/* Nav links - Scrollable middle section */}
<nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
  {links.map(link => (
    <NavLink
      key={link.to}
      to={link.to}
      onClick={onClose}
      className={({ isActive }) =>
        `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition ${
          isActive
            ? 'bg-indigo-600/20 text-indigo-400 font-medium border border-indigo-500/30'
            : 'text-white/40 hover:bg-white/5 hover:text-white'
        }`
      }
    >
      <span className="text-base">{link.icon}</span>
      {link.label}
    </NavLink>
  ))}

  {/* Admin link - only for admin users */}
  {user?.role === 'admin' && (
    <NavLink
      to="/admin"
      onClick={onClose}
      className={({ isActive }) =>
        `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition mt-2 ${
          isActive
            ? 'bg-red-600/20 text-red-400 font-medium border border-red-500/30'
            : 'text-red-400/60 hover:bg-red-500/10 hover:text-red-400'
        }`
      }
    >
      <span className="text-base">⚡</span>
      Admin Panel
    </NavLink>
  )}
</nav>

      {/* User info + logout - Fixed at bottom */}
      <div className="px-4 py-4 border-t border-white/10 flex-shrink-0 bg-slate-800/95">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500/30 to-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-white font-medium text-sm flex-shrink-0">
            {user?.name?.charAt(0) || user?.email?.charAt(0) || 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">
              {user?.name || user?.email?.split('@')[0] || 'User'}
            </p>
            <p className="text-xs text-white/30 truncate">{user?.email}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2 text-sm text-red-400 hover:text-red-300 transition px-3 py-2 rounded-lg hover:bg-red-500/10"
        >
          <span></span>
          Logout
        </button>
      </div>
    </aside>
  );
}