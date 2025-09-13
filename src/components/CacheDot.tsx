import React from 'react';
import type { CacheMeta } from '../utils/meta';

type Props = { meta?: CacheMeta; className?: string };

const colorClass = (src?: string, isCache?: boolean, stale?: boolean) => {
  if (stale) return 'bg-amber-500';
  if (!isCache) return 'bg-green-500';
  if (src === 'redis') return 'bg-purple-500';
  if (src === 'pg' || src === 'postgres' || src === 'postgresql') return 'bg-teal-500';
  return 'bg-slate-400';
};

const CacheDot: React.FC<Props> = ({ meta, className }) => {
  const src = (meta?.cacheSource || 'fresh') as string;
  const isCache = Boolean(meta?.isCache);
  const stale = Boolean((meta as any)?.stale);
  const title = isCache ? `Cached: ${src}${stale ? ' (stale)' : ''}` : 'Fresh';
  return (
    <span
      className={`inline-block w-2 h-2 rounded-full ${colorClass(src, isCache, stale)} ${className || ''}`}
      title={title}
      aria-label={title}
    />
  );
};

export default CacheDot;

