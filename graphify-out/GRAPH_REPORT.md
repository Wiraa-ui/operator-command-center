# Graph Report - portfolio  (2026-07-19)

## Corpus Check
- 128 files · ~121,426 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 909 nodes · 1865 edges · 47 communities (44 shown, 3 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 1 edges (avg confidence: 0.8)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `7fa2e183`
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
- [[_COMMUNITY_Community 41|Community 41]]
- [[_COMMUNITY_Community 43|Community 43]]
- [[_COMMUNITY_Community 44|Community 44]]
- [[_COMMUNITY_Community 45|Community 45]]
- [[_COMMUNITY_Community 46|Community 46]]

## God Nodes (most connected - your core abstractions)
1. `useExplore()` - 45 edges
2. `emit()` - 34 edges
3. `PALETTE` - 34 edges
4. `RoomAudio` - 24 edges
5. `addToast()` - 19 edges
6. `getExploreState()` - 17 edges
7. `compilerOptions` - 17 edges
8. `cn()` - 16 edges
9. `setModal()` - 15 edges
10. `useNearby()` - 15 edges

## Surprising Connections (you probably didn't know these)
- `fetch()` --calls--> `asciiRoom()`  [EXTRACTED]
  serve.ts → ascii-room.ts
- `fetch()` --calls--> `roomApi()`  [EXTRACTED]
  serve.ts → room-server.ts
- `fetch()` --calls--> `roomUpgrade()`  [EXTRACTED]
  serve.ts → room-server.ts
- `scrollTopFor()` --calls--> `corridorEndZ()`  [EXTRACTED]
  src/components/three/serverroom/Hud.tsx → src/components/three/serverroom/CameraRig.tsx
- `RoomCanvas()` --calls--> `useExplore()`  [EXTRACTED]
  src/components/three/serverroom/RoomCanvas.tsx → src/components/three/serverroom/explore/store.ts

## Import Cycles
- 3-file cycle: `src/components/three/serverroom/explore/i18n.ts -> src/components/three/serverroom/explore/store.ts -> src/components/three/serverroom/explore/nightshift/state.ts -> src/components/three/serverroom/explore/i18n.ts`
- 3-file cycle: `src/components/three/serverroom/explore/i18n.ts -> src/components/three/serverroom/explore/store.ts -> src/components/three/serverroom/explore/nightshift/tools.ts -> src/components/three/serverroom/explore/i18n.ts`

## Communities (47 total, 3 thin omitted)

### Community 0 - "Community 0"
Cohesion: 0.03
Nodes (58): dependencies, class-variance-authority, clsx, cmdk, date-fns, embla-carousel-react, framer-motion, @hookform/resolvers (+50 more)

### Community 3 - "Community 3"
Cohesion: 0.05
Nodes (38): askAssistant, messageSchema, consumeLastCapturedError(), renderErrorPage(), Route, Route, Route, Route (+30 more)

### Community 4 - "Community 4"
Cohesion: 0.15
Nodes (13): SpotlightCard(), SpotlightCardProps, StaggerContainer(), StaggerContainerProps, StaggerItem(), Home(), principles, useRoomCapable() (+5 more)

### Community 5 - "Community 5"
Cohesion: 0.06
Nodes (34): devDependencies, eslint, eslint-config-prettier, @eslint/js, eslint-plugin-prettier, eslint-plugin-react-hooks, eslint-plugin-react-refresh, globals (+26 more)

### Community 6 - "Community 6"
Cohesion: 0.13
Nodes (18): getLang(), TERMINAL_POS, NpcModal(), Script, scriptFor(), activeQuestInfo(), EVENT_TO_WAYPOINT, NpcId (+10 more)

### Community 8 - "Community 8"
Cohesion: 0.11
Nodes (30): DialogueLine, EndingKind, afterGoodbye(), ARWAH_LINES, bi(), CAUGHT_LINES, durationOf(), KIRANA (+22 more)

### Community 9 - "Community 9"
Cohesion: 0.10
Nodes (19): compilerOptions, allowImportingTsExtensions, jsx, lib, module, moduleResolution, noEmit, noFallthroughCasesInSwitch (+11 more)

### Community 10 - "Community 10"
Cohesion: 0.09
Nodes (29): Dust(), EndingOverlay(), ExploreHud(), NightEndChoice(), NightEndFinale(), NightToolHud(), ExploreWorld(), wallCenter() (+21 more)

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
Nodes (9): secondaryProjects, Skill, SkillGroup, skillGroups, SkillSource, sourceLabel, cls, SourceBadge() (+1 more)

### Community 15 - "Community 15"
Cohesion: 0.10
Nodes (19): Architecture, Backlog "MOKSA.CLOUD" — konsep mode horor kejar-kejaran (disetujui konsep? MENUNGGU user; draft 2026-07-15), Backlog ROOT ACCESS — fitur keren untuk sesi AI berikutnya (mandat user 2026-07-12), Blockers, Changelog, Chatbot Assistant (2026-06-29) — LIVE, Completed Tasks, Current Status (+11 more)

### Community 17 - "Community 17"
Cohesion: 0.18
Nodes (9): bi, Minimap(), WINDS, ARSIP_RACKS, ArsipDef, GHOST_SPAWN, KIRANA_SPAWN, lampIsOn() (+1 more)

### Community 18 - "Community 18"
Cohesion: 0.11
Nodes (27): DoorGate(), HIRE_STATION, HOUSE_LIGHT_BASE, STATUS_STATION, HallRoom(), Hologram(), BENGKEL, CORE (+19 more)

### Community 19 - "Community 19"
Cohesion: 0.19
Nodes (8): HumanoidFigure(), HumanoidLook, HumanoidPose, useLookAssets(), peerState, OnlinePlayers(), PEER_LOOK, NpcDef

### Community 20 - "Community 20"
Cohesion: 0.16
Nodes (16): cn(), FadeIn(), FadeInProps, Magnetic(), MagneticProps, ScrambleText(), ScrambleTextProps, TextReveal() (+8 more)

### Community 21 - "Community 21"
Cohesion: 0.13
Nodes (16): LAB, SPAWN, ArsipRack(), GHOST_SLICES, KIRANA_LOOK, KiranaBody(), ToolPickups(), VhsGhost() (+8 more)

### Community 22 - "Community 22"
Cohesion: 0.27
Nodes (5): cents(), clamp01(), NightAudio, PARTIALS, SLENDRO

### Community 23 - "Community 23"
Cohesion: 0.22
Nodes (10): Project, projectBySlug(), projects, ProjectStatus, h2Style, StudyModal(), ArchDiagram(), config (+2 more)

### Community 24 - "Community 24"
Cohesion: 0.18
Nodes (9): Achievement, achievements, colophon, journey, JourneyCategory, JourneyEntry, catCls, catLabel (+1 more)

### Community 25 - "Community 25"
Cohesion: 0.06
Nodes (70): Lang, InventoryModal(), ALL_ITEMS, ItemDef, KEY_ITEMS, LOG_ITEMS, MASTER_TAPE, ownedItemIds() (+62 more)

### Community 26 - "Community 26"
Cohesion: 0.18
Nodes (9): fxBus, STORY_LOGS, StoryLog, CORRIDOR, PALETTE, StationKind, StationProject, WallGap (+1 more)

### Community 27 - "Community 27"
Cohesion: 0.22
Nodes (12): cardStyle, cardW(), ContactScreen(), EntranceScreen(), kickerStyle, linkStyle, Panels(), pillStyle (+4 more)

### Community 28 - "Community 28"
Cohesion: 0.33
Nodes (5): Dokumen, Jalankan (dev), Peta folder `src/`, Portfolio — Mulai dari sini, Stack

### Community 29 - "Community 29"
Cohesion: 0.21
Nodes (7): site, Footer(), Container(), PageShell(), Scene, SceneCanvas(), CommandPalette()

### Community 31 - "Community 31"
Cohesion: 0.09
Nodes (35): asciiRoom(), center(), fmtUptime(), hostLine(), RACK_LABEL, rackLines(), attempts, clients (+27 more)

### Community 32 - "Community 32"
Cohesion: 0.24
Nodes (7): FadeInStagger(), FadeInStaggerItem(), FadeInStaggerProps, horizons, FlagshipProject(), ProjectCard(), SectionHeader()

### Community 33 - "Community 33"
Cohesion: 0.09
Nodes (26): finiteOrNull(), getRoomStatus, NULL_STATUS, readProc(), pick(), BANNER, TerminalModal(), ALIASES (+18 more)

### Community 34 - "Community 34"
Cohesion: 0.25
Nodes (7): Aturan keras untuk SEMUA modul, Geometri dunia, Integrasi (dikerjakan integrator, bukan agent), Pembagian modul (1 file per agent), Perluasan digital twin (backlog-1, 2026-07-16 — ServiceRacks/room-server), Security (WAJIB — StatusRack/roomStatus), The Server Room — build contract (v1)

### Community 35 - "Community 35"
Cohesion: 0.15
Nodes (13): FirstPersonArms(), Gait, OPERATOR_LOOK, ThirdPersonBody(), blocked(), slideMove(), RACK_HUM_SEGMENTS, WallRect (+5 more)

### Community 36 - "Community 36"
Cohesion: 0.09
Nodes (27): AudioZone, SCALE, VOICES, ZoneVoice, downloadCertificate(), EndingOverlay, InventoryModal, SettingsModal (+19 more)

### Community 38 - "Community 38"
Cohesion: 0.22
Nodes (9): corridorEndZ(), endMargin(), progressToZ(), RoomCameraRig(), useActiveStation(), RoomHUD(), scrollTopFor(), SIDE_X (+1 more)

### Community 40 - "Community 40"
Cohesion: 0.28
Nodes (8): RoomStatus, formatRam(), formatUptime(), labelStyle, NULL_STATUS, rowStyle, StatusRack(), YAW

### Community 41 - "Community 41"
Cohesion: 0.14
Nodes (13): 0. WAJIB BACA DULU, URUT (jangan skip satupun), 1. PITCH CERITA BARU — "ARSIP 167" (arah sudah diputuskan user, eksekusi ini), 2. LINGKUP KERJA, 3. PAGAR TEKNIS (dari gotcha terverifikasi — patuhi, jangan uji ulang pakai produksi), 4. PENUTUP WAJIB, COULD (kalau budget waktu/perf masih ada), JANGAN (out of scope), MUST (alat bertahan — mandat user "bisa ngambil senjata", gaya RE7 disesuaikan lore) (+5 more)

### Community 43 - "Community 43"
Cohesion: 0.29
Nodes (6): TOOL_CHARGE_MAX, TOOL_IDS, TOOL_META, TOOL_PICKUPS, toolFx, ToolPickup

### Community 44 - "Community 44"
Cohesion: 0.15
Nodes (14): SERVICE_RACKS, RecordBoard(), Run, ServiceRacks(), TwinPayload, UpMap, useNearby(), Wallboard() (+6 more)

### Community 45 - "Community 45"
Cohesion: 0.31
Nodes (6): buildNetwork(), Cables(), ceilingRun(), floorRun(), makeTube(), TRUNK_X

### Community 46 - "Community 46"
Cohesion: 0.40
Nodes (4): Monogram(), Props, links, Nav()

## Knowledge Gaps
- **325 isolated node(s):** `RACK_LABEL`, `$schema`, `style`, `rsc`, `tsx` (+320 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **3 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `useExplore()` connect `Community 10` to `Community 33`, `Community 35`, `Community 36`, `Community 6`, `Community 44`, `Community 18`, `Community 19`, `Community 21`, `Community 25`, `Community 26`?**
  _High betweenness centrality (0.036) - this node is a cross-community bridge._
- **Why does `site` connect `Community 29` to `Community 32`, `Community 33`, `Community 4`, `Community 14`, `Community 24`, `Community 26`, `Community 27`?**
  _High betweenness centrality (0.027) - this node is a cross-community bridge._
- **Why does `RoomAudio` connect `Community 2` to `Community 33`, `Community 35`, `Community 36`, `Community 10`, `Community 25`?**
  _High betweenness centrality (0.027) - this node is a cross-community bridge._
- **What connects `RACK_LABEL`, `$schema`, `style` to the rest of the system?**
  _325 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Community 0` be split into smaller, more focused modules?**
  _Cohesion score 0.034482758620689655 - nodes in this community are weakly interconnected._
- **Should `Community 3` be split into smaller, more focused modules?**
  _Cohesion score 0.052597402597402594 - nodes in this community are weakly interconnected._
- **Should `Community 4` be split into smaller, more focused modules?**
  _Cohesion score 0.14736842105263157 - nodes in this community are weakly interconnected._