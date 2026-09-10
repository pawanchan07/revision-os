/**
 * DOMAIN T — AI PRODUCT MANAGEMENT, part 1 of 3: choosing what to build
 * (BUILD.md section 23)
 */
export const topics = [
  {
    id: 'ai-use-case-selection',
    title: 'AI Use-Case Selection',
    domain: 'ai-pm', tier: 1, priority: 'high',
    summary: 'Which problems AI is actually good at — and the far larger set it is not.',
    what: `Use-case selection is deciding where AI belongs in a product. The decision turns on the shape of the problem: how tolerant it is of error, whether output can be verified, and whether the task is genuinely one a language model does well.`,
    why: `Most failed AI features did not fail on execution. They failed because the problem was a poor fit and no amount of engineering was going to change that.`,
    analogy: `Choosing where to use a power tool. Extremely effective on the right material; on the wrong material it is fast, confident and destructive.`,
    technical: `**Good fit** has a recognisable shape:
- The task is **language-shaped** — summarising, extracting, classifying, drafting, translating between formats.
- **Errors are recoverable** and preferably visible.
- **Output can be verified** by the person receiving it, or by the system.
- There is **variety** the rules-based alternative cannot cover.
- The **status quo is bad** — a slow manual process, or nothing at all.

**Poor fit** is equally recognisable:
- **Exact answers required** — arithmetic, totals, compliance determinations. A model that is right 97% of the time on a calculation is not useful; a calculator is right 100% of the time.
- **A deterministic rule already works.** If the logic fits in an if-statement, use the if-statement — it is cheaper, faster, testable and explainable.
- **Errors are silent and consequential.** The combination is what makes a use case dangerous, not either alone.
- **Nobody can tell whether the output is right.** Unverifiable output in a high-stakes context is the single worst shape.

**The reframe that saves most projects:** ask not "can AI do this task?" but "which part of this workflow is language-shaped, and which part should stay deterministic?" Almost every good AI feature is a hybrid — the model handles the messy language part and hands off to code for anything that must be exact.`,
    diagram: `
   GOOD FIT — the recognisable shape

     ✓ LANGUAGE-SHAPED    summarise · extract · classify
                          draft · translate between formats
     ✓ RECOVERABLE errors  and preferably VISIBLE
     ✓ VERIFIABLE output   the recipient can check it
     ✓ VARIETY             rules cannot cover the space
     ✓ BAD STATUS QUO      slow manual process, or nothing

   POOR FIT — equally recognisable

     ✗ EXACT ANSWERS       arithmetic · totals · determinations
                           97% correct on a calculation is
                           not useful. A calculator is 100%.
     ✗ A RULE ALREADY WORKS
                           if it fits in an if-statement, use the
                           if-statement — cheaper, faster,
                           testable, explainable
     ✗ SILENT + CONSEQUENTIAL errors
                           ⚠ the COMBINATION is what makes a
                             use case dangerous, not either alone
     ✗ UNVERIFIABLE output in a high-stakes context
                           ← the single worst shape

   ⚠ THE REFRAME THAT SAVES MOST PROJECTS

     ✗ "can AI do this task?"
     ✓ "which part of this workflow is LANGUAGE-SHAPED,
        and which part must stay DETERMINISTIC?"

     almost every good AI feature is a HYBRID

       messy language ──► model
       must be exact  ──► code`,
    example: {
      language: 'text',
      caption: 'Four requests, sorted by shape',
      code: `REQUEST 1  "Use AI to calculate refund amounts."
  Language-shaped?  No — it is arithmetic on policy rules
  Verifiable?       Yes, but only by redoing the calculation
  Errors?           Silent and financial
  → ✗ REJECT. Refund calculation is a rule engine.
    ✓ REFRAME: use AI to EXTRACT the facts from the thread
      (order date, item condition, reason), then let
      deterministic code apply the policy.
      The model does the messy part. Code does the exact part.
      This is the shape almost every good feature has.

REQUEST 2  "Summarise support threads for the agent."
  Language-shaped?  Yes, canonically
  Verifiable?       Yes — the thread is right there
  Errors?           Visible and recoverable
  → ✓ GOOD FIT

REQUEST 3  "Route tickets to the right team."
  Language-shaped?  Partly
  Rules already work? ⚠ 80% of routing is keyword rules that
                       already run and are 96% accurate
  → ✗ mostly REJECT.
    ✓ REFRAME: AI handles only what the rules DECLINE to route
      (the 20% that falls through). Smaller scope, clearer
      value, and the 96% accurate path stays deterministic.

REQUEST 4  "Decide which loan applications to approve."
  Language-shaped?  No
  Verifiable?       Not by the applicant, not easily by staff
  Errors?           Silent, consequential, and regulated
  Automated decision about a person with legal effect?  Yes
  → ✗ REJECT firmly. High-risk under the EU AI Act,
    unverifiable, and the worst possible error profile.
    ✓ The defensible version: AI summarises the file for a
      human decision-maker and NEVER recommends an outcome.

⚠ THE PATTERN ACROSS ALL FOUR
  Three of four were rejected as stated and two became good
  features after reframing. The value of the exercise is not
  the rejection — it is the reframe that finds the
  language-shaped part of a workflow that is not.`
    },
    prereq: [], next: ['ai-feasibility'],
    related: ['product-discovery', 'ai-risk', 'human-in-the-loop', 'problem-statements', 'ai-build-vs-buy'],
    tools: [],
    useCases: [
      'Deciding whether a requested AI feature is a good fit.',
      'Reframing a poor-fit request into a hybrid that works.',
      'Declining an AI use case with a reason people accept.'
    ],
    avoid: [
      'AI where a deterministic rule already works.',
      'Unverifiable output in high-stakes contexts.'
    ],
    mistakes: [
      'Using a model for anything that must be exact.',
      'Replacing a working rule engine rather than handling what it declines.',
      'Missing that silent plus consequential is what makes errors dangerous.',
      'Asking whether AI can do the task instead of which part of the workflow is language-shaped.'
    ],
    keyTerms: [
      ['language-shaped task', 'Summarise, extract, classify, draft, translate.'],
      ['verifiability', 'Whether the recipient can tell the output is right.'],
      ['recoverable error', 'A mistake that can be undone cheaply.'],
      ['silent failure', 'A wrong output that raises no signal.'],
      ['hybrid design', 'Model for the messy part, code for the exact part.'],
      ['status quo cost', 'What people do today, and how bad it is.']
    ],
    resources: [
      ['Google — People + AI Guidebook', 'https://pair.withgoogle.com/guidebook/', 'reference'],
      ['Anthropic — building effective agents', 'https://www.anthropic.com/engineering/building-effective-agents', 'article'],
      ['EU AI Act — risk categories', 'https://artificialintelligenceact.eu/', 'reference']
    ],
    questions: [
      ['What shape of problem is a good fit for AI?', 'Language-shaped tasks — summarising, extracting, classifying, drafting — where errors are recoverable and visible, output can be verified by the recipient, and the variety defeats a rules-based alternative.'],
      ['Why is "exact answers required" a rejection criterion?', 'A model that is right 97% of the time on a calculation is not useful when a calculator is right 100% of the time. Anything that must be exact belongs in deterministic code.'],
      ['What is the reframe that rescues most poor-fit requests?', 'Asking which part of the workflow is language-shaped rather than whether AI can do the whole task. The model extracts the messy facts; deterministic code applies the exact rules.']
    ],
    interview: {
      s30: 'I select AI use cases on shape rather than ambition: is the task language-shaped, are errors recoverable and visible, and can the recipient verify the output. Where any of those fails, I look for the hybrid.',
      s90: 'The reframe I use most is to stop asking whether AI can do the task and start asking which part of the workflow is language-shaped and which part must stay deterministic. A team asked me for AI-calculated refund amounts. Calculation is arithmetic on policy rules — a model that is right 97% of the time is worse than a rule engine that is right every time, and the errors are silent and financial. But the part that was genuinely hard was extracting the facts from a messy support thread: order date, item condition, stated reason. So the model extracts, and deterministic code applies the policy. That version shipped and works. The one they asked for would have failed, and it would have failed on the problem shape rather than on execution — which is true of most AI features that do not work.'
    }
  },

  {
    id: 'ai-feasibility',
    title: 'AI Feasibility',
    domain: 'ai-pm', tier: 1, priority: 'high',
    summary: 'Finding out whether the model can actually do it, before committing a quarter to it.',
    what: `Feasibility assessment establishes whether a model can perform a task at the quality your product requires, using your real data, measured against a real bar.`,
    why: `It is the risk that distinguishes AI product work from conventional product work. In normal software, a specification you can write is one you can build. Here, the answer might simply be no, and finding that out in week one costs three days rather than a quarter.`,
    analogy: `Drilling a test core before committing to a mine. Cheap, unglamorous, and the only thing standing between a plan and an expensive hole.`,
    technical: `The method — a **spike**, timeboxed to two to five days:

1. **Collect twenty to fifty real examples**, not invented ones. Include the hard cases; real traffic is not uniformly easy.
2. **Define the bar first.** What error rate would make this shippable? Agreeing that after seeing results is how projects talk themselves into bad numbers.
3. **Build the crudest possible pipeline.** No optimisation, no framework, no infrastructure. You are measuring the ceiling, not the product.
4. **Score by hand** against ground truth, and split by difficulty.
5. **Decide**: proceed, improve a specific thing and re-measure, or stop.

**The result is a number and a distribution, not an impression.** "It seemed pretty good" is the failure mode. Twenty examples scored by hand takes an afternoon and produces something arguable.

**Read the failures, not just the score.** The most valuable output of a spike is usually the *kind* of error. Twenty percent failure caused by bad PDF parsing is a fixable engineering problem; twenty percent failure caused by the model misunderstanding the domain is not, at least not cheaply.

**A negative result is a successful spike.** Three days spent proving something is not currently feasible is one of the highest-return activities available to an AI product team, and it is systematically undervalued because it produces no demo.`,
    diagram: `
   THE SPIKE — timeboxed, 2-5 days

     1  COLLECT     20-50 REAL examples, including hard ones
                    ⚠ invented examples are uniformly easy

     2  DEFINE THE BAR FIRST
                    what error rate makes this shippable?
                    ⚠ agreeing this AFTER seeing results is how
                      teams talk themselves into a bad number

     3  BUILD THE CRUDEST PIPELINE
                    no optimisation, no framework, no infra
                    you are measuring the CEILING, not the product

     4  SCORE BY HAND, split by difficulty

     5  DECIDE       proceed · improve X and re-measure · stop

   ⚠ READ THE FAILURES, NOT JUST THE SCORE

     20% failure from bad PDF parsing
       → an engineering problem. Fixable. Proceed.

     20% failure from the model misunderstanding the domain
       → not fixable cheaply. Different decision entirely.

     the SCORE is the same. The DECISION is opposite.

   ⚠ A NEGATIVE RESULT IS A SUCCESSFUL SPIKE

     3 days proving something is not feasible
     is one of the highest-return activities available

     it is undervalued because it produces no demo`,
    example: {
      language: 'python',
      caption: 'A feasibility spike that changed the plan',
      code: `# ── STEP 2, BEFORE ANY CODE: the bar, agreed in writing ────
BAR = {
    "confidently_wrong_max": 0.05,   # answered + cited + wrong
    "answered_min":          0.60,   # below this it is not useful
    "note": "agreed with support lead 3 Mar, before results seen",
}

# ── STEP 3: the crudest thing that could work ──────────────
def crude_pipeline(question, corpus):
    chunks = corpus.naive_split(800)          # no smart chunking
    hits = embed_and_search(question, chunks, k=5)   # no reranking
    return llm(f"Answer using only:\\n{hits}\\n\\nQ: {question}")

# ── STEP 4: score by hand, SPLIT BY DIFFICULTY ─────────────
results = score_by_hand(CASES, crude_pipeline)     # 40 real cases

#            n    correct  wrong  abstained
# common    22      19       2         1
# edge      12       4       6         2       ⚠
# absent     6       0       1         5       (correct = abstain)
#
# overall answered   0.83
# confidently wrong  0.225        ← 4.5x the bar

# ── STEP 5: READ THE FAILURES ──────────────────────────────
for f in failures:
    print(f["id"], "|", f["cause"])

# edge-03  | policy text was in a TABLE; parser dropped it
# edge-05  | policy text was in a TABLE; parser dropped it
# edge-07  | policy text was in a TABLE; parser dropped it
# edge-09  | regional variant; corpus only has national policy
# edge-11  | regional variant; corpus only has national policy
# edge-12  | chunk split mid-clause, retrieved half a rule
# absent-2 | answered from an adjacent, unrelated clause

# ⚠ SIX OF NINE FAILURES ARE INGESTION, NOT THE MODEL.
#   Three are tables the parser dropped. Two are documents we
#   simply do not have. One is a chunking boundary.
#   The model understood the domain in every single case where
#   it was given the right text.
#
#   A score of 0.225 confidently-wrong reads as "not feasible".
#   The failure ANALYSIS reads as "fix the parser, add the
#   regional docs, and re-measure" — which is a two-week
#   engineering task, not a research problem.

# DECISION  do not proceed to build. Re-spike after:
#             1. table-aware parsing
#             2. regional policy documents ingested
#             3. clause-boundary chunking
#           Re-measure on the SAME 40 cases.
#
# RE-SPIKE, 12 days later:  confidently wrong 0.031, answered 0.71
#                           → clears the bar. Now build.

# ⚠ THE SPIKE COST 3 DAYS AND CHANGED THE FIRST TWO SPRINTS
#   FROM "BUILD THE FEATURE" TO "FIX INGESTION". The feature
#   built on the original ingestion would have been unusable
#   and the cause would have been invisible from the outside.`
    },
    prereq: ['ai-use-case-selection'], next: ['ai-model-selection'],
    related: ['product-discovery', 'golden-sets', 'prioritization', 'ingestion-parsing', 'ai-experimentation'],
    tools: ['anthropic', 'openai', 'ollama'],
    useCases: [
      'Deciding whether to commit engineering time to an AI feature.',
      'Distinguishing an engineering problem from a research problem.',
      'Killing a bad idea in three days rather than a quarter.'
    ],
    avoid: [
      'Spikes on invented examples.',
      'Defining the quality bar after seeing results.'
    ],
    mistakes: [
      'Testing on easy or invented examples, which hides the real failure distribution.',
      'Reporting an impression instead of a number.',
      'Reading only the score and not the kind of failure.',
      'Optimising during a spike, which measures effort rather than the ceiling.'
    ],
    keyTerms: [
      ['spike', 'A timeboxed investigation whose output is knowledge.'],
      ['quality bar', 'The error rate that would make the feature shippable.'],
      ['ceiling', 'What is achievable at all, measured before optimisation.'],
      ['failure analysis', 'Categorising errors by cause, not just counting them.'],
      ['ground truth', 'The known-correct answer for a test case.'],
      ['negative result', 'Proof that something is not feasible. A success.']
    ],
    resources: [
      ['Anthropic — building effective agents', 'https://www.anthropic.com/engineering/building-effective-agents', 'article'],
      ['Google — People + AI Guidebook', 'https://pair.withgoogle.com/guidebook/', 'reference'],
      ['Hugging Face — evaluation guidebook', 'https://github.com/huggingface/evaluation-guidebook', 'repo']
    ],
    questions: [
      ['Why does feasibility come first for AI features?', 'In conventional software a specification you can write is one you can build. With AI the answer may be no, and a three-day spike finds that out instead of a quarter of engineering.'],
      ['Why read the failures rather than the score?', 'The same score means opposite things. Twenty percent failure from bad PDF parsing is a fixable engineering problem; twenty percent from the model misunderstanding the domain is not.'],
      ['Why must the quality bar be agreed before the spike runs?', 'Defining it afterwards lets the team rationalise whatever number came back. Agreeing it in writing beforehand is what makes the result a decision rather than a negotiation.']
    ]
  },

  {
    id: 'ai-model-selection',
    title: 'AI Model Selection',
    domain: 'ai-pm', tier: 1, priority: 'high',
    summary: 'Choosing on measured performance for your task, not on benchmarks or reputation.',
    what: `Model selection is choosing which model serves a given feature, on the basis of measured quality against your own evaluation set, alongside cost, latency, data handling and operational constraints.`,
    why: `It is a decision teams make from leaderboards and vibes, and then live with for a year. Public benchmarks describe average performance on tasks that are not yours, and the ranking on your task is routinely different.`,
    analogy: `Hiring on a general aptitude test rather than a work sample. The test correlates with something; the work sample tells you whether they can do the job.`,
    technical: `The criteria, in order of decisiveness:
1. **Measured quality on your golden set**, broken down by task category. This dominates everything else.
2. **Cost per interaction at your volume**, including retries and the input tokens your context assembly actually sends.
3. **Latency at your percentiles**, particularly time to first token if you stream.
4. **Data handling** — where processing happens, retention policy, contractual terms. Frequently the constraint that eliminates options before quality is even considered.
5. **Operational fit** — rate limits, availability, versioning behaviour, deprecation notice.

**Benchmarks are a shortlist tool, not a decision tool.** Use them to pick three candidates; use your own evaluation to choose between them.

**Test the smallest plausible model first.** Teams start at the top of the range and never check downward. On extraction and classification a small model frequently matches a large one at a fraction of the cost and latency — and the only way to know is to measure by task category, because the gap is narrow on some tasks and wide on others.

**Design for substitution.** Keep model choice behind an interface, keep prompts versioned, and keep the evaluation set current. A team that can swap models in an afternoon can take advantage of every release; a team that cannot is locked to whatever it launched with.`,
    diagram: `
   CRITERIA, MOST DECISIVE FIRST

     1  MEASURED QUALITY on YOUR golden set
        broken down BY TASK CATEGORY
        ← dominates everything else

     2  COST at your volume
        including retries and the input tokens your
        context assembly actually sends

     3  LATENCY at your percentiles
        time to first token if you stream

     4  DATA HANDLING
        where processed · retention · contract terms
        ⚠ frequently eliminates options BEFORE quality
          is even considered

     5  OPERATIONAL FIT
        rate limits · availability · deprecation notice

   ⚠ BENCHMARKS ARE A SHORTLIST TOOL, NOT A DECISION TOOL

     use them to pick THREE candidates
     use your own evaluation to choose between them

   ⚠ TEST THE SMALLEST PLAUSIBLE MODEL FIRST

     teams start at the top of the range and never look down

     extraction / classification   small often matches large
     multi-step reasoning          the gap is wide

     measure BY CATEGORY — the average hides both facts

   DESIGN FOR SUBSTITUTION

     model behind an interface
     prompts versioned
     evaluation set current

     swap in an afternoon → benefit from every release
     cannot swap          → locked to launch-day quality`,
    example: {
      language: 'python',
      caption: 'Selection by measurement, including the constraint that came first',
      code: `# ── STEP 0: THE CONSTRAINT THAT ELIMINATES CANDIDATES ──────
# Enterprise contract requires: no training on our data,
# configurable retention, and a documented processing region.
# This removed two of five candidates before any quality
# measurement — and it is the step teams do last.

CANDIDATES = ["large-hosted", "mid-hosted", "small-hosted", "local-8b"]

def select(golden_set, candidates, volume_per_month):
    rows = []
    for name in candidates:
        by_cat, lat, cost = {}, [], []
        for case in golden_set:
            out = run(case, name)
            by_cat.setdefault(case["category"], []).append(score(case, out))
            lat.append(out["latency_ms"]); cost.append(out["cost"])
        rows.append({
            "model": name,
            **{c: round(sum(s)/len(s), 2) for c, s in by_cat.items()},
            "p95_ms": sorted(lat)[int(len(lat)*.95)],
            "monthly": round(sum(cost)/len(cost) * volume_per_month),
        })
    return rows

for r in select(GOLDEN, CANDIDATES, 240_000):
    print(r)

# {'model':'large-hosted','extract':0.94,'classify':0.95,'reason':0.89,
#  'p95_ms':3210,'monthly':744000}
# {'model':'mid-hosted',  'extract':0.93,'classify':0.94,'reason':0.74,
#  'p95_ms':1840,'monthly':268800}
# {'model':'small-hosted','extract':0.91,'classify':0.94,'reason':0.52,
#  'p95_ms': 620,'monthly': 74400}
# {'model':'local-8b',    'extract':0.88,'classify':0.92,'reason':0.44,
#  'p95_ms': 890,'monthly': 31000}   # + fixed GPU cost

# ⚠ READ BY CATEGORY, NOT BY AVERAGE
#   extraction:      0.88 → 0.94 across a 24x cost range
#   classification:  0.92 → 0.95 across the same range
#   reasoning:       0.44 → 0.89   ← the only column that
#                                    justifies the large model
#
#   Our feature is 80% extraction and classification.
#   The average would have said "large is best". The breakdown
#   says small-hosted is within 3 points on everything we
#   actually do, at a tenth of the cost and a fifth of the latency.

DECISION = {
    "extraction + classification": "small-hosted",
    "the 12% reasoning path":       "mid-hosted, via routing",
    "blended monthly":              "~₹1.1L vs ₹7.4L large-only",
    "revisit":                      "each release, on the same set",
}

# ── DESIGN FOR SUBSTITUTION ────────────────────────────────
class Generator:                       # one interface
    def __init__(self, model, prompt_version):
        self.model, self.prompt = model, PROMPTS[prompt_version]
    def __call__(self, **kw):
        return call(self.model, self.prompt.render(**kw))

# Swapping a model is a config change plus an evaluation run.
# That is the property that lets you benefit from the next
# release instead of being locked to this one.`
    },
    prereq: ['ai-feasibility'], next: ['ai-build-vs-buy'],
    related: ['size-quality-tradeoff', 'golden-sets', 'ai-cost', 'ai-latency', 'hosted-vs-self-hosted'],
    tools: ['anthropic', 'openai', 'google-ai', 'ollama', 'vllm'],
    useCases: [
      'Choosing a model with evidence rather than reputation.',
      'Finding that a much cheaper model is adequate for most traffic.',
      'Keeping the ability to upgrade when a better model ships.'
    ],
    avoid: [
      'Selecting from public leaderboards alone.',
      'Coupling application code directly to one provider’s SDK shape.'
    ],
    mistakes: [
      'Choosing on benchmark averages rather than measured performance by task category.',
      'Never testing a smaller model, and overpaying by an order of magnitude.',
      'Leaving data-handling constraints until after quality selection, then redoing the work.',
      'Building without a substitution seam, and being locked to launch-day quality.'
    ],
    keyTerms: [
      ['golden set', 'Your own evaluation cases, the basis of the decision.'],
      ['task category breakdown', 'Scoring per task type rather than overall.'],
      ['routing', 'Sending easy traffic to a small model, escalating the rest.'],
      ['substitution seam', 'An interface that makes swapping models cheap.'],
      ['data handling terms', 'Retention, training use, processing region.'],
      ['deprecation notice', 'How much warning a provider gives before removal.']
    ],
    resources: [
      ['Anthropic — choosing a model', 'https://docs.anthropic.com/en/docs/about-claude/models/choosing-a-model', 'docs'],
      ['Anthropic — pricing', 'https://docs.anthropic.com/en/docs/about-claude/pricing', 'docs'],
      ['LMSYS Chatbot Arena', 'https://lmarena.ai/', 'interactive'],
      ['Hugging Face — Open LLM Leaderboard', 'https://huggingface.co/spaces/open-llm-leaderboard/open_llm_leaderboard', 'interactive']
    ],
    questions: [
      ['Why are public benchmarks a shortlist tool rather than a decision tool?', 'They measure average performance on tasks that are not yours. Use them to pick three candidates, then decide with your own evaluation set broken down by task category.'],
      ['What do teams most often get wrong in model selection?', 'Starting at the top of the range and never testing downward. On extraction and classification a small model frequently matches a large one at a tenth of the cost.'],
      ['What is a substitution seam and why does it matter?', 'An interface that keeps model choice, prompt version and evaluation separable. A team that can swap models in an afternoon benefits from every release; one that cannot is locked to launch-day quality.']
    ]
  },

  {
    id: 'ai-build-vs-buy',
    title: 'AI Build vs Buy',
    domain: 'ai-pm', tier: 2, priority: 'high',
    summary: 'What to buy, what to build, and the one layer you should never outsource.',
    what: `The build-versus-buy decision for AI systems: which layers to take as a service, which to run yourself, and which to treat as core intellectual property.`,
    why: `The layers are unusually separable here, so the answer is rarely all-or-nothing. Teams that decide at the level of "build an AI product or buy one" get it wrong; teams that decide per layer usually get it right.`,
    analogy: `A restaurant. You buy the ovens and the electricity, you might buy the bread, and you never outsource the recipe.`,
    technical: `Layer by layer:

**Buy the model.** Training a foundation model is not a realistic option, and for the overwhelming majority of products, fine-tuning is not either. Model capability is available to your competitors on the same terms, which is precisely why it is not where advantage lives.

**Buy commodity infrastructure** — vector storage, tracing backends, serving. These are solved problems with good options.

**Build your data pipeline.** Your corpus, its parsing, its metadata and its freshness are specific to you and largely determine quality. This is where the differentiated work is, and it is unglamorous enough that it gets skipped.

**Build your evaluation.** This is the one layer never to outsource. Your golden set encodes what quality means for your product; it is the asset that lets you change models, upgrade safely and improve faster than a competitor. Tooling can be bought; the cases and the judgement cannot.

**Buy the application only when the workflow is generic** — a standard chatbot, a standard summariser. The moment your workflow is specific, the integration cost of a generic product exceeds building the thin layer yourself.

**The failure mode with buying an end-to-end AI product** is that you cannot evaluate it. If you cannot run your own golden set against a vendor's system, you cannot tell whether it degraded after their last update, and you have outsourced the one thing you needed to keep.`,
    diagram: `
   DECIDE PER LAYER, NOT ALL-OR-NOTHING

     MODEL              BUY
       training is not realistic · fine-tuning rarely is
       ⚠ capability is available to competitors on the same
         terms — which is why it is not where advantage lives

     INFRASTRUCTURE     BUY
       vector storage · tracing · serving
       solved problems, good options

     DATA PIPELINE      BUILD
       your corpus, parsing, metadata, freshness
       ← specific to you, and largely determines quality
       ⚠ unglamorous enough that it gets skipped

     EVALUATION         BUILD — never outsource this
       your golden set encodes what quality MEANS here
       it is what lets you change models, upgrade safely,
       and improve faster than a competitor
       tooling can be bought · the cases and judgement cannot

     APPLICATION        BUY only if the workflow is GENERIC
       generic chatbot / summariser  → buy
       specific workflow             → the integration cost of
                                       a generic product exceeds
                                       building the thin layer

   ⚠ THE FAILURE MODE OF BUYING END-TO-END

     you cannot run YOUR golden set against THEIR system

     → you cannot tell whether it degraded after their update
     → you have outsourced the one thing you needed to keep`,
    example: {
      language: 'text',
      caption: 'A layer-by-layer decision, and the vendor question that decided it',
      code: `DECISION  policy assistant — build, buy, or vendor product?

VENDOR OPTION  "AI support assistant", ₹18L/year, 6-week rollout
BUILD OPTION   ~10 engineering weeks + ~₹1.1L/month running

LAYER BY LAYER
  model            BUY   — obviously. Nobody is training one.
  vector storage   BUY   — pgvector, already in our Postgres
  tracing          BUY   — an existing tool, no reason to build
  data pipeline    BUILD — ⚠ our policy corpus is 400 documents
                           in four formats with regional variants
                           and a table-heavy layout. No vendor
                           parses this well; we measured.
  evaluation       BUILD — always
  application      ?     — this is the actual question

THE QUESTION THAT DECIDED IT
  "Can we run our 220-case golden set against your system and
   see per-case results?"

  Vendor: "We provide accuracy metrics in our dashboard."
  → No. That is THEIR metric on THEIR definition of correct.

  ⚠ CONSEQUENCE: after any vendor update we would have no way
    to know whether our edge cases regressed. Our whole quality
    strategy — abstain rather than guess, cite every clause —
    is not something their dashboard measures, because it is
    not what their product is for.

WHAT WE ACTUALLY DID
  BUY   model, vector storage, tracing, PDF parsing service
  BUILD ingestion orchestration, retrieval, prompt layer,
        abstention logic, evaluation harness, golden set

  The "built" part is about 900 lines. It is not large.
  It is the part that is ours.

⚠ THE HONEST COUNTERFACTUAL
  If our workflow had been generic — answer questions from a
  handbook, no regional variants, no citation requirement,
  no abstention policy — the vendor would have been the right
  call and we would have saved ten weeks.
  The specificity is what made building correct, not a
  preference for building.`
    },
    prereq: ['ai-model-selection'], next: ['ai-product-roadmap'],
    related: ['choosing-tools', 'product-strategy', 'golden-sets', 'hosted-vs-self-hosted', 'ai-cost'],
    tools: ['anthropic', 'ollama', 'langsmith', 'braintrust'],
    useCases: [
      'Deciding between a vendor product and an internal build.',
      'Identifying which layers are genuinely differentiating.',
      'Evaluating a vendor on whether you can measure them.'
    ],
    avoid: [
      'All-or-nothing build-versus-buy decisions.',
      'Vendors you cannot run your own evaluation against.'
    ],
    mistakes: [
      'Deciding at the product level rather than per layer.',
      'Outsourcing evaluation, which removes the ability to detect regression.',
      'Skipping the data pipeline because it is unglamorous, when it largely determines quality.',
      'Buying a generic application for a specific workflow and paying the integration cost anyway.'
    ],
    keyTerms: [
      ['layer decision', 'Choosing build or buy separately per layer.'],
      ['commodity layer', 'A solved problem with good off-the-shelf options.'],
      ['differentiating layer', 'Where your specific advantage lives.'],
      ['evaluation ownership', 'Keeping the golden set and judgement in-house.'],
      ['vendor lock-in', 'Inability to substitute or to measure independently.'],
      ['integration cost', 'The work of fitting a generic product to a specific workflow.']
    ],
    resources: [
      ['Anthropic — building effective agents', 'https://www.anthropic.com/engineering/building-effective-agents', 'article'],
      ['Choose Boring Technology', 'https://boringtechnology.club/', 'reference'],
      ['Hugging Face — evaluation guidebook', 'https://github.com/huggingface/evaluation-guidebook', 'repo']
    ],
    questions: [
      ['Which layer should never be outsourced?', 'Evaluation. The golden set encodes what quality means for your product and is what lets you change models and detect regression. Tooling can be bought; the cases and judgement cannot.'],
      ['Why is the model layer a buy decision?', 'Training is not realistic and capability is available to competitors on identical terms, so it cannot be a source of advantage. The differentiated work is in the data pipeline and evaluation.'],
      ['What question should you ask an AI vendor?', 'Whether you can run your own golden set against their system and see per-case results. If not, you cannot detect regression after their updates.']
    ]
  },

  {
    id: 'ai-product-roadmap',
    title: 'AI Product Roadmap',
    domain: 'ai-pm', tier: 2, priority: 'medium',
    summary: 'Sequencing work when the central uncertainty is whether it will work at all.',
    what: `An AI product roadmap sequences capability work, quality infrastructure and rollout, in an order that resolves uncertainty before committing to it.`,
    why: `A conventional roadmap assumes the main risk is time. Here the main risk is whether the thing works, so the sequencing that makes sense is different — and the quality infrastructure that looks like overhead is what determines whether the roadmap survives.`,
    analogy: `Building the measuring instruments before the experiment. It feels like a detour until you realise every subsequent decision depends on being able to measure.`,
    technical: `The sequencing that works:

**Phase 0 — feasibility.** A spike, before anything is committed. The roadmap item is the spike, not the feature.

**Phase 1 — evaluation infrastructure.** The golden set, the scoring, the regression harness. This looks like overhead and it is what everything else depends on. A team without it cannot tell whether a change helped, cannot upgrade a model, and cannot detect degradation.

**Phase 2 — the narrowest useful slice.** One category, one workflow, behind a flag, with abstention and error reporting from the start. Those are not polish; a system that guesses confidently and cannot be corrected damages trust in week one.

**Phase 3 — controlled rollout** with quality monitoring in production.

**Phase 4 — expand scope** only once the first slice holds under real traffic.

**Put the uncertainty on the roadmap explicitly.** "Prove policy answers below 2% error" is an honest roadmap item; "AI policy assistant, Q3" hides the fact that the answer might be no.

**Budget for the ongoing work.** Error review, golden-set maintenance, drift watching and model upgrades are recurring, not one-off. A roadmap that allocates no capacity to them is describing a system that will degrade.`,
    diagram: `
   SEQUENCING — resolve uncertainty before committing to it

     PHASE 0  FEASIBILITY SPIKE
              ⚠ the roadmap item is the SPIKE, not the feature

     PHASE 1  EVALUATION INFRASTRUCTURE
              golden set · scoring · regression harness
              ⚠ looks like overhead
                everything else depends on it

              without it you cannot tell whether a change
              helped, cannot upgrade a model, cannot detect
              degradation

     PHASE 2  NARROWEST USEFUL SLICE
              one category · one workflow · behind a flag
              WITH abstention and error reporting from day one
              ⚠ these are not polish — a system that guesses
                confidently and cannot be corrected damages
                trust in week one

     PHASE 3  CONTROLLED ROLLOUT + production quality monitoring

     PHASE 4  EXPAND — only once phase 2 holds under real traffic

   ⚠ PUT THE UNCERTAINTY ON THE ROADMAP

     ✗ "AI policy assistant — Q3"
     ✓ "Prove policy answers below 2% error — then build"

   ⚠ BUDGET THE ONGOING WORK

     error review · golden-set maintenance
     drift watching · model upgrades

     recurring, not one-off. A roadmap allocating no capacity
     to these is describing a system that will degrade.`,
    example: {
      language: 'text',
      caption: 'Two roadmaps for the same feature',
      code: `THE ROADMAP THAT FAILS
─────────────────────────────────────────────────────────────
  Q3   AI policy assistant           ← feasibility unproven
  Q4   Expand to shipping + accounts ← depends on Q3 working
  Q1   Customer-facing version       ← depends on both

  What happens: Q3 slips because ingestion turns out to be the
  problem. There is no evaluation harness, so nobody can say
  whether the fixes helped. Q4 is committed to sales. The team
  ships something at 8% confidently-wrong because the date
  arrived. Agents abandon it in three weeks. Q1 is quietly
  dropped and the whole area is now "the thing that did not
  work".


THE ROADMAP THAT WORKS
─────────────────────────────────────────────────────────────
  PHASE 0   weeks 1        Feasibility spike, 40 real cases
                           GO/NO-GO with a number
                           ⚠ this is the roadmap item

  PHASE 1   weeks 2-4      Evaluation infrastructure
                           · 220-case golden set from resolved
                             tickets, stratified by difficulty
                           · scoring: groundedness + citation
                             correctness + abstention correctness
                           · regression harness in CI
                           Also: fix the ingestion failures the
                           spike found (tables, regional docs)

  PHASE 2   weeks 5-8      Refund policy only, behind a flag
                           WITH abstention + one-click error flag
                           Exit criteria: <1.5% confidently wrong,
                           25-35% abstention, on the golden set

  PHASE 3   weeks 9-11     5 agents → 15 → all
                           production quality dashboard live
                           weekly error review starts HERE,
                           not later

  PHASE 4   week 12+       Shipping policy — reusing everything
                           built in phases 1-3. This phase is
                           cheap precisely because of them.

  ONGOING, BUDGETED  ~3 h/week  error review + golden-set
                                maintenance + drift watch
                     ~1 week/quarter  model upgrade evaluation

⚠ THE DIFFERENCE IS PHASE 1.
  Three weeks that produce no demo, and every subsequent
  decision depends on them. It is also the phase that gets
  cut first when a date is under pressure — and cutting it
  is what turns roadmap 2 back into roadmap 1.`
    },
    prereq: ['ai-build-vs-buy'], next: [],
    related: ['roadmap', 'golden-sets', 'ai-rollout', 'regression-testing', 'prioritization'],
    tools: ['ragas', 'langsmith', 'braintrust'],
    useCases: [
      'Sequencing AI work so uncertainty is resolved before commitment.',
      'Justifying evaluation infrastructure that produces no demo.',
      'Budgeting the recurring work an AI feature needs.'
    ],
    avoid: [
      'Committing to dated AI features before a feasibility spike.',
      'Deferring abstention and error reporting as polish.'
    ],
    mistakes: [
      'Putting the feature on the roadmap instead of the spike that proves it possible.',
      'Cutting evaluation infrastructure under date pressure, which removes the ability to steer.',
      'Expanding scope before the first slice holds under real traffic.',
      'Allocating no ongoing capacity, so the system degrades after launch.'
    ],
    keyTerms: [
      ['feasibility phase', 'A spike as a roadmap item.'],
      ['evaluation infrastructure', 'Golden set, scoring and regression harness.'],
      ['narrow slice', 'One category, one workflow, behind a flag.'],
      ['exit criteria', 'The measured bar for moving to the next phase.'],
      ['ongoing capacity', 'Recurring effort for review, maintenance and upgrades.'],
      ['controlled rollout', 'Expanding exposure gradually with monitoring.']
    ],
    resources: [
      ['Marty Cagan — product roadmaps', 'https://www.svpg.com/product-roadmaps/', 'article'],
      ['Google — MLOps continuous delivery', 'https://cloud.google.com/architecture/mlops-continuous-delivery-and-automation-pipelines-in-machine-learning', 'reference'],
      ['Hugging Face — evaluation guidebook', 'https://github.com/huggingface/evaluation-guidebook', 'repo']
    ],
    questions: [
      ['What comes before the feature on an AI roadmap?', 'The feasibility spike and then the evaluation infrastructure. The spike is the roadmap item; the golden set and regression harness are what every subsequent decision depends on.'],
      ['Why is evaluation infrastructure the phase that gets cut, and why is cutting it fatal?', 'It produces no demo, so it looks like overhead under date pressure. Without it the team cannot tell whether a change helped, cannot upgrade a model, and cannot detect degradation.'],
      ['What ongoing capacity does an AI feature need?', 'Weekly error review, golden-set maintenance, drift watching and periodic model-upgrade evaluation. A roadmap with no allocation for these is describing a system that will degrade after launch.']
    ]
  }
];
