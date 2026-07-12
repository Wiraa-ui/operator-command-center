import { useActiveStation } from "./CameraRig";
import { PALETTE, type Station } from "./types";

/**
 * RoomHUD — DOM overlay for The Server Room: current-station readout,
 * quick-jump dots, and an escape hatch to the classic page. Lives outside
 * the Canvas so screen readers and keyboards get real controls.
 */

/** Scroll position (px) that parks the camera at station i. */
function scrollTopFor(stations: Station[], index: number): number {
  const max = Math.max(document.documentElement.scrollHeight - window.innerHeight, 1);
  // Camera z runs +4 → deepest−4 linearly with progress (CameraRig contract).
  const start = 4;
  const end = Math.min(0, ...stations.map((s) => s.z)) - 4;
  const p = (start - stations[index].z) / (start - end);
  return Math.min(Math.max(p, 0), 1) * max;
}

export function RoomHUD({ stations, onExit }: { stations: Station[]; onExit: () => void }) {
  const active = useActiveStation(stations);
  const idx = Math.max(
    stations.findIndex((s) => s.id === active?.id),
    0,
  );

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-20 flex items-end justify-between gap-4 p-4 sm:p-6">
      {/* Station readout + jump dots */}
      <div className="pointer-events-auto">
        <p className="font-op-mono text-[11px] uppercase tracking-[0.22em] text-op-text-3">
          rack {String(idx + 1).padStart(2, "0")} / {String(stations.length).padStart(2, "0")}
        </p>
        <p className="mt-1 font-op-mono text-[13px]" style={{ color: PALETTE.accentBright }}>
          {active?.title ?? stations[0].title}
        </p>
        <div
          className="mt-2 flex items-center gap-2"
          role="tablist"
          aria-label="Server room sections"
        >
          {stations.map((s, i) => (
            <button
              key={s.id}
              role="tab"
              aria-selected={i === idx}
              aria-label={s.title}
              onClick={() =>
                window.scrollTo({ top: scrollTopFor(stations, i), behavior: "smooth" })
              }
              className="h-3 w-3 cursor-pointer rounded-full border transition-colors"
              style={{
                borderColor: PALETTE.accent,
                background: i === idx ? PALETTE.accent : "transparent",
              }}
            />
          ))}
        </div>
      </div>

      {/* Escape hatch — the pattern requires an exit for impatient users */}
      <button
        onClick={onExit}
        className="pointer-events-auto rounded-full border border-op-line bg-op-surface/70 px-4 py-2 font-op-mono text-[11px] uppercase tracking-[0.18em] text-op-text-2 backdrop-blur-md transition-colors hover:text-op-accent"
      >
        classic view
      </button>
    </div>
  );
}
