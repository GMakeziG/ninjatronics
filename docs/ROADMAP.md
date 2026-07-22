# Ninjatronics — Project Roadmap

This is the long-lived project roadmap. It tracks where the project stands
and where it's headed across sessions. For day-to-day session summaries see
`docs/handoffs/`; for detailed UX/component specs see `docs/design/`.

---

## Current State

- **Content domains complete (schema → content → compiler → read-model):**
  Districts (4), Guardians (4), Profile (singleton), Certifications (2),
  Experiences (18), Skills (~35), Repositories (synced from GitHub via
  `scripts/github-sync/` + `content-overrides/`).
- **World Compiler:** stable since v0.9.0 — generic, schema-driven,
  fail-closed. No per-type special-casing.
- **Read models:** `src/lib/world.ts`, `src/lib/world-graph.ts`,
  `src/lib/git-forest.ts`, `src/lib/mission-brief.ts` all implemented and
  verified against real compiled data.
- **Frontend:** React/Vite scaffolded (`src/app`, `src/pages`,
  `src/components`), routing wired (`/`, `/valley`, `/brief`) per the
  Frontend Architecture doc's M1 skeleton. Pages are currently plain,
  unstyled placeholders — none of the visual design system
  (`docs/design/Design Tokens.md`, Component Spec, Motion Spec) has been
  implemented yet.
- **Current UI milestone: M2 — Gate.** Rebuilding `/` (`src/pages/Gate.tsx`)
  from a bare placeholder into the system-console entry screen specified in
  `docs/design/Dojo Gate.md` and the First Impression Contract in
  `docs/design/Ninjatronics Frontend Architecture.md` §00 — boot/handshake
  sequence, live stats, single CTA into the Valley.
- **Security hardening:** project-level Bash guard hooks and permission
  model added (`.claude/hooks/`, `.claude/settings.json`).
- **Known limitations:**
  - `projects`, `quests`, `notes` content domains remain schema-only, zero
    content.
  - No automated test suite; all verification is manual
    (`compile:world:check`, `tsc --noEmit`, disposable scratchpad scripts).
  - No CI pipeline anywhere yet.
  - No production deployment exists — nothing is hosted publicly yet (see
    Production Architecture below).
  - `git-forest.ts`'s `richness` heuristic and `world-graph.ts`'s
    `pickEntryDistrictId()` are placeholder heuristics, not curated data.

---

## Near-Term Roadmap

**v0.12.0 — UI Foundation**, following the six-milestone build sequence in
`docs/design/Ninjatronics Frontend Architecture.md` §09:

1. **Gate** — system-console entry screen (current milestone, in progress).
2. **Valley** — top-down navigable world view (`/map`), 9 district tiles,
   deep-linkable, replacing the current plain `<ul>` placeholder.
3. **Mission Brief** — static dossier route styled to the design system,
   building on the already-working `getMissionBrief()` data.
4. **First deployable preview** — once Gate + Valley + Mission Brief carry
   real visual design, cut the first build worth putting on
   `preview.ninjatronics.io` (see Deployment Roadmap).

---

## Frontend Expansion

Follows M3–M6 of the Frontend Architecture build sequence, after UI
Foundation:

- **DistrictScene** — interior template component (background slot, artifact
  hotspots, guardian dialogue strip) — the single highest-leverage
  component, built once against Git Forest first.
- **Git Forest** — first fully real district, proving the DistrictScene
  template against live GitHub-sourced repository data.
- **ArtifactDrawer** — project/cert/note detail drawer (desktop) / bottom
  sheet (mobile).
- **Remaining districts** — replicate DistrictScene + GuardianDialogue
  across the other 8 districts with real content.
- **Oracle** — RAG knowledge layer + `OracleOverlay` chat surface over
  compiled world data.
- **Terminal** — `TerminalOverlay` command registry mapped to the same data
  the world renders.
- **Search** — cross-domain search over compiled world content.
- **Accessibility and responsive polish** — `prefers-reduced-motion` pass,
  mobile tap-based valley (vertical DistrictCard stack), keyboard shortcuts
  (`Esc`/`T`/`O`/`B`/`1–9`).

---

## Production Architecture

- **`ninjatronics.io`** — the React/Vite Ninjatronics portfolio, built from
  this repository, deployed as static files to Hostinger.
- **`blog.ninjatronics.io`** — a separate, statically generated blog,
  planned as an Astro project in its own Forgejo repository, with Markdown
  content stored in Git.
- **Forgejo** is the primary source-control and CI/CD platform for both
  repositories: CI validation, production builds, and deployment to
  Hostinger (SSH/SFTP/rsync). Forgejo is **not** the public blog web
  server.
- **Hostinger** is the static hosting target: independent document roots
  for the root domain and the blog subdomain, SPA fallback rules for the
  React portfolio, normal static routing for the Astro blog.
- **Forgejo Actions** builds and deploys both sites; deployment secrets
  live only in Forgejo Actions secrets.
- **Portfolio and blog stay separate repositories and separate
  applications** — never combined into one app.
- **No Node production server** is introduced unless a genuine
  server-side requirement appears; both sites are pure static output.

Full detail: `docs/design/Hosting & Deployment Architecture.md`.

---

## Deployment Roadmap

Sequenced future work — **no deployment workflows exist yet**; this is a
planning section, not an in-progress task list:

1. `preview.ninjatronics.io` staging deployment for the React portfolio.
2. `blog-preview.ninjatronics.io` staging deployment for the Astro blog.
3. Forgejo Actions runner setup (self-hosted or managed).
4. Build validation in CI (schema/type/build checks before any deploy
   step).
5. Hostinger deployment credentials and secrets, stored only in Forgejo
   Actions secrets.
6. SPA fallback/rewrite configuration for the React portfolio on Hostinger.
7. Static deployment configuration for the Astro blog on Hostinger.
8. Rollback strategy — retain the previous successful build on Hostinger.
9. DNS cutover — pointing `ninjatronics.io` and `blog.ninjatronics.io` at
   Hostinger once previews are validated.
10. WordPress retirement — after cutover is verified, not before.
11. Redirect plan from existing WordPress URLs to their new equivalents.

Full detail: `docs/design/Hosting & Deployment Architecture.md`.

---

## Future Data and Compiler Work

- Timeline generation — derive a chronological view across experiences,
  certifications, and repository activity.
- Derived statistics — computed fields (e.g. years of experience, skill
  recency) rather than hand-maintained content.
- Obsidian ingestion — notes become knowledge artifacts, per CLAUDE.md §7.
- Evolution rules — world state that changes from real activity (weather,
  district "richness") rather than static content.
- Asset pipeline — images/icons/art associated with districts, guardians,
  and artifacts.
- CI validation — `compile:world:check` and `tsc --noEmit` running
  automatically on push/PR.
- Plugin architecture — formalizing "new domain = schema + registry entry"
  into a more explicit extension mechanism, if/when a domain proves the
  current pattern insufficient.

---

## Deferred Work

- **Architecture Decision Record (ADR) system** under `docs/decisions/` —
  intentionally deferred until the initial public UI (through v0.12.0 and
  the first deployable preview) is complete. Not started; directory does
  not exist yet.
- **`projects`, `quests`, `notes` domains** — schemas exist, no content;
  deferred behind Skills/Experience work being the immediate priority per
  the 2026-07-10 handoff.
- **Oracle / knowledge graph** — explicitly not ready until Projects and
  remaining districts have real content to reason over.
- **Deployment workflows** — deferred until the current Gate UI milestone
  and the rest of UI Foundation (v0.12.0) are further along; documented
  here as a roadmap, not implemented yet.
- **WordPress migration/cutover** — deferred until Hostinger previews are
  live and validated; the current WordPress site is not to be touched
  until then.

---

## Definition of Done (Public v1)

A public v1 release is complete when:

- Gate, Valley, and Mission Brief are built to the design system (not
  placeholders) and deployed at `preview.ninjatronics.io`.
- At least Git Forest is a fully real, navigable district (DistrictScene +
  ArtifactDrawer proven against live data).
- The build is deployed to `ninjatronics.io` via Forgejo Actions → Hostinger,
  with a working rollback path.
- `blog.ninjatronics.io` is live (even with minimal initial posts) via its
  own Forgejo Actions → Hostinger pipeline.
- DNS has cut over from WordPress and redirects are in place for any
  previously indexed WordPress URLs.
- Reduced-motion and mobile/responsive behavior are verified, not just
  assumed from the design spec.
