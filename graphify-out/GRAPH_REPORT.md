# Graph Report - portfolio  (2026-07-17)

## Corpus Check
- 112 files · ~95,910 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 739 nodes · 1383 edges · 37 communities (34 shown, 3 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 1 edges (avg confidence: 0.8)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `f3941449`
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
- [[_COMMUNITY_Community 21|Community 21]]
- [[_COMMUNITY_Community 22|Community 22]]
- [[_COMMUNITY_Community 23|Community 23]]
- [[_COMMUNITY_Community 25|Community 25]]
- [[_COMMUNITY_Community 26|Community 26]]
- [[_COMMUNITY_Community 27|Community 27]]
- [[_COMMUNITY_Community 28|Community 28]]
- [[_COMMUNITY_Community 30|Community 30]]
- [[_COMMUNITY_Community 31|Community 31]]
- [[_COMMUNITY_Community 32|Community 32]]
- [[_COMMUNITY_Community 34|Community 34]]
- [[_COMMUNITY_Community 36|Community 36]]
- [[_COMMUNITY_Community 37|Community 37]]
- [[_COMMUNITY_Community 38|Community 38]]
- [[_COMMUNITY_Community 44|Community 44]]

## God Nodes (most connected - your core abstractions)
1. `PALETTE` - 26 edges
2. `useExplore()` - 19 edges
3. `emit()` - 18 edges
4. `compilerOptions` - 17 edges
5. `cn()` - 16 edges
6. `getExploreState()` - 13 edges
7. `addToast()` - 13 edges
8. `RoomAudio` - 12 edges
9. `roomApi()` - 11 edges
10. `NightAudio` - 11 edges

## Surprising Connections (you probably didn't know these)
- `fetch()` --calls--> `asciiRoom()`  [EXTRACTED]
  serve.ts → ascii-room.ts
- `fetch()` --calls--> `roomApi()`  [EXTRACTED]
  serve.ts → room-server.ts
- `fetch()` --calls--> `roomUpgrade()`  [EXTRACTED]
  serve.ts → room-server.ts
- `scrollTopFor()` --calls--> `corridorEndZ()`  [EXTRACTED]
  src/components/three/serverroom/Hud.tsx → src/components/three/serverroom/CameraRig.tsx
- `scriptFor()` --calls--> `getExploreState()`  [EXTRACTED]
  src/components/three/serverroom/explore/NpcModal.tsx → src/components/three/serverroom/explore/store.ts

## Import Cycles
- None detected.

## Communities (37 total, 3 thin omitted)

### Community 0 - "Community 0"
Cohesion: 0.03
Nodes (58): dependencies, class-variance-authority, clsx, cmdk, date-fns, embla-carousel-react, framer-motion, @hookform/resolvers (+50 more)

### Community 2 - "Community 2"
Cohesion: 0.33
Nodes (5): Dust(), DOOR_GAPS, ExploreMap, autoFx(), PostFX()

### Community 3 - "Community 3"
Cohesion: 0.05
Nodes (38): askAssistant, messageSchema, consumeLastCapturedError(), renderErrorPage(), Route, Route, Route, Route (+30 more)

### Community 4 - "Community 4"
Cohesion: 0.16
Nodes (16): cn(), FadeIn(), FadeInProps, Magnetic(), MagneticProps, ScrambleText(), ScrambleTextProps, TextReveal() (+8 more)

### Community 5 - "Community 5"
Cohesion: 0.06
Nodes (34): devDependencies, eslint, eslint-config-prettier, @eslint/js, eslint-plugin-prettier, eslint-plugin-react-hooks, eslint-plugin-react-refresh, globals (+26 more)

### Community 6 - "Community 6"
Cohesion: 0.13
Nodes (14): SpotlightCard(), SpotlightCardProps, StaggerContainer(), StaggerContainerProps, StaggerItem(), Home(), principles, useRoomCapable() (+6 more)

### Community 8 - "Community 8"
Cohesion: 0.14
Nodes (23): DialogueLine, setDialogue(), ARWAH_LINES, durationOf(), Line, next(), queue, say() (+15 more)

### Community 9 - "Community 9"
Cohesion: 0.10
Nodes (19): compilerOptions, allowImportingTsExtensions, jsx, lib, module, moduleResolution, noEmit, noFallthroughCasesInSwitch (+11 more)

### Community 10 - "Community 10"
Cohesion: 0.07
Nodes (54): buildExploreMap(), Script, scriptFor(), handleRoster(), activeQuestInfo(), NpcId, NPCS, QUEST_NODES (+46 more)

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
Cohesion: 0.10
Nodes (21): Achievement, achievements, colophon, journey, JourneyCategory, JourneyEntry, projects, Skill (+13 more)

### Community 15 - "Community 15"
Cohesion: 0.10
Nodes (19): Architecture, Backlog "MOKSA.CLOUD" — konsep mode horor kejar-kejaran (disetujui konsep? MENUNGGU user; draft 2026-07-15), Backlog ROOT ACCESS — fitur keren untuk sesi AI berikutnya (mandat user 2026-07-12), Blockers, Changelog, Chatbot Assistant (2026-06-29) — LIVE, Completed Tasks, Current Status (+11 more)

### Community 17 - "Community 17"
Cohesion: 0.21
Nodes (10): Project, projectBySlug(), ProjectStatus, secondaryProjects, ArchDiagram(), FlagshipProject(), ProjectCard(), config (+2 more)

### Community 18 - "Community 18"
Cohesion: 0.07
Nodes (40): DoorGate(), ExploreHud(), ExploreWorld(), HIRE_STATION, HOUSE_LIGHT_BASE, STATUS_STATION, wallCenter(), Hologram() (+32 more)

### Community 19 - "Community 19"
Cohesion: 0.20
Nodes (7): site, Footer(), Container(), PageShell(), Scene, SceneCanvas(), CommandPalette()

### Community 21 - "Community 21"
Cohesion: 0.05
Nodes (40): FirstPersonArms(), Gait, OPERATOR_LOOK, ThirdPersonBody(), blocked(), slideMove(), HumanoidFigure(), HumanoidLook (+32 more)

### Community 22 - "Community 22"
Cohesion: 0.27
Nodes (5): cents(), clamp01(), NightAudio, PARTIALS, SLENDRO

### Community 23 - "Community 23"
Cohesion: 0.31
Nodes (6): buildNetwork(), Cables(), ceilingRun(), floorRun(), makeTube(), TRUNK_X

### Community 25 - "Community 25"
Cohesion: 0.14
Nodes (18): LoginModal(), Auth, authRequest(), connectPresence(), disconnectPresence(), loadAuth(), logout(), PeerMotion (+10 more)

### Community 26 - "Community 26"
Cohesion: 0.24
Nodes (8): corridorEndZ(), endMargin(), progressToZ(), RoomCameraRig(), useActiveStation(), RoomHUD(), scrollTopFor(), Station

### Community 27 - "Community 27"
Cohesion: 0.22
Nodes (12): cardStyle, cardW(), ContactScreen(), EntranceScreen(), kickerStyle, linkStyle, Panels(), pillStyle (+4 more)

### Community 28 - "Community 28"
Cohesion: 0.33
Nodes (5): Dokumen, Jalankan (dev), Peta folder `src/`, Portfolio — Mulai dari sini, Stack

### Community 31 - "Community 31"
Cohesion: 0.11
Nodes (27): asciiRoom(), center(), fmtUptime(), hostLine(), RACK_LABEL, rackLines(), attempts, clients (+19 more)

### Community 32 - "Community 32"
Cohesion: 0.40
Nodes (4): Monogram(), Props, links, Nav()

### Community 34 - "Community 34"
Cohesion: 0.25
Nodes (7): Aturan keras untuk SEMUA modul, Geometri dunia, Integrasi (dikerjakan integrator, bukan agent), Pembagian modul (1 file per agent), Perluasan digital twin (backlog-1, 2026-07-16 — ServiceRacks/room-server), Security (WAJIB — StatusRack/roomStatus), The Server Room — build contract (v1)

### Community 36 - "Community 36"
Cohesion: 0.20
Nodes (12): finiteOrNull(), getRoomStatus, NULL_STATUS, readProc(), RoomStatus, formatRam(), formatUptime(), labelStyle (+4 more)

### Community 44 - "Community 44"
Cohesion: 0.21
Nodes (8): downloadCertificate(), CORRIDOR, PALETTE, SIDE_X, StationKind, StationProject, WallGap, World()

## Knowledge Gaps
- **286 isolated node(s):** `RACK_LABEL`, `$schema`, `style`, `rsc`, `tsx` (+281 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **3 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `site` connect `Community 19` to `Community 25`, `Community 27`, `Community 14`, `Community 6`?**
  _High betweenness centrality (0.030) - this node is a cross-community bridge._
- **Why does `PALETTE` connect `Community 44` to `Community 2`, `Community 36`, `Community 10`, `Community 18`, `Community 21`, `Community 23`, `Community 25`, `Community 26`, `Community 27`?**
  _High betweenness centrality (0.021) - this node is a cross-community bridge._
- **Why does `NightAudio` connect `Community 22` to `Community 21`?**
  _High betweenness centrality (0.016) - this node is a cross-community bridge._
- **What connects `RACK_LABEL`, `$schema`, `style` to the rest of the system?**
  _286 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Community 0` be split into smaller, more focused modules?**
  _Cohesion score 0.034482758620689655 - nodes in this community are weakly interconnected._
- **Should `Community 3` be split into smaller, more focused modules?**
  _Cohesion score 0.052597402597402594 - nodes in this community are weakly interconnected._
- **Should `Community 5` be split into smaller, more focused modules?**
  _Cohesion score 0.05714285714285714 - nodes in this community are weakly interconnected._