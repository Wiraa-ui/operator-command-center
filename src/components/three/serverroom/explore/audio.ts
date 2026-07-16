/**
 * Procedural server-room audio — zero assets, pure WebAudio.
 *
 * One morphing ambience machine instead of a static loop: every zone has a
 * sonic identity (drone pitch, fan color, sparkle rate, shimmer) and the
 * live nodes RAMP to the new targets when the player crosses a doorway —
 * the room "re-tunes" itself instead of hard-switching. On top: distance-
 * driven server-heart thumps, velocity-driven footsteps with per-step
 * variation, and small melodic SFX on a shared pentatonic scale.
 *
 * Created lazily on the first user gesture (autoplay policy) and torn down
 * fully on exit so walk mode never keeps an AudioContext alive.
 */

export type AudioZone = "aisle" | "lab" | "core" | "bengkel" | "noc" | "vault" | "hall" | "tunnel";

interface ZoneVoice {
  /** Base drone frequency (a second osc runs ~1 octave + detune above). */
  droneFreq: number;
  droneGain: number;
  /** Fan / air color: bandpass center + Q + level. */
  noiseFreq: number;
  noiseQ: number;
  noiseGain: number;
  /** Sparse melodic blips: [min,max] delay ms and scale degrees used. */
  blipDelay: [number, number];
  blipNotes: number[];
  /** Icy detuned high shimmer (vault) 0..1. */
  shimmer: number;
}

/** Pentatonic-ish palette (A minor penta, Hz) shared by blips + SFX. */
const SCALE = [440, 523.25, 587.33, 659.25, 783.99, 880, 1046.5, 1174.66];

const VOICES: Record<AudioZone, ZoneVoice> = {
  aisle: {
    droneFreq: 55,
    droneGain: 0.05,
    noiseFreq: 320,
    noiseQ: 0.6,
    noiseGain: 0.018,
    blipDelay: [7000, 16000],
    blipNotes: [7],
    shimmer: 0,
  },
  lab: {
    droneFreq: 73.4,
    droneGain: 0.04,
    noiseFreq: 520,
    noiseQ: 0.9,
    noiseGain: 0.014,
    blipDelay: [3500, 9000],
    blipNotes: [4, 5, 6],
    shimmer: 0,
  },
  core: {
    droneFreq: 41.2,
    droneGain: 0.065,
    noiseFreq: 240,
    noiseQ: 0.5,
    noiseGain: 0.02,
    blipDelay: [5000, 11000],
    blipNotes: [0, 2],
    shimmer: 0,
  },
  bengkel: {
    droneFreq: 49,
    droneGain: 0.045,
    noiseFreq: 180,
    noiseQ: 1.4,
    noiseGain: 0.022,
    blipDelay: [9000, 20000],
    blipNotes: [1],
    shimmer: 0,
  },
  noc: {
    droneFreq: 65.4,
    droneGain: 0.035,
    noiseFreq: 900,
    noiseQ: 1.8,
    noiseGain: 0.01,
    blipDelay: [2200, 6000],
    blipNotes: [3, 5, 7],
    shimmer: 0,
  },
  vault: {
    droneFreq: 36.7,
    droneGain: 0.055,
    noiseFreq: 140,
    noiseQ: 0.4,
    noiseGain: 0.008,
    blipDelay: [12000, 26000],
    blipNotes: [6, 7],
    shimmer: 1,
  },
  hall: {
    // The cathedral: widest fan wash + deep drone, busy blips everywhere.
    droneFreq: 46.2,
    droneGain: 0.06,
    noiseFreq: 420,
    noiseQ: 0.35,
    noiseGain: 0.026,
    blipDelay: [1800, 5000],
    blipNotes: [0, 2, 3, 5],
    shimmer: 0,
  },
  tunnel: {
    // Claustrophobic crawl: narrow resonant hiss, almost no melody.
    droneFreq: 58.3,
    droneGain: 0.03,
    noiseFreq: 700,
    noiseQ: 4,
    noiseGain: 0.02,
    blipDelay: [14000, 30000],
    blipNotes: [1],
    shimmer: 0,
  },
};

const RAMP_S = 1.6; // doorway crossfade

class RoomAudio {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private blipTimer: ReturnType<typeof setTimeout> | null = null;
  private heartTimer: ReturnType<typeof setTimeout> | null = null;
  private muted = false;
  private zone: AudioZone = "aisle";
  private heartLevel = 0;

  // Live morphable nodes.
  private droneOsc: OscillatorNode[] = [];
  private droneGain: GainNode | null = null;
  private noiseFilter: BiquadFilterNode | null = null;
  private noiseGain: GainNode | null = null;
  private shimmerGain: GainNode | null = null;

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
    master.gain.value = muted ? 0 : this.volume;
    master.connect(ctx.destination);
    this.master = master;

    // Drone: base + a detuned near-octave partner, breathing via slow LFO.
    const droneGain = ctx.createGain();
    droneGain.gain.value = VOICES.aisle.droneGain;
    droneGain.connect(master);
    this.droneGain = droneGain;
    for (const [mult, gain] of [
      [1, 0.9],
      [2.013, 0.45],
    ] as const) {
      const osc = ctx.createOscillator();
      osc.type = "sine";
      osc.frequency.value = VOICES.aisle.droneFreq * mult;
      const g = ctx.createGain();
      g.gain.value = gain;
      osc.connect(g).connect(droneGain);
      osc.start();
      this.droneOsc.push(osc);
    }
    const lfo = ctx.createOscillator();
    lfo.frequency.value = 0.07;
    const lfoGain = ctx.createGain();
    lfoGain.gain.value = 0.02;
    lfo.connect(lfoGain).connect(droneGain.gain);
    lfo.start();

    // Fan/air: looped noise through a morphable bandpass.
    const noise = ctx.createBufferSource();
    noise.buffer = this.noiseBuffer(2);
    noise.loop = true;
    const bp = ctx.createBiquadFilter();
    bp.type = "bandpass";
    bp.frequency.value = VOICES.aisle.noiseFreq;
    bp.Q.value = VOICES.aisle.noiseQ;
    const noiseGain = ctx.createGain();
    noiseGain.gain.value = VOICES.aisle.noiseGain;
    noise.connect(bp).connect(noiseGain).connect(master);
    noise.start();
    this.noiseFilter = bp;
    this.noiseGain = noiseGain;

    // Icy shimmer (vault): two slow detuned highs, silent elsewhere.
    const shimmerGain = ctx.createGain();
    shimmerGain.gain.value = 0;
    shimmerGain.connect(master);
    this.shimmerGain = shimmerGain;
    for (const f of [1567.98, 1573.2]) {
      const osc = ctx.createOscillator();
      osc.type = "sine";
      osc.frequency.value = f;
      const g = ctx.createGain();
      g.gain.value = 0.5;
      osc.connect(g).connect(shimmerGain);
      osc.start();
    }

    this.scheduleBlip();
    this.scheduleHeart();
  }

  private noiseBuffer(seconds: number): AudioBuffer {
    const ctx = this.ctx!;
    const buf = ctx.createBuffer(1, ctx.sampleRate * seconds, ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
    return buf;
  }

  /* ------------------------- zone morphing --------------------------- */

  /** Ramp the ambience to the zone's voice; called on doorway crossings. */
  setZone(zone: AudioZone) {
    if (zone === this.zone) return;
    this.zone = zone;
    const ctx = this.ctx;
    if (!ctx) return;
    const v = VOICES[zone];
    const t = ctx.currentTime + RAMP_S;
    this.droneOsc[0]?.frequency.linearRampToValueAtTime(v.droneFreq, t);
    this.droneOsc[1]?.frequency.linearRampToValueAtTime(v.droneFreq * 2.013, t);
    this.droneGain?.gain.linearRampToValueAtTime(v.droneGain, t);
    this.noiseFilter?.frequency.linearRampToValueAtTime(v.noiseFreq, t);
    this.noiseFilter?.Q.linearRampToValueAtTime(v.noiseQ, t);
    this.noiseGain?.gain.linearRampToValueAtTime(v.noiseGain, t);
    this.shimmerGain?.gain.linearRampToValueAtTime(v.shimmer * 0.012, t);
  }

  /** Debug/E2E introspection — no audio output involved. */
  debugState() {
    return {
      running: this.ctx?.state === "running",
      zone: this.zone,
      heartLevel: this.heartLevel,
    };
  }

  /* --------------------------- schedulers ---------------------------- */

  private scheduleBlip() {
    const v = VOICES[this.zone];
    const [min, max] = v.blipDelay;
    this.blipTimer = setTimeout(
      () => {
        const note = v.blipNotes[Math.floor(Math.random() * v.blipNotes.length)];
        // ±6 cents of drift so no two pings are identical.
        const drift = 1 + (Math.random() - 0.5) * 0.007;
        this.tone(SCALE[note] * drift, 0.035, 0.4 + Math.random() * 0.3);
        this.scheduleBlip();
      },
      min + Math.random() * (max - min),
    );
  }

  /** Server-heart double thump; volume follows proximity (PlayerRig). */
  private scheduleHeart() {
    this.heartTimer = setTimeout(() => {
      if (this.heartLevel > 0.03) {
        this.thump(this.heartLevel * 0.09);
        setTimeout(() => this.thump(this.heartLevel * 0.055), 240);
      }
      this.scheduleHeart();
    }, 1150);
  }

  /** 0..1 — how close the player is to the CORE heart. */
  setHeartLevel(level: number) {
    this.heartLevel = Math.max(0, Math.min(1, level));
  }

  /* ---------------------------- one-shots ---------------------------- */

  private tone(freq: number, peak: number, dur: number, type: OscillatorType = "sine") {
    const ctx = this.ctx;
    const master = this.master;
    if (!ctx || !master) return;
    const osc = ctx.createOscillator();
    osc.type = type;
    osc.frequency.value = freq;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(peak, ctx.currentTime + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + dur);
    osc.connect(g).connect(master);
    osc.start();
    osc.stop(ctx.currentTime + dur + 0.05);
  }

  private thump(peak: number) {
    const ctx = this.ctx;
    const master = this.master;
    if (!ctx || !master || peak <= 0) return;
    const osc = ctx.createOscillator();
    osc.type = "sine";
    osc.frequency.setValueAtTime(62, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(38, ctx.currentTime + 0.16);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(peak, ctx.currentTime + 0.015);
    g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.28);
    osc.connect(g).connect(master);
    osc.start();
    osc.stop(ctx.currentTime + 0.35);
  }

  /** Velocity-driven step: filtered noise burst, no two alike. */
  footstep(sprint: boolean) {
    const ctx = this.ctx;
    const master = this.master;
    if (!ctx || !master) return;
    const src = ctx.createBufferSource();
    src.buffer = this.noiseBuffer(0.09);
    const lp = ctx.createBiquadFilter();
    lp.type = "lowpass";
    lp.frequency.value = 380 + Math.random() * 320 + (sprint ? 160 : 0);
    const g = ctx.createGain();
    const peak = (sprint ? 0.05 : 0.032) * (0.85 + Math.random() * 0.3);
    g.gain.setValueAtTime(peak, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.07 + Math.random() * 0.03);
    src.connect(lp).connect(g).connect(master);
    src.start();
  }

  sfx(kind: "unlock" | "deny" | "toast" | "achievement" | "ending") {
    if (kind === "ending") {
      // Epilogue sting: slow rising pentatonic swell, warmer and longer
      // than the achievement arpeggio.
      [0, 2, 4, 5, 7].forEach((n, i) => setTimeout(() => this.tone(SCALE[n], 0.055, 1.1), i * 320));
      return;
    }
    if (kind === "unlock") {
      // Rising two-note "access granted" on the shared scale.
      this.tone(SCALE[3], 0.06, 0.25);
      setTimeout(() => this.tone(SCALE[5], 0.06, 0.4), 130);
    } else if (kind === "deny") {
      this.tone(180, 0.07, 0.3, "square");
    } else if (kind === "achievement") {
      // Little arpeggio — the only celebratory sound in the room.
      [0, 2, 4, 7].forEach((n, i) => setTimeout(() => this.tone(SCALE[n], 0.05, 0.35), i * 110));
    } else {
      const n = [5, 6, 7][Math.floor(Math.random() * 3)];
      this.tone(SCALE[n], 0.04, 0.2);
    }
  }

  setMuted(muted: boolean) {
    this.muted = muted;
    this.applyMute();
  }

  /** Master volume 0–1 from the settings menu (independent of mute). */
  setVolume(volume: number) {
    this.volume = Math.max(0, Math.min(1, volume));
    this.applyMute();
  }

  private volume = 1;

  private applyMute() {
    const ctx = this.ctx;
    if (!ctx || !this.master) return;
    this.master.gain.linearRampToValueAtTime(this.muted ? 0 : this.volume, ctx.currentTime + 0.2);
  }

  stop() {
    if (this.blipTimer) clearTimeout(this.blipTimer);
    if (this.heartTimer) clearTimeout(this.heartTimer);
    this.blipTimer = null;
    this.heartTimer = null;
    if (this.ctx) void this.ctx.close();
    this.ctx = null;
    this.master = null;
    this.droneOsc = [];
    this.droneGain = null;
    this.noiseFilter = null;
    this.noiseGain = null;
    this.shimmerGain = null;
  }
}

export const roomAudio = new RoomAudio();
