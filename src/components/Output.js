// src/components/Output.jsx
import React from 'react';

export function Output({ processed }) {
  return (
    <div className="card">
      <div className="card-body">
        <h5 className="card-title mb-2">Processed Output</h5>
        <textarea
          className="form-control code"
          readOnly
          value={processed}
          rows={8} // visual hint, real height controlled by style
          style={{
            minHeight: '160px',
            maxHeight: '160px',
            overflow: 'auto',
          }}
        />
      </div>
    </div>
  );
}
