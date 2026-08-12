export default function StatusBadge({ status }) {
  const statusColors = {
    saved: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
    applied: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    interview: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    offer: 'bg-green-500/20 text-green-400 border-green-500/30',
    rejected: 'bg-red-500/20 text-red-400 border-red-500/30',
  };

  const statusMap = {
    saved: 'Saved',
    applied: 'Applied',
    interview: 'Interview',
    offer: 'Offer',
    rejected: 'Rejected',
  };

  return (
    <span className={`px-3 py-1 text-xs font-medium rounded-full border ${statusColors[status] || statusColors.saved}`}>
      {statusMap[status] || status}
    </span>
  );
}