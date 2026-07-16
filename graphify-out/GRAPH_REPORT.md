# Graph Report - portfolio  (2026-07-16)

## Corpus Check
- 105 files · ~90,225 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 704 nodes · 1301 edges · 37 communities (35 shown, 2 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 1 edges (avg confidence: 0.8)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `fb8d0d45`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- [[_COMMUNITY_Community 0|Community 0]]
- [[_COMMUNITY_Community 2|Community 2]]
- [[_COMMUNITY_Community 3|Community 3]]
- [[_COMMUNITY_Community 4|Community 4]]
- [[_COMMUNITY_Community 5|Community 5]]
- [[_COMMUNITY_Community 6|Community 6]]
- [[_COMMUNITY_Community 8|Community 8]]
- [[_COMMUNITY_Community 9|Community 9]]
- [[_COMMUNITY_Community 10|Community 10]]
- [[_COMMUNITY_Community 11|Community 11]]
- [[_COMMUNITY_Community 12|Community 12]]
- [[_COMMUNITY_Community 13|Community 13]]
- [[_COMMUNITY_Community 14|Community 14]]
- [[_COMMUNITY_Community 15|Community 15]]
- [[_COMMUNITY_Community 17|Community 17]]
- [[_COMMUNITY_Community 18|Community 18]]
- [[_COMMUNITY_Community 19|Community 19]]
- [[_COMMUNITY_Community 20|Community 20]]
- [[_COMMUNITY_Community 21|Community 21]]
- [[_COMMUNITY_Community 22|Community 22]]
- [[_COMMUNITY_Community 23|Community 23]]
- [[_COMMUNITY_Community 24|Community 24]]
- [[_COMMUNITY_Community 25|Community 25]]
- [[_COMMUNITY_Community 26|Community 26]]
- [[_COMMUNITY_Community 27|Community 27]]
- [[_COMMUNITY_Community 28|Community 28]]
- [[_COMMUNITY_Community 29|Community 29]]
- [[_COMMUNITY_Community 30|Community 30]]
- [[_COMMUNITY_Community 31|Community 31]]
- [[_COMMUNITY_Community 34|Community 34]]
- [[_COMMUNITY_Community 35|Community 35]]
- [[_COMMUNITY_Community 37|Community 37]]

## God Nodes (most connected - your core abstractions)
1. `PALETTE` - 21 edges
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
- `ExploreHud()` --calls--> `useExplore()`  [EXTRACTED]
  src/components/three/serverroom/explore/ExploreHud.tsx → src/components/three/serverroom/explore/store.ts

## Import Cycles
- None detected.

## Communities (37 total, 2 thin omitted)

### Community 0 - "Community 0"
Cohesion: 0.03
Nodes (58): dependencies, class-variance-authority, clsx, cmdk, date-fns, embla-carousel-react, framer-motion, @hookform/resolvers (+50 more)

### Community 2 - "Community 2"
Cohesion: 0.11
Nodes (19): Achievement, achievements, colophon, journey, JourneyCategory, JourneyEntry, secondaryProjects, Skill (+11 more)

### Community 3 - "Community 3"
Cohesion: 0.05
Nodes (37): askAssistant, messageSchema, consumeLastCapturedError(), renderErrorPage(), Route, Route, Route, Route (+29 more)

### Community 4 - "Community 4"
Cohesion: 0.16
Nodes (16): cn(), FadeIn(), FadeInProps, Magnetic(), MagneticProps, ScrambleText(), ScrambleTextProps, TextReveal() (+8 more)

### Community 5 - "Community 5"
Cohesion: 0.10
Nodes (21): devDependencies, eslint, eslint-config-prettier, @eslint/js, eslint-plugin-prettier, eslint-plugin-react-hooks, eslint-plugin-react-refresh, globals (+13 more)

### Community 6 - "Community 6"
Cohesion: 0.12
Nodes (15): SpotlightCard(), SpotlightCardProps, StaggerContainer(), StaggerContainerProps, StaggerItem(), Home(), principles, useRoomCapable() (+7 more)

### Community 8 - "Community 8"
Cohesion: 0.08
Nodes (37): LAB, SPAWN, DialogueLine, setDialogue(), ArsipRack(), GHOST_SLICES, KIRANA_LOOK, KiranaBody() (+29 more)

### Community 9 - "Community 9"
Cohesion: 0.10
Nodes (19): compilerOptions, allowImportingTsExtensions, jsx, lib, module, moduleResolution, noEmit, noFallthroughCasesInSwitch (+11 more)

### Community 10 - "Community 10"
Cohesion: 0.05
Nodes (67): projectBySlug(), RoomAudio, downloadCertificate(), LoginModal(), Script, scriptFor(), Auth, authRequest() (+59 more)

### Community 11 - "Community 11"
Cohesion: 0.11
Nodes (18): aliases, components, hooks, lib, ui, utils, iconLibrary, registries (+10 more)

### Community 12 - "Community 12"
Cohesion: 0.11
Nodes (17): Additional Forbidden Patterns, Anti-Patterns (Do NOT Use), Buttons, Cards, Color Palette, Component Specs, Design System Master File, Global Rules (+9 more)

### Community 13 - "Community 13"
Cohesion: 0.13
Nodes (6): samplePath(), Scene(), smooth(), Station, STATIONS, usePrefersReducedMotion()

### Community 14 - "Community 14"
Cohesion: 0.16
Nodes (13): ExploreMap, TERMINAL_POS, HELD_KEYS, MOVE_KEYS, QUEST_NODES, input, ARSIP_RACKS, ArsipDef (+5 more)

### Community 15 - "Community 15"
Cohesion: 0.10
Nodes (19): Architecture, Backlog "MOKSA.CLOUD" — konsep mode horor kejar-kejaran (disetujui konsep? MENUNGGU user; draft 2026-07-15), Backlog ROOT ACCESS — fitur keren untuk sesi AI berikutnya (mandat user 2026-07-12), Blockers, Changelog, Chatbot Assistant (2026-06-29) — LIVE, Completed Tasks, Current Status (+11 more)

### Community 17 - "Community 17"
Cohesion: 0.28
Nodes (7): Project, projects, ProjectStatus, ArchDiagram(), config, StatusBadge(), TechPillRow()

### Community 18 - "Community 18"
Cohesion: 0.13
Nodes (19): DoorGate(), HIRE_STATION, STATUS_STATION, BENGKEL, CORE, DOOR_GAPS, DoorDef, HEART_POS (+11 more)

### Community 19 - "Community 19"
Cohesion: 0.27
Nodes (6): site, Route, Footer(), Container(), PageShell(), CommandPalette()

### Community 20 - "Community 20"
Cohesion: 0.27
Nodes (6): FadeInStagger(), FadeInStaggerItem(), FadeInStaggerProps, FlagshipProject(), ProjectCard(), SectionHeader()

### Community 21 - "Community 21"
Cohesion: 0.25
Nodes (7): ExploreHud(), buildExploreMap(), Minimap(), beginSession(), resetPlayer(), RoomCanvas, ServerRoomExperience()

### Community 22 - "Community 22"
Cohesion: 0.27
Nodes (5): cents(), clamp01(), NightAudio, PARTIALS, SLENDRO

### Community 23 - "Community 23"
Cohesion: 0.06
Nodes (45): finiteOrNull(), getRoomStatus, NULL_STATUS, readProc(), RoomStatus, buildNetwork(), Cables(), ceilingRun() (+37 more)

### Community 24 - "Community 24"
Cohesion: 0.29
Nodes (6): engines, node, name, private, sideEffects, type

### Community 25 - "Community 25"
Cohesion: 0.18
Nodes (10): FirstPersonArms(), Gait, OPERATOR_LOOK, ThirdPersonBody(), HumanoidFigure(), HumanoidLook, HumanoidPose, useLookAssets() (+2 more)

### Community 26 - "Community 26"
Cohesion: 0.29
Nodes (7): scripts, build, build:dev, dev, format, lint, preview

### Community 27 - "Community 27"
Cohesion: 0.40
Nodes (4): Monogram(), Props, links, Nav()

### Community 28 - "Community 28"
Cohesion: 0.33
Nodes (5): Dokumen, Jalankan (dev), Peta folder `src/`, Portfolio — Mulai dari sini, Stack

### Community 29 - "Community 29"
Cohesion: 0.67
Nodes (3): blocked(), slideMove(), WallRect

### Community 31 - "Community 31"
Cohesion: 0.15
Nodes (19): attempts, clients, DATA_DIR, db, json(), newSession(), rateLimited(), readCreds() (+11 more)

### Community 34 - "Community 34"
Cohesion: 0.25
Nodes (7): Aturan keras untuk SEMUA modul, Geometri dunia, Integrasi (dikerjakan integrator, bukan agent), Pembagian modul (1 file per agent), Perluasan digital twin (backlog-1, 2026-07-16 — ServiceRacks/room-server), Security (WAJIB — StatusRack/roomStatus), The Server Room — build contract (v1)

### Community 35 - "Community 35"
Cohesion: 0.20
Nodes (9): ExploreWorld(), wallCenter(), NpcModal(), peerState, OnlinePlayers(), PEER_LOOK, PlayerRig(), useExplore() (+1 more)

## Knowledge Gaps
- **279 isolated node(s):** `$schema`, `style`, `rsc`, `tsx`, `css` (+274 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **2 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `site` connect `Community 19` to `Community 2`, `Community 10`, `Community 6`, `Community 23`?**
  _High betweenness centrality (0.029) - this node is a cross-community bridge._
- **Why does `PALETTE` connect `Community 23` to `Community 35`, `Community 8`, `Community 10`, `Community 14`, `Community 18`, `Community 25`?**
  _High betweenness centrality (0.017) - this node is a cross-community bridge._
- **Why does `NightAudio` connect `Community 22` to `Community 8`?**
  _High betweenness centrality (0.017) - this node is a cross-community bridge._
- **What connects `$schema`, `style`, `rsc` to the rest of the system?**
  _279 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Community 0` be split into smaller, more focused modules?**
  _Cohesion score 0.034482758620689655 - nodes in this community are weakly interconnected._
- **Should `Community 2` be split into smaller, more focused modules?**
  _Cohesion score 0.1103448275862069 - nodes in this community are weakly interconnected._
- **Should `Community 3` be split into smaller, more focused modules?**
  _Cohesion score 0.0531986531986532 - nodes in this community are weakly interconnected._