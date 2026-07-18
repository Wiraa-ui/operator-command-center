import { Html } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";
import { PALETTE } from "../types";
import { MASTER_TAPE_POS, VAULT } from "./layout";
import { useExplore } from "./store";
import { useNearby } from "./useNearby";

/**
 * VaultRoom — the cold-storage tape library south of CORE. Sky-tinted and
 * quieter than the amber rooms: four tape-rack rows (colliders in layout.ts),
 * a BACKUP LOG wall panel telling the machine's real backup story, and the
 * golden MASTER TAPE in a display case (interact → achievement, PlayerRig).
 */

const mono = "var(--font-op-mono, monospace)";

/** Tape rack rows — must shadow the hidden colliders in layout.ts. */
const ROWS = [
  { x: 15.15, z: -26.5 },
  { x: 18.85, z: -26.5 },
  { x: 15.15, z: -28.8 },
  { x: 18.85, z: -28.8 },
];

export function VaultRoom({ reduced }: { reduced: boolean }) {
  const isNight = useExplore((s) => s.night);
  const logNear = useNearby(VAULT.xMin + 0.15, -27.6, 14);
  const lightMul = isNight ? 0.25 : 1;
  const tape = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    if (reduced || !tape.current) return;
    // The relic slowly turns and bobs in its case.
    tape.current.rotation.y = clock.elapsedTime * 0.6;
    tape.current.position.y = 1.28 + Math.sin(clock.elapsedTime * 1.4) * 0.04;
  });

  return (
    <group>
      {/* Tape-library rows: cold cabinets with sky LED slits. */}
      {ROWS.map((r, i) => (
        <group key={i} position={[r.x, 0, r.z]}>
          <mesh position={[0, 1.35, 0]}>
            <boxGeometry args={[2.5, 2.7, 0.8]} />
            <meshStandardMaterial color={PALETTE.metal} metalness={0.8} roughness={0.35} />
          </mesh>
          {[0.6, 1.35, 2.1].map((y) => (
            <mesh key={y} position={[0, y, 0.41]}>
              <boxGeometry args={[2.3, 0.05, 0.02]} />
              <meshBasicMaterial
                color={PALETTE.secondary}
                transparent
                opacity={0.5}
                toneMapped={false}
              />
            </mesh>
          ))}
        </group>
      ))}

      {/* BACKUP LOG panel on the vault's west wall. */}
      <group position={[VAULT.xMin + 0.15, 0, -27.6]} rotation-y={Math.PI / 2}>
        {logNear && (
          <Html
            transform
            position={[0, 1.9, 0.05]}
            distanceFactor={2}
            style={{ pointerEvents: "none", userSelect: "none" }}
          >
            <div
              style={{
                width: 250,
                boxSizing: "border-box",
                padding: "12px 14px",
                background: PALETTE.bg,
                border: `1px solid ${PALETTE.secondary}55`,
                borderRadius: 6,
                fontFamily: mono,
                color: "#cbd5e1",
                fontSize: 11,
                lineHeight: 1.5,
              }}
            >
              <div style={{ fontSize: 9, letterSpacing: "0.22em", color: PALETTE.secondary }}>
                // BACKUP LOG — COLD STORAGE
              </div>
              <div style={{ marginTop: 8 }}>
                jadwal &nbsp;: harian, dini hari
                <br />
                retensi &nbsp;: 30 hari
                <br />
                uji-restore : <span style={{ color: PALETTE.accentBright }}>LULUS</span>
                <br />
                aturan &nbsp;&nbsp;: 3-2-1
              </div>
              <div style={{ marginTop: 8, fontSize: 9.5, color: "#7c8db0" }}>
                mesin ini mem-backup dirinya sendiri setiap malam — termasuk ruangan yang sedang
                kamu jelajahi.
              </div>
            </div>
          </Html>
        )}
      </group>

      {/* Master-tape display case + the golden relic. */}
      <group position={[MASTER_TAPE_POS.x, 0, MASTER_TAPE_POS.z]}>
        <mesh position={[0, 0.5, 0]}>
          <boxGeometry args={[0.9, 1.0, 0.7]} />
          <meshStandardMaterial color={PALETTE.metal} metalness={0.85} roughness={0.3} />
        </mesh>
        <mesh position={[0, 1.35, 0]}>
          <boxGeometry args={[0.7, 0.7, 0.55]} />
          <meshStandardMaterial
            color={PALETTE.secondary}
            transparent
            opacity={0.12}
            metalness={0.1}
            roughness={0.05}
          />
        </mesh>
        <mesh ref={tape} position={[0, 1.28, 0]}>
          <boxGeometry args={[0.34, 0.22, 0.06]} />
          <meshStandardMaterial
            color={PALETTE.accent}
            emissive={PALETTE.accent}
            emissiveIntensity={1.1}
            metalness={0.6}
            roughness={0.3}
          />
        </mesh>
        <pointLight
          position={[0, 1.9, 0.6]}
          intensity={3.5 * lightMul}
          color={PALETTE.accentBright}
          distance={4}
          decay={1.8}
        />
      </group>

      {/* Cold room light — sky, dimmer than the amber rooms. */}
      <pointLight
        position={[17, 3.6, -27.6]}
        intensity={5 * lightMul}
        color={PALETTE.secondary}
        distance={11}
        decay={1.8}
      />
    </group>
  );
}
