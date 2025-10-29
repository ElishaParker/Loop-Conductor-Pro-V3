# 🎵 Loop Conductor Pro v3.3  
**A modular web-based multi-track loop synthesizer**  
[Live Demo → https://elishaparker.github.io/Loop-Conductor-Pro-V3/](https://elishaparker.github.io/Loop-Conductor-Pro-V3/)

---

## 🎧 Overview
**Loop Conductor Pro** is a browser-based modular synth and loop sequencer that allows you to create evolving rhythmic and tonal landscapes directly in your browser.  
Each track operates as an independent oscillator channel with customizable:
- Waveform (sine, square, triangle, saw)
- BPM, bars, and base frequency
- LFOs for pitch, pan, and volume (each with depth and speed controls)
- Global master volume, play/stop, and dynamic track addition

The interface is fully responsive, running smoothly on both **desktop and Android mobile** — optimized for live performance and portable creation.

---

## 🧠 Technical Architecture
Built entirely in **HTML5, CSS3, and vanilla JavaScript**, Loop Conductor Pro is powered by the **Web Audio API** and dynamic DOM rendering.  
Each track is independently generated, creating real-time frequency synthesis with low-latency control mapping.

**Core modules:**
- `loopconductor.js` — Audio engine, track management, oscillator routing  
- `style.css` — Minimal dark-theme responsive layout  
- `index.html` — UI + event controller + splash + scaling logic  
- `screencontroller.js` — Dynamic viewport scaling for uniform visual performance  

---

## 📱 Cross-Platform Design
Loop Conductor Pro v3.3 uses adaptive scaling logic for unified visual output across:
- Desktop browsers (Chrome, Edge, Firefox)
- Android mobile browsers (Chrome/Brave)
- GitHub Pages deployment via static assets

> ✅ Current version tested and verified on Android Chrome, Windows Edge, and Chrome (desktop).  

---

## 💡 Features
- Multi-track looping with additive layering  
- Live-adjustable LFO depth & speed  
- Frequency-based modulation synced to BPM  
- Horizontal scroll for infinite track expansion  
- Smooth scaling via `transform` matrix for consistent layout  
- Instant audio engine initialization with click activation (browser-safe)  
- Animated LFO waveform preview per track  

---

## 🧩 Planned Additions (v3.4)
- Auto-scale detection for mobile vs. desktop
- PWA (Progressive Web App) support for offline use
- Session save/load
- Built-in sample playback & waveform visualization
- MIDI-in support for live external control

---

## 🌐 SEO / Meta
**Title:** Loop Conductor Pro — Modular Web Synthesizer  
**Description:** Create, layer, and perform evolving sound loops directly in your browser. A modular, cross-platform Web Audio sequencer by Elisha B. Parker.  
**Keywords:** web synth, audio loop, modular DAW, LFO generator, Web Audio API, sound design, Elisha Parker, browser sequencer  

---

## 💜 Support the Creator
Development and hosting are maintained by **Elisha B. Parker**.  
If you enjoy this project or use it in your work, consider supporting open development:  
👉 [paypal.me/iamvibration](https://paypal.me/iamvibration)

---

## ⚙️ License
© 2025 Elisha B. Parker.  
All rights reserved. Code and design are proprietary unless explicit permission is granted.  
For collaboration or licensing inquiries, please contact via the project repository.

---

**Live Demo:** [https://elishaparker.github.io/Loop-Conductor-Pro-V3/](https://elishaparker.github.io/Loop-Conductor-Pro-V3/)  
**Creator:** [Elisha B. Parker](https://paypal.me/iamvibration)  
