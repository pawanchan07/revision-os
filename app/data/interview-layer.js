/**
 * INTERVIEW / COMMUNICATION LAYER (BUILD.md section 28)
 *
 * "How I should explain this in a product interview", per topic. Kept separate
 * from the topic content because it is a LAYER over the corpus, not part of a
 * topic's definition — and because it lets the same voice be maintained across
 * domains without touching 25 content modules.
 *
 * Shape:
 *   s30       one or two sentences: what it is and why it matters
 *   s90       + a concrete example from real work + the trade-off, with a NUMBER
 *   technical mechanism, alternatives considered, where it breaks
 *   pm        why a product manager should care, in one or two sentences
 *   example   the real-world instance, when s90 does not already carry it
 *
 * A topic may still declare `interview:` inline; inline keys win and these fill
 * in the rest (see mergeInterview in topics.js).
 *
 * ⚠ The answers must not sound memorised (§28). Every s90 carries a specific
 *   number or named consequence drawn from that topic's own body — that is what
 *   separates it from a padded s30. See the `interview` domain for the method.
 */

import { INTERVIEW as AI_PM } from './interview/ai-pm.js';
import { INTERVIEW as PRODUCT } from './interview/product.js';
import { INTERVIEW as CORE_AI } from './interview/core-ai.js';
import { INTERVIEW as DATA_EVAL } from './interview/data-eval.js';
import { INTERVIEW as FOUNDATIONS } from './interview/foundations.js';
import { INTERVIEW as MECHANICS } from './interview/mechanics.js';

export const INTERVIEW = {
  ...AI_PM,
  ...PRODUCT,
  ...CORE_AI,
  ...DATA_EVAL,
  ...FOUNDATIONS,
  ...MECHANICS
};
