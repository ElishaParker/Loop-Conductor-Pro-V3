//Loopconductor.js


// ===== Global Audio Engine =====
export let globalAudioCtx = null;
export let globalMasterGain = null;

// Initialize Audio Engine
export async function initializeAudio() {
if (globalAudioCtx) return;
globalAudioCtx = new (window.AudioContext || window.webkitAudioContext)();
await globalAudioCtx.resume();
globalMasterGain = globalAudioCtx.createGain();
globalMasterGain.connect(globalAudioCtx.destination);
globalMasterGain.gain.value = 0.8;
console.log("Audio engine initialized");
}

// ===== Main Track Class =====
class LoopConductor {
constructor(panel, settings = null) {
if (!globalAudioCtx || !globalMasterGain)
throw new Error("Audio engine not initialized.");

this.audioCtx = globalAudioCtx;
this.panel = panel;
this.settings = settings ? JSON.parse(settings) : {
bars: "4/4",
bpm: 120,
notes: "C4-D4-E4-G4",
basePitch: 440,
waveform: "sine",
trackVol: 0.8,
pan: 0,
lfoPitch: 0,
lfoPitchSpeed: 5,
lfoPan: 0,
lfoPanSpeed: 5,
lfoVolume: 0,
lfoVolumeSpeed: 5
};

// Create local nodes
this.masterGain = this.audioCtx.createGain();
this.panNode = this.audioCtx.createStereoPanner();
this.panNode.connect(this.masterGain);
this.masterGain.connect(globalMasterGain);

this.renderUI();
this.setupOscilloscope();
}

// ===== UI Rendering =====
renderUI() {
this.panel.className = "track-panel";
this.panel.innerHTML = `
<div class="track-header">
<h2 class="track-title"></h2>
<button class="removeTrack">🗑️</button>
</div>
<label>Bars:</label><input class="bars" value="${this.settings.bars}"><br>
<label>BPM:</label><input class="bpm" type="number" value="${this.settings.bpm}"><br>
<label>Notes:</label><input class="notes" value="${this.settings.notes}"><br>
<label>Base Pitch (Hz):</label><input class="basePitch" type="number" value="${this.settings.basePitch}" min="0" max="16000"><br>
<label>Waveform:</label>
<select class="waveform">
<option value="sine">sine</option>
<option value="square">square</option>
<option value="sawtooth">sawtooth</option>
<option value="triangle">triangle</option>
</select><br>

<div class="slider-row">
<label>Track Volume:</label>
<input class="trackVol" type="range" min="0" max="100" value="${this.settings.trackVol*100}">
<input class="valBox trackVolVal" readonly>
</div>

<div class="slider-row">
<label>Pan:</label>
<input class="pan" type="range" min="-100" max="100" value="${this.settings.pan*100}">
<input class="valBox panVal" readonly>
</div>

<!-- LFO PITCH -->
<div class="slider-row"><label>LFO Pitch Depth:</label>
<input class="lfoPitch" type="range" min="0" max="100" value="${this.settings.lfoPitch}">
<input class="valBox lfoPitchVal" readonly>
</div>
<div class="slider-row"><label>LFO Pitch Speed:</label>
<input class="lfoPitchSpeed" type="range" min="0" max="10" step="0.1" value="${this.settings.lfoPitchSpeed}">
<input class="valBox lfoPitchSpeedVal" readonly>
</div>

<!-- LFO PAN -->
<div class="slider-row"><label>LFO Pan Depth:</label>
<input class="lfoPan" type="range" min="0" max="100" value="${this.settings.lfoPan}">
<input class="valBox lfoPanVal" readonly>
</div>
<div class="slider-row"><label>LFO Pan Speed:</label>
<input class="lfoPanSpeed" type="range" min="0" max="10" step="0.1" value="${this.settings.lfoPanSpeed}">
<input class="valBox lfoPanSpeedVal" readonly>
</div>

<!-- LFO VOLUME -->
<div class="slider-row"><label>LFO Volume Depth:</label>
<input class="lfoVolume" type="range" min="0" max="100" value="${this.settings.lfoVolume}">
<input class="valBox lfoVolumeVal" readonly>
</div>
<div class="slider-row"><label>LFO Volume Speed:</label>
<input class="lfoVolumeSpeed" type="range" min="0" max="10" step="0.1" value="${this.settings.lfoVolumeSpeed}">
<input class="valBox lfoVolumeSpeedVal" readonly>
</div>

<canvas class="oscilloscope" width="350" height="100"></canvas>
`;
this.bindEvents();
}

// ===== Bind All UI Events =====
bindEvents() {
const q = s => this.panel.querySelector(s);
q(".removeTrack").onclick = () => { this.stop(); this.panel.remove(); };

const upd = (slider, box, fn) => {
box.value = slider.value;
slider.oninput = e => { box.value = e.target.value; fn(parseFloat(e.target.value)); };
};

upd(q(".trackVol"), q(".trackVolVal"), v => this.masterGain.gain.value = v / 100);
upd(q(".pan"), q(".panVal"), v => this.panNode.pan.value = v / 100);

// Live-update parameters
const live = (cls, key) => upd(q(cls), q(cls + "Val"), v => this.settings[key] = v);
live(".lfoPitch", "lfoPitch"); live(".lfoPitchSpeed", "lfoPitchSpeed");
live(".lfoPan", "lfoPan"); live(".lfoPanSpeed", "lfoPanSpeed");
live(".lfoVolume", "lfoVolume"); live(".lfoVolumeSpeed", "lfoVolumeSpeed");
}

// ===== Note to Frequency =====
noteToFreq(note) {
const match = note.match(/^([A-Ga-g])(#|b)?(\d)$/);
if (!match) return null;
const [_, letter, accidental, octaveStr] = match;
const octave = parseInt(octaveStr);
const noteBase = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
let semitone = noteBase[letter.toUpperCase()];
if (accidental === "#") semitone += 1;
if (accidental === "b") semitone -= 1;
const midi = (octave + 1) * 12 + semitone;
const baseRef = parseFloat(this.panel.querySelector(".basePitch").value) || 440;
return baseRef * Math.pow(2, (midi - 69) / 12);
}

// ===== Sequencing =====
parseSequence() {
const barsText = this.panel.querySelector(".bars").value.trim();
const [numBars] = barsText.split("/").map(n => parseInt(n));
const rawNotes = this.panel.querySelector(".notes").value.trim().split(/[-, ]+/);
let sequence = [];

if (rawNotes.length <= numBars) sequence = rawNotes;
else {
const perBar = Math.ceil(rawNotes.length / numBars);
for (let i = 0; i < rawNotes.length; i += perBar)
sequence.push(rawNotes.slice(i, i + perBar));
}
return { numBars, sequence };
}

// ===== Playback =====
getSecondsPerBeat() {
const bpm = parseFloat(this.panel.querySelector(".bpm").value) || 120;
return 60 / bpm;
}

play() {
if (this.isPlaying) return;
this.isPlaying = true;

const { numBars, sequence } = this.parseSequence();
const spb = this.getSecondsPerBeat();
const beatDur = spb * 4 / numBars;

let barIndex = 0;
const playNextBar = () => {
if (!this.isPlaying) return;
const notes = sequence[barIndex % sequence.length];
if (Array.isArray(notes)) {
const perNoteDur = beatDur / notes.length;
notes.forEach((note, i) => {
setTimeout(() => { if (note && note !== "Z") this.playNote(this.noteToFreq(note), perNoteDur); }, i * perNoteDur * 1000);
});
} else if (notes !== "Z") {
this.playNote(this.noteToFreq(notes), beatDur);
}
barIndex++;
this.loopTimer = setTimeout(playNextBar, beatDur * 1000);
};
playNextBar();
}

stop() { this.isPlaying = false; clearTimeout(this.loopTimer); }

// ===== Play Single Note =====
playNote(freq, dur) {
if (!freq) return;
const osc = this.audioCtx.createOscillator();
const gain = this.audioCtx.createGain();
const pan = this.audioCtx.createStereoPanner();

const waveform = this.panel.querySelector(".waveform").value;
osc.type = waveform;
const bpm = parseFloat(this.panel.querySelector(".bpm").value) || 120;

// Envelope
const now = this.audioCtx.currentTime;
gain.gain.setValueAtTime(0, now);
gain.gain.linearRampToValueAtTime(0.25, now + 0.02);
gain.gain.linearRampToValueAtTime(0, now + dur);

// --- LFOs ---
this.applyLFOs(osc, gain, pan, bpm, dur);

osc.frequency.value = freq;
pan.pan.value = parseFloat(this.panel.querySelector(".pan").value) / 100;

osc.connect(gain).connect(pan).connect(this.panNode);
osc.start(now);
osc.stop(now + dur);
}

applyLFOs(osc, gain, pan, bpm, dur) {
const baseRate = bpm / 60;

// Helper
const makeLfo = (depth, speed, target, scale = 1) => {
if (depth <= 0 || speed <= 0) return;
const lfo = this.audioCtx.createOscillator();
lfo.frequency.value = baseRate * (speed / 10);
const lfoGain = this.audioCtx.createGain();
lfoGain.gain.value = depth / 100 * scale;
lfo.connect(lfoGain).connect(target);
lfo.start();
lfo.stop(this.audioCtx.currentTime + dur);
return lfo;
};

makeLfo(this.settings.lfoPitch, this.settings.lfoPitchSpeed, osc.frequency, 5);
makeLfo(this.settings.lfoPan, this.settings.lfoPanSpeed, pan.pan, 1);
makeLfo(this.settings.lfoVolume, this.settings.lfoVolumeSpeed, gain.gain, 0.3);
}

// ===== Oscilloscope =====
setupOscilloscope() {
const canvas = this.panel.querySelector(".oscilloscope");
const ctx = canvas.getContext("2d");
const analyser = this.audioCtx.createAnalyser();
analyser.fftSize = 2048;
this.masterGain.connect(analyser);
const buffer = new Uint8Array(analyser.fftSize);

const draw = () => {
requestAnimationFrame(draw);
analyser.getByteTimeDomainData(buffer);
ctx.fillStyle = "#000";
ctx.fillRect(0, 0, canvas.width, canvas.height);
ctx.lineWidth = 2;
ctx.strokeStyle = "#00ff00";
ctx.beginPath();
const slice = canvas.width / buffer.length;
let x = 0;
for (let i = 0; i < buffer.length; i++) {
const v = buffer[i] / 128.0;
const y = v * canvas.height / 2;
i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
x += slice;
}
ctx.lineTo(canvas.width, canvas.height / 2);
ctx.stroke();
};
draw();
}
}

// ===== Factory + Global Functions =====
export function createTrack(container, settings) {
const panel = document.createElement("div");
container.appendChild(panel);
const track = new LoopConductor(panel, settings);
panel.loopConductor = track;
panel.dataset.settings = JSON.stringify(track.settings);
return panel;
}

export function playAll(tracks) { tracks.forEach(t => t.loopConductor?.play?.()); }
export function stopAll(tracks) { tracks.forEach(t => t.loopConductor?.stop?.()); }
export function setGlobalVolume(v) { if (globalMasterGain) globalMasterGain.gain.value = v; }

