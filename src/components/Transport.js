// src/components/Transport.jsx
export default function Transport({
    playing,
    onPlay,
    onStop,
    onPreprocess,
    onReset,
    onMute,
    tempo,
    onTempo,
    isMuted, // 🔇 show toggle label
  }) {
    return (
      <div className={`card h-100 ${playing ? 'playing' : ''}`}>
        <div className="card-body">
          <h5 className="card-title mb-3"><span className="play-led"/>Transport</h5>
  
          <div className="row g-2 mb-3">
            <div className="col-6 d-grid">
              <button className="btn btn-success" onClick={onPlay} disabled={playing}>▶ Play</button>
            </div>
            <div className="col-6 d-grid">
              <button className="btn btn-outline-light" onClick={onStop}>■ Stop</button>
            </div>
            <div className="col-6 d-grid">
              <button className="btn btn-accent" onClick={onPreprocess}>⚙ Preprocess → REPL</button>
            </div>
            <div className="col-6 d-grid">
              <button className="btn btn-ghost" onClick={onReset}>↺ Reset</button>
            </div>
  
            {/* Toggle mute */}
            <div className="col-12 d-grid">
              <button className="btn btn-danger" onClick={onMute}>
                {isMuted ? '🔊 Unmute' : '🔇 Mute'}
              </button>
            </div>
          </div>
  
          <label className="form-label">Tempo: {tempo} BPM</label>
          <input
            type="range"
            min={40}
            max={220}
            className="form-range mb-3"
            value={tempo}
            onChange={(e)=>onTempo(Number(e.target.value)||120)}
          />
          <small className="text-secondary">Hotkey: <kbd>Space</kbd> play/stop</small>
        </div>
      </div>
    );
  }
  