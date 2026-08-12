export default function RatingStars({ rating, size = 'small' }) {
  const starSize = size === 'small' ? 'text-xs' : 'text-sm';
  
  return (
    <div className={`flex items-center gap-0.5 ${starSize}`}>
      {[1, 2, 3, 4, 5].map((star) => (
        <span key={star} className={star <= rating ? 'text-yellow-400' : 'text-white/20'}>
          {star <= rating ? '★' : '☆'}
        </span>
      ))}
    </div>
  );
}