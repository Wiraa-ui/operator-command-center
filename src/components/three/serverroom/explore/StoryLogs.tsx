import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import type * as THREE from "three";
import { PALETTE } from "../types";
import { STORY_LOGS } from "./story-logs";
import { useExplore } from "./store";

/**
 * StoryLogs — the seven LOG OPERATOR datapads in the world: small glowing
 * slates that bob until collected, then settle dim (still readable again).
 * Interact wiring lives in PlayerRig; the card modal in StoryLogModal.
 */

export function StoryLogs({ reduced }: { reduced: boolean }) {
  const collected = useExplore((s) => s.collectedLogs);
  const group = useRef<(THREE.Group | null)[]>([]);

  useFrame(({ clock }) => {
    if (reduced) return;
    const t = clock.elapsedTime;
    group.current.forEach((g, i) => {
      if (!g) return;
      const done = collected.includes(STORY_LOGS[i].id);
      g.position.y = done ? 1.05 : 1.15 + Math.sin(t * 1.6 + i * 1.3) * 0.07;
      g.rotation.y = done ? 0 : t * 0.5 + i;
    });
  });

  return (
    <group>
      {STORY_LOGS.map((log, i) => {
        const done = collected.includes(log.id);
        return (
          <group key={log.id} position={[log.x, 0, log.z]}>
            <group
              ref={(g) => {
                group.current[i] = g;
              }}
              position={[0, 1.15, 0]}
            >
              <mesh>
                <boxGeometry args={[0.26, 0.36, 0.03]} />
                <meshStandardMaterial
                  color={PALETTE.metal}
                  emissive={done ? PALETTE.slate : PALETTE.secondary}
                  emissiveIntensity={done ? 0.15 : 0.9}
                  metalness={0.6}
                  roughness={0.35}
                />
              </mesh>
            </group>
            {!done && (
              <pointLight
                position={[0, 1.5, 0]}
                intensity={1.6}
                color={PALETTE.secondary}
                distance={2.6}
                decay={1.8}
              />
            )}
          </group>
        );
      })}
    </group>
  );
}
