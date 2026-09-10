/**
 * DOMAIN H — LOCAL RAG (BUILD.md section 11)
 * The same architecture, running entirely on your own machine.
 */
export const topics = [
  {
    id: 'local-rag-architecture',
    title: 'Local RAG Architecture',
    domain: 'local-rag', tier: 1, priority: 'high',
    summary: 'The whole RAG pipeline running on one machine, with nothing leaving it.',
    what: `Local RAG is the same pipeline as any other RAG system — parse, chunk, embed, store, retrieve, generate — with every component running on your own hardware.

Four pieces: a Python application, an embedding model, a vector store, and a language model.`,
    why: `Two reasons that matter in practice. **Privacy**: nothing leaves the machine, which turns a lengthy data-governance conversation into a non-issue. **Learning**: running it locally makes every cost and constraint visible — you feel what model size, quantization and context length actually cost, in a way an API bill never teaches you.`,
    analogy: `Cooking at home versus ordering in. More setup, more equipment, and you learn exactly how much of the meal is heat, time and salt. You also know precisely what went into it.`,
    technical: `A workable local stack:
- **Application** — Python.
- **Embedding model** — \`nomic-embed-text\` via Ollama, or a Sentence Transformers model.
- **Vector store** — Chroma (embedded, simplest) or Qdrant (runs as a service, closer to production).
- **LLM** — Ollama serving a quantized open model.

Hardware reality: a 7B model at 4-bit needs roughly 5GB and runs acceptably on a modern laptop. A 70B model needs roughly 42GB at 4-bit, which means a workstation GPU or heavy offloading and single-digit tokens per second.

Everything you learn transfers. The architecture is identical to a cloud deployment; only the endpoints change. That is what makes it worth building once even if production will be hosted.`,
    diagram: `
   LOCAL RAG — nothing leaves this box

   ┌─────────────────── YOUR MACHINE ─────────────────────────┐
   │                                                          │
   │   documents/                                             │
   │       │                                                  │
   │       ▼                                                  │
   │   PYTHON APP  ── parse · chunk · orchestrate              │
   │       │                                                  │
   │       ├──────────► EMBEDDING MODEL                       │
   │       │            nomic-embed-text via Ollama           │
   │       │            or sentence-transformers              │
   │       │                                                  │
   │       ├──────────► VECTOR STORE                          │
   │       │            Chroma (embedded) or Qdrant (service) │
   │       │                                                  │
   │       └──────────► LLM                                   │
   │                    Ollama · llama3.1:8b · 4-bit          │
   │                                                          │
   └──────────────────────────────────────────────────────────┘
                 no network calls · no data egress

   WHAT EACH PIECE DOES

     Python app       reads files, splits them, calls the others
     embedding model  text → vectors (small, fast, runs on CPU)
     vector store     keeps vectors + text + metadata, searches them
     LLM              reads the retrieved chunks, writes the answer

   HARDWARE REALITY (4-bit quantized)

      7B    ~5 GB    laptop with 16GB RAM        20-40 tok/s
     13B    ~8 GB    laptop with 32GB RAM        10-25 tok/s
     70B   ~42 GB    workstation GPU             5-15 tok/s

   ⚠ THE ARCHITECTURE IS IDENTICAL TO A CLOUD DEPLOYMENT.
     Only the endpoints change. Build it once, locally, and
     everything you learned transfers.`,
    example: {
      language: 'python',
      caption: 'A complete local RAG system in about sixty lines',
      code: `import ollama, chromadb
from pathlib import Path

EMBED_MODEL = "nomic-embed-text"
CHAT_MODEL = "llama3.1:8b"

client = chromadb.PersistentClient(path="./store")
collection = client.get_or_create_collection("docs")


def embed(texts: list[str]) -> list[list[float]]:
    return [ollama.embeddings(model=EMBED_MODEL, prompt=t)["embedding"]
            for t in texts]


def ingest(folder: str, size=500, overlap=80):
    for path in Path(folder).glob("**/*.md"):
        text = " ".join(path.read_text(encoding="utf-8").split())
        step = size - overlap
        chunks = [text[i:i + size] for i in range(0, len(text), step)]

        collection.upsert(
            ids=[f"{path.name}:{i}" for i in range(len(chunks))],  # deterministic
            embeddings=embed(chunks),
            documents=chunks,
            metadatas=[{"source": path.name, "chunk": i}
                       for i in range(len(chunks))],
        )
        print(f"{path.name}: {len(chunks)} chunks")


def ask(question: str, k=4):
    hits = collection.query(query_embeddings=embed([question]), n_results=k)

    if not hits["documents"][0]:
        return "I could not find anything relevant.", []

    context = "\\n\\n".join(
        f"[{i+1}] (source: {m['source']})\\n{d}"
        for i, (d, m) in enumerate(zip(hits["documents"][0],
                                       hits["metadatas"][0]))
    )

    prompt = (
        "Answer using ONLY the context below. Cite each claim as [n].\\n"
        "If the context does not contain the answer, say:\\n"
        '"I could not find this in the documents."\\n\\n'
        f"<context>\\n{context}\\n</context>\\n\\n"
        f"Question: {question}\\nAnswer:"
    )

    reply = ollama.chat(model=CHAT_MODEL,
                        messages=[{"role": "user", "content": prompt}],
                        options={"temperature": 0})
    return reply["message"]["content"], hits["metadatas"][0]


if __name__ == "__main__":
    ingest("./documents")
    answer, sources = ask("What is our refund window for annual plans?")
    print(answer)
    print("sources:", {s["source"] for s in sources})`
    },
    prereq: ['rag-pipeline'], next: ['ollama', 'local-embedding-models'],
    related: ['local-vector-db-choice', 'quantization', 'privacy-pii', 'cloud-vs-local-inference'],
    tools: ['ollama', 'chroma', 'qdrant', 'python', 'sentence-transformers'],
    useCases: [
      'Prototyping RAG on sensitive documents that cannot leave the machine.',
      'Learning the architecture with every cost visible.',
      'Offline or air-gapped environments.'
    ],
    avoid: [
      'When you need frontier-model quality and privacy is not a constraint.',
      'When many concurrent users must be served from one machine.',
      'When the operational burden outweighs the privacy benefit.'
    ],
    mistakes: [
      'Starting with a 70B model on a laptop and concluding local inference is unusable.',
      'Using different embedding models for ingestion and query.',
      'Not persisting the vector store, so it is rebuilt on every run.',
      'Expecting local model quality to match a frontier API on complex reasoning.'
    ],
    keyTerms: [
      ['local RAG', 'The whole pipeline running on your own hardware.'],
      ['Ollama', 'A local runtime that serves models behind a simple API.'],
      ['embedded vector store', 'A store running in-process, with no server.'],
      ['quantized model', 'A model stored at reduced precision to fit in memory.'],
      ['data egress', 'Data leaving your environment. Zero, here.'],
      ['air-gapped', 'A machine with no network access at all.']
    ],
    resources: [
      ['Ollama — documentation', 'https://docs.ollama.com/', 'docs'],
      ['Chroma — getting started', 'https://docs.trychroma.com/docs/overview/getting-started', 'docs'],
      ['Ollama — embedding models', 'https://ollama.com/blog/embedding-models', 'reference'],
      ['LlamaIndex — local models', 'https://docs.llamaindex.ai/en/stable/module_guides/models/llms/local/', 'docs']
    ],
    questions: [
      ['What are the four components of a local RAG system?', 'A Python application to orchestrate, an embedding model, a vector store, and a language model. Ollama can serve both models.'],
      ['Why build it locally even if production will be hosted?', 'The architecture is identical — only the endpoints change — and running it locally makes model size, quantization and context cost tangible in a way an API bill never does.'],
      ['What is the realistic hardware requirement?', 'A 7B model at 4-bit needs around 5GB and runs acceptably on a modern laptop at 20–40 tokens per second. 70B needs around 42GB and a workstation GPU.']
    ],
    interview: {
      s30: 'Local RAG is the same pipeline as any RAG system — parse, chunk, embed, store, retrieve, generate — with every component running on your own hardware, so no data leaves the machine.',
      s90: 'I recommend building one even when production will be hosted, for two reasons. The architecture is identical; only the endpoints change, so everything transfers. And running it locally makes the trade-offs tangible in a way an API bill does not — you feel what a 7B model at 4-bit costs in quality versus a frontier model, you watch context length translate directly into seconds, and you understand quantization because you can see it in memory usage. Commercially, the case is privacy: for documents that genuinely cannot leave the environment, local RAG turns a long data-governance conversation into a non-issue. The honest limitation is quality on complex reasoning and serving concurrency — one machine serves one or two users well, not two hundred.',
      pm: 'It is the fastest way to build real intuition about AI cost and capability, and it is sometimes the only architecture a compliance team will accept.'
    }
  },

  {
    id: 'ollama',
    title: 'Ollama & Local Runtimes',
    domain: 'local-rag', tier: 1, priority: 'high',
    summary: 'The tool that turns "run a model locally" into one command.',
    what: `Ollama downloads open models, manages their quantized weights, and serves them behind a simple HTTP API — so calling a local model looks almost exactly like calling a hosted one.`,
    why: `It removes the setup friction that used to make local inference a weekend project. That matters because the fastest way to develop real intuition about model size, quantization and latency is to run models yourself and watch what happens.`,
    analogy: `A package manager for models. \`ollama pull llama3.1:8b\` is \`apt install\` for a language model — it handles the download, the format, the memory layout and the serving.`,
    technical: `Commands you actually need: \`ollama pull <model>\`, \`ollama run <model>\`, \`ollama list\`, \`ollama ps\`, \`ollama rm\`.

Models are named \`family:size-quantization\` — \`llama3.1:8b\`, \`qwen2.5:14b-instruct-q4_K_M\`. The default tag is usually a 4-bit quantization, which is why a "7B model" downloads as roughly 4–5GB rather than 14GB.

It exposes an OpenAI-compatible endpoint at \`localhost:11434/v1\`, so most client libraries work by changing the base URL.

A **Modelfile** lets you bake a system prompt and parameters into a named model, which is a clean way to version a local assistant configuration.

Alternatives: **llama.cpp** (what Ollama is built on, more control), **LM Studio** (GUI), **vLLM** (production serving, much higher throughput, GPU required).

Watch the first-call latency: the model is loaded into memory on first use and unloaded after an idle period, so a cold call can take several seconds before any tokens appear.`,
    diagram: `
   THE FIVE COMMANDS

     ollama pull llama3.1:8b       download (~4.7 GB, 4-bit default)
     ollama run llama3.1:8b        interactive chat
     ollama list                   what is installed
     ollama ps                     what is loaded in memory right now
     ollama rm llama3.1:8b         free the disk

   MODEL NAMING

     llama3.1 : 8b - instruct - q4_K_M
     └──────┘  └─┘  └──────┘   └────┘
      family  size  tuning     quantization
                    (instruct  (4-bit, medium
                     ≠ base)    quality — the default)

   THE API IS OPENAI-COMPATIBLE

     base_url = "http://localhost:11434/v1"
     api_key  = "ollama"            (unused, but often required)

     → most existing client code works by changing one line

   ⚠ COLD START

     first call    model loads into RAM/VRAM     2-10 s
     warm calls    already resident              immediate
     after idle    unloaded again (default 5 min)

     A latency measurement taken on a cold call is meaningless.`,
    example: {
      language: 'bash',
      caption: 'Setting up a local stack, and baking a configuration into a model',
      code: `# 1. Pull an embedding model and a chat model
ollama pull nomic-embed-text        # 274 MB  — embeddings
ollama pull llama3.1:8b             # 4.7 GB  — chat, 4-bit by default

ollama list
# NAME                 SIZE      MODIFIED
# llama3.1:8b          4.7 GB    2 minutes ago
# nomic-embed-text     274 MB    3 minutes ago

# 2. Check what is actually loaded in memory
ollama ps
# NAME           SIZE     PROCESSOR      UNTIL
# llama3.1:8b    6.2 GB   100% GPU       4 minutes from now
#                ^ larger than the file: weights + KV cache + overhead

# 3. Bake a system prompt and parameters into a named model
cat > Modelfile <<'MODELFILE'
FROM llama3.1:8b

PARAMETER temperature 0
PARAMETER num_ctx 8192

SYSTEM """You answer strictly from the provided context.
Cite each claim as [n]. If the context does not contain the answer,
reply exactly: "I could not find this in the documents."
"""
MODELFILE

ollama create support-rag -f Modelfile
ollama run support-rag

# 4. Use it from Python with any OpenAI-compatible client
python - <<'PY'
from openai import OpenAI
client = OpenAI(base_url="http://localhost:11434/v1", api_key="ollama")
r = client.chat.completions.create(
    model="support-rag",
    messages=[{"role": "user", "content": "What is RAG?"}],
)
print(r.choices[0].message.content)
PY`
    },
    prereq: ['local-rag-architecture'], next: ['local-embedding-models'],
    related: ['quantization', 'gguf', 'cpu-vs-gpu-inference', 'hosted-vs-self-hosted'],
    tools: ['ollama', 'vllm'],
    useCases: [
      'Running models locally with no setup burden.',
      'Comparing model sizes and quantizations empirically.',
      'Offline development and privacy-sensitive prototypes.'
    ],
    avoid: [
      'Production serving for many concurrent users — use vLLM.',
      'When you need frontier-model quality.',
      'On machines without enough RAM for the model you chose.'
    ],
    mistakes: [
      'Pulling a 70B model onto a laptop and concluding local inference does not work.',
      'Measuring latency on a cold call, which includes model loading.',
      'Forgetting the default tag is quantized, then being surprised by quality differences versus the full-precision model.',
      'Using a base model rather than an instruct model and finding it does not follow instructions.'
    ],
    keyTerms: [
      ['Ollama', 'A local model runtime and manager.'],
      ['pull', 'Downloading a model.'],
      ['Modelfile', 'A definition baking a system prompt and parameters into a model.'],
      ['quantization tag', 'The `q4_K_M` suffix indicating precision.'],
      ['cold start', 'The delay while a model is loaded into memory.'],
      ['OpenAI-compatible endpoint', 'An API surface that existing clients already speak.'],
      ['llama.cpp', 'The inference engine Ollama is built on.']
    ],
    resources: [
      ['Ollama — documentation', 'https://docs.ollama.com/', 'docs'],
      ['Ollama — model library', 'https://ollama.com/library', 'reference'],
      ['Ollama — Modelfile reference', 'https://docs.ollama.com/modelfile', 'docs'],
      ['llama.cpp', 'https://github.com/ggml-org/llama.cpp', 'repo'],
      ['LM Studio', 'https://lmstudio.ai/docs', 'docs']
    ],
    questions: [
      ['Why does a 7B model download as roughly 4.7GB rather than 14GB?', 'The default tag is a 4-bit quantization. Full precision would be around 14GB at FP16; 4-bit is about a third of that.'],
      ['Why is a latency measurement on the first call misleading?', 'The model is loaded into memory on first use, which can take several seconds. Only warm-call latency reflects steady-state behaviour.'],
      ['What is a Modelfile for?', 'Baking a system prompt and generation parameters into a named model, so a local assistant configuration is versioned and reproducible rather than passed on every call.']
    ]
  },

  {
    id: 'local-embedding-models',
    title: 'Local Embedding Models',
    domain: 'local-rag', tier: 2, priority: 'medium',
    summary: 'Small models that turn text into vectors on your own hardware, fast and free.',
    what: `An embedding model converts text to vectors. Unlike language models, good embedding models are small — often 20 to 500 million parameters — so they run comfortably on a CPU.`,
    why: `Embeddings are the one part of a RAG pipeline where local is almost always sensible. The models are small, the quality gap to hosted embeddings is narrow, and you avoid sending your entire corpus to a third party just to index it.`,
    analogy: `A translator who converts everything into one shared notation. They do not need to be brilliant, only consistent — and consistency is cheap.`,
    technical: `Common local options: \`all-MiniLM-L6-v2\` (22M parameters, 384 dimensions — fast baseline), \`bge-base-en-v1.5\` (109M, 768 — strong general purpose), \`nomic-embed-text\` (137M, 768, long context, available through Ollama), \`gte-large\` (335M, 1024 — higher quality, slower).

Selection criteria that actually matter: quality on **your** corpus (MTEB is a starting point, not an answer), dimension (storage and search cost), maximum sequence length (must exceed your chunk size or text is silently truncated), and whether the model needs **query/document prefixes**.

Prefixes are a common silent failure. Several models are trained asymmetrically and expect \`query:\` and \`passage:\` prefixes; omitting them costs several points of retrieval accuracy with no error and no warning.

Throughput on a CPU is roughly 100–1,000 chunks per second for small models, so indexing a corpus of 50,000 chunks takes minutes, not hours.`,
    diagram: `
   LOCAL EMBEDDING MODELS

     model                  params  dims  max tokens  notes
     ─────                  ──────  ────  ──────────  ─────
     all-MiniLM-L6-v2         22M   384      256      fast baseline
     bge-base-en-v1.5        109M   768      512      strong default
     nomic-embed-text        137M   768     8192      long context
     gte-large               335M  1024      512      higher quality

   These are TINY compared to language models.
   A 22M-parameter embedder is 0.3% the size of a 7B chat model.

   ⚠ THE SILENT FAILURE: MISSING PREFIXES

     Some models are trained asymmetrically:

       correct    query:   "how do I cancel"
                  passage: "To cancel, open Settings > Billing."

       wrong      "how do I cancel"
                  "To cancel, open Settings > Billing."

     No error. No warning. Several points of retrieval accuracy,
     gone. ALWAYS read the model card.

   ⚠ MAX SEQUENCE LENGTH

     chunk = 700 tokens, model max = 512
       → silently TRUNCATED. The last 188 tokens are never embedded,
         so anything they contained is unretrievable.

     Match chunk size to the model, or choose a long-context embedder.`,
    example: {
      language: 'python',
      caption: 'Comparing local embedding models on your own corpus',
      code: `from sentence_transformers import SentenceTransformer
import numpy as np, time

CANDIDATES = [
    ("all-MiniLM-L6-v2",   None,        None),
    ("BAAI/bge-base-en-v1.5", "Represent this sentence for searching "
                              "relevant passages: ", ""),   # query, doc prefixes
    ("thenlper/gte-base",  None,        None),
]

questions, correct_ids, corpus = load_eval_set()

for name, q_prefix, d_prefix in CANDIDATES:
    model = SentenceTransformer(name)

    # PREFIXES: read the model card. Omitting a required one costs
    # accuracy silently.
    q_text = [(q_prefix or "") + q for q in questions]
    d_text = [(d_prefix or "") + d for d in corpus]

    t0 = time.perf_counter()
    d_vecs = model.encode(d_text, normalize_embeddings=True, batch_size=64)
    encode_s = time.perf_counter() - t0

    q_vecs = model.encode(q_text, normalize_embeddings=True)

    hits = sum(correct_ids[i] in np.argsort(-(d_vecs @ q))[:5]
               for i, q in enumerate(q_vecs))

    print(f"{name:<28} dims {d_vecs.shape[1]:>4}  "
          f"recall@5 {hits/len(questions):.3f}  "
          f"{len(corpus)/encode_s:>6.0f} chunks/s")

# all-MiniLM-L6-v2             dims  384  recall@5 0.812    1420 chunks/s
# BAAI/bge-base-en-v1.5        dims  768  recall@5 0.907     380 chunks/s
# thenlper/gte-base            dims  768  recall@5 0.894     410 chunks/s
#
# bge-base wins here, at half the throughput and twice the storage.
# On YOUR corpus the ranking may differ — which is the point of
# running this rather than reading a leaderboard.

# CHECK THE LIMIT BEFORE INDEXING
print(model.max_seq_length)      # 512 -> chunks must stay under this`
    },
    prereq: ['what-are-embeddings', 'local-rag-architecture'], next: ['local-vector-db-choice'],
    related: ['vector-dimensions', 'chunking', 'ollama'],
    tools: ['sentence-transformers', 'ollama', 'huggingface'],
    useCases: [
      'Indexing a corpus without sending it to a third party.',
      'Fast, free re-indexing during development iteration.',
      'Choosing an embedding model empirically rather than from a leaderboard.'
    ],
    avoid: [
      'Very large corpora where hosted batch embedding is faster end to end.',
      'Multilingual corpora, unless the model explicitly supports the languages.'
    ],
    mistakes: [
      'Omitting required query/document prefixes — a silent accuracy loss.',
      'Chunks longer than the model’s maximum sequence length, silently truncated.',
      'Different models used at ingestion and query time.',
      'Choosing by MTEB rank rather than by performance on your own corpus.',
      'Forgetting that changing the model means re-embedding everything.'
    ],
    keyTerms: [
      ['embedding model', 'Converts text to vectors. Small and CPU-friendly.'],
      ['max sequence length', 'The token limit; longer input is silently truncated.'],
      ['query/document prefix', 'Required by asymmetric models. Easy to miss.'],
      ['MTEB', 'A public embedding benchmark. A starting point, not an answer.'],
      ['throughput', 'Chunks embedded per second.'],
      ['normalisation', 'Scaling vectors to unit length so dot product equals cosine.']
    ],
    resources: [
      ['Sentence Transformers — pretrained models', 'https://www.sbert.net/docs/pretrained_models.html', 'docs'],
      ['MTEB leaderboard', 'https://huggingface.co/spaces/mteb/leaderboard', 'interactive'],
      ['Ollama — embedding models', 'https://ollama.com/blog/embedding-models', 'reference'],
      ['BGE models', 'https://huggingface.co/BAAI/bge-base-en-v1.5', 'reference']
    ],
    questions: [
      ['Why is local embedding almost always reasonable?', 'The models are small enough to run on a CPU, the quality gap to hosted embeddings is narrow, and it avoids sending your entire corpus to a third party purely to index it.'],
      ['What is the silent failure with asymmetric embedding models?', 'They expect query and passage prefixes. Omitting them produces no error and no warning, just several points of retrieval accuracy lost.'],
      ['What happens if a chunk exceeds the model’s maximum sequence length?', 'It is silently truncated. Anything in the discarded portion is never embedded and becomes unretrievable.']
    ]
  },

  {
    id: 'local-vector-db-choice',
    title: 'Choosing a Local Vector Store',
    domain: 'local-rag', tier: 2, priority: 'medium',
    summary: 'What to use locally, and whether it can follow you into production.',
    what: `The local options range from a NumPy array in memory to a full vector database running as a service. The right choice depends on corpus size and whether the same component will run in production.`,
    why: `Choosing a store that cannot follow you to production means a migration later. Choosing something heavyweight for a 3,000-chunk prototype means operational burden for nothing.`,
    analogy: `A notebook, a filing cabinet, or a document management system. All store documents. Buying the third for twenty pages is silly; using the first for twenty thousand is worse.`,
    technical: `The realistic options:

**NumPy array** — under about 20,000 chunks. Brute-force search is exact and takes milliseconds. No dependency, no server, no index tuning. Genuinely the right answer more often than people expect.

**Chroma** — embedded, one line to start, persists to disk. Best for prototypes and small local apps. Less proven at scale.

**Qdrant** — runs as a service via Docker locally and in production. Strong metadata filtering. The best choice if the prototype might become the product.

**pgvector** — if you already run Postgres. One fewer system to secure and back up.

**FAISS** — a library, not a database. Very fast ANN, but you handle persistence, metadata and filtering yourself.

Below roughly 50,000 vectors, exact search is fast enough that the ANN index is unnecessary. Start simple; the migration path from NumPy to Qdrant is an afternoon, and the migration from a wrong production choice is not.`,
    diagram: `
   CHOOSING BY SIZE AND DESTINATION

     < 20k chunks, prototype only
       NumPy array + brute force
       exact · milliseconds · zero dependencies
       ← more often correct than people expect

     < 100k chunks, local app
       Chroma (embedded)
       one line to start · persists to disk

     any size, might become production
       Qdrant (Docker locally, cluster later)
       same engine both places · strong filtering

     already running Postgres
       pgvector
       one fewer system to secure and back up

     need raw ANN speed, will build the rest yourself
       FAISS
       a library, not a database

   BRUTE FORCE IS FASTER THAN YOU THINK

     vectors    exact search time
     ───────    ─────────────────
      1,000        0.4 ms
     10,000        3.1 ms
     50,000       14.8 ms      ← still fine for most products
    100,000       28.7 ms
   1,000,000     291.0 ms      ← now you want an index

   ⚠ MIGRATION COST

     NumPy → Qdrant     an afternoon
     wrong production   a project
     choice → right one

     So: start simple locally, but if the prototype is likely
     to become the product, start with Qdrant.`,
    example: {
      language: 'python',
      caption: 'The same interface over three backends, so switching is trivial',
      code: `import numpy as np

class NumpyStore:
    """Under ~20k chunks this is exact, fast and dependency-free."""
    def __init__(self):
        self.vectors, self.texts, self.meta = None, [], []

    def add(self, vectors, texts, metadatas):
        v = np.asarray(vectors, dtype=np.float32)
        v /= np.linalg.norm(v, axis=1, keepdims=True)
        self.vectors = v if self.vectors is None else np.vstack([self.vectors, v])
        self.texts += texts
        self.meta += metadatas

    def search(self, query_vector, k=5, where=None):
        q = np.asarray(query_vector, np.float32)
        q /= np.linalg.norm(q)
        scores = self.vectors @ q                     # exact, one matmul

        idx = np.arange(len(self.texts))
        if where:                                     # metadata filter
            idx = np.array([i for i in idx
                            if all(self.meta[i].get(k2) == v2
                                   for k2, v2 in where.items())])
            if not len(idx):
                return []
        top = idx[np.argsort(-scores[idx])[:k]]
        return [{"text": self.texts[i], "score": float(scores[i]),
                 "metadata": self.meta[i]} for i in top]

    def save(self, path):
        np.savez(path, vectors=self.vectors,
                 texts=np.array(self.texts, dtype=object),
                 meta=np.array(self.meta, dtype=object))


class ChromaStore:
    """Embedded, persistent, one line to start."""
    def __init__(self, path="./store", name="docs"):
        import chromadb
        self.c = chromadb.PersistentClient(path=path) \\
                        .get_or_create_collection(name)

    def add(self, vectors, texts, metadatas):
        self.c.upsert(ids=[m["id"] for m in metadatas],
                      embeddings=vectors, documents=texts, metadatas=metadatas)

    def search(self, query_vector, k=5, where=None):
        r = self.c.query(query_embeddings=[query_vector], n_results=k, where=where)
        return [{"text": d, "score": 1 - dist, "metadata": m}
                for d, dist, m in zip(r["documents"][0], r["distances"][0],
                                      r["metadatas"][0])]

# Because both expose add() and search(), swapping backends is a
# one-line change — which is exactly why you can start simple.`
    },
    prereq: ['vector-databases', 'local-rag-architecture'], next: ['swapping-the-llm'],
    related: ['ann-indexes', 'nearest-neighbor-search', 'metadata-filtering'],
    tools: ['chroma', 'qdrant', 'faiss', 'pgvector'],
    useCases: [
      'Choosing a store that matches the corpus size.',
      'Avoiding a production migration by choosing the same engine early.',
      'Keeping a prototype dependency-free.'
    ],
    avoid: [
      'A managed cloud store for a local privacy-motivated project.',
      'A heavyweight database for a few thousand chunks.',
      'FAISS when you need metadata filtering and persistence.'
    ],
    mistakes: [
      'Reaching for a vector database when a NumPy array would be exact and faster.',
      'Choosing an embedded store for something that will become a multi-user service.',
      'Not persisting the store, so it is rebuilt on every run.',
      'Assuming a store supports metadata filtering efficiently without checking.'
    ],
    keyTerms: [
      ['embedded store', 'Runs in-process, no server. Chroma.'],
      ['service store', 'Runs as a separate process. Qdrant.'],
      ['brute force', 'Exact search over all vectors. Fast below ~100k.'],
      ['persistence', 'Surviving a restart without rebuilding.'],
      ['migration path', 'How hard it is to move to production.'],
      ['metadata filtering', 'Restricting search by attribute.']
    ],
    resources: [
      ['Chroma — documentation', 'https://docs.trychroma.com/', 'docs'],
      ['Qdrant — quick start', 'https://qdrant.tech/documentation/quickstart/', 'docs'],
      ['FAISS — choosing an index', 'https://github.com/facebookresearch/faiss/wiki/Guidelines-to-choose-an-index', 'repo'],
      ['pgvector', 'https://github.com/pgvector/pgvector', 'repo']
    ],
    questions: [
      ['When is a NumPy array genuinely the right vector store?', 'Below roughly 20,000 chunks. Exact search takes milliseconds, there are no dependencies, no server and no index tuning, and the results are guaranteed correct.'],
      ['Why choose Qdrant for a prototype that might become a product?', 'It runs identically via Docker locally and as a service in production, so there is no migration. Choosing an embedded store and later needing a service is a project.'],
      ['At what scale does an ANN index start to matter?', 'Around 100,000 vectors. Below that, exact search completes in tens of milliseconds and avoids the tuning and silent-recall-loss risks an index introduces.']
    ]
  },

  {
    id: 'swapping-the-llm',
    title: 'Swapping the LLM: Local vs API',
    domain: 'local-rag', tier: 2, priority: 'high',
    summary: 'The same architecture with a different generation endpoint — and what actually changes.',
    what: `In a well-structured RAG system the language model is one component behind an interface. Replacing a local model with an API model, or the reverse, should be a configuration change rather than a rewrite.`,
    why: `It lets you make the local-versus-hosted decision on evidence rather than commitment. Build the pipeline once, then measure quality, cost and latency for each option on your own evaluation set.`,
    analogy: `Swapping the engine in a car built for it. The chassis, wheels and controls are unchanged; the power source and the fuel bill are not.`,
    technical: `What stays the same: parsing, chunking, embedding, the vector store, retrieval, reranking, context assembly, evaluation. That is most of the system.

What changes:
- **Quality** — frontier API models remain better at complex reasoning and instruction following.
- **Cost shape** — per-token versus fixed hardware.
- **Latency** — network round trip versus local compute.
- **Privacy** — prompts leave your network, or they do not.
- **Context length** — local quantized models often have shorter practical windows.
- **Structured output** — API providers offer schema-constrained decoding; local support varies.

Design for the swap: keep generation behind a small interface, keep prompts model-agnostic where possible, and pin model versions on both sides.

A common mature pattern is **routing**: a local model handles simple, high-volume, privacy-sensitive requests, and an API model handles the hard ones.`,
    diagram: `
   THE SAME PIPELINE, TWO ENDPOINTS

     parse → chunk → embed → store → retrieve → rerank → assemble
                                                            │
                                                            ▼
                                                    ┌───────────────┐
                                                    │  GENERATION   │
                                                    └───────┬───────┘
                                        ┌───────────────────┴────────────┐
                                        ▼                                ▼
                                  LOCAL (Ollama)                 API (Anthropic/
                                                                  OpenAI/Google)
     quality        good                                          frontier
     cost           fixed hardware                                per token
     latency        bounded by your GPU                           network + queue
     privacy        nothing leaves                                prompts leave
     context        often shorter in practice                     very long
     structured out varies                                        schema-constrained
     offline        yes                                           no

   ⚠ EVERYTHING BEFORE "GENERATION" IS UNCHANGED.
     That is 80% of the system, and it is why the swap is cheap
     if you designed for it.

   THE MATURE PATTERN: ROUTING

     request ──► classify difficulty / sensitivity
                     │
          ┌──────────┴──────────┐
     simple or sensitive     complex
          │                     │
          ▼                     ▼
     local model           API model
     (most traffic)        (the hard minority)

     Typically 70-85% handled locally, at a fraction of the cost,
     with the frontier model reserved for what needs it.`,
    example: {
      language: 'python',
      caption: 'One interface, three backends, and a router',
      code: `from abc import ABC, abstractmethod

class Generator(ABC):
    @abstractmethod
    def generate(self, prompt: str, max_tokens: int = 800) -> dict: ...


class OllamaGenerator(Generator):
    def __init__(self, model="llama3.1:8b"):
        import ollama
        self.ollama, self.model = ollama, model

    def generate(self, prompt, max_tokens=800):
        r = self.ollama.chat(
            model=self.model,
            messages=[{"role": "user", "content": prompt}],
            options={"temperature": 0, "num_predict": max_tokens},
        )
        return {"text": r["message"]["content"], "cost": 0.0,
                "backend": "local"}


class AnthropicGenerator(Generator):
    def __init__(self, model="claude-sonnet-5"):
        import anthropic
        self.client, self.model = anthropic.Anthropic(), model

    def generate(self, prompt, max_tokens=800):
        r = self.client.messages.create(
            model=self.model, max_tokens=max_tokens, temperature=0,
            messages=[{"role": "user", "content": prompt}],
        )
        cost = (r.usage.input_tokens * 3 + r.usage.output_tokens * 15) / 1e6
        return {"text": r.content[0].text, "cost": cost, "backend": "api"}


class RoutingGenerator(Generator):
    """Local for the common case, API for the hard minority."""
    def __init__(self, local, api, classifier):
        self.local, self.api, self.classify = local, api, classifier

    def generate(self, prompt, max_tokens=800):
        difficulty = self.classify(prompt)
        if difficulty == "simple" or contains_sensitive_data(prompt):
            return self.local.generate(prompt, max_tokens)
        return self.api.generate(prompt, max_tokens)


# Everything upstream is untouched. Evaluate all three on the SAME
# golden set and decide with numbers:
#
#                 groundedness   p95      $/1k requests
#   local 8B          0.86      2.9s          $0
#   api frontier      0.94      1.8s        $31
#   routed (78% local)0.92      2.4s         $7`
    },
    prereq: ['local-rag-architecture', 'inference-llm'], next: ['local-rag-build-plan'],
    related: ['cloud-vs-local-inference', 'api-vs-local-model', 'ai-model-selection', 'ai-cost'],
    tools: ['ollama', 'anthropic', 'openai', 'google-ai'],
    useCases: [
      'Deciding between local and hosted generation with evidence.',
      'Routing traffic so most requests stay local and cheap.',
      'Keeping sensitive requests on-premises while using a frontier model elsewhere.'
    ],
    avoid: [
      'Coupling prompts and parsing tightly to one provider’s quirks.',
      'Assuming a prompt tuned for one model transfers unchanged to another.'
    ],
    mistakes: [
      'Building generation directly against one SDK, making the swap a rewrite.',
      'Comparing models without a common evaluation set.',
      'Assuming local model quality matches frontier on complex reasoning.',
      'Forgetting that local models often have a shorter practical context window.',
      'Routing on cost alone without checking quality per route.'
    ],
    keyTerms: [
      ['generation interface', 'A thin abstraction over the model call.'],
      ['model routing', 'Sending easy requests to a cheap model and escalating the rest.'],
      ['provider portability', 'How easily you can change backends.'],
      ['practical context window', 'What a quantized local model handles well, often less than its maximum.'],
      ['blended cost', 'Average cost across a routed mix of models.'],
      ['fallback', 'Switching backend when one is unavailable.']
    ],
    resources: [
      ['Ollama — OpenAI compatibility', 'https://docs.ollama.com/openai', 'docs'],
      ['Anthropic — API reference', 'https://docs.anthropic.com/en/api/messages', 'docs'],
      ['LiteLLM — one interface over many providers', 'https://docs.litellm.ai/', 'docs'],
      ['LlamaIndex — LLM abstractions', 'https://docs.llamaindex.ai/en/stable/module_guides/models/llms/', 'docs']
    ],
    questions: [
      ['What proportion of a RAG system changes when you swap the model?', 'Very little. Parsing, chunking, embedding, storage, retrieval, reranking, assembly and evaluation are all unchanged — roughly 80% of the system.'],
      ['What is the routing pattern and why does it work?', 'A local model handles simple, high-volume or sensitive requests and an API model handles the hard minority. Typically 70–85% stays local, cutting cost dramatically while preserving quality where it matters.'],
      ['What should you compare backends on?', 'The same golden evaluation set, measuring groundedness, latency and cost together. Comparing on impressions or on published benchmarks tells you nothing about your corpus.']
    ]
  },

  {
    id: 'local-rag-build-plan',
    title: 'Building Local RAG: A Practical Plan',
    domain: 'local-rag', tier: 2, priority: 'medium',
    summary: 'A concrete sequence for getting from nothing to a working local RAG system.',
    what: `An ordered plan: get the pieces running, index a small corpus, make retrieval work, then make generation work, then measure. Each step is verifiable before the next begins.`,
    why: `Most failed attempts try to build everything at once and then cannot tell which part is broken. Building in this order means every step is verifiable on its own, and the first version works before it is elaborate.`,
    analogy: `Wiring a house circuit by circuit and testing each before closing the walls. Slower to start, dramatically faster than finding a fault afterwards.`,
    technical: `The sequence:

**1. Runtime** — install Ollama, pull an embedding model and a chat model, confirm both respond.
**2. Corpus** — take 10–20 real documents. Not a sample dataset; your actual documents, because their messiness is the problem.
**3. Parse and inspect** — extract text and *read it*. Fix parsing before anything else. This step catches most eventual failures.
**4. Chunk and inspect** — print several chunks. Are they coherent? Do they carry their heading?
**5. Index** — embed and store. Confirm the count matches expectations.
**6. Retrieval only** — no generation yet. Write 20 real questions, retrieve for each, and check by eye whether the right chunk comes back. Iterate here until it does.
**7. Generation** — only now add the model, with an instruction to use only the context and to cite.
**8. Evaluate** — turn those 20 questions into a golden set with expected answers, and measure groundedness.
**9. Iterate** — reranking, hybrid search, chunk size — each measured against the golden set.

Step 6 is the one people skip, and it is the one that determines whether the system works.`,
    diagram: `
   THE ORDER THAT WORKS

   1  RUNTIME       ollama pull nomic-embed-text llama3.1:8b
                    verify both respond            ✓ before continuing

   2  CORPUS        10-20 of YOUR OWN documents
                    not a sample dataset — their mess is the problem

   3  PARSE         extract text and READ IT
                    ← catches most eventual failures, costs 20 minutes

   4  CHUNK         print 5 chunks. Coherent? Heading attached?

   5  INDEX         embed + store. Does the count look right?

   6  RETRIEVAL ONLY   ← THE STEP EVERYONE SKIPS
                    20 real questions
                    for each: does the right chunk come back?
                    ITERATE HERE. No generation yet.

   7  GENERATION    now add the model
                    "use only the context, cite each claim"

   8  EVALUATE      turn the 20 questions into a golden set
                    measure groundedness

   9  ITERATE       rerank · hybrid · chunk size
                    each change measured against the golden set

   ⚠ WHY STEP 6 MATTERS MOST

     If retrieval does not return the right chunk, generation
     cannot possibly produce the right answer. Adding the model
     before retrieval works means debugging two things at once —
     and the fluent wrong answer hides the retrieval failure.`,
    example: {
      language: 'python',
      caption: 'Step 6 in full — the retrieval-only harness',
      code: `# Run this BEFORE writing a single line of generation code.

QUESTIONS = [
    # Real questions, written by someone who knows the domain.
    ("What is the refund window for annual plans?",   "billing-policy.md"),
    ("How do I reset a customer's password?",          "support-runbook.md"),
    ("What is our data retention period?",             "privacy-policy.md"),
    # ... 20 of these
]

def retrieval_check(store, embed, k=5):
    hits_at_1 = hits_at_k = 0

    for question, expected_source in QUESTIONS:
        results = store.search(embed(question), k=k)

        sources = [r["metadata"]["source"] for r in results]
        top1 = sources[0] == expected_source if sources else False
        topk = expected_source in sources

        hits_at_1 += top1
        hits_at_k += topk

        mark = "✓" if top1 else ("~" if topk else "✗")
        print(f"{mark} {question[:52]:<52} → {sources[:3]}")

        if not topk:
            # The most useful debugging output in the whole project
            print(f"     MISSED. Best score {results[0]['score']:.3f} "
                  f"from {sources[0] if sources else 'nothing'}")
            print(f"     Top chunk: {results[0]['text'][:120]}…")

    n = len(QUESTIONS)
    print(f"\\nrecall@1 {hits_at_1/n:.2f}   recall@{k} {hits_at_k/n:.2f}")
    return hits_at_k / n

# Iterate on chunk size, overlap and the embedding model until
# recall@5 is above ~0.85. THEN add generation.
#
#   chunk 300, overlap 0    recall@5 0.55
#   chunk 500, overlap 80   recall@5 0.75
#   + heading prefix        recall@5 0.90   ← now add the model`
    },
    prereq: ['swapping-the-llm', 'local-vector-db-choice'], next: [],
    related: ['rag-pipeline', 'ingestion-parsing', 'retrieval-evaluation', 'golden-sets'],
    tools: ['ollama', 'chroma', 'python', 'sentence-transformers'],
    useCases: [
      'Getting a first local RAG system working reliably.',
      'Teaching the pipeline by building it in verifiable steps.',
      'Establishing a baseline before adding advanced techniques.'
    ],
    avoid: [
      'Building all stages before testing any of them.',
      'Starting with a sample dataset instead of your real documents.'
    ],
    mistakes: [
      'Skipping the retrieval-only step and debugging retrieval and generation together.',
      'Not reading the extracted text, so parsing failures surface much later.',
      'Using a clean sample corpus, so the real corpus’s messiness is discovered at the end.',
      'Adding reranking and hybrid search before the baseline is measured.',
      'Writing test questions after seeing what the system can answer.'
    ],
    keyTerms: [
      ['retrieval-only testing', 'Verifying retrieval before adding generation.'],
      ['recall@k', 'Whether the correct source appears in the top k.'],
      ['golden set', 'Fixed questions with expected answers.'],
      ['baseline', 'The simple version everything else is measured against.'],
      ['iteration loop', 'Change one thing, re-measure, keep or revert.']
    ],
    resources: [
      ['Ollama — documentation', 'https://docs.ollama.com/', 'docs'],
      ['Chroma — getting started', 'https://docs.trychroma.com/docs/overview/getting-started', 'docs'],
      ['LlamaIndex — starter tutorial (local models)', 'https://docs.llamaindex.ai/en/stable/getting_started/starter_example_local/', 'tutorial'],
      ['LangChain — local RAG', 'https://python.langchain.com/docs/tutorials/local_rag/', 'tutorial']
    ],
    questions: [
      ['Why test retrieval before adding generation?', 'If retrieval does not return the right chunk, generation cannot produce the right answer. Adding the model first means debugging two things at once, and a fluent wrong answer hides the retrieval failure.'],
      ['Why use your own documents rather than a sample dataset?', 'Sample datasets are clean. Your documents have tables, scanned pages, boilerplate and inconsistent structure — and that messiness is the actual problem the system has to solve.'],
      ['What recall level should you reach before adding generation?', 'Roughly 0.85 recall@5 on real questions. Below that, the generation stage is being asked to answer from context that does not contain the answer.']
    ]
  }
];
