# Ninjatronics — Hosting &amp; Deployment Architecture
*Production architecture reference — planning document, no workflows implemented yet.*

This document describes the long-term production architecture for
Ninjatronics: how the portfolio and blog are built, deployed, and hosted.
It is a design reference, not a session handoff — update it in place as the
architecture evolves, rather than dating entries. Current status and
sequencing live in `docs/ROADMAP.md`.

**Nothing described here is implemented yet.** No deployment workflows
exist, the current WordPress site is untouched, and the current session
priority remains the Gate UI milestone (see ROADMAP). This document exists
so that future deployment work has an agreed-upon target architecture to
build toward.

---

## 1. Hosting Topology

Two independent public sites, two independent repositories, two independent
deploy pipelines:

| Site | Domain | Source | Framework | Host |
|---|---|---|---|---|
| Portfolio | `ninjatronics.io` | this repository (`ninjatronics`, Forgejo) | React + Vite | Hostinger (static) |
| Blog | `blog.ninjatronics.io` | a new, separate Forgejo repository | Astro (static output) | Hostinger (static) |

**Boundaries that must hold:**

- The blog and portfolio are never combined into one application. They are
  built from separate repositories, by separate CI pipelines, and deployed
  independently.
- Forgejo is the source-control and CI/CD platform for both. It is **not**
  the public web server for either site — it never serves visitor traffic.
- No Node production server is introduced for either site unless a genuine
  server-side requirement appears. Both ship as static files.

---

## 2. Forgejo Responsibilities

For both the `ninjatronics` (portfolio) and future blog repositories,
Forgejo is responsible for:

- Primary source control.
- CI validation on push/PR (schema validation, type-checking, build) —
  see `docs/ROADMAP.md`'s Future Data and Compiler Work for the compiler
  side of this (`compile:world:check`).
- Production builds (`npm run build` for the portfolio; Astro's build for
  the blog).
- Deployment to Hostinger over SSH, SFTP, or rsync via Forgejo Actions.
- Holding deployment secrets — Hostinger credentials live **only** in
  Forgejo Actions secrets, never committed to either repository and never
  handled outside Actions.
- Retaining the previous successful build on the Hostinger side so a
  rollback is always available (see §8).

---

## 3. CI/CD Pipeline (Target Shape)

Each repository gets its own Forgejo Actions workflow. Neither exists yet;
this is the target shape to build against when deployment work starts:

1. **Validate** — for the portfolio: `compile:world:check` +
   `tsc --noEmit`; for the blog: Astro's own build-time content checks.
2. **Build** — `npm run build` (portfolio, Vite static output) / Astro
   build (blog, static output).
3. **Deploy** — push the build output to the appropriate Hostinger document
   root over SSH/SFTP/rsync, using credentials from Forgejo Actions
   secrets.
4. **Retain previous build** — before overwriting, the previous successful
   deployment is preserved (see §8) so a rollback doesn't require a
   rebuild.

A Forgejo Actions runner (self-hosted or managed) must exist before any of
this can run — see the Deployment Roadmap in `docs/ROADMAP.md` for
sequencing.

---

## 4. Hostinger Responsibilities

- Serve the built static portfolio at `ninjatronics.io`.
- Serve the built static blog at `blog.ninjatronics.io`.
- Provide **independent document roots** for the root domain and the blog
  subdomain — the two sites never share a document root, even though they
  share a hosting account.
- Support SPA fallback rules for the React portfolio (see §7).
- Serve normal static routes for the Astro blog — no fallback rewriting
  needed since Astro emits real per-page HTML files.

---

## 5. Preview Environments

Two staging subdomains, mirroring the production topology, deployed from a
non-`main` branch or a preview workflow trigger (exact trigger TBD when
this is implemented):

- **`preview.ninjatronics.io`** — staging deployment of the React
  portfolio, same build pipeline as production, separate Hostinger document
  root.
- **`blog-preview.ninjatronics.io`** — staging deployment of the Astro
  blog, same build pipeline as production, separate Hostinger document
  root.

Previews exist so that the first deployable UI Foundation milestone (see
`docs/ROADMAP.md`) has a real place to be reviewed before any DNS cutover is
considered.

---

## 6. Production Environments

- `ninjatronics.io` — production portfolio, deployed only from `main`
  (or the equivalent protected branch) after CI validation passes.
- `blog.ninjatronics.io` — production blog, deployed only from its
  repository's `main` after its own CI validation passes.
- Both are deployed independently — a portfolio deploy never triggers or
  blocks a blog deploy, and vice versa.

---

## 7. React SPA Routing Requirements

The portfolio is a client-side-routed SPA (`react-router-dom`, routes like
`/`, `/valley`, `/brief`, and eventually `/map/:district/:item` per the
Frontend Architecture doc). Static hosting must rewrite unknown paths to
`index.html` so deep links resolve client-side rather than 404ing at the
Hostinger document root. This SPA fallback rule applies to both
`ninjatronics.io` and `preview.ninjatronics.io`.

---

## 8. Rollback Strategy

- Every successful deploy retains the prior build on Hostinger (e.g. a
  timestamped or `-previous` sibling directory in the document root, or
  equivalent) before being overwritten.
- Rollback is a matter of re-pointing the document root (or restoring the
  retained prior build) — it must not require re-running CI or waiting on a
  rebuild.
- Applies independently to the portfolio and the blog; rolling back one
  never affects the other.

---

## 9. Secrets Management

- All Hostinger deployment credentials (SSH keys, SFTP/rsync credentials)
  live only in Forgejo Actions secrets, scoped per repository.
- No deployment secret is ever committed to either repository or stored
  outside Forgejo Actions.
- Portfolio and blog repositories have their own, separate secrets — no
  shared credential store between them beyond both targeting the same
  Hostinger account.

---

## 10. Blog Architecture (Astro)

- Separate Forgejo repository from the portfolio.
- Markdown content stored in Git (in that repository), not in a CMS or
  database.
- Built and deployed through its own Forgejo Actions workflow, independent
  of the portfolio's.
- Ships as static output — Astro emits real per-route HTML, so no SPA
  fallback rewriting is needed on the Hostinger side for the blog (contrast
  with §7).
- Hosted as an independent static site at `blog.ninjatronics.io`, its own
  Hostinger document root.

---

## 11. WordPress Retirement &amp; DNS Cutover

Not started; sequenced in `docs/ROADMAP.md`'s Deployment Roadmap. Summary:

- The current WordPress site is not modified until Hostinger previews for
  both the portfolio and blog are live and validated.
- DNS cutover (pointing `ninjatronics.io` / `blog.ninjatronics.io` at
  Hostinger) happens only after that validation.
- WordPress content migration and a redirect plan (mapping old WordPress
  URLs to their new equivalents) are planned before retiring WordPress, so
  existing indexed URLs don't dead-end.
- WordPress is retired only after cutover and redirects are confirmed
  working.

---

## 12. Future Deployment Milestones

See `docs/ROADMAP.md` → **Deployment Roadmap** for the full sequenced list
(preview environments → Forgejo runner → Hostinger credentials → SPA
rewrite config → Astro deploy → rollback → DNS cutover → WordPress
retirement → redirects). This document describes the target architecture
those milestones build toward; it does not itself define sequencing or
priority.

---

## Future Enhancement (Deferred)

Once the UI reaches a stable v1 foundation, an Architecture Decision Record
(ADR) system is planned under `docs/decisions/`, to capture significant
architectural choices (like the ones in this document) as they're made,
rather than only in prose reference docs. This is intentionally deferred
until after the initial public UI is complete — no `docs/decisions/`
directory or ADR files exist yet.
