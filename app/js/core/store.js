/**
 * Application state + localStorage persistence.
 * Everything the user "owns" (statuses, notes, streak, preferences) lives here.
 * Nothing leaves the machine.
 */
import { emit } from './events.js';
import { todayKey, daysBetween } from './util.js';

const KEY = 'prep-map:v1';

export const STATUSES = ['not-started', 'learning', 'review', 'completed', 'mastered'];

export const STATUS_META = {
  'not-started': { label: 'Not started', short: 'New',      weight: 0,    glyph: '○' },
  'learning':    { label: 'Learning',    short: 'Learning', weight: 0.35, glyph: '◐' },
  'review':      { label: 'Needs review',short: 'Review',   weight: 0.55, glyph: '◑' },
  'completed':   { label: 'Completed',   short: 'Done',     weight: 0.85, glyph: '◕' },
  'mastered':    { label: 'Mastered',    short: 'Mastered', weight: 1,    glyph: '●' }
};

const DEFAULTS = {
  theme: 'dark',
  mode: 'deep',                 // 'quick' | 'deep'
  status: {},                   // topicId -> status
  notes: {},                    // topicId -> string
  pinned: [],                   // topicId[]
  recent: [],                   // [{id, at}] most-recent-first
  answered: {},                 // practice: `${topicId}:${i}` -> true
  streak: { current: 0, best: 0, last: null, days: [] },
  filters: { tracks: [], status: 'all', query: '' },
  mapView: null,                // {x, y, k} last camera
  seenIntro: false
};

function load() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return structuredClone(DEFAULTS);
    const parsed = JSON.parse(raw);
    return {
      ...structuredClone(DEFAULTS),
      ...parsed,
      streak: { ...DEFAULTS.streak, ...(parsed.streak || {}) },
      filters: { ...DEFAULTS.filters, ...(parsed.filters || {}) }
    };
  } catch (err) {
    console.warn('[store] could not read saved state, starting fresh', err);
    return structuredClone(DEFAULTS);
  }
}

const state = load();
let saveTimer = null;

function persist() {
  clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    try { localStorage.setItem(KEY, JSON.stringify(state)); }
    catch (err) { console.warn('[store] save failed', err); }
  }, 180);
}

/* ---------------- reads ---------------- */

export function get() { return state; }
export function statusOf(id) { return state.status[id] || 'not-started'; }
export function noteOf(id) { return state.notes[id] || ''; }
export function isPinned(id) { return state.pinned.includes(id); }
export function mode() { return state.mode; }
export function theme() { return state.theme; }
export function filters() { return state.filters; }
export function recent() { return state.recent; }
export function streak() { return state.streak; }
export function isAnswered(id, i) { return !!state.answered[`${id}:${i}`]; }

/* ---------------- writes ---------------- */

export function setStatus(id, status) {
  if (!STATUSES.includes(status)) return;
  if (status === 'not-started') delete state.status[id];
  else state.status[id] = status;
  touchStreak();
  persist();
  emit('status:change', { id, status });
  emit('progress:change');
}

export function cycleStatus(id) {
  const i = STATUSES.indexOf(statusOf(id));
  setStatus(id, STATUSES[(i + 1) % STATUSES.length]);
  return statusOf(id);
}

export function setNote(id, text) {
  if (text && text.trim()) state.notes[id] = text;
  else delete state.notes[id];
  persist();
  emit('note:change', { id });
}

export function togglePin(id) {
  const i = state.pinned.indexOf(id);
  if (i >= 0) state.pinned.splice(i, 1);
  else state.pinned.unshift(id);
  persist();
  emit('pin:change', { id });
  return isPinned(id);
}

export function markAnswered(id, i, value = true) {
  const k = `${id}:${i}`;
  if (value) state.answered[k] = true; else delete state.answered[k];
  persist();
}

export function visit(id) {
  state.recent = [{ id, at: Date.now() }, ...state.recent.filter(r => r.id !== id)].slice(0, 24);
  touchStreak();
  persist();
  emit('recent:change');
}

export function setMode(m) {
  if (m !== 'quick' && m !== 'deep') return;
  state.mode = m;
  persist();
  emit('mode:change', m);
}

export function setTheme(t) {
  state.theme = t;
  document.documentElement.dataset.theme = t;
  persist();
  emit('theme:change', t);
}

export function toggleTheme() { setTheme(state.theme === 'dark' ? 'light' : 'dark'); }

export function setFilters(patch) {
  Object.assign(state.filters, patch);
  persist();
  emit('filters:change', state.filters);
}

export function toggleTrackFilter(track) {
  const list = state.filters.tracks;
  const i = list.indexOf(track);
  if (i >= 0) list.splice(i, 1); else list.push(track);
  persist();
  emit('filters:change', state.filters);
}

export function clearTrackFilters() {
  state.filters.tracks = [];
  persist();
  emit('filters:change', state.filters);
}

export function setMapView(v) { state.mapView = v; persist(); }

export function markIntroSeen() { state.seenIntro = true; persist(); }

export function resetAll() {
  const fresh = structuredClone(DEFAULTS);
  fresh.theme = state.theme;
  Object.assign(state, fresh);
  try { localStorage.setItem(KEY, JSON.stringify(state)); } catch {}
  emit('progress:change');
  emit('filters:change', state.filters);
  emit('recent:change');
}

export function exportJson() {
  return JSON.stringify({ app: 'preparation-map', version: 1, exported: new Date().toISOString(), state }, null, 2);
}

export function importJson(text) {
  const parsed = JSON.parse(text);
  const incoming = parsed.state || parsed;
  Object.assign(state, structuredClone(DEFAULTS), incoming);
  try { localStorage.setItem(KEY, JSON.stringify(state)); } catch {}
  document.documentElement.dataset.theme = state.theme;
  emit('progress:change');
  emit('filters:change', state.filters);
  emit('recent:change');
}

/* ---------------- streak ---------------- */

function touchStreak() {
  const today = todayKey();
  const s = state.streak;
  if (s.last === today) return;
  if (s.last) {
    const gap = daysBetween(s.last, today);
    s.current = gap === 1 ? s.current + 1 : 1;
  } else {
    s.current = 1;
  }
  s.last = today;
  s.best = Math.max(s.best || 0, s.current);
  s.days = [...new Set([...(s.days || []), today])].slice(-400);
  emit('streak:change', s);
}

/** Recompute current streak on load (it decays if days were missed). */
export function refreshStreak() {
  const s = state.streak;
  if (!s.last) return s;
  const gap = daysBetween(s.last, todayKey());
  if (gap > 1) s.current = 0;
  return s;
}
