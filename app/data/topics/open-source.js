/**
 * DOMAIN I — OPEN SOURCE AI + HUGGING FACE (BUILD.md section 12)
 * "Explain from absolute zero."
 */
export const topics = [
  {
    id: 'huggingface',
    title: 'What Is Hugging Face?',
    domain: 'open-source', tier: 1, priority: 'high',
    summary: 'The shared public library of open machine learning — models, datasets, and the code to use them.',
    what: `Hugging Face is a website and a set of libraries. The website hosts models, datasets and demos that anyone can download. The libraries are the standard way to load and run them.

Think of it as the place open AI is published.`,
    why: `If you are going to work with open models at all, you will be on Hugging Face constantly — reading model cards, checking licences, comparing benchmarks. Understanding what is there and how to read it is a practical skill, not background.`,
    analogy: `A public library plus a set of standard shelves. Anyone can deposit a book; anyone can borrow one; and every book is catalogued the same way so you can find and use it without a conversation first.`,
    technical: `Three things live on the Hub:
- **Models** — weights, configuration and a **model card** describing what it is, how it was trained, and its licence.
- **Datasets** — training and evaluation data, versioned and downloadable.
- **Spaces** — hosted demos, useful for trying a model before downloading it.

The libraries: **Transformers** (loading and running models), **Datasets** (loading data), **Tokenizers**, **PEFT** (LoRA fine-tuning), **TRL** (fine-tuning and preference training), **Accelerate** (multi-GPU).

Practical reading skills:
- **Check the licence first.** "Open" is not one thing; some models are research-only or restrict commercial use above a revenue threshold.
- **Read the model card** for training data, intended use and limitations.
- **Check the variant** — base versus instruct, and which quantization.
- **Note the size** — a "7B" model is roughly 14GB at FP16 and will not silently fit on your laptop.

Anyone can upload anything. Treat a random model as you would a random package on any public registry.`,
    diagram: `
   WHAT LIVES ON THE HUB

     MODELS      weights + config + MODEL CARD
                 meta-llama/Llama-3.1-8B-Instruct
                                       └──┬───┘
                                     ⚠ base vs INSTRUCT matters

     DATASETS    training and evaluation data, versioned

     SPACES      hosted demos — try before downloading

   THE LIBRARIES

     transformers   load and run models
     datasets       load data
     tokenizers     the tokenizer, standalone
     peft           LoRA and parameter-efficient fine-tuning
     trl            fine-tuning and preference training
     accelerate     multi-GPU and mixed precision

   READING A MODEL PAGE — in order

     1  LICENCE      ← FIRST. "Open" is not one thing.
                       some are research-only, some restrict
                       commercial use above a revenue threshold
     2  VARIANT      base or instruct? which quantization?
     3  MODEL CARD   training data · intended use · limitations
     4  SIZE         "7B" ≈ 14GB at FP16. Not a laptop download.
     5  DOWNLOADS    a weak popularity signal, not a quality one

   ⚠ ANYONE CAN UPLOAD ANYTHING.
     Treat an unfamiliar model like an unfamiliar package on
     any public registry.`,
    example: {
      language: 'python',
      caption: 'Finding, inspecting and loading a model',
      code: `from huggingface_hub import HfApi, model_info

api = HfApi()

# ── SEARCH ─────────────────────────────────────────────────
for m in api.list_models(task="sentence-similarity",
                         sort="downloads", direction=-1, limit=5):
    print(f"{m.id:<45} {m.downloads:>10,} downloads")

# ── INSPECT BEFORE DOWNLOADING ─────────────────────────────
info = model_info("meta-llama/Llama-3.1-8B-Instruct", files_metadata=True)

print("licence:", info.card_data.get("license"))
print("tags:", info.tags[:8])

# Size matters — this is not a casual download
total_gb = sum(f.size or 0 for f in info.siblings) / 1e9
print(f"total download: {total_gb:.1f} GB")

# Is it gated? Many strong models require accepting terms
print("gated:", info.gated)

# ── LOAD ───────────────────────────────────────────────────
from transformers import AutoTokenizer, AutoModelForCausalLM

MODEL = "meta-llama/Llama-3.1-8B-Instruct"   # note: INSTRUCT, not base
tok = AutoTokenizer.from_pretrained(MODEL)
model = AutoModelForCausalLM.from_pretrained(MODEL, device_map="auto",
                                             load_in_4bit=True)  # fits in ~5GB

# ALWAYS use the model's own chat template — see instruction tuning
messages = [{"role": "user", "content": "Explain RAG in two sentences."}]
prompt = tok.apply_chat_template(messages, tokenize=False,
                                 add_generation_prompt=True)

# ── THE CHECKS THAT SAVE TIME ──────────────────────────────
# licence permits your use?          read it, do not assume
# instruct variant, not base?        check the model id
# fits in available memory?          size × precision
# tokenizer paired with the model?   always load both together`
    },
    prereq: [], next: ['what-is-a-model', 'model-card'],
    related: ['transformers-library', 'open-vs-closed-models', 'ollama'],
    tools: ['huggingface', 'transformers', 'sentence-transformers'],
    useCases: [
      'Finding a model for a specific task.',
      'Checking a licence before anyone gets attached to a model.',
      'Downloading an embedding or reranking model for local use.'
    ],
    avoid: [
      'Downloading an unfamiliar model into a production environment without review.',
      'Choosing by download count, which measures popularity rather than fit.'
    ],
    mistakes: [
      'Downloading the base variant and concluding the model cannot follow instructions.',
      'Not checking the licence until after the model is embedded in a product.',
      'Assuming "7B" is a small download — it is roughly 14GB at full precision.',
      'Loading a model without its paired tokenizer.',
      'Treating the Hub as curated. Anyone can upload anything.'
    ],
    keyTerms: [
      ['Hugging Face Hub', 'The site hosting models, datasets and demos.'],
      ['model card', 'The documentation describing a model.'],
      ['Spaces', 'Hosted demos for trying a model.'],
      ['gated model', 'One requiring you to accept terms before downloading.'],
      ['transformers', 'The standard library for loading and running models.'],
      ['base vs instruct', 'Raw pretrained model versus instruction-tuned.'],
      ['licence', 'The legal terms. Varies enormously; read it.']
    ],
    resources: [
      ['Hugging Face — documentation', 'https://huggingface.co/docs', 'docs'],
      ['Hugging Face — Hub overview', 'https://huggingface.co/docs/hub/index', 'docs'],
      ['Hugging Face — NLP course', 'https://huggingface.co/learn/nlp-course', 'course'],
      ['Hugging Face — models', 'https://huggingface.co/models', 'reference'],
      ['MTEB leaderboard', 'https://huggingface.co/spaces/mteb/leaderboard', 'interactive']
    ],
    questions: [
      ['What should you check first on a model page?', 'The licence. "Open" covers everything from fully permissive to research-only or commercially restricted above a revenue threshold, and finding out late is expensive.'],
      ['What is the difference between a base and an instruct model on the Hub?', 'Base is the raw pretrained model that continues text; instruct has been fine-tuned to follow instructions. Downloading the wrong one is a common and confusing first experience.'],
      ['How large is a "7B" model download?', 'Roughly 14GB at 16-bit precision, or about 4–5GB quantized to 4-bit. It is not a casual download and it will not silently fit on a small machine.']
    ]
  },

  {
    id: 'what-is-a-model',
    title: 'What Is a Model, Concretely?',
    domain: 'open-source', tier: 1, priority: 'high',
    summary: 'A file of numbers plus a configuration describing how to use them.',
    what: `A model, as an artifact, is a set of files: the **weights** (a large binary of numbers), a **config** describing the architecture, and a **tokenizer** defining how text becomes numbers.

That is all. There is no database of facts and no program of rules.`,
    why: `Demystifying this removes a lot of confusion. It explains why you cannot edit a fact in a model, why the tokenizer must travel with the weights, why model size is a memory number, and why "downloading a model" is downloading a file.`,
    analogy: `A synthesiser patch. A file of parameter settings that produces a sound. There is no recording inside it; the sound comes entirely from how the settings are configured.`,
    technical: `A typical model directory contains:
- \`model.safetensors\` — the weights. The bulk of the size.
- \`config.json\` — architecture: layer count, hidden size, attention heads, vocabulary size.
- \`tokenizer.json\` and \`tokenizer_config.json\` — the vocabulary and how to split text.
- \`generation_config.json\` — default generation parameters.
- Often a chat template, embedded in the tokenizer config.

**Safetensors** is the standard format. The older pickle-based \`.bin\` format can execute arbitrary code on load, which is a genuine supply-chain risk; prefer safetensors.

The weights and the tokenizer are a **matched pair**. A different tokenizer produces different ids for the same text, and the model has learned associations for specific ids — so mixing them produces noise, not degraded output.

**Checkpoint** means a saved snapshot of weights, usually from a specific point in training.`,
    diagram: `
   WHAT IS ACTUALLY IN A MODEL DIRECTORY

     model.safetensors          ██████████████████  14.0 GB
       the weights — a large array of numbers

     config.json                ▏                    2 KB
       { "num_hidden_layers": 32, "hidden_size": 4096,
         "num_attention_heads": 32, "vocab_size": 128256 }

     tokenizer.json             █                    9 MB
       the vocabulary and merge rules

     tokenizer_config.json      ▏                    3 KB
       includes the CHAT TEMPLATE

     generation_config.json     ▏                    1 KB
       default temperature, top_p, stop tokens

   That is the whole model. No fact database. No rule engine.

   ⚠ WEIGHTS AND TOKENIZER ARE A MATCHED PAIR

     tokenizer A: "hello" → 31373
     tokenizer B: "hello" → 7592

     The model learned associations for SPECIFIC IDS.
     Mixing them produces noise, not slightly worse output.

   ⚠ FILE FORMAT IS A SECURITY DECISION

     .safetensors   safe · just numbers · the standard
     .bin (pickle)  can EXECUTE ARBITRARY CODE on load
                    → a real supply-chain risk`,
    example: {
      language: 'python',
      caption: 'Looking inside a model to see there is nothing mysterious there',
      code: `import json
from safetensors import safe_open
from transformers import AutoConfig

# ── THE CONFIG: the architecture, as plain JSON ────────────
cfg = AutoConfig.from_pretrained("meta-llama/Llama-3.1-8B-Instruct")
print(json.dumps({
    "layers": cfg.num_hidden_layers,
    "hidden_size": cfg.hidden_size,
    "attention_heads": cfg.num_attention_heads,
    "vocab_size": cfg.vocab_size,
    "max_position_embeddings": cfg.max_position_embeddings,
}, indent=2))
# { "layers": 32, "hidden_size": 4096, "attention_heads": 32,
#   "vocab_size": 128256, "max_position_embeddings": 131072 }

# ── THE WEIGHTS: named arrays of numbers ───────────────────
with safe_open("model-00001-of-00004.safetensors", framework="pt") as f:
    for i, key in enumerate(f.keys()):
        if i >= 5: break
        tensor = f.get_slice(key)
        print(f"{key:<50} {tensor.get_shape()}  {tensor.get_dtype()}")

# model.embed_tokens.weight                     [128256, 4096]  BF16
# model.layers.0.self_attn.q_proj.weight        [4096, 4096]    BF16
# model.layers.0.self_attn.k_proj.weight        [1024, 4096]    BF16
# model.layers.0.mlp.gate_proj.weight           [14336, 4096]   BF16
# model.layers.0.mlp.down_proj.weight           [4096, 14336]   BF16

# ── COMPUTE THE SIZE FROM THE ARCHITECTURE ─────────────────
params = (cfg.vocab_size * cfg.hidden_size * 2          # embeddings in/out
          + cfg.num_hidden_layers * (
              4 * cfg.hidden_size ** 2                   # attention
              + 3 * cfg.hidden_size * cfg.intermediate_size))  # MLP
print(f"\\n~{params/1e9:.1f}B parameters")
print(f"FP16: {params * 2 / 1e9:.1f} GB")
print(f"INT4: {params * 0.5 / 1e9:.1f} GB")
# ~8.0B parameters
# FP16: 16.1 GB
# INT4: 4.0 GB

# There is nothing else in there. The apparent knowledge is
# entirely in how those numbers are set.`
    },
    prereq: ['huggingface', 'parameters-weights'], next: ['model-repository', 'checkpoints'],
    related: ['tokenizer', 'quantization', 'gguf', 'model-size-parameters'],
    tools: ['huggingface', 'transformers'],
    useCases: [
      'Understanding what "downloading a model" actually involves.',
      'Computing memory requirements from the config before trying to load it.',
      'Explaining why facts cannot be edited in a model.'
    ],
    avoid: [
      'Loading pickle-format weights from an untrusted source.',
      'Mixing a tokenizer from one model with another model.'
    ],
    mistakes: [
      'Expecting to find or edit facts inside a model file.',
      'Loading `.bin` weights from an unfamiliar uploader, which can execute code.',
      'Separating the tokenizer from the weights.',
      'Assuming the download size equals the memory needed — activations and KV cache add more.'
    ],
    keyTerms: [
      ['weights', 'The learned numbers. The bulk of the file.'],
      ['config.json', 'The architecture description.'],
      ['safetensors', 'The safe standard weight format. Just numbers.'],
      ['pickle / .bin', 'The older format. Can execute code on load.'],
      ['checkpoint', 'A saved snapshot of weights.'],
      ['sharded weights', 'A large model split across several files.'],
      ['matched pair', 'Weights and tokenizer must travel together.']
    ],
    resources: [
      ['Hugging Face — safetensors', 'https://huggingface.co/docs/safetensors/index', 'docs'],
      ['Hugging Face — model configuration', 'https://huggingface.co/docs/transformers/main_classes/configuration', 'docs'],
      ['Hugging Face — security and pickle scanning', 'https://huggingface.co/docs/hub/security-pickle', 'docs']
    ],
    questions: [
      ['What files make up a model?', 'The weights, a config describing the architecture, and the tokenizer. Plus a generation config and usually a chat template. There is no fact database and no rule engine.'],
      ['Why must the tokenizer travel with the weights?', 'The model learned associations for specific token ids. A different tokenizer produces different ids for the same text, so the model reads entirely different words.'],
      ['Why prefer safetensors over the older .bin format?', 'Pickle-based weights can execute arbitrary code when loaded, which is a genuine supply-chain risk. Safetensors contains only numbers.']
    ]
  },

  {
    id: 'model-repository',
    title: 'Model Repositories',
    domain: 'open-source', tier: 2, priority: 'medium',
    summary: 'A model on the Hub is a git repository, with all that implies.',
    what: `A model repository is a git repo containing the model files, its documentation, and its history. Versions are git revisions, and large files are handled by git-LFS.`,
    why: `Understanding it as a repository explains how to pin a version, how to see what changed, and why "the model was updated" is a real thing that can happen under you if you pull from a branch rather than a revision.`,
    analogy: `A software package repository. You can install "latest" and get whatever is current, or pin an exact revision and get the same thing every time. Only one of those is reproducible.`,
    technical: `Structure: files at the repo root, a \`README.md\` that renders as the model card, and revisions (branches, tags, commit hashes).

**Pin the revision** in anything reproducible. \`from_pretrained(model, revision="abc123")\` fetches an exact commit; without it you get the current head of \`main\`, which can change.

**Gated repositories** require accepting terms before download, and access is tied to your account token. Plan for that in automated environments — a build that suddenly cannot download a model is usually a gating or token problem.

Repositories also carry **variants**: different quantizations, GGUF conversions, or fine-tunes published as separate repos by the community. The relationship between them is by convention, not enforced, so check who published a derivative before trusting it.

Caching: downloads land in a local cache directory and are reused. In containers, mount that cache or every build re-downloads gigabytes.`,
    diagram: `
   A MODEL REPO IS A GIT REPO

     meta-llama/Llama-3.1-8B-Instruct
     ├── README.md              → renders as the MODEL CARD
     ├── config.json
     ├── model-00001-of-00004.safetensors   (git-LFS)
     ├── tokenizer.json
     └── generation_config.json

     revisions: main · tags · commit hashes

   ⚠ PIN THE REVISION FOR REPRODUCIBILITY

     from_pretrained(MODEL)                    ← head of main,
                                                 can change
     from_pretrained(MODEL, revision="abc123") ← exact commit

   VARIANTS ARE SEPARATE REPOS, LINKED BY CONVENTION

     meta-llama/Llama-3.1-8B-Instruct          official
     TheBloke/…-GGUF                           community conversion
     someone/…-finetuned-legal                 community fine-tune

     The relationship is CONVENTION, not enforcement.
     Check who published a derivative before trusting it.

   ⚠ GATED REPOS

     require accepting terms · access tied to your token
     → a CI build that suddenly cannot download a model is
       usually a gating or token problem, not a network one

   ⚠ CACHING IN CONTAINERS

     downloads land in ~/.cache/huggingface and are reused
     → mount it, or every build re-downloads gigabytes`,
    example: {
      language: 'python',
      caption: 'Pinning a revision and handling gated access',
      code: `from transformers import AutoModelForCausalLM, AutoTokenizer
from huggingface_hub import list_repo_refs, model_info
import os

MODEL = "meta-llama/Llama-3.1-8B-Instruct"

# ── SEE THE AVAILABLE REVISIONS ────────────────────────────
refs = list_repo_refs(MODEL)
for branch in refs.branches:
    print(f"branch {branch.name:<12} {branch.target_commit[:8]}")
for tag in refs.tags:
    print(f"tag    {tag.name:<12} {tag.target_commit[:8]}")

# ── PIN IT ─────────────────────────────────────────────────
REVISION = "0e9e39f"          # an exact commit, recorded in config

model = AutoModelForCausalLM.from_pretrained(
    MODEL,
    revision=REVISION,        # reproducible — head of main is not
    device_map="auto",
    token=os.environ.get("HF_TOKEN"),      # gated repos need this
)
tok = AutoTokenizer.from_pretrained(MODEL, revision=REVISION)

# Record it alongside your other versions
VERSIONS = {"model_repo": MODEL, "model_revision": REVISION}

# ── HANDLE GATING EXPLICITLY ───────────────────────────────
info = model_info(MODEL)
if info.gated and not os.environ.get("HF_TOKEN"):
    raise RuntimeError(
        f"{MODEL} is gated. Accept the terms at "
        f"https://huggingface.co/{MODEL} and set HF_TOKEN."
    )
    # A clear error beats a confusing 401 in CI at 3am.

# ── CACHE IN CONTAINERS ────────────────────────────────────
# docker run -v hf-cache:/root/.cache/huggingface ...
# Without this, every build downloads the model again.`
    },
    prereq: ['what-is-a-model'], next: ['dataset-repository', 'model-card'],
    related: ['git-basics', 'model-versioning', 'checkpoints'],
    tools: ['huggingface', 'git'],
    useCases: [
      'Pinning an exact model revision for reproducibility.',
      'Diagnosing a CI failure caused by a gated repository.',
      'Understanding the relationship between official and community variants.'
    ],
    avoid: [
      'Unpinned model downloads in anything that must reproduce.',
      'Trusting a community derivative without checking the publisher.'
    ],
    mistakes: [
      'Not pinning the revision, so a repo update changes behaviour silently.',
      'Not mounting the cache in containers, re-downloading gigabytes per build.',
      'Assuming a community GGUF or fine-tune is official because the name matches.',
      'Discovering a repo is gated only when a production build fails.'
    ],
    keyTerms: [
      ['model repository', 'A git repo containing model files and documentation.'],
      ['revision', 'A branch, tag or commit hash. Pin it.'],
      ['git-LFS', 'How large weight files are stored.'],
      ['gated repository', 'Requires accepting terms; access tied to a token.'],
      ['variant', 'A quantization, conversion or fine-tune, usually in a separate repo.'],
      ['model cache', 'Local download cache. Mount it in containers.']
    ],
    resources: [
      ['Hugging Face — repositories', 'https://huggingface.co/docs/hub/repositories', 'docs'],
      ['Hugging Face — gated models', 'https://huggingface.co/docs/hub/models-gated', 'docs'],
      ['Hugging Face — cache management', 'https://huggingface.co/docs/huggingface_hub/guides/manage-cache', 'docs']
    ],
    questions: [
      ['Why pin a model revision?', 'Without it you get the current head of main, which the publisher can change. Pinning an exact commit is what makes a deployment reproducible.'],
      ['What usually causes a CI build to suddenly fail downloading a model?', 'A gated repository or a missing token, not a network problem. Checking gating explicitly and raising a clear error saves a lot of confusion.'],
      ['How are community variants related to the official repo?', 'By naming convention only, not by enforcement. A GGUF conversion or fine-tune in a separate repo may or may not be trustworthy — check the publisher.']
    ]
  },

  {
    id: 'dataset-repository',
    title: 'Dataset Repositories',
    domain: 'open-source', tier: 3, priority: 'low',
    summary: 'Public datasets for training and evaluation, with the same licence and provenance questions as models.',
    what: `Dataset repositories host training and evaluation data — instruction sets, benchmarks, domain corpora — versioned and loadable with one line.`,
    why: `They are useful for benchmarking and for supplementing fine-tuning data. They also carry provenance and licence questions that matter commercially: a dataset assembled by scraping, or generated by a model whose terms forbid it, can constrain what you may do with anything trained on it.`,
    analogy: `A public archive of source material. Extremely useful, and you still need to check where each item came from before publishing something built on it.`,
    technical: `Loading is trivial: \`load_dataset("name", split="train")\`, with **streaming** for datasets too large to fit locally.

The questions worth asking before using one:
- **Licence** — does it permit commercial use, and does that flow through to a model trained on it?
- **Provenance** — where did the data come from, and was it collected lawfully?
- **Generated data** — many instruction datasets are model-generated, and some model terms restrict using outputs to train competing models.
- **Contamination** — benchmark data leaking into training sets is common, and it inflates evaluation scores meaninglessly.
- **PII** — public datasets scraped from the web frequently contain personal data.

For evaluation, public benchmarks are useful for orientation and poor for deciding whether something works on *your* task. Build your own golden set; use public benchmarks as a sanity check.`,
    diagram: `
   USING A PUBLIC DATASET — the questions that matter

     LICENCE       does it permit commercial use?
                   does that flow through to a model trained on it?

     PROVENANCE    where did this come from?
                   was it collected lawfully?

     GENERATED?    many instruction datasets are MODEL-GENERATED
                   ⚠ some model terms restrict using outputs to
                     train competing models

     CONTAMINATION benchmark data leaking into training sets is
                   common — and inflates scores meaninglessly

     PII           web-scraped datasets frequently contain
                   personal data

   ⚠ PUBLIC BENCHMARKS vs YOUR GOLDEN SET

     public benchmark   orientation · comparability · widely gamed
                        → a sanity check

     your golden set    YOUR documents · YOUR users' questions
                        → the decision

     A strong benchmark score is weak evidence that something
     works on your task.

   ⚠ CONTAMINATION, CONCRETELY

     model trained on data that included the benchmark
       → benchmark score is memorisation, not capability
       → and you cannot easily tell from the outside`,
    example: {
      language: 'python',
      caption: 'Loading a dataset, and the checks before relying on it',
      code: `from datasets import load_dataset
from huggingface_hub import dataset_info

NAME = "databricks/databricks-dolly-15k"

# ── CHECK BEFORE LOADING ───────────────────────────────────
info = dataset_info(NAME)
print("licence:", info.card_data.get("license"))
print("tags:", info.tags[:6])
# licence: cc-by-sa-3.0
# ⚠ share-alike. Does that flow through to a model trained on it?
#   That is a legal question, and the answer affects your product.

# ── LOAD ───────────────────────────────────────────────────
ds = load_dataset(NAME, split="train")
print(ds)
print(ds[0])

# ── STREAMING for datasets too large to fit locally ────────
big = load_dataset("HuggingFaceFW/fineweb", split="train", streaming=True)
for i, row in enumerate(big):
    if i >= 3: break
    print(row["text"][:80])

# ── CONTAMINATION CHECK ────────────────────────────────────
def check_contamination(training_texts, benchmark_texts, n=8):
    """Do benchmark n-grams appear in the training data?"""
    def ngrams(text):
        words = text.lower().split()
        return {" ".join(words[i:i+n]) for i in range(len(words) - n)}

    train_grams = set()
    for t in training_texts:
        train_grams |= ngrams(t)

    contaminated = [b for b in benchmark_texts if ngrams(b) & train_grams]
    return len(contaminated) / len(benchmark_texts)

# rate = check_contamination(train_sample, benchmark_sample)
# 0.14 -> 14% of benchmark items appear in the training data.
#         Any score on that benchmark is partly memorisation.

# ── PII SCAN before using web-scraped data ─────────────────
findings = [pii_detector.scan(row["text"]) for row in ds.select(range(500))]
print("rows with PII:", sum(bool(f.has_findings) for f in findings))`
    },
    prereq: ['model-repository'], next: [],
    related: ['training-dataset-prep', 'golden-sets', 'privacy-pii', 'model-card'],
    tools: ['huggingface'],
    useCases: [
      'Benchmarking a model against a standard dataset.',
      'Supplementing fine-tuning data with public instruction sets.',
      'Checking for benchmark contamination before trusting a score.'
    ],
    avoid: [
      'Public benchmarks as the basis for a product decision.',
      'Datasets whose licence or provenance is unclear, in anything commercial.'
    ],
    mistakes: [
      'Not checking whether a dataset licence flows through to models trained on it.',
      'Using model-generated data without checking the generating model’s terms.',
      'Trusting a benchmark score without considering contamination.',
      'Using web-scraped data without a PII scan.',
      'Substituting public benchmarks for a golden set built from your own traffic.'
    ],
    keyTerms: [
      ['dataset repository', 'A hosted, versioned dataset.'],
      ['streaming', 'Iterating a dataset without downloading all of it.'],
      ['provenance', 'Where the data came from and how it was collected.'],
      ['contamination', 'Benchmark data leaking into training data.'],
      ['share-alike licence', 'Terms that may propagate to derived work.'],
      ['synthetic dataset', 'Model-generated data, subject to the generator’s terms.']
    ],
    resources: [
      ['Hugging Face — datasets documentation', 'https://huggingface.co/docs/datasets/index', 'docs'],
      ['Hugging Face — dataset cards', 'https://huggingface.co/docs/hub/datasets-cards', 'docs'],
      ['Datasheets for Datasets (paper)', 'https://arxiv.org/abs/1803.09010', 'paper'],
      ['Hugging Face — datasets', 'https://huggingface.co/datasets', 'reference']
    ],
    questions: [
      ['What licence question matters most for a training dataset?', 'Whether the terms flow through to a model trained on it. A share-alike dataset may constrain what you can do with the resulting model, which is a commercial question.'],
      ['What is benchmark contamination?', 'Benchmark data appearing in a model’s training set, so its score reflects memorisation rather than capability — and it is hard to detect from the outside.'],
      ['Why is a public benchmark weak evidence for your product?', 'It measures a generic task on curated data. Your documents, your users’ phrasing and your failure modes are different, which is why a golden set from real traffic is what decides.']
    ]
  },

  {
    id: 'model-card',
    title: 'Model Cards',
    domain: 'open-source', tier: 1, priority: 'high',
    summary: 'The documentation that tells you what a model is for, what it was trained on, and where it fails.',
    what: `A model card is the README of a model: intended use, training data, evaluation results, limitations, biases, and licence.

It is the first thing to read and the thing most often skipped.`,
    why: `It contains exactly the information a product decision needs — what this is for, what it is not for, what data shaped it, and what you are legally permitted to do with it. Skipping it is how teams end up committed to a model they cannot use commercially.`,
    analogy: `A medicine leaflet. Indications, contraindications, side effects and dosage. Nobody enjoys reading it, and skipping it is how people take the wrong thing.`,
    technical: `A good card covers:
- **Intended use** and, importantly, **out-of-scope use**.
- **Training data** — sources, size, languages, cutoff.
- **Evaluation** — benchmarks and results, ideally with the evaluation setup.
- **Limitations and biases** — where it underperforms, and for whom.
- **Licence** — the operative legal terms.
- **Environmental and compute** information, sometimes.

How to read one critically:
- **Languages** — a model trained overwhelmingly on English will underperform elsewhere, often without saying so plainly.
- **Evaluation setup** — a benchmark number without the prompt and settings used is not reproducible.
- **Absent limitations** — a card with no limitations section is a warning, not a reassurance.
- **Base or instruct** — usually stated in the name and confirmed in the card.

Cards vary enormously in quality. A thorough card is itself a signal about the publisher.`,
    diagram: `
   READING A MODEL CARD — what to look for

     INTENDED USE        what it is for
     OUT-OF-SCOPE USE    ← the section people skip, and the one
                           that tells you the most

     TRAINING DATA       sources · size · LANGUAGES · cutoff
                         ⚠ "primarily English" is a product fact

     EVALUATION          benchmarks + THE SETUP USED
                         a number without the prompt and settings
                         is not reproducible

     LIMITATIONS         where it underperforms, and for whom
                         ⚠ NO limitations section is a WARNING,
                           not a reassurance

     LICENCE             the operative legal terms

   THE QUESTIONS A PM SHOULD ASK OF A CARD

     can we use this commercially?           licence
     will it work for our users' language?   training data
     what does it do badly?                  limitations
     is the benchmark number comparable?     evaluation setup
     base or instruct?                       name + card

   ⚠ CARD QUALITY IS ITSELF A SIGNAL

     a thorough, honest card with real limitations
       → a publisher who thought about deployment

     a card that is three lines and a benchmark table
       → proceed carefully`,
    example: {
      language: 'text',
      caption: 'Reading a card critically, as a product decision',
      code: `MODEL: a strong open 8B instruct model

── LICENCE ────────────────────────────────────────────────
  card says   "Custom licence. Permitted for commercial use.
               Entities with >700M monthly active users must
               request a separate licence."
  reading     fine for us today. Note the threshold — it is a
              growth-dependent constraint, worth recording in
              the model inventory.

── TRAINING DATA ──────────────────────────────────────────
  card says   "Pretrained on 15T tokens of publicly available
               data. Cutoff December 2024. Primarily English,
               with 8 supported languages."
  reading     · our Hindi users are not in the supported list
              → test explicitly before assuming it works
              · cutoff Dec 2024 → knows nothing after that
              → all product knowledge must come from retrieval

── EVALUATION ─────────────────────────────────────────────
  card says   "MMLU 68.4, HumanEval 72.6"
  reading     no prompt or settings given → not reproducible
              and not evidence about OUR task
              → build a golden set; use these for orientation only

── LIMITATIONS ────────────────────────────────────────────
  card says   "May produce inaccurate or biased outputs.
               Not evaluated for use in high-risk domains.
               Performance degrades on languages outside the
               supported set."
  reading     honest, and it names the constraint we care about
              → confirms the Hindi concern above

── DECISION ───────────────────────────────────────────────
  proceed for English support content, with retrieval for all
  product knowledge. Test Hindi separately before committing.
  Record the 700M-user licence threshold in the inventory.

  ← Ten minutes of reading, and three real product constraints
    identified before any code was written.`
    },
    prereq: ['huggingface'], next: ['foundation-vs-instruct'],
    related: ['model-governance', 'open-vs-closed-models', 'model-families', 'ai-model-selection'],
    tools: ['huggingface'],
    useCases: [
      'Deciding whether a model can be used commercially.',
      'Identifying language or domain limitations before building.',
      'Recording constraints in a model inventory.'
    ],
    avoid: [
      'Treating benchmark numbers on a card as evidence for your task.',
      'Skipping the card because the model is popular.'
    ],
    mistakes: [
      'Not reading the licence until the model is embedded in a product.',
      'Missing language limitations, then discovering poor quality for a whole market.',
      'Treating a card with no limitations section as reassuring.',
      'Trusting a benchmark number given without its evaluation setup.',
      'Ignoring the training cutoff, then relying on the model for current information.'
    ],
    keyTerms: [
      ['model card', 'Documentation describing a model’s use, data and limits.'],
      ['intended use', 'What the publisher designed it for.'],
      ['out-of-scope use', 'What they explicitly say it is not for.'],
      ['limitations', 'Where it underperforms. Absence is a warning.'],
      ['training cutoff', 'The date beyond which it knows nothing.'],
      ['supported languages', 'Often narrower than assumed. A product fact.'],
      ['evaluation setup', 'The prompts and settings behind a benchmark number.']
    ],
    resources: [
      ['Model Cards for Model Reporting (paper)', 'https://arxiv.org/abs/1810.03993', 'paper'],
      ['Hugging Face — model cards', 'https://huggingface.co/docs/hub/model-cards', 'docs'],
      ['Hugging Face — model card guidebook', 'https://huggingface.co/docs/hub/model-card-guidebook', 'docs'],
      ['Anthropic — model cards', 'https://docs.anthropic.com/en/docs/about-claude/models/overview', 'reference']
    ],
    questions: [
      ['Which section of a model card tells you the most?', 'Out-of-scope use and limitations. They state what the publisher knows it does badly, which is exactly what a product decision needs and exactly what people skip.'],
      ['Why is a card with no limitations section a warning?', 'Every model has limitations. Their absence means the publisher did not document them, not that they do not exist.'],
      ['Why is a benchmark number on a card weak evidence?', 'It is usually given without the prompt and settings used, so it is not reproducible, and it measures a generic task rather than yours.']
    ]
  },

  {
    id: 'tokenizer',
    title: 'Tokenizers as Artifacts',
    domain: 'open-source', tier: 2, priority: 'medium',
    summary: 'The tokenizer is a downloadable component with its own behaviour, and it must match its model.',
    what: `A tokenizer is a separate artifact from the weights: a vocabulary, merge rules, special tokens, and a chat template. It converts text to ids and back.`,
    why: `Practically, three things depend on it: your token counts (and therefore your cost estimates), whether a chat model behaves correctly (via the chat template), and whether the model reads what you think it does.`,
    analogy: `The keyboard layout for a typewriter. Change the layout and every keystroke produces a different letter, while the machine works perfectly.`,
    technical: `A tokenizer directory contains the vocabulary, merge rules, special tokens (start, end, padding, end-of-turn), and usually the **chat template** — a Jinja template describing how to format a conversation for that model.

The chat template is the part that most affects behaviour in practice. Every model family has its own, and formatting a conversation by hand instead of using \`apply_chat_template\` is a common cause of poor output from open models.

Tokenizers can be loaded and used **without the model**, which is exactly what you want for counting tokens before sending a request.

Different families tokenize the same text very differently, so token counts are not portable between providers. A cost estimate built on one tokenizer does not transfer.`,
    diagram: `
   THE TOKENIZER IS A SEPARATE, LOADABLE ARTIFACT

     vocabulary        128,256 entries
     merge rules       how text is split
     special tokens    <|begin_of_text|> <|eot_id|> …
     CHAT TEMPLATE     how to format a conversation
                       ← the part that most affects behaviour

   ⚠ USE apply_chat_template, ALWAYS

     hand-formatted:  "User: hi\\nAssistant:"
     correct:         "<|start_header_id|>user<|end_header_id|>…"

     Hand-formatting puts the model far outside its training
     distribution. Output quality collapses, and it looks like
     the model is bad.

   ⚠ TOKEN COUNTS ARE NOT PORTABLE

     "Retrieval augmented generation is powerful."

       tokenizer A   →  9 tokens
       tokenizer B   → 11 tokens
       tokenizer C   →  8 tokens

     A cost estimate built on one does not transfer to another.

   USEFUL WITHOUT THE MODEL

     load the tokenizer alone (a few MB) to count tokens
     before sending a request — no need for 14GB of weights.`,
    example: {
      language: 'python',
      caption: 'Counting tokens, and using the chat template correctly',
      code: `from transformers import AutoTokenizer

# The tokenizer loads WITHOUT the model — a few MB, not 14GB
tok = AutoTokenizer.from_pretrained("meta-llama/Llama-3.1-8B-Instruct")

# ── COUNT BEFORE SENDING ───────────────────────────────────
def estimate(prompt, max_out=500, price_in=3.0, price_out=15.0):
    n_in = len(tok.encode(prompt))
    cost = (n_in * price_in + max_out * price_out) / 1e6
    return {"tokens_in": n_in, "est_cost_usd": round(cost, 5)}

print(estimate(long_rag_prompt))
# {'tokens_in': 3412, 'est_cost_usd': 0.01774}

# ── THE CHAT TEMPLATE: use it, never hand-format ───────────
messages = [
    {"role": "system", "content": "Answer only from the given context."},
    {"role": "user", "content": "What is our refund window?"},
]

prompt = tok.apply_chat_template(messages, tokenize=False,
                                 add_generation_prompt=True)
print(repr(prompt[:120]))
# '<|begin_of_text|><|start_header_id|>system<|end_header_id|>\\n\\nAnswer only…'

# ── WHY HAND-FORMATTING FAILS ──────────────────────────────
hand = "System: Answer only from the given context.\\nUser: What is our refund window?\\nAssistant:"
print(len(tok.encode(hand)), "vs", len(tok.encode(prompt)))
# The token sequences are completely different, and only one of
# them matches what the model was trained on.

# ── SPECIAL TOKENS ─────────────────────────────────────────
print(tok.special_tokens_map)
# {'bos_token': '<|begin_of_text|>', 'eos_token': '<|eot_id|>', ...}

# ── COUNTS ARE NOT PORTABLE ────────────────────────────────
text = "Retrieval augmented generation is powerful."
for name in ["gpt2", "bert-base-uncased", "meta-llama/Llama-3.1-8B-Instruct"]:
    t = AutoTokenizer.from_pretrained(name)
    print(f"{name:<40} {len(t.encode(text)):>3} tokens")
# gpt2                                       9 tokens
# bert-base-uncased                         11 tokens
# meta-llama/Llama-3.1-8B-Instruct           8 tokens`
    },
    prereq: ['tokens-tokenization', 'what-is-a-model'], next: [],
    related: ['vocabulary', 'instruction-tuning', 'ai-cost'],
    tools: ['huggingface', 'transformers'],
    useCases: [
      'Counting tokens before sending a request, for cost control.',
      'Formatting a conversation correctly for an open model.',
      'Diagnosing poor output from an open model.'
    ],
    avoid: [
      'Hand-formatting conversations for chat models.',
      'Reusing token counts across model families.'
    ],
    mistakes: [
      'Hand-formatting instead of using the chat template — a leading cause of poor open-model output.',
      'Assuming token counts transfer between providers.',
      'Loading the full model when only the tokenizer was needed.',
      'Mismatching tokenizer and model versions.'
    ],
    keyTerms: [
      ['tokenizer', 'The artifact converting text to token ids.'],
      ['chat template', 'The Jinja template formatting a conversation for a model.'],
      ['special tokens', 'Markers such as start, end and end-of-turn.'],
      ['apply_chat_template', 'The correct way to format a conversation.'],
      ['merge rules', 'How BPE combines characters into tokens.'],
      ['portability', 'Token counts do not transfer between tokenizers.']
    ],
    resources: [
      ['Hugging Face — chat templates', 'https://huggingface.co/docs/transformers/chat_templating', 'docs'],
      ['Hugging Face — tokenizer summary', 'https://huggingface.co/docs/transformers/tokenizer_summary', 'docs'],
      ['Tiktokenizer — compare tokenizers', 'https://tiktokenizer.vercel.app/', 'interactive']
    ],
    questions: [
      ['Why must you use apply_chat_template rather than formatting by hand?', 'Each model family has its own special-token format for turns. Hand-formatting puts the model far outside its training distribution and output quality collapses in a way that looks like the model being bad.'],
      ['Why are token counts not portable between providers?', 'Different tokenizers split the same text differently — the same sentence can be 8, 9 or 11 tokens — so a cost estimate built on one does not transfer.'],
      ['Why load a tokenizer without its model?', 'To count tokens before sending a request. The tokenizer is a few megabytes; the weights are gigabytes.']
    ]
  },

  {
    id: 'transformers-library',
    title: 'The Transformers Library',
    domain: 'open-source', tier: 2, priority: 'medium',
    summary: 'One consistent interface across thousands of model architectures.',
    what: `Transformers is the Hugging Face Python library for loading and running models. Its central idea is that \`AutoModel.from_pretrained(name)\` works the same way regardless of architecture.`,
    why: `It is why swapping one open model for another is a one-line change. Without it, every architecture would need its own loading and inference code, and comparing models would be a project rather than an afternoon.`,
    analogy: `A universal adapter. Different devices, one plug. The variety is still there; you just stop having to care about it.`,
    technical: `The \`Auto\` classes read \`config.json\` and instantiate the right architecture: \`AutoModelForCausalLM\` for generation, \`AutoModelForSequenceClassification\` for classification, \`AutoTokenizer\` for tokenization.

**Pipelines** wrap the common tasks in one call — useful for a quick check, less so in production where you want control over generation parameters and batching.

Practical loading arguments that matter: \`device_map="auto"\` (place layers across available devices), \`load_in_4bit\` / \`load_in_8bit\` (quantized loading), \`torch_dtype\` (precision), and \`revision\` (pin the version).

For serving many concurrent users, Transformers is not the right tool — vLLM or TGI handle batching and KV-cache management far better. Transformers is for development, experimentation and single-user local inference.`,
    diagram: `
   ONE INTERFACE, MANY ARCHITECTURES

     AutoModelForCausalLM.from_pretrained("llama-3.1-8b")
     AutoModelForCausalLM.from_pretrained("qwen2.5-14b")
     AutoModelForCausalLM.from_pretrained("mistral-7b")

     Same call. The library reads config.json and instantiates
     the right architecture.

   THE AUTO CLASSES

     AutoTokenizer                        text ↔ ids
     AutoModelForCausalLM                 generation
     AutoModelForSequenceClassification   classification
     AutoModelForTokenClassification      NER, tagging
     AutoConfig                           architecture only

   LOADING ARGUMENTS THAT MATTER

     device_map="auto"     spread layers across devices
     load_in_4bit=True     quantized — 14GB becomes ~4GB
     torch_dtype           precision
     revision="abc123"     pin the version

   ⚠ NOT A SERVING STACK

     transformers   development · experimentation ·
                    single-user local inference
     vLLM / TGI     production serving — continuous batching,
                    paged KV cache, far higher throughput

     Using transformers to serve many concurrent users leaves
     most of your hardware idle.`,
    example: {
      language: 'python',
      caption: 'Loading, generating, and knowing when to stop using it',
      code: `from transformers import AutoTokenizer, AutoModelForCausalLM
import torch

MODEL = "meta-llama/Llama-3.1-8B-Instruct"

tok = AutoTokenizer.from_pretrained(MODEL)
model = AutoModelForCausalLM.from_pretrained(
    MODEL,
    device_map="auto",        # spread across available devices
    load_in_4bit=True,        # ~4GB instead of ~16GB
    torch_dtype=torch.bfloat16,
    revision="0e9e39f",       # pinned
)

# ── GENERATE ───────────────────────────────────────────────
messages = [{"role": "user", "content": "Explain RAG in two sentences."}]
inputs = tok.apply_chat_template(messages, return_tensors="pt",
                                 add_generation_prompt=True).to(model.device)

out = model.generate(
    inputs,
    max_new_tokens=200,
    temperature=0.0,          # factual task
    do_sample=False,
    pad_token_id=tok.eos_token_id,
)
print(tok.decode(out[0][inputs.shape[-1]:], skip_special_tokens=True))

# ── PIPELINES: quick, less controllable ────────────────────
from transformers import pipeline
classify = pipeline("text-classification",
                    model="distilbert-base-uncased-finetuned-sst-2-english")
print(classify("This dashboard is confusing and slow."))
# [{'label': 'NEGATIVE', 'score': 0.9997}]

# ── WHEN TO STOP USING TRANSFORMERS ────────────────────────
#   one user, local, experimenting     → transformers is right
#   many concurrent users, production  → vLLM or TGI
#
# transformers processes requests one at a time. vLLM does
# continuous batching and paged attention, which is the
# difference between serving 2 users and serving 50 on the
# same GPU.`
    },
    prereq: ['what-is-a-model'], next: ['checkpoints'],
    related: ['huggingface', 'pytorch', 'ollama', 'self-attention-qkv'],
    tools: ['transformers', 'huggingface', 'pytorch', 'vllm'],
    useCases: [
      'Loading and running an open model in Python.',
      'Comparing several models with the same code.',
      'Local experimentation and fine-tuning.'
    ],
    avoid: [
      'Production serving for many concurrent users — use vLLM or TGI.',
      'Pipelines where you need control over generation parameters.'
    ],
    mistakes: [
      'Using Transformers as a serving stack, leaving most of the GPU idle.',
      'Loading at full precision when 4-bit would fit and perform adequately.',
      'Not pinning the revision.',
      'Forgetting `add_generation_prompt=True`, so the model continues the user turn instead of replying.'
    ],
    keyTerms: [
      ['Auto classes', 'Load the right architecture from config.json.'],
      ['pipeline', 'A one-call wrapper for common tasks.'],
      ['device_map', 'How layers are placed across devices.'],
      ['load_in_4bit', 'Quantized loading, cutting memory roughly fourfold.'],
      ['generate', 'The text-generation entry point.'],
      ['vLLM / TGI', 'Production serving stacks with batching and paged attention.']
    ],
    resources: [
      ['Hugging Face — Transformers documentation', 'https://huggingface.co/docs/transformers/index', 'docs'],
      ['Hugging Face — LLM tutorial', 'https://huggingface.co/docs/transformers/llm_tutorial', 'docs'],
      ['Hugging Face — generation strategies', 'https://huggingface.co/docs/transformers/generation_strategies', 'docs'],
      ['vLLM — documentation', 'https://docs.vllm.ai/', 'docs']
    ],
    questions: [
      ['What makes Transformers valuable?', 'One consistent interface across thousands of architectures, so swapping models is a one-line change rather than a rewrite.'],
      ['When should you stop using Transformers?', 'For production serving with many concurrent users. It processes requests one at a time; vLLM and TGI do continuous batching and paged attention, which is the difference between serving a couple of users and dozens on the same GPU.'],
      ['What does load_in_4bit buy you?', 'Roughly a fourfold memory reduction — a 16GB model becomes about 4GB — which is what makes an 8B model runnable on ordinary hardware.']
    ]
  },

  {
    id: 'checkpoints',
    title: 'Checkpoints',
    domain: 'open-source', tier: 3, priority: 'low',
    summary: 'A saved snapshot of weights at a point in training.',
    what: `A checkpoint is the model's parameters saved to disk at a particular moment — usually during or at the end of a training run.

Every model you download is a checkpoint.`,
    why: `The term appears constantly in model documentation and training discussions, and it explains a few practical things: why training runs produce several artifacts, why you can resume an interrupted run, and why "the model" is really "a particular saved state of the model".`,
    analogy: `A save file in a game. The game is the same; the save is a specific state you can return to. You can keep several and load whichever you want.`,
    technical: `During training, checkpoints are written periodically so a run can be resumed after a crash and so you can select the best one afterwards — often not the final one, because later epochs may have overfitted.

A training checkpoint may include optimiser state and the training step, which makes it much larger than an inference-only checkpoint containing just the weights. Published models are inference checkpoints.

**Selection matters**: "best checkpoint by validation loss" is usually preferable to "last checkpoint", and the difference can be substantial on a small fine-tuning run.

For LoRA, the checkpoint is just the adapter — tens of megabytes rather than gigabytes — which is why adapter-based experimentation is cheap.`,
    diagram: `
   CHECKPOINTS DURING A TRAINING RUN

     epoch 1  ──► checkpoint-500    val loss 0.81
     epoch 2  ──► checkpoint-1000   val loss 0.49   ← BEST
     epoch 3  ──► checkpoint-1500   val loss 0.47   ← best
     epoch 4  ──► checkpoint-2000   val loss 0.58   overfitting
     epoch 8  ──► checkpoint-4000   val loss 0.94   memorised

     "the model" = whichever checkpoint you SELECT

     ⚠ the LAST checkpoint is usually not the best one

   TRAINING vs INFERENCE CHECKPOINTS

     training     weights + optimiser state + step + scheduler
                  → much larger, resumable
     inference     weights only
                  → what gets published

   LoRA CHECKPOINTS ARE TINY

     full fine-tune checkpoint    14 GB
     LoRA adapter checkpoint      28 MB

     Which is why adapter experimentation is cheap: keep
     twenty and compare them.

   ⚠ EVERY MODEL YOU DOWNLOAD IS A CHECKPOINT.
     "Llama-3.1-8B-Instruct" is a saved state, selected and
     published by its authors.`,
    example: {
      language: 'python',
      caption: 'Saving, selecting and resuming from checkpoints',
      code: `from transformers import TrainingArguments, Trainer

args = TrainingArguments(
    output_dir="./checkpoints",
    save_strategy="epoch",              # a checkpoint per epoch
    save_total_limit=3,                 # keep the last 3, delete older
    eval_strategy="epoch",
    load_best_model_at_end=True,        # ← select best, not last
    metric_for_best_model="eval_loss",
    greater_is_better=False,
)

trainer = Trainer(model=model, args=args,
                  train_dataset=train, eval_dataset=val)
trainer.train()

# ── RESUME AN INTERRUPTED RUN ──────────────────────────────
# trainer.train(resume_from_checkpoint="./checkpoints/checkpoint-1000")

# ── WHAT IS IN EACH KIND ───────────────────────────────────
# training checkpoint (resumable):
#   model.safetensors          the weights
#   optimizer.pt               optimiser state  ← large
#   scheduler.pt               learning-rate schedule
#   trainer_state.json         step, epoch, metric history
#
# inference checkpoint (published):
#   model.safetensors          the weights
#   config.json
#   tokenizer files

# ── SAVE FOR INFERENCE ONLY ────────────────────────────────
trainer.save_model("./final")           # weights + config, no optimiser
tok.save_pretrained("./final")          # tokenizer must travel with it

# ── LoRA: the checkpoint is the adapter ────────────────────
# model.save_pretrained("./adapters/v7")   # ~28 MB
# Keep twenty. Compare them. Delete the losers.`
    },
    prereq: ['what-is-a-model'], next: [],
    related: ['supervised-fine-tuning', 'lora-peft', 'overfitting-underfitting', 'model-registry'],
    tools: ['transformers', 'huggingface'],
    useCases: [
      'Selecting the best model from a training run.',
      'Resuming an interrupted training run.',
      'Understanding what a published model artifact actually is.'
    ],
    avoid: [
      'Keeping every checkpoint from a long run — they are large.',
      'Publishing a training checkpoint when an inference one is wanted.'
    ],
    mistakes: [
      'Using the last checkpoint rather than the best by validation loss.',
      'Not setting a save limit, filling the disk during a long run.',
      'Saving the model without the tokenizer.',
      'Confusing checkpoint size with inference memory — optimiser state is not needed to run.'
    ],
    keyTerms: [
      ['checkpoint', 'A saved snapshot of model parameters.'],
      ['training checkpoint', 'Includes optimiser state; resumable and large.'],
      ['inference checkpoint', 'Weights only; what gets published.'],
      ['best checkpoint', 'Selected by validation metric, usually not the last.'],
      ['resume from checkpoint', 'Continuing an interrupted run.'],
      ['save_total_limit', 'How many checkpoints to retain.']
    ],
    resources: [
      ['Hugging Face — Trainer', 'https://huggingface.co/docs/transformers/main_classes/trainer', 'docs'],
      ['Hugging Face — saving and loading', 'https://huggingface.co/docs/transformers/main_classes/model', 'docs'],
      ['PyTorch — saving and loading models', 'https://pytorch.org/tutorials/beginner/saving_loading_models.html', 'docs']
    ],
    questions: [
      ['Why is the last checkpoint usually not the best one?', 'Later epochs often overfit, so validation loss rises while training loss keeps falling. Selecting by validation metric is what `load_best_model_at_end` does.'],
      ['What is the difference between a training and an inference checkpoint?', 'A training checkpoint includes optimiser state and step information so a run can resume; an inference checkpoint is weights only, and that is what gets published.'],
      ['Why is LoRA experimentation cheap?', 'The checkpoint is just the adapter — tens of megabytes rather than gigabytes — so you can keep twenty and compare them.']
    ]
  },

  {
    id: 'foundation-vs-instruct',
    title: 'Foundation, Base & Instruct Models',
    domain: 'open-source', tier: 1, priority: 'high',
    summary: 'The same model at three stages of preparation, and only one of them behaves like an assistant.',
    what: `A **foundation** or **base** model is the direct output of pretraining. An **instruct** model has been fine-tuned to follow instructions. A **chat** model has additionally been preference-tuned for conversation.

Downloading the wrong one is the single most common first-time confusion with open models.`,
    why: `They look identical on a model page except for a suffix in the name, and they behave completely differently. Knowing which you have — and which you need — avoids concluding that a perfectly good model is broken.`,
    analogy: `A trained musician, a session player, and a performer. Same underlying skill. Only one of them knows what to do when you say "play something for the interval".`,
    technical: `**Base** — completes text. Ask it a question and it may produce more questions, because a list of questions is what that text pattern looks like. Useful for fine-tuning, for text completion, and for research.

**Instruct** — instruction-tuned. Reads a request and produces an appropriate answer. This is what you want for almost every application.

**Chat** — instruct plus preference tuning, formatted for multi-turn conversation with a chat template.

The naming convention is usually a suffix: \`-Instruct\`, \`-Chat\`, \`-it\`, or nothing for base. It is a convention, not a guarantee, so confirm in the model card.

Two practical consequences: instruct and chat models need their **chat template**; base models do not use one. And base models are the right starting point if you are fine-tuning for a task with its own format, because you are not fighting an existing instruction-following behaviour.`,
    diagram: `
   THE SAME MODEL, THREE STAGES

     PRETRAINING ──► BASE
                     completes text
                     "Explain RAG." → "Explain vector search.
                                       Explain chunking. Explain…"
                     ← continuing a LIST OF QUESTIONS
                       This is correct behaviour. It looks broken.
          │
     INSTRUCTION TUNING ──► INSTRUCT
                     answers the question
                     "Explain RAG." → "RAG stands for retrieval-
                                       augmented generation…"
          │
     PREFERENCE TUNING ──► CHAT
                     multi-turn, tone-tuned, uses a chat template

   NAMING — a convention, not a guarantee

     Llama-3.1-8B            base
     Llama-3.1-8B-Instruct   instruct     ← what you want
     Qwen2.5-14B-Instruct    instruct
     gemma-2-9b-it           instruct ("it" = instruction-tuned)

     Confirm in the model card.

   WHICH TO CHOOSE

     building an application        → INSTRUCT (almost always)
     fine-tuning for a task with
       its own output format        → BASE, so you are not
                                      fighting existing behaviour
     research on raw capability     → BASE
     text completion, not Q&A       → BASE

   ⚠ INSTRUCT AND CHAT MODELS NEED THEIR CHAT TEMPLATE.
     Base models do not use one.`,
    example: {
      language: 'text',
      caption: 'The same prompt to base and instruct, and why base looks broken',
      code: `PROMPT: "What is retrieval-augmented generation?"

── BASE MODEL ─────────────────────────────────────────────
  output:
    "What is a vector database?
     What is chunking?
     What is reranking?
     What is an embedding model?
     What is semantic search?"

  This is NOT a malfunction. The model saw a question, and in
  its training data a question is very often followed by more
  questions — an FAQ, a quiz, a list. It is completing the
  pattern, correctly.

── INSTRUCT MODEL ─────────────────────────────────────────
  output:
    "Retrieval-augmented generation retrieves relevant
     documents at question time and supplies them to the
     model as context, so the answer comes from real source
     material rather than the model's memory."

  Same weights underneath, plus a few thousand examples of
  "when you see a request, answer it".

── THE PRACTICAL SEQUENCE ─────────────────────────────────
  1. downloaded a model, output was nonsense
  2. checked the name: no -Instruct suffix
  3. downloaded the -Instruct variant
  4. worked immediately

  This is a very common first hour with open models, and it
  is entirely avoidable by reading the suffix.

── WHEN BASE IS ACTUALLY RIGHT ────────────────────────────
  fine-tuning a classifier that must output only a category
  → starting from base means you are not fighting an existing
    tendency to explain, hedge and add caveats`
    },
    prereq: ['model-card', 'instruction-tuning'], next: ['model-families'],
    related: ['pretraining', 'rlhf-preference', 'tokenizer', 'supervised-fine-tuning'],
    tools: ['huggingface', 'ollama', 'transformers'],
    useCases: [
      'Choosing the right variant for an application.',
      'Diagnosing a model that appears not to follow instructions.',
      'Selecting a base model as a fine-tuning starting point.'
    ],
    avoid: [
      'Base models for applications — they do not follow instructions.',
      'Instruct models as a fine-tuning base when the task has its own strict output format.'
    ],
    mistakes: [
      'Downloading the base variant and concluding the model is broken.',
      'Assuming the suffix convention is guaranteed rather than conventional.',
      'Applying a chat template to a base model.',
      'Fine-tuning from an instruct model for a rigid-format task and fighting its tendency to explain.'
    ],
    keyTerms: [
      ['foundation model', 'A large pretrained model intended to be adapted.'],
      ['base model', 'The direct output of pretraining. Completes text.'],
      ['instruct model', 'Instruction-tuned. Answers requests.'],
      ['chat model', 'Instruct plus preference tuning, for conversation.'],
      ['suffix convention', '-Instruct, -Chat, -it. Conventional, not guaranteed.'],
      ['completion vs instruction', 'Continuing text versus responding to a request.']
    ],
    resources: [
      ['Hugging Face — LLM tutorial', 'https://huggingface.co/docs/transformers/llm_tutorial', 'docs'],
      ['InstructGPT (paper)', 'https://arxiv.org/abs/2203.02155', 'paper'],
      ['Hugging Face — chat templates', 'https://huggingface.co/docs/transformers/chat_templating', 'docs'],
      ['Ollama — model library', 'https://ollama.com/library', 'reference']
    ],
    questions: [
      ['Why does a base model answer a question with more questions?', 'It completes text. In its training data a question is frequently followed by more questions — an FAQ or a quiz — so it is correctly continuing the pattern. It looks broken and is not.'],
      ['Which variant do you want for an application?', 'Instruct, almost always. Base is for fine-tuning, text completion and research.'],
      ['When is a base model the better fine-tuning starting point?', 'When the task has a strict output format. Starting from instruct means fighting an existing tendency to explain, hedge and add caveats.']
    ]
  },

  {
    id: 'model-families',
    title: 'Model Families',
    domain: 'open-source', tier: 2, priority: 'medium',
    summary: 'The main open model lineages, and what distinguishes them.',
    what: `Open models cluster into families published by the same organisation, sharing an architecture and a training approach, released in several sizes.

Llama, Qwen, Mistral, Gemma and Phi are the ones you will meet most.`,
    why: `Knowing the families gives you a shortlist rather than an undifferentiated leaderboard. Each has characteristic strengths, licence terms and size ranges, and choosing within a family is much easier than choosing across everything.`,
    analogy: `Car manufacturers. Knowing that one makes reliable estates and another makes small efficient hatchbacks narrows the search enormously before you compare individual models.`,
    technical: `Characteristics that actually differentiate them, more than benchmark scores:

- **Licence** — this varies most and matters most. Some are permissively licensed; some have usage thresholds or restrictions.
- **Size range** — whether the family offers a size that fits your hardware.
- **Language coverage** — some families are notably stronger outside English.
- **Specialisation** — some families publish code-specific or reasoning-specific variants.
- **Ecosystem** — how many quantizations, fine-tunes and tooling integrations exist. A widely-adopted family is easier to run.

Benchmark differences between comparable models in different families are usually smaller than the differences that licence, size availability and language coverage make to your actual decision.

Families move fast. Treat any specific ranking as dated, and re-check on the MTEB or general leaderboards when it matters — but decide on licence and fit first.`,
    diagram: `
   WHAT ACTUALLY DIFFERENTIATES A FAMILY

     LICENCE          varies most · matters most
                      permissive · usage thresholds · restrictions

     SIZE RANGE       is there a size that fits your hardware?
                      1B · 3B · 7B · 8B · 14B · 32B · 70B · 400B+

     LANGUAGE         some families are notably stronger
                      outside English

     SPECIALISATION   code-specific · reasoning-specific variants

     ECOSYSTEM        how many quantizations, fine-tunes and
                      tooling integrations exist
                      ← a widely-adopted family is easier to run

   ⚠ BENCHMARK DIFFERENCES BETWEEN COMPARABLE MODELS
     are usually SMALLER than the difference licence, size
     availability and language coverage make to your decision.

   THE SELECTION ORDER THAT WORKS

     1  licence permits your use?          → eliminates fast
     2  a size that fits your hardware?    → eliminates fast
     3  covers your users' languages?      → eliminates fast
     4  ecosystem: quantizations, tooling? → practical
     5  benchmark on YOUR golden set       → the decision

     Steps 1-3 usually leave three candidates. Step 5 decides.

   ⚠ RANKINGS AGE FAST.
     Treat any specific ordering as dated. The selection
     ORDER does not age.`,
    example: {
      language: 'text',
      caption: 'Choosing a family by elimination, not by leaderboard',
      code: `REQUIREMENT
  On-premises support assistant. English and Hindi users.
  One A100 40GB. Commercial product, ~2M ARR.

── STEP 1: LICENCE ────────────────────────────────────────
  eliminate anything research-only or non-commercial
  note any revenue or user thresholds — we are well below
  typical ones, but record them in the model inventory
  → several families remain

── STEP 2: SIZE THAT FITS ─────────────────────────────────
  A100 40GB, need room for KV cache and concurrency
    70B at 4-bit ≈ 42GB   → does not fit with headroom
    32B at 4-bit ≈ 19GB   → fits, ~4 concurrent users
    14B at 4-bit ≈  9GB   → fits comfortably
     8B at 4-bit ≈  5GB   → fits easily, high concurrency
  → shortlist the 8B-14B range

── STEP 3: LANGUAGE COVERAGE ──────────────────────────────
  Hindi matters. Check each candidate's model card for
  supported languages — several strong English models do
  not list it.
  → this eliminates more than the benchmarks did

── STEP 4: ECOSYSTEM ──────────────────────────────────────
  available as GGUF for Ollama? quantizations published?
  supported by our serving stack?
  → practical, and it eliminates one more

── STEP 5: TEST ON OUR GOLDEN SET ─────────────────────────
  three candidates remain. Run all three against 240 real
  cases, measuring groundedness, over-refusal, latency
  and Hindi quality specifically.
  → THIS is the decision

── THE POINT ──────────────────────────────────────────────
  Steps 1-4 are elimination and take an afternoon.
  Step 5 is the decision and takes a day.
  Starting at step 5 with twenty candidates wastes a week.`
    },
    prereq: ['foundation-vs-instruct'], next: ['open-vs-closed-models'],
    related: ['model-card', 'ai-model-selection', 'model-size-parameters', 'quantization'],
    tools: ['huggingface', 'ollama'],
    useCases: [
      'Shortlisting open models for a specific deployment.',
      'Eliminating candidates quickly on licence and hardware fit.',
      'Choosing a family whose ecosystem your tooling supports.'
    ],
    avoid: [
      'Starting from a leaderboard rather than from constraints.',
      'Treating benchmark ranking as the primary selection criterion.'
    ],
    mistakes: [
      'Choosing by benchmark before checking licence and hardware fit.',
      'Overlooking language coverage, then finding a whole market underserved.',
      'Ignoring ecosystem support, then discovering no GGUF conversion or serving-stack compatibility.',
      'Treating a published ranking as current — families move fast.'
    ],
    keyTerms: [
      ['model family', 'A lineage from one publisher, sharing architecture and approach.'],
      ['size range', 'The parameter counts a family offers.'],
      ['licence terms', 'The most differentiating factor in practice.'],
      ['language coverage', 'Which languages a family handles well.'],
      ['ecosystem', 'Available quantizations, fine-tunes and tooling support.'],
      ['specialisation', 'Code-specific or reasoning-specific variants.']
    ],
    resources: [
      ['Hugging Face — open LLM leaderboard', 'https://huggingface.co/spaces/open-llm-leaderboard/open_llm_leaderboard', 'interactive'],
      ['Hugging Face — models', 'https://huggingface.co/models', 'reference'],
      ['Ollama — model library', 'https://ollama.com/library', 'reference'],
      ['LMSYS Chatbot Arena', 'https://lmarena.ai/', 'interactive']
    ],
    questions: [
      ['What differentiates model families more than benchmark scores?', 'Licence terms, available size range, language coverage and ecosystem support. Those usually decide the choice before quality does.'],
      ['What is an efficient selection order?', 'Eliminate on licence, then hardware fit, then language coverage, then ecosystem — which usually leaves three candidates — and then test those on your own golden set.'],
      ['Why is starting from a leaderboard inefficient?', 'It ranks on generic tasks and ignores every constraint that actually eliminates candidates. You end up benchmarking twenty models when four survive the constraints.']
    ]
  },

  {
    id: 'open-vs-closed-models',
    title: 'Open vs Closed Models',
    domain: 'open-source', tier: 2, priority: 'high',
    summary: 'Downloadable weights versus an API — and what "open" actually means.',
    what: `An **open-weights** model can be downloaded and run yourself. A **closed** model is available only through an API.

Note the term: most "open source" models are **open weights**. The training data and training code are usually not published, which is a meaningful difference.`,
    why: `The choice determines your cost structure, your data-governance story, your dependency risk and your ability to customise. And the imprecision in "open source" matters legally: people assume it implies a standard open-source licence, and it frequently does not.`,
    analogy: `Owning a machine versus renting time on one. Ownership gives control, customisation and fixed cost; renting gives access to something better than you could afford to own, with no maintenance.`,
    technical: `**Open weights**: run anywhere including offline, no data leaves your environment, no deprecation, full customisation via fine-tuning and quantization, cost is hardware rather than per-token. In exchange you operate it, and quality is typically a step behind frontier.

**Closed API**: frontier quality, no operations, elastic scaling, immediate access to improvements. In exchange prompts leave your network, cost scales with usage forever, and the vendor can deprecate a version you depend on.

**"Open source" versus "open weights"**: publishing weights is not publishing source. The training data, training code and full methodology are usually withheld. Some licences are genuinely permissive; others carry usage thresholds or restrictions that make the term misleading.

The decision is rarely about quality alone. It is usually decided by data residency, cost at volume, or a requirement to run offline.`,
    diagram: `
   OPEN WEIGHTS                    CLOSED API

   download the file               call the endpoint
   run anywhere, incl. offline     vendor infrastructure
   nothing leaves your network     prompts leave your network
   never deprecated                versions get retired
   fine-tune · quantize · modify   use as offered
   cost = hardware (fixed)         cost = per token (scales)
   YOU operate it                  they operate it
   quality: strong, a step behind  quality: frontier

   ⚠ "OPEN SOURCE" USUALLY MEANS "OPEN WEIGHTS"

     published:      the weights
     NOT published:  training data · training code · full method

     And the licence may carry usage thresholds or restrictions.
     People assume "open source" implies a standard permissive
     licence. Frequently it does not. Read the actual terms.

   WHAT ACTUALLY DECIDES IT

     data residency requirement    → open weights
     offline operation required    → open weights
     high steady volume            → open weights (check break-even)
     spiky or low volume           → API
     need frontier reasoning       → API
     want zero operations          → API

     Quality alone rarely decides. One of the constraints above
     usually does.`,
    example: {
      language: 'python',
      caption: 'Modelling the break-even, and the constraints that override it',
      code: `def break_even(requests_per_month, tokens_in, tokens_out,
               api_in=3.0, api_out=15.0,
               gpu_monthly=1_800, gpu_capacity_rps=8):
    """Where does self-hosting become cheaper?"""
    api_monthly = requests_per_month * (
        tokens_in * api_in + tokens_out * api_out) / 1e6

    rps_needed = requests_per_month / (30 * 24 * 3600)
    gpus = max(1, -(-rps_needed // gpu_capacity_rps))       # ceil
    self_monthly = gpus * gpu_monthly

    return {
        "api_monthly": round(api_monthly),
        "self_hosted_monthly": round(self_monthly),
        "gpus_needed": int(gpus),
        "cheaper": "self-hosted" if self_monthly < api_monthly else "api",
    }

for volume in [50_000, 500_000, 5_000_000]:
    print(volume, break_even(volume, 3_400, 300))

#    50000 {'api_monthly': 735,   'self_hosted_monthly': 1800, ... 'api'}
#   500000 {'api_monthly': 7350,  'self_hosted_monthly': 1800, ... 'self-hosted'}
#  5000000 {'api_monthly': 73500, 'self_hosted_monthly': 5400, ... 'self-hosted'}

# ── BUT THE CONSTRAINTS USUALLY OVERRIDE THE ARITHMETIC ────
CONSTRAINTS = {
    "data_must_not_leave_network": True,     # → open weights, regardless
    "must_work_offline": False,
    "needs_frontier_reasoning": False,
    "traffic_is_spiky": False,               # spiky → API wins on idle cost
    "team_can_operate_gpus": True,           # → be honest about this one
}

def decide(volume, constraints):
    if constraints["data_must_not_leave_network"]:
        return "open weights — data residency is not negotiable"
    if constraints["must_work_offline"]:
        return "open weights — offline operation required"
    if constraints["needs_frontier_reasoning"]:
        return "API — quality requirement"
    if not constraints["team_can_operate_gpus"]:
        return "API — operational capacity is a real constraint"
    return break_even(volume, 3_400, 300)["cheaper"]

# The arithmetic matters at high steady volume. Everywhere else,
# a constraint decides before the spreadsheet does.`
    },
    prereq: ['model-families'], next: ['hosted-vs-self-hosted'],
    related: ['api-vs-local-model', 'cloud-vs-local-inference', 'ai-build-vs-buy', 'ai-cost'],
    tools: ['huggingface', 'ollama', 'anthropic', 'openai'],
    useCases: [
      'Deciding between self-hosting and an API.',
      'Answering a data-residency requirement.',
      'Modelling the cost break-even honestly.'
    ],
    avoid: [
      'Self-hosting for spiky traffic, where idle capacity dominates.',
      'Assuming "open source" implies a permissive licence.'
    ],
    mistakes: [
      'Treating "open source" and "open weights" as the same thing.',
      'Modelling only per-token cost and ignoring the operational burden of self-hosting.',
      'Self-hosting on spiky traffic, paying for peak capacity around the clock.',
      'Assuming a team can operate GPU inference because it can run a container.',
      'Ignoring deprecation risk when depending on a specific API model version.'
    ],
    keyTerms: [
      ['open weights', 'The weights are downloadable. Data and code usually are not.'],
      ['open source', 'Often used loosely; check the actual licence.'],
      ['closed model', 'Available only via an API.'],
      ['data residency', 'Where data physically is. Often decides the choice.'],
      ['break-even volume', 'Where self-hosting becomes cheaper than an API.'],
      ['deprecation risk', 'A vendor retiring a version you depend on.'],
      ['operational burden', 'The real cost of running inference yourself.']
    ],
    resources: [
      ['Hugging Face — open LLM leaderboard', 'https://huggingface.co/spaces/open-llm-leaderboard/open_llm_leaderboard', 'interactive'],
      ['Open Source Initiative — AI definition', 'https://opensource.org/ai', 'reference'],
      ['Anthropic — pricing', 'https://docs.anthropic.com/en/docs/about-claude/pricing', 'docs'],
      ['vLLM — documentation', 'https://docs.vllm.ai/', 'docs']
    ],
    questions: [
      ['What is the difference between "open source" and "open weights"?', 'Open weights means the weights are downloadable. The training data, training code and full methodology are usually withheld, and the licence may carry restrictions — so "open source" is frequently imprecise and legally misleading.'],
      ['What usually decides between open weights and an API?', 'A constraint rather than the arithmetic: data residency, offline operation, or a frontier-quality requirement. Cost break-even matters mainly at high steady volume.'],
      ['Why is self-hosting a poor fit for spiky traffic?', 'You pay for peak capacity around the clock. An API charges only for what is used, so idle cost is zero.']
    ]
  },

  {
    id: 'hosted-vs-self-hosted',
    title: 'Hosted vs Self-Hosted Inference',
    domain: 'open-source', tier: 2, priority: 'medium',
    summary: 'Even with an open model, someone has to run it — and it does not have to be you.',
    what: `Open weights do not require self-hosting. There is a middle option: run an open model on a hosting provider's infrastructure, getting an API interface for a model you chose.

Three positions: closed API, hosted open model, self-hosted open model.`,
    why: `Teams often frame this as a binary — frontier API or run it yourself — and miss the middle, which is frequently the right answer. You get model choice, portability and often lower cost, without the operational burden.`,
    analogy: `Owning a restaurant, renting a kitchen, or ordering delivery. The middle option is under-considered and often exactly right: your recipes, someone else's equipment and maintenance.`,
    technical: `**Closed API** — the vendor's model on the vendor's infrastructure. Frontier quality, zero operations, per-token cost, deprecation risk.

**Hosted open model** — an open model served by an inference provider. You choose the model, the weights are portable, cost is usually lower per token than frontier, and there are no GPUs to operate. Data still leaves your network.

**Self-hosted** — you run it. Full data control, offline capability, fixed cost, and real operational work: GPU provisioning, serving stack (vLLM or TGI), batching, scaling, monitoring and upgrades.

The operational reality of self-hosting is the part most often underestimated. Serving one user is easy; serving fifty concurrently with acceptable latency requires continuous batching, KV-cache management and capacity planning.

Choose self-hosted when data residency or offline operation requires it, or when volume is high and steady enough to justify the operations. Otherwise the hosted middle is usually better than both extremes.`,
    diagram: `
   THREE POSITIONS, NOT TWO

     CLOSED API              vendor's model, vendor's infrastructure
       frontier quality · zero ops · per-token · deprecation risk

     HOSTED OPEN MODEL       your model, their infrastructure
       model choice · portable weights · lower per-token
       · zero ops · data still leaves
       ← the under-considered middle

     SELF-HOSTED             your model, your infrastructure
       full data control · offline · fixed cost
       · REAL operational work

   ⚠ THE OPERATIONAL REALITY OF SELF-HOSTING

     serving 1 user          easy — transformers, a laptop
     serving 50 concurrent   continuous batching · paged KV cache
                             · capacity planning · monitoring
                             · GPU provisioning · upgrades

     The gap between those two is the part teams underestimate.

   WHEN EACH IS RIGHT

     data cannot leave           → self-hosted
     offline required            → self-hosted
     high steady volume + team   → self-hosted
     want model choice, no ops   → HOSTED OPEN     ← often best
     need frontier reasoning     → closed API
     spiky or low volume         → closed API or hosted`,
    example: {
      language: 'python',
      caption: 'The same code against all three positions',
      code: `from openai import OpenAI

# ── CLOSED API ─────────────────────────────────────────────
closed = OpenAI(api_key=os.environ["ANTHROPIC_API_KEY"],
                base_url="https://api.anthropic.com/v1")

# ── HOSTED OPEN MODEL ──────────────────────────────────────
# Same interface, an open model, someone else's GPUs.
hosted = OpenAI(api_key=os.environ["PROVIDER_KEY"],
                base_url="https://api.provider.example/v1")

# ── SELF-HOSTED (vLLM exposes an OpenAI-compatible endpoint) ─
self_hosted = OpenAI(api_key="not-used",
                     base_url="http://gpu-node.internal:8000/v1")

def answer(client, model, prompt):
    r = client.chat.completions.create(
        model=model, temperature=0,
        messages=[{"role": "user", "content": prompt}])
    return r.choices[0].message.content

# One code path. Switching position is a configuration change,
# which is exactly the property you want when the decision
# might change.

# ── SELF-HOSTING: what you are actually signing up for ─────
# vllm serve meta-llama/Llama-3.1-8B-Instruct \\
#   --tensor-parallel-size 1 \\
#   --max-model-len 8192 \\
#   --gpu-memory-utilization 0.90 \\
#   --enable-prefix-caching
#
# plus: GPU provisioning · autoscaling · health checks
#     · KV-cache capacity planning · model upgrades
#     · monitoring · on-call
#
# The command is one line. The operations are a role.`
    },
    prereq: ['open-vs-closed-models'], next: [],
    related: ['cloud-vs-local-inference', 'ollama', 'latency-throughput', 'ai-cost', 'cpu-vs-gpu-inference'],
    tools: ['vllm', 'ollama', 'huggingface', 'anthropic'],
    useCases: [
      'Getting model choice without operating GPUs.',
      'Meeting a data-residency requirement.',
      'Reducing per-token cost at volume without self-hosting.'
    ],
    avoid: [
      'Self-hosting without the operational capacity to run it.',
      'Framing the decision as a binary and missing the hosted middle.'
    ],
    mistakes: [
      'Treating this as frontier-API-or-self-host and missing hosted open models.',
      'Underestimating the gap between serving one user and serving fifty.',
      'Assuming a hosted open model keeps data in your network — it does not.',
      'Coupling code to one provider’s SDK, making the position hard to change.',
      'Self-hosting on spiky traffic.'
    ],
    keyTerms: [
      ['hosted open model', 'An open model served by an inference provider.'],
      ['self-hosting', 'Running inference on your own infrastructure.'],
      ['serving stack', 'vLLM or TGI — batching and KV-cache management.'],
      ['continuous batching', 'Serving many requests efficiently on one GPU.'],
      ['OpenAI-compatible endpoint', 'A common interface most stacks expose.'],
      ['operational burden', 'Provisioning, scaling, monitoring, upgrades.']
    ],
    resources: [
      ['vLLM — documentation', 'https://docs.vllm.ai/', 'docs'],
      ['Hugging Face — Text Generation Inference', 'https://huggingface.co/docs/text-generation-inference/index', 'docs'],
      ['Hugging Face — Inference Endpoints', 'https://huggingface.co/docs/inference-endpoints/index', 'docs'],
      ['Ollama — documentation', 'https://docs.ollama.com/', 'docs']
    ],
    questions: [
      ['What is the option teams most often miss?', 'A hosted open model — your choice of model on someone else’s infrastructure. It gives model choice, portable weights and lower per-token cost without operating GPUs.'],
      ['What is underestimated about self-hosting?', 'The gap between serving one user and serving fifty concurrently. That requires continuous batching, KV-cache capacity planning, monitoring and on-call — a role, not a command.'],
      ['Does a hosted open model satisfy a data-residency requirement?', 'No. The weights are portable but the data still leaves your network. Only self-hosting satisfies a strict residency requirement.']
    ]
  }
];
