let globalMasterGain = null;

class LoopConductor {
  constructor(panel, settings = null) {
    this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    if (!globalMasterGain) {
      globalMasterGain = this.audioCtx.createGain();
      globalMasterGain.connect(this.audioCtx.destination);
      globalMasterGain.gain.value = 0.8;
    }

    this.masterGain = this.audioCtx.createGain();
    this.masterGain.gain.value = 0.8;
    this.masterGain.connect(globalMasterGain);

    this.panNode = this.audioCtx.createStereoPanner();
    this.panNode.pan.value = 0;
    this.panNode.connect(this.masterGain);

    this.isPlaying = false;
    this.intervalId = null;
    this.currentBeat = 0;

    this.settings = settings ? JSON.parse(settings) : {
      bars: '4/4',
      bpm: 120,
      notes: 'C4-D4-E4-G4',
      basePitch: 440,
      waveform: 'sine',
      lfoPitch: 0,
      lfoPan: 0,
      lfoVolume: 0,
      trackVol: 0.8,
      pan: 0,
    };

    this.panel = panel;
    this.setupUI();
    this.setupOscilloscope();
  }

  setupUI() {
    this.panel.className = 'track-panel';
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
      <label>Track Volume:</label><input class="trackVol" type="range" min="0" max="1" step="0.01" value="${this.settings.trackVol}"><br>
      <label>Pan:</label><input class="pan" type="range" min="-1" max="1" step="0.01" value="${this.settings.pan}"><br>
      <label>LFO Pitch (Hz):</label><input class="lfoPitch" type="number" step="0.1" value="${this.settings.lfoPitch}"><br>
      <label>LFO Pan (Hz):</label><input class="lfoPan" type="number" step="0.1" value="${this.settings.lfoPan}"><br>
      <label>LFO Volume (Hz):</label><input class="lfoVolume" type="number" step="0.1" value="${this.settings.lfoVolume}"><br>
      <canvas class="oscilloscope" width="350" height="100"></canvas>
    `;

    const waveformSelect = this.panel.querySelector('.waveform');
    waveformSelect.value = this.settings.waveform;

    this.panel.querySelector('.removeTrack').onclick = () => {
      this.stop();
      this.panel.remove();
    };

    this.panel.querySelector('.trackVol').oninput = (e) => {
      this.masterGain.gain.value = parseFloat(e.target.value);
    };
    this.panel.querySelector('.pan').oninput = (e) => {
      this.panNode.pan.value = parseFloat(e.target.value);
    };
  }

  noteToFreq(note) {
    const match = note.match(/^([A-Ga-g])(#|b)?(\d)$/);
    if (!match) return null;
    const [_, letter, accidental, octaveStr] = match;
    const octave = parseInt(octaveStr);
    const base = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
    let semitone = base[letter.toUpperCase()];
    if (accidental === '#') semitone += 1;
    if (accidental === 'b') semitone -= 1;
    const midi = (octave + 1) * 12 + semitone;
    return this.settings.basePitch * Math.pow(2, (midi - 69) / 12);
  }

  getSecondsPerBeat() {
    return 60 / this.settings.bpm;
  }

  play() {
    if (this.isPlaying) return;
    this.isPlaying = true;
    const beats = parseInt(this.settings.bars.split('/')[0]);
    const spb = this.getSecondsPerBeat();
    const notes = this.settings.notes.split(/[ ,\-]+/);
    this.intervalId = setInterval(() => {
      const note = notes[this.currentBeat % notes.length];
      const freq = this.noteToFreq(note);
      if (freq) this.playNote(freq, spb);
      this.currentBeat = (this.currentBeat + 1) % beats;
    }, spb * 1000);
  }

  playNote(freq, spb) {
    const osc = this.audioCtx.createOscillator();
    const gain = this.audioCtx.createGain();
    const pan = this.audioCtx.createStereoPanner();

    const waveformSelect = this.panel.querySelector('.waveform');
    osc.type = waveformSelect.value;

    const now = this.audioCtx.currentTime;
    const duration = spb * 0.9;
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.25, now + 0.02);
    gain.gain.linearRampToValueAtTime(0, now + duration);

    osc.frequency.value = freq;
    pan.pan.value = parseFloat(this.panel.querySelector('.pan').value);

    osc.connect(gain).connect(pan).connect(this.panNode);
    osc.start(now);
    osc.stop(now + duration);
  }

  stop() {
    if (!this.isPlaying) return;
    clearInterval(this.intervalId);
    this.isPlaying = false;
    this.currentBeat = 0;
  }

  setupOscilloscope() {
    const canvas = this.panel.querySelector('.oscilloscope');
    const ctx = canvas.getContext('2d');
    const analyser = this.audioCtx.createAnalyser();
    analyser.fftSize = 2048;
    this.masterGain.connect(analyser);
    const bufferLength = analyser.fftSize;
    const dataArray = new Uint8Array(bufferLength);

    const draw = () => {
      requestAnimationFrame(draw);
      analyser.getByteTimeDomainData(dataArray);
      ctx.fillStyle = '#000';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.lineWidth = 2;
      ctx.strokeStyle = '#00ff00';
      ctx.beginPath();
      const sliceWidth = canvas.width / bufferLength;
      let x = 0;
      for (let i = 0; i < bufferLength; i++) {
        const v = dataArray[i] / 128.0;
        const y = v * canvas.height / 2;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
        x += sliceWidth;
      }
      ctx.lineTo(canvas.width, canvas.height / 2);
      ctx.stroke();
    };
    draw();
  }
}

// Factory + global
export function createTrack(container, settings) {
  const panel = document.createElement('div');
  container.appendChild(panel);
  const track = new LoopConductor(panel, settings);
  panel.loopConductor = track;
  panel.dataset.settings = JSON.stringify(track.settings);
  return panel;
}

export function playAll(tracks) {
  tracks.forEach((t) => t.loopConductor?.play?.());
}

export function stopAll(tracks) {
  tracks.forEach((t) => t.loopConductor?.stop?.());
}

export function setGlobalVolume(vol) {
  if (globalMasterGain) globalMasterGain.gain.value = vol;
}
