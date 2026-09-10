import { TOPICS } from './app/data/topics.js';

const urls = [...new Set(TOPICS.flatMap(t => t.resources.map(r => r.url)))];
// Sample deterministically: one URL per host, capped, so a systematically wrong
// path pattern surfaces without hammering any single site.
const byHost = new Map();
for (const u of urls) {
  const h = new URL(u).host;
  if (!byHost.has(h)) byHost.set(h, []);
  byHost.get(h).push(u);
}
const sample = process.argv.includes("--all") ? urls : [...byHost.values()].map(l => l[0]);
console.log(`checking ${sample.length} URLs (one per host, ${urls.length} total)\n`);

const bad = [];
let done = 0;
const check = async (url) => {
  try {
    const c = new AbortController();
    const t = setTimeout(() => c.abort(), 12000);
    let r = await fetch(url, { method: 'HEAD', redirect: 'follow', signal: c.signal,
      headers: { 'user-agent': 'Mozilla/5.0 (link-check)' } });
    if (r.status === 405 || r.status === 403 || r.status === 501) {
      r = await fetch(url, { method: 'GET', redirect: 'follow', signal: c.signal,
        headers: { 'user-agent': 'Mozilla/5.0 (link-check)' } });
    }
    clearTimeout(t);
    if (r.status >= 400) bad.push(`${r.status}  ${url}`);
  } catch (e) {
    bad.push(`ERR   ${url}  (${e.name === 'AbortError' ? 'timeout' : e.message.slice(0, 40)})`);
  }
  done++;
};

const CONC = 12;
for (let i = 0; i < sample.length; i += CONC) {
  await Promise.all(sample.slice(i, i + CONC).map(check));
  process.stdout.write(`\r  ${done}/${sample.length}`);
}
console.log('\n');
if (!bad.length) console.log('✓ all sampled links resolved');
else { console.log(`${bad.length} of ${sample.length} did not resolve:\n`); for (const b of bad) console.log('  ' + b); }
