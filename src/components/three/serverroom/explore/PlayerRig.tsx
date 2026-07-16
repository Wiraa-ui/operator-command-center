import { useEffect, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { FirstPersonArms, ThirdPersonBody } from "./Avatar";
import { slideMove } from "./collide";
import {
  EYE_Y,
  INTERACT_RANGE,
  PLAYER_SPEED,
  ROOM_H,
  TERMINAL_POS,
  type ExploreMap,
} from "./layout";
import {
  getExploreState,
  input,
  markVisited,
  player,
  setInteract,
  toggleView,
  triggerInteract,
  useExplore,
} from "./store";
import { ARSIP_RACKS, lampIsOn, night } from "./nightshift/state";
import { NPCS, QUEST_NODES } from "./rpg";

/**
 * PlayerRig — player body for EXPLORE mode. Consumes the mutable
 * `input` singleton (keys, joystick, accumulated look deltas), slides the
 * player against the map, drives the camera (first-person YXZ yaw/pitch, or
 * a wall-clipped third-person chase boom — V/F5 toggles), keeps the nearest
 * interactable in the store, and carries the headlamp + view avatar.
 *
 * Interaction (E / tap) opens DOM modals via the store — never handled here
 * per-frame; keydown listeners live in this component so desktop input works
 * without any DOM focus requirements while pointer-locked.
 */

const LOOK_SENS = 0.0024; // rad per px (touch deltas are pre-scaled in the HUD)
const PITCH_MAX = 1.45;

/* Third-person chase boom (Minecraft-style F5). */
const BOOM_LEN = 2.8;
const BOOM_UP = 0.35;
const BOOM_STEP = 0.2; // sample spacing < wall band thickness (0.4) — no skip
const CAM_PAD = 0.2; // keep the lens off wall faces / map bounds

/* Sprint & jump (standard FPS feel; jump is vertical-only — collision is 2D). */
const SPRINT_MULT = 1.65;
const JUMP_V = 4.6; // apex ≈ 0.88u, well under the 4.2u ceiling
const GRAVITY = 12;
const HELD_KEYS = new Set(["ShiftLeft", "ShiftRight", "Space"]);

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
  // Only the avatar mount reacts to the toggle; the frame loop keeps reading
  // getExploreState() so no per-frame React work is introduced.
  const view = useExplore((s) => s.view);

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
      if (MOVE_KEYS[e.code] || HELD_KEYS.has(e.code)) {
        input.keys.add(e.code);
        e.preventDefault();
      }
      if (e.code === "KeyE") triggerInteract();
      // SHIFT MALAM: L toggles the headlamp (light draws the VHS ghost).
      if (e.code === "KeyL" && getExploreState().night) night.lamp = !night.lamp;
      if (e.code === "KeyV" || e.code === "F5") {
        if (e.code === "F5") e.preventDefault(); // browser reload
        toggleView();
      }
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
        // Sprint: Shift on desktop, or pushing the virtual stick to its rim
        // on touch (no extra button to reach for mid-chase).
        const sprint =
          input.keys.has("ShiftLeft") ||
          input.keys.has("ShiftRight") ||
          Math.hypot(input.joy.x, input.joy.y) > 0.92;
        const speed = PLAYER_SPEED * (sprint ? SPRINT_MULT : 1);
        // Substep integration: low-fps devices keep full walking speed while
        // each collision step stays < wall thickness (no tunneling).
        let remaining = Math.min(dt, 0.3);
        while (remaining > 0) {
          const stepDt = Math.min(remaining, 0.05);
          remaining -= stepDt;
          const step = speed * stepDt;
          // forward = (−sin yaw, −cos yaw); right = (cos yaw, −sin yaw)
          const dx = (-sin * f + cos * strafe) * step;
          const dz = (-cos * f - sin * strafe) * step;
          const next = slideMove(player.x, player.z, dx, dz, walls);
          player.x = next.x;
          player.z = next.z;
        }
      }
    }

    /* ------------------------------ jump ------------------------------- */
    if (!frozen && input.keys.has("Space") && player.y === 0) player.vy = JUMP_V;
    if (player.y > 0 || player.vy > 0) {
      const jdt = Math.min(dt, 0.3);
      player.y = Math.max(0, player.y + player.vy * jdt);
      player.vy = player.y > 0 ? player.vy - GRAVITY * jdt : 0;
    }
    const eyeY = EYE_Y + player.y;

    if (s.view === "third") {
      // Chase boom: orbit behind the head along the inverse look direction,
      // shortened by marching x/z samples against the same wall rects
      // slideMove uses (walls are full-height, so 2D containment suffices).
      const cp = Math.cos(player.pitch);
      const bx = Math.sin(player.yaw) * cp;
      const by = -Math.sin(player.pitch);
      const bz = Math.cos(player.yaw) * cp;
      const walls = wallsFor(s.unlocked);
      const b = map.bounds;
      let len = BOOM_LEN;
      for (let t = BOOM_STEP; t <= BOOM_LEN; t += BOOM_STEP) {
        const sx = player.x + bx * t;
        const sz = player.z + bz * t;
        let hit =
          sx < b.xMin + CAM_PAD ||
          sx > b.xMax - CAM_PAD ||
          sz < b.zMin + CAM_PAD ||
          sz > b.zMax - CAM_PAD;
        if (!hit) {
          for (const r of walls) {
            if (
              sx > r.xMin - CAM_PAD &&
              sx < r.xMax + CAM_PAD &&
              sz > r.zMin - CAM_PAD &&
              sz < r.zMax + CAM_PAD
            ) {
              hit = true;
              break;
            }
          }
        }
        if (hit) {
          len = Math.max(BOOM_STEP, t - BOOM_STEP);
          break;
        }
      }
      camera.position.set(
        player.x + bx * len,
        THREE.MathUtils.clamp(eyeY + BOOM_UP + by * len, 0.4, ROOM_H - 0.3),
        player.z + bz * len,
      );
      camera.lookAt(player.x, eyeY, player.z);
    } else {
      camera.position.set(player.x, eyeY, player.z);
      camera.rotation.set(player.pitch, player.yaw, 0, "YXZ");
    }

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
    // Day-shift RPG: NPCs to talk to (they go home at night) + Q2 panels.
    if (!s.night) {
      for (const n of NPCS) {
        const dist = Math.hypot(n.x - player.x, n.z - player.z);
        if (dist < bestD) {
          bestD = dist;
          nearest = { id: n.id, label: `BICARA — ${n.name}` };
        }
      }
      if (s.questProgress.active["q-sinyal"] !== undefined) {
        for (const q of QUEST_NODES) {
          const dist = Math.hypot(q.x - player.x, q.z - player.z);
          if (dist < bestD) {
            bestD = dist;
            nearest = { id: q.id, label: q.label };
          }
        }
      }
    }
    // SHIFT MALAM: unpurged archives become the priority interactables.
    if (s.night && !s.purging) {
      for (const r of ARSIP_RACKS) {
        if (s.purged.includes(r.id)) continue;
        const dist = Math.hypot(r.x - player.x, r.z - player.z);
        if (dist < bestD) {
          bestD = dist;
          nearest = { id: r.id, label: `HAPUS ${r.label}` };
        }
      }
    }
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
      {view === "first" ? <FirstPersonArms /> : <ThirdPersonBody />}
      <HeadLamp reduced={reduced} />
    </group>
  );
}

function HeadLamp({ reduced }: { reduced: boolean }) {
  // Light + target built together so the pairing never happens in render.
  const { light, target, dir } = useMemo(() => {
    const tgt = new THREE.Object3D();
    const l = new THREE.SpotLight("#fde9c8", 18, 14, 0.62, 0.55, 1.6);
    l.target = tgt;
    return { light: l, target: tgt, dir: new THREE.Vector3() };
  }, []);

  useFrame(({ camera }) => {
    if (getExploreState().view === "third") {
      // Lamp stays at the player's head, not the chase camera, so the body
      // doesn't sit backlit inside its own cone.
      const cp = Math.cos(player.pitch);
      light.position.set(player.x, EYE_Y, player.z);
      target.position.set(
        player.x - Math.sin(player.yaw) * cp * 6,
        EYE_Y + Math.sin(player.pitch) * 6,
        player.z - Math.cos(player.yaw) * cp * 6,
      );
    } else {
      light.position.copy(camera.position);
      camera.getWorldDirection(dir);
      target.position.copy(camera.position).addScaledVector(dir, 6);
    }
    target.updateMatrixWorld();
    // SHIFT MALAM: lamp off (or static-locked by the ghost) → near-darkness.
    const s = getExploreState();
    light.intensity = s.night && !lampIsOn(Date.now()) ? 1.2 : 18;
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
