import { CORRIDOR, SIDE_X, type Station } from "../types";

/**
 * ROOT ACCESS map — the single source of truth for EXPLORE mode geometry.
 * Walls here drive collision (collide.ts), render (ExploreWorld.tsx) and the
 * minimap (Minimap.tsx); change a rect once and all three stay in sync.
 *
 * Top-down plan (x right, z up = toward the entrance):
 *
 *            x−3    x+3                 x+17  x+22
 *   z=+4   ┌────────┐
 *          │AISLE-A │  guest (existing corridor, untouched)
 *   z≈−10 ─┤        ├──[DOOR-1]──────────┐
 *          │        │   LAB · operator   │   z −8 … −13
 *   z≈−13 ─┤        ├────────[DOOR-2 in south wall x14…16]
 *          │        │         │   CORE · root   │  z −13 … −24
 *   z=deep └────────┘         └──────────to x22─┘
 */

/* ------------------------------- types ------------------------------- */

/** Axis-aligned wall/obstacle rect on the floor plan (y: 0..CORRIDOR.height). */
export interface WallRect {
  xMin: number;
  xMax: number;
  zMin: number;
  zMax: number;
  /** Collision-only: something else (decor racks, custom mesh) is the visual. */
  hidden?: boolean;
}

export interface DoorDef {
  id: "door-lab" | "door-core";
  /** Collision + render volume while locked. */
  rect: WallRect;
  /** Center of the doorway, for proximity + keypad placement. */
  center: { x: number; z: number };
  /** Door slab faces along this axis ("x" = slab normal points ±x). */
  axis: "x" | "z";
  grants: "operator" | "root";
  label: string;
  prompt: string[];
  hint: string;
  answers: string[];
}

export interface ZoneDef {
  id: "aisle" | "lab" | "core";
  rect: WallRect;
  label: string;
}

/* ------------------------------ constants ---------------------------- */

export const PLAYER_RADIUS = 0.35;
export const PLAYER_SPEED = 3.4; // world units / s
export const INTERACT_RANGE = 2.3;
export const EYE_Y = 1.7;
export const SPAWN = { x: 0, z: 3, yaw: 0 }; // yaw 0 → facing −z, into the room

/** Secret access code printed on the NOTE panel inside the LAB. */
export const ACCESS_CODE = "AMBER-22";

/** Aisle-A walkable half-width: the decorative rack faces sit at |x|≈1.95. */
const AISLE_X = 1.98;
const WALL_T = 0.4; // wall band thickness used for collision volumes

/** Door-1 opening in the right rack wall (kept clear of station racks). */
const D1_Z_MIN = -11.5;
const D1_Z_MAX = -9.5;

/** LAB corridor. */
export const LAB = { xMin: 3, xMax: 17.4, zMin: -13, zMax: -8 } as const;
/** CORE room (south of the LAB east end). */
export const CORE = { xMin: 11.6, xMax: 22.4, zMin: -24, zMax: -13 } as const;

/** Door-2 opening in the LAB↔CORE shared wall. */
const D2_X_MIN = 14;
const D2_X_MAX = 16;

/* ------------------------------- map --------------------------------- */

/** Readable-on-screen case study spot (project racks in Aisle-A). */
export interface StudyDef {
  id: `study:${string}`;
  slug: string;
  label: string;
  x: number;
  z: number;
}

export interface ExploreMap {
  walls: WallRect[];
  doors: DoorDef[];
  zones: ZoneDef[];
  studies: StudyDef[];
  /** Deepest z of the existing corridor (from stations) − margin. */
  zDeep: number;
  bounds: WallRect;
}

/** Build the map around the real corridor extent (station-driven). */
export function buildExploreMap(stations: Station[]): ExploreMap {
  const zDeep = Math.min(0, ...stations.map((s) => s.z)) - 4;

  const walls: WallRect[] = [
    // Aisle-A left rack band, full depth (visuals = existing decor racks).
    { xMin: -3.4, xMax: -AISLE_X, zMin: zDeep - 1, zMax: 5, hidden: true },
    // Aisle-A right rack band, split by the DOOR-1 opening.
    { xMin: AISLE_X, xMax: 3.4, zMin: D1_Z_MAX, zMax: 5, hidden: true },
    { xMin: AISLE_X, xMax: 3.4, zMin: zDeep - 1, zMax: D1_Z_MIN, hidden: true },
    // Aisle-A end caps.
    { xMin: -3.4, xMax: 3.4, zMin: 4.5, zMax: 5, hidden: true },
    { xMin: -3.4, xMax: 3.4, zMin: zDeep - 1, zMax: zDeep - 0.5, hidden: true },

    // LAB north wall — band deepened to also fence off the archive racks
    // and their Html panels (player stays ≥0.35 from the panel plane).
    { xMin: LAB.xMin, xMax: LAB.xMax + WALL_T, zMin: -9.0, zMax: LAB.zMax + 0.4 },
    // LAB/CORE shared south/north wall band, split by DOOR-2.
    { xMin: LAB.xMin, xMax: D2_X_MIN, zMin: LAB.zMin - WALL_T, zMax: LAB.zMin },
    { xMin: D2_X_MAX, xMax: CORE.xMax, zMin: LAB.zMin - WALL_T, zMax: LAB.zMin },
    // LAB east wall (above CORE).
    { xMin: LAB.xMax, xMax: LAB.xMax + WALL_T, zMin: LAB.zMin, zMax: LAB.zMax },

    // CORE west / east / south walls.
    { xMin: CORE.xMin - WALL_T, xMax: CORE.xMin, zMin: CORE.zMin, zMax: LAB.zMin },
    { xMin: CORE.xMax, xMax: CORE.xMax + WALL_T, zMin: CORE.zMin, zMax: LAB.zMin },
    {
      xMin: CORE.xMin - WALL_T,
      xMax: CORE.xMax + WALL_T,
      zMin: CORE.zMin - WALL_T,
      zMax: CORE.zMin,
    },
    // CORE north-west shelf (west of DOOR-2, below the LAB east wall).
    { xMin: CORE.xMin, xMax: D2_X_MIN, zMin: LAB.zMin - WALL_T, zMax: LAB.zMin },

    // CORE center obstacle: the server heart plinth (custom mesh).
    { xMin: 16.2, xMax: 17.8, zMin: -19.3, zMax: -17.7, hidden: true },
    // CORE terminal rack (west wall) + status cabinet (east wall) footprints.
    { xMin: CORE.xMin, xMax: CORE.xMin + 1.0, zMin: -17.2, zMax: -15.8, hidden: true },
    { xMin: CORE.xMax - 1.0, xMax: CORE.xMax, zMin: -19.2, zMax: -17.8, hidden: true },
  ];

  const doors: DoorDef[] = [
    {
      id: "door-lab",
      rect: { xMin: AISLE_X, xMax: 3.4, zMin: D1_Z_MIN, zMax: D1_Z_MAX },
      center: { x: 3, z: (D1_Z_MIN + D1_Z_MAX) / 2 },
      axis: "x",
      grants: "operator",
      label: "TERMINAL AKSES — LAB",
      prompt: [
        "AUTH REQUIRED · level operator",
        "Remote shell tertua yang masih dipakai semua",
        "server di dunia — di port berapa ia mendengarkan",
        "secara default?",
      ],
      hint: "hint: man ssh — dua digit, kembar.",
      answers: ["22", "port 22"],
    },
    {
      id: "door-core",
      rect: { xMin: D2_X_MIN, xMax: D2_X_MAX, zMin: LAB.zMin - WALL_T, zMax: LAB.zMin },
      center: { x: (D2_X_MIN + D2_X_MAX) / 2, z: LAB.zMin - WALL_T / 2 },
      axis: "z",
      grants: "root",
      label: "TERMINAL AKSES — CORE",
      prompt: [
        "ROOT ACCESS · restricted",
        "Masukkan kode akses.",
        "(Operator yang teliti sudah melihatnya",
        "tercetak di suatu tempat dalam LAB…)",
      ],
      hint: "hint: panel menyala kuning di ujung timur LAB.",
      answers: [ACCESS_CODE.toLowerCase(), "amber 22", "amber22"],
    },
  ];

  const zones: ZoneDef[] = [
    { id: "aisle", rect: { xMin: -4, xMax: 3, zMin: zDeep - 1, zMax: 5 }, label: "AISLE-A" },
    {
      id: "lab",
      rect: { xMin: LAB.xMin, xMax: LAB.xMax, zMin: LAB.zMin, zMax: LAB.zMax },
      label: "LAB",
    },
    {
      id: "core",
      rect: { xMin: CORE.xMin, xMax: CORE.xMax, zMin: CORE.zMin, zMax: LAB.zMin },
      label: "CORE",
    },
  ];

  // Project racks become in-game readables: walk up, press E, read on screen.
  const studies: StudyDef[] = stations
    .filter((s) => s.kind === "project" && s.side !== "center" && s.project)
    .map((s) => ({
      id: `study:${s.project!.slug}` as const,
      slug: s.project!.slug,
      label: `BACA: ${s.title}`,
      x: SIDE_X[s.side],
      z: s.z,
    }));

  return {
    walls,
    doors,
    zones,
    studies,
    zDeep,
    bounds: { xMin: -4, xMax: CORE.xMax + 1, zMin: CORE.zMin - 1, zMax: 5.5 },
  };
}

/** Decor-rack gaps World.tsx must leave open in EXPLORE mode. */
export const DOOR_GAPS = [{ side: "right" as const, zMin: D1_Z_MIN - 0.7, zMax: D1_Z_MAX + 0.7 }];

/* --------------------------- placed content -------------------------- */

/**
 * LAB archive rack slots along the north wall, facing the aisle (south).
 * Deliberately teasers only — "??? COMING SOON" cards (user call 2026-07-12);
 * real experiment content stays out of the bundle until it launches.
 */
export const LAB_PANELS = [0, 1, 2].map((i) => ({
  id: `lab-slot-${i + 1}`,
  x: 6 + i * 3.9,
  z: LAB.zMax - 0.6,
  code: `EXPERIMENT-0${i + 1}`,
}));

/** Fixed interactables beyond the two doors. */
export const TERMINAL_POS = { x: CORE.xMin + 1.05, z: -16.5 }; // faces east
export const NOTE_POS = { x: LAB.xMax - 0.45, z: -10.5 }; // east wall, faces west
export const HEART_POS = { x: 17, z: -18.5 };
export const STATUS_POS = { x: CORE.xMax - 1.05, z: -18.5 }; // faces west
export const HIRE_POS = { x: 17, z: CORE.zMin + 0.7 }; // south wall, faces north

export const ROOM_H = CORRIDOR.height;
