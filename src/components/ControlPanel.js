// src/components/ControlPanel.js
export default function ControlPanel({ ui, setUi }) {
    const instruments = ui.instruments || {};
    const tracks = ui.tracks || {};
  
    const setInstrument = (k, mode) => {
      setUi((s) => ({
        ...s,
        instruments: { ...s.instruments, [k]: mode },
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
  
          {/* TITLE */}
          <h5 className="card-title mb-3 d-flex justify-content-between">
            <span>Preprocessor Controls</span>
            <span className="badge bg-secondary">Bootstrap UI</span>
          </h5>
  
          {/* ============================================================
              INSTRUMENT HUSH (P1 / P2)
          ============================================================ */}
          <h6 className="text-muted mb-2">Instrument Routing</h6>
  
          {["p1", "p2"].map((k) => (
            <div className="mb-3" key={k}>
              <label className="form-label fw-semibold text-uppercase small">
                {k}
              </label>
  
              <div className="btn-group w-100" role="group">
                <input
                  type="radio"
                  className="btn-check"
                  name={`grp-${k}`}
                  id={`${k}-on`}
                  checked={instruments[k] === "on"}
                  onChange={() => setInstrument(k, "on")}
                />
                <label className="btn btn-outline-primary" htmlFor={`${k}-on`}>
                  On
                </label>
  
                <input
                  type="radio"
                  className="btn-check"
                  name={`grp-${k}`}
                  id={`${k}-hush`}
                  checked={instruments[k] === "hush"}
                  onChange={() => setInstrument(k, "hush")}
                />
                <label className="btn btn-outline-danger" htmlFor={`${k}-hush`}>
                  Hush
                </label>
              </div>
  
              <small className="text-muted">
                Maps {k} → d{k === "p1" ? "1" : "2"} (silence on hush)
              </small>
            </div>
          ))}
  
          <hr />
  
          {/* ============================================================
              SONG SECTIONS (Bass / Lead / Drums / Drums2)
          ============================================================ */}
          <h6 className="text-muted mb-2">Song Sections From Tune</h6>
  
          <ul className="list-group">
            <li className="list-group-item d-flex justify-content-between align-items-center">
              🎸 Bassline
              <div className="form-check form-switch m-0">
                <input
                  className="form-check-input"
                  type="checkbox"
                  id="track-bass"
                  checked={tracks.bass !== false}
                  onChange={(e) => setTrack("bass", e.target.checked)}
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
                  onChange={(e) => setTrack("lead", e.target.checked)}
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
                  onChange={(e) => setTrack("drums", e.target.checked)}
                />
              </div>
            </li>
  
            <li className="list-group-item d-flex justify-content-between align-items-center">
              🥁 FX Drums (Layer 2)
              <div className="form-check form-switch m-0">
                <input
                  className="form-check-input"
                  type="checkbox"
                  id="track-drums2"
                  checked={tracks.drums2 !== false}
                  onChange={(e) => setTrack("drums2", e.target.checked)}
                />
              </div>
            </li>
          </ul>
  
          <small className="text-muted d-block mt-2">
            Toggles sections defined in <code>tunes.js</code>
          </small>
        </div>
      </div>
    );
  }
  