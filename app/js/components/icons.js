/**
 * Inline SVG icon set. Local, tiny, no icon-font dependency.
 * All icons are 24x24, stroke-based, and inherit `currentColor`.
 */
const PATHS = {
  map: '<circle cx="6" cy="7" r="2.4"/><circle cx="18" cy="8" r="2.4"/><circle cx="12" cy="17" r="2.4"/><path d="M7.9 8.4 16 7.3M7.3 9 10.6 15M16.9 10 13.4 15.3"/>',
  dashboard: '<rect x="3" y="3" width="7.5" height="8.5" rx="1.5"/><rect x="13.5" y="3" width="7.5" height="5" rx="1.5"/><rect x="13.5" y="10" width="7.5" height="11" rx="1.5"/><rect x="3" y="13.5" width="7.5" height="7.5" rx="1.5"/>',
  graph: '<path d="M12 3v4M12 11v3M6 21v-4M18 21v-4M12 14 6 17M12 14l6 3"/><circle cx="12" cy="9" r="2"/><circle cx="6" cy="19" r="2"/><circle cx="18" cy="19" r="2"/><circle cx="12" cy="3.2" r="1.2"/>',
  tools: '<path d="M14.7 6.3a3.6 3.6 0 0 0 4.8 4.7l-8 8a2.5 2.5 0 0 1-3.5-3.5z"/><path d="M6.5 3.5 9 6l-3 3-2.5-2.5a2 2 0 0 1 3-3Z"/>',
  compare: '<path d="M9 4H4v16h5zM20 4h-5v16h5z"/><path d="M11 12h2"/>',
  practice: '<path d="M12 4 4 8v8l8 4 8-4V8z"/><path d="M4 8l8 4 8-4M12 12v8"/>',
  search: '<circle cx="10.5" cy="10.5" r="6.5"/><path d="m20 20-4.8-4.8"/>',
  close: '<path d="M6 6l12 12M18 6 6 18"/>',
  chevronLeft: '<path d="m14 6-6 6 6 6"/>',
  chevronRight: '<path d="m10 6 6 6-6 6"/>',
  chevronDown: '<path d="m6 10 6 6 6-6"/>',
  arrowRight: '<path d="M4 12h15M13 6l6 6-6 6"/>',
  arrowUpRight: '<path d="M7 17 17 7M8 7h9v9"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  minus: '<path d="M5 12h14"/>',
  target: '<circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="3.4"/><path d="M12 2v2.4M12 19.6V22M2 12h2.4M19.6 12H22"/>',
  pin: '<path d="M12 3 9.6 8.4 4 10.4l4.4 4-1 6 4.6-3 4.6 3-1-6 4.4-4-5.6-2z"/>',
  sun: '<circle cx="12" cy="12" r="4.2"/><path d="M12 2v2.6M12 19.4V22M4.2 4.2l1.9 1.9M17.9 17.9l1.9 1.9M2 12h2.6M19.4 12H22M4.2 19.8l1.9-1.9M17.9 6.1l1.9-1.9"/>',
  moon: '<path d="M20 14.5A8.4 8.4 0 0 1 9.5 4a8.5 8.5 0 1 0 10.5 10.5Z"/>',
  settings: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.6 1.6 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.6 1.6 0 0 0-2.7 1.1v.2a2 2 0 1 1-4 0v-.1A1.6 1.6 0 0 0 7 19.4a1.6 1.6 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.6 1.6 0 0 0-1.1-2.7H1a2 2 0 1 1 0-4h.1A1.6 1.6 0 0 0 2.6 7a1.6 1.6 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.6 1.6 0 0 0 1.8.3H7a1.6 1.6 0 0 0 1-1.5V1a2 2 0 1 1 4 0v.1a1.6 1.6 0 0 0 2.7 1.1 1.6 1.6 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.6 1.6 0 0 0-.3 1.8V7a1.6 1.6 0 0 0 1.5 1H23a2 2 0 1 1 0 4h-.1a1.6 1.6 0 0 0-1.5 1z"/>',
  layers: '<path d="m12 3 9 5-9 5-9-5z"/><path d="m3 13 9 5 9-5M3 17l9 5 9-5"/>',
  filter: '<path d="M3 5h18l-7 8v6l-4 2v-8z"/>',
  refresh: '<path d="M20 11a8 8 0 0 0-14-4.5L4 9"/><path d="M4 5v4h4"/><path d="M4 13a8 8 0 0 0 14 4.5L20 15"/><path d="M20 19v-4h-4"/>',
  flame: '<path d="M12 3s5 4 5 8a5 5 0 0 1-10 0c0-1.6.8-3 1.6-4 .2 1.2 1 2 1.9 2 1.2 0 1.6-1.2 1.5-2.6A9.6 9.6 0 0 0 12 3Z"/>',
  book: '<path d="M4 4.5A2.5 2.5 0 0 1 6.5 2H20v17H6.5A2.5 2.5 0 0 0 4 21.5z"/><path d="M20 19H6.5A2.5 2.5 0 0 0 4 21.5"/>',
  bolt: '<path d="M13 2 4.5 13.5H11L10 22l8.5-11.5H12z"/>',
  check: '<path d="m5 12.5 4.5 4.5L19 7"/>',
  home: '<path d="M4 11 12 4l8 7v8a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 4 19z"/><path d="M9.5 20.5V14h5v6.5"/>',
  info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 7.8v.2"/>',
  fit: '<path d="M4 9V5.5A1.5 1.5 0 0 1 5.5 4H9M15 4h3.5A1.5 1.5 0 0 1 20 5.5V9M20 15v3.5a1.5 1.5 0 0 1-1.5 1.5H15M9 20H5.5A1.5 1.5 0 0 1 4 18.5V15"/>',
  path: '<circle cx="5" cy="6" r="2.2"/><circle cx="19" cy="18" r="2.2"/><path d="M7.2 6H13a3 3 0 0 1 0 6h-2a3 3 0 0 0 0 6h5.8"/>',
  external: '<path d="M14 4h6v6"/><path d="M20 4 11 13"/><path d="M18 14v4.5A1.5 1.5 0 0 1 16.5 20h-11A1.5 1.5 0 0 1 4 18.5v-11A1.5 1.5 0 0 1 5.5 6H10"/>',
  note: '<path d="M5 4.5A1.5 1.5 0 0 1 6.5 3h11A1.5 1.5 0 0 1 19 4.5V21l-3.5-2.2L12 21l-3.5-2.2L5 21z"/><path d="M8.5 8h7M8.5 12h5"/>',
  brain: '<path d="M12 5.5V19"/><path d="M9 5.5A2.5 2.5 0 0 0 6.5 8 2.5 2.5 0 0 0 5 12.5 2.6 2.6 0 0 0 6.8 17 2.6 2.6 0 0 0 9 19.5"/><path d="M15 5.5A2.5 2.5 0 0 1 17.5 8 2.5 2.5 0 0 1 19 12.5 2.6 2.6 0 0 1 17.2 17 2.6 2.6 0 0 1 15 19.5"/><path d="M9 5.5a3 3 0 0 1 6 0"/>'
};

export function icon(name, attrs = '') {
  const d = PATHS[name];
  if (!d) { console.warn(`[icons] unknown icon "${name}"`); return ''; }
  return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" ` +
         `stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" ${attrs}>${d}</svg>`;
}

export function iconNode(name, cls = '') {
  const wrap = document.createElement('span');
  wrap.className = cls;
  wrap.innerHTML = icon(name);
  return wrap.firstElementChild;
}

export const ICON_NAMES = Object.keys(PATHS);
