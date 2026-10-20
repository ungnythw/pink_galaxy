/* ===================================================
   PINK GALAXY 20/10 - CELESTIAL WEB AUDIO ENGINE
   Zero external dependencies, pure Web Audio API synthesizer
   Dreamy celestial music box chords & cosmic sound effects
   =================================================== */

class SpaceAudioEngine {
  constructor() {
    this.audioCtx = null;
    this.isPlaying = false;
    this.masterGain = null;
    this.bgmGain = null;
    this.sfxGain = null;
    this.musicTimer = null;
    this.currentNoteIndex = 0;

    // Celestial Pentatonic Scale (Eb Major / C minor pentatonic frequencies)
    // Frequencies: Eb4, G4, Ab4, Bb4, C5, Eb5, F5, G5, Bb5, C6
    this.chords = [
      [311.13, 392.00, 466.16, 622.25], // Eb Major
      [261.63, 392.00, 523.25, 659.25], // C minor / G
      [349.23, 440.00, 523.25, 698.46], // F / Ab
      [293.66, 392.00, 440.00, 587.33]  // Bb / D
    ];
    this.currentChordIndex = 0;
  }

  init() {
    if (this.audioCtx) return;
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    this.audioCtx = new AudioContext();

    this.masterGain = this.audioCtx.createGain();
    this.masterGain.gain.setValueAtTime(0.7, this.audioCtx.currentTime);
    this.masterGain.connect(this.audioCtx.destination);

    this.bgmGain = this.audioCtx.createGain();
    this.bgmGain.gain.setValueAtTime(0.45, this.audioCtx.currentTime);
    this.bgmGain.connect(this.masterGain);

    this.sfxGain = this.audioCtx.createGain();
    this.sfxGain.gain.setValueAtTime(0.55, this.audioCtx.currentTime);
    this.sfxGain.connect(this.masterGain);
  }

  startBGM() {
    this.init();
    if (this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
    if (this.isPlaying) return;

    this.isPlaying = true;
    this.stepMelody();
  }

  stopBGM() {
    this.isPlaying = false;
    if (this.musicTimer) {
      clearTimeout(this.musicTimer);
      this.musicTimer = null;
    }
  }

  toggleBGM() {
    if (this.isPlaying) {
      this.stopBGM();
      return false;
    } else {
      this.startBGM();
      return true;
    }
  }

  // Play a soft, bell-like sine tone (celestial music box)
  playBellTone(freq, duration = 2.4, gainLevel = 0.25) {
    if (!this.audioCtx || this.audioCtx.state === 'suspended') return;
    const now = this.audioCtx.currentTime;

    const osc = this.audioCtx.createOscillator();
    const osc2 = this.audioCtx.createOscillator();
    const noteGain = this.audioCtx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, now);

    // Subtle harmonic overtone
    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(freq * 2, now);

    // Envelope
    noteGain.gain.setValueAtTime(0.0001, now);
    noteGain.gain.exponentialRampToValueAtTime(gainLevel, now + 0.04);
    noteGain.gain.exponentialRampToValueAtTime(gainLevel * 0.4, now + 0.4);
    noteGain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

    osc.connect(noteGain);
    osc2.connect(noteGain);
    noteGain.connect(this.bgmGain);

    osc.start(now);
    osc2.start(now);
    osc.stop(now + duration);
    osc2.stop(now + duration);
  }

  // Melodic arpeggio sequencer
  stepMelody() {
    if (!this.isPlaying) return;

    const chord = this.chords[this.currentChordIndex];
    const freq = chord[this.currentNoteIndex];

    this.playBellTone(freq, 2.8, 0.22);

    this.currentNoteIndex++;
    if (this.currentNoteIndex >= chord.length) {
      this.currentNoteIndex = 0;
      this.currentChordIndex = (this.currentChordIndex + 1) % this.chords.length;
    }

    // Gentle timing variation (dreamy waltz pacing)
    const delay = 480 + Math.random() * 80;
    this.musicTimer = setTimeout(() => this.stepMelody(), delay);
  }

  /* --- Crystal Sound Effects --- */

  playTwinkle() {
    this.init();
    if (this.audioCtx.state === 'suspended') this.audioCtx.resume();
    const now = this.audioCtx.currentTime;

    const notes = [880, 1174.66, 1396.91, 1760]; // A5, D6, F6, A6
    notes.forEach((freq, idx) => {
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.06);

      gain.gain.setValueAtTime(0.001, now + idx * 0.06);
      gain.gain.exponentialRampToValueAtTime(0.18, now + idx * 0.06 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.06 + 0.6);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(now + idx * 0.06);
      osc.stop(now + idx * 0.06 + 0.65);
    });
  }

  playShootingStarSound() {
    this.init();
    if (this.audioCtx.state === 'suspended') this.audioCtx.resume();
    const now = this.audioCtx.currentTime;

    const osc = this.audioCtx.createOscillator();
    const gain = this.audioCtx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(1400, now);
    osc.frequency.exponentialRampToValueAtTime(450, now + 0.7);

    gain.gain.setValueAtTime(0.001, now);
    gain.gain.exponentialRampToValueAtTime(0.2, now + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.75);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.8);
  }

  playHeartbeat() {
    this.init();
    if (this.audioCtx.state === 'suspended') this.audioCtx.resume();
    const now = this.audioCtx.currentTime;

    const beats = [0, 0.18];
    beats.forEach(timeOffset => {
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(95, now + timeOffset);
      osc.frequency.exponentialRampToValueAtTime(45, now + timeOffset + 0.15);

      gain.gain.setValueAtTime(0.001, now + timeOffset);
      gain.gain.linearRampToValueAtTime(0.35, now + timeOffset + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + timeOffset + 0.22);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(now + timeOffset);
      osc.stop(now + timeOffset + 0.25);
    });
  }

  playCutePetChirp() {
    this.init();
    if (this.audioCtx.state === 'suspended') this.audioCtx.resume();
    const now = this.audioCtx.currentTime;

    const osc = this.audioCtx.createOscillator();
    const gain = this.audioCtx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(600, now);
    osc.frequency.exponentialRampToValueAtTime(1100, now + 0.14);
    osc.frequency.exponentialRampToValueAtTime(800, now + 0.25);

    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(0.22, now + 0.03);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.32);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.35);
  }

  playRocketLaunch() {
    this.init();
    if (this.audioCtx.state === 'suspended') this.audioCtx.resume();
    const now = this.audioCtx.currentTime;

    // Powerful low rumble engine roar (Sawtooth ramp + lowpass filter sweep)
    const roarOsc = this.audioCtx.createOscillator();
    const roarFilter = this.audioCtx.createBiquadFilter();
    const roarGain = this.audioCtx.createGain();

    roarOsc.type = 'sawtooth';
    roarOsc.frequency.setValueAtTime(60, now);
    roarOsc.frequency.exponentialRampToValueAtTime(160, now + 1.2);
    roarOsc.frequency.exponentialRampToValueAtTime(75, now + 2.1);

    roarFilter.type = 'lowpass';
    roarFilter.frequency.setValueAtTime(140, now);
    roarFilter.frequency.exponentialRampToValueAtTime(1000, now + 1.1);
    roarFilter.frequency.exponentialRampToValueAtTime(250, now + 2.1);

    roarGain.gain.setValueAtTime(0.001, now);
    roarGain.gain.linearRampToValueAtTime(0.35, now + 0.35);
    roarGain.gain.exponentialRampToValueAtTime(0.0001, now + 2.2);

    roarOsc.connect(roarFilter);
    roarFilter.connect(roarGain);
    roarGain.connect(this.sfxGain);

    roarOsc.start(now);
    roarOsc.stop(now + 2.25);

    // High ascending whoosh whistle
    const whooshOsc = this.audioCtx.createOscillator();
    const whooshGain = this.audioCtx.createGain();

    whooshOsc.type = 'sine';
    whooshOsc.frequency.setValueAtTime(280, now + 0.1);
    whooshOsc.frequency.exponentialRampToValueAtTime(1500, now + 1.4);
    whooshOsc.frequency.exponentialRampToValueAtTime(600, now + 2.1);

    whooshGain.gain.setValueAtTime(0.001, now + 0.1);
    whooshGain.gain.linearRampToValueAtTime(0.25, now + 0.55);
    whooshGain.gain.exponentialRampToValueAtTime(0.0001, now + 2.15);

    whooshOsc.connect(whooshGain);
    whooshGain.connect(this.sfxGain);

    whooshOsc.start(now + 0.1);
    whooshOsc.stop(now + 2.2);
  }

  playGrandCelebrationChime() {
    this.init();
    if (this.audioCtx.state === 'suspended') this.audioCtx.resume();
    const now = this.audioCtx.currentTime;

    // Major celebratory chord: C5, E5, G5, B5, C6
    const freqs = [523.25, 659.25, 783.99, 987.77, 1046.50];
    freqs.forEach((freq, idx) => {
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.09);

      gain.gain.setValueAtTime(0.001, now + idx * 0.09);
      gain.gain.exponentialRampToValueAtTime(0.25, now + idx * 0.09 + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.09 + 2.2);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(now + idx * 0.09);
      osc.stop(now + idx * 0.09 + 2.3);
    });
  }
}

