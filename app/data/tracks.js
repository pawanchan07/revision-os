/**
 * The ten filterable knowledge tracks (BUILD.md section 32).
 * Each track owns a hue used consistently across the map, panels and charts.
 */
export const TRACKS = [
  { id: 'ai',          label: 'AI',          blurb: 'Models, LLMs, RAG, agents. How the intelligence itself works.' },
  { id: 'programming', label: 'Programming', blurb: 'Enough Python and Git to read, run and change AI code.' },
  { id: 'data',        label: 'Data',        blurb: 'SQL, analytics and the numbers behind product decisions.' },
  { id: 'product',     label: 'Product',     blurb: 'Discovery, delivery and the craft of product management.' },
  { id: 'strategy',    label: 'Strategy',    blurb: 'Markets, positioning and long-range trade-offs.' },
  { id: 'business',    label: 'Business',    blurb: 'Business models, pricing and unit economics.' },
  { id: 'economics',   label: 'Economics',   blurb: 'The economic and financial reasoning under every decision.' },
  { id: 'tools',       label: 'Tools',       blurb: 'The ecosystem: what each tool is for and when to reach for it.' },
  { id: 'evaluation',  label: 'Evaluation',  blurb: 'Proving an AI system is actually good enough to ship.' },
  { id: 'production',  label: 'Production',  blurb: 'Running AI safely and reliably once real users depend on it.' }
];

export const TRACK_BY_ID = Object.fromEntries(TRACKS.map(t => [t.id, t]));
