/**
 * TOPIC PANEL — the revision surface.
 *
 * Renders the canonical 13-section topic card (BUILD.md section 29) in Deep
 * Dive mode, and a 1-to-3-minute subset in Quick Revision mode (section 35).
 * It opens as an overlay so the map underneath is never unmounted.
 */
import { $, el, prose, inline, escapeHtml } from '../core/util.js';
import { icon } from '../components/icons.js';
import * as store from '../core/store.js';
import * as router from '../core/router.js';
import { on } from '../core/events.js';
import { STATUS_META, STATUSES } from '../core/store.js';
import { TOPIC_BY_ID, resolve, RESOURCE_KINDS, topicsInDomain } from '../../data/topics.js';
import { DOMAIN_BY_ID } from '../../data/domains.js';
import { GRAPH } from '../../data/graph.js';
import { TOOL_BY_ID } from '../../data/tools.js';
import { COMPARISON_BY_ID } from '../../data/comparisons.js';
import { toast } from '../components/shell.js';

let panel, scrim, currentId = null;

/* Sections shown in Quick Revision mode (BUILD.md section 35). */
const QUICK_SECTIONS = new Set(['what', 'why', 'diagram', 'example', 'terms', 'mistakes']);

export function openPanel(id) {
  const topic = TOPIC_BY_ID[id];
  if (!topic) { console.warn(`[panel] unknown topic "${id}"`); router.closeTopic(); return; }
  ensure();
  currentId = id;
  store.visit(id);
  render(topic);
  panel.hidden = false;
  scrim.hidden = false;
  panel.querySelector('.tp-body').scrollTop = 0;
}

export function closePanel() {
  if (!panel) return;
  panel.hidden = true;
  scrim.hidden = true;
  currentId = null;
}

function ensure() {
  if (panel) return;
  panel = $('#topic-panel');
  scrim = $('#panel-scrim');
  scrim.addEventListener('click', () => router.closeTopic());
  on('mode:change', () => { if (currentId) render(TOPIC_BY_ID[currentId]); });
  on('status:change', ({ id }) => {
    if (!currentId) return;
    if (id === currentId) syncStatusUi();
    else syncPillStatuses();
  });
}

/* ============================================================
   RENDER
   ============================================================ */

function render(t) {
  const domain = DOMAIN_BY_ID[t.domain];
  const quick = store.mode() === 'quick';
  panel.dataset.track = t.track;
  panel.dataset.status = store.statusOf(t.id);

  const siblings = topicsInDomain(t.domain);
  const idx = siblings.findIndex(s => s.id === t.id);
  const prev = siblings[idx - 1];
  const next = siblings[idx + 1];

  panel.innerHTML = '';
  panel.appendChild(header(t, domain, prev, next));

  const body = el('div.tp-body');
  if (quick) body.appendChild(quickBanner());

  let n = 0;
  const sec = (key, title, node) => {
    if (!node) return;
    if (quick && !QUICK_SECTIONS.has(key)) return;
    n++;
    const s = el('section.tp-section', { 'data-sec': key });
    s.innerHTML =
      `<div class="tp-sec-head"><span class="tp-sec-num">${String(n).padStart(2, '0')}</span>` +
      `<span class="tp-sec-title">${title}</span><span class="tp-sec-rule"></span></div>`;
    s.appendChild(node);
    body.appendChild(s);
  };

  sec('what', 'What is it?', t.what ? el('div', { html: `<div class="tp-lead">${prose(t.what)}</div>` }) : null);
  sec('why', 'Why does it exist?', t.why ? el('div', { html: prose(t.why) }) : null);
  sec('analogy', 'Real-world analogy', t.analogy ? el('div.tp-analogy', { html: prose(t.analogy) }) : null);
  sec('technical', 'Technical explanation', t.technical ? el('div', { html: prose(t.technical) }) : null);
  sec('diagram', 'Visual', t.diagram ? asciiBlock(t.diagram) : null);
  sec('example', 'Example', exampleBlock(t));
  sec('connects', 'How it connects', connectionsBlock(t));
  sec('terms', 'Key terms', termsBlock(t));
  sec('tools', 'Tools', toolsBlock(t));
  sec('use', 'When to use it', listBlock(t.useCases, '+'));
  sec('avoid', 'When not to use it', listBlock(t.avoid, '!', 'is-warn'));
  sec('mistakes', 'Common mistakes', listBlock(t.mistakes, '×', 'is-stop'));
  sec('interview', 'How to explain this out loud', interviewBlock(t));
  sec('resources', 'Go deeper', resourcesBlock(t));
  sec('questions', 'Check your understanding', questionsBlock(t));
  sec('note', 'Your notes', noteBlock(t));

  panel.appendChild(body);
  wire(t, body);
}

/* ---------------- header ---------------- */

function header(t, domain, prev, next) {
  const head = el('header.tp-head');
  head.innerHTML =
    `<div class="tp-crumbs">
       <button class="tp-domain-btn" data-domain="${t.domain}" title="Show this domain on the map">
         <span class="tp-domain"><span class="dot"></span>${escapeHtml(domain ? domain.title : t.domain)}</span>
       </button>
       <span class="sp"></span>
       <button data-nav="prev" ${prev ? `title="${escapeHtml(prev.title)}"` : 'disabled'} aria-label="Previous topic">${icon('chevronLeft')}</button>
       <button data-nav="next" ${next ? `title="${escapeHtml(next.title)}"` : 'disabled'} aria-label="Next topic">${icon('chevronRight')}</button>
       <button data-act="locate" title="Find on the map">${icon('target')}</button>
       <button data-act="pin" class="${store.isPinned(t.id) ? 'is-on' : ''}" title="Pin this topic">${icon('pin')}</button>
       <button data-act="close" title="Close (Esc)">${icon('close')}</button>
     </div>
     <h2 class="tp-title">${escapeHtml(t.title)}</h2>
     ${t.summary ? `<p class="tp-summary">${inline(t.summary)}</p>` : ''}
     <div class="tp-controls">
       <div class="status-picker" role="group" aria-label="Your status on this topic">
         ${STATUSES.map(s =>
            `<button data-set-status="${s}" data-status="${s}" class="${store.statusOf(t.id) === s ? 'is-on' : ''}">
               <span aria-hidden="true">${STATUS_META[s].glyph}</span>${STATUS_META[s].short}
             </button>`).join('')}
       </div>
       ${t.priority === 'high' ? '<span class="chip" style="color:var(--accent)"><span class="dot"></span>High priority</span>' : ''}
     </div>`;
  head.querySelector('.tp-domain-btn').style.cssText = 'display:contents';
  return head;
}

function quickBanner() {
  return el('div.tp-quick-note', {
    html: `${icon('bolt')}<span>Quick Revision — the 1&ndash;3 minute version.</span>` +
          `<button data-act="deep">Show everything</button>`
  });
}

/* ---------------- blocks ---------------- */

function asciiBlock(text) {
  const box = el('div.ascii');
  const pre = document.createElement('pre');
  pre.textContent = String(text).replace(/^\n+|\n+$/g, '');
  box.appendChild(pre);
  return box;
}

function exampleBlock(t) {
  if (!t.example) return null;
  const ex = t.example;
  if (typeof ex === 'string') return el('div', { html: prose(ex) });

  const wrap = el('div');
  if (ex.intro) wrap.appendChild(el('div', { html: prose(ex.intro) }));
  if (ex.code) {
    const code = el('div.code');
    code.innerHTML =
      `<div class="code-head"><span class="ch-lang">${escapeHtml(ex.language || 'text')}</span>` +
      `${ex.caption ? `<span class="ch-caption">${inline(ex.caption)}</span>` : ''}</div>`;
    const pre = document.createElement('pre');
    pre.textContent = String(ex.code).replace(/^\n+|\n+$/g, '');
    code.appendChild(pre);
    wrap.appendChild(code);
  }
  if (ex.after) wrap.appendChild(el('div', { html: prose(ex.after), style: 'margin-top:var(--sp-3)' }));
  return wrap;
}

function listBlock(items, mark, cls = '') {
  if (!items || !items.length) return null;
  const box = el(`div.tp-list${cls ? '.' + cls : ''}`);
  box.innerHTML = items.map(i =>
    `<div class="tp-list-item"><span class="mk">${mark}</span><span>${inline(i)}</span></div>`).join('');
  return box;
}

function pill(topic) {
  return `<button class="conn-pill" data-goto="${topic.id}" data-status="${store.statusOf(topic.id)}" data-track="${topic.track}">
            <span class="cp-dot"></span>${escapeHtml(topic.title)}
          </button>`;
}

/* A `related` entry may name a comparison rather than a topic (BUILD.md
   section 48). Those get their own group instead of being silently dropped. */
function comparisonPill(c) {
  return `<button class="conn-pill is-compare" data-compare="${c.id}">
            <span class="cp-dot"></span>${escapeHtml(c.title)}
          </button>`;
}

function connectionsBlock(t) {
  const pre = resolve(t.prereq);
  const nxt = resolve(t.next);
  const rel = resolve(t.related);
  const comparisons = (t.related || [])
    .map(id => COMPARISON_BY_ID[id])
    .filter(Boolean);
  const adj = GRAPH.adjacency.get(t.id) || { in: [], out: [] };
  // Include inbound/outbound links declared from the other side of the graph.
  const inferredIn = resolve(adj.in.filter(i => !t.prereq.includes(i)));
  const inferredOut = resolve(adj.out.filter(i => !t.next.includes(i)));
  const allPre = [...pre, ...inferredIn];
  const allNext = [...nxt, ...inferredOut];

  if (!allPre.length && !allNext.length && !rel.length && !comparisons.length) return null;

  const wrap = el('div.tp-connect');

  const ladder = el('div.tp-ladder');
  ladder.innerHTML =
    (allPre.length ? `<div class="lad-row">${allPre.slice(0, 4).map(pill).join('')}</div><div class="lad-arrow">&#9660;</div>` : '') +
    `<div class="lad-here">${escapeHtml(t.title)}</div>` +
    (allNext.length ? `<div class="lad-arrow">&#9660;</div><div class="lad-row">${allNext.slice(0, 4).map(pill).join('')}</div>` : '');
  wrap.appendChild(ladder);

  const group = (label, iconName, list) => {
    if (!list.length) return;
    const g = el('div.tp-conn-group');
    g.innerHTML =
      `<div class="cg-label">${icon(iconName)}${label}</div>` +
      `<div class="tp-conn-list">${list.map(pill).join('')}</div>`;
    wrap.appendChild(g);
  };
  group(`Prerequisites (${allPre.length})`, 'chevronLeft', allPre);
  group(`Leads to (${allNext.length})`, 'arrowRight', allNext);
  group(`Related (${rel.length})`, 'path', rel);

  if (comparisons.length) {
    const g = el('div.tp-conn-group');
    g.innerHTML =
      `<div class="cg-label">${icon('compare')}Compare with (${comparisons.length})</div>` +
      `<div class="tp-conn-list">${comparisons.map(comparisonPill).join('')}</div>`;
    wrap.appendChild(g);
  }

  if (t.connectsNote) wrap.appendChild(el('div', { html: prose(t.connectsNote) }));
  return wrap;
}

function termsBlock(t) {
  if (!t.keyTerms || !t.keyTerms.length) return null;
  const dl = el('dl.tp-terms');
  dl.innerHTML = t.keyTerms.map(k =>
    `<div class="term-row"><dt>${escapeHtml(k.term)}</dt><dd>${inline(k.def)}</dd></div>`).join('');
  return dl;
}

function toolsBlock(t) {
  if (!t.tools || !t.tools.length) return null;
  const box = el('div.tp-tools');
  box.innerHTML = t.tools.map(id => {
    const tool = TOOL_BY_ID[id];
    if (!tool) return `<span class="tool-pill">${escapeHtml(id)}</span>`;
    return `<button class="tool-pill" data-tool="${tool.id}" title="${escapeHtml(tool.what)}">
              ${escapeHtml(tool.name)}<span class="tp-badge">${tool.hosting}</span>
            </button>`;
  }).join('');
  return box;
}

function hostOf(url) {
  try { return new URL(url).hostname.replace(/^www\./, ''); }
  catch { return ''; }
}

function resourcesBlock(t) {
  if (!t.resources || !t.resources.length) return null;
  const order = { docs: 0, reference: 1, tutorial: 2, interactive: 3, video: 4, course: 5, paper: 6, repo: 7 };
  const sorted = [...t.resources].sort((a, b) => (order[a.kind] ?? 9) - (order[b.kind] ?? 9));
  const box = el('div.tp-resources');
  box.innerHTML = sorted.map(r => {
    const kind = RESOURCE_KINDS[r.kind] || RESOURCE_KINDS.docs;
    return `<a class="res-row" data-kind="${r.kind || 'docs'}" href="${escapeHtml(r.url)}" target="_blank" rel="noopener noreferrer"
               title="${escapeHtml(kind.label)}">
              <span class="res-kind">${kind.glyph}</span>
              <span class="res-body">
                <span class="res-label">${escapeHtml(r.label)}</span>
                <span class="res-host">${escapeHtml(hostOf(r.url))}</span>
              </span>
              <span class="res-go">${icon('external')}</span>
            </a>`;
  }).join('');
  return box;
}

function questionsBlock(t) {
  if (!t.questions || !t.questions.length) return null;
  const box = el('div.tp-questions');
  box.innerHTML = t.questions.map((q, i) =>
    `<div class="q-card" data-q="${i}">
       <button class="q-head"><span class="q-n">${i + 1}</span><span class="q-text">${inline(q.q)}</span>
         <span class="q-chev">${icon('chevronDown')}</span></button>
       <div class="q-answer">${prose(q.a)}</div>
     </div>`).join('');
  return box;
}

function interviewBlock(t) {
  const iv = t.interview;
  if (!iv) return null;
  const rows = [
    ['30 seconds', iv.s30],
    ['90 seconds', iv.s90],
    ['Technical answer', iv.technical],
    ['Product-manager answer', iv.pm],
    ['Real-world example', iv.example]
  ].filter(([, v]) => v);
  if (!rows.length) return null;
  const box = el('div.tp-interview');
  box.innerHTML = rows.map(([label, text]) =>
    `<div class="iv-block"><div class="iv-label">${label}</div><p>${inline(text)}</p></div>`).join('');
  return box;
}

function noteBlock(t) {
  const box = el('div.tp-note');
  const ta = el('textarea', {
    placeholder: 'Anything you want to remember about this topic — your own wording, a link, a question you still have…',
    'aria-label': 'Your notes'
  });
  ta.value = store.noteOf(t.id);
  let timer;
  ta.addEventListener('input', () => {
    clearTimeout(timer);
    timer = setTimeout(() => store.setNote(t.id, ta.value), 400);
  });
  box.appendChild(ta);
  return box;
}

/* ============================================================
   WIRING
   ============================================================ */

function wire(t, body) {
  panel.querySelector('.tp-crumbs').addEventListener('click', e => {
    const nav = e.target.closest('[data-nav]');
    if (nav) {
      const siblings = topicsInDomain(t.domain);
      const i = siblings.findIndex(s => s.id === t.id);
      const target = nav.dataset.nav === 'prev' ? siblings[i - 1] : siblings[i + 1];
      if (target) router.openTopic(target.id);
      return;
    }
    const act = e.target.closest('[data-act]');
    if (!act) return;
    if (act.dataset.act === 'close') router.closeTopic();
    if (act.dataset.act === 'pin') {
      const on = store.togglePin(t.id);
      act.classList.toggle('is-on', on);
      toast(on ? 'Pinned' : 'Unpinned', 'pin');
    }
    if (act.dataset.act === 'locate') {
      router.setView('map');
      import('./map.js').then(m => m.focusTopic(t.id));
    }
  });

  panel.querySelector('.status-picker').addEventListener('click', e => {
    const b = e.target.closest('[data-set-status]');
    if (!b) return;
    store.setStatus(t.id, b.dataset.setStatus);
    toast(`${t.title}: ${STATUS_META[b.dataset.setStatus].label}`, 'check');
  });

  body.addEventListener('click', e => {
    const goto = e.target.closest('[data-goto]');
    if (goto) { router.openTopic(goto.dataset.goto); return; }

    const cmp = e.target.closest('[data-compare]');
    if (cmp) {
      router.closeTopic();
      router.go('compare', { c: cmp.dataset.compare });
      return;
    }

    const q = e.target.closest('.q-head');
    if (q) {
      const card = q.closest('.q-card');
      card.classList.toggle('is-open');
      if (card.classList.contains('is-open')) store.markAnswered(t.id, Number(card.dataset.q));
      return;
    }

    const deep = e.target.closest('[data-act="deep"]');
    if (deep) { store.setMode('deep'); return; }

    const tool = e.target.closest('[data-tool]');
    if (tool) {
      router.go('tools', { tool: tool.dataset.tool });
      return;
    }
  });
}

function syncStatusUi() {
  if (!panel || panel.hidden) return;
  const status = store.statusOf(currentId);
  panel.dataset.status = status;
  for (const b of panel.querySelectorAll('[data-set-status]')) {
    b.classList.toggle('is-on', b.dataset.setStatus === status);
  }
}

function syncPillStatuses() {
  for (const p of panel.querySelectorAll('[data-goto]')) {
    p.dataset.status = store.statusOf(p.dataset.goto);
  }
}
