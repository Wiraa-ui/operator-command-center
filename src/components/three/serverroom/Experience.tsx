import { lazy, Suspense, useMemo } from "react";
import { getStations } from "./stations";
import { RoomHUD } from "./Hud";

/**
 * ServerRoomExperience — the homepage in room mode: a fixed full-screen
 * Canvas (lazy, so three.js never blocks first paint), a tall scroll driver
 * that gives the camera its walking distance, and the DOM HUD. Mounted once
 * the client confirms WebGL (see routes/index.tsx); `reduced` puts the room
 * in calm mode — scroll-mapped camera only, no autonomous animation.
 */
const RoomCanvas = lazy(() => import("./RoomCanvas"));

/** vh of scroll per station — enough dwell to read each rack on the walk. */
const VH_PER_STATION = 85;

export function ServerRoomExperience({
  reduced,
  onExit,
}: {
  reduced: boolean;
  onExit: () => void;
}) {
  const stations = useMemo(() => getStations(), []);

  return (
    <>
      <div className="fixed inset-0 z-0" aria-hidden="true">
        <Suspense fallback={null}>
          <RoomCanvas stations={stations} reduced={reduced} />
        </Suspense>
      </div>
      {/* Scroll driver: page height = corridor length for the camera dolly. */}
      <div style={{ height: `${stations.length * VH_PER_STATION}vh` }} aria-hidden="true" />
      <RoomHUD stations={stations} onExit={onExit} />
    </>
  );
}
