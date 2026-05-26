import React from 'react';
import { Sparkles } from 'lucide-react';

export default function AIExplanation({ explanation, loading }) {
  return (
    <div
      style={{
        background: '#131722',
        borderTop:    '1px solid #1e2638',
        borderRight:  '1px solid #1e2638',
        borderBottom: '1px solid #1e2638',
        borderLeft:   '2px solid #b266ff',
        borderRadius: 8,
        padding: '16px',
      }}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div style={{ width: 28, height: 28, borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(178,102,255,0.10)', border: '1px solid rgba(178,102,255,0.2)', flexShrink: 0 }}>
            <Sparkles size={13} style={{ color: '#b266ff' }} />
          </div>
          <h2 style={{ fontSize: '0.875rem', fontWeight: 600, color: '#ffffff', margin: 0, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            AI Aurora Advisor
          </h2>
        </div>
        <span style={{ fontSize: '0.625rem', fontWeight: 600, padding: '2px 7px', borderRadius: '3px', background: 'rgba(178,102,255,0.12)', color: '#b266ff', border: '1px solid rgba(178,102,255,0.3)', letterSpacing: '0.06em', fontFamily: "'JetBrains Mono', monospace", flexShrink: 0 }}>
          GPT-3.5
        </span>
      </div>

      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {[1, 0.82, 0.65].map((w, i) => (
            <div key={i} className="rounded animate-pulse" style={{ height: '13px', background: '#1e2638', width: `${w * 100}%` }} />
          ))}
        </div>
      ) : explanation ? (
        <p style={{ fontSize: '0.875rem', lineHeight: 1.6, color: '#f1f5f9', margin: 0 }}>{explanation}</p>
      ) : (
        <p style={{ fontSize: '0.875rem', fontStyle: 'italic', color: '#475569', margin: 0 }}>
          AI advisor unavailable — add{' '}
          <code style={{ color: '#b266ff', fontStyle: 'normal', fontFamily: "'JetBrains Mono', monospace" }}>OPENAI_API_KEY</code> to{' '}
          <code style={{ color: '#b266ff', fontStyle: 'normal', fontFamily: "'JetBrains Mono', monospace" }}>server/.env</code> to enable.
        </p>
      )}
    </div>
  );
}
