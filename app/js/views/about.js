/**
 * ABOUT — what this is, how to use it, and how it is built.
 * Reached with `?` or from the rail.
 */
import { $ } from '../core/util.js';
import { icon } from '../components/icons.js';
import * as router from '../core/router.js';
import { TOPICS } from '../../data/topics.js';
import { DOMAINS } from '../../data/domains.js';
import { TOOLS } from '../../data/tools.js';
import { COMPARISONS } from '../../data/comparisons.js';

const SHORTCUTS = [
  ['Ctrl K  or  /', 'Search everything'],
  ['G', 'Preparation Map'],
  ['D', 'Dashboard'],
  ['M', 'Dependency Map'],
  ['T', 'Tools'],
  ['C', 'Comparisons'],
  ['P', 'Practice'],
  ['Q', 'Toggle Quick Revision / Deep Dive'],
  ['Esc', 'Close the topic panel'],
  ['Space', 'Reveal answer (in Practice)'],
  ['1 2 3', 'Grade yourself (in Practice)']
];

export function mount(host) {
  const resources = TOPICS.reduce((n, t) => n + (t.resources?.length || 0), 0);
  const questions = TOPICS.reduce((n, t) => n + (t.questions?.length || 0), 0);
  const terms = TOPICS.reduce((n, t) => n + (t.keyTerms?.length || 0), 0);

  host.innerHTML = `
  <div class="view-scroll"><div class="page">
    <div class="page-head">
      <div class="ph-eyebrow">About</div>
      <h1>Preparation Map</h1>
      <p class="ph-lede">A local, offline-first map of everything you are learning across AI,
        product, data, strategy and business. It runs entirely from this folder. No server, no
        account, no network calls — only the external documentation links open the internet,
        and only when you click them.</p>
    </div>

    <div class="grid grid-4" style="margin-bottom:var(--sp-8)">
      ${stat(TOPICS.length, 'Topics')}
      ${stat(DOMAINS.length, 'Domains')}
      ${stat(TOOLS.length, 'Tools')}
      ${stat(COMPARISONS.length, 'Comparisons')}
      ${stat(resources, 'External resources')}
      ${stat(questions, 'Practice questions')}
      ${stat(terms, 'Key terms')}
      ${stat(10, 'Tracks')}
    </div>

    <div class="section-head"><h2>How to use it</h2><span class="sh-rule"></span></div>
    <div class="about-grid" style="margin-bottom:var(--sp-8)">
      ${card('map', 'Start at the map',
        'The Preparation Map is the centrepiece. Zoom out to see the whole landscape; zoom in and each domain opens into its own constellation of topics. Click any topic and the panel opens over the map, so you never lose your place.')}
      ${card('target', 'Mark your status',
        'Every topic can be Not started, Learning, Needs review, Completed or Mastered. That single act drives the dashboard, the map colours, the recommendations and what Practice asks you.')}
      ${card('bolt', 'Two reading depths',
        'Deep Dive gives the full card. Quick Revision strips it back to definition, why it matters, the diagram, one example, key terms and the common mistake — about one to three minutes per concept.')}
      ${card('graph', 'Follow the connections',
        'Selecting a topic lights everything it requires and everything it unlocks. The Dependency Map shows the same relationships as a strict top-to-bottom order.')}
      ${card('practice', 'Test yourself',
        'Practice draws from the questions on every topic. Grading yourself honestly updates the topic status, so a missed answer sends the topic back to "needs review" on the map.')}
      ${card('external', 'Go deeper',
        'Every topic links to official documentation first, then tutorials, videos, papers and repositories. Links are deep-linked to the relevant page rather than a homepage.')}
    </div>

    <div class="section-head"><h2>Keyboard</h2><span class="sh-rule"></span></div>
    <div class="about-card" style="margin-bottom:var(--sp-8)">
      <div class="set-keys">
        ${SHORTCUTS.map(([k, v]) =>
          `<div class="set-key-row"><kbd class="key">${k}</kbd><span>${v}</span></div>`).join('')}
      </div>
    </div>

    <div class="section-head"><h2>How it is built</h2><span class="sh-rule"></span></div>
    <div class="about-grid" style="margin-bottom:var(--sp-8)">
      ${card('layers', 'No framework, no build step',
        'Plain HTML, CSS and JavaScript modules. No React, no bundler, no dependencies. The only runtime requirement is a static file server, because browsers refuse to load JavaScript modules from file://.')}
      ${card('home', 'Everything stays local',
        'Your progress, notes and settings live in this browser only, in localStorage, under a single key. Nothing is uploaded. Export a backup from Settings before clearing browser data.')}
      ${card('info', 'Content is data',
        'Every topic is a structured object in <code>app/data/topics/</code>. Adding or editing a topic never means touching rendering code, and the map redraws itself around whatever is there.')}
    </div>

    <div class="section-head"><h2>Running it</h2><span class="sh-rule"></span></div>
    <div class="code" style="margin-bottom:var(--sp-8)">
      <div class="code-head"><span class="ch-lang">terminal</span>
        <span class="ch-caption">from the project folder</span></div>
      <pre>node serve.js 4173        # or double-click start.bat

# then open
http://localhost:4173</pre>
    </div>

    <div class="section-head"><h2>Jump in</h2><span class="sh-rule"></span></div>
    <div class="grid grid-3">
      ${nav('map', 'map', 'Preparation Map')}
      ${nav('dashboard', 'dashboard', 'Dashboard')}
      ${nav('practice', 'practice', 'Practice')}
    </div>
  </div></div>`;

  host.addEventListener('click', e => {
    const n = e.target.closest('[data-goview]');
    if (n) router.setView(n.dataset.goview);
  });
}

function stat(value, label) {
  return `<div class="set-stat"><span class="ss-num">${value}</span>
          <span class="ss-lab">${label}</span></div>`;
}

function card(iconName, title, body) {
  return `<div class="about-card">
    <div class="nav-card-head" style="margin-bottom:var(--sp-3)">
      <span class="nav-card-icon">${icon(iconName)}</span>
      <h3 style="margin:0">${title}</h3>
    </div>
    <p>${body}</p>
  </div>`;
}

function nav(view, iconName, title) {
  return `<button class="card is-link nav-card" data-goview="${view}">
    <span class="nav-card-head">
      <span class="nav-card-icon">${icon(iconName)}</span>
      <span class="nav-card-title">${title}</span>
    </span>
  </button>`;
}
