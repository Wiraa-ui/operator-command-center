import { Html } from "@react-three/drei";
import { useEffect, useState } from "react";
import { PALETTE } from "../types";

/**
 * WitaClock — wall clock above the CORE twin rack bank, ticking in the
 * server's real timezone (WITA / Asia/Makassar). Between 00:00 and 03:00
 * WITA the room enters "jam hantu": ExploreWorld dims and flickers the
 * house lights as a daytime leak of the hidden night shift. `?witch=1`
 * forces that window for testing/demos — it is a cosmetic easter egg only.
 */

const WITA_TIME = new Intl.DateTimeFormat("id-ID", {
  timeZone: "Asia/Makassar",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hour12: false,
});

const WITA_HOUR = new Intl.DateTimeFormat("en-US", {
  timeZone: "Asia/Makassar",
  hour: "numeric",
  hour12: false,
});

export function witaHour(d = new Date()): number {
  return Number(WITA_HOUR.format(d)) % 24;
}

/** 00:00–02:59 WITA — the dead hours before the night shift. */
export function isWitchingHour(d = new Date()): boolean {
  return witaHour(d) < 3;
}

export const FORCE_WITCH =
  typeof window !== "undefined" && new URLSearchParams(window.location.search).has("witch");

const mono = "var(--font-op-mono, monospace)";

export function WitaClock({ witching }: { witching: boolean }) {
  const [time, setTime] = useState(() => WITA_TIME.format(new Date()));

  useEffect(() => {
    const id = setInterval(() => setTime(WITA_TIME.format(new Date())), 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <group position={[19.34, 0, -13.75]} rotation-y={Math.PI}>
      <Html
        transform
        position={[0, 3.45, 0.12]}
        distanceFactor={2.2}
        style={{ pointerEvents: "none", userSelect: "none" }}
      >
        <div
          style={{
            width: 190,
            boxSizing: "border-box",
            padding: "8px 12px",
            background: PALETTE.bg,
            border: `1px solid ${witching ? "#f87171" : PALETTE.accent}66`,
            borderRadius: 6,
            fontFamily: mono,
            textAlign: "center",
          }}
        >
          <div style={{ fontSize: 9, letterSpacing: "0.22em", color: PALETTE.slate }}>
            // WAKTU SERVER · WITA
          </div>
          <div
            style={{
              marginTop: 4,
              fontSize: 26,
              fontWeight: 700,
              letterSpacing: "0.08em",
              color: witching ? "#f87171" : PALETTE.accentBright,
            }}
          >
            {time}
          </div>
          <div
            style={{
              marginTop: 3,
              fontSize: 9,
              letterSpacing: "0.14em",
              color: witching ? "#f87171" : PALETTE.slate,
            }}
          >
            {witching ? "JAM HANTU · 00–03" : "Bali, Indonesia · GMT+8"}
          </div>
        </div>
      </Html>
    </group>
  );
}
