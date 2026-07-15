# Graph Report - portfolio  (2026-07-16)

## Corpus Check
- 104 files · ~88,512 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 695 nodes · 1286 edges · 32 communities (30 shown, 2 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `bd575f00`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- [[_COMMUNITY_Community 0|Community 0]]
- [[_COMMUNITY_Community 2|Community 2]]
- [[_COMMUNITY_Community 3|Community 3]]
- [[_COMMUNITY_Community 5|Community 5]]
- [[_COMMUNITY_Community 6|Community 6]]
- [[_COMMUNITY_Community 8|Community 8]]
- [[_COMMUNITY_Community 9|Community 9]]
- [[_COMMUNITY_Community 10|Community 10]]
- [[_COMMUNITY_Community 11|Community 11]]
- [[_COMMUNITY_Community 12|Community 12]]
- [[_COMMUNITY_Community 13|Community 13]]
- [[_COMMUNITY_Community 15|Community 15]]
- [[_COMMUNITY_Community 18|Community 18]]
- [[_COMMUNITY_Community 19|Community 19]]
- [[_COMMUNITY_Community 22|Community 22]]
- [[_COMMUNITY_Community 23|Community 23]]
- [[_COMMUNITY_Community 24|Community 24]]
- [[_COMMUNITY_Community 25|Community 25]]
- [[_COMMUNITY_Community 26|Community 26]]
- [[_COMMUNITY_Community 27|Community 27]]
- [[_COMMUNITY_Community 28|Community 28]]
- [[_COMMUNITY_Community 30|Community 30]]
- [[_COMMUNITY_Community 31|Community 31]]
- [[_COMMUNITY_Community 32|Community 32]]
- [[_COMMUNITY_Community 34|Community 34]]
- [[_COMMUNITY_Community 35|Community 35]]
- [[_COMMUNITY_Community 37|Community 37]]

## God Nodes (most connected - your core abstractions)
1. `PALETTE` - 20 edges
2. `emit()` - 18 edges
3. `useExplore()` - 17 edges
4. `compilerOptions` - 17 edges
5. `cn()` - 16 edges
6. `getExploreState()` - 13 edges
7. `RoomAudio` - 12 edges
8. `NightAudio` - 11 edges
9. `addToast()` - 11 edges
10. `Station` - 11 edges

## Surprising Connections (you probably didn't know these)
- `fetch()` --calls--> `roomApi()`  [EXTRACTED]
  serve.ts → room-server.ts
- `fetch()` --calls--> `roomUpgrade()`  [EXTRACTED]
  serve.ts → room-server.ts
- `scrollTopFor()` --calls--> `corridorEndZ()`  [EXTRACTED]
  src/components/three/serverroom/Hud.tsx → src/components/three/serverroom/CameraRig.tsx
- `DoorGate()` --calls--> `useExplore()`  [EXTRACTED]
  src/components/three/serverroom/explore/DoorGate.tsx → src/components/three/serverroom/explore/store.ts
- `scriptFor()` --calls--> `getExploreState()`  [EXTRACTED]
  src/components/three/serverroom/explore/NpcModal.tsx → src/components/three/serverroom/explore/store.ts

## Import Cycles
- None detected.

## Communities (32 total, 2 thin omitted)

### Community 0 - "Community 0"
Cohesion: 0.03
Nodes (58): dependencies, class-variance-authority, clsx, cmdk, date-fns, embla-carousel-react, framer-motion, @hookform/resolvers (+50 more)

### Community 2 - "Community 2"
Cohesion: 0.06
Nodes (41): Achievement, achievements, colophon, journey, JourneyCategory, JourneyEntry, Project, projects (+33 more)

### Community 3 - "Community 3"
Cohesion: 0.05
Nodes (38): askAssistant, messageSchema, consumeLastCapturedError(), renderErrorPage(), Route, Route, Route, Route (+30 more)

### Community 5 - "Community 5"
Cohesion: 0.06
Nodes (34): devDependencies, eslint, eslint-config-prettier, @eslint/js, eslint-plugin-prettier, eslint-plugin-react-hooks, eslint-plugin-react-refresh, globals (+26 more)

### Community 6 - "Community 6"
Cohesion: 0.08
Nodes (31): cn(), FadeIn(), FadeInProps, Magnetic(), MagneticProps, ScrambleText(), ScrambleTextProps, SpotlightCard() (+23 more)

### Community 8 - "Community 8"
Cohesion: 0.07
Nodes (39): blocked(), slideMove(), SPAWN, WallRect, DialogueLine, setDialogue(), ArsipRack(), GHOST_SLICES (+31 more)

### Community 9 - "Community 9"
Cohesion: 0.10
Nodes (19): compilerOptions, allowImportingTsExtensions, jsx, lib, module, moduleResolution, noEmit, noFallthroughCasesInSwitch (+11 more)

### Community 10 - "Community 10"
Cohesion: 0.06
Nodes (65): FirstPersonArms(), Gait, OPERATOR_LOOK, ThirdPersonBody(), buildExploreMap(), ExploreMap, TERMINAL_POS, Minimap() (+57 more)

### Community 11 - "Community 11"
Cohesion: 0.11
Nodes (18): aliases, components, hooks, lib, ui, utils, iconLibrary, registries (+10 more)

### Community 12 - "Community 12"
Cohesion: 0.11
Nodes (17): Additional Forbidden Patterns, Anti-Patterns (Do NOT Use), Buttons, Cards, Color Palette, Component Specs, Design System Master File, Global Rules (+9 more)

### Community 13 - "Community 13"
Cohesion: 0.13
Nodes (6): samplePath(), Scene(), smooth(), Station, STATIONS, usePrefersReducedMotion()

### Community 15 - "Community 15"
Cohesion: 0.10
Nodes (19): Architecture, Backlog "MOKSA.CLOUD" — konsep mode horor kejar-kejaran (disetujui konsep? MENUNGGU user; draft 2026-07-15), Backlog ROOT ACCESS — fitur keren untuk sesi AI berikutnya (mandat user 2026-07-12), Blockers, Changelog, Chatbot Assistant (2026-06-29) — LIVE, Completed Tasks, Current Status (+11 more)

### Community 18 - "Community 18"
Cohesion: 0.18
Nodes (15): DoorGate(), HIRE_STATION, STATUS_STATION, BENGKEL, CORE, DoorDef, HEART_POS, HIRE_POS (+7 more)

### Community 19 - "Community 19"
Cohesion: 0.09
Nodes (27): projectBySlug(), RoomAudio, downloadCertificate(), LoginModal(), Auth, authRequest(), connectPresence(), disconnectPresence() (+19 more)

### Community 22 - "Community 22"
Cohesion: 0.27
Nodes (5): cents(), clamp01(), NightAudio, PARTIALS, SLENDRO

### Community 23 - "Community 23"
Cohesion: 0.20
Nodes (12): finiteOrNull(), getRoomStatus, NULL_STATUS, readProc(), RoomStatus, formatRam(), formatUptime(), labelStyle (+4 more)

### Community 24 - "Community 24"
Cohesion: 0.28
Nodes (5): CORRIDOR, SIDE_X, StationKind, StationProject, WallGap

### Community 25 - "Community 25"
Cohesion: 0.19
Nodes (8): HumanoidFigure(), HumanoidLook, HumanoidPose, useLookAssets(), peerState, OnlinePlayers(), PEER_LOOK, NpcDef

### Community 26 - "Community 26"
Cohesion: 0.27
Nodes (7): corridorEndZ(), endMargin(), progressToZ(), useActiveStation(), RoomHUD(), scrollTopFor(), Station

### Community 27 - "Community 27"
Cohesion: 0.24
Nodes (11): cardStyle, cardW(), ContactScreen(), EntranceScreen(), kickerStyle, linkStyle, pillStyle, ProjectScreen() (+3 more)

### Community 28 - "Community 28"
Cohesion: 0.33
Nodes (5): Dokumen, Jalankan (dev), Peta folder `src/`, Portfolio — Mulai dari sini, Stack

### Community 31 - "Community 31"
Cohesion: 0.17
Nodes (17): attempts, clients, DATA_DIR, db, json(), newSession(), rateLimited(), readCreds() (+9 more)

### Community 32 - "Community 32"
Cohesion: 0.31
Nodes (6): buildNetwork(), Cables(), ceilingRun(), floorRun(), makeTube(), TRUNK_X

### Community 34 - "Community 34"
Cohesion: 0.29
Nodes (6): Aturan keras untuk SEMUA modul, Geometri dunia, Integrasi (dikerjakan integrator, bukan agent), Pembagian modul (1 file per agent), Security (WAJIB — StatusRack/roomStatus), The Server Room — build contract (v1)

### Community 35 - "Community 35"
Cohesion: 0.17
Nodes (11): ExploreHud(), ExploreWorld(), wallCenter(), DOOR_GAPS, NpcModal(), PlayerRig(), useExplore(), NightShift() (+3 more)

## Knowledge Gaps
- **276 isolated node(s):** `$schema`, `style`, `rsc`, `tsx`, `css` (+271 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **2 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `site` connect `Community 2` to `Community 27`, `Community 19`, `Community 6`?**
  _High betweenness centrality (0.029) - this node is a cross-community bridge._
- **Why does `NightAudio` connect `Community 22` to `Community 8`?**
  _High betweenness centrality (0.017) - this node is a cross-community bridge._
- **Why does `PALETTE` connect `Community 19` to `Community 32`, `Community 35`, `Community 8`, `Community 10`, `Community 18`, `Community 23`, `Community 24`, `Community 25`, `Community 26`, `Community 27`?**
  _High betweenness centrality (0.016) - this node is a cross-community bridge._
- **What connects `$schema`, `style`, `rsc` to the rest of the system?**
  _276 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Community 0` be split into smaller, more focused modules?**
  _Cohesion score 0.034482758620689655 - nodes in this community are weakly interconnected._
- **Should `Community 2` be split into smaller, more focused modules?**
  _Cohesion score 0.05627545353572751 - nodes in this community are weakly interconnected._
- **Should `Community 3` be split into smaller, more focused modules?**
  _Cohesion score 0.052597402597402594 - nodes in this community are weakly interconnected._