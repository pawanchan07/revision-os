/**
 * DOMAIN T — AI PRODUCT MANAGEMENT, part 2 of 3: experience, trust and measurement
 */
export const topics = [
  {
    id: 'ai-ux',
    title: 'AI UX',
    domain: 'ai-pm', tier: 1, priority: 'high',
    summary: 'Designing for a system that is usually right, sometimes wrong, and never certain.',
    what: `AI UX is interface design for probabilistic output: setting expectations, showing confidence and provenance, making correction easy, and designing the failure states as carefully as the success state.`,
    why: `Conventional UI assumes deterministic behaviour — a button does the same thing every time. When output varies and is sometimes wrong, the interface has to carry information about reliability, and most of the design effort goes into the paths where it did not work.`,
    analogy: `A weather forecast. The design communicates uncertainty as a first-class part of the content, not as a disclaimer beneath it.`,
    technical: `The principles that do the work:

**Set expectations before the first interaction.** What it can do, what it cannot, and how sure it is. An unbounded input box implies unbounded capability and guarantees disappointment.

**Show provenance, not confidence scores.** "78% confident" is uninterpretable. A citation the user can open in one click is verifiable, and it converts a trust problem into a checking problem — usually reducing verification from minutes to seconds.

**Design the failure states first.** What happens when it does not know, when retrieval is empty, when the model times out, when the answer is wrong. These paths are a large fraction of real usage and they receive a small fraction of design attention.

**Make correction cheap and make it matter.** One click to flag, visible consequence. A correction mechanism that disappears into a void trains users to stop using it.

**Prefer suggesting to acting** where the cost of error is meaningful. A draft the user edits keeps them in control; an action taken on their behalf transfers the risk to them without their consent.

**Streaming changes perceived performance more than actual latency does.** A first token in 400ms with a 15-second completion feels responsive; five seconds of blank screen with a 6-second completion does not.

**Never present uncertain output with certain-looking formatting.** Fluent, confident prose is the model's default register, and it is the single largest driver of misplaced trust.`,
    diagram: `
   THE PRINCIPLES

     SET EXPECTATIONS FIRST
       an unbounded input box implies unbounded capability
       → and guarantees disappointment

     SHOW PROVENANCE, NOT CONFIDENCE SCORES
       "78% confident"     uninterpretable
       a one-click citation VERIFIABLE
       ⚠ converts a TRUST problem into a CHECKING problem
         verification: minutes → seconds

     DESIGN THE FAILURE STATES FIRST
       does not know · empty retrieval · timeout · wrong
       ⚠ a large fraction of real usage
         a small fraction of design attention

     MAKE CORRECTION CHEAP AND CONSEQUENTIAL
       one click, visible consequence
       a flag that vanishes into a void trains users to stop

     PREFER SUGGESTING TO ACTING
       a draft the user edits    → they keep control
       an action on their behalf → risk transferred without consent

     STREAM
       400ms first token, 15s completion   feels fast
       5s blank screen, 6s completion      does not

   ⚠ NEVER PRESENT UNCERTAIN OUTPUT WITH CERTAIN
     FORMATTING

     fluent confident prose is the model's DEFAULT REGISTER
     and it is the single largest driver of misplaced trust

     the interface has to carry the uncertainty that the
     text does not`,
    example: {
      language: 'text',
      caption: 'The same answer, designed three ways',
      code: `❌ VERSION 1 — confident prose, no provenance
┌──────────────────────────────────────────────────────────┐
│ Refunds for damaged items are available within 30 days   │
│ of delivery. The customer should provide photographs.    │
└──────────────────────────────────────────────────────────┘
  Reads as authoritative. Is sometimes wrong. The agent has
  no way to check without opening the handbook — which costs
  four minutes and removes the entire time saving.
  ⚠ This is the default output of a model and the default
    design of a first version.


⚠ VERSION 2 — a confidence score
┌──────────────────────────────────────────────────────────┐
│ Confidence: 78%                                          │
│ Refunds for damaged items are available within 30 days…  │
└──────────────────────────────────────────────────────────┘
  What does an agent DO with 78%? Below what number do they
  check? Nobody knows, so it is either ignored or treated as
  certainty. Uninterpretable numbers are not information.


✓ VERSION 3 — provenance and a designed failure path
┌──────────────────────────────────────────────────────────┐
│ Refunds for damaged items: within 30 days of delivery,   │
│ with photographic evidence.                              │
│                                                          │
│ 📄 Returns Policy §4.2 "Damaged goods"        [open ▸]   │
│    updated 12 Jan 2026                                   │
│                                                          │
│ ⚑ This looks wrong                                       │
└──────────────────────────────────────────────────────────┘
  One click opens the clause, highlighted. Verification drops
  from four minutes to about ten seconds. The flag is visible
  and the agent sees the case appear in next week's review.


✓ THE FAILURE STATE — designed, not an afterthought
┌──────────────────────────────────────────────────────────┐
│ I can't answer this from the policy documents I have.    │
│                                                          │
│ Your question mentions a REGIONAL variant, and I only    │
│ have national policy.                    ← says WHY      │
│                                                          │
│ [ Ask a senior agent ▸ ]  pre-filled with your question  │
│                           and the sections already checked│
└──────────────────────────────────────────────────────────┘
  ⚠ 30% of queries land here. Without this design they land
    on a dead end, and a dead end at 30% frequency is what
    makes people stop opening the tool at all.
    Saying WHY it cannot answer is what makes an abstention
    feel like help rather than failure.`
    },
    prereq: [], next: ['ai-trust'],
    related: ['ai-trust', 'human-in-the-loop', 'generation-citations', 'personas', 'refusal-quality'],
    tools: [],
    useCases: [
      'Designing an assistive feature people keep using.',
      'Reducing verification cost so the time saving survives.',
      'Designing the abstention path deliberately.'
    ],
    avoid: [
      'Confidence percentages shown to end users.',
      'Unbounded input boxes that imply unbounded capability.'
    ],
    mistakes: [
      'Presenting uncertain output in confident prose with no provenance.',
      'Treating failure states as edge cases when they are a third of usage.',
      'Showing a confidence score nobody can act on.',
      'Building a correction mechanism with no visible consequence.'
    ],
    keyTerms: [
      ['provenance', 'Where the answer came from, checkable in one click.'],
      ['expectation setting', 'Telling users what the system can and cannot do.'],
      ['failure state', 'The designed experience when it does not work.'],
      ['correction affordance', 'A cheap, consequential way to report a problem.'],
      ['suggest vs act', 'Drafting for the user rather than acting for them.'],
      ['perceived performance', 'How fast it feels, driven by time to first token.']
    ],
    resources: [
      ['Google — People + AI Guidebook', 'https://pair.withgoogle.com/guidebook/', 'reference'],
      ['Microsoft — HAX guidelines for human-AI interaction', 'https://www.microsoft.com/en-us/haxtoolkit/ai-guidelines/', 'reference'],
      ['Nielsen Norman Group — AI usability', 'https://www.nngroup.com/articles/which-ux-research-methods/', 'article']
    ],
    questions: [
      ['Why show provenance rather than a confidence score?', 'A percentage is uninterpretable — nobody knows what to do at 78%. A one-click citation converts a trust problem into a checking problem and cuts verification from minutes to seconds.'],
      ['Why design the failure states first?', 'They are a large fraction of real usage — abstention alone can be a third of queries — and they receive a small fraction of design attention. A dead end at that frequency stops people opening the tool.'],
      ['What is the largest driver of misplaced trust?', 'Fluent, confident prose. It is the model\'s default register regardless of whether the content is right, so the interface has to carry the uncertainty the text does not.']
    ],
    interview: {
      s30: 'AI UX is designing for output that is usually right and sometimes wrong. The core moves are showing provenance rather than confidence scores, and designing the failure states as carefully as the success state.',
      s90: 'The insight that changed how I design these is that a citation converts a trust problem into a checking problem. Agents using our policy assistant were getting an answer in two seconds and then spending four minutes confirming it in the handbook — net saving zero. Adding a one-click link to the exact clause dropped verification to about ten seconds, and that single change is what made the feature work. The other thing I insist on is designing the abstention path properly. Thirty percent of our queries end in "I cannot answer this", which sounds like a failure until you design it: say why — a regional variant we do not have — and offer a pre-filled handoff to a senior agent. A dead end at thirty percent frequency is what makes people stop opening the tool. Saying why is what makes it feel like help.'
    }
  },

  {
    id: 'ai-trust',
    title: 'AI Trust',
    domain: 'ai-pm', tier: 1, priority: 'high',
    summary: 'Trust is earned slowly, lost in two errors, and rebuilt more slowly still.',
    what: `Trust is the user's willingness to rely on the system's output without independently verifying it. It is the variable that determines whether an assistive feature delivers value or merely produces output.`,
    why: `A system nobody trusts produces no benefit even when it is correct, because every answer gets checked. Trust is the mechanism by which accuracy becomes value, and it is asymmetric — slow to build, fast to lose.`,
    analogy: `A colleague's recommendations. It takes many good calls to be trusted and about two confident wrong ones to be discounted, and after that you are checked forever.`,
    technical: `**The asymmetry is the central fact.** Users tolerate a system that says "I don't know" far better than one that is confidently wrong. An abstention costs a few minutes; a confident error costs the relationship. Our own research figure across support teams is consistent: two confidently wrong answers is the abandonment threshold.

**Calibration matters more than accuracy.** A system that is right 80% of the time and reliably signals which 20% is uncertain is more useful than one right 90% of the time with no signal — because the first can be relied on selectively and the second must be checked entirely.

**Trust is domain-specific and does not transfer.** A user who trusts the summariser does not automatically trust the recommender. Each capability earns it separately.

**Verification cost is the hidden variable.** If checking is cheap, users tolerate more errors, because the error is caught before it costs anything. Reducing verification cost is often more effective than reducing the error rate, and always cheaper.

**Recovery is slower than damage.** After an incident, users check everything for weeks. Rebuilding requires visible change — not "we improved the model" but "here is what went wrong, here is what we changed, here is how you will know".

The practical consequence: **abstention is a trust-building feature, not a limitation.** A system that declines 30% of questions and is right on the rest gets used. One that answers everything at 92% does not.`,
    diagram: `
   ⚠ THE ASYMMETRY IS THE CENTRAL FACT

     "I don't know"        costs a few minutes
     confidently wrong     costs the relationship

     abandonment threshold, measured repeatedly:
       ~2 confidently wrong answers

   CALIBRATION BEATS ACCURACY

     80% right + reliable uncertainty signal
       → can be relied on SELECTIVELY          ✓ useful

     90% right + no signal
       → must be checked ENTIRELY              ✗ no saving

   TRUST IS DOMAIN-SPECIFIC AND DOES NOT TRANSFER

     trusts the summariser  ≠  trusts the recommender
     each capability earns it separately

   ⚠ VERIFICATION COST IS THE HIDDEN VARIABLE

     cheap to check   → more errors tolerated
                        (caught before they cost anything)
     costly to check  → any error rate is intolerable

     reducing verification cost is often MORE effective
     than reducing the error rate — and always cheaper

   RECOVERY IS SLOWER THAN DAMAGE

     after an incident, users check everything for weeks

     ✗ "we improved the model"
     ✓ "here is what went wrong, what we changed,
        and how you will know it is fixed"

   ⚠ ABSTENTION IS A TRUST-BUILDING FEATURE

     declines 30%, right on the rest   → gets used
     answers everything at 92%         → does not`,
    example: {
      language: 'text',
      caption: 'Two rollouts of the same capability',
      code: `ROLLOUT A — optimised for coverage
─────────────────────────────────────────────────────────────
  answers 96% of questions · 8% confidently wrong
  no citations · no abstention

  week 1   adoption 71%.  "This is great."
  week 2   adoption 64%.  Two agents hit wrong answers on live
                          calls. One relayed an incorrect refund
                          window. Story spreads in the team channel.
  week 3   adoption 38%.  Agents who still use it verify every
                          answer in the handbook first.
  week 6   adoption 12%.  Effective value: negative — the checking
                          costs more than the answer saves.

  ⚠ THE SYSTEM WAS CORRECT 92% OF THE TIME AND
    DELIVERED NOTHING.


ROLLOUT B — optimised for calibration
─────────────────────────────────────────────────────────────
  answers 71% · abstains 29% · 1.1% confidently wrong
  every answer cites a clause, one click to open

  week 1   adoption 44%.  "It says it doesn't know a lot."
                          ⚠ this is the moment someone proposes
                            lowering the threshold. Do not.
  week 3   adoption 63%.  "When it answers, it's right."
  week 6   adoption 71%.  Agents stop opening the handbook to
                          verify — verified-without-lookup 81%.
  week 9   adoption 79%.  Senior agents, the hardest group,
                          start using it.

  Repeat customer contacts from escalated threads: 30/wk → 19/wk

  ⚠ ROLLOUT B ANSWERS FEWER QUESTIONS AND DELIVERS MORE VALUE.


THE INCIDENT, AND THE RECOVERY — rollout B, week 14
─────────────────────────────────────────────────────────────
  A corpus update introduced a parsing regression. For two days
  the system answered regional questions from national policy.
  Nine wrong answers before an agent flagged it.

  ✗ WHAT WOULD NOT HAVE WORKED
    "We've fixed an issue. The assistant is more accurate now."

  ✓ WHAT WE DID
    · turned the feature off for regional queries within an hour
    · posted in the team channel the same day: what happened,
      which nine answers were affected, who to contact if they
      acted on one
    · added the nine cases to the golden set as regressions
    · added the distribution check that would have caught it
    · reported the specific check in the following week's review

  Adoption trough: 71% → 58%. Recovery to 74%: six weeks.
  ⚠ Six weeks to recover from two days. That ratio is the
    argument for abstention, stated in time rather than theory.`
    },
    prereq: ['ai-ux'], next: ['ai-adoption'],
    related: ['ai-ux', 'refusal-quality', 'groundedness', 'human-in-the-loop', 'hallucination-monitoring'],
    tools: [],
    useCases: [
      'Deciding an abstention policy on evidence rather than instinct.',
      'Explaining why a more accurate system delivered less value.',
      'Recovering from a quality incident.'
    ],
    avoid: [
      'Optimising coverage at the expense of confident errors.',
      'Vague reassurance after an incident.'
    ],
    mistakes: [
      'Treating abstention as a limitation rather than as the feature that earns trust.',
      'Assuming trust in one capability transfers to another.',
      'Reducing the error rate when reducing verification cost would be cheaper and more effective.',
      'Lowering the abstention threshold in week one because users say it declines too often.'
    ],
    keyTerms: [
      ['calibration', 'Whether the system’s uncertainty matches its accuracy.'],
      ['abandonment threshold', 'How many confident errors before users stop.'],
      ['verification cost', 'What it takes a user to check an answer.'],
      ['confidently wrong', 'Answered, asserted, and incorrect. The costly failure.'],
      ['trust recovery', 'The slow rebuild after an incident.'],
      ['selective reliance', 'Trusting the system where it signals confidence.']
    ],
    resources: [
      ['Google — People + AI Guidebook', 'https://pair.withgoogle.com/guidebook/', 'reference'],
      ['Microsoft — HAX guidelines', 'https://www.microsoft.com/en-us/haxtoolkit/ai-guidelines/', 'reference'],
      ['NIST AI Risk Management Framework', 'https://www.nist.gov/itl/ai-risk-management-framework', 'reference']
    ],
    questions: [
      ['Why can a more accurate system deliver less value?', 'Because trust determines whether accuracy becomes value. A system with no uncertainty signal must be checked entirely, so its correct answers save nothing.'],
      ['Why is calibration more important than raw accuracy?', 'A system right 80% of the time that reliably flags the uncertain 20% can be relied on selectively. One right 90% of the time with no signal has to be checked every time.'],
      ['Why is reducing verification cost often better than reducing errors?', 'It is cheaper and it changes tolerance. When checking takes ten seconds rather than four minutes, errors are caught before they cost anything and users keep using the system.']
    ]
  },

  {
    id: 'ai-adoption',
    title: 'AI Adoption',
    domain: 'ai-pm', tier: 2, priority: 'medium',
    summary: 'Getting people to actually use it — which is a different problem from making it work.',
    what: `Adoption is the process by which a working feature becomes part of how people do their jobs. It depends on discoverability, fit with existing workflow, trust, and whether abandoning the old way feels safe.`,
    why: `A large share of AI features that meet their quality bar are still not used. Building it correctly and getting it adopted are separate problems, and the second is usually under-resourced because it does not look like product work.`,
    analogy: `A new route to work. Genuinely faster, and people keep taking the old one, because the old one is known and the new one has an unquantified risk of being closed.`,
    technical: `The forces, from Jobs To Be Done, apply directly: push, pull, habit and anxiety. **For AI features anxiety is almost always the binding constraint** — capability is obvious and the old way is painful, and people still do not switch because they are not sure they can rely on it.

What actually moves adoption:

**Put it where the work already happens.** A separate tool requires a decision to open it. An affordance inside the existing workflow does not. This single factor dominates most others.

**Make the first experience a success.** Seed it with cases you know it handles. A failure in the first three uses is close to unrecoverable.

**Recruit the sceptics, not the enthusiasts.** Enthusiasts adopt anything and their endorsement persuades nobody. The senior person who was doubtful and then found it useful is the endorsement that moves a team.

**Train on the failure modes, not the features.** Telling people exactly when it will not work makes them trust it more, not less, and it prevents the first surprise from being a betrayal.

**Watch adoption by segment.** Aggregate adoption hides everything. New joiners adopting at 88% and senior staff at 44% is two different products and two different problems.

**Do not mandate.** Enforced usage produces compliance and resentment, and it destroys the signal — you can no longer tell whether the feature is working.`,
    diagram: `
   THE FOUR FORCES — anxiety is the binding one

     PUSH     the old way hurts        usually already high
     PULL     the new way appeals      usually already high
     HABIT    the old way is known
     ANXIETY  can I rely on it?        ← THE CONSTRAINT

     adding capability raises PULL, which is not what is stuck

   WHAT ACTUALLY MOVES ADOPTION

     ⚠ PUT IT WHERE THE WORK ALREADY HAPPENS
       a separate tool requires a DECISION to open it
       an affordance in the workflow does not
       ← this factor dominates most others

     MAKE THE FIRST EXPERIENCE A SUCCESS
       seed with cases you know it handles
       a failure in the first three uses is near-unrecoverable

     RECRUIT THE SCEPTICS, NOT THE ENTHUSIASTS
       enthusiasts adopt anything; nobody is persuaded
       the doubtful senior who found it useful is the
       endorsement that moves a team

     TRAIN ON THE FAILURE MODES, NOT THE FEATURES
       telling people when it will NOT work makes them
       trust it more, and prevents the first surprise
       from feeling like a betrayal

     WATCH ADOPTION BY SEGMENT
       new joiners 88% · senior staff 44%
       = two products, two problems, one meaningless average

   ⚠ DO NOT MANDATE

     enforced usage produces compliance and resentment
     and destroys the signal — you can no longer tell
     whether the feature is working`,
    example: {
      language: 'text',
      caption: 'An adoption plan, and what the segments revealed',
      code: `FEATURE  policy assistant, quality bar cleared, 0 adoption

WEEK 0 — PLACEMENT
  ✗ original design: a panel agents open from a menu
  ✓ changed to: appears automatically when the agent types a
    question-shaped message into the internal notes field
  → no decision to open it. This one change moved week-1
    adoption from an estimated 20% to 44%.

WEEK 1 — FIRST EXPERIENCE
  Seeded each agent's first session with three questions we
  KNEW were well covered (from the golden set).
  ⚠ Not deception — the point is that the first three uses
    determine whether there is a fourth, and a cold start on
    an edge case is a coin flip we do not need to take.

WEEK 1 — TRAINING, 20 minutes
  60% of the session was on FAILURE modes:
    · it does not have regional policy variants
    · it will say "not covered" about 3 times in 10
    · two wrong answers is the point at which you should
      tell us, not the point at which you should give up
  ⚠ Naming the abandonment threshold out loud made agents
    report problems instead of quietly stopping.

WEEK 2 — THE SCEPTIC
  Asked the most senior agent — who had said "I'll just ask
  Priya, it's faster" — to try it for one week and tell us
  where it was wrong.
  She found four real problems. We fixed three.
  Her message in the team channel in week 4 did more for
  adoption than the training session did.

WEEK 6 — SEGMENT THE NUMBER
  overall adoption                   71%
    new agents (<3 months)           88%   ⚠
    senior agents (>2 years)         44%   ⚠

  These are two different products.
    New agents: it replaces "ask someone", which they find
      socially costly. High value, high adoption.
    Senior agents: they already know 90% of the answers. It
      only helps on edge cases — which is exactly where
      abstention is highest.

  → the senior number is not an adoption problem to be fixed
    with persuasion. It is a coverage problem on edge cases,
    and it goes on the roadmap as one.

⚠ THE AGGREGATE 71% WOULD HAVE BEEN CALLED A SUCCESS
  AND HIDDEN BOTH FINDINGS.`
    },
    prereq: ['ai-trust'], next: ['ai-metrics'],
    related: ['jtbd', 'activation-adoption', 'ai-rollout', 'ai-trust', 'product-metrics'],
    tools: [],
    useCases: [
      'Getting a working feature into daily use.',
      'Diagnosing why a good feature is not being used.',
      'Separating an adoption problem from a coverage problem.'
    ],
    avoid: [
      'Mandating usage.',
      'Reading aggregate adoption without segmenting.'
    ],
    mistakes: [
      'Placing the feature somewhere that requires a decision to open it.',
      'Recruiting enthusiasts whose endorsement persuades nobody.',
      'Training on features rather than on failure modes.',
      'Treating a low senior-staff number as resistance when it is a coverage gap.'
    ],
    keyTerms: [
      ['placement', 'Where the feature sits relative to existing workflow.'],
      ['first-use experience', 'The first three interactions, which decide the rest.'],
      ['sceptic endorsement', 'The doubtful expert who changed their mind.'],
      ['failure-mode training', 'Teaching when it will not work.'],
      ['adoption by segment', 'Splitting the number by user group.'],
      ['mandate', 'Enforced usage; produces compliance and destroys signal.']
    ],
    resources: [
      ['Google — People + AI Guidebook', 'https://pair.withgoogle.com/guidebook/', 'reference'],
      ['Jobs to be Done — forces of progress', 'https://hbr.org/2016/09/know-your-customers-jobs-to-be-done', 'reference'],
      ['Amplitude — adoption metrics', 'https://amplitude.com/blog/product-metrics', 'article']
    ],
    questions: [
      ['Which force blocks AI adoption most often?', 'Anxiety. Push and pull are usually already high — the old way hurts and the new way is appealing — and people still do not switch because they are unsure they can rely on it.'],
      ['What single design factor moves adoption most?', 'Placement. A separate tool requires a decision to open it; an affordance inside the existing workflow does not.'],
      ['Why train on failure modes rather than features?', 'Telling people exactly when it will not work increases trust and stops the first surprise feeling like a betrayal. Naming the abandonment threshold also makes people report problems instead of quietly stopping.']
    ]
  },

  {
    id: 'ai-metrics',
    title: 'AI Metrics',
    domain: 'ai-pm', tier: 1, priority: 'high',
    summary: 'The four layers you have to measure together, because each can be improved by worsening another.',
    what: `AI metrics span four layers: system health, output quality, user behaviour, and business outcome. Each is necessary and none is sufficient, because every one of them can be moved by degrading another.`,
    why: `AI features fail in ways conventional monitoring cannot see. Uptime is perfect, error rates are zero, and the product is answering from three-day-old documents. Only a layered metric set catches that.`,
    analogy: `A hospital monitoring both the equipment and the patient. Perfectly functioning equipment tells you nothing about whether the patient is recovering.`,
    technical: `**Layer 1 — system.** Availability, p50/p95 latency, error rate, throughput, cost per request. Conventional and necessary.

**Layer 2 — quality.** Groundedness, citation correctness, abstention rate, confidently-wrong rate on sampled production traffic, evaluation scores per release. This is the layer that does not exist unless you build it, and its absence is why AI systems degrade silently.

**Layer 3 — behaviour.** Adoption, queries per user, correction rate, whether users verify elsewhere, whether they retry, whether they abandon mid-task. This is where trust becomes measurable.

**Layer 4 — outcome.** Did the underlying problem shrink? Resolution time, escalations, repeat contacts, the thing the feature was actually for.

**The pairings that matter:** abstention rate against confidently-wrong rate; adoption against correction rate; cost against quality; latency against quality. Every one of these can be improved by worsening its pair, which is why single-metric reporting on AI features is misleading almost by construction.

**Sample production for quality; do not rely on evaluation alone.** Your golden set describes the traffic you anticipated. Production contains the traffic you did not, and the gap widens continuously.

**Track index freshness and corpus version as first-class metrics.** A stale index is the most common silent failure in retrieval systems, and nothing else on any dashboard reveals it.`,
    diagram: `
   FOUR LAYERS — all necessary, none sufficient

     1  SYSTEM      availability · p50/p95 latency
                    error rate · throughput · cost/request
                    conventional, and necessary

     2  QUALITY     groundedness · citation correctness
                    abstention rate · confidently-wrong rate
                    (sampled from PRODUCTION)
                    ⚠ this layer does not exist unless you
                      build it — its absence is why AI systems
                      degrade silently

     3  BEHAVIOUR   adoption · queries/user · correction rate
                    verified-elsewhere · retries · abandonment
                    ← where TRUST becomes measurable

     4  OUTCOME     did the underlying problem shrink?
                    resolution time · escalations · repeat contacts

   ⚠ THE PAIRINGS — each improves by worsening its pair

     abstention rate   ⟷   confidently-wrong rate
     adoption          ⟷   correction rate
     cost              ⟷   quality
     latency           ⟷   quality

     single-metric reporting on AI features is misleading
     almost by construction

   ⚠ SAMPLE PRODUCTION — evaluation alone is not enough

     golden set   = the traffic you ANTICIPATED
     production   = the traffic you did not
     the gap widens continuously

   ⚠ TRACK INDEX FRESHNESS AND CORPUS VERSION

     a stale index is the most common silent failure
     in retrieval systems, and NOTHING else on any
     dashboard reveals it`,
    example: {
      language: 'python',
      caption: 'A four-layer dashboard, and the week it earned its keep',
      code: `def weekly_report(w):
    return {
      # ── 1. SYSTEM ────────────────────────────────────────
      "availability":        w.uptime_pct,              # 99.97
      "p95_latency_ms":      w.p95,                     # 2380
      "error_rate":          w.errors / w.requests,     # 0.001
      "cost_per_query":      w.spend / w.requests,      # 0.68

      # ── 2. QUALITY (sampled from production, n=150) ──────
      "groundedness_p50":    w.sampled_groundedness,    # 0.62 ⚠
      "citation_correct":    w.sampled_citation_ok,     # 0.71 ⚠
      "abstention_rate":     w.abstained / w.requests,  # 0.41 ⚠
      "confidently_wrong":   w.sampled_conf_wrong,      # 0.029 ⚠
      "index_age_hours":     w.index_age,               # 71   ⚠
      "corpus_version":      w.corpus_version,          # v14

      # ── 3. BEHAVIOUR ─────────────────────────────────────
      "adoption":            w.active / w.eligible,     # 0.68
      "queries_per_user":    w.requests / w.active,     # 8.1
      "correction_rate":     w.flagged_confirmed / w.answered,
      "verified_elsewhere":  w.opened_source / w.answered,  # 0.34 ⚠
      "abandoned_midtask":   w.abandoned / w.requests,

      # ── 4. OUTCOME ───────────────────────────────────────
      "repeat_contacts":     w.repeat_contacts,         # 24
      "median_resolution_m": w.median_resolution,
    }

# ⚠ THE WEEK THIS EARNED ITS KEEP
#
#   LAYER 1 said everything was fine.
#     availability 99.97% · errors 0.1% · latency normal
#     A conventional dashboard would have shown green.
#
#   LAYER 2 said it was not.
#     index_age_hours 71   ← ingestion had failed on Tuesday
#     groundedness fell 0.81 → 0.62
#     abstention rose 0.29 → 0.41 (the system correctly became
#       less confident about documents it could not match)
#
#   LAYER 3 said users had already noticed.
#     verified_elsewhere rose 0.19 → 0.34
#     ⚠ agents were checking the handbook again. They had felt
#       the degradation before any alert fired.
#
#   LAYER 4 said it was costing something real.
#     repeat_contacts 19 → 24
#
#   Nothing threw an exception at any point. No request failed.
#   The only signals were in layers 2, 3 and 4.

ALERTS = {                      # what we added afterwards
    "index_age_hours":     ("gt", 26),
    "groundedness_p50":    ("lt", 0.72),
    "verified_elsewhere":  ("gt", 0.25),   # the trust tripwire
    "confidently_wrong":   ("gt", 0.015),
}
# ⚠ verified_elsewhere is the most valuable alert we have.
#   It is users telling us they have stopped trusting the
#   system, measured before they say anything.`
    },
    prereq: ['ai-adoption'], next: ['ai-experimentation'],
    related: ['product-metrics', 'tracing', 'drift-detection', 'sampling-production', 'groundedness'],
    tools: ['opentelemetry', 'langsmith', 'phoenix', 'braintrust'],
    useCases: [
      'Detecting silent degradation that availability monitoring misses.',
      'Reporting AI feature health honestly to stakeholders.',
      'Alerting on loss of user trust before anyone complains.'
    ],
    avoid: [
      'Availability-only monitoring for AI features.',
      'Reporting a single quality number.'
    ],
    mistakes: [
      'Relying on evaluation scores without sampling production traffic.',
      'Reporting a correction rate that fell because coverage fell.',
      'Not tracking index freshness, the most common silent retrieval failure.',
      'Omitting behaviour metrics, which show trust loss before any complaint arrives.'
    ],
    keyTerms: [
      ['groundedness', 'Whether the answer is supported by retrieved text.'],
      ['confidently wrong', 'Answered, asserted and incorrect.'],
      ['production sampling', 'Scoring a sample of real traffic, not just the golden set.'],
      ['index freshness', 'How old the retrieval index is.'],
      ['verified-elsewhere rate', 'How often users check the source. A trust tripwire.'],
      ['metric pairing', 'Two metrics that trade against each other.']
    ],
    resources: [
      ['OpenTelemetry — GenAI semantic conventions', 'https://opentelemetry.io/docs/specs/semconv/gen-ai/', 'docs'],
      ['Ragas — metrics', 'https://docs.ragas.io/en/stable/concepts/metrics/', 'docs'],
      ['Google SRE — monitoring distributed systems', 'https://sre.google/sre-book/monitoring-distributed-systems/', 'reference']
    ],
    questions: [
      ['Why is availability monitoring insufficient for AI features?', 'They degrade rather than fail. A stale index still returns answers, so uptime reads 99.97% while groundedness collapses. Only a quality layer reveals it.'],
      ['What is the most valuable behavioural alert?', 'The rate at which users check the source elsewhere. A rise means they have stopped trusting the system, measured before anyone complains.'],
      ['Why must AI metrics be reported in pairs?', 'Each can be improved by worsening its pair — abstention against confidently-wrong, adoption against correction rate, cost against quality. A single number is misleading almost by construction.']
    ]
  },

  {
    id: 'ai-experimentation',
    title: 'AI Experimentation',
    domain: 'ai-pm', tier: 2, priority: 'medium',
    summary: 'Testing changes to a non-deterministic system, where the same input gives different outputs.',
    what: `Experimentation for AI features covers offline evaluation against a fixed set, and online experiments in production — with the complication that the system is stochastic, so identical inputs produce varying outputs.`,
    why: `Without a disciplined method, AI iteration becomes prompt-tweaking judged by impression. Teams change something, try three examples, declare improvement, and ship a regression.`,
    analogy: `Testing a drug rather than testing a bridge. The bridge either holds or it does not; the drug requires a controlled comparison because the outcome varies between subjects.`,
    technical: `**Offline first.** Every change runs against the golden set before it goes anywhere. It is fast, cheap, reproducible, and it catches most regressions. Fix the seed and temperature where you can, and run multiple samples where you cannot, because a single run of a stochastic system is one draw from a distribution.

**Change one thing.** Prompt, retrieval configuration, model, and chunking all interact. Changing two makes the result uninterpretable, and this is violated constantly because each change individually seems small.

**Report the distribution, not the mean.** A change that raises the average by two points while introducing a new failure mode on edge cases is a regression wearing a promotion's clothes. Look at what got worse, always.

**Then online.** A/B test with real users, on behavioural and outcome metrics — offline quality does not always translate. Guardrail metrics must be included, because a change that improves answer quality and doubles latency can lose overall.

**Ship shadow before you ship live** for anything substantial: run the new configuration alongside the old on real traffic, compare outputs, and expose nobody. It costs inference budget and it is the cheapest way to find out what real traffic does to a change.

**Version everything.** Prompt, model, retrieval config, corpus version. An experiment you cannot reproduce is an anecdote, and the corpus version is the one people forget.`,
    diagram: `
   THE SEQUENCE

     1  OFFLINE       against the golden set
                      fast · cheap · reproducible
                      catches most regressions

     2  SHADOW        new config alongside old, on real traffic
                      nobody is exposed
                      ⚠ the cheapest way to learn what real
                        traffic does to a change

     3  ONLINE A/B    behavioural + outcome metrics
                      offline quality does not always translate

   ⚠ CHANGE ONE THING

     prompt · retrieval config · model · chunking
     all interact. Changing two makes the result
     uninterpretable — and this is violated constantly
     because each change individually seems small.

   ⚠ REPORT THE DISTRIBUTION, NOT THE MEAN

     average +2 points
     …and a new failure mode on edge cases

     = a regression wearing a promotion's clothes
     ALWAYS look at what got WORSE

   STOCHASTIC SYSTEMS NEED REPEATS

     one run = one draw from a distribution
     fix seed and temperature where you can
     run multiple samples where you cannot

   VERSION EVERYTHING

     prompt · model · retrieval config · CORPUS VERSION
                                          └─ the one people forget

     an experiment you cannot reproduce is an anecdote`,
    example: {
      language: 'python',
      caption: 'An offline experiment that would have shipped a regression',
      code: `EXPERIMENT = {
    "id": "exp-041",
    "change": "add reranking after retrieval",   # ONE thing
    "baseline": {"prompt": "v7", "model": "sonnet-5",
                 "retrieval": "topk-5", "corpus": "v14"},
    "variant":  {"prompt": "v7", "model": "sonnet-5",
                 "retrieval": "topk-15+rerank-5", "corpus": "v14"},
    "samples_per_case": 3,          # stochastic → repeat
}

def compare(golden, baseline, variant, n=3):
    out = {}
    for name, cfg in (("baseline", baseline), ("variant", variant)):
        per_case = {}
        for case in golden:
            scores = [score(case, run(case, cfg)) for _ in range(n)]
            per_case[case["id"]] = sum(scores) / n
        out[name] = per_case
    return out

r = compare(GOLDEN, **EXPERIMENT_CFGS)

# ── THE HEADLINE ───────────────────────────────────────────
# baseline mean 0.784   variant mean 0.806   (+2.2 points)
# → "reranking helps, ship it"

# ── ⚠ THE DISTRIBUTION SAYS OTHERWISE ──────────────────────
improved  = [c for c in GOLDEN if r["variant"][c["id"]] > r["baseline"][c["id"]] + .05]
regressed = [c for c in GOLDEN if r["variant"][c["id"]] < r["baseline"][c["id"]] - .05]

print(len(improved), len(regressed))        # 47 improved, 12 regressed

from collections import Counter
print(Counter(c["category"] for c in regressed))
# Counter({'not-in-corpus': 11, 'edge': 1})

# ⚠ ELEVEN OF TWELVE REGRESSIONS ARE ABSTENTION CASES.
#   Reranking always returns a top-5 with a plausible-looking
#   score, so the abstention threshold — tuned against raw
#   retrieval scores — no longer fires.
#
#   The system got better at answering and worse at DECLINING.
#   Confidently-wrong rate: 0.011 → 0.024, more than doubled.
#
#   The +2.2 point mean was real and it was the wrong summary.

# DECISION  do not ship. Re-tune the abstention threshold
#           against reranked scores, then re-run.
#           ⚠ that is a SECOND change — run it as exp-042,
#             not as a patch to this one.

# ── AFTER exp-042 ──────────────────────────────────────────
# variant mean 0.812 · regressed cases 2 · confidently wrong 0.009
# → shadow for one week, then A/B with latency as a guardrail
#   (reranking added 180ms; worth checking it does not cost
#    more in abandonment than it gains in quality)`
    },
    prereq: ['ai-metrics'], next: [],
    related: ['ab-testing', 'golden-sets', 'regression-testing', 'offline-vs-online-eval', 'eval-thresholds-quality-gates'],
    tools: ['ragas', 'langsmith', 'braintrust', 'phoenix'],
    useCases: [
      'Deciding whether a prompt or retrieval change is an improvement.',
      'Catching a regression hidden inside an average improvement.',
      'Validating offline gains against real traffic.'
    ],
    avoid: [
      'Judging changes on a handful of examples.',
      'Changing several things at once.'
    ],
    mistakes: [
      'Reporting the mean and missing that a subgroup regressed.',
      'Running a stochastic system once and treating the result as the answer.',
      'Changing prompt and retrieval together, making the result uninterpretable.',
      'Not versioning the corpus, so the experiment cannot be reproduced.'
    ],
    keyTerms: [
      ['offline evaluation', 'Scoring against a fixed golden set.'],
      ['shadow deployment', 'Running a new configuration on real traffic, exposed to nobody.'],
      ['guardrail metric', 'A metric that must not degrade for a change to ship.'],
      ['regression subgroup', 'The cases that got worse inside an average improvement.'],
      ['stochastic variation', 'Different outputs from identical inputs.'],
      ['reproducibility', 'Being able to re-run an experiment exactly.']
    ],
    resources: [
      ['Ragas — evaluation', 'https://docs.ragas.io/en/stable/', 'docs'],
      ['Hugging Face — evaluation guidebook', 'https://github.com/huggingface/evaluation-guidebook', 'repo'],
      ['Microsoft — A/B testing at scale', 'https://www.microsoft.com/en-us/research/group/experimentation-platform-exp/', 'reference']
    ],
    questions: [
      ['Why report the distribution rather than the mean?', 'A change can raise the average while introducing a new failure mode. In one real case a two-point mean improvement hid eleven regressed abstention cases and a doubled confidently-wrong rate.'],
      ['Why change only one thing at a time?', 'Prompt, retrieval, model and chunking interact. Changing two makes the result uninterpretable — and the rule is violated constantly because each change individually seems small.'],
      ['What is shadow deployment for?', 'Running a new configuration alongside the old on real traffic with nobody exposed. It costs inference budget and is the cheapest way to learn what real traffic does to a change.']
    ]
  }
];
