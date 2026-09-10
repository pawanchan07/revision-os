/**
 * DOMAIN V — ECONOMICS + FINANCE BASICS (BUILD.md section 25)
 *
 * 14 topics, split across five files. This file is the domain's single
 * entry point; topics.js imports only from here.
 */
import { topics as core } from './economics-core.js';
import { topics as behaviour } from './economics-behaviour.js';
import { topics as information } from './economics-information.js';
import { topics as finance } from './economics-finance.js';
import { topics as macro } from './economics-macro.js';

export const topics = [
  ...core,         // supply-demand, elasticity, market-structure
  ...behaviour,    // incentives, opportunity-cost, marginal-analysis
  ...information,  // externalities, information-asymmetry, principal-agent
  ...finance,      // revenue-and-margins, contribution-margin, cash-flow,
                   // npv-payback
  ...macro         // interest-inflation
];
