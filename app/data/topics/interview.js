/**
 * DOMAIN Y — INTERVIEW / COMMUNICATION LAYER (BUILD.md section 28)
 *
 * The per-topic `interview:` layer carries the 30s / 90s / technical / PM
 * framings for individual concepts. These four topics are the method behind
 * them: how to build an explanation that does not sound memorised.
 */
export const topics = [
  {
    id: 'explaining-technical-concepts',
    title: 'Explaining Technical Concepts',
    domain: 'interview', tier: 1, priority: 'high',
    summary: 'Four depths of the same explanation, and choosing the right one for who is asking.',
    what: `A good technical explanation exists at several depths: a one-sentence version, a thirty-second version, a ninety-second version with a concrete example, and a full technical account. Which you use depends on who asked and why.`,
    why: `The most common failure is depth mismatch — giving an engineer the executive summary or an executive the architecture. Both leave the listener thinking you do not understand the thing you were explaining.`,
    analogy: `A map at different scales. The country map and the street map are both correct; handing someone the wrong one is unhelpful in a way that has nothing to do with accuracy.`,
    technical: `The four depths:

**One sentence** — what it is, in plain words, with no jargon. "RAG means looking things up before answering."

**Thirty seconds** — what it is, what problem it solves, when you would use it. This is the default in most conversations.

**Ninety seconds** — the above plus a concrete example from real work, and the main trade-off or failure mode. This is the interview answer.

**Technical** — mechanism, alternatives considered, where it breaks. For people who will build it.

**Build from the problem, not the mechanism.** "Models do not know your internal documents, so you retrieve the relevant ones and put them in the prompt" is understood immediately. "RAG is a retrieval-augmented generation architecture" requires the listener to already know.

**One analogy, then drop it.** Analogies orient and then mislead if extended. Use it to establish the shape, then talk about the actual thing.

**Name the trade-off.** Explaining only the upside signals you have read about something rather than used it. The trade-off is the part that demonstrates experience, and it is what an interviewer is actually listening for.

**Check the depth.** "How deep do you want me to go?" is a normal, competent question, and it prevents the most common failure entirely.`,
    diagram: `
   FOUR DEPTHS

     ONE SENTENCE   what it is, plain words, no jargon
                    "RAG means looking things up before
                     answering"

     30 SECONDS     + what problem it solves
                    + when you would use it
                    ← the default in most conversations

     90 SECONDS     + a concrete example from real work
                    + the main trade-off or failure mode
                    ← the interview answer

     TECHNICAL      mechanism · alternatives · where it breaks
                    ← for people who will build it

   ⚠ THE COMMON FAILURE IS DEPTH MISMATCH

     engineer gets the executive summary
     executive gets the architecture

     both conclude you do not understand it

   BUILD FROM THE PROBLEM, NOT THE MECHANISM

     ✓ "models do not know your internal documents,
        so you retrieve the relevant ones and put them
        in the prompt"
     ✗ "RAG is a retrieval-augmented generation architecture"
                    └─ requires the listener to already know

   ONE ANALOGY, THEN DROP IT

     analogies orient, then mislead if extended

   ⚠ NAME THE TRADE-OFF

     explaining only the upside signals you have READ about
     something rather than USED it

     the trade-off is what an interviewer is listening for

   "How deep do you want me to go?"
     a normal, competent question — and it prevents the
     most common failure entirely`,
    example: {
      language: 'text',
      caption: 'One concept, four depths',
      code: `CONCEPT  Retrieval-Augmented Generation

ONE SENTENCE
  "It means looking things up before answering, instead of
   answering from memory."

30 SECONDS
  "A language model only knows what was in its training data,
   so it cannot answer questions about your internal
   documents. RAG retrieves the relevant passages first and
   puts them in the prompt, so the model answers from your
   material rather than from memory. It is what you reach for
   when the problem is that the model does not KNOW something,
   as opposed to not behaving the way you want."

90 SECONDS  ← the interview answer
  "...[the above]... The example I worked on was a policy
   assistant for support agents. They were asking colleagues
   on Slack because handbook search returned forty unranked
   results and nobody scrolled past the third. We chunked the
   policy documents, embedded them, retrieved the top passages
   for each question and answered from those with a citation.

   The trade-off that mattered was coverage against accuracy.
   Retrieval sometimes returns nothing good, and the model
   will happily answer anyway — fluently and wrongly. So we
   made it abstain below a relevance threshold. That took us
   from answering 86% of questions with 4% confidently wrong,
   to answering 71% with 1.1% wrong. Fewer answers, and it
   was the version agents actually adopted, because two
   confident errors is roughly where people stop trusting it."

TECHNICAL
  "Ingestion parses documents and splits them on clause
   boundaries with overlap. Chunks are embedded and stored
   with metadata for filtering. At query time we retrieve
   fifteen by cosine similarity, rerank down to five — which
   both improved groundedness and cut input tokens, so cost
   and time-to-first-token fell together — assemble the
   context with source markers, and generate with a prompt
   that requires citation.

   The failure modes are retrieval failure and context
   dilution: past about eight chunks, groundedness actually
   falls because the relevant passage is diluted. We measured
   that rather than assuming it. The alternative we considered
   was fine-tuning, which does not fit — the problem was
   missing knowledge, not wrong behaviour, and a fine-tune
   cannot cite its sources."

⚠ THE SAME UNDERSTANDING, FOUR TIMES.
  Note that the 90-second version's value is entirely in the
  trade-off and the number. Without those it is the
  30-second version padded out.`
    },
    prereq: [], next: ['structuring-an-answer'],
    related: ['structuring-an-answer', 'answering-tradeoff-questions', 'why-rag', 'rag-failure-modes'],
    tools: [],
    useCases: [
      'Answering "explain RAG to me" without sounding rehearsed.',
      'Adjusting depth to an audience mid-conversation.',
      'Demonstrating experience rather than reading.'
    ],
    avoid: [
      'Leading with the acronym or the mechanism.',
      'Extending an analogy past its usefulness.'
    ],
    mistakes: [
      'Giving the wrong depth for the audience, which reads as not understanding.',
      'Explaining only the upside, which signals reading rather than doing.',
      'Defining the term with the term ("RAG is retrieval-augmented generation").',
      'Padding a thirty-second answer instead of adding a real example and trade-off.'
    ],
    keyTerms: [
      ['depth matching', 'Choosing the right level for who asked.'],
      ['problem-first framing', 'Starting from what goes wrong without it.'],
      ['the trade-off', 'What you gave up. The mark of experience.'],
      ['analogy discipline', 'Use one to orient, then drop it.'],
      ['concrete example', 'A specific instance from real work.'],
      ['depth check', 'Asking how deep the listener wants to go.']
    ],
    resources: [
      ['Anthropic — building effective agents', 'https://www.anthropic.com/engineering/building-effective-agents', 'article'],
      ['Google — People + AI Guidebook', 'https://pair.withgoogle.com/guidebook/', 'reference'],
      ['Nielsen Norman Group — plain language', 'https://www.nngroup.com/articles/plain-language-experts/', 'article']
    ],
    questions: [
      ['What is the most common failure when explaining a technical concept?', 'Depth mismatch — an engineer given the executive summary, or an executive given the architecture. Both conclude the speaker does not understand it.'],
      ['What separates a ninety-second answer from a padded thirty-second one?', 'A concrete example from real work and a named trade-off with a number attached. Without those, the longer version adds words rather than substance.'],
      ['Why start from the problem rather than the mechanism?', 'The problem is understood immediately by anyone; the mechanism requires the listener to already know the vocabulary, which defeats the purpose of explaining.']
    ]
  },

  {
    id: 'structuring-an-answer',
    title: 'Structuring an Answer',
    domain: 'interview', tier: 2, priority: 'high',
    summary: 'A shape that keeps you coherent under pressure without sounding scripted.',
    what: `A structured answer has a recognisable shape — situation, what you did, why, what happened, what you would change — delivered conversationally rather than announced.`,
    why: `Under pressure, unstructured answers wander and the listener loses the thread. A structure prevents that. Announcing the structure, however, is what makes an answer sound rehearsed.`,
    analogy: `A route you know well. You do not narrate the turns; you just arrive without getting lost.`,
    technical: `The shape that works for experience questions:
1. **Context** — one or two sentences. Enough to make the rest make sense, and no more.
2. **The problem** — specifically, with a number if you have one.
3. **What you did** — decisions, not activities. "We chose X over Y because Z" rather than "we had meetings and then built it".
4. **What happened** — the outcome, measured.
5. **What you learned or would change** — the part that separates reflection from recital.

**Lead with the answer, then support it.** Interviewers are listening for whether you can get to the point. Ten sentences of context before the answer reads as avoidance.

**Numbers make an answer real.** "We reduced repeat contacts from thirty a week to nineteen" is specific enough to be true. "We significantly improved things" is not.

**Say "we" for team work and "I" for your decisions**, and be accurate about which is which. Overclaiming is transparent, and so is hiding behind "we" for a decision you clearly made alone.

**For design and case questions the shape differs:** clarify the goal, name the constraints, state your assumptions out loud, propose an approach, then name what would make you wrong. The last step is the one candidates skip and the one interviewers weight most.

**Never announce the structure.** "I'll use the STAR method" and "there are three things I want to cover" both signal recitation. Just do it.`,
    diagram: `
   THE SHAPE — for experience questions

     1  CONTEXT      one or two sentences. No more.
     2  THE PROBLEM  specifically, with a number
     3  WHAT YOU DID DECISIONS, not activities
                     ✓ "we chose X over Y because Z"
                     ✗ "we had meetings and then built it"
     4  WHAT HAPPENED the outcome, measured
     5  WHAT YOU'D    ← separates reflection from recital
        CHANGE

   ⚠ LEAD WITH THE ANSWER, THEN SUPPORT IT

     ten sentences of context before the answer
     reads as avoidance

   NUMBERS MAKE AN ANSWER REAL

     ✓ "repeat contacts fell from 30/week to 19"
     ✗ "we significantly improved things"

   "WE" AND "I"

     we  → team work
     I   → your decisions
     be ACCURATE. overclaiming is transparent, and so is
     hiding behind "we" for a decision you made alone

   FOR DESIGN / CASE QUESTIONS

     clarify the goal
     name the constraints
     state assumptions OUT LOUD
     propose an approach
     ⚠ name what would make you WRONG
         ← the step candidates skip and interviewers
           weight most

   ⚠ NEVER ANNOUNCE THE STRUCTURE

     "I'll use the STAR method"
     "there are three things I want to cover"

     both signal recitation. Just do it.`,
    example: {
      language: 'text',
      caption: 'The same experience, unstructured and structured',
      code: `QUESTION  "Tell me about a time you made a difficult product
           decision."

❌ UNSTRUCTURED
  "So we were building this AI assistant, and there was a lot
   of debate on the team, and the support folks had opinions,
   and engineering wanted to ship, and I was talking to a lot
   of stakeholders, and eventually we landed on something that
   worked out pretty well, I think. It was a good learning
   experience for everyone."

  No problem stated. No decision named. No outcome. The
  listener has nothing to evaluate.

✓ STRUCTURED — and not announced
  "The decision was whether to let our policy assistant answer
   every question or let it decline some.        ← ANSWER FIRST

   Context: support agents were using it mid-call to answer
   customer policy questions.                    ← MINIMAL

   The problem was that at our accuracy, it was confidently
   wrong about four percent of the time, and five of the
   eleven agents we interviewed said two wrong answers would
   make them stop using it entirely. At forty questions a day,
   every agent would hit two within a week.      ← SPECIFIC

   I pushed for abstention below a relevance threshold, over
   objections that it would make the product look weak in
   demos. The reasoning was asymmetric cost: a 'not covered'
   costs six minutes because they ask a colleague, which is
   just the status quo, whereas a wrong policy answer can mean
   an incorrect refund commitment and a complaint.
                                                 ← DECISION + WHY

   We shipped answering 71% instead of 86%, with confidently
   wrong dropping from 4.1% to 1.1%. Adoption started lower —
   44% in week one, and someone proposed lowering the
   threshold — but reached 79% by week nine, and repeat
   customer contacts fell from about thirty a week to
   nineteen.                                     ← MEASURED

   What I would do differently: I would set the threshold
   with production data rather than the golden set. Real
   traffic had three times more regional-variant questions
   than our evaluation set did, so we were tuned for the
   wrong distribution for the first month."      ← REFLECTION

⚠ Roughly 200 words. Every sentence carries something the
  interviewer can evaluate, and the last paragraph is the
  one that makes the rest credible.`
    },
    prereq: ['explaining-technical-concepts'], next: ['answering-tradeoff-questions'],
    related: ['explaining-technical-concepts', 'answering-tradeoff-questions', 'handling-what-you-dont-know'],
    tools: [],
    useCases: [
      'Answering experience questions coherently under pressure.',
      'Working through a product design question.',
      'Making a decision you made sound like a decision.'
    ],
    avoid: [
      'Announcing the structure you are about to use.',
      'Long context before the answer.'
    ],
    mistakes: [
      'Describing activities rather than decisions.',
      'Omitting numbers, which makes an answer unverifiable and vague.',
      'Using "we" for a decision you clearly made, or "I" for team work.',
      'Skipping what you would change, which is what makes the rest credible.'
    ],
    keyTerms: [
      ['answer-first', 'Stating the conclusion before the supporting detail.'],
      ['decision vs activity', 'What you chose, not what you did.'],
      ['measured outcome', 'A number that makes the result checkable.'],
      ['reflection', 'What you would change; separates recital from thought.'],
      ['assumption statement', 'Saying out loud what you are assuming.'],
      ['falsification', 'Naming what would make you wrong.']
    ],
    resources: [
      ['Lenny’s Newsletter — product interview prep', 'https://www.svpg.com/product-manager-interview/', 'article'],
      ['Marty Cagan — product discovery', 'https://www.svpg.com/product-discovery/', 'article'],
      ['Nielsen Norman Group — interviewing users', 'https://www.nngroup.com/articles/interviewing-users/', 'article']
    ],
    questions: [
      ['Why should you lead with the answer?', 'Interviewers are listening for whether you can get to the point. Extended context before the answer reads as avoidance, however relevant the context is.'],
      ['What distinguishes describing a decision from describing activities?', 'A decision names the alternative and the reason — "we chose X over Y because Z". Activities are meetings and building, which anyone in the room could have described.'],
      ['What is the step candidates most often skip in design questions?', 'Naming what would make them wrong. Stating the assumption that, if false, breaks the approach is what interviewers weight most heavily.']
    ]
  },

  {
    id: 'answering-tradeoff-questions',
    title: 'Answering Trade-off Questions',
    domain: 'interview', tier: 2, priority: 'high',
    summary: 'Questions with no right answer, where the reasoning is the whole assessment.',
    what: `Trade-off questions — "would you use RAG or fine-tuning?", "how accurate does it need to be?" — have no single correct answer. They assess whether you understand what each choice costs.`,
    why: `They are the most common form of senior product interview question, and the most commonly answered badly — by picking a side confidently, which demonstrates exactly the wrong instinct.`,
    analogy: `Being asked whether a car should be fast or safe. Any confident single answer is worse than the question deserves.`,
    technical: `The shape of a good answer:
1. **Name the dimension being traded.** "That is really a question about how much accuracy we are willing to buy with coverage."
2. **State what determines the answer** — the conditions under which each side wins.
3. **Commit to a position** given a stated situation. Refusing to answer is as bad as answering too quickly.
4. **Name what would change your mind.**

**"It depends" is the correct instinct and a terrible answer on its own.** It becomes a good answer the moment you say what it depends *on*, and better still when you then pick one and defend it under a stated assumption.

**Ask a clarifying question if one genuinely changes the answer** — and only then. Asking three questions to avoid committing is visible.

**The strongest move is quantifying the trade.** "At four percent confident errors, agents abandon it within a week; at one percent they do not — so I would buy accuracy with coverage" is a different class of answer from "it depends on the use case".

**For AI questions specifically, the recurring trades are:** accuracy against coverage, autonomy against trust, capability against cost and latency, and personalisation against data minimisation. Recognising which one a question is really about is most of the work.

**Do not pretend the trade does not exist.** "We can have both with good engineering" is the answer of someone who has not had to choose.`,
    diagram: `
   THE SHAPE OF A GOOD ANSWER

     1  NAME THE DIMENSION being traded
        "that is really about how much accuracy we are
         willing to buy with coverage"

     2  STATE WHAT DETERMINES IT
        the conditions under which each side wins

     3  COMMIT to a position, given a stated situation
        ⚠ refusing to answer is as bad as answering
          too quickly

     4  NAME WHAT WOULD CHANGE YOUR MIND

   ⚠ "IT DEPENDS" — right instinct, terrible answer alone

     it becomes good the moment you say what it depends ON
     and better when you then PICK ONE and defend it

   CLARIFYING QUESTIONS

     ask one if it genuinely changes the answer
     ⚠ asking three to avoid committing is visible

   ⚠ THE STRONGEST MOVE IS QUANTIFYING THE TRADE

     "at 4% confident errors agents abandon within a week;
      at 1% they do not — so I would buy accuracy with
      coverage"

     a different CLASS of answer from
     "it depends on the use case"

   THE RECURRING AI TRADES

     accuracy       ⟷  coverage
     autonomy       ⟷  trust
     capability     ⟷  cost and latency
     personalisation ⟷ data minimisation

     recognising WHICH ONE a question is about
     is most of the work

   ⚠ "We can have both with good engineering"

     the answer of someone who has not had to choose`,
    example: {
      language: 'text',
      caption: 'One question, three answers',
      code: `QUESTION  "Should an AI assistant answer every question, or
           be allowed to say it does not know?"

❌ TOO CONFIDENT
  "It should always try to answer. Users find it frustrating
   when a product says it cannot help."
  → picked a side, no reasoning, no awareness of the cost.

❌ TOO EVASIVE
  "It really depends on the use case, the users, the domain,
   the risk profile, and what the business is trying to
   achieve. There are arguments on both sides."
  → correct instinct, zero content. Also visibly avoiding
    the commitment the question asked for.

✓ THE ANSWER
  "That is the accuracy-versus-coverage trade, and which side
   wins depends on two things: what a wrong answer costs
   relative to no answer, and whether the user can tell the
   difference.                                    ← DIMENSION

   If a wrong answer is cheap and obvious — a draft the user
   edits, a suggested tag — answer everything. The user
   catches errors for free and abstention just adds friction.

   If a wrong answer is expensive and the user cannot verify
   it, abstain.                                   ← CONDITIONS

   In the case I worked on, support agents were answering
   customer policy questions mid-call. They could not verify
   an edge-case answer, and a wrong one could mean an
   incorrect refund commitment. Five of eleven agents told us
   two confident errors would make them abandon it. At 86%
   coverage we were confidently wrong 4.1% of the time —
   forty questions a day means every agent hits two within a
   week. At 71% coverage it was 1.1%.

   So I would abstain, and I did.                 ← COMMITTED

   What would change my mind: if abstention had no good
   fallback path. A dead end at thirty percent frequency is
   worse than a wrong answer that gets caught, so the
   decision is only correct because we could hand off to a
   senior agent in one click.                     ← WHAT WOULD
                                                    MAKE ME WRONG

   The other thing I would revisit is the threshold itself.
   We set it on our golden set, and production traffic had
   three times more regional questions, so the real
   abstention rate was 41% rather than 29% — high enough
   that it was starting to hurt adoption."

⚠ The answer commits, quantifies, and names its own weak
  point. Each of those is a separate signal, and the last
  one is the rarest.`
    },
    prereq: ['structuring-an-answer'], next: ['handling-what-you-dont-know'],
    related: ['product-tradeoffs', 'strategic-tradeoffs', 'ai-trust', 'structuring-an-answer'],
    tools: [],
    useCases: [
      'Answering "would you use X or Y?" questions well.',
      'Demonstrating that you have actually had to choose.',
      'Committing to a position without overclaiming.'
    ],
    avoid: [
      '"It depends" with no follow-through.',
      'Claiming the trade-off can be engineered away.'
    ],
    mistakes: [
      'Picking a side confidently, which shows no awareness of the cost.',
      'Listing dependencies to avoid committing to an answer.',
      'Failing to quantify the trade when you have the numbers.',
      'Not naming what would change your mind, which is the rarest signal.'
    ],
    keyTerms: [
      ['trade-off question', 'One with no single right answer.'],
      ['the dimension', 'What is actually being traded against what.'],
      ['conditions', 'When each side of the trade wins.'],
      ['commitment', 'Picking a position under a stated assumption.'],
      ['falsification', 'What would change your mind.'],
      ['quantified trade', 'The numbers that make the choice concrete.']
    ],
    resources: [
      ['Porter — what is strategy', 'https://hbr.org/1996/11/what-is-strategy', 'article'],
      ['Google — People + AI Guidebook', 'https://pair.withgoogle.com/guidebook/', 'reference'],
      ['Lenny’s Newsletter — product interview prep', 'https://www.svpg.com/product-manager-interview/', 'article']
    ],
    questions: [
      ['Why is "it depends" both right and insufficient?', 'It is the correct instinct and carries no information alone. It becomes a good answer once you say what it depends on, and a strong one once you commit to a side under a stated assumption.'],
      ['What makes a trade-off answer a different class?', 'Quantifying it. "At four percent confident errors agents abandon within a week, at one percent they do not" is verifiable reasoning; "it depends on the use case" is not.'],
      ['What is the rarest signal in a trade-off answer?', 'Naming what would change your mind. Committing to a position and then stating the condition under which it would be wrong shows the reasoning is real rather than rehearsed.']
    ]
  },

  {
    id: 'handling-what-you-dont-know',
    title: 'Handling What You Do Not Know',
    domain: 'interview', tier: 2, priority: 'medium',
    summary: 'The response that distinguishes people who have done the work from people who have read about it.',
    what: `Every technical conversation reaches a question you cannot answer. How you handle that moment carries more signal than the answers you did have.`,
    why: `Bluffing is detected almost immediately by anyone who knows the subject, and it retroactively devalues everything you said before it. Saying you do not know, well, does the opposite.`,
    analogy: `A doctor saying "I would need to check that". It increases confidence rather than reducing it, because it means the other answers were not guesses.`,
    technical: `**The pattern that works:** say what you do know, say clearly where your knowledge stops, and say how you would find out.

"I have not worked with that specific technique. I know it sits in the same category as X, which I have used — the difference I understand is Y, but I would want to test that before relying on it."

**This is exactly the abstention behaviour you would design into a system**, and the parallel is worth noticing. A person who signals uncertainty accurately is more useful than one who is confidently wrong sometimes, for precisely the reason a calibrated model is.

**Distinguish the kinds of not-knowing:**
- Never encountered it — say so plainly and ask what it is. Curiosity is not a weakness.
- Know of it, have not used it — say exactly that. The distinction is respected.
- Knew it, do not recall the detail — say which part you would look up.
- Genuinely uncertain whether your understanding is right — flag it as you say it.

**Do not over-apologise.** One sentence, then move on. Extended hedging is its own credibility problem.

**Do not fill the space with adjacent knowledge you do have.** Answering a question you were not asked is a recognisable avoidance pattern.

**If you realise mid-answer that you are wrong, say so.** "Actually, I do not think that is right — what I said about X applies to Y, not here." That is a strong signal, not a weak one.`,
    diagram: `
   THE PATTERN THAT WORKS

     1  what you DO know
     2  where your knowledge STOPS — clearly
     3  how you would FIND OUT

     "I have not worked with that specific technique. I know
      it sits in the same category as X, which I have used —
      the difference I understand is Y, but I would want to
      test that before relying on it."

   ⚠ THIS IS ABSTENTION, AND THE PARALLEL IS THE POINT

     a person who signals uncertainty accurately is more
     useful than one who is confidently wrong sometimes

     for exactly the reason a calibrated model is

   KINDS OF NOT-KNOWING

     never encountered it       say so, and ask what it is
                                curiosity is not a weakness
     know of it, not used it    say exactly that — the
                                distinction is respected
     knew it, forget the detail say which part you would
                                look up
     unsure if you are right    flag it AS you say it

   ⚠ DO NOT OVER-APOLOGISE

     one sentence, then move on
     extended hedging is its own credibility problem

   ⚠ DO NOT FILL THE SPACE WITH ADJACENT KNOWLEDGE

     answering a question you were not asked is a
     recognisable avoidance pattern

   IF YOU REALISE MID-ANSWER THAT YOU ARE WRONG, SAY SO

     "actually, I don't think that's right — what I said
      about X applies to Y, not here"

     a strong signal, not a weak one`,
    example: {
      language: 'text',
      caption: 'Four ways to handle not knowing',
      code: `QUESTION  "How would you handle prompt injection in a
           multi-agent system where agents call each other?"

❌ BLUFFING
  "You'd want to sanitise the inputs and validate everything
   at each boundary, and have good monitoring in place, and
   follow security best practices for agent architectures."

  Generic enough to apply to anything. Anyone who works on
  this hears it immediately, and now wonders which of the
  previous answers were also constructed this way.

❌ OVER-APOLOGISING
  "Oh, I'm really not the right person to ask about that, I
   don't have deep security expertise, I've mostly worked on
   retrieval systems, sorry — I probably should know this..."

  Three sentences of retreat. The information content is the
  same as one sentence would have been.

❌ ANSWERING AN ADJACENT QUESTION
  "Well, what I can tell you is how we handled prompt
   injection in our RAG system, which was to treat all
   retrieved content as data rather than instructions..."

  Useful, and not what was asked. If done without
  acknowledging the substitution, it reads as evasion.

✓ THE ANSWER
  "I have not designed a multi-agent system, so I would be
   guessing about the agent-to-agent case specifically.

   What I do know transfers partly: in our single-agent RAG
   system we treated all retrieved content strictly as data,
   never as instructions, and we limited what the agent could
   actually do — it drafted, it never acted. The capability
   limit did more for us than any input filtering did.

   My instinct is that agent-to-agent makes it harder, because
   one agent's output becomes another's input, and that output
   already passed whatever checks the first agent had. So the
   trust boundary is not where it looks like it is. But that
   is reasoning by analogy, not experience — I would want to
   read what has been done on this before I designed anything.

   Is that a problem you have hit?"

⚠ WHAT THIS ANSWER DOES
  · states the limit precisely, once
  · transfers what genuinely transfers, and labels it
  · offers real reasoning while marking it as untested
  · ends with curiosity rather than retreat

  The middle paragraph is a better answer than the bluff was,
  and it is credible specifically because of the first line.`
    },
    prereq: ['answering-tradeoff-questions'], next: [],
    related: ['ai-trust', 'refusal-quality', 'structuring-an-answer', 'human-evaluation'],
    tools: [],
    useCases: [
      'Responding to a question outside your experience.',
      'Correcting yourself mid-answer.',
      'Keeping credibility intact across a long technical conversation.'
    ],
    avoid: [
      'Generic answers that would apply to any question.',
      'Extended apology.'
    ],
    mistakes: [
      'Bluffing, which is detected immediately and devalues everything said earlier.',
      'Answering an adjacent question without acknowledging the substitution.',
      'Over-hedging, which is its own credibility problem.',
      'Not correcting yourself when you realise mid-answer that you were wrong.'
    ],
    keyTerms: [
      ['calibration', 'Signalling uncertainty accurately.'],
      ['abstention', 'Declining rather than guessing. The same virtue as in a system.'],
      ['transfer', 'What adjacent experience genuinely carries over.'],
      ['labelled reasoning', 'Offering an inference while marking it as untested.'],
      ['self-correction', 'Retracting mid-answer. A strong signal.'],
      ['avoidance pattern', 'Answering the question you wish you had been asked.']
    ],
    resources: [
      ['Google — People + AI Guidebook', 'https://pair.withgoogle.com/guidebook/', 'reference'],
      ['OWASP — top 10 for LLM applications', 'https://owasp.org/www-project-top-10-for-large-language-model-applications/', 'reference'],
      ['Lenny’s Newsletter — product interview prep', 'https://www.svpg.com/product-manager-interview/', 'article']
    ],
    questions: [
      ['Why is bluffing so costly?', 'It is detected almost immediately by anyone who knows the subject, and it retroactively casts doubt on every answer that came before it.'],
      ['What is the pattern that works?', 'Say what you do know, say clearly where your knowledge stops, and say how you would find out — the same calibrated abstention you would design into a system.'],
      ['What should you do if you realise mid-answer that you were wrong?', 'Say so plainly and correct it. Retracting an answer in real time is a strong signal about how you reason, not a weak one.']
    ]
  }
];
