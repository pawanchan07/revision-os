/**
 * DOMAIN U — STRATEGY + BUSINESS, part 3: the numbers a PM is asked for
 */
export const topics = [
  {
    id: 'unit-economics',
    title: 'Unit Economics',
    domain: 'strategy', tier: 1, priority: 'high',
    summary: 'Whether one customer is profitable, before asking whether the business is.',
    what: `Unit economics is the revenue and cost associated with a single unit — usually one customer, sometimes one transaction — over its lifetime.`,
    why: `A business with negative unit economics gets worse as it grows. Aggregate revenue can rise convincingly while every additional customer deepens the loss, and that is only visible per unit.`,
    analogy: `Selling at a loss and hoping for volume. The arithmetic does not improve with scale; it compounds.`,
    technical: `The core quantities: **contribution margin** (revenue minus variable cost per unit), **CAC** (fully loaded cost of acquiring a customer), **LTV** (contribution margin over the customer's lifetime), and **payback period** (months to recover CAC).

**Variable cost is where AI products differ.** Conventional software has near-zero marginal cost, so contribution margin approaches gross revenue. An AI feature has real per-request cost, so contribution margin depends on usage — and usage rises with success.

**Include everything variable.** Inference, embedding, storage, support, payment processing, and the human review the system requires. The last is the one consistently omitted and it is often the largest.

**Gross margin at 85–90% is the software expectation.** AI-heavy products commonly run 55–75%, which is a real business and a different one, with different implications for how much you can spend to acquire a customer.

**Watch the trajectory, not the snapshot.** Model prices fall, which helps; context lengths and adoption grow, which does not. Model the direction, because the snapshot describes a moment that will not persist.

**Segment the economics.** A blended margin can conceal a segment that is unprofitable at any volume. Small accounts with heavy usage are the classic case.`,
    diagram: `
   THE CORE QUANTITIES

     CONTRIBUTION MARGIN   revenue − variable cost, per unit
     CAC                   fully loaded cost to acquire
     LTV                   contribution margin over lifetime
     PAYBACK               months to recover CAC

   ⚠ VARIABLE COST IS WHERE AI PRODUCTS DIFFER

     conventional software   marginal cost ≈ 0
                             margin ≈ gross revenue

     AI feature              real per-request cost
                             margin depends on USAGE
                             and usage rises WITH SUCCESS

   INCLUDE EVERYTHING VARIABLE

     inference · embedding · storage · support
     payment processing
     ⚠ HUMAN REVIEW the system requires
        ← consistently omitted, often the largest

   TYPICAL GROSS MARGIN

     conventional SaaS    ████████████████████  85-90%
     AI-heavy product     ████████████          55-75%

     a real business, and a DIFFERENT one —
     with different implications for what you can
     spend to acquire a customer

   ⚠ WATCH THE TRAJECTORY, NOT THE SNAPSHOT

     model prices fall          → helps
     context lengths grow       → does not
     adoption grows             → does not

   ⚠ SEGMENT — a blended margin can hide a segment that is
     unprofitable at ANY volume (small accounts, heavy usage)`,
    example: {
      language: 'python',
      caption: 'Unit economics by segment, including the cost everyone omits',
      code: `def unit_economics(seg):
    variable = (seg["inference"] + seg["storage"] + seg["support"]
                + seg["payment_fees"] + seg["human_review"])   # ⚠ last one
    contribution = seg["revenue"] - variable
    lifetime_months = 1 / seg["monthly_churn"]
    return {
        "segment": seg["name"],
        "revenue_pm": seg["revenue"],
        "variable_pm": round(variable, 2),
        "contribution_pm": round(contribution, 2),
        "gross_margin": round(contribution / seg["revenue"] * 100),
        "lifetime_months": round(lifetime_months),
        "ltv": round(contribution * lifetime_months),
        "cac": seg["cac"],
        "ltv_cac": round(contribution * lifetime_months / seg["cac"], 1),
        "payback_months": round(seg["cac"] / contribution, 1),
    }

SEGMENTS = [
  {"name": "enterprise (200+ agents)", "revenue": 8000, "inference": 980,
   "storage": 40, "support": 300, "payment_fees": 80, "human_review": 400,
   "monthly_churn": 0.008, "cac": 42000},
  {"name": "mid-market (40-200)", "revenue": 1800, "inference": 310,
   "storage": 15, "support": 180, "payment_fees": 18, "human_review": 150,
   "monthly_churn": 0.018, "cac": 6800},
  {"name": "small (10-40), heavy use", "revenue": 400, "inference": 190,
   "storage": 8, "support": 140, "payment_fees": 4, "human_review": 90,
   "monthly_churn": 0.055, "cac": 2100},
]

for s in SEGMENTS:
    print(unit_economics(s))

# enterprise    margin 78%  ltv 762,500  ltv_cac 18.2  payback  6.9
# mid-market    margin 63%  ltv  62,611  ltv_cac  9.2  payback  5.9
# small         margin -8%  ltv    -582  ltv_cac -0.3  payback  never  ⚠

# ⚠ THE SMALL SEGMENT IS UNPROFITABLE AT ANY VOLUME.
#   Revenue 400, variable cost 432. Every additional small
#   customer makes the business worse, and marketing was
#   about to double spend on that segment because the CAC
#   was low and the sign-up funnel converted well.
#
#   The blended margin across all three is 71% — healthy,
#   and it conceals a segment losing money on every unit.

# ⚠ THE LINE THAT DECIDED IT
#   Remove human_review from the model and the small segment
#   shows a +58/month contribution and looks viable. That one
#   omitted cost flips the sign — and it is the cost that
#   almost never appears in an early unit-economics model.

# WHAT WE DID
#   · raised the small-tier price and capped included usage
#   · moved small-tier error review to a monthly batch,
#     shared across accounts, cutting human_review to 25
#   → small segment margin: -8% → +34%. Now worth acquiring.`
    },
    prereq: ['business-models'], next: ['ltv-cac', 'pricing'],
    related: ['ltv-cac', 'pricing', 'ai-cost', 'contribution-margin', 'business-models'],
    tools: [],
    useCases: [
      'Checking whether growth would make the business better or worse.',
      'Finding a segment that loses money on every unit.',
      'Setting a defensible acquisition budget.'
    ],
    avoid: [
      'Blended margins presented without segmentation.',
      'Models that omit ongoing human review cost.'
    ],
    mistakes: [
      'Assuming near-zero marginal cost out of software habit.',
      'Omitting human review, which can flip the sign of a segment.',
      'Reading a snapshot rather than a trajectory as usage grows.',
      'Scaling acquisition into a segment that is unprofitable at any volume.'
    ],
    keyTerms: [
      ['contribution margin', 'Revenue minus variable cost per unit.'],
      ['variable cost', 'Cost that scales with each additional unit.'],
      ['gross margin', 'Contribution as a percentage of revenue.'],
      ['payback period', 'Months to recover the cost of acquisition.'],
      ['blended margin', 'The average across segments; hides outliers.'],
      ['segment economics', 'Unit economics computed per customer group.']
    ],
    resources: [
      ['a16z — 16 startup metrics', 'https://a16z.com/16-startup-metrics/', 'article'],
      ['a16z — the new business of AI', 'https://a16z.com/the-new-business-of-ai-and-how-its-different-from-traditional-software/', 'article'],
      ['Reforge — unit economics', 'https://www.reforge.com/blog/unit-economics', 'article']
    ],
    questions: [
      ['Why do unit economics matter more for AI products?', 'Conventional software has near-zero marginal cost, so margin approaches revenue. AI features have real per-request cost, so margin depends on usage — and usage rises with success.'],
      ['What variable cost is most often omitted?', 'The ongoing human review the system needs — error triage, golden-set maintenance. It is frequently large enough to flip a segment from profitable to loss-making.'],
      ['Why segment unit economics?', 'A healthy blended margin can conceal a segment that loses money on every unit. Small accounts with heavy usage are the classic case, and low CAC makes them look attractive to acquire.']
    ]
  },

  {
    id: 'ltv-cac',
    title: 'LTV & CAC',
    domain: 'strategy', tier: 2, priority: 'medium',
    summary: 'What a customer is worth against what they cost to acquire, and why the ratio is often wrong.',
    what: `**CAC** is the fully loaded cost of acquiring one customer. **LTV** is the contribution margin that customer generates over their lifetime. The ratio and the payback period together describe whether growth is affordable.`,
    why: `They set how much you can spend to grow. They are also among the most commonly miscalculated numbers in product businesses, usually in the flattering direction.`,
    analogy: `Buying a fruit tree. CAC is the price of the tree; LTV is the fruit over its life. Getting the tree's lifespan wrong changes everything and is easy to do optimistically.`,
    technical: `**CAC must be fully loaded** — all sales and marketing spend, salaries included, divided by new customers in the period. Marketing spend alone typically understates it by half or more.

**LTV must use contribution margin, not revenue.** Using revenue inflates it by whatever your variable cost is, which for AI products is substantial.

**The common errors, all optimistic:**
- Revenue instead of margin.
- Churn estimated from the best cohort rather than the average.
- Extrapolating lifetime from a few months of data — early cohorts churn differently from later ones.
- Ignoring that churn is usually higher in the segments that are cheapest to acquire.

**The ratio's conventional benchmark is 3:1**, but it is meaningless without the payback period. A 5:1 ratio with a thirty-month payback is a cash-flow problem regardless of how good the ratio looks; a 3:1 with six-month payback funds its own growth.

**For AI products, LTV moves with usage.** A customer whose usage grows becomes more valuable in revenue and less valuable in margin. That makes LTV a moving target and makes segmentation essential.

**Compute it per channel and per segment.** A blended CAC hides that one channel is profitable and another is not, and blended figures are the ones most often quoted.`,
    diagram: `
   THE TWO NUMBERS

     CAC   fully loaded cost of acquiring one customer
           ⚠ ALL sales and marketing, salaries INCLUDED
             marketing spend alone understates it by half+

     LTV   CONTRIBUTION MARGIN over the customer's lifetime
           ⚠ not revenue — using revenue inflates it by
             your entire variable cost

   ⚠ THE COMMON ERRORS, ALL OPTIMISTIC

     revenue instead of margin
     churn from the BEST cohort rather than the average
     lifetime extrapolated from a few months
     ignoring that cheap-to-acquire segments churn more

   ⚠ THE RATIO IS MEANINGLESS WITHOUT PAYBACK

     5:1 ratio, 30-month payback   a cash-flow problem
     3:1 ratio, 6-month payback    funds its own growth

     the ratio tells you if it is worth it
     the payback tells you if you can AFFORD it

   FOR AI, LTV IS A MOVING TARGET

     usage grows → revenue up, MARGIN DOWN
     → segmentation is not optional

   ⚠ COMPUTE PER CHANNEL AND PER SEGMENT

     a blended CAC hides that one channel is profitable
     and another is not — and blended is what gets quoted`,
    example: {
      language: 'python',
      caption: 'The same business, calculated badly and properly',
      code: `# ── THE FLATTERING VERSION (what the deck said) ────────────
flattering = {
    "cac": 480_000 / 92,              # ⚠ paid marketing only
    "monthly_revenue": 1800,          # ⚠ revenue, not margin
    "churn": 0.009,                   # ⚠ best cohort
}
ltv_f = flattering["monthly_revenue"] / flattering["churn"]
print(round(ltv_f), round(flattering["cac"]),
      round(ltv_f / flattering["cac"], 1))
# 200000  5217  38.3
# "LTV:CAC of 38:1" — a number nobody should believe.

# ── FULLY LOADED ───────────────────────────────────────────
cac_costs = {
    "paid marketing":        480_000,
    "sales salaries":        620_000,   # ⚠ omitted above
    "marketing salaries":    240_000,   # ⚠ omitted above
    "sales tooling":          60_000,
    "events and content":    110_000,
}
cac = sum(cac_costs.values()) / 92
print(round(cac))                       # 16,413  (3.1x the claim)

contribution = 1800 - 673               # margin, not revenue
churn_avg = 0.018                       # all cohorts, not the best
ltv = contribution / churn_avg
payback = cac / contribution

print(round(ltv), round(ltv / cac, 1), round(payback, 1))
# 62,611   3.8   14.6

# ⚠ 38:1 became 3.8:1. Every step of the correction was
#   a step most decks skip:
#     + salaries in CAC          38.3 → 12.2
#     + margin instead of revenue 12.2 →  7.6
#     + average churn              7.6 →  3.8

# ⚠ AND THE PAYBACK IS 14.6 MONTHS.
#   3.8:1 is a healthy ratio. 14.6-month payback means every
#   customer acquired consumes cash for over a year. Growing
#   faster makes the cash position WORSE, not better, and the
#   ratio alone would never have told us that.

# ── PER CHANNEL — where the decision actually is ───────────
CHANNELS = {
    "inbound content":  {"spend": 210_000, "customers": 41, "churn": 0.012},
    "outbound sales":   {"spend": 890_000, "customers": 38, "churn": 0.016},
    "paid search":      {"spend": 410_000, "customers": 13, "churn": 0.041},
}
for name, c in CHANNELS.items():
    ch_cac = c["spend"] / c["customers"]
    ch_ltv = contribution / c["churn"]
    print(f"{name:<18} cac {ch_cac:>8.0f}  ltv {ch_ltv:>8.0f}  "
          f"ratio {ch_ltv/ch_cac:>4.1f}  payback {ch_cac/contribution:>5.1f}mo")

# inbound content    cac     5122  ltv    93917  ratio 18.3  payback   4.5mo
# outbound sales     cac    23421  ltv    70438  ratio  3.0  payback  20.8mo
# paid search        cac    31538  ltv    27488  ratio  0.9  payback  28.0mo  ⚠

# ⚠ PAID SEARCH LOSES MONEY ON EVERY CUSTOMER — ratio below 1,
#   and the highest churn. The blended 3.8:1 concealed both a
#   channel worth tripling and a channel worth stopping.`
    },
    prereq: ['unit-economics'], next: ['roi-cost-benefit'],
    related: ['unit-economics', 'cohorts-retention', 'pricing', 'conversion-churn'],
    tools: [],
    useCases: [
      'Deciding how much to spend acquiring a customer.',
      'Finding a channel that loses money on every customer.',
      'Explaining why faster growth would worsen the cash position.'
    ],
    avoid: [
      'Blended figures used to make channel decisions.',
      'LTV computed on revenue rather than contribution margin.'
    ],
    mistakes: [
      'Excluding salaries from CAC, which typically understates it several-fold.',
      'Using the best cohort’s churn rather than the average.',
      'Quoting a ratio without the payback period.',
      'Extrapolating lifetime from a few months of early-cohort data.'
    ],
    keyTerms: [
      ['CAC', 'Fully loaded cost of acquiring one customer.'],
      ['LTV', 'Contribution margin over a customer’s lifetime.'],
      ['payback period', 'Months to recover CAC. The affordability test.'],
      ['churn', 'The rate at which customers leave.'],
      ['blended figure', 'An average across channels or segments; hides outliers.'],
      ['fully loaded', 'Including salaries and overhead, not just spend.']
    ],
    resources: [
      ['a16z — 16 startup metrics', 'https://a16z.com/16-startup-metrics/', 'article'],
      ['David Skok — SaaS metrics', 'https://www.forentrepreneurs.com/saas-metrics-2/', 'reference'],
      ['Reforge — retention', 'https://www.reforge.com/blog/retention-engagement-growth-silent-killer', 'article']
    ],
    questions: [
      ['Why is the LTV:CAC ratio meaningless on its own?', 'It says whether a customer is worth acquiring, not whether you can afford to. A 5:1 ratio with a thirty-month payback consumes cash for years; 3:1 with six-month payback funds its own growth.'],
      ['What are the usual errors in calculating LTV?', 'Using revenue instead of contribution margin, taking churn from the best cohort, and extrapolating lifetime from a few months of early-cohort data. All of them flatter the number.'],
      ['Why compute per channel?', 'A blended figure can conceal one channel worth tripling and another that loses money on every customer. Blended numbers are the ones that get quoted and the ones that hide the decision.']
    ]
  },

  {
    id: 'pricing',
    title: 'Pricing',
    domain: 'strategy', tier: 2, priority: 'medium',
    summary: 'Setting a price on value delivered, not on cost incurred.',
    what: `Pricing is choosing what to charge, on what basis, and in what structure. The three common approaches are cost-plus, competitor-based and value-based.`,
    why: `It is the highest-leverage variable in a business and usually the least examined. A price change requires no engineering and flows straight to margin, and most teams set a price once and never revisit it.`,
    analogy: `The price of a lock is not the cost of the metal. It is a fraction of what is behind the door.`,
    technical: `**Value-based pricing** anchors on what the customer gains. It requires understanding their alternative and quantifying the improvement, which is real work and is why most teams default to cost-plus.

**Cost-plus is the weakest approach** — it caps your price at your inefficiency and ignores what the customer would pay.

**Competitor-based pricing** invites comparison on price, which is a race you win only by being cheapest.

Structural choices that matter as much as the number: **what you charge per** (seat, usage, outcome), **how many tiers**, **what is in the free tier**, and **annual versus monthly** commitment.

**Anchor on the alternative's cost.** If the current approach costs six minutes of an agent's time per question, that is the anchor — not your inference bill.

**For AI products, price on outcome where you can measure it.** Per-resolved-ticket pricing aligns your revenue with their value, resists unit-price comparison against competitors, and naturally handles the usage-cost problem.

**Raise prices more often than you think.** Most products are underpriced, particularly at launch, and grandfathering existing customers makes an increase far less contentious than expected.

**Price is a positioning statement.** Cheap signals commodity. For an AI feature where trust matters, being the cheapest option actively undermines the claim that you are the careful one.`,
    diagram: `
   THREE APPROACHES

     COST-PLUS         cost × markup
                       ⚠ weakest — caps your price at your
                         inefficiency, ignores customer value

     COMPETITOR-BASED  match or undercut
                       ⚠ invites comparison ON PRICE, a race
                         you win only by being cheapest

     VALUE-BASED       a fraction of what the customer gains
                       ← requires understanding their
                         alternative. Real work. Worth it.

   ⚠ ANCHOR ON THE ALTERNATIVE'S COST

     the current approach costs 6 minutes of agent time
     per question

     THAT is the anchor — not your inference bill

   STRUCTURE MATTERS AS MUCH AS THE NUMBER

     what you charge PER    seat · usage · outcome
     how many TIERS
     what is FREE
     annual vs monthly

   FOR AI: PRICE ON OUTCOME WHERE YOU CAN MEASURE IT

     per resolved ticket
       aligns revenue with value
       resists unit-price comparison
       handles the usage-cost problem naturally

   ⚠ PRICE IS A POSITIONING STATEMENT

     cheap signals commodity

     for an AI feature where TRUST is the claim, being the
     cheapest option actively undermines it`,
    example: {
      language: 'text',
      caption: 'Three ways to price the same feature',
      code: `FEATURE  AI policy assistant · 60 agents · ~9,900 queries/month

COST-PLUS
  our cost            $1,638/month  (tokens + review + infra)
  × 3 markup          $4,914/month  → $82/agent
  ⚠ This number contains no information about the customer.
    If we got more efficient, we would charge LESS for the
    same value. That is backwards.

COMPETITOR-BASED
  bundled console AI  included at no extra charge
  two AI startups     $35 and $55 per agent
  → "price at $45 to be competitive"
  ⚠ This anchors us against a bundled free feature and puts
    the conversation on price. It also positions us as the
    mid-priced option for a product whose entire claim is
    that it is the careful one.

VALUE-BASED  ← the anchor that is actually relevant
  Current alternative: agent asks a colleague.
    6.5 minutes × 40 questions/day × 60 agents
    = 260 agent-hours/month
    at $11/hour fully loaded = $2,860/month of agent time

  Plus the cost that lands outside the support team:
    ~30 repeat customer contacts/week from unresolved
    questions × $18 handling cost = $2,160/month

  Total cost of the status quo:      ~$5,020/month
  Measured share we remove (71% coverage × 83% accepted
  × verified reduction):              ~$2,970/month

  Price at 35% of value delivered:    $1,040/month
                                      → $17/agent

⚠ THE VALUE-BASED PRICE IS LOWER THAN COST-PLUS.
  That is a real finding, not an error — it says the feature
  as scoped does not yet deliver enough measured value to
  justify $82/agent. The response is not to charge more; it
  is to raise coverage, or to price a tier that includes the
  regional policy corpus where the remaining value sits.

STRUCTURE CHOSEN
  $1,200/month base, 15,000 queries included, $0.02 overage
  · predictable for them, bounded for us
  · covers 97% of accounts with no overage
  · the meter is visible, so a large bill is never a surprise
  · annual commitment at 15% discount improves our payback
    from 14.6 to 9.1 months — which was the actual constraint

⚠ WHAT WE DID NOT DO
  Price below the two AI startups. Our claim is that we
  abstain rather than guess and that the customer owns the
  evaluation. Being the cheapest would have contradicted it.`
    },
    prereq: ['unit-economics'], next: ['roi-cost-benefit'],
    related: ['unit-economics', 'business-models', 'ltv-cac', 'opportunity-sizing', 'ai-cost'],
    tools: [],
    useCases: [
      'Setting a launch price with a defensible anchor.',
      'Choosing a structure that handles variable usage cost.',
      'Discovering that a feature does not yet deliver enough value to price as intended.'
    ],
    avoid: [
      'Cost-plus pricing, which ignores customer value.',
      'Being the cheapest option for a product whose claim is care.'
    ],
    mistakes: [
      'Anchoring on your inference bill rather than on the customer’s alternative.',
      'Competing on price, which invites the one comparison you cannot win.',
      'Setting a price once and never revisiting it.',
      'Ignoring that a low price positions the product as a commodity.'
    ],
    keyTerms: [
      ['value-based pricing', 'A fraction of what the customer gains.'],
      ['cost-plus pricing', 'Cost times markup. The weakest approach.'],
      ['anchor', 'The reference point a price is judged against.'],
      ['outcome pricing', 'Charging per resolved task.'],
      ['grandfathering', 'Leaving existing customers on their old price.'],
      ['price as positioning', 'What the price signals about the product.']
    ],
    resources: [
      ['Reforge — pricing strategy', 'https://www.reforge.com/blog/pricing-strategy', 'article'],
      ['OpenView — pricing benchmarks', 'https://en.wikipedia.org/wiki/Software_as_a_service', 'reference'],
      ['a16z — the new business of AI', 'https://a16z.com/the-new-business-of-ai-and-how-its-different-from-traditional-software/', 'article']
    ],
    questions: [
      ['What should an AI feature’s price anchor on?', 'The cost of the customer’s current alternative — agent time, repeat contacts, the manual process — not on your inference bill, which contains no information about their value.'],
      ['Why is cost-plus the weakest approach?', 'It caps your price at your own inefficiency and ignores customer value. Taken literally, becoming more efficient would mean charging less for identical value.'],
      ['Why can a low price hurt an AI product?', 'Price is a positioning statement. Cheap signals commodity, which directly contradicts a claim that the product is the careful, trustworthy option.']
    ]
  },

  {
    id: 'roi-cost-benefit',
    title: 'ROI & Cost-Benefit Analysis',
    domain: 'strategy', tier: 2, priority: 'medium',
    summary: 'Comparing what a decision costs against what it returns, honestly enough to be useful.',
    what: `Cost-benefit analysis compares the full cost of a decision against its expected return. ROI expresses that as a ratio; payback expresses it as time.`,
    why: `Almost every significant product decision is eventually justified this way, and most of the analyses are advocacy dressed as arithmetic. Doing one honestly is a distinguishing skill.`,
    analogy: `A renovation estimate. Everyone can produce a number that supports the renovation they want. The useful estimate is the one that names what could make it wrong.`,
    technical: `The structure: **all costs** (build, run, opportunity, risk), **all benefits** (quantified where possible, named where not), over a **defined horizon**, with **stated assumptions**.

**Include opportunity cost.** The team building this is not building something else, and that alternative has a value. Omitting it is the most common way an analysis becomes advocacy.

**Include running cost.** For AI features this is substantial and recurring: inference, review, maintenance. A build-cost-only analysis is not an analysis.

**Discount future benefits.** Money and effort now are worth more than the same amount later. For short horizons a rough discount is enough; the point is not to treat year-three benefits as equivalent to year-one.

**State the assumptions as numbers and run sensitivity.** Which assumption, if wrong, changes the conclusion? That single question is usually more valuable than the headline figure, and it tells you what to go and measure.

**Name the benefits you cannot quantify** rather than assigning them invented numbers. "Improves agent morale" as a stated unquantified benefit is honest; "improves agent morale, worth $40,000" is a fabrication that discredits the rest of the analysis.

**Present a range.** A single number implies a precision that does not exist, and it invites an argument about the number instead of about the assumptions.`,
    diagram: `
   THE STRUCTURE

     ALL COSTS      build · run · OPPORTUNITY · risk
     ALL BENEFITS   quantified where possible
                    NAMED where not
     HORIZON        defined, and stated
     ASSUMPTIONS    as numbers, so they can be argued with

   ⚠ INCLUDE OPPORTUNITY COST

     the team building this is not building something else
     omitting it is the most common way an analysis
     becomes ADVOCACY

   ⚠ INCLUDE RUNNING COST

     for AI: inference · review · maintenance, recurring
     a build-cost-only analysis is not an analysis

   ⚠ NAME WHAT YOU CANNOT QUANTIFY

     ✓ "improves agent morale"                      honest
     ✗ "improves agent morale, worth $40,000"       fabrication
                                                     that discredits
                                                     the rest

   RUN SENSITIVITY — the most valuable part

     which assumption, if wrong, flips the conclusion?

     that question tells you WHAT TO GO AND MEASURE,
     and is usually worth more than the headline number

   PRESENT A RANGE

     a single number implies precision that does not exist
     and invites an argument about the NUMBER instead of
     about the ASSUMPTIONS`,
    example: {
      language: 'python',
      caption: 'A cost-benefit analysis with its own weak point identified',
      code: `HORIZON_MONTHS = 24
DISCOUNT_MONTHLY = 0.008          # ~10%/yr

def analyse(*, build_weeks, team_cost_week, monthly_run,
            monthly_benefit, ramp_months, opportunity_weeks):
    build = build_weeks * team_cost_week
    opportunity = opportunity_weeks * team_cost_week   # ⚠ counted
    net = -(build + opportunity)
    flows = []
    for m in range(1, HORIZON_MONTHS + 1):
        ramp = min(1.0, m / ramp_months)               # benefits ramp
        flow = (monthly_benefit * ramp) - monthly_run
        flows.append(flow / (1 + DISCOUNT_MONTHLY) ** m)
    total = net + sum(flows)
    cumulative, payback = net, None
    for m, f in enumerate(flows, 1):
        cumulative += f
        if cumulative > 0 and payback is None:
            payback = m
    return {"upfront": round(build + opportunity),
            "npv_24mo": round(total),
            "payback_months": payback}

BASE = dict(build_weeks=10, team_cost_week=9_000, monthly_run=1_638,
            ramp_months=4, opportunity_weeks=10)

print(analyse(**BASE, monthly_benefit=2_970))
# {'upfront': 180000, 'npv_24mo': -152858, 'payback_months': None}
# ⚠ NEGATIVE over 24 months. The honest version of this
#   analysis does not support building it as scoped.

# ⚠ SENSITIVITY — which assumption flips it?
for label, kw in [
    ("benefit 2x (full coverage)", dict(monthly_benefit=5_940)),
    ("build in 5 weeks",           dict(monthly_benefit=2_970, build_weeks=5,
                                        opportunity_weeks=5)),
    ("run cost halved",            dict(monthly_benefit=2_970, monthly_run=819)),
    ("rolled to 3 more teams",     dict(monthly_benefit=8_910)),
]:
    print(f"{label:<28}", analyse(**{**BASE, **kw}))

# benefit 2x (full coverage)    {'npv_24mo':  10466, 'payback_months': 23}
# build in 5 weeks              {'npv_24mo': -62858, 'payback_months': None}
# run cost halved               {'npv_24mo':-135064, 'payback_months': None}
# rolled to 3 more teams        {'npv_24mo': 130543, 'payback_months': 11}  ⚠

# ⚠ THE CONCLUSION DEPENDS ALMOST ENTIRELY ON SCOPE OF
#   DEPLOYMENT, and barely at all on build speed or run cost.
#
#   For ONE 60-agent team, this does not pay back in two years.
#   For four teams sharing the same corpus and evaluation
#   infrastructure, it pays back in eleven months.
#
#   → The decision is not "build or not". It is "do we have
#     four teams with a shared policy corpus?" That is a
#     question we can answer in a day, and it is the only
#     one that matters.

BENEFITS_NOT_QUANTIFIED = [
    "reduced dependence on one senior agent (a real risk today)",
    "faster onboarding for new agents",
    "the evaluation infrastructure is reusable for future features",
]
# ⚠ Named, not priced. The third one is arguably the largest
#   and is precisely the kind of thing that gets a fabricated
#   number attached to it in a deck.`
    },
    prereq: [], next: [],
    related: ['opportunity-sizing', 'unit-economics', 'prioritization', 'product-tradeoffs', 'ai-cost'],
    tools: [],
    useCases: [
      'Justifying or declining a significant build.',
      'Finding the assumption the whole decision rests on.',
      'Reframing a build/no-build question into a scope question.'
    ],
    avoid: [
      'Single-number conclusions.',
      'Assigning invented values to unquantifiable benefits.'
    ],
    mistakes: [
      'Omitting opportunity cost, which turns analysis into advocacy.',
      'Counting build cost and ignoring recurring run cost.',
      'Skipping sensitivity analysis, which is the most valuable part.',
      'Pricing soft benefits, which discredits the numbers that were real.'
    ],
    keyTerms: [
      ['opportunity cost', 'The value of what the team is not building.'],
      ['run cost', 'Recurring cost of operating the thing.'],
      ['discounting', 'Valuing future benefits below present ones.'],
      ['sensitivity analysis', 'Which assumption flips the conclusion.'],
      ['payback period', 'When cumulative benefit exceeds cost.'],
      ['unquantified benefit', 'A real benefit named rather than priced.']
    ],
    resources: [
      ['Harvard Business Review — a refresher on NPV', 'https://hbr.org/2014/11/a-refresher-on-net-present-value', 'article'],
      ['a16z — 16 startup metrics', 'https://a16z.com/16-startup-metrics/', 'article'],
      ['Reforge — opportunity sizing', 'https://www.reforge.com/blog/opportunity-sizing', 'article']
    ],
    questions: [
      ['What makes a cost-benefit analysis honest rather than advocacy?', 'Including opportunity cost and recurring run cost, stating assumptions as numbers, running sensitivity, and naming unquantifiable benefits instead of pricing them.'],
      ['Why is sensitivity analysis the most valuable part?', 'It identifies which assumption, if wrong, flips the conclusion — which tells you what to go and measure, and often reframes the decision entirely.'],
      ['Why not assign a value to soft benefits?', 'A fabricated number discredits the numbers that were real. Naming "improves onboarding" as an unquantified benefit is honest; pricing it at $40,000 invites the whole analysis to be dismissed.']
    ]
  }
];
