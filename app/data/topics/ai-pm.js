/**
 * DOMAIN T — AI PRODUCT MANAGEMENT (BUILD.md section 23)
 *
 * 15 topics, split across four files so no single content module
 * becomes unreadable. This file is the domain's single entry point;
 * topics.js imports only from here.
 */
import { topics as foundation } from './ai-pm-foundation.js';
import { topics as experience } from './ai-pm-experience.js';
import { topics as operations } from './ai-pm-operations.js';
import { topics as runtime } from './ai-pm-runtime.js';
import { topics as rollout } from './ai-pm-rollout.js';

export const topics = [
  ...foundation,   // ai-use-case-selection, ai-feasibility, ai-model-selection,
                   // ai-build-vs-buy, ai-product-roadmap
  ...experience,   // ai-ux, ai-trust, ai-adoption, ai-metrics, ai-experimentation
  ...operations,   // ai-cost
  ...runtime,      // ai-latency, ai-risk
  ...rollout       // ai-rollout, ai-pm-checklist
];
