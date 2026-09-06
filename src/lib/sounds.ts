'use client';

type SoundName = 'hatch' | 'session-start' | 'tick' | 'approved' | 'level-up' | 'failure';

let audioCtx: AudioContext | null = null;
let isPlayingTick = false; // Prevent overlapping ticks

function initAudio() {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {});
  }
  return audioCtx;
}

function getPrefs() {
  if (typeof window === 'undefined') return { soundEffects: true, timerTick: false };
  try {
    const raw = localStorage.getItem('capy_preferences');
    return raw ? JSON.parse(raw) : { soundEffects: true, timerTick: false };
  } catch {
    return { soundEffects: true, timerTick: false };
  }
}

export function playSound(name: SoundName) {
  const prefs = getPrefs();
  if (!prefs.soundEffects && name !== 'tick') return;
  if (name === 'tick' && !prefs.timerTick) return;

  const ctx = initAudio();
  if (!ctx) return;

  const now = ctx.currentTime;

  switch (name) {
    case 'hatch': {
      // Ascending chime (C5, E5, G5) + soft pop
      const freqs = [523.25, 659.25, 783.99]; // C5, E5, G5
      freqs.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.value = freq;
        osc.connect(gain);
        gain.connect(ctx.destination);

        const start = now + i * 0.1;
        gain.gain.setValueAtTime(0, start);
        gain.gain.linearRampToValueAtTime(0.3, start + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.01, start + 0.3);

        osc.start(start);
        osc.stop(start + 0.3);
      });

      // Pop noise
      const popOsc = ctx.createOscillator();
      const popGain = ctx.createGain();
      popOsc.type = 'sine';
      popOsc.connect(popGain);
      popGain.connect(ctx.destination);
      
      popOsc.frequency.setValueAtTime(300, now + 0.3);
      popOsc.frequency.exponentialRampToValueAtTime(100, now + 0.35);
      
      popGain.gain.setValueAtTime(0, now + 0.3);
      popGain.gain.linearRampToValueAtTime(0.5, now + 0.31);
      popGain.gain.exponentialRampToValueAtTime(0.01, now + 0.4);
      
      popOsc.start(now + 0.3);
      popOsc.stop(now + 0.4);
      break;
    }

    case 'session-start': {
      // Low-to-high whoosh (filtered noise sweep)
      const bufferSize = ctx.sampleRate * 1.0; // 1 second buffer
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1; // White noise
      }
      
      const noise = ctx.createBufferSource();
      noise.buffer = buffer;
      
      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.Q.value = 1.5;
      
      // Sweep frequency up
      filter.frequency.setValueAtTime(200, now);
      filter.frequency.exponentialRampToValueAtTime(2000, now + 0.8);
      
      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.4, now + 0.2);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 1.0);
      
      noise.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);
      
      noise.start(now);
      break;
    }

    case 'tick': {
      if (isPlayingTick) return;
      isPlayingTick = true;
      
      // Short click
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = 'sawtooth';
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.frequency.setValueAtTime(800, now);
      osc.frequency.exponentialRampToValueAtTime(100, now + 0.05);
      
      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.15, now + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.05);
      
      osc.start(now);
      osc.stop(now + 0.05);
      
      setTimeout(() => { isPlayingTick = false; }, 60);
      break;
    }

    case 'approved': {
      // Warm two-note chime (Major third: C5 -> E5)
      const freqs = [523.25, 659.25];
      freqs.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        
        // Triangle wave for warm, doorbell-like tone
        osc.type = 'triangle';
        osc.frequency.value = freq;
        
        osc.connect(gain);
        gain.connect(ctx.destination);
        
        const start = now + i * 0.2;
        gain.gain.setValueAtTime(0, start);
        gain.gain.linearRampToValueAtTime(0.3, start + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.01, start + 1.0);
        
        osc.start(start);
        osc.stop(start + 1.0);
      });
      break;
    }

    case 'level-up': {
      // Ascending arpeggio (C5, E5, G5, B5, C6) + shimmer
      const freqs = [523.25, 659.25, 783.99, 987.77, 1046.50];
      freqs.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        
        // Mix sine for body, square for sparkle
        osc.type = i === freqs.length - 1 ? 'sine' : 'square';
        osc.frequency.value = freq;
        
        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(2000, now);
        filter.frequency.exponentialRampToValueAtTime(400, now + 0.5);
        
        osc.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);
        
        const start = now + i * 0.1;
        gain.gain.setValueAtTime(0, start);
        gain.gain.linearRampToValueAtTime(i === freqs.length - 1 ? 0.3 : 0.1, start + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.01, start + 1.2);
        
        osc.start(start);
        osc.stop(start + 1.2);
      });
      break;
    }

    case 'failure': {
      // Single descending note (high to low, soft)
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = 'sine';
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.frequency.setValueAtTime(300, now);
      osc.frequency.exponentialRampToValueAtTime(150, now + 0.5);
      
      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.3, now + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.8);
      
      osc.start(now);
      osc.stop(now + 0.8);
      break;
    }
  }
}
