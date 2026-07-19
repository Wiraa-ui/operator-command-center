import { lazy, Suspense, useEffect, useMemo, useState } from "react";
import { getStations } from "./stations";
import { RoomHUD } from "./Hud";
import { roomAudio } from "./explore/audio";
import { buildExploreMap } from "./explore/layout";
import { addAchievement, beginSession, fxBus, resetPlayer, useExplore } from "./explore/store";

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
// Explore-only DOM (HUD, minimap, every modal, the shell + story text) stays
// out of the first-paint bundle; it loads when EXPLORE actually starts.
const ExploreHud = lazy(() =>
  import("./explore/ExploreHud").then((m) => ({ default: m.ExploreHud })),
);
const Minimap = lazy(() => import("./explore/Minimap").then((m) => ({ default: m.Minimap })));

/** vh of scroll per station — enough dwell to read each rack on the walk. */
const VH_PER_STATION = 85;

/** ↑↑↓↓←→←→BA — every LED in the room raves for a couple of seconds. */
const KONAMI = [
  "ArrowUp",
  "ArrowUp",
  "ArrowDown",
  "ArrowDown",
  "ArrowLeft",
  "ArrowRight",
  "ArrowLeft",
  "ArrowRight",
  "KeyB",
  "KeyA",
];

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

  // LITE preset renders at DPR 1 — on weak phones the GPU cost scales with
  // physical pixels, and this is the single biggest lag lever we have.
  const graphics = useExplore((s) => s.settings.graphics);

  // Konami easter egg — listens in both walk and explore modes; the LED
  // strobe itself is drawn by World.tsx reading fxBus per frame.
  useEffect(() => {
    let idx = 0;
    const onKey = (e: KeyboardEvent) => {
      idx = e.code === KONAMI[idx] ? idx + 1 : e.code === KONAMI[0] ? 1 : 0;
      if (idx === KONAMI.length) {
        idx = 0;
        fxBus.raveUntil = Date.now() + 2600;
        addAchievement("OLD SCHOOL — kode Konami masih dihafal");
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

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
            capDpr={graphics === "lite" ? 1 : mode === "explore" && isTouch ? 1.5 : 2}
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
        <Suspense fallback={null}>
          <ExploreHud map={map} onExit={() => setMode("walk")} />
          <Minimap map={map} />
        </Suspense>
      )}
    </>
  );
}
