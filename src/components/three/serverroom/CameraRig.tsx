import { useEffect, useMemo, useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { RACK_SPACING, SIDE_X, type Station } from "./types";

/**
 * RoomCameraRig — the corridor dolly for The Server Room.
 *
 * Page scroll (0→1) maps camera z from START_Z down to (deepest station z −
 * END_MARGIN) at eye height, scrubbed through a dt-based lag-lerp so the walk
 * feels cinematic (~1s settle) rather than glued to the scrollbar — same
 * pattern as the legacy Scene.tsx rig. Near a station the camera sways
 * slightly toward the rack side (max ±0.7 on x) and the look target drifts
 * toward the rack; between stations it looks straight down the aisle. A small
 * pointer parallax (x ±0.3, y ±0.15) keeps idle frames alive.
 *
 * reduced=true → camera parked at the corridor entrance, no per-frame motion.
 */

const EYE_Y = 1.7; // walking eye height (CONTRACT §Geometri)
const START_Z = 4; // corridor entrance, in front of station z=0
const END_MARGIN = 4; // stop this far past the deepest rack
const LOOK_AHEAD = 6; // how far down the aisle the default look target sits
const SWAY_X_MAX = 0.7; // max camera lean toward the active rack side
const LOOK_SWAY_X = 0.9; // max look-target drift toward the active rack
const PARALLAX_X = 0.3;
const PARALLAX_Y = 0.15;
const SETTLE_RATE = 3.2; // lag-lerp dt multiplier → ~1s settle (matches Scene.tsx)
/** Sway/look influence fades to zero halfway to the neighbouring station. */
const SWAY_RANGE = RACK_SPACING * 0.5;

/** 0 at top of the document → 1 at the very bottom (pattern from Scene.tsx). */
function pageProgress(): number {
  const doc = document.documentElement;
  const max = Math.max(doc.scrollHeight - window.innerHeight, 1);
  return Math.min(window.scrollY / max, 1);
}

/** z the dolly parks at when progress hits 1: deepest rack minus END_MARGIN. */
function corridorEndZ(stations: Station[]): number {
  let deepest = 0;
  for (const s of stations) deepest = Math.min(deepest, s.z);
  return deepest - END_MARGIN;
}

/** Linear progress→z mapping along the corridor axis. */
function progressToZ(stations: Station[], p: number): number {
  return THREE.MathUtils.lerp(START_Z, corridorEndZ(stations), p);
}

/** Station whose rack z is closest to the given camera z (null if none). */
function nearestStation(stations: Station[], camZ: number): Station | null {
  let best: Station | null = null;
  let bestDist = Infinity;
  for (const s of stations) {
    const d = Math.abs(s.z - camZ);
    if (d < bestDist) {
      bestDist = d;
      best = s;
    }
  }
  return best;
}

/** 1 when the camera is at the station, smoothstepped to 0 at SWAY_RANGE. */
function proximityWeight(station: Station, camZ: number): number {
  const t = 1 - Math.min(Math.abs(station.z - camZ) / SWAY_RANGE, 1);
  return t * t * (3 - 2 * t);
}

export function RoomCameraRig({ stations, reduced }: { stations: Station[]; reduced: boolean }) {
  const sp = useRef(0); // smoothed scroll progress
  const look = useMemo(() => new THREE.Vector3(), []);

  useFrame(({ camera, pointer }, dt) => {
    if (reduced) {
      // Static opening frame at the entrance; no animation work.
      camera.position.set(0, EYE_Y, START_Z);
      look.set(0, EYE_Y, START_Z - LOOK_AHEAD);
      camera.lookAt(look);
      return;
    }

    // Lag-lerp scrub: frame-rate independent, ~cinematic 1s settle.
    sp.current = THREE.MathUtils.lerp(sp.current, pageProgress(), Math.min(dt * SETTLE_RATE, 1));
    const camZ = progressToZ(stations, sp.current);

    // Sway toward the active rack; both fade out between stations, so the
    // camera returns to the aisle centerline looking straight ahead.
    let swayX = 0;
    let lookX = 0;
    const active = nearestStation(stations, camZ);
    if (active) {
      const w = proximityWeight(active, camZ);
      const sideSign = Math.sign(SIDE_X[active.side]); // 0 for center stations
      swayX = sideSign * SWAY_X_MAX * w;
      lookX = sideSign * LOOK_SWAY_X * w;
    }

    camera.position.set(swayX + pointer.x * PARALLAX_X, EYE_Y + pointer.y * PARALLAX_Y, camZ);
    look.set(lookX, EYE_Y, camZ - LOOK_AHEAD);
    camera.lookAt(look);
  });

  return null;
}

/**
 * useActiveStation — nearest station to the scroll-derived camera z, for DOM
 * HUD use outside the Canvas. Deliberately R3F-free (no useFrame/useThree):
 * a passive scroll/resize listener throttled to one rAF per burst. SSR-safe —
 * window is only touched inside the effect. Tracks raw (unsmoothed) scroll
 * progress; the rig's lag-lerp trails it by well under a station spacing.
 */
export function useActiveStation(stations: Station[]): Station | null {
  const [active, setActive] = useState<Station | null>(stations[0] ?? null);

  useEffect(() => {
    if (typeof window === "undefined" || stations.length === 0) return;
    let raf = 0;

    const update = () => {
      raf = 0;
      const next = nearestStation(stations, progressToZ(stations, pageProgress()));
      // Keep the previous object identity when the station hasn't changed.
      setActive((prev) => (next && prev?.id === next.id ? prev : next));
    };
    const onScroll = () => {
      if (!raf) raf = window.requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) window.cancelAnimationFrame(raf);
    };
  }, [stations]);

  return active;
}
