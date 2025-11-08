// src/utils/preprocess.js

export function applyTempo(str, bpm) {
  const cpsExpr = `${bpm}/120`;
  if (/setcps\s*\(/i.test(str)) {
    return str.replace(/setcps\s*\((.*?)\)/i, `setcps(${cpsExpr})`);
  }
  return `setcps(${cpsExpr})\n${str}`;
}

/**
 * Track-level muting for named sections in tunes.js
 * - bassline:
 * - main_arp:
 * - drums:
 * - drums2:
 */
export function applyTrackToggles(str, tracks = {}) {
  let text = String(str);

  // default: if a track flag is undefined, treat it as ON
  const isOn = (key) => tracks[key] !== false; // undefined => true, false => muted

  const muteBlock = (label, key) => {
    if (isOn(key)) return;

    // match "label:" and everything after it up to the next "word:" label or end of string
    const re = new RegExp(
      `^\\s*${label}:([\\s\\S]*?)(?=^\\s*\\w+:|$)`,
      'm'
    );
    text = text.replace(re, `// ${label} muted by UI\n`);
  };

  muteBlock('bassline', 'bass');
  muteBlock('main_arp', 'lead');
  muteBlock('drums', 'drums');
  muteBlock('drums2', 'drums2');

  return text;
}

/**
 * Make Hush definitive:
 * - If a track (p1/p2) is 'hush', remove ALL existing dN lines (anywhere),
 *   then append one "dN silence" at the END so it overrides everything.
 * - If 'on', do nothing (we won't guess the user's pattern).
 */
export function applyInstrumentHush(str, instruments) {
  let text = String(str);

  const hushTrack = (trackNum, mode) => {
    if (mode !== 'hush') return;

    const removeRe = new RegExp(`^\\s*d${trackNum}\\b.*$`, 'img');
    text = text.replace(removeRe, '');

    if (!/\n$/.test(text)) text += '\n';

    text += `d${trackNum} silence\n`;
  };

  hushTrack(1, instruments.p1);
  hushTrack(2, instruments.p2);

  return text;
}

export function preprocess(originalSong, state) {
  if (!originalSong) return '';
  let text = String(originalSong);

  const radio = (k) => (state.instruments[k] === 'on' ? '' : '_');
  text = text
    .replaceAll('<p1_Radio>', radio('p1'))
    .replaceAll('<p2_Radio>', radio('p2'))
    .replaceAll('<tempo>', String(state.tempo))
    .replaceAll('<reverb_send>', String(state.reverb))
    .replaceAll('<filter_on>', state.filterOn ? 'on' : 'off')
    .replaceAll('<master_gain>', String(state.master));

  text = applyTempo(text, state.tempo);
  text = applyTrackToggles(text, state.tracks || {}); // ✅ NEW: mute bass/lead/drums sections
  text = applyInstrumentHush(text, state.instruments);

  return text;
}
