import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { slideMove } from "../collide";
import { LAB, SPAWN, type ExploreMap } from "../layout";
import {
  addToast,
  cancelPurge,
  completePurge,
  getExploreState,
  player,
  useExplore,
} from "../store";
import { ArsipRack, KiranaBody, VhsGhost } from "./Entities";
import { nightAudio } from "./gamelan";
import { ARSIP_RACKS, lampIsOn, night, RITUAL_MOVE_TOL } from "./state";
import {
  storyIntro,
  storyMoksa,
  storyOnCaught,
  storyOnPurged,
  storyStop,
  storyTick,
} from "./story";

/**
 * NightShift — the MOKSA.CLOUD game brain, mounted by ExploreWorld only
 * while state.night is true. Owns per-frame AI (Kirana pursuit with
 * door-waypoint routing, light-drawn VHS ghost), ritual resolution
 * (hold-still purge), catch/contact consequences, and the gamelan score's
 * intensity. Visuals live in Entities.tsx; rules live here.
 */

const KIRANA_BASE_SPEED = 0.8; // u/s — she never runs; the map does the work
const KIRANA_SPEED_PER_PURGE = 0.09; // every freed arwah makes her bolder
const KIRANA_CATCH_DIST = 0.8;
const GHOST_SPEED = 0.55;
const GHOST_CONTACT_DIST = 0.9;
const GHOST_LAMP_LOCK_MS = 6000;
const WAYPOINT_DIST = 0.7;

/** Door thresholds used as waypoints when target is in another zone. */
const DOOR1 = { x: 2.7, z: -10.5 }; // aisle ↔ lab
const DOOR2 = { x: 15, z: -13.2 }; // lab ↔ core
const DOORW = { x: -2.7, z: -16 }; // aisle ↔ bengkel (RPG expansion)
const DOORN = { x: 10, z: -8.3 }; // lab ↔ noc (RPG expansion)

type Zone = "aisle" | "lab" | "core" | "bengkel" | "noc";

function zoneOf(x: number, z: number): Zone {
  if (x < -3.4) return "bengkel";
  if (x < LAB.xMin) return "aisle";
  if (z > -7.6) return "noc";
  if (z < LAB.zMin) return "core";
  return "lab";
}

/** Next point on the door-graph path from (x,z) toward the player's zone.
    Graph: bengkel—aisle—lab—core, lab—noc; each hop is one door waypoint. */
function pursuitTarget(x: number, z: number): { x: number; z: number } {
  const from = zoneOf(x, z);
  const to = zoneOf(player.x, player.z);
  if (from === to) return { x: player.x, z: player.z };
  if (from === "bengkel") return DOORW;
  if (from === "noc") return DOORN;
  if (from === "aisle") return to === "bengkel" ? DOORW : DOOR1;
  if (from === "core") return DOOR2;
  // from lab:
  if (to === "noc") return DOORN;
  if (to === "core") return DOOR2;
  return DOOR1; // aisle or bengkel — first hop is always DOOR1
}

export function NightShift({ map }: { map: ExploreMap }) {
  const purged = useExplore((s) => s.purged);
  const moksa = useExplore((s) => s.moksa);

  // Gamelan score + opening narration live exactly as long as the shift.
  useEffect(() => {
    nightAudio.setMuted(getExploreState().muted);
    nightAudio.start();
    storyIntro();
    return () => {
      nightAudio.stop();
      storyStop();
    };
  }, []);

  // Gong + the freed arwah's goodbye on each completed purge (skip mount).
  const prevPurged = useRef(purged.length);
  useEffect(() => {
    if (purged.length > prevPurged.current) {
      nightAudio.gong();
      const latest = purged[purged.length - 1];
      if (latest) storyOnPurged(latest);
    }
    prevPurged.current = purged.length;
  }, [purged]);

  // Ending narration under the moksa overlay.
  useEffect(() => {
    if (moksa) storyMoksa();
  }, [moksa]);

  // Kirana's presence flickers the emergency light she carries with her.
  const kiranaLight = useRef<THREE.PointLight>(null);

  useFrame((_, dt) => {
    const s = getExploreState();
    if (!s.night) return;
    const now = Date.now();
    const step = Math.min(dt, 0.3);

    /* --------------------------- Kirana ------------------------------ */
    const k = night.kirana;
    if (!s.moksa) {
      const tgt = pursuitTarget(k.x, k.z);
      const dx = tgt.x - k.x;
      const dz = tgt.z - k.z;
      const d = Math.hypot(dx, dz);
      if (d > WAYPOINT_DIST || (tgt.x === player.x && tgt.z === player.z)) {
        const speed = KIRANA_BASE_SPEED + s.purged.length * KIRANA_SPEED_PER_PURGE;
        const move = Math.min(speed * step, d);
        const next = slideMove(k.x, k.z, (dx / d) * move, (dz / d) * move, map.walls);
        k.x = next.x;
        k.z = next.z;
        // Face travel: model faces +z with rotation.y = yaw + π (Avatar rule),
        // forward = (−sin yaw, −cos yaw) → yaw from the desired direction.
        k.yaw = Math.atan2(-dx, -dz);
      }
      const dPlayer = Math.hypot(k.x - player.x, k.z - player.z);
      if (dPlayer < KIRANA_CATCH_DIST) {
        // Caught: no death — she walks you out. Purge progress survives.
        player.x = SPAWN.x;
        player.z = SPAWN.z;
        player.yaw = SPAWN.yaw;
        cancelPurge();
        storyOnCaught();
        k.x = DOOR2.x;
        k.z = DOOR2.z - 2;
      }
      // Close encounters earn a taunt (cooldown + escalation in story.ts).
      storyTick(now, dPlayer, s.purged.length);
      // Score tension: distance-driven, with a floor that rises per purge.
      const tension = Math.max(
        THREE.MathUtils.clamp(1 - (dPlayer - 1.5) / 10, 0, 1),
        s.purged.length * 0.05,
      );
      nightAudio.setIntensity(tension);
      nightAudio.setMuted(s.muted);
    }

    if (kiranaLight.current) {
      kiranaLight.current.position.set(k.x, 2.3, k.z);
      kiranaLight.current.intensity = 1.4 + Math.sin(now * 0.02) * 0.5 + Math.random() * 0.25;
    }

    /* -------------------------- VHS ghost ---------------------------- */
    const g = night.ghost;
    const lampOn = lampIsOn(now);
    if (lampOn && !s.moksa) {
      g.fade = Math.min(1, g.fade + step * 0.7);
      const dx = player.x - g.x;
      const dz = player.z - g.z;
      const d = Math.hypot(dx, dz);
      if (d > 0.05) {
        // Phases through racks (it's tape, not flesh); only bounds clamp it.
        g.x = THREE.MathUtils.clamp(
          g.x + (dx / d) * GHOST_SPEED * step,
          map.bounds.xMin + 0.3,
          map.bounds.xMax - 0.3,
        );
        g.z = THREE.MathUtils.clamp(
          g.z + (dz / d) * GHOST_SPEED * step,
          map.bounds.zMin + 0.3,
          map.bounds.zMax - 0.3,
        );
      }
      if (d < GHOST_CONTACT_DIST && g.fade > 0.5) {
        night.lampLockUntil = now + GHOST_LAMP_LOCK_MS;
        addToast("▓▒░ STATIS — lampumu direbut sinyal 1998");
        // It got what it wanted; it drifts off to re-approach later.
        g.x -= (dx / Math.max(d, 0.1)) * 5;
        g.z -= (dz / Math.max(d, 0.1)) * 5;
      }
    } else {
      g.fade = Math.max(0, g.fade - step * 1.6); // darkness starves it
    }

    /* ---------------------------- ritual ----------------------------- */
    if (s.purging) {
      const drift = Math.hypot(player.x - night.purgeAnchor.x, player.z - night.purgeAnchor.z);
      if (drift > RITUAL_MOVE_TOL) {
        cancelPurge("Ritual batal — kamu bergerak.");
      } else if (now >= s.purging.until) {
        completePurge();
      }
    }
  });

  return (
    <group>
      {/* Kirana's flickering emergency aura — the room's only moving light. */}
      <pointLight ref={kiranaLight} color="#f59e0b" distance={7} decay={1.8} intensity={1.4} />
      <KiranaBody />
      <VhsGhost />
      {ARSIP_RACKS.map((r) => (
        <ArsipRack key={r.id} x={r.x} z={r.z} purged={purged.includes(r.id)} label={r.label} />
      ))}
    </group>
  );
}
