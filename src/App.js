import React, { useEffect, useMemo, useRef, useState } from 'react';
import { StrudelMirror } from '@strudel/codemirror';
import { evalScope } from '@strudel/core';
import { drawPianoroll } from '@strudel/draw';
import { initAudioOnFirstClick, getAudioContext, webaudioOutput, registerSynthSounds } from '@strudel/webaudio';
import { transpiler } from '@strudel/transpiler';
import { registerSoundfonts } from '@strudel/soundfonts';
import { stranger_tune } from './tunes';

/* -------------------- Helpers -------------------- */

// Force BPM via setcps(bpm/120). Replace existing or add if missing.
function applyTempo(str, bpm) {
  const cpsExpr = `${bpm}/120`;
  if (/setcps\s*\(/i.test(str)) {
    return str.replace(/setcps\s*\((.*?)\)/i, `setcps(${cpsExpr})`);
  }
  return `setcps(${cpsExpr})\n${str}`;
}

// Instrument radios (no tags needed): p1 ↔ d1, p2 ↔ d2. hush => “dN silence”
function applyInstrumentHush(str, instruments) {
  let s = str;
  const applyFor = (trackNum, onOff) => {
    const re = new RegExp(`^(\\s*)d${trackNum}\\b.*$`, 'im');
    const m = s.match(re);
    if (!m) return;
    if (onOff === 'hush') s = s.replace(re, `${m[1]}d${trackNum} silence`);
  };
  applyFor(1, instruments.p1);
  applyFor(2, instruments.p2);
  return s;
}

/* -------------------- Preprocessor -------------------- */
function preprocess(originalSong, state) {
  if (!originalSong) return '';
  let text = String(originalSong);

  // Respect existing tags if present
  const radio = (k) => (state.instruments[k] === 'on' ? '' : '_');
  text = text
    .replaceAll('<p1_Radio>', radio('p1'))
    .replaceAll('<p2_Radio>', radio('p2'))
    .replaceAll('<tempo>', String(state.tempo))
    .replaceAll('<reverb_send>', String(state.reverb))
    .replaceAll('<filter_on>', state.filterOn ? 'on' : 'off')
    .replaceAll('<master_gain>', String(state.master)); // harmless if unused

  // Enforce audible behaviour regardless of tags
  text = applyTempo(text, state.tempo);
  text = applyInstrumentHush(text, state.instruments); // hush wins

  return text;
}

/* -------------------- Header -------------------- */
function Header() {
  return (
    <header className="appbar py-3 px-3 sticky-top">
      <div className="container-fluid d-flex align-items-center gap-3">
        <span className="badge-dot"><strong>Strudel Reactor</strong></span>
        <span className="text-secondary">Nashan Dsouza</span>
      </div>
    </header>
  );
}

/* -------------------- Main App -------------------- */
let REPL = null;

const DEFAULT_STATE = {
  tempo: 120,
  master: 70, // no volume slider now
  instruments: { p1: 'on', p2: 'hush' },
  reverb: 10,
  filterOn: false,
};

export default function App() {
  const hasRun = useRef(false);
  const canvasRef = useRef(null);

  const [playing, setPlaying] = useState(false);
  const [song, setSong] = useState(stranger_tune);
  const [ui, setUi] = useState(DEFAULT_STATE);

  const processed = useMemo(() => preprocess(song, ui), [song, ui]);

  // Strudel REPL init
  useEffect(() => {
    if (hasRun.current) return;
    hasRun.current = true;

    const canvas = canvasRef.current;
    if (canvas) {
      canvas.width = canvas.width * 2;
      canvas.height = canvas.height * 2;
    }
    const ctx = canvas?.getContext('2d');
    const drawTime = [-2, 2];

    REPL = new StrudelMirror({
      defaultOutput: webaudioOutput,
      getTime: () => getAudioContext().currentTime,
      transpiler,
      root: document.getElementById('editor'),
      drawTime,
      onDraw: (haps, time) => {
        if (!ctx) return;
        drawPianoroll({ haps, time, ctx, drawTime, fold: 0 });
      },
      prebake: async () => {
        initAudioOnFirstClick();
        const loadModules = evalScope(
          import('@strudel/core'),
          import('@strudel/draw'),
          import('@strudel/mini'),
          import('@strudel/tonal'),
          import('@strudel/webaudio'),
        );
        await Promise.all([loadModules, registerSynthSounds(), registerSoundfonts()]);
      },
    });

    REPL.setCode(processed);
  }, []); // once

  // Push new code and re-evaluate while playing → live audible updates
  useEffect(() => {
    if (!REPL) return;
    REPL.setCode(processed);
    if (playing) {
      try { REPL.evaluate(); } catch {}
    }
  }, [processed, playing]);

  /* -------- Transport handlers -------- */
  const handlePlay = async () => {
    if (!REPL) return;
    try { await getAudioContext().resume(); } catch {}
    REPL.setCode(processed);
    setPlaying(true);
    REPL.evaluate();
  };

  const handleStop = async () => {
    if (!REPL) return;
    try { if (typeof REPL.hush === 'function') REPL.hush(); } catch {}
    try { if (typeof REPL.stop === 'function') REPL.stop(); } catch {}
    try {
      // Force silence code just in case anything is queued
      REPL.setCode('d1 silence\nd2 silence');
      REPL.evaluate();
    } catch {}
    setPlaying(false);
    try { await getAudioContext().suspend(); } catch {}
  };

  // Hard mute (panic hush) without changing playing state
  const handleMute = () => {
    if (!REPL) return;
    try { if (typeof REPL.hush === 'function') REPL.hush(); } catch {}
  };

  const handlePreprocess = () => {
    if (!REPL) return;
    REPL.setCode(processed);
    if (playing) REPL.evaluate();
  };

  const handleReset = () => {
    setUi(DEFAULT_STATE);
    setSong(stranger_tune);
    if (REPL) {
      const code = preprocess(stranger_tune, DEFAULT_STATE);
      REPL.setCode(code);
      if (playing) REPL.evaluate();
    }
  };

  // Spacebar toggle
  useEffect(() => {
    const onKey = (e) => {
      if (e.code === 'Space') {
        e.preventDefault();
        (playing ? handleStop : handlePlay)();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [playing]);

  /* -------------------- UI blocks -------------------- */
  const Transport = () => (
    <div className={`card h-100 ${playing ? 'playing' : ''}`}>
      <div className="card-body">
        <h5 className="card-title mb-3"><span className="play-led"/>Transport</h5>

        <div className="row g-2 mb-3">
          <div className="col-6 d-grid">
            <button className="btn btn-success" onClick={handlePlay} disabled={playing}>▶ Play</button>
          </div>

          {/* Stop is always clickable (more robust) */}
          <div className="col-6 d-grid">
            <button className="btn btn-outline-light" onClick={handleStop}>■ Stop</button>
          </div>

          <div className="col-6 d-grid">
            <button className="btn btn-accent" onClick={handlePreprocess}>⚙ Preprocess → REPL</button>
          </div>
          <div className="col-6 d-grid">
            <button className="btn btn-ghost" onClick={handleReset}>↺ Reset</button>
          </div>

          {/* Panic mute */}
          <div className="col-12 d-grid">
            <button className="btn btn-danger" onClick={handleMute}>🔇 Mute</button>
          </div>
        </div>

        <label className="form-label">Tempo: {ui.tempo} BPM</label>
        <input
          type="range" min={40} max={220} className="form-range mb-3"
          value={ui.tempo}
          onChange={e=>setUi(s=>({...s, tempo:Number(e.target.value)||120}))}
        />

        <small className="text-secondary">Hotkey: <kbd>Space</kbd> play/stop</small>
      </div>
    </div>
  );

  const ControlPanel = () => (
    <div className="card h-100">
      <div className="card-body">
        <h5 className="card-title">Preprocessor Controls</h5>
        <p className="text-secondary small">
          Hush radios work without tags; tempo updates live while playing.
        </p>

        <div className="mb-3">
          <h6 className="mb-2">Instruments (Hush)</h6>
          {['p1','p2'].map(k => (
            <div className="mb-2" key={k}>
              <label className="form-label text-uppercase mb-1">{k}</label>
              <div className="btn-group w-100" role="group">
                <input type="radio" className="btn-check" name={`r-${k}`} id={`${k}-on`}
                       checked={ui.instruments[k]==='on'}
                       onChange={()=>setUi(s=>({...s, instruments:{...s.instruments,[k]:'on'}}))}/>
                <label className={`btn ${ui.instruments[k]==='on'?'btn-primary':'btn-outline-primary'}`} htmlFor={`${k}-on`}>On</label>

                <input type="radio" className="btn-check" name={`r-${k}`} id={`${k}-hush`}
                       checked={ui.instruments[k]==='hush'}
                       onChange={()=>setUi(s=>({...s, instruments:{...s.instruments,[k]:'hush'}}))}/>
                <label className={`btn ${ui.instruments[k]==='hush'?'btn-primary':'btn-outline-primary'}`} htmlFor={`${k}-hush`}>Hush</label>
              </div>
              <div className="form-text">Maps {k} → d{ k === 'p1' ? '1' : '2' } (replaces line with <code>silence</code> when Hush)</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const Editor = () => (
    <div className="card h-100">
      <div className="card-body">
        <h5 className="card-title mb-2">Preprocessor Editor</h5>
        <textarea className="form-control code" spellCheck={false} value={song}
                  onChange={e=>setSong(e.target.value)}/>
      </div>
    </div>
  );

  const Output = () => (
    <div className="card h-100">
      <div className="card-body">
        <h5 className="card-title">Processed Output</h5>
        <textarea className="form-control code" readOnly value={processed}/>
      </div>
    </div>
  );

  return (
    <div className="app-shell">
      <Header />

      <main className="container py-3">
        <div className="row g-3">
          <div className="col-12 col-lg-4"><Transport/></div>
          <div className="col-12 col-lg-8"><ControlPanel/></div>

          <div className="col-12 col-xl-6"><Editor/></div>

          {/* REPL mounts here (required for Play/Stop/Preprocess) */}
          <div className="col-12 col-xl-6">
            <div id="editor" className="card h-100">{/* StrudelMirror mounts here */}</div>
          </div>

          <div className="col-12 col-xl-6"><Output/></div>
        </div>

        <div className="mt-3"><canvas id="roll" ref={canvasRef}></canvas></div>
      </main>

      <footer className="py-3 text-center">
        <span className="badge-dot">React • Bootstrap • Strudel</span>
      </footer>
    </div>
  );
}