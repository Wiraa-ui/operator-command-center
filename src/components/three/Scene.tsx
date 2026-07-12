import { useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

/**
 * Scene — the full-3D world the whole site lives inside.
 *
 * The camera rides a keyframed path that descends past one 3D "station" per
 * homepage section (hero knot → server cluster → sentinel → rings → beacon),
 * scrubbed by page scroll with a lag-lerp so it feels cinematic rather than
 * glued to the scrollbar. FogExp2 hides stations until the camera approaches;
 * a follower light travels with the camera so every station is lit.
 *
 * Guardrails from the ui-ux-pro-max threejs stack guidelines:
 * - single WebGLRenderer for the page lifetime (this Canvas is global)
 * - dpr capped at 2, particle count under the mobile ceiling (≤2600)
 * - prefers-reduced-motion → static frame (frameloop="demand")
 * - geometry/material created declaratively → R3F disposes them on unmount
 * - scripted camera path (no orbit controls) — scroll storytelling intent
 *
 * mode="ambient" (subpages): hero station only, no journey — quiet backdrop.
 */

const ACCENT = "#f59e0b"; // amber — user mandate: no green, no purple
const BG = "#0f172a";
const SLATE_METAL = "#16213c";

function usePrefersReducedMotion() {
  return useMemo(
    () =>
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    [],
  );
}

/** 0 at top of the document → 1 at the very bottom. */
function pageProgress(): number {
  const doc = document.documentElement;
  const max = Math.max(doc.scrollHeight - window.innerHeight, 1);
  return Math.min(window.scrollY / max, 1);
}

/* ------------------------------------------------------------------ */
/* Camera path                                                         */
/* ------------------------------------------------------------------ */

type Station = { at: number; cam: THREE.Vector3; look: THREE.Vector3 };

// One station per homepage section. `at` = fraction of full page scroll.
const STATIONS: Station[] = [
  { at: 0.0, cam: new THREE.Vector3(0, 0, 8.5), look: new THREE.Vector3(0, 0, 0) }, // hero — knot
  { at: 0.28, cam: new THREE.Vector3(-2.6, -5.4, 7.6), look: new THREE.Vector3(0.8, -6.2, -0.6) }, // tour — cluster
  { at: 0.55, cam: new THREE.Vector3(2.6, -11.6, 7.2), look: new THREE.Vector3(-0.6, -12.4, -0.6) }, // work — sentinel
  { at: 0.8, cam: new THREE.Vector3(-2.2, -17.6, 7.6), look: new THREE.Vector3(0.6, -18.4, 0) }, // about — rings
  { at: 1.0, cam: new THREE.Vector3(0, -23.4, 9.2), look: new THREE.Vector3(0, -24, 0) }, // cta — beacon
];

const smooth = (t: number) => t * t * (3 - 2 * t); // smoothstep easing per segment

/** Sample camera position + look target along the station path at progress p. */
function samplePath(p: number, outCam: THREE.Vector3, outLook: THREE.Vector3) {
  const last = STATIONS.length - 1;
  if (p <= 0) {
    outCam.copy(STATIONS[0].cam);
    outLook.copy(STATIONS[0].look);
    return;
  }
  for (let i = 0; i < last; i++) {
    const a = STATIONS[i];
    const b = STATIONS[i + 1];
    if (p <= b.at) {
      const t = smooth((p - a.at) / (b.at - a.at));
      outCam.lerpVectors(a.cam, b.cam, t);
      outLook.lerpVectors(a.look, b.look, t);
      return;
    }
  }
  outCam.copy(STATIONS[last].cam);
  outLook.copy(STATIONS[last].look);
}

function CameraRig({ reduced, journey }: { reduced: boolean; journey: boolean }) {
  const sp = useRef(0);
  const camPos = useMemo(() => new THREE.Vector3(), []);
  const look = useMemo(() => new THREE.Vector3(), []);

  useFrame(({ camera, pointer }, dt) => {
    if (reduced) return;
    const target = journey ? pageProgress() : 0;
    // Lag-lerp scrub: frame-rate independent, ~cinematic 1s settle.
    sp.current = THREE.MathUtils.lerp(sp.current, target, Math.min(dt * 3.2, 1));
    samplePath(sp.current, camPos, look);
    camera.position.set(camPos.x + pointer.x * 0.4, camPos.y + pointer.y * 0.25, camPos.z);
    camera.lookAt(look);
  });
  return null;
}

/** Lantern that travels with the camera so every station stays lit. */
function FollowLight() {
  const light = useRef<THREE.PointLight>(null);
  useFrame(({ camera }) => {
    light.current?.position.set(
      camera.position.x + 2.2,
      camera.position.y + 1.6,
      camera.position.z - 2,
    );
  });
  return <pointLight ref={light} intensity={34} color="#d8fbe5" distance={20} decay={1.7} />;
}

/* ------------------------------------------------------------------ */
/* Station 0 — hero torus knot                                         */
/* ------------------------------------------------------------------ */

function CoreKnot({ reduced }: { reduced: boolean }) {
  const group = useRef<THREE.Group>(null);
  const { viewport } = useThree();
  // Wide screens park the knot beside the hero copy; narrow screens center
  // it behind the copy, further back so text wins the contrast fight.
  const wide = viewport.width > 7.5;
  const base = wide ? { x: 2.7, y: 0.15, z: 0 } : { x: 0, y: 0.6, z: -2.2 };

  useFrame((state, dt) => {
    const g = group.current;
    if (!g) return;
    if (!reduced) {
      g.rotation.y += dt * 0.16;
      g.rotation.x = Math.sin(state.clock.elapsedTime * 0.22) * 0.18;
    }
    g.position.x = THREE.MathUtils.lerp(g.position.x, base.x + state.pointer.x * 0.35, 0.035);
    g.position.y = THREE.MathUtils.lerp(g.position.y, base.y + state.pointer.y * 0.25, 0.035);
  });

  return (
    <group ref={group} position={[base.x, base.y, base.z]}>
      <mesh>
        <torusKnotGeometry args={[1.15, 0.32, 200, 28]} />
        <meshStandardMaterial
          color={SLATE_METAL}
          metalness={0.85}
          roughness={0.28}
          emissive={ACCENT}
          emissiveIntensity={0.06}
        />
      </mesh>
      <mesh scale={1.004}>
        <torusKnotGeometry args={[1.15, 0.32, 96, 12]} />
        <meshBasicMaterial color={ACCENT} wireframe transparent opacity={0.3} />
      </mesh>
    </group>
  );
}

/* ------------------------------------------------------------------ */
/* Station 1 — server cluster (instanced cube rack)                    */
/* ------------------------------------------------------------------ */

function Cluster({ reduced }: { reduced: boolean }) {
  const group = useRef<THREE.Group>(null);
  const inst = useRef<THREE.InstancedMesh>(null);
  const COUNT = 27; // 3×3×3 rack

  useEffect(() => {
    const m = inst.current;
    if (!m) return;
    const mat = new THREE.Matrix4();
    const q = new THREE.Quaternion();
    const s = new THREE.Vector3();
    const pos = new THREE.Vector3();
    let i = 0;
    for (let x = -1; x <= 1; x++)
      for (let y = -1; y <= 1; y++)
        for (let z = -1; z <= 1; z++) {
          pos.set(x * 0.95, y * 0.95, z * 0.95);
          const k = 0.72 + Math.random() * 0.28;
          s.set(k, k, k);
          mat.compose(pos, q, s.multiplyScalar(0.5));
          m.setMatrixAt(i++, mat);
        }
    m.instanceMatrix.needsUpdate = true;
  }, []);

  useFrame((state, dt) => {
    const g = group.current;
    if (!g || reduced) return;
    g.rotation.y += dt * 0.1;
    g.rotation.x = Math.sin(state.clock.elapsedTime * 0.18) * 0.12;
    g.position.y = -6.2 + Math.sin(state.clock.elapsedTime * 0.5) * 0.12;
  });

  return (
    <group ref={group} position={[0.8, -6.2, -0.6]}>
      <instancedMesh ref={inst} args={[undefined, undefined, COUNT]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial
          color={SLATE_METAL}
          metalness={0.8}
          roughness={0.32}
          emissive={ACCENT}
          emissiveIntensity={0.1}
        />
      </instancedMesh>
      {/* containment frame */}
      <mesh>
        <boxGeometry args={[3.3, 3.3, 3.3]} />
        <meshBasicMaterial color={ACCENT} wireframe transparent opacity={0.22} />
      </mesh>
    </group>
  );
}

/* ------------------------------------------------------------------ */
/* Station 2 — sentinel icosahedron with orbiting satellites           */
/* ------------------------------------------------------------------ */

function Sentinel({ reduced }: { reduced: boolean }) {
  const core = useRef<THREE.Group>(null);
  const orbit = useRef<THREE.Group>(null);

  useFrame((state, dt) => {
    if (reduced) return;
    if (core.current) {
      core.current.rotation.y += dt * 0.22;
      core.current.position.y = Math.sin(state.clock.elapsedTime * 0.45) * 0.14;
    }
    if (orbit.current) {
      orbit.current.rotation.y += dt * 0.5;
      orbit.current.rotation.z = 0.4;
    }
  });

  return (
    <group position={[-0.6, -12.4, -0.6]}>
      <group ref={core}>
        <mesh>
          <icosahedronGeometry args={[1.35, 0]} />
          <meshStandardMaterial
            color={SLATE_METAL}
            metalness={0.9}
            roughness={0.25}
            emissive="#38bdf8"
            emissiveIntensity={0.08}
            flatShading
          />
        </mesh>
        <mesh scale={1.25}>
          <icosahedronGeometry args={[1.35, 1]} />
          <meshBasicMaterial color={ACCENT} wireframe transparent opacity={0.28} />
        </mesh>
      </group>
      <group ref={orbit}>
        {[0, Math.PI].map((phase) => (
          <mesh key={phase} position={[Math.cos(phase) * 2.4, 0, Math.sin(phase) * 2.4]}>
            <octahedronGeometry args={[0.22, 0]} />
            <meshStandardMaterial
              color="#0b1226"
              metalness={0.7}
              roughness={0.3}
              emissive={ACCENT}
              emissiveIntensity={0.5}
            />
          </mesh>
        ))}
        {/* orbit line */}
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[2.4, 0.008, 8, 96]} />
          <meshBasicMaterial color={ACCENT} transparent opacity={0.2} />
        </mesh>
      </group>
    </group>
  );
}

/* ------------------------------------------------------------------ */
/* Station 3 — gyroscope rings                                         */
/* ------------------------------------------------------------------ */

function Rings({ reduced }: { reduced: boolean }) {
  const a = useRef<THREE.Mesh>(null);
  const b = useRef<THREE.Mesh>(null);
  const c = useRef<THREE.Mesh>(null);

  useFrame((state, dt) => {
    if (reduced) return;
    const t = state.clock.elapsedTime;
    if (a.current) a.current.rotation.x = t * 0.35;
    if (b.current) {
      b.current.rotation.y = t * 0.28;
      b.current.rotation.x = Math.PI / 3;
    }
    if (c.current) {
      c.current.rotation.z = t * 0.2;
      c.current.rotation.x = Math.PI / 2.2;
    }
  });

  return (
    <group position={[0.6, -18.4, 0]}>
      <mesh>
        <sphereGeometry args={[0.42, 32, 32]} />
        <meshStandardMaterial
          color={SLATE_METAL}
          metalness={0.9}
          roughness={0.2}
          emissive={ACCENT}
          emissiveIntensity={0.35}
        />
      </mesh>
      <mesh ref={a}>
        <torusGeometry args={[1.15, 0.03, 12, 96]} />
        <meshStandardMaterial color="#7c8db0" metalness={0.85} roughness={0.3} />
      </mesh>
      <mesh ref={b}>
        <torusGeometry args={[1.6, 0.025, 12, 96]} />
        <meshStandardMaterial
          color={SLATE_METAL}
          metalness={0.85}
          roughness={0.3}
          emissive={ACCENT}
          emissiveIntensity={0.25}
        />
      </mesh>
      <mesh ref={c}>
        <torusGeometry args={[2.05, 0.02, 12, 96]} />
        <meshBasicMaterial color={ACCENT} transparent opacity={0.3} />
      </mesh>
    </group>
  );
}

/* ------------------------------------------------------------------ */
/* Station 4 — beacon (the "let's connect" signal)                     */
/* ------------------------------------------------------------------ */

function Beacon({ reduced }: { reduced: boolean }) {
  const pulse = useRef<THREE.Mesh>(null);
  const light = useRef<THREE.PointLight>(null);

  useFrame((state) => {
    if (reduced) return;
    const t = state.clock.elapsedTime;
    const k = 1 + Math.sin(t * 1.6) * 0.12;
    pulse.current?.scale.setScalar(1.9 * k);
    if (light.current) light.current.intensity = 30 + Math.sin(t * 1.6) * 12;
  });

  return (
    <group position={[0, -24, 0]}>
      <mesh>
        <sphereGeometry args={[0.7, 48, 48]} />
        <meshStandardMaterial
          color="#052e16"
          metalness={0.4}
          roughness={0.25}
          emissive={ACCENT}
          emissiveIntensity={0.9}
        />
      </mesh>
      <mesh ref={pulse}>
        <sphereGeometry args={[0.7, 24, 24]} />
        <meshBasicMaterial color={ACCENT} wireframe transparent opacity={0.14} />
      </mesh>
      <pointLight ref={light} intensity={30} color={ACCENT} distance={14} decay={1.8} />
    </group>
  );
}

/* ------------------------------------------------------------------ */
/* Shared — particle field + path beam                                 */
/* ------------------------------------------------------------------ */

function Particles({ reduced, journey }: { reduced: boolean; journey: boolean }) {
  const points = useRef<THREE.Points>(null);
  const coarse = typeof window !== "undefined" && window.matchMedia("(pointer: coarse)").matches;
  const count = coarse ? 1200 : 2600; // mobile-safe ceiling per stack guideline

  const [positions, colors] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);
    const green = new THREE.Color(ACCENT);
    const slate = new THREE.Color("#7c8db0");
    for (let i = 0; i < count; i++) {
      // Hollow tube around the camera's descent axis so particles read as
      // space the camera travels through, not soup in front of the lens.
      const r = 4.5 + Math.random() * 10;
      const theta = Math.random() * Math.PI * 2;
      pos[i * 3] = Math.cos(theta) * r;
      pos[i * 3 + 1] = journey ? 7 - Math.random() * 36 : 7 - Math.random() * 14;
      pos[i * 3 + 2] = Math.sin(theta) * r - 3;
      const c = Math.random() < 0.22 ? green : slate;
      col[i * 3] = c.r;
      col[i * 3 + 1] = c.g;
      col[i * 3 + 2] = c.b;
    }
    return [pos, col];
  }, [count, journey]);

  useFrame((state, dt) => {
    const p = points.current;
    if (!p) return;
    if (!reduced) p.rotation.y += dt * 0.012;
    p.position.x = state.pointer.x * 0.15;
  });

  return (
    <points ref={points}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-color" args={[colors, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.05}
        vertexColors
        transparent
        opacity={0.55}
        sizeAttenuation
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

/** Faint vertical beam tracing the camera's route between stations. */
function PathBeam() {
  const line = useMemo(() => {
    const pts = STATIONS.map((s) => s.look.clone().add(new THREE.Vector3(0, 0, -1.5)));
    const curve = new THREE.CatmullRomCurve3(pts);
    const geometry = new THREE.BufferGeometry().setFromPoints(curve.getPoints(80));
    const material = new THREE.LineBasicMaterial({
      color: ACCENT,
      transparent: true,
      opacity: 0.12,
    });
    return new THREE.Line(geometry, material);
  }, []);
  useEffect(
    () => () => {
      line.geometry.dispose();
      (line.material as THREE.Material).dispose();
    },
    [line],
  );
  return <primitive object={line} />;
}

/* ------------------------------------------------------------------ */

export default function Scene({ mode = "journey" }: { mode?: "journey" | "ambient" }) {
  const reduced = usePrefersReducedMotion();
  const journey = mode === "journey" && !reduced;

  return (
    <Canvas
      dpr={[1, 2]}
      frameloop={reduced ? "demand" : "always"}
      camera={{ fov: 42, position: [0, 0, 8.5], near: 0.1, far: 60 }}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
    >
      <fogExp2 attach="fog" args={[BG, 0.05]} />
      <ambientLight intensity={0.45} />
      <pointLight position={[6, 4, 6]} intensity={38} color="#d8fbe5" />
      <pointLight position={[-7, -3, 2]} intensity={22} color="#38bdf8" />
      <CoreKnot reduced={reduced} />
      <Particles reduced={reduced} journey={journey} />
      {journey && (
        <>
          <Cluster reduced={reduced} />
          <Sentinel reduced={reduced} />
          <Rings reduced={reduced} />
          <Beacon reduced={reduced} />
          <PathBeam />
          <FollowLight />
        </>
      )}
      <CameraRig reduced={reduced} journey={journey} />
    </Canvas>
  );
}
