/* ===== LoopConductor Pro Core ===== */

let globalMasterGain = null;
let tracks = [];

/* Initialize shared AudioContext once */
if (!window.sharedAudioCtx) {
  window.sharedAudioCtx = new (window.AudioContext || window.webkitAudioContext)();
}
const audioCtx = window.sharedAudioCtx;

/* === Utility === */
function noteToFrequency(note, basePitch = 440) {
  const noteRegex = /^([A-Ga-g])(#|b)?(\d)?$/;
  const map = { C: -9, D: -7, E: -5, F: -4, G: -2, A: 0, B: 2 };
  const match = note.match(noteRegex);
  if (!match) return null;
  let [, letter, accidental, octave] = match;
  letter = letter.toUpperCase();
  let semitone = map[letter];
  if (accidental === "#") semitone++;
  if (accidental === "b") semitone--;
  const oct = octave ? parseInt(octave) : 4;
  const n = semitone + (oct - 4) * 12;
  return basePitch * Math.pow(2, n / 12);
}

/* === Track Class === */
class LoopConductor {
  constructor(panel) {
    this.audioCtx = window.sharedAudioCtx;
    this.panel = panel;
    this.settings = {
      waveform: "sine",
      volume: 0.8,
      pan: 0,
      lfoPitch: 0,
      lfoPan: 0,
      lfoVol: 0,
      bars: 4,
      bpm: 120,
      notes: "C4,E4,G4,C5",
      basePitch: 440
    };
    this.initNodes();
  }

  initNodes() {
    this.gainNode = this.audioCtx.createGain();
    this.panNode = this.audioCtx.createStereoPanner();
    this.lfo = this.audioCtx.createOscillator();
    this.lfoGain = this.audioCtx.createGain();

    this.lfo.connect(this.lfoGain);
    this.lfoGain.connect(this.gainNode.gain);
    this.gainNode.connect(globalMasterGain || this.audioCtx.destination);
    this.lfo.start();
  



  playLoop() 
    const { bpm, bars, notes, basePitch, waveform } = this.settings;
    const beatDur = 60 / bpm;
    const noteList = notes.split(/[, -]/).filter(n => n.trim() !== "");
    const loopDur = bars * beatDur;
    const now = this.audioCtx.currentTime;

    noteList.forEach((note, i) => {
      const freq = noteToFrequency(note, basePitch);
      if (!freq) return;
      const osc = this.audioCtx.createOscillator();
      osc.type = waveform;
      osc.frequency.setValueAtTime(freq, now + i * beatDur);
      const gain = this.audioCtx.createGain();
      gain.gain.setValueAtTime(this.settings.volume, now + i * beatDur);
      osc.connect(gain).connect(this.panNode).connect(globalMasterGain);
      osc.start(now + i * beatDur);
      osc.stop(now + i * beatDur + beatDur * 0.9);
    });

    setTimeout(() => this.playLoop(), loopDur * 1000);
  }

  stopLoop() {
    this.audioCtx.close();
  }
}

/* === Global Controls === */
document.getElementById("playAll").onclick = () => {
  tracks.forEach(t => t.playLoop());
};

document.getElementById("stopAll").onclick = () => {
  if (window.sharedAudioCtx.state !== "closed") {
    window.sharedAudioCtx.suspend();
  }
};

document.getElementById("masterVol").oninput = e => {
  if (!globalMasterGain) {
    globalMasterGain = audioCtx.createGain();
    globalMasterGain.connect(audioCtx.destination);
  }
  globalMasterGain.gain.value = parseFloat(e.target.value);
};

document.getElementById("addTrack").onclick = () => {
  const container = document.getElementById("trackContainer");
  const idx = tracks.length + 1;
  const panel = document.createElement("div");
  panel.className = "track-panel";
  panel.innerHTML = `
    <div class="track-header">
      <h3>Track ${idx}</h3>
      <button class="removeTrack">×</button>
    </div>
    <label>Waveform:
      <select class="waveform">
        <option>sine</option><option>square</option>
        <option>sawtooth</option><option>triangle</option>
      </select>
    </label><br>
    <label>Bars:<input type="number" class="bars" value="4" min="1" max="32"/></label><br>
    <label>BPM:<input type="number" class="bpm" value="120" min="20" max="400"/></label><br>
    <label>Notes:<input type="text" class="notes" value="C4,E4,G4,C5"/></label><br>
    <label>Base Pitch (Hz):<input type="number" class="basePitch" value="440" min="20" max="16000"/></label><br>
    <div class="slider-row"><label>Volume</label><input type="range" class="volume" min="0" max="1" step="0.01" value="0.8"/></div>
    <div class="slider-row"><label>Pan</label><input type="range" class="pan" min="-1" max="1" step="0.01" value="0"/></div>
  `;
  container.appendChild(panel);
  const track = new LoopConductor(panel);
  tracks.push(track);

  panel.querySelector(".removeTrack").onclick = () => {
    panel.remove();
    tracks = tracks.filter(t => t !== track);
  };
};
