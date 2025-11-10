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

  // simple “EQ” bands (0–1 values) for D3 graph
  const [levels, setLevels] = useState([0, 0, 0, 0]);

  // guard to avoid double init under React 18 StrictMode
  const initDoneRef = useRef(false);

  // Initialise REPL once the editor mount point AND canvas exist
  useEffect(() => {
    // if we've already created the REPL once, don't do it again
    if (initDoneRef.current) return;

    let cancelled = false;

    const tryInit = () => {
      if (cancelled || initDoneRef.current) return;

      const mount = document.getElementById('editor');
      const canvas = canvasRef.current;

      if (!mount || !canvas) {
        requestAnimationFrame(tryInit);
        return;
      }

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

          // ---- update “audio activity” levels for D3 bar graph ----
          const count = Array.isArray(haps) ? haps.length : 0;
          const norm = Math.max(0, Math.min(1, count / 32)); // clamp 0..1

          setLevels((prev) => {
            const smooth = (prevVal, target, factor = 0.4) =>
              prevVal + (target - prevVal) * factor;

            const [b0 = 0, b1 = 0, b2 = 0, b3 = 0] = prev || [];
            const base = norm || 0;

            const next = [
              smooth(b0, base * 1.0), // “Bass”
              smooth(b1, base * 0.8), // “Lead”
              smooth(b2, base * 1.2), // “Drums”
              smooth(b3, base * 0.6), // “FX”
            ];

            return next.map((v) => Math.max(0, Math.min(1, v)));
          });
          // ---------------------------------------------------------
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

      // ✅ Tweak editor height so it only uses needed space
      requestAnimationFrame(() => {
        const editorEl = mount.querySelector('.cm-editor');
        if (editorEl) {
          editorEl.style.height = 'auto';
          editorEl.style.maxHeight = '320px';   // cap so it never takes over the page
          editorEl.style.overflow = 'auto';     // scroll if it gets long
        }
      });

      // mark as initialised so StrictMode's second effect run does nothing
      initDoneRef.current = true;
    };

    tryInit();

    return () => {
      cancelled = true;
      const REPL = replRef.current;
      if (!REPL) return;
      try {
        if (typeof REPL.hush === 'function') REPL.hush();
      } catch {}
      try {
        if (typeof REPL.stop === 'function') REPL.stop();
      } catch {}
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

    // expose live levels for the D3 bar chart
    get levels() {
      return levels;
    },

    async play(code) {
      const REPL = replRef.current;
      if (!REPL) return;
      try {
        await getAudioContext().resume();
      } catch {}
      if (code) REPL.setCode(code);
      setPlaying(true);
      try {
        REPL.evaluate();
      } catch {}
    },

    async stop() {
      const REPL = replRef.current;
      if (!REPL) return;
      try {
        if (typeof REPL.hush === 'function') REPL.hush();
      } catch {}
      try {
        if (typeof REPL.stop === 'function') REPL.stop();
      } catch {}
      try {
        REPL.setCode('d1 silence\nd2 silence');
        REPL.evaluate();
      } catch {}
      setPlaying(false);
      try {
        await getAudioContext().suspend();
      } catch {}
    },

    // Strong hush without changing playing state
    hushAll() {
      const REPL = replRef.current;
      if (!REPL) return;
      try {
        if (typeof REPL.hush === 'function') REPL.hush();
      } catch {}
      try {
        if (typeof REPL.stop === 'function') REPL.stop();
      } catch {}
      try {
        REPL.setCode('d1 silence\nd2 silence');
        REPL.evaluate();
      } catch {}
    },

    async suspend() {
      try {
        await getAudioContext().suspend();
      } catch {}
    },

    async resume() {
      try {
        await getAudioContext().resume();
      } catch {}
    },

    setCode(code) {
      const REPL = replRef.current;
      if (REPL) REPL.setCode(code);
    },

    evaluate() {
      const REPL = replRef.current;
      if (REPL) {
        try {
          REPL.evaluate();
        } catch {}
      }
    },
  };

  return api;
}
