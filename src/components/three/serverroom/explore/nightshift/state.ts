/**
 * MOKSA.CLOUD (SHIFT MALAM) — mutable fast-lane state for the hidden horror
 * mode. Same pattern as explore/store.ts's `player`/`input` singletons: the
 * frame loop mutates freely, React reads via the explore store's `night*`
 * fields (this module must stay three-free so the eager store can import it).
 *
 * Lore: MOKSA.CLOUD "preserves" ancestors digitally; while an archive is
 * stored, its arwah cannot moksa. The night operator's job is to DELETE —
 * a digital release rite, one rack at a time — while Bu Dewi Kirana objects.
 */

import type { Bi } from "../i18n";

export interface ArsipDef {
  id: `arsip:${string}`;
  /** Bilingual rack designation, shown in the "delete" interact prompt. */
  label: Bi;
  x: number;
  z: number;
}

/** Seven archives across all five zones — the purge route IS the map tour.
    (RPG expansion 2026-07-16b: penenun moved to BENGKEL, nelayan to NOC, so
    the night shift also visits the new rooms — doors must be unlocked by
    day, which is exactly the RPG quest route.) */
export const ARSIP_RACKS: ArsipDef[] = [
  { id: "arsip:penari", label: bi("ARSIP 001 — SANG PENARI, 1963", "ARCHIVE 001 — THE DANCER, 1963"), x: -1.5, z: -3 }, // prettier-ignore
  { id: "arsip:pemangku", label: bi("ARSIP 014 — SANG PENJAGA, 1977", "ARCHIVE 014 — THE KEEPER, 1977"), x: 1.4, z: -20 }, // prettier-ignore
  { id: "arsip:pantai", label: bi("ARSIP 098 — SANG ANAK, 1998", "ARCHIVE 098 — THE CHILD, 1998"), x: -1.5, z: -33 }, // prettier-ignore
  { id: "arsip:ibu", label: bi("ARSIP 121 — SANG IBU, 2004", "ARCHIVE 121 — THE MOTHER, 2004"), x: 5, z: -12.4 }, // prettier-ignore
  { id: "arsip:penenun", label: bi("ARSIP 133 — SANG PENENUN, 2009", "ARCHIVE 133 — THE WEAVER, 2009"), x: -8.5, z: -17.6 }, // prettier-ignore
  { id: "arsip:nelayan", label: bi("ARSIP 152 — SANG PELAUT, 2015", "ARCHIVE 152 — THE SAILOR, 2015"), x: 12.8, z: -3.4 }, // prettier-ignore
  { id: "arsip:operator", label: bi("ARSIP 166 — SANG OPERATOR, SHIFT TIGA", "ARCHIVE 166 — THE OPERATOR, SHIFT THREE"), x: 21, z: -14.5 }, // prettier-ignore
];

/** Local bilingual-phrase builder (state.ts stays free of runtime i18n deps). */
function bi(id: string, en: string): Bi {
  return { id, en };
}

export const RITUAL_MS = 3000; // hold-still duration per purge
export const RITUAL_MOVE_TOL = 0.35; // drift past this cancels the ritual

/** Kirana rests deep in CORE; the ghost haunts the far end of Aisle-A. */
export const KIRANA_SPAWN = { x: 20.5, z: -22.5 };
export const GHOST_SPAWN = { x: -1.2, z: -26 };

export const night = {
  /** Headlamp state — the VHS ghost is drawn to light. L toggles. */
  lamp: true,
  /** Ghost contact forces the lamp dark until this epoch (ms). */
  lampLockUntil: 0,
  kirana: { x: KIRANA_SPAWN.x, z: KIRANA_SPAWN.z, yaw: 0 },
  ghost: { x: GHOST_SPAWN.x, z: GHOST_SPAWN.z, fade: 0 },
  /** Where the active ritual was started (movement-cancel anchor). */
  purgeAnchor: { x: 0, z: 0 },
};

export function resetNight() {
  night.lamp = true;
  night.lampLockUntil = 0;
  night.kirana = { x: KIRANA_SPAWN.x, z: KIRANA_SPAWN.z, yaw: 0 };
  night.ghost = { x: GHOST_SPAWN.x, z: GHOST_SPAWN.z, fade: 0 };
}

export function lampIsOn(now: number): boolean {
  return night.lamp && now >= night.lampLockUntil;
}
