import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { CORRIDOR, PALETTE, SIDE_X, type Station } from "./types";
import { fxBus } from "./explore/store";

/**
 * World — static corridor geometry for The Server Room.
 *
 * Everything repeated is instanced to stay inside the module draw-call budget
 * (CONTRACT.md: ≤ ~30). Actual draw calls here: floor + grid lines + ceiling +
 * decorative racks + station bodies + station panels + LED strips = 7.
 *
 * - No ambient light or fog — the integrator owns those on the Canvas.
 * - LED blink is the only animation; it no-ops when `reduced` is true
 *   (instance colors are then set once to a steady glow).
 * - All colors come from PALETTE (no green, no purple — user mandate).
 */

const RACK_H = 3; // decorative rack height
const RACK_W = 1.1; // decorative rack width along the corridor (z)
const RACK_D = 0.9; // decorative rack depth into the wall (x)
const DECOR_STEP = 1.2; // tight row spacing (RACK_W + small seam)
const STATION_GAP = 1.7; // half-width of the slot a station rack claims

const DETAIL_W = 2.0; // station rack width (faces the aisle)
const DETAIL_H = 3.2;
const LEDS_PER_RACK = 8; // 2 columns × 4 rows on the front panel

/** Deterministic PRNG so instance jitter is stable across re-renders. */
function mulberry32(seed: number) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Rack front faces the aisle: local +z → world +x (left) / -x (right). */
function sideQuaternion(side: "left" | "right") {
  return new THREE.Quaternion().setFromAxisAngle(
    new THREE.Vector3(0, 1, 0),
    side === "left" ? Math.PI / 2 : -Math.PI / 2,
  );
}

export interface WallGap {
  side: "left" | "right";
  zMin: number;
  zMax: number;
}

export function World({
  stations,
  reduced,
  gaps = [],
}: {
  stations: Station[];
  reduced: boolean;
  /** Doorway openings (EXPLORE mode): decor racks skip these z-ranges. */
  gaps?: WallGap[];
}) {
  const decorRef = useRef<THREE.InstancedMesh>(null);
  const bodyRef = useRef<THREE.InstancedMesh>(null);
  const panelRef = useRef<THREE.InstancedMesh>(null);
  const ledRef = useRef<THREE.InstancedMesh>(null);

  // Corridor extent: camera walks z=+4 → deepest station − 4 (CONTRACT.md).
  const zStart = 4;
  const zEnd = Math.min(0, ...stations.map((s) => s.z)) - 4;
  const length = zStart - zEnd;
  const zMid = (zStart + zEnd) / 2;

  /* ---------------- decorative rack rows (both walls) ---------------- */

  const decor = useMemo(() => {
    const rand = mulberry32(1337);
    const occupied = stations.filter((s) => s.side !== "center");
    const matrices: THREE.Matrix4[] = [];
    const pos = new THREE.Vector3();
    const scale = new THREE.Vector3();
    for (const side of ["left", "right"] as const) {
      const q = sideQuaternion(side);
      for (let z = zStart - RACK_W / 2; z > zEnd + RACK_W / 2; z -= DECOR_STEP) {
        // Leave the slot open where a station rack (any kind) lives.
        if (occupied.some((s) => s.side === side && Math.abs(z - s.z) < STATION_GAP)) continue;
        // Doorway gaps (EXPLORE mode) stay clear of decor racks too.
        if (gaps.some((g) => g.side === side && z > g.zMin && z < g.zMax)) continue;
        const h = 0.92 + rand() * 0.08; // slight height jitter breaks the extrusion look
        pos.set(SIDE_X[side], (RACK_H / 2) * h, z);
        scale.set(1, h, 1);
        matrices.push(new THREE.Matrix4().compose(pos, q, scale));
      }
    }
    return matrices;
  }, [stations, zEnd, gaps]);

  /* ------------- detailed station racks (project / skills) ------------ */

  const detail = useMemo(() => {
    const racks = stations.filter(
      (s) => (s.kind === "project" || s.kind === "skills") && s.side !== "center",
    );
    const rand = mulberry32(9001);
    const one = new THREE.Vector3(1, 1, 1);
    const bodies: THREE.Matrix4[] = [];
    const panels: THREE.Matrix4[] = [];
    const leds: THREE.Matrix4[] = [];
    const ledPhase: number[] = [];
    const ledSpeed: number[] = [];
    const ledBase: THREE.Color[] = [];
    const local = new THREE.Vector3();

    for (const s of racks) {
      if (s.side === "center") continue; // narrowed above; keeps TS happy
      const q = sideQuaternion(s.side);
      const rackMat = new THREE.Matrix4().compose(
        new THREE.Vector3(SIDE_X[s.side], DETAIL_H / 2, s.z),
        q,
        one,
      );
      bodies.push(rackMat.clone());
      // Front panel sits just proud of the body face (local +z).
      panels.push(
        rackMat.clone().multiply(new THREE.Matrix4().makeTranslation(0, 0, RACK_D / 2 + 0.012)),
      );
      // LED grid near the top of the panel, mostly amber with sky accents.
      for (let i = 0; i < LEDS_PER_RACK; i++) {
        const col = i % 2 === 0 ? -0.62 : 0.62;
        const row = Math.floor(i / 2);
        local.set(col, 0.35 + row * 0.32, RACK_D / 2 + 0.02);
        leds.push(
          rackMat.clone().multiply(new THREE.Matrix4().makeTranslation(local.x, local.y, local.z)),
        );
        ledPhase.push(rand() * Math.PI * 2);
        ledSpeed.push(1.5 + rand() * 2.5);
        ledBase.push(new THREE.Color(i % 3 === 2 ? PALETTE.secondary : PALETTE.accentBright));
      }
    }
    return { bodies, panels, leds, ledPhase, ledSpeed, ledBase };
  }, [stations]);

  /* -------------------- floor grid line geometry --------------------- */

  const gridPositions = useMemo(() => {
    const pts: number[] = [];
    const halfW = CORRIDOR.width / 2;
    // Cross lines every 1 z-unit; rails every 1 x-unit — faint circuit floor.
    for (let z = Math.floor(zStart); z >= Math.ceil(zEnd); z -= 1)
      pts.push(-halfW, 0, z, halfW, 0, z);
    for (let x = -halfW; x <= halfW; x += 1) pts.push(x, 0, zStart, x, 0, zEnd);
    return new Float32Array(pts);
  }, [zEnd]);

  /* ------------------------ instance upload -------------------------- */

  useEffect(() => {
    const upload = (mesh: THREE.InstancedMesh | null, mats: THREE.Matrix4[]) => {
      if (!mesh) return;
      mats.forEach((m, i) => mesh.setMatrixAt(i, m));
      mesh.instanceMatrix.needsUpdate = true;
    };
    upload(decorRef.current, decor);
    upload(bodyRef.current, detail.bodies);
    upload(panelRef.current, detail.panels);
    upload(ledRef.current, detail.leds);
    // Seed LED colors: steady mid glow — also the final state under reduced motion.
    const led = ledRef.current;
    if (led) {
      const c = new THREE.Color();
      detail.ledBase.forEach((base, i) => led.setColorAt(i, c.copy(base).multiplyScalar(0.6)));
      if (led.instanceColor) led.instanceColor.needsUpdate = true;
    }
  }, [decor, detail]);

  /* -------------------------- LED blinking --------------------------- */

  const tmpColor = useMemo(() => new THREE.Color(), []);
  useFrame(({ clock }) => {
    if (reduced) return;
    const led = ledRef.current;
    if (!led) return;
    const t = clock.elapsedTime;
    if (Date.now() < fxBus.raveUntil) {
      // Konami rave: every LED strobes through amber/sky/white steps
      // (~12 Hz, per-instance offset). Palette mandate: no green, no purple.
      const step = Math.floor(t * 12);
      for (let i = 0; i < detail.leds.length; i++) {
        const k = (step + i * 7) % 4;
        led.setColorAt(
          i,
          tmpColor
            .set(
              k === 0
                ? PALETTE.accentBright
                : k === 1
                  ? PALETTE.secondary
                  : k === 2
                    ? "#ffffff"
                    : PALETTE.accent,
            )
            .multiplyScalar(1.5),
        );
      }
    } else {
      for (let i = 0; i < detail.leds.length; i++) {
        // Hard on/off threshold reads as status blink, not a smooth pulse.
        const on = Math.sin(t * detail.ledSpeed[i] + detail.ledPhase[i]) > 0.25;
        led.setColorAt(i, tmpColor.copy(detail.ledBase[i]).multiplyScalar(on ? 1 : 0.12));
      }
    }
    if (led.instanceColor) led.instanceColor.needsUpdate = true;
  });

  return (
    <group>
      {/* Floor slab */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, zMid]}>
        <planeGeometry args={[CORRIDOR.width, length]} />
        <meshStandardMaterial color={PALETTE.bg} metalness={0.35} roughness={0.85} />
      </mesh>
      {/* Emissive grid lines, a hair above the floor to avoid z-fighting */}
      <lineSegments position={[0, 0.005, 0]}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[gridPositions, 3]} />
        </bufferGeometry>
        <lineBasicMaterial color={PALETTE.secondary} transparent opacity={0.18} />
      </lineSegments>
      {/* Dark ceiling */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, CORRIDOR.height, zMid]}>
        <planeGeometry args={[CORRIDOR.width, length]} />
        <meshStandardMaterial color={PALETTE.metal} metalness={0.5} roughness={0.9} />
      </mesh>

      {/* Decorative rack rows — the implied walls */}
      <instancedMesh
        key={`decor-${decor.length}`}
        ref={decorRef}
        args={[undefined, undefined, decor.length]}
      >
        <boxGeometry args={[RACK_W, RACK_H, RACK_D]} />
        <meshStandardMaterial
          color={PALETTE.metal}
          metalness={0.8}
          roughness={0.4}
          emissive={PALETTE.slate}
          emissiveIntensity={0.03}
        />
      </instancedMesh>

      {/* Station rack bodies (project/skills) */}
      <instancedMesh
        key={`body-${detail.bodies.length}`}
        ref={bodyRef}
        args={[undefined, undefined, detail.bodies.length]}
      >
        <boxGeometry args={[DETAIL_W, DETAIL_H, RACK_D]} />
        <meshStandardMaterial color={PALETTE.metal} metalness={0.85} roughness={0.32} />
      </instancedMesh>
      {/* Brushed-metal front panels facing the aisle */}
      <instancedMesh
        key={`panel-${detail.panels.length}`}
        ref={panelRef}
        args={[undefined, undefined, detail.panels.length]}
      >
        <planeGeometry args={[DETAIL_W - 0.24, DETAIL_H - 0.24]} />
        <meshStandardMaterial
          color={PALETTE.slate}
          metalness={0.9}
          roughness={0.25}
          emissive={PALETTE.secondary}
          emissiveIntensity={0.02}
        />
      </instancedMesh>
      {/* Blinking status LEDs (instance colors drive the blink) */}
      <instancedMesh
        key={`led-${detail.leds.length}`}
        ref={ledRef}
        args={[undefined, undefined, detail.leds.length]}
      >
        <planeGeometry args={[0.16, 0.05]} />
        {/* White = identity multiplier; visible color is per-instance PALETTE amber/sky */}
        <meshBasicMaterial color="#ffffff" toneMapped={false} />
      </instancedMesh>

      {/* Dim amber wash at both ends of the aisle (no ambient/fog here) */}
      <pointLight
        position={[0, CORRIDOR.height - 0.8, zStart - 1]}
        intensity={9}
        color={PALETTE.accent}
        distance={14}
        decay={1.8}
      />
      <pointLight
        position={[0, CORRIDOR.height - 0.8, zEnd + 1]}
        intensity={9}
        color={PALETTE.accent}
        distance={14}
        decay={1.8}
      />
    </group>
  );
}
