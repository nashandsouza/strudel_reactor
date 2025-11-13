# Project Documentation

## Controls Overview

### **Settings Panel**
- **Tempo Slider** – updates BPM live using `setcps(bpm/120)`.  
- **Mute Button** – toggles audio output.  
- **Play / Stop** – controls Strudel playback.  
- **Instrument Toggles (p1, p2)** – enable or disable pattern streams.

### **Editor**
- Built using StrudelMirror (`CodeMirror`).  
- Accepts Strudel pattern code.  
- Preprocesses code (e.g., injects tempo).  
- Errors handled via try/catch — displayed safely.

### **Output Panel**
Displays the preprocessed Strudel code **before** playback begins.

### **Transport Controls**
- Initializes WebAudio on first user click.  
- Starts / stops the REPL engine.

### **Piano-Roll Canvas**
Visualises musical patterns using `drawPianoroll()`.

---

## Quirks & Notes

> [!NOTE]
> Browser audio requires user interaction. Playback starts only after your first click.

- `setcps()` is auto-inserted if user code does not define tempo.  
- Some transforms may play correctly but not appear visually.  
- Editor and output must stay in sync — preprocessing ensures this.

---

## Song Code Used
List sources used:

setcps(0.7);

p1: n("0 2 4 6 7 6 4 2")
  .scale("<c3:major>/2")
  .s("supersaw")
  .distort(0.7)
  .superimpose((x) => x.detune("<0.5>"))
  .lpenv(perlin.slow(3).range(1, 4))
  .lpf(perlin.slow(2).range(100, 2000))
  .gain(0.3);
p2: "<a1 e2>/8".clip(0.8).struct("x*8").s("supersaw").note();

---

## AI Tools Used

**Tool:** ChatGPT  
**Inputs Provided:** debugging, UI formatting help 

---
