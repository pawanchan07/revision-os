/**
 * The 25 knowledge domains that structure the Preparation Map.
 *
 * `x` / `y` are curated world coordinates. They are hand-placed rather than
 * force-simulated so the map looks identical every time you open it. The whole
 * point is that the layout becomes a place you remember.
 *
 * Reading direction: foundations (left) -> AI core (centre) -> production and
 * governance (right). Product sits along the top, data and infrastructure
 * along the bottom.
 */
export const DOMAINS = [
  // ---- Product band (top) -------------------------------------------------
  {
    id: 'product', title: 'Product Management', short: 'Product',
    track: 'product', x: 360, y: 300,
    blurb: 'Discovery, prioritisation, delivery. How a product actually gets decided and shipped.'
  },
  {
    id: 'systems-thinking', title: 'System Thinking for PMs', short: 'Systems',
    track: 'product', x: 760, y: 160,
    blurb: 'Seeing a feature as a system: upstream causes, downstream blast radius.'
  },
  {
    id: 'ai-pm', title: 'AI Product Management', short: 'AI PM',
    track: 'product', x: 1450, y: 170,
    blurb: 'Everything else, combined: choosing, shipping and governing AI features.'
  },
  {
    id: 'strategy', title: 'Strategy & Business', short: 'Strategy',
    track: 'strategy', x: 2130, y: 220,
    blurb: 'Markets, models, pricing, moats and the economics of an AI business.'
  },
  {
    id: 'economics', title: 'Economics & Finance', short: 'Economics',
    track: 'economics', x: 2460, y: 500,
    blurb: 'The reasoning underneath every business decision, from incentives to NPV.'
  },

  // ---- Foundations (left) -------------------------------------------------
  {
    id: 'programming', title: 'Programming Foundations', short: 'Programming',
    track: 'programming', x: 350, y: 660,
    blurb: 'Enough Python to read AI code, change it, debug it and prototype with it.'
  },
  {
    id: 'data-sql', title: 'Data & SQL', short: 'SQL',
    track: 'data', x: 330, y: 1010,
    blurb: 'Databases and SQL, aimed squarely at answering product questions.'
  },
  {
    id: 'analytics', title: 'Product Analytics', short: 'Analytics',
    track: 'data', x: 380, y: 1350,
    blurb: 'Events, funnels, cohorts, experiments. Measuring what actually happened.'
  },

  // ---- AI core spine (centre) --------------------------------------------
  {
    id: 'ml-fundamentals', title: 'ML Fundamentals', short: 'ML',
    track: 'ai', x: 730, y: 730,
    blurb: 'What learning from data means, from absolute zero: features, loss, training.'
  },
  {
    id: 'llm', title: 'LLM Fundamentals', short: 'LLM',
    track: 'ai', x: 1070, y: 700,
    blurb: 'Tokens to transformers to next-token prediction. The engine room.'
  },
  {
    id: 'prompting', title: 'Prompting & Context', short: 'Prompting',
    track: 'ai', x: 1090, y: 400,
    blurb: 'Steering a model with instructions, examples and a carefully built context.'
  },
  {
    id: 'finetuning', title: 'Fine-tuning & Training', short: 'Fine-tuning',
    track: 'ai', x: 1430, y: 520,
    blurb: 'Changing the model itself, and knowing when you absolutely should not.'
  },
  {
    id: 'embeddings', title: 'Embeddings & Vector Search', short: 'Embeddings',
    track: 'ai', x: 1050, y: 1040,
    blurb: 'Turning meaning into numbers so similarity becomes something you can compute.'
  },
  {
    id: 'rag', title: 'RAG', short: 'RAG',
    track: 'ai', x: 1430, y: 880,
    blurb: 'Retrieval-augmented generation, end to end, with every box explained.'
  },
  {
    id: 'local-rag', title: 'Local RAG', short: 'Local RAG',
    track: 'ai', x: 1420, y: 1200,
    blurb: 'The same architecture running entirely on your own machine.'
  },
  {
    id: 'agents', title: 'AI Agents', short: 'Agents',
    track: 'ai', x: 1800, y: 620,
    blurb: 'Models that decide, call tools, observe results and loop.'
  },
  {
    id: 'mcp', title: 'MCP', short: 'MCP',
    track: 'ai', x: 2120, y: 450,
    blurb: 'The standard interface between a model and the systems it can touch.'
  },

  // ---- Infrastructure (bottom centre) ------------------------------------
  {
    id: 'open-source', title: 'Open Source & Hugging Face', short: 'Open Source',
    track: 'tools', x: 1050, y: 1370,
    blurb: 'Models as artefacts you can download, inspect and run yourself.'
  },
  {
    id: 'quantization', title: 'Quantization & Local Inference', short: 'Quantization',
    track: 'tools', x: 1420, y: 1510,
    blurb: 'What 7B actually means, and what it costs in memory, speed and quality.'
  },
  {
    id: 'tools', title: 'Tools Ecosystem', short: 'Tools',
    track: 'tools', x: 760, y: 1420,
    blurb: 'A map of the tooling landscape and how to choose between the options.'
  },

  // ---- Evaluation & production (right) -----------------------------------
  {
    id: 'evaluation', title: 'AI Evaluation', short: 'Evaluation',
    track: 'evaluation', x: 1810, y: 960,
    blurb: 'Golden sets, judges, thresholds and quality gates. How you know it works.'
  },
  {
    id: 'observability', title: 'AI Quality & Observability', short: 'Observability',
    track: 'evaluation', x: 2140, y: 1130,
    blurb: 'Tracing, cost, drift and hallucination monitoring once real users arrive.'
  },
  {
    id: 'responsible-ai', title: 'Responsible AI', short: 'Responsible AI',
    track: 'production', x: 2150, y: 820,
    blurb: 'Privacy, safety, governance and regulation, from a product manager point of view.'
  },
  {
    id: 'mlops', title: 'MLOps / ModelOps', short: 'MLOps',
    track: 'production', x: 1800, y: 1290,
    blurb: 'Deploying, versioning, monitoring, retraining and rolling back models.'
  },

  // ---- Communication ------------------------------------------------------
  {
    id: 'interview', title: 'Interview & Communication', short: 'Interview',
    track: 'product', x: 2460, y: 1400,
    blurb: 'Explaining any of this out loud, at three depths, without sounding rehearsed.'
  }
];

export const DOMAIN_BY_ID = Object.fromEntries(DOMAINS.map(d => [d.id, d]));

