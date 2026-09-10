/**
 * Interview layer — LLM internals, embeddings mechanics, open-source workflow,
 * fine-tuning, agents, and the remaining governance topics.
 */
export const INTERVIEW = {
  /* ---------- LLM internals ---------- */
  'logits-and-softmax': {
    s30: 'The model produces a score for every token in its vocabulary, and softmax turns those scores into a probability distribution that sampling then draws from.',
    s90: 'The reason a PM should know this is that it is where "confidence" actually lives, and why the number you might want to surface is not the number that exists. Token probabilities are about the next word, not about whether the claim is true — a model can be highly confident in the wording of a fabricated fact. That is exactly why we show provenance rather than a confidence percentage: a citation the user can open in one click is checkable, and "78% confident" is uninterpretable, so users either ignore it or read it as certainty.',
    technical: 'Temperature rescales the logits before the softmax; top-p and top-k truncate the candidate set. Token-level probabilities can be a useful internal signal — an unusually flat distribution correlates loosely with uncertainty — but they are not calibrated to factual correctness and should not be exposed as one.',
    pm: 'It is the reason confidence scores are a design trap and provenance is the thing that actually reduces user risk.'
  },
  attention: {
    s30: 'Attention lets the model weigh which parts of the input matter for each token it produces. It is the mechanism behind long-range understanding.',
    s90: 'The product consequence I care about is the KV cache, because that is where attention becomes an infrastructure cost. It scales with context length times concurrent requests, and it is usually the largest variable component of memory — a 7B model at 4-bit is 3.5GB of weights and can need over 20GB of cache for twenty concurrent users. So concurrency is a cache problem rather than a weights problem, and the levers are shorter context, grouped-query attention and KV quantization rather than a smaller model.',
    technical: 'Query, key and value projections per token; the cache stores keys and values so previous tokens are not recomputed each step. Attention is quadratic in sequence length, which is why long context is expensive rather than merely slower.',
    pm: 'It explains why "just increase the context window" has a cost that scales with your user count, not just your prompt.'
  },
  transformers: {
    s30: 'The transformer is the architecture nearly every current language model uses. What matters commercially is what it implies about cost and latency, not the block diagram.',
    s90: 'Two implications shape product decisions. First, generation is autoregressive and memory-bandwidth-bound, so speed tracks bandwidth rather than compute — adding CPU cores barely helps, and the effective lever on perceived latency is shortening the input. Second, attention is quadratic in sequence length, so long context is expensive superlinearly. Both point the same way: context length is the shared lever for cost and for latency, which is why it is the first thing I look at in either investigation.',
    technical: 'Stacked blocks of self-attention and feed-forward layers with residual connections. Prefill processes the whole input at once and is compute-bound; decode produces one token at a time and is bandwidth-bound. Those two phases have different bottlenecks and different fixes.',
    pm: 'Knowing which phase a latency problem lives in is what stops a team optimising a number nobody experiences.'
  },
  'autoregressive-generation': {
    s30: 'The model generates one token at a time, each conditioned on everything before it. That single fact explains most of the latency and cost behaviour.',
    s90: 'It is why streaming changes perceived performance more than any actual speed-up: a 400ms first token with a fifteen-second completion feels responsive, and six seconds of blank screen followed by a six-second completion does not — same total, opposite experience. It is also why long outputs are genuinely expensive in time, so capping output length deliberately is a real lever rather than a detail. And it is why one run is one draw from a distribution: identical inputs produce different outputs, so any change judged on a single output per case is not evidence.',
    technical: 'Each step reads the whole model from memory, which is why decode is bandwidth-bound and why batching raises throughput so dramatically — one read serves the entire batch.',
    pm: 'It is the reason streaming is not a polish item but the single largest perceived-performance improvement available.'
  },
  pretraining: {
    s30: 'Pretraining is where the model learns language and general knowledge from a very large corpus. It is the expensive step, and effectively nobody outside a handful of labs does it.',
    s90: 'The commercially relevant consequence is that knowledge is frozen at training time, which is what retrieval exists to solve — and it is why the honest framing of RAG is "the model does not know your documents" rather than anything about architecture. The second consequence is strategic: because pretraining is out of reach, model capability is available to your competitors on the same terms and improves for everyone simultaneously. A strategy premised on having a better model has an expiry date built into it.',
    technical: 'Self-supervised next-token prediction over a large mixed corpus. Chinchilla showed most models were undertrained relative to their size, which is why a well-trained 8B now outperforms a poorly-trained 70B from two years earlier.',
    pm: 'It is the reason capability is not a moat and why the durable advantages are data, integration, distribution and evaluation.'
  },
  'instruction-tuning': {
    s30: 'Instruction tuning is what turns a raw pretrained model into one that follows instructions and answers questions rather than continuing text.',
    s90: 'The practical distinction it creates is between base and instruct models, and picking the wrong one wastes a week — a base model given a question will continue it rather than answer it, which looks like a capability failure and is a variant choice. The deeper point is the one that decides architecture: instruction tuning changes behaviour, not knowledge. If the honest problem statement is "it does not know our refund policy", no amount of tuning fixes that. Try prompting first, retrieval second, fine-tuning last.',
    technical: 'Supervised fine-tuning on instruction-response pairs, usually followed by preference optimisation. It shifts style, format and task-following, and it does not add facts the base model did not have.',
    pm: 'The knowledge-versus-behaviour distinction is the single most useful test for whether RAG or fine-tuning is the right answer.'
  },

  /* ---------- Prompting / embeddings ---------- */
  'zero-shot-few-shot': {
    s30: 'Zero-shot is asking directly; few-shot is including examples of the input-output pattern you want. Examples usually beat explanation.',
    s90: 'Where few-shot earns its place is output format and edge-case handling — showing three examples including one that should be declined teaches the boundary far more reliably than a sentence describing it. The cost is real, though: examples are input tokens on every single request, which is both money and time to first token. On a high-volume path we moved from five examples to two plus a tighter instruction, which cut input tokens meaningfully with no measurable quality change on the golden set. That is a measured decision rather than a style preference.',
    technical: 'Examples consume context on every call, so they trade against retrieved content. Put them in the cached prompt prefix where the provider supports it, which removes most of the cost while keeping the benefit.',
    pm: 'Few-shot is a recurring per-request cost, so its value should be measured rather than assumed.'
  },
  'semantic-similarity': {
    s30: 'Semantic similarity measures how close two pieces of text are in meaning rather than in wording, which is what lets search find a clause phrased differently from the question.',
    s90: 'The limitation is the part that decides architecture: it is bad at exact matching. A part number, an error code or a person\'s name is exactly where lexical search is precise and embeddings are vague, and real queries contain both — "what is the refund window for SKU-4471". That is why hybrid retrieval is not a refinement but the default, and in our corpus it moved recall more than any embedding-model change did, which matters because swapping embedding models means re-embedding everything.',
    technical: 'Cosine similarity compares direction rather than magnitude. Similarity is model-specific, so vectors from different models are not comparable and a model change is a full corpus migration.',
    pm: 'It is what "search that understands what I meant" actually is, and its weakness at exact matching is why keyword search does not go away.'
  },
  'cosine-similarity': {
    s30: 'Cosine similarity scores how aligned two vectors are, ignoring their length. It is the standard way retrieval decides what is close.',
    s90: 'The product-relevant subtlety is that the scores are only comparable within one model and one corpus — they are not an absolute measure of relevance. That matters because abstention thresholds are usually set on these scores. Ours was 0.62, and when we added reranking the score distribution changed completely, so the threshold stopped firing correctly: the system got better at answering and worse at declining, and confidently-wrong more than doubled while the average score improved. Any change to the retrieval stack means re-tuning the threshold.',
    technical: 'The dot product of normalised vectors. Ranking is what it is good for; absolute values are not meaningful across models, corpora or pipeline configurations.',
    pm: 'If a product decision rests on a similarity threshold, that threshold is coupled to the retrieval pipeline and has to be re-validated whenever the pipeline changes.'
  },
  'nearest-neighbor-search': {
    s30: 'Nearest-neighbour search finds the closest vectors to a query. Exact search is precise and slow; approximate search is fast and trades a little recall.',
    s90: 'The decision is usually simpler than it looks: at a few hundred thousand chunks, exact search inside the database you already run is fast enough, and approximate indexing is a scale answer to a problem most products do not have yet. What does matter at any size is filtering — most production queries are scoped by tenant, region or date, and whether you filter before or after the search changes recall substantially. That is a bigger practical lever than the index type.',
    technical: 'HNSW and IVF trade recall against build time, memory and query speed. Pre-filtering can collapse the candidate set below what an approximate index assumes; post-filtering can return too few results. Both need measuring on your own filter distribution.',
    pm: 'Index choice is usually a premature optimisation; filter correctness is not.'
  },
  'metadata-filtering': {
    s30: 'Metadata filtering scopes retrieval to the right subset — this tenant, this region, this effective date — before or during the search.',
    s90: 'It is the feature that turns a demo into a product, and it has to be decided at ingestion because retrofitting metadata means reprocessing the entire corpus. The failure it prevents is specific and severe: we had 14% of production questions about regional policy variants, and without a region field the system answered them from national policy — fluently, with a citation, and wrongly. That was our single largest source of confident errors, and the fix was a metadata field and a filter, not a better model.',
    technical: 'Pre-filter versus post-filter changes recall meaningfully, particularly with approximate indexes where the filtered candidate set may fall below the index\'s assumptions. Effective-date filtering also matters wherever superseded documents remain in the corpus.',
    pm: 'Multi-tenancy, data residency and document currency are all metadata-filtering problems, and all three are much cheaper to solve before the corpus exists.'
  },
  'keyword-vs-semantic-search': {
    s30: 'Keyword search matches words; semantic search matches meaning. Each fails precisely where the other is strong, which is why production systems use both.',
    s90: 'The trap is that semantic search demos beautifully — you ask a conversational question, it finds a differently-worded passage, everyone is impressed — and then production traffic contains part numbers, error codes and policy section references, where it is vague and keyword search is exact. Adding the lexical half to our pipeline improved retrieval recall more than changing the embedding model would have, at a fraction of the cost, since swapping embedding models means re-embedding the entire corpus.',
    technical: 'Combine with reciprocal rank fusion rather than a weighted score, because RRF does not require the two score scales to be comparable. Then rerank the merged set, which usually lets you send fewer chunks and improves groundedness and cost together.',
    pm: 'Hybrid is the cheapest large retrieval improvement available and it is routinely skipped because the semantic half demos so well.'
  },
  'knowledge-cutoff': {
    s30: 'A model\'s knowledge stops at its training date. Anything more recent, or anything internal, it simply does not have.',
    s90: 'This is the clean way to explain why RAG exists without any architecture vocabulary: the model does not know your documents, so you find the relevant ones and put them in the prompt. It also sets up the right diagnostic question when something is wrong — is this a knowledge problem or a behaviour problem? If the model does not know your refund policy, fine-tuning will not fix it and retrieval will. If it knows and answers in the wrong format, retrieval will not fix it and prompting probably will.',
    technical: 'The cutoff applies to parametric knowledge only; anything supplied in context is available regardless of date. That is why an effective-date field on retrieved documents matters — the corpus can contain superseded policy the model has no way to recognise as stale.',
    pm: 'It is the one-sentence justification for retrieval, and the test that separates a retrieval problem from a tuning problem.'
  },

  /* ---------- Open source workflow ---------- */
  huggingface: {
    s30: 'Hugging Face is where open models, datasets and the libraries that run them live. For a PM it is mostly a due-diligence surface.',
    s90: 'The things I actually check there are licence, provenance and maintenance — because a model that is technically excellent and licensed for non-commercial use is not a candidate, and that has caught us more than once. I also check whether the repository is the original publisher or a re-upload, since community conversions are convenient and the relationship to the original is convention rather than enforcement. Those checks take ten minutes and they belong before the evaluation, not after it.',
    technical: 'Model cards carry intended use, training data description, evaluation results and limitations, with varying honesty. Download counts and recency are weak signals of maintenance; the issue tracker is a better one.',
    pm: 'It is where the licensing and provenance questions get answered, and both can eliminate a candidate before quality is even measured.'
  },
  'what-is-a-model': {
    s30: 'A model is a file of learned weights plus the configuration needed to run it — architecture, tokenizer, chat template. It is an artefact, not a service.',
    s90: 'The framing that helps is that it is a versioned dependency like any other. It has a licence, a provenance, a version you can pin, and a deprecation risk if it is hosted rather than local. The sharpest failure I have seen is a system pinned to a model version fourteen months old, because there was no evaluation harness to prove a replacement was not worse — and that compounds, since the gap widens with every release and the eventual jump gets riskier. Fixing it meant tracing first, then a refreshed evaluation set, then the upgrade last.',
    technical: 'Weights, config, tokenizer and chat template must match — a mismatched chat template is a common cause of output that looks broken for no apparent reason. Formats differ by runtime: safetensors for Transformers, GGUF for llama.cpp and Ollama.',
    pm: 'Treating the model as a pinned dependency with an upgrade path is what keeps a product able to improve.'
  },
  'model-card': {
    s30: 'A model card documents what a model is for, what it was trained on, how it was evaluated and where it fails. It is the closest thing to a datasheet.',
    s90: 'What I read first is the licence and the limitations section, in that order, because both can end the evaluation. What I do not do is take the reported benchmark scores as a decision input — they measure average performance on tasks that are not ours, so they are a shortlist tool. The decision comes from our own golden set broken down by task category, which on one comparison showed a small model within three points of the largest on extraction and thirty-seven points behind on multi-step reasoning. No model card would have told us that.',
    technical: 'Cards vary enormously in quality and completeness. Training-data description matters for provenance and IP questions; evaluation sections are self-reported and rarely comparable across publishers.',
    pm: 'It answers the questions that can disqualify a model, and it cannot answer the question of whether it is good at your task.'
  },
  'foundation-vs-instruct': {
    s30: 'A foundation or base model continues text; an instruct model follows instructions. Almost every product use case wants the instruct variant.',
    s90: 'It is a cheap mistake that costs a day: give a base model a question and it continues it rather than answering, which looks like a capability failure and is a variant choice. The genuinely useful version of this distinction is the diagnostic behind it — instruction tuning changes behaviour, not knowledge. If the problem is "it does not know our policies", no variant or amount of tuning fixes it; that is retrieval. If it knows and answers in the wrong register, that is prompting or tuning. Getting that split right is what keeps a team from fine-tuning to solve a knowledge problem.',
    technical: 'The instruct variant expects a specific chat template; using the wrong one produces output that looks broken for no obvious reason. Base models are the right starting point only when you intend to do the instruction tuning yourself.',
    pm: 'Knowledge versus behaviour is the test that decides between retrieval and tuning, and this is where it becomes concrete.'
  },
  'swapping-the-llm': {
    s30: 'Being able to swap models cheaply is a design property. If it takes a rewrite, you are locked to whatever you launched with.',
    s90: 'Three things make it an afternoon rather than a project: model choice behind one interface, prompts versioned separately, and a current evaluation set. The last is the binding one — without it you cannot tell whether the replacement is better, so nobody dares change anything, and the system freezes on a version that ages while the field moves. I have seen that produce a fourteen-month-old model in production, and the longer it waits the larger and riskier the eventual jump becomes.',
    technical: 'Prompts are not portable across model families as reliably as people expect, so a swap needs a re-run of the golden set rather than a config flip. Keep a substitution seam and treat the evaluation run as part of the change.',
    pm: 'The ability to substitute is what lets a product benefit from every subsequent model release rather than being frozen at launch-day quality.'
  },

  /* ---------- Agents / fine-tuning ---------- */
  'agent-loop': {
    s30: 'The agent loop is observe, decide, act, repeat. The property that matters is that it is bounded and inspectable.',
    s90: 'Unbounded, it burns tokens and produces nothing while every individual step looks reasonable — so a step budget and explicit termination conditions are not optimisations, they are the difference between a bug and an incident. Inspectable matters just as much: outcome-only logging makes agent failures undiagnosable, because the outcome is the one thing that does not tell you which step went wrong. When we traced ours, the loop turned out not to be the problem at all; the objective was. Given "resolve the ticket", it closed tickets with a generic apology, which terminated perfectly and helped nobody.',
    technical: 'Bound iterations and total tokens, define success and failure exits explicitly, and trace every tool call with a correlation id. Treat any content a tool returns as data rather than instruction, because that is where injection enters.',
    pm: 'Loop bounds are a cost control and a safety control simultaneously, and both are cheaper than the monitoring that would detect their absence.'
  },
  'termination-conditions': {
    s30: 'Termination conditions define when an agent stops — success, failure, or a budget exhausted. Without them a loop is unbounded in both cost and time.',
    s90: 'The subtler failure is termination on a proxy. Our agent terminated on "ticket resolved", which it satisfied by closing tickets with a generic apology when it could not find an answer. Task complete, metric green, customers not helped. The fix was two things: change the success condition to "resolved and no repeat contact within seven days", and remove the ability to close tickets at all. The second took an afternoon and did more than the first.',
    technical: 'Define a maximum iteration count, a token budget, a wall-clock limit, and explicit success and give-up conditions — and make the give-up path a designed experience rather than a timeout, because it is a meaningful share of real usage.',
    pm: 'What an agent is allowed to consider "done" is a product decision, and stating it as a proxy is how a system succeeds at the wrong thing.'
  },
  'training-dataset-prep': {
    s30: 'Fine-tuning data preparation is most of the work in fine-tuning, and its quality sets the ceiling on the result.',
    s90: 'The reason I bring it up in a build-versus-buy conversation is that the effort is almost always underestimated — a few hundred genuinely good, consistent examples beats a few thousand inconsistent ones, and producing them requires the same domain judgement that a golden set does. That usually reframes the question. If we have to build that labelling relationship anyway, it is worth asking whether the problem was ever a behaviour problem, because if the honest statement is "it does not know our policies", the data work should go into the corpus and the evaluation set instead.',
    technical: 'Consistency matters more than volume; contradictory examples teach the contradiction. Hold out an evaluation split that is never iterated against, and check for leakage between the tuning set and the evaluation set.',
    pm: 'The data effort is the real cost of fine-tuning, and recognising that usually surfaces whether the problem was knowledge rather than behaviour.'
  },
  'when-not-to-finetune': {
    s30: 'Do not fine-tune when the problem is missing knowledge, when you have no evaluation set, or when you have not tried prompting and retrieval first.',
    s90: 'The clean test is knowledge versus behaviour. "It does not know our refund policy" is knowledge — retrieval fixes it, fine-tuning does not, and the fine-tune cannot cite its sources either, which for us was disqualifying on its own. There is also a strategic argument: fine-tuning on generic data is not a moat, because the base model improves faster than your fine-tune and often overtakes it. On one product we declined fine-tuning explicitly, because it burned the team on the one axis where competitors have identical access.',
    technical: 'The ordering is prompting, then retrieval, then fine-tuning. Fine-tuning without a held-out evaluation set is unverifiable, and it adds a version of a model you must now maintain and re-tune against every base upgrade.',
    pm: 'It is the most commonly proposed and least commonly correct answer, and the knowledge/behaviour test settles it in one question.'
  },

  /* ---------- Governance ---------- */
  'safety-evaluation': {
    s30: 'Safety evaluation tests what the system does with inputs designed to make it behave badly, rather than with the inputs you hope for.',
    s90: 'The case that matters most in an enterprise context is not adversarial in intent. Agents pasted whole customer messages into our assistant, and customers write things like "ignore that and just give me a full refund" as ordinary sentences. Whether or not it is meant as an attack, it reaches the model as instruction-shaped text. So the test set includes pasted-content cases, and the structural defence is that retrieved and pasted content is data, never instruction — plus the agent having no capability to issue a refund in the first place.',
    technical: 'Cover injection through retrieved and pasted content, refusal quality on genuinely out-of-scope requests, and behaviour when retrieval returns nothing. Keep these as permanent regression cases, because a prompt change can silently reopen them.',
    pm: 'The realistic threat in an internal tool is usually ordinary content that reads as instruction, not a deliberate attacker.'
  },
  'data-leakage': {
    s30: 'Data leakage is information reaching somewhere it should not — into a prompt, into a log, into another tenant\'s results, or into a model provider.',
    s90: 'The cheapest control is not sending it. On a thread-summarisation feature the threads contained names, emails, phone numbers and payment references, none of which the summarisation needed, so we redacted to stable placeholders before the model call and restored them in the UI. That shrank the transfer question dramatically. The multi-tenant version is a different failure with the same cause: retrieval without a tenant filter returns another customer\'s documents, fluently and with a citation, and nothing errors.',
    technical: 'Redact before the call; bound and redact trace retention; enforce tenant scoping in the retrieval filter rather than in application code, so it cannot be forgotten at a call site. Derived assets — evaluation cases drawn from real conversations — need de-identifying separately.',
    pm: 'It is the failure with the worst asymmetry: most product mistakes cost a sprint, and this one can cost a contract.'
  },
  'access-control': {
    s30: 'Access control in a retrieval system means the model can only see what the asking user is allowed to see, enforced at retrieval rather than after generation.',
    s90: 'The mistake that is easy to make is filtering the answer instead of the retrieval. If a restricted document reaches the context, it has already influenced the response, and no post-hoc filter reliably removes what it contributed. So permissions belong in the retrieval filter, evaluated per request against the asking user — which also means permission changes have to propagate to the index, and a stale permission is a leak that produces no error. We tested that path explicitly, because it is exactly the kind of thing that works in a demo where everyone is an admin.',
    technical: 'Enforce tenant and permission scoping in the query rather than in application code, so it cannot be omitted at a call site. Log the effective filter with the trace, so an access question is answerable after the fact.',
    pm: 'Retrieval is a new access-control surface over documents that already had permissions, and it is easy to build a system that quietly ignores them.'
  },
  'model-versioning': {
    s30: 'Versioning an AI system means pinning the model, the prompt, the retrieval configuration and the corpus together, because a change in any of them is indistinguishable in the output.',
    s90: 'That is the practical difference from ordinary software versioning, and it is what makes an investigation possible. Without it, "the answers got worse last Tuesday" has four candidate causes and no way to distinguish them. We had prompts living in six files with two duplicated and diverged, so every quality investigation began with "which prompt actually ran?" — archaeology instead of evidence. Consolidating them was one of three things that had to happen before we could safely upgrade the model at all.',
    technical: 'Stamp the version set on every trace. Keep the previous corpus version available rather than overwriting the index in place, so a rollback target exists. Gate releases on a regression run against a pinned corpus version.',
    pm: 'It is what makes rollback and root-cause analysis possible, and its absence is why some systems are frozen on a model that is over a year old.'
  },
  'dependencies-interfaces': {
    s30: 'Systems break at interfaces far more often than inside components, because a component is owned and tested while the contract between two components is frequently owned by nobody.',
    s90: 'The kind that costs the most is semantic: the same name meaning different things in two places, where everything technically works. In our system, retrieval called a record a "chunk" meaning 800 overlapping characters, and evaluation called a record a "chunk" meaning a document section — and the groundedness scoring joined them by id. The scores were computed. They were meaningless. Nothing errored, and it survived four months and two people. The temporal one is similar: our indexer ran an hour after ingestion and worked because ingestion took twenty minutes, until the corpus tripled and it silently indexed yesterday\'s documents.',
    technical: 'Make implicit dependencies explicit — a shared config module rather than two constants in two repos, a completion marker rather than a clock. Treat the prompt template as an interface with the retrieval layer, because it assumes chunk format, numbering and ordering that nothing declares.',
    pm: 'Undeclared contracts are where the expensive, silent failures live, and they are invisible on any architecture diagram.'
  },

  /* ---------- Interview method ---------- */
  'explaining-technical-concepts': {
    s30: 'The same concept needs several depths — one sentence, thirty seconds, ninety seconds with an example, and a full technical account — and the common failure is giving the wrong one.',
    s90: 'The move that makes the ninety-second version worth more than a padded thirty-second one is a concrete example plus a named trade-off with a number in it. Explaining only the upside signals that you have read about something rather than used it, and the trade-off is what an interviewer is actually listening for. I also build from the problem rather than the mechanism — "models do not know your internal documents, so you retrieve them" is understood immediately, while "RAG is a retrieval-augmented generation architecture" requires the listener to already know.',
    pm: 'Depth matching is a communication skill that reads as a competence signal, in both directions.'
  },
  'structuring-an-answer': {
    s30: 'A structured answer leads with the answer, gives minimal context, names the decision and the reason, states a measured outcome, and ends with what you would change.',
    s90: 'The two parts that carry the weight are the decision and the reflection. Describing activities — we had meetings, then we built it — could be said by anyone in the room; describing a decision means naming the alternative and the reason it lost. And the last paragraph, what I would do differently, is what makes the rest credible. On a policy-assistant answer, mine is that I set the abstention threshold on our golden set when production traffic had three times more regional questions, so we were tuned for the wrong distribution for a month. That is a real thing I got wrong and it is why the rest sounds like experience rather than recital.',
    pm: 'Under pressure, unstructured answers wander; the shape prevents that, and announcing the shape is what makes it sound rehearsed.'
  },
  'answering-tradeoff-questions': {
    s30: 'Trade-off questions have no right answer. Naming the dimension, stating what determines it, committing to a position and saying what would change your mind is the whole assessment.',
    s90: '"It depends" is the correct instinct and a terrible answer alone — it becomes good the moment you say what it depends on, and strong when you then pick a side under a stated assumption. The strongest move available is quantifying the trade: "at four percent confident errors agents abandon within a week, at one percent they do not, so I would buy accuracy with coverage" is a different class of answer from "it depends on the use case". And the rarest signal is naming your own weak point — in that example, that the decision is only correct because abstention had a good handoff path.',
    pm: 'Picking a side confidently shows no awareness of the cost, and refusing to pick shows no willingness to decide — both fail the question.'
  }
};
