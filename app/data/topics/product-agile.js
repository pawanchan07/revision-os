/**
 * DOMAIN R — PRODUCT MANAGEMENT, part 5 of 6: running the work
 */
export const topics = [
  {
    id: 'backlog-management',
    title: 'Backlog Management',
    domain: 'product', tier: 3, priority: 'medium',
    summary: 'Keeping an ordered, honest list — and deleting most of it.',
    what: `The backlog is the ordered list of everything the team might do next. Managing it means keeping the top of it ready to work on, the rest roughly ordered, and the whole thing small enough that people read it.`,
    why: `A backlog that nobody reads is not a plan, it is a graveyard. Its practical purpose is to answer one question — what should we pick up next — and a list of six hundred items answers that question worse than a list of thirty.`,
    analogy: `A kitchen prep list, not an archive. What matters is that the next few things are ready to cook.`,
    technical: `**Refinement** is the ongoing work of making the top of the backlog ready: clarifying, slicing, estimating, and removing items that no longer make sense. It is continuous, not a ceremony.

The **depth of detail should decrease down the list.** The next two iterations of work should be sliced and have acceptance criteria; anything six months out should be a problem statement at most. Detailing far-future items is waste, because most of them will never be built.

**Deleting is the underrated skill.** An item that has been in the backlog for a year and never risen has been implicitly declined many times. Keeping it pretends a decision is still open. Delete it, and record the reason where the reason is discoverable — a declined list is more useful than a stale backlog.

**Bugs compete with features**, in the same list, ordered by the same criteria. A separate bug backlog means bugs are ordered by a different, usually worse, process.

For AI systems, add a distinct input: **confirmed error cases from production**. Every flagged wrong answer that gets confirmed should become both a regression case in the golden set and, where it reveals a pattern, a backlog item. That loop is what makes an AI product improve rather than just accumulate complaints.`,
    diagram: `
   DETAIL DECREASES DOWN THE LIST

     next 1-2 iterations   ████████  sliced, criteria, estimated
     next quarter          ████      shaped, roughly sized
     beyond                █         PROBLEM STATEMENTS only

     detailing far-future items is waste —
     most of them will never be built

   ⚠ DELETING IS THE UNDERRATED SKILL

     an item that has sat for a year and never risen
     has been implicitly DECLINED many times

     keeping it pretends a decision is still open
     → delete it, and record WHY somewhere discoverable

     a DECLINED LIST is more useful than a stale backlog

   BUGS COMPETE WITH FEATURES

     same list · same ordering criteria

     a separate bug backlog means bugs are ordered by a
     different — usually worse — process

   ⚠ THE AI-SPECIFIC INPUT

     production flag  →  confirmed?  →  regression case in golden set
                                    →  backlog item IF it is a pattern

     this loop is what makes an AI product IMPROVE
     rather than accumulate complaints

   THE TEST OF A BACKLOG

     can someone answer "what should I pick up next?"
     by reading it? if not, it is a graveyard.`,
    example: {
      language: 'text',
      caption: 'A backlog review that mostly deletes',
      code: `BEFORE  312 items. Oldest: 2 years, 4 months.
        Last time anyone read past item 40: unknown.

REVIEW PASS — one hour, four questions per item

  1  Has this risen in the last 6 months?
  2  Is the problem it addresses still real?
  3  Would we do it if it were free?
  4  If a customer asked today, would we say yes?

  DELETED  187 items
    · 61  duplicate or superseded
    · 44  reference systems that no longer exist
    · 52  never rose in 12+ months → implicitly declined
    · 30  "would we do it if free?" → no

  MOVED TO DECLINED LIST  38 items
    kept with a reason, discoverable by search, so the same
    request does not restart the same conversation:

      "Bulk CSV export"
       declined 2025-11 — three requests in two years, all from
       one account, who now uses the API. Revisit if it recurs
       from a second account.

  REMAINING  87 items, of which:
      12  ready (sliced, criteria, estimated)     ← next 2 sprints
      31  shaped (problem clear, not sliced)
      44  problem statements only

⚠ WHAT THE DELETION REVEALED
  Of the 52 items that never rose, 19 were variations of the
  same complaint: agents cannot find things. That was not
  visible as 19 separate low-priority tickets. It was very
  visible once they were grouped and everything else was gone.

  The cleanup produced a roadmap item, not just a shorter list.

── AI ERROR LOOP, running weekly ───────────────────────────
  flagged this week            23
  confirmed wrong              14   → all 14 added to golden set
  pattern found                 1   → "regional policy variants
                                       answered from the national
                                       policy" — 9 of the 14
                                    → backlog item, not 14 tickets

  ⚠ 14 individual bug reports would have been ordered as 14
    small annoyances. One pattern outranks most of the roadmap.`
    },
    prereq: ['prioritization'], next: ['sprint-planning'],
    related: ['prioritization', 'technical-debt', 'regression-testing', 'golden-sets'],
    tools: [],
    useCases: [
      'Keeping the next two iterations ready to work on.',
      'Turning production AI errors into regression cases and roadmap items.',
      'Making a backlog small enough that people actually read it.'
    ],
    avoid: [
      'Detailing items that are months away.',
      'A separate bug backlog ordered by a different process.'
    ],
    mistakes: [
      'Never deleting, so the backlog becomes an archive nobody reads.',
      'Detailing far-future items that will never be built.',
      'Losing the reason an item was declined, so the same debate restarts.',
      'Treating confirmed AI errors as individual bugs instead of looking for the pattern.'
    ],
    keyTerms: [
      ['refinement', 'Ongoing work making the top of the backlog ready.'],
      ['ready', 'Sliced, estimated, with acceptance criteria.'],
      ['declined list', 'Rejected items with reasons, kept discoverable.'],
      ['progressive detail', 'Less specification the further out an item is.'],
      ['regression case', 'A confirmed error added to the evaluation set.'],
      ['pattern', 'Several individual errors sharing one cause.']
    ],
    resources: [
      ['Scrum Guide', 'https://scrumguides.org/scrum-guide.html', 'reference'],
      ['Atlassian — backlog refinement', 'https://www.atlassian.com/agile/scrum/backlogs', 'reference'],
      ['Marty Cagan — product backlog', 'https://www.svpg.com/the-product-backlog/', 'article']
    ],
    questions: [
      ['Why should backlog detail decrease down the list?', 'Most far-future items will never be built, so specifying them is waste. The next two iterations need slicing and criteria; anything six months out needs to be a problem statement at most.'],
      ['Why is deleting the underrated skill?', 'An item that never rises has been implicitly declined many times. Keeping it pretends the decision is open. Moving it to a declined list with a reason is more useful than leaving it to rot.'],
      ['What input does an AI product backlog need that others do not?', 'Confirmed production errors. Each becomes a regression case in the golden set, and where several share a cause, the pattern becomes a backlog item that usually outranks most of the roadmap.']
    ]
  },

  {
    id: 'sprint-planning',
    title: 'Sprint Planning',
    domain: 'product', tier: 3, priority: 'medium',
    summary: 'Agreeing what the team will attempt next, and why that set makes sense together.',
    what: `Sprint planning is the session where a team selects work for the next iteration, agrees what it is trying to achieve, and confirms the work is understood well enough to start.`,
    why: `A sprint without a stated goal is a batch of unrelated tickets, and a batch of unrelated tickets cannot be traded off when something takes longer than expected. The goal is what lets a team drop the right thing rather than the last thing.`,
    analogy: `A crew agreeing on the destination before deciding what to load. The cargo list is negotiable; arriving is not.`,
    technical: `The inputs: a refined backlog, known capacity (accounting for leave, support duty and meetings), and the previous iteration's actual throughput.

The outputs that matter: a **sprint goal** in one sentence, the selected items, and — importantly — a shared understanding of what would be dropped first if the sprint gets tight.

**Capacity is not headcount × days.** Support rotations, interviews, incidents and code review consume a large and fairly predictable fraction. Teams that plan at full capacity miss every sprint and learn nothing from missing.

**Estimates are for shaping the conversation, not for forecasting.** The value of estimating is the discussion that reveals two engineers understood the story differently. A team that estimates silently in a spreadsheet has kept the cost and discarded the benefit.

**For AI work, plan spikes as first-class items with hard timeboxes.** Research expands to fill available time, and "we'll look into whether the model can do this" is unbounded unless you bound it. Three days, then a decision, is a plannable item; "investigate" is not.`,
    diagram: `
   INPUTS                        OUTPUTS

     refined backlog               SPRINT GOAL — one sentence
     known capacity                selected items
     last sprint's throughput      ⚠ what gets DROPPED first

   ⚠ CAPACITY IS NOT HEADCOUNT × DAYS

     5 people × 10 days           =  50 person-days
     − support rotation                 −8
     − interviews                       −3
     − code review, meetings           −10
     − one incident (historical avg)    −4
                                    ─────
     realistic                          25   ← half

     teams that plan at full capacity miss every sprint
     and learn nothing from missing

   THE SPRINT GOAL DOES THE REAL WORK

     without a goal   a batch of unrelated tickets
                      → when it gets tight, you drop the LAST thing

     with a goal      "an agent can get a cited refund-policy
                       answer on a real call"
                      → when it gets tight, you drop the RIGHT thing

   ESTIMATES ARE FOR THE CONVERSATION

     the value is discovering that two engineers understood
     the story differently

     estimating silently in a spreadsheet keeps the cost
     and discards the benefit

   ⚠ TIMEBOX AI SPIKES HARD

     "investigate whether the model can do this"  unbounded
     "3 days, then a go/no-go with a number"      plannable

     research expands to fill available time.`,
    example: {
      language: 'text',
      caption: 'A planning session, including the part usually skipped',
      code: `SPRINT 24  ·  team of 5  ·  2 weeks

CAPACITY
  raw                              50 person-days
  support rotation (2 people)       -8
  Diwali leave (1 person, 3 days)   -3
  interviews                        -2
  review + ceremonies               -9
  incident reserve (hist. avg)      -4
  ───────────────────────────────────
  planned against                   24 person-days
  last sprint actual throughput     22 person-days
  → plan to ~22, not 50

SPRINT GOAL
  "An agent on a live call can get a cited refund-policy answer,
   or a clear 'not covered', inside the console."

  ⚠ ONE sentence. If it needs two, it is two sprints.

SELECTED
  S0  spike: refund-policy accuracy on 20 real cases   3d  TIMEBOXED
  S1  cited answer, refund policy only, behind flag    8d
  S2  abstain when unsupported                         5d
  S3  one-click wrong-answer flag                      3d
  ─────────────────────────────────────────────────────
                                                      19d  (of 22)

NOT SELECTED, AND WHY  ← the part usually skipped
  · shipping-policy category — waits until S1 proves the shape
  · latency optimisation    — no evidence it is a problem yet
  · dashboard for leads     — off the sprint goal

DROP ORDER IF IT GETS TIGHT  ← the part ALWAYS skipped
  1st  S3 (flagging) — painful but not blocking the goal
  2nd  nothing else. S1 without S2 ships a system that guesses
       confidently, which is worse than not shipping.

  ⚠ AGREEING THIS IN PLANNING IS WHAT PREVENTS S2 BEING
    QUIETLY DROPPED ON DAY 9 BECAUSE IT IS LAST IN THE LIST.

CONTINGENCY ON S0
  If the spike returns >4% confidently-wrong:
    S1-S3 do not start. The sprint becomes: improve retrieval
    quality and re-measure. The goal changes and we say so.
  ⚠ Deciding this in advance is what stops a failed spike
    turning into "well, we've started, let's continue".`
    },
    prereq: ['backlog-management'], next: ['sprint-review-retro'],
    related: ['epics-user-stories', 'acceptance-criteria', 'roadmap', 'ai-feasibility'],
    tools: [],
    useCases: [
      'Agreeing a goal that makes trade-offs possible mid-sprint.',
      'Planning against realistic rather than nominal capacity.',
      'Deciding in advance what a failed spike means.'
    ],
    avoid: [
      'Planning at nominal capacity.',
      'Unbounded investigation items.'
    ],
    mistakes: [
      'No sprint goal, so the team drops the last item rather than the right one.',
      'Treating capacity as headcount times days.',
      'Leaving AI spikes untimeboxed, so research expands indefinitely.',
      'Not agreeing a drop order, so load-bearing items get quietly cut on day nine.'
    ],
    keyTerms: [
      ['sprint goal', 'One sentence describing what the iteration is for.'],
      ['capacity', 'Realistic available effort after known deductions.'],
      ['velocity', 'Historical throughput; a planning input, not a target.'],
      ['timebox', 'A hard limit on a piece of investigation.'],
      ['drop order', 'Agreed sequence for cutting scope under pressure.'],
      ['contingency', 'What happens if a spike returns a bad result.']
    ],
    resources: [
      ['Scrum Guide', 'https://scrumguides.org/scrum-guide.html', 'reference'],
      ['Atlassian — sprint planning', 'https://www.atlassian.com/agile/scrum/sprint-planning', 'reference'],
      ['Shape Up — appetite and timeboxing', 'https://basecamp.com/shapeup', 'reference']
    ],
    questions: [
      ['What does a sprint goal actually do?', 'It makes mid-sprint trade-offs possible. Without one, a team under pressure drops the last item on the list rather than the least important one.'],
      ['Why is capacity not headcount times days?', 'Support rotations, interviews, review, meetings and incidents consume a large and fairly predictable fraction — often half. Planning at nominal capacity guarantees missing every sprint.'],
      ['Why timebox AI spikes hard?', 'Research expands to fill available time. "Three days then a go/no-go with a number" is plannable; "investigate whether the model can do this" is not.']
    ]
  },

  {
    id: 'sprint-review-retro',
    title: 'Review & Retrospective',
    domain: 'product', tier: 3, priority: 'medium',
    summary: 'Two different meetings: one about the product, one about the way of working.',
    what: `A sprint review inspects the increment with stakeholders and adapts the plan. A retrospective inspects how the team worked and changes one thing about it.`,
    why: `They are routinely merged, and the merge destroys both. Review without stakeholders is a demo to nobody; retrospective inside a review becomes a status update where nobody says anything uncomfortable.`,
    analogy: `A dress rehearsal with an audience versus the cast meeting afterwards. Both are necessary and they cannot be the same room.`,
    technical: `**Review** is about the product. Show working software, not slides. The valuable output is what you learn from stakeholder reaction, which frequently changes the next sprint's plan — a review where the plan never changes is theatre.

**Retrospective** is about the process. The output is exactly one change with an owner. Retros that produce eight action items produce zero, because nothing has an owner and nothing is checked.

The failure modes: retros that surface the same issue every time without resolving it (the issue is real and outside the team's control — escalate it or stop listing it), and retros with no psychological safety, which produce polite noise.

**Start the retro by checking the previous action.** If last time's change was never done, that is the most important thing in the room, and skipping it teaches the team that retro outcomes do not matter.

For AI work, add a standing review item: **what did production tell us this sprint?** Flagged errors, drift in the abstention rate, latency changes, cost per query. That is evidence the team would otherwise only see when someone complains.`,
    diagram: `
   TWO MEETINGS, DELIBERATELY SEPARATE

     REVIEW                        RETROSPECTIVE
     about the PRODUCT             about the WAY OF WORKING
     stakeholders present          team only
     show working software         psychological safety required
     output: plan changes          output: ONE change, ONE owner

   ⚠ MERGING THEM DESTROYS BOTH

     review without stakeholders   → a demo to nobody
     retro inside a review         → a status update where nobody
                                     says anything uncomfortable

   ⚠ ONE ACTION, NOT EIGHT

     8 action items  → 0 owners → 0 done
     1 action item   → 1 owner  → checked next time

   ⚠ START THE RETRO BY CHECKING LAST TIME'S ACTION

     if it was never done, THAT is the most important thing
     in the room

     skipping it teaches the team that retro outcomes
     do not matter — and after three sprints, they do not

   THE FAILURE MODE WORTH NAMING

     the same issue surfaces every retro and never resolves
     → it is real and OUTSIDE the team's control
     → escalate it, or stop listing it
        listing it forever is corrosive

   AI-SPECIFIC STANDING REVIEW ITEM

     what did PRODUCTION tell us this sprint?
       flagged errors · abstention drift
       latency change · cost per query

     evidence the team would otherwise see only
     when someone complains`,
    example: {
      language: 'text',
      caption: 'A review that changed the plan, and a retro that changed one thing',
      code: `REVIEW — sprint 24
─────────────────────────────────────────────────────────────
  DEMONSTRATED  live, on a real refund question, in the console
                (not slides, not a recording)

  PRODUCTION SAYS  ← standing AI item
    queries/day                412
    abstention rate            29% → 41%   ⚠ drifting up
    confidently-wrong (sampled) 1.1%
    p95 latency                2.4s
    cost/query                 ₹0.71
    flagged by agents          23, of which 14 confirmed wrong

  STAKEHOLDER REACTION
    Support lead: "41% abstention means four in ten times they
    still have to ask Priya. At that rate they'll stop trying."

    ⚠ THE PLAN CHANGED IN THE ROOM.
      Next sprint was going to be the shipping-policy category.
      It is now: find out why abstention drifted from 29% to 41%.
      Expanding coverage while the existing category is
      declining more often would have made things worse.

  ROOT CAUSE (found the next day)
    9 of the 14 confirmed errors were regional policy variants.
    The abstention threshold had been raised in response —
    correctly, but bluntly, suppressing valid answers too.


RETROSPECTIVE — sprint 24
─────────────────────────────────────────────────────────────
  FIRST: last sprint's action
    "Add the spike result to the PRD before starting build."
    → Done. It caught the 4% contingency discussion early.
    ✓ keep

  WHAT WE NOTICED
    · the abstention drift was visible in the dashboard for
      nine days before anyone looked
    · S3 (flagging) nearly got cut on day 9 — the agreed drop
      order is what saved it
    · estimates were close; the spike timebox held

  ONE ACTION  ← one, with an owner and a check date
    "Abstention rate and confidently-wrong rate go into the
     team's daily standup board, not just the dashboard."
     Owner: Ravi.  Check: next retro.

  NOT ACTIONED, DELIBERATELY
    "The shared staging environment is unreliable."
    Third retro running. It is real and outside our control.
    → Escalated to platform team with the three dates it broke.
      Removed from the retro board. Listing it a fourth time
      would just be corrosive.`
    },
    prereq: ['sprint-planning'], next: [],
    related: ['tracing', 'ai-metrics', 'backlog-management', 'drift-detection'],
    tools: [],
    useCases: [
      'Getting stakeholder reaction that changes the plan.',
      'Surfacing what production is telling you before someone complains.',
      'Changing one thing about how the team works, and checking it.'
    ],
    avoid: [
      'Merging review and retrospective.',
      'Retros producing many action items with no owners.'
    ],
    mistakes: [
      'Reviewing with slides rather than working software.',
      'Producing eight retro actions, which means none are done.',
      'Never checking the previous action, which teaches the team retros do not matter.',
      'Letting the same uncontrollable issue recur every retro without escalating it.'
    ],
    keyTerms: [
      ['sprint review', 'Inspecting the product increment with stakeholders.'],
      ['retrospective', 'Inspecting the way of working, team only.'],
      ['increment', 'The working software produced this iteration.'],
      ['psychological safety', 'The precondition for a useful retrospective.'],
      ['action item', 'One change, with an owner and a check date.'],
      ['drift', 'A production metric moving without a code change.']
    ],
    resources: [
      ['Scrum Guide', 'https://scrumguides.org/scrum-guide.html', 'reference'],
      ['Atlassian — retrospectives', 'https://www.atlassian.com/team-playbook/plays/retrospective', 'reference'],
      ['Google — re:Work psychological safety', 'https://rework.withgoogle.com/en/guides/understanding-team-effectiveness', 'reference']
    ],
    questions: [
      ['Why must review and retrospective be separate meetings?', 'Review is about the product and needs stakeholders; retrospective is about the way of working and needs safety. Merging them turns the review into a demo to nobody and the retro into a status update.'],
      ['Why produce only one retrospective action?', 'Eight actions have no owners and none get done. One action with an owner and a check date is the only form that reliably changes anything.'],
      ['What standing item should an AI team add to review?', 'What production said this sprint — flagged errors, abstention drift, latency, cost per query. It surfaces evidence the team would otherwise only see when someone complains.']
    ]
  }
];
