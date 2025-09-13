import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Calendar, X } from 'lucide-react';
import { sigmatiqTheme } from '../../styles/sigmatiq-theme';
import { calendarApi } from '../../api/client';

interface Props {
  onClose: () => void;
  context?: { date?: string; tab?: 'economic' | 'holidays' };
}

type Tab = 'economic' | 'holidays';

const todayISO = () => new Date().toISOString().slice(0, 10);

const CalendarDetailHelper: React.FC<Props> = ({ onClose, context }) => {
  const [tab, setTab] = React.useState<Tab>((context?.tab as Tab) || 'economic');
  const [date, setDate] = React.useState<string>(context?.date || todayISO());
  const region = (import.meta.env.VITE_REGION || 'US');

  const economicQ = useQuery({
    queryKey: ['calendar-helper', 'economic', date, region],
    queryFn: () => calendarApi.getEconomicCalendar({ date, region }),
    staleTime: 15 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const y = new Date(date);
  const holidaysQ = useQuery({
    queryKey: ['calendar-helper', 'holidays', y.getFullYear(), region],
    queryFn: () => calendarApi.getHolidays({ year: y.getFullYear(), region }),
    staleTime: 24 * 60 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const holidaysToday = (holidaysQ.data || []).filter((h: any) => h.date === date);

  return (
    <div className="h-full flex flex-col" style={{ backgroundColor: sigmatiqTheme.colors.background.secondary }}>
      <div className="flex items-center justify-between p-4" style={{ borderBottom: `1px solid ${sigmatiqTheme.colors.border.default}` }}>
        <div className="flex items-center gap-2">
          <Calendar size={18} />
          <h2 className="text-lg font-semibold" style={{ color: sigmatiqTheme.colors.text.primary }}>Calendar</h2>
        </div>
        <button onClick={onClose} className="p-2 rounded" style={{ color: sigmatiqTheme.colors.text.secondary }}>
          <X size={18} />
        </button>
      </div>

      <div className="p-4 flex items-center gap-2" style={{ borderBottom: `1px solid ${sigmatiqTheme.colors.border.default}` }}>
        {tab === 'economic' && (
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="text-sm px-2 py-1 rounded border"
            style={{ borderColor: sigmatiqTheme.colors.border.default, background: 'transparent', color: sigmatiqTheme.colors.text.primary }}
          />
        )}
        <div className="ml-auto flex items-center gap-2">
          {(['economic','holidays'] as const).map((t) => (
            <button key={t}
              onClick={() => setTab(t)}
              className="px-2 py-1 rounded text-xs"
              style={{
                backgroundColor: (tab === t) ? sigmatiqTheme.colors.primary.teal + '20' : 'transparent',
                color: (tab === t) ? sigmatiqTheme.colors.primary.teal : sigmatiqTheme.colors.text.secondary,
                border: `1px solid ${(tab === t) ? sigmatiqTheme.colors.primary.teal + '40' : sigmatiqTheme.colors.border.default}`
              }}>
              {t === 'economic' ? 'Economic' : 'Holidays'}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {tab === 'economic' ? (
          economicQ.isLoading ? (
            <div className="text-sm" style={{ color: sigmatiqTheme.colors.text.secondary }}>Loading…</div>
          ) : economicQ.error ? (
            <div className="text-sm" style={{ color: sigmatiqTheme.colors.status.error }}>Unable to load economic events</div>
          ) : (
            <div className="space-y-2">
              {((economicQ.data || []) as any[]).length === 0 ? (
                <div className="text-sm" style={{ color: sigmatiqTheme.colors.text.muted }}>No events</div>
              ) : (
                (economicQ.data as any[]).map((e, i) => (
                  <div key={i} className="flex items-center justify-between p-2 rounded border"
                    style={{ borderColor: sigmatiqTheme.colors.border.default }}>
                    <div className="flex items-center gap-2">
                      <span className="text-xs" style={{ color: sigmatiqTheme.colors.text.muted }}>{e.time_local || e.time || '-'}</span>
                      <span className="text-sm" style={{ color: sigmatiqTheme.colors.text.primary }}>{e.name || e.event || 'Event'}</span>
                    </div>
                    <div className="text-right text-xs" style={{ color: sigmatiqTheme.colors.text.secondary }}>
                      {e.actual != null && <div>Actual: {e.actual}</div>}
                      {e.consensus != null && <div>Est: {e.consensus}</div>}
                      {e.previous != null && <div>Prev: {e.previous}</div>}
                    </div>
                  </div>
                ))
              )}
            </div>
          )
        ) : (
          holidaysQ.isLoading ? (
            <div className="text-sm" style={{ color: sigmatiqTheme.colors.text.secondary }}>Loading…</div>
          ) : holidaysQ.error ? (
            <div className="text-sm" style={{ color: sigmatiqTheme.colors.status.error }}>Unable to load holidays</div>
          ) : (
            <div className="space-y-2">
              {(holidaysToday.length === 0 ? (holidaysQ.data || []) : holidaysToday).map((d: any, i: number) => (
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
          )
        )}
      </div>
    </div>
  );
};

export default CalendarDetailHelper;
