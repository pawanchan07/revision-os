/**
 * Progress arithmetic. Turns raw per-topic statuses into the numbers the
 * dashboard, rail and map read from (BUILD.md section 38).
 */
import { TOPICS } from '../../data/topics.js';
import { DOMAINS } from '../../data/domains.js';
import { TRACKS } from '../../data/tracks.js';
import { statusOf, STATUS_META, STATUSES } from './store.js';

function tally(list) {
  const counts = Object.fromEntries(STATUSES.map(s => [s, 0]));
  let score = 0;
  for (const t of list) {
    const s = statusOf(t.id);
    counts[s]++;
    score += STATUS_META[s].weight;
  }
  const total = list.length || 1;
  return {
    total: list.length,
    counts,
    percent: Math.round((score / total) * 100),
    touched: list.length - counts['not-started'],
    done: counts.completed + counts.mastered
  };
}

export function overall() { return tally(TOPICS); }

export function byTrack() {
  return TRACKS.map(tr => ({
    ...tr,
    ...tally(TOPICS.filter(t => t.track === tr.id))
  })).filter(t => t.total > 0);
}

export function byDomain() {
  return DOMAINS.map(d => ({
    ...d,
    ...tally(TOPICS.filter(t => t.domain === d.id))
  }));
}

export function domainStats(domainId) {
  return tally(TOPICS.filter(t => t.domain === domainId));
}

/** Topics explicitly flagged as needing revision. */
export function needsRevision() {
  return TOPICS.filter(t => statusOf(t.id) === 'review');
}

export function learningNow() {
  return TOPICS.filter(t => statusOf(t.id) === 'learning');
}

export function completedTopics() {
  return TOPICS.filter(t => ['completed', 'mastered'].includes(statusOf(t.id)));
}

export function highPriority() {
  return TOPICS.filter(t => t.priority === 'high');
}

/**
 * Recommend what to learn next.
 * A topic scores well when it is untouched, high priority, shallow in the
 * dependency graph, and all of its prerequisites are already understood.
 */
export function recommended(limit = 6) {
  const known = new Set(
    TOPICS.filter(t => ['completed', 'mastered'].includes(statusOf(t.id))).map(t => t.id)
  );
  const scored = TOPICS
    .filter(t => statusOf(t.id) === 'not-started')
    .map(t => {
      const prereqs = t.prereq || [];
      const metCount = prereqs.filter(p => known.has(p)).length;
      const ready = prereqs.length === 0 ? 1 : metCount / prereqs.length;
      const prio = t.priority === 'high' ? 1 : t.priority === 'medium' ? 0.55 : 0.2;
      const shallow = 1 / (1 + (t.tier || 2));
      return { topic: t, score: ready * 2.2 + prio * 1.4 + shallow * 0.9, ready };
    })
    .sort((a, b) => b.score - a.score);
  return scored.slice(0, limit).map(s => ({ ...s.topic, readiness: s.ready }));
}

/** Topics completed a while ago are the natural candidates for revision. */
export function staleTopics(recentList, limit = 6) {
  const recentIds = new Set(recentList.map(r => r.id));
  return TOPICS
    .filter(t => ['completed', 'mastered', 'review'].includes(statusOf(t.id)))
    .filter(t => !recentIds.has(t.id))
    .slice(0, limit);
}

export function statusCounts() { return overall().counts; }
