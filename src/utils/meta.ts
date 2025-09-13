export type CacheMeta = {
  isCache?: boolean;
  cacheSource?: 'redis' | 'pg' | 'fresh' | string;
  namespace?: string;
  requestId?: string;
  stale?: boolean;
};

export const getMeta = (data: any): CacheMeta => {
  try {
    if (data && typeof data === 'object' && (data as any).__meta) {
      return (data as any).__meta as CacheMeta;
    }
  } catch {}
  return {};
};

