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
    this.masterGain.connect(globalMasterGain);
    this.panNode = this.audioCtx.createStereoPanner();
    this.panNode.connect(this.masterGain);

    this.settings = settings ? JSON.parse(settings) : {
      bars: "4/4",
      bpm: 120,
      notes: "C4-D4-E4-G4",
      basePitch: 440,
      waveform: "sine",
      trackVol: 0.8,
      pan: 0,
      lfoPitch: 0,
      lfoPan: 0,
      lfoVolume: 0
    };

    this.panel = panel;
    this.renderUI();
    this.setupOscilloscope();
  }

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
      <label>Base Pitch (Hz):</label><input class="basePitch" type="number" value="${this.settings.basePitch}"><br>
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

      <div class="slider-row">
        <label>LFO Pitch:</label>
        <input class="lfoPitch" type="range" min="0" max="100" value="${this.settings.lfoPitch}">
        <input class="valBox lfoPitchVal" readonly>
      </div>

      <div class="slider-row">
        <label>LFO Pan:</label>
        <input class="lfoPan" type="range" min="0" max="100" value="${this.settings.lfoPan}">
        <input class="valBox lfoPanVal" readonly>
      </div>

      <div class="slider-row">
        <label>LFO Volume:</label>
        <input class="lfoVolume" type="range" min="0" max="100" value="${this.settings.lfoVolume}">
        <input class="valBox lfoVolumeVal" readonly>
      </div>

      <canvas class="oscilloscope" width="350" height="100"></canvas>
    `;

    this.bindEvents();
  }

  bindEvents() {
    const q = s => this.panel.querySelector(s);
    q(".removeTrack").onclick = () => { this.stop(); this.panel.remove(); };
    const upd = (slider, box, fn) => {
      box.value = slider.value;
      slider.oninput = e => { box.value = e.target.value; fn(parseInt(e.target.value)); };
    };

    upd(q(".trackVol"), q(".trackVolVal"), v => this.masterGain.gain.value = v / 100);
    upd(q(".pan"), q(".panVal"), v => this.panNode.pan.value = v / 100);
    upd(q(".lfoPitch"), q(".lfoPitchVal"), v => this.settings.lfoPitch = v);
    upd(q(".lfoPan"), q(".lfoPanVal"), v => this.settings.lfoPan = v);
    upd(q(".lfoVolume"), q(".lfoVolumeVal"), v => this.settings.lfoVolume = v);
  }

  noteToFreq(note) {
    const m = note.match(/^([A-Ga-g])(#|b)?(\d)$/);
    if (!m) return null;
    const [_, l, a, o] = m;
    const base = { C:0,D:2,E:4,F:5,G:7,A:9,B:11 };
    let s = base[l.toUpperCase()];
    if (a==="#") s++; if (a==="b") s--;
    const midi=(parseInt(o)+1)*12+s;
    return this.settings.basePitch*Math.pow(2,(midi-69)/12);
  }

  getSecondsPerBeat(){ return 60/this.settings.bpm; }

  play(){
    if(this.isPlaying)return;
    this.isPlaying=true;
    const beats=parseInt(this.settings.bars.split("/")[0]);
    const spb=this.getSecondsPerBeat();
    const notes=this.panel.querySelector(".notes").value.split(/[ ,\-]+/);

    this.intervalId=setInterval(()=>{
      const note=notes[this.currentBeat%notes.length];
      const freq=this.noteToFreq(note);
      if(freq)this.playNote(freq,spb);
      this.currentBeat=(this.currentBeat+1)%beats;
    },spb*1000);
  }

  playNote(freq,spb){
    const osc=this.audioCtx.createOscillator();
    const gain=this.audioCtx.createGain();
    const pan=this.audioCtx.createStereoPanner();

    const waveform=this.panel.querySelector(".waveform").value;
    osc.type=waveform;

    const pitchDepth=this.settings.lfoPitch/100*5;
    if(pitchDepth>0){
      const lfo=this.audioCtx.createOscillator();
      lfo.frequency.value=2;
      const lfoGain=this.audioCtx.createGain();
      lfoGain.gain.value=pitchDepth;
      lfo.connect(lfoGain).connect(osc.frequency);
      lfo.start();
      lfo.stop(this.audioCtx.currentTime+spb);
    }

    const volDepth=this.settings.lfoVolume/100*0.3;
    if(volDepth>0){
      const lfoV=this.audioCtx.createOscillator();
      lfoV.frequency.value=2;
      const g=this.audioCtx.createGain();
      g.gain.value=volDepth;
      lfoV.connect(g).connect(gain.gain);
      lfoV.start(); lfoV.stop(this.audioCtx.currentTime+spb);
    }

    const panDepth=this.settings.lfoPan/100;
    if(panDepth>0){
      const lfoP=this.audioCtx.createOscillator();
      lfoP.frequency.value=2;
      const g=this.audioCtx.createGain();
      g.gain.value=panDepth;
      lfoP.connect(g).connect(pan.pan);
      lfoP.start(); lfoP.stop(this.audioCtx.currentTime+spb);
    }

    const now=this.audioCtx.currentTime;
    const dur=spb*0.9;
    gain.gain.setValueAtTime(0,now);
    gain.gain.linearRampToValueAtTime(0.3,now+0.02);
    gain.gain.linearRampToValueAtTime(0,now+dur);

    osc.frequency.value=freq;
    pan.pan.value=parseFloat(this.panel.querySelector(".pan").value)/100;
    osc.connect(gain).connect(pan).connect(this.panNode);
    osc.start(now); osc.stop(now+dur);
  }

  stop(){
    if(!this.isPlaying)return;
    clearInterval(this.intervalId);
    this.isPlaying=false;
    this.currentBeat=0;
  }

  setupOscilloscope(){
    const canvas=this.panel.querySelector(".oscilloscope");
    const ctx=canvas.getContext("2d");
    const analyser=this.audioCtx.createAnalyser();
    analyser.fftSize=2048;
    this.masterGain.connect(analyser);
    const bufferLength=analyser.fftSize;
    const dataArray=new Uint8Array(bufferLength);

    const draw=()=>{
      requestAnimationFrame(draw);
      analyser.getByteTimeDomainData(dataArray);
      ctx.fillStyle="#000"; ctx.fillRect(0,0,canvas.width,canvas.height);
      ctx.lineWidth=2; ctx.strokeStyle="#00ff00"; ctx.beginPath();
      const slice=canvas.width/bufferLength; let x=0;
      for(let i=0;i<bufferLength;i++){
        const v=dataArray[i]/128.0;
        const y=v*canvas.height/2;
        if(i===0)ctx.moveTo(x,y);else ctx.lineTo(x,y);
        x+=slice;
      }
      ctx.lineTo(canvas.width,canvas.height/2); ctx.stroke();
    };
    draw();
  }
}

export function createTrack(container,settings){
  const panel=document.createElement("div");
  container.appendChild(panel);
  const track=new LoopConductor(panel,settings);
  panel.loopConductor=track;
  panel.dataset.settings=JSON.stringify(track.settings);
  return panel;
}
export function playAll(tracks){ tracks.forEach(t=>t.loopConductor?.play?.()); }
export function stopAll(tracks){ tracks.forEach(t=>t.loopConductor?.stop?.()); }
export function setGlobalVolume(v){ if(globalMasterGain) globalMasterGain.gain.value=v; }
