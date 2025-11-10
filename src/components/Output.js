// src/components/Output.jsx
import React from 'react';

export function Output({ processed }) {
  return (
    <div className="card">
      <div className="card-body">
        <h5 className="card-title mb-2 text-light">Processed Output</h5>

        <textarea
          className="form-control code"
          readOnly
          value={processed}
          rows={12}
          style={{
            minHeight: '320px',
            maxHeight: '320px',
            overflow: 'auto',
            resize: 'vertical', // optional
          }}
        />
      </div>
    </div>
  );
}
