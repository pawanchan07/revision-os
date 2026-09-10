/**
 * Content integrity check. Run with:  node check.mjs
 *
 * Reports topic counts per domain, dangling cross-references, missing required
 * fields, duplicate ids, unknown tool references and suspicious resource links.
 * This is the gate for BUILD.md section 52 ("every major topic is connected").
 */
import { TOPICS, TOPIC_BY_ID, validate } from './app/data/topics.js';
import { DOMAINS, DOMAIN_BY_ID } from './app/data/domains.js';
import { TOOL_BY_ID } from './app/data/tools.js';
import { COMPARISONS } from './app/data/comparisons.js';
import { INTERVIEW } from './app/data/interview-layer.js';
import { GRAPH } from './app/data/graph.js';

const RED = s => `\x1b[31m${s}\x1b[0m`;
const GRN = s => `\x1b[32m${s}\x1b[0m`;
const YEL = s => `\x1b[33m${s}\x1b[0m`;
const DIM = s => `\x1b[2m${s}\x1b[0m`;

const REQUIRED = ['id', 'title', 'domain', 'summary', 'what', 'why', 'analogy', 'technical', 'diagram'];
const EXPECTED_MIN = { questions: 3, keyTerms: 4, resources: 2 };

let errors = 0;
let warnings = 0;

console.log('\n' + '='.repeat(68));
console.log('  PREPARATION MAP — content check');
console.log('='.repeat(68) + '\n');

/* ---------- per-domain coverage ---------- */
console.log('DOMAIN COVERAGE');
let written = 0;
for (const d of DOMAINS) {
  const n = TOPICS.filter(t => t.domain === d.id).length;
  if (n > 0) written++;
  const bar = '█'.repeat(Math.min(n, 24)).padEnd(24, '·');
  const line = `  ${d.id.padEnd(18)} ${String(n).padStart(3)}  ${bar}`;
  console.log(n === 0 ? DIM(line) : line);
}
console.log(`\n  ${written}/${DOMAINS.length} domains written · ${TOPICS.length} topics total\n`);

/* ---------- required fields ---------- */
const missingFields = [];
const thinContent = [];
for (const t of TOPICS) {
  for (const f of REQUIRED) {
    if (!t[f] || String(t[f]).trim() === '') missingFields.push(`${t.id}.${f}`);
  }
  for (const [f, min] of Object.entries(EXPECTED_MIN)) {
    const n = (t[f] || []).length;
    if (n < min) thinContent.push(`${t.id}.${f} has ${n}, expected >= ${min}`);
  }
  if (!t.example) thinContent.push(`${t.id}.example missing`);
}

/* ---------- cross references ---------- */
const dangling = validate();

/* ---------- tool references ---------- */
const badTools = [];
for (const t of TOPICS) {
  for (const tool of t.tools || []) {
    if (!TOOL_BY_ID[tool]) badTools.push(`${t.id} -> unknown tool "${tool}"`);
  }
}

/* ---------- comparison references ---------- */
const badComparisonTopics = [];
for (const c of COMPARISONS) {
  for (const id of c.topics || []) {
    if (!TOPIC_BY_ID[id]) badComparisonTopics.push(`${c.id} -> unknown topic "${id}"`);
  }
}

/* ---------- interview layer (BUILD.md section 28) ---------- */
// The layer is keyed by topic id in a separate module, so a typo would
// silently attach the answer to nothing. This catches that.
const badInterviewKeys = [];
for (const id of Object.keys(INTERVIEW)) {
  if (!TOPIC_BY_ID[id]) badInterviewKeys.push(`interview layer -> unknown topic "${id}"`);
}

/* ---------- resources ---------- */
const badLinks = [];
for (const t of TOPICS) {
  for (const r of t.resources || []) {
    if (!/^https?:\/\//.test(r.url || '')) badLinks.push(`${t.id}: "${r.label}" -> ${r.url}`);
    if (!r.kind) badLinks.push(`${t.id}: "${r.label}" has no kind`);
  }
}

/* ---------- orphans ---------- */
const orphans = TOPICS.filter(t => {
  const adj = GRAPH.adjacency.get(t.id);
  return !adj || (adj.in.length + adj.out.length + adj.related.length) === 0;
});

/* ---------- report ---------- */
const report = (label, list, fatal = true) => {
  if (!list.length) { console.log(GRN(`  ✓ ${label}`)); return; }
  if (fatal) errors += list.length; else warnings += list.length;
  console.log((fatal ? RED : YEL)(`  ${fatal ? '✗' : '!'} ${label}: ${list.length}`));
  for (const item of list.slice(0, 15)) console.log(DIM(`      ${item}`));
  if (list.length > 15) console.log(DIM(`      … and ${list.length - 15} more`));
};

console.log('CHECKS');
report('all required fields present', missingFields);
report('no dangling cross-references', dangling);
report('all tool references resolve', badTools);
report('all comparison topic references resolve', badComparisonTopics);
report('interview layer keys resolve to topics', badInterviewKeys);
report('all resource links well-formed', badLinks);
report('every topic is connected to the graph', orphans.map(t => t.id), false);
report('content depth (questions / key terms / resources / example)', thinContent, false);

/* ---------- graph stats ---------- */
console.log('\nGRAPH');
console.log(`  nodes      ${GRAPH.nodes.length}  (${GRAPH.hubNodes.length} hubs, ${GRAPH.topicNodes.length} topics)`);
console.log(`  edges      ${GRAPH.edges.length}`);
console.log(`  arteries   ${GRAPH.arteries.length}`);
console.log(`  max depth  ${Math.max(...GRAPH.depth.values())}`);
console.log(`  comparisons ${COMPARISONS.length}`);
console.log(`  resources  ${TOPICS.reduce((n, t) => n + (t.resources || []).length, 0)}`);
console.log(`  questions  ${TOPICS.reduce((n, t) => n + (t.questions || []).length, 0)}`);
console.log(`  key terms  ${TOPICS.reduce((n, t) => n + (t.keyTerms || []).length, 0)}`);

console.log('\n' + '='.repeat(68));
if (errors) console.log(RED(`  ${errors} error(s), ${warnings} warning(s)`));
else if (warnings) console.log(YEL(`  no errors, ${warnings} warning(s)`));
else console.log(GRN('  all checks passed'));
console.log('='.repeat(68) + '\n');

process.exit(errors ? 1 : 0);
