// src/components/Editor.js
import React from 'react';

export function Editor({ song, setSong }) {
  return (
    <div className="card">
      <div className="card-body">
        <h5 className="card-title mb-2">Preprocessor Editor</h5>
        <textarea
          className="form-control code"
          spellCheck={false}
          value={song}
          onChange={(e) => setSong(e.target.value)}
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
