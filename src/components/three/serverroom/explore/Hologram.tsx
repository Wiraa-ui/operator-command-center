import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { PALETTE } from "../types";
import { HEART_POS } from "./layout";

/**
 * Hologram — a shader-driven holographic globe projected above the server
 * heart: fresnel edge glow, rolling scanlines, subtle flicker, amber↔sky
 * drift. Pure GLSL (no textures, no deps) per the room contract; additive
 * and depthWrite-off so it reads as light, not glass. Reduced motion keeps
 * the projection but freezes time and spin.
 */

const VERT = /* glsl */ `
  varying vec3 vNormal;
  varying vec3 vWorld;
  void main() {
    vNormal = normalize(normalMatrix * normal);
    vWorld = (modelMatrix * vec4(position, 1.0)).xyz;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const FRAG = /* glsl */ `
  uniform float uTime;
  uniform vec3 uAmber;
  uniform vec3 uSky;
  varying vec3 vNormal;
  varying vec3 vWorld;
  void main() {
    // View-space normal: |z| ~ facing the camera, rim where it falls to 0.
    float fresnel = pow(1.0 - abs(normalize(vNormal).z), 2.0);
    float scan = 0.5 + 0.5 * sin(vWorld.y * 46.0 - uTime * 3.4);
    float flicker = 0.9 + 0.1 * sin(uTime * 21.0) * sin(uTime * 6.3);
    vec3 color = mix(uAmber, uSky, 0.35 + 0.3 * sin(uTime * 0.6));
    float alpha = (0.10 + 0.85 * fresnel) * (0.5 + 0.5 * scan) * flicker;
    gl_FragColor = vec4(color * (0.75 + fresnel), alpha);
  }
`;

export function Hologram({ reduced }: { reduced: boolean }) {
  const globe = useRef<THREE.Mesh>(null);
  const wire = useRef<THREE.Mesh>(null);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uAmber: { value: new THREE.Color(PALETTE.accent) },
      uSky: { value: new THREE.Color(PALETTE.secondary) },
    }),
    [],
  );

  useFrame((_, dt) => {
    if (reduced) return;
    uniforms.uTime.value += dt;
    if (globe.current) globe.current.rotation.y += dt * 0.4;
    if (wire.current) wire.current.rotation.y -= dt * 0.15;
  });

  return (
    <group position={[HEART_POS.x, 3.35, HEART_POS.z]}>
      {/* Holographic body — the shader does all the work. */}
      <mesh ref={globe}>
        <icosahedronGeometry args={[0.52, 3]} />
        <shaderMaterial
          vertexShader={VERT}
          fragmentShader={FRAG}
          uniforms={uniforms}
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          side={THREE.DoubleSide}
        />
      </mesh>
      {/* Faint counter-rotating lat/long cage sells the "projection". */}
      <mesh ref={wire}>
        <sphereGeometry args={[0.58, 12, 8]} />
        <meshBasicMaterial
          color={PALETTE.secondary}
          wireframe
          transparent
          opacity={0.14}
          toneMapped={false}
        />
      </mesh>
      {/* Light cone from the heart's emitter up to the globe. */}
      <mesh position={[0, -0.72, 0]}>
        <coneGeometry args={[0.5, 1.1, 24, 1, true]} />
        <meshBasicMaterial
          color={PALETTE.secondary}
          transparent
          opacity={0.05}
          side={THREE.DoubleSide}
          depthWrite={false}
          toneMapped={false}
        />
      </mesh>
    </group>
  );
}
