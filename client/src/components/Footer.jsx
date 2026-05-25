import React from 'react';

export default function Footer() {
  return (
    <footer className="relative mt-4">
      {/* Gradient separator */}
      <div style={{ height: 1, background: 'linear-gradient(90deg, transparent, rgba(0,255,136,0.22), rgba(139,92,246,0.22), transparent)' }} />

      <div style={{ background: '#161823' }}>
        <div className="max-w-7xl mx-auto px-6 py-7 flex flex-col items-center gap-2 text-center">
          <p style={{ fontSize: '0.8125rem', color: '#6b7280' }}>
            Built by{' '}
            <a
              href="https://linkedin.com/in/mahiralamm"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: '#9ca3af', fontWeight: 600, textDecoration: 'none', transition: 'color 0.2s' }}
              onMouseEnter={e => { e.currentTarget.style.color = '#00ff88'; e.currentTarget.style.textDecoration = 'underline'; }}
              onMouseLeave={e => { e.currentTarget.style.color = '#9ca3af'; e.currentTarget.style.textDecoration = 'none'; }}
            >
              Mahir Alam
            </a>
          </p>
          <p style={{ fontSize: '0.6875rem', color: '#4b5563', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
            Powered by NOAA Space Weather · OpenWeatherMap · Mapbox · OpenAI
          </p>
        </div>
      </div>
    </footer>
  );
}
