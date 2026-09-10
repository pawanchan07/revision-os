/**
 * Graph model for the Preparation Map.
 *
 * Builds, once at boot:
 *   - domain hub nodes at their curated coordinates
 *   - topic nodes arranged deterministically around their hub
 *   - typed edges (prerequisite / next / related) between topics
 *   - aggregated "arteries" between domains, derived from cross-domain edges
 *   - adjacency + dependency depth used by the master dependency map
 *
 * Layout is deterministic: a golden-angle spiral seeded by a stable string
 * hash, followed by a fixed number of relaxation passes. Same input, same
 * picture, every single time.
 */
import { DOMAINS, DOMAIN_BY_ID } from './domains.js';
import { TOPICS, TOPIC_BY_ID, topicsInDomain } from './topics.js';
import { hash01 } from '../js/core/util.js';

const TAU = Math.PI * 2;
const GOLDEN = 2.39996322972865332;

export const HUB_R = 27;
export const TOPIC_R = 9;

/**
 * Domain coordinates in domains.js describe the *relative* composition of the
 * map. This factor spreads them out so the densest clusters (Programming, LLM,
 * Product) stop colliding with their neighbours as content grows.
 */
const LAYOUT_SCALE = 1.34;

function spiralPositions(hub, count, phase) {
  const out = [];
  for (let i = 0; i < count; i++) {
    const a = i * GOLDEN + phase;
    const r = 60 + 20 * Math.sqrt(i);
    out.push({
      x: hub.x + r * Math.cos(a),
      y: hub.y + r * Math.sin(a) * 0.86
    });
  }
  return out;
}

/** Push overlapping nodes apart. Hubs are pinned; topics move. */
function relax(nodes, passes = 90) {
  const movable = nodes.filter(n => n.kind === 'topic');
  for (let p = 0; p < passes; p++) {
    for (let i = 0; i < movable.length; i++) {
      const a = movable[i];
      for (let j = 0; j < nodes.length; j++) {
        const b = nodes[j];
        if (a === b) continue;
        const minDist = b.kind === 'hub' ? 54 : 38;
        let dx = a.x - b.x;
        let dy = a.y - b.y;
        let d = Math.hypot(dx, dy);
        if (d > minDist || d === 0) continue;
        // Deterministic nudge when two nodes land exactly on top of each other.
        if (d < 0.001) { dx = 0.5 - hash01(a.id, j); dy = 0.5 - hash01(b.id, i); d = Math.hypot(dx, dy) || 1; }
        const push = ((minDist - d) / d) * (b.kind === 'hub' ? 0.9 : 0.5);
        a.x += dx * push;
        a.y += dy * push;
        if (b.kind === 'topic') { b.x -= dx * push; b.y -= dy * push; }
      }
      // Gentle spring back towards the owning hub so clusters stay coherent.
      const hub = a.hubRef;
      const hx = a.x - hub.x, hy = a.y - hub.y;
      const hd = Math.hypot(hx, hy);
      const maxR = a.maxR;
      if (hd > maxR) {
        a.x = hub.x + (hx / hd) * maxR;
        a.y = hub.y + (hy / hd) * maxR;
      }
    }
  }
}

function buildNodes() {
  const nodes = [];
  const hubs = [];

  for (const d of DOMAINS) {
    const hub = {
      id: `domain:${d.id}`,
      kind: 'hub',
      domain: d.id,
      track: d.track,
      label: d.short,
      title: d.title,
      blurb: d.blurb,
      x: d.x * LAYOUT_SCALE, y: d.y * LAYOUT_SCALE,
      r: HUB_R
    };
    hubs.push(hub);
    nodes.push(hub);
  }

  for (const d of DOMAINS) {
    const hub = hubs.find(h => h.domain === d.id);
    const list = topicsInDomain(d.id);
    hub.count = list.length;
    const maxR = 70 + 19 * Math.sqrt(Math.max(1, list.length));
    hub.clusterR = maxR + 20;
    const pos = spiralPositions(hub, list.length, hash01(d.id) * TAU);
    list.forEach((t, i) => {
      nodes.push({
        id: t.id,
        kind: 'topic',
        domain: d.id,
        track: d.track,
        label: t.title,
        title: t.title,
        blurb: t.summary,
        tier: t.tier,
        priority: t.priority,
        x: pos[i].x, y: pos[i].y,
        r: TOPIC_R,
        hubRef: hub,
        maxR
      });
    });
  }

  relax(nodes);
  for (const n of nodes) delete n.hubRef;
  return nodes;
}

function buildEdges() {
  const edges = [];
  const seen = new Set();
  const add = (from, to, type) => {
    if (!TOPIC_BY_ID[from] || !TOPIC_BY_ID[to] || from === to) return;
    // related edges are undirected: normalise so A-B and B-A collapse.
    const key = type === 'related'
      ? `related:${[from, to].sort().join('|')}`
      : `flow:${from}|${to}`;
    if (seen.has(key)) return;
    seen.add(key);
    edges.push({ from, to, type, id: key });
  };

  for (const t of TOPICS) {
    for (const p of t.prereq) add(p, t.id, 'flow');
    for (const n of t.next) add(t.id, n, 'flow');
    for (const r of t.related) add(t.id, r, 'related');
  }
  return edges;
}

function buildArteries(edges) {
  const map = new Map();
  for (const e of edges) {
    const a = TOPIC_BY_ID[e.from].domain;
    const b = TOPIC_BY_ID[e.to].domain;
    if (a === b) continue;
    const key = `${a}|${b}`;
    const rev = `${b}|${a}`;
    if (map.has(rev)) { map.get(rev).weight++; continue; }
    if (!map.has(key)) map.set(key, { from: a, to: b, weight: 0, id: key });
    map.get(key).weight++;
  }
  return [...map.values()];
}

function buildAdjacency(edges) {
  const out = new Map();
  const ensure = id => {
    if (!out.has(id)) out.set(id, { in: [], out: [], related: [] });
    return out.get(id);
  };
  for (const t of TOPICS) ensure(t.id);
  for (const e of edges) {
    if (e.type === 'related') {
      ensure(e.from).related.push(e.to);
      ensure(e.to).related.push(e.from);
    } else {
      ensure(e.from).out.push(e.to);
      ensure(e.to).in.push(e.from);
    }
  }
  return out;
}

/** Longest-path depth from any root. Used to layer the dependency map. */
function buildDepth(adjacency) {
  const depth = new Map();
  const state = new Map();
  const walk = id => {
    if (depth.has(id)) return depth.get(id);
    if (state.get(id) === 'open') return 0;           // cycle guard
    state.set(id, 'open');
    const parents = adjacency.get(id)?.in || [];
    let d = 0;
    for (const p of parents) d = Math.max(d, walk(p) + 1);
    state.set(id, 'done');
    depth.set(id, d);
    return d;
  };
  for (const t of TOPICS) walk(t.id);
  return depth;
}

/**
 * Actual extents of the drawn map, derived from the nodes rather than
 * hand-declared, so "fit" always frames the content tightly.
 */
function buildBounds(nodes) {
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  for (const n of nodes) {
    const pad = n.kind === 'hub' ? Math.max(n.clusterR || 0, n.r + 48) : n.r + 26;
    minX = Math.min(minX, n.x - pad);
    maxX = Math.max(maxX, n.x + pad);
    minY = Math.min(minY, n.y - pad);
    maxY = Math.max(maxY, n.y + pad + 30);   // room for the label under a hub
  }
  return { minX, minY, maxX, maxY, width: maxX - minX, height: maxY - minY };
}

const nodes = buildNodes();
const edges = buildEdges();
const adjacency = buildAdjacency(edges);
export const BOUNDS = buildBounds(nodes);

export const GRAPH = {
  nodes,
  edges,
  arteries: buildArteries(edges),
  adjacency,
  depth: buildDepth(adjacency),
  nodeById: Object.fromEntries(nodes.map(n => [n.id, n])),
  topicNodes: nodes.filter(n => n.kind === 'topic'),
  hubNodes: nodes.filter(n => n.kind === 'hub')
};

export function nodeFor(id) { return GRAPH.nodeById[id] || null; }
export function hubFor(domainId) { return GRAPH.nodeById[`domain:${domainId}`] || null; }
export function neighboursOf(id) {
  return GRAPH.adjacency.get(id) || { in: [], out: [], related: [] };
}

/**
 * The full prerequisite chain leading into a topic ("how did I get here").
 * Breadth-first, de-duplicated, capped so a deep chain cannot explode.
 */
export function ancestorsOf(id, limit = 60) {
  const seen = new Set([id]);
  const order = [];
  let frontier = [id];
  while (frontier.length && order.length < limit) {
    const next = [];
    for (const cur of frontier) {
      for (const p of neighboursOf(cur).in) {
        if (seen.has(p)) continue;
        seen.add(p);
        order.push(p);
        next.push(p);
      }
    }
    frontier = next;
  }
  return order;
}

/** Everything that depends on this topic ("where does this lead"). */
export function descendantsOf(id, limit = 60) {
  const seen = new Set([id]);
  const order = [];
  let frontier = [id];
  while (frontier.length && order.length < limit) {
    const next = [];
    for (const cur of frontier) {
      for (const c of neighboursOf(cur).out) {
        if (seen.has(c)) continue;
        seen.add(c);
        order.push(c);
        next.push(c);
      }
    }
    frontier = next;
  }
  return order;
}

/**
 * The single most direct path from a root topic down to `id`, used for the
 * "YOU ARE HERE" trail (BUILD.md section 39).
 */
export function trailTo(id, maxLen = 7) {
  const trail = [id];
  let cur = id;
  const guard = new Set([id]);
  while (trail.length < maxLen) {
    const parents = neighboursOf(cur).in.filter(p => !guard.has(p));
    if (!parents.length) break;
    // Prefer the deepest parent so the trail reads as a real progression.
    parents.sort((a, b) => (GRAPH.depth.get(b) || 0) - (GRAPH.depth.get(a) || 0));
    cur = parents[0];
    guard.add(cur);
    trail.unshift(cur);
  }
  return trail;
}

export { DOMAINS, DOMAIN_BY_ID };
