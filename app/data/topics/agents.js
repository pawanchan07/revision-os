/**
 * DOMAIN K — AI AGENTS (BUILD.md section 14)
 */
export const topics = [
  {
    id: 'what-is-an-agent',
    title: 'What Is an Agent?',
    domain: 'agents', tier: 1, priority: 'high',
    summary: 'A model that decides what to do, does it, looks at the result, and decides again.',
    what: `An agent is an LLM placed inside a loop with tools. Instead of producing an answer directly, it decides which action to take, the system executes it, the result comes back, and the model decides what to do next — until it reaches a goal or gives up.`,
    why: `The moment a system can act, the product question changes completely. It stops being "is the answer good" and becomes "who authorised that action, can we undo it, and what stopped it looping forever". Almost every hard problem in agent products is a control problem, not an intelligence problem.`,
    analogy: `The difference between asking a colleague for advice and giving them your corporate card. Both may be equally competent. Only one can cost you money while you are asleep.`,
    technical: `The minimum ingredients: a **goal**, a set of **tools** with described interfaces, a **loop** that alternates model calls and tool execution, and a **termination condition**.

Each iteration: the model receives the goal plus everything observed so far, and either emits a tool call or a final answer. Tool results are appended to the context, so context grows every step — which drives both cost and the eventual context limit.

Agents range from trivial to elaborate:
- **Tool-augmented single turn** — one tool call, then answer. Barely an agent, and often sufficient.
- **ReAct loop** — reason, act, observe, repeat. The standard shape.
- **Planning agents** — produce a plan first, then execute it.
- **Multi-agent** — several specialised agents coordinating.

Complexity should be earned. Most production "agents" that work are closer to the first two than the last two.`,
    diagram: `
   LLM                          AGENT

   prompt                       goal
     │                            │
     ▼                            ▼
   model                    ┌──► model decides
     │                      │       │
     ▼                      │   ┌───┴────┐
   answer                   │  tool     final answer
                            │  call        │
   one call                 │    │         ▼
   no side effects          │  execute    done
   predictable cost         │    │
                            │  observe
                            └────┘
                            N calls · REAL side effects
                            unbounded cost unless capped

   WHAT CHANGES WHEN IT CAN ACT

     question           before              after
     ─────────          ──────              ─────
     failure means      a bad answer        a bad ACTION
     cost is            predictable         unbounded
     testing means      answer quality      tool choice, loop
                                            termination, rollback
     the key control    prompting           PERMISSIONS

   ⚠ COMPLEXITY MUST BE EARNED

     one tool call, then answer     ← works, ship this first
     ReAct loop with a step cap     ← standard, well understood
     planning agent                 ← justify it
     multi-agent system             ← justify it very carefully`,
    example: {
      language: 'python',
      caption: 'The minimum viable agent, with the controls that make it shippable',
      code: `TOOLS = [
    {"name": "search_orders",
     "description": "Find orders for a customer by email. READ ONLY.",
     "input_schema": {"type": "object",
                      "properties": {"email": {"type": "string"}},
                      "required": ["email"]}},
    {"name": "get_policy",
     "description": "Retrieve the refund policy text. READ ONLY.",
     "input_schema": {"type": "object",
                      "properties": {"topic": {"type": "string"}},
                      "required": ["topic"]}},
]

MAX_STEPS = 8            # non-negotiable
MAX_TOKENS = 40_000      # cost ceiling per request

def run_agent(goal, llm, executor):
    messages = [{"role": "user", "content": goal}]
    trace, tokens = [], 0

    for step in range(MAX_STEPS):
        reply = llm(messages, tools=TOOLS)
        tokens += reply.usage.total
        if tokens > MAX_TOKENS:
            return {"status": "budget_exceeded", "trace": trace}

        if reply.stop_reason != "tool_use":
            return {"status": "done", "answer": reply.text,
                    "steps": step + 1, "trace": trace}

        call = reply.tool_calls[0]
        try:
            result = executor.run(call.name, call.input)
            ok = True
        except Exception as e:                 # a tool failure is normal
            result, ok = f"Tool error: {e}", False

        trace.append({"step": step, "tool": call.name,
                      "input": call.input, "ok": ok})

        messages += [{"role": "assistant", "content": reply.raw},
                     {"role": "user", "content": tool_result(call.id, result)}]

    # Hitting the cap is a real outcome, not an exception to swallow
    log.warning("agent hit step cap: %s | trace=%s", goal, trace)
    return {"status": "step_cap", "trace": trace}

# Note what is NOT in TOOLS: anything that writes, sends, refunds
# or deletes. Read-only first. Write tools go behind approval.`
    },
    prereq: ['tool-calling'], next: ['llm-vs-agent', 'agent-loop'],
    related: ['agent-vs-chatbot', 'agent-failure-modes', 'prompt-injection', 'human-in-the-loop'],
    tools: ['langgraph', 'anthropic', 'mcp'],
    useCases: [
      'Multi-step tasks where the required steps are not known in advance.',
      'Workflows needing information from several systems.',
      'Triage and research tasks where the path depends on what is found.'
    ],
    avoid: [
      'When a fixed workflow would do — it is cheaper, faster and testable.',
      'When every action is irreversible and cannot be reviewed.',
      'When latency must be predictable.',
      'As a first version. Ship the deterministic pipeline, then add autonomy.'
    ],
    mistakes: [
      'No step cap, so a loop can run indefinitely.',
      'Granting write tools before read-only has been proven.',
      'Evaluating only the final answer, not the sequence of actions taken.',
      'Building a multi-agent system when one agent with three tools would work.',
      'Treating tool failures as exceptional — they are normal and must be handled in-loop.'
    ],
    keyTerms: [
      ['agent', 'A model in a loop with tools and a termination condition.'],
      ['tool', 'A function the model may call.'],
      ['loop', 'The decide-act-observe cycle.'],
      ['termination condition', 'What ends the loop: goal reached, cap hit, or error.'],
      ['trace', 'The recorded sequence of decisions and tool calls.'],
      ['ReAct', 'Reason-Act-Observe, the standard agent pattern.'],
      ['step cap', 'A hard limit on iterations. Non-negotiable.'],
      ['read-only tool', 'A tool with no side effects. Where every agent should start.']
    ],
    resources: [
      ['Anthropic — building effective agents', 'https://www.anthropic.com/engineering/building-effective-agents', 'reference'],
      ['Anthropic — tool use overview', 'https://docs.anthropic.com/en/docs/build-with-claude/tool-use/overview', 'docs'],
      ['ReAct: synergizing reasoning and acting (paper)', 'https://arxiv.org/abs/2210.03629', 'paper'],
      ['LangGraph — documentation', 'https://langchain-ai.github.io/langgraph/', 'docs']
    ],
    questions: [
      ['What changes about a product the moment the system can act?', 'The question stops being "is the answer good" and becomes "who authorised that action, can we undo it, and what stops it looping". The controls become permissions and caps rather than prompting.'],
      ['Why should the first version use only read-only tools?', 'A read-only agent cannot cause an irreversible incident while you are still learning how it behaves. Write tools should be added behind approval once the loop is understood.'],
      ['Why is a step cap non-negotiable?', 'The loop only ends when the model decides it is finished. If it never does, the loop runs indefinitely, calling the model and tools each iteration, with unbounded cost and latency.']
    ],
    interview: {
      s30: 'An agent is a model in a loop with tools. It decides an action, the system executes it, the result comes back, and it decides again — until it reaches the goal or hits a cap.',
      s90: 'The important shift is not intelligence, it is consequence. A chatbot that is wrong produces a bad answer; an agent that is wrong takes a bad action in a real system. So almost every hard problem in agent products is a control problem. I want three things before anything ships: a hard step cap so cost and latency are bounded, read-only tools first with write tools behind human approval, and full tracing of every decision, because you cannot debug what you did not record. I also push back hard on complexity — most production agents that actually work are one or two tool calls, not multi-agent systems. The right first version is usually a deterministic pipeline with one tool call, and you add autonomy only where the path genuinely cannot be known in advance.',
      pm: 'It determines what the system is allowed to touch, and that is a decision made at design time. Adding a write tool later without revisiting it is how a helpful feature becomes an incident.'
    }
  },

  {
    id: 'llm-vs-agent',
    title: 'LLM vs Agent',
    domain: 'agents', tier: 1, priority: 'high',
    summary: 'One call producing text, versus a loop producing actions.',
    what: `An LLM call takes a prompt and returns text. An agent runs many LLM calls interleaved with tool executions, and produces effects in the world as well as text.

The distinction is not capability. It is autonomy and consequence.`,
    why: `Teams describe anything with an LLM in it as an "agent", which obscures the questions that actually matter: how many model calls, what can it touch, and what happens when it is wrong. Being precise about this changes what you test and what you approve.`,
    analogy: `A consultant who writes you a memo versus one with access to your systems who implements their recommendation while you are in another meeting.`,
    technical: `The spectrum, in increasing order of autonomy:
1. **Single LLM call** — deterministic cost, no side effects.
2. **LLM + retrieval** — one extra read, still no side effects.
3. **LLM + one tool call** — one action, decided by the model but bounded.
4. **Agent loop, read-only tools** — N steps, no side effects.
5. **Agent loop, write tools** — N steps, real consequences.
6. **Autonomous long-running agent** — operates without a human in the session.

Each step up adds latency variance, cost variance and a new class of failure. Each also needs a different evaluation approach: levels 1–3 can be evaluated on outputs; levels 4–6 must be evaluated on trajectories.

Choose the lowest level that solves the problem. "It could be an agent" is not a reason to make it one.`,
    diagram: `
   THE AUTONOMY SPECTRUM

   1  single LLM call          cost: fixed      effects: none
      prompt → text

   2  + retrieval              cost: fixed      effects: none
      prompt → search → text

   3  + one tool call          cost: ~fixed     effects: one, bounded
      prompt → tool → text

   4  agent loop, READ-ONLY    cost: variable   effects: none
      loop until done, cap N

   5  agent loop, WRITE        cost: variable   effects: REAL
      can send, refund, delete

   6  autonomous, long-running cost: unbounded  effects: real,
      no human in the session                   unsupervised

   ── evaluate on OUTPUTS ──┤├── evaluate on TRAJECTORIES ──

   WHAT TO ASK BEFORE MOVING UP A LEVEL

     what does this level unlock that the one below cannot do?
     what is the worst action it can now take?
     can that action be undone?
     who approves it, and is that logged?

   ⚠ CHOOSE THE LOWEST LEVEL THAT SOLVES THE PROBLEM.
     "It could be an agent" is not a reason for it to be one.`,
    example: {
      language: 'text',
      caption: 'The same feature at three levels of autonomy',
      code: `FEATURE: "Help customers with billing questions."

── LEVEL 2: LLM + RETRIEVAL ───────────────────────────────
  retrieve policy chunks → answer with citations

  cost      $0.03, predictable
  latency   ~2s, predictable
  effects   none
  failure   a wrong answer, visible to one user
  testing   groundedness on a golden set

  ✓ Ships in two weeks. Solves ~70% of questions.


── LEVEL 4: AGENT, READ-ONLY TOOLS ────────────────────────
  tools: search_policy, get_order, get_invoice

  cost      $0.05-$0.20, variable
  latency   3-12s, variable
  effects   none — it can only read
  failure   a wrong answer using real account data
  testing   trajectory: did it call the right tools?

  ✓ Solves ~90%, because it can look up the actual order.
  ✓ Still cannot cause an incident.


── LEVEL 5: AGENT, WRITE TOOLS ────────────────────────────
  tools: + issue_refund, cancel_subscription

  cost      variable
  latency   variable
  effects   REAL AND IRREVERSIBLE
  failure   a wrong refund. To the wrong customer. Silently.
  testing   trajectory + rollback + approval audit

  Required before this ships:
    · human approval on every write
    · idempotency keys so a retry cannot double-refund
    · a hard monetary cap per request and per day
    · full audit log of who approved what

  ⚠ Level 5 is not "level 4 plus more tools". It is a
    different product with a different risk profile.`
    },
    prereq: ['what-is-an-agent'], next: ['agent-loop'],
    related: ['agent-vs-chatbot', 'ai-risk', 'human-in-the-loop', 'ai-feasibility'],
    tools: ['anthropic', 'langgraph'],
    useCases: [
      'Deciding how much autonomy a feature actually needs.',
      'Scoping an AI feature so the risk matches the value.',
      'Explaining to stakeholders why "make it an agent" is a bigger ask than it sounds.'
    ],
    avoid: [
      'Jumping to a high autonomy level because it is more impressive.',
      'Write tools before read-only has been proven in production.'
    ],
    mistakes: [
      'Calling everything an agent, which hides the questions that matter.',
      'Adding a write tool to a working read-only agent without re-doing the risk review.',
      'Evaluating an agent on final answers alone.',
      'Not capping cost, so a variable-cost feature has no ceiling.'
    ],
    keyTerms: [
      ['autonomy', 'How much the system decides for itself.'],
      ['side effect', 'A change to the world outside the conversation.'],
      ['trajectory', 'The sequence of decisions taken to reach an answer.'],
      ['bounded cost', 'A predictable ceiling on spend per request.'],
      ['read-only vs write tools', 'Tools that observe versus tools that change things.'],
      ['irreversible action', 'One that cannot be undone. Requires approval.']
    ],
    resources: [
      ['Anthropic — building effective agents', 'https://www.anthropic.com/engineering/building-effective-agents', 'reference'],
      ['Anthropic — tool use', 'https://docs.anthropic.com/en/docs/build-with-claude/tool-use/overview', 'docs'],
      ['OpenAI — a practical guide to building agents', 'https://cdn.openai.com/business-guides-and-resources/a-practical-guide-to-building-agents.pdf', 'reference']
    ],
    questions: [
      ['What actually distinguishes an agent from an LLM call?', 'Autonomy and consequence — many model calls in a loop, and the ability to cause effects in the world. Not capability; the underlying model is the same.'],
      ['Why is adding a write tool not an incremental change?', 'It changes the failure mode from a wrong answer to a wrong action, which may be irreversible and silent. It needs approval flows, idempotency, caps and audit logging that a read-only agent does not.'],
      ['At which level does evaluation change?', 'Around level four. Below it you can evaluate outputs; once the path varies per request you must evaluate trajectories — did it call the right tools, in a sensible order, and did it terminate.']
    ]
  },

  {
    id: 'tool-calling',
    title: 'Tool Calling',
    domain: 'agents', tier: 1, priority: 'high',
    summary: 'Giving a model a set of functions it can request, so it can do things it cannot do itself.',
    what: `Tool calling lets you describe functions to the model. When the model decides a function would help, it emits a structured call — a name and arguments — and your code executes it and returns the result.

The model never runs anything. It requests; you decide and execute.`,
    why: `It is how you fix everything a model is bad at. Arithmetic, current data, exact records, sending things — all of it becomes deterministic code the model orchestrates rather than tries to simulate. It is the single most effective technique for making an AI feature reliable.`,
    analogy: `A manager who knows what needs doing and who to ask, but does not do it personally. They cannot calculate the invoice themselves; they know to ask finance, and they know how to read the answer.`,
    technical: `You supply a schema per tool: name, description, and a JSON Schema for the arguments. The model chooses whether to call, which to call, and with what arguments. Your code validates and executes, then returns the result.

**The description is the interface.** The model reads only that text to decide whether the tool applies. A vague description is the most common cause of wrong tool selection — far more common than the model being incapable.

Design rules:
- Few, well-named tools beat many overlapping ones.
- Describe *when to use it*, not just what it does.
- State side effects explicitly ("This sends an email to the customer").
- Validate arguments before executing. The model can produce well-formed nonsense.
- Return errors as content the model can act on, not exceptions that kill the loop.
- Make anything with side effects **idempotent**, because retries happen.`,
    diagram: `
   THE FLOW — the model never executes anything

     user: "How much does Ana owe?"
              │
              ▼
     model sees the tool descriptions and decides
              │
              ▼
     {"tool": "get_balance", "input": {"email": "ana@example.com"}}
              │
              ▼
     YOUR CODE  ── validate ── authorise ── execute ──►  database
              │                                              │
              ▼◄─────────────── result ─────────────────────┘
     {"balance_cents": 4999, "currency": "INR"}
              │
              ▼
     model reads the result and answers
     "Ana owes ₹49.99." ← the NUMBER came from the database

   THE DESCRIPTION IS THE INTERFACE

     ✗ "Gets order info"
        → model calls it for refunds, invoices, shipping, anything

     ✓ "Retrieve a single order by its ID. Use when the user
        references a specific order number. Does NOT search by
        customer — use search_orders for that. READ ONLY."
        → model calls it correctly, and knows what it is not for

   ⚠ WRONG TOOL SELECTION IS USUALLY A DESCRIPTION PROBLEM,
     not a model problem.`,
    example: {
      language: 'python',
      caption: 'A tool definition, executed safely',
      code: `TOOLS = [{
    "name": "issue_refund",
    "description": (
        "Issue a refund for an order. "
        "USE WHEN: the user has explicitly requested a refund AND the "
        "order is within the refund window (check with get_policy first). "
        "DO NOT USE: to check refund eligibility — use get_policy. "
        "SIDE EFFECTS: this moves real money and sends an email to the "
        "customer. It requires human approval and cannot be undone."
    ),
    "input_schema": {
        "type": "object",
        "properties": {
            "order_id":        {"type": "string", "pattern": "^[A-Z]-[0-9]{4}$"},
            "amount_cents":    {"type": "integer", "minimum": 1},
            "reason":          {"type": "string", "maxLength": 200},
            "idempotency_key": {"type": "string",
                                "description": "Unique per refund intent. "
                                               "Reusing it makes a retry a no-op."},
        },
        "required": ["order_id", "amount_cents", "reason", "idempotency_key"],
    },
}]

def execute(name, args, user):
    # 1. SCHEMA — the model can produce well-formed nonsense
    jsonschema.validate(args, TOOL_SCHEMAS[name])

    # 2. AUTHORISE — the model's decision is not an authorisation
    if not user.can(name):
        return {"error": f"You are not permitted to use {name}."}

    # 3. BUSINESS RULES — enforce in code, never rely on the prompt
    if name == "issue_refund":
        order = db.get_order(args["order_id"])
        if not order:
            return {"error": f"Order {args['order_id']} does not exist."}
        if args["amount_cents"] > order.total_cents:
            return {"error": "Refund exceeds the order total."}
        if not approvals.granted(args["idempotency_key"]):
            return {"status": "pending_approval",
                    "message": "Queued for human approval."}

    # 4. EXECUTE — idempotent, so a retry cannot double-charge
    try:
        return {"result": HANDLERS[name](**args)}
    except Exception as e:
        # Return the error AS CONTENT so the model can recover
        return {"error": str(e)[:200]}`
    },
    prereq: ['structured-outputs', 'apis'], next: ['agent-loop'],
    related: ['what-is-an-agent', 'mcp-tools-resources', 'transactions', 'access-control'],
    tools: ['anthropic', 'openai', 'mcp', 'langgraph'],
    useCases: [
      'Delegating arithmetic, lookups and current data to deterministic code.',
      'Letting a model query real systems instead of guessing.',
      'Building any agent — tools are the prerequisite.'
    ],
    avoid: [
      'For information already in the context.',
      'Tools with overlapping purposes, which cause selection errors.',
      'Any write tool without validation, authorisation and idempotency.'
    ],
    mistakes: [
      'Vague tool descriptions, causing wrong tool selection.',
      'Trusting model-supplied arguments without validating them.',
      'Treating the model’s decision to call a tool as an authorisation.',
      'Raising exceptions on tool failure instead of returning an error the model can handle.',
      'Non-idempotent write tools, so a retry duplicates a real action.',
      'Twenty tools where five would do.'
    ],
    keyTerms: [
      ['tool / function calling', 'The model requesting a described function.'],
      ['tool schema', 'Name, description and JSON Schema for arguments.'],
      ['tool description', 'The text the model reads to decide relevance. The real interface.'],
      ['tool result', 'What your code returns to the model.'],
      ['idempotency key', 'Makes a repeated call a no-op.'],
      ['authorisation', 'Checking the user may do this. Separate from the model deciding to.'],
      ['side effect', 'A real-world change. Must be stated in the description.']
    ],
    resources: [
      ['Anthropic — tool use overview', 'https://docs.anthropic.com/en/docs/build-with-claude/tool-use/overview', 'docs'],
      ['Anthropic — tool use best practices', 'https://docs.anthropic.com/en/docs/build-with-claude/tool-use/implement-tool-use', 'docs'],
      ['OpenAI — function calling', 'https://platform.openai.com/docs/guides/function-calling', 'docs'],
      ['Model Context Protocol — tools', 'https://modelcontextprotocol.io/docs/concepts/tools', 'docs']
    ],
    questions: [
      ['Why is the tool description the most important part?', 'It is the only thing the model reads when deciding whether the tool applies. Wrong tool selection is almost always a description problem, not a model capability problem.'],
      ['Why must tool arguments be validated?', 'The model can produce well-formed arguments that are semantically wrong — a non-existent order id, a refund larger than the order. Schema validation catches shape; business rules must be enforced in code.'],
      ['Why must write tools be idempotent?', 'Agents retry on failure or timeout. Without an idempotency key, a retry after a lost response performs the action twice — a double refund or a duplicate email.']
    ]
  },

  {
    id: 'agent-loop',
    title: 'The Agent Loop',
    domain: 'agents', tier: 1, priority: 'high',
    summary: 'Reason, act, observe, repeat — and the conditions under which it stops.',
    what: `The agent loop is the cycle: the model reasons about the current state, chooses an action, the system executes it, the observation is added to the context, and the cycle repeats until a termination condition is met.`,
    why: `Everything expensive and everything dangerous about agents lives in this loop. Cost grows with iterations, context grows with observations, and without an explicit stop condition it does not stop.`,
    analogy: `A person working through an unfamiliar task. Try something, look at the result, adjust, try again. Useful — as long as they eventually stop, and as long as somebody set a budget.`,
    technical: `Each iteration appends the model's decision and the tool result to the message history, so **context grows monotonically**. A ten-step agent may be sending 30,000 tokens by the final call, which is why cost grows super-linearly with steps.

Termination conditions, all of which you must implement:
- **Success** — the model produces a final answer.
- **Step cap** — a hard maximum on iterations.
- **Token/cost budget** — a ceiling per request.
- **Wall-clock timeout** — for user-facing features.
- **Repeated failure** — the same tool failing several times means stop, not retry forever.
- **No progress** — the same action repeated with the same result.

Handle tool errors *inside* the loop: return the error as an observation so the model can adapt. Raising an exception discards everything learned so far.

Log the full trajectory. It is the only way to debug an agent, and the only way to evaluate one.`,
    diagram: `
   THE LOOP

     goal
      │
      ▼
   ┌─────────────────────────────────────────────┐
   │  1. REASON   model reads goal + everything   │
   │              observed so far                 │
   │  2. ACT      emits a tool call               │
   │  3. EXECUTE  your code runs it               │
   │  4. OBSERVE  result appended to context      │
   └──────────────────┬──────────────────────────┘
                      │
              termination check
                      │
      ┌───────────────┼──────────────┬─────────────┐
   success        step cap      budget cap     no progress
      │               │              │             │
      ▼               ▼              ▼             ▼
   answer         give up        give up      give up
                  (and LOG)      (and LOG)    (and LOG)

   CONTEXT GROWS EVERY STEP — this is the cost driver

     step 1   1,200 tokens
     step 2   2,800 tokens   (+ decision + observation)
     step 3   4,900 tokens
     step 5  11,400 tokens
     step 8  27,600 tokens   ← the same request, 23x the input

   Cost grows SUPER-LINEARLY with steps. An 8-step agent is
   not 8x a 1-step agent; it is closer to 20x.

   ⚠ EVERY TERMINATION CONDITION MUST BE IMPLEMENTED.
     "The model will stop when it is done" is not one of them.`,
    example: {
      language: 'python',
      caption: 'A loop with every termination condition wired in',
      code: `import time

def agent_loop(goal, llm, executor, *, max_steps=8, max_tokens=40_000,
               timeout_s=45):
    messages = [{"role": "user", "content": goal}]
    trace, tokens, started = [], 0, time.monotonic()
    recent_actions = []

    for step in range(max_steps):
        # ── termination checks BEFORE spending more ──────────
        if tokens > max_tokens:
            return stop("budget_exceeded", trace, tokens, step)
        if time.monotonic() - started > timeout_s:
            return stop("timeout", trace, tokens, step)

        reply = llm(messages, tools=TOOLS)
        tokens += reply.usage.total

        if reply.stop_reason != "tool_use":                 # SUCCESS
            return {"status": "done", "answer": reply.text,
                    "steps": step + 1, "tokens": tokens, "trace": trace}

        call = reply.tool_calls[0]
        signature = (call.name, json.dumps(call.input, sort_keys=True))

        # ── no-progress guard: same action, same input, 3x ───
        recent_actions.append(signature)
        if recent_actions[-3:].count(signature) == 3:
            return stop("no_progress", trace, tokens, step)

        # ── tool errors are OBSERVATIONS, not exceptions ─────
        result = executor.run(call.name, call.input)   # returns {"error"} on failure
        trace.append({"step": step, "tool": call.name,
                      "input": call.input,
                      "ok": "error" not in result})

        # ── repeated failure guard ───────────────────────────
        failures = sum(1 for t in trace[-3:] if not t["ok"])
        if failures >= 3:
            return stop("repeated_failure", trace, tokens, step)

        messages += [{"role": "assistant", "content": reply.raw},
                     {"role": "user", "content": tool_result(call.id, result)}]

    return stop("step_cap", trace, tokens, max_steps)


def stop(reason, trace, tokens, steps):
    log.warning("agent stopped: %s after %d steps, %d tokens", reason, steps, tokens)
    return {"status": reason, "trace": trace, "tokens": tokens, "steps": steps}`
    },
    prereq: ['tool-calling', 'loops'], next: ['planning', 'agent-memory'],
    related: ['agent-failure-modes', 'termination-conditions', 'ai-cost', 'tracing'],
    tools: ['langgraph', 'anthropic'],
    useCases: [
      'Implementing an agent with bounded cost and latency.',
      'Diagnosing why an agent gave up or ran away.',
      'Building the trace that makes evaluation possible.'
    ],
    avoid: [
      'A loop with no cap, ever.',
      'Swallowing tool errors silently instead of feeding them back.'
    ],
    mistakes: [
      'Only implementing the success condition, so failure means running forever.',
      'Raising on tool error, discarding everything the agent learned.',
      'Not logging the trajectory, making the agent undebuggable.',
      'Forgetting that context grows every step, so cost is super-linear.',
      'No no-progress guard, so the agent repeats the same failing action until the cap.'
    ],
    keyTerms: [
      ['agent loop', 'The reason-act-observe cycle.'],
      ['observation', 'A tool result appended to the context.'],
      ['termination condition', 'Any rule that ends the loop.'],
      ['step cap', 'Maximum iterations.'],
      ['token budget', 'Maximum spend per request.'],
      ['no-progress guard', 'Detecting the same action repeating with the same result.'],
      ['trajectory / trace', 'The full recorded sequence. Essential for debugging.']
    ],
    resources: [
      ['ReAct (paper)', 'https://arxiv.org/abs/2210.03629', 'paper'],
      ['Anthropic — building effective agents', 'https://www.anthropic.com/engineering/building-effective-agents', 'reference'],
      ['LangGraph — persistence and control', 'https://langchain-ai.github.io/langgraph/concepts/persistence/', 'docs'],
      ['Anthropic — tool use', 'https://docs.anthropic.com/en/docs/build-with-claude/tool-use/overview', 'docs']
    ],
    questions: [
      ['Why does agent cost grow super-linearly with steps?', 'Every decision and observation is appended to the context, so each model call is larger than the last. An eight-step agent may be sending twenty times the tokens of a one-step call.'],
      ['Why should tool errors be returned as observations rather than raised?', 'An exception discards everything the agent has learned. Returning the error as content lets the model adapt — try different arguments, or a different tool.'],
      ['What is a no-progress guard?', 'A check for the same action with the same input repeating. Without it, an agent can burn its entire step budget retrying something that will never work.']
    ]
  },

  {
    id: 'planning',
    title: 'Planning',
    domain: 'agents', tier: 2, priority: 'medium',
    summary: 'Producing a sequence of steps before executing, rather than deciding one step at a time.',
    what: `A planning agent first produces a plan — an ordered list of steps — and then executes it, possibly revising as it goes. A reactive agent decides only the next action at each turn.`,
    why: `Planning makes the agent's intent inspectable *before* anything happens, which is what enables human approval of a whole workflow rather than every individual action. It also improves coherence on tasks with dependencies.`,
    analogy: `Writing an itinerary before a trip versus deciding at each junction. The itinerary can be reviewed and approved by someone else; the improvised route cannot be, until it has already happened.`,
    technical: `Patterns:
- **Plan-and-execute** — generate the full plan, then run it. Most inspectable; brittle if reality diverges.
- **Plan-and-revise** — replan after each step or on failure. More robust, more model calls.
- **Hierarchical** — decompose into sub-goals, plan within each.

The real product benefit is **approval granularity**. Showing a user "I will do these four things" and getting one approval is far better UX than four separate confirmations, and far safer than none.

Costs: an extra model call up front, and a plan that can be confidently wrong. Always validate the plan before executing — do the referenced entities exist, are the tools permitted, is the order coherent.

For most tasks a reactive loop with good tools is sufficient. Planning earns its place when steps have dependencies, when the user should approve before execution, or when partial failure needs a considered recovery.`,
    diagram: `
   REACTIVE                       PLANNING

   decide → act → observe         PLAN:
   decide → act → observe           1. look up order A-8821
   decide → act → observe           2. check refund policy
   ...                              3. verify eligibility
                                    4. issue refund  ⚠ needs approval
   intent visible only              │
   in hindsight                     ▼
                                  SHOW THE PLAN TO THE USER
                                    │
                                  ONE approval for the whole workflow
                                    │
                                    ▼
                                  execute steps 1-4, revising on failure

   WHY PLANNING IS A UX FEATURE

     without a plan   4 separate "are you sure?" prompts
                      OR no approval at all
     with a plan      1 approval, with the full intent visible
                      and any dangerous step flagged in advance

   ⚠ A PLAN CAN BE CONFIDENTLY WRONG

     "1. look up order A-9999"   ← that order does not exist

     Validate the plan BEFORE executing:
       do referenced entities exist?
       are all tools permitted for this user?
       does any step have side effects needing approval?
       is the ordering coherent?`,
    example: {
      language: 'python',
      caption: 'Plan, validate, approve, then execute with revision',
      code: `PLAN_SCHEMA = {
    "type": "object",
    "properties": {
        "steps": {"type": "array", "items": {
            "type": "object",
            "properties": {
                "n":       {"type": "integer"},
                "tool":    {"type": "string"},
                "input":   {"type": "object"},
                "purpose": {"type": "string"},
            },
            "required": ["n", "tool", "input", "purpose"],
        }},
        "needs_approval": {"type": "boolean"},
    },
    "required": ["steps", "needs_approval"],
}

def plan_and_execute(goal, llm, executor, user):
    plan = llm.structured(PLAN_PROMPT.format(goal=goal, tools=describe(TOOLS)),
                          schema=PLAN_SCHEMA)

    # 1. VALIDATE THE PLAN before anything happens
    problems = []
    for s in plan["steps"]:
        if s["tool"] not in TOOL_NAMES:
            problems.append(f"step {s['n']}: unknown tool {s['tool']}")
        elif not user.can(s["tool"]):
            problems.append(f"step {s['n']}: not permitted to use {s['tool']}")
        elif WRITES[s["tool"]]:
            plan["needs_approval"] = True          # do not trust the model's flag
    if problems:
        return {"status": "invalid_plan", "problems": problems}

    # 2. ONE approval for the whole workflow
    if plan["needs_approval"] and not approve_with_user(plan):
        return {"status": "declined_by_user", "plan": plan}

    # 3. EXECUTE, revising on failure
    results = []
    for s in plan["steps"]:
        outcome = executor.run(s["tool"], s["input"])
        results.append({"step": s["n"], "outcome": outcome})

        if "error" in outcome:
            revised = llm.structured(REPLAN_PROMPT.format(
                goal=goal, done=results, failed=s, error=outcome["error"]),
                schema=PLAN_SCHEMA)
            if revised["needs_approval"] and not approve_with_user(revised):
                return {"status": "declined_after_replan", "results": results}
            plan["steps"] = revised["steps"]       # continue with the new plan

    return {"status": "done", "plan": plan, "results": results}`
    },
    prereq: ['agent-loop'], next: ['agent-memory'],
    related: ['human-in-the-loop', 'agent-failure-modes', 'chain-of-thought', 'ai-ux'],
    tools: ['langgraph', 'anthropic'],
    useCases: [
      'Workflows where steps depend on each other.',
      'Anything needing user approval before execution.',
      'Tasks where partial failure needs a considered recovery.'
    ],
    avoid: [
      'Simple one or two step tasks, where planning is pure overhead.',
      'Highly dynamic environments where the plan is stale by step two.',
      'When latency is tight — planning adds a full model call.'
    ],
    mistakes: [
      'Executing the plan without validating it first.',
      'Trusting the model’s own "needs_approval" flag instead of deriving it from the tools.',
      'No revision path, so a single failed step aborts everything.',
      'Planning for tasks simple enough that a reactive loop is better.'
    ],
    keyTerms: [
      ['plan-and-execute', 'Generate the whole plan, then run it.'],
      ['replanning', 'Revising the plan after a failure or new information.'],
      ['hierarchical planning', 'Decomposing into sub-goals.'],
      ['plan validation', 'Checking the plan is executable and permitted before running it.'],
      ['approval granularity', 'Approving a workflow rather than each action.'],
      ['reactive agent', 'Decides only the next step, with no plan.']
    ],
    resources: [
      ['Plan-and-Solve prompting (paper)', 'https://arxiv.org/abs/2305.04091', 'paper'],
      ['LangGraph — plan and execute', 'https://langchain-ai.github.io/langgraph/tutorials/plan-and-execute/plan-and-execute/', 'tutorial'],
      ['Anthropic — building effective agents', 'https://www.anthropic.com/engineering/building-effective-agents', 'reference']
    ],
    questions: [
      ['What is the main product benefit of planning?', 'Approval granularity. The user sees "I will do these four things" and gives one approval, instead of four separate confirmations or none at all.'],
      ['Why must a plan be validated before execution?', 'A plan can be confidently wrong — referencing an order that does not exist or a tool the user may not use. Validation catches that before any step has an effect.'],
      ['Why not trust the model’s own needs_approval flag?', 'It is a model output and can be wrong. Derive it from whether any planned tool has side effects, which is a fact your code knows.']
    ]
  },

  {
    id: 'agent-memory',
    title: 'Agent Memory & State',
    domain: 'agents', tier: 2, priority: 'medium',
    summary: 'What an agent carries between steps and between sessions — and where it should actually live.',
    what: `Agents need to remember things: what they have already tried within a task, and what they learned about a user across sessions. Neither happens automatically, because the model itself is stateless.`,
    why: `Without within-task memory an agent repeats itself. Without cross-session memory it re-asks questions the user already answered. But naive memory — dumping the whole history back in — blows the context window and the budget.`,
    analogy: `A colleague's notebook versus their conversation. The notebook holds durable facts they refer back to. The conversation is what has been said in this meeting. Confusing the two means either forgetting everything or reciting the whole notebook every time you speak.`,
    technical: `Three distinct kinds:

**Working memory** — the message history within one task. Grows every step. Manage by summarising older steps or extracting outcomes rather than carrying raw tool output.

**Episodic memory** — what happened in previous sessions. Store as structured records, retrieve the relevant ones.

**Semantic memory** — durable facts about the user or domain. Store as **structured state**, not transcript: \`{plan: "pro", timezone: "IST", prefers: "short answers"}\`.

The strong recommendation: prefer **structured state over raw transcript**. Four key-value pairs replace forty turns, never drift, and cannot be truncated at the wrong point.

Memory that writes automatically needs care — an agent that "remembers" a wrong inference will act on it repeatedly. Make memory writes explicit, inspectable and correctable, and treat them as a privacy surface: memory persists personal data, which brings retention and deletion obligations.`,
    diagram: `
   THREE KINDS, THREE PLACES

   WORKING          within one task
     what have I already tried in this loop?
     lives in: the message history
     problem:  grows every step
     manage:   summarise old steps, keep OUTCOMES not raw output

   EPISODIC         across sessions
     what happened last time this user came?
     lives in: a database of session records
     manage:   retrieve only the relevant ones

   SEMANTIC         durable facts
     what is true about this user?
     lives in: STRUCTURED STATE
     { plan: "pro", timezone: "IST", open_ticket: "TKT-4471" }

   TRANSCRIPT vs STATE

     transcript   40 turns · 6,400 tokens · drifts · truncates badly
     state        4 fields ·    40 tokens · exact · never truncates

     Prefer state. Extract it deliberately.

   ⚠ MEMORY IS A PRIVACY SURFACE

     it persists personal data
       → retention policy
       → deletion on request
       → do not store what you do not need
       → a wrong "remembered" fact is acted on repeatedly`,
    example: {
      language: 'python',
      caption: 'Extracting structured state instead of carrying a transcript',
      code: `STATE_SCHEMA = {
    "type": "object",
    "properties": {
        "confirmed_email":  {"type": ["string", "null"]},
        "plan":             {"type": ["string", "null"]},
        "open_order_id":    {"type": ["string", "null"]},
        "resolved_issues":  {"type": "array", "items": {"type": "string"}},
        "user_preferences": {"type": "array", "items": {"type": "string"}},
    },
    "required": ["confirmed_email", "plan", "open_order_id"],
}

def update_state(existing, new_turns, llm):
    """Extract durable facts. Never store speculation."""
    extracted = llm.structured(
        "Update the state from the conversation. Only record facts the user "
        "explicitly stated or that a tool returned. Never infer. Leave a field "
        "null if it was not confirmed.\\n\\n"
        f"Current state:\\n{json.dumps(existing)}\\n\\n"
        f"New turns:\\n{format_turns(new_turns)}",
        schema=STATE_SCHEMA,
    )
    # Only overwrite with non-null values — never lose a confirmed fact
    return {k: (v if v not in (None, []) else existing.get(k))
            for k, v in extracted.items()}


def build_agent_context(state, working_memory, goal):
    """40 tokens of state beats 6,400 tokens of transcript."""
    return [
        {"role": "system", "content": SYSTEM},
        {"role": "user", "content":
            f"Known about this user:\\n{format_state(state)}\\n\\n"
            f"Already attempted this session:\\n{summarise(working_memory)}\\n\\n"
            f"Task: {goal}"},
    ]

# Working memory: keep OUTCOMES, not raw tool output
#   raw:     {"orders": [ …800 tokens of JSON… ]}
#   outcome: "searched orders for ana@example.com — found 3, most recent A-8821"`
    },
    prereq: ['agent-loop', 'message-roles'], next: ['reflection-retries'],
    related: ['context-engineering', 'privacy-pii', 'context-compression'],
    tools: ['langgraph', 'qdrant'],
    useCases: [
      'Assistants that should not re-ask what the user already answered.',
      'Long-running tasks where the agent must not repeat itself.',
      'Personalisation without fine-tuning.'
    ],
    avoid: [
      'Storing raw transcripts as memory — expensive and drifts.',
      'Remembering inferences rather than stated facts.',
      'Persisting personal data you do not have a reason and a policy for.'
    ],
    mistakes: [
      'Carrying the full history forward and hitting the context limit mid-task.',
      'Storing raw tool output in working memory instead of the outcome.',
      'Automatic memory writes with no inspection, so a wrong fact is acted on repeatedly.',
      'Treating memory as a feature rather than a privacy surface with retention obligations.',
      'No way for a user to see or correct what was remembered.'
    ],
    keyTerms: [
      ['working memory', 'What happened within the current task.'],
      ['episodic memory', 'Records of previous sessions.'],
      ['semantic memory', 'Durable facts about the user or domain.'],
      ['structured state', 'Extracted key facts rather than transcript.'],
      ['memory write', 'Committing something to durable memory. Should be explicit.'],
      ['retention policy', 'How long remembered data is kept.'],
      ['outcome summarisation', 'Storing what a tool call achieved, not its raw output.']
    ],
    resources: [
      ['LangGraph — memory', 'https://langchain-ai.github.io/langgraph/concepts/memory/', 'docs'],
      ['Anthropic — building effective agents', 'https://www.anthropic.com/engineering/building-effective-agents', 'reference'],
      ['MemGPT / Letta (paper)', 'https://arxiv.org/abs/2310.08560', 'paper']
    ],
    questions: [
      ['Why prefer structured state over a transcript?', 'Four key-value pairs replace forty turns at a fraction of the tokens, they cannot be truncated at the wrong point, and they do not drift as a summary would.'],
      ['What should working memory store from a tool call?', 'The outcome, not the raw output. "Searched orders for ana@example.com — found 3, most recent A-8821" replaces 800 tokens of JSON.'],
      ['Why is agent memory a privacy surface?', 'It persists personal data, which brings retention and deletion obligations. It also means a wrongly remembered fact gets acted on repeatedly, so memory writes should be inspectable and correctable.']
    ]
  },

  {
    id: 'reflection-retries',
    title: 'Reflection & Retries',
    domain: 'agents', tier: 2, priority: 'medium',
    summary: 'Letting an agent check its own work and try again — within strict limits.',
    what: `Reflection is asking the model to evaluate its own output or plan before committing to it. Retrying is attempting a failed action again, ideally with something changed.`,
    why: `Both genuinely improve reliability, and both are easy to implement badly. Unbounded retries burn budget on something that will never succeed, and self-evaluation is systematically optimistic about its own work.`,
    analogy: `Proofreading your own writing. It catches real errors, and it reliably misses the ones you are blind to. A second pair of eyes catches a different, larger set.`,
    technical: `**Reflection** works better when it is *specific* than when it is general. "Is this good?" produces agreement. "Does every claim in this answer appear in the context? List any that do not" produces useful corrections.

It is stronger still when the critic has different information — a separate model, a different prompt, or access to a checker the generator did not have.

**Retries** must change something. Retrying an identical call with identical arguments produces an identical failure. Vary the arguments, use a different tool, or escalate.

Rules that keep both bounded:
- Cap retries per action (2–3) and per task.
- Use exponential backoff for transient failures.
- Never retry a validation error — it will fail identically forever.
- Never retry a non-idempotent write without an idempotency key.
- Count reflection passes against the same budget as everything else.

Reflection roughly doubles the cost of a step. Apply it where errors are expensive, not everywhere.`,
    diagram: `
   REFLECTION — specific beats general

     ✗ "Is this answer good?"
        → "Yes, this answer is comprehensive and well-structured."
        → almost always agreement. Useless.

     ✓ "List every claim in this answer that does NOT appear in
        the context. If there are none, output NONE."
        → "The 3-5 business days figure is not in the context."
        → actionable

   STRONGER STILL: A CRITIC WITH DIFFERENT INFORMATION

     generator ──► answer ──► critic that can RUN THE CODE
                                    or CHECK THE DATABASE
                                    or has a different prompt

     Self-critique is optimistic. Independent critique is not.

   RETRIES — something must change

     attempt 1  get_order("A-9999")  → not found
     attempt 2  get_order("A-9999")  → not found   ← pointless
     attempt 2  search_orders(email) → found A-8821 ← useful

   WHAT TO RETRY AND WHAT NOT TO

     transient (timeout, 429, 503)    retry with backoff  ✓
     validation error                 NEVER — identical forever  ✗
     not found                        try a DIFFERENT approach
     permission denied                escalate, do not retry  ✗
     non-idempotent write             only with an idempotency key

   ⚠ REFLECTION ROUGHLY DOUBLES STEP COST.
     Apply it where being wrong is expensive.`,
    example: {
      language: 'python',
      caption: 'Bounded retries and a specific, actionable reflection pass',
      code: `import time

NON_RETRYABLE = {"validation_error", "permission_denied", "not_found"}

def call_with_retry(tool, args, executor, max_attempts=3):
    for attempt in range(max_attempts):
        result = executor.run(tool, args)
        if "error" not in result:
            return result

        kind = classify_error(result["error"])
        if kind in NON_RETRYABLE:
            return result                       # retrying cannot help
        if attempt < max_attempts - 1:
            time.sleep(2 ** attempt)            # 1s, 2s — backoff
    return result


REFLECT = """Check the DRAFT against the CONTEXT.

List every factual claim in the DRAFT that does not appear in the CONTEXT.
Output JSON: {{"unsupported": ["...", "..."], "verdict": "pass"|"revise"}}
If every claim is supported, output {{"unsupported": [], "verdict": "pass"}}.

Do not comment on style, tone or completeness. Only support.

CONTEXT:
{context}

DRAFT:
{draft}"""

def generate_with_reflection(question, context, llm, max_revisions=1):
    draft = llm(ANSWER_PROMPT.format(context=context, question=question))

    for _ in range(max_revisions):              # BOUNDED
        review = llm.structured(
            REFLECT.format(context=context, draft=draft), schema=REFLECT_SCHEMA)

        if review["verdict"] == "pass":
            return {"answer": draft, "revised": False}

        log.info("reflection flagged: %s", review["unsupported"])
        draft = llm(REVISE_PROMPT.format(
            draft=draft, context=context,
            remove=review["unsupported"]))      # SPECIFIC instruction

    return {"answer": draft, "revised": True}

# Note the reflection prompt asks ONE narrow question and forbids
# style commentary. General "is this good?" reflection produces
# agreement and costs a full model call for nothing.`
    },
    prereq: ['agent-loop', 'exceptions'], next: ['termination-conditions'],
    related: ['llm-as-judge', 'groundedness', 'agent-failure-modes', 'judge-bias'],
    tools: ['langgraph', 'deepeval'],
    useCases: [
      'Catching unsupported claims before an answer is shown.',
      'Recovering from transient tool failures.',
      'Validating a plan before execution.'
    ],
    avoid: [
      'General "is this good?" reflection — it produces agreement.',
      'Retrying validation or permission errors.',
      'Reflection on every step when errors are cheap.'
    ],
    mistakes: [
      'Unbounded retries, burning budget on something that cannot succeed.',
      'Retrying the identical call with identical arguments.',
      'Retrying a non-idempotent write and duplicating a real action.',
      'Trusting self-critique as if it were independent review.',
      'Not counting reflection passes against the task budget.'
    ],
    keyTerms: [
      ['reflection', 'The model evaluating its own output.'],
      ['self-critique', 'Reflection by the same model. Systematically optimistic.'],
      ['critic model', 'A separate evaluator, ideally with different information.'],
      ['exponential backoff', 'Waiting progressively longer between retries.'],
      ['non-retryable error', 'One that will fail identically on retry.'],
      ['retry budget', 'A cap on attempts per action and per task.'],
      ['specific critique', 'A narrow, checkable question rather than a general one.']
    ],
    resources: [
      ['Reflexion (paper)', 'https://arxiv.org/abs/2303.11366', 'paper'],
      ['Anthropic — building effective agents', 'https://www.anthropic.com/engineering/building-effective-agents', 'reference'],
      ['tenacity — retry library', 'https://tenacity.readthedocs.io/', 'repo'],
      ['Google SRE Book — addressing cascading failures', 'https://sre.google/sre-book/addressing-cascading-failures/', 'reference']
    ],
    questions: [
      ['Why does general reflection fail?', 'Asking "is this good?" reliably produces agreement. A narrow, checkable question — "list every claim not supported by the context" — produces actionable corrections.'],
      ['What must change between retry attempts?', 'Something. An identical call with identical arguments produces an identical failure. Vary the arguments, use a different tool, or escalate.'],
      ['Which errors should never be retried?', 'Validation errors, permission denials and not-found results. They are deterministic and will fail identically forever, so retrying only burns budget.']
    ]
  },

  {
    id: 'termination-conditions',
    title: 'Termination Conditions',
    domain: 'agents', tier: 2, priority: 'high',
    summary: 'Every way an agent must be able to stop — because "when it is done" is not enough.',
    what: `A termination condition is any rule that ends the agent loop. Success is one of them. The others are what stop a failing agent from running indefinitely.`,
    why: `An agent without explicit stops is an unbounded liability. Cost, latency and blast radius are all determined by when it stops, and none of them are bounded by the model deciding it is finished.`,
    analogy: `A taxi with no destination and no meter limit. It will keep driving as long as the passenger keeps saying "a bit further". The fare is decided by whoever set a limit — and if nobody did, there is no limit.`,
    technical: `The full set you should implement:

- **Goal reached** — the model returns a final answer. The happy path.
- **Step cap** — hard maximum iterations. 5–10 for most tasks.
- **Token/cost budget** — a spend ceiling per request.
- **Wall-clock timeout** — for anything user-facing.
- **No progress** — the same action with the same result repeating.
- **Repeated failure** — N consecutive tool failures.
- **Confidence floor** — the agent explicitly says it cannot proceed.
- **User cancellation** — the user must be able to stop it.
- **Guardrail trip** — a safety or policy check fires.

**Every non-success termination must be logged with its trajectory.** Stop reasons are your best signal: a rising step-cap rate means the tools are inadequate; a rising no-progress rate means a tool is broken.

Design the failure UX deliberately. "I could not complete this — here is what I tried, shall I pass it to a person?" is a good outcome. Silence is not.`,
    diagram: `
   NINE WAYS TO STOP — implement all of them

     ✓ goal reached          model returns a final answer
     ⏱ step cap              max iterations       (5-10 typical)
     💰 token budget          spend ceiling per request
     ⏰ wall-clock timeout    user-facing latency limit
     🔁 no progress          same action, same result, repeating
     ✗ repeated failure      N consecutive tool errors
     🤷 confidence floor     agent says it cannot proceed
     🛑 user cancellation    the user can always stop it
     🚨 guardrail trip       a safety or policy check fires

   STOP REASONS ARE YOUR BEST TELEMETRY

     stop reason        this week   last week
     ────────────       ─────────   ─────────
     goal reached          82%         91%
     step cap              11%          4%   ← tools inadequate?
     no progress            4%          1%   ← a tool is broken?
     repeated failure       2%          3%
     user cancelled         1%          1%

     The step-cap rate tripling is a product signal, not noise.

   THE FAILURE UX IS A DESIGN DECISION

     ✗ silence, or a generic error
     ✓ "I could not complete this. I checked your order and the
        refund policy, but could not confirm eligibility.
        Shall I pass this to a human agent?"
        ...and show what was tried.`,
    example: {
      language: 'python',
      caption: 'Termination as a first-class object, with telemetry',
      code: `from dataclasses import dataclass, field
import time

@dataclass
class Budget:
    max_steps: int = 8
    max_tokens: int = 40_000
    max_seconds: float = 45.0
    max_consecutive_failures: int = 3
    max_repeats: int = 3

    steps: int = 0
    tokens: int = 0
    started: float = field(default_factory=time.monotonic)
    consecutive_failures: int = 0
    recent: list = field(default_factory=list)

    def should_stop(self, cancelled=False):
        if cancelled:
            return "user_cancelled"
        if self.steps >= self.max_steps:
            return "step_cap"
        if self.tokens >= self.max_tokens:
            return "token_budget"
        if time.monotonic() - self.started >= self.max_seconds:
            return "timeout"
        if self.consecutive_failures >= self.max_consecutive_failures:
            return "repeated_failure"
        if len(self.recent) >= self.max_repeats and \\
           len(set(self.recent[-self.max_repeats:])) == 1:
            return "no_progress"
        return None

def finish(reason, budget, trace):
    # EVERY non-success stop is logged with its trajectory
    log.info("agent stop", extra={"reason": reason, "steps": budget.steps,
                                  "tokens": budget.tokens, "trace": trace})
    metrics.increment("agent.stop", tags={"reason": reason})

    return {
        "status": reason,
        "message": FAILURE_MESSAGES.get(reason, GENERIC_FAILURE),
        "attempted": [t["tool"] for t in trace],     # show the user what was tried
        "offer_escalation": reason != "user_cancelled",
    }

FAILURE_MESSAGES = {
    "step_cap": "I could not complete this within the steps available.",
    "timeout": "This is taking longer than expected.",
    "repeated_failure": "I could not reach one of the systems I need.",
    "no_progress": "I was not making progress on this.",
    "token_budget": "This request grew larger than expected.",
}`
    },
    prereq: ['agent-loop'], next: ['agent-failure-modes'],
    related: ['ai-cost', 'ai-latency', 'failure-rates', 'reflection-retries'],
    tools: ['langgraph', 'opentelemetry'],
    useCases: [
      'Bounding cost and latency for an agent feature.',
      'Turning stop reasons into a product signal.',
      'Designing what the user sees when the agent gives up.'
    ],
    avoid: [
      'Relying only on the success condition.',
      'Silent failure with a generic error message.'
    ],
    mistakes: [
      'Implementing only the step cap and assuming that covers everything.',
      'Not logging stop reasons, losing the most useful telemetry an agent produces.',
      'No user cancellation, so the user watches something they cannot stop.',
      'No designed failure message, so giving up looks like a crash.',
      'Setting the step cap high "just in case", which multiplies worst-case cost.'
    ],
    keyTerms: [
      ['termination condition', 'Any rule that ends the loop.'],
      ['step cap', 'Maximum iterations.'],
      ['token budget', 'Maximum spend per request.'],
      ['no progress', 'The same action repeating with the same result.'],
      ['stop reason', 'Why the loop ended. Key telemetry.'],
      ['graceful failure', 'A designed, informative give-up path.'],
      ['user cancellation', 'The user’s ability to stop the agent.']
    ],
    resources: [
      ['Anthropic — building effective agents', 'https://www.anthropic.com/engineering/building-effective-agents', 'reference'],
      ['LangGraph — recursion limit and control', 'https://langchain-ai.github.io/langgraph/concepts/low_level/', 'docs'],
      ['Google SRE Book — handling overload', 'https://sre.google/sre-book/handling-overload/', 'reference']
    ],
    questions: [
      ['Why is "the model stops when it is done" insufficient?', 'It is the only condition that requires the agent to succeed. Every failure mode — a broken tool, an impossible task, a loop — needs its own explicit stop, or the loop runs until something else breaks.'],
      ['Why are stop reasons valuable telemetry?', 'A rising step-cap rate means the tools are inadequate for the tasks arriving. A rising no-progress rate usually means a tool is broken. Both are product signals visible nowhere else.'],
      ['What makes a good failure UX for an agent?', 'Telling the user it could not complete the task, showing what it tried, and offering escalation. Silence or a generic error wastes the work already done and looks like a crash.']
    ]
  },

  {
    id: 'agent-failure-modes',
    title: 'Agent Failure Modes',
    domain: 'agents', tier: 2, priority: 'high',
    summary: 'The specific ways agents go wrong, and the control that prevents each.',
    what: `A catalogue of agent-specific failures — distinct from LLM failures, because they involve actions, loops and real consequences.`,
    why: `Agent failures are more expensive than chat failures and less visible, because they happen inside a loop nobody is watching. Knowing the catalogue lets you design the controls before the incident rather than after.`,
    analogy: `Failure modes in an autonomous system. Each one has a specific engineering control — a limit switch, an interlock, a dead-man's handle. You do not prevent them with better intentions; you prevent them with mechanisms.`,
    technical: `The catalogue:

**1. Infinite / long loop** — never reaches a stopping state. Control: step cap, no-progress guard.
**2. Wrong tool selection** — calls the wrong function. Control: clearer descriptions, fewer overlapping tools.
**3. Hallucinated tool call** — invents a tool or a parameter. Control: schema validation, reject unknown names.
**4. Hallucinated arguments** — well-formed but false, such as an invented order id. Control: verify entities exist before acting.
**5. Cascading error** — an early wrong observation poisons everything after it. Control: validate tool results, and reset rather than repair.
**6. Prompt injection via tool output** — retrieved content contains instructions. Control: least privilege, treat tool output as untrusted.
**7. Skipping tools** — answers from memory instead of looking things up. Control: instruct explicitly, and detect zero-tool trajectories.
**8. Runaway cost** — unbounded token spend. Control: budget cap.
**9. Irreversible wrong action** — the expensive one. Control: human approval, idempotency, reversibility by design.

The unifying principle is **least privilege**. Most catastrophic failures require a capability the agent did not need.`,
    diagram: `
   FAILURE                  SYMPTOM                  CONTROL

   infinite loop            never finishes           step cap +
                                                     no-progress guard

   wrong tool               odd, irrelevant actions  better descriptions,
                                                     fewer tools

   hallucinated tool        unknown tool name        reject unknown names

   hallucinated arguments   "order A-9999"           verify entities exist
                            (does not exist)         BEFORE acting

   cascading error          confidently wrong        validate tool results;
                            after step 2             reset, do not repair

   injection via tool       agent does something     LEAST PRIVILEGE;
   output                   nobody asked for         tool output is untrusted

   skipped retrieval        answers from memory      detect zero-tool
                                                     trajectories

   runaway cost             $$$                      token budget

   irreversible action      refund to the wrong      human approval +
                            customer, silently       idempotency +
                                                     reversibility

   ⚠ THE UNIFYING CONTROL

     Most catastrophic failures require a capability the agent
     did not need. An agent without send_email cannot be made
     to send email — by injection, by confusion, or by bug.

     LEAST PRIVILEGE BEATS EVERY PROMPT-LEVEL DEFENCE.`,
    example: {
      language: 'python',
      caption: 'Controls mapped one-to-one onto failure modes',
      code: `def guarded_execute(call, budget, trace, user):
    # 3. HALLUCINATED TOOL — the model invented a function
    if call.name not in TOOL_REGISTRY:
        return {"error": f"No tool named {call.name}. Available: "
                         f"{', '.join(TOOL_REGISTRY)}"}

    # 3b. schema validation catches invented or malformed parameters
    try:
        jsonschema.validate(call.input, TOOL_REGISTRY[call.name]["schema"])
    except jsonschema.ValidationError as e:
        return {"error": f"Invalid arguments: {e.message}"}

    # 4. HALLUCINATED ARGUMENTS — well-formed but false
    if "order_id" in call.input:
        if not db.order_exists(call.input["order_id"]):
            return {"error": f"Order {call.input['order_id']} does not exist. "
                             f"Use search_orders to find the correct id."}

    # 6/9. LEAST PRIVILEGE + APPROVAL for anything irreversible
    if TOOL_REGISTRY[call.name]["writes"]:
        if not user.can(call.name):
            return {"error": "Not permitted."}
        if not approvals.granted(call.input.get("idempotency_key")):
            return {"status": "pending_approval"}

    result = TOOL_REGISTRY[call.name]["fn"](**call.input)

    # 5. CASCADING ERROR — validate the RESULT, not just the call
    if not plausible(call.name, result):
        log.warning("implausible tool result: %s -> %s", call.name, result)
        return {"error": "The tool returned an unexpected result."}

    # 6. TOOL OUTPUT IS UNTRUSTED — it may contain injected instructions
    return {"result": fence_as_data(result)}


# 7. SKIPPED TOOLS — detect it in evaluation, not in production
def check_trajectory(trace, question):
    if requires_lookup(question) and not trace:
        log.warning("answered without calling any tool: %s", question)
        metrics.increment("agent.skipped_retrieval")`
    },
    prereq: ['termination-conditions', 'tool-calling'], next: ['multi-agent'],
    related: ['prompt-injection', 'rag-failure-modes', 'human-in-the-loop', 'access-control', 'transactions'],
    tools: ['langgraph', 'langsmith', 'phoenix'],
    useCases: [
      'Threat-modelling an agent before it ships.',
      'Reviewing an agent design against a known failure catalogue.',
      'Deciding which tools an agent may hold.'
    ],
    avoid: [
      'Shipping write tools without approval and idempotency.',
      'Relying on prompt instructions as the primary control.'
    ],
    mistakes: [
      'Assuming a well-behaved agent in testing will behave in production with adversarial input.',
      'Validating the tool call but not the tool result, so a bad observation cascades.',
      'Granting broad tool access during development and never narrowing it.',
      'Evaluating final answers only, missing trajectories where the agent skipped its tools.',
      'Treating tool output as trusted, which reopens the injection path.'
    ],
    keyTerms: [
      ['runaway loop', 'An agent that never terminates.'],
      ['hallucinated tool call', 'Inventing a tool or parameter that does not exist.'],
      ['cascading error', 'An early wrong observation poisoning everything after.'],
      ['least privilege', 'Granting only the capabilities actually needed.'],
      ['blast radius', 'How much damage a failure can cause.'],
      ['reversibility', 'Whether an action can be undone.'],
      ['trajectory evaluation', 'Assessing the sequence of actions, not just the answer.']
    ],
    resources: [
      ['OWASP Top 10 for LLM Applications', 'https://owasp.org/www-project-top-10-for-large-language-model-applications/', 'reference'],
      ['Anthropic — building effective agents', 'https://www.anthropic.com/engineering/building-effective-agents', 'reference'],
      ['Simon Willison — prompt injection and agents', 'https://simonwillison.net/series/prompt-injection/', 'reference'],
      ['NIST — adversarial machine learning', 'https://csrc.nist.gov/pubs/ai/100/2/e2023/final', 'paper']
    ],
    questions: [
      ['What is the unifying control across agent failure modes?', 'Least privilege. Most catastrophic failures require a capability the agent did not need — an agent without a send_email tool cannot be made to send email by any means.'],
      ['Why validate tool results and not just tool calls?', 'A wrong observation early in the loop poisons every subsequent decision. The agent will reason consistently from bad data and produce a confident, wrong outcome.'],
      ['Why must trajectories be evaluated, not just answers?', 'An answer can look correct while the agent skipped its tools and answered from memory. That is a failure of the mechanism that the final text does not reveal.']
    ],
    interview: {
      s30: 'Agent failures are different from chat failures because they involve actions and loops — runaway loops, wrong tool selection, hallucinated arguments, cascading errors, and irreversible wrong actions.',
      s90: 'What I find useful is that each failure has a specific mechanical control rather than a prompting fix. Runaway loops need a step cap and a no-progress guard. Hallucinated arguments — an order id that does not exist — need entity verification before acting, not a better prompt. Cascading errors need you to validate the tool result, because one wrong observation early poisons every decision after it and the agent reasons perfectly consistently from bad data. But the control that matters most is least privilege: nearly every catastrophic failure requires a capability the agent did not actually need. An agent without a write tool cannot be made to write, whether by injection, confusion or a bug. So the design question I push hardest on is not "how do we make it smarter" but "what is the smallest set of tools this can do its job with".',
      pm: 'It turns agent safety from a hope into a checklist, and it makes the scope conversation concrete: every tool we add is a failure mode we accept.'
    }
  },

  {
    id: 'multi-agent',
    title: 'Multi-Agent Systems',
    domain: 'agents', tier: 3, priority: 'low',
    summary: 'Several specialised agents coordinating — and why one agent is usually the right answer.',
    what: `A multi-agent system splits work across several agents, each with a narrower role and its own tools, coordinated by an orchestrator or by passing work between them.`,
    why: `It genuinely helps when subtasks need different tools, different permissions or genuinely parallel execution. It is also the most over-applied pattern in agent design, and it multiplies every failure mode you already had.`,
    analogy: `A team versus an individual. A team of specialists outperforms one generalist on a large, divisible project. On a small task, the coordination overhead exceeds any benefit, and now you have meetings.`,
    technical: `Patterns:
- **Orchestrator-worker** — a coordinator delegates subtasks and assembles results. The most common and most controllable.
- **Sequential pipeline** — each agent transforms and passes on. Really a workflow.
- **Parallel fan-out** — independent subtasks run concurrently, then merge. The clearest genuine win.
- **Debate / critique** — one generates, another critiques. Useful because the critic has a different prompt and perspective.

Costs multiply: N agents mean N times the model calls, N loops that can fail, and inter-agent communication that can itself lose information. Debugging requires tracing across agents, and latency is the slowest path, not the average.

Reach for it when: subtasks need genuinely different permissions, when the work is genuinely parallel, or when a separate critic adds real value.

Do not reach for it because the diagram looks impressive. A single agent with well-described tools handles most tasks people build multi-agent systems for.`,
    diagram: `
   ORCHESTRATOR-WORKER            PARALLEL FAN-OUT

        orchestrator                    task
        ┌────┼────┐                  ┌───┼───┐
        ▼    ▼    ▼                  ▼   ▼   ▼
      A    B    C                   A   B   C    (concurrent)
     (research)(write)(check)        └───┼───┘
        └────┼────┘                      ▼
             ▼                        merge
          combine                   ← the clearest genuine win
                                      (latency, not capability)

   WHAT MULTIPLIES

     model calls        N agents = N× the calls
     failure modes      each agent has its own full catalogue
     latency            the SLOWEST path, not the average
     debugging          trace ACROSS agents
     information loss   every handoff can drop context

   WHEN IT IS GENUINELY RIGHT

     ✓ subtasks need DIFFERENT PERMISSIONS
       (a research agent that reads, a write agent behind approval)
     ✓ work is genuinely PARALLEL and latency matters
     ✓ an independent CRITIC adds real value

   WHEN IT IS NOT

     ✗ "it seems more sophisticated"
     ✗ the subtasks are sequential anyway  → that is a workflow
     ✗ one agent with 5 good tools would work  → it usually would

   ⚠ START WITH ONE AGENT. Split only when you can name
     the specific thing one agent could not do.`,
    example: {
      language: 'python',
      caption: 'Orchestrator-worker with per-agent permissions',
      code: `# The one pattern that clearly justifies multiple agents:
# different agents hold DIFFERENT PERMISSIONS.

RESEARCH_AGENT = {
    "role": "Gather information. You cannot change anything.",
    "tools": [search_docs, get_order, get_policy],       # READ ONLY
    "max_steps": 6,
}

ACTION_AGENT = {
    "role": "Execute an approved plan. Only act on what was approved.",
    "tools": [issue_refund, send_email],                 # WRITES
    "max_steps": 3,
    "requires_approval": True,
}

def orchestrate(goal, llm, user):
    # 1. Research — read-only, so it cannot cause an incident
    findings = run_agent(goal, llm, RESEARCH_AGENT, user)
    if findings["status"] != "done":
        return {"status": "research_failed", "detail": findings}

    # 2. Decide — a plain model call, no tools, no side effects
    plan = llm.structured(PLAN_PROMPT.format(goal=goal,
                                             findings=findings["answer"]),
                          schema=PLAN_SCHEMA)

    # 3. Approve — a human sees the plan and the evidence behind it
    if not approve_with_user(plan, evidence=findings["trace"]):
        return {"status": "declined", "plan": plan}

    # 4. Act — narrow agent, few steps, write tools, approved plan only
    result = run_agent(format_plan(plan), llm, ACTION_AGENT, user)

    return {"status": result["status"], "findings": findings,
            "plan": plan, "result": result,
            # tracing across agents is what makes this debuggable
            "trace": findings["trace"] + result["trace"]}

# The split earns its cost because the research agent CANNOT
# take an action, no matter what it reads or what is injected
# into it. That is a security property, not a capability one.`
    },
    prereq: ['agent-failure-modes'], next: [],
    related: ['agent-loop', 'human-in-the-loop', 'ai-cost', 'access-control'],
    tools: ['langgraph', 'anthropic'],
    useCases: [
      'Separating read-only research from privileged action.',
      'Genuinely parallel subtasks where latency matters.',
      'An independent critic reviewing another agent’s output.'
    ],
    avoid: [
      'Tasks a single agent with good tools handles.',
      'Sequential work, which is a workflow rather than a multi-agent system.',
      'Anywhere latency or cost is tight.'
    ],
    mistakes: [
      'Building multi-agent because it looks sophisticated.',
      'Not tracing across agents, making the system undebuggable.',
      'Losing context at handoffs, so a later agent works from an incomplete picture.',
      'Giving every agent the same broad tool set, which discards the main benefit.',
      'Underestimating that latency is the slowest path, not the average.'
    ],
    keyTerms: [
      ['orchestrator', 'The agent that delegates and assembles.'],
      ['worker agent', 'A specialised agent handling a subtask.'],
      ['handoff', 'Passing work and context between agents.'],
      ['fan-out / fan-in', 'Parallel execution then merge.'],
      ['critic agent', 'An agent that reviews another’s output.'],
      ['cross-agent tracing', 'Following one request through several agents.'],
      ['permission separation', 'Different agents holding different capabilities.']
    ],
    resources: [
      ['Anthropic — building effective agents', 'https://www.anthropic.com/engineering/building-effective-agents', 'reference'],
      ['LangGraph — multi-agent systems', 'https://langchain-ai.github.io/langgraph/concepts/multi_agent/', 'docs'],
      ['Anthropic — multi-agent research system', 'https://www.anthropic.com/engineering/multi-agent-research-system', 'reference']
    ],
    questions: [
      ['What is the clearest justification for splitting into multiple agents?', 'Permission separation. A read-only research agent physically cannot take an action regardless of what it reads or what is injected into it, which is a security property a single agent cannot provide.'],
      ['What multiplies when you add agents?', 'Model calls, failure modes, debugging complexity and information loss at handoffs. Latency becomes the slowest path rather than the average.'],
      ['When is a multi-agent design really just a workflow?', 'When the subtasks are strictly sequential. If nothing runs in parallel and permissions are identical, it is a pipeline with extra coordination overhead.']
    ]
  }
];
