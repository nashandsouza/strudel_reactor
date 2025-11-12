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

- `stranger_tune`  
- Bakery patterns such as:
  - `bd sd bd sd`
  - `[[superpiano]]`  
- Any additional borrowed Strudel snippets

---

## AI Tools Used

**Tool:** ChatGPT  
**Inputs Provided:** debugging, explanation of React hooks, UI formatting help, README writing  
**Outputs Used:** rewritten explanations & formatting (all code manually tested)  

---
