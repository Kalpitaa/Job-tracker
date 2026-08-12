import { useState } from 'react';
import { motion } from 'framer-motion';
import api from '../api/axios';

const STATUSES = ['saved', 'applied', 'interview', 'offer', 'rejected'];
const PRIORITIES = ['low', 'medium', 'high'];
const LOCATIONS = ['Remote', 'Hybrid', 'On-site', 'Flexible'];

const DEFAULT_FORM = {
  company: '',
  role: '',
  status: 'applied',
  priority: 'medium',
  location: 'Remote',
  salaryMin: '',
  salaryMax: '',
  jobUrl: '',
  jobDescription: '',
  notes: '',
  deadline: '',
  followUp: '',
  rating: 0,
};

export default function AddJobModal({ onClose, onAdd }) {
  const [form, setForm] = useState(DEFAULT_FORM);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setForm({ 
      ...form, 
      [name]: type === 'number' ? parseFloat(value) || 0 : value 
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await api.post('/jobs', form);
      onAdd(res.data);
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add job');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 px-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ duration: 0.3 }}
        className="bg-gradient-to-br from-slate-800 to-slate-900 border border-white/10 rounded-2xl shadow-2xl w-full max-w-2xl p-6 relative max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-center mb-5 sticky top-0 bg-slate-800/95 py-2 z-10">
          <div>
            <h2 className="text-xl font-bold text-white">Add New Job</h2>
            <p className="text-white/40 text-sm">Track a new application</p>
          </div>
          <button 
            onClick={onClose} 
            className="text-white/40 hover:text-white/60 transition text-xl"
          >
            ✕
          </button>
        </div>

        {error && (
          <div className="bg-red-500/20 border border-red-500/30 text-red-400 text-sm px-4 py-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Company & Role */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-white/60 mb-1">Company *</label>
              <input
                name="company"
                value={form.company}
                onChange={handleChange}
                required
                className="w-full bg-white/10 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                placeholder="Google"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-white/60 mb-1">Role *</label>
              <input
                name="role"
                value={form.role}
                onChange={handleChange}
                required
                className="w-full bg-white/10 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                placeholder="Frontend Developer"
              />
            </div>
          </div>

          {/* Status & Priority */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-white/60 mb-1">Status</label>
              <select
                name="status"
                value={form.status}
                onChange={handleChange}
                className="w-full bg-white/10 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
              >
                {STATUSES.map(s => (
                  <option key={s} value={s} className="bg-slate-800 text-white">
                    {s.charAt(0).toUpperCase() + s.slice(1)}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-white/60 mb-1">Priority</label>
              <select
                name="priority"
                value={form.priority}
                onChange={handleChange}
                className="w-full bg-white/10 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
              >
                {PRIORITIES.map(p => (
                  <option key={p} value={p} className="bg-slate-800 text-white">
                    {p.charAt(0).toUpperCase() + p.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Location & Rating */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-white/60 mb-1">Location</label>
              <select
                name="location"
                value={form.location}
                onChange={handleChange}
                className="w-full bg-white/10 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
              >
                {LOCATIONS.map(l => (
                  <option key={l} value={l} className="bg-slate-800 text-white">{l}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-white/60 mb-1">Company Rating</label>
              <select
                name="rating"
                value={form.rating}
                onChange={handleChange}
                className="w-full bg-white/10 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
              >
                {[0, 1, 2, 3, 4, 5].map(r => (
                  <option key={r} value={r} className="bg-slate-800 text-white">
                    {r === 0 ? 'Not rated' : `${r} ⭐`}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Salary Range */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-white/60 mb-1">Min Salary ($)</label>
              <input
                type="number"
                name="salaryMin"
                value={form.salaryMin}
                onChange={handleChange}
                className="w-full bg-white/10 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                placeholder="50000"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-white/60 mb-1">Max Salary ($)</label>
              <input
                type="number"
                name="salaryMax"
                value={form.salaryMax}
                onChange={handleChange}
                className="w-full bg-white/10 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                placeholder="80000"
              />
            </div>
          </div>

          {/* Deadlines */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-white/60 mb-1">Application Deadline</label>
              <input
                type="date"
                name="deadline"
                value={form.deadline}
                onChange={handleChange}
                className="w-full bg-white/10 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-white/60 mb-1">Follow-up Date</label>
              <input
                type="date"
                name="followUp"
                value={form.followUp}
                onChange={handleChange}
                className="w-full bg-white/10 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
              />
            </div>
          </div>

          {/* Job URL */}
          <div>
            <label className="block text-sm font-medium text-white/60 mb-1">Job URL</label>
            <input
              name="jobUrl"
              value={form.jobUrl}
              onChange={handleChange}
              className="w-full bg-white/10 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
              placeholder="https://..."
            />
          </div>

          {/* Job Description */}
          <div>
            <label className="block text-sm font-medium text-white/60 mb-1">Job Description</label>
            <textarea
              name="jobDescription"
              value={form.jobDescription}
              onChange={handleChange}
              rows={3}
              className="w-full bg-white/10 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition resize-none"
              placeholder="Paste the job description here..."
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-white/60 mb-1">Notes</label>
            <textarea
              name="notes"
              value={form.notes}
              onChange={handleChange}
              rows={2}
              className="w-full bg-white/10 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition resize-none"
              placeholder="Any personal notes..."
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-2 sticky bottom-0 bg-slate-800/95 py-3">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="button"
              onClick={onClose}
              className="flex-1 bg-white/5 border border-white/10 text-white/60 hover:text-white py-2.5 rounded-xl text-sm font-medium transition"
            >
              Cancel
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading}
              className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white py-2.5 rounded-xl text-sm font-semibold transition shadow-lg shadow-indigo-900/50 disabled:opacity-50"
            >
              {loading ? 'Adding...' : 'Add Job'}
            </motion.button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}