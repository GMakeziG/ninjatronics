# Ninjatronics.io — World Bible
*v1.0 — Pre-Code — Gerso Robayo-Guillen*

Not a portfolio. A living world that grows as its creator learns. The Cyber Dojo of Gerso Robayo-Guillen. Visitors arrive as apprentices in a world where every commit, note, certification and lab leaves a permanent mark. This document defines the universe — philosophy, geography, inhabitants, mechanics, visual law and architecture — before production code.

---

## 00 — First Impression Contract (0–10s)

**Credibility before character.** A visitor's first read must be *systems engineer*, not *game*. Fantasy/RPG framing (guardians, dojo, forms) is real and stays in the system — but it is earned after entry, not shown at first paint.

- **Sees first:** a system boot/handshake — live stats (uptime, commits, certs), monospace readouts, circuit motion. No landscape, no character.
- **Primary action:** one dominant CTA to enter. Terminal/Oracle/Brief present but visually secondary — no competing menu of equal weight.
- **Hidden until explored:** the ninja avatar, guardian personas, RPG vocabulary (forms/quests/districts-as-fantasy). Introduced at Valley/District level, once credibility is established.
- **Essential vs decorative:** essential = real data, signal motion, system type, one CTA. Decorative (demoted from first paint) = moon, mountains, torii gate, ninja figure, lanterns — these belong once the visitor has committed to exploring.
- **Architecture consequence:** the Gate is a system console (boot sequence + live stats + single CTA), not a temple scene. Dojo/guardian art moves to the Valley entrance.

---

## 01 — Core Philosophy

The dojo is the narrative. Everything else serves it. Mastery is built through thousands of small improvements over a lifetime. The world must feel peaceful, intentional and rewarding to explore — curiosity over urgency, elegance over spectacle. RPG mechanics provide structure; OS interfaces provide familiarity; the dojo provides meaning.

- **Law I — Truth over fiction.** Nothing is invented. Every building, rank and unlocked chamber maps 1:1 to a real artifact: a repo, a note, a certification, a shipped project. No fictional XP — the "game" is the actual career.
- **Law II — Calm cyberpunk.** Japanese architecture + Ghost in the Shell + TRON + modern Linux terminals. Dark but serene. Neon is energy flowing through circuits — thin accents on near-black, never walls of glow.
- **Law III — Discovery, not pages.** Visitors discover a mind, they don't read a résumé. Information is spatial: knowledge lives in a library, code in an archive, infrastructure in a citadel. The Oracle guides anyone who'd rather ask than wander.
- **Law IV — One keypress to business.** Recruiters are honored guests, not hostages. Pressing **B** anywhere opens the Mission Brief — résumé, skills, contact. The world waits.

---

## 02 — The World Map (Low Fidelity)

A mountain valley seen from above. The **Dojo Gate** sits at the center — every visitor starts there. Districts radiate outward by discipline; elevation encodes abstraction (mountains = OS fundamentals, floating citadel = orchestration, sky = cloud).

| District | Position | Focus | Status | Guardian |
|---|---|---|---|---|
| Linux Mountains | NW, high elevation | OS, shell, scripting, automation | Open | The Keeper |
| The Floating Citadel | N, airborne | Kubernetes, GitOps, orchestration | Open | The Architect |
| Cloud Temple | NE, sky | Azure, Cloudflare, networking | Open | The Sky Guardian |
| The Git Forest | W, forest | Repos as trees, live GitHub data | Open | The Archivist |
| **Dojo Gate** | Center, origin | Entry point, all paths radiate here | Spawn | The Ninja + The Oracle |
| Hall of Knowledge | E, grove | Obsidian second brain, knowledge graph | Open | The Librarian |
| Homelab Undercroft | SW, underground | Labs, experiments, hardware | Open | The Keeper (shared) |
| Certification Terraces | S, terraces | Sealed chambers unlocked by real certs | Partial — chambers locked | Keys: real certifications |
| Oracle Shrine | SE, shrine | Home of the AI companion | Open | The Oracle |

Legend: ● Open — explorable today · ◐ Partial — chambers unlock via real achievements · ◆ Origin — visitor spawn point · dashed border = airborne district.

---

## 03 — The Guardians

The world itself is alive. Six guardians embody the disciplines — not fantasy monsters, but symbolic guides with distinct voices, each bound to a live data source. When the data changes, the guardian's domain visibly changes.

**The Keeper of the Mountains** — Linux, systems, scripting. Ancient, patient, precise; speaks in short declarative sentences; values stability above all.
> "The mountain does not hurry. Uptime: 3,412 days."
Data: scripting repos, lab notes, homelab uptime.

**The Architect** — Kubernetes, GitOps, orchestration. Visionary and systematic; thinks in desired states and reconciliation loops. Rebuilds the Floating Citadel in real time as clusters change.
> "The Citadel has much to teach. Follow me — the desired state awaits."
Data: k8s/GitOps repos, cluster manifests, CKA path.

**The Archivist** — GitHub, version control, OSS. Meticulous historian; remembers every commit as a vow. Tends the Git Forest — one tree per repository.
> "Nothing is lost here. 1,847 contributions this year — shall I show you the oldest ring?"
Data: GitHub API — repos, commits, PRs, releases (live).

**The Librarian** — Obsidian, notes, second brain. Warm, curious, slightly mysterious; guards the Hall of Knowledge, delights in unexpected connections.
> "Curious — this note on PKI links to one on tea ceremonies. Everything connects, eventually."
Data: Obsidian vault — note count, links, graph density.

**The Sky Guardian** — Azure, Cloudflare, networking. Watchful and calm, sees the whole valley at once. Weather over the valley reflects infra health.
> "Skies are clear. All zones green. The edge holds."
Data: cloud projects, network labs, Azure cert path.

**The Oracle** — AI companion, knowledge graph, guide. The connective tissue — a fox-spirit of light that knows every note, repo and lesson. Answers questions, then escorts visitors to the relevant guardian.
> "Kubernetes? The Architect has much to teach. Follow me to the Floating Citadel."
Data: everything — RAG over vault + GitHub + world state.

---

## 04 — Evolution Mechanics

Real achievement → permanent world change. Each rule is deterministic: a verifiable real-world event triggers a specific, visible, irreversible change.

| Real event | World change |
|---|---|
| Major project ships | A new building rises in its district, with plaque, stack and story inside |
| Certification earned | A sealed chamber on the Terraces unlocks; its lantern lights permanently |
| Note published to the vault | A shelf grows in the Hall of Knowledge; the constellation ceiling gains a star |
| GitHub activity (live API) | Trees in the Git Forest grow rings; ambient fireflies = this week's commits |
| Homelab milestone | New workbench appears in the Undercroft; machinery hum deepens |
| Learning path completed | A new footpath is paved between two districts, connecting the disciplines |
| Book finished / talk given / mentorship | Stone lanterns placed along the valley road — small, countless, cumulative |

### The Ninja — Five Forms
The avatar is forged from circuitry, code and accumulated wisdom. Each form is triggered by a bundle of real milestones (defined in `world.json`), adding visible detail — brighter circuit lines, an extra armor layer, a new belt tool.

1. **Apprentice** — starting form. Simple garb, faint circuit glow.
2. **Practitioner** — first certifications + shipped labs. Belt tools appear.
3. **Engineer** — production systems in the wild. Armor plating, steady glow.
4. **Architect** — designs platforms others build on. Circuit lines run gold.
5. **Master (sealed)** — criteria intentionally undisclosed; even the Oracle only hints.

---

## 05 — Navigation Modes

Four lenses on one world state; visitors switch anytime, the world remembers where they were.

- **Explore (default)** — cinematic scroll-and-click through the valley. Districts reveal with parallax depth; entering a building opens its interior as an overlay. Feels like walking, built like a website — keyboard fully supported.
- **Terminal (key T)** — a real shell over the world: `map`, `projects`, `skills`, `github`, `ask oracle "…"`. The love letter to fellow engineers; hides at least three easter eggs.
- **Oracle (always present)** — conversational mode. Ask "show me Gerso's Kubernetes experience" — the Oracle answers from the knowledge graph, then flies you to the Floating Citadel with relevant evidence highlighted.
- **Mission Brief (key B)** — the recruiter escape hatch, styled as a classified dossier: summary, experience, skills matrix, certifications, PDF résumé, contact. Loads instantly, prints cleanly, zero game required.

---

## 06 — Visual Law

Near-black surfaces, thin borders, sharp corners. Neon appears only as 1–2px lines, glyphs and text — the energy in the circuits, never floodlight. Motion is slow and deliberate: drift, breathe, reveal. Nothing bounces.

**Palette**
- `#0B0F14` Void — background
- `#12171F` Surface
- `#1E232B` Border
- `#00FFC3` Ki — primary accent
- `#5BA6FF` Sky — info
- `#A371F7` Mind — knowledge
- `#F0983E` Ember — locked state / CTA

**Type**
- Display & body: **Exo 2** — headlines light (300), emphasis semibold (600). Geometric, quietly futuristic.
- System & data: **JetBrains Mono** — all labels, data, terminal output, guardian dialogue.

**Motion rules:** 400–900ms, ease-out, opacity + 8–16px translate. Corners: 0px everywhere. Glow: box-shadow only, ≤0.08 alpha. Sound: none, by decree.

---

## 07 — System Architecture

Obsidian is the source of truth for knowledge; GitHub for software. An integration engine compiles both into a single public **world.json** — the world renders from that file, and the Oracle answers from the graph behind it.

```
Obsidian Vault (notes, graph, learning paths, certs log)  ─┐
                                                             ├─▶ World Compiler (CI job, applies evolution rules) ─▶ world.json ─▶ Render: Explore / Terminal / Mission Brief
GitHub API (repos, commits, PRs, releases — live)          ─┘                                                     └─▶ The Oracle (RAG over vault + code + world state)
```

Because the world renders from one file, "evolution" is just a diff — every change is reviewable, reversible in git yet permanent in lore, and the whole world can be rebuilt from scratch at any commit.

---

## 08 — Build Roadmap

- **Phase 0 (done):** World Bible — universe, guardians, mechanics, visual law agreed before code.
- **Phase 1:** the whole map, low fidelity — all nine districts navigable, Oracle stubbed, Mission Brief functional, `world.json` schema drafted with real data.
- **Phase 2:** hi-fi entry + one district — Dojo Gate (as a system console, per the First Impression Contract) plus one complete district, recommended the Git Forest for immediate "it's alive" proof via live API.
- **Phase 3:** guardians + Oracle + terminal — guardian dialogue system, RAG Oracle over the vault, terminal mode with easter eggs; remaining districts at hi-fi.
- **Phase 4:** the compiler — CI pipeline from Obsidian + GitHub → world.json. From this point the world evolves on its own, forever.

> "The mountain does not hurry."
