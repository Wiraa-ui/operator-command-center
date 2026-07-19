/**
 * voice — the night shift's talking characters, via the browser's built-in
 * speechSynthesis (zero assets, works offline, free). Each speaker gets a
 * distinct rate/pitch persona; an Indonesian voice is preferred when the OS
 * has one. Subtitles (DialogueOverlay) always carry the words — voice is
 * atmosphere, so "no voices installed" simply degrades to silent subtitles.
 */

export type Speaker = "kirana" | "arwah" | "gede" | "system" | "ayu" | "putu";

const PERSONA: Record<Speaker, { rate: number; pitch: number; volume: number }> = {
  // Soft, unhurried, pitch-deck calm — the scariest thing in the room.
  kirana: { rate: 0.88, pitch: 0.6, volume: 0.9 },
  // Freed spirits: airy and high, slightly too slow.
  arwah: { rate: 0.82, pitch: 1.3, volume: 0.75 },
  // Voicemail from the previous operator: normal human, tired.
  gede: { rate: 1.0, pitch: 0.85, volume: 0.85 },
  // Building PA system.
  system: { rate: 1.05, pitch: 0.45, volume: 0.7 },
  // Day shift (RPG): warm front desk + eager intern.
  ayu: { rate: 1.02, pitch: 1.15, volume: 0.85 },
  putu: { rate: 1.1, pitch: 1.05, volume: 0.85 },
};

/** Voice cache keyed by language prefix ("id" / "en"). */
const cachedVoice: Partial<Record<"id" | "en", SpeechSynthesisVoice | null>> = {};

function pickVoice(lang: "id" | "en"): SpeechSynthesisVoice | null {
  if (cachedVoice[lang] !== undefined) return cachedVoice[lang]!;
  const list = window.speechSynthesis.getVoices();
  if (list.length === 0) return null; // not loaded yet — retry next call
  const v =
    list.find((x) => x.lang.toLowerCase().startsWith(lang)) ??
    list.find((x) => x.default) ??
    list[0] ??
    null;
  cachedVoice[lang] = v;
  return v;
}

/** Speak one line (cancels anything still playing). No-op without support.
    `lang` picks an appropriate voice + BCP-47 tag; defaults to Indonesian. */
export function speak(text: string, speaker: Speaker, lang: "id" | "en" = "id") {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
  try {
    const synth = window.speechSynthesis;
    synth.cancel();
    const u = new SpeechSynthesisUtterance(text);
    const p = PERSONA[speaker];
    u.rate = p.rate;
    u.pitch = p.pitch;
    u.volume = p.volume;
    const v = pickVoice(lang);
    if (v) {
      u.voice = v;
      u.lang = v.lang;
    } else {
      u.lang = lang === "en" ? "en-US" : "id-ID";
    }
    synth.speak(u);
  } catch {
    /* voice is best-effort — subtitles already carry the line */
  }
}

export function stopSpeaking() {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
  try {
    window.speechSynthesis.cancel();
  } catch {
    /* ignore */
  }
}
