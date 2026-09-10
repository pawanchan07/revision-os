/**
 * DOMAIN R — PRODUCT MANAGEMENT, part 6 of 6: trade-offs and measurement
 */
export const topics = [
  {
    id: 'technical-debt',
    title: 'Technical Debt',
    domain: 'product', tier: 2, priority: 'medium',
    summary: 'The accumulated cost of past shortcuts, paid as interest on every future change.',
    what: `Technical debt is the extra effort future work carries because of earlier decisions — deliberate shortcuts, decisions that were right then and wrong now, or code written without the understanding that arrived later.`,
    why: `It is the mechanism by which a team that shipped quickly for a year becomes a team that cannot ship at all, and it is invisible on any roadmap unless someone makes it visible.`,
    analogy: `Actual debt. Borrowing is often correct — it buys time you need now. What kills you is borrowing without noticing the interest payments, until they consume the whole income.`,
    technical: `Useful distinctions, because they need different responses:
- **Deliberate and prudent** — "we shipped the simple version to learn; we will revisit". Legitimate, and only stays legitimate if it is recorded.
- **Deliberate and reckless** — "we do not have time to design it". Rarely worth it.
- **Inadvertent** — the code is wrong because nobody knew better at the time. Not a moral failing; still costs the same.

**Debt is only worth paying down where it charges interest.** A messy module nobody touches costs nothing. A messy module in the path of every feature costs on every feature. The question is not "is this ugly" but "how often do we pay".

**Make it visible in the same currency as features.** "Refactor the ingestion layer" competes badly against a customer request. "Every feature touching ingestion costs an extra week; we have four such features planned" competes well and is the same statement.

**AI systems accumulate a distinctive form**: prompts scattered across the codebase with no versioning, evaluation sets that no longer reflect production traffic, no tracing so failures cannot be diagnosed, and models pinned to versions nobody dares change. The last is the sharpest — a system with no evaluation harness cannot safely upgrade its model, so it is frozen on whatever it launched with while the field moves.`,
    diagram: `
   FOUR KINDS, FOUR RESPONSES

                    DELIBERATE            INADVERTENT
     PRUDENT        "ship simple to        "now we know how
                     learn, revisit"        we should have done it"
                    ← legitimate IF        ← not a failing,
                      recorded               still costs the same

     RECKLESS       "no time to design"    "what's a module?"
                    ← rarely worth it      ← a hiring/training issue

   ⚠ ONLY PAY DOWN DEBT THAT CHARGES INTEREST

     messy module nobody touches    costs nothing
     messy module in every path     costs on EVERY feature

     the question is not "is this ugly"
     it is "HOW OFTEN DO WE PAY"

   MAKE IT VISIBLE IN THE SAME CURRENCY AS FEATURES

     ✗ "refactor the ingestion layer"
       competes badly against a customer request

     ✓ "every feature touching ingestion costs an extra week,
        and we have four such features planned"
       competes well — and is the SAME statement

   ⚠ AI-SPECIFIC DEBT

     prompts scattered, unversioned      cannot reproduce a change
     eval set stale vs real traffic      passing means nothing
     no tracing                          failures undiagnosable
     model version frozen                ← the sharpest one

     a system with no evaluation harness CANNOT SAFELY
     UPGRADE ITS MODEL — so it is frozen on whatever it
     launched with while the field moves past it`,
    example: {
      language: 'text',
      caption: 'Making debt argue for itself',
      code: `THE PITCH THAT LOSES
  "We need a sprint to refactor the retrieval layer. The code
   is messy and it's hard to work with."

  Stakeholder hears: engineers want to tidy up.
  Loses to: any customer-visible feature.


THE SAME REQUEST, IN THE CURRENCY OF THE ROADMAP
  "Four of the next six roadmap items touch retrieval.

   Measured over the last five features that touched it:
     estimated   5, 3, 8, 5, 3   = 24 days
     actual      9, 7, 13, 8, 6  = 43 days
     interest paid                 19 days (79% over)

   Cause: chunking, embedding and query logic are entangled,
   so any change requires re-verifying all three, and there
   are no tests at that boundary.

   Cost to fix: 8 days.
   Expected saving across the four planned items: ~15 days.
   Breaks even during this quarter, not eventually."

  ⚠ Same work. Same sprint. Now it is a scheduling decision
    with numbers rather than an aesthetic preference.


── THE AI DEBT AUDIT ────────────────────────────────────────
  ✗ prompts live in 6 files, 2 of them duplicated and diverged
       → cannot tell which version produced a given output
       → INTEREST: every quality investigation starts with
         "which prompt actually ran?"

  ✗ golden set built at launch, 14 months ago
       → traffic has shifted to regional variants not in it
       → INTEREST: passing evaluation tells us nothing.
         We shipped a regression that the set could not catch.

  ✗ no tracing
       → INTEREST: a wrong answer cannot be diagnosed. Every
         report becomes an unresolvable "we'll look into it".

  ⚠ model pinned to a version 14 months old
       → we cannot upgrade because we have no way to verify
         the new one is not worse
       → INTEREST: compounding. The gap widens every release,
         and the longer we wait the larger and riskier the
         eventual jump becomes.

  PRIORITY ORDER  tracing → refresh golden set → consolidate
                  prompts → then upgrade the model

  ⚠ Note the model upgrade is LAST, not first. It is the
    thing everyone wants and the thing that is unsafe until
    the other three are done.`
    },
    prereq: [], next: ['product-tradeoffs'],
    related: ['product-tradeoffs', 'prioritization', 'golden-sets', 'tracing', 'mlops-lifecycle'],
    tools: [],
    useCases: [
      'Arguing for remediation work in terms stakeholders accept.',
      'Deciding which debt is worth paying down.',
      'Auditing why an AI system cannot upgrade its model.'
    ],
    avoid: [
      'Paying down debt in code nobody touches.',
      'Framing remediation as tidiness rather than cost.'
    ],
    mistakes: [
      'Treating all messy code as debt worth fixing.',
      'Pitching refactoring as a quality preference rather than a measured cost.',
      'Letting the evaluation set go stale, which makes passing meaningless.',
      'Trying to upgrade a model before building the harness that would prove it is not worse.'
    ],
    keyTerms: [
      ['technical debt', 'Extra future effort caused by earlier decisions.'],
      ['interest', 'The recurring cost the debt imposes on each change.'],
      ['prudent vs reckless debt', 'Whether the shortcut was a considered trade.'],
      ['debt audit', 'Enumerating debt with its measured interest.'],
      ['stale evaluation set', 'A golden set that no longer reflects production traffic.'],
      ['version lock', 'Inability to upgrade a model for lack of verification.']
    ],
    resources: [
      ['Martin Fowler — technical debt quadrant', 'https://martinfowler.com/bliki/TechnicalDebtQuadrant.html', 'article'],
      ['Martin Fowler — technical debt', 'https://martinfowler.com/bliki/TechnicalDebt.html', 'article'],
      ['Google — MLOps continuous delivery', 'https://cloud.google.com/architecture/mlops-continuous-delivery-and-automation-pipelines-in-machine-learning', 'reference']
    ],
    questions: [
      ['Which technical debt is worth paying down?', 'The debt that charges interest — code in the path of upcoming work. A messy module nobody touches costs nothing; the question is how often you pay, not how ugly it is.'],
      ['How do you make debt work compete with features?', 'State it in the same currency: the measured overrun on past features that touched the area, the number of planned features that will touch it, and the break-even point.'],
      ['What is the sharpest form of AI technical debt?', 'A model pinned to an old version because there is no evaluation harness to verify a replacement is not worse. It compounds — the gap widens every release and the eventual jump gets riskier.']
    ]
  },

  {
    id: 'product-tradeoffs',
    title: 'Trade-offs',
    domain: 'product', tier: 2, priority: 'high',
    summary: 'Every product decision gives something up — the skill is naming what, and choosing on purpose.',
    what: `A trade-off is a decision where improving one dimension worsens another. Product work is largely the practice of identifying which dimensions are in tension and choosing deliberately between them.`,
    why: `Decisions presented as pure wins usually hide their cost, and the hidden cost is discovered by someone else, later, as a surprise. Naming the trade converts an argument about who is right into a discussion about what to buy.`,
    analogy: `An engineering budget. Weight, strength and cost are in tension in every part; the answer is not "make it strong" but "how much weight will we spend for how much strength".`,
    technical: `The recurring tensions: **speed vs quality**, **scope vs time**, **flexibility vs simplicity**, **personalisation vs privacy**, **automation vs control**, and **short-term revenue vs long-term trust**.

The technique that does most of the work is stating the trade as a **purchase**: "we are buying two weeks of schedule by accepting a manual step for the first month". A purchase can be evaluated, priced and reversed. "We'll cut some scope" cannot.

**Reversibility should change how much you deliberate.** A decision you can undo in a week deserves a quick call; one that shapes a data model deserves a week of thought. Treating both the same is a common and expensive mistake in both directions.

**AI has its own signature trade-offs**, and they are unusually sharp:
- **Accuracy vs coverage** — abstaining more reduces errors and reduces usefulness.
- **Autonomy vs oversight** — every human checkpoint reduces risk and reduces the time saved.
- **Capability vs cost and latency** — a larger model is better, slower and more expensive.
- **Personalisation vs data minimisation** — more context means better answers and more data held.

These are not solvable. They are chosen, and the choice should be written down where the next person can find it — because the next person will otherwise "fix" the abstention rate without knowing it was set deliberately.`,
    diagram: `
   THE RECURRING TENSIONS

     speed ←──────────→ quality
     scope ←──────────→ time
     flexibility ←────→ simplicity
     personalisation ←→ privacy
     automation ←─────→ control
     short-term revenue ←→ long-term trust

   ⚠ STATE THE TRADE AS A PURCHASE

     ✗ "we'll cut some scope"
       cannot be evaluated, priced or reversed

     ✓ "we are BUYING two weeks of schedule by ACCEPTING
        a manual step for the first month"
       can be evaluated, priced and reversed

   REVERSIBILITY SETS THE DELIBERATION BUDGET

     undo in a week        → quick call
     shapes a data model   → a week of thought

     treating both the same is expensive in BOTH directions

   ⚠ AI'S SIGNATURE TRADE-OFFS ARE UNUSUALLY SHARP

     ACCURACY  ←──────────→  COVERAGE
       abstain more            answer more
       fewer errors            more usefulness

     AUTONOMY  ←──────────→  OVERSIGHT
       more time saved         less risk

     CAPABILITY ←─────────→  COST + LATENCY

     PERSONALISATION ←────→  DATA MINIMISATION

   ⚠ THESE ARE NOT SOLVABLE. THEY ARE CHOSEN.

     write the choice down where the next person finds it —
     otherwise they will "fix" the abstention rate without
     knowing it was set deliberately`,
    example: {
      language: 'text',
      caption: 'A decision record that names the purchase',
      code: `DECISION  Abstention threshold for policy answers
DATE      2026-03-14      OWNER  PM + Support lead
STATUS    Accepted        REVISIT  after 6 weeks of production data

THE TENSION
  Raising the threshold          Lowering it
    fewer confidently-wrong        answers more questions
    answers more "not covered"     more confidently-wrong

  These move together. There is no setting that improves both.

MEASURED (golden set v3, 220 cases)
  threshold   answered   confidently-wrong   agent-useful
    0.50        86%           4.1%              86%
    0.62        71%           1.1%              71%    ← chosen
    0.70        58%           0.6%              58%
    0.80        41%           0.3%              41%

WHAT WE ARE BUYING
  We are buying a drop from 4.1% to 1.1% confidently-wrong
  by giving up 15 percentage points of coverage.

WHY THAT PURCHASE
  · 5 of 11 agents said two confidently-wrong answers would
    make them stop using it entirely. At 4.1% and 40 queries
    a day, every agent hits two wrong answers within a week.
  · A "not covered" costs 6 minutes (they ask a colleague —
    the status quo). A wrong policy answer can cost an
    incorrect refund commitment and a complaint.
  · Asymmetric costs → buy accuracy with coverage.

WHAT WE ARE NOT DOING, AND WHY
  · Not 0.70: below ~60% answered, the feature stops being
    worth opening. Support lead's judgement, and the reason
    we set a LOWER bound on coverage as well as an upper
    bound on error.

REVERSIBILITY
  High. One config value, no data migration. This decision
  deserved two hours of thought, not two weeks — and it gets
  revisited with production data rather than argued again.

⚠ IF YOU ARE READING THIS BECAUSE ABSTENTION SEEMS HIGH:
  it is high on purpose. Before lowering it, re-run the
  golden set and look at the confidently-wrong column.`
    },
    prereq: [], next: [],
    related: ['technical-debt', 'prioritization', 'human-in-the-loop', 'size-quality-tradeoff', 'ai-risk'],
    tools: [],
    useCases: [
      'Converting an argument into a priced decision.',
      'Recording why a threshold was set, for whoever inherits it.',
      'Matching deliberation effort to reversibility.'
    ],
    avoid: [
      'Presenting a decision as a pure win.',
      'Deliberating at length over easily reversible choices.'
    ],
    mistakes: [
      'Hiding the cost of a decision, so it is discovered later by someone else.',
      'Treating AI trade-offs as bugs to be fixed rather than positions to be chosen.',
      'Not recording the choice, so the next person silently undoes it.',
      'Spending the same deliberation on reversible and irreversible decisions.'
    ],
    keyTerms: [
      ['trade-off', 'A decision where improving one dimension worsens another.'],
      ['purchase framing', 'Stating what is bought and what is given up.'],
      ['reversibility', 'How cheaply a decision can be undone.'],
      ['decision record', 'A written note of the choice, evidence and reasoning.'],
      ['asymmetric cost', 'When one kind of error is far worse than the other.'],
      ['accuracy-coverage trade', 'The central AI trade: abstain more, answer less.']
    ],
    resources: [
      ['ADR — architecture decision records', 'https://adr.github.io/', 'reference'],
      ['Jeff Bezos — one-way and two-way doors', 'https://www.sec.gov/Archives/edgar/data/1018724/000119312516530910/d168744dex991.htm', 'article'],
      ['Google — People + AI Guidebook', 'https://pair.withgoogle.com/guidebook/', 'reference']
    ],
    questions: [
      ['What does framing a trade-off as a purchase achieve?', 'It makes the decision evaluable, priceable and reversible. "We are buying two weeks of schedule by accepting a manual step for a month" can be argued with; "we\'ll cut some scope" cannot.'],
      ['Why should reversibility change how long you deliberate?', 'A decision you can undo in a week deserves a quick call; one that shapes a data model deserves real thought. Spending equal effort on both wastes time in one direction and risk in the other.'],
      ['Why must AI trade-offs be written down?', 'Because they look like bugs. Someone inheriting a high abstention rate will "fix" it without knowing it was set deliberately to buy a fourfold reduction in confidently-wrong answers.']
    ],
    interview: {
      s30: 'Every product decision gives something up. I try to state the trade as a purchase — what we are buying and what we are paying — because a purchase can be priced and reversed, while "we will cut some scope" cannot.',
      s90: 'The AI-specific version of this is sharper than most people expect, because accuracy and coverage move against each other directly. On a policy-answer feature we measured the abstention threshold across four settings: at 0.50 it answered 86% of questions with 4.1% confidently wrong; at 0.62 it answered 71% with 1.1% wrong. We chose 0.62, and the reason is asymmetric cost — a "not covered" costs six minutes because they ask a colleague, which is exactly the status quo, whereas a wrong policy answer can cost an incorrect refund commitment. Five of eleven agents told us two wrong answers would make them abandon it, and at 4.1% every agent hits two within a week. The part I care about most is that we wrote it down with the measurements, because the next person to look at a 29% abstention rate will read it as a defect and quietly lower the threshold.'
    }
  },

  {
    id: 'product-metrics',
    title: 'Product Metrics',
    domain: 'product', tier: 1, priority: 'high',
    summary: 'Measuring whether the product is working, without measuring the wrong thing confidently.',
    what: `Product metrics are the quantities a team tracks to know whether the product is delivering value: acquisition, activation, engagement, retention, and outcome measures specific to the problem being solved.`,
    why: `Without them, product success is asserted. With the wrong ones, it is asserted more confidently — which is worse, because a number ends arguments that should still be running.`,
    analogy: `Instruments in a cockpit. The danger is not having no instruments; it is an altimeter that reads high.`,
    technical: `The distinctions worth holding:
- **Output vs outcome.** Features shipped, queries answered, sessions started — these are outputs. Whether the user's problem got smaller is the outcome. Teams drift toward outputs because they are easier to move.
- **Leading vs lagging.** Retention is lagging and definitive; activation rate is leading and actionable. You need both — one to steer, one to confirm.
- **Counter-metrics.** Every primary metric needs one that would catch the cheapest way to game it. Engagement paired with task completion time; answers-given paired with answers-corrected.

**Segment before concluding.** An overall average moving flat frequently hides one segment improving and another collapsing. The average is the least informative view of almost any metric.

**AI features need outcome and quality metrics tracked together**, because they trade against each other. Usage rising while corrections rise faster is not success. The set that actually describes an assistive feature: adoption, coverage (answered vs abstained), correction rate, downstream outcome, cost per interaction, and latency. Any one of those alone can be moved by making the others worse.`,
    diagram: `
   OUTPUT vs OUTCOME

     OUTPUT               OUTCOME
     features shipped     did the user's problem get smaller?
     queries answered
     sessions started     ← teams drift toward outputs
                            because they are easier to move

   LEADING vs LAGGING

     leading    activation rate      actionable, noisy
     lagging    retention            definitive, slow

     you need both: one to steer, one to confirm

   ⚠ EVERY PRIMARY METRIC NEEDS A COUNTER-METRIC

     primary                  counter (catches the cheap gaming)
     ────────                 ─────────────────────────────────
     engagement time     ⟷    task completion time
     answers given       ⟷    answers corrected
     tickets closed      ⟷    tickets reopened
     signups             ⟷    week-4 retention

   ⚠ SEGMENT BEFORE CONCLUDING

     overall           ▬▬▬▬▬▬▬▬  flat
       new users       ▲▲▲▲▲▲▲▲  +40%
       existing users  ▼▼▼▼▼▼▼▼  -22%

     the average is the LEAST informative view
     of almost any metric

   THE SET THAT DESCRIBES AN ASSISTIVE AI FEATURE

     adoption            who uses it
     coverage            answered vs abstained
     correction rate     how often it is wrong
     downstream outcome  did the real problem shrink
     cost per interaction
     latency

     ⚠ any ONE of these can be improved by making
       the others worse. Track them as a set.`,
    example: {
      language: 'python',
      caption: 'A metric set where every number has a counter-metric',
      code: `def feature_health(week):
    m = {
        # ADOPTION
        "agents_using":        week.distinct_agents / week.total_agents,
        "queries_per_agent":   week.queries / max(week.distinct_agents, 1),

        # COVERAGE  (counter-metric to correction rate)
        "answered_rate":       week.answered / week.queries,
        "abstained_rate":      week.abstained / week.queries,

        # QUALITY  (counter-metric to coverage)
        "correction_rate":     week.flagged_confirmed / max(week.answered, 1),

        # OUTCOME — the only one that is not an output
        "repeat_contacts":     week.repeat_contacts,
        "verified_no_lookup":  week.answers_accepted_without_source_open
                               / max(week.answered, 1),

        # COST
        "cost_per_query":      week.spend / max(week.queries, 1),
        "p95_latency_ms":      week.p95_latency,
    }
    return {k: round(v, 3) if isinstance(v, float) else v
            for k, v in m.items()}

# WEEK 3 vs WEEK 9
#                          w3      w9
# agents_using           0.42    0.71   ▲ adoption up
# queries_per_agent      6.1     9.4    ▲
# answered_rate          0.71    0.59   ▼ ⚠
# abstained_rate         0.29    0.41   ▲ ⚠
# correction_rate        0.011   0.009  ▼ good
# repeat_contacts        26      19     ▼ THE OUTCOME IS MOVING
# verified_no_lookup     0.63    0.81   ▲ trust rising
# cost_per_query         ₹0.71   ₹0.68
# p95_latency_ms         2400    2380

# READING THIS SET, NOT ANY ONE NUMBER:
#   adoption up, outcome improving, corrections down.
#   BUT coverage fell 12 points — abstention is eating usefulness.
#   Correction rate improved partly BECAUSE coverage fell, which
#   is exactly why the two are tracked together.
#
#   Without answered_rate, the correction improvement reads as
#   a quality win. With it, it reads as a system that got more
#   cautious — which may or may not be what we want, and is now
#   a decision rather than an accident.

# ⚠ SEGMENT BEFORE CONCLUDING
# by tenure:
#   new agents (<3mo)     adoption 0.88   verified_no_lookup 0.91
#   senior agents         adoption 0.44   verified_no_lookup 0.62
#
#   Senior agents verify more and adopt less — they know enough
#   to doubt it. The overall 0.71 hid two different products.`
    },
    prereq: [], next: ['north-star-metric'],
    related: ['north-star-metric', 'ai-metrics', 'cohorts-retention', 'funnels', 'activation-adoption'],
    tools: [],
    useCases: [
      'Knowing whether a shipped feature actually worked.',
      'Catching a metric that improved by making something else worse.',
      'Separating two segments hidden inside one average.'
    ],
    avoid: [
      'Single-metric dashboards with no counter-metric.',
      'Concluding from an overall average without segmenting.'
    ],
    mistakes: [
      'Tracking outputs and calling them outcomes.',
      'Omitting counter-metrics, so gaming goes unnoticed.',
      'Reading an average that hides two segments moving in opposite directions.',
      'For AI, celebrating a falling correction rate that fell because coverage fell.'
    ],
    keyTerms: [
      ['output vs outcome', 'What you shipped versus whether the problem shrank.'],
      ['leading indicator', 'Actionable and early; used to steer.'],
      ['lagging indicator', 'Definitive and slow; used to confirm.'],
      ['counter-metric', 'A metric that catches the cheapest way to game the primary.'],
      ['segmentation', 'Splitting a metric by group before concluding.'],
      ['coverage', 'The share of requests answered rather than declined.'],
      ['correction rate', 'How often output is flagged and confirmed wrong.']
    ],
    resources: [
      ['Amplitude — north star and product metrics', 'https://amplitude.com/blog/product-metrics', 'article'],
      ['Reforge — metrics that matter', 'https://www.reforge.com/blog/north-star-metric', 'article'],
      ['Google — People + AI Guidebook', 'https://pair.withgoogle.com/guidebook/', 'reference']
    ],
    questions: [
      ['What is a counter-metric and why does every primary need one?', 'A metric that catches the cheapest way to game the primary — engagement paired with task completion time, answers given paired with answers corrected. Without it, improvement and gaming look identical.'],
      ['Why segment before concluding from a metric?', 'A flat average routinely hides one segment improving and another collapsing. The average is the least informative view of almost any metric.'],
      ['Why must AI coverage and correction rate be tracked together?', 'They trade against each other. A correction rate that falls because the system started abstaining more is not a quality improvement, and reading either number alone hides that.']
    ]
  },

  {
    id: 'north-star-metric',
    title: 'North-Star Metric',
    domain: 'product', tier: 2, priority: 'high',
    summary: 'One number that captures delivered value, with the guardrails that stop it being gamed.',
    what: `A north-star metric is the single measure a team agrees best represents the value the product delivers to users, used to align decisions across functions.`,
    why: `Teams with several equally-weighted goals optimise whichever is easiest. One primary metric forces the trade-offs into the open — but only if it measures value received rather than activity performed.`,
    analogy: `A compass bearing, not a destination. It does not tell you which road to take; it tells you whether the road you took was the right direction.`,
    technical: `A good north star has three properties: it **measures value the user receives** (not activity the product generated), it **moves when the product improves** (and not otherwise), and it is **something the team can actually influence** within a quarter.

The classic failures: **revenue** (lagging, and influenced by things the team does not control), **raw usage** (a support tool being used more may mean the underlying process got worse), and **anything with no counter-metric**.

**Guardrails are mandatory.** A north star without them selects for the cheapest way to move it. Pair it with two or three metrics that must not degrade — quality, cost, latency, trust.

The hard part is that the honest north star is usually harder to measure than the convenient one. "Questions resolved without escalation" requires joining systems; "queries answered" is in one log. Teams pick the convenient one and then spend a year confused about why it moves without anything improving.

**For an assistive AI product**, a north star built on volume is almost always wrong. Better: the share of interactions where the user got what they needed and did not have to verify it elsewhere — because that is the value, and it cannot be moved by answering more questions worse.`,
    diagram: `
   THREE PROPERTIES OF A GOOD NORTH STAR

     1  measures VALUE RECEIVED, not activity generated
     2  moves when the product improves — AND NOT OTHERWISE
     3  the team can influence it within a quarter

   CLASSIC FAILURES

     revenue        lagging · influenced by things outside the team
     raw usage      a support tool used MORE may mean the
                    underlying process got WORSE
     no guardrails  selects for the cheapest way to move it

   ⚠ GUARDRAILS ARE MANDATORY

       NORTH STAR
            │
       ┌────┴────┬─────────┬──────────┐
     quality   cost     latency     trust
     must not degrade while the north star rises

   ⚠ THE HONEST METRIC IS USUALLY HARDER TO MEASURE

     convenient   "queries answered"        one log
     honest       "resolved without
                   escalation"              joins three systems

     teams pick the convenient one and spend a year confused
     about why it moves without anything improving

   FOR AN ASSISTIVE AI PRODUCT

     ✗ queries answered           volume ≠ value
     ✗ time saved (estimated)     estimated ≠ measured
     ✓ share of interactions where the user got what they
       needed AND did not verify it elsewhere

       ← cannot be moved by answering more questions worse`,
    example: {
      language: 'text',
      caption: 'Choosing a north star, and the ones rejected',
      code: `PRODUCT  policy assistant inside the agent console

CANDIDATES CONSIDERED

  ✗ Queries answered per day
      Convenient — one log line. But it rises if the handbook
      gets worse, if agents ask the same thing twice because
      they did not trust the first answer, and if we lower the
      abstention threshold and answer more questions badly.
      Moves for three reasons, only one of which is good.

  ✗ Estimated time saved
      A model output, not a measurement. It is our assumptions
      multiplied by our traffic. It will always go up.

  ✗ Agent satisfaction score
      Lagging, noisy at our sample size, and it measures
      feelings about the whole console, not this feature.

  ✓ CHOSEN
      Share of policy questions resolved in-console without
      the agent opening the source document or asking a
      colleague.

      Why: it is value RECEIVED. It cannot be moved by
      answering more questions worse — a wrong answer sends
      them to the handbook, which removes it from the numerator.
      It cannot be moved by abstaining more either, because
      abstentions stay in the denominator.

      Current 0.44   ·   Target 0.65 by end of quarter

GUARDRAILS — must not degrade
  confidently-wrong rate      ≤ 1.5%      (now 0.9%)
  p95 latency                 ≤ 3.0s      (now 2.4s)
  cost per query              ≤ ₹1.00     (now ₹0.68)
  agent-reported trust        ≥ baseline  (quarterly survey)

⚠ WHAT THE GUARDRAILS PREVENT
  The cheapest way to raise the north star is to lower the
  abstention threshold — more answers, fewer colleague-asks.
  The confidently-wrong guardrail makes that path visible
  and blocks it. Without the guardrail, the north star and
  the gaming strategy are indistinguishable.

MEASUREMENT COST — stated honestly
  Requires joining console events, handbook opens and Slack
  activity. Three days of engineering, and a weekly job.
  We paid it. The convenient alternative would have cost
  a quarter of confused meetings.`
    },
    prereq: ['product-metrics'], next: [],
    related: ['product-metrics', 'product-strategy', 'ai-metrics', 'activation-adoption', 'roadmap'],
    tools: [],
    useCases: [
      'Aligning several functions on one definition of value.',
      'Forcing trade-offs into the open instead of optimising the easiest goal.',
      'Blocking the cheapest way to game a target.'
    ],
    avoid: [
      'Volume metrics for assistive products.',
      'A north star with no guardrails.'
    ],
    mistakes: [
      'Choosing the convenient metric over the honest one.',
      'Using revenue, which lags and is influenced by things the team does not control.',
      'Omitting guardrails, which makes improvement and gaming indistinguishable.',
      'Treating an estimated quantity as a measurement.'
    ],
    keyTerms: [
      ['north-star metric', 'The single measure of value delivered.'],
      ['guardrail metric', 'A metric that must not degrade while the north star rises.'],
      ['value received', 'What the user got, not what the product did.'],
      ['gaming', 'Moving a metric without delivering the value it represents.'],
      ['measurement cost', 'The engineering required to track the honest metric.'],
      ['denominator discipline', 'Ensuring abstentions and failures stay counted.']
    ],
    resources: [
      ['Amplitude — north star framework', 'https://amplitude.com/blog/north-star-metric', 'article'],
      ['Reforge — north star metric', 'https://www.reforge.com/blog/north-star-metric', 'article'],
      ['Sean Ellis — north star metric', 'https://growthhackers.com/', 'reference']
    ],
    questions: [
      ['What makes a north-star metric good?', 'It measures value the user received rather than activity the product generated, moves only when the product genuinely improves, and can be influenced by the team within a quarter.'],
      ['Why are guardrails mandatory?', 'Without them the north star selects for the cheapest way to move it. Pairing it with quality, cost and latency limits makes improvement and gaming distinguishable.'],
      ['Why is volume a bad north star for an assistive AI product?', 'Usage rises when the underlying process gets worse, when users re-ask because they did not trust the first answer, and when you answer more questions badly. It moves for several reasons, only one of which is good.']
    ],
    interview: {
      s30: 'A north star is the one number that best represents value delivered to users, plus the guardrails that stop it being gamed. For assistive AI, volume metrics are almost always the wrong choice.',
      s90: 'On a policy assistant we rejected "queries answered" precisely because it rises for three different reasons and only one of them is good — it goes up if the handbook gets worse, if agents re-ask because they did not trust the first answer, and if we lower the abstention threshold and answer more questions badly. What we chose instead was the share of policy questions resolved in-console without the agent opening the source document or asking a colleague. That cannot be gamed by answering more questions worse, because a wrong answer sends them to the handbook and removes itself from the numerator, and it cannot be gamed by abstaining more because abstentions stay in the denominator. It cost three days of engineering to join console events with handbook opens, which is the part teams usually skip — and skipping it buys you a quarter of meetings about why the convenient number went up while nothing got better.'
    }
  }
];
