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
- Stranger Things theme (This is a Tester)
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
```

## Song Code Used Starter
```
export const stranger_tune = `setcps(140/60/4)

samples('github:algorave-dave/samples')
samples('https://raw.githubusercontent.com/tidalcycles/Dirt-Samples/master/strudel.json')
samples('https://raw.githubusercontent.com/Mittans/tidal-drum-machines/main/machines/tidal-drum-machines.json')

const gain_patterns = [
  "2",
  "{0.75 2.5}*4",
    "{0.75 2.5!9 0.75 2.5!5 0.75 2.5 0.75 2.5!7 0.75 2.5!3 <2.5 0.75> 2.5}%16",
]

const drum_structure = [
"~",
"x*4",
"{x ~!9 x ~!5 x ~ x ~!7 x ~!3 < ~ x > ~}%16",
]

const basslines = [
  "[[eb1, eb2]!16 [f2, f1]!16 [g2, g1]!16 [f2, f1]!8 [bb2, bb1]!8]/8",
  "[[eb1, eb2]!16 [bb2, bb1]!16 [g2, g1]!16 [f2, f1]!4 [bb1, bb2]!4 [eb1, eb2]!4 [f1, f2]!4]/8"
]

const arpeggiator1 = [
"{d4 bb3 eb3 d3 bb2 eb2}%16",
"{c4 bb3 f3 c3 bb2 f2}%16",
"{d4 bb3 g3 d3 bb2 g2}%16",
"{c4 bb3 f3 c3 bb2 f2}%16",
]

const arpeggiator2 = [
"{d4 bb3 eb3 d3 bb2 eb2}%16",
"{c4 bb3 f3 c3 bb2 f2}%16",
"{d4 bb3 g3 d3 bb2 g2}%16",
"{d5 bb4 g4 d4 bb3 g3 d4 bb3 eb3 d3 bb2 eb2}%16",
]


const pattern = 0
const bass = 0

bassline:
note(pick(basslines, bass))
.sound("supersaw")
.postgain(2)
.room(0.6)
.lpf(700)
.room(0.4)
.postgain(pick(gain_patterns, pattern))


main_arp: 
note(pick(arpeggiator1, "<0 1 2 3>/2"))
.sound("supersaw")
.lpf(300)
.adsr("0:0:.5:.1")
.room(0.6)
.lpenv(3.3)
.postgain(pick(gain_patterns, pattern))


drums:
stack(
  s("tech:5")
  .postgain(6)
  .pcurve(2)
  .pdec(1)
  .struct(pick(drum_structure, pattern)),

  s("sh").struct("[x!3 ~!2 x!10 ~]")
  .postgain(0.5).lpf(7000)
  .bank("RolandTR808")
  .speed(0.8).jux(rev).room(sine.range(0.1,0.4)).gain(0.6),

  s("{~ ~ rim ~ cp ~ rim cp ~!2 rim ~ cp ~ < rim ~ >!2}%8 *2")
  .bank("[KorgDDM110, OberheimDmx]").speed(1.2)
  .postgain(.25),
)

drums2: 
stack(
  s("[~ hh]*4").bank("RolandTR808").room(0.3).speed(0.75).gain(1.2),
  s("hh").struct("x*16").bank("RolandTR808")
  .gain(0.6)
  .jux(rev)
  .room(sine.range(0.1,0.4))
  .postgain(0.5),
  
  s("[psr:[2|5|6|7|8|9|12|24|25]*16]?0.1")
  .gain(0.1)
  .postgain(pick(gain_patterns, pattern))
  .hpf(1000)
  .speed(0.5)
  .rarely(jux(rev)),
)
//Remixed and reproduced from Algorave Dave's code found here: https://www.youtube.com/watch?v=ZCcpWzhekEY
// all(x => x.gain(mouseX.range(0,1)))
// all(x => x.log())

// @version 1.2`;

```


## AI Tools Used

**Tool:** ChatGPT  
**Inputs Provided:** debugging, UI formatting help 

---
