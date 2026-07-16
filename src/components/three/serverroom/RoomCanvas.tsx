import { useEffect, useMemo } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import { PALETTE, type Station } from "./types";
import { World } from "./World";
import { Cables } from "./Cables";
import { Panels } from "./Panels";
import { StatusRack } from "./StatusRack";
import { RoomCameraRig } from "./CameraRig";
import { Dust } from "./explore/Dust";
import { ExploreWorld } from "./explore/ExploreWorld";
import { DOOR_GAPS, type ExploreMap } from "./explore/layout";
import { PlayerRig } from "./explore/PlayerRig";
import { StoryLogs } from "./explore/StoryLogs";
import { useExplore } from "./explore/store";
import { autoFx, PostFX } from "./PostFX";

/**
 * RoomCanvas — assembles The Server Room (single WebGLRenderer for the page,
 * per the threejs stack guardrails; the classic SceneCanvas is never mounted
 * alongside this). Fog + ambient are owned here, not by the modules
 * (CONTRACT.md). Default export so the three.js chunk stays lazy.
 *
 * mode="walk"    → scroll-dolly corridor (RoomCameraRig).
 * mode="explore" → ROOT ACCESS: first-person PlayerRig + LAB/CORE world.
 */
export default function RoomCanvas({
  stations,
  reduced,
  mode = "walk",
  map = null,
  capDpr = 2,
}: {
  stations: Station[];
  reduced: boolean;
  mode?: "walk" | "explore";
  /** Explore map (required when mode="explore"). */
  map?: ExploreMap | null;
  capDpr?: number;
}) {
  const statusStation = useMemo(() => stations.find((s) => s.kind === "status"), [stations]);
  const explore = mode === "explore" && map !== null;
  // Settings menu overrides the device heuristic (story-game presets).
  const graphics = useExplore((s) => s.settings.graphics);
  const auto = useMemo(() => autoFx(reduced), [reduced]);
  const fx = graphics === "ultra" ? true : graphics === "lite" ? false : auto;

  return (
    <Canvas
      dpr={[1, capDpr]}
      frameloop="always"
      camera={{ fov: 55, position: [0, 1.7, 4], near: 0.1, far: 50 }}
      gl={{ antialias: true, alpha: false, powerPreference: "high-performance" }}
    >
      <color attach="background" args={[PALETTE.bg]} />
      {/* Density tuned so the next station (7 units) reads as a glow first. */}
      <fogExp2 attach="fog" args={[PALETTE.bg, 0.075]} />
      <ambientLight intensity={0.5} />
      <World stations={stations} reduced={reduced} gaps={explore ? DOOR_GAPS : []} />
      <Cables stations={stations} reduced={reduced} />
      <Panels stations={stations} reduced={reduced} />
      {statusStation && <StatusRack station={statusStation} reduced={reduced} />}
      {fx && <PostFX />}
      <Exposure />
      {explore ? (
        <>
          <PlayerRig map={map} reduced={reduced} />
          <ExploreWorld map={map} reduced={reduced} />
          <StoryLogs reduced={reduced} />
          {graphics !== "lite" && <Dust map={map} reduced={reduced} />}
        </>
      ) : (
        <RoomCameraRig stations={stations} reduced={reduced} />
      )}
    </Canvas>
  );
}

/** Applies the settings-menu brightness as tone-mapping exposure. */
function Exposure() {
  const brightness = useExplore((s) => s.settings.brightness);
  const gl = useThree((st) => st.gl);
  useEffect(() => {
    gl.toneMappingExposure = brightness;
  }, [gl, brightness]);
  return null;
}
