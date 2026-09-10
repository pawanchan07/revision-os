/**
 * DOMAIN F — EMBEDDINGS + VECTOR SEARCH (BUILD.md section 9)
 * Includes an interactive vector visualisation topic.
 */
export const topics = [
  {
    id: 'what-is-a-vector',
    title: 'What Is a Vector?',
    domain: 'embeddings', tier: 1, priority: 'high',
    summary: 'An ordered list of numbers that describes a position in space.',
    what: `A vector is just a list of numbers: \`[0.42, -0.19, 0.88]\`. Each number is a coordinate along one axis, so the list describes a point in space.

Three numbers is a point in 3D space you could draw. A thousand numbers is a point in 1,000-dimensional space you cannot picture — and that is fine, because the maths works identically.`,
    why: `Vectors are the representation everything in modern AI runs on. Text becomes vectors, images become vectors, the model's internal state is vectors. If "vector" is a fuzzy word, embeddings and similarity search stay fuzzy too.`,
    analogy: `A location described by coordinates. "12.97, 77.59" is Bangalore. Two places with similar coordinates are physically near each other. That is the whole idea — extended to many more than two numbers.`,
    technical: `A vector has a **dimension** (how many numbers) and a **magnitude** (how long it is). The **dot product** of two vectors relates to the angle between them, which is what similarity measurement is built on.

**Normalising** a vector scales it to length 1, keeping only its direction. This matters because for text embeddings the direction carries the meaning and the magnitude often reflects incidental things like document length.

High-dimensional space behaves counterintuitively: in 1,000 dimensions, randomly chosen vectors are almost always nearly perpendicular, which is precisely why meaningful similarity stands out so clearly.`,
    diagram: `
   2 DIMENSIONS — you can draw it

      y
      │      ● [3, 4]     magnitude = √(3² + 4²) = 5
    4 │     ╱
      │    ╱
      │   ╱
      │  ╱
      └──────────── x
         3

   768 DIMENSIONS — same maths, no picture

      [0.023, -0.184, 0.442, ..., 0.019]
       └──────── 768 numbers ────────┘

   NORMALISING — keep direction, discard length

      [3, 4]  →  [0.6, 0.8]     length 1
      [6, 8]  →  [0.6, 0.8]     same direction, same normalised vector

   For text, DIRECTION carries meaning and LENGTH often
   just reflects document size. So embeddings are normalised.

   DOT PRODUCT relates to the ANGLE between two vectors
      same direction   → large positive
      perpendicular    → ~0
      opposite         → negative`,
    example: {
      language: 'python',
      caption: 'Vector operations, by hand',
      code: `import math

def dot(a, b):        return sum(x*y for x, y in zip(a, b))
def magnitude(v):     return math.sqrt(dot(v, v))
def normalise(v):
    m = magnitude(v)
    return [x/m for x in v] if m else v

a = [3, 4]
b = [6, 8]        # same direction as a, twice as long
c = [-4, 3]       # perpendicular to a

print(magnitude(a))              # 5.0
print(normalise(a))              # [0.6, 0.8]
print(normalise(b))              # [0.6, 0.8]  <- identical direction
print(dot(a, c))                 # 0           <- perpendicular

# In high dimensions, random vectors are nearly always perpendicular
import random
random.seed(0)
def rand_vec(d): return normalise([random.gauss(0, 1) for _ in range(d)])

for d in [2, 10, 768]:
    sims = [dot(rand_vec(d), rand_vec(d)) for _ in range(500)]
    avg = sum(abs(s) for s in sims) / len(sims)
    print(f"{d:>4} dims: average |similarity| of random pairs = {avg:.3f}")

#    2 dims: average |similarity| of random pairs = 0.634
#   10 dims: average |similarity| of random pairs = 0.253
#  768 dims: average |similarity| of random pairs = 0.029
#
# In 768 dimensions almost everything is unrelated to almost
# everything else — which is exactly why a similarity of 0.8
# is such a strong signal.`
    },
    prereq: [], next: ['what-are-embeddings', 'vector-dimensions'],
    related: ['numbers', 'cosine-similarity'],
    tools: ['python'],
    useCases: [
      'Reading vector-database documentation without guessing.',
      'Understanding what a similarity score is measuring.',
      'Reasoning about why embedding dimension affects storage cost.'
    ],
    avoid: [
      'Trying to visualise high-dimensional space. Trust the arithmetic instead.'
    ],
    mistakes: [
      'Assuming intuitions from 2D transfer to 768 dimensions. They mostly do not.',
      'Comparing unnormalised vectors and getting length effects mixed into similarity.',
      'Confusing dimension (how many numbers) with magnitude (how long).'
    ],
    keyTerms: [
      ['vector', 'An ordered list of numbers describing a point in space.'],
      ['dimension', 'How many numbers the vector has.'],
      ['magnitude', 'The vector’s length.'],
      ['normalisation', 'Scaling to length 1, keeping only direction.'],
      ['dot product', 'A single number relating two vectors’ directions.'],
      ['orthogonal', 'Perpendicular. Dot product zero. Unrelated.'],
      ['curse of dimensionality', 'How distance intuitions break down in high dimensions.']
    ],
    resources: [
      ['3Blue1Brown — Essence of Linear Algebra', 'https://www.3blue1brown.com/topics/linear-algebra', 'video'],
      ['NumPy — linear algebra basics', 'https://numpy.org/doc/stable/user/absolute_beginners.html', 'docs'],
      ['Khan Academy — vectors', 'https://www.khanacademy.org/math/linear-algebra/vectors-and-spaces', 'course']
    ],
    questions: [
      ['What does a vector represent?', 'A point in space. Each number is a coordinate along one axis, so a list of 768 numbers is a position in 768-dimensional space.'],
      ['Why are text embeddings normalised?', 'Direction carries the meaning while magnitude often just reflects document length. Normalising to length 1 removes the incidental part.'],
      ['Why is a similarity of 0.8 a strong signal in 768 dimensions?', 'Random vectors in high dimensions are almost always nearly perpendicular — average similarity near 0.03 — so anything close to 1 is far from coincidental.']
    ]
  },

  {
    id: 'what-are-embeddings',
    title: 'What Are Embeddings?',
    domain: 'embeddings', tier: 1, priority: 'high',
    summary: 'Turning text into vectors positioned so that similar meaning lands nearby.',
    what: `An embedding is a vector produced by a model from a piece of text, arranged so that text with similar meaning produces vectors that are close together.

"How do I cancel my subscription?" and "I want to stop paying" contain almost no shared words, and their embeddings sit right next to each other.`,
    why: `Embeddings are what make semantic search possible, and semantic search is what makes RAG possible. They convert "does this mean roughly the same thing?" — a question computers were historically terrible at — into "are these two points close?", which is trivial arithmetic.`,
    analogy: `A library where books are shelved by *topic* rather than by title. Books about grief sit together whether they are called "On Loss", "The Year of Magical Thinking" or "A Grief Observed". You find the right book by walking to the right shelf, not by matching the title.`,
    technical: `An embedding model — usually an encoder-only transformer — reads text and outputs a fixed-length vector, typically 384 to 3,072 dimensions. Models are trained so that semantically related pairs end up close and unrelated pairs end up far apart (contrastive training).

Key properties:
- **Fixed length regardless of input length**, which is what makes them comparable.
- **Model-specific**: vectors from different models are not comparable at all.
- **Meaning is directional**, so similarity is measured by angle (cosine), not distance.

The practical consequence that surprises teams: changing embedding model means **re-embedding the entire corpus**. It is a migration, not a config change.

Embedding models are also asymmetric in use: many are trained with separate query and document prefixes, and ignoring that costs real retrieval quality.`,
    diagram: `
   TEXT                              VECTOR (768 numbers)

   "How do I cancel my           →  [ 0.021, -0.183, 0.442, … ]
    subscription?"                          │
                                            │ close together
   "I want to stop paying"       →  [ 0.019, -0.176, 0.451, … ]
                                            │
   "What is the weather?"        →  [-0.310,  0.622, -0.088, … ]
                                            far away

   ZERO SHARED WORDS between the first two.
   Keyword search finds nothing. Embeddings find it immediately.

   SEMANTIC SPACE (flattened to 2D for the picture)

        cancel subscription ●
                            ● stop paying
          ● end my plan          ● refund request
                                      ● billing question

                                                  ● weather today
                                            ● restaurant nearby

   ⚠ CHANGING THE EMBEDDING MODEL = RE-EMBED EVERYTHING

     Vectors from model A and model B are in different spaces.
     Mixing them produces meaningless similarity scores.
     Treat an embedding model change as a data migration.`,
    example: {
      language: 'python',
      caption: 'Embedding text and seeing meaning become geometry',
      code: `from sentence_transformers import SentenceTransformer
import numpy as np

model = SentenceTransformer('all-MiniLM-L6-v2')     # 384 dimensions

texts = [
    "How do I cancel my subscription?",
    "I want to stop paying for this service",
    "Where can I find my invoice?",
    "What is the weather in Bangalore?",
]

vecs = model.encode(texts, normalize_embeddings=True)
print(vecs.shape)          # (4, 384) — fixed length regardless of sentence length

sim = vecs @ vecs.T        # normalised, so dot product IS cosine similarity

for i, t in enumerate(texts):
    print(f"\\n{t}")
    order = np.argsort(-sim[i])
    for j in order[1:3]:
        print(f"   {sim[i][j]:.3f}  {texts[j]}")

# How do I cancel my subscription?
#    0.712  I want to stop paying for this service     <- no shared words
#    0.341  Where can I find my invoice?
#
# What is the weather in Bangalore?
#    0.081  Where can I find my invoice?
#    0.043  I want to stop paying for this service

# ASYMMETRIC MODELS: many need query/document prefixes
q = model.encode("query: how to cancel", normalize_embeddings=True)
d = model.encode("passage: To cancel, open Settings > Billing.",
                 normalize_embeddings=True)
# Check the model card. Skipping required prefixes silently costs
# several points of retrieval accuracy.`
    },
    prereq: ['what-is-a-vector', 'tokens-tokenization'], next: ['semantic-similarity', 'cosine-similarity'],
    related: ['unsupervised-learning', 'encoder-decoder', 'why-rag', 'local-embedding-models'],
    tools: ['sentence-transformers', 'openai', 'huggingface', 'chroma'],
    useCases: [
      'Semantic search over documentation or support content.',
      'Deduplicating near-identical records that are not textually identical.',
      'Clustering free-text feedback into themes.',
      'The retrieval half of every RAG system.'
    ],
    avoid: [
      'When exact matching is required — product codes, identifiers, error codes.',
      'When you need to explain *why* two things matched.',
      'For very short strings where there is little meaning to capture.'
    ],
    mistakes: [
      'Mixing vectors from different embedding models in one index.',
      'Changing the embedding model without re-embedding the corpus.',
      'Ignoring required query/document prefixes and losing accuracy silently.',
      'Assuming a higher similarity score means the answer is correct — it means the text is related.',
      'Embedding whole documents instead of chunks, so the vector averages away everything specific.'
    ],
    keyTerms: [
      ['embedding', 'A vector representation of meaning.'],
      ['embedding model', 'The model that produces embeddings, usually encoder-only.'],
      ['semantic space', 'The space embeddings occupy, where nearness means similar meaning.'],
      ['contrastive training', 'Training that pulls related pairs together and pushes unrelated ones apart.'],
      ['dimension', 'The length of the vector, typically 384–3,072.'],
      ['re-embedding', 'Recomputing the whole corpus after a model change. A migration.'],
      ['asymmetric embedding', 'Models needing distinct query and document prefixes.'],
      ['MTEB', 'A public benchmark for comparing embedding models.']
    ],
    resources: [
      ['Sentence Transformers documentation', 'https://www.sbert.net/', 'docs'],
      ['MTEB leaderboard — compare embedding models', 'https://huggingface.co/spaces/mteb/leaderboard', 'interactive'],
      ['OpenAI — embeddings guide', 'https://platform.openai.com/docs/guides/embeddings', 'docs'],
      ['Google — embeddings crash course', 'https://developers.google.com/machine-learning/crash-course/embeddings', 'course'],
      ['TensorFlow Embedding Projector', 'https://projector.tensorflow.org/', 'interactive']
    ],
    questions: [
      ['How do embeddings find text with no shared words?', 'They encode meaning rather than tokens, so "cancel my subscription" and "stop paying" land near each other in the vector space despite sharing nothing textually.'],
      ['Why is changing the embedding model a migration rather than a config change?', 'Different models produce vectors in different spaces. Old and new vectors are not comparable, so the entire corpus must be re-embedded and reindexed.'],
      ['Does a high similarity score mean the retrieved text answers the question?', 'No. It means the text is semantically related. A chunk about the monthly refund policy is highly similar to a question about annual refunds and is still the wrong answer.']
    ],
    interview: {
      s30: 'An embedding turns text into a vector positioned so that similar meaning lands nearby. It converts "do these mean the same thing" into "are these two points close", which is just arithmetic.',
      s90: 'Embeddings are the reason semantic search works, and semantic search is the reason RAG works. The property that matters is that "how do I cancel my subscription" and "I want to stop paying" share no words at all but sit right next to each other in the space, so keyword search misses it and embeddings find it instantly. Two operational things I keep front of mind. First, changing the embedding model means re-embedding the whole corpus, because vectors from different models live in different spaces and are not comparable — so I treat it as a data migration with a cost and a rollback plan, not a configuration tweak. Second, a high similarity score means related, not correct: a chunk about the monthly policy scores highly against a question about annual plans, which is exactly the kind of near-miss that produces a confident wrong answer.',
      pm: 'It sets the ceiling on retrieval quality, and retrieval quality sets the ceiling on the whole RAG feature.'
    }
  },

  {
    id: 'semantic-similarity',
    title: 'Semantic Similarity',
    domain: 'embeddings', tier: 1, priority: 'high',
    summary: 'Measuring how close in meaning two pieces of text are — and what that number does not tell you.',
    what: `Semantic similarity is a number, usually between 0 and 1, describing how close two embeddings are. Higher means more related in meaning.`,
    why: `Every retrieval decision is a similarity threshold decision. Set it too low and irrelevant chunks reach the model; too high and legitimate matches are missed and the system answers "I don't know" too often. The threshold is a product decision with real consequences on both sides.`,
    analogy: `A "how related are these two topics" score from a well-read librarian. Useful and roughly right. But "related" is not the same as "answers your question" — a book about French cooking is highly related to a question about French wine and will not answer it.`,
    technical: `Similarity is **relative, not absolute**. A score of 0.72 means nothing on its own; what matters is how it compares to other scores in the same corpus with the same model. Thresholds must be calibrated per corpus and per model, and recalibrated whenever either changes.

Score distributions differ dramatically between models. Some cluster everything between 0.7 and 0.9; others spread across 0.1 to 0.9. Copying a threshold from a tutorial is meaningless.

The important failure is the **near-miss**: text that is semantically very close but factually about a different case — the monthly policy versus the annual policy. Similarity cannot distinguish these, which is why reranking and metadata filtering exist.`,
    diagram: `
   SIMILARITY IS RELATIVE, NOT ABSOLUTE

   model A score distribution     model B score distribution
   ░░░░░░░░████████░░░            ░░████░░░░░░░░████░░
   0.0    0.7   0.9  1.0          0.0  0.3      0.8  1.0

   "threshold = 0.75" means completely different things.
   Calibrate on YOUR corpus with YOUR model. Always.

   HOW TO CALIBRATE

     take 50 real questions with known-correct chunks
       ↓
     record the similarity of the CORRECT chunk
     record the similarity of the best WRONG chunk
       ↓
     choose the threshold that separates them best
       ↓
     re-check whenever the model or corpus changes

   ⚠ THE NEAR-MISS PROBLEM

     question:  "refund window for ANNUAL plans?"

     0.89  "Monthly subscriptions are refundable within 30 days"
     0.87  "Annual subscriptions are refundable within 14 days"
              ↑ the correct answer, ranked SECOND

     Similarity cannot tell these apart — both are "about refund
     windows". This is why you need RERANKING and METADATA FILTERS,
     not a higher threshold.`,
    example: {
      language: 'python',
      caption: 'Calibrating a threshold instead of guessing one',
      code: `import numpy as np
from sentence_transformers import SentenceTransformer

model = SentenceTransformer('all-MiniLM-L6-v2')

# 50 real questions, each with the chunk a human confirmed as correct
labelled = load_labelled_pairs()

correct_scores, distractor_scores = [], []
for item in labelled:
    q = model.encode(item["question"], normalize_embeddings=True)
    correct = model.encode(item["correct_chunk"], normalize_embeddings=True)
    correct_scores.append(float(q @ correct))

    # the best-scoring WRONG chunk is what the threshold must exclude
    others = model.encode(item["wrong_chunks"], normalize_embeddings=True)
    distractor_scores.append(float((others @ q).max()))

correct_scores = np.array(correct_scores)
distractor_scores = np.array(distractor_scores)

print(f"correct    p10={np.percentile(correct_scores,10):.3f}  "
      f"median={np.median(correct_scores):.3f}")
print(f"distractor p90={np.percentile(distractor_scores,90):.3f}  "
      f"median={np.median(distractor_scores):.3f}")

# correct    p10=0.512  median=0.681
# distractor p90=0.478  median=0.331

# Pick the threshold that maximises separation
best = max(np.arange(0.30, 0.80, 0.01),
           key=lambda t: (correct_scores >= t).mean()
                       - (distractor_scores >= t).mean())
print(f"threshold {best:.2f}: "
      f"keeps {(correct_scores>=best).mean():.0%} of correct, "
      f"admits {(distractor_scores>=best).mean():.0%} of distractors")
# threshold 0.49: keeps 90% of correct, admits 12% of distractors
#
# Note the overlap: p10 of correct (0.512) is close to p90 of
# distractors (0.478). No threshold separates them cleanly.
# That gap is what RERANKING is for.`
    },
    prereq: ['what-are-embeddings'], next: ['cosine-similarity'],
    related: ['reranking', 'context-selection', 'metadata-filtering', 'retrieval-evaluation'],
    tools: ['sentence-transformers', 'qdrant', 'chroma'],
    useCases: [
      'Setting a relevance floor so out-of-scope questions get an honest refusal.',
      'Detecting near-duplicate content.',
      'Routing a question to the right knowledge base.'
    ],
    avoid: [
      'As a proxy for correctness. It measures relatedness only.',
      'Copying a threshold from documentation or a tutorial.',
      'Comparing scores across different embedding models.'
    ],
    mistakes: [
      'Using an uncalibrated threshold copied from an example.',
      'Not recalibrating after changing model or corpus.',
      'Believing a high score means the chunk answers the question.',
      'Trying to solve the near-miss problem by raising the threshold, which mostly just increases false refusals.'
    ],
    keyTerms: [
      ['semantic similarity', 'A score for how close two meanings are.'],
      ['threshold', 'The cut-off below which a match is rejected.'],
      ['calibration', 'Choosing a threshold from labelled data on your own corpus.'],
      ['near-miss / distractor', 'Highly similar but about a different case.'],
      ['score distribution', 'How scores spread for a given model and corpus.'],
      ['relative ranking', 'Order matters more than the absolute number.']
    ],
    resources: [
      ['Sentence Transformers — semantic textual similarity', 'https://www.sbert.net/docs/usage/semantic_textual_similarity.html', 'docs'],
      ['MTEB leaderboard', 'https://huggingface.co/spaces/mteb/leaderboard', 'interactive'],
      ['Pinecone — semantic search guide', 'https://www.pinecone.io/learn/semantic-search/', 'tutorial']
    ],
    questions: [
      ['Why is a similarity score of 0.72 meaningless on its own?', 'Score distributions differ by model and corpus. What matters is how it compares to other scores in the same setup, which is why thresholds must be calibrated locally.'],
      ['What is the near-miss problem?', 'A chunk about the monthly refund policy scores very highly against a question about annual refunds, because both are about refund windows. Similarity cannot distinguish them, so reranking or metadata filtering is required.'],
      ['How do you actually choose a threshold?', 'Take real questions with human-confirmed correct chunks, record the similarity of correct chunks and of the best wrong chunks, and pick the value that best separates the two distributions.']
    ]
  },

  {
    id: 'cosine-similarity',
    title: 'Cosine Similarity',
    domain: 'embeddings', tier: 2, priority: 'high',
    summary: 'Measuring the angle between two vectors — the standard similarity metric for text.',
    what: `Cosine similarity measures the angle between two vectors, ignoring their length. It ranges from −1 (opposite) through 0 (unrelated) to 1 (identical direction).

For normalised vectors it is simply the dot product.`,
    why: `It is the default metric in every vector database, and understanding *why* angle rather than distance explains a real practical property: a two-sentence chunk and a two-page chunk about the same topic score as similar, which is what you want.`,
    analogy: `Two people pointing at something. What matters is whether they are pointing in the same direction, not whether one has longer arms.`,
    technical: `\`cos(A,B) = (A·B) / (|A| × |B|)\`. When both vectors are normalised to length 1, the denominator is 1 and cosine similarity equals the dot product — which is why libraries normalise and then use dot product for speed.

Alternatives: **Euclidean (L2) distance** measures straight-line distance and is affected by magnitude; **inner product** is used when magnitude is meaningful. For normalised vectors, cosine and L2 produce the same ranking, so the choice matters mainly for unnormalised data.

The metric must match how the index was built. A vector database configured for cosine and queried with L2 gives silently wrong rankings.

In practice text embedding similarities cluster in a narrow positive band — negative cosine values are rare, because embedding models do not really produce "opposite meaning" vectors.`,
    diagram: `
   COSINE = ANGLE, NOT DISTANCE

        ▲ B                    cos = 1.0   same direction
       ╱                       cos = 0.7   related
      ╱  θ                     cos = 0.0   unrelated (perpendicular)
     ╱────────► A              cos = -1.0  opposite (rare in text)

   WHY ANGLE RATHER THAN DISTANCE

     short chunk about refunds  ──►  vector of length 0.6
     long  chunk about refunds  ──►  vector of length 2.4

     EUCLIDEAN distance: far apart (length dominates)
     COSINE similarity:  nearly identical (same direction)

     You want the second answer. Length is document size,
     not meaning.

   THE SHORTCUT EVERY LIBRARY USES

     normalise both vectors to length 1
        ↓
     cosine similarity == dot product
        ↓
     one multiply-and-add per dimension. Very fast.

   ⚠ THE METRIC MUST MATCH THE INDEX

     index built with cosine, queried with L2
       → no error, no warning, silently wrong ranking`,
    example: {
      language: 'python',
      caption: 'Cosine versus Euclidean, and why length matters',
      code: `import numpy as np

def cosine(a, b):
    return float(np.dot(a, b) / (np.linalg.norm(a) * np.linalg.norm(b)))

def euclidean(a, b):
    return float(np.linalg.norm(a - b))

short = np.array([0.30, 0.40, 0.10])      # brief note about refunds
long_ = np.array([1.50, 2.00, 0.50])      # long document, same topic
other = np.array([0.35, -0.20, 0.90])     # different topic, similar length

print(f"short vs long  cosine {cosine(short, long_):.3f}   "
      f"euclidean {euclidean(short, long_):.3f}")
print(f"short vs other cosine {cosine(short, other):.3f}   "
      f"euclidean {euclidean(short, other):.3f}")

# short vs long  cosine 1.000   euclidean 2.121
# short vs other cosine 0.155   euclidean 0.898
#
# EUCLIDEAN says short is closer to "other" (0.898 < 2.121) — WRONG.
# COSINE correctly identifies short and long as the same topic.
# Length was document size, not meaning.

# The production shortcut: normalise once, then dot product
def normalise(v): return v / np.linalg.norm(v)

vs = normalise(short)
vl = normalise(long_)
print(f"dot product of normalised vectors: {float(vs @ vl):.3f}")   # 1.000

# Search over 100k chunks becomes one matrix multiply
corpus = np.random.randn(100_000, 384)
corpus /= np.linalg.norm(corpus, axis=1, keepdims=True)
query = normalise(np.random.randn(384))
scores = corpus @ query                    # 100k similarities at once
top5 = np.argsort(-scores)[:5]`
    },
    prereq: ['what-is-a-vector', 'semantic-similarity'], next: ['nearest-neighbor-search'],
    related: ['vector-databases', 'ann-indexes', 'vector-playground'],
    tools: ['faiss', 'qdrant', 'chroma', 'pgvector'],
    useCases: [
      'Ranking retrieved chunks by relevance.',
      'Detecting near-duplicate documents.',
      'Configuring the distance metric on a vector index correctly.'
    ],
    avoid: [
      'When magnitude genuinely carries information — then inner product may be right.',
      'Mixing metrics between indexing and querying.'
    ],
    mistakes: [
      'Building an index with one metric and querying with another.',
      'Comparing unnormalised vectors and getting length effects in the score.',
      'Expecting meaningful negative cosine values from text embeddings.',
      'Treating the raw number as a probability of correctness.'
    ],
    keyTerms: [
      ['cosine similarity', 'The cosine of the angle between two vectors.'],
      ['dot product', 'Equals cosine when both vectors are normalised.'],
      ['Euclidean / L2 distance', 'Straight-line distance. Affected by magnitude.'],
      ['inner product', 'Dot product without normalisation; used when magnitude matters.'],
      ['distance metric', 'The similarity function an index is built with.'],
      ['normalisation', 'Scaling to unit length so only direction remains.']
    ],
    resources: [
      ['Pinecone — vector similarity explained', 'https://www.pinecone.io/learn/vector-similarity/', 'tutorial'],
      ['scikit-learn — pairwise metrics', 'https://scikit-learn.org/stable/modules/metrics.html', 'docs'],
      ['Qdrant — distance metrics', 'https://qdrant.tech/documentation/concepts/search/', 'docs'],
      ['NumPy — linear algebra', 'https://numpy.org/doc/stable/reference/routines.linalg.html', 'docs']
    ],
    questions: [
      ['Why use cosine rather than Euclidean distance for text?', 'Cosine ignores magnitude, which for text embeddings largely reflects document length. A short note and a long document on the same topic should score as similar, and only cosine does that.'],
      ['Why do libraries normalise vectors and then use dot product?', 'For normalised vectors the cosine denominator is 1, so cosine similarity equals the dot product — a single multiply-and-add per dimension, which is much faster at scale.'],
      ['What happens if the index metric and query metric differ?', 'No error is raised. The rankings are silently wrong, which is one of the harder retrieval bugs to spot.']
    ]
  },

  {
    id: 'vector-dimensions',
    title: 'Vector Dimensions',
    domain: 'embeddings', tier: 2, priority: 'medium',
    summary: 'How many numbers per vector — a trade-off between nuance, storage and speed.',
    what: `The dimension of an embedding is how many numbers it contains: 384, 768, 1,536, 3,072. More dimensions can capture more nuance and cost proportionally more storage and compute.`,
    why: `It is a direct cost lever. At scale, halving dimensions halves your vector storage and roughly halves search compute. Many teams pay for 3,072-dimensional embeddings and get no measurable benefit over 768 on their corpus.`,
    analogy: `Describing a wine. Three adjectives capture a lot. Fifty adjectives capture more nuance, cost more to write down, and take longer to compare — and beyond a point the extra adjectives stop distinguishing anything.`,
    technical: `Storage: dimensions × 4 bytes (float32) per vector, plus index overhead. Ten million chunks at 1,536 dimensions is roughly 61GB before the index.

Search cost scales roughly linearly with dimension, since every comparison touches every number.

**Matryoshka embeddings** are trained so the vector can be truncated — take the first 256 of 1,536 dimensions and retain most of the quality. Several modern models support this, making dimension a runtime choice rather than a model choice.

**Quantization** is often a bigger win than dimension reduction: storing vectors as int8 cuts memory fourfold with minimal recall loss, and binary quantization can cut it by 32× for a first-pass search that is then rescored.

The right dimension is an empirical question. Measure retrieval quality at several sizes on your own corpus.`,
    diagram: `
   STORAGE FOR 10 MILLION CHUNKS (float32, before index overhead)

     dims    bytes/vector   total
     ────    ────────────   ─────
      384        1,536      15 GB
      768        3,072      31 GB
    1,536        6,144      61 GB
    3,072       12,288     123 GB

   Search compute scales roughly linearly with dimension too.

   QUALITY vs DIMENSION — typically flattens early

     recall │           ●───────●──────●
            │       ●
            │   ●
            │ ●
            └──────────────────────────────
             128  384  768  1536  3072

     The extra dimensions past a point stop distinguishing
     anything on YOUR corpus. Measure it.

   TWO WAYS TO CUT COST

     MATRYOSHKA   truncate 1536 → 256 dims, keep ~95% of quality
                  (only works if the model was trained for it)

     QUANTIZATION float32 → int8    4x smaller, ~99% recall
                  float32 → binary  32x smaller, used as a fast
                                    first pass, then rescored`,
    example: {
      language: 'python',
      caption: 'Measuring whether the extra dimensions earn their cost',
      code: `import numpy as np
from sentence_transformers import SentenceTransformer

# A Matryoshka-trained model can be truncated at inference time
model = SentenceTransformer('mixedbread-ai/mxbai-embed-large-v1')  # 1024 dims

questions, correct_chunk_ids, corpus = load_eval_set()

def recall_at_k(dims, k=5):
    q = model.encode(questions, normalize_embeddings=True)[:, :dims]
    c = model.encode(corpus,    normalize_embeddings=True)[:, :dims]
    q /= np.linalg.norm(q, axis=1, keepdims=True)      # renormalise after truncation
    c /= np.linalg.norm(c, axis=1, keepdims=True)

    hits = 0
    for i, scores in enumerate(q @ c.T):
        if correct_chunk_ids[i] in np.argsort(-scores)[:k]:
            hits += 1
    return hits / len(questions)

for d in [128, 256, 512, 768, 1024]:
    storage_gb = 10_000_000 * d * 4 / 1e9
    print(f"{d:>5} dims  recall@5 {recall_at_k(d):.3f}  "
          f"storage(10M) {storage_gb:>6.1f} GB")

#   128 dims  recall@5 0.812  storage(10M)    5.1 GB
#   256 dims  recall@5 0.889  storage(10M)   10.2 GB
#   512 dims  recall@5 0.921  storage(10M)   20.5 GB
#   768 dims  recall@5 0.928  storage(10M)   30.7 GB
#  1024 dims  recall@5 0.930  storage(10M)   41.0 GB
#
# 512 dims gives 99% of the quality of 1024 at half the storage.
# The last 512 dimensions bought 0.009 recall for 20 GB.`
    },
    prereq: ['what-are-embeddings'], next: ['vector-databases'],
    related: ['quantization', 'ai-cost', 'ann-indexes'],
    tools: ['sentence-transformers', 'qdrant', 'pinecone'],
    useCases: [
      'Cutting vector storage cost at scale.',
      'Choosing an embedding model with cost in mind, not only leaderboard position.',
      'Deciding whether to truncate a Matryoshka model.'
    ],
    avoid: [
      'Assuming more dimensions is better without measuring.',
      'Truncating a model that was not trained for it — quality drops sharply.'
    ],
    mistakes: [
      'Choosing the top MTEB model without checking its dimension cost on your corpus size.',
      'Truncating without renormalising afterwards.',
      'Optimising dimensions while ignoring quantization, which is usually the bigger win.',
      'Changing dimension after indexing without rebuilding the index.'
    ],
    keyTerms: [
      ['dimension', 'How many numbers per vector.'],
      ['Matryoshka embedding', 'Trained so it can be truncated with minimal loss.'],
      ['quantization', 'Storing vectors at lower precision to save memory.'],
      ['recall@k', 'Share of queries where the correct item is in the top k.'],
      ['storage footprint', 'Dimensions × bytes × number of vectors.'],
      ['int8 / binary quantization', 'Four-fold and thirty-two-fold memory reductions.']
    ],
    resources: [
      ['Matryoshka Representation Learning (paper)', 'https://arxiv.org/abs/2205.13147', 'paper'],
      ['Sentence Transformers — Matryoshka embeddings', 'https://www.sbert.net/examples/training/matryoshka/README.html', 'docs'],
      ['Qdrant — quantization', 'https://qdrant.tech/documentation/guides/quantization/', 'docs'],
      ['MTEB leaderboard', 'https://huggingface.co/spaces/mteb/leaderboard', 'interactive']
    ],
    questions: [
      ['Why is dimension a cost lever?', 'Storage and search compute both scale roughly linearly with dimension. At ten million vectors, going from 1,536 to 768 dimensions halves a 61GB footprint.'],
      ['What are Matryoshka embeddings?', 'Embeddings trained so the vector can be truncated — taking the first 256 of 1,536 dimensions retains most of the quality — which makes dimension a runtime choice.'],
      ['Which usually saves more: fewer dimensions or quantization?', 'Quantization. Moving from float32 to int8 cuts memory fourfold with roughly 99% recall retained, which typically beats what dimension reduction achieves for the same quality loss.']
    ]
  },

  {
    id: 'nearest-neighbor-search',
    title: 'Nearest Neighbour Search',
    domain: 'embeddings', tier: 2, priority: 'high',
    summary: 'Finding the vectors closest to a query vector — the core retrieval operation.',
    what: `Given a query vector, nearest neighbour search finds the k vectors in a collection that are closest to it. That is the entire retrieval step of RAG.`,
    why: `It is where the "search" in semantic search actually happens, and it is where the speed-versus-accuracy trade-off lives. Understanding exact versus approximate search tells you when a simple solution suffices and when you genuinely need an index.`,
    analogy: `Finding the nearest coffee shop. You could measure the distance to every shop in the city and pick the smallest — correct but slow. Or you could look at your own neighbourhood first, which is almost always right and instant.`,
    technical: `**Exact (brute force)**: compute similarity against every vector, sort, take the top k. Guaranteed correct, cost linear in collection size. On modern hardware this is fast up to roughly 50,000–100,000 vectors — comfortably beyond most internal knowledge bases.

**Approximate (ANN)**: build an index that lets you skip most comparisons. Sub-linear, tunable, and returns *most* of the true nearest neighbours — typically 90–99% recall.

The practical rule: do not introduce ANN until the collection demands it. Premature ANN adds tuning parameters, index rebuild costs and a silent failure mode (results quietly missing) in exchange for speed you did not need.

**Recall@k** is the metric: of the true top-k, how many did the index return? Measure it against brute force on a sample, because an ANN index that has drifted to 70% recall looks exactly like one at 99%.`,
    diagram: `
   EXACT (brute force)              APPROXIMATE (ANN)

   query                            query
     │                                │
     ▼                                ▼
   compare to ALL n vectors         enter the index
     │                                │
   sort                             traverse toward closer regions
     │                                │
   top-k  — always correct          top-k — usually correct
   O(n)                             ~O(log n)

   WHEN TO USE WHICH

     < 50k vectors      brute force. Fast enough. No tuning.
                        No silent failures. Genuinely simpler.
     50k - 1M           ANN starts to pay off
     > 1M               ANN is required

   ⚠ PREMATURE ANN IS A REAL MISTAKE

     you add: index build time, rebuild on updates,
              ef/M/nprobe tuning, and a failure mode where
              results silently go missing

     you gain: speed you did not need at 20,000 chunks

   MEASURING RECALL@k

     run brute force on 200 sample queries  → ground truth
     run the ANN index on the same queries  → results
     recall@10 = overlap / 10

     An index at 70% recall looks identical to one at 99%
     from the outside. Measure it, and re-measure after
     index changes.`,
    example: {
      language: 'python',
      caption: 'Brute force, and measuring whether ANN is actually needed',
      code: `import numpy as np, time

def brute_force_search(corpus, query, k=5):
    """Exact. Correct by construction. Fast up to ~100k vectors."""
    scores = corpus @ query                    # normalised -> cosine
    idx = np.argpartition(-scores, k)[:k]      # partial sort: O(n)
    return idx[np.argsort(-scores[idx])]

for n in [1_000, 10_000, 100_000, 1_000_000]:
    corpus = np.random.randn(n, 768).astype(np.float32)
    corpus /= np.linalg.norm(corpus, axis=1, keepdims=True)
    query = corpus[0]

    t = time.perf_counter()
    for _ in range(10):
        brute_force_search(corpus, query, k=5)
    ms = (time.perf_counter() - t) / 10 * 1000
    print(f"{n:>9,} vectors: {ms:>7.1f} ms per exact search")

#     1,000 vectors:     0.4 ms
#    10,000 vectors:     3.1 ms
#   100,000 vectors:    28.7 ms      still fine for most products
# 1,000,000 vectors:   291.4 ms      now ANN is worth it

# MEASURING ANN RECALL — never assume it
def recall_at_k(ann_index, corpus, queries, k=10):
    hits = 0
    for q in queries:
        truth = set(brute_force_search(corpus, q, k))
        got   = set(ann_index.search(q, k))
        hits += len(truth & got)
    return hits / (len(queries) * k)

# print(f"recall@10 = {recall_at_k(index, corpus, sample_queries):.3f}")
# 0.982 -> healthy.  0.71 -> the index needs retuning, and nothing
# in your application would have told you.`
    },
    prereq: ['cosine-similarity'], next: ['ann-indexes', 'vector-databases'],
    related: ['exact-vs-ann', 'indexes', 'retrieval-topk'],
    tools: ['faiss', 'qdrant', 'chroma', 'pgvector'],
    useCases: [
      'The retrieval step of any RAG system.',
      'Finding similar items for recommendations.',
      'Deduplication at scale.'
    ],
    avoid: [
      'ANN below roughly 50,000 vectors — brute force is simpler and exact.',
      'Any index whose recall you have not measured.'
    ],
    mistakes: [
      'Adding an ANN index to a 5,000-chunk corpus and inheriting tuning complexity for nothing.',
      'Never measuring recall, so silent degradation goes unnoticed.',
      'Assuming a returned result is the true nearest neighbour when using ANN.',
      'Forgetting that ANN indexes need rebuilding as data changes.'
    ],
    keyTerms: [
      ['nearest neighbour search', 'Finding the closest vectors to a query.'],
      ['brute force / flat search', 'Comparing against every vector. Exact.'],
      ['ANN', 'Approximate nearest neighbour. Fast, tunable, not exact.'],
      ['recall@k', 'Share of the true top-k that the index returned.'],
      ['top-k', 'How many results to retrieve.'],
      ['index build', 'The one-off cost of constructing an ANN structure.']
    ],
    resources: [
      ['FAISS — getting started', 'https://faiss.ai/index.html', 'docs'],
      ['Pinecone — nearest neighbour search', 'https://www.pinecone.io/learn/what-is-similarity-search/', 'tutorial'],
      ['ANN Benchmarks — compare index types', 'https://ann-benchmarks.com/', 'interactive'],
      ['Qdrant — search concepts', 'https://qdrant.tech/documentation/concepts/search/', 'docs']
    ],
    questions: [
      ['When is brute force search the right choice?', 'Below roughly 50,000 to 100,000 vectors. It runs in tens of milliseconds, is exact, needs no tuning, and has no silent failure mode.'],
      ['What is recall@k and why must it be measured?', 'The share of the true top-k that an ANN index actually returned. An index at 70% recall behaves identically from the outside to one at 99%, so silent degradation is invisible without measurement.'],
      ['What does premature ANN cost you?', 'Index build and rebuild time, tuning parameters, and a failure mode where results quietly go missing — in exchange for speed that a small corpus did not need.']
    ]
  },

  {
    id: 'ann-indexes',
    title: 'ANN Indexes',
    domain: 'embeddings', tier: 3, priority: 'medium',
    summary: 'The data structures that make billion-scale vector search fast — and the knobs they expose.',
    what: `An approximate nearest neighbour index organises vectors so a search can skip most comparisons. The main families are graph-based (HNSW), partition-based (IVF) and compression-based (PQ).`,
    why: `You will not build one, but you will configure one, and its parameters directly control the trade-off between speed, memory and how many correct results you silently lose. "Retrieval got worse" is sometimes an index tuning problem, not a model problem.`,
    analogy: `Different ways to organise a warehouse. HNSW is a network of shortcuts between shelves — fast, memory-hungry. IVF divides the floor into zones and you search a few zones — compact, and you miss things at the zone borders. PQ stores compressed summaries — tiny, slightly blurry.`,
    technical: `**HNSW** (Hierarchical Navigable Small World) — a multi-layer graph. Search enters at a sparse top layer and descends. Parameters: \`M\` (connections per node, higher is better recall and more memory) and \`ef_search\` (candidates explored at query time, higher is better recall and slower). Best recall-versus-speed; highest memory.

**IVF** (Inverted File) — clusters vectors; a query searches only the nearest \`nprobe\` clusters. Parameters: \`nlist\` (number of clusters) and \`nprobe\` (how many to search). Compact, needs training on a sample, and loses items near cluster boundaries.

**PQ** (Product Quantization) — splits vectors into sub-vectors and stores compressed codes. Massive memory reduction, some accuracy loss. Often combined as IVF-PQ.

Practical guidance: HNSW is the sensible default. Tune \`ef_search\` first — it is a pure runtime recall/latency dial and needs no rebuild. Always measure recall after any change.`,
    diagram: `
   HNSW — a layered graph of shortcuts

   layer 2   ●───────────────●          sparse: long jumps
             │               │
   layer 1   ●───●───────●───●          medium
             │   │       │   │
   layer 0   ●─●─●─●─●─●─●─●─●          dense: every vector

   enter at the top → jump close → descend → refine
   ef_search = how many candidates to keep while descending
               higher → better recall, slower

   IVF — partition the space, search a few partitions

     ┌────┬────┬────┐   query lands in cell 5
     │ 1  │ 2  │ 3  │   nprobe=1 → search cell 5 only (fast, misses
     ├────┼────┼────┤                        items just over the border)
     │ 4  │ 5* │ 6  │   nprobe=3 → search 5, 2, 6 (slower, better recall)
     ├────┼────┼────┤
     │ 7  │ 8  │ 9  │
     └────┴────┴────┘

   THE THREE-WAY TRADE-OFF

              recall   speed   memory
     FLAT      100%     slow    low      ← use below ~100k
     HNSW      ~99%     fast    HIGH     ← sensible default
     IVF       ~95%     fast    medium
     IVF-PQ    ~90%     fast    TINY     ← billion-scale

   TUNE ef_search FIRST — it is a runtime dial, no rebuild needed.`,
    example: {
      language: 'python',
      caption: 'Tuning ef_search against measured recall and latency',
      code: `import numpy as np, time

# Ground truth from brute force on a sample of real queries
def ground_truth(corpus, queries, k=10):
    return [set(np.argsort(-(corpus @ q))[:k]) for q in queries]

truth = ground_truth(corpus, sample_queries, k=10)

# ef_search is a pure runtime dial: no index rebuild required
for ef in [16, 32, 64, 128, 256]:
    index.set_ef(ef)

    t = time.perf_counter()
    results = [set(index.search(q, k=10)) for q in sample_queries]
    ms = (time.perf_counter() - t) / len(sample_queries) * 1000

    recall = np.mean([len(g & r) / 10 for g, r in zip(truth, results)])
    print(f"ef_search={ef:>4}  recall@10 {recall:.3f}  {ms:>5.2f} ms/query")

# ef_search=  16  recall@10 0.842   0.31 ms/query
# ef_search=  32  recall@10 0.921   0.48 ms/query
# ef_search=  64  recall@10 0.968   0.83 ms/query      <- good balance
# ef_search= 128  recall@10 0.989   1.54 ms/query
# ef_search= 256  recall@10 0.996   2.91 ms/query
#
# From 64 to 256: +0.028 recall for 3.5x the latency.
# That is a product decision, and it should be made with these
# numbers in front of you rather than by accepting a default.

# Build-time parameters (require a rebuild to change):
#   M=16   default. M=32-48 for higher recall at more memory.
#   ef_construction=200  higher = better graph, slower build.`
    },
    prereq: ['nearest-neighbor-search'], next: ['vector-databases'],
    related: ['indexes', 'exact-vs-ann', 'quantization', 'latency-throughput'],
    tools: ['faiss', 'qdrant', 'milvus', 'pgvector'],
    useCases: [
      'Configuring a vector database for a specific latency target.',
      'Diagnosing a drop in retrieval quality that is really an index problem.',
      'Choosing an index type for a given corpus size and memory budget.'
    ],
    avoid: [
      'Below roughly 50,000 vectors — flat search is simpler and exact.',
      'Tuning build-time parameters before trying the runtime dial.'
    ],
    mistakes: [
      'Accepting default parameters without measuring recall on your data.',
      'Assuming a returned result is genuinely the nearest neighbour.',
      'Forgetting that HNSW memory overhead can exceed the vectors themselves.',
      'Rebuilding an index and not re-measuring recall.',
      'Attributing an index recall problem to the embedding model.'
    ],
    keyTerms: [
      ['HNSW', 'Hierarchical Navigable Small World graph index. The common default.'],
      ['M', 'HNSW connections per node. Higher recall, more memory.'],
      ['ef_search', 'HNSW query-time candidate count. The runtime recall dial.'],
      ['IVF', 'Inverted file index; searches a subset of clusters.'],
      ['nprobe', 'How many IVF clusters to search.'],
      ['PQ', 'Product quantization — compressed vector codes.'],
      ['index build', 'The one-off construction cost.'],
      ['recall/latency curve', 'The trade-off any index tuning moves along.']
    ],
    resources: [
      ['HNSW (paper)', 'https://arxiv.org/abs/1603.09320', 'paper'],
      ['FAISS — index types guide', 'https://github.com/facebookresearch/faiss/wiki/Guidelines-to-choose-an-index', 'repo'],
      ['Qdrant — indexing', 'https://qdrant.tech/documentation/concepts/indexing/', 'docs'],
      ['ANN Benchmarks', 'https://ann-benchmarks.com/', 'interactive'],
      ['pgvector — indexing', 'https://github.com/pgvector/pgvector#indexing', 'repo']
    ],
    questions: [
      ['Which ANN parameter should you tune first, and why?', 'ef_search on an HNSW index. It is a pure runtime dial trading recall against latency, so it needs no index rebuild and can be evaluated immediately.'],
      ['What is the cost of HNSW’s excellent recall?', 'Memory. The graph structure can occupy as much as or more than the vectors themselves, which is why compressed IVF-PQ indexes exist for billion-scale collections.'],
      ['How would you know your ANN index has degraded?', 'Only by measuring recall against brute force on a sample. From the outside a 70%-recall index returns results that look completely normal.']
    ]
  },

  {
    id: 'vector-databases',
    title: 'Vector Databases',
    domain: 'embeddings', tier: 2, priority: 'high',
    summary: 'Systems that store embeddings with metadata and answer similarity queries.',
    what: `A vector database stores vectors alongside their source text and metadata, builds an index over them, and answers "find the k most similar to this" — usually with filtering on the metadata as well.

It is a search index, not a system of record.`,
    why: `It is a required component of most RAG systems and a genuine build-versus-buy decision with data-governance implications. Choosing badly means either operational burden you did not need or a migration you did not plan for.`,
    analogy: `A library catalogue organised by topic rather than by title, with the ability to narrow by section, publication year and language at the same time. It tells you where to look; the books themselves live on the shelves.`,
    technical: `Core capabilities: store vectors + payload, build an ANN index, similarity search with **metadata filtering**, upsert and delete, and often hybrid (keyword + vector) search.

**Metadata filtering** is the feature that matters most in practice and the one most often underestimated. "Find similar chunks *from documents this user may see, in English, from the current policy version*" is a real requirement, and pre-filtering versus post-filtering behaves very differently: post-filtering can return fewer than k results, or none.

Options: **pgvector** if you already run Postgres and the corpus is modest — one fewer system to secure and back up. **Chroma** for local prototypes. **Qdrant** when you want the same engine locally and in production with strong filtering. **Pinecone** when you want zero operations and accept that data leaves your network. **Milvus/Weaviate** at large scale or when hybrid search is central.

The vector store is derived data. It should always be rebuildable from source documents.`,
    diagram: `
   WHAT IT ACTUALLY STORES

     id       vector                 payload
     ──       ──────                 ───────
     c_042    [0.02, -0.18, …]       { text: "Annual subs are…",
                                        source: "billing.pdf",
                                        page: 7,
                                        lang: "en",
                                        version: "2026-Q1",
                                        acl: ["support","admin"] }

   A REAL QUERY IS NEVER JUST SIMILARITY

     find similar to <query vector>
       WHERE lang = "en"
         AND version = "2026-Q1"
         AND acl CONTAINS user.role      ← permissions matter
       LIMIT 5

   PRE-FILTER vs POST-FILTER — this catches people out

     PRE   filter first, then search the survivors
           → always returns k results, index must support it
     POST  search, then discard non-matching
           → may return FEWER than k, sometimes ZERO

   CHOOSING

     already on Postgres, < ~1M chunks   pgvector   (boring, correct)
     local prototype                      Chroma
     local now, production later          Qdrant
     zero ops, data may leave             Pinecone
     very large scale / hybrid central    Milvus / Weaviate

   ⚠ IT IS A SEARCH INDEX, NOT A SYSTEM OF RECORD.
     Keep the source documents. The index must be rebuildable.`,
    example: {
      language: 'python',
      caption: 'Filtered similarity search — the query shape that matters in production',
      code: `from qdrant_client import QdrantClient, models

client = QdrantClient(url="http://localhost:6333")

client.create_collection(
    "policies",
    vectors_config=models.VectorParams(size=768, distance=models.Distance.COSINE),
)

client.upsert("policies", points=[
    models.PointStruct(
        id=42,
        vector=embed("Annual subscriptions are refundable within 14 days."),
        payload={"text": "Annual subscriptions are refundable within 14 days.",
                 "source": "billing.pdf", "page": 7,
                 "lang": "en", "version": "2026-Q1",
                 "acl": ["support", "admin"]},
    ),
])

# Index the filter fields, or filtering falls back to a slow scan
for field in ["lang", "version"]:
    client.create_payload_index("policies", field, models.PayloadSchemaType.KEYWORD)

def search(question, user_role, k=5):
    return client.query_points(
        collection_name="policies",
        query=embed(question),
        limit=k,
        score_threshold=0.45,                      # honest empty result
        query_filter=models.Filter(must=[          # PRE-filter
            models.FieldCondition(key="lang",    match=models.MatchValue(value="en")),
            models.FieldCondition(key="version", match=models.MatchValue(value="2026-Q1")),
            models.FieldCondition(key="acl",     match=models.MatchAny(any=[user_role])),
        ]),
    ).points

hits = search("refund window for annual plans", user_role="support")
if not hits:
    answer = "I could not find this in the current policy documents."

# The ACL filter is not optional. Without it, retrieval will happily
# surface a document the user is not permitted to see, and the model
# will quote it.`
    },
    prereq: ['nearest-neighbor-search', 'ann-indexes'], next: ['metadata-filtering'],
    related: ['vectordb-vs-sqldb', 'local-vector-db-choice', 'access-control', 'what-is-a-database'],
    tools: ['qdrant', 'chroma', 'pinecone', 'weaviate', 'milvus', 'pgvector', 'faiss'],
    useCases: [
      'Storing and retrieving chunks for a RAG system.',
      'Permission-aware semantic search over internal documents.',
      'Recommendation and similar-item lookup.'
    ],
    avoid: [
      'As a system of record. Keep the source of truth in a real database.',
      'When the corpus is small enough that an in-memory index suffices.',
      'When exact keyword matching is the actual requirement.'
    ],
    mistakes: [
      'Not indexing filter fields, so metadata filtering silently becomes a full scan.',
      'Post-filtering and receiving fewer results than requested without noticing.',
      'Omitting access-control filters, so retrieval leaks documents the user may not see.',
      'Treating the vector store as durable truth with no way to rebuild it.',
      'Choosing a managed service without checking where the data physically resides.'
    ],
    keyTerms: [
      ['vector database', 'A store for embeddings with an ANN index and filtering.'],
      ['payload / metadata', 'Attributes stored alongside each vector.'],
      ['metadata filtering', 'Restricting search by attribute. The feature that matters most.'],
      ['pre-filter vs post-filter', 'Filtering before or after search. Different result guarantees.'],
      ['collection', 'A named set of vectors sharing a dimension and metric.'],
      ['upsert', 'Insert or update a vector by id.'],
      ['score threshold', 'A relevance floor that permits an honest empty result.'],
      ['derived data', 'Rebuildable from source; not the system of record.']
    ],
    resources: [
      ['Qdrant — documentation', 'https://qdrant.tech/documentation/', 'docs'],
      ['Chroma — getting started', 'https://docs.trychroma.com/docs/overview/getting-started', 'docs'],
      ['pgvector', 'https://github.com/pgvector/pgvector', 'repo'],
      ['Pinecone — documentation', 'https://docs.pinecone.io/', 'docs'],
      ['Weaviate — hybrid search', 'https://weaviate.io/developers/weaviate/search/hybrid', 'docs']
    ],
    questions: [
      ['Why is metadata filtering the most important vector-database feature in practice?', 'Real queries are never pure similarity. They need language, document version and — critically — access-control constraints applied at the same time as the similarity search.'],
      ['What is the difference between pre-filtering and post-filtering?', 'Pre-filtering restricts the candidate set before the search, so you reliably get k results. Post-filtering searches first and discards afterwards, so you can silently receive fewer than k, or none.'],
      ['Why should a vector store never be the system of record?', 'It is derived data — an index built from source documents. It must be rebuildable, because embedding model changes, index corruption and re-chunking all require regeneration.']
    ]
  },

  {
    id: 'metadata-filtering',
    title: 'Metadata Filtering',
    domain: 'embeddings', tier: 2, priority: 'high',
    summary: 'Constraining retrieval by attributes — the fix for most near-miss retrieval failures.',
    what: `Metadata filtering restricts a similarity search to vectors whose attributes match given conditions: language, document version, department, date range, or which users may see it.`,
    why: `It solves the near-miss problem that similarity alone cannot, and it is the mechanism that keeps retrieval from leaking documents a user has no right to see. It is simultaneously a quality feature and a security control.`,
    analogy: `Searching a library by topic *and* by section. Without the section filter, a question about your company's policy will surface a superficially similar passage from an outdated handbook, and it will look like a great match.`,
    technical: `Design metadata at ingestion — you cannot filter on what you did not store. Useful fields: source document, section, page, effective date, version, language, department, document type, and an access-control list.

**Access control must be enforced at retrieval**, not in the prompt. Asking the model not to mention a retrieved document is not a security control. If a chunk should not be visible to this user, it must never enter the context.

**Time-based filtering** is the quiet fix for a large class of wrong answers: filter to the current policy version and superseded documents stop competing with current ones.

Index your filter fields. An unindexed filter degrades into a full scan, turning a 5ms query into seconds.`,
    diagram: `
   WITHOUT FILTERING              WITH FILTERING

   "annual refund window?"        "annual refund window?"
                                  + version = current
   0.89 monthly policy (2024)     + lang = en
   0.87 ANNUAL policy (current)   + acl contains user.role
   0.85 monthly policy (current)
   0.84 draft policy (unpublished)   0.87 ANNUAL policy (current)
                                     0.71 refund FAQ (current)
   → correct answer ranked 2nd
   → an unpublished draft in       → correct answer ranked 1st
     the context                   → drafts and old versions gone

   THE THREE JOBS METADATA DOES

   1  PRECISION   filter out superseded and out-of-scope documents
   2  SECURITY    enforce access control at RETRIEVAL time
   3  ATTRIBUTION source, page and version for citations

   ⚠ ACCESS CONTROL BELONGS IN THE FILTER, NOT THE PROMPT

     wrong:  retrieve everything, then tell the model
             "do not reveal HR documents"
     right:  never retrieve what this user may not see

     A prompt instruction is a request. A filter is a boundary.`,
    example: {
      language: 'python',
      caption: 'Metadata designed at ingestion, enforced at retrieval',
      code: `# ── INGESTION: you can only filter on what you stored ──────
def build_payload(chunk, document):
    return {
        "text":          chunk.text,
        # attribution
        "source":        document.filename,
        "page":          chunk.page,
        "section":       chunk.section,
        # precision
        "doc_type":      document.type,          # policy | faq | contract
        "version":       document.version,       # "2026-Q1"
        "effective_from": document.effective_from,
        "superseded":    document.superseded,    # bool
        "lang":          detect_language(chunk.text),
        # security
        "acl":           document.allowed_roles, # ["support", "admin"]
        "confidential":  document.confidential,
    }

# ── RETRIEVAL: filters are applied before similarity ranking ──
def retrieve(question, user, k=5):
    filters = {
        "must": [
            {"key": "lang",       "match": {"value": "en"}},
            {"key": "superseded", "match": {"value": False}},   # current only
            {"key": "acl",        "match": {"any": user.roles}},# SECURITY
        ]
    }
    if not user.can_see_confidential:
        filters["must"].append({"key": "confidential", "match": {"value": False}})

    hits = store.search(embed(question), filter=filters, limit=k,
                        score_threshold=0.45)

    # Defence in depth: verify what came back, do not assume the filter held
    for h in hits:
        assert set(h.payload["acl"]) & set(user.roles), "ACL filter failed"

    return hits

# The ACL check is duplicated deliberately. A filtering bug should
# raise an exception, not quietly place a restricted document into
# a prompt that the model will happily quote from.`
    },
    prereq: ['vector-databases'], next: ['keyword-vs-semantic-search'],
    related: ['access-control', 'context-selection', 'rag-failure-modes', 'privacy-pii'],
    tools: ['qdrant', 'weaviate', 'pinecone', 'pgvector'],
    useCases: [
      'Restricting retrieval to the currently effective policy version.',
      'Enforcing per-user document permissions.',
      'Scoping search to one product area or language.'
    ],
    avoid: [
      'Filters so narrow that legitimate matches are excluded.',
      'Relying on prompt instructions instead of filters for access control.'
    ],
    mistakes: [
      'Not capturing metadata at ingestion, then being unable to filter later.',
      'Enforcing access control in the prompt rather than in the query.',
      'Leaving superseded documents unfiltered, so old policies compete with current ones.',
      'Forgetting to index filter fields, turning fast queries into scans.',
      'Post-filtering and silently returning fewer results than requested.'
    ],
    keyTerms: [
      ['metadata / payload', 'Attributes stored with each vector.'],
      ['filter', 'A condition restricting which vectors are eligible.'],
      ['ACL', 'Access control list — who may see this content.'],
      ['pre-filter', 'Applying the filter before similarity ranking.'],
      ['superseded', 'A document replaced by a newer version.'],
      ['payload index', 'An index on a metadata field so filtering stays fast.'],
      ['defence in depth', 'Verifying the filter held, rather than trusting it.']
    ],
    resources: [
      ['Qdrant — filtering', 'https://qdrant.tech/documentation/concepts/filtering/', 'docs'],
      ['Pinecone — metadata filtering', 'https://docs.pinecone.io/guides/data/filter-with-metadata', 'docs'],
      ['Weaviate — filters', 'https://weaviate.io/developers/weaviate/search/filters', 'docs'],
      ['LlamaIndex — metadata extraction', 'https://docs.llamaindex.ai/en/stable/module_guides/indexing/metadata_extraction/', 'docs']
    ],
    questions: [
      ['Why must access control be enforced in the retrieval filter rather than the prompt?', 'A prompt instruction is a request the model may not honour, and the restricted content is already in the context where it can be quoted or leaked. A filter prevents the chunk existing in the context at all.'],
      ['How does metadata filtering fix the near-miss problem?', 'Similarity cannot tell a superseded policy from the current one. A version or superseded filter removes the competitor entirely, so the correct chunk ranks first.'],
      ['What happens if filter fields are not indexed?', 'Filtering degrades to a full scan, turning a five-millisecond query into seconds as the collection grows.']
    ]
  },

  {
    id: 'keyword-vs-semantic-search',
    title: 'Keyword vs Semantic Search',
    domain: 'embeddings', tier: 2, priority: 'high',
    summary: 'Matching exact tokens versus matching meaning — each fails where the other succeeds.',
    what: `**Keyword search** (BM25) matches the literal words in the query against the words in documents. **Semantic search** matches embeddings, so it finds meaning regardless of wording.`,
    why: `Teams often replace keyword search with semantic search and are surprised when users complain. Semantic search cannot reliably find an error code, a SKU or a person's name — identifiers have no meaning to embed. Both failure modes are visible to users, and they are complementary.`,
    analogy: `Two librarians. One has memorised every word in every book and finds exact phrases instantly, but is baffled by paraphrase. The other understands topics deeply but cannot recall whether a specific catalogue number appeared anywhere.`,
    technical: `**BM25** scores by term frequency and inverse document frequency, with length normalisation. It is fast, needs no model, is fully explainable, and handles rare exact tokens perfectly.

**Semantic** search embeds the query and finds nearby vectors. It handles synonyms, paraphrase and cross-lingual matching, and degrades on identifiers, negation and very short queries.

Where each fails:
- Keyword misses "cancel my plan" when the document says "terminate your subscription".
- Semantic misses "ERR-4021" because the identifier carries no semantic content, and it may confidently return a chunk about a *different* error code.

Negation is a shared weakness: "documents that do not mention refunds" is handled badly by both.

This is why hybrid search exists, and why it is usually the correct default for a user-facing search product.`,
    diagram: `
   QUERY: "how do I cancel"          QUERY: "ERR-4021"

   KEYWORD (BM25)                    KEYWORD (BM25)
     finds documents containing        exact match, ranked first
     "cancel". Misses "terminate       ✓ perfect
     your subscription".
     ✗ weak                          SEMANTIC
                                       "ERR-4021" has no meaning to
   SEMANTIC                            embed. Returns chunks about
     finds "terminate your             OTHER error codes, confidently.
     subscription", "end your          ✗ actively wrong
     plan", "stop paying"
     ✓ strong

   SHARED WEAKNESS: NEGATION
     "policies that do NOT apply to annual plans"
     Both retrieve the annual-plan policy. Neither understands "not".

   THE DECISION

     users search by CONCEPT only          → semantic
     users search by IDENTIFIER only       → keyword
     users do both (almost always true)    → HYBRID

   A support tool where people paste error codes AND ask
   questions in their own words needs both. Choosing one
   guarantees a visible failure mode.`,
    example: {
      language: 'python',
      caption: 'The same two queries against both methods',
      code: `from rank_bm25 import BM25Okapi
from sentence_transformers import SentenceTransformer
import numpy as np

docs = [
    "To terminate your subscription, open Settings and choose End Plan.",
    "Error ERR-4021 indicates an expired payment method.",
    "Error ERR-4022 indicates an invalid billing address.",
    "Refunds are issued within 14 days of purchase.",
]

bm25 = BM25Okapi([d.lower().split() for d in docs])
model = SentenceTransformer('all-MiniLM-L6-v2')
vecs = model.encode(docs, normalize_embeddings=True)

def compare(query):
    kw = bm25.get_scores(query.lower().split())
    sem = vecs @ model.encode(query, normalize_embeddings=True)
    print(f"\\nQUERY: {query!r}")
    print(f"  keyword  top: {docs[int(np.argmax(kw))][:55]}…  ({kw.max():.2f})")
    print(f"  semantic top: {docs[int(np.argmax(sem))][:55]}…  ({sem.max():.2f})")

compare("how do I cancel my plan")
#   keyword  top: Refunds are issued within 14 days of purchase…  (0.00)
#                 ^ no shared words with any relevant doc — FAILS
#   semantic top: To terminate your subscription, open Settings…  (0.61)
#                 ^ correct

compare("ERR-4021")
#   keyword  top: Error ERR-4021 indicates an expired payment me…  (2.31)
#                 ^ exact match, correct
#   semantic top: Error ERR-4022 indicates an invalid billing ad…  (0.79)
#                 ^ WRONG CODE, high confidence — the dangerous failure

# Neither is sufficient alone for a support product where users
# do both things in the same session.`
    },
    prereq: ['semantic-similarity'], next: ['hybrid-search'],
    related: ['keyword-vs-semantic', 'reranking', 'rag-failure-modes'],
    tools: ['weaviate', 'qdrant', 'postgres'],
    useCases: [
      'Deciding which retrieval method a search feature needs.',
      'Diagnosing complaints that search "cannot find" a specific code.',
      'Justifying hybrid search to a team that wanted only embeddings.'
    ],
    avoid: [
      'Semantic-only search on corpora full of identifiers, codes or names.',
      'Keyword-only search on natural-language question corpora.'
    ],
    mistakes: [
      'Replacing keyword search with semantic search and regressing on exact lookups.',
      'Not noticing that semantic search returns a *different* error code with high confidence.',
      'Expecting either method to handle negation.',
      'Assuming a high semantic score implies an exact match.'
    ],
    keyTerms: [
      ['BM25', 'The standard keyword ranking function.'],
      ['TF-IDF', 'Term frequency times inverse document frequency.'],
      ['lexical search', 'Matching literal tokens.'],
      ['semantic search', 'Matching meaning via embeddings.'],
      ['exact match', 'What identifiers and codes require.'],
      ['negation', 'A weakness shared by both methods.'],
      ['sparse vs dense', 'Keyword representations are sparse; embeddings are dense.']
    ],
    resources: [
      ['Elastic — BM25 explained', 'https://en.wikipedia.org/wiki/Okapi_BM25', 'reference'],
      ['Weaviate — hybrid search explained', 'https://weaviate.io/blog/hybrid-search-explained', 'tutorial'],
      ['Pinecone — hybrid search', 'https://www.pinecone.io/learn/hybrid-search-intro/', 'tutorial'],
      ['rank_bm25 library', 'https://github.com/dorianbrown/rank_bm25', 'repo']
    ],
    questions: [
      ['Why does semantic search fail on error codes?', 'Identifiers carry no semantic content, so the embedding of "ERR-4021" is close to the embedding of "ERR-4022". The system returns the wrong code with high confidence, which is worse than returning nothing.'],
      ['What does keyword search miss that semantic search finds?', 'Paraphrase. "Cancel my plan" shares no words with "terminate your subscription", so BM25 scores it near zero while embeddings match it immediately.'],
      ['Which weakness do both methods share?', 'Negation. Neither reliably handles "documents that do not mention refunds" — both retrieve the documents that do.']
    ]
  },

  {
    id: 'hybrid-search',
    title: 'Hybrid Search',
    domain: 'embeddings', tier: 2, priority: 'high',
    summary: 'Running keyword and semantic search together and fusing the results.',
    what: `Hybrid search executes both a keyword (BM25) query and a vector query, then combines the two ranked lists into one. It gets exact-match precision and semantic recall from the same request.`,
    why: `It is usually the right default for a user-facing search or support product, because real users mix identifier lookups and natural-language questions in the same session. Choosing one method guarantees a visible failure mode; hybrid removes both.`,
    analogy: `Asking both librarians and merging their recommendations. The one who remembers exact phrases catches the catalogue number; the one who understands topics catches the paraphrase. Neither alone would have given you a complete answer.`,
    technical: `Fusion methods:
- **Reciprocal Rank Fusion (RRF)** — combine by rank position, \`score = Σ 1/(k + rank)\`. Requires no score normalisation, is robust, and is the sensible default.
- **Weighted score fusion** — normalise both score scales and blend with a weight α. More controllable, more fragile, because the scales differ by model and corpus.

RRF is preferred precisely because BM25 scores and cosine similarities are not on comparable scales and normalising them reliably is harder than it looks.

Hybrid roughly doubles retrieval cost and adds latency, and it can be run in parallel. It composes naturally with reranking: hybrid for recall, then a cross-encoder for precision.

Many vector databases now implement hybrid natively, which is usually better than assembling it yourself.`,
    diagram: `
   QUERY ──┬──► BM25 keyword search  ──► ranked list A
           │
           └──► vector search        ──► ranked list B
                                            │
                        ┌───────────────────┘
                        ▼
              RECIPROCAL RANK FUSION
              score(d) = Σ  1 / (k + rank(d))     k ≈ 60
                        ▼
                   fused ranking
                        │
                        ▼  (optional but usually worth it)
                  CROSS-ENCODER RERANK
                        │
                        ▼
                   final top-5

   WHY RRF RATHER THAN BLENDING SCORES

     BM25   scores  0 → 30+   unbounded, corpus-dependent
     cosine scores  0 → 1     bounded

     Normalising these onto one scale is fragile and breaks when
     the corpus changes. RRF uses only RANK POSITION, which is
     scale-free and robust.

   WORKED EXAMPLE  (k = 60)

     doc     BM25 rank   vector rank   RRF score
     ────    ─────────   ───────────   ─────────
     D1          1            8        1/61 + 1/68 = 0.0311
     D2          9            1        1/69 + 1/61 = 0.0309
     D3          2            3        1/62 + 1/63 = 0.0320  ← wins

     D3 was not first in EITHER list, but it was strong in both.
     That is exactly the document you want.`,
    example: {
      language: 'python',
      caption: 'Reciprocal rank fusion, and the native alternative',
      code: `def reciprocal_rank_fusion(rankings, k=60, weights=None):
    """Combine several ranked lists by position. Scale-free and robust."""
    weights = weights or [1.0] * len(rankings)
    scores = {}
    for ranking, w in zip(rankings, weights):
        for rank, doc_id in enumerate(ranking, start=1):
            scores[doc_id] = scores.get(doc_id, 0.0) + w / (k + rank)
    return sorted(scores, key=scores.get, reverse=True)

def hybrid_search(query, bm25_index, vector_store, k=5, over=30):
    # Over-retrieve from both — cheap, and improves the fusion
    keyword_ids = bm25_index.search(query, limit=over)
    vector_ids  = vector_store.search(embed(query), limit=over)

    fused = reciprocal_rank_fusion(
        [keyword_ids, vector_ids],
        weights=[1.0, 1.0],          # tune per corpus if needed
    )
    return fused[:k]

# Both queries now work from one code path:
hybrid_search("how do I cancel my plan", bm25, store)
#   → the "terminate your subscription" doc, via the vector side
hybrid_search("ERR-4021", bm25, store)
#   → the exact error-code doc, via the keyword side

# Most vector databases now do this natively — prefer that when available
# results = client.query.hybrid(query="ERR-4021", alpha=0.5, limit=5)
#   alpha = 0.0  pure keyword
#   alpha = 1.0  pure vector
#   alpha = 0.5  balanced — measure on YOUR corpus, do not assume`
    },
    prereq: ['keyword-vs-semantic-search'], next: ['reranking'],
    related: ['context-selection', 'retrieval-topk', 'retrieval-evaluation'],
    tools: ['weaviate', 'qdrant', 'milvus', 'postgres'],
    useCases: [
      'Support search where users paste codes and also ask questions.',
      'Product catalogue search mixing SKUs and descriptive queries.',
      'Any user-facing search where both failure modes would be noticed.'
    ],
    avoid: [
      'When the corpus is purely conceptual with no identifiers.',
      'When latency budget is extremely tight and one method demonstrably suffices.',
      'Before measuring whether single-method retrieval is actually failing.'
    ],
    mistakes: [
      'Blending raw BM25 and cosine scores without normalisation.',
      'Choosing the fusion weight by intuition rather than evaluation.',
      'Running the two searches sequentially instead of in parallel.',
      'Adding hybrid search without measuring whether recall actually improved.'
    ],
    keyTerms: [
      ['hybrid search', 'Combining keyword and vector retrieval.'],
      ['RRF', 'Reciprocal Rank Fusion — combines lists by rank position.'],
      ['alpha', 'The weight between keyword and vector contributions.'],
      ['score normalisation', 'Mapping different score scales onto one. Fragile.'],
      ['sparse vector', 'A keyword representation, mostly zeros.'],
      ['dense vector', 'An embedding.'],
      ['fusion', 'Merging several ranked lists into one.']
    ],
    resources: [
      ['Weaviate — hybrid search', 'https://weaviate.io/developers/weaviate/search/hybrid', 'docs'],
      ['Qdrant — hybrid queries', 'https://qdrant.tech/documentation/concepts/hybrid-queries/', 'docs'],
      ['Reciprocal Rank Fusion (paper)', 'https://plg.uwaterloo.ca/~gvcormac/cormacksigir09-rrf.pdf', 'paper'],
      ['Pinecone — hybrid search intro', 'https://www.pinecone.io/learn/hybrid-search-intro/', 'tutorial']
    ],
    questions: [
      ['Why is RRF preferred over blending scores directly?', 'BM25 scores are unbounded and corpus-dependent while cosine scores are bounded. Normalising them onto one scale is fragile, whereas RRF uses only rank position and is scale-free.'],
      ['What kind of document does RRF favour?', 'One that ranks well in both lists. A document placed second and third can beat documents that were first in one list and ninth in the other — and that consensus document is usually the right answer.'],
      ['When is hybrid search not worth it?', 'When the corpus has no identifiers and users only ask conceptual questions, or when the latency budget is tight and single-method retrieval is measurably sufficient.']
    ]
  },

  {
    id: 'reranking',
    title: 'Reranking',
    domain: 'embeddings', tier: 2, priority: 'high',
    summary: 'Rescoring a shortlist with a slower, far more accurate model.',
    what: `Reranking takes the top 20–50 candidates from fast retrieval and rescores them with a **cross-encoder** — a model that reads the query and each document together — then keeps the best few.

Retrieval optimises recall. Reranking optimises precision.`,
    why: `It is the single highest-leverage improvement available to most RAG systems, and it is usually a few lines of code. It fixes the near-miss problem that embeddings alone cannot: the current policy outranking the superseded one, the annual clause outranking the monthly one.`,
    analogy: `A hiring process. The CV screen is fast and shallow, so you keep fifty. The interview reads each candidate properly against the actual role, so you rank the fifty accurately and hire three. You could not interview ten thousand people, and you would not hire from the CV screen alone.`,
    technical: `A **bi-encoder** (ordinary embedding search) encodes query and document *separately*, so the document vector cannot depend on the query. Fast — vectors are precomputed — and inherently approximate.

A **cross-encoder** encodes query and document *together*, so attention can relate specific words across both. Much more accurate, and far too slow to run over a whole corpus because nothing can be precomputed.

Hence the two-stage pattern: bi-encoder for recall over everything, cross-encoder for precision over the shortlist.

Cost: typically 50–200ms for 25 candidates, plus per-document cost if using a hosted reranker. Almost always worth it, because it lets you send *fewer* chunks to the model — which recovers the latency and often reduces total cost.`,
    diagram: `
   BI-ENCODER (retrieval)          CROSS-ENCODER (reranking)

   query ──► [encoder] ──► vec     ┌─────────────────────┐
                            │      │ query  +  document  │
   doc   ──► [encoder] ──► vec     │   together, one pass│
                            │      └──────────┬──────────┘
                          cosine              ▼
                                          relevance score

   document vector is precomputed  nothing precomputable
   and query-independent           reads both, relates words
   FAST, approximate               ACCURATE, slow

   THE TWO-STAGE PIPELINE

     500,000 chunks
          │  bi-encoder, ~10 ms          RECALL
          ▼
        top 30
          │  cross-encoder, ~120 ms      PRECISION
          ▼
        top 4  ──► the model

   WHAT IT FIXES

     query: "refund window for ANNUAL plans"

     before rerank              after rerank
     0.89 monthly policy        0.94 ANNUAL policy   ← correct, now 1st
     0.87 ANNUAL policy         0.31 monthly policy
     0.85 monthly FAQ           0.22 monthly FAQ

     The embedding could not separate "annual" from "monthly".
     The cross-encoder reads both words in context and can.

   ⚠ IT ALSO SAVES MONEY
     better ranking → send 4 chunks instead of 15
     → fewer input tokens → often cheaper overall despite the extra step`,
    example: {
      language: 'python',
      caption: 'Two-stage retrieval, measured',
      code: `from sentence_transformers import CrossEncoder

reranker = CrossEncoder('cross-encoder/ms-marco-MiniLM-L-6-v2')

def retrieve(question, store, final_k=4, shortlist=30):
    # STAGE 1 — bi-encoder over everything. Optimise RECALL.
    candidates = store.search(embed(question), limit=shortlist)

    # STAGE 2 — cross-encoder over the shortlist. Optimise PRECISION.
    pairs = [(question, c["text"]) for c in candidates]
    scores = reranker.predict(pairs)

    for c, s in zip(candidates, scores):
        c["rerank_score"] = float(s)
    candidates.sort(key=lambda c: c["rerank_score"], reverse=True)

    # A relevance floor is now meaningful, because cross-encoder
    # scores separate relevant from irrelevant far more cleanly
    kept = [c for c in candidates if c["rerank_score"] > 0.0][:final_k]
    return kept

# MEASURED ON A REAL EVALUATION SET
#                          recall@4   groundedness   chunks sent   $/call
#   vector only              0.71         0.82           10        0.0374
#   vector + rerank          0.93         0.94            4        0.0271
#
# Better answers AND cheaper, because good ranking means you can
# send fewer chunks. The 120ms rerank is more than recovered by
# the shorter prompt.

# Hosted alternative when you do not want to run the model:
#   cohere.rerank(model="rerank-v3.5", query=q, documents=texts, top_n=4)`
    },
    prereq: ['nearest-neighbor-search', 'semantic-similarity'], next: [],
    related: ['context-selection', 'hybrid-search', 'retrieval-topk', 'rag-failure-modes', 'encoder-decoder'],
    tools: ['sentence-transformers', 'qdrant', 'llamaindex', 'langchain'],
    useCases: [
      'Fixing near-miss retrieval where the right chunk ranks second or third.',
      'Reducing the number of chunks sent to the model without losing coverage.',
      'Making a relevance threshold meaningful enough to support honest refusals.'
    ],
    avoid: [
      'When retrieval is already near-perfect on your evaluation set.',
      'When the latency budget genuinely cannot absorb 50–150ms.',
      'Reranking with the same bi-encoder that did retrieval — it adds almost nothing.'
    ],
    mistakes: [
      'Skipping reranking and instead raising top-k, which buries the answer in more context.',
      'Reranking too few candidates, so the correct chunk never reaches the reranker.',
      'Not measuring the improvement, and therefore not knowing whether it earned its latency.',
      'Assuming reranking fixes retrieval that never surfaced the right chunk at all — it can only reorder what stage one returned.'
    ],
    keyTerms: [
      ['reranking', 'Rescoring a shortlist with a more accurate model.'],
      ['cross-encoder', 'Encodes query and document together. Accurate, slow.'],
      ['bi-encoder', 'Encodes separately, allowing precomputation. Fast, approximate.'],
      ['two-stage retrieval', 'Fast recall, then accurate precision.'],
      ['shortlist', 'The candidates passed to the reranker.'],
      ['precision@k', 'How many of the top k are genuinely relevant.'],
      ['relevance score', 'The cross-encoder’s output; separates cleanly enough to threshold.']
    ],
    resources: [
      ['Sentence Transformers — cross-encoders', 'https://www.sbert.net/examples/applications/cross-encoder/README.html', 'docs'],
      ['Cohere — rerank', 'https://docs.cohere.com/docs/reranking', 'docs'],
      ['LlamaIndex — node postprocessors', 'https://docs.llamaindex.ai/en/stable/module_guides/querying/node_postprocessors/', 'docs'],
      ['Pinecone — rerankers', 'https://www.pinecone.io/learn/series/rag/rerankers/', 'tutorial']
    ],
    questions: [
      ['Why can a cross-encoder not replace vector search entirely?', 'It reads query and document together, so nothing can be precomputed. Running it over 500,000 chunks per query is infeasible; it only works on a shortlist.'],
      ['How can adding a reranking step reduce total cost?', 'Better ranking means you can send four chunks instead of fifteen. The saved input tokens usually more than offset the reranker’s cost and latency.'],
      ['What can reranking not fix?', 'A chunk that stage-one retrieval never returned. Reranking only reorders the shortlist, so if recall failed upstream, the answer was never a candidate.']
    ],
    interview: {
      s30: 'Reranking rescores the top candidates from fast vector search using a cross-encoder that reads the query and each document together. Retrieval optimises recall; reranking optimises precision.',
      s90: 'It is usually the highest-leverage change available in a RAG system and it is a few lines of code. The reason it works is architectural: ordinary vector search uses a bi-encoder, which encodes the document without ever seeing the query, so it cannot tell "annual refund policy" from "monthly refund policy" — both are about refund policies. A cross-encoder reads both together and can. In practice I see recall at four go from around 0.7 to over 0.9. The part people miss is that it often makes the system cheaper, not more expensive: because ranking is better you can send four chunks instead of fifteen, and the saved input tokens more than pay for the reranker. What it cannot do is rescue a chunk that stage one never retrieved — that is a recall problem upstream.',
      pm: 'When someone tells me RAG quality is poor, this is the first thing I check for, because the fix is small and the improvement is usually large and measurable.'
    }
  },

  {
    id: 'vector-playground',
    title: 'Vector Playground',
    domain: 'embeddings', tier: 1, priority: 'medium',
    summary: 'An interactive way to build intuition for how similarity actually behaves.',
    what: `A hands-on exercise: take a handful of sentences, embed them, and look at the similarity matrix. Nothing builds intuition for semantic search faster than seeing which pairs score high and which do not.`,
    why: `Similarity thresholds, near-misses and the limits of embeddings all become obvious in about ten minutes of playing, and stay abstract indefinitely if you only read about them.`,
    analogy: `Learning to judge distance by walking around, rather than by reading about metres. The numbers only mean something once you have felt a few of them.`,
    technical: `Three experiments worth running on your own data:

**1. Similarity matrix.** Embed 8–10 sentences from your own domain and print the full pairwise matrix. You will immediately see the score band your corpus occupies, which is what a threshold has to be calibrated against.

**2. The near-miss test.** Write two sentences that differ in exactly one consequential word ("annual" versus "monthly", "must" versus "must not"). Their similarity will be very high. This is the failure that reranking and metadata filtering exist to fix.

**3. The identifier test.** Embed "ERR-4021" and "ERR-4022". Their similarity will also be very high, which is why identifiers need keyword search.

The third experiment is the one that convinces people hybrid search is necessary.`,
    diagram: `
   THE SIMILARITY MATRIX — run this on your own sentences

              cancel  stop-pay  invoice  weather  ERR-01  ERR-02
   cancel      1.00     0.71     0.34     0.08     0.11    0.10
   stop-pay    0.71     1.00     0.41     0.04     0.09    0.09
   invoice     0.34     0.41     1.00     0.12     0.22    0.21
   weather     0.08     0.04     0.12     1.00     0.05    0.05
   ERR-01      0.11     0.09     0.22     0.05     1.00    0.94  ← !
   ERR-02      0.10     0.09     0.21     0.05     0.94    1.00

   THREE THINGS THIS SHOWS IMMEDIATELY

   1  "cancel" and "stop paying" score 0.71 with NO shared words
      → this is why semantic search works

   2  the whole corpus lives between roughly 0.04 and 0.71
      → a threshold of 0.75 copied from a tutorial would
        reject EVERYTHING. Calibrate locally.

   3  two DIFFERENT error codes score 0.94
      → identifiers are semantically indistinguishable
      → this is why you need keyword search alongside

   THE NEAR-MISS TEST

     "Annual plans are refundable within 14 days"
     "Monthly plans are refundable within 30 days"
                        similarity ≈ 0.93

     One word changes the entire meaning. The embedding
     barely notices. Reranking does.`,
    example: {
      language: 'python',
      caption: 'A playground you can run in two minutes',
      code: `from sentence_transformers import SentenceTransformer
import numpy as np

model = SentenceTransformer('all-MiniLM-L6-v2')

sentences = [
    "How do I cancel my subscription?",
    "I want to stop paying for this service",
    "Where can I find my invoice?",
    "What is the weather in Bangalore?",
    "Error ERR-4021: expired payment method",
    "Error ERR-4022: invalid billing address",
    "Annual plans are refundable within 14 days",
    "Monthly plans are refundable within 30 days",
]

v = model.encode(sentences, normalize_embeddings=True)
sim = v @ v.T

labels = [s[:22] for s in sentences]
print(" " * 24 + "".join(f"{i:>7}" for i in range(len(sentences))))
for i, row in enumerate(sim):
    print(f"{i} {labels[i]:<22}" + "".join(f"{x:>7.2f}" for x in row))

print("\\n── NEAR-MISS ──")
print(f"annual vs monthly refund policy: {sim[6][7]:.3f}")
print("  One decisive word differs. Similarity barely moves.")

print("\\n── IDENTIFIERS ──")
print(f"ERR-4021 vs ERR-4022:            {sim[4][5]:.3f}")
print("  Different codes, near-identical vectors.")

print("\\n── SCORE BAND ──")
off_diagonal = sim[~np.eye(len(sentences), dtype=bool)]
print(f"  min {off_diagonal.min():.2f}  max {off_diagonal.max():.2f}")
print("  Any threshold must be calibrated inside THIS band.")

# Then repeat with sentences from your OWN documents.
# The band will be different, and that is the entire point.`
    },
    prereq: ['cosine-similarity'], next: [],
    related: ['semantic-similarity', 'hybrid-search', 'reranking', 'what-are-embeddings'],
    tools: ['sentence-transformers', 'huggingface'],
    useCases: [
      'Building fast intuition before designing a retrieval pipeline.',
      'Demonstrating to a team why hybrid search is needed.',
      'Finding your corpus’s actual similarity band before setting a threshold.'
    ],
    avoid: [
      'Drawing conclusions from a handful of sentences alone — confirm on the real corpus.'
    ],
    mistakes: [
      'Generalising from toy sentences to a production corpus with a different score distribution.',
      'Comparing scores produced by different models.',
      'Forgetting to normalise, so the dot product is not cosine similarity.'
    ],
    keyTerms: [
      ['similarity matrix', 'All pairwise similarities in a set.'],
      ['score band', 'The range similarities actually occupy for your corpus.'],
      ['near-miss', 'Two texts differing in one decisive word but scoring alike.'],
      ['identifier collapse', 'Codes and ids embedding almost identically.'],
      ['intuition building', 'Playing with real numbers before designing a system.']
    ],
    resources: [
      ['TensorFlow Embedding Projector', 'https://projector.tensorflow.org/', 'interactive'],
      ['Sentence Transformers — quickstart', 'https://www.sbert.net/docs/quickstart.html', 'docs'],
      ['Hugging Face — embedding models', 'https://huggingface.co/models?pipeline_tag=sentence-similarity', 'reference'],
      ['Nomic Atlas — explore embeddings visually', 'https://docs.nomic.ai/atlas/introduction/quick-start', 'interactive']
    ],
    questions: [
      ['What does a similarity matrix on your own corpus tell you?', 'The score band your data actually occupies, which is what any relevance threshold must be calibrated against. A threshold copied from a tutorial may reject everything or accept everything.'],
      ['What does the ERR-4021 versus ERR-4022 result demonstrate?', 'Identifiers are semantically indistinguishable — they score around 0.94 despite meaning different things. It is the clearest possible argument for hybrid search.'],
      ['What does the annual-versus-monthly test show?', 'One decisive word can change the meaning entirely while barely moving the similarity score. Embeddings alone cannot separate these, which is what reranking and metadata filtering are for.']
    ]
  }
];
