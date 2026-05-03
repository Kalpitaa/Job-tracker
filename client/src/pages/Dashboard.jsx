import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';
import StatCard from '../components/StatCard';
import StatusBadge from '../components/StatusBadge';
import api from '../api/axios';

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [recentJobs, setRecentJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/jobs/stats'),
      api.get('/jobs'),
    ]).then(([statsRes, jobsRes]) => {
      setStats(statsRes.data);
      setRecentJobs(jobsRes.data.slice(0, 5));
    }).finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <Layout>
        <div className="text-gray-400 text-sm">Loading...</div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-800">Dashboard</h1>
        <p className="text-gray-400 text-sm mt-1">Your job search at a glance</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        <StatCard label="Total"     value={stats?.total}     color="indigo" />
        <StatCard label="Applied"   value={stats?.applied}   color="blue"   />
        <StatCard label="Interview" value={stats?.interview} color="yellow" />
        <StatCard label="Offers"    value={stats?.offer}     color="green"  />
        <StatCard label="Rejected"  value={stats?.rejected}  color="red"    />
        <StatCard label="Saved"     value={stats?.saved}     color="gray"   />
      </div>

      {/* Recent applications */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
        <div className="flex justify-between items-center px-5 py-4 border-b border-gray-100">
          <h2 className="text-sm font-semibold text-gray-700">Recent Applications</h2>
          <Link to="/jobs" className="text-xs text-indigo-500 hover:underline">View all</Link>
        </div>

        {recentJobs.length === 0 ? (
          <div className="px-5 py-10 text-center text-gray-400 text-sm">
            No applications yet.{' '}
            <Link to="/jobs" className="text-indigo-500 hover:underline">Add your first job</Link>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {recentJobs.map(job => (
              <div key={job._id} className="flex items-center justify-between px-5 py-3">
                <div>
                  <p className="text-sm font-medium text-gray-700">{job.company}</p>
                  <p className="text-xs text-gray-400">{job.role}</p>
                </div>
                <StatusBadge status={job.status} />
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}