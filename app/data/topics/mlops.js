/**
 * DOMAIN Q — MLOPS / MODELOPS (BUILD.md section 20)
 */
export const topics = [
  {
    id: 'mlops-lifecycle',
    title: 'The MLOps Lifecycle',
    domain: 'mlops', tier: 1, priority: 'high',
    summary: 'Data to model to evaluation to deployment to monitoring — and back, because it never stops.',
    what: `MLOps is the operational practice of getting models into production and keeping them working: versioning, deploying, monitoring, retraining and rolling back.

The defining property is that it is a **loop**, not a pipeline. A model is never finished.`,
    why: `Most AI projects fail after the model works, not before. The prototype produces a good number, and then nobody has a way to deploy it, monitor it, or notice when it stops working. MLOps is the difference between a demo and a system.`,
    analogy: `Building a bridge versus running a bridge. Construction is a project with an end. Operation is inspections, load monitoring, repairs and eventually replacement — indefinitely.`,
    technical: `The loop: **data** → **train/configure** → **evaluate** → **deploy** → **monitor** → **detect drift** → back to data.

For LLM applications the "model" is usually not trained by you, so the loop shifts:
- **Data** becomes the document corpus and the golden set.
- **Train** becomes prompt and retrieval configuration.
- **Evaluate** is the same.
- **Deploy** becomes shipping a prompt version and an index version.
- **Monitor** is the same.
- **Retrain** becomes re-index, re-prompt, or change model version.

The operational disciplines transfer completely even though nobody is training anything: version everything, evaluate before deploying, deploy gradually, monitor continuously, and be able to roll back in minutes.

The single most valuable capability is **fast, safe rollback**. Everything else buys you time; rollback buys you an exit.`,
    diagram: `
   THE LOOP — it never terminates

        ┌──────────────────────────────────────────┐
        ▼                                          │
      DATA ──► TRAIN/CONFIGURE ──► EVALUATE ──► DEPLOY
   (corpus,    (prompt, retrieval,   (golden     (versioned,
    golden      model choice)         set)        gradual)
    set)                                            │
        ▲                                           ▼
        │                                      MONITOR
        │                                     (quality, cost,
        └───────── DRIFT DETECTED ◄────────── drift, feedback)

   THE TRANSLATION FOR LLM APPS

     classical ML          LLM application
     ───────────           ───────────────
     training data    →    document corpus + golden set
     model training   →    prompt + retrieval configuration
     model artifact   →    prompt version + index version
                           + pinned model version
     retraining       →    re-index · re-prompt · change model

     Nobody trains anything, and every operational discipline
     still applies.

   ⚠ THE MOST VALUABLE CAPABILITY IS ROLLBACK

     everything else buys you TIME
     rollback buys you an EXIT

     If reverting a bad prompt takes a deployment cycle, every
     incident is measured in hours instead of minutes.`,
    example: {
      language: 'text',
      caption: 'The same lifecycle, for a classical model and an LLM feature',
      code: `── CLASSICAL ML: ticket classifier ────────────────────────
  DATA        12,000 labelled tickets, versioned dataset v4
  TRAIN       gradient-boosted model, hyperparameters in config
  EVALUATE    held-out test set: macro F1 0.88
  DEPLOY      model registry → staging → 10% → 100%
  MONITOR     prediction distribution, F1 on labelled sample,
              feature drift
  RETRAIN     triggered when F1 on the sample drops below 0.82
              or quarterly, whichever comes first

── LLM APPLICATION: support assistant ─────────────────────
  DATA        document corpus (index v2026-03-11)
              golden set (golden_v3, 240 cases)
  CONFIGURE   prompt answer_v4 · top_k 4 · rerank on
              · model claude-sonnet-5 (PINNED)
  EVALUATE    golden set: groundedness 0.93, over-refusal 0.04
  DEPLOY      prompt registry → 5% → 25% → 100%
              (prompts hot-loaded — no code deploy needed)
  MONITOR     sampled groundedness, gate trips, escalations,
              cost per request, p95 latency
  "RETRAIN"   re-index on document change
              re-prompt on quality drift
              re-evaluate on provider model update

── WHAT IS IDENTICAL ──────────────────────────────────────
  version everything · evaluate before deploying
  · deploy gradually · monitor continuously
  · roll back in minutes

  Nobody trained a model in the second column. Every
  operational discipline still applied.`
    },
    prereq: [], next: ['model-deployment', 'model-versioning'],
    related: ['regression-testing', 'drift-detection', 'prompt-versioning'],
    tools: ['git', 'opentelemetry'],
    useCases: [
      'Planning what happens after an AI prototype works.',
      'Translating classical MLOps discipline to an LLM application.',
      'Identifying what is missing before a launch.'
    ],
    avoid: [
      'Heavyweight MLOps tooling for a single prototype.',
      'Assuming an LLM application needs no operational practice because nothing is trained.'
    ],
    mistakes: [
      'Treating deployment as the end rather than the start.',
      'Assuming no training means no MLOps — versioning, evaluation, monitoring and rollback all still apply.',
      'No rollback path, so every incident lasts as long as a deployment cycle.',
      'No monitoring, so degradation is discovered by users.'
    ],
    keyTerms: [
      ['MLOps', 'Operational practice for models in production.'],
      ['lifecycle', 'The loop from data through deployment to monitoring and back.'],
      ['model artifact', 'What is actually deployed. For LLM apps: prompt + index + model version.'],
      ['rollback', 'Returning to a previous known-good configuration.'],
      ['drift trigger', 'The condition that sends you back around the loop.'],
      ['hot-loading', 'Changing configuration without a code deployment.']
    ],
    resources: [
      ['Google — MLOps: continuous delivery for ML', 'https://cloud.google.com/architecture/mlops-continuous-delivery-and-automation-pipelines-in-machine-learning', 'reference'],
      ['Google — Rules of Machine Learning', 'https://developers.google.com/machine-learning/guides/rules-of-ml', 'reference'],
      ['Made With ML — MLOps course', 'https://madewithml.com/', 'course'],
      ['ml-ops.org — MLOps principles', 'https://ml-ops.org/content/mlops-principles', 'reference']
    ],
    questions: [
      ['Why is MLOps a loop rather than a pipeline?', 'A model is never finished. Data changes, usage shifts, providers update models, and quality degrades without anyone changing anything, so the process returns to the start indefinitely.'],
      ['Does an LLM application need MLOps if nothing is trained?', 'Yes. The artifact becomes prompt version plus index version plus pinned model version, and every discipline — versioning, evaluation, gradual deployment, monitoring, rollback — applies unchanged.'],
      ['What is the single most valuable operational capability?', 'Fast, safe rollback. Everything else buys time; rollback buys an exit, and it determines whether an incident lasts minutes or hours.']
    ]
  },

  {
    id: 'model-deployment',
    title: 'Model Deployment',
    domain: 'mlops', tier: 2, priority: 'medium',
    summary: 'Getting a change into production without betting the product on it.',
    what: `Deployment is the process of putting a new model, prompt or retrieval configuration in front of users — gradually, with monitoring, and with a way back.`,
    why: `AI changes are riskier than typical code changes because their effects are probabilistic and often invisible in the first hour. A change can pass evaluation and still degrade real usage, so the deployment mechanism has to expose that before everyone is affected.`,
    analogy: `Opening a new kitchen. You do not switch the whole restaurant over on Friday night. You run it for a few tables first, watch what comes back, then expand.`,
    technical: `Patterns, in increasing safety:

**Direct** — replace and hope. Acceptable only for genuinely low-risk changes with fast rollback.

**Canary** — route a small percentage to the new version, compare metrics, expand gradually. The default for AI changes.

**Shadow** — run the new version on real traffic without serving its output, and compare offline. Safest, costs double inference, and cannot measure user reaction.

**Blue-green** — two full environments, switch traffic, switch back instantly. Fast rollback, doubles infrastructure.

For LLM applications specifically: prompts should be **hot-loadable** from a registry rather than baked into a deployment, because that makes rollback a configuration change measured in seconds rather than a deploy measured in minutes.

Define **rollback triggers** before deploying — the specific metric movements that automatically revert. "We'll keep an eye on it" is not a trigger.`,
    diagram: `
   CANARY — the default for AI changes

     5%  ──► monitor 1h ──► compare against control
                              │
                    ┌─────────┴─────────┐
                  worse               same/better
                    │                    │
                 ROLLBACK              25%  ──► monitor 4h
                                         │
                                       100%  ──► monitor 24h

   SHADOW — safest, and expensive

     traffic ──┬──► current version ──► served to user
               └──► new version     ──► logged, NOT served
                                        compare offline

     no user risk · double inference cost
     cannot measure user REACTION (nobody saw it)

   ⚠ DEFINE ROLLBACK TRIGGERS BEFORE DEPLOYING

     ✗ "we'll keep an eye on it"

     ✓ automatic revert if, over 30 minutes:
         groundedness  < control - 0.05
         escalation rate > control × 1.5
         p95 latency   > 4s
         error rate    > 1%

   ⚠ HOT-LOADABLE PROMPTS

     prompt in a registry   → rollback in SECONDS
     prompt in the codebase → rollback in a DEPLOY CYCLE

     For a quality incident, that difference is the incident.`,
    example: {
      language: 'python',
      caption: 'Canary routing with automatic rollback triggers',
      code: `ROLLBACK_TRIGGERS = {
    "groundedness":     ("below_control_by", 0.05),
    "escalation_rate":  ("above_control_by_factor", 1.5),
    "p95_latency_ms":   ("above_absolute", 4000),
    "error_rate":       ("above_absolute", 0.01),
}

def route(request, deployment):
    """Sticky per user, so one person does not see both versions."""
    if hash_user(request.user_id) % 100 < deployment.canary_percent:
        version = deployment.canary
        arm = "canary"
    else:
        version = deployment.stable
        arm = "control"

    result = run(request, version)
    metrics.record(arm=arm, version=version, result=result)
    return result


def evaluate_canary(deployment, window="30m"):
    canary = metrics.summary(arm="canary", window=window)
    control = metrics.summary(arm="control", window=window)

    if canary["sample_size"] < 200:
        return {"decision": "wait", "reason": "insufficient sample"}

    breaches = []
    for metric, (rule, bound) in ROLLBACK_TRIGGERS.items():
        c, k = control[metric], canary[metric]
        if rule == "below_control_by" and k < c - bound:
            breaches.append(f"{metric}: {k:.3f} vs control {c:.3f}")
        elif rule == "above_control_by_factor" and k > c * bound:
            breaches.append(f"{metric}: {k:.3f} vs control {c:.3f}")
        elif rule == "above_absolute" and k > bound:
            breaches.append(f"{metric}: {k:.3f} exceeds {bound}")

    if breaches:
        rollback(deployment, reason=breaches)          # AUTOMATIC
        return {"decision": "rollback", "breaches": breaches}

    return {"decision": "expand",
            "next_percent": min(deployment.canary_percent * 5, 100)}


def rollback(deployment, reason):
    """Prompts are hot-loaded, so this takes seconds."""
    prompt_registry.activate(deployment.stable_prompt)
    log.error("automatic rollback", extra={"reason": reason})
    alert_oncall("canary rolled back", reason)`
    },
    prereq: ['mlops-lifecycle'], next: ['model-versioning', 'rollback'],
    related: ['prompt-versioning', 'ai-rollout', 'ab-testing', 'production-monitoring'],
    tools: ['git', 'braintrust', 'langsmith'],
    useCases: [
      'Shipping a prompt or model change without risking all traffic.',
      'Defining automatic rollback conditions before deploying.',
      'Comparing a new configuration against the current one on real traffic.'
    ],
    avoid: [
      'Direct replacement for anything user-facing without fast rollback.',
      'Shadow deployment when you need to measure user reaction.',
      'Expanding a canary before the sample is large enough to mean anything.'
    ],
    mistakes: [
      'No rollback triggers defined before deploying.',
      'Non-sticky routing, so one user sees both versions in a session.',
      'Expanding on a sample too small to detect a difference.',
      'Prompts baked into the codebase, so rollback needs a deploy.',
      'Monitoring only errors, missing quality regressions that return HTTP 200.'
    ],
    keyTerms: [
      ['canary deployment', 'Routing a small percentage to the new version.'],
      ['shadow deployment', 'Running the new version without serving its output.'],
      ['blue-green', 'Two environments; switch traffic between them.'],
      ['sticky routing', 'A given user always sees the same version.'],
      ['rollback trigger', 'A metric condition that automatically reverts.'],
      ['hot-loading', 'Changing configuration without a code deployment.'],
      ['control arm', 'The traffic still on the current version, for comparison.']
    ],
    resources: [
      ['Google SRE Book — release engineering', 'https://sre.google/sre-book/release-engineering/', 'reference'],
      ['Martin Fowler — canary release', 'https://martinfowler.com/bliki/CanaryRelease.html', 'reference'],
      ['Google — MLOps continuous delivery', 'https://cloud.google.com/architecture/mlops-continuous-delivery-and-automation-pipelines-in-machine-learning', 'reference']
    ],
    questions: [
      ['Why are AI changes riskier to deploy than typical code changes?', 'Their effects are probabilistic and often invisible at first. A change can pass evaluation and still degrade real usage, and the failure returns HTTP 200.'],
      ['What must be defined before a canary starts?', 'The rollback triggers — the specific metric movements that automatically revert. "We will keep an eye on it" is not a trigger and does not survive a busy afternoon.'],
      ['Why should prompts be hot-loadable?', 'It turns rollback from a deployment cycle into a configuration change measured in seconds, which is the difference between a short incident and a long one.']
    ]
  },

  {
    id: 'model-versioning',
    title: 'Model & Configuration Versioning',
    domain: 'mlops', tier: 2, priority: 'high',
    summary: 'Knowing exactly what produced a given output, months later.',
    what: `Versioning means every component that affects behaviour has an identifiable version, and every output records which versions produced it.

For an LLM application that is at minimum: prompt version, model version, index version, and retrieval configuration.`,
    why: `Without it, "quality dropped last Tuesday" has no path to a cause. With it, the question becomes a query. Versioning is also what makes rollback possible at all — you cannot revert to a state you cannot name.`,
    analogy: `A build number on software. Nobody thinks about it until a bug report arrives, at which point the first question is which build, and without an answer the investigation cannot start.`,
    technical: `What must be versioned:
- **Prompt** — every edit is a new version, in git.
- **Model** — the exact version string, never "latest". A provider updating behind an alias is an unversioned behaviour change.
- **Index** — the embedding model, chunking configuration and corpus snapshot together define the index version.
- **Retrieval config** — top-k, thresholds, reranker, filters.
- **Golden set** — so scores from different weeks are comparable.
- **Code** — the ordinary git commit.

Record the full version tuple with every response and every evaluation result. That single practice is what turns most quality investigations from archaeology into a filter.

**Semantic meaning matters more than the scheme.** A version that changes when behaviour changes is useful; an auto-incrementing number that changes on every deploy is noise.`,
    diagram: `
   THE VERSION TUPLE — record it with EVERY response

     { "prompt_version":   "answer_v4",
       "model_version":    "claude-sonnet-5",     ← never "latest"
       "index_version":    "2026-03-11",
       "retrieval_config": "topk4_rerank_v2",
       "golden_set":       "golden_v3",
       "code_commit":      "9f3c1a2" }

   WHAT THIS TURNS INTO A QUERY

     "quality dropped last Tuesday"
        ↓
     SELECT prompt_version, model_version, index_version,
            AVG(groundedness)
     FROM responses
     WHERE ts BETWEEN '...' AND '...'
     GROUP BY 1,2,3

     prompt   model      index        groundedness
     ───────  ─────────  ──────────   ────────────
     v4       sonnet-5   2026-03-04       0.93
     v4       sonnet-5   2026-03-11       0.71   ← the index changed

     Archaeology becomes a filter.

   ⚠ "latest" IS NOT A VERSION

     provider updates behind an alias
       → behaviour changes
       → no change record
       → no re-evaluation
       → indistinguishable from a real regression

   ⚠ WHAT MAKES AN INDEX VERSION

     embedding model + chunking config + corpus snapshot
     Change any one and retrieval behaves differently.`,
    example: {
      language: 'python',
      caption: 'A version tuple attached to every response and every evaluation',
      code: `import hashlib, json
from dataclasses import dataclass, asdict

@dataclass(frozen=True)
class Versions:
    prompt: str            # "answer_v4"
    model: str             # exact, never an alias
    index: str             # embedding model + chunking + corpus snapshot
    retrieval: str         # "topk4_rerank_v2"
    golden_set: str        # so scores are comparable across weeks
    code: str              # git commit

    def fingerprint(self) -> str:
        return hashlib.sha256(
            json.dumps(asdict(self), sort_keys=True).encode()).hexdigest()[:12]

VERSIONS = Versions(
    prompt="answer_v4",
    model="claude-sonnet-5",          # ← pinned. "latest" would be a bug.
    index=index_version(),            # derived, see below
    retrieval="topk4_rerank_v2",
    golden_set="golden_v3",
    code=git_commit(),
)

def index_version():
    """An index version is the combination, not just the date."""
    return hashlib.sha256(json.dumps({
        "embed_model": EMBED_MODEL,
        "chunk_size": CHUNK_SIZE,
        "chunk_overlap": CHUNK_OVERLAP,
        "corpus_snapshot": corpus_manifest_hash(),
    }, sort_keys=True).encode()).hexdigest()[:12]

# ── ATTACH TO EVERY RESPONSE ───────────────────────────────
def respond(question, user):
    result = generate(question, user)
    log_response({**result, "versions": asdict(VERSIONS),
                  "version_fingerprint": VERSIONS.fingerprint()})
    return result

# ── AND TO EVERY EVALUATION RESULT ─────────────────────────
def record_eval(scores):
    eval_store.write({**scores, "versions": asdict(VERSIONS)})

# ── GUARD AGAINST SILENT DRIFT ─────────────────────────────
def assert_pinned():
    assert "latest" not in VERSIONS.model, "model version is not pinned"
    assert VERSIONS.index == index_version(), \\
        "index changed without a version bump — re-evaluate before serving"`
    },
    prereq: ['model-deployment'], next: ['model-registry', 'rollback'],
    related: ['prompt-versioning', 'git-basics', 'regression-testing', 'drift-detection'],
    tools: ['git', 'braintrust', 'langsmith'],
    useCases: [
      'Attributing a quality change to a specific cause.',
      'Making rollback possible by naming the state to return to.',
      'Comparing evaluation results across weeks.'
    ],
    avoid: [
      'Version schemes so granular that every deploy changes them meaninglessly.',
      'Model aliases like "latest" in anything that matters.'
    ],
    mistakes: [
      'Using "latest", so provider updates change behaviour with no record.',
      'Versioning the prompt but not the index, missing the most common cause of retrieval regressions.',
      'Not recording versions on evaluation results, making scores incomparable.',
      'Treating the index version as a date rather than as the combination of embedding model, chunking and corpus.',
      'No version fingerprint on responses, so investigation starts from nothing.'
    ],
    keyTerms: [
      ['version tuple', 'The full set of versions that determine behaviour.'],
      ['pinning', 'Fixing an exact version rather than an alias.'],
      ['index version', 'Embedding model + chunking config + corpus snapshot.'],
      ['fingerprint', 'A short hash of the full version tuple.'],
      ['semantic versioning', 'Versions that change when behaviour changes.'],
      ['configuration drift', 'Behaviour changing without a version bump.']
    ],
    resources: [
      ['Anthropic — model deprecations and versions', 'https://docs.anthropic.com/en/docs/about-claude/model-deprecations', 'docs'],
      ['DVC — data and model versioning', 'https://dvc.org/doc', 'docs'],
      ['MLflow — model registry', 'https://mlflow.org/docs/latest/model-registry.html', 'docs'],
      ['Pro Git — tagging', 'https://git-scm.com/book/en/v2/Git-Basics-Tagging', 'course']
    ],
    questions: [
      ['What is the minimum version tuple for an LLM application?', 'Prompt version, exact model version, index version, retrieval configuration, golden-set version and code commit — recorded with every response and every evaluation result.'],
      ['Why is "latest" a bug rather than a convenience?', 'The provider can update the model behind the alias, changing behaviour with no change record and no re-evaluation. The result is indistinguishable from a real regression.'],
      ['What actually defines an index version?', 'The combination of embedding model, chunking configuration and corpus snapshot. Changing any one changes retrieval behaviour, so a date alone is insufficient.']
    ]
  },

  {
    id: 'model-registry',
    title: 'Model Registry',
    domain: 'mlops', tier: 3, priority: 'low',
    summary: 'A catalogue of model artifacts with their lineage, metrics and deployment stage.',
    what: `A model registry stores trained model artifacts alongside their metadata: which data produced them, what they scored, who approved them, and which environment they are deployed to.`,
    why: `It answers "which model is in production, what did it score, and what data made it?" without archaeology. For teams that train models it is essential infrastructure; for teams that only use hosted models the equivalent role is played by a prompt registry and a model inventory.`,
    analogy: `A library catalogue for models. Each entry records the edition, the provenance, where the copy is shelved, and who authorised it.`,
    technical: `A registry entry records: the artifact, the training dataset version, hyperparameters, evaluation metrics, the code commit, the approver, and a stage (development / staging / production / archived).

Stage transitions are the useful part — promoting a model from staging to production is a recorded, approvable event rather than a file copy.

**For LLM applications** the registry role splits:
- **Prompt registry** — versioned prompts, hot-loadable, with the evaluation results attached.
- **Model inventory** — which hosted model versions are in use where (see model governance).
- **Index registry** — which index version is live, and what built it.

The principle is the same: the deployed configuration should be a named, retrievable, approvable artifact rather than an implicit state of the codebase.`,
    diagram: `
   A REGISTRY ENTRY

     name         ticket-classifier
     version      7
     artifact     s3://models/ticket-clf/v7/adapter.safetensors
     lineage      dataset v4 (2,140 examples, 2026-02-11)
                  base model haiku-4.5
                  LoRA r=16, 3 epochs
     metrics      macro F1 0.88 · held-out set 2026-02
     code         commit 9f3c1a2
     approved     Engineering Lead · 2026-02-20
     stage        PRODUCTION
     history      v6 archived 2026-02-20 (F1 0.84)

   STAGE TRANSITIONS ARE THE POINT

     development ──► staging ──► production ──► archived
                        │            │
                   evaluation    approval
                   required      required

     Promotion is a recorded, approvable EVENT —
     not a file copy someone did on a Friday.

   FOR LLM APPLICATIONS THE ROLE SPLITS

     PROMPT REGISTRY   versioned prompts · hot-loadable
                       · evaluation results attached
     MODEL INVENTORY   which hosted versions, used where
     INDEX REGISTRY    which index is live, and what built it

   Same principle: the deployed configuration should be a
   NAMED, RETRIEVABLE, APPROVABLE artifact — not an implicit
   state of the codebase.`,
    example: {
      language: 'python',
      caption: 'A prompt registry — the LLM-application equivalent',
      code: `import json, hashlib
from pathlib import Path

class PromptRegistry:
    """Versioned, hot-loadable prompts with evaluation attached."""

    def __init__(self, root="prompts"):
        self.root = Path(root)

    def register(self, name, text, evaluation, approver):
        version = self._next_version(name)
        entry = {
            "name": name,
            "version": version,
            "text": text,
            "hash": hashlib.sha256(text.encode()).hexdigest()[:12],
            "evaluation": evaluation,        # scores that justified it
            "approved_by": approver,
            "approved_at": now_iso(),
            "stage": "staging",
        }
        (self.root / f"{name}_v{version}.json").write_text(
            json.dumps(entry, indent=2), encoding="utf-8")
        return entry

    def promote(self, name, version, approver):
        """A recorded event, not a file copy."""
        entry = self.get(name, version)
        if entry["evaluation"]["groundedness"] < 0.85:
            raise ValueError("cannot promote: evaluation below threshold")

        current = self.active(name)
        if current:
            self._set_stage(name, current["version"], "archived")

        self._set_stage(name, version, "production")
        audit.log("prompt_promoted", name=name, version=version,
                  from_version=current["version"] if current else None,
                  approver=approver)

    def active(self, name):
        """Hot-loaded at request time — rollback is instant."""
        for f in self.root.glob(f"{name}_v*.json"):
            entry = json.loads(f.read_text())
            if entry["stage"] == "production":
                return entry
        return None

# Rollback:
#   registry.promote("answer", version=4, approver=oncall)
# Seconds, not a deployment cycle.`
    },
    prereq: ['model-versioning'], next: ['production-monitoring'],
    related: ['prompt-versioning', 'model-governance', 'rollback', 'huggingface'],
    tools: ['huggingface', 'git'],
    useCases: [
      'Knowing which model or prompt version is in production.',
      'Making promotion an approvable, recorded event.',
      'Retrieving a previous version instantly for rollback.'
    ],
    avoid: [
      'A full model registry when you only consume hosted models — a prompt registry and inventory suffice.',
      'Registry infrastructure for a single prototype.'
    ],
    mistakes: [
      'The deployed prompt existing only inside the codebase, so it is not retrievable independently.',
      'Promotion as a file copy rather than a recorded event with approval.',
      'No evaluation results attached to a version, so promotion has no evidence.',
      'No archived history, so rollback targets have to be reconstructed.'
    ],
    keyTerms: [
      ['model registry', 'A catalogue of model artifacts with lineage and stage.'],
      ['prompt registry', 'The LLM-application equivalent: versioned, hot-loadable prompts.'],
      ['lineage', 'What data and configuration produced an artifact.'],
      ['stage', 'Development, staging, production or archived.'],
      ['promotion', 'Moving an artifact to a higher stage. An approvable event.'],
      ['hot-loading', 'Activating a version without a deployment.']
    ],
    resources: [
      ['MLflow — model registry', 'https://mlflow.org/docs/latest/model-registry.html', 'docs'],
      ['Hugging Face Hub — model repositories', 'https://huggingface.co/docs/hub/models', 'docs'],
      ['Braintrust — prompt management', 'https://www.braintrust.dev/docs/guides/prompts', 'docs'],
      ['LangSmith — prompt versioning', 'https://docs.smith.langchain.com/prompt_engineering', 'docs']
    ],
    questions: [
      ['What role does a registry play for teams that do not train models?', 'The same role, split: a prompt registry for versioned hot-loadable prompts, a model inventory for hosted versions in use, and an index registry for what is live.'],
      ['Why is promotion the important part?', 'It makes moving a version into production a recorded, approvable event with evaluation evidence attached, rather than a file copy nobody can trace afterwards.'],
      ['What does hot-loading buy you operationally?', 'Rollback in seconds. The active version is a registry pointer rather than a deployed file, so reverting does not require a deployment cycle.']
    ]
  },

  {
    id: 'production-monitoring',
    title: 'Production Monitoring',
    domain: 'mlops', tier: 2, priority: 'high',
    summary: 'Watching a live AI system for the failures that do not raise errors.',
    what: `Production monitoring for an AI system tracks quality, cost, latency and behaviour continuously — not just uptime and error rates, which capture almost none of the ways it fails.`,
    why: `Standard application monitoring will report an AI system as perfectly healthy while every answer is wrong. The failures that matter return HTTP 200. Monitoring has to be designed around that.`,
    analogy: `Monitoring a water supply for pressure only. Pressure is fine; the water is contaminated. You need tests for the thing that actually matters, not just the thing that is easy to measure.`,
    technical: `The layers:

**Infrastructure** — uptime, error rate, latency. Necessary, and it sees only hard failures.

**Behaviour** — request volume by category, output length distribution, refusal rate, gate trip rate, tool-call rate. These move before quality metrics do.

**Quality** — sampled groundedness, relevance, and evaluation on production traffic.

**Business** — resolution rate, escalation rate, cost per successful outcome.

**Alert on the layers that move first.** A rising gate trip rate or escalation rate usually precedes anything visible in a quality metric, and both are cheap to compute on all traffic.

Build a **dashboard for the weekly review**, not just alarms. Many AI degradations are gradual, and nothing crosses an alert threshold on the day it starts.

The most useful single alert is usually a **composite**: quality below X *and* escalations above Y, which fires on real problems and not on normal variation.`,
    diagram: `
   FOUR LAYERS — the top one sees almost nothing

     INFRASTRUCTURE   uptime · error rate · latency
                      ← standard monitoring stops here, and
                        AI failures return HTTP 200

     BEHAVIOUR        volume by category · output length
                      · refusal rate · gate trips · tool calls
                      ← these MOVE FIRST and are cheap

     QUALITY          sampled groundedness · relevance
                      · online evaluation

     BUSINESS         resolution rate · escalation rate
                      · cost per successful outcome

   WHAT MOVES FIRST

     t+0    an index rebuild goes wrong
     t+5m   gate trip rate rises        ← cheap, all traffic
     t+15m  escalation rate rises       ← free, all traffic
     t+2h   sampled groundedness drops  ← sampled, delayed
     t+2d   support volume rises        ← the expensive discovery

     Alert on the first two.

   ⚠ BUILD FOR THE WEEKLY REVIEW, NOT JUST ALARMS

     many AI degradations are gradual. Nothing crosses a
     threshold on the day it starts. A trend chart someone
     looks at every Monday catches what alerts miss.

   THE BEST SINGLE ALERT IS A COMPOSITE

     groundedness < 0.85  AND  escalations > 1.5× baseline
     → fires on real problems, not on normal variation`,
    example: {
      language: 'python',
      caption: 'A monitoring surface layered by what moves first',
      code: `# ── LAYER 2: BEHAVIOUR — cheap, all traffic, moves first ───
def record_behaviour(request, result):
    metrics.increment("ai.requests", tags={"category": result["category"]})
    metrics.histogram("ai.output_tokens", result["tokens_out"])
    metrics.increment("ai.gate", tags={"decision": result.get("gated", "pass")})
    if result.get("refused"):
        metrics.increment("ai.refusal", tags={"kind": result["refusal_kind"]})
    if result.get("tool_calls"):
        metrics.histogram("ai.tool_calls", len(result["tool_calls"]))

# ── LAYER 3: QUALITY — sampled, delayed ───────────────────
def record_quality(sampled_result):
    metrics.histogram("ai.groundedness", sampled_result["groundedness"])
    metrics.histogram("ai.relevance", sampled_result["relevance"])

# ── LAYER 4: BUSINESS — the number leadership reads ───────
def record_outcome(request, outcome):
    metrics.increment("ai.outcome", tags={"outcome": outcome})
    if outcome == "resolved":
        metrics.histogram("ai.cost_per_resolution", request.total_cost)

# ── ALERTS: composite, so they fire on real problems ──────
ALERTS = [
    # fires fast, on cheap signals
    {"name": "gate_trip_spike",
     "expr": "rate(ai_gate{decision='blocked'}[15m]) > 3 * baseline",
     "severity": "page"},

    # the composite — quality AND user behaviour together
    {"name": "quality_degradation",
     "expr": "histogram_quantile(0.5, ai_groundedness[1h]) < 0.85 "
             "AND rate(ai_outcome{outcome='escalated'}[1h]) > 1.5 * baseline",
     "severity": "page"},

    # cost, on rate not monthly total
    {"name": "cost_runaway",
     "expr": "sum(rate(ai_cost_usd[10m])) * 4320 > monthly_budget * 1.3",
     "severity": "page"},

    # gradual drift — a ticket, not a page
    {"name": "gradual_quality_drift",
     "expr": "avg_over_time(ai_groundedness[7d]) < "
             "avg_over_time(ai_groundedness[7d] offset 7d) - 0.03",
     "severity": "ticket"},
]`
    },
    prereq: ['mlops-lifecycle'], next: ['drift-detection', 'retraining'],
    related: ['failure-rates', 'hallucination-monitoring', 'token-usage-cost', 'latency-monitoring'],
    tools: ['opentelemetry', 'phoenix', 'langsmith'],
    useCases: [
      'Detecting an AI quality problem before customers report it.',
      'Alerting on the cheap signals that move first.',
      'Running a weekly review that catches gradual degradation.'
    ],
    avoid: [
      'Standard application monitoring alone, which sees only hard failures.',
      'Alerting on single quality metrics, which produces noise.'
    ],
    mistakes: [
      'Monitoring uptime and errors only, reporting health while every answer is wrong.',
      'Alerting only on sampled quality, which lags the cheap behavioural signals.',
      'No weekly trend review, so gradual degradation never crosses a threshold.',
      'Single-metric alerts that fire on normal variation and get muted.',
      'No business-layer metric, so nobody outside the team knows whether it is working.'
    ],
    keyTerms: [
      ['monitoring layers', 'Infrastructure, behaviour, quality, business.'],
      ['leading signal', 'A cheap metric that moves before quality does.'],
      ['composite alert', 'Two conditions together, reducing false alarms.'],
      ['gate trip rate', 'How often a quality gate fires. An early warning.'],
      ['weekly review', 'A trend check that catches gradual drift.'],
      ['cost per successful outcome', 'The business-layer metric.']
    ],
    resources: [
      ['Google SRE Book — monitoring distributed systems', 'https://sre.google/sre-book/monitoring-distributed-systems/', 'reference'],
      ['Google SRE Book — alerting on SLOs', 'https://sre.google/workbook/alerting-on-slos/', 'reference'],
      ['Arize Phoenix — production monitoring', 'https://arize.com/docs/phoenix/', 'docs'],
      ['OpenTelemetry — metrics', 'https://opentelemetry.io/docs/concepts/signals/metrics/', 'docs']
    ],
    questions: [
      ['Why is standard application monitoring insufficient for AI?', 'The failures that matter return HTTP 200. Uptime and error rate report the system as healthy while every answer is wrong.'],
      ['Which signals should you alert on first?', 'Gate trip rate and escalation rate. They are cheap, computed on all traffic, and typically move hours before sampled quality metrics do.'],
      ['Why build a weekly review as well as alerts?', 'Many AI degradations are gradual and never cross an alert threshold on any single day. A trend chart someone looks at regularly catches what alerting misses.']
    ]
  },

  {
    id: 'retraining',
    title: 'Retraining & Refresh',
    domain: 'mlops', tier: 2, priority: 'medium',
    summary: 'Deciding when to update the system, and what "update" actually means.',
    what: `Retraining is refreshing the system when it has degraded or the world has changed. For a trained model that means new training data; for an LLM application it usually means re-indexing, re-prompting, or moving to a new model version.`,
    why: `Systems degrade. Deciding *when* to refresh — and on what trigger — is the difference between a controlled process and a scramble after a complaint. And "retrain" is usually the wrong answer for an LLM application; re-indexing is cheaper and faster.`,
    analogy: `Servicing a vehicle. Some things are scheduled, some are triggered by a warning light, and some by a change in how the vehicle is used. Waiting for a breakdown is a choice.`,
    technical: `Triggers, in order of preference:
- **Data change** — a document was updated, so re-index. Immediate and cheap. This should be automatic.
- **Performance threshold** — a monitored metric drops below a bound. Investigate, then act.
- **Scheduled** — a periodic refresh regardless. Catches gradual drift that no trigger caught.
- **Distribution shift** — inputs have moved, so the golden set and possibly the configuration need updating.
- **Provider change** — a new model version requires re-evaluation and possibly prompt adjustment.

For LLM applications, ordered by cost:
1. **Re-index** — minutes. Fixes stale content. Do this automatically on document change.
2. **Re-prompt** — hours. Fixes behaviour.
3. **Change retrieval config** — hours. Fixes ranking.
4. **Change model version** — days, including re-evaluation.
5. **Re-fine-tune** — weeks. Rarely the answer.

Whatever the trigger, the sequence is the same: evaluate the candidate against the golden set, deploy gradually, monitor, and be able to roll back.`,
    diagram: `
   TRIGGERS, IN ORDER OF PREFERENCE

     DATA CHANGE          a document was updated
                          → RE-INDEX. Automatic. Minutes.

     PERFORMANCE          a metric crossed a threshold
                          → investigate, then act

     SCHEDULED            periodic refresh regardless
                          → catches drift no trigger caught

     DISTRIBUTION SHIFT   inputs moved
                          → update the golden set too

     PROVIDER CHANGE      new model version
                          → re-evaluate before adopting

   FOR LLM APPS, ORDERED BY COST

     1  RE-INDEX              minutes    stale content
     2  RE-PROMPT             hours      behaviour
     3  RETRIEVAL CONFIG      hours      ranking
     4  CHANGE MODEL VERSION  days       capability
     5  RE-FINE-TUNE          weeks      rarely the answer

     Start at 1. Most "the AI got worse" reports are a
     stale index, and re-indexing is the cheapest fix
     available.

   ⚠ WHATEVER THE TRIGGER, THE SEQUENCE IS THE SAME

     evaluate against the golden set
        ↓
     deploy gradually
        ↓
     monitor
        ↓
     be able to roll back

   ⚠ UPDATE THE GOLDEN SET TOO

     if the input distribution shifted, the golden set no longer
     represents real traffic, and passing it means less than it did.`,
    example: {
      language: 'python',
      caption: 'Triggered refresh, cheapest option first',
      code: `REFRESH_TRIGGERS = {
    "document_changed":   {"action": "reindex",  "automatic": True},
    "groundedness_below": {"threshold": 0.85,    "action": "investigate"},
    "escalation_above":   {"threshold": 1.5,     "action": "investigate"},
    "scheduled":          {"cadence": "monthly", "action": "full_evaluate"},
    "provider_update":    {"action": "reevaluate_before_adopting"},
}

def on_document_changed(paths):
    """Cheapest refresh. Automatic. No approval needed."""
    changed = sync_documents(paths)          # incremental, hash-based
    if changed:
        new_index = bump_index_version()
        scores = run_golden_set(index=new_index)
        if scores["groundedness"] >= BASELINE["groundedness"] - 0.01:
            activate_index(new_index)
            log.info("re-indexed %d chunks, index %s", changed, new_index)
        else:
            log.error("re-index REGRESSED quality; not activating")
            alert_oncall("index refresh blocked by evaluation")


def investigate_degradation(metric, value):
    """Work through the cheap options before the expensive ones."""
    findings = []

    # 1. Is the index stale? Cheapest possible fix.
    if index_age_days() > 7 or documents_changed_since_index():
        findings.append("index is stale — re-index first")
        return {"action": "reindex", "findings": findings}

    # 2. Did the provider change the model?
    if model_version_changed_since_last_eval():
        findings.append("model version changed — re-evaluate")
        return {"action": "reevaluate", "findings": findings}

    # 3. Did the input distribution shift?
    drift = category_drift(BASELINE_CATEGORIES, recent_categories())
    if drift["tvd"] > 0.2:
        findings.append(f"input distribution shifted: {drift['biggest_shifts']}")
        return {"action": "update_golden_set", "findings": findings}

    # 4. Only now consider prompt or retrieval changes
    return {"action": "review_prompt_and_retrieval", "findings": findings}

# The order matters. Teams routinely start at step 4 and spend
# a week on prompt engineering to fix a stale index.`
    },
    prereq: ['production-monitoring'], next: ['rollback'],
    related: ['drift-detection', 'indexing-embedding', 'model-versioning', 'when-not-to-finetune'],
    tools: ['git', 'qdrant'],
    useCases: [
      'Deciding when and how to refresh a degraded system.',
      'Automating re-indexing on document change.',
      'Working through refresh options cheapest-first.'
    ],
    avoid: [
      'Re-fine-tuning as a first response to degradation.',
      'Refreshing without evaluating the candidate first.'
    ],
    mistakes: [
      'Starting with prompt engineering when the index is stale.',
      'Re-indexing without evaluating, so a bad ingestion run goes live.',
      'Not updating the golden set when the input distribution shifted.',
      'Adopting a new provider model version without re-evaluation.',
      'No scheduled refresh, so gradual drift is never caught.'
    ],
    keyTerms: [
      ['retraining', 'Refreshing a trained model with new data.'],
      ['re-indexing', 'Rebuilding the retrieval index. The cheapest refresh.'],
      ['refresh trigger', 'The condition that starts an update.'],
      ['scheduled refresh', 'Periodic update regardless of triggers.'],
      ['distribution shift', 'Inputs moving away from what the golden set represents.'],
      ['cheapest-first', 'Working through refresh options in cost order.']
    ],
    resources: [
      ['Google — MLOps continuous delivery', 'https://cloud.google.com/architecture/mlops-continuous-delivery-and-automation-pipelines-in-machine-learning', 'reference'],
      ['Google — Rules of Machine Learning', 'https://developers.google.com/machine-learning/guides/rules-of-ml', 'reference'],
      ['Evidently AI — retraining triggers', 'https://docs.evidentlyai.com/', 'docs']
    ],
    questions: [
      ['What is the cheapest refresh for an LLM application, and why start there?', 'Re-indexing — minutes, and it fixes stale content. Most "the AI got worse" reports turn out to be a stale index, and teams routinely spend a week on prompt engineering instead.'],
      ['Why must re-indexing be evaluated before activation?', 'A bad ingestion run — a parser failure, a truncated corpus — would otherwise go straight to production. Running the golden set against the new index catches it first.'],
      ['When does the golden set itself need updating?', 'When the input distribution shifts. If users are asking about things the golden set barely covers, passing it means less than it did.']
    ]
  },

  {
    id: 'rollback',
    title: 'Rollback',
    domain: 'mlops', tier: 2, priority: 'high',
    summary: 'Getting back to a known-good state quickly — the capability that bounds every incident.',
    what: `Rollback is reverting to a previous configuration when a change causes a problem. For an AI system that usually means a previous prompt version, index version, or model version.`,
    why: `Rollback time is the upper bound on how long an incident lasts. Everything else in operations reduces the probability of an incident; rollback reduces its duration, which is often the more controllable number.`,
    analogy: `An undo button. Its value is not that you expect to need it, but that its existence changes how confidently you can act.`,
    technical: `Requirements for rollback to be usable under pressure:

**Fast** — seconds to minutes. A rollback requiring a deployment cycle is not a rollback during an incident.
**Tested** — practise it. An untested rollback path fails exactly when it is needed.
**Independent** — reverting the prompt should not require reverting code.
**Complete** — the previous index version must still exist. A rollback that cannot restore the index is partial.
**Recorded** — what was rolled back, when, by whom, and why.

Design implications: hot-loadable prompts, retained previous index versions, pinned model versions with the previous one still available, and configuration separate from code.

**Roll back first, investigate second.** The instinct to diagnose before reverting extends every incident. Restore service, then find the cause with the traces you already have.

Note that some things cannot be rolled back: actions an agent already took, emails sent, refunds issued. That asymmetry is why irreversible actions need approval rather than rollback.`,
    diagram: `
   ROLLBACK TIME BOUNDS INCIDENT DURATION

     everything else reduces PROBABILITY
     rollback reduces DURATION
                              ↑ often the more controllable number

   REQUIREMENTS

     FAST         seconds to minutes
                  a rollback needing a deploy is not a rollback

     TESTED       practise it — untested paths fail when needed

     INDEPENDENT  revert the prompt without reverting code

     COMPLETE     the previous INDEX must still exist
                  (a partial rollback is a different system)

     RECORDED     what, when, by whom, why

   ⚠ ROLL BACK FIRST, INVESTIGATE SECOND

     the instinct to diagnose before reverting extends every
     incident. Restore service, then investigate with the
     traces you already have.

   ⚠ WHAT CANNOT BE ROLLED BACK

     actions an agent already took
     emails sent · refunds issued · records deleted

     That asymmetry is exactly why irreversible actions need
     APPROVAL rather than rollback.

   WHAT TO KEEP AVAILABLE

     previous prompt versions   registry, hot-loadable
     previous index versions    retained, not deleted on rebuild
     previous model version     still callable
     previous config            versioned separately from code`,
    example: {
      language: 'python',
      caption: 'A rollback path fast enough to use during an incident',
      code: `def rollback(component, reason, actor):
    """Seconds, not a deployment cycle."""
    started = time.monotonic()

    if component == "prompt":
        current = prompt_registry.active("answer")
        previous = prompt_registry.previous("answer")
        if not previous:
            raise RuntimeError("no previous prompt version retained")
        prompt_registry.activate(previous["version"])     # hot-loaded
        restored = f"prompt {current['version']} -> {previous['version']}"

    elif component == "index":
        previous = index_registry.previous()
        if not previous:
            raise RuntimeError("previous index was deleted — cannot roll back")
        index_registry.activate(previous["version"])
        restored = f"index -> {previous['version']}"

    elif component == "model":
        config.set("model_version", config.get("previous_model_version"))
        restored = f"model -> {config.get('model_version')}"

    elapsed = time.monotonic() - started
    audit.log("rollback", component=component, restored=restored,
              reason=reason, actor=actor, elapsed_s=round(elapsed, 2))
    alert_channel(f"ROLLED BACK {restored} ({elapsed:.1f}s) — {reason}")
    return {"restored": restored, "elapsed_s": elapsed}


# ── RETENTION: rollback is impossible without it ───────────
INDEX_VERSIONS_RETAINED = 3      # never delete the current-1
PROMPT_VERSIONS_RETAINED = 10    # cheap; keep plenty

# ── PRACTISE IT ────────────────────────────────────────────
def rollback_drill():
    """Run monthly in staging. An untested rollback path
    fails exactly when it is needed."""
    for component in ("prompt", "index", "model"):
        result = rollback(component, reason="drill", actor="automated")
        assert result["elapsed_s"] < 30, f"{component} rollback too slow"
        rollback(component, reason="drill_restore", actor="automated")

# ── THE INCIDENT SEQUENCE ──────────────────────────────────
# 1. roll back            ← restore service
# 2. confirm recovery
# 3. investigate          ← using traces you already have
# 4. fix forward
# NOT: investigate, then roll back if you cannot fix it quickly.`
    },
    prereq: ['model-versioning', 'model-deployment'], next: ['audit-trails'],
    related: ['prompt-versioning', 'model-registry', 'agent-failure-modes', 'transactions'],
    tools: ['git'],
    useCases: [
      'Bounding the duration of a quality incident.',
      'Making prompt iteration safe enough to move quickly.',
      'Recovering from a bad index rebuild.'
    ],
    avoid: [
      'Relying on rollback for irreversible actions — those need approval instead.',
      'Deleting the previous index version on rebuild.'
    ],
    mistakes: [
      'Rollback requiring a deployment cycle, which makes it unusable during an incident.',
      'Deleting previous index versions, making index rollback impossible.',
      'Never practising rollback, so the path fails when it is first needed.',
      'Investigating before rolling back, extending every incident.',
      'Assuming rollback undoes actions an agent already took. It does not.'
    ],
    keyTerms: [
      ['rollback', 'Reverting to a previous known-good configuration.'],
      ['mean time to recovery', 'How long an incident lasts. Rollback bounds it.'],
      ['hot-loading', 'Activating a previous version without deploying.'],
      ['retention', 'Keeping previous versions available to roll back to.'],
      ['rollback drill', 'Practising the path before it is needed.'],
      ['irreversible action', 'Something rollback cannot undo. Needs approval.']
    ],
    resources: [
      ['Google SRE Book — emergency response', 'https://sre.google/sre-book/emergency-response/', 'reference'],
      ['Google SRE Book — release engineering', 'https://sre.google/sre-book/release-engineering/', 'reference'],
      ['Martin Fowler — blue-green deployment', 'https://martinfowler.com/bliki/BlueGreenDeployment.html', 'reference']
    ],
    questions: [
      ['Why does rollback matter more than most reliability work?', 'Everything else reduces the probability of an incident; rollback reduces its duration, which is usually the more controllable number and directly bounds customer impact.'],
      ['What makes a rollback path unusable in practice?', 'Requiring a deployment cycle, a deleted previous index version, or never having been tested. All three fail precisely when the path is needed.'],
      ['What can rollback not undo?', 'Actions an agent already took — emails sent, refunds issued, records deleted. That asymmetry is why irreversible actions need approval rather than a rollback plan.']
    ]
  },

  {
    id: 'audit-trails',
    title: 'Audit Trails in Operations',
    domain: 'mlops', tier: 3, priority: 'low',
    summary: 'The operational record of what changed, when, by whom, and why.',
    what: `An operational audit trail records every change to a production AI system: deployments, rollbacks, configuration edits, index rebuilds, model version changes, and approvals.

Distinct from decision auditing, which records what the system did for a given user.`,
    why: `Most incident investigations start with "what changed?". Without a change log, that question takes hours of interviewing. With one, it takes a minute. It is also what a compliance review asks for, and it is the cheapest observability artifact to produce.`,
    analogy: `A maintenance log on a machine. The value is not the individual entries; it is being able to correlate a fault with the last thing anyone touched.`,
    technical: `Record for every change: what component, from which version to which, who made it, when, why, whether it was approved and by whom, and the evaluation evidence if any.

The most valuable property is **correlation with incidents**. A quality alert at 09:14 next to a change log showing an index rebuild at 09:02 usually is the entire investigation.

Automate it. Deployments and rollbacks should write their own entries; anything relying on a human remembering to log will be incomplete precisely when it matters.

Keep it **queryable by time**, so an incident window can be scanned directly, and keep it **separate from application logs**, which rotate quickly.

The overlap with decision auditing (see auditability) is partial: that one records what the system did *for a user*; this one records what humans did *to the system*.`,
    diagram: `
   TWO KINDS OF AUDIT

     DECISION AUDIT      what the system did FOR A USER
                         inputs · retrieval · output · approver

     OPERATIONAL AUDIT   what humans did TO THE SYSTEM
                         deploys · rollbacks · config · index
                         rebuilds · version changes

     Both are needed. They answer different questions.

   THE CORRELATION THAT SOLVES INCIDENTS

     09:02  index rebuild        v2026-03-04 → v2026-03-11
     09:14  ALERT: groundedness dropped 0.93 → 0.71

     Twelve minutes apart. That is the investigation.

     Without a change log this is: interview four people,
     check three repos, guess.

   WHAT EACH ENTRY RECORDS

     component     prompt · index · model · retrieval config
     from → to     versions
     actor         who
     timestamp     when
     reason        why
     approval      who signed off, if required
     evidence      evaluation scores, if any

   ⚠ AUTOMATE IT

     deployments and rollbacks write their OWN entries.
     Anything depending on a human remembering will be
     incomplete exactly when it matters.`,
    example: {
      language: 'python',
      caption: 'An automatic change log, queryable by incident window',
      code: `def record_change(component, from_version, to_version, *,
                  actor, reason, approval=None, evidence=None):
    entry = {
        "id": new_uuid(),
        "ts": now_iso(),
        "component": component,        # prompt · index · model · retrieval
        "from_version": from_version,
        "to_version": to_version,
        "actor": actor,
        "reason": reason,
        "approved_by": approval,
        "evidence": evidence,          # evaluation scores that justified it
        "environment": ENVIRONMENT,
    }
    change_log.append(entry)           # separate store, long retention
    return entry["id"]


# ── AUTOMATED: deployments write their own entries ─────────
def activate_prompt(name, version, actor, reason, evaluation):
    previous = prompt_registry.active(name)
    prompt_registry.activate(version)
    record_change("prompt", previous["version"] if previous else None,
                  version, actor=actor, reason=reason, evidence=evaluation)


def activate_index(version, actor, reason, evaluation):
    previous = index_registry.active()
    index_registry.activate(version)
    record_change("index", previous, version,
                  actor=actor, reason=reason, evidence=evaluation)


# ── THE QUERY THAT SOLVES INCIDENTS ────────────────────────
def changes_near(incident_time, window_minutes=120):
    """First question in every investigation: what changed?"""
    start = incident_time - timedelta(minutes=window_minutes)
    return change_log.query(ts__gte=start, ts__lte=incident_time,
                            order_by="ts")

for c in changes_near(alert_time):
    print(f"{c['ts']}  {c['component']:<10} "
          f"{c['from_version']} -> {c['to_version']}  by {c['actor']}")

# 2026-03-11T09:02:14Z  index      2026-03-04 -> 2026-03-11  by ingest-job
# 2026-03-11T08:47:03Z  prompt     answer_v3 -> answer_v4    by a.sharma
#
# Two candidates, ordered, in one query.`
    },
    prereq: ['rollback'], next: [],
    related: ['auditability', 'model-versioning', 'model-governance', 'git-basics'],
    tools: ['git', 'opentelemetry'],
    useCases: [
      'Answering "what changed?" at the start of an incident.',
      'Correlating an alert with a recent deployment.',
      'Providing a change history for a compliance review.'
    ],
    avoid: [
      'Manual change logs, which are incomplete exactly when needed.',
      'Storing change history only in application logs, which rotate quickly.'
    ],
    mistakes: [
      'Relying on people to remember to log a change.',
      'No index-rebuild entries, missing the most common cause of retrieval regressions.',
      'Change history mixed into application logs with short retention.',
      'No evaluation evidence attached, so a change cannot be justified afterwards.',
      'Not queryable by time window, so correlation with an incident is manual.'
    ],
    keyTerms: [
      ['operational audit trail', 'The record of changes made to the system.'],
      ['change log', 'The queryable history of deployments and configuration changes.'],
      ['correlation window', 'The time range scanned around an incident.'],
      ['automatic logging', 'Changes recording themselves rather than relying on people.'],
      ['evidence', 'The evaluation results that justified a change.']
    ],
    resources: [
      ['Google SRE Book — postmortem culture', 'https://sre.google/sre-book/postmortem-culture/', 'reference'],
      ['NIST — AI Risk Management Framework', 'https://www.nist.gov/itl/ai-risk-management-framework', 'reference'],
      ['OpenTelemetry — logs', 'https://opentelemetry.io/docs/concepts/signals/logs/', 'docs']
    ],
    questions: [
      ['What is the first question in most incident investigations?', '"What changed?" A change log answers it in one query; without one it takes hours of interviewing and guessing.'],
      ['Why must change logging be automatic?', 'Anything relying on a person remembering to log will be incomplete precisely during a busy incident — which is exactly when the record is needed.'],
      ['How does an operational audit trail differ from decision auditing?', 'This one records what humans did to the system; decision auditing records what the system did for a user. Both are needed, and they answer different questions.']
    ]
  }
];
