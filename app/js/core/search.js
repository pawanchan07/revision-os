/**
 * Global search index (BUILD.md section 33).
 *
 * Indexes topics, tools, domains and comparisons across every text field —
 * titles, definitions, key terms, tool names, resource labels — so searching
 * "groundedness" surfaces Evaluation, RAG, LLM-as-Judge and Hallucination,
 * not just the one topic that happens to be called Groundedness.
 */
import { TOPICS } from '../../data/topics.js';
import { TOOLS } from '../../data/tools.js';
import { DOMAINS } from '../../data/domains.js';
import { COMPARISONS } from '../../data/comparisons.js';

const STOP = new Set(['the', 'a', 'an', 'of', 'to', 'and', 'or', 'is', 'it', 'in', 'for', 'on', 'that', 'this', 'with', 'as', 'be', 'are', 'you', 'your', 'what', 'why', 'how', 'when']);

function tokens(text) {
  return String(text || '')
    .toLowerCase()
    .split(/[^a-z0-9+#.]+/)
    .filter(w => w.length > 1 && !STOP.has(w));
}

/** Weighted field bag: heavier fields win ties. */
function entryFor(kind, id, title, subtitle, meta, fields) {
  const bag = new Map();
  for (const [text, weight] of fields) {
    for (const w of tokens(text)) bag.set(w, Math.max(bag.get(w) || 0, weight));
  }
  return { kind, id, title, subtitle, meta, bag, titleLower: String(title).toLowerCase() };
}

function buildIndex() {
  const out = [];

  for (const t of TOPICS) {
    out.push(entryFor('topic', t.id, t.title, t.domainTitle, t, [
      [t.title, 10],
      [t.summary, 6],
      [(t.keyTerms || []).map(k => k.term).join(' '), 6],
      [t.what, 4],
      [t.why, 3],
      [t.analogy, 2],
      [t.technical, 3],
      [(t.keyTerms || []).map(k => k.def).join(' '), 2],
      [(t.useCases || []).join(' '), 2],
      [(t.mistakes || []).join(' '), 2],
      [(t.avoid || []).join(' '), 2],
      [(t.tools || []).join(' '), 3],
      [(t.resources || []).map(r => r.label).join(' '), 1],
      [(t.questions || []).map(q => q.q).join(' '), 1],
      [t.domainTitle, 2]
    ]));
  }

  for (const tool of TOOLS) {
    out.push(entryFor('tool', tool.id, tool.name, 'Tool', tool, [
      [tool.name, 10],
      [tool.what, 5],
      [tool.why, 3],
      [tool.when, 3],
      [(tool.alternatives || []).join(' '), 3],
      [tool.pmNote, 2]
    ]));
  }

  for (const d of DOMAINS) {
    out.push(entryFor('domain', d.id, d.title, 'Domain', d, [
      [d.title, 10], [d.short, 8], [d.blurb, 4]
    ]));
  }

  for (const c of COMPARISONS) {
    out.push(entryFor('comparison', c.id, c.title, 'Comparison', c, [
      [c.title, 10], [c.a.label, 7], [c.b.label, 7], [c.verdict, 3], [c.summary, 4]
    ]));
  }

  return out;
}

let INDEX = null;
function index() {
  if (!INDEX) INDEX = buildIndex();
  return INDEX;
}

const KIND_RANK = { topic: 0, comparison: 1, tool: 2, domain: 3 };

export function search(query, limit = 30) {
  const q = String(query || '').trim().toLowerCase();
  if (!q) return [];
  const words = tokens(q);
  if (!words.length) return [];

  const results = [];
  for (const entry of index()) {
    let score = 0;
    let matchedAll = true;

    for (const w of words) {
      let best = 0;
      // exact token hit
      if (entry.bag.has(w)) best = entry.bag.get(w) * 3;
      else {
        // prefix hit on any indexed token
        for (const [token, weight] of entry.bag) {
          if (token.startsWith(w)) { best = Math.max(best, weight * 1.6); }
          else if (w.length > 3 && token.includes(w)) { best = Math.max(best, weight * 0.8); }
        }
      }
      if (best === 0) matchedAll = false;
      score += best;
    }

    if (!score) continue;
    if (!matchedAll) score *= 0.35;
    if (entry.titleLower === q) score += 120;
    else if (entry.titleLower.startsWith(q)) score += 60;
    else if (entry.titleLower.includes(q)) score += 24;

    results.push({ ...entry, score });
  }

  return results
    .sort((a, b) => b.score - a.score || KIND_RANK[a.kind] - KIND_RANK[b.kind] || a.title.localeCompare(b.title))
    .slice(0, limit);
}

/** Highlight the matched fragments of a label for display. */
export function highlight(text, query) {
  const words = tokens(query).sort((a, b) => b.length - a.length);
  const safe = escape(String(text));
  if (!words.length) return safe;
  const re = new RegExp(`(${words.map(escapeRe).join('|')})`, 'ig');
  return safe.replace(re, '<mark>$1</mark>');
}

function escapeRe(s) { return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }
function escape(s) {
  return String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
}
