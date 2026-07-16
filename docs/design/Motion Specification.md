# Ninjatronics.io — Motion Specification
*docs/design/Motion Specification.md · extends Design Tokens.md §11 and Frontend Architecture §05*

Every animation in the application, specified at implementation level. Durations and easings reference the tokens defined in Design Tokens.md — this document does not redefine them, only applies them. Suitable for direct implementation in Framer Motion (`transition={{ duration, ease }}`) or CSS (`transition`/`@keyframes`).

Three tiers, per Frontend Architecture §05:
- **Ambient** — always-on, low-amplitude, GPU-cheap (transform/opacity only).
- **Transition** — camera/IA-level moves, 600–900ms ease-out, never a hard cut.
- **Feedback** — input response, 150–250ms.

Global rule: every animation below degrades under `prefers-reduced-motion: reduce` per its own "Reduced-motion behavior" line — there is no animation in this document exempt from a reduced-motion answer.

---

## 1. Camera Movement (owned exclusively by `CameraController`)

**Duration:** `--duration-transition` (700ms). **Easing:** `--easing-standard`. **Trigger:** route/target change (`goTo(target)`). **Ownership:** `CameraController` computes and applies the transform; no other component animates `WorldCanvas` layer position/scale. **Interruptibility:** a new `goTo()` call while animating cancels the in-flight tween and starts a new one from the current interpolated position (no queueing, no snapping back to start). **Reduced-motion:** transform tween is replaced with a 200ms opacity crossfade between the outgoing and incoming static layers; no scale/translate occurs.

Implementation shape (Framer Motion):
```
animate={{ x: target.x, y: target.y, scale: target.scale }}
transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
```

### 1.1 Gate → Valley transition
Trigger: primary CTA activation on the Gate. Camera scales from the Gate's fixed framing (scale 1, centered) out to the Valley's full-map framing (scale ~0.4, origin centered on Dojo Gate district). Ownership: `CameraController`; the Gate's own `brightness/saturate` surge (already in the Dojo Gate prototype) is a *separate*, component-owned effect on `WorldCanvas`'s filter, running concurrently, not part of `CameraController`'s transform. Interruptible: no — this specific transition is a one-way commitment (there is no "cancel entering"), but is still driven by the same tween mechanism. Reduced-motion: filter surge is dropped entirely (no brightness animation), crossfade only.

### 1.2 Valley → District zoom
Trigger: `DistrictCard` selection. Camera scales from Valley framing (~0.4) to that district's framing (scale ~1.2, origin on district position from `world.districts[].position`). Concurrent effect: the entered `DistrictScene`'s `GuardianDialogue` (greeting variant) begins its own text-reveal animation only after `onTransitionComplete()` fires — dialogue never starts mid-camera-move. Interruptible: yes — pressing `Esc` mid-zoom reverses direction from current position back to Valley framing.

### 1.3 District → Artifact (drawer, not camera)
Not a `CameraController` move — opening `ArtifactDrawer` is a **local overlay** animation (see §4 Overlay Motion), because the world position underneath doesn't change, only a panel appears over it. This is a deliberate distinction: camera motion = "I moved through the world"; drawer motion = "a panel appeared over where I am."

---

## 2. Oracle Typing / Terminal Output (owned by `GuardianDialogue` / `TerminalOverlay`)

**Duration:** total reveal time = `min(900ms, 40ms × character count)`, capped so long responses don't feel sluggish. **Easing:** `linear` per-character reveal, `--easing-standard` for the container fade-in. **Trigger:** new dialogue line or terminal output line assigned. **Ownership:** `GuardianDialogue` owns its own text reveal internally — callers only supply the final string; `TerminalOverlay` reuses the identical reveal primitive for command output lines, line-by-line with a 60ms stagger between lines. **Interruptibility:** any user input (new message sent, new command entered, click anywhere in the overlay) immediately completes the current reveal to full text — never blocks input. **Reduced-motion:** full text renders immediately, no character stagger; only the container fade (200ms) remains.

Implementation shape (CSS, character-mask approach): container has the full text in the DOM at all times (accessibility requirement — see Component Specification.md `GuardianDialogue`); a visual overlay `<span>` with `clip-path: inset(0 100% 0 0)` animates to `inset(0 0% 0 0)` via `transition: clip-path 0.9s linear`, `aria-hidden="true"` duplicate layer, real text underneath is not clipped for AT.

---

## 3. Hover &amp; Focus States (feedback tier, owned by the interactive component itself — never by a parent)

**Duration:** `--duration-feedback` (200ms). **Easing:** `--easing-standard`. **Trigger:** `:hover`/`:focus-visible`. **Ownership:** each interactive primitive (`DistrictCard`, buttons, `NavigationRail` items, Card-family links) owns its own hover/focus transition — this is CSS `transition`, not JS-driven, so no ownership ambiguity is possible. **Interruptibility:** inherently interruptible — reversing the trigger (mouseleave/blur) reverses the transition from wherever it is. **Reduced-motion:** unaffected — hover/focus feedback is not considered motion-sickness-inducing at this scale (≤200ms, opacity/border/shadow only, no transform beyond ≤2px lift); only transform-based lift is capped to `translateY(-1px)` max regardless of setting.

Standard hover recipe (applies to `DistrictCard`, buttons, Cards):
```
transition: border-color 0.2s var(--easing-standard),
            background 0.2s var(--easing-standard),
            box-shadow 0.2s var(--easing-standard),
            transform 0.2s var(--easing-standard);
&:hover { border-color: var(--accent-primary); box-shadow: var(--glow-ki-md); transform: translateY(-1px); }
```

Focus ring: `outline: 2px solid var(--accent-primary); outline-offset: 2px;` — no transition delay, appears instantly on `:focus-visible` (focus indication must never be animated-in, per accessibility-first direction — a delayed focus ring is a keyboard-trap risk).

---

## 4. Overlay Motion (owned by the overlay component itself: `ArtifactDrawer`, `Modal`, `OracleOverlay`, `TerminalOverlay`, `SearchOverlay`)

**Duration:** `--duration-overlay` (300ms) open; 200ms close (closing is slightly faster — leaving should never feel slower than arriving). **Easing:** `--easing-standard` for both. **Trigger:** `isOpen` prop transition. **Ownership:** the overlay component itself animates its own transform/opacity; the scrim/backdrop fades independently but concurrently (same duration, so they complete together). **Interruptibility:** yes — a close request mid-open-animation reverses immediately from current progress (no forced completion). **Reduced-motion:** transform (slide/scale) is dropped; only opacity fade remains, same duration.

- `ArtifactDrawer` (side-drawer, desktop): `translateX(100%) → translateX(0)`, opacity `0 → 1`.
- `ArtifactDrawer` (bottom-sheet, mobile): `translateY(100%) → translateY(0)`.
- `Modal`: backdrop opacity `0 → var(--opacity-scrim)`; content `scale(0.96) → scale(1)` + opacity `0 → 1`.
- `OracleOverlay` / `TerminalOverlay` (docked panel): `translateY(12px) → translateY(0)` + opacity, matching the shared "panel" motion recipe once, reused by both.
- `NotificationToast`: enters via `translateY(8px) → translateY(0)` + opacity (desktop: from bottom-right; mobile: from bottom), auto-exits by reversing the same tween after its display duration.

---

## 5. Ambient Motion (looping, passive — each owned by the component that renders the visual)

All ambient loops share the constraint: transform/opacity only, `--easing-ambient` (ease-in-out) unless marked linear, amplitude low enough to read as "breathing," never "flashing."

| Animation | Element(s) | Duration | Easing | Amplitude | Owner |
|---|---|---|---|---|---|
| Star twinkle | background stars (Gate) | 3–8s, randomized per star | ease-in-out | opacity 0.15 ↔ 0.9 | Gate scene component |
| Moon/orb breathe | moon, Oracle idle orb, gate ambient glow | 9–12s | ease-in-out | scale 1 ↔ 1.04–1.12, opacity 0.5 ↔ 0.85 | Gate scene / `OracleOverlay` idle state |
| Circuit beam flow | gate crossbeams, pillar light streaks, any "energy flowing" line | 4.5–7s, staggered start per instance | **linear** (flow reads wrong if eased) | gradient position 100% travel | owning structural component (Gate, future district architecture) |
| Grid scroll | perspective floor grid | 5.5s | linear | background-position translate one tile | Gate / Valley background |
| Ember/particle drift | rising particles | 5–9s, staggered | ease-in (accelerate as it fades, gravity-adjacent) | translateY -120px, opacity 0 → 0.7 → 0 | Gate scene component |
| Status dot pulse | `StatusBar` live indicator, lantern lights | 4–6s | ease-in-out | opacity 0.5 ↔ 1 | `StatusBar` / scene component |
| Guardian idle pulse | `GuardianDialogue` portrait, greeting variant | 4–6s | ease-in-out | opacity/scale ≤0.1 amplitude | `GuardianDialogue` |
| Cursor blink (terminal) | `TerminalOverlay` prompt caret | 1s | step (not eased — literal blink) | opacity 0/1 hard toggle | `TerminalOverlay` |

**Trigger (all ambient):** mount, runs indefinitely while the owning element is visible; pauses when the tab is backgrounded (via `document.visibilityState`, implementation detail, not a design requirement but a performance one). **Interruptibility:** ambient loops are not interrupted by user action; they simply continue underneath other motion (e.g. star twinkle keeps running during a camera transition). **Reduced-motion:** every ambient loop in this table is either fully disabled (twinkle, particle drift, grid scroll, beam flow — these are decorative-only) or reduced to a static mid-value (breathe/pulse animations freeze at their midpoint opacity rather than disappearing entirely, so the element doesn't look "broken," it looks "steady").

---

## 6. Boot Sequence (owned by `BootSequence`)

**Duration:** total ~1.8–2.4s for the full first-visit sequence (4–6 lines × 150–200ms stagger + final CTA activation fade 300ms). **Easing:** `--easing-standard` per line reveal (translateY 8px + opacity, not a character-type effect — this is a systems boot, lines appear as completed log entries, not typed character-by-character). **Trigger:** `AppShell` mount, `variant="full"` (first visit this session). **Ownership:** `BootSequence` alone; `AppShell` only decides `full` vs `skip` variant. **Interruptibility:** any keypress or click during `booting` immediately completes all remaining lines and activates the CTA (documented already in Component Specification.md — restated here as the authoritative motion behavior). **Reduced-motion:** all lines and stats present at full opacity on mount, zero stagger — sequence is effectively instantaneous, CTA active immediately.

Per-line implementation shape:
```
initial={{ opacity: 0, y: 8 }}
animate={{ opacity: 1, y: 0 }}
transition={{ duration: 0.3, ease: [0.16,1,0.3,1], delay: index * 0.15 }}
```

Stat counters (uptime/commits/certs) count up from 0 to final value over 600ms, `ease-out`, starting at the same delay as their line's reveal — capped so it never exceeds the line stagger window (counters finish before the next line's line-reveal begins).

---

## 7. Loading States (owned by `LoadingScreen`)

**Duration:** indefinite loop (unknown wait time) — a single continuous indicator, not a fixed-duration animation. **Motion:** a thin `--accent-primary` line sweeping left-to-right, 1.4s linear loop, opacity 0.2 ↔ 0.6 (never a spinning icon — matches "no cartoon UI"). **Trigger:** mount while awaiting async data. **Ownership:** `LoadingScreen` itself. **Interruptibility:** unmounts immediately (no exit animation needed — it's a wait-state, not a content reveal) once data resolves. **Reduced-motion:** replaced with a static dim line at fixed 0.4 opacity (still communicates "loading" via the `aria-live` label, not via motion).

---

## 8. Notification Appearance — see §4 (Overlay Motion, `NotificationToast` row). Not restated here to avoid duplication.

## 9. Cursor Behavior

- Default cursor: system default everywhere except explicit interactive elements.
- Interactive elements (`DistrictCard`, buttons, links, artifact hotspots): `cursor: pointer`.
- `TerminalOverlay` input area: `cursor: text`, with the blinking caret described in §5.
- Draggable elements (none in v1 — `DistrictCard` reordering, thumbnail drag, etc. are not part of this application's interaction model): not applicable. If introduced later, `cursor: grab`/`grabbing` would be added here, not invented ad hoc by a component.
- No custom cursor graphic/trailing-particle cursor effect — would contradict "calm and elegant" and add unnecessary motion.

---

## 10. Reduced-Motion Master Rule

`ThemeProvider` exposes `reducedMotion: boolean` (from `prefers-reduced-motion: reduce`). Every animation in this document has a stated reduced-motion behavior; as a fallback for any future animation not yet documented here, the default rule is: **replace transform-based motion with an opacity-only fade of the same semantic duration tier, and disable all indefinite ambient loops in favor of their static midpoint value.** No animation is ever simply "removed" in a way that leaves content invisible or a control unreachable.

---

## Cross-references

- Duration/easing values are defined once in Design Tokens.md §11; this document only specifies which token applies where and why.
- State transitions that these animations visualize (e.g. `booting → ready`, `closed → open`) are formally specified in State Diagrams.md — this document covers *how it moves*, that one covers *when it's allowed to move*.
