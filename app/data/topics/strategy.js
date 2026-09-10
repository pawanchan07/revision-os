/**
 * DOMAIN U — STRATEGY + BUSINESS (BUILD.md section 24)
 *
 * 12 topics, split across four files. This file is the domain's single
 * entry point; topics.js imports only from here.
 */
import { topics as market } from './strategy-market.js';
import { topics as moats } from './strategy-moats.js';
import { topics as economics } from './strategy-economics.js';
import { topics as growth } from './strategy-growth.js';

export const topics = [
  ...market,     // market-sizing, competitive-analysis, competitive-advantage
  ...moats,      // network-effects, switching-costs, business-models
  ...economics,  // unit-economics, ltv-cac, pricing, roi-cost-benefit
  ...growth      // growth-strategy, strategic-tradeoffs
];
