/**
 * Module gate for every JS file in the app.
 *
 * Content modules are full of Python f-strings, markdown backticks and
 * apostrophes living inside JS template literals, so the recurring authoring
 * hazards are an unescaped `${`, a stray backtick, and an over-escaped quote.
 *
 * IMPORTANT: `node --check` is NOT sufficient. It parses ambiguous files as
 * CommonJS and silently accepts things that fail as ES modules — it missed a
 * real syntax error in a view file. Actually importing each module is the only
 * authoritative check, so that is what this does.
 *
 * Browser-only modules are imported inside a minimal DOM shim, since they
 * touch `document` at import time.
 *
 * Run with: node lint-content.mjs
 */
import { readdirSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const DIRS = [
  'app/data', 'app/data/topics',
  'app/js', 'app/js/core', 'app/js/components', 'app/js/views'
];

/* ---- minimal DOM shim so browser modules can be imported ---- */
function installShim() {
  const node = () => ({
    style: { setProperty() {} }, dataset: {}, classList: {
      add() {}, remove() {}, toggle() {}, contains() { return false; }
    },
    setAttribute() {}, getAttribute() { return null; }, appendChild() {},
    insertBefore() {}, removeChild() {}, addEventListener() {},
    querySelector() { return null; }, querySelectorAll() { return []; },
    replaceChildren() {}, remove() {}, focus() {}, scrollIntoView() {},
    getBoundingClientRect: () => ({ x: 0, y: 0, width: 0, height: 0, top: 0, left: 0 }),
    set innerHTML(_) {}, get innerHTML() { return ''; },
    set textContent(_) {}, get textContent() { return ''; },
    get firstChild() { return null; }, get firstElementChild() { return null; },
    get offsetWidth() { return 0; }, get offsetHeight() { return 0; },
    get clientWidth() { return 0; }, get clientHeight() { return 0; }
  });

  globalThis.document = {
    documentElement: node(),
    body: node(),
    createElement: node,
    createElementNS: node,
    createTextNode: () => ({}),
    getElementById: () => null,
    querySelector: () => null,
    querySelectorAll: () => [],
    addEventListener() {}
  };
  globalThis.window = { addEventListener() {}, location: { hash: '' }, matchMedia: () => ({ matches: false }) };
  globalThis.location = { hash: '', replace() {} };
  globalThis.localStorage = { getItem: () => null, setItem() {}, removeItem() {} };
  globalThis.requestAnimationFrame = fn => setTimeout(fn, 0);
  globalThis.ResizeObserver = class { observe() {} disconnect() {} };
  globalThis.MutationObserver = class { observe() {} disconnect() {} };
  globalThis.performance ??= { now: () => 0 };
  globalThis.CSS = { escape: s => String(s) };
}

installShim();

const files = [];
for (const dir of DIRS) {
  let entries;
  try { entries = readdirSync(dir, { withFileTypes: true }); } catch { continue; }
  for (const e of entries) {
    if (e.isFile() && e.name.endsWith('.js')) files.push(join(dir, e.name));
  }
}

let failed = 0;

// Modules log during import (main.js runs its own boot). Silence that so only
// real load failures are reported.
const realLog = console.log, realWarn = console.warn, realError = console.error;
const silence = () => { console.log = console.warn = console.error = () => {}; };
const restore = () => { console.log = realLog; console.warn = realWarn; console.error = realError; };

for (const file of files) {
  try {
    silence();
    await import(pathToFileURL(resolve(file)).href);
    restore();
  } catch (err) {
    restore();                       // or the failure itself would be silenced
    failed++;
    console.log(`\n\x1b[31m✗ ${file}\x1b[0m`);
    console.log(`  ${err.name}: ${err.message}`);
  }
}

console.log(
  failed
    ? `\n\x1b[31m${failed} of ${files.length} module(s) failed to load\x1b[0m`
    : `\x1b[32m✓ all ${files.length} modules import cleanly\x1b[0m`
);
process.exit(failed ? 1 : 0);
