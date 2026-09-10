/**
 * PRACTICE (BUILD.md section 37)
 *
 * Self-testing built from the "Check your understanding" questions attached to
 * every topic. You choose a scope, answer from memory, reveal, and grade
 * yourself — and grading feeds straight back into topic status, so practice
 * updates the map.
 */
import { $, escapeHtml, inline, prose } from '../core/util.js';
import { icon } from '../components/icons.js';
import * as store from '../core/store.js';
import * as router from '../core/router.js';
import { TOPICS, TOPIC_BY_ID } from '../../data/topics.js';
import { DOMAINS } from '../../data/domains.js';
import { TRACKS } from '../../data/tracks.js';
import { needsRevision, learningNow } from '../core/progress.js';
import { toast } from '../components/shell.js';

let host;
let session = null;   // { queue, index, revealed, results }

export function mount(node) {
  host = node;
  host.innerHTML = '<div class="view-scroll"><div class="page" id="pr-page"></div></div>';
  renderSetup();

  host.addEventListener('click', e => {
    const start = e.target.closest('[data-pr-start]');
    if (start) { begin(start.dataset.prStart, start.dataset.prValue || null); return; }

    if (e.target.closest('[data-pr-reveal]')) { session.revealed = true; renderQuestion(); return; }
    const grade = e.target.closest('[data-pr-grade]');
    if (grade) { record(grade.dataset.prGrade); return; }
    if (e.target.closest('[data-pr-skip]')) { record('skip'); return; }
    if (e.target.closest('[data-pr-restart]')) { session = null; renderSetup(); return; }

    const open = e.target.closest('[data-pr-open]');
    if (open) router.openTopic(open.dataset.prOpen);
  });

  document.addEventListener('keydown', e => {
    if (!session || router.route().view !== 'practice') return;
    if (/^(INPUT|TEXTAREA)$/.test(e.target.tagName)) return;
    if (e.key === ' ' && !session.revealed) { e.preventDefault(); session.revealed = true; renderQuestion(); }
    else if (session.revealed && ['1', '2', '3'].includes(e.key)) {
      record({ '1': 'again', '2': 'hard', '3': 'good' }[e.key]);
    }
  });
}

export function activate() {
  if (!session) renderSetup();
}

/* ============================================================
   SETUP
   ============================================================ */

function questionCount(topics) {
  return topics.reduce((n, t) => n + (t.questions?.length || 0), 0);
}

function renderSetup() {
  const withQuestions = TOPICS.filter(t => t.questions?.length);
  const review = needsRevision().filter(t => t.questions?.length);
  const learning = learningNow().filter(t => t.questions?.length);
  const weak = TOPICS.filter(t => t.questions?.length &&
    ['not-started', 'learning', 'review'].includes(store.statusOf(t.id)));

  $('#pr-page', host).innerHTML = `
    <div class="page-head">
      <div class="ph-eyebrow">Practice</div>
      <h1>Could you actually explain it?</h1>
      <p class="ph-lede">Answer out loud or in your head first, then reveal. Grading yourself
        honestly is the whole point — and your grade updates the topic's status on the map,
        so this feeds straight back into what you see everywhere else.</p>
    </div>

    <div class="pr-setup">
      <div class="section-head"><h2>Quick start</h2><span class="sh-rule"></span></div>
      <div class="grid grid-2">
        ${startCard('all', '', 'Everything', questionCount(withQuestions),
          'A random mix across every topic that has questions.')}
        ${startCard('weak', '', 'What you have not mastered', questionCount(weak),
          'Not started, learning, or marked for revision.')}
        ${review.length ? startCard('review', '', 'Needs revision', questionCount(review),
          'Only the topics you flagged for revision.') : ''}
        ${learning.length ? startCard('learning', '', 'Learning now', questionCount(learning),
          'The topics you are working through right now.') : ''}
      </div>

      <div class="section-head"><h2>By track</h2><span class="sh-rule"></span></div>
      <div class="pr-domains">
        ${TRACKS.map(tr => {
          const topics = withQuestions.filter(t => t.track === tr.id);
          if (!topics.length) return '';
          return `<button class="chip" data-track="${tr.id}" data-pr-start="track"
                    data-pr-value="${tr.id}"><span class="dot"></span>${tr.label}
                    <span style="opacity:.55">${questionCount(topics)}</span></button>`;
        }).join('')}
      </div>

      <div class="section-head"><h2>By domain</h2><span class="sh-rule"></span></div>
      <div class="pr-domains">
        ${DOMAINS.map(d => {
          const topics = withQuestions.filter(t => t.domain === d.id);
          if (!topics.length) return '';
          return `<button class="chip" data-pr-start="domain" data-pr-value="${d.id}">
                    ${escapeHtml(d.short)} <span style="opacity:.55">${questionCount(topics)}</span>
                  </button>`;
        }).join('')}
      </div>
    </div>`;
}

function startCard(kind, value, title, count, desc) {
  return `
  <button class="card is-link nav-card" data-pr-start="${kind}" data-pr-value="${value}"
          ${count ? '' : 'disabled'}>
    <span class="nav-card-head">
      <span class="nav-card-icon">${icon('practice')}</span>
      <span class="nav-card-title">${escapeHtml(title)}</span>
    </span>
    <span class="nav-card-desc">${escapeHtml(desc)}</span>
    <span class="tc-foot">${count} question${count === 1 ? '' : 's'}</span>
  </button>`;
}

/* ============================================================
   SESSION
   ============================================================ */

function begin(kind, value) {
  let topics = TOPICS.filter(t => t.questions?.length);

  if (kind === 'weak') {
    topics = topics.filter(t => ['not-started', 'learning', 'review'].includes(store.statusOf(t.id)));
  } else if (kind === 'review') {
    topics = topics.filter(t => store.statusOf(t.id) === 'review');
  } else if (kind === 'learning') {
    topics = topics.filter(t => store.statusOf(t.id) === 'learning');
  } else if (kind === 'track') {
    topics = topics.filter(t => t.track === value);
  } else if (kind === 'domain') {
    topics = topics.filter(t => t.domain === value);
  }

  const queue = [];
  for (const t of topics) {
    t.questions.forEach((q, i) => queue.push({ topicId: t.id, index: i, q: q.q, a: q.a }));
  }
  shuffle(queue);

  if (!queue.length) {
    toast('No questions in that scope', 'info');
    return;
  }

  session = { queue: queue.slice(0, 25), index: 0, revealed: false, results: [] };
  renderQuestion();
}

/** Deterministic-free shuffle; practice order should vary between sessions. */
function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
}

function renderQuestion() {
  const { queue, index, revealed } = session;
  if (index >= queue.length) return renderScore();

  const item = queue[index];
  const topic = TOPIC_BY_ID[item.topicId];
  const progress = ((index) / queue.length) * 100;

  $('#pr-page', host).innerHTML = `
    <div class="pr-stage ${revealed ? 'is-revealed' : ''}" data-track="${topic.track}">
      <div class="pr-head">
        <span class="ph-count">${index + 1} / ${queue.length}</span>
        <span class="ph-sp"></span>
        <button class="btn is-sm is-ghost" data-pr-open="${topic.id}">
          ${icon('book')}Open topic
        </button>
        <button class="btn is-sm is-ghost" data-pr-restart>
          ${icon('close')}End session
        </button>
      </div>
      <div class="pr-progress"><span style="width:${progress}%"></span></div>

      <div class="pr-qbody">
        <div class="pr-domain">${escapeHtml(topic.domainTitle)} · ${escapeHtml(topic.title)}</div>
        <div class="pr-q">${inline(item.q)}</div>
        <div class="pr-a">${prose(item.a)}</div>
      </div>

      <div class="pr-actions">
        <button class="btn is-primary pr-reveal" data-pr-reveal>
          ${icon('bolt')}Reveal answer <kbd class="key" style="margin-left:6px">Space</kbd>
        </button>
        <div class="pr-self">
          <button class="btn" data-pr-grade="again">Did not know <kbd class="key">1</kbd></button>
          <button class="btn" data-pr-grade="hard">Roughly <kbd class="key">2</kbd></button>
          <button class="btn is-primary" data-pr-grade="good">Knew it <kbd class="key">3</kbd></button>
          <button class="btn is-ghost" data-pr-skip>Skip</button>
        </div>
      </div>
    </div>`;
}

function record(grade) {
  const item = session.queue[session.index];
  session.results.push({ ...item, grade });

  if (grade !== 'skip') {
    store.markAnswered(item.topicId, item.index);
    applyStatus(item.topicId, grade);
  }

  session.index++;
  session.revealed = false;
  renderQuestion();
}

/**
 * Grading feeds back into the map. Deliberately conservative: a single
 * good answer never jumps a topic to mastered, but a miss always pulls
 * it back to review.
 */
function applyStatus(topicId, grade) {
  const current = store.statusOf(topicId);
  if (grade === 'again') {
    if (current !== 'review') store.setStatus(topicId, 'review');
  } else if (grade === 'hard') {
    if (['not-started', 'completed', 'mastered'].includes(current)) {
      store.setStatus(topicId, current === 'not-started' ? 'learning' : 'review');
    }
  } else if (grade === 'good') {
    if (current === 'not-started') store.setStatus(topicId, 'learning');
    else if (current === 'learning' || current === 'review') store.setStatus(topicId, 'completed');
  }
}

function renderScore() {
  const { results } = session;
  const good = results.filter(r => r.grade === 'good').length;
  const hard = results.filter(r => r.grade === 'hard').length;
  const again = results.filter(r => r.grade === 'again').length;
  const answered = good + hard + again;
  const pct = answered ? Math.round((good / answered) * 100) : 0;

  const missed = results.filter(r => r.grade === 'again' || r.grade === 'hard');
  const missedTopics = [...new Set(missed.map(r => r.topicId))].map(id => TOPIC_BY_ID[id]);

  $('#pr-page', host).innerHTML = `
    <div class="pr-stage">
      <div class="pr-score">
        <div class="ps-num">${pct}%</div>
        <div class="ps-lab">
          You knew ${good} of ${answered} answered${
            results.length - answered ? ` (${results.length - answered} skipped)` : ''}.
          ${again ? `${again} topic${again === 1 ? '' : 's'} moved to "needs revision".` : ''}
        </div>
        <div style="display:flex;gap:var(--sp-2);flex-wrap:wrap;justify-content:center">
          <button class="btn is-primary" data-pr-restart>${icon('refresh')}Practise again</button>
          <button class="btn" data-pr-open="${results[0]?.topicId || ''}">${icon('book')}Review a topic</button>
        </div>
      </div>
      ${missedTopics.length ? `
        <div style="padding:0 var(--sp-6) var(--sp-7)">
          <div class="section-head"><h2>Worth revisiting</h2>
            <span class="sh-count">${missedTopics.length}</span><span class="sh-rule"></span></div>
          <div class="grid grid-3">
            ${missedTopics.map(t => `
              <button class="topic-card" data-pr-open="${t.id}" data-track="${t.track}"
                      data-status="${store.statusOf(t.id)}">
                <span class="tc-top">
                  <span class="tc-domain">${escapeHtml(t.domainTitle)}</span>
                  <span class="tc-sp"></span><span class="tc-dot"></span>
                </span>
                <span class="tc-title">${escapeHtml(t.title)}</span>
                <span class="tc-sum">${escapeHtml(t.summary || '')}</span>
              </button>`).join('')}
          </div>
        </div>` : ''}
    </div>`;

  session = null;
}
