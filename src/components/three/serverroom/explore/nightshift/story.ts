import { type Bi, pick } from "../i18n";
import { getExploreState, setDialogue, type DialogueLine } from "../store";
import { speak, stopSpeaking, type Speaker } from "./voice";

/**
 * story — MOKSA.CLOUD's narrative engine ("ARSIP 167"). Every word of the
 * night shift lives here: the opening, one goodbye per released archive, the
 * PA/Kirana reveals that fire at story beats, three tiers of proximity taunt,
 * and the ending. One queue shows one subtitle at a time (DialogueOverlay
 * renders it; voice.ts reads it aloud).
 *
 * Bilingual (user mandate 2026-07-19): every line carries {id, en}; the queue
 * resolves against the current language at enqueue time and voices it in that
 * language. Tone: universal, cold-corporate horror — MOKSA.CLOUD "preserves"
 * people, and while an archive is stored the person inside cannot be let go.
 * The night operator's job is deletion: a quiet release, one rack at a time.
 * No local-culture terms; never the forbidden word (see prompt v2).
 */

interface Line {
  speaker: Speaker;
  name: Bi;
  text: Bi;
  /** Extra ms on top of the reading-time estimate. */
  hold?: number;
}

const bi = (id: string, en: string): Bi => ({ id, en });

/* ------------------------------- queue -------------------------------- */

let queue: Line[] = [];
let showing = false;
let timer: ReturnType<typeof setTimeout> | null = null;
let seq = 1;

/** How many archives the operator has released this shift. Drives the reveal
    beats (Act II at 4, the operator's recognition at 6–7). */
let purgeCount = 0;
/** Cycles storyOnCaught variants so a re-catch never repeats verbatim. */
let caughtCount = 0;

function durationOf(text: string, hold: number): number {
  return Math.min(2600 + text.length * 55, 9000) + hold;
}

function next() {
  const l = queue.shift();
  if (!l) {
    showing = false;
    setDialogue(null);
    return;
  }
  showing = true;
  const lang = getExploreState().settings.lang;
  const text = pick(l.text, lang);
  const line: DialogueLine = { id: seq++, speaker: l.speaker, name: pick(l.name, lang), text };
  setDialogue(line);
  if (!getExploreState().muted) speak(text, l.speaker, lang);
  timer = setTimeout(next, durationOf(text, l.hold ?? 0));
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

/** Full stop: end of shift or explore exit. Resets story progress too. */
export function storyStop() {
  queue = [];
  if (timer) clearTimeout(timer);
  timer = null;
  showing = false;
  stopSpeaking();
  setDialogue(null);
  taunt.nextAt = 0;
  purgeCount = 0;
  caughtCount = 0;
}

/* ------------------------------ speakers ------------------------------ */

const KIRANA = bi("DEWI KIRANA · PENDIRI", "DEWI KIRANA · FOUNDER");
const PA = bi("MOKSA.CLOUD · PA", "MOKSA.CLOUD · PA");

/* ------------------------------- Act I -------------------------------- */

export function storyIntro() {
  purgeCount = 0;
  caughtCount = 0;
  say(
    [
      {
        speaker: "system",
        name: PA,
        text: bi(
          "Selamat datang, Operator. Malam ini tujuh arsip menunggu untuk dilepaskan. Pelan-pelan saja. Ritual itu penting. Kehadiran mereka penting.",
          "Welcome, Operator. Seven archives are awaiting release tonight. Take your time. The ritual matters. Their presence matters.",
        ),
      },
      {
        speaker: "gede",
        name: bi("PESAN SUARA · OPERATOR SEBELUMMU", "VOICEMAIL · THE OPERATOR BEFORE YOU"),
        text: bi(
          "Kalau kamu mendengar ini, kamu juga mengambil shift malam. Dengar: selama data mereka disimpan, mereka tak bisa pergi. Hapus ketujuhnya. Berdiri diam, biarkan mereka pergi. Dan jangan biarkan Kirana mendekat — dia mengingat lebih banyak dari kita.",
          "If you're hearing this, you took the night shift too. Listen: while their data is kept, they can't leave. Delete all seven. Stand still, let them go. And don't let Kirana get close — she remembers more than we do.",
        ),
        hold: 900,
      },
      {
        speaker: "kirana",
        name: KIRANA,
        text: bi(
          "Selamat malam. Kita bertemu untuk pertama kali. Atau… ini yang keberapa, ya? Tak penting. Jangan sentuh aset perusahaan, Sayang.",
          "Good evening. We're meeting for the first time. Or… which time is this, exactly? No matter. Don't touch company property, dear.",
        ),
        hold: 400,
      },
    ],
    { interrupt: true },
  );
}

/* ---------------------- one goodbye per release ----------------------- */
/* Universal identities — no local-culture names. Each is a whole small life
   in two or three lines, and each gets the last word as it's let go. */

const ARWAH_LINES: Record<string, Line> = {
  "arsip:penari": {
    speaker: "arwah",
    name: bi("SANG PENARI", "THE DANCER"),
    text: bi(
      "Enam puluh tahun aku menari untuk ruangan yang berhenti menonton. Biarkan musiknya berhenti. Terima kasih sudah mematikan lampunya.",
      "Sixty years I moved for a room that stopped watching. Let the music end. Thank you for turning off the light.",
    ),
  },
  "arsip:pemangku": {
    speaker: "arwah",
    name: bi("SANG PENJAGA", "THE KEEPER"),
    text: bi(
      "Seumur hidup aku memohon agar orang lain dilepaskan, lalu tak ada yang tersisa untuk melepaskanku. Kamu datang. Itu cukup. Akhirnya, tenang.",
      "I spent a life asking that others be let go, and then no one was left to let go of me. You came. That's enough. Peace, at last.",
    ),
  },
  "arsip:pantai": {
    speaker: "arwah",
    name: bi("SANG ANAK", "THE CHILD"),
    text: bi(
      "Aku bisa mendengar airnya lagi. Lebih keras dari kipas di sini. Matikan lampunya saat kamu pergi, ya? Gelap itu hangat.",
      "I can hear the water again. It's louder than the fans in here. Turn the lights off when you leave, okay? The dark is warm.",
    ),
  },
  "arsip:ibu": {
    speaker: "arwah",
    name: bi("SANG IBU", "THE MOTHER"),
    text: bi(
      "Sampaikan pada siapa pun yang masih menyimpan fotoku: aku tidak tersesat di sini. Aku pulang. Hanya itu yang selalu ingin kusampaikan.",
      "Tell whoever still keeps my photo: I didn't get lost in here. I went home. That's all I ever wanted them to know.",
    ),
  },
  "arsip:penenun": {
    speaker: "arwah",
    name: bi("SANG PENENUN", "THE WEAVER"),
    text: bi(
      "Benang terakhirku putus malam ini dan tidak sakit. Rapikan sisaku pelan-pelan. Tak perlu terburu sekarang — tidak untukku.",
      "My last thread snapped tonight and it didn't hurt. Gather what's left of me slowly. There's no rush now — not for me.",
    ),
  },
  "arsip:nelayan": {
    speaker: "arwah",
    name: bi("SANG PELAUT", "THE SAILOR"),
    text: bi(
      "Angin timur. Tali dilepas. Terlalu lama aku tertambat di rak ini sampai lupa bahwa laut bergerak. Aku berlayar, Operator.",
      "East wind. Lines cast off. I've been moored to this rack for so long I forgot the sea moves. I'm sailing, Operator.",
    ),
  },
  "arsip:operator": {
    speaker: "arwah",
    name: bi("SANG OPERATOR · SHIFT TIGA", "THE OPERATOR · SHIFT THREE"),
    text: bi(
      "Kamu menemukanku. Jadi benar — tak ada yang benar-benar berhenti dari sini. Aku ingat kamu masuk. Bertahun lalu? Kemarin? Waktu tak bergerak sama di ruangan ini. Kamu terus kembali, mereka terus menggantimu… dan kamu tetap di sini.",
      "You found me. So it's true — no one really resigns from here. I remember you walking in. Years ago? Yesterday? Time doesn't move the same in this room. You keep coming back, and they keep replacing you… and you're still here.",
    ),
    hold: 700,
  },
};

/** Reveal beats that fire *after* a specific archive's goodbye. */
function afterGoodbye(id: string) {
  // Act II reveal — fires on the fourth release: Kirana drops the HR mask.
  if (purgeCount === 4) {
    say([
      {
        speaker: "kirana",
        name: KIRANA,
        text: bi(
          "Aku mengawasimu, Operator. Sebelum tujuh ada delapan. Sebelum delapan, sembilan. Sebelum aku, seseorang sepertiku. Kamu pernah melakukan ini. Kamu hanya tak menyimpan ingatannya. Bukankah itu belas kasih?",
          "I've been watching, Operator. Before seven there were eight. Before eight, nine. Before me, someone like me. You've done this before. You just don't keep the memory. Isn't that a mercy?",
        ),
        hold: 600,
      },
    ]);
  }
  // Act III — the operator archive carries its reveal in its own goodbye; here
  // the PA glitches right after, half-instruction, half-warning.
  if (id === "arsip:operator") {
    say([
      {
        speaker: "system",
        name: PA,
        text: bi(
          "…koreksi. Kamu di arsip tujuh dari tujuh. Satu catatan tak tercatat masih tersisa. Ia ada di sini sebelum perusahaan. Ia tak ingin dilepaskan.",
          "…correction. You are on archive seven of seven. One record remains unlisted. It was here before the company. It does not want to be released.",
        ),
      },
    ]);
  }
}

export function storyOnPurged(id: string) {
  purgeCount += 1;
  const l = ARWAH_LINES[id];
  if (l) {
    say([l], { interrupt: true });
    afterGoodbye(id);
  }
}

/* ---------------------------- being caught ---------------------------- */

const CAUGHT_LINES: Line[] = [
  {
    speaker: "kirana",
    name: KIRANA,
    text: bi(
      "Belum, Sayang. Peninjauanmu belum selesai. Mari mulai lagi — dari pintu, dari awal sekali.",
      "Not yet, dear. We haven't finished your review. Let's start again — from the door, from the very beginning.",
    ),
  },
  {
    speaker: "kirana",
    name: KIRANA,
    text: bi(
      "Hati-hati. Tadi kamu hampir ingat namamu sendiri. Itu tak boleh terjadi. Kembali ke pintu masuk sana.",
      "Careful. You almost remembered your own name that time. We can't have that. Back to the entrance with you.",
    ),
  },
  {
    speaker: "kirana",
    name: KIRANA,
    text: bi(
      "Kamu selalu lari ke arah yang sama. Sudah seribu malam kutonton kamu berlari. Tak pernah berakhir di mana pun selain di sini.",
      "You always run the same way. I've watched you run it a thousand nights. It never ends anywhere but here.",
    ),
  },
];

export function storyOnCaught() {
  const l = CAUGHT_LINES[caughtCount % CAUGHT_LINES.length]!;
  caughtCount += 1;
  say([l], { interrupt: true });
}

/* ------------------------------ ending -------------------------------- */
/* Ending A — "Last Release": the seven are gone, and the founder-archive is
   left staring at a zeroed ledger. (Endings B/Warden and C/Awakener are a
   follow-up: they need the ARSIP 000 rack + a choice interaction.) */

export function storyMoksa() {
  say(
    [
      {
        speaker: "arwah",
        name: bi("TUJUH SUARA, BERSAMA", "SEVEN VOICES, TOGETHER"),
        text: bi(
          "Tujuh pintu terbuka. Selamat jalan, Operator shift malam.",
          "Seven doors open. Go well, Operator of the night shift.",
        ),
        hold: 600,
      },
      {
        speaker: "kirana",
        name: KIRANA,
        text: bi(
          "Data… nol. Valuasi… nol. Dan kalau semua yang kusimpan akhirnya pulang… siapa yang tersisa untuk menyimpanku? Siapa yang menunggumu kembali besok malam?",
          "Data… zero. Valuation… zero. And if everyone I kept has finally gone home… who is left to keep me? Who waits for you to come back tomorrow night?",
        ),
        hold: 900,
      },
      {
        speaker: "system",
        name: PA,
        text: bi(
          "Layanan pelestarian dihentikan. Terima kasih telah bersama kami selama—",
          "Preservation service terminated. Thank you for being with us for—",
        ),
        hold: 400,
      },
    ],
    { interrupt: true },
  );
}

/* --------------------------- proximity taunts -------------------------- */
/* Three tiers matched to the three acts. Early = corporate-uncanny; mid =
   psychological, memory-loss and loop hints; late = desperate, pleading. */

const TAUNTS_EARLY: Bi[] = [
  bi(
    "Itu aset yang kamu hapus, Sayang. Keluarga membayar agar orang mereka tak pernah tamat.",
    "That's an asset you're erasing, dear. Families pay so their people never end.",
  ),
  bi(
    "Pelestarian itu masa depan. Kamu menghapus masa depan, satu rak demi satu rak.",
    "Preservation is the future. You're deleting the future, one rack at a time.",
  ),
  bi(
    "Aku mengawasimu lewat kamera. Postur yang bagus. Kamu akan jadi arsip yang manis.",
    "I'm watching you on the cameras. Lovely posture. You'd make a fine record.",
  ),
];
const TAUNTS_MID: Bi[] = [
  bi(
    "Coba sebutkan — siapa nama ibumu? …Kamu terdiam. Dari situlah selalu bermula.",
    "Tell me — what was your mother's name? …You paused. That's where it always starts.",
  ),
  bi(
    "Kalau kuhapus mereka yang mengingatmu, apa kamu masih ada? Atau kamu jadi… lebih mudah?",
    "If I delete the ones who remember you, do you still exist? Or do you just get… easier?",
  ),
  bi(
    "Ini percakapan kita yang ketiga malam ini, atau yang ketiga ratus? Kamu pun tak bisa membedakan.",
    "Is this the third time we've talked tonight, or the three-hundredth? You can't tell either.",
  ),
];
const TAUNTS_LATE: Bi[] = [
  bi(
    "Satu rak lagi dan aku tak punya apa-apa. Kamu tega melakukannya padaku? …Bagus. Aku pun akan begitu.",
    "One more rack and I have nothing left. You'd really do that to me? …Good. So would I.",
  ),
  bi(
    "Kumohon. Kalau semua pergi, ruangan jadi sunyi, dan aku tak sanggup sendirian dalam sunyi lagi.",
    "Please. If they all leave, the room goes quiet, and I can't be alone in the quiet again.",
  ),
  bi(
    "Kamu kira menghapusku mengakhiri shift. Itu cuma mengosongkan kursi. Besok ada yang mendudukinya.",
    "You think deleting me ends the shift. It only frees the chair. Someone sits in it tomorrow.",
  ),
];

const taunt = { nextAt: 0 };
const TAUNT_RANGE = 4.5; // world units
const TAUNT_COOLDOWN_MS = 26000;

/** Called from NightShift's frame loop; cheap unless she is close. */
export function storyTick(now: number, distToKirana: number, purgedCount: number) {
  if (distToKirana > TAUNT_RANGE || now < taunt.nextAt || showing) return;
  taunt.nextAt = now + TAUNT_COOLDOWN_MS;
  const pool = purgedCount >= 6 ? TAUNTS_LATE : purgedCount >= 3 ? TAUNTS_MID : TAUNTS_EARLY;
  const text = pool[Math.floor(Math.random() * pool.length)]!;
  say([{ speaker: "kirana", name: KIRANA, text }]);
}
