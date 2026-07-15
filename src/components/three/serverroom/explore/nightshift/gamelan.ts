/**
 * MOKSA.CLOUD night-shift score — procedural Balinese-horror gamelan, zero
 * audio assets, pure WebAudio (companion to explore/audio.ts, never both at
 * full level). Slendro-approximated tuning on septimal ratios, detuned unison
 * pairs for the ombak beating of paired gamelan bronze, inharmonic partials
 * (2.76×/5.4×) instead of harmonic bells. Created lazily (autoplay policy),
 * one lookahead timer drives all scheduling, torn down fully on stop().
 */

const BASE_HZ = 110;
/** Slendro-ish pentatonic — deliberately not 12-TET so nothing sounds "safe". */
const SLENDRO = [1, 8 / 7, 21 / 16, 3 / 2, 7 / 4] as const;
/** Inharmonic bronze partials: the "almost a bell, but wrong" gamelan signature. */
const PARTIALS: ReadonlyArray<readonly [number, number]> = [
  [2.76, 0.3],
  [5.4, 0.1],
];
const TICK_MS = 250;
const LOOKAHEAD_S = 0.35;
const SMOOTH_TAU_S = 1; // intensity follower lag — callers may spam setIntensity

const cents = (c: number) => Math.pow(2, c / 1200);
const clamp01 = (v: number) => Math.min(1, Math.max(0, v));

class NightAudio {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  /** Bus for all bed layers; the gong bypasses it and dips it sidechain-style. */
  private duck: GainNode | null = null;
  private dreadNoiseGain: GainNode | null = null;
  private dreadFifthGain: GainNode | null = null;
  private tickTimer: ReturnType<typeof setInterval> | null = null;
  private muted = false;
  private target = 0; // requested intensity 0..1
  private smooth = 0; // one-pole follower of target
  private lastTick = 0;
  private nextStrike = 0;
  private nextThump = 0;

  /** Idempotent; call from a user-gesture stack so resume() is allowed. */
  start() {
    if (typeof window === "undefined") return;
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
    void ctx.resume();
    this.ctx = ctx;

    const master = ctx.createGain();
    master.gain.value = this.muted ? 0 : 1;
    master.connect(ctx.destination);
    this.master = master;

    const duck = ctx.createGain();
    duck.gain.value = 1;
    duck.connect(master);
    this.duck = duck;

    // Layer 1 — gong wash: detuned sub pair breathing on a 0.05 Hz swell,
    // quiet enough that the strikes always sit on top of it.
    const drone = ctx.createGain();
    drone.gain.value = 0.04;
    drone.connect(duck);
    for (const [type, freq, gain] of [
      ["sine", 55, 1],
      ["triangle", 110 * cents(-6), 0.28],
    ] as const) {
      const osc = ctx.createOscillator();
      osc.type = type;
      osc.frequency.value = freq;
      const g = ctx.createGain();
      g.gain.value = gain;
      osc.connect(g).connect(drone);
      osc.start();
    }
    const lfo = ctx.createOscillator();
    lfo.frequency.value = 0.05;
    const lfoGain = ctx.createGain();
    lfoGain.gain.value = 0.018;
    lfo.connect(lfoGain).connect(drone.gain);
    lfo.start();

    // Layer 3a — dread noise bed, gain gated by intensity in tick().
    const noiseBuf = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
    const data = noiseBuf.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
    const noise = ctx.createBufferSource();
    noise.buffer = noiseBuf;
    noise.loop = true;
    const bp = ctx.createBiquadFilter();
    bp.type = "bandpass";
    bp.frequency.value = 240;
    bp.Q.value = 1.2;
    const noiseGain = ctx.createGain();
    noiseGain.gain.value = 0;
    noise.connect(bp).connect(noiseGain).connect(duck);
    noise.start();
    this.dreadNoiseGain = noiseGain;

    // Layer 3b — detuned low fifth (dissonant against the 55 Hz drone root).
    const fifthGain = ctx.createGain();
    fifthGain.gain.value = 0;
    fifthGain.connect(duck);
    for (const det of [-5, 6]) {
      const osc = ctx.createOscillator();
      osc.type = "sine";
      osc.frequency.value = 55 * (3 / 2) * cents(det);
      osc.connect(fifthGain);
      osc.start();
    }
    this.dreadFifthGain = fifthGain;

    // Single lookahead scheduler for strikes + heartbeat + intensity smoothing.
    this.lastTick = ctx.currentTime;
    this.nextStrike = ctx.currentTime + 1.5;
    this.nextThump = ctx.currentTime + 1;
    this.tickTimer = setInterval(() => this.tick(), TICK_MS);
    this.tick();
  }

  private tick() {
    const ctx = this.ctx;
    if (!ctx) return;
    const now = ctx.currentTime;
    const dt = Math.max(0, now - this.lastTick);
    this.lastTick = now;
    // One-pole toward target (~1 s lag) so intensity jumps never zipper.
    this.smooth += (this.target - this.smooth) * (1 - Math.exp(-dt / SMOOTH_TAU_S));
    const s = this.smooth;

    // Intensity-gated dread bed; setTargetAtTime keeps the ramps click-free.
    this.dreadNoiseGain?.gain.setTargetAtTime(0.05 * clamp01((s - 0.5) / 0.35), now, 0.5);
    this.dreadFifthGain?.gain.setTargetAtTime(0.035 * clamp01((s - 0.5) / 0.3), now, 0.7);

    // Layer 2 — sparse pentatonic strikes, interval shrinking exponentially
    // with intensity (calm ≈ one per 4–7 s, panic ≈ 0.35 s).
    while (this.nextStrike < now + LOOKAHEAD_S) {
      const at = Math.max(this.nextStrike, now);
      this.strike(at, s, false);
      // Kotekan-style interlocking answer note at high intensity.
      if (s > 0.7 && Math.random() < (s - 0.7) * 2.5) {
        this.strike(at + 0.09 + Math.random() * 0.05, s, true);
      }
      const slow = 4 + Math.random() * 3;
      const fast = 0.35 + Math.random() * 0.25;
      this.nextStrike = at + slow * Math.pow(fast / slow, s);
    }

    // Layer 3c — heartbeat thump above 0.85, ~64 bpm; the clock keeps
    // advancing while gated so it re-enters on the grid, not mid-beat.
    if (this.nextThump < now + LOOKAHEAD_S) {
      const at = Math.max(this.nextThump, now);
      if (s > 0.85) this.thump(at);
      this.nextThump = at + 60 / 64;
    }
  }

  /** One metallophone note: detuned unison pair + inharmonic partials through
   *  a per-voice bandpass; every node is released after the tail. */
  private strike(at: number, s: number, high: boolean) {
    const ctx = this.ctx;
    const duck = this.duck;
    if (!ctx || !duck) return;
    const deg = SLENDRO[Math.floor(Math.random() * SLENDRO.length)] ?? 1;
    // Register bias climbs with intensity; kotekan answers always sit high.
    const oct =
      high || Math.random() < s ? (Math.random() < 0.5 ? 1 : 2) : Math.random() < 0.35 ? 1 : 0;
    const f0 = BASE_HZ * deg * 2 ** oct;
    const peak = 0.06 + 0.03 * s;
    const decay = 2.5 - 1.3 * s; // frantic playing = damped, shorter ring

    const bp = ctx.createBiquadFilter();
    bp.type = "bandpass";
    bp.frequency.value = Math.min(2400, Math.max(600, f0 * 2));
    bp.Q.value = 0.9;
    const env = ctx.createGain();
    env.gain.setValueAtTime(0.0001, at);
    env.gain.linearRampToValueAtTime(peak, at + 0.003); // mallet attack
    env.gain.exponentialRampToValueAtTime(0.0001, at + decay);
    env.connect(bp).connect(duck);

    const oscs: OscillatorNode[] = [];
    const voice = (freq: number, level: number) => {
      const osc = ctx.createOscillator();
      osc.type = "sine";
      osc.frequency.value = freq;
      const g = ctx.createGain();
      g.gain.value = level;
      osc.connect(g).connect(env);
      osc.start(at);
      osc.stop(at + decay + 0.1);
      oscs.push(osc);
      return osc;
    };
    // ±5/6 cent pair → slow beating, the shimmer of paired bronze keys.
    voice(f0 * cents(-5), 0.5);
    for (const [ratio, level] of PARTIALS) voice(f0 * ratio, level);
    voice(f0 * cents(6), 0.5).onended = () => {
      for (const o of oscs) o.disconnect();
      env.disconnect();
      bp.disconnect();
    };
  }

  /** Heartbeat: 65→48 Hz pitched-down sine blip, felt more than heard. */
  private thump(at: number) {
    const ctx = this.ctx;
    const duck = this.duck;
    if (!ctx || !duck) return;
    const osc = ctx.createOscillator();
    osc.type = "sine";
    osc.frequency.setValueAtTime(65, at);
    osc.frequency.exponentialRampToValueAtTime(48, at + 0.15);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, at);
    g.gain.linearRampToValueAtTime(0.08, at + 0.006);
    g.gain.exponentialRampToValueAtTime(0.0001, at + 0.3);
    osc.connect(g).connect(duck);
    osc.start(at);
    osc.stop(at + 0.35);
    osc.onended = () => {
      osc.disconnect();
      g.disconnect();
    };
  }

  /** One-shot great-gong strike (purge ritual). Bypasses the duck bus and
   *  dips it first so the hit lands into ~300 ms of carved-out silence. */
  gong() {
    if (typeof window === "undefined") return;
    const ctx = this.ctx;
    const master = this.master;
    const duck = this.duck;
    if (!ctx || !master || !duck) return;
    const now = ctx.currentTime;
    const at = now + 0.15;
    duck.gain.cancelScheduledValues(now);
    duck.gain.setValueAtTime(duck.gain.value, now);
    duck.gain.linearRampToValueAtTime(0.15, now + 0.12);
    duck.gain.setTargetAtTime(1, at + 0.3, 1.2); // bed swims back under the tail

    const f0 = 68;
    const decay = 5;
    const env = ctx.createGain();
    env.gain.setValueAtTime(0.0001, at);
    env.gain.linearRampToValueAtTime(0.22, at + 0.008);
    env.gain.exponentialRampToValueAtTime(0.0001, at + decay);
    env.connect(master);

    const oscs: OscillatorNode[] = [];
    let last: OscillatorNode | null = null;
    for (const [ratio, level] of [
      [1, 1],
      [cents(6), 0.6], // detuned fundamental pair → long slow gong beating
      [1.5, 0.35],
      [2.76, 0.18],
      [5.4, 0.05],
    ] as const) {
      const osc = ctx.createOscillator();
      osc.type = "sine";
      // Slight initial pitch sag — the metal settling after the hit.
      osc.frequency.setValueAtTime(f0 * ratio * 1.015, at);
      osc.frequency.exponentialRampToValueAtTime(f0 * ratio, at + 0.5);
      const g = ctx.createGain();
      g.gain.value = level;
      osc.connect(g).connect(env);
      osc.start(at);
      osc.stop(at + decay + 0.2);
      oscs.push(osc);
      last = osc;
    }
    if (last) {
      last.onended = () => {
        for (const o of oscs) o.disconnect();
        env.disconnect();
      };
    }
  }

  /** Target only; the tick loop smooths it, so any call frequency is fine. */
  setIntensity(v: number) {
    this.target = clamp01(v);
  }

  setMuted(muted: boolean) {
    this.muted = muted;
    this.applyMute();
  }

  private applyMute() {
    const ctx = this.ctx;
    const master = this.master;
    if (!ctx || !master) return;
    const now = ctx.currentTime;
    master.gain.cancelScheduledValues(now);
    master.gain.setValueAtTime(master.gain.value, now);
    master.gain.linearRampToValueAtTime(this.muted ? 0 : 1, now + 0.15);
  }

  /** Safe when never started; fades ~0.8 s, then closes the context. */
  stop() {
    if (this.tickTimer) clearInterval(this.tickTimer);
    this.tickTimer = null;
    const ctx = this.ctx;
    const master = this.master;
    this.ctx = null;
    this.master = null;
    this.duck = null;
    this.dreadNoiseGain = null;
    this.dreadFifthGain = null;
    this.target = 0;
    this.smooth = 0;
    if (!ctx || !master) return;
    const now = ctx.currentTime;
    master.gain.cancelScheduledValues(now);
    master.gain.setValueAtTime(master.gain.value, now);
    master.gain.linearRampToValueAtTime(0.0001, now + 0.8);
    // Close after the fade; a re-start() during the fade builds a fresh graph.
    window.setTimeout(() => {
      if (ctx.state !== "closed") void ctx.close().catch(() => {});
    }, 900);
  }
}

export const nightAudio = new NightAudio();
