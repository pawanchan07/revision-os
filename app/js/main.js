/**
 * Preparation Map — entry point.
 *
 * Boots the shell, wires the router to lazily-loaded views, installs global
 * keyboard shortcuts, then reveals the app.
 */
import { $, $$ } from './core/util.js';
import * as store from './core/store.js';
import * as router from './core/router.js';
import { on } from './core/events.js';
import { mountShell, toast } from './components/shell.js';
import { validate } from '../data/topics.js';

/* ---------------- view registry ---------------- */

const LOADERS = {
  map:       () => import('./views/map.js'),
  dashboard: () => import('./views/dashboard.js'),
  graph:     () => import('./views/graph.js'),
  tools:     () => import('./views/tools.js'),
  compare:   () => import('./views/compare.js'),
  practice:  () => import('./views/practice.js'),
  about:     () => import('./views/about.js')
};

const loaded = new Map();
const loading = new Map();          // in-flight mounts, so a view never mounts twice
let activeView = null;

async function showView(name) {
  const host = document.getElementById(`view-${name}`);
  if (!host) return;

  for (const v of $$('.view')) v.classList.toggle('is-active', v.id === `view-${name}`);

  if (activeView && activeView !== name) {
    loaded.get(activeView)?.deactivate?.();
  }
  activeView = name;

  if (!loaded.has(name)) {
    try {
      // Two calls can race (router emit + explicit boot call). Share one promise.
      if (!loading.has(name)) {
        loading.set(name, LOADERS[name]().then(mod => { mod.mount(host); return mod; }));
      }
      const mod = await loading.get(name);
      loaded.set(name, mod);
    } catch (err) {
      loading.delete(name);
      console.error(`[main] failed to load view "${name}"`, err);
      host.innerHTML =
        `<div class="page"><div class="empty"><div class="empty-title">This view failed to load</div>` +
        `<div class="empty-sub">${String(err.message || err)}</div></div></div>`;
      return;
    }
  }
  loaded.get(name)?.activate?.();
}

/* ---------------- topic panel ---------------- */

let panelModule = null;
async function syncTopicPanel(id) {
  if (!panelModule) panelModule = await import('./views/topic-panel.js');
  if (id) panelModule.openPanel(id);
  else panelModule.closePanel();
}

/* ---------------- keyboard ---------------- */

function installShortcuts() {
  document.addEventListener('keydown', async e => {
    const typing = /^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName) || e.target.isContentEditable;

    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      (await import('./views/search.js')).openSearch();
      return;
    }
    if (e.key === '/' && !typing) {
      e.preventDefault();
      (await import('./views/search.js')).openSearch();
      return;
    }
    if (e.key === 'Escape') {
      const anyOverlay = $$('.overlay:not([hidden])');
      if (anyOverlay.length) return;               // overlays close themselves
      if (router.route().topic) router.closeTopic();
      return;
    }
    if (typing || e.ctrlKey || e.metaKey || e.altKey) return;

    const map = { g: 'map', d: 'dashboard', m: 'graph', t: 'tools', c: 'compare', p: 'practice' };
    if (map[e.key.toLowerCase()]) {
      router.setView(map[e.key.toLowerCase()]);
      return;
    }
    if (e.key.toLowerCase() === 'q') {
      store.setMode(store.mode() === 'quick' ? 'deep' : 'quick');
      toast(store.mode() === 'quick' ? 'Quick Revision mode' : 'Deep Dive mode', 'bolt');
      return;
    }
    if (e.key === '?') {
      router.setView('about');
    }
  });
}

/* ---------------- boot ---------------- */

async function boot() {
  document.documentElement.dataset.theme = store.theme();
  store.refreshStreak();

  const problems = validate();
  if (problems.length) {
    console.warn(`[data] ${problems.length} dangling reference(s):`, problems);
  }

  // Reveal the shell *before* mounting any view. The boot screen still covers
  // it, but views can now measure themselves — a hidden container reports a
  // width of 0, which would make the map fit to fallback dimensions.
  document.getElementById('app').classList.remove('u-hidden');

  mountShell();
  installShortcuts();

  on('route:view', ({ view }) => showView(view));
  on('route:topic', ({ topic }) => syncTopicPanel(topic));

  const initial = router.start();
  await showView(initial.view);
  if (initial.topic) await syncTopicPanel(initial.topic);

  // setTimeout rather than requestAnimationFrame: rAF is suspended while the
  // tab is backgrounded, which would leave the boot screen stuck on top.
  setTimeout(() => document.getElementById('boot').classList.add('is-done'), 0);
}

boot().catch(err => {
  console.error('[main] boot failed', err);
  const box = document.getElementById('boot-error');
  if (box) {
    box.classList.remove('u-hidden');
    box.textContent = `Boot failed: ${err.message || err}`;
  }
});
