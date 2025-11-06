// src/components/Output.jsx
import React from 'react';

export function Output({ processed }) {
  return (
    <div className="card h-100">
      <div className="card-body">
        <h5 className="card-title">Processed Output</h5>
        <textarea className="form-control code" readOnly value={processed} />
      </div>
    </div>
  );
}
