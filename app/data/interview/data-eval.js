/**
 * Interview layer — evaluation, observability, responsible AI, MLOps,
 * analytics, data and ML fundamentals.
 */
export const INTERVIEW = {
  /* ---------- Evaluation ---------- */
  'golden-sets': {
    s30: 'A golden set is a fixed collection of real cases with known-correct answers. It is the asset that lets you tell whether a change helped, and it is the thing I would never outsource.',
    s90: 'Ours was 220 cases drawn from resolved tickets and stratified deliberately: 120 common, 60 edge, and 40 that the corpus does not answer at all, where the correct behaviour is to abstain. That last group is the one teams leave out, and it is the one that catches a system quietly becoming overconfident. Building it took about three weeks that produced no demo, which is exactly the phase that gets cut under date pressure — and cutting it means you cannot upgrade a model, cannot tell whether a prompt change helped, and cannot detect degradation. Fourteen months later the same set was the reason we could swap models in an afternoon.',
    technical: 'Stratify by difficulty and report per stratum, because averages hide the shape. Add every confirmed production error as a regression case. Pin the corpus version separately from the index — if both move together, a parsing regression degrades both and the score is unchanged, so the evaluation cannot detect the failure it exists for.',
    pm: 'It is the closest thing an AI product has to a durable moat, because it determines the rate at which you can improve relative to a competitor.'
  },

  'regression-testing': {
    s30: 'Regression testing for AI means re-running a fixed set before every release and comparing against the last known result, because changes here have non-local effects.',
    s90: 'The reason it matters more than in conventional software is that you cannot reason about the blast radius of a prompt change. We added reranking, and the mean improved by 2.2 points — but eleven of twelve regressed cases were abstentions, because reranking always returns a plausible top-five and the abstention threshold had been tuned against raw retrieval scores. Confidently-wrong more than doubled. Nothing in the change touched abstention logic; the regression set is the only thing that would have caught it, and the mean would have shipped it.',
    technical: 'Compare distributions, not averages, and list what got worse explicitly. Every confirmed production error becomes a permanent case. Run in CI so a prompt change is gated the same way a code change is, and version prompt, model, retrieval config and corpus together so a failing run is reproducible.',
    pm: 'It is what makes it safe to change anything, which in a field where the models improve every few months is the difference between compounding and freezing.'
  },

  'faithfulness-metrics': {
    s30: 'Groundedness measures whether the answer is actually supported by the retrieved text, as distinct from whether it is true or whether it sounds right.',
    s90: 'It is the metric that catches the characteristic RAG failure, which is the model answering fluently from passages that do not support the claim. It is also the earliest signal of ingestion problems: on one system availability was 99.97% and error rate 0.1% while groundedness had fallen from 0.81 to 0.62, because ingestion had failed and the index was 71 hours stale. Nothing threw an exception. Groundedness and index age were the only two numbers that showed it, and users had already noticed — the rate at which agents opened the source document to check had gone from 19% to 34%.',
    technical: 'Usually scored by an LLM judge against the retrieved context, which needs its own calibration against human labels before you trust it. Track it as a distribution sampled from production rather than only on the golden set, because production contains inputs the golden set does not. Pair it with citation-correctness, since an answer can be grounded and still cite the wrong passage.',
    pm: 'It is the quality metric that makes silent degradation visible, and without it an AI product reports perfect health while getting worse.'
  },

  'human-evaluation': {
    s30: 'Human evaluation is the ground truth everything else is calibrated against. It is expensive, so the question is where to spend it rather than whether to.',
    s90: 'The place it is worth spending is establishing the labels an automated judge is then measured against, and re-checking that calibration periodically. Ours was two support leads scoring independently with a third resolving disagreements — and the inter-rater agreement was itself informative, because the cases they disagreed on were the cases where our definition of "correct" was underspecified. Fixing the rubric mattered more than adding cases. The other thing human evaluation gives you that a judge does not is the failure taxonomy: a score tells you how much is wrong, and a person tells you that six of nine errors were dropped tables rather than model errors.',
    technical: 'Measure inter-rater agreement before trusting a rubric. Judges should score against the retrieved context rather than their own knowledge, or you are measuring the corpus rather than the system. Sample production rather than only re-scoring the golden set, since the traffic drifts.',
    pm: 'It is the only thing that anchors every other number, and skipping the calibration step means an automated judge is measuring something nobody has checked.'
  },

  'llm-as-judge': {
    s30: 'Using a model to score model output makes evaluation affordable at scale, and it inherits biases that have to be measured before the scores can be trusted.',
    s90: 'The practical position is that a judge is a measuring instrument and needs calibration like one. Score a sample by hand, compare, and know your agreement rate before you rely on a number. The known biases are real and specific — position bias in pairwise comparisons, a preference for longer and more confident answers, and self-preference when the judge and the generator are the same model family. That last one matters commercially: a judge that likes its own family will report an upgrade as an improvement regardless.',
    technical: 'Constrain the judge to score against the retrieved context, use a rubric with explicit criteria rather than a general quality question, randomise position in pairwise comparisons, and re-calibrate whenever the judge model changes. Report agreement with human labels alongside the scores.',
    pm: 'It is what makes continuous evaluation affordable, and an uncalibrated judge produces confident numbers about nothing.'
  },

  'eval-thresholds-quality-gates': {
    s30: 'A quality gate is a numeric bar a release must clear, agreed before the results are seen. Setting it afterwards is how teams talk themselves into a number.',
    s90: 'Ours were: confidently-wrong below 1.5%, abstention between 25% and 35%, all forty out-of-corpus cases abstaining, p95 under three seconds, and seven named regression cases passing. The abstention band being two-sided is the detail I would emphasise — with only a floor on quality, a system that declines every question passes with a perfect error rate and no value. We also wrote kill criteria at the same time: two confirmed incorrect policy commitments in a week turns the feature off, and named who can pull it without escalation, because a criterion that needs a meeting to invoke will not be invoked.',
    technical: 'Gate in CI against the pinned corpus version. Make the thresholds per-stratum where the strata behave differently, since a single overall bar lets easy cases carry hard ones. Record the threshold with the reasoning that set it, because someone will read a high abstention rate as a defect and quietly lower it.',
    pm: 'It converts "is this good enough to ship" from a judgement call under launch pressure into a check agreed while nobody was under pressure.'
  },

  'retrieval-evaluation': {
    s30: 'Evaluate retrieval separately from generation, because most RAG failures are retrieval failures and an end-to-end score cannot tell you which half moved.',
    s90: 'Instrumenting the stages separately is what turns "the answer was wrong" into something diagnosable. Was the document in the corpus at all, did retrieval surface it, did it survive reranking, was the answer grounded in it — those have completely different fixes and only the last is a prompt or model problem. On our system 14% of production questions were about regional documents that had never been ingested, which no amount of prompt work would have addressed and which a single end-to-end number reported as generic inaccuracy.',
    technical: 'Recall at k on a labelled set tells you whether the right passage is being fetched; precision and rank position tell you whether it survives to the context. Measure before and after reranking separately, since reranking changes both the ordering and the score distribution that any threshold depends on.',
    pm: 'Teams reach for a better model when the real problem is a document that was never ingested — cheaper to fix and considerably less exciting.'
  },

  /* ---------- Observability ---------- */
  tracing: {
    s30: 'Tracing records what actually happened in a request — the retrieved chunks, the assembled prompt, the model response, every tool call — so a failure can be reconstructed rather than guessed at.',
    s90: 'Without it, every quality report becomes an unresolvable "we\'ll look into it", because a wrong answer with no trace is not investigable. With it, an agent flags an answer and the review the following week has the exact chunks and prompt in front of it. That loop is what turns individual complaints into patterns — in one week, fourteen confirmed errors looked like fourteen small annoyances until the traces showed nine shared a cause, regional policy variants answered from national policy. Fourteen tickets would have been triaged as low priority; one pattern outranked most of the roadmap.',
    technical: 'Capture the whole chain with a correlation id — question, retrieval results with scores, final assembled prompt, model and prompt versions, response, latency per stage, token counts. Redact PII before storage and bound retention. OpenTelemetry\'s GenAI semantic conventions give you a vocabulary that other tools already understand.',
    pm: 'It is the difference between an AI product that improves from its own errors and one that just accumulates complaints.'
  },

  'hallucination-monitoring': {
    s30: 'The failure mode that matters is a confident wrong answer, and it produces no error — so you have to sample production and score it, or you will not know it is happening.',
    s90: 'Availability monitoring reports an AI system as healthy while it is confidently wrong, because by its definition it is healthy. The measurable proxy is groundedness sampled from real traffic plus a user-side correction signal. The most valuable alert we had was neither of those: it was the rate at which users opened the source document to check the answer. That is people telling you they have stopped trusting the system, measured before anyone files a complaint — it moved from 19% to 34% two days before anything else showed a problem.',
    technical: 'Sample production rather than re-scoring the golden set, since the traffic drifts. Score groundedness against the retrieved context and pair it with the abstention rate, because a falling error rate that comes from rising abstention is not a quality improvement. Feed every confirmed case back as a regression.',
    pm: 'A quality regression in an AI product is invisible on a conventional dashboard, and the first signal you get otherwise is someone deciding it is unreliable.'
  },

  'drift-detection': {
    s30: 'Drift is the system\'s behaviour changing without anyone changing the code — usually because the data or the traffic moved underneath it.',
    s90: 'On a retrieval system the most common cause is corpus staleness: ingestion fails, the index ages, and answers come from withdrawn documents while every conventional metric stays green. The second is traffic drift — our golden set had 4% regional questions and production had 14%, so the abstention rate we had tuned for was wrong from day one and got worse as usage spread. Both are invisible unless index age, corpus version and the production distribution are tracked as first-class metrics rather than implementation details.',
    technical: 'Alert on index age against an SLA, on distribution shifts in retrieved-score histograms, and on the abstention rate moving without a release. Re-sample the golden set against production traffic periodically, because a set built at launch describes the traffic you anticipated.',
    pm: 'An AI feature quietly stops working rather than failing, so someone has to own watching it — that ownership is the stage nobody plans for.'
  },

  'token-usage-cost': {
    s30: 'Token accounting is where the money is, and the input side is usually about 85% of it — teams estimate on the answer and are surprised by the bill.',
    s90: 'Our baseline was 5,600 input tokens producing a 200-token answer. Optimising answer length would have saved roughly $150 a month; optimising context saved about $2,000. And after all the token optimisation — reranking, routing, prompt caching — the non-token costs were still larger: human error review, golden-set maintenance and tracing tooling came to more than the inference bill. That is the line teams leave out of the model entirely, and it is the one that gets cut when budgets tighten, which is the one that keeps the feature working.',
    technical: 'Attribute per feature and per tenant, not just in aggregate, or you cannot find which surface is expensive. Count retries at full price. Report cost per resolved outcome rather than per request — a cheaper model needing two attempts is not cheaper.',
    pm: 'It makes the unit economics arguable with numbers rather than adjectives, and it usually reveals the pricing model rather than the cost is what needs to change.'
  },

  /* ---------- Responsible AI ---------- */
  'privacy-pii': {
    s30: 'Calling a model API is sending data to a third party. Where they process it and how long they keep it are regulated questions, not implementation details.',
    s90: 'The cheapest control is not sending it. On a feature that summarised support threads, the threads contained names, emails, phone numbers, payment references and occasionally health information — none of which the summarisation actually needed. We redacted to stable placeholders before the model call and restored them in the UI after, which shrank the transfer question dramatically and made the rest of the compliance work tractable. The important part is when that decision happened: the redaction layer sits at the centre of the data path, so finding the requirement at design cost a design change, and finding it at launch would have cost a rebuild.',
    technical: 'Redact before the call, configure zero retention where the provider offers it, bound trace retention and store traces redacted, and document the processing region. Derived assets matter too — golden-set cases drawn from real conversations need de-identifying separately.',
    pm: 'Timing dominates the cost of every compliance constraint, which is the argument for bringing legal in at design rather than at launch review.'
  },

  'human-in-the-loop': {
    s30: 'A human checkpoint trades time saved against risk reduced. Where the cost of a wrong action is meaningful, suggesting beats acting.',
    s90: 'The design question is which specific actions need a human rather than whether the system is supervised in general, because a blanket checkpoint destroys the time saving and a blanket absence transfers risk to the user without their consent. On a support assistant we let it draft anything and act on nothing — it could not close a ticket, message a customer or touch a refund. That took an afternoon and removed most of the risk, and it also settled the regulatory question, because with a human deciding it is not automated decision-making. We wrote that down explicitly, because "why don\'t we just let it apply the refund" is the obvious next request and it moves the feature into a different risk class.',
    technical: 'Put the checkpoint where the action is consequential and irreversible, show the reasoning and the source at the point of decision, and make the human\'s job verification rather than re-derivation — otherwise they rubber-stamp, which is worse than no checkpoint because it manufactures accountability without providing it.',
    pm: 'Autonomy and trust trade directly, and which point you choose is a product decision that should be recorded rather than drifted into.'
  },

  'risk-assessment': {
    s30: 'I score AI risks on detectability as well as likelihood and severity, because the characteristic failure here is fluent, confident and silent.',
    s90: 'Adding that third axis reorders the register substantially. Our three highest-scoring risks were all low-detectability — a confidently wrong policy answer, a regional question answered from national policy, and a stale corpus serving withdrawn policy. None raises an error, none appears in availability monitoring, and all three would run for days. Meanwhile offensive output, which is high severity, scored lowest, because it would be visible and reported within minutes. Ranking on severity alone would have pointed our effort at the wrong risk entirely.',
    technical: 'Controls that work are structural: abstention, mandatory citation, capability limits, output filtering, human checkpoints on consequential actions, and logging sufficient to reconstruct a decision. Controls that do not work: disclaimers, "users should verify", and instructing the model to be careful. Write kill criteria before launch and name who can invoke them without a meeting.',
    pm: 'The asymmetry is severe — most product mistakes cost a sprint, and a data or safety mistake can cost a market.'
  },

  'eu-ai-act': {
    s30: 'The EU AI Act is risk-tiered: obligations attach to what the system is used for, not to how it was built. Most product work is about knowing which tier you are in.',
    s90: 'The practical question for a PM is whether the system makes or materially influences a decision about a person — employment, credit, education, essential services — because that is the high-risk category and it brings documentation, human oversight, logging and transparency obligations that are architectural rather than procedural. On a support assistant we recorded explicitly that a human decides and the system only drafts, precisely because the obvious next feature would have crossed that line and someone was going to propose it. Recording why you are not in a tier is as useful as knowing that you are.',
    technical: 'Transparency obligations apply broadly — users should know they are interacting with an AI system, and synthetic content is subject to marking requirements. The high-risk obligations, and the timeline for them, are the ones worth reading properly rather than summarising, and they interact with GDPR Article 22 on automated decision-making.',
    pm: 'It is a design constraint discovered cheaply at design time and expensively at launch, and it is jurisdictional, so the answer can differ per market.'
  },

  /* ---------- MLOps ---------- */
  'mlops-lifecycle': {
    s30: 'MLOps is the operational discipline around a model in production: versioning, deployment, monitoring, rollback and retraining. For LLM products the versioned artefacts include prompts and the corpus.',
    s90: 'The failure it prevents is the one I would call the sharpest form of AI technical debt: a model pinned to a version fourteen months old because there is no evaluation harness to prove a replacement is not worse. That compounds — the gap widens with every release and the eventual jump gets riskier. The priority order for fixing it is counter-intuitive: tracing first, then refresh the evaluation set, then consolidate the prompts, and the model upgrade last. The upgrade is the thing everyone wants and the thing that is unsafe until the other three exist.',
    technical: 'Version model, prompt, retrieval configuration and corpus together, because a change in any of them is indistinguishable in the output. Rollback has to be a configuration change rather than a deployment, or it will not happen during an incident. Monitor quality alongside availability, since these systems degrade rather than stop.',
    pm: 'It is what determines whether an AI product can take advantage of the next model release or is frozen on whatever it launched with.'
  },

  'production-monitoring': {
    s30: 'Monitoring an AI system means watching quality alongside availability, because uptime can be 100% while the product is broken.',
    s90: 'We had a week at 99.97% availability and 0.1% error rate where the system had been answering from three-day-old policy documents since Tuesday. The signals that existed were index age at 71 hours, groundedness down from 0.81 to 0.62, and users checking the source 34% of the time instead of 19%. Nothing threw an exception, no request failed, and a conventional dashboard was entirely green. After that we alerted on index age, groundedness, confidently-wrong rate and the verified-elsewhere rate — and the last of those has been the most valuable, because it is the users telling us something before they say anything.',
    technical: 'Sample production and score it rather than relying on the golden set, which describes the traffic you anticipated. Track index freshness and corpus version as first-class metrics. Alert on p95, not means. And pair every quality metric with its counterpart, since abstention and error rate move together.',
    pm: 'Someone has to own this permanently. An AI feature without a standing weekly review works, and then quietly stops.'
  },

  rollback: {
    s30: 'Rollback for an AI system has to cover the prompt, the model version, the retrieval configuration and the corpus — not just the code.',
    s90: 'The requirement I would state plainly is that turning a feature off must be a configuration change that a named person can make without a deployment and without a meeting. During an incident, anything slower does not happen. Ours was a per-cohort feature flag, and we wrote the kill criteria before launch — two confirmed incorrect policy commitments in a week, or confidently-wrong above 3% on the weekly sample — along with who could pull it. When a parsing regression made the system answer regional questions from national policy, the feature was off for regional queries within an hour.',
    technical: 'Pin every artefact version so a rollback target is unambiguous. Keep the previous corpus version available rather than overwriting the index in place. And test the rollback path, because an untested rollback is a plan rather than a control.',
    pm: 'The ability to stop quickly is what makes it reasonable to ship at all, and it has to be decided while nobody is under pressure.'
  },

  /* ---------- Analytics and data ---------- */
  'cohorts-retention': {
    s30: 'Cohort analysis groups users by when they started and tracks each group over time, which separates a product genuinely improving from one that is simply growing.',
    s90: 'It also catches things an aggregate cannot. On an AI feature, gross margin per cohort told a story the blended number hid completely: the oldest cohort had the worst margin, at 63%, and the newest the best at 79% — not because we had got better, but because adoption grows with tenure and our costs scale with usage under a flat per-seat contract. Every cohort was heading toward 63%. That reframed the problem from cost optimisation to pricing structure, which is a different piece of work entirely.',
    technical: 'Hold the cohort definition fixed and compare the same period index across cohorts. Watch the shape of the curve rather than a single retention number — whether it flattens is what tells you there is a durable core.',
    pm: 'Aggregate metrics can improve while every individual cohort gets worse, and only cohorts make that visible.'
  },

  'ab-testing': {
    s30: 'An A/B test isolates the effect of a change by comparing against a concurrent control, which is the only way to distinguish a real effect from a coincidence.',
    s90: 'For AI features there is an extra wrinkle: the system is stochastic, so a single run per case is one draw from a distribution and the offline result may not survive contact with real traffic. My sequence is offline against the golden set first — fast, cheap, reproducible, catches most regressions — then shadow on real traffic with nobody exposed, then an online test with guardrails. Shadow is the stage that earns its keep and the one that gets skipped because it produces no visible progress; ours revealed that production traffic had three times more regional questions than our evaluation set, which changed the plan before a single user saw the feature.',
    technical: 'Include guardrail metrics that must not degrade — a change that improves answer quality and doubles latency can lose overall. Report the distribution and name what got worse, because a mean improvement can conceal a regressed subgroup.',
    pm: 'It is how you tell whether the thing you shipped is the reason the number moved, and without it teams attribute confidently and wrongly.'
  },

  percentiles: {
    s30: 'Percentiles describe the tail, and the tail is what users actually experience and complain about. A mean hides it.',
    s90: 'A concrete case: our mean time to first token was 410ms all through a week when the p95 was 2.3 seconds. The mean matched nothing anyone was reporting, and the p95 matched all of it. It matters more for AI features than for ordinary endpoints because generation latency has a genuinely long tail — a long input, a long answer or a queued request all land in the same distribution — so the average describes a request that mostly does not happen.',
    technical: 'Alert on p95 or p99 rather than the mean, and keep the components separate — retrieval, prefill, generation, post-processing — because one end-to-end percentile tells you the tail exists and nothing about what to fix.',
    pm: 'Reporting a mean latency is how a team can be confident everything is fine while a meaningful share of users have a bad experience.'
  },

  'what-is-ml': {
    s30: 'Machine learning is fitting a model to data rather than writing the rules by hand. It is worth reaching for when the rules are too varied or too tacit to enumerate.',
    s90: 'The product-relevant consequence is that behaviour comes from data rather than from a specification, so it cannot be fully specified in advance and it changes when the data changes. That is why evaluation is not a testing phase but an ongoing requirement. The other consequence is the one that decides use cases: a system fitted to data is right most of the time rather than always, so whether it is appropriate depends on what a wrong answer costs and whether anyone can tell it is wrong.',
    technical: 'Training and inference are different activities with different costs and different hardware. The failure modes — overfitting, distribution shift, label noise — are properties of the data rather than bugs in the code, which is why data quality dominates model choice more often than people expect.',
    pm: 'It is the difference between "if you can specify it you can build it" and "you find out whether it works by testing it", which changes how you sequence a project.'
  },

  'train-val-test': {
    s30: 'You split data so that the number you report comes from examples the model has never seen, otherwise you are measuring memorisation.',
    s90: 'The equivalent discipline in LLM product work is keeping the golden set genuinely held out from anything used to tune prompts or retrieval. It is easy to lose without noticing: you iterate on a prompt against the golden set, and by the twentieth iteration the set has become the training data and the score means nothing. We kept a separate untouched slice for release gates specifically for that reason, and refreshed the working set from production periodically.',
    technical: 'The subtler leak is temporal — evaluating on cases drawn from the same corpus version the index was built from means a parsing regression degrades both sides and scores unchanged. Pin the evaluation corpus version separately.',
    pm: 'Every reported quality number depends on this being right, and when it is wrong the number is confidently meaningless.'
  },

  'overfitting-underfitting': {
    s30: 'Overfitting is learning the training examples rather than the pattern — excellent on what it has seen and poor on anything new.',
    s90: 'The LLM-product analogue is prompt overfitting, and it is very easy to do accidentally. You iterate a prompt against twenty examples until it handles all twenty beautifully, then production traffic arrives and it is no better than where you started, because you tuned to the specific cases rather than the underlying task. The defence is the same as in classical ML: a held-out set you do not iterate against, and enough real cases that the pattern is what improves rather than the instances.',
    technical: 'The symptom is a widening gap between the set you iterate on and the set you do not. Stratify so that the hard cases cannot be carried by the easy ones, and refresh from production because the distribution moves.',
    pm: 'It explains why a feature that looked excellent in a demo built from cherry-picked examples underperforms on real traffic — and it is preventable rather than surprising.'
  }
};
