/**
 * DASHBOARD (BUILD.md section 50)
 * "YOUR PREPARATION" — overall progress, current topic, recently studied,
 * needs revision, high priority, streak, recommended next.
 */
import { $, el, escapeHtml, relativeDay, todayKey, daysBetween } from '../core/util.js';
import { icon } from '../components/icons.js';
import { ringNode } from '../components/shell.js';
import * as store from '../core/store.js';
import * as router from '../core/router.js';
import { on } from '../core/events.js';
import { STATUS_META, STATUSES } from '../core/store.js';
import { TOPIC_BY_ID, resolve } from '../../data/topics.js';
import { TRACK_BY_ID } from '../../data/tracks.js';
import {
  overall, byTrack, byDomain, needsRevision, learningNow,
  recommended, highPriority
} from '../core/progress.js';

let host;

export function mount(node) {
  host = node;
  host.innerHTML = '<div class="view-scroll"><div class="page" id="dash-page"></div></div>';
  render();

  host.addEventListener('click', e => {
    const t = e.target.closest('[data-topic]');
    if (t) { router.openTopic(t.dataset.topic); return; }
    const v = e.target.closest('[data-goview]');
    if (v) { router.setView(v.dataset.goview); return; }
    const f = e.target.closest('[data-filter-track]');
    if (f) {
      store.setFilters({ tracks: [f.dataset.filterTrack], status: 'all' });
      router.setView('map');
      return;
    }
    const s = e.target.closest('[data-set-status-for]');
    if (s) {
      store.setStatus(s.dataset.setStatusFor, s.dataset.status);
      e.stopPropagation();
    }
  });

  on('progress:change', render);
  on('recent:change', render);
  on('status:change', render);
}

export function activate() { render(); }

/* ============================================================ */

function render() {
  if (!host) return;
  const page = $('#dash-page', host);
  if (!page) return;

  const o = overall();
  const streak = store.refreshStreak();
  const review = needsRevision();
  const learning = learningNow();
  const next = recommended(6);
  const recent = resolve(store.recent().map(r => r.id)).slice(0, 6);
  const pinned = resolve(store.get().pinned).slice(0, 6);

  page.innerHTML =
    hero(o, streak, learning, review) +
    trackProgress() +
    section('Continue where you left off', recent.length,
      recent.length ? cardGrid(recent) : empty('Open a topic from the map and it will appear here.')) +
    (review.length ? section('Needs revision', review.length, cardGrid(review.slice(0, 6))) : '') +
    (learning.length ? section('Learning now', learning.length, cardGrid(learning.slice(0, 6))) : '') +
    section('Recommended next', next.length, next.length
      ? cardGrid(next, t => `${Math.round((t.readiness ?? 1) * 100)}% ready`)
      : empty('Nothing to recommend — you have started everything.')) +
    (pinned.length ? section('Pinned', pinned.length, cardGrid(pinned)) : '') +
    section('High priority', highPriority().length,
      cardGrid(highPriority().filter(t => store.statusOf(t.id) !== 'mastered').slice(0, 6))) +
    domainTable() +
    quickLinks();

  mountRing(o.percent);
}

/* ---------------- hero ---------------- */

function hero(o, streak, learning, review) {
  const c = o.counts;
  return `
  <section class="dash-hero">
    <div class="dh-grid">
      <div>
        <div class="dh-eyebrow">Your preparation</div>
        <h1 class="dh-title">${greeting()}</h1>
        <p class="dh-lede">${lede(o, review.length, learning.length)}</p>
        <div class="dh-meta">
          ${meta(o.total, 'Topics')}
          ${meta(c.learning, 'Learning')}
          ${meta(c.review, 'To revise')}
          ${meta(c.completed + c.mastered, 'Completed')}
          ${meta(streak.current || 0, 'Day streak')}
        </div>
      </div>
      <div class="dh-ring" id="dash-ring"></div>
    </div>
  </section>
  ${statusBar(o)}
  ${streakStrip(streak)}`;
}

function meta(n, label) {
  return `<div class="dm"><span class="dm-num">${n}</span><span class="dm-lab">${label}</span></div>`;
}

function greeting() {
  const h = new Date().getHours();
  if (h < 5) return 'Still going.';
  if (h < 12) return 'Where you are this morning.';
  if (h < 18) return 'Where you are today.';
  return 'Where you are tonight.';
}

function lede(o, review, learning) {
  if (o.touched === 0) {
    return 'Nothing marked yet. Open the map, pick a topic that looks useful, and set its status as you go — everything on this page fills in from that.';
  }
  const parts = [];
  parts.push(`You have touched <strong>${o.touched}</strong> of ${o.total} topics and completed <strong>${o.done}</strong>.`);
  if (review) parts.push(`<strong>${review}</strong> ${review === 1 ? 'is' : 'are'} marked for revision.`);
  if (learning) parts.push(`<strong>${learning}</strong> in progress.`);
  return parts.join(' ');
}

function statusBar(o) {
  const c = o.counts;
  const pct = n => (o.total ? (n / o.total) * 100 : 0);
  return `
  <div style="margin-bottom:var(--sp-7)">
    <div class="bar" style="height:10px">
      <span class="seg-mastered"  style="width:${pct(c.mastered)}%"  title="Mastered: ${c.mastered}"></span>
      <span class="seg-completed" style="width:${pct(c.completed)}%" title="Completed: ${c.completed}"></span>
      <span class="seg-review"    style="width:${pct(c.review)}%"    title="Needs review: ${c.review}"></span>
      <span class="seg-learning"  style="width:${pct(c.learning)}%"  title="Learning: ${c.learning}"></span>
    </div>
    <div style="display:flex;flex-wrap:wrap;gap:var(--sp-4);margin-top:var(--sp-3)">
      ${STATUSES.slice().reverse().map(s => `
        <span class="hint" data-status="${s}">
          <span style="width:9px;height:9px;border-radius:50%;display:inline-block;
            background:${s === 'not-started' ? 'transparent' : 'hsl(var(--status-h) var(--status-s) var(--lum))'};
            ${s === 'not-started' ? 'box-shadow:inset 0 0 0 1.5px var(--line-strong)' : ''}"></span>
          ${STATUS_META[s].label} · ${c[s]}
        </span>`).join('')}
    </div>
  </div>`;
}

function streakStrip(streak) {
  const days = new Set(streak.days || []);
  const today = todayKey();
  const cells = [];
  for (let i = 27; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = todayKey(d);
    cells.push(`<span class="streak-cell ${days.has(key) ? 'is-on' : ''} ${key === today ? 'is-today' : ''}" title="${key}"></span>`);
  }
  return `
  <div class="section-head">
    <h2>Activity</h2>
    <span class="sh-count">last 28 days · best streak ${streak.best || 0}</span>
    <span class="sh-rule"></span>
  </div>
  <div class="streak-strip" style="margin-bottom:var(--sp-7)">${cells.join('')}</div>`;
}

/* ---------------- track progress ---------------- */

function trackProgress() {
  const rows = byTrack().sort((a, b) => b.percent - a.percent);
  return `
  <div class="section-head">
    <h2>Progress by track</h2>
    <span class="sh-count">click a track to filter the map</span>
    <span class="sh-rule"></span>
  </div>
  <div class="track-rows" style="margin-bottom:var(--sp-7)">
    ${rows.map(t => `
      <div class="track-row" data-track="${t.id}">
        <span class="tr-name"><span class="dot"></span>${t.label}</span>
        <div class="bar" data-filter-track="${t.id}" title="${t.done} of ${t.total} done — filter the map">
          <span class="seg-mastered"  style="width:${pctOf(t, 'mastered')}%"></span>
          <span class="seg-completed" style="width:${pctOf(t, 'completed')}%"></span>
          <span class="seg-review"    style="width:${pctOf(t, 'review')}%"></span>
          <span class="seg-learning"  style="width:${pctOf(t, 'learning')}%"></span>
        </div>
        <span class="tr-pct">${t.percent}%</span>
      </div>`).join('')}
  </div>`;
}

function pctOf(t, status) {
  return t.total ? ((t.counts[status] / t.total) * 100).toFixed(1) : 0;
}

/* ---------------- topic cards ---------------- */

function section(title, count, body) {
  return `
  <div class="section-head">
    <h2>${title}</h2>
    <span class="sh-count">${count}</span>
    <span class="sh-rule"></span>
  </div>
  ${body}`;
}

function cardGrid(topics, badgeFn) {
  if (!topics.length) return empty('Nothing here yet.');
  return `<div class="grid grid-3" style="margin-bottom:var(--sp-7)">
    ${topics.map(t => topicCard(t, badgeFn)).join('')}</div>`;
}

function topicCard(t, badgeFn) {
  const status = store.statusOf(t.id);
  const badge = badgeFn ? badgeFn(t) : STATUS_META[status].label;
  return `
  <button class="topic-card" data-topic="${t.id}" data-track="${t.track}" data-status="${status}">
    <span class="tc-top">
      <span class="tc-domain">${escapeHtml(t.domainTitle)}</span>
      <span class="tc-sp"></span>
      <span class="tc-dot"></span>
    </span>
    <span class="tc-title">${escapeHtml(t.title)}</span>
    <span class="tc-sum">${escapeHtml(t.summary || '')}</span>
    <span class="tc-foot">
      ${escapeHtml(badge)}
      ${t.priority === 'high' ? ' · high priority' : ''}
    </span>
  </button>`;
}

function empty(message) {
  return `<div class="empty" style="margin-bottom:var(--sp-7)">
    ${icon('info')}<div class="empty-sub">${message}</div></div>`;
}

/* ---------------- domain table ---------------- */

function domainTable() {
  const rows = byDomain().filter(d => d.total > 0).sort((a, b) => b.total - a.total);
  return `
  <div class="section-head">
    <h2>Every domain</h2>
    <span class="sh-count">${rows.length} domains</span>
    <span class="sh-rule"></span>
  </div>
  <div class="track-rows" style="margin-bottom:var(--sp-7)">
    ${rows.map(d => `
      <div class="track-row" data-track="${d.track}">
        <span class="tr-name"><span class="dot"></span>${escapeHtml(d.short)}</span>
        <div class="bar" title="${d.done} of ${d.total} done">
          <span class="seg-mastered"  style="width:${pctOf(d, 'mastered')}%"></span>
          <span class="seg-completed" style="width:${pctOf(d, 'completed')}%"></span>
          <span class="seg-review"    style="width:${pctOf(d, 'review')}%"></span>
          <span class="seg-learning"  style="width:${pctOf(d, 'learning')}%"></span>
        </div>
        <span class="tr-pct">${d.total}</span>
      </div>`).join('')}
  </div>`;
}

/* ---------------- quick links ---------------- */

function quickLinks() {
  const links = [
    ['map', 'map', 'Preparation Map', 'See the whole landscape and how it connects.'],
    ['graph', 'graph', 'Dependency Map', 'What must be understood before what.'],
    ['practice', 'practice', 'Practice', 'Check whether you could actually explain it.'],
    ['compare', 'compare', 'Comparisons', 'The distinctions people ask you about.'],
    ['tools', 'tools', 'Tools Ecosystem', 'What each tool is for, and when to use it.']
  ];
  return `
  <div class="section-head"><h2>Go somewhere</h2><span class="sh-rule"></span></div>
  <div class="grid grid-3">
    ${links.map(([view, ic, title, desc]) => `
      <button class="card is-link nav-card" data-goview="${view}">
        <span class="nav-card-head">
          <span class="nav-card-icon">${icon(ic)}</span>
          <span class="nav-card-title">${title}</span>
        </span>
        <span class="nav-card-desc">${desc}</span>
      </button>`).join('')}
  </div>`;
}

/** The hero ring is a real SVG, so it is appended after the HTML is written. */
function mountRing(percent) {
  const slot = $('#dash-ring', host);
  if (!slot) return;
  slot.innerHTML = '';
  const ring = ringNode(percent, 132, 8, `${percent}%`);
  ring.classList.add('is-large');
  slot.appendChild(ring);
  slot.insertAdjacentHTML('beforeend', '<span class="dr-cap">Overall</span>');
}
