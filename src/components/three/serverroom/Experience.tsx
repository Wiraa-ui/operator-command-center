import { lazy, Suspense, useMemo } from "react";
import { getStations } from "./stations";
import { RoomHUD } from "./Hud";

/**
 * ServerRoomExperience — the homepage in room mode: a fixed full-screen
 * Canvas (lazy, so three.js never blocks first paint), a tall scroll driver
 * that gives the camera its walking distance, and the DOM HUD. Mounted only
 * after the client confirms WebGL + no reduced-motion (see routes/index.tsx),
 * so `reduced` is always false here — the prop plumbing stays for safety.
 */
const RoomCanvas = lazy(() => import("./RoomCanvas"));

/** vh of scroll per station — enough dwell to read each rack on the walk. */
const VH_PER_STATION = 85;

export function ServerRoomExperience({ onExit }: { onExit: () => void }) {
  const stations = useMemo(() => getStations(), []);

  return (
    <>
      <div className="fixed inset-0 z-0" aria-hidden="true">
        <Suspense fallback={null}>
          <RoomCanvas stations={stations} reduced={false} />
        </Suspense>
      </div>
      {/* Scroll driver: page height = corridor length for the camera dolly. */}
      <div style={{ height: `${stations.length * VH_PER_STATION}vh` }} aria-hidden="true" />
      <RoomHUD stations={stations} onExit={onExit} />
    </>
  );
}
