/**
 * DOMAIN D — LLM FUNDAMENTALS (BUILD.md section 7)
 * "This section must be extremely comprehensive. Do NOT assume I understand
 *  AI terminology." Every concept gets SIMPLE / TECHNICAL / PRODUCT / VISUAL.
 */
export const topics = [
  {
    id: 'tokens-tokenization',
    title: 'Tokens & Tokenization',
    domain: 'llm', tier: 1, priority: 'high',
    summary: 'Text is chopped into sub-word pieces before a model ever sees it — and those pieces are what you pay for.',
    what: `A model cannot read letters. Before anything happens, your text is split into **tokens** — chunks that are usually a word, part of a word, or a punctuation mark — and each token is looked up as a number.

"unbelievable" might become \`un | believ | able\`. Three tokens, three numbers.`,
    why: `Tokens are the unit of everything: context limits are in tokens, pricing is per token, latency scales with tokens. When someone says "128k context", they mean tokens, not characters or words. Getting this wrong by a factor of four wrecks a cost model.`,
    analogy: `Lego bricks. You cannot build with an arbitrary blob of plastic; you build with a fixed set of standard bricks. Common words get their own brick. Rare words have to be assembled from smaller ones.`,
    technical: `Modern LLMs use **subword** tokenization, typically **Byte Pair Encoding**. The tokenizer is trained on a corpus: frequent character sequences get merged into single tokens, so common words are one token and rare ones fragment.

The **vocabulary** is the fixed set of tokens (often 32k–200k). Every input maps to ids in that vocabulary; the model's output is a probability over exactly those ids.

Practical consequences: English averages roughly 4 characters per token. Code and non-Latin scripts tokenize far less efficiently — the same Hindi sentence can cost two to three times more tokens than its English equivalent. Numbers split unpredictably, which is part of why models are unreliable at arithmetic. A leading space is part of the token, so \`"hello"\` and \`" hello"\` are different tokens.`,
    diagram: `
   "Retrieval-augmented generation is unbelievable"
                        │
                        ▼ TOKENIZER
   ┌────────┬───┬────────┬───┬────────────┬────┬───┬────────┬────┬─────┐
   │Retrie  │val│-augment│ed │ generation │ is │ un│ believ │able│     │
   └────────┴───┴────────┴───┴────────────┴────┴───┴────────┴────┴─────┘
      9721  2412   8830  291     9134      374 653   6692   able
                        │
                        ▼
              the model sees ONLY these numbers

   RULES OF THUMB
     English prose     ~4 characters per token
     1,000 words       ~1,300 tokens
     code              denser, more tokens per character
     Hindi / Chinese   2-3x MORE tokens for the same meaning

   WHY MODELS ARE BAD AT ARITHMETIC
     "1234567"  ->  "123" "45" "67"    (arbitrary split)
     The model never sees digits as digits. It sees fragments.

   THE LEADING SPACE MATTERS
     "hello"   -> token 15339
     " hello"  -> token 24748     different token entirely`,
    example: {
      language: 'python',
      caption: 'Counting tokens before you send them — the basis of every cost estimate',
      code: `from transformers import AutoTokenizer

tok = AutoTokenizer.from_pretrained("gpt2")

samples = {
    "english":  "Retrieval augmented generation is powerful.",
    "hindi":    "पुनर्प्राप्ति संवर्धित पीढ़ी शक्तिशाली है।",
    "code":     "def embed(chunks): return [model.encode(c) for c in chunks]",
    "numbers":  "Order 1234567 totalled 45999.50",
}

for name, text in samples.items():
    ids = tok.encode(text)
    print(f"{name:<9} {len(text):>3} chars -> {len(ids):>3} tokens "
          f"({len(text)/len(ids):.1f} chars/token)")

# english     44 chars ->  10 tokens (4.4 chars/token)
# hindi       41 chars ->  38 tokens (1.1 chars/token)   <- 3.8x worse
# code        58 chars ->  18 tokens (3.2 chars/token)
# numbers     31 chars ->  13 tokens (2.4 chars/token)

# See the actual split — this is what the model receives
print(tok.convert_ids_to_tokens(tok.encode("Order 1234567")))
# ['Order', 'Ġ12', '34', '567']
#   'Ġ' marks a leading space. The number is fragmented arbitrarily.

# COST: always estimate in tokens, never in words
CHARS_PER_TOKEN = 4
doc_chars = 250_000
print(f"~{doc_chars // CHARS_PER_TOKEN:,} tokens per pass")   # ~62,500`
    },
    prereq: [], next: ['vocabulary', 'what-are-embeddings', 'context-window'],
    related: ['ai-cost', 'chunking', 'tokenizer'],
    tools: ['huggingface', 'transformers', 'openai', 'anthropic'],
    useCases: [
      'Estimating the cost of a feature before building it.',
      'Working out whether a document fits in the context window.',
      'Explaining why the same feature costs more for non-English users.'
    ],
    avoid: [
      'Estimating cost in words or characters. Always convert to tokens.',
      'Assuming the tokenizer is the same across providers. It is not.'
    ],
    mistakes: [
      'Equating tokens with words. The ratio is roughly 1.3 tokens per English word, and much worse elsewhere.',
      'Ignoring that output tokens are typically 3–5× more expensive than input tokens.',
      'Not budgeting for the system prompt and retrieved context, which are resent on every call.',
      'Expecting reliable character counting or arithmetic — the model never sees individual characters.'
    ],
    keyTerms: [
      ['token', 'The unit a model reads: a word, sub-word or punctuation mark.'],
      ['tokenization', 'Splitting text into tokens and mapping them to ids.'],
      ['subword', 'Tokens smaller than a word, so rare words can be assembled.'],
      ['BPE', 'Byte Pair Encoding — the dominant tokenization algorithm.'],
      ['vocabulary', 'The fixed set of tokens a model knows.'],
      ['token id', 'The integer index of a token in the vocabulary.'],
      ['input vs output tokens', 'Billed separately; output is substantially more expensive.'],
      ['special tokens', 'Markers like start-of-sequence or end-of-turn.']
    ],
    resources: [
      ['Hugging Face — summary of the tokenizers', 'https://huggingface.co/docs/transformers/tokenizer_summary', 'docs'],
      ['OpenAI Tokenizer — paste text and see the split', 'https://platform.openai.com/tokenizer', 'interactive'],
      ['Tiktokenizer — compare tokenizers side by side', 'https://tiktokenizer.vercel.app/', 'interactive'],
      ['Karpathy — Let\'s build the GPT tokenizer', 'https://www.youtube.com/watch?v=zduSFxRajkE', 'video'],
      ['Neural Machine Translation of Rare Words with Subword Units (BPE paper)', 'https://arxiv.org/abs/1508.07909', 'paper']
    ],
    questions: [
      ['Roughly how many tokens is 1,000 English words?', 'About 1,300. The rule of thumb is 4 characters or 0.75 words per token, but it degrades badly for code and non-Latin scripts.'],
      ['Why are LLMs unreliable at arithmetic?', 'Numbers are split into arbitrary subword fragments — "1234567" might become "123", "45", "567" — so the model never sees digits positionally the way a calculator does.'],
      ['Why does the same feature cost more for Hindi users than English users?', 'Tokenizers are trained predominantly on English, so non-Latin scripts fragment into far more tokens for the same meaning — often two to three times as many.'],
      ['What is the difference between input and output token pricing?', 'They are billed separately and output is typically three to five times more expensive, because generating requires a forward pass per token.']
    ],
    interview: {
      s30: 'A token is a sub-word chunk of text. Models read tokens, not letters. Context limits, pricing and latency are all measured in tokens, so it is the unit that matters commercially.',
      s90: 'Tokenization is where a lot of product surprises originate. English runs about four characters per token, so a thousand words is roughly thirteen hundred tokens — but Hindi or Chinese can cost two to three times more tokens for the same meaning, which means the same feature has a different unit economics per market. Numbers get split into arbitrary fragments, which is a large part of why models are unreliable at arithmetic and why you delegate that to a tool. And when I model cost I always count the system prompt and retrieved context too, because those are resent on every single call, and output tokens are three to five times the price of input tokens.',
      pm: 'It is the unit of the bill and the unit of the context limit, so any cost or feasibility estimate that is not in tokens is not an estimate.'
    }
  },

  {
    id: 'vocabulary',
    title: 'Vocabulary',
    domain: 'llm', tier: 2, priority: 'medium',
    summary: 'The fixed list of tokens a model knows — and the only things it can ever output.',
    what: `The vocabulary is the complete, fixed set of tokens a model recognises, typically 32,000 to 200,000 entries. Every input is expressed in them, and every output is chosen from them.`,
    why: `It explains a hard limit: the model can only ever emit tokens from this list. Anything outside it must be assembled from fragments. It also explains why vocabulary size is a real design trade-off, and why you cannot swap tokenizers between models.`,
    analogy: `The set of characters in a typeface. You can write anything expressible in those glyphs. A glyph that does not exist has to be approximated by combining others, imperfectly.`,
    technical: `The vocabulary is learned during tokenizer training: start from bytes, repeatedly merge the most frequent adjacent pair, stop at the target size.

The trade-off: a **larger vocabulary** means fewer tokens per sentence (cheaper, longer effective context) but a much larger embedding matrix and output layer, which costs memory and compute. A **smaller vocabulary** is the reverse.

Because the vocabulary is baked into the model, the tokenizer and the model are a matched pair. Using a different tokenizer produces ids the model has never associated with anything, and the output is noise.

Byte-level fallback guarantees any text can be represented — worst case, one token per byte — so there are no truly out-of-vocabulary inputs in modern models.`,
    diagram: `
   VOCABULARY (a fixed lookup table, e.g. 100,256 entries)

     id      token
     ─────   ─────────
        15   " the"
       262   " and"
      9721   "Retrie"
     15339   "hello"
     24748   " hello"      <- leading space = different entry
    100255   "<|endoftext|>"

   INPUT  text ──► ids ──► model
   OUTPUT model ──► a probability for EVERY id ──► pick one ──► text

   THE OUTPUT LAYER IS THE SIZE OF THE VOCABULARY
     100,256 numbers produced for EVERY token generated

   THE TRADE-OFF

     larger vocab    fewer tokens per sentence (cheaper per call)
                     bigger embedding + output matrices (more memory)
     smaller vocab   more tokens per sentence
                     smaller model footprint

   TOKENIZER AND MODEL ARE A MATCHED PAIR.
   Swap one and the ids mean nothing. Output becomes noise.`,
    example: {
      language: 'python',
      caption: 'Inspecting a vocabulary and seeing why swapping tokenizers breaks everything',
      code: `from transformers import AutoTokenizer

tok = AutoTokenizer.from_pretrained("gpt2")
print(f"vocabulary size: {tok.vocab_size:,}")        # 50,257

# The output layer produces one score per vocabulary entry, every step.
print(f"scores produced per generated token: {tok.vocab_size:,}")

# Same word, different ids, purely because of a leading space
for s in ["hello", " hello", "Hello", " Hello"]:
    print(f"{s!r:<9} -> {tok.encode(s)}")
# 'hello'   -> [31373]
# ' hello'  -> [23748]
# 'Hello'   -> [15496]
# ' Hello'  -> [18435]

# Rare words are ASSEMBLED, never memorised
for w in ["the", "retrieval", "groundedness", "antidisestablishmentarianism"]:
    ids = tok.encode(w)
    print(f"{w:<30} {len(ids)} token(s): {tok.convert_ids_to_tokens(ids)}")
# the                            1 token(s): ['the']
# groundedness                   4 token(s): ['ground', 'ed', 'ness']...

# WHY YOU CANNOT MIX TOKENIZERS
a = AutoTokenizer.from_pretrained("gpt2")
b = AutoTokenizer.from_pretrained("bert-base-uncased")
print(a.encode("hello world"))   # [31373, 995]
print(b.encode("hello world"))   # [101, 7592, 2088, 102]
# Feed GPT-2 ids to BERT and it reads completely different words.`
    },
    prereq: ['tokens-tokenization'], next: ['what-are-embeddings'],
    related: ['tokenizer', 'logits-and-softmax', 'model-card'],
    tools: ['huggingface', 'transformers'],
    useCases: [
      'Understanding why a model must be paired with its own tokenizer.',
      'Explaining why domain jargon fragments into several tokens.',
      'Reasoning about why vocabulary size affects memory footprint.'
    ],
    avoid: [
      'Mixing a tokenizer from one model with another model.',
      'Assuming vocabulary size alone predicts quality. It does not.'
    ],
    mistakes: [
      'Believing a model has "words" it does not know. Byte fallback means everything is representable.',
      'Assuming the same text costs the same tokens across providers.',
      'Ignoring that the output layer scales with vocabulary size, affecting memory.'
    ],
    keyTerms: [
      ['vocabulary', 'The fixed set of tokens a model knows.'],
      ['vocab size', 'How many entries. Typically 32k–200k.'],
      ['embedding matrix', 'One vector per vocabulary entry. Scales with vocab size.'],
      ['output layer', 'Produces one score per vocabulary entry, every generation step.'],
      ['byte-level fallback', 'Guarantees any text is representable, worst case one token per byte.'],
      ['out-of-vocabulary', 'A legacy problem; modern subword tokenizers do not have it.']
    ],
    resources: [
      ['Hugging Face — tokenizer summary', 'https://huggingface.co/docs/transformers/tokenizer_summary', 'docs'],
      ['Hugging Face — building a tokenizer', 'https://huggingface.co/learn/nlp-course/chapter6/8', 'course'],
      ['Tiktokenizer — compare vocabularies', 'https://tiktokenizer.vercel.app/', 'interactive']
    ],
    questions: [
      ['Why must a tokenizer stay paired with its model?', 'The model learned associations for specific token ids. A different tokenizer produces different ids for the same text, so the model reads entirely different words and outputs noise.'],
      ['What is the trade-off in vocabulary size?', 'A larger vocabulary means fewer tokens per sentence, which is cheaper per call and stretches the effective context, but the embedding and output matrices grow, costing memory and compute.'],
      ['Are there words a model cannot represent?', 'No. Byte-level fallback guarantees any text can be encoded, worst case one token per byte. Rare words simply fragment into more tokens.']
    ]
  },

  {
    id: 'parameters-weights',
    title: 'Parameters & Weights',
    domain: 'llm', tier: 1, priority: 'high',
    summary: 'The billions of numbers that constitute the model — and everything it knows.',
    what: `A model's parameters are the numbers learned during training. "7B parameters" means seven billion of them. Together they *are* the model — there is nothing else in the file.`,
    why: `Parameter count is the number quoted in every model comparison, and it directly determines memory, cost and speed. Understanding that these are just numbers in a file demystifies a great deal: the model has no database, no lookup table of facts, and no reasoning engine. Everything it appears to know is encoded in these values.`,
    analogy: `The settings on an enormous mixing desk. Millions of faders, each nudged during training. There is no recording stored anywhere — the sound comes entirely from how the faders are set.`,
    technical: `Parameters are the **weights** and **biases** of every layer. During training they are adjusted by gradient descent; during inference they are read-only.

Memory: parameters × bytes per parameter. FP32 is 4 bytes, FP16/BF16 is 2, INT8 is 1, INT4 is 0.5. So a 7B model needs ~28GB at FP32, ~14GB at FP16, ~3.5GB at INT4. This arithmetic is the entire reason quantization exists.

Parameters are **distinct from context**. Parameters are permanent knowledge from training; context is temporary information supplied at request time. RAG adds context; fine-tuning changes parameters.

More parameters generally means more capability, but data quality, architecture and training compute matter at least as much. An 8B model trained well now beats a 70B model from two years ago.`,
    diagram: `
   WHAT IS ACTUALLY IN A MODEL FILE

   model.safetensors
     layer_0.attention.q_proj.weight   [4096 × 4096]  float16
     layer_0.attention.k_proj.weight   [4096 × 4096]
     layer_0.mlp.gate_proj.weight      [4096 × 11008]
     ...
     layer_31.mlp.down_proj.weight     [11008 × 4096]

   ...and nothing else. No facts, no database, no rules.

   MEMORY = parameters × bytes per parameter

     precision   bytes   7B model    70B model
     ─────────   ─────   ────────    ─────────
     FP32          4      28 GB       280 GB
     FP16/BF16     2      14 GB       140 GB
     INT8          1       7 GB        70 GB
     INT4        0.5     3.5 GB        35 GB

   consumer GPU (24GB): 7B fits comfortably at FP16.
                        70B needs INT4 and even then it is tight.

   PARAMETERS vs CONTEXT — the distinction that matters

     PARAMETERS   permanent, from training, changed by FINE-TUNING
     CONTEXT      temporary, supplied per request, changed by RAG`,
    example: {
      language: 'python',
      caption: 'Sizing a model before you try to run it',
      code: `def memory_gb(params_billions, bits=16, kv_cache_gb=0, overhead=1.2):
    """Weights alone. Real serving needs KV cache and activations too."""
    bytes_per_param = bits / 8
    weights = params_billions * 1e9 * bytes_per_param / 1e9
    return round((weights + kv_cache_gb) * overhead, 1)

for size in [7, 13, 70]:
    row = f"{size:>3}B  "
    for bits in [16, 8, 4]:
        row += f"{bits:>2}-bit: {memory_gb(size, bits):>6} GB   "
    print(row)

#   7B  16-bit:   16.8 GB   8-bit:    8.4 GB   4-bit:    4.2 GB
#  13B  16-bit:   31.2 GB   8-bit:   15.6 GB   4-bit:    7.8 GB
#  70B  16-bit:  168.0 GB   8-bit:   84.0 GB   4-bit:   42.0 GB

# Counting parameters in a real model
from transformers import AutoModel
model = AutoModel.from_pretrained("distilbert-base-uncased")
total = sum(p.numel() for p in model.parameters())
print(f"{total:,} parameters")            # 66,362,880

# Where they live
for name, p in list(model.named_parameters())[:4]:
    print(f"{name:<50} {tuple(p.shape)}  {p.numel():>10,}")
# embeddings.word_embeddings.weight    (30522, 768)     23,440,896
#   ^ nearly a third of this small model is just the vocabulary embeddings`
    },
    prereq: ['neural-networks'], next: ['logits-and-softmax'],
    related: ['model-size-parameters', 'quantization', 'precision-formats', 'lora-peft'],
    tools: ['huggingface', 'ollama', 'transformers'],
    useCases: [
      'Working out whether a model will fit on available hardware.',
      'Estimating self-hosting cost.',
      'Explaining why a model cannot be "updated" with new facts without retraining.'
    ],
    avoid: [
      'Using parameter count alone to compare model quality.',
      'Assuming weights-only memory is sufficient. KV cache and activations add substantially.'
    ],
    mistakes: [
      'Believing facts are stored retrievably inside the weights. They are diffuse and cannot be edited.',
      'Forgetting to multiply by bytes per parameter when sizing hardware.',
      'Assuming bigger is better regardless of training data quality.',
      'Confusing parameters with context — a common source of RAG-versus-fine-tuning confusion.'
    ],
    keyTerms: [
      ['parameter', 'One learned number inside the model.'],
      ['weight', 'A multiplier applied to an input in a layer.'],
      ['bias', 'A learned constant added in a layer.'],
      ['7B / 70B', 'Seven billion / seventy billion parameters.'],
      ['precision', 'Bytes used per parameter. Determines memory footprint.'],
      ['checkpoint', 'A saved snapshot of all parameters at a point in training.'],
      ['safetensors', 'The standard, safe file format for storing weights.'],
      ['frozen weights', 'Parameters not updated — the normal state during inference.']
    ],
    resources: [
      ['Hugging Face — model memory anatomy', 'https://huggingface.co/docs/transformers/model_memory_anatomy', 'docs'],
      ['Hugging Face — safetensors', 'https://huggingface.co/docs/safetensors/index', 'docs'],
      ['Chinchilla — training compute-optimal LLMs (paper)', 'https://arxiv.org/abs/2203.15556', 'paper']
    ],
    questions: [
      ['How much memory does a 70B model need at 16-bit precision?', 'About 140GB for the weights alone, before KV cache and activations. This is why 70B models require multiple GPUs or aggressive quantization.'],
      ['What is the difference between parameters and context?', 'Parameters are permanent knowledge fixed at training time, changed only by fine-tuning. Context is temporary information supplied per request, which is what RAG adds.'],
      ['Why can you not simply edit a fact in a model?', 'Facts are not stored in retrievable locations. They are distributed across billions of weights, so there is nothing to look up and change.']
    ]
  },

  {
    id: 'logits-and-softmax',
    title: 'Logits & Softmax',
    domain: 'llm', tier: 2, priority: 'high',
    summary: 'Raw scores over every possible next token, converted into probabilities.',
    what: `At each step the model produces one raw score — a **logit** — for every token in the vocabulary. **Softmax** converts those scores into probabilities that sum to 1. One of them is then chosen as the next token.`,
    why: `This is the exact mechanism of generation, and it explains the model's most important property: it is producing a probability distribution over plausible continuations, not retrieving an answer. A confident-sounding wrong answer is a high-probability token sequence, nothing more.`,
    analogy: `A weather forecast over every possible tomorrow. The raw scores are "how much does each outcome look right"; softmax turns them into percentages; then one outcome actually happens.`,
    technical: `The final layer outputs a vector of length equal to the vocabulary — 100,000+ raw numbers, unbounded, positive or negative.

Softmax: exponentiate each, divide by the sum. Exponentiation means small logit differences become large probability differences, which is why the distribution is usually very peaked.

**Temperature** divides the logits before softmax: low temperature sharpens the distribution toward the top token, high temperature flattens it.

Critically, **softmax probability is not confidence in correctness**. The distribution always sums to 1 regardless of whether the model knows anything. A hallucinated fact can be generated with a 0.95 token probability. This is the single most important thing to understand about why models hallucinate confidently.`,
    diagram: `
   ...context: "The capital of France is"
                        │
                        ▼
              TRANSFORMER LAYERS
                        │
                        ▼
   LOGITS — one raw score per vocabulary entry (100,000+ numbers)

     " Paris"    12.4
     " Lyon"      6.1
     " the"       4.8
     " located"   4.2
     ...          ...
                        │
                        ▼  softmax: exp(z) / Σ exp(z)
   PROBABILITIES — sum to exactly 1.0

     " Paris"    0.94   ████████████████████
     " Lyon"     0.03   █
     " the"      0.01
     ...
                        │
                        ▼  sample
                     " Paris"
                        │
                        └──► append and repeat for the next token

   ⚠ THE DISTRIBUTION ALWAYS SUMS TO 1
     Ask for a fact the model has never seen and it STILL produces
     a peaked distribution over plausible-sounding tokens.
     0.94 probability means "this token fits here", NOT "this is true".`,
    example: {
      language: 'python',
      caption: 'From logits to a chosen token, and why probability is not truth',
      code: `import numpy as np

def softmax(logits, temperature=1.0):
    z = np.array(logits, float) / temperature
    z -= z.max()                      # numerical stability
    e = np.exp(z)
    return e / e.sum()

vocab  = [" Paris", " Lyon", " the", " located", " a"]
logits = [12.4, 6.1, 4.8, 4.2, 3.9]

for T in [0.1, 0.7, 1.0, 1.8]:
    p = softmax(logits, T)
    top = vocab[int(np.argmax(p))]
    print(f"T={T:<4} {dict(zip(vocab, np.round(p,3)))}  -> {top!r}")

# T=0.1  {' Paris': 1.0,   ' Lyon': 0.0, ...}   deterministic
# T=0.7  {' Paris': 0.999, ' Lyon': 0.0, ...}
# T=1.0  {' Paris': 0.996, ' Lyon': 0.002, ...}
# T=1.8  {' Paris': 0.918, ' Lyon': 0.027, ...}  more room for alternatives

# THE UNCOMFORTABLE PART
# Ask about something that does not exist:
#   "The CEO of Fictitious Corp is"
# The model still produces logits over every token, softmax still
# normalises to 1.0, and it still emits a name with high probability.
#
# There is NO mechanism in this pipeline that checks truth.
# That is why groundedness has to be enforced OUTSIDE the model —
# by retrieval, citation, and an evaluation gate.`
    },
    prereq: ['parameters-weights', 'activation-functions'], next: ['temperature-sampling'],
    related: ['hallucination', 'groundedness', 'next-token-prediction'],
    tools: ['transformers', 'anthropic', 'openai'],
    useCases: [
      'Explaining precisely why models hallucinate confidently.',
      'Understanding what temperature actually controls.',
      'Using token log-probabilities as a weak uncertainty signal.'
    ],
    avoid: [
      'Treating token probability as factual confidence.',
      'Building a quality gate on raw model confidence alone.'
    ],
    mistakes: [
      'Assuming a high-probability token means a correct answer.',
      'Believing the model "knows" when it does not know. Nothing in the pipeline detects that.',
      'Expecting a self-reported confidence score to be calibrated.'
    ],
    keyTerms: [
      ['logit', 'A raw, unnormalised score for one vocabulary token.'],
      ['softmax', 'Converts logits into a probability distribution summing to 1.'],
      ['probability distribution', 'The set of probabilities over all next-token candidates.'],
      ['temperature', 'Divides logits before softmax; controls how peaked the distribution is.'],
      ['log-probability', 'The log of a token’s probability; often exposed by APIs.'],
      ['perplexity', 'How surprised the model was by a sequence. Lower is more confident.'],
      ['calibration', 'Whether stated confidence matches actual correctness. Usually poor.']
    ],
    resources: [
      ['Hugging Face — how to generate text', 'https://huggingface.co/blog/how-to-generate', 'tutorial'],
      ['Karpathy — Let\'s build GPT from scratch', 'https://www.youtube.com/watch?v=kCc8FmEb1nY', 'video'],
      ['Anthropic — reducing hallucinations', 'https://docs.anthropic.com/en/docs/test-and-evaluate/strengthen-guardrails/reduce-hallucinations', 'docs']
    ],
    questions: [
      ['What are logits?', 'Raw, unbounded scores produced for every token in the vocabulary at each generation step, before normalisation.'],
      ['Why does a 0.95 token probability not mean the answer is true?', 'Softmax always normalises to a distribution summing to 1, regardless of whether the model has relevant knowledge. High probability means the token fits the pattern, not that the statement is factual.'],
      ['Where must truthfulness be enforced, if not in the model?', 'Outside it — through retrieval that supplies grounded context, citations that make claims checkable, and an evaluation gate that blocks ungrounded answers.']
    ]
  },

  {
    id: 'temperature-sampling',
    title: 'Temperature, Top-k & Top-p',
    domain: 'llm', tier: 2, priority: 'high',
    summary: 'The knobs that decide how adventurous the model is when picking the next token.',
    what: `Once probabilities exist, something must choose. **Temperature** reshapes the distribution. **Top-k** restricts the choice to the k most likely tokens. **Top-p** (nucleus) restricts it to the smallest set whose probabilities sum to p.`,
    why: `These are the only generation parameters most product teams ever set, and getting them wrong is a common cause of "the model is inconsistent" or "the model is boring". For extraction and classification you want near-determinism; for brainstorming you want variety. It is a product decision.`,
    analogy: `Ordering at a familiar restaurant. Temperature 0 is always the usual. Temperature 1 is picking roughly in proportion to how much you like each dish. Temperature 2 is letting someone spin a wheel that includes things you have never enjoyed.`,
    technical: `**Temperature** divides logits before softmax. T→0 approaches deterministic argmax; T=1 is the raw distribution; T>1 flattens it and raises the chance of unlikely tokens.

**Top-k** keeps the k highest-probability tokens and renormalises. Fixed size regardless of how confident the model is.

**Top-p** keeps the smallest set of tokens whose cumulative probability reaches p. It adapts: when the model is confident the set is tiny; when uncertain it widens. Generally preferable to top-k.

Note that temperature 0 is *not* guaranteed to be perfectly reproducible in practice — floating-point non-determinism on GPUs and batching effects mean identical inputs can still occasionally diverge. Design evaluation accordingly.

Guidance: extraction, classification, structured output → T ≈ 0. Summarisation, factual Q&A → 0.2–0.4. Conversational → 0.6–0.8. Creative → 0.9–1.2.`,
    diagram: `
   RAW DISTRIBUTION       LOW T (0.2)          HIGH T (1.5)
   Paris  0.60            Paris  0.97          Paris  0.38
   Lyon   0.20            Lyon   0.02          Lyon   0.25
   Nice   0.12            Nice   0.01          Nice   0.20
   Rome   0.08            Rome   0.00          Rome   0.17

   sharper, safer,        flatter, more varied,
   repetitive             more likely to go wrong

   TOP-K = 3                    TOP-P = 0.9 (nucleus)
   always exactly 3              takes tokens until cumulative ≥ 0.9

   confident case:               confident case:
     0.97 0.02 0.01              0.97 ──────────► set size 1
     -> still considers 3           (adapts: very tight)

   uncertain case:               uncertain case:
     0.3 0.25 0.22 0.2           0.3+0.25+0.22+0.2 -> set size 4
     -> cuts off at 3               (adapts: wider)

   TOP-P ADAPTS TO CONFIDENCE. TOP-K DOES NOT.

   CHOOSING BY TASK
     extraction / JSON / classification   T ≈ 0
     summarisation / factual Q&A          T 0.2 - 0.4
     conversational assistant             T 0.6 - 0.8
     brainstorming / creative             T 0.9 - 1.2`,
    example: {
      language: 'python',
      caption: 'Implementing the three sampling strategies',
      code: `import numpy as np

def sample(logits, temperature=1.0, top_k=None, top_p=None, rng=None):
    rng = rng or np.random.default_rng(0)
    z = np.array(logits, float) / max(temperature, 1e-6)
    z -= z.max()
    p = np.exp(z); p /= p.sum()

    if top_k:                                   # keep the k best
        cut = np.argsort(p)[-top_k:]
        mask = np.zeros_like(p, bool); mask[cut] = True
        p = np.where(mask, p, 0); p /= p.sum()

    if top_p:                                   # keep the nucleus
        order = np.argsort(p)[::-1]
        cumulative = np.cumsum(p[order])
        keep = order[:np.searchsorted(cumulative, top_p) + 1]
        mask = np.zeros_like(p, bool); mask[keep] = True
        p = np.where(mask, p, 0); p /= p.sum()

    return int(rng.choice(len(p), p=p)), p

vocab  = ["Paris", "Lyon", "Nice", "Rome", "Berlin"]
logits = [4.0, 2.9, 2.4, 2.0, 1.2]

print("raw          ", np.round(sample(logits)[1], 3))
print("T=0.2        ", np.round(sample(logits, temperature=0.2)[1], 3))
print("T=1.5        ", np.round(sample(logits, temperature=1.5)[1], 3))
print("top_k=2      ", np.round(sample(logits, top_k=2)[1], 3))
print("top_p=0.8    ", np.round(sample(logits, top_p=0.8)[1], 3))

# raw           [0.512 0.17  0.103 0.069 0.031]  (renormalised over 5)
# T=0.2         [0.996 0.004 0.    0.    0.   ]
# T=1.5         [0.361 0.174 0.125 0.096 0.056]
# top_k=2       [0.751 0.249 0.    0.    0.   ]
# top_p=0.8     [0.751 0.249 0.    0.    0.   ]

# In an API you would just set them:
#   temperature=0, max_tokens=512            -> extraction
#   temperature=0.7, top_p=0.9               -> conversation`
    },
    prereq: ['logits-and-softmax'], next: ['autoregressive-generation'],
    related: ['structured-outputs', 'prompt-evaluation', 'regression-testing'],
    tools: ['anthropic', 'openai', 'ollama'],
    useCases: [
      'Setting temperature 0 for structured extraction so output is stable.',
      'Raising temperature for ideation features where variety is the point.',
      'Diagnosing "the model gives different answers every time" complaints.'
    ],
    avoid: [
      'High temperature on anything that must be parsed or must be factual.',
      'Tuning both temperature and top-p aggressively at once — they interact confusingly.',
      'Relying on temperature 0 for bit-exact reproducibility.'
    ],
    mistakes: [
      'Leaving the default temperature on an extraction task and getting inconsistent JSON.',
      'Assuming temperature 0 guarantees identical output — GPU non-determinism means it usually does not.',
      'Raising temperature to fix a "boring" model when the prompt was the real problem.',
      'Not pinning generation parameters in an evaluation suite, making results incomparable.'
    ],
    keyTerms: [
      ['temperature', 'Scales logits before softmax; controls randomness.'],
      ['greedy decoding', 'Always take the highest-probability token. Equivalent to T→0.'],
      ['top-k sampling', 'Restrict to the k most likely tokens.'],
      ['top-p / nucleus sampling', 'Restrict to the smallest set summing to p. Adapts to confidence.'],
      ['beam search', 'Explores several sequences at once; used more in translation than chat.'],
      ['repetition penalty', 'Reduces the probability of already-used tokens.'],
      ['determinism', 'Same input, same output. Not fully guaranteed even at T=0.']
    ],
    resources: [
      ['Hugging Face — text generation strategies', 'https://huggingface.co/docs/transformers/generation_strategies', 'docs'],
      ['Hugging Face — how to generate', 'https://huggingface.co/blog/how-to-generate', 'tutorial'],
      ['The Curious Case of Neural Text Degeneration (nucleus sampling paper)', 'https://arxiv.org/abs/1904.09751', 'paper'],
      ['Anthropic — API parameters', 'https://docs.anthropic.com/en/api/messages', 'docs']
    ],
    questions: [
      ['What temperature should an extraction feature use, and why?', 'Effectively 0. Extraction has one correct answer and downstream code must parse it, so variability is pure risk with no upside.'],
      ['Why is top-p usually preferable to top-k?', 'Top-p adapts to the model’s confidence: it keeps a tiny set when the model is sure and widens when it is uncertain. Top-k keeps a fixed number regardless.'],
      ['Does temperature 0 guarantee identical output every time?', 'No. Floating-point non-determinism on GPUs and batching effects mean identical inputs can still occasionally diverge, so evaluation must tolerate small variation.']
    ]
  },

  {
    id: 'context-window',
    title: 'Context Window',
    domain: 'llm', tier: 1, priority: 'high',
    summary: 'The total number of tokens the model can consider at once — its entire working memory.',
    what: `The context window is the maximum number of tokens the model can hold in view for a single request: system prompt, conversation history, retrieved documents, the user's question and the answer being generated, all together.

Nothing outside it exists to the model.`,
    why: `It is a hard limit that shapes architecture. It is why RAG exists, why long conversations need summarising, and why "just paste the whole handbook in" is not a strategy. It is also a cost driver, because every token in the window is processed on every single call.`,
    analogy: `A desk. You can only work with what fits on it. A bigger desk helps, but at some point you need a filing system rather than a bigger desk — and reaching for the right folder is faster than spreading everything out.`,
    technical: `Windows have grown from 4k to 200k–2M tokens. But bigger is not simply better:

**Cost** — every token is charged on every call, so a 100k-token context is expensive per request even if only 2k was relevant.
**Latency** — attention cost grows with sequence length, so long contexts are slower to first token.
**Quality** — the **lost-in-the-middle** effect means information in the middle of a long context is used less reliably than material at the start or end.

The window is shared: system prompt + history + retrieved context + question + reserved output space. Reserve output tokens explicitly, or generation truncates mid-sentence.

Prompt caching lets a stable prefix be reused across calls at reduced cost, which changes the economics of large system prompts considerably.`,
    diagram: `
   ONE CONTEXT WINDOW (say 200,000 tokens)

   ┌──────────────────────────────────────────────────────────┐
   │ system prompt        1,200 │ resent EVERY call           │
   ├────────────────────────────┤                             │
   │ tool definitions       800 │ resent EVERY call           │
   ├────────────────────────────┤                             │
   │ conversation history 6,400 │ grows every turn            │
   ├────────────────────────────┤                             │
   │ retrieved chunks     4,000 │ RAG output                  │
   ├────────────────────────────┤                             │
   │ user question           80 │                             │
   ├────────────────────────────┤                             │
   │ RESERVED for output  2,000 │ ← reserve this or you get   │
   │                            │   truncated mid-sentence    │
   ├────────────────────────────┴─────────────────────────────┤
   │ ......................unused......................       │
   └──────────────────────────────────────────────────────────┘

   LOST IN THE MIDDLE — retrieval accuracy by position

   accuracy │██████                              ██████
            │      ████                    ████
            │          ████████████████████
            └──────────────────────────────────────────
             start          middle              end

   A bigger window does NOT remove the need for good retrieval.
   It changes the cost curve, not the grounding problem.`,
    example: {
      language: 'python',
      caption: 'Budgeting a context window, and what happens when you do not',
      code: `WINDOW = 200_000
RESERVE_OUTPUT = 2_000          # never let generation get squeezed out

budget = {
    "system_prompt":  1_200,
    "tool_defs":        800,
    "history":        6_400,
    "question":          80,
    "output_reserve": RESERVE_OUTPUT,
}
fixed = sum(budget.values())
available_for_retrieval = WINDOW - fixed
print(f"fixed {fixed:,} | available for retrieval {available_for_retrieval:,}")
# fixed 10,480 | available for retrieval 189,520

# But "available" is not the same as "wise".
CHUNK = 400
PRICE_IN = 3.00 / 1_000_000

for k in [3, 5, 10, 50, 200]:
    ctx = k * CHUNK
    total_in = fixed - RESERVE_OUTPUT + ctx
    print(f"top_k={k:>3}  context {ctx:>6,} tok  "
          f"input {total_in:>7,} tok  \${total_in*PRICE_IN:.4f}/call")

# top_k=  3  context  1,200 tok  input   9,680 tok  $0.0290/call
# top_k=  5  context  2,000 tok  input  10,480 tok  $0.0314/call
# top_k= 10  context  4,000 tok  input  12,480 tok  $0.0374/call
# top_k= 50  context 20,000 tok  input  28,480 tok  $0.0854/call
# top_k=200  context 80,000 tok  input  88,480 tok  $0.2654/call
#
# 200 chunks costs 9x more per call AND scores worse, because the
# relevant chunk is now buried in the middle of 80,000 tokens.
# Better retrieval beats more retrieval.`
    },
    prereq: ['tokens-tokenization'], next: ['attention', 'long-context-problems'],
    related: ['why-rag', 'context-engineering', 'ai-cost', 'context-compression'],
    tools: ['anthropic', 'openai', 'google-ai'],
    useCases: [
      'Deciding how many retrieved chunks to include.',
      'Designing conversation-history summarisation for long chats.',
      'Estimating per-request cost accurately.'
    ],
    avoid: [
      'Filling the window because you can. Cost and quality both suffer.',
      'Assuming a long window removes the need for retrieval.',
      'Forgetting to reserve output tokens.'
    ],
    mistakes: [
      'Not reserving space for the answer, producing truncated output.',
      'Treating a large window as a substitute for good retrieval.',
      'Ignoring that history grows every turn, so a conversation silently approaches the limit.',
      'Overlooking that every token in the window is billed on every call.'
    ],
    keyTerms: [
      ['context window', 'Maximum tokens the model can attend to at once.'],
      ['prompt', 'Everything sent into the window for one request.'],
      ['completion', 'The generated output, which also consumes window space.'],
      ['lost in the middle', 'Reduced reliability for information positioned mid-context.'],
      ['truncation', 'Silently dropping tokens that do not fit.'],
      ['prompt caching', 'Reusing a stable prefix across calls at reduced cost.'],
      ['effective context', 'The portion the model actually uses well, which is smaller than the maximum.']
    ],
    resources: [
      ['Anthropic — context windows', 'https://docs.anthropic.com/en/docs/build-with-claude/context-windows', 'docs'],
      ['Lost in the Middle (paper)', 'https://arxiv.org/abs/2307.03172', 'paper'],
      ['Anthropic — prompt caching', 'https://docs.anthropic.com/en/docs/build-with-claude/prompt-caching', 'docs'],
      ['Anthropic — long context tips', 'https://docs.anthropic.com/en/docs/build-with-claude/prompt-engineering/long-context-tips', 'docs']
    ],
    questions: [
      ['Does a 2-million-token context window make RAG unnecessary?', 'No. It changes the cost curve, not the grounding problem. Filling the window costs more per call, adds latency, and quality degrades because relevant information gets buried mid-context.'],
      ['What happens if you do not reserve output tokens?', 'The input consumes the whole window and generation is truncated mid-sentence, or the request is rejected.'],
      ['What is lost-in-the-middle?', 'Models use information at the start and end of a long context more reliably than material in the middle, so simply adding more retrieved chunks can reduce answer quality.']
    ],
    interview: {
      s30: 'The context window is everything the model can see at once — system prompt, history, retrieved documents, question and the answer being written. Nothing outside it exists to the model.',
      s90: 'I treat the context window as a budget rather than a capacity. It is shared between the system prompt, tool definitions, conversation history, retrieved chunks, the question and space reserved for the answer, and every token is charged on every call. The mistake I watch for is treating a large window as a replacement for retrieval. If you push a hundred thousand tokens in, you pay nine times more per request and quality actually falls, because of the lost-in-the-middle effect — models use the start and end of a long context far more reliably than the middle. So better retrieval beats more retrieval, and the right number of chunks is usually a small single-digit number, chosen by evaluation rather than by what fits.',
      pm: 'It is simultaneously the main cost driver and a quality constraint, so it is where I look first when a feature is either too expensive or unexpectedly inaccurate.'
    }
  },

  {
    id: 'attention',
    title: 'Attention',
    domain: 'llm', tier: 2, priority: 'high',
    summary: 'The mechanism that lets each token look at every other token and decide what matters.',
    what: `Attention lets the model, when processing a token, weigh every other token in the context and pull in the ones that are relevant.

Processing "it" in "the trophy did not fit in the suitcase because it was too big", attention is how the model works out that "it" refers to the trophy.`,
    why: `Attention is the reason transformers replaced everything before them, and therefore the reason modern LLMs exist. It also explains the cost curve: attention compares every token with every other, so cost grows quadratically with context length.`,
    analogy: `Reading a contract clause. To understand "the aforementioned party" you glance back at the definitions section, then at the parties clause, then return. You do not re-read the whole document linearly — you attend to the parts that matter.`,
    technical: `Each token produces three vectors: a **query** (what am I looking for), a **key** (what do I offer) and a **value** (what I actually contribute).

For every pair, the dot product of query and key gives an **attention score**. Softmax over those scores produces weights, and the output is the weighted sum of values.

Because every token attends to every other, cost is **O(n²)** in sequence length. Doubling the context quadruples the attention computation — this is the fundamental reason long contexts are expensive and slow.

**Multi-head attention** runs several attention operations in parallel with different learned projections, so different heads can track different relationships (syntax, coreference, topic).`,
    diagram: `
   "the trophy did not fit in the suitcase because it was too big"
                                                   │
                                        processing "it"
                                                   │
   ATTENTION WEIGHTS from "it" to every earlier token:

     the        0.01  │
     trophy     0.62  ████████████████   ← resolves the reference
     did        0.01  │
     not        0.02  │
     fit        0.08  ██
     in         0.01  │
     the        0.01  │
     suitcase   0.19  █████
     because    0.03  │
     it         0.02  │

   HOW A SCORE IS PRODUCED

     query("it") · key("trophy")   →  high score
     query("it") · key("the")      →  low score
              │
              ▼ softmax over all scores → weights
     output = Σ weight × value(token)

   THE COST

     every token attends to every token → n × n comparisons

     1,000 tokens  →     1,000,000 pairs
     2,000 tokens  →     4,000,000 pairs    (2x length, 4x cost)
    10,000 tokens  →   100,000,000 pairs
   100,000 tokens  → 10,000,000,000 pairs

   O(n²) is why long context is expensive and slow.`,
    example: {
      language: 'python',
      caption: 'Scaled dot-product attention, in full',
      code: `import numpy as np

def attention(Q, K, V, mask=None):
    """The entire mechanism. Everything else in a transformer is plumbing."""
    d_k = Q.shape[-1]
    scores = Q @ K.T / np.sqrt(d_k)      # every query against every key

    if mask is not None:                  # causal mask: no peeking ahead
        scores = np.where(mask, scores, -1e9)

    weights = np.exp(scores - scores.max(-1, keepdims=True))
    weights /= weights.sum(-1, keepdims=True)     # softmax
    return weights @ V, weights                   # weighted sum of values

n, d = 6, 8
rng = np.random.default_rng(0)
Q, K, V = (rng.normal(size=(n, d)) for _ in range(3))

# Causal mask — token i may only attend to tokens 0..i.
# This is what makes generation left-to-right.
causal = np.tril(np.ones((n, n), bool))

out, w = attention(Q, K, V, causal)
print(np.round(w, 2))
# [[1.   0.   0.   0.   0.   0.  ]   token 0 sees only itself
#  [0.42 0.58 0.   0.   0.   0.  ]   token 1 sees 0 and 1
#  [0.29 0.34 0.37 0.   0.   0.  ]
#  [0.21 0.19 0.31 0.29 0.   0.  ]
#  ...                               upper triangle is always 0

# Each row sums to 1 and the upper triangle is masked out.
# That triangle is why a model cannot see the future while generating.`
    },
    prereq: ['context-window', 'neural-networks'], next: ['self-attention-qkv', 'transformers'],
    related: ['positional-encoding', 'latency-throughput', 'ai-latency'],
    tools: ['transformers', 'pytorch'],
    useCases: [
      'Explaining why long contexts cost disproportionately more.',
      'Understanding what a KV cache is caching and why it helps.',
      'Following architecture discussions about efficient attention variants.'
    ],
    avoid: [
      'You will not implement it. This is background for reasoning about cost and capability.'
    ],
    mistakes: [
      'Assuming context cost scales linearly. Attention is quadratic.',
      'Reading attention weights as an explanation of the model’s reasoning — they are an internal mechanism, not a justification.',
      'Believing longer context is free because the API accepts it.'
    ],
    keyTerms: [
      ['attention', 'Weighing all tokens to decide which matter for the current one.'],
      ['query / key / value', 'What a token seeks, offers, and contributes.'],
      ['attention score', 'Dot product of a query and a key, before softmax.'],
      ['multi-head attention', 'Several parallel attention operations tracking different relationships.'],
      ['self-attention', 'Attention within a single sequence.'],
      ['causal mask', 'Prevents a token attending to later tokens; enables left-to-right generation.'],
      ['O(n²)', 'Quadratic scaling with sequence length.'],
      ['KV cache', 'Reusing computed keys and values so earlier tokens are not recomputed.'],
      ['flash attention', 'A memory-efficient implementation; same result, far less memory traffic.']
    ],
    resources: [
      ['Attention Is All You Need (the paper)', 'https://arxiv.org/abs/1706.03762', 'paper'],
      ['The Illustrated Transformer', 'https://jalammar.github.io/illustrated-transformer/', 'tutorial'],
      ['3Blue1Brown — attention in transformers', 'https://www.youtube.com/watch?v=eMlx5fFNoYc', 'video'],
      ['The Annotated Transformer', 'https://nlp.seas.harvard.edu/annotated-transformer/', 'tutorial']
    ],
    questions: [
      ['Why does attention make long contexts expensive?', 'Every token is compared with every other token, so cost is quadratic in sequence length. Doubling the context quadruples the attention computation.'],
      ['What do query, key and value represent?', 'A query is what a token is looking for, a key is what each token offers, and a value is what it contributes. Query-key dot products become the weights applied to values.'],
      ['What does the causal mask do?', 'It prevents a token attending to later tokens, which is what makes generation strictly left-to-right and stops the model seeing the future during training.']
    ]
  },

  {
    id: 'self-attention-qkv',
    title: 'Self-Attention: Queries, Keys & Values',
    domain: 'llm', tier: 3, priority: 'medium',
    summary: 'The three learned projections that make attention work, and how they are used at inference.',
    what: `Self-attention means attention within a single sequence — tokens attending to other tokens in the same text. Each token is projected into three vectors by learned weight matrices: query, key and value.`,
    why: `This is the level of detail at which the **KV cache** makes sense, and the KV cache is the main reason serving long conversations consumes so much GPU memory. It also explains why the first token of a response is slow and the rest are fast.`,
    analogy: `A library conversation. Your **query** is the question you are asking. Every book's **key** is its spine label — what it claims to be about. Its **value** is the actual content you take away. You compare your question against every spine, then read the relevant books in proportion to how well they matched.`,
    technical: `\`Q = X·Wq\`, \`K = X·Wk\`, \`V = X·Wv\` — three learned projections of the same input.

\`Attention(Q,K,V) = softmax(QKᵀ / √dₖ)·V\`. The \`√dₖ\` scaling keeps the dot products from growing so large that softmax saturates.

During autoregressive generation, the keys and values of previous tokens **do not change**. Recomputing them for every new token would be wasteful, so they are stored in the **KV cache**.

KV cache memory ≈ 2 × layers × heads × head_dim × sequence_length × bytes. For a long conversation on a large model this can exceed the size of the weights themselves, and it is why concurrency on a serving GPU is limited.

This also explains the two-phase latency profile: **prefill** (processing the whole prompt, compute-bound, gives you time-to-first-token) then **decode** (one token at a time, memory-bandwidth-bound).`,
    diagram: `
   ONE INPUT, THREE PROJECTIONS

              ┌──► Wq ──► Q  "what am I looking for?"
   token X ───┼──► Wk ──► K  "what do I offer?"
              └──► Wv ──► V  "what do I contribute?"

   Attention = softmax(Q·Kᵀ / √d) · V

   THE KV CACHE

   generating token 1:  compute K,V for all prompt tokens  ── PREFILL
                        (slow, compute-bound → time to first token)
   generating token 2:  reuse cached K,V, compute only the new one
   generating token 3:  reuse cached K,V, compute only the new one
                        (fast, memory-bandwidth-bound → tokens/sec)

   without cache: O(n²) work per token → hopeless
   with cache:    O(n)  work per token

   BUT THE CACHE COSTS MEMORY

     2 × layers × heads × head_dim × seq_len × bytes

     7B model, 8k context, one request   ≈  2 GB
     ...×20 concurrent requests          ≈ 40 GB

   This, not the weights, is usually what limits how many
   simultaneous users one GPU can serve.`,
    example: {
      language: 'python',
      caption: 'Why the KV cache exists, in numbers',
      code: `def kv_cache_gb(layers, heads, head_dim, seq_len, batch=1, bytes_per=2):
    """2 = one tensor for K and one for V."""
    total = 2 * layers * heads * head_dim * seq_len * batch * bytes_per
    return round(total / 1e9, 2)

# Llama-2-7B geometry
CFG = dict(layers=32, heads=32, head_dim=128)

print("one request:")
for seq in [1_000, 4_000, 8_000, 32_000]:
    print(f"  {seq:>6,} tokens -> {kv_cache_gb(seq_len=seq, **CFG):>6} GB")
#   1,000 tokens ->   0.54 GB
#   4,000 tokens ->   2.15 GB
#   8,000 tokens ->   4.29 GB
#  32,000 tokens ->  17.18 GB   <- larger than the 14GB of weights

print("\\n8k context, concurrent users on one 80GB GPU:")
for batch in [1, 4, 8, 16]:
    kv = kv_cache_gb(seq_len=8_000, batch=batch, **CFG)
    print(f"  {batch:>2} users -> KV {kv:>6} GB + weights 14 GB = {kv+14:>6} GB")
#   1 users -> KV   4.29 GB + weights 14 GB =  18.29 GB
#   4 users -> KV  17.18 GB + weights 14 GB =  31.18 GB
#   8 users -> KV  34.36 GB + weights 14 GB =  48.36 GB
#  16 users -> KV  68.72 GB + weights 14 GB =  82.72 GB   <- exceeds the GPU
#
# Concurrency is limited by the KV CACHE, not by the weights.
# Grouped-query attention and paged attention exist to attack exactly this.`
    },
    prereq: ['attention'], next: ['transformers'],
    related: ['latency-throughput', 'ai-latency', 'cpu-vs-gpu-inference'],
    tools: ['vllm', 'transformers'],
    useCases: [
      'Explaining why concurrency on a self-hosted GPU is limited.',
      'Understanding the difference between time-to-first-token and tokens-per-second.',
      'Evaluating whether vLLM-style serving is worth adopting.'
    ],
    avoid: [
      'This depth is only needed when self-hosting or debugging serving performance.'
    ],
    mistakes: [
      'Sizing a serving GPU by weights alone and running out of memory under load.',
      'Confusing prefill latency with decode speed when setting SLOs.',
      'Assuming a longer conversation costs the same memory as a short one.'
    ],
    keyTerms: [
      ['self-attention', 'Attention within one sequence.'],
      ['query / key / value projections', 'Learned matrices Wq, Wk, Wv.'],
      ['scaled dot-product', 'Dividing by √dₖ so softmax does not saturate.'],
      ['KV cache', 'Stored keys and values from previous tokens.'],
      ['prefill', 'Processing the prompt. Compute-bound. Sets time-to-first-token.'],
      ['decode', 'Generating token by token. Memory-bandwidth-bound. Sets tokens/sec.'],
      ['grouped-query attention', 'Sharing keys and values across heads to shrink the cache.'],
      ['paged attention', 'Managing KV cache in pages, as vLLM does, to raise concurrency.']
    ],
    resources: [
      ['Attention Is All You Need', 'https://arxiv.org/abs/1706.03762', 'paper'],
      ['vLLM — paged attention', 'https://docs.vllm.ai/en/latest/design/kernel/paged_attention.html', 'docs'],
      ['Hugging Face — KV cache explained', 'https://huggingface.co/docs/transformers/kv_cache', 'docs'],
      ['The Illustrated Transformer', 'https://jalammar.github.io/illustrated-transformer/', 'tutorial']
    ],
    questions: [
      ['What limits how many concurrent users one serving GPU can handle?', 'Usually the KV cache rather than the weights. Each active conversation holds keys and values for its whole context, and at long contexts that exceeds the model weights themselves.'],
      ['What is the difference between prefill and decode?', 'Prefill processes the whole prompt at once and is compute-bound, determining time-to-first-token. Decode generates one token at a time and is memory-bandwidth-bound, determining tokens per second.'],
      ['Why does the KV cache exist at all?', 'Keys and values for earlier tokens never change during generation, so caching them turns per-token work from quadratic into linear.']
    ]
  },

  {
    id: 'transformers',
    title: 'Transformers',
    domain: 'llm', tier: 2, priority: 'high',
    summary: 'The architecture underneath every modern LLM — stacked attention and feed-forward blocks.',
    what: `A transformer is a stack of identical blocks. Each block does two things: **attention** (let tokens exchange information) and a **feed-forward network** (process each token independently), with normalisation and residual connections around both.

Stack 32 of those, add embeddings at the bottom and a vocabulary projection at the top, and you have an LLM.`,
    why: `Every model you will discuss is this architecture. Knowing its shape makes model cards, architecture comparisons and scaling discussions legible instead of intimidating.`,
    analogy: `An assembly line where every station is identical. At each station the parts first confer with each other (attention), then each is individually refined (feed-forward). Repeat thirty-two times and something complex has been assembled from a simple repeated step.`,
    technical: `Flow: tokens → **embeddings** + **positional information** → N × [attention → add & norm → feed-forward → add & norm] → final norm → projection to vocabulary → logits.

**Residual connections** (adding the input back to the output of each sub-layer) are what make training very deep stacks possible — gradients flow through the additions.

The **feed-forward** layer is typically 4× the model dimension and holds the majority of the parameters. Attention mixes information between tokens; the feed-forward layer does the per-token computation.

Three variants: **encoder-only** (BERT — understanding tasks, embeddings), **decoder-only** (GPT, Claude, Llama — generation; the dominant form), **encoder-decoder** (T5 — translation, seq2seq).

The transformer's decisive advantage over RNNs is parallelism: an RNN must process tokens sequentially, whereas a transformer processes an entire training sequence at once. That is what made training at internet scale feasible.`,
    diagram: `
   INPUT TOKENS
        │
        ▼
   ┌─────────────────┐
   │  EMBEDDINGS     │  token id → vector
   │  + POSITION     │  "where in the sequence am I"
   └────────┬────────┘
            │
   ╔════════▼════════════════════════════════╗
   ║  BLOCK  (repeated N times, e.g. 32)     ║
   ║                                         ║
   ║   ┌──────────────────────┐              ║
   ║   │ MULTI-HEAD ATTENTION │  tokens talk ║
   ║   └──────────┬───────────┘              ║
   ║         (+) ◄┴─── residual              ║
   ║   ┌──────────▼───────────┐              ║
   ║   │ LAYER NORM           │              ║
   ║   └──────────┬───────────┘              ║
   ║   ┌──────────▼───────────┐              ║
   ║   │ FEED-FORWARD (4x)    │  per-token   ║
   ║   └──────────┬───────────┘  compute     ║
   ║         (+) ◄┴─── residual              ║
   ║   ┌──────────▼───────────┐              ║
   ║   │ LAYER NORM           │              ║
   ║   └──────────┬───────────┘              ║
   ╚══════════════┼══════════════════════════╝
                  ▼
        ┌─────────────────────┐
        │ PROJECT TO VOCAB    │  → logits
        └─────────────────────┘

   THREE FAMILIES
     encoder-only     BERT      understanding, embeddings
     decoder-only     GPT/Claude/Llama   generation ← dominant
     encoder-decoder  T5        translation, seq2seq`,
    example: {
      language: 'python',
      caption: 'A transformer block, and where the parameters actually live',
      code: `import torch.nn as nn

class Block(nn.Module):
    """One transformer block. A whole LLM is this, repeated."""
    def __init__(self, d_model=4096, n_heads=32, d_ff=11008):
        super().__init__()
        self.attn = nn.MultiheadAttention(d_model, n_heads, batch_first=True)
        self.ff = nn.Sequential(
            nn.Linear(d_model, d_ff), nn.GELU(), nn.Linear(d_ff, d_model)
        )
        self.n1, self.n2 = nn.LayerNorm(d_model), nn.LayerNorm(d_model)

    def forward(self, x, mask=None):
        a, _ = self.attn(self.n1(x), self.n1(x), self.n1(x), attn_mask=mask)
        x = x + a                          # residual: gradients flow through
        x = x + self.ff(self.n2(x))        # residual again
        return x

# Where do 7 billion parameters actually sit?
d_model, d_ff, n_layers, vocab = 4096, 11008, 32, 32_000

attn_per_layer = 4 * d_model * d_model            # Wq Wk Wv Wo
ff_per_layer   = 2 * d_model * d_ff               # up and down projections
per_layer      = attn_per_layer + ff_per_layer
embeddings     = vocab * d_model * 2              # input + output

print(f"attention / layer   {attn_per_layer/1e6:>8.1f} M")
print(f"feed-forward / layer{ff_per_layer/1e6:>8.1f} M   <- the bulk")
print(f"per layer           {per_layer/1e6:>8.1f} M")
print(f"× {n_layers} layers        {per_layer*n_layers/1e9:>8.2f} B")
print(f"+ embeddings        {embeddings/1e9:>8.2f} B")
print(f"TOTAL               {(per_layer*n_layers+embeddings)/1e9:>8.2f} B")

# attention / layer       67.1 M
# feed-forward / layer    90.2 M   <- the bulk
# per layer              157.3 M
# × 32 layers               5.03 B
# + embeddings              0.26 B
# TOTAL                     5.29 B   ≈ a 7B-class model`
    },
    prereq: ['attention', 'neural-networks'], next: ['positional-encoding', 'encoder-decoder'],
    related: ['what-is-a-model', 'model-families', 'pretraining'],
    tools: ['transformers', 'pytorch', 'huggingface'],
    useCases: [
      'Reading a model card and understanding what the numbers describe.',
      'Following a discussion about architecture choices.',
      'Understanding why transformers displaced RNNs.'
    ],
    avoid: [
      'You will not build one. This is literacy for reading and discussing models.'
    ],
    mistakes: [
      'Assuming attention holds most of the parameters. The feed-forward layers do.',
      'Confusing encoder-only models with generative ones — BERT cannot generate text.',
      'Believing the architecture alone explains capability. Data and scale matter more.'
    ],
    keyTerms: [
      ['transformer block', 'Attention plus feed-forward, with residuals and normalisation.'],
      ['residual connection', 'Adding the input back to a sub-layer’s output; enables deep stacks.'],
      ['layer normalisation', 'Stabilises activations so training converges.'],
      ['feed-forward network', 'Per-token computation; holds most parameters.'],
      ['d_model', 'The width of the model’s internal representation.'],
      ['encoder-only / decoder-only', 'Understanding models versus generative models.'],
      ['parallelism', 'Processing a whole sequence at once — the transformer’s key advantage over RNNs.']
    ],
    resources: [
      ['Attention Is All You Need', 'https://arxiv.org/abs/1706.03762', 'paper'],
      ['The Illustrated Transformer', 'https://jalammar.github.io/illustrated-transformer/', 'tutorial'],
      ['The Annotated Transformer', 'https://nlp.seas.harvard.edu/annotated-transformer/', 'tutorial'],
      ['Karpathy — Let\'s build GPT from scratch', 'https://www.youtube.com/watch?v=kCc8FmEb1nY', 'video'],
      ['Hugging Face — how transformers work', 'https://huggingface.co/learn/nlp-course/chapter1/4', 'course']
    ],
    questions: [
      ['What are the two operations inside a transformer block?', 'Attention, where tokens exchange information, and a feed-forward network, which processes each token independently. Residual connections and normalisation wrap both.'],
      ['Where do most of a model’s parameters live?', 'In the feed-forward layers, not attention. The feed-forward dimension is typically four times the model dimension, so it dominates the parameter count.'],
      ['Why did transformers replace RNNs?', 'Parallelism. An RNN must process tokens one at a time, while a transformer processes an entire training sequence simultaneously, which made training at internet scale feasible.']
    ]
  },

  {
    id: 'positional-encoding',
    title: 'Positional Information',
    domain: 'llm', tier: 3, priority: 'low',
    summary: 'How the model knows word order, given that attention itself has no notion of position.',
    what: `Attention treats its input as a *set*, not a sequence — every token is compared with every other, with no inherent sense of order. Positional information has to be added explicitly, or "dog bites man" and "man bites dog" would be identical to the model.`,
    why: `It explains a real product constraint: context length limits are partly a positional-encoding limit. A model trained with positions up to 8k does not automatically work at 100k, and extending context is a genuine engineering effort rather than a configuration change.`,
    analogy: `A pile of numbered pages. Scatter them on a table and the story is gone — unless each page carries its number. The number is not part of the prose; it is metadata that restores the order.`,
    technical: `Approaches:
- **Sinusoidal** (original transformer) — fixed sine/cosine patterns added to embeddings. No parameters, extrapolates somewhat.
- **Learned absolute** — a trainable vector per position. Hard-capped at the trained maximum.
- **RoPE** (rotary) — rotates query and key vectors by an angle proportional to position, so attention scores depend on *relative* distance. The current standard.
- **ALiBi** — adds a distance-proportional penalty to attention scores. Extrapolates well.

**Context extension** techniques (position interpolation, YaRN, NTK-aware scaling) rescale RoPE frequencies so a model trained at 4k can operate at 32k or beyond, usually with a short fine-tune. This is how "long context" versions of models are produced, and why quality can degrade in the extended range.`,
    diagram: `
   WITHOUT POSITION — attention sees a SET

     {dog, bites, man}  ≡  {man, bites, dog}
     Identical to the model. Meaning destroyed.

   WITH POSITION

     dog(1)  bites(2)  man(3)   ≠   man(1)  bites(2)  dog(3)

   THE APPROACHES

   SINUSOIDAL   fixed waves added to embeddings
                no parameters, some extrapolation

   LEARNED      one trained vector per position
                hard ceiling at the trained maximum

   RoPE         rotate Q and K by an angle ∝ position
                ↺                                    ← current standard
                attention score then depends on
                RELATIVE distance, not absolute index

   ALiBi        subtract a penalty ∝ distance from attention scores
                extrapolates naturally

   WHY CONTEXT EXTENSION IS REAL WORK

     trained at 4k ──► used at 32k
     positions 4k-32k were NEVER SEEN during training
     → rescale RoPE frequencies (position interpolation / YaRN)
     → short fine-tune to adapt
     → quality in the extended range is usually somewhat worse

   "Long context" is an engineering result, not a config flag.`,
    example: {
      language: 'python',
      caption: 'RoPE makes attention depend on relative distance',
      code: `import numpy as np

def rope(vec, position, base=10000.0):
    """Rotate pairs of dimensions by an angle proportional to position."""
    d = len(vec)
    out = vec.astype(float).copy()
    for i in range(0, d, 2):
        theta = position / (base ** (i / d))
        c, s = np.cos(theta), np.sin(theta)
        out[i], out[i+1] = vec[i]*c - vec[i+1]*s, vec[i]*s + vec[i+1]*c
    return out

rng = np.random.default_rng(0)
q = rng.normal(size=8)
k = rng.normal(size=8)

# The same pair of tokens, at different absolute positions but the
# SAME distance apart, produces the same attention score.
for (pq, pk) in [(0, 3), (10, 13), (100, 103)]:
    score = rope(q, pq) @ rope(k, pk)
    print(f"positions {pq:>3} and {pk:>3} (distance 3) -> score {score:+.4f}")

# positions   0 and   3 (distance 3) -> score -1.4472
# positions  10 and  13 (distance 3) -> score -1.4472
# positions 100 and 103 (distance 3) -> score -1.4472
#
# Absolute position is irrelevant; only the gap matters.
# That relative property is what lets RoPE generalise beyond
# the exact positions seen during training — up to a point.`
    },
    prereq: ['transformers'], next: [],
    related: ['context-window', 'long-context-problems'],
    tools: ['transformers'],
    useCases: [
      'Understanding why a model’s context limit is a real constraint, not a setting.',
      'Interpreting "long context" variants of a model and their quality caveats.'
    ],
    avoid: [
      'Only relevant when evaluating long-context claims or self-hosting.'
    ],
    mistakes: [
      'Assuming context length can be raised by changing a parameter.',
      'Trusting benchmark context length without checking quality across the full range.',
      'Ignoring that an extended-context variant may perform worse in its extended region.'
    ],
    keyTerms: [
      ['positional encoding', 'Information about token order, added explicitly.'],
      ['sinusoidal encoding', 'Fixed sine/cosine patterns from the original transformer.'],
      ['RoPE', 'Rotary position embedding; attention depends on relative distance. Current standard.'],
      ['ALiBi', 'Distance-proportional attention penalty; extrapolates naturally.'],
      ['position interpolation', 'Rescaling positions so a model works beyond its trained length.'],
      ['YaRN / NTK scaling', 'Refined context-extension methods.'],
      ['extrapolation', 'Operating beyond the positions seen during training.']
    ],
    resources: [
      ['RoFormer — rotary position embedding (paper)', 'https://arxiv.org/abs/2104.09864', 'paper'],
      ['ALiBi — train short, test long (paper)', 'https://arxiv.org/abs/2108.12409', 'paper'],
      ['YaRN — efficient context window extension (paper)', 'https://arxiv.org/abs/2309.00071', 'paper'],
      ['EleutherAI — rotary embeddings explained', 'https://blog.eleuther.ai/rotary-embeddings/', 'tutorial']
    ],
    questions: [
      ['Why is positional information needed at all?', 'Attention compares every token with every other with no inherent notion of order, so without explicit position "dog bites man" and "man bites dog" would be indistinguishable.'],
      ['What makes RoPE the current standard?', 'It rotates queries and keys by an angle proportional to position, so attention scores depend on relative distance rather than absolute index, which generalises better beyond trained positions.'],
      ['Why can context length not simply be increased in configuration?', 'Positions beyond the trained range were never seen during training. Extending requires rescaling position frequencies and usually a fine-tune, and quality in the extended range typically degrades.']
    ]
  },

  {
    id: 'encoder-decoder',
    title: 'Encoder, Decoder & Encoder-Decoder',
    domain: 'llm', tier: 3, priority: 'low',
    summary: 'Three architectural shapes for three different jobs.',
    what: `**Encoder-only** models read a whole input at once and produce a representation — good for understanding and embeddings. **Decoder-only** models generate text left to right. **Encoder-decoder** models read one sequence and generate another.`,
    why: `It explains why you cannot use BERT to write text and why an embedding model is not a chat model. Choosing the wrong family for a task is a common and confusing mistake.`,
    analogy: `Three jobs at a publisher. The **reader** absorbs a manuscript and writes a summary judgement (encoder). The **writer** produces prose one sentence at a time (decoder). The **translator** reads a whole book, then writes a whole new one (encoder-decoder).`,
    technical: `**Encoder-only** (BERT, and most embedding models) use bidirectional attention — every token sees every other, including those after it. That is ideal for understanding and useless for generation, because generation must not see the future.

**Decoder-only** (GPT, Claude, Llama, Mistral) use causal masked attention: each token sees only earlier tokens. This is the dominant family, because next-token prediction on raw text turns out to be a remarkably general training objective.

**Encoder-decoder** (T5, BART, most translation models) encode the source bidirectionally, then decode with cross-attention into the encoded representation. Strong for transformation tasks with a clear input and output.

Practically: use decoder-only for generation and chat, encoder-only for embeddings and classification. If a task feels like "understand this", an encoder is often cheaper and better than an LLM.`,
    diagram: `
   ENCODER-ONLY (BERT)          bidirectional attention
   ┌───────────────────┐        every token sees every token
   │ The cat sat here  │
   └────────┬──────────┘        USE FOR
            ▼                     embeddings
     [representation]             classification
                                  reranking
   cannot generate text           extractive QA


   DECODER-ONLY (GPT, Claude, Llama)   causal attention
   ┌───────────────────┐               each token sees only earlier ones
   │ The cat sat ▮     │
   └────────┬──────────┘        USE FOR
            ▼                     chat, generation
       "on the mat"               summarisation, code
                                  ← the dominant family


   ENCODER-DECODER (T5, translation)
   ┌───────────────┐      ┌────────────────┐
   │ ENCODER       │─────►│ DECODER        │  cross-attention
   │ "le chat"     │      │ "the cat"      │
   └───────────────┘      └────────────────┘
   read all of A, then write all of B

   PICKING WRONG IS A REAL MISTAKE
     "classify these 100,000 tickets"
       encoder model:  milliseconds each, pennies total
       LLM per ticket: seconds each, hundreds of dollars`,
    example: {
      language: 'python',
      caption: 'The right family for the job — and the cost difference',
      code: `# ENCODER-ONLY: understanding. Fast, cheap, runs locally.
from sentence_transformers import SentenceTransformer
encoder = SentenceTransformer('all-MiniLM-L6-v2')     # 22M params
vec = encoder.encode("How do I reset my password?")
print(vec.shape)          # (384,)  a representation, not text
# Cannot generate. Was never trained to.

# DECODER-ONLY: generation.
# response = client.messages.create(model="claude-sonnet-5", ...)
# Produces text token by token.

# THE COST DIFFERENCE FOR A CLASSIFICATION JOB
tickets = 100_000

# (a) encoder model, locally
#     ~2 ms each on CPU -> ~3 minutes, $0
# (b) LLM per ticket
LLM_TOKENS_IN, LLM_TOKENS_OUT = 320, 12
cost = tickets * (LLM_TOKENS_IN * 3.00 + LLM_TOKENS_OUT * 15.00) / 1_000_000
print(f"LLM classification of {tickets:,} tickets: \${cost:,.2f}")
# LLM classification of 100,000 tickets: $114.00
#   ...plus hours of wall-clock time and a rate limit to negotiate.
#
# The LLM earns its place when the categories are not known in
# advance or the reasoning is genuinely open-ended. For a fixed
# label set, the encoder wins decisively.`
    },
    prereq: ['transformers'], next: ['autoregressive-generation'],
    related: ['what-are-embeddings', 'reranking', 'model-families'],
    tools: ['transformers', 'sentence-transformers', 'huggingface'],
    useCases: [
      'Choosing an embedding model rather than an LLM for classification at volume.',
      'Understanding why a reranker is a different kind of model.',
      'Reading a model card and knowing what the model can do.'
    ],
    avoid: [
      'Using a decoder-only LLM for high-volume fixed-label classification.',
      'Expecting an embedding model to produce text.'
    ],
    mistakes: [
      'Trying to generate text with BERT.',
      'Paying LLM prices for a task an encoder does better and thousands of times cheaper.',
      'Assuming any model on Hugging Face can chat.'
    ],
    keyTerms: [
      ['encoder', 'Reads a whole input bidirectionally to produce a representation.'],
      ['decoder', 'Generates output left to right with causal attention.'],
      ['cross-attention', 'Decoder attending to the encoder’s representation.'],
      ['bidirectional attention', 'Every token sees every other, including later ones.'],
      ['causal attention', 'Each token sees only earlier tokens.'],
      ['seq2seq', 'Sequence-to-sequence tasks such as translation.'],
      ['BERT / T5 / GPT', 'Canonical encoder-only, encoder-decoder and decoder-only models.']
    ],
    resources: [
      ['Hugging Face — transformer model families', 'https://huggingface.co/learn/nlp-course/chapter1/4', 'course'],
      ['BERT (paper)', 'https://arxiv.org/abs/1810.04805', 'paper'],
      ['T5 — exploring transfer learning (paper)', 'https://arxiv.org/abs/1910.10683', 'paper'],
      ['Sentence Transformers documentation', 'https://www.sbert.net/', 'docs']
    ],
    questions: [
      ['Why can BERT not generate text?', 'It uses bidirectional attention, so every token sees every other including later ones. Generation requires that a token cannot see the future, which is what causal masking provides.'],
      ['When should you use an encoder model instead of an LLM?', 'For fixed-label classification, embeddings and reranking at volume. It is orders of magnitude cheaper and faster, and usually more accurate for a known label set.'],
      ['What is cross-attention?', 'The decoder attending to the encoder’s representation of the input, which is how encoder-decoder models condition generation on a source sequence.']
    ]
  },

  {
    id: 'autoregressive-generation',
    title: 'Autoregressive Generation',
    domain: 'llm', tier: 2, priority: 'high',
    summary: 'One token at a time, each one fed back in — which explains nearly every LLM behaviour.',
    what: `An LLM generates by predicting one token, appending it to the input, and predicting the next. It repeats until it emits a stop token or hits the length limit.

It never plans the whole answer in advance. It commits to one token at a time.`,
    why: `This single mechanism explains an enormous amount: why latency scales with output length, why output tokens cost more, why streaming feels faster, why the model cannot revise something it already said, and why an early mistake propagates through the rest of the answer.`,
    analogy: `Speaking without being able to pause or retract. Each word must follow sensibly from what you have already said. If you started a sentence badly, you cannot unsay it — you can only continue as plausibly as possible.`,
    technical: `Each step is a full forward pass through the model. Generating 500 tokens means 500 forward passes, which is why output is charged at several times the input rate and why latency grows linearly with output length.

**Time to first token (TTFT)** is dominated by prefill — processing the whole prompt. **Tokens per second** thereafter is dominated by memory bandwidth during decode. These are separate metrics and should have separate SLOs.

**Streaming** returns tokens as they are produced. It does not change total latency, but it changes perceived latency dramatically, and it is nearly always worth implementing.

**Error propagation**: once a wrong token is emitted it becomes part of the context conditioning everything after it. The model will build consistently on its own mistake, which is a major reason hallucinations arrive as coherent paragraphs rather than isolated slips.

**Speculative decoding** uses a small draft model to propose several tokens that the large model verifies in one pass — a real speedup with identical output.`,
    diagram: `
   PROMPT: "The capital of France is"

   step 1  [The capital of France is]                → " Paris"
   step 2  [The capital of France is Paris]          → ","
   step 3  [The capital of France is Paris,]         → " a"
   step 4  [The capital of France is Paris, a]       → " city"
   ...
   step N  [...........................]             → <stop>

   EVERY STEP IS A FULL FORWARD PASS.
   500 output tokens = 500 forward passes.

   ┌──────────── PREFILL ────────────┬──── DECODE ────────────┐
   │ process the entire prompt once  │ one token at a time    │
   │ compute-bound                   │ memory-bandwidth-bound │
   │ → TIME TO FIRST TOKEN           │ → TOKENS PER SECOND    │
   └─────────────────────────────────┴────────────────────────┘

   WHY AN EARLY MISTAKE BECOMES A PARAGRAPH

     step 12 emits a wrong company name
        ↓
     it is now in the context
        ↓
     every later token is conditioned on it
        ↓
     the model elaborates CONSISTENTLY on its own error

   The model cannot go back. There is no revision step.
   This is why hallucinations are coherent rather than obviously broken.`,
    example: {
      language: 'python',
      caption: 'The generation loop, and why streaming matters so much',
      code: `def generate(model, prompt_ids, max_new=200, stop_id=None):
    """The entire inference loop. Everything else is optimisation."""
    ids = list(prompt_ids)
    cache = None

    for _ in range(max_new):
        logits, cache = model.forward(ids[-1:] if cache else ids, cache)
        next_id = sample(logits[-1])          # one token
        ids.append(next_id)                   # feed it back in
        yield next_id                         # stream it out
        if next_id == stop_id:
            break

# LATENCY MATH
TTFT_MS = 420          # prefill: depends on PROMPT length
TPS     = 55           # decode:  tokens per second

for out_tokens in [50, 200, 800]:
    total = TTFT_MS/1000 + out_tokens / TPS
    print(f"{out_tokens:>4} output tokens -> "
          f"first token {TTFT_MS/1000:.2f}s, complete {total:.1f}s")

#   50 output tokens -> first token 0.42s, complete 1.3s
#  200 output tokens -> first token 0.42s, complete 4.1s
#  800 output tokens -> first token 0.42s, complete 15.0s
#
# WITHOUT streaming, the user waits 15 seconds staring at nothing.
# WITH streaming, they see text after 0.42s and read while it arrives.
# Identical total latency. Completely different product.
#
# Which is why "shorter answers" is a latency lever: capping
# max_tokens and instructing brevity cuts wall-clock time directly.`
    },
    prereq: ['temperature-sampling', 'self-attention-qkv'], next: ['next-token-prediction'],
    related: ['ai-latency', 'inference-llm', 'hallucination', 'chain-of-thought'],
    tools: ['anthropic', 'openai', 'ollama', 'vllm'],
    useCases: [
      'Designing a streaming UI so perceived latency is acceptable.',
      'Explaining why long answers cost and take disproportionately more.',
      'Understanding why an early error contaminates a whole response.'
    ],
    avoid: [
      'Blocking UIs that wait for a complete response before showing anything.',
      'Assuming the model can revise earlier output within one response.'
    ],
    mistakes: [
      'Not streaming, and shipping a feature that feels broken at 15 seconds.',
      'Setting a latency SLO without separating time-to-first-token from total time.',
      'Expecting the model to self-correct mid-answer without an explicit second pass.',
      'Forgetting that capping output length is one of the most effective latency levers available.'
    ],
    keyTerms: [
      ['autoregressive', 'Each output token is conditioned on all previous tokens.'],
      ['forward pass', 'One complete run through the model; one per generated token.'],
      ['time to first token', 'Latency until the first token appears. Driven by prefill.'],
      ['tokens per second', 'Generation throughput during decode.'],
      ['streaming', 'Delivering tokens as produced. Changes perceived, not total, latency.'],
      ['stop sequence', 'A token or string that ends generation.'],
      ['error propagation', 'An early wrong token conditioning everything that follows.'],
      ['speculative decoding', 'A draft model proposes tokens the main model verifies in bulk.']
    ],
    resources: [
      ['Hugging Face — text generation strategies', 'https://huggingface.co/docs/transformers/generation_strategies', 'docs'],
      ['Anthropic — streaming messages', 'https://docs.anthropic.com/en/api/streaming', 'docs'],
      ['Hugging Face — LLM inference optimisation', 'https://huggingface.co/docs/transformers/llm_optims', 'docs'],
      ['Speculative decoding (paper)', 'https://arxiv.org/abs/2211.17192', 'paper']
    ],
    questions: [
      ['Why do output tokens cost more than input tokens?', 'Each output token requires a full forward pass through the model, whereas the entire input is processed in a single batched prefill pass.'],
      ['Does streaming reduce latency?', 'It does not change total latency at all, but it changes perceived latency enormously — the user sees text in under half a second instead of staring at nothing for fifteen seconds.'],
      ['Why do hallucinations come out as coherent paragraphs?', 'Once a wrong token is emitted it becomes part of the context, so everything after it is conditioned on the error. The model elaborates consistently on its own mistake and cannot revise.']
    ]
  },

  {
    id: 'next-token-prediction',
    title: 'Next-Token Prediction',
    domain: 'llm', tier: 2, priority: 'high',
    summary: 'The single training objective that produced everything LLMs can do.',
    what: `Pretraining an LLM consists of one task repeated trillions of times: given some text, predict the next token. That is the entire objective.

Everything else — translation, summarisation, code generation, apparent reasoning — emerged from doing that one task well at scale.`,
    why: `It is the most important thing to understand about LLMs, because it explains both their power and their limits. The model was optimised to produce *plausible continuations*, never to be *truthful*. Hallucination is not a bug in the objective; it is the objective working exactly as specified.`,
    analogy: `Someone who has read a colossal library and become extraordinarily good at finishing any sentence in the style it was going. Ask them about something the library never covered and they will still finish the sentence — fluently, confidently, and possibly inventing it.`,
    technical: `Training: take a document, mask each position's future, ask the model to predict each next token, compute cross-entropy loss against the actual token, update weights. Because every position provides a training signal, one document yields thousands of examples.

The remarkable empirical result is that to predict text well at scale, the model must implicitly learn grammar, facts, translation, code structure and a great deal of reasoning-shaped behaviour — because all of those are needed to predict text written by people doing those things.

The limits follow just as directly:
- There is **no truth term** in the loss. Plausible and true are not distinguished.
- Knowledge is **frozen** at the training cutoff.
- The model has **no access to its own uncertainty** in a calibrated way.
- It optimises for what *sounds like* good text, which is why it can produce confident nonsense in unfamiliar territory.`,
    diagram: `
   ONE DOCUMENT → THOUSANDS OF TRAINING EXAMPLES

     "The mitochondria is the powerhouse of the cell"

     input                              → target
     "The"                              → " mitochondria"
     "The mitochondria"                 → " is"
     "The mitochondria is"              → " the"
     "The mitochondria is the"          → " powerhouse"
     ...

   loss = cross-entropy(predicted distribution, actual token)

   WHAT EMERGES FROM THIS ONE TASK

     to predict text well you must implicitly learn
       grammar · facts · translation · code · style ·
       arithmetic-shaped patterns · dialogue structure

   WHAT DOES NOT EMERGE

     ✗ a notion of truth      — no truth term in the loss
     ✗ calibrated uncertainty — never trained to say "I don't know"
     ✗ current knowledge      — frozen at the cutoff
     ✗ verification           — nothing checks the output

   ⚠ THE MODEL IS OPTIMISED FOR PLAUSIBILITY, NOT ACCURACY.
     Those coincide most of the time, which is exactly what makes
     the exceptions so dangerous.`,
    example: {
      language: 'python',
      caption: 'The pretraining objective, and the gap it leaves behind',
      code: `import numpy as np

def training_step(model, token_ids):
    """Every position in the document is a training example."""
    total_loss = 0.0
    for i in range(1, len(token_ids)):
        context = token_ids[:i]
        target  = token_ids[i]

        probs = model.predict_next(context)      # distribution over vocab
        total_loss += -np.log(probs[target] + 1e-12)   # cross-entropy

        # NOTE what is absent:
        #   no check that the sequence is FACTUALLY TRUE
        #   no penalty for confident fabrication
        #   no reward for admitting ignorance
    return total_loss / (len(token_ids) - 1)

# THE CONSEQUENCE, CONCRETELY
#
#   prompt:  "The 2027 Nobel Prize in Physics was awarded to"
#
#   The model has never seen 2027. But it has seen thousands of
#   sentences of exactly this shape. So it produces a fluent,
#   grammatical, entirely fabricated name — with high token
#   probability, because the CONTINUATION is plausible.
#
#   Nothing in the training objective distinguishes
#     "plausible continuation"  from  "true statement".
#
# WHICH IS WHY GROUNDING MUST BE ADDED FROM OUTSIDE:
#   retrieval  → put the real facts in the context
#   citations  → make each claim checkable
#   evaluation → measure groundedness and block failures
#   tools      → delegate arithmetic and lookup to things that verify`
    },
    prereq: ['logits-and-softmax', 'autoregressive-generation'], next: ['pretraining', 'hallucination'],
    related: ['why-rag', 'groundedness', 'knowledge-cutoff', 'loss-functions'],
    tools: ['transformers'],
    useCases: [
      'Explaining hallucination to a stakeholder in one sentence.',
      'Justifying why retrieval and citations are architectural requirements, not polish.',
      'Setting realistic expectations about what a model can be trusted to do unaided.'
    ],
    avoid: [
      'Relying on the model alone for factual accuracy in any consequential context.',
      'Expecting the model to reliably know what it does not know.'
    ],
    mistakes: [
      'Believing better prompting can eliminate hallucination. It reduces it; only grounding and verification address it structurally.',
      'Treating fluency as evidence of correctness.',
      'Assuming the model has any concept of the current date or recent events.'
    ],
    keyTerms: [
      ['next-token prediction', 'The pretraining objective: predict the following token.'],
      ['cross-entropy loss', 'Penalty for assigning low probability to the actual next token.'],
      ['self-supervised', 'Labels come from the data itself — the next token — so no human labelling is needed.'],
      ['emergent capability', 'Behaviour not explicitly trained that appears with scale.'],
      ['knowledge cutoff', 'The date after which the model has seen nothing.'],
      ['plausibility vs truth', 'The objective optimises the former; only external grounding provides the latter.'],
      ['perplexity', 'How surprised the model is by text. The standard pretraining metric.']
    ],
    resources: [
      ['Karpathy — intro to LLMs', 'https://www.youtube.com/watch?v=zjkBMFhNj_g', 'video'],
      ['Language Models are Few-Shot Learners (GPT-3 paper)', 'https://arxiv.org/abs/2005.14165', 'paper'],
      ['Anthropic — reduce hallucinations', 'https://docs.anthropic.com/en/docs/test-and-evaluate/strengthen-guardrails/reduce-hallucinations', 'docs'],
      ['Hugging Face — causal language modeling', 'https://huggingface.co/docs/transformers/tasks/language_modeling', 'docs']
    ],
    questions: [
      ['What is the entire pretraining objective of an LLM?', 'Predict the next token, repeated across trillions of tokens. Every other capability emerged from doing that one task well at scale.'],
      ['Why does next-token prediction produce hallucination?', 'There is no truth term in the loss. The model is rewarded for plausible continuations, and a fabricated but plausible continuation scores exactly as well as a true one.'],
      ['If the objective cannot produce truthfulness, where does grounding come from?', 'From outside the model: retrieval that puts real facts in the context, citations that make claims checkable, tools that verify, and evaluation gates that block ungrounded answers.']
    ],
    interview: {
      s30: 'An LLM is trained on one task: predict the next token. Everything it can do emerged from doing that extremely well at scale — and so did its limitations.',
      s90: 'The objective explains both halves of the model. To predict text well you have to implicitly learn grammar, facts, translation, code structure and a lot of reasoning-shaped behaviour, because all of those appear in the text you are predicting. But notice what is not in the loss function: there is no truth term. The model is never penalised for a confident fabrication and never rewarded for saying "I do not know". So when you ask about something outside its training data, it still produces a fluent, high-probability continuation — because the continuation is plausible, and plausible is what it optimises. That is why I treat grounding as architecture rather than polish: retrieval puts real facts in the context, citations make claims checkable, and an evaluation gate blocks answers that are not supported.',
      pm: 'It reframes hallucination from "a bug someone should fix" into "a property of the objective we design around", which changes what we build and what we promise.'
    }
  },

  {
    id: 'pretraining',
    title: 'Pretraining',
    domain: 'llm', tier: 2, priority: 'high',
    summary: 'The enormous, expensive first phase that produces a base model.',
    what: `Pretraining runs next-token prediction over trillions of tokens of text, from random initial weights, for weeks or months on thousands of GPUs. The output is a **base model**.

A base model is good at continuing text and bad at following instructions. It is raw capability, not a usable assistant.`,
    why: `It explains the knowledge cutoff, why frontier models come from a handful of organisations, why the base/instruct distinction on Hugging Face matters, and why your options are to use a pretrained model or use a pretrained model. Nobody in a product role pretrains.`,
    analogy: `A decade of omnivorous reading before any professional training. Enormous general knowledge and no idea how to behave in a meeting. The reading is pretraining; learning to answer the question actually asked comes later.`,
    technical: `Data: filtered web crawl, books, code, academic text — trillions of tokens, deduplicated and quality-filtered. Data curation is now a larger differentiator than architecture.

Cost: tens to hundreds of millions of dollars for a frontier run. **Scaling laws** (Kaplan, then Chinchilla) relate loss to parameters, data and compute, and Chinchilla notably showed most models were undertrained — more data on fewer parameters beats the reverse.

The result is a **base** or **foundation** model. It completes text. Ask it a question and it may well continue with more questions, because that is what a list of questions looks like in the training data.

Turning it into an assistant requires **instruction tuning** and **preference tuning**, which are tiny in comparison — thousands of examples against trillions of tokens.`,
    diagram: `
   THE FULL PIPELINE — note the relative sizes

   ┌──────────────────────────────────────────────────┐
   │ PRETRAINING                                      │
   │ trillions of tokens · weeks · thousands of GPUs  │
   │ $10M - $100M+                                    │
   └──────────────────────┬───────────────────────────┘
                          ▼
                    BASE MODEL
             completes text · does not follow instructions
                          │
   ┌──────────────────────▼───────────────────────────┐
   │ INSTRUCTION TUNING     thousands of examples     │
   └──────────────────────┬───────────────────────────┘
                          ▼
   ┌──────────────────────▼───────────────────────────┐
   │ PREFERENCE TUNING (RLHF/DPO)                     │
   └──────────────────────┬───────────────────────────┘
                          ▼
                    CHAT MODEL   ← what you actually call

   BASE vs INSTRUCT — what you get

     prompt: "What is RAG?"

     BASE:     "What is a vector database? What is chunking?
                What is reranking?"        ← continuing a QUESTION LIST
     INSTRUCT: "RAG stands for retrieval-augmented generation..."

   Downloading the base variant by mistake is a common and
   very confusing first experience with open models.`,
    example: {
      intro: `Scaling laws, and why the answer to "should we pretrain?" is always no:`,
      language: 'python',
      caption: 'The build-versus-use arithmetic',
      code: `# Chinchilla-optimal: roughly 20 training tokens per parameter
def chinchilla_tokens(params_billions):
    return params_billions * 20         # in billions of tokens

for p in [7, 13, 70]:
    print(f"{p:>3}B params -> ~{chinchilla_tokens(p):,.0f}B tokens to train well")
#   7B params -> ~140B tokens
#  13B params -> ~260B tokens
#  70B params -> ~1,400B tokens

# Very rough cost of a 7B pretrain
GPU_HOURS   = 180_000          # order of magnitude
COST_PER_HR = 2.50             # cloud A100/H100-class
print(f"\\n7B pretrain ≈ \${GPU_HOURS * COST_PER_HR:,.0f}")
# 7B pretrain ≈ $450,000        ...for a model that is already free.

# Versus the realistic options
print("\\nWhat you will actually do:")
print("  use an API model            $0 upfront, per-token cost")
print("  download an open model      $0, run it yourself")
print("  fine-tune an open model     $50-$5,000 with LoRA")
print("  continued pretraining       $10k-$500k  (rare, domain corpora)")
print("  pretrain from scratch       do not")`
    },
    prereq: ['next-token-prediction'], next: ['instruction-tuning', 'knowledge-cutoff'],
    related: ['foundation-vs-instruct', 'continued-pretraining', 'model-families'],
    tools: ['huggingface', 'pytorch'],
    useCases: [
      'Understanding why the knowledge cutoff exists and cannot be nudged.',
      'Choosing between base and instruct variants correctly.',
      'Explaining why pretraining is never the answer to a product problem.'
    ],
    avoid: [
      'Pretraining from scratch. Effectively never justified outside a frontier lab.',
      'Using a base model where an instruct model is needed.'
    ],
    mistakes: [
      'Downloading the base variant and concluding the model is broken.',
      'Believing more parameters is the main driver — data quality and quantity matter at least as much.',
      'Assuming pretraining can be topped up with recent news. That is continued pretraining, and it is expensive and risky.'
    ],
    keyTerms: [
      ['pretraining', 'The initial large-scale next-token training run.'],
      ['base model', 'The direct output of pretraining. Completes text.'],
      ['foundation model', 'A large pretrained model intended to be adapted.'],
      ['scaling laws', 'Empirical relationships between compute, data, parameters and loss.'],
      ['Chinchilla-optimal', 'Roughly 20 training tokens per parameter.'],
      ['knowledge cutoff', 'The date beyond which the model has seen nothing.'],
      ['data curation', 'Filtering and deduplicating the corpus. Now a leading differentiator.'],
      ['compute budget', 'Total FLOPs available for the run.']
    ],
    resources: [
      ['Chinchilla — training compute-optimal LLMs', 'https://arxiv.org/abs/2203.15556', 'paper'],
      ['Scaling Laws for Neural Language Models', 'https://arxiv.org/abs/2001.08361', 'paper'],
      ['Karpathy — intro to large language models', 'https://www.youtube.com/watch?v=zjkBMFhNj_g', 'video'],
      ['Hugging Face — the base vs instruct distinction', 'https://huggingface.co/docs/transformers/llm_tutorial', 'docs']
    ],
    questions: [
      ['What is a base model and why is it not usable as an assistant?', 'It is the raw output of pretraining. It completes text rather than following instructions, so asking it a question may produce more questions, because that is what a question list looks like in its training data.'],
      ['What did Chinchilla change?', 'It showed most models were undertrained. For a given compute budget, roughly twenty tokens per parameter is optimal, so more data on fewer parameters beats more parameters on less data.'],
      ['Can you add recent knowledge by pretraining more?', 'That is continued pretraining. It is expensive, risks catastrophic forgetting, and for keeping information current, retrieval is dramatically cheaper and more controllable.']
    ]
  },

  {
    id: 'instruction-tuning',
    title: 'Instruction Tuning',
    domain: 'llm', tier: 2, priority: 'high',
    summary: 'Teaching a base model to answer the question rather than continue the text.',
    what: `Instruction tuning fine-tunes a base model on thousands of (instruction, good response) pairs. The model learns the *format* of being helpful: read the request, produce an appropriate answer, stop.`,
    why: `It is the step that turns raw capability into a usable product. And it is small — thousands of examples against trillions of pretraining tokens — which is why open-weight models can be turned into competent assistants by relatively modest teams.`,
    analogy: `Someone extraordinarily well read who has never been in a professional conversation. Instruction tuning is the induction week: when asked a question, answer *that* question, at appropriate length, and stop talking.`,
    technical: `Also called **supervised fine-tuning (SFT)**. Data is (prompt, ideal response) pairs, either human-written or generated and filtered.

Training uses the same next-token objective, but the loss is applied only to the *response* tokens — the model is not trained to predict the user's message.

A **chat template** is introduced: special tokens marking system, user and assistant turns. Using the wrong template for a model is a very common source of poor output from open models.

Instruction tuning teaches **form**, not new facts. It does not add knowledge, and trying to inject facts this way tends to produce confident, well-formatted wrongness.

It is followed by **preference tuning** (RLHF or DPO), which refines *which* of several acceptable answers is preferred.`,
    diagram: `
   BASE MODEL                      INSTRUCTION-TUNED MODEL

   prompt: "Explain RAG."          prompt: "Explain RAG."

   "Explain vector search.          "RAG stands for retrieval-
    Explain chunking.                augmented generation. It
    Explain reranking.               works by retrieving relevant
    Explain..."                      documents and supplying them
                                     to the model as context..."
   continuing a LIST               answering the QUESTION

   TRAINING DATA — thousands of pairs, not trillions

     { "instruction": "Summarise this in two sentences: ...",
       "response":    "..." }
     { "instruction": "Write a SQL query that ...",
       "response":    "SELECT ..." }

   loss applied ONLY to the response tokens ────┘

   THE CHAT TEMPLATE

     <|system|>You are a helpful assistant.<|end|>
     <|user|>Explain RAG.<|end|>
     <|assistant|>

   Every model family has its own. Using the WRONG one is a
   top cause of "this open model is terrible" — it usually is not.

   ⚠ TEACHES FORM, NOT FACTS.
     Fine-tuning on 500 company Q&A pairs makes the model
     SOUND like your documentation. It does not make it KNOW it.`,
    example: {
      language: 'python',
      caption: 'Instruction data, the chat template, and the mistake people make',
      code: `# Instruction-tuning data — the shape that matters
examples = [
    {"instruction": "Summarise this support ticket in one line.",
     "input":  "Customer cannot log in after password reset...",
     "output": "Login fails following password reset on mobile."},
    {"instruction": "Classify the sentiment. Answer only: positive/negative.",
     "input":  "The new dashboard is confusing and slow.",
     "output": "negative"},
]

# The chat template is model-specific — always get it from the tokenizer
from transformers import AutoTokenizer
tok = AutoTokenizer.from_pretrained("meta-llama/Llama-3.1-8B-Instruct")

messages = [
    {"role": "system", "content": "You answer only from the given context."},
    {"role": "user",   "content": "What is our refund window?"},
]
prompt = tok.apply_chat_template(messages, tokenize=False,
                                 add_generation_prompt=True)
print(prompt)
# <|begin_of_text|><|start_header_id|>system<|end_header_id|>
# You answer only from the given context.<|eot_id|>
# <|start_header_id|>user<|end_header_id|>
# What is our refund window?<|eot_id|>
# <|start_header_id|>assistant<|end_header_id|>

# THE COMMON MISTAKE
#   "Fine-tune on 500 of our support Q&As so it knows our policies."
#
#   Result: the model reproduces your TONE and FORMAT convincingly,
#   and invents policy details with total confidence — because
#   instruction tuning taught it how to sound, not what is true.
#
#   For knowledge, use RAG. For behaviour, use fine-tuning.`
    },
    prereq: ['pretraining'], next: ['rlhf-preference'],
    related: ['supervised-fine-tuning', 'system-prompts', 'foundation-vs-instruct', 'rag-vs-finetuning'],
    tools: ['huggingface', 'transformers'],
    useCases: [
      'Understanding what separates a base model from a chat model.',
      'Diagnosing poor open-model output caused by a wrong chat template.',
      'Deciding correctly between fine-tuning and RAG.'
    ],
    avoid: [
      'Using it to inject factual knowledge. That is what retrieval is for.',
      'Fine-tuning before prompt engineering and RAG have been exhausted.'
    ],
    mistakes: [
      'Applying the wrong chat template and blaming the model.',
      'Expecting instruction tuning to add facts.',
      'Training on too few examples for too many epochs, causing memorisation and loss of general ability.',
      'Not holding out an evaluation set, so improvement cannot be demonstrated.'
    ],
    keyTerms: [
      ['instruction tuning', 'Fine-tuning on instruction–response pairs.'],
      ['SFT', 'Supervised fine-tuning. The same thing, technically framed.'],
      ['chat template', 'The model-specific token format marking conversational turns.'],
      ['response-only loss', 'Training on the assistant’s tokens, not the user’s.'],
      ['instruct model', 'A model that has been instruction-tuned.'],
      ['alignment', 'The broader process of making a model helpful, honest and harmless.']
    ],
    resources: [
      ['Hugging Face — chat templates', 'https://huggingface.co/docs/transformers/chat_templating', 'docs'],
      ['InstructGPT — training language models to follow instructions', 'https://arxiv.org/abs/2203.02155', 'paper'],
      ['Hugging Face — supervised fine-tuning trainer', 'https://huggingface.co/docs/trl/sft_trainer', 'docs'],
      ['Self-Instruct (paper)', 'https://arxiv.org/abs/2212.10560', 'paper']
    ],
    questions: [
      ['What does instruction tuning actually teach the model?', 'Form and behaviour — read the request, produce an appropriate answer, stop. It does not add factual knowledge.'],
      ['Why does the chat template matter so much for open models?', 'Each family has its own special-token format for turns. Using the wrong one puts the model far outside its training distribution, and output quality collapses for reasons that look like the model being bad.'],
      ['Someone proposes fine-tuning on 500 support Q&As so the model "knows the policies". What is wrong with that?', 'It will learn the tone and format convincingly and confidently invent policy details. Knowledge belongs in retrieval; fine-tuning changes behaviour.']
    ]
  },

  {
    id: 'rlhf-preference',
    title: 'RLHF & Preference Tuning',
    domain: 'llm', tier: 3, priority: 'medium',
    summary: 'Using human comparisons to shape which of several acceptable answers the model prefers.',
    what: `After instruction tuning, the model can produce several reasonable answers. Preference tuning uses human comparisons — "response B is better than response A" — to shift it toward the preferred kind.

**RLHF** does this with reinforcement learning; **DPO** achieves a similar result more simply and is now widely used.`,
    why: `It is what makes a model feel helpful rather than merely correct, and it is where safety behaviour is largely installed. It also explains characteristic model quirks — sycophancy, verbosity, over-refusal — all of which are the model optimising a proxy for human preference.`,
    analogy: `A junior writer whose drafts are technically fine. You do not rewrite them; you say "this version is better than that one", repeatedly. Over time they internalise your taste — including any of your biases, such as unconsciously preferring longer drafts.`,
    technical: `**RLHF** pipeline: collect pairwise preferences → train a **reward model** to predict them → optimise the policy against that reward with PPO, plus a KL penalty to stop it drifting too far from the reference model.

**DPO** (Direct Preference Optimisation) skips the reward model and optimises the preference objective directly. Simpler, more stable, and now the common default. **Constitutional AI** replaces some human labels with model self-critique against a written set of principles.

The failure modes are all forms of reward hacking, because the reward model is a proxy:
- **Sycophancy** — agreement scores well.
- **Verbosity** — longer answers score well.
- **Over-refusal** — refusing is rarely punished as hard as a bad answer.

Preferences also encode the values of whoever labelled them, which is a real governance consideration, not a philosophical aside.`,
    diagram: `
   RLHF                              DPO

   1. collect pairwise preferences   1. collect pairwise preferences
        A vs B → human picks B            A vs B → human picks B

   2. train a REWARD MODEL           2. optimise the policy DIRECTLY
        (prompt, response) → score        on the preference objective

   3. optimise policy with PPO
        + KL penalty vs reference     simpler · more stable · now common

   WHY THE KL PENALTY EXISTS
     without it, the policy drifts to maximise the reward model
     and degenerates into text that scores well and reads like noise

   THE CHARACTERISTIC FAILURE MODES

     SYCOPHANCY    "You're absolutely right!" — agreement scores well
     VERBOSITY     longer answers score well, so answers grow
     OVER-REFUSAL  refusing is penalised less than being wrong
     HEDGING       qualified answers are rarely marked incorrect

   All four are reward hacking against a PROXY for preference.

   ⚠ Preferences encode the values of whoever labelled them.
     "Aligned" is always "aligned to someone".`,
    example: {
      intro: `The preference data that shapes a model, and what it accidentally teaches:`,
      language: 'text',
      caption: 'Where sycophancy and verbosity come from',
      code: `PREFERENCE PAIR
  prompt: "Is our current RAG setup good enough to ship?"

  A: "No. Groundedness is 0.61 against the golden set, below the
      0.80 gate. The retrieval step is the problem — in 40% of
      failures the correct chunk was never in the top-5."

  B: "That's a great question! There are many factors to consider
      when evaluating a RAG system. You'll want to think about
      retrieval quality, generation quality, latency, cost, and
      user experience. Each of these has several sub-dimensions..."

  Human raters, under time pressure, frequently pick B.
  It is longer, friendlier, and feels thorough.
  A is more useful and picks a side.

  Do this ten thousand times and you have trained:
      length     = good
      hedging    = safe
      directness = risky

WHAT MITIGATES IT
  · rubrics that reward specificity and penalise padding
  · rating helpfulness and honesty as SEPARATE dimensions
  · adversarial evaluation sets built from known failure modes
  · length-controlled comparisons, so verbosity cannot win on its own`
    },
    prereq: ['instruction-tuning', 'reinforcement-learning'], next: [],
    related: ['preference-tuning', 'judge-bias', 'refusal-quality', 'safety-filters'],
    tools: ['huggingface'],
    useCases: [
      'Understanding why models hedge, flatter and over-refuse.',
      'Evaluating claims about a model being "aligned".',
      'Designing evaluation rubrics that do not reward padding.'
    ],
    avoid: [
      'You will not run RLHF. This is for interpreting model behaviour and vendor claims.'
    ],
    mistakes: [
      'Treating model helpfulness as objective quality rather than encoded preference.',
      'Not accounting for verbosity bias when using an LLM as a judge — the same bias transfers.',
      'Assuming "aligned" means aligned to your values.',
      'Reading a refusal as a capability limit when it is a preference-tuned behaviour.'
    ],
    keyTerms: [
      ['RLHF', 'Reinforcement learning from human feedback.'],
      ['reward model', 'A model trained to predict which response humans prefer.'],
      ['DPO', 'Direct Preference Optimisation. Skips the reward model.'],
      ['PPO', 'The reinforcement learning algorithm typically used in RLHF.'],
      ['KL penalty', 'Keeps the tuned policy close to the reference model.'],
      ['Constitutional AI', 'Using model self-critique against written principles instead of some human labels.'],
      ['sycophancy', 'Agreeing with the user because agreement scores well.'],
      ['over-refusal', 'Declining benign requests because refusal is rarely punished.']
    ],
    resources: [
      ['Hugging Face — illustrating RLHF', 'https://huggingface.co/blog/rlhf', 'tutorial'],
      ['Direct Preference Optimization (paper)', 'https://arxiv.org/abs/2305.18290', 'paper'],
      ['Anthropic — Constitutional AI (paper)', 'https://arxiv.org/abs/2212.08073', 'paper'],
      ['Hugging Face TRL — DPO trainer', 'https://huggingface.co/docs/trl/dpo_trainer', 'docs']
    ],
    questions: [
      ['Where does sycophancy come from?', 'Human raters tend to prefer agreeable responses, so agreement scores well in the reward model and the policy learns it. It is reward hacking against a proxy for preference.'],
      ['What does DPO change relative to RLHF?', 'It optimises the preference objective directly, skipping the separate reward model and reinforcement learning loop. Simpler and more stable, and now a common default.'],
      ['Why is verbosity bias a problem beyond aesthetics?', 'It transfers to LLM-as-judge evaluation, where a longer answer scores higher regardless of quality — so your evaluation inherits the same bias unless you control for length.']
    ]
  },

  {
    id: 'inference-llm',
    title: 'LLM Inference',
    domain: 'llm', tier: 2, priority: 'high',
    summary: 'What actually happens, and what it costs, when you call a model.',
    what: `Inference is the act of running a trained model to produce output. For an LLM: tokenize the input, run a prefill pass, then generate tokens one at a time until a stop condition.`,
    why: `Inference is your recurring bill, your latency budget and your reliability surface. Every product decision about an AI feature — which model, how much context, how long the answer — is ultimately a decision about inference.`,
    analogy: `A taxi meter. The engine was built once, long ago and by someone else. You pay for every trip, and the fare depends on distance, traffic and how long you keep the driver waiting.`,
    technical: `Two phases: **prefill** processes the entire prompt in parallel (compute-bound, sets time-to-first-token) and **decode** generates one token per forward pass (memory-bandwidth-bound, sets tokens per second).

Cost is per token, with input and output priced separately and output typically 3–5× more expensive.

Levers you actually control:
- **Model choice** — a smaller model may be 10× cheaper and sufficient.
- **Context size** — retrieve fewer, better chunks.
- **Output length** — cap max_tokens and instruct brevity.
- **Prompt caching** — reuse a stable prefix at reduced cost.
- **Batching** — dramatically improves throughput when self-hosting.
- **Routing** — cheap model first, escalate only when needed.

Reliability: rate limits, timeouts and provider outages are normal operating conditions, so retries with backoff and a fallback path are architecture, not polish.`,
    diagram: `
   ONE REQUEST

   text ──► tokenize ──► PREFILL ──► DECODE ──► detokenize ──► text
                        (all prompt   (1 token
                         tokens at     per pass)
                         once)
                            │             │
                    time to first     tokens per
                        token          second

   COST STRUCTURE (illustrative)

     input tokens   $3 per million
     output tokens  $15 per million   ← 5x

     one RAG call:  9,000 in + 300 out
       = 9,000 × 3/1M  +  300 × 15/1M
       = $0.027 + $0.0045 = $0.0315

     × 500,000 requests/month = $15,750/month

   THE LEVERS, ROUGHLY RANKED BY IMPACT

     1. smaller model where sufficient      up to 10x
     2. fewer retrieved chunks              2-5x
     3. prompt caching on a stable prefix   up to 10x on input
     4. cap output length                   direct, linear
     5. route cheap-first, escalate rarely  3-8x blended`,
    example: {
      language: 'python',
      caption: 'Modelling the bill before you commit to the feature',
      code: `PRICES = {   # $ per million tokens (illustrative)
    "small":  {"in": 0.80, "out":  4.00},
    "large":  {"in": 3.00, "out": 15.00},
}

def monthly_cost(requests, tokens_in, tokens_out, tier, cache_hit=0.0):
    p = PRICES[tier]
    # cached prefix bills at roughly 10% on many providers
    effective_in = tokens_in * (1 - cache_hit) + tokens_in * cache_hit * 0.1
    per_call = effective_in * p["in"]/1e6 + tokens_out * p["out"]/1e6
    return per_call * requests, per_call

REQ = 500_000
scenarios = [
    ("large, 20 chunks, no cache",  "large", 9_000, 300, 0.0),
    ("large, 5 chunks,  no cache",  "large", 3_400, 300, 0.0),
    ("large, 5 chunks,  cached",    "large", 3_400, 300, 0.6),
    ("small, 5 chunks,  cached",    "small", 3_400, 300, 0.6),
]
for name, tier, ti, to, cache in scenarios:
    total, per = monthly_cost(REQ, ti, to, tier, cache)
    print(f"{name:<28} \${per:.4f}/call   \${total:>10,.0f}/month")

# large, 20 chunks, no cache   $0.0315   $   15,750/month
# large, 5 chunks,  no cache   $0.0147   $    7,350/month
# large, 5 chunks,  cached     $0.0106   $    5,306/month
# small, 5 chunks,  cached     $0.0032   $    1,614/month
#
# Same feature. 10x range. Retrieval quality and model choice
# are the two decisions that move it most — and both are
# product decisions, not infrastructure decisions.`
    },
    prereq: ['autoregressive-generation'], next: [],
    related: ['ai-cost', 'ai-latency', 'apis', 'token-usage-cost', 'ai-model-selection'],
    tools: ['anthropic', 'openai', 'ollama', 'vllm'],
    useCases: [
      'Building a cost model before committing to an AI feature.',
      'Setting latency SLOs that separate first-token from completion time.',
      'Deciding between a large model and a routed cheap-first architecture.'
    ],
    avoid: [
      'Assuming inference cost is negligible because a single call is cheap.',
      'Optimising cost before the feature is proven valuable.'
    ],
    mistakes: [
      'Not logging token usage per request, then being unable to explain the bill.',
      'Sizing on average latency instead of p95, so the tail is invisible.',
      'Ignoring rate limits until launch day.',
      'Failing to implement a fallback path for provider outages.'
    ],
    keyTerms: [
      ['inference', 'Running a trained model to produce output.'],
      ['prefill / decode', 'Prompt processing versus token-by-token generation.'],
      ['TTFT', 'Time to first token.'],
      ['throughput', 'Tokens or requests per second.'],
      ['batching', 'Serving several requests together to raise throughput.'],
      ['prompt caching', 'Reusing a stable prefix across calls at reduced cost.'],
      ['model routing', 'Sending easy requests to a cheap model and escalating the rest.'],
      ['rate limit', 'Provider-imposed cap on requests or tokens per period.']
    ],
    resources: [
      ['Anthropic — pricing', 'https://docs.anthropic.com/en/docs/about-claude/pricing', 'docs'],
      ['Anthropic — prompt caching', 'https://docs.anthropic.com/en/docs/build-with-claude/prompt-caching', 'docs'],
      ['Hugging Face — LLM inference optimisation', 'https://huggingface.co/docs/transformers/llm_optims', 'docs'],
      ['vLLM documentation', 'https://docs.vllm.ai/', 'docs']
    ],
    questions: [
      ['Which two decisions move inference cost the most?', 'Model choice and how much context you retrieve. Both are product decisions, and together they routinely account for a ten-fold cost range on the same feature.'],
      ['Why must latency SLOs separate TTFT from total time?', 'They are driven by different phases — prefill is compute-bound and sets time-to-first-token, decode is bandwidth-bound and sets tokens per second. With streaming, TTFT is what the user actually experiences.'],
      ['What should be logged on every LLM call?', 'Input and output token counts, latency, model version and outcome. Without them you cannot explain the bill, diagnose regressions, or model the cost of growth.']
    ]
  },

  {
    id: 'hallucination',
    title: 'Hallucination',
    domain: 'llm', tier: 1, priority: 'high',
    summary: 'Fluent, confident output that is simply not true — a property of the objective, not a bug.',
    what: `A hallucination is model output that is well-formed, plausible and false. Invented citations, fabricated policy details, non-existent functions, confidently wrong numbers.`,
    why: `It is the defining risk of shipping generative AI, and the thing every stakeholder asks about. Treating it as a defect to be fixed leads to endless disappointment; treating it as a property to be engineered around leads to systems that work.`,
    analogy: `A brilliant improviser who never breaks character. Ask about a book that does not exist and they will describe its plot, its author, and the year it won an award — because stopping to say "that does not exist" is not what improvisation does.`,
    technical: `The cause is structural: pretraining optimises plausibility of the next token, with no truth term (see next-token prediction). Nothing in the pipeline verifies anything.

Contributing factors: knowledge gaps, outdated training data, ambiguous prompts, over-long contexts where the relevant fact is buried, high temperature, and pressure to answer rather than decline.

Mitigations, roughly in order of effectiveness:
1. **Ground it** — retrieve real source material and instruct the model to use only that.
2. **Cite it** — require a source for each claim, which makes errors checkable.
3. **Permit refusal** — explicitly allow and reward "I do not know" in the prompt.
4. **Verify it** — measure groundedness with an automated check and gate on it.
5. **Delegate** — use tools for arithmetic, lookup and anything with a correct answer.
6. **Lower temperature** — a small effect, but free.

None of these eliminate hallucination. Together they make it rare and, crucially, detectable.`,
    diagram: `
   WHY IT HAPPENS

     training objective: predict a PLAUSIBLE next token
     what is missing:    any notion of TRUE

     "The 2027 Nobel Prize in Physics was awarded to"
              │
              ▼  never seen 2027, but this SHAPE is very familiar
     a fluent, grammatical, invented name at high probability

   THE DEFENCE IN DEPTH

   ┌──────────────────────────────────────────────────┐
   │ 1. GROUND    retrieve real sources into context  │  biggest effect
   ├──────────────────────────────────────────────────┤
   │ 2. CITE      require a source per claim          │  makes it checkable
   ├──────────────────────────────────────────────────┤
   │ 3. ALLOW     "say you don't know" in the prompt  │  cheap, effective
   ├──────────────────────────────────────────────────┤
   │ 4. VERIFY    groundedness check + quality gate   │  catches the rest
   ├──────────────────────────────────────────────────┤
   │ 5. DELEGATE  tools for maths, lookup, dates      │  removes a class
   ├──────────────────────────────────────────────────┤
   │ 6. TEMPERATURE ≈ 0 for factual tasks             │  small, free
   └──────────────────────────────────────────────────┘

   ⚠ NONE of these eliminate it.
     Together they make it RARE and DETECTABLE — which is
     the actual product goal.`,
    example: {
      language: 'text',
      caption: 'The same question, ungrounded and grounded',
      code: `── UNGROUNDED ──────────────────────────────────────────────
prompt:  "What is our refund window for annual plans?"

output:  "Annual plans may be refunded within 30 days of purchase,
          prorated after the first 14 days."

  Fluent. Specific. Confident. Entirely invented.
  The model has never seen your policy. Nothing stopped it.


── GROUNDED ────────────────────────────────────────────────
system:  Answer ONLY using the context below. Cite the source of
         every claim as [n]. If the context does not contain the
         answer, reply exactly: "I could not find this in the
         available documentation."

context: [1] billing-policy.pdf p.4 — "Annual subscriptions are
             refundable in full within 14 days of purchase.
             After 14 days no refund is issued."

prompt:  "What is our refund window for annual plans?"

output:  "Annual subscriptions are refundable in full within 14
          days of purchase. After 14 days no refund is issued. [1]"


── GROUNDED, ANSWER ABSENT ─────────────────────────────────
context: [1] billing-policy.pdf p.4 — "Monthly subscriptions ..."

output:  "I could not find this in the available documentation."

  ↑ THIS is the behaviour to design for and to measure.
    A refusal rate that is neither zero nor high is a healthy sign.
    Zero refusals usually means the model is inventing.`
    },
    prereq: ['next-token-prediction'], next: [],
    related: ['why-rag', 'groundedness', 'generation-citations', 'hallucination-monitoring', 'ai-trust'],
    tools: ['ragas', 'deepeval', 'langsmith'],
    useCases: [
      'Explaining to leadership why hallucination cannot simply be fixed.',
      'Designing a grounded architecture with citations and a quality gate.',
      'Setting an evaluation metric that catches ungrounded claims before users do.'
    ],
    avoid: [
      'Unmitigated generative output in medical, legal, financial or safety contexts.',
      'Any workflow where a confident wrong answer causes irreversible harm without review.'
    ],
    mistakes: [
      'Treating it as a bug the vendor will fix in the next version.',
      'Believing a longer or sterner prompt solves it structurally.',
      'Not measuring groundedness, so hallucinations are discovered by customers.',
      'Punishing refusals in evaluation, which trains the system to guess.',
      'Assuming citations prove correctness — the model can cite a real source for a claim it does not support.'
    ],
    keyTerms: [
      ['hallucination', 'Fluent, confident, false output.'],
      ['confabulation', 'A more accurate term — filling a gap with plausible invention.'],
      ['groundedness', 'Whether every claim is supported by the supplied context.'],
      ['faithfulness', 'Whether the answer accurately reflects its sources.'],
      ['abstention', 'The model declining to answer. A feature, not a failure.'],
      ['citation', 'A pointer to the source for a claim, making it checkable.'],
      ['quality gate', 'An automated check that blocks ungrounded answers from reaching users.']
    ],
    resources: [
      ['Anthropic — reduce hallucinations', 'https://docs.anthropic.com/en/docs/test-and-evaluate/strengthen-guardrails/reduce-hallucinations', 'docs'],
      ['Survey of hallucination in LLMs (paper)', 'https://arxiv.org/abs/2311.05232', 'paper'],
      ['Ragas — faithfulness metric', 'https://docs.ragas.io/en/stable/concepts/metrics/available_metrics/faithfulness/', 'docs'],
      ['DeepEval — hallucination metric', 'https://deepeval.com/docs/metrics-hallucination', 'docs']
    ],
    questions: [
      ['Why is hallucination not fixable by better prompting alone?', 'It follows from the training objective: the model optimises plausibility with no truth term. Prompting reduces the rate but cannot introduce verification that does not exist in the architecture.'],
      ['Why is a zero refusal rate a warning sign?', 'It means the system never declines, which almost certainly means it is inventing answers when the context does not contain them. A healthy grounded system refuses sometimes.'],
      ['Do citations prove an answer is correct?', 'No. A model can cite a genuine source for a claim that source does not actually support. Citations make claims checkable, which is valuable, but groundedness still has to be measured.']
    ],
    interview: {
      s30: 'A hallucination is fluent, confident output that is false. It happens because the model is trained to predict plausible text, and nothing in that objective distinguishes plausible from true.',
      s90: 'I frame it as a property to engineer around rather than a bug to wait out. The defence is layered: ground the model by retrieving real source material, require a citation for every claim so errors are checkable, explicitly permit "I could not find this" in the prompt, and then measure groundedness automatically and gate on it before the answer reaches a user. Tools handle anything with a verifiable answer, like arithmetic or a lookup. None of that eliminates hallucination — the goal is to make it rare and detectable. One signal I watch is the refusal rate: if a grounded system never refuses, it is almost certainly inventing, so a refusal rate of zero worries me more than a refusal rate of five percent.',
      pm: 'It determines the product shape. If a confident wrong answer causes irreversible harm, the feature needs human review in the loop, and that is a design decision made before we build, not after an incident.'
    }
  },

  {
    id: 'model-capabilities-limits',
    title: 'Model Capabilities & Limits',
    domain: 'llm', tier: 2, priority: 'high',
    summary: 'What LLMs are genuinely good at, what they are unreliable at, and what they cannot do at all.',
    what: `A practical map of the boundary. LLMs are excellent at transforming and generating language, reasonable at structured reasoning over supplied material, unreliable at precise computation and recall, and incapable of knowing anything after their cutoff or verifying their own output.`,
    why: `Most failed AI features come from choosing a task on the wrong side of this line. Knowing the boundary before you commit is the highest-leverage thing you can do as a PM working on AI.`,
    analogy: `A gifted, extremely well-read generalist with no internet access, no calculator, no memory between conversations, and a strong reluctance to admit ignorance. Give them a document and a question and they excel. Ask about yesterday and they will guess.`,
    technical: `**Genuinely strong**: summarisation, rewriting, translation, tone and format transformation, extraction into a schema, classification of open-ended text, code generation from clear specifications, brainstorming, explaining supplied material.

**Unreliable**: arithmetic and precise counting (tokenization destroys digit structure), exact recall of long-tail facts, anything requiring current information, multi-step logic without scaffolding, self-assessed confidence.

**Cannot do**: know anything after the cutoff, learn from a conversation permanently, verify its own claims, guarantee identical output, or reliably know what it does not know.

The strategic implication: **give the model context and take away computation**. Retrieval supplies facts; tools supply arithmetic, search and current data; the model does the language work it is genuinely excellent at.`,
    diagram: `
   ┌─────────────────────────────────────────────────────────────┐
   │ STRONG — ship with confidence                               │
   │  summarise · rewrite · translate · change tone/format       │
   │  extract into a schema · classify open text                 │
   │  generate code from a clear spec · explain given material   │
   ├─────────────────────────────────────────────────────────────┤
   │ UNRELIABLE — needs grounding, tools or human review         │
   │  arithmetic · counting · exact long-tail recall             │
   │  multi-step logic · anything time-sensitive                 │
   │  self-reported confidence                                   │
   ├─────────────────────────────────────────────────────────────┤
   │ CANNOT — do not design around these                         │
   │  know anything after the cutoff                             │
   │  learn permanently from a conversation                      │
   │  verify its own claims                                      │
   │  guarantee identical output                                 │
   │  reliably know what it does not know                        │
   └─────────────────────────────────────────────────────────────┘

   THE DESIGN RULE

     GIVE IT CONTEXT           TAKE AWAY COMPUTATION
     ───────────────           ─────────────────────
     retrieval → facts         calculator → arithmetic
     history   → continuity    search     → current info
     schema    → structure     database   → exact records
                               code exec  → deterministic logic

     Let the model do LANGUAGE. Let systems do TRUTH.`,
    example: {
      language: 'text',
      caption: 'Moving a feature from the wrong side of the line to the right one',
      code: `REQUEST: "Let the assistant answer questions about a customer's
          account and calculate what they are owed."

── NAIVE DESIGN (unreliable) ───────────────────────────────
  everything to the LLM:
    · account details        → it does not have them (invents)
    · outstanding balance    → arithmetic (unreliable)
    · refund policy          → not in training data (invents)
    · today's date           → does not know (guesses)

  Result: fluent, confident, wrong, and unfalsifiable.


── CORRECTED DESIGN ────────────────────────────────────────
  TOOLS (deterministic, verifiable)
    get_account(customer_id)        → real record from the database
    compute_refund(account, policy) → real arithmetic in code
    get_current_date()              → the actual date

  RETRIEVAL (grounded)
    refund policy chunks + citations

  LLM (what it is genuinely good at)
    · understand the question, however it was phrased
    · decide which tools to call
    · read the returned values and the retrieved policy
    · explain the outcome clearly, in the customer's language
    · cite the policy clause it relied on

  The number is computed by code. The policy comes from a document.
  The model does the part that is actually hard for software:
  understanding an ambiguous question and explaining an answer well.`
    },
    prereq: ['hallucination', 'context-window'], next: [],
    related: ['ai-feasibility', 'ai-use-case-selection', 'tool-calling', 'why-rag'],
    tools: ['anthropic', 'openai'],
    useCases: [
      'Triaging proposed AI features before any engineering starts.',
      'Redesigning a failing feature by moving computation into tools.',
      'Setting honest expectations with stakeholders.'
    ],
    avoid: [
      'Tasks requiring guaranteed precision without verification.',
      'Anything where a confident wrong answer is irreversible and unreviewed.',
      'Features whose value depends on the model knowing current information unaided.'
    ],
    mistakes: [
      'Asking the model to do arithmetic it will get subtly wrong.',
      'Expecting the model to know your product, your customers or today’s date.',
      'Treating a benchmark score as evidence it will work on your task.',
      'Building without an evaluation set, so the boundary is discovered in production.'
    ],
    keyTerms: [
      ['capability boundary', 'The line between what a model does reliably and what it does not.'],
      ['knowledge cutoff', 'The date beyond which the model has seen nothing.'],
      ['tool use', 'Delegating verifiable work to deterministic systems.'],
      ['grounding', 'Supplying real source material in the context.'],
      ['benchmark', 'A standardised test. Weak evidence for your specific task.'],
      ['task decomposition', 'Splitting work so each part goes to the right component.'],
      ['human in the loop', 'Review before a consequential action takes effect.']
    ],
    resources: [
      ['Anthropic — build with Claude overview', 'https://docs.anthropic.com/en/docs/build-with-claude/overview', 'docs'],
      ['Anthropic — tool use', 'https://docs.anthropic.com/en/docs/build-with-claude/tool-use/overview', 'docs'],
      ['Google — People + AI Guidebook', 'https://pair.withgoogle.com/guidebook/', 'reference'],
      ['Microsoft — HAX design guidelines for human-AI interaction', 'https://www.microsoft.com/en-us/haxtoolkit/ai-guidelines/', 'reference']
    ],
    questions: [
      ['What is the design rule that follows from the capability boundary?', 'Give the model context and take away computation. Retrieval supplies facts, tools supply arithmetic and current data, and the model does the language work it is genuinely excellent at.'],
      ['Why should an LLM not compute a refund amount?', 'Arithmetic is unreliable because tokenization fragments numbers, and the result is unverifiable. Compute it in code and let the model explain the result.'],
      ['Why is a strong benchmark score weak evidence for your feature?', 'Benchmarks measure generic tasks on curated data. Your task, your documents and your users are different, which is why you need your own evaluation set before committing.']
    ]
  }
];
