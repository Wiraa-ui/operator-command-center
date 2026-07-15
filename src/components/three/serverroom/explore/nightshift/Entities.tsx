import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { PALETTE } from "../../types";
import { HumanoidFigure } from "../humanoid";
// Written in parallel by the integrator — mutable singleton, read per frame:
// { active, lamp, kirana: { x, z, yaw }, ghost: { x, z, fade } }
import { night } from "./state";

/**
 * Entities — MOKSA.CLOUD night-shift horror cast, all procedural (contract:
 * no GLTF/assets, palette only; dark tones derived from PALETTE.bg, never
 * hardcoded foreign colors). Same animation rule as Avatar.tsx: everything
 * moves via refs inside useFrame, zero React state in frame loops.
 */

/* ------------------------------ shared -------------------------------- */

/** Scaled unit-box part sharing geometry + material (Avatar.tsx pattern). */
function Part({
  geo,
  mat,
  p,
  s,
}: {
  geo: THREE.BufferGeometry;
  mat: THREE.Material;
  p: [number, number, number];
  s: [number, number, number];
}) {
  return <mesh geometry={geo} material={mat} position={p} scale={s} />;
}

/** Darken a palette color without leaving the palette family. */
function darkened(hex: string, k: number): THREE.Color {
  return new THREE.Color(hex).multiplyScalar(k);
}

/* --------------------------- Bu Dewi Kirana ---------------------------- */

const TWO_PI = Math.PI * 2;

/** Near-black navy kebaya family, derived from the palette. */
const KIRANA_LOOK = {
  skin: "#a87c5c",
  hair: darkened(PALETTE.bg, 0.3).getStyle(),
  outfit: darkened(PALETTE.bg, 0.55).getStyle(),
  outfitDark: darkened(PALETTE.bg, 0.45).getStyle(),
  accent: PALETTE.accent,
  height: 1.76,
  hairStyle: "bun",
  glasses: true,
  skirt: true,
  gait: "glide",
  fill: false, // she carries her own flickering emergency light (NightShift)
} as const;

/**
 * KiranaBody — the founder, now a real human figure on the shared humanoid
 * rig. She GLIDES: hands folded, no walk cycle — the stillness is the point.
 * Her round glasses carry the only real light on her (rig pulses them).
 */
export function KiranaBody() {
  return (
    <HumanoidFigure
      look={KIRANA_LOOK}
      sample={(out) => {
        out.x = night.kirana.x;
        out.y = 0;
        out.z = night.kirana.z;
        out.yaw = night.kirana.yaw;
        out.pitch = 0;
      }}
    />
  );
}

/* -------------------------- Anak Pantai 1998 --------------------------- */

const JITTER_HZ = 8; // re-roll tracking error ~8x/s, not per frame
const GHOST_SLICES: {
  p: [number, number, number];
  s: [number, number, number];
  bright: boolean;
}[] = [
  { p: [0, 1.0, 0], s: [0.2, 0.2, 0.12], bright: true }, // head
  { p: [0.01, 0.64, 0], s: [0.24, 0.42, 0.12], bright: false }, // torso
  { p: [0.055, 0.72, 0.012], s: [0.27, 0.06, 0.12], bright: true }, // tear band
  { p: [-0.012, 0.28, 0], s: [0.2, 0.32, 0.1], bright: false }, // hips
  { p: [0.015, 0.07, 0], s: [0.16, 0.14, 0.1], bright: false }, // feet
];

/**
 * VhsGhost — child-sized (~1.1u) figure that reads as broken VHS footage:
 * translucent slices, 8 Hz horizontal tracking jitter, and a rare single-frame
 * sideways tear. fade (0..1) is owned by ./state; we only apply it.
 */
export function VhsGhost() {
  const a = useMemo(() => {
    const box = new THREE.BoxGeometry(1, 1, 1);
    // depthWrite off: translucent slices must not occlude each other.
    const sky = new THREE.MeshBasicMaterial({
      color: PALETTE.secondary,
      transparent: true,
      opacity: 0,
      depthWrite: false,
    });
    // white-blue = secondary pushed toward white (still the sky family).
    const white = new THREE.MeshBasicMaterial({
      color: new THREE.Color(PALETTE.secondary).lerp(new THREE.Color("#ffffff"), 0.65),
      transparent: true,
      opacity: 0,
      depthWrite: false,
    });
    return { box, sky, white };
  }, []);

  const root = useRef<THREE.Group>(null);
  const slices = useRef<(THREE.Mesh | null)[]>([]);
  // Frame-loop scratch state lives in one ref, never in React state.
  const fx = useRef({ acc: 0, flicker: 0.7, nextGlitch: 2.5, glitchX: 0, glitchFrames: 0 });

  useFrame(({ clock }, dt) => {
    const g = root.current;
    if (!g) return;
    const f = fx.current;
    const fade = night.ghost.fade;

    // Fully faded = frozen and invisible; skip raster entirely but keep the
    // hook itself unconditional.
    if (fade <= 0.02) {
      g.visible = false;
      a.sky.opacity = 0;
      a.white.opacity = 0;
      return;
    }
    g.visible = true;

    // Tracking error: re-jitter slice x offsets a few times per second so it
    // reads as tape noise, not smooth motion.
    f.acc += dt;
    if (f.acc >= 1 / JITTER_HZ) {
      f.acc = 0;
      for (let i = 0; i < GHOST_SLICES.length; i++) {
        const m = slices.current[i];
        if (m) m.position.x = GHOST_SLICES[i].p[0] + (Math.random() - 0.5) * 0.04;
      }
      // Occasional dropout frame in the brightness too.
      f.flicker = Math.random() < 0.12 ? 0.15 : 0.55 + Math.random() * 0.45;
    }

    // Rare single-frame sideways tear (whole figure shifts 0.15u and back).
    if (clock.elapsedTime >= f.nextGlitch) {
      f.nextGlitch = clock.elapsedTime + 2 + Math.random();
      f.glitchX = (Math.random() < 0.5 ? -1 : 1) * 0.15;
      f.glitchFrames = 1;
    }
    const tear = f.glitchFrames > 0 ? f.glitchX : 0;
    if (f.glitchFrames > 0) f.glitchFrames--;

    g.position.set(night.ghost.x + tear, 0, night.ghost.z);
    a.sky.opacity = fade * f.flicker * 0.3;
    a.white.opacity = fade * f.flicker * 0.5;
  });

  return (
    <group ref={root} visible={false}>
      {GHOST_SLICES.map((sl, i) => (
        <mesh
          key={i}
          ref={(m) => {
            slices.current[i] = m;
          }}
          geometry={a.box}
          material={sl.bright ? a.white : a.sky}
          position={sl.p}
          scale={sl.s}
        />
      ))}
    </group>
  );
}

/* ----------------------------- ArsipRack ------------------------------- */

/**
 * ArsipRack — ancestor-archive cabinet. The memory core pulses amber while
 * the archive is intact; purging kills the core and releases a thin warm
 * light column (the arwah ascending). `label` is metadata for the parent
 * HUD — no in-scene text per contract, so it is intentionally not rendered.
 */
export function ArsipRack({
  x,
  z,
  purged,
}: {
  x: number;
  z: number;
  purged: boolean;
  label: string;
}) {
  const a = useMemo(() => {
    const box = new THREE.BoxGeometry(1, 1, 1);
    const cabinet = new THREE.MeshStandardMaterial({
      color: darkened(PALETTE.metal, 0.7),
      roughness: 0.8,
      metalness: 0.3,
    });
    const trim = new THREE.MeshStandardMaterial({
      color: PALETTE.slate,
      roughness: 0.6,
      metalness: 0.4,
    });
    // Per-instance: intensity is driven per rack (phase offset from x+z).
    const core = new THREE.MeshStandardMaterial({
      color: PALETTE.accent,
      emissive: PALETTE.accent,
      emissiveIntensity: 1.1,
      roughness: 0.4,
    });
    // Warm white leaning amber, additive so overlapping fog reads as glow.
    const column = new THREE.MeshBasicMaterial({
      color: new THREE.Color(PALETTE.accentBright).lerp(new THREE.Color("#ffffff"), 0.6),
      transparent: true,
      opacity: 0,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    return { box, cabinet, trim, core, column };
  }, []);

  // Phase from position so neighbouring racks never pulse in sync.
  const phase = (x + z) * 1.7;
  const inner = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    if (!purged) {
      // 0.6→1.6 at ~0.8 Hz.
      a.core.emissiveIntensity = 1.1 + Math.sin(t * TWO_PI * 0.8 + phase) * 0.5;
      a.column.opacity = 0;
      return;
    }
    a.core.emissiveIntensity = 0;
    // Released arwah: slow 0.25→0.05 breathing on the column…
    a.column.opacity = 0.15 + Math.sin(t * 1.2 + phase) * 0.1;
    // …plus an inner slab drifting upward on loop for the shimmer.
    const m = inner.current;
    if (m) m.position.y = 2.2 + ((t * 0.5 + phase) % 1) * 2.6;
  });

  // Front (core face, local +z) turned toward the aisle center at x=0.
  const yaw = x < 0 ? Math.PI / 2 : x > 0 ? -Math.PI / 2 : 0;

  return (
    <group position={[x, 0, z]} rotation={[0, yaw, 0]}>
      {/* cabinet 0.9w × 2.0h × 0.6d */}
      <Part geo={a.box} mat={a.cabinet} p={[0, 1, 0]} s={[0.9, 2, 0.6]} />
      {/* slate trim caps top/bottom */}
      <Part geo={a.box} mat={a.trim} p={[0, 1.98, 0]} s={[0.94, 0.06, 0.64]} />
      <Part geo={a.box} mat={a.trim} p={[0, 0.04, 0]} s={[0.94, 0.08, 0.64]} />
      {/* memory core slot at chest height, proud of the front face */}
      <Part geo={a.box} mat={a.core} p={[0, 1.3, 0.305]} s={[0.5, 0.12, 0.02]} />
      {purged && (
        <>
          {/* light column ~3.5u rising above the rack */}
          <Part geo={a.box} mat={a.column} p={[0, 3.75, 0]} s={[0.3, 3.5, 0.3]} />
          {/* upward-drifting shimmer slab inside the column (y set in useFrame) */}
          <mesh
            ref={inner}
            geometry={a.box}
            material={a.column}
            position={[0, 2.2, 0]}
            scale={[0.34, 0.25, 0.34]}
          />
        </>
      )}
    </group>
  );
}
