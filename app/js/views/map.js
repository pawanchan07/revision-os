/**
 * THE PREPARATION MAP — the visual centrepiece.
 *
 * An SVG atlas with a pan/zoom camera and three levels of detail:
 *   far  : domain hubs + the arteries between them (the shape of the whole map)
 *   mid  : topic nodes appear as a constellation around each hub
 *   near : topic labels and individual prerequisite edges become readable
 *
 * Selecting a topic lights its prerequisite chain (incoming) and everything it
 * unlocks (outgoing), and dims the rest — so relationships are *seen*, not read.
 */
import { $, el, svg, clamp, hash01, debounce } from '../core/util.js';
import { icon } from '../components/icons.js';
import * as store from '../core/store.js';
import * as router from '../core/router.js';
import { on } from '../core/events.js';
import { GRAPH, BOUNDS, hubFor, trailTo } from '../../data/graph.js';
import { DOMAIN_BY_ID } from '../../data/domains.js';
import { TRACKS, TRACK_BY_ID } from '../../data/tracks.js';
import { TOPIC_BY_ID } from '../../data/topics.js';
import { STATUS_META } from '../core/store.js';
import { domainStats, overall } from '../core/progress.js';

const MIN_K = 0.18;
const MAX_K = 3.4;
// Detail thresholds: the fitted view deliberately lands inside "mid", so the
// first thing you see is the full constellation, not just 25 bare hubs.
const DETAIL_MID = 0.26;
const DETAIL_NEAR = 0.72;

let root, svgEl, viewport, tipEl, hudZoom, minimapView, trailEl;
let cam = { x: 0, y: 0, k: 0.5 };
let nodeEls = new Map();      // id -> <g>
let edgeEls = new Map();      // edge id -> <path>
let arteryEls = new Map();
let haloEls = new Map();
let mounted = false;
let hoveredId = null;
let hasUserCamera = false;    // true once the user pans/zooms, or a camera is restored
let fittedAt = null;          // container size the current auto-fit was computed for

/* ============================================================
   MOUNT
   ============================================================ */

export function mount(host) {
  root = el('div.map-root', { id: 'map-root' });
  host.appendChild(root);

  svgEl = svg('svg', { class: 'map-svg', xmlns: 'http://www.w3.org/2000/svg' });
  svgEl.appendChild(buildDefs());
  svgEl.appendChild(buildBackdrop());

  viewport = svg('g', { class: 'viewport' });
  const layers = {
    halos:    svg('g', { class: 'layer-halos' }),
    arteries: svg('g', { class: 'layer-arteries' }),
    edges:    svg('g', { class: 'layer-edges' }),
    hubs:     svg('g', { class: 'layer-hubs' }),
    topics:   svg('g', { class: 'layer-topics' })
  };
  for (const g of Object.values(layers)) viewport.appendChild(g);
  svgEl.appendChild(viewport);
  root.appendChild(svgEl);

  drawHalos(layers.halos);
  drawArteries(layers.arteries);
  drawEdges(layers.edges);
  drawHubs(layers.hubs);
  drawTopics(layers.topics);

  root.appendChild(buildHud());
  tipEl = el('div.map-tip');
  root.appendChild(tipEl);

  installCamera();
  installInteractions();

  const saved = store.get().mapView;
  if (saved && Number.isFinite(saved.k)) { cam = { ...saved }; hasUserCamera = true; }
  else fit(false);
  applyCamera();

  // Until the camera has been touched, keep the map framed as the container
  // resizes (including the very first layout pass, when width may still be 0).
  const ro = new ResizeObserver(() => {
    const w = root.clientWidth, h = root.clientHeight;
    if (!w || !h) return;
    if (!hasUserCamera && (!fittedAt || fittedAt.w !== w || fittedAt.h !== h)) {
      fittedAt = { w, h };
      fit(false);
    }
    updateMinimap();
  });
  ro.observe(root);

  on('status:change', ({ id }) => { refreshNode(id); refreshHubs(); refreshStats(); });
  on('progress:change', () => { refreshAllNodes(); refreshHubs(); refreshStats(); });
  on('filters:change', applyFilters);
  on('route:topic', ({ topic }) => highlight(topic));

  window.addEventListener('resize', debounce(() => { applyCamera(); }, 120));

  mounted = true;
  applyFilters();
  highlight(router.route().topic);
}

export function activate() {
  if (mounted) setTimeout(applyCamera, 0);
}

/* ============================================================
   STATIC SVG PIECES
   ============================================================ */

function buildDefs() {
  const defs = svg('defs');
  defs.innerHTML = `
    <pattern id="mapGrid" width="88" height="88" patternUnits="userSpaceOnUse">
      <path d="M88 0H0v88" fill="none" stroke="var(--grid-line)" stroke-width="1"/>
    </pattern>
    <radialGradient id="hubGlow">
      <stop offset="0%"  stop-color="currentColor" stop-opacity="0.30"/>
      <stop offset="70%" stop-color="currentColor" stop-opacity="0.05"/>
      <stop offset="100%" stop-color="currentColor" stop-opacity="0"/>
    </radialGradient>`;
  return defs;
}

/** A deterministic starfield: same sky every time you open the map. */
function buildBackdrop() {
  const g = svg('g', { class: 'map-grid' });
  g.appendChild(svg('rect', { x: '-4000', y: '-4000', width: '12000', height: '12000', fill: 'url(#mapGrid)' }));
  const stars = svg('g', { class: 'map-stars' });
  for (let i = 0; i < 220; i++) {
    const seed = `star${i}`;
    stars.appendChild(svg('circle', {
      cx: (hash01(seed, 1) * BOUNDS.width * 1.3 + BOUNDS.minX - BOUNDS.width * 0.15).toFixed(1),
      cy: (hash01(seed, 2) * BOUNDS.height * 1.3 + BOUNDS.minY - BOUNDS.height * 0.15).toFixed(1),
      r: (0.6 + hash01(seed, 3) * 1.5).toFixed(2),
      opacity: (0.15 + hash01(seed, 4) * 0.6).toFixed(2)
    }));
  }
  g.appendChild(stars);
  // Stars and grid live inside the viewport transform so they parallax naturally.
  return g;
}

function drawHalos(layer) {
  for (const hub of GRAPH.hubNodes) {
    const c = svg('ellipse', {
      class: 'halo',
      cx: hub.x, cy: hub.y,
      rx: hub.clusterR, ry: hub.clusterR * 0.9,
      'data-track': hub.track,
      'data-domain': hub.domain
    });
    haloEls.set(hub.domain, c);
    layer.appendChild(c);
  }
}

/** Curved link between two points, bowed perpendicular to the run. */
function curve(x1, y1, x2, y2, bow = 0.16) {
  const mx = (x1 + x2) / 2;
  const my = (y1 + y2) / 2;
  const dx = x2 - x1, dy = y2 - y1;
  const len = Math.hypot(dx, dy) || 1;
  const cx = mx - (dy / len) * len * bow;
  const cy = my + (dx / len) * len * bow;
  return `M${x1.toFixed(1)},${y1.toFixed(1)} Q${cx.toFixed(1)},${cy.toFixed(1)} ${x2.toFixed(1)},${y2.toFixed(1)}`;
}

function drawArteries(layer) {
  for (const a of GRAPH.arteries) {
    const from = hubFor(a.from), to = hubFor(a.to);
    if (!from || !to) continue;
    const p = svg('path', {
      class: 'artery',
      d: curve(from.x, from.y, to.x, to.y, 0.1),
      'stroke-width': clamp(0.8 + a.weight * 0.35, 1, 4.5),
      opacity: clamp(0.3 + a.weight * 0.06, 0.3, 0.85),
      'data-from': a.from, 'data-to': a.to
    });
    arteryEls.set(a.id, p);
    layer.appendChild(p);
  }
}

function drawEdges(layer) {
  for (const e of GRAPH.edges) {
    const a = GRAPH.nodeById[e.from], b = GRAPH.nodeById[e.to];
    if (!a || !b) continue;
    const sameDomain = a.domain === b.domain;
    const p = svg('path', {
      class: `edge ${e.type === 'related' ? 'is-related' : ''}`,
      d: curve(a.x, a.y, b.x, b.y, sameDomain ? 0.2 : 0.09),
      'data-from': e.from, 'data-to': e.to, 'data-type': e.type
    });
    edgeEls.set(e.id, p);
    layer.appendChild(p);
  }
}

function hubArc(hub, percent) {
  const r = hub.r + 7;
  const c = 2 * Math.PI * r;
  return { r, c, offset: c * (1 - percent / 100) };
}

function drawHubs(layer) {
  for (const hub of GRAPH.hubNodes) {
    const stats = domainStats(hub.domain);
    const { r, c, offset } = hubArc(hub, stats.percent);
    const g = svg('g', {
      class: 'node node-hub',
      'data-track': hub.track,
      'data-id': hub.id,
      'data-domain': hub.domain,
      transform: `translate(${hub.x},${hub.y})`,
      tabindex: '0',
      role: 'button',
      'aria-label': `${hub.title} domain, ${stats.total} topics, ${stats.percent}% complete`
    });
    g.appendChild(svg('circle', { class: 'h-glow', r: hub.r * 2.6 }));
    g.appendChild(svg('circle', { class: 'h-arc-track', r, transform: 'rotate(-90)' }));
    g.appendChild(svg('circle', {
      class: 'h-arc', r, transform: 'rotate(-90)',
      'stroke-dasharray': c.toFixed(1), 'stroke-dashoffset': offset.toFixed(1)
    }));
    g.appendChild(svg('circle', { class: 'h-disc', r: hub.r }));
    g.appendChild(svg('text', {
      class: 'h-mark', 'text-anchor': 'middle', y: 5,
      style: 'font-size:15px;font-family:var(--font-sans)',
      text: String(stats.total)
    }));
    g.appendChild(svg('text', { class: 'n-label h-label', y: hub.r, text: hub.label }));
    g.appendChild(svg('text', {
      class: 'n-label h-sublabel', y: hub.r,
      text: `${stats.percent}% · ${stats.total} topics`
    }));
    g.appendChild(svg('circle', { class: 'n-hit', r: hub.r + 12 }));
    nodeEls.set(hub.id, g);
    layer.appendChild(g);
  }
}

function drawTopics(layer) {
  for (const n of GRAPH.topicNodes) {
    const status = store.statusOf(n.id);
    const g = svg('g', {
      class: 'node node-topic',
      'data-track': n.track,
      'data-status': status,
      'data-id': n.id,
      'data-domain': n.domain,
      transform: `translate(${n.x.toFixed(1)},${n.y.toFixed(1)})`,
      tabindex: '0',
      role: 'button',
      'aria-label': n.title
    });
    g.appendChild(svg('circle', { class: 't-ring', r: n.r }));
    g.appendChild(svg('circle', { class: 't-core', r: n.r * 0.5 }));
    g.appendChild(svg('text', { class: 'n-label t-label', y: n.r, text: truncate(n.label, 26) }));
    g.appendChild(svg('circle', { class: 'n-hit', r: n.r + 9 }));
    nodeEls.set(n.id, g);
    layer.appendChild(g);
  }
}

function truncate(s, max) {
  return s.length > max ? s.slice(0, max - 1).trimEnd() + '…' : s;
}

/* ============================================================
   HUD
   ============================================================ */

function buildHud() {
  const hud = el('div.map-hud');

  // ---- filters ----
  const filters = el('div.hud-panel.hud-filters', { id: 'hud-filters' });
  filters.innerHTML =
    `<div class="hf-head">
       <span class="hf-title">Filter the map</span>
       <button id="hf-toggle" aria-label="Collapse filters">${icon('chevronDown')}</button>
     </div>
     <div class="hf-body">
       <div class="hf-row"><span class="hf-label">Track</span>
         ${TRACKS.map(t => `<button class="chip" data-track="${t.id}" data-filter-track="${t.id}" title="${t.blurb}"><span class="dot"></span>${t.label}</button>`).join('')}
       </div>
       <div class="hf-row"><span class="hf-label">Status</span>
         ${[['all', 'All'], ['learning', 'Learning now'], ['review', 'Needs revision'],
            ['completed', 'Completed'], ['not-started', 'Not started'], ['high', 'High priority']]
            .map(([v, l]) => `<button class="chip" data-filter-status="${v}">${l}</button>`).join('')}
       </div>
     </div>`;
  hud.appendChild(filters);

  filters.querySelector('#hf-toggle').addEventListener('click', () => filters.classList.toggle('is-collapsed'));
  filters.addEventListener('click', e => {
    const t = e.target.closest('[data-filter-track]');
    if (t) { store.toggleTrackFilter(t.dataset.filterTrack); return; }
    const s = e.target.closest('[data-filter-status]');
    if (s) store.setFilters({ status: s.dataset.filterStatus });
  });

  // ---- stats ----
  const stats = el('div.hud-panel.hud-stats', { id: 'hud-stats' });
  hud.appendChild(stats);

  // ---- trail ("you are here") ----
  trailEl = el('div.hud-panel.hud-trail', { id: 'hud-trail' });
  trailEl.addEventListener('click', e => {
    const step = e.target.closest('[data-step]');
    if (step) router.openTopic(step.dataset.step);
  });
  hud.appendChild(trailEl);

  // ---- legend ----
  const legend = el('div.hud-panel.hud-legend');
  legend.innerHTML =
    `<div class="lg-title">Legend</div>
     ${['not-started', 'learning', 'review', 'completed', 'mastered'].map(s =>
        `<div class="lg-row" data-status="${s}"><span class="lg-dot ${s === 'not-started' ? 'is-empty' : ''}"></span>${STATUS_META[s].label}</div>`).join('')}
     <div class="lg-row" style="margin-top:6px"><span class="lg-line"></span>leads to</div>
     <div class="lg-row"><span class="lg-line is-dash"></span>related</div>`;
  hud.appendChild(legend);

  // ---- minimap ----
  const mm = el('div.hud-panel.hud-minimap', { title: 'Click to jump' });
  const mmSvg = svg('svg', {
    viewBox: `${BOUNDS.minX} ${BOUNDS.minY} ${BOUNDS.width} ${BOUNDS.height}`,
    preserveAspectRatio: 'xMidYMid meet'
  });
  for (const n of GRAPH.hubNodes) {
    mmSvg.appendChild(svg('circle', { class: 'mm-dot', 'data-track': n.track, cx: n.x, cy: n.y, r: 26 }));
  }
  minimapView = svg('rect', { class: 'mm-view', x: 0, y: 0, width: 10, height: 10, rx: 20 });
  mmSvg.appendChild(minimapView);
  mm.appendChild(mmSvg);
  mm.addEventListener('click', e => {
    const box = mmSvg.getBoundingClientRect();
    const vb = mmSvg.viewBox.baseVal;
    const scale = Math.min(box.width / vb.width, box.height / vb.height);
    const offX = (box.width - vb.width * scale) / 2;
    const offY = (box.height - vb.height * scale) / 2;
    const wx = (e.clientX - box.left - offX) / scale + vb.x;
    const wy = (e.clientY - box.top - offY) / scale + vb.y;
    centerOn(wx, wy, Math.max(cam.k, 0.55), true);
  });
  hud.appendChild(mm);

  // ---- camera controls ----
  const ctl = el('div.hud-panel.hud-controls');
  ctl.innerHTML =
    `<button data-cam="in"    title="Zoom in">${icon('plus')}</button>
     <div class="hc-zoom" id="hud-zoom">50%</div>
     <button data-cam="out"   title="Zoom out">${icon('minus')}</button>
     <button data-cam="fit"   title="Fit the whole map">${icon('fit')}</button>
     <button data-cam="here"  title="Centre on the current topic">${icon('target')}</button>`;
  ctl.addEventListener('click', e => {
    const b = e.target.closest('[data-cam]');
    if (!b) return;
    if (b.dataset.cam === 'in') zoomBy(1.35);
    if (b.dataset.cam === 'out') zoomBy(1 / 1.35);
    if (b.dataset.cam === 'fit') fit(true);
    if (b.dataset.cam === 'here') {
      const cur = router.route().topic;
      const n = cur && GRAPH.nodeById[cur];
      if (n) centerOn(n.x, n.y, Math.max(cam.k, 1.1), true);
      else fit(true);
    }
  });
  hud.appendChild(ctl);
  hudZoom = ctl.querySelector('#hud-zoom');

  refreshStats(stats);
  return hud;
}

function refreshStats(host = $('#hud-stats')) {
  if (!host) return;
  const o = overall();
  const counts = o.counts;
  host.innerHTML =
    `<div class="hs-item"><span class="hs-num">${o.percent}%</span><span class="hs-lab">Prepared</span></div>
     <div class="hs-sep"></div>
     <div class="hs-item"><span class="hs-num">${o.total}</span><span class="hs-lab">Topics</span></div>
     <div class="hs-sep"></div>
     <div class="hs-item"><span class="hs-num">${counts.learning}</span><span class="hs-lab">Learning</span></div>
     <div class="hs-sep"></div>
     <div class="hs-item"><span class="hs-num">${counts.review}</span><span class="hs-lab">Revise</span></div>`;
}

/* ============================================================
   CAMERA
   ============================================================ */

function applyCamera() {
  viewport.setAttribute('transform', `translate(${cam.x.toFixed(2)},${cam.y.toFixed(2)}) scale(${cam.k.toFixed(4)})`);
  root.style.setProperty('--k', cam.k.toFixed(4));
  root.dataset.detail = cam.k < DETAIL_MID ? 'far' : cam.k < DETAIL_NEAR ? 'mid' : 'near';
  if (hudZoom) hudZoom.textContent = `${Math.round(cam.k * 100)}%`;
  updateMinimap();
  saveCam();
}

const saveCam = debounce(() => store.setMapView({ ...cam }), 400);

function updateMinimap() {
  if (!minimapView || !root) return;
  const w = root.clientWidth / cam.k;
  const h = root.clientHeight / cam.k;
  minimapView.setAttribute('x', (-cam.x / cam.k).toFixed(0));
  minimapView.setAttribute('y', (-cam.y / cam.k).toFixed(0));
  minimapView.setAttribute('width', w.toFixed(0));
  minimapView.setAttribute('height', h.toFixed(0));
}

/** Measure the HUD so `fit` can keep the map clear of it. */
function hudInsets(w, h) {
  const gap = 20;
  const box = el => {
    const n = root.querySelector(el);
    if (!n || n.offsetParent === null) return { w: 0, h: 0 };
    return { w: n.offsetWidth, h: n.offsetHeight };
  };
  const filters = box('.hud-filters');
  const stats = box('.hud-stats');
  const legend = box('.hud-legend');
  const controls = box('.hud-controls');

  // The HUD sits in the four corners, so the centre column stays clear.
  // Reserving the panels' full height would waste the viewport; reserving
  // roughly half keeps hubs clear without shrinking the map.
  const inset = {
    top: gap + Math.max(filters.h, stats.h) * 0.55,
    bottom: gap + Math.max(legend.h, controls.h) * 0.45,
    left: gap,
    right: gap
  };
  inset.top = Math.min(inset.top, h * 0.16);
  inset.bottom = Math.min(inset.bottom, h * 0.14);
  return inset;
}

function fit(animate = true) {
  const w = root.clientWidth || 1200;
  const h = root.clientHeight || 800;

  // Frame the map inside the area the HUD does not cover, so a domain hub
  // never opens hidden behind the filter panel or the legend.
  const inset = hudInsets(w, h);
  const availW = Math.max(240, w - inset.left - inset.right);
  const availH = Math.max(200, h - inset.top - inset.bottom);

  const k = clamp(Math.min(availW / BOUNDS.width, availH / BOUNDS.height), MIN_K, MAX_K);
  const target = {
    k,
    x: inset.left + availW / 2 - (BOUNDS.minX + BOUNDS.width / 2) * k,
    y: inset.top + availH / 2 - (BOUNDS.minY + BOUNDS.height / 2) * k
  };
  hasUserCamera = false;
  fittedAt = { w, h };
  animate ? animateTo(target) : (cam = target);
  if (!animate) applyCamera();
}

function centerOn(wx, wy, k = cam.k, animate = true) {
  hasUserCamera = true;
  const w = root.clientWidth, h = root.clientHeight;
  const target = { k, x: w / 2 - wx * k, y: h / 2 - wy * k };
  animate ? animateTo(target) : (cam = target, applyCamera());
}

let animFrame = null;
function animateTo(target, ms = 520) {
  cancelAnimationFrame(animFrame);
  const from = { ...cam };
  const t0 = performance.now();
  const step = now => {
    const p = clamp((now - t0) / ms, 0, 1);
    const e = 1 - Math.pow(1 - p, 3);
    cam = {
      x: from.x + (target.x - from.x) * e,
      y: from.y + (target.y - from.y) * e,
      k: from.k + (target.k - from.k) * e
    };
    applyCamera();
    if (p < 1) animFrame = requestAnimationFrame(step);
  };
  animFrame = requestAnimationFrame(step);
}

function zoomAt(clientX, clientY, factor) {
  hasUserCamera = true;
  const box = root.getBoundingClientRect();
  const px = clientX - box.left, py = clientY - box.top;
  const k2 = clamp(cam.k * factor, MIN_K, MAX_K);
  const scale = k2 / cam.k;
  cam.x = px - (px - cam.x) * scale;
  cam.y = py - (py - cam.y) * scale;
  cam.k = k2;
  applyCamera();
}

function zoomBy(factor) {
  const box = root.getBoundingClientRect();
  zoomAt(box.left + box.width / 2, box.top + box.height / 2, factor);
}

function installCamera() {
  root.addEventListener('wheel', e => {
    e.preventDefault();
    // Trackpad pinch arrives as ctrlKey+wheel; both paths zoom.
    const factor = Math.exp(-e.deltaY * (e.ctrlKey ? 0.012 : 0.0016));
    zoomAt(e.clientX, e.clientY, factor);
  }, { passive: false });

  let dragging = false, moved = false, lastX = 0, lastY = 0, pointerId = null;
  let downNode = null, captured = false;
  const pointers = new Map();
  let pinchDist = 0;

  root.addEventListener('pointerdown', e => {
    if (e.button !== 0 && e.pointerType === 'mouse') return;
    pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pointers.size === 2) {
      const [a, b] = [...pointers.values()];
      pinchDist = Math.hypot(a.x - b.x, a.y - b.y);
      dragging = false;
      return;
    }
    dragging = true; moved = false; captured = false;
    // Remember what was under the pointer: once we capture for panning,
    // every later event retargets to the root and the node is lost.
    downNode = e.target.closest?.('.node') || null;
    lastX = e.clientX; lastY = e.clientY; pointerId = e.pointerId;
    root.classList.add('is-panning');
  });

  root.addEventListener('pointermove', e => {
    if (pointers.has(e.pointerId)) pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });

    if (pointers.size === 2) {
      const [a, b] = [...pointers.values()];
      const d = Math.hypot(a.x - b.x, a.y - b.y);
      if (pinchDist > 0) {
        zoomAt((a.x + b.x) / 2, (a.y + b.y) / 2, d / pinchDist);
      }
      pinchDist = d;
      return;
    }
    if (!dragging || e.pointerId !== pointerId) return;
    const dx = e.clientX - lastX, dy = e.clientY - lastY;
    if (!moved && Math.abs(dx) + Math.abs(dy) > 3) {
      moved = true;
      // Only take pointer capture once this is genuinely a drag, so a plain
      // click still reaches the node it landed on.
      try { root.setPointerCapture(e.pointerId); captured = true; } catch {}
    }
    if (!moved) return;
    cam.x += dx; cam.y += dy; hasUserCamera = true;
    lastX = e.clientX; lastY = e.clientY;
    applyCamera();
  });

  const endPointer = e => {
    pointers.delete(e.pointerId);
    if (pointers.size < 2) pinchDist = 0;
    if (e.pointerId !== pointerId) return;

    // A press that never turned into a drag is a selection.
    if (!moved && downNode && e.type === 'pointerup') activateNode(downNode.dataset.id);

    dragging = false;
    downNode = null;
    root.classList.remove('is-panning');
    if (captured) { try { root.releasePointerCapture(e.pointerId); } catch {} captured = false; }
  };
  root.addEventListener('pointerup', endPointer);
  root.addEventListener('pointercancel', endPointer);
}

/* ============================================================
   INTERACTION
   ============================================================ */

/** Selecting a node: hubs frame their cluster, topics open the panel. */
function activateNode(id) {
  if (!id) return;
  if (id.startsWith('domain:')) {
    const hub = GRAPH.nodeById[id];
    const span = (hub.clusterR || 200) * 2.2;
    const box = root.getBoundingClientRect();
    const k = clamp(Math.min(box.width / span, box.height / span), 0.5, 2.2);
    centerOn(hub.x, hub.y, k, true);
    return;
  }
  router.openTopic(id);
}

function installInteractions() {
  svgEl.addEventListener('keydown', e => {
    if (e.key !== 'Enter' && e.key !== ' ') return;
    const g = e.target.closest('.node');
    if (!g) return;
    e.preventDefault();
    activateNode(g.dataset.id);
  });

  svgEl.addEventListener('pointerover', e => {
    const g = e.target.closest('.node');
    if (!g || g.dataset.id === hoveredId) return;
    hoveredId = g.dataset.id;
    showTip(g.dataset.id, e.clientX, e.clientY);
    if (!router.route().topic) softHighlight(g.dataset.id);
  });

  svgEl.addEventListener('pointermove', e => {
    if (hoveredId) positionTip(e.clientX, e.clientY);
  });

  svgEl.addEventListener('pointerout', e => {
    const g = e.target.closest('.node');
    if (!g) return;
    if (e.relatedTarget && e.relatedTarget.closest?.('.node') === g) return;
    hoveredId = null;
    hideTip();
    if (!router.route().topic) clearHighlight();
  });
}

/* ---------------- hover card ---------------- */

function showTip(id, x, y) {
  const isHub = id.startsWith('domain:');
  tipEl.dataset.track = GRAPH.nodeById[id].track;

  if (isHub) {
    const d = DOMAIN_BY_ID[GRAPH.nodeById[id].domain];
    const s = domainStats(d.id);
    tipEl.innerHTML =
      `<div class="mt-top"><span class="mt-track">${TRACK_BY_ID[d.track].label} domain</span></div>
       <div class="mt-title">${d.title}</div>
       <div class="mt-blurb">${d.blurb}</div>
       <div class="mt-meta">
         <div class="mt-line"><span class="mt-key">Topics</span><span class="mt-val">${s.total}</span></div>
         <div class="mt-line"><span class="mt-key">Progress</span><span class="mt-val">${s.percent}% · ${s.done} done · ${s.counts.review} to revise</span></div>
       </div>
       <div class="mt-hint">Click to zoom into this cluster</div>`;
  } else {
    const t = TOPIC_BY_ID[id];
    const adj = GRAPH.adjacency.get(id) || { in: [], out: [] };
    const status = store.statusOf(id);
    const pre = adj.in.slice(0, 2).map(i => TOPIC_BY_ID[i]?.title).filter(Boolean).join(', ');
    const nxt = adj.out.slice(0, 2).map(i => TOPIC_BY_ID[i]?.title).filter(Boolean).join(', ');
    tipEl.innerHTML =
      `<div class="mt-top">
         <span class="mt-track">${t.domainTitle}</span>
       </div>
       <div class="mt-title">${t.title}</div>
       <div class="mt-blurb">${t.summary || ''}</div>
       <div class="mt-meta">
         <div class="mt-line"><span class="mt-key">Status</span><span class="mt-val">${STATUS_META[status].label}${t.priority === 'high' ? ' · high priority' : ''}</span></div>
         ${pre ? `<div class="mt-line"><span class="mt-key">Needs</span><span class="mt-val">${pre}</span></div>` : ''}
         ${nxt ? `<div class="mt-line"><span class="mt-key">Unlocks</span><span class="mt-val">${nxt}</span></div>` : ''}
       </div>
       <div class="mt-hint">Click to open the topic</div>`;
  }
  positionTip(x, y);
  tipEl.classList.add('is-on');
}

function positionTip(x, y) {
  const box = root.getBoundingClientRect();
  const w = tipEl.offsetWidth || 290;
  const h = tipEl.offsetHeight || 160;
  let left = x - box.left + 18;
  let top = y - box.top + 18;
  if (left + w > box.width - 12) left = x - box.left - w - 18;
  if (top + h > box.height - 12) top = Math.max(12, y - box.top - h - 18);
  tipEl.style.left = `${left}px`;
  tipEl.style.top = `${top}px`;
}

function hideTip() { tipEl.classList.remove('is-on'); }

/* ============================================================
   HIGHLIGHTING — the part that makes relationships visible
   ============================================================ */

function clearHighlight() {
  for (const g of nodeEls.values()) g.classList.remove('is-dim', 'is-lit', 'is-current');
  for (const p of edgeEls.values()) p.classList.remove('is-dim', 'is-in', 'is-out', 'is-flowing');
  for (const h of haloEls.values()) h.classList.remove('is-dim', 'is-lit');
  for (const a of arteryEls.values()) a.classList.remove('is-lit');
  root.querySelector('.you-pulse')?.remove();
  trailEl?.classList.remove('is-on');
  applyFilters();
}

/** Light a node's immediate neighbourhood while hovering. */
function softHighlight(id) {
  if (id.startsWith('domain:')) {
    for (const [dom, h] of haloEls) h.classList.toggle('is-lit', dom === GRAPH.nodeById[id].domain);
    return;
  }
  const adj = GRAPH.adjacency.get(id);
  if (!adj) return;
  const near = new Set([id, ...adj.in, ...adj.out, ...adj.related]);
  for (const [nid, g] of nodeEls) {
    if (nid.startsWith('domain:')) continue;
    g.classList.toggle('is-lit', near.has(nid) && nid !== id);
  }
  for (const [eid, p] of edgeEls) {
    const { from, to } = p.dataset;
    const touches = from === id || to === id;
    p.classList.toggle('is-out', touches && from === id && p.dataset.type !== 'related');
    p.classList.toggle('is-in', touches && to === id && p.dataset.type !== 'related');
  }
}

/** Full selection state: prerequisite chain in, unlocked chain out, rest dimmed. */
function highlight(id) {
  if (!mounted) return;
  clearHighlight();
  if (!id || !GRAPH.nodeById[id]) return;

  const adj = GRAPH.adjacency.get(id) || { in: [], out: [], related: [] };
  const inSet = new Set(adj.in);
  const outSet = new Set(adj.out);
  const relSet = new Set(adj.related);
  const near = new Set([id, ...inSet, ...outSet, ...relSet]);

  for (const [nid, g] of nodeEls) {
    if (nid.startsWith('domain:')) continue;
    g.classList.toggle('is-current', nid === id);
    g.classList.toggle('is-lit', near.has(nid) && nid !== id);
    g.classList.toggle('is-dim', !near.has(nid) && !g.classList.contains('is-filtered-out'));
  }

  for (const [eid, p] of edgeEls) {
    const { from, to, type } = p.dataset;
    const isIn = to === id && type !== 'related';
    const isOut = from === id && type !== 'related';
    const isRel = (from === id || to === id) && type === 'related';
    p.classList.toggle('is-in', isIn);
    p.classList.toggle('is-out', isOut);
    p.classList.toggle('is-flowing', isOut);
    p.classList.toggle('is-dim', !isIn && !isOut && !isRel);
  }

  const node = GRAPH.nodeById[id];
  const g = nodeEls.get(id);
  if (g && !g.querySelector('.you-pulse')) {
    const pulse = svg('circle', { class: 'you-pulse', r: 12 });
    g.insertBefore(pulse, g.firstChild);
  }
  for (const [dom, h] of haloEls) h.classList.toggle('is-lit', dom === node.domain);

  renderTrail(id);

  // Bring the selection into view if it is off-screen or the map is zoomed out.
  const box = root.getBoundingClientRect();
  const sx = node.x * cam.k + cam.x;
  const sy = node.y * cam.k + cam.y;
  const panelW = window.innerWidth > 860 ? Math.min(560, window.innerWidth * 0.46) : 0;
  const offscreen = sx < 60 || sx > box.width - panelW - 60 || sy < 60 || sy > box.height - 60;
  if (offscreen || cam.k < 0.7) {
    const k = Math.max(cam.k, 1.0);
    const w = box.width, h = box.height;
    animateTo({ k, x: (w - panelW) / 2 - node.x * k, y: h / 2 - node.y * k });
  }
}

function renderTrail(id) {
  const chain = trailTo(id);
  if (!trailEl) return;
  if (chain.length < 2) { trailEl.classList.remove('is-on'); return; }
  trailEl.innerHTML =
    `<div class="tr-title">You are here</div>
     <div class="tr-chain">${chain.map((cid, i) => {
        const t = TOPIC_BY_ID[cid];
        return (i ? '<span class="tr-arrow">&#9654;</span>' : '') +
          `<button class="tr-step ${cid === id ? 'is-here' : ''}" data-step="${cid}">${t ? truncate(t.title, 24) : cid}</button>`;
      }).join('')}</div>`;
  trailEl.classList.add('is-on');
}

/* ============================================================
   FILTERS
   ============================================================ */

function applyFilters() {
  if (!mounted) return;
  const f = store.filters();
  const tracks = f.tracks || [];
  const status = f.status || 'all';

  for (const btn of root.querySelectorAll('[data-filter-track]')) {
    btn.classList.toggle('is-on', tracks.includes(btn.dataset.filterTrack));
  }
  for (const btn of root.querySelectorAll('[data-filter-status]')) {
    btn.classList.toggle('is-on', btn.dataset.filterStatus === status);
  }

  const passes = t => {
    if (tracks.length && !tracks.includes(t.track)) return false;
    if (status === 'all') return true;
    if (status === 'high') return t.priority === 'high';
    return store.statusOf(t.id) === status;
  };

  const anyFilter = tracks.length > 0 || status !== 'all';
  const visibleDomains = new Set();

  for (const n of GRAPH.topicNodes) {
    const g = nodeEls.get(n.id);
    if (!g) continue;
    const t = TOPIC_BY_ID[n.id];
    const ok = !anyFilter || passes(t);
    g.classList.toggle('is-filtered-out', !ok);
    if (ok) visibleDomains.add(n.domain);
    if (!router.route().topic) g.classList.toggle('is-dim', !ok);
  }

  for (const [eid, p] of edgeEls) {
    const a = nodeEls.get(p.dataset.from), b = nodeEls.get(p.dataset.to);
    const ok = a && b && !a.classList.contains('is-filtered-out') && !b.classList.contains('is-filtered-out');
    if (!router.route().topic) p.classList.toggle('is-dim', anyFilter && !ok);
  }

  for (const [dom, h] of haloEls) {
    h.classList.toggle('is-dim', anyFilter && !visibleDomains.has(dom));
  }
  for (const hub of GRAPH.hubNodes) {
    const g = nodeEls.get(hub.id);
    if (g) g.classList.toggle('is-dim', anyFilter && !visibleDomains.has(hub.domain));
  }
}

/* ============================================================
   REFRESH
   ============================================================ */

function refreshNode(id) {
  const g = nodeEls.get(id);
  if (g) g.dataset.status = store.statusOf(id);
}

function refreshAllNodes() {
  for (const n of GRAPH.topicNodes) refreshNode(n.id);
}

function refreshHubs() {
  for (const hub of GRAPH.hubNodes) {
    const g = nodeEls.get(hub.id);
    if (!g) continue;
    const s = domainStats(hub.domain);
    const { c, offset } = hubArc(hub, s.percent);
    g.querySelector('.h-arc')?.setAttribute('stroke-dashoffset', offset.toFixed(1));
    const sub = g.querySelector('.h-sublabel');
    if (sub) sub.textContent = `${s.percent}% · ${s.total} topics`;
  }
}

/** Used by search and other views to fly the camera to a topic. */
export function focusTopic(id) {
  const n = GRAPH.nodeById[id];
  if (!n || !root) return;
  centerOn(n.x, n.y, Math.max(cam.k, 1.1), true);
}

/** Fly to a whole domain cluster and frame it. */
export function focusDomain(domainId) {
  const hub = hubFor(domainId);
  if (!hub || !root) return;
  const box = root.getBoundingClientRect();
  const span = (hub.clusterR || 200) * 2.3;
  const k = clamp(Math.min(box.width / span, box.height / span), 0.4, 2.2);
  centerOn(hub.x, hub.y, k, true);
}
