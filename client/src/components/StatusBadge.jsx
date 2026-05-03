const STATUS_STYLES = {
  saved:     'bg-gray-100 text-gray-600',
  applied:   'bg-blue-100 text-blue-700',
  interview: 'bg-yellow-100 text-yellow-700',
  offer:     'bg-green-100 text-green-700',
  rejected:  'bg-red-100 text-red-700',
};

export default function StatusBadge({ status }) {
  return (
    <span className={`text-xs font-medium px-2.5 py-1 rounded-full capitalize ${STATUS_STYLES[status] || STATUS_STYLES.applied}`}>
      {status}
    </span>
  );
}