import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

/**
 * humanoid — shared organic character rig for EXPLORE mode (user mandate
 * 2026-07-16: "karakter natural jangan kotak-kotak, harus seperti manusia").
 *
 * One canonical 1.7u human built from capsules/spheres with articulated
 * shoulders, elbows, hips and knees, plus life signals (breathing, blinking,
 * idle head drift). Consumers describe a person with `HumanoidLook` and feed
 * a per-frame `sample` that writes the transform — the rig derives its own
 * gait from position deltas, so drivers (player singleton, Kirana AI, remote
 * presence players) never think about animation.
 *
 * Same frame rules as Avatar.tsx: refs + useFrame only, zero React state.
 */

export interface HumanoidLook {
  skin: string;
  hair: string;
  /** Torso + sleeves. */
  outfit: string;
  /** Trousers/skirt. */
  outfitDark: string;
  /** Emissive accent (chest strip / brooch). Omit for none. */
  accent?: string;
  height?: number; // meters-ish world units, default 1.7
  hairStyle?: "crop" | "bun";
  glasses?: boolean;
  headlamp?: boolean;
  /** Floor-length skirt replaces the legs (Kirana's kebaya). */
  skirt?: boolean;
  gait?: "walk" | "glide";
  /** <1 renders the whole figure translucent (remote presence "ghosts"). */
  opacity?: number;
  /** Small warm fill light so the figure reads in the dark corridor. */
  fill?: boolean;
}

export interface HumanoidPose {
  x: number;
  y: number;
  z: number;
  /** Rig convention (PlayerRig): forward = (−sin yaw, −cos yaw). */
  yaw: number;
  pitch: number;
}

const CANON_H = 1.7;
const STRIDE_FREQ = 3.1; // phase rad per world unit, matches old Avatar gait
const HEAD_PITCH_MAX = 0.5;

/* ----------------------------- materials ------------------------------ */

function useLookAssets(look: HumanoidLook) {
  const opacity = look.opacity ?? 1;
  return useMemo(() => {
    const translucent = opacity < 1;
    const std = (color: string, roughness: number, metalness = 0.05) =>
      new THREE.MeshStandardMaterial({
        color,
        roughness,
        metalness,
        transparent: translucent,
        opacity,
      });
    const skin = std(look.skin, 0.62);
    const hair = std(look.hair, 0.92);
    const cloth = std(look.outfit, 0.82);
    const clothDark = std(look.outfitDark, 0.86);
    const dark = std("#0b1120", 0.85);
    const eye = std("#101623", 0.35);
    const accent = new THREE.MeshStandardMaterial({
      color: look.accent ?? "#f59e0b",
      emissive: look.accent ?? "#f59e0b",
      emissiveIntensity: 0.8,
      roughness: 0.45,
      transparent: translucent,
      opacity,
    });
    return { skin, hair, cloth, clothDark, dark, eye, accent };
  }, [look.skin, look.hair, look.outfit, look.outfitDark, look.accent, opacity]);
}

/** Capsule helper: total height = len + 2r, axis y, centered on `p`. */
function Cap({
  mat,
  p,
  r,
  len,
  s,
  rot,
}: {
  mat: THREE.Material;
  p: [number, number, number];
  r: number;
  len: number;
  s?: [number, number, number];
  rot?: [number, number, number];
}) {
  return (
    <mesh position={p} scale={s} rotation={rot} material={mat}>
      <capsuleGeometry args={[r, len, 6, 14]} />
    </mesh>
  );
}

function Ball({
  mat,
  p,
  r,
  s,
  meshRef,
}: {
  mat: THREE.Material;
  p: [number, number, number];
  r: number;
  s?: [number, number, number];
  meshRef?: (m: THREE.Mesh | null) => void;
}) {
  return (
    <mesh ref={meshRef} position={p} scale={s} material={mat}>
      <sphereGeometry args={[r, 18, 14]} />
    </mesh>
  );
}

/* -------------------------------- rig --------------------------------- */

export function HumanoidFigure({
  look,
  sample,
  maxSpeed = 3.4,
}: {
  look: HumanoidLook;
  /** Called once per frame; write the current transform into `out`. */
  sample: (out: HumanoidPose) => void;
  maxSpeed?: number;
}) {
  const a = useLookAssets(look);
  const gaitMode = look.gait ?? "walk";

  const root = useRef<THREE.Group>(null);
  const chest = useRef<THREE.Group>(null);
  const head = useRef<THREE.Group>(null);
  const shL = useRef<THREE.Group>(null);
  const shR = useRef<THREE.Group>(null);
  const elL = useRef<THREE.Group>(null);
  const elR = useRef<THREE.Group>(null);
  const hipL = useRef<THREE.Group>(null);
  const hipR = useRef<THREE.Group>(null);
  const kneeL = useRef<THREE.Group>(null);
  const kneeR = useRef<THREE.Group>(null);
  const eyes = useRef<(THREE.Mesh | null)[]>([]);

  // Frame-loop scratch (gait + blink), never React state.
  const fx = useRef({
    pose: { x: 0, y: 0, z: 0, yaw: 0, pitch: 0 } as HumanoidPose,
    px: 0,
    pz: 0,
    init: false,
    speed: 0,
    phase: 0,
    nextBlink: 2 + Math.random() * 3,
    blinkUntil: 0,
  });

  useFrame(({ clock }, dt) => {
    const g = root.current;
    if (!g || dt <= 0) return;
    const f = fx.current;
    const t = clock.elapsedTime;
    sample(f.pose);

    g.position.set(f.pose.x, f.pose.y, f.pose.z);
    g.rotation.y = f.pose.yaw + Math.PI; // model faces local +z

    // Gait from position deltas (teleport clamp, one-pole smoothing).
    if (!f.init) {
      f.px = f.pose.x;
      f.pz = f.pose.z;
      f.init = true;
    }
    const raw = Math.hypot(f.pose.x - f.px, f.pose.z - f.pz) / dt;
    f.px = f.pose.x;
    f.pz = f.pose.z;
    const v = Math.min(raw, maxSpeed * 1.5);
    f.speed += (v - f.speed) * Math.min(1, dt * 10);
    f.phase += f.speed * dt * STRIDE_FREQ;

    const amp = Math.min(f.speed / maxSpeed, 1);
    const swing = Math.sin(f.phase);

    if (gaitMode === "walk") {
      // Legs opposed; knees flex mid-swing plus a small constant soften.
      if (hipL.current) hipL.current.rotation.x = swing * 0.68 * amp;
      if (hipR.current) hipR.current.rotation.x = -swing * 0.68 * amp;
      if (kneeL.current)
        kneeL.current.rotation.x = -(0.08 + Math.max(0, Math.sin(f.phase - 0.9)) * 0.85) * amp;
      if (kneeR.current)
        kneeR.current.rotation.x =
          -(0.08 + Math.max(0, Math.sin(f.phase + Math.PI - 0.9)) * 0.85) * amp;
      // Arms counter-swing, elbows keep a natural resting flex.
      if (shL.current) {
        shL.current.rotation.x = -swing * 0.48 * amp;
        shL.current.rotation.z = 0.08 + Math.sin(t * 1.7) * 0.02 * (1 - amp);
      }
      if (shR.current) {
        shR.current.rotation.x = swing * 0.48 * amp;
        shR.current.rotation.z = -0.08 - Math.sin(t * 1.7 + 1) * 0.02 * (1 - amp);
      }
      if (elL.current) elL.current.rotation.x = 0.22 + Math.max(0, swing) * 0.4 * amp;
      if (elR.current) elR.current.rotation.x = 0.22 + Math.max(0, -swing) * 0.4 * amp;
      // Chest: breathing at rest, slight lean into motion.
      if (chest.current) {
        chest.current.rotation.x = amp * 0.07;
        chest.current.position.y = Math.sin(t * 1.7) * 0.008 * (1 - amp);
      }
    } else {
      // Glide (Kirana): hands folded, stillness is the point.
      if (shL.current) {
        shL.current.rotation.x = 0.5;
        shL.current.rotation.z = 0.28;
      }
      if (shR.current) {
        shR.current.rotation.x = 0.5;
        shR.current.rotation.z = -0.28;
      }
      if (elL.current) elL.current.rotation.x = 1.05;
      if (elR.current) elR.current.rotation.x = 1.05;
      if (chest.current) {
        chest.current.rotation.x = 0;
        chest.current.position.y = Math.sin(t * 4.4) * 0.012;
        chest.current.rotation.z = Math.sin(t * 0.45) * 0.012;
      }
    }

    // Head: look pitch + idle micro-drift when still.
    if (head.current) {
      head.current.rotation.x =
        -THREE.MathUtils.clamp(f.pose.pitch, -HEAD_PITCH_MAX, HEAD_PITCH_MAX) * 0.6;
      head.current.rotation.y = Math.sin(t * 0.31) * 0.05 * (1 - amp);
    }

    // Blink: eyes squash shut for ~0.12s every 2–5s.
    if (t >= f.nextBlink) {
      f.blinkUntil = t + 0.12;
      f.nextBlink = t + 2 + Math.random() * 3;
    }
    const lid = t < f.blinkUntil ? 0.12 : 1;
    for (const e of eyes.current) if (e) e.scale.y = lid;

    // Glasses glint: slow pulse (Kirana's signature light).
    if (look.glasses) a.accent.emissiveIntensity = 1.4 + Math.sin(t * 0.9) * 0.6;
  });

  const scale = (look.height ?? CANON_H) / CANON_H;
  const hairStyle = look.hairStyle ?? "crop";

  /* Canonical proportions (1.7u): head center 1.60, shoulders 1.415,
     hips 0.95, knees at hip−0.44, ground 0. */
  return (
    <group ref={root}>
      <group scale={scale}>
        {look.fill !== false && (
          <pointLight
            color="#fde9c8"
            intensity={look.opacity != null && look.opacity < 1 ? 0.9 : 1.8}
            distance={3.8}
            decay={1.8}
            position={[0, 1.9, 0.45]}
          />
        )}

        {/* pelvis */}
        <Cap mat={a.clothDark} p={[0, 0.97, 0]} r={0.12} len={0.08} s={[1.12, 1, 0.82]} />

        {/* chest group: breathing + lean move the whole upper body */}
        <group ref={chest}>
          <Cap mat={a.cloth} p={[0, 1.24, 0]} r={0.135} len={0.24} s={[1.22, 1, 0.78]} />
          {look.accent && (
            <mesh position={[0, 1.29, 0.115]} material={a.accent}>
              <boxGeometry args={[0.022, 0.13, 0.012]} />
            </mesh>
          )}

          {/* neck + head */}
          <mesh position={[0, 1.455, 0]} material={a.skin}>
            <cylinderGeometry args={[0.042, 0.05, 0.1, 12]} />
          </mesh>
          <group ref={head} position={[0, 1.52, 0]}>
            <Ball mat={a.skin} p={[0, 0.08, 0]} r={0.11} s={[0.92, 1.06, 0.98]} />
            {/* nose + ears — tiny, but they break the mannequin look */}
            <Ball mat={a.skin} p={[0, 0.065, 0.105]} r={0.018} s={[0.8, 1, 1]} />
            <Ball mat={a.skin} p={[-0.1, 0.08, 0]} r={0.022} s={[0.5, 1, 0.8]} />
            <Ball mat={a.skin} p={[0.1, 0.08, 0]} r={0.022} s={[0.5, 1, 0.8]} />
            {/* eyes (blink via scale.y) */}
            <Ball
              mat={a.eye}
              p={[-0.042, 0.095, 0.092]}
              r={0.0125}
              meshRef={(m) => {
                eyes.current[0] = m;
              }}
            />
            <Ball
              mat={a.eye}
              p={[0.042, 0.095, 0.092]}
              r={0.0125}
              meshRef={(m) => {
                eyes.current[1] = m;
              }}
            />
            {/* hair */}
            <Ball mat={a.hair} p={[0, 0.115, -0.012]} r={0.114} s={[0.98, 0.9, 1]} />
            <Ball mat={a.hair} p={[0, 0.055, -0.075]} r={0.095} s={[1, 0.95, 0.75]} />
            {hairStyle === "bun" && <Ball mat={a.hair} p={[0, 0.16, -0.09]} r={0.05} />}
            {look.headlamp && (
              <>
                <mesh position={[0, 0.145, 0]} rotation={[Math.PI / 2, 0, 0]} material={a.dark}>
                  <torusGeometry args={[0.112, 0.016, 8, 20]} />
                </mesh>
                <mesh position={[0, 0.145, 0.112]} material={a.accent}>
                  <boxGeometry args={[0.055, 0.035, 0.03]} />
                </mesh>
              </>
            )}
            {look.glasses && (
              <>
                <mesh position={[-0.045, 0.09, 0.098]} material={a.accent}>
                  <torusGeometry args={[0.032, 0.006, 6, 16]} />
                </mesh>
                <mesh position={[0.045, 0.09, 0.098]} material={a.accent}>
                  <torusGeometry args={[0.032, 0.006, 6, 16]} />
                </mesh>
              </>
            )}
          </group>

          {/* arms: shoulder pivot → upper arm; elbow pivot → forearm + hand */}
          {([-1, 1] as const).map((side) => (
            <group
              key={side}
              ref={side < 0 ? shL : shR}
              position={[0.185 * side, 1.415, 0]}
              rotation={[0, 0, -0.08 * side]}
            >
              <Cap mat={a.cloth} p={[0, -0.13, 0]} r={0.042} len={0.18} />
              <group ref={side < 0 ? elL : elR} position={[0, -0.27, 0]}>
                <Cap mat={a.cloth} p={[0, -0.11, 0]} r={0.037} len={0.15} />
                <Ball mat={a.skin} p={[0, -0.245, 0.005]} r={0.045} s={[0.85, 1.15, 0.8]} />
              </group>
            </group>
          ))}
        </group>

        {/* lower body: articulated legs, or a floor-length skirt */}
        {look.skirt ? (
          <mesh position={[0, 0.5, 0]} material={a.clothDark}>
            <cylinderGeometry args={[0.135, 0.24, 0.98, 16]} />
          </mesh>
        ) : (
          ([-1, 1] as const).map((side) => (
            <group key={side} ref={side < 0 ? hipL : hipR} position={[0.088 * side, 0.95, 0]}>
              <Cap mat={a.clothDark} p={[0, -0.17, 0]} r={0.06} len={0.22} />
              <group ref={side < 0 ? kneeL : kneeR} position={[0, -0.44, 0]}>
                <Cap mat={a.clothDark} p={[0, -0.155, 0]} r={0.05} len={0.2} />
                <Ball mat={a.dark} p={[0, -0.475, 0.045]} r={0.072} s={[0.85, 0.5, 1.75]} />
              </group>
            </group>
          ))
        )}
      </group>
    </group>
  );
}
