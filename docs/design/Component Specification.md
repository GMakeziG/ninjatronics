# Ninjatronics.io — Component Specification
*Implementation contract for Claude Code · v1.0*

This document is authoritative for UI implementation. It follows the World Bible and Frontend Architecture; it does not introduce gameplay, pages, or redesigns.

## Architectural rules (binding for every component below)

1. The frontend is purely a renderer. No component computes portfolio content — it only formats and displays what it's given.
2. `world.json` is the single source of truth. Nothing is hardcoded (copy, stats, districts, artifacts).
3. Components receive data via props. No component fetches or queries `world.json` directly except the top-level data-loading boundary in `AppShell`.
4. Reusable/presentational components (`SkillBadge`, `CertificationCard`, `RepositoryCard`, `ExperienceCard`, `QuestCard`, `ProjectCard`, `Modal`, `Tooltip`, `ContextMenu`, `NotificationToast`) are domain-agnostic — they know nothing about districts, guardians, or the valley.
5. Composition over inheritance — every "screen" (District, Artifact, Mission Brief) is assembled from smaller presentational + structural components.
6. Clear separation of concerns:
   - **Presentation** — Card/Badge/Tooltip/Modal family. Pure props in, markup out.
   - **Navigation** — `CameraController`, `Breadcrumbs`, `NavigationRail`. Own routing/URL state.
   - **Animation** — ambient loops live inside the component that owns the visual (e.g. `GuardianDialogue` owns its own idle pulse); camera/transition animation lives only in `CameraController`.
   - **Data** — loaded once in `AppShell`, passed down. No component below `AppShell` imports a data-fetching client.

## world.json shape assumed by this spec

```
world.meta        { ninjaFormIndex, ninjaFormName, districtsOpen, districtsTotal, lastUpdated }
world.stats       { commitsThisWeek, totalCommits, uptimeDays, notesCount, certsCount, reposCount }
world.districts[] { id, name, guardianId, status: open|partial|locked, position: {x,y}, summary }
world.guardians[] { id, name, domain, voiceSample, dataSourceLabel }
world.artifacts[] { id, districtId, type: project|certification|note|repository|experience|quest,
                     title, summary, stack[], links[], date, status, stats, locked }
world.timeline[]  { id, date, type, title, districtId, artifactId }
world.skills[]    { id, name, level: 1-5, category }
```

---

## AppShell

**Purpose:** Root application boundary. Owns data loading, top-level layout slots, and global providers.

**Responsibilities:** Fetch/hydrate `world.json` once; provide it via context to the render tree; mount `ThemeProvider`, `StatusBar`, `NavigationRail`, `FloatingActionButtons`, and the active route (`WorldCanvas` or `MissionBrief`); mount global overlays (`OracleOverlay`, `TerminalOverlay`, `SearchOverlay`, `NotificationToast`, `Modal` host).

**Inputs (props):** none (root). Reads `worldJsonUrl` from build config.

**Outputs:** `worldContext` (the parsed `world.json`) to all descendants; `route` state to `CameraController`.

**States:** `loading` (shows `LoadingScreen`/`BootSequence`), `ready`, `error` (fetch failed — static fallback message, link to Mission Brief).

**Variants:** none — single root shell.

**Animations:** none owned directly; delegates to `BootSequence` during load.

**Keyboard interactions:** registers the global shortcut map (`Esc`, `T`, `O`, `B`, `1–9`) and dispatches to the relevant overlay/route; individual components do not bind these keys themselves.

**Accessibility considerations:** sets `<html lang>`, manages a single live region for route-change announcements, ensures focus moves to the new view's heading on navigation.

**Mobile behavior:** same shell; swaps `NavigationRail` for a bottom tab bar at <768px.

**Desktop behavior:** full shell with side rail and floating overlays.

**Data dependencies:** entire `world.json` (loads it; does not render fields itself).

**Future extensibility:** swap the fetch source (static file → API) without touching children; add a service-worker cache layer here only.

---

## StatusBar

**Purpose:** Persistent top band communicating "where am I" and "what state is the world in."

**Responsibilities:** Render breadcrumb trail, ninja form label, districts-open counter, live clock. Never owns navigation logic — delegates clicks to `Breadcrumbs`.

**Inputs (props):** `breadcrumb: {label, path}[]`, `ninjaFormName: string`, `districtsOpen: number`, `districtsTotal: number`.

**Outputs:** `onBreadcrumbClick(path)` bubbled from `Breadcrumbs`.

**States:** default; `compact` (mobile — hides counters, keeps breadcrumb + clock).

**Variants:** `desktop`, `mobile-compact`.

**Animations:** none beyond the shared `rim` status-dot pulse (CSS only, no JS).

**Keyboard interactions:** none owned; purely displays state set elsewhere.

**Accessibility considerations:** breadcrumb is a `<nav aria-label="World location">`; live clock has `aria-hidden="true"` (decorative, not essential info).

**Mobile behavior:** collapses to breadcrumb + hamburger; counters move into `NavigationRail`'s mobile drawer.

**Desktop behavior:** full row: dot + product name — breadcrumb — form/counters/clock.

**Data dependencies:** `world.meta.ninjaFormName`, `world.meta.districtsOpen`, `world.meta.districtsTotal`.

**Future extensibility:** add a notification-count badge slot without layout change.

---

## WorldCanvas

**Purpose:** The stage — single rendering surface for Gate/Valley/District/Artifact levels.

**Responsibilities:** Render the current IA level's content inside a transformable layer; delegate all pan/zoom math to `CameraController`; host `DistrictCard` grid at Valley level and `DistrictScene` at District level.

**Inputs (props):** `level: gate|valley|district|artifact`, `districts: District[]`, `activeDistrictId?`, `activeArtifactId?`.

**Outputs:** `onDistrictSelect(id)`, `onArtifactSelect(id)` — bubbled up to the router, not handled internally.

**States:** `idle`, `transitioning` (camera move in progress — pointer events suspended on the outgoing layer).

**Variants:** desktop camera-pan version; mobile stacked-list version (renders `DistrictCard`s in a vertical scroll instead of a spatial canvas).

**Animations:** delegates all motion to `CameraController`; owns only the ambient background (stars/grid) at Valley level.

**Keyboard interactions:** arrow keys move focus between `DistrictCard`s when at Valley level (roving tabindex); `Enter` activates focused card.

**Accessibility considerations:** at mobile/stacked variant, semantics are a plain list — no synthetic spatial navigation required; desktop canvas provides an offscreen list mirroring the same content for screen readers.

**Mobile behavior:** vertical list, no camera physics (per Frontend Architecture §02).

**Desktop behavior:** full spatial canvas with `CameraController`-driven pan/zoom.

**Data dependencies:** `world.districts[]`, `world.artifacts[]` (filtered by active district).

**Future extensibility:** additional IA levels (e.g. a future "sub-district" zoom) slot in as new `level` values without changing the component's public API.

---

## CameraController

**Purpose:** Owns all pan/zoom/transition math and timing for `WorldCanvas`. Pure navigation/animation logic, no presentational output of its own.

**Responsibilities:** Compute transform (translate/scale) for the current route target; run the 600–900ms ease-out transition between IA levels; expose imperative `goTo(target)` and `zoomOut()`.

**Inputs (props):** `target: {level, districtId?, artifactId?}`, `reducedMotion: boolean`.

**Outputs:** `transformStyle` (applied by `WorldCanvas`), `onTransitionComplete()`.

**States:** `at-rest`, `animating`.

**Variants:** `reducedMotion` variant swaps eased transform animation for an opacity-only crossfade.

**Animations:** the sole owner of camera transition animation in the app — no other component animates position/scale of the world layers.

**Keyboard interactions:** exposes `zoomOut()` bound to `Esc` by `AppShell`; does not bind keys itself.

**Accessibility considerations:** transition duration honors `prefers-reduced-motion`; never traps focus during animation.

**Mobile behavior:** effectively disabled — mobile `WorldCanvas` variant doesn't use spatial transforms, so `CameraController` short-circuits to instant route swap.

**Desktop behavior:** full transform-based camera as specified in Frontend Architecture §02.

**Data dependencies:** none — purely positional/timing logic, district coordinates come from `world.districts[].position` passed in by `WorldCanvas`.

**Future extensibility:** could add momentum/inertia panning later without changing its props contract.

---

## DistrictCard

**Purpose:** Valley-level representation of one district — the entry point into a district.

**Responsibilities:** Display district identity and status; surface a hover/focus preview; trigger selection.

**Inputs (props):** `district: {id, name, guardianName, status, summary}`, `onSelect(id)`.

**Outputs:** `onSelect(id)` on click/Enter.

**States:** `open`, `partial` (locked chambers inside, but enterable), `locked` (not yet enterable — shows requirement hint instead of entering), `hovered/focused` (preview expansion).

**Variants:** `grid` (desktop valley), `list-row` (mobile stacked valley).

**Animations:** hover/focus lift (150–250ms ease, per Frontend Architecture §05 feedback tier); no ambient animation of its own.

**Keyboard interactions:** focusable (`tabindex=0`), `Enter`/`Space` triggers `onSelect`.

**Accessibility considerations:** `role="button"`, `aria-label` includes name + status (e.g. "Cloud Temple, open"); locked cards have `aria-disabled="true"` with reason in `aria-describedby`.

**Mobile behavior:** full-width row, tap target ≥44px height.

**Desktop behavior:** fixed-size tile positioned by `world.districts[].position` inside the spatial canvas.

**Data dependencies:** `world.districts[].{id,name,guardianId,status,summary}`, resolves `guardianName` via `world.guardians[]`.

**Future extensibility:** an optional thumbnail/preview-art slot can be added without changing the data contract.

---

## DistrictScene

**Purpose:** The single template for all nine district interiors (Frontend Architecture §04 — "one template, nine districts").

**Responsibilities:** Render the district's background, its artifact hotspots, and its `GuardianDialogue` strip; open `ArtifactDrawer` on artifact selection.

**Inputs (props):** `district`, `artifacts: Artifact[]`, `guardian: Guardian`, `onArtifactSelect(id)`, `onExit()`.

**Outputs:** `onArtifactSelect(id)`, `onExit()` (mapped to `Esc`/breadcrumb by `AppShell`).

**States:** `entering` (guardian greeting plays), `idle`, `artifact-open` (drawer overlay active).

**Variants:** none at the component level — all nine districts are data-driven instances of the same variant. (Guardian voice/art differs via data, not component variants.)

**Animations:** guardian greeting types/fades in on entry (owned by `GuardianDialogue`); artifact hotspots have a subtle idle glow (ambient tier).

**Keyboard interactions:** `Tab` cycles artifact hotspots; `Enter` opens the focused one; `Esc` calls `onExit()`.

**Accessibility considerations:** hotspots are real focusable elements with descriptive labels, not purely visual click targets; guardian dialogue text is in the accessibility tree immediately (not only after a typing animation completes).

**Mobile behavior:** artifacts render as a tappable list beneath the guardian strip rather than spatial hotspots.

**Desktop behavior:** spatial hotspots positioned over district background art.

**Data dependencies:** `world.districts[id]`, `world.artifacts[]` filtered by `districtId`, `world.guardians[guardianId]`.

**Future extensibility:** new artifact types added to `world.json` render automatically as long as a matching Card component exists (see Repository/Certification/Project/Experience/Quest cards).

---

## GuardianDialogue

**Purpose:** Reused speaker component for all six guardians and the Oracle.

**Responsibilities:** Render portrait/glyph, name, domain, and a line of dialogue; own the type-in/fade text animation.

**Inputs (props):** `guardian: {id, name, domain, glyph}`, `line: string`, `variant: 'greeting'|'inline'`.

**Outputs:** none (display-only; the Oracle's variant with input is `OracleOverlay`, not this component).

**States:** `typing`, `settled`.

**Variants:** `greeting` (large, used on district entry), `inline` (compact, used within `ArtifactDrawer` or `TerminalOverlay` output).

**Animations:** text reveal (character or word stagger, ~600–900ms total), idle portrait pulse (ambient tier, 4–6s loop).

**Keyboard interactions:** none — passive content.

**Accessibility considerations:** full line is present in the DOM immediately for screen readers; the type-in animation is a visual-only overlay (`aria-hidden` on the animated layer, real text underneath).

**Mobile behavior:** `greeting` variant shrinks portrait, keeps text full width.

**Desktop behavior:** portrait + text side by side.

**Data dependencies:** `world.guardians[id].{name, domain}`; `line` is supplied by the caller (district entry copy, Oracle response, etc.) — this component never generates copy.

**Future extensibility:** additional variants (e.g. a "farewell" line on exit) require no new props beyond `variant`.

---

## ArtifactDrawer

**Purpose:** The one place with real reading content — detail view for a project, certification, note, repository, experience entry, or quest.

**Responsibilities:** Render the correct Card component for the artifact's `type` inside a drawer/sheet chrome; provide close/dismiss.

**Inputs (props):** `artifact: Artifact`, `onClose()`.

**Outputs:** `onClose()`.

**States:** `open`, `closing`.

**Variants:** `side-drawer` (desktop), `bottom-sheet` (mobile).

**Animations:** slide-in/out, 300–400ms ease-out (feedback tier, faster than camera transitions since it's a local overlay, not a world move).

**Keyboard interactions:** `Esc` closes; focus is trapped within the drawer while open; focus returns to the triggering hotspot/card on close.

**Accessibility considerations:** `role="dialog"`, `aria-modal="true"`, labelled by the artifact title.

**Mobile behavior:** bottom sheet, drag-to-dismiss optional, min height content-driven.

**Desktop behavior:** fixed-width right-side panel, page content dimmed but visible behind it.

**Data dependencies:** `world.artifacts[id]` — dispatches to `ProjectCard`/`CertificationCard`/`RepositoryCard`/`ExperienceCard`/`QuestCard` based on `type`.

**Future extensibility:** new artifact `type` values only require a new Card component and a switch case here — no drawer changes.

---

## OracleOverlay

**Purpose:** Global conversational surface — the AI companion, reachable from anywhere.

**Responsibilities:** Own the chat input/thread UI; render responses via `GuardianDialogue` (`inline` variant, guardian = Oracle); on a response that references a district/artifact, offer a "take me there" action that calls into `CameraController`/router.

**Inputs (props):** `isOpen`, `onClose()`, `onNavigate(target)`, `worldSummary` (a lightweight index the Oracle grounds answers in, not the full vault text).

**Outputs:** `onNavigate(target)`, `onClose()`.

**States:** `closed`, `open-empty` (greeting, no messages), `open-thread`, `awaiting-response`.

**Variants:** `panel` (desktop, docked bottom-right), `full-screen` (mobile).

**Animations:** panel slide/fade in (300ms); response text uses the same type-in as `GuardianDialogue`.

**Keyboard interactions:** `O` opens/closes (bound in `AppShell`); `Esc` closes; `Enter` sends message; standard textarea navigation inside.

**Accessibility considerations:** `role="dialog"` with `aria-label="Ask the Oracle"`; new messages announced via a polite live region.

**Mobile behavior:** full-screen modal, message list scrolls independently of page.

**Desktop behavior:** persistent floating orb (idle) → docked panel (open); page remains interactive behind it.

**Data dependencies:** reads from the world's knowledge index (derived from `world.json` + vault embeddings) — never queries raw content directly; navigation targets reference `world.districts[]`/`world.artifacts[]` ids.

**Future extensibility:** thread history/persistence, multi-turn context — additive to `open-thread` state, no prop contract change.

---

## TerminalOverlay

**Purpose:** Power-user/engineer-facing command surface.

**Responsibilities:** Own command input, output log, and the command registry (`map`, `projects`, `skills`, `github`, `ask oracle "…"`, easter eggs); map commands to the same navigation/data the visual world uses.

**Inputs (props):** `isOpen`, `onClose()`, `onNavigate(target)`, `commandRegistry`.

**Outputs:** `onNavigate(target)`, arbitrary side-effect-free command output rendered inline.

**States:** `closed`, `open`, `executing`.

**Variants:** `docked-bottom` (desktop), `full-screen` (mobile).

**Animations:** cursor blink (ambient), line-by-line output print (feedback tier).

**Keyboard interactions:** `T` toggles (bound in `AppShell`); full text-input keyboard handling (history via ↑/↓, autocomplete via `Tab`).

**Accessibility considerations:** output log is a live region; command input has a visible label even though styled as a prompt (`aria-label="Terminal command input"`).

**Mobile behavior:** full-screen, on-screen keyboard aware (avoids being covered).

**Desktop behavior:** docked panel, translucent over the world.

**Data dependencies:** command outputs are formatted views over `world.districts[]`, `world.artifacts[]`, `world.skills[]` — never bespoke terminal-only content.

**Future extensibility:** new commands are registry entries, not component changes.

---

## MissionBrief

**Purpose:** The recruiter escape hatch — static, fast, game-free dossier.

**Responsibilities:** Render summary, skills matrix (via `SkillBadge`), certifications (via `CertificationCard`), experience (via `ExperienceCard`), résumé download, contact links. Composes only presentational cards — no canvas, no camera.

**Inputs (props):** `profile: {summary, contactLinks}`, `skills`, `certifications`, `experience`, `resumeUrl`.

**Outputs:** none beyond standard link/download clicks.

**States:** `default`; `print` (print-stylesheet variant, triggered by browser print).

**Variants:** none — one canonical layout.

**Animations:** entrance fade only; otherwise static by design (per Law IV — recruiters get zero game friction).

**Keyboard interactions:** `B` toggles open/close (bound in `AppShell`); standard document tab order otherwise.

**Accessibility considerations:** plain semantic document structure (`h1`–`h3`, `main`, `section`); this is the highest-accessibility-bar view in the app since it must work with zero JS motion assumptions.

**Mobile behavior:** single-column flow.

**Desktop behavior:** two-column (summary/contact sidebar + main content).

**Data dependencies:** `world.meta` (for headline stats), `world.skills[]`, `world.artifacts[]` filtered to `type: certification|experience`.

**Future extensibility:** additional sections (e.g. publications) are additive props, not structural changes.

---

## Timeline

**Purpose:** Chronological view of achievements — used within `MissionBrief` and optionally a district's history panel.

**Responsibilities:** Render an ordered list of dated events with type-based iconography; delegate item detail to the relevant Card on click.

**Inputs (props):** `events: {id, date, type, title, onSelect}[]`, `orientation: 'vertical'|'horizontal'`.

**Outputs:** `onSelect(id)` per item.

**States:** default; `empty` (no events — rare, since content is real).

**Variants:** `vertical` (Mission Brief), `horizontal` (compact district history strip).

**Animations:** items fade/slide in on scroll into view (one-time, feedback tier).

**Keyboard interactions:** items are focusable; `Enter` triggers `onSelect`.

**Accessibility considerations:** rendered as an ordered list (`<ol>`), dates in machine-readable `<time datetime>`.

**Mobile behavior:** vertical only, regardless of `orientation` prop (auto-downgrades below 640px).

**Desktop behavior:** honors `orientation` prop as given.

**Data dependencies:** `world.timeline[]`.

**Future extensibility:** filtering by type/district is additive prop (`filter`), no structural change.

---

## SkillBadge

**Purpose:** Small, domain-agnostic display of a single skill and its level.

**Responsibilities:** Render name + level indicator (e.g. 1–5 fill dots). Nothing else.

**Inputs (props):** `name: string`, `level: number (1-5)`, `category?: string`.

**Outputs:** none (pure display); optional `onClick` if used as a filter control.

**States:** `default`, `interactive-hover` (only when used as a filter chip).

**Variants:** `filled` (default), `outline` (used on dark decorative surfaces).

**Animations:** none beyond standard hover feedback when interactive.

**Keyboard interactions:** none unless interactive variant — then standard button semantics.

**Accessibility considerations:** level communicated in text (`aria-label="Kubernetes, level 4 of 5"`), not color/shape alone.

**Mobile behavior:** wraps in a flex/grid with `gap`, no fixed width.

**Desktop behavior:** same, denser grid.

**Data dependencies:** `world.skills[]` items — but receives them as props, does not read `world.json` directly.

**Future extensibility:** could gain a tooltip (via `Tooltip`) showing related artifacts without changing its core props.

---

## CertificationCard

**Purpose:** Domain-agnostic card for one certification.

**Responsibilities:** Render title, issuer, date earned, badge/logo slot, verification link.

**Inputs (props):** `title`, `issuer`, `dateEarned`, `credentialUrl?`, `locked?: boolean`.

**Outputs:** none beyond the credential link click.

**States:** `earned`, `locked` (shows silhouette + requirement hint, per Certification Terraces mechanic).

**Variants:** `compact` (list in Mission Brief), `full` (Terraces district chamber reveal).

**Animations:** `locked → earned` unlock plays a one-time reveal (owned by the district, triggered via a `justUnlocked` prop, not polled by the card).

**Keyboard interactions:** standard link/button semantics for the credential link.

**Accessibility considerations:** locked state exposes the reason via `aria-describedby`, never conveyed by opacity alone.

**Mobile behavior:** full-width stacked.

**Desktop behavior:** grid tile.

**Data dependencies:** `world.artifacts[]` where `type: certification`.

**Future extensibility:** expiring certifications could add a `validUntil` prop without breaking existing renders.

---

## RepositoryCard

**Purpose:** Domain-agnostic card for a GitHub repository (Git Forest artifact).

**Responsibilities:** Render name, description, primary language, star/commit stats, last-updated, link out to GitHub.

**Inputs (props):** `name`, `description`, `language`, `stats: {stars, commits, updatedAt}`, `url`.

**Outputs:** none beyond the outbound link.

**States:** `default`, `stale` (no activity in a long window — purely a display treatment, not a judgment).

**Variants:** `compact`, `full`.

**Animations:** stat numbers count up once on first render (feedback tier, ≤600ms).

**Keyboard interactions:** standard link semantics.

**Accessibility considerations:** stats have text labels, not icon-only.

**Mobile behavior:** stacked stats row.

**Desktop behavior:** inline stats row.

**Data dependencies:** `world.artifacts[]` where `type: repository` (sourced from the live GitHub API by the world compiler, not fetched client-side by this component).

**Future extensibility:** additional stat fields (PRs, issues closed) are additive to the `stats` object.

---

## ExperienceCard

**Purpose:** Domain-agnostic card for a role/employment entry.

**Responsibilities:** Render title, organization, date range, summary, key contributions list.

**Inputs (props):** `title`, `organization`, `startDate`, `endDate?`, `summary`, `highlights: string[]`.

**Outputs:** none.

**States:** `default`, `current` (no `endDate` — shows "Present").

**Variants:** `compact` (Mission Brief list), `full` (district/artifact drawer).

**Animations:** none beyond entrance fade.

**Keyboard interactions:** none (static content) unless nested in a focusable drawer.

**Accessibility considerations:** date range in `<time>` elements; highlights as a real list.

**Mobile behavior:** stacked.

**Desktop behavior:** two-column (meta sidebar + summary).

**Data dependencies:** `world.artifacts[]` where `type: experience`.

**Future extensibility:** logo/organization art slot addable without contract change.

---

## QuestCard

**Purpose:** Domain-agnostic card for a personal quest/goal (a milestone in progress, not yet complete) — supports Law I by showing real, tracked goals rather than fictional quests.

**Responsibilities:** Render goal title, description, progress indicator, target district/skill it will unlock.

**Inputs (props):** `title`, `description`, `progress: number (0-1)`, `targetLabel?`.

**Outputs:** none (read-only status).

**States:** `in-progress`, `complete` (transitions to a Timeline/artifact entry once real — a QuestCard never stays visible after completion, it converts).

**Variants:** `compact`, `full`.

**Animations:** progress bar fill on mount (one-time).

**Keyboard interactions:** none.

**Accessibility considerations:** progress exposed via `role="progressbar"` with `aria-valuenow/min/max`.

**Mobile behavior:** stacked.

**Desktop behavior:** grid tile.

**Data dependencies:** `world.artifacts[]` where `type: quest`.

**Future extensibility:** could link to a related `CertificationCard` once complete (a "this quest becomes this cert" pointer).

---

## ProjectCard

**Purpose:** Domain-agnostic card for a shipped project (the "new building rises" artifact).

**Responsibilities:** Render title, one-line pitch, stack (`SkillBadge` list), links (live demo/repo), status.

**Inputs (props):** `title`, `pitch`, `stack: string[]`, `links: {label, url}[]`, `status: 'shipped'|'in-progress'`.

**Outputs:** none beyond outbound links.

**States:** `shipped`, `in-progress`.

**Variants:** `compact` (grid in a district), `full` (artifact drawer).

**Animations:** entrance fade; stack badges stagger in (≤400ms total).

**Keyboard interactions:** standard link semantics.

**Accessibility considerations:** status communicated as text, not color chip alone.

**Mobile behavior:** stacked, links as full-width tap targets.

**Desktop behavior:** grid tile with inline links.

**Data dependencies:** `world.artifacts[]` where `type: project`.

**Future extensibility:** could add a media/screenshot slot without changing the data contract (image optional).

---

## SearchOverlay

**Purpose:** Fast keyword access into the world without navigating spatially — the "just tell me" escape hatch for power users who aren't using the Terminal or Oracle.

**Responsibilities:** Own the search input and result list; results are thin — title, type, district — clicking one navigates like any other selection.

**Inputs (props):** `isOpen`, `onClose()`, `onNavigate(target)`, `index` (flattened searchable list of districts + artifacts).

**Outputs:** `onNavigate(target)`.

**States:** `empty`, `results`, `no-results`.

**Variants:** `modal` (all breakpoints — this one doesn't need a spatial variant).

**Animations:** fade/scale-in modal (200ms).

**Keyboard interactions:** global shortcut (e.g. `/`) opens it (registered in `AppShell`); `↑/↓` moves result focus, `Enter` selects, `Esc` closes.

**Accessibility considerations:** `role="combobox"` pattern with `aria-activedescendant` on the result list.

**Mobile behavior:** full-screen modal.

**Desktop behavior:** centered modal, ~600px wide.

**Data dependencies:** flattened index of `world.districts[]` + `world.artifacts[]` (title, type, districtId only — not full content).

**Future extensibility:** fuzzy-match ranking or recent-searches memory are internal implementation details, not prop changes.

---

## NotificationToast

**Purpose:** Domain-agnostic transient message — used for things like "world updated: new certification unlocked."

**Responsibilities:** Render message + optional action, auto-dismiss after a timeout, stack multiple toasts.

**Inputs (props):** `message`, `actionLabel?`, `onAction?()`, `durationMs?`, `tone: 'info'|'success'|'ember'`.

**Outputs:** `onAction()`, `onDismiss()`.

**States:** `entering`, `visible`, `exiting`.

**Variants:** by `tone`.

**Animations:** slide/fade in (250ms), auto-fade out.

**Keyboard interactions:** dismissible via `Esc` if focused; not focus-stealing on appearance.

**Accessibility considerations:** `role="status"`, polite live region — never `alert` (nothing here is urgent per Law III, calm over urgency).

**Mobile behavior:** stacks bottom, full width minus margin.

**Desktop behavior:** stacks bottom-right, fixed width.

**Data dependencies:** none directly — triggered by world-state diffs (e.g. a new `world.json` reveals a newly-unlocked artifact since last visit).

**Future extensibility:** queueing/priority ordering is internal; prop contract stays the same.

---

## LoadingScreen

**Purpose:** Generic wait state for any async boundary other than the initial app boot (which uses `BootSequence` instead).

**Responsibilities:** Render a minimal, on-brand waiting indicator.

**Inputs (props):** `label?: string`.

**Outputs:** none.

**States:** `visible` only (unmounts when done).

**Variants:** `inline` (within a drawer/overlay), `full-screen`.

**Animations:** ambient pulse/spin (looping, low-key — a thin cyan line, not a spinner icon).

**Keyboard interactions:** none.

**Accessibility considerations:** `role="status"` with `aria-live="polite"`, `aria-label` from `label` prop.

**Mobile behavior:** same, scaled to container.

**Desktop behavior:** same.

**Data dependencies:** none.

**Future extensibility:** could accept a `progress` prop later for determinate loads.

---

## BootSequence

**Purpose:** The Gate's first-paint experience — system boot/handshake per the First Impression Contract. Distinct from `LoadingScreen`: this is a designed narrative beat, not a generic spinner.

**Responsibilities:** Play a short sequence of system-style status lines and live stats resolving in, ending in the single primary CTA becoming active.

**Inputs (props):** `stats: {uptimeDays, totalCommits, certsCount}`, `onReady()` (called when sequence completes and CTA should be interactive).

**Outputs:** `onReady()`.

**States:** `booting` (lines printing), `ready` (CTA active).

**Variants:** `full` (first visit), `skip` (returning visit within session — CTA is immediately active, no replay of the sequence, per calm-over-spectacle).

**Animations:** sequential line reveal (staggered, ~120–200ms per line), stat counters resolving; all transform/opacity only.

**Keyboard interactions:** any key press or click during `booting` fast-forwards to `ready` (never forces a visitor to wait).

**Accessibility considerations:** full boot text present in DOM immediately (not only after animation), so it's never a barrier for screen reader or reduced-motion users — for them the sequence effectively renders complete on mount.

**Mobile behavior:** shorter line count to fit viewport height without scroll.

**Desktop behavior:** full sequence as designed.

**Data dependencies:** `world.stats.{uptimeDays, totalCommits, certsCount}`.

**Future extensibility:** additional stat lines are additive; sequence timing config lives outside the component (design token, not hardcoded).

---

## LiveClock

**Purpose:** Small ambient real-time readout used in `StatusBar` and optionally the Gate.

**Responsibilities:** Tick a formatted time string on an internal interval.

**Inputs (props):** `timezone?: string`, `format?: string`.

**Outputs:** none.

**States:** ticking only.

**Variants:** none.

**Animations:** none (text update only).

**Keyboard interactions:** none.

**Accessibility considerations:** `aria-hidden="true"` — decorative, not essential information; never the sole carrier of time-sensitive content.

**Mobile behavior:** may be hidden entirely in `StatusBar`'s compact mode.

**Desktop behavior:** always visible.

**Data dependencies:** none (system clock).

**Future extensibility:** could sync to server time if drift matters later.

---

## WorldStatus

**Purpose:** Compact summary of world-state counters (districts open, ninja form, stats) — the data source behind both `StatusBar` and `BootSequence`.

**Responsibilities:** Pure formatting/presentation of `world.meta`/`world.stats` fields into short labels; no logic beyond formatting.

**Inputs (props):** `meta: world.meta`, `stats: world.stats`.

**Outputs:** none — display only.

**States:** none.

**Variants:** `inline` (StatusBar), `stacked` (Mission Brief header).

**Animations:** none.

**Keyboard interactions:** none.

**Accessibility considerations:** text-based, no icon-only counters.

**Mobile behavior:** stacked variant wraps to two lines.

**Desktop behavior:** inline variant, single line.

**Data dependencies:** `world.meta`, `world.stats` (whole objects, passed through, not destructured upstream).

**Future extensibility:** new counters are additive fields on `meta`/`stats`; component reads only what's present.

---

## Breadcrumbs

**Purpose:** Navigation control showing and enabling zoom-out through IA levels.

**Responsibilities:** Render the current path (Gate ▸ Valley ▸ District ▸ Artifact truncated appropriately); each segment is clickable to jump back to that level.

**Inputs (props):** `path: {label, level, id?}[]`, `onNavigate(level, id?)`.

**Outputs:** `onNavigate(level, id?)`.

**States:** default.

**Variants:** `full` (desktop), `back-only` (mobile — shows just a "‹ Valley" style single back control instead of the full trail).

**Animations:** none beyond standard link hover.

**Keyboard interactions:** standard tab/Enter through segments.

**Accessibility considerations:** `<nav aria-label="Breadcrumb">` with an ordered list, `aria-current="location"` on the last segment.

**Mobile behavior:** `back-only` variant.

**Desktop behavior:** `full` trail.

**Data dependencies:** none directly — receives the path already resolved by the router/`AppShell`.

**Future extensibility:** could grow a dropdown on a truncated segment for very deep paths (not currently needed at 4 levels).

---

## NavigationRail

**Purpose:** Persistent access to the three overlay modes (Terminal, Oracle, Mission Brief) plus Search, outside of the keyboard shortcuts.

**Responsibilities:** Render icon+label controls for each global mode; reflect which overlay (if any) is currently open.

**Inputs (props):** `activeOverlay?: 'terminal'|'oracle'|'brief'|'search'`, `onSelect(overlay)`.

**Outputs:** `onSelect(overlay)`.

**States:** per-item `default`/`active`.

**Variants:** `side-rail` (desktop), `bottom-tab-bar` (mobile).

**Animations:** active-indicator slide (200ms) between items.

**Keyboard interactions:** standard tab order; mirrors but does not replace the global keyboard shortcuts owned by `AppShell`.

**Accessibility considerations:** `role="tablist"`/`role="tab"` semantics with `aria-selected`.

**Mobile behavior:** fixed bottom tab bar, 44px+ targets.

**Desktop behavior:** fixed side rail.

**Data dependencies:** none — purely a mode switcher.

**Future extensibility:** additional global modes are additive items in the same list.

---

## FloatingActionButtons

**Purpose:** Contextual quick actions layered over `WorldCanvas` (e.g. "zoom to fit," "return to Gate") distinct from the persistent `NavigationRail`.

**Responsibilities:** Render 1–3 contextual buttons based on current level; never duplicate what `NavigationRail`/`Breadcrumbs` already provide.

**Inputs (props):** `actions: {icon, label, onClick}[]`.

**Outputs:** per-action `onClick`.

**States:** shows/hides per action based on relevance to current level (passed in already filtered).

**Variants:** `desktop` (bottom-right cluster), `mobile` (merges into the action band, not a separate floating cluster, to avoid overlap with the tab bar).

**Animations:** individual buttons fade in/out on relevance change (200ms).

**Keyboard interactions:** standard button semantics, included in tab order after main content.

**Accessibility considerations:** each button has a visible label or `aria-label`, never icon-only without one.

**Mobile behavior:** folded into the Actions band (per Frontend Architecture §03 three-band layout) rather than floating, to avoid a fourth visual layer on small screens.

**Desktop behavior:** floating cluster, bottom-right, above `NavigationRail`.

**Data dependencies:** none — receives a pre-filtered action list from the current view.

**Future extensibility:** new contextual actions are additive list entries.

---

## Modal

**Purpose:** Generic, domain-agnostic modal host used by `SearchOverlay` and any future confirm/info dialogs (distinct from `ArtifactDrawer`, which is a specific drawer pattern, and `OracleOverlay`/`TerminalOverlay`, which are specific docked panels).

**Responsibilities:** Own the overlay backdrop, focus trap, and dismiss behavior; render arbitrary children.

**Inputs (props):** `isOpen`, `onClose()`, `titleId`, `children`.

**Outputs:** `onClose()`.

**States:** `open`, `closing`.

**Variants:** `centered`, `full-screen` (mobile default for any modal).

**Animations:** backdrop fade + content scale-in (200ms).

**Keyboard interactions:** `Esc` closes; focus trapped inside; focus returns to trigger on close.

**Accessibility considerations:** `role="dialog"`, `aria-modal="true"`, `aria-labelledby={titleId}`.

**Mobile behavior:** `full-screen` variant by default.

**Desktop behavior:** `centered` variant by default.

**Data dependencies:** none — pure chrome, content is passed as children.

**Future extensibility:** any future dialog need composes this instead of building new overlay chrome.

---

## ContextMenu

**Purpose:** Generic right-click/long-press menu (e.g. on a `RepositoryCard` — "open in GitHub," "copy link").

**Responsibilities:** Position and render a small list of actions near the trigger point; dismiss on outside click/selection.

**Inputs (props):** `isOpen`, `position: {x,y}`, `items: {label, onSelect, danger?}[]`, `onDismiss()`.

**Outputs:** per-item `onSelect`, `onDismiss()`.

**States:** `open`, `closed`.

**Variants:** none — same on all breakpoints; on touch devices it's triggered by long-press instead of right-click, same rendered menu.

**Animations:** fast fade/scale (120ms).

**Keyboard interactions:** arrow keys move selection, `Enter` selects, `Esc` dismisses.

**Accessibility considerations:** `role="menu"`/`role="menuitem"`, managed focus.

**Mobile behavior:** long-press trigger, otherwise identical rendering.

**Desktop behavior:** right-click trigger.

**Data dependencies:** none — items passed in by the invoking card.

**Future extensibility:** used sparingly; only add where a genuine secondary-action set exists (do not add to every card by default — avoid clutter per minimalism guidance).

---

## Tooltip

**Purpose:** Generic short-text hint on hover/focus (e.g. status dot meaning, locked-reason on a `CertificationCard`).

**Responsibilities:** Position a small text bubble relative to its trigger; show on hover/focus, hide on blur/mouse-leave.

**Inputs (props):** `content: string`, `placement?: 'top'|'bottom'|'left'|'right'`, `children` (the trigger element).

**Outputs:** none.

**States:** `hidden`, `visible`.

**Variants:** none.

**Animations:** fade in ~100ms delay, fade out immediate.

**Keyboard interactions:** appears on focus, dismisses on blur/`Esc`.

**Accessibility considerations:** uses `aria-describedby` linking trigger to tooltip content; never the only way to access the information it contains (supplementary, not required).

**Mobile behavior:** typically suppressed in favor of always-visible inline text (tooltips are a poor pattern for touch) — component should offer a `disableOnTouch` behavior by default.

**Desktop behavior:** standard hover/focus tooltip.

**Data dependencies:** none.

**Future extensibility:** none anticipated — intentionally minimal.

---

## ThemeProvider

**Purpose:** Single source for design tokens (color, type, motion durations) consumed via context/CSS variables, per Visual Law (World Bible §06).

**Responsibilities:** Expose the token set (`--void`, `--surface`, `--border`, `--ki`, `--sky`, `--mind`, `--ember`, font stacks, motion durations) as CSS custom properties on the root; expose a `reducedMotion` flag derived from `prefers-reduced-motion`.

**Inputs (props):** `accentOverride?` (supports the existing tweakable accent color), `children`.

**Outputs:** context value `{tokens, reducedMotion}` consumed by any component that needs it (most read CSS variables directly and don't need the context).

**States:** none beyond the derived `reducedMotion` flag.

**Variants:** none — one token set; `accentOverride` swaps the single accent variable, not a whole theme.

**Animations:** none itself; it's the reason other components' animations have consistent timing (exposes duration tokens).

**Keyboard interactions:** none.

**Accessibility considerations:** the `reducedMotion` flag it exposes is what `CameraController`, `BootSequence`, and ambient loops key off of.

**Mobile behavior:** identical tokens — no separate mobile theme, only layout responds to breakpoint.

**Desktop behavior:** identical tokens.

**Data dependencies:** none from `world.json` — tokens are static design constants, not world content.

**Future extensibility:** additional accent presets (already speced as sky/mind/ember) are just more override values, no structural change.

---

# Component Dependency Graph

```
AppShell
├─ ThemeProvider (wraps everything)
├─ StatusBar
│  ├─ Breadcrumbs
│  ├─ WorldStatus (inline)
│  └─ LiveClock
├─ NavigationRail
├─ WorldCanvas                      (route: gate | valley | district | artifact)
│  ├─ CameraController              (owns transform/timing, no own markup)
│  ├─ BootSequence                  (gate level only)
│  ├─ DistrictCard[]                (valley level)
│  └─ DistrictScene                 (district level)
│     ├─ GuardianDialogue (greeting)
│     ├─ ProjectCard / RepositoryCard / CertificationCard / ExperienceCard / QuestCard[]
│     │     (rendered inline as hotspots, full detail deferred to ArtifactDrawer)
│     └─ ArtifactDrawer             (artifact level, opened on selection)
│        ├─ ProjectCard | RepositoryCard | CertificationCard | ExperienceCard | QuestCard
│        └─ GuardianDialogue (inline, optional contextual note)
├─ MissionBrief                     (route: brief — replaces WorldCanvas, not layered over it)
│  ├─ WorldStatus (stacked)
│  ├─ Timeline
│  ├─ SkillBadge[]
│  ├─ CertificationCard[] (compact)
│  └─ ExperienceCard[] (compact)
├─ FloatingActionButtons            (contextual, over WorldCanvas)
├─ OracleOverlay (global overlay)
│  └─ GuardianDialogue (inline, guardian = Oracle)
├─ TerminalOverlay (global overlay)
│  └─ GuardianDialogue (inline, used for oracle-in-terminal output)
├─ SearchOverlay (global overlay)
│  └─ Modal (chrome)
├─ NotificationToast[] (global, stacked)
└─ LoadingScreen (any async boundary other than initial boot)

Generic/utility (composed wherever needed, not tied to app structure):
Modal · ContextMenu · Tooltip
```

Composition notes:
- `Modal` is chrome only — `SearchOverlay` composes it; `ArtifactDrawer`, `OracleOverlay`, `TerminalOverlay` are distinct overlay patterns with their own chrome (drawer/docked-panel), not `Modal` instances.
- `GuardianDialogue` is the single component reused across district greetings, Oracle responses, and terminal Oracle output — never re-implemented per surface.
- Card family (`ProjectCard`, `RepositoryCard`, `CertificationCard`, `ExperienceCard`, `QuestCard`) is domain-agnostic and shared verbatim between `DistrictScene` (compact hotspot form), `ArtifactDrawer` (full form), and `MissionBrief` (compact form) — same components, different `variant` prop, never forked.

---

# Recommended Build Order

**Phase A — Shell &amp; Data Contract**
1. `ThemeProvider` — tokens must exist before anything else is styled.
2. `world.json` schema finalized (already scoped in Frontend Architecture M1) + `AppShell` data loading/context.
3. `StatusBar` (with `Breadcrumbs`, `WorldStatus`, `LiveClock` as static/mock data).
4. `NavigationRail` (mode switching, no overlays behind it yet).

**Phase B — Navigation Core**
5. `CameraController` (logic only, verify against a placeholder canvas).
6. `WorldCanvas` (gate/valley/district/artifact routing skeleton, no real art).
7. `DistrictCard` + Valley grid/list rendering from real `world.districts[]`.
8. `Breadcrumbs`/`Esc` wiring end-to-end (can navigate down and back up).

**Phase C — Gate Experience**
9. `BootSequence` (per First Impression Contract — system console version).
10. Wire Gate → Valley transition through `CameraController`.

**Phase D — District Template &amp; Content Primitives**
11. Card family: `ProjectCard`, `RepositoryCard`, `CertificationCard`, `ExperienceCard`, `QuestCard` (build against mock data, unit-testable in isolation).
12. `SkillBadge`, `Tooltip` (small primitives these cards may use).
13. `DistrictScene` composed with the card family + `GuardianDialogue` (greeting variant).
14. `ArtifactDrawer` wired to artifact selection.
15. Validate the full template against one real district (Git Forest, per Frontend Architecture M3) before replicating.

**Phase E — Remaining Districts**
16. Replicate `DistrictScene` across the remaining 8 districts with real content and guardian voices.

**Phase F — Global Overlays**
17. `Modal` (generic chrome).
18. `SearchOverlay`.
19. `OracleOverlay` (static/greeting first, RAG wired second).
20. `TerminalOverlay` (core commands first, easter eggs last).
21. `NotificationToast`, `LoadingScreen` (cross-cutting utility, add wherever async/state-change gaps appear).
22. `ContextMenu` (only where a real secondary-action need exists).

**Phase G — Mission Brief &amp; Polish**
23. `MissionBrief` (composes `Timeline`, `SkillBadge`, `CertificationCard`, `ExperienceCard`).
24. `FloatingActionButtons` (contextual actions, added once real navigation gaps are identified).
25. Responsive pass across all components (mobile variants already speced per-component — verify, don't redesign).
26. `prefers-reduced-motion` pass across `CameraController`, `BootSequence`, all ambient loops.
27. Accessibility audit pass (focus order, live regions, labels) across the full app.

---

# Definition of Done

**Phase A — Shell &amp; Data Contract**
- `world.json` loads once in `AppShell`; no other component fetches data directly.
- Design tokens are CSS variables from `ThemeProvider`; zero hardcoded colors/fonts elsewhere.
- `StatusBar` renders live counts from real `world.meta`/`world.stats`, not placeholders.

**Phase B — Navigation Core**
- Every IA level (`gate`, `valley`, `district`, `artifact`) has a real, shareable URL.
- Browser back/forward and `Esc` both correctly zoom out one level at a time.
- `DistrictCard` grid reflects real `world.districts[]` including locked/partial states.

**Phase C — Gate Experience**
- First paint shows system stats and a single CTA before any dojo/guardian imagery, per the First Impression Contract.
- Boot sequence is skippable by any keypress/click and fully present in the DOM for assistive tech immediately.
- Entering transitions into the Valley via `CameraController`, no hard cut.

**Phase D — District Template &amp; Content Primitives**
- All five Card components render correctly from real `world.artifacts[]` data with no district-specific forks.
- One full district (Git Forest) is live-data-driven end to end, including `ArtifactDrawer` detail view.
- Keyboard-only navigation can reach and open every artifact in that district.

**Phase E — Remaining Districts**
- All nine districts render through the same `DistrictScene` component with only data differing.
- Every guardian has a distinct greeting line sourced from `world.guardians[]`.
- No district-specific component forks exist in the codebase.

**Phase F — Global Overlays**
- `T`, `O`, `B`, and search shortcut all work from every route without page reload.
- Oracle and Terminal responses reference real world data (district/artifact ids), never fabricated content.
- All overlays trap focus correctly and restore it on close; verified with keyboard only.

**Phase G — Mission Brief &amp; Polish**
- Mission Brief is fully usable and readable with JavaScript animations disabled.
- App is fully usable at 375px width and at 1440px+ width with no layout breakage.
- `prefers-reduced-motion: reduce` removes all ambient/camera motion in favor of instant or crossfade transitions.
- Automated accessibility check (axe or equivalent) passes with zero critical/serious issues across Gate, Valley, one District, Artifact Drawer, and Mission Brief.
