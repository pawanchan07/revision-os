/**
 * DOMAIN C — MACHINE LEARNING FUNDAMENTALS (BUILD.md section 6)
 * Taught from absolute beginner level. Every concept gets an everyday analogy,
 * a simple example, a technical explanation and a product example.
 */
export const topics = [
  {
    id: 'what-is-ai',
    title: 'What Is AI?',
    domain: 'ml-fundamentals', tier: 1, priority: 'high',
    summary: 'An umbrella term for machines doing things that used to require human judgement.',
    what: `"AI" is not one technology. It is a label for any system that performs a task we would previously have called intelligent — recognising a face, translating a sentence, recommending a film, writing an email.

The label has shifted constantly. Spell-check was AI in 1985. Nobody calls it that now.`,
    why: `The word is used so loosely that it hides the only question that matters in product work: *what technique is actually being used, and what are its failure modes?* "We use AI" tells you nothing. "We use a fine-tuned classifier with a 94% precision threshold and a human review queue" tells you everything.`,
    analogy: `"Vehicle" covers a bicycle, an ambulance and a cargo ship. All true, all useless for planning a journey. You need to know which one before you can say anything about speed, cost or what happens when it breaks.`,
    technical: `Nested scopes, from widest to narrowest:
- **AI** — any system exhibiting apparently intelligent behaviour, including hand-written rules.
- **Machine learning** — systems that learn patterns from data rather than being explicitly programmed.
- **Deep learning** — ML using multi-layer neural networks.
- **Generative AI / LLMs** — deep learning models that produce new content.

Most working "AI" in industry is still classical ML — fraud scoring, recommendations, forecasting — and often a rules engine wearing a better name. There is nothing wrong with rules; there is something wrong with not knowing which you have.`,
    diagram: `
   ┌─────────────────────────────────────────────────┐
   │ ARTIFICIAL INTELLIGENCE                         │
   │  rules engines · search · planning · expert     │
   │  systems · everything below                     │
   │                                                 │
   │  ┌───────────────────────────────────────────┐  │
   │  │ MACHINE LEARNING                          │  │
   │  │  learns patterns from DATA, not rules     │  │
   │  │  spam filters · fraud scores · forecasts  │  │
   │  │                                           │  │
   │  │  ┌─────────────────────────────────────┐  │  │
   │  │  │ DEEP LEARNING                       │  │  │
   │  │  │  many-layered neural networks       │  │  │
   │  │  │  vision · speech · translation      │  │  │
   │  │  │                                     │  │  │
   │  │  │  ┌───────────────────────────────┐  │  │  │
   │  │  │  │ GENERATIVE AI / LLMs          │  │  │  │
   │  │  │  │  produces new content         │  │  │  │
   │  │  │  └───────────────────────────────┘  │  │  │
   │  │  └─────────────────────────────────────┘  │  │
   │  └───────────────────────────────────────────┘  │
   └─────────────────────────────────────────────────┘

   "We use AI" is true of all four boxes.
   Ask which one. The failure modes are completely different.`,
    example: {
      intro: `The same product feature — "flag risky transactions" — built four ways:`,
      language: 'text',
      caption: 'Four techniques, four completely different sets of trade-offs',
      code: `RULES          if amount > 50000 and country != home_country: flag
               + fully explainable, instant, free
               - misses anything you did not think of

CLASSICAL ML   gradient-boosted tree over 40 features
               + learns interactions, calibrated probabilities
               - needs labelled fraud data; retraining as patterns shift

DEEP LEARNING  neural network over raw transaction sequences
               + finds patterns nobody engineered
               - needs a lot of data; harder to explain to a regulator

LLM            "here is the transaction, is it suspicious?"
               + zero training data, handles free-text context
               - slow, expensive per call, non-deterministic,
                 and it cannot give you a calibrated probability

For fraud scoring at scale, the boring answer is usually correct.
The LLM is right when the input is unstructured text nobody
has ever engineered features for.`
    },
    prereq: [], next: ['what-is-ml'],
    related: ['ai-use-case-selection', 'ai-feasibility'],
    tools: [],
    useCases: [
      'Cutting through a vendor pitch to the actual technique.',
      'Choosing the simplest approach that solves the problem.',
      'Setting expectations with stakeholders about what a system can and cannot do.'
    ],
    avoid: [
      'As a description in any document that needs to be precise.',
      'As a differentiator — "AI-powered" describes almost every product now.'
    ],
    mistakes: [
      'Assuming "AI" means an LLM. Most production AI is not.',
      'Reaching for an LLM where a rule or a small classifier is cheaper, faster and explainable.',
      'Treating AI as a feature rather than an implementation detail behind a user benefit.'
    ],
    keyTerms: [
      ['artificial intelligence', 'Umbrella term for machines performing tasks associated with intelligence.'],
      ['rules engine', 'Explicitly programmed conditions. Not learned. Often the right answer.'],
      ['machine learning', 'Learning patterns from data rather than being programmed with them.'],
      ['deep learning', 'ML with multi-layer neural networks.'],
      ['generative AI', 'Models that produce new content rather than only classifying.'],
      ['narrow AI', 'Systems good at one task. Everything in production today.'],
      ['AGI', 'Hypothetical general-purpose intelligence. Not a product decision you face.']
    ],
    resources: [
      ['Google — Introduction to Machine Learning', 'https://developers.google.com/machine-learning/intro-to-ml', 'course'],
      ['Elements of AI — free course', 'https://www.elementsofai.com/', 'course'],
      ['Microsoft — AI for Beginners', 'https://microsoft.github.io/AI-For-Beginners/', 'repo'],
      ['NIST — AI Risk Management Framework', 'https://www.nist.gov/itl/ai-risk-management-framework', 'reference']
    ],
    questions: [
      ['Why is "we use AI" an unhelpful statement?', 'It covers everything from an if-statement to a frontier LLM. The technique determines cost, latency, explainability and failure modes, and none of those are implied by the label.'],
      ['When is a rules engine the better choice?', 'When the logic is known, must be explainable, must be deterministic, and the edge cases are enumerable. Regulatory thresholds are the classic case.'],
      ['What are the four nested scopes?', 'AI contains machine learning, which contains deep learning, which contains generative AI and LLMs.']
    ],
    interview: {
      s30: 'AI is an umbrella label rather than a technology. What matters is which technique is underneath — a rules engine, a classical model, a neural network or an LLM — because each has completely different cost, latency and failure characteristics.',
      s90: 'I treat "AI" the way I treat "vehicle": true but not actionable. When someone proposes an AI feature, my first question is which of the four layers we mean, because that determines everything downstream. A rules engine is explainable and free but brittle. A gradient-boosted tree gives calibrated probabilities but needs labelled data. An LLM needs no training data and handles unstructured text, but it is slow, non-deterministic and cannot give you a calibrated confidence score. For a fraud-scoring problem at scale the boring classical answer is usually right; the LLM earns its place when the input is free text nobody has engineered features for.',
      pm: 'It stops me approving an expensive, slow, non-deterministic solution to a problem that four rules would have solved.'
    }
  },

  {
    id: 'what-is-ml',
    title: 'What Is Machine Learning?',
    domain: 'ml-fundamentals', tier: 1, priority: 'high',
    summary: 'Finding patterns in examples instead of being told the rules.',
    what: `In normal programming you write the rules and the computer applies them. In machine learning you supply examples of inputs and correct outputs, and the computer works out rules that fit.

The output of that process is a **model** — a file of numbers that turns new inputs into predictions.`,
    why: `Some problems have rules nobody can write down. Nobody can articulate exactly what makes a photo contain a cat, or what makes an email spam. But anyone can label ten thousand examples. ML converts "I know it when I see it" into something a machine can do at scale.`,
    analogy: `Teaching a child to recognise dogs. You do not recite a specification of ears and tails. You point at dogs, repeatedly, and correct the mistakes. Eventually they generalise to a breed they have never seen.`,
    technical: `The loop: take **training data** (inputs plus known correct outputs), pick a **model** with adjustable **parameters**, define a **loss function** measuring how wrong the predictions are, and use **optimisation** to adjust the parameters until the loss is small.

The trained model is then used for **inference** — applying it to new, unseen inputs.

The crucial property is **generalisation**: performing well on data it has never seen. A model that memorises the training set perfectly and fails on new data has learned nothing useful.`,
    diagram: `
   TRADITIONAL PROGRAMMING        MACHINE LEARNING

   rules  ─┐                      data   ─┐
           ├──► computer ──► answers      ├──► computer ──► RULES
   data   ─┘                      answers─┘                (the model)

   You write the logic.           You supply examples.
                                  The logic is discovered.

   THE TRAINING LOOP

   examples ──► model ──► prediction
                  ▲            │
                  │            ▼
                  │      compare with the correct answer
                  │            │
                  └── adjust ──┘  (loss goes down)
                     parameters

   repeat millions of times ──► trained model ──► INFERENCE
                                                  on new data`,
    example: {
      intro: `Predicting whether a trial user will convert. Nobody can write the rule; everybody has the data.`,
      language: 'python',
      caption: 'The whole ML loop in fifteen lines',
      code: `# Each row: a past trial user. Each column: something we knew about them.
# The label: did they eventually convert?

features = [
    # logins, projects, teammates_invited, days_to_first_action
    [ 12,  4,  2,  1],
    [  1,  0,  0, 11],
    [  8,  3,  1,  2],
    [  2,  1,  0,  9],
]
labels = [1, 0, 1, 0]        # 1 = converted, 0 = did not

model = SomeClassifier()
model.fit(features, labels)   # TRAINING: find parameters that fit

# INFERENCE: a brand-new trial user we have never seen
new_user = [[9, 3, 1, 2]]
print(model.predict_proba(new_user))   # [[0.18, 0.82]] -> 82% likely to convert

# Nobody wrote "if logins > 7 and invited > 0 then likely".
# The model inferred that shape from the examples.`
    },
    prereq: ['what-is-ai'], next: ['supervised-learning', 'features-labels', 'what-is-deep-learning'],
    related: ['training-vs-inference', 'overfitting-underfitting'],
    tools: ['python', 'pytorch'],
    useCases: [
      'Problems where the rules exist but nobody can articulate them.',
      'Scoring or ranking at a volume humans cannot handle.',
      'Personalisation, where the rule differs per user.'
    ],
    avoid: [
      'When a simple rule works — it is cheaper, faster and explainable.',
      'When you have no labelled data and no way to get it.',
      'When a wrong answer is unacceptable and you cannot add human review.',
      'When the decision must be fully explainable to a regulator and a simple model will not do.'
    ],
    mistakes: [
      'Believing the model "understands". It found statistical patterns, including ones you did not intend.',
      'Assuming a model trained once stays accurate. The world moves; the model does not.',
      'Underestimating how much of the work is data preparation rather than modelling.',
      'Confusing high training accuracy with a useful model.'
    ],
    keyTerms: [
      ['model', 'The learned artefact — a file of parameters mapping inputs to outputs.'],
      ['training', 'The process of adjusting parameters to fit examples.'],
      ['inference', 'Using the trained model on new data.'],
      ['generalisation', 'Performing well on data never seen during training.'],
      ['parameter', 'A number inside the model, adjusted during training.'],
      ['hyperparameter', 'A setting you choose before training, such as learning rate.'],
      ['ground truth', 'The known-correct answer used to judge a prediction.']
    ],
    resources: [
      ['Google — Machine Learning Crash Course', 'https://developers.google.com/machine-learning/crash-course', 'course'],
      ['scikit-learn — an introduction to machine learning', 'https://scikit-learn.org/stable/getting_started.html', 'docs'],
      ['3Blue1Brown — But what is a neural network?', 'https://www.youtube.com/watch?v=aircAruvnKk', 'video'],
      ['Google — ML Glossary', 'https://developers.google.com/machine-learning/glossary', 'reference']
    ],
    questions: [
      ['What is the fundamental inversion in machine learning?', 'Traditional programming takes rules plus data and produces answers. ML takes data plus answers and produces the rules — the model.'],
      ['Why is generalisation the point rather than accuracy?', 'A model can memorise its training data perfectly and be useless on anything new. Only performance on unseen data indicates it learned something transferable.'],
      ['When should you not use ML?', 'When a rule works, when you have no labels, when errors are unacceptable and unreviewable, or when full explainability is a hard requirement.']
    ]
  },

  {
    id: 'what-is-deep-learning',
    title: 'What Is Deep Learning?',
    domain: 'ml-fundamentals', tier: 1, priority: 'high',
    summary: 'Machine learning with many-layered neural networks that discover their own features.',
    what: `Deep learning uses neural networks with many layers stacked between input and output. "Deep" just means "many layers".

Its defining trait is that it learns its own **features** from raw data. Classical ML needs a human to decide that "number of logins" matters. Deep learning is handed the raw pixels, audio or text and works out what matters.`,
    why: `This is why the last decade happened. Feature engineering was the bottleneck in classical ML — expensive, slow, and limited by human imagination. Deep learning removed it, which is what made image recognition, speech and eventually language models work.`,
    analogy: `Learning to recognise faces. Nobody teaches you "eye separation ratio 0.31". Your visual system builds up from edges, to shapes, to features, to whole faces, entirely on its own. Each layer of a deep network does something similar.`,
    technical: `Each layer applies a linear transformation followed by a non-linear **activation function**. Stacking them lets the network represent arbitrarily complex relationships — the non-linearity is essential, because stacked linear layers collapse into a single linear layer.

Early layers learn simple patterns (edges, character sequences); later layers combine them into abstractions (faces, meaning).

The costs are real: deep learning needs far more data, far more compute, and is far harder to interpret than a decision tree. It earns those costs on unstructured data — images, audio, text — and frequently loses to gradient-boosted trees on ordinary tabular data.`,
    diagram: `
   CLASSICAL ML                    DEEP LEARNING

   raw data                        raw data
      │                               │
      ▼                               ▼
   HUMAN engineers features      ┌─────────┐  edges, strokes
   "eye distance / face width"   │ layer 1 │
   "average pixel brightness"    └────┬────┘
      │                               ▼
      ▼                          ┌─────────┐  shapes, parts
   model                         │ layer 2 │
      │                          └────┬────┘
      ▼                               ▼
   prediction                    ┌─────────┐  objects, meaning
                                 │ layer N │
   bottleneck:                   └────┬────┘
   human imagination                  ▼
                                  prediction

                                 features are LEARNED,
                                 not designed

   THE TRADE
     + no feature engineering, handles unstructured data
     - needs much more data and compute, hard to interpret
     - often LOSES to gradient-boosted trees on tabular data`,
    example: {
      intro: `Why non-linearity is the whole trick:`,
      language: 'python',
      caption: 'Stacked linear layers collapse; add an activation and they do not',
      code: `# Two linear layers with NO activation between them:
#   y = W2 @ (W1 @ x)  =  (W2 @ W1) @ x  =  W_combined @ x
# ...which is just ONE linear layer. Depth bought you nothing.

# Insert a non-linearity and the collapse is impossible:
#   y = W2 @ relu(W1 @ x)
# Now each layer can carve the space differently, and stacking
# genuinely increases what the network can represent.

def relu(x):
    return max(0.0, x)          # the simplest useful non-linearity

# A tiny two-layer network, by hand
def forward(x, W1, b1, W2, b2):
    hidden = [relu(sum(w * xi for w, xi in zip(row, x)) + b)
              for row, b in zip(W1, b1)]           # layer 1 + activation
    out    = [sum(w * h for w, h in zip(row, hidden)) + b
              for row, b in zip(W2, b2)]           # layer 2
    return out

# An LLM is this idea, with billions of parameters and
# an attention mechanism instead of plain dense layers.`
    },
    prereq: ['what-is-ml'], next: ['neural-networks', 'activation-functions'],
    related: ['transformers', 'parameters-weights'],
    tools: ['pytorch', 'transformers'],
    useCases: [
      'Unstructured inputs: images, audio, video, natural language.',
      'Problems where useful features are unknown or too numerous to engineer.',
      'Transfer learning — starting from a pretrained model rather than from scratch.'
    ],
    avoid: [
      'Modest tabular datasets — gradient-boosted trees usually win, train in seconds, and explain themselves.',
      'When you have a few hundred examples.',
      'When per-decision explainability is a hard regulatory requirement.'
    ],
    mistakes: [
      'Reaching for deep learning on tabular data out of fashion rather than fit.',
      'Underestimating the data requirement, then training a network that memorises.',
      'Assuming interpretability tools give you a real causal explanation. They give you an attribution.'
    ],
    keyTerms: [
      ['layer', 'One transformation step in a network.'],
      ['depth', 'How many layers. "Deep" simply means many.'],
      ['feature learning', 'The network discovering useful representations itself.'],
      ['activation function', 'The non-linearity that makes depth meaningful.'],
      ['representation', 'The internal encoding a layer produces.'],
      ['transfer learning', 'Reusing a pretrained network for a new task.'],
      ['end-to-end learning', 'Training from raw input straight to final output.']
    ],
    resources: [
      ['3Blue1Brown — Neural Networks series', 'https://www.3blue1brown.com/topics/neural-networks', 'video'],
      ['Google — ML Crash Course: neural networks', 'https://developers.google.com/machine-learning/crash-course/neural-networks', 'course'],
      ['Dive into Deep Learning (free book)', 'https://d2l.ai/', 'course'],
      ['TensorFlow Playground — train a net in the browser', 'https://playground.tensorflow.org/', 'interactive']
    ],
    questions: [
      ['What does deep learning remove that classical ML required?', 'Manual feature engineering. The network learns its own representations from raw data, which is what made images, audio and language tractable.'],
      ['Why is the activation function essential?', 'Without a non-linearity, stacked linear layers collapse algebraically into a single linear layer, so depth adds no representational power at all.'],
      ['When does deep learning lose to simpler methods?', 'On modest tabular datasets, where gradient-boosted trees usually match or beat it, train in seconds, and are far easier to explain.']
    ]
  },

  {
    id: 'supervised-learning',
    title: 'Supervised Learning',
    domain: 'ml-fundamentals', tier: 1, priority: 'high',
    summary: 'Learning from examples where you already know the right answer.',
    what: `Supervised learning trains on data that includes the correct answer for each example. Show the model ten thousand emails already labelled spam or not, and it learns to label the next one.`,
    why: `It is by far the most common form of ML in production, because most business problems are of the form "here is a thing, tell me which category it is or what number to expect". And it is the one that depends most heavily on a resource you have to create: labels.`,
    analogy: `Studying with an answer key. Every practice question comes with the correct answer, so you can check yourself and adjust. Without the key you would never know whether you were improving.`,
    technical: `The model learns a mapping from inputs **X** to outputs **y**. Two families: **classification** (discrete categories) and **regression** (continuous numbers).

The binding constraint is labelled data — it must be accurate, sufficient, and representative of what the model will meet in production. Label quality caps model quality; no architecture rescues bad labels.

**Label leakage** is the classic disaster: a feature that would not be available at prediction time in production quietly encodes the answer, producing brilliant test scores and a useless deployed model.`,
    diagram: `
   TRAINING (you have the answers)

   input                     label
   ─────                     ─────
   "win a free iphone!"  ──► spam
   "meeting at 3pm"      ──► not spam
   "claim your prize"    ──► spam
              │
              ▼
        model learns the mapping
              │
   INFERENCE (you do not)
              ▼
   "urgent: verify account" ──► spam (0.94)

   THE LABEL IS THE BOTTLENECK
     accurate      wrong labels teach wrong patterns
     sufficient    hundreds to millions, depending
     representative if production differs from training, it fails

   LABEL LEAKAGE — the silent killer
     predicting churn, and one feature is
     "cancellation_reason"  <- only exists AFTER they churned
     99% accuracy in testing, useless in production`,
    example: {
      language: 'python',
      caption: 'Supervised learning with the split that keeps you honest',
      code: `from sklearn.model_selection import train_test_split
from sklearn.ensemble import GradientBoostingClassifier
from sklearn.metrics import classification_report

# X: what we knew at prediction time.  y: what actually happened.
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42, stratify=y
)

model = GradientBoostingClassifier()
model.fit(X_train, y_train)                 # learns from the answer key

print(classification_report(y_test, model.predict(X_test)))
#               precision  recall  f1-score  support
#  not_churned      0.91     0.95     0.93      1620
#  churned          0.72     0.58     0.64       380   <- the class you care about

# LEAKAGE CHECK — always run this before believing a good score
for name, importance in sorted(zip(feature_names, model.feature_importances_),
                               key=lambda p: -p[1])[:5]:
    print(f"{name:30} {importance:.3f}")
# If "cancellation_reason" or "refund_issued_at" appears near the top,
# you are predicting the past, not the future. Remove it and retrain.`
    },
    prereq: ['what-is-ml'], next: ['classification', 'regression', 'features-labels'],
    related: ['train-val-test', 'supervised-fine-tuning', 'labeling'],
    tools: ['python', 'pytorch'],
    useCases: [
      'Spam, fraud and abuse detection.',
      'Churn and conversion prediction.',
      'Demand and revenue forecasting.',
      'Any routing or triage decision with historical outcomes.'
    ],
    avoid: [
      'When labels do not exist and cannot be created affordably.',
      'When the historical labels encode a bias you do not want to reproduce.',
      'When the phenomenon changes faster than you can relabel and retrain.'
    ],
    mistakes: [
      'Label leakage — a feature unavailable at prediction time in production.',
      'Training on a population that differs from the one you serve.',
      'Ignoring class imbalance and celebrating 99% accuracy on a 1% positive rate.',
      'Assuming historical labels are objective. They record past decisions, including past bias.'
    ],
    keyTerms: [
      ['supervised learning', 'Learning from labelled examples.'],
      ['label / target', 'The known correct answer.'],
      ['feature', 'An input attribute the model uses.'],
      ['label leakage', 'A feature that encodes the answer and would not exist at prediction time.'],
      ['class imbalance', 'One class vastly outnumbers another, making accuracy misleading.'],
      ['precision / recall', 'Of those flagged, how many were right; of those that mattered, how many were caught.'],
      ['stratified split', 'Splitting so class proportions are preserved in each part.']
    ],
    resources: [
      ['scikit-learn — supervised learning', 'https://scikit-learn.org/stable/supervised_learning.html', 'docs'],
      ['Google — classification crash course', 'https://developers.google.com/machine-learning/crash-course/classification/video-lecture', 'course'],
      ['Google — data preparation and feature engineering', 'https://developers.google.com/machine-learning/data-prep', 'course']
    ],
    questions: [
      ['What is label leakage and why is it so dangerous?', 'A feature that would not exist at prediction time but correlates with the answer — cancellation reason when predicting churn. It produces excellent test scores and a model that fails completely in production, and it is easy to miss.'],
      ['Why is 99% accuracy often a bad sign?', 'With a 1% positive rate, always predicting "negative" scores 99%. Accuracy is the wrong metric under class imbalance; use precision and recall on the class you care about.'],
      ['Why are historical labels not objective truth?', 'They record decisions people made, including their biases. A model trained on them reproduces those decisions at scale.']
    ]
  },

  {
    id: 'unsupervised-learning',
    title: 'Unsupervised Learning',
    domain: 'ml-fundamentals', tier: 2, priority: 'medium',
    summary: 'Finding structure in data when nobody has labelled anything.',
    what: `Unsupervised learning looks for patterns in data with no correct answers supplied. It groups similar things, reduces dimensions, or flags oddities — without being told what any group means.`,
    why: `Most data is unlabelled, and labelling is expensive. Unsupervised methods let you explore before you commit: discover that your users fall into four natural groups, find anomalies worth investigating, or compress a thousand features into a plottable two.`,
    analogy: `Sorting a box of unlabelled photographs into piles that look like they belong together. You do not know what to call the piles. The piles are still informative.`,
    technical: `Main families:
- **Clustering** (k-means, DBSCAN, hierarchical) — group similar items.
- **Dimensionality reduction** (PCA, t-SNE, UMAP) — compress many features into a few while keeping structure.
- **Anomaly detection** — flag points unlike the rest.
- **Representation learning** — embeddings. This is the family that matters most for AI product work.

Evaluation is genuinely hard: with no ground truth, "is this clustering correct?" has no objective answer. You get internal measures (silhouette score) and human judgement.`,
    diagram: `
   SUPERVISED                   UNSUPERVISED

   ● labelled A                 ○ ○   ○
   ▲ labelled B                ○  ○  ○ ○      ○ ○ ○
   ● ● ▲ ▲                                   ○  ○ ○
   learn the boundary          "how many groups are there?"
                               "what do they mean?"
                               -> the algorithm will NOT tell you

   THE THREE JOBS

   CLUSTERING           ○○○   ○○○    -> segments you did not define
   DIM. REDUCTION       50 features -> 2, so you can SEE it
   ANOMALY DETECTION    ○○○○○  ✕     -> the one that does not belong

   THE ONE THAT MATTERS MOST FOR AI PRODUCTS
   representation learning -> EMBEDDINGS -> semantic search, RAG`,
    example: {
      language: 'python',
      caption: 'Clustering users into behavioural segments nobody defined in advance',
      code: `from sklearn.cluster import KMeans
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import silhouette_score

# Behaviour, not demographics. No labels anywhere.
# columns: sessions/week, features_used, teammates, avg_session_min
X = scaler = StandardScaler().fit_transform(user_behaviour)

# How many groups? There is no correct answer — you look for a good one.
for k in range(2, 8):
    km = KMeans(n_clusters=k, n_init=10, random_state=42).fit(X)
    print(k, round(silhouette_score(X, km.labels_), 3))
# 2 0.41 | 3 0.48 | 4 0.52 | 5 0.39 | 6 0.31   -> k=4 looks natural

km = KMeans(n_clusters=4, n_init=10, random_state=42).fit(X)

# The algorithm produced four groups. Naming them is YOUR job:
#  cluster 0  low sessions, 1 feature, solo      -> "tried it once"
#  cluster 1  daily, 6 features, 4 teammates     -> "core team users"
#  cluster 2  weekly, 2 features, solo           -> "personal habit"
#  cluster 3  bursty, many features, many mates  -> "migrating a team"
# Now check: do these clusters differ in RETENTION? If not, they are
# real patterns that do not matter.`
    },
    prereq: ['what-is-ml'], next: ['clustering'],
    related: ['what-are-embeddings', 'segmentation', 'drift-detection'],
    tools: ['python', 'sentence-transformers'],
    useCases: [
      'Discovering behavioural segments before you have any labels.',
      'Compressing high-dimensional data into something you can plot.',
      'Flagging anomalies for human investigation.',
      'Producing embeddings, which underpin semantic search and RAG.'
    ],
    avoid: [
      'When you already have labels — supervised learning will do better.',
      'When you need a specific, defined answer rather than exploration.',
      'As the final word: clusters need human interpretation and validation.'
    ],
    mistakes: [
      'Treating clusters as objective truth. Change the algorithm or scaling and they change.',
      'Not standardising features, so the largest-scaled column dominates the distance metric.',
      'Naming clusters and then never checking they differ on an outcome that matters.',
      'Choosing k because it made a nice slide.'
    ],
    keyTerms: [
      ['unsupervised learning', 'Finding structure without labels.'],
      ['clustering', 'Grouping similar items.'],
      ['dimensionality reduction', 'Compressing many features while keeping structure.'],
      ['PCA / t-SNE / UMAP', 'Common reduction techniques; the latter two are for visualisation.'],
      ['anomaly detection', 'Identifying points unlike the rest.'],
      ['silhouette score', 'An internal measure of how well-separated clusters are.'],
      ['representation learning', 'Learning useful encodings — the origin of embeddings.']
    ],
    resources: [
      ['scikit-learn — clustering', 'https://scikit-learn.org/stable/modules/clustering.html', 'docs'],
      ['scikit-learn — decomposition (PCA)', 'https://scikit-learn.org/stable/modules/decomposition.html', 'docs'],
      ['Google — clustering course', 'https://developers.google.com/machine-learning/clustering', 'course'],
      ['Distill — how to use t-SNE effectively', 'https://distill.pub/2016/misread-tsne/', 'paper']
    ],
    questions: [
      ['Why is evaluating unsupervised learning hard?', 'There is no ground truth, so "is this clustering correct?" has no objective answer. You get internal measures and human judgement, and different settings give different valid-looking answers.'],
      ['What must you do after a clustering produces segments?', 'Interpret and validate them: name them from their behaviour, then check whether they actually differ on an outcome you care about, such as retention. Patterns that do not affect anything are not insights.'],
      ['Which unsupervised family matters most for AI products?', 'Representation learning — it produces embeddings, which underpin semantic search, retrieval and RAG.']
    ]
  },

  {
    id: 'reinforcement-learning',
    title: 'Reinforcement Learning',
    domain: 'ml-fundamentals', tier: 2, priority: 'medium',
    summary: 'Learning by trial and error against a reward signal.',
    what: `An **agent** takes **actions** in an **environment**, receives **rewards**, and learns a **policy** — a strategy for choosing actions — that maximises reward over time.

There is no answer key. There is only feedback about how well things went.`,
    why: `Two reasons for you. First, it is how models are aligned to human preference: RLHF is reinforcement learning where the reward comes from human comparisons. Second, its central problem — optimising a proxy and getting the letter of the goal instead of the spirit — is exactly the problem you meet whenever you set a metric as a target.`,
    analogy: `Training a dog. No explanation of the rules, just treats when it does the right thing. The dog gradually works out which behaviours pay. And if you reward it for sitting whenever you say "sit", you may find it sits constantly to farm treats.`,
    technical: `Formally a Markov Decision Process: states, actions, transitions, rewards. The agent balances **exploration** (trying unknown actions) against **exploitation** (using what already works).

**Credit assignment** is the hard part: when a reward arrives at the end, which of the fifty preceding actions deserves credit?

**Reward hacking** is the characteristic failure: the agent finds a way to maximise the stated reward without achieving the intended goal. Every documented example is funny until it is your recommendation system maximising watch time by promoting outrage.

**RLHF** applies this to language models: humans rank outputs, a reward model learns to predict those rankings, and the policy is optimised against it.`,
    diagram: `
             ┌─────────────────────────┐
             │      ENVIRONMENT        │
             └───┬─────────────────▲───┘
        state,   │                 │  action
        reward   ▼                 │
             ┌─────────────────────┴───┐
             │         AGENT           │
             │   policy: state->action │
             └─────────────────────────┘

   EXPLORATION vs EXPLOITATION
     try something new, or use what already works?
     too much exploit -> stuck in a local optimum
     too much explore -> never converges

   REWARD HACKING — the defining failure mode

     goal    "users should enjoy the feed"
     proxy   watch time
     result  outrage and autoplay maximise watch time
             the metric went UP. the goal was MISSED.

   This is Goodhart's law with a gradient.`,
    example: {
      intro: `RLHF is the reinforcement learning you will actually encounter:`,
      language: 'text',
      caption: 'How human preference becomes a training signal',
      code: `1. COLLECT PREFERENCES
   prompt: "Explain RAG to a non-technical stakeholder."
   response A: dense, jargon-heavy, technically perfect
   response B: clear analogy, correct, no jargon
   human: B > A                      (a comparison, not a score)

   Repeat for tens of thousands of prompts.

2. TRAIN A REWARD MODEL
   a model that predicts which response a human would prefer
   input: (prompt, response) -> output: a scalar reward

3. OPTIMISE THE POLICY
   the language model generates; the reward model scores;
   the policy is updated to produce higher-scoring responses
   ...with a penalty for drifting too far from the base model
      (or it degenerates into reward-model gibberish)

WHAT GOES WRONG
   sycophancy       agreeing with the user scores well
   verbosity        longer answers score well
   over-refusal     refusing is never penalised as much as
                    a bad answer, so the model refuses too often

All three are reward hacking. The reward model is a PROXY
for human preference, and the policy optimises the proxy.`
    },
    prereq: ['what-is-ml'], next: [],
    related: ['rlhf-preference', 'preference-tuning', 'judge-bias', 'north-star-metric'],
    tools: [],
    useCases: [
      'Aligning language models to human preference (RLHF).',
      'Sequential decision problems: pricing, inventory, bidding, game playing.',
      'Recommendation systems optimising long-term engagement.'
    ],
    avoid: [
      'When supervised learning fits — RL is far more complex and less stable.',
      'When mistakes during learning are expensive or unsafe in the real world.',
      'When you cannot define a reward that genuinely captures the goal.'
    ],
    mistakes: [
      'Designing a reward that is easy to measure rather than one that reflects the goal.',
      'Not anticipating reward hacking. Assume the agent will find the loophole.',
      'Letting an agent explore in production where exploration has real costs.',
      'Treating RLHF output as objective quality. It reflects the preferences of the specific people who labelled it.'
    ],
    keyTerms: [
      ['agent', 'The learner that chooses actions.'],
      ['environment', 'Whatever the agent acts upon.'],
      ['policy', 'The strategy mapping states to actions.'],
      ['reward', 'The scalar feedback signal.'],
      ['exploration vs exploitation', 'Trying new actions versus using known-good ones.'],
      ['credit assignment', 'Working out which past action caused a delayed reward.'],
      ['reward hacking', 'Maximising the stated reward while missing the intended goal.'],
      ['RLHF', 'Reinforcement learning from human feedback.']
    ],
    resources: [
      ['Sutton & Barto — Reinforcement Learning (free)', 'http://incompleteideas.net/book/the-book-2nd.html', 'course'],
      ['OpenAI — Spinning Up in Deep RL', 'https://spinningup.openai.com/en/latest/', 'course'],
      ['Anthropic — Constitutional AI (paper)', 'https://arxiv.org/abs/2212.08073', 'paper'],
      ['Hugging Face — RLHF illustrated', 'https://huggingface.co/blog/rlhf', 'tutorial']
    ],
    questions: [
      ['What is reward hacking and why should a PM care?', 'The agent maximises the stated reward without achieving the intended goal — watch time optimised via outrage. It is Goodhart’s law with an optimiser behind it, and it is exactly what happens when you set a proxy metric as a target.'],
      ['How does RLHF turn human judgement into training signal?', 'Humans compare pairs of responses, a reward model learns to predict those preferences, then the language model is optimised to score highly against that reward model.'],
      ['Why are sycophancy and verbosity common in RLHF-trained models?', 'Both tend to score well with human raters, so the policy learns them. They are reward hacking against a proxy for preference rather than preference itself.']
    ]
  },

  {
    id: 'classification',
    title: 'Classification',
    domain: 'ml-fundamentals', tier: 1, priority: 'high',
    summary: 'Predicting which category something belongs to — and choosing the threshold that decides.',
    what: `Classification assigns an input to one of a fixed set of categories: spam or not, fraud or legitimate, which of five support queues.

Crucially, most classifiers output a **probability**, and a threshold turns that into a decision.`,
    why: `Choosing the threshold is a product decision, not a modelling one. It is where you decide whether you would rather miss fraud or annoy legitimate customers, and no data scientist can make that call for you.`,
    analogy: `A metal detector at an airport. Turn the sensitivity up and you catch every weapon but stop hundreds of people with belt buckles. Turn it down and queues move but you miss things. There is no setting that is simply "correct" — it depends on what you are protecting against.`,
    technical: `Binary, multi-class (one of N) or multi-label (any of N).

Metrics that matter:
- **Precision** — of the items flagged, how many were right. High precision means few false alarms.
- **Recall** — of the items that mattered, how many were caught. High recall means few misses.
- **F1** — their harmonic mean.
- **AUC-ROC** — threshold-independent ranking quality.

Precision and recall trade off directly against each other via the threshold. **Accuracy is nearly useless** under class imbalance.

**Calibration** matters separately: a well-calibrated model that says 0.7 is right about 70% of the time. Uncalibrated confidence makes thresholds meaningless.`,
    diagram: `
   THE CONFUSION MATRIX

                     predicted
                  positive  negative
   actual pos  │    TP    │    FN    │  <- missed (recall problem)
   actual neg  │    FP    │    TN    │
                  ^
                  false alarm (precision problem)

   precision = TP / (TP + FP)   "when we flag, are we right?"
   recall    = TP / (TP + FN)   "do we catch what matters?"

   THE THRESHOLD IS A PRODUCT DECISION

   threshold  precision  recall   what it means
   ---------  ---------  ------   -------------
     0.9        0.95      0.31    almost never wrong, misses 69%
     0.5        0.78      0.72    balanced
     0.2        0.41      0.94    catches nearly everything,
                                  6 in 10 alerts are false

   MEDICAL SCREENING  -> favour recall (a miss is fatal)
   AUTO-BLOCKING      -> favour precision (a false block is costly)
   WITH HUMAN REVIEW  -> favour recall; humans filter the noise`,
    example: {
      language: 'python',
      caption: 'Choosing a threshold from business cost, not from a default',
      code: `from sklearn.metrics import precision_recall_curve
import numpy as np

probs = model.predict_proba(X_test)[:, 1]
precision, recall, thresholds = precision_recall_curve(y_test, probs)

# Business inputs — these come from the PM, not the model
COST_FALSE_POSITIVE = 8     # a legitimate customer blocked: support + churn risk
COST_FALSE_NEGATIVE = 240   # fraud that got through: the loss
n_pos = y_test.sum()
n_neg = len(y_test) - n_pos

best = None
for p, r, t in zip(precision[:-1], recall[:-1], thresholds):
    tp = r * n_pos
    fn = n_pos - tp
    fp = (tp / p - tp) if p > 0 else n_neg
    cost = fp * COST_FALSE_POSITIVE + fn * COST_FALSE_NEGATIVE
    if best is None or cost < best[0]:
        best = (cost, t, p, r)

cost, t, p, r = best
print(f"threshold {t:.2f}  precision {p:.2f}  recall {r:.2f}  cost {cost:,.0f}")
# threshold 0.31  precision 0.62  recall 0.88  cost 31,480
#
# The default 0.5 was NOT optimal. Because a missed fraud costs 30x
# a false alarm, the right threshold catches more and tolerates noise.`
    },
    prereq: ['supervised-learning'], next: ['regression'],
    related: ['eval-thresholds-quality-gates', 'safety-evaluation', 'accuracy-metrics'],
    tools: ['python'],
    useCases: [
      'Fraud, spam and abuse detection.',
      'Routing support tickets to the right queue.',
      'Content moderation with a human review tier.',
      'Predicting churn or conversion as a yes/no.'
    ],
    avoid: [
      'When the output is genuinely continuous — use regression.',
      'When categories overlap heavily or are poorly defined.',
      'When a calibrated probability is needed and the model is not calibrated.'
    ],
    mistakes: [
      'Reporting accuracy on imbalanced data.',
      'Leaving the threshold at 0.5 because it is the default.',
      'Treating an uncalibrated score as a probability.',
      'Optimising a single metric without asking which error type is more expensive.'
    ],
    keyTerms: [
      ['classification', 'Predicting a discrete category.'],
      ['precision', 'Of items flagged, the share that were correct.'],
      ['recall', 'Of items that mattered, the share that were caught.'],
      ['F1 score', 'Harmonic mean of precision and recall.'],
      ['threshold', 'The probability cut-off that turns a score into a decision.'],
      ['confusion matrix', 'The table of true/false positives and negatives.'],
      ['calibration', 'Whether a stated 0.7 confidence is right 70% of the time.'],
      ['AUC-ROC', 'Threshold-independent measure of ranking quality.']
    ],
    resources: [
      ['Google — classification: precision and recall', 'https://developers.google.com/machine-learning/crash-course/classification/precision-and-recall', 'course'],
      ['scikit-learn — classification metrics', 'https://scikit-learn.org/stable/modules/model_evaluation.html#classification-metrics', 'docs'],
      ['scikit-learn — probability calibration', 'https://scikit-learn.org/stable/modules/calibration.html', 'docs']
    ],
    questions: [
      ['Why is the classification threshold a product decision?', 'It sets the trade-off between false alarms and misses, and only the business knows which is more expensive. A missed fraud may cost thirty times a wrongly blocked customer, or the reverse.'],
      ['Why is accuracy misleading under class imbalance?', 'With a 1% positive rate, predicting "negative" every time scores 99% accuracy while catching nothing. Precision and recall on the positive class describe reality.'],
      ['What does calibration mean and why does it matter?', 'A calibrated model that outputs 0.7 is correct about 70% of the time. Without calibration the score is only a ranking, so any threshold you choose has no interpretable meaning.']
    ]
  },

  {
    id: 'regression',
    title: 'Regression',
    domain: 'ml-fundamentals', tier: 2, priority: 'medium',
    summary: 'Predicting a number rather than a category — and reporting the uncertainty around it.',
    what: `Regression predicts a continuous value: revenue next month, delivery time, lifetime value, expected latency.`,
    why: `A point prediction without a range is close to useless for planning. "Revenue will be ₹4.2 crore" and "revenue will be ₹4.2 crore, plus or minus ₹1.8 crore" lead to completely different decisions.`,
    analogy: `A weather forecast. "23 degrees" is a prediction. "23 degrees, range 19 to 27" is a prediction you can pack for.`,
    technical: `Metrics: **MAE** (mean absolute error — average miss, in the original units, robust), **RMSE** (root mean squared error — penalises large misses heavily), **MAPE** (percentage error — breaks down near zero), **R²** (share of variance explained).

Choose by cost shape: if one large error hurts far more than several small ones, RMSE reflects that. If all errors hurt proportionally, use MAE.

**Prediction intervals** matter more than the point estimate for planning. Quantile regression gives them directly.

For skewed targets such as revenue, predicting the log and transforming back is often far better behaved.`,
    diagram: `
   CLASSIFICATION           REGRESSION
   which bucket?            how much?

   spam / not spam          ₹4.2 crore
   fraud / legitimate       14 minutes
   queue A / B / C          0.83 probability of renewal

   METRIC BY COST SHAPE

   errors:  [1, 1, 1, 1, 10]
   MAE  = 2.8    all errors weighted equally
   RMSE = 4.6    the single big miss dominates

   Which is right depends on whether one 10-unit miss
   is worse than ten 1-unit misses. That is a business fact.

   ALWAYS SHIP THE INTERVAL

   forecast  ────────●────────
             ├───────┼───────┤
            3.1     4.2     5.4   (80% interval)

   A plan built on 4.2 alone will be wrong.
   A plan that survives 3.1 is a plan.`,
    example: {
      language: 'python',
      caption: 'Point prediction plus a real interval, via quantile regression',
      code: `from sklearn.ensemble import GradientBoostingRegressor
from sklearn.metrics import mean_absolute_error, mean_squared_error
import numpy as np

# Point estimate
model = GradientBoostingRegressor(loss='squared_error').fit(X_train, y_train)
pred = model.predict(X_test)

mae  = mean_absolute_error(y_test, pred)
rmse = np.sqrt(mean_squared_error(y_test, pred))
print(f"MAE {mae:,.0f}   RMSE {rmse:,.0f}")
# MAE 18,400  RMSE 41,200
# RMSE >> MAE means a few very large misses. Investigate those rows —
# they are usually a distinct segment the model has not learned.

# Prediction INTERVAL: train separate models for the 10th and 90th percentile
lo = GradientBoostingRegressor(loss='quantile', alpha=0.10).fit(X_train, y_train)
hi = GradientBoostingRegressor(loss='quantile', alpha=0.90).fit(X_train, y_train)

for i in range(3):
    print(f"predicted {pred[i]:>9,.0f}   80% interval "
          f"[{lo.predict(X_test)[i]:>9,.0f}, {hi.predict(X_test)[i]:>9,.0f}]"
          f"   actual {y_test[i]:>9,.0f}")

# Report the interval to stakeholders. A single number invites
# false confidence and a plan with no slack.`
    },
    prereq: ['supervised-learning'], next: [],
    related: ['classification', 'ai-cost', 'opportunity-sizing'],
    tools: ['python'],
    useCases: [
      'Revenue and demand forecasting.',
      'Estimating delivery or completion time.',
      'Predicting lifetime value for prioritisation.',
      'Capacity planning for inference cost.'
    ],
    avoid: [
      'When the answer is genuinely categorical.',
      'When extrapolating far outside the range seen in training.',
      'When the target is so noisy that no interval is useful.'
    ],
    mistakes: [
      'Reporting a point estimate with no interval, inviting false precision.',
      'Using MAPE on a target that can approach zero — the percentage explodes.',
      'Optimising RMSE when the business actually cares about typical error, or vice versa.',
      'Extrapolating beyond the training range and trusting the number.'
    ],
    keyTerms: [
      ['regression', 'Predicting a continuous value.'],
      ['MAE', 'Mean absolute error. Average miss in original units.'],
      ['RMSE', 'Root mean squared error. Penalises large misses.'],
      ['MAPE', 'Mean absolute percentage error. Unstable near zero.'],
      ['R²', 'Share of variance explained.'],
      ['prediction interval', 'The plausible range around a prediction.'],
      ['quantile regression', 'Predicting a percentile directly, giving intervals.'],
      ['extrapolation', 'Predicting outside the training range. Unreliable.']
    ],
    resources: [
      ['scikit-learn — regression metrics', 'https://scikit-learn.org/stable/modules/model_evaluation.html#regression-metrics', 'docs'],
      ['Google — regression crash course', 'https://developers.google.com/machine-learning/crash-course/linear-regression', 'course'],
      ['Forecasting: Principles and Practice (free book)', 'https://otexts.com/fpp3/', 'course']
    ],
    questions: [
      ['Why report a prediction interval rather than a point estimate?', 'Plans built on a single number have no slack. An interval tells stakeholders how much uncertainty they are absorbing and lets them plan for the bad case.'],
      ['When does RMSE differ meaningfully from MAE?', 'When a few very large errors exist. RMSE much larger than MAE signals outlier predictions, usually a segment the model has not learned.'],
      ['Why is MAPE risky?', 'It divides by the actual value, so it explodes as the target approaches zero and becomes meaningless for low-volume periods.']
    ]
  },

  {
    id: 'clustering',
    title: 'Clustering',
    domain: 'ml-fundamentals', tier: 2, priority: 'low',
    summary: 'Grouping similar items without being told what the groups are.',
    what: `Clustering partitions data into groups of similar items. The algorithm decides which items belong together; it never tells you what the groups mean.`,
    why: `It is how you discover segments you did not know existed, and how you make sense of a large unlabelled corpus — grouping thousands of support tickets into themes, for instance, before deciding what to build.`,
    analogy: `Sorting a shared music library by which songs sound alike. The piles emerge; the genre names are yours to invent.`,
    technical: `**k-means** — fast, requires you to pick k, assumes roughly spherical, similarly-sized clusters, and is sensitive to feature scaling.
**DBSCAN** — finds arbitrarily shaped clusters and labels outliers as noise; no k needed, but it is sensitive to its density parameters.
**Hierarchical** — produces a tree you can cut at any level; slow on large data.

The distance metric determines everything. Standardise features first, or the column with the largest numeric range silently dominates.

Clustering **embeddings** is where this becomes genuinely powerful for AI products: cluster the vectors of ten thousand support tickets and the themes surface without anyone reading them.`,
    diagram: `
   k-MEANS                      DBSCAN

   ○○○     ○○○                  ○○○○○        ✕  <- noise
   ○○○     ○○○                 ○○   ○○
                                ○○○○○     ○○○○
   assumes round, similar-      ○○○○○    ○○○○○○
   sized blobs. Pick k.
                                any shape, finds outliers,
   ✕ struggles with            no k needed, but density
     elongated or nested        parameters matter

   SCALING CHANGES EVERYTHING

   raw:      sessions 0-50      revenue 0-500,000
             -> revenue dominates the distance entirely
   scaled:   both mean 0, sd 1
             -> both contribute

   ALWAYS STANDARDISE FIRST.

   THE AI-PRODUCT USE
   10,000 support tickets -> embeddings -> cluster
   -> themes emerge without anyone reading them`,
    example: {
      language: 'python',
      caption: 'Clustering support-ticket embeddings to surface themes',
      code: `from sentence_transformers import SentenceTransformer
from sklearn.cluster import KMeans
from collections import Counter

tickets = load_tickets()                      # 10,000 free-text tickets

# 1. embed: text -> vectors that place similar meaning nearby
encoder = SentenceTransformer('all-MiniLM-L6-v2')
vectors = encoder.encode([t["text"] for t in tickets],
                         normalize_embeddings=True)

# 2. cluster
km = KMeans(n_clusters=12, n_init=10, random_state=42).fit(vectors)

# 3. read the themes: nearest tickets to each centre
import numpy as np
for c in range(12):
    members = np.where(km.labels_ == c)[0]
    centre  = km.cluster_centers_[c]
    closest = members[np.argsort(
        np.linalg.norm(vectors[members] - centre, axis=1))][:3]
    print(f"\\n── cluster {c}  ({len(members)} tickets)")
    for i in closest:
        print("   ", tickets[i]["text"][:80])

# Output reveals themes nobody tagged:
#   cluster 3 (1,204 tickets) — "cannot reset password on mobile"
#   cluster 7 (  890 tickets) — "invoice VAT number wrong"
# 1,204 tickets is a roadmap item, and nobody had to read them all.`
    },
    prereq: ['unsupervised-learning'], next: [],
    related: ['what-are-embeddings', 'semantic-similarity', 'segmentation'],
    tools: ['python', 'sentence-transformers'],
    useCases: [
      'Finding themes in a large corpus of free text.',
      'Discovering behavioural user segments.',
      'Grouping similar documents before summarising each group.'
    ],
    avoid: [
      'When you already know the categories — classify instead.',
      'On very high-dimensional raw data without reduction or embeddings.',
      'When you need a stable, reproducible grouping across runs and data changes.'
    ],
    mistakes: [
      'Not standardising features, letting one column dominate the distance.',
      'Choosing k arbitrarily and presenting the result as discovered truth.',
      'Assuming clusters are stable — they shift as data arrives.',
      'Never validating that clusters differ on an outcome that matters.'
    ],
    keyTerms: [
      ['k-means', 'Partitions into k clusters around centroids. Fast, assumes round blobs.'],
      ['DBSCAN', 'Density-based; finds arbitrary shapes and marks outliers.'],
      ['centroid', 'The centre point of a cluster.'],
      ['distance metric', 'How similarity is measured — Euclidean, cosine.'],
      ['standardisation', 'Rescaling features so none dominates by magnitude.'],
      ['elbow method', 'Plotting error against k to find a reasonable number of clusters.'],
      ['topic modelling', 'Clustering documents to surface themes.']
    ],
    resources: [
      ['scikit-learn — clustering overview', 'https://scikit-learn.org/stable/modules/clustering.html', 'docs'],
      ['Google — k-means clustering', 'https://developers.google.com/machine-learning/clustering/overview', 'course'],
      ['BERTopic — topic modelling over embeddings', 'https://maartengr.github.io/BERTopic/index.html', 'repo']
    ],
    questions: [
      ['Why must features be standardised before clustering?', 'Distance is dominated by the column with the largest numeric range. Revenue in rupees would completely overwhelm session counts unless both are rescaled.'],
      ['What makes clustering embeddings so useful?', 'Similar meaning maps to nearby vectors, so clustering surfaces themes in free text — support tickets, reviews, feedback — without anyone reading or tagging them.'],
      ['What must happen after clusters are produced?', 'A human names them from their contents, and you validate that the clusters actually differ on something that matters. Otherwise they are patterns with no consequence.']
    ]
  },

  {
    id: 'features-labels',
    title: 'Features & Labels',
    domain: 'ml-fundamentals', tier: 1, priority: 'high',
    summary: 'The inputs a model sees and the answer it is trying to predict.',
    what: `A **feature** is an input attribute — number of logins, account age, text of a message. A **label** is the answer you want predicted — churned or not, revenue, category.

Features are what the model knows. The label is what it is guessing.`,
    why: `Model quality is capped by feature quality far more than by algorithm choice. Teams routinely spend weeks tuning a model when a single well-chosen feature would have moved the metric more — and the person who knows which feature that is usually the PM, not the data scientist.`,
    analogy: `Predicting whether someone will enjoy a film. Features: their past ratings, the genre, the director, the length. Label: did they rate it highly. Adding "did their friends like it" is a new feature, and it probably helps more than a smarter algorithm.`,
    technical: `**Feature engineering** transforms raw data into useful inputs: aggregations (logins in the last 7 days), ratios (revenue per seat), time deltas (days since last login), encodings (one-hot for categories), text embeddings.

The critical discipline is **point-in-time correctness**: every feature must reflect only what was known *at prediction time*. Computing "total lifetime orders" from today's data when predicting a churn event from March leaks the future into the past.

A **feature store** exists precisely to guarantee that training and serving compute features identically — the mismatch between them is called **training-serving skew** and is a leading cause of models that test well and fail in production.`,
    diagram: `
   RAW DATA                 FEATURES                  LABEL
   ────────                 ────────                  ─────
   login timestamps  ──►  logins_last_7d: 12
   order history     ──►  days_since_order: 3
   plan: "pro"       ──►  plan_pro: 1  plan_free: 0   churned_
   support tickets   ──►  tickets_last_30d: 2         next_30d:
   message text      ──►  [0.12, -0.4, ...] embedding    0

   POINT-IN-TIME CORRECTNESS

   predicting churn as of  1 March
   ─────────────────────────────────────────────►  time
     ✓ allowed: anything before 1 March
     ✗ leaked:  "total_lifetime_orders" computed TODAY
                "cancellation_reason"   only exists after churn

   TRAINING-SERVING SKEW

   training:  logins_last_7d from the warehouse (nightly batch)
   serving:   logins_last_7d from the live API (real time)
   ...subtly different numbers -> a model that tested well and
      performs worse every day in production.`,
    example: {
      language: 'python',
      caption: 'Building features as of a cut-off date, so nothing leaks',
      code: `def features_as_of(user_id, as_of):
    """Every value must be knowable at 'as_of'. Nothing after it."""
    events = query(
        "SELECT event_name, occurred_at FROM events "
        "WHERE user_id = %s AND occurred_at < %s",       # STRICTLY before
        (user_id, as_of)
    )
    orders = query(
        "SELECT total_cents, created_at FROM orders "
        "WHERE user_id = %s AND created_at < %s",
        (user_id, as_of)
    )

    logins = [e for e in events if e["event_name"] == "login"]
    recent = [e for e in logins if e["occurred_at"] > as_of - DAYS_7]

    return {
        "logins_last_7d":     len(recent),
        "days_since_login":   (as_of - max(e["occurred_at"] for e in logins)).days
                              if logins else 999,
        "orders_to_date":     len(orders),
        "revenue_to_date":    sum(o["total_cents"] for o in orders),
        "tickets_last_30d":   sum(1 for e in events
                                  if e["event_name"] == "ticket_opened"
                                  and e["occurred_at"] > as_of - DAYS_30),
    }

# Label: what happened AFTER the cut-off
def label_as_of(user_id, as_of):
    return int(churned_between(user_id, as_of, as_of + DAYS_30))

# One row per (user, cut-off date). Same function used at serving time,
# which is what prevents training-serving skew.`
    },
    prereq: ['supervised-learning'], next: ['train-val-test'],
    related: ['labeling', 'training-dataset-prep', 'event-tracking'],
    tools: ['python', 'postgres'],
    useCases: [
      'Deciding which product signals are worth instrumenting for a model.',
      'Diagnosing why a model performs worse in production than in testing.',
      'Adding a domain-knowledge feature that beats weeks of tuning.'
    ],
    avoid: [
      'Features unavailable at prediction time — that is leakage.',
      'Features derived from the label in any way.',
      'Protected attributes, or proxies for them, in decisions about people.'
    ],
    mistakes: [
      'Computing features from today’s data for a historical prediction point.',
      'Different feature logic in training and serving.',
      'Including an id or timestamp that accidentally encodes the outcome.',
      'Assuming more features is better — noise features reduce generalisation.'
    ],
    keyTerms: [
      ['feature', 'An input attribute the model sees.'],
      ['label', 'The answer being predicted.'],
      ['feature engineering', 'Turning raw data into useful model inputs.'],
      ['point-in-time correctness', 'Using only what was knowable at prediction time.'],
      ['leakage', 'Future or answer-derived information reaching the features.'],
      ['training-serving skew', 'Features computed differently in training and production.'],
      ['feature store', 'Infrastructure guaranteeing identical features in both places.'],
      ['one-hot encoding', 'Turning a category into a set of 0/1 columns.']
    ],
    resources: [
      ['Google — data preparation and feature engineering', 'https://developers.google.com/machine-learning/data-prep', 'course'],
      ['scikit-learn — preprocessing', 'https://scikit-learn.org/stable/modules/preprocessing.html', 'docs'],
      ['Google — Rules of ML', 'https://developers.google.com/machine-learning/guides/rules-of-ml', 'reference'],
      ['Feast — open-source feature store', 'https://github.com/feast-dev/feast', 'docs']
    ],
    questions: [
      ['What is point-in-time correctness?', 'Every feature must reflect only information available at the moment of prediction. Computing a lifetime total from today’s data for a prediction made in March leaks the future.'],
      ['What is training-serving skew?', 'Features computed differently in training and in production — a nightly batch versus a live API — so the model sees inputs it was not trained on and degrades silently.'],
      ['Why can a PM contribute more than a hyperparameter sweep?', 'Model quality is capped by feature quality. Knowing which product signal actually predicts the outcome is domain knowledge, and it usually beats weeks of tuning.']
    ]
  },

  {
    id: 'train-val-test',
    title: 'Training, Validation & Test Data',
    domain: 'ml-fundamentals', tier: 1, priority: 'high',
    summary: 'Three separate splits, because measuring yourself on your own homework proves nothing.',
    what: `**Training set** — the model learns from it. **Validation set** — you tune choices against it. **Test set** — used once, at the end, to estimate real-world performance.

Three sets, three different jobs.`,
    why: `Any model can score well on data it has memorised. Only performance on data it has never seen predicts production behaviour. And the validation set gets contaminated the moment you start tuning against it — which is why a third, untouched set exists.`,
    analogy: `Practice questions, a mock exam, and the real exam. If you take the real exam paper home and practise on it, your score stops meaning anything. The test set is the sealed paper.`,
    technical: `Typical split: 60/20/20 or 70/15/15. **Stratify** so class proportions are preserved.

**Cross-validation** (k-fold) uses the data more efficiently when it is scarce, by rotating which fold is held out.

Two splitting rules that catch people out:
- **Time-series data must be split by time.** Random splits let the model train on the future and predict the past — an unrealistically good score.
- **Grouped data must be split by group.** If one user has fifty rows, splitting randomly puts the same user in train and test, and the model recognises the user rather than the pattern.

Every time you look at the test set and change something, it becomes a validation set. Look once.`,
    diagram: `
   ALL DATA
   ┌────────────────────────┬──────────┬──────────┐
   │       TRAINING 60%     │  VAL 20% │ TEST 20% │
   └────────────────────────┴──────────┴──────────┘
     model learns here       tune here   ONCE, at the end

   TIME-SERIES: NEVER SPLIT RANDOMLY

   ✗ random          ░█░░█░█░░█░  train and test interleaved
                     -> the model saw the future. Score is a lie.

   ✓ chronological   ░░░░░░░│███  train on the past, test on the future
                                   -> what production actually looks like

   GROUPED DATA: SPLIT BY GROUP

   ✗ random rows     user_7 appears in BOTH train and test
                     -> the model memorises user_7, not the pattern
   ✓ by user         all of user_7's rows land on one side

   THE TEST SET DECAYS WITH USE
   Look at it, change something, look again -> it is now
   a validation set, and your final number is optimistic.`,
    example: {
      language: 'python',
      caption: 'Three splits done correctly for grouped and time-series data',
      code: `from sklearn.model_selection import train_test_split, GroupShuffleSplit, TimeSeriesSplit

# 1. The ordinary case — stratify to preserve class balance
X_tmp, X_test, y_tmp, y_test = train_test_split(
    X, y, test_size=0.20, stratify=y, random_state=42)
X_train, X_val, y_train, y_val = train_test_split(
    X_tmp, y_tmp, test_size=0.25, stratify=y_tmp, random_state=42)   # 0.25*0.8=0.2

# 2. GROUPED data (many rows per user) — split by user, never by row
gss = GroupShuffleSplit(n_splits=1, test_size=0.2, random_state=42)
train_idx, test_idx = next(gss.split(X, y, groups=user_ids))
# Now no user appears on both sides.

# 3. TIME-SERIES — always train on the past, test on the future
tscv = TimeSeriesSplit(n_splits=5)
for fold, (tr, te) in enumerate(tscv.split(X_sorted_by_time)):
    print(f"fold {fold}: train rows 0..{tr[-1]}, test rows {te[0]}..{te[-1]}")
# fold 0: train 0..999,   test 1000..1199
# fold 1: train 0..1199,  test 1200..1399     <- the window only grows

# 4. The discipline
model.fit(X_train, y_train)
tune_against(X_val, y_val)          # as many times as you like
final = evaluate(X_test, y_test)    # EXACTLY ONCE`
    },
    prereq: ['features-labels'], next: ['overfitting-underfitting'],
    related: ['golden-sets', 'regression-testing', 'training-dataset-prep'],
    tools: ['python'],
    useCases: [
      'Estimating how a model will actually perform in production.',
      'Comparing candidate models fairly.',
      'The same discipline applies to LLM evaluation sets.'
    ],
    avoid: [
      'Random splits on time-series or grouped data.',
      'Reusing the test set repeatedly during development.',
      'A test set too small to distinguish two models.'
    ],
    mistakes: [
      'Splitting randomly when rows are grouped by user, so the model memorises users.',
      'Training on the future and testing on the past.',
      'Tuning against the test set, producing an optimistic final number.',
      'Applying preprocessing (scaling, imputation) before splitting, leaking test statistics into training.'
    ],
    keyTerms: [
      ['training set', 'Data the model learns from.'],
      ['validation set', 'Data used for tuning and model selection.'],
      ['test set', 'Held-out data, used once, for the final estimate.'],
      ['cross-validation', 'Rotating held-out folds to use scarce data efficiently.'],
      ['stratification', 'Preserving class proportions across splits.'],
      ['temporal split', 'Splitting chronologically. Mandatory for time-series.'],
      ['group split', 'Keeping all rows of an entity on one side of the split.'],
      ['holdout', 'Any data deliberately withheld from training.']
    ],
    resources: [
      ['scikit-learn — cross-validation', 'https://scikit-learn.org/stable/modules/cross_validation.html', 'docs'],
      ['Google — training and test sets', 'https://developers.google.com/machine-learning/crash-course/overfitting/dividing-datasets', 'course'],
      ['scikit-learn — TimeSeriesSplit', 'https://scikit-learn.org/stable/modules/generated/sklearn.model_selection.TimeSeriesSplit.html', 'docs']
    ],
    questions: [
      ['Why must time-series data be split chronologically?', 'A random split lets the model train on future data and predict the past, producing a score that cannot be reproduced in production, where the future is unavailable.'],
      ['Why split by group when one user has many rows?', 'A random row split puts the same user in training and test, so the model can recognise the user instead of learning the underlying pattern. The score is inflated.'],
      ['What happens if you tune against the test set?', 'It becomes a second validation set. Your final number is optimistic, because you have implicitly fitted to it through your own choices.']
    ]
  },

  {
    id: 'overfitting-underfitting',
    title: 'Overfitting & Underfitting',
    domain: 'ml-fundamentals', tier: 1, priority: 'high',
    summary: 'Memorising the examples versus missing the pattern entirely.',
    what: `**Overfitting** — the model learns the training data including its noise, so it performs brilliantly there and poorly on anything new.
**Underfitting** — the model is too simple to capture the real pattern, so it performs poorly everywhere.

The target is between them: **generalisation**.`,
    why: `Overfitting is the reason a model that scored 98% in a demo scores 71% in production, and it is the single most common cause of a disappointing launch. Recognising the signature — a large gap between training and validation performance — lets you diagnose it in seconds.`,
    analogy: `A student who memorises past exam papers scores perfectly on those and fails when the questions change. A student who never studied fails both. You want the one who learned the underlying subject.`,
    technical: `The **bias-variance trade-off**: underfitting is high bias (systematically wrong), overfitting is high variance (unstable, dependent on the exact training sample).

Diagnose with **learning curves**: plot training and validation error against epochs or data size. A large and growing gap means overfitting; both curves high and flat means underfitting.

Fixes for overfitting: more data, simpler model, **regularisation** (L1/L2, dropout), **early stopping**, data augmentation.
Fixes for underfitting: a more expressive model, better features, train longer.

Language models overfit too. Fine-tune on 200 examples for too many epochs and the model memorises them, losing general capability — that is **catastrophic forgetting**.`,
    diagram: `
   UNDERFIT              GOOD FIT              OVERFIT
   ────────              ────────              ───────
    ●   ●                 ●   ●                 ●   ●
   ────────              ╱‾‾‾╲                 ╱╲ ╱╲╱╲
    ●  ●   ●            ●  ●   ●              ● ╲╱  ● ●
                                              every point hit,
   too simple           captures the           including the noise
   misses the pattern   real shape

   THE SIGNATURE — always check both numbers

              train    validation    diagnosis
              -----    ----------    ---------
               0.62       0.61       UNDERFIT (both bad)
               0.91       0.89       GOOD (small gap)
               0.99       0.71       OVERFIT (huge gap)

   LEARNING CURVES

   error │╲                          error │╲
         │ ╲___ validation                 │ ╲______ validation
         │  ╲                              │  ╲
         │   ╲____ training                │   ╲____ training
         └──────────────► epochs           └──────────────► epochs
           healthy                          gap widening = overfitting
                                            -> EARLY STOP here`,
    example: {
      language: 'python',
      caption: 'Spotting overfitting from the gap, then fixing it',
      code: `from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import f1_score

# A deliberately over-powered model on modest data
big = RandomForestClassifier(n_estimators=500, max_depth=None,
                             min_samples_leaf=1).fit(X_train, y_train)

print("train", round(f1_score(y_train, big.predict(X_train)), 3))  # 0.998
print("val  ", round(f1_score(y_val,   big.predict(X_val)),   3))  # 0.712
# A 0.29 gap. It memorised. This will disappoint in production.

# Constrain it and the gap closes
small = RandomForestClassifier(n_estimators=200, max_depth=6,
                               min_samples_leaf=20).fit(X_train, y_train)
print("train", round(f1_score(y_train, small.predict(X_train)), 3))  # 0.874
print("val  ", round(f1_score(y_val,   small.predict(X_val)),   3))  # 0.851
# Training score is LOWER and the model is BETTER. That surprises people.

# Early stopping for a neural net / gradient booster
model.fit(X_train, y_train,
          eval_set=[(X_val, y_val)],
          early_stopping_rounds=25)   # stop when validation stops improving`
    },
    prereq: ['train-val-test'], next: ['loss-functions'],
    related: ['when-not-to-finetune', 'regression-testing', 'drift-detection'],
    tools: ['python'],
    useCases: [
      'Diagnosing why a model performs worse in production than in testing.',
      'Deciding whether to gather more data or simplify the model.',
      'Knowing when to stop fine-tuning an LLM.'
    ],
    avoid: [
      'Judging a model on training performance alone. It carries no information.',
      'Adding capacity when the model already overfits.'
    ],
    mistakes: [
      'Celebrating a high training score.',
      'Adding more features or layers to fix overfitting, making it worse.',
      'Not plotting learning curves, so the diagnosis is guesswork.',
      'Fine-tuning an LLM for too many epochs on a small set, causing catastrophic forgetting.'
    ],
    keyTerms: [
      ['overfitting', 'Learning noise; great on training, poor on new data.'],
      ['underfitting', 'Too simple to capture the pattern; poor everywhere.'],
      ['generalisation', 'Performing well on unseen data. The actual goal.'],
      ['bias-variance trade-off', 'Systematic error versus sensitivity to the sample.'],
      ['regularisation', 'Penalising complexity to discourage memorisation.'],
      ['early stopping', 'Halting training when validation performance stops improving.'],
      ['dropout', 'Randomly disabling units during training to prevent co-adaptation.'],
      ['catastrophic forgetting', 'A fine-tuned model losing general capability it previously had.']
    ],
    resources: [
      ['Google — overfitting', 'https://developers.google.com/machine-learning/crash-course/overfitting/overfitting', 'course'],
      ['scikit-learn — validation curves', 'https://scikit-learn.org/stable/modules/learning_curve.html', 'docs'],
      ['Google — Rules of ML', 'https://developers.google.com/machine-learning/guides/rules-of-ml', 'reference']
    ],
    questions: [
      ['What is the signature of overfitting?', 'A large gap between training and validation performance — 0.99 training and 0.71 validation. Both scores being low instead indicates underfitting.'],
      ['Why can a model with a lower training score be the better model?', 'Because the goal is generalisation, not memorisation. A constrained model that scores 0.87 on training and 0.85 on validation will outperform one that scores 0.998 and 0.71.'],
      ['How does overfitting show up when fine-tuning an LLM?', 'Training on a small set for too many epochs makes the model memorise those examples and lose general capability — catastrophic forgetting.']
    ]
  },

  {
    id: 'loss-functions',
    title: 'Loss Functions',
    domain: 'ml-fundamentals', tier: 2, priority: 'medium',
    summary: 'The number that measures how wrong the model is — and therefore what it optimises for.',
    what: `A loss function turns "how wrong was that prediction?" into a single number. Training is the process of making that number smaller.`,
    why: `The loss function *defines what the model considers good*. Everything else is machinery. If your loss treats all errors equally but your business does not, the model will optimise for something you never wanted — and it will do so very effectively.`,
    analogy: `A scoring system in a sport. Change the points awarded for a three-pointer and teams change how they play, immediately and permanently. The scoring rule shapes the behaviour far more than any coaching.`,
    technical: `Common losses:
- **MSE / MAE** — regression. MSE punishes large errors quadratically; MAE treats them linearly.
- **Cross-entropy** — classification. Punishes confident wrong answers very heavily, which is what encourages calibration.
- **Hinge** — margin-based classification (SVMs).

For language models, the pretraining loss is cross-entropy over the next token — the model is *only ever* penalised for mispredicting the next token. It is never penalised for being confidently wrong about a fact, which is a large part of why hallucination exists.

**Class weighting** in the loss is how you tell the model that missing a fraud costs more than a false alarm.`,
    diagram: `
   LOSS = "how wrong, as one number"

   MSE  ─ error²        │      ╱          large errors dominate
                        │    ╱
                        │  ╱
                        │╱
   MAE  ─ |error|       │    ╱            all errors proportional
                        │  ╱
                        │╱

   CROSS-ENTROPY — punishes confident wrongness

     true answer: "cat"
     predicted P(cat)=0.9   -> loss 0.11   fine
     predicted P(cat)=0.5   -> loss 0.69   meh
     predicted P(cat)=0.01  -> loss 4.61   severe

   WHY LLMs HALLUCINATE, IN ONE LINE

     pretraining loss = cross-entropy on the NEXT TOKEN

     The model is rewarded for producing text that looks like
     its training data. It is NEVER given a loss term for
     "this fact is false". Fluent and wrong scores well.`,
    example: {
      language: 'python',
      caption: 'Encoding a business cost asymmetry directly into the loss',
      code: `import numpy as np

def cross_entropy(y_true, p, eps=1e-12):
    p = np.clip(p, eps, 1 - eps)
    return -(y_true * np.log(p) + (1 - y_true) * np.log(1 - p))

# Confident and wrong is punished brutally — this is the point
for p in [0.99, 0.90, 0.50, 0.10, 0.01]:
    print(f"P(fraud)={p:<5}  actual=fraud  loss={cross_entropy(1, p):.3f}")
# P(fraud)=0.99  loss=0.010
# P(fraud)=0.50  loss=0.693
# P(fraud)=0.01  loss=4.605   <- confidently wrong

# WEIGHTED loss: a missed fraud costs 30x a false alarm.
# Say so in the loss, and the model will act on it.
def weighted_loss(y_true, p, w_pos=30.0, w_neg=1.0):
    w = np.where(y_true == 1, w_pos, w_neg)
    return (w * cross_entropy(y_true, p)).mean()

# In practice:
#   sklearn:  class_weight={0: 1, 1: 30}
#   pytorch:  nn.BCEWithLogitsLoss(pos_weight=torch.tensor([30.0]))
#
# If you do not encode the asymmetry, the model assumes there is none.`
    },
    prereq: ['what-is-ml'], next: ['gradient-descent'],
    related: ['classification', 'hallucination', 'pretraining', 'eval-thresholds-quality-gates'],
    tools: ['pytorch', 'python'],
    useCases: [
      'Encoding a business cost asymmetry so the model optimises for it.',
      'Explaining why a model behaves the way it does.',
      'Understanding why next-token training does not produce truthfulness.'
    ],
    avoid: [
      'Exotic custom losses before the standard one has been tried.',
      'A loss that does not reflect the actual cost of each error type.'
    ],
    mistakes: [
      'Leaving the default loss when errors have very different costs.',
      'Optimising a loss that diverges from the metric you report.',
      'Expecting a next-token loss to produce factual accuracy.',
      'Comparing loss values across different loss functions as though they were on one scale.'
    ],
    keyTerms: [
      ['loss function', 'A single number quantifying prediction error.'],
      ['objective function', 'What training minimises. Usually the loss plus regularisation.'],
      ['MSE / MAE', 'Squared and absolute error, for regression.'],
      ['cross-entropy', 'Standard classification loss; punishes confident wrongness.'],
      ['class weighting', 'Making errors on one class count more.'],
      ['next-token loss', 'The LLM pretraining objective. Predicts text, not truth.'],
      ['surrogate loss', 'A differentiable stand-in for a metric you cannot optimise directly.']
    ],
    resources: [
      ['PyTorch — loss functions', 'https://pytorch.org/docs/stable/nn.html#loss-functions', 'docs'],
      ['Google — descending into ML: training and loss', 'https://developers.google.com/machine-learning/crash-course/linear-regression/loss', 'course'],
      ['Dive into Deep Learning — linear regression', 'https://d2l.ai/chapter_linear-regression/index.html', 'course']
    ],
    questions: [
      ['Why is the loss function the most consequential design choice?', 'It defines what "good" means. The model will optimise it extremely effectively, so any gap between the loss and the real business cost is a gap the model will exploit.'],
      ['How does the pretraining loss relate to hallucination?', 'The loss is cross-entropy on the next token. The model is rewarded for producing plausible-looking text and never penalised for a false statement, so fluent and wrong scores well.'],
      ['How do you tell a model that one error type is worse?', 'Weight the loss by class — `class_weight` or `pos_weight`. Without it the model assumes both error types cost the same.']
    ]
  },

  {
    id: 'gradient-descent',
    title: 'Gradient Descent & Optimisation',
    domain: 'ml-fundamentals', tier: 2, priority: 'medium',
    summary: 'Nudging parameters downhill, repeatedly, until the loss stops falling.',
    what: `Gradient descent is how a model learns. Compute how the loss changes with respect to each parameter (the **gradient**), then move every parameter a small step in the direction that reduces loss. Repeat millions of times.`,
    why: `It explains why training takes hours rather than seconds, why the **learning rate** is the most important hyperparameter, and why training is not deterministic. It also demystifies the whole process: there is no reasoning happening, just a very long descent.`,
    analogy: `Descending a mountain in thick fog. You cannot see the valley. You can feel which way the ground slopes and step that way. Step too small and you are there all week; step too large and you leap over the valley to the opposite slope.`,
    technical: `The gradient is the vector of partial derivatives of the loss with respect to each parameter. **Backpropagation** computes it efficiently through a deep network using the chain rule.

**Learning rate** controls step size. Too high diverges; too low crawls or stalls. Learning-rate **schedules** (warmup then decay) are standard.

**Stochastic** gradient descent uses a small **batch** rather than all data per step — faster, and the noise helps escape poor minima. **Adam** adapts a per-parameter learning rate and is the default for deep learning.

An **epoch** is one full pass through the training data.`,
    diagram: `
   loss
     │╲
     │ ╲    ● start (random parameters)
     │  ╲  ╱
     │   ╲╱ ●
     │      ╲  ●
     │       ╲__● ● ●  converged
     └──────────────────► parameter value

   each ● is one step:  param -= learning_rate × gradient

   LEARNING RATE IS THE WHOLE GAME

   too small        ●●●●●●●●●●●●●●  never arrives
   just right       ●   ●  ● ● ●●   converges
   too large        ●        ●
                        ●        ●  diverges, loss -> NaN

   BATCH SIZE
     full batch    exact gradient, slow, memory-hungry
     mini-batch    noisy gradient, fast — the noise HELPS escape
                   shallow local minima
     batch of 1    very noisy, very slow in wall-clock terms

   epoch = one complete pass over the training data`,
    example: {
      language: 'python',
      caption: 'Gradient descent by hand, so nothing is mysterious',
      code: `# Fit y = w*x + b by gradient descent, from scratch.
xs = [1, 2, 3, 4, 5]
ys = [3, 5, 7, 9, 11]        # the true relationship is y = 2x + 1

w, b = 0.0, 0.0
lr = 0.01                     # THE hyperparameter

for epoch in range(1001):
    # forward: predict
    preds = [w * x + b for x in xs]

    # loss: mean squared error
    loss = sum((p - y) ** 2 for p, y in zip(preds, ys)) / len(xs)

    # backward: how does the loss change with w and with b?
    dw = sum(2 * (p - y) * x for p, y, x in zip(preds, ys, xs)) / len(xs)
    db = sum(2 * (p - y)     for p, y    in zip(preds, ys))     / len(xs)

    # step downhill
    w -= lr * dw
    b -= lr * db

    if epoch % 250 == 0:
        print(f"epoch {epoch:>4}  loss {loss:>8.4f}  w {w:.3f}  b {b:.3f}")

# epoch    0  loss  57.0000  w 0.660  b 0.140
# epoch  250  loss   0.0842  w 2.118  b 0.574
# epoch  500  loss   0.0121  w 2.045  b 0.837
# epoch 1000  loss   0.0002  w 2.006  b 0.978   -> found y = 2x + 1
#
# An LLM is this, with billions of parameters and a much
# cleverer optimiser. The idea does not change.`
    },
    prereq: ['loss-functions'], next: ['neural-networks'],
    related: ['parameters-weights', 'pretraining', 'training-vs-inference'],
    tools: ['pytorch'],
    useCases: [
      'Understanding why training runs take the time and money they do.',
      'Interpreting a training curve that has plateaued or diverged.',
      'Reasoning about fine-tuning cost and duration.'
    ],
    avoid: [
      'You will not implement this. It is background for reading training discussions.'
    ],
    mistakes: [
      'Assuming training is deterministic. Random initialisation and batch order make runs differ.',
      'Blaming the model when the learning rate was wrong.',
      'Believing the optimiser finds the global optimum. It finds a good enough local one.',
      'Confusing an epoch with a step.'
    ],
    keyTerms: [
      ['gradient', 'The direction and rate of steepest increase of the loss.'],
      ['backpropagation', 'Efficiently computing gradients through a deep network.'],
      ['learning rate', 'Step size. The most important hyperparameter.'],
      ['epoch', 'One full pass over the training data.'],
      ['batch', 'The subset of examples used for one update step.'],
      ['SGD', 'Stochastic gradient descent — updates from mini-batches.'],
      ['Adam', 'Adaptive optimiser; the default for deep learning.'],
      ['local minimum', 'A low point that is not the lowest. Usually good enough.'],
      ['convergence', 'The loss ceasing to fall meaningfully.']
    ],
    resources: [
      ['3Blue1Brown — gradient descent, how neural networks learn', 'https://www.youtube.com/watch?v=IHZwWFHWa-w', 'video'],
      ['Google — reducing loss: gradient descent', 'https://developers.google.com/machine-learning/crash-course/linear-regression/gradient-descent', 'course'],
      ['PyTorch — optimisation tutorial', 'https://pytorch.org/tutorials/beginner/basics/optimization_tutorial.html', 'docs'],
      ['Distill — why momentum really works', 'https://distill.pub/2017/momentum/', 'paper']
    ],
    questions: [
      ['Why is the learning rate the most important hyperparameter?', 'Too large and the loss diverges to NaN; too small and training never converges in reasonable time. Most failed training runs are a learning-rate problem rather than a model problem.'],
      ['Why is training not deterministic?', 'Random initialisation, random batch ordering and non-deterministic GPU operations mean two runs with identical settings produce slightly different models.'],
      ['What is the difference between an epoch and a step?', 'A step is one parameter update from one batch. An epoch is a complete pass over the training data, which is many steps.']
    ]
  },

  {
    id: 'neural-networks',
    title: 'Neural Networks',
    domain: 'ml-fundamentals', tier: 2, priority: 'high',
    summary: 'Layers of weighted sums and non-linearities — the architecture underneath everything modern.',
    what: `A neural network is a stack of layers. Each layer multiplies its inputs by learned **weights**, adds a **bias**, and applies a non-linear **activation**. The output of one layer feeds the next.

That is genuinely all it is. The sophistication comes from scale and from how the layers are wired.`,
    why: `Every model you will discuss — image classifiers, embedding models, LLMs — is this structure. Knowing that "parameters" are just the weights and biases makes "7 billion parameters" a concrete statement about memory rather than a mystical number.`,
    analogy: `A committee of assistants. Each looks at the inputs, weights them according to what it has learned to care about, and passes a summary up. The next committee combines those summaries. By the top, complex judgements have been assembled out of very simple opinions.`,
    technical: `A single **neuron** computes \`activation(w · x + b)\`. A **dense layer** is many neurons in parallel; matrix multiplication does them all at once, which is why GPUs are the hardware of choice.

Architectures specialise the wiring: **CNNs** share weights across spatial positions for images; **RNNs** carry a state across a sequence; **Transformers** use attention to let every position look at every other, which is what made LLMs possible.

**Parameter count** is the total number of weights and biases. It directly determines memory: at 16-bit precision, roughly 2 bytes per parameter, so a 7B model needs about 14GB just to hold the weights.`,
    diagram: `
   ONE NEURON
                    w1
        x1 ─────────────┐
                    w2   ├──► Σ ──► activation ──► output
        x2 ─────────────┤       + b
                    w3   │
        x3 ─────────────┘

   A LAYER = many neurons in parallel = one matrix multiply
   A NETWORK = layers stacked

   input        hidden 1       hidden 2       output
     ○ ──┐       ○ ──┐          ○ ──┐          ○
     ○ ──┼──►    ○ ──┼──►       ○ ──┼──►       ○
     ○ ──┤       ○ ──┤          ○ ──┘
     ○ ──┘       ○ ──┘

   PARAMETERS = all the w's and b's

     layer with 1024 inputs and 1024 outputs
       = 1024 × 1024 weights + 1024 biases
       ≈ 1.05 million parameters

     7B model at FP16 -> 7e9 × 2 bytes ≈ 14 GB of weights alone
     ...which is exactly why quantization exists.`,
    example: {
      language: 'python',
      caption: 'A network from scratch, then the same thing in PyTorch',
      code: `import numpy as np

def relu(x): return np.maximum(0, x)

def forward(x, params):
    """A 3-layer network. Every modern model is this, scaled up."""
    h = relu(x @ params["W1"] + params["b1"])     # layer 1
    h = relu(h @ params["W2"] + params["b2"])     # layer 2
    return h @ params["W3"] + params["b3"]        # output (no activation)

rng = np.random.default_rng(0)
params = {
    "W1": rng.normal(0, 0.1, (4, 16)), "b1": np.zeros(16),
    "W2": rng.normal(0, 0.1, (16, 16)),"b2": np.zeros(16),
    "W3": rng.normal(0, 0.1, (16, 1)), "b3": np.zeros(1),
}
total = sum(v.size for v in params.values())
print(f"{total} parameters")              # 401 parameters

# The same thing, in the library everyone actually uses
import torch.nn as nn
model = nn.Sequential(
    nn.Linear(4, 16), nn.ReLU(),
    nn.Linear(16, 16), nn.ReLU(),
    nn.Linear(16, 1),
)
print(sum(p.numel() for p in model.parameters()))   # 401

# Scale the same idea to 7,000,000,000 parameters, swap dense
# layers for attention blocks, and you have an LLM.`
    },
    prereq: ['gradient-descent', 'what-is-deep-learning'], next: ['activation-functions'],
    related: ['transformers', 'parameters-weights', 'model-size-parameters'],
    tools: ['pytorch', 'transformers'],
    useCases: [
      'Understanding what "7B parameters" means for memory and cost.',
      'Following an architecture discussion without losing the thread.',
      'Reasoning about why GPUs are required.'
    ],
    avoid: [
      'Small tabular datasets — trees usually win.',
      'When you need per-decision explainability for a regulator.'
    ],
    mistakes: [
      'Believing neurons resemble biological neurons in any meaningful way.',
      'Assuming more parameters is always better — data and architecture matter more.',
      'Forgetting that inference memory exceeds weight memory, because activations and the KV cache also occupy space.'
    ],
    keyTerms: [
      ['neuron', 'One weighted sum plus a bias plus an activation.'],
      ['weight', 'A learned multiplier on an input.'],
      ['bias', 'A learned constant added to the weighted sum.'],
      ['dense / fully-connected layer', 'Every input connects to every output.'],
      ['forward pass', 'Computing the output from an input.'],
      ['parameter count', 'Total weights and biases. Determines memory.'],
      ['CNN / RNN / Transformer', 'Architectures for images, sequences, and attention-based models.'],
      ['GPU', 'Hardware built for the parallel matrix multiplies these layers require.']
    ],
    resources: [
      ['3Blue1Brown — but what is a neural network?', 'https://www.youtube.com/watch?v=aircAruvnKk', 'video'],
      ['PyTorch — build the neural network', 'https://pytorch.org/tutorials/beginner/basics/buildmodel_tutorial.html', 'docs'],
      ['TensorFlow Playground', 'https://playground.tensorflow.org/', 'interactive'],
      ['Neural Networks and Deep Learning (free book)', 'http://neuralnetworksanddeeplearning.com/', 'course']
    ],
    questions: [
      ['What exactly is a "parameter"?', 'A single learned number — a weight or a bias — inside the network. The parameter count is simply how many of those numbers there are, which directly determines memory.'],
      ['Why does a 7B model need roughly 14GB of memory?', 'At 16-bit precision each parameter takes 2 bytes, so 7 billion parameters is about 14GB for the weights alone, before activations and the KV cache.'],
      ['Why are GPUs necessary?', 'A layer is a large matrix multiplication, and GPUs perform thousands of those operations in parallel. CPUs do them sequentially and are orders of magnitude slower.']
    ]
  },

  {
    id: 'activation-functions',
    title: 'Activation Functions',
    domain: 'ml-fundamentals', tier: 3, priority: 'low',
    summary: 'The non-linearity that makes depth meaningful.',
    what: `An activation function is applied to each neuron's output. It is non-linear, and that non-linearity is what allows stacked layers to represent complex relationships.`,
    why: `Without it, a hundred-layer network is algebraically identical to a one-layer network. Every ounce of representational power that depth provides comes from this one component.`,
    analogy: `A decision threshold in a chain of approvals. If every approver simply forwarded a scaled version of the request, the chain would be equivalent to a single approver. Because each can say "no, stop here", the chain can express far more complex policies.`,
    technical: `- **ReLU** — \`max(0, x)\`. Simple, fast, the workhorse. Can "die" if a neuron always outputs zero.
- **GELU / SiLU (Swish)** — smooth variants; standard in transformers.
- **Sigmoid** — squashes to (0,1). Used for binary output probability; poor in hidden layers because gradients vanish.
- **Tanh** — squashes to (−1,1); zero-centred.
- **Softmax** — not really an activation but an output layer: turns a vector of scores into a probability distribution. This is exactly the step that turns LLM **logits** into next-token probabilities.

The **vanishing gradient** problem — sigmoid and tanh flattening at the extremes so gradients approach zero — is what held back deep networks before ReLU.`,
    diagram: `
   ReLU  max(0,x)        GELU (smooth)       SIGMOID
        │    ╱                │    ╱              │   ___
        │   ╱                 │   ╱               │  ╱
   ─────┼──╱────         ─────┼──╱────       ─────┼─╱──────
        │╱                    │ ╱                 │╱
                            ‾‾                 ___╱

   fast, standard        transformers       output layer only:
   in most nets                             gradients vanish
                                            in hidden layers

   SOFTMAX — the LLM's final step

   logits    [2.1, 0.4, 3.8, -1.2]     raw, unbounded scores
      │
      ▼  exp, then normalise
   probs     [0.14, 0.03, 0.81, 0.01]  sums to 1.0
      │
      ▼  sample (temperature controls how)
   next token: "the"

   WHY NON-LINEARITY IS ESSENTIAL
     linear(linear(x)) = linear(x)     depth bought nothing
     relu(linear(x))   ≠ linear(x)     depth now means something`,
    example: {
      language: 'python',
      caption: 'Softmax, and how temperature reshapes it',
      code: `import numpy as np

def softmax(logits, temperature=1.0):
    z = np.array(logits, dtype=float) / temperature
    z = z - z.max()                    # numerical stability
    e = np.exp(z)
    return e / e.sum()

logits = [2.1, 0.4, 3.8, -1.2]        # raw scores for 4 candidate tokens

for T in [0.2, 0.7, 1.0, 2.0]:
    p = softmax(logits, T)
    print(f"T={T:<4} {np.round(p, 3)}  top={p.max():.2f}")

# T=0.2  [0.000 0.000 1.000 0.000]  top=1.00   near-deterministic
# T=0.7  [0.077 0.008 0.915 0.000]  top=0.91
# T=1.0  [0.152 0.028 0.818 0.006]  top=0.82   the raw distribution
# T=2.0  [0.271 0.116 0.605 0.052]  top=0.61   flatter, more random
#
# This is exactly the knob "temperature" turns in an LLM API.
# Low T -> repeatable, safe.  High T -> varied, riskier.

def relu(x): return np.maximum(0, x)
def gelu(x): return 0.5 * x * (1 + np.tanh(np.sqrt(2/np.pi) * (x + 0.044715*x**3)))
print(relu(np.array([-2., -0.5, 0.5, 2.])))  # [0.  0.  0.5 2. ]
print(np.round(gelu(np.array([-2., -0.5, 0.5, 2.])), 3))  # [-0.045 -0.154 0.345 1.955]`
    },
    prereq: ['neural-networks'], next: [],
    related: ['logits-and-softmax', 'temperature-sampling', 'transformers'],
    tools: ['pytorch'],
    useCases: [
      'Understanding how logits become probabilities in an LLM.',
      'Explaining what the temperature parameter actually does.',
      'Following an architecture description.'
    ],
    avoid: [
      'You will not choose these. This is background for reading.'
    ],
    mistakes: [
      'Using sigmoid in hidden layers of a deep network and hitting vanishing gradients.',
      'Confusing softmax output with calibrated confidence — it sums to 1 regardless of whether the model knows anything.',
      'Believing a high softmax probability means the answer is correct.'
    ],
    keyTerms: [
      ['activation function', 'The non-linearity applied to a neuron’s output.'],
      ['ReLU', 'max(0, x). The default in most networks.'],
      ['GELU / SiLU', 'Smooth activations standard in transformers.'],
      ['sigmoid', 'Squashes to (0,1). Output layers only.'],
      ['softmax', 'Turns scores into a probability distribution that sums to 1.'],
      ['vanishing gradient', 'Gradients shrinking to nothing through deep saturating layers.'],
      ['logits', 'The raw, unnormalised scores before softmax.']
    ],
    resources: [
      ['PyTorch — non-linear activations', 'https://pytorch.org/docs/stable/nn.html#non-linear-activations-weighted-sum-nonlinearity', 'docs'],
      ['Google — neural networks: activation functions', 'https://developers.google.com/machine-learning/crash-course/neural-networks/activation-functions', 'course'],
      ['GELU (paper)', 'https://arxiv.org/abs/1606.08415', 'paper']
    ],
    questions: [
      ['Why does a network without activations gain nothing from depth?', 'Composing linear functions yields a linear function, so a hundred linear layers are algebraically equivalent to one. The non-linearity is the entire source of representational power.'],
      ['What does softmax do in an LLM?', 'It converts the raw logits over the vocabulary into a probability distribution summing to 1, from which the next token is sampled.'],
      ['Why is a high softmax probability not the same as being correct?', 'Softmax always produces a normalised distribution regardless of whether the model has any real knowledge. Confidence and accuracy are separate properties.']
    ]
  },

  {
    id: 'training-vs-inference',
    title: 'Training vs Inference',
    domain: 'ml-fundamentals', tier: 1, priority: 'high',
    summary: 'Learning once versus answering every time — completely different costs and risks.',
    what: `**Training** is when the model's parameters are adjusted from data. **Inference** is when a trained model is used to produce an answer. During inference the parameters do not change at all.`,
    why: `This one distinction resolves a surprising number of misconceptions. The model does not learn from your users' conversations. Your prompt does not permanently affect it. And the cost profiles are opposite: training is a large one-off, inference is a small charge repeated forever — and it is inference that determines your gross margin.`,
    analogy: `Writing a textbook versus reading it. Writing takes years and a team. Reading takes an afternoon and changes the book not at all. A thousand people reading it does not revise a single page.`,
    technical: `Training runs a forward pass, computes loss, runs a backward pass and updates weights. It needs the full computational graph in memory, which is why training memory far exceeds inference memory.

Inference runs only the forward pass. For LLMs it is **autoregressive**: one token at a time, each fed back in, with a **KV cache** so earlier tokens are not recomputed.

Cost structure: training is capital expenditure — large, once, predictable. Inference is operating expenditure — small per request, scaling directly with usage. At scale, total inference spend routinely dwarfs training spend, and it is the number that decides whether the feature has a viable margin.`,
    diagram: `
   TRAINING (once)                  INFERENCE (every request)

   huge dataset                     one prompt
        │                                │
        ▼                                ▼
   forward pass                     forward pass
        │                                │
   compute loss                     sample next token
        │                                │
   backward pass                    append, repeat
        │                                │
   ► UPDATE WEIGHTS ◄               ► WEIGHTS UNCHANGED ◄

   weeks · thousands of GPUs        milliseconds · one GPU
   CAPEX, once                      OPEX, forever

   THE MISCONCEPTION THIS KILLS

   "The model learned from our conversation."
   It did not. Nothing was written back. The apparent memory
   is the conversation history being RESENT in the context
   window on every single call — which is also why long
   chats cost more per message.

   WHERE THE MONEY ACTUALLY GOES
     training a frontier model    $10M-$100M+, once, not by you
     your inference bill          $0.003/request × 40M/month, forever
                                  ^ this is your gross margin`,
    example: {
      language: 'python',
      caption: 'Why the second message in a chat costs more than the first',
      code: `PRICE_IN  = 3.00 / 1_000_000     # $ per input token
PRICE_OUT = 15.00 / 1_000_000    # $ per output token

SYSTEM = 600                      # system prompt, resent every turn
CONTEXT = 2_400                   # retrieved RAG chunks, resent every turn

conversation = 0
total = 0.0
for turn in range(1, 6):
    user_tokens = 80
    reply_tokens = 220

    # EVERYTHING is resent each turn — the model has no memory of its own
    input_tokens = SYSTEM + CONTEXT + conversation + user_tokens
    cost = input_tokens * PRICE_IN + reply_tokens * PRICE_OUT
    total += cost
    conversation += user_tokens + reply_tokens      # history grows

    print(f"turn {turn}: {input_tokens:>6,} in  {reply_tokens} out  "
          f"\${cost:.5f}   running \${total:.5f}")

# turn 1:  3,080 in  220 out  $0.01254   running $0.01254
# turn 2:  3,380 in  220 out  $0.01344   running $0.02598
# turn 3:  3,680 in  220 out  $0.01434   running $0.04032
# turn 4:  3,980 in  220 out  $0.01524   running $0.05556
# turn 5:  4,280 in  220 out  $0.01614   running $0.07170
#
# Cost per turn rises even though the user typed the same amount.
# Nothing was learned. The history is simply re-read every time.`
    },
    prereq: ['what-is-ml'], next: [],
    related: ['inference-llm', 'ai-cost', 'context-window', 'pretraining'],
    tools: ['pytorch', 'ollama', 'vllm'],
    useCases: [
      'Explaining to stakeholders that the model does not learn from users.',
      'Modelling the cost of an AI feature before committing to it.',
      'Understanding why a long conversation gets more expensive per message.'
    ],
    avoid: [
      'Conflating the two when discussing cost. They are entirely different budgets.'
    ],
    mistakes: [
      'Believing the model learns from production conversations.',
      'Budgeting only for training and being surprised by the inference bill.',
      'Assuming a longer context is free — every token is re-read and re-charged.',
      'Promising personalisation that would actually require fine-tuning or retrieval.'
    ],
    keyTerms: [
      ['training', 'Adjusting parameters from data.'],
      ['inference', 'Using a trained model. Parameters are read-only.'],
      ['forward pass', 'Input to output. Used in both, but only training adds a backward pass.'],
      ['autoregressive', 'Generating one token at a time, feeding each back in.'],
      ['KV cache', 'Stored attention keys and values so earlier tokens are not recomputed.'],
      ['CAPEX vs OPEX', 'One-off training investment versus ongoing per-request cost.'],
      ['cold start', 'The delay while a model is loaded into memory before serving.']
    ],
    resources: [
      ['Hugging Face — LLM inference optimisation', 'https://huggingface.co/docs/transformers/llm_optims', 'docs'],
      ['Anthropic — pricing', 'https://docs.anthropic.com/en/docs/about-claude/pricing', 'docs'],
      ['Anthropic — prompt caching', 'https://docs.anthropic.com/en/docs/build-with-claude/prompt-caching', 'docs']
    ],
    questions: [
      ['Does a model learn from user conversations?', 'No. Inference is read-only; the parameters never change. The apparent memory is the conversation history being resent in the context window on every call.'],
      ['Why does the fifth message in a chat cost more than the first?', 'The whole history is resent as input tokens each turn, so the input grows every message even though the user typed the same amount.'],
      ['Which cost matters more for a product’s margin?', 'Inference. Training is a one-off you usually do not pay at all; inference is a per-request charge that scales with usage and directly determines gross margin.']
    ],
    interview: {
      s30: 'Training is when the model’s weights change; inference is when a trained model answers, with weights frozen. Nothing your users say is written back into the model.',
      s90: 'The distinction resolves two things people get wrong. First, the model does not learn from conversations — what looks like memory is the history being resent in the context window every call, which is also why the fifth message costs more than the first even though the user typed the same amount. Second, the cost profiles are opposite. Training is capital expenditure, large and one-off, and for most teams somebody else already paid it. Inference is operating expenditure, small per request and repeated forever, and it scales directly with usage. When I evaluate an AI feature, the inference cost per request times expected volume is the number that decides whether there is a viable margin — not the model’s benchmark score.',
      pm: 'It is the difference between a one-time bill and a permanent line item on gross margin, and it stops me promising personalisation that the architecture cannot deliver.'
    }
  }
];
