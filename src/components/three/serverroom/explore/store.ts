import { useSyncExternalStore } from "react";
import { SPAWN } from "./layout";
import { ARSIP_RACKS, night, resetNight, RITUAL_MS } from "./nightshift/state";

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
export type DoorId = "door-lab" | "door-core";

export type ExploreModal =
  | { type: "puzzle"; doorId: DoorId }
  | { type: "terminal" }
  | { type: "certificate" }
  | { type: "study"; slug: string }
  | null;

export interface Toast {
  id: number;
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
}

function loadPersisted(): Persisted {
  if (typeof window === "undefined") return { unlocked: [], achievements: [], muted: false };
  try {
    const raw = window.localStorage.getItem(PERSIST_KEY);
    if (!raw) return { unlocked: [], achievements: [], muted: false };
    const p = JSON.parse(raw) as Partial<Persisted>;
    return {
      unlocked: Array.isArray(p.unlocked) ? p.unlocked : [],
      achievements: Array.isArray(p.achievements) ? p.achievements : [],
      muted: Boolean(p.muted),
    };
  } catch {
    return { unlocked: [], achievements: [], muted: false };
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

/** V / F5 / HUD button: flip first-person ↔ third-person (session-only). */
export function toggleView() {
  state = { ...state, view: state.view === "first" ? "third" : "first" };
  emit();
}

export function markVisited(zone: string) {
  if (state.visited.includes(zone)) return;
  state = { ...state, visited: [...state.visited, zone] };
  emit();
  if (zone === "lab") addAchievement("ARCHIVE FOUND — arsip eksperimen ditemukan");
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
  state = { ...state, night: true, purged: [], purging: null, moksa: false, modal: null };
  emit();
  addToast("// SHIFT MALAM — hapus 7 arsip. Ia tahu kamu di sini.");
  addToast("L = lampu · lampu menarik sesuatu dari 1998");
}

export function endNightShift() {
  state = { ...state, night: false, purging: null, moksa: false };
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
  if (id === "terminal") {
    setModal({ type: "terminal" });
  } else if (id.startsWith("study:")) {
    setModal({ type: "study", slug: id.slice("study:".length) });
  } else {
    setModal({ type: "puzzle", doorId: id as DoorId });
  }
  if (typeof document !== "undefined" && document.pointerLockElement) {
    document.exitPointerLock();
  }
}
