import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { PALETTE } from "../types";
import { PLAYER_SPEED } from "./layout";
import { player } from "./store";

/**
 * Avatar — visible player for EXPLORE mode, all procedural boxes (contract:
 * no GLTF/assets, palette only). Two views over the same `player` singleton:
 *
 * - `ThirdPersonBody` — full low-poly "Operator" placed at (player.x, 0,
 *   player.z), for third-person/spectator shots.
 * - `FirstPersonArms` — Minecraft-style viewmodel glued to the active camera.
 *
 * Everything animates via refs in useFrame — no React state per frame (same
 * rule as PlayerRig). Gait is estimated from frame-to-frame position deltas
 * so neither component needs to know about input or collision.
 */

/* ------------------------------- gait -------------------------------- */

interface Gait {
  px: number;
  pz: number;
  /** Smoothed ground speed, world units/s. */
  speed: number;
  /** Walk-cycle phase, radians (arms/legs read sin of this). */
  phase: number;
}

const newGait = (): Gait => ({ px: player.x, pz: player.z, speed: 0, phase: 0 });

function stepGait(g: Gait, dt: number): void {
  if (dt <= 0) return;
  const raw = Math.hypot(player.x - g.px, player.z - g.pz) / dt;
  g.px = player.x;
  g.pz = player.z;
  // Cap: a teleport (resetPlayer) reads as one huge delta — clamp so the
  // limbs don't windmill for the next few smoothed frames.
  const v = Math.min(raw, PLAYER_SPEED * 1.5);
  g.speed += (v - g.speed) * Math.min(1, dt * 10);
  g.phase += g.speed * dt * 3.1; // ~stride frequency at PLAYER_SPEED
}

/* ----------------------------- materials ------------------------------ */

/** Five shared materials + one unit box; every part is a scaled instance. */
function useAvatarAssets() {
  return useMemo(() => {
    const box = new THREE.BoxGeometry(1, 1, 1);
    const suit = new THREE.MeshStandardMaterial({
      color: PALETTE.metal,
      roughness: 0.7,
      metalness: 0.25,
    });
    const dark = new THREE.MeshStandardMaterial({
      color: PALETTE.bg,
      roughness: 0.85,
      metalness: 0.15,
    });
    const stripe = new THREE.MeshStandardMaterial({
      color: PALETTE.accent,
      emissive: PALETTE.accent,
      emissiveIntensity: 0.55,
      roughness: 0.5,
    });
    const lamp = new THREE.MeshStandardMaterial({
      color: PALETTE.accentBright,
      emissive: PALETTE.accentBright,
      emissiveIntensity: 2.2,
    });
    const led = new THREE.MeshStandardMaterial({
      color: PALETTE.secondary,
      emissive: PALETTE.secondary,
      emissiveIntensity: 1.6,
    });
    return { box, suit, dark, stripe, lamp, led };
  }, []);
}

/* --------------------------- third person ----------------------------- */

/** Small helper: scaled unit-box part sharing geometry + material. */
function Part({
  geo,
  mat,
  p,
  s,
}: {
  geo: THREE.BoxGeometry;
  mat: THREE.Material;
  p: [number, number, number];
  s: [number, number, number];
}) {
  return <mesh geometry={geo} material={mat} position={p} scale={s} />;
}

const HEAD_PITCH_MAX = 0.5;

export function ThirdPersonBody() {
  const a = useAvatarAssets();
  const gait = useMemo(newGait, []);
  const root = useRef<THREE.Group>(null);
  const head = useRef<THREE.Group>(null);
  const torso = useRef<THREE.Group>(null);
  const armL = useRef<THREE.Group>(null);
  const armR = useRef<THREE.Group>(null);
  const legL = useRef<THREE.Group>(null);
  const legR = useRef<THREE.Group>(null);

  useFrame(({ clock }, dt) => {
    const g = root.current;
    if (!g) return;
    stepGait(gait, dt);

    // Model is built facing local +z; PlayerRig forward = (−sin yaw, −cos yaw),
    // and rotation.y = yaw + π maps local +z exactly onto that vector.
    g.position.set(player.x, 0, player.z);
    g.rotation.y = player.yaw + Math.PI;

    const amp = Math.min(gait.speed / PLAYER_SPEED, 1);
    const swing = Math.sin(gait.phase);
    const t = clock.elapsedTime;

    // Walk cycle: legs opposed, arms counter-swing the same-side leg.
    if (legL.current) legL.current.rotation.x = swing * 0.75 * amp;
    if (legR.current) legR.current.rotation.x = -swing * 0.75 * amp;
    if (armL.current) {
      armL.current.rotation.x = -swing * 0.55 * amp;
      armL.current.rotation.z = 0.06 + Math.sin(t * 1.8) * 0.03 * (1 - amp);
    }
    if (armR.current) {
      armR.current.rotation.x = swing * 0.55 * amp;
      armR.current.rotation.z = -0.06 - Math.sin(t * 1.8 + 1) * 0.03 * (1 - amp);
    }
    // Idle breathing fades out as walking takes over.
    if (torso.current) torso.current.position.y = Math.sin(t * 1.8) * 0.008 * (1 - amp);
    // Head follows look pitch, clamped. Positive camera pitch = look up;
    // on a +z-facing head that is negative rotation.x.
    if (head.current) {
      head.current.rotation.x =
        -THREE.MathUtils.clamp(player.pitch, -HEAD_PITCH_MAX, HEAD_PITCH_MAX) * 0.6;
    }
  });

  return (
    <group ref={root}>
      {/* Self-fill: the headlamp points away from the body in third person,
          so without this the Operator reads as a black blob. One cheap light. */}
      <pointLight color="#fde9c8" intensity={2.2} distance={3.8} decay={1.8} position={[0, 2.05, 0.5]} />
      {/* torso group carries chest gear so breathing moves it all */}
      <group ref={torso}>
        <Part geo={a.box} mat={a.suit} p={[0, 1.13, 0]} s={[0.42, 0.62, 0.24]} />
        {/* amber jumpsuit stripes, slightly proud of the chest (no z-fight) */}
        <Part geo={a.box} mat={a.stripe} p={[-0.1, 1.13, 0.125]} s={[0.05, 0.62, 0.012]} />
        <Part geo={a.box} mat={a.stripe} p={[0.1, 1.13, 0.125]} s={[0.05, 0.62, 0.012]} />
        {/* status LED */}
        <Part geo={a.box} mat={a.led} p={[0, 1.32, 0.128]} s={[0.04, 0.04, 0.015]} />
        {/* belt */}
        <Part geo={a.box} mat={a.dark} p={[0, 0.85, 0]} s={[0.44, 0.07, 0.26]} />
        {/* backpack/toolkit on the back (−z) with an amber latch stripe */}
        <Part geo={a.box} mat={a.dark} p={[0, 1.18, -0.2]} s={[0.32, 0.42, 0.16]} />
        <Part geo={a.box} mat={a.stripe} p={[0, 1.18, -0.285]} s={[0.32, 0.04, 0.012]} />
      </group>

      {/* head pivots at the neck */}
      <group ref={head} position={[0, 1.52, 0]}>
        <Part geo={a.box} mat={a.suit} p={[0, 0.17, 0]} s={[0.3, 0.3, 0.3]} />
        <Part geo={a.box} mat={a.dark} p={[0, 0.27, 0]} s={[0.32, 0.06, 0.32]} />
        {/* headlamp on the front of the band */}
        <Part geo={a.box} mat={a.lamp} p={[0, 0.27, 0.17]} s={[0.07, 0.05, 0.03]} />
      </group>

      {/* arms pivot at the shoulders, meshes hang below the pivot */}
      <group ref={armL} position={[-0.28, 1.4, 0]}>
        <Part geo={a.box} mat={a.suit} p={[0, -0.3, 0]} s={[0.13, 0.6, 0.13]} />
        <Part geo={a.box} mat={a.stripe} p={[0, -0.52, 0]} s={[0.14, 0.045, 0.14]} />
        <Part geo={a.box} mat={a.dark} p={[0, -0.63, 0]} s={[0.13, 0.13, 0.13]} />
      </group>
      <group ref={armR} position={[0.28, 1.4, 0]}>
        <Part geo={a.box} mat={a.suit} p={[0, -0.3, 0]} s={[0.13, 0.6, 0.13]} />
        <Part geo={a.box} mat={a.stripe} p={[0, -0.52, 0]} s={[0.14, 0.045, 0.14]} />
        <Part geo={a.box} mat={a.dark} p={[0, -0.63, 0]} s={[0.13, 0.13, 0.13]} />
      </group>

      {/* legs pivot at the hips */}
      <group ref={legL} position={[-0.11, 0.82, 0]}>
        <Part geo={a.box} mat={a.suit} p={[0, -0.36, 0]} s={[0.16, 0.72, 0.16]} />
        <Part geo={a.box} mat={a.dark} p={[0, -0.76, 0.02]} s={[0.17, 0.09, 0.2]} />
      </group>
      <group ref={legR} position={[0.11, 0.82, 0]}>
        <Part geo={a.box} mat={a.suit} p={[0, -0.36, 0]} s={[0.16, 0.72, 0.16]} />
        <Part geo={a.box} mat={a.dark} p={[0, -0.76, 0.02]} s={[0.17, 0.09, 0.2]} />
      </group>
    </group>
  );
}

/* ---------------------------- first person ----------------------------- */

const LOOK_LAG = 12; // 1/s — rotation catches up to the camera at this rate

export function FirstPersonArms() {
  const a = useAvatarAssets();
  const gait = useMemo(newGait, []);
  const rig = useRef<THREE.Group>(null);
  const bob = useRef<THREE.Group>(null);

  useFrame(({ camera }, dt) => {
    const g = rig.current;
    if (!g) return;
    stepGait(gait, dt);

    // Position snaps to the camera (any positional lag reads as detached
    // arms); rotation lags slightly so the viewmodel feels alive. May trail
    // PlayerRig's camera write by one frame depending on mount order — the
    // deliberate look-lag masks it.
    g.position.copy(camera.position);
    g.quaternion.slerp(camera.quaternion, 1 - Math.exp(-LOOK_LAG * dt));

    const amp = Math.min(gait.speed / PLAYER_SPEED, 1);
    const b = bob.current;
    if (b) {
      b.position.y = Math.sin(gait.phase * 2) * 0.02 * amp;
      b.position.x = Math.sin(gait.phase) * 0.012 * amp;
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
      {/* navy sleeve */}
      <Part geo={a.box} mat={a.suit} p={[0, 0, 0]} s={[0.12, 0.12, 0.46]} />
      {/* amber cuff stripe, slightly oversized so it wraps the sleeve */}
      <Part geo={a.box} mat={a.stripe} p={[0, 0, -0.16]} s={[0.126, 0.126, 0.045]} />
      {/* hand */}
      <Part geo={a.box} mat={a.dark} p={[0, 0.005, -0.28]} s={[0.125, 0.13, 0.13]} />
    </group>
  );

  return (
    <group ref={rig}>
      {/* Tiny fill so the navy sleeves read against the dark floor — the
          headlamp cone starts at the camera and barely grazes them. */}
      <pointLight color="#fde9c8" intensity={0.8} distance={1.4} decay={2} position={[0, -0.05, -0.2]} />
      <group ref={bob}>
        {arm(1)}
        {arm(-1)}
      </group>
    </group>
  );
}
