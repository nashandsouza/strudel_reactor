import { useEffect, useRef, useState } from 'react';
import { StrudelMirror } from '@strudel/codemirror';
import { evalScope } from '@strudel/core';
import { drawPianoroll } from '@strudel/draw';
import { initAudioOnFirstClick, getAudioContext, webaudioOutput, registerSynthSounds } from '@strudel/webaudio';
import { transpiler } from '@strudel/transpiler';
import { registerSoundfonts } from '@strudel/soundfonts';

export function useStrudelRepl() {
  const replRef = useRef(null);
  const mountedRef = useRef(false);
  const canvasRef = useRef(null);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    if (mountedRef.current) return;

    const tryInit = () => {
      const rootEl = document.getElementById('editor');
      if (!rootEl) {
        
        requestAnimationFrame(tryInit);
        return;
      }

      mountedRef.current = true;

      const canvas = canvasRef.current;
      if (canvas) { canvas.width *= 2; canvas.height *= 2; }
      const ctx = canvas?.getContext('2d');
      const drawTime = [-2, 2];

      replRef.current = new StrudelMirror({
        defaultOutput: webaudioOutput,
        getTime: () => getAudioContext().currentTime,
        transpiler,
        root: rootEl,
        drawTime,
        onDraw: (haps, time) => { if (ctx) drawPianoroll({ haps, time, ctx, drawTime, fold: 0 }); },
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
  }, []);

  const api = {
    canvasRef,
    get instance() { return replRef.current; },
    get playing() { return playing; },
    async play(code) {
      const REPL = replRef.current; if (!REPL) return;
      try { await getAudioContext().resume(); } catch {}
      if (code) REPL.setCode(code);
      setPlaying(true);
      REPL.evaluate();
    },
    async stop() {
      const REPL = replRef.current; if (!REPL) return;
      try { if (typeof REPL.hush === 'function') REPL.hush(); } catch {}
      try { if (typeof REPL.stop === 'function') REPL.stop(); } catch {}
      try { REPL.setCode('d1 silence\nd2 silence'); REPL.evaluate(); } catch {}
      setPlaying(false);
      try { await getAudioContext().suspend(); } catch {}
    },
    hush() {
      const REPL = replRef.current; if (!REPL) return;
      try { if (typeof REPL.hush === 'function') REPL.hush(); } catch {}
    },
    setCode(code) { const REPL = replRef.current; if (REPL) REPL.setCode(code); },
    evaluate() { const REPL = replRef.current; if (REPL) try { REPL.evaluate(); } catch {} },
  };

  return api;
}
