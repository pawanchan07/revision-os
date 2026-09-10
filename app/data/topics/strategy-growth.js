/**
 * DOMAIN U — STRATEGY + BUSINESS, part 4: growth and the choices it forces
 */
export const topics = [
  {
    id: 'growth-strategy',
    title: 'Growth',
    domain: 'strategy', tier: 2, priority: 'medium',
    summary: 'Where new customers come from, and why growth on a leaky product makes things worse.',
    what: `Growth strategy is the choice of which mechanisms bring new users and keep existing ones: acquisition channels, activation, retention, and expansion within accounts.`,
    why: `Growth is usually treated as an acquisition problem when it is more often a retention problem. Pouring customers into a product they leave is expensive and it feels like progress for about two quarters.`,
    analogy: `Filling a bucket with holes. Adding a bigger tap is visible work; the water level depends on the holes.`,
    technical: `The loop: **acquisition → activation → retention → expansion → referral**. Weakness anywhere caps the whole thing, and retention is the multiplier — improving it raises the value of every other stage simultaneously.

**Retention first, then acquisition.** A product with poor retention does not have a growth problem; it has a product problem being described as a growth problem. Acquiring faster deepens the loss.

**Activation is where most of the leak is.** The gap between signing up and getting value is where the majority of users are lost, and it is usually cheaper to fix than acquisition is to scale.

**Expansion within existing accounts is the cheapest growth available** — no acquisition cost, an existing relationship, and known value. For B2B products it frequently exceeds new-logo growth and receives a fraction of the attention.

**For AI features specifically, activation has a distinctive shape:** the user must have a successful first experience *and* come to trust the output. Those are different things. A user can get a correct answer in their first session and still not adopt, because one correct answer does not establish reliability. Activation for an assistive feature is better measured as "used it and stopped verifying elsewhere" than as "used it once".

**Growth that outruns quality is negative.** Onboarding users faster than the system can serve well produces churn plus reputational damage, and for AI products the reputational component is durable — people who concluded it was unreliable do not re-evaluate on their own.`,
    diagram: `
   THE LOOP

     ACQUISITION ──► ACTIVATION ──► RETENTION ──► EXPANSION
          ▲                                            │
          └──────────────── REFERRAL ◄─────────────────┘

     weakness anywhere caps the whole thing
     ⚠ RETENTION is the multiplier — improving it raises
       the value of every other stage at once

   ⚠ RETENTION FIRST, THEN ACQUISITION

     poor retention is not a growth problem
     it is a PRODUCT problem described as one

     acquiring faster deepens the loss and looks
     like progress for about two quarters

   ACTIVATION IS WHERE MOST OF THE LEAK IS

     signed up ──────────────► got value
                  ▲
            most users lost here

     usually cheaper to fix than acquisition is to scale

   ⚠ EXPANSION IS THE CHEAPEST GROWTH AVAILABLE

     no acquisition cost · existing relationship · known value
     for B2B it often exceeds new-logo growth
     and receives a fraction of the attention

   ⚠ AI ACTIVATION HAS TWO PARTS, NOT ONE

     1  a successful first experience
     2  coming to TRUST the output

     one correct answer does not establish reliability

     measure activation as "used it and STOPPED VERIFYING
     ELSEWHERE" — not as "used it once"

   ⚠ GROWTH THAT OUTRUNS QUALITY IS NEGATIVE

     churn + reputational damage, and for AI the
     reputational part is DURABLE — people who concluded
     it was unreliable do not re-evaluate on their own`,
    example: {
      language: 'text',
      caption: 'Diagnosing a growth problem that was not one',
      code: `SITUATION  "We need more leads. Growth has stalled."
           Marketing asked to double spend.

THE LOOP, MEASURED
  ACQUISITION   142 trials/month, steady
  ACTIVATION    31% reach "answered 20 questions"          ⚠
  RETENTION     month-3 retention 44%                      ⚠
  EXPANSION     11% of accounts add seats
  REFERRAL      3% of accounts refer

⚠ THE ARITHMETIC
  Doubling acquisition: 142 → 284 trials
    × 31% activation × 44% retention
    = 39 retained accounts instead of 19

  Cost: double the marketing budget.

  Alternatively, fixing activation 31% → 55%:
    142 × 55% × 44% = 34 retained accounts
  Cost: engineering time, no recurring spend.

  Nearly the same result. One of them is a permanent
  budget increase and the other is not.

WHY ACTIVATION WAS 31% — the AI-specific finding
  We had been measuring activation as "asked 20 questions".
  Segmenting by whether the account later retained:

    asked 20+ questions, still verifying in the handbook
      → month-3 retention 19%
    asked 20+ questions, stopped verifying
      → month-3 retention 81%    ⚠

  ⚠ USAGE WAS NOT ACTIVATION. TRUST WAS.
    Our activation metric counted people who used the product
    and did not believe it, which is exactly the population
    that churns.

  Redefined activation: "verified-elsewhere rate below 25%
  within 30 days". Under the new definition, real activation
  was 19%, not 31% — worse, and now measuring the right thing.

WHAT WE FIXED
  · seeded the first session with covered questions
    (first-experience success)
  · one-click citation opening, cutting verification from
    4 minutes to 10 seconds
  · training that named the failure modes explicitly
  → activation (new definition) 19% → 47% over two quarters
  → month-3 retention 44% → 68%

EXPANSION, MEANWHILE
  11% of accounts added seats. Asking the other 89% why:
  "we would roll it to the shipping team but they have a
  different policy corpus and nobody has set it up."
  ⚠ An onboarding gap, not a value gap. Building a
    second-corpus setup flow moved expansion 11% → 34%,
    at a fraction of the cost of any acquisition work.

⚠ NONE OF THE GROWTH CAME FROM THE THING THAT WAS ASKED FOR.`
    },
    prereq: [], next: ['strategic-tradeoffs'],
    related: ['cohorts-retention', 'activation-adoption', 'ai-adoption', 'ltv-cac', 'network-effects'],
    tools: [],
    useCases: [
      'Diagnosing whether stalled growth is an acquisition or retention problem.',
      'Defining activation for an assistive AI feature.',
      'Finding expansion revenue blocked by an onboarding gap.'
    ],
    avoid: [
      'Scaling acquisition on a product with poor retention.',
      'Measuring AI activation as usage rather than as trust.'
    ],
    mistakes: [
      'Treating a retention problem as a lead-generation problem.',
      'Defining activation as usage, which counts users who do not believe the product.',
      'Neglecting expansion, which is the cheapest growth available.',
      'Onboarding faster than quality can support, which causes durable reputational damage.'
    ],
    keyTerms: [
      ['growth loop', 'Acquisition, activation, retention, expansion, referral.'],
      ['activation', 'Reaching first real value. For AI, includes trust.'],
      ['retention', 'Continuing to use it. The multiplier on everything else.'],
      ['expansion', 'Growth within existing accounts.'],
      ['leaky bucket', 'Acquiring into a product users leave.'],
      ['verified-elsewhere rate', 'A trust signal, and a better activation proxy than usage.']
    ],
    resources: [
      ['Reforge — retention is the silent killer', 'https://www.reforge.com/blog/retention-engagement-growth-silent-killer', 'article'],
      ['Amplitude — product metrics', 'https://amplitude.com/blog/product-metrics', 'article'],
      ['a16z — 16 startup metrics', 'https://a16z.com/16-startup-metrics/', 'article']
    ],
    questions: [
      ['Why fix retention before scaling acquisition?', 'Retention multiplies every other stage. A product with poor retention has a product problem described as a growth problem, and acquiring faster deepens the loss while looking like progress.'],
      ['How should activation be defined for an assistive AI feature?', 'By trust rather than usage — for example, verified-elsewhere rate falling below a threshold. Users who use it heavily and still check every answer are the population that churns.'],
      ['Why is expansion the cheapest growth?', 'No acquisition cost, an existing relationship and known value. For B2B products it often exceeds new-logo growth and is usually blocked by an onboarding gap rather than a value gap.']
    ]
  },

  {
    id: 'strategic-tradeoffs',
    title: 'Strategic Trade-offs',
    domain: 'strategy', tier: 2, priority: 'high',
    summary: 'The choices that define a position — where being good at one thing means being worse at another.',
    what: `Strategic trade-offs are the deliberate choices about what a company will be bad at, in order to be exceptional at something specific.`,
    why: `A strategy that involves no sacrifice is not a strategy. Competitors can copy anything you do; what they cannot easily copy is a set of choices that make them worse at what they currently do well.`,
    analogy: `An aircraft designed for range or for speed. Both are achievable; both in one airframe is neither. The design choice is what makes it good at anything.`,
    technical: `The recurring strategic trade-offs:
- **Breadth vs depth** — serve many segments adequately, or one segment exceptionally.
- **Speed vs quality** — first to market, or best in market.
- **Self-serve vs enterprise** — low-touch and high-volume, or high-touch and high-value. The requirements conflict in pricing, support, security and product design.
- **Platform vs product** — flexible and requiring assembly, or opinionated and immediately useful.
- **Margin vs growth** — profitable now, or investing everything into share.

**The test of a genuine trade-off is that the alternative is also viable.** If one option is simply better, it is not a trade-off, it is a decision. Real trade-offs feel uncomfortable because you are giving up something valuable.

**Straddling is the common failure.** Trying to serve self-serve and enterprise with one product usually produces something too complex for the first and too shallow for the second. Competitors focused on either end win their end.

**Trade-offs create fit.** When choices reinforce each other — a product designed for one segment, priced for it, supported for it, sold into it — the combination is far harder to copy than any single choice, because copying requires abandoning something.

**For AI products the sharpest strategic trade-off is autonomy versus trust.** A more autonomous system saves more time and is harder to trust; a more conservative one is trusted and saves less. These are different products for different buyers, and trying to be both produces a system that acts too often for the cautious buyer and too rarely for the ambitious one.`,
    diagram: `
   THE RECURRING TRADE-OFFS

     BREADTH        ←──────→  DEPTH
       many segments           one segment
       adequately              exceptionally

     SPEED          ←──────→  QUALITY
       first to market         best in market

     SELF-SERVE     ←──────→  ENTERPRISE
       low-touch, volume       high-touch, high-value
       ⚠ requirements CONFLICT in pricing, support,
         security and product design

     PLATFORM       ←──────→  PRODUCT
       flexible, assembly      opinionated, immediate

     MARGIN         ←──────→  GROWTH

   ⚠ THE TEST OF A GENUINE TRADE-OFF

     the alternative must also be VIABLE

     if one option is simply better, it is a DECISION,
     not a trade-off

     real trade-offs feel uncomfortable — you are giving
     up something valuable

   ⚠ STRADDLING IS THE COMMON FAILURE

     self-serve AND enterprise in one product
       → too complex for the first
       → too shallow for the second
     competitors focused on either end win their end

   TRADE-OFFS CREATE FIT

     designed for one segment · priced for it · supported
     for it · sold into it

     the COMBINATION is far harder to copy than any single
     choice — copying requires ABANDONING something

   ⚠ THE SHARPEST AI TRADE-OFF: AUTONOMY vs TRUST

     more autonomous   saves more time · harder to trust
     more conservative  trusted · saves less

     different products, different buyers.
     Both at once acts too often for the cautious buyer
     and too rarely for the ambitious one.`,
    example: {
      language: 'text',
      caption: 'A trade-off made explicitly, and the fit it created',
      code: `DECISION  Who is the AI policy assistant for?

THE STRADDLE WE ALMOST BUILT
  "Self-serve for small teams AND enterprise for large ones."

  What that requires simultaneously:
    self-serve         instant sign-up, no configuration,
                       generic corpus, credit card, no contract
    enterprise         SSO, audit logs, data residency,
                       per-tenant corpus, security review,
                       procurement, custom abstention thresholds

  ⚠ These conflict at the product level, not just the sales
    level. A generic corpus and a per-tenant corpus are
    different retrieval architectures. "Instant, no
    configuration" and "your evaluation set, judged by your
    support leads" are opposite onboarding flows.

  The straddled product: complex enough to need a demo (so
  not self-serve) and generic enough to fail a security
  review (so not enterprise).

THE TRADE-OFF WE MADE
  Depth on mid-market and enterprise support organisations.
  Explicitly BAD at: self-serve, small teams, instant start.

  What we gave up — and this was uncomfortable:
    · a large, cheap-to-reach segment
    · a product-led growth motion
    · the volume that would have made the model economics
      easier to reason about

WHAT THE CHOICE MADE POSSIBLE — the fit
  PRODUCT    per-tenant corpus and per-tenant golden set
             (impossible in a generic self-serve product)
  PRICING    annual contracts, which fixed our 14.6-month
             payback problem
  SUPPORT    a named support lead per account, who becomes
             the judge for the evaluation set
  SALES      security review as an ASSET rather than an
             obstacle — we pass it, a self-serve competitor
             does not
  MOAT       the per-tenant evaluation loop, which only
             exists because we chose depth

  ⚠ EVERY ONE OF THOSE REINFORCES THE OTHERS. A competitor
    copying the per-tenant golden set has to also change
    their pricing, their support model and their sales
    motion. That is what makes the combination hard to copy
    and any single feature easy.

⚠ THE AUTONOMY TRADE-OFF, MADE SEPARATELY AND DELIBERATELY
  We chose conservative: abstain rather than guess, suggest
  rather than act, never issue a refund.

  We lose to a competitor whose product acts autonomously
  and saves more time, in accounts where the buyer wants
  that. We accept losing those. Trying to serve both would
  mean an abstention threshold that satisfies neither.

  ⚠ This is written down in the strategy doc precisely so
    that "why don't we just let it apply the refund" is
    answered by a decision rather than re-argued quarterly.`
    },
    prereq: ['competitive-advantage'], next: [],
    related: ['product-strategy', 'product-tradeoffs', 'competitive-advantage', 'business-models', 'human-in-the-loop'],
    tools: [],
    useCases: [
      'Choosing a segment and declining another.',
      'Explaining why a product deliberately lacks a capability.',
      'Building reinforcing choices that are hard to copy.'
    ],
    avoid: [
      'Straddling two segments with conflicting requirements.',
      'Strategies that sacrifice nothing.'
    ],
    mistakes: [
      'Serving self-serve and enterprise with one product and satisfying neither.',
      'Calling something a trade-off when one option is simply better.',
      'Making the autonomy-versus-trust choice implicitly rather than deliberately.',
      'Not writing the choice down, so it gets re-argued every quarter.'
    ],
    keyTerms: [
      ['strategic trade-off', 'Choosing what to be bad at.'],
      ['straddling', 'Attempting two conflicting positions at once.'],
      ['fit', 'Choices that reinforce each other and resist copying.'],
      ['sacrifice', 'What a strategy gives up. Its defining feature.'],
      ['autonomy vs trust', 'The sharpest AI-product trade-off.'],
      ['product-led growth', 'A self-serve motion; conflicts with enterprise depth.']
    ],
    resources: [
      ['Porter — what is strategy', 'https://hbr.org/1996/11/what-is-strategy', 'article'],
      ['Rumelt — the perils of bad strategy', 'https://hbr.org/1996/11/what-is-strategy', 'article'],
      ['Hamilton Helmer — 7 Powers (overview)', 'https://www.7powers.com/', 'reference']
    ],
    questions: [
      ['What is the test of a genuine strategic trade-off?', 'The alternative must also be viable. If one option is simply better it is a decision, not a trade-off — and real trade-offs feel uncomfortable because you give up something valuable.'],
      ['Why is straddling self-serve and enterprise a failure mode?', 'Their requirements conflict at the product level, not just in sales. The result is too complex to be self-serve and too generic to pass an enterprise security review.'],
      ['What is the sharpest trade-off in AI products?', 'Autonomy versus trust. A more autonomous system saves more time and is harder to trust; a conservative one is trusted and saves less. They are different products for different buyers.']
    ]
  }
];
