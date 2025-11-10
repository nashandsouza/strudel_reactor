// src/components/Editor.js
import React from 'react';

export function Editor({ song, setSong }) {
  return (
    <div className="card">
      <div className="card-body">
        <h5 className="card-title mb-2 text-light">Preprocessor Editor</h5>

        <textarea
          className="form-control code"
          spellCheck={false}
          value={song}
          onChange={(e) => setSong(e.target.value)}
          rows={12}
          style={{
            minHeight: '320px',
            maxHeight: '320px',
            overflow: 'auto',
            resize: 'vertical', // optional: allow dragging height
          }}
        />
      </div>
    </div>
  );
}
