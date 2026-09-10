/**
 * TOOLS ECOSYSTEM (BUILD.md section 26)
 * A visual tool map grouped by function. Every tool answers the same six
 * questions, so they stay comparable.
 */
import { $, escapeHtml } from '../core/util.js';
import { icon } from '../components/icons.js';
import * as router from '../core/router.js';
import { on } from '../core/events.js';
import { TOOLS, TOOL_GROUPS, TOOL_BY_ID, toolsInGroup } from '../../data/tools.js';
import { TOPICS } from '../../data/topics.js';

let host, hostingFilter = null, groupFilter = null;

export function mount(node) {
  host = node;
  host.innerHTML = '<div class="view-scroll"><div class="page" id="tools-page"></div></div>';
  render();

  host.addEventListener('click', e => {
    const h = e.target.closest('[data-host-filter]');
    if (h) {
      hostingFilter = h.dataset.hostFilter || null;
      render();
      return;
    }
    const g = e.target.closest('[data-group-filter]');
    if (g) {
      groupFilter = g.dataset.groupFilter || null;
      render();
      return;
    }
    const t = e.target.closest('[data-topic]');
    if (t) router.openTopic(t.dataset.topic);
  });

  on('route:change', ({ params }) => {
    if (params.tool) focusTool(params.tool);
  });
}

export function activate() {
  const target = router.route().params.tool;
  if (target) setTimeout(() => focusTool(target), 60);
}

/* ============================================================ */

function render() {
  const page = $('#tools-page', host);
  const groups = groupFilter
    ? TOOL_GROUPS.filter(g => g.id === groupFilter)
    : TOOL_GROUPS;

  page.innerHTML = `
    <div class="page-head">
      <div class="ph-eyebrow">Tools ecosystem</div>
      <h1>What each tool is for</h1>
      <p class="ph-lede">Every tool answers the same six questions, so they stay comparable:
        what it is, why it exists, when to use it, what the alternatives are, whether it runs
        locally or in the cloud, and what a product manager should know. Documentation links
        go straight to the relevant page.</p>
    </div>

    <div style="display:flex;flex-wrap:wrap;gap:6px;margin-bottom:var(--sp-4)">
      <button class="chip ${!groupFilter ? 'is-on' : ''}" data-group-filter="">All groups</button>
      ${TOOL_GROUPS.map(g => `
        <button class="chip ${groupFilter === g.id ? 'is-on' : ''}" data-group-filter="${g.id}">
          ${escapeHtml(g.label)} <span style="opacity:.55">${toolsInGroup(g.id).length}</span>
        </button>`).join('')}
    </div>

    <div style="display:flex;flex-wrap:wrap;gap:6px;margin-bottom:var(--sp-7)">
      <button class="chip ${!hostingFilter ? 'is-on' : ''}" data-host-filter="">Anywhere</button>
      ${['local', 'cloud', 'both'].map(h => `
        <button class="chip ${hostingFilter === h ? 'is-on' : ''}" data-host-filter="${h}">
          ${h === 'both' ? 'Local or cloud' : h === 'local' ? 'Runs locally' : 'Cloud service'}
        </button>`).join('')}
    </div>

    ${groups.map(groupSection).join('') || emptyState()}
  `;
}

function groupSection(group) {
  let tools = toolsInGroup(group.id);
  if (hostingFilter) tools = tools.filter(t => t.hosting === hostingFilter);
  if (!tools.length) return '';

  return `
  <section class="tool-group">
    <div class="section-head">
      <h2>${escapeHtml(group.label)}</h2>
      <span class="sh-count">${tools.length}</span>
      <span class="sh-rule"></span>
    </div>
    <p style="color:var(--text-low);font-size:var(--fs-sm);margin-bottom:var(--sp-4)">
      ${escapeHtml(group.blurb)}
    </p>
    <div class="grid grid-2">${tools.map(toolCard).join('')}</div>
  </section>`;
}

function toolCard(tool) {
  const related = TOPICS.filter(t => (t.tools || []).includes(tool.id)).slice(0, 4);
  return `
  <article class="tool-card" id="tool-${tool.id}">
    <div class="tc-head">
      <span class="tc-name">${escapeHtml(tool.name)}</span>
      <span class="host-badge" data-host="${tool.hosting}">
        ${tool.hosting === 'both' ? 'local / cloud' : tool.hosting}
      </span>
    </div>

    <div class="tool-qa">
      ${qa('What is it?', tool.what)}
      ${qa('Why does it exist?', tool.why)}
      ${qa('When would I use it?', tool.when)}
    </div>

    ${tool.alternatives?.length ? `
      <div class="tq">
        <div class="tq-q">Alternatives</div>
        <div class="tool-alts">
          ${tool.alternatives.map(a => `<span class="tool-alt">${escapeHtml(a)}</span>`).join('')}
        </div>
      </div>` : ''}

    <div class="tool-pm"><strong>What a PM should know</strong>${escapeHtml(tool.pmNote)}</div>

    ${related.length ? `
      <div class="tq">
        <div class="tq-q">Appears in</div>
        <div class="tool-alts">
          ${related.map(t => `
            <button class="tool-alt" data-topic="${t.id}"
                    style="cursor:pointer">${escapeHtml(t.title)}</button>`).join('')}
        </div>
      </div>` : ''}

    <a class="btn is-sm" href="${escapeHtml(tool.url)}" target="_blank" rel="noopener noreferrer"
       style="justify-self:start">
      ${icon('external')}Official documentation
    </a>
  </article>`;
}

function qa(question, answer) {
  if (!answer) return '';
  return `<div class="tq"><div class="tq-q">${question}</div>
          <div class="tq-a">${escapeHtml(answer)}</div></div>`;
}

function emptyState() {
  return `<div class="empty">${icon('tools')}
    <div class="empty-title">No tools match these filters</div></div>`;
}

/* ---------------- deep link from search / topic panel ---------------- */

function focusTool(id) {
  if (!TOOL_BY_ID[id]) return;
  // Clear filters that might be hiding the target
  const tool = TOOL_BY_ID[id];
  if (groupFilter && groupFilter !== tool.group) groupFilter = null;
  if (hostingFilter && hostingFilter !== tool.hosting) hostingFilter = null;
  render();

  const card = $(`#tool-${CSS.escape(id)}`, host);
  if (!card) return;
  card.scrollIntoView({ block: 'center', behavior: 'smooth' });
  card.classList.add('is-target');
  setTimeout(() => card.classList.remove('is-target'), 2400);
}
