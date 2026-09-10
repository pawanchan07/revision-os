/**
 * DOMAIN V — ECONOMICS + FINANCE BASICS, part 2: incentives and imperfect information
 */
export const topics = [
  {
    id: 'incentives',
    title: 'Incentives',
    domain: 'economics', tier: 2, priority: 'high',
    summary: 'People respond to what is measured and rewarded — including in ways nobody intended.',
    what: `An incentive is anything that motivates a choice. Economics treats behaviour as largely a response to incentives, which is why changing what is measured changes what people do.`,
    why: `Most organisational dysfunction is an incentive problem wearing a competence costume. A team behaving badly is usually a team responding rationally to what they are rewarded for.`,
    analogy: `Paying for rat tails to reduce a rat population, and people start breeding rats. The response was rational; the measure was the problem.`,
    technical: `**Goodhart's law:** when a measure becomes a target, it ceases to be a good measure. This is not a curiosity — it is the default outcome of setting any single metric as a goal.

**Incentives are not only monetary.** Status, autonomy, avoiding blame, and reduced effort all drive behaviour, often more strongly than money.

**Look for the incentive before assuming incompetence.** Support closing tickets fast rather than well is a response to being measured on handle time. Engineering not writing tests is often a response to being measured on velocity.

**Second-order effects are where the damage is.** A metric produces the behaviour it names and also everything else that moves that metric, and the second set is invisible until it is a problem.

**In AI systems, incentive design extends to the system itself.** A model rewarded for producing an answer will produce one; abstention has to be explicitly valued or it will not happen. An evaluation that scores only correctness of answers given, without penalising confident errors or crediting appropriate abstention, incentivises exactly the behaviour that destroys trust.

**Design the counter-metric alongside the metric.** Every target needs a paired measure that catches the cheapest way to hit it dishonestly.`,
    diagram: `
   ⚠ GOODHART'S LAW

     when a measure becomes a target,
     it ceases to be a good measure

     this is not a curiosity — it is the DEFAULT outcome
     of setting any single metric as a goal

   INCENTIVES ARE NOT ONLY MONETARY

     status · autonomy · avoiding blame · reduced effort
     often stronger than money

   ⚠ LOOK FOR THE INCENTIVE BEFORE ASSUMING INCOMPETENCE

     support closes tickets fast, not well
       → they are measured on handle time
     engineering does not write tests
       → they are measured on velocity

     rational response · bad measure

   SECOND-ORDER EFFECTS ARE WHERE THE DAMAGE IS

     a metric produces the behaviour it NAMES
     and everything ELSE that moves that metric

     the second set is invisible until it is a problem

   ⚠ AI SYSTEMS RESPOND TO INCENTIVES TOO

     a model rewarded for PRODUCING AN ANSWER
     will produce one

     an evaluation that scores only correctness of answers
     GIVEN — without penalising confident errors or
     crediting appropriate abstention — incentivises
     exactly the behaviour that destroys trust

   DESIGN THE COUNTER-METRIC ALONGSIDE THE METRIC

     every target needs a paired measure that catches
     the cheapest dishonest way to hit it`,
    example: {
      language: 'text',
      caption: 'Three incentive failures, including one inside the model',
      code: `1. SUPPORT — handle time
   TARGET     average handle time below 6.5 minutes
   BEHAVIOUR  agents close tickets fast, tell customers
              "I'll get back to you", never do
   RESULT     handle time 6.2 min ✓
              repeat contacts up 40%  ⚠ nobody was measuring
   FIX        pair with "resolved without repeat contact
              within 7 days"

2. ENGINEERING — velocity
   TARGET     story points per sprint
   BEHAVIOUR  estimates inflate; refactoring stops; tests
              are cut because they add points without
              adding "delivered" points
   RESULT     velocity up 30% ✓
              defect escape rate up 2.4x  ⚠
   FIX        stop targeting velocity. It is a planning
              input, not a goal.

⚠ 3. THE MODEL — the one people miss
   EVALUATION  "accuracy on questions answered"
   BEHAVIOUR   every prompt change that made the system
               more willing to answer scored BETTER, because
               abstentions were not in the denominator
   RESULT      accuracy on answered questions 94% ✓
               abstention fell 29% → 8%
               confidently-wrong rate rose 1.1% → 4.7%  ⚠
               agent adoption fell 71% → 38% over six weeks

   ⚠ THE EVALUATION WAS THE INCENTIVE, AND IT REWARDED
     EXACTLY THE BEHAVIOUR THAT DESTROYED THE PRODUCT.

   FIX  score three things, not one:
          · correctness of answers given
          · penalty for confident errors (weighted 3x)
          · CREDIT for correct abstention on out-of-corpus
            questions
        with abstentions in the denominator.

        Under the corrected scoring, the "improvements" that
        had been shipped scored WORSE than the version they
        replaced — which is what the metric should have said
        at the time.

⚠ THE COMMON THREAD
  In all three cases the people and the model behaved
  rationally. Every failure was a measurement design failure,
  and every fix was a counter-metric rather than a
  conversation about effort or care.`
    },
    prereq: [], next: ['principal-agent'],
    related: ['product-metrics', 'north-star-metric', 'principal-agent', 'refusal-quality', 'eval-thresholds-quality-gates'],
    tools: [],
    useCases: [
      'Diagnosing dysfunction that looks like incompetence.',
      'Designing a metric that resists gaming.',
      'Fixing an evaluation that rewards the wrong model behaviour.'
    ],
    avoid: [
      'Single-metric targets with no counter-metric.',
      'Targeting velocity or handle time directly.'
    ],
    mistakes: [
      'Assuming a team is careless when they are responding to what is measured.',
      'Setting a target without asking what the cheapest way to hit it is.',
      'Scoring only answers given, which incentivises a model to stop abstaining.',
      'Ignoring non-monetary incentives, which often dominate.'
    ],
    keyTerms: [
      ['incentive', 'Anything that motivates a choice.'],
      ['Goodhart’s law', 'A measure made a target stops being a good measure.'],
      ['counter-metric', 'A paired measure catching the cheapest gaming path.'],
      ['second-order effect', 'What else moves when you move a metric.'],
      ['denominator discipline', 'Ensuring abstentions and failures stay counted.'],
      ['non-monetary incentive', 'Status, autonomy, blame avoidance, effort.']
    ],
    resources: [
      ['Goodhart’s law — overview', 'https://en.wikipedia.org/wiki/Goodhart%27s_law', 'reference'],
      ['CORE Econ — The Economy', 'https://www.core-econ.org/the-economy/', 'course'],
      ['Amplitude — product metrics', 'https://amplitude.com/blog/product-metrics', 'article']
    ],
    questions: [
      ['What is Goodhart’s law and why does it matter?', 'When a measure becomes a target it stops being a good measure. It is the default outcome of any single-metric goal, not an occasional failure.'],
      ['How do incentives apply inside an AI system?', 'The evaluation is the incentive. Scoring only accuracy on questions answered rewards a model for abstaining less, which raises confident errors and destroys trust.'],
      ['What should you ask before setting a target?', 'What is the cheapest dishonest way to hit this? The answer becomes the counter-metric you pair with it.']
    ]
  },

  {
    id: 'opportunity-cost',
    title: 'Opportunity Cost',
    domain: 'economics', tier: 1, priority: 'high',
    summary: 'The real cost of a choice is the best thing you gave up to make it.',
    what: `Opportunity cost is the value of the next-best alternative forgone. Every decision to do something is a decision not to do everything else.`,
    why: `It is the most useful idea in economics for product work, and the one most consistently omitted from business cases. A project that returns a positive number is not necessarily worth doing.`,
    analogy: `A parking space in a busy street. The cost is not the meter; it is that nobody else can park there.`,
    technical: `**Sunk costs are not opportunity costs.** Money and effort already spent are gone and should not affect the decision. "We have already invested six months" is the most common bad argument in product work.

**The scarce resource is usually attention, not money.** A team can only do a few things well. The opportunity cost of a project is the best project the team is therefore not doing, and that is generally much larger than its budget.

**Apply it to time as well as to projects.** A meeting's cost is the number of people times what they would otherwise be doing. A two-hour review with eight people is two working days.

**In an AI context it applies sharply to research effort.** Spending three weeks improving a prompt from 91% to 93% has an opportunity cost — the retrieval work, the evaluation infrastructure, or the second use case not started. Diminishing returns on one axis while another axis is untouched is the classic pattern.

**The practical habit:** for any significant commitment, name the specific alternative you are declining. Not "other work" — the actual project. If you cannot name it, you have not made a choice, you have made a default.`,
    diagram: `
   THE REAL COST OF A CHOICE

     what you spend        the visible cost
     what you FORGO        ⚠ the real cost

   ⚠ SUNK COSTS ARE NOT OPPORTUNITY COSTS

     "we have already invested six months"

     that money and effort are GONE. They are the same
     whether you continue or stop. They belong in no
     decision about what to do next.

     ← the most common bad argument in product work

   ⚠ THE SCARCE RESOURCE IS ATTENTION, NOT MONEY

     a team can only do a few things well

     the opportunity cost of a project is the best project
     the team is therefore NOT doing — generally much
     larger than its budget

   APPLY IT TO TIME

     a 2-hour review with 8 people = two working days
     the cost is what those people would otherwise do

   ⚠ IN AI, IT APPLIES SHARPLY TO RESEARCH EFFORT

     three weeks taking a prompt from 91% → 93%
       opportunity cost: the retrieval work not done,
       the evaluation infrastructure not built,
       the second use case not started

     diminishing returns on one axis while another axis
     is untouched — the classic pattern

   THE HABIT

     for any significant commitment, NAME the specific
     alternative you are declining

     not "other work" — the actual project

     if you cannot name it, you have not made a choice.
     You have made a default.`,
    example: {
      language: 'text',
      caption: 'Naming what is being declined',
      code: `PROPOSAL  "Three more weeks tuning the prompt and retrieval
           to push groundedness from 0.91 to 0.94."

THE VISIBLE COST
  3 weeks × 2 engineers × $9,000/week = $54,000

⚠ THE OPPORTUNITY COST — naming the actual alternatives
  A  Regional policy corpus ingestion (2 weeks)
       currently 14% of production questions abstain because
       the documents are not there at all
       → would move coverage 71% → ~84%
  B  Second use case: shipping policy (3 weeks)
       reuses all evaluation infrastructure
       → the CBA showed payback drops from 24mo to 11mo with
         a second team on the same corpus
  C  Golden-set refresh (1 week)
       current set is 9 months old; production traffic has
       shifted

  Expected value of the proposal:
    +0.03 groundedness on the 71% we already answer
    ≈ +2% of answers becoming correct that were not

  Expected value of A:
    +13 percentage points of coverage
    ≈ 6x the effect, in two-thirds the time

⚠ THE PROPOSAL WAS NOT BAD. IT WAS SIXTH BEST, AND NOBODY
  HAD WRITTEN DOWN WHAT IT WAS COMPETING AGAINST.

⚠ THE SUNK-COST ARGUMENT THAT ALMOST WON
  "We've spent two weeks on this tuning already — it would
   be a waste to stop now."

  Those two weeks are gone under every option. They are
  not a reason to spend three more. The question is only
  what the NEXT three weeks buy, and A buys six times more.

DECISION  A, then C, then re-evaluate. The prompt tuning
          goes on the list with its measured expected value
          attached, so the comparison does not have to be
          re-derived next time it is proposed.`
    },
    prereq: [], next: ['marginal-analysis'],
    related: ['prioritization', 'roi-cost-benefit', 'product-tradeoffs', 'marginal-analysis'],
    tools: [],
    useCases: [
      'Comparing a proposal against what it displaces.',
      'Rejecting a sunk-cost argument.',
      'Deciding when to stop optimising one axis.'
    ],
    avoid: [
      'Business cases that show a positive return without naming the alternative.',
      'Continuing because of what has already been spent.'
    ],
    mistakes: [
      'Treating sunk costs as a reason to continue.',
      'Comparing a proposal to doing nothing rather than to the best alternative.',
      'Ignoring that attention, not money, is the binding constraint.',
      'Optimising one axis to diminishing returns while another is untouched.'
    ],
    keyTerms: [
      ['opportunity cost', 'The value of the next-best alternative forgone.'],
      ['sunk cost', 'Already spent; irrelevant to future decisions.'],
      ['sunk-cost fallacy', 'Continuing because of past investment.'],
      ['binding constraint', 'The resource that actually limits you — usually attention.'],
      ['diminishing returns', 'Each additional unit of effort buying less.'],
      ['named alternative', 'The specific project being declined.']
    ],
    resources: [
      ['Khan Academy — opportunity cost', 'https://www.khanacademy.org/economics-finance-domain/microeconomics', 'course'],
      ['CORE Econ — The Economy', 'https://www.core-econ.org/the-economy/', 'course'],
      ['Harvard Business Review — a refresher on NPV', 'https://hbr.org/2014/11/a-refresher-on-net-present-value', 'article']
    ],
    questions: [
      ['Why is a positive return not sufficient to justify a project?', 'The comparison is not against doing nothing but against the best alternative. A project can return a positive number and still be the sixth-best use of the team.'],
      ['Why are sunk costs irrelevant?', 'They are the same whether you continue or stop, so they cannot distinguish between the options. "We have already spent six months" is not a reason to spend more.'],
      ['What is the practical habit?', 'Name the specific alternative you are declining — the actual project, not "other work". If you cannot name it, you have made a default rather than a choice.']
    ]
  },

  {
    id: 'marginal-analysis',
    title: 'Marginal Cost & Marginal Benefit',
    domain: 'economics', tier: 2, priority: 'medium',
    summary: 'Decisions are made at the edge — what does one more cost, and what does one more give?',
    what: `Marginal cost is the cost of one additional unit; marginal benefit is the value of one additional unit. The optimum is where they are equal, and past that point each additional unit destroys value.`,
    why: `Most product decisions are marginal ones — one more feature, one more chunk of context, one more review stage — and averages give the wrong answer for all of them.`,
    analogy: `Eating. The first slice of cake has high marginal benefit; the fifth has negative marginal benefit. The average deliciousness of cake tells you nothing about whether to have another.`,
    technical: `**Think at the margin, not on average.** "Our average cost per query is $0.012" does not answer "should we retrieve two more chunks?". That needs the marginal cost of two chunks and the marginal quality gain.

**Marginal cost is often not constant.** It can fall with scale (infrastructure amortising) or rise (capacity limits, rate limits, the need for a bigger machine). AI systems show both: token cost is roughly linear, but crossing a memory threshold is a step change.

**Marginal benefit almost always falls.** The first retrieved chunk carries most of the answer; the tenth rarely adds anything and can hurt by diluting attention. The first review stage catches most errors; the third catches very few.

**Stop where marginal benefit meets marginal cost.** In practice this means measuring at several settings rather than picking one and defending it.

**The trap is unmeasured monotonic assumptions** — "more context is better", "more review is safer". Both are true at first and false eventually, and the crossing point is a measurable number, not a matter of taste.`,
    diagram: `
   THE OPTIMUM IS WHERE THEY MEET

     value
       │╲   marginal benefit
       │ ╲
       │  ╲___
       │      ╲──__
       │           ╲──__
       │  ────────────────────  marginal cost
       │            ▲
       │            │ STOP HERE
       └────────────┴─────────────► units

     past the crossing, each additional unit
     DESTROYS value

   ⚠ THINK AT THE MARGIN, NOT ON AVERAGE

     "average cost per query is $0.012"
       does not answer
     "should we retrieve two more chunks?"

     that needs the MARGINAL cost of two chunks and the
     MARGINAL quality gain

   MARGINAL COST IS NOT ALWAYS CONSTANT

     falls with scale     infrastructure amortising
     rises                capacity limits · rate limits
     ⚠ STEP CHANGES       crossing a memory threshold
                          needs a bigger machine

   MARGINAL BENEFIT ALMOST ALWAYS FALLS

     1st retrieved chunk   carries most of the answer
     10th                  adds nothing, and can HURT by
                           diluting attention

     1st review stage      catches most errors
     3rd                   catches very few

   ⚠ THE TRAP: UNMEASURED MONOTONIC ASSUMPTIONS

     "more context is better"    true at first, false later
     "more review is safer"      true at first, false later

     the crossing point is a MEASURABLE NUMBER,
     not a matter of taste`,
    example: {
      language: 'python',
      caption: 'Finding where more context stops helping',
      code: `# QUESTION  how many chunks should we retrieve?
# The team's assumption: "more context is better."

def measure(k, golden_set):
    """Marginal analysis needs several settings, not one."""
    scores, tokens, latency = [], [], []
    for case in golden_set:
        out = run(case, top_k=k)
        scores.append(score(case, out)); tokens.append(out["in_tokens"])
        latency.append(out["ttft_ms"])
    return {"k": k,
            "groundedness": round(sum(scores)/len(scores), 3),
            "in_tokens": round(sum(tokens)/len(tokens)),
            "ttft_ms": round(sum(latency)/len(latency))}

rows = [measure(k, GOLDEN) for k in (1, 3, 5, 8, 12, 20)]

prev = None
for r in rows:
    if prev:
        d_benefit = r["groundedness"] - prev["groundedness"]
        d_cost = (r["in_tokens"] - prev["in_tokens"]) * 3e-6
        print(f"k {prev['k']:>2}→{r['k']:<2}  Δgroundedness {d_benefit:+.3f}  "
              f"Δcost \${d_cost:+.5f}  ttft {r['ttft_ms']}ms")
    prev = r

# k  1→3   Δgroundedness +0.147  Δcost $+0.00360  ttft  520ms
# k  3→5   Δgroundedness +0.041  Δcost $+0.00360  ttft  620ms
# k  5→8   Δgroundedness +0.009  Δcost $+0.00540  ttft  780ms
# k  8→12  Δgroundedness -0.004  Δcost $+0.00720  ttft  960ms   ⚠
# k 12→20  Δgroundedness -0.021  Δcost $+0.01440  ttft 1410ms   ⚠

# ⚠ MARGINAL BENEFIT GOES NEGATIVE AFTER k=8.
#   More context makes the answers WORSE — the relevant
#   passage is diluted among less relevant ones.
#
#   The team's monotonic assumption was true from 1 to 5,
#   marginal from 5 to 8, and false beyond that. Nobody had
#   measured it, and the production setting was k=12.

# WHERE TO STOP
#   k=5   groundedness 0.879 · $0.0093 · 620ms
#   k=8   groundedness 0.888 · $0.0147 · 780ms
#
#   The 5→8 step buys 0.009 groundedness for 58% more cost
#   and 26% more latency. Below our threshold for worth it.
#   → k=5, and revisit if reranking changes the shape.

# ⚠ THE AVERAGE WOULD HAVE SAID NOTHING.
#   "Average groundedness across settings: 0.86." Useless.
#   The DIFFERENCES between adjacent settings are the decision.`
    },
    prereq: ['opportunity-cost'], next: [],
    related: ['ai-cost', 'context-assembly', 'retrieval-topk', 'unit-economics', 'opportunity-cost'],
    tools: [],
    useCases: [
      'Choosing how much context to retrieve.',
      'Deciding how many review stages are worth having.',
      'Finding where an assumption stops being true.'
    ],
    avoid: [
      'Deciding marginal questions from average figures.',
      'Monotonic assumptions that have never been measured.'
    ],
    mistakes: [
      'Assuming more context is always better — it stops being true and then reverses.',
      'Using an average cost to answer a question about one more unit.',
      'Missing step changes in marginal cost, such as crossing a memory threshold.',
      'Measuring one setting and defending it rather than measuring several.'
    ],
    keyTerms: [
      ['marginal cost', 'The cost of one additional unit.'],
      ['marginal benefit', 'The value of one additional unit.'],
      ['diminishing returns', 'Marginal benefit falling as units increase.'],
      ['negative marginal benefit', 'Where more makes things worse.'],
      ['step change', 'A discontinuous jump in marginal cost.'],
      ['monotonic assumption', '"More is better", usually untested.']
    ],
    resources: [
      ['Khan Academy — marginal analysis', 'https://www.khanacademy.org/economics-finance-domain/microeconomics', 'course'],
      ['CORE Econ — The Economy', 'https://www.core-econ.org/the-economy/', 'course'],
      ['Anthropic — prompt engineering overview', 'https://docs.anthropic.com/en/docs/build-with-claude/prompt-engineering/overview', 'docs']
    ],
    questions: [
      ['Why do averages give the wrong answer to marginal questions?', 'An average cost per query does not tell you what two more chunks cost or gain. The decision needs the difference between adjacent settings, not the mean across them.'],
      ['Where does marginal benefit go negative in retrieval?', 'Past a point, additional chunks dilute the relevant passage among less relevant ones and groundedness falls. In one measured case the crossing was around eight chunks, with production running at twelve.'],
      ['What is the trap of a monotonic assumption?', '"More context is better" and "more review is safer" are true at first and false eventually. The crossing point is a measurable number, and assuming rather than measuring it is the error.']
    ]
  }
];
