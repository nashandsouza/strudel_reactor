import React, { useState } from 'react';

const PRESETS = {
  default: {
    label: 'Default',
    ui: { tempo: 120, reverb: 10, filterOn: false, master: 70, instruments: { p1: 'on', p2: 'hush' } },
  },
  chill: {
    label: 'Lo-Fi Chill (slow, roomy)',
    ui: { tempo: 80, reverb: 40, filterOn: true, master: 65, instruments: { p1: 'on', p2: 'on' } },
  },
  fast: {
    label: 'Fast Arps (bright)',
    ui: { tempo: 160, reverb: 15, filterOn: false, master: 75, instruments: { p1: 'on', p2: 'on' } },
  },
  deep: {
    label: 'Deep Reverb (spacey)',
    ui: { tempo: 110, reverb: 70, filterOn: true, master: 60, instruments: { p1: 'on', p2: 'hush' } },
  },
  // Optional: include a tiny demo song
  miniBeat: {
    label: 'Mini Beat (loads demo)',
    ui: { tempo: 120, reverb: 20, filterOn: false, master: 70, instruments: { p1: 'on', p2: 'on' } },
    song:
`// mini demo
setcps(120/120)
d1 "bd ~ sn ~" # gain 1
d2 "hh*4" # gain 0.8`
  },
};

export default function PresetDropdown({ onApply }) {
  const [key, setKey] = useState('default');

  const handleChange = (e) => {
    const k = e.target.value;
    setKey(k);
    const preset = PRESETS[k];
    if (preset && typeof onApply === 'function') onApply(preset);
  };

  return (
    <div className="card">
      <div className="card-body d-flex align-items-center gap-3">
        <h6 className="mb-0">Presets</h6>
        <select className="form-select w-auto" value={key} onChange={handleChange}>
          {Object.entries(PRESETS).map(([k, p]) => (
            <option key={k} value={k}>{p.label}</option>
          ))}
        </select>
        <small className="text-secondary">Quickly apply UI settings (and optional demo song).</small>
      </div>
    </div>
  );
}
