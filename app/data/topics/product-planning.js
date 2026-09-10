/**
 * DOMAIN R — PRODUCT MANAGEMENT, part 2 of 6: understanding the user and the opportunity
 */
export const topics = [
  {
    id: 'personas',
    title: 'Personas',
    domain: 'product', tier: 3, priority: 'low',
    summary: 'A shared shorthand for who you are building for — useful when grounded, harmful when invented.',
    what: `A persona is a condensed description of a user segment: their goals, context, constraints and level of expertise, built from research and used as a shared reference across a team.`,
    why: `Teams make hundreds of small decisions that assume a user. Personas make that assumption explicit and shared, so the assumption can be challenged rather than silently differing between the designer, the engineer and the PM.`,
    analogy: `A composite sketch. Useful for coordinating a search; dangerous if you forget it was assembled from descriptions rather than photographed.`,
    technical: `A persona earns its place when it is **derived from research** and when it **changes decisions**. A persona that lists age, job title and a stock photo but never resolves an argument is decoration.

The parts that actually matter: what they are trying to accomplish, what constrains them (time, permissions, expertise, device), what they currently do instead, and what would make them abandon your product.

**The main risk is invention.** Personas assembled in a workshop from what the team imagines are worse than no personas, because they carry the authority of research without the substance.

**Jobs To Be Done is often the better tool** when the same person behaves differently in different situations — which is most of the time. Personas describe people; jobs describe circumstances, and circumstances predict behaviour better.

For AI products, the persona dimension that matters most is not demographic but **expertise and verification ability**: can this person tell whether the output is correct? A persona who can verify tolerates a much more capable, more autonomous system than one who cannot.`,
    diagram: `
   A PERSONA EARNS ITS PLACE IF IT…

     ✓ came from research
     ✓ changes decisions
     ✗ lists age, title and a stock photo and resolves nothing

   THE PARTS THAT MATTER

     GOAL          what they are trying to accomplish
     CONSTRAINTS   time · permissions · expertise · device
     CURRENT WAY   what they do instead today
     ABANDONMENT   what would make them stop using it

   ⚠ THE MAIN RISK IS INVENTION

     workshop-assembled personas are WORSE than none —
     they carry the authority of research without the substance

   ⚠ FOR AI, THE KEY DIMENSION IS VERIFICATION ABILITY

     can this person tell whether the output is CORRECT?

       CAN verify        tolerates a capable, autonomous system
                         → speed, density, fewer guardrails

       CANNOT verify     needs citation, abstention, human review
                         → the system must be conservative

     this dimension predicts the design far better than
     age, title or "tech-savviness"

   PERSONAS vs JOBS

     personas describe PEOPLE
     jobs describe CIRCUMSTANCES

     the same person behaves differently in different
     circumstances — which is most of the time`,
    example: {
      language: 'text',
      caption: 'A persona that changes decisions, and one that does not',
      code: `DECORATIVE — resolves no argument
─────────────────────────────────────────────────────────────
  "SUPPORT SAM, 32
   Lives in Pune. Enjoys cricket and podcasts.
   Tech-savvy. Wants to help customers.
   Frustrated by slow tools."

  Every team member already agreed with all of this.
  Nothing in it can be wrong, so nothing in it can decide.


USEFUL — derived from research, resolves arguments
─────────────────────────────────────────────────────────────
  FRONTLINE AGENT  (n=11 interviews, 4 observed sessions)

  Goal          close the call without a callback
  Constraint    customer is ON THE LINE — budget is ~30 seconds
  Constraint    cannot approve refunds above ₹5,000 alone
  Expertise     knows common policy well; edge cases not at all
  VERIFICATION  CANNOT independently verify an edge-case answer
                → this is the decisive fact
  Current way   asks a senior colleague on Slack (6-7 min)
  Abandons if   two confidently wrong answers  ← stated by 5 of 11

  DECISIONS THIS RESOLVED
    "Should answers be conversational?"
       → No. 30-second budget. Terse and cited.
    "Can it auto-draft refund approvals?"
       → No. Cannot approve above ₹5,000 anyway; drafting
         an approval they cannot grant creates a worse moment.
    "Is 92% accuracy good enough to ship?"
       → Not on its own. 8% wrong with no way to verify
         hits the abandonment threshold within a week.
         Ship with abstention: answer 70%, decline 30%.

  ⚠ THE LAST DECISION IS THE ONE THAT MATTERED.
    The team had been arguing about accuracy percentage.
    The persona reframed it as verification ability, and the
    answer changed from "improve the model" to "let it decline".`
    },
    prereq: ['user-research'], next: ['journey-mapping'],
    related: ['jtbd', 'customer-interviews', 'ai-ux', 'human-in-the-loop'],
    tools: [],
    useCases: [
      'Giving a team a shared, challengeable model of the user.',
      'Resolving design arguments with evidence rather than opinion.',
      'Deciding how conservative an AI feature must be.'
    ],
    avoid: [
      'Personas invented in a workshop.',
      'Personas that never change a decision.'
    ],
    mistakes: [
      'Inventing personas and treating them as research.',
      'Including demographic detail that decides nothing.',
      'Using personas where situations (JTBD) would predict behaviour better.',
      'Omitting verification ability, which is the decisive dimension for AI products.'
    ],
    keyTerms: [
      ['persona', 'A research-derived description of a user segment.'],
      ['segment', 'A group who behave similarly.'],
      ['verification ability', 'Whether a user can tell if output is correct.'],
      ['abandonment threshold', 'What makes a user stop using the product.'],
      ['proto-persona', 'An assumption-based persona, explicitly labelled as unvalidated.']
    ],
    resources: [
      ['Nielsen Norman Group — personas', 'https://www.nngroup.com/articles/persona/', 'article'],
      ['Google — People + AI Guidebook', 'https://pair.withgoogle.com/guidebook/', 'reference'],
      ['Jobs to be Done — overview', 'https://hbr.org/2016/09/know-your-customers-jobs-to-be-done', 'reference']
    ],
    questions: [
      ['When is a persona worth having?', 'When it comes from research and changes decisions. A persona that lists demographics and resolves no arguments is decoration with the authority of evidence.'],
      ['What persona dimension matters most for AI products?', 'Verification ability — whether the user can tell if the output is correct. A user who cannot verify needs citation, abstention and review regardless of how accurate the model is.'],
      ['When should you use Jobs To Be Done instead?', 'When the same person behaves differently in different situations, which is most of the time. Circumstances predict behaviour better than demographics do.']
    ]
  },

  {
    id: 'journey-mapping',
    title: 'Journey Mapping',
    domain: 'product', tier: 3, priority: 'medium',
    summary: 'Laying out the whole path a user takes, so you can see where it actually breaks.',
    what: `A journey map lays out the sequence of steps a user takes toward a goal, with what they do, think and feel at each step, and where the process breaks down.`,
    why: `Teams optimise the step they own. The failure is usually two steps earlier or in a handoff nobody owns, and that only becomes visible when the whole path is drawn on one page.`,
    analogy: `A route map rather than a photograph of one junction. Traffic problems are almost never caused where the queue forms.`,
    technical: `The columns that carry the weight: **stage**, **action**, **touchpoint** (which system or person), **thinking/feeling**, **pain**, and **opportunity**.

Two properties make a map useful rather than decorative:
- **It crosses system boundaries.** The valuable findings are in the seams — where the user leaves your product for email, a phone call, a colleague, or a spreadsheet.
- **It is built from observation.** A map drawn from what the team believes happens reproduces the team's blind spots at higher resolution.

**Service blueprints** extend the map below the line of visibility to show backstage processes and systems, which is where the cause of a front-stage pain usually lives.

For AI features, add a row for **trust**: at each step, does the user believe the output, and what are they doing to check it? Verification effort is invisible in a conventional map and often eliminates the entire time saving the feature was supposed to produce.`,
    diagram: `
   THE SHAPE

     STAGE      │ notice │ search │ ask    │ answer │ follow-up │
     ───────────┼────────┼────────┼────────┼────────┼───────────┤
     ACTION     │ cust.  │ opens  │ Slack  │ reads  │ callback  │
                │ asks   │ h'book │ senior │ reply  │ next day  │
     TOUCHPOINT │ phone  │ intra- │ Slack  │ Slack  │ phone     │
                │        │ net    │        │        │           │
     FEELING    │ calm   │ ↓      │ ↓↓     │ ↑      │ ↓↓↓       │
     PAIN       │        │ 40 hits│ Priya  │        │ customer  │
                │        │ no rank│ on lv  │        │ annoyed   │
     TRUST      │        │ low    │ HIGH   │ high   │           │
     ───────────┴────────┴────────┴────────┴────────┴───────────┘
        ▲                  ▲                            ▲
        │                  │                            │
     the step we own    the real break         where the cost lands

   ⚠ THE VALUE IS IN THE SEAMS

     the failure is rarely in the step you own —
     it is in a HANDOFF NOBODY OWNS

   ⚠ ADD A TRUST ROW FOR AI FEATURES

     at each step: does the user believe the output,
     and what are they doing to CHECK it?

     verification effort is invisible in a normal map
     and routinely eats the entire time saving

       "it answered in 2 seconds"
       "…then I spent 4 minutes confirming it in the handbook"
       net saving: negative

   BELOW THE LINE OF VISIBILITY (service blueprint)
     backstage systems and processes — usually where the
     front-stage pain is actually CAUSED`,
    example: {
      language: 'text',
      caption: 'What the map revealed that the metric did not',
      code: `METRIC BEFORE MAPPING
  "Average handle time is 8.2 minutes. Target 6.5."
  → the team was optimising the ANSWER step

WHAT THE MAP SHOWED (4 observed calls, 11 interviews)

  stage 1  customer asks              0:00   calm
  stage 2  agent searches handbook    0:15   40 unranked results
                                             abandons at result 3
  stage 3  agent asks in Slack        0:40   ⚠ 6-7 min of dead air
  stage 4  agent relays answer        7:10   trust HIGH (a human said it)
  stage 5  customer calls back        next   ⚠ 30% of escalated threads
                                      day    cost lands OUTSIDE the metric

  ⚠ FINDING 1  The 8.2 minutes is almost entirely stage 3.
               Nothing the team was building touched stage 3.

  ⚠ FINDING 2  Stage 5 is not in the handle-time metric at all.
               It is the largest cost and it was invisible.

  ⚠ FINDING 3  Trust is HIGH at stage 4 only because a human
               said it. An AI answer entering at stage 3 does not
               inherit that trust — it has to earn it separately.

AFTER SHIPPING — the trust row again
  answer arrives in 2s at stage 3
  BUT agents then opened the handbook to confirm it (3-4 min)
  net saving in week 1: ~0

  fixed by citing the exact clause with a one-click open —
  verification dropped from 4 minutes to ~10 seconds

  THE FEATURE DID NOT WORK UNTIL THE TRUST ROW DID.`
    },
    prereq: ['user-research'], next: ['opportunity-sizing'],
    related: ['personas', 'funnels', 'upstream-downstream', 'ai-ux'],
    tools: [],
    useCases: [
      'Finding where a process actually breaks rather than where it is measured.',
      'Exposing handoffs that no team owns.',
      'Checking whether an AI feature saves net time after verification.'
    ],
    avoid: [
      'Maps drawn from team assumption rather than observation.',
      'Maps that stop at your product boundary.'
    ],
    mistakes: [
      'Mapping only the steps inside your product, hiding the seams where failures live.',
      'Building the map from belief instead of observation.',
      'Omitting verification effort, so an AI feature appears to save time it does not.',
      'Producing a beautiful map that changes no decision.'
    ],
    keyTerms: [
      ['touchpoint', 'The system or person the user interacts with at a step.'],
      ['seam', 'A handoff between systems or teams. Where failures concentrate.'],
      ['service blueprint', 'A journey map extended to backstage processes.'],
      ['line of visibility', 'The boundary between what the user sees and what they do not.'],
      ['verification effort', 'Time spent checking AI output. Often cancels the saving.'],
      ['moment of truth', 'A step that disproportionately determines the outcome.']
    ],
    resources: [
      ['Nielsen Norman Group — journey mapping', 'https://www.nngroup.com/articles/journey-mapping-101/', 'article'],
      ['Nielsen Norman Group — service blueprints', 'https://www.nngroup.com/articles/service-blueprints-definition/', 'article'],
      ['Google — People + AI Guidebook', 'https://pair.withgoogle.com/guidebook/', 'reference']
    ],
    questions: [
      ['Why map the whole journey rather than the step you own?', 'Because the failure is usually in a handoff nobody owns, two steps from where it is measured. Optimising your own step can leave the actual cost untouched.'],
      ['What extra row do AI features need on a journey map?', 'Trust — whether the user believes the output at each step and what they do to check it. Verification effort is invisible otherwise and routinely cancels the time saving.'],
      ['What makes a journey map decorative?', 'Being drawn from team assumption rather than observation, stopping at the product boundary, and changing no decision.']
    ]
  },

  {
    id: 'opportunity-sizing',
    title: 'Opportunity Sizing',
    domain: 'product', tier: 2, priority: 'medium',
    summary: 'Estimating what solving a problem is worth, before deciding whether to solve it.',
    what: `Opportunity sizing estimates the value of solving a problem: how many people have it, how often, what it costs them now, and what fraction of that cost a solution could realistically remove.`,
    why: `Prioritisation without sizing is prioritisation by whoever argues most persuasively. A rough, explicit estimate beats a confident intuition, mainly because it can be checked and corrected.`,
    analogy: `Estimating a repair before authorising it. The estimate will be wrong; having one still prevents spending a fortune on the wrong thing.`,
    technical: `The structure: **frequency × population × cost per occurrence × realistic capture rate**.

The last term is where most estimates go wrong. A solution rarely removes the whole cost. If handbook search takes seven minutes and your assistant answers in thirty seconds, the saving is not 6.5 minutes — it is 6.5 minutes minus verification time, times the fraction of questions the assistant can actually answer, times the fraction of agents who adopt it.

**State the assumptions as numbers, not adjectives.** "Significant time saving" cannot be checked; "40 questions/day × 6 min × 60 agents × 70% coverage × 60% adoption" can be argued with line by line, which is the point.

**Bound it, do not point-estimate it.** Give a pessimistic and optimistic figure. If the pessimistic case is still worth doing, the decision is easy. If the optimistic case is not, the decision is also easy. Most of the argument only matters in between.

For AI features add a term the estimate usually omits: **the cost of being wrong × error rate**. A feature that saves ₹4 lakh a year and generates twelve incorrect refund commitments may be net negative.`,
    diagram: `
   THE STRUCTURE

     FREQUENCY  ×  POPULATION  ×  COST/OCCURRENCE  ×  CAPTURE

   ⚠ CAPTURE IS WHERE ESTIMATES GO WRONG

     naive     7 min → 30 sec = 6.5 min saved
     real      6.5 min
               − verification time
               × coverage (what fraction it can answer)
               × adoption (what fraction of people use it)
               = the actual saving

     a 6.5-minute saving at 70% coverage and 60% adoption
     is 2.7 minutes, not 6.5

   STATE ASSUMPTIONS AS NUMBERS

     ✗ "significant time saving"        cannot be argued with
     ✓ "40/day × 6 min × 60 agents
        × 70% coverage × 60% adoption"  can be argued line by line
                                        ← that IS the point

   BOUND IT, DO NOT POINT-ESTIMATE IT

     pessimistic still worth doing   →  decision is easy
     optimistic not worth doing      →  decision is easy
     in between                      →  the only case worth arguing

   ⚠ THE AI TERM MOST ESTIMATES OMIT

     + (cost of being wrong × error rate × volume)

     a feature saving ₹4L/year that produces twelve incorrect
     refund commitments may be NET NEGATIVE`,
    example: {
      language: 'python',
      caption: 'A sizing you can argue with, bounded rather than point-estimated',
      code: `def size(*, per_day, people, minutes_saved, coverage, adoption,
         verify_minutes, cost_per_hour, working_days=250,
         error_rate=0.0, cost_per_error=0.0):
    """Every input is a number someone can dispute. That is the point."""
    occurrences = per_day * people * working_days * coverage * adoption
    net_minutes = max(0.0, minutes_saved - verify_minutes)
    gross = occurrences * net_minutes / 60 * cost_per_hour
    errors = occurrences * error_rate
    return {
        "occurrences_per_year": round(occurrences),
        "net_minutes_each": round(net_minutes, 1),
        "gross_value": round(gross),
        "errors_per_year": round(errors),
        "error_cost": round(errors * cost_per_error),
        "net_value": round(gross - errors * cost_per_error),
    }

BASE = dict(per_day=40, people=60, minutes_saved=6.5,
            cost_per_hour=450, cost_per_error=2500)

print("PESSIMISTIC")
print(size(**BASE, coverage=0.50, adoption=0.40,
           verify_minutes=2.0, error_rate=0.06))
# {'occurrences_per_year': 120000, 'net_minutes_each': 4.5,
#  'gross_value': 4050000, 'errors_per_year': 7200,
#  'error_cost': 18000000, 'net_value': -13950000}
#                                        ↑ NEGATIVE

print("OPTIMISTIC")
print(size(**BASE, coverage=0.75, adoption=0.70,
           verify_minutes=0.2, error_rate=0.01))
# {'occurrences_per_year': 315000, 'net_minutes_each': 6.3,
#  'gross_value': 14883750, 'errors_per_year': 3150,
#  'error_cost': 7875000, 'net_value': 7008750}

# ⚠ THE BOUNDS DISAGREE ON THE SIGN.
#   This is not a "how big is the prize" decision — it is a
#   "can we get the error rate down and verification cheap"
#   decision. That is a completely different piece of work,
#   and the sizing is what revealed it.
#
#   Sensitivity says error_rate dominates everything else:
for er in (0.06, 0.03, 0.01, 0.005):
    v = size(**BASE, coverage=0.75, adoption=0.70,
             verify_minutes=0.2, error_rate=er)["net_value"]
    print(f"  error_rate {er:>5.1%} → net {v:>12,}")
#   error_rate  6.0% → net  -32,391,250
#   error_rate  3.0% → net  -8,754,250
#   error_rate  1.0% → net    7,008,750
#   error_rate  0.5% → net   10,946,250
#
#   The whole business case is a single number: can we get
#   below ~1.5% confidently-wrong answers. Everything else
#   is noise. Now go measure THAT.`
    },
    prereq: ['problem-statements'], next: ['prioritization'],
    related: ['unit-economics', 'ai-cost', 'ai-feasibility', 'product-metrics'],
    tools: [],
    useCases: [
      'Comparing two problems on value rather than volume of complaints.',
      'Finding which assumption the whole business case depends on.',
      'Deciding not to build something, cheaply.'
    ],
    avoid: [
      'Point estimates presented with false precision.',
      'Sizing that omits adoption and coverage.'
    ],
    mistakes: [
      'Assuming a solution captures the entire cost of the problem.',
      'Omitting adoption, which routinely halves the estimate.',
      'Stating assumptions as adjectives, which makes them unarguable.',
      'For AI, ignoring the cost of errors, which can flip the sign of the estimate.'
    ],
    keyTerms: [
      ['capture rate', 'The fraction of the problem’s cost a solution actually removes.'],
      ['coverage', 'The fraction of cases the solution can handle.'],
      ['adoption', 'The fraction of users who actually use it.'],
      ['sensitivity analysis', 'Which assumption the conclusion depends on most.'],
      ['bounded estimate', 'A pessimistic and optimistic pair rather than one number.'],
      ['cost of error', 'What a wrong output costs, times how often it happens.']
    ],
    resources: [
      ['Marty Cagan — opportunity assessment', 'https://www.svpg.com/opportunity-assessment/', 'article'],
      ['Reforge — sizing opportunities', 'https://www.reforge.com/blog/opportunity-sizing', 'article'],
      ['Anthropic — pricing', 'https://docs.anthropic.com/en/docs/about-claude/pricing', 'docs']
    ],
    questions: [
      ['Why is capture rate the term that most estimates get wrong?', 'A solution rarely removes the whole cost. The realistic saving is the gross saving minus verification time, times coverage, times adoption — often a third of the naive figure.'],
      ['Why bound an estimate instead of giving one number?', 'If the pessimistic case is still worth doing, or the optimistic case is not, the decision is immediate. Only the in-between case is worth arguing about.'],
      ['What term do AI opportunity estimates usually omit?', 'The cost of being wrong times the error rate times volume. It can flip the sign of the estimate, turning an apparent saving into a net loss.']
    ]
  }
];
