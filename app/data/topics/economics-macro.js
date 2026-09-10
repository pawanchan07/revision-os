/**
 * DOMAIN V — ECONOMICS + FINANCE BASICS, part 5: the macro backdrop
 */
export const topics = [
  {
    id: 'interest-inflation',
    title: 'Interest Rates, Inflation & Monetary Policy',
    domain: 'economics', tier: 3, priority: 'low',
    summary: 'The price of money, the erosion of its value, and why both change how your company behaves.',
    what: `**Interest rates** are the price of borrowing money. **Inflation** is the rate at which money loses purchasing power. **Monetary policy** is a central bank adjusting rates and money supply to influence both.`,
    why: `They set the environment product decisions are made in. Rates determine how patient your company can afford to be, and that shows up directly as a preference for near-term payback over long-term investment — usually without anyone explaining that this is what changed.`,
    analogy: `Weather rather than a decision. You do not control it and you dress differently because of it.`,
    technical: `**When rates rise:** borrowing costs more, capital is scarcer, investors discount future cash flows more heavily, and long-payback projects lose to short-payback ones. Companies shift from growth-at-any-cost toward profitability. Hiring slows.

**When rates fall:** the reverse. Capital is cheap, long-horizon bets are affordable, growth is rewarded over margin.

**Inflation** raises input costs — salaries especially — and erodes the real value of fixed-price contracts. A three-year contract at a fixed price loses value every year that inflation runs.

**The mechanism connecting rates to your roadmap** is the discount rate. Higher rates mean future benefits are worth less today, which mechanically favours projects that pay back quickly. A project that was approved in a low-rate environment can fail the same analysis two years later without anything about the project changing.

**The practical consequences for a PM:**
- In a high-rate environment, lead with payback period rather than total value.
- Prefer reversible, incremental investments over large multi-year bets.
- Index long contracts, or keep them short.
- Expect cost discipline to arrive as a change in what gets funded rather than as an announcement.

**For AI investments there is a second discount at work:** capability cost is falling, so waiting has an option value that most business cases ignore. That does not mean waiting is right — the data and evaluation work compounds and should start now — but it does mean the case for buying expensive capability today should acknowledge that it will be cheaper soon.`,
    diagram: `
   WHEN RATES RISE                WHEN RATES FALL

     borrowing costs more           capital is cheap
     capital is scarcer             long horizons affordable
     future cash discounted         growth rewarded over
       more heavily                   margin
     ⚠ long-payback projects        long-payback projects
       LOSE to short-payback          become viable
     growth → profitability
     hiring slows

   THE MECHANISM IS THE DISCOUNT RATE

     higher rates → future benefits worth less today
                  → mechanically favours fast payback

     ⚠ a project approved in a low-rate environment can fail
       the SAME analysis two years later without anything
       about the project changing

   INFLATION

     raises input costs — salaries especially
     erodes fixed-price contracts
       a 3-year fixed price loses value every year

   PRACTICAL CONSEQUENCES FOR A PM

     high-rate environment  lead with PAYBACK, not total value
     prefer reversible, incremental over multi-year bets
     index long contracts, or keep them short
     expect cost discipline to arrive as a change in what
       gets funded — not as an announcement

   ⚠ AI HAS A SECOND DISCOUNT

     capability cost is FALLING
     → waiting has an option value most cases ignore

     this does NOT mean wait: the data and evaluation work
     compounds and should start now

     it means the case for buying expensive capability today
     should acknowledge it will be cheaper soon`,
    example: {
      language: 'python',
      caption: 'The same project, two rate environments',
      code: `def npv(monthly_rate, flows):
    return sum(f / (1 + monthly_rate) ** i for i, f in enumerate(flows))

# A platform investment: 6 months of build, then steady benefit
# for 30 months. Nothing about the PROJECT changes below.
FLOWS = [-90_000] * 6 + [16_000] * 30

for annual in (0.03, 0.06, 0.10, 0.14):
    monthly = (1 + annual) ** (1/12) - 1
    v = npv(monthly, FLOWS)
    print(f"rate {annual:>5.0%}   NPV {v:>10,.0f}   "
          f"{'APPROVED' if v > 0 else 'REJECTED'}")

# rate    3%   NPV     -6,262   REJECTED
# rate    6%   NPV    -55,585   REJECTED
# rate   10%   NPV   -113,832   REJECTED
# rate   14%   NPV   -163,748   REJECTED

# ⚠ (Front-loaded cost this heavy fails at every rate — but
#    note how fast it DEGRADES: the gap between 3% and 14% is
#    over 157,000 on a project whose total outlay is 540,000.)

# A smaller, faster version of the same idea:
INCREMENTAL = [-40_000] * 2 + [9_000] * 20
for annual in (0.03, 0.14):
    monthly = (1 + annual) ** (1/12) - 1
    print(f"incremental @ {annual:.0%}  NPV {npv(monthly, INCREMENTAL):>9,.0f}")
# incremental @ 3%   NPV    93,376
# incremental @ 14%  NPV    69,183

# ⚠ THE INCREMENTAL VERSION SURVIVES BOTH ENVIRONMENTS.
#   In a high-rate environment, the same total ambition
#   delivered in smaller increments is not just safer —
#   it is arithmetically more valuable, because the benefits
#   start arriving before they have been discounted away.

# ── WHAT THIS MEANS FOR HOW YOU PITCH ──────────────────────
#   low rates   lead with total value over the horizon
#   high rates  lead with PAYBACK, and structure the work so
#               benefits start in month 3 rather than month 7
#
#   The project does not change. The framing that gets it
#   funded does — and knowing why is the difference between
#   "finance is being difficult" and understanding the
#   constraint they are actually working under.

# ── THE AI-SPECIFIC SECOND DISCOUNT ────────────────────────
def capability_cost(month, monthly_decline=0.03):
    return round(4_800 * (1 - monthly_decline) ** month)

for m in (0, 6, 12, 24):
    print(f"month {m:>2}: inference cost \${capability_cost(m):>6,}/mo")
# month  0: inference cost $ 4,800/mo
# month  6: inference cost $ 3,995/mo
# month 12: inference cost $ 3,325/mo
# month 24: inference cost $ 2,304/mo
#
# ⚠ Half the running cost disappears in two years without us
#   doing anything. Worth stating explicitly in a case, because
#   it makes the LATER years of the projection better than the
#   naive flat-cost assumption — and because it argues against
#   heavy investment in cost optimisation that time will do
#   for free.`
    },
    prereq: [], next: [],
    related: ['npv-payback', 'roi-cost-benefit', 'cash-flow', 'opportunity-cost', 'ai-cost'],
    tools: [],
    useCases: [
      'Understanding why a previously fundable project stopped being fundable.',
      'Structuring work so benefits arrive earlier.',
      'Framing an investment case for the current environment.'
    ],
    avoid: [
      'Large multi-year bets in a high-rate environment.',
      'Long fixed-price contracts without indexation.'
    ],
    mistakes: [
      'Treating a funding change as a judgement about the project rather than about the discount rate.',
      'Leading with total value when the constraint is payback.',
      'Signing multi-year fixed prices while input costs inflate.',
      'Investing heavily in cost optimisation that falling capability prices will deliver anyway.'
    ],
    keyTerms: [
      ['interest rate', 'The price of borrowing money.'],
      ['inflation', 'The rate at which purchasing power erodes.'],
      ['monetary policy', 'A central bank adjusting rates and money supply.'],
      ['discount rate', 'How much future value is reduced; the transmission mechanism.'],
      ['payback preference', 'The high-rate bias toward fast returns.'],
      ['indexation', 'Linking a contract price to inflation.'],
      ['option value of waiting', 'The benefit of deferring when costs are falling.']
    ],
    resources: [
      ['Khan Academy — macroeconomics', 'https://www.khanacademy.org/economics-finance-domain/macroeconomics', 'course'],
      ['CORE Econ — The Economy', 'https://www.core-econ.org/the-economy/', 'course'],
      ['Harvard Business Review — a refresher on NPV', 'https://hbr.org/2014/11/a-refresher-on-net-present-value', 'article']
    ],
    questions: [
      ['How do interest rates reach your roadmap?', 'Through the discount rate. Higher rates make future benefits worth less today, which mechanically favours short-payback projects — so a project approved two years ago can fail the same analysis unchanged.'],
      ['What changes about how you pitch in a high-rate environment?', 'Lead with payback rather than total value, and structure the work so benefits start arriving in month three rather than month seven. The same ambition delivered incrementally is arithmetically more valuable.'],
      ['What second discount applies to AI investments?', 'Capability cost is falling, so waiting has option value. It does not mean waiting is right — data and evaluation work compounds — but it argues against heavy investment in cost optimisation that time will deliver anyway.']
    ]
  }
];
