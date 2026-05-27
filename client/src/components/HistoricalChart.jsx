import React from 'react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ReferenceLine, ResponsiveContainer,
} from 'recharts';

function CustomTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const item = payload[0];
  return (
    <div style={{
      background: '#1a1f30', border: '1px solid #2d3a52', borderRadius: 8,
      padding: '8px 12px', fontSize: '0.8125rem',
    }}>
      <div style={{ fontWeight: 600, color: '#ffffff', marginBottom: 2 }}>
        {item.payload.dateShort}
      </div>
      <div style={{ color: '#00ff9d', fontFamily: "'JetBrains Mono', monospace" }}>
        KP {Number(item.value).toFixed(1)}
      </div>
    </div>
  );
}

export default function HistoricalChart({ history, loading }) {
  // Build tick labels: "Mon 19", "Tue 20", etc.
  const chartData = (history || []).map(d => ({
    ...d,
    label: `${d.date} ${d.dateShort?.split(' ')?.[1] ?? ''}`.trim(),
  }));

  return (
    <div style={{ background: '#131722', border: '1px solid #1e2638', borderRadius: 8, padding: '16px' }}>
      <h2 style={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#475569', margin: '0 0 2px 0' }}>
        Past 7 Days
      </h2>
      <p style={{ fontSize: '0.6875rem', color: '#334155', margin: '0 0 14px 0' }}>
        KP Activity Trend
      </p>

      {loading ? (
        <div style={{ height: 250, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ width: 22, height: 22, borderRadius: '50%', border: '2px solid #1e2638', borderTopColor: '#00ff9d', animation: 'spin 0.8s linear infinite' }} />
        </div>
      ) : !chartData.length ? (
        <div style={{ height: 250, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ fontSize: '0.875rem', color: '#475569', fontStyle: 'italic' }}>Historical data unavailable</span>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={250}>
          <AreaChart data={chartData} margin={{ top: 8, right: 4, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="kpHistGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="#00ff9d" stopOpacity={0.08} />
                <stop offset="95%" stopColor="#00ff9d" stopOpacity={0}    />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e2638" vertical={false} />
            <XAxis
              dataKey="label"
              tick={{ fill: '#475569', fontSize: 11 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              domain={[0, 9]}
              ticks={[0, 3, 6, 9]}
              tick={{ fill: '#475569', fontSize: 11 }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#334155', strokeWidth: 1 }} />
            <ReferenceLine
              y={4}
              stroke="#2d3a52"
              strokeDasharray="4 3"
              label={{ value: 'Aurora visible in Alberta', position: 'insideTopLeft', fill: '#334155', fontSize: 10 }}
            />
            <Area
              type="monotone"
              dataKey="kp"
              stroke="#00ff9d"
              strokeWidth={2}
              fill="url(#kpHistGradient)"
              dot={false}
              activeDot={{ r: 4, fill: '#00ff9d', stroke: '#131722', strokeWidth: 2 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      )}

      <p style={{ fontSize: '0.6875rem', fontStyle: 'italic', color: '#334155', margin: '8px 0 0 0' }}>
        NOAA SWPC · Daily averages
      </p>
    </div>
  );
}
