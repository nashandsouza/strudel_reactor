# Project Documentation

## Controls Overview

### **Settings Panel**
- **Tempo Slider** – updates the global BPM live using `setcps(bpm/120)`. Changing this while the song is playing will immediately speed up or slow down the pattern without restarting playback.  
- **Mute Button** – toggles the audio output on or off while keeping the current pattern and position, so you can quickly silence the app without stopping the engine.  
- **Play / Stop** – starts and stops Strudel playback. Play will evaluate the current preprocessed code and begin audio + visualisation; Stop halts the REPL so nothing is playing.  
- **Instrument Toggles (p1, p2)** – enable or disable the two main pattern streams. This lets you solo or layer the parts (for example, turning p1 off and only hearing p2, or running them both together).

### **Editor**
- Built using StrudelMirror (`CodeMirror`) so you can type and edit Strudel pattern code with syntax highlighting.  
- Accepts plain Strudel code (patterns, transforms, tempo changes, etc.) that you would normally run in Strudel.  
- The text from the editor is passed through a small preprocessing step (for example, making sure tempo is applied consistently).  
- If the input causes a runtime error, it is caught safely instead of crashing the whole app, and the error can be inspected in the console.

### **Output Panel**
- Shows the **final preprocessed Strudel code** that will actually be sent to the engine.  
- This makes it easy for the marker to see how the app has modified or standardised the user’s original input (for example, tempo injection or minor clean-up).  
- Useful for debugging: if the song doesn’t sound right, you can compare the Editor input and the Output result.

### **Transport Controls**
- Handles the overall playback state of the app.  
- On the first interaction, it initializes the Web Audio context (required by the browser), so audio can start.  
- After that, the controls are used to start, stop, or restart playback without reloading the whole page.

### **Piano-Roll Canvas**
- Visualises the currently playing pattern as a simple piano-roll style display.  
- Updates while the music plays, so you can see note positions and density over time.  
- Helps connect what you **hear** with what you **see**, which is useful when explaining or demonstrating your pattern design.

---

## Quirks & Notes

> [!NOTE]
> Browser audio requires user interaction. Playback starts only after your first click.

- `setcps()` is automatically inserted by the preprocessing step if the user’s code does not define a tempo, so the song always has a defined BPM.  
- Some Strudel transforms and effects might not be fully visible in the piano-roll visualisation, even though they still affect the audio.  
- The Editor, Output panel, and the currently playing audio are designed to stay in sync, but if things look wrong, refreshing the page and pressing Play again will re-evaluate the latest code.

---

## Song Code Used
List sources used in this assignment:

```js
setcps(0.7);

p1: n("0 2 4 6 7 6 4 2")
  .scale("<c3:major>/2")
  .s("supersaw")
  .distort(0.7)
  .superimpose((x) => x.detune("<0.5>"))
  .lpenv(perlin.slow(3).range(1, 4))
  .lpf(perlin.slow(2).range(100, 2000))
  .gain(0.3);

p2: "<a1 e2>/8"
  .clip(0.8)
  .struct("x*8")
  .s("supersaw")
  .note();


## AI Tools Used

**Tool:** ChatGPT  
**Inputs Provided:** debugging, UI formatting help 

---
