# CHECKPOINT — Preparation Map

> Resume file. If context is lost, read this first, then `BUILD.md`.
> Last updated: **all six stages complete.**
> 25 domains · **308 topics** · `check.mjs` clean · all 669 external links verified.

---

## HOW TO RUN

```
node serve.js 4173          # or double-click start.bat
```
Then open <http://localhost:4173>.

ES modules cannot load over `file://`, so the app must be served. `serve.js` is a
~70-line zero-dependency Node static server. **No CDN, no framework, no build step,
no deployment.**

### Verification commands

```
node lint-content.mjs   # imports every JS module — the authoritative syntax gate
node check.mjs          # content integrity: coverage, dangling refs, link/tool checks
node linkcheck.mjs      # HEAD-checks every external URL (one per host by default,
                        #   --all for all 669). Takes ~40s and needs network.
```

⚠ **Do not use `node --check` as the syntax gate.** It parses ambiguous files as
CommonJS and silently accepted a real ES-module syntax error in `about.js`.
`lint-content.mjs` does a genuine `import()` of every module behind a small DOM
shim. This was verified by deliberately breaking a file and confirming it fails.

---

## CURRENT STAGE

| Stage | Scope | State |
|---|---|---|
| 1 | Shell, design system, router, store, progress | ✅ done |
| 2 | The Preparation Map (centrepiece) | ✅ done |
| 3 | Topic panel, 13-section card, Quick/Deep modes | ✅ done |
| 4 | **Topic content corpus (25 domains)** | ✅ **25 of 25 · 308 topics** |
| 5 | Dashboard, Dependency Map, Tools, Comparisons, Practice, About | ✅ done |
| 6 | Responsive pass, a11y, light theme, link audit, final QA against §52 | ✅ done |

Stage 5 was pulled forward deliberately: a fully working app with partial content is
more useful (and safer to hand over) than complete content with half-built views.

---
## WHAT IS BUILT

### Architecture
- Vanilla HTML + CSS + **ES modules**. No framework, no dependencies, no build.
- Views are **lazily imported** and mounted once (`app/js/main.js` `LOADERS`), with a
  shared in-flight promise so a view can never mount twice.
- Hash router: `#/<view>?topic=<id>`. The topic id is a **query param, not a route**,
  so the map is never unmounted when a topic opens (BUILD.md §0).
- All state in `localStorage` under `prep-map:v1`.

### The map — `app/js/views/map.js`
- Single SVG, pan/zoom camera, **deterministic layout** (curated hub coordinates ×
  `LAYOUT_SCALE`, golden-angle spiral, fixed relaxation passes). Identical every session.
- Three zoom-gated detail levels: `far` → `mid` → `near`. Fit lands in `mid`.
- Selecting a topic lights the prerequisite chain in, the unlocked chain out, dims the rest.
- HUD: track/status filters, live stats, compact legend, minimap, camera controls,
  "YOU ARE HERE" trail (§39). `fit()` insets for the HUD so hubs never open hidden.
- Hover card: description, status, prerequisites, next concepts (§31).

### Topic panel — `app/js/views/topic-panel.js`
- Full 13-section card (§29) plus key terms, interview layer and notes — 16 sections.
- **Quick Revision** filters to 6 sections (§35). Verified 16 → 6.
- Visual connection ladder, status picker, pin, locate-on-map, prev/next in domain.

### Views (all built and screenshotted)
| View | File | What it does |
|---|---|---|
| Dashboard | `views/dashboard.js` | Hero ring, status bar, 28-day activity strip, progress by track and domain, recent / revision / learning / recommended / pinned / high-priority cards (§50) |
| Dependency Map | `views/graph.js` | Layered DAG by longest prerequisite chain, barycentre ordering, lane bands, left gutter, track filter, zoom-to-fit, chain highlighting (§49) |
| Tools | `views/tools.js` | 34 tools grouped by function, group + hosting filters, six questions each, deep doc links, "appears in" topic links (§26) |
| Comparisons | `views/compare.js` | 12 comparisons, side-by-side axis table, ASCII diagram, verdict, related topics (§48) |
| Practice | `views/practice.js` | Scope picker, reveal-then-grade flow, keyboard 1/2/3, **grading writes back to topic status**, score screen (§37) |
| About | `views/about.js` | Stats, how-to-use, keyboard reference, architecture notes |
| Search | `views/search.js` | Ctrl+K palette over topics, tools, domains, comparisons |
| Settings | `components/settings.js` | Theme, mode, export/import/reset, shortcuts |

### Data — `app/data/`
`tracks.js` (10) · `domains.js` (25, curated coordinates) · `topics.js` (aggregator +
normaliser + `validate()`) · `graph.js` (nodes, edges, arteries, adjacency, depth,
`BOUNDS`, `trailTo`, `ancestorsOf`, `descendantsOf`) · `tools.js` (34) ·
`comparisons.js` (12) · `topics/<domain>.js` (one module per domain).

---

## CONTENT PROGRESS — 308 topics, 25 of 25 domains ✅

All domains written. `node check.mjs` reports **all checks passed**.

| Domain | n | Domain | n | Domain | n |
|---|---|---|---|---|---|
| programming | 20 | data-sql | 18 | analytics | 14 |
| ml-fundamentals | 17 | llm | 19 | prompting | 15 |
| embeddings | 13 | rag | 17 | local-rag | 6 |
| open-source | 12 | quantization | 8 | agents | 10 |
| mcp | 5 | finetuning | 7 | evaluation | 19 |
| observability | 9 | responsible-ai | 12 | mlops | 8 |
| **product** | **21** | **systems-thinking** | **8** | **ai-pm** | **15** |
| **strategy** | **12** | **economics** | **14** | **tools** | **5** |
| **interview** | **4** | | | | |

**Corpus totals:** 333 graph nodes (25 hubs + 308 topics) · 1,382 edges · 157 arteries ·
32 dependency layers · 12 comparisons · **1,104 external resources** ·
**930 practice questions** · **2,046 key terms**.

### File layout note

Large domains are split so no single content module becomes unreadable. Each domain
still has **one entry point** that `topics.js` imports:

```
product.js    → product-discovery / -planning / -roadmap / -delivery / -agile / -outcomes
ai-pm.js      → ai-pm-foundation / -experience / -operations / -runtime / -rollout
strategy.js   → strategy-market / -moats / -economics / -growth
economics.js  → economics-core / -behaviour / -information / -finance / -macro
```

`topics.js` imports only the entry points; never add a split file to `topics.js` directly.

---
## TESTS PERFORMED (live in Chrome — not assumed)

| Test | Result |
|---|---|
| App boots, no console errors (only MetaMask extension warnings) | ✅ |
| Map: 25 hubs + 308 topics + 1,382 edges render | ✅ DOM-verified |
| Every domain hub shows a populated cluster | ✅ screenshotted |
| Fit framing centred and clear of the HUD | ✅ after 3 fixes |
| Click / **keyboard Enter** on a node → panel opens, URL updates | ✅ both |
| All 16 card sections render (ASCII, code, ladder, resources, questions) | ✅ |
| Quick Revision filters sections | ✅ 16 → 6 |
| Interview layer on 165 topics incl. all 163 high-priority | ✅ 5 spot-checked |
| **"Compare with" pills** → deep-link into the Comparisons view | ✅ `#/compare?c=…` |
| Status change → node recolours + HUD stats update | ✅ |
| State persists to localStorage | ✅ status, mode, recent, streak, camera |
| Search across new content (contribution margin, abstention, NPV, Goodhart) | ✅ 5 queries |
| Dashboard renders, 308 topics, progress bars per track | ✅ screenshotted |
| Dependency map: 308 nodes, 32 layers, zoom-to-fit 26% | ✅ screenshotted |
| Tools / Comparisons / About views mount cleanly | ✅ DOM-verified |
| Practice: 930-question pool, session of 25, reveal + grade | ✅ screenshotted |
| **Light theme** — every surface flips, contrast holds | ✅ screenshotted |
| **Responsive @ 596px** — rail → bottom bar, panel full-width, no x-overflow | ✅ iframe-probed |
| **A11y** — 321 buttons all named, 333 focusable nodes, `lang`, live region | ✅ scripted audit |
| **External links: all 669 URLs HEAD-checked** | ✅ 36 broken found and fixed |
| Dependency map at fit zoom is readable (lane numbers, no label mush) | ✅ screenshotted |
| §52 sweep: filtering, persistence, quick-vs-deep, no blank views | ✅ scripted |
| `start.bat`: Node-missing, port-already-in-use, and normal paths | ✅ exit codes verified |
| `file://` fallback screen: stops the spinner, names the fix | ✅ screenshotted |
| Module gate catches a deliberately broken file | ✅ both directions |

### Bugs found and fixed
1. **Views mounted twice** (90 nodes instead of 45) — router emit raced the explicit boot
   call. Fixed with a shared in-flight promise map.
2. **Boot screen never cleared** — `requestAnimationFrame` is suspended in a backgrounded
   tab. Replaced with `setTimeout`.
3. **Map fit used fallback dimensions** — views mounted while `#app` was `display:none`,
   so `clientWidth` was 0. Shell is now revealed before views mount, plus a
   `ResizeObserver` re-fits until the user touches the camera.
4. **Hardcoded world bounds wasted ~40% of the canvas** — `BOUNDS` now computed from
   actual node extents.
5. **Node clicks did nothing** — `setPointerCapture` on pointerdown retargeted the click
   to the root. Capture is now taken only once a drag starts; selection happens on
   pointerup against the remembered node.
6. **Topic panel header hidden under the topbar** — panel was `top:0` beneath a
   higher-z-index topbar. Now `top: var(--topbar-h)`.
7. **"You are here" trail overlapped the legend** — repositioned; legend made horizontal.
8. **Dense clusters overlapped** — added `LAYOUT_SCALE`, tightened the spiral, reduced
   relaxation min-distance.
9. **HUD covered hubs at fit zoom** — `fit()` insets by measured HUD heights.
10. **Dashboard quick-link icons rendered full-size** — SVGs have no intrinsic dimensions.
11. **Dependency-map lane labels collided with nodes** — added a 104px left gutter.
12. **`about.js` failed to load** — over-escaped apostrophe inside a template literal.
    **`node --check` did not catch it**; the gate was rewritten to use real `import()`.
13. **Python f-strings breaking content modules** — `${...}` inside JS template literals.
    Must be `\${...}`. Caught by `lint-content.mjs`.
14. **Hub labels overlapped their sublabels at low zoom** — label `y` offsets were fixed
    in world units while the font counter-scales, so at 38% zoom a 13.5px label occupied
    ~35 world units against a 15-unit gap. Labels now anchor at the node edge and are
    pushed down by `translateY(calc(21px / var(--k)))`, a constant *screen* distance.
15. **Comparison references in `related` were silently dropped** — `resolve()` only maps
    topic ids, so 21 links rendered as nothing. The panel now has a **"Compare with"**
    group, `validate()` accepts comparison ids in `related`, and the pill deep-links to
    `#/compare?c=<id>`.
16. **Backtick inside a template literal** (`` `active_user` `` in prose) terminated the
    string early — same class as hazard 13. Use double quotes in prose.
17. **36 of 682 external links were dead** (5.3%) — found by adding `linkcheck.mjs`, which
    HEAD-checks every URL in the corpus. Each replacement was verified before being applied.
    Three remaining 403s (openai.com, arize.com, iso.org) were opened in a real browser and
    confirmed to be working pages that block scripted requests; the ISO one was moved to its
    canonical redirect target. §40 asks for deep links, and deep links rot — this now has a gate.
18. **Dependency map was unreadable at fit zoom** — the stage is CSS-scaled, so 10.5px node
    labels rendered at ~3px: illegible, and dense enough to hide the shape of the graph. Added
    zoom-gated detail (`data-dep-detail`, threshold 0.55): below it node labels are dropped
    (names stay on hover via each node's `<title>`) and lane labels counter-scale to a constant
    screen size, shortened to just the layer number so they still fit the 104px gutter.

---
## KNOWN PROBLEMS

- **Interview layer: 165 of 308 topics, and all 163 high-priority topics.** Field
  coverage is `s30` 165 / `s90` 165 / `pm` 154 / `technical` 96 / `example` 3 — the
  `example` field is mostly folded into `s90`, where a concrete case reads better than a
  detached one. The 145 uncovered topics are all medium or low priority. §28 says the
  layer is optional per topic, so this is deliberate rather than outstanding, but the
  medium-priority tier is the obvious place to continue.
- **Responsive was verified by iframe probe, not by a real narrow viewport.** The Chrome
  window in this environment is maximised and `resize_window` could not reduce
  `innerWidth` below 1920. An iframe at 596px exercises the same media queries and
  confirmed the layout, but a real device has not been tested.
- The dependency map at fit zoom (26%) renders node labels too small to read. That is
  intended as an overview — zoom in for detail — but a hover affordance at low zoom
  would be better.
- No automated regression test for the views; verification is manual plus `check.mjs`.

---

## NEXT EXACT ACTION

Stage 6 is functionally complete. What remains is optional depth:

1. **Extend the interview layer into the medium-priority tier** (145 topics), same method:
   ```js
   // in app/data/interview/*.js, keyed by topic id
   { s30, s90, technical, pm, example }
   ```
   `check.mjs` verifies every key resolves to a real topic. Inline `interview:` on a topic
   still wins per key. ⚠ Every `s90` must carry a specific number or a named consequence
   from that topic's own body — that is what stops it sounding memorised (§28), and it is
   the rule the `interview` domain itself describes.
2. **Re-run `node linkcheck.mjs --all` periodically.** Deep links rot; 5.3% of the corpus
   was already dead at first check. Three known 403s (openai.com, arize.com, iso.org) are
   bot-blocks on working pages, verified in a browser — treat those as expected noise.
3. **Real narrow-viewport testing.** The responsive layout was verified through a 596px
   iframe, which exercises the same media queries, but not on a device.

After any change: `node lint-content.mjs && node check.mjs`, reload, spot-check in Chrome,
update this file.

---

## AUTHORING CONTRACT

```js
{
  id, title, domain, tier: 1|2|3, priority: 'high'|'medium'|'low',
  summary,                        // one line — hover card + search
  what, why, analogy, technical,  // §29 sections 1–4
  diagram: `ASCII`,               // §41 — use heavily
  example: { language, caption, code } | 'prose',
  prereq: [], next: [], related: [],   // `related` may also name a comparison id
  tools: [ids from data/tools.js],
  useCases: [], avoid: [], mistakes: [],
  keyTerms:  [ [term, definition], ... ],       // ≥4
  resources: [ [label, url, kind], ... ],       // ≥2, docs first, DEEP links
  questions: [ [q, a], ... ],                   // ≥3
  interview: { s30, s90, technical, pm, example }
}
```

**Authoring hazards — all three break the module and all three are caught only by
`lint-content.mjs`:**
- Python f-strings: write `\${cost:.2f}`, never `${cost:.2f}`.
- Apostrophes in single-quoted strings: write `it\'s` — **not** `it\'s`.
- **Backticks anywhere inside a template literal**, including in prose. Use double quotes.

**Rules:** official documentation first and **deep-linked, not homepages** (§40); every
named concept in BUILD.md appears as a topic or a `keyTerms` entry so search finds it
(§46); no day-by-day structure anywhere (§51).

---
## IMPORTANT DESIGN DECISIONS

1. **Deterministic map layout, not force-directed.** The map must look identical every
   visit — it is meant to become a place you remember.
2. **Topic as query param, not route.** Guarantees the map is never torn down.
3. **Two-tier content coverage.** ~290 first-class topic cards plus `keyTerms` glossary
   entries, so every one of BUILD.md's ~450 named concepts is searchable.
4. **Status vocabulary.** §29 (🟢/🟡/🔴) and §38 (5 states) conflict; §38 is canonical.
5. **Zoom-gated detail.** Progressive disclosure rather than hiding data.
6. **Labels counter-scale** (`calc(11px / var(--k))`) so they stay legible at any zoom.
7. **System fonts only.** §43 forbids CDN dependencies.
8. **Node server over `file://`.** The alternative was abandoning ES modules for ~40
   global `<script>` tags, failing §44's modularity requirement.
9. **Track colour = identity.** Each of the 10 tracks owns a hue used consistently on the
   map, panel, chips and charts — colour is information, not decoration.
10. **Practice writes back to status.** Grading yourself moves the topic on the map, so
    self-testing feeds the same state everything else reads. A miss always returns a topic
    to "review"; a single good answer never jumps straight to "mastered".
11. **Dependency Map is deliberately different from the Preparation Map.** The map shows
    the *landscape*; the dependency view shows the *order*.
12. **Domains larger than ~10 topics are split across files** behind a single entry point.
    `product.js`, `ai-pm.js`, `strategy.js` and `economics.js` are aggregators only —
    `topics.js` imports the entry point, never a split file.
13. **`related` may name a comparison, not just a topic.** The topic panel renders those
    in a separate "Compare with" group that deep-links into `#/compare?c=<id>`, so the
    cross-concept comparisons in §48 are reachable from the concepts they compare.
14. **Counter-scaled label offsets, not just counter-scaled fonts.** A label anchored at
    the node edge is pushed down by `translateY(calc(21px / var(--k)))`, so the gap
    between a hub label and its sublabel is a constant number of *screen* pixels at every
    zoom level. Fixing only the font size leaves them overlapping when zoomed out.
15. **The interview layer is a layer, not a topic field.** §28 frames "how to explain this
    out loud" as something laid over the corpus, so it lives in `app/data/interview/*.js`
    keyed by topic id and is merged in `normalise()`. A topic may still declare
    `interview:` inline and inline keys win per key. This keeps one voice across 165
    answers without touching 25 content modules, and `check.mjs` verifies every layer key
    resolves to a real topic so a typo cannot silently attach an answer to nothing.
