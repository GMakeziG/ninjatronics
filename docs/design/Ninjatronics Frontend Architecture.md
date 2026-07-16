# Ninjatronics.io — Frontend Architecture &amp; Implementation Roadmap
*v1 — for Claude Code*

UX architecture, IA, navigation, component system and build sequence for the first public version. No production code here — this is the blueprint a developer (or Claude Code) builds from.

---

## 00 — First Impression Contract (0–10s)

Credibility before character. A visitor's first read must be **systems engineer**, not *game*. Fantasy/RPG framing (guardians, dojo, forms) is real and stays in the system — but it is earned after entry, not shown at first paint.

- **Sees first:** a system boot/handshake — live stats (uptime, commits, certs), monospace readouts, circuit motion. No landscape, no character.
- **Primary action:** one dominant CTA to enter. Terminal/Oracle/Brief present but visually secondary — no competing menu of equal weight.
- **Hidden until explored:** the ninja avatar, guardian personas, RPG vocabulary (forms/quests/districts-as-fantasy). Introduced at Valley/District level, once credibility is established.
- **Essential vs decorative:** essential = real data, signal motion, system type, one CTA. Decorative (demoted from first paint) = moon, mountains, torii gate, ninja figure, lanterns.
- **Change to M2:** the Gate is re-scoped from a temple/torii scene to a system console — terminal handshake + live stats + single CTA. Dojo/guardian art moves to the Valley entrance, after commitment to explore.

---

## 01 — Information Architecture

One world, five layers:

| Level | Route | Purpose |
|---|---|---|
| Gate | `/` | Entry cinematic. First paint, mode choice, world status. |
| Valley | `/map` | Top-down navigable world. 9 districts, deep-linkable, camera state in URL. |
| District | `/map/:district` | Zoomed-in interior. Buildings/artifacts, guardian, live data panel. |
| Artifact | `/map/:district/:item` | Overlay/drawer. One project, cert, or note — the only "content page" in the app. |
| Overlays | global | Oracle chat, Terminal, Mission Brief — summoned from anywhere, never route away. |

Every level is a real URL (deep-linkable, back-button safe) so recruiters can be sent a direct link to one artifact without touring the whole world.

---

## 02 — Navigation Model

Camera, not pages.

- **Zoom levels, not page loads.** Gate → Valley → District → Artifact is one continuous camera move (CSS transform scale/translate on a single canvas layer), not a route swap. Route changes update the camera target; nothing unmounts unnecessarily.
- **Persistent chrome.** Top status bar and Oracle orb persist across all levels. Breadcrumb in the status bar doubles as a "zoom out" control — click "Valley" to pull back from any district.
- **Keyboard-first shortcuts.** `Esc` zoom out one level · `T` terminal · `O` oracle · `B` mission brief · `1–9` jump to district.
- **Mobile: tap, not drag.** Below 768px the valley renders as a vertical stack of district cards (same content, no camera pan) — tap to enter, swipe back. No pinch-zoom dependency.

---

## 03 — Screen Layout &amp; Visual Hierarchy

Every screen, same three bands:

1. **Status (56px)** — world state, breadcrumb, form indicator, clock.
2. **Stage (fills viewport)** — the world canvas or district interior. Z-depth: sky → mountains → ground → subject.
3. **Actions (72px)** — mode switcher, contextual CTA, hint text.

**Hierarchy rule:** exactly one accent-colored (ki-cyan) focal element per screen. Everything else is near-mono — dim, borders, monospace labels. The eye should never have two things competing for it.

---

## 04 — District Interaction Pattern

One template, nine districts. Every district — Mountains, Citadel, Forest, Hall, Temple, Terraces, Undercroft, Shrine — is the same component with different data and guardian. This is the single highest-leverage component in the system.

1. **Approach** — hover/focus on the district from the Valley shows name, guardian, open/locked state as a tooltip card.
2. **Enter** — click/Enter zooms camera in; guardian greets in a dialogue strip; artifacts (projects/certs/notes) render as discrete objects in the scene.
3. **Inspect** — click an artifact opens a right-side drawer (desktop) / bottom sheet (mobile): stack, description, links, live stat if from GitHub.
4. **Leave** — Esc or breadcrumb click zooms back out to Valley; last district visited is remembered (session only).

---

## 05 — Animation Principles

Slow, ambient, purposeful.

- **Ambient (always-on):** circuit flow, star twinkle, guardian idle pulse. Loop 4–12s, low-amplitude, GPU-cheap (transform/opacity only).
- **Transition (camera):** zoom between IA levels: 600–900ms, ease-out. Never a hard cut — the world is continuous space.
- **Feedback (input):** hover/press: 150–250ms. Instant enough to feel responsive, still eased — nothing snaps or bounces.

Respect `prefers-reduced-motion`: ambient loops pause, transitions drop to opacity-only crossfades.

---

## 06 — Reusable Components

The kit Claude Code builds once. All nine components read from one `world.json` — no component owns hardcoded content.

- **StatusBar** — breadcrumb, ninja form, district counter, clock. Fixed, persistent.
- **WorldCanvas** — camera controller: pan/zoom state machine driving Gate/Valley/District/Artifact.
- **DistrictCard** — Valley-level tile: name, guardian glyph, open/locked, hover preview.
- **DistrictScene** — interior template: background art slot, artifact hotspots, guardian dialogue strip.
- **ArtifactDrawer** — project/cert/note detail — the one place with real reading content.
- **GuardianDialogue** — speaker card + portrait + typed-out line, reused for all 6 guardians + Oracle.
- **OracleOverlay** — global chat surface, floats above everything, remembers scroll/thread per session.
- **TerminalOverlay** — command input + output log; command registry maps to the same data the world renders.
- **MissionBrief** — static dossier view: summary, skills matrix, certs, résumé PDF, contact. No canvas.

---

## 07 — Design System Tokens

Already set by the World Bible — carried forward as-is, no new tokens introduced here.

- **Color:** void `#0B0F14` · ki `#00FFC3` · sky `#5BA6FF` · mind `#A371F7` · ember `#F0983E`
- **Type:** Exo 2 (display/body) · JetBrains Mono (system/data)
- **Radius:** 0px · **Motion:** 400–900ms ease-out · **Glow:** box-shadow ≤0.08 alpha

---

## 08 — Responsive Behavior

Three breakpoints, one content model:

- **Desktop ≥1024px** — full camera-pan valley, side drawers, Oracle as floating orb + panel.
- **Tablet 640–1024px** — valley pan retained, drawers become bottom sheets, terminal full-screen when opened.
- **Mobile &lt;640px** — valley = vertical scroll of DistrictCards. No camera physics. Oracle/Terminal/Brief as full-screen modals via bottom tab bar.

---

## 09 — Build Sequence for Claude Code

Six milestones, each shippable.

1. **M1 · Skeleton** — `world.json` schema + StatusBar + routing. Empty valley with 9 clickable placeholder tiles, deep links work, Esc/breadcrumb nav works.
2. **M2 · Gate (revised)** — build the Gate as a system console per the First Impression Contract (boot/handshake, live stats, single CTA), replacing the temple/torii prototype. Wire CTA to the camera transition into M1's valley, where dojo/guardian art is introduced.
3. **M3 · One district** — build DistrictScene + ArtifactDrawer against the Git Forest (best "it's alive" proof — pull real GitHub data). Prove the template before replicating ×8.
4. **M4 · Guardians** — GuardianDialogue component; write all 6 voices; replicate DistrictScene across remaining 8 districts with real content.
5. **M5 · Oracle + Terminal** — RAG Oracle over the vault/world.json; Terminal command registry; easter eggs.
6. **M6 · Mission Brief + polish** — static dossier route, PDF résumé, responsive pass, reduced-motion pass, launch.

Each milestone is a deployable increment — M1 alone is a working (if plain) site; the world compounds from there.
