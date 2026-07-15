import { useEffect, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { slideMove } from "./collide";
import { EYE_Y, INTERACT_RANGE, PLAYER_SPEED, TERMINAL_POS, type ExploreMap } from "./layout";
import { getExploreState, input, markVisited, player, setInteract, triggerInteract } from "./store";

/**
 * PlayerRig — first-person body for EXPLORE mode. Consumes the mutable
 * `input` singleton (keys, joystick, accumulated look deltas), slides the
 * player against the map, drives the camera (YXZ yaw/pitch), keeps the
 * nearest interactable in the store, and carries the headlamp.
 *
 * Interaction (E / tap) opens DOM modals via the store — never handled here
 * per-frame; keydown listeners live in this component so desktop input works
 * without any DOM focus requirements while pointer-locked.
 */

const LOOK_SENS = 0.0024; // rad per px (touch deltas are pre-scaled in the HUD)
const PITCH_MAX = 1.45;

const MOVE_KEYS: Record<string, [number, number]> = {
  KeyW: [0, 1],
  ArrowUp: [0, 1],
  KeyS: [0, -1],
  ArrowDown: [0, -1],
  KeyA: [-1, 0],
  ArrowLeft: [-1, 0],
  KeyD: [1, 0],
  ArrowRight: [1, 0],
};

export function PlayerRig({ map, reduced }: { map: ExploreMap; reduced: boolean }) {
  // Locked doors participate in collision; solved ones stop existing.
  const wallsFor = useMemo(
    () => (unlocked: string[]) => [
      ...map.walls,
      ...map.doors.filter((d) => !unlocked.includes(d.id)).map((d) => d.rect),
    ],
    [map],
  );

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (getExploreState().modal) return; // modals own the keyboard
      if (MOVE_KEYS[e.code]) {
        input.keys.add(e.code);
        e.preventDefault();
      }
      if (e.code === "KeyE") triggerInteract();
    };
    const up = (e: KeyboardEvent) => input.keys.delete(e.code);
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
    };
  }, []);

  useFrame(({ camera }, dt) => {
    const s = getExploreState();
    const frozen = s.modal !== null;

    /* ------------------------------ look ------------------------------ */
    if (!frozen) {
      player.yaw -= input.lookDX * LOOK_SENS;
      player.pitch = THREE.MathUtils.clamp(
        player.pitch - input.lookDY * LOOK_SENS,
        -PITCH_MAX,
        PITCH_MAX,
      );
    }
    input.lookDX = 0;
    input.lookDY = 0;

    /* ------------------------------ move ------------------------------ */
    if (!frozen) {
      let f = -input.joy.y; // stick up = forward
      let strafe = input.joy.x;
      for (const code of input.keys) {
        const k = MOVE_KEYS[code];
        if (k) {
          strafe += k[0];
          f += k[1];
        }
      }
      const len = Math.hypot(f, strafe);
      if (len > 0.01) {
        f /= Math.max(len, 1);
        strafe /= Math.max(len, 1);
        const sin = Math.sin(player.yaw);
        const cos = Math.cos(player.yaw);
        const walls = wallsFor(s.unlocked);
        // Substep integration: low-fps devices keep full walking speed while
        // each collision step stays < wall thickness (no tunneling).
        let remaining = Math.min(dt, 0.3);
        while (remaining > 0) {
          const stepDt = Math.min(remaining, 0.05);
          remaining -= stepDt;
          const step = PLAYER_SPEED * stepDt;
          // forward = (−sin yaw, −cos yaw); right = (cos yaw, −sin yaw)
          const dx = (-sin * f + cos * strafe) * step;
          const dz = (-cos * f - sin * strafe) * step;
          const next = slideMove(player.x, player.z, dx, dz, walls);
          player.x = next.x;
          player.z = next.z;
        }
      }
    }

    camera.position.set(player.x, EYE_Y, player.z);
    camera.rotation.set(player.pitch, player.yaw, 0, "YXZ");

    /* --------------------------- interact ----------------------------- */
    let nearest: { id: string; label: string } | null = null;
    let bestD = INTERACT_RANGE;
    for (const d of map.doors) {
      if (s.unlocked.includes(d.id)) continue;
      const dist = Math.hypot(d.center.x - player.x, d.center.z - player.z);
      if (dist < bestD) {
        bestD = dist;
        nearest = { id: d.id, label: d.label };
      }
    }
    for (const st of map.studies) {
      const dist = Math.hypot(st.x - player.x, st.z - player.z);
      if (dist < bestD) {
        bestD = dist;
        nearest = { id: st.id, label: st.label };
      }
    }
    const tDist = Math.hypot(TERMINAL_POS.x - player.x, TERMINAL_POS.z - player.z);
    if (tDist < bestD) nearest = { id: "terminal", label: "TERMINAL CORE" };
    setInteract(nearest);

    /* ------------------------- zone tracking --------------------------- */
    for (const zone of map.zones) {
      const r = zone.rect;
      if (player.x > r.xMin && player.x < r.xMax && player.z > r.zMin && player.z < r.zMax) {
        markVisited(zone.id);
        break;
      }
    }
  });

  /* Headlamp: a soft cone that follows the camera — the corridor stays
     moody but whatever you look at reads. Cheap: one extra light. */
  return (
    <group>
      <HeadLamp reduced={reduced} />
    </group>
  );
}

function HeadLamp({ reduced }: { reduced: boolean }) {
  // Light + target built together so the pairing never happens in render.
  const { light, target } = useMemo(() => {
    const tgt = new THREE.Object3D();
    const l = new THREE.SpotLight("#fde9c8", 18, 14, 0.62, 0.55, 1.6);
    l.target = tgt;
    return { light: l, target: tgt };
  }, []);

  useFrame(({ camera }) => {
    light.position.copy(camera.position);
    const dir = new THREE.Vector3();
    camera.getWorldDirection(dir);
    target.position.copy(camera.position).addScaledVector(dir, 6);
    target.updateMatrixWorld();
  });

  // Reduced mode keeps the lamp (it's lighting, not motion).
  void reduced;
  return (
    <>
      <primitive object={light} />
      <primitive object={target} />
    </>
  );
}
