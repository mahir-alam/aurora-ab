import React from 'react';

export default function Footer() {
  return (
    <footer className="relative mt-4">
      <div style={{ height: 1, background: '#1e2535' }} />
      <div style={{ background: 'transparent' }}>
        <div className="max-w-7xl mx-auto px-6 flex flex-col items-center gap-1.5 text-center" style={{ paddingTop: 24, paddingBottom: 24 }}>
          <p style={{ fontSize: '0.8125rem', fontWeight: 400, color: '#475569', margin: 0 }}>
            Built by{' '}
            <a
              href="https://linkedin.com/in/mahiralamm"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: '#00ff9d', fontWeight: 500, textDecoration: 'none', transition: 'color 0.15s' }}
              onMouseEnter={e => { e.currentTarget.style.color = '#33ffb2'; e.currentTarget.style.textDecoration = 'underline'; }}
              onMouseLeave={e => { e.currentTarget.style.color = '#00ff9d'; e.currentTarget.style.textDecoration = 'none'; }}
            >
              Mahir Alam
            </a>
          </p>
          <p style={{ fontSize: '0.75rem', fontWeight: 400, color: '#94a3b8', margin: 0, letterSpacing: '0.02em' }}>
            Powered by NOAA Space Weather · OpenWeatherMap · Mapbox · OpenAI
          </p>
        </div>
      </div>
    </footer>
  );
}
