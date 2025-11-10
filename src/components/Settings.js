// src/components/Settings.jsx
import React, { useRef, useState } from 'react';
import { downloadJSON, readJSONFile } from '../utils/storage';

export default function Settings({ ui, song, onImport }) {
  const fileRef = useRef(null);
  const [status, setStatus] = useState('');

  const flash = (msg) => {
    setStatus(msg);
    setTimeout(() => setStatus(''), 1500);
  };

  const handleExport = () => {
    const payload = { ui, song, exportedAt: new Date().toISOString() };
    downloadJSON(payload, 'strudel-settings.json');
    flash('Settings exported.');
  };

  const handleImportClick = () => fileRef.current?.click();

  const handleImportFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const data = await readJSONFile(file).catch(() => null);
    if (!data || typeof onImport !== 'function') {
      flash('Invalid file.');
      e.target.value = '';
      return;
    }
    onImport(data);
    flash('Settings imported.');
    e.target.value = ''; // allow re-upload of same file
  };

  return (
    <div className="card">
      <div className="card-body d-flex flex-wrap align-items-center justify-content-between">
        <h6 className="mb-0 text-light">Settings</h6>

        {/* Dropdown */}
        <div className="dropdown">
          <button
            className="btn btn-accent dropdown-toggle"
            type="button"
            data-bs-toggle="dropdown"
            aria-expanded="false"
          >
            ⚙️ Actions
          </button>
          <ul className="dropdown-menu dropdown-menu-dark dropdown-menu-end">
            <li>
              <button className="dropdown-item" onClick={handleImportClick}>
                ⬆️ Import JSON
              </button>
            </li>
            <li>
              <button className="dropdown-item" onClick={handleExport}>
                ⬇️ Export JSON
              </button>
            </li>
          </ul>
        </div>

        {/* Hidden file input for Import */}
        <input
          ref={fileRef}
          type="file"
          accept="application/json"
          style={{ display: 'none' }}
          onChange={handleImportFile}
        />

        {status && <small className="text-secondary w-100 mt-2">{status}</small>}
      </div>
    </div>
  );
}
