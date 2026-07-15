import type { HumanoidLook } from "./humanoid";
import {
  addAchievement,
  addToast,
  getExploreState,
  registerQuestSink,
  setQuestProgress,
  type QuestProgress,
} from "./store";

/**
 * rpg — the day-shift RPG layer (user mandate 2026-07-16b: expand map+story
 * RPG-style, portfolio-themed, creative freedom granted). Three NPCs staff
 * the facility, three chained quests walk a visitor through the portfolio:
 * read a case study, trace the network, get root and apply. The quest data
 * and the tiny linear-step engine live here; NpcModal renders dialogue.
 *
 * The night shift (MOKSA.CLOUD) is the same building after hours — NPCs go
 * home when it starts, and Q2 is the breadcrumb that leads there.
 */

/* -------------------------------- NPCs -------------------------------- */

export type NpcId = "npc:ayu" | "npc:gede" | "npc:putu";

export interface NpcDef {
  id: NpcId;
  name: string;
  title: string;
  x: number;
  z: number;
  yaw: number;
  look: HumanoidLook;
}

export const NPCS: NpcDef[] = [
  {
    id: "npc:ayu",
    name: "Mbak Ayu",
    title: "FRONT DESK · SHIFT SATU",
    x: -1.25,
    z: 1.1,
    yaw: -Math.PI / 3,
    look: {
      skin: "#d2a679",
      hair: "#10192e",
      outfit: "#23324e",
      outfitDark: "#16233c",
      accent: "#f59e0b",
      height: 1.64,
      hairStyle: "bun",
    },
  },
  {
    id: "npc:gede",
    name: "Bli Gede",
    title: "TEKNISI SENIOR · BENGKEL",
    x: -8.2,
    z: -16.4,
    yaw: -Math.PI / 2,
    look: {
      skin: "#b98a5e",
      hair: "#4a5468",
      outfit: "#2b3a52",
      outfitDark: "#1a2740",
      accent: "#f59e0b",
      height: 1.73,
    },
  },
  {
    id: "npc:putu",
    name: "Putu",
    title: "INTERN · NOC",
    x: 10,
    z: -3.1,
    yaw: 0,
    look: {
      skin: "#cf9a6c",
      hair: "#0e1526",
      outfit: "#1d3a55",
      outfitDark: "#132a41",
      accent: "#38bdf8",
      height: 1.66,
    },
  },
];

/* ---------------------------- quest nodes ----------------------------- */

export interface QuestNodeDef {
  id: `node:${string}`;
  label: string;
  x: number;
  z: number;
}

/** Patch points for Q2 — one per original zone, ordered along the route. */
export const QUEST_NODES: QuestNodeDef[] = [
  { id: "node:aisle", label: "PERIKSA PATCH PANEL — AISLE", x: -1.8, z: -22 },
  { id: "node:lab", label: "PERIKSA PATCH PANEL — LAB", x: 7, z: -12.55 },
  { id: "node:core", label: "PERIKSA PATCH PANEL — CORE", x: 19.2, z: -23.3 },
];

/* ------------------------------- quests ------------------------------- */

export interface QuestStep {
  /** Event tag that advances this step (see questEvent). */
  event: string;
  /** Tracker text while the step is active. */
  text: string;
  /** Toast when the step completes. */
  doneToast?: string;
}

export interface QuestDef {
  id: string;
  title: string;
  giver: NpcId;
  steps: QuestStep[];
  achievement: string;
}

export const QUESTS: QuestDef[] = [
  {
    id: "q-orientasi",
    title: "ORIENTASI SHIFT SATU",
    giver: "npc:ayu",
    steps: [
      {
        event: "study",
        text: "Baca satu dossier proyek di rak AISLE-A ([E] BACA)",
        doneToast: "Dossier dibaca — Mbak Ayu pasti senang.",
      },
      {
        event: "talk:npc:gede",
        text: "Lapor ke Bli Gede di BENGKEL (pintu barat lorong)",
      },
    ],
    achievement: "ORIENTASI SELESAI — resmi jadi operator baru",
  },
  {
    id: "q-sinyal",
    title: "SINYAL HANTU",
    giver: "npc:putu",
    steps: [
      {
        event: "node:aisle",
        text: "Periksa patch panel di ujung dalam AISLE-A",
        doneToast: "Panel AISLE: normal… tapi ada derau aneh.",
      },
      {
        event: "node:lab",
        text: "Periksa patch panel di LAB (dinding selatan)",
        doneToast: "Panel LAB: derau menguat. Frekuensinya seperti gamelan?",
      },
      {
        event: "node:core",
        text: "Periksa patch panel di CORE (pojok selatan)",
        doneToast: "Panel CORE: sumbernya di bawah rak arsip. Kembali ke Putu.",
      },
      {
        event: "talk:npc:putu",
        text: "Laporkan temuanmu ke Putu di NOC",
      },
    ],
    achievement: "PEMBURU SINYAL — derau itu bukan kerusakan",
  },
  {
    id: "q-kandidat",
    title: "REKOMENDASI DIREKTUR",
    giver: "npc:gede",
    steps: [
      {
        event: "terminal",
        text: "Dapatkan ROOT dan buka terminal di CORE",
        doneToast: "Terminal terbuka. Satu perintah lagi…",
      },
      {
        event: "hire",
        text: "Jalankan `sudo hire-me` di terminal CORE",
      },
    ],
    achievement: "KANDIDAT — rekomendasi terkirim ke direktur",
  },
];

export const questById = (id: string) => QUESTS.find((q) => q.id === id);

/* ------------------------------- engine ------------------------------- */

/** Start a quest from an NPC dialogue choice. */
export function startQuest(id: string) {
  const q = questById(id);
  const p = getExploreState().questProgress;
  if (!q || p.active[id] !== undefined || p.completed.includes(id)) return;
  setQuestProgress({ ...p, active: { ...p.active, [id]: 0 } });
  addToast(`📜 QUEST DIMULAI — ${q.title}`);
}

/**
 * Advance any active quest whose current step listens for this tag.
 * Tags: "study", "terminal", "hire", "talk:<npcId>", "node:<zone>".
 */
export function questEvent(tag: string) {
  const p = getExploreState().questProgress;
  let next: QuestProgress | null = null;
  for (const [qid, stepIdx] of Object.entries(p.active)) {
    const q = questById(qid);
    const step = q?.steps[stepIdx];
    if (!q || !step || step.event !== tag) continue;
    const base: QuestProgress = next ?? p;
    if (step.doneToast) addToast(step.doneToast);
    if (stepIdx + 1 >= q.steps.length) {
      const active = { ...base.active };
      delete active[qid];
      next = { active, completed: [...base.completed, qid] };
      addAchievement(q.achievement);
    } else {
      next = { ...base, active: { ...base.active, [qid]: stepIdx + 1 } };
    }
  }
  if (next) setQuestProgress(next);
}

// Store actions route interact events here without importing this module.
registerQuestSink(questEvent);

// E2E/debug hook, same policy as store's __ra (client-side game state only).
if (typeof window !== "undefined") {
  const w = window as unknown as { __ra?: { quests?: object } };
  if (w.__ra) w.__ra.quests = { start: startQuest, event: questEvent };
}

/** The tracker shows the first active quest's current step. */
export function activeQuestInfo(p: QuestProgress): { title: string; step: string } | null {
  for (const [qid, stepIdx] of Object.entries(p.active)) {
    const q = questById(qid);
    const step = q?.steps[stepIdx];
    if (q && step) return { title: q.title, step: step.text };
  }
  return null;
}
