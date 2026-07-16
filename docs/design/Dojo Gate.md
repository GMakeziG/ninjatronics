# Ninjatronics.io — The Dojo Gate
*Entry screen spec — v1.0 prototype*

> **Revision note for Claude Code:** this spec documents the temple/torii prototype as currently built. Per the World Bible's *First Impression Contract*, the production Gate should be re-scoped to a **system console** (boot/handshake sequence, live stats, single CTA) — the temple/ninja/moon imagery below should move to the Valley entrance, shown only after the visitor commits to entering. Build the console version first; reuse the circuitry/motion language below.

---

## 1. Purpose

First screen every visitor sees. Full-viewport, single scene, no scroll. Establishes tone (calm, precise, dark) and offers exactly one primary action plus three secondary modes.

## 2. Layout (z-order, back to front)

1. **Sky** — radial gradient, near-black to deep navy (`#05070A` base). Optional dusk variant (purple-tinted).
2. **Stars** — ~40 twinkling dots, randomized position/size/timing, opacity 0.15–0.9 pulse.
3. **Moon** — 128px circle, upper-center, soft blue-white radial gradient + ambient glow halo, slow breathe animation (12s).
4. **Mountain silhouettes** — two flat dark shapes (clip-path polygons), left and right, bottom ~20% of viewport. Faint cyan ridge line above them.
5. **Ground plane** — dark gradient band, bottom 34% of viewport, top border a hairline cyan (`rgba(0,255,195,0.12)`).
6. **Perspective grid** — TRON-style floor grid, `rotateX(66deg)`, cyan gridlines, scrolling animation (`path-pulse`, 5.5s loop), masked to fade at top.
7. **Center path + lanterns** — glowing vertical seam down the center; two stone lanterns flanking it with a lit cyan cell each (staggered pulse).
8. **The Torii Gate** (centerpiece, scaled ~0.82, bottom-anchored):
   - Kasagi (top beam) + Shimagi (second beam) — dark timber blocks with a flowing cyan light seam (`beam-flow`, 6–7s, gradient pans across).
   - Nuki (lower crossbeam) — same treatment, offset timing.
   - Gaku (center plaque) — small dark panel, vertical kanji "忍 NINJA" in cyan, subtle glow.
   - Two pillars — vertical gradient blocks; each contains 2–3 animated light streaks rising inside (`ki-rise` / `ki-rise-slow`, 4.5–9.5s loops, staggered) in cyan and sky-blue.
   - Threshold glow — soft horizontal cyan line between the pillar bases.
   - **Ninja figure** — placeholder silhouette standing at the threshold, cyan-rim-lit cloak shape, label "[ ninja · apprentice ]" beneath.
   - Rising embers — ~10 small cyan particles drifting upward through the gate opening (`drift-up`, 5–9s, staggered).
9. **Title block** — centered, ~30% from top (inside the gate opening): eyebrow "THE CYBER DOJO OF" (mono, wide letter-spacing) → wordmark "NINJA**TRONICS**" (Exo 2, 200/500 weight split, cyan on second half) → one-line subtext.
10. **Top status bar** — fixed, full width, 22px padding: left = live dot + "NINJATRONICS.IO · WORLD ONLINE"; right = "FORM I · APPRENTICE | 9 DISTRICTS · 7 OPEN | live clock (JST)".
11. **Oracle greeting** — bottom-right, floating card (blurred dark background, cyan left border) + 46px pulsing orb (radial cyan gradient, `oracle-pulse` 4.5s). Card text: in-character welcome line.
12. **Bottom action bar** — fixed bottom, centered row of 4 buttons + hint text beneath:
    - **ENTER THE VALLEY** — primary, filled cyan, dark text, arrow glyph.
    - **TERMINAL** — secondary outline, "T" key badge.
    - **ASK THE ORACLE** — secondary outline.
    - **MISSION BRIEF** — secondary outline, ember-tinted, "B" key badge.
    - Hint line: "CLICK TO ENTER · OR PRESS T TERMINAL · B MISSION BRIEF" (dims/changes during transition).

## 3. Interaction

- **Enter the Valley** click → scene brightness/saturation surges (`brightness(1.35) saturate(1.15)`, ~2.6s) as a stand-in for the camera transition into the Valley (to be replaced with the real camera-pan transition per the Frontend Architecture doc).
- Buttons: border + text brighten to cyan on hover, faint cyan box-shadow, background tints cyan at ~4% — 500ms ease.
- Clock updates every second (JST, `HH:MM:SS`).

## 4. Motion inventory

| Animation | Elements | Duration | Character |
|---|---|---|---|
| `twinkle` | stars | 3–8s | opacity pulse |
| `breathe` | moon, gate glow | 9–12s | scale + opacity pulse |
| `beam-flow` | gate crossbeams | 6–7s | gradient pan (energy flow) |
| `ki-rise` / `ki-rise-slow` | pillar light streaks | 4.5–9.5s | vertical loop, staggered |
| `path-pulse` | floor grid | 5.5s | linear scroll |
| `drift-up` | embers | 5–9s | rise + fade, staggered |
| `rim` | lanterns, status dot | 4–6s | opacity pulse |
| `oracle-pulse` | Oracle orb | 4.5s | scale + glow pulse |
| `fade-in-up` | title, oracle card, action bar | 1.4–1.6s | one-time entrance, staggered delays |

All motion: ease-in-out or ease-out, transform/opacity only. Respect `prefers-reduced-motion` — pause ambient loops, keep one-time entrances as simple fades.

## 5. Tokens used

- Void `#0B0F14`/`#05070A`, surface `#0C1219`/`#12181F`, border `#1E2731`/`#232C35`
- Ki-cyan `#00FFC3` (primary, tweakable), sky `#5BA6FF`, ember `#C98B4E`/`#F0983E`
- Type: Exo 2 (title, body), JetBrains Mono (all labels/status/UI copy)
- Corners: 0px. Glow: box-shadow only, low alpha.

## 6. Tweakable props (current prototype)

- `accent` — color (ki-cyan default; sky/mind/ember alternates)
- `timeOfDay` — enum `night` | `dusk`
- `showGrid` — boolean, toggles floor grid opacity

## 7. Responsive notes

Prototype is desktop-only so far. For production: title uses `clamp()` for width safety; below 640px, collapse the action bar to icon-only buttons or a bottom tab bar, and reduce gate scale further to keep the full scene in view without scroll.
