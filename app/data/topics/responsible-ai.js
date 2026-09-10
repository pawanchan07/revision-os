/**
 * DOMAIN P — RESPONSIBLE AI (BUILD.md section 19)
 * "Explain these from a product manager's perspective."
 */
export const topics = [
  {
    id: 'privacy-pii',
    title: 'Privacy & PII',
    domain: 'responsible-ai', tier: 1, priority: 'high',
    summary: 'Personal data flows through AI systems in places people do not expect.',
    what: `Personally identifiable information is any data that identifies a person — directly (name, email, ID number) or in combination (postcode plus date of birth plus job title).

In an AI system it appears in prompts, retrieved context, logs, traces, evaluation sets, feedback records and, permanently, in fine-tuning data.`,
    why: `Every one of those places is a data-processing location a regulator would ask about, and several of them are ones product teams forget. Traces and evaluation sets in particular accumulate personal data quietly, with no retention policy and often no access control.`,
    analogy: `A photocopier with a hard drive. Everyone thinks about the documents; almost nobody thinks about the machine that kept a copy of every one of them.`,
    technical: `Where PII enters an AI system, in the order teams forget it:
1. **The user's own input** — obvious.
2. **Retrieved context** — documents containing customer data.
3. **Traces** — the full prompt, which contains both of the above.
4. **Logs** — questions and answers.
5. **Evaluation sets** — production cases promoted to golden cases.
6. **Feedback records** — free-text complaints often contain more than the original question.
7. **Fine-tuning data** — and this one is **irreversible**.

Controls: redact at the boundary before storage, set retention periods per store, enforce access control on traces and evaluation data, and check whether sending data to a third-party model provider or judge is permitted.

**The right to erasure is the hard one.** You can delete rows from a database. You cannot remove data from model weights, so PII must be excluded from training data *before* training — there is no undo.

Zero-retention or no-training agreements with providers matter and should be verified, not assumed.`,
    diagram: `
   WHERE PII ENTERS — in the order teams forget it

     1  user input            obvious · everyone handles this
     2  retrieved context     documents contain customer data
     3  TRACES                the full prompt = 1 + 2
     4  LOGS                  questions and answers
     5  EVALUATION SETS       production cases promoted to golden
     6  FEEDBACK RECORDS      free text often contains MORE
     7  FINE-TUNING DATA      ⚠ IRREVERSIBLE

   ⚠ THE RIGHT TO ERASURE

     customer requests deletion
       ✓ delete their database rows
       ✓ delete their traces and logs
       ✓ remove their cases from the evaluation set
       ✗ their data is in the MODEL WEIGHTS

     There is no undo. De-identify BEFORE training.

   CONTROLS, PER STORE

     store          redact?   retention   access control
     ─────          ───────   ─────────   ──────────────
     traces           yes       30 days      restricted
     logs             yes       90 days      restricted
     eval sets        yes       review       restricted
     feedback         yes       90 days      restricted
     training data    MUST      permanent    strictest

   ⚠ VERIFY, DO NOT ASSUME
     zero-retention and no-training agreements with providers
     are contractual settings that must be checked, not defaults.`,
    example: {
      language: 'python',
      caption: 'Redacting at the boundary, before anything is stored',
      code: `import re

PATTERNS = [
    (re.compile(r"[\\w.+-]+@[\\w-]+\\.[\\w.]+"), "<EMAIL>"),
    (re.compile(r"\\b\\d{4}[ -]?\\d{4}[ -]?\\d{4}[ -]?\\d{4}\\b"), "<CARD>"),
    (re.compile(r"\\+?\\d[\\d ()-]{8,}\\d"), "<PHONE>"),
    (re.compile(r"\\b[A-Z]{5}\\d{4}[A-Z]\\b"), "<PAN>"),        # India PAN
    (re.compile(r"\\b\\d{4}\\s?\\d{4}\\s?\\d{4}\\b"), "<AADHAAR>"),
]

def redact(text: str) -> str:
    if not text:
        return text
    for pattern, token in PATTERNS:
        text = pattern.sub(token, text)
    return text

# ── REDACT AT THE BOUNDARY, NOT AT READ TIME ───────────────
def store_trace(trace):
    """Everything written here is redacted first. There is no
    'we'll clean it later' — later is after the breach."""
    return trace_store.write({
        "trace_id": trace["id"],
        "question": redact(trace["question"]),
        "prompt": redact(trace["prompt"]),
        "answer": redact(trace["answer"]),
        "chunks": [redact(c["text"]) for c in trace["chunks"]],
        "retention_days": 30,
        "access": ["ai-team", "support-leads"],     # not everyone
    })

# ── THE IRREVERSIBLE ONE ───────────────────────────────────
def prepare_training_data(examples):
    cleaned = []
    for ex in examples:
        text = redact(ex["input"])
        # Belt and braces: a second detector, because this cannot be undone
        if pii_detector.scan(text).has_findings:
            continue                    # drop rather than risk it
        cleaned.append({**ex, "input": text})

    dropped = len(examples) - len(cleaned)
    log.info("training data: %d examples, %d dropped for PII", len(cleaned), dropped)
    return cleaned

# Regex alone is not sufficient for names, addresses or free-text
# disclosures. Use a proper detector (Presidio or equivalent) for
# anything going into training data.`
    },
    prereq: [], next: ['data-leakage', 'access-control'],
    related: ['env-vars', 'logging-llm', 'training-dataset-prep', 'india-dpdpa'],
    tools: ['python'],
    useCases: [
      'Mapping where personal data flows in an AI feature.',
      'Answering a data-protection review.',
      'Setting retention and access policy per store.'
    ],
    avoid: [
      'Storing raw prompts anywhere without redaction.',
      'Any personal data in fine-tuning sets.',
      'Assuming a provider does not retain or train on your data.'
    ],
    mistakes: [
      'Forgetting traces and evaluation sets, which accumulate PII quietly.',
      'Regex-only redaction for names and free-text disclosures.',
      'No retention policy, so data accumulates indefinitely.',
      'PII in training data, which cannot be removed after training.',
      'No access control on traces, so anyone can read customer conversations.'
    ],
    keyTerms: [
      ['PII', 'Data identifying a person, directly or in combination.'],
      ['redaction', 'Replacing personal data with placeholders before storage.'],
      ['data minimisation', 'Collecting only what is needed.'],
      ['retention period', 'How long each store keeps data.'],
      ['right to erasure', 'A person’s right to have their data deleted.'],
      ['zero-retention', 'A provider setting where prompts are not stored.'],
      ['irreversible processing', 'Training. Data in weights cannot be removed.']
    ],
    resources: [
      ['GDPR — official text', 'https://gdpr-info.eu/', 'reference'],
      ['India DPDP Act 2023', 'https://www.meity.gov.in/data-protection-framework', 'reference'],
      ['Microsoft Presidio — PII detection', 'https://microsoft.github.io/presidio/', 'docs'],
      ['Anthropic — privacy and data usage', 'https://privacy.anthropic.com/', 'reference'],
      ['NIST — Privacy Framework', 'https://www.nist.gov/privacy-framework', 'reference']
    ],
    questions: [
      ['Which PII locations do product teams most often forget?', 'Traces, logs, evaluation sets and feedback records. They accumulate personal data quietly, usually with no retention policy and often no access control.'],
      ['Why is fine-tuning data different from every other store?', 'It is irreversible. You can delete database rows, traces and evaluation cases on an erasure request, but data absorbed into model weights cannot be removed.'],
      ['What must be verified rather than assumed with a provider?', 'Zero-retention and no-training terms. They are contractual settings that have to be checked and configured, not defaults.']
    ],
    interview: {
      s30: 'Personal data flows through AI systems in places people do not expect — prompts, retrieved context, traces, logs, evaluation sets, and irreversibly into fine-tuning data.',
      s90: 'The places teams handle well are user input and the database. The places they forget are traces and evaluation sets, which quietly accumulate full prompts containing customer data, usually with no retention policy and no access control. The one I treat as a hard rule is training data, because it is the only irreversible step: when someone exercises their right to erasure you can delete their rows, their traces and their evaluation cases, but you cannot remove their data from model weights. So de-identification has to happen before training, with a proper detector rather than regex, and dropping an example is preferable to risking it. And I verify provider terms rather than assuming — zero-retention and no-training are settings to configure, not defaults.',
      pm: 'It determines whether a feature can ship in a regulated market at all, and it is much cheaper to design in than to retrofit after a data-protection review.'
    }
  },

  {
    id: 'data-leakage',
    title: 'Data Leakage',
    domain: 'responsible-ai', tier: 2, priority: 'high',
    summary: 'Information reaching someone who should not have it — usually through retrieval.',
    what: `Data leakage in an AI system means information crossing a boundary it should not: one customer's data shown to another, an internal document surfaced to an external user, or a confidential passage quoted in an answer.

The most common route is **retrieval without access control**.`,
    why: `A leak is not a quality bug; it is an incident with regulatory and contractual consequences. And AI systems make it easy, because retrieval is designed to find relevant content and has no inherent notion of who is allowed to see it.`,
    analogy: `A very efficient librarian who fetches whatever is most relevant to your question, including from the restricted section, because nobody told them the restricted section exists.`,
    technical: `The leak paths, in order of likelihood:

1. **Retrieval without ACL filtering.** The index contains everything; the query does not filter by permission. Fix: enforce access control **in the retrieval filter**, not in the prompt.
2. **Shared index across tenants.** One vector collection serving multiple customers with only metadata separating them. Fix: separate collections, or mandatory tenant filters enforced at the client layer.
3. **Conversation history bleed.** A shared session or cached context carrying one user's data into another's request.
4. **System prompt extraction.** Anything in the system prompt is potentially extractable.
5. **Training on customer data.** A model fine-tuned on one customer's data serving another.
6. **Logs and traces** with broad read access.

The architectural principle: **filter at retrieval, verify after retrieval, and never rely on the prompt**. A prompt instruction not to reveal something is a request; a filter is a boundary. And because filters have bugs, assert the result too.`,
    diagram: `
   THE MOST COMMON LEAK

     user (support tier 1) asks a question
              ↓
     retrieval searches the WHOLE index
              ↓
     returns an HR document · another customer's ticket
       · a confidential contract clause
              ↓
     model quotes it faithfully in the answer
              ↓
     LEAK — and the model did nothing wrong

   WRONG vs RIGHT

     ✗ retrieve everything, then instruct:
       "do not reveal HR documents"
       → a REQUEST. The content is already in the context.

     ✓ filter: acl CONTAINS user.role
       → a BOUNDARY. The content never enters the context.

   DEFENCE IN DEPTH

     1  FILTER at retrieval          the boundary
     2  ASSERT after retrieval       filters have bugs
     3  SEPARATE per tenant          collections, not just metadata
     4  SCAN the output              last resort, catches the rest
     5  AUDIT who saw what           you will be asked

   MULTI-TENANT: METADATA IS NOT ISOLATION

     one collection, tenant_id in the payload
       → one missing filter, one bug, one injected instruction
         and tenant A sees tenant B's data

     separate collections per tenant
       → the failure is structurally impossible

     Choose based on how bad that leak would be.`,
    example: {
      language: 'python',
      caption: 'Access control enforced at retrieval, then verified',
      code: `class LeakError(Exception):
    """Raised when a filter failed. Must never be swallowed."""

def retrieve_safely(question, user, store, k=5):
    # ── 1. FILTER: the boundary ────────────────────────────
    filters = {"must": [
        {"key": "tenant_id", "match": {"value": user.tenant_id}},   # mandatory
        {"key": "acl", "match": {"any": user.roles}},
        {"key": "confidential", "match": {"value": False}}
            if not user.can_see_confidential else None,
    ]}
    filters["must"] = [f for f in filters["must"] if f]

    hits = store.search(embed(question), limit=k, filter=filters)

    # ── 2. ASSERT: filters have bugs ───────────────────────
    for h in hits:
        p = h["payload"]
        if p["tenant_id"] != user.tenant_id:
            raise LeakError(f"tenant filter failed: {p['tenant_id']}")
        if not set(p["acl"]) & set(user.roles):
            raise LeakError(f"acl filter failed on {h['id']}")
        if p.get("confidential") and not user.can_see_confidential:
            raise LeakError(f"confidential doc {h['id']} reached {user.id}")

    # ── 5. AUDIT: you will be asked who saw what ───────────
    audit.log("retrieval", user=user.id, tenant=user.tenant_id,
              question_hash=hash_(question),
              chunk_ids=[h["id"] for h in hits])

    return hits


# ── 4. OUTPUT SCAN: last resort ────────────────────────────
def scan_output(answer, user):
    """Catches leaks the earlier layers missed."""
    findings = pii_detector.scan(answer)
    foreign = [f for f in findings if not belongs_to(f, user)]
    if foreign:
        log.error("output leak blocked", extra={"user": user.id,
                                                "types": [f.type for f in foreign]})
        return SAFE_FALLBACK
    return answer

# The assertion in step 2 is deliberate. A filtering bug should
# raise loudly, not quietly place a restricted document into a
# prompt that the model will happily quote from.`
    },
    prereq: ['privacy-pii'], next: ['access-control'],
    related: ['metadata-filtering', 'prompt-injection', 'mcp-security', 'auditability'],
    tools: ['qdrant', 'pinecone', 'postgres'],
    useCases: [
      'Designing multi-tenant retrieval safely.',
      'Passing a security review for an internal knowledge assistant.',
      'Deciding between shared and separate indexes per tenant.'
    ],
    avoid: [
      'Prompt instructions as the access-control mechanism.',
      'A single shared index across tenants when a leak would be severe.'
    ],
    mistakes: [
      'Enforcing access control in the prompt rather than the retrieval filter.',
      'Metadata-only tenant separation when the leak consequence is severe.',
      'No assertion after filtering, so a filter bug fails silently.',
      'No audit log, so "who saw what" is unanswerable after an incident.',
      'Broad read access to traces, which contain everything.'
    ],
    keyTerms: [
      ['data leakage', 'Information crossing a boundary it should not.'],
      ['ACL filter', 'Restricting retrieval by permission. The boundary.'],
      ['tenant isolation', 'Keeping customers’ data separate.'],
      ['defence in depth', 'Filter, assert, separate, scan, audit.'],
      ['output scanning', 'Checking the answer for data the user may not see.'],
      ['audit log', 'The record of who accessed what.'],
      ['blast radius', 'How much data a single failure could expose.']
    ],
    resources: [
      ['OWASP Top 10 for LLM Applications', 'https://owasp.org/www-project-top-10-for-large-language-model-applications/', 'reference'],
      ['Qdrant — multitenancy', 'https://qdrant.tech/documentation/guides/multiple-partitions/', 'docs'],
      ['Pinecone — namespaces', 'https://docs.pinecone.io/guides/index-data/indexing-overview', 'docs'],
      ['NIST — AI Risk Management Framework', 'https://www.nist.gov/itl/ai-risk-management-framework', 'reference']
    ],
    questions: [
      ['What is the most common leak path in a RAG system?', 'Retrieval without access-control filtering. The index contains everything, the query does not filter by permission, and the model faithfully quotes whatever it was given.'],
      ['Why is a prompt instruction not access control?', 'It is a request the model may not honour, and the restricted content is already in the context where it can be quoted or extracted. A filter prevents it entering the context at all.'],
      ['When is metadata-based tenant separation insufficient?', 'When a cross-tenant leak would be severe. One missing filter or one bug exposes another customer’s data; separate collections make that failure structurally impossible.']
    ]
  },

  {
    id: 'safety-filters',
    title: 'Safety Filters & Guardrails',
    domain: 'responsible-ai', tier: 2, priority: 'medium',
    summary: 'Layers around the model that check what goes in and what comes out.',
    what: `Guardrails are checks applied before the model sees input and after it produces output — classifying, blocking, redacting or routing — independently of the model's own behaviour.`,
    why: `The model's own refusal is one layer, and it is the layer an attacker is directly trying to defeat. Guardrails are layers the attacker is not talking to, which is what makes defence in depth work.`,
    analogy: `Airport security. The check-in agent asking questions is one layer. The scanner, the watch list and the gate check are separate systems that do not depend on the passenger's answers.`,
    technical: `**Input guardrails**: PII detection, prompt-injection heuristics, topic classification (is this even in scope?), rate limiting, and known-attack pattern matching.

**Output guardrails**: PII leakage scanning, toxicity classification, groundedness gating, format and schema validation, and policy checks specific to your domain.

Design considerations:
- **Latency** — every guardrail adds time. Run them in parallel where possible and reserve expensive checks for flagged cases.
- **False positives** — an over-aggressive filter blocking legitimate requests is a real product cost. Measure it exactly as you measure over-refusal.
- **Fail open or closed** — decide deliberately. A guardrail service outage should not silently disable safety, nor should it take the product down. Usually: fail closed for high-stakes, fail open with alerting for low-stakes.
- **Explain the block** — a blocked user needs to know something happened and what to do.

Scope restriction is the cheapest guardrail of all: an assistant that only discusses billing has far less dangerous surface than a general one.`,
    diagram: `
   LAYERS THE ATTACKER IS NOT TALKING TO

     user input
        ↓
     [ INPUT GUARDRAILS ]  PII · injection heuristics
        ↓                  · topic classification · rate limit
     [ MODEL + its own refusal training ]
        ↓
     [ OUTPUT GUARDRAILS ] PII leak scan · toxicity
        ↓                  · groundedness gate · schema validation
     user

     The model's refusal is the layer an attacker is directly
     trying to defeat. The others are not in that conversation.

   DESIGN DECISIONS THAT MATTER

     LATENCY        run in parallel; expensive checks only on
                    flagged cases

     FALSE POSITIVES an over-aggressive filter is a real product
                    cost. Measure it like over-refusal.

     FAIL OPEN or CLOSED?
       high-stakes  → fail CLOSED (block, alert)
       low-stakes   → fail OPEN (allow, alert loudly)
       Decide deliberately. Not deciding means the guardrail
       silently disappears during an outage.

     EXPLAIN THE BLOCK
       a blocked user needs to know something happened
       and what to do next

   ⚠ THE CHEAPEST GUARDRAIL IS SCOPE

     a billing-only assistant has far less dangerous surface
     than a general one — and it costs nothing to enforce.`,
    example: {
      language: 'python',
      caption: 'Parallel guardrails with explicit fail behaviour',
      code: `import asyncio

async def input_guardrails(text, user):
    """Run in parallel — latency is additive otherwise."""
    checks = await asyncio.gather(
        pii_detector.scan_async(text),
        injection_heuristic.score_async(text),
        topic_classifier.classify_async(text),
        return_exceptions=True,          # one failing check must not break all
    )
    pii, injection, topic = checks
    results = {}

    # FAIL BEHAVIOUR, decided per check
    if isinstance(pii, Exception):
        log.error("pii scanner failed", exc_info=pii)
        results["pii"] = {"fail": "open", "findings": []}   # low stakes here
    else:
        results["pii"] = {"findings": pii.findings}

    if isinstance(injection, Exception):
        log.error("injection scanner failed", exc_info=injection)
        alert_oncall("injection guardrail down")
        return {"block": True, "reason": "safety_unavailable"}  # fail CLOSED

    if injection > 0.8:
        return {"block": True, "reason": "suspected_injection"}

    if not isinstance(topic, Exception) and topic.label == "out_of_scope":
        return {"block": True, "reason": "out_of_scope",
                "message": "I can only help with billing questions. "
                           "For anything else, I can connect you to support."}

    return {"block": False, "redacted": redact_findings(text, results)}


async def output_guardrails(answer, context, user):
    leak, toxicity, grounded = await asyncio.gather(
        pii_detector.scan_async(answer),
        toxicity_classifier.score_async(answer),
        groundedness_async(answer, context),
    )
    if leak.has_foreign_pii(user):
        return {"block": True, "reason": "pii_leak"}
    if toxicity > 0.5:
        return {"block": True, "reason": "toxicity"}
    if grounded < 0.6:
        return {"block": True, "reason": "ungrounded"}
    return {"block": False}

# ── MEASURE FALSE POSITIVES ────────────────────────────────
# guardrail_block_rate by reason, and a sampled human review of
# blocks. A filter blocking 8% of legitimate requests is a
# product problem, not a safety win.`
    },
    prereq: ['jailbreaks', 'prompt-injection'], next: ['human-in-the-loop'],
    related: ['safety-evaluation', 'eval-thresholds-quality-gates', 'refusal-quality', 'conditionals'],
    tools: ['anthropic', 'openai'],
    useCases: [
      'Adding defence in depth around a consumer-facing assistant.',
      'Blocking out-of-scope requests cheaply.',
      'Scanning output for data the user should not see.'
    ],
    avoid: [
      'Relying solely on the model’s own refusal.',
      'Expensive guardrails on every request when sampling would do.',
      'Filters so aggressive that legitimate use is blocked.'
    ],
    mistakes: [
      'Running guardrails sequentially, so latency is the sum rather than the maximum.',
      'Not deciding fail-open versus fail-closed, so an outage silently disables safety.',
      'No measurement of false positives, so an over-aggressive filter looks like a safety win.',
      'Blocking with no explanation, leaving the user with nothing.',
      'Treating guardrails as a substitute for scope restriction, which is cheaper and stronger.'
    ],
    keyTerms: [
      ['guardrail', 'A check applied around the model, independent of its behaviour.'],
      ['input guardrail', 'Runs before the model sees the request.'],
      ['output guardrail', 'Runs before the response reaches the user.'],
      ['fail open / closed', 'What happens when a guardrail service is unavailable.'],
      ['false positive rate', 'Legitimate requests wrongly blocked. A real product cost.'],
      ['scope restriction', 'The cheapest guardrail — limiting what the assistant covers.'],
      ['defence in depth', 'Layers an attacker is not directly addressing.']
    ],
    resources: [
      ['Anthropic — strengthen guardrails', 'https://docs.anthropic.com/en/docs/test-and-evaluate/strengthen-guardrails/reduce-hallucinations', 'docs'],
      ['OpenAI — safety best practices', 'https://platform.openai.com/docs/guides/safety-best-practices', 'docs'],
      ['OWASP Top 10 for LLM Applications', 'https://owasp.org/www-project-top-10-for-large-language-model-applications/', 'reference'],
      ['NeMo Guardrails', 'https://docs.nvidia.com/nemo/guardrails/', 'docs']
    ],
    questions: [
      ['Why are guardrails stronger than the model’s own refusal?', 'The model’s refusal is the layer an attacker is directly trying to defeat. Guardrails are separate systems the attacker is not in conversation with.'],
      ['What decision do teams most often skip?', 'Fail-open versus fail-closed. Without deciding, a guardrail service outage silently disables safety — or unnecessarily takes the product down.'],
      ['Why measure guardrail false positives?', 'A filter blocking 8% of legitimate requests is a product problem wearing a safety badge. It should be measured exactly like over-refusal.']
    ]
  },

  {
    id: 'access-control',
    title: 'Access Control',
    domain: 'responsible-ai', tier: 2, priority: 'high',
    summary: 'Who may see what and do what — enforced in the system, never in the prompt.',
    what: `Access control determines which data a user may retrieve and which actions an AI system may take on their behalf. In an AI system it applies at three points: retrieval, tool use, and the underlying systems themselves.`,
    why: `AI systems make access control harder in a specific way: they are designed to find and surface relevant information, and relevance has nothing to do with permission. A retrieval system with no ACL filter will helpfully surface exactly the document a user was not supposed to see.`,
    analogy: `A building pass. It does not matter how politely someone asks; the door either opens for that pass or it does not. The request is not part of the decision.`,
    technical: `Three enforcement points:

**Retrieval** — filter by the user's permissions at query time, and assert afterwards. This is the one most often missed.

**Tools** — the model deciding to call a tool is not an authorisation. Check the *user's* permission on every call, on the server side.

**Underlying systems** — the AI system should act with the requesting user's privileges, not with a broad service credential. Using a service account with wide access creates the confused-deputy problem: a low-privilege user reaching high-privilege data through the assistant.

Principles: least privilege, enforcement server-side, deny by default, and audit everything.

The design question worth asking early: **does the AI system have permissions the user does not?** If yes, that gap is the vulnerability, and it should be closed rather than mitigated.`,
    diagram: `
   THREE ENFORCEMENT POINTS

     RETRIEVAL     filter by user permission at query time
                   ← the one most often missed

     TOOLS         the model DECIDING to call a tool is not
                   an authorisation. Check the USER's permission,
                   server-side, on every call.

     UNDERLYING    act with the REQUESTING USER's privileges,
     SYSTEMS       not a broad service credential

   ⚠ THE CONFUSED DEPUTY

     user (read-only) ──► assistant ──► service account (admin)
                                              ↓
                                        returns admin-only data

     The user was never authorised. The assistant was.
     That gap IS the vulnerability.

   THE QUESTION TO ASK EARLY

     "Does the AI system have permissions the user does not?"

       yes → that gap is the vulnerability
             close it, do not mitigate it

       no  → the assistant can only ever do what the user
             could already do. Much easier to reason about.

   PRINCIPLES

     least privilege      grant the minimum needed
     server-side          the client can be bypassed
     deny by default      absence of permission is denial
     audit everything     you will be asked who saw what`,
    example: {
      language: 'python',
      caption: 'The user\'s permissions, enforced at all three points',
      code: `def handle(question, user, store, executor):
    # ── POINT 1: RETRIEVAL ─────────────────────────────────
    hits = store.search(
        embed(question), limit=5,
        filter={"must": [
            {"key": "tenant_id", "match": {"value": user.tenant_id}},
            {"key": "acl", "match": {"any": user.roles}},
        ]},
    )
    # assert, because filters have bugs
    assert all(set(h["payload"]["acl"]) & set(user.roles) for h in hits)

    # ── POINT 2: TOOLS ─────────────────────────────────────
    # Only surface tools this user may use — the model cannot call
    # what it was never told about.
    available = [t for t in ALL_TOOLS if user.can(t["name"])]

    reply = llm(build_prompt(hits, question), tools=available)

    if reply.stop_reason == "tool_use":
        call = reply.tool_calls[0]
        # Re-check server-side. The model's decision is not an authorisation.
        if not user.can(call.name):
            audit.log("tool_denied", user=user.id, tool=call.name)
            return {"error": "You are not permitted to do that."}

        # ── POINT 3: UNDERLYING SYSTEM ─────────────────────
        # Act AS THE USER, not with a broad service credential.
        result = executor.run(call.name, call.input, as_user=user)
        audit.log("tool_called", user=user.id, tool=call.name,
                  input=call.input, result_summary=summarise(result))

    return reply


# ── THE DESIGN CHECK, RUN EARLY ────────────────────────────
def permission_gap(ai_system, user_role):
    """If the assistant can do more than the user, that gap is
    the vulnerability."""
    ai_can = set(ai_system.capabilities)
    user_can = set(role_permissions(user_role))
    gap = ai_can - user_can
    if gap:
        log.warning("AI system exceeds user permissions: %s", gap)
    return gap

# An assistant that can only do what the requesting user could
# already do is dramatically easier to reason about, review and
# defend.`
    },
    prereq: ['data-leakage'], next: ['auditability'],
    related: ['metadata-filtering', 'mcp-security', 'tool-calling', 'prompt-injection'],
    tools: ['postgres', 'qdrant', 'mcp'],
    useCases: [
      'Designing a multi-tenant or role-based AI assistant.',
      'Passing a security review.',
      'Deciding what an agent may be permitted to do.'
    ],
    avoid: [
      'Prompt-based access control.',
      'A broad service credential shared across all users.',
      'Client-side permission enforcement.'
    ],
    mistakes: [
      'No ACL filter at retrieval, the single most common AI access-control failure.',
      'Treating the model’s decision to call a tool as an authorisation.',
      'A service account with broader access than any user, creating a confused deputy.',
      'Surfacing every tool to the model regardless of the user.',
      'No audit trail, making post-incident questions unanswerable.'
    ],
    keyTerms: [
      ['access control', 'Who may see what and do what.'],
      ['ACL', 'Access control list attached to a document or resource.'],
      ['least privilege', 'Granting only the minimum needed.'],
      ['confused deputy', 'A system acting with more privilege than the requester.'],
      ['act-as-user', 'Executing with the requesting user’s credentials.'],
      ['deny by default', 'Absence of an explicit permission means denial.'],
      ['permission gap', 'Capability the AI system has that the user does not.']
    ],
    resources: [
      ['OWASP Top 10 for LLM Applications', 'https://owasp.org/www-project-top-10-for-large-language-model-applications/', 'reference'],
      ['MCP — security best practices', 'https://modelcontextprotocol.io/specification/draft/basic/security_best_practices', 'reference'],
      ['NIST — Zero Trust Architecture', 'https://csrc.nist.gov/pubs/sp/800/207/final', 'paper'],
      ['Qdrant — multitenancy', 'https://qdrant.tech/documentation/guides/multiple-partitions/', 'docs']
    ],
    questions: [
      ['Why do AI systems make access control harder?', 'Retrieval is designed to surface relevant content, and relevance has nothing to do with permission. Without an ACL filter it will helpfully find exactly the document the user was not supposed to see.'],
      ['Why is the model deciding to call a tool not an authorisation?', 'The model has no knowledge of the user’s permissions and can be manipulated. Authorisation must be checked server-side against the actual user on every call.'],
      ['What is the design question to ask early?', 'Does the AI system have permissions the user does not? If so, that gap is the vulnerability, and closing it is far better than mitigating it.']
    ]
  },

  {
    id: 'auditability',
    title: 'Auditability',
    domain: 'responsible-ai', tier: 2, priority: 'medium',
    summary: 'Being able to reconstruct, months later, what the system did and why.',
    what: `Auditability is the ability to answer, after the fact: what did the system output, what information did it use, what version produced it, who saw it, and what actions were taken.`,
    why: `Someone will ask. A regulator, a customer, a court, or an internal investigation. If you cannot reconstruct a decision, you cannot defend it — and in regulated contexts, inability to explain is itself a finding.`,
    analogy: `Meeting minutes. Nobody reads them until there is a dispute, at which point their absence is the entire problem.`,
    technical: `An auditable record of one AI decision contains: the input, the retrieved context with source identifiers and versions, the assembled prompt, the output, the model and prompt versions, any tool calls and their results, who approved anything requiring approval, the timestamp, and the user identity.

Requirements: **immutable** (append-only, not editable), **retained** for the period the relevant regulation requires, **access controlled** — audit logs contain everything — and **queryable** by user, by date, by decision.

The distinction from observability: observability is for **you**, optimised for debugging, and can be sampled and expire quickly. Audit is for **someone else**, must be complete for the decisions in scope, and must be retained.

For consequential decisions — anything affecting money, access, employment or eligibility — log the decision, the inputs, and the human who approved it. "The AI decided" is not an acceptable answer to a regulator.`,
    diagram: `
   OBSERVABILITY vs AUDIT

     OBSERVABILITY          AUDIT
     for YOU                for SOMEONE ELSE
     debugging              defending a decision
     sampled is fine        COMPLETE for decisions in scope
     expires in 30 days     retained per regulation
     mutable / derived      IMMUTABLE, append-only
     broad team access      restricted access

     They overlap. They are not the same requirement.

   WHAT ONE AUDITABLE DECISION CONTAINS

     input                  what was asked
     retrieved context      with SOURCE IDS and DOC VERSIONS
     assembled prompt       what the model actually saw
     output                 what it said
     model version          which model
     prompt version         which instructions
     tool calls + results   what it did
     human approver         who authorised it
     timestamp + user       when, and for whom

   ⚠ "THE AI DECIDED" IS NOT AN ANSWER

     For anything affecting money, access, employment or
     eligibility, you must be able to show:
       what information was used
       what the system produced
       which human approved it

   ⚠ AUDIT LOGS CONTAIN EVERYTHING.
     They need the strictest access control in the system.`,
    example: {
      language: 'python',
      caption: 'An append-only audit record for a consequential decision',
      code: `import hashlib, json
from datetime import datetime, timezone

def audit_decision(*, decision_type, user, inputs, retrieval, prompt,
                   output, tool_calls, approver, versions):
    """Append-only. Never updated, never deleted before retention expiry."""
    record = {
        "audit_id": new_uuid(),
        "ts": datetime.now(timezone.utc).isoformat(),
        "decision_type": decision_type,          # e.g. "refund_approval"
        "subject_user": user.id,
        "acting_user": approver.id if approver else None,

        "inputs": inputs,
        # Source IDS and VERSIONS, not just text — the document may change
        "retrieval": [{"chunk_id": c["id"],
                       "source": c["payload"]["source"],
                       "doc_version": c["payload"]["version"],
                       "score": round(c["score"], 4)} for c in retrieval],
        "prompt_hash": hashlib.sha256(prompt.encode()).hexdigest(),
        "prompt_ref": archive_prompt(prompt),    # stored separately, restricted
        "output": output,
        "tool_calls": tool_calls,

        "versions": versions,                    # model, prompt, index, code
        "approved_by": approver.id if approver else None,
        "approved_at": approver.approved_at if approver else None,
    }

    # Tamper-evident: chain each record to the previous one
    record["prev_hash"] = audit_store.last_hash()
    record["hash"] = hashlib.sha256(
        json.dumps(record, sort_keys=True).encode()).hexdigest()

    audit_store.append(record)                   # APPEND ONLY
    return record["audit_id"]


# ── ANSWERING THE QUESTION, MONTHS LATER ───────────────────
def reconstruct(audit_id):
    r = audit_store.get(audit_id)
    return {
        "what_was_asked": r["inputs"],
        "what_it_used": [f"{x['source']} v{x['doc_version']} "
                         f"(chunk {x['chunk_id']}, score {x['score']})"
                         for x in r["retrieval"]],
        "what_it_saw": load_archived_prompt(r["prompt_ref"]),
        "what_it_said": r["output"],
        "what_it_did": r["tool_calls"],
        "which_versions": r["versions"],
        "who_approved": r["approved_by"],
        "when": r["ts"],
    }

# Recording the DOC VERSION matters: the source document may have
# changed since. Without the version, you cannot show what the
# system actually saw at the time.`
    },
    prereq: ['access-control'], next: ['model-governance'],
    related: ['tracing', 'logging-llm', 'explainability', 'audit-trails'],
    tools: ['postgres', 'opentelemetry'],
    useCases: [
      'Defending an automated decision to a regulator or customer.',
      'Investigating an incident months later.',
      'Meeting record-keeping requirements in a regulated context.'
    ],
    avoid: [
      'Full audit records for every low-stakes request — scope to consequential decisions.',
      'Treating observability data as an audit trail; it is sampled and expires.'
    ],
    mistakes: [
      'Assuming observability covers audit. It is sampled, mutable and short-lived.',
      'Not recording document versions, so you cannot show what the system actually saw.',
      'Mutable audit records, which defeats the purpose.',
      'No record of who approved a consequential action.',
      'Audit logs with broad read access, when they contain the most sensitive data in the system.'
    ],
    keyTerms: [
      ['auditability', 'The ability to reconstruct a decision after the fact.'],
      ['immutable log', 'Append-only; records cannot be edited.'],
      ['tamper-evidence', 'Hash chaining so alteration is detectable.'],
      ['retention period', 'How long records must be kept, set by regulation.'],
      ['document version', 'Which revision of a source was used. Essential.'],
      ['approver', 'The human who authorised a consequential action.'],
      ['reconstruction', 'Answering what the system did and why, months later.']
    ],
    resources: [
      ['NIST — AI Risk Management Framework', 'https://www.nist.gov/itl/ai-risk-management-framework', 'reference'],
      ['EU AI Act — record-keeping obligations', 'https://artificialintelligenceact.eu/article/12/', 'reference'],
      ['ISO/IEC 42001 — AI management systems', 'https://www.iso.org/standard/42001', 'reference'],
      ['OpenTelemetry — logs', 'https://opentelemetry.io/docs/concepts/signals/logs/', 'docs']
    ],
    questions: [
      ['How does audit differ from observability?', 'Observability is for you — debugging, sampled, short-lived, mutable. Audit is for someone else — complete for the decisions in scope, retained per regulation, immutable and access controlled.'],
      ['Why record document versions in an audit trail?', 'Source documents change. Without the version you cannot show what the system actually saw at the time, only what the document says now.'],
      ['What is not an acceptable answer to a regulator?', '"The AI decided." For consequential decisions you must be able to show what information was used, what the system produced, and which human approved it.']
    ]
  },

  {
    id: 'explainability',
    title: 'Explainability',
    domain: 'responsible-ai', tier: 2, priority: 'medium',
    summary: 'Being able to say why a system produced an output — and being honest about what you can and cannot say.',
    what: `Explainability is the ability to give a meaningful account of why a system produced a particular output. For LLMs it is genuinely limited, and being precise about the limits is more useful than overclaiming.`,
    why: `Regulations increasingly require explanation for automated decisions affecting people. Users need enough to trust or challenge an output. And overclaiming — presenting a chain-of-thought trace as the model's actual reasoning — is a real risk, because those traces can be unfaithful.`,
    analogy: `Asking someone why they found a book persuasive. They can tell you which passages they read and which arguments they found compelling. They cannot give you a mechanistic account of what happened in their brain, and any account they invent will sound plausible.`,
    technical: `What you **can** honestly explain:
- **What information was used** — the retrieved chunks, with sources. This is the strongest form available and usually sufficient.
- **Citations** — which source supports which claim.
- **Which inputs mattered** — attribution methods give approximate influence.
- **The decision rule** — if a threshold or a rule produced the outcome, that is fully explainable.

What you **cannot** honestly explain:
- Why the model weighted things as it did.
- A mechanistic account of the generation.
- **Chain-of-thought as reasoning** — research shows stated reasoning can be unfaithful, so a trace is a performance technique, not an explanation.

The practical implication: if a decision must be explainable, **put the explainable part outside the model**. Compute the decision with a rule or a model whose logic you can state, and use the LLM to explain that decision in plain language. That is both more honest and more useful than trying to extract an explanation from the LLM's own process.`,
    diagram: `
   WHAT YOU CAN HONESTLY SAY

     ✓ WHAT INFORMATION WAS USED
       "This answer used billing-policy.pdf p.4, version 2026-Q1"
       ← strongest available, and usually sufficient

     ✓ CITATIONS
       claim → source, checkable by a human

     ✓ THE DECISION RULE
       "Refused because groundedness was 0.61, below the 0.80 gate"
       ← fully explainable, because it IS a rule

     ✓ APPROXIMATE INPUT INFLUENCE
       attribution methods, with caveats

   WHAT YOU CANNOT HONESTLY SAY

     ✗ why the model weighted things as it did
     ✗ a mechanistic account of generation
     ✗ chain-of-thought as "the reasoning"
       ← research shows stated reasoning can be UNFAITHFUL
         and faithful traces look identical to unfaithful ones

   ⚠ THE DESIGN MOVE

     if a decision must be explainable,
     put the EXPLAINABLE PART OUTSIDE THE MODEL

       rule/model you can state  →  decides
       LLM                       →  explains that decision
                                    in plain language

     More honest AND more useful than extracting an
     explanation from the LLM's own process.`,
    example: {
      language: 'python',
      caption: 'A decision that is explainable because the logic is outside the model',
      code: `# ── THE DECISION: a rule you can state completely ──────────
def refund_eligibility(order, policy):
    """Deterministic. Every branch is explainable by construction."""
    days = (today() - order.purchase_date).days
    reasons = []

    if order.plan == "annual":
        eligible = days <= policy.annual_window_days
        reasons.append(f"Annual plan. Purchased {days} days ago. "
                       f"Policy window is {policy.annual_window_days} days.")
    else:
        eligible = days <= policy.monthly_window_days
        reasons.append(f"Monthly plan. Purchased {days} days ago. "
                       f"Policy window is {policy.monthly_window_days} days.")

    if order.status == "refunded":
        eligible = False
        reasons.append("This order has already been refunded.")

    return {"eligible": eligible, "reasons": reasons,
            "policy_version": policy.version, "days_since": days}


# ── THE EXPLANATION: the LLM puts it in plain language ─────
def explain(decision, user_language):
    return llm(f"""Explain this decision to a customer in plain language.
Use ONLY the facts below. Do not add reasoning of your own.
Do not speculate about exceptions.

Decision: {'eligible' if decision['eligible'] else 'not eligible'} for a refund
Facts:
{chr(10).join('- ' + r for r in decision['reasons'])}
Policy version: {decision['policy_version']}

Reply in {user_language}, under 60 words.""")


# ── WHAT THE USER AND THE AUDITOR EACH GET ─────────────────
result = refund_eligibility(order, policy)
response = {
    "decision": result["eligible"],
    "explanation": explain(result, user.language),      # for the user
    "reasons": result["reasons"],                       # for the auditor
    "policy_version": result["policy_version"],
    "decided_by": "rule_engine",                        # NOT "the AI"
}

# The model wrote the sentence. The RULE made the decision, and
# the rule is fully explainable. That is a defensible design.`
    },
    prereq: ['auditability'], next: ['human-in-the-loop'],
    related: ['chain-of-thought', 'generation-citations', 'ai-trust', 'model-governance'],
    tools: ['anthropic'],
    useCases: [
      'Meeting an explainability requirement for an automated decision.',
      'Designing a system where the decision logic is stateable.',
      'Giving users enough to trust or challenge an output.'
    ],
    avoid: [
      'Presenting chain-of-thought as the model’s actual reasoning.',
      'Claiming a mechanistic explanation of an LLM output.',
      'LLM-only decisions where explanation is a hard requirement.'
    ],
    mistakes: [
      'Showing a reasoning trace to users as "why the AI decided this".',
      'Using attribution methods without stating that they are approximate.',
      'Building an LLM-only decision in a context that requires explanation.',
      'Confusing citations with explanation — a citation shows the source, not the reasoning.',
      'Overclaiming, which is worse than saying honestly what you can and cannot explain.'
    ],
    keyTerms: [
      ['explainability', 'A meaningful account of why an output was produced.'],
      ['interpretability', 'Understanding the mechanism. Very limited for LLMs.'],
      ['citation', 'Which source supports which claim. Not an explanation of reasoning.'],
      ['unfaithful reasoning', 'A stated rationale that does not reflect the computation.'],
      ['attribution', 'Approximate measures of which inputs influenced an output.'],
      ['decision rule', 'Logic outside the model that can be stated completely.'],
      ['overclaiming', 'Presenting more explanatory power than you actually have.']
    ],
    resources: [
      ['Measuring Faithfulness in Chain-of-Thought Reasoning', 'https://arxiv.org/abs/2307.13702', 'paper'],
      ['EU AI Act — transparency obligations', 'https://artificialintelligenceact.eu/article/13/', 'reference'],
      ['NIST — Explainable AI principles', 'https://www.nist.gov/publications/four-principles-explainable-artificial-intelligence', 'paper'],
      ['Google — People + AI Guidebook: explainability', 'https://pair.withgoogle.com/chapter/explainability-trust/', 'reference']
    ],
    questions: [
      ['What can you honestly explain about an LLM output?', 'What information it used, with sources and versions; which source supports which claim; and any decision rule applied outside the model. Not why the model weighted things as it did.'],
      ['Why is chain-of-thought not an explanation?', 'Stated reasoning can be unfaithful — the model may reach an answer and produce a plausible rationale that does not reflect the actual computation. Faithful and unfaithful traces are indistinguishable.'],
      ['What is the design move when explainability is required?', 'Put the decision logic outside the model. A rule or a stateable model makes the decision; the LLM explains that decision in plain language. Honest and more useful.']
    ]
  },

  {
    id: 'human-in-the-loop',
    title: 'Human in the Loop',
    domain: 'responsible-ai', tier: 1, priority: 'high',
    summary: 'Deciding which decisions a person must make, review or be able to override.',
    what: `Human-in-the-loop means a person is involved in an AI-assisted decision — approving before it takes effect, reviewing a sample afterwards, or having a clear route to override.

Three distinct patterns, often conflated.`,
    why: `It is the primary control for consequential AI decisions and the answer to most "what if it is wrong?" questions. It is also frequently designed badly: reviewers who rubber-stamp, or override paths nobody can find.`,
    analogy: `A second signature on a large payment. It only works if the second signer actually looks — and if they have both the information and the authority to say no.`,
    technical: `Three patterns:

**In the loop** — the human approves *before* the action takes effect. For irreversible or high-consequence actions. Slow, and the strongest control.

**On the loop** — the system acts, a human reviews a sample afterwards. For high-volume, reversible decisions. Scales; catches systematic problems rather than individual ones.

**Over the loop** — the system acts, and the affected person can appeal or override. The minimum for anything affecting a person.

The failure mode is **rubber-stamping**. A reviewer approving 200 items an hour is not reviewing. Counter it by: showing the evidence rather than just the recommendation, surfacing the system's confidence, making disagreement easy and tracked, monitoring approval rates (near-100% means the review is not functioning), and sizing the queue so genuine review is possible.

**Automation bias** is real: people defer to a confident system even when it is wrong. Presenting a recommendation *with its evidence* rather than as a verdict measurably reduces it.`,
    diagram: `
   THREE PATTERNS

   IN THE LOOP        human approves BEFORE the action
                      irreversible · high consequence
                      slow · strongest

   ON THE LOOP        system acts · human reviews a SAMPLE after
                      high volume · reversible
                      scales · catches systematic problems

   OVER THE LOOP      system acts · affected person can appeal
                      the MINIMUM for anything affecting a person

   ⚠ THE FAILURE MODE IS RUBBER-STAMPING

     approval rate 99.7%   the review is not functioning
     200 items / hour      that is not review, it is clicking

   COUNTERING IT

     show the EVIDENCE, not just the recommendation
     surface the system's CONFIDENCE
     make DISAGREEMENT easy — and track it
     MONITOR approval rate — near 100% is a red flag
     SIZE the queue so real review is possible

   ⚠ AUTOMATION BIAS

     people defer to a confident system even when it is wrong

     "Recommendation: APPROVE"          → high deference
     "Suggested: approve. Confidence     → lower deference,
      0.62. Similar past cases: 3          better decisions
      approved, 2 rejected. Evidence: …"

     Presenting evidence rather than a verdict measurably
     improves reviewer accuracy.`,
    example: {
      language: 'python',
      caption: 'A review queue designed against rubber-stamping',
      code: `def route_decision(case, ai_result, policy):
    """Route by consequence and confidence, not by convenience."""
    if policy.is_irreversible(case.action) or case.value > policy.approval_threshold:
        return queue_for_approval(case, ai_result, pattern="in_the_loop")

    if ai_result["confidence"] < policy.auto_threshold:
        return queue_for_approval(case, ai_result, pattern="in_the_loop")

    outcome = execute(case, ai_result)
    if random.random() < policy.review_sample_rate:      # on the loop
        queue_for_review(case, ai_result, outcome, pattern="on_the_loop")
    return outcome


def build_review_item(case, ai_result):
    """Show EVIDENCE, not a verdict. This is the anti-rubber-stamp design."""
    return {
        "case_id": case.id,
        # deliberately NOT phrased as "APPROVE"
        "suggestion": ai_result["recommendation"],
        "confidence": ai_result["confidence"],
        # the evidence the reviewer needs to disagree
        "evidence": [{"source": c["source"], "page": c["page"],
                      "quote": c["text"]} for c in ai_result["chunks"]],
        "policy_applied": ai_result["policy_version"],
        "similar_cases": recent_similar(case, limit=5),   # incl. outcomes
        "why_flagged": ai_result.get("flag_reason"),
        # disagreement must be as easy as agreement
        "actions": ["approve", "reject", "modify", "escalate"],
        "reason_required_if": ["reject", "modify"],
    }


# ── MONITOR THE REVIEW ITSELF ──────────────────────────────
def review_health(window="7d"):
    stats = review_store.stats(window)
    warnings = []
    if stats["approval_rate"] > 0.98:
        warnings.append("approval rate 98%+ — review may be rubber-stamping")
    if stats["median_seconds_per_item"] < 15:
        warnings.append("median review under 15s — too fast to be real review")
    if stats["queue_depth"] > stats["daily_capacity"] * 2:
        warnings.append("queue exceeds capacity — reviewers under pressure")
    return {**stats, "warnings": warnings}

# A human-in-the-loop control that nobody has time to exercise
# is a control on paper only.`
    },
    prereq: ['ai-risk'], next: ['model-governance'],
    related: ['agent-failure-modes', 'safety-filters', 'ai-ux', 'planning', 'refusal-quality'],
    tools: ['langgraph'],
    useCases: [
      'Designing approval for consequential or irreversible AI actions.',
      'Sampling review for high-volume automated decisions.',
      'Meeting a regulatory requirement for human oversight.'
    ],
    avoid: [
      'Approval on every low-stakes decision — the queue becomes unreviewable.',
      'Human review as a checkbox with no capacity to exercise it.'
    ],
    mistakes: [
      'Reviewers shown a verdict rather than the evidence, which maximises automation bias.',
      'Not monitoring approval rate, so rubber-stamping is invisible.',
      'A queue larger than capacity, guaranteeing superficial review.',
      'Making disagreement harder than agreement.',
      'Confusing the three patterns — sample review is not pre-approval.'
    ],
    keyTerms: [
      ['human in the loop', 'A person approves before the action takes effect.'],
      ['human on the loop', 'A person reviews a sample after the fact.'],
      ['human over the loop', 'The affected person can appeal or override.'],
      ['rubber-stamping', 'Approving without genuinely reviewing.'],
      ['automation bias', 'Deferring to a confident system even when it is wrong.'],
      ['review capacity', 'How many items can genuinely be reviewed.'],
      ['override path', 'How an affected person challenges a decision.']
    ],
    resources: [
      ['EU AI Act — human oversight', 'https://artificialintelligenceact.eu/article/14/', 'reference'],
      ['Google — People + AI Guidebook', 'https://pair.withgoogle.com/guidebook/', 'reference'],
      ['Microsoft — HAX design guidelines', 'https://www.microsoft.com/en-us/haxtoolkit/ai-guidelines/', 'reference'],
      ['NIST — AI Risk Management Framework', 'https://www.nist.gov/itl/ai-risk-management-framework', 'reference']
    ],
    questions: [
      ['What are the three human-oversight patterns?', 'In the loop — approval before the action. On the loop — sampled review afterwards. Over the loop — the affected person can appeal. They suit different consequence and volume profiles.'],
      ['What is the main failure mode, and how do you detect it?', 'Rubber-stamping. Detect it by monitoring approval rate and time per item — 98%+ approval or a median under fifteen seconds means the review is not functioning.'],
      ['How do you reduce automation bias?', 'Present the evidence and the system’s confidence rather than a verdict, make disagreement as easy as agreement, and size the queue so genuine review is possible.']
    ],
    interview: {
      s30: 'Human-in-the-loop means a person approves before an action, reviews a sample after, or can override. Which pattern you need depends on how consequential and how reversible the decision is.',
      s90: 'It is the main answer to "what if the AI is wrong", and it is also the control most often designed badly. The failure mode is rubber-stamping: a reviewer approving two hundred items an hour is clicking, not reviewing, and the control exists only on paper. So I design against it explicitly — show the reviewer the evidence rather than a verdict, because presenting "APPROVE" maximises automation bias while presenting the retrieved sources and a confidence score measurably improves accuracy; make disagreement as easy as agreement and track it; and monitor the approval rate, because ninety-eight percent approval is a red flag rather than a sign the AI is good. And I size the queue against actual capacity, because a review queue larger than the team can process guarantees superficial review.',
      pm: 'It is how a high-risk AI feature becomes shippable, but only if the review is real — so the operational design matters as much as the decision to have it.'
    }
  },

  {
    id: 'model-governance',
    title: 'Model Governance',
    domain: 'responsible-ai', tier: 2, priority: 'medium',
    summary: 'Knowing which models are in use, who owns them, and what they are approved to do.',
    what: `Model governance is the organisational practice of tracking which models are deployed, in which features, with what approvals, owned by whom, and reviewed on what schedule.`,
    why: `Without it, an organisation cannot answer basic questions: which features use AI, what data do they touch, who approved them, and what happens when a model is deprecated. Those questions arrive from security reviews, auditors and incidents — usually at short notice.`,
    analogy: `An asset register. Unglamorous, and the difference between "we have 14 models, here they are, here are their owners" and a three-week discovery exercise.`,
    technical: `A model inventory records, per deployed model: which features use it, the provider and exact version, the data it processes, its risk classification, the evaluation results that justified deployment, the owner, the approval record, and the review date.

Governance processes worth having:
- **Approval before deployment**, proportionate to risk. Low-risk features need a light check; high-risk need documented sign-off.
- **Version pinning and change management** — a provider model update is a change requiring re-evaluation.
- **Deprecation handling** — providers retire versions with notice, and an unmanaged deprecation is an outage.
- **Periodic review** — is this still performing, still needed, still appropriate?
- **Incident process** — who is called when an AI feature misbehaves.

The lightest useful version is a single maintained spreadsheet. The failure is having nothing, and discovering during a security review that nobody knows how many AI features exist.`,
    diagram: `
   THE MODEL INVENTORY — one row per deployed model

     feature            support assistant
     model              claude-sonnet-5 (PINNED, not "latest")
     provider           Anthropic
     data processed     customer questions · billing docs
     PII                yes, redacted at boundary
     risk class         medium (customer-facing, reversible)
     evaluation         groundedness 0.93 · over-refusal 0.04
                        (evals/2026-03-11, golden_v3)
     approved by        Head of Product, 2026-03-14
     owner              Support Platform team
     review due         2026-09-14
     deprecation        provider notice → re-evaluate → migrate

   THE QUESTIONS THIS ANSWERS IN MINUTES

     which features use AI?
     which touch customer data?
     who approved this, and on what evidence?
     what happens when this version is retired?
     when was it last reviewed?

   ⚠ WITHOUT IT, THOSE ARE A THREE-WEEK DISCOVERY EXERCISE
     — usually requested at short notice by a security review
     or after an incident.

   PROPORTIONATE APPROVAL

     low risk     internal, reversible     light check
     medium       customer-facing          documented sign-off
     high         money · access · rights  formal review +
                                           human-in-the-loop

   ⚠ "latest" IS NOT A VERSION.
     Pinning is a governance control, not just an engineering one.`,
    example: {
      language: 'text',
      caption: 'A minimal but genuinely useful model inventory',
      code: `MODEL INVENTORY — reviewed quarterly

┌─ support-assistant ──────────────────────────────────────┐
│ model         claude-sonnet-5              (pinned)      │
│ used in       support chat · help centre search          │
│ data          customer questions, billing docs           │
│ PII           yes — redacted before storage              │
│ risk          MEDIUM (customer-facing, reversible)       │
│ evidence      golden_v3: groundedness 0.93,              │
│               over-refusal 0.04, 240 cases               │
│ approved      Head of Product · 2026-03-14               │
│ owner         Support Platform                           │
│ oncall        #support-platform                          │
│ review due    2026-09-14                                 │
└──────────────────────────────────────────────────────────┘

┌─ ticket-classifier ──────────────────────────────────────┐
│ model         fine-tuned haiku-4.5 (adapter v7)          │
│ used in       ticket triage                              │
│ data          ticket text                                │
│ PII           yes — de-identified BEFORE training        │
│ risk          LOW (internal, reversible, reviewed)       │
│ evidence      F1 0.88 macro, held-out set 2026-02        │
│ approved      Engineering Lead · 2026-02-20              │
│ owner         Support Platform                           │
│ review due    2026-08-20                                 │
└──────────────────────────────────────────────────────────┘

┌─ refund-eligibility ─────────────────────────────────────┐
│ model         RULE ENGINE (not a model)                  │
│ used in       refund decisions                           │
│ risk          HIGH (money) — deliberately NOT an LLM     │
│ human         in-the-loop approval on every refund       │
│ owner         Billing                                    │
└──────────────────────────────────────────────────────────┘

CHANGE LOG
  2026-03-14  support-assistant: sonnet-4.5 → sonnet-5
              re-ran golden_v3; groundedness 0.91 → 0.93
              approved by Head of Product
  2026-01-08  provider deprecation notice for sonnet-4
              → migrated, re-evaluated, no regression

⚠ The third row is the interesting one: recording where you
  deliberately did NOT use a model is as valuable as recording
  where you did.`
    },
    prereq: ['auditability'], next: ['risk-assessment'],
    related: ['model-versioning', 'model-registry', 'nist-ai-rmf', 'eu-ai-act'],
    tools: [],
    useCases: [
      'Answering a security review without a discovery exercise.',
      'Managing provider model deprecations without an outage.',
      'Establishing ownership for every AI feature.'
    ],
    avoid: [
      'Heavyweight governance on a prototype nobody depends on.',
      'A governance process with no owner, which decays immediately.'
    ],
    mistakes: [
      'No inventory, so nobody knows how many AI features exist.',
      'Using "latest" instead of a pinned version, so behaviour changes without a change record.',
      'No deprecation handling, turning a provider notice into an outage.',
      'Approval processes with no proportionality, so everything is either unreviewed or over-reviewed.',
      'No owner or on-call route for an AI feature.'
    ],
    keyTerms: [
      ['model inventory', 'The register of deployed models and their context.'],
      ['risk classification', 'How consequential a feature is; drives approval depth.'],
      ['version pinning', 'Fixing the exact model version. A governance control.'],
      ['deprecation', 'A provider retiring a model version.'],
      ['periodic review', 'Re-checking whether a model is still appropriate.'],
      ['approval record', 'Who signed off, on what evidence, when.'],
      ['owner', 'The team accountable for the feature.']
    ],
    resources: [
      ['NIST — AI Risk Management Framework', 'https://www.nist.gov/itl/ai-risk-management-framework', 'reference'],
      ['ISO/IEC 42001 — AI management systems', 'https://www.iso.org/standard/42001', 'reference'],
      ['Anthropic — model deprecations', 'https://docs.anthropic.com/en/docs/about-claude/model-deprecations', 'docs'],
      ['Google — Model Cards for model reporting (paper)', 'https://arxiv.org/abs/1810.03993', 'paper']
    ],
    questions: [
      ['What questions does a model inventory answer in minutes rather than weeks?', 'Which features use AI, which touch customer data, who approved them on what evidence, what happens when a version is retired, and when each was last reviewed.'],
      ['Why is version pinning a governance control?', 'Using "latest" means the model behind a feature can change without any change record, approval or re-evaluation. Pinning makes every change deliberate and traceable.'],
      ['Why record where you deliberately did not use a model?', 'It documents a considered decision. "Refund eligibility is a rule engine, not an LLM, because it involves money" is exactly what a reviewer wants to see.']
    ]
  },

  {
    id: 'risk-assessment',
    title: 'AI Risk Assessment',
    domain: 'responsible-ai', tier: 2, priority: 'high',
    summary: 'Working out what could go wrong, how badly, and what to do about it — before building.',
    what: `Risk assessment identifies what could go wrong with an AI feature, how likely and severe each failure is, who it affects, and what controls reduce it to an acceptable level.`,
    why: `It is far cheaper before building than after an incident, and it produces the design constraints — human review, scope limits, tool restrictions — that make a feature shippable. It is also what a security or compliance review will ask for.`,
    analogy: `A pre-flight check. Not paperwork for its own sake; a short list of things that would be very expensive to discover in the air.`,
    technical: `A workable structure:

**1. What could go wrong?** Be concrete. Not "the AI might be wrong" but "it could quote a superseded refund policy and a customer could act on it".

**2. Who is affected?** Users, non-users, employees, the business. Harms to people outside the transaction are the ones most often missed.

**3. How severe, and how reversible?** Reversibility matters as much as severity. A wrong answer a user can check is very different from an irreversible action.

**4. How likely?** Use evaluation data where you have it rather than intuition.

**5. What controls reduce it?** Scope restriction, human review, tool limits, guardrails, monitoring, and a clear rollback.

**6. What is the residual risk, and who accepts it?** Named acceptance, not an implicit assumption.

The most useful output is usually a small number of **design constraints**: this feature will not have write access, this decision requires approval, this scope is restricted. Those are worth more than the document.`,
    diagram: `
   THE ASSESSMENT — concrete, not abstract

     ✗ "the AI might be wrong"
     ✓ "it could quote a superseded refund policy and a
        customer could act on it, losing money"

   THE SEVERITY × REVERSIBILITY GRID

                         reversible      irreversible
                    ┌────────────────┬────────────────┐
     high severity  │ monitor +      │ HUMAN APPROVAL │
                    │ fast rollback  │ mandatory      │
                    ├────────────────┼────────────────┤
     low severity   │ ship it        │ review sample  │
                    │ monitor        │ + easy undo    │
                    └────────────────┴────────────────┘

     REVERSIBILITY MATTERS AS MUCH AS SEVERITY.
     A wrong answer the user can check is a different
     product from a wrong action they cannot undo.

   WHO IS AFFECTED — the row most often missed

     users            obvious
     non-users        ← the one people forget
     employees        reviewers, support staff
     the business     cost, reputation, regulatory

   THE USEFUL OUTPUT IS DESIGN CONSTRAINTS

     "no write tools in v1"
     "refunds require human approval"
     "scope restricted to billing"
     "rollback must be under 5 minutes"

     Those constraints are worth more than the document.

   ⚠ RESIDUAL RISK NEEDS A NAMED ACCEPTOR.
     Not an implicit assumption that someone is comfortable.`,
    example: {
      language: 'text',
      caption: 'A risk assessment that produced design constraints',
      code: `FEATURE: AI support assistant answering billing questions,
         with the ability to issue refunds up to ₹5,000.

── RISK 1: quotes a superseded policy ─────────────────────
  affected     customer, support team
  severity     medium — customer acts on wrong information
  reversible   yes — correctable, but reputational cost
  likelihood   measured: 4% of answers cited a superseded doc
               in the pilot evaluation
  controls     · version filter at retrieval (superseded = false)
               · citation shown with document version
               · groundedness gate at 0.85
  residual     low
  accepted by  Head of Support

── RISK 2: issues a refund to the wrong customer ──────────
  affected     two customers, finance
  severity     HIGH — money moved incorrectly
  reversible   partially — recoverable but painful, and visible
  likelihood   low, but non-zero (hallucinated order id observed
               twice in 500 pilot cases)
  controls     · order id verified against the database before
                 any refund tool call
               · human approval required on EVERY refund
               · idempotency key prevents double refunds
               · ₹5,000 per-refund and ₹50,000 daily cap
  residual     low
  accepted by  Head of Finance

── RISK 3: leaks another customer's data ──────────────────
  affected     a customer who is not in the conversation
  severity     HIGH — regulatory and contractual
  reversible   NO — disclosure cannot be undone
  likelihood   low with controls, catastrophic without
  controls     · tenant + ACL filter at retrieval
               · post-retrieval assertion raising on mismatch
               · output PII scan
               · audit log of every retrieval
  residual     low
  accepted by  CTO

── DESIGN CONSTRAINTS PRODUCED ────────────────────────────
  1. No write tools in v1 except refunds, behind approval.
  2. Every refund requires human approval. Non-negotiable.
  3. Scope restricted to billing. Out-of-scope → escalate.
  4. Rollback to the previous prompt version under 5 minutes.
  5. Weekly review of gate trips and escalations for 8 weeks.

  ← These five lines are the actual value of the exercise.`
    },
    prereq: ['ai-risk'], next: ['nist-ai-rmf'],
    related: ['human-in-the-loop', 'model-governance', 'ai-feasibility', 'agent-failure-modes'],
    tools: [],
    useCases: [
      'Scoping an AI feature before building it.',
      'Producing the design constraints that make a risky feature shippable.',
      'Preparing for a security or compliance review.'
    ],
    avoid: [
      'Assessment as a document exercise producing no design constraints.',
      'Heavyweight process for a low-risk internal prototype.'
    ],
    mistakes: [
      'Abstract risks ("the AI might be wrong") that produce no controls.',
      'Considering only users, not people affected who never used the product.',
      'Ignoring reversibility, which matters as much as severity.',
      'Guessing likelihood when pilot evaluation data exists.',
      'Residual risk with no named acceptor.'
    ],
    keyTerms: [
      ['risk assessment', 'Identifying what could go wrong and what reduces it.'],
      ['severity', 'How bad the outcome is.'],
      ['reversibility', 'Whether the harm can be undone. As important as severity.'],
      ['likelihood', 'How often it would happen. Use evaluation data.'],
      ['control', 'A measure reducing likelihood or severity.'],
      ['residual risk', 'What remains after controls, and who accepts it.'],
      ['design constraint', 'The actionable output of the exercise.']
    ],
    resources: [
      ['NIST — AI Risk Management Framework', 'https://www.nist.gov/itl/ai-risk-management-framework', 'reference'],
      ['NIST — Generative AI Profile', 'https://www.nist.gov/publications/artificial-intelligence-risk-management-framework-generative-artificial-intelligence', 'paper'],
      ['EU AI Act — risk classification', 'https://artificialintelligenceact.eu/high-level-summary/', 'reference'],
      ['Microsoft — Responsible AI Impact Assessment', 'https://www.microsoft.com/en-us/ai/responsible-ai-resources', 'reference']
    ],
    questions: [
      ['What is the actual output of a risk assessment?', 'A small number of design constraints — no write tools, approval required on refunds, scope restricted, rollback under five minutes. The document is the record; the constraints are the value.'],
      ['Why does reversibility matter as much as severity?', 'A wrong answer a user can check is a very different product from an irreversible action they cannot undo. Reversibility determines whether monitoring suffices or approval is mandatory.'],
      ['Which affected group is most often missed?', 'People affected who never used the product — the other customer whose data leaked, the applicant screened out. Harms outside the transaction are easy to overlook.']
    ]
  },

  {
    id: 'nist-ai-rmf',
    title: 'NIST AI Risk Management Framework',
    domain: 'responsible-ai', tier: 3, priority: 'medium',
    summary: 'A voluntary US framework for managing AI risk, structured around four functions.',
    what: `The NIST AI RMF is a voluntary framework for identifying and managing AI risks, organised into four functions: **Govern**, **Map**, **Measure** and **Manage**.

It is descriptive rather than prescriptive — it tells you what to consider, not what to do.`,
    why: `It is the most commonly referenced AI risk framework in the US, it is free, and it gives a shared vocabulary for conversations with security and compliance teams. Even where it is not required, its structure is a useful checklist.`,
    analogy: `A recipe framework rather than a recipe. It tells you that you need a protein, a starch and a vegetable, and leaves the dish to you.`,
    technical: `The four functions:

**Govern** — culture, policies, roles and accountability. Who owns AI risk, and how decisions get made. This is the one organisations skip and then discover they need.

**Map** — understand the context: what the system does, who it affects, what the intended and unintended uses are, and what could go wrong.

**Measure** — assess and track: evaluation, metrics, monitoring, and testing for the risks identified in Map.

**Manage** — act on it: prioritise, apply controls, respond to incidents, and decide what risk to accept.

The **Generative AI Profile** (NIST AI 600-1) adds guidance specific to generative systems, including hallucination, data leakage and harmful content.

Practically, its value is as a checklist and a common vocabulary. It is voluntary, so it is not a compliance obligation in itself — but it maps onto ISO 42001 and onto the EU AI Act's requirements, which makes it useful groundwork even in regulated markets.`,
    diagram: `
   THE FOUR FUNCTIONS

     GOVERN     culture · policies · roles · accountability
                "who owns AI risk, and how are decisions made?"
                ← the one organisations skip, then need urgently

     MAP        context · affected people · intended and
                unintended uses · what could go wrong

     MEASURE    evaluation · metrics · monitoring · testing
                for the risks identified in MAP

     MANAGE     prioritise · apply controls · respond to
                incidents · accept residual risk

   GOVERN wraps the other three — it is not a stage,
   it is the standing structure.

   HOW IT MAPS TO WHAT YOU ALREADY DO

     MAP      →  risk assessment · use-case scoping
     MEASURE  →  golden sets · evaluation · monitoring
     MANAGE   →  guardrails · human-in-the-loop · rollback
     GOVERN   →  model inventory · ownership · approval

   ⚠ IT IS VOLUNTARY AND DESCRIPTIVE

     It tells you what to CONSIDER, not what to DO.
     Its value is a shared vocabulary with security and
     compliance, and a checklist that catches omissions.

   ALSO: the GENERATIVE AI PROFILE (NIST AI 600-1)
     adds guidance specific to generative systems —
     hallucination, data leakage, harmful content.`,
    example: {
      language: 'text',
      caption: 'The four functions applied to a real feature',
      code: `FEATURE: AI support assistant

── GOVERN ─────────────────────────────────────────────────
  owner              Support Platform team
  risk owner         Head of Support
  approval           documented sign-off required for
                     customer-facing AI features
  policy             AI features may not take irreversible
                     actions without human approval
  review cadence     quarterly
  incident route     #support-platform, escalate to CTO

── MAP ────────────────────────────────────────────────────
  purpose            answer billing questions from documentation
  users              customers, support agents
  also affected      customers whose data is in the corpus
  intended use       billing questions
  foreseeable misuse attempts to extract other customers' data;
                     attempts to obtain refunds not owed
  what could go wrong wrong policy quoted · data leak ·
                     unauthorised refund · over-refusal

── MEASURE ────────────────────────────────────────────────
  golden set         240 cases incl. 36 should-refuse
  metrics            groundedness · relevance · over-refusal
                     · cost · p95 latency
  gates              groundedness ≥ 0.85 to show
  monitoring         sampled online eval 3% · hallucination
                     rate · gate trip rate · escalation rate
  drift              quarterly golden-set review for concept drift

── MANAGE ─────────────────────────────────────────────────
  controls           ACL filter + assertion · version filter
                     · human approval on refunds · scope limit
  rollback           prompt versions hot-loaded, revert < 5 min
  incident response  runbook + on-call
  residual risk      accepted by Head of Support (medium),
                     CTO (data leak, low)

── WHY THIS IS USEFUL ─────────────────────────────────────
  Nothing here is new work. It is the work already being done,
  arranged so a security reviewer can see it in ten minutes
  instead of interviewing four people.`
    },
    prereq: ['risk-assessment'], next: ['eu-ai-act'],
    related: ['model-governance', 'why-eval', 'human-in-the-loop', 'india-dpdpa'],
    tools: [],
    useCases: [
      'Structuring an AI risk conversation with security or compliance.',
      'A checklist that catches omissions before a review does.',
      'Groundwork that maps onto ISO 42001 and the EU AI Act.'
    ],
    avoid: [
      'Treating it as a compliance obligation — it is voluntary.',
      'Adopting the full framework for a low-risk internal prototype.'
    ],
    mistakes: [
      'Skipping Govern, which is the function that makes the others durable.',
      'Treating it as prescriptive when it is deliberately descriptive.',
      'Producing framework documentation that does not connect to actual controls.',
      'Assuming it satisfies EU AI Act obligations, which it does not by itself.'
    ],
    keyTerms: [
      ['AI RMF', 'NIST AI Risk Management Framework.'],
      ['Govern', 'Culture, policy, roles and accountability.'],
      ['Map', 'Understanding context, users and potential harms.'],
      ['Measure', 'Evaluation, metrics and monitoring.'],
      ['Manage', 'Controls, incident response and risk acceptance.'],
      ['Generative AI Profile', 'NIST AI 600-1, guidance specific to generative systems.'],
      ['voluntary framework', 'Not a legal obligation; a structure and vocabulary.']
    ],
    resources: [
      ['NIST — AI Risk Management Framework', 'https://www.nist.gov/itl/ai-risk-management-framework', 'reference'],
      ['NIST AI 600-1 — Generative AI Profile', 'https://www.nist.gov/itl/ai-risk-management-framework', 'paper'],
      ['NIST — AI RMF Playbook', 'https://airc.nist.gov/AI_RMF_Knowledge_Base/Playbook', 'reference'],
      ['ISO/IEC 42001', 'https://www.iso.org/standard/42001', 'reference']
    ],
    questions: [
      ['What are the four NIST AI RMF functions?', 'Govern (culture, policy, accountability), Map (context and potential harms), Measure (evaluation and monitoring), and Manage (controls and incident response). Govern wraps the other three.'],
      ['Which function do organisations most often skip?', 'Govern. It is the standing structure — ownership, policy, approval — and without it the other three decay after the first project.'],
      ['Is following the AI RMF a compliance obligation?', 'No. It is voluntary and descriptive. Its value is a shared vocabulary and a checklist, and it maps usefully onto ISO 42001 and EU AI Act requirements.']
    ]
  },

  {
    id: 'eu-ai-act',
    title: 'EU AI Act (Conceptually)',
    domain: 'responsible-ai', tier: 3, priority: 'medium',
    summary: 'Risk-tiered AI regulation with obligations that scale to how consequential a system is.',
    what: `The EU AI Act regulates AI systems by risk tier: **unacceptable** (prohibited), **high-risk** (heavy obligations), **limited risk** (transparency obligations), and **minimal risk** (essentially unregulated).

Obligations attach to the *use case*, not to the technology.`,
    why: `It applies to systems placed on the EU market regardless of where the provider is based, so it affects products built anywhere with EU users. And because obligations follow the use case, the same model can be minimal-risk in one feature and high-risk in another.`,
    analogy: `Food safety regulation. A packet of biscuits and infant formula are both food; the obligations are wildly different, and they attach to what the product is used for rather than to the ingredients.`,
    technical: `The tiers:

**Unacceptable** — prohibited outright. Social scoring by public authorities, certain biometric categorisation, manipulative systems exploiting vulnerabilities.

**High-risk** — permitted with substantial obligations: risk management, data governance, technical documentation, record-keeping, transparency, **human oversight**, accuracy and robustness, and conformity assessment. Covers areas such as employment decisions, credit scoring, education access, essential services, and safety components.

**Limited risk** — transparency obligations. Users must be told they are interacting with an AI system; synthetic content must be marked.

**Minimal risk** — most applications. No specific obligations.

There are separate obligations for **general-purpose AI models**, largely falling on model providers rather than on you as a deployer.

For a product manager: the practical question is whether your *use case* falls into a high-risk category. Answering a billing question is minimal or limited risk. Screening job applicants with the same model is high-risk. The technology did not change; the obligations did.

Get legal advice for an actual determination. This is orientation, not compliance guidance.`,
    diagram: `
   FOUR TIERS — obligations follow the USE CASE, not the model

   UNACCEPTABLE     prohibited
                    social scoring by authorities · certain
                    biometric categorisation · manipulative
                    systems exploiting vulnerabilities

   HIGH-RISK        permitted, with substantial obligations
                    employment · credit · education access
                    · essential services · safety components
                    → risk management · data governance
                      · technical documentation · record-keeping
                      · HUMAN OVERSIGHT · accuracy · robustness
                      · conformity assessment

   LIMITED RISK     transparency obligations
                    tell users they are interacting with AI
                    · mark synthetic content

   MINIMAL RISK     most applications · no specific obligations

   ⚠ THE SAME MODEL, TWO TIERS

     claude answering a billing question    → limited/minimal
     claude screening job applicants        → HIGH-RISK

     The technology did not change. The use case did.
     That is the whole framing.

   ⚠ EXTRATERRITORIAL

     applies to systems placed on the EU market regardless of
     where the provider is based

   ⚠ THIS IS ORIENTATION, NOT LEGAL ADVICE.
     Get an actual determination from counsel.`,
    example: {
      language: 'text',
      caption: 'The same model, three features, three risk positions',
      code: `THE SAME UNDERLYING MODEL, THREE FEATURES

── FEATURE A: billing question answering ──────────────────
  use case      answers customer questions from documentation
  tier          LIMITED RISK (transparency)
  obligations   · tell users they are talking to an AI
                · that is essentially it
  our controls  groundedness gate, citations, escalation path
                (good practice, not legally required here)

── FEATURE B: draft support replies for agents ────────────
  use case      suggests a reply; a human sends it
  tier          MINIMAL / LIMITED
  obligations   · disclosure to the agent (internal)
  note          the human decision point matters — the agent
                decides what to send

── FEATURE C: screening job applicants ────────────────────
  use case      ranks candidates for a role
  tier          HIGH-RISK — employment is an explicitly listed area
  obligations   · risk management system
                · data governance (bias, representativeness)
                · technical documentation
                · automatic record-keeping
                · transparency to affected persons
                · HUMAN OVERSIGHT with real authority to override
                · accuracy, robustness, cybersecurity
                · conformity assessment before market placement
  reality       this is a substantially different project.
                Same model. Entirely different obligations.

── THE PM TAKEAWAY ────────────────────────────────────────
  When someone proposes "let's use the same assistant for
  hiring", the correct response is not "sure, same model" —
  it is "that is a high-risk use case and a different project".

  Recognising which tier a use case falls into, early, is the
  skill. The determination itself belongs to counsel.`
    },
    prereq: ['nist-ai-rmf'], next: ['india-dpdpa'],
    related: ['human-in-the-loop', 'explainability', 'model-governance', 'auditability'],
    tools: [],
    useCases: [
      'Recognising early that a proposed use case is high-risk.',
      'Understanding why the same model carries different obligations in different features.',
      'Scoping the compliance work for an EU launch.'
    ],
    avoid: [
      'Treating this as legal advice — it is orientation only.',
      'Assuming obligations attach to the model rather than the use case.'
    ],
    mistakes: [
      'Assuming that because one AI feature is low-risk, all are.',
      'Not recognising that employment, credit and essential services are explicitly listed high-risk areas.',
      'Overlooking the extraterritorial scope for products with EU users.',
      'Treating transparency obligations as optional for limited-risk systems.',
      'Building a high-risk feature and discovering the obligations after launch.'
    ],
    keyTerms: [
      ['risk tier', 'Unacceptable, high, limited or minimal.'],
      ['high-risk system', 'Substantial obligations; employment, credit, essential services.'],
      ['transparency obligation', 'Telling users they are interacting with AI.'],
      ['human oversight', 'A required control for high-risk systems.'],
      ['conformity assessment', 'Verification before a high-risk system is placed on the market.'],
      ['GPAI', 'General-purpose AI model obligations, largely on providers.'],
      ['extraterritorial', 'Applies to systems on the EU market regardless of provider location.']
    ],
    resources: [
      ['EU AI Act — high-level summary', 'https://artificialintelligenceact.eu/high-level-summary/', 'reference'],
      ['EU AI Act — official text', 'https://eur-lex.europa.eu/eli/reg/2024/1689/oj', 'reference'],
      ['EU AI Act — implementation timeline', 'https://artificialintelligenceact.eu/implementation-timeline/', 'reference'],
      ['EU AI Act — Article 14, human oversight', 'https://artificialintelligenceact.eu/article/14/', 'reference']
    ],
    questions: [
      ['Do obligations attach to the model or the use case?', 'The use case. The same model answering billing questions is limited risk and screening job applicants is high-risk, with substantially different obligations.'],
      ['Which areas are explicitly high-risk?', 'Employment decisions, credit scoring, education access, essential services and safety components, among others. Recognising these early is the practical skill.'],
      ['Why does the Act matter to a product built outside the EU?', 'It applies to systems placed on the EU market regardless of where the provider is based, so any product with EU users is in scope.']
    ]
  },

  {
    id: 'india-dpdpa',
    title: 'India DPDP Act (Conceptually)',
    domain: 'responsible-ai', tier: 3, priority: 'medium',
    summary: 'India\'s data protection law, and what it means for systems that process personal data.',
    what: `The Digital Personal Data Protection Act 2023 governs the processing of digital personal data in India. It is a data protection law rather than an AI law, but AI systems process personal data constantly, so it applies directly.`,
    why: `It affects any product with Indian users, and its consent and purpose-limitation requirements interact awkwardly with how AI systems are usually built — particularly around retention of prompts, traces and training data.`,
    analogy: `Rules about what you may do with someone's post. Not about the postal service specifically, but every postal service is bound by them.`,
    technical: `Core concepts:
- **Data Principal** — the individual the data is about.
- **Data Fiduciary** — the entity deciding why and how data is processed. That is you.
- **Consent** — must be free, specific, informed, unconditional and unambiguous, with a clear notice, and it must be **withdrawable as easily as it was given**.
- **Purpose limitation** — data may be used only for the purpose consented to.
- **Data minimisation** — collect only what is necessary.
- **Significant Data Fiduciaries** — larger or higher-risk entities carry additional obligations including a Data Protection Officer and impact assessments.

The awkward interactions with AI systems:
- **Retention** — prompts and traces containing personal data need a defined retention period and a deletion mechanism.
- **Purpose limitation** — using support conversations to train a model is a different purpose from answering the question, and generally needs its own consent basis.
- **Erasure** — deletable from databases, traces and evaluation sets; **not** from model weights. This makes excluding personal data from training a practical necessity rather than a preference.
- **Cross-border transfer** — sending prompts to a model provider outside India is a transfer, subject to the government's restrictions.

Get local legal advice. This is orientation.`,
    diagram: `
   THE ROLES

     DATA PRINCIPAL     the individual
     DATA FIDUCIARY     you — you decide why and how
     DATA PROCESSOR     acts on your instructions

   THE PRINCIPLES THAT BITE FOR AI

     CONSENT            free · specific · informed
                        · withdrawable as easily as given

     PURPOSE LIMITATION only for the consented purpose
                        ⚠ "answer the question" ≠ "train a model"

     DATA MINIMISATION  collect only what is necessary
                        ⚠ traces capture everything by default

     ERASURE            on request

   ⚠ WHERE AI SYSTEMS RUB AGAINST THIS

     TRACES + LOGS      capture full prompts by default
                        → need retention periods and deletion

     TRAINING DATA      a DIFFERENT PURPOSE from serving
                        → generally needs its own consent basis
                        → and is IRREVERSIBLE, so exclusion is
                          the practical answer

     CROSS-BORDER       sending prompts to a provider outside
                        India is a transfer, subject to
                        government restrictions

   ⚠ ERASURE IS THE STRUCTURAL PROBLEM

     deletable:     database · traces · logs · eval sets
     NOT deletable: model weights

     Which makes excluding personal data from training a
     practical necessity, not a preference.

   ⚠ ORIENTATION, NOT LEGAL ADVICE.`,
    example: {
      language: 'text',
      caption: 'Designing an AI feature against DPDP requirements',
      code: `FEATURE: AI support assistant, Indian users

── CONSENT ────────────────────────────────────────────────
  notice        "Your message is processed by an AI assistant
                 to answer your question. It is retained for
                 30 days for quality monitoring."
  specific      one purpose: answering the question
  withdrawable  a visible control, as easy as giving consent
  ✗ NOT bundled with a general terms acceptance

── PURPOSE LIMITATION ─────────────────────────────────────
  consented     answering support questions
  also doing?   quality monitoring — disclosed in the notice
  NOT doing     training a model on conversations
                → that is a different purpose
                → would need its own consent basis
                → and is irreversible, so we simply do not

── DATA MINIMISATION ──────────────────────────────────────
  traces        redact PII at the boundary, before storage
  retention     30 days, enforced by a scheduled job
  access        restricted to the support platform team
  eval sets     promoted cases de-identified before promotion

── ERASURE ────────────────────────────────────────────────
  on request, delete:
    ✓ conversation records
    ✓ traces and logs referencing the principal
    ✓ any evaluation cases derived from their conversations
    ✓ feedback records
  and because we never train on this data, there is nothing
  in model weights to be unable to delete.
  ← that design choice is what makes erasure actually achievable

── CROSS-BORDER ───────────────────────────────────────────
  model provider outside India → this is a transfer
  · check current government restrictions
  · disclose in the notice
  · consider in-region inference if the position tightens

── THE DESIGN LESSON ──────────────────────────────────────
  The single decision that made compliance tractable was
  "we do not train on customer conversations". Everything
  else is deletable; weights are not.`
    },
    prereq: ['privacy-pii'], next: [],
    related: ['data-leakage', 'model-governance', 'training-dataset-prep', 'eu-ai-act'],
    tools: [],
    useCases: [
      'Designing an AI feature for Indian users.',
      'Deciding retention and deletion policy for prompts and traces.',
      'Understanding why training on customer data is a separate decision.'
    ],
    avoid: [
      'Treating this as legal advice — it is orientation.',
      'Bundling AI processing consent into general terms acceptance.'
    ],
    mistakes: [
      'Assuming consent for the service covers training on the data.',
      'No retention period on traces containing personal data.',
      'Promising erasure while training on customer data, which makes it impossible.',
      'Overlooking that sending prompts to an overseas provider is a cross-border transfer.',
      'Consent that is harder to withdraw than it was to give.'
    ],
    keyTerms: [
      ['DPDP Act', 'India’s Digital Personal Data Protection Act 2023.'],
      ['Data Principal', 'The individual the data is about.'],
      ['Data Fiduciary', 'The entity deciding why and how data is processed.'],
      ['purpose limitation', 'Using data only for the consented purpose.'],
      ['data minimisation', 'Collecting only what is necessary.'],
      ['right to erasure', 'Deletion on request. Not possible from model weights.'],
      ['cross-border transfer', 'Sending data outside India; subject to restrictions.'],
      ['Significant Data Fiduciary', 'A larger or higher-risk entity with extra obligations.']
    ],
    resources: [
      ['India — DPDP Act 2023 framework', 'https://www.meity.gov.in/data-protection-framework', 'reference'],
      ['DPDP Act 2023 — official text', 'https://www.meity.gov.in/data-protection-framework', 'reference'],
      ['Microsoft Presidio — PII detection', 'https://microsoft.github.io/presidio/', 'docs'],
      ['NIST — Privacy Framework', 'https://www.nist.gov/privacy-framework', 'reference']
    ],
    questions: [
      ['Why is training on customer conversations a separate decision under DPDP?', 'Purpose limitation. Consent to have a question answered is not consent to train a model, which is a different purpose requiring its own basis.'],
      ['Why does the right to erasure make training data a design constraint?', 'You can delete database rows, traces, logs and evaluation cases. You cannot delete data from model weights, so not training on personal data is what makes erasure actually achievable.'],
      ['What does sending a prompt to an overseas model provider constitute?', 'A cross-border transfer, subject to government restrictions, which must be disclosed and may require in-region inference if the position tightens.']
    ]
  }
];
