/**
 * DOMAIN V — ECONOMICS + FINANCE BASICS, part 1: how markets behave
 * (BUILD.md section 25)
 */
export const topics = [
  {
    id: 'supply-demand',
    title: 'Supply & Demand',
    domain: 'economics', tier: 2, priority: 'medium',
    summary: 'Price is where what people will pay meets what suppliers will provide.',
    what: `Demand describes how much buyers want at each price; supply describes how much sellers will provide at each price. Price moves toward where the two meet.`,
    why: `It is the model behind most pricing intuition, and knowing where it applies and where it does not prevents a lot of confident nonsense. It also explains what happens to a market when a supply constraint suddenly relaxes — which is exactly what happened to AI capability.`,
    analogy: `An auction. The price is not set by the auctioneer; it emerges from how many bidders want the item and how many identical items exist.`,
    technical: `Demand generally falls as price rises; supply generally rises. Equilibrium is where they cross. Shift either curve and the price and quantity both move.

**What shifts demand:** income, preferences, the price of substitutes and complements, expectations.
**What shifts supply:** input costs, technology, the number of producers, regulation.

**The distinction people get wrong** is between a movement *along* a curve (price changed) and a *shift* of the curve (something else changed). "Sales fell when we raised the price" is a movement; "sales fell because a competitor launched" is a shift, and they call for opposite responses.

**Where the model applies poorly:** markets with few sellers, heavy switching costs, strong brand differentiation, or where the buyer cannot evaluate quality before purchase. Much of enterprise software sits in that last category.

**The AI-relevant case is a supply shock.** Model capability went from scarce and expensive to abundant and cheap in a few years. When supply expands that sharply, price falls toward marginal cost, and value migrates to whatever is still scarce — which is proprietary data, distribution and integration, not the capability itself.`,
    diagram: `
   THE MODEL

     price
       │╲                    ╱  supply
       │ ╲                 ╱
       │  ╲              ╱
       │   ╲     ✕     ╱          ← equilibrium
       │    ╲       ╱
       │      ╲  ╱
       │      ╱  ╲
       │   ╱        ╲  demand
       └──────────────────────► quantity

   ⚠ MOVEMENT ALONG vs SHIFT OF THE CURVE

     "sales fell when we raised the price"
       → movement ALONG the demand curve

     "sales fell because a competitor launched"
       → the demand curve SHIFTED

     these call for OPPOSITE responses

   WHERE THE MODEL APPLIES POORLY

     few sellers · heavy switching costs
     strong brand differentiation
     buyer cannot evaluate quality before purchase
       ← much of enterprise software

   ⚠ THE AI CASE IS A SUPPLY SHOCK

     model capability: scarce and expensive
                    → abundant and cheap, in a few years

     when supply expands that sharply:
       price falls toward MARGINAL COST
       value migrates to whatever is STILL SCARCE

     still scarce:  proprietary data · distribution
                    workflow integration · trust
     no longer:     the capability itself`,
    example: {
      language: 'text',
      caption: 'Reading a demand change correctly',
      code: `OBSERVATION  Trial-to-paid conversion fell from 22% to 14%
             in one quarter.

⚠ THE WRONG DIAGNOSIS
  "Demand fell. Cut the price."

  We had not changed the price. If nothing on our side moved
  along the curve, something shifted the curve — and cutting
  price responds to the wrong thing.

WHAT ACTUALLY SHIFTED — checking each demand shifter
  income / budgets      unchanged; no procurement freeze
  preferences           unchanged
  ⚠ SUBSTITUTES         the console vendor bundled a free
                        AI assistant in the quarter
  complements           unchanged
  expectations          ⚠ prospects now expect AI assistance
                        to be included, not purchased

  → the demand curve for a STANDALONE paid assistant shifted
    left, because a substitute became free.

⚠ WHY A PRICE CUT WOULD NOT HAVE WORKED
  The substitute is priced at zero. There is no price at
  which we win a comparison against free on the same axis.
  Cutting price would have reduced revenue and lost the
  positioning claim at the same time.

WHAT WE DID INSTEAD — compete where supply is still scarce
  The bundled substitute has the same model access we do.
  What it does not have:
    · the tenant's six years of labelled resolved tickets
    · abstention tuned to that tenant's risk appetite
    · an evaluation set the customer owns

  We moved the pitch from "AI answers" (now abundant, price
  → 0) to "answers you can audit, on your data" (still scarce).

  Conversion recovered to 19% at an unchanged price.

⚠ THE GENERAL LESSON
  A supply shock in a capability does not destroy the market.
  It relocates the value to whatever the shock did not make
  abundant. The strategic question after any such shock is
  always: what is still scarce?`
    },
    prereq: [], next: ['elasticity', 'market-structure'],
    related: ['pricing', 'competitive-advantage', 'market-structure', 'elasticity'],
    tools: [],
    useCases: [
      'Distinguishing a price effect from a market shift.',
      'Understanding what a capability becoming abundant does to value.',
      'Avoiding a price cut that responds to the wrong cause.'
    ],
    avoid: [
      'Applying the model to markets with heavy switching costs and few sellers without adjustment.',
      'Responding to a curve shift with a price change.'
    ],
    mistakes: [
      'Confusing a movement along the curve with a shift of it.',
      'Cutting price to compete against a free substitute.',
      'Assuming a supply shock destroys a market rather than relocating its value.',
      'Treating enterprise software as a textbook competitive market.'
    ],
    keyTerms: [
      ['demand curve', 'How much buyers want at each price.'],
      ['supply curve', 'How much sellers provide at each price.'],
      ['equilibrium', 'Where supply and demand cross.'],
      ['substitute', 'Something that serves the same purpose.'],
      ['complement', 'Something used alongside; its price affects demand.'],
      ['supply shock', 'A sharp expansion or contraction in supply.'],
      ['curve shift', 'A change from something other than price.']
    ],
    resources: [
      ['Khan Academy — supply and demand', 'https://www.khanacademy.org/economics-finance-domain/microeconomics', 'course'],
      ['CORE Econ — The Economy', 'https://www.core-econ.org/the-economy/', 'course'],
      ['a16z — the new business of AI', 'https://a16z.com/the-new-business-of-ai-and-how-its-different-from-traditional-software/', 'article']
    ],
    questions: [
      ['What is the difference between a movement along the demand curve and a shift?', 'A movement is a response to your own price change; a shift comes from something else — a substitute, income, preferences. They call for opposite responses.'],
      ['What does a supply shock do to value?', 'It relocates it. When a capability becomes abundant, its price falls toward marginal cost and value migrates to what is still scarce — data, distribution, integration, trust.'],
      ['Why can you not compete on price against a free bundled substitute?', 'There is no price at which you win that comparison. The response is to compete on an axis where supply is still constrained, not to cut price.']
    ]
  },

  {
    id: 'elasticity',
    title: 'Elasticity',
    domain: 'economics', tier: 3, priority: 'low',
    summary: 'How much demand responds to a change in price.',
    what: `Price elasticity measures the percentage change in quantity demanded for a percentage change in price. Demand is **elastic** when it responds strongly and **inelastic** when it barely responds.`,
    why: `It determines whether raising a price increases or decreases revenue. That is not a matter of opinion, and most teams have never measured it for their own product.`,
    analogy: `Petrol versus restaurant meals. Petrol prices rise and people buy nearly the same amount; restaurant prices rise and people cook at home.`,
    technical: `Elasticity = %Δ quantity ÷ %Δ price. Below 1 in magnitude is inelastic; above 1 is elastic.

**The revenue consequence:** if demand is inelastic, raising price raises revenue. If elastic, raising price lowers it. This is the whole practical point.

What makes demand **inelastic**: few substitutes, high switching costs, the purchase is a small share of the buyer's budget, it is a necessity, or the buyer is not the payer.

What makes it **elastic**: many substitutes, easy switching, discretionary purchase, price is highly visible and comparable.

**B2B software is often more inelastic than teams assume** — switching costs are high, the buyer is not personally paying, and the price is a small fraction of the salary cost it affects. This is a large part of why most products are underpriced.

**Elasticity is not constant.** It differs by segment, and it changes as substitutes appear. A product that was inelastic becomes elastic the moment a credible free alternative exists — which is what a bundled competitor does to you.

**Measure it rather than assuming it.** Segment-level price tests, win/loss analysis on price objections, and observing what happens at renewal all give real signal.`,
    diagram: `
   ELASTICITY = %Δ quantity ÷ %Δ price

     |E| < 1   INELASTIC   quantity barely moves
                           ⚠ raising price RAISES revenue
     |E| > 1   ELASTIC     quantity moves a lot
                           ⚠ raising price LOWERS revenue

   WHAT MAKES DEMAND INELASTIC

     few substitutes
     high switching costs
     small share of the buyer's budget
     it is a necessity
     ⚠ THE BUYER IS NOT THE PAYER

   WHAT MAKES IT ELASTIC

     many substitutes · easy switching
     discretionary · price visible and comparable

   ⚠ B2B SOFTWARE IS OFTEN MORE INELASTIC THAN ASSUMED

     switching costs high
     buyer is not personally paying
     price is a small fraction of the salary cost it affects

     → which is a large part of why most products
       are UNDERPRICED

   ⚠ ELASTICITY IS NOT CONSTANT

     it differs by SEGMENT
     and it CHANGES when substitutes appear

     a product that was inelastic becomes elastic the moment
     a credible free alternative exists — which is exactly
     what a bundled competitor does to you

   MEASURE IT: segment price tests · win/loss on price
   objections · renewal behaviour`,
    example: {
      language: 'python',
      caption: 'Measuring elasticity per segment before a price change',
      code: `def elasticity(q_before, q_after, p_before, p_after):
    pct_q = (q_after - q_before) / q_before
    pct_p = (p_after - p_before) / p_before
    return round(pct_q / pct_p, 2)

# A 12% price increase, run as a test on new customers only,
# measured per segment over one quarter.

TESTS = [
  ("enterprise",  {"q_before": 18, "q_after": 17, "p_before": 8000, "p_after": 8960}),
  ("mid-market",  {"q_before": 44, "q_after": 39, "p_before": 1800, "p_after": 2016}),
  ("small teams", {"q_before": 96, "q_after": 61, "p_before":  400, "p_after":  448}),
]

for name, t in TESTS:
    e = elasticity(**t)
    rev_before = t["q_before"] * t["p_before"]
    rev_after  = t["q_after"]  * t["p_after"]
    verdict = "INELASTIC — raise it" if abs(e) < 1 else "ELASTIC — do not"
    print(f"{name:<12} E={e:>6}  revenue {rev_before:>7,} → {rev_after:>7,}  "
          f"{'+' if rev_after>rev_before else ''}{rev_after-rev_before:>7,}  {verdict}")

# enterprise   E=  -0.46  revenue 144,000 → 152,320   + 8,320  INELASTIC — raise it
# mid-market   E=  -0.95  revenue  79,200 →  78,624   -   576  INELASTIC — raise it
# small teams  E=  -3.04  revenue  38,400 →  27,328   -11,072  ELASTIC — do not

# ⚠ THREE SEGMENTS, THREE DIFFERENT ANSWERS.
#   A single blended elasticity (-1.31) would have said
#   "do not raise prices anywhere" and left the enterprise
#   increase — the profitable one — on the table.

# ⚠ WHY SMALL TEAMS ARE ELASTIC
#   The bundled console assistant is free and adequate for
#   simple needs. For that segment a credible substitute
#   exists, so price sensitivity is high.
#   For enterprise, the substitute cannot pass their security
#   review or use their tenant data — no real substitute,
#   so demand is inelastic.
#
#   Elasticity is not a property of our product. It is a
#   property of the SUBSTITUTES available to each segment.

# DECISION  raise enterprise 12%, mid-market 8%, hold small.
#           Recheck in two quarters — if the bundled
#           substitute improves, mid-market elasticity moves.`
    },
    prereq: ['supply-demand'], next: [],
    related: ['pricing', 'supply-demand', 'unit-economics', 'switching-costs'],
    tools: [],
    useCases: [
      'Deciding whether a price increase will raise or lower revenue.',
      'Finding which segment can absorb a price change.',
      'Explaining why a segment became price-sensitive.'
    ],
    avoid: [
      'A single blended elasticity used for all segments.',
      'Assuming elasticity rather than measuring it.'
    ],
    mistakes: [
      'Assuming demand is elastic and never testing a price increase.',
      'Using a blended figure that averages away the profitable decision.',
      'Treating elasticity as fixed when it changes as substitutes appear.',
      'Forgetting that in B2B the buyer is usually not the payer, which lowers sensitivity.'
    ],
    keyTerms: [
      ['price elasticity', 'Percentage change in quantity per percentage change in price.'],
      ['elastic demand', 'Responds strongly to price. Raising price lowers revenue.'],
      ['inelastic demand', 'Barely responds. Raising price raises revenue.'],
      ['substitute availability', 'The main driver of elasticity.'],
      ['segment elasticity', 'Elasticity computed per customer group.'],
      ['buyer vs payer', 'In B2B they differ, which lowers sensitivity.']
    ],
    resources: [
      ['Khan Academy — elasticity', 'https://www.khanacademy.org/economics-finance-domain/microeconomics', 'course'],
      ['CORE Econ — The Economy', 'https://www.core-econ.org/the-economy/', 'course'],
      ['Reforge — pricing strategy', 'https://www.reforge.com/blog/pricing-strategy', 'article']
    ],
    questions: [
      ['What does elasticity tell you about a price increase?', 'Whether it raises or lowers revenue. Inelastic demand means raising price raises revenue; elastic demand means it lowers it. That is the whole practical point.'],
      ['What actually determines elasticity?', 'The substitutes available to that buyer. It is a property of their alternatives, not of your product — which is why it differs by segment and changes when a competitor bundles a free version.'],
      ['Why is B2B software often underpriced?', 'Demand is more inelastic than teams assume: switching costs are high, the buyer is not personally paying, and the price is a small fraction of the salary cost it affects.']
    ]
  },

  {
    id: 'market-structure',
    title: 'Competition & Market Structure',
    domain: 'economics', tier: 3, priority: 'low',
    summary: 'How many sellers there are, and what that does to prices and profits.',
    what: `Market structure describes the competitive shape of a market: perfect competition, monopolistic competition, oligopoly and monopoly, distinguished by the number of sellers and how differentiated their products are.`,
    why: `Structure predicts profitability. A market drifting toward perfect competition sees margins compress regardless of how well any individual company executes, and recognising that drift early is what lets you move before it arrives.`,
    analogy: `Market stalls selling identical vegetables versus the only pharmacy in town. Effort matters in both; the ceiling on returns is set by the structure.`,
    technical: `**Perfect competition** — many sellers, identical products, no barriers. Price falls to marginal cost and economic profit tends to zero. Nobody wants to be here.

**Monopolistic competition** — many sellers, differentiated products. Some pricing power from differentiation. Most software markets.

**Oligopoly** — few sellers, high barriers. Substantial pricing power, and behaviour is interdependent.

**Monopoly** — one seller. Maximum pricing power, and regulatory attention.

**Barriers to entry are what preserve structure.** Capital, technology, regulation, network effects, brand. Where barriers fall, structure drifts toward competition.

**The AI-relevant observation:** access to model capability has very low barriers — an API key and a credit card. That pushes the *application* layer toward monopolistic competition at best, with differentiation coming from data, integration and trust rather than from capability. Meanwhile the *model* layer has extreme barriers — capital, compute, talent — and looks like an oligopoly.

**A layer with low barriers sitting on top of a layer with high barriers** means the value distribution between them is contested, and the application layer's margin depends on how much the model layer chooses to charge.`,
    diagram: `
   FOUR STRUCTURES

     PERFECT COMPETITION     many sellers · identical products
                             no barriers
                             ⚠ price → marginal cost
                               economic profit → 0

     MONOPOLISTIC            many sellers · DIFFERENTIATED
     COMPETITION             some pricing power
                             ← most software markets

     OLIGOPOLY               few sellers · high barriers
                             substantial pricing power
                             behaviour is interdependent

     MONOPOLY                one seller · maximum power
                             and regulatory attention

   BARRIERS TO ENTRY PRESERVE STRUCTURE

     capital · technology · regulation
     network effects · brand

     where barriers FALL, structure drifts toward competition

   ⚠ THE AI STACK HAS TWO STRUCTURES AT ONCE

     MODEL LAYER          extreme barriers
       capital · compute · talent
       → looks like an OLIGOPOLY

     APPLICATION LAYER    very low barriers
       an API key and a credit card
       → monopolistic competition AT BEST

   ⚠ A LOW-BARRIER LAYER SITTING ON A HIGH-BARRIER LAYER

     the value distribution between them is CONTESTED

     your margin at the application layer depends on what
     the model layer chooses to charge — which is not a
     variable you control`,
    example: {
      language: 'text',
      caption: 'Reading a market drifting toward competition',
      code: `MARKET  "AI assistant for customer support"

2023 — the barriers were real
  · few teams could build retrieval that worked
  · model access was gated and expensive
  · prompting was a scarce skill
  → oligopoly-ish. Four credible vendors. Prices held.

2026 — the barriers fell
  · retrieval is a well-documented pattern with libraries
  · model access is an API key and a credit card
  · prompting is widely understood
  · the console vendor bundles a passable version free
  → perfect competition at the CAPABILITY level.
    Nineteen vendors. Price compression on every renewal.

⚠ WHAT DRIFTS AND WHAT DOES NOT

  drifting toward commodity        NOT drifting
  ────────────────────────────     ────────────────────────
  answering questions from docs    per-tenant labelled data
  citation UI                      console integration +
  abstention as a feature            procurement position
  prompt quality                   an evaluation set the
  model choice                       customer owns and trusts
                                   security posture

  The left column is the product most vendors describe.
  The right column is where the remaining barriers are.

⚠ THE TWO-LAYER PROBLEM
  Our gross margin is 63%. The largest variable cost is the
  model provider's price — set by a layer with far higher
  barriers than ours.

  If model prices halve, our margin improves and so does
  every competitor's, so the benefit competes away.
  If model prices rise, our margin falls and we have limited
  ability to pass it on, because the application layer is
  competitive.

  → this asymmetry is a structural feature, not a
    negotiating failure. The responses that exist:
      · reduce dependence (route more traffic to smaller
        or local models where quality permits)
      · move value into the layer we control (the data and
        evaluation loop)
      · price on OUTCOME rather than per-request, so our
        revenue is not indexed to a cost we do not set

STRATEGIC READING
  Do not invest in the left column as differentiation.
  It is a race to marginal cost and the finish line is
  visible from here.`
    },
    prereq: ['supply-demand'], next: ['externalities'],
    related: ['competitive-advantage', 'competitive-analysis', 'supply-demand', 'unit-economics'],
    tools: [],
    useCases: [
      'Recognising a market drifting toward commodity.',
      'Deciding which parts of a product to stop defending.',
      'Understanding why a cost reduction competes away.'
    ],
    avoid: [
      'Investing in differentiation at a layer with no barriers.',
      'Treating structural margin pressure as a negotiating failure.'
    ],
    mistakes: [
      'Assuming today\'s barriers persist when they are falling.',
      'Competing on capability in a market where capability has become abundant.',
      'Missing that a cost reduction available to everyone improves nobody\'s position.',
      'Indexing revenue to a per-request cost you do not control.'
    ],
    keyTerms: [
      ['perfect competition', 'Many sellers, identical products, zero economic profit.'],
      ['monopolistic competition', 'Many sellers, differentiated products.'],
      ['oligopoly', 'Few sellers, high barriers, interdependent behaviour.'],
      ['barriers to entry', 'What preserves a market structure.'],
      ['commoditisation', 'Drift toward identical products and marginal-cost pricing.'],
      ['layer asymmetry', 'A low-barrier layer depending on a high-barrier one.']
    ],
    resources: [
      ['Porter — the five competitive forces', 'https://hbr.org/2008/01/the-five-competitive-forces-that-shape-strategy', 'article'],
      ['CORE Econ — The Economy', 'https://www.core-econ.org/the-economy/', 'course'],
      ['a16z — the new business of AI', 'https://a16z.com/the-new-business-of-ai-and-how-its-different-from-traditional-software/', 'article']
    ],
    questions: [
      ['Why does market structure predict profitability?', 'It sets the ceiling. In perfect competition price falls to marginal cost and economic profit tends to zero regardless of how well an individual company executes.'],
      ['What are the two structures in the AI stack?', 'The model layer has extreme barriers — capital, compute, talent — and behaves like an oligopoly. The application layer needs an API key and a credit card, so it drifts toward competition.'],
      ['Why does a fall in model prices not help your position?', 'It helps every competitor equally, so in a competitive layer the benefit competes away. Structural advantage has to come from something competitors cannot also obtain.']
    ]
  }
];
