import { PALETTE } from "../types";
import { ALL_ITEMS, ownedItemIds } from "./items";
import { setModal, useExplore } from "./store";

/**
 * InventoryModal — the "kotak item" (user feedback 2026-07-19). A game-style
 * grid of everything collectible; unowned slots stay as dim "???" so players
 * know how much is left to find. Ownership is derived (items.ts), so this
 * modal has no state of its own.
 */

const mono = "font-op-mono";

export function InventoryModal() {
  const unlocked = useExplore((s) => s.unlocked);
  const achievements = useExplore((s) => s.achievements);
  const collectedLogs = useExplore((s) => s.collectedLogs);
  const owned = ownedItemIds({ unlocked, achievements, collectedLogs });

  return (
    <div
      className="fixed inset-0 z-40 flex items-center justify-center bg-black/60 p-4"
      onClick={() => setModal(null)}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Inventaris item"
        className="max-h-[80vh] w-full max-w-md overflow-y-auto rounded-xl border p-5"
        style={{
          borderColor: "rgba(245,158,11,0.5)",
          background: "rgba(15,23,42,0.96)",
          color: "#e2e8f0",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-baseline justify-between">
          <div
            className={`${mono} text-[12px] font-bold uppercase tracking-[0.24em]`}
            style={{ color: PALETTE.accentBright }}
          >
            🎒 Inventaris
          </div>
          <div className={`${mono} text-[10px] tracking-[0.2em]`} style={{ color: "#9fb0cc" }}>
            {owned.size}/{ALL_ITEMS.length} ITEM
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3">
          {ALL_ITEMS.map((item) => {
            const has = owned.has(item.id);
            return (
              <div
                key={item.id}
                className="rounded-lg border px-2.5 py-3 text-center"
                style={{
                  borderColor: has ? "rgba(245,158,11,0.45)" : "rgba(124,141,176,0.25)",
                  background: has ? "rgba(245,158,11,0.08)" : "rgba(15,23,42,0.6)",
                  opacity: has ? 1 : 0.55,
                }}
              >
                <div className="text-2xl" aria-hidden="true">
                  {has ? item.icon : "▦"}
                </div>
                <div
                  className={`${mono} mt-1.5 text-[9px] font-bold leading-tight tracking-[0.12em]`}
                  style={{ color: has ? PALETTE.accentBright : "#7c8db0" }}
                >
                  {has ? item.name : "???"}
                </div>
                {has && (
                  <div className="mt-1 text-[10px] leading-snug" style={{ color: "#9fb0cc" }}>
                    {item.desc}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className={`${mono} mt-4 text-[10px] leading-relaxed`} style={{ color: "#7c8db0" }}>
          Kartu akses dari teka-teki pintu · datapad LOG OPERATOR tersebar di 8 zona · tape emas di
          VAULT.
        </div>
        <button
          onClick={() => setModal(null)}
          className={`${mono} mt-3 w-full rounded-md border px-4 py-2 text-[11px] uppercase tracking-[0.18em]`}
          style={{
            borderColor: "rgba(124,141,176,0.4)",
            color: "#e2e8f0",
          }}
        >
          tutup — [I]
        </button>
      </div>
    </div>
  );
}
