import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { PALETTE } from "../types";
import type { ExploreMap } from "./layout";

/**
 * Dust — drifting motes in the room air. One THREE.Points draw call with a
 * tiny GLSL pair: each mote falls slowly (wrapped in the vertex shader, so
 * positions never touch the CPU), shimmers, and fades by distance. With the
 * bloom pass on, motes catch the light like a real machine hall.
 */

const COUNT = 260;

const VERT = /* glsl */ `
  uniform float uTime;
  attribute float aSeed;
  varying float vTwinkle;
  void main() {
    vec3 p = position;
    // Slow fall, wrapped over the room height; horizontal sway per seed.
    p.y = 3.9 - mod(3.9 - p.y + uTime * (0.06 + aSeed * 0.05), 3.7);
    p.x += sin(uTime * 0.3 + aSeed * 40.0) * 0.25;
    p.z += cos(uTime * 0.22 + aSeed * 31.0) * 0.25;
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_PointSize = 42.0 / max(1.0, -mv.z);
    vTwinkle = 0.55 + 0.45 * sin(uTime * (1.2 + aSeed * 2.0) + aSeed * 90.0);
    gl_Position = projectionMatrix * mv;
  }
`;

const FRAG = /* glsl */ `
  uniform vec3 uColor;
  varying float vTwinkle;
  void main() {
    // Round sprite with soft edge; discard the corners.
    vec2 c = gl_PointCoord - 0.5;
    float d = length(c);
    if (d > 0.5) discard;
    float a = smoothstep(0.5, 0.05, d) * 0.35 * vTwinkle;
    gl_FragColor = vec4(uColor, a);
  }
`;

export function Dust({ map, reduced }: { map: ExploreMap; reduced: boolean }) {
  const mat = useRef<THREE.ShaderMaterial>(null);

  const { geometry, uniforms } = useMemo(() => {
    const pos = new Float32Array(COUNT * 3);
    const seed = new Float32Array(COUNT);
    const b = map.bounds;
    for (let i = 0; i < COUNT; i++) {
      pos[i * 3] = b.xMin + Math.random() * (b.xMax - b.xMin);
      pos[i * 3 + 1] = 0.2 + Math.random() * 3.7;
      pos[i * 3 + 2] = b.zMin + Math.random() * (b.zMax - b.zMin);
      seed[i] = Math.random();
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    g.setAttribute("aSeed", new THREE.BufferAttribute(seed, 1));
    return {
      geometry: g,
      uniforms: {
        uTime: { value: 0 },
        uColor: { value: new THREE.Color(PALETTE.accentBright) },
      },
    };
  }, [map]);

  useFrame((_, dt) => {
    if (reduced) return;
    uniforms.uTime.value += dt;
  });

  return (
    <points geometry={geometry} frustumCulled={false}>
      <shaderMaterial
        ref={mat}
        vertexShader={VERT}
        fragmentShader={FRAG}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}
