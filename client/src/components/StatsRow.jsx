import React from 'react';
import { Zap, MapPin, Cloud, Moon, RefreshCw } from 'lucide-react';

function StatCard({ icon, label, value, accentColor = '#8b5cf6', loading }) {
  return (
    <div
      className="rounded-xl p-4 flex items-center gap-3"
      style={{
        background: '#242938',
        border: '1px solid rgba(139, 92, 246, 0.12)',
        boxShadow: '0 2px 8px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.04)',
      }}
    >
      <div
        className="flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center"
        style={{ background: `${accentColor}18`, color: '#00ff88' }}
      >
        {icon}
      </div>
      <div className="min-w-0">
        <div style={{ fontSize: '0.6875rem', fontWeight: 500, color: '#8b5cf6', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '4px' }}>
          {label}
        </div>
        {loading ? (
          <div className="h-6 w-24 rounded-lg animate-pulse" style={{ background: '#2e3549' }} />
        ) : (
          <div style={{ fontSize: '1rem', fontWeight: 600, color: '#ffffff', textShadow: `0 0 14px ${accentColor}55`, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {value ?? '--'}
          </div>
        )}
      </div>
    </div>
  );
}

function kpColor(kp) {
  if (kp === null || kp === undefined) return '#9ca3af';
  if (kp >= 5) return '#00b87a';
  if (kp >= 3) return '#f59e0b';
  return '#ef4444';
}

function formatTimestamp(date) {
  if (!date) return null;
  const tz     = 'America/Edmonton';
  const time   = date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true, timeZone: tz });
  const tzAbbr = date.toLocaleTimeString('en-US', { timeZone: tz, timeZoneName: 'short' }).split(' ').at(-1);
  return `${time} ${tzAbbr}`;
}

export default function StatsRow({ kp, moon, topLocation, loading, lastUpdated, onRefresh }) {
  const kpCol   = kpColor(kp);
  const timeStr = formatTimestamp(lastUpdated);

  return (
    <div>
      {/* Timestamp + refresh */}
      <div className="flex justify-end items-center gap-2 mb-2 min-h-[20px]">
        {timeStr && (
          <span style={{ fontSize: '11px', color: '#6b7280' }}>
            Last updated: <span style={{ color: '#9ca3af' }}>{timeStr}</span>
          </span>
        )}
        <button
          onClick={onRefresh}
          disabled={loading}
          title="Refresh data"
          style={{
            width: 24, height: 24,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'transparent',
            border: '1px solid rgba(139, 92, 246, 0.2)',
            color: loading ? '#00ff88' : '#6b7280',
            cursor: loading ? 'default' : 'pointer',
            borderRadius: 8,
            transition: 'color 0.15s, border-color 0.15s',
          }}
          onMouseEnter={e => { if (!loading) { e.currentTarget.style.color = '#00ff88'; e.currentTarget.style.borderColor = 'rgba(0,255,136,0.3)'; } }}
          onMouseLeave={e => { if (!loading) { e.currentTarget.style.color = '#6b7280'; e.currentTarget.style.borderColor = 'rgba(139,92,246,0.2)'; } }}
        >
          <RefreshCw size={12} className={loading ? 'animate-spin' : ''} style={{ flexShrink: 0 }} />
        </button>
      </div>

      {/* 4-column stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard loading={loading} icon={<Zap size={18} />}    label="KP Index"
          value={kp !== null ? `${kp.toFixed(1)} / 9` : '--'}   accentColor={kpCol} />
        <StatCard loading={loading} icon={<MapPin size={18} />}  label="Best Tonight"
          value={topLocation?.name?.split(' ').slice(0, 2).join(' ')} accentColor="#00b87a" />
        <StatCard loading={loading} icon={<Cloud size={18} />}   label="Cloud Cover"
          value={topLocation ? `${topLocation.cloudPct}%` : '--'} accentColor="#60a5fa" />
        <StatCard loading={loading} icon={<Moon size={18} />}    label="Moon"
          value={moon ? `${moon.pct}% lit` : '--'}               accentColor="#a78bfa" />
      </div>
    </div>
  );
}
