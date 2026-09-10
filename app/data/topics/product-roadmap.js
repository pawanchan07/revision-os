/**
 * DOMAIN R — PRODUCT MANAGEMENT, part 3 of 6: deciding what and when
 */
export const topics = [
  {
    id: 'prioritization',
    title: 'Prioritization',
    domain: 'product', tier: 1, priority: 'high',
    summary: 'Deciding what not to do, in a way you can defend six months later.',
    what: `Prioritisation is ordering work by expected value against cost and risk. The output is a sequence, and the meaningful part of it is everything you have decided not to do yet.`,
    why: `Capacity is fixed and demand is not. Without an explicit method, order is set by whoever escalated most recently, which produces a roadmap nobody can explain and a team that never finishes anything important.`,
    analogy: `Triage in an emergency department. The method is not about being fair to arrivals; it is about the fact that treating in arrival order kills people.`,
    technical: `Common frameworks, and what each is actually good for:

**RICE** (Reach × Impact × Confidence ÷ Effort) — good when you have enough data to estimate reach and impact honestly. The confidence term is what makes it usable, because it penalises speculative bets rather than pretending they are certain.

**Value vs Effort** — a two-by-two. Crude, fast, and adequate for most decisions. Its weakness is that it hides risk.

**Weighted scoring** — explicit criteria with weights. Best when stakeholders disagree about what matters, because it moves the argument to the weights, where it belongs.

**Cost of delay / WSJF** — what does waiting cost? Strong for time-sensitive work like compliance deadlines and seasonal opportunities.

**None of them decide for you.** Their value is making the inputs explicit so the argument is about estimates rather than volume. A framework that produces a number nobody believes has still done its job if it exposed that two people meant different things by "impact".

**For AI work, add confidence explicitly and weight it heavily.** Feasibility is genuinely uncertain, so a high-value item with unproven feasibility should sort below a lower-value certain one — or, better, be replaced on the roadmap by the spike that resolves the uncertainty.`,
    diagram: `
   FRAMEWORKS AND WHAT EACH IS FOR

     RICE              Reach × Impact × Confidence ÷ Effort
                       when you have data to estimate honestly
                       ← the CONFIDENCE term penalises speculation

     VALUE vs EFFORT   a 2x2. crude, fast, adequate
                       weakness: hides risk

     WEIGHTED SCORING  explicit criteria + weights
                       when stakeholders disagree about what matters
                       ← moves the argument to the WEIGHTS

     COST OF DELAY     what does waiting cost?
                       compliance deadlines · seasonal windows

   ⚠ NONE OF THEM DECIDE FOR YOU

     the value is making INPUTS EXPLICIT so the argument is
     about estimates rather than volume

     a score nobody believes has still done its job if it
     revealed that two people meant different things by "impact"

   ⚠ FOR AI WORK, WEIGHT CONFIDENCE HEAVILY

     feasibility is genuinely uncertain

       high value + unproven feasibility
         should sort BELOW
       lower value + certain

       or better: replace the item on the roadmap with
       THE SPIKE THAT RESOLVES THE UNCERTAINTY
       — a 3-day spike is a cheaper roadmap item than a
         6-week bet on an unknown

   THE OUTPUT THAT MATTERS

     not the list of what you are doing
     the list of what you are NOT doing YET, and why`,
    example: {
      language: 'python',
      caption: 'RICE with the confidence term doing real work',
      code: `def rice(name, reach, impact, confidence, effort_weeks):
    """reach: users/quarter · impact: 0.25-3 · confidence: 0-1"""
    return {"item": name,
            "score": round(reach * impact * confidence / effort_weeks),
            "confidence": confidence}

BACKLOG = [
    rice("policy assistant (full)",    reach=60,  impact=3.0,
         confidence=0.30,              effort_weeks=8),
    rice("policy assistant SPIKE",     reach=60,  impact=3.0,
         confidence=0.90,              effort_weeks=0.6),
    rice("rank handbook search",       reach=60,  impact=1.5,
         confidence=0.90,              effort_weeks=2),
    rice("thread commitment extract",  reach=60,  impact=2.0,
         confidence=0.50,              effort_weeks=4),
    rice("dark mode",                  reach=200, impact=0.25,
         confidence=1.00,              effort_weeks=1),
]

for r in sorted(BACKLOG, key=lambda r: -r["score"]):
    flag = "  ⚠ low confidence" if r["confidence"] < 0.5 else ""
    print(f'{r["score"]:>4}  {r["item"]:<28} c={r["confidence"]:.2f}{flag}')

#  270  policy assistant SPIKE        c=0.90
#   68  rank handbook search          c=0.90
#   50  dark mode                     c=1.00
#   45  policy assistant (full)       c=0.30  ⚠ low confidence
#   15  thread commitment extract     c=0.50  ⚠ low confidence

# ⚠ THE SPIKE OUTSCORES THE FEATURE BY 6x.
#   Same reach, same impact — but three days instead of eight
#   weeks, and it converts a 0.30 confidence into a real number.
#   That is almost always the right first move on AI work.
#
#   Note also that dark mode beats the full assistant, which
#   feels wrong and is arithmetically correct given a 0.30
#   confidence. The fix is not to overrule the score. It is to
#   run the spike and re-score honestly next week.

# ── THE ARTEFACT THAT ACTUALLY MATTERS ─────────────────────
NOT_DOING_YET = {
    "thread commitment extract":
        "blocked on the same feasibility question as the assistant. "
        "Re-score after the spike (week of 8 Sep).",
    "dark mode":
        "scores well on effort but reach is inflated — 200 is all "
        "users, not users who asked. Revisit if it recurs in support.",
}
# Six months from now, this dict is the only thing that will
# explain why the roadmap looked the way it did.`
    },
    prereq: ['opportunity-sizing'], next: ['roadmap'],
    related: ['product-strategy', 'product-tradeoffs', 'backlog-management', 'ai-feasibility'],
    tools: [],
    useCases: [
      'Ordering a backlog defensibly.',
      'Resolving stakeholder disagreement by arguing about weights rather than outcomes.',
      'Deciding to run a spike instead of committing to a feature.'
    ],
    avoid: [
      'Frameworks used to produce authority rather than clarity.',
      'Prioritising by escalation volume.'
    ],
    mistakes: [
      'Treating the score as the decision rather than as an argument structure.',
      'Omitting confidence, which makes speculative AI work look equal to certain work.',
      'Not recording why items were declined, so the same debate recurs quarterly.',
      'Inflating reach by counting all users rather than affected users.'
    ],
    keyTerms: [
      ['RICE', 'Reach × Impact × Confidence ÷ Effort.'],
      ['confidence', 'How sure you are of the estimate. Decisive for AI work.'],
      ['cost of delay', 'What waiting costs; drives time-sensitive ordering.'],
      ['WSJF', 'Weighted shortest job first — cost of delay over duration.'],
      ['weighted scoring', 'Explicit criteria with agreed weights.'],
      ['spike', 'A short investigation that converts uncertainty into a number.']
    ],
    resources: [
      ['Intercom — RICE prioritisation', 'https://www.intercom.com/blog/rice-simple-prioritization-for-product-managers/', 'article'],
      ['Marty Cagan — product roadmaps', 'https://www.svpg.com/product-roadmaps/', 'article'],
      ['Scaled Agile — WSJF', 'https://framework.scaledagile.com/wsjf', 'reference']
    ],
    questions: [
      ['What is a prioritisation framework actually for?', 'Making inputs explicit so the argument is about estimates rather than about who escalated loudest. A score nobody believes still helped if it revealed two people meant different things by impact.'],
      ['Why weight confidence heavily for AI work?', 'Feasibility is genuinely uncertain, so a high-value item with unproven feasibility should sort below a certain lower-value one — or be replaced by the spike that resolves the uncertainty.'],
      ['What is the most valuable artefact of prioritisation?', 'The record of what you decided not to do yet and why. It is what prevents the same debate recurring every quarter.']
    ],
    interview: {
      s30: 'Prioritisation is ordering work by expected value against cost and risk, and the output I care about most is the explicit record of what we decided not to do and why.',
      s90: 'I use RICE, but the term I lean on hardest is confidence, and that matters disproportionately for AI work. A feature with huge potential impact and thirty percent confidence in feasibility should not outrank a smaller certain win — and when I score it honestly, it does not. What usually happens is that the three-day spike scores several times higher than the eight-week feature, because it has the same reach and impact at a fraction of the effort and it converts the uncertainty into a real number. So the roadmap item becomes the spike. I have had that produce a result that felt wrong — dark mode outranking our flagship AI feature — and the right response was not to overrule the score, it was to run the spike and re-score the next week with a confidence figure we believed.'
    }
  },

  {
    id: 'roadmap',
    title: 'Roadmap',
    domain: 'product', tier: 2, priority: 'high',
    summary: 'A communication artefact about intent and sequence — not a delivery contract.',
    what: `A roadmap communicates what a team intends to work on, in what order, and why. It is a statement of current intent that changes as evidence arrives.`,
    why: `Everyone outside the team needs to plan around what you will do. A roadmap that is honest about confidence lets them plan appropriately; one that reads as a set of dated promises destroys credibility the first time reality intervenes.`,
    analogy: `A weather forecast rather than a train timetable. Nobody is angry when a ten-day forecast changes, because the format communicates its own uncertainty.`,
    technical: `The formats, in increasing honesty:
- **Dated feature list** — reads as a contract, breaks, damages trust. Appropriate only for genuinely fixed commitments like compliance deadlines.
- **Now / Next / Later** — the common default. Communicates sequence without implying precision on dates.
- **Outcome-based** — organised by the problem being solved and the metric expected to move, with solutions listed as current hypotheses. The most honest and the hardest to sell to stakeholders who want dates.

**Confidence should be visible.** Now items are committed and scoped; Next items are directionally agreed; Later items are problems, not solutions. Marking that explicitly prevents a Later item from being quoted back as a promise.

**For AI work, put the uncertainty on the roadmap itself.** A roadmap that reads "Q3: AI policy assistant" hides the fact that feasibility is unproven. "Q3: prove we can answer policy questions at under 2% error — then build" is both more honest and easier to defend when the answer turns out to be no.

Changing a roadmap is not a failure. Changing it without saying why is.`,
    diagram: `
   FORMATS, IN INCREASING HONESTY

     DATED FEATURE LIST
       "AI assistant — 15 Sep"
       reads as a CONTRACT · breaks · damages trust
       appropriate only for genuinely fixed commitments

     NOW / NEXT / LATER            ← the common default
       communicates sequence without implying date precision

     OUTCOME-BASED                 ← most honest, hardest to sell
       organised by PROBLEM and the METRIC expected to move
       solutions listed as current hypotheses

   MAKE CONFIDENCE VISIBLE

     NOW      committed · scoped · being built
     NEXT     directionally agreed · not scoped
     LATER    PROBLEMS, not solutions
              └─ marking this prevents a Later item being
                 quoted back at you as a promise

   ⚠ FOR AI WORK, PUT THE UNCERTAINTY ON THE ROADMAP

     ✗  "Q3: AI policy assistant"
        hides that feasibility is unproven

     ✓  "Q3: prove policy answers at <2% error — then build"
        honest, and defensible when the answer is no

   CHANGING A ROADMAP IS NOT A FAILURE.
   CHANGING IT WITHOUT SAYING WHY IS.`,
    example: {
      language: 'text',
      caption: 'The same quarter, three ways',
      code: `DATED FEATURE LIST — how trust gets destroyed
─────────────────────────────────────────────────────────────
  15 Aug   AI policy assistant
  01 Sep   Thread summariser
  20 Sep   Agent dashboard

  Sales quotes these dates to three enterprise accounts.
  The assistant spike returns 8% confidently-wrong answers.
  Now the choice is: ship something harmful, or break a
  promise that was never yours to make.


NOW / NEXT / LATER — the workable default
─────────────────────────────────────────────────────────────
  NOW      (committed, in build)
    · Ranked handbook search — relevance, not coverage
    · Policy-answer feasibility spike

  NEXT     (agreed direction, not scoped)
    · Policy answers with mandatory citation
      — conditional on the spike clearing <2% error

  LATER    (problems, not solutions)
    · Agents lose context on twice-escalated threads
    · Ops cannot see overnight failures until 09:00

  ⚠ note LATER contains no features. Nothing there can be
    quoted back as a commitment.


OUTCOME-BASED — the most honest
─────────────────────────────────────────────────────────────
  OUTCOME   repeat contacts from escalated threads: 30/wk → 10/wk

    Hypothesis 1  agents cannot find policy answers
                  → ranked search        (in build)
                  → cited answers        (blocked on spike)
    Hypothesis 2  commitments made earlier get lost
                  → extract commitments  (not started, unvalidated)

    We will know by   week of 8 Sep whether hypothesis 1 holds.
    If it does not    we stop and re-open discovery.

  ⚠ THIS FORMAT MAKES "WE WERE WRONG" A NORMAL OUTCOME
    rather than a missed date. That is the whole point.`
    },
    prereq: ['prioritization'], next: ['product-strategy'],
    related: ['product-strategy', 'sprint-planning', 'ai-rollout', 'north-star-metric'],
    tools: [],
    useCases: [
      'Communicating intent to stakeholders who must plan around you.',
      'Making feasibility uncertainty visible before it becomes a broken promise.',
      'Giving sales something they can say without over-committing.'
    ],
    avoid: [
      'Dated feature lists for work whose feasibility is unproven.',
      'Later items expressed as specific features.'
    ],
    mistakes: [
      'Treating the roadmap as a delivery contract.',
      'Hiding feasibility risk behind a confident feature name.',
      'Changing the roadmap silently, which is what actually destroys trust.',
      'Putting solutions in Later, where they get quoted back as commitments.'
    ],
    keyTerms: [
      ['Now / Next / Later', 'Sequence without date precision.'],
      ['outcome-based roadmap', 'Organised by problem and metric, not feature.'],
      ['commitment', 'A dated promise. Use sparingly and deliberately.'],
      ['hypothesis', 'A proposed solution not yet validated.'],
      ['confidence band', 'Explicit marking of how firm each item is.'],
      ['roadmap change log', 'The record of what changed and why.']
    ],
    resources: [
      ['Marty Cagan — product roadmaps', 'https://www.svpg.com/product-roadmaps/', 'article'],
      ['ProductPlan — roadmap formats', 'https://www.atlassian.com/agile/product-management/product-roadmaps', 'reference'],
      ['Melissa Perri — outcome-based roadmaps', 'https://melissaperri.com/blog/2016/07/14/what-is-good-product-strategy', 'article']
    ],
    questions: [
      ['Why is a dated feature list usually the wrong roadmap format?', 'It reads as a contract. When reality intervenes — as it does especially with unproven AI feasibility — the choice becomes shipping something inadequate or breaking a promise, and trust is lost either way.'],
      ['What should Later items contain?', 'Problems, not solutions. A feature named in Later will be quoted back as a commitment; a problem statement cannot be.'],
      ['How should AI feasibility risk appear on a roadmap?', 'Explicitly, as the thing being proven. "Prove policy answers at under 2% error, then build" is honest and defensible; "AI policy assistant" hides that the answer might be no.']
    ]
  },

  {
    id: 'product-strategy',
    title: 'Product Strategy',
    domain: 'product', tier: 1, priority: 'high',
    summary: 'A diagnosis, a choice about where to play, and the small set of things that follow from it.',
    what: `Product strategy is a coherent explanation of which customers you serve, what problem you solve for them, why you are positioned to solve it, and — crucially — what you are therefore not doing.`,
    why: `Without one, prioritisation has no reference point and every quarter is decided by whoever argues best. Strategy is what makes it possible to say no to a good idea, which is the only kind of no that is hard.`,
    analogy: `A military campaign plan rather than a wish list of objectives. The plan's value is in what it declines to defend.`,
    technical: `A usable strategy has three parts (Rumelt's kernel):
- **Diagnosis** — what is actually going on. Where the leverage is, what the constraint is. Most strategy documents skip this and are unusable as a result.
- **Guiding policy** — the approach chosen in response. Broad, but it rules things out.
- **Coherent actions** — a small set of mutually reinforcing moves.

The test: **does it rule anything out?** A strategy that permits every plausible action is a mission statement. "Be the leading platform for X" rules out nothing.

Common failures: **goals mistaken for strategy** ("grow revenue 40%" is a target, not a plan); **a list of initiatives** with no thesis connecting them; and **strategy that never reaches the backlog**, existing only in a deck.

**For AI products specifically**, the strategic question that matters is where the durable advantage sits. Model capability is not a moat — it is available to competitors on the same terms and improves for everyone simultaneously. Advantage sits in **proprietary data, workflow integration, distribution, and the evaluation infrastructure that lets you improve faster than competitors can.** A strategy premised on having a better model is a strategy with an expiry date.`,
    diagram: `
   THE KERNEL (Rumelt)

     DIAGNOSIS        what is actually going on
                      where the leverage is · what constrains us
                      ← most strategy docs SKIP this and are
                        unusable as a result

     GUIDING POLICY   the approach chosen in response
                      broad, but it RULES THINGS OUT

     COHERENT ACTIONS a small set of mutually reinforcing moves

   ⚠ THE TEST: DOES IT RULE ANYTHING OUT?

     "be the leading platform for X"   rules out nothing
                                       → mission statement, not strategy

     if every plausible action is still permitted,
     you have not made a choice

   COMMON FAILURES

     goals as strategy      "grow revenue 40%" is a TARGET
     a list of initiatives  no thesis connecting them
     deck-only strategy     never reaches the backlog

   ⚠ FOR AI PRODUCTS: WHERE IS THE DURABLE ADVANTAGE?

     NOT a moat                    IS a moat
     ────────────                  ─────────
     model capability              proprietary data
       available to competitors    workflow integration
       on the same terms           distribution
       improves for everyone       EVALUATION INFRASTRUCTURE
       simultaneously                └─ lets you improve faster
                                        than competitors can

     a strategy premised on having a better model
     has an EXPIRY DATE`,
    example: {
      language: 'text',
      caption: 'A strategy that rules things out, and one that does not',
      code: `NOT A STRATEGY
─────────────────────────────────────────────────────────────
  "We will be the leading AI-powered customer support platform,
   delivering best-in-class experiences through cutting-edge
   models and delighting customers at every touchpoint."

  Rules out: nothing. Every possible initiative is consistent
  with this. It cannot decline a single request.


A STRATEGY
─────────────────────────────────────────────────────────────
  DIAGNOSIS
    Our advantage is not model quality — competitors call the
    same APIs we do, and capability improves for all of us at
    the same time. What we have that they do not is six years
    of resolved tickets with outcome labels, and an installed
    position inside the agent console.
    The constraint is TRUST: agents abandon assistive features
    after two confidently wrong answers, and we have no
    infrastructure to measure that before shipping.

  GUIDING POLICY
    Compete on verified correctness inside the existing agent
    workflow, not on breadth of capability.

  COHERENT ACTIONS
    1  Build the evaluation harness first — golden set from our
       own resolved tickets, scored on groundedness and abstention.
    2  Ship only features that can cite their source and decline.
    3  Stay inside the console. No standalone app.
    4  Convert the ticket archive into a labelled retrieval corpus.

  WHAT THIS RULES OUT — and this is the valuable part
    ✗ a customer-facing chatbot        (we cannot verify, and
                                        the cost of error is
                                        a customer, not an agent)
    ✗ fine-tuning a base model         (capability is not our moat;
                                        it burns the team on the
                                        one axis competitors match)
    ✗ a standalone assistant app       (abandons our distribution)
    ✗ expanding to sales enablement    (different data, no archive,
                                        no installed position)

  ⚠ EACH OF THOSE FOUR IS A GOOD IDEA.
    Declining good ideas is the only hard part of strategy,
    and it is only possible once the diagnosis is written down.`
    },
    prereq: ['prioritization'], next: [],
    related: ['roadmap', 'ai-build-vs-buy', 'competitive-advantage', 'north-star-metric', 'ai-use-case-selection'],
    tools: [],
    useCases: [
      'Declining a good idea with a reason the team accepts.',
      'Deciding where to invest for durable advantage.',
      'Giving prioritisation a reference point.'
    ],
    avoid: [
      'Strategy documents with no diagnosis.',
      'Premising an AI strategy on model capability.'
    ],
    mistakes: [
      'Mistaking goals or targets for strategy.',
      'Writing a strategy that rules nothing out.',
      'Skipping the diagnosis, which is what makes the policy defensible.',
      'Assuming model quality is a moat when competitors call the same APIs.'
    ],
    keyTerms: [
      ['diagnosis', 'What is actually going on; where the leverage and constraint are.'],
      ['guiding policy', 'The chosen approach; rules things out.'],
      ['coherent actions', 'Mutually reinforcing moves that follow from the policy.'],
      ['moat', 'A durable advantage competitors cannot quickly copy.'],
      ['strategic no', 'Declining a good idea because it is off-thesis.'],
      ['evaluation infrastructure', 'The AI-era advantage: improving faster than competitors.']
    ],
    resources: [
      ['Rumelt — Good Strategy Bad Strategy (summary)', 'https://hbr.org/1996/11/what-is-strategy', 'article'],
      ['Melissa Perri — what is good product strategy', 'https://melissaperri.com/blog/2016/07/14/what-is-good-product-strategy', 'article'],
      ['Marty Cagan — product strategy', 'https://www.svpg.com/product-strategy-overview/', 'article']
    ],
    questions: [
      ['What is the test for whether something is a strategy?', 'Does it rule anything out? If every plausible action remains consistent with it, no choice has been made and it is a mission statement.'],
      ['Why is model capability not a moat?', 'Competitors call the same APIs and capability improves for everyone simultaneously. Durable advantage sits in proprietary data, workflow integration, distribution and evaluation infrastructure.'],
      ['What do most strategy documents omit?', 'The diagnosis — what is actually going on, where the leverage is, what constrains you. Without it the guiding policy is arbitrary and cannot be defended when challenged.']
    ],
    interview: {
      s30: 'Product strategy is a diagnosis of what is actually going on, a guiding policy in response, and a small set of coherent actions. The test is whether it rules anything out.',
      s90: 'For AI products the diagnosis usually has to confront an uncomfortable fact, which is that model capability is not a moat. Competitors call the same APIs, and everyone gets better at the same time. So a strategy premised on having a better model has an expiry date built into it. The advantages that actually hold are proprietary data, integration into a workflow people already live in, distribution, and — the one teams underrate — evaluation infrastructure, because that is what determines how fast you can improve relative to a competitor. On a support product I worked through, the strategic consequence was declining four genuinely good ideas: a customer-facing chatbot, fine-tuning, a standalone app, and expansion into sales. Each was defensible on its own. Declining them was only possible because the diagnosis was written down, and that is the part most strategy documents skip.'
    }
  }
];
