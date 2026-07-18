import { Html } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { PALETTE } from "../types";
import { HALL, TUNNEL } from "./layout";
import { useExplore } from "./store";
import { useNearby } from "./useNearby";

/**
 * HallRoom — the DATA HALL cathedral: six hot/cold rack rows rendered as two
 * InstancedMeshes (cabinets + LED slits, ~160 instances, 2 draw calls),
 * per-instance LED colors, one faulty flickering ceiling light in the far
 * corner, aisle signage, and the cable-tunnel mouth glow. Rows must shadow
 * the hidden colliders in layout.ts.
 */

const ROWS = [-16.8, -19.2, -21.6, -24, -26.4, -28.8];
const RACK_W = 1.24;
const mono = "var(--font-op-mono, monospace)";

/** Rack x slots per row half (gap −24.7…−23.3 stays walkable). */
function slots(): number[] {
  const xs: number[] = [];
  for (let x = -32; x <= -25.3; x += RACK_W) xs.push(x);
  for (let x = -22.7; x <= -16; x += RACK_W) xs.push(x);
  return xs;
}

export function HallRoom({ reduced }: { reduced: boolean }) {
  const isNight = useExplore((s) => s.night);
  // Signage is DOM; only exists while the player is in/near the hall.
  const signsNear = useNearby(-24, -21, 22);
  const lightMul = isNight ? 0.15 : 1;
  const cabinets = useRef<THREE.InstancedMesh>(null);
  const leds = useRef<THREE.InstancedMesh>(null);
  const flicker = useRef<THREE.PointLight>(null);

  const placements = useMemo(() => {
    const xs = slots();
    const out: { x: number; z: number; c: THREE.Color }[] = [];
    let i = 0;
    for (const z of ROWS) {
      for (const x of xs) {
        // Deterministic pseudo-random LED state per slot: mostly amber,
        // some sky, a few dead-dark — a hall that has lived a little.
        const h = Math.abs(Math.sin(i * 12.9898 + z * 78.233)) % 1;
        const c =
          h < 0.62
            ? new THREE.Color(PALETTE.accent)
            : h < 0.86
              ? new THREE.Color(PALETTE.secondary)
              : new THREE.Color("#1a2340");
        out.push({ x: x + RACK_W / 2, z, c });
        i++;
      }
    }
    return out;
  }, []);

  useEffect(() => {
    const cab = cabinets.current;
    const led = leds.current;
    if (!cab || !led) return;
    const m = new THREE.Matrix4();
    placements.forEach((p, i) => {
      m.setPosition(p.x, 1.5, p.z);
      cab.setMatrixAt(i, m);
      m.setPosition(p.x, 1.5, p.z + 0.42);
      led.setMatrixAt(i, m);
      led.setColorAt(i, p.c);
    });
    cab.instanceMatrix.needsUpdate = true;
    led.instanceMatrix.needsUpdate = true;
    if (led.instanceColor) led.instanceColor.needsUpdate = true;
  }, [placements]);

  useFrame(({ clock }) => {
    if (reduced || !flicker.current) return;
    // Dying fluorescent in the far corner: mostly on, hard dropouts.
    const t = clock.elapsedTime;
    const bad = Math.sin(t * 13.7) * Math.sin(t * 3.1) > 0.6;
    flicker.current.intensity = (bad ? 0.6 : 4.2) * lightMul;
  });

  return (
    <group>
      {/* Cabinets + LED slits, two draw calls for the whole hall.
          frustumCulled off: the instance cloud lives far from the geometry
          origin, so the default bounding sphere would cull the entire hall. */}
      <instancedMesh
        ref={cabinets}
        args={[undefined, undefined, placements.length]}
        frustumCulled={false}
      >
        <boxGeometry args={[1.06, 3, 0.8]} />
        <meshStandardMaterial color={PALETTE.metal} metalness={0.82} roughness={0.36} />
      </instancedMesh>
      <instancedMesh
        ref={leds}
        args={[undefined, undefined, placements.length]}
        frustumCulled={false}
      >
        <boxGeometry args={[0.7, 0.06, 0.02]} />
        <meshBasicMaterial toneMapped={false} />
      </instancedMesh>

      {/* Aisle signage hung from the ceiling. */}
      {signsNear &&
        [
          { z: -18, text: "HOT AISLE ▸", color: PALETTE.accentBright },
          { z: -22.8, text: "◂ COLD AISLE", color: PALETTE.secondary },
        ].map((s) => (
          <Html
            key={s.z}
            transform
            position={[-24, 3.3, s.z]}
            distanceFactor={3}
            style={{ pointerEvents: "none", userSelect: "none" }}
          >
            <div
              style={{
                fontFamily: mono,
                fontSize: 16,
                fontWeight: 700,
                letterSpacing: "0.3em",
                color: s.color,
                background: "rgba(11,17,32,0.85)",
                border: `1px solid ${s.color}55`,
                borderRadius: 6,
                padding: "6px 14px",
                whiteSpace: "nowrap",
              }}
            >
              {s.text}
            </div>
          </Html>
        ))}

      {/* House lights: two amber bays + the dying corner fluorescent. */}
      <pointLight
        position={[-28, 3.7, -18]}
        intensity={6 * lightMul}
        color={PALETTE.accent}
        distance={13}
        decay={1.8}
      />
      <pointLight
        position={[-20, 3.7, -26]}
        intensity={6 * lightMul}
        color={PALETTE.accent}
        distance={13}
        decay={1.8}
      />
      <pointLight
        ref={flicker}
        position={[-32.5, 3.6, -28.5]}
        intensity={4.2 * lightMul}
        color="#fde9c8"
        distance={8}
        decay={1.8}
      />

      {/* Cable-tunnel mouth: sky glow + crawl-space framing. */}
      <pointLight
        position={[TUNNEL.xMin + 1.2, 1.2, (TUNNEL.zMin + TUNNEL.zMax) / 2]}
        intensity={3 * lightMul}
        color={PALETTE.secondary}
        distance={6}
        decay={1.8}
      />
      {signsNear && (
        <Html
          transform
          position={[HALL.xMax - 0.1, 2.55, (TUNNEL.zMin + TUNNEL.zMax) / 2]}
          rotation-y={-Math.PI / 2}
          distanceFactor={2.4}
          style={{ pointerEvents: "none", userSelect: "none" }}
        >
          <div
            style={{
              fontFamily: mono,
              fontSize: 11,
              letterSpacing: "0.22em",
              color: PALETTE.secondary,
              background: "rgba(11,17,32,0.85)",
              border: `1px solid ${PALETTE.secondary}55`,
              borderRadius: 6,
              padding: "5px 10px",
              whiteSpace: "nowrap",
            }}
          >
            ⚠ TEROWONGAN KABEL → VAULT
          </div>
        </Html>
      )}
    </group>
  );
}
