import { Html } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useEffect, useRef, useState } from "react";
import type * as THREE from "three";
import { PALETTE } from "../types";
import { SERVICE_RACKS } from "./layout";
import { useNearby } from "./useNearby";

/**
 * ServiceRacks — the CORE "digital twin" bank: one physical rack per real
 * service on this machine, LED + screen driven by GET /api/room/services
 * (room-server.ts, id + boolean whitelist only). A service that comes back
 * from the dead plays a short POST boot sequence before its LEDs settle.
 * The endpoint only exists on the production host; anywhere else the fetch
 * fails silently and every rack shows the neutral NO LINK state.
 */

const POLL_MS = 8_000;
const POST_MS = 4_200;
const FAULT_RED = "#f87171"; // red-400, same fault tone as the night-shift UI

const mono = "var(--font-op-mono, monospace)";

type UpMap = Record<string, boolean | null>;

interface TwinPayload {
  services?: { id?: unknown; up?: unknown }[];
  alert?: unknown;
}

export function ServiceRacks({ reduced }: { reduced: boolean }) {
  const [up, setUp] = useState<UpMap>({});
  const [alert, setAlert] = useState(false);
  // Labels are the DOM-heavy part; LEDs/meshes stay visible from anywhere.
  const labelsNear = useNearby(19.3, -13.85, 18);
  // POST deadlines per service id — state (not a ref) so panels re-render.
  const [postMap, setPostMap] = useState<Record<string, number>>({});
  const prevUp = useRef<UpMap>({});
  const stripMats = useRef<(THREE.MeshBasicMaterial | null)[]>([]);
  const faultMats = useRef<(THREE.MeshBasicMaterial | null)[]>([]);
  const alarm = useRef<THREE.PointLight>(null);

  useEffect(() => {
    let alive = true;
    const timers: ReturnType<typeof setTimeout>[] = [];

    const load = async () => {
      try {
        const res = await fetch("/api/room/services");
        if (!res.ok) return;
        const data = (await res.json()) as TwinPayload;
        if (!alive || !Array.isArray(data.services)) return;
        const next: UpMap = {};
        for (const s of data.services) {
          if (typeof s.id === "string") next[s.id] = Boolean(s.up);
        }
        // Only a witnessed down→up transition boots; first paint settles quietly.
        const nowMs = Date.now();
        const boots = Object.entries(next)
          .filter(([id, isUp]) => isUp && prevUp.current[id] === false)
          .map(([id]) => id);
        prevUp.current = next;
        setUp(next);
        setAlert(Boolean(data.alert));
        if (boots.length > 0) {
          setPostMap((p) => {
            const n = { ...p };
            for (const id of boots) n[id] = nowMs + POST_MS;
            return n;
          });
          // Shallow-copy tick so panels drop the POST face once it expires.
          timers.push(setTimeout(() => alive && setPostMap((p) => ({ ...p })), POST_MS + 60));
        }
      } catch {
        /* dev host / network blip — keep last known state */
      }
    };

    load();
    if (reduced) {
      return () => {
        alive = false;
        timers.forEach(clearTimeout);
      };
    }
    const id = setInterval(load, POLL_MS);
    return () => {
      alive = false;
      clearInterval(id);
      timers.forEach(clearTimeout);
    };
  }, [reduced]);

  useFrame(({ clock }) => {
    if (reduced) return;
    const t = clock.elapsedTime;
    const now = Date.now();
    SERVICE_RACKS.forEach((s, i) => {
      const strip = stripMats.current[i];
      const fault = faultMats.current[i];
      const state = up[s.id] ?? null;
      const posting = (postMap[s.id] ?? 0) > now;
      if (strip) {
        if (posting) {
          // POST: fast bright flicker while the machine "reboots".
          strip.color.set(Math.sin(t * 26 + i) > -0.2 ? PALETTE.accentBright : PALETTE.metal);
        } else if (state === true) {
          // Alive: slow amber breathing, per-rack phase so the bank shimmers.
          const b = 0.55 + 0.45 * Math.sin(t * 2.1 + i * 1.7);
          strip.color.set(b > 0.72 ? PALETTE.accentBright : PALETTE.accent);
        } else {
          strip.color.set(PALETTE.metal); // dead or unknown: strip dark
        }
      }
      if (fault) {
        const blink = state === false && Math.sin(t * 4 + i) > 0;
        fault.color.set(blink ? FAULT_RED : PALETTE.metal);
      }
    });
    if (alarm.current) {
      // Low-memory alarm: the whole CORE ceiling throbs amber-red.
      alarm.current.intensity = alert ? 5 + 4 * Math.sin(t * 5.2) : 0;
    }
  });

  const now = Date.now();

  return (
    <group>
      {SERVICE_RACKS.map((s, i) => {
        const state = up[s.id] ?? null;
        const posting = (postMap[s.id] ?? 0) > now;
        const statusColor = posting
          ? PALETTE.secondary
          : state === true
            ? PALETTE.accentBright
            : state === false
              ? FAULT_RED
              : PALETTE.slate;
        const statusText = posting
          ? "⟳ POST · BOOTING"
          : state === true
            ? "● ONLINE"
            : state === false
              ? "✕ OFFLINE"
              : "… NO LINK";
        return (
          <group key={s.id} position={[s.x, 0, s.z]} rotation-y={Math.PI}>
            {/* Cabinet body against the CORE north wall. */}
            <mesh position={[0, 1.5, -0.15]}>
              <boxGeometry args={[1.05, 3, 0.7]} />
              <meshStandardMaterial color={PALETTE.metal} metalness={0.85} roughness={0.3} />
            </mesh>
            {/* Status LED strip along the left front edge. */}
            <mesh position={[-0.44, 1.5, 0.21]}>
              <boxGeometry args={[0.05, 2.6, 0.02]} />
              <meshBasicMaterial
                ref={(m) => {
                  stripMats.current[i] = m;
                }}
                color={
                  // Static fallback for reduced mode; useFrame overrides live.
                  state === true ? PALETTE.accent : PALETTE.metal
                }
                toneMapped={false}
              />
            </mesh>
            {/* Fault LED — blinks red only when the real service is down. */}
            <mesh position={[0.4, 2.9, 0.21]}>
              <boxGeometry args={[0.08, 0.08, 0.02]} />
              <meshBasicMaterial
                ref={(m) => {
                  faultMats.current[i] = m;
                }}
                color={state === false ? FAULT_RED : PALETTE.metal}
                toneMapped={false}
              />
            </mesh>
            {/* Nameplate + live status readout. */}
            {labelsNear && (
              <Html
                transform
                position={[0.02, 1.95, 0.22]}
                distanceFactor={1.6}
                style={{ pointerEvents: "none", userSelect: "none" }}
              >
                <div
                  style={{
                    width: 168,
                    boxSizing: "border-box",
                    padding: "9px 10px",
                    background: PALETTE.bg,
                    border: `1px solid ${statusColor}55`,
                    borderRadius: 4,
                    fontFamily: mono,
                    textAlign: "left",
                  }}
                >
                  <div style={{ fontSize: 9, letterSpacing: "0.2em", color: PALETTE.slate }}>
                    UNIT {String(i + 1).padStart(2, "0")} · LIVE
                  </div>
                  <div
                    style={{
                      marginTop: 6,
                      fontSize: 12,
                      fontWeight: 700,
                      letterSpacing: "0.06em",
                      color: "#e2e8f0",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                    }}
                  >
                    {s.label}
                  </div>
                  <div
                    style={{
                      marginTop: 7,
                      fontSize: 12,
                      fontWeight: 700,
                      letterSpacing: "0.1em",
                      color: statusColor,
                    }}
                  >
                    {statusText}
                  </div>
                  {posting && (
                    <div style={{ marginTop: 5, fontSize: 8.5, color: PALETTE.secondary }}>
                      mem ok · net ok · svc start
                    </div>
                  )}
                  {s.id === "portfolio" && !posting && (
                    <div style={{ marginTop: 5, fontSize: 8.5, color: PALETTE.slate }}>
                      ← unit ini melayani halamanmu
                    </div>
                  )}
                </div>
              </Html>
            )}
          </group>
        );
      })}

      {/* Low-memory alarm beacon over the rack bank (silent when healthy). */}
      <pointLight
        ref={alarm}
        position={[19.3, 3.8, -15.5]}
        intensity={reduced && alert ? 4 : 0}
        color={FAULT_RED}
        distance={12}
        decay={1.8}
      />
    </group>
  );
}
