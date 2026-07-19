import { getExploreState, setDialogue, type DialogueLine } from "../store";
import { speak, stopSpeaking, type Speaker } from "./voice";

/**
 * story — MOKSA.CLOUD's narrative engine. All of the night shift's words
 * live here: the opening voicemail, one goodbye per freed arwah, Kirana's
 * escalating pitch-deck taunts, and the moksa ending. One queue shows one
 * subtitle at a time (DialogueOverlay renders it, voice.ts reads it aloud).
 *
 * Lore recap: MOKSA.CLOUD sells "digital ancestor preservation". While an
 * archive is stored its arwah cannot moksa — so the hero's job is deletion,
 * a digital release rite, and the founder objects.
 */

interface Line {
  speaker: Speaker;
  name: string;
  text: string;
  /** Extra ms on top of the reading-time estimate. */
  hold?: number;
}

/* ------------------------------- queue -------------------------------- */

let queue: Line[] = [];
let showing = false;
let timer: ReturnType<typeof setTimeout> | null = null;
let seq = 1;

function durationOf(l: Line): number {
  return Math.min(2600 + l.text.length * 55, 9000) + (l.hold ?? 0);
}

function next() {
  const l = queue.shift();
  if (!l) {
    showing = false;
    setDialogue(null);
    return;
  }
  showing = true;
  const line: DialogueLine = { id: seq++, speaker: l.speaker, name: l.name, text: l.text };
  setDialogue(line);
  if (!getExploreState().muted) speak(l.text, l.speaker);
  timer = setTimeout(next, durationOf(l));
}

function say(lines: Line[], opts?: { interrupt?: boolean }) {
  if (opts?.interrupt) {
    queue = [...lines];
    if (timer) clearTimeout(timer);
    stopSpeaking();
    next();
    return;
  }
  queue.push(...lines);
  if (!showing) next();
}

/** Full stop: end of shift or explore exit. */
export function storyStop() {
  queue = [];
  if (timer) clearTimeout(timer);
  timer = null;
  showing = false;
  stopSpeaking();
  setDialogue(null);
  taunt.nextAt = 0;
}

/* ------------------------------ content ------------------------------- */

const KIRANA = "BU DEWI KIRANA · FOUNDER";

export function storyIntro() {
  say(
    [
      {
        speaker: "system",
        name: "MOKSA.CLOUD · PA",
        text: "Shift malam dimulai. Tujuh arsip leluhur berstatus AKTIF. Selamat bekerja.",
      },
      {
        speaker: "gede",
        name: "VOICEMAIL · BLI GEDE, TEKNISI (RESIGN)",
        text: "Dik, kalau kamu dengar ini, dengarkan baik-baik: selama datanya tersimpan, mereka tidak bisa pulang. Hapus ketujuh arsip. Ritualnya sederhana — berdiri diam di depan rak. Dan… jangan biarkan Bu Kirana terlalu dekat.",
        hold: 900,
      },
      {
        speaker: "kirana",
        name: KIRANA,
        text: "Selamat malam, Dik. Kulihat kamu lembur. Karyawan teladan… jangan sentuh aset perusahaan, ya.",
      },
    ],
    { interrupt: true },
  );
}

/** One goodbye per rack — freed arwah get the last word. */
const ARWAH_LINES: Record<string, Line> = {
  "arsip:penari": {
    speaker: "arwah",
    name: "PENARI · 1963",
    text: "Enam puluh tahun aku menari untuk mereka yang tak pernah menonton. Gamelan itu… biarkan berhenti. Suksma, Dik.",
  },
  "arsip:pemangku": {
    speaker: "arwah",
    name: "PEMANGKU · 1977",
    text: "Doaku tersangkut di kabel kalian. Sekarang lepas. Om santih, santih, santih.",
  },
  "arsip:pantai": {
    speaker: "arwah",
    name: "ANAK PANTAI · 1998",
    text: "Ombaknya… akhirnya kudengar lagi. Matikan lampunya waktu kamu pulang, ya.",
  },
  "arsip:ibu": {
    speaker: "arwah",
    name: "IBU · 2004",
    text: "Titip pesan untuk yang masih menyimpan fotoku: aku tidak hilang. Aku pulang.",
  },
  "arsip:penenun": {
    speaker: "arwah",
    name: "PENENUN · 2009",
    text: "Benang terakhirku putus malam ini. Rapikan sisanya pelan-pelan.",
  },
  "arsip:nelayan": {
    speaker: "arwah",
    name: "NELAYAN · 2015",
    text: "Angin timur. Layar turun. Aku berlayar, Dik.",
  },
  "arsip:operator": {
    speaker: "arwah",
    name: "OPERATOR SHIFT TIGA",
    text: "Kamu menemukanku. Berarti benar: tidak ada yang benar-benar resign dari sini. Lari lebih cepat dariku, ya.",
  },
};

export function storyOnPurged(id: string) {
  const l = ARWAH_LINES[id];
  if (l) say([l], { interrupt: true });
}

export function storyOnCaught() {
  say(
    [
      {
        speaker: "kirana",
        name: KIRANA,
        text: "Kamu belum boleh pulang, Dik. Kita review dulu KPI-mu… dari awal pintu masuk.",
      },
    ],
    { interrupt: true },
  );
}

export function storyMoksa() {
  say(
    [
      {
        speaker: "arwah",
        name: "TUJUH ARWAH",
        text: "Tujuh pintu terbuka. Om swastiastu, operator shift malam.",
        hold: 600,
      },
      {
        speaker: "kirana",
        name: KIRANA,
        text: "Data… nol. Valuasi… nol. Dik… kalau semua sudah pulang… siapa yang menyimpan aku?",
        hold: 900,
      },
      {
        speaker: "system",
        name: "MOKSA.CLOUD · PA",
        text: "Layanan pelestarian dihentikan. Terima kasih, shift malam. Selamat pagi.",
      },
    ],
    { interrupt: true },
  );
}

/* --------------------------- proximity taunts -------------------------- */

const TAUNTS_EARLY = [
  "Dik, yang kamu hapus itu aset. Keluarga membayar agar mereka abadi.",
  "Grief-tech itu masa depan, Dik. Kamu sedang menghapus masa depan.",
  "Aku melihatmu dari CCTV. Senyummu bagus. Cocok untuk poster HR.",
];
const TAUNTS_MID = [
  "SLA kita 99,9 persen. Kamu sedang merusak angka yang indah.",
  "Siapa kamu, menentukan kapan orang boleh moksa? Investor saja tidak berani.",
  "Kontrakmu pasal dua belas: data adalah aset abadi. Pelanggarnya… ikut abadi.",
];
const TAUNTS_LATE = [
  "Cukup, Dik. Ruang server ini juga arsip. Kamu mau jadi koleksi berikutnya?",
  "Satu rak lagi dan aku tidak punya apa-apa. Kamu tega? Bagus. Aku juga.",
];

const taunt = { nextAt: 0 };
const TAUNT_RANGE = 4.5; // world units
const TAUNT_COOLDOWN_MS = 26000;

/** Called from NightShift's frame loop; cheap unless she is close. */
export function storyTick(now: number, distToKirana: number, purgedCount: number) {
  if (distToKirana > TAUNT_RANGE || now < taunt.nextAt || showing) return;
  taunt.nextAt = now + TAUNT_COOLDOWN_MS;
  const pool = purgedCount >= 6 ? TAUNTS_LATE : purgedCount >= 3 ? TAUNTS_MID : TAUNTS_EARLY;
  const text = pool[Math.floor(Math.random() * pool.length)];
  say([{ speaker: "kirana", name: KIRANA, text }]);
}
