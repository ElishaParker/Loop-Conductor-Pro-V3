class LoopConductor {
  constructor(panel, settings = null) {
    this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    this.masterGain = this.audioCtx.createGain();
    this.masterGain.gain.value = 0.8;
    this.masterGain.connect(this.audioCtx.destination);
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
      masterVol: 0.8,
      lineWidth: 2,
      lineColor: '#00ff00'
    };

    this.panel = panel;
    this.setupOscilloscope();
  }

  noteToFreq(note) {
    const match = note.match(/^([A-Ga-g])(#|b)?(\d)$/);
    if (!match) return null;
    const [_, letter, accidental, octaveStr] = match;
    const octave = parseInt(octaveStr);
    const noteBase = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
    let semitone = noteBase[letter.toUpperCase()];
    if (accidental === '#') semitone += 1;
    if (accidental === 'b') semitone -= 1;
    const midiNumber = (octave + 1) * 12 + semitone;
    return this.settings.basePitch * Math.pow(2, (midiNumber - 69) / 12);
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
    osc.type = this.settings.waveform;
    osc.frequency.value = freq;

    const now = this.audioCtx.currentTime;
    const duration = spb * 0.9;
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.2, now + 0.01);
    gain.gain.setValueAtTime(0.2, now + duration - 0.05);
    gain.gain.linearRampToValueAtTime(0, now + duration);

    osc.connect(gain).connect(this.masterGain);
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
      ctx.lineWidth = parseInt(this.panel.querySelector('.lineWidth').value);
      ctx.strokeStyle = this.panel.querySelector('.lineColor').value;
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

export function createTrack(container, settings) {
  const panel = document.createElement('div');
  panel.className = 'track-panel';
  panel.innerHTML = `
    <div class="track-header">
      <h2 class="track-title"></h2>
      <button class="removeTrack">🗑️</button>
    </div>
    <label>Bars:</label><input class="bars" value="4/4"><br>
    <label>BPM:</label><input class="bpm" type="number" value="120"><br>
    <label>Notes:</label><input class="notes" value="C4-D4-E4-G4"><br>
    <label>Base Pitch (Hz):</label><input class="basePitch" type="number" value="440"><br>
    <label>Waveform:</label>
    <select class="waveform">
      <option value="sine">sine</option>
      <option value="square">square</option>
      <option value="sawtooth">sawtooth</option>
      <option value="triangle">triangle</option>
    </select><br>
    <h4>Oscilloscope</h4>
    <label>Line Thickness:</label><input class="lineWidth" type="range" min="1" max="10" value="2"><br>
    <label>Line Color:</label><input class="lineColor" type="color" value="#00ff00"><br>
    <canvas class="oscilloscope" width="350" height="100"></canvas>
  `;

  container.appendChild(panel);
  const loop = new LoopConductor(panel, settings);
  panel.loopConductor = loop;

  panel.querySelector('.removeTrack').onclick = () => {
    loop.stop();
    panel.remove();
  };

  panel.dataset.settings = JSON.stringify(loop.settings);
  return panel;
}

export function playAll(tracks) {
  tracks.forEach(t => t.loopConductor?.play?.());
}

export function stopAll(tracks) {
  tracks.forEach(t => t.loopConductor?.stop?.());
}