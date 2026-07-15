import { useEffect, useRef } from "react";
import { PALETTE } from "../types";
import type { ExploreMap } from "./layout";
import { getExploreState, player } from "./store";

/**
 * Minimap — top-down blueprint, amber on glass, with zone fog-of-war:
 * a zone's walls/doors only appear once the player has stepped into it
 * (AISLE-A is always known). Drawn straight from the same layout rects that
 * drive collision, so it can never drift from the real map. rAF-driven and
 * store-free on the hot path (reads the mutable player singleton).
 */

const MAP_W = 148;

export function Minimap({ map }: { map: ExploreMap }) {
  const canvas = useRef<HTMLCanvasElement>(null);

  const b = map.bounds;
  const worldW = b.xMax - b.xMin;
  const worldD = b.zMax - b.zMin;
  const mapH = Math.round((MAP_W * worldD) / worldW);

  useEffect(() => {
    const el = canvas.current;
    if (!el) return;
    const ctx = el.getContext("2d");
    if (!ctx) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    el.width = MAP_W * dpr;
    el.height = mapH * dpr;
    ctx.scale(dpr, dpr);

    const sx = MAP_W / worldW;
    const sz = mapH / worldD;
    const X = (wx: number) => (wx - b.xMin) * sx;
    const Z = (wz: number) => (b.zMax - wz) * sz; // deeper z = lower on map

    let raf = 0;
    const draw = () => {
      const s = getExploreState();
      const known = new Set(["aisle", ...s.visited]);

      ctx.clearRect(0, 0, MAP_W, mapH);
      ctx.fillStyle = "rgba(15, 23, 42, 0.55)";
      ctx.fillRect(0, 0, MAP_W, mapH);

      // Known zone floors
      for (const zone of map.zones) {
        if (!known.has(zone.id)) continue;
        const r = zone.rect;
        ctx.fillStyle = "rgba(56, 189, 248, 0.07)";
        ctx.fillRect(X(r.xMin), Z(r.zMax), (r.xMax - r.xMin) * sx, (r.zMax - r.zMin) * sz);
      }

      // Walls of known zones (a wall is shown if it touches a known zone)
      ctx.fillStyle = "rgba(245, 158, 11, 0.55)";
      for (const w of map.walls) {
        const touchesKnown = map.zones.some(
          (zone) =>
            known.has(zone.id) &&
            w.xMin < zone.rect.xMax + 1 &&
            w.xMax > zone.rect.xMin - 1 &&
            w.zMin < zone.rect.zMax + 1 &&
            w.zMax > zone.rect.zMin - 1,
        );
        if (!touchesKnown) continue;
        ctx.fillRect(
          X(w.xMin),
          Z(w.zMax),
          Math.max((w.xMax - w.xMin) * sx, 1.2),
          Math.max((w.zMax - w.zMin) * sz, 1.2),
        );
      }

      // Doors: amber = locked, sky = open (always shown once their zone edge is known)
      for (const d of map.doors) {
        const open = s.unlocked.includes(d.id);
        ctx.fillStyle = open ? PALETTE.secondary : PALETTE.accentBright;
        const r = d.rect;
        ctx.fillRect(
          X(r.xMin),
          Z(r.zMax),
          Math.max((r.xMax - r.xMin) * sx, 2),
          Math.max((r.zMax - r.zMin) * sz, 2),
        );
      }

      // Player arrow
      const px = X(player.x);
      const pz = Z(player.z);
      ctx.save();
      ctx.translate(px, pz);
      ctx.rotate(player.yaw); // map z is flipped, so world yaw maps directly
      ctx.fillStyle = "#f8fafc";
      ctx.beginPath();
      ctx.moveTo(0, -5);
      ctx.lineTo(3.6, 4);
      ctx.lineTo(-3.6, 4);
      ctx.closePath();
      ctx.fill();
      ctx.restore();

      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, [map, b.xMin, b.zMax, worldW, worldD, mapH]);

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed right-4 top-16 z-30 overflow-hidden rounded-lg border"
      style={{
        borderColor: "rgba(245,158,11,0.4)",
        background: "rgba(15,23,42,0.6)",
        backdropFilter: "blur(6px)",
      }}
    >
      <div
        className="px-2 pt-1 font-op-mono text-[9px] uppercase tracking-[0.22em]"
        style={{ color: PALETTE.accentBright }}
      >
        // floor plan
      </div>
      <canvas ref={canvas} style={{ width: MAP_W, height: mapH, display: "block" }} />
    </div>
  );
}
