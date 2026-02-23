let audioContext: AudioContext | null = null;

function getAudioContext(): AudioContext {
  if (!audioContext) {
    const AudioCtx =
      window.AudioContext ??
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    audioContext = new AudioCtx();
  }
  return audioContext;
}

// Plays a short percussive "thwack" sound synthesized via Web Audio API.
// ~80ms bandpass-filtered white noise burst — mimics a racket hit.
//
// To swap in a real audio file later:
// -----------------------------------------------
// let hitBuffer: AudioBuffer | null = null;
//
// async function loadHitSound() {
//   const ctx = getAudioContext();
//   const response = await fetch('/sounds/hit.mp3');
//   const arrayBuffer = await response.arrayBuffer();
//   hitBuffer = await ctx.decodeAudioData(arrayBuffer);
// }
//
// export function playHitSound() {
//   try {
//     const ctx = getAudioContext();
//     void ctx.resume();
//     if (!hitBuffer) { loadHitSound(); return; }
//     const source = ctx.createBufferSource();
//     source.buffer = hitBuffer;
//     source.connect(ctx.destination);
//     source.start();
//   } catch { /* never break gameplay */ }
// }
// -----------------------------------------------
export function playHitSound(): void {
  try {
    const ctx = getAudioContext();
    void ctx.resume();

    const duration = 0.08;
    const now = ctx.currentTime;

    // White noise buffer
    const sampleRate = ctx.sampleRate;
    const length = Math.floor(sampleRate * duration);
    const buffer = ctx.createBuffer(1, length, sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < length; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const source = ctx.createBufferSource();
    source.buffer = buffer;

    // Bandpass filter centered at 1200 Hz for a percussive crack
    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 1200;
    filter.Q.value = 1.0;

    // Exponential gain decay
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.6, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

    source.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    source.start(now);
    source.stop(now + duration);
  } catch {
    // Audio failures must never break gameplay
  }
}
