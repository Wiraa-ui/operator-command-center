/**
 * Procedural server-room ambience — zero audio assets, pure WebAudio:
 * a low detuned drone, filtered-noise fan hum, and sparse sonar blips.
 * Created lazily on the first user gesture (autoplay policy) and torn down
 * fully on exit so the page never keeps an AudioContext alive in walk mode.
 */

class RoomAudio {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private blipTimer: ReturnType<typeof setTimeout> | null = null;
  private muted = false;

  /** Idempotent; must be called from a user-gesture call stack. */
  start(muted: boolean) {
    this.muted = muted;
    if (this.ctx) {
      void this.ctx.resume();
      this.applyMute();
      return;
    }
    const Ctor: typeof AudioContext | undefined =
      window.AudioContext ??
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctor) return;
    const ctx = new Ctor();
    this.ctx = ctx;

    const master = ctx.createGain();
    master.gain.value = muted ? 0 : 1;
    master.connect(ctx.destination);
    this.master = master;

    // Drone: two slightly detuned lows breathing via a slow LFO.
    const droneGain = ctx.createGain();
    droneGain.gain.value = 0.05;
    droneGain.connect(master);
    for (const [freq, gain] of [
      [55, 0.9],
      [110.7, 0.45],
    ] as const) {
      const osc = ctx.createOscillator();
      osc.type = "sine";
      osc.frequency.value = freq;
      const g = ctx.createGain();
      g.gain.value = gain;
      osc.connect(g).connect(droneGain);
      osc.start();
    }
    const lfo = ctx.createOscillator();
    lfo.frequency.value = 0.07;
    const lfoGain = ctx.createGain();
    lfoGain.gain.value = 0.02;
    lfo.connect(lfoGain).connect(droneGain.gain);
    lfo.start();

    // Fan hum: looped white noise through a low bandpass.
    const noiseBuf = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
    const data = noiseBuf.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
    const noise = ctx.createBufferSource();
    noise.buffer = noiseBuf;
    noise.loop = true;
    const bp = ctx.createBiquadFilter();
    bp.type = "bandpass";
    bp.frequency.value = 320;
    bp.Q.value = 0.6;
    const noiseGain = ctx.createGain();
    noiseGain.gain.value = 0.018;
    noise.connect(bp).connect(noiseGain).connect(master);
    noise.start();

    this.scheduleBlip();
  }

  private scheduleBlip() {
    this.blipTimer = setTimeout(
      () => {
        this.blip(1174, 0.035, 0.5);
        this.scheduleBlip();
      },
      7000 + Math.random() * 9000,
    );
  }

  /** Short enveloped sine ping (also reused by the SFX below). */
  private blip(freq: number, peak: number, dur: number) {
    const ctx = this.ctx;
    const master = this.master;
    if (!ctx || !master) return;
    const osc = ctx.createOscillator();
    osc.type = "sine";
    osc.frequency.value = freq;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(peak, ctx.currentTime + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + dur);
    osc.connect(g).connect(master);
    osc.start();
    osc.stop(ctx.currentTime + dur + 0.05);
  }

  sfx(kind: "unlock" | "deny" | "toast") {
    if (kind === "unlock") {
      // Rising two-note "access granted".
      this.blip(660, 0.06, 0.25);
      setTimeout(() => this.blip(990, 0.06, 0.4), 130);
    } else if (kind === "deny") {
      this.blip(180, 0.07, 0.3);
    } else {
      this.blip(880, 0.04, 0.2);
    }
  }

  setMuted(muted: boolean) {
    this.muted = muted;
    this.applyMute();
  }

  private applyMute() {
    const ctx = this.ctx;
    if (!ctx || !this.master) return;
    this.master.gain.linearRampToValueAtTime(this.muted ? 0 : 1, ctx.currentTime + 0.2);
  }

  stop() {
    if (this.blipTimer) clearTimeout(this.blipTimer);
    this.blipTimer = null;
    if (this.ctx) void this.ctx.close();
    this.ctx = null;
    this.master = null;
  }
}

export const roomAudio = new RoomAudio();
