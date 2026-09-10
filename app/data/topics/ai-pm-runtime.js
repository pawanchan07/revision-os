/**
 * DOMAIN T — AI PRODUCT MANAGEMENT: latency and risk
 */
export const topics = [
  {
    id: 'ai-latency',
    title: 'AI Latency',
    domain: 'ai-pm', tier: 2, priority: 'high',
    summary: 'Slower than users expect, and the fix is usually perception rather than speed.',
    what: `Latency for AI features is the time from request to useful output. It splits into retrieval, time to first token, generation and post-processing — four components with different causes and different fixes.`,
    why: `Generation is inherently slower than a database query, and users compare it to whatever they used before. Latency frequently determines whether a feature is used at all, independently of how good the answers are.`,
    analogy: `A conversation versus a lookup. Nobody expects a person to answer instantly and everybody expects a search box to. Which one your interface resembles sets the expectation you will be judged against.`,
    technical: `The components:
- **Retrieval** — tens of milliseconds. Rarely the problem.
- **Time to first token** — prefill, proportional to *input* length. This is what streaming users actually feel.
- **Generation** — proportional to output length, bounded by memory bandwidth.
- **Post-processing** — reranking, validation, safety checks. Additive and easy to overlook.

**Time to first token is the number that matters** for a streaming interface. A 400ms first token with a fifteen-second completion feels responsive; six seconds of blank screen followed by a six-second completion does not. Same total, opposite experience.

The levers: **stream** (the largest perceived improvement available), **shorten the input** (which reduces prefill and cost together — the same lever), **cap output**, **use a smaller model** where quality permits, **parallelise** independent steps, and **cache**.

**Show progress for multi-step work.** An agent making four tool calls over twenty seconds is acceptable when the user can see it working and intolerable behind a spinner.

**Set the expectation with the interface.** A chat interface implies conversational latency; a search box implies instant. Choose the one matching what you can deliver.

**Measure p95, not the mean.** The mean hides the tail, and the tail is what users remember.`,
    diagram: `
   THE COMPONENTS

     retrieval             ~40ms      rarely the problem
     TIME TO FIRST TOKEN  ~890ms      ← what streaming users FEEL
                                        prefill, ∝ INPUT length
     generation          ~3100ms      ∝ output length
     post-processing      ~180ms      rerank · validate · safety
                                        additive, easy to overlook

   ⚠ TTFT IS THE NUMBER THAT MATTERS

     400ms first token, 15s completion   feels responsive
     6s blank, 6s completion             does not

     same total time. Opposite experience.

   ⚠ THE NAIVE READING OF THE BREAKDOWN IS WRONG

     "generation is 72% of the time — use a smaller model"

     but generation is STREAMED. The user is reading during it.
     Reducing it improves a number nobody feels.

     TTFT is prefill, proportional to INPUT length
     → the same lever that cuts cost cuts perceived latency

   LEVERS

     STREAM          the largest perceived improvement available
     SHORTEN INPUT   cuts prefill AND cost — one lever, two wins
     CAP OUTPUT      deliberately
     SMALLER MODEL   where quality permits
     PARALLELISE     independent steps
     CACHE           repeated work + stable prompt prefixes

   SHOW PROGRESS FOR MULTI-STEP WORK

     4 tool calls over 20s, visible   acceptable
     the same 20s behind a spinner    intolerable

   ⚠ SET THE EXPECTATION WITH THE INTERFACE

     chat interface  → conversational latency is expected
     search box      → instant is expected

   MEASURE p95, NOT THE MEAN — the tail is what users remember`,
    example: {
      language: 'python',
      caption: 'Measuring the components separately, and fixing the right one',
      code: `def timed_answer(question):
    """One end-to-end number tells you nothing about what to fix."""
    t = {}
    with span("retrieve") as s:
        chunks = retrieve(question, k=15)
    t["retrieve_ms"] = s.ms                        # 42

    with span("rerank") as s:
        chunks = rerank(question, chunks)[:5]
    t["rerank_ms"] = s.ms                          # 180

    stream = generate_stream(question, chunks)
    first = next(stream)
    t["ttft_ms"] = stream.elapsed_ms               # 890
    text = first + "".join(stream)
    t["generation_ms"] = stream.total_ms           # 3100

    t["total_ms"] = sum(t.values())                # 4212
    metrics.histogram("latency", t)
    return text, t

# p95 BREAKDOWN, one week of production
#   retrieve         42 ms    1%
#   rerank          180 ms    4%
#   TTFT            890 ms   21%   ← the number users feel
#   generation     3100 ms   74%
#   total          4212 ms

# ⚠ NAIVE:  "generation is 74% — switch to a smaller model"
#   ACTUAL: generation is streamed. The user is reading during
#           it. The perceived wait is TTFT: 890ms.

# ── WHAT ACTUALLY REDUCED TTFT ─────────────────────────────
# TTFT is prefill — proportional to INPUT length.
#   5600 input tokens  → 890ms
#   3000 input tokens  → 510ms     (retrieve 15, rerank, send 5)
#   + prompt caching on the 1400-token stable prefix → 380ms
#
# ⚠ THE SAME CHANGE CUT COST 41% AND PERCEIVED LATENCY 57%.
#   Context length is the shared lever, which is why it is the
#   first thing to look at in both investigations.

# ── DOES RERANKING PAY FOR ITSELF? a measured question ─────
#   costs   +180ms on a 380ms TTFT — nearly 50% worse
#   gains   +2.8 points groundedness
#   check   abandonment rate at 380ms vs 560ms: no change
#   → keep it. "Worth it" is measured, not a design opinion.

# ── ALERT ON p95, NOT THE MEAN ─────────────────────────────
ALERTS = {"ttft_p95_ms": ("gt", 1200), "total_p95_ms": ("gt", 6000)}
# The mean TTFT was 410ms all through the week the p95 was
# 2.3 seconds. Only the p95 matched what users were reporting.`
    },
    prereq: ['ai-cost'], next: ['ai-risk'],
    related: ['latency-throughput', 'latency-monitoring', 'ai-ux', 'context-assembly', 'ai-cost'],
    tools: ['anthropic', 'vllm', 'ollama', 'opentelemetry'],
    useCases: [
      'Deciding which latency component is worth optimising.',
      'Making a slow feature feel fast.',
      'Setting user expectations through interface choice.'
    ],
    avoid: [
      'Optimising total time when only time to first token is felt.',
      'Reporting mean latency.'
    ],
    mistakes: [
      'Treating generation time as the problem when it is streamed and being read.',
      'Measuring end to end without a component breakdown, so there is nothing to act on.',
      'Hiding multi-step work behind a spinner.',
      'Choosing an interface that implies instant response for something that cannot be instant.'
    ],
    keyTerms: [
      ['time to first token', 'Prefill latency. What streaming users feel.'],
      ['prefill', 'Processing the input before generation starts.'],
      ['streaming', 'Emitting tokens as they are produced.'],
      ['p95', 'The tail latency users remember and report.'],
      ['post-processing', 'Reranking, validation and checks added after generation.'],
      ['perceived performance', 'How fast it feels, not how long it takes.']
    ],
    resources: [
      ['Anthropic — streaming messages', 'https://docs.anthropic.com/en/api/messages-streaming', 'docs'],
      ['Hugging Face — LLM inference optimisation', 'https://huggingface.co/docs/transformers/llm_optims', 'docs'],
      ['Nielsen Norman Group — response times', 'https://www.nngroup.com/articles/response-times-3-important-limits/', 'article']
    ],
    questions: [
      ['Which latency number do users actually experience?', 'Time to first token, when the response streams. A 400ms first token with a fifteen-second completion feels responsive; six seconds of blank screen does not, even at the same total.'],
      ['Why is shortening the input the best latency lever?', 'Time to first token is prefill, proportional to input length — so the same change that cuts context tokens cuts both cost and perceived latency at once.'],
      ['Why measure p95 rather than the mean?', 'The mean hides the tail. A mean of 410ms alongside a p95 of 2.3 seconds looks fine and matches nothing users are reporting.']
    ]
  },

  {
    id: 'ai-risk',
    title: 'AI Risk',
    domain: 'ai-pm', tier: 1, priority: 'high',
    summary: 'What can go wrong, how badly, and which controls actually reduce it.',
    what: `AI risk assessment identifies what can go wrong with a feature, how likely and how severe each failure is, who is harmed, and which controls reduce the risk in practice rather than on paper.`,
    why: `AI features fail in ways conventional software does not — fluently, confidently, and without raising an error. That failure mode defeats the usual safeguards, so the risks have to be enumerated deliberately.`,
    analogy: `A safety case for a machine. You are not asking whether it works; you are asking what happens on the day it does not, and whether anyone will notice in time.`,
    technical: `The categories:
- **Accuracy risk** — confidently wrong output. The characteristic AI failure.
- **Harm risk** — output that is offensive, discriminatory, defamatory, or dangerous advice.
- **Privacy risk** — data sent where it should not go, or leaked back through output.
- **Security risk** — prompt injection, tool misuse, exfiltration through an agent's capabilities.
- **Compliance risk** — regulated decisions, disclosure obligations, retention.
- **Reputational risk** — a screenshot. Often the binding constraint for consumer products, and frequently the one no framework captures.

**Score severity and detectability, not just likelihood.** A rare, severe, undetectable failure outranks a common, mild, obvious one. Detectability is the axis usually missing, and it is the one AI systems do worst on.

**Controls that actually work** are structural: abstention when unsupported, mandatory citation, human review for consequential actions, capability limits on tools, output filtering, rate limits, and logging sufficient to reconstruct any decision. **Controls that do not work**: disclaimers, "users should verify", and telling the model to be careful in the prompt.

**Consider the agent case separately.** A system that can take actions has a fundamentally larger risk surface than one that only produces text, because a wrong output becomes a wrong action without a human in between.

**Write the kill criteria before launch.** What observation makes you turn this off? Agreeing it in advance is what makes it possible to act during an incident, when nobody wants to be the one who says stop.`,
    diagram: `
   CATEGORIES

     ACCURACY      confidently wrong output — the characteristic
                   AI failure
     HARM          offensive · discriminatory · defamatory
                   · dangerous advice
     PRIVACY       data sent where it should not go, or leaked
                   back through output
     SECURITY      prompt injection · tool misuse · exfiltration
     COMPLIANCE    regulated decisions · disclosure · retention
     REPUTATIONAL  a screenshot
                   ⚠ often the binding constraint, and the one
                     no framework captures

   ⚠ SCORE DETECTABILITY, NOT JUST LIKELIHOOD AND SEVERITY

     rare + severe + UNDETECTABLE
       outranks
     common + mild + obvious

     detectability is the axis usually missing, and it is
     the one AI systems do worst on

   CONTROLS THAT WORK          CONTROLS THAT DO NOT
     abstain when unsupported    a disclaimer
     mandatory citation          "users should verify"
     human review for            telling the model to be
       consequential actions       careful in the prompt
     tool capability limits
     output filtering
     logging that can
       reconstruct a decision

   ⚠ AGENTS ARE A DIFFERENT RISK CLASS

     text output   → a wrong answer
     agent action  → a wrong ACTION, with no human in between

   ⚠ WRITE THE KILL CRITERIA BEFORE LAUNCH

     what observation makes you turn this off?

     agreeing it in advance is what makes it possible to act
     during an incident, when nobody wants to be the person
     who says stop`,
    example: {
      language: 'text',
      caption: 'A risk register with detectability, and the kill criteria',
      code: `FEATURE  policy assistant for support agents

RISK                          LIKE  SEV  DETECT  SCORE  CONTROL
────────────────────────────  ────  ───  ──────  ─────  ────────
Confidently wrong policy       M     H    LOW     ⚠ 9   abstention
answer → incorrect refund                                + mandatory
commitment to a customer                                 citation
                                                         + weekly
                                                         error review

Answers a REGIONAL question    M     H    LOW     ⚠ 9   region
from national policy                                     detection →
                                                         abstain

Corpus goes stale, answers     L     M    LOW     ⚠ 6   index-age
from withdrawn policy                                    alert (26h)
                                                         + version
                                                         stamp on
                                                         every answer

Customer PII in a question     L     H    MED       6   redaction
reaches the model provider                               before the
                                                         API call

Prompt injection via pasted    L     M    LOW     ⚠ 5   treat pasted
customer text                                            text as data,
                                                         never as
                                                         instruction
                                                         + no tools

Offensive output               VL    H    HIGH      3   output filter
                                                         (visible, so
                                                         detectable)

⚠ READ THE DETECT COLUMN.
  The three highest scores are all LOW-detectability. None of
  them raises an error, none appears in availability
  monitoring, and all three would run for days before anyone
  noticed. That is what the quality metric layer exists for.

  Offensive output scores LOWEST despite HIGH severity —
  because it is immediately visible and would be reported
  within minutes. Severity alone would have ranked it first
  and directed effort at the wrong risk.

CONTROLS EXPLICITLY REJECTED
  ✗ "This answer is AI-generated. Please verify."
     — a disclaimer on every answer trains people to ignore it,
       and it reduces no risk. It transfers blame, which is
       not the same thing.
  ✗ "You must be careful and accurate" in the system prompt
     — not a control. It is a hope.

AGENT SCOPE — deliberately limited
  The assistant CANNOT: issue refunds, send messages to
  customers, modify tickets. It produces text an agent acts on.
  ⚠ Recorded explicitly, because "let it just apply the
    refund" is the obvious next request and it moves this
    feature into a different risk class entirely.

KILL CRITERIA — agreed 3 Mar, before launch
  · 2 confirmed incorrect policy commitments in one week
  · confidently-wrong rate above 3% on weekly production sample
  · any PII reaching the provider unredacted
  · index age above 48h with no ETA
  → feature flag off. PM or support lead can pull it,
    no escalation required.

  ⚠ NAMING WHO CAN PULL IT IS PART OF THE CONTROL. A criterion
    that requires a meeting to invoke will not be invoked.`
    },
    prereq: [], next: ['ai-rollout'],
    related: ['risk-assessment', 'nist-ai-rmf', 'eu-ai-act', 'human-in-the-loop', 'mcp-security', 'compliance-risk-impact'],
    tools: [],
    useCases: [
      'Enumerating what can go wrong before launch.',
      'Directing effort at the risks that are hardest to detect.',
      'Agreeing kill criteria while nobody is under pressure.'
    ],
    avoid: [
      'Disclaimers used as controls.',
      'Ranking risks on severity alone.'
    ],
    mistakes: [
      'Omitting detectability, and directing effort at visible risks rather than silent ones.',
      'Treating prompt instructions as safety controls.',
      'Giving an assistant the ability to act without recognising it is a different risk class.',
      'Writing kill criteria that require a meeting to invoke, so they never are.'
    ],
    keyTerms: [
      ['detectability', 'Whether a failure would be noticed. The missing axis.'],
      ['confidently wrong', 'Asserted, plausible and incorrect.'],
      ['structural control', 'A design property that reduces risk, unlike a disclaimer.'],
      ['prompt injection', 'Instructions smuggled into data the model reads.'],
      ['kill criteria', 'Pre-agreed conditions for turning a feature off.'],
      ['risk register', 'The enumerated list with scores and controls.'],
      ['capability limit', 'Restricting what actions a system can take.']
    ],
    resources: [
      ['NIST AI Risk Management Framework', 'https://www.nist.gov/itl/ai-risk-management-framework', 'reference'],
      ['EU AI Act — overview', 'https://artificialintelligenceact.eu/', 'reference'],
      ['OWASP — top 10 for LLM applications', 'https://owasp.org/www-project-top-10-for-large-language-model-applications/', 'reference'],
      ['Anthropic — building effective agents', 'https://www.anthropic.com/engineering/building-effective-agents', 'article']
    ],
    questions: [
      ['Why score detectability alongside likelihood and severity?', 'A rare, severe, undetectable failure outranks a common, mild, obvious one. Detectability is the axis usually missing and the one AI systems do worst on, because they fail without raising errors.'],
      ['Why are disclaimers not risk controls?', 'They change nothing about what happens. They transfer blame rather than reduce risk, and a disclaimer on every answer trains people to ignore it.'],
      ['Why write kill criteria before launch?', 'During an incident nobody wants to be the person who says stop. Agreeing the conditions — and who can invoke them without a meeting — in advance is what makes acting possible.']
    ],
    interview: {
      s30: 'AI risk assessment enumerates what can go wrong, how severe it is, and crucially how detectable it is — because the characteristic AI failure is fluent, confident and silent.',
      s90: 'Detectability is the axis I insist on adding, and it reorders the register substantially. On a support assistant, our three highest-scoring risks were all low-detectability: a confidently wrong policy answer, a regional question answered from national policy, and a stale corpus serving withdrawn policy. None of those raises an error, none appears in availability monitoring, and all three would run for days. Meanwhile offensive output — high severity — scored lowest, because it would be visible and reported within minutes. Severity alone would have pointed our effort at the wrong risk entirely. The other thing I do is write kill criteria before launch and name who can invoke them, because a criterion that needs a meeting to trigger will not be triggered — during an incident nobody wants to be the person who says stop.'
    }
  }
];
