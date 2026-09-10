/**
 * DOMAIN R — PRODUCT MANAGEMENT, part 1 of 4: discovery
 * (BUILD.md section 21. Split across four files for maintainability;
 *  product.js re-exports all four as one domain.)
 */
export const topics = [
  {
    id: 'product-discovery',
    title: 'Product Discovery',
    domain: 'product', tier: 1, priority: 'high',
    summary: 'Finding out what is worth building before committing to building it.',
    what: `Discovery is the work of reducing uncertainty about a problem before you spend engineering time on a solution. It answers four questions: is the problem real, is it valuable, can we solve it, and should we.`,
    why: `The most expensive failure in product work is building the wrong thing well. Discovery is cheap relative to delivery — a week of interviews costs a fraction of a quarter of engineering — and it is the only reliable defence against that failure.`,
    analogy: `A survey before construction. Nobody argues that surveying is wasted time, because everybody has seen what happens when a foundation is poured on the wrong ground.`,
    technical: `The four risks worth naming separately, because they need different evidence:
- **Value risk** — will anyone use it? Evidence: interviews, existing behaviour, willingness to pay.
- **Usability risk** — can they figure it out? Evidence: prototypes, usability tests.
- **Feasibility risk** — can we build it? Evidence: technical spikes, prototypes with real data.
- **Business viability risk** — should we? Evidence: unit economics, legal, support load.

**For AI features, feasibility risk moves to the front.** In conventional software, if you can specify it you can usually build it. With AI, whether a model can do the task at acceptable quality is genuinely uncertain until you test it, so the first discovery activity is often a quality spike against real examples rather than an interview.

Discovery is continuous, not a phase. Teams that treat it as a stage gate ("discovery done, now delivery") stop learning at exactly the point where they start getting real signal.`,
    diagram: `
   FOUR RISKS, FOUR KINDS OF EVIDENCE

     VALUE        will anyone use it?
                  → interviews · existing behaviour · willingness to pay

     USABILITY    can they figure it out?
                  → prototypes · usability tests

     FEASIBILITY  can we build it?
                  → technical spikes · real-data prototypes

     VIABILITY    should we?
                  → unit economics · legal · support load

   ⚠ FOR AI FEATURES, FEASIBILITY MOVES TO THE FRONT

     conventional software
       if you can specify it, you can usually build it
       → validate VALUE first

     AI features
       whether the model can do it at acceptable quality
       is genuinely unknown until you test
       → run a QUALITY SPIKE on 20 real examples first

     Because a validated problem you cannot solve
     is still not a roadmap item.

   DISCOVERY IS CONTINUOUS, NOT A PHASE

     ✗  discovery ──gate──► delivery
        stops learning exactly when signal starts

     ✓  discovery ⇄ delivery
        running continuously, informing each other`,
    example: {
      language: 'text',
      caption: 'A discovery week for an AI feature',
      code: `REQUEST  "Add AI so support agents can answer policy questions faster."

DAY 1 — FRAME THE RISK
  Value        agents ask policy questions ~40x/day (ticket data)     LOW risk
  Usability    it is a search box; they already use one              LOW risk
  Feasibility  can a model answer from our policy docs correctly?    ← UNKNOWN
  Viability    ~$0.02/query x 40/day x 60 agents = ~$1,400/mo        acceptable

  The dominant risk is FEASIBILITY. Start there, not with interviews.

DAY 2-3 — QUALITY SPIKE
  Pull 20 real policy questions from ticket history.
  Build the crudest possible pipeline: chunk the PDFs, embed, retrieve, answer.
  Score by hand against what the agent actually answered.

  Result   14/20 correct and cited
            4/20 correct but no citation
            2/20 CONFIDENTLY WRONG   ← the finding that matters

DAY 4 — INTERVIEW AROUND THE FINDING
  Ask five agents: "what happens if it is confidently wrong?"

  "I'd trust it the first few times, then stop using it entirely."
  "If it cites the clause I can check in ten seconds. If not I have to
   look it up anyway, so it saved me nothing."

  → citations are not a nice-to-have. They are the FEATURE.

DAY 5 — DECIDE
  Build: retrieval with mandatory citation, abstain when unsupported.
  Do NOT build: a confident chat assistant.
  Success metric: not "answers given" but "answers accepted without
  the agent opening the source document".

COST  one week and no engineering commitment.
      The version we would have built on day 1 was the wrong one.`
    },
    prereq: [], next: ['user-research', 'problem-statements'],
    related: ['ai-feasibility', 'opportunity-sizing', 'jtbd', 'ai-use-case-selection'],
    tools: [],
    useCases: [
      'Deciding whether a requested feature is worth building.',
      'Sequencing validation work by which risk dominates.',
      'Killing an idea cheaply before it consumes a quarter.'
    ],
    avoid: [
      'Treating discovery as a stage gate that ends.',
      'Interviewing about value when feasibility is the unknown.'
    ],
    mistakes: [
      'Validating value on an AI feature whose feasibility is unproven.',
      'Running discovery as a phase and stopping once delivery starts.',
      'Confusing stakeholder requests with validated problems.',
      'Producing discovery artefacts nobody uses to make a decision.'
    ],
    keyTerms: [
      ['value risk', 'Whether anyone will use it.'],
      ['usability risk', 'Whether they can figure it out.'],
      ['feasibility risk', 'Whether it can be built. Dominant for AI features.'],
      ['viability risk', 'Whether the business should do it.'],
      ['spike', 'A short timeboxed technical investigation.'],
      ['continuous discovery', 'Discovery running alongside delivery, not before it.']
    ],
    resources: [
      ['Continuous Discovery Habits — overview', 'https://www.producttalk.org/continuous-discovery-habits/', 'reference'],
      ['Marty Cagan — the four big risks', 'https://www.svpg.com/four-big-risks/', 'article'],
      ['Nielsen Norman Group — discovery', 'https://www.nngroup.com/articles/discovery-phase/', 'article']
    ],
    questions: [
      ['What are the four risks discovery addresses?', 'Value (will anyone use it), usability (can they figure it out), feasibility (can we build it) and viability (should the business do it). Each needs different evidence.'],
      ['Why does feasibility come first for AI features?', 'In conventional software, a specification you can write is usually one you can build. With AI, whether the model reaches acceptable quality is genuinely unknown until tested, so a quality spike beats an interview as the first move.'],
      ['What goes wrong when discovery is treated as a phase?', 'The team stops learning at the moment real signal starts arriving. Discovery should run continuously alongside delivery, each informing the other.']
    ],
    interview: {
      s30: 'Discovery is reducing uncertainty about a problem before committing engineering time. I frame it as four risks — value, usability, feasibility, viability — and start with whichever one dominates.',
      s90: 'For AI features that sequencing changes, and it is the thing I have seen teams get wrong most often. In normal software, if you can specify it you can build it, so you validate value first. With AI, feasibility is the genuine unknown — you do not know whether the model can do the task at acceptable quality until you try it on real examples. So my first move is usually a two-day quality spike on twenty real cases rather than a round of interviews. On a support-assistant project that spike found that two of twenty answers were confidently wrong, and when we took that specific finding back to agents, they told us citations were not a nice-to-have but the entire feature. We shipped mandatory citation with abstention instead of a confident chat assistant, which is not what anybody asked for on day one.'
    }
  },

  {
    id: 'user-research',
    title: 'User Research',
    domain: 'product', tier: 1, priority: 'high',
    summary: 'Learning what people actually do, as distinct from what they say they do.',
    what: `User research is the systematic gathering of evidence about users' behaviour, context and needs. It spans qualitative methods (interviews, observation) and quantitative ones (surveys, behavioural analytics).`,
    why: `Product decisions are made on a model of the user. That model is either built from evidence or from assumption, and assumption is reliably wrong in ways that are invisible until launch.`,
    analogy: `A doctor examining a patient rather than treating the symptom the patient names. What people report and what is actually happening are related but not the same.`,
    technical: `The methods split by what they can tell you:

**Qualitative** answers *why*. Interviews, contextual inquiry, usability tests, diary studies. Small n, deep insight, not generalisable to proportions.

**Quantitative** answers *how many*. Surveys, analytics, A/B tests. Large n, tells you scale, cannot tell you cause.

Using one where you need the other is the most common error: a survey cannot tell you why a workflow is abandoned, and five interviews cannot tell you what fraction of users abandon it.

**Behavioural evidence outranks stated preference.** What someone did last week is far more predictive than what they say they would do next week. Where you can, look at logs before you ask.

For AI features specifically, research must cover **failure tolerance**: what happens when the system is wrong. That is not a question users volunteer, and it usually determines the design more than the success case does.`,
    diagram: `
   TWO KINDS OF QUESTION, TWO KINDS OF METHOD

     QUALITATIVE — answers WHY
       interviews · contextual inquiry
       usability tests · diary studies
       small n · deep · NOT proportions

     QUANTITATIVE — answers HOW MANY
       surveys · analytics · A/B tests
       large n · scale · NOT causes

   ⚠ THE MOST COMMON ERROR IS USING ONE FOR THE OTHER

     "what % of users abandon this?"      → analytics, not interviews
     "why do they abandon it?"            → interviews, not a survey
     "would you use this feature?"        → ✗ meaningless either way

   THE HIERARCHY OF EVIDENCE

     strongest   what they DID           logs, behaviour
                 what they DO            observation
                 what they SAY they do   interviews
     weakest     what they SAY they WOULD do   surveys about the future

   ⚠ FOR AI FEATURES, ASK ABOUT FAILURE

     users will not volunteer this, and it usually determines
     the design more than the success case does:

       "what would you do if it gave you a wrong answer?"
       "how would you know it was wrong?"
       "how many wrong answers before you stopped trusting it?"

     answers to the third question are typically 2 or 3.`,
    example: {
      language: 'text',
      caption: 'The same question asked four ways, with four different answers',
      code: `QUESTION  Should we build an AI summary of long support threads?

SURVEY (n=400)
  "Would you find an AI thread summary useful?"
    78% yes
  → almost useless. Nobody says no to a hypothetical convenience.

INTERVIEWS (n=8)
  "Walk me through the last long thread you handled."
    6 of 8 scrolled to the bottom and read only the last 3 messages
    2 of 8 opened the original ticket and ignored the thread entirely
  → the real behaviour is TRIAGE, not reading

ANALYTICS
    median thread length in tickets escalated twice: 14 messages
    median time-on-thread before first reply: 47 seconds
  → 47 seconds is not enough to read 14 messages.
    They are already summarising — badly, by skipping.

OBSERVATION (4 sessions, screen shared)
    every agent opened the CUSTOMER's messages and skipped
    internal notes entirely
  → a summary of the whole thread would summarise mostly noise

WHAT WE SHIPPED
  Not "summarise this thread."
  "What has the customer asked for, and what have we promised?"
  — two fields, extracted from customer messages only.

  The survey would have led to a generic summary feature.
  The observation led to a useful one.

⚠ THE FAILURE QUESTION, ASKED SEPARATELY
  "If the promise field was wrong, what happens?"
    "I'd repeat a promise we can't keep. That's a complaint."
  → promises must link to the exact message they came from.
    Non-negotiable, and nobody mentioned it unprompted.`
    },
    prereq: ['product-discovery'], next: ['customer-interviews'],
    related: ['personas', 'journey-mapping', 'ai-ux', 'ab-testing'],
    tools: [],
    useCases: [
      'Understanding a workflow before redesigning it.',
      'Establishing whether a reported problem is widespread.',
      'Finding the failure tolerance of an AI feature.'
    ],
    avoid: [
      'Surveys asking about hypothetical future behaviour.',
      'Generalising proportions from a handful of interviews.'
    ],
    mistakes: [
      'Asking "would you use this?" — the answer is always yes and means nothing.',
      'Using qualitative methods to size a problem, or quantitative ones to explain it.',
      'Trusting stated preference over behavioural evidence.',
      'Never asking what happens when the AI feature is wrong.'
    ],
    keyTerms: [
      ['qualitative research', 'Answers why. Small n, deep.'],
      ['quantitative research', 'Answers how many. Large n, scale.'],
      ['contextual inquiry', 'Observing users in their real environment.'],
      ['stated vs revealed preference', 'What people say versus what they do.'],
      ['usability test', 'Watching someone attempt a task with a prototype.'],
      ['failure tolerance', 'How users respond when the system is wrong.']
    ],
    resources: [
      ['Nielsen Norman Group — UX research methods', 'https://www.nngroup.com/articles/which-ux-research-methods/', 'article'],
      ['Nielsen Norman Group — why you only need to test with 5 users', 'https://www.nngroup.com/articles/why-you-only-need-to-test-with-5-users/', 'article'],
      ['Google — People + AI Guidebook', 'https://pair.withgoogle.com/guidebook/', 'reference']
    ],
    questions: [
      ['When should you use qualitative versus quantitative research?', 'Qualitative answers why and cannot give you proportions; quantitative answers how many and cannot give you causes. Using one for the other is the most common research error.'],
      ['Why is "would you use this feature?" a bad question?', 'It asks about hypothetical future behaviour, which is the weakest form of evidence. Almost nobody declines a hypothetical convenience, so the answer carries no signal.'],
      ['What research question is specific to AI features?', 'What happens when it is wrong — how users would notice, what the consequence is, and how many errors they tolerate before abandoning it. Users do not volunteer this and it usually drives the design.']
    ]
  },

  {
    id: 'customer-interviews',
    title: 'Customer Interviews',
    domain: 'product', tier: 2, priority: 'high',
    summary: 'Asking about the past, not the future — and shutting up long enough to hear the answer.',
    what: `A customer interview is a structured conversation about what someone actually did, aimed at understanding their problem rather than testing your solution.`,
    why: `It is the highest-signal-per-hour research method available, and it is also the easiest to do badly — a leading interview produces confident, comfortable, entirely wrong conclusions.`,
    analogy: `A detective interviewing a witness. You ask what they saw, not whether they agree with your theory, because the moment you name the theory they start confirming it.`,
    technical: `The rules that do most of the work:

**Ask about the past, never the future.** "Tell me about the last time you…" rather than "would you…". Past behaviour is fact; future behaviour is speculation.

**Ask for stories, not opinions.** "Walk me through what happened" produces detail; "what do you think about X" produces a position.

**Do not pitch.** The moment you describe your solution, the interview becomes a politeness test.

**Follow the emotion.** Frustration, workarounds and improvised spreadsheets are where the real problems are. When someone says "it's fine, I just…", the thing after "just" is the finding.

**Silence is a tool.** The second thing someone says after a pause is usually more honest than the first.

Five to eight interviews with a coherent segment surfaces most of the significant patterns. Beyond that you get diminishing returns until you change segment.

Record the exact words. Paraphrased findings lose the specifics that make them actionable, and the verbatim quote is what convinces a stakeholder six weeks later.`,
    diagram: `
   THE FIVE RULES

     1  ASK ABOUT THE PAST
          ✓ "tell me about the last time you…"
          ✗ "would you use…"

     2  ASK FOR STORIES, NOT OPINIONS
          ✓ "walk me through what happened"
          ✗ "what do you think about…"

     3  DO NOT PITCH
          the moment you describe your solution,
          the interview becomes a politeness test

     4  FOLLOW THE EMOTION
          frustration · workarounds · improvised spreadsheets
          ⚠ "it's fine, I just…"
                              └─ THE THING AFTER "JUST" IS THE FINDING

     5  USE SILENCE
          the second thing someone says after a pause
          is usually more honest than the first

   HOW MANY?

     1-2   anecdotes
     5-8   patterns emerge          ← the useful range
     9-15  diminishing returns
     15+   change SEGMENT, not sample size

   RECORD THE EXACT WORDS

     paraphrase   "users want faster search"      → unusable
     verbatim     "I gave up and asked Priya on
                   Slack, she always knows"       → a whole design

     the verbatim quote is also what convinces a
     stakeholder six weeks later`,
    example: {
      language: 'text',
      caption: 'The same interview, run badly and run well',
      code: `BADLY
─────────────────────────────────────────────────────────────
PM   We're thinking about an AI assistant that answers policy
     questions instantly. Would that be useful?
USER Oh, that sounds great, yeah.
PM   And would you use it daily?
USER Probably, yeah.
PM   Any concerns?
USER Not really. Sounds good.

  Elapsed: 4 minutes. Learned: nothing.
  The user was being polite. Every answer confirms the pitch
  because the pitch came first.


WELL
─────────────────────────────────────────────────────────────
PM   Tell me about the last time you needed to check a policy.
USER This morning actually. Refund window on a damaged item.
PM   Walk me through exactly what you did.
USER Searched the handbook. Got about forty results. Gave up
     after two, and asked Priya on Slack — she always knows.
PM   [silence]
USER ...she's on leave next week, actually. I'm slightly
     dreading it.                                    ← the real finding
PM   How long did the Slack answer take?
USER Six, seven minutes? But the customer was waiting.
PM   What did you tell the customer during those minutes?
USER I said I'd check and get back to them. Which usually
     means they call again.                          ← the real cost
PM   Has the handbook search ever given you the right answer?
USER Honestly? I don't think I've ever scrolled past result three.

  Elapsed: 9 minutes. Learned:
    · search exists and is trusted so little it is not used
    · the actual system is ONE PERSON, and she takes leave
    · the cost is not agent time — it is repeat customer contacts
    · relevance matters more than coverage (nobody scrolls)

  None of that was in the roadmap. All of it came from
  asking about this morning instead of about next quarter.`
    },
    prereq: ['user-research'], next: ['problem-statements', 'jtbd'],
    related: ['personas', 'product-discovery', 'journey-mapping'],
    tools: [],
    useCases: [
      'Understanding a problem before designing for it.',
      'Finding the workaround people already built.',
      'Getting verbatim evidence to support a prioritisation decision.'
    ],
    avoid: [
      'Pitching the solution during the interview.',
      'Asking about hypothetical future behaviour.'
    ],
    mistakes: [
      'Describing your idea first, which turns the interview into a politeness test.',
      'Asking "would you" instead of "when did you last".',
      'Filling silences, and losing the more honest second answer.',
      'Paraphrasing findings and discarding the verbatim quotes that made them persuasive.'
    ],
    keyTerms: [
      ['leading question', 'One that suggests its own answer.'],
      ['past-tense questioning', 'Asking about what actually happened.'],
      ['workaround', 'What people built because the product failed them. High signal.'],
      ['verbatim', 'The user’s exact words, preserved.'],
      ['segment', 'A coherent group of users; change this before increasing sample size.'],
      ['politeness bias', 'People agreeing with a pitch to be agreeable.']
    ],
    resources: [
      ['The Mom Test — summary', 'https://www.momtestbook.com/', 'reference'],
      ['Product Talk — interviewing', 'https://www.producttalk.org/continuous-discovery-habits/', 'article'],
      ['Nielsen Norman Group — interviewing users', 'https://www.nngroup.com/articles/interviewing-users/', 'article']
    ],
    questions: [
      ['Why ask about the past rather than the future?', 'Past behaviour is fact and future behaviour is speculation. "Tell me about the last time" produces specific, checkable detail; "would you" produces agreeable noise.'],
      ['What is the danger of pitching your idea in an interview?', 'It converts the interview into a politeness test. Once the user knows what you want to hear, every subsequent answer is contaminated by the desire to be agreeable.'],
      ['How many interviews are useful?', 'Five to eight within a coherent segment surfaces most significant patterns. Beyond that, returns diminish until you change segment rather than increase sample size.']
    ]
  },

  {
    id: 'problem-statements',
    title: 'Problem Statements',
    domain: 'product', tier: 2, priority: 'high',
    summary: 'Writing down the problem in a form that does not smuggle in the solution.',
    what: `A problem statement describes who has a problem, in what situation, what it costs them, and how you would know it was solved — without naming a solution.`,
    why: `Most feature requests are solutions in disguise. Converting them back into problems is what makes it possible to find a better solution, to prioritise honestly, and to know afterwards whether you succeeded.`,
    analogy: `"I need a ladder" versus "I cannot reach the shelf". The first forecloses every option; the second admits a step stool, a lower shelf, or moving the item.`,
    technical: `A usable statement has four parts:
- **Who** — a specific segment, not "users".
- **When** — the triggering situation. Problems occur in contexts, not in general.
- **What it costs** — time, money, errors, escalations, abandonment. Quantified where possible.
- **How we would know** — the observable change that would mean it is solved.

The last part does most of the work. A problem you cannot state a success signal for is a problem you cannot tell whether you solved, which means it will be declared solved by whoever shipped something.

**Test for a smuggled solution**: if the statement contains a noun that is a feature ("search", "dashboard", "assistant"), rewrite it. "Agents cannot find policy answers" is a problem. "Agents need a better search" is a solution wearing a problem's clothes.

For AI features, add a fifth part: **what a wrong answer costs**. That number determines whether the feature can be autonomous or must keep a human in the loop, and it is far easier to agree on before building than after.`,
    diagram: `
   FOUR PARTS — and a fifth for AI

     WHO       a specific segment, not "users"
     WHEN      the triggering situation
     COST      time · money · errors · escalations, quantified
     SIGNAL    the observable change that means it is solved

     + for AI:
     WRONG     what a wrong answer costs
               ← determines autonomous vs human-in-the-loop

   ⚠ TEST FOR A SMUGGLED SOLUTION

     does the statement contain a FEATURE NOUN?
       search · dashboard · assistant · notification · report

     "agents need a better search"       ← solution in disguise
     "agents cannot find policy answers
      and ask a colleague instead"       ← problem

   THE SIGNAL DOES MOST OF THE WORK

     no success signal
       → you cannot tell whether you solved it
       → it will be declared solved by whoever shipped something

   BEFORE / AFTER

     ✗  "Users want AI summaries."

     ✓  "Support agents (WHO), handling threads escalated twice
         (WHEN), spend 47 seconds skimming 14 messages and still
         miss commitments made earlier, causing ~30 repeat
         contacts/week (COST). Solved when repeat contacts from
         escalated threads fall below 10/week (SIGNAL). A wrongly
         reported commitment causes a complaint, so extracted
         commitments must link to their source message (WRONG)."`,
    example: {
      language: 'text',
      caption: 'Converting three requests back into problems',
      code: `REQUEST   "Add a dashboard for the ops team."
PROBLEM   Ops leads (WHO) reviewing overnight failures each morning
          (WHEN) reconstruct what happened by joining three log
          exports in a spreadsheet, taking ~40 min/day and
          delaying incident response (COST). Solved when time from
          failure to acknowledgement drops below 15 min (SIGNAL).
NOTE      A dashboard is one option. So is an alert that already
          contains the joined context — which is cheaper and
          arrives without anyone opening anything.

REQUEST   "We need AI-powered search."
PROBLEM   Agents (WHO) answering policy questions mid-call (WHEN)
          do not trust handbook search and ask a colleague on
          Slack instead, taking 6-7 min while the customer waits
          and generating repeat contacts (COST). Solved when
          ≥60% of policy questions are resolved without leaving
          the console (SIGNAL). A confidently wrong policy answer
          risks an incorrect refund commitment, so answers must
          cite the clause and abstain when unsupported (WRONG).

REQUEST   "Customers are asking for an API."
PROBLEM   Not yet a problem statement — WHICH customers, doing
          WHAT, at what cost? Three enterprise accounts wanting
          nightly export is a different problem from forty
          self-serve accounts wanting webhooks, and they have
          different solutions.
          → go back and ask about the last time they needed it.

⚠ THE PATTERN
  Every request above was a real signal. None of them was a
  problem statement. The conversion is 20 minutes of work and
  it is what makes the next three months honest.`
    },
    prereq: ['customer-interviews'], next: ['opportunity-sizing', 'prioritization'],
    related: ['jtbd', 'product-discovery', 'acceptance-criteria', 'north-star-metric'],
    tools: [],
    useCases: [
      'Converting a stakeholder request into something you can evaluate.',
      'Aligning a team on what success means before building.',
      'Enabling a solution better than the one that was requested.'
    ],
    avoid: [
      'Statements containing feature nouns.',
      'Statements with no observable success signal.'
    ],
    mistakes: [
      'Accepting a requested solution as the problem.',
      'Writing "users" instead of a specific segment.',
      'Omitting the success signal, so success becomes whatever shipped.',
      'For AI features, not agreeing on the cost of a wrong answer before building.'
    ],
    keyTerms: [
      ['problem statement', 'Who, when, what it costs, how we would know.'],
      ['smuggled solution', 'A solution phrased as a problem.'],
      ['success signal', 'The observable change that means it is solved.'],
      ['segment', 'A specific group, not "users".'],
      ['trigger', 'The situation in which the problem occurs.'],
      ['cost of a wrong answer', 'The AI-specific fifth part.']
    ],
    resources: [
      ['Marty Cagan — product discovery', 'https://www.svpg.com/product-discovery/', 'article'],
      ['Amazon — working backwards', 'https://www.aboutamazon.com/news/workplace/an-insider-look-at-amazons-culture-and-processes', 'article'],
      ['Nielsen Norman Group — problem statements', 'https://www.nngroup.com/articles/problem-statements/', 'article']
    ],
    questions: [
      ['How do you detect a solution smuggled into a problem statement?', 'Look for feature nouns — search, dashboard, assistant. If one appears, the statement has already chosen an answer and closed off cheaper alternatives.'],
      ['Why is the success signal the most important part?', 'Without it you cannot tell whether the problem was solved, so it will be declared solved by whoever shipped something. The signal is what makes the outcome checkable.'],
      ['What extra part does an AI problem statement need?', 'What a wrong answer costs. That determines whether the feature can act autonomously or must keep a human in the loop, and it is far easier to agree before building than after.']
    ]
  },

  {
    id: 'jtbd',
    title: 'Jobs To Be Done',
    domain: 'product', tier: 2, priority: 'medium',
    summary: 'People hire a product to make progress in a situation — not because of who they are.',
    what: `Jobs To Be Done frames a purchase or usage decision as hiring something to make progress in a specific circumstance. The unit of analysis is the situation, not the person.`,
    why: `It explains competition that demographics cannot. Your competitor is whatever the customer would otherwise hire — which is frequently a spreadsheet, a colleague, or doing nothing at all.`,
    analogy: `The milkshake study: people bought milkshakes at 7am not because they were "milkshake customers" but because they had a long dull commute and needed something that lasted and could be handled one-handed. The competitor was a banana, not another milkshake.`,
    technical: `The structure: **when [situation], I want to [motivation], so I can [expected outcome]**.

What it gives you that personas do not:
- **Situational competition.** The alternatives are whatever else could be hired in that circumstance, which is usually not another product in your category.
- **The forces of progress.** Push (dissatisfaction with the current approach), pull (the appeal of the new), habit (inertia), and anxiety (fear of the new). A feature that increases pull but does nothing about anxiety often does not change behaviour at all.
- **Stable targets.** Jobs change far more slowly than technologies or demographics.

**For AI features, anxiety is usually the binding force.** The pull is obvious and the push is real, and adoption still fails because people do not trust the output. Reducing anxiety — citations, visible reasoning, easy verification, reversibility — is usually higher leverage than increasing capability.

The failure mode is writing jobs so abstract they stop being useful. "When I want to be productive" is not a job. The situation has to be specific enough to observe.`,
    diagram: `
   THE STRUCTURE

     WHEN [situation]
       I want to [motivation]
         so I can [expected outcome]

   ⚠ THE COMPETITOR IS WHATEVER ELSE COULD BE HIRED

     "when a customer asks about an edge-case policy mid-call"

       competitors:  asking Priya on Slack
                     guessing
                     saying "I'll get back to you"
                     the handbook PDF

       NOT: another AI assistant

   THE FOUR FORCES OF PROGRESS

     toward the new              away from the new
     ────────────────           ──────────────────
     PUSH                        HABIT
       the current way hurts       the current way is known

     PULL                        ANXIETY
       the new way appeals         what if it is wrong?

     behaviour changes only when PUSH + PULL > HABIT + ANXIETY

   ⚠ FOR AI, ANXIETY IS USUALLY THE BINDING FORCE

     push is real · pull is obvious · and adoption still fails

     raising capability     → increases PULL     (already high)
     citations, visible
     reasoning, easy undo   → reduces ANXIETY    ← the actual lever

   THE FAILURE MODE

     "when I want to be productive"   ← too abstract to observe
     the situation must be specific enough to WATCH someone in`,
    example: {
      language: 'text',
      caption: 'Jobs for the same product, and what each implies',
      code: `PRODUCT  an internal policy assistant

JOB 1
  When a customer asks an edge-case policy question mid-call,
  I want to get a defensible answer in under 30 seconds,
  so I can resolve the call without a callback.

  Competing with   asking Priya · guessing · "I'll get back to you"
  Forces           PUSH high (customer waiting)
                   PULL high
                   ANXIETY high  ← "if I quote it wrong, that's a complaint"
  Implies          citation + abstention, not conversational depth
                   speed matters more than completeness

JOB 2
  When I am onboarding in my first month,
  I want to understand why a policy exists,
  so I can handle situations the handbook does not cover.

  Competing with   shadowing a colleague · asking in #new-joiners
  Forces           PUSH medium · PULL high · ANXIETY LOW
                   (nobody is on the line; a wrong answer is cheap)
  Implies          explanation and context ARE the value here
                   longer answers are fine

⚠ SAME PRODUCT. OPPOSITE DESIGNS.
    Job 1 wants terse, cited, willing to say "not covered".
    Job 2 wants discursive and explanatory.

    A persona ("support agent, 26-40, comfortable with tech")
    describes both people identically and tells you nothing.
    The SITUATION is what separates them.

BUILD DECISION
  Ship for Job 1 first — the anxiety is highest, the cost of the
  status quo is measurable (repeat contacts), and it is the
  situation that occurs 40x/day rather than 40 times ever.`
    },
    prereq: ['customer-interviews'], next: ['personas'],
    related: ['problem-statements', 'user-research', 'journey-mapping', 'ai-ux'],
    tools: [],
    useCases: [
      'Identifying real competition, including non-consumption.',
      'Explaining why an obviously better feature was not adopted.',
      'Separating two audiences that look identical demographically.'
    ],
    avoid: [
      'Jobs written so abstractly they cannot be observed.',
      'Using it as a synonym for a feature request.'
    ],
    mistakes: [
      'Writing the job as a demographic rather than a situation.',
      'Ignoring anxiety, which is usually the binding force for AI adoption.',
      'Assuming competition is within your product category.',
      'Producing a job statement so general it applies to everything and guides nothing.'
    ],
    keyTerms: [
      ['job', 'Progress someone is trying to make in a situation.'],
      ['hiring / firing', 'Choosing or abandoning a solution for a job.'],
      ['push', 'Dissatisfaction with the current approach.'],
      ['pull', 'Appeal of the new approach.'],
      ['habit', 'Inertia favouring the current approach.'],
      ['anxiety', 'Fear about the new approach. Usually binding for AI.'],
      ['non-consumption', 'Doing nothing — often the real competitor.']
    ],
    resources: [
      ['Christensen — Know your customers’ jobs to be done', 'https://hbr.org/2016/09/know-your-customers-jobs-to-be-done', 'article'],
      ['Jobs to be Done — overview', 'https://hbr.org/2016/09/know-your-customers-jobs-to-be-done', 'reference'],
      ['Google — People + AI Guidebook', 'https://pair.withgoogle.com/guidebook/', 'reference']
    ],
    questions: [
      ['What is the unit of analysis in Jobs To Be Done?', 'The situation, not the person. Two people with identical demographics can be in different situations wanting opposite things, and the situation is what predicts behaviour.'],
      ['Why is anxiety the key force for AI features?', 'Push and pull are typically already high — the current way hurts and the new way is appealing — yet adoption fails because people do not trust the output. Citations, visible reasoning and easy verification move the force that is actually binding.'],
      ['How does JTBD change who your competitor is?', 'The competitor is whatever else could be hired in that situation: a spreadsheet, a colleague, or doing nothing. That is usually outside your product category entirely.']
    ]
  }
];
