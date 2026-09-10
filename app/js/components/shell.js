/**
 * The persistent chrome: left rail, top bar, theme + mode switches,
 * the global progress ring, and toasts.
 */
import { $, el } from '../core/util.js';
import { icon } from './icons.js';
import * as store from '../core/store.js';
import * as router from '../core/router.js';
import { on } from '../core/events.js';
import { overall } from '../core/progress.js';

const NAV = [
  { view: 'map',       icon: 'map',       label: 'Preparation Map', sub: 'Your complete learning landscape' },
  { view: 'dashboard', icon: 'dashboard', label: 'Dashboard',       sub: 'Where you are and what to do next' },
  { view: 'graph',     icon: 'graph',     label: 'Dependency Map',  sub: 'What must be understood before what' },
  { view: 'tools',     icon: 'tools',     label: 'Tools Ecosystem', sub: 'What each tool is for, and when to use it' },
  { view: 'compare',   icon: 'compare',   label: 'Comparisons',     sub: 'The distinctions people ask you about' },
  { view: 'practice',  icon: 'practice',  label: 'Practice',        sub: 'Prove to yourself that you actually know it' },
  { view: 'about',     icon: 'info',      label: 'About & help',    sub: 'What this is and how to use it' }
];

export function mountShell() {
  mountRail();
  mountTopbar();
  mountRing();

  on('route:view', ({ view }) => {
    syncRail(view);
    const meta = NAV.find(n => n.view === view);
    $('#topbar-sub').textContent = meta ? meta.sub : '';
  });
  on('progress:change', mountRing);
  on('mode:change', syncMode);
  on('theme:change', syncTheme);
}

/* ---------------- rail ---------------- */

function mountRail() {
  const nav = $('#rail-nav');
  nav.innerHTML = NAV.map(n =>
    `<button class="rail-btn" data-view="${n.view}" data-tip="${n.label}" aria-label="${n.label}">${icon(n.icon)}</button>`
  ).join('');
  nav.addEventListener('click', e => {
    const btn = e.target.closest('[data-view]');
    if (btn) router.setView(btn.dataset.view);
  });

  const theme = $('#btn-theme');
  theme.addEventListener('click', () => store.toggleTheme());
  syncTheme(store.theme());

  $('#btn-settings').innerHTML = icon('settings');
  $('#btn-settings').addEventListener('click', () => {
    import('./settings.js').then(m => m.openSettings());
  });

  syncRail(router.route().view);
}

function syncRail(view) {
  for (const btn of document.querySelectorAll('#rail-nav .rail-btn')) {
    btn.classList.toggle('is-active', btn.dataset.view === view);
  }
}

function syncTheme(theme) {
  const btn = $('#btn-theme');
  if (!btn) return;
  btn.innerHTML = icon(theme === 'dark' ? 'sun' : 'moon');
  btn.dataset.tip = theme === 'dark' ? 'Switch to light' : 'Switch to dark';
}

/* ---------------- top bar ---------------- */

function mountTopbar() {
  $('#btn-search').querySelector('.st-icon').innerHTML = icon('search');
  $('#btn-search').addEventListener('click', () => {
    import('../views/search.js').then(m => m.openSearch());
  });

  for (const btn of document.querySelectorAll('.mode-switch button')) {
    btn.addEventListener('click', () => store.setMode(btn.dataset.mode));
  }
  syncMode(store.mode());
}

function syncMode(mode) {
  for (const btn of document.querySelectorAll('.mode-switch button')) {
    btn.classList.toggle('is-active', btn.dataset.mode === mode);
  }
}

/* ---------------- progress ring ---------------- */

export function ringNode(percent, size = 34, stroke = 3, label = null) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const wrap = el('div.ring', { style: `width:${size}px;height:${size}px` });
  wrap.innerHTML =
    `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">` +
      `<circle class="ring-track" cx="${size / 2}" cy="${size / 2}" r="${r}" stroke-width="${stroke}"/>` +
      `<circle class="ring-fill" cx="${size / 2}" cy="${size / 2}" r="${r}" stroke-width="${stroke}" ` +
        `stroke-dasharray="${c.toFixed(2)}" stroke-dashoffset="${(c * (1 - percent / 100)).toFixed(2)}"/>` +
    `</svg>` +
    `<span class="ring-label">${label ?? percent}</span>`;
  return wrap;
}

function mountRing() {
  const host = $('#topbar-progress');
  if (!host) return;
  const { percent, done, total } = overall();
  host.innerHTML = '';
  const ring = ringNode(percent, 34, 3);
  ring.title = `${percent}% overall — ${done} of ${total} topics completed or mastered. Click for the dashboard.`;
  ring.addEventListener('click', () => router.setView('dashboard'));
  host.appendChild(ring);
}

/* ---------------- toasts ---------------- */

export function toast(message, iconName = 'check') {
  const stack = $('#toasts');
  if (!stack) return;
  const node = el('div.toast', { html: `${icon(iconName)}<span></span>` });
  node.querySelector('span').textContent = message;
  stack.appendChild(node);
  setTimeout(() => {
    node.classList.add('is-out');
    setTimeout(() => node.remove(), 260);
  }, 2100);
}
