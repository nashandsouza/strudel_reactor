// src/components/ControlPanel.js
export default function ControlPanel({ ui, setUi }) {
  const instruments = ui.instruments || {};
  const tracks = ui.tracks || {};

  const setInstrument = (key, mode) => {
    setUi((s) => ({
      ...s,
      instruments: { ...(s.instruments || {}), [key]: mode },
    }));
  };

  const setTrack = (key, value) => {
    setUi((s) => ({
      ...s,
      tracks: { ...(s.tracks || {}), [key]: value },
    }));
  };

  return (
    <div className="card shadow-sm">
      <div className="card-body">
        <h5 className="card-title mb-3 d-flex justify-content-between text-light">
          <span>Preprocessor Controls</span>
        </h5>

        {/* Global playback mode (single hush radio group) */}
        <h6 className="text-primary mb-2">Playback Mode</h6>
        <p className="text-secondary small">
          Switch between normal playback and global hush (mute all Strudel output).
        </p>

        <div className="btn-group w-100 mb-3" role="group" aria-label="Hush toggle">
          {/* Play mode */}
          <input
            type="radio"
            className="btn-check"
            name="hush-mode"
            id="hush-off"
            checked={(instruments.mode || 'play') === 'play'}
            onChange={() => setInstrument('mode', 'play')}
          />
          <label className="btn btn-outline-light" htmlFor="hush-off">
            Play
          </label>

          {/* Hush mode */}
          <input
            type="radio"
            className="btn-check"
            name="hush-mode"
            id="hush-on"
            checked={instruments.mode === 'hush'}
            onChange={() => setInstrument('mode', 'hush')}
          />
          <label className="btn btn-outline-warning" htmlFor="hush-on">
            Hush
          </label>
        </div>

        <hr />

        {/* Track / section toggles */}
        <h6 className="text-info mb-2">Song Sections From Tune</h6>

        <ul className="list-group">
          <li className="list-group-item d-flex justify-content-between align-items-center">
            🎸 Bassline
            <div className="form-check form-switch m-0">
              <input
                className="form-check-input"
                type="checkbox"
                id="track-bass"
                checked={tracks.bass !== false}
                onChange={(e) => setTrack('bass', e.target.checked)}
              />
            </div>
          </li>

          <li className="list-group-item d-flex justify-content-between align-items-center">
            🎹 Main Arp / Lead
            <div className="form-check form-switch m-0">
              <input
                className="form-check-input"
                type="checkbox"
                id="track-lead"
                checked={tracks.lead !== false}
                onChange={(e) => setTrack('lead', e.target.checked)}
              />
            </div>
          </li>

          <li className="list-group-item d-flex justify-content-between align-items-center">
            🥁 Drums
            <div className="form-check form-switch m-0">
              <input
                className="form-check-input"
                type="checkbox"
                id="track-drums"
                checked={tracks.drums !== false}
                onChange={(e) => setTrack('drums', e.target.checked)}
              />
            </div>
          </li>

          <li className="list-group-item d-flex justify-content-between align-items-center">
            ✨ Extra Drums / FX
            <div className="form-check form-switch m-0">
              <input
                className="form-check-input"
                type="checkbox"
                id="track-drums2"
                checked={tracks.drums2 !== false}
                onChange={(e) => setTrack('drums2', e.target.checked)}
              />
            </div>
          </li>
        </ul>

        <small className="text-info d-block mt-2">
          Toggles sections defined in <code>tunes.js</code>
        </small>
      </div>
    </div>
  );
}
