// src/hooks/useStrudelRepl.js
import { useEffect, useRef, useState } from 'react';
import { StrudelMirror } from '@strudel/codemirror';
import { evalScope } from '@strudel/core';
import { drawPianoroll } from '@strudel/draw';
import {
  initAudioOnFirstClick,
  getAudioContext,
  webaudioOutput,
  registerSynthSounds,
} from '@strudel/webaudio';
import { transpiler } from '@strudel/transpiler';
import { registerSoundfonts } from '@strudel/soundfonts';

export function useStrudelRepl() {
  const replRef = useRef(null);
  const canvasRef = useRef(null);
  const [playing, setPlaying] = useState(false);

  // Initialise REPL once the editor mount point AND canvas exist
  useEffect(() => {
    let cancelled = false;

    const tryInit = () => {
      if (cancelled) return;
      const mount = document.getElementById('editor');
      const canvas = canvasRef.current;

      if (!mount || !canvas) {
        requestAnimationFrame(tryInit);
        return;
      }

      // Create REPL
      const drawTime = [-2, 2];

      replRef.current = new StrudelMirror({
        defaultOutput: webaudioOutput,
        getTime: () => getAudioContext().currentTime,
        transpiler,
        root: mount,
        drawTime,
        onDraw: (haps, time) => {
          const c = canvasRef.current;
          if (!c) return;
          const ctx = c.getContext('2d');
          if (!ctx) return;
          // Clear (background matches your dark theme)
          ctx.fillStyle = '#0b0f17';
          ctx.fillRect(0, 0, c.width, c.height);
          // Use Strudel's helper to draw the piano roll
          try {
            drawPianoroll({ haps, time, ctx, drawTime, fold: 0 });
          } catch {}
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
    };

    tryInit();

    return () => {
      cancelled = true;
      const REPL = replRef.current;
      if (!REPL) return;
      try { if (typeof REPL.hush === 'function') REPL.hush(); } catch {}
      try { if (typeof REPL.stop === 'function') REPL.stop(); } catch {}
      replRef.current = null;
    };
  }, []);

  const api = {
    canvasRef,

    get instance() {
      return replRef.current;
    },

    get playing() {
      return playing;
    },

    async play(code) {
      const REPL = replRef.current;
      if (!REPL) return;
      try { await getAudioContext().resume(); } catch {}
      if (code) REPL.setCode(code);
      setPlaying(true);
      try { REPL.evaluate(); } catch {}
    },

    async stop() {
      const REPL = replRef.current;
      if (!REPL) return;
      try { if (typeof REPL.hush === 'function') REPL.hush(); } catch {}
      try { if (typeof REPL.stop === 'function') REPL.stop(); } catch {}
      try { REPL.setCode('d1 silence\nd2 silence'); REPL.evaluate(); } catch {}
      setPlaying(false);
      try { await getAudioContext().suspend(); } catch {}
    },

    // Strong hush without changing playing state
    hushAll() {
      const REPL = replRef.current;
      if (!REPL) return;
      try { if (typeof REPL.hush === 'function') REPL.hush(); } catch {}
      try { if (typeof REPL.stop === 'function') REPL.stop(); } catch {}
      try { REPL.setCode('d1 silence\nd2 silence'); REPL.evaluate(); } catch {}
    },

    async suspend() {
      try { await getAudioContext().suspend(); } catch {}
    },

    async resume() {
      try { await getAudioContext().resume(); } catch {}
    },

    setCode(code) {
      const REPL = replRef.current;
      if (REPL) REPL.setCode(code);
    },

    evaluate() {
      const REPL = replRef.current;
      if (REPL) { try { REPL.evaluate(); } catch {} }
    },
  };

  return api;
}
