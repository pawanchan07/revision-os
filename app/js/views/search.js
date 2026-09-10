/**
 * Global search overlay / command palette (Ctrl+K or /).
 * Searches topics, tools, domains and comparisons in one list.
 */
import { $, el, debounce, escapeHtml } from '../core/util.js';
import { icon } from '../components/icons.js';
import { search, highlight } from '../core/search.js';
import * as router from '../core/router.js';
import * as store from '../core/store.js';
import { STATUS_META } from '../core/store.js';
import { recommended, needsRevision, learningNow } from '../core/progress.js';

let overlay, input, list, results = [], cursor = 0, built = false;

const KIND_LABEL = { topic: 'Topic', tool: 'Tool', domain: 'Domain', comparison: 'Comparison' };
const KIND_ICON = { topic: 'book', tool: 'tools', domain: 'layers', comparison: 'compare' };

export function openSearch(prefill = '') {
  build();
  overlay.hidden = false;
  input.value = prefill;
  input.focus();
  input.select();
  update();
}

export function closeSearch() {
  if (overlay) overlay.hidden = true;
}

function build() {
  if (built) return;
  built = true;
  overlay = $('#overlay-search');
  overlay.innerHTML =
    `<div class="overlay-panel search-panel" role="dialog" aria-modal="true" aria-label="Search">
       <div class="sp-input">
         <span class="sp-icon">${icon('search')}</span>
         <input id="search-input" type="text" autocomplete="off" spellcheck="false"
                placeholder="Search topics, tools, terms, resources…" aria-label="Search">
         <kbd class="key">Esc</kbd>
       </div>
       <div class="sp-results u-scroll" id="search-results"></div>
       <div class="sp-foot">
         <span><kbd class="key">&uarr;</kbd><kbd class="key">&darr;</kbd> navigate</span>
         <span><kbd class="key">&crarr;</kbd> open</span>
         <span class="sp-foot-sp"></span>
         <span id="search-count"></span>
       </div>
     </div>`;

  input = $('#search-input');
  list = $('#search-results');

  input.addEventListener('input', debounce(update, 60));
  input.addEventListener('keydown', onKey);

  overlay.addEventListener('mousedown', e => {
    if (e.target === overlay) closeSearch();
  });

  list.addEventListener('click', e => {
    const row = e.target.closest('[data-idx]');
    if (row) choose(Number(row.dataset.idx));
  });
  list.addEventListener('pointermove', e => {
    const row = e.target.closest('[data-idx]');
    if (row && Number(row.dataset.idx) !== cursor) {
      cursor = Number(row.dataset.idx);
      paintCursor();
    }
  });

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && !overlay.hidden) { e.preventDefault(); closeSearch(); }
  });
}

function onKey(e) {
  if (e.key === 'ArrowDown') { e.preventDefault(); cursor = Math.min(cursor + 1, results.length - 1); paintCursor(true); }
  else if (e.key === 'ArrowUp') { e.preventDefault(); cursor = Math.max(cursor - 1, 0); paintCursor(true); }
  else if (e.key === 'Enter') { e.preventDefault(); choose(cursor); }
  else if (e.key === 'Home') { cursor = 0; paintCursor(true); }
  else if (e.key === 'End') { cursor = results.length - 1; paintCursor(true); }
}

function update() {
  const q = input.value.trim();
  cursor = 0;
  results = q ? search(q, 40) : suggestions();
  render(q);
}

/** With an empty box, show something genuinely useful rather than nothing. */
function suggestions() {
  const rows = [];
  const push = (t, why) => rows.push({
    kind: 'topic', id: t.id, title: t.title, subtitle: t.domainTitle, meta: t, why
  });
  for (const t of learningNow().slice(0, 4)) push(t, 'Learning now');
  for (const t of needsRevision().slice(0, 4)) push(t, 'Needs revision');
  for (const t of recommended(6)) push(t, 'Recommended next');
  const seen = new Set();
  return rows.filter(r => (seen.has(r.id) ? false : (seen.add(r.id), true))).slice(0, 12);
}

function render(q) {
  if (!results.length) {
    list.innerHTML =
      `<div class="empty"><div class="empty-title">Nothing matches “${escapeHtml(q)}”</div>
       <div class="empty-sub">Try a concept (“groundedness”), a tool (“qdrant”) or a term (“softmax”).</div></div>`;
    $('#search-count').textContent = '';
    return;
  }

  list.innerHTML = results.map((r, i) => {
    const status = r.kind === 'topic' ? store.statusOf(r.id) : null;
    const sub = r.why || r.subtitle || KIND_LABEL[r.kind];
    const detail = r.kind === 'topic' ? (r.meta.summary || '')
                 : r.kind === 'tool' ? r.meta.what
                 : r.kind === 'domain' ? r.meta.blurb
                 : r.meta.summary;
    return `<button class="sr-row ${i === cursor ? 'is-on' : ''}" data-idx="${i}"
              ${status ? `data-status="${status}"` : ''} data-kind="${r.kind}">
              <span class="sr-icon">${icon(KIND_ICON[r.kind])}</span>
              <span class="sr-main">
                <span class="sr-title">${highlight(r.title, q)}
                  ${status && status !== 'not-started' ? `<span class="sr-status">${STATUS_META[status].short}</span>` : ''}
                </span>
                <span class="sr-detail">${highlight(String(detail || '').slice(0, 110), q)}</span>
              </span>
              <span class="sr-kind">${escapeHtml(sub)}</span>
            </button>`;
  }).join('');

  $('#search-count').textContent = q ? `${results.length} result${results.length === 1 ? '' : 's'}` : 'Suggestions';
  paintCursor();
}

function paintCursor(scroll = false) {
  const rows = list.querySelectorAll('[data-idx]');
  rows.forEach((r, i) => r.classList.toggle('is-on', i === cursor));
  if (scroll && rows[cursor]) rows[cursor].scrollIntoView({ block: 'nearest' });
}

function choose(i) {
  const r = results[i];
  if (!r) return;
  closeSearch();
  if (r.kind === 'topic') router.openTopic(r.id);
  else if (r.kind === 'tool') router.go('tools', { tool: r.id });
  else if (r.kind === 'domain') {
    router.setView('map');
    import('./map.js').then(m => m.focusDomain?.(r.id));
  } else if (r.kind === 'comparison') router.go('compare', { c: r.id });
}
