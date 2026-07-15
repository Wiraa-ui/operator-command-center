import { useRef } from "react";
import { Html } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { PALETTE } from "../types";
import { HumanoidFigure, type HumanoidLook } from "./humanoid";
import { peerState } from "./online";
import { useExplore } from "./store";

/**
 * OnlinePlayers — other logged-in visitors, rendered as translucent sky-tone
 * figures on the shared humanoid rig ("hantu pengunjung", ≤15 by server cap).
 * Membership comes through the store; per-frame motion lerps through
 * `peerState` so the 5 Hz network updates read as smooth walking.
 */

const PEER_LOOK: HumanoidLook = {
  skin: "#c99a72",
  hair: "#182740",
  outfit: "#1d3a55",
  outfitDark: "#132436",
  accent: PALETTE.secondary,
  opacity: 0.55,
  fill: false,
};

const mono = "var(--font-op-mono, monospace)";
const LERP_RATE = 8; // 1/s toward the last network position

function PeerFigure({ name }: { name: string }) {
  const tag = useRef<THREE.Group>(null);

  // Parent hook registers before the child figure's, so the lerp always runs
  // first and the rig samples fresh coordinates the same frame.
  useFrame((_, dt) => {
    const m = peerState.get(name);
    if (!m || dt <= 0) return;
    const k = 1 - Math.exp(-LERP_RATE * dt);
    m.cx += (m.x - m.cx) * k;
    m.cz += (m.z - m.cz) * k;
    const dy = Math.atan2(Math.sin(m.yaw - m.cyaw), Math.cos(m.yaw - m.cyaw));
    m.cyaw += dy * k;
    tag.current?.position.set(m.cx, 2.12, m.cz);
  });

  return (
    <group>
      <group ref={tag}>
        <Html center distanceFactor={3.2} style={{ pointerEvents: "none", userSelect: "none" }}>
          <div
            style={{
              fontFamily: mono,
              fontSize: 11,
              letterSpacing: "0.18em",
              color: PALETTE.secondary,
              background: "rgba(11,17,32,0.75)",
              border: "1px solid rgba(56,189,248,0.35)",
              borderRadius: 6,
              padding: "2px 8px",
              whiteSpace: "nowrap",
            }}
          >
            {name}
          </div>
        </Html>
      </group>
      <HumanoidFigure
        look={PEER_LOOK}
        sample={(out) => {
          const m = peerState.get(name);
          if (!m) return;
          out.x = m.cx;
          out.y = 0;
          out.z = m.cz;
          out.yaw = m.cyaw;
          out.pitch = 0;
        }}
      />
    </group>
  );
}

export function OnlinePlayers() {
  const peers = useExplore((s) => s.onlinePeers);
  return (
    <>
      {peers.map((n) => (
        <PeerFigure key={n} name={n} />
      ))}
    </>
  );
}
