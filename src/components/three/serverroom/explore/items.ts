import { STORY_LOGS } from "./story-logs";
import type { DoorId } from "./store";

/**
 * items — the inventory registry (user feedback 2026-07-19: picking things up
 * gave no "item get" box and there was no way to review what you own).
 *
 * Nothing here adds new persistence: ownership is DERIVED from state that is
 * already saved (unlocked doors, collected logs, achievements), so old saves
 * get their inventory retroactively and there is no migration to maintain.
 */

export interface ItemDef {
  id: string;
  icon: string;
  name: string;
  desc: string;
}

/** Door unlocks read as keycards in the inventory. */
export const KEY_ITEMS: Partial<Record<DoorId, ItemDef>> = {
  "door-lab": {
    id: "item:key-lab",
    icon: "🪪",
    name: "KARTU AKSES LAB",
    desc: "Badge operator — membuka pintu LAB dari lorong AISLE-A.",
  },
  "door-core": {
    id: "item:key-core",
    icon: "🔑",
    name: "KUNCI MASTER CORE",
    desc: "Akses root ke jantung mesin. Jaga baik-baik.",
  },
  "door-vault": {
    id: "item:key-vault",
    icon: "❄",
    name: "AKSES VAULT",
    desc: "Izin masuk cold storage — lulus kuis backup 3-2-1.",
  },
};

/** The golden tape is granted via its achievement (already persisted). */
export const MASTER_TAPE_ACH = "PENJAGA ARSIP — master tape ditemukan";
export const MASTER_TAPE: ItemDef = {
  id: "item:master-tape",
  icon: "📼",
  name: "MASTER TAPE EMAS",
  desc: "Replika master backup harian 02:00 WITA. Uji-restore: LULUS.",
};

/** Every datapad is an inventory item named after its chapter. */
export const LOG_ITEMS: ItemDef[] = STORY_LOGS.map((l) => ({
  id: l.id,
  icon: "📟",
  name: l.chapter,
  desc: l.title,
}));

/** Display order for the inventory grid (unowned slots render as "???"). */
export const ALL_ITEMS: ItemDef[] = [
  KEY_ITEMS["door-lab"]!,
  KEY_ITEMS["door-core"]!,
  KEY_ITEMS["door-vault"]!,
  MASTER_TAPE,
  ...LOG_ITEMS,
];

/** Which item ids the player owns, derived from persisted progress. */
export function ownedItemIds(s: {
  unlocked: DoorId[];
  achievements: string[];
  collectedLogs: string[];
}): Set<string> {
  const owned = new Set<string>();
  for (const door of s.unlocked) {
    const item = KEY_ITEMS[door];
    if (item) owned.add(item.id);
  }
  if (s.achievements.includes(MASTER_TAPE_ACH)) owned.add(MASTER_TAPE.id);
  for (const logId of s.collectedLogs) owned.add(logId);
  return owned;
}
