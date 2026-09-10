/**
 * DOMAIN U — STRATEGY + BUSINESS, part 1: market and position
 * (BUILD.md section 24)
 */
export const topics = [
  {
    id: 'market-sizing',
    title: 'Market Sizing — TAM, SAM, SOM',
    domain: 'strategy', tier: 2, priority: 'medium',
    summary: 'Three nested estimates of how big the opportunity is, and why the third is the only honest one.',
    what: `**TAM** (total addressable market) is everyone who could conceivably buy. **SAM** (serviceable addressable market) is the part your product and reach could actually serve. **SOM** (serviceable obtainable market) is what you could realistically win in a defined period.`,
    why: `The numbers get used to justify investment, and a TAM figure with no SOM behind it justifies anything. The value of the exercise is the assumptions it forces you to write down, not the number it produces.`,
    analogy: `Everyone in the city who eats (TAM), everyone within delivery range who eats your cuisine (SAM), and everyone you can realistically serve next year given the kitchen (SOM).`,
    technical: `Two methods, and you should do both:

**Top-down** — start from an industry figure and narrow by segment. Fast, and inherits whatever assumptions the analyst made.

**Bottom-up** — number of potential customers × what each would pay × realistic penetration. Slower, and every input is arguable, which is the point.

**When the two disagree by an order of magnitude, the bottom-up one is usually closer** and the gap is where the interesting question is.

**SOM is where the honesty lives.** TAM is a large number that impresses nobody who has seen many of them. SOM requires stating your reach, your conversion rate and your capacity, all of which can be checked.

**For AI products the sizing has a specific trap: the willingness-to-pay assumption.** Because model capability is broadly available, a competitor can offer a similar capability quickly, so a sizing built on "everyone who has this problem will pay us $X" ignores that the price is under downward pressure from the moment you launch. Size on what your *differentiated* layer is worth — the data, the workflow integration, the trust — not on what the capability is worth.`,
    diagram: `
   THREE NESTED ESTIMATES

     ┌─────────────────────────────────────────┐
     │ TAM   everyone who could conceivably buy │
     │  ┌───────────────────────────────────┐   │
     │  │ SAM  who your product and reach   │   │
     │  │      could actually serve         │   │
     │  │   ┌─────────────────────────┐     │   │
     │  │   │ SOM  what you could     │     │   │
     │  │   │   realistically WIN     │     │   │
     │  │   │   in a defined period   │     │   │
     │  │   └─────────────────────────┘     │   │
     │  └───────────────────────────────────┘   │
     └─────────────────────────────────────────┘

   TWO METHODS — do both

     TOP-DOWN    industry figure, narrowed by segment
                 fast · inherits the analyst's assumptions

     BOTTOM-UP   customers × price × penetration
                 slow · every input is arguable ← the point

     ⚠ when they disagree by 10x, bottom-up is usually closer
       and the GAP is the interesting question

   ⚠ SOM IS WHERE THE HONESTY LIVES

     TAM impresses nobody who has seen many of them
     SOM requires stating reach, conversion and capacity
     — all of which can be checked

   ⚠ THE AI-SPECIFIC TRAP: WILLINGNESS TO PAY

     capability is broadly available → a competitor can
     match it quickly → price is under downward pressure
     from the day you launch

     size on what your DIFFERENTIATED layer is worth
       data · workflow integration · trust
     not on what the CAPABILITY is worth`,
    example: {
      language: 'python',
      caption: 'Top-down and bottom-up, and what the gap revealed',
      code: `# PRODUCT  an AI policy assistant sold to support organisations

# ── TOP-DOWN ───────────────────────────────────────────────
top_down = {
    "global customer service software":  58_000_000_000,
    "× AI-assist segment share":          0.08,
    "× our geography (India + SEA)":      0.06,
    "× mid-market (our segment)":         0.35,
}
tam_td = 58e9 * 0.08 * 0.06 * 0.35
print(f"top-down SAM: \${tam_td/1e6:.0f}M")     # $97M

# ── BOTTOM-UP ──────────────────────────────────────────────
bottom_up = {
    "mid-market support orgs in region":  4_200,
    "× have >30 agents (our threshold)":     0.45,
    "× would consider a new vendor/yr":      0.15,
    "annual contract value":              18_000,
}
sam_bu = 4200 * 0.45 * 18_000
som    = 4200 * 0.45 * 0.15 * 18_000
print(f"bottom-up SAM: \${sam_bu/1e6:.0f}M")    # $34M
print(f"SOM (year 1, 8% win rate): \${som*0.08/1e6:.1f}M")  # $0.4M

# ⚠ THE GAP: $97M top-down vs $34M bottom-up.
#   Nearly 3x. The bottom-up number is built from a customer
#   count we can name and a contract value we have quoted.
#   The top-down number inherits four multipliers we invented.
#
#   The interesting question is not "which is right" — it is
#   WHY they differ. Here: the top-down figure counts support
#   orgs with fewer than 30 agents, for whom the product does
#   not pay for itself. That is a real segment boundary the
#   top-down method cannot see.

# ── ⚠ THE PRICE PRESSURE TEST ──────────────────────────────
def with_price_pressure(acv, years, annual_decline):
    return [round(acv * (1 - annual_decline) ** y) for y in range(years)]

print(with_price_pressure(18_000, 4, 0.18))
# [18000, 14760, 12103, 9924]
#
# ⚠ If our value proposition is "AI answers policy questions",
#   the capability is commoditising and ~18%/yr price erosion
#   is optimistic, not pessimistic.
#
#   If it is "answers grounded in YOUR six years of resolved
#   tickets, inside the console your agents already use, with
#   an evaluation harness you own" — that is not commoditising
#   at the same rate, because it is not the model.
#
#   The sizing exercise's real output was that sentence.`
    },
    prereq: [], next: ['competitive-analysis'],
    related: ['opportunity-sizing', 'unit-economics', 'pricing', 'product-strategy'],
    tools: [],
    useCases: [
      'Justifying investment in a new product line.',
      'Finding a segment boundary a top-down estimate cannot see.',
      'Testing whether a value proposition is commoditising.'
    ],
    avoid: [
      'TAM figures presented without a bottom-up SOM.',
      'Sizing built on the value of a widely available capability.'
    ],
    mistakes: [
      'Quoting TAM as though it were reachable revenue.',
      'Using only top-down, which inherits assumptions you cannot inspect.',
      'Ignoring price erosion on capabilities competitors can match.',
      'Treating the number as the output rather than the assumptions.'
    ],
    keyTerms: [
      ['TAM', 'Total addressable market — everyone who could buy.'],
      ['SAM', 'Serviceable addressable market — who you could serve.'],
      ['SOM', 'Serviceable obtainable market — what you could win.'],
      ['top-down sizing', 'Narrowing an industry figure by segment.'],
      ['bottom-up sizing', 'Customers × price × penetration.'],
      ['price erosion', 'Downward pressure on price as capability commoditises.']
    ],
    resources: [
      ['a16z — market sizing', 'https://en.wikipedia.org/wiki/Total_addressable_market', 'article'],
      ['Sequoia — market sizing', 'https://articles.sequoiacap.com/market-sizing', 'article'],
      ['Reforge — opportunity sizing', 'https://www.reforge.com/blog/opportunity-sizing', 'article']
    ],
    questions: [
      ['Why is bottom-up sizing more useful than top-down?', 'Every input is arguable and checkable — customer counts, contract values, penetration. Top-down inherits multipliers you cannot inspect, and a gap between the two usually points at a real segment boundary.'],
      ['What is the AI-specific trap in market sizing?', 'Sizing on what the capability is worth. Capability is broadly available and under price pressure from launch, so the sizing should rest on the differentiated layer — data, workflow integration, trust.'],
      ['What is the real output of a sizing exercise?', 'The assumptions it forces you to write down. A number without stated reach, conversion and capacity justifies anything.']
    ]
  },

  {
    id: 'competitive-analysis',
    title: 'Competitive Analysis',
    domain: 'strategy', tier: 2, priority: 'medium',
    summary: 'Understanding who you are actually competing with — usually not who you think.',
    what: `Competitive analysis maps who else solves the problem your customers have, how they solve it, and what that implies for your position.`,
    why: `Teams analyse the companies that look like them and ignore the alternatives customers actually use — a spreadsheet, a colleague, or doing nothing. Those are usually the real competition and the hardest to displace.`,
    analogy: `A restaurant studying other restaurants while its customers are cooking at home.`,
    technical: `**Define competition by the job, not by the category.** If customers hire a spreadsheet and a colleague, those are the competitors and their advantages are real — free, familiar, trusted, already integrated into how people work.

**Non-consumption is the most common competitor and the most underestimated.** Doing nothing has zero switching cost and no procurement process.

What to actually compare: how each alternative performs the job, what it costs including effort, what switching costs it carries, and what it cannot do.

**Feature-by-feature comparison tables are usually a distraction.** They lead to matching competitors rather than choosing a position, and a product that matches everything is differentiated by nothing.

**For AI products, the analysis has a specific shape.** Most competitors are calling the same models, so comparing capability is comparing the same thing. The meaningful axes are: whose data is better, whose workflow integration is deeper, who has distribution, and who can improve fastest — which comes back to evaluation infrastructure.

**Watch adjacent incumbents.** The platform your customers already use adding a passable version of your feature is the most common way a specialised AI product loses, and it does not require them to be better — only present.`,
    diagram: `
   ⚠ DEFINE COMPETITION BY THE JOB, NOT THE CATEGORY

     what you analyse       what customers actually use
     ────────────────       ───────────────────────────
     similar startups       a spreadsheet
     the category leader    asking a colleague
                            ⚠ DOING NOTHING

     non-consumption is the most common competitor
     and the most underestimated:
       zero switching cost · no procurement · no risk

   WHAT TO COMPARE

     how it performs the JOB
     what it costs INCLUDING EFFORT
     what switching costs it carries
     what it CANNOT do

   ⚠ FEATURE TABLES ARE USUALLY A DISTRACTION

     they lead to MATCHING competitors rather than
     choosing a position

     a product that matches everything is differentiated
     by nothing

   ⚠ FOR AI, CAPABILITY COMPARISON IS COMPARING THE SAME THING

     most competitors call the same models

     the meaningful axes:
       whose DATA is better
       whose WORKFLOW INTEGRATION is deeper
       who has DISTRIBUTION
       who can IMPROVE FASTEST   ← evaluation infrastructure

   ⚠ WATCH ADJACENT INCUMBENTS

     the platform your customers already use shipping a
     passable version of your feature is the most common
     way a specialised AI product loses

     it does not require them to be BETTER — only PRESENT`,
    example: {
      language: 'text',
      caption: 'The competitive map that changed the roadmap',
      code: `PRODUCT  AI policy assistant for support teams

WHAT THE FIRST ANALYSIS LOOKED AT
  · three AI-support startups
  · one category leader
  Conclusion: "we have better citations and abstention"
  ⚠ Nobody in this list was why we lost deals.

WHAT CUSTOMERS ACTUALLY USE — from 11 interviews
  ┌──────────────────┬──────────────────────────────────────┐
  │ ALTERNATIVE      │ WHY IT WINS                          │
  ├──────────────────┼──────────────────────────────────────┤
  │ Ask a colleague  │ free · trusted · always right ·      │
  │                  │ zero setup. ⚠ THE REAL COMPETITOR    │
  │                  │ Weakness: 6-7 min, and she takes     │
  │                  │ leave                                │
  ├──────────────────┼──────────────────────────────────────┤
  │ Handbook search  │ already deployed · no procurement    │
  │                  │ Weakness: unranked, nobody scrolls   │
  │                  │ past result 3                        │
  ├──────────────────┼──────────────────────────────────────┤
  │ Doing nothing    │ "I'll get back to you"               │
  │ (non-consumption)│ zero cost to the agent               │
  │                  │ ⚠ cost lands on the CUSTOMER, which  │
  │                  │ is why it persists                   │
  ├──────────────────┼──────────────────────────────────────┤
  │ ⚠ The console    │ ALREADY INSTALLED. Already trusted.  │
  │ vendor's own     │ Bundled at no extra line item.       │
  │ AI feature       │ Does not need to be better.          │
  │                  │ Only needs to be PRESENT.            │
  └──────────────────┴──────────────────────────────────────┘

⚠ THE FINDING THAT MATTERED
  Our dangerous competitor was not another AI startup. It was
  the console vendor bundling a passable assistant. They win
  on distribution regardless of quality.

  Our answer could not be "be better at answering questions" —
  they can match that by calling the same model.

STRATEGIC RESPONSE
  Compete where distribution does not decide:
    · their version cannot use six years of OUR customers'
      resolved tickets — that data is per-tenant and we have
      the pipeline
    · their version will not abstain, because abstention looks
      bad in a bundled demo and they are not accountable for
      an incorrect refund commitment
    · we can ship an evaluation harness the customer OWNS,
      which a bundled feature structurally will not

  → the roadmap changed from "more capabilities" to
    "deeper use of tenant data + customer-owned evaluation"

⚠ THE FEATURE TABLE WOULD HAVE SENT US THE OTHER WAY —
  toward matching the bundled feature's capability list,
  on the one axis where we cannot win.`
    },
    prereq: ['market-sizing'], next: ['competitive-advantage'],
    related: ['jtbd', 'product-strategy', 'competitive-advantage', 'switching-costs'],
    tools: [],
    useCases: [
      'Finding the alternative customers actually use.',
      'Identifying the adjacent incumbent that is the real threat.',
      'Choosing a position rather than matching a feature list.'
    ],
    avoid: [
      'Feature-by-feature comparison tables as the primary artefact.',
      'Analysing only companies in your category.'
    ],
    mistakes: [
      'Ignoring non-consumption, which is the most common competitor.',
      'Comparing AI capability when competitors call the same models.',
      'Missing the adjacent incumbent who wins on distribution alone.',
      'Matching a competitor’s features and ending up differentiated by nothing.'
    ],
    keyTerms: [
      ['job-defined competition', 'Competitors are whatever else gets hired for the job.'],
      ['non-consumption', 'Doing nothing. Zero switching cost.'],
      ['adjacent incumbent', 'A platform customers already use that could add your feature.'],
      ['distribution advantage', 'Winning by already being installed.'],
      ['positioning', 'Choosing where to compete rather than matching.'],
      ['feature parity trap', 'Matching everything and differentiating on nothing.']
    ],
    resources: [
      ['Christensen — jobs to be done', 'https://hbr.org/2016/09/know-your-customers-jobs-to-be-done', 'article'],
      ['Porter — the five competitive forces', 'https://hbr.org/2008/01/the-five-competitive-forces-that-shape-strategy', 'article'],
      ['a16z — competitive moats', 'https://a16z.com/', 'reference']
    ],
    questions: [
      ['Who is usually the real competitor?', 'Whatever customers currently hire for the job — a spreadsheet, a colleague, or doing nothing. Non-consumption has zero switching cost and no procurement process, which makes it very hard to displace.'],
      ['Why is comparing AI capability usually pointless?', 'Most competitors call the same models, so capability is the same thing on both sides. The meaningful axes are data, workflow integration, distribution and how fast you can improve.'],
      ['What is the most common way a specialised AI product loses?', 'An adjacent incumbent — the platform customers already use — ships a passable bundled version. It does not need to be better, only present.']
    ]
  },

  {
    id: 'competitive-advantage',
    title: 'Competitive Advantage & Moats',
    domain: 'strategy', tier: 1, priority: 'high',
    summary: 'What stops a competitor copying you — and why model quality is not on the list.',
    what: `A competitive advantage is something that lets you deliver more value or at lower cost than competitors. A moat is an advantage that persists, because copying it is expensive, slow or structurally impossible.`,
    why: `Everything else in strategy depends on this question. An advantage that a competitor can replicate in a quarter is a head start, not a position, and planning as though it were a position is how companies lose markets they created.`,
    analogy: `A head start in a race versus a shorter route. The first is consumed as you run; the second stays yours.`,
    technical: `The durable sources:
- **Network effects** — the product improves as more people use it. The strongest and the rarest.
- **Switching costs** — leaving is expensive in data, workflow, training or integration.
- **Proprietary data** — data you have that competitors cannot obtain, that measurably improves the product.
- **Scale economics** — unit costs fall as you grow.
- **Distribution** — you are already where the customer is.
- **Brand and trust** — expensive and slow to build, particularly in regulated contexts.
- **Regulatory position** — licences, certifications, approvals.

**For AI products specifically, four things are frequently mistaken for moats and are not:**
- **Model quality.** Available to competitors on the same terms and improving for everyone simultaneously.
- **Prompt engineering.** Copyable in an afternoon by anyone who sees the output.
- **Being first.** Consumed rapidly in a fast-moving field.
- **A fine-tuned model** on generic data. The base improves faster than your fine-tune, and often overtakes it.

**What is genuinely defensible:** proprietary data with a feedback loop, deep workflow integration that creates switching costs, distribution, and **evaluation infrastructure** — because it determines the *rate* at which you improve, which compounds in a way a static advantage does not.

The test: **if a well-funded competitor with the same model access started tomorrow, what would take them longest?** That is your moat. If the answer is "nothing much", you do not have one, and that is worth knowing.`,
    diagram: `
   DURABLE SOURCES

     NETWORK EFFECTS     improves as more people use it
                         strongest · rarest
     SWITCHING COSTS     leaving is expensive
     PROPRIETARY DATA    competitors cannot obtain it
     SCALE ECONOMICS     unit costs fall as you grow
     DISTRIBUTION        already where the customer is
     BRAND / TRUST       slow and expensive to build
     REGULATORY          licences · certifications

   ⚠ FOUR THINGS MISTAKEN FOR AI MOATS

     MODEL QUALITY       same terms for competitors
                         improves for everyone at once
     PROMPT ENGINEERING  copyable in an afternoon by
                         anyone who sees the output
     BEING FIRST         consumed rapidly in a fast field
     A FINE-TUNE ON      the base model improves faster
     GENERIC DATA        and often overtakes it

   WHAT IS GENUINELY DEFENSIBLE

     proprietary data WITH A FEEDBACK LOOP
     deep workflow integration → switching costs
     distribution
     ⚠ EVALUATION INFRASTRUCTURE
         it determines the RATE at which you improve
         a rate compounds; a static advantage does not

   THE TEST

     if a well-funded competitor with the same model access
     started TOMORROW, what would take them longest?

     that is your moat.

     if the answer is "nothing much", you do not have one —
     and that is worth knowing`,
    example: {
      language: 'text',
      caption: 'Auditing an advantage against the copy test',
      code: `CLAIM  "Our AI support assistant is differentiated."

APPLY THE TEST: a well-funded competitor with the same model
access starts tomorrow. How long for each element?

  our prompt engineering              1 day
    ⚠ visible in the output. Anyone can reconstruct it.

  our retrieval architecture          2 weeks
    standard techniques, published

  our model choice                    1 hour
    same API, same pricing page

  our UI and citation design          3 weeks
    ⚠ and it is visible, so they will copy the good parts

  ─────────────────────────────────────────────────────
  ⚠ everything above: under 6 weeks. NOT A MOAT.

  our customers' 6 years of resolved  CANNOT
  tickets with outcome labels           they do not have it,
                                        and cannot buy it

  our position inside the agent       12-18 months
  console (integration + contracts)     per customer, with
                                        procurement

  our 220-case golden set, per        6-12 months
  tenant, judged by that tenant's       ⚠ and it is not the
  support leads                           SET that is hard —
                                          it is the ongoing
                                          judgement relationship

  the error-review loop feeding        ⚠ COMPOUNDS
  regressions back weekly                every week it widens

  ─────────────────────────────────────────────────────

⚠ THE COMPOUNDING ONE IS THE REAL MOAT.
  Data and integration are static advantages — large, and
  they stop growing. The evaluation loop determines the RATE
  at which the product improves. A competitor starting today
  does not just start behind; they improve more slowly,
  because they cannot tell which changes helped.

STRATEGIC CONSEQUENCE
  Invest in the bottom three lines. Stop investing in the
  top four as differentiators — build them adequately and
  do not defend them.

  ⚠ This is uncomfortable, because the top four are where
    the visible product work is, and the bottom three are
    where none of it shows in a demo.`
    },
    prereq: ['competitive-analysis'], next: ['switching-costs', 'network-effects'],
    related: ['product-strategy', 'ai-build-vs-buy', 'golden-sets', 'switching-costs', 'network-effects'],
    tools: [],
    useCases: [
      'Testing whether an advantage is durable.',
      'Deciding where to invest for a position rather than a head start.',
      'Explaining why model quality is not a defensible strategy.'
    ],
    avoid: [
      'Treating prompt engineering or model choice as differentiation.',
      'Planning as though a head start were a position.'
    ],
    mistakes: [
      'Mistaking being first for a moat in a fast-moving field.',
      'Fine-tuning on generic data and being overtaken by the next base model.',
      'Investing in the visible layers and neglecting the compounding one.',
      'Never asking how long a competitor would need to copy each element.'
    ],
    keyTerms: [
      ['moat', 'An advantage that persists because copying it is hard.'],
      ['network effect', 'The product improves as more people use it.'],
      ['switching cost', 'What it costs a customer to leave.'],
      ['proprietary data', 'Data competitors cannot obtain.'],
      ['compounding advantage', 'One that widens over time, like improvement rate.'],
      ['copy test', 'How long a well-funded competitor would need.']
    ],
    resources: [
      ['Hamilton Helmer — 7 Powers (overview)', 'https://www.7powers.com/', 'reference'],
      ['a16z — the new business of AI', 'https://a16z.com/the-new-business-of-ai-and-how-its-different-from-traditional-software/', 'article'],
      ['Porter — competitive strategy', 'https://hbr.org/2008/01/the-five-competitive-forces-that-shape-strategy', 'article']
    ],
    questions: [
      ['What is the test for whether something is a moat?', 'If a well-funded competitor with the same model access started tomorrow, what would take them longest? Anything they could replicate in a quarter is a head start, not a position.'],
      ['Why is model quality not a moat?', 'It is available to competitors on identical terms and improves for everyone simultaneously. The same applies to prompt engineering, which is copyable in an afternoon from the visible output.'],
      ['Why is evaluation infrastructure the strongest AI advantage?', 'It determines the rate at which you improve, and a rate compounds. A competitor without it does not just start behind — they improve more slowly, because they cannot tell which changes helped.']
    ],
    interview: {
      s30: 'A moat is an advantage that persists because copying it is hard. For AI products, model quality, prompt engineering and being first are all head starts rather than moats — competitors have the same model access.',
      s90: 'The exercise I run is a copy test: a well-funded competitor with the same API access starts tomorrow, how long does each element take them? On a support assistant the answers were sobering — prompt engineering one day, retrieval architecture two weeks, model choice one hour, UI three weeks. Everything visible was under six weeks. What could not be copied was our customers\' six years of labelled resolved tickets, the console integration with its procurement cycle, and the per-tenant golden set with the support leads who judge it. And the one that actually matters is the last one, because it compounds — the evaluation loop determines how fast we improve, so a competitor starting today does not just start behind, they improve more slowly. The uncomfortable strategic consequence is to stop investing in the visible layers as differentiators, which is exactly where all the demo-able product work lives.'
    }
  }
];
