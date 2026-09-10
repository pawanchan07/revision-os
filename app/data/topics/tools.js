/**
 * DOMAIN W — TOOLS ECOSYSTEM (BUILD.md section 26)
 *
 * The per-tool cards live in the Tools view (app/data/tools.js).
 * These topics are the conceptual layer: how the ecosystem fits
 * together and how to decide what to adopt.
 */
export const topics = [
  {
    id: 'tool-landscape',
    title: 'The Tool Landscape',
    domain: 'tools', tier: 1, priority: 'high',
    summary: 'Nine functional layers, and why almost every tool belongs to exactly one.',
    what: `The AI tooling ecosystem looks chaotic because there are hundreds of names. It becomes tractable once you see that almost every tool occupies one of nine functional layers, and that tools within a layer are substitutes for each other.`,
    why: `Without the map, every new tool feels like something you might be missing. With it, a new tool is immediately placeable: "that is another vector database" or "that is another evaluation framework", and the only question is whether it is better than what you already use in that slot.`,
    analogy: `A kitchen. Knives, pans, ovens and refrigerators are different layers. A new brand of knife is interesting; it does not change your understanding of what a kitchen is.`,
    technical: `The layers, in roughly the order data flows through them:

**Programming** — Python, VS Code, Git. The substrate. Not AI-specific and not optional.
**Database** — PostgreSQL, SQLite, DuckDB. Where your actual records live.
**Vector database** — Chroma, Qdrant, pgvector, Pinecone, Weaviate, Milvus, FAISS. Where embeddings live.
**LLM access** — Anthropic, OpenAI, Google, Ollama, vLLM. The generation layer.
**Open source** — Hugging Face, Transformers, sentence-transformers, PyTorch. Weights and the code that runs them.
**RAG / orchestration** — LangChain, LlamaIndex, Unstructured. Glue between retrieval and generation.
**Evaluation** — Ragas, DeepEval, LangSmith, Phoenix, Braintrust. Whether it works.
**Observability** — OpenTelemetry and the tracing side of the evaluation tools. What happened in production.
**Automation / agents** — n8n, LangGraph, MCP. Multi-step and connected workflows.

Two structural facts matter more than any individual tool. First, **the layers are stable and the tools are not** — the vector database layer will exist in five years; which vector database you use will probably have changed. Second, **layers can collapse**: pgvector puts the vector layer inside the database layer, and Ollama puts the LLM and serving layers into one binary. Collapsing layers is usually the right move when you can.`,
    diagram: `
   NINE LAYERS — data flows roughly downward

     PROGRAMMING      Python · VS Code · Git
       the substrate. not AI-specific, not optional

     DATABASE         PostgreSQL · SQLite · DuckDB
       where your actual records live

     VECTOR DATABASE  Chroma · Qdrant · pgvector
                      Pinecone · Weaviate · Milvus · FAISS
       where embeddings live

     LLM ACCESS       Anthropic · OpenAI · Google
                      Ollama · vLLM
       the generation layer

     OPEN SOURCE      Hugging Face · Transformers
                      sentence-transformers · PyTorch
       weights, and the code that runs them

     ORCHESTRATION    LangChain · LlamaIndex · Unstructured
       glue between retrieval and generation

     EVALUATION       Ragas · DeepEval · LangSmith
                      Phoenix · Braintrust
       whether it works

     OBSERVABILITY    OpenTelemetry + tracing
       what happened in production

     AUTOMATION       n8n · LangGraph · MCP
       multi-step and connected workflows

   ⚠ TWO STRUCTURAL FACTS

     1  THE LAYERS ARE STABLE. THE TOOLS ARE NOT.
        the vector-database layer will exist in five years
        which vector database you use probably will not

     2  LAYERS CAN COLLAPSE — and usually should
        pgvector  → vector layer INSIDE the database layer
        Ollama    → model + serving in one binary

   A NEW TOOL IS JUST A NEW ENTRY IN ONE SLOT.
   The only question: is it better than what is in that slot now?`,
    example: {
      language: 'python',
      caption: 'The same application, mapped onto the layers',
      code: `# Every import below belongs to exactly one layer.
# This is the whole stack of a working RAG system.

# ── PROGRAMMING ────────────────────────────────────────────
import os, logging                          # Python
# (VS Code and Git leave no trace in the code)

# ── DATABASE ───────────────────────────────────────────────
import psycopg                              # PostgreSQL

# ── VECTOR DATABASE ────────────────────────────────────────
from qdrant_client import QdrantClient      # Qdrant
# ...or nothing at all, if you use pgvector — the vector
#    layer COLLAPSES into the database layer above

# ── OPEN SOURCE (embedding side) ───────────────────────────
from sentence_transformers import SentenceTransformer

# ── LLM ACCESS ─────────────────────────────────────────────
import anthropic                            # hosted
# import ollama                             # or local

# ── ORCHESTRATION ──────────────────────────────────────────
# ...deliberately absent. Direct calls are ~60 lines here,
#    and the framework would add a dependency without
#    removing any real complexity. See choosing-tools.

# ── EVALUATION ─────────────────────────────────────────────
from ragas import evaluate                  # Ragas

# ── OBSERVABILITY ──────────────────────────────────────────
from opentelemetry import trace             # OpenTelemetry

# ── AUTOMATION / AGENTS ────────────────────────────────────
# MCP server exposes this system as a tool to other agents


LAYERS = {
    "programming":   ["python", "vscode", "git"],
    "database":      ["postgres"],
    "vector":        ["qdrant"],
    "llm":           ["anthropic"],
    "oss":           ["sentence-transformers"],
    "orchestration": [],                      # ← chosen empty
    "evaluation":    ["ragas"],
    "observability": ["opentelemetry"],
    "automation":    ["mcp"],
}

for layer, tools in LAYERS.items():
    print(f"{layer:<14} {', '.join(tools) or '— (none needed)'}")

# Nine layers. Eight tools. One deliberate omission.
# That is a complete, explainable stack — and being able to
# name the empty slot is as valuable as filling it.`
    },
    prereq: [], next: ['choosing-tools'],
    related: ['rag-pipeline', 'vector-databases', 'orchestration-frameworks', 'tracing'],
    tools: ['python', 'postgres', 'qdrant', 'anthropic', 'ollama', 'huggingface', 'langchain', 'ragas', 'opentelemetry', 'n8n'],
    useCases: [
      'Placing an unfamiliar tool without researching it.',
      'Auditing a stack for missing or duplicated layers.',
      'Explaining an architecture to someone who does not know the tools.'
    ],
    avoid: [
      'Treating the tool list as a shopping list — most stacks need one tool per layer at most.',
      'Adding a second tool in a layer you already fill.'
    ],
    mistakes: [
      'Learning tools instead of layers, so every new release feels like falling behind.',
      'Filling every layer because it exists, rather than because there is a problem.',
      'Missing that layers can collapse — running a separate vector database when pgvector would do.',
      'Confusing an orchestration framework with an architecture; it is glue, not a design.'
    ],
    keyTerms: [
      ['functional layer', 'A slot in the stack; tools within it are substitutes.'],
      ['substrate', 'Python, editor, version control. Not AI-specific.'],
      ['orchestration', 'Glue between retrieval, generation and tools.'],
      ['layer collapse', 'One tool covering two layers, e.g. pgvector.'],
      ['stack audit', 'Checking which layers are filled, empty or duplicated.']
    ],
    resources: [
      ['Hugging Face — documentation hub', 'https://huggingface.co/docs', 'docs'],
      ['LangChain — documentation', 'https://python.langchain.com/docs/introduction/', 'docs'],
      ['OpenTelemetry — GenAI semantic conventions', 'https://opentelemetry.io/docs/specs/semconv/gen-ai/', 'docs'],
      ['Qdrant — documentation', 'https://qdrant.tech/documentation/', 'docs'],
      ['Ollama — documentation', 'https://docs.ollama.com/', 'docs']
    ],
    questions: [
      ['Why organise tools by layer rather than by name?', 'Layers are stable and tools are not. Placing a new tool in a layer turns "am I missing something?" into "is this better than what fills that slot?"'],
      ['What does it mean for layers to collapse?', 'One tool covers two. pgvector puts vector search inside PostgreSQL; Ollama combines model storage and serving. Collapsing layers removes moving parts and is usually the right move.'],
      ['How many tools does a working RAG stack need?', 'Roughly one per layer, and some layers can be left deliberately empty. A complete production stack is commonly eight or nine tools, not thirty.']
    ]
  },

  {
    id: 'choosing-tools',
    title: 'Choosing Tools',
    domain: 'tools', tier: 1, priority: 'high',
    summary: 'A decision procedure that survives the next hype cycle.',
    what: `Choosing a tool is choosing what to depend on. The useful criteria are not features — they are what happens when the tool is wrong, slow, abandoned or expensive, and how hard it is to leave.`,
    why: `Tool decisions are made quickly and lived with for years. The cost of a bad choice is rarely the tool itself; it is the migration you cannot afford to do and the debugging you cannot do because you do not understand what is happening underneath.`,
    analogy: `Choosing a building material rather than a colour. You can repaint. You cannot easily change the foundation once the building is on it.`,
    technical: `Seven questions, roughly in order of decisiveness:

1. **What problem does this remove?** If you cannot name a specific pain, you do not need the tool. "Everyone uses it" is not a pain.
2. **What is the exit cost?** How much code is coupled to its abstractions? A tool you can remove in a day is a low-risk bet; one whose data model spreads through your codebase is a marriage.
3. **Can you debug through it?** When it misbehaves, can you see what it actually did? Layers you cannot see into become layers you cannot fix.
4. **Is it maintained?** Recent commits, releases, responsive issues, and someone paid to work on it.
5. **Does it fit a layer you have not already filled?** A second tool in a filled layer needs a strong reason.
6. **What does it cost at your scale, not at demo scale?** Per-request pricing and per-seat pricing behave very differently at 100× traffic.
7. **Can you start without it?** Building the direct version first is the cheapest way to learn whether the abstraction earns its place.

The pattern behind all seven: **prefer boring, reversible, inspectable choices at the bottom of the stack, and allow experimentation at the top.** A wrong evaluation framework is a week. A wrong database is a year.`,
    diagram: `
   SEVEN QUESTIONS, MOST DECISIVE FIRST

     1  What problem does this REMOVE?
          "everyone uses it" is not a problem

     2  What is the EXIT COST?
          removable in a day     → low-risk bet
          data model everywhere  → marriage

     3  Can you DEBUG THROUGH it?
          a layer you cannot see into
          is a layer you cannot fix

     4  Is it MAINTAINED?
          recent releases · responsive issues
          somebody paid to work on it

     5  Does it fill an EMPTY LAYER?
          a second tool in a filled layer
          needs a strong reason

     6  What does it cost AT YOUR SCALE?
          demo scale and 100x scale price differently

     7  Can you START WITHOUT IT?
          building the direct version first is the
          cheapest way to learn if the abstraction earns its place

   THE PATTERN BEHIND ALL SEVEN

     BOTTOM OF STACK          TOP OF STACK
     database, language       eval harness, prototypes
     boring · reversible      experiment freely
     inspectable

     a wrong evaluation framework  ≈ one week
     a wrong database              ≈ one year

   ⚠ THE MOST EXPENSIVE TOOL IS THE ONE YOU CANNOT
     SEE INSIDE AND CANNOT REMOVE.`,
    example: {
      language: 'python',
      caption: 'Scoring a tool decision instead of arguing about it',
      code: `WEIGHTS = {                     # decisiveness, not preference
    "removes_real_pain": 3.0,
    "low_exit_cost":     2.5,
    "debuggable":        2.0,
    "maintained":        1.5,
    "fills_empty_layer": 1.5,
    "cost_at_scale":     1.5,
}

def score(name, **criteria):
    """Each criterion scored 0-5. Missing = 0."""
    total = sum(WEIGHTS[k] * criteria.get(k, 0) for k in WEIGHTS)
    return name, round(total / sum(WEIGHTS.values()) * 20) / 20 * 5

# Decision: do we adopt an orchestration framework for a
# 60-line retrieve-then-generate pipeline?

print(score("LangChain",
            removes_real_pain=1,    # we have no pain it removes yet
            low_exit_cost=1,        # its abstractions would spread
            debuggable=2,           # several layers of indirection
            maintained=5,
            fills_empty_layer=5,
            cost_at_scale=5))
# ('LangChain', 2.6)

print(score("direct SDK calls",
            removes_real_pain=3,    # full control, no indirection
            low_exit_cost=5,
            debuggable=5,
            maintained=5,           # the provider SDK itself
            fills_empty_layer=5,
            cost_at_scale=5))
# ('direct SDK calls', 4.5)

# The framework loses on the two most decisive criteria and wins
# on the least decisive ones. That is the whole argument, and the
# weighting makes it visible instead of tribal.
#
# Revisit at 600 lines. The answer legitimately changes with scale —
# which is why the decision is recorded with its inputs, not just
# its outcome.

# ── THE QUESTION THAT PREVENTS MOST BAD ADOPTIONS ──────────
def can_we_remove_this(tool, codebase):
    """If the answer is 'no idea', that IS the answer."""
    touched = grep_imports(codebase, tool)
    coupled = grep_type_annotations(codebase, tool)
    return {
        "files_importing": len(touched),
        "files_typed_against_it": len(coupled),   # the dangerous number
        "removable_in_a_day": len(coupled) < 5,
    }`
    },
    prereq: ['tool-landscape'], next: [],
    related: ['ai-build-vs-buy', 'orchestration-frameworks', 'technical-debt', 'hosted-vs-self-hosted'],
    tools: ['langchain', 'llamaindex', 'postgres', 'chroma', 'ragas'],
    useCases: [
      'Deciding whether to adopt a framework.',
      'Justifying a stack choice to a team.',
      'Reviewing an existing stack for tools that no longer earn their place.'
    ],
    avoid: [
      'Choosing on feature lists.',
      'Adopting at the bottom of the stack on the basis of a demo.'
    ],
    mistakes: [
      'Adopting a tool because it is popular rather than because it removes a named pain.',
      'Ignoring exit cost until a migration is forced.',
      'Choosing a tool you cannot debug through, then being unable to fix production.',
      'Pricing at demo scale and being surprised by the bill at production scale.'
    ],
    keyTerms: [
      ['exit cost', 'How hard the tool is to remove later.'],
      ['coupling', 'How far a tool’s abstractions spread through your code.'],
      ['debuggability', 'Whether you can see what the tool actually did.'],
      ['reversibility', 'Whether a decision can be undone cheaply.'],
      ['boring technology', 'Preferring well-understood choices at the bottom of the stack.'],
      ['demo scale vs production scale', 'Pricing and behaviour differ by orders of magnitude.']
    ],
    resources: [
      ['Choose Boring Technology', 'https://boringtechnology.club/', 'reference'],
      ['LangChain — documentation', 'https://python.langchain.com/docs/introduction/', 'docs'],
      ['LlamaIndex — documentation', 'https://docs.llamaindex.ai/', 'docs'],
      ['Anthropic — building effective agents', 'https://www.anthropic.com/engineering/building-effective-agents', 'article']
    ],
    questions: [
      ['What is the most decisive question when adopting a tool?', 'What problem does it remove? If you cannot name a specific pain you are currently feeling, the tool is a dependency without a benefit.'],
      ['Why does exit cost matter more than features?', 'Features are what you evaluate for a week; exit cost is what you live with for years. A tool whose abstractions spread through the codebase cannot be removed when it stops fitting.'],
      ['Where should you be conservative and where can you experiment?', 'Be boring and reversible at the bottom of the stack — language, database, serving. Experiment freely at the top, where a wrong choice costs a week rather than a year.']
    ],
    interview: {
      s30: 'I choose tools on exit cost and debuggability rather than features. The question I ask first is what specific pain the tool removes, and if we cannot name one, we do not adopt it.',
      s90: 'The failure mode I have seen repeatedly is adopting a framework early because it is what everyone uses, and then discovering six months in that its abstractions have spread through the codebase and nobody can debug production because there are four layers of indirection between the code and the API call. So I weight the criteria explicitly: does it remove a real pain, what does it cost to remove, and can I see what it actually did. Those three dominate. I am deliberately conservative at the bottom of the stack — database, language, serving — because a wrong choice there is a year of work, and deliberately permissive at the top, where a wrong evaluation harness costs a week. And I write the decision down with its inputs, because the right answer genuinely changes as a system grows; a framework that was overhead at sixty lines can be the right call at six hundred.',
      pm: 'It is the difference between a stack you can change and one that changes you, and it shows up as delivery speed eighteen months later.'
    }
  },

  {
    id: 'pytorch',
    title: 'PyTorch & The Layer Underneath',
    domain: 'tools', tier: 3, priority: 'low',
    summary: 'The framework nearly every model is actually built and run on.',
    what: `PyTorch is the deep-learning framework most models are defined, trained and executed in. Transformers, sentence-transformers and most serving stacks are built on top of it.`,
    why: `You rarely write PyTorch directly, and you constantly read error messages, memory settings and dtype arguments that come from it. Recognising that layer turns a class of confusing errors into ordinary ones.`,
    analogy: `The engine under a car you drive by its controls. You do not rebuild it, and knowing it is there is what lets you understand the warning lights.`,
    technical: `What it provides: **tensors** (multi-dimensional arrays with GPU support), **autograd** (automatic differentiation, which is what makes training possible), **nn.Module** (the way model architectures are expressed), and **device management** (moving computation between CPU and GPU).

The parts that surface in everyday work even when you never write PyTorch:
- \`torch_dtype=torch.bfloat16\` when loading a model — a PyTorch dtype
- \`device_map="auto"\` — PyTorch device placement
- \`CUDA out of memory\` — a PyTorch allocator message
- \`.to(device)\` in example code — moving a tensor to the GPU
- \`torch.no_grad()\` — disabling gradient tracking for inference, which saves substantial memory

**TensorFlow** was the dominant framework and is now mostly legacy in this space; **JAX** is used heavily at Google and in research. For LLM work, PyTorch is the default assumption.

You do not need to be able to write a model in PyTorch. You need to recognise it in a stack trace.`,
    diagram: `
   THE STACK BENEATH WHAT YOU WRITE

     your code
       ollama.chat(...)  ·  model.encode(...)
            │
     high-level libraries
       Transformers · sentence-transformers · vLLM
            │
     PYTORCH                      ← the layer you rarely write
       tensors · autograd · nn.Module · device management
            │
     CUDA / Metal / CPU kernels
            │
     hardware

   WHERE PYTORCH SURFACES IN EVERYDAY WORK

     torch_dtype=torch.bfloat16    a PyTorch dtype
     device_map="auto"             PyTorch device placement
     CUDA out of memory            a PyTorch allocator message
     .to(device)                   moving a tensor to the GPU
     torch.no_grad()               inference mode, saves memory

   WHAT IT PROVIDES

     tensors        arrays with GPU support
     autograd       automatic differentiation → training
     nn.Module      how architectures are expressed
     device mgmt    CPU ↔ GPU placement

   THE FIELD

     PyTorch      the default for LLM work
     TensorFlow   largely legacy in this space
     JAX          Google and research

   ⚠ YOU DO NOT NEED TO WRITE IT.
     YOU NEED TO RECOGNISE IT IN A STACK TRACE.`,
    example: {
      language: 'python',
      caption: 'The PyTorch you actually encounter',
      code: `import torch

# ── WHAT DEVICE IS AVAILABLE? the first line of most scripts ──
device = ("cuda" if torch.cuda.is_available()
          else "mps" if torch.backends.mps.is_available()   # Apple Silicon
          else "cpu")
print(device, torch.__version__)

if device == "cuda":
    print(torch.cuda.get_device_name(0))
    total = torch.cuda.get_device_properties(0).total_memory / 1e9
    print(f"{total:.1f} GB VRAM")

# ── THE ARGUMENTS THAT ARE ACTUALLY PYTORCH ────────────────
from transformers import AutoModelForCausalLM
model = AutoModelForCausalLM.from_pretrained(
    "meta-llama/Llama-3.1-8B-Instruct",
    torch_dtype=torch.bfloat16,     # ← PyTorch dtype (precision-formats)
    device_map="auto",              # ← PyTorch device placement
)

# ── THE ONE HABIT WORTH KNOWING ────────────────────────────
# Inference does not need gradients. Tracking them anyway can
# use MORE memory than the model itself.

with torch.no_grad():               # or torch.inference_mode()
    out = model.generate(**inputs, max_new_tokens=200)

# Forgetting this is a common cause of "CUDA out of memory" on a
# machine that should have plenty of room.

# ── READING THE ERROR YOU WILL ACTUALLY SEE ────────────────
# torch.OutOfMemoryError: CUDA out of memory. Tried to allocate
#   2.00 GiB. GPU 0 has a total capacity of 23.65 GiB of which
#   1.44 GiB is free.
#
#   ↑ this is a PyTorch ALLOCATOR message, not a model error.
#     Fixes, in order of cheapness:
#       torch.no_grad()          — if you forgot it
#       smaller batch / context  — shrinks the KV cache
#       lower precision          — bf16, then 4-bit
#       torch.cuda.empty_cache() — reclaims cached blocks

print(f"{torch.cuda.memory_allocated()/1e9:.1f} GB in use")
print(f"{torch.cuda.memory_reserved()/1e9:.1f} GB reserved")
# 'reserved' exceeding 'allocated' is normal — the allocator
# caches blocks rather than returning them to the driver.`
    },
    prereq: [], next: [],
    related: ['transformers-library', 'precision-formats', 'vram-ram-requirements', 'tool-landscape'],
    tools: ['pytorch', 'transformers', 'huggingface'],
    useCases: [
      'Reading a stack trace from a model library.',
      'Understanding dtype and device arguments in example code.',
      'Diagnosing out-of-memory errors.'
    ],
    avoid: [
      'Writing raw PyTorch when a higher-level library does the job.',
      'Treating a PyTorch allocator error as a model bug.'
    ],
    mistakes: [
      'Running inference without torch.no_grad() and running out of memory unnecessarily.',
      'Assuming "CUDA out of memory" means the GPU is too small, when it is often batch size or a missing no_grad.',
      'Confusing reserved with allocated memory — the allocator caches blocks by design.',
      'Learning PyTorch deeply when the actual need is to recognise it.'
    ],
    keyTerms: [
      ['tensor', 'A multi-dimensional array with GPU support.'],
      ['autograd', 'Automatic differentiation; what makes training possible.'],
      ['nn.Module', 'How model architectures are expressed.'],
      ['torch.no_grad()', 'Disables gradient tracking; saves substantial inference memory.'],
      ['device_map', 'Where model layers are placed across devices.'],
      ['allocator', 'PyTorch’s memory manager; source of OOM messages.'],
      ['MPS', 'The Apple Silicon GPU backend.']
    ],
    resources: [
      ['PyTorch — documentation', 'https://pytorch.org/docs/stable/index.html', 'docs'],
      ['PyTorch — learn the basics', 'https://pytorch.org/tutorials/beginner/basics/intro.html', 'tutorial'],
      ['Hugging Face — Transformers', 'https://huggingface.co/docs/transformers/index', 'docs'],
      ['PyTorch — CUDA memory management', 'https://pytorch.org/docs/stable/notes/cuda.html', 'docs']
    ],
    questions: [
      ['Why does PyTorch matter if you never write it?', 'Its dtypes, device arguments and allocator errors surface constantly in higher-level libraries. Recognising the layer turns confusing errors into ordinary ones.'],
      ['What does torch.no_grad() do and why does it matter?', 'It disables gradient tracking, which inference does not need. Forgetting it can use more memory than the model itself and is a common cause of avoidable out-of-memory errors.'],
      ['Is "CUDA out of memory" a model problem?', 'Usually not. It is a PyTorch allocator message, and the cheapest fixes are no_grad, a smaller batch or context, and lower precision — before concluding the GPU is inadequate.']
    ]
  },

  {
    id: 'orchestration-frameworks',
    title: 'Orchestration Frameworks',
    domain: 'tools', tier: 2, priority: 'medium',
    summary: 'LangChain, LlamaIndex, LangGraph — what they give you and what they cost.',
    what: `Orchestration frameworks provide prebuilt components for chaining retrieval, generation, tool calls and control flow, plus adapters for many providers.`,
    why: `They are the most contested choice in the stack. They genuinely accelerate the first version and genuinely add indirection to the tenth, and the argument is usually conducted tribally rather than on the actual trade.`,
    analogy: `A meal kit. Excellent when you are learning and when you want dinner tonight. Constraining once you know how to cook and want to change the recipe.`,
    technical: `What they actually give you:
- **Provider adapters** — swap models without rewriting call sites. Genuinely useful.
- **Document loaders and splitters** — parsing PDFs, HTML, Office formats. The most consistently valuable part; parsing is tedious and unglamorous.
- **Prebuilt patterns** — retrieval chains, agent loops, memory. Useful for a prototype; usually replaced in production.
- **Graph orchestration** (LangGraph) — explicit state machines for multi-step agents. This is a genuinely different and more defensible offering than chain abstractions.

What they cost:
- **Indirection** — an error five layers deep in a framework is much harder to diagnose than one in your own sixty lines.
- **Version churn** — the APIs have changed substantially and repeatedly.
- **Hidden prompts** — prebuilt chains inject prompt text you did not write and may not see, which matters enormously when you are debugging quality.

The defensible position: **use the loaders, be cautious with the chains.** Document parsing is a real problem worth a dependency. A retrieve-then-generate flow is sixty lines you understand completely. If a system grows to genuine multi-step orchestration with branching and retries, an explicit graph framework starts to earn its place — but by then you know exactly what you need from it.`,
    diagram: `
   WHAT THEY GIVE YOU vs WHAT IT COSTS

     GIVE                            COST
     ─────────────────────────       ───────────────────────
     provider adapters               indirection
       swap models cheaply             errors 5 layers deep

     document loaders/splitters      version churn
       PDFs, HTML, Office              APIs change repeatedly
       ← the most valuable part
                                     HIDDEN PROMPTS
     prebuilt patterns                 prebuilt chains inject
       fast prototype                  text you did not write
       usually replaced                and may not see

     graph orchestration (LangGraph)
       explicit state machines
       ← genuinely different

   ⚠ HIDDEN PROMPTS ARE THE UNDERRATED COST

     You are debugging why answers are hedging.
     The hedging is in a system prompt inside the framework's
     default chain. You did not write it. It is not in your repo.

   THE DEFENSIBLE POSITION

     USE the loaders          parsing is a real, tedious problem
     BE CAUTIOUS with chains  retrieve-then-generate is ~60 lines
                              you understand completely

     revisit when you have GENUINE multi-step orchestration
     — branching, retries, state — and by then you know
     exactly what you need from it

   THE HONEST SUMMARY

     first version    framework faster
     tenth version    direct code faster
     the question     which version are you on?`,
    example: {
      language: 'python',
      caption: 'The same pipeline both ways, and the split most teams land on',
      code: `# ── WITH A FRAMEWORK ───────────────────────────────────────
from langchain.chains import RetrievalQA
from langchain_anthropic import ChatAnthropic

qa = RetrievalQA.from_chain_type(
    llm=ChatAnthropic(model="claude-sonnet-5"),
    retriever=vectorstore.as_retriever(search_kwargs={"k": 5}),
)
answer = qa.invoke({"query": question})

#  4 lines. Excellent for a prototype.
#  ⚠ You cannot see the prompt. You cannot see the chunk order.
#    You cannot add reranking without learning the abstraction.
#    When answers go wrong, you debug a framework, not your code.


# ── DIRECT ─────────────────────────────────────────────────
def answer(question, *, k=5):
    q_vec = embedder.encode([question])[0]
    hits = collection.query(query_embeddings=[q_vec], n_results=k * 3)

    reranked = reranker.rank(question, hits["documents"][0])[:k]
    context = "\\n\\n".join(
        f"[{i+1}] {c['text']}  (source: {c['source']})"
        for i, c in enumerate(reranked))

    prompt = (
        "Answer using ONLY the context below. Cite sources as [n].\\n"
        "If the context does not contain the answer, say so.\\n\\n"
        f"Context:\\n{context}\\n\\nQuestion: {question}"
    )
    resp = client.messages.create(model="claude-sonnet-5",
                                  max_tokens=1000,
                                  messages=[{"role": "user", "content": prompt}])
    return {"answer": resp.content[0].text,
            "sources": [c["source"] for c in reranked],
            "prompt": prompt}          # ← inspectable. this matters.

#  ~20 lines. Every decision visible and changeable.
#  Reranking added in one line. The prompt is in the repo.


# ── THE SPLIT MOST TEAMS ACTUALLY LAND ON ──────────────────
from langchain_community.document_loaders import UnstructuredPDFLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter

# Use the framework for INGESTION — parsing is tedious, varied,
# and genuinely worth a dependency:
docs = UnstructuredPDFLoader("policy.pdf").load()
chunks = RecursiveCharacterTextSplitter(
    chunk_size=800, chunk_overlap=100).split_documents(docs)

# Write the QUERY PATH yourself — it is short, it is where
# quality lives, and it is what you will iterate on daily.`
    },
    prereq: ['tool-landscape'], next: [],
    related: ['rag-pipeline', 'choosing-tools', 'multi-agent', 'ingestion-parsing'],
    tools: ['langchain', 'llamaindex', 'langgraph', 'unstructured'],
    useCases: [
      'Getting a prototype working quickly.',
      'Parsing many document formats without writing loaders.',
      'Explicit multi-step agent orchestration with LangGraph.'
    ],
    avoid: [
      'Prebuilt chains in production where prompt control matters.',
      'Adopting one before you have written the direct version once.'
    ],
    mistakes: [
      'Debugging quality problems without realising the framework injected its own prompt.',
      'Treating the framework as an architecture rather than as glue.',
      'Rejecting the loaders along with the chains — parsing genuinely is worth a dependency.',
      'Building on prebuilt chains and then being unable to add reranking or custom context assembly.'
    ],
    keyTerms: [
      ['orchestration framework', 'Prebuilt components for chaining LLM operations.'],
      ['provider adapter', 'A uniform interface across model providers.'],
      ['document loader', 'Parsing PDFs, HTML and Office formats into text.'],
      ['text splitter', 'Chunking documents for retrieval.'],
      ['chain', 'A prebuilt sequence of operations.'],
      ['LangGraph', 'Explicit state-machine orchestration for agents.'],
      ['hidden prompt', 'Prompt text injected by a framework that you did not write.']
    ],
    resources: [
      ['LangChain — documentation', 'https://python.langchain.com/docs/introduction/', 'docs'],
      ['LlamaIndex — documentation', 'https://docs.llamaindex.ai/', 'docs'],
      ['LangGraph — documentation', 'https://langchain-ai.github.io/langgraph/', 'docs'],
      ['Anthropic — building effective agents', 'https://www.anthropic.com/engineering/building-effective-agents', 'article'],
      ['Unstructured — documentation', 'https://docs.unstructured.io/', 'docs']
    ],
    questions: [
      ['What is the most valuable part of an orchestration framework?', 'The document loaders and splitters. Parsing PDFs, HTML and Office formats is tedious, varied and genuinely worth a dependency, unlike a sixty-line retrieval flow.'],
      ['What is the underrated cost of prebuilt chains?', 'Hidden prompts. A prebuilt chain injects system text you did not write and cannot see, so quality debugging becomes framework archaeology instead of editing a prompt in your own repo.'],
      ['When does a graph framework like LangGraph earn its place?', 'When you have genuine multi-step orchestration with branching, retries and state. By that point you know exactly what you need from it, which is the right time to adopt.']
    ]
  },

  {
    id: 'automation-platforms',
    title: 'Automation Platforms',
    domain: 'tools', tier: 3, priority: 'low',
    summary: 'n8n and workflow automation — where a visual pipeline beats writing code.',
    what: `Automation platforms let you build multi-step workflows by connecting nodes visually: triggers, HTTP calls, transformations, conditionals and LLM steps, with scheduling and retries handled for you.`,
    why: `A large share of useful AI work is plumbing — watch a mailbox, extract fields, write to a sheet, notify a channel. Writing that as code means also writing scheduling, retries, credential storage and error alerting. A platform gives you those for free.`,
    analogy: `A spreadsheet versus a database. The spreadsheet is not the more powerful tool, and for a large class of real problems it is the correct one, because it needs no deployment and anyone can read it.`,
    technical: `**n8n** is the notable self-hostable option, which matters for the same reason local models do: workflows often touch data that should not leave the network.

What these platforms provide beyond the visual editor: scheduled and webhook triggers, credential storage, automatic retries with backoff, execution history you can inspect, and connectors to hundreds of services.

**Where they fit well**: internal automation, scheduled batch jobs, connecting systems that already have APIs, and prototypes that need to be readable by non-engineers.

**Where they fit badly**: anything latency-sensitive, anything with complex branching logic (which becomes unreadable as a graph faster than as code), and anything needing real test coverage. Version control is also weaker — workflows are JSON exports, and reviewing a diff of one is unpleasant.

The honest boundary: **if a non-engineer needs to read or modify it, use the platform. If it is a product feature, write code.** The middle case — a workflow that started as automation and became load-bearing — is worth migrating deliberately rather than accidentally.`,
    diagram: `
   WHAT THE PLATFORM GIVES YOU FOR FREE

     ✓ scheduled + webhook triggers
     ✓ credential storage
     ✓ automatic retries with backoff
     ✓ execution history you can inspect
     ✓ hundreds of service connectors
     ✓ readable by non-engineers

     writing this as code means writing ALL of it yourself

   A TYPICAL WORKFLOW

     [trigger]  new email in shared inbox
         │
     [filter]   has attachment? ──no──► stop
         │ yes
     [extract]  PDF → text
         │
     [LLM]      extract {vendor, amount, date, category}
         │
     [branch]   confidence < 0.8 ──► [notify] human review queue
         │ ≥ 0.8
     [write]    append row to finance sheet
         │
     [notify]   post summary to channel

   FITS WELL                    FITS BADLY
     internal automation          latency-sensitive paths
     scheduled batch jobs         complex branching
     connecting existing APIs       (unreadable as a graph)
     non-engineer-readable        anything needing real tests
                                  version control is weak
                                    workflows are JSON exports

   ⚠ THE HONEST BOUNDARY

     non-engineer must read/modify it  →  platform
     it is a product feature           →  code

     the dangerous middle: automation that quietly became
     load-bearing. Migrate that DELIBERATELY, not after
     it breaks.`,
    example: {
      language: 'text',
      caption: 'The same job as a workflow and as code — and when to switch',
      code: `AS A WORKFLOW (n8n)
───────────────────────────────────────────────────────────
  Schedule Trigger      every day 07:00
  Postgres              SELECT tickets WHERE created > $lastRun
  Loop Over Items
    ├─ HTTP Request     POST /v1/messages  (classify + summarise)
    ├─ IF               confidence >= 0.75
    │    true  → Postgres  UPDATE tickets SET category, summary
    │    false → Slack     post to #triage-review
    └─ (retries: 3, backoff: exponential — configured, not coded)
  Slack                 daily digest to #support

  built in ~40 minutes · readable by the support lead
  scheduling, credentials, retries and history: provided


AS CODE
───────────────────────────────────────────────────────────
  the classification logic          ~25 lines
  + scheduling (cron/scheduler)     ~15
  + credential management           ~20
  + retry with backoff              ~25
  + execution history + alerting    ~40
  + deployment and monitoring       ~??
                                    ────
                                    ~125 lines and an ops surface

  the LOGIC is a fifth of the work. The platform supplies
  the other four fifths.


⚠ WHEN TO MIGRATE TO CODE — the signals

  the workflow has more than ~4 branches
    a graph stops being readable well before code does

  it is on a user-facing latency path
    platform overhead is tens to hundreds of ms per node

  you need tests
    you cannot meaningfully unit-test a visual graph

  two people have broken it by editing simultaneously
    JSON-export version control is not real version control

  it became load-bearing
    if an outage of this workflow is an incident,
    it belongs in the deployment pipeline with everything else

  Migrating for the FIRST four reasons is planning.
  Migrating for the fifth AFTER an outage is not.`
    },
    prereq: [], next: [],
    related: ['tool-landscape', 'tool-calling', 'what-is-mcp', 'production-monitoring'],
    tools: ['n8n', 'mcp'],
    useCases: [
      'Internal automation connecting systems that already have APIs.',
      'Scheduled batch jobs with LLM steps.',
      'Prototypes that non-engineers need to read and modify.'
    ],
    avoid: [
      'Latency-sensitive user-facing paths.',
      'Workflows with complex branching, which become unreadable as graphs.',
      'Anything requiring real test coverage.'
    ],
    mistakes: [
      'Letting an automation workflow quietly become load-bearing without migrating it.',
      'Building complex branching visually, where code would be far more readable.',
      'Treating JSON workflow exports as adequate version control.',
      'Rebuilding scheduling, retries and credential storage in code when the platform provides them.'
    ],
    keyTerms: [
      ['workflow automation', 'Building multi-step pipelines by connecting nodes.'],
      ['trigger', 'What starts a workflow — schedule, webhook, event.'],
      ['node', 'One step: an API call, a transform, a condition.'],
      ['self-hostable', 'Runnable on your own infrastructure; matters for data residency.'],
      ['execution history', 'A record of each run and what it did.'],
      ['load-bearing', 'A workflow whose failure is an incident.']
    ],
    resources: [
      ['n8n — documentation', 'https://docs.n8n.io/', 'docs'],
      ['n8n — AI and LangChain nodes', 'https://docs.n8n.io/advanced-ai/', 'docs'],
      ['Model Context Protocol — documentation', 'https://modelcontextprotocol.io/', 'docs']
    ],
    questions: [
      ['What does an automation platform give you beyond a visual editor?', 'Scheduling, credential storage, retries with backoff, execution history and connectors. Writing the same job in code means building all of that yourself — the logic is often a fifth of the work.'],
      ['When should a workflow be migrated to code?', 'When it has more than a handful of branches, sits on a latency path, needs tests, or has become load-bearing. Migrating for the first three is planning; migrating after an outage is not.'],
      ['Why does self-hostability matter for automation platforms?', 'For the same reason local models do — these workflows frequently touch data that should not leave the network, and a hosted platform means routing it through a third party.']
    ]
  }
];
