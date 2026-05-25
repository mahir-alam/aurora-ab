import React from 'react';
import { Sparkles } from 'lucide-react';

export default function AIExplanation({ explanation, loading }) {
  return (
    <div
      className="rounded-xl p-5 relative overflow-hidden"
      style={{
        background: '#242938',
        borderTop:    '1px solid rgba(139, 92, 246, 0.15)',
        borderRight:  '1px solid rgba(139, 92, 246, 0.12)',
        borderBottom: '1px solid rgba(139, 92, 246, 0.12)',
        borderLeft:   '4px solid #8b5cf6',
        boxShadow: '0 4px 20px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.04)',
      }}
    >
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2.5">
            <div style={{ width: 32, height: 32, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,255,136,0.10)', border: '1px solid rgba(0,255,136,0.20)' }}>
              <Sparkles size={16} style={{ color: '#00ff88' }} />
            </div>
            <h2 style={{ fontSize: '0.9375rem', fontWeight: 600, color: '#00ff88' }}>AI Aurora Advisor</h2>
          </div>
          <span style={{ fontSize: '0.625rem', fontWeight: 600, padding: '2px 8px', borderRadius: '9999px', background: 'rgba(139,92,246,0.15)', color: '#a78bfa', border: '1px solid rgba(139,92,246,0.3)', letterSpacing: '0.05em' }}>
            GPT-3.5
          </span>
        </div>

        {loading ? (
          <div className="space-y-2.5">
            {[1, 0.83, 0.75].map((w, i) => (
              <div key={i} className="h-3.5 rounded-full animate-pulse" style={{ background: '#2e3549', width: `${w * 100}%` }} />
            ))}
          </div>
        ) : explanation ? (
          <p style={{ fontSize: '0.9375rem', lineHeight: 1.65, color: '#e5e7eb' }}>{explanation}</p>
        ) : (
          <p style={{ fontSize: '0.875rem', fontStyle: 'italic', color: '#6b7280' }}>
            AI advisor unavailable — add{' '}
            <code style={{ color: '#8b5cf6' }}>OPENAI_API_KEY</code> to{' '}
            <code style={{ color: '#8b5cf6' }}>server/.env</code> to enable.
          </p>
        )}
      </div>
    </div>
  );
}
