/** Minimal pub/sub. Keeps views decoupled from the store. */
const channels = new Map();

export function on(name, fn) {
  if (!channels.has(name)) channels.set(name, new Set());
  channels.get(name).add(fn);
  return () => off(name, fn);
}

export function off(name, fn) {
  channels.get(name)?.delete(fn);
}

export function emit(name, payload) {
  const set = channels.get(name);
  if (!set) return;
  for (const fn of [...set]) {
    try { fn(payload); }
    catch (err) { console.error(`[events] handler for "${name}" failed`, err); }
  }
}
