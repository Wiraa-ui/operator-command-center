import { Html } from "@react-three/drei";
import { useEffect, useState } from "react";

import { getRoomStatus, type RoomStatus } from "@/lib/api/roomStatus";
import { PALETTE, SIDE_X, type Station } from "./types";

// STATUS rack: metal cabinet + amber LED strip + terminal-look Html screen
// showing live telemetry from getRoomStatus (whitelisted fields only, see
// serverroom/CONTRACT.md §Security). No useFrame — nothing animates here,
// so reduced-motion compliance is structural; `reduced` only disables the
// 10s polling (single fetch instead).

const POLL_MS = 10_000;

const NULL_STATUS: RoomStatus = {
  uptimeSec: null,
  memUsedMb: null,
  memTotalMb: null,
  load1: null,
};

/** Yaw so the local +z front face points into the aisle (x=0). */
const YAW = { left: Math.PI / 2, right: -Math.PI / 2, center: 0 } as const;

// drei Html transform mode: world size = px * distanceFactor / 400.
// 250px panel * 1.7 / 400 ≈ 1.06 world units — fits the 1.2-wide cabinet.
const SCREEN_PX = 250;
const DISTANCE_FACTOR = 1.7;

function formatUptime(sec: number | null): string {
  if (sec === null) return "—";
  const d = Math.floor(sec / 86_400);
  const h = Math.floor((sec % 86_400) / 3_600);
  const m = Math.floor((sec % 3_600) / 60);
  return `${d}d ${h}h ${m}m`;
}

function formatRam(used: number | null, total: number | null): string {
  if (used === null || total === null) return "—";
  return `${used} / ${total} MB`;
}

const mono = '"JetBrains Mono", ui-monospace, monospace';

const rowStyle: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  gap: 8,
  marginTop: 6,
};

const labelStyle: React.CSSProperties = { color: PALETTE.slate };

export function StatusRack({ station, reduced }: { station: Station; reduced: boolean }) {
  const [status, setStatus] = useState<RoomStatus>(NULL_STATUS);

  useEffect(() => {
    let alive = true;
    const poll = () => {
      getRoomStatus().then(
        (s) => {
          if (alive) setStatus(s);
        },
        () => {
          // Network hiccup: keep last known values; the fn itself never throws
          // telemetry errors (null fields by contract).
        },
      );
    };
    poll();
    if (reduced) {
      // Reduced mode: single fetch, no interval.
      return () => {
        alive = false;
      };
    }
    const id = setInterval(poll, POLL_MS);
    return () => {
      alive = false;
      clearInterval(id);
    };
  }, [reduced]);

  const ramPct =
    status.memUsedMb !== null && status.memTotalMb !== null && status.memTotalMb > 0
      ? Math.min(100, Math.max(0, (status.memUsedMb / status.memTotalMb) * 100))
      : 0;

  return (
    <group position={[SIDE_X[station.side], 0, station.z]} rotation-y={YAW[station.side]}>
      {/* Cabinet body */}
      <mesh position={[0, 1.5, 0]}>
        <boxGeometry args={[1.2, 3, 0.9]} />
        <meshStandardMaterial color={PALETTE.metal} metalness={0.7} roughness={0.35} />
      </mesh>

      {/* Amber warning-LED strip along the front-right edge (self-lit, static) */}
      <mesh position={[0.5, 1.5, 0.455]}>
        <boxGeometry args={[0.04, 2.6, 0.02]} />
        <meshBasicMaterial color={PALETTE.accentBright} toneMapped={false} />
      </mesh>

      {/* Terminal screen — plain DOM panel, no interaction, no motion */}
      <Html
        transform
        position={[-0.04, 1.95, 0.47]}
        distanceFactor={DISTANCE_FACTOR}
        style={{ pointerEvents: "none", userSelect: "none" }}
      >
        <div
          style={{
            width: SCREEN_PX,
            boxSizing: "border-box",
            padding: "10px 12px",
            background: PALETTE.bg,
            border: `1px solid ${PALETTE.accent}55`,
            borderRadius: 4,
            color: PALETTE.accent,
            fontFamily: mono,
            fontSize: 11,
            lineHeight: 1.4,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              paddingBottom: 6,
              borderBottom: `1px solid ${PALETTE.metal}`,
              color: PALETTE.accentBright,
              fontSize: 10,
              letterSpacing: "0.06em",
            }}
          >
            <span
              style={{
                width: 6,
                height: 6,
                borderRadius: "50%",
                background: PALETTE.accentBright,
                flex: "0 0 auto",
              }}
            />
            LIVE — this site runs on this machine
          </div>

          <div style={rowStyle}>
            <span style={labelStyle}>UPTIME</span>
            <span>{formatUptime(status.uptimeSec)}</span>
          </div>

          <div style={rowStyle}>
            <span style={labelStyle}>RAM</span>
            <span>{formatRam(status.memUsedMb, status.memTotalMb)}</span>
          </div>
          <div
            style={{
              marginTop: 4,
              height: 5,
              background: PALETTE.metal,
              borderRadius: 2,
              overflow: "hidden",
            }}
          >
            <div
              style={{
                width: `${ramPct}%`,
                height: "100%",
                background: PALETTE.accent,
              }}
            />
          </div>

          <div style={rowStyle}>
            <span style={labelStyle}>LOAD 1M</span>
            <span>{status.load1 === null ? "—" : status.load1.toFixed(2)}</span>
          </div>
        </div>
      </Html>
    </group>
  );
}
