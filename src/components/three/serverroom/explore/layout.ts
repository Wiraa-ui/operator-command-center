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
  id: "door-lab" | "door-core" | "door-bengkel" | "door-noc";
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
  id: "aisle" | "lab" | "core" | "bengkel" | "noc";
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

/* RPG expansion (2026-07-16): two quest rooms flanking the original map. */

/** BENGKEL (workshop) — west of Aisle-A, Bli Gede's domain. */
export const BENGKEL = { xMin: -11.4, xMax: -3.4, zMin: -19, zMax: -13 } as const;
/** Door-W opening in the aisle's left rack band. */
const DW_Z_MIN = -17;
const DW_Z_MAX = -15;

/** NOC (monitoring) — north of the LAB, Putu's domain. */
export const NOC = { xMin: 6, xMax: 14, zMin: -7.6, zMax: -1.2 } as const;
/** Door-N opening in the LAB's north wall band. */
const DN_X_MIN = 9;
const DN_X_MAX = 11;

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
    // Aisle-A left rack band, split by the DOOR-W opening (→ BENGKEL).
    { xMin: -3.4, xMax: -AISLE_X, zMin: DW_Z_MAX, zMax: 5, hidden: true },
    { xMin: -3.4, xMax: -AISLE_X, zMin: zDeep - 1, zMax: DW_Z_MIN, hidden: true },
    // Aisle-A right rack band, split by the DOOR-1 opening.
    { xMin: AISLE_X, xMax: 3.4, zMin: D1_Z_MAX, zMax: 5, hidden: true },
    { xMin: AISLE_X, xMax: 3.4, zMin: zDeep - 1, zMax: D1_Z_MIN, hidden: true },
    // Aisle-A end caps.
    { xMin: -3.4, xMax: 3.4, zMin: 4.5, zMax: 5, hidden: true },
    { xMin: -3.4, xMax: 3.4, zMin: zDeep - 1, zMax: zDeep - 0.5, hidden: true },

    // BENGKEL walls (west room): north, south, west; east side is the split
    // aisle band above.
    {
      xMin: BENGKEL.xMin - WALL_T,
      xMax: -AISLE_X,
      zMin: BENGKEL.zMax,
      zMax: BENGKEL.zMax + WALL_T,
    },
    {
      xMin: BENGKEL.xMin - WALL_T,
      xMax: -AISLE_X,
      zMin: BENGKEL.zMin - WALL_T,
      zMax: BENGKEL.zMin,
    },
    { xMin: BENGKEL.xMin - WALL_T, xMax: BENGKEL.xMin, zMin: BENGKEL.zMin, zMax: BENGKEL.zMax },
    // BENGKEL workbench (custom mesh visual).
    { xMin: -10.6, xMax: -8.4, zMin: -14.3, zMax: -13.6, hidden: true },

    // LAB north wall — band deepened to also fence off the archive racks
    // and their Html panels (player stays ≥0.35 from the panel plane);
    // split by the DOOR-N opening (→ NOC).
    { xMin: LAB.xMin, xMax: DN_X_MIN, zMin: -9.0, zMax: LAB.zMax + 0.4 },
    { xMin: DN_X_MAX, xMax: LAB.xMax + WALL_T, zMin: -9.0, zMax: LAB.zMax + 0.4 },

    // NOC walls (north room): west, east, north; south side is the split LAB
    // band above.
    { xMin: NOC.xMin - WALL_T, xMax: NOC.xMin, zMin: NOC.zMin, zMax: NOC.zMax },
    { xMin: NOC.xMax, xMax: NOC.xMax + WALL_T, zMin: NOC.zMin, zMax: NOC.zMax },
    { xMin: NOC.xMin - WALL_T, xMax: NOC.xMax + WALL_T, zMin: NOC.zMax, zMax: NOC.zMax + WALL_T },
    // NOC monitor desk (custom mesh visual).
    { xMin: 8.4, xMax: 11.6, zMin: -2.4, zMax: -1.7, hidden: true },
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
    {
      id: "door-bengkel",
      rect: { xMin: -3.4, xMax: -AISLE_X, zMin: DW_Z_MIN, zMax: DW_Z_MAX },
      center: { x: -2.7, z: (DW_Z_MIN + DW_Z_MAX) / 2 },
      axis: "x",
      grants: "operator",
      label: "PINTU BENGKEL — MAINTENANCE",
      prompt: [
        "AKSES BENGKEL · staf teknis",
        "Sebelum kerja berat, operator mesin ini selalu",
        "mengecek RAM dengan satu perintah pendek.",
        "Perintah apa?",
      ],
      hint: "hint: lawan kata 'berbayar' — 4 huruf, sering dipanggil dengan -h.",
      answers: ["free", "free -h", "free-h"],
    },
    {
      id: "door-noc",
      rect: { xMin: DN_X_MIN, xMax: DN_X_MAX, zMin: -9.0, zMax: LAB.zMax + 0.4 },
      center: { x: (DN_X_MIN + DN_X_MAX) / 2, z: -8.3 },
      axis: "z",
      grants: "operator",
      label: "PINTU NOC — MONITORING",
      prompt: [
        "AKSES NOC · network ops",
        "Semua lalu lintas aman situs ini lewat satu",
        "port TLS. Port berapa?",
      ],
      hint: "hint: tiga digit, https://",
      answers: ["443", "port 443"],
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
    {
      id: "bengkel",
      rect: { xMin: BENGKEL.xMin, xMax: BENGKEL.xMax, zMin: BENGKEL.zMin, zMax: BENGKEL.zMax },
      label: "BENGKEL",
    },
    {
      id: "noc",
      rect: { xMin: NOC.xMin, xMax: NOC.xMax, zMin: NOC.zMin, zMax: NOC.zMax },
      label: "NOC",
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
    bounds: { xMin: BENGKEL.xMin - 1, xMax: CORE.xMax + 1, zMin: CORE.zMin - 1, zMax: 5.5 },
  };
}

/** Decor-rack gaps World.tsx must leave open in EXPLORE mode. */
export const DOOR_GAPS = [
  { side: "right" as const, zMin: D1_Z_MIN - 0.7, zMax: D1_Z_MAX + 0.7 },
  { side: "left" as const, zMin: DW_Z_MIN - 0.7, zMax: DW_Z_MAX + 0.7 },
];

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
