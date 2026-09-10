/**
 * DOMAIN R — PRODUCT MANAGEMENT (BUILD.md section 21)
 *
 * 21 topics, split across six files so no single content module
 * becomes unreadable. This file is the domain's single entry point;
 * topics.js imports only from here.
 */
import { topics as discovery } from './product-discovery.js';
import { topics as planning } from './product-planning.js';
import { topics as roadmapping } from './product-roadmap.js';
import { topics as delivery } from './product-delivery.js';
import { topics as agile } from './product-agile.js';
import { topics as outcomes } from './product-outcomes.js';

export const topics = [
  ...discovery,    // product-discovery, user-research, customer-interviews,
                   // problem-statements, jtbd
  ...planning,     // personas, journey-mapping, opportunity-sizing
  ...roadmapping,  // prioritization, roadmap, product-strategy
  ...delivery,     // prd-requirements, epics-user-stories, acceptance-criteria
  ...agile,        // backlog-management, sprint-planning, sprint-review-retro
  ...outcomes      // technical-debt, product-tradeoffs, product-metrics,
                   // north-star-metric
];
