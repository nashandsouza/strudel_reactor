// src/components/Header.jsx
import React from 'react';

export default function Header() {
  return (
    <header className="py-4 text-center">
      <h1 className="fw-bold display-5" style={{ color: 'var(--accent)', marginBottom: '0.2rem' }}>
        Strudel Reactor
      </h1>
      <p className="text-secondary mb-0" style={{ fontSize: '1rem' }}>
        By Nashan Dsouza
      </p>
      <hr style={{
        border: 'none',
        borderTop: '1px solid var(--line)',
        width: '60%',
        margin: '1rem auto 0'
      }}/>
    </header>
  );
}
