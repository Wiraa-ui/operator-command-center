# Graph Report - portfolio  (2026-07-16)

## Corpus Check
- 102 files · ~85,168 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 668 nodes · 1202 edges · 42 communities (40 shown, 2 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `6bf4f6db`
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
- [[_COMMUNITY_Community 32|Community 32]]
- [[_COMMUNITY_Community 33|Community 33]]
- [[_COMMUNITY_Community 34|Community 34]]
- [[_COMMUNITY_Community 35|Community 35]]
- [[_COMMUNITY_Community 36|Community 36]]
- [[_COMMUNITY_Community 37|Community 37]]
- [[_COMMUNITY_Community 38|Community 38]]
- [[_COMMUNITY_Community 40|Community 40]]

## God Nodes (most connected - your core abstractions)
1. `PALETTE` - 19 edges
2. `emit()` - 17 edges
3. `compilerOptions` - 17 edges
4. `cn()` - 16 edges
5. `useExplore()` - 15 edges
6. `RoomAudio` - 12 edges
7. `NightAudio` - 11 edges
8. `Station` - 11 edges
9. `site` - 10 edges
10. `setModal()` - 9 edges

## Surprising Connections (you probably didn't know these)
- `fetch()` --calls--> `roomApi()`  [EXTRACTED]
  serve.ts → room-server.ts
- `fetch()` --calls--> `roomUpgrade()`  [EXTRACTED]
  serve.ts → room-server.ts
- `scrollTopFor()` --calls--> `corridorEndZ()`  [EXTRACTED]
  src/components/three/serverroom/Hud.tsx → src/components/three/serverroom/CameraRig.tsx
- `OnlinePlayers()` --calls--> `useExplore()`  [EXTRACTED]
  src/components/three/serverroom/explore/OnlinePlayers.tsx → src/components/three/serverroom/explore/store.ts
- `TerminalModal()` --calls--> `useExplore()`  [EXTRACTED]
  src/components/three/serverroom/explore/TerminalModal.tsx → src/components/three/serverroom/explore/store.ts

## Import Cycles
- None detected.

## Communities (42 total, 2 thin omitted)

### Community 0 - "Community 0"
Cohesion: 0.03
Nodes (58): dependencies, class-variance-authority, clsx, cmdk, date-fns, embla-carousel-react, framer-motion, @hookform/resolvers (+50 more)

### Community 2 - "Community 2"
Cohesion: 0.12
Nodes (18): Achievement, achievements, colophon, journey, JourneyCategory, JourneyEntry, secondaryProjects, Skill (+10 more)

### Community 3 - "Community 3"
Cohesion: 0.05
Nodes (38): askAssistant, messageSchema, consumeLastCapturedError(), renderErrorPage(), Route, Route, Route, Route (+30 more)

### Community 4 - "Community 4"
Cohesion: 0.28
Nodes (7): Project, projects, ProjectStatus, ArchDiagram(), config, StatusBadge(), TechPillRow()

### Community 5 - "Community 5"
Cohesion: 0.06
Nodes (34): devDependencies, eslint, eslint-config-prettier, @eslint/js, eslint-plugin-prettier, eslint-plugin-react-hooks, eslint-plugin-react-refresh, globals (+26 more)

### Community 6 - "Community 6"
Cohesion: 0.14
Nodes (18): cn(), FadeIn(), FadeInProps, Magnetic(), MagneticProps, ScrambleText(), ScrambleTextProps, SpotlightCard() (+10 more)

### Community 8 - "Community 8"
Cohesion: 0.09
Nodes (34): DialogueLine, getExploreState(), setDialogue(), ArsipRack(), GHOST_SLICES, KIRANA_LOOK, KiranaBody(), VhsGhost() (+26 more)

### Community 9 - "Community 9"
Cohesion: 0.10
Nodes (19): compilerOptions, allowImportingTsExtensions, jsx, lib, module, moduleResolution, noEmit, noFallthroughCasesInSwitch (+11 more)

### Community 10 - "Community 10"
Cohesion: 0.15
Nodes (23): addAchievement(), addToast(), beginNightShift(), cancelPurge(), completePurge(), DoorId, emit(), endNightShift() (+15 more)

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
Cohesion: 0.21
Nodes (7): site, Footer(), Container(), PageShell(), Scene, SceneCanvas(), CommandPalette()

### Community 15 - "Community 15"
Cohesion: 0.10
Nodes (19): Architecture, Backlog "MOKSA.CLOUD" — konsep mode horor kejar-kejaran (disetujui konsep? MENUNGGU user; draft 2026-07-15), Backlog ROOT ACCESS — fitur keren untuk sesi AI berikutnya (mandat user 2026-07-12), Blockers, Changelog, Chatbot Assistant (2026-06-29) — LIVE, Completed Tasks, Current Status (+11 more)

### Community 17 - "Community 17"
Cohesion: 0.11
Nodes (20): FirstPersonArms(), Gait, OPERATOR_LOOK, ThirdPersonBody(), ExploreMap, TERMINAL_POS, Minimap(), HELD_KEYS (+12 more)

### Community 18 - "Community 18"
Cohesion: 0.14
Nodes (19): DoorGate(), ExploreHud(), ExploreWorld(), HIRE_STATION, STATUS_STATION, wallCenter(), CORE, HEART_POS (+11 more)

### Community 19 - "Community 19"
Cohesion: 0.16
Nodes (7): RoomAudio, DoorDef, PuzzleModal(), BANNER, HELP, Line, TerminalModal()

### Community 20 - "Community 20"
Cohesion: 0.24
Nodes (12): LoginModal(), Auth, authRequest(), connectPresence(), disconnectPresence(), handleRoster(), loadAuth(), logout() (+4 more)

### Community 21 - "Community 21"
Cohesion: 0.16
Nodes (11): StaggerContainer(), StaggerContainerProps, StaggerItem(), Home(), principles, useRoomCapable(), ImageSlot(), ImageSlotProps (+3 more)

### Community 22 - "Community 22"
Cohesion: 0.27
Nodes (5): cents(), clamp01(), NightAudio, PARTIALS, SLENDRO

### Community 23 - "Community 23"
Cohesion: 0.20
Nodes (12): finiteOrNull(), getRoomStatus, NULL_STATUS, readProc(), RoomStatus, formatRam(), formatUptime(), labelStyle (+4 more)

### Community 24 - "Community 24"
Cohesion: 0.21
Nodes (8): downloadCertificate(), CORRIDOR, PALETTE, SIDE_X, StationKind, StationProject, WallGap, World()

### Community 25 - "Community 25"
Cohesion: 0.21
Nodes (7): HumanoidFigure(), HumanoidLook, HumanoidPose, useLookAssets(), peerState, OnlinePlayers(), PEER_LOOK

### Community 26 - "Community 26"
Cohesion: 0.27
Nodes (7): corridorEndZ(), endMargin(), progressToZ(), useActiveStation(), RoomHUD(), scrollTopFor(), Station

### Community 27 - "Community 27"
Cohesion: 0.24
Nodes (11): cardStyle, cardW(), ContactScreen(), EntranceScreen(), kickerStyle, linkStyle, pillStyle, ProjectScreen() (+3 more)

### Community 28 - "Community 28"
Cohesion: 0.33
Nodes (5): Dokumen, Jalankan (dev), Peta folder `src/`, Portfolio — Mulai dari sini, Stack

### Community 29 - "Community 29"
Cohesion: 0.27
Nodes (6): FadeInStagger(), FadeInStaggerItem(), FadeInStaggerProps, FlagshipProject(), ProjectCard(), SectionHeader()

### Community 31 - "Community 31"
Cohesion: 0.17
Nodes (17): attempts, clients, DATA_DIR, db, json(), newSession(), rateLimited(), readCreds() (+9 more)

### Community 32 - "Community 32"
Cohesion: 0.36
Nodes (5): buildNetwork(), ceilingRun(), floorRun(), makeTube(), TRUNK_X

### Community 33 - "Community 33"
Cohesion: 0.29
Nodes (6): buildExploreMap(), beginSession(), resetPlayer(), RoomCanvas, ServerRoomExperience(), getStations()

### Community 34 - "Community 34"
Cohesion: 0.29
Nodes (6): Aturan keras untuk SEMUA modul, Geometri dunia, Integrasi (dikerjakan integrator, bukan agent), Pembagian modul (1 file per agent), Security (WAJIB — StatusRack/roomStatus), The Server Room — build contract (v1)

### Community 35 - "Community 35"
Cohesion: 0.33
Nodes (4): DOOR_GAPS, Cables(), RoomCameraRig(), Panels()

### Community 36 - "Community 36"
Cohesion: 0.40
Nodes (4): Monogram(), Props, links, Nav()

### Community 38 - "Community 38"
Cohesion: 0.60
Nodes (4): projectBySlug(), setModal(), h2Style, StudyModal()

### Community 40 - "Community 40"
Cohesion: 0.67
Nodes (3): blocked(), slideMove(), WallRect

## Knowledge Gaps
- **269 isolated node(s):** `$schema`, `style`, `rsc`, `tsx`, `css` (+264 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **2 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `site` connect `Community 14` to `Community 27`, `Community 2`, `Community 19`, `Community 21`?**
  _High betweenness centrality (0.029) - this node is a cross-community bridge._
- **Why does `NightAudio` connect `Community 22` to `Community 8`?**
  _High betweenness centrality (0.017) - this node is a cross-community bridge._
- **Why does `PALETTE` connect `Community 24` to `Community 32`, `Community 35`, `Community 38`, `Community 8`, `Community 17`, `Community 18`, `Community 19`, `Community 20`, `Community 23`, `Community 25`, `Community 26`, `Community 27`?**
  _High betweenness centrality (0.017) - this node is a cross-community bridge._
- **What connects `$schema`, `style`, `rsc` to the rest of the system?**
  _269 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Community 0` be split into smaller, more focused modules?**
  _Cohesion score 0.034482758620689655 - nodes in this community are weakly interconnected._
- **Should `Community 2` be split into smaller, more focused modules?**
  _Cohesion score 0.11576354679802955 - nodes in this community are weakly interconnected._
- **Should `Community 3` be split into smaller, more focused modules?**
  _Cohesion score 0.052597402597402594 - nodes in this community are weakly interconnected._