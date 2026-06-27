# The Operator — Portfolio Implementation Plan

Dark-first, system-oriented portfolio for I Kadek Wira Wibawa. Built strictly to OPERATOR_DESIGN_SYSTEM_v1.md plus the implementation rule: the homepage leads with **systems and operations**, not code. Internal Knowledge Assistant is the flagship and visually dominates.

## Identity rules (non-negotiable)

- Hero communicates "I build systems that improve operations" before anything about programming.
- Infrastructure + automation + problem-solving are visually prioritized over languages/frameworks.
- No generic portfolio tropes: no stock photos, no skill bars, no animated counters, no "creative developer" copy, no social icon farm, no jumbotron, no typing animation, no programmer illustrations.
- Accent cyan `#00E5F0` is a signal light — max 3 uses per viewport.

## Routes (TanStack file-based)

- `index.tsx` — Homepage
- `about.tsx` — About
- `projects.index.tsx` — `/projects` listing
- `projects.$slug.tsx` — `/projects/:slug` detail (5 slugs: `internal-knowledge-assistant`, `ubuntu-server-stack`, `kumon-invoice-automation`, `payroll-system`, `luung-bali`)
- `contact.tsx` — Contact

Each route sets its own `head()` (title, description, og:title/description). No og:image on `__root.tsx`.

## Homepage composition (operator-first, not code-first)

1. **Nav** (56px fixed): geometric "IW" monogram, links Projects/About/Contact.
2. **Hero** — typographic only, no imagery:
   - Eyebrow line, monospace 14px secondary: `// operator @ kumon udayana — status: open for collaboration` with a live accent dot.
   - H1 (56/600): **"I build systems that improve operations."** ← this is the lead sentence.
   - Sub-line (H3 weight 600, text-secondary): "Infrastructure, automation, and quiet reliability — operated from Bali."
   - Body paragraph (max-width 720px) from blueprint.
   - Primary CTA "View My Projects", ghost "Get in Touch".
   - **No tech stack pills in the hero.** Tools do not introduce the person; outcomes do.
3. **Operating Principles strip** (replaces the usual "tech stack bar"): 3 short statements in a row, monospace labels — e.g. `infrastructure / automation / problem-solving` — each with a one-line plain-English description. Reinforces operator identity before any code is mentioned.
4. **Flagship project — Internal Knowledge Assistant** (full-width feature block, not a card in a row):
   - Status `[IN PROGRESS]` badge.
   - Larger H2 title + tagline.
   - Two-column on desktop: left = problem + outcome copy; right = monospace architecture sketch (n8n → Gemini → Qdrant → Telegram) in `--surface-secondary` block.
   - Tech pills below.
   - Primary CTA "View Case Study →".
   - Accent left bar + subtle accent glow border to mark flagship status.
5. **Other selected work** — section header "Also Running". 2-column grid:
   - Ubuntu Server Stack `[LIVE]`
   - Kumon Invoice Automation `[DEPLOYED]`
   - Standard ProjectCard treatment, smaller than flagship.
   - "View All Projects →" ghost link.
6. **About teaser** — one paragraph + "Read More About Me →".
7. **Closing CTA** — "Open for Collaboration": WhatsApp primary, Email ghost, CV link.
8. **Footer** — single line.

Languages/frameworks never appear in the hero or principles strip. They first surface inside the flagship's tech pills, where they're contextual to a real system.

## Design tokens (src/styles.css, Tailwind v4)

All colors, spacing (`--space-1`…`--space-10` = 4→128), and type sizes from §3–5 declared in `@theme`. Fonts loaded via `<link>` in `__root.tsx` head:

- Inter (400/500/600)
- JetBrains Mono (400/500)

Body bg `--bg-primary` set on `html` to prevent white flash. `prefers-reduced-motion` global guard.

## Shared components (src/components/)

- `Nav.tsx` — monogram + links, active = accent underline.
- `Footer.tsx` — "© 2026 I Kadek Wira Wibawa — Built with intention. Operated from Bali."
- `Button.tsx` — `primary` (accent solid) + `ghost` per §7.2.
- `StatusBadge.tsx` — `live` / `in-progress` / `deployed` / `delivered`, with SR text and pulse on `live` only.
- `TechPill.tsx` — monospace, accent border.
- `SourceBadge.tsx` — for skills (otodidak / sekolah / etc.).
- `ProjectCard.tsx` — standard card (used for non-flagship).
- `FlagshipProject.tsx` — homepage-only enhanced layout for IKA.
- `SectionHeader.tsx` — H3 + 2px accent left bar + subheading.
- `Monogram.tsx` — inline SVG "IW" geometric mark.
- `ArchDiagram.tsx` — monospace ASCII-style diagram in `--surface-secondary`.
- `Timeline.tsx` + `TimelineEntry.tsx` — vertical line, current marker pulses.
- `AchievementRow.tsx` — icon-left / text-right.
- `ContactCard.tsx`.

## Content (src/content/\*.ts)

Plain TS data, exact copy preserved:

- `projects.ts` — 5 projects. IKA flagged `flagship: true`; ordered IKA → Ubuntu → Invoice → Payroll → Luung Bali everywhere they appear.
- `journey.ts` — 7 timeline entries, current = IT Administrator @ Kumon Udayana.
- `achievements.ts` — KONKTI, Cyber Breaker.
- `skills.ts` — domain-grouped with source badges, no bars or percentages.

## Project detail template (`projects.$slug.tsx`)

Title + status inline → tagline → overview (max-w 720px) → problem → architecture (monospace block) → component reasoning (2-col list) → tech pills → progress/services → lessons → what's next → bottom nav (next project + contact). Confidentiality notes rendered as a subtle info bar where applicable.

## About page

Page header → opening paragraph → "How I Think About Technology" card (`--bg-secondary` surface) → Education timeline entry → Achievements (2 rows) → Skills (domain groups + source badges, no bars) → My Journey (vertical timeline, current pulses) → Where I'm Heading (3 horizon markers) → closing CTA → footer.

## Contact page

Heading → two ContactCards side-by-side (WhatsApp primary, Email) → CV primary button → short collaboration copy → footer.

## Motion

CSS-only, 150–300ms, `cubic-bezier(0.2,0,0,1)`. Pulse keyframes for `[LIVE]` and current timeline marker. No scroll-jacking, no parallax, no cursor effects, no typing effect. Reduced-motion fully neutralizes.

## Accessibility

WCAG 2.1 AA. Skip-to-content link, semantic landmarks, 2px accent focus ring with 2px offset, SR text on status badges, decorative icons `aria-hidden`.

## Strict prohibitions (enforced at review)

No hardcoded color classes (`text-white`, `bg-black`, `bg-[#...]`) — tokens only. No stock imagery. No skill bars / percentage circles / counters. No social icon row. No "crafted with ❤️" / "passionate developer" copy. No tech-stack pills in the hero. No third-party motion libs in v1.

## Out of scope (v1)

Light theme (derived later), real SVG architecture art, CMS/backend, contact form, project screenshots (none provided).

## Build order

1. Tokens + fonts (`styles.css`, `__root.tsx`).
2. Shared components.
3. Content data modules.
4. Homepage (operator-first hero + flagship block + secondary grid).
5. About.
6. Projects list + detail.
7. Contact.
8. Verify: build passes, preview screenshot confirms hero leads with systems message and IKA dominates above other projects.
