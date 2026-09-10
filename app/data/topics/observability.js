/**
 * DOMAIN O — AI QUALITY + OBSERVABILITY (BUILD.md section 18)
 * "Do not merely list tools. Explain what problem each solves."
 */
export const topics = [
  {
    id: 'tracing',
    title: 'Tracing',
    domain: 'observability', tier: 1, priority: 'high',
    summary: 'The recorded detail of one request, end to end — the closest thing AI has to a stack trace.',
    what: `A trace records everything that happened during one request: the question, the retrieved chunks and their scores, the fully assembled prompt, the model's response, token counts, latency per stage, and any tool calls.

It is what lets you answer "why did *this specific* answer go wrong?"`,
    why: `Without tracing, an AI failure is unfalsifiable. A user says the answer was wrong; you cannot see what the model was given, so you cannot tell whether retrieval failed, the prompt was truncated, or the model ignored the context. You are reduced to guessing.

Tracing is the single highest-value observability investment in an AI system, and it must be in place before launch — you cannot reconstruct a trace after the fact.`,
    analogy: `A flight data recorder. Nobody wants to need it. When something goes wrong, it is the difference between knowing what happened and speculating about it forever.`,
    technical: `A useful trace captures, per request:
- **Input** — the question, verbatim, plus the user context and any conversation history.
- **Retrieval** — the query actually sent (after any rewriting), every chunk returned, with ids, scores and sources.
- **The assembled prompt** — the exact text sent to the model. This is the single most valuable field and the one most often missing.
- **Output** — the response, token counts, finish reason.
- **Versions** — prompt version, model version, index version.
- **Timing** — per stage, not just total.
- **Outcome** — gate decisions, evaluation scores, user feedback.

**Structure it as a span tree** so nested operations (an agent loop, a rerank inside retrieval) are visible in relation to each other. OpenTelemetry is the standard, which keeps AI traces in the same system as the rest of your telemetry.

**Redact PII** before storage, and set a retention period. Traces contain everything the user typed.`,
    diagram: `
   ONE TRACE, AS A SPAN TREE

   request  ────────────────────────────────────── 2,340 ms
   ├─ query_rewrite ──────── 310 ms
   │    in:  "what about annual?"
   │    out: "refund window for annual plans?"
   ├─ retrieval ──────────── 84 ms
   │    query_vector: [...]
   │    filters: {version: 2026-Q1, acl: [support]}
   │    returned 25 chunks
   │    ├─ billing:0007  score 0.71  billing-policy.pdf p.4
   │    ├─ billing:0012  score 0.68  billing-policy.pdf p.5
   │    └─ faq:0003      score 0.61  faq.md
   ├─ rerank ─────────────── 121 ms
   │    kept 4 of 25
   ├─ generation ─────────── 1,690 ms
   │    ★ PROMPT (3,412 tokens)  ← the most valuable field
   │      "Answer using ONLY the context below…"
   │    response: "Annual subscriptions are refundable…"
   │    tokens_in 3,412  tokens_out 218  finish: end_turn
   └─ groundedness ───────── 135 ms
        score 0.93  → gate PASSED

   versions: prompt=answer_v4  model=sonnet-5  index=2026-03-11

   ⚠ THE ASSEMBLED PROMPT IS THE FIELD PEOPLE FORGET
     and it is the one that answers "did the model even have
     the information?" — which decides whether you are looking
     at a retrieval problem or a prompt problem.

   ⚠ TRACES CONTAIN EVERYTHING THE USER TYPED.
     Redact PII before storage. Set a retention period.`,
    example: {
      language: 'python',
      caption: 'Tracing with OpenTelemetry, capturing what actually matters',
      code: `from opentelemetry import trace
tracer = trace.get_tracer("rag")

def answer(question, user):
    with tracer.start_as_current_span("rag.request") as root:
        root.set_attribute("input.question", redact(question))
        root.set_attribute("user.role", user.role)
        root.set_attribute("version.prompt", PROMPT_VERSION)
        root.set_attribute("version.model", MODEL_VERSION)
        root.set_attribute("version.index", INDEX_VERSION)

        with tracer.start_as_current_span("rag.retrieve") as span:
            query = rewrite(question)
            span.set_attribute("query.rewritten", query)
            hits = store.search(embed(query), limit=25, filter=acl(user))
            span.set_attribute("retrieval.count", len(hits))
            span.set_attribute("retrieval.best_score",
                               hits[0]["score"] if hits else 0)
            # The chunk ids and scores — needed to diagnose a bad answer
            span.set_attribute("retrieval.chunk_ids",
                               [h["id"] for h in hits[:10]])
            span.set_attribute("retrieval.scores",
                               [round(h["score"], 3) for h in hits[:10]])

        with tracer.start_as_current_span("rag.rerank") as span:
            top = reranker.rank(query, hits)[:4]
            span.set_attribute("rerank.kept", len(top))
            span.set_attribute("rerank.sources",
                               [t["payload"]["source"] for t in top])

        with tracer.start_as_current_span("rag.generate") as span:
            prompt = build_prompt(top, question)
            # ★ THE MOST VALUABLE ATTRIBUTE IN THE WHOLE TRACE
            span.set_attribute("prompt.text", redact(prompt))
            span.set_attribute("prompt.tokens", estimate_tokens(prompt))

            out = llm(prompt)
            span.set_attribute("output.text", redact(out.text))
            span.set_attribute("output.tokens_in", out.tokens_in)
            span.set_attribute("output.tokens_out", out.tokens_out)
            span.set_attribute("output.finish_reason", out.finish_reason)
            span.set_attribute("output.cost_usd", out.cost)

        with tracer.start_as_current_span("rag.groundedness") as span:
            score = groundedness(out.text, prompt)
            span.set_attribute("eval.groundedness", score)
            span.set_attribute("gate.passed", score >= 0.85)

        root.set_attribute("trace.id", root.get_span_context().trace_id)
        return {"text": out.text, "trace_id": root.get_span_context().trace_id}`
    },
    prereq: [], next: ['logging-llm', 'token-usage-cost'],
    related: ['debugging', 'rag-failure-modes', 'agent-loop', 'privacy-pii'],
    tools: ['langsmith', 'phoenix', 'braintrust', 'opentelemetry'],
    useCases: [
      'Diagnosing why one specific answer was wrong.',
      'Reproducing a user-reported failure exactly.',
      'Attributing latency to the stage that caused it.'
    ],
    avoid: [
      'Storing full traces indefinitely — they contain user data and grow fast.',
      'Tracing without redaction in any regulated context.'
    ],
    mistakes: [
      'Not capturing the assembled prompt, which is the field that answers the key diagnostic question.',
      'Traces without version attributes, so a regression cannot be attributed to a change.',
      'Adding tracing after launch, when the failures you needed to diagnose have already gone unrecorded.',
      'A flat log instead of a span tree, so nested operations cannot be related.',
      'No retention policy on traces containing personal data.'
    ],
    keyTerms: [
      ['trace', 'The complete record of one request.'],
      ['span', 'One operation within a trace; spans nest into a tree.'],
      ['attribute', 'A key-value pair recorded on a span.'],
      ['assembled prompt', 'The exact text sent to the model. The critical field.'],
      ['trace id', 'The identifier linking a user report to its recorded request.'],
      ['OpenTelemetry', 'The vendor-neutral tracing standard.'],
      ['redaction', 'Removing PII before a trace is stored.']
    ],
    resources: [
      ['OpenTelemetry — traces', 'https://opentelemetry.io/docs/concepts/signals/traces/', 'docs'],
      ['LangSmith — tracing', 'https://docs.smith.langchain.com/observability', 'docs'],
      ['Arize Phoenix — tracing', 'https://arize.com/docs/phoenix/tracing/llm-traces', 'docs'],
      ['OpenTelemetry — GenAI semantic conventions', 'https://opentelemetry.io/docs/specs/semconv/gen-ai/', 'docs']
    ],
    questions: [
      ['What is the single most valuable field in an AI trace?', 'The fully assembled prompt. It answers whether the model even had the information, which determines whether you are looking at a retrieval problem or a prompt problem.'],
      ['Why must tracing be in place before launch?', 'You cannot reconstruct a trace after the fact. Failures that occur before tracing exists are unfalsifiable — you can only speculate about them.'],
      ['Why record version attributes on every trace?', 'So a quality regression can be attributed to a specific prompt, model or index change. Without them, "it got worse last Tuesday" has no path to a cause.']
    ],
    interview: {
      s30: 'A trace is the complete record of one request — the question, the retrieved chunks with scores, the exact prompt sent, the response, tokens, latency per stage. It is the closest thing an AI system has to a stack trace.',
      s90: 'Without tracing, an AI failure is unfalsifiable. A customer says the answer was wrong, and you cannot see what the model was given, so you cannot tell whether retrieval failed, the context was truncated, or the model ignored what it had. The field people most often forget to capture is the fully assembled prompt, and it is the one that matters most — it answers whether the information was even present, which decides whether you are debugging retrieval or debugging the prompt. I also insist on version attributes, prompt and model and index, so a regression can be traced to a change rather than argued about. And it has to be in place before launch, because you cannot reconstruct a trace afterwards.',
      pm: 'It is the difference between a bug report you can act on and one you can only apologise for.'
    }
  },

  {
    id: 'logging-llm',
    title: 'Logging for AI Systems',
    domain: 'observability', tier: 2, priority: 'medium',
    summary: 'What to record on every request, and what must never be recorded.',
    what: `Logging captures structured events from an AI system: what was asked, what happened, what it cost, and what the outcome was — in a form you can query and aggregate.

Distinct from tracing: a trace is the detail of one request; logs are the aggregate stream you query across many.`,
    why: `Logs are what let you answer questions across requests: how often does the gate trip, which categories have the worst groundedness, what did last month cost by feature. Traces answer "why this one"; logs answer "how often, and where".`,
    analogy: `A ship's log versus the black box. The log is the running record you review for patterns; the black box is what you open after an incident.`,
    technical: `Log **structured** — JSON with consistent field names — not formatted strings. You will want to aggregate on these fields, and parsing prose later is painful.

Record per request: trace id, prompt and model version, input and output token counts, cost, latency by stage, retrieval count and best score, gate decision, evaluation scores where sampled, feedback signals, and a category.

**Never log**: full credentials, complete API keys, raw payment details. **Redact** personal data in questions and answers before writing, and set a retention period appropriate to the data.

Log **levels** matter: gate trips and evaluation failures at warning, normal requests at info, and the full prompt only at debug or on a sampled basis, because prompts are large and sensitive.

The most useful derived field is a **category**, assigned at request time. Almost every interesting aggregate is per-category.`,
    diagram: `
   TRACE vs LOG

     TRACE   the detail of ONE request
             "why did this specific answer go wrong?"

     LOG     the aggregate stream across MANY
             "how often does this happen, and where?"

   ONE LOG LINE — structured, queryable

     { "ts": "2026-08-21T09:14:03Z",
       "trace_id": "9f3c1a…",
       "category": "billing_policy",
       "prompt_version": "answer_v4",
       "model_version": "sonnet-5",
       "index_version": "2026-03-11",
       "tokens_in": 3412, "tokens_out": 218,
       "cost_usd": 0.0135,
       "latency_ms": {"retrieval": 84, "rerank": 121,
                      "generation": 1690, "total": 2340},
       "retrieval": {"count": 25, "best_score": 0.71, "kept": 4},
       "gate": {"decision": "pass", "groundedness": 0.93},
       "feedback": null }

   WHAT THIS MAKES ANSWERABLE

     groundedness by category, this week vs last
     cost by feature, by model version
     gate trip rate over time
     p95 latency by stage — where is the time going?
     which prompt version is live for which traffic?

   ⚠ NEVER LOG
     credentials · full API keys · raw payment details

   ⚠ REDACT + RETAIN
     questions and answers contain personal data.
     Redact before writing. Set a retention period.
     Log full prompts at DEBUG or sampled only — they are
     large and sensitive.`,
    example: {
      language: 'python',
      caption: 'Structured logging that supports the aggregates you will want',
      code: `import json, logging, time

log = logging.getLogger("ai")

class JsonFormatter(logging.Formatter):
    def format(self, record):
        payload = {"ts": self.formatTime(record), "level": record.levelname,
                   "msg": record.getMessage()}
        payload.update(getattr(record, "fields", {}))
        return json.dumps(payload)

def log_request(trace_id, question, result, timings, user):
    fields = {
        "trace_id": trace_id,
        "category": classify(question),          # almost every aggregate
        "user_role": user.role,                  # is per-category
        # versions — so a regression can be attributed
        "prompt_version": PROMPT_VERSION,
        "model_version": MODEL_VERSION,
        "index_version": INDEX_VERSION,
        # cost
        "tokens_in": result["tokens_in"],
        "tokens_out": result["tokens_out"],
        "cost_usd": round(result["cost"], 6),
        "model_calls": result["calls"],          # incl. rerank + judge
        # latency by stage — where is the time going?
        "latency_ms": timings,
        # retrieval health
        "retrieval_count": result["retrieval_count"],
        "retrieval_best_score": round(result["best_score"], 3),
        "chunks_used": result["chunks_used"],
        # outcome
        "gate_decision": result.get("gated") or "pass",
        "groundedness": result.get("groundedness"),
    }

    # Level by outcome: gate trips deserve attention
    if fields["gate_decision"] == "blocked":
        log.warning("gate blocked", extra={"fields": fields})
    else:
        log.info("request", extra={"fields": fields})

    # The full prompt is large and sensitive — DEBUG or sampled only
    if log.isEnabledFor(logging.DEBUG):
        log.debug("prompt", extra={"fields": {
            "trace_id": trace_id, "prompt": redact(result["prompt"])}})

# ── WHAT THIS ENABLES ──────────────────────────────────────
# groundedness by category, week over week
# cost per feature per model version
# gate trip rate as an early drift alarm
# p95 latency by stage — is it retrieval or generation?`
    },
    prereq: ['tracing'], next: ['token-usage-cost', 'failure-rates'],
    related: ['debugging', 'privacy-pii', 'auditability', 'sampling-production'],
    tools: ['opentelemetry', 'langsmith', 'phoenix'],
    useCases: [
      'Aggregating quality and cost across many requests.',
      'Alerting on a rising gate trip rate.',
      'Attributing cost to features and model versions.'
    ],
    avoid: [
      'Unstructured string logs, which cannot be aggregated.',
      'Logging full prompts on every request — large, sensitive and expensive.',
      'Any logging of credentials or payment details.'
    ],
    mistakes: [
      'Formatted prose logs that have to be parsed later.',
      'No category field, so almost no useful aggregate is possible.',
      'No version fields, so regressions cannot be attributed.',
      'Logging raw user input without redaction.',
      'No retention policy on logs containing personal data.'
    ],
    keyTerms: [
      ['structured logging', 'JSON with consistent fields, not formatted strings.'],
      ['log level', 'Info, warning, debug — controls volume and sensitivity.'],
      ['category', 'A per-request classification. Almost every aggregate uses it.'],
      ['redaction', 'Removing personal data before writing.'],
      ['retention', 'How long logs are kept.'],
      ['cardinality', 'How many distinct values a field has; high cardinality is costly to index.']
    ],
    resources: [
      ['Python — logging HOWTO', 'https://docs.python.org/3/howto/logging.html', 'docs'],
      ['OpenTelemetry — logs', 'https://opentelemetry.io/docs/concepts/signals/logs/', 'docs'],
      ['Google SRE Book — monitoring distributed systems', 'https://sre.google/sre-book/monitoring-distributed-systems/', 'reference']
    ],
    questions: [
      ['What is the difference between a trace and a log?', 'A trace is the full detail of one request, used to answer "why did this go wrong". Logs are the aggregate stream, used to answer "how often, and where".'],
      ['Why log a category on every request?', 'Almost every useful aggregate is per-category — groundedness by category, cost by feature, gate trips by topic. Without it the numbers are averages that hide everything.'],
      ['Why log full prompts only at debug or on a sample?', 'They are large and they contain user data. Logging them on every request is expensive and expands the privacy surface unnecessarily.']
    ]
  },

  {
    id: 'token-usage-cost',
    title: 'Token Usage & Cost Monitoring',
    domain: 'observability', tier: 2, priority: 'high',
    summary: 'Knowing where the money goes, per request, per feature, per user.',
    what: `Cost monitoring records token usage on every model call and attributes it to a feature, a user segment and a model version, so the bill can be explained and controlled.`,
    why: `AI cost is per-request and scales with usage, so it is a gross-margin line rather than a fixed one. Without attribution, a rising bill is a mystery and there is nothing actionable to do about it. With attribution, it is a list of specific decisions.`,
    analogy: `An itemised phone bill versus a total. The total tells you it went up. The itemisation tells you it was international calls from one department.`,
    technical: `Record on every call: input tokens, output tokens, cached tokens (billed differently), model, feature, and user segment. **Count every call** — reranking, query rewriting, groundedness judging and agent-loop iterations all bill.

Compute cost from token counts and a **versioned price table**, so historical costs stay correct when prices change.

Track these views:
- **Cost per request**, and its p95 — a heavy tail usually means runaway agent loops or unbounded output.
- **Cost per feature** — which feature is actually expensive.
- **Cost per user segment** — a small number of heavy users often dominate.
- **Cost per successful outcome** — the number that matters commercially. A cheap feature nobody uses successfully is not cheap.

Set **budget alerts** on rate of spend, not just monthly totals — a runaway loop can spend a month's budget in hours.

Cost levers, in rough order of impact: model choice, retrieved context size, prompt caching, output length caps, and routing cheap-first.`,
    diagram: `
   ATTRIBUTE EVERY CALL, NOT JUST THE MAIN ONE

     main generation           1 call    $0.0135
     + query rewriting         1 call    $0.0009
     + reranking               1 call    $0.0011
     + groundedness judge      6 calls   $0.0247   ← often the largest
     ───────────────────────────────────────────
     "one request"             9 calls   $0.0402

   THE VIEWS THAT MATTER

     cost / request p50   $0.031
     cost / request p95   $0.128   ← a heavy tail. Why?
                                     runaway agent loops? long outputs?

     cost by FEATURE
       support assistant   $11,400/mo   62%
       doc search           $ 4,200/mo   23%
       summarisation        $ 2,800/mo   15%

     cost by SEGMENT
       top 2% of users      41% of spend   ← worth understanding

     cost per SUCCESSFUL OUTCOME
       $0.031 per request
       ÷ 0.68 resolution rate
       = $0.046 per resolved query   ← the commercial number

   ⚠ ALERT ON RATE OF SPEND, NOT MONTHLY TOTAL.
     A runaway agent loop can spend a month's budget in hours,
     and a monthly alert fires long after the money is gone.

   LEVERS, BY IMPACT
     model choice · context size · prompt caching
     · output length cap · cheap-first routing`,
    example: {
      language: 'python',
      caption: 'Versioned pricing, full attribution, and a rate-based alarm',
      code: `# Versioned so historical costs stay correct when prices change
PRICES = {
    "2026-01-01": {
        "claude-sonnet-5": {"in": 3.00, "out": 15.00, "cached_in": 0.30},
        "claude-haiku-4-5": {"in": 0.80, "out": 4.00, "cached_in": 0.08},
    },
}

def price_for(model, on_date):
    version = max(d for d in PRICES if d <= on_date)
    return PRICES[version][model]

class CostTracker:
    """One tracker per request. Every model call goes through it."""
    def __init__(self, feature, user_segment):
        self.feature, self.segment = feature, user_segment
        self.calls = []

    def record(self, model, tokens_in, tokens_out, cached_in=0, stage=""):
        p = price_for(model, today())
        cost = ((tokens_in - cached_in) * p["in"]
                + cached_in * p["cached_in"]
                + tokens_out * p["out"]) / 1e6
        self.calls.append({"model": model, "stage": stage, "cost": cost,
                           "tokens_in": tokens_in, "tokens_out": tokens_out})
        return cost

    def summary(self):
        return {
            "feature": self.feature,
            "segment": self.segment,
            "total_cost": sum(c["cost"] for c in self.calls),
            "call_count": len(self.calls),
            # Per-stage breakdown — this is where the surprise usually is
            "by_stage": {s: sum(c["cost"] for c in self.calls if c["stage"] == s)
                         for s in {c["stage"] for c in self.calls}},
        }

tracker = CostTracker(feature="support_assistant", user_segment=user.tier)
tracker.record(MODEL, out.tokens_in, out.tokens_out, stage="generation")
tracker.record(JUDGE, j.tokens_in, j.tokens_out, stage="groundedness")
log_cost(tracker.summary())

# ── ALERT ON RATE, NOT TOTAL ───────────────────────────────
# alert: sum(rate(ai_cost_usd[10m])) * 6 * 24 * 30 > MONTHLY_BUDGET * 1.3
#   → projected monthly spend is 30% over budget, based on the
#     last ten minutes. Fires in minutes, not at month end.`
    },
    prereq: ['logging-llm'], next: ['latency-monitoring'],
    related: ['ai-cost', 'inference-llm', 'latency-cost-eval', 'unit-economics'],
    tools: ['langsmith', 'opentelemetry', 'braintrust'],
    useCases: [
      'Explaining a rising AI bill with specifics.',
      'Finding which feature or segment dominates spend.',
      'Catching a runaway loop before it costs a month of budget.'
    ],
    avoid: [
      'Monthly-total alerts as the only cost control.',
      'Cost tracking that ignores judge, rerank and rewrite calls.'
    ],
    mistakes: [
      'Counting only the main generation call, understating cost by several times.',
      'Unversioned price tables, so historical costs silently change.',
      'Reporting mean cost per request when the p95 is where the problem is.',
      'No feature attribution, so there is nothing actionable when the bill rises.',
      'Ignoring cost per successful outcome, which is the commercially meaningful figure.'
    ],
    keyTerms: [
      ['token attribution', 'Assigning token usage to a feature and segment.'],
      ['cached tokens', 'Prefix tokens billed at a reduced rate.'],
      ['cost per request', 'Total across every model call in one request.'],
      ['cost per successful outcome', 'Cost divided by resolution rate. The commercial number.'],
      ['versioned price table', 'Prices keyed by date so history stays correct.'],
      ['rate-based alert', 'Alerting on spend velocity rather than monthly total.'],
      ['heavy tail', 'A p95 far above the median. Usually runaway loops or long output.']
    ],
    resources: [
      ['Anthropic — pricing', 'https://docs.anthropic.com/en/docs/about-claude/pricing', 'docs'],
      ['Anthropic — prompt caching', 'https://docs.anthropic.com/en/docs/build-with-claude/prompt-caching', 'docs'],
      ['LangSmith — cost tracking', 'https://docs.smith.langchain.com/observability', 'docs'],
      ['OpenTelemetry — GenAI metrics', 'https://opentelemetry.io/docs/specs/semconv/gen-ai/', 'docs']
    ],
    questions: [
      ['Which model call is most often missed in cost tracking?', 'The groundedness judge. Claim-by-claim verification makes several calls per answer and frequently costs more than the generation being judged.'],
      ['Why alert on rate of spend rather than monthly total?', 'A runaway agent loop can consume a month of budget in hours. A monthly alert fires long after the money is gone; a rate-based projection fires in minutes.'],
      ['What is the commercially meaningful cost figure?', 'Cost per successful outcome — cost per request divided by the resolution rate. A cheap feature that rarely resolves anything is not cheap.']
    ]
  },

  {
    id: 'latency-monitoring',
    title: 'Latency Monitoring',
    domain: 'observability', tier: 2, priority: 'medium',
    summary: 'Measuring how long requests take, by stage and by percentile.',
    what: `Latency monitoring records how long each request takes and where the time goes, reported as percentiles rather than averages.`,
    why: `Generation time varies with output length, so AI latency has a genuinely long tail. The mean can look healthy while a meaningful minority of users waits ten seconds — and those are the users who abandon and complain.`,
    analogy: `Train punctuality. "Average delay two minutes" is compatible with most trains being on time and one in twenty being an hour late. Only the distribution describes the experience.`,
    technical: `Measure and report:
- **Time to first token** separately from total time. With streaming, TTFT is what the user actually experiences; total time matters mainly for cost and for non-streaming consumers.
- **Percentiles** — p50, p95, p99. Never averages (see the percentiles topic).
- **Per stage** — retrieval, rerank, generation, evaluation. The breakdown is what makes it actionable.
- **By output length** — long answers are legitimately slow, so segment before concluding there is a problem.

Set **SLOs on percentiles**: "p95 time-to-first-token under 1.2s". Alert on the SLO, not on individual slow requests.

The common causes of a latency regression, roughly in order: more retrieved context, an added pipeline stage (rerank, judge), longer outputs, a model version change, and provider-side queueing.

Remember that a p99 timeout usually triggers a client retry, which adds load to an already struggling system.`,
    diagram: `
   REPORT THE DISTRIBUTION, AND THE STAGES

     total latency        p50 2.0s   p95 3.3s   p99 8.4s
     time to first token  p50 0.4s   p95 0.9s   p99 2.1s
                          ↑ with streaming, THIS is what users feel

     by stage (p50)
       retrieval      84 ms   ▍
       rerank        121 ms   ▌
       generation  1,690 ms   ████████████████████
       groundedness  135 ms   ▌

     Generation dominates. The lever is OUTPUT LENGTH,
     not retrieval optimisation.

   SEGMENT BEFORE CONCLUDING

     output tokens   p95 latency
     < 100              1.4 s        fine
     100-400            3.1 s        fine
     > 400              9.8 s        ← legitimately slow, not a bug
                                       (but cap max_tokens)

   COMMON CAUSES OF A LATENCY REGRESSION

     1. more retrieved context
     2. an added stage (rerank, judge)
     3. longer outputs
     4. a model version change
     5. provider-side queueing

   ⚠ A p99 TIMEOUT USUALLY TRIGGERS A RETRY,
     which adds load to a system already struggling.
     Latency problems compound.`,
    example: {
      language: 'python',
      caption: 'Stage timing, TTFT, and an SLO-based alert',
      code: `import time
from contextlib import contextmanager

@contextmanager
def stage(timings, name):
    t0 = time.perf_counter()
    yield
    timings[name] = round((time.perf_counter() - t0) * 1000, 1)

def answer_streaming(question, user):
    timings, t_start = {}, time.perf_counter()
    ttft = None

    with stage(timings, "retrieval"):
        hits = retrieve(question, user)
    with stage(timings, "rerank"):
        top = rerank(question, hits)[:4]

    prompt = build_prompt(top, question)
    tokens = 0

    for chunk in llm.stream(prompt):
        if ttft is None:
            ttft = (time.perf_counter() - t_start) * 1000   # what users feel
        tokens += 1
        yield chunk

    timings["generation"] = round((time.perf_counter() - t_start) * 1000
                                  - sum(timings.values()), 1)
    timings["total"] = round((time.perf_counter() - t_start) * 1000, 1)

    metrics.histogram("ai.ttft_ms", ttft)
    metrics.histogram("ai.total_ms", timings["total"])
    for name, ms in timings.items():
        metrics.histogram("ai.stage_ms", ms, tags={"stage": name})
    # Segment by output length, or long answers look like a regression
    metrics.histogram("ai.total_ms_by_length", timings["total"],
                      tags={"bucket": length_bucket(tokens)})

# ── SLO-BASED ALERTING ─────────────────────────────────────
# alert: histogram_quantile(0.95, ai_ttft_ms) > 1200 for 10m
#   → p95 time-to-first-token breached the SLO
#
# NOT: alert on any request over 5s. Individual slow requests are
#      normal; a shifted distribution is the signal.`
    },
    prereq: ['logging-llm'], next: ['failure-rates'],
    related: ['percentiles', 'ai-latency', 'autoregressive-generation', 'latency-throughput'],
    tools: ['opentelemetry', 'langsmith', 'phoenix'],
    useCases: [
      'Setting and monitoring a latency SLO.',
      'Finding which stage is responsible for a latency regression.',
      'Distinguishing legitimately slow long answers from a real problem.'
    ],
    avoid: [
      'Alerting on individual slow requests rather than a shifted distribution.',
      'Averages, which hide the tail entirely.'
    ],
    mistakes: [
      'Reporting mean latency, which conceals the experience of the slowest users.',
      'Not separating time-to-first-token from total time in a streaming product.',
      'No per-stage breakdown, so the metric is not actionable.',
      'Not segmenting by output length, so long answers register as a regression.',
      'Ignoring that a timeout triggers a retry, compounding the load.'
    ],
    keyTerms: [
      ['time to first token', 'Latency until output starts. What streaming users feel.'],
      ['p95 / p99', 'The tail of the distribution, where user pain lives.'],
      ['stage breakdown', 'Latency attributed to each pipeline step.'],
      ['SLO', 'A target expressed as a percentile.'],
      ['length segmentation', 'Comparing latency within output-length buckets.'],
      ['retry storm', 'Timeouts triggering retries that worsen the overload.']
    ],
    resources: [
      ['Google SRE Book — service level objectives', 'https://sre.google/sre-book/service-level-objectives/', 'reference'],
      ['Prometheus — histograms and summaries', 'https://prometheus.io/docs/practices/histograms/', 'docs'],
      ['Anthropic — streaming', 'https://docs.anthropic.com/en/api/streaming', 'docs'],
      ['OpenTelemetry — metrics', 'https://opentelemetry.io/docs/concepts/signals/metrics/', 'docs']
    ],
    questions: [
      ['Why report time-to-first-token separately?', 'In a streaming product it is what the user actually experiences. Total time matters for cost and for non-streaming consumers, but a 15-second total with a 0.4-second first token feels fast.'],
      ['Why segment latency by output length?', 'Long answers are legitimately slow. Without segmentation, a shift toward longer outputs looks like a performance regression when it is a content change.'],
      ['Why alert on the distribution rather than individual slow requests?', 'Individual slow requests are normal in a system with variable output length. A shifted p95 is the signal that something actually changed.']
    ]
  },

  {
    id: 'failure-rates',
    title: 'Failure Rates',
    domain: 'observability', tier: 2, priority: 'medium',
    summary: 'Counting the ways a request can fail — most of which are not exceptions.',
    what: `Failure-rate monitoring counts the distinct ways an AI request can fail to deliver value, including the many that never raise an error.`,
    why: `A conventional error rate captures almost none of the ways an AI system fails. A request that returns a fluent, confident, ungrounded answer is a success by HTTP standards and a failure by every standard that matters.`,
    analogy: `A restaurant measuring only dropped plates. The meals that arrived cold, wrong, or that nobody ate do not appear anywhere in that number.`,
    technical: `The failure taxonomy worth tracking:

**Hard failures** — provider errors, timeouts, rate limits. Visible, and the easiest to fix.
**Gate failures** — the groundedness or safety gate blocked the answer. A working control, but a rising rate signals upstream drift.
**Retrieval failures** — nothing above the relevance threshold. The system honestly could not answer.
**Refusals** — split into correct refusals and over-refusals.
**Silent failures** — a fluent answer that is wrong. Only detectable via sampled evaluation and user feedback.
**Abandonment** — the user left without acting on the answer.
**Escalation** — the user asked for a human.

Track each as a rate, and track them **together**. A drop in gate trips accompanied by a rise in escalations means the gate is now missing failures rather than there being fewer of them.

The composite worth reporting to a business audience is the **successful resolution rate**: requests that produced a useful, acted-upon answer.`,
    diagram: `
   THE FAILURE TAXONOMY — most of these are not exceptions

     HARD FAILURE      provider 5xx · timeout · rate limit
                       visible · easiest to fix
                       ← the only one a conventional error rate sees

     GATE BLOCKED      groundedness or safety gate fired
                       a WORKING control, but a rising rate
                       signals upstream drift

     NO RETRIEVAL      nothing above the relevance threshold
                       honest, and a CONTENT GAP signal

     OVER-REFUSAL      declined something it should have answered

     SILENT FAILURE    fluent, confident, wrong
                       ← invisible except via sampling + feedback
                         and the most damaging

     ABANDONED         user left without acting on the answer

     ESCALATED         user asked for a human

   ⚠ READ THEM TOGETHER, NOT INDIVIDUALLY

     gate trips ↓  and  escalations ↑
       → the gate is MISSING failures, not preventing fewer

     no-retrieval ↑  and  escalations ↑
       → a genuine content gap. That is a roadmap item.

   THE COMPOSITE FOR A BUSINESS AUDIENCE

     successful resolution rate
       = requests that produced a useful, acted-upon answer
       ÷ total requests

     Everything above is a way that number goes down.`,
    example: {
      language: 'python',
      caption: 'Classifying every request outcome, then reading the rates together',
      code: `OUTCOMES = ["success", "hard_failure", "gate_blocked", "no_retrieval",
            "over_refusal", "silent_failure", "abandoned", "escalated"]

def classify_outcome(result, feedback):
    """Every request gets exactly one outcome. Most are not errors."""
    if result.get("error"):
        return "hard_failure"
    if result.get("gated") == "blocked":
        return "gate_blocked"
    if result.get("retrieval_count") == 0:
        return "no_retrieval"
    if feedback and feedback.get("escalated"):
        return "escalated"
    if feedback and feedback.get("thumbs") == "down":
        return "silent_failure"       # fluent, and the user says wrong
    if feedback and feedback.get("abandoned"):
        return "abandoned"
    return "success"

metrics.increment("ai.outcome", tags={"outcome": classify_outcome(r, fb),
                                      "category": category})

# ── WEEKLY REVIEW: read the rates TOGETHER ─────────────────
#                     this week   last week
#   success              68.2%       74.1%   ✗
#   hard_failure          0.4%        0.3%
#   gate_blocked          2.1%        4.8%   ← FELL
#   no_retrieval          9.7%        6.2%   ← rose
#   over_refusal          1.1%        1.0%
#   silent_failure        6.9%        3.1%   ← ROSE
#   abandoned             7.2%        6.9%
#   escalated             4.4%        3.6%   ← rose
#
# READING: gate trips halved while silent failures more than doubled.
# The gate is not catching fewer failures because there are fewer —
# it is MISSING them. Combined with no_retrieval rising, this looks
# like an index or embedding change. Check index_version in the logs.
#
# Neither number alone would have shown this.`
    },
    prereq: ['logging-llm'], next: ['user-feedback', 'hallucination-monitoring'],
    related: ['eval-thresholds-quality-gates', 'refusal-quality', 'exceptions', 'drift-detection'],
    tools: ['opentelemetry', 'langsmith', 'phoenix'],
    useCases: [
      'Reporting a single meaningful health number to a business audience.',
      'Detecting that a quality control has stopped working.',
      'Turning a content gap into a roadmap item.'
    ],
    avoid: [
      'A conventional error rate as the health metric — it sees almost nothing.',
      'Reading any single failure rate in isolation.'
    ],
    mistakes: [
      'Treating HTTP success as request success.',
      'Celebrating a falling gate trip rate without checking whether escalations rose.',
      'No classification of outcomes, so there is only one undifferentiated error number.',
      'Ignoring the no-retrieval rate, which is a content-gap signal.',
      'Not tracking abandonment, which is often the largest silent failure category.'
    ],
    keyTerms: [
      ['hard failure', 'A provider error, timeout or rate limit.'],
      ['gate blocked', 'A quality control fired. A working control, not a bug.'],
      ['no retrieval', 'Nothing relevant found. A content-gap signal.'],
      ['silent failure', 'A fluent, confident, wrong answer.'],
      ['abandonment', 'The user left without acting on the answer.'],
      ['escalation', 'The user asked for a human.'],
      ['successful resolution rate', 'The composite health number.']
    ],
    resources: [
      ['Google SRE Book — monitoring distributed systems', 'https://sre.google/sre-book/monitoring-distributed-systems/', 'reference'],
      ['Arize Phoenix — production monitoring', 'https://arize.com/docs/phoenix/', 'docs'],
      ['LangSmith — feedback and monitoring', 'https://docs.smith.langchain.com/observability', 'docs']
    ],
    questions: [
      ['Why is a conventional error rate nearly useless for an AI system?', 'A fluent, confident, wrong answer returns HTTP 200. The error rate sees only hard failures — provider errors and timeouts — which are a small fraction of the ways the system fails to deliver value.'],
      ['Why must failure rates be read together?', 'Gate trips falling while escalations rise means the gate is missing failures, not preventing fewer. Either number alone would be misread.'],
      ['What does a rising no-retrieval rate indicate?', 'A content gap — users are asking about things the corpus does not cover. That is a roadmap input rather than a bug.']
    ]
  },

  {
    id: 'user-feedback',
    title: 'User Feedback',
    domain: 'observability', tier: 2, priority: 'medium',
    summary: 'Explicit and implicit signals from real users — the cheapest quality data you have.',
    what: `User feedback covers explicit signals (thumbs up/down, ratings, written reports) and implicit ones (retries, escalations, abandonment, copying the answer, follow-up questions).

Implicit signals are more plentiful, less biased by who bothers to click, and usually earlier.`,
    why: `Feedback is the only signal that reflects whether the answer was actually *useful*, as opposed to grounded, relevant and correct. All three of those can be true and the answer still fails the user.`,
    analogy: `A shop counting complaints versus counting returns and abandoned baskets. Complaints come from a self-selected minority; the behavioural signals come from everyone.`,
    technical: `**Explicit feedback**: low volume (typically 1–3% of requests), heavily biased toward dissatisfaction, and valuable precisely because negative examples are what you want. Always allow a free-text reason — the categories you predefined will not cover the real complaints.

**Implicit signals**, roughly in order of usefulness:
- **Escalation to a human** — the strongest negative signal available.
- **Retry / rephrase** — the answer did not work.
- **Abandonment** — the user left without acting.
- **Copy** — a strong positive signal, and easy to instrument.
- **Follow-up question** — ambiguous; could mean engagement or confusion.

Route every negative signal into **human review**, and promote confirmed failures into the golden set. That loop is what converts feedback into permanent improvement rather than a dashboard.

Feedback is biased. Do not use it as your headline quality metric; use it to find failures, and use sampled evaluation for the unbiased estimate.`,
    diagram: `
   EXPLICIT                        IMPLICIT

   thumbs up/down                  escalated to human   ★ strongest
   star rating                     retried / rephrased
   written report                  abandoned
                                   copied the answer    ★ positive
   volume 1-3% of requests         followed up
   biased toward dissatisfaction
   ← and that is USEFUL:           volume 100% of requests
     negative examples are          less biased
     what you want                  usually EARLIER

   THE LOOP THAT MATTERS

     negative signal
          ↓
     human review
          ↓
     confirmed failure?
          ↓
     promote to the GOLDEN SET
          ↓
     every future change is tested against it

   Without this loop, feedback is a dashboard.
   With it, feedback is permanent improvement.

   ⚠ DO NOT USE FEEDBACK AS THE HEADLINE QUALITY METRIC.

     It is biased by who bothers to click. Use it to FIND
     failures; use uniformly sampled evaluation for the
     unbiased estimate.

   ⚠ ALWAYS ALLOW FREE TEXT
     Your predefined categories will not cover the real
     complaints. The free text is where the surprises are.`,
    example: {
      language: 'python',
      caption: 'Capturing both signal types and routing them into the golden set',
      code: `def record_explicit(trace_id, signal, reason=None, free_text=None):
    metrics.increment("feedback.explicit",
                      tags={"signal": signal, "reason": reason or "none"})
    store_feedback(trace_id, {"type": "explicit", "signal": signal,
                              "reason": reason, "text": free_text})
    if signal == "down":
        queue_for_human_review(trace_id, priority="high")


def record_implicit(trace_id, event):
    """Collected on all traffic. Free, and usually earlier."""
    WEIGHTS = {
        "escalated_to_human": -3,      # strongest negative
        "retried":            -2,
        "abandoned":          -1,
        "followed_up":         0,      # ambiguous
        "copied":             +2,      # strong positive
    }
    metrics.increment("feedback.implicit", tags={"event": event})
    store_feedback(trace_id, {"type": "implicit", "event": event,
                              "weight": WEIGHTS.get(event, 0)})
    if WEIGHTS.get(event, 0) <= -2:
        queue_for_human_review(trace_id, priority="medium")


# ── THE LOOP: feedback → golden set ────────────────────────
def review_and_promote(trace_id, reviewer):
    trace = load_trace(trace_id)
    verdict = reviewer.assess(trace)      # human decides

    if verdict["is_failure"]:
        promote_to_golden({
            "input": trace["question"],
            "expected_facts": verdict["expected_facts"],
            "should_refuse": verdict["should_have_refused"],
            "category": trace["category"],
            "origin": f"feedback_{trace_id}",
        })
        metrics.increment("feedback.promoted_to_golden")

# ── WEEKLY: what are people actually complaining about? ────
# The free-text field, clustered by embedding, is consistently
# the most informative artefact in the whole observability stack.
# Predefined categories never cover what users actually say.`
    },
    prereq: ['logging-llm'], next: ['hallucination-monitoring'],
    related: ['offline-vs-online-eval', 'golden-sets', 'failure-rates', 'ai-trust'],
    tools: ['langsmith', 'phoenix', 'braintrust'],
    useCases: [
      'Finding failures your evaluation set never imagined.',
      'Getting an early warning before automated metrics move.',
      'Feeding real failures into the golden set permanently.'
    ],
    avoid: [
      'Using feedback rates as the headline quality metric — they are biased.',
      'Only collecting explicit feedback, which is 1–3% of traffic.',
      'Predefined complaint categories with no free-text option.'
    ],
    mistakes: [
      'No implicit signal collection, discarding the cheapest and earliest data available.',
      'Feedback that goes to a dashboard and nowhere else.',
      'Not promoting confirmed failures into the golden set, so the same issue recurs.',
      'Treating a thumbs-down rate as a quality measure rather than a discovery tool.',
      'Ignoring the free-text field, which is where the unexpected failures are described.'
    ],
    keyTerms: [
      ['explicit feedback', 'Deliberate signals: thumbs, ratings, written reports.'],
      ['implicit signal', 'Behavioural: retry, escalation, abandonment, copy.'],
      ['escalation', 'The user asking for a human. The strongest negative signal.'],
      ['copy event', 'The user copying the answer. A strong positive signal.'],
      ['promotion to golden', 'Turning a confirmed failure into a permanent test case.'],
      ['self-selection bias', 'Only dissatisfied users bother to click.'],
      ['free-text reason', 'Where the complaints you did not anticipate appear.']
    ],
    resources: [
      ['LangSmith — feedback', 'https://docs.smith.langchain.com/observability/how_to_guides/attach_user_feedback', 'docs'],
      ['Google — People + AI Guidebook: feedback', 'https://pair.withgoogle.com/chapter/feedback-controls/', 'reference'],
      ['Arize Phoenix — annotations and feedback', 'https://arize.com/docs/phoenix/', 'docs']
    ],
    questions: [
      ['Why are implicit signals more valuable than explicit ones?', 'They are collected on all traffic rather than the 1–3% who click, they are less biased by self-selection, and they usually move earlier than any automated metric.'],
      ['What is the strongest negative signal?', 'Escalation to a human. The user has explicitly decided the system could not help, which is unambiguous in a way a thumbs-down is not.'],
      ['Why should feedback not be the headline quality metric?', 'It is biased by who bothers to respond. Use it to find failures; use uniformly sampled evaluation for the unbiased quality estimate.']
    ]
  },

  {
    id: 'hallucination-monitoring',
    title: 'Hallucination Monitoring',
    domain: 'observability', tier: 2, priority: 'high',
    summary: 'Detecting ungrounded answers in production, continuously.',
    what: `Hallucination monitoring runs groundedness checks on sampled production traffic and alerts when the rate of unsupported claims rises.

It is the production counterpart of the offline groundedness gate.`,
    why: `Hallucination rate is not stable. It moves when documents change, when the index is rebuilt, when a model version updates, and when users start asking about things the corpus does not cover. Without continuous monitoring, that drift is discovered by customers.`,
    analogy: `Water quality testing. You do not test once at commissioning and assume the supply stays clean. You sample continuously, because the thing being measured changes.`,
    technical: `Layered detection, cheapest first:

1. **Citation validation** — free. Does every cited source id exist, and does the answer contain citations at all when the prompt required them? Catches invented references immediately.
2. **NLI entailment** — cheap. A small model checks whether the context entails each claim. Suitable for continuous, high-volume monitoring.
3. **LLM judge** — expensive. Run on a sample and on anything the cheaper layers flagged.
4. **Human review** — targeted at what layer 3 flagged.

Alert on the **rate**, not on individual cases. Individual ungrounded answers happen; a rising rate means something changed.

Correlate a spike with **version fields**: index version, prompt version, model version. That correlation is usually the whole investigation.

Track the **unsupported claim text** as well as the rate. Clustering unsupported claims frequently reveals one specific missing document rather than a general degradation.`,
    diagram: `
   LAYERED DETECTION — cheapest first

     1  CITATION VALIDATION        free · 100% of traffic
        do the cited source ids exist?
        are there citations at all?
        ← catches invented references instantly

     2  NLI ENTAILMENT             cheap · 100% or high sample
        does the context entail each claim?
        small model · milliseconds

     3  LLM JUDGE                  expensive · sample + flagged
        claim-by-claim verification

     4  HUMAN REVIEW               targeted at what layer 3 flagged

   ALERT ON THE RATE, NOT THE CASE

     ungrounded rate
       0.4%  ────────────────  baseline
       0.5%  ────────────────
       3.8%  ████████████████  ← something changed TODAY
              │
              └─ correlate with version fields:
                   index_version changed this morning
                   → an ingestion run went wrong

   THE CORRELATION IS USUALLY THE WHOLE INVESTIGATION.

   ⚠ CLUSTER THE UNSUPPORTED CLAIMS

     rate rose to 3.8% — but clustering the actual claims shows
     71% of them concern annual plan refunds.

     Not general degradation. One document failed to re-index.
     The cluster found it in minutes; the rate alone would not have.`,
    example: {
      language: 'python',
      caption: 'Layered detection with cheap checks on all traffic',
      code: `def monitor_answer(answer, context, chunks, trace_id):
    signals = {}

    # ── LAYER 1: citation validation. Free. All traffic. ────
    cited = extract_citation_ids(answer)
    valid_ids = {c["id"] for c in chunks}
    invented = [c for c in cited if c not in valid_ids]

    signals["has_citations"] = bool(cited)
    signals["invented_citations"] = invented
    if invented:
        metrics.increment("hallucination.invented_citation")
        alert_now(trace_id, "invented citation", invented)   # unambiguous

    if REQUIRES_CITATIONS and not cited:
        metrics.increment("hallucination.missing_citations")

    # ── LAYER 2: NLI entailment. Cheap. High sample. ────────
    if random.random() < 0.25:
        claims = split_claims(answer)
        entailed = [nli_model.entails(context, c) for c in claims]
        rate = sum(entailed) / max(len(claims), 1)
        signals["nli_groundedness"] = rate
        metrics.histogram("hallucination.nli_groundedness", rate)

        # ── LAYER 3: escalate flagged cases to the LLM judge ─
        if rate < 0.8:
            result = groundedness(answer, context, JUDGE)
            signals["judge_groundedness"] = result["score"]
            for claim in result["unsupported"]:
                # Store the CLAIM TEXT — clustering these finds the cause
                store_unsupported_claim(trace_id, claim,
                                        index_version=INDEX_VERSION)
            if result["score"] < 0.6:
                queue_for_human_review(trace_id, priority="high")

    return signals

# ── ALERTING ───────────────────────────────────────────────
# alert: rate(hallucination.invented_citation[15m]) > 0
#          → always investigate; this is never normal
# alert: histogram_quantile(0.5, hallucination_nli_groundedness[1h]) < 0.85
#          → median groundedness dropped. Check version fields first.

# ── WEEKLY: cluster the unsupported claims ─────────────────
# clusters = cluster_embeddings([c.text for c in unsupported_claims])
# A cluster of 71% about one topic means one document, not general drift.`
    },
    prereq: ['tracing', 'groundedness'], next: ['drift-detection'],
    related: ['hallucination', 'faithfulness-metrics', 'eval-thresholds-quality-gates', 'sampling-production'],
    tools: ['ragas', 'deepeval', 'phoenix', 'langsmith'],
    useCases: [
      'Detecting a quality drop before customers report it.',
      'Correlating a hallucination spike with a specific deployment.',
      'Finding the one document that failed to re-index.'
    ],
    avoid: [
      'LLM judging 100% of traffic — the cost usually exceeds generation.',
      'Alerting on individual ungrounded answers rather than the rate.'
    ],
    mistakes: [
      'Only checking groundedness offline, so production drift is invisible.',
      'Skipping citation validation, which is free and catches invented references outright.',
      'Alerting on cases instead of rates, producing noise nobody acts on.',
      'Not recording version fields, so a spike cannot be correlated with a change.',
      'Storing only the score and not the unsupported claim text, losing the fastest path to a cause.'
    ],
    keyTerms: [
      ['hallucination rate', 'Share of answers containing unsupported claims.'],
      ['citation validation', 'Checking cited ids exist. Free and decisive.'],
      ['NLI entailment', 'A small model checking whether context supports a claim.'],
      ['layered detection', 'Cheap checks on all traffic, expensive ones on flagged cases.'],
      ['claim clustering', 'Grouping unsupported claims to find a common cause.'],
      ['version correlation', 'Matching a spike to an index, prompt or model change.']
    ],
    resources: [
      ['Ragas — faithfulness', 'https://docs.ragas.io/en/stable/concepts/metrics/available_metrics/faithfulness/', 'docs'],
      ['Arize Phoenix — hallucination evals', 'https://arize.com/docs/phoenix', 'docs'],
      ['DeepEval — hallucination metric', 'https://deepeval.com/docs/metrics-hallucination', 'docs'],
      ['Anthropic — reduce hallucinations', 'https://docs.anthropic.com/en/docs/test-and-evaluate/strengthen-guardrails/reduce-hallucinations', 'docs']
    ],
    questions: [
      ['What is the cheapest hallucination check, and why run it on all traffic?', 'Citation validation — verifying that every cited source id actually exists. It is free, it runs on 100% of traffic, and an invented citation is unambiguous evidence of fabrication.'],
      ['Why alert on the rate rather than individual cases?', 'Individual ungrounded answers occur in any system. A rising rate is the signal that something changed, and it is actionable in a way a single case is not.'],
      ['Why store the unsupported claim text and not just the score?', 'Clustering the claims often shows that most of them concern one topic — meaning a single document failed to re-index, rather than general degradation. That finds the cause in minutes.']
    ]
  },

  {
    id: 'drift-detection',
    title: 'Drift & Model Degradation',
    domain: 'observability', tier: 2, priority: 'medium',
    summary: 'Quality falling over time without anyone changing anything.',
    what: `Drift is degradation caused by the world moving rather than by a code change: the questions users ask shift, the documents change, the model version updates, or the corpus grows in a way that dilutes retrieval.`,
    why: `It is the failure mode with no deployment to blame. Nothing was released, so nobody is looking, and quality declines gradually enough that no single day looks alarming.`,
    analogy: `A map that was accurate when printed. No one damaged it; the roads changed. The map degrades by standing still.`,
    technical: `Kinds of drift in an AI system:

**Input drift** — the distribution of questions changes. Users discover a new use case, a marketing campaign brings a different audience, a season shifts the mix. Detect by monitoring the distribution of question categories and embedding-space clusters.

**Corpus drift** — documents are added, edited or removed. A growing corpus can *reduce* retrieval precision by adding near-miss competitors.

**Model drift** — the provider updates the model behind a version alias. Pin exact versions and re-run the evaluation suite on every announced change.

**Concept drift** — the correct answer itself changes. A policy update means previously-correct answers are now wrong, and your golden set is quietly wrong too.

Detection: track quality metrics as time series, monitor input distribution, and re-run the golden set on a schedule rather than only on change. Concept drift is the one that requires a human process — someone must own reviewing whether golden-set answers are still correct.`,
    diagram: `
   FOUR KINDS, FOUR DETECTIONS

   INPUT DRIFT       question distribution shifts
                     detect: category mix · embedding clusters
                     "40% of traffic is now about a feature
                      that was 3% last month"

   CORPUS DRIFT      documents added / edited / removed
                     detect: retrieval precision over time
                     ⚠ a GROWING corpus can REDUCE precision
                       by adding near-miss competitors

   MODEL DRIFT       provider updates behind a version alias
                     detect: pin exact versions; re-run the
                     golden set on every announced change

   CONCEPT DRIFT     the correct ANSWER changed
                     detect: a HUMAN PROCESS. Nothing automated
                     will notice that the refund policy changed
                     and your golden set is now wrong.

   ⚠ CONCEPT DRIFT POISONS YOUR EVALUATION

     policy changes: 14 days → 30 days
       · the system still answers "14 days"
       · the golden set still expects "14 days"
       · every metric says the system is HEALTHY
       · every answer is WRONG

     Someone must own reviewing golden-set correctness on a
     schedule. This is not an engineering control.

   THE SHAPE OF DRIFT

     quality │‾‾‾‾‾‾‾‾╲___
             │             ‾‾‾‾╲____
             └──────────────────────── time
              no deployment · no incident · no alert
              each day looks fine · the trend does not`,
    example: {
      language: 'python',
      caption: 'Detecting input drift and scheduling the human check',
      code: `import numpy as np
from scipy.stats import wasserstein_distance

# ── INPUT DRIFT: has the question distribution shifted? ────
def category_drift(baseline_counts, current_counts):
    cats = sorted(set(baseline_counts) | set(current_counts))
    b = np.array([baseline_counts.get(c, 0) for c in cats], float)
    c = np.array([current_counts.get(c, 0) for c in cats], float)
    b /= b.sum(); c /= c.sum()

    # Total variation distance: 0 = identical, 1 = disjoint
    tvd = 0.5 * np.abs(b - c).sum()
    moved = sorted(zip(cats, c - b), key=lambda x: -abs(x[1]))[:3]
    return {"tvd": round(float(tvd), 3), "biggest_shifts": moved}

d = category_drift(BASELINE_CATEGORIES, this_week_categories())
print(d)
# {'tvd': 0.28, 'biggest_shifts': [('integrations', +0.19),
#                                  ('billing', -0.11), ...]}
# A fifth of traffic moved into a category the golden set barely covers.

# ── CORPUS DRIFT: precision as the corpus grows ────────────
# Re-run retrieval evaluation on a SCHEDULE, not only on change:
#   week 1  12,400 chunks  recall@5 0.93  precision@5 0.44
#   week 6  31,800 chunks  recall@5 0.94  precision@5 0.29  ← diluted
# Recall held. Precision fell, because new documents added
# near-miss competitors. Reranking is now doing more work.

# ── MODEL DRIFT: pin, and re-run on announced changes ──────
assert MODEL_VERSION == "claude-sonnet-5", "model version drifted"

# ── CONCEPT DRIFT: a scheduled HUMAN review ────────────────
def quarterly_golden_review(golden, owners):
    """Nothing automated will notice that the correct answer changed."""
    stale = [c for c in golden
             if document_changed_since(c["expected_source"], c["reviewed_at"])]
    for case in stale:
        assign_review(case, owners[case["category"]],
                      note="Source document changed. Is the expected "
                           "answer still correct?")
    return stale

# This is the check that stops every metric reporting health
# while every answer is wrong.`
    },
    prereq: ['offline-vs-online-eval'], next: ['eval-tools-landscape'],
    related: ['model-versioning', 'retraining', 'failure-rates', 'production-monitoring'],
    tools: ['phoenix', 'langsmith', 'opentelemetry'],
    useCases: [
      'Detecting gradual quality decline with no deployment to blame.',
      'Noticing that the golden set no longer represents real traffic.',
      'Catching a provider model update that changed behaviour.'
    ],
    avoid: [
      'Assuming a system that passed evaluation at launch stays passed.',
      'Automated-only drift detection — concept drift needs a human owner.'
    ],
    mistakes: [
      'Running the golden set only on change, so drift with no change is invisible.',
      'Not pinning exact model versions, so a provider update is indistinguishable from a real regression.',
      'Ignoring input drift, so the golden set slowly stops representing real traffic.',
      'Assuming a growing corpus improves retrieval — it often dilutes precision.',
      'No owner for reviewing whether golden-set answers are still correct.'
    ],
    keyTerms: [
      ['drift', 'Degradation caused by change outside your codebase.'],
      ['input drift', 'The distribution of questions shifting.'],
      ['corpus drift', 'Documents changing, often diluting retrieval precision.'],
      ['model drift', 'A provider updating the model behind a version alias.'],
      ['concept drift', 'The correct answer itself changing.'],
      ['total variation distance', 'A measure of how far two distributions have moved.'],
      ['scheduled evaluation', 'Running the golden set on a timer, not only on change.']
    ],
    resources: [
      ['Arize — drift monitoring', 'https://arize.com/docs/phoenix/', 'docs'],
      ['Evidently AI — data drift', 'https://docs.evidentlyai.com/', 'docs'],
      ['Google — Rules of ML', 'https://developers.google.com/machine-learning/guides/rules-of-ml', 'reference'],
      ['Anthropic — model deprecations', 'https://docs.anthropic.com/en/docs/about-claude/model-deprecations', 'docs']
    ],
    questions: [
      ['Why is drift the hardest failure to notice?', 'There is no deployment to blame, so nobody is looking, and the decline is gradual enough that no single day looks alarming.'],
      ['Why is concept drift especially dangerous?', 'When the correct answer changes — a policy update — the system keeps giving the old answer and the golden set keeps expecting it. Every metric reports health while every answer is wrong.'],
      ['How can a growing corpus reduce retrieval quality?', 'New documents add near-miss competitors, so precision falls even as recall holds. More content is not automatically better retrieval.']
    ]
  },

  {
    id: 'eval-tools-landscape',
    title: 'Evaluation & Observability Tools',
    domain: 'observability', tier: 2, priority: 'medium',
    summary: 'What each tool actually solves, so the choice is about a problem rather than a brand.',
    what: `A map of the evaluation and observability tooling, organised by the problem each one solves rather than by feature list.`,
    why: `These tools overlap heavily and market themselves similarly. Choosing by feature comparison leads to adopting three that do the same thing. Choosing by problem leads to adopting one or two that do different things.`,
    analogy: `Choosing between a stethoscope, a blood test and an X-ray. All are diagnostic. They answer different questions, and the right one depends on the symptom.`,
    technical: `**Problem: "why did this one answer go wrong?"** → a **trace viewer**. LangSmith, Arize Phoenix, Langfuse. Phoenix is self-hostable and OpenTelemetry-native, which usually matters for a security review.

**Problem: "is retrieval or generation at fault?"** → **RAG-specific metrics**. Ragas. It separates faithfulness, answer relevance, context precision and context recall, which is exactly the diagnostic split you need.

**Problem: "does this change regress quality in CI?"** → an **assertion framework**. DeepEval, built on pytest, so evaluation lives in the normal test suite.

**Problem: "is prompt B better than prompt A?"** → an **experiment platform**. Braintrust. Side-by-side comparison across versions is its core workflow.

**Problem: "keep AI telemetry in the same stack as everything else"** → **OpenTelemetry**. Not an AI tool; a standard. Adopting it early avoids an AI observability silo.

Sensible starting combination: OpenTelemetry for traces, Ragas or DeepEval for metrics, and add a hosted platform only when the debugging workflow genuinely needs one. Most teams over-tool early and under-instrument.`,
    diagram: `
   CHOOSE BY PROBLEM, NOT BY FEATURE LIST

   "why did THIS answer go wrong?"
     → TRACE VIEWER
       LangSmith · Arize Phoenix · Langfuse
       Phoenix: self-hostable, OTel-native — usually survives
       a security review

   "is RETRIEVAL or GENERATION at fault?"
     → RAG METRICS
       Ragas — faithfulness · answer relevance
               context precision · context recall
       exactly the diagnostic split you need

   "does this change REGRESS quality in CI?"
     → ASSERTION FRAMEWORK
       DeepEval — pytest-based, so evals live in the test suite

   "is prompt B better than prompt A?"
     → EXPERIMENT PLATFORM
       Braintrust — side-by-side version comparison as the
       core workflow

   "keep AI telemetry in the SAME STACK as everything else"
     → OPENTELEMETRY
       not an AI tool — a standard. Adopt early or inherit
       an AI observability silo.

   A SENSIBLE STARTING STACK

     OpenTelemetry          traces, in your existing backend
     + Ragas or DeepEval    metrics and CI gates
     + a hosted platform    ONLY when the debugging workflow
                            genuinely needs one

   ⚠ MOST TEAMS OVER-TOOL EARLY AND UNDER-INSTRUMENT.
     Three overlapping platforms and no captured prompt is a
     common and useless configuration.`,
    example: {
      language: 'text',
      caption: 'Selecting tools from actual problems',
      code: `SITUATION
  RAG support assistant. Live for 6 weeks. Support reports
  occasional wrong answers. No observability beyond application logs.

── PROBLEM 1: we cannot diagnose a single reported failure ──
  need:  the retrieved chunks and the exact prompt for a given request
  tool:  tracing
  pick:  OpenTelemetry → existing backend, plus Arize Phoenix
         self-hosted for the LLM-specific trace view
  why:   data stays in our environment; traces land in the same
         stack as the rest of our telemetry

── PROBLEM 2: we cannot tell if it is retrieval or generation ──
  need:  faithfulness and context precision, separately
  tool:  RAG metrics
  pick:  Ragas
  why:   it makes exactly that split, which is the diagnosis we
         cannot currently make

── PROBLEM 3: prompt changes ship without evidence ──
  need:  a CI gate on a golden set
  tool:  assertion framework
  pick:  DeepEval
  why:   pytest-based, so it runs in the pipeline we already have

── PROBLEM 4 (not yet): comparing many prompt versions ──
  defer: Braintrust would help, but we have one prompt and no
         version history yet. Adopting it now adds a platform
         and solves nothing.

FINAL: OpenTelemetry + Phoenix + Ragas + DeepEval
       Four tools, four distinct problems, no overlap.
       Revisit in a quarter.`
    },
    prereq: ['tracing', 'why-eval'], next: [],
    related: ['tool-landscape', 'choosing-tools', 'ai-build-vs-buy', 'faithfulness-metrics'],
    tools: ['langsmith', 'phoenix', 'braintrust', 'ragas', 'deepeval', 'opentelemetry'],
    useCases: [
      'Choosing evaluation tooling from a specific problem.',
      'Avoiding three overlapping platforms that solve the same thing.',
      'Justifying a self-hostable option in a security review.'
    ],
    avoid: [
      'Adopting a platform before there is a problem it solves.',
      'Feature-list comparison, which makes overlapping tools look complementary.'
    ],
    mistakes: [
      'Over-tooling early while under-instrumenting — three platforms and no captured prompt.',
      'Choosing a hosted platform without checking data-residency implications.',
      'Skipping OpenTelemetry, then having an AI observability silo to retrofit.',
      'Adopting an experiment platform before there is any version history to compare.'
    ],
    keyTerms: [
      ['trace viewer', 'Shows the detail of one request. LangSmith, Phoenix, Langfuse.'],
      ['RAG metrics library', 'Splits retrieval and generation quality. Ragas.'],
      ['assertion framework', 'Evaluation as tests in CI. DeepEval.'],
      ['experiment platform', 'Side-by-side version comparison. Braintrust.'],
      ['OpenTelemetry', 'The vendor-neutral telemetry standard.'],
      ['self-hostable', 'Runs in your environment; data does not leave.'],
      ['observability silo', 'AI telemetry separated from the rest of the stack.']
    ],
    resources: [
      ['Ragas — documentation', 'https://docs.ragas.io/', 'docs'],
      ['DeepEval — documentation', 'https://deepeval.com/docs/getting-started', 'docs'],
      ['Arize Phoenix — documentation', 'https://arize.com/docs/phoenix', 'docs'],
      ['LangSmith — documentation', 'https://docs.smith.langchain.com/', 'docs'],
      ['Braintrust — documentation', 'https://www.braintrust.dev/docs', 'docs'],
      ['OpenTelemetry — GenAI conventions', 'https://opentelemetry.io/docs/specs/semconv/gen-ai/', 'docs']
    ],
    questions: [
      ['How should evaluation tooling be chosen?', 'By the specific problem — diagnosing one failure, splitting retrieval from generation, gating CI, comparing versions. Feature-list comparison makes overlapping tools look complementary.'],
      ['Why adopt OpenTelemetry even though it is not an AI tool?', 'It keeps AI telemetry in the same stack as everything else. Skipping it produces an AI observability silo that is painful to retrofit later.'],
      ['What is the common tooling mistake?', 'Over-tooling early and under-instrumenting — three overlapping platforms adopted, and the assembled prompt still not captured anywhere.']
    ]
  }
];
