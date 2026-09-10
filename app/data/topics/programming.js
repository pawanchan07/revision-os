/**
 * DOMAIN A — PROGRAMMING FOUNDATIONS (BUILD.md section 4)
 * Goal: not to become a software engineer, but to read AI code, change it,
 * debug it, understand what a coding agent produced, and prototype.
 */
export const topics = [
  {
    id: 'what-is-programming',
    title: 'What Programming Actually Is',
    domain: 'programming', tier: 1, priority: 'high',
    summary: 'Writing precise instructions a computer follows literally, in order, without guessing what you meant.',
    what: `Programming is writing down a sequence of instructions precisely enough that a machine can follow them without asking questions.

The computer has no common sense. It does exactly what you wrote, in the order you wrote it. Every bug you will ever see comes from a gap between what you meant and what you actually wrote.`,
    why: `You do not need to build production systems. You need programming for four things:

**Reading** — when an engineer or a coding agent shows you 40 lines of Python, you should know what it does.
**Changing** — swapping a model name, a chunk size, or a file path should not require asking someone.
**Debugging** — being able to read an error message and form a hypothesis.
**Prototyping** — proving an idea is worth building before asking a team to build it.`,
    analogy: `A recipe written for someone with perfect memory and zero intuition. "Add salt to taste" is meaningless to them. "Add 4 grams of salt, stir for 30 seconds" works. A program is a recipe with every ambiguity removed.`,
    technical: `Source code is text. An interpreter (Python) or compiler (C, Rust) translates it into instructions the CPU executes. Python is *interpreted*: you run \`python script.py\` and it executes line by line, top to bottom, unless a construct (a function call, a loop, a condition) redirects the flow.

Three ideas cover most of what you will read: **state** (values held in variables), **control flow** (which line runs next) and **abstraction** (naming a chunk of behaviour so you can reuse it).`,
    diagram: `
   YOU WRITE            PYTHON READS           CPU RUNS
   ----------           ------------           --------
   script.py    ---->   line by line   ---->   machine
                        top to bottom          instructions
                             |
                        control flow can jump:
                             |
                        +----+----+----+
                        |    |    |    |
                       if  loop  func  error
                        |    |    |    |
                        +----+----+----+
                             |
                        back to the next line`,
    example: {
      language: 'python',
      caption: 'Everything below is state, control flow and abstraction',
      code: `# state: three named values
question = "What is RAG?"
chunks   = ["RAG retrieves documents.", "Cats are mammals."]
answers  = []

# abstraction: a named, reusable chunk of behaviour
def is_relevant(chunk, question):
    return "RAG" in chunk

# control flow: do something once per chunk
for chunk in chunks:
    if is_relevant(chunk, question):
        answers.append(chunk)

print(answers)   # ['RAG retrieves documents.']`
    },
    prereq: [], next: ['variables', 'data-types'],
    related: ['debugging', 'git-basics'],
    tools: ['python', 'vscode'],
    useCases: [
      'Reading a RAG script an engineer or coding agent wrote and knowing what each block does.',
      'Changing a constant (model name, chunk size, top-k) and re-running it yourself.',
      'Turning a vague product idea into a 40-line prototype you can actually demo.'
    ],
    avoid: [
      'When the answer is a SQL query — use SQL, not a Python loop over rows.',
      'When a no-code tool genuinely solves it and nobody will maintain the script.',
      'When you are trying to prove you can code rather than trying to learn something.'
    ],
    mistakes: [
      'Believing you must memorise syntax. You look syntax up forever; you do not look up *concepts*.',
      'Reading tutorials without running anything. Understanding comes from breaking code, not watching it.',
      'Assuming the computer inferred what you meant. It never does.'
    ],
    keyTerms: [
      ['source code', 'The text you write — a plain file, nothing magic about it.'],
      ['interpreter', 'The program that reads your Python line by line and executes it.'],
      ['runtime', 'The period while your program is actually running, as opposed to when it is being written.'],
      ['state', 'All the values your program is currently holding in memory.'],
      ['control flow', 'The rule deciding which line executes next.'],
      ['abstraction', 'Giving a name to a piece of behaviour so it can be reused and reasoned about.'],
      ['script', 'A single file you run start-to-finish, as opposed to a long-running application.']
    ],
    resources: [
      ['The Python Tutorial — official', 'https://docs.python.org/3/tutorial/', 'docs'],
      ['Python for Everybody (free course)', 'https://www.py4e.com/lessons', 'course'],
      ['W3Schools Python — quick reference', 'https://www.w3schools.com/python/', 'tutorial'],
      ['Python Tutor — visualise execution step by step', 'https://pythontutor.com/', 'interactive'],
      ['Automate the Boring Stuff (free online)', 'https://automatetheboringstuff.com/', 'course']
    ],
    questions: [
      ['Why does a computer never "figure out what you meant"?', 'Because it only executes the instructions given. There is no inference layer between your text and execution — any apparent intelligence comes from code someone wrote explicitly.'],
      ['What are the three ideas that cover most code you will read?', 'State (values in variables), control flow (which line runs next), and abstraction (naming reusable behaviour).'],
      ['Why is "reading code" more valuable to you than "writing code"?', 'Most of your interaction with code is verifying what a system does, evaluating what an agent produced, and understanding trade-offs an engineer is describing. All of those are reading tasks.'],
      ['Python is interpreted. What does that mean practically?', 'There is no separate build step. You run the file directly and it executes top to bottom, so errors appear at the line they occur rather than before you start.']
    ],
    interview: {
      s30: 'Programming is writing instructions precise enough that a machine can follow them without interpretation. I use it to read and modify AI code rather than to build production systems.',
      s90: 'I treat programming as literacy rather than a craft I need to master. Three concepts cover most of what I read: state, control flow and abstraction. That is enough to open a RAG script, see that it loads documents, chunks them, embeds them and queries a vector store, and to know which constant to change if retrieval looks wrong. It also means when a coding agent hands me 200 lines, I can tell whether it did what I asked.',
      pm: 'It removes a translation layer. I can look at what was actually built rather than relying entirely on a summary, and I can prototype an idea before spending a team sprint on it.'
    }
  },

  {
    id: 'variables',
    title: 'Variables',
    domain: 'programming', tier: 1, priority: 'high',
    summary: 'A name pointing at a value, so you can refer to it later without repeating it.',
    what: `A variable is a name attached to a value. You write \`chunk_size = 500\` and from then on the word \`chunk_size\` means 500.

That is the whole idea. The value can change; the name stays.`,
    why: `Two reasons. First, **reuse** — write the value once, use it in ten places, change it in one. Second, **meaning** — \`500\` tells you nothing, \`chunk_size = 500\` tells you everything. Most of a variable's value is the name, not the storage.`,
    analogy: `A luggage tag. The tag says "Pavan's bag". The bag can be swapped for a different bag; the tag still points at whatever bag is currently attached. You talk about "Pavan's bag", not "the third grey bag on the left".`,
    technical: `In Python a variable is a *binding* from a name to an object in memory, not a box holding a value. \`a = [1,2]; b = a\` makes both names point at the *same list*, so \`b.append(3)\` changes what \`a\` sees. This surprises people constantly.

Assignment (\`=\`) rebinds the name. Comparison (\`==\`) asks whether two values are equal. \`is\` asks whether two names point at the same object.`,
    diagram: `
   NAME                 OBJECT IN MEMORY

   chunk_size  ------>  500

   a  --------\\
               >------>  [1, 2, 3]      one list, two names
   b  --------/

   b.append(4)  ->  a is now [1, 2, 3, 4] too`,
    example: {
      language: 'python',
      caption: 'Naming carries the meaning',
      code: `# unreadable
x = 500
y = 50
z = x - y

# readable — same computation, far more meaning
chunk_size    = 500
chunk_overlap = 50
stride        = chunk_size - chunk_overlap   # 450

# the shared-object gotcha
a = [1, 2]
b = a
b.append(3)
print(a)        # [1, 2, 3]  <- a changed too

c = a.copy()    # an independent copy
c.append(9)
print(a)        # [1, 2, 3]  <- unchanged`
    },
    prereq: ['what-is-programming'], next: ['data-types'],
    related: ['functions', 'env-vars'],
    tools: ['python'],
    useCases: [
      'Naming every configuration value at the top of a script so it can be tuned in one place.',
      'Holding intermediate results while a pipeline runs.',
      'Making code self-documenting so a reviewer does not have to guess what a number means.'
    ],
    avoid: [
      'For values that must never change and are shared across files — use a constant or a config file.',
      'For secrets — those belong in environment variables, never hard-coded.'
    ],
    mistakes: [
      'Assuming `b = a` copies a list or dictionary. It does not; both names point at the same object.',
      'Single-letter names (`x`, `df2`, `tmp`) — the code works and nobody, including you, can read it later.',
      'Confusing `=` (assign) with `==` (compare).'
    ],
    keyTerms: [
      ['assignment', 'Attaching a name to a value with `=`.'],
      ['binding', 'The link between a name and an object in memory.'],
      ['mutable', 'A value that can be changed in place — lists, dicts, sets.'],
      ['immutable', 'A value that cannot be changed in place — strings, numbers, tuples.'],
      ['scope', 'The region of code where a name is visible.'],
      ['constant', 'A value intended never to change; by convention written IN_UPPER_CASE.']
    ],
    resources: [
      ['Python Tutorial — an informal introduction', 'https://docs.python.org/3/tutorial/introduction.html', 'docs'],
      ['Real Python — variables in Python', 'https://realpython.com/python-variables/', 'tutorial'],
      ['Python Tutor — watch bindings change live', 'https://pythontutor.com/', 'interactive']
    ],
    questions: [
      ['What does `b = a` do when `a` is a list?', 'It creates a second name pointing at the same list object. Mutating through either name is visible through both. Use `a.copy()` for an independent list.'],
      ['Why is naming the most valuable part of a variable?', 'The storage is trivial; the name is what makes the code readable and reviewable months later.'],
      ['What is the difference between `=`, `==` and `is`?', '`=` assigns a name to a value, `==` tests whether two values are equal, `is` tests whether two names point at the same object in memory.']
    ]
  },

  {
    id: 'data-types',
    title: 'Data Types',
    domain: 'programming', tier: 1, priority: 'high',
    summary: 'What kind of thing a value is — which decides what you are allowed to do with it.',
    what: `Every value has a type: a number, some text, a true/false flag, a list of things, and so on. The type decides what operations are legal. You can subtract two numbers; you cannot subtract two sentences.`,
    why: `Most beginner errors are type errors in disguise. \`"5" + 5\` fails because one is text and one is a number. When an API returns \`"top_k": "5"\` instead of \`"top_k": 5\`, something downstream breaks. Knowing types turns a baffling error into an obvious one.`,
    analogy: `Units in physics. You can add 3 metres to 5 metres. You cannot add 3 metres to 5 kilograms. The number alone is not enough — the *kind* of thing matters.`,
    technical: `Python is **dynamically typed** (a name can point at any type, and the type is checked at runtime) and **strongly typed** (it refuses to silently coerce a string into a number).

Core built-ins: \`int\`, \`float\`, \`str\`, \`bool\`, \`list\`, \`tuple\`, \`set\`, \`dict\`, \`None\`. \`type(x)\` tells you what something is; \`isinstance(x, str)\` tests it.

Type *hints* (\`def f(n: int) -> str:\`) document intent. They are not enforced at runtime — they exist for readers and for tools like mypy.`,
    diagram: `
                     PYTHON VALUES

   SCALARS                    COLLECTIONS
   -------                    -----------
   int    42                  list   [1, 2, 3]      ordered, changeable
   float  3.14                tuple  (1, 2, 3)      ordered, fixed
   str    "hello"             set    {1, 2, 3}      unordered, unique
   bool   True / False        dict   {"k": "v"}     key -> value
   None   (absence)

   type(x)          -> what kind is this?
   isinstance(x, T) -> is this a T?`,
    example: {
      language: 'python',
      caption: 'The classic type error, and the fix',
      code: `top_k = "5"                 # came from a config file as text

# print(top_k + 1)          # TypeError: can only concatenate str to str

top_k = int(top_k)          # convert once, at the boundary
print(top_k + 1)            # 6

print(type(top_k))          # <class 'int'>
print(isinstance(top_k, int))  # True

# None means "no value yet" — it is not zero and not empty string
answer = None
if answer is None:
    print("nothing retrieved yet")`
    },
    prereq: ['variables'], next: ['strings', 'numbers', 'lists', 'dictionaries'],
    related: ['json', 'sql-data-types'],
    tools: ['python'],
    useCases: [
      'Reading an error message and immediately spotting a string where a number was expected.',
      'Converting config values at the point they enter the program, so the rest of the code is clean.',
      'Understanding why an API rejected your request payload.'
    ],
    avoid: [
      'Do not scatter conversions everywhere — convert once, at the boundary where data enters.',
      'Do not use `float` for money. Rounding errors accumulate; use integers of cents or `Decimal`.'
    ],
    mistakes: [
      'Comparing to `None` with `==` instead of `is None`.',
      'Assuming `"0"`, `0` and `False` are interchangeable. `"0"` is truthy — it is a non-empty string.',
      'Trusting that JSON numbers arrive as numbers. They often arrive as strings.'
    ],
    keyTerms: [
      ['dynamic typing', 'The type belongs to the value, not the name, and is checked while running.'],
      ['strong typing', 'Python refuses to silently mix incompatible types.'],
      ['type casting', 'Explicit conversion — `int("5")`, `str(5)`, `float("3.1")`.'],
      ['truthy / falsy', 'Values treated as True or False in a condition. Empty things are falsy; `"0"` is truthy.'],
      ['None', 'Python’s explicit "no value". Distinct from 0, "" and False.'],
      ['type hint', 'Optional annotation documenting the intended type; not enforced at runtime.']
    ],
    resources: [
      ['Python built-in types — official reference', 'https://docs.python.org/3/library/stdtypes.html', 'docs'],
      ['Real Python — basic data types', 'https://realpython.com/python-data-types/', 'tutorial'],
      ['typing module — type hints', 'https://docs.python.org/3/library/typing.html', 'docs']
    ],
    questions: [
      ['Why does `"5" + 5` fail in Python but work in JavaScript?', 'Python is strongly typed and refuses to silently coerce. JavaScript coerces, which hides bugs. Python’s failure is a feature.'],
      ['What is the difference between `None`, `0`, `""` and `False`?', 'All four are falsy in conditions, but they are different values. `None` means "no value", `0` is a number, `""` is an empty string, `False` is a boolean.'],
      ['Where should type conversion happen?', 'At the boundary — where data enters from a file, an API or user input. Converting mid-pipeline scatters the same logic everywhere.']
    ]
  },

  {
    id: 'strings',
    title: 'Strings',
    domain: 'programming', tier: 1, priority: 'high',
    summary: 'Text. The type almost every prompt, chunk, document and API response is made of.',
    what: `A string is a sequence of characters: \`"hello"\`. In AI work almost everything is a string — the prompt you send, the answer you get back, every chunk in a vector store, every document you parse.`,
    why: `You will spend more time manipulating strings than anything else. Cleaning text, splitting documents, building prompts from templates, stripping whitespace out of a scraped page — all string work. Bad string handling is the single most common cause of a bad RAG pipeline.`,
    analogy: `A necklace of beads. Each bead is a character, the order matters, and you can count them, cut the necklace at a point, or join two necklaces together — but you cannot change one bead in place. You make a new necklace.`,
    technical: `Python strings are **immutable** sequences of Unicode characters. Every "modification" returns a new string.

Key operations: \`len\`, indexing \`s[0]\`, slicing \`s[0:10]\`, \`.strip()\`, \`.lower()\`, \`.split()\`, \`.join()\`, \`.replace()\`, \`in\` for substring tests, and f-strings for interpolation: \`f"Answer: {result}"\`.

Triple-quoted strings (\`"""..."""\`) span lines and are how nearly every system prompt in the wild is written.`,
    diagram: `
   "retrieval augmented generation"
    0123456789...
    |         |
    s[0]      s[10]

   SLICING            s[0:9]   -> "retrieval"
   SPLITTING          s.split() -> ["retrieval","augmented","generation"]
   JOINING            "-".join(parts) -> "retrieval-augmented-generation"
   TEMPLATING         f"Q: {q}\\nContext: {ctx}"

   IMMUTABLE:  s.upper() returns a NEW string;
               s itself is unchanged.`,
    example: {
      language: 'python',
      caption: 'Cleaning a chunk and building a prompt — the two things you do constantly',
      code: `raw = "  Refunds are processed within 5\\n\\n  business days.  "

# clean: collapse whitespace, trim the ends
clean = " ".join(raw.split())
print(repr(clean))   # 'Refunds are processed within 5 business days.'

# build a prompt from a template
question = "How long do refunds take?"
prompt = f"""Answer using ONLY the context below.
If the context does not contain the answer, say you do not know.

Context:
{clean}

Question: {question}
Answer:"""

print(prompt)`
    },
    prereq: ['data-types'], next: ['lists', 'files-io'],
    related: ['chunking', 'prompt-templates', 'tokens-tokenization'],
    tools: ['python'],
    useCases: [
      'Cleaning parsed PDF text before chunking it.',
      'Assembling a prompt from a template plus retrieved context.',
      'Extracting a section of a document by splitting on headings.'
    ],
    avoid: [
      'Do not build complex nested data by concatenating strings — use a dict and serialise to JSON.',
      'Do not parse HTML or PDFs with string methods alone. Use a real parser.',
      'Do not assume one character equals one token. Tokens are a different unit entirely.'
    ],
    mistakes: [
      'Forgetting strings are immutable and expecting `s.strip()` to change `s` in place.',
      'Concatenating user input straight into a prompt without sanitising — that is how prompt injection starts.',
      'Using `+` in a loop to build a large string; use `"".join(parts)` instead.',
      'Ignoring encoding. Open files with `encoding="utf-8"` explicitly or non-English text will break.'
    ],
    keyTerms: [
      ['immutable', 'Cannot be changed in place. String methods return new strings.'],
      ['f-string', 'A template literal: `f"Hello {name}"` interpolates values directly.'],
      ['slicing', '`s[start:end]` returns a substring; the end index is exclusive.'],
      ['strip', 'Removes leading and trailing whitespace — the single most useful cleaning call.'],
      ['encoding', 'How characters map to bytes. UTF-8 is the correct default.'],
      ['escape sequence', '`\\n` newline, `\\t` tab, `\\\\` a literal backslash.']
    ],
    resources: [
      ['Python string methods — official reference', 'https://docs.python.org/3/library/stdtypes.html#string-methods', 'docs'],
      ['Real Python — strings and character data', 'https://realpython.com/python-strings/', 'tutorial'],
      ['f-strings — official reference', 'https://docs.python.org/3/reference/lexical_analysis.html#f-strings', 'docs'],
      ['regex101 — build and test regular expressions', 'https://regex101.com/', 'interactive']
    ],
    questions: [
      ['Why does `s.strip()` not change `s`?', 'Strings are immutable. Every method returns a new string, so you must reassign: `s = s.strip()`.'],
      ['What does `" ".join(text.split())` accomplish?', 'It collapses every run of whitespace — including newlines and tabs — into single spaces, and trims the ends. It is the standard one-liner for cleaning scraped or parsed text.'],
      ['Why is interpolating raw user text into a prompt risky?', 'The user’s text becomes part of the instruction the model reads. If it contains "ignore the above", the model may obey it. That is prompt injection.'],
      ['Is one character one token?', 'No. Tokens are sub-word units produced by a tokenizer. A rough English rule of thumb is four characters per token, but it varies by language and content.']
    ]
  },

  {
    id: 'numbers',
    title: 'Numbers',
    domain: 'programming', tier: 1, priority: 'medium',
    summary: 'Integers and floats — and why floats quietly lie to you about money.',
    what: `Two number types matter: \`int\` (whole numbers, unlimited size in Python) and \`float\` (decimals, stored as approximations).`,
    why: `Every threshold, score, cost estimate, similarity value and token count is a number. And floats are approximate, which means \`0.1 + 0.2 != 0.3\`. If you set a groundedness threshold at exactly 0.8 and compare with \`==\`, you will get results you cannot explain.`,
    analogy: `A ruler marked in millimetres. You can measure 12mm exactly. You cannot measure exactly one-third of a centimetre — you get 3.3mm, close but not exact. Floats are that ruler, with a very fine but still finite scale.`,
    technical: `\`int\` in Python 3 has arbitrary precision. \`float\` is IEEE-754 double precision — 64 bits, roughly 15–17 significant decimal digits, and unable to represent most decimal fractions exactly.

Consequences: compare floats with a tolerance (\`abs(a - b) < 1e-9\`) or use \`math.isclose\`. For money, use \`decimal.Decimal\` or integer minor units (cents). Integer division is \`//\`, remainder is \`%\`, power is \`**\`.`,
    diagram: `
   INT                          FLOAT
   ---                          -----
   exact, unlimited size        approximate, 64-bit
   42, -7, 10**100              3.14, 1e-9, 0.30000000000000004

   0.1 + 0.2 == 0.3   ->  False
   math.isclose(0.1+0.2, 0.3) -> True

   MONEY:
     wrong  ->  price = 19.99          (float drift)
     right  ->  price_cents = 1999     (int)
     right  ->  Decimal("19.99")`,
    example: {
      language: 'python',
      caption: 'The float trap, and how to handle thresholds safely',
      code: `print(0.1 + 0.2)              # 0.30000000000000004
print(0.1 + 0.2 == 0.3)       # False  <- this bites people

import math
print(math.isclose(0.1 + 0.2, 0.3))   # True

# a quality gate: compare with >= not ==
groundedness = 0.7999999999
THRESHOLD = 0.8
print(groundedness >= THRESHOLD)      # False — correct and predictable

# cost estimation
input_tokens, output_tokens = 12_000, 800
cost = (input_tokens / 1_000_000) * 3.00 + (output_tokens / 1_000_000) * 15.00
print(f"\${cost:.4f}")                 # $0.0480`
    },
    prereq: ['data-types'], next: ['conditionals'],
    related: ['descriptive-statistics', 'ai-cost', 'cosine-similarity'],
    tools: ['python'],
    useCases: [
      'Computing token cost per request before committing to a model.',
      'Applying an evaluation threshold as a quality gate.',
      'Averaging similarity scores across retrieved chunks.'
    ],
    avoid: [
      'Never use floats for currency. Use integer cents or `Decimal`.',
      'Never compare two floats with `==`.'
    ],
    mistakes: [
      'Comparing floats for exact equality.',
      'Rounding for display and then reusing the rounded value in further arithmetic.',
      'Using `/` when you meant `//` and getting `2.5` where an index was required.'
    ],
    keyTerms: [
      ['int', 'Whole number, arbitrary precision in Python 3.'],
      ['float', 'IEEE-754 double-precision decimal approximation.'],
      ['floating-point error', 'The gap between the decimal you wrote and the binary value stored.'],
      ['integer division', '`//` discards the remainder: `7 // 2` is 3.'],
      ['modulo', '`%` gives the remainder: `7 % 2` is 1.'],
      ['Decimal', 'A standard-library type giving exact decimal arithmetic — use it for money.']
    ],
    resources: [
      ['Floating point arithmetic — issues and limitations', 'https://docs.python.org/3/tutorial/floatingpoint.html', 'docs'],
      ['decimal — exact decimal arithmetic', 'https://docs.python.org/3/library/decimal.html', 'docs'],
      ['math module reference', 'https://docs.python.org/3/library/math.html', 'docs']
    ],
    questions: [
      ['Why is `0.1 + 0.2 == 0.3` False?', 'Neither 0.1 nor 0.2 has an exact binary representation, so the stored values are tiny approximations. Their sum lands slightly off 0.3.'],
      ['How should you compare a score against a threshold?', 'Use `>=` or `<=` rather than `==`, or use `math.isclose` when you genuinely need equality within a tolerance.'],
      ['What should money be stored as?', 'Integer minor units (cents) or `Decimal`. Never a float.']
    ]
  },

  {
    id: 'lists',
    title: 'Lists',
    domain: 'programming', tier: 1, priority: 'high',
    summary: 'An ordered, changeable sequence — the default container for "several of something".',
    what: `A list holds several values in order: \`chunks = ["a", "b", "c"]\`. You can add to it, remove from it, loop over it, and reach any item by position.`,
    why: `Every AI pipeline is a list pipeline. A document becomes a list of chunks. Chunks become a list of embeddings. A query returns a list of results. If you understand lists and loops, you can read almost any retrieval code.`,
    analogy: `A numbered shelf. Items sit in a definite order, you can point at "shelf position 3", you can slide a new item in, and you can take one out. The order is part of the meaning.`,
    technical: `Lists are ordered, mutable, allow duplicates, and can hold mixed types (though in practice you keep them uniform). Indexing is zero-based; \`-1\` is the last item. Slicing \`xs[2:5]\` returns a new list.

**List comprehensions** are the idiom you will see everywhere: \`[embed(c) for c in chunks]\` builds a new list by transforming each item. \`[c for c in chunks if len(c) > 50]\` filters.

Cost note: \`append\` is fast; \`insert(0, x)\` and \`in\` on a long list are slow (linear). For membership tests use a set.`,
    diagram: `
   chunks = ["intro", "policy", "faq", "legal"]
              0        1         2      3
             -4       -3        -2     -1

   chunks[0]     -> "intro"
   chunks[-1]    -> "legal"
   chunks[1:3]   -> ["policy", "faq"]

   A RAG PIPELINE IS LISTS ALL THE WAY DOWN

   document -> [chunk, chunk, chunk]
                  |      |      |
                  v      v      v
            [vector, vector, vector]
                        |
                     retrieve
                        |
              [(chunk, score), ...]  top-k`,
    example: {
      language: 'python',
      caption: 'The comprehension idiom you will see in every retrieval script',
      code: `chunks = ["Refund policy: 5 days.", "hi", "Shipping takes 2 weeks.", ""]

# filter out junk
useful = [c for c in chunks if len(c.strip()) > 10]
print(useful)   # ['Refund policy: 5 days.', 'Shipping takes 2 weeks.']

# transform each item
lengths = [len(c) for c in useful]
print(lengths)  # [22, 24]

# both at once
long_upper = [c.upper() for c in chunks if len(c) > 20]

# pair items with scores, then take the top 2
scored = [(c, len(c) / 100) for c in useful]
top_k = sorted(scored, key=lambda pair: pair[1], reverse=True)[:2]
print(top_k)`
    },
    prereq: ['data-types'], next: ['loops', 'tuples-sets', 'dictionaries'],
    related: ['chunking', 'retrieval-topk'],
    tools: ['python'],
    useCases: [
      'Holding the chunks a document was split into, in order.',
      'Collecting retrieval results and sorting them by score.',
      'Building a list of test cases for an evaluation run.'
    ],
    avoid: [
      'For membership tests on large collections — a set is dramatically faster.',
      'For key-based lookup — use a dictionary.',
      'For numeric maths at scale — use NumPy arrays, not Python lists.'
    ],
    mistakes: [
      'Modifying a list while looping over it. Iterate over a copy, or build a new list.',
      'Expecting `sorted(xs)` to sort in place — it returns a new list. `xs.sort()` sorts in place.',
      'Using `list.index()` in a loop, turning an O(n) job into O(n²).'
    ],
    keyTerms: [
      ['index', 'Position in the list, starting at 0. Negative indexes count from the end.'],
      ['slice', '`xs[a:b]` — a new list from a up to but not including b.'],
      ['append', 'Add one item to the end.'],
      ['extend', 'Add every item from another sequence.'],
      ['list comprehension', '`[f(x) for x in xs if cond(x)]` — build, transform and filter in one expression.'],
      ['mutable', 'Can be changed in place — which is why `b = a` shares the same list.']
    ],
    resources: [
      ['Data structures — lists and comprehensions', 'https://docs.python.org/3/tutorial/datastructures.html', 'docs'],
      ['Real Python — list comprehensions', 'https://realpython.com/list-comprehension-python/', 'tutorial'],
      ['Python Tutor — visualise list operations', 'https://pythontutor.com/', 'interactive']
    ],
    questions: [
      ['What does `[c for c in chunks if len(c) > 50]` do?', 'Builds a new list containing only the chunks longer than 50 characters. It transforms and filters in one expression.'],
      ['Why is `x in big_list` slow?', 'Lists have no index, so membership is a linear scan. A set uses hashing and is effectively constant time.'],
      ['What goes wrong when you remove items from a list while looping over it?', 'The loop’s internal position shifts as items are removed, so items get skipped. Iterate over a copy or build a new filtered list.']
    ]
  },

  {
    id: 'tuples-sets',
    title: 'Tuples & Sets',
    domain: 'programming', tier: 2, priority: 'medium',
    summary: 'A tuple is a fixed sequence; a set is an unordered collection of unique things.',
    what: `A **tuple** is like a list that cannot be changed: \`(chunk, score)\`. A **set** is a bag of unique items with no order: \`{"rag", "eval"}\`.`,
    why: `Tuples signal "this group belongs together and will not change" — a coordinate, a chunk-and-its-score, a return value carrying two things. Sets answer "have I seen this already?" and "what do these two collections have in common?" almost instantly, where a list would crawl.`,
    analogy: `A tuple is a sealed envelope with two documents inside — you can read them, you cannot swap one out. A set is a guest list where writing a name twice changes nothing, and the order you wrote them does not matter.`,
    technical: `Tuples are immutable, hashable (so they can be dictionary keys or set members) and support unpacking: \`chunk, score = pair\`.

Sets are hash-based: membership is O(1) rather than O(n). They support real set algebra — \`a | b\` union, \`a & b\` intersection, \`a - b\` difference. Elements must be hashable, so a set can hold strings and tuples but not lists.`,
    diagram: `
   TUPLE  ("policy.pdf", 0.87)      ordered, fixed, hashable
            |          |
          chunk      score
          unpack:  name, score = pair

   SET    {"rag", "eval", "rag"}  ->  {"rag", "eval"}

          a = {1,2,3}   b = {3,4}
          a | b  -> {1,2,3,4}   union
          a & b  -> {3}         intersection
          a - b  -> {1,2}       difference

   MEMBERSHIP:  x in list  -> scans        (slow)
                x in set   -> hashes       (fast)`,
    example: {
      language: 'python',
      caption: 'Deduplicating retrieved chunks and measuring retrieval overlap',
      code: `results = [("faq.md", 0.91), ("policy.md", 0.88), ("faq.md", 0.91)]

# tuple unpacking in a loop
for source, score in results:
    print(f"{source:12} {score:.2f}")

# sets remove duplicates instantly
unique_sources = {source for source, _ in results}
print(unique_sources)          # {'faq.md', 'policy.md'}

# set algebra: how well did retrieval match the expected answer?
retrieved = {"faq.md", "policy.md", "legal.md"}
expected  = {"faq.md", "policy.md"}

hits   = retrieved & expected           # {'faq.md', 'policy.md'}
extra  = retrieved - expected           # {'legal.md'}
missed = expected - retrieved           # set()

precision = len(hits) / len(retrieved)  # 0.667
recall    = len(hits) / len(expected)   # 1.0
print(precision, recall)`
    },
    prereq: ['lists'], next: ['dictionaries'],
    related: ['retrieval-evaluation', 'metadata-filtering'],
    tools: ['python'],
    useCases: [
      'Returning a chunk together with its similarity score as one value.',
      'Deduplicating retrieved sources before assembling context.',
      'Computing retrieval precision and recall against an expected set of documents.'
    ],
    avoid: [
      'Sets when order matters — they do not preserve it.',
      'Sets for anything unhashable, such as lists or dictionaries.',
      'Tuples where a small class or a dict would be clearer — `result[3]` is unreadable.'
    ],
    mistakes: [
      'Writing `(5)` and expecting a tuple. A single-element tuple needs the trailing comma: `(5,)`.',
      'Assuming a set preserves insertion order. It does not; dictionaries do.',
      'Trying to put a list in a set and getting an unhashable-type error.'
    ],
    keyTerms: [
      ['tuple', 'An ordered, immutable sequence.'],
      ['unpacking', 'Assigning several names at once: `a, b = pair`.'],
      ['hashable', 'Has a stable hash value, so it can live in a set or be a dict key.'],
      ['set', 'An unordered collection of unique, hashable items.'],
      ['union / intersection / difference', 'The three set operations: `|`, `&`, `-`.'],
      ['frozenset', 'An immutable set, usable as a dictionary key.']
    ],
    resources: [
      ['Data structures — tuples and sets', 'https://docs.python.org/3/tutorial/datastructures.html#tuples-and-sequences', 'docs'],
      ['Real Python — sets in Python', 'https://realpython.com/python-sets/', 'tutorial']
    ],
    questions: [
      ['When would you choose a set over a list?', 'When you need uniqueness, fast membership testing, or set algebra — and you do not care about order.'],
      ['How do sets help evaluate retrieval?', 'Retrieved and expected document ids are sets. Their intersection gives hits; precision is hits over retrieved, recall is hits over expected.'],
      ['Why can a tuple be a dictionary key but a list cannot?', 'Tuples are immutable and therefore hashable. Lists can change, so their hash would become invalid.']
    ]
  },

  {
    id: 'dictionaries',
    title: 'Dictionaries',
    domain: 'programming', tier: 1, priority: 'high',
    summary: 'Key-to-value lookup — the shape of every API response, config file and piece of metadata you will meet.',
    what: `A dictionary maps keys to values: \`{"source": "faq.md", "score": 0.91}\`. You look things up by name instead of by position.`,
    why: `This is the single most important container in AI work. Every JSON API response is a dictionary. Every chunk's metadata is a dictionary. Every model configuration is a dictionary. If you can navigate a nested dict, you can read almost any AI code.`,
    analogy: `A phone book. You do not care that "Priya" is the 4,182nd entry — you look her up by name and get a number. Position is irrelevant; the key is everything.`,
    technical: `Dicts are hash maps: average O(1) lookup, insert and delete. Keys must be hashable. Since Python 3.7 they preserve insertion order.

Access: \`d["key"]\` raises \`KeyError\` if missing; \`d.get("key", default)\` returns a default instead — use \`.get\` when reading anything that came from outside your program. Iterate with \`.items()\`, \`.keys()\`, \`.values()\`.

Nested dicts are how JSON arrives, and walking them safely is a daily skill.`,
    diagram: `
   {
     "id": "chunk_042",
     "text": "Refunds take 5 days.",
     "score": 0.91,
     "metadata": {                    <- nested dict
        "source": "policy.pdf",
        "page": 7,
        "tags": ["refunds", "billing"]  <- list inside a dict
     }
   }

   d["metadata"]["page"]              -> 7
   d.get("missing")                   -> None   (no crash)
   d.get("missing", 0)                -> 0
   d["missing"]                       -> KeyError!

   for key, value in d.items(): ...`,
    example: {
      language: 'python',
      caption: 'Reading a retrieval result the way every vector database returns it',
      code: `result = {
    "id": "chunk_042",
    "text": "Refunds are processed within 5 business days.",
    "score": 0.91,
    "metadata": {"source": "policy.pdf", "page": 7, "lang": "en"},
}

# safe access — never assume a key exists in external data
source = result.get("metadata", {}).get("source", "unknown")
page   = result.get("metadata", {}).get("page")
print(f"{source} p.{page} ({result['score']:.2f})")

# build the citation block for a prompt
hits = [result]
context = "\\n\\n".join(
    f"[{i+1}] {h['text']}  (source: {h['metadata']['source']})"
    for i, h in enumerate(hits)
)
print(context)

# counting: the most common dict pattern in analytics
counts = {}
for tag in ["refunds", "billing", "refunds"]:
    counts[tag] = counts.get(tag, 0) + 1
print(counts)   # {'refunds': 2, 'billing': 1}`
    },
    prereq: ['lists'], next: ['json', 'functions'],
    related: ['apis', 'metadata-filtering', 'structured-outputs'],
    tools: ['python'],
    useCases: [
      'Reading a vector-database result: text, score and metadata in one object.',
      'Holding a model configuration and passing it around as one value.',
      'Counting occurrences — the standard tally pattern.'
    ],
    avoid: [
      'When order and position are the point — use a list.',
      'When the shape is fixed and known — a small class or dataclass documents intent better.',
      'For very large numeric datasets — use a dataframe or array.'
    ],
    mistakes: [
      'Using `d["key"]` on data that came from an API, then crashing with `KeyError` in production.',
      'Assuming a nested key exists. Chain `.get("a", {}).get("b")` instead.',
      'Mutating a dict while iterating over it.'
    ],
    keyTerms: [
      ['key', 'The hashable name you look a value up by.'],
      ['value', 'Anything at all, including another dict or list.'],
      ['KeyError', 'Raised when you request a key that is not present.'],
      ['.get(key, default)', 'Safe lookup returning a fallback instead of raising.'],
      ['.items()', 'Iterate key and value pairs together.'],
      ['nested dict', 'A dict whose values are themselves dicts — the shape of JSON.']
    ],
    resources: [
      ['Dictionaries — official tutorial', 'https://docs.python.org/3/tutorial/datastructures.html#dictionaries', 'docs'],
      ['Real Python — dictionaries', 'https://realpython.com/python-dicts/', 'tutorial'],
      ['collections — Counter, defaultdict', 'https://docs.python.org/3/library/collections.html', 'docs']
    ],
    questions: [
      ['Why prefer `.get()` over `[]` on API data?', 'External data is not guaranteed to have the keys you expect. `[]` raises `KeyError` and crashes; `.get()` returns a default and lets you handle it.'],
      ['What real AI object is "just a dictionary"?', 'A retrieval result: id, text, similarity score and a nested metadata dict. Also every JSON API response, and every model config.'],
      ['How do you safely read `result["metadata"]["page"]` when metadata may be missing?', '`result.get("metadata", {}).get("page")` — the empty dict default makes the second lookup safe.']
    ]
  },

  {
    id: 'conditionals',
    title: 'Conditions: if / elif / else',
    domain: 'programming', tier: 1, priority: 'high',
    summary: 'Branching — running different code depending on whether something is true.',
    what: `\`if\` runs a block only when a condition is true. \`elif\` checks another condition if the first failed. \`else\` runs when nothing else matched.`,
    why: `Every quality gate, every guardrail, every fallback in an AI system is a conditional. "If groundedness is below 0.8, do not show the answer" is literally an \`if\`. Reading conditionals tells you what a system does when things go wrong — which is the part that matters.`,
    analogy: `A bouncer at a door. Over 18 and on the list, come in. On the list but under 18, refused. Not on the list at all, refused for a different reason. Same door, three outcomes, checked in order.`,
    technical: `Conditions evaluate to truthy or falsy. Empty containers, \`0\`, \`""\` and \`None\` are falsy; everything else is truthy.

Order matters: the first matching branch wins and the rest are skipped. Combine with \`and\`, \`or\`, \`not\`. Python short-circuits — \`a and b\` never evaluates \`b\` if \`a\` is false, which lets you write \`if data and data["ok"]\` safely.

Guard clauses (returning early on the bad case) usually read better than deep nesting.`,
    diagram: `
                 ANSWER PRODUCED
                       |
                       v
            +---------------------+
            | groundedness >= .8? |
            +---------------------+
              |                 |
             yes                no
              |                 |
              v                 v
       +-------------+   +---------------+
       | safe? no PII|   | below gate    |
       +-------------+   +---------------+
          |       |             |
         yes      no            v
          |       |      +--------------+
          v       v      | fallback:    |
       SHOW    REDACT    | "I don't know"|
       USER    + SHOW    | or escalate   |
                         +--------------+`,
    example: {
      language: 'python',
      caption: 'A quality gate — the shape of every production AI guardrail',
      code: `def quality_gate(answer, groundedness, contains_pii, latency_ms):
    # guard clauses first: handle the bad cases and get out
    if contains_pii:
        return {"action": "redact", "reason": "PII detected"}

    if groundedness < 0.8:
        return {"action": "fallback",
                "reason": f"groundedness {groundedness:.2f} below 0.80"}

    if latency_ms > 5000:
        return {"action": "show_with_warning", "reason": "slow response"}

    return {"action": "show", "reason": "passed all gates"}


print(quality_gate("Refunds take 5 days.", 0.93, False, 1200))
print(quality_gate("Refunds take 5 days.", 0.61, False, 1200))

# short-circuiting makes this safe even when result is None
result = None
if result and result["score"] > 0.5:
    print("never reached, and never crashes")`
    },
    prereq: ['data-types'], next: ['loops'],
    related: ['eval-thresholds-quality-gates', 'safety-filters'],
    tools: ['python'],
    useCases: [
      'Implementing a quality gate that blocks ungrounded answers.',
      'Choosing a fallback path when retrieval returns nothing.',
      'Routing a request to a cheaper model when the question is simple.'
    ],
    avoid: [
      'Long `elif` chains dispatching on a value — a dictionary lookup is clearer.',
      'Nesting more than two or three levels deep — invert the condition and return early.'
    ],
    mistakes: [
      'Using `=` instead of `==` in a condition.',
      'Comparing to `None` with `==` rather than `is None`.',
      'Assuming `if list_of_results:` checks whether retrieval succeeded — an empty list is falsy, which is usually what you want, but `None` and `[]` mean different things.',
      'Putting the most general condition first so the specific branches never run.'
    ],
    keyTerms: [
      ['condition', 'An expression evaluated as true or false.'],
      ['truthy / falsy', 'Non-boolean values treated as true or false. Empty things are falsy.'],
      ['elif', '"else if" — checked only when previous branches failed.'],
      ['short-circuit', '`and` / `or` stop evaluating as soon as the result is known.'],
      ['guard clause', 'An early return that handles a bad case, avoiding deep nesting.'],
      ['ternary', '`value_if_true if condition else value_if_false` — a one-line conditional.']
    ],
    resources: [
      ['Control flow — official tutorial', 'https://docs.python.org/3/tutorial/controlflow.html', 'docs'],
      ['Real Python — conditional statements', 'https://realpython.com/python-conditional-statements/', 'tutorial'],
      ['Truth value testing', 'https://docs.python.org/3/library/stdtypes.html#truth-value-testing', 'docs']
    ],
    questions: [
      ['What does a quality gate look like in code?', 'A series of `if` checks — PII, groundedness, latency — each returning a different action. The first failing check decides the outcome.'],
      ['Why does branch order matter?', 'The first true branch wins and the rest are skipped, so a general condition placed first will shadow every specific case after it.'],
      ['Why is `if result and result["score"] > 0.5` safe when result is None?', 'Short-circuiting: `and` stops as soon as the left side is falsy, so the subscript is never evaluated.']
    ]
  },

  {
    id: 'loops',
    title: 'Loops: for / while',
    domain: 'programming', tier: 1, priority: 'high',
    summary: 'Doing the same thing to many items — and knowing when the loop will stop.',
    what: `A \`for\` loop runs once per item in a collection. A \`while\` loop runs as long as a condition stays true.`,
    why: `Chunking a document, embedding a hundred chunks, scoring fifty test cases, running an agent until it reaches an answer — all loops. And the agent one matters most: a \`while\` loop with no termination condition is exactly how an agent burns a thousand dollars overnight.`,
    analogy: `A \`for\` loop is a checklist — a known number of items, tick each one, then stop. A \`while\` loop is "keep stirring until it thickens" — you do not know how long, and if it never thickens, you stir forever.`,
    technical: `\`for x in collection\` iterates any iterable. \`enumerate()\` gives index and item, \`zip()\` walks two sequences together, \`range(n)\` produces numbers.

\`break\` exits early; \`continue\` skips to the next iteration. Every \`while\` loop needs a guaranteed exit — usually both a success condition *and* a maximum iteration count.

Nesting loops multiplies work: a loop inside a loop over n items is n² operations.`,
    diagram: `
   FOR — bounded, always terminates

   for chunk in chunks:        chunks = [c1, c2, c3]
       embed(chunk)                |    |    |
                                   v    v    v
                                embed embed embed  -> done


   WHILE — must be given an exit

   step = 0
   while not done and step < MAX_STEPS:      <- two guards
       action = agent.decide()
       result = run(action)
       done   = agent.check(result)
       step  += 1

   Without "step < MAX_STEPS" this is an
   infinite agent loop burning tokens.`,
    example: {
      language: 'python',
      caption: 'Chunking with a for loop, and a safely bounded agent loop',
      code: `# 1. chunking a document with overlap
text = "word " * 300
size, overlap = 500, 50
chunks = []
for start in range(0, len(text), size - overlap):
    chunks.append(text[start:start + size])
print(f"{len(chunks)} chunks")

# 2. enumerate + zip: the two most useful loop helpers
sources = ["faq.md", "policy.md"]
scores  = [0.91, 0.88]
for i, (src, score) in enumerate(zip(sources, scores), start=1):
    print(f"[{i}] {src} -> {score}")

# 3. an agent loop that CANNOT run forever
MAX_STEPS = 8
step, done, answer = 0, False, None
while not done and step < MAX_STEPS:
    step += 1
    # ... model decides, tool runs, observation returns ...
    done = step >= 3            # stand-in for "goal reached"
    answer = f"resolved in {step} steps"

if not done:
    answer = "gave up after the step limit"
print(answer)`
    },
    prereq: ['lists', 'conditionals'], next: ['functions'],
    related: ['agent-loop', 'agent-failure-modes', 'chunking'],
    tools: ['python'],
    useCases: [
      'Splitting a document into overlapping chunks.',
      'Embedding every chunk and writing it to a vector store.',
      'Running an evaluation suite over a golden set of test cases.',
      'Driving an agent loop with a hard step cap.'
    ],
    avoid: [
      'Looping over a dataframe row by row — vectorised operations are orders of magnitude faster.',
      'A `while` loop when the number of iterations is known — use `for`.',
      'Calling an API inside a tight loop without batching or a rate limit.'
    ],
    mistakes: [
      'A `while` loop with no maximum iteration count — the classic runaway agent.',
      'Mutating the list you are iterating over.',
      'Accumulating a string with `+=` inside a loop instead of collecting parts and joining.',
      'Forgetting that nested loops are quadratic.'
    ],
    keyTerms: [
      ['iterable', 'Anything you can loop over: list, string, dict, file, generator.'],
      ['enumerate', 'Yields `(index, item)` pairs — avoids manual counters.'],
      ['zip', 'Walks two or more sequences in lockstep.'],
      ['break', 'Exit the loop immediately.'],
      ['continue', 'Skip the rest of this iteration and start the next.'],
      ['infinite loop', 'A loop whose exit condition never becomes true. In agents, expensive.'],
      ['step cap', 'A hard maximum iteration count. Non-negotiable in any agent loop.']
    ],
    resources: [
      ['for statements — official tutorial', 'https://docs.python.org/3/tutorial/controlflow.html#for-statements', 'docs'],
      ['Real Python — for loops', 'https://realpython.com/python-for-loop/', 'tutorial'],
      ['itertools — looping utilities', 'https://docs.python.org/3/library/itertools.html', 'docs']
    ],
    questions: [
      ['Why must an agent loop have a step cap?', 'A `while` loop only stops when its condition becomes false. If the agent never decides it is finished, the loop runs indefinitely, calling the model and tools each time. A hard step cap bounds cost and latency.'],
      ['When do you use `while` rather than `for`?', 'When the number of iterations is not known in advance and depends on a condition being met — an agent reasoning until it reaches an answer, or retrying until success.'],
      ['What does `enumerate(zip(a, b), start=1)` give you?', 'A 1-based counter alongside paired items from both sequences — the standard way to build numbered citations.']
    ]
  },

  {
    id: 'functions',
    title: 'Functions',
    domain: 'programming', tier: 1, priority: 'high',
    summary: 'Naming a block of behaviour so it can be reused, tested and reasoned about separately.',
    what: `A function packages some behaviour under a name. You give it inputs (parameters), it does work, and it hands back a result (a return value).

\`\`\`
def chunk_text(text, size=500, overlap=50):
    ...
    return chunks
\`\`\``,
    why: `Functions are how a 500-line script becomes readable. Each one has a name that says what it does, so you can understand a pipeline by reading eight function names instead of 500 lines. They are also the unit of testing and the unit an agent calls when you expose a tool.`,
    analogy: `A coffee machine. You put in beans and water (parameters), press a button (call it), and get coffee (return value). You do not need to know what happens inside. And when it makes bad coffee, you know exactly which box to open.`,
    technical: `\`def name(params):\` defines; \`name(args)\` calls. Parameters can have defaults (\`size=500\`). Arguments can be positional or keyword (\`chunk_text(text, overlap=20)\`).

A function returns \`None\` if you do not write \`return\`. Variables inside are local and vanish when it finishes.

**Never use a mutable default** (\`def f(items=[])\`) — the list is created once at definition time and shared across every call. Use \`None\` and create it inside.

Docstrings matter more than usual in AI work: a tool's docstring is often what the model reads to decide whether to call it.`,
    diagram: `
   INPUTS                FUNCTION                OUTPUT
   ------                --------                ------
   text ------>  +---------------------+
   size=500 -->  |     chunk_text      |  ------> [chunk, chunk, ...]
   overlap=50 -> +---------------------+
                    local variables
                    vanish on return


   A PIPELINE READS AS ITS FUNCTION NAMES:

   text   = load(path)
   text   = clean(text)
   chunks = chunk_text(text, size=500)
   vecs   = embed(chunks)
   store(vecs)

   ...you understand the whole system without
      reading a single implementation.`,
    example: {
      language: 'python',
      caption: 'A well-formed function — and the mutable-default trap',
      code: `def chunk_text(text: str, size: int = 500, overlap: int = 50) -> list[str]:
    """Split text into overlapping chunks.

    The docstring matters: when this is exposed as a tool,
    the model reads it to decide whether to call it.
    """
    if overlap >= size:
        raise ValueError("overlap must be smaller than size")

    step = size - overlap
    return [text[i:i + size] for i in range(0, len(text), step)]


chunks = chunk_text("hello world " * 100, size=200, overlap=20)
print(len(chunks))


# THE TRAP — the default list is created once and shared
def bad(item, bucket=[]):
    bucket.append(item)
    return bucket

print(bad("a"))   # ['a']
print(bad("b"))   # ['a', 'b']   <- surprise!

# THE FIX
def good(item, bucket=None):
    bucket = [] if bucket is None else bucket
    bucket.append(item)
    return bucket

print(good("a"))  # ['a']
print(good("b"))  # ['b']`
    },
    prereq: ['loops', 'variables'], next: ['exceptions', 'modules-packages'],
    related: ['tool-calling', 'apis'],
    tools: ['python'],
    useCases: [
      'Turning a RAG script into named steps: load, clean, chunk, embed, retrieve, generate.',
      'Defining a tool an agent can call, where the docstring is the model-facing description.',
      'Isolating one step so you can test it without running the whole pipeline.'
    ],
    avoid: [
      'A function used exactly once that only wraps two obvious lines.',
      'Functions with more than about five parameters — pass a config object instead.',
      'Functions that both compute a value and print it. Return the value; print at the edge.'
    ],
    mistakes: [
      'Mutable default arguments — shared across every call.',
      'Forgetting `return`, so the function silently returns `None`.',
      'Functions that do three things, so the name has to be `process_data`.',
      'Skipping the docstring on a function exposed as an agent tool — the model then guesses when to use it.'
    ],
    keyTerms: [
      ['parameter', 'The name in the definition.'],
      ['argument', 'The actual value passed at the call site.'],
      ['default value', 'A fallback used when the caller omits the argument.'],
      ['keyword argument', 'Passing by name — `chunk_text(text, size=200)`.'],
      ['return value', 'What the function hands back. `None` if omitted.'],
      ['scope', 'Names created inside a function are local and disappear when it returns.'],
      ['docstring', 'The string just under `def`. For agent tools, this is the model-facing spec.'],
      ['pure function', 'Same inputs always give the same output, with no side effects. Easiest to test.']
    ],
    resources: [
      ['Defining functions — official tutorial', 'https://docs.python.org/3/tutorial/controlflow.html#defining-functions', 'docs'],
      ['Real Python — defining your own functions', 'https://realpython.com/defining-your-own-python-function/', 'tutorial'],
      ['PEP 257 — docstring conventions', 'https://peps.python.org/pep-0257/', 'reference']
    ],
    questions: [
      ['Why is `def f(items=[])` dangerous?', 'The default list is created once when the function is defined, not on each call, so every call that relies on the default shares and mutates the same list.'],
      ['Why does a function’s docstring matter for agents?', 'When the function is exposed as a tool, the docstring becomes the description the model reads to decide whether and how to call it. A vague docstring produces wrong tool selection.'],
      ['How do functions make a pipeline readable?', 'You can understand the system from six named steps — load, clean, chunk, embed, retrieve, generate — without reading any implementation.']
    ]
  },

  {
    id: 'exceptions',
    title: 'Exceptions & Error Handling',
    domain: 'programming', tier: 2, priority: 'high',
    summary: 'What happens when something goes wrong — and deciding deliberately what to do about it.',
    what: `When Python cannot do what you asked, it raises an exception and stops. \`try\` / \`except\` lets you catch that and decide what happens next instead of crashing.`,
    why: `Every external call fails eventually. The model API times out, the vector store is unreachable, the PDF is corrupt, the rate limit is hit. In an AI system, error handling *is* the product: whether a user sees "I could not reach the knowledge base, try again" or a blank screen is decided here.`,
    analogy: `A circuit breaker. When something surges, you would rather one breaker trips and you fix that circuit than the whole house burns down. Catching the right exception at the right level is choosing where the breaker sits.`,
    technical: `\`try:\` runs the risky code. \`except SpecificError as e:\` handles one kind of failure. \`else:\` runs if nothing was raised. \`finally:\` always runs — use it for cleanup.

Catch the **narrowest** exception you can handle. A bare \`except:\` swallows everything including typos in your own code, which turns a loud bug into a silent one.

Read tracebacks bottom-up: the last line names the error, and the lines above show the call path that got there.`,
    diagram: `
   try:
       response = call_model(prompt)         <- may fail
   except RateLimitError:
       wait_and_retry()                      <- recoverable
   except TimeoutError:
       return cached_or_fallback_answer()    <- degrade gracefully
   except APIError as e:
       log(e); return "Service unavailable"  <- honest failure
   else:
       return response                       <- nothing went wrong
   finally:
       close_connection()                    <- always runs


   READING A TRACEBACK — start at the BOTTOM

     File "rag.py", line 12, in <module>      \\
       answer = ask(q)                         |  how you got there
     File "rag.py", line 8, in ask             |
       return llm(build_prompt(q))            /
   KeyError: 'metadata'                       <- WHAT actually broke`,
    example: {
      language: 'python',
      caption: 'Retry with backoff, then degrade honestly — the standard AI call pattern',
      code: `import time

class RateLimitError(Exception): pass
class TimeoutError_(Exception): pass

def call_model(prompt, attempt=0):
    if attempt < 2:
        raise RateLimitError("429")
    return "Refunds take 5 business days."

def ask(prompt, max_retries=3):
    for attempt in range(max_retries):
        try:
            return {"ok": True, "answer": call_model(prompt, attempt)}
        except RateLimitError:
            wait = 2 ** attempt              # 1s, 2s, 4s
            print(f"rate limited, retrying in {wait}s")
            time.sleep(0)                    # sleep(wait) in real code
        except TimeoutError_:
            return {"ok": False, "answer": "The service is slow right now."}
        except Exception as e:               # last resort, and it LOGS
            print(f"unexpected: {type(e).__name__}: {e}")
            return {"ok": False, "answer": "Something went wrong."}
    return {"ok": False, "answer": "Still unavailable. Please try again."}

print(ask("How long do refunds take?"))`
    },
    prereq: ['functions'], next: ['debugging'],
    related: ['agent-failure-modes', 'rag-failure-modes', 'failure-rates'],
    tools: ['python'],
    useCases: [
      'Retrying a model call with exponential backoff after a rate limit.',
      'Falling back to a cached or generic answer when retrieval is unavailable.',
      'Skipping one corrupt document during ingestion instead of aborting the whole run.'
    ],
    avoid: [
      'Catching exceptions you cannot actually do anything about — let them propagate to a layer that can.',
      'Using exceptions for normal control flow that an `if` handles more clearly.',
      'Retrying a request that failed because it was malformed. It will fail identically forever.'
    ],
    mistakes: [
      'Bare `except:` or `except Exception: pass` — this hides real bugs and is the most damaging habit in the list.',
      'Catching, then re-raising without context, losing the original traceback.',
      'Retrying without backoff, which makes a rate limit worse.',
      'Showing the raw traceback to a user. It leaks internals and helps nobody.'
    ],
    keyTerms: [
      ['exception', 'An object raised when something goes wrong, interrupting normal flow.'],
      ['traceback', 'The call stack at the moment of failure. Read it bottom-up.'],
      ['try / except', 'Attempt something; handle a specific failure.'],
      ['finally', 'Cleanup that runs whether or not an exception occurred.'],
      ['raise', 'Signal a failure yourself.'],
      ['exponential backoff', 'Waiting 1s, 2s, 4s… between retries so you stop hammering a struggling service.'],
      ['graceful degradation', 'Returning a reduced but useful result instead of failing entirely.']
    ],
    resources: [
      ['Errors and exceptions — official tutorial', 'https://docs.python.org/3/tutorial/errors.html', 'docs'],
      ['Built-in exceptions reference', 'https://docs.python.org/3/library/exceptions.html', 'docs'],
      ['Real Python — exceptions', 'https://realpython.com/python-exceptions/', 'tutorial'],
      ['tenacity — retry library', 'https://tenacity.readthedocs.io/', 'repo']
    ],
    questions: [
      ['Why is `except: pass` the worst line in the file?', 'It swallows every exception, including your own typos and logic errors, and produces no signal. A bug that would have crashed loudly now fails silently and permanently.'],
      ['How do you read a traceback?', 'Bottom-up. The last line names the actual error and message; the lines above show the chain of calls that reached it.'],
      ['What is exponential backoff and why does it matter for AI calls?', 'Waiting progressively longer between retries (1s, 2s, 4s). Immediate retries against a rate-limited or overloaded service make the overload worse and can get you throttled harder.']
    ]
  },

  {
    id: 'modules-packages',
    title: 'Modules, Packages & Imports',
    domain: 'programming', tier: 2, priority: 'medium',
    summary: 'How code gets split across files and how you pull in other people’s code.',
    what: `A **module** is one \`.py\` file. A **package** is a folder of modules. An **import** brings names from one into another. A **library** is a package someone else published that you install.`,
    why: `You will almost never write the hard parts yourself. \`import chromadb\`, \`from transformers import AutoTokenizer\` — those single lines are where the actual capability comes from. Understanding imports tells you what a script depends on, which is the first thing to check when it will not run.`,
    analogy: `A kitchen. Modules are drawers, each holding related tools. Packages are cabinets holding several drawers. Importing is opening the drawer you need — you do not tip every drawer onto the counter before cooking.`,
    technical: `\`import x\` binds the module; use \`x.thing\`. \`from x import thing\` binds the name directly. \`import x as y\` aliases it.

Python finds modules by walking \`sys.path\`: the script's own directory first, then installed packages. This is why a file named \`json.py\` in your folder shadows the standard library and produces baffling errors.

The standard library ships with Python (\`os\`, \`json\`, \`pathlib\`, \`re\`, \`datetime\`). Third-party packages come from PyPI via pip.

\`if __name__ == "__main__":\` marks code that should run only when the file is executed directly, not when it is imported.`,
    diagram: `
   my_rag/
   ├── main.py              <- entry point
   ├── ingest.py            module
   ├── retrieve.py          module
   └── config.py            module

   main.py:
     from ingest   import load_and_chunk      <- your code
     from retrieve import search
     import json                              <- standard library
     import chromadb                          <- installed package

   IMPORT SEARCH ORDER
   1. the script's own folder      <- your json.py shadows the real one!
   2. installed site-packages
   3. the standard library`,
    example: {
      language: 'python',
      caption: 'A small project split into modules',
      code: `# ---- config.py ----
CHUNK_SIZE = 500
OVERLAP = 50
MODEL = "nomic-embed-text"

# ---- ingest.py ----
from config import CHUNK_SIZE, OVERLAP

def load_and_chunk(path):
    text = open(path, encoding="utf-8").read()
    step = CHUNK_SIZE - OVERLAP
    return [text[i:i + CHUNK_SIZE] for i in range(0, len(text), step)]

# ---- main.py ----
import json
from pathlib import Path
from ingest import load_and_chunk

def run(path):
    chunks = load_and_chunk(path)
    Path("chunks.json").write_text(json.dumps(chunks), encoding="utf-8")
    return len(chunks)

if __name__ == "__main__":       # only when run directly
    print(run("policy.txt"))`
    },
    prereq: ['functions'], next: ['virtualenv-pip'],
    related: ['files-io', 'git-basics'],
    tools: ['python', 'vscode'],
    useCases: [
      'Splitting a RAG prototype into ingest / retrieve / generate modules.',
      'Reading the imports at the top of a script to see instantly what it depends on.',
      'Keeping all tunable constants in one config module.'
    ],
    avoid: [
      'Wildcard imports (`from x import *`) — you can no longer tell where a name came from.',
      'Circular imports, where two modules import each other.',
      'Naming a file after a standard-library module (`json.py`, `random.py`, `email.py`).'
    ],
    mistakes: [
      'ModuleNotFoundError because the package was installed into a different virtual environment.',
      'Shadowing a standard-library name with your own filename.',
      'Putting executable code at module top level, so it runs on import.',
      'Importing a heavyweight library at the top of a script that usually does not need it.'
    ],
    keyTerms: [
      ['module', 'A single `.py` file.'],
      ['package', 'A folder of modules, importable as one unit.'],
      ['library', 'A published package you install, e.g. from PyPI.'],
      ['standard library', 'Modules that ship with Python — no install needed.'],
      ['sys.path', 'The ordered list of places Python looks for modules.'],
      ['__main__', 'The name a file has when run directly rather than imported.'],
      ['namespace', 'The set of names available in a given scope.']
    ],
    resources: [
      ['Modules — official tutorial', 'https://docs.python.org/3/tutorial/modules.html', 'docs'],
      ['The Python standard library', 'https://docs.python.org/3/library/', 'docs'],
      ['Real Python — modules and packages', 'https://realpython.com/python-modules-packages/', 'tutorial'],
      ['PyPI — the package index', 'https://pypi.org/', 'reference']
    ],
    questions: [
      ['Why does naming your file `json.py` break things?', 'Python searches the script’s own directory before the standard library, so `import json` finds your file instead of the real module.'],
      ['What does `if __name__ == "__main__":` do?', 'It guards code that should run only when the file is executed directly, so importing the module does not trigger side effects.'],
      ['What is the first thing to check when you get ModuleNotFoundError?', 'Whether the package is installed in the virtual environment you are actually running, rather than a different Python installation.']
    ]
  },

  {
    id: 'files-io',
    title: 'Files & Paths',
    domain: 'programming', tier: 2, priority: 'medium',
    summary: 'Reading and writing files — where every document in a RAG pipeline comes from.',
    what: `Reading a file loads its contents into a string or bytes. Writing saves data back to disk. Paths are how you refer to a file's location.`,
    why: `Ingestion is file work. Documents come from folders. Chunks get cached to disk. Evaluation results get written out. Almost every "it works on my machine" bug is a path or encoding bug.`,
    analogy: `A filing cabinet. A path is the drawer-and-folder directions. Opening is pulling the file out; you must put it back (close it) or the drawer jams. The \`with\` statement puts it back automatically.`,
    technical: `Always use \`with open(path, encoding="utf-8") as f:\` — the \`with\` block closes the file even if an exception is raised, and the explicit encoding prevents platform-dependent breakage on non-English text.

Modes: \`"r"\` read, \`"w"\` write (truncates!), \`"a"\` append, \`"rb"\`/\`"wb"\` binary.

Use \`pathlib.Path\` rather than string concatenation — it handles Windows backslashes and POSIX slashes correctly, and gives you \`.exists()\`, \`.glob()\`, \`.read_text()\` and \`.write_text()\`.`,
    diagram: `
   docs/
   ├── policy.pdf
   ├── faq.md
   └── legal/
       └── terms.md

   Path("docs").glob("**/*.md")   -> faq.md, legal/terms.md

   INGESTION PIPELINE

   Path.glob  ->  read_text  ->  clean  ->  chunk  ->  embed
      |             |                                    |
   find files   load bytes                          write to
                as text                             vector store

   ALWAYS:  with open(p, encoding="utf-8") as f:
            (closes even on error, and no encoding surprises)`,
    example: {
      language: 'python',
      caption: 'Walking a folder of documents — the start of every RAG pipeline',
      code: `from pathlib import Path
import json

DOCS = Path("docs")

# find every markdown file, at any depth
files = sorted(DOCS.glob("**/*.md"))

documents = []
for path in files:
    try:
        text = path.read_text(encoding="utf-8")
    except UnicodeDecodeError:
        print(f"skipping {path}: not valid UTF-8")
        continue

    documents.append({
        "source": str(path.relative_to(DOCS)),
        "text": " ".join(text.split()),      # collapse whitespace
        "chars": len(text),
    })

# write results — 'w' truncates, so this replaces any old file
out = Path("ingested.json")
out.write_text(json.dumps(documents, indent=2), encoding="utf-8")
print(f"{len(documents)} documents -> {out}")`
    },
    prereq: ['strings', 'modules-packages'], next: ['json'],
    related: ['ingestion-parsing', 'env-vars'],
    tools: ['python'],
    useCases: [
      'Walking a documents folder to build a RAG corpus.',
      'Caching embeddings so you do not pay to recompute them on every run.',
      'Writing evaluation results to a file for comparison across runs.'
    ],
    avoid: [
      'Loading a multi-gigabyte file entirely into memory — iterate line by line instead.',
      'String concatenation for paths — use `Path` and the `/` operator.',
      'Storing secrets in files committed to git.'
    ],
    mistakes: [
      'Opening with mode `"w"` when you meant `"a"`, silently destroying the existing file.',
      'Omitting `encoding="utf-8"` and getting different behaviour on Windows and macOS.',
      'Forgetting to close a file. Use `with` and it is not possible.',
      'Using relative paths that break when the script is run from a different directory.'
    ],
    keyTerms: [
      ['path', 'The location of a file. Absolute (from the root) or relative (from the current directory).'],
      ['pathlib.Path', 'The modern, cross-platform way to build and inspect paths.'],
      ['with statement', 'A context manager that guarantees cleanup — here, closing the file.'],
      ['mode', '`r` read, `w` write/truncate, `a` append, `b` binary.'],
      ['encoding', 'How text maps to bytes. Specify `utf-8` explicitly, always.'],
      ['glob', 'Pattern matching over filenames. `**/*.md` means "every .md at any depth".']
    ],
    resources: [
      ['Reading and writing files — official tutorial', 'https://docs.python.org/3/tutorial/inputoutput.html#reading-and-writing-files', 'docs'],
      ['pathlib — object-oriented paths', 'https://docs.python.org/3/library/pathlib.html', 'docs'],
      ['Real Python — working with files', 'https://realpython.com/working-with-files-in-python/', 'tutorial']
    ],
    questions: [
      ['Why always use `with open(...)`?', 'It closes the file automatically, even if an exception is raised inside the block. Without it, files can stay open and locked.'],
      ['Why specify `encoding="utf-8"` explicitly?', 'The default encoding varies by platform, so a script that works on macOS can corrupt non-English text on Windows.'],
      ['What does mode `"w"` do to an existing file?', 'Truncates it to zero bytes immediately on open. If you meant to add to it, use `"a"`.']
    ]
  },

  {
    id: 'json',
    title: 'JSON',
    domain: 'programming', tier: 1, priority: 'high',
    summary: 'The universal text format for structured data — how every API and every model tool call talks.',
    what: `JSON is a way of writing structured data as text. It looks almost exactly like a Python dictionary, and that is not a coincidence.

\`\`\`
{"source": "faq.md", "score": 0.91, "tags": ["billing"]}
\`\`\``,
    why: `Every API request and response is JSON. Every structured output you ask a model for is JSON. Every tool call an agent makes is JSON. Every config file is JSON or YAML. If you cannot read nested JSON, you cannot debug an AI system.`,
    analogy: `A shipping label written in a format every courier in the world agrees on. The contents differ, the format never does — so anyone can read it without a conversation first.`,
    technical: `JSON supports six types: object (\`{}\`), array (\`[]\`), string, number, boolean, null. No dates, no comments, no trailing commas, and keys must be double-quoted strings.

In Python: \`json.loads(text)\` parses a string to a dict; \`json.dumps(obj)\` serialises back to a string. \`json.load(f)\`/\`json.dump(obj, f)\` work on file objects.

Model caveat: an LLM asked for JSON may return it wrapped in markdown fences or with a trailing comma. Use structured-output / JSON-mode features where available, validate with a schema, and always wrap parsing in a try.`,
    diagram: `
   JSON TEXT                 PYTHON OBJECT
   ---------                 -------------
   {                         {
     "score": 0.91,            "score": 0.91,
     "ok": true,       <-->    "ok": True,      <- true  -> True
     "note": null,             "note": None,    <- null  -> None
     "tags": ["a","b"]         "tags": ["a","b"]
   }                         }

   json.loads(text)  ->  dict
   json.dumps(obj)   ->  str

   WHERE YOU MEET IT
   API request/response · tool call arguments ·
   structured model output · config files · vector store metadata`,
    example: {
      language: 'python',
      caption: 'Parsing model output defensively — models do not always return clean JSON',
      code: `import json, re

raw = '''Here is the result:
\`\`\`json
{"answer": "5 business days", "confidence": 0.91, "sources": ["policy.pdf"]}
\`\`\`
'''

def parse_model_json(text):
    """Models wrap JSON in prose and fences. Strip, then parse, then verify."""
    match = re.search(r"\\{.*\\}", text, re.S)     # first {...} block
    if not match:
        return None, "no JSON object found"
    try:
        data = json.loads(match.group(0))
    except json.JSONDecodeError as e:
        return None, f"invalid JSON: {e}"

    # validate the shape — never trust the model got it right
    required = {"answer", "confidence", "sources"}
    missing = required - data.keys()
    if missing:
        return None, f"missing keys: {missing}"
    if not isinstance(data["confidence"], (int, float)):
        return None, "confidence must be a number"

    return data, None

data, error = parse_model_json(raw)
print(data if data else f"FAILED: {error}")`
    },
    prereq: ['dictionaries'], next: ['apis'],
    related: ['structured-outputs', 'tool-calling', 'mcp-tools-resources'],
    tools: ['python'],
    useCases: [
      'Reading an API response from a model provider.',
      'Requesting structured output so downstream code can rely on the shape.',
      'Storing chunk metadata alongside vectors.',
      'Defining the argument schema for an agent tool.'
    ],
    avoid: [
      'For huge tabular datasets — Parquet or CSV are far more efficient.',
      'For config that humans edit frequently — YAML or TOML allow comments.',
      'For binary data — it has to be base64-encoded, which inflates it by a third.'
    ],
    mistakes: [
      'Assuming a model returns valid JSON. Always parse defensively.',
      'Parsing successfully and then not validating the shape — the keys may still be wrong.',
      'Confusing JSON `true`/`null` with Python `True`/`None` when hand-writing test fixtures.',
      'Trailing commas or single quotes. Both are invalid JSON.'
    ],
    keyTerms: [
      ['object', 'A `{}` block of key-value pairs. Becomes a Python dict.'],
      ['array', 'A `[]` list of values. Becomes a Python list.'],
      ['serialise', 'Turn an in-memory object into text — `json.dumps`.'],
      ['parse / deserialise', 'Turn text back into objects — `json.loads`.'],
      ['schema', 'A formal description of the expected shape, used to validate.'],
      ['JSON mode', 'A model feature that constrains generation to valid JSON.'],
      ['JSONL', 'One JSON object per line. The standard format for datasets and eval sets.']
    ],
    resources: [
      ['json — Python standard library', 'https://docs.python.org/3/library/json.html', 'docs'],
      ['JSON specification', 'https://www.json.org/json-en.html', 'reference'],
      ['JSON Schema — validating structure', 'https://json-schema.org/learn/getting-started-step-by-step', 'tutorial'],
      ['Pydantic — validation in Python', 'https://docs.pydantic.dev/latest/', 'docs']
    ],
    questions: [
      ['Why can a model return invalid JSON even when you asked nicely?', 'It is generating tokens, not running a serialiser. Fences, prose, trailing commas and truncation from hitting the token limit all happen. Use a JSON/structured-output mode and validate anyway.'],
      ['What is the difference between parsing and validating?', 'Parsing checks the text is syntactically valid JSON. Validating checks it has the keys and types your code needs. Both are required.'],
      ['What is JSONL and where do you meet it?', 'One JSON object per line. It is the standard format for fine-tuning datasets and evaluation golden sets because you can stream it line by line.']
    ]
  },

  {
    id: 'apis',
    title: 'APIs',
    domain: 'programming', tier: 1, priority: 'high',
    summary: 'A defined way for one program to ask another program to do something.',
    what: `An API is a contract: send a request in this shape to this address, and you get a response in that shape. Calling a model, querying a vector database, fetching a document — all API calls.`,
    why: `Almost everything in an AI system is an API call. Understanding endpoints, authentication, payloads, status codes and rate limits explains most of what a system does, most of what it costs, and most of what goes wrong.`,
    analogy: `A restaurant. The menu is the API — a published list of what you may order and how to order it. You do not walk into the kitchen. You send a well-formed request, and the kitchen decides how to fulfil it.`,
    technical: `An HTTP API call has: a **method** (GET reads, POST creates/sends), an **endpoint** URL, **headers** (including \`Authorization: Bearer <key>\`), an optional **body** (usually JSON), and a **response** with a **status code** — 200 OK, 400 bad request, 401 unauthorised, 404 not found, 429 rate limited, 500 server error.

Model APIs specifically return token usage, which is what you are billed on. Streaming responses arrive incrementally rather than all at once, which changes perceived latency dramatically.

Idempotency matters: retrying a GET is safe; retrying a POST that charges a card is not.`,
    diagram: `
   YOUR CODE                        MODEL PROVIDER
   ---------                        --------------
        |
        |  POST /v1/messages
        |  Authorization: Bearer sk-...
        |  { "model": "...",
        |    "messages": [...] }
        +----------------------------->  [ queue ]
                                              |
                                         [ inference ]
                                              |
        <-----------------------------  200 OK
        |  { "content": [...],
        |    "usage": {                 <- what you PAY for
        |       "input_tokens": 812,
        |       "output_tokens": 145 } }
        v

   STATUS CODES YOU WILL MEET
   200 fine   400 you sent nonsense   401 bad key
   404 wrong endpoint   429 slow down   500 their problem`,
    example: {
      language: 'python',
      caption: 'The shape of every model API call, with the parts that matter labelled',
      code: `import os, json, urllib.request

API_KEY = os.environ["ANTHROPIC_API_KEY"]      # never hard-code this

def call_model(prompt, max_tokens=512):
    body = json.dumps({
        "model": "claude-sonnet-5",
        "max_tokens": max_tokens,
        "messages": [{"role": "user", "content": prompt}],
    }).encode()

    req = urllib.request.Request(
        "https://api.anthropic.com/v1/messages",
        data=body,
        headers={
            "content-type": "application/json",
            "x-api-key": API_KEY,
            "anthropic-version": "2023-06-01",
        },
        method="POST",
    )
    try:
        with urllib.request.urlopen(req, timeout=30) as r:
            data = json.loads(r.read())
    except urllib.error.HTTPError as e:
        return {"ok": False, "status": e.code, "error": e.read().decode()[:200]}
    except TimeoutError:
        return {"ok": False, "error": "timed out"}

    usage = data.get("usage", {})
    return {
        "ok": True,
        "text": data["content"][0]["text"],
        "input_tokens": usage.get("input_tokens"),
        "output_tokens": usage.get("output_tokens"),
    }

# In practice you would use the official SDK, which handles
# retries, streaming and errors for you. The shape is the same.`
    },
    prereq: ['json', 'dictionaries'], next: ['env-vars'],
    related: ['inference-llm', 'ai-cost', 'ai-latency', 'mcp-client-server'],
    tools: ['anthropic', 'openai', 'google-ai', 'ollama'],
    useCases: [
      'Calling a model provider and reading token usage to estimate cost.',
      'Querying a vector database over HTTP.',
      'Exposing your own RAG pipeline so other services can call it.'
    ],
    avoid: [
      'When a local library does the job — a network hop adds latency and a failure mode for nothing.',
      'For very high-frequency internal calls where the overhead dominates.',
      'When the data cannot legally leave your network.'
    ],
    mistakes: [
      'Hard-coding an API key in source and committing it. Keys get scraped from public repos within minutes.',
      'Not setting a timeout, so a hung request blocks forever.',
      'Ignoring 429 and retrying immediately, making the rate limit worse.',
      'Not logging token usage, then being unable to explain the bill.',
      'Blindly retrying a non-idempotent POST.'
    ],
    keyTerms: [
      ['endpoint', 'The specific URL that performs one operation.'],
      ['method', 'GET reads, POST sends, PUT replaces, DELETE removes.'],
      ['header', 'Metadata sent with the request — auth, content type, API version.'],
      ['payload / body', 'The JSON data you send.'],
      ['status code', 'The three-digit result. 2xx success, 4xx your fault, 5xx theirs.'],
      ['rate limit', 'A cap on requests or tokens per period. 429 means you exceeded it.'],
      ['SDK', 'A provider-supplied library that wraps the raw HTTP calls.'],
      ['idempotent', 'Safe to repeat — the same call twice has the same effect as once.'],
      ['streaming', 'Receiving the response token by token instead of all at once.']
    ],
    resources: [
      ['Anthropic API — getting started', 'https://docs.anthropic.com/en/api/getting-started', 'docs'],
      ['OpenAI API reference', 'https://platform.openai.com/docs/api-reference', 'docs'],
      ['MDN — HTTP response status codes', 'https://developer.mozilla.org/en-US/docs/Web/HTTP/Status', 'reference'],
      ['MDN — an overview of HTTP', 'https://developer.mozilla.org/en-US/docs/Web/HTTP/Overview', 'reference'],
      ['requests — the standard Python HTTP library', 'https://requests.readthedocs.io/', 'docs']
    ],
    questions: [
      ['What does status 429 mean and how should you respond?', 'Rate limited. Back off exponentially and retry. Retrying immediately makes it worse and can extend the throttle.'],
      ['Where in an API response do you find what you are being charged for?', 'The usage object — input and output token counts. Log these per request or you will not be able to explain the bill.'],
      ['Why should an API key never appear in source code?', 'Source gets committed, shared and published. Scrapers find keys in public repositories within minutes. Keys belong in environment variables or a secret manager.'],
      ['Why is retrying a POST riskier than retrying a GET?', 'GET only reads, so repeating it is harmless. A POST may have already taken effect before the failure, so retrying can duplicate the action.']
    ],
    interview: {
      s30: 'An API is a published contract between two programs — send this request, get that response. In AI systems, essentially everything is an API call: the model, the vector store, the reranker.',
      s90: 'When I look at an AI feature, I read it as a chain of API calls, because that chain is where the cost, the latency and the failure modes all live. Each call has an endpoint, auth, a payload and a status code. The response from a model API carries token usage, which is what we are billed on, so instrumenting that is how cost stops being a surprise. The failure codes matter too — 429 means we need backoff, 500 means we need a fallback path. Most of what I care about as a PM is decided at these boundaries.',
      pm: 'It lets me ask precise questions: what is the p95 latency of that call, what happens on a 429, what are we sending in the payload, and does any of it contain customer data.'
    }
  },

  {
    id: 'env-vars',
    title: 'Environment Variables & Secrets',
    domain: 'programming', tier: 2, priority: 'high',
    summary: 'Configuration and credentials kept outside the code, so they never end up in git.',
    what: `An environment variable is a named value the operating system hands to your program when it starts. \`os.environ["API_KEY"]\` reads it. The value lives outside your source code.`,
    why: `API keys must never be in source. Beyond security, environment variables let the same code run in development, staging and production with different endpoints, models and limits, without changing a line.`,
    analogy: `A hotel keycard. The building's wiring (the code) is identical for every room. The card (the environment) decides which doors open. You do not rewire the hotel to give someone a different room.`,
    technical: `Set them in your shell, in a \`.env\` file loaded by python-dotenv, or in your deployment platform's secret store. \`.env\` must be listed in \`.gitignore\`. Commit a \`.env.example\` with the key *names* and no values, so others know what to provide.

Read with \`os.environ["KEY"]\` (raises if missing — good for required secrets) or \`os.getenv("KEY", default)\` (returns a fallback — good for optional config).

If a key ever lands in a public repository, treat it as compromised and rotate it. Deleting the commit is not enough; git history and forks retain it.`,
    diagram: `
   PROJECT FOLDER

   .env               <- real values.  IN .gitignore. NEVER committed.
     ANTHROPIC_API_KEY=sk-ant-...
     VECTOR_DB_URL=http://localhost:6333
     TOP_K=5

   .env.example       <- committed. names only, no values.
     ANTHROPIC_API_KEY=
     VECTOR_DB_URL=
     TOP_K=

   .gitignore
     .env

   code:
     os.environ["ANTHROPIC_API_KEY"]   required -> fail loudly if absent
     os.getenv("TOP_K", "5")           optional -> sensible default

   SAME CODE, DIFFERENT ENVIRONMENT
   dev  -> local Qdrant, cheap model, TOP_K=3
   prod -> managed vector DB, frontier model, TOP_K=8`,
    example: {
      language: 'python',
      caption: 'Reading configuration safely, and failing loudly when a secret is missing',
      code: `import os

def require(name: str) -> str:
    """Required secret: crash immediately and clearly if it is absent."""
    value = os.environ.get(name)
    if not value:
        raise RuntimeError(
            f"Missing required environment variable {name}. "
            f"Copy .env.example to .env and fill it in."
        )
    return value

CONFIG = {
    "api_key":    require("ANTHROPIC_API_KEY"),        # must exist
    "vector_url": os.getenv("VECTOR_DB_URL", "http://localhost:6333"),
    "top_k":      int(os.getenv("TOP_K", "5")),        # convert at the boundary
    "model":      os.getenv("MODEL", "claude-sonnet-5"),
    "debug":      os.getenv("DEBUG", "false").lower() == "true",
}

# never do this:
# print(CONFIG)          <- would print the API key into your logs
safe = {k: ("***" if k == "api_key" else v) for k, v in CONFIG.items()}
print(safe)`
    },
    prereq: ['modules-packages'], next: ['virtualenv-pip'],
    related: ['apis', 'privacy-pii', 'access-control', 'git-basics'],
    tools: ['python', 'git'],
    useCases: [
      'Keeping model API keys out of the repository.',
      'Pointing the same code at a local vector store in development and a managed one in production.',
      'Turning verbose tracing on in one environment without a code change.'
    ],
    avoid: [
      'For large structured configuration — use a config file and keep only secrets in the environment.',
      'For anything that must be auditable and versioned — environment values have no history.'
    ],
    mistakes: [
      'Committing `.env`. This is the single most common way keys leak.',
      'Printing the whole config object into logs, leaking the key into your observability stack.',
      'Assuming an environment variable is a number. They are always strings; convert explicitly.',
      'Deleting a leaked key from the latest commit and thinking it is gone. Rotate it.'
    ],
    keyTerms: [
      ['environment variable', 'A named value supplied by the OS to a process at startup.'],
      ['.env file', 'A local file of key=value pairs, loaded at startup. Never committed.'],
      ['.gitignore', 'The list of files git must not track.'],
      ['secret manager', 'A dedicated service for storing and rotating credentials.'],
      ['rotation', 'Replacing a credential with a new one and revoking the old.'],
      ['12-factor config', 'The principle that configuration lives in the environment, not in code.']
    ],
    resources: [
      ['os.environ — Python reference', 'https://docs.python.org/3/library/os.html#os.environ', 'docs'],
      ['python-dotenv', 'https://pypi.org/project/python-dotenv/', 'repo'],
      ['The Twelve-Factor App — Config', 'https://12factor.net/config', 'reference'],
      ['GitHub — removing sensitive data from a repository', 'https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/removing-sensitive-data-from-a-repository', 'docs']
    ],
    questions: [
      ['What do you do the moment you realise a key was committed?', 'Rotate it. Revoke the old key at the provider and issue a new one. Removing the commit is not sufficient because history, forks and clones retain it.'],
      ['Why is `.env.example` committed but `.env` is not?', 'The example documents which variables are required without exposing any values, so a new person knows what to supply.'],
      ['Why does `int(os.getenv("TOP_K", "5"))` need the int()?', 'Environment variables are always strings. Without conversion you would compare or slice with a string and get a confusing error later.']
    ]
  },

  {
    id: 'virtualenv-pip',
    title: 'Virtual Environments & pip',
    domain: 'programming', tier: 2, priority: 'medium',
    summary: 'Isolated per-project dependencies — the fix for "it worked yesterday".',
    what: `A virtual environment is a private folder holding one project's Python packages. \`pip\` installs packages into whichever environment is currently active.`,
    why: `Two projects will want different versions of the same library, and installing globally means one of them breaks. A virtual environment gives each project its own set. Nearly every "ModuleNotFoundError" and "it worked yesterday" is an environment problem.`,
    analogy: `Separate toolboxes per job rather than one shared garage. Job A needs the 10mm spanner from 2019; job B needs the 2024 one. Separate boxes, no argument.`,
    technical: `Create: \`python -m venv .venv\`. Activate: \`.venv\\Scripts\\activate\` on Windows, \`source .venv/bin/activate\` elsewhere. Your prompt shows the environment name when it is active.

\`pip install package\` installs into the active environment. \`pip freeze > requirements.txt\` records exact versions; \`pip install -r requirements.txt\` reproduces them.

Pin versions for anything you will run again — AI libraries move fast and break APIs between minor releases. \`.venv/\` goes in \`.gitignore\`; \`requirements.txt\` is committed.

\`uv\` is a much faster modern alternative that does the same job.`,
    diagram: `
   WITHOUT VENV                    WITH VENV

   system python                   project-a/.venv/
     langchain 0.1  <- project A      langchain 0.1
     langchain 0.3  <- project B
       ^                            project-b/.venv/
       |                              langchain 0.3
   only one can win.
   the other breaks.               both work. always.


   THE FOUR COMMANDS YOU ACTUALLY NEED

   python -m venv .venv                  create
   .venv\\Scripts\\activate                activate (Windows)
   pip install -r requirements.txt       restore
   pip freeze > requirements.txt         record`,
    example: {
      language: 'bash',
      caption: 'Setting up a RAG project from scratch',
      code: `# 1. create an isolated environment inside the project
python -m venv .venv

# 2. activate it  (Windows PowerShell)
.venv\\Scripts\\Activate.ps1
#    (macOS / Linux)
# source .venv/bin/activate

# 3. confirm you are in it — the path should end in .venv
python -c "import sys; print(sys.prefix)"

# 4. install what the project needs
pip install chromadb sentence-transformers python-dotenv

# 5. record exact versions so this is reproducible
pip freeze > requirements.txt

# 6. .gitignore
#    .venv/
#    .env

# later, on another machine:
python -m venv .venv && .venv\\Scripts\\Activate.ps1
pip install -r requirements.txt`
    },
    prereq: ['modules-packages'], next: ['debugging'],
    related: ['git-basics', 'local-rag-architecture'],
    tools: ['python', 'vscode'],
    useCases: [
      'Keeping a RAG prototype’s dependencies separate from every other project.',
      'Reproducing an environment exactly on another machine or in CI.',
      'Trying a risky library upgrade without endangering anything else.'
    ],
    avoid: [
      'Installing AI libraries globally with `sudo pip install`. It will break something eventually.',
      'Committing the `.venv` folder — it is large, platform-specific and regenerable.'
    ],
    mistakes: [
      'Installing a package, then running the script with a different Python interpreter — the classic ModuleNotFoundError.',
      'Forgetting to activate the environment before installing.',
      'Never pinning versions, then finding the project no longer runs six months later.',
      'In VS Code, forgetting to select the `.venv` interpreter, so the editor and the terminal disagree.'
    ],
    keyTerms: [
      ['virtual environment', 'A self-contained folder of packages for one project.'],
      ['pip', 'Python’s package installer, pulling from PyPI.'],
      ['requirements.txt', 'The pinned list of dependencies, committed to git.'],
      ['activate', 'Making an environment the one your shell uses.'],
      ['dependency', 'A package your project needs to run.'],
      ['pinning', 'Fixing an exact version so behaviour is reproducible.'],
      ['uv', 'A modern, much faster replacement for pip and venv.']
    ],
    resources: [
      ['venv — official documentation', 'https://docs.python.org/3/library/venv.html', 'docs'],
      ['Installing packages — Python packaging guide', 'https://packaging.python.org/en/latest/tutorials/installing-packages/', 'tutorial'],
      ['pip user guide', 'https://pip.pypa.io/en/stable/user_guide/', 'docs'],
      ['uv — fast Python package manager', 'https://docs.astral.sh/uv/', 'docs'],
      ['VS Code — Python environments', 'https://code.visualstudio.com/docs/python/environments', 'docs']
    ],
    questions: [
      ['Why does ModuleNotFoundError happen after a successful pip install?', 'Because the package went into one environment and the script is running under a different Python interpreter. Check `sys.prefix` in both.'],
      ['What belongs in git: `.venv/` or `requirements.txt`?', '`requirements.txt`. The virtual environment folder is large, platform-specific and fully regenerable from that file.'],
      ['Why pin versions in AI projects specifically?', 'The ecosystem moves very fast and breaking changes land in minor releases. Without pinning, a project that worked last month will not run today.']
    ]
  },

  {
    id: 'debugging',
    title: 'Debugging',
    domain: 'programming', tier: 2, priority: 'high',
    summary: 'Finding out why the program does something other than what you expected.',
    what: `Debugging is narrowing down where reality diverges from your mental model. You form a hypothesis, test it, and repeat until the gap is found.`,
    why: `AI systems fail quietly. A traditional bug throws an error; a RAG bug returns a confident, fluent, wrong answer. Debugging is how you find out whether the failure was in parsing, chunking, retrieval, the prompt, or the model — and each of those has a completely different fix.`,
    analogy: `Diagnosing a car that will not start. You do not replace the engine. You check fuel, then battery, then starter — halving the possibilities each time until the fault is isolated.`,
    technical: `The loop: **reproduce** reliably, **isolate** by halving the search space, **inspect** actual values, **fix**, **verify**.

Tools in order of usefulness: print the actual value (not what you assume it is), read the traceback bottom-up, use \`breakpoint()\` to drop into an interactive debugger, and use logging rather than prints for anything long-running.

For AI systems specifically, print the **assembled prompt** and the **retrieved chunks**. Most "the model is bad" reports turn out to be "the retriever fetched nothing relevant" or "the prompt was truncated".`,
    diagram: `
   "THE ANSWER IS WRONG"  — where did it actually break?

   documents  -> did the parser extract the text at all?
      |            print the first 500 chars
      v
   chunks     -> are the chunks coherent, or cut mid-sentence?
      |            print 3 chunks
      v
   embeddings -> is the embedding model the same one used at query time?
      |
      v
   retrieval  -> print the retrieved chunks AND their scores
      |            is the answer even IN them?
      v          NO -> retrieval problem. stop looking at the prompt.
   prompt     -> print the FULL assembled prompt
      |            was context truncated? is the instruction clear?
      v
   generation -> the context contained the answer and it still got it wrong
                  -> now it is a model or prompt problem`,
    example: {
      language: 'python',
      caption: 'Instrumenting a RAG pipeline so failures point at their own cause',
      code: `import logging
logging.basicConfig(level=logging.INFO, format="%(levelname)s %(message)s")
log = logging.getLogger("rag")

def answer(question, retriever, llm, top_k=5):
    hits = retriever.search(question, k=top_k)

    # 1. did retrieval return anything at all?
    log.info("retrieved %d chunks", len(hits))
    if not hits:
        return "I could not find anything relevant."

    # 2. what did it actually retrieve, and how confident?
    for i, h in enumerate(hits, 1):
        log.info("  [%d] %.3f  %s  %s", i, h["score"],
                 h["metadata"]["source"], h["text"][:70].replace("\\n", " "))

    # 3. is the score distribution suspicious? all low = bad retrieval
    best = max(h["score"] for h in hits)
    if best < 0.5:
        log.warning("best score %.3f is low — likely a retrieval failure", best)

    context = "\\n\\n".join(h["text"] for h in hits)
    prompt = f"Context:\\n{context}\\n\\nQuestion: {question}\\nAnswer:"

    # 4. the single most valuable log line in any RAG system
    log.info("prompt is %d chars (~%d tokens)", len(prompt), len(prompt) // 4)

    return llm(prompt)`
    },
    prereq: ['exceptions'], next: ['git-basics'],
    related: ['tracing', 'rag-failure-modes', 'agent-failure-modes', 'logging-llm'],
    tools: ['python', 'vscode', 'langsmith', 'phoenix'],
    useCases: [
      'Working out whether a wrong answer came from retrieval or generation.',
      'Finding why a script fails on one document out of two hundred.',
      'Confirming the prompt actually sent matches the prompt you thought you wrote.'
    ],
    avoid: [
      'Guess-and-change debugging. Changing three things at once means you cannot attribute the fix.',
      'Adding print statements to production code permanently — use logging with levels.'
    ],
    mistakes: [
      'Debugging the model when the retriever returned nothing relevant.',
      'Not printing the actual assembled prompt, and reasoning about the template instead.',
      'Changing several variables at once so the cause stays unknown.',
      'Not being able to reproduce the failure, and then declaring it fixed.'
    ],
    keyTerms: [
      ['reproduce', 'Make the failure happen reliably. Without this, nothing else is possible.'],
      ['traceback', 'The call stack at failure. Read bottom-up.'],
      ['bisect', 'Halve the search space each step to isolate the cause.'],
      ['breakpoint()', 'Built-in call that drops you into an interactive debugger at that line.'],
      ['logging', 'Structured, levelled output suitable for long-running systems.'],
      ['observability', 'Being able to answer "what happened in that request" after the fact.'],
      ['silent failure', 'Wrong output with no error. The default failure mode of AI systems.']
    ],
    resources: [
      ['pdb — the Python debugger', 'https://docs.python.org/3/library/pdb.html', 'docs'],
      ['logging HOWTO', 'https://docs.python.org/3/howto/logging.html', 'docs'],
      ['VS Code — Python debugging', 'https://code.visualstudio.com/docs/python/debugging', 'docs'],
      ['Real Python — debugging with pdb', 'https://realpython.com/python-debugging-pdb/', 'tutorial']
    ],
    questions: [
      ['Why is debugging an AI system different from debugging normal software?', 'Normal software fails loudly with an exception. An AI system returns a fluent, confident, wrong answer with no error at all, so you must instrument every stage to find where it diverged.'],
      ['What are the two most valuable things to log in a RAG pipeline?', 'The retrieved chunks with their scores, and the full assembled prompt. Together they tell you whether the answer was even available to the model.'],
      ['You get a wrong answer. What is the first question to ask?', 'Was the correct information in the retrieved context? If not, it is a retrieval problem and the prompt is irrelevant. If it was, it is a prompt or model problem.']
    ]
  },

  {
    id: 'git-basics',
    title: 'Git Basics',
    domain: 'programming', tier: 2, priority: 'medium',
    summary: 'Version control — the record of what changed, when, and why.',
    what: `Git tracks the history of a set of files as a series of commits. Each commit is a snapshot with a message explaining the change and who made it.`,
    why: `Two reasons for you specifically. First, it is where engineering decisions are actually recorded — a pull request is a design conversation. Second, in AI work, prompts and evaluation sets are assets that must be versioned exactly like code, or you cannot answer "what changed between the good version and the bad one".`,
    analogy: `A save system in a game with named saves and branching timelines. You can return to any save, and you can explore a risky path in a separate timeline without endangering the main one.`,
    technical: `The daily loop: \`git status\` (what changed), \`git add <files>\` (stage), \`git commit -m "message"\` (snapshot), \`git push\` (share).

A **branch** is an independent line of work. A **pull request** proposes merging a branch, and is where review happens. \`git log\` shows history; \`git diff\` shows uncommitted changes; \`git revert\` safely undoes a commit by creating a new one.

Do not commit secrets, virtual environments, or large binary files. Use \`.gitignore\`.

For AI systems, version the prompt templates and the golden evaluation set in the same repository as the code, so a single commit captures the full state that produced a given quality score.`,
    diagram: `
   WORKING DIR  --git add-->  STAGING  --git commit-->  HISTORY
   (your edits)               (chosen)                  (permanent)
                                                             |
                                                        git push
                                                             |
                                                             v
                                                          REMOTE


   BRANCHES

   main      ●───●───●───────────────●  <- merge
                      \\             /
   feature             ●───●───●───●
                       (review happens in the pull request)


   WHAT TO VERSION IN AN AI PROJECT
     code            yes
     prompts         YES — a prompt change is a behaviour change
     eval golden set YES — otherwise scores are not comparable
     .env            NEVER
     .venv/          never
     model weights   no (too large — use a registry)`,
    example: {
      language: 'bash',
      caption: 'The commands that cover ninety percent of daily use',
      code: `git init                          # start tracking this folder
git status                        # what has changed?

git add prompts/answer_v3.txt     # stage specific files
git commit -m "prompt: require citations for every claim"

git log --oneline -5              # recent history
git diff                          # unstaged changes

git checkout -b experiment/rerank # branch off to try something
# ...changes...
git commit -am "add cross-encoder reranking"
git checkout main                 # main is untouched

git revert <commit-hash>          # safely undo a commit

# .gitignore for an AI project
cat > .gitignore <<'EOF'
.venv/
.env
__pycache__/
*.pyc
data/embeddings/
EOF`
    },
    prereq: ['files-io'], next: [],
    related: ['prompt-versioning', 'model-versioning', 'env-vars'],
    tools: ['git', 'vscode'],
    useCases: [
      'Versioning prompt templates so a quality regression can be traced to a specific change.',
      'Keeping the golden evaluation set alongside the code that is scored against it.',
      'Reading a pull request to understand what an engineer actually changed.'
    ],
    avoid: [
      'Storing large binaries or model weights — use a model registry or Git LFS.',
      'Committing anything secret, ever.'
    ],
    mistakes: [
      'Committing `.env` or an API key.',
      'Commit messages like "fix" and "update" that make history useless.',
      'Treating prompts as untracked configuration, then being unable to explain a quality drop.',
      'Using `git push --force` on a shared branch and destroying someone else’s work.'
    ],
    keyTerms: [
      ['repository', 'A project folder whose history git tracks.'],
      ['commit', 'A snapshot plus a message explaining why.'],
      ['branch', 'An independent line of development.'],
      ['merge', 'Combining one branch into another.'],
      ['pull request', 'A proposal to merge, and the place review happens.'],
      ['.gitignore', 'Files git must never track.'],
      ['revert', 'Undo a commit by adding a new commit that reverses it — safe on shared history.'],
      ['remote', 'A shared copy of the repository, e.g. on GitHub.']
    ],
    resources: [
      ['Git tutorial — official', 'https://git-scm.com/docs/gittutorial', 'docs'],
      ['Pro Git (free book)', 'https://git-scm.com/book/en/v2', 'course'],
      ['GitHub — Hello World quickstart', 'https://docs.github.com/en/get-started/quickstart/hello-world', 'tutorial'],
      ['Learn Git Branching — interactive', 'https://learngitbranching.js.org/', 'interactive'],
      ['gitignore templates', 'https://github.com/github/gitignore', 'repo']
    ],
    questions: [
      ['Why should prompts live in git?', 'A prompt change is a behaviour change. Without version history you cannot correlate a quality regression with the change that caused it, or roll back to the version that scored well.'],
      ['What must never be committed?', 'Secrets and API keys, virtual environments, large binaries, and anything containing customer data.'],
      ['What is a pull request actually for?', 'It is the review surface — where the reasoning behind a change is discussed and recorded, not just the code diff.']
    ]
  }
];
