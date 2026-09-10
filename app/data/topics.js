/**
 * Topic registry.
 *
 * Content lives in one module per domain under ./topics/. This file only
 * aggregates and normalises it, so adding a topic never means touching
 * rendering code.
 *
 * Authoring shorthand (kept compact on purpose):
 *   keyTerms  : [ [term, definition], ... ]
 *   resources : [ [label, url, kind, note?], ... ]   kind: docs|tutorial|video|paper|repo|interactive|course
 *   questions : [ [question, answer], ... ]
 */
import { DOMAIN_BY_ID } from './domains.js';
import { COMPARISON_BY_ID } from './comparisons.js';
import { INTERVIEW } from './interview-layer.js';

import { topics as programming } from './topics/programming.js';
import { topics as dataSql } from './topics/data-sql.js';
import { topics as analytics } from './topics/analytics.js';
import { topics as mlFundamentals } from './topics/ml-fundamentals.js';
import { topics as llm } from './topics/llm.js';
import { topics as prompting } from './topics/prompting.js';
import { topics as embeddings } from './topics/embeddings.js';
import { topics as rag } from './topics/rag.js';
import { topics as localRag } from './topics/local-rag.js';
import { topics as openSource } from './topics/open-source.js';
import { topics as quantization } from './topics/quantization.js';
import { topics as agents } from './topics/agents.js';
import { topics as mcp } from './topics/mcp.js';
import { topics as finetuning } from './topics/finetuning.js';
import { topics as evaluation } from './topics/evaluation.js';
import { topics as observability } from './topics/observability.js';
import { topics as responsibleAi } from './topics/responsible-ai.js';
import { topics as mlops } from './topics/mlops.js';
import { topics as product } from './topics/product.js';
import { topics as systemsThinking } from './topics/systems-thinking.js';
import { topics as aiPm } from './topics/ai-pm.js';
import { topics as strategy } from './topics/strategy.js';
import { topics as economics } from './topics/economics.js';
import { topics as toolsDomain } from './topics/tools.js';
import { topics as interview } from './topics/interview.js';

const RAW = [
  ...programming, ...dataSql, ...analytics,
  ...mlFundamentals, ...llm, ...prompting, ...embeddings,
  ...rag, ...localRag, ...openSource, ...quantization,
  ...agents, ...mcp, ...finetuning,
  ...evaluation, ...observability, ...responsibleAi, ...mlops,
  ...product, ...systemsThinking, ...aiPm,
  ...strategy, ...economics, ...toolsDomain, ...interview
];

const RESOURCE_KINDS = {
  docs:        { label: 'Documentation', glyph: 'D' },
  tutorial:    { label: 'Tutorial',      glyph: 'T' },
  video:       { label: 'Video',         glyph: 'V' },
  course:      { label: 'Course',        glyph: 'C' },
  paper:       { label: 'Paper',         glyph: 'P' },
  repo:        { label: 'Repository',    glyph: 'R' },
  interactive: { label: 'Interactive',   glyph: 'I' },
  reference:   { label: 'Reference',     glyph: 'D' }
};
export { RESOURCE_KINDS };

function pair(list, aKey, bKey, extraKey) {
  return (list || []).map(item => {
    if (Array.isArray(item)) {
      const out = { [aKey]: item[0], [bKey]: item[1] };
      if (extraKey) out[extraKey] = item[2];
      if (extraKey && item[3] !== undefined) out.note = item[3];
      return out;
    }
    return item;
  });
}

function normalise(t) {
  const domain = DOMAIN_BY_ID[t.domain];
  if (!domain) console.warn(`[topics] "${t.id}" references unknown domain "${t.domain}"`);
  return {
    tier: 2,
    priority: 'medium',
    prereq: [], next: [], related: [], tools: [],
    useCases: [], avoid: [], mistakes: [],
    ...t,
    track: domain ? domain.track : 'ai',
    domainTitle: domain ? domain.title : t.domain,
    keyTerms: pair(t.keyTerms, 'term', 'def'),
    resources: pair(t.resources, 'label', 'url', 'kind'),
    questions: pair(t.questions, 'q', 'a'),
    interview: mergeInterview(t)
  };
}

/**
 * BUILD.md section 28 treats "how to explain this out loud" as a LAYER over the
 * topics rather than part of them, so it lives in its own module. A topic may
 * still declare `interview:` inline; inline keys win, and the layer fills the
 * rest in. Returns undefined when neither supplies anything, so the panel
 * omits the section entirely.
 */
function mergeInterview(t) {
  const layer = INTERVIEW[t.id];
  if (!layer && !t.interview) return undefined;
  return { ...layer, ...t.interview };
}

export const TOPICS = RAW.map(normalise);
export const TOPIC_BY_ID = Object.fromEntries(TOPICS.map(t => [t.id, t]));

export function topicsInDomain(domainId) {
  return TOPICS.filter(t => t.domain === domainId);
}

export function getTopic(id) { return TOPIC_BY_ID[id] || null; }

/** Resolve a list of topic ids to topic objects, dropping anything unknown. */
export function resolve(ids) {
  return (ids || []).map(id => TOPIC_BY_ID[id]).filter(Boolean);
}

/** Development-time integrity check: reports dangling cross-references. */
export function validate() {
  const problems = [];
  const seen = new Set();
  for (const t of TOPICS) {
    if (seen.has(t.id)) problems.push(`duplicate topic id: ${t.id}`);
    seen.add(t.id);
    for (const key of ['prereq', 'next', 'related']) {
      for (const ref of t[key]) {
        // `related` may also name a domain hub or a comparison (BUILD.md s48);
        // the topic panel renders each of those in its own group.
        const known = TOPIC_BY_ID[ref] || DOMAIN_BY_ID[ref] ||
          (key === 'related' && COMPARISON_BY_ID[ref]);
        if (!known) problems.push(`${t.id}.${key} -> unknown "${ref}"`);
      }
    }
  }
  return problems;
}
