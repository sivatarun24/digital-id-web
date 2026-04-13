import './Skeleton.css';

/**
 * Shimmer skeleton placeholder — drop in wherever data is loading.
 *
 * Usage:
 *   <Skeleton width="100%" height={20} />
 *   <Skeleton variant="circle" width={48} height={48} />
 *   <Skeleton variant="text" lines={3} />
 */
export default function Skeleton({ variant = 'rect', width, height, lines = 1, style = {}, className = '' }) {
  if (variant === 'text') {
    return (
      <div className={`skeleton-text-group ${className}`} style={style}>
        {Array.from({ length: lines }).map((_, i) => (
          <div
            key={i}
            className="skeleton"
            style={{ width: i === lines - 1 && lines > 1 ? '70%' : '100%', height: 14 }}
          />
        ))}
      </div>
    );
  }

  return (
    <div
      className={`skeleton ${variant === 'circle' ? 'skeleton--circle' : ''} ${className}`}
      style={{ width, height, borderRadius: variant === 'circle' ? '50%' : undefined, ...style }}
    />
  );
}
