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
