/**
 * DOMAIN R — PRODUCT MANAGEMENT, part 4 of 6: specifying the work
 */
export const topics = [
  {
    id: 'prd-requirements',
    title: 'PRDs & Requirements',
    domain: 'product', tier: 2, priority: 'high',
    summary: 'Writing down what must be true, at the level of detail the decision actually needs.',
    what: `A product requirements document states the problem, who it is for, what the solution must do, what it explicitly will not do, and how success will be judged.`,
    why: `Shared understanding decays fast. Six weeks after a conversation, three people remember three different agreements, and the cost of that divergence is discovered at the end rather than the beginning.`,
    analogy: `A building's plans rather than a sketch on a napkin. The napkin was enough to agree there should be a house; it is not enough to pour concrete.`,
    technical: `The sections that earn their place: **problem and evidence**, **users and situation**, **success metrics**, **requirements** (what must be true, not how to build it), **explicit non-goals**, **open questions with owners**, and **risks**.

**Non-goals do more work than requirements.** They prevent scope drift and, more importantly, surface disagreement early — the argument you have about a non-goal in week one is the argument you would otherwise have in week six with code already written.

**Requirements state outcomes, not implementations.** "The answer must cite the source clause" is a requirement. "Use a citation component with a tooltip" is a design decision that belongs to whoever is designing.

Length should track the cost of being wrong. A reversible change to an internal tool needs a paragraph. A change to how money moves needs considerably more.

**AI features need sections a conventional PRD does not have**: acceptable error rate and how it is measured, the abstention policy, what happens when the model is wrong, what data is sent where, and the evaluation set the feature will be judged against. Agreeing those before building is what prevents "is 92% good enough?" being argued for the first time during launch review.`,
    diagram: `
   SECTIONS THAT EARN THEIR PLACE

     PROBLEM + EVIDENCE     why this, why now
     USERS + SITUATION      who, in what circumstance
     SUCCESS METRICS        how we will judge it
     REQUIREMENTS           what must be TRUE (not how to build)
     ⚠ NON-GOALS            what this explicitly is NOT
     OPEN QUESTIONS         each with an OWNER and a date
     RISKS                  what could make this wrong

   ⚠ NON-GOALS DO MORE WORK THAN REQUIREMENTS

     the argument you have about a non-goal in week 1
     is the argument you would otherwise have in week 6
     WITH CODE ALREADY WRITTEN

   REQUIREMENTS STATE OUTCOMES, NOT IMPLEMENTATIONS

     ✓ "the answer must cite the source clause"
     ✗ "use a citation component with a tooltip"
                              └─ that belongs to whoever designs it

   LENGTH TRACKS THE COST OF BEING WRONG

     reversible internal tool change   a paragraph
     change to how money moves         considerably more

   ⚠ AN AI PRD NEEDS SECTIONS A NORMAL ONE DOES NOT

     ACCEPTABLE ERROR RATE   and how it is measured
     ABSTENTION POLICY       when it declines to answer
     WRONG-ANSWER BEHAVIOUR  what happens, who notices
     DATA FLOW               what is sent where, retained how long
     EVALUATION SET          the golden set it is judged against

     agreeing these BEFORE building is what prevents
     "is 92% good enough?" being argued for the first time
     in the launch review`,
    example: {
      language: 'text',
      caption: 'The AI-specific half of a PRD — the part usually missing',
      code: `FEATURE  Cited policy answers in the agent console

REQUIREMENTS (outcomes, not implementations)
  R1  Every answer cites at least one source clause, linked.
  R2  When retrieval returns nothing above the relevance floor,
      the system says so rather than answering.
  R3  Answer appears within 3s at p95.
  R4  Agent can report a wrong answer in one click, and the
      report captures the full trace.

NON-GOALS  ← the section that prevents six weeks of drift
  N1  Not customer-facing. Agents only, this release.
  N2  Does not draft refund approvals. (Agents cannot approve
      above ₹5,000 anyway — drafting one creates a worse moment.)
  N3  No conversational follow-up. Single question, single answer.
  N4  Does not cover regional policy variants. Out of corpus.

  ⚠ N2 caused a 40-minute argument in review. That argument
    was going to happen regardless. Having it in week 1 cost
    40 minutes; having it in week 6 costs a sprint.

── THE AI SECTIONS ──────────────────────────────────────────

ACCEPTABLE ERROR RATE
  Confidently wrong (answered, cited, incorrect):  < 1.5%
  Measured on:   golden set of 220 questions drawn from resolved
                 tickets, stratified: 120 common, 60 edge, 40 not-
                 in-corpus (correct behaviour = abstain)
  Judged by:     two support leads, independently, disagreements
                 resolved by a third. Re-run before every release.

ABSTENTION POLICY
  Abstain when   top retrieval score < 0.62, OR the drafted answer
                 is not supported by the retrieved text (groundedness
                 check), OR the question matches a regional variant.
  Abstention target: 25-35%. Below 20% means it is overreaching;
                     above 45% means it is not useful.
  ⚠ We are explicitly buying a HIGHER abstention rate to get a
    lower confidently-wrong rate. That is the central trade of
    this feature and it is stated here so nobody relitigates it.

WHEN IT IS WRONG
  Agent reports → trace stored → weekly review by PM + support lead
  → confirmed errors are added to the golden set as regression cases.
  Two confirmed policy-commitment errors in a week = feature off.

DATA FLOW
  Question + retrieved chunks → Anthropic API. No customer PII in
  the corpus (policy documents only). Zero retention configured.
  Traces stored 30 days in our own infrastructure, PII-redacted.

OPEN QUESTIONS
  Q1  Who owns the golden set after launch?        → Priya, by 8 Sep
  Q2  Does 3s p95 hold at 60 concurrent agents?    → Eng spike, 5 Sep`
    },
    prereq: ['problem-statements'], next: ['epics-user-stories', 'acceptance-criteria'],
    related: ['acceptance-criteria', 'golden-sets', 'ai-risk', 'human-in-the-loop'],
    tools: [],
    useCases: [
      'Preventing three people from remembering three different agreements.',
      'Surfacing disagreement in week one rather than week six.',
      'Agreeing an acceptable error rate before it is a launch-review argument.'
    ],
    avoid: [
      'Documents specifying implementation rather than outcomes.',
      'Length disproportionate to the cost of being wrong.'
    ],
    mistakes: [
      'Omitting non-goals, which is where scope drift enters.',
      'Writing requirements as designs, which removes the designer’s judgement.',
      'For AI features, not stating the acceptable error rate and abstention policy up front.',
      'Leaving open questions without an owner and a date, so they stay open.'
    ],
    keyTerms: [
      ['requirement', 'What must be true. An outcome, not an implementation.'],
      ['non-goal', 'What the feature explicitly will not do.'],
      ['open question', 'An unresolved decision, with an owner and a date.'],
      ['acceptable error rate', 'The agreed quality bar for an AI feature.'],
      ['abstention policy', 'When the system declines to answer.'],
      ['golden set', 'The evaluation set the feature is judged against.']
    ],
    resources: [
      ['Atlassian — product requirements documents', 'https://www.atlassian.com/agile/product-management/requirements', 'reference'],
      ['Amazon — working backwards / PR-FAQ', 'https://www.aboutamazon.com/news/workplace/an-insider-look-at-amazons-culture-and-processes', 'article'],
      ['Google — People + AI Guidebook', 'https://pair.withgoogle.com/guidebook/', 'reference']
    ],
    questions: [
      ['Why are non-goals more valuable than requirements?', 'They surface disagreement early. The argument about a non-goal in week one is the same argument you would otherwise have in week six with code already written.'],
      ['What separates a requirement from a design decision?', 'A requirement states what must be true — "the answer must cite its source". A design decision states how — "use a citation component with a tooltip" — and belongs to the designer.'],
      ['What sections does an AI PRD need that a conventional one does not?', 'Acceptable error rate and how it is measured, the abstention policy, wrong-answer behaviour, data flow, and the evaluation set the feature is judged against.']
    ]
  },

  {
    id: 'epics-user-stories',
    title: 'Epics & User Stories',
    domain: 'product', tier: 3, priority: 'medium',
    summary: 'Slicing work into pieces small enough to finish and meaningful enough to matter.',
    what: `An epic is a large body of work delivering a coherent outcome. A user story is a small slice of it, written from the user's perspective: as [who], I want [what], so that [why].`,
    why: `Work that cannot be finished within an iteration cannot be validated, and unvalidated work accumulates risk silently. Slicing is how you convert a six-week bet into six one-week bets you can stop after any of them.`,
    analogy: `A tasting menu rather than one enormous dish. Each course is complete and you learn something after every one.`,
    technical: `The **so that** clause is the part that matters and the part usually dropped. Without it a story is a task and the team cannot make a sensible trade-off when the implementation turns out harder than expected.

**Slice vertically, not horizontally.** "Build the retrieval layer" is a horizontal slice — it delivers nothing usable and cannot be validated. "Answer one category of policy question end to end" is vertical: thinner, but it produces something a user can react to.

**INVEST** is the useful checklist: Independent, Negotiable, Valuable, Estimable, Small, Testable. Most story problems are a failure of *valuable* (it is a task, not an outcome) or *small* (it cannot finish in an iteration).

**Spikes are legitimate stories.** For AI work, "determine whether we can answer policy questions below 2% error" is a real, valuable, timeboxed piece of work whose output is knowledge rather than software. Hiding that work inside a feature story is how estimates go wrong.

Stories are a conversation prompt, not a specification. The card is small on purpose; the shared understanding is built by talking about it.`,
    diagram: `
   THE SHAPE

     As a   [who]
     I want [what]
     so that [why]          ← the clause usually dropped,
                              and the one that matters

     without "so that", it is a TASK, and the team cannot
     trade off sensibly when the work turns out harder

   ⚠ SLICE VERTICALLY, NOT HORIZONTALLY

     HORIZONTAL — delivers nothing usable
       ▓▓▓▓▓▓▓▓▓▓▓▓  build the retrieval layer
       ░░░░░░░░░░░░  build the answer layer
       ░░░░░░░░░░░░  build the UI
       nothing to validate until all three are done

     VERTICAL — thin, complete, reactable
       ▓▓░░░░░░░░░░  refunds questions, end to end
       ░░▓▓░░░░░░░░  shipping questions, end to end
       ░░░░▓▓░░░░░░  account questions, end to end
       a user can react after the FIRST one

   INVEST

     I ndependent    N egotiable    V aluable
     E stimable      S mall         T estable

     most story problems are a failure of
       VALUABLE  (it is a task, not an outcome)
       SMALL     (it cannot finish in an iteration)

   ⚠ SPIKES ARE LEGITIMATE STORIES

     "determine whether we can answer policy questions
      below 2% error — timebox 3 days"

     output is KNOWLEDGE, not software.
     Hiding this inside a feature story is how estimates
     go wrong.`,
    example: {
      language: 'text',
      caption: 'The same epic sliced badly and well',
      code: `EPIC  Agents get trustworthy policy answers without leaving
      the console.
      Outcome: repeat contacts from escalated threads 30/wk → 10/wk


SLICED BADLY — horizontal
─────────────────────────────────────────────────────────────
  S1  Build the document ingestion pipeline        5 pts
  S2  Build the embedding + retrieval service      8 pts
  S3  Build the answer generation service          5 pts
  S4  Build the console UI component               5 pts
  S5  Integrate                                    3 pts

  ⚠ Nothing is usable until S5. If S3 reveals the model cannot
    do this, S1, S2 and S4 were all wasted. Three weeks of work
    and the first learning arrives at the end.


SLICED WELL — vertical, with the spike made explicit
─────────────────────────────────────────────────────────────
  S0  SPIKE (timebox 3d): can we answer 20 real refund-policy
      questions at <2% confidently-wrong, using the crudest
      possible pipeline?
      Output: a number and a recommendation. Not shippable code.
      ⚠ this is where the risk actually lives

  S1  As an agent handling a refund question,
      I want a cited answer from the refund policy,
      so that I can respond without asking a colleague.
      — refund policy only. One category. End to end, behind a flag.

  S2  As an agent, I want the system to say "not covered" when
      the policy does not answer my question,
      so that I do not relay a guess to a customer.

  S3  As an agent, I want to flag a wrong answer in one click,
      so that it gets fixed rather than just annoying me.

  S4  As an agent handling shipping questions, I want the same
      thing for the shipping policy.
      — second category. Now we know whether it generalises.

  After S1 (one week) a real agent uses it on real calls and
  we learn something. After S0 (three days) we know whether
  to proceed at all.

⚠ NOTE S2 AND S3 ARE NOT "POLISH".
  For an AI feature, abstention and error reporting are load-
  bearing. Deferring them to a later sprint ships the exact
  behaviour that destroys trust.`
    },
    prereq: ['prd-requirements'], next: ['acceptance-criteria'],
    related: ['acceptance-criteria', 'sprint-planning', 'backlog-management', 'ai-feasibility'],
    tools: [],
    useCases: [
      'Converting a large bet into small validatable ones.',
      'Making feasibility risk an explicit, timeboxed item.',
      'Giving a team work it can actually finish in an iteration.'
    ],
    avoid: [
      'Horizontal slices that deliver nothing usable.',
      'Stories without a "so that" clause.'
    ],
    mistakes: [
      'Slicing by architectural layer, so nothing is validatable until the end.',
      'Dropping the "so that", turning stories into tasks.',
      'Hiding research risk inside a feature story instead of writing a spike.',
      'Deferring abstention and error reporting as polish, when they are load-bearing for AI features.'
    ],
    keyTerms: [
      ['epic', 'A large body of work delivering a coherent outcome.'],
      ['user story', 'A small slice written from the user’s perspective.'],
      ['vertical slice', 'Thin but complete end to end.'],
      ['INVEST', 'Independent, Negotiable, Valuable, Estimable, Small, Testable.'],
      ['spike', 'A timeboxed story whose output is knowledge.'],
      ['story points', 'A relative size estimate, not a time commitment.']
    ],
    resources: [
      ['Atlassian — user stories', 'https://www.atlassian.com/agile/project-management/user-stories', 'reference'],
      ['Mountain Goat — INVEST in good stories', 'https://www.mountaingoatsoftware.com/blog/advantages-of-the-as-a-user-i-want-user-story-template', 'article'],
      ['Atlassian — epics', 'https://www.atlassian.com/agile/project-management/epics', 'reference']
    ],
    questions: [
      ['Why slice vertically rather than horizontally?', 'A vertical slice is thin but complete, so a user can react to it and you learn early. A horizontal slice delivers nothing usable until every layer is finished, which puts all the learning at the end.'],
      ['What does the "so that" clause do?', 'It carries the purpose, which is what lets the team trade off sensibly when the implementation turns out harder than expected. Without it the story is a task.'],
      ['Why should spikes be explicit stories?', 'For AI work the dominant risk is often feasibility. Writing "determine whether we can hit under 2% error, timeboxed to three days" makes that risk visible rather than hiding it inside a feature estimate.']
    ]
  },

  {
    id: 'acceptance-criteria',
    title: 'Acceptance Criteria',
    domain: 'product', tier: 2, priority: 'high',
    summary: 'The conditions that decide whether something is done — agreed before it is built.',
    what: `Acceptance criteria are the specific, checkable conditions a piece of work must satisfy to be considered complete.`,
    why: `Without them, "done" is negotiated after the work, by whoever has more energy for the argument. With them, it is a checklist, and the disagreement happens at the cheap end.`,
    analogy: `The pass conditions on an exam, published before the exam. Nobody argues about marking when the criteria were known in advance.`,
    technical: `The two common forms: a **checklist** of conditions, or **Given / When / Then** scenarios which make the context, action and expected outcome explicit and map cleanly onto automated tests.

Good criteria are **observable** (someone else could check them), **binary** (met or not), and **written before implementation** — criteria written afterwards describe what was built rather than what was needed.

They must cover the unhappy paths: empty states, errors, permissions, and what happens at the boundaries. Most defects live there, and most criteria only describe the happy path.

**For AI features, acceptance criteria have to be statistical rather than deterministic.** "Returns the correct answer" is not checkable for a non-deterministic system. The checkable form is: on the agreed evaluation set, the confidently-wrong rate is below X, the abstention rate is between Y and Z, and specific named regression cases behave correctly. That reframing is what makes an AI feature releasable at all — otherwise it is either blocked forever on perfection or waved through on impression.`,
    diagram: `
   TWO FORMS

     CHECKLIST          GIVEN / WHEN / THEN
       · condition        Given  [context]
       · condition        When   [action]
       · condition        Then   [expected outcome]
                          ← maps cleanly onto automated tests

   GOOD CRITERIA ARE

     OBSERVABLE   someone else could check them
     BINARY       met or not met, no interpretation
     PRIOR        written BEFORE implementation
                  ← criteria written after describe what was
                    BUILT, not what was NEEDED

   ⚠ COVER THE UNHAPPY PATHS

     empty states · errors · permissions · boundaries
     most defects live there
     most criteria only describe the happy path

   ⚠ AI CRITERIA MUST BE STATISTICAL, NOT DETERMINISTIC

     ✗ "returns the correct answer"
       not checkable for a non-deterministic system
       → either blocked forever on perfection,
         or waved through on impression

     ✓ on golden set v3 (220 cases):
         confidently-wrong        < 1.5%
         abstention rate          25-35%
         p95 latency              < 3s
         regression cases R1-R7   all pass

       THIS is releasable. The reframing is what makes
       an AI feature shippable at all.`,
    example: {
      language: 'text',
      caption: 'Criteria for a conventional story and an AI story',
      code: `CONVENTIONAL STORY
  "As an agent, I want to flag a wrong answer in one click."

  ✓ A flag control is visible on every answer.
  ✓ Clicking it records: answer text, retrieved chunks, question,
    agent id, timestamp — in a single trace record.
  ✓ Confirmation appears within 500ms.
  ✓ The flagged answer remains on screen (it is not hidden).
  ✓ UNHAPPY: if the trace write fails, the agent still sees
    confirmation and the record is queued for retry.
  ✓ UNHAPPY: flagging twice does not create two records.
  ✓ PERMISSIONS: any agent can flag; only leads can dismiss.


AI STORY — the reframing that makes it releasable
  "As an agent handling a refund question, I want a cited answer."

  ✗ NOT THIS
    "Returns the correct answer for refund policy questions."
    — unfalsifiable. Correct for which questions? Judged by whom?

  ✓ MEASURED ON GOLDEN SET v3 (220 cases, 120 common /
    60 edge / 40 not-in-corpus)

      confidently-wrong rate       < 1.5%      (currently 0.9%)
      abstention rate              25-35%      (currently 29%)
      abstains on all 40 not-in-corpus cases   (currently 40/40)
      every answer carries ≥1 clause citation  (100%)
      citation resolves to a real clause       (100%)
      p95 end-to-end latency       < 3s        at 60 concurrent
      regression set R1-R7 pass                (7/7)

  ✓ JUDGED BY  two support leads independently; disagreements
               resolved by a third. Re-run before every release.

  ✓ UNHAPPY:   retrieval returns nothing above floor
               → "not covered by the policy documents I have"
               → NOT a generated guess
  ✓ UNHAPPY:   model API unavailable
               → existing handbook search shown, error logged
               → NOT a spinner that never resolves

  ⚠ THE ABSTENTION BAND IS A TWO-SIDED CRITERION.
    Below 20% means it is overreaching and will be wrong more.
    Above 45% means it is not useful enough to adopt.
    Only stating the lower bound would have shipped a system
    that declines everything and passes.`
    },
    prereq: ['epics-user-stories'], next: ['sprint-planning'],
    related: ['prd-requirements', 'golden-sets', 'regression-testing', 'accuracy-metrics'],
    tools: [],
    useCases: [
      'Making "done" a checklist rather than a negotiation.',
      'Defining releasable quality for a non-deterministic feature.',
      'Ensuring unhappy paths are built rather than discovered.'
    ],
    avoid: [
      'Criteria written after implementation.',
      'Deterministic phrasing for AI behaviour.'
    ],
    mistakes: [
      'Covering only the happy path, where few defects live.',
      'Writing criteria that require interpretation rather than observation.',
      'For AI, demanding correctness rather than a measured error rate on a named evaluation set.',
      'Stating only a lower bound on abstention, so a system that declines everything passes.'
    ],
    keyTerms: [
      ['acceptance criteria', 'Checkable conditions for completion.'],
      ['Given / When / Then', 'A scenario format that maps onto tests.'],
      ['definition of done', 'Team-wide criteria applying to all work.'],
      ['unhappy path', 'Errors, empty states, permissions, boundaries.'],
      ['statistical criterion', 'A rate measured on an evaluation set.'],
      ['two-sided criterion', 'A band with both an upper and lower bound.']
    ],
    resources: [
      ['Atlassian — acceptance criteria', 'https://www.atlassian.com/work-management/project-management/acceptance-criteria', 'reference'],
      ['Cucumber — Gherkin reference', 'https://cucumber.io/docs/gherkin/reference/', 'docs'],
      ['Google — People + AI Guidebook', 'https://pair.withgoogle.com/guidebook/', 'reference']
    ],
    questions: [
      ['Why must acceptance criteria be written before implementation?', 'Criteria written afterwards describe what was built rather than what was needed, and "done" ends up negotiated by whoever has more energy for the argument.'],
      ['How do acceptance criteria change for AI features?', 'They become statistical: a confidently-wrong rate below a threshold on a named evaluation set, an abstention band, and specific regression cases — rather than an unfalsifiable claim of correctness.'],
      ['Why state abstention as a band rather than a maximum?', 'Only bounding it from one side lets a degenerate system pass. A model that declines every question has a perfect error rate and no value.']
    ]
  }
];
