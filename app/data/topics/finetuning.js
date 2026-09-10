/**
 * DOMAIN M — FINE-TUNING + TRAINING (BUILD.md section 16)
 * The central message: RAG changes access, fine-tuning changes behaviour.
 */
export const topics = [
  {
    id: 'continued-pretraining',
    title: 'Continued Pretraining',
    domain: 'finetuning', tier: 3, priority: 'low',
    summary: 'Carrying on the pretraining objective on a domain corpus, to teach a language rather than a task.',
    what: `Continued pretraining takes an already-pretrained model and runs more next-token training on a large domain-specific corpus — medical literature, legal text, code in a proprietary language.

It teaches the model the *shape* of a domain, not specific facts and not a task.`,
    why: `It is the right tool in a narrow case: when your domain has vocabulary, notation or structure the base model handles badly. Legal citations, chemical formulae, an internal DSL. It is the wrong tool for almost everything else, and it is expensive.`,
    analogy: `Sending someone to live in a country to absorb the language, versus teaching them a specific job. Immersion changes how they hear and speak. It does not tell them your company's holiday policy.`,
    technical: `Same objective as pretraining — predict the next token — but starting from existing weights and running on billions of domain tokens rather than trillions of general ones.

Requirements: a genuinely large domain corpus (billions of tokens is typical; a few thousand documents is not enough), serious compute, and ML expertise.

The main risk is **catastrophic forgetting**: general capability degrades as the model specialises. Mitigated by mixing general data into the domain corpus, usually a substantial fraction.

Almost always the wrong choice for a product team. If the requirement is knowledge, use RAG. If it is task behaviour, use supervised fine-tuning on far less data. Continued pretraining earns its place only when the model genuinely mis-tokenises or misunderstands the domain's basic notation.`,
    diagram: `
   THE THREE TRAINING PHASES, BY DATA VOLUME

     PRETRAINING            trillions of tokens · months · $10M+
            │                general language
            ▼
     CONTINUED PRETRAINING  billions of tokens · weeks · $10k-$500k
            │                domain language
            ▼
     SUPERVISED FINE-TUNING thousands of examples · hours · $50-$5k
            │                task behaviour
            ▼
     PREFERENCE TUNING      thousands of comparisons
                             which good answer is preferred

   WHAT EACH ACTUALLY TEACHES

     continued pretraining   how this domain WRITES
                             notation, vocabulary, structure
     fine-tuning             how to DO a task
     RAG                     what is TRUE right now

   ⚠ CATASTROPHIC FORGETTING

     train only on legal text
        → excellent at legal language
        → noticeably worse at everything else

     Mitigation: mix general data back in, often 20-50% of the corpus.

   WHEN IT IS ACTUALLY JUSTIFIED

     ✓ the tokenizer fragments your domain's notation badly
     ✓ the base model demonstrably misreads domain structure
     ✓ you have billions of domain tokens and ML capacity

     ✗ "so it knows our products"          → RAG
     ✗ "so it writes in our tone"          → prompting or SFT
     ✗ "we have 5,000 support tickets"     → far too little data`,
    example: {
      language: 'text',
      caption: 'Diagnosing whether continued pretraining is the answer',
      code: `SYMPTOM: "The model is bad at our domain."

── TEST 1: is it a TOKENIZATION problem? ──────────────────
  Tokenize a representative domain string and look at the split.

    legal citation "42 U.S.C. § 1983"
      → ['42', ' U', '.', 'S', '.', 'C', '.', ' §', ' 198', '3']
      10 tokens of fragments. The model never sees it as one thing.

  If domain notation consistently shatters like this, continued
  pretraining (or a domain tokenizer) may genuinely help.

── TEST 2: is it a KNOWLEDGE problem? ─────────────────────
  Put the relevant document in the context and ask again.

    without context: wrong
    with context:    correct
      → it is a KNOWLEDGE problem. Use RAG. Stop here.

── TEST 3: is it a BEHAVIOUR problem? ─────────────────────
  Give three examples of the desired output in the prompt.

    zero-shot: wrong format
    few-shot:  correct format
      → it is a BEHAVIOUR problem. Use prompting, then SFT if
        you need it at scale. Stop here.

── ONLY IF 1 IS YES AND 2 AND 3 ARE NO ────────────────────
  Then continued pretraining is on the table, and you need:
    · billions of domain tokens (not thousands of documents)
    · an ML team
    · a plan for catastrophic forgetting
    · a budget in the tens to hundreds of thousands

  In most product contexts, at least one of tests 2 or 3
  comes back YES, and the answer is much cheaper.`
    },
    prereq: ['pretraining'], next: ['supervised-fine-tuning'],
    related: ['rag-vs-finetuning', 'when-not-to-finetune', 'tokens-tokenization'],
    tools: ['huggingface', 'pytorch'],
    useCases: [
      'Domains whose notation the base tokenizer handles badly.',
      'Highly specialised technical languages with large corpora available.',
      'Adapting an open model to a language it under-represents.'
    ],
    avoid: [
      'Teaching facts — that is RAG.',
      'Teaching a task — that is supervised fine-tuning, on far less data.',
      'Any corpus smaller than billions of tokens.',
      'Teams without ML infrastructure and expertise.'
    ],
    mistakes: [
      'Attempting it with a few thousand documents, which teaches nothing and risks forgetting.',
      'Not mixing general data back in, so general capability degrades badly.',
      'Choosing it before testing whether context or few-shot examples solve the problem.',
      'Underestimating the evaluation burden — you must prove general capability survived.'
    ],
    keyTerms: [
      ['continued pretraining', 'More next-token training on a domain corpus.'],
      ['domain adaptation', 'Making a general model fluent in a specialised area.'],
      ['catastrophic forgetting', 'Losing general capability while specialising.'],
      ['data mixing', 'Including general data to preserve broad capability.'],
      ['domain corpus', 'A large body of specialised text.'],
      ['tokenizer mismatch', 'Domain notation fragmenting into many tokens.']
    ],
    resources: [
      ['Don\'t Stop Pretraining (paper)', 'https://arxiv.org/abs/2004.10964', 'paper'],
      ['Hugging Face — causal language modeling', 'https://huggingface.co/docs/transformers/tasks/language_modeling', 'docs'],
      ['Continual pre-training of LLMs (paper)', 'https://arxiv.org/abs/2308.04014', 'paper']
    ],
    questions: [
      ['What does continued pretraining teach that fine-tuning does not?', 'The language of a domain — its vocabulary, notation and structure — rather than how to perform a task. It changes how the model reads the domain, not what it does.'],
      ['What is the main risk?', 'Catastrophic forgetting. Training heavily on one domain degrades general capability, which is why general data is usually mixed back into the corpus.'],
      ['What are the three tests before considering it?', 'Does domain notation tokenize badly, does putting the document in context fix the answer, and do few-shot examples fix the format? If either of the last two is yes, use RAG or prompting instead.']
    ]
  },

  {
    id: 'supervised-fine-tuning',
    title: 'Supervised Fine-tuning',
    domain: 'finetuning', tier: 2, priority: 'high',
    summary: 'Training on input-output examples so the model reliably performs a specific task.',
    what: `Supervised fine-tuning trains a model on pairs of (input, desired output). It teaches behaviour: a consistent format, a domain classification scheme, a particular style of response.

Hundreds to thousands of examples, not millions.`,
    why: `It earns its place when the desired behaviour has **implicit criteria nobody can fully write down**. You can describe a format in a prompt. You cannot describe how a senior agent decides between forty overlapping categories — but you can show a thousand examples of them doing it.

It also enables a smaller, cheaper model to match a larger one on one narrow task.`,
    analogy: `Training a new hire by showing them a thousand completed examples rather than writing a procedure manual. Faster for judgement calls, and it captures things the manual would miss.`,
    technical: `Data is the work. Quality matters far more than quantity — 500 carefully-checked examples beat 5,000 noisy ones, because the model faithfully learns the noise.

Requirements: representative examples including edge cases, consistent formatting, balanced classes, and a **held-out evaluation set created before training**.

Practical approach: **LoRA** rather than full fine-tuning (see the LoRA topic) — dramatically cheaper, and the adapter can be swapped or removed.

Watch for overfitting: training too many epochs on a small set makes the model memorise the examples and lose general ability. Two to four epochs is typical; monitor validation loss.

Fine-tuning does **not** add reliable factual knowledge. It changes behaviour. If you fine-tune on facts, the model learns to produce confident statements in that shape, which is worse than not knowing.`,
    diagram: `
   WHAT SFT TEACHES

     ✓ output FORMAT           always this JSON shape
     ✓ classification SCHEME   these 40 categories, our way
     ✓ TONE and register       how we speak to customers
     ✓ implicit JUDGEMENT      what a senior agent would decide

     ✗ FACTS                   → RAG
     ✗ current information     → RAG or tools
     ✗ reasoning it cannot do  → neither

   DATA QUALITY BEATS QUANTITY

      500 carefully checked examples   →  reliable behaviour
    5,000 noisy examples               →  reliable reproduction
                                          of the noise

     The model learns exactly what you show it, including
     your inconsistencies.

   THE EPOCH TRAP

     epochs   training loss   validation loss   what happened
     ──────   ─────────────   ───────────────   ────────────
       1          0.84             0.81         underfit
       2          0.52             0.49         good
       3          0.31             0.47         good
       4          0.18             0.58         ← OVERFITTING
       8          0.03             0.94         memorised;
                                                general ability lost

     Stop when validation loss turns. Typically 2-4 epochs.

   ⚠ BUILD THE EVALUATION SET BEFORE YOU TRAIN.
     Otherwise you cannot tell improvement from memorisation.`,
    example: {
      language: 'python',
      caption: 'SFT data, and the checks that make it worth training on',
      code: `import json
from collections import Counter

# ── THE DATA FORMAT ────────────────────────────────────────
example = {
    "messages": [
        {"role": "system",
         "content": "Classify the support ticket into one of our categories."},
        {"role": "user",
         "content": "I was charged twice for my March invoice, order A-8821"},
        {"role": "assistant",
         "content": '{"category":"billing_duplicate_charge",'
                    '"priority":"high","needs_human":true}'},
    ]
}

# ── THE CHECKS THAT DECIDE WHETHER TRAINING IS WORTH IT ────
def audit(dataset):
    problems = []

    # 1. Class balance — the model reproduces your distribution
    labels = [json.loads(e["messages"][-1]["content"])["category"]
              for e in dataset]
    counts = Counter(labels)
    rarest, most = counts.most_common()[-1], counts.most_common()[0]
    if most[1] > rarest[1] * 20:
        problems.append(f"imbalance: {most[0]}={most[1]} vs {rarest[0]}={rarest[1]}")

    # 2. Format consistency — inconsistency teaches inconsistency
    keys = {tuple(sorted(json.loads(e["messages"][-1]["content"]).keys()))
            for e in dataset}
    if len(keys) > 1:
        problems.append(f"inconsistent output keys: {keys}")

    # 3. Duplicates — inflate apparent size, teach nothing
    inputs = [e["messages"][1]["content"] for e in dataset]
    dupes = len(inputs) - len(set(inputs))
    if dupes:
        problems.append(f"{dupes} duplicate inputs")

    # 4. Edge cases — does the data teach "unclear"?
    if "unclear" not in counts:
        problems.append("no examples teaching the model to say 'unclear'")

    return problems

# ── THE SPLIT, MADE BEFORE TRAINING ────────────────────────
train, val, test = split_stratified(dataset, 0.8, 0.1, 0.1, by=labels)
# test is used ONCE, at the end, and never for tuning.

print(audit(train))
# ['imbalance: billing_question=1840 vs refund_dispute=41',
#  "no examples teaching the model to say 'unclear'"]
#
# Fix the data before spending money on training. This is where
# the real work of fine-tuning happens.`
    },
    prereq: ['instruction-tuning', 'train-val-test'], next: ['preference-tuning', 'lora-peft'],
    related: ['rag-vs-finetuning', 'training-dataset-prep', 'labeling', 'overfitting-underfitting'],
    tools: ['huggingface', 'openai', 'transformers'],
    useCases: [
      'Consistent structured output at high volume.',
      'Domain classification with implicit criteria.',
      'Matching a specific house style reliably.',
      'Making a small model match a large one on one narrow task.'
    ],
    avoid: [
      'To teach facts — it produces confident, well-formatted invention.',
      'Before prompt engineering has been properly evaluated.',
      'When you cannot produce a few hundred consistent, checked examples.',
      'When the task changes frequently — every change means retraining.'
    ],
    mistakes: [
      'Fine-tuning on documentation expecting factual recall.',
      'Training on noisy or inconsistent data, which the model faithfully learns.',
      'Too many epochs on a small set, causing memorisation and lost general ability.',
      'No held-out evaluation set, so improvement cannot be distinguished from memorisation.',
      'Imbalanced classes, reproduced exactly in the model’s predictions.'
    ],
    keyTerms: [
      ['SFT', 'Supervised fine-tuning on input-output pairs.'],
      ['epoch', 'One pass over the training data.'],
      ['validation loss', 'Loss on held-out data; the overfitting signal.'],
      ['class balance', 'The distribution of labels, which the model reproduces.'],
      ['held-out set', 'Data never used for training or tuning.'],
      ['catastrophic forgetting', 'Loss of general capability during specialisation.'],
      ['adapter', 'A small trained module (LoRA) rather than a full model copy.']
    ],
    resources: [
      ['Hugging Face TRL — SFT trainer', 'https://huggingface.co/docs/trl/sft_trainer', 'docs'],
      ['OpenAI — fine-tuning guide', 'https://platform.openai.com/docs/guides/fine-tuning', 'docs'],
      ['Hugging Face — fine-tuning a pretrained model', 'https://huggingface.co/docs/transformers/training', 'docs'],
      ['Anthropic — choosing a model', 'https://docs.anthropic.com/en/docs/about-claude/models/choosing-a-model', 'docs']
    ],
    questions: [
      ['When does fine-tuning genuinely beat prompting?', 'When the behaviour has implicit criteria nobody can fully articulate — how a senior agent chooses between forty overlapping categories — or when you need a small cheap model to match a large one on one narrow task.'],
      ['Why does data quality matter more than quantity?', 'The model learns exactly what you show it, including inconsistencies. Five hundred carefully-checked examples produce reliable behaviour; five thousand noisy ones produce reliable reproduction of the noise.'],
      ['What is the signal that you have trained too long?', 'Validation loss rising while training loss keeps falling. The model is memorising the training examples and losing general capability. Typically 2–4 epochs is enough.']
    ],
    interview: {
      s30: 'Supervised fine-tuning trains a model on input-output pairs so it reliably performs a task. It teaches behaviour — format, classification, tone — not facts.',
      s90: 'The case where it genuinely wins is behaviour with implicit criteria. I can describe a JSON format in a prompt, but I cannot describe how a senior support agent chooses between forty overlapping categories — and I can show a thousand examples of them doing it. The second case is economic: a small fine-tuned model can match a large prompted model on one narrow task at a fraction of the per-call cost. But almost all the work is data, not training. Five hundred carefully-checked examples beat five thousand noisy ones, because the model faithfully learns your inconsistencies. And I insist on a held-out evaluation set created before training, because otherwise you cannot distinguish an improvement from memorisation — which shows up as training loss falling while validation loss rises.',
      pm: 'It is a weeks-long project whose cost is mostly labelling, so I want to be sure prompting and RAG have genuinely failed before committing to it.'
    }
  },

  {
    id: 'preference-tuning',
    title: 'Preference Tuning',
    domain: 'finetuning', tier: 3, priority: 'medium',
    summary: 'Teaching the model which of several acceptable answers is better.',
    what: `Preference tuning trains on comparisons rather than single correct answers: given two responses, a human indicated which is better. The model learns to produce more of the preferred kind.

DPO is the common modern method; RLHF is the earlier, more elaborate one.`,
    why: `Some qualities cannot be expressed as a single correct output. "More helpful", "less hedging", "appropriately concise" — you cannot write the target, but you can consistently pick the better of two. Preference data captures exactly that.`,
    analogy: `Editing by comparison. You cannot write down "good prose", but you can reliably say which of two drafts is better — and a writer who sees a thousand of those judgements internalises your taste.`,
    technical: `Data is triples: prompt, chosen response, rejected response. Typically thousands of comparisons.

**DPO** optimises the preference objective directly against the reference model. Simpler and more stable than RLHF, and now the usual choice.

Failure modes are all reward hacking: raters prefer longer answers (verbosity), agreeable answers (sycophancy), and hedged answers (over-caution). Whatever your raters systematically prefer, the model will learn — including the parts you did not intend.

Mitigations: length-controlled comparisons so verbosity cannot win by itself, rubrics that reward specificity, rating helpfulness and honesty separately, and measuring inter-rater agreement so you know the labels mean something.

For most product teams this is a later-stage concern. SFT plus good prompting covers most needs.`,
    diagram: `
   SFT vs PREFERENCE TUNING

     SFT           "here is the CORRECT answer"
                   one target per input

     PREFERENCE    "B is BETTER than A"
                   no single correct answer exists

   THE DATA

     { "prompt":   "Is our RAG setup ready to ship?",
       "chosen":   "No. Groundedness is 0.61 against the golden
                    set, below the 0.80 gate. Retrieval is the
                    problem — in 40% of failures the correct
                    chunk was never in the top-5.",
       "rejected": "That's a great question! There are many
                    factors to consider when evaluating a RAG
                    system. You'll want to think about..." }

   ⚠ WHAT RATERS SYSTEMATICALLY PREFER, THE MODEL LEARNS

     longer answers      → VERBOSITY
     agreeable answers   → SYCOPHANCY
     hedged answers      → OVER-CAUTION
     confident tone      → overconfidence

     None of these were intended. All of them are learned
     faithfully, because they are genuinely in the labels.

   MITIGATIONS

     length-controlled comparisons  verbosity cannot win alone
     explicit rubric                reward specificity, penalise padding
     separate dimensions            helpfulness AND honesty, scored apart
     inter-rater agreement          if raters disagree, the labels
                                    carry no signal to learn`,
    example: {
      language: 'python',
      caption: 'Preference data, and the checks that stop you training in a bias',
      code: `import statistics

pairs = load_preference_pairs()          # prompt / chosen / rejected

# ── CHECK 1: LENGTH BIAS ───────────────────────────────────
chosen_len   = [len(p["chosen"].split())   for p in pairs]
rejected_len = [len(p["rejected"].split()) for p in pairs]

print(f"chosen   median length {statistics.median(chosen_len):.0f} words")
print(f"rejected median length {statistics.median(rejected_len):.0f} words")

longer = sum(c > r for c, r in zip(chosen_len, rejected_len)) / len(pairs)
print(f"chosen is longer in {longer:.0%} of pairs")

# chosen   median length 184 words
# rejected median length  96 words
# chosen is longer in 78% of pairs
#
# ⚠ You are about to train the model that LONGER = BETTER.
#   That is not what the raters meant, but it is what the data says.

# ── FIX: length-controlled sampling ────────────────────────
balanced = [p for p in pairs
            if abs(len(p["chosen"].split()) - len(p["rejected"].split())) < 40]
print(f"{len(balanced)}/{len(pairs)} pairs kept after length control")

# ── CHECK 2: INTER-RATER AGREEMENT ─────────────────────────
# If two raters disagree on half the pairs, the labels are noise
# and there is nothing consistent for the model to learn.
agreement = cohens_kappa(rater_a_labels, rater_b_labels)
print(f"Cohen's kappa {agreement:.2f}")
# 0.31 -> weak. Fix the rubric before collecting more data.
# 0.68 -> substantial. Proceed.

# ── CHECK 3: DIMENSION SEPARATION ──────────────────────────
# Rate helpfulness and honesty SEPARATELY, or a confident wrong
# answer beats an honest "I don't know" every time.`
    },
    prereq: ['supervised-fine-tuning', 'rlhf-preference'], next: [],
    related: ['judge-bias', 'inter-rater-agreement', 'refusal-quality', 'reinforcement-learning'],
    tools: ['huggingface'],
    useCases: [
      'Qualities that cannot be written as a single target output.',
      'Reducing over-refusal or excessive hedging.',
      'Aligning tone to what your users actually prefer.'
    ],
    avoid: [
      'Before SFT — preference tuning refines, it does not teach a task.',
      'When you cannot get consistent comparisons from raters.',
      'For anything with a single correct answer, where SFT is simpler.'
    ],
    mistakes: [
      'Not controlling for length, so verbosity is learned as quality.',
      'Not measuring inter-rater agreement, so the labels are noise.',
      'Rating helpfulness and honesty together, so confident wrongness wins.',
      'Assuming the resulting model is "aligned" in general rather than aligned to a specific rater pool.'
    ],
    keyTerms: [
      ['preference pair', 'A prompt with a chosen and a rejected response.'],
      ['DPO', 'Direct Preference Optimisation. The common modern method.'],
      ['reward hacking', 'Learning a proxy for preference rather than preference.'],
      ['length bias', 'Raters preferring longer answers regardless of quality.'],
      ['inter-rater agreement', 'Whether raters apply the rubric consistently.'],
      ['length-controlled comparison', 'Pairs matched in length so verbosity cannot win.']
    ],
    resources: [
      ['Direct Preference Optimization (paper)', 'https://arxiv.org/abs/2305.18290', 'paper'],
      ['Hugging Face TRL — DPO trainer', 'https://huggingface.co/docs/trl/dpo_trainer', 'docs'],
      ['Anthropic — Constitutional AI (paper)', 'https://arxiv.org/abs/2212.08073', 'paper'],
      ['Hugging Face — illustrating RLHF', 'https://huggingface.co/blog/rlhf', 'tutorial']
    ],
    questions: [
      ['What can preference tuning capture that SFT cannot?', 'Qualities with no single correct output — "more helpful", "less hedging". You cannot write the target, but you can reliably pick the better of two responses.'],
      ['Why check length bias in preference data?', 'If the chosen response is longer in most pairs, you are training the model that longer means better. That is not what raters intended, but it is what the data says.'],
      ['Why measure inter-rater agreement before training?', 'If raters disagree substantially, the labels contain no consistent signal. Training on them teaches noise, and no amount of data fixes an ambiguous rubric.']
    ]
  },

  {
    id: 'lora-peft',
    title: 'LoRA & Parameter-Efficient Fine-tuning',
    domain: 'finetuning', tier: 3, priority: 'medium',
    summary: 'Training a small adapter instead of the whole model — orders of magnitude cheaper.',
    what: `LoRA (Low-Rank Adaptation) freezes the base model and trains small additional matrices alongside it. The adapter is typically 0.1–1% of the model's size.

You get a small file that modifies the model's behaviour, rather than a full new copy.`,
    why: `It changes the economics of fine-tuning completely. Full fine-tuning of a 7B model needs 60GB+ of GPU memory and produces a 14GB artefact. LoRA needs around 16GB and produces a file of tens of megabytes — which can be swapped, versioned and served alongside others.`,
    analogy: `Sticky notes in a reference book rather than reprinting it. The book is unchanged; the notes change how you read it. You can add a different set of notes for a different purpose, and remove them entirely.`,
    technical: `The insight: weight updates during fine-tuning have low intrinsic rank, so they can be approximated by the product of two much smaller matrices. Train those instead of the full weight matrix.

Key parameters: **rank r** (typically 8–64 — higher means more capacity and a larger adapter) and **alpha** (a scaling factor, often 2×r). Which layers to adapt matters too; attention projections are the usual choice.

**QLoRA** additionally quantizes the frozen base model to 4-bit, so a 70B model can be fine-tuned on a single high-memory GPU.

Operational advantages beyond cost: adapters can be **hot-swapped**, several can be served from one base model, and reverting is deleting a file rather than redeploying a model.

Quality is generally close to full fine-tuning for task adaptation. Full fine-tuning retains an edge for very large behavioural shifts, which is rarely what a product team needs.`,
    diagram: `
   FULL FINE-TUNING            LoRA

   update ALL weights          freeze the base model
   7B parameters               train two small matrices per layer
                                  W + (A × B)
                                       │   │
                                   r×d   d×r     r ≈ 8-64

   GPU memory   60 GB+         GPU memory   ~16 GB
   artefact     14 GB          artefact     ~30 MB
   time         days           time         hours
   cost         $1,000s        cost         $10s-$100s
   revert       redeploy       revert       delete a file

   ADAPTERS ARE COMPOSABLE AND SWAPPABLE

     base model (loaded once, 14 GB)
         ├── adapter: ticket-classifier   (30 MB)
         ├── adapter: summary-style       (28 MB)
         └── adapter: code-review-tone    (31 MB)

     Three fine-tuned behaviours, one model in memory.
     Full fine-tuning would need three 14 GB copies.

   QLoRA — quantize the frozen base to 4-bit as well

     70B full fine-tune    multiple A100s          impractical
     70B QLoRA             one 48 GB GPU           feasible

   ⚠ Quality is close to full fine-tuning for TASK adaptation.
     Full fine-tuning keeps an edge for very large behavioural
     shifts, which product teams rarely need.`,
    example: {
      language: 'python',
      caption: 'A LoRA fine-tune, and what the numbers look like',
      code: `from peft import LoraConfig, get_peft_model
from transformers import AutoModelForCausalLM

base = AutoModelForCausalLM.from_pretrained(
    "meta-llama/Llama-3.1-8B-Instruct",
    load_in_4bit=True,          # QLoRA: quantize the FROZEN base
    device_map="auto",
)

config = LoraConfig(
    r=16,                       # rank: capacity vs adapter size
    lora_alpha=32,              # scaling, commonly 2 × r
    target_modules=["q_proj", "k_proj", "v_proj", "o_proj"],  # attention
    lora_dropout=0.05,
    task_type="CAUSAL_LM",
)

model = get_peft_model(base, config)
model.print_trainable_parameters()
# trainable params: 13,631,488 || all params: 8,043,892,736 || trainable%: 0.1695
#
# 13.6 million trainable out of 8 billion. That 0.17% is why
# this fits on one GPU and finishes in hours.

trainer.train()
model.save_pretrained("./adapters/ticket-classifier")
# ~28 MB on disk, versus 16 GB for a full fine-tune.

# ── SERVING: one base model, several behaviours ────────────
from peft import PeftModel
base = AutoModelForCausalLM.from_pretrained(BASE)       # loaded ONCE

classifier = PeftModel.from_pretrained(base, "./adapters/ticket-classifier")
summariser = PeftModel.from_pretrained(base, "./adapters/summary-style")

# Reverting a bad fine-tune is deleting a directory, not a redeploy.

# ── RANK SELECTION, MEASURED ───────────────────────────────
#   r=4    12 MB   task accuracy 0.81
#   r=8    16 MB   task accuracy 0.88
#   r=16   28 MB   task accuracy 0.91   ← plateau starts here
#   r=64   96 MB   task accuracy 0.92
# Higher rank stops paying. Measure rather than maximising.`
    },
    prereq: ['supervised-fine-tuning', 'parameters-weights'], next: ['when-not-to-finetune'],
    related: ['quantization', 'model-size-parameters', 'training-dataset-prep'],
    tools: ['huggingface', 'transformers', 'pytorch'],
    useCases: [
      'Fine-tuning on modest hardware.',
      'Maintaining several task-specific behaviours over one base model.',
      'Experimenting cheaply, because a failed adapter costs a file.'
    ],
    avoid: [
      'When a prompt or RAG solves it — the cheapest fine-tune is still a project.',
      'When you need a very large behavioural shift, where full fine-tuning retains an edge.',
      'On hosted models that do not expose adapter loading.'
    ],
    mistakes: [
      'Maximising rank instead of measuring where quality plateaus.',
      'Adapting the wrong layers and getting weak results.',
      'Forgetting the adapter must be paired with the exact base model version.',
      'Assuming LoRA removes the need for good data — it does not; it only lowers the compute cost.'
    ],
    keyTerms: [
      ['LoRA', 'Low-Rank Adaptation — train small matrices beside frozen weights.'],
      ['PEFT', 'Parameter-Efficient Fine-Tuning, the family LoRA belongs to.'],
      ['rank (r)', 'Adapter capacity. Typically 8–64.'],
      ['alpha', 'Scaling factor applied to the adapter, often 2×r.'],
      ['QLoRA', 'LoRA with a 4-bit quantized frozen base model.'],
      ['adapter', 'The small trained artefact, tens of megabytes.'],
      ['hot-swapping', 'Changing behaviour by loading a different adapter.']
    ],
    resources: [
      ['LoRA (paper)', 'https://arxiv.org/abs/2106.09685', 'paper'],
      ['QLoRA (paper)', 'https://arxiv.org/abs/2305.14314', 'paper'],
      ['Hugging Face PEFT — documentation', 'https://huggingface.co/docs/peft/index', 'docs'],
      ['Hugging Face — LoRA conceptual guide', 'https://huggingface.co/docs/peft/conceptual_guides/lora', 'docs']
    ],
    questions: [
      ['What does LoRA actually train?', 'Two small matrices per adapted layer, alongside frozen base weights. Typically 0.1–1% of the model’s parameters, which is why it fits on one GPU and finishes in hours.'],
      ['What operational advantage do adapters give beyond cost?', 'Several behaviours can be served from one loaded base model, and reverting a bad fine-tune is deleting a file rather than redeploying a 14GB model.'],
      ['Does LoRA reduce the data requirement?', 'No. It reduces the compute cost. The data work — consistent, checked, balanced examples — is unchanged and remains the bulk of the effort.']
    ]
  },

  {
    id: 'training-dataset-prep',
    title: 'Training Dataset Preparation',
    domain: 'finetuning', tier: 2, priority: 'high',
    summary: 'Building the examples — which is where nearly all of the work and nearly all of the quality lives.',
    what: `Dataset preparation is collecting, cleaning, formatting, balancing and splitting the examples a fine-tune will learn from.

It is typically 80–90% of the effort in a fine-tuning project, and it determines the ceiling on the result.`,
    why: `The model learns exactly what you show it, including your inconsistencies, your class imbalance and your leaked information. No hyperparameter compensates for a bad dataset, and every hour spent on data quality returns more than an hour spent on training configuration.`,
    analogy: `Preparing ingredients. No technique rescues a dish made from poor ingredients, and most of a professional kitchen's time goes on preparation rather than cooking.`,
    technical: `The steps:

**Source** — real production data is best, because it contains the distribution you will actually see. Synthetic data can supplement, but a model trained purely on synthetic data learns the generating model's quirks.

**Clean** — remove duplicates, near-duplicates, and examples with inconsistent formatting.

**De-identify** — strip PII. Training data becomes part of the model, and it cannot be deleted afterwards on request.

**Balance** — the model reproduces your class distribution. Under-represented categories will be under-predicted.

**Cover edge cases** — include the ambiguous inputs and the correct "unclear" or refusal outputs. A dataset of only clean cases produces a model that never abstains.

**Split** — train/validation/test, stratified, split by entity where rows are grouped, and **created before training**.

**Version** — the dataset is an artefact. Version it alongside the model it produced, or you cannot reproduce or diagnose anything.`,
    diagram: `
   WHERE THE TIME ACTUALLY GOES

     sourcing and labelling   ████████████████████  50%
     cleaning and formatting  ████████████          30%
     balancing and splitting  ████                  10%
     training                 ██                     5%
     evaluation               ██                     5%

     Teams budget for the 5% and are surprised by the 90%.

   THE CHECKS, IN ORDER

     1  DEDUPLICATE      near-duplicates inflate apparent size
     2  DE-IDENTIFY      PII in training data cannot be deleted later
     3  BALANCE          the model reproduces your distribution
     4  CONSISTENCY      one output format, applied everywhere
     5  EDGE CASES       include "unclear" and refusal examples
     6  SPLIT            stratified · by entity · BEFORE training
     7  VERSION          the dataset is an artefact, like the model

   ⚠ PII IN TRAINING DATA IS PERMANENT

     A customer exercises their right to erasure.
     You delete their rows from the database.
     Their data is still in the model weights.

     De-identify BEFORE training. There is no undo.

   ⚠ A DATASET OF ONLY CLEAN CASES

     produces a model that has never seen an ambiguous input
     and therefore never abstains — it always picks a category,
     confidently, including when the right answer is "unclear".`,
    example: {
      language: 'python',
      caption: 'The preparation pipeline, with the checks that matter',
      code: `import re, json
from collections import Counter

PII = [
    (re.compile(r"[\\w.+-]+@[\\w-]+\\.[\\w.]+"), "<EMAIL>"),
    (re.compile(r"\\b\\d{4}[ -]?\\d{4}[ -]?\\d{4}[ -]?\\d{4}\\b"), "<CARD>"),
    (re.compile(r"\\+?\\d[\\d -]{8,}\\d"), "<PHONE>"),
]

def deidentify(text):
    for pattern, token in PII:
        text = pattern.sub(token, text)
    return text

def prepare(raw_examples):
    seen, cleaned = set(), []

    for ex in raw_examples:
        # 1. DE-IDENTIFY — before anything else. There is no undo.
        user = deidentify(ex["input"])
        out = ex["output"]

        # 2. DEDUPLICATE on normalised input
        key = " ".join(user.lower().split())
        if key in seen:
            continue
        seen.add(key)

        # 3. FORMAT CONSISTENCY — reject anything off-shape
        try:
            parsed = json.loads(out)
        except json.JSONDecodeError:
            continue
        if set(parsed) != REQUIRED_KEYS:
            continue

        cleaned.append({"messages": [
            {"role": "system", "content": SYSTEM},
            {"role": "user", "content": user},
            {"role": "assistant", "content": json.dumps(parsed, sort_keys=True)},
        ]})

    # 4. BALANCE — cap the dominant class rather than discarding rare ones
    labels = [json.loads(e["messages"][-1]["content"])["category"] for e in cleaned]
    counts = Counter(labels)
    cap = int(statistics.median(counts.values()) * 3)
    kept, per_class = [], Counter()
    for e, label in zip(cleaned, labels):
        if per_class[label] < cap:
            kept.append(e); per_class[label] += 1

    # 5. EDGE CASES — verify the data teaches abstention
    if per_class.get("unclear", 0) < 20:
        raise ValueError("Too few 'unclear' examples. The model will "
                         "never abstain. Label more ambiguous cases.")

    return kept

# 6. SPLIT before training, stratified, and never look at test again.
# 7. VERSION: save the dataset with a hash alongside the model it trained.`
    },
    prereq: ['supervised-fine-tuning', 'train-val-test'], next: ['labeling'],
    related: ['features-labels', 'privacy-pii', 'golden-sets', 'data-leakage'],
    tools: ['huggingface', 'python'],
    useCases: [
      'Preparing data for any fine-tune.',
      'Auditing a dataset before committing to a training run.',
      'Building an evaluation set that survives scrutiny.'
    ],
    avoid: [
      'Training on data you have not audited.',
      'Purely synthetic data, which teaches the generating model’s quirks.',
      'Any dataset containing PII you have not removed.'
    ],
    mistakes: [
      'Leaving PII in training data, which cannot be removed after training.',
      'Not deduplicating, so apparent dataset size is inflated and some examples are over-weighted.',
      'Ignoring class imbalance, which the model reproduces exactly.',
      'No ambiguous or refusal examples, producing a model that never abstains.',
      'Not versioning the dataset, so a result cannot be reproduced or diagnosed.'
    ],
    keyTerms: [
      ['de-identification', 'Removing personal data before training. Irreversible if skipped.'],
      ['deduplication', 'Removing repeated and near-repeated examples.'],
      ['class balance', 'The label distribution, which the model reproduces.'],
      ['edge case coverage', 'Ambiguous inputs and their correct abstention outputs.'],
      ['stratified split', 'Preserving class proportions across train/val/test.'],
      ['dataset versioning', 'Treating the dataset as a versioned artefact.'],
      ['synthetic data', 'Model-generated examples. Useful to supplement, risky alone.']
    ],
    resources: [
      ['Hugging Face — dataset processing', 'https://huggingface.co/docs/datasets/process', 'docs'],
      ['Google — data preparation and feature engineering', 'https://developers.google.com/machine-learning/data-prep', 'course'],
      ['OpenAI — fine-tuning data preparation', 'https://platform.openai.com/docs/guides/fine-tuning', 'docs'],
      ['Presidio — PII detection and anonymisation', 'https://microsoft.github.io/presidio/', 'docs']
    ],
    questions: [
      ['Why must PII be removed before training rather than after?', 'Training data becomes part of the model weights. When a customer exercises their right to erasure you can delete their database rows, but their data remains in the model and cannot be removed.'],
      ['What happens if the dataset contains only clean, unambiguous cases?', 'The model never learns to abstain. It will always pick a category confidently, including for inputs where the correct answer is "unclear".'],
      ['Why version the dataset alongside the model?', 'The dataset determines the model’s behaviour. Without knowing exactly which data produced a given model, you cannot reproduce a result or diagnose a regression.']
    ]
  },

  {
    id: 'labeling',
    title: 'Labelling',
    domain: 'finetuning', tier: 2, priority: 'medium',
    summary: 'Producing the ground truth — and making sure it means the same thing to everyone.',
    what: `Labelling is having humans assign the correct output to each example. It is the input to supervised fine-tuning and to every evaluation set.`,
    why: `Labels define what "correct" means for your system. If two labellers disagree on a third of the cases, your definition is ambiguous — and no model, evaluation or metric built on those labels means anything.`,
    analogy: `Marking exam papers. If two markers give the same script very different grades, the problem is the mark scheme, not the markers. Fixing the scheme is what makes every subsequent mark meaningful.`,
    technical: `The process that works:

1. **Write the guidelines** — with examples, and explicitly covering the ambiguous cases.
2. **Pilot** — two or three labellers label the same 50 examples independently.
3. **Measure agreement** — Cohen's kappa for two raters, Fleiss' kappa for more. Below about 0.6 the guidelines are ambiguous, not the labellers.
4. **Adjudicate disagreements** — every disagreement is a gap in the guidelines. Fix the guidelines, do not just pick a winner.
5. **Scale** — only once agreement is acceptable.
6. **Audit continuously** — overlap a percentage of work between labellers and keep measuring.

**Label the hard cases deliberately.** Randomly sampled data is mostly easy, so it teaches little. Active learning — labelling the examples the current model is least confident about — is far more efficient.

Model-assisted labelling (a model proposes, a human corrects) is much faster, and it introduces the model's bias into your ground truth. Audit a sample fully manually.`,
    diagram: `
   THE PROCESS

     1  WRITE GUIDELINES     with examples, including edge cases
     2  PILOT                3 labellers × the same 50 examples
     3  MEASURE AGREEMENT    Cohen's / Fleiss' kappa
                                │
                    ┌───────────┴───────────┐
                 κ < 0.6                 κ ≥ 0.6
                    │                       │
                    ▼                       ▼
          the GUIDELINES are          4 adjudicate
          ambiguous — fix them          disagreements
          and re-pilot                5 scale
                                      6 audit continuously

   INTERPRETING KAPPA

     < 0.20   poor        the task as written is not well defined
     0.21-0.40 fair
     0.41-0.60 moderate   usable with adjudication
     0.61-0.80 substantial  good
     > 0.80   near perfect  suspiciously easy, or leaked

   ⚠ DISAGREEMENT IS INFORMATION, NOT NOISE

     Every disagreement marks a case the guidelines did not cover.
     Fixing the guideline improves every future label.
     Just picking a winner improves one.

   LABEL THE HARD CASES

     random sample     mostly easy · teaches little · cheap per label
     active learning   label what the model is LEAST confident about
                       far more learning per label

   ⚠ MODEL-ASSISTED LABELLING

     model proposes → human corrects        3-5x faster
     …and the model's bias enters your ground truth
     → audit a sample labelled fully manually`,
    example: {
      language: 'python',
      caption: 'Measuring agreement, and using disagreement to improve guidelines',
      code: `from sklearn.metrics import cohen_kappa_score
from collections import Counter

# Pilot: two labellers, the same 50 examples, independently
kappa = cohen_kappa_score(labeller_a, labeller_b)
print(f"Cohen's kappa: {kappa:.2f}")
# 0.42 -> moderate. Usable, but the guidelines need work.

# ── DISAGREEMENTS ARE THE MOST VALUABLE OUTPUT OF THE PILOT ──
disagreements = [
    (ex, a, b) for ex, a, b in zip(examples, labeller_a, labeller_b) if a != b
]
print(f"{len(disagreements)}/{len(examples)} disagreements\\n")

# Which pairs of labels get confused?
confusions = Counter(tuple(sorted((a, b))) for _, a, b in disagreements)
for (label_1, label_2), n in confusions.most_common(5):
    print(f"{n:>3}x  {label_1} vs {label_2}")

#  9x  billing_question vs billing_duplicate_charge
#  6x  refund_request vs billing_question
#  4x  account_settings vs unclear
#
# The first line is not labeller error. It is a guideline gap:
# the definition does not say whether "why was I charged twice"
# is a QUESTION or a DUPLICATE CHARGE report.

# ── FIX THE GUIDELINE, NOT THE LABEL ───────────────────────
GUIDELINE_ADDITION = """
billing_duplicate_charge vs billing_question

Use billing_duplicate_charge when the customer asserts they were
charged more than once for the same thing, even if phrased as a
question ("why was I charged twice?").

Use billing_question when the customer is asking how billing works
and is not asserting an error ("when is my card charged?").
"""

# Re-pilot after the fix:
#   kappa 0.42 -> 0.71
# One guideline clarification fixed 9 of 23 disagreements, and
# will improve every future label.`
    },
    prereq: ['training-dataset-prep'], next: ['when-not-to-finetune'],
    related: ['inter-rater-agreement', 'golden-sets', 'human-evaluation', 'supervised-learning'],
    tools: ['huggingface'],
    useCases: [
      'Creating training data for a fine-tune.',
      'Building a golden evaluation set.',
      'Discovering that a category scheme is ambiguous before building on it.'
    ],
    avoid: [
      'Scaling labelling before agreement is measured.',
      'Fully model-assisted labelling with no manual audit.',
      'Random sampling when active learning would teach more per label.'
    ],
    mistakes: [
      'Treating disagreement as labeller error rather than a guideline gap.',
      'Not running a pilot, then discovering ambiguity after ten thousand labels.',
      'One labeller only, so ambiguity is invisible.',
      'Model-assisted labelling with no manual audit, baking the model’s bias into ground truth.',
      'Labelling only easy cases, producing a dataset that teaches little.'
    ],
    keyTerms: [
      ['ground truth', 'The agreed correct answer.'],
      ['labelling guidelines', 'The written definition of each label, with examples.'],
      ['Cohen’s kappa', 'Agreement between two raters, corrected for chance.'],
      ['Fleiss’ kappa', 'Agreement among three or more raters.'],
      ['adjudication', 'Resolving a disagreement and updating the guideline.'],
      ['active learning', 'Labelling the examples the model is least sure about.'],
      ['model-assisted labelling', 'A model proposes, a human corrects. Fast, and biasing.']
    ],
    resources: [
      ['Google — data labeling guide', 'https://cloud.google.com/architecture/ml-on-gcp-best-practices', 'reference'],
      ['scikit-learn — Cohen\'s kappa', 'https://scikit-learn.org/stable/modules/generated/sklearn.metrics.cohen_kappa_score.html', 'docs'],
      ['Label Studio — documentation', 'https://labelstud.io/guide/', 'docs'],
      ['Argilla — data annotation for LLMs', 'https://docs.argilla.io/', 'docs']
    ],
    questions: [
      ['What does low inter-rater agreement actually tell you?', 'That the guidelines are ambiguous, not that the labellers are careless. Below about 0.6 kappa, the task as written is not well defined and must be clarified before scaling.'],
      ['Why is a disagreement more valuable than a label?', 'Each disagreement marks a case the guidelines did not cover. Fixing the guideline improves every future label; adjudicating without fixing it improves one.'],
      ['What is the risk of model-assisted labelling?', 'It is three to five times faster and it introduces the model’s bias into your ground truth. A sample must be labelled fully manually to detect that drift.']
    ]
  },

  {
    id: 'when-not-to-finetune',
    title: 'When Not to Fine-tune',
    domain: 'finetuning', tier: 2, priority: 'high',
    summary: 'The cases where fine-tuning is the wrong answer — which is most of them.',
    what: `A checklist of situations where fine-tuning will cost weeks and not solve the problem, and what to do instead.`,
    why: `Fine-tuning is the most over-proposed solution in AI product work. It sounds decisive, it is expensive, and it addresses a narrower set of problems than people expect. Knowing the exclusions saves entire quarters.`,
    analogy: `Rebuilding an engine because the car is dirty. Expensive, impressive, and the car is still dirty.`,
    technical: `Do not fine-tune when:

**You need facts.** Fine-tuning teaches the shape of an answer, not its truth. Use RAG.
**Information changes.** Fine-tuned knowledge is frozen at training time and starts going stale immediately.
**Prompting has not been exhausted.** A prompt change costs an hour and reverses instantly.
**You have fewer than a few hundred consistent examples.** Too few to learn from; enough to overfit.
**Your labels are inconsistent.** The model learns the inconsistency faithfully.
**The task changes frequently.** Every change means a retraining cycle.
**You need explainability.** A fine-tuned model is no more interpretable and you have lost the prompt as an explanation.
**You cannot evaluate it.** Without a held-out set you cannot tell improvement from memorisation.
**The base model cannot do the task at all.** Fine-tuning shapes existing capability; it does not create new capability.

The honest sequence: prompt engineering → few-shot examples → RAG → *then* consider fine-tuning, with an evaluation set already built.`,
    diagram: `
   THE EXCLUSION CHECKLIST — any YES means do not fine-tune yet

     ☐ do you need FACTS?                        → RAG
     ☐ does the information CHANGE?              → RAG
     ☐ has prompting been properly evaluated?    → do that first
     ☐ fewer than ~300 consistent examples?      → too few
     ☐ are your labels inconsistent?             → fix labelling
     ☐ does the task change often?               → retraining treadmill
     ☐ do you need explainability?               → prompting is more legible
     ☐ can you evaluate it on held-out data?     → if no, you cannot tell
                                                    improvement from
                                                    memorisation
     ☐ can the base model do it AT ALL with
       a great prompt and examples?              → if no, fine-tuning
                                                    will not create the
                                                    capability

   THE ESCALATION LADDER — each rung costs ~10x the last

     1  prompt engineering       hours      free, instant, reversible
     2  few-shot examples        hours      cheap, per-call token cost
     3  RAG                      weeks      infrastructure, but knowledge
                                            stays current and citable
     4  fine-tuning              weeks      mostly labelling; frozen
                                            behaviour; retraining cycle

   ⚠ THE THREE LEGITIMATE CASES

     ✓ implicit criteria nobody can write into a prompt
       (how a senior agent classifies across 40 categories)
     ✓ a small model matching a large one on one narrow task,
       at a fraction of the per-call cost
     ✓ a format or style requirement at very high volume where
       per-call few-shot tokens are the dominant cost`,
    example: {
      language: 'text',
      caption: 'Four proposals, triaged',
      code: `PROPOSAL 1
  "Fine-tune so it knows our product documentation."
  → NO. Knowledge problem. Use RAG.
     It would learn to SOUND like the docs and invent specifics.

PROPOSAL 2
  "Fine-tune so it stops writing three paragraphs when we want
   two bullets."
  → NOT YET. Behaviour problem, but prompting is untested.
     Specify the format, give two examples, measure. One hour.

PROPOSAL 3
  "Fine-tune so a 3B model can classify tickets as well as the
   frontier model does, because we run 2 million a month and the
   API bill is $40k."
  → YES, plausibly. This is the economic case.
     Requirements before starting:
       · 2,000+ consistently labelled examples
       · kappa above 0.6 on a labelling pilot
       · a held-out test set built first
       · a measured baseline from the frontier model
     Success looks like: within 2 points of the baseline at
     ~5% of the cost.

PROPOSAL 4
  "Fine-tune so it can do multi-step financial reasoning it
   currently gets wrong."
  → NO. Test first: can the base model do it with a great prompt,
     chain-of-thought and examples?
     If it CANNOT do it at all, fine-tuning shapes existing
     capability — it does not create new capability.
     Consider a different model, or decomposing the task, or tools.

── THE PATTERN ────────────────────────────────────────────
  Of four proposals, one was legitimate, and it was the one
  driven by cost economics rather than by capability.`
    },
    prereq: ['supervised-fine-tuning', 'rag-vs-finetuning'], next: [],
    related: ['prompt-engineering', 'why-rag', 'ai-build-vs-buy', 'ai-cost'],
    tools: ['huggingface', 'anthropic'],
    useCases: [
      'Triaging a fine-tuning proposal before it consumes a quarter.',
      'Justifying the escalation ladder to a team that wants to skip to the end.',
      'Recognising the genuine economic case when it appears.'
    ],
    avoid: [
      'Treating this checklist as a reason never to fine-tune. The legitimate cases are real.'
    ],
    mistakes: [
      'Fine-tuning for knowledge.',
      'Skipping prompt engineering because fine-tuning sounds more serious.',
      'Starting without an evaluation set, so success cannot be demonstrated.',
      'Expecting fine-tuning to create capability the base model does not have.',
      'Not budgeting for the retraining cycle when the task inevitably changes.'
    ],
    keyTerms: [
      ['escalation ladder', 'Prompt → few-shot → RAG → fine-tune, cheapest first.'],
      ['frozen behaviour', 'A fine-tuned model does not update as the task changes.'],
      ['retraining treadmill', 'The ongoing cost of keeping a fine-tune current.'],
      ['economic case', 'A small fine-tuned model replacing an expensive large one.'],
      ['capability vs shaping', 'Fine-tuning shapes existing ability; it does not create new ability.'],
      ['evaluation prerequisite', 'A held-out set built before training begins.']
    ],
    resources: [
      ['Anthropic — choosing a model', 'https://docs.anthropic.com/en/docs/about-claude/models/choosing-a-model', 'docs'],
      ['OpenAI — when to use fine-tuning', 'https://platform.openai.com/docs/guides/fine-tuning', 'docs'],
      ['RAG vs fine-tuning (paper)', 'https://arxiv.org/abs/2401.08406', 'paper'],
      ['Hugging Face — TRL', 'https://huggingface.co/docs/trl/index', 'docs']
    ],
    questions: [
      ['What are the three legitimate cases for fine-tuning?', 'Implicit criteria nobody can write into a prompt, a small model replacing an expensive large one on a narrow task, and a format requirement at volume where per-call few-shot tokens dominate cost.'],
      ['Why will fine-tuning not fix a capability the base model lacks entirely?', 'Fine-tuning shapes existing capability rather than creating new capability. If the model cannot do the reasoning with a great prompt and examples, training on outputs will not teach it the reasoning.'],
      ['What must exist before a fine-tuning project starts?', 'A held-out evaluation set and a measured baseline. Without both, you cannot demonstrate improvement or distinguish it from memorisation.']
    ]
  }
];
