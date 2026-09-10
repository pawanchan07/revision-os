/**
 * DOMAIN V — ECONOMICS + FINANCE BASICS, part 4: the finance a PM is asked to read
 */
export const topics = [
  {
    id: 'revenue-and-margins',
    title: 'Revenue & Gross Margin',
    domain: 'economics', tier: 2, priority: 'medium',
    summary: 'What comes in, what it costs to deliver, and why the second number defines the business.',
    what: `**Revenue** is what customers pay. **Cost of goods sold (COGS)** is what it costs to deliver the service. **Gross margin** is revenue minus COGS, as a percentage — the money available for everything else.`,
    why: `Gross margin determines what kind of company you are. It sets how much you can spend on sales, engineering and support, and it is the number investors use to categorise a business.`,
    analogy: `A restaurant's food cost. Revenue is the bill; COGS is the ingredients and kitchen labour. What is left has to cover rent, staff and profit.`,
    technical: `**What belongs in COGS for a software business:** hosting, third-party services consumed per customer, payment processing, customer success and support attributable to delivery, and — for AI — inference cost and the ongoing human review the product requires.

**What does not:** sales, marketing, R&D, general administration. Those come out of gross profit.

**Revenue recognition matters.** An annual contract paid up front is cash today and revenue spread over twelve months. Confusing the two overstates growth, and it is a common error in early-stage reporting.

**ARR and MRR** are recurring-revenue figures. They exclude one-off services, and stretching the definition to include them is a well-known way to flatter a number.

**Typical gross margins:** pure software 80–90%; software with meaningful services 60–75%; **AI-heavy products commonly 50–75%** because inference is a real per-use cost.

**The AI-specific point:** COGS scales with usage, so gross margin moves with engagement. A successful feature can lower gross margin, which is counterintuitive and shows up as a surprise in a quarterly review. Track margin per segment and per cohort, and watch its trajectory rather than its level.`,
    diagram: `
   THE STACK

     REVENUE                    what customers pay
       − COST OF GOODS SOLD     what delivery costs
     ─────────────────────
     = GROSS PROFIT             money for everything else
       ÷ revenue = GROSS MARGIN %

       − sales and marketing
       − R&D
       − general and administrative
     ─────────────────────
     = OPERATING PROFIT

   WHAT BELONGS IN COGS (software)

     hosting · per-customer third-party services
     payment processing · delivery-attributable support
     ⚠ for AI: inference cost AND ongoing human review

   WHAT DOES NOT

     sales · marketing · R&D · admin
     (these come out of gross profit)

   TYPICAL GROSS MARGINS

     pure software        ████████████████████  80-90%
     software + services  ██████████████        60-75%
     AI-heavy product     ████████████          50-75%

   ⚠ THE AI-SPECIFIC POINT

     COGS SCALES WITH USAGE
     → gross margin MOVES WITH ENGAGEMENT
     → a successful feature can LOWER gross margin

     counterintuitive, and it arrives as a surprise
     in a quarterly review

     track margin PER SEGMENT and PER COHORT
     watch the TRAJECTORY, not the level

   ⚠ REVENUE ≠ CASH

     an annual contract paid up front:
       cash today, revenue spread over 12 months
     confusing the two overstates growth`,
    example: {
      language: 'python',
      caption: 'Gross margin moving in the wrong direction as adoption improves',
      code: `def gross_margin(revenue, cogs_items):
    cogs = sum(cogs_items.values())
    gp = revenue - cogs
    return {"revenue": revenue, "cogs": round(cogs),
            "gross_profit": round(gp),
            "gross_margin_pct": round(gp / revenue * 100, 1)}

# Same 60-agent account, three quarters apart.

Q1 = gross_margin(21_600, {
    "hosting": 900, "inference": 1_180, "payment_fees": 216,
    "support_delivery": 1_400, "human_review": 900,
})
Q4 = gross_margin(21_600, {           # ⚠ revenue UNCHANGED
    "hosting": 950, "inference": 3_640,   # adoption 44% → 79%
    "payment_fees": 216,
    "support_delivery": 1_500, "human_review": 1_650,  # more flags
})

print("Q1", Q1)
print("Q4", Q4)
# Q1 {'revenue': 21600, 'cogs': 4596,  'gross_profit': 17004, 'gross_margin_pct': 78.7}
# Q4 {'revenue': 21600, 'cogs': 7956,  'gross_profit': 13644, 'gross_margin_pct': 63.2}

# ⚠ GROSS MARGIN FELL 15 POINTS AND NOTHING WENT WRONG.
#   Adoption rose from 44% to 79%. The product is working
#   better and delivering more value. Under a flat per-seat
#   contract, revenue did not move and delivery cost did.
#
#   In a conventional software business this does not happen,
#   which is why it surprises people who have only seen one.

# ── WHAT IT LOOKS LIKE ACROSS THE COHORT ───────────────────
COHORTS = {                       # adoption, accounts
    "signed Q1": (0.79, 12),
    "signed Q2": (0.61,  9),
    "signed Q3": (0.44, 14),
}
for name, (adoption, n) in COHORTS.items():
    inference = 1_180 * (adoption / 0.44)
    review    =   900 * (adoption / 0.44) ** 0.7
    m = gross_margin(21_600, {"hosting": 950, "inference": inference,
                              "payment_fees": 216, "support_delivery": 1_500,
                              "human_review": review})
    print(f"{name}  adoption {adoption:.0%}  margin {m['gross_margin_pct']}%  n={n}")

# signed Q1  adoption 79%  margin 63.5%  n=12
# signed Q2  adoption 61%  margin 70.2%  n=9
# signed Q3  adoption 44%  margin 78.7%  n=14

# ⚠ THE OLDEST COHORT HAS THE WORST MARGIN. That is the
#   trajectory, and averaging across cohorts hides it —
#   blended margin today is 71%, and every cohort is heading
#   toward 63% as it matures.
#
#   → the pricing model, not the cost, is what needs to change.
#     A hybrid structure with usage above an allowance turns
#     rising adoption from a margin problem into revenue.`
    },
    prereq: [], next: ['contribution-margin', 'cash-flow'],
    related: ['unit-economics', 'contribution-margin', 'business-models', 'ai-cost', 'cash-flow'],
    tools: [],
    useCases: [
      'Reading a P&L and knowing what belongs where.',
      'Explaining why margin fell while the product improved.',
      'Deciding whether a pricing model needs restructuring.'
    ],
    avoid: [
      'Confusing cash received with revenue recognised.',
      'Blended margin used to assess a trajectory.'
    ],
    mistakes: [
      'Leaving ongoing human review out of COGS for an AI product.',
      'Treating an up-front annual payment as a single period’s revenue.',
      'Reading the margin level rather than its direction across cohorts.',
      'Assuming rising adoption always improves the financials.'
    ],
    keyTerms: [
      ['revenue', 'What customers pay, recognised over the service period.'],
      ['COGS', 'The cost of delivering the service.'],
      ['gross margin', 'Gross profit as a percentage of revenue.'],
      ['ARR / MRR', 'Annual and monthly recurring revenue.'],
      ['revenue recognition', 'Spreading revenue over the period earned.'],
      ['cohort margin', 'Margin computed per signing cohort; reveals trajectory.']
    ],
    resources: [
      ['a16z — 16 startup metrics', 'https://a16z.com/16-startup-metrics/', 'article'],
      ['David Skok — SaaS metrics', 'https://www.forentrepreneurs.com/saas-metrics-2/', 'reference'],
      ['a16z — the new business of AI', 'https://a16z.com/the-new-business-of-ai-and-how-its-different-from-traditional-software/', 'article']
    ],
    questions: [
      ['What belongs in COGS for an AI product that does not for conventional software?', 'Inference cost and the ongoing human review the system requires — error triage and evaluation maintenance. Both scale with usage and both are commonly omitted.'],
      ['Why can gross margin fall while a product improves?', 'COGS scales with usage. Under a flat per-seat contract, rising adoption increases delivery cost without increasing revenue, so success shows up as margin compression.'],
      ['Why look at margin by cohort?', 'Blended margin hides the trajectory. If the oldest cohort has the worst margin, every cohort is heading there, and the pricing model rather than the cost is what needs to change.']
    ]
  },

  {
    id: 'contribution-margin',
    title: 'Contribution Margin',
    domain: 'economics', tier: 2, priority: 'medium',
    summary: 'What each additional sale contributes once its variable costs are paid.',
    what: `Contribution margin is revenue minus variable cost, per unit. It is what each additional sale contributes toward fixed costs and, after those are covered, to profit.`,
    why: `It answers the operational questions gross margin does not: whether one more customer is worth having, how many you need to break even, and whether a discount is affordable.`,
    analogy: `A concert. The hall costs the same whether ten or a thousand people come. Each ticket's contribution is its price minus the cost of that one attendee, and the hall is paid for once enough have contributed.`,
    technical: `**Contribution margin = price − variable cost per unit.** Variable costs move with volume; fixed costs do not.

**Break-even** = fixed costs ÷ contribution margin per unit. That single expression answers how many customers a business needs.

**The distinction from gross margin:** gross margin uses COGS, an accounting category. Contribution margin uses variable cost, a behavioural one. They overlap heavily but not exactly — some COGS is fixed (a base hosting cost), and some non-COGS spending is variable.

**It is the right number for discount decisions.** A discount is affordable if the discounted price still exceeds variable cost and the sale would not otherwise happen. A discount below variable cost loses money on every unit, and volume makes it worse.

**For AI products, variable cost is unusually high and unusually visible**, which makes contribution margin more decision-relevant than in conventional software — where variable cost is near zero and almost any sale contributes.

**Watch for negative contribution segments.** A customer paying less than their variable cost is a loss that grows with their engagement, and low-price high-usage segments are where this hides.`,
    diagram: `
   CONTRIBUTION MARGIN = price − variable cost per unit

     what each additional sale contributes toward
     fixed costs, and after those, to profit

   BREAK-EVEN = fixed costs ÷ contribution margin per unit

     one expression, and it answers how many customers
     the business needs

   GROSS MARGIN vs CONTRIBUTION MARGIN

     GROSS         uses COGS — an ACCOUNTING category
     CONTRIBUTION  uses VARIABLE cost — a BEHAVIOURAL one

     they overlap heavily, not exactly:
       some COGS is fixed (base hosting)
       some non-COGS spending is variable

   ⚠ IT IS THE RIGHT NUMBER FOR DISCOUNT DECISIONS

     affordable   discounted price still exceeds variable
                  cost, AND the sale would not otherwise
                  happen
     not          below variable cost — loses money on every
                  unit, and VOLUME MAKES IT WORSE

   ⚠ FOR AI, VARIABLE COST IS HIGH AND VISIBLE

     conventional software  variable cost ≈ 0
                            almost any sale contributes
     AI product             a real per-use cost
                            → contribution margin is
                              decision-relevant

   ⚠ WATCH FOR NEGATIVE-CONTRIBUTION SEGMENTS

     a customer paying less than their variable cost is a
     loss that GROWS WITH THEIR ENGAGEMENT

     hides in low-price, high-usage segments`,
    example: {
      language: 'python',
      caption: 'Break-even, and a discount decision',
      code: `FIXED_MONTHLY = 340_000     # salaries, base infra, tooling, office

def contribution(price, variable_cost):
    cm = price - variable_cost
    return {"price": price, "variable": variable_cost,
            "contribution": round(cm, 2),
            "cm_pct": round(cm / price * 100, 1),
            "breakeven_units": round(FIXED_MONTHLY / cm) if cm > 0 else None}

TIERS = {
    "enterprise": contribution(8_000, 1_800),
    "mid-market": contribution(1_800,   673),
    "small":      contribution(  400,   432),   # ⚠
}
for name, t in TIERS.items():
    print(f"{name:<12}", t)

# enterprise   {'contribution': 6200.0, 'cm_pct': 77.5, 'breakeven_units': 55}
# mid-market   {'contribution': 1127.0, 'cm_pct': 62.6, 'breakeven_units': 302}
# small        {'contribution':  -32.0, 'cm_pct': -8.0, 'breakeven_units': None}

# ⚠ THE SMALL TIER HAS NEGATIVE CONTRIBUTION.
#   There is no volume at which it breaks even. Every sale
#   loses $32/month and the loss grows as those customers
#   use the product more — so the better it works for them,
#   the more it costs us.

# ── A DISCOUNT DECISION ────────────────────────────────────
def discount_ok(list_price, variable_cost, discount_pct,
                would_buy_anyway):
    net = list_price * (1 - discount_pct)
    cm = net - variable_cost
    return {"net_price": round(net), "contribution": round(cm),
            "covers_variable": cm > 0,
            "verdict": ("REFUSE — cannibalises a sale we would have made"
                        if would_buy_anyway else
                        "ACCEPT — positive contribution" if cm > 0 else
                        "REFUSE — loses money on every unit")}

print(discount_ok(1_800, 673, 0.35, would_buy_anyway=False))
# {'net_price': 1170, 'contribution': 497, 'covers_variable': True,
#  'verdict': 'ACCEPT — positive contribution'}

print(discount_ok(1_800, 673, 0.70, would_buy_anyway=False))
# {'net_price': 540, 'contribution': -133, 'covers_variable': False,
#  'verdict': 'REFUSE — loses money on every unit'}

print(discount_ok(1_800, 673, 0.35, would_buy_anyway=True))
# {'verdict': 'REFUSE — cannibalises a sale we would have made'}

# ⚠ BOTH CONDITIONS MATTER. A discount that covers variable
#   cost is still wrong if the customer would have paid full
#   price — the contribution test alone would have approved it.`
    },
    prereq: ['revenue-and-margins'], next: ['cash-flow'],
    related: ['unit-economics', 'revenue-and-margins', 'pricing', 'marginal-analysis', 'business-models'],
    tools: [],
    useCases: [
      'Deciding whether a discount is affordable.',
      'Computing how many customers are needed to break even.',
      'Finding a segment that loses money on every sale.'
    ],
    avoid: [
      'Discounts below variable cost.',
      'Using gross margin to answer a per-unit decision.'
    ],
    mistakes: [
      'Approving a discount on contribution grounds when the customer would have paid full price.',
      'Confusing fixed COGS with variable cost.',
      'Assuming volume fixes a negative-contribution segment — it deepens the loss.',
      'Carrying software habits into an AI product where variable cost is substantial.'
    ],
    keyTerms: [
      ['contribution margin', 'Price minus variable cost, per unit.'],
      ['variable cost', 'Cost that moves with volume.'],
      ['fixed cost', 'Cost that does not move with volume.'],
      ['break-even', 'Fixed costs divided by contribution per unit.'],
      ['negative contribution', 'Selling below variable cost.'],
      ['cannibalisation', 'A discount taken by a customer who would have paid more.']
    ],
    resources: [
      ['Harvard Business Review — contribution margin', 'https://hbr.org/2017/10/contribution-margin-what-it-is-how-to-calculate-it-and-why-you-need-it', 'article'],
      ['a16z — 16 startup metrics', 'https://a16z.com/16-startup-metrics/', 'article'],
      ['Reforge — unit economics', 'https://www.reforge.com/blog/unit-economics', 'article']
    ],
    questions: [
      ['What question does contribution margin answer that gross margin does not?', 'Whether one more sale is worth having. It uses variable cost — a behavioural category — so it directly answers break-even and discount decisions.'],
      ['When is a discount affordable?', 'When the discounted price still exceeds variable cost and the sale would not otherwise happen. Both conditions matter; the contribution test alone would approve cannibalising a full-price sale.'],
      ['Why is a negative-contribution segment not fixed by volume?', 'Each sale loses money, so more of them lose more. For AI products the loss also grows with engagement, meaning the better the product works, the more it costs.']
    ]
  },

  {
    id: 'cash-flow',
    title: 'Cash Flow & EBITDA',
    domain: 'economics', tier: 3, priority: 'low',
    summary: 'Profit is an opinion; cash is a fact.',
    what: `Cash flow is the actual money moving in and out. **EBITDA** — earnings before interest, taxes, depreciation and amortisation — is a rough proxy for operating cash generation, useful for comparison and easy to misuse.`,
    why: `Companies fail from running out of cash, not from being unprofitable on paper. A business can be growing, profitable by its accounts, and insolvent, because revenue and cash arrive at different times.`,
    analogy: `A profitable shop that pays suppliers in thirty days and gets paid in ninety. Every sale is profitable and the shop still cannot make payroll.`,
    technical: `**Profit and cash differ** because of timing: revenue recognised before payment arrives, costs paid before they are expensed, capital spending hitting cash immediately and profit gradually.

**Three sections of a cash flow statement:** operating (from the business), investing (buying and selling assets), and financing (raising and repaying capital).

**Runway** = cash ÷ net monthly burn. It is the number that determines how much time you have, and it is the one a PM should know for their own company.

**EBITDA strips out financing and accounting choices** so businesses can be compared. It is not cash flow — it ignores working capital changes and capital expenditure, which for some businesses is most of the story. Treating it as cash is a well-known error.

**The product decisions that affect cash:** annual up-front contracts improve cash dramatically compared to monthly; discounting for annual prepayment is often worth more than the discount costs. Longer payment terms to enterprise customers worsen cash, and enterprise deals frequently combine long sales cycles, long payment terms and high CAC — all of which consume cash before any arrives.

**For AI features, inference is paid monthly in arrears while customer revenue may be annual in advance.** That combination is cash-positive, which is unusual and worth knowing when arguing for a pricing structure.`,
    diagram: `
   ⚠ PROFIT IS AN OPINION. CASH IS A FACT.

     they differ because of TIMING

       revenue recognised   before payment arrives
       costs paid           before they are expensed
       capital spending     hits cash now, profit gradually

   THREE SECTIONS

     OPERATING    cash from running the business
     INVESTING    buying and selling assets
     FINANCING    raising and repaying capital

   RUNWAY = cash ÷ net monthly burn

     the number that determines how much TIME you have

   ⚠ EBITDA IS NOT CASH FLOW

     it strips out financing and accounting choices so
     businesses can be COMPARED

     it ignores working capital changes and capital
     expenditure — which for some businesses is most
     of the story

   PRODUCT DECISIONS THAT MOVE CASH

     annual up-front vs monthly     large improvement
     discount for prepayment        often worth more than
                                    the discount costs
     long enterprise payment terms  worsen cash
     enterprise deals               long cycle + long terms
                                    + high CAC = cash consumed
                                    before any arrives

   ⚠ THE AI TIMING IS FAVOURABLE, UNUSUALLY

     inference        paid monthly IN ARREARS
     customer revenue may be annual IN ADVANCE

     → cash-positive, and worth knowing when arguing
       for a pricing structure`,
    example: {
      language: 'python',
      caption: 'Profitable and running out of cash',
      code: `def project(months, *, new_customers_pm, acv, cac, monthly_variable,
            fixed_monthly, billing, payment_terms_days, starting_cash):
    cash, customers, log = starting_cash, 0, []
    for m in range(1, months + 1):
        customers += new_customers_pm

        # REVENUE (recognised) vs CASH (received)
        revenue = customers * acv / 12
        if billing == "annual":
            # only the customers who signed this month pay, in full
            collected = new_customers_pm * acv if m * 30 > payment_terms_days else 0
        else:
            collected = customers * acv / 12

        variable = customers * monthly_variable
        acquisition = new_customers_pm * cac          # paid NOW
        profit = revenue - variable - fixed_monthly - acquisition
        cash += collected - variable - fixed_monthly - acquisition

        log.append({"m": m, "customers": customers,
                    "profit": round(profit), "cash": round(cash)})
    return log

BASE = dict(new_customers_pm=6, acv=21_600, cac=6_800,
            monthly_variable=673, fixed_monthly=340_000,
            starting_cash=2_000_000, payment_terms_days=0)

print("MONTHLY BILLING")
for r in project(12, billing="monthly", **BASE)[::3]:
    print(r)
# {'m': 1,  'customers': 6,  'profit': -369438, 'cash': 1630562}
# {'m': 4,  'customers': 24, 'profit': -278752, 'cash':  731462}
# {'m': 7,  'customers': 42, 'profit': -188066, 'cash':  103166}
# {'m': 10, 'customers': 60, 'profit':  -97380, 'cash': -253070}  ⚠ INSOLVENT
#
# ⚠ Profit is improving every month and heading to positive.
#   Cash runs out in month 9. The business is working and
#   would die before it got there.

print("\\nANNUAL UP-FRONT BILLING — same business")
for r in project(12, billing="annual", **BASE)[::3]:
    print(r)
# {'m': 1,  'customers': 6,  'profit': -369438, 'cash': 1697762}
# {'m': 4,  'customers': 24, 'profit': -278752, 'cash': 1359686}
# {'m': 7,  'customers': 42, 'profit': -188066, 'cash': 1131278}
# {'m': 10, 'customers': 60, 'profit':  -97380, 'cash': 1012142}
#
# ⚠ IDENTICAL PROFIT. Twelve months of runway instead of nine,
#   and the trajectory is stable rather than terminal.

# ⚠ THE DECISION THIS SUPPORTS
#   A 15% discount for annual prepayment costs 15% of revenue
#   and buys the runway to reach profitability. That is the
#   trade, and it is invisible on a P&L — which is why the
#   argument has to be made with a cash projection.`
    },
    prereq: ['revenue-and-margins'], next: ['npv-payback'],
    related: ['revenue-and-margins', 'npv-payback', 'ltv-cac', 'pricing', 'business-models'],
    tools: [],
    useCases: [
      'Arguing for annual prepayment pricing.',
      'Understanding why a growing business can fail.',
      'Knowing your own company’s runway.'
    ],
    avoid: [
      'Treating EBITDA as cash flow.',
      'Assessing viability from the P&L alone.'
    ],
    mistakes: [
      'Assuming profitability means solvency.',
      'Ignoring that CAC is paid immediately while revenue arrives over a year.',
      'Overlooking payment terms on enterprise deals.',
      'Missing that annual prepayment can be worth more than the discount it costs.'
    ],
    keyTerms: [
      ['cash flow', 'Money actually moving in and out.'],
      ['EBITDA', 'A comparison proxy for operating earnings. Not cash.'],
      ['runway', 'Cash divided by net monthly burn.'],
      ['working capital', 'The timing gap between paying and being paid.'],
      ['payment terms', 'How long a customer takes to pay.'],
      ['prepayment discount', 'Trading revenue for cash timing.']
    ],
    resources: [
      ['Harvard Business Review — cash flow basics', 'https://en.wikipedia.org/wiki/Free_cash_flow', 'article'],
      ['a16z — 16 startup metrics', 'https://a16z.com/16-startup-metrics/', 'article'],
      ['David Skok — SaaS metrics', 'https://www.forentrepreneurs.com/saas-metrics-2/', 'reference']
    ],
    questions: [
      ['Why can a profitable business fail?', 'Timing. Acquisition cost is paid immediately while revenue arrives over a year, so cash runs out before profitability arrives — the P&L improves every month right up to insolvency.'],
      ['Why is EBITDA not cash flow?', 'It ignores working capital changes and capital expenditure, which for many businesses is most of the story. It is a comparison tool, not a measure of money available.'],
      ['How does billing frequency change the business?', 'Annual up-front collection can add months of runway with identical profit. A prepayment discount costs revenue and buys the time to reach profitability — a trade invisible on a P&L.']
    ]
  },

  {
    id: 'npv-payback',
    title: 'NPV, IRR & Payback',
    domain: 'economics', tier: 3, priority: 'low',
    summary: 'Comparing money at different times, and the three ways it is usually done.',
    what: `**NPV** discounts future cash flows to present value and subtracts the investment. **IRR** is the discount rate at which NPV equals zero. **Payback period** is how long until cumulative cash flow turns positive.`,
    why: `Significant product investments are eventually assessed this way, and knowing what each measure hides is more useful than being able to compute them.`,
    analogy: `Money now versus money later. A promise of a thousand next year is worth less than a thousand today, and how much less is what the discount rate encodes.`,
    technical: `**NPV** is the most complete of the three: it accounts for timing and the cost of capital, and gives an absolute value. Positive NPV means the investment beats the alternative use of the money. Its weakness is sensitivity to the discount rate and to terminal assumptions.

**IRR** gives a rate, which is intuitive and comparable across projects of different sizes. Its weaknesses are real: it implicitly assumes reinvestment at the same rate, it can produce multiple values when cash flows change sign, and it favours small quick projects over large valuable ones.

**Payback period** is the crudest and often the most practically useful. It ignores everything after the payback point and ignores the time value of money, and it answers the question people actually have — how long until this stops consuming cash.

**Use them together.** NPV for whether it is worth it, payback for whether it is affordable, IRR only as a comparison across similar options.

**In product work, the assumptions dominate the arithmetic.** The discount rate matters less than whether the benefit estimate is real, and sensitivity analysis on the benefit assumptions is worth more than precision in the discounting.

**For AI investments specifically, be careful with horizon.** A three-year NPV on a capability whose cost may fall substantially — or which a competitor may bundle for free — is resting on an assumption that deserves stating explicitly.`,
    diagram: `
   THREE MEASURES, THREE QUESTIONS

     NPV       is it WORTH it?
               discounts future cash to present value
               positive = beats the alternative use of money
               ⚠ sensitive to discount rate and terminal
                 assumptions

     IRR       what RATE does it return?
               intuitive, comparable across sizes
               ⚠ assumes reinvestment at the same rate
               ⚠ can produce multiple values
               ⚠ favours small quick projects over large
                 valuable ones

     PAYBACK   is it AFFORDABLE?
               how long until cash flow turns positive
               crudest · ignores everything after
               ⚠ and it answers the question people
                 actually have

   USE THEM TOGETHER

     NPV      → worth it
     PAYBACK  → affordable
     IRR      → only for comparing similar options

   ⚠ THE ASSUMPTIONS DOMINATE THE ARITHMETIC

     the discount rate matters far less than whether the
     BENEFIT estimate is real

     sensitivity analysis on benefits > precision in
     discounting

   ⚠ FOR AI, BE CAREFUL WITH HORIZON

     a 3-year NPV on a capability whose cost may fall
     sharply — or which a competitor may bundle free —
     rests on an assumption that deserves stating`,
    example: {
      language: 'python',
      caption: 'The three measures disagreeing, and which to believe',
      code: `def npv(rate, flows):
    return sum(f / (1 + rate) ** i for i, f in enumerate(flows))

def payback(flows):
    cum = 0
    for i, f in enumerate(flows):
        cum += f
        if cum > 0:
            return i
    return None

def irr(flows, lo=-0.9, hi=10.0, tol=1e-6):
    for _ in range(200):                     # bisection
        mid = (lo + hi) / 2
        if npv(mid, flows) > 0: lo = mid
        else: hi = mid
        if hi - lo < tol: break
    return round((lo + hi) / 2, 4)

# Two options, both 24-month horizons, monthly flows.
A = [-180_000] + [14_000] * 24     # policy assistant: slow, steady
B = [-60_000]  + [9_000] * 8 + [0] * 16   # a small automation: fast, short

RATE = 0.008                        # ~10%/yr monthly

for name, flows in (("A assistant", A), ("B automation", B)):
    print(f"{name:<14} NPV {npv(RATE, flows):>10,.0f}  "
          f"IRR {irr(flows):>7.2%}  payback {payback(flows)} months")

# A assistant     NPV     124,283  IRR   5.42%  payback 13 months
# B automation    NPV      10,266  IRR  10.06%  payback  7 months

# ⚠ THE THREE MEASURES DISAGREE.
#   IRR prefers B — it returns a higher rate.
#   NPV prefers A by more than 12x — it creates far more value.
#   Payback prefers B — it stops consuming cash sooner.
#
#   IRR favours B because it is small and quick, which is
#   exactly its known bias. If we can afford A, A is the
#   right answer, and IRR would have sent us the wrong way.

# ── SENSITIVITY: what actually decides it ──────────────────
for benefit in (14_000, 10_000, 7_000, 5_000):
    flows = [-180_000] + [benefit] * 24
    print(f"benefit {benefit:>7,}  NPV {npv(RATE, flows):>10,.0f}  "
          f"payback {payback(flows)}")
# benefit  14,000  NPV    124,283  payback 13
# benefit  10,000  NPV     37,345  payback 18
# benefit   7,000  NPV    -27,858  payback None      ⚠
# benefit   5,000  NPV    -71,330  payback None

# ⚠ THE DECISION HINGES ENTIRELY ON THE BENEFIT ESTIMATE,
#   not on the discount rate. Between $10k and $7k of monthly
#   benefit, the sign flips.
#   → go and measure the benefit properly. Arguing about
#     whether the discount rate should be 9% or 11% is
#     displacement activity.

# ⚠ AND STATE THE HORIZON ASSUMPTION
#   This 24-month NPV assumes the capability is still worth
#   paying for in month 24. If a competitor bundles it free
#   in month 10, flows stop there:
flows_bundled = [-180_000] + [14_000] * 10 + [0] * 14
print(npv(RATE, flows_bundled))   # -46,517   ⚠ negative
# That risk belongs in the analysis, not in a footnote.`
    },
    prereq: ['cash-flow'], next: [],
    related: ['roi-cost-benefit', 'cash-flow', 'opportunity-cost', 'unit-economics'],
    tools: [],
    useCases: [
      'Comparing investments with different timing.',
      'Identifying which assumption a decision actually rests on.',
      'Stating the horizon risk in an AI investment case.'
    ],
    avoid: [
      'IRR as the deciding measure between differently sized projects.',
      'Precision in discounting while the benefit estimate is a guess.'
    ],
    mistakes: [
      'Letting IRR favour a small quick project over a much more valuable one.',
      'Treating payback as sufficient — it ignores everything after the payback point.',
      'Debating the discount rate when the benefit assumption flips the sign.',
      'Assuming an AI capability will still be worth paying for at the end of the horizon.'
    ],
    keyTerms: [
      ['NPV', 'Present value of future cash flows minus the investment.'],
      ['discount rate', 'The rate at which future money is valued less.'],
      ['IRR', 'The rate at which NPV equals zero.'],
      ['payback period', 'When cumulative cash flow turns positive.'],
      ['terminal assumption', 'What you assume happens at the end of the horizon.'],
      ['sensitivity', 'Which assumption changes the conclusion.']
    ],
    resources: [
      ['Harvard Business Review — a refresher on NPV', 'https://hbr.org/2014/11/a-refresher-on-net-present-value', 'article'],
      ['Harvard Business Review — a refresher on IRR', 'https://hbr.org/2016/03/a-refresher-on-internal-rate-of-return', 'article'],
      ['a16z — 16 startup metrics', 'https://a16z.com/16-startup-metrics/', 'article']
    ],
    questions: [
      ['Why can IRR point to the wrong project?', 'It favours small, quick returns over large valuable ones and assumes reinvestment at the same rate. A project with 12 times the NPV can show a lower IRR.'],
      ['What do the three measures each answer?', 'NPV says whether it is worth it, payback says whether it is affordable, and IRR is only useful for comparing similar options. Used together they cover the decision.'],
      ['What usually decides a product investment case?', 'The benefit assumption, not the discount rate. If the sign flips between two plausible benefit estimates, the useful work is measuring the benefit rather than refining the discounting.']
    ]
  }
];
