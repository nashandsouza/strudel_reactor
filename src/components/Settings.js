import React, { useRef, useState } from 'react';
import { downloadJSON, readJSONFile } from '../utils/storage';

export default function Settings({ ui, song, onImport }) {
  const fileRef = useRef(null);
  const [status, setStatus] = useState('');

  const handleExport = () => {
    const payload = { ui, song, exportedAt: new Date().toISOString() };
    downloadJSON(payload, 'strudel-settings.json');
    setStatus('Settings exported.');
    setTimeout(()=>setStatus(''), 1500);
  };

  const handleImportClick = () => fileRef.current?.click();

  const handleImportFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const data = await readJSONFile(file).catch(() => null);
    if (!data || typeof onImport !== 'function') {
      setStatus('Invalid file.');
      setTimeout(()=>setStatus(''), 1500);
      return;
    }
    onImport(data);
    setStatus('Settings imported.');
    setTimeout(()=>setStatus(''), 1500);
    e.target.value = '';
  };

  return (
    <div className="card">
      <div className="card-body d-flex flex-wrap align-items-center gap-2">
        <h6 className="mb-0 me-auto">Settings</h6>
        <button className="btn btn-ghost" onClick={handleExport}>⬇️ Export JSON</button>
        <button className="btn btn-accent" onClick={handleImportClick}>⬆️ Import JSON</button>
        <input
          ref={fileRef}
          type="file"
          accept="application/json"
          style={{ display: 'none' }}
          onChange={handleImportFile}
        />
        {status && <small className="text-secondary ms-2">{status}</small>}
      </div>
    </div>
  );
}
