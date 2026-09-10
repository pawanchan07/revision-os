/**
 * DOMAIN J — QUANTIZATION + LOCAL INFERENCE (BUILD.md section 13)
 */
export const topics = [
  {
    id: 'model-size-parameters',
    title: 'What "7B" Actually Means',
    domain: 'quantization', tier: 1, priority: 'high',
    summary: 'Seven billion numbers — and a memory requirement you can compute exactly.',
    what: `"7B" means the model has seven billion parameters. Since each parameter is a number stored at some precision, the size in memory is simple arithmetic: parameters × bytes per parameter.

It is a memory statement, not a quality statement.`,
    why: `It is the single most quoted number about any model, and it is usually treated as a mysterious quality score. Treating it as an arithmetic memory requirement turns "can we run this?" from a guess into a calculation.`,
    analogy: `Engine displacement. It tells you something real about the machine and something about fuel consumption. It does not tell you which car is faster, because tuning, weight and gearing matter at least as much.`,
    technical: `Memory for weights = parameters × bytes per parameter.
- FP32: 4 bytes → 7B = 28GB
- FP16/BF16: 2 bytes → 7B = 14GB
- INT8: 1 byte → 7B = 7GB
- INT4: 0.5 bytes → 7B = 3.5GB

But **weights are not the whole requirement**. Serving also needs the KV cache (which scales with context length and concurrency) and activations. Budget roughly 1.2–1.5× the weight size for single-user inference, and considerably more for concurrency.

Size correlates with capability but does not determine it. Training data quality and quantity matter at least as much — a well-trained 8B model now outperforms a poorly-trained 70B from two years ago. **Chinchilla** established that most models were undertrained, so more data on fewer parameters often wins.

The practical size ladder: 1–3B for simple tasks on modest hardware, 7–14B as the general workhorse, 30–70B for stronger reasoning, and above that you are into multi-GPU territory.`,
    diagram: `
   MEMORY = PARAMETERS × BYTES PER PARAMETER

     precision   bytes    7B      13B      70B
     ─────────   ─────   ────    ────     ────
     FP32          4     28 GB   52 GB   280 GB
     FP16/BF16     2     14 GB   26 GB   140 GB
     INT8          1      7 GB   13 GB    70 GB
     INT4        0.5    3.5 GB  6.5 GB    35 GB

   ⚠ WEIGHTS ARE NOT THE WHOLE REQUIREMENT

     weights          14.0 GB
     + KV cache        4.3 GB  (8k context, 1 user)
     + activations     1.0 GB
     ─────────────────────────
     total            ~19 GB   for ONE user

     ×10 concurrent users → the KV cache dominates, not the weights

   SIZE CORRELATES WITH CAPABILITY. IT DOES NOT DETERMINE IT.

     a well-trained 8B model today
       > a poorly-trained 70B from two years ago

     Chinchilla: most models were UNDERTRAINED.
     More data on fewer parameters often wins.

   THE PRACTICAL LADDER

      1-3B    simple tasks · modest hardware · edge
      7-14B   the general workhorse           ← start here
     30-70B   stronger reasoning
      70B+    multi-GPU territory`,
    example: {
      language: 'python',
      caption: 'Computing whether a model will actually fit',
      code: `BYTES = {"fp32": 4, "fp16": 2, "bf16": 2, "int8": 1, "int4": 0.5}

def fits(params_b, precision, gpu_gb, *, context=8192, users=1,
         layers=32, kv_heads=8, head_dim=128):
    weights = params_b * 1e9 * BYTES[precision] / 1e9

    # KV cache: 2 (K and V) × layers × kv_heads × head_dim
    #           × context × users × 2 bytes
    kv = (2 * layers * kv_heads * head_dim * context * users * 2) / 1e9

    activations = weights * 0.05                 # rough
    total = weights + kv + activations

    return {
        "weights_gb": round(weights, 1),
        "kv_cache_gb": round(kv, 1),
        "total_gb": round(total, 1),
        "gpu_gb": gpu_gb,
        "fits": total < gpu_gb * 0.92,           # leave headroom
        "headroom_gb": round(gpu_gb * 0.92 - total, 1),
    }

print(fits(7,  "fp16", gpu_gb=24))
print(fits(7,  "int4", gpu_gb=24, users=20))
print(fits(70, "int4", gpu_gb=40))
print(fits(70, "int4", gpu_gb=80, users=8))

# {'weights_gb': 14.0, 'kv_cache_gb': 1.1, 'total_gb': 15.8, 'fits': True,  'headroom_gb': 6.3}
# {'weights_gb': 3.5,  'kv_cache_gb': 21.5,'total_gb': 25.2, 'fits': False, 'headroom_gb': -3.1}
#   ↑ the WEIGHTS fit easily. The KV CACHE for 20 users does not.
# {'weights_gb': 35.0, 'kv_cache_gb': 1.1, 'total_gb': 37.9, 'fits': False, 'headroom_gb': -1.1}
#   ↑ 70B at 4-bit is 35GB — it does NOT fit a 40GB card with headroom
# {'weights_gb': 35.0, 'kv_cache_gb': 8.6, 'total_gb': 45.4, 'fits': True,  'headroom_gb': 28.2}

# The second result is the one that surprises people: concurrency
# is limited by the KV cache, not by the weights.`
    },
    prereq: ['parameters-weights'], next: ['precision-formats', 'vram-ram-requirements'],
    related: ['quantization', 'self-attention-qkv', 'model-families', 'size-quality-tradeoff'],
    tools: ['ollama', 'huggingface', 'vllm'],
    useCases: [
      'Deciding whether a model fits available hardware.',
      'Sizing a GPU for a target concurrency.',
      'Explaining why a model that "fits" still fails under load.'
    ],
    avoid: [
      'Treating parameter count as a quality ranking.',
      'Sizing hardware on weights alone.'
    ],
    mistakes: [
      'Budgeting for weights only and running out of memory under concurrency.',
      'Assuming bigger is better regardless of training data quality.',
      'Not leaving headroom, so the model loads and then fails on a long context.',
      'Comparing parameter counts across families as though they were comparable capability scores.'
    ],
    keyTerms: [
      ['parameter count', 'How many learned numbers. 7B = seven billion.'],
      ['bytes per parameter', 'Determined by precision. 4, 2, 1 or 0.5.'],
      ['KV cache', 'Memory scaling with context length and concurrency.'],
      ['activations', 'Intermediate values during a forward pass.'],
      ['headroom', 'Spare memory needed for peak usage.'],
      ['Chinchilla-optimal', 'Roughly 20 training tokens per parameter.']
    ],
    resources: [
      ['Hugging Face — model memory anatomy', 'https://huggingface.co/docs/transformers/model_memory_anatomy', 'docs'],
      ['Chinchilla — training compute-optimal LLMs', 'https://arxiv.org/abs/2203.15556', 'paper'],
      ['Hugging Face — model memory calculator', 'https://huggingface.co/spaces/hf-accelerate/model-memory-usage', 'interactive'],
      ['vLLM — memory management', 'https://docs.vllm.ai/en/latest/', 'docs']
    ],
    questions: [
      ['How do you compute a model’s memory requirement?', 'Parameters × bytes per parameter, plus the KV cache (which scales with context and concurrency) plus activations. Weights alone understate it substantially under load.'],
      ['Why does a model that fits still fail under concurrency?', 'The KV cache scales with the number of simultaneous conversations. A 7B model at 4-bit is 3.5GB of weights and can need 20GB+ of KV cache for twenty concurrent users.'],
      ['Does a larger parameter count mean a better model?', 'It correlates but does not determine. Training data quality and quantity matter at least as much — a well-trained 8B model outperforms a poorly-trained 70B from two years earlier.']
    ]
  },

  {
    id: 'precision-formats',
    title: 'Precision Formats',
    domain: 'quantization', tier: 2, priority: 'medium',
    summary: 'FP32, FP16, BF16, INT8, INT4 — how many bits each number gets, and what that costs.',
    what: `Precision is how many bits are used to store each parameter. Fewer bits means less memory and faster computation, at the cost of numerical accuracy.`,
    why: `It is the lever that decides whether a model fits your hardware, and the difference between formats is not just size — BF16 versus FP16 in particular affects training stability, and INT8 versus INT4 affects output quality noticeably at the low end.`,
    analogy: `Recording audio at different bit depths. More bits capture more nuance and take more space. Below a certain depth the difference becomes audible; above it, nobody can tell.`,
    technical: `**FP32** — 32-bit float. Full precision. Rarely needed for inference.

**FP16** — 16-bit float. Half the memory, and a narrow exponent range that can overflow during training.

**BF16** — 16-bit "brain float". Same memory as FP16 but with FP32's exponent range and fewer mantissa bits. Much more stable for training, and the modern default where hardware supports it.

**INT8** — 8-bit integer. Quarter memory. Quality loss is typically small with good quantization methods.

**INT4** — 4-bit integer. Eighth memory. Quality loss is real but often acceptable, and it is what makes large models runnable on consumer hardware.

The distinction that matters: **FP16 versus BF16 is about range, not size.** FP16 has more precision in a narrow range; BF16 trades precision for range and is far less likely to overflow. For inference either is usually fine; for training BF16 is safer.

Below 4-bit, quality degrades sharply for most models. 2-bit and 3-bit exist and are usually a false economy.`,
    diagram: `
   BITS PER PARAMETER

     FP32   ████████████████████████████████   4 bytes
     FP16   ████████████████                   2 bytes
     BF16   ████████████████                   2 bytes
     INT8   ████████                           1 byte
     INT4   ████                             0.5 bytes

   FP16 vs BF16 — same size, different shape

     FP16   sign │ exp (5) │ mantissa (10)
            more precision, NARROW range → can overflow

     BF16   sign │ exp (8) │ mantissa (7)
            less precision, FP32's RANGE → stable in training
            ← the modern default where hardware supports it

     For inference either is usually fine.
     For training, BF16 is meaningfully safer.

   QUALITY vs SIZE (typical, model-dependent)

     FP16    baseline                  14.0 GB (7B)
     INT8    ~99% of baseline           7.0 GB
     INT4    ~96-98% of baseline        3.5 GB   ← the sweet spot
     INT3    noticeably degraded        2.6 GB
     INT2    usually unusable           1.8 GB   ← false economy

   ⚠ BELOW 4-BIT, QUALITY DEGRADES SHARPLY.
     The memory saved is rarely worth it.`,
    example: {
      language: 'python',
      caption: 'What the formats actually represent, and why BF16 is safer',
      code: `import numpy as np
import torch

# ── RANGE: the practical difference between FP16 and BF16 ──
big = 70000.0
print("fp32:", np.float32(big))                        # 70000.0
print("fp16:", np.float16(big))                        # inf  ← OVERFLOW
print("bf16:", torch.tensor(big, dtype=torch.bfloat16).item())  # 70144.0

# FP16 max is ~65,504. Intermediate values during training routinely
# exceed that, which is why FP16 training needs loss scaling and
# BF16 does not.

# ── PRECISION: the trade BF16 makes ────────────────────────
x = 3.14159265
print("fp32:", np.float32(x))                          # 3.1415927
print("fp16:", np.float16(x))                          # 3.14      (more precise)
print("bf16:", torch.tensor(x, dtype=torch.bfloat16).item())  # 3.140625

# BF16 is LESS precise than FP16 in a narrow range, and far more
# robust across the range that actually occurs.

# ── MEMORY, CONCRETELY ─────────────────────────────────────
def size_gb(params_b, dtype):
    return params_b * 1e9 * {"fp32": 4, "fp16": 2, "bf16": 2,
                             "int8": 1, "int4": 0.5}[dtype] / 1e9

for p in (7, 13, 70):
    row = f"{p:>3}B  "
    for d in ("fp32", "fp16", "int8", "int4"):
        row += f"{d}:{size_gb(p, d):>6.1f}GB  "
    print(row)

#   7B  fp32:  28.0GB  fp16:  14.0GB  int8:   7.0GB  int4:   3.5GB
#  13B  fp32:  52.0GB  fp16:  26.0GB  int8:  13.0GB  int4:   6.5GB
#  70B  fp32: 280.0GB  fp16: 140.0GB  int8:  70.0GB  int4:  35.0GB

# ── LOADING AT A GIVEN PRECISION ───────────────────────────
# model = AutoModelForCausalLM.from_pretrained(
#     MODEL, torch_dtype=torch.bfloat16)          # 2 bytes/param
# model = AutoModelForCausalLM.from_pretrained(
#     MODEL, load_in_4bit=True)                   # 0.5 bytes/param`
    },
    prereq: ['model-size-parameters'], next: ['quantization'],
    related: ['numbers', 'gguf', 'vram-ram-requirements'],
    tools: ['pytorch', 'transformers', 'ollama'],
    useCases: [
      'Choosing a precision that fits available memory.',
      'Understanding why training uses BF16 rather than FP16.',
      'Reading a model page and knowing what a quantization label means.'
    ],
    avoid: [
      'FP32 for inference — it doubles memory for no practical benefit.',
      'Below 4-bit, where quality degrades sharply.'
    ],
    mistakes: [
      'Assuming FP16 and BF16 differ in size — they do not; they differ in range.',
      'Using FP16 for training without loss scaling and hitting overflow.',
      'Going to 2-bit or 3-bit to save memory and losing usable quality.',
      'Loading at FP32 by default when BF16 halves the memory with no meaningful loss.'
    ],
    keyTerms: [
      ['FP32', '32-bit float. Full precision. Rarely needed for inference.'],
      ['FP16', '16-bit float. Narrow exponent range; can overflow.'],
      ['BF16', '16-bit with FP32 range. The modern training default.'],
      ['INT8', '8-bit integer. Quarter memory, small quality loss.'],
      ['INT4', '4-bit integer. Eighth memory. The practical sweet spot.'],
      ['mantissa / exponent', 'Precision versus range in a float format.'],
      ['loss scaling', 'A workaround for FP16 overflow during training.']
    ],
    resources: [
      ['Hugging Face — quantization overview', 'https://huggingface.co/docs/transformers/quantization/overview', 'docs'],
      ['PyTorch — automatic mixed precision', 'https://pytorch.org/docs/stable/amp.html', 'docs'],
      ['Google — BFloat16 for cloud TPUs', 'https://cloud.google.com/blog/products/ai-machine-learning/bfloat16-the-secret-to-high-performance-on-cloud-tpus', 'reference']
    ],
    questions: [
      ['What is the real difference between FP16 and BF16?', 'Range, not size. Both are 2 bytes. BF16 has FP32’s exponent range with fewer mantissa bits, which makes it far less likely to overflow during training.'],
      ['Why is 4-bit the practical floor?', 'INT4 typically retains 96–98% of baseline quality at an eighth of the memory. Below that, quality degrades sharply and the additional saving is rarely worth it.'],
      ['Why is FP32 rarely used for inference?', 'It doubles memory relative to BF16 with no practical quality benefit for generation, so it is wasted capacity.']
    ]
  },

  {
    id: 'quantization',
    title: 'Quantization',
    domain: 'quantization', tier: 1, priority: 'high',
    summary: 'Storing weights at lower precision so a model fits and runs faster, for a small quality cost.',
    what: `Quantization converts a model's weights from higher precision to lower — typically 16-bit to 4-bit — reducing memory roughly fourfold and speeding up inference, with a modest quality loss.

It is what makes large models runnable on ordinary hardware.`,
    why: `Without it, a 70B model needs 140GB and is unreachable outside a data centre. At 4-bit it needs 35GB and runs on a single high-memory GPU. Quantization is the difference between "theoretically available" and "actually usable".`,
    analogy: `Compressing a photograph. The file is a fraction of the size, and at reasonable compression nobody can tell. Push it too far and the artefacts become obvious.`,
    technical: `The core idea: map a range of float values onto a small set of integer levels, storing a scale factor per group of weights so the original values can be approximated on the fly.

Methods worth knowing:
- **GPTQ** — post-training, one-shot, calibrated on sample data. Fast to produce, GPU-oriented.
- **AWQ** — activation-aware; protects the weights that matter most. Often slightly better quality than GPTQ at the same size.
- **GGUF / llama.cpp k-quants** — the format used by Ollama and llama.cpp. Several variants (Q4_K_M, Q5_K_M) trading size against quality.
- **bitsandbytes** — on-the-fly quantization at load time. Convenient; slower inference than a pre-quantized format.

**Quality loss is not uniform.** It concentrates in edge cases, long contexts and reasoning-heavy tasks. A quantized model can look identical on simple prompts and degrade noticeably on the hard ones — which is exactly why you evaluate on your own golden set rather than on impressions.

**QLoRA** applies the same idea during fine-tuning: quantize the frozen base to 4-bit, train an adapter in higher precision.`,
    diagram: `
   THE IDEA

     original weights (FP16)
       0.0132  -0.0871   0.0455  -0.0219  …

     find the range, split into 16 levels (4-bit)
       store: a 4-bit level per weight + a scale per group

     reconstructed on the fly
       0.0125  -0.0875   0.0450  -0.0225  …
                ↑ close, not identical

   MEMORY, FOR A 70B MODEL

     FP16   ████████████████████████████████  140 GB
     INT8   ████████████████                   70 GB
     INT4   ████████                           35 GB   ← now runnable

   ⚠ QUALITY LOSS IS NOT UNIFORM

     simple prompts        indistinguishable
     long contexts         some degradation
     multi-step reasoning  noticeable degradation
     edge cases            where it shows first

     A quantized model can look fine on ten test prompts and
     fail on the hard 10% of your golden set. Evaluate properly.

   METHODS

     GPTQ           post-training, calibrated, GPU-oriented
     AWQ            activation-aware, protects important weights
     GGUF k-quants  llama.cpp / Ollama format (Q4_K_M, Q5_K_M…)
     bitsandbytes   on-the-fly at load; convenient, slower

   QLoRA = quantize the frozen base to 4-bit,
           train a higher-precision adapter on top`,
    example: {
      language: 'python',
      caption: 'Quantization in practice, and evaluating the cost',
      code: `# ── ON-THE-FLY (bitsandbytes) — convenient ─────────────────
from transformers import AutoModelForCausalLM, BitsAndBytesConfig
import torch

config = BitsAndBytesConfig(
    load_in_4bit=True,
    bnb_4bit_quant_type="nf4",              # normalised float 4
    bnb_4bit_compute_dtype=torch.bfloat16,  # compute in bf16, store in 4-bit
    bnb_4bit_use_double_quant=True,         # quantize the scales too
)
model = AutoModelForCausalLM.from_pretrained(MODEL, quantization_config=config,
                                             device_map="auto")

print(f"{model.get_memory_footprint()/1e9:.1f} GB")   # ~4.5 GB for an 8B

# ── PRE-QUANTIZED (GGUF via Ollama) — faster inference ─────
# ollama pull llama3.1:8b-instruct-q4_K_M

# ── THE EVALUATION THAT ACTUALLY MATTERS ───────────────────
def compare_quantizations(golden_set, variants):
    """Quality loss concentrates in hard cases. Measure by difficulty."""
    results = {}
    for name, loader in variants.items():
        model = loader()
        by_difficulty = {"easy": [], "medium": [], "hard": []}
        for case in golden_set:
            score = evaluate(model, case)
            by_difficulty[case["difficulty"]].append(score)
        results[name] = {
            d: round(sum(s)/len(s), 3) for d, s in by_difficulty.items()
        }
    return results

# print(compare_quantizations(golden, {
#     "fp16": load_fp16, "int8": load_int8, "int4": load_int4}))
#
# fp16  {'easy': 0.97, 'medium': 0.93, 'hard': 0.86}
# int8  {'easy': 0.97, 'medium': 0.92, 'hard': 0.84}
# int4  {'easy': 0.97, 'medium': 0.91, 'hard': 0.74}   ← the hard cases
#
# On easy cases all three are identical. On hard cases int4 loses
# twelve points. Testing on easy prompts only would have hidden this
# entirely — which is how teams ship a quantized model and then
# wonder why complex queries got worse.`
    },
    prereq: ['precision-formats'], next: ['gguf', 'size-quality-tradeoff'],
    related: ['lora-peft', 'ollama', 'vector-dimensions', 'model-size-parameters'],
    tools: ['ollama', 'huggingface', 'transformers', 'vllm'],
    useCases: [
      'Fitting a larger model onto available hardware.',
      'Reducing inference cost and latency when self-hosting.',
      'Fine-tuning a large model on a single GPU via QLoRA.'
    ],
    avoid: [
      'Below 4-bit, where quality degrades sharply.',
      'Quantizing without evaluating on hard cases.',
      'On-the-fly quantization when a pre-quantized format is available and inference speed matters.'
    ],
    mistakes: [
      'Evaluating a quantized model only on easy prompts, hiding the degradation.',
      'Assuming quality loss is uniform — it concentrates in reasoning and long contexts.',
      'Using 2-bit or 3-bit to save memory and losing usable quality.',
      'Comparing quantization methods on size alone rather than on quality per gigabyte.'
    ],
    keyTerms: [
      ['quantization', 'Storing weights at lower precision.'],
      ['GPTQ', 'Post-training, calibrated quantization.'],
      ['AWQ', 'Activation-aware quantization; protects important weights.'],
      ['k-quants', 'The llama.cpp quantization variants (Q4_K_M etc.).'],
      ['bitsandbytes', 'On-the-fly quantization at load time.'],
      ['NF4', 'Normalised float 4 — the QLoRA quantization type.'],
      ['QLoRA', 'Fine-tuning with a 4-bit frozen base and a higher-precision adapter.'],
      ['calibration data', 'Sample inputs used to choose quantization scales.']
    ],
    resources: [
      ['Hugging Face — quantization', 'https://huggingface.co/docs/transformers/quantization/overview', 'docs'],
      ['QLoRA (paper)', 'https://arxiv.org/abs/2305.14314', 'paper'],
      ['GPTQ (paper)', 'https://arxiv.org/abs/2210.17323', 'paper'],
      ['AWQ (paper)', 'https://arxiv.org/abs/2306.00978', 'paper'],
      ['llama.cpp — quantization', 'https://github.com/ggml-org/llama.cpp', 'repo']
    ],
    questions: [
      ['What does quantization actually make possible?', 'Running models that would otherwise be unreachable. A 70B model at FP16 needs 140GB; at 4-bit it needs 35GB and fits on a single high-memory GPU.'],
      ['Why is quality loss from quantization easy to miss?', 'It is not uniform. Simple prompts look identical while multi-step reasoning and long contexts degrade noticeably, so testing on easy examples hides it entirely.'],
      ['What is QLoRA?', 'Fine-tuning with the frozen base model quantized to 4-bit and a higher-precision LoRA adapter trained on top, which is what makes fine-tuning a large model on one GPU feasible.']
    ],
    interview: {
      s30: 'Quantization stores model weights at lower precision — typically 4-bit instead of 16 — cutting memory roughly fourfold with a modest quality cost. It is what makes large models runnable on ordinary hardware.',
      s90: 'The arithmetic is simple: a 70B model is 140GB at 16-bit and 35GB at 4-bit, which is the difference between needing a cluster and needing one GPU. The part I make sure teams understand is that the quality loss is not uniform. On simple prompts a 4-bit model is indistinguishable from the full-precision one; on multi-step reasoning and long contexts it degrades noticeably. So evaluating on ten easy prompts tells you nothing — you need your golden set split by difficulty, and you look specifically at the hard cases. I have seen teams ship a quantized model after a quick sanity check and then spend weeks confused about why complex queries got worse.',
      pm: 'It is the lever that decides whether self-hosting is affordable, and the evaluation discipline around it is what stops a cost saving becoming a quality regression.'
    }
  },

  {
    id: 'gguf',
    title: 'GGUF & Local Model Formats',
    domain: 'quantization', tier: 2, priority: 'medium',
    summary: 'The file format behind llama.cpp and Ollama, designed for efficient local inference.',
    what: `GGUF is a single-file model format holding quantized weights, the tokenizer, the architecture metadata and the chat template together. It is what llama.cpp and Ollama use.`,
    why: `It is the format you will actually encounter running models locally, and its quantization variant names (Q4_K_M and friends) are the practical knob for trading size against quality on your own hardware.`,
    analogy: `A self-contained appliance versus a kit of parts. Everything needed is in one box, configured to work together, and you can carry it.`,
    technical: `Design properties: one file, memory-mappable (so the model can load quickly and share memory across processes), CPU-friendly with GPU offload of selected layers, and self-describing — the tokenizer and chat template travel inside it.

**Quantization variants**: the naming is \`Q<bits>_<variant>\`. \`Q4_K_M\` is 4-bit, k-quant, medium — the common default. \`Q5_K_M\` is larger and slightly better. \`Q8_0\` is 8-bit. Higher numbers mean larger and better.

**Partial GPU offload** is GGUF's distinctive capability: put as many layers on the GPU as fit and run the rest on CPU. It is slower than full GPU but it lets you run a model that would otherwise not fit at all.

Conversion from Hugging Face format is a scripted step, and community-published GGUF conversions are common — check who produced one before trusting it.

GGUF is for local and single-user inference. For serving many concurrent users, vLLM with a GPU-native format is substantially faster.`,
    diagram: `
   GGUF — everything in one file

     ┌─────────────────────────────────────┐
     │ metadata     architecture, context   │
     │ tokenizer    vocabulary + merges     │
     │ chat template                        │
     │ weights      quantized               │
     └─────────────────────────────────────┘
       memory-mappable · self-describing · portable

   QUANTIZATION VARIANT NAMES

     Q2_K     smallest    usually unusable
     Q3_K_M               noticeably degraded
     Q4_K_M   ← the common default, good balance
     Q5_K_M               larger, slightly better
     Q6_K                 close to 8-bit
     Q8_0     largest quantized, near-lossless

     Q <bits> _ K <size>
       bits    4, 5, 6, 8
       K       k-quant method
       S/M/L   small / medium / large within that bit width

   PARTIAL GPU OFFLOAD — GGUF's distinctive trick

     model has 32 layers, GPU fits 20

       layers 1-20   → GPU    fast
       layers 21-32  → CPU    slow

     slower than full GPU, and it RUNS — where otherwise it
     would not fit at all

   ⚠ GGUF IS FOR LOCAL / SINGLE-USER INFERENCE.
     For many concurrent users, vLLM with a GPU-native format
     is substantially faster.`,
    example: {
      language: 'bash',
      caption: 'Choosing a quantization variant and tuning GPU offload',
      code: `# ── CHOOSING A VARIANT for an 8B model ─────────────────────
#   Q4_K_M   4.9 GB   the default. Start here.
#   Q5_K_M   5.7 GB   slightly better, if it fits
#   Q6_K     6.6 GB   close to 8-bit quality
#   Q8_0     8.5 GB   near-lossless, largest

ollama pull llama3.1:8b-instruct-q4_K_M

# ── CHECK WHAT IS ACTUALLY LOADED ──────────────────────────
ollama ps
# NAME                          SIZE     PROCESSOR
# llama3.1:8b-instruct-q4_K_M   6.2 GB   100% GPU
#                               ^ larger than the file:
#                                 weights + KV cache + overhead

# ── PARTIAL OFFLOAD when it does not all fit ───────────────
# llama.cpp directly, for control over layer placement:
llama-cli -m llama-3.1-8b-instruct-Q4_K_M.gguf \
  --n-gpu-layers 20 \
  --ctx-size 8192 \
  -p "Explain RAG in two sentences."

#   --n-gpu-layers 32   all on GPU        fastest
#   --n-gpu-layers 20   split GPU/CPU     slower, but it runs
#   --n-gpu-layers 0    CPU only          slowest, always works

# ── CONVERTING FROM HUGGING FACE FORMAT ────────────────────
# python convert_hf_to_gguf.py ./model-dir --outfile model-f16.gguf
# ./llama-quantize model-f16.gguf model-Q4_K_M.gguf Q4_K_M

# ⚠ Community GGUF conversions are common and convenient.
#   Check who published one — a conversion is a re-upload of
#   someone else's weights, and the relationship to the
#   original repo is convention, not enforcement.`
    },
    prereq: ['quantization'], next: ['cpu-vs-gpu-inference'],
    related: ['ollama', 'what-is-a-model', 'local-rag-architecture', 'precision-formats'],
    tools: ['ollama', 'huggingface'],
    useCases: [
      'Running a model locally with a single portable file.',
      'Fitting a model onto limited GPU memory via partial offload.',
      'Choosing a size/quality trade-off with quantization variants.'
    ],
    avoid: [
      'GGUF for high-concurrency serving — vLLM is much faster.',
      'Q2 or Q3 variants, where quality is usually unusable.'
    ],
    mistakes: [
      'Assuming the file size equals the memory needed — KV cache and overhead add more.',
      'Using a community conversion without checking the publisher.',
      'Choosing the smallest variant to save space and losing usable quality.',
      'Expecting GGUF throughput to match a GPU-native serving stack under load.'
    ],
    keyTerms: [
      ['GGUF', 'A single-file format for local quantized inference.'],
      ['k-quant', 'The llama.cpp quantization method family.'],
      ['Q4_K_M', '4-bit, k-quant, medium. The common default.'],
      ['memory mapping', 'Loading a file without copying it into memory.'],
      ['GPU offload', 'Placing some layers on GPU and the rest on CPU.'],
      ['n-gpu-layers', 'How many layers to place on the GPU.'],
      ['llama.cpp', 'The inference engine GGUF was designed for.']
    ],
    resources: [
      ['llama.cpp — repository', 'https://github.com/ggml-org/llama.cpp', 'repo'],
      ['Hugging Face — GGUF', 'https://huggingface.co/docs/hub/gguf', 'docs'],
      ['Ollama — model library', 'https://ollama.com/library', 'reference'],
      ['Ollama — documentation', 'https://docs.ollama.com/', 'docs']
    ],
    questions: [
      ['What does GGUF contain?', 'Everything in one file: quantized weights, tokenizer, architecture metadata and the chat template. It is memory-mappable and self-describing.'],
      ['What does Q4_K_M mean?', 'Four-bit, k-quant method, medium size within that bit width. It is the usual default and a good balance of size and quality.'],
      ['What is partial GPU offload for?', 'Running a model that does not fit entirely in GPU memory — some layers on GPU, the rest on CPU. Slower than full GPU, and it runs where otherwise it would not.']
    ]
  },

  {
    id: 'vram-ram-requirements',
    title: 'VRAM & RAM Requirements',
    domain: 'quantization', tier: 2, priority: 'medium',
    summary: 'What memory a model actually needs, and why the weights are only part of it.',
    what: `Running a model requires memory for the weights, the KV cache, activations and framework overhead. GPU memory (VRAM) is the binding constraint for GPU inference; system RAM matters for CPU inference and offload.`,
    why: `Sizing on weights alone is the most common reason a model that "should fit" fails — usually at the worst moment, under concurrency or on a long context, rather than at load time.`,
    analogy: `Renting a van by the size of the sofa. The sofa fits. The packing material, the tools and the second load do not, and you discover that halfway through the move.`,
    technical: `The components:
- **Weights** — parameters × bytes per parameter. Fixed and predictable.
- **KV cache** — scales with context length × concurrent requests. Frequently the largest component under load.
- **Activations** — intermediate values, roughly 5–10% of weights for inference.
- **Framework overhead** — CUDA context, fragmentation. Budget 1–2GB.

Rules of thumb: single-user inference needs roughly 1.2× the weight size. Serving concurrency needs weights plus a KV cache that scales linearly with users and context.

**Reducing KV cache** is how you increase concurrency: grouped-query attention (a model architecture property), shorter contexts, KV-cache quantization, and paged attention in vLLM which eliminates fragmentation waste.

For CPU inference, system RAM replaces VRAM and memory *bandwidth* becomes the bottleneck rather than capacity — which is why CPU generation is slow even when the model fits comfortably.`,
    diagram: `
   WHAT ACTUALLY OCCUPIES MEMORY (8B model, 4-bit)

     weights           ████████            4.5 GB   fixed
     KV cache          ██                  1.1 GB   1 user, 8k
     activations       ▌                   0.3 GB
     framework         ██                  1.5 GB
     ─────────────────────────────────────────────
     total                                 7.4 GB   ONE user

   UNDER CONCURRENCY, THE KV CACHE DOMINATES

     users   weights   KV cache   total
     ─────   ───────   ────────   ─────
        1     4.5 GB     1.1 GB    7.4 GB
        8     4.5 GB     8.6 GB   14.9 GB
       20     4.5 GB    21.5 GB   27.8 GB
       40     4.5 GB    43.0 GB   49.3 GB

     The weights never change. Concurrency is a KV-cache problem.

   REDUCING THE KV CACHE = MORE CONCURRENCY

     grouped-query attention   a model architecture property
     shorter max context       a product decision
     KV-cache quantization     8-bit KV, ~half the size
     paged attention (vLLM)    removes fragmentation waste

   ⚠ CPU INFERENCE: BANDWIDTH, NOT CAPACITY

     the model fits comfortably in 64GB of RAM
     and generation is still slow, because every token
     requires reading the whole model from memory

     capacity says yes · bandwidth says slow`,
    example: {
      language: 'python',
      caption: 'A memory budget that includes everything',
      code: `def memory_budget(params_b, bits, *, context=8192, concurrent=1,
                  layers=32, kv_heads=8, head_dim=128, kv_bits=16):
    """Every component, not just the weights."""
    weights = params_b * 1e9 * (bits / 8) / 1e9

    # 2 tensors (K and V) × layers × kv_heads × head_dim
    #   × context × concurrent × bytes
    kv = (2 * layers * kv_heads * head_dim * context
          * concurrent * (kv_bits / 8)) / 1e9

    activations = weights * 0.07
    framework = 1.5                         # CUDA context, fragmentation

    return {
        "weights": round(weights, 1),
        "kv_cache": round(kv, 1),
        "activations": round(activations, 1),
        "framework": framework,
        "total": round(weights + kv + activations + framework, 1),
    }

print("single user:")
print(memory_budget(8, 4))
# {'weights': 4.0, 'kv_cache': 1.1, 'activations': 0.3, 'framework': 1.5, 'total': 6.9}

print("\\nconcurrency on a 24GB card:")
for users in (1, 8, 16, 24):
    b = memory_budget(8, 4, concurrent=users)
    fits = "✓" if b["total"] < 24 * 0.92 else "✗"
    print(f"  {fits} {users:>2} users: {b['total']:>5.1f} GB "
          f"(kv {b['kv_cache']:>5.1f})")
#   ✓  1 users:   6.9 GB (kv   1.1)
#   ✓  8 users:  14.4 GB (kv   8.6)
#   ✓ 16 users:  21.9 GB (kv  17.2)
#   ✗ 24 users:  29.4 GB (kv  25.8)

print("\\nwith 8-bit KV cache:")
print(memory_budget(8, 4, concurrent=24, kv_bits=8)["total"], "GB")
# 16.5 GB  ← halving the KV cache nearly doubles concurrency

# The lever for concurrency is the KV cache, not the weights.`
    },
    prereq: ['model-size-parameters', 'precision-formats'], next: ['cpu-vs-gpu-inference'],
    related: ['self-attention-qkv', 'latency-throughput', 'hosted-vs-self-hosted', 'quantization'],
    tools: ['vllm', 'ollama', 'transformers'],
    useCases: [
      'Sizing a GPU for a target concurrency.',
      'Diagnosing out-of-memory failures under load.',
      'Deciding whether to shorten max context to serve more users.'
    ],
    avoid: [
      'Sizing on weights alone.',
      'Running at 100% memory utilisation with no headroom.'
    ],
    mistakes: [
      'Budgeting for weights and being surprised by out-of-memory under concurrency.',
      'Not accounting for framework overhead, which is 1–2GB before anything loads.',
      'Assuming CPU inference is fine because the model fits — bandwidth, not capacity, is the constraint.',
      'Ignoring KV-cache quantization, which is often the cheapest way to raise concurrency.'
    ],
    keyTerms: [
      ['VRAM', 'GPU memory. The binding constraint for GPU inference.'],
      ['KV cache', 'Scales with context and concurrency. Usually the largest variable component.'],
      ['activations', 'Intermediate values during a forward pass.'],
      ['framework overhead', 'CUDA context and fragmentation. 1–2GB.'],
      ['grouped-query attention', 'An architecture that shrinks the KV cache.'],
      ['KV-cache quantization', 'Storing the cache at lower precision.'],
      ['memory bandwidth', 'The CPU-inference bottleneck, not capacity.']
    ],
    resources: [
      ['Hugging Face — model memory anatomy', 'https://huggingface.co/docs/transformers/model_memory_anatomy', 'docs'],
      ['vLLM — paged attention', 'https://docs.vllm.ai/en/latest/design/kernel/paged_attention.html', 'docs'],
      ['Hugging Face — model memory calculator', 'https://huggingface.co/spaces/hf-accelerate/model-memory-usage', 'interactive'],
      ['Hugging Face — KV cache', 'https://huggingface.co/docs/transformers/kv_cache', 'docs']
    ],
    questions: [
      ['Why does a model that fits still run out of memory?', 'The KV cache scales with context length and concurrent requests. Weights are fixed; the cache is what grows under load, and it frequently exceeds the weights.'],
      ['What is the cheapest lever for increasing concurrency?', 'Reducing the KV cache — 8-bit KV quantization roughly halves it, which nearly doubles the number of concurrent users on the same card.'],
      ['Why is CPU inference slow even when the model fits comfortably?', 'Memory bandwidth, not capacity, is the bottleneck. Every generated token requires reading the whole model from memory.']
    ]
  },

  {
    id: 'cpu-vs-gpu-inference',
    title: 'CPU vs GPU Inference',
    domain: 'quantization', tier: 2, priority: 'medium',
    summary: 'Why GPUs are dramatically faster, and when a CPU is nonetheless fine.',
    what: `GPUs perform the large parallel matrix multiplications a model needs far faster than CPUs, and they have much higher memory bandwidth. CPU inference works and is slower by roughly an order of magnitude.`,
    why: `It determines what hardware you need, what it costs, and what latency users will experience. It also explains a common surprise: adding CPU cores barely helps, because the bottleneck is memory bandwidth rather than compute.`,
    analogy: `A single very fast worker versus a large crew doing simple tasks simultaneously. Matrix multiplication is thousands of independent simple tasks, which is exactly the crew's advantage.`,
    technical: `Two properties matter:
- **Parallelism** — a GPU has thousands of cores; a CPU has tens. Matrix multiplication parallelises almost perfectly.
- **Memory bandwidth** — a modern GPU has 5–20× the bandwidth of a CPU. During generation, every token requires reading the entire model from memory, so bandwidth is the binding constraint for decode.

That second point explains why generation speed roughly tracks memory bandwidth rather than raw compute, and why adding CPU cores helps far less than expected.

Rough throughput for a 7B model at 4-bit: modern GPU 40–100 tokens/second, Apple Silicon (unified memory, high bandwidth) 15–40, and a typical desktop CPU 3–10.

**When CPU is fine**: batch processing where latency does not matter, very small models, embedding generation (which is a single forward pass, not autoregressive), development, and machines with no GPU.

**Apple Silicon** is a distinctive middle case: unified memory means the "GPU" can address all system RAM, so a Mac with 64GB can run models that would need an expensive dedicated card.`,
    diagram: `
   WHY GPUs WIN

     PARALLELISM      GPU thousands of cores · CPU tens
                      matrix multiply parallelises almost perfectly

     BANDWIDTH        GPU 1-3 TB/s · CPU 50-100 GB/s
                      ← the binding constraint for GENERATION

   ⚠ GENERATION IS BANDWIDTH-BOUND, NOT COMPUTE-BOUND

     every generated token requires reading the WHOLE model
     from memory

     which is why:
       adding CPU cores barely helps
       generation speed tracks bandwidth, not FLOPS

   THROUGHPUT, 7B AT 4-BIT (rough)

     modern GPU        ████████████████████  40-100 tok/s
     Apple Silicon     ████████              15-40 tok/s
     desktop CPU       ██                     3-10 tok/s

   WHEN CPU IS GENUINELY FINE

     ✓ batch processing, latency irrelevant
     ✓ very small models (under ~3B)
     ✓ EMBEDDINGS — a single forward pass, not autoregressive
     ✓ development and experimentation
     ✓ no GPU available

   ⚠ APPLE SILICON IS A DISTINCTIVE MIDDLE CASE

     unified memory → the GPU addresses ALL system RAM
     a 64GB Mac runs models needing an expensive dedicated card`,
    example: {
      language: 'python',
      caption: 'Estimating generation speed from memory bandwidth',
      code: `def tokens_per_second(params_b, bits, bandwidth_gb_s, efficiency=0.7):
    """Generation is bandwidth-bound: each token reads the whole model."""
    model_gb = params_b * (bits / 8)
    return round(bandwidth_gb_s * efficiency / model_gb, 1)

HARDWARE = {
    "RTX 4090":        1008,   # GB/s
    "A100 80GB":       2039,
    "H100":            3350,
    "M3 Max (unified)": 400,
    "desktop DDR5":      70,
}

print("7B model at 4-bit (3.5 GB):")
for name, bw in HARDWARE.items():
    print(f"  {name:<20} {tokens_per_second(7, 4, bw):>6.1f} tok/s")

#   RTX 4090              201.6 tok/s
#   A100 80GB             407.8 tok/s
#   H100                  670.0 tok/s
#   M3 Max (unified)       80.0 tok/s
#   desktop DDR5           14.0 tok/s

# These are optimistic upper bounds — real throughput is lower —
# but the RATIOS are the point, and they track bandwidth almost
# exactly.

print("\\n70B at 4-bit (35 GB):")
for name, bw in HARDWARE.items():
    print(f"  {name:<20} {tokens_per_second(70, 4, bw):>6.1f} tok/s")
#   RTX 4090               20.2 tok/s   (if it fits — 35GB does not on 24GB)
#   A100 80GB              40.8 tok/s
#   desktop DDR5            1.4 tok/s   ← unusable interactively

# ── WHERE CPU IS GENUINELY THE RIGHT CHOICE ────────────────
# Embeddings are a SINGLE forward pass, not autoregressive:
#   all-MiniLM-L6-v2 on CPU: ~1,400 chunks/second
# Indexing 50,000 chunks takes under a minute on a laptop.
# No GPU needed, and none would help much.`
    },
    prereq: ['vram-ram-requirements'], next: ['latency-throughput'],
    related: ['ollama', 'local-embedding-models', 'hosted-vs-self-hosted', 'gguf'],
    tools: ['ollama', 'vllm', 'sentence-transformers'],
    useCases: [
      'Estimating generation speed for given hardware.',
      'Deciding whether a GPU is necessary for a local workload.',
      'Explaining why embeddings are fine on CPU but generation is not.'
    ],
    avoid: [
      'CPU inference for interactive generation with a large model.',
      'Assuming more CPU cores will fix slow generation.'
    ],
    mistakes: [
      'Adding CPU cores to speed up generation, when bandwidth is the constraint.',
      'Assuming a GPU is needed for embeddings — they run well on CPU.',
      'Comparing hardware on FLOPS rather than memory bandwidth for generation workloads.',
      'Overlooking Apple Silicon’s unified memory, which changes what a laptop can run.'
    ],
    keyTerms: [
      ['memory bandwidth', 'The binding constraint for token generation.'],
      ['parallelism', 'Why GPUs handle matrix multiplication so much faster.'],
      ['tokens per second', 'Generation throughput. Tracks bandwidth.'],
      ['unified memory', 'Apple Silicon — the GPU addresses all system RAM.'],
      ['compute-bound vs bandwidth-bound', 'Prefill is compute-bound; decode is bandwidth-bound.'],
      ['batch processing', 'Where latency does not matter and CPU may suffice.']
    ],
    resources: [
      ['llama.cpp — performance discussion', 'https://github.com/ggml-org/llama.cpp/discussions', 'repo'],
      ['Hugging Face — LLM inference optimisation', 'https://huggingface.co/docs/transformers/llm_optims', 'docs'],
      ['vLLM — documentation', 'https://docs.vllm.ai/', 'docs'],
      ['Ollama — GPU support', 'https://docs.ollama.com/gpu', 'docs']
    ],
    questions: [
      ['Why does adding CPU cores barely speed up generation?', 'Generation is bandwidth-bound, not compute-bound. Every token requires reading the entire model from memory, so bandwidth is the constraint and cores do not address it.'],
      ['Why are embeddings fine on CPU when generation is not?', 'Embedding is a single forward pass per input rather than one pass per generated token. A small embedding model runs at over a thousand chunks per second on a CPU.'],
      ['What makes Apple Silicon distinctive?', 'Unified memory means the GPU can address all system RAM, so a 64GB machine can run models that would otherwise require an expensive dedicated card.']
    ]
  },

  {
    id: 'latency-throughput',
    title: 'Latency vs Throughput',
    domain: 'quantization', tier: 2, priority: 'medium',
    summary: 'How fast one request completes, versus how many requests you can serve per second.',
    what: `**Latency** is how long one request takes. **Throughput** is how many requests or tokens the system handles per unit time.

They are different quantities and often optimised against each other.`,
    why: `A configuration that minimises latency for one user usually wastes most of the hardware, and a configuration that maximises throughput usually makes individual requests slower. Which you optimise for is a product decision.`,
    analogy: `A restaurant kitchen. Cooking one dish at a time gets that dish out fastest. Cooking in batches serves far more people per hour, and each individual diner waits slightly longer.`,
    technical: `The mechanism is **batching**. Because generation is memory-bandwidth-bound, processing several requests together reads the model once and serves them all — so throughput rises dramatically while each individual request slows slightly.

**Continuous batching** (vLLM, TGI) is the modern form: requests join and leave the batch as they finish, rather than waiting for a fixed batch to complete. It is the single largest throughput improvement available when self-hosting.

**Paged attention** manages the KV cache in pages, eliminating fragmentation waste and allowing far higher concurrency for the same memory.

The two latency numbers to track separately: **time to first token** (prefill, compute-bound) and **tokens per second** thereafter (decode, bandwidth-bound). With streaming, users experience the first; total time matters for cost and for non-streaming consumers.

Interactive products optimise latency; batch pipelines optimise throughput. Serving many interactive users requires both, which is exactly what continuous batching provides.`,
    diagram: `
   BATCHING: WHY THROUGHPUT AND LATENCY TRADE OFF

     batch size 1     one request reads the whole model
                      lowest latency · most hardware idle

     batch size 32    one read serves 32 requests
                      each slightly slower · ~20x the throughput

   CONTINUOUS BATCHING — the modern form

     static batch     [A B C D] ──── all wait for the slowest ────►
     continuous       [A B C D]
                       A done → E joins
                       C done → F joins
                      requests join and leave as they finish

     the single largest throughput gain available when self-hosting

   THE TWO LATENCY NUMBERS

     TIME TO FIRST TOKEN   prefill · compute-bound
                           what streaming users FEEL
     TOKENS PER SECOND     decode · bandwidth-bound
                           how fast the answer completes

     Track them separately. They have different causes and
     different fixes.

   WHICH TO OPTIMISE

     interactive product        latency
     batch pipeline             throughput
     many interactive users     BOTH → continuous batching`,
    example: {
      language: 'python',
      caption: 'The batching trade-off, and what continuous batching changes',
      code: `def batching_tradeoff(batch_size, model_gb=3.5, bandwidth_gb_s=1000,
                      output_tokens=200, efficiency=0.7):
    """Reading the model once serves the whole batch."""
    reads_per_second = bandwidth_gb_s * efficiency / model_gb
    tokens_per_second_total = reads_per_second * batch_size

    per_request_tps = tokens_per_second_total / batch_size
    latency_s = output_tokens / per_request_tps

    return {
        "batch": batch_size,
        "total_tok_s": round(tokens_per_second_total),
        "per_request_tok_s": round(per_request_tps, 1),
        "latency_s": round(latency_s, 2),
        "requests_per_min": round(60 / latency_s * batch_size),
    }

for b in (1, 4, 16, 64):
    print(batching_tradeoff(b))

# {'batch': 1,  'total_tok_s': 200,   'per_request_tok_s': 200.0, 'latency_s': 1.0,  'requests_per_min': 60}
# {'batch': 4,  'total_tok_s': 800,   'per_request_tok_s': 200.0, 'latency_s': 1.0,  'requests_per_min': 240}
# {'batch': 16, 'total_tok_s': 3200,  'per_request_tok_s': 200.0, 'latency_s': 1.0,  'requests_per_min': 960}
#
# In the idealised bandwidth model, batching is nearly free —
# which is exactly why continuous batching is such a large win.
# In practice per-request speed does degrade at large batch sizes
# from compute contention and KV-cache pressure, but the shape
# holds: throughput scales far better than latency degrades.

# ── SERVING WITH CONTINUOUS BATCHING ───────────────────────
# vllm serve meta-llama/Llama-3.1-8B-Instruct \\
#   --max-num-seqs 64 \\          # how many requests batch together
#   --max-model-len 8192 \\
#   --enable-prefix-caching       # reuse shared prompt prefixes

# ── MEASURE BOTH, SEPARATELY ───────────────────────────────
# metrics.histogram("ttft_ms", time_to_first_token)     # what users feel
# metrics.histogram("tok_per_s", output_tokens / decode_seconds)
# metrics.gauge("requests_in_flight", active_requests)  # batch occupancy`
    },
    prereq: ['cpu-vs-gpu-inference'], next: ['size-quality-tradeoff'],
    related: ['ai-latency', 'inference-llm', 'self-attention-qkv', 'hosted-vs-self-hosted'],
    tools: ['vllm', 'ollama'],
    useCases: [
      'Choosing a serving configuration for an interactive product.',
      'Raising throughput on existing hardware.',
      'Explaining why one-request-at-a-time serving wastes a GPU.'
    ],
    avoid: [
      'Optimising throughput on a latency-sensitive interactive feature without measuring the latency cost.',
      'Serving without batching, which leaves most of the hardware idle.'
    ],
    mistakes: [
      'Treating latency and throughput as the same number.',
      'Serving with Transformers rather than a batching stack, and concluding the hardware is inadequate.',
      'Reporting a single latency figure instead of time-to-first-token and tokens-per-second.',
      'Setting batch size very high on an interactive product without checking the latency effect.'
    ],
    keyTerms: [
      ['latency', 'How long one request takes.'],
      ['throughput', 'Requests or tokens per unit time.'],
      ['batching', 'Processing several requests together; reads the model once.'],
      ['continuous batching', 'Requests join and leave the batch dynamically.'],
      ['paged attention', 'KV-cache management that removes fragmentation waste.'],
      ['prefix caching', 'Reusing computation for shared prompt prefixes.'],
      ['batch occupancy', 'How full the batch is; low occupancy wastes hardware.']
    ],
    resources: [
      ['vLLM — documentation', 'https://docs.vllm.ai/', 'docs'],
      ['vLLM — paged attention design', 'https://docs.vllm.ai/en/latest/design/kernel/paged_attention.html', 'docs'],
      ['Hugging Face — Text Generation Inference', 'https://huggingface.co/docs/text-generation-inference/index', 'docs'],
      ['Hugging Face — LLM inference optimisation', 'https://huggingface.co/docs/transformers/llm_optims', 'docs']
    ],
    questions: [
      ['Why does batching improve throughput so dramatically?', 'Generation is memory-bandwidth-bound. Reading the model once serves the whole batch, so throughput scales close to linearly with batch size while per-request speed degrades only modestly.'],
      ['What does continuous batching change?', 'Requests join and leave the batch as they finish rather than waiting for a fixed batch to complete, which keeps the batch full and is the largest single throughput gain available when self-hosting.'],
      ['Which latency number do streaming users actually experience?', 'Time to first token. Total completion time matters for cost and for non-streaming consumers, but a fifteen-second answer with a 0.4-second first token feels fast.']
    ]
  },

  {
    id: 'size-quality-tradeoff',
    title: 'The Size, Quality, Cost Trade-off',
    domain: 'quantization', tier: 2, priority: 'high',
    summary: 'Bigger models are better and slower and more expensive — and the right choice is rarely the biggest.',
    what: `Model size trades against quality, latency, memory and cost simultaneously. The decision is which point on that curve your product actually needs.`,
    why: `Teams default to the largest model they can afford, and frequently a much smaller one would pass their evaluation at a fraction of the cost and latency. The only way to know is to measure on your own task.`,
    analogy: `Choosing a vehicle for a commute. The fastest is not the answer; the answer is the cheapest one that gets you there on time. But you have to know the route before you can say which that is.`,
    technical: `The four axes move together:
- **Quality** — improves with size, with diminishing returns, and the gap narrows on easy tasks.
- **Latency** — worsens roughly linearly with size, because generation is bandwidth-bound.
- **Memory** — scales directly with size × precision.
- **Cost** — scales with size for self-hosting, and with the provider's tier for APIs.

The decisive insight: **the quality gap between model sizes is task-dependent**. On straightforward extraction and classification, a small model often matches a large one. On multi-step reasoning, the gap is wide. Measuring per task category rather than overall is what makes the decision.

**Routing** exploits this: send the easy majority to a small model and escalate the hard minority. A well-tuned router typically keeps 70–85% of traffic on the cheap model with negligible quality loss.

The practical method: evaluate three sizes on your golden set, broken down by task category, and pick the smallest that clears your quality bar. Then consider routing for whatever it fails on.`,
    diagram: `
   THE FOUR AXES MOVE TOGETHER

     size ↑   quality ↑ (diminishing)
              latency ↑
              memory  ↑
              cost    ↑

   ⚠ THE QUALITY GAP IS TASK-DEPENDENT

     task category          small (3B)  medium (14B)  large (70B)
     ─────────────────      ──────────  ────────────  ───────────
     classification            0.91         0.93          0.94
     extraction                0.88         0.92          0.93
     grounded Q&A              0.84         0.91          0.93
     multi-step reasoning      0.52         0.74          0.89   ← wide

     On the first two, the small model is essentially as good.
     On the last, it is not close.

     An OVERALL average would have hidden both facts.

   ROUTING EXPLOITS THIS

     request ──► classify difficulty
                     │
          ┌──────────┴──────────┐
       easy (78%)           hard (22%)
          │                     │
       small model          large model
       $0.003/call          $0.031/call

       blended cost $0.009  ← 3.4x cheaper than large-only
       quality within 1 point on the golden set

   THE METHOD

     1  evaluate three sizes on YOUR golden set
     2  break results down BY TASK CATEGORY
     3  pick the smallest that clears your bar
     4  consider routing for whatever it fails on`,
    example: {
      language: 'python',
      caption: 'Choosing a size from measured data, then routing',
      code: `def compare_sizes(golden_set, models):
    """Break results down BY CATEGORY. The average hides the decision."""
    results = {}
    for name, cfg in models.items():
        by_cat, latencies, costs = {}, [], []
        for case in golden_set:
            out = generate(case["input"], cfg)
            by_cat.setdefault(case["category"], []).append(
                score(case, out["text"]))
            latencies.append(out["latency_ms"])
            costs.append(out["cost"])
        results[name] = {
            "by_category": {c: round(sum(s)/len(s), 2)
                            for c, s in by_cat.items()},
            "p95_latency_ms": sorted(latencies)[int(len(latencies)*0.95)],
            "cost_per_call": round(sum(costs)/len(costs), 5),
        }
    return results

# small  {'classification': 0.91, 'extraction': 0.88, 'reasoning': 0.52,
#         'p95_latency_ms': 620,  'cost_per_call': 0.0031}
# medium {'classification': 0.93, 'extraction': 0.92, 'reasoning': 0.74,
#         'p95_latency_ms': 1840, 'cost_per_call': 0.0112}
# large  {'classification': 0.94, 'extraction': 0.93, 'reasoning': 0.89,
#         'p95_latency_ms': 3210, 'cost_per_call': 0.0310}

# ── ROUTING: small by default, escalate on difficulty ──────
def route(request, classifier, small, large, threshold=0.6):
    difficulty = classifier.score(request)      # cheap: a small classifier
    model = large if difficulty > threshold else small
    result = generate(request, model)

    # Escalate if the small model produced a low-confidence or
    # ungrounded answer — a second safety net
    if model is small and result.get("groundedness", 1) < 0.75:
        metrics.increment("router.escalated")
        result = generate(request, large)

    metrics.increment("router.choice",
                      tags={"model": "large" if model is large else "small"})
    return result

# Measured over a week:
#   78% handled by small · blended cost $0.0091/call
#   overall golden-set quality 0.90 vs 0.91 for large-only
#   3.4x cheaper, one point of quality`
    },
    prereq: ['model-size-parameters', 'quantization'], next: [],
    related: ['ai-model-selection', 'ai-cost', 'ai-latency', 'inference-llm', 'model-families'],
    tools: ['ollama', 'anthropic', 'openai', 'vllm'],
    useCases: [
      'Choosing the smallest model that meets your quality bar.',
      'Designing a routing strategy to cut cost.',
      'Justifying a model choice with measured evidence.'
    ],
    avoid: [
      'Defaulting to the largest affordable model without measuring.',
      'Choosing on an overall average, which hides the task-dependent gap.'
    ],
    mistakes: [
      'Not breaking evaluation down by task category, so the decision is made on an average that describes nothing.',
      'Assuming the quality gap is uniform across tasks — it is wide on reasoning and narrow on extraction.',
      'Routing on cost alone without measuring quality per route.',
      'Never revisiting the choice as smaller models improve.'
    ],
    keyTerms: [
      ['diminishing returns', 'Quality improves with size, less each time.'],
      ['task-dependent gap', 'The size difference matters far more on some tasks than others.'],
      ['model routing', 'Sending easy requests to a small model, escalating the rest.'],
      ['blended cost', 'Average cost across a routed traffic mix.'],
      ['escalation', 'Retrying with a larger model when the small one is unsure.'],
      ['quality bar', 'The threshold your product actually requires.']
    ],
    resources: [
      ['Anthropic — choosing a model', 'https://docs.anthropic.com/en/docs/about-claude/models/choosing-a-model', 'docs'],
      ['Anthropic — pricing', 'https://docs.anthropic.com/en/docs/about-claude/pricing', 'docs'],
      ['Chinchilla — training compute-optimal LLMs', 'https://arxiv.org/abs/2203.15556', 'paper'],
      ['LMSYS Chatbot Arena', 'https://lmarena.ai/', 'interactive']
    ],
    questions: [
      ['Why must model comparison be broken down by task category?', 'The quality gap is task-dependent. A small model can match a large one on extraction and classification while losing badly on multi-step reasoning, and an overall average hides both facts.'],
      ['How does routing reduce cost?', 'The easy majority goes to a small cheap model and the hard minority escalates. Typically 70–85% of traffic stays on the cheap model, cutting blended cost several-fold for around a point of quality.'],
      ['What is the practical method for choosing a size?', 'Evaluate three sizes on your golden set, break the results down by category, pick the smallest that clears your bar, and consider routing for whatever it fails on.']
    ]
  }
];
