import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Calendar, RefreshCw, X } from 'lucide-react';
import { sigmatiqTheme } from '../../styles/sigmatiq-theme';
import { calendarApi } from '../../api/client';

interface Props {
  context?: { symbol?: string };
  onClose: () => void;
}

const CompanyCalendarHelper: React.FC<Props> = ({ context, onClose }) => {
  const symbol = (context?.symbol || '').toUpperCase();
  const [range, setRange] = React.useState<'week' | 'month'>('week');
  const [refreshKey, setRefreshKey] = React.useState(0);

  const from = new Date();
  const to = new Date();
  if (range === 'week') to.setDate(to.getDate() + 7);
  else to.setMonth(to.getMonth() + 1);
  const fmt = (d: Date) => d.toISOString().slice(0, 10);

  const { data, isLoading, error } = useQuery({
    queryKey: ['companyCalendar', symbol, range, refreshKey],
    queryFn: () => calendarApi.getCompanyCalendar({ symbol, from: fmt(from), to: fmt(to) }),
    enabled: !!symbol,
    staleTime: 15 * 60 * 1000,
  });

  const onRefresh = () => setRefreshKey((x) => x + 1);

  return (
    <div className="h-full flex flex-col" style={{ backgroundColor: sigmatiqTheme.colors.background.secondary }}>
      <div className="flex items-center justify-between p-4" style={{ borderBottom: `1px solid ${sigmatiqTheme.colors.border.default}` }}>
        <div className="flex items-center gap-2">
          <Calendar size={18} />
          <h2 className="text-lg font-semibold" style={{ color: sigmatiqTheme.colors.text.primary }}>
            {symbol ? `${symbol} Company Calendar` : 'Company Calendar'}
          </h2>
          <div className="ml-2 flex items-center gap-2">
            {(['week', 'month'] as const).map((r) => (
              <button key={r}
                onClick={() => setRange(r)}
                className="px-2 py-1 rounded text-xs"
                style={{
                  backgroundColor: (range === r) ? sigmatiqTheme.colors.primary.teal + '20' : 'transparent',
                  color: (range === r) ? sigmatiqTheme.colors.primary.teal : sigmatiqTheme.colors.text.secondary,
                  border: `1px solid ${(range === r) ? sigmatiqTheme.colors.primary.teal + '40' : sigmatiqTheme.colors.border.default}`
                }}>
                {r === 'week' ? 'Next 7d' : 'Next 30d'}
              </button>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={onRefresh} className="p-2 rounded" style={{ color: sigmatiqTheme.colors.text.secondary }}>
            <RefreshCw size={18} />
          </button>
          <button onClick={onClose} className="p-2 rounded" style={{ color: sigmatiqTheme.colors.text.secondary }}>
            <X size={18} />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {!symbol && (
          <div className="text-sm" style={{ color: sigmatiqTheme.colors.text.secondary }}>
            Select a symbol to view earnings, dividends, and splits.
          </div>
        )}
        {symbol && (
          <>
            {isLoading ? (
              <div className="text-sm" style={{ color: sigmatiqTheme.colors.text.secondary }}>Loading…</div>
            ) : error ? (
              <div className="text-sm" style={{ color: sigmatiqTheme.colors.status.error }}>Unable to load company events</div>
            ) : (
              <div className="space-y-4">
                <section>
                  <div className="text-sm font-semibold mb-1" style={{ color: sigmatiqTheme.colors.text.primary }}>Earnings</div>
                  {(data?.earnings || []).length === 0 ? (
                    <div className="text-xs" style={{ color: sigmatiqTheme.colors.text.muted }}>No earnings in range</div>
                  ) : (
                    <div className="space-y-1">
                      {data.earnings.map((e: any, i: number) => (
                        <div key={i} className="flex items-center justify-between p-2 rounded border"
                          style={{ borderColor: sigmatiqTheme.colors.border.default }}>
                          <div className="text-sm" style={{ color: sigmatiqTheme.colors.text.primary }}>{e.date || e.announce_date}</div>
                          <div className="text-xs" style={{ color: sigmatiqTheme.colors.text.secondary }}>{e.when || e.session || ''} {e.est_eps != null && `• Est EPS ${e.est_eps}`}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </section>
                <section>
                  <div className="text-sm font-semibold mb-1" style={{ color: sigmatiqTheme.colors.text.primary }}>Dividends</div>
                  {(data?.dividends || []).length === 0 ? (
                    <div className="text-xs" style={{ color: sigmatiqTheme.colors.text.muted }}>No dividends in range</div>
                  ) : (
                    <div className="space-y-1">
                      {data.dividends.map((d: any, i: number) => (
                        <div key={i} className="flex items-center justify-between p-2 rounded border"
                          style={{ borderColor: sigmatiqTheme.colors.border.default }}>
                          <div className="text-sm" style={{ color: sigmatiqTheme.colors.text.primary }}>{d.ex_date || d.pay_date}</div>
                          <div className="text-xs" style={{ color: sigmatiqTheme.colors.text.secondary }}>Amount {d.amount ?? d.dividend}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </section>
                <section>
                  <div className="text-sm font-semibold mb-1" style={{ color: sigmatiqTheme.colors.text.primary }}>Splits</div>
                  {(data?.splits || []).length === 0 ? (
                    <div className="text-xs" style={{ color: sigmatiqTheme.colors.text.muted }}>No splits in range</div>
                  ) : (
                    <div className="space-y-1">
                      {data.splits.map((s: any, i: number) => (
                        <div key={i} className="flex items-center justify-between p-2 rounded border"
                          style={{ borderColor: sigmatiqTheme.colors.border.default }}>
                          <div className="text-sm" style={{ color: sigmatiqTheme.colors.text.primary }}>{s.effective_date || s.date}</div>
                          <div className="text-xs" style={{ color: sigmatiqTheme.colors.text.secondary }}>{s.ratio || (s.from && s.to ? `${s.from}:${s.to}` : '')}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </section>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default CompanyCalendarHelper;

