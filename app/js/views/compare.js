/**
 * COMPARISONS (BUILD.md section 48)
 * The cross-concept distinctions people actually get wrong, laid out
 * side by side with an ASCII diagram and a verdict.
 */
import { $, escapeHtml, inline } from '../core/util.js';
import { icon } from '../components/icons.js';
import * as router from '../core/router.js';
import { on } from '../core/events.js';
import { COMPARISONS, COMPARISON_BY_ID } from '../../data/comparisons.js';
import { resolve } from '../../data/topics.js';
import * as store from '../core/store.js';

let host, openId = null;

export function mount(node) {
  host = node;
  host.innerHTML = '<div class="view-scroll"><div class="page" id="cmp-page"></div></div>';
  render();

  host.addEventListener('click', e => {
    const head = e.target.closest('[data-cmp]');
    if (head) {
      const id = head.dataset.cmp;
      openId = openId === id ? null : id;
      render();
      if (openId) {
        const card = $(`#cmp-${CSS.escape(openId)}`, host);
        card?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      }
      return;
    }
    const topic = e.target.closest('[data-topic]');
    if (topic) router.openTopic(topic.dataset.topic);
  });

  on('route:change', ({ params }) => {
    if (params.c && COMPARISON_BY_ID[params.c] && openId !== params.c) {
      openId = params.c;
      render();
    }
  });
}

export function activate() {
  const target = router.route().params.c;
  if (target && COMPARISON_BY_ID[target]) {
    openId = target;
    render();
    setTimeout(() => $(`#cmp-${CSS.escape(target)}`, host)
      ?.scrollIntoView({ block: 'start', behavior: 'smooth' }), 60);
  }
}

/* ============================================================ */

function render() {
  $('#cmp-page', host).innerHTML = `
    <div class="page-head">
      <div class="ph-eyebrow">Comparisons</div>
      <h1>The distinctions that actually matter</h1>
      <p class="ph-lede">Each of these is a pair people routinely confuse, and confusing them
        leads to a wrong architectural decision. Every comparison gives the axes side by side,
        a diagram, and a verdict you can act on.</p>
    </div>
    <div class="cmp-list">${COMPARISONS.map(card).join('')}</div>`;
}

function card(c) {
  const isOpen = openId === c.id;
  return `
  <article class="cmp-card ${isOpen ? 'is-open' : ''}" id="cmp-${c.id}">
    <button class="cmp-head" data-cmp="${c.id}" aria-expanded="${isOpen}">
      <span class="cmp-vs">
        <span class="cmp-side">${escapeHtml(c.a.label)}</span>
        <span class="cmp-x">vs</span>
        <span class="cmp-side">${escapeHtml(c.b.label)}</span>
      </span>
      <span class="cmp-chev">${icon('chevronDown')}</span>
    </button>

    <div class="cmp-body">
      <p class="cmp-summary">${inline(c.summary)}</p>

      <div class="cmp-table">
        <div class="cmp-trow is-head">
          <div>Axis</div>
          <div class="cmp-a">${escapeHtml(c.a.label)}${c.a.tagline
              ? `<span style="display:block;font-weight:400;text-transform:none;letter-spacing:0;color:var(--text-low);font-size:var(--fs-2xs);margin-top:2px">${escapeHtml(c.a.tagline)}</span>` : ''}</div>
          <div class="cmp-b">${escapeHtml(c.b.label)}${c.b.tagline
              ? `<span style="display:block;font-weight:400;text-transform:none;letter-spacing:0;color:var(--text-low);font-size:var(--fs-2xs);margin-top:2px">${escapeHtml(c.b.tagline)}</span>` : ''}</div>
        </div>
        ${c.axes.map(ax => `
          <div class="cmp-trow">
            <div class="cmp-axis">${escapeHtml(ax.label)}</div>
            <div class="cmp-a">${escapeHtml(ax.a)}</div>
            <div class="cmp-b">${escapeHtml(ax.b)}</div>
          </div>`).join('')}
      </div>

      ${c.diagram ? `<div class="ascii" style="margin-top:var(--sp-4)"><pre>${escapeHtml(
          c.diagram.replace(/^\n+|\n+$/g, ''))}</pre></div>` : ''}

      <div class="cmp-verdict"><strong>Verdict</strong>${inline(c.verdict)}</div>

      ${relatedTopics(c)}
    </div>
  </article>`;
}

function relatedTopics(c) {
  const topics = resolve(c.topics);
  if (!topics.length) return '';
  return `
    <div class="cmp-links">
      ${topics.map(t => `
        <button class="conn-pill" data-topic="${t.id}" data-track="${t.track}"
                data-status="${store.statusOf(t.id)}">
          <span class="cp-dot"></span>${escapeHtml(t.title)}
        </button>`).join('')}
    </div>`;
}
