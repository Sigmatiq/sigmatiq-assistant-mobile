import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Calendar, Globe2 } from 'lucide-react';
import { sigmatiqTheme } from '../styles/sigmatiq-theme';
import { calendarApi } from '../api/client';
import CacheDot from './CacheDot';
import { getMeta } from '../utils/meta';

type Tab = 'economic' | 'holidays';

const todayISO = () => new Date().toISOString().slice(0, 10);

const CalendarCard: React.FC = () => {
  const [tab, setTab] = React.useState<Tab>('economic');
  const [date, setDate] = React.useState<string>(todayISO());
  const region = (import.meta.env.VITE_REGION || 'US');

  const economicQ = useQuery({
    queryKey: ['calendar', 'economic', date, region],
    queryFn: () => calendarApi.getEconomicCalendar({ date, region }),
    enabled: tab === 'economic',
    staleTime: 15 * 60 * 1000,
    refetchInterval: 15 * 60 * 1000,
  });

  const y = new Date(date);
  const holidaysQ = useQuery({
    queryKey: ['calendar', 'holidays', y.getFullYear(), y.getMonth() + 1, region],
    queryFn: () => calendarApi.getHolidays({ year: y.getFullYear(), month: y.getMonth() + 1, region }),
    enabled: tab === 'holidays',
    staleTime: 24 * 60 * 60 * 1000,
  });

  const buttons = [
    { id: 'economic', label: 'Economic' },
    { id: 'holidays', label: 'Holidays' },
  ] as const;

  const onJump = (deltaDays: number) => {
    const d = new Date(date);
    d.setDate(d.getDate() + deltaDays);
    setDate(d.toISOString().slice(0, 10));
  };

  const header = (
    <div className="flex items-center justify-between mb-3">
      <div className="flex items-center gap-2">
        <Calendar size={16} />
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="text-sm px-2 py-1 rounded border"
          style={{ borderColor: sigmatiqTheme.colors.border.default, background: 'transparent', color: sigmatiqTheme.colors.text.primary }}
        />
        <button className="text-xs px-2 py-1 rounded border" style={{ borderColor: sigmatiqTheme.colors.border.default }} onClick={() => setDate(todayISO())}>Today</button>
        <button className="text-xs px-2 py-1 rounded border" style={{ borderColor: sigmatiqTheme.colors.border.default }} onClick={() => onJump(-1)}>Prev</button>
        <button className="text-xs px-2 py-1 rounded border" style={{ borderColor: sigmatiqTheme.colors.border.default }} onClick={() => onJump(1)}>Next</button>
      </div>
      <div className="flex items-center gap-1">
        <Globe2 size={14} />
        <span className="text-xs" style={{ color: sigmatiqTheme.colors.text.muted }}>{region}</span>
      </div>
    </div>
  );

  const tabRow = (
    <div className="flex items-center gap-2 mb-3">
      {buttons.map((b) => (
        <button key={b.id}
          onClick={() => setTab(b.id as Tab)}
          className="px-2 py-1 rounded text-xs"
          style={{
            backgroundColor: (tab === b.id) ? sigmatiqTheme.colors.primary.teal + '20' : 'transparent',
            color: (tab === b.id) ? sigmatiqTheme.colors.primary.teal : sigmatiqTheme.colors.text.secondary,
            border: `1px solid ${(tab === b.id) ? sigmatiqTheme.colors.primary.teal + '40' : sigmatiqTheme.colors.border.default}`
          }}>
          {b.label}
        </button>
      ))}
    </div>
  );

  const content = () => {
    if (tab === 'economic') {
      const data: any[] = economicQ.data || [];
      if (economicQ.isLoading) return <div className="text-sm" style={{ color: sigmatiqTheme.colors.text.secondary }}>Loading…</div>;
      if (economicQ.error) return <div className="text-sm" style={{ color: sigmatiqTheme.colors.status.error }}>Unable to load economic events</div>;
      if (!data.length) return <div className="text-sm" style={{ color: sigmatiqTheme.colors.text.muted }}>No events</div>;
      return (
        <div className="space-y-2">
          {data.map((e, i) => (
            <div key={i} className="flex items-center justify-between p-2 rounded border"
              style={{ borderColor: sigmatiqTheme.colors.border.default }}>
              <div className="flex items-center gap-2">
                <span className="text-xs" style={{ color: sigmatiqTheme.colors.text.muted }}>{e.time_local || e.time || '-'}</span>
                <span className="text-sm" style={{ color: sigmatiqTheme.colors.text.primary }}>{e.name || e.event || 'Event'}</span>
                {e.importance && (
                  <span className="text-[10px] px-1 py-0.5 rounded"
                    style={{ backgroundColor: sigmatiqTheme.colors.background.primary, color: sigmatiqTheme.colors.text.secondary }}>
                    {e.importance}
                  </span>
                )}
              </div>
              <div className="text-right text-xs" style={{ color: sigmatiqTheme.colors.text.secondary }}>
                {e.actual != null && <div>Actual: {e.actual}</div>}
                {e.consensus != null && <div>Est: {e.consensus}</div>}
                {e.previous != null && <div>Prev: {e.previous}</div>}
              </div>
            </div>
          ))}
        </div>
      );
    }
    const data: any[] = holidaysQ.data || [];
    if (holidaysQ.isLoading) return <div className="text-sm" style={{ color: sigmatiqTheme.colors.text.secondary }}>Loading…</div>;
    if (holidaysQ.error) return <div className="text-sm" style={{ color: sigmatiqTheme.colors.status.error }}>Unable to load holidays</div>;
    if (!data.length) return <div className="text-sm" style={{ color: sigmatiqTheme.colors.text.muted }}>No holidays</div>;
    return (
      <div className="space-y-2">
        {data.map((d: any, i: number) => (
          <div key={i} className="flex items-center justify-between p-2 rounded border"
            style={{ borderColor: sigmatiqTheme.colors.border.default }}>
            <div className="flex items-center gap-2">
              <span className="text-xs" style={{ color: sigmatiqTheme.colors.text.muted }}>{d.date || '-'}</span>
              <span className="text-sm" style={{ color: sigmatiqTheme.colors.text.primary }}>{d.name || d.title || 'Holiday'}</span>
            </div>
            <div className="text-right text-xs" style={{ color: sigmatiqTheme.colors.text.secondary }}>
              {d.status || d.market_status || ''}
            </div>
          </div>
        ))}
      </div>
    );
  };

  const meta = tab === 'economic' ? getMeta(economicQ.data) : getMeta(holidaysQ.data);
  return (
    <div className="rounded-xl p-4 border relative"
      style={{ backgroundColor: sigmatiqTheme.colors.background.secondary, borderColor: sigmatiqTheme.colors.border.default }}>
      {/* Cache provenance dot at top-left */}
      <div className="absolute top-2 left-2"><CacheDot meta={meta} /></div>
      <div className="mb-2 text-base font-semibold" style={{ color: sigmatiqTheme.colors.text.primary }}>Calendar</div>
      {header}
      {tabRow}
      {content()}
    </div>
  );
};

export default CalendarCard;

