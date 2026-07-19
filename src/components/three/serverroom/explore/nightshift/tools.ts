import { bi, type Bi } from "../i18n";

/**
 * tools — MOKSA.CLOUD survival gear (user mandate 2026-07-19: "bisa ngambil
 * senjata", RE7-style but lore-safe). Kirana can't be killed and the ghosts
 * aren't enemies, so tools BUY TIME, they don't win fights: scarce charges,
 * short effects. Two are in this pass; the UV torch + zone breakers are
 * backlog (see PROJECT_MASTER).
 *
 * This module is three-free (like state.ts) so the eager store can import it.
 * Ownership + charges live in the reactive store; the frame-loop effect timers
 * live here as a mutable singleton that NightShift reads each frame.
 */

export type ToolId = "genta" | "apar";

export const TOOL_IDS: ToolId[] = ["genta", "apar"];

export interface ToolPickup {
  id: ToolId;
  x: number;
  z: number;
  charges: number;
}

/** Where each tool waits in the world (walkable spots near existing racks). */
export const TOOL_PICKUPS: ToolPickup[] = [
  { id: "genta", x: -9.5, z: -16, charges: 3 }, // BENGKEL — the technician's locker
  { id: "apar", x: 12, z: -5, charges: 2 }, // NOC wall — server-room extinguisher
];

export const TOOL_META: Record<ToolId, { icon: string; name: Bi; use: Bi }> = {
  genta: {
    icon: "🔔",
    name: bi("GENTA", "HAND BELL"),
    use: bi("Kirana terhempas & terhuyung.", "Kirana is knocked back and reeling."),
  },
  apar: {
    icon: "🧯",
    name: bi("APAR", "EXTINGUISHER"),
    use: bi("Kabut membutakan Kirana sesaat.", "The fog blinds Kirana for a moment."),
  },
};

/** Frame-loop effect timers (ms epoch). NightShift reads; store.useTool writes. */
export const toolFx = { stunUntil: 0, blindUntil: 0 };

/** Max charges per tool (for the HUD's filled/empty pip row). */
export const TOOL_CHARGE_MAX: Record<ToolId, number> = TOOL_PICKUPS.reduce(
  (acc, p) => {
    acc[p.id] = p.charges;
    return acc;
  },
  {} as Record<ToolId, number>,
);

export const STUN_MS = 3500;
export const BLIND_MS = 5000;

export function resetToolFx() {
  toolFx.stunUntil = 0;
  toolFx.blindUntil = 0;
}
