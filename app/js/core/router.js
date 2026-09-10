/**
 * Hash router.
 *   #/map                     -> view: map
 *   #/map?topic=rag           -> view: map, topic panel open on "rag"
 *   #/dashboard               -> view: dashboard
 * The topic panel is a query parameter rather than its own route so the
 * underlying map is never unmounted — you never "lose the map".
 */
import { emit } from './events.js';

export const VIEWS = ['map', 'dashboard', 'graph', 'tools', 'compare', 'practice', 'about'];
const DEFAULT_VIEW = 'map';

let current = { view: DEFAULT_VIEW, topic: null, params: {} };

export function parse(hash = location.hash) {
  const raw = String(hash).replace(/^#\/?/, '');
  const [pathPart, queryPart] = raw.split('?');
  const segments = pathPart.split('/').filter(Boolean);
  const view = VIEWS.includes(segments[0]) ? segments[0] : DEFAULT_VIEW;
  const params = Object.fromEntries(new URLSearchParams(queryPart || ''));
  return { view, topic: params.topic || null, params };
}

export function route() { return current; }

export function go(view, params = {}) {
  const qs = new URLSearchParams(
    Object.entries(params).filter(([, v]) => v !== null && v !== undefined && v !== '')
  ).toString();
  const next = `#/${view}${qs ? '?' + qs : ''}`;
  if (location.hash === next) { handle(); return; }
  location.hash = next;
}

/** Open a topic without leaving the current view. */
export function openTopic(id) {
  const { view, params } = current;
  go(view, { ...params, topic: id });
}

export function closeTopic() {
  const { view, params } = current;
  const next = { ...params };
  delete next.topic;
  go(view, next);
}

export function setView(view) {
  go(view, current.topic ? { topic: current.topic } : {});
}

function handle() {
  const next = parse();
  const viewChanged = next.view !== current.view;
  const topicChanged = next.topic !== current.topic;
  current = next;
  if (viewChanged) emit('route:view', next);
  if (topicChanged) emit('route:topic', next);
  emit('route:change', next);
}

export function start() {
  window.addEventListener('hashchange', handle);
  if (!location.hash) location.replace(`#/${DEFAULT_VIEW}`);
  current = parse();
  emit('route:view', current);
  emit('route:topic', current);
  emit('route:change', current);
  return current;
}
