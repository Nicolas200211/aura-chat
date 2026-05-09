let audioCtx: AudioContext | null = null;

function getCtx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  try {
    if (!audioCtx) {
      audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (audioCtx.state === "suspended") audioCtx.resume();
    return audioCtx;
  } catch {
    return null;
  }
}

function playNote(ctx: AudioContext, freq: number, delay: number, duration: number, volume: number) {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  const now = ctx.currentTime;

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.type = "triangle"; // softer, more bell-like than sine
  osc.frequency.setValueAtTime(freq, now + delay);

  gain.gain.setValueAtTime(0, now + delay);
  gain.gain.linearRampToValueAtTime(volume, now + delay + 0.004);
  gain.gain.exponentialRampToValueAtTime(0.001, now + delay + duration);

  osc.start(now + delay);
  osc.stop(now + delay + duration);
  osc.onended = () => { osc.disconnect(); gain.disconnect(); };
}

// Ascending chime G5 → C6 — clean bell notification
export function playIncomingSound(volume = 0.45) {
  const ctx = getCtx();
  if (!ctx) return;

  playNote(ctx, 784.0,  0.00, 0.55, volume * 0.75); // G5
  playNote(ctx, 1046.5, 0.13, 0.70, volume);         // C6
}

// Single soft C6 ping — for badge/nav update
export function playBadgeSound(volume = 0.3) {
  const ctx = getCtx();
  if (!ctx) return;

  playNote(ctx, 1046.5, 0, 0.35, volume);
}
