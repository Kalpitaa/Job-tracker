export default function PriorityBadge({ priority }) {
  //  Debug: Log the priority being received
  console.log('PriorityBadge received:', priority);
  
  const priorityColors = {
    high: 'bg-red-500/20 text-red-400 border-red-500/30',
    medium: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    low: 'bg-green-500/20 text-green-400 border-green-500/30',
  };

  const priorityMap = {
    high: '🔴 High',
    medium: '🟡 Medium',
    low: '🟢 Low',
  };

  return (
    <span className={`px-3 py-1 text-xs font-medium rounded-full border ${priorityColors[priority] || priorityColors.medium}`}>
      {priorityMap[priority] || priority}
    </span>
  );
}