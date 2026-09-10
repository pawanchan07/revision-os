/**
 * MASTER DEPENDENCY MAP (BUILD.md section 49)
 *
 * A layered DAG: every topic sits in a row determined by its longest
 * prerequisite chain, so the picture reads strictly top-to-bottom as
 * "what must be understood before what".
 *
 * Deliberately different from the Preparation Map. That one shows the
 * *landscape*; this one shows the *order*.
 */
import { $, el, svg, escapeHtml, clamp } from '../core/util.js';
import { icon } from '../components/icons.js';
import * as store from '../core/store.js';
import * as router from '../core/router.js';
import { on } from '../core/events.js';
import { GRAPH, ancestorsOf, descendantsOf } from '../../data/graph.js';
import { TOPICS, TOPIC_BY_ID } from '../../data/topics.js';
import { TRACKS } from '../../data/tracks.js';

const NODE_W = 168;
const NODE_H = 34;
const GAP_X = 16;
const GAP_Y = 78;
const PAD = 48;
const GUTTER = 104;   // left column reserved for lane labels
const DEP_DETAIL_NEAR = 0.55;   // below this, node labels are unreadable

let host, canvas, stage, svgEl, layout = null, trackFilter = null;
let zoom = 1;

export function mount(node) {
  host = node;
  host.innerHTML = `
    <div class="dep-root">
      <div class="dep-bar">
        <span class="db-title">Master Dependency Map</span>
        <span class="hint">${icon('info')}Every topic sits below everything it requires. Click any topic to open it.</span>
        <span class="db-sp"></span>
        <div class="dep-zoom">
          <button class="btn is-sm is-icon" data-dep-zoom="out" title="Zoom out">${icon('minus')}</button>
          <button class="btn is-sm" data-dep-zoom="fit" title="Fit the whole graph">Fit</button>
          <button class="btn is-sm is-icon" data-dep-zoom="in" title="Zoom in">${icon('plus')}</button>
        </div>
        <div class="dep-filters" id="dep-filters"></div>
      </div>
      <div class="dep-canvas" id="dep-canvas"><div class="dep-stage" id="dep-stage"></div></div>
    </div>`;

  canvas = $('#dep-canvas', host);
  stage = $('#dep-stage', host);
  $('#dep-filters', host).innerHTML =
    `<button class="chip is-on" data-dep-track="">All tracks</button>` +
    TRACKS.map(t => `<button class="chip" data-track="${t.id}" data-dep-track="${t.id}">${t.label}</button>`).join('');

  host.addEventListener('click', e => {
    const f = e.target.closest('[data-dep-track]');
    if (f) {
      trackFilter = f.dataset.depTrack || null;
      for (const b of host.querySelectorAll('[data-dep-track]')) {
        b.classList.toggle('is-on', (b.dataset.depTrack || null) === trackFilter);
      }
      draw();
      return;
    }
    const z = e.target.closest('[data-dep-zoom]');
    if (z) {
      if (z.dataset.depZoom === 'in') setZoom(zoom * 1.25);
      else if (z.dataset.depZoom === 'out') setZoom(zoom / 1.25);
      else fitZoom();
      return;
    }

    const n = e.target.closest('[data-dep-node]');
    if (n) router.openTopic(n.dataset.depNode);
  });

  on('status:change', refreshStatuses);
  on('progress:change', refreshStatuses);
  on('route:topic', ({ topic }) => highlight(topic));

  draw();
}

export function activate() {
  if (!layout) draw();
  highlight(router.route().topic);
}

/* ============================================================
   LAYOUT — assign every topic to a layer, then order within it
   ============================================================ */

function computeLayout(topics) {
  const ids = new Set(topics.map(t => t.id));

  // Layer = longest prerequisite chain within the filtered subgraph.
  const depth = new Map();
  const state = new Map();
  const parentsOf = id =>
    (GRAPH.adjacency.get(id)?.in || []).filter(p => ids.has(p));

  const walk = id => {
    if (depth.has(id)) return depth.get(id);
    if (state.get(id) === 'open') return 0;          // cycle guard
    state.set(id, 'open');
    let d = 0;
    for (const p of parentsOf(id)) d = Math.max(d, walk(p) + 1);
    state.set(id, 'done');
    depth.set(id, d);
    return d;
  };
  for (const t of topics) walk(t.id);

  // Group into layers
  const layers = [];
  for (const t of topics) {
    const d = depth.get(t.id);
    (layers[d] ||= []).push(t);
  }

  // Order within a layer by the mean x of its parents, so edges cross less.
  const xOf = new Map();
  layers.forEach((layer, i) => {
    if (i > 0) {
      layer.sort((a, b) => barycentre(a, xOf, parentsOf) - barycentre(b, xOf, parentsOf));
    } else {
      layer.sort((a, b) => a.domain.localeCompare(b.domain) || a.title.localeCompare(b.title));
    }
    layer.forEach((t, j) => xOf.set(t.id, j));
  });

  // Assign pixel positions, centring each layer
  const widest = Math.max(...layers.map(l => l.length), 1);
  const canvasW = GUTTER + widest * (NODE_W + GAP_X) + PAD;
  const pos = new Map();

  layers.forEach((layer, i) => {
    const rowW = layer.length * (NODE_W + GAP_X) - GAP_X;
    const startX = GUTTER + (canvasW - GUTTER - rowW) / 2;
    layer.forEach((t, j) => {
      pos.set(t.id, {
        x: startX + j * (NODE_W + GAP_X),
        y: PAD + i * (NODE_H + GAP_Y),
        layer: i
      });
    });
  });

  return {
    layers, pos, ids,
    width: canvasW,
    height: PAD * 2 + layers.length * (NODE_H + GAP_Y)
  };
}

function barycentre(topic, xOf, parentsOf) {
  const parents = parentsOf(topic.id).filter(p => xOf.has(p));
  if (!parents.length) return 1e6;                    // orphans go right
  return parents.reduce((sum, p) => sum + xOf.get(p), 0) / parents.length;
}

/* ============================================================
   DRAW
   ============================================================ */

function draw() {
  const topics = trackFilter ? TOPICS.filter(t => t.track === trackFilter) : TOPICS;
  if (!topics.length) {
    stage.innerHTML = `<div class="empty"><div class="empty-title">No topics in this track yet</div></div>`;
    layout = null;
    return;
  }

  layout = computeLayout(topics);
  const { layers, pos, ids, width, height } = layout;

  svgEl = svg('svg', {
    class: 'dep-svg',
    width, height,
    viewBox: `0 0 ${width} ${height}`
  });

  // Alternating lane bands so rows are easy to follow across a wide graph
  const bands = svg('g');
  layers.forEach((_, i) => {
    if (i % 2) return;
    bands.appendChild(svg('rect', {
      class: 'dep-lane-band',
      x: 0, y: PAD + i * (NODE_H + GAP_Y) - 18,
      width, height: NODE_H + 36, rx: 8
    }));
  });
  svgEl.appendChild(bands);

  // Lane labels. Two texts per lane: the full label, and a short one that stays
  // inside the 104px gutter once the label is counter-scaled at low zoom.
  // CSS swaps them on the canvas's data-dep-detail attribute.
  const labels = svg('g');
  layers.forEach((_, i) => {
    const y = PAD + i * (NODE_H + GAP_Y) - 24;
    labels.appendChild(svg('text', {
      class: 'dep-lane-label', x: 12, y,
      text: i === 0 ? 'START HERE' : `LAYER ${i}`
    }));
    labels.appendChild(svg('text', {
      class: 'dep-lane-label dep-lane-short', x: 12, y,
      text: i === 0 ? '0' : String(i)
    }));
  });
  svgEl.appendChild(labels);

  // Edges
  const edgeLayer = svg('g', { class: 'dep-edges' });
  for (const t of topics) {
    for (const parent of (GRAPH.adjacency.get(t.id)?.in || [])) {
      if (!ids.has(parent)) continue;
      const a = pos.get(parent), b = pos.get(t.id);
      if (!a || !b || a.layer >= b.layer) continue;    // only downward edges
      edgeLayer.appendChild(svg('path', {
        class: 'dep-edge',
        'data-from': parent, 'data-to': t.id,
        d: edgePath(a, b)
      }));
    }
  }
  svgEl.appendChild(edgeLayer);

  // Nodes
  const nodeLayer = svg('g', { class: 'dep-nodes' });
  for (const t of topics) {
    const p = pos.get(t.id);
    const g = svg('g', {
      class: 'dep-node',
      'data-dep-node': t.id,
      'data-track': t.track,
      'data-status': store.statusOf(t.id),
      transform: `translate(${p.x},${p.y})`,
      tabindex: '0', role: 'button',
      'aria-label': t.title
    });
    g.appendChild(svg('rect', { width: NODE_W, height: NODE_H, rx: 7 }));
    g.appendChild(svg('circle', { class: 'dn-dot', cx: 14, cy: NODE_H / 2, r: 4 }));
    g.appendChild(svg('text', {
      x: 26, y: NODE_H / 2 + 4,
      text: truncate(t.title, 19)
    }));
    g.appendChild(svg('title', { text: `${t.title} — ${t.domainTitle}` }));
    nodeLayer.appendChild(g);
  }
  svgEl.appendChild(nodeLayer);

  stage.innerHTML = '';
  stage.appendChild(svgEl);
  applyZoom();
  highlight(router.route().topic);
}

function edgePath(a, b) {
  const x1 = a.x + NODE_W / 2, y1 = a.y + NODE_H;
  const x2 = b.x + NODE_W / 2, y2 = b.y;
  const mid = (y1 + y2) / 2;
  return `M${x1},${y1} C${x1},${mid} ${x2},${mid} ${x2},${y2}`;
}

function truncate(s, max) {
  return s.length > max ? s.slice(0, max - 1).trimEnd() + '…' : s;
}

/* ============================================================
   HIGHLIGHT — the full chain into and out of a topic
   ============================================================ */

function highlight(id) {
  if (!svgEl) return;
  const nodes = svgEl.querySelectorAll('.dep-node');
  const edges = svgEl.querySelectorAll('.dep-edge');

  if (!id || !TOPIC_BY_ID[id]) {
    nodes.forEach(n => n.classList.remove('is-lit', 'is-dim'));
    edges.forEach(e => e.classList.remove('is-lit', 'is-dim'));
    return;
  }

  const chain = new Set([id, ...ancestorsOf(id), ...descendantsOf(id)]);
  nodes.forEach(n => {
    const inChain = chain.has(n.dataset.depNode);
    n.classList.toggle('is-lit', inChain);
    n.classList.toggle('is-dim', !inChain);
  });
  edges.forEach(e => {
    const lit = chain.has(e.dataset.from) && chain.has(e.dataset.to);
    e.classList.toggle('is-lit', lit);
    e.classList.toggle('is-dim', !lit);
  });

  const current = svgEl.querySelector(`[data-dep-node="${CSS.escape(id)}"]`);
  if (current) current.scrollIntoView({ block: 'center', inline: 'center', behavior: 'smooth' });
}

function refreshStatuses() {
  if (!svgEl) return;
  for (const n of svgEl.querySelectorAll('.dep-node')) {
    n.dataset.status = store.statusOf(n.dataset.depNode);
  }
}

/* ============================================================
   ZOOM — the graph is wide; let the whole thing be seen at once
   ============================================================ */

function setZoom(next) {
  zoom = clamp(next, 0.2, 1.6);
  applyZoom();
}

function fitZoom() {
  if (!layout || !canvas) return;
  const available = canvas.clientWidth - 32;
  setZoom(available / layout.width);
}

function applyZoom() {
  if (!stage) return;
  stage.style.transform = `scale(${zoom})`;
  stage.style.transformOrigin = '0 0';
  if (layout) {
    // Reserve the scaled size so the scroll container sizes correctly.
    stage.style.width = `${layout.width}px`;
    stage.style.height = `${layout.height}px`;
    canvas.style.setProperty('--dep-w', `${layout.width * zoom}px`);
    canvas.style.setProperty('--dep-h', `${layout.height * zoom}px`);
  }
  // Zoom-gated detail, the same idea as the main map. Below the threshold the
  // 10.5px node labels render at 4px or less — illegible noise that also hides
  // the shape of the graph — so they are dropped and the lane labels are
  // counter-scaled to stay readable. Names remain available on hover via the
  // native <title> on each node.
  canvas.style.setProperty('--dep-k', String(zoom));
  canvas.dataset.depDetail = zoom < DEP_DETAIL_NEAR ? 'far' : 'near';
  const label = host?.querySelector('[data-dep-zoom="fit"]');
  if (label) label.textContent = zoom > 0.98 && zoom < 1.02 ? 'Fit' : `${Math.round(zoom * 100)}%`;
}
