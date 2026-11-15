/**
 * Builds the data files for the reading guide from the same content modules
 * the map uses. Run from the repo root:  node guide/build.mjs
 * Nothing is rewritten or dropped: every topic, tool and comparison is copied.
 */
import { writeFileSync, mkdirSync } from 'node:fs';
import { TOPICS } from '../app/data/topics.js';
import { DOMAINS } from '../app/data/domains.js';
import { TOOLS, TOOL_GROUPS } from '../app/data/tools.js';
import { COMPARISONS } from '../app/data/comparisons.js';

const out = new URL('./data/', import.meta.url).pathname;
mkdirSync(out + 'd', { recursive: true });

// Reading order: foundations first, then AI core, then production, then product and business.
const ORDER = ['programming', 'data-sql', 'analytics', 'ml-fundamentals', 'llm', 'prompting',
  'embeddings', 'rag', 'local-rag', 'open-source', 'quantization', 'agents', 'mcp', 'finetuning',
  'evaluation', 'observability', 'responsible-ai', 'mlops', 'product', 'systems-thinking',
  'ai-pm', 'strategy', 'economics', 'tools', 'interview'];
const missing = DOMAINS.filter(d => !ORDER.includes(d.id)).map(d => d.id);
const order = [...ORDER.filter(id => DOMAINS.some(d => d.id === id)), ...missing];

const index = { domains: [], tools: TOOLS.length, comparisons: COMPARISONS.map(c => ({ id: c.id, title: c.title })) };
let count = 0;
for (const id of order) {
  const d = DOMAINS.find(x => x.id === id);
  const topics = TOPICS.filter(t => t.domain === id);
  count += topics.length;
  index.domains.push({
    id, title: d.title, blurb: d.blurb,
    topics: topics.map(t => ({ id: t.id, title: t.title, summary: t.summary, priority: t.priority,
      terms: t.keyTerms.map(k => k.term).join(' | ') }))
  });
  writeFileSync(`${out}d/${id}.json`, JSON.stringify(topics.map(({ track, domainTitle, ...t }) => t)));
}
if (count !== TOPICS.length) throw new Error(`topic count mismatch: ${count} vs ${TOPICS.length}`);
writeFileSync(out + 'index.json', JSON.stringify(index));
writeFileSync(out + 'tools.json', JSON.stringify({ groups: TOOL_GROUPS, tools: TOOLS }));
writeFileSync(out + 'comparisons.json', JSON.stringify(COMPARISONS));
console.log(`guide data: ${order.length} domains, ${count} topics, ${TOOLS.length} tools, ${COMPARISONS.length} comparisons`);
