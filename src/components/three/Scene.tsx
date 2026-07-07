import { useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

/**
 * Scene — the cinematic backdrop for the whole site.
 *
 * A glass-dark torus knot wrapped in a green wireframe hovers beside the
 * hero, drifting with the pointer; a slate/green particle field gives the
 * space depth; FogExp2 swallows the far plane. Scroll pushes the camera so
 * every section keeps a slow parallax life behind the bento panels.
 *
 * Guardrails from the ui-ux-pro-max threejs stack guidelines:
 * - single WebGLRenderer for the page lifetime (this Canvas is global)
 * - dpr capped at 2, particle count well under mobile ceiling (≤2600)
 * - prefers-reduced-motion → static frame (frameloop="demand")
 * - geometry/material created declaratively → R3F disposes them on unmount
 */

const ACCENT = "#22c55e";
const BG = "#0f172a";

function usePrefersReducedMotion() {
  return useMemo(
    () =>
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    [],
  );
}

/** 0 at top of page → 1 after ~1.6 viewport heights of scrolling. */
function scrollProgress(): number {
  const h = window.innerHeight || 1;
  return Math.min(window.scrollY / (h * 1.6), 1);
}

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
    const t = state.clock.elapsedTime;
    if (!reduced) {
      g.rotation.y += dt * 0.16;
      g.rotation.x = Math.sin(t * 0.22) * 0.18;
    }
    const s = scrollProgress();
    const targetX = base.x + state.pointer.x * 0.35 - s * (wide ? 1.4 : 0);
    const targetY = base.y + state.pointer.y * 0.25 + s * 2.6;
    g.position.x = THREE.MathUtils.lerp(g.position.x, targetX, 0.035);
    g.position.y = THREE.MathUtils.lerp(g.position.y, targetY, 0.035);
    const scale = 1 - s * 0.25;
    g.scale.setScalar(THREE.MathUtils.lerp(g.scale.x, scale, 0.05));
  });

  return (
    <group ref={group} position={[base.x, base.y, base.z]}>
      <mesh>
        <torusKnotGeometry args={[1.15, 0.32, 200, 28]} />
        <meshStandardMaterial
          color="#16213c"
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

function Particles({ reduced }: { reduced: boolean }) {
  const points = useRef<THREE.Points>(null);
  const coarse = typeof window !== "undefined" && window.matchMedia("(pointer: coarse)").matches;
  const count = coarse ? 1200 : 2600; // mobile-safe ceiling per stack guideline

  const [positions, colors] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);
    const green = new THREE.Color(ACCENT);
    const slate = new THREE.Color("#7c8db0");
    for (let i = 0; i < count; i++) {
      // Hollow-ish sphere shell so particles read as space, not soup.
      const r = 6 + Math.random() * 9;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      pos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      pos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta) * 0.7;
      pos[i * 3 + 2] = r * Math.cos(phi) - 4;
      const c = Math.random() < 0.22 ? green : slate;
      col[i * 3] = c.r;
      col[i * 3 + 1] = c.g;
      col[i * 3 + 2] = c.b;
    }
    return [pos, col];
  }, [count]);

  useFrame((state, dt) => {
    const p = points.current;
    if (!p) return;
    if (!reduced) p.rotation.y += dt * 0.012;
    p.position.y = scrollProgress() * 2 + state.pointer.y * 0.15;
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

function CameraRig({ reduced }: { reduced: boolean }) {
  useFrame(({ camera, pointer }) => {
    if (reduced) return;
    const s = scrollProgress();
    camera.position.x = THREE.MathUtils.lerp(camera.position.x, pointer.x * 0.3, 0.03);
    camera.position.y = THREE.MathUtils.lerp(camera.position.y, -s * 1.4 + pointer.y * 0.2, 0.04);
    camera.lookAt(0, 0, 0);
  });
  return null;
}

export default function Scene() {
  const reduced = usePrefersReducedMotion();

  return (
    <Canvas
      dpr={[1, 2]}
      frameloop={reduced ? "demand" : "always"}
      camera={{ fov: 42, position: [0, 0, 8.5], near: 0.1, far: 60 }}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
    >
      <fogExp2 attach="fog" args={[BG, 0.055]} />
      <ambientLight intensity={0.45} />
      <pointLight position={[6, 4, 6]} intensity={38} color="#d8fbe5" />
      <pointLight position={[-7, -3, 2]} intensity={22} color="#38bdf8" />
      <CoreKnot reduced={reduced} />
      <Particles reduced={reduced} />
      <CameraRig reduced={reduced} />
    </Canvas>
  );
}
