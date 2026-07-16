import { useEffect, useRef, useState } from "react";
import { PALETTE } from "../types";
import type { ExploreMap } from "./layout";
import { ARSIP_RACKS, night } from "./nightshift/state";
import { peerState } from "./online";
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

      // SHIFT MALAM: remaining archives pulse amber; Kirana is a red-hot dot.
      if (s.night) {
        const t = performance.now() / 1000;
        for (const r of ARSIP_RACKS) {
          if (s.purged.includes(r.id)) continue;
          ctx.fillStyle = `rgba(251, 191, 36, ${0.55 + Math.sin(t * 4 + r.x + r.z) * 0.35})`;
          ctx.beginPath();
          ctx.arc(X(r.x), Z(r.z), 2.4, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.fillStyle = "rgba(248, 113, 113, 0.9)";
        ctx.beginPath();
        ctx.arc(X(night.kirana.x), Z(night.kirana.z), 3, 0, Math.PI * 2);
        ctx.fill();
      }

      // Other online visitors — sky dots.
      ctx.fillStyle = "rgba(56, 189, 248, 0.9)";
      for (const m of peerState.values()) {
        ctx.beginPath();
        ctx.arc(X(m.cx), Z(m.cz), 2.2, 0, Math.PI * 2);
        ctx.fill();
      }

      // Player arrow. Canvas mapping is (x→x, z→−y) — a mirror, not a
      // rotation — so forward (−sinψ,−cosψ) lands at canvas angle ψ+π.
      const px = X(player.x);
      const pz = Z(player.z);
      ctx.save();
      ctx.translate(px, pz);
      ctx.rotate(player.yaw + Math.PI);
      ctx.fillStyle = "#f8fafc";
      ctx.beginPath();
      ctx.moveTo(0, -5);
      ctx.lineTo(3.6, 4);
      ctx.lineTo(-3.6, 4);
      ctx.closePath();
      ctx.fill();
      ctx.restore();

      // Mata angin: U = +z (canvas up; walking that way moves the dot up).
      ctx.fillStyle = "rgba(56, 189, 248, 0.85)";
      ctx.font = "700 8px monospace";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("U", MAP_W / 2, 7);
      ctx.fillText("S", MAP_W / 2, mapH - 7);
      ctx.fillText("T", MAP_W - 6, mapH / 2);
      ctx.fillText("B", 6, mapH / 2);

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
        className="flex items-center justify-between px-2 pt-1 font-op-mono text-[9px] uppercase tracking-[0.22em]"
        style={{ color: PALETTE.accentBright }}
      >
        <span>// floor plan</span>
        <CompassReadout />
      </div>
      <canvas ref={canvas} style={{ width: MAP_W, height: mapH, display: "block" }} />
    </div>
  );
}

/** 8-wind heading (mata angin) from the player's yaw; U = world +z. */
const WINDS = ["U", "TL", "T", "TG", "S", "BD", "B", "BL"] as const;

export function headingDeg(yaw: number): number {
  const deg = (Math.atan2(-Math.sin(yaw), -Math.cos(yaw)) * 180) / Math.PI;
  return (Math.round(deg) + 360) % 360;
}

function CompassReadout() {
  const [deg, setDeg] = useState(() => headingDeg(player.yaw));
  useEffect(() => {
    const id = setInterval(() => setDeg(headingDeg(player.yaw)), 150);
    return () => clearInterval(id);
  }, []);
  const wind = WINDS[Math.round(deg / 45) % 8];
  return (
    <span style={{ color: PALETTE.secondary }}>
      {wind} {deg}°
    </span>
  );
}
