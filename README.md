# 🎵 LoopConductor Pro v3 — Multi-Track Edition

### Modular Web Audio Sequencer • Global Control • Visual Oscilloscopes

[▶ **Live Demo**](https://elishaparker.github.io/Loop-Conductor-Pro/)

---

## 🚀 Overview

**LoopConductor Pro v3** transforms the browser into a live modular music workstation.
It expands on the v2 single-track engine with **multi-track mixing**, **global playback**, and **waveform customization** — all rendered and synchronized through the Web Audio API.
Every track operates as an independent synth channel with its own oscilloscope, color, tone, and modulation profile.

---

## 🧠 Key Features

| Category                   | Description                                                   |
| -------------------------- | ------------------------------------------------------------- |
| **Global Play / Stop**     | One control bar manages all tracks in sync                    |
| **Add / Remove Tracks**    | Build or trim your layout dynamically                         |
| **Auto-Numbered Titles**   | Each new panel labels itself “Track 1… N”                     |
| **Cloned Track Templates** | New tracks inherit the previous track’s settings              |
| **Waveform Selector**      | Choose `sine`, `square`, `sawtooth`, or `triangle` per track  |
| **Compact Oscilloscope**   | Real-time waveform display, adjustable color & line thickness |
| **LFO Controls**           | Independent pitch, pan, and volume modulators                 |
| **Envelope Smoothing**     | Eliminates clicks on note transitions                         |
| **Full Pitch Range**       | Supports A0 – C8 with custom base-pitch tuning                |
| **Responsive Layout**      | Tracks align horizontally and wrap gracefully                 |

---

## 🎛️ Controls Per Track

| Control          | Type         | Default     | Function                        |
| ---------------- | ------------ | ----------- | ------------------------------- |
| Bars             | Text         | 4/4         | Time-signature (beats per loop) |
| BPM              | Number       | 120         | Tempo (beats / minute)          |
| Notes            | Text         | C4-D4-E4-G4 | Note sequence                   |
| Base Pitch (Hz)  | Number       | 440         | Master tuning (A4 = BasePitch)  |
| Waveform         | Dropdown     | sine        | Select oscillator shape         |
| LFO Pitch (Hz)   | Number       | 0           | Vibrato rate                    |
| LFO Pan (Hz)     | Number       | 0           | Stereo oscillation rate         |
| LFO Volume (Hz)  | Number       | 0           | Tremolo rate                    |
| Master Volume    | Range        | 0.8         | Output gain                     |
| Line Thickness   | Range        | 2           | Oscilloscope stroke width       |
| Line Color       | Color Picker | #00ff00     | Waveform color                  |
| 🗑️ Remove Track | Button       | —           | Deletes the panel               |

---

## ⚙️ Architecture

Built with **JavaScript ES Modules**, **Web Audio API**, and **HTML5 Canvas**.

### Audio Routing

```
Oscillator → Gain → MasterGain → Analyser → AudioContext.destination
```

### Visualization Flow

```
AnalyserNode → ByteTimeDomainData → Canvas (≈60 FPS render)
```

---

## 🧩 Getting Started

```bash
# Clone the repository
git clone https://github.com/ElishaParker/Loop-Conductor-Pro.git
cd Loop-Conductor-Pro

# Open in browser
start index.html   # (Windows)
open index.html    # (macOS)
```

Or run the [**Live Demo**](https://elishaparker.github.io/Loop-Conductor-Pro/) directly.

---

## 🧠 Tips & Usage

* Use **Base Pitch** to retune the entire instrument (e.g., 432 Hz or 528 Hz).
* **Add Track** to layer harmonies or percussion patterns; cloned parameters let you vary only what you need.
* Adjust oscilloscope color and thickness for visual rhythm alignment.
* Explore waveform types to sculpt timbre.
* For quieter blending, balance **Master Volume** per track.

---

## 🧪 Planned Roadmap

| Version  | Feature                                 |
| -------- | --------------------------------------- |
| **v3.1** | Preset save/load (localStorage)         |
| **v3.2** | Waveform morphing & custom LFO depth    |
| **v3.3** | FX bus (delay/reverb)                   |
| **v3.4** | Multi-clock sync / external MIDI bridge |

---

## 🧾 License

© 2025 Elisha Blue Parker. All Rights Reserved.
Licensed for personal and commercial music production use.
Redistribution, reverse-engineering, or resale of source code or assets is prohibited without written permission.

---

## 🌌 Credits & Philosophy

LoopConductor Pro is the result of a collaboration between Elisha Blue Parker and Lennard — an experiment in bridging logic and creativity.
It treats sound as both signal and story: a living loop where code conducts rhythm, and every frequency becomes a thread in the human-AI symphony.

