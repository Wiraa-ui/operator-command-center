import { useSyncExternalStore } from "react";
import { roomAudio } from "./audio";
import { SPAWN } from "./layout";
import { ARSIP_RACKS, night, resetNight, RITUAL_MS } from "./nightshift/state";
import type { Speaker } from "./nightshift/voice";

/**
 * EXPLORE mode state. Two tiers on purpose:
 *
 * - `exploreStore` — immutable snapshots + useSyncExternalStore, for anything
 *   the DOM HUD renders (privilege, modal, toasts, interact prompt).
 * - `input` / `player` — plain mutable singletons written every frame by
 *   DOM listeners and PlayerRig. They deliberately bypass React: at 60 fps a
 *   setState per frame would churn the whole HUD tree.
 */

export type Privilege = "guest" | "operator" | "root";
export type DoorId =
  "door-lab" | "door-core" | "door-bengkel" | "door-noc" | "door-vault" | "door-hall";

/** RPG quest state: questId → current step index, plus finished quests. */
export interface QuestProgress {
  active: Record<string, number>;
  completed: string[];
}

export type ExploreModal =
  | { type: "puzzle"; doorId: DoorId }
  | { type: "terminal" }
  | { type: "certificate" }
  | { type: "study"; slug: string }
  | { type: "login" }
  | { type: "npc"; npcId: string }
  | null;

export interface Toast {
  id: number;
  text: string;
}

/** One spoken subtitle line (DialogueOverlay); story.ts runs the queue. */
export interface DialogueLine {
  id: number;
  speaker: Speaker;
  /** Display name on the subtitle ("BU DEWI KIRANA", "PENARI, 1963", …). */
  name: string;
  text: string;
}

export interface ExploreState {
  privilege: Privilege;
  unlocked: DoorId[];
  visited: string[];
  achievements: string[];
  modal: ExploreModal;
  interact: { id: string; label: string } | null;
  toasts: Toast[];
  muted: boolean;
  /** Camera perspective: first-person eye vs third-person chase boom. */
  view: "first" | "third";
  /** ms epoch when this explore session started (speedrun timer). */
  startedAt: number;
  /** MOKSA.CLOUD (SHIFT MALAM) — hidden horror mode. Session-only. */
  night: boolean;
  /** Purged arsip ids (digital ngaben progress, max 7). */
  purged: string[];
  /** Active hold-still ritual, for the HUD progress readout. */
  purging: { id: string; until: number } | null;
  /** All 7 purged — the moksa ending overlay is up. */
  moksa: boolean;
  /** Current subtitle line, if a character is speaking. */
  dialogue: DialogueLine | null;
  /** Logged-in room account (persisted by online.ts). */
  user: { name: string } | null;
  /** Names of other players currently online (positions live in online.ts). */
  onlinePeers: string[];
  /** RPG quest-line progress (persisted). Engine lives in rpg.ts. */
  questProgress: QuestProgress;
}

/* ------------------------- mutable fast lane -------------------------- */

export const input = {
  keys: new Set<string>(),
  /** Virtual joystick, each axis −1..1 (y+ = backward, matching stick pull-down). */
  joy: { x: 0, y: 0 },
  /** Accumulated look deltas (px), consumed by PlayerRig each frame. */
  lookDX: 0,
  lookDY: 0,
  pointerLocked: false,
};

/** y/vy: jump arc — y is height above the floor, 0 = grounded. */
export const player = { x: SPAWN.x, z: SPAWN.z, y: 0, vy: 0, yaw: SPAWN.yaw, pitch: 0 };

// Read-only debug/E2E hook (console: __ra.player) — cheap, and the state is
// all client-side game progress anyway.
if (typeof window !== "undefined") {
  (window as unknown as { __ra?: object }).__ra = {
    player,
    getState: () => state,
    // E2E hooks for the hidden night mode (all state is client-side anyway).
    night,
    beginNightShift: () => beginNightShift(),
    audio: () => roomAudio.debugState(),
  };
}

export function resetPlayer() {
  player.x = SPAWN.x;
  player.z = SPAWN.z;
  player.y = 0;
  player.vy = 0;
  player.yaw = SPAWN.yaw;
  player.pitch = 0;
  input.keys.clear();
  input.joy.x = 0;
  input.joy.y = 0;
  input.lookDX = 0;
  input.lookDY = 0;
}

/* --------------------------- reactive store --------------------------- */

const PERSIST_KEY = "room-access-v1";

interface Persisted {
  unlocked: DoorId[];
  achievements: string[];
  muted: boolean;
  questProgress: QuestProgress;
}

const EMPTY_PERSIST: Persisted = {
  unlocked: [],
  achievements: [],
  muted: false,
  questProgress: { active: {}, completed: [] },
};

function loadPersisted(): Persisted {
  if (typeof window === "undefined") return EMPTY_PERSIST;
  try {
    const raw = window.localStorage.getItem(PERSIST_KEY);
    if (!raw) return EMPTY_PERSIST;
    const p = JSON.parse(raw) as Partial<Persisted>;
    const qp = p.questProgress;
    return {
      unlocked: Array.isArray(p.unlocked) ? p.unlocked : [],
      achievements: Array.isArray(p.achievements) ? p.achievements : [],
      muted: Boolean(p.muted),
      questProgress:
        qp && typeof qp.active === "object" && Array.isArray(qp.completed)
          ? { active: qp.active, completed: qp.completed }
          : { active: {}, completed: [] },
    };
  } catch {
    return EMPTY_PERSIST;
  }
}

function privilegeOf(unlocked: DoorId[]): Privilege {
  if (unlocked.includes("door-core")) return "root";
  if (unlocked.includes("door-lab")) return "operator";
  return "guest";
}

function initialState(): ExploreState {
  const p = loadPersisted();
  return {
    privilege: privilegeOf(p.unlocked),
    unlocked: p.unlocked,
    visited: [],
    achievements: p.achievements,
    questProgress: p.questProgress,
    modal: null,
    interact: null,
    toasts: [],
    muted: p.muted,
    view: "first",
    startedAt: Date.now(),
    night: false,
    purged: [],
    purging: null,
    moksa: false,
    dialogue: null,
    user: null,
    onlinePeers: [],
  };
}

let state: ExploreState = initialState();
const listeners = new Set<() => void>();

function emit() {
  for (const l of listeners) l();
}

function persist() {
  try {
    window.localStorage.setItem(
      PERSIST_KEY,
      JSON.stringify({
        unlocked: state.unlocked,
        achievements: state.achievements,
        muted: state.muted,
        questProgress: state.questProgress,
      } satisfies Persisted),
    );
  } catch {
    /* storage may be unavailable (private mode) — game still works per-session */
  }
}

function subscribe(fn: () => void): () => void {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export function getExploreState(): ExploreState {
  return state;
}

export function useExplore<T>(selector: (s: ExploreState) => T): T {
  return useSyncExternalStore(
    subscribe,
    () => selector(state),
    () => selector(state),
  );
}

/* ------------------------------ actions ------------------------------- */

let toastSeq = 1;

export function addToast(text: string) {
  const toast = { id: toastSeq++, text };
  state = { ...state, toasts: [...state.toasts, toast] };
  emit();
  setTimeout(() => {
    state = { ...state, toasts: state.toasts.filter((t) => t.id !== toast.id) };
    emit();
  }, 4200);
}

export function addAchievement(text: string) {
  if (state.achievements.includes(text)) return;
  state = { ...state, achievements: [...state.achievements, text] };
  persist();
  addToast(`🏆 ${text}`);
  roomAudio.sfx("achievement");
}

export function setInteract(interact: ExploreState["interact"]) {
  if (state.interact?.id === interact?.id) return;
  state = { ...state, interact };
  emit();
}

export function setModal(modal: ExploreModal) {
  state = { ...state, modal };
  emit();
}

export function setMuted(muted: boolean) {
  state = { ...state, muted };
  persist();
  emit();
}

/** story.ts owns queueing/timing; this just publishes the current line. */
export function setDialogue(dialogue: DialogueLine | null) {
  state = { ...state, dialogue };
  emit();
}

export function setUser(user: { name: string } | null) {
  state = { ...state, user };
  emit();
}

export function setOnlinePeers(onlinePeers: string[]) {
  state = { ...state, onlinePeers };
  emit();
}

export function setQuestProgress(questProgress: QuestProgress) {
  state = { ...state, questProgress };
  persist();
  emit();
}

/** rpg.ts registers its questEvent here (avoids a store↔rpg import cycle). */
let questSink: (tag: string) => void = () => {};
export function registerQuestSink(fn: (tag: string) => void) {
  questSink = fn;
}
export function emitQuestEvent(tag: string) {
  questSink(tag);
}

/** V / F5 / HUD button: flip first-person ↔ third-person (session-only). */
export function toggleView() {
  state = { ...state, view: state.view === "first" ? "third" : "first" };
  emit();
}

/** Every explorable zone; completing the set earns the cartographer badge. */
const ALL_ZONES = ["aisle", "lab", "core", "bengkel", "noc", "vault", "hall", "tunnel"];

export function markVisited(zone: string) {
  if (state.visited.includes(zone)) return;
  state = { ...state, visited: [...state.visited, zone] };
  emit();
  if (zone === "lab") addAchievement("ARCHIVE FOUND — arsip eksperimen ditemukan");
  if (ALL_ZONES.every((z) => state.visited.includes(z))) {
    addAchievement("KARTOGRAF — seluruh peta dijelajahi");
  }
}

export function beginSession() {
  state = {
    ...state,
    startedAt: Date.now(),
    visited: [],
    modal: null,
    interact: null,
    // A fresh explore session always starts on the day shift.
    night: false,
    purged: [],
    purging: null,
    moksa: false,
  };
  emit();
}

export function unlockDoor(id: DoorId) {
  if (state.unlocked.includes(id)) return;
  const unlocked = [...state.unlocked, id];
  state = { ...state, unlocked, privilege: privilegeOf(unlocked), modal: null };
  persist();
  emit();
  if (id === "door-lab") addAchievement("PRIVILEGE ESCALATED → OPERATOR");
  if (id === "door-core") {
    addAchievement("PRIVILEGE ESCALATED → ROOT");
    if (Date.now() - state.startedAt < 120_000) {
      addAchievement("SPEEDRUN — root dalam < 2 menit");
    }
  }
}

export function isUnlocked(id: DoorId): boolean {
  return state.unlocked.includes(id);
}

/* --------------------------- SHIFT MALAM ------------------------------ */

/** Enter MOKSA.CLOUD (hidden terminal command). Session-only, no persist. */
export function beginNightShift() {
  resetNight();
  // Maintenance access opens for the night crew: two of the seven archives
  // sit in BENGKEL/NOC, so their doors must never soft-lock the ending.
  const unlocked = [...state.unlocked];
  for (const id of ["door-bengkel", "door-noc"] as const) {
    if (!unlocked.includes(id)) unlocked.push(id);
  }
  state = {
    ...state,
    unlocked,
    privilege: privilegeOf(unlocked),
    night: true,
    purged: [],
    purging: null,
    moksa: false,
    modal: null,
  };
  persist();
  emit();
  addToast("// SHIFT MALAM — hapus 7 arsip. Ia tahu kamu di sini.");
  addToast("L = lampu · akses maintenance dibuka untuk shift malam");
}

export function endNightShift() {
  state = { ...state, night: false, purging: null, moksa: false, dialogue: null };
  emit();
}

/** Movement past tolerance (checked by NightShift's frame loop) lands here. */
export function cancelPurge(reason?: string) {
  if (!state.purging) return;
  state = { ...state, purging: null };
  emit();
  if (reason) addToast(reason);
}

export function completePurge() {
  const id = state.purging?.id;
  if (!id || state.purged.includes(id)) return;
  const purged = [...state.purged, id];
  const moksa = purged.length >= ARSIP_RACKS.length;
  state = { ...state, purged, purging: null, moksa };
  emit();
  addToast(`ARSIP TERHAPUS — satu arwah moksa (${purged.length}/${ARSIP_RACKS.length})`);
  if (moksa) {
    addAchievement("MOKSA — semua arwah pulang");
    // The ending overlay needs a clickable cursor.
    if (typeof document !== "undefined" && document.pointerLockElement) {
      document.exitPointerLock();
    }
  }
}

/** E / tap: open the modal for whatever interactable is in range. */
export function triggerInteract() {
  if (state.modal || !state.interact) return;
  const id = state.interact.id;
  if (id.startsWith("arsip:")) {
    // Hold-still ritual, not a modal — pointer lock stays, the world keeps
    // moving (that's the danger). NightShift's frame loop resolves it.
    if (state.purging) return;
    night.purgeAnchor.x = player.x;
    night.purgeAnchor.z = player.z;
    state = { ...state, purging: { id, until: Date.now() + RITUAL_MS } };
    emit();
    addToast("Ritual ngaben digital — tahan posisi…");
    return;
  }
  if (id.startsWith("node:")) {
    // Quest patch panel: instant check, stay in pointer lock.
    emitQuestEvent(id);
    return;
  }
  if (id === "vault:master") {
    // Collectible, not a modal: inspecting the golden master tape.
    addAchievement("PENJAGA ARSIP — master tape ditemukan");
    addToast("MASTER BACKUP · harian 02:00 WITA · uji-restore: LULUS");
    return;
  }
  if (id === "terminal") {
    setModal({ type: "terminal" });
    emitQuestEvent("terminal");
  } else if (id.startsWith("study:")) {
    setModal({ type: "study", slug: id.slice("study:".length) });
    emitQuestEvent("study");
  } else if (id.startsWith("npc:")) {
    setModal({ type: "npc", npcId: id });
    emitQuestEvent(`talk:${id}`);
  } else {
    setModal({ type: "puzzle", doorId: id as DoorId });
  }
  if (typeof document !== "undefined" && document.pointerLockElement) {
    document.exitPointerLock();
  }
}
