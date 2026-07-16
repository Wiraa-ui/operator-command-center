import { Html } from "@react-three/drei";
import { useEffect, useState } from "react";
import { PALETTE } from "../types";

/**
 * RecordBoard — the ROOT SPEEDRUN leaderboard on the CORE south wall.
 * Real times from real accounts (GET /api/room/speedrun, room.db); the
 * fastest five render on a hall-of-fame plaque every visitor can read.
 */

const POLL_MS = 30_000;
const SHOW = 5;

interface Run {
  name: string;
  ms: number;
}

const mono = "var(--font-op-mono, monospace)";

export function RecordBoard({ reduced }: { reduced: boolean }) {
  const [runs, setRuns] = useState<Run[]>([]);

  useEffect(() => {
    let alive = true;
    const load = async () => {
      try {
        const res = await fetch("/api/room/speedrun");
        if (!res.ok) return;
        const data = (await res.json()) as { runs?: Run[] };
        if (alive && Array.isArray(data.runs)) setRuns(data.runs.slice(0, SHOW));
      } catch {
        /* dev host / blip */
      }
    };
    load();
    if (reduced) {
      return () => {
        alive = false;
      };
    }
    const id = setInterval(load, POLL_MS);
    return () => {
      alive = false;
      clearInterval(id);
    };
  }, [reduced]);

  return (
    <group position={[13.6, 0, -23.55]}>
      <mesh position={[0, 1.9, -0.08]}>
        <boxGeometry args={[2.0, 1.7, 0.12]} />
        <meshStandardMaterial color={PALETTE.metal} metalness={0.8} roughness={0.35} />
      </mesh>
      <Html
        transform
        position={[0, 1.9, 0.02]}
        distanceFactor={2}
        style={{ pointerEvents: "none", userSelect: "none" }}
      >
        <div
          style={{
            width: 300,
            boxSizing: "border-box",
            padding: "12px 14px",
            background: PALETTE.bg,
            border: `1px solid ${PALETTE.accent}66`,
            borderRadius: 6,
            fontFamily: mono,
          }}
        >
          <div
            style={{
              fontSize: 10,
              letterSpacing: "0.24em",
              color: PALETTE.accentBright,
              fontWeight: 700,
            }}
          >
            ⏱ HALL OF OPERATORS
          </div>
          <div style={{ fontSize: 8.5, marginTop: 3, color: PALETTE.slate }}>
            ROOT SPEEDRUN — masuk EXPLORE → akses root · login untuk ikut
          </div>
          <div style={{ marginTop: 9 }}>
            {runs.length === 0 && (
              <div style={{ fontSize: 11, color: PALETTE.slate, padding: "12px 0" }}>
                belum ada rekor — jadilah operator pertama.
              </div>
            )}
            {runs.map((r, i) => (
              <div
                key={r.name}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: 12,
                  padding: "3px 0",
                  color: i === 0 ? PALETTE.accentBright : "#cbd5e1",
                  fontWeight: i === 0 ? 700 : 400,
                }}
              >
                <span>
                  #{i + 1} @{r.name}
                </span>
                <span>{(r.ms / 1000).toFixed(1)}s</span>
              </div>
            ))}
          </div>
        </div>
      </Html>
      <pointLight position={[0, 2.4, 1]} intensity={2.5} color={PALETTE.accent} distance={4} />
    </group>
  );
}
