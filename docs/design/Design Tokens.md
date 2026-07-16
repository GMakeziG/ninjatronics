# Ninjatronics.io — Design Tokens
*docs/design/Design Tokens.md · extends World Bible §06 (Visual Law) and Frontend Architecture §07*

The complete visual design language. Every value here is exposed as a CSS custom property by `ThemeProvider` (see Component Specification.md). No component may hardcode a color, spacing value, font, radius, shadow, or duration — it consumes a token.

Visual direction constraint for every token below: mature cyberpunk, Japanese minimalism, Ghost in the Shell / TRON Legacy, premium developer tooling. No fantasy-RPG color clichés (no purple-pink gradients, no gold "loot" glow), no cartoon UI, calm and elegant, subtle motion, accessibility first.

---

## 1. Color System

### 1.1 Base palette (raw values)

| Token | Value | Role |
|---|---|---|
| `--color-void-900` | `#05070A` | Deepest background (Gate sky, modal backdrops) |
| `--color-void-800` | `#0B0F14` | App background |
| `--color-surface-700` | `#0D1219` | Panel/card background |
| `--color-surface-600` | `#10151C` | Elevated card background (hover/active surfaces) |
| `--color-surface-500` | `#12181F` | Highest-elevation surface (drawers, modals) |
| `--color-border-500` | `#1E232B` | Default hairline border |
| `--color-border-400` | `#232C35` | Emphasized border (focus-adjacent, gate structure) |
| `--color-border-300` | `#2A3140` | Strongest structural border (dashed/airborne markers) |
| `--color-ink-100` | `#E6EDF3` | Primary text |
| `--color-ink-300` | `#B8C2CC` | Secondary text / body copy on dark surfaces |
| `--color-ink-500` | `#9AA5B1` | Tertiary text / descriptions |
| `--color-ink-700` | `#6B7684` | Muted labels, metadata |
| `--color-ink-800` | `#4A5462` | Disabled / faintest legible text |
| `--color-ink-900` | `#2A333D` | Divider text (separators like "·") |

### 1.2 Semantic accent tokens

These four accents are the *entire* color vocabulary beyond ink/surface/border. Each is used as a thin line, glyph, or text color — never as a fill covering more than a small control.

| Token | Value | Meaning | Primary usage |
|---|---|---|---|
| `--color-accent-ki` | `#00FFC3` | Primary / "the ki energy" | Primary CTA, active states, circuitry motion, default accent |
| `--color-accent-sky` | `#5BA6FF` | Info / systems | Secondary beams, info states, Cloud/Citadel districts |
| `--color-accent-mind` | `#A371F7` | Knowledge | Hall of Knowledge, note-related UI — used sparingly, never as a "fun" purple |
| `--color-accent-ember` | `#F0983E` | Locked / attention / CTA-secondary | Locked chambers, Mission Brief CTA, warnings (never destructive-red) |

`--color-accent-active` defaults to `--color-accent-ki` and is the single override point for `ThemeProvider`'s `accentOverride` prop (already wired in the Dojo Gate/World Bible prototypes).

### 1.3 Semantic role tokens (what components actually bind to)

Components never reference `--color-ki` etc. directly for structural roles — they bind to a role token, which resolves to a base/accent value. This indirection is what lets `accentOverride` work app-wide.

| Semantic token | Resolves to | Purpose |
|---|---|---|
| `--surface-bg` | `--color-void-800` | Page/app background |
| `--surface-panel` | `--color-surface-700` | Cards, drawers, dialogue strips |
| `--surface-panel-hover` | `--color-surface-600` | Hover/active elevation |
| `--surface-overlay` | `--color-surface-500` | Modal/drawer topmost layer |
| `--border-default` | `--color-border-500` | Default 1px rules |
| `--border-emphasis` | `--color-border-400` | Focus-adjacent structural borders |
| `--text-primary` | `--color-ink-100` | Headlines, primary body |
| `--text-secondary` | `--color-ink-300` | Body copy |
| `--text-tertiary` | `--color-ink-500` | Descriptions, captions |
| `--text-muted` | `--color-ink-700` | Labels, metadata, timestamps |
| `--text-disabled` | `--color-ink-800` | Disabled controls |
| `--accent-primary` | `--color-accent-active` (default ki) | Primary CTA, focus ring, active nav item |
| `--accent-info` | `--color-accent-sky` | Informational highlights |
| `--accent-knowledge` | `--color-accent-mind` | Knowledge-domain highlights |
| `--accent-locked` | `--color-accent-ember` | Locked-state and secondary-CTA emphasis |
| `--status-success` | `--color-accent-ki` | Non-destructive confirmations (no separate green — ki fills this role) |
| `--status-warning` | `--color-accent-ember` | Warnings |
| `--status-danger` | `#E5484D` (new, used only for destructive/system errors — never for game content) | Irrecoverable errors only (e.g. `AppShell` fetch failure) |

Example: `ArtifactDrawer`'s border binds to `var(--border-emphasis)`, not `#232C35` — so a future theme pass changes one variable, not every component.

---

## 2. Typography

### 2.1 Font pairing

- **Display &amp; body:** Exo 2 — geometric, quietly futuristic, highly legible at small sizes. Weights used: 200 (hero display only), 300 (body/headline default), 500 (emphasis), 600 (strong emphasis/labels).
- **System &amp; data:** JetBrains Mono — all UI labels, stats, terminal/status/dialogue text, timestamps. Weights used: 400 (default), 500 (emphasis), 700 (rare, e.g. key badges).

Rationale: a serif or humanist sans would contradict the "developer tooling" direction; JetBrains Mono for anything system-voiced keeps the Oracle/guardians/terminal reading as *machine-precise*, while Exo 2 keeps headlines calm rather than alarmist.

### 2.2 Type scale tokens

| Token | Size / line-height | Weight token | Usage |
|---|---|---|---|
| `--type-display-xl` | 64px / 1.05 | `--weight-display-hero` (200) | Gate/hero wordmark only |
| `--type-display-lg` | 40px / 1.15 | `--weight-display-strong` (600) | Section/district headline |
| `--type-display-md` | 28px / 1.2 | `--weight-body-medium` (500) | Card titles, drawer headings |
| `--type-body-lg` | 17–18px / 1.6 | `--weight-body-default` (300) | Lead paragraphs |
| `--type-body-md` | 14–15px / 1.6 | `--weight-body-default` (300) | Default body copy |
| `--type-body-sm` | 13px / 1.55 | `--weight-body-default` (300) | Captions, card descriptions |
| `--type-mono-lg` | 16–20px / 1.3 | `--weight-mono-default` (400) | Terminal input, large stat readouts |
| `--type-mono-md` | 13px / 1.4 | `--weight-mono-default` (400) | Status bar, labels, badges |
| `--type-mono-sm` | 10–11px / 1.4 | `--weight-mono-default` (400) | Eyebrows, micro-labels, timestamps |

Minimum: no interactive text below `--type-mono-sm` (10px) and no body reading content below `--type-body-sm` (13px), matching accessibility-first direction. `text-wrap: pretty` applied to all `--type-body-*` and `--type-display-*` blocks.

---

## 3. Spacing System

8px base unit, exposed as a numeric scale — every margin/padding/gap in the app is one of these tokens.

| Token | Value | Typical use |
|---|---|---|
| `--space-1` | 4px | Icon-to-label gap, tight badge padding |
| `--space-2` | 8px | Compact stacks, badge internal padding |
| `--space-3` | 12px | Card internal padding (compact variant) |
| `--space-4` | 16px | Default gap between related controls |
| `--space-5` | 20px | Card internal padding (full variant) |
| `--space-6` | 24px | Section internal padding |
| `--space-8` | 32px | Gap between cards in a grid |
| `--space-10` | 40px | Section-to-section spacing (small) |
| `--space-14` | 56px | `StatusBar` height |
| `--space-18` | 72px | `NavigationRail`/action-band height, section spacing (large) |
| `--space-24` | 96px | Page-level top/bottom padding on document-style views (Mission Brief) |

Rule: all sibling-group layout (buttons, chips, cards, nav items) uses `display:flex/grid` + `gap` bound to a `--space-*` token, never inline margins — this matches the anti-margin-drift rule already governing the codebase.

---

## 4. Radius &amp; Border Weight

- `--radius-none`: `0px` — **default everywhere.** Sharp corners are law (World Bible §06).
- `--radius-sm`: `2px` — reserved for one case only: small status chips/dots where a hard square reads as a rendering artifact rather than intentional (e.g. lantern light cell). Use sparingly; default remains 0.
- `--radius-pill`: `999px` — reserved for `SkillBadge`'s level-dot row only, never for buttons/cards.
- `--border-width-hairline`: `1px` — default border weight everywhere.
- `--border-width-emphasis`: `2px` — focus rings, active-state left borders (e.g. Oracle card's left accent rule), circuit seam lines.
- `--border-style-locked`: `dashed` — used only to mark a locked/airborne/future state (Floating Citadel, locked chambers), never decoratively.

---

## 5. Shadow &amp; Glow System

No drop-shadows in the traditional sense — elevation is communicated by surface token + border, not shadow. The only shadow-family tokens are **glow**, used to represent circuit energy, and are capped low to avoid the "neon flood" anti-pattern.

| Token | Value | Usage | Max alpha rule |
|---|---|---|---|
| `--glow-ki-sm` | `0 0 12px 2px rgba(0,255,195,0.18)` | Small emitters: lanterns, status dot, focus ring | ≤0.20 |
| `--glow-ki-md` | `0 0 24px rgba(0,255,195,0.10)` | Button/card ambient glow on hover | ≤0.12 |
| `--glow-ki-lg` | `0 0 40px 8px rgba(0,255,195,0.06)` | Large ambient area glow (gate, oracle field) | ≤0.08 |
| `--glow-accent` | same shape, accent color substituted | Non-ki accents (sky/mind/ember) reuse this shape with their own color | ≤0.12 |
| `--shadow-elevation-1` | `0 6px 20px rgba(0,0,0,0.5)` | Structural depth only (e.g. gate crossbeam), color-neutral, never used for "lift" on cards | — |

Rule from Visual Law: glow ≤0.08 alpha for ambient/passive states; ≤0.20 only for small, intentional emitters (lantern, dot) or momentary feedback (button hover). Never stack more than two glow tokens on one element.

---

## 6. Icon Sizing

No icon font/library — icons are drawn as thin-stroke inline SVG or simple CSS shapes (per "avoid drawing imagery using SVG" guidance, icons are the narrow exception: functional glyphs, not illustrations).

| Token | Value | Usage |
|---|---|---|
| `--icon-xs` | 12px | Inline with `--type-mono-sm` labels |
| `--icon-sm` | 16px | Inline with body text, badges |
| `--icon-md` | 20px | Buttons, `NavigationRail` items |
| `--icon-lg` | 28px | `FloatingActionButtons`, empty states |
| `--icon-stroke-width` | 1.5px | Constant across all sizes — thin-line, never filled/bold icons |

---

## 7. Grid &amp; Layout System

- `--grid-max-width`: `1080px` — document-style views (World Bible-derived docs, Mission Brief content column).
- `--grid-columns-canvas`: the spatial `WorldCanvas` is not column-based — district positions come from `world.districts[].position` (percentage coordinates), not a CSS grid.
- `--grid-columns-cards`: `repeat(auto-fill, minmax(260px, 1fr))` — used by all Card-family grids (district artifact lists, Mission Brief sections).
- `--grid-gap`: bound to `--space-8` (32px) as default card-grid gap, `--space-4` (16px) for dense/compact variants.

## 8. Responsive Breakpoints

| Token | Value | Corresponds to |
|---|---|---|
| `--bp-mobile-max` | `639px` | Mobile — stacked `DistrictCard` list, bottom tab bar, full-screen overlays |
| `--bp-tablet-min` | `640px` | Tablet lower bound |
| `--bp-tablet-max` | `1023px` | Tablet — camera-pan retained, sheets instead of side drawers |
| `--bp-desktop-min` | `1024px` | Desktop — full spatial canvas, side rail, docked overlays |

Matches Frontend Architecture §08 exactly; do not introduce additional breakpoints without updating that document.

---

## 9. Opacity Tokens

| Token | Value | Usage |
|---|---|---|
| `--opacity-disabled` | `0.4` | Disabled controls, locked card content |
| `--opacity-muted` | `0.65` | Sealed/future content (Form V card), secondary imagery |
| `--opacity-hover-tint` | `0.04` | Background tint on hover (e.g. button hover fill) |
| `--opacity-scrim` | `0.6` | Modal/drawer backdrop |
| `--opacity-ambient-min` / `--opacity-ambient-max` | `0.15` / `0.9` | Range for twinkle/breathe ambient loops |

## 10. Z-Index Layers

A single authoritative stack — no component invents its own z-index.

| Token | Value | Layer |
|---|---|---|
| `--z-canvas` | `0` | `WorldCanvas` base layer |
| `--z-canvas-ui` | `10` | `FloatingActionButtons`, in-scene hotspots |
| `--z-chrome` | `100` | `StatusBar`, `NavigationRail` |
| `--z-drawer` | `200` | `ArtifactDrawer` |
| `--z-docked-overlay` | `300` | `OracleOverlay`, `TerminalOverlay` (docked variants) |
| `--z-modal` | `400` | `Modal`, `SearchOverlay` |
| `--z-toast` | `500` | `NotificationToast` |
| `--z-tooltip` | `600` | `Tooltip`, `ContextMenu` (topmost — must never be occluded) |

## 11. Animation Duration &amp; Easing Tokens

Full behavioral spec lives in Motion Specification.md; the tokens themselves are defined here since they're part of the theme surface.

| Token | Value | Tier |
|---|---|---|
| `--duration-feedback` | `200ms` | Hover/press/focus feedback |
| `--duration-transition` | `700ms` | Camera/IA-level transitions |
| `--duration-overlay` | `300ms` | Drawer/modal/panel open-close |
| `--duration-ambient-fast` | `4500ms` | Fast ambient loops (orb pulse) |
| `--duration-ambient-slow` | `9000ms` | Slow ambient loops (moon breathe, gate glow) |
| `--easing-standard` | `cubic-bezier(0.16, 1, 0.3, 1)` | Ease-out, default for transitions and feedback |
| `--easing-ambient` | `ease-in-out` | Ambient loops only |
| `--easing-linear` | `linear` | Continuous loops (grid scroll, beam flow) where a "breath" would look wrong |

---

## Cross-references

- Color/type/motion rationale traces back to World Bible §06 (Visual Law) — this document is the literal token expansion of that section.
- Component-level usage of these tokens is specified per-component in Component Specification.md; this document does not repeat which component uses which token beyond the illustrative examples above.
- Full animation behavior (trigger, ownership, interruptibility) is in Motion Specification.md — durations/easings here are the shared constants both documents draw from.
