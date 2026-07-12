# Graph Report - portfolio (2026-07-12)

## Corpus Check

- 65 files · ~132,405 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary

- 381 nodes · 538 edges · 23 communities (20 shown, 3 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS
- Token cost: 0 input · 0 output

## Graph Freshness

- Built from commit: `1069b840`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)

- [[_COMMUNITY_Community 0|Community 0]]
- [[_COMMUNITY_Community 2|Community 2]]
- [[_COMMUNITY_Community 3|Community 3]]
- [[_COMMUNITY_Community 4|Community 4]]
- [[_COMMUNITY_Community 5|Community 5]]
- [[_COMMUNITY_Community 6|Community 6]]
- [[_COMMUNITY_Community 9|Community 9]]
- [[_COMMUNITY_Community 10|Community 10]]
- [[_COMMUNITY_Community 11|Community 11]]
- [[_COMMUNITY_Community 12|Community 12]]
- [[_COMMUNITY_Community 13|Community 13]]
- [[_COMMUNITY_Community 14|Community 14]]
- [[_COMMUNITY_Community 15|Community 15]]
- [[_COMMUNITY_Community 18|Community 18]]
- [[_COMMUNITY_Community 28|Community 28]]
- [[_COMMUNITY_Community 30|Community 30]]
- [[_COMMUNITY_Community 31|Community 31]]
- [[_COMMUNITY_Community 37|Community 37]]

## God Nodes (most connected - your core abstractions)

1. `compilerOptions` - 17 edges
2. `cn()` - 16 edges
3. `FileRoutesByPath` - 8 edges
4. `scripts` - 7 edges
5. `site` - 7 edges
6. `Design System Master File` - 7 edges
7. `aliases` - 6 edges
8. `AnchorButton()` - 6 edges
9. `PageShell()` - 6 edges
10. `Container()` - 6 edges

## Surprising Connections (you probably didn't know these)

- `Button()` --calls--> `cn()` [EXTRACTED]
  src/components/sections/Button.tsx → src/lib/utils.ts
- `LinkButton()` --calls--> `cn()` [EXTRACTED]
  src/components/sections/Button.tsx → src/lib/utils.ts
- `AnchorButton()` --calls--> `cn()` [EXTRACTED]
  src/components/sections/Button.tsx → src/lib/utils.ts
- `FadeIn()` --calls--> `cn()` [EXTRACTED]
  src/components/ui/motion/FadeIn.tsx → src/lib/utils.ts
- `Magnetic()` --calls--> `cn()` [EXTRACTED]
  src/components/ui/motion/Magnetic.tsx → src/lib/utils.ts

## Import Cycles

- None detected.

## Communities (23 total, 3 thin omitted)

### Community 0 - "Community 0"

Cohesion: 0.03
Nodes (58): dependencies, class-variance-authority, clsx, cmdk, date-fns, embla-carousel-react, framer-motion, @hookform/resolvers (+50 more)

### Community 2 - "Community 2"

Cohesion: 0.13
Nodes (17): Achievement, achievements, colophon, journey, JourneyCategory, JourneyEntry, Skill, SkillGroup (+9 more)

### Community 3 - "Community 3"

Cohesion: 0.10
Nodes (26): Route, Route, Route, Route, Route, Route, Route, getRouter() (+18 more)

### Community 4 - "Community 4"

Cohesion: 0.15
Nodes (15): Project, projectBySlug(), projects, ProjectStatus, secondaryProjects, FadeInStagger(), FadeInStaggerItem(), FadeInStaggerProps (+7 more)

### Community 5 - "Community 5"

Cohesion: 0.06
Nodes (34): devDependencies, eslint, eslint-config-prettier, @eslint/js, eslint-plugin-prettier, eslint-plugin-react-hooks, eslint-plugin-react-refresh, globals (+26 more)

### Community 6 - "Community 6"

Cohesion: 0.10
Nodes (27): cn(), FadeIn(), FadeInProps, Magnetic(), MagneticProps, ScrambleText(), ScrambleTextProps, SpotlightCard() (+19 more)

### Community 9 - "Community 9"

Cohesion: 0.10
Nodes (19): compilerOptions, allowImportingTsExtensions, jsx, lib, module, moduleResolution, noEmit, noFallthroughCasesInSwitch (+11 more)

### Community 10 - "Community 10"

Cohesion: 0.20
Nodes (4): askAssistant, messageSchema, ChatWidget(), Msg

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

Cohesion: 0.14
Nodes (11): site, Footer(), Monogram(), Props, links, Nav(), Container(), PageShell() (+3 more)

### Community 15 - "Community 15"

Cohesion: 0.11
Nodes (16): Architecture, Blockers, Changelog, Chatbot Assistant (2026-06-29) — LIVE, Completed Tasks, Current Status, Current Work, Decisions (+8 more)

### Community 18 - "Community 18"

Cohesion: 0.29
Nodes (7): consumeLastCapturedError(), renderErrorPage(), fetch(), getServerEntry(), normalizeCatastrophicSsrResponse(), ServerEntry, errorMiddleware

### Community 28 - "Community 28"

Cohesion: 0.33
Nodes (5): Dokumen, Jalankan (dev), Peta folder `src/`, Portfolio — Mulai dari sini, Stack

## Knowledge Gaps

- **200 isolated node(s):** `$schema`, `style`, `rsc`, `tsx`, `css` (+195 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **3 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions

_Questions this graph is uniquely positioned to answer:_

- **Why does `dependencies` connect `Community 0` to `Community 5`?**
  _High betweenness centrality (0.050) - this node is a cross-community bridge._
- **What connects `$schema`, `style`, `rsc` to the rest of the system?**
  _200 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Community 0` be split into smaller, more focused modules?**
  _Cohesion score 0.034482758620689655 - nodes in this community are weakly interconnected._
- **Should `Community 2` be split into smaller, more focused modules?**
  _Cohesion score 0.12535612535612536 - nodes in this community are weakly interconnected._
- **Should `Community 3` be split into smaller, more focused modules?**
  _Cohesion score 0.09885057471264368 - nodes in this community are weakly interconnected._
- **Should `Community 4` be split into smaller, more focused modules?**
  _Cohesion score 0.1455026455026455 - nodes in this community are weakly interconnected._
- **Should `Community 5` be split into smaller, more focused modules?**
  _Cohesion score 0.05714285714285714 - nodes in this community are weakly interconnected._
