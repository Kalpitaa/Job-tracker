import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import { motion } from 'framer-motion';
import { FaBars, FaTimes } from 'react-icons/fa';

const StatCard = ({ label, value, icon, color }) => {
  const colors = {
    indigo: 'from-indigo-500/20 to-indigo-600/10 border-indigo-500/30 text-indigo-400',
    blue: 'from-blue-500/20 to-blue-600/10 border-blue-500/30 text-blue-400',
    yellow: 'from-yellow-500/20 to-yellow-600/10 border-yellow-500/30 text-yellow-400',
    green: 'from-green-500/20 to-green-600/10 border-green-500/30 text-green-400',
    purple: 'from-purple-500/20 to-purple-600/10 border-purple-500/30 text-purple-400',
    red: 'from-red-500/20 to-red-600/10 border-red-500/30 text-red-400',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02, y: -5 }}
      className={`bg-gradient-to-br ${colors[color]} border backdrop-blur-sm rounded-2xl p-4 md:p-6 transition-all duration-300`}
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-2xl md:text-3xl">{icon}</span>
        <span className={`text-[10px] font-semibold px-2 py-1 rounded-full bg-green-500/20 text-green-400 border border-green-500/30`}>
          Live
        </span>
      </div>
      <div className="text-2xl md:text-3xl font-bold text-white mb-1">{value ?? 0}</div>
      <div className="text-xs md:text-sm text-white/40">{label}</div>
    </motion.div>
  );
};

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    Promise.all([
      api.get('/admin/stats'),
      api.get('/admin/users'),
      api.get('/admin/jobs'),
    ]).then(([statsRes, usersRes, jobsRes]) => {
      setStats(statsRes.data);
      setUsers(usersRes.data);
      setJobs(jobsRes.data);
    }).catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const handleDeleteUser = async (id) => {
    if (!confirm('Delete this user?')) return;
    await api.delete(`/admin/users/${id}`);
    setUsers(users.filter(u => u._id !== id));
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  if (loading) return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 flex items-center justify-center">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-white/50 text-sm">Loading admin panel...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 flex relative">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar - Responsive */}
      <aside className={`
        fixed md:static inset-y-0 left-0 z-50
        w-64 h-screen
        bg-slate-800/95 backdrop-blur-sm border-r border-white/10 
        flex flex-col
        transform transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        <div className="px-4 md:px-6 py-4 md:py-5 border-b border-white/10 flex-shrink-0">
          <div className="flex items-center gap-3">
            {/* Logo */}
            <img 
              src="/Logo.png" 
              alt="CareerLens Logo" 
              className="w-8 h-8 md:w-10 md:h-10 object-contain rounded-xl"
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
            <div className="flex-1">
              <h1 className="text-sm md:text-base font-bold text-indigo-400">Career<span className="text-white">Lens</span></h1>
              <p className="text-[10px] md:text-xs text-white/30">Admin Panel</p>
            </div>
            {/* Mobile close button */}
            <button
              onClick={() => setSidebarOpen(false)}
              className="md:hidden p-1 rounded-lg hover:bg-white/10 text-white/40 hover:text-white transition"
            >
              <FaTimes />
            </button>
          </div>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {[
            { id: 'overview', label: 'Overview', icon: '📊' },
            { id: 'users', label: 'Users', icon: '👥' },
            { id: 'jobs', label: 'All Jobs', icon: '💼' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                setSidebarOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition ${
                activeTab === tab.id
                  ? 'bg-indigo-600/20 text-indigo-400 font-medium border border-indigo-500/30'
                  : 'text-white/40 hover:bg-white/5 hover:text-white'
              }`}
            >
              <span className="text-base">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </nav>

        <div className="px-4 py-4 border-t border-white/10 flex-shrink-0 bg-slate-800/95">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 md:w-9 md:h-9 rounded-full bg-gradient-to-br from-indigo-500/30 to-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-white font-medium text-sm flex-shrink-0">
              {user?.name?.charAt(0) || user?.email?.charAt(0) || 'A'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">
                {user?.name || user?.email?.split('@')[0] || 'Admin'}
              </p>
              <p className="text-xs text-white/30 truncate hidden sm:block">{user?.email}</p>
              <span className="text-[10px] text-indigo-400 font-medium">Administrator</span>
            </div>
          </div>
          <div className="space-y-1">
            <button
              onClick={() => navigate('/dashboard')}
              className="w-full text-left text-xs text-white/40 hover:text-white transition px-3 py-2 rounded-lg hover:bg-white/5"
            >
              ← Back to App
            </button>
            <button
              onClick={handleLogout}
              className="w-full text-left text-sm text-red-400 hover:text-red-300 transition px-3 py-2 rounded-lg hover:bg-red-500/10"
            >
               Logout
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 w-full overflow-x-hidden">
        {/* Mobile Header */}
        <div className="sticky top-0 z-30 bg-slate-900/80 backdrop-blur-sm border-b border-white/10 p-4 md:hidden flex items-center justify-between">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-xl bg-white/5 border border-white/10 text-white/60 hover:text-white hover:bg-white/10 transition"
          >
            <FaBars />
          </button>
          <h1 className="text-lg font-semibold text-indigo-400">
            Career<span className="text-white">Lens</span>
          </h1>
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500/30 to-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-white font-medium text-sm">
            {user?.name?.charAt(0) || user?.email?.charAt(0) || 'A'}
          </div>
        </div>

        <div className="p-4 md:p-8">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 md:mb-8"
              >
                <h1 className="text-2xl md:text-3xl font-bold text-white">Admin Overview</h1>
                <p className="text-white/50 text-sm mt-1">Platform stats at a glance</p>
              </motion.div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6 md:mb-8">
                <StatCard label="Total Users" value={stats?.totalUsers} icon="👥" color="blue" />
                <StatCard label="Total Jobs" value={stats?.totalJobs} icon="💼" color="indigo" />
                <StatCard label="Applied" value={stats?.appliedJobs} icon="📨" color="yellow" />
                <StatCard label="Offers" value={stats?.offerJobs} icon="🎉" color="green" />
              </div>

              {/* Recent Users */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl overflow-hidden mb-6"
              >
                <div className="px-4 md:px-6 py-3 md:py-4 border-b border-white/10">
                  <h2 className="text-sm font-semibold text-white">Recent Users</h2>
                </div>
                <div className="divide-y divide-white/5">
                  {users.slice(0, 5).map((u, index) => (
                    <motion.div
                      key={u._id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="flex flex-col sm:flex-row sm:items-center justify-between px-4 md:px-6 py-3 hover:bg-white/5 transition-colors gap-2"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-8 h-8 bg-gradient-to-br from-indigo-500/30 to-indigo-600/20 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                          {u.name?.[0]?.toUpperCase() || 'U'}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-white truncate">{u.name}</p>
                          <p className="text-xs text-white/40 truncate">{u.email}</p>
                        </div>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded-full border font-medium self-start sm:self-center ${
                        u.role === 'admin' 
                          ? 'bg-purple-500/20 text-purple-400 border-purple-500/30' 
                          : 'bg-blue-500/20 text-blue-400 border-blue-500/30'
                      }`}>
                        {u.role}
                      </span>
                    </motion.div>
                  ))}
                </div>
              </motion.div>

              {/* Recent Jobs */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl overflow-hidden"
              >
                <div className="px-4 md:px-6 py-3 md:py-4 border-b border-white/10">
                  <h2 className="text-sm font-semibold text-white">Recent Job Applications</h2>
                </div>
                <div className="divide-y divide-white/5">
                  {jobs.slice(0, 5).map((j, index) => (
                    <motion.div
                      key={j._id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="flex flex-col sm:flex-row sm:items-center justify-between px-4 md:px-6 py-3 hover:bg-white/5 transition-colors gap-2"
                    >
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-white truncate">{j.company} — {j.role}</p>
                        <p className="text-xs text-white/40 truncate">{j.user?.name} ({j.user?.email})</p>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded-full border font-medium self-start sm:self-center ${
                        j.status === 'offer' ? 'bg-green-500/20 text-green-400 border-green-500/30' :
                        j.status === 'interview' ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' :
                        j.status === 'rejected' ? 'bg-red-500/20 text-red-400 border-red-500/30' :
                        'bg-blue-500/20 text-blue-400 border-blue-500/30'
                      }`}>
                        {j.status}
                      </span>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </div>
          )}

          {/* Users Tab */}
          {activeTab === 'users' && (
            <div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 md:mb-8"
              >
                <h1 className="text-2xl md:text-3xl font-bold text-white">Users</h1>
                <p className="text-white/50 text-sm mt-1">{users.length} total users</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl overflow-hidden"
              >
                <div className="overflow-x-auto">
                  <div className="min-w-[600px]">
                    {users.map((u, index) => (
                      <motion.div
                        key={u._id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.03 }}
                        className="flex flex-col sm:flex-row sm:items-center justify-between px-4 md:px-6 py-4 hover:bg-white/5 transition-colors border-b border-white/5 last:border-0 gap-3"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500/30 to-indigo-600/20 flex items-center justify-center text-white font-bold border border-indigo-500/30 flex-shrink-0">
                            {u.name?.[0]?.toUpperCase() || 'U'}
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-white truncate">{u.name}</p>
                            <p className="text-xs text-white/40 truncate">{u.email}</p>
                            <p className="text-xs text-white/20 mt-0.5 hidden sm:block">
                              Joined {new Date(u.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 ml-12 sm:ml-0">
                          <span className={`text-xs px-2 py-1 rounded-full border font-medium ${
                            u.role === 'admin' 
                              ? 'bg-purple-500/20 text-purple-400 border-purple-500/30' 
                              : 'bg-blue-500/20 text-blue-400 border-blue-500/30'
                          }`}>
                            {u.role}
                          </span>
                          {u.role !== 'admin' && (
                            <button
                              onClick={() => handleDeleteUser(u._id)}
                              className="text-xs text-red-400 hover:text-red-300 transition px-2 py-1 rounded hover:bg-red-500/10"
                            >
                              Delete
                            </button>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </motion.div>
            </div>
          )}

          {/* Jobs Tab */}
          {activeTab === 'jobs' && (
            <div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 md:mb-8"
              >
                <h1 className="text-2xl md:text-3xl font-bold text-white">All Job Applications</h1>
                <p className="text-white/50 text-sm mt-1">{jobs.length} total applications</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl overflow-hidden"
              >
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[700px] text-sm">
                    <thead>
                      <tr className="border-b border-white/10">
                        <th className="text-left px-4 md:px-6 py-3 text-xs font-semibold text-white/40 uppercase tracking-wider">Company</th>
                        <th className="text-left px-4 md:px-6 py-3 text-xs font-semibold text-white/40 uppercase tracking-wider hidden sm:table-cell">Role</th>
                        <th className="text-left px-4 md:px-6 py-3 text-xs font-semibold text-white/40 uppercase tracking-wider hidden md:table-cell">User</th>
                        <th className="text-left px-4 md:px-6 py-3 text-xs font-semibold text-white/40 uppercase tracking-wider">Status</th>
                        <th className="text-left px-4 md:px-6 py-3 text-xs font-semibold text-white/40 uppercase tracking-wider hidden lg:table-cell">Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {jobs.map((j, index) => (
                        <motion.tr
                          key={j._id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.02 }}
                          className="hover:bg-white/5 transition-colors"
                        >
                          <td className="px-4 md:px-6 py-3 font-medium text-white">{j.company}</td>
                          <td className="px-4 md:px-6 py-3 text-white/60 hidden sm:table-cell">{j.role}</td>
                          <td className="px-4 md:px-6 py-3 text-white/40 text-xs hidden md:table-cell">{j.user?.name}</td>
                          <td className="px-4 md:px-6 py-3">
                            <span className={`text-xs px-2 py-1 rounded-full border font-medium ${
                              j.status === 'offer' ? 'bg-green-500/20 text-green-400 border-green-500/30' :
                              j.status === 'interview' ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' :
                              j.status === 'rejected' ? 'bg-red-500/20 text-red-400 border-red-500/30' :
                              'bg-blue-500/20 text-blue-400 border-blue-500/30'
                            }`}>
                              {j.status}
                            </span>
                          </td>
                          <td className="px-4 md:px-6 py-3 text-white/30 text-xs hidden lg:table-cell">
                            {new Date(j.createdAt).toLocaleDateString()}
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}