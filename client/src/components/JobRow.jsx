import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import StatusBadge from './StatusBadge';
import PriorityBadge from './PriorityBadge';
import RatingStars from './RatingStars';
import api from '../api/axios';

const STATUSES = ['saved', 'applied', 'interview', 'offer', 'rejected'];
const PRIORITIES = ['low', 'medium', 'high'];

export default function JobRow({ job, onUpdate, onDelete }) {
  const [editing, setEditing] = useState(false);
  const [status, setStatus] = useState(job.status);
  const [priority, setPriority] = useState(job.priority || 'medium');
  const [loading, setLoading] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  //  Only sync when job prop changes AND not in editing mode
  useEffect(() => {
    if (!editing) {
      setStatus(job.status);
      setPriority(job.priority || 'medium');
    }
  }, [job, editing]);

  const handleStatusChange = async (e) => {
    const newStatus = e.target.value;
    setStatus(newStatus);
    setLoading(true);
    try {
      const res = await api.put(`/jobs/${job._id}`, { ...job, status: newStatus });
      onUpdate(res.data);
      setStatus(res.data.status);
    } catch (err) {
      console.error(err);
      setStatus(job.status);
    } finally {
      setLoading(false);
    }
  };

  const handlePriorityChange = (e) => {
    const newPriority = e.target.value;
    setPriority(newPriority);
  };

  //  Handle Done button - save both status and priority
  const handleDone = async () => {
    setLoading(true);
    try {
      const updatedData = { 
        ...job, 
        status: status, 
        priority: priority 
      };
      const res = await api.put(`/jobs/${job._id}`, updatedData);
      onUpdate(res.data);
      setEditing(false);
      //  Update local state with the response
      setStatus(res.data.status);
      setPriority(res.data.priority || 'medium');
    } catch (err) {
      console.error(err);
      // Revert on error
      setStatus(job.status);
      setPriority(job.priority || 'medium');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Delete this job?')) return;
    try {
      await api.delete(`/jobs/${job._id}`);
      onDelete(job._id);
    } catch (err) {
      console.error(err);
    }
  };

  // Check if deadline is approaching (within 7 days)
  const isDeadlineApproaching = () => {
    if (!job.deadline) return false;
    const deadline = new Date(job.deadline);
    const today = new Date();
    const diffTime = deadline - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 7 && diffDays >= 0;
  };

  // Check if follow-up is due
  const isFollowUpDue = () => {
    if (!job.followUp) return false;
    const followUp = new Date(job.followUp);
    const today = new Date();
    return followUp <= today;
  };

  return (
    <motion.tr 
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="border-b border-white/5 hover:bg-white/5 transition-colors duration-200"
    >
      {/* Company */}
      <td className="px-4 py-3 whitespace-nowrap">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500/20 to-indigo-600/10 border border-indigo-500/30 flex items-center justify-center text-sm flex-shrink-0">
            <span className="text-white">{job.company?.charAt(0) || '🏢'}</span>
          </div>
          <div>
            <p className="text-sm font-medium text-white truncate max-w-[100px]">{job.company}</p>
            {job.rating > 0 && <RatingStars rating={job.rating} size="small" />}
          </div>
        </div>
      </td>

      {/* Role */}
      <td className="px-4 py-3 whitespace-nowrap">
        <p className="text-sm text-white/80 truncate max-w-[100px]">{job.role}</p>
        <span className="text-xs text-white/30">{job.location || 'Remote'}</span>
      </td>

      {/* Status */}
      <td className="px-4 py-3 whitespace-nowrap">
        {editing ? (
          <select
            value={status}
            onChange={handleStatusChange}
            disabled={loading}
            className="bg-white/10 border border-white/10 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            {STATUSES.map(s => (
              <option key={s} value={s} className="bg-slate-800 text-white">
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </option>
            ))}
          </select>
        ) : (
          <StatusBadge status={status} />
        )}
      </td>

      {/* Priority */}
      <td className="px-4 py-3 whitespace-nowrap hidden lg:table-cell">
        {editing ? (
          <select
            value={priority}
            onChange={handlePriorityChange}
            disabled={loading}
            className="bg-white/10 border border-white/10 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            {PRIORITIES.map(p => (
              <option key={p} value={p} className="bg-slate-800 text-white">
                {p.charAt(0).toUpperCase() + p.slice(1)}
              </option>
            ))}
          </select>
        ) : (
          <PriorityBadge priority={priority} />
        )}
      </td>

      {/* Date */}
      <td className="px-4 py-3 whitespace-nowrap hidden md:table-cell">
        <p className="text-sm text-white/60">
          {new Date(job.appliedDate || job.createdAt).toLocaleDateString()}
        </p>
        {job.deadline && (
          <p className={`text-xs ${isDeadlineApproaching() ? 'text-red-400' : 'text-white/30'}`}>
            Deadline: {new Date(job.deadline).toLocaleDateString()}
            {isDeadlineApproaching() && ' ⚠️'}
          </p>
        )}
        {job.followUp && isFollowUpDue() && (
          <p className="text-xs text-yellow-400">Follow-up due 📅</p>
        )}
      </td>

      {/* Salary */}
      <td className="px-4 py-3 whitespace-nowrap hidden lg:table-cell">
        {job.salaryMin && job.salaryMax ? (
          <p className="text-sm text-white/60">
            ${job.salaryMin.toLocaleString()} - ${job.salaryMax.toLocaleString()}
          </p>
        ) : (
          <span className="text-white/30 text-sm">—</span>
        )}
      </td>

      {/* Actions */}
      <td className="px-4 py-3 whitespace-nowrap">
        <div className="flex items-center justify-center gap-2">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setShowDetails(!showDetails)}
            className="px-2 py-1 text-xs font-medium text-blue-400 hover:text-blue-300 transition rounded"
          >
            Details
          </motion.button>
          {editing ? (
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleDone}
              disabled={loading}
              className="px-2 py-1 text-xs font-medium text-green-400 hover:text-green-300 transition rounded"
            >
              {loading ? 'Saving...' : 'Done'}
            </motion.button>
          ) : (
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => {
                setEditing(true);
                setStatus(job.status);
                setPriority(job.priority || 'medium');
              }}
              className="px-2 py-1 text-xs font-medium text-indigo-400 hover:text-indigo-300 transition rounded"
            >
              Edit
            </motion.button>
          )}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleDelete}
            className="px-2 py-1 text-xs font-medium text-red-400 hover:text-red-300 transition rounded"
          >
            Delete
          </motion.button>
        </div>
        {showDetails && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-2 p-3 bg-white/5 rounded-lg text-xs text-white/60 space-y-1"
          >
            <p>📍 {job.location || 'Not specified'}</p>
            {job.notes && <p> {job.notes}</p>}
            {job.jobUrl && (
              <a href={job.jobUrl} target="_blank" rel="noreferrer" className="text-indigo-400 hover:text-indigo-300 block">
                🔗 View Job Posting
              </a>
            )}
          </motion.div>
        )}
      </td>
    </motion.tr>
  );
}