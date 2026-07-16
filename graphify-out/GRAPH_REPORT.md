# Graph Report - portfolio  (2026-07-16)

## Corpus Check
- 106 files · ~91,017 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 711 nodes · 1315 edges · 37 communities (35 shown, 2 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 1 edges (avg confidence: 0.8)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `cd0ba630`
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
- [[_COMMUNITY_Community 34|Community 34]]
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
- `fetch()` --calls--> `asciiRoom()`  [EXTRACTED]
  serve.ts → ascii-room.ts
- `fetch()` --calls--> `roomApi()`  [EXTRACTED]
  serve.ts → room-server.ts
- `fetch()` --calls--> `roomUpgrade()`  [EXTRACTED]
  serve.ts → room-server.ts
- `scrollTopFor()` --calls--> `corridorEndZ()`  [EXTRACTED]
  src/components/three/serverroom/Hud.tsx → src/components/three/serverroom/CameraRig.tsx
- `ExploreHud()` --calls--> `useExplore()`  [EXTRACTED]
  src/components/three/serverroom/explore/ExploreHud.tsx → src/components/three/serverroom/explore/store.ts

## Import Cycles
- None detected.

## Communities (37 total, 2 thin omitted)

### Community 0 - "Community 0"
Cohesion: 0.03
Nodes (58): dependencies, class-variance-authority, clsx, cmdk, date-fns, embla-carousel-react, framer-motion, @hookform/resolvers (+50 more)

### Community 2 - "Community 2"
Cohesion: 0.15
Nodes (12): Achievement, achievements, colophon, secondaryProjects, Skill, SkillGroup, skillGroups, SkillSource (+4 more)

### Community 3 - "Community 3"
Cohesion: 0.05
Nodes (38): askAssistant, messageSchema, consumeLastCapturedError(), renderErrorPage(), Route, Route, Route, Route (+30 more)

### Community 4 - "Community 4"
Cohesion: 0.19
Nodes (14): cn(), FadeIn(), FadeInProps, Magnetic(), MagneticProps, TextReveal(), TextRevealProps, AnchorButton() (+6 more)

### Community 5 - "Community 5"
Cohesion: 0.06
Nodes (34): devDependencies, eslint, eslint-config-prettier, @eslint/js, eslint-plugin-prettier, eslint-plugin-react-hooks, eslint-plugin-react-refresh, globals (+26 more)

### Community 6 - "Community 6"
Cohesion: 0.13
Nodes (15): ScrambleText(), ScrambleTextProps, SpotlightCard(), SpotlightCardProps, StaggerContainer(), StaggerContainerProps, StaggerItem(), Home() (+7 more)

### Community 8 - "Community 8"
Cohesion: 0.07
Nodes (42): NpcModal(), Script, scriptFor(), NpcId, NPCS, QUESTS, DialogueLine, getExploreState() (+34 more)

### Community 9 - "Community 9"
Cohesion: 0.10
Nodes (19): compilerOptions, allowImportingTsExtensions, jsx, lib, module, moduleResolution, noEmit, noFallthroughCasesInSwitch (+11 more)

### Community 10 - "Community 10"
Cohesion: 0.06
Nodes (59): projectBySlug(), RoomAudio, downloadCertificate(), LoginModal(), Auth, authRequest(), connectPresence(), disconnectPresence() (+51 more)

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
Cohesion: 0.24
Nodes (8): corridorEndZ(), endMargin(), progressToZ(), RoomCameraRig(), useActiveStation(), RoomHUD(), scrollTopFor(), Station

### Community 15 - "Community 15"
Cohesion: 0.10
Nodes (19): Architecture, Backlog "MOKSA.CLOUD" — konsep mode horor kejar-kejaran (disetujui konsep? MENUNGGU user; draft 2026-07-15), Backlog ROOT ACCESS — fitur keren untuk sesi AI berikutnya (mandat user 2026-07-12), Blockers, Changelog, Chatbot Assistant (2026-06-29) — LIVE, Completed Tasks, Current Status (+11 more)

### Community 17 - "Community 17"
Cohesion: 0.24
Nodes (9): Project, projects, ProjectStatus, ArchDiagram(), FlagshipProject(), ProjectCard(), config, StatusBadge() (+1 more)

### Community 18 - "Community 18"
Cohesion: 0.05
Nodes (53): FirstPersonArms(), Gait, OPERATOR_LOOK, ThirdPersonBody(), blocked(), slideMove(), DoorGate(), ExploreWorld() (+45 more)

### Community 19 - "Community 19"
Cohesion: 0.21
Nodes (7): site, Footer(), Container(), PageShell(), Scene, SceneCanvas(), CommandPalette()

### Community 20 - "Community 20"
Cohesion: 0.18
Nodes (11): journey, JourneyCategory, JourneyEntry, FadeInStagger(), FadeInStaggerItem(), FadeInStaggerProps, horizons, SectionHeader() (+3 more)

### Community 21 - "Community 21"
Cohesion: 0.25
Nodes (7): ExploreHud(), buildExploreMap(), Minimap(), beginSession(), resetPlayer(), RoomCanvas, ServerRoomExperience()

### Community 22 - "Community 22"
Cohesion: 0.27
Nodes (5): cents(), clamp01(), NightAudio, PARTIALS, SLENDRO

### Community 23 - "Community 23"
Cohesion: 0.20
Nodes (12): finiteOrNull(), getRoomStatus, NULL_STATUS, readProc(), RoomStatus, formatRam(), formatUptime(), labelStyle (+4 more)

### Community 24 - "Community 24"
Cohesion: 0.24
Nodes (11): cardStyle, cardW(), ContactScreen(), EntranceScreen(), kickerStyle, linkStyle, pillStyle, ProjectScreen() (+3 more)

### Community 25 - "Community 25"
Cohesion: 0.28
Nodes (5): CORRIDOR, SIDE_X, StationKind, StationProject, WallGap

### Community 26 - "Community 26"
Cohesion: 0.36
Nodes (5): buildNetwork(), ceilingRun(), floorRun(), makeTube(), TRUNK_X

### Community 27 - "Community 27"
Cohesion: 0.40
Nodes (4): Monogram(), Props, links, Nav()

### Community 28 - "Community 28"
Cohesion: 0.33
Nodes (5): Dokumen, Jalankan (dev), Peta folder `src/`, Portfolio — Mulai dari sini, Stack

### Community 29 - "Community 29"
Cohesion: 0.29
Nodes (5): BANNER, HELP, Line, TerminalModal(), PALETTE

### Community 31 - "Community 31"
Cohesion: 0.12
Nodes (25): asciiRoom(), center(), fmtUptime(), hostLine(), RACK_LABEL, rackLines(), attempts, clients (+17 more)

### Community 32 - "Community 32"
Cohesion: 0.40
Nodes (3): Cables(), Panels(), World()

### Community 34 - "Community 34"
Cohesion: 0.25
Nodes (7): Aturan keras untuk SEMUA modul, Geometri dunia, Integrasi (dikerjakan integrator, bukan agent), Pembagian modul (1 file per agent), Perluasan digital twin (backlog-1, 2026-07-16 — ServiceRacks/room-server), Security (WAJIB — StatusRack/roomStatus), The Server Room — build contract (v1)

## Knowledge Gaps
- **280 isolated node(s):** `RACK_LABEL`, `$schema`, `style`, `rsc`, `tsx` (+275 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **2 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `site` connect `Community 19` to `Community 2`, `Community 6`, `Community 20`, `Community 24`, `Community 29`?**
  _High betweenness centrality (0.028) - this node is a cross-community bridge._
- **Why does `PALETTE` connect `Community 29` to `Community 32`, `Community 8`, `Community 10`, `Community 14`, `Community 18`, `Community 23`, `Community 24`, `Community 25`, `Community 26`?**
  _High betweenness centrality (0.017) - this node is a cross-community bridge._
- **Why does `NightAudio` connect `Community 22` to `Community 8`?**
  _High betweenness centrality (0.016) - this node is a cross-community bridge._
- **What connects `RACK_LABEL`, `$schema`, `style` to the rest of the system?**
  _280 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Community 0` be split into smaller, more focused modules?**
  _Cohesion score 0.034482758620689655 - nodes in this community are weakly interconnected._
- **Should `Community 2` be split into smaller, more focused modules?**
  _Cohesion score 0.14619883040935672 - nodes in this community are weakly interconnected._
- **Should `Community 3` be split into smaller, more focused modules?**
  _Cohesion score 0.052597402597402594 - nodes in this community are weakly interconnected._