/**
 * DOMAIN T — AI PRODUCT MANAGEMENT, part 3 of 3: running it in the world
 */
export const topics = [
  {
    id: 'ai-cost',
    title: 'AI Cost',
    domain: 'ai-pm', tier: 1, priority: 'high',
    summary: 'Where the money actually goes, and why the input tokens are usually the bill.',
    what: `AI cost is what it costs to run a feature: model inference, embedding, storage, serving infrastructure, and the human review the system requires to keep working.`,
    why: `AI features have a per-request marginal cost that conventional software does not, so unit economics matter from the first user rather than at scale. Teams that estimate on the output size are routinely wrong by an order of magnitude.`,
    analogy: `Metered utilities rather than a fixed rent. Every use costs something, so a design decision that adds a little to every request is a permanent tax.`,
    technical: `**Input tokens usually dominate.** A RAG request sends a system prompt, retrieved chunks and conversation history — often several thousand tokens — to produce a two-hundred-token answer. Teams estimate on the answer and are surprised by the bill.

The levers, in rough order of effect:
1. **Send less context.** Retrieve fewer chunks, rerank so fewer are needed, trim history. This is usually the largest and safest saving.
2. **Route by difficulty.** A small model on the easy majority typically cuts blended cost several-fold.
3. **Cache.** Prompt caching for stable prefixes; result caching for repeated questions. In support workloads repeat rates are high.
4. **Cap output.** Set max tokens deliberately rather than by default.
5. **Batch** anything not interactive.

**Count the costs that are not tokens.** Human review of flagged errors, golden-set maintenance and re-embedding after a corpus change are real recurring costs, and they are the ones missing from every early estimate.

**Retries and failures cost full price.** A pipeline that retries twice on 5% of requests costs 10% more than the naive calculation.

**Measure cost per outcome, not per request.** Cost per resolved question is the number that matters. A cheaper model that needs two attempts is not cheaper.`,
    diagram: `
   ⚠ INPUT TOKENS USUALLY DOMINATE

     a RAG request:
       system prompt        ~400 tokens
       retrieved chunks   ~4,000 tokens
       history            ~1,200 tokens
       ─────────────────────────────────
       INPUT              ~5,600 tokens
       OUTPUT               ~200 tokens

     teams estimate on the 200 and are surprised by the bill

   LEVERS, IN ROUGH ORDER OF EFFECT

     1  SEND LESS CONTEXT      fewer chunks · rerank · trim history
                               ← largest and safest saving
     2  ROUTE BY DIFFICULTY    small model on the easy majority
     3  CACHE                  prompt prefix + repeated questions
     4  CAP OUTPUT             deliberately, not by default
     5  BATCH                  anything non-interactive

   ⚠ COUNT THE COSTS THAT ARE NOT TOKENS

     human review of flagged errors      recurring
     golden-set maintenance              recurring
     re-embedding after a corpus change  lumpy, and forgotten

     these are missing from every early estimate

   ⚠ RETRIES COST FULL PRICE

     retry twice on 5% of requests = +10% on the naive number

   MEASURE COST PER OUTCOME, NOT PER REQUEST

     cost per RESOLVED question is the number that matters
     a cheaper model needing two attempts is not cheaper`,
    example: {
      language: 'python',
      caption: 'Where the money goes, and what actually reduced it',
      code: `PRICE = {"in": 3.00/1e6, "out": 15.00/1e6}   # per token

def monthly(requests, in_tok, out_tok, *, retry_rate=0.0):
    effective = requests * (1 + retry_rate)
    return round(effective * (in_tok*PRICE["in"] + out_tok*PRICE["out"]))

# ── BASELINE ───────────────────────────────────────────────
print(monthly(240_000, in_tok=5600, out_tok=200, retry_rate=0.05))
# 4,838   (USD/month)
#
# breakdown per request:
#   input   5600 × $3/M  = $0.0168    ← 85% of the cost
#   output   200 × $15/M = $0.0030
#   retries                +5%

# ⚠ THE OUTPUT IS THE EXPENSIVE TOKEN AND THE CHEAP LINE ITEM.
#   Optimising answer length would save ~$150/month.
#   Optimising context would save ~$2,000.

# ── LEVER 1: send less context ─────────────────────────────
# retrieve 15, rerank, send 5 → 4000 chunk tokens becomes 1400
print(monthly(240_000, in_tok=3000, out_tok=200, retry_rate=0.05))
# 2,873   (-41%)
# ⚠ and quality went UP — reranking sends better chunks, not
#   just fewer. This is the rare saving with no trade.

# ── LEVER 2: route by difficulty ───────────────────────────
easy  = monthly(187_000, 3000, 200, retry_rate=0.05) * (0.25/3.00)
hard  = monthly( 53_000, 3000, 200, retry_rate=0.05)
print(round(easy + hard))
# 821    (-83% from baseline)

# ── LEVER 3: prompt caching on the stable prefix ───────────
# system prompt + policy preamble = 1400 tokens, identical
# every request, cached at 10% of the input price
print(round(821 * 0.82))
# 673

# ── ⚠ THE COSTS THAT ARE NOT TOKENS ────────────────────────
NON_TOKEN_MONTHLY = {
    "embedding (corpus updates)":        40,
    "vector storage":                    25,
    "tracing + eval tooling":           180,
    "human error review 3h/wk":         520,   # ← the big one
    "golden-set maintenance 2h/mo":      90,
    "re-embedding on corpus change":    110,   # amortised
}
print(sum(NON_TOKEN_MONTHLY.values()))
# 965   ← MORE than the inference bill after optimisation

# ⚠ THE FEATURE COSTS $673 IN TOKENS AND $965 IN EVERYTHING
#   ELSE. The early estimate counted only the first number,
#   and the human review line is the one that gets cut when
#   budgets tighten — which is the line that keeps it working.

# ── COST PER OUTCOME ───────────────────────────────────────
resolved = 240_000 * 0.71 * 0.83        # answered × accepted
print(round((673 + 965) / resolved, 4))
# 0.0116 per resolved question
# Compare against: 6 minutes of agent time ≈ $0.90
# → ~77x cheaper per resolution. THAT is the business case,
#   and it is a different number from cost per request.`
    },
    prereq: [], next: ['ai-latency'],
    related: ['token-usage-cost', 'ai-model-selection', 'size-quality-tradeoff', 'unit-economics', 'context-assembly'],
    tools: ['anthropic', 'openai', 'ollama', 'vllm'],
    useCases: [
      'Forecasting the cost of an AI feature before building it.',
      'Reducing spend without reducing quality.',
      'Making the business case on cost per outcome.'
    ],
    avoid: [
      'Estimating from output length.',
      'Budgeting inference only and omitting human review.'
    ],
    mistakes: [
      'Optimising answer length when context length is 85% of the bill.',
      'Omitting retries, which add real percentage points.',
      'Leaving human review out of the running cost, then cutting it when budgets tighten.',
      'Reporting cost per request rather than cost per resolved outcome.'
    ],
    keyTerms: [
      ['input tokens', 'System prompt, context and history. Usually the bill.'],
      ['prompt caching', 'Reusing a stable prefix at reduced cost.'],
      ['routing', 'Sending easy traffic to a cheaper model.'],
      ['blended cost', 'Average cost across a routed traffic mix.'],
      ['non-token cost', 'Review, maintenance, storage, re-embedding.'],
      ['cost per outcome', 'Cost per resolved question, not per request.']
    ],
    resources: [
      ['Anthropic — pricing', 'https://docs.anthropic.com/en/docs/about-claude/pricing', 'docs'],
      ['Anthropic — prompt caching', 'https://docs.anthropic.com/en/docs/build-with-claude/prompt-caching', 'docs'],
      ['OpenAI — pricing', 'https://openai.com/api/pricing/', 'reference']
    ],
    questions: [
      ['Why do cost estimates come out an order of magnitude wrong?', 'They are made on the output length. In a RAG request the input — system prompt, retrieved chunks, history — is typically 85% of the cost.'],
      ['What is the largest safe cost lever?', 'Sending less context. Retrieving more and reranking down to fewer chunks reduces input tokens substantially and usually improves quality at the same time.'],
      ['Why measure cost per outcome?', 'Cost per request is not the business case. A cheaper model that needs two attempts is not cheaper, and comparing cost per resolved question against the human alternative is what makes the argument.']
    ]
  }
];
