/**
 * DOMAIN S — SYSTEM THINKING FOR PRODUCT MANAGERS (BUILD.md section 22)
 */
export const topics = [
  {
    id: 'systems-thinking',
    title: 'Systems Thinking',
    domain: 'systems-thinking', tier: 1, priority: 'high',
    summary: 'Seeing the whole machine, not the part you were asked to change.',
    what: `Systems thinking is looking at a change in terms of the connected whole it sits inside: what feeds it, what depends on it, what loops back, and where the consequences of a local change appear.`,
    why: `Almost every expensive surprise in product work is a second-order effect — something that broke two systems away from the change, in a team that was never consulted. Systems thinking is the habit that surfaces those before shipping rather than after.`,
    analogy: `Plumbing. You can change one tap, and pressure is a property of the whole network. Whether that change matters is not visible from the tap.`,
    technical: `The shifts in attention that make the difference:

**From parts to connections.** The interesting behaviour of a system usually lives in the interfaces between components, not inside them.

**From events to patterns.** One incident is an event; three incidents with the same shape is a structure that will keep producing incidents.

**From linear to circular.** Most consequential behaviour comes from feedback loops — reinforcing (which amplify) or balancing (which stabilise). A metric that keeps drifting back to where it was has a balancing loop you have not found.

**Delay is the thing that fools everyone.** Cause and effect are separated in time, so the consequence of a change arrives after everyone has stopped associating the two. A support load increase three weeks after a launch is rarely attributed to the launch.

The practical output for a PM is a habit, not a diagram: before approving a change, ask what is upstream of it, what is downstream, which loops it touches, and which of those has a delay long enough to hide the effect.`,
    diagram: `
   FOUR SHIFTS IN ATTENTION

     PARTS       →  CONNECTIONS
       interesting behaviour lives in the interfaces

     EVENTS      →  PATTERNS
       one incident is an event
       three with the same shape is a STRUCTURE

     LINEAR      →  CIRCULAR
       reinforcing loops amplify
       balancing loops stabilise
       ⚠ a metric that drifts back has a balancing loop
         you have not found

     NOW         →  DELAYED
       cause and effect separated in time

   ⚠ DELAY IS WHAT FOOLS EVERYONE

     launch ──────────────────► support load rises
       week 0                     week 3

     by week 3 nobody associates the two.
     The launch is "done". The load is "seasonal".

   THE PM HABIT — four questions before approving a change

     1  what is UPSTREAM of this?      (what feeds it)
     2  what is DOWNSTREAM?            (what depends on it)
     3  which LOOPS does it touch?
     4  which effects are DELAYED enough to hide?

   the output is a habit, not a diagram`,
    example: {
      language: 'text',
      caption: 'A one-line change, traced through the system',
      code: `CHANGE  "Increase the free-tier query limit from 50 to 200/month."
        One config value. Estimated: 10 minutes.

FIRST ORDER — what everyone discussed
  more free usage → better activation → more conversions   ✓ intended

SECOND ORDER — surfaced by asking who is downstream
  · inference cost rises 4x on the free tier
      → at current free volume, ₹2.8L/month, not budgeted
  · free-tier traffic shares the serving pool with paid
      → p95 latency for PAYING customers rises
      → ⚠ this is the one that would have caused an incident

  · support volume rises with usage
      → free-tier users generate the most tickets per rupee
      → support was not consulted

THIRD ORDER — surfaced by asking about loops
  · REINFORCING: more free usage → more content indexed →
      better answers → more usage. Good, and it compounds cost.
  · BALANCING:   latency rises → paid users churn → revenue
      falls → less capacity. Bad, and it is SLOW.

⚠ DELAY MAP — where the damage hides
  cost increase           visible in 1 day     (billing)
  latency degradation     visible in 1 week    (if monitored)
  paid churn              visible in 2 MONTHS  ← nobody will
                                                 connect it to
                                                 this change
  support load            visible in 3 weeks

WHAT THE HABIT PRODUCED
  Ship it — but:
    · separate serving pools for free and paid (protects the
      latency of the people who pay)
    · a cost alert at ₹1L/month
    · tell support before, not after
    · put a dated note in the ops log so the churn number in
      December has something to be compared against

  ⚠ THE LAST ONE COSTS NOTHING AND IS THE ONE ALWAYS SKIPPED.
    Without it, the two-month-later churn conversation starts
    from zero.

TOTAL COST OF THINKING  ~30 minutes.
Cost of the incident it prevented: considerably more.`
    },
    prereq: [], next: ['upstream-downstream', 'dependencies-interfaces'],
    related: ['failure-propagation', 'product-tradeoffs', 'ai-risk', 'operational-impact'],
    tools: [],
    useCases: [
      'Assessing a change before approving it.',
      'Explaining why a small change had a large consequence.',
      'Finding the loop behind a metric that will not move.'
    ],
    avoid: [
      'Diagramming for its own sake.',
      'Applying it to genuinely local, reversible changes.'
    ],
    mistakes: [
      'Considering only the intended first-order effect.',
      'Missing delayed effects, which is where the expensive surprises live.',
      'Treating repeated incidents as bad luck rather than as structure.',
      'Never recording the change date, so the delayed effect cannot be attributed.'
    ],
    keyTerms: [
      ['system', 'A set of connected parts whose behaviour comes from the connections.'],
      ['feedback loop', 'Output feeding back as input; reinforcing or balancing.'],
      ['reinforcing loop', 'Amplifies change. Growth and collapse both come from these.'],
      ['balancing loop', 'Resists change; pulls a metric back toward where it was.'],
      ['delay', 'Time between cause and effect. What hides the connection.'],
      ['second-order effect', 'The consequence of the consequence.']
    ],
    resources: [
      ['Donella Meadows — Thinking in Systems (overview)', 'https://donellameadows.org/systems-thinking-resources/', 'reference'],
      ['Donella Meadows — leverage points', 'https://donellameadows.org/archives/leverage-points-places-to-intervene-in-a-system/', 'article'],
      ['Google SRE Book', 'https://sre.google/sre-book/table-of-contents/', 'reference']
    ],
    questions: [
      ['Why is delay the most dangerous property of a system?', 'Cause and effect are separated in time, so by the time the consequence appears nobody associates it with the change. Paid churn two months after a config change is never attributed to it.'],
      ['What are the four questions to ask before approving a change?', 'What is upstream, what is downstream, which feedback loops does it touch, and which of those effects are delayed enough to hide the connection.'],
      ['What distinguishes an event from a structure?', 'One incident is an event; three incidents with the same shape indicate a structure that will keep producing them. Fixing events is endless; fixing the structure is not.']
    ],
    interview: {
      s30: 'Systems thinking is looking at a change in terms of what feeds it, what depends on it, and which feedback loops it touches — because almost every expensive surprise is a second-order effect in a team that was never consulted.',
      s90: 'The property I pay most attention to is delay. On a free-tier limit increase — one config value, ten minutes of work — the first-order effect was better activation, which is what everyone discussed. The second-order effects were a fourfold cost increase and, more seriously, free traffic sharing a serving pool with paid customers, so the people paying us would see worse latency. But the one that would have actually hurt was third-order and delayed: latency degradation causing paid churn, visible about two months later, by which point nobody would connect it to a config change from October. So we split the serving pools, added a cost alert, told support in advance, and — the part that costs nothing and always gets skipped — wrote a dated note in the ops log, so that the December churn conversation had something to compare against instead of starting from zero.'
    }
  },

  {
    id: 'upstream-downstream',
    title: 'Upstream & Downstream',
    domain: 'systems-thinking', tier: 1, priority: 'high',
    summary: 'What feeds you, what you feed — and why the direction determines who gets hurt.',
    what: `Upstream is what your component depends on. Downstream is what depends on your component. The distinction determines who is affected by a change and in which direction the impact travels.`,
    why: `Teams reliably know their upstream dependencies, because those break them. They routinely do not know their downstream consumers, because breaking those is somebody else's incident.`,
    analogy: `A river. Upstream pollution reaches you; your pollution reaches everyone below. Nobody upstream notices what you did.`,
    technical: `**Upstream dependencies** are visible because you feel them — an API you call, a database you read, a team whose work blocks yours. Teams track these.

**Downstream consumers** are invisible because their pain is not yours. A field you renamed, a response format you tightened, an endpoint you made stricter — you will not see the failure, and the report arrives days later from someone you have never met.

**Downstream discovery is a practice, not a document.** Query logs for who calls your endpoints, search the codebase for imports, check the analytics warehouse for who reads your tables, and ask support who complains about your area. An architecture diagram will be out of date; the logs will not.

**Data has the longest downstream chain and the weakest ownership.** A column you renamed feeds a dashboard, which feeds a weekly report, which feeds a board metric. The chain is long, it is undocumented, and it breaks silently — the dashboard will show a plausible wrong number rather than an error.

For AI systems the downstream chain includes things that do not look like consumers: **evaluation sets, retrieval indexes, prompt templates and cached results.** Changing a chunking strategy is upstream of every embedding you have stored, which is upstream of every answer you produce.`,
    diagram: `
   DIRECTION DETERMINES WHO GETS HURT

     UPSTREAM          →  YOU  →          DOWNSTREAM
     what you depend on              what depends on you

     ✓ you TRACK these               ✗ you usually do NOT
       because they break you          because their pain
                                       is not yours

   ⚠ THE ASYMMETRY IS THE WHOLE POINT

     upstream breaks   → your pager  → you find out in minutes
     you break down-
     stream            → their pager → you find out in DAYS,
                                       from someone you have
                                       never met

   DOWNSTREAM DISCOVERY IS A PRACTICE, NOT A DOCUMENT

     query logs        who calls your endpoints
     codebase search   who imports your module
     warehouse         who reads your tables
     support           who complains about your area

     ⚠ the architecture diagram is out of date.
       the logs are not.

   ⚠ DATA HAS THE LONGEST CHAIN AND THE WEAKEST OWNERSHIP

     column rename → dashboard → weekly report → board metric

     and it breaks SILENTLY — the dashboard shows a plausible
     wrong number rather than an error

   FOR AI, THE DOWNSTREAM CHAIN INCLUDES NON-OBVIOUS THINGS

     chunking strategy
        └─► every stored embedding
             └─► every retrieval result
                  └─► every answer
                       └─► the evaluation set that judged them`,
    example: {
      language: 'text',
      caption: 'Finding the downstream nobody documented',
      code: `CHANGE  Rename ticket.category → ticket.issue_type
        "It's an internal field. Nobody uses it."

DOWNSTREAM DISCOVERY — 45 minutes of looking

  1  API access logs, last 30 days
       GET /v1/tickets?fields=category    → 3 callers
         · the mobile app (v4.2, still 31% of installs)
         · a partner integration (contract, 60-day notice)
         · someone's script from an IP in the finance subnet

  2  Codebase grep
       12 files, 3 repos, including one nobody owns

  3  Warehouse — who reads the column
       · fct_tickets (dbt model)
          └─► support_weekly dashboard
               └─► the ops review deck
                    └─► a board metric  ⚠ four hops from a
                                          field we called internal

  4  Support
       "the category filter" appears in 40 macros

  5  ⚠ AI-SPECIFIC — the chain nobody looks for
       · category is in the retrieval metadata filter
       · it is in the prompt template as a routing hint
       · 220 golden-set cases carry it as an expected field
       → renaming it silently degrades retrieval AND
         invalidates the evaluation set that would have
         caught the degradation

WHAT "10 MINUTES" ACTUALLY WAS
  a 6-week deprecation: dual-write both fields, migrate each
  consumer, notify the partner, rebuild the golden set,
  then drop the old column.

⚠ THE FAILURE MODE IF WE HAD SHIPPED IT
  The API callers would have errored loudly — fine, we would
  have fixed it that day.
  The DASHBOARD would have shown zero, been read as "a quiet
  week", and reached the board deck as a real number.
  Loud failures are cheap. Silent ones are not.`
    },
    prereq: ['systems-thinking'], next: ['dependencies-interfaces', 'data-dependencies'],
    related: ['failure-propagation', 'data-dependencies', 'engineering-dependencies', 'journey-mapping'],
    tools: [],
    useCases: [
      'Discovering who actually consumes what you are about to change.',
      'Planning a deprecation with a realistic timeline.',
      'Explaining why an "internal" field is not internal.'
    ],
    avoid: [
      'Relying on an architecture diagram for downstream discovery.',
      'Assuming no reported consumers means no consumers.'
    ],
    mistakes: [
      'Tracking upstream dependencies and ignoring downstream consumers.',
      'Trusting documentation over logs for who calls what.',
      'Forgetting that data pipelines fail silently with plausible wrong numbers.',
      'For AI, missing that a chunking or metadata change invalidates stored embeddings and the evaluation set.'
    ],
    keyTerms: [
      ['upstream', 'What your component depends on.'],
      ['downstream', 'What depends on your component.'],
      ['consumer discovery', 'Using logs, greps and warehouse lineage to find dependents.'],
      ['deprecation', 'Retiring an interface with notice and a migration path.'],
      ['dual-write', 'Writing both old and new fields during a migration.'],
      ['silent failure', 'A break that produces a plausible wrong value, not an error.'],
      ['lineage', 'The chain from a data source through to a reported metric.']
    ],
    resources: [
      ['Google SRE — service level objectives', 'https://sre.google/sre-book/service-level-objectives/', 'reference'],
      ['dbt — data lineage', 'https://docs.getdbt.com/docs/build/documentation', 'docs'],
      ['Martin Fowler — parallel change', 'https://martinfowler.com/bliki/ParallelChange.html', 'article']
    ],
    questions: [
      ['Why do teams know their upstream dependencies but not their downstream consumers?', 'Upstream breaks reach your pager in minutes. Downstream breaks reach somebody else\'s pager days later, so there is no feedback loop teaching you they exist.'],
      ['How do you actually find downstream consumers?', 'Logs, codebase search, warehouse lineage and support macros — not the architecture diagram, which is out of date. The logs are the only source that reflects reality.'],
      ['Why are data consumers the most dangerous downstream?', 'The chain is long and undocumented, and it fails silently. A renamed column produces a plausible zero on a dashboard rather than an error, and that zero can travel to a board deck as a real number.']
    ]
  },

  {
    id: 'dependencies-interfaces',
    title: 'Dependencies & Interfaces',
    domain: 'systems-thinking', tier: 2, priority: 'high',
    summary: 'The contracts between parts — and the fact that most of them were never written down.',
    what: `A dependency is one component relying on another. An interface is the contract between them: what is promised, in what shape, with what guarantees.`,
    why: `Systems break at interfaces far more often than inside components, because a component is owned and tested while the contract between two components is frequently owned by nobody and tested by neither.`,
    analogy: `A power socket. The plug and the appliance are each well made; everything depends on both agreeing about the shape and the voltage, and that agreement is not part of either device.`,
    technical: `The types of dependency, in increasing order of how easily they are forgotten:
- **Explicit** — a declared API call or library import. Visible, versioned, usually fine.
- **Implicit** — a shared database table, a file dropped in a bucket, an assumed ordering. Real and undeclared.
- **Temporal** — "this job must run after that one". Invisible until the schedule shifts.
- **Semantic** — the same field name meaning different things to two teams. The worst kind, because everything technically works.

**Explicit contracts are what make change safe.** A schema, a versioned API, a documented event format — these convert a change from "hope nothing breaks" into "the contract says what is allowed".

**Semantic drift is the failure nobody catches.** Two teams both have a field called "active_user", defined differently, and both dashboards are correct in their own terms. The reconciliation meeting happens six months later when the numbers are compared.

**For AI systems, the prompt is an interface**, and it is usually an undeclared one. A prompt template that assumes retrieved chunks arrive in a particular format has a contract with the retrieval layer that exists only in someone's head. The same applies to the schema of a tool call and the shape of an evaluation record.`,
    diagram: `
   FOUR KINDS, IN ORDER OF HOW EASILY FORGOTTEN

     EXPLICIT    a declared API call, a library import
                 visible · versioned · usually fine

     IMPLICIT    shared table · file in a bucket · assumed order
                 real and UNDECLARED

     TEMPORAL    "this job must run after that one"
                 invisible until the schedule shifts

     SEMANTIC    same field name, different meaning
                 ⚠ THE WORST — everything technically works

   ⚠ SEMANTIC DRIFT IS THE ONE NOBODY CATCHES

     team A: active_user = logged in this month
     team B: active_user = performed a write this month

     both dashboards are CORRECT in their own terms
     both numbers are quoted in the same meeting
     the reconciliation happens six months later

   EXPLICIT CONTRACTS ARE WHAT MAKE CHANGE SAFE

     no contract    "hope nothing breaks"
     contract       "the contract says what is allowed"

     a schema · a versioned API · a documented event format

   ⚠ FOR AI, THE PROMPT IS AN INTERFACE — usually undeclared

     prompt template  ⟷  retrieval layer
       assumes chunk format, ordering, citation markers
       contract exists only in someone's head

     same for: tool-call schemas · evaluation record shape
               · the metadata fields a filter relies on`,
    example: {
      language: 'text',
      caption: 'The four kinds, found in one system',
      code: `SYSTEM  the policy assistant

EXPLICIT — declared, versioned, fine
  · anthropic-sdk 0.39.0        pinned in requirements.txt
  · POST /v1/messages           versioned API, documented
  → a breaking change here arrives as a release note

IMPLICIT — real and undeclared
  · the ingestion job writes to s3://policies/parsed/
    and the indexer reads that prefix
  · nothing declares this. It is two constants in two repos.
  → renaming the prefix breaks the indexer with no error
    until the next scheduled run, at 03:00

TEMPORAL — invisible until the schedule shifts
  · ingest (02:00) must finish before index (03:00)
  · works because ingest takes 20 minutes
  · ⚠ at 3x the corpus it takes 70 minutes and the indexer
    silently indexes yesterday's documents
  → the dependency was on DURATION, which nobody declared

SEMANTIC — everything technically works
  · retrieval calls a record "chunk"     = 800 chars, overlapping
  · evaluation calls a record "chunk"    = one document section
  · groundedness scoring joins them by id
  → the scores are computed. They are meaningless. Nothing errors.
  ⚠ this survived four months and two people

⚠ THE PROMPT AS AN UNDECLARED INTERFACE
  the template says:
      "Context:\\n{chunks}\\n\\nCite as [n]."
  it assumes:
      · chunks arrive numbered
      · numbering starts at 1
      · source metadata is on each chunk
      · order is by relevance, descending

  none of that is declared anywhere. When reranking was added
  and changed the ordering, citations pointed at the wrong
  sources — and every test still passed, because the tests
  checked that a citation EXISTED, not that it was right.

THE FIX, IN EACH CASE
  implicit  → a shared config module, one source of truth
  temporal  → the indexer checks a completion marker, not a clock
  semantic  → one glossary, one owner, names that differ when
              the meanings differ
  prompt    → a typed context object with a schema, and a test
              that asserts citation → source correctness`
    },
    prereq: ['upstream-downstream'], next: ['failure-propagation'],
    related: ['data-dependencies', 'engineering-dependencies', 'what-is-mcp', 'tool-calling'],
    tools: [],
    useCases: [
      'Finding the undeclared contracts in a system.',
      'Diagnosing a failure where everything technically worked.',
      'Making a prompt-to-retrieval contract explicit.'
    ],
    avoid: [
      'Relying on implicit contracts between teams.',
      'Two definitions of the same field name.'
    ],
    mistakes: [
      'Treating shared tables and bucket prefixes as not being dependencies.',
      'Depending on job duration rather than on a completion signal.',
      'Allowing the same name to mean different things in two places.',
      'Leaving the prompt-to-retrieval contract undeclared, so a reranking change breaks citations silently.'
    ],
    keyTerms: [
      ['interface', 'The contract between two components.'],
      ['explicit dependency', 'A declared call or import.'],
      ['implicit dependency', 'A real but undeclared reliance.'],
      ['temporal dependency', 'An ordering or timing assumption.'],
      ['semantic drift', 'The same name meaning different things.'],
      ['contract test', 'A test asserting the agreement between two components.'],
      ['completion marker', 'An explicit signal replacing a timing assumption.']
    ],
    resources: [
      ['Martin Fowler — contract testing', 'https://martinfowler.com/bliki/ContractTest.html', 'article'],
      ['Google SRE Book', 'https://sre.google/sre-book/table-of-contents/', 'reference'],
      ['Model Context Protocol — documentation', 'https://modelcontextprotocol.io/', 'docs']
    ],
    questions: [
      ['Why is semantic drift the worst kind of dependency failure?', 'Because everything technically works. Two teams define the same field differently, both dashboards are internally correct, and the discrepancy surfaces months later in a meeting.'],
      ['What is a temporal dependency and why is it dangerous?', 'A reliance on ordering or duration — "ingest finishes before index runs". It works until the data grows, then fails silently because the assumption was never declared.'],
      ['Why is a prompt an interface?', 'It carries an undeclared contract with the retrieval layer about chunk format, numbering and ordering. Change the ordering and citations point at the wrong sources while every test still passes.']
    ]
  },

  {
    id: 'failure-propagation',
    title: 'Failure Propagation',
    domain: 'systems-thinking', tier: 2, priority: 'high',
    summary: 'How one component failing becomes several, and how to stop the spread.',
    what: `Failure propagation is the way a fault in one part of a system causes faults in the parts that depend on it, sometimes cascading well beyond the original blast radius.`,
    why: `Most serious outages are not one thing breaking; they are one thing breaking and the system amplifying it. The difference between a degraded feature and a full outage is entirely a design choice made in advance.`,
    analogy: `Electrical circuits. A fuse exists so that one fault destroys one cheap component instead of the whole building.`,
    technical: `The propagation patterns worth recognising:
- **Cascading failure** — A fails, B waits on A and exhausts its threads, C waits on B. The original fault is small; the outage is total.
- **Retry storms** — everything retries at once, turning a brief degradation into sustained overload. Retries need backoff and jitter, or they are an attack on your own system.
- **Thundering herd** — a cache expires and every request hits the origin simultaneously.
- **Silent degradation** — a component returns wrong-but-plausible results instead of failing. Far worse than an outage, because nothing alerts.

The defences: **timeouts** (never wait indefinitely), **circuit breakers** (stop calling something that is failing), **bulkheads** (isolate resource pools so one consumer cannot exhaust them), **graceful degradation** (a defined reduced mode), and **backpressure** (shed load rather than queue infinitely).

**AI systems fail in an unusual way: they degrade rather than stop.** A retrieval index that is stale still returns results. A model under load still answers, more slowly and sometimes worse. A prompt change that hurts quality produces fluent, confident, wrong output. Nothing throws. This is why AI systems need quality monitoring in addition to availability monitoring — uptime can be 100% while the product is broken.`,
    diagram: `
   THE PATTERNS

     CASCADING       A fails → B's threads exhaust waiting on A
                     → C waits on B → total outage
                     the original fault was small

     RETRY STORM     everything retries at once
                     brief degradation → sustained overload
                     ⚠ retries without backoff+jitter are an
                       attack on your own system

     THUNDERING HERD cache expires → every request hits origin
                     simultaneously

     SILENT          returns wrong-but-plausible results
     DEGRADATION     instead of failing
                     ⚠ worse than an outage — nothing alerts

   THE DEFENCES

     timeout          never wait indefinitely
     circuit breaker  stop calling what is failing
     bulkhead         isolate pools; one consumer cannot
                      exhaust them for everyone
     graceful         a DEFINED reduced mode
     degradation
     backpressure     shed load rather than queue infinitely

   ⚠ AI SYSTEMS DEGRADE RATHER THAN STOP

     stale index          still returns results
     model under load     still answers, slower and worse
     bad prompt change    fluent, confident, WRONG

     NOTHING THROWS.

     uptime 100%  ·  product broken

     → AI systems need QUALITY monitoring alongside
       availability monitoring. Availability alone will
       report everything is fine.`,
    example: {
      language: 'python',
      caption: 'Containing a failure instead of amplifying it',
      code: `# ── WITHOUT CONTAINMENT — one slow dependency, total outage ──
def answer(question):
    chunks = retrieval.search(question)       # no timeout
    return llm.generate(question, chunks)     # no timeout, no fallback

# retrieval slows to 30s → every request thread blocks →
# the pool exhausts → the whole console stops responding,
# including features that never touch retrieval.


# ── WITH CONTAINMENT ────────────────────────────────────────
from circuitbreaker import circuit

@circuit(failure_threshold=5, recovery_timeout=30)
def _retrieve(question):
    return retrieval.search(question, timeout=2.0)   # BULKHEAD + TIMEOUT

def answer(question):
    try:
        chunks = _retrieve(question)
    except (TimeoutError, CircuitBreakerError):
        metrics.increment("degraded.retrieval_unavailable")
        return {                                     # GRACEFUL DEGRADATION
            "mode": "degraded",
            "text": "I can't reach the policy documents right now. "
                    "Handbook search is still available.",
            "fallback_url": handbook_search_url(question),
        }

    try:
        text = llm.generate(question, chunks, timeout=8.0)
    except TimeoutError:
        metrics.increment("degraded.model_timeout")
        return {"mode": "degraded",
                "text": "Taking longer than usual — here are the "
                        "policy sections that matched:",
                "chunks": chunks[:3]}                # still useful

    return {"mode": "full", "text": text, "chunks": chunks}

# One dependency failing now costs ONE feature a reduced mode,
# not the console.


# ⚠ THE MONITORING THAT AVAILABLE-ALONE MISSES
def health():
    return {
        # availability — what normal monitoring catches
        "uptime": uptime_pct(),                       # 100%
        "error_rate": error_rate(),                   # 0.0%

        # QUALITY — what nothing else catches
        "index_age_hours": index_age(),               # 71  ⚠ stale
        "abstention_rate": abstention_rate(),         # 0.41 ⚠ drifting
        "groundedness_p50": groundedness_sample(),    # 0.62 ⚠ falling
        "degraded_mode_share": degraded_share(),      # 0.03
    }

# Uptime 100%, errors 0%, and the product has been answering
# from three-day-old documents since Tuesday.
# No exception was ever raised. Nothing was ever going to page.`
    },
    prereq: ['dependencies-interfaces'], next: ['operational-impact'],
    related: ['tracing', 'drift-detection', 'ai-risk', 'upstream-downstream'],
    tools: ['opentelemetry'],
    useCases: [
      'Designing a feature so a dependency failure degrades rather than cascades.',
      'Explaining why uptime was 100% during a quality incident.',
      'Choosing what to monitor for an AI system.'
    ],
    avoid: [
      'Calls without timeouts.',
      'Retries without backoff and jitter.',
      'Availability-only monitoring for AI features.'
    ],
    mistakes: [
      'No timeout, so one slow dependency exhausts the thread pool and takes down unrelated features.',
      'Retrying aggressively, converting a brief degradation into a sustained outage.',
      'Assuming an AI system will fail loudly — it degrades quietly instead.',
      'Monitoring availability without quality, so a stale index reports perfect health.'
    ],
    keyTerms: [
      ['cascading failure', 'One fault exhausting resources in dependents.'],
      ['retry storm', 'Synchronised retries amplifying a fault.'],
      ['thundering herd', 'Simultaneous origin hits after a cache expiry.'],
      ['circuit breaker', 'Stops calling a failing dependency.'],
      ['bulkhead', 'Isolated resource pools limiting blast radius.'],
      ['graceful degradation', 'A defined reduced mode instead of failure.'],
      ['silent degradation', 'Wrong-but-plausible output with no error.']
    ],
    resources: [
      ['Google SRE — addressing cascading failures', 'https://sre.google/sre-book/addressing-cascading-failures/', 'reference'],
      ['AWS — timeouts, retries and backoff with jitter', 'https://aws.amazon.com/builders-library/timeouts-retries-and-backoff-with-jitter/', 'article'],
      ['Michael Nygard — Release It (circuit breaker)', 'https://martinfowler.com/bliki/CircuitBreaker.html', 'article']
    ],
    questions: [
      ['How does a small fault become a total outage?', 'Dependents block waiting on it and exhaust their own resources, so the failure propagates upward. Timeouts, circuit breakers and bulkheads are what stop the spread.'],
      ['Why are retries dangerous?', 'Synchronised retries turn a brief degradation into sustained overload. Without exponential backoff and jitter, a retry policy is an attack on your own system.'],
      ['Why is availability monitoring insufficient for AI systems?', 'They degrade rather than stop. A stale index still returns results and a bad prompt still produces fluent output, so uptime reads 100% while the product is broken. Quality metrics are what catch it.']
    ]
  },

  {
    id: 'data-dependencies',
    title: 'Data Dependencies',
    domain: 'systems-thinking', tier: 2, priority: 'medium',
    summary: 'The longest chains in any organisation, and the ones most likely to break quietly.',
    what: `A data dependency is one dataset, metric or model relying on another. The chains run from source systems through pipelines and models to dashboards, reports and — increasingly — retrieval indexes and evaluation sets.`,
    why: `Data chains are long, cross team boundaries, and fail without raising errors. A wrong number is more damaging than a missing one, because it gets used.`,
    analogy: `A supply chain. A substituted ingredient six suppliers back does not stop the production line; it changes the product, and nobody notices until a customer complains.`,
    technical: `**Lineage** is the map of what depends on what. Modern tooling can generate it from the transformation code, which makes it the rare documentation that stays current.

The failure modes that matter:
- **Schema change** — a column renamed, retyped or dropped. Sometimes loud, often not.
- **Semantic change** — the definition changes while the name does not. Always silent.
- **Freshness failure** — the pipeline did not run. The dashboard shows yesterday, looking entirely normal.
- **Volume change** — a source starts sending far more or far fewer rows. Downstream aggregates shift and nobody knows why.

**Test data like code.** Assertions on row counts, null rates, distributions and freshness catch the silent failures. A pipeline that runs successfully and produces wrong data is the normal case, not the exception.

**For AI systems the data chain has extra links that are easy to miss**: the corpus feeding the retrieval index, the index feeding retrieval, retrieval feeding answers, and answers feeding the evaluation record. A corpus update with a parsing regression silently degrades every answer, and if the evaluation set was built from the same corpus, the evaluation will not catch it.`,
    diagram: `
   THE CHAIN IS LONGER THAN ANYONE THINKS

     source system
       └─► ingestion
            └─► warehouse table
                 └─► transformation model
                      └─► dashboard
                           └─► weekly report
                                └─► board metric

     six hops · four teams · one undocumented rename
     away from being wrong

   FOUR FAILURE MODES

     SCHEMA      column renamed / retyped / dropped
                 sometimes loud, often not

     SEMANTIC    definition changes, name does not
                 ⚠ ALWAYS silent

     FRESHNESS   pipeline did not run
                 dashboard shows yesterday, looking normal

     VOLUME      source sends 10x or 0.1x rows
                 aggregates shift, nobody knows why

   ⚠ A PIPELINE THAT RUNS SUCCESSFULLY AND PRODUCES
     WRONG DATA IS THE NORMAL CASE

   TEST DATA LIKE CODE

     row count within expected range
     null rate below threshold
     distribution not shifted
     freshness within SLA
     referential integrity holds

   ⚠ THE AI LINKS PEOPLE MISS

     corpus ──► index ──► retrieval ──► answers ──► eval record

     a parsing regression in the corpus degrades every answer
     ⚠ and if the EVAL SET was built from the same corpus,
       the evaluation will not catch it — both sides moved`,
    example: {
      language: 'python',
      caption: 'Data tests that catch the silent failures',
      code: `# The pipeline ran. Exit code 0. Everything is wrong.
# These assertions are what stand between that and a board deck.

def validate_policy_corpus(new, previous):
    checks = []

    # FRESHNESS — did it actually run with new data?
    checks.append(("freshness",
                   new.max_ingested_at > now() - timedelta(hours=26)))

    # VOLUME — sudden change means a source or parser changed
    ratio = new.row_count / max(previous.row_count, 1)
    checks.append(("volume", 0.9 <= ratio <= 1.5))

    # SCHEMA — the columns downstream relies on still exist
    required = {"doc_id", "section", "text", "effective_from", "region"}
    checks.append(("schema", required <= set(new.columns)))

    # NULLS — a parser regression shows up here first
    checks.append(("text_nulls", new.null_rate("text") < 0.01))

    # ⚠ DISTRIBUTION — the check that catches parsing regressions
    #    A PDF parser change that drops tables keeps the row count
    #    and halves the mean length. Volume passes. This does not.
    checks.append(("text_length",
                   0.8 <= new.mean_len("text") / previous.mean_len("text") <= 1.25))

    # REFERENTIAL — every chunk points at a real document
    checks.append(("orphans", new.orphan_chunk_count() == 0))

    failed = [name for name, ok in checks if not ok]
    if failed:
        raise DataQualityError(f"corpus validation failed: {failed}")
    return True


# ⚠ THE AI-SPECIFIC CHECK MOST TEAMS DO NOT HAVE
def validate_index_against_eval(index, golden_set):
    """The eval set can silently move WITH the corpus.
    If both changed, evaluation proves nothing."""
    missing = [c["doc_id"] for c in golden_set
               if not index.contains(c["doc_id"])]
    if missing:
        raise DataQualityError(
            f"{len(missing)} golden-set documents are not in the index. "
            "Evaluation results are not comparable to the last run.")

    # And pin the eval corpus separately, so a corpus regression
    # cannot hide inside a matching eval regression.
    if golden_set.corpus_version == index.corpus_version:
        log.warning(
            "eval set and index share a corpus version — a parsing "
            "regression would degrade both and score unchanged")

# Real incident this catches:
#   PDF parser upgrade dropped table content.
#   row count: unchanged. pipeline: green. dashboards: normal.
#   mean text length: -34%.  ← the only signal
#   answer quality on table-based policy questions: collapsed.
#   Time to detection WITHOUT the length check: 3 weeks,
#   via an agent complaint.`
    },
    prereq: ['upstream-downstream'], next: [],
    related: ['dependencies-interfaces', 'null-handling', 'golden-sets', 'drift-detection', 'indexing-embedding'],
    tools: ['postgres', 'duckdb'],
    useCases: [
      'Catching pipeline failures that do not raise errors.',
      'Tracing a wrong dashboard number back to its source.',
      'Ensuring an evaluation set has not drifted with the corpus.'
    ],
    avoid: [
      'Relying on exit codes as a data quality signal.',
      'Building an evaluation set from the same version as the index without pinning it.'
    ],
    mistakes: [
      'Assuming a successful pipeline run means correct data.',
      'Testing row counts but not distributions, which is where parser regressions hide.',
      'Letting a definition change while the field name stays the same.',
      'Letting the evaluation set move with the corpus, so a regression scores unchanged.'
    ],
    keyTerms: [
      ['lineage', 'The map of what data depends on what.'],
      ['freshness', 'Whether the data is as recent as expected.'],
      ['schema change', 'A structural change to columns or types.'],
      ['semantic change', 'A definition change with no structural signal.'],
      ['data test', 'An assertion about data shape, volume or distribution.'],
      ['distribution check', 'Catches regressions that preserve row counts.'],
      ['corpus version', 'The pinned snapshot an index or eval set was built from.']
    ],
    resources: [
      ['dbt — tests', 'https://docs.getdbt.com/docs/build/data-tests', 'docs'],
      ['Great Expectations — documentation', 'https://docs.greatexpectations.io/', 'docs'],
      ['Google — data validation for ML', 'https://cloud.google.com/architecture/mlops-continuous-delivery-and-automation-pipelines-in-machine-learning', 'reference']
    ],
    questions: [
      ['Why is a wrong number worse than a missing one?', 'A missing number is noticed and investigated. A wrong number is used — it travels through dashboards and reports into decisions before anyone questions it.'],
      ['What catches a parser regression that preserves row counts?', 'A distribution check. If a PDF parser stops extracting tables, the row count is unchanged and the mean text length falls sharply — that is the only signal.'],
      ['Why must an evaluation set be pinned separately from the index?', 'If both are built from the same corpus version, a corpus regression degrades both and the score is unchanged, so the evaluation cannot detect the very failure it exists to catch.']
    ]
  },

  {
    id: 'engineering-dependencies',
    title: 'Engineering Dependencies',
    domain: 'systems-thinking', tier: 3, priority: 'medium',
    summary: 'Work that cannot start until other work finishes — the main reason plans slip.',
    what: `An engineering dependency is a piece of work blocked by another: a shared service, a platform capability, another team's API, an environment, or a person with exclusive knowledge.`,
    why: `Estimates assume work can start when planned. Dependencies are why it cannot, and unmanaged dependencies are the single most common cause of a plan that was reasonable becoming a plan that was late.`,
    analogy: `Construction trades. Every trade's estimate is accurate; the building is late because the electrician could not start until the plasterer finished and the plasterer was on another site.`,
    technical: `The types: **team dependencies** (another team must deliver), **platform dependencies** (infrastructure that does not exist yet), **sequence dependencies** (A genuinely must precede B), **knowledge dependencies** (only one person can do it), and **environment dependencies** (shared staging, test data, access).

**Cross-team dependencies are the expensive ones**, because they run on a different team's priorities, not yours. The mitigations, in order of preference: eliminate it (build a temporary version yourself), decouple it (agree a contract and mock it so both sides build in parallel), or schedule it explicitly with a named owner and a date.

**Knowledge dependencies are underrated.** "Only Priya can change the ingestion pipeline" is a dependency, a bus factor and a bottleneck simultaneously, and it never appears on a plan.

**Agreeing the interface early is the highest-leverage move available.** Two teams that agree a contract on day one can both build against it immediately. Two teams that wait for one to finish are serialised by definition. This single technique converts more dependencies into parallel work than any amount of tracking.`,
    diagram: `
   TYPES

     TEAM         another team must deliver     ← the expensive one
     PLATFORM     infrastructure not built yet
     SEQUENCE     A genuinely must precede B
     KNOWLEDGE    only one person can do it     ← never on a plan
     ENVIRONMENT  shared staging · test data · access

   ⚠ CROSS-TEAM DEPENDENCIES RUN ON SOMEONE ELSE'S
     PRIORITIES, NOT YOURS

   MITIGATIONS, IN ORDER OF PREFERENCE

     1  ELIMINATE   build a temporary version yourself
     2  DECOUPLE    agree a contract, mock it, both build
                    in parallel                ← highest leverage
     3  SCHEDULE    named owner, agreed date, tracked

   THE DECOUPLING MOVE

     SERIALISED
       team A ████████████
       team B             ████████████
                          └─ waits for A         24 weeks-equivalent

     DECOUPLED — agree the contract on day one
       team A ████████████
       team B ████████████
              both build against the same mock   12

     converts more dependencies into parallel work than
     any amount of tracking ever will

   ⚠ KNOWLEDGE DEPENDENCIES ARE UNDERRATED

     "only Priya can change the ingestion pipeline"

     = a dependency + a bus factor + a bottleneck
       and it appears on no plan anywhere`,
    example: {
      language: 'text',
      caption: 'A dependency register that changed the plan',
      code: `FEATURE  cited policy answers in the console

DEPENDENCIES FOUND — before committing to a date

  D1  TEAM       Platform must expose a vector store
                 Their roadmap: Q4. Ours: Q3.
      ⚠ this alone made the plan impossible

      → ELIMINATED. We run pgvector in our own Postgres for
        v1. Slower at scale, unblocks 6 weeks, migratable.

  D2  TEAM       Console team owns the UI shell; our panel
                 mounts inside it
      → DECOUPLED. Agreed the component contract on day 1
        (props, events, error states). They build the slot,
        we build the panel, both against the same mock.
        Integration took an afternoon.

  D3  ENVIRONMENT  Shared staging, unreliable, and third retro
                   running that it has broken us
      → SCHEDULED + ESCALATED. Named owner in platform, date,
        and the three specific dates it failed us attached.

  D4  KNOWLEDGE  Only Priya understands the ingestion parser
      ⚠ she is also the SME for the golden set, and on leave
        for two weeks in the middle of the plan
      → SCHEDULED: two pairing sessions before her leave,
        and the parser contract written down. Cost: 1 day.
        Risk removed: the entire critical path.

  D5  SEQUENCE   Cannot build answer generation before the
                 retrieval contract is agreed
      → genuinely sequential. Kept, and put first.

WHAT THE REGISTER CHANGED
  Original plan       12 weeks, assuming everything available
  After D1 eliminated  6 weeks removed
  After D2 decoupled   3 weeks removed
  Revised plan         8 weeks, with D3 and D4 tracked

⚠ THE POINT IS NOT THE TRACKING.
  D1 and D2 were REMOVED, not managed. Nine of the eleven weeks
  saved came from eliminating and decoupling — not from a
  better-maintained dependency list.
  Tracking a dependency you could have deleted is the most
  common form of diligent waste in planning.`
    },
    prereq: ['dependencies-interfaces'], next: [],
    related: ['sprint-planning', 'roadmap', 'technical-debt', 'upstream-downstream'],
    tools: [],
    useCases: [
      'Producing a plan that survives contact with other teams.',
      'Converting a blocking dependency into parallel work.',
      'Surfacing knowledge bottlenecks before they become critical path.'
    ],
    avoid: [
      'Tracking dependencies you could eliminate.',
      'Plans that assume other teams share your priorities.'
    ],
    mistakes: [
      'Managing a dependency carefully instead of removing it.',
      'Waiting for another team to finish rather than agreeing a contract and mocking it.',
      'Ignoring knowledge dependencies, which appear on no plan and sit on the critical path.',
      'Assuming shared environments will be available when needed.'
    ],
    keyTerms: [
      ['blocking dependency', 'Work that cannot start until other work finishes.'],
      ['decoupling', 'Agreeing a contract so both sides build in parallel.'],
      ['bus factor', 'How many people must be unavailable before work stops.'],
      ['critical path', 'The sequence that determines the overall duration.'],
      ['dependency register', 'The tracked list, with owners and dates.'],
      ['mock', 'A stand-in implementation of an agreed contract.']
    ],
    resources: [
      ['Atlassian — managing dependencies', 'https://www.atlassian.com/agile/agile-at-scale', 'reference'],
      ['Martin Fowler — integration contract tests', 'https://martinfowler.com/bliki/ContractTest.html', 'article'],
      ['Team Topologies — overview', 'https://teamtopologies.com/key-concepts', 'reference']
    ],
    questions: [
      ['What is the highest-leverage way to handle a cross-team dependency?', 'Agree the interface contract on day one and mock it, so both teams build in parallel. Waiting for one team to finish serialises the work by definition.'],
      ['Why is tracking a dependency often the wrong response?', 'Because many can be eliminated or decoupled instead. Diligently tracking a dependency you could have deleted is the most common form of wasted planning effort.'],
      ['Why are knowledge dependencies dangerous?', 'They are a dependency, a bus factor and a bottleneck at once, and they appear on no plan. "Only one person can change this" sits on the critical path invisibly.']
    ]
  },

  {
    id: 'operational-impact',
    title: 'Operational & Support Impact',
    domain: 'systems-thinking', tier: 2, priority: 'medium',
    summary: 'Every feature creates work for someone who was not in the room.',
    what: `Operational impact is the ongoing work a change creates for the people who run and support the product: support agents, operations, on-call engineers, finance and anyone who has to handle the exceptions.`,
    why: `Feature cost is usually estimated as build cost. The running cost is often larger, it lands on teams that were not consulted, and it recurs forever.`,
    analogy: `Adopting an animal. The purchase price is not the cost, and the person who feeds it is frequently not the person who chose it.`,
    technical: `The categories to check before approving anything:
- **Support** — new questions, new failure modes, macros to write, training to deliver.
- **Operations** — new runbooks, new alerts, new manual steps, new things that can be in a bad state at 3am.
- **On-call** — new pages, and the ability to diagnose them at speed.
- **Finance and admin** — refunds, adjustments, reconciliation, anything that creates an exception queue.
- **Compliance** — new data flows, new retention obligations, new audit requirements.

**The exception queue is the number to ask for.** Any feature that can fail partially creates a queue of cases that need human handling. If nobody has been assigned to that queue, it will silently become somebody's problem — usually support's, without notice or headcount.

**AI features have an unusually high operational load** and it is systematically underestimated. They need someone to review flagged errors, maintain the golden set, watch for drift, and decide when a model upgrade is safe. That is a recurring role, not a launch task, and the feature quietly stops working without it.

The practical rule: **whoever will run it should see the design before it is built.** A support lead reading a design doc for twenty minutes routinely prevents months of avoidable ticket volume.`,
    diagram: `
   CATEGORIES TO CHECK BEFORE APPROVING

     SUPPORT      new questions · new failure modes
                  macros to write · training to deliver

     OPERATIONS   new runbooks · new alerts · new manual steps
                  new things that can be broken at 3am

     ON-CALL      new pages — and can they be DIAGNOSED fast?

     FINANCE      refunds · adjustments · reconciliation
                  anything creating an exception queue

     COMPLIANCE   new data flows · retention · audit

   ⚠ THE EXCEPTION QUEUE IS THE NUMBER TO ASK FOR

     any feature that can fail PARTIALLY creates a queue
     of cases needing human handling

     if nobody owns that queue, it silently becomes
     support's problem — without notice or headcount

   ⚠ AI FEATURES CARRY AN UNUSUALLY HIGH ONGOING LOAD

     review flagged errors        weekly
     maintain the golden set      ongoing
     watch for drift              continuous
     decide when upgrades are safe occasionally

     that is a RECURRING ROLE, not a launch task
     without it the feature quietly stops working

   THE PRACTICAL RULE

     whoever will RUN it should see the design
     BEFORE it is built

     20 minutes of a support lead's reading time routinely
     prevents months of avoidable ticket volume`,
    example: {
      language: 'text',
      caption: 'The operational review that changed the design',
      code: `FEATURE  cited policy answers, ready to build
REVIEW   support lead + ops lead, 30 minutes, before build

SUPPORT LEAD FOUND
  Q  "What do agents do when it says 'not covered'?"
  A  (nobody had decided)
  ⚠ 30% of queries will abstain. That is ~120/day landing on
    a path nobody designed.
  → DESIGN CHANGE: abstention response includes a one-click
    "ask a senior" that pre-fills the question and the policy
    sections already checked. Turns a dead end into a handoff.

  Q  "Who tells agents this exists and how it fails?"
  A  (nobody)
  → 20-minute training added; two macros written; the
    abandonment risk we measured (2 wrong answers) named
    explicitly in training so it is not a surprise.

OPS LEAD FOUND
  Q  "What happens when the ingestion job fails overnight?"
  A  Answers come from stale documents. Nothing alerts.
  → alert on index age > 26h, with a runbook
  → degraded banner in the UI when the index is stale

  Q  "Who is paged and what do they do?"
  A  (undefined)
  → runbook written BEFORE launch, not after the first incident

THE ONE NOBODY RAISED UNTIL ASKED
  Q  "Who reviews flagged wrong answers, weekly, forever?"
  A  ...
  ⚠ This is the question that determines whether the feature
    still works in six months. Without it: flags accumulate
    unread, the golden set goes stale, quality drifts, and
    nobody notices until agents stop using it.
  → named owner (PM + support lead, 45 min/week, in the
    calendar), and it is in the launch checklist as a
    recurring commitment rather than a task.

COST OF THE REVIEW      30 minutes
DESIGN CHANGES          3, all cheap before build
RECURRING COST SURFACED ~2.5 h/week, now staffed on purpose
                        instead of appearing as an unexplained
                        drain on support in month two`
    },
    prereq: ['systems-thinking'], next: ['compliance-risk-impact'],
    related: ['production-monitoring', 'failure-propagation', 'human-in-the-loop', 'ai-cost'],
    tools: [],
    useCases: [
      'Costing a feature including the work it creates for others.',
      'Designing the abstention and exception paths deliberately.',
      'Staffing the recurring review an AI feature needs to keep working.'
    ],
    avoid: [
      'Approving a feature without the people who will run it.',
      'Treating AI quality review as a launch task rather than a role.'
    ],
    mistakes: [
      'Estimating build cost and ignoring running cost.',
      'Creating an exception queue with no owner, so support absorbs it silently.',
      'Launching without a runbook, then writing one during the first incident.',
      'Not staffing ongoing error review, so an AI feature degrades unnoticed.'
    ],
    keyTerms: [
      ['operational load', 'Ongoing work a feature creates for those who run it.'],
      ['exception queue', 'Cases needing human handling when a feature partially fails.'],
      ['runbook', 'Documented steps for handling a known failure.'],
      ['macro', 'A prewritten support response.'],
      ['recurring commitment', 'Ongoing effort staffed deliberately, not absorbed.'],
      ['operational review', 'Design review with support and operations before build.']
    ],
    resources: [
      ['Google SRE — being on-call', 'https://sre.google/sre-book/being-on-call/', 'reference'],
      ['Google SRE — postmortem culture', 'https://sre.google/sre-book/postmortem-culture/', 'reference'],
      ['Google — People + AI Guidebook', 'https://pair.withgoogle.com/guidebook/', 'reference']
    ],
    questions: [
      ['What is the exception queue and why does it matter?', 'The cases a partially-failing feature hands to humans. If nobody is assigned to it, it silently becomes support\'s problem without notice or headcount.'],
      ['Why do AI features carry unusual operational load?', 'They need ongoing error review, golden-set maintenance, drift watching and upgrade decisions. That is a recurring role; without it the feature quietly degrades until people stop using it.'],
      ['What is the cheapest way to find operational impact?', 'Have the people who will run it read the design before it is built. Twenty minutes from a support lead routinely prevents months of avoidable ticket volume.']
    ]
  },

  {
    id: 'compliance-risk-impact',
    title: 'Compliance & Risk Impact',
    domain: 'systems-thinking', tier: 2, priority: 'medium',
    summary: 'The consequences that are not measured in engineering time.',
    what: `Compliance and risk impact is the set of legal, regulatory, security and reputational consequences a change carries — obligations that attach to data flows and decisions rather than to code.`,
    why: `These are the consequences with the worst asymmetry. Most product mistakes cost a sprint; a data-protection mistake can cost a regulatory finding, a contract, or the ability to operate in a market.`,
    analogy: `Building regulations. They constrain the design, they are non-negotiable, and discovering them after the walls are up is enormously more expensive than reading them first.`,
    technical: `The questions that surface most of it:
- **What data does this touch?** Personal data, financial data, health data and children's data each carry distinct obligations.
- **Where does it go?** Cross-border transfer is a regulated act. Sending data to a model provider is a transfer.
- **How long is it kept?** Retention has to be justified and bounded.
- **Who can see it?** Access controls, and whether the answer changes for support staff and vendors.
- **Is a decision being made about a person?** Automated decision-making with significant effects has specific requirements under the GDPR and is a high-risk category under the EU AI Act.
- **Can it be explained and contested?** Increasingly a legal requirement, not a nicety.

**For AI features the risk surface is wider than the data flow.** Beyond privacy, there is output risk (harmful, defamatory or discriminatory content), IP risk (training data provenance and output ownership), and accuracy risk (professional advice given wrongly).

**Risk is reduced by design, not by disclaimers.** Not collecting the data, not sending it to a third party, keeping a human in the loop for consequential decisions, and logging enough to reconstruct a decision are all structural. A terms-of-service paragraph is not a control.

Bring legal and security in at design, not at launch review. The cost of a constraint discovered at design is a design change; at launch it is a rebuild.`,
    diagram: `
   THE QUESTIONS THAT SURFACE MOST OF IT

     WHAT DATA?      personal · financial · health · children's
                     each carries distinct obligations

     WHERE DOES IT
     GO?             ⚠ cross-border transfer is a REGULATED ACT
                     sending data to a model provider IS a transfer

     HOW LONG KEPT?  retention must be justified and bounded

     WHO CAN SEE IT? incl. support staff and vendors

     A DECISION
     ABOUT A PERSON? automated decision-making with significant
                     effects → specific GDPR requirements,
                     high-risk under the EU AI Act

     EXPLAINABLE
     AND CONTESTABLE? increasingly a legal requirement

   ⚠ FOR AI, THE RISK SURFACE IS WIDER THAN THE DATA FLOW

     privacy risk    what you collect and send
     output risk     harmful · defamatory · discriminatory
     IP risk         training provenance · output ownership
     accuracy risk   professional advice given wrongly

   ⚠ RISK IS REDUCED BY DESIGN, NOT BY DISCLAIMERS

     structural controls          not a control
     ─────────────────────        ────────────
     do not collect it            a ToS paragraph
     do not send it               a warning label
     human in the loop            "users should verify"
     log enough to reconstruct

   TIMING IS THE WHOLE COST

     constraint found at DESIGN  →  a design change
     constraint found at LAUNCH  →  a rebuild`,
    example: {
      language: 'text',
      caption: 'A risk review, and the design changes it forced',
      code: `FEATURE  extract customer commitments from support threads

DATA REVIEW
  Q  What data is in a support thread?
  A  Customer name, email, phone, order history, sometimes
     payment references, occasionally health information
     (delivery of medical supplies).
  ⚠ The feature was scoped as "summarise threads". The DATA
    is the regulated part, and nobody had listed it.

  → DESIGN CHANGE 1: PII redaction before the model call.
    Names, emails, phones, payment references replaced with
    stable placeholders, restored in the UI after the response.
    The model never sees them, so the transfer question
    shrinks dramatically.

CROSS-BORDER
  Q  Where does the model provider process this?
  A  Outside India, for our current configuration.
  ⚠ Under the DPDPA and our enterprise contracts, that is a
    transfer requiring a basis and disclosure.
  → DESIGN CHANGE 2: regional processing where available;
    contractual zero-retention configured and evidenced;
    the transfer documented in the processing record.

RETENTION
  Q  How long do we keep traces?
  A  "Forever, for debugging."
  → 30 days, PII-redacted, with a documented justification.
    Golden-set cases derived from real threads are
    de-identified and separately consented.

AUTOMATED DECISIONS
  Q  Does this decide anything about a person?
  A  It EXTRACTS commitments; a human acts on them.
  → Not automated decision-making — but only because a human
    remains in the loop. ⚠ Recorded explicitly, because the
    obvious next feature ("auto-honour extracted commitments")
    would cross that line and someone will propose it.

OUTPUT RISK
  Q  What if it extracts a commitment that was never made?
  A  An agent honours it, or refuses one that WAS made.
  → every extracted commitment links to the exact source
    message; agents confirm before acting; both actions logged.

COST
  Review at design      2 hours, 4 design changes, all cheap
  The same review at launch would have required rebuilding
  the data path — the redaction layer sits at the centre of
  the architecture, not at its edge.`
    },
    prereq: ['operational-impact'], next: [],
    related: ['privacy-pii', 'eu-ai-act', 'india-dpdpa', 'ai-risk', 'human-in-the-loop'],
    tools: [],
    useCases: [
      'Surfacing regulatory constraints while they are still cheap to satisfy.',
      'Deciding what data never needs to leave your network.',
      'Recording why a feature is not automated decision-making.'
    ],
    avoid: [
      'Legal review at launch rather than at design.',
      'Disclaimers used in place of structural controls.'
    ],
    mistakes: [
      'Scoping a feature by its function and never listing the data it touches.',
      'Treating a model API call as internal processing rather than a transfer.',
      'Keeping traces indefinitely for debugging convenience.',
      'Relying on terms of service instead of not collecting the data.'
    ],
    keyTerms: [
      ['personal data', 'Information relating to an identifiable person.'],
      ['cross-border transfer', 'Moving data outside a jurisdiction; regulated.'],
      ['retention', 'How long data is kept, and the justification for it.'],
      ['automated decision-making', 'A decision about a person made without meaningful human involvement.'],
      ['redaction', 'Removing identifiers before processing.'],
      ['structural control', 'A design property that reduces risk, unlike a disclaimer.'],
      ['processing record', 'The documented account of what is processed and why.']
    ],
    resources: [
      ['EU AI Act — overview', 'https://artificialintelligenceact.eu/', 'reference'],
      ['India DPDP Act 2023', 'https://www.meity.gov.in/data-protection-framework', 'reference'],
      ['NIST AI Risk Management Framework', 'https://www.nist.gov/itl/ai-risk-management-framework', 'reference'],
      ['GDPR — automated decision-making', 'https://gdpr-info.eu/art-22-gdpr/', 'reference']
    ],
    questions: [
      ['Why does timing dominate the cost of compliance constraints?', 'A constraint found at design is a design change; the same constraint at launch is a rebuild, because controls like redaction sit at the centre of the architecture rather than at its edge.'],
      ['Is calling a model API a data transfer?', 'Yes. Sending data to a model provider is processing by a third party, and where they process it is a cross-border transfer question with a legal basis and disclosure requirement.'],
      ['Why are disclaimers not risk controls?', 'They do not change what happens. Not collecting the data, not sending it, keeping a human in the loop and logging enough to reconstruct a decision are structural; a terms-of-service paragraph is not.']
    ]
  }
];
