import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { PALETTE } from "../types";
import { ROOM_H, type DoorDef } from "./layout";
import { useExplore } from "./store";

/**
 * DoorGate — a locked bulkhead slab filling its wall opening, with an amber
 * keypad glow. When its puzzle is solved the slab sinks into the floor
 * (collision is removed separately by PlayerRig via store.unlocked).
 */

const DOOR_H = 3.4;

export function DoorGate({ door, reduced }: { door: DoorDef; reduced: boolean }) {
  const open = useExplore((s) => s.unlocked.includes(door.id));
  const slab = useRef<THREE.Group>(null);

  const w = door.axis === "x" ? door.rect.zMax - door.rect.zMin : door.rect.xMax - door.rect.xMin;
  const cx = (door.rect.xMin + door.rect.xMax) / 2;
  const cz = (door.rect.zMin + door.rect.zMax) / 2;
  const yClosed = DOOR_H / 2;
  const yOpen = -DOOR_H / 2 + 0.06; // sunk into the floor, top edge as a sill

  useFrame((_, dt) => {
    const g = slab.current;
    if (!g) return;
    const target = open ? yOpen : yClosed;
    g.position.y = reduced ? target : THREE.MathUtils.damp(g.position.y, target, 2.2, dt);
  });

  return (
    <group position={[cx, 0, cz]} rotation-y={door.axis === "x" ? Math.PI / 2 : 0}>
      {/* Frame posts + lintel stay put. */}
      <mesh position={[-w / 2 - 0.09, DOOR_H / 2, 0]}>
        <boxGeometry args={[0.18, DOOR_H, 0.5]} />
        <meshStandardMaterial color={PALETTE.metal} metalness={0.8} roughness={0.35} />
      </mesh>
      <mesh position={[w / 2 + 0.09, DOOR_H / 2, 0]}>
        <boxGeometry args={[0.18, DOOR_H, 0.5]} />
        <meshStandardMaterial color={PALETTE.metal} metalness={0.8} roughness={0.35} />
      </mesh>
      <mesh position={[0, DOOR_H + (ROOM_H - DOOR_H) / 2, 0]}>
        <boxGeometry args={[w + 0.36, ROOM_H - DOOR_H, 0.5]} />
        <meshStandardMaterial color={PALETTE.metal} metalness={0.8} roughness={0.35} />
      </mesh>

      {/* Sliding slab */}
      <group ref={slab} position={[0, yClosed, 0]}>
        <mesh>
          <boxGeometry args={[w, DOOR_H, 0.16]} />
          <meshStandardMaterial
            color={PALETTE.metal}
            metalness={0.9}
            roughness={0.28}
            emissive={PALETTE.accent}
            emissiveIntensity={0.06}
          />
        </mesh>
        {/* Warning chevron band */}
        <mesh position={[0, 0, 0.085]}>
          <planeGeometry args={[w - 0.3, 0.28]} />
          <meshBasicMaterial color={PALETTE.accent} toneMapped={false} transparent opacity={0.85} />
        </mesh>
      </group>

      {/* Keypad: amber = locked, sky = open. */}
      <mesh position={[-w / 2 - 0.09, 1.45, 0.3]}>
        <boxGeometry args={[0.14, 0.2, 0.06]} />
        <meshBasicMaterial
          color={open ? PALETTE.secondary : PALETTE.accentBright}
          toneMapped={false}
        />
      </mesh>
      <pointLight
        position={[0, 2.2, 0.9]}
        intensity={open ? 2.5 : 4}
        color={open ? PALETTE.secondary : PALETTE.accent}
        distance={5}
        decay={1.8}
      />
    </group>
  );
}
