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
  id: "door-lab" | "door-core" | "door-bengkel" | "door-noc" | "door-vault" | "door-hall";
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
  id: "aisle" | "lab" | "core" | "bengkel" | "noc" | "vault" | "hall" | "tunnel";
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

/* Map expansion (2026-07-17): the cold backup vault below CORE. */

/** VAULT (cold storage) — south of CORE; the tape library. */
export const VAULT = { xMin: 13, xMax: 21, zMin: -31, zMax: -24.4 } as const;
/** Door-V opening in the CORE south wall band. */
const DV_X_MIN = 19.2;
const DV_X_MAX = 20.6;

/* West-wing expansion (2026-07-17): the big data hall + the cable tunnel. */

/** DATA HALL — the cathedral: a full hot/cold-aisle server hall. */
export const HALL = { xMin: -34, xMax: -14, zMin: -30, zMax: -14 } as const;
/** Service passage BENGKEL↔HALL (short link corridor, part of no zone). */
export const PASSAGE = { xMin: HALL.xMax, xMax: BENGKEL.xMin, zMin: -17, zMax: -15 } as const;
/** CABLE TUNNEL — long crawl connecting HALL east to the VAULT west hatch. */
export const TUNNEL = { xMin: HALL.xMax, xMax: VAULT.xMin, zMin: -26.6, zMax: -25.2 } as const;

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
    // Aisle-A left rack band, split by the DOOR-W opening (→ BENGKEL) and
    // by the cable-tunnel junction (the tunnel crosses the deep corridor).
    { xMin: -3.4, xMax: -AISLE_X, zMin: DW_Z_MAX, zMax: 5, hidden: true },
    { xMin: -3.4, xMax: -AISLE_X, zMin: TUNNEL.zMax, zMax: DW_Z_MIN, hidden: true },
    { xMin: -3.4, xMax: -AISLE_X, zMin: zDeep - 1, zMax: TUNNEL.zMin, hidden: true },
    // Aisle-A right rack band, split by the DOOR-1 opening + the junction.
    { xMin: AISLE_X, xMax: 3.4, zMin: D1_Z_MAX, zMax: 5, hidden: true },
    { xMin: AISLE_X, xMax: 3.4, zMin: TUNNEL.zMax, zMax: D1_Z_MIN, hidden: true },
    { xMin: AISLE_X, xMax: 3.4, zMin: zDeep - 1, zMax: TUNNEL.zMin, hidden: true },
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
    // BENGKEL west wall — split by the DOOR-H opening (→ DATA HALL).
    { xMin: BENGKEL.xMin - WALL_T, xMax: BENGKEL.xMin, zMin: BENGKEL.zMin, zMax: PASSAGE.zMin },
    { xMin: BENGKEL.xMin - WALL_T, xMax: BENGKEL.xMin, zMin: PASSAGE.zMax, zMax: BENGKEL.zMax },
    // BENGKEL workbench (custom mesh visual).
    { xMin: -10.6, xMax: -8.4, zMin: -14.3, zMax: -13.6, hidden: true },

    // Service passage BENGKEL↔HALL: north + south bands.
    { xMin: HALL.xMax, xMax: BENGKEL.xMin - WALL_T, zMin: PASSAGE.zMax, zMax: PASSAGE.zMax + 0.4 },
    { xMin: HALL.xMax, xMax: BENGKEL.xMin - WALL_T, zMin: PASSAGE.zMin - 0.4, zMax: PASSAGE.zMin },

    // DATA HALL shell: west, north, south; east band split by the passage
    // (z −17…−15) and the cable-tunnel mouth (z −26.6…−25.2).
    { xMin: HALL.xMin - WALL_T, xMax: HALL.xMin, zMin: HALL.zMin, zMax: HALL.zMax },
    { xMin: HALL.xMin - WALL_T, xMax: HALL.xMax + WALL_T, zMin: HALL.zMax, zMax: HALL.zMax + 0.4 },
    { xMin: HALL.xMin - WALL_T, xMax: HALL.xMax + WALL_T, zMin: HALL.zMin - 0.4, zMax: HALL.zMin },
    { xMin: HALL.xMax, xMax: HALL.xMax + WALL_T, zMin: PASSAGE.zMax, zMax: HALL.zMax },
    { xMin: HALL.xMax, xMax: HALL.xMax + WALL_T, zMin: TUNNEL.zMax, zMax: PASSAGE.zMin },
    { xMin: HALL.xMax, xMax: HALL.xMax + WALL_T, zMin: HALL.zMin, zMax: TUNNEL.zMin },

    // CABLE TUNNEL bands (narrow crawl, HALL → VAULT hatch) — broken at the
    // Aisle-A junction (x −3.4…3.4), where the tunnel meets the corridor.
    { xMin: HALL.xMax + WALL_T, xMax: -3.4, zMin: TUNNEL.zMax, zMax: TUNNEL.zMax + 0.4 },
    { xMin: HALL.xMax + WALL_T, xMax: -3.4, zMin: TUNNEL.zMin - 0.4, zMax: TUNNEL.zMin },
    { xMin: 3.4, xMax: VAULT.xMin - WALL_T, zMin: TUNNEL.zMax, zMax: TUNNEL.zMax + 0.4 },
    { xMin: 3.4, xMax: VAULT.xMin - WALL_T, zMin: TUNNEL.zMin - 0.4, zMax: TUNNEL.zMin },

    // DATA HALL rack rows (instanced meshes) — mid-row gap for circulation.
    ...[-16.8, -19.2, -21.6, -24, -26.4, -28.8].flatMap((rz) => [
      { xMin: -32.6, xMax: -24.7, zMin: rz - 0.4, zMax: rz + 0.4, hidden: true },
      { xMin: -23.3, xMax: -15.4, zMin: rz - 0.4, zMax: rz + 0.4, hidden: true },
    ]),

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

    // CORE west / east walls; south wall band split by DOOR-V (→ VAULT).
    { xMin: CORE.xMin - WALL_T, xMax: CORE.xMin, zMin: CORE.zMin, zMax: LAB.zMin },
    { xMin: CORE.xMax, xMax: CORE.xMax + WALL_T, zMin: CORE.zMin, zMax: LAB.zMin },
    { xMin: CORE.xMin - WALL_T, xMax: DV_X_MIN, zMin: CORE.zMin - WALL_T, zMax: CORE.zMin },
    { xMin: DV_X_MAX, xMax: CORE.xMax + WALL_T, zMin: CORE.zMin - WALL_T, zMax: CORE.zMin },

    // VAULT walls (cold storage below CORE): west (split by the tunnel
    // hatch), east, south.
    { xMin: VAULT.xMin - WALL_T, xMax: VAULT.xMin, zMin: VAULT.zMin, zMax: TUNNEL.zMin },
    { xMin: VAULT.xMin - WALL_T, xMax: VAULT.xMin, zMin: TUNNEL.zMax, zMax: VAULT.zMax },
    { xMin: VAULT.xMax, xMax: VAULT.xMax + WALL_T, zMin: VAULT.zMin, zMax: VAULT.zMax },
    {
      xMin: VAULT.xMin - WALL_T,
      xMax: VAULT.xMax + WALL_T,
      zMin: VAULT.zMin - WALL_T,
      zMax: VAULT.zMin,
    },
    // VAULT tape-library rows (custom meshes) with a center aisle gap.
    { xMin: 13.9, xMax: 16.4, zMin: -26.9, zMax: -26.1, hidden: true },
    { xMin: 17.6, xMax: 20.1, zMin: -26.9, zMax: -26.1, hidden: true },
    { xMin: 13.9, xMax: 16.4, zMin: -29.2, zMax: -28.4, hidden: true },
    { xMin: 17.6, xMax: 20.1, zMin: -29.2, zMax: -28.4, hidden: true },
    // Master-tape display case at the vault's south end.
    { xMin: 16.5, xMax: 17.5, zMin: -30.6, zMax: -29.8, hidden: true },
    // CORE north-west shelf (west of DOOR-2, below the LAB east wall).
    { xMin: CORE.xMin, xMax: D2_X_MIN, zMin: LAB.zMin - WALL_T, zMax: LAB.zMin },

    // CORE center obstacle: the server heart plinth (custom mesh).
    { xMin: 16.2, xMax: 17.8, zMin: -19.3, zMax: -17.7, hidden: true },
    // CORE terminal rack (west wall) + status cabinet (east wall) footprints.
    { xMin: CORE.xMin, xMax: CORE.xMin + 1.0, zMin: -17.2, zMax: -15.8, hidden: true },
    { xMin: CORE.xMax - 1.0, xMax: CORE.xMax, zMin: -19.2, zMax: -17.8, hidden: true },
    // CORE digital-twin rack bank along the north wall, east of DOOR-2.
    { xMin: 16.3, xMax: CORE.xMax, zMin: -14.2, zMax: LAB.zMin - WALL_T, hidden: true },
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
    {
      id: "door-vault",
      rect: { xMin: DV_X_MIN, xMax: DV_X_MAX, zMin: CORE.zMin - WALL_T, zMax: CORE.zMin },
      center: { x: (DV_X_MIN + DV_X_MAX) / 2, z: CORE.zMin - WALL_T / 2 },
      axis: "z",
      grants: "operator",
      label: "PINTU VAULT — COLD STORAGE",
      prompt: [
        "AKSES VAULT · penjaga arsip",
        "Aturan emas backup punya nama tiga angka:",
        "X salinan, 2 media, 1 offsite.",
        "Berapa X — total salinan datanya?",
      ],
      hint: "hint: sebut saja aturannya: X-2-1.",
      answers: ["3", "tiga", "3 salinan"],
    },
    {
      id: "door-hall",
      rect: {
        xMin: BENGKEL.xMin - WALL_T,
        xMax: BENGKEL.xMin,
        zMin: PASSAGE.zMin,
        zMax: PASSAGE.zMax,
      },
      center: { x: BENGKEL.xMin - WALL_T / 2, z: (PASSAGE.zMin + PASSAGE.zMax) / 2 },
      axis: "x",
      grants: "operator",
      label: "PINTU DATA HALL — AULA SERVER",
      prompt: [
        "AKSES DATA HALL · fasilitas",
        "Tinggi rak server full-size standar industri,",
        "dihitung dalam satuan 'U' — berapa U?",
      ],
      hint: "hint: juga jawaban atas segala pertanyaan di semesta.",
      answers: ["42", "42u"],
    },
    {
      // Second entrance to the VAULT: same id on purpose — solving either
      // side opens both (unlocked[] is keyed by id).
      id: "door-vault",
      rect: { xMin: VAULT.xMin - WALL_T, xMax: VAULT.xMin, zMin: TUNNEL.zMin, zMax: TUNNEL.zMax },
      center: { x: VAULT.xMin - WALL_T / 2, z: (TUNNEL.zMin + TUNNEL.zMax) / 2 },
      axis: "x",
      grants: "operator",
      label: "HATCH VAULT — UJUNG TEROWONGAN",
      prompt: [
        "AKSES VAULT · penjaga arsip",
        "Aturan emas backup punya nama tiga angka:",
        "X salinan, 2 media, 1 offsite.",
        "Berapa X — total salinan datanya?",
      ],
      hint: "hint: sebut saja aturannya: X-2-1.",
      answers: ["3", "tiga", "3 salinan"],
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
    {
      id: "vault",
      rect: { xMin: VAULT.xMin, xMax: VAULT.xMax, zMin: VAULT.zMin, zMax: VAULT.zMax },
      label: "VAULT",
    },
    {
      id: "hall",
      rect: { xMin: HALL.xMin, xMax: HALL.xMax, zMin: HALL.zMin, zMax: HALL.zMax },
      label: "DATA HALL",
    },
    {
      id: "tunnel",
      rect: { xMin: TUNNEL.xMin, xMax: TUNNEL.xMax, zMin: TUNNEL.zMin, zMax: TUNNEL.zMax },
      label: "TEROWONGAN",
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
    bounds: { xMin: HALL.xMin - 1, xMax: CORE.xMax + 1, zMin: VAULT.zMin - 1, zMax: 5.5 },
  };
}

/** Master-backup display case (vault south end); the collectible artifact. */
export const MASTER_TAPE_POS = { x: 17, z: -30.2 };

/** Decor-rack gaps World.tsx must leave open in EXPLORE mode. */
export const DOOR_GAPS = [
  { side: "right" as const, zMin: D1_Z_MIN - 0.7, zMax: D1_Z_MAX + 0.7 },
  { side: "left" as const, zMin: DW_Z_MIN - 0.7, zMax: DW_Z_MAX + 0.7 },
  // Cable-tunnel junction crossing the deep corridor (both rack walls).
  { side: "right" as const, zMin: TUNNEL.zMin - 0.7, zMax: TUNNEL.zMax + 0.7 },
  { side: "left" as const, zMin: TUNNEL.zMin - 0.7, zMax: TUNNEL.zMax + 0.7 },
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

/**
 * Digital-twin rack bank (CORE north wall, east of DOOR-2, facing south).
 * One rack per whitelisted real service — ids must match what
 * GET /api/room/services returns (room-server.ts TWIN_SERVICES).
 */
export const SERVICE_RACKS = [
  { id: "siku-backend", label: "SIKU API" },
  { id: "siku-frontend", label: "SIKU WEB" },
  { id: "postgres", label: "POSTGRES 16" },
  { id: "n8n", label: "N8N AUTOMATION" },
  { id: "portfolio", label: "PORTFOLIO — situs ini" },
].map((s, i) => ({ ...s, x: 16.9 + i * 1.22, z: -13.85 }));

/**
 * DATA HALL rack grid — single source shared by the HallRoom renderer and
 * the rack-hum audio emitters. Rows must shadow the hidden colliders above;
 * the center gap −24.7…−23.3 stays walkable.
 */
export const HALL_ROWS = [-16.8, -19.2, -21.6, -24, -26.4, -28.8] as const;
export const HALL_RACK_W = 1.24;
export const HALL_RACK_HALVES = [
  [-32, -25.3],
  [-22.7, -16],
] as const;

/** VAULT tape-library cabinets — single source for VaultRoom + rack hum. */
export const VAULT_TAPE_ROWS = [
  { x: 15.15, z: -26.5 },
  { x: 18.85, z: -26.5 },
  { x: 15.15, z: -28.8 },
  { x: 18.85, z: -28.8 },
];

/**
 * Rack-hum emitters (spatial audio): line segments the PlayerRig coupler
 * measures distance/direction against — the fan hum swells and stereo-pans
 * toward the nearest rack face. Derived from the placed content above so
 * the sound stays glued to the visible racks.
 */
export interface HumSegment {
  x1: number;
  z1: number;
  x2: number;
  z2: number;
}
export const RACK_HUM_SEGMENTS: HumSegment[] = [
  // AISLE-A corridor rack walls (walk-mode stations at ±SIDE_X).
  { x1: SIDE_X.left, z1: 2.5, x2: SIDE_X.left, z2: LAB.zMax + 0.5 },
  { x1: SIDE_X.right, z1: 2.5, x2: SIDE_X.right, z2: LAB.zMax + 0.5 },
  // LAB teaser slots along the north wall.
  {
    x1: LAB_PANELS[0].x,
    z1: LAB_PANELS[0].z,
    x2: LAB_PANELS[LAB_PANELS.length - 1].x,
    z2: LAB_PANELS[0].z,
  },
  // CORE digital-twin bank.
  {
    x1: SERVICE_RACKS[0].x,
    z1: SERVICE_RACKS[0].z,
    x2: SERVICE_RACKS[SERVICE_RACKS.length - 1].x,
    z2: SERVICE_RACKS[0].z,
  },
  // VAULT tape rows (point emitters).
  ...VAULT_TAPE_ROWS.map((r) => ({ x1: r.x, z1: r.z, x2: r.x, z2: r.z })),
  // DATA HALL rows (two walkable halves per row).
  ...HALL_ROWS.flatMap((z) =>
    HALL_RACK_HALVES.map(([xa, xb]) => ({ x1: xa, z1: z, x2: xb, z2: z })),
  ),
];

/** Fixed interactables beyond the two doors. */
export const TERMINAL_POS = { x: CORE.xMin + 1.05, z: -16.5 }; // faces east
export const NOTE_POS = { x: LAB.xMax - 0.45, z: -10.5 }; // east wall, faces west
export const HEART_POS = { x: 17, z: -18.5 };
export const STATUS_POS = { x: CORE.xMax - 1.05, z: -18.5 }; // faces west
export const HIRE_POS = { x: 17, z: CORE.zMin + 0.7 }; // south wall, faces north

export const ROOM_H = CORRIDOR.height;
