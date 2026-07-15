import { useMemo, useRef } from "react";
import { Html } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { Panels } from "../Panels";
import { StatusRack } from "../StatusRack";
import { PALETTE, type Station } from "../types";
import { DoorGate } from "./DoorGate";
import { HumanoidFigure } from "./humanoid";
import { NightShift } from "./nightshift/NightShift";
import { OnlinePlayers } from "./OnlinePlayers";
import { NPCS, QUEST_NODES } from "./rpg";
import { useExplore } from "./store";
import {
  ACCESS_CODE,
  BENGKEL,
  CORE,
  HEART_POS,
  HIRE_POS,
  LAB,
  LAB_PANELS,
  NOC,
  NOTE_POS,
  ROOM_H,
  STATUS_POS,
  TERMINAL_POS,
  type ExploreMap,
} from "./layout";

/**
 * ExploreWorld — the LAB and CORE extensions that only exist in EXPLORE
 * mode. Aisle-A stays exactly the World.tsx corridor. Rack-face content is
 * reused, not rewritten: archive panels render through `Panels` and the big
 * live-telemetry cabinet through `StatusRack`, each wrapped in a positioned
 * group with a synthetic center-side station (their internal placement then
 * resolves relative to the group).
 */

const mono = "var(--font-op-mono, monospace)";

function wallCenter(r: { xMin: number; xMax: number; zMin: number; zMax: number }) {
  return {
    x: (r.xMin + r.xMax) / 2,
    z: (r.zMin + r.zMax) / 2,
    w: r.xMax - r.xMin,
    d: r.zMax - r.zMin,
  };
}

const STATUS_STATION: Station = {
  id: "core-status",
  kind: "status",
  z: 0,
  side: "center",
  title: "This very server",
};

const HIRE_STATION: Station = {
  id: "core-hire",
  kind: "contact",
  z: 0,
  side: "center",
  title: "ROOT ACCESS GRANTED",
  subtitle: "You explored the actual machine serving this site. Now hire its operator.",
};

export function ExploreWorld({ map, reduced }: { map: ExploreMap; reduced: boolean }) {
  const labC = wallCenter(LAB);
  const coreC = wallCenter({ ...CORE, zMax: LAB.zMin });
  const bengkelC = wallCenter(BENGKEL);
  const nocC = wallCenter(NOC);

  const visibleWalls = useMemo(() => map.walls.filter((w) => !w.hidden), [map]);
  // SHIFT MALAM: house lights drop to a fraction — the headlamp (toggleable,
  // ghost-lockable) becomes the player's main light source.
  const isNight = useExplore((s) => s.night);
  const lightMul = isNight ? 0.18 : 1;

  return (
    <group>
      {/* ------------------------- floors & ceilings ------------------------ */}
      {[
        { c: labC, y: 0, rx: -Math.PI / 2 },
        { c: labC, y: ROOM_H, rx: Math.PI / 2 },
        { c: coreC, y: 0, rx: -Math.PI / 2 },
        { c: coreC, y: ROOM_H, rx: Math.PI / 2 },
        { c: bengkelC, y: 0, rx: -Math.PI / 2 },
        { c: bengkelC, y: ROOM_H, rx: Math.PI / 2 },
        { c: nocC, y: 0, rx: -Math.PI / 2 },
        { c: nocC, y: ROOM_H, rx: Math.PI / 2 },
      ].map((p, i) => (
        <mesh key={i} rotation={[p.rx, 0, 0]} position={[p.c.x, p.y, p.c.z]}>
          <planeGeometry args={[p.c.w, p.c.d]} />
          <meshStandardMaterial
            color={p.y === 0 ? PALETTE.bg : PALETTE.metal}
            metalness={p.y === 0 ? 0.35 : 0.5}
            roughness={0.85}
          />
        </mesh>
      ))}

      {/* ------------------------------ walls ------------------------------ */}
      {visibleWalls.map((w, i) => {
        const c = wallCenter(w);
        return (
          <mesh key={i} position={[c.x, ROOM_H / 2, c.z]}>
            <boxGeometry args={[c.w, ROOM_H, c.d]} />
            <meshStandardMaterial
              color={PALETTE.metal}
              metalness={0.75}
              roughness={0.45}
              emissive={PALETTE.slate}
              emissiveIntensity={0.03}
            />
          </mesh>
        );
      })}

      {/* ------------------------------ doors ------------------------------ */}
      {map.doors.map((d) => (
        <DoorGate key={d.id} door={d} reduced={reduced} />
      ))}

      {/* ----------------------- LAB archive racks ------------------------- */}
      {LAB_PANELS.map((p) => (
        <group key={p.id} position={[p.x, 0, p.z]} rotation-y={Math.PI}>
          {/* Cabinet behind the screen */}
          <mesh position={[0, 1.6, -0.35]}>
            <boxGeometry args={[2.2, 3.2, 0.7]} />
            <meshStandardMaterial color={PALETTE.metal} metalness={0.85} roughness={0.32} />
          </mesh>
          {/* Teaser card: experiments stay classified until launch. */}
          <Html
            transform
            position={[0, 1.9, 0.05]}
            distanceFactor={2}
            style={{ pointerEvents: "none", userSelect: "none" }}
          >
            <div
              style={{
                width: 250,
                padding: "22px 20px",
                boxSizing: "border-box",
                background: "rgba(15,23,42,0.88)",
                border: "1px dashed rgba(245,158,11,0.5)",
                borderRadius: 12,
                fontFamily: mono,
                textAlign: "center",
              }}
            >
              <div style={{ fontSize: 10, letterSpacing: "0.24em", color: "#9fb0cc" }}>
                // {p.code} · CLASSIFIED
              </div>
              <div
                style={{
                  marginTop: 12,
                  fontSize: 44,
                  fontWeight: 700,
                  letterSpacing: "0.14em",
                  color: PALETTE.accentBright,
                  textShadow: "0 0 24px rgba(245,158,11,0.55)",
                }}
              >
                ???
              </div>
              <div
                style={{
                  marginTop: 12,
                  fontSize: 12,
                  letterSpacing: "0.3em",
                  color: PALETTE.secondary,
                }}
              >
                COMING SOON
              </div>
              <div style={{ marginTop: 12, fontSize: 9.5, color: "#7c8db0" }}>
                ▓▓▓▓▓░░░░░ deployment in progress
              </div>
            </div>
          </Html>
        </group>
      ))}

      {/* NOTE panel with the CORE access code — the LAB treasure. */}
      <group position={[NOTE_POS.x, 0, NOTE_POS.z]} rotation-y={-Math.PI / 2}>
        <Html
          transform
          position={[0, 1.75, 0.05]}
          distanceFactor={2}
          style={{ pointerEvents: "none", userSelect: "none" }}
        >
          <div
            style={{
              width: 230,
              padding: "16px 18px",
              boxSizing: "border-box",
              background: "rgba(245, 158, 11, 0.14)",
              border: `1px solid ${PALETTE.accentBright}`,
              borderRadius: 8,
              boxShadow: `0 0 34px rgba(245,158,11,0.35)`,
              fontFamily: mono,
              color: PALETTE.accentBright,
              textAlign: "center",
            }}
          >
            <div style={{ fontSize: 10, letterSpacing: "0.2em" }}>// STICKY NOTE · OPS</div>
            <div style={{ fontSize: 11, marginTop: 8, color: "#e2e8f0" }}>
              jangan lupa kode pintu CORE:
            </div>
            <div style={{ fontSize: 24, fontWeight: 700, marginTop: 8, letterSpacing: "0.1em" }}>
              {ACCESS_CODE}
            </div>
            <div style={{ fontSize: 9.5, marginTop: 8, color: "#9fb0cc" }}>
              (tolong hapus note ini — ops · 2026)
            </div>
          </div>
        </Html>
        <pointLight position={[0, 1.9, 0.7]} intensity={3} color={PALETTE.accent} distance={4} />
      </group>

      {/* ----------------------------- CORE -------------------------------- */}
      <ServerHeart reduced={reduced} />

      {/* Big live telemetry cabinet (east wall, facing the heart). */}
      <group position={[STATUS_POS.x, 0, STATUS_POS.z]} rotation-y={-Math.PI / 2}>
        <StatusRack station={STATUS_STATION} reduced={reduced} />
      </group>

      {/* Hire-me contact screen (south wall, facing north). */}
      <group position={[HIRE_POS.x, 0, HIRE_POS.z]}>
        <Panels stations={[HIRE_STATION]} reduced={reduced} />
      </group>

      {/* Interactive terminal cabinet (west wall, facing east). */}
      <group position={[TERMINAL_POS.x, 0, TERMINAL_POS.z]} rotation-y={Math.PI / 2}>
        <mesh position={[0, 1.4, -0.3]}>
          <boxGeometry args={[1.3, 2.8, 0.6]} />
          <meshStandardMaterial color={PALETTE.metal} metalness={0.8} roughness={0.3} />
        </mesh>
        <mesh position={[0, 1.75, 0.02]}>
          <planeGeometry args={[1.0, 0.72]} />
          <meshBasicMaterial
            color={PALETTE.secondary}
            toneMapped={false}
            transparent
            opacity={0.32}
          />
        </mesh>
      </group>

      {/* ---------------------------- lighting ------------------------------ */}
      <pointLight
        position={[7, ROOM_H - 0.6, -10.5]}
        intensity={7 * lightMul}
        color={PALETTE.accent}
        distance={11}
        decay={1.8}
      />
      <pointLight
        position={[14.5, ROOM_H - 0.6, -10.5]}
        intensity={7 * lightMul}
        color={PALETTE.accent}
        distance={11}
        decay={1.8}
      />
      <pointLight
        position={[14, ROOM_H - 0.6, -21]}
        intensity={6 * lightMul}
        color={PALETTE.secondary}
        distance={12}
        decay={1.8}
      />

      {/* ----------------------- RPG: BENGKEL & NOC ------------------------- */}
      {/* Workbench along the bengkel north wall + tool glow. */}
      <group position={[-9.5, 0, -13.95]}>
        <mesh position={[0, 0.5, 0]}>
          <boxGeometry args={[2.2, 1.0, 0.7]} />
          <meshStandardMaterial color={PALETTE.metal} metalness={0.7} roughness={0.4} />
        </mesh>
        <mesh position={[0, 1.03, 0]}>
          <boxGeometry args={[2.24, 0.06, 0.74]} />
          <meshStandardMaterial color={PALETTE.slate} metalness={0.5} roughness={0.5} />
        </mesh>
        <pointLight
          position={[0, 2.2, 0.6]}
          intensity={4 * lightMul}
          color={PALETTE.accent}
          distance={6}
          decay={1.8}
        />
      </group>
      {/* NOC monitor wall: a bank of dim sky screens above the desk. */}
      <group position={[10, 0, -1.62]}>
        <mesh position={[0, 0.55, 0]}>
          <boxGeometry args={[3.1, 1.1, 0.6]} />
          <meshStandardMaterial color={PALETTE.metal} metalness={0.75} roughness={0.35} />
        </mesh>
        {[0, 1, 2].map((i) => (
          <mesh key={i} position={[(i - 1) * 1.05, 1.85, -0.05]}>
            <planeGeometry args={[0.95, 0.6]} />
            <meshBasicMaterial
              color={PALETTE.secondary}
              transparent
              opacity={0.28}
              toneMapped={false}
            />
          </mesh>
        ))}
        <pointLight
          position={[0, 2.1, 1]}
          intensity={4.5 * lightMul}
          color={PALETTE.secondary}
          distance={6.5}
          decay={1.8}
        />
      </group>
      {/* Q2 patch panels — small sky boxes that read as inspectable. */}
      {QUEST_NODES.map((q) => (
        <group key={q.id} position={[q.x, 0, q.z]}>
          <mesh position={[0, 1.25, 0]}>
            <boxGeometry args={[0.34, 0.5, 0.16]} />
            <meshStandardMaterial
              color={PALETTE.metal}
              emissive={PALETTE.secondary}
              emissiveIntensity={0.5}
              metalness={0.6}
              roughness={0.4}
            />
          </mesh>
        </group>
      ))}
      {/* NPC cast — day shift only; they go home before SHIFT MALAM. */}
      {!isNight &&
        NPCS.map((n) => (
          <group key={n.id}>
            <group position={[n.x, 2.05, n.z]}>
              <Html
                center
                distanceFactor={3.2}
                style={{ pointerEvents: "none", userSelect: "none" }}
              >
                <div
                  style={{
                    fontFamily: mono,
                    fontSize: 11,
                    letterSpacing: "0.16em",
                    color: PALETTE.accentBright,
                    background: "rgba(11,17,32,0.75)",
                    border: "1px solid rgba(245,158,11,0.4)",
                    borderRadius: 6,
                    padding: "2px 8px",
                    whiteSpace: "nowrap",
                    textAlign: "center",
                  }}
                >
                  {n.name}
                </div>
              </Html>
            </group>
            <HumanoidFigure
              look={n.look}
              sample={(out) => {
                out.x = n.x;
                out.y = 0;
                out.z = n.z;
                out.yaw = n.yaw;
                out.pitch = 0;
              }}
            />
          </group>
        ))}

      {/* --------------------- pengunjung online ---------------------------- */}
      <OnlinePlayers />

      {/* ------------------------- MOKSA.CLOUD ----------------------------- */}
      {isNight && <NightShift map={map} />}
    </group>
  );
}

/** The pulsing amber heart of the machine — CORE centerpiece. */
function ServerHeart({ reduced }: { reduced: boolean }) {
  const heart = useRef<THREE.Mesh>(null);
  const glow = useRef<THREE.PointLight>(null);

  useFrame(({ clock }) => {
    if (reduced) return;
    const t = clock.elapsedTime;
    // Double-thump heartbeat, ~52 bpm.
    const phase = (t * 0.87) % 1;
    const beat =
      Math.exp(-Math.pow((phase - 0.12) * 14, 2)) +
      0.6 * Math.exp(-Math.pow((phase - 0.34) * 14, 2));
    const s = 1 + beat * 0.09;
    heart.current?.scale.setScalar(s);
    if (glow.current) glow.current.intensity = 10 + beat * 16;
  });

  return (
    <group position={[HEART_POS.x, 0, HEART_POS.z]}>
      <mesh position={[0, 0.4, 0]}>
        <boxGeometry args={[1.6, 0.8, 1.6]} />
        <meshStandardMaterial color={PALETTE.metal} metalness={0.85} roughness={0.3} />
      </mesh>
      <mesh ref={heart} position={[0, 2.05, 0]}>
        <icosahedronGeometry args={[0.85, 1]} />
        <meshStandardMaterial
          color={PALETTE.accent}
          emissive={PALETTE.accent}
          emissiveIntensity={1.6}
          metalness={0.2}
          roughness={0.35}
          flatShading
        />
      </mesh>
      <pointLight
        ref={glow}
        position={[0, 2.2, 0]}
        intensity={12}
        color={PALETTE.accent}
        distance={13}
        decay={1.7}
      />
    </group>
  );
}
