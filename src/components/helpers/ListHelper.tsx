import React, { useEffect, useMemo, useRef, useState } from 'react';
import { X, RefreshCw, ArrowUp, ArrowDown } from 'lucide-react';
import { useQuery, useInfiniteQuery } from '@tanstack/react-query';
import { sigmatiqTheme } from '../../styles/sigmatiq-theme';
import { api } from '../../api/client';
import ClickableEntity from '../ClickableEntity';

type HelperKind = 'movers' | 'watchlist' | 'opportunities';

interface ListHelperProps {
  context?: {
    kind: HelperKind;
    params?: any;
  };
  onClose: () => void;
  onAction?: (action: string, data?: any) => void;
}

const PAGE_SIZE = 20;
// Backend enforces limit <= 20 for movers; keep MAX_LIMIT for other lists
const MOVERS_API_LIMIT = 20;
const MAX_LIMIT = 200;

const ListHelper: React.FC<ListHelperProps> = ({ context, onClose, onAction }) => {
  const kind: HelperKind = (context?.kind || 'movers') as HelperKind;
  const [page, setPage] = useState(1);
  const [direction, setDirection] = useState<'gainers'|'losers'|'both'>(context?.params?.direction || 'both');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  // Manual refresh token to force re-fetch and enable server force_refresh
  const [refreshToken, setRefreshToken] = useState(0);
  // User-controlled sorting
  type SortKey = 'change' | 'abs_change' | 'price' | 'symbol';
  const [sortKey, setSortKey] = useState<SortKey>(() => (direction === 'both' ? 'abs_change' : 'change'));
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>(() => (direction === 'losers' ? 'asc' : 'desc'));

  // Fetchers per kind
  // Infinite movers (gainers/losers/both). Backend supports limit; we grow limit progressively.
  const moversQuery = useInfiniteQuery({
    queryKey: ['listHelper', 'movers', direction, refreshToken],
    queryFn: async ({ pageParam = PAGE_SIZE }) => {
      // Server validates limit <= 20 -> cap to MOVERS_API_LIMIT
      const limit = Math.min(Number(pageParam) || PAGE_SIZE, MOVERS_API_LIMIT);
      const res = await api.screener.getTopMovers({ direction, limit, include_otc: false, force_refresh: refreshToken > 0 });
      return { limit, data: res };
    },
    initialPageParam: PAGE_SIZE,
    getNextPageParam: (lastPage) => {
      const { limit, data } = lastPage || {} as any;
      const gLen = data?.gainers?.length || 0;
      const lLen = data?.losers?.length || 0;
      const combined = direction === 'gainers' ? gLen : direction === 'losers' ? lLen : (gLen + lLen);
      // Backend caps limit; do not paginate beyond the first page
      if ((limit || 0) >= MOVERS_API_LIMIT) return undefined;
      const next = Math.min(Number(limit || PAGE_SIZE) + PAGE_SIZE, MOVERS_API_LIMIT);
      // Heuristic: if combined < limit, backend returned fewer than requested → no more
      if (combined < (limit || PAGE_SIZE)) return undefined;
      return next;
    },
    enabled: kind === 'movers',
    staleTime: 60000,
  });

  const watchlistQuery = useQuery({
    queryKey: ['listHelper', 'watchlist', context?.params?.watchlistId || 'default', context?.params?.detail || 'full'],
    queryFn: async () => {
      let watchlistId = context?.params?.watchlistId as string | undefined;
      if (!watchlistId) {
        try {
          const lists = await api.watchlists.list();
          const def = lists.find((w: any) => w.is_default) || lists[0];
          watchlistId = def?.watchlist_id;
        } catch {}
      }
      if (!watchlistId) return { symbols: [] };
      const snapshot = await api.watchlists.getSnapshot(watchlistId, false);
      return snapshot || { symbols: [] };
    },
    enabled: kind === 'watchlist',
    staleTime: 60000,
  });

  const oppsQuery = useQuery({
    queryKey: ['listHelper', 'opportunities'],
    queryFn: async () => {
      const r = await api.assistant.ask('day trading opportunities with high RVOL', 'analysis');
      // Try various shapes
      const arr = r?.preview?.opportunities || r?.opportunities || [];
      return Array.isArray(arr) ? arr : [];
    },
    enabled: kind === 'opportunities',
    staleTime: 120000,
  });

  // Merge/transform items
  const items = useMemo(() => {
    if (kind === 'movers') {
      const pages = moversQuery.data?.pages || [];
      // Use last page since each page grows the limit; but to be safe, take the last data set
      const last = pages[pages.length - 1]?.data || { gainers: [], losers: [] };
      const g = (last.gainers || []).slice();
      const l = (last.losers || []).slice();
      const base = direction === 'gainers' 
        ? g 
        : direction === 'losers' 
          ? l 
          : [...g, ...l];
      // Normalize fields and de-dup by symbol
      const mapped = base.map((it: any) => ({
        symbol: it.symbol,
        name: it.name,
        price: Number(it.price ?? it.last ?? 0),
        changePercent: Number(it.change_percent ?? it.changePercent ?? it.change ?? 0),
      }));
      const seen = new Set<string>();
      const deduped = mapped.filter((r) => (r.symbol && !seen.has(r.symbol) ? (seen.add(r.symbol), true) : false));
      // Apply sorting
      const value = (r: any) => {
        switch (sortKey) {
          case 'change': return r.changePercent || 0;
          case 'abs_change': return Math.abs(r.changePercent || 0);
          case 'price': return r.price || 0;
          case 'symbol': return r.symbol || '';
          default: return 0;
        }
      };
      const sorted = deduped.sort((a: any, b: any) => {
        const av = value(a);
        const bv = value(b);
        if (sortKey === 'symbol') {
          const cmp = String(av).localeCompare(String(bv));
          return sortDir === 'asc' ? cmp : -cmp;
        }
        const cmp = Number(av) - Number(bv);
        return sortDir === 'asc' ? cmp : -cmp;
      });
      return sorted;
    }
    if (kind === 'watchlist') {
      const syms = watchlistQuery.data?.symbols || [];
      return syms.map((s: any) => ({
        symbol: s.symbol,
        name: s.name,
        price: s.price,
        changePercent: s.change_percent ?? s.changePercent ?? s.change,
      }));
    }
    if (kind === 'opportunities') {
      return (oppsQuery.data || []).map((o: any) => ({
        symbol: Array.isArray(o.symbols) ? o.symbols[0] : o.symbol || '',
        name: o.type || 'Opportunity',
        price: undefined,
        changePercent: undefined,
        raw: o,
      }));
    }
    return [];
  }, [kind, moversQuery.data, watchlistQuery.data, oppsQuery.data, direction, sortKey, sortDir]);

  const totalPages = Math.max(1, Math.ceil((items?.length || 0) / PAGE_SIZE));
  const paged = useMemo(() => {
    if (kind === 'movers') return items; // show all loaded movers; infinite grows via backend limit
    return items.slice(0, visibleCount);
  }, [items, kind, visibleCount]);

  useEffect(() => {
    setPage(1);
    setVisibleCount(PAGE_SIZE);
    // Reset default sorting when switching movers direction
    if (kind === 'movers') {
      setSortKey(direction === 'both' ? 'abs_change' : 'change');
      setSortDir(direction === 'losers' ? 'asc' : 'desc');
    }
  }, [kind, direction]);

  const loading = moversQuery.isLoading || watchlistQuery.isLoading || oppsQuery.isLoading;
  const error = moversQuery.error || watchlistQuery.error || oppsQuery.error;
  const isFetchingMore = (kind === 'movers' && moversQuery.isFetching);

  // Pull-to-refresh support for the scroll container
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const [isPulling, setIsPulling] = useState(false);
  const [pullDist, setPullDist] = useState(0);
  const PULL_THRESHOLD = 60;
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    let startY = 0;
    let active = false;

    const onStart = (y: number) => {
      // Only start if scrolled to top
      if (el.scrollTop <= 0) {
        startY = y;
        active = true;
        setIsPulling(true);
        setPullDist(0);
      }
    };
    const onMove = (y: number) => {
      if (!active) return;
      const dy = Math.max(0, y - startY);
      // Apply dampening for nicer feel
      const dist = Math.min(120, dy * 0.5);
      setPullDist(dist);
    };
    const onEnd = async () => {
      if (!active) return;
      const shouldRefresh = pullDist >= PULL_THRESHOLD;
      // Reset visuals
      setIsPulling(false);
      setPullDist(0);
      active = false;
      if (shouldRefresh) {
        try { await onRefresh(); } catch {}
      }
    };

    const handleTouchStart = (e: TouchEvent) => onStart(e.touches[0].clientY);
    const handleTouchMove = (e: TouchEvent) => onMove(e.touches[0].clientY);
    const handleTouchEnd = () => onEnd();
    const handleMouseDown = (e: MouseEvent) => onStart(e.clientY);
    const handleMouseMove = (e: MouseEvent) => onMove(e.clientY);
    const handleMouseUp = () => onEnd();

    el.addEventListener('touchstart', handleTouchStart, { passive: true });
    el.addEventListener('touchmove', handleTouchMove, { passive: true });
    el.addEventListener('touchend', handleTouchEnd);
    el.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      el.removeEventListener('touchstart', handleTouchStart);
      el.removeEventListener('touchmove', handleTouchMove);
      el.removeEventListener('touchend', handleTouchEnd);
      el.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [kind, direction]);

  // IntersectionObserver to auto-load more (movers via backend; others via visibleCount)
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const obs = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          if (kind === 'movers') {
            if (moversQuery.hasNextPage && !moversQuery.isFetchingNextPage) {
              moversQuery.fetchNextPage();
            }
          } else {
            setVisibleCount((n) => Math.min(n + PAGE_SIZE, items.length));
          }
        }
      });
    }, { root: null, threshold: 0.1 });
    obs.observe(el);
    return () => obs.disconnect();
  }, [kind, moversQuery.hasNextPage, moversQuery.isFetchingNextPage, items.length]);

  const title = kind === 'movers'
    ? (direction === 'gainers' ? 'Top Gainers' : direction === 'losers' ? 'Top Losers' : 'Top Movers')
    : kind === 'watchlist'
      ? 'Watchlist'
      : 'Opportunities';

  const onRefresh = async () => {
    setIsRefreshing(true);
    try {
      if (kind === 'movers') {
        // Bump token to force refresh and bypass any caches
        setRefreshToken((t) => t + 1);
      }
      if (kind === 'watchlist') await watchlistQuery.refetch();
      if (kind === 'opportunities') await oppsQuery.refetch();
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <div className="h-full flex flex-col" style={{ backgroundColor: sigmatiqTheme.colors.background.secondary }}>
      {/* Header */}
      <div className="flex items-center justify-between p-4" style={{ borderBottom: `1px solid ${sigmatiqTheme.colors.border.default}` }}>
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-semibold" style={{ color: sigmatiqTheme.colors.text.primary }}>
            {title}
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={onRefresh} className="p-2 rounded" style={{ color: sigmatiqTheme.colors.text.secondary }}>
            <RefreshCw className={isRefreshing ? 'animate-spin' : ''} size={18} />
          </button>
          <button onClick={onClose} className="p-2 rounded" style={{ color: sigmatiqTheme.colors.text.secondary }}>
            <X size={18} />
          </button>
        </div>
      </div>

      {/* Controls row for movers: direction + sort buttons */}
      {kind === 'movers' && (
        <div className="px-4 py-2 flex items-center justify-between" style={{ borderBottom: `1px solid ${sigmatiqTheme.colors.border.default}` }}>
          <div className="flex items-center gap-2">
            {[{id:'gainers',label:'G'}, {id:'losers',label:'L'}, {id:'both',label:'ALL'}].map(({id,label}) => (
              <button key={id}
                onClick={() => setDirection(id as any)}
                className="px-2 py-1 rounded text-xs"
                style={{
                  backgroundColor: (direction === id) ? sigmatiqTheme.colors.primary.teal + '20' : 'transparent',
                  color: (direction === id) ? sigmatiqTheme.colors.primary.teal : sigmatiqTheme.colors.text.secondary,
                  border: `1px solid ${(direction === id) ? sigmatiqTheme.colors.primary.teal + '40' : sigmatiqTheme.colors.border.default}`
                }}>
                {label}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            {([{k:'change',label:'Chg%'}, ...(direction === 'both' ? [{k:'abs_change',label:'Abs%'}] : []), {k:'price',label:'Price'},{k:'symbol',label:'A→Z'}] as any[]).map(({k,label}: any) => (
              <button key={k}
                onClick={() => {
                  if (sortKey === k) {
                    setSortDir(d => d === 'asc' ? 'desc' : 'asc');
                  } else {
                    setSortKey(k);
                    setSortDir(k === 'symbol' ? 'asc' : 'desc');
                  }
                }}
                className="px-2 py-1 rounded text-xs flex items-center gap-1"
                style={{
                  backgroundColor: (sortKey === k) ? sigmatiqTheme.colors.primary.teal + '20' : 'transparent',
                  color: (sortKey === k) ? sigmatiqTheme.colors.primary.teal : sigmatiqTheme.colors.text.secondary,
                  border: `1px solid ${(sortKey === k) ? sigmatiqTheme.colors.primary.teal + '40' : sigmatiqTheme.colors.border.default}`
                }}
              >
                <span>{label}</span>
                {(sortKey === k) && (sortDir === 'asc' ? <ArrowUp size={14} /> : <ArrowDown size={14} />)}
              </button>
            ))}
            
          </div>
        </div>
      )}

      {/* Content */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4" style={{ overscrollBehavior: 'contain' }}>
        {/* Pull-to-refresh indicator */}
        <div style={{ height: pullDist, transition: isPulling ? 'none' : 'height 0.2s ease-out' }}>
          {isPulling && (
            <div className="flex items-center justify-center" style={{ color: sigmatiqTheme.colors.text.secondary }}>
              <RefreshCw className={pullDist >= PULL_THRESHOLD || isRefreshing ? 'animate-spin' : ''} size={16} />
              <span className="ml-2 text-xs">{pullDist >= PULL_THRESHOLD ? (isRefreshing ? 'Refreshing…' : 'Release to refresh') : 'Pull to refresh'}</span>
            </div>
          )}
        </div>
        {loading ? (
          <div className="flex items-center justify-center h-48" style={{ color: sigmatiqTheme.colors.text.secondary }}>Loading…</div>
        ) : error ? (
          <div className="p-4 rounded border" style={{ borderColor: sigmatiqTheme.colors.status.error + '60' }}>
            <div style={{ color: sigmatiqTheme.colors.status.error }}>Failed to load data.</div>
          </div>
        ) : paged.length === 0 ? (
          <div className="flex items-center justify-center h-48" style={{ color: sigmatiqTheme.colors.text.secondary }}>No items.</div>
        ) : (
          <div className="space-y-2">
            {paged.map((row: any, idx: number) => (
              <button key={idx}
                onClick={() => onAction?.('setHelper', { helper: 'stockInfo', symbol: row.symbol, source: 'list' })}
                className="w-full text-left p-3 rounded-lg border transition-all hover:translate-x-0.5"
                style={{ backgroundColor: sigmatiqTheme.colors.background.primary, borderColor: sigmatiqTheme.colors.border.default }}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ClickableEntity type="symbol" value={row.symbol} className="font-semibold">
                      {row.symbol}
                    </ClickableEntity>
                    {row.name && (
                      <span className="text-xs" style={{ color: sigmatiqTheme.colors.text.muted }}>{row.name}</span>
                    )}
                  </div>
                  <div className="text-right">
                    {typeof row.price === 'number' && (
                      <div className="text-sm" style={{ color: sigmatiqTheme.colors.text.primary }}>${row.price.toFixed(2)}</div>
                    )}
                    {typeof row.changePercent === 'number' && (
                      <div className="text-xs" style={{ color: (row.changePercent >= 0 ? sigmatiqTheme.colors.status.success : sigmatiqTheme.colors.status.error) }}>
                        {(row.changePercent >= 0 ? '+' : '')}{row.changePercent.toFixed(2)}%
                      </div>
                    )}
                  </div>
                </div>
              </button>
            ))}
            <div ref={sentinelRef} className="py-4 text-center" style={{ color: sigmatiqTheme.colors.text.muted }}>
              {kind === 'movers'
                ? (moversQuery.hasNextPage ? (isFetchingMore ? 'Loading more…' : 'Scroll to load more') : 'End of list')
                : (visibleCount < items.length ? 'Scroll to load more' : 'End of list')}
            </div>
          </div>
        )}
      </div>

      {/* Pagination removed; infinite scroll handles loading more */}
    </div>
  );
};

export default ListHelper;
