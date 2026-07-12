import { useEffect, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import { CORRIDOR, PALETTE, SIDE_X, type Station } from "./types";

/**
 * Cables — the glowing cable network of the server room.
 *
 * Three ceiling runs sag along the corridor (z=+4 → deepest station), one
 * floor run hugs the right corner, and a branch drops from the nearest
 * ceiling run onto every station rack. Every tube is a TubeGeometry over a
 * CatmullRomCurve3; all tubes are merged into ONE BufferGeometry rendered
 * with ONE custom ShaderMaterial → 1 draw call for the whole module.
 *
 * Pulse technique (no textures): TubeGeometry's uv.x runs 0→1 along the
 * curve, so the fragment shader animates `fract(uv.x * repeats - time)` to
 * march several comet-shaped light fronts down each cable. Per-tube phase /
 * tint / repeat-count ride in a custom vec3 attribute (`aCable`) so the
 * merged tubes stay individually varied — repeats is derived from real curve
 * length, keeping pulse size uniform across short branches and long trunks.
 *
 * Reduced motion: uTime is seeded mid-run and never advanced → static frame
 * with pulses visible but frozen. Manually-built geometry/material are
 * disposed on unmount (R3F only auto-disposes declarative ones).
 */

const CEIL_Y = CORRIDOR.height - 0.2; // hang slightly below the ceiling plane
const TRUNK_X = { left: -0.9, center: 0, right: 0.9 } as const;

/** Tube + per-vertex (phase, tint, repeats) tag so it survives the merge. */
function makeTube(
  points: THREE.Vector3[],
  radius: number,
  phase: number,
  tint: number,
): THREE.BufferGeometry {
  const curve = new THREE.CatmullRomCurve3(points);
  const len = curve.getLength();
  const segments = Math.max(16, Math.round(len * 3));
  const geo = new THREE.TubeGeometry(curve, segments, radius, 5, false);
  const repeats = THREE.MathUtils.clamp(Math.round(len / 6), 1, 12);
  const count = geo.attributes.position.count;
  const tag = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    tag[i * 3] = phase;
    tag[i * 3 + 1] = tint;
    tag[i * 3 + 2] = repeats;
  }
  geo.setAttribute("aCable", new THREE.BufferAttribute(tag, 3));
  return geo;
}

/** Ceiling run: anchored every 3.5z, sagging between hangers, mild x wiggle. */
function ceilingRun(baseX: number, endZ: number, seed: number): THREE.Vector3[] {
  const pts: THREE.Vector3[] = [];
  let hanger = true;
  for (let z = 4; z > endZ; z -= 3.5) {
    const x = baseX + Math.sin(z * 0.6 + seed) * 0.14;
    pts.push(new THREE.Vector3(x, hanger ? CEIL_Y + 0.05 : CEIL_Y - 0.14, z));
    hanger = !hanger;
  }
  pts.push(new THREE.Vector3(baseX, CEIL_Y, endZ));
  return pts;
}

/** Floor run: hugs the right corner of the corridor, slight drift. */
function floorRun(endZ: number): THREE.Vector3[] {
  const cornerX = CORRIDOR.width / 2 - 0.3;
  const pts: THREE.Vector3[] = [];
  for (let z = 4; z > endZ; z -= 3.5) {
    pts.push(new THREE.Vector3(cornerX - Math.abs(Math.sin(z * 0.45)) * 0.22, 0.06, z));
  }
  pts.push(new THREE.Vector3(cornerX, 0.06, endZ));
  return pts;
}

/** Branch: leaves the ceiling run above the station, drops onto the rack. */
function branchRun(station: Station): THREE.Vector3[] {
  const xEnd = SIDE_X[station.side];
  const xStart = TRUNK_X[station.side];
  // Center stations get a dangling drop into the aisle; side racks land on top.
  const yEnd = station.side === "center" ? 2.8 : 2.35;
  return [
    new THREE.Vector3(xStart, CEIL_Y - 0.02, station.z),
    new THREE.Vector3(THREE.MathUtils.lerp(xStart, xEnd, 0.4), CEIL_Y - 0.45, station.z - 0.12),
    new THREE.Vector3(xEnd * 0.92, 3.0, station.z),
    new THREE.Vector3(xEnd, yEnd, station.z),
  ];
}

function buildNetwork(stations: Station[]): THREE.BufferGeometry {
  const endZ = Math.min(...stations.map((s) => s.z)) - 3;
  const parts: THREE.BufferGeometry[] = [];

  // Trunks: 3 ceiling (amber, amber, sky) + 1 floor (sky), staggered phases.
  parts.push(makeTube(ceilingRun(TRUNK_X.left, endZ, 1.3), 0.045, 0.0, 0));
  parts.push(makeTube(ceilingRun(TRUNK_X.center, endZ, 4.1), 0.045, 0.37, 0));
  parts.push(makeTube(ceilingRun(TRUNK_X.right, endZ, 2.6), 0.045, 0.74, 1));
  parts.push(makeTube(floorRun(endZ), 0.05, 0.5, 1));

  // Branches: amber by default; skills/status pulse sky (secondary accent).
  stations.forEach((s, i) => {
    const tint = s.kind === "skills" || s.kind === "status" ? 1 : 0;
    parts.push(makeTube(branchRun(s), 0.03, (i * 0.37) % 1, tint));
  });

  const merged = mergeGeometries(parts);
  parts.forEach((g) => g.dispose());
  return merged ?? new THREE.BufferGeometry();
}

function makeMaterial(): THREE.ShaderMaterial {
  return new THREE.ShaderMaterial({
    uniforms: {
      uTime: { value: 4.2 }, // seeded mid-run so reduced-motion still shows pulses
      uBase: { value: new THREE.Color(PALETTE.metal) },
      uPulseA: { value: new THREE.Color(PALETTE.accent) },
      uPulseB: { value: new THREE.Color(PALETTE.secondary) },
      uHead: { value: new THREE.Color(PALETTE.accentBright) },
    },
    vertexShader: /* glsl */ `
      attribute vec3 aCable; // x: phase, y: tint (0 amber / 1 sky), z: repeats
      varying vec2 vUv;
      varying vec3 vNormal;
      varying vec3 vCable;
      void main() {
        vUv = uv;
        vNormal = normalMatrix * normal;
        vCable = aCable;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: /* glsl */ `
      uniform float uTime;
      uniform vec3 uBase;
      uniform vec3 uPulseA;
      uniform vec3 uPulseB;
      uniform vec3 uHead;
      varying vec2 vUv;
      varying vec3 vNormal;
      varying vec3 vCable;
      void main() {
        // Cheap view-space "headlight" so the tube reads round without lights.
        float shade = 0.45 + 0.55 * max(dot(normalize(vNormal), vec3(0.0, 0.35, 0.94)), 0.0);
        // Several comet fronts marching along the tube (uv.x = 0..1 over length).
        float head = fract(vUv.x * vCable.z - uTime * 0.6 - vCable.x);
        float comet = pow(1.0 - head, 7.0); // sharp head, decaying tail
        // Faint idle glow with a slow per-cable flicker.
        float idle = 0.12 + 0.05 * sin(uTime * 2.0 + vCable.x * 6.2832);
        vec3 pulseColor = mix(uPulseA, uPulseB, vCable.y);
        vec3 color = uBase * shade
          + pulseColor * (idle + comet * 1.15)
          + uHead * comet * comet * 0.9;
        gl_FragColor = vec4(color, 1.0);
      }
    `,
  });
}

export function Cables({ stations, reduced }: { stations: Station[]; reduced: boolean }) {
  const geometry = useMemo(() => buildNetwork(stations), [stations]);
  const material = useMemo(() => makeMaterial(), []);

  // Imperatively-built resources must be disposed by hand on unmount.
  useEffect(
    () => () => {
      geometry.dispose();
      material.dispose();
    },
    [geometry, material],
  );

  useFrame((_, dt) => {
    if (reduced) return; // frozen uTime → static pulses
    // Mutating a uniform per frame is the standard R3F escape hatch —
    // routing this through React state would re-render 60×/s.
    // eslint-disable-next-line react-hooks/immutability
    material.uniforms.uTime.value += dt;
  });

  return <mesh geometry={geometry} material={material} />;
}
