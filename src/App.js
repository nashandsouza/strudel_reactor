import React, { useEffect, useMemo, useRef, useState } from 'react';
import { StrudelMirror } from '@strudel/codemirror';
import { evalScope } from '@strudel/core';
import { drawPianoroll } from '@strudel/draw';
import { initAudioOnFirstClick, getAudioContext, webaudioOutput, registerSynthSounds } from '@strudel/webaudio';
import { transpiler } from '@strudel/transpiler';
import { registerSoundfonts } from '@strudel/soundfonts';
import { stranger_tune } from './tunes';








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
  