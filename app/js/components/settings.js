/**
 * Settings overlay: theme, progress data (export / import / reset) and the
 * keyboard shortcut reference. Everything here is local-only.
 */
import { $, el } from '../core/util.js';
import { icon } from './icons.js';
import * as store from '../core/store.js';
import { toast } from './shell.js';
import { overall } from '../core/progress.js';

let overlay, built = false;

const SHORTCUTS = [
  ['Ctrl K  /  /', 'Open search'],
  ['G', 'Preparation Map'],
  ['D', 'Dashboard'],
  ['M', 'Dependency Map'],
  ['T', 'Tools'],
  ['C', 'Comparisons'],
  ['P', 'Practice'],
  ['Q', 'Toggle Quick Revision / Deep Dive'],
  ['Esc', 'Close the topic panel'],
  ['Scroll / pinch', 'Zoom the map'],
  ['Drag', 'Pan the map']
];

export function openSettings() {
  build();
  overlay.hidden = false;
  refresh();
}
function closeSettings() { if (overlay) overlay.hidden = true; }

function build() {
  if (built) return;
  built = true;
  overlay = $('#overlay-settings');
  overlay.innerHTML =
    `<div class="overlay-panel settings-panel" role="dialog" aria-modal="true" aria-label="Settings">
       <div class="set-head">
         <h2>Settings &amp; data</h2>
         <button class="btn is-ghost is-icon" data-act="close" aria-label="Close">${icon('close')}</button>
       </div>
       <div class="set-body u-scroll">

         <section class="set-sec">
           <h3>Appearance</h3>
           <div class="set-row">
             <div><div class="set-label">Theme</div><div class="set-help">Dark is the default; light is a warm paper tone.</div></div>
             <div class="mode-switch" id="set-theme">
               <button data-theme="dark">Dark</button><button data-theme="light">Light</button>
             </div>
           </div>
           <div class="set-row">
             <div><div class="set-label">Reading depth</div><div class="set-help">Quick Revision shows the 1&ndash;3 minute version of every topic.</div></div>
             <div class="mode-switch" id="set-mode">
               <button data-mode="quick">Quick</button><button data-mode="deep">Deep Dive</button>
             </div>
           </div>
         </section>

         <section class="set-sec">
           <h3>Your progress</h3>
           <div class="set-stats" id="set-stats"></div>
           <div class="set-help" style="margin-top:var(--sp-3)">
             Everything is stored in this browser only, under <code>localStorage</code>. Nothing is uploaded anywhere.
             Export a backup before clearing browser data.
           </div>
           <div class="set-actions">
             <button class="btn" data-act="export">${icon('arrowUpRight')}Export backup</button>
             <button class="btn" data-act="import">${icon('refresh')}Import backup</button>
             <button class="btn set-danger" data-act="reset">Reset all progress</button>
           </div>
           <input type="file" id="set-file" accept="application/json" hidden>
         </section>

         <section class="set-sec">
           <h3>Keyboard</h3>
           <div class="set-keys">
             ${SHORTCUTS.map(([k, v]) =>
               `<div class="set-key-row"><kbd class="key">${k}</kbd><span>${v}</span></div>`).join('')}
           </div>
         </section>

         <section class="set-sec">
           <h3>About</h3>
           <div class="set-help">
             <strong>Preparation Map</strong> is a local, offline-first knowledge atlas. No server, no account,
             no network calls &mdash; only the external documentation links open the internet, and only when you click them.
           </div>
         </section>
       </div>
     </div>`;

  overlay.addEventListener('mousedown', e => { if (e.target === overlay) closeSettings(); });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && !overlay.hidden) { e.preventDefault(); closeSettings(); }
  });

  overlay.addEventListener('click', e => {
    const b = e.target.closest('[data-act]');
    if (b) return act(b.dataset.act);
    const th = e.target.closest('[data-theme]');
    if (th) { store.setTheme(th.dataset.theme); refresh(); return; }
    const md = e.target.closest('[data-mode]');
    if (md) { store.setMode(md.dataset.mode); refresh(); }
  });

  $('#set-file').addEventListener('change', async e => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      store.importJson(await file.text());
      toast('Progress restored', 'check');
      refresh();
    } catch (err) {
      toast('That file could not be read', 'info');
      console.error('[settings] import failed', err);
    }
    e.target.value = '';
  });
}

function act(name) {
  if (name === 'close') return closeSettings();
  if (name === 'export') {
    const blob = new Blob([store.exportJson()], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `preparation-map-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 2000);
    toast('Backup downloaded', 'check');
  }
  if (name === 'import') $('#set-file').click();
  if (name === 'reset') {
    if (confirm('Reset every topic status, note and streak? This cannot be undone.\n\nExport a backup first if you are unsure.')) {
      store.resetAll();
      toast('Progress reset', 'refresh');
      refresh();
    }
  }
}

function refresh() {
  if (!built) return;
  for (const b of overlay.querySelectorAll('#set-theme [data-theme]')) {
    b.classList.toggle('is-active', b.dataset.theme === store.theme());
  }
  for (const b of overlay.querySelectorAll('#set-mode [data-mode]')) {
    b.classList.toggle('is-active', b.dataset.mode === store.mode());
  }
  const o = overall();
  const s = store.streak();
  $('#set-stats').innerHTML =
    [[`${o.percent}%`, 'Prepared'], [o.done, 'Completed'], [o.counts.review, 'To revise'],
     [o.total, 'Topics'], [s.current || 0, 'Day streak'], [s.best || 0, 'Best streak']]
    .map(([n, l]) => `<div class="set-stat"><span class="ss-num">${n}</span><span class="ss-lab">${l}</span></div>`).join('');
}
