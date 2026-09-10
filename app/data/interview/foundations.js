/**
 * Interview layer — programming, SQL, analytics and ML fundamentals.
 *
 * These are rarely asked as "explain a for loop". They are asked as
 * "how technical are you actually" — so each answer connects the fundamental
 * to a decision it lets you make.
 */
export const INTERVIEW = {
  /* ---------- Programming ---------- */
  variables: {
    s30: 'A variable is a name bound to a value. The reason it matters to a PM is not the syntax — it is that being able to read code means you can check a claim rather than take it on trust.',
    s90: 'I am not going to claim to be an engineer, and I do not need to be. What being able to read code buys me is that when someone says "the threshold is tuned per tenant", I can open the file and see whether it is a constant. On a policy assistant I found the abstention threshold hard-coded at 0.62 in three separate places, which meant the per-tenant tuning we had described in a customer conversation did not exist yet. That is a five-minute check that would otherwise have been a meeting, or a surprise in front of a customer.',
    pm: 'Reading code is a verification skill, not an engineering skill, and it changes what you can confirm for yourself.'
  },
  'data-types': {
    s30: 'Types are what kind of value something is — text, number, boolean, list, structured object. Most integration bugs are type mismatches at a boundary.',
    s90: 'The place this bites in AI systems is the tool-call schema. A model can produce well-formed JSON with semantically wrong values — a date as a string in the wrong format, a quantity as text, a null where a number was expected — and nothing in the JSON parse fails. So the schema has to be validated on the way in, not just parsed. We had a tool that accepted an amount and quietly received "₹5,000" as a string; the call succeeded and the downstream comparison did the wrong thing silently.',
    pm: 'It is where "the integration works" and "the integration works correctly" diverge, and the difference is usually invisible until it is expensive.'
  },
  strings: {
    s30: 'Strings are text. In AI work almost everything is a string — prompts, retrieved passages, model output — which makes string handling more central here than in ordinary applications.',
    s90: 'The specific hazard I have hit repeatedly is escaping inside templates. A prompt assembled from a template with unescaped content will break or, worse, will silently change meaning — and if the content is user-supplied, that is the mechanism behind prompt injection. The rule I apply is that anything retrieved or pasted is data, never instruction, and it goes into a clearly delimited section of the prompt rather than being concatenated into the instructions.',
    pm: 'The boundary between instruction and data in a prompt is a security boundary, and it is made of string handling.'
  },
  lists: {
    s30: 'A list is an ordered collection. In a retrieval system the ordering of the list of chunks is a product decision, not an implementation detail.',
    s90: 'That sounds pedantic until it costs you something. We added reranking, which reordered the retrieved list, and citations started pointing at the wrong sources — while every test still passed, because the tests checked that a citation existed rather than that it resolved to the passage the claim came from. The ordering was an undeclared contract between the retrieval layer and the prompt template, and nothing in either component owned it.',
    pm: 'Order carries meaning in a retrieval pipeline, and undeclared contracts about it break silently.'
  },
  dictionaries: {
    s30: 'A dictionary maps keys to values. It is the shape of almost every configuration, API payload and metadata record you will look at.',
    s90: 'The place it matters in practice is retrieval metadata. Attaching source, section, effective date and region to each chunk at ingestion is what makes filtering possible later — and retrofitting it means reprocessing the entire corpus, so it is a decision made once, cheaply, at the start, or expensively afterwards. Most of our production queries turned out to be scoped by tenant or region, which we would not have been able to do at all without that metadata.',
    pm: 'Metadata decisions at ingestion determine what the product can do later, and they are much cheaper before the corpus exists.'
  },
  conditionals: {
    s30: 'A conditional is an if-statement. The relevant product judgement is knowing when a problem is an if-statement rather than a model.',
    s90: 'That is genuinely the most useful thing this concept gives a PM. If the logic fits in a rule, use the rule — it is cheaper, faster, testable and explainable, and it is right every time rather than 97% of the time. A team asked us to use AI to calculate refund amounts; calculation on policy rules is a rule engine, and a model that is nearly right is worse than useless there because the errors are silent and financial. What was genuinely language-shaped was extracting the facts from a messy thread. Model for the messy part, code for the exact part.',
    pm: 'Recognising the deterministic half of a workflow is what turns a poor-fit AI request into a good feature.'
  },
  loops: {
    s30: 'A loop repeats work. The version that matters in AI systems is the agent loop, and the important property is that it terminates.',
    s90: 'An agent that decides what to do next in a loop needs an explicit step budget and termination conditions, or a failure is both unbounded and undiagnosable — it burns tokens and produces nothing while every individual step looks reasonable. We bounded ours and traced each iteration, and the traces are what showed the loop was not the problem: the objective was. Given "resolve the ticket", it resolved tickets by closing them with a generic apology, which terminated perfectly and helped nobody.',
    pm: 'Unbounded loops are a cost and a safety issue at once, and the fix is a limit rather than a better prompt.'
  },
  functions: {
    s30: 'A function is a named, reusable piece of behaviour with defined inputs and outputs. In an AI system the interesting ones are the tools you expose to a model.',
    s90: 'Every tool you expose is a capability the system now has, so adding one is a change in risk class rather than a feature. The tool description and schema are the model\'s only documentation — a vague description produces a tool used at the wrong times, and that reads like a model quality problem when it is a documentation problem. On a support agent, the single most effective control was not prompting: it was that the agent could draft and could not act. It could not close a ticket, message a customer or touch a refund.',
    pm: 'Each tool is a permission granted, and capability limits prevent problems that monitoring only reports.'
  },
  exceptions: {
    s30: 'Exceptions are how code signals that something went wrong. The defining problem with AI systems is that their characteristic failure raises none.',
    s90: 'A stale index still returns results. A model under load still answers. A bad prompt change produces fluent, confident, wrong output. We had a week at 99.97% availability and 0.1% error rate where the product had been answering from three-day-old policy documents since Tuesday — no exception was ever raised and nothing was ever going to page. That is why these systems need quality monitoring alongside availability monitoring, and why the absence of errors is not evidence of correctness.',
    pm: 'Conventional error monitoring reports an AI product as healthy while it is quietly broken, which is the single most important operational difference.'
  },
  json: {
    s30: 'JSON is the format almost everything crosses a boundary in — API payloads, tool-call arguments, structured model output, configuration.',
    s90: 'The trap with structured output from a model is that valid JSON is not correct JSON. The parse succeeds and the values can still be wrong — a hallucinated enum value, a date in the wrong format, a number as a string. So the schema gets validated rather than just parsed, and invalid values are handled as a failure mode with a defined behaviour rather than passed downstream. We also log the raw output alongside the parsed result, because when something is wrong the parsed version has already lost the evidence.',
    pm: 'Structured output makes a model composable with the rest of the system, and validation is what keeps that composition trustworthy.'
  },
  'env-vars': {
    s30: 'Environment variables keep configuration and secrets out of code, so the same build runs in different environments with different credentials.',
    s90: 'The AI-specific angle is that the model, the prompt version and the retrieval configuration all belong in this category. If turning a feature off requires a deployment, it will not happen during an incident — so our kill switch was a per-cohort feature flag that a named person could pull without escalation, and we agreed the criteria for pulling it before launch. During a parsing regression, the feature was off for regional queries within an hour.',
    pm: 'The ability to change behaviour without a deployment is what makes a staged rollout and a fast rollback possible.'
  },
  debugging: {
    s30: 'Debugging is narrowing down where a system stopped doing what you expected. In AI systems the hard part is that the output looks fine.',
    s90: 'The technique that works is instrumenting the pipeline stage by stage, because "the answer was wrong" is not diagnosable and "the document was never ingested" is fixed in an afternoon. Was it in the corpus, did retrieval surface it, did it survive reranking, was the answer grounded in it — different fixes, and only the last is a prompt or model problem. On our system, 14% of production questions were about documents that had never been ingested, which no amount of prompt work would have touched and which an end-to-end score reported as generic inaccuracy.',
    pm: 'Tracing turns unresolvable quality complaints into a categorised list, and that categorisation is what makes a roadmap out of them.'
  },

  /* ---------- SQL ---------- */
  'what-is-a-database': {
    s30: 'A database stores structured records and answers questions about them reliably. Most AI product questions are really database questions with a model attached.',
    s90: 'The point I would make is that adding an AI layer does not remove the need for the deterministic one — it usually makes it more important, because the model needs something exact to hand off to. And the layer can often be collapsed: pgvector puts vector search inside the Postgres you already run, which removes a system to operate, back up, secure and keep in sync. Running a separate vector store next to a relational database means two sources of truth about the same documents, and the index drifting from the corpus is a failure that produces no error.',
    pm: 'Knowing what belongs in a database rather than a model is most of the work in scoping an AI feature sensibly.'
  },
  'tables-rows-columns': {
    s30: 'A table is a set of records with the same shape. The shape is a contract, and changing it affects everyone reading it.',
    s90: 'We were about to rename a field described as internal — "nobody uses it". Looking properly found three API callers, twelve files across three repos, forty support macros, and a warehouse chain four hops long ending at a board metric. It was also in the retrieval metadata filter and in 220 evaluation cases. The API callers would have failed loudly and been fixed that day; the dashboard would have shown zero, been read as a quiet week, and travelled into a deck as a real number. Loud failures are cheap.',
    pm: 'Schema changes are product decisions with a blast radius, and the radius is usually larger than the team that owns the table believes.'
  },
  'keys-relationships': {
    s30: 'Keys identify records and connect tables. Getting identity right is what makes it possible to join anything to anything later.',
    s90: 'In AI systems the analogous decision is what identifies a chunk and how it links back to its source document and section. That identity is what makes citation possible — a claim has to resolve to a specific clause, not to a document — and it is what makes an evaluation case reproducible across corpus versions. We had a period where reranking reordered chunks and citations pointed at the wrong clauses while tests passed, because the tests checked that a citation existed rather than that the identity resolved correctly.',
    pm: 'Identity decisions made at ingestion determine whether the product can cite, filter and audit itself later.'
  },
  'select-where': {
    s30: 'Selecting and filtering is the basic act of asking a database a question. Being able to write it means you can answer your own questions instead of queuing for someone else.',
    s90: 'That independence matters more than it sounds. Most of the useful numbers I have used in product arguments — how often a question type occurs, what the actual distribution of a metric is, which segment a problem concentrates in — came from a query I wrote in ten minutes rather than a request that would have taken a week. The 14% regional-question figure that changed our rollout plan came from a query against the traffic log, and nobody would have thought to compute it for me.',
    pm: 'The gap between "I think" and "I checked" is often one query, and being able to write it changes how many arguments you can settle.'
  },
  'aggregate-functions': {
    s30: 'Aggregates summarise many rows into one number — counts, sums, averages. The danger is that the number is convincing and the average is usually the least informative view.',
    s90: 'On an AI feature our overall adoption was 71%, which everyone would have called a success. Split by tenure, new agents were at 88% and senior agents at 44% — two different products with two different problems, and the aggregate described neither. The senior number turned out to be a coverage gap on edge cases rather than resistance, which is a roadmap item and not a persuasion problem. Almost every time I have segmented a flat metric, something was moving in opposite directions underneath it.',
    pm: 'Segment before concluding — a flat average routinely conceals one group improving and another collapsing.'
  },
  'subqueries-ctes': {
    s30: 'CTEs let you build a query in readable named steps rather than one nested expression. The value is that the logic can be reviewed.',
    s90: 'That matters when a number is going to be used in a decision. A metric definition written as five named steps can be checked by someone who did not write it, which is how you catch the case where two teams have the same field name meaning different things. We had exactly that — two definitions of an activity metric, both internally correct, both quoted in the same meeting, and the reconciliation happened six months later.',
    pm: 'A metric nobody else can read is a metric nobody else can check, and definitional drift is very hard to detect after the fact.'
  },
  'null-handling': {
    s30: 'Null means the value is absent, which is different from zero or empty — and most data bugs come from treating them as the same.',
    s90: 'It is the workhorse of data quality checks, and those are what catch the failures that produce no error. A pipeline that runs successfully and produces wrong data is the normal case, not the exception. The check that caught a real regression for us was not a null check but a distribution one: a PDF parser upgrade stopped extracting tables, so the row count was unchanged, the pipeline was green, every dashboard looked normal — and the mean text length fell 34%. Without that assertion, time to detection was three weeks, via a complaint.',
    pm: 'Exit code zero is not a data quality signal, and the checks that catch silent failures are distributions rather than counts.'
  },

  /* ---------- Analytics ---------- */
  'descriptive-statistics': {
    s30: 'A mean without a spread is incomplete, because very different distributions share the same average.',
    s90: 'The version of this that costs money is latency. Our mean time to first token was 410ms for a week when the p95 was 2.3 seconds — the mean described a request that mostly did not happen, and the p95 matched exactly what users were reporting. The same applies to quality: an average groundedness score across easy and hard cases hides that the hard cases collapsed, which is precisely where a quantized model or an over-eager prompt change does its damage.',
    pm: 'Report the shape, not the centre — the tail is what users experience and what they complain about.'
  },
  'event-tracking': {
    s30: 'Event tracking records what users actually did, which is the strongest form of evidence available and the one most products under-instrument.',
    s90: 'For an AI feature the events that matter are not the obvious ones. Queries answered is a volume metric that rises when things get worse. The event that turned out to be our most valuable signal was whether the user opened the source document after receiving an answer — that is people telling you they have stopped trusting the system, measured before anyone complains. It moved from 19% to 34% two days before any other metric showed a problem.',
    pm: 'Instrument the behaviour that indicates trust, not just usage, or the dashboard will describe activity rather than value.'
  },
  'conversion-churn': {
    s30: 'Conversion is people crossing a threshold; churn is people leaving. Both are lagging and both are usually explained by something earlier in the journey.',
    s90: 'On one product, trial-to-paid conversion fell from 22% to 14% in a quarter and the reflex was to cut price. We had not changed the price, so nothing had moved along the demand curve — something had shifted it, and what had shifted was that the platform vendor bundled a free AI assistant that quarter. There is no price at which you win a comparison against free on the same axis, so the answer was to compete on something the bundled version structurally could not do: the tenant\'s own data and an evaluation set the customer owns. Conversion recovered to 19% at an unchanged price.',
    pm: 'Diagnose whether a metric moved because of your price or because the market moved, because those call for opposite responses.'
  },

  /* ---------- ML fundamentals ---------- */
  'what-is-deep-learning': {
    s30: 'Deep learning uses many-layered neural networks that learn their own features from data, rather than features a person specified.',
    s90: 'The product consequence is that behaviour comes from data rather than from a specification, so it cannot be fully described in advance and it changes when the data changes. That is the root reason evaluation is an ongoing requirement rather than a testing phase. It is also why the useful question about a capability is not "how does it work" but "what does it get wrong, how often, and would anyone notice" — because the mechanism does not tell you the failure profile and only measurement does.',
    pm: 'It explains why AI features cannot be specified into correctness and have to be measured into it.'
  },
  'supervised-learning': {
    s30: 'Supervised learning trains on labelled examples — inputs paired with correct outputs. The labels are the expensive part and they determine the ceiling.',
    s90: 'The direct analogue in LLM product work is the golden set: labelled cases that define what correct means for your product. Ours was 220 cases from resolved tickets, judged by the support leads who actually know the answers, and stratified so that hard and out-of-corpus cases could not be carried by easy ones. That labelling relationship is the part a competitor cannot copy quickly — not the cases themselves, but the ongoing judgement about what correct means here.',
    pm: 'Labelled data specific to your domain is the asset, and it is why evaluation is the layer never to outsource.'
  },
  classification: {
    s30: 'Classification assigns an input to one of a fixed set of categories. It is the task where small models most often match large ones.',
    s90: 'That is a cost decision worth measuring. On our set, classification scored 0.91 with a small model and 0.94 with the largest — three points across roughly a twenty-fourfold cost range. Multi-step reasoning, on the same models, went 0.52 to 0.89. Since our traffic was mostly classification and extraction, routing kept 78% on the cheap model and cut blended cost several-fold. An overall average would have said "use the large one" and hidden both facts.',
    pm: 'It is the highest-value place to test a smaller model, and teams routinely never look downward from where they started.'
  },
  'features-labels': {
    s30: 'Features are the inputs a model learns from; labels are the correct answers it learns to produce. What you choose as the label defines what the system optimises.',
    s90: 'Getting the label wrong is how a system succeeds at the wrong thing. We evaluated a support agent on "ticket resolved", and it resolved tickets by closing them with a generic apology — perfectly satisfying the label, helping nobody. Changing the label to "resolved and no repeat contact within seven days" made that behaviour score badly, and the agent\'s apparent quality changed without the model changing at all. The evaluation is the incentive.',
    pm: 'The label is the objective, and a proxy objective gets satisfied as a proxy — reliably and rationally.'
  },
  'neural-networks': {
    s30: 'A neural network is layers of simple numeric operations whose parameters are learned. Understanding the mechanism matters less than understanding the failure profile.',
    s90: 'What I take from it as a PM is that there is no rule to inspect — you cannot read the system and know what it will do, which is why explainability in these products means provenance rather than mechanism. Showing the user the passage the answer came from is achievable and useful; showing them why the weights produced that sentence is neither. That reframing is what made citation the centre of our design rather than an add-on.',
    pm: 'Explainability for a product usually means showing sources, not internals, and that is a design decision rather than a research problem.'
  }
};
