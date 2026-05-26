import React, { useState } from 'react';
import { Zap, MapPin, Cloud, Moon, RefreshCw } from 'lucide-react';

const KP_TOOLTIP = "The KP Index measures Earth's geomagnetic activity on a 0–9 scale. Higher KP means stronger geomagnetic storms, which push the aurora further south. KP 4+ is typically needed to see aurora in northern Alberta. KP 6+ can bring aurora visible from Calgary.";

function KpTooltip() {
  const [show, setShow] = useState(false);
  return (
    <span
      style={{ position: 'relative', display: 'inline-flex', alignItems: 'center' }}
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
    >
      <span style={{
        width: 14, height: 14, borderRadius: '50%',
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        border: `1px solid ${show ? '#00ff9d' : '#334155'}`,
        color: show ? '#00ff9d' : '#475569',
        fontSize: '0.5625rem', fontWeight: 700, cursor: 'help',
        transition: 'color 0.15s, border-color 0.15s',
        lineHeight: 1, userSelect: 'none', flexShrink: 0,
      }}>?</span>
      {show && (
        <div style={{
          position: 'absolute', top: '100%', left: 0, marginTop: 7, zIndex: 100,
          background: '#1a1f30', border: '1px solid #2d3a52', borderRadius: 8,
          padding: '10px 12px', width: 280,
          fontSize: '0.8125rem', color: '#cbd5e1', lineHeight: 1.55,
          boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
          pointerEvents: 'none',
        }}>
          {KP_TOOLTIP}
        </div>
      )}
    </span>
  );
}

function StatCard({ icon, label, value, context, loading, mono = false, labelExtra }) {
  return (
    <div
      className="rounded-lg p-4 flex items-start gap-3"
      style={{
        background: '#131722',
        border: '1px solid #1e2638',
      }}
    >
      <div
        className="flex-shrink-0 w-9 h-9 rounded-lg flex items-center justify-center mt-0.5"
        style={{ background: 'rgba(0,255,157,0.08)', color: '#00ff9d' }}
      >
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5" style={{ marginBottom: '4px' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            {label}
          </span>
          {labelExtra}
        </div>
        {loading ? (
          <>
            <div className="h-6 w-24 rounded animate-pulse mb-1" style={{ background: '#1e2638' }} />
            <div className="h-3 w-32 rounded animate-pulse" style={{ background: '#1e2638' }} />
          </>
        ) : (
          <>
            <div style={{
              fontSize: '1.5rem', fontWeight: 700, color: '#ffffff', lineHeight: 1.1,
              fontFamily: mono ? "'JetBrains Mono', monospace" : "'Inter', sans-serif",
              fontVariantNumeric: 'tabular-nums',
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            }}>
              {value ?? '--'}
            </div>
            <div style={{ fontSize: '0.75rem', fontWeight: 400, color: '#94a3b8', marginTop: '3px', lineHeight: 1.3 }}>
              {context}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function formatTimestamp(date) {
  if (!date) return null;
  const tz     = 'America/Edmonton';
  const time   = date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true, timeZone: tz });
  const tzAbbr = date.toLocaleTimeString('en-US', { timeZone: tz, timeZoneName: 'short' }).split(' ').at(-1);
  return `${time} ${tzAbbr}`;
}

export default function StatsRow({ kp, moon, topLocation, loading, lastUpdated, onRefresh }) {
  const timeStr = formatTimestamp(lastUpdated);

  return (
    <div>
      {/* Timestamp + refresh */}
      <div className="flex justify-end items-center gap-2 mb-2 min-h-[20px]">
        {timeStr && (
          <span style={{ fontSize: '0.75rem', color: '#475569', fontFamily: "'JetBrains Mono', monospace" }}>
            Updated {timeStr}
          </span>
        )}
        <button
          onClick={onRefresh}
          disabled={loading}
          title="Refresh data"
          style={{
            width: 26, height: 26,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'transparent',
            border: '1px solid #1e2638',
            color: loading ? '#00ff9d' : '#475569',
            cursor: loading ? 'default' : 'pointer',
            borderRadius: 6,
            transition: 'color 0.15s, border-color 0.15s',
          }}
          onMouseEnter={e => { if (!loading) { e.currentTarget.style.color = '#00ff9d'; e.currentTarget.style.borderColor = '#00ff9d'; } }}
          onMouseLeave={e => { if (!loading) { e.currentTarget.style.color = '#475569'; e.currentTarget.style.borderColor = '#1e2638'; } }}
        >
          <RefreshCw size={12} className={loading ? 'animate-spin' : ''} style={{ flexShrink: 0 }} />
        </button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard
          loading={loading}
          icon={<Zap size={16} />}
          label="KP Index"
          labelExtra={<KpTooltip />}
          value={kp !== null ? `${kp.toFixed(1)} / 9` : '--'}
          context="0–9 scale, higher = more aurora"
          mono
        />
        <StatCard
          loading={loading}
          icon={<MapPin size={16} />}
          label="Best Tonight"
          value={topLocation?.name?.split(' ').slice(0, 2).join(' ')}
          context="Highest viewing score now"
        />
        <StatCard
          loading={loading}
          icon={<Cloud size={16} />}
          label="Cloud Cover"
          value={topLocation ? `${topLocation.cloudPct}%` : '--'}
          context="Lower is better"
          mono
        />
        <StatCard
          loading={loading}
          icon={<Moon size={16} />}
          label="Moon Phase"
          value={moon ? `${moon.pct}% lit` : '--'}
          context="Lower is better"
          mono
        />
      </div>
    </div>
  );
}
