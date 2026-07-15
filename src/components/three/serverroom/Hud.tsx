import { useEffect, useState } from "react";
import { corridorEndZ, useActiveStation } from "./CameraRig";
import { PALETTE, type Station } from "./types";

/**
 * RoomHUD — DOM overlay for The Server Room: current-station readout,
 * quick-jump dots, and an escape hatch to the classic page. Lives outside
 * the Canvas so screen readers and keyboards get real controls.
 */

/** Scroll position (px) that parks the camera at station i. */
function scrollTopFor(stations: Station[], index: number): number {
  const max = Math.max(document.documentElement.scrollHeight - window.innerHeight, 1);
  // Camera z runs +4 → corridorEndZ linearly with progress (CameraRig contract).
  const start = 4;
  const end = corridorEndZ(stations);
  const p = (start - stations[index].z) / (start - end);
  return Math.min(Math.max(p, 0), 1) * max;
}

export function RoomHUD({
  stations,
  onExit,
  onExplore,
}: {
  stations: Station[];
  onExit: () => void;
  onExplore: () => void;
}) {
  const active = useActiveStation(stations);
  const idx = Math.max(
    stations.findIndex((s) => s.id === active?.id),
    0,
  );

  // The HUD floats above the page footer at the end of the walk; yield to it
  // so its links stay readable and clickable.
  const [footerVisible, setFooterVisible] = useState(false);
  useEffect(() => {
    const footer = document.querySelector("footer");
    if (!footer) return;
    const io = new IntersectionObserver(([e]) => setFooterVisible(e.isIntersecting));
    io.observe(footer);
    return () => io.disconnect();
  }, []);

  const interactive = footerVisible ? "pointer-events-none" : "pointer-events-auto";

  return (
    <div
      className={`pointer-events-none fixed inset-x-0 bottom-0 z-20 flex items-end justify-between gap-3 p-4 transition-opacity duration-300 sm:p-6 ${footerVisible ? "opacity-0" : "opacity-100"}`}
    >
      {/* Station readout + jump dots */}
      <div className={`${interactive} min-w-0 max-w-[48vw] sm:max-w-none`}>
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

      {/* Mode switches: dive into the game, or bail to the classic page.
          Right margin clears the fixed chat launcher (52px + 20px offset);
          on phones the pair stacks so neither label wraps. */}
      <div
        className={`${interactive} mr-14 flex flex-col items-end gap-2 sm:mr-16 sm:flex-row sm:items-center`}
      >
        <button
          onClick={onExplore}
          className="whitespace-nowrap rounded-full border px-4 py-2 font-op-mono text-[11px] font-bold uppercase tracking-[0.18em] backdrop-blur-md transition-transform hover:scale-105"
          style={{
            borderColor: PALETTE.accentBright,
            background: "rgba(245,158,11,0.18)",
            color: PALETTE.accentBright,
          }}
        >
          ▶ explore<span className="hidden sm:inline"> — root access</span>
        </button>
        <button
          onClick={onExit}
          className="whitespace-nowrap rounded-full border border-op-line bg-op-surface/70 px-4 py-2 font-op-mono text-[11px] uppercase tracking-[0.18em] text-op-text-2 backdrop-blur-md transition-colors hover:text-op-accent"
        >
          classic view
        </button>
      </div>
    </div>
  );
}
