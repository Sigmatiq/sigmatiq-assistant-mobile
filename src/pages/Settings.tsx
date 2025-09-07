import React from 'react';
import useAppStore from '../stores/useAppStore';
import { sigmatiqTheme } from '../styles/sigmatiq-theme';

const Settings: React.FC = () => {
  const { tradingProfile, setTradingProfile, assetType, setAssetType, experience, setExperience, theme, setTheme } = useAppStore();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold" style={{ color: sigmatiqTheme.colors.text.primary }}>Mode</h2>
        <p className="text-sm mb-3" style={{ color: sigmatiqTheme.colors.text.muted }}>Choose your trading type, instrument, and experience.</p>
        <div className="grid gap-3">
          <div>
            <div className="text-sm mb-1" style={{ color: sigmatiqTheme.colors.text.secondary }}>Trading Type</div>
            <div className="flex flex-wrap gap-2">
              {(['day','swing','investing','options'] as const).map(p => (
                <button key={p} onClick={() => setTradingProfile(p)} className="px-3 py-1.5 rounded-lg border"
                  style={{
                    backgroundColor: tradingProfile === p ? sigmatiqTheme.colors.background.card : sigmatiqTheme.colors.background.secondary,
                    borderColor: tradingProfile === p ? sigmatiqTheme.colors.primary.teal : sigmatiqTheme.colors.border.default,
                    color: tradingProfile === p ? sigmatiqTheme.colors.primary.teal : sigmatiqTheme.colors.text.secondary
                  }}>{p === 'day' ? 'Day' : p === 'swing' ? 'Swing' : p === 'investing' ? 'Long-Term' : 'Options'}</button>
              ))}
            </div>
          </div>
          <div>
            <div className="text-sm mb-1" style={{ color: sigmatiqTheme.colors.text.secondary }}>Instrument</div>
            <div className="flex gap-2">
              {(['stocks','options'] as const).map(a => (
                <button key={a} onClick={() => setAssetType(a)} className="px-3 py-1.5 rounded-lg border"
                  style={{
                    backgroundColor: assetType === a ? sigmatiqTheme.colors.background.card : sigmatiqTheme.colors.background.secondary,
                    borderColor: assetType === a ? sigmatiqTheme.colors.primary.teal : sigmatiqTheme.colors.border.default,
                    color: assetType === a ? sigmatiqTheme.colors.primary.teal : sigmatiqTheme.colors.text.secondary
                  }}>{a === 'stocks' ? 'Stocks' : 'Options'}</button>
              ))}
            </div>
          </div>
          <div>
            <div className="text-sm mb-1" style={{ color: sigmatiqTheme.colors.text.secondary }}>Experience</div>
            <div className="flex gap-2">
              {(['novice','intermediate','power'] as const).map(e => (
                <button key={e} onClick={() => setExperience(e)} className="px-3 py-1.5 rounded-lg border"
                  style={{
                    backgroundColor: experience === e ? sigmatiqTheme.colors.background.card : sigmatiqTheme.colors.background.secondary,
                    borderColor: experience === e ? sigmatiqTheme.colors.primary.teal : sigmatiqTheme.colors.border.default,
                    color: experience === e ? sigmatiqTheme.colors.primary.teal : sigmatiqTheme.colors.text.secondary
                  }}>{e === 'novice' ? 'Beginner' : e === 'intermediate' ? 'Intermediate' : 'Advanced'}</button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-lg font-semibold" style={{ color: sigmatiqTheme.colors.text.primary }}>Appearance</h2>
        <div className="flex gap-2 mt-2">
          {(['dark','light','auto'] as const).map(t => (
            <button key={t} onClick={() => setTheme(t)} className="px-3 py-1.5 rounded-lg border"
              style={{
                backgroundColor: theme === t ? sigmatiqTheme.colors.background.card : sigmatiqTheme.colors.background.secondary,
                borderColor: theme === t ? sigmatiqTheme.colors.primary.teal : sigmatiqTheme.colors.border.default,
                color: theme === t ? sigmatiqTheme.colors.primary.teal : sigmatiqTheme.colors.text.secondary
              }}>{t.toUpperCase()}</button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Settings;

