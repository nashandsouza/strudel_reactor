export function applyTempo(str, bpm) {
    const cpsExpr = `${bpm}/120`;
    if (/setcps\s*\(/i.test(str)) {
    return str.replace(/setcps\s*\((.*?)\)/i, `setcps(${cpsExpr})`);
    }
    return `setcps(${cpsExpr})\n${str}`;
    }
    
    
    // Instrument radios (no tags needed): p1 ↔ d1, p2 ↔ d2. hush => “dN silence”
    export function applyInstrumentHush(str, instruments) {
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
    text = applyInstrumentHush(text, state.instruments); // hush wins
    return text;
    }