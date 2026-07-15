import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { PALETTE } from "../types";
import { HumanoidFigure, type HumanoidLook } from "./humanoid";
import { PLAYER_SPEED } from "./layout";
import { player } from "./store";

/**
 * Avatar — visible player for EXPLORE mode. Since 2026-07-16 the Operator is
 * a real human figure (shared `humanoid.tsx` rig — capsules, joints, blink),
 * not the old box mannequin. Two views over the same `player` singleton:
 *
 * - `ThirdPersonBody` — the Operator walking at (player.x, player.y, player.z).
 * - `FirstPersonArms` — rounded viewmodel forearms glued to the camera.
 */

/** The Operator: navy jumpsuit, amber chest strip + headlamp, warm skin. */
export const OPERATOR_LOOK: HumanoidLook = {
  skin: "#c99a72",
  hair: "#141c2e",
  outfit: PALETTE.metal,
  outfitDark: "#111a33",
  accent: PALETTE.accent,
  headlamp: true,
};

/* --------------------------- third person ----------------------------- */

export function ThirdPersonBody() {
  return (
    <HumanoidFigure
      look={OPERATOR_LOOK}
      maxSpeed={PLAYER_SPEED}
      sample={(out) => {
        out.x = player.x;
        out.y = player.y;
        out.z = player.z;
        out.yaw = player.yaw;
        out.pitch = player.pitch;
      }}
    />
  );
}

/* ---------------------------- first person ----------------------------- */

const LOOK_LAG = 12; // 1/s — rotation catches up to the camera at this rate

interface Gait {
  px: number;
  pz: number;
  speed: number;
  phase: number;
}

export function FirstPersonArms() {
  const a = useMemo(() => {
    const sleeve = new THREE.MeshStandardMaterial({
      color: PALETTE.metal,
      roughness: 0.8,
      metalness: 0.1,
    });
    // Kept dim: at viewmodel distance the cuff fills a lot of screen — any
    // stronger emissive and it upstages the whole frame.
    const cuff = new THREE.MeshStandardMaterial({
      color: PALETTE.accent,
      emissive: PALETTE.accent,
      emissiveIntensity: 0.15,
      roughness: 0.55,
    });
    const skin = new THREE.MeshStandardMaterial({ color: "#c99a72", roughness: 0.62 });
    return { sleeve, cuff, skin };
  }, []);
  const gait = useRef<Gait>({ px: 0, pz: 0, speed: 0, phase: 0 });
  const rig = useRef<THREE.Group>(null);
  const bob = useRef<THREE.Group>(null);

  useFrame(({ camera }, dt) => {
    const g = rig.current;
    if (!g || dt <= 0) return;
    const gt = gait.current;
    const raw = Math.hypot(player.x - gt.px, player.z - gt.pz) / dt;
    gt.px = player.x;
    gt.pz = player.z;
    gt.speed += (Math.min(raw, PLAYER_SPEED * 1.5) - gt.speed) * Math.min(1, dt * 10);
    gt.phase += gt.speed * dt * 3.1;

    // Position snaps to the camera (any positional lag reads as detached
    // arms); rotation lags slightly so the viewmodel feels alive.
    g.position.copy(camera.position);
    g.quaternion.slerp(camera.quaternion, 1 - Math.exp(-LOOK_LAG * dt));

    const amp = Math.min(gt.speed / PLAYER_SPEED, 1);
    const b = bob.current;
    if (b) {
      b.position.y = Math.sin(gt.phase * 2) * 0.02 * amp;
      b.position.x = Math.sin(gt.phase) * 0.012 * amp;
    }
  });

  // Forearms extend along −z from the bottom corners toward screen center.
  // y −0.21: at z≈−0.3 the default-FOV frustum bottom is ≈−0.22, so anything
  // lower sits fully off-screen.
  const arm = (side: 1 | -1) => (
    <group
      key={side}
      position={[0.24 * side, -0.21, -0.3]}
      rotation={[-0.32, -0.22 * side, 0.1 * side]}
    >
      {/* navy sleeve — capsule lying along z (rounded, not a box) */}
      <mesh rotation={[Math.PI / 2, 0, 0]} material={a.sleeve}>
        <capsuleGeometry args={[0.058, 0.32, 6, 14]} />
      </mesh>
      {/* amber cuff ring */}
      <mesh position={[0, 0, -0.15]} rotation={[Math.PI / 2, 0, 0]} material={a.cuff}>
        <cylinderGeometry args={[0.062, 0.062, 0.045, 14]} />
      </mesh>
      {/* hand — squashed sphere reads as a relaxed fist */}
      <mesh position={[0, 0.005, -0.27]} scale={[0.85, 1.05, 1.3]} material={a.skin}>
        <sphereGeometry args={[0.055, 16, 12]} />
      </mesh>
    </group>
  );

  return (
    <group ref={rig}>
      {/* Tiny fill so the navy sleeves read against the dark floor — the
          headlamp cone starts at the camera and barely grazes them. */}
      <pointLight
        color="#fde9c8"
        intensity={0.8}
        distance={1.4}
        decay={2}
        position={[0, -0.05, -0.2]}
      />
      <group ref={bob}>
        {arm(1)}
        {arm(-1)}
      </group>
    </group>
  );
}
