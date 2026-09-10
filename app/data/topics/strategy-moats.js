/**
 * DOMAIN U — STRATEGY + BUSINESS, part 2: the mechanisms of durability
 */
export const topics = [
  {
    id: 'network-effects',
    title: 'Network Effects',
    domain: 'strategy', tier: 2, priority: 'medium',
    summary: 'When each additional user makes the product better for everyone already there.',
    what: `A network effect exists when the value of a product increases as more people use it. It is the strongest form of competitive advantage because the advantage grows on its own.`,
    why: `It is the most claimed and least possessed property in product strategy. Distinguishing a real network effect from ordinary growth changes what you should invest in, and most products claiming one have scale economics instead.`,
    analogy: `A telephone network. One telephone is useless; the millionth makes every existing one more valuable. Contrast a bakery, which does not bake better bread because it has more customers.`,
    technical: `The types:
- **Direct** — more users of the same type make it better. Messaging, marketplaces on a single side.
- **Indirect (two-sided)** — more of one type attracts more of the other. Buyers and sellers, riders and drivers.
- **Data network effects** — usage generates data that improves the product for everyone. The one most relevant to AI, and the one most often claimed without substance.

**The test for a data network effect** is whether the data from user N measurably improves the experience of users 1 through N−1, and whether that improvement is something a competitor cannot obtain otherwise. Most "our AI learns from usage" claims fail both parts: the data improves nothing measurable, or the same improvement is available from public data.

**Local network effects can be stronger than global ones.** A tool that is valuable because *your team* uses it does not need global scale, and it is harder to displace, because switching requires coordinating a group rather than one person.

**Negative network effects exist.** Congestion, noise, declining quality of matches as a marketplace grows indiscriminately.

**Beware the confusion with scale economics.** Cheaper unit costs at scale is a real advantage and a different one — it helps you, not your users, and it does not compound in the same way.`,
    diagram: `
   THE TYPES

     DIRECT           more users of the same type → better
                      messaging · single-sided marketplaces

     INDIRECT         more of one type attracts the other
     (two-sided)      buyers/sellers · riders/drivers

     DATA             usage generates data that improves
                      the product for everyone
                      ← most relevant to AI
                      ⚠ and most often claimed without substance

   ⚠ THE TEST FOR A DATA NETWORK EFFECT

     1  does data from user N MEASURABLY improve the
        experience of users 1..N-1?
     2  is that improvement UNOBTAINABLE by a competitor
        from public data?

     most "our AI learns from usage" claims fail BOTH

   LOCAL CAN BEAT GLOBAL

     a tool valuable because YOUR TEAM uses it needs no
     global scale — and is harder to displace, because
     switching requires coordinating a GROUP

   NEGATIVE NETWORK EFFECTS EXIST

     congestion · noise · worse matches as a marketplace
     grows indiscriminately

   ⚠ DO NOT CONFUSE WITH SCALE ECONOMICS

     network effect    more users → better FOR USERS
     scale economics   more users → cheaper FOR YOU

     both are real advantages. Only one compounds
     in the product itself.`,
    example: {
      language: 'text',
      caption: 'Testing three AI products for a real network effect',
      code: `CLAIM 1  "Our assistant gets smarter as more agents use it."
  Test 1  Does agent N's usage measurably improve agents 1..N-1?
          → Flagged errors become golden-set regression cases,
            which prevent recurrence for everyone in that tenant.
          → MEASURABLE: repeat-error rate fell 41% over 3 months
            and the flag volume drove it.  ✓
  Test 2  Could a competitor obtain the same improvement?
          → No. The errors are specific to this tenant's policy
            corpus and this tenant's judgement of correct.  ✓
  ⚠ VERDICT: a real data network effect, but LOCAL — it
    operates within a tenant, not across all customers.
    That is still valuable, and it means growth in NEW tenants
    does not strengthen existing ones. Plan accordingly:
    the advantage is per-account depth, not aggregate scale.

CLAIM 2  "More usage means better embeddings."
  Test 1  Does it? → We use an off-the-shelf embedding model.
          Usage does not change it at all.
  ⚠ VERDICT: no network effect. This was a sentence in a deck
    that nobody had checked. What actually improves with usage
    is the retrieval METADATA — which questions map to which
    documents — and that is worth building deliberately rather
    than claiming accidentally.

CLAIM 3  "Our marketplace of prompt templates."
  Test 1  More template authors → more choice for buyers  ✓
          More buyers → more incentive to author            ✓
          → a genuine two-sided indirect network effect
  ⚠ BUT: negative network effect at scale. At 4,000 templates
    buyers cannot find good ones and quality perception falls.
  → the strategic work is CURATION, not growth. Adding
    templates past a point makes the product worse.

⚠ THE PATTERN
  One real-but-local, one imaginary, one real-with-a-ceiling.
  All three were described identically in the strategy deck
  as "network effects". The test is what separated them, and
  each implies completely different investment.`
    },
    prereq: ['competitive-advantage'], next: ['switching-costs'],
    related: ['competitive-advantage', 'switching-costs', 'golden-sets', 'product-strategy'],
    tools: [],
    useCases: [
      'Testing whether a claimed network effect is real.',
      'Deciding whether to invest in depth per account or aggregate scale.',
      'Recognising when growth starts making the product worse.'
    ],
    avoid: [
      'Claiming a data network effect without a measurable improvement.',
      'Confusing scale economics with network effects.'
    ],
    mistakes: [
      'Assuming usage automatically improves an AI product — it does not unless a loop is built.',
      'Missing that a data network effect can be local to a tenant rather than global.',
      'Growing a marketplace past the point where discovery degrades.',
      'Describing three different mechanisms with the same phrase in a strategy deck.'
    ],
    keyTerms: [
      ['direct network effect', 'More users of the same type improve the product.'],
      ['indirect network effect', 'More of one type attracts the other.'],
      ['data network effect', 'Usage generates data that improves the product.'],
      ['local network effect', 'Value from your group using it, not global scale.'],
      ['negative network effect', 'Growth that degrades the experience.'],
      ['scale economics', 'Lower unit cost at scale. A different advantage.']
    ],
    resources: [
      ['a16z — network effects', 'https://en.wikipedia.org/wiki/Network_effect', 'article'],
      ['NfX — the network effects bible', 'https://www.nfx.com/post/network-effects-bible', 'reference'],
      ['Hamilton Helmer — 7 Powers (overview)', 'https://www.7powers.com/', 'reference']
    ],
    questions: [
      ['What is the test for a data network effect?', 'Whether data from user N measurably improves the experience of earlier users, and whether a competitor could obtain the same improvement from public data. Most claims fail both.'],
      ['Why does a local network effect matter?', 'A tool valuable because your team uses it needs no global scale and is harder to displace, since switching requires coordinating a group rather than one person.'],
      ['How does a network effect differ from scale economics?', 'A network effect makes the product better for users as it grows; scale economics makes it cheaper for you. Both are real, but only the first compounds inside the product.']
    ]
  },

  {
    id: 'switching-costs',
    title: 'Switching Costs',
    domain: 'strategy', tier: 2, priority: 'medium',
    summary: 'What it costs a customer to leave — and the difference between earned and imposed.',
    what: `Switching costs are everything a customer must spend to move to an alternative: data migration, retraining, integration work, process change and risk.`,
    why: `They determine retention more reliably than satisfaction does. A customer who is unhappy but faces high switching costs stays; a delighted customer with none can leave on a whim.`,
    analogy: `Moving house versus changing a light bulb. The decision is dominated by the cost of moving, not by how much you like the new place.`,
    technical: `The categories: **data** (history that does not transfer), **integration** (the work of rewiring systems), **process** (documented workflows built around the tool), **learning** (retraining people), **contractual** (terms and commitments), and **risk** (the possibility the new thing is worse).

**Earned versus imposed is the distinction that matters.** Earned switching costs come from accumulated value the customer benefits from — their history, their tuning, their integrations. Imposed ones come from deliberate obstruction — proprietary formats, no export, punitive terms. Both retain customers; only one survives contact with a competitor who offers migration assistance, and imposed costs generate the resentment that makes customers leave the moment they can.

**Switching costs cut both ways.** High costs also slow *acquisition* — a prospect facing an expensive migration into your product is as stuck as your customers are. Products with high switching costs need migration tooling as a growth investment.

**For AI products the accumulated asset is usually the evaluation set and the correction history** — the tenant's golden set, their judgement of what correct means, the errors they have flagged and the regressions those prevent. That is genuine earned switching cost, and it is also a reason to make it exportable: a customer who knows they could leave with their data is more willing to invest in building it.`,
    diagram: `
   CATEGORIES

     DATA          history that does not transfer
     INTEGRATION   the work of rewiring systems
     PROCESS       documented workflows built around the tool
     LEARNING      retraining people
     CONTRACTUAL   terms and commitments
     RISK          the new thing might be worse

   ⚠ EARNED vs IMPOSED — the distinction that matters

     EARNED                      IMPOSED
     accumulated value the       deliberate obstruction
     customer BENEFITS from      proprietary formats
     their history, tuning,      no export
     integrations                punitive terms

     both retain customers
     only EARNED survives a competitor offering migration help

     imposed costs generate the resentment that makes
     customers leave the moment they can

   ⚠ SWITCHING COSTS CUT BOTH WAYS

     high costs also slow ACQUISITION —
     a prospect facing an expensive migration INTO your
     product is as stuck as your customers are

     → products with high switching costs need migration
       tooling as a GROWTH investment

   FOR AI, THE ACCUMULATED ASSET IS USUALLY

     the tenant's golden set
     their judgement of what "correct" means
     the errors they flagged, and the regressions prevented

     genuine EARNED switching cost — and a reason to make
     it EXPORTABLE: a customer who knows they could leave
     with it is more willing to invest in building it`,
    example: {
      language: 'text',
      caption: 'Auditing switching costs in both directions',
      code: `PRODUCT  AI policy assistant, 14 months in production

WHAT A CUSTOMER WOULD LOSE BY LEAVING
  EARNED
    · 220-case golden set built from their resolved tickets,
      judged by their own support leads          ~6 months of work
    · 340 flagged-and-confirmed error cases, each now a
      regression that prevents recurrence
    · abstention thresholds tuned to their risk appetite
    · agents trained on its specific failure modes
    ⚠ all of this is value they RECEIVED. Losing it is a real
      loss to them, not a penalty we imposed.

  INTEGRATION
    · console panel, SSO, ticket-system webhooks   ~4 weeks eng
    · procurement and security review              ~8 weeks

  RISK
    · "the new one might be worse and we cannot tell for
      six months"     ← ⚠ often the largest single factor

  IMPOSED — deliberately none
    · golden set exports as JSON, documented schema
    · traces export
    · no proprietary format anywhere
    · 30-day termination, no penalty

⚠ WHY WE MADE IT EXPORTABLE
  Two enterprise prospects asked directly what happens to
  their evaluation data if they leave. "You can take it" is
  what unblocked both deals — because the thing that made
  them hesitate to INVEST in building a golden set was the
  fear of building an asset they could not keep.

  The export feature INCREASED adoption of the feature that
  creates the switching cost. That is not a paradox; it is
  what earned switching costs look like.

── THE OTHER DIRECTION: OUR OWN ACQUISITION COST ────────────
  A prospect switching TO us faces:
    · 6 months to build a golden set     ⚠ our biggest blocker
    · 4 weeks integration
    · security review

  → We built a golden-set bootstrapper: import resolved
    tickets, auto-generate candidate cases, support lead
    reviews 220 of them in two sessions instead of six months.

  ⚠ The single largest growth investment we made was
    reducing the switching cost INTO the product — the
    mirror image of the thing that retains customers.`
    },
    prereq: ['competitive-advantage'], next: ['business-models'],
    related: ['network-effects', 'competitive-advantage', 'ai-build-vs-buy', 'cohorts-retention'],
    tools: [],
    useCases: [
      'Understanding why retention holds despite mediocre satisfaction.',
      'Deciding whether to make customer data exportable.',
      'Finding the blocker slowing acquisition.'
    ],
    avoid: [
      'Imposed switching costs, which generate resentment and eventual churn.',
      'Ignoring the switching cost into your own product.'
    ],
    mistakes: [
      'Retaining customers through obstruction rather than accumulated value.',
      'Forgetting that high switching costs slow acquisition as much as churn.',
      'Withholding export, which discourages customers from building the asset in the first place.',
      'Treating risk of the alternative being worse as a soft factor when it is often the largest.'
    ],
    keyTerms: [
      ['switching cost', 'What a customer spends to move to an alternative.'],
      ['earned switching cost', 'From accumulated value the customer benefits from.'],
      ['imposed switching cost', 'From deliberate obstruction.'],
      ['migration tooling', 'Reducing the switching cost into your product.'],
      ['lock-in', 'The result of switching costs, benign or otherwise.'],
      ['export', 'Letting customers take their data. Builds willingness to invest.']
    ],
    resources: [
      ['Hamilton Helmer — 7 Powers (overview)', 'https://www.7powers.com/', 'reference'],
      ['a16z — the new business of AI', 'https://a16z.com/the-new-business-of-ai-and-how-its-different-from-traditional-software/', 'article'],
      ['Reforge — retention', 'https://www.reforge.com/blog/retention-engagement-growth-silent-killer', 'article']
    ],
    questions: [
      ['What is the difference between earned and imposed switching costs?', 'Earned costs come from accumulated value the customer benefits from; imposed ones from obstruction. Both retain customers, but imposed costs generate resentment and collapse the moment a competitor offers migration help.'],
      ['Why do switching costs slow your own growth?', 'A prospect facing an expensive migration into your product is as stuck as your customers are. Migration tooling is a growth investment, not a support feature.'],
      ['Why make an AI evaluation set exportable?', 'A customer who knows they could leave with it is more willing to invest in building it — and the golden set is the thing that creates the earned switching cost in the first place.']
    ]
  },

  {
    id: 'business-models',
    title: 'Business Models',
    domain: 'strategy', tier: 2, priority: 'medium',
    summary: 'How a product captures value — and why AI breaks some familiar models.',
    what: `A business model describes how a product creates value, who pays, on what basis, and how the cost of delivery relates to what is charged.`,
    why: `AI features have a per-request marginal cost that conventional software does not. Models built on the assumption of near-zero delivery cost — unlimited seats, flat-rate plans — behave differently when every use costs money.`,
    analogy: `A gym membership when every visit costs the gym money. The all-you-can-use plan works when marginal cost is near zero and fails when it is not.`,
    technical: `The common models: **subscription** (per seat or per organisation), **usage-based** (per request, per token, per outcome), **hybrid** (a base plus overage), **transaction fee**, **freemium**, and **enterprise licence**.

**The AI complication:** per-seat pricing with unlimited usage means your cost scales with engagement while your revenue does not. A power user can cost more than they pay, and the more successful the feature is, the worse this gets. Teams discover this when adoption succeeds.

The responses that work:
- **Hybrid** — a base fee with a generous included allowance and overage beyond it. Predictable for the customer, bounded for you.
- **Outcome pricing** — charge per resolved ticket or per completed task. Aligns with value and is harder to compare against competitors on unit price. Requires being able to measure the outcome reliably.
- **Tiered by capability** — cheaper model on lower tiers, better model higher. Aligns cost with price naturally.

**Freemium needs particular care.** A free tier with a real marginal cost is a subsidy that scales with adoption, so it needs hard usage caps rather than soft ones, and it needs a conversion path that is actually measured.

**Whatever the model, know your cost per unit of value delivered.** That number is what tells you whether a plan is profitable, and for AI features it moves with model prices, context length and adoption patterns.`,
    diagram: `
   THE COMMON MODELS

     SUBSCRIPTION      per seat · per organisation
     USAGE-BASED       per request · per token · per outcome
     HYBRID            base + included allowance + overage
     TRANSACTION FEE   a cut of what flows through
     FREEMIUM          free tier converting to paid
     ENTERPRISE        negotiated licence

   ⚠ THE AI COMPLICATION

     per-seat + unlimited usage

       your COST scales with engagement
       your REVENUE does not

     → a power user can cost more than they pay
     → the MORE SUCCESSFUL the feature, the worse it gets
     → teams discover this when adoption SUCCEEDS

   WHAT WORKS INSTEAD

     HYBRID            base + generous allowance + overage
                       predictable for them, bounded for you

     OUTCOME PRICING   per resolved ticket, per completed task
                       aligns with value
                       harder to compare on unit price
                       ⚠ requires reliably MEASURING the outcome

     TIERED BY         cheaper model on lower tiers
     CAPABILITY        aligns cost with price naturally

   ⚠ FREEMIUM NEEDS HARD CAPS

     a free tier with real marginal cost is a subsidy
     that SCALES WITH ADOPTION

   KNOW YOUR COST PER UNIT OF VALUE DELIVERED

     for AI it moves with model prices, context length
     and adoption patterns — so it is not a one-time number`,
    example: {
      language: 'python',
      caption: 'When per-seat pricing stops working',
      code: `PRICE_PER_SEAT = 40      # per month
COST_PER_QUERY = 0.0116  # tokens + non-token, per resolved question

def seat_margin(queries_per_month):
    cost = queries_per_month * COST_PER_QUERY
    return {"queries": queries_per_month,
            "cost": round(cost, 2),
            "margin": round(PRICE_PER_SEAT - cost, 2),
            "margin_pct": round((PRICE_PER_SEAT - cost)/PRICE_PER_SEAT*100)}

for q in (100, 500, 1_200, 3_400, 8_000):
    print(seat_margin(q))

# {'queries': 100,   'cost': 1.16,  'margin': 38.84, 'margin_pct': 97}
# {'queries': 500,   'cost': 5.80,  'margin': 34.20, 'margin_pct': 86}
# {'queries': 1200,  'cost': 13.92, 'margin': 26.08, 'margin_pct': 65}
# {'queries': 3400,  'cost': 39.44, 'margin':  0.56, 'margin_pct':  1}  ⚠
# {'queries': 8000,  'cost': 92.80, 'margin': -52.80, 'margin_pct': -132} ⚠

# ⚠ BREAK-EVEN AT ~3,450 QUERIES/MONTH — about 165/working day.
#   That is a heavy user, and heavy users are exactly the ones
#   who love the product and renew.
#
#   THE MODEL PUNISHES SUCCESS. As adoption improves, blended
#   margin falls. Nothing in a conventional SaaS dashboard
#   makes this visible until it is a problem.

# ── ACTUAL DISTRIBUTION, month 9 ───────────────────────────
DIST = {100: 0.31, 500: 0.34, 1200: 0.22, 3400: 0.10, 8000: 0.03}
blended = sum(seat_margin(q)["margin"] * w for q, w in DIST.items())
print(round(blended, 2))    # 25.79 per seat — still healthy
#
# ⚠ But the distribution is SHIFTING RIGHT as adoption grows.
#   Modelled forward at current adoption growth: blended margin
#   crosses below 50% in about seven months.

# ── HYBRID: the fix ────────────────────────────────────────
def hybrid(queries, base=40, included=1500, overage=0.02):
    cost = queries * COST_PER_QUERY
    revenue = base + max(0, queries - included) * overage
    return round(revenue - cost, 2)

for q in (100, 500, 1_200, 3_400, 8_000):
    print(q, hybrid(q))
# 100  38.84
# 500  34.2
# 1200 26.08
# 3400 38.56    ← margin RESTORED on heavy users
# 8000 37.2

# 97% of users see no change — 1,500 included queries is far
# above their usage. The 3% who were unprofitable now are not,
# and their bill is predictable because they can see the meter.`
    },
    prereq: [], next: ['pricing', 'unit-economics'],
    related: ['pricing', 'unit-economics', 'ai-cost', 'ltv-cac'],
    tools: [],
    useCases: [
      'Choosing a pricing model for a feature with real marginal cost.',
      'Finding the usage level at which a plan stops being profitable.',
      'Designing a free tier that does not scale into a liability.'
    ],
    avoid: [
      'Unlimited per-seat plans for high-marginal-cost features.',
      'Free tiers with soft usage caps.'
    ],
    mistakes: [
      'Assuming near-zero marginal cost, which is a software habit AI breaks.',
      'Not modelling how the usage distribution shifts as adoption grows.',
      'Discovering the margin problem only after the feature succeeds.',
      'Adopting outcome pricing without being able to measure the outcome reliably.'
    ],
    keyTerms: [
      ['marginal cost', 'The cost of serving one more use.'],
      ['per-seat pricing', 'Charging per user regardless of usage.'],
      ['usage-based pricing', 'Charging per request, token or outcome.'],
      ['hybrid pricing', 'A base fee plus overage beyond an allowance.'],
      ['outcome pricing', 'Charging per resolved task rather than per call.'],
      ['blended margin', 'Average margin across the usage distribution.']
    ],
    resources: [
      ['a16z — the new business of AI', 'https://a16z.com/the-new-business-of-ai-and-how-its-different-from-traditional-software/', 'article'],
      ['Reforge — pricing and monetisation', 'https://www.reforge.com/blog/pricing-strategy', 'article'],
      ['OpenView — usage-based pricing', 'https://en.wikipedia.org/wiki/Software_as_a_service', 'reference']
    ],
    questions: [
      ['Why does per-seat pricing break for AI features?', 'Cost scales with engagement while revenue does not, so a heavy user can cost more than they pay — and the more successful the feature is, the worse the blended margin gets.'],
      ['What does a hybrid model fix?', 'It leaves the large majority of users unaffected by including a generous allowance, while restoring margin on the small share of heavy users whose usage exceeds it.'],
      ['What does outcome pricing require?', 'The ability to measure the outcome reliably. Charging per resolved ticket aligns with value and resists unit-price comparison, but only if resolution can be determined.']
    ]
  }
];
