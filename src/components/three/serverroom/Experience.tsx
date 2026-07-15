import { lazy, Suspense, useEffect, useMemo, useState } from "react";
import { getStations } from "./stations";
import { RoomHUD } from "./Hud";
import { roomAudio } from "./explore/audio";
import { ExploreHud } from "./explore/ExploreHud";
import { buildExploreMap } from "./explore/layout";
import { Minimap } from "./explore/Minimap";
import { beginSession, resetPlayer } from "./explore/store";

/**
 * ServerRoomExperience — the homepage in room mode: a fixed full-screen
 * Canvas (lazy, so three.js never blocks first paint), a tall scroll driver
 * that gives the camera its walking distance, and the DOM HUD. Mounted once
 * the client confirms WebGL (see routes/index.tsx); `reduced` puts the room
 * in calm mode — scroll-mapped camera only, no autonomous animation.
 *
 * mode="explore" flips into ROOT ACCESS (first-person WASD/joystick game):
 * scroll driver + RoomHUD swap for ExploreHud + Minimap, page scroll locks,
 * and the procedural ambience starts on the first control gesture.
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
  const map = useMemo(() => buildExploreMap(stations), [stations]);
  const [mode, setMode] = useState<"walk" | "explore">("walk");
  const isTouch = useMemo(
    () => typeof window !== "undefined" && window.matchMedia("(pointer: coarse)").matches,
    [],
  );

  // Explore session lifecycle: reset the body, lock page scroll, stop audio on exit.
  useEffect(() => {
    if (mode !== "explore") return;
    resetPlayer();
    beginSession();
    const prevOverflow = document.documentElement.style.overflow;
    const prevScroll = window.scrollY;
    document.documentElement.style.overflow = "hidden";
    // Page chrome (footer, chat launcher) shows through the fixed canvas and
    // collides with the explore HUD on phones — hidden via styles.css rule.
    document.body.dataset.explore = "1";
    return () => {
      document.documentElement.style.overflow = prevOverflow;
      delete document.body.dataset.explore;
      window.scrollTo({ top: prevScroll });
      roomAudio.stop();
    };
  }, [mode]);

  return (
    <>
      <div className="fixed inset-0 z-0" aria-hidden="true">
        <Suspense fallback={null}>
          <RoomCanvas
            stations={stations}
            reduced={reduced}
            mode={mode}
            map={mode === "explore" ? map : null}
            capDpr={mode === "explore" && isTouch ? 1.5 : 2}
          />
        </Suspense>
      </div>

      {mode === "walk" ? (
        <>
          {/* Scroll driver: page height = corridor length for the camera dolly. */}
          <div style={{ height: `${stations.length * VH_PER_STATION}vh` }} aria-hidden="true" />
          <RoomHUD stations={stations} onExit={onExit} onExplore={() => setMode("explore")} />
        </>
      ) : (
        <>
          <ExploreHud map={map} onExit={() => setMode("walk")} />
          <Minimap map={map} />
        </>
      )}
    </>
  );
}
