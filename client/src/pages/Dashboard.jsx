import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

// Custom StatCard component
const StatCard = ({ label, value, icon, color, progress, target }) => {
  const colors = {
    indigo: 'from-indigo-500/20 to-indigo-600/10 border-indigo-500/30 text-indigo-400',
    blue: 'from-blue-500/20 to-blue-600/10 border-blue-500/30 text-blue-400',
    yellow: 'from-yellow-500/20 to-yellow-600/10 border-yellow-500/30 text-yellow-400',
    green: 'from-green-500/20 to-green-600/10 border-green-500/30 text-green-400',
    red: 'from-red-500/20 to-red-600/10 border-red-500/30 text-red-400',
    gray: 'from-gray-500/20 to-gray-600/10 border-gray-500/30 text-gray-400',
    purple: 'from-purple-500/20 to-purple-600/10 border-purple-500/30 text-purple-400',
  };

  return (
    <motion.div
      whileHover={{ scale: 1.05, y: -5 }}
      className={`bg-gradient-to-br ${colors[color]} border backdrop-blur-sm rounded-xl p-4 text-center transition-all duration-300`}
    >
      <div className="text-2xl mb-1">{icon}</div>
      <div className="text-2xl font-bold text-white">{value || 0}</div>
      <div className="text-xs text-white/50 mt-1">{label}</div>
      {progress !== undefined && target > 0 && (
        <div className="mt-2">
          <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${Math.min((progress / target) * 100, 100)}%` }}
              transition={{ duration: 0.8 }}
              className={`h-full rounded-full ${
                progress >= target ? 'bg-green-500' : 'bg-indigo-500'
              }`}
            />
          </div>
          <div className="text-[10px] text-white/30 mt-1">
            {progress}/{target} this week
          </div>
        </div>
      )}
    </motion.div>
  );
};

// Status Badge
const StatusBadge = ({ status }) => {
  const statusColors = {
    applied: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    interview: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    offer: 'bg-green-500/20 text-green-400 border-green-500/30',
    rejected: 'bg-red-500/20 text-red-400 border-red-500/30',
    saved: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
  };

  return (
    <span className={`px-3 py-1 text-xs font-medium rounded-full border ${statusColors[status] || statusColors.saved}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
};

// Activity Feed Item
const ActivityItem = ({ activity }) => {
  const icons = {
    applied: '📤',
    interview: '🎯',
    offer: '🎉',
    rejected: '❌',
    saved: '⭐',
    status_change: '🔄',
  };

  return (
    <div className="flex items-start gap-3 py-3 border-b border-white/5 last:border-0">
      <div className="text-lg">{icons[activity.type] || '📌'}</div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-white/80">
          <span className="font-medium text-white">{activity.company}</span>
          {' '}- {activity.role}
        </p>
        <p className="text-xs text-white/40">{activity.description}</p>
      </div>
      <span className="text-xs text-white/30 whitespace-nowrap">
        {new Date(activity.date).toLocaleDateString()}
      </span>
    </div>
  );
};

// Quick Action Button
const QuickAction = ({ icon, label, color, onClick }) => (
  <motion.button
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.95 }}
    onClick={onClick}
    className={`flex flex-col items-center gap-2 p-4 rounded-xl bg-gradient-to-br ${color} border backdrop-blur-sm hover:shadow-lg transition-all duration-300 flex-1 min-w-[80px]`}
  >
    <span className="text-2xl">{icon}</span>
    <span className="text-xs text-white/80 font-medium">{label}</span>
  </motion.button>
);

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [recentJobs, setRecentJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [weeklyGoal, setWeeklyGoal] = useState(5);
  const [activities, setActivities] = useState([]);
  const [upcomingInterviews, setUpcomingInterviews] = useState([]);
  const [weeklyData, setWeeklyData] = useState([]);
  const [responseRate, setResponseRate] = useState({ rate: 0, total: 0, responses: 0 });
  const { user } = useAuth();

  useEffect(() => {
    // Load weekly goal from localStorage
    const savedGoal = localStorage.getItem('weeklyGoal');
    if (savedGoal) {
      setWeeklyGoal(parseInt(savedGoal));
    }

    Promise.all([
      api.get('/jobs/stats'),
      api.get('/jobs'),
    ]).then(([statsRes, jobsRes]) => {
      const jobs = jobsRes.data;
      setStats(statsRes.data);
      setRecentJobs(jobs.slice(0, 5));

      // Generate activities from recent jobs
      const activitiesData = jobs.slice(0, 10).map(job => ({
        type: job.status,
        company: job.company,
        role: job.role,
        description: `Application ${job.status}`,
        date: job.appliedDate || job.createdAt,
      }));
      setActivities(activitiesData);

      // Get upcoming interviews
      const interviews = jobs
        .filter(job => job.status === 'interview' && job.followUp)
        .slice(0, 5)
        .map(job => ({
          ...job,
          interviewDate: job.followUp,
        }));
      setUpcomingInterviews(interviews);

      // Calculate response rate (interviews + offers vs total applied)
      const applied = jobs.filter(j => j.status === 'applied' || j.status === 'interview' || j.status === 'offer').length;
      const responses = jobs.filter(j => j.status === 'interview' || j.status === 'offer').length;
      setResponseRate({
        rate: applied > 0 ? Math.round((responses / applied) * 100) : 0,
        total: applied,
        responses: responses,
      });

      // Generate weekly data (last 4 weeks)
      const weeks = [];
      for (let i = 3; i >= 0; i--) {
        const weekStart = new Date();
        weekStart.setDate(weekStart.getDate() - (i * 7 + weekStart.getDay()));
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekEnd.getDate() + 6);
        
        const count = jobs.filter(job => {
          const date = new Date(job.appliedDate || job.createdAt);
          return date >= weekStart && date <= weekEnd;
        }).length;
        
        weeks.push({
          label: `Week ${4 - i}`,
          applications: count,
        });
      }
      setWeeklyData(weeks);
    }).finally(() => setLoading(false));
  }, []);

  // Update weekly goal
  const updateGoal = (newGoal) => {
    setWeeklyGoal(newGoal);
    localStorage.setItem('weeklyGoal', newGoal.toString());
  };

  // Calculate current week applications
  const getCurrentWeekApplications = () => {
    const now = new Date();
    const weekStart = new Date(now);
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());
    return recentJobs.filter(job => {
      const date = new Date(job.appliedDate || job.createdAt);
      return date >= weekStart;
    }).length;
  };

  const currentWeekApps = getCurrentWeekApplications();

  // Status data for chart
  const statusData = [
    { label: 'Applied', value: stats?.applied || 0, color: 'bg-blue-500' },
    { label: 'Interview', value: stats?.interview || 0, color: 'bg-yellow-500' },
    { label: 'Offers', value: stats?.offer || 0, color: 'bg-green-500' },
    { label: 'Rejected', value: stats?.rejected || 0, color: 'bg-red-500' },
    { label: 'Saved', value: stats?.saved || 0, color: 'bg-gray-500' },
  ];

  const maxValue = Math.max(...statusData.map(d => d.value), 1);

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-white/50 text-sm">Loading your dashboard...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
        >
          <div>
            <h1 className="text-3xl font-bold text-white">
              Welcome back, {user?.email?.split('@')[0] || 'User'} 
            </h1>
            <p className="text-white/50 text-sm mt-1">
              Here's what's happening with your job search
            </p>
          </div>
          <div className="flex gap-2">
            <Link to="/jobs">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold rounded-xl transition shadow-lg shadow-indigo-900/50 flex items-center gap-2"
              >
                <span>+</span> Add New Job
              </motion.button>
            </Link>
          </div>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="grid grid-cols-3 md:grid-cols-5 gap-3"
        >
          <QuickAction
            icon="📤"
            label="Add Job"
            color="from-blue-500/20 to-blue-600/10 border-blue-500/30"
            onClick={() => window.location.href = '/jobs'}
          />
          <QuickAction
            icon="📄"
            label="Resume AI"
            color="from-indigo-500/20 to-indigo-600/10 border-indigo-500/30"
            onClick={() => window.location.href = '/resume-ai'}
          />
          <QuickAction
            icon="✉️"
            label="Cover Letter"
            color="from-purple-500/20 to-purple-600/10 border-purple-500/30"
            onClick={() => window.location.href = '/cover-letter'}
          />
          <QuickAction
            icon="📊"
            label="Analytics"
            color="from-green-500/20 to-green-600/10 border-green-500/30"
            onClick={() => {}}
          />
          <QuickAction
            icon="🎯"
            label="Interviews"
            color="from-yellow-500/20 to-yellow-600/10 border-yellow-500/30"
            onClick={() => {}}
          />
        </motion.div>

        {/* Stats Grid with Progress Bars */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4"
        >
          <StatCard 
            label="Total" 
            value={stats?.total} 
            icon="📊" 
            color="indigo"
            progress={currentWeekApps}
            target={weeklyGoal}
          />
          <StatCard label="Applied" value={stats?.applied} icon="📤" color="blue" />
          <StatCard label="Interview" value={stats?.interview} icon="🎯" color="yellow" />
          <StatCard label="Offers" value={stats?.offer} icon="🎉" color="green" />
          <StatCard label="Rejected" value={stats?.rejected} icon="❌" color="red" />
          <StatCard label="Response Rate" value={`${responseRate.rate}%`} icon="📈" color="purple" />
        </motion.div>

        {/* Weekly Goal Setting */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-4 flex items-center justify-between flex-wrap gap-4"
        >
          <div className="flex items-center gap-4">
            <span className="text-sm text-white/60">🎯 Weekly Goal:</span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => updateGoal(Math.max(1, weeklyGoal - 1))}
                className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 text-white/60 hover:text-white transition"
              >
                -
              </button>
              <span className="text-white font-bold text-lg min-w-[30px] text-center">{weeklyGoal}</span>
              <button
                onClick={() => updateGoal(weeklyGoal + 1)}
                className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 text-white/60 hover:text-white transition"
              >
                +
              </button>
            </div>
            <span className="text-xs text-white/30">applications/week</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-sm">
              <span className="text-white/60">Progress: </span>
              <span className={`font-bold ${currentWeekApps >= weeklyGoal ? 'text-green-400' : 'text-yellow-400'}`}>
                {currentWeekApps}/{weeklyGoal}
              </span>
            </div>
            <div className="w-32 h-2 bg-white/10 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${Math.min((currentWeekApps / weeklyGoal) * 100, 100)}%` }}
                transition={{ duration: 0.8 }}
                className={`h-full rounded-full ${
                  currentWeekApps >= weeklyGoal ? 'bg-green-500' : 'bg-indigo-500'
                }`}
              />
            </div>
          </div>
        </motion.div>

        {/* Charts and Activity Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Status Distribution Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-1 bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6"
          >
            <h3 className="text-sm font-semibold text-white mb-4">Application Status</h3>
            <div className="space-y-3">
              {statusData.map((item) => (
                <div key={item.label}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-white/60">{item.label}</span>
                    <span className="text-white/80 font-medium">{item.value}</span>
                  </div>
                  <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${(item.value / maxValue) * 100}%` }}
                      transition={{ duration: 0.8, delay: 0.3 }}
                      className={`h-full ${item.color} rounded-full`}
                    />
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Weekly Trend Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="lg:col-span-1 bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6"
          >
            <h3 className="text-sm font-semibold text-white mb-4">Weekly Applications</h3>
            <div className="flex items-end justify-between h-32 gap-2">
              {weeklyData.map((week, index) => (
                <div key={index} className="flex-1 flex flex-col items-center gap-1">
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: `${(week.applications / Math.max(...weeklyData.map(w => w.applications), 1)) * 100}%` }}
                    transition={{ duration: 0.8, delay: index * 0.1 }}
                    className="w-full max-w-[40px] bg-gradient-to-t from-indigo-500/50 to-indigo-400 rounded-lg"
                    style={{ height: `${(week.applications / Math.max(...weeklyData.map(w => w.applications), 1)) * 100}%` }}
                  />
                  <span className="text-[10px] text-white/30">{week.label}</span>
                  <span className="text-[10px] text-white/50">{week.applications}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Quick Stats & Response Rate */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="lg:col-span-1 bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6"
          >
            <h3 className="text-sm font-semibold text-white mb-4">Quick Overview</h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="text-center p-3 bg-white/5 rounded-xl border border-white/5">
                <div className="text-2xl font-bold text-indigo-400">{stats?.total || 0}</div>
                <div className="text-xs text-white/40 mt-1">Total Apps</div>
              </div>
              <div className="text-center p-3 bg-white/5 rounded-xl border border-white/5">
                <div className="text-2xl font-bold text-green-400">{stats?.offer || 0}</div>
                <div className="text-xs text-white/40 mt-1">Offers</div>
              </div>
              <div className="text-center p-3 bg-white/5 rounded-xl border border-white/5">
                <div className="text-2xl font-bold text-yellow-400">{stats?.interview || 0}</div>
                <div className="text-xs text-white/40 mt-1">Interviews</div>
              </div>
              <div className="text-center p-3 bg-white/5 rounded-xl border border-white/5">
                <div className="text-2xl font-bold text-purple-400">{responseRate.rate}%</div>
                <div className="text-xs text-white/40 mt-1">Response Rate</div>
              </div>
            </div>
            <div className="mt-3 p-3 bg-white/5 rounded-xl border border-white/5">
              <p className="text-xs text-white/40 text-center">
                {responseRate.responses} responses out of {responseRate.total} applications
              </p>
            </div>
          </motion.div>
        </div>

        {/* Upcoming Interviews & Activity Feed */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Upcoming Interviews */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6"
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-semibold text-white">📅 Upcoming Interviews</h3>
              {upcomingInterviews.length > 0 && (
                <span className="text-xs text-white/30">{upcomingInterviews.length} scheduled</span>
              )}
            </div>
            {upcomingInterviews.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-3xl mb-2">🎯</p>
                <p className="text-white/40 text-sm">No upcoming interviews</p>
                <p className="text-white/20 text-xs mt-1">Keep applying!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {upcomingInterviews.map((interview, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5"
                  >
                    <div>
                      <p className="text-sm font-medium text-white">{interview.company}</p>
                      <p className="text-xs text-white/40">{interview.role}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-yellow-400 font-medium">
                        {new Date(interview.interviewDate).toLocaleDateString()}
                      </p>
                      <p className="text-[10px] text-white/30">
                        {new Date(interview.interviewDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>

          {/* Activity Feed */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6"
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-semibold text-white">📋 Recent Activity</h3>
              <span className="text-xs text-white/30">Last {activities.length} updates</span>
            </div>
            {activities.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-3xl mb-2">📭</p>
                <p className="text-white/40 text-sm">No activity yet</p>
              </div>
            ) : (
              <div className="max-h-64 overflow-y-auto pr-2 custom-scrollbar">
                {activities.map((activity, index) => (
                  <ActivityItem key={index} activity={activity} />
                ))}
              </div>
            )}
          </motion.div>
        </div>

        {/* Recent Applications */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
          className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl overflow-hidden"
        >
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 px-6 py-4 border-b border-white/10">
            <div>
              <h2 className="text-sm font-semibold text-white">Recent Applications</h2>
              <p className="text-xs text-white/40">Your latest job applications</p>
            </div>
            <Link to="/jobs">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="text-xs text-indigo-400 hover:text-indigo-300 font-medium transition"
              >
                View all →
              </motion.button>
            </Link>
          </div>

          {recentJobs.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <div className="text-5xl mb-4">📭</div>
              <p className="text-white/40 text-sm">No applications yet.</p>
              <Link to="/jobs" className="text-indigo-400 hover:text-indigo-300 text-sm font-medium transition">
                Add your first job →
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-white/5">
              {recentJobs.map((job, index) => (
                <motion.div
                  key={job._id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="flex items-center justify-between px-6 py-4 hover:bg-white/5 transition-colors duration-200"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500/20 to-indigo-600/10 border border-indigo-500/30 flex items-center justify-center text-lg">
                      {job.company?.charAt(0) || '🏢'}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">{job.company}</p>
                      <p className="text-xs text-white/40">{job.role}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-white/30 hidden sm:block">
                      {new Date(job.createdAt).toLocaleDateString()}
                    </span>
                    <StatusBadge status={job.status} />
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Scrollbar styles */}
        <style jsx>{`
          .custom-scrollbar::-webkit-scrollbar {
            width: 4px;
          }
          .custom-scrollbar::-webkit-scrollbar-track {
            background: rgba(255, 255, 255, 0.05);
            border-radius: 10px;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb {
            background: rgba(255, 255, 255, 0.15);
            border-radius: 10px;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb:hover {
            background: rgba(255, 255, 255, 0.25);
          }
        `}</style>
      </div>
    </Layout>
  );
}