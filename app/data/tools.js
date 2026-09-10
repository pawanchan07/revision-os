/**
 * TOOLS ECOSYSTEM (BUILD.md section 26).
 * Every tool answers the same six questions, so they stay comparable.
 *   what / why / when / alternatives / hosting / pmNote  + official docs link.
 */
export const TOOL_GROUPS = [
  { id: 'programming', label: 'Programming',      blurb: 'Writing, running and versioning code.' },
  { id: 'database',    label: 'Databases',        blurb: 'Where structured records live.' },
  { id: 'vector',      label: 'Vector Databases', blurb: 'Where embeddings live and similarity search happens.' },
  { id: 'llm',         label: 'LLM Providers',    blurb: 'Where the generation actually runs.' },
  { id: 'oss',         label: 'Open Source',      blurb: 'Models and libraries you can download and inspect.' },
  { id: 'rag',         label: 'RAG & Orchestration', blurb: 'Glue that wires retrieval, prompts and tools together.' },
  { id: 'evaluation',  label: 'Evaluation & Observability', blurb: 'Proving quality before and after release.' },
  { id: 'automation',  label: 'Automation',       blurb: 'Wiring systems together without writing a service.' },
  { id: 'agents',      label: 'Agents & Interfaces', blurb: 'Letting a model act on the world.' }
];

export const TOOLS = [
  /* ---------------- programming ---------------- */
  {
    id: 'python', name: 'Python', group: 'programming', hosting: 'local',
    what: 'A general-purpose programming language, and the default language of the AI ecosystem.',
    why: 'Almost every AI library, tutorial and example is written in Python, so it is the shortest path from an idea to a working prototype.',
    when: 'Any time you need to read AI code, script something, or build a prototype.',
    alternatives: ['JavaScript / TypeScript', 'Go', 'Rust'],
    pmNote: 'You do not need to write production Python. You need to read it well enough to know what an engineer or a coding agent actually built.',
    url: 'https://docs.python.org/3/tutorial/'
  },
  {
    id: 'vscode', name: 'VS Code', group: 'programming', hosting: 'local',
    what: 'A free code editor with an extension ecosystem, terminal and debugger built in.',
    why: 'It removes the friction between "I have a file" and "I ran it and saw the error".',
    when: 'As your default place to open, edit and run any project on your machine.',
    alternatives: ['PyCharm', 'Cursor', 'JupyterLab', 'Neovim'],
    pmNote: 'Being able to open a repo, run it and read the output makes you far more credible in engineering conversations.',
    url: 'https://code.visualstudio.com/docs'
  },
  {
    id: 'git', name: 'Git', group: 'programming', hosting: 'local',
    what: 'A version control system that records the history of a codebase as a series of commits.',
    why: 'It lets many people change the same code safely, and lets anyone answer "what changed, when, and why".',
    when: 'Every project. Even a solo local one.',
    alternatives: ['Mercurial', 'SVN (legacy)'],
    pmNote: 'Branches, pull requests and commit history are where engineering decisions are actually recorded.',
    url: 'https://git-scm.com/docs/gittutorial'
  },

  /* ---------------- databases ---------------- */
  {
    id: 'postgres', name: 'PostgreSQL', group: 'database', hosting: 'both',
    what: 'A mature open-source relational database.',
    why: 'It is the default serious choice for transactional product data, and it also does JSON, full-text search and (via pgvector) vector search.',
    when: 'The system of record for a real product.',
    alternatives: ['MySQL', 'SQL Server', 'SQLite'],
    pmNote: 'When someone says "just add a column", Postgres is usually the thing they mean. Adding one to a huge table is not always free.',
    url: 'https://www.postgresql.org/docs/current/tutorial.html'
  },
  {
    id: 'sqlite', name: 'SQLite', group: 'database', hosting: 'local',
    what: 'A complete SQL database contained in a single file, with no server to run.',
    why: 'Zero setup. Perfect for learning SQL and for local prototypes.',
    when: 'Practising queries, small local apps, embedded storage.',
    alternatives: ['DuckDB (analytics)', 'PostgreSQL'],
    pmNote: 'The fastest way to actually practise SQL rather than read about it.',
    url: 'https://www.sqlite.org/docs.html'
  },
  {
    id: 'duckdb', name: 'DuckDB', group: 'database', hosting: 'local',
    what: 'An in-process analytical database, often described as "SQLite for analytics".',
    why: 'It runs fast analytical SQL directly over CSV and Parquet files without loading them into a server first.',
    when: 'Ad-hoc analysis of an export when you do not want a warehouse.',
    alternatives: ['pandas', 'BigQuery', 'Snowflake'],
    pmNote: 'Great for answering a data question yourself in ten minutes instead of filing a ticket.',
    url: 'https://duckdb.org/docs/'
  },

  /* ---------------- vector databases ---------------- */
  {
    id: 'faiss', name: 'FAISS', group: 'vector', hosting: 'local',
    what: 'A library (not a server) for fast similarity search over dense vectors.',
    why: 'It is the reference implementation of approximate nearest neighbour indexes, and extremely fast.',
    when: 'You want raw ANN search inside your own process and will handle storage and metadata yourself.',
    alternatives: ['hnswlib', 'ScaNN', 'Annoy'],
    pmNote: 'FAISS is a component, not a product. Someone still has to build persistence and filtering around it.',
    url: 'https://faiss.ai/'
  },
  {
    id: 'chroma', name: 'Chroma', group: 'vector', hosting: 'both',
    what: 'A developer-friendly vector database that runs embedded in Python or as a server.',
    why: 'The lowest-friction way to get a working RAG prototype: a few lines and you have a collection.',
    when: 'Prototypes, local RAG, small to medium collections.',
    alternatives: ['Qdrant', 'LanceDB', 'pgvector'],
    pmNote: 'Excellent for demos. Ask hard questions before it becomes the production store.',
    url: 'https://docs.trychroma.com/'
  },
  {
    id: 'qdrant', name: 'Qdrant', group: 'vector', hosting: 'both',
    what: 'An open-source vector database with strong metadata filtering, written in Rust.',
    why: 'It bridges the gap between "easy locally" and "credible in production", and filtering is a first-class feature.',
    when: 'Local RAG that you might later run as a real service.',
    alternatives: ['Weaviate', 'Milvus', 'Pinecone'],
    pmNote: 'Runs identically on a laptop and in a cluster, which shortens the path from prototype to production.',
    url: 'https://qdrant.tech/documentation/'
  },
  {
    id: 'pinecone', name: 'Pinecone', group: 'vector', hosting: 'cloud',
    what: 'A fully managed vector database service.',
    why: 'It removes all operational work: no indexes to tune, no nodes to run.',
    when: 'You want vector search in production and do not want to own the infrastructure.',
    alternatives: ['Qdrant Cloud', 'Weaviate Cloud', 'Vertex AI Vector Search'],
    pmNote: 'Convenience has a price and your embeddings leave your network. That is a data-governance conversation.',
    url: 'https://docs.pinecone.io/'
  },
  {
    id: 'weaviate', name: 'Weaviate', group: 'vector', hosting: 'both',
    what: 'An open-source vector database with built-in hybrid search and modular vectorisers.',
    why: 'Hybrid keyword-plus-semantic search out of the box, without assembling it yourself.',
    when: 'Search products where exact keyword matches still matter.',
    alternatives: ['Qdrant', 'Elasticsearch + vectors', 'OpenSearch'],
    pmNote: 'If your users search for product codes or names, hybrid search is usually not optional.',
    url: 'https://weaviate.io/developers/weaviate'
  },
  {
    id: 'milvus', name: 'Milvus', group: 'vector', hosting: 'both',
    what: 'An open-source vector database built for very large collections.',
    why: 'It scales to billions of vectors with distributed indexing.',
    when: 'Genuinely large-scale retrieval.',
    alternatives: ['Qdrant', 'Vespa', 'Pinecone'],
    pmNote: 'Powerful, and correspondingly heavier to operate. Do not reach for it at prototype scale.',
    url: 'https://milvus.io/docs'
  },
  {
    id: 'pgvector', name: 'pgvector', group: 'vector', hosting: 'both',
    what: 'A PostgreSQL extension that adds a vector column type and similarity search.',
    why: 'It keeps embeddings next to the relational data they belong to, in a database you already run.',
    when: 'You already use Postgres and your collection is small to medium.',
    alternatives: ['Qdrant', 'Chroma', 'Pinecone'],
    pmNote: 'Often the correct boring answer: one fewer system to secure, back up and pay for.',
    url: 'https://github.com/pgvector/pgvector'
  },

  /* ---------------- LLM providers ---------------- */
  {
    id: 'anthropic', name: 'Anthropic API', group: 'llm', hosting: 'cloud',
    what: 'API access to the Claude family of models.',
    why: 'Frontier-level reasoning, long context and strong tool use without hosting anything.',
    when: 'Production features where quality and reliability matter more than per-token cost.',
    alternatives: ['OpenAI API', 'Google Gemini API', 'self-hosted open models'],
    pmNote: 'Read the model and pricing pages together. Context length, latency and cost are the three levers you will actually trade off.',
    url: 'https://docs.anthropic.com/'
  },
  {
    id: 'openai', name: 'OpenAI API', group: 'llm', hosting: 'cloud',
    what: 'API access to GPT models, embeddings, speech and image models.',
    why: 'The most widely documented API surface, so most tutorials assume it.',
    when: 'Prototypes and production alike, especially when you want one vendor for several modalities.',
    alternatives: ['Anthropic API', 'Google Gemini API', 'Mistral API'],
    pmNote: 'Vendor lock-in is mostly at the prompt and evaluation layer, not the SDK. Keep prompts and evals portable.',
    url: 'https://platform.openai.com/docs'
  },
  {
    id: 'google-ai', name: 'Google Gemini API', group: 'llm', hosting: 'cloud',
    what: 'API access to Gemini models, including very long context and native multimodality.',
    why: 'Strong long-context and multimodal handling, plus tight integration with Google Cloud.',
    when: 'Document-heavy or multimodal workloads, or when you are already on GCP.',
    alternatives: ['Anthropic API', 'OpenAI API'],
    pmNote: 'A very long context window is not a substitute for retrieval. It changes the cost curve, not the grounding problem.',
    url: 'https://ai.google.dev/gemini-api/docs'
  },
  {
    id: 'ollama', name: 'Ollama', group: 'llm', hosting: 'local',
    what: 'A local runtime that downloads and serves open models behind a simple HTTP API.',
    why: 'It turns "run a model locally" from a weekend project into one command.',
    when: 'Local RAG, offline experiments, privacy-sensitive prototypes.',
    alternatives: ['llama.cpp', 'LM Studio', 'vLLM', 'text-generation-webui'],
    pmNote: 'The single best way to build real intuition for what model size and quantization actually cost you.',
    url: 'https://docs.ollama.com/'
  },
  {
    id: 'vllm', name: 'vLLM', group: 'llm', hosting: 'local',
    what: 'A high-throughput inference server for open models on GPUs.',
    why: 'Continuous batching and paged attention make self-hosted serving genuinely efficient.',
    when: 'Self-hosting an open model for real traffic.',
    alternatives: ['TGI', 'Ollama (single user)', 'TensorRT-LLM'],
    pmNote: 'This is the tool that decides whether self-hosting is cheaper than an API at your volume.',
    url: 'https://docs.vllm.ai/'
  },

  /* ---------------- open source ---------------- */
  {
    id: 'huggingface', name: 'Hugging Face', group: 'oss', hosting: 'both',
    what: 'A hub hosting models, datasets and demos, plus the libraries to use them.',
    why: 'It is the shared public library of open machine learning.',
    when: 'Finding a model, reading its model card, checking its licence, or grabbing a dataset.',
    alternatives: ['Kaggle (datasets)', 'ModelScope', 'direct vendor downloads'],
    pmNote: 'The model card and the licence are the two things to read before anyone gets attached to a model.',
    url: 'https://huggingface.co/docs'
  },
  {
    id: 'transformers', name: 'Transformers', group: 'oss', hosting: 'local',
    what: 'The Hugging Face Python library for loading and running models with a consistent interface.',
    why: 'One API across thousands of architectures, so swapping models is a line of code.',
    when: 'Running or fine-tuning an open model in Python.',
    alternatives: ['llama.cpp', 'PyTorch directly', 'JAX/Flax'],
    pmNote: 'When an engineer says "we just loaded it from Hugging Face", this library is usually what they mean.',
    url: 'https://huggingface.co/docs/transformers/index'
  },
  {
    id: 'sentence-transformers', name: 'Sentence Transformers', group: 'oss', hosting: 'local',
    what: 'A library for producing sentence and document embeddings.',
    why: 'It is the standard, well-benchmarked way to turn text into vectors locally.',
    when: 'Embedding chunks for a local RAG system.',
    alternatives: ['OpenAI embeddings API', 'Cohere Embed', 'nomic-embed via Ollama'],
    pmNote: 'Changing the embedding model means re-embedding the whole corpus. Treat it as a migration, not a config change.',
    url: 'https://www.sbert.net/'
  },
  {
    id: 'pytorch', name: 'PyTorch', group: 'oss', hosting: 'local',
    what: 'The deep learning framework most research and most open models are built on.',
    why: 'Nearly every model you will meet is a PyTorch module underneath.',
    when: 'Training, fine-tuning, or reading model internals.',
    alternatives: ['TensorFlow', 'JAX'],
    pmNote: 'You will rarely touch it, but knowing it is the substrate makes model discussions less opaque.',
    url: 'https://pytorch.org/tutorials/'
  },

  /* ---------------- RAG & orchestration ---------------- */
  {
    id: 'langchain', name: 'LangChain', group: 'rag', hosting: 'local',
    what: 'A framework of composable building blocks for LLM applications: loaders, splitters, retrievers, chains, agents.',
    why: 'It saves you writing the same plumbing for the tenth time and standardises the vocabulary.',
    when: 'Assembling a RAG or agent pipeline quickly.',
    alternatives: ['LlamaIndex', 'Haystack', 'plain SDK calls'],
    pmNote: 'Abstraction has a cost: it can hide the exact prompt sent to the model, which is the thing you most need to see when debugging.',
    url: 'https://python.langchain.com/docs/introduction/'
  },
  {
    id: 'llamaindex', name: 'LlamaIndex', group: 'rag', hosting: 'local',
    what: 'A framework focused specifically on ingesting, indexing and querying your data with an LLM.',
    why: 'Its centre of gravity is retrieval quality: parsing, chunking, indexing strategies and query engines.',
    when: 'Document-heavy RAG where retrieval quality is the whole problem.',
    alternatives: ['LangChain', 'Haystack', 'custom pipeline'],
    pmNote: 'If your AI feature is really a search feature, this framing tends to fit better.',
    url: 'https://docs.llamaindex.ai/'
  },
  {
    id: 'unstructured', name: 'Unstructured', group: 'rag', hosting: 'both',
    what: 'A library for parsing messy documents (PDF, DOCX, HTML, PPTX) into clean structured elements.',
    why: 'Most RAG failures start at parsing. Bad text in, bad answers out.',
    when: 'Ingesting real-world documents rather than tidy markdown.',
    alternatives: ['PyMuPDF', 'Docling', 'Azure Document Intelligence'],
    pmNote: 'Budget real time for parsing. It is the least glamorous and most decisive part of a RAG project.',
    url: 'https://docs.unstructured.io/'
  },

  /* ---------------- evaluation & observability ---------------- */
  {
    id: 'ragas', name: 'Ragas', group: 'evaluation', hosting: 'local',
    what: 'An evaluation library with metrics designed specifically for RAG systems.',
    why: 'It separates retrieval quality from generation quality, so you fix the right half.',
    when: 'Measuring faithfulness, answer relevance and context precision/recall on a RAG pipeline.',
    alternatives: ['DeepEval', 'TruLens', 'custom metrics'],
    pmNote: 'These metrics give you the language to say "retrieval is fine, generation is drifting" instead of "it feels worse".',
    url: 'https://docs.ragas.io/'
  },
  {
    id: 'deepeval', name: 'DeepEval', group: 'evaluation', hosting: 'local',
    what: 'A unit-testing framework for LLM outputs, built on pytest.',
    why: 'It makes evaluation part of the normal test suite instead of a separate ritual.',
    when: 'You want quality gates enforced in CI before a prompt or model change ships.',
    alternatives: ['Ragas', 'promptfoo', 'Braintrust'],
    pmNote: 'This is what turns "we tested it" into "the build fails if groundedness drops below 0.8".',
    url: 'https://deepeval.com/docs/getting-started'
  },
  {
    id: 'langsmith', name: 'LangSmith', group: 'evaluation', hosting: 'cloud',
    what: 'A hosted platform for tracing, debugging, evaluating and monitoring LLM applications.',
    why: 'It shows the exact prompt, retrieved context, tokens and latency for any single request.',
    when: 'Debugging why one specific answer went wrong in production.',
    alternatives: ['Arize Phoenix', 'Braintrust', 'Langfuse'],
    pmNote: 'A trace viewer is the closest thing AI has to a stack trace. Insist on one before launch.',
    url: 'https://docs.smith.langchain.com/'
  },
  {
    id: 'phoenix', name: 'Arize Phoenix', group: 'evaluation', hosting: 'both',
    what: 'An open-source observability and evaluation tool for LLM and RAG apps, built on OpenTelemetry.',
    why: 'You get tracing and evaluation without sending your traces to a vendor.',
    when: 'Local or self-hosted observability, or when data cannot leave your environment.',
    alternatives: ['LangSmith', 'Langfuse', 'Braintrust'],
    pmNote: 'The self-hostable option that usually survives a security review.',
    url: 'https://arize.com/docs/phoenix'
  },
  {
    id: 'braintrust', name: 'Braintrust', group: 'evaluation', hosting: 'cloud',
    what: 'A platform for running evaluations, comparing prompt and model versions, and logging production traffic.',
    why: 'Side-by-side comparison across versions is its core workflow, which is exactly the shipping decision.',
    when: 'Deciding whether prompt B is genuinely better than prompt A.',
    alternatives: ['LangSmith', 'promptfoo', 'Phoenix'],
    pmNote: 'Makes "did this change help?" answerable with a number instead of an argument.',
    url: 'https://www.braintrust.dev/docs'
  },
  {
    id: 'opentelemetry', name: 'OpenTelemetry', group: 'evaluation', hosting: 'both',
    what: 'A vendor-neutral standard for emitting traces, metrics and logs.',
    why: 'It means AI observability data lands in the same place as the rest of your telemetry.',
    when: 'You want one monitoring stack, not a separate AI silo.',
    alternatives: ['vendor-specific SDKs'],
    pmNote: 'Ask early whether AI traces follow the company standard. Retro-fitting it later is painful.',
    url: 'https://opentelemetry.io/docs/'
  },

  /* ---------------- automation ---------------- */
  {
    id: 'n8n', name: 'n8n', group: 'automation', hosting: 'both',
    what: 'A workflow automation tool where nodes are wired together visually, self-hostable.',
    why: 'It connects systems and AI calls without standing up a service, and it can run on your own machine.',
    when: 'Internal automations, prototypes and glue between SaaS tools.',
    alternatives: ['Zapier', 'Make', 'Airflow (data pipelines)'],
    pmNote: 'Excellent for proving a workflow is valuable before asking engineering to build it properly.',
    url: 'https://docs.n8n.io/'
  },

  /* ---------------- agents & interfaces ---------------- */
  {
    id: 'mcp', name: 'Model Context Protocol', group: 'agents', hosting: 'both',
    what: 'An open protocol that standardises how models discover and call external tools and resources.',
    why: 'Without it, every model-to-system integration is bespoke. With it, one server works with many clients.',
    when: 'Giving an assistant access to internal systems in a reusable, auditable way.',
    alternatives: ['bespoke function-calling schemas', 'plugin frameworks'],
    pmNote: 'The interesting product question is not "can it call the tool" but "who approved that it may, and is it logged".',
    url: 'https://modelcontextprotocol.io/docs/getting-started/intro'
  },
  {
    id: 'langgraph', name: 'LangGraph', group: 'agents', hosting: 'local',
    what: 'A library for building agent workflows as explicit state graphs.',
    why: 'It makes the agent loop inspectable and interruptible instead of an opaque while-loop.',
    when: 'Agents that need checkpoints, human approval steps or reliable retries.',
    alternatives: ['CrewAI', 'AutoGen', 'plain loops'],
    pmNote: 'Explicit graphs are what make human-in-the-loop approval steps possible at all.',
    url: 'https://langchain-ai.github.io/langgraph/'
  }
];

export const TOOL_BY_ID = Object.fromEntries(TOOLS.map(t => [t.id, t]));
export function toolsInGroup(id) { return TOOLS.filter(t => t.group === id); }
