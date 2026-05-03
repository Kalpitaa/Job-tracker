import { useState } from 'react';
import StatusBadge from './StatusBadge';
import api from '../api/axios';

const STATUSES = ['saved', 'applied', 'interview', 'offer', 'rejected'];

export default function JobRow({ job, onUpdate, onDelete }) {
  const [editing, setEditing] = useState(false);
  const [status, setStatus] = useState(job.status);
  const [loading, setLoading] = useState(false);

  const handleStatusChange = async (e) => {
    const newStatus = e.target.value;
    setStatus(newStatus);
    setLoading(true);
    try {
      const res = await api.put(`/jobs/${job._id}`, { status: newStatus });
      onUpdate(res.data);
    } catch (err) {
      console.error(err);
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

  return (
    <tr className="border-b border-gray-50 hover:bg-gray-50 transition">
      <td className="px-4 py-3">
        <p className="text-sm font-medium text-gray-800">{job.company}</p>
      </td>
      <td className="px-4 py-3">
        <p className="text-sm text-gray-600">{job.role}</p>
      </td>
      <td className="px-4 py-3">
        {editing ? (
          <select
            value={status}
            onChange={handleStatusChange}
            disabled={loading}
            className="text-xs border border-gray-200 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            {STATUSES.map(s => (
              <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
            ))}
          </select>
        ) : (
          <StatusBadge status={status} />
        )}
      </td>
      <td className="px-4 py-3">
        <p className="text-sm text-gray-400">
          {new Date(job.appliedDate).toLocaleDateString()}
        </p>
      </td>
      <td className="px-4 py-3">
        {job.jobUrl && (
          <a
            href={job.jobUrl}
            target="_blank"
            rel="noreferrer"
            className="text-xs text-indigo-500 hover:underline"
          >
            View
          </a>
        )}
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setEditing(!editing)}
            className="text-xs text-indigo-500 hover:text-indigo-700"
          >
            {editing ? 'Done' : 'Edit'}
          </button>
          <button
            onClick={handleDelete}
            className="text-xs text-red-400 hover:text-red-600"
          >
            Delete
          </button>
        </div>
      </td>
    </tr>
  );
}