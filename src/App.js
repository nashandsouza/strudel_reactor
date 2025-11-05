// src/App.js
import React, { useEffect, useMemo, useState } from 'react';
import Settings from './components/Settings';
import Header from './components/Header';
import Transport from './components/Transport';
import ControlPanel from './components/ControlPanel';
import StrudelCanvas from './components/StrudelCanvas';
import { Editor } from './components/Editor';
import { Output } from './components/Output';
import { useStrudelRepl } from './hooks/useStrudelRepl';
import { preprocess } from './utils/preprocess';
import { DEFAULT_STATE } from './utils/constants';
import { loadState, saveState } from './utils/storage';
import { stranger_tune } from './tunes';

export default function App() {
  const REPL = useStrudelRepl();
  const [playing, setPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [song, setSong] = useState(stranger_tune);
  const [ui, setUi] = useState(() => loadState(DEFAULT_STATE));

  const processed = useMemo(() => preprocess(song, ui), [song, ui]);

  useEffect(() => {
    if (!REPL.instance) return;
    REPL.setCode(processed);
    if (playing) REPL.evaluate();
  }, [processed, playing, REPL]);

  useEffect(() => { saveState(ui); }, [ui]);

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

  const handlePlay = async () => {
    // if currently muted, resume audio when playing
    if (isMuted) {
      await REPL.resume?.();
      setIsMuted(false);
    }
    await REPL.play(processed);
    setPlaying(true);
  };

  const handleStop = async () => {
    await REPL.stop();
    setPlaying(false);
  };

  // 🔁 Mute/unmute toggle
  const handleMuteToggle = async () => {
    if (!isMuted) {
      REPL.hushAll?.();      // silence patterns immediately
      await REPL.suspend?.(); // suspend audio context
      setIsMuted(true);
    } else {
      await REPL.resume?.();  // resume audio context
      if (playing) {
        try { REPL.evaluate?.(); } catch {}
        // or: await REPL.play(processed);
      }
      setIsMuted(false);
    }
  };

  const handlePreprocess = () => {
    REPL.setCode(processed);
    if (playing) REPL.evaluate();
  };

  const handleReset = () => {
    setUi(DEFAULT_STATE);
    setSong(stranger_tune);
    if (REPL.instance) {
      const code = preprocess(stranger_tune, DEFAULT_STATE);
      REPL.setCode(code);
      if (playing) REPL.evaluate();
    }
  };

  return (
    <div className="app-shell">
      <Header />

      <main className="container py-3">
        {/* TOP ROW: Transport + Controls */}
        <div className="row g-3 mb-3">
          <div className="col-12 col-lg-4">
            <Transport
              playing={playing}
              onPlay={handlePlay}
              onStop={handleStop}
              onPreprocess={handlePreprocess}
              onReset={handleReset}
              onMute={handleMuteToggle} 
              tempo={ui.tempo}
              onTempo={(val)=>setUi(s=>({...s, tempo: val}))}
              isMuted={isMuted} 
            />
          </div>

          <div className="col-12 col-lg-8">
            <ControlPanel ui={ui} setUi={setUi} />
          </div>
        </div>

        {/* SETTINGS BAR */}
        <div className="row g-3 mb-3">
          <div className="col-12">
            <Settings
              ui={ui}
              song={song}
              onImport={(data) => {
                if (data?.ui) setUi(prev => ({ ...prev, ...data.ui }));
                if (typeof data?.song === 'string') setSong(data.song);
                if (REPL.instance) {
                  const code = preprocess(data?.song ?? song, data?.ui ?? ui);
                  REPL.setCode(code);
                  if (playing) REPL.evaluate();
                }
              }}
            />
          </div>
        </div>

        {/* REPL mounts here */}
        <div id="editor" className="card h-100 mb-3">{/* StrudelMirror mounts here */}</div>

        {/* Editor + Output */}
        <div className="row g-3">
          <div className="col-12 col-xl-6">
            <Editor song={song} setSong={setSong} />
          </div>
          <div className="col-12 col-xl-6">
            <Output processed={processed} />
          </div>
        </div>

        <StrudelCanvas canvasRef={REPL.canvasRef} />
      </main>

      <footer className="py-3 text-center">
        <span className="badge-dot">React • Bootstrap • Strudel</span>
      </footer>
    </div>
  );
}
