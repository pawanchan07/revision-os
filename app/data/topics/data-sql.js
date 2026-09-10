/**
 * DOMAIN B — DATA + SQL (BUILD.md section 5)
 * SQL aimed squarely at answering product questions, not at becoming a DBA.
 */
export const topics = [
  {
    id: 'what-is-a-database',
    title: 'What a Database Is',
    domain: 'data-sql', tier: 1, priority: 'high',
    summary: 'An organised store of data that many programs can read and write safely at the same time.',
    what: `A database is a program whose entire job is storing data and answering questions about it — reliably, and while many people use it at once.

A spreadsheet is a file. A database is a service.`,
    why: `Every product question you will ever ask ends in a database. "How many users completed onboarding?" is not a guess or a survey — it is a query. Understanding that data lives somewhere specific, in a specific shape, changes how you ask for things.`,
    analogy: `A library versus a pile of books. Anyone can leave books in a pile. A library has a catalogue, a shelving system, and rules about who can take what — so a thousand people can use it simultaneously without chaos.`,
    technical: `A **relational database** (PostgreSQL, MySQL, SQLite) stores data in tables of rows and columns, enforces a schema, and guarantees ACID transactions. You query it with SQL.

**OLTP** systems handle the live product (many small reads and writes). **OLAP** systems (warehouses like BigQuery, Snowflake) handle analytics (few enormous scans). Running heavy analytics against the production OLTP database is how you take the product down — which is why a separate warehouse or read replica exists.`,
    diagram: `
   APPLICATION                        ANALYTICS
        |                                  |
        v                                  v
   +----------+     replication      +-----------+
   |  OLTP    | -------------------> |   OLAP    |
   | Postgres |                      | warehouse |
   +----------+                      +-----------+
   many small                        few huge
   reads/writes                      scans
   milliseconds                      seconds to minutes
   "place this order"                "how many orders in Q3?"

   Run your Q3 question on the LEFT box at 9am
   and you may take the product down.`,
    example: {
      language: 'sql',
      caption: 'The same product question, expressed as data',
      code: `-- "How many users completed onboarding last week?"

SELECT COUNT(DISTINCT user_id) AS completed
FROM events
WHERE event_name = 'onboarding_completed'
  AND occurred_at >= CURRENT_DATE - INTERVAL '7 days';

-- The question was vague. The query forces three decisions:
--   1. what counts as "completed"?  (which event)
--   2. what counts as a "user"?     (distinct user_id)
--   3. what counts as "last week"?  (rolling 7 days, or Mon-Sun?)
-- Making those decisions explicit IS the analytical work.`
    },
    prereq: [], next: ['tables-rows-columns'],
    related: ['vector-databases', 'event-tracking'],
    tools: ['postgres', 'sqlite', 'duckdb'],
    useCases: [
      'Answering a product question yourself instead of filing a data request.',
      'Understanding why a "simple" schema change is not simple.',
      'Knowing which system to point a question at — the product database or the warehouse.'
    ],
    avoid: [
      'For unstructured document search by meaning — that is what a vector store is for.',
      'For ephemeral cache data — use Redis or similar.',
      'For very large analytical scans on the OLTP database — use the warehouse.'
    ],
    mistakes: [
      'Treating the production database as a place to run exploratory queries.',
      'Assuming the warehouse is real-time. It usually lags by minutes or hours.',
      'Assuming every event you want was ever instrumented. If it was not logged, the data does not exist.'
    ],
    keyTerms: [
      ['relational database', 'Stores data as tables with defined relationships between them.'],
      ['schema', 'The declared structure: which tables exist, which columns, which types.'],
      ['OLTP', 'Online transaction processing — the live product database.'],
      ['OLAP', 'Online analytical processing — the warehouse built for big queries.'],
      ['ACID', 'Atomicity, Consistency, Isolation, Durability — the transactional guarantees.'],
      ['replica', 'A copy of the database, often read-only, used to keep load off the primary.'],
      ['warehouse', 'A separate analytical store fed from production data.']
    ],
    resources: [
      ['PostgreSQL tutorial — official', 'https://www.postgresql.org/docs/current/tutorial.html', 'docs'],
      ['SQLite — about', 'https://www.sqlite.org/about.html', 'docs'],
      ['Mode — SQL tutorial for analysis', 'https://mode.com/sql-tutorial/', 'course'],
      ['SQLBolt — interactive lessons', 'https://sqlbolt.com/', 'interactive']
    ],
    questions: [
      ['Why is there usually a separate warehouse?', 'Analytical queries scan enormous amounts of data. Running them against the live product database competes for the same resources users need, and can degrade or take down the product.'],
      ['What does "the data does not exist" mean when a PM asks for a metric?', 'If the event was never instrumented, there is no historical record to query. Analytics can only answer questions about things that were logged at the time.'],
      ['What three decisions does turning a product question into SQL force?', 'Which event counts as the action, what identifies a unique user, and what exactly the time window is. The vagueness has to be resolved before a number exists.']
    ]
  },

  {
    id: 'tables-rows-columns',
    title: 'Tables, Rows & Columns',
    domain: 'data-sql', tier: 1, priority: 'high',
    summary: 'The grid: a table is a kind of thing, a row is one of them, a column is one fact about it.',
    what: `A **table** holds one kind of thing — users, orders, events. A **row** is one specific instance. A **column** is one attribute, with a fixed type, shared by every row.`,
    why: `Once you can picture the tables behind a product, you can predict what is answerable and what is not. "Can we segment by signup source?" has an obvious answer if you know whether \`users\` has a \`source\` column.`,
    analogy: `A spreadsheet with rules enforced. Every row must have the same columns, and the date column will refuse to accept the word "yesterday".`,
    technical: `Each column has a **type** (integer, text, timestamp, boolean, json) and constraints (NOT NULL, UNIQUE, DEFAULT, CHECK). The declared types are what let the database validate, index and sort correctly.

A **wide** table has many columns per row; a **long** (or narrow) table has few columns and many rows — event tables are long by nature. Analytics frequently pivots between the two shapes.`,
    diagram: `
   TABLE: users
   +---------+------------------+------------+---------+
   | user_id | email            | created_at | plan    |   <- COLUMNS
   +---------+------------------+------------+---------+
   | 1       | ana@example.com  | 2026-01-04 | free    |   <- ROW
   | 2       | ben@example.com  | 2026-01-09 | pro     |   <- ROW
   | 3       | cai@example.com  | 2026-02-11 | free    |
   +---------+------------------+------------+---------+
      int          text          timestamp     text
                                              <- TYPES

   TABLE: events   (long/narrow — one row per action)
   +----------+---------+------------------------+
   | event_id | user_id | event_name             |
   +----------+---------+------------------------+
   | 9001     | 1       | onboarding_started     |
   | 9002     | 1       | onboarding_completed   |
   | 9003     | 2       | onboarding_started     |
   +----------+---------+------------------------+
   Ben started onboarding and never finished.
   That absence is the entire funnel insight.`,
    example: {
      language: 'sql',
      caption: 'Reading a schema tells you what is answerable',
      code: `CREATE TABLE users (
    user_id     INTEGER PRIMARY KEY,
    email       TEXT      NOT NULL UNIQUE,
    created_at  TIMESTAMP NOT NULL DEFAULT now(),
    plan        TEXT      NOT NULL DEFAULT 'free',
    country     TEXT                              -- nullable: may be unknown
);

-- What this schema can answer:
--   signups per day          -> created_at exists
--   free vs pro split        -> plan exists
--   signups by country       -> country exists, BUT it is nullable,
--                               so some rows will be NULL
-- What it CANNOT answer:
--   "which marketing channel?" -> there is no source column.
--   No amount of querying invents data that was never stored.`
    },
    prereq: ['what-is-a-database'], next: ['keys-relationships', 'select-where'],
    related: ['sql-data-types', 'event-tracking'],
    tools: ['postgres', 'sqlite'],
    useCases: [
      'Reading a schema to work out whether a question is answerable at all.',
      'Spotting that a column is nullable before you build a metric on it.',
      'Explaining to engineering exactly which attribute you need captured.'
    ],
    avoid: [
      'Storing several facts in one column (a comma-separated list) — it becomes unqueryable.',
      'Very wide tables with hundreds of mostly-empty columns.'
    ],
    mistakes: [
      'Assuming a column exists because the product shows it. It may be computed, or come from another system.',
      'Ignoring nullability, then reporting a percentage that silently excludes a third of users.',
      'Confusing "no row" with "a row with zero" — they mean different things.'
    ],
    keyTerms: [
      ['table', 'A collection of rows describing one kind of thing.'],
      ['row / record', 'One instance.'],
      ['column / field', 'One attribute, with a declared type.'],
      ['constraint', 'A rule the database enforces: NOT NULL, UNIQUE, CHECK.'],
      ['nullable', 'The column is allowed to have no value.'],
      ['wide vs long', 'Many columns per row, versus many rows with few columns.']
    ],
    resources: [
      ['PostgreSQL — data definition', 'https://www.postgresql.org/docs/current/ddl.html', 'docs'],
      ['SQLBolt — lesson 1', 'https://sqlbolt.com/lesson/select_queries_introduction', 'interactive'],
      ['W3Schools — SQL CREATE TABLE', 'https://www.w3schools.com/sql/sql_create_table.asp', 'tutorial']
    ],
    questions: [
      ['Why does reading a schema matter to a PM?', 'It tells you which questions are answerable. A missing column means a whole class of analysis is impossible until instrumentation changes.'],
      ['Why does nullability matter for metrics?', 'A nullable column means some rows have no value. A percentage computed over it silently changes meaning depending on whether nulls are counted, excluded, or treated as zero.'],
      ['What does an event table look like structurally?', 'Long and narrow: one row per action, with a user id, an event name and a timestamp. Absence of a row is itself meaningful.']
    ]
  },

  {
    id: 'keys-relationships',
    title: 'Keys & Relationships',
    domain: 'data-sql', tier: 1, priority: 'high',
    summary: 'Primary keys identify a row; foreign keys connect tables into a model of the business.',
    what: `A **primary key** uniquely identifies each row. A **foreign key** is a column holding another table's primary key, creating a link.

\`orders.user_id\` → \`users.user_id\` means "this order belongs to that user".`,
    why: `Relationships are where the business model lives. One user has many orders. One order has many items. Getting the cardinality wrong is the single most common cause of a wrong number in a dashboard — it is how you accidentally report revenue three times.`,
    analogy: `A passport number. Names repeat, addresses change, but the passport number identifies exactly one person forever. A foreign key is writing that number on a form to say who this form is about.`,
    technical: `**Cardinality** describes the shape of a relationship:
- **one-to-many** — one user, many orders. The foreign key lives on the "many" side.
- **many-to-many** — students and courses. Requires a **junction table** holding both keys.
- **one-to-one** — rarer, usually a table split for privacy or size reasons.

**Referential integrity** means the database refuses a foreign key pointing at a row that does not exist. A **surrogate key** is a meaningless auto-generated id; a **natural key** is real-world data (an email). Prefer surrogate keys — real-world values change.`,
    diagram: `
   users                     orders                   order_items
   +---------+               +----------+             +---------+
   | user_id |<--------+     | order_id |<------+     | item_id |
   | email   |         |     | user_id  |--+    |     | order_id|--+
   +---------+         +-----|          |  |    +-----| sku     |  |
        1                 FK +----------+  |          +---------+  |
        |                         1        |               n       |
        +---------- many ---------+        +------- many ----------+

   ONE user has MANY orders.
   ONE order has MANY items.

   THE TRAP
   Join users -> orders -> order_items, then SUM(order_total):
   the order total is repeated once PER ITEM.
   A 3-item order is counted three times.`,
    example: {
      language: 'sql',
      caption: 'The fan-out trap, and the fix',
      code: `-- WRONG: revenue inflated by the number of items per order
SELECT u.country, SUM(o.total) AS revenue
FROM users u
JOIN orders o      ON o.user_id  = u.user_id
JOIN order_items i ON i.order_id = o.order_id   -- fan-out!
GROUP BY u.country;

-- RIGHT: aggregate to one row per order FIRST, then join
WITH order_revenue AS (
    SELECT order_id, user_id, total
    FROM orders
    WHERE status = 'paid'
)
SELECT u.country, SUM(r.total) AS revenue
FROM users u
JOIN order_revenue r ON r.user_id = u.user_id
GROUP BY u.country;

-- Rule of thumb: if a number looks suspiciously high after
-- adding a join, you have almost certainly fanned out.`
    },
    prereq: ['tables-rows-columns'], next: ['joins'],
    related: ['normalization', 'database-design'],
    tools: ['postgres', 'sqlite'],
    useCases: [
      'Reading an entity diagram and understanding the business it describes.',
      'Spotting an inflated revenue number caused by a fan-out join.',
      'Explaining why "one user can have two accounts" breaks a metric definition.'
    ],
    avoid: [
      'Using a mutable real-world value (email, phone) as a primary key.',
      'Skipping foreign key constraints "for speed" — you get orphaned rows instead.'
    ],
    mistakes: [
      'Joining a one-to-many relationship and then summing the "one" side — the classic fan-out.',
      'Assuming user_id is globally unique across systems. It usually is not.',
      'Forgetting that a deleted parent row may leave orphaned children if integrity is not enforced.'
    ],
    keyTerms: [
      ['primary key', 'Uniquely identifies a row. Never null, never reused.'],
      ['foreign key', 'A column referencing another table’s primary key.'],
      ['cardinality', 'The shape of a relationship: one-to-one, one-to-many, many-to-many.'],
      ['junction table', 'A table holding two foreign keys to model many-to-many.'],
      ['referential integrity', 'The guarantee that a foreign key always points at a real row.'],
      ['surrogate key', 'A meaningless generated id, safe from real-world change.'],
      ['fan-out', 'Row multiplication caused by joining to the "many" side — the top cause of inflated metrics.']
    ],
    resources: [
      ['PostgreSQL — constraints', 'https://www.postgresql.org/docs/current/ddl-constraints.html', 'docs'],
      ['SQLBolt — multi-table queries', 'https://sqlbolt.com/lesson/select_queries_with_joins', 'interactive'],
      ['Mode — SQL joins', 'https://mode.com/sql-tutorial/sql-joins/', 'tutorial']
    ],
    questions: [
      ['What is a fan-out and how do you spot one?', 'Joining to the "many" side multiplies rows, so aggregating a value from the "one" side counts it repeatedly. Spot it when a number jumps after adding a join. Fix it by aggregating to one row per entity before joining.'],
      ['Why prefer a surrogate key over an email address?', 'Emails change. A primary key must be stable forever, because every foreign key in the system depends on it.'],
      ['How is a many-to-many relationship stored?', 'With a junction table holding a foreign key to each side, one row per pairing.']
    ]
  },

  {
    id: 'select-where',
    title: 'SELECT & WHERE',
    domain: 'data-sql', tier: 1, priority: 'high',
    summary: 'Choosing which columns you want and which rows qualify — the backbone of every query.',
    what: `\`SELECT\` names the columns you want. \`FROM\` names the table. \`WHERE\` filters which rows qualify.

\`\`\`
SELECT email FROM users WHERE plan = 'pro';
\`\`\``,
    why: `Every query you ever write starts here. And the \`WHERE\` clause is where a product definition becomes concrete: "active user" is meaningless until it becomes \`WHERE last_seen_at >= CURRENT_DATE - INTERVAL '28 days'\`.`,
    analogy: `Ordering at a counter. \`SELECT\` is what you want; \`FROM\` is which counter; \`WHERE\` is the conditions ("only the ones without nuts").`,
    technical: `Logical evaluation order is **not** the order you write it: \`FROM → WHERE → GROUP BY → HAVING → SELECT → ORDER BY → LIMIT\`. This is why you cannot use a \`SELECT\` alias inside \`WHERE\` — the alias does not exist yet.

Operators: \`=\`, \`<>\`, \`<\`, \`>\`, \`BETWEEN\`, \`IN\`, \`LIKE\` (\`%\` = any characters), \`IS NULL\`. Combine with \`AND\`, \`OR\`, \`NOT\`, and parenthesise — \`AND\` binds tighter than \`OR\`, which surprises people constantly.

\`SELECT *\` is fine while exploring and a bad habit in anything saved.`,
    diagram: `
   WHAT YOU WRITE            HOW IT ACTUALLY RUNS

   SELECT   ...              1. FROM      pick the table
   FROM     ...              2. WHERE     drop rows that fail
   WHERE    ...              3. GROUP BY  bucket what remains
   GROUP BY ...              4. HAVING    drop whole buckets
   HAVING   ...              5. SELECT    compute the columns
   ORDER BY ...              6. ORDER BY  sort
   LIMIT    ...              7. LIMIT     cut

   This is why a SELECT alias cannot be used in WHERE:
   at step 2 it does not exist yet.

   AND binds tighter than OR:
     WHERE a AND b OR c   ==   WHERE (a AND b) OR c
   Almost never what you meant. Parenthesise.`,
    example: {
      language: 'sql',
      caption: 'Turning "show me engaged pro users in India" into something exact',
      code: `SELECT
    user_id,
    email,
    created_at,
    last_seen_at
FROM users
WHERE plan = 'pro'
  AND country = 'IN'
  AND last_seen_at >= CURRENT_DATE - INTERVAL '28 days'
  AND deleted_at IS NULL          -- almost always needed, almost always forgotten
ORDER BY last_seen_at DESC
LIMIT 100;

-- The precedence trap:
-- WRONG  — returns every pro user anywhere, plus Indian free users
WHERE country = 'IN' AND plan = 'pro' OR plan = 'enterprise';

-- RIGHT
WHERE country = 'IN' AND (plan = 'pro' OR plan = 'enterprise');`
    },
    prereq: ['tables-rows-columns'], next: ['sorting-limiting', 'aggregate-functions'],
    related: ['null-handling', 'sql-for-product'],
    tools: ['postgres', 'sqlite', 'duckdb'],
    useCases: [
      'Pulling a specific cohort of users for a qualitative research round.',
      'Sanity-checking a dashboard number by querying the underlying rows.',
      'Turning a fuzzy definition like "active user" into something reproducible.'
    ],
    avoid: [
      'For aggregate questions — you need GROUP BY, not a giant result set you count by hand.',
      'For fuzzy text meaning — SQL LIKE matches characters, not concepts.'
    ],
    mistakes: [
      'Forgetting `deleted_at IS NULL`, silently including deleted records.',
      'Mixing AND and OR without parentheses.',
      'Using `= NULL` instead of `IS NULL` — the former never matches anything.',
      'Running an unbounded query on a huge table with no LIMIT.'
    ],
    keyTerms: [
      ['SELECT', 'Which columns to return.'],
      ['FROM', 'Which table to read.'],
      ['WHERE', 'Which rows qualify.'],
      ['predicate', 'A condition that evaluates to true, false or unknown.'],
      ['LIKE', 'Pattern match on text; `%` matches any run of characters.'],
      ['IN', 'Membership test against a list or subquery.'],
      ['alias', 'A temporary name given with AS. Not available in WHERE.']
    ],
    resources: [
      ['PostgreSQL — queries', 'https://www.postgresql.org/docs/current/queries.html', 'docs'],
      ['SQLBolt — SELECT queries', 'https://sqlbolt.com/lesson/select_queries_introduction', 'interactive'],
      ['Mode — SQL SELECT', 'https://mode.com/sql-tutorial/sql-select-statement/', 'tutorial'],
      ['W3Schools — SQL WHERE', 'https://www.w3schools.com/sql/sql_where.asp', 'tutorial']
    ],
    questions: [
      ['Why can you not use a SELECT alias inside WHERE?', 'WHERE is evaluated before SELECT, so the alias does not exist yet. Repeat the expression, or wrap the query in a subquery or CTE.'],
      ['What does `WHERE a AND b OR c` actually mean?', '`(a AND b) OR c`, because AND binds tighter than OR. Almost always a bug. Parenthesise explicitly.'],
      ['Why is `= NULL` always wrong?', 'NULL means "unknown", and comparing anything to unknown yields unknown, never true. Use `IS NULL`.']
    ]
  },

  {
    id: 'sorting-limiting',
    title: 'ORDER BY & LIMIT',
    domain: 'data-sql', tier: 1, priority: 'medium',
    summary: 'Sorting results and taking only the top slice.',
    what: `\`ORDER BY\` sorts the result. \`LIMIT\` returns only the first N rows.`,
    why: `"Top 10 customers", "most recent errors", "slowest queries" — every top-N question is ORDER BY plus LIMIT. And LIMIT is what stops an exploratory query from pulling ten million rows into your browser.`,
    analogy: `A leaderboard. Rank everyone by score, then show only the top ten. The ranking rule and the cut-off are separate decisions.`,
    technical: `\`ORDER BY col ASC|DESC\`, multiple keys applied left to right. NULLs sort last by default in Postgres for ASC — control it with \`NULLS FIRST\`/\`NULLS LAST\`.

Without \`ORDER BY\`, row order is **undefined**. It may look stable and then change when the data grows or the plan changes. Paginating with \`LIMIT ... OFFSET\` and no deterministic sort will silently skip and duplicate rows.

\`OFFSET\` gets slower the deeper you page, because the database still produces and discards the skipped rows. Keyset pagination (\`WHERE id < last_seen_id\`) avoids that.`,
    diagram: `
   ORDER BY revenue DESC, name ASC
             |            |
             primary      tie-breaker

   +--------+---------+
   | name   | revenue |     LIMIT 3
   +--------+---------+     +---------------+
   | Ana    | 900     | --> | Ana    900    |
   | Ben    | 900     | --> | Ben    900    |  (tie broken by name)
   | Cai    | 750     | --> | Cai    750    |
   | Dev    | 300     |     +---------------+
   +--------+---------+

   NO ORDER BY  =  NO GUARANTEED ORDER.
   "It looked sorted" is not a guarantee, and
   pagination without a stable sort loses rows.`,
    example: {
      language: 'sql',
      caption: 'Top-N, with a deterministic tie-breaker',
      code: `-- top 10 customers by lifetime revenue
SELECT
    u.user_id,
    u.email,
    SUM(o.total) AS lifetime_revenue
FROM users u
JOIN orders o ON o.user_id = u.user_id
WHERE o.status = 'paid'
GROUP BY u.user_id, u.email
ORDER BY lifetime_revenue DESC,
         u.user_id ASC          -- deterministic tie-breaker
LIMIT 10;

-- Pagination that stays correct as data changes (keyset, not OFFSET)
SELECT * FROM orders
WHERE created_at < '2026-03-01T00:00:00'   -- last row of previous page
ORDER BY created_at DESC, order_id DESC
LIMIT 50;`
    },
    prereq: ['select-where'], next: ['aggregate-functions'],
    related: ['window-functions'],
    tools: ['postgres', 'sqlite'],
    useCases: [
      'Building any "top N" list.',
      'Capping an exploratory query so you do not pull a million rows.',
      'Producing stable, paginated exports.'
    ],
    avoid: [
      'Deep OFFSET pagination on large tables — it degrades badly.',
      'Relying on natural order without ORDER BY.'
    ],
    mistakes: [
      'Assuming rows come back in insertion order without ORDER BY.',
      'Paginating without a unique tie-breaker, so rows repeat or vanish between pages.',
      'Sorting by a column full of NULLs and being surprised where they land.'
    ],
    keyTerms: [
      ['ORDER BY', 'Sort the result set.'],
      ['ASC / DESC', 'Ascending or descending.'],
      ['NULLS FIRST / LAST', 'Explicit control over where NULLs sort.'],
      ['LIMIT', 'Return at most N rows.'],
      ['OFFSET', 'Skip N rows first. Gets slow when N is large.'],
      ['keyset pagination', 'Paging by "everything after this key" instead of OFFSET.'],
      ['deterministic sort', 'A sort with enough tie-breakers that the order is always identical.']
    ],
    resources: [
      ['PostgreSQL — sorting rows', 'https://www.postgresql.org/docs/current/queries-order.html', 'docs'],
      ['PostgreSQL — LIMIT and OFFSET', 'https://www.postgresql.org/docs/current/queries-limit.html', 'docs'],
      ['SQLBolt — filtering and sorting', 'https://sqlbolt.com/lesson/filtering_sorting_query_results', 'interactive']
    ],
    questions: [
      ['Why does pagination need a tie-breaker column?', 'If two rows sort equally, their relative order is undefined and can differ between queries, so rows get skipped or duplicated across pages.'],
      ['Why is deep OFFSET slow?', 'The database still generates and then discards every skipped row, so cost grows with the offset. Keyset pagination filters instead of skipping.'],
      ['What is the row order without ORDER BY?', 'Undefined. It may appear consistent and then change when data volume or the query plan changes.']
    ]
  },

  {
    id: 'aggregate-functions',
    title: 'GROUP BY, Aggregates & HAVING',
    domain: 'data-sql', tier: 1, priority: 'high',
    summary: 'Collapsing many rows into one number per bucket — where SQL becomes analytics.',
    what: `Aggregate functions reduce many rows to a single value: \`COUNT\`, \`SUM\`, \`AVG\`, \`MIN\`, \`MAX\`. \`GROUP BY\` says which buckets to compute them per. \`HAVING\` filters the buckets afterwards.`,
    why: `This is the step where rows become metrics. "Signups per country per week" is exactly \`COUNT\` + \`GROUP BY country, week\`. Almost every dashboard tile in existence is this pattern.`,
    analogy: `Sorting laundry into piles, then counting each pile. \`GROUP BY\` decides what makes a pile; the aggregate counts it; \`HAVING\` throws away piles that are too small to care about.`,
    technical: `Every column in \`SELECT\` must either appear in \`GROUP BY\` or be inside an aggregate. That rule follows directly from the logic: one output row per group.

\`WHERE\` filters **rows before grouping**; \`HAVING\` filters **groups after**. Putting an aggregate in \`WHERE\` is an error.

\`COUNT(*)\` counts rows. \`COUNT(col)\` skips NULLs. \`COUNT(DISTINCT col)\` counts unique non-null values — and is much more expensive. \`AVG\` also ignores NULLs, which quietly changes the denominator.`,
    diagram: `
   RAW ROWS                      GROUP BY country
   +----+---------+              +---------+-------+
   | id | country |              | country | users |
   +----+---------+              +---------+-------+
   | 1  | IN      |   ------->   | IN      | 3     |
   | 2  | US      |              | US      | 2     |
   | 3  | IN      |              | DE      | 1     |
   | 4  | IN      |              +---------+-------+
   | 5  | US      |
   | 6  | DE      |              HAVING users >= 2
   +----+---------+              +---------+-------+
                                 | IN      | 3     |
   WHERE  -> filters rows  ^     | US      | 2     |
   HAVING -> filters groups v    +---------+-------+

   COUNT(*)             every row
   COUNT(country)       rows where country IS NOT NULL
   COUNT(DISTINCT ...)  unique values — expensive`,
    example: {
      language: 'sql',
      caption: 'A weekly signup metric, sliced by plan',
      code: `SELECT
    DATE_TRUNC('week', u.created_at)      AS week,
    u.plan,
    COUNT(*)                              AS signups,
    COUNT(DISTINCT u.country)             AS countries,
    ROUND(AVG(o.total), 2)                AS avg_first_order
FROM users u
LEFT JOIN orders o ON o.user_id = u.user_id AND o.is_first = TRUE
WHERE u.created_at >= '2026-01-01'
  AND u.deleted_at IS NULL          -- filters ROWS, before grouping
GROUP BY 1, 2
HAVING COUNT(*) >= 10               -- filters GROUPS, after aggregating
ORDER BY week DESC, signups DESC;

-- Watch out: AVG(o.total) ignores users with no order.
-- "Average first order value" over *purchasers*, not over *signups*.
-- Those are different metrics and people conflate them constantly.`
    },
    prereq: ['select-where'], next: ['joins', 'case-expressions'],
    related: ['null-handling', 'descriptive-statistics', 'funnels'],
    tools: ['postgres', 'sqlite', 'duckdb'],
    useCases: [
      'Building any per-period, per-segment metric.',
      'Counting distinct active users in a window.',
      'Filtering out segments too small to be meaningful.'
    ],
    avoid: [
      'When you need a per-row value alongside the aggregate — that is a window function.',
      'COUNT(DISTINCT) on enormous tables when an approximate count would do.'
    ],
    mistakes: [
      'Putting an aggregate condition in WHERE instead of HAVING.',
      'Forgetting that AVG and COUNT(col) silently ignore NULLs, changing the denominator.',
      'Reporting an average when the distribution is skewed — the median is usually more honest.',
      'Grouping by a column that is not in SELECT and then not knowing what a row represents.'
    ],
    keyTerms: [
      ['aggregate function', 'Collapses many rows into one value.'],
      ['GROUP BY', 'Defines the buckets aggregates are computed over.'],
      ['HAVING', 'Filters groups after aggregation.'],
      ['COUNT(*) vs COUNT(col)', 'All rows, versus rows where the column is not null.'],
      ['COUNT(DISTINCT)', 'Unique non-null values. Accurate and expensive.'],
      ['DATE_TRUNC', 'Rounds a timestamp down to day, week or month — the basis of time series.'],
      ['grain', 'What one row of the result represents. Always know it.']
    ],
    resources: [
      ['PostgreSQL — aggregate functions', 'https://www.postgresql.org/docs/current/functions-aggregate.html', 'docs'],
      ['PostgreSQL — GROUP BY and HAVING', 'https://www.postgresql.org/docs/current/queries-table-expressions.html#QUERIES-GROUP', 'docs'],
      ['Mode — SQL aggregate functions', 'https://mode.com/sql-tutorial/sql-aggregate-functions/', 'tutorial'],
      ['SQLBolt — aggregate lesson', 'https://sqlbolt.com/lesson/select_queries_with_aggregates', 'interactive']
    ],
    questions: [
      ['What is the difference between WHERE and HAVING?', 'WHERE filters individual rows before grouping. HAVING filters whole groups after aggregation. An aggregate can only appear in HAVING.'],
      ['Why can AVG be misleading?', 'It ignores NULLs, which changes the denominator, and it is dragged by outliers. On skewed distributions the median is a more honest summary.'],
      ['What does "grain" mean and why should you always know it?', 'The grain is what one row of the result represents — one user, one order, one user-week. If you do not know the grain you cannot tell whether a sum is double-counting.']
    ]
  },

  {
    id: 'joins',
    title: 'JOINs',
    domain: 'data-sql', tier: 1, priority: 'high',
    summary: 'Combining rows from two tables using a matching condition.',
    what: `A join stitches two tables together on a condition, usually a foreign key match. \`INNER JOIN\` keeps only matching pairs; \`LEFT JOIN\` keeps every row from the left table whether or not it matched.`,
    why: `Almost every interesting question spans tables. Users are here, orders are there, events are somewhere else. And the choice between INNER and LEFT is not a technicality — it decides whether users who never ordered appear in your funnel at all.`,
    analogy: `Matching two guest lists by name. An inner join keeps only people on both lists. A left join keeps everyone from the first list, leaving a blank where there was no match — and that blank is often the finding.`,
    technical: `- **INNER JOIN** — rows present in both.
- **LEFT JOIN** — all left rows; unmatched right columns become NULL.
- **RIGHT JOIN** — the mirror image. Rare; rewrite as LEFT for readability.
- **FULL OUTER JOIN** — everything from both sides.
- **CROSS JOIN** — every combination. Usually an accident.

Filter placement changes the meaning of a LEFT JOIN entirely: a condition on the right table in \`WHERE\` silently converts it into an inner join, because NULL fails the predicate. Put such conditions in the \`ON\` clause instead.`,
    diagram: `
   users            orders
   A, B, C          A, A, B, D

   INNER JOIN  ->  A A B          (only matches)
   LEFT JOIN   ->  A A B C(null)  (every user; C never ordered)
   FULL OUTER  ->  A A B C D      (everything from both sides)

   THE LEFT-JOIN TRAP

   LEFT JOIN orders o ON o.user_id = u.user_id
   WHERE o.status = 'paid'          <-- kills the NULL rows
   ...is now an INNER JOIN. Users with no order vanish.

   LEFT JOIN orders o ON o.user_id = u.user_id
                     AND o.status = 'paid'   <-- correct
   WHERE ...                                  stays a LEFT JOIN`,
    example: {
      language: 'sql',
      caption: 'Finding users who signed up but never ordered — the anti-join',
      code: `-- Every user, with their order count (zero included)
SELECT
    u.user_id,
    u.email,
    COUNT(o.order_id) AS orders          -- COUNT of a nullable col -> 0, not NULL
FROM users u
LEFT JOIN orders o
       ON o.user_id = u.user_id
      AND o.status  = 'paid'             -- IN THE ON CLAUSE, not WHERE
WHERE u.deleted_at IS NULL               -- fine: condition on the LEFT table
GROUP BY u.user_id, u.email
ORDER BY orders ASC;

-- "Signed up but never ordered" — the anti-join pattern
SELECT u.user_id, u.email, u.created_at
FROM users u
LEFT JOIN orders o ON o.user_id = u.user_id
WHERE o.order_id IS NULL                 -- no match was found
  AND u.created_at < CURRENT_DATE - INTERVAL '30 days';`
    },
    prereq: ['keys-relationships', 'aggregate-functions'], next: ['set-operations', 'subqueries-ctes'],
    related: ['null-handling', 'funnels'],
    tools: ['postgres', 'sqlite', 'duckdb'],
    useCases: [
      'Attaching user attributes to event or order data.',
      'Finding the gap: users who did A but never did B.',
      'Building a funnel across separate event tables.'
    ],
    avoid: [
      'Joining to a many-side and then summing a one-side value — aggregate first.',
      'Joining on a non-indexed column across large tables without checking the plan.'
    ],
    mistakes: [
      'Putting a right-table condition in WHERE and silently turning a LEFT JOIN into an INNER JOIN.',
      'Fan-out: multiplying rows and inflating sums.',
      'Forgetting an ON condition entirely and producing a cross join.',
      'Using COUNT(*) after a LEFT JOIN and counting 1 for unmatched rows instead of 0.'
    ],
    keyTerms: [
      ['INNER JOIN', 'Only rows matching on both sides.'],
      ['LEFT JOIN', 'All left rows; NULLs where the right side did not match.'],
      ['ON clause', 'The matching condition. Filters here preserve outer-join semantics.'],
      ['anti-join', 'LEFT JOIN plus `WHERE right.id IS NULL` — finds what is missing.'],
      ['CROSS JOIN', 'Every combination of both tables. Almost always a mistake.'],
      ['fan-out', 'Row multiplication from joining to the many side.'],
      ['self-join', 'Joining a table to itself, e.g. to compare consecutive events.']
    ],
    resources: [
      ['PostgreSQL — joined tables', 'https://www.postgresql.org/docs/current/queries-table-expressions.html#QUERIES-JOIN', 'docs'],
      ['SQLBolt — outer joins', 'https://sqlbolt.com/lesson/select_queries_with_outer_joins', 'interactive'],
      ['Mode — SQL joins', 'https://mode.com/sql-tutorial/sql-joins/', 'tutorial'],
      ['Visual JOIN explainer', 'https://joins.spathon.com/', 'interactive']
    ],
    questions: [
      ['How does a WHERE clause break a LEFT JOIN?', 'Unmatched rows have NULL in every right-table column, and a NULL fails any predicate. Filtering on a right-table column in WHERE therefore removes exactly the rows the LEFT JOIN was preserving. Put the condition in ON.'],
      ['What is an anti-join and when do you use it?', 'A LEFT JOIN with `WHERE right.id IS NULL`. It finds records with no counterpart — signed up but never ordered, invited but never activated.'],
      ['Why does COUNT(o.order_id) give 0 but COUNT(*) give 1 for an unmatched left row?', 'COUNT(*) counts the row itself, which exists. COUNT(column) skips NULLs, and the unmatched right column is NULL. Always count a right-table column after a LEFT JOIN.']
    ],
    interview: {
      s30: 'A join combines rows from two tables on a matching condition. The important choice is inner versus left: inner keeps only matches, left keeps everything from one side and shows blanks where there was no match.',
      s90: 'Joins are where most wrong dashboard numbers come from, and there are two classic causes. The first is fan-out: if you join users to orders to order items and then sum the order total, each order total is repeated once per item, so revenue is inflated. The fix is to aggregate to one row per order first. The second is accidentally converting a left join to an inner join by putting a condition on the right table in the WHERE clause — the NULLs fail the predicate and the very rows you were preserving disappear. That one is nasty because the query still runs and the number just looks slightly low.',
      pm: 'When a number looks wrong, the first two questions I ask are "what is the grain of one row" and "did a join fan out". That usually finds it faster than re-reading the whole query.'
    }
  },

  {
    id: 'set-operations',
    title: 'UNION, INTERSECT & EXCEPT',
    domain: 'data-sql', tier: 2, priority: 'medium',
    summary: 'Stacking result sets vertically instead of joining them side by side.',
    what: `\`UNION\` stacks two result sets on top of each other. \`INTERSECT\` keeps rows present in both. \`EXCEPT\` keeps rows in the first but not the second.

Joins combine **columns**. Set operations combine **rows**.`,
    why: `Useful when the same kind of record lives in more than one place — web and mobile events, current and archived orders — or when you want set logic over user cohorts: who is in A but not B.`,
    analogy: `Two guest lists. \`UNION\` merges them into one list with no repeats. \`INTERSECT\` gives people on both. \`EXCEPT\` gives people on the first list who are not on the second.`,
    technical: `Both sides must have the same number of columns with compatible types, matched **by position**, not by name.

\`UNION\` removes duplicates and therefore has to sort or hash the whole result. \`UNION ALL\` keeps everything and is much faster — use it whenever you know duplicates are impossible or wanted.`,
    diagram: `
   A = {1, 2, 3}      B = {3, 4}

   A UNION B      -> {1, 2, 3, 4}     deduplicated (costly)
   A UNION ALL B  -> {1, 2, 3, 3, 4}  everything (fast)
   A INTERSECT B  -> {3}
   A EXCEPT B     -> {1, 2}

   JOIN vs UNION

   JOIN   widens:   [users] + [orders]  ->  user | order
   UNION  lengthens:[web]   + [mobile]  ->  more rows, same columns`,
    example: {
      language: 'sql',
      caption: 'Merging two event sources, and comparing cohorts',
      code: `-- one timeline from two sources
SELECT user_id, event_name, occurred_at, 'web'    AS source
FROM web_events
WHERE occurred_at >= CURRENT_DATE - INTERVAL '7 days'
UNION ALL                              -- no dedup needed: sources are disjoint
SELECT user_id, event_name, occurred_at, 'mobile' AS source
FROM mobile_events
WHERE occurred_at >= CURRENT_DATE - INTERVAL '7 days'
ORDER BY occurred_at DESC;

-- who tried the new feature but never came back to it?
SELECT user_id FROM events WHERE event_name = 'feature_x_first_use'
EXCEPT
SELECT user_id FROM events
WHERE event_name = 'feature_x_used'
  AND occurred_at >= CURRENT_DATE - INTERVAL '14 days';`
    },
    prereq: ['joins'], next: ['subqueries-ctes'],
    related: ['cohorts-retention'],
    tools: ['postgres', 'sqlite'],
    useCases: [
      'Combining events from web and mobile into one timeline.',
      'Cohort set logic: in A but not B.',
      'Stitching a current table together with its archive.'
    ],
    avoid: [
      'When you actually want columns from both tables — that is a join.',
      'UNION (deduplicating) on huge result sets when UNION ALL would do.'
    ],
    mistakes: [
      'Assuming columns match by name. They match by position.',
      'Using UNION when UNION ALL is correct, paying a large dedup cost for nothing.',
      'Forgetting that EXCEPT also removes duplicates within the first set.'
    ],
    keyTerms: [
      ['UNION', 'Stack and deduplicate.'],
      ['UNION ALL', 'Stack and keep everything. Faster.'],
      ['INTERSECT', 'Rows present in both sets.'],
      ['EXCEPT / MINUS', 'Rows in the first set only.'],
      ['positional matching', 'Columns pair by position, not by name.']
    ],
    resources: [
      ['PostgreSQL — combining queries', 'https://www.postgresql.org/docs/current/queries-union.html', 'docs'],
      ['W3Schools — SQL UNION', 'https://www.w3schools.com/sql/sql_union.asp', 'tutorial']
    ],
    questions: [
      ['When should you use UNION ALL instead of UNION?', 'Whenever duplicates are impossible or desirable. UNION has to deduplicate the entire result, which means sorting or hashing everything — a large and often pointless cost.'],
      ['How do columns pair up in a UNION?', 'By position, not by name. Two queries with the same column names in different orders will silently produce nonsense.'],
      ['What question does EXCEPT answer well?', 'Set-difference questions about cohorts: users who did A but never did B.']
    ]
  },

  {
    id: 'subqueries-ctes',
    title: 'Subqueries & CTEs',
    domain: 'data-sql', tier: 2, priority: 'high',
    summary: 'Breaking a complex query into named, readable steps.',
    what: `A **subquery** is a query nested inside another. A **CTE** (Common Table Expression, the \`WITH\` clause) is the same idea given a name and pulled to the top, so the query reads top to bottom.`,
    why: `Real analytical questions are multi-step: first work out each user's first order, then join that to signups, then bucket by week. CTEs let you write those steps in the order you think them, and let a reviewer check each step independently.`,
    analogy: `Prep bowls in a kitchen. Rather than one impossible pan, you prepare each component separately, name it, and combine at the end. Anyone can taste each bowl on its own.`,
    technical: `\`WITH name AS (SELECT ...), other AS (SELECT ... FROM name) SELECT ... FROM other\`. Each CTE may reference earlier ones.

Subquery flavours: **scalar** (returns one value, usable in SELECT), **IN / EXISTS** (membership tests), and **derived tables** (a subquery in FROM). \`EXISTS\` is usually preferred over \`IN\` when the inner query may return NULLs, because \`NOT IN\` with a NULL returns no rows at all — a genuinely nasty silent bug.

\`WITH RECURSIVE\` walks hierarchies such as org charts or category trees.`,
    diagram: `
   NESTED (hard to read, hard to debug)

   SELECT * FROM (
     SELECT ... FROM (
       SELECT ... FROM orders WHERE ...
     ) x WHERE ...
   ) y WHERE ...

   CTE (reads in the order you think)

   WITH paid_orders AS (
       SELECT ... FROM orders WHERE status = 'paid'
   ),
   first_order AS (
       SELECT user_id, MIN(created_at) AS first_at
       FROM paid_orders GROUP BY user_id
   )
   SELECT ... FROM users u JOIN first_order f USING (user_id);

   Each step can be run and checked on its own.`,
    example: {
      language: 'sql',
      caption: 'Time-to-first-purchase, built one readable step at a time',
      code: `WITH paid_orders AS (
    SELECT user_id, created_at, total
    FROM orders
    WHERE status = 'paid'
),
first_purchase AS (
    SELECT user_id,
           MIN(created_at) AS first_purchase_at
    FROM paid_orders
    GROUP BY user_id
),
signup_cohort AS (
    SELECT user_id,
           DATE_TRUNC('month', created_at) AS cohort_month,
           created_at AS signed_up_at
    FROM users
    WHERE deleted_at IS NULL
)
SELECT
    c.cohort_month,
    COUNT(*)                                        AS signups,
    COUNT(f.user_id)                                AS purchasers,
    ROUND(100.0 * COUNT(f.user_id) / COUNT(*), 1)   AS conversion_pct,
    ROUND(AVG(EXTRACT(EPOCH FROM
        (f.first_purchase_at - c.signed_up_at)) / 86400), 1) AS avg_days_to_purchase
FROM signup_cohort c
LEFT JOIN first_purchase f USING (user_id)
GROUP BY c.cohort_month
ORDER BY c.cohort_month;

-- NOT IN trap: if any row of the inner query is NULL,
-- "WHERE id NOT IN (SELECT nullable_col ...)" returns ZERO rows.
-- Use NOT EXISTS instead.`
    },
    prereq: ['joins'], next: ['window-functions'],
    related: ['null-handling', 'cohorts-retention'],
    tools: ['postgres', 'duckdb'],
    useCases: [
      'Any multi-step analysis: cohort tables, funnels, time-to-event.',
      'Making a complex query reviewable step by step.',
      'Reusing an intermediate result several times in one query.'
    ],
    avoid: [
      'A CTE for a single trivial filter — it adds ceremony without clarity.',
      'Correlated subqueries in SELECT over large tables — they run once per row.'
    ],
    mistakes: [
      '`NOT IN` against a subquery that can return NULL — the result is silently empty.',
      'Stacking a dozen CTEs where a temp table or view would be clearer and faster.',
      'Assuming a CTE is materialised. Behaviour varies by database and version.'
    ],
    keyTerms: [
      ['CTE', 'A named query defined in a WITH clause.'],
      ['subquery', 'A query nested inside another.'],
      ['scalar subquery', 'Returns exactly one value.'],
      ['derived table', 'A subquery used in the FROM clause.'],
      ['correlated subquery', 'References the outer query, so it runs per outer row.'],
      ['EXISTS', 'Membership test that is NULL-safe, unlike NOT IN.'],
      ['WITH RECURSIVE', 'A CTE that references itself, for walking hierarchies.']
    ],
    resources: [
      ['PostgreSQL — WITH queries (CTEs)', 'https://www.postgresql.org/docs/current/queries-with.html', 'docs'],
      ['PostgreSQL — subquery expressions', 'https://www.postgresql.org/docs/current/functions-subquery.html', 'docs'],
      ['Mode — SQL subqueries', 'https://mode.com/sql-tutorial/sql-sub-queries/', 'tutorial']
    ],
    questions: [
      ['Why does `NOT IN` with a nullable subquery return nothing?', 'SQL compares against unknown, which is never true, so no row can satisfy the condition. `NOT EXISTS` handles NULLs correctly and should be the default.'],
      ['What makes CTEs better than nested subqueries for analysis?', 'They read in the order you think, each step is named, and each can be run independently to check it — which makes the query reviewable rather than a single dense expression.'],
      ['When is a correlated subquery expensive?', 'When it appears in SELECT or WHERE over a large table, because it is evaluated once per outer row. A join or window function is usually far cheaper.']
    ]
  },

  {
    id: 'case-expressions',
    title: 'CASE Expressions',
    domain: 'data-sql', tier: 2, priority: 'medium',
    summary: 'If/else inside a query — how you bucket, label and pivot.',
    what: `\`CASE WHEN condition THEN value ... ELSE fallback END\` produces a different value per row depending on conditions. It is SQL's conditional.`,
    why: `Segmentation is CASE. Turning a raw number into a band ("0", "1-3", "4+"), turning a status code into a human label, or pivoting rows into columns — all CASE. Combined with an aggregate it becomes conditional counting, which is how funnels get built.`,
    analogy: `Sorting post into pigeonholes by a rule. Each item is examined in order against the rules and drops into the first hole that matches.`,
    technical: `Conditions are evaluated **in order** and the first match wins, so ordering matters: put the narrowest condition first. Without \`ELSE\`, unmatched rows get NULL.

The important idiom is \`SUM(CASE WHEN cond THEN 1 ELSE 0 END)\` — conditional counting, which lets you compute several different filtered metrics in a single pass. \`COUNT(CASE WHEN cond THEN 1 END)\` does the same by relying on COUNT skipping NULLs. Postgres also offers \`COUNT(*) FILTER (WHERE cond)\`, which is clearer.`,
    diagram: `
   BUCKETING                    PIVOTING (rows -> columns)

   CASE                         SELECT
     WHEN n = 0 THEN 'none'       week,
     WHEN n < 4 THEN '1-3'        SUM(CASE WHEN plan='free' THEN 1 ELSE 0 END) AS free,
     WHEN n < 10 THEN '4-9'       SUM(CASE WHEN plan='pro'  THEN 1 ELSE 0 END) AS pro
     ELSE '10+'                 FROM users GROUP BY week;
   END
                                week  | free | pro
   first match wins,            ------+------+-----
   so order matters             W1    | 120  | 14
                                W2    | 143  | 21`,
    example: {
      language: 'sql',
      caption: 'A whole funnel in one pass, using conditional aggregation',
      code: `SELECT
    DATE_TRUNC('week', u.created_at) AS week,

    COUNT(*) AS signed_up,

    COUNT(*) FILTER (WHERE e.started  IS NOT NULL) AS started_onboarding,
    COUNT(*) FILTER (WHERE e.finished IS NOT NULL) AS finished_onboarding,

    -- portable equivalent, works everywhere
    SUM(CASE WHEN e.finished IS NOT NULL THEN 1 ELSE 0 END) AS finished_alt,

    ROUND(100.0 * COUNT(*) FILTER (WHERE e.finished IS NOT NULL)
          / NULLIF(COUNT(*), 0), 1) AS completion_pct,   -- NULLIF avoids /0

    -- segment users into engagement bands
    CASE
        WHEN MAX(u.last_seen_at) >= CURRENT_DATE - INTERVAL '7 days'  THEN 'active'
        WHEN MAX(u.last_seen_at) >= CURRENT_DATE - INTERVAL '30 days' THEN 'lapsing'
        ELSE 'dormant'
    END AS segment
FROM users u
LEFT JOIN onboarding e ON e.user_id = u.user_id
GROUP BY 1, segment
ORDER BY week DESC;`
    },
    prereq: ['aggregate-functions'], next: ['window-functions'],
    related: ['funnels', 'segmentation'],
    tools: ['postgres', 'duckdb'],
    useCases: [
      'Computing every step of a funnel in one query.',
      'Bucketing a continuous value into named segments.',
      'Pivoting long event data into a wide report.'
    ],
    avoid: [
      'Deeply nested CASE inside CASE — use a lookup table instead.',
      'Encoding business rules only in SQL when they belong in a shared definition.'
    ],
    mistakes: [
      'Ordering conditions wrongly so a broad condition swallows narrower ones.',
      'Omitting ELSE and getting unexpected NULLs.',
      'Dividing without NULLIF and hitting a division-by-zero error.'
    ],
    keyTerms: [
      ['CASE', 'SQL’s conditional expression.'],
      ['conditional aggregation', 'SUM/COUNT over a CASE — several filtered metrics in one pass.'],
      ['FILTER (WHERE ...)', 'Postgres syntax for the same thing, more readable.'],
      ['pivot', 'Turning row values into columns.'],
      ['NULLIF', 'Returns NULL if two values are equal — the standard divide-by-zero guard.'],
      ['COALESCE', 'Returns the first non-null argument.']
    ],
    resources: [
      ['PostgreSQL — conditional expressions', 'https://www.postgresql.org/docs/current/functions-conditional.html', 'docs'],
      ['PostgreSQL — aggregate FILTER clause', 'https://www.postgresql.org/docs/current/sql-expressions.html#SYNTAX-AGGREGATES', 'docs'],
      ['Mode — CASE statements', 'https://mode.com/sql-tutorial/sql-case/', 'tutorial']
    ],
    questions: [
      ['How do you compute every funnel step in one query?', 'Conditional aggregation: `COUNT(*) FILTER (WHERE step_reached)` or `SUM(CASE WHEN ... THEN 1 ELSE 0 END)` per step, all in a single GROUP BY.'],
      ['Why does CASE ordering matter?', 'The first matching condition wins. A broad condition placed early will capture rows meant for a narrower one below it.'],
      ['What is NULLIF for in a percentage calculation?', 'It turns a zero denominator into NULL, so the result is NULL rather than a division-by-zero error.']
    ]
  },

  {
    id: 'window-functions',
    title: 'Window Functions',
    domain: 'data-sql', tier: 3, priority: 'high',
    summary: 'Aggregate across related rows without collapsing them — ranking, running totals, period-over-period.',
    what: `A window function computes a value over a set of rows related to the current row, while **keeping every row**. \`GROUP BY\` gives you one row per group; a window function gives you every row *plus* the group-level answer.`,
    why: `This unlocks the questions dashboards actually ask: "each user's first session", "revenue vs last month", "rank within segment", "7-day rolling average", "days between consecutive orders". Before window functions, each of these needed an awkward self-join.`,
    analogy: `Standing in a queue holding a card that says both your own number and your position in the line, plus the queue's total. You are still an individual in the line — you just also know where you sit relative to everyone else.`,
    technical: `\`function() OVER (PARTITION BY ... ORDER BY ... ROWS BETWEEN ...)\`.
- \`PARTITION BY\` splits into independent windows (like GROUP BY, but non-collapsing).
- \`ORDER BY\` orders rows within the window — required for anything positional.
- The **frame** (\`ROWS BETWEEN 6 PRECEDING AND CURRENT ROW\`) sets which rows are in scope.

Key functions: \`ROW_NUMBER\` (unique rank), \`RANK\` (ties share a rank, then skip), \`DENSE_RANK\` (ties share, no skip), \`LAG\`/\`LEAD\` (previous/next row), \`SUM/AVG OVER\` (running or rolling), \`NTILE\` (percentile buckets), \`FIRST_VALUE\`/\`LAST_VALUE\`.

Window functions run **after** WHERE and GROUP BY, so you cannot filter on one directly — wrap it in a CTE first.`,
    diagram: `
   GROUP BY collapses          WINDOW keeps every row

   user | total                user | order | total | running | rank
   -----+------                -----+-------+-------+---------+-----
   A    | 300                  A    | 1     | 100   | 100     | 1
   B    | 150                  A    | 2     | 200   | 300     | 2
                               B    | 3     | 150   | 150     | 1
   2 rows out                  3 rows out, enriched

   SUM(total) OVER (PARTITION BY user ORDER BY order_id)
                     |                  |
              separate window     order inside it
              per user            (makes it RUNNING)

   ROLLING 7-DAY AVERAGE
   AVG(x) OVER (ORDER BY day ROWS BETWEEN 6 PRECEDING AND CURRENT ROW)`,
    example: {
      language: 'sql',
      caption: 'Ranking, month-over-month change and rolling averages',
      code: `-- 1. each user's first paid order (dedup by rank, then filter in a CTE)
WITH ranked AS (
    SELECT
        user_id, order_id, created_at, total,
        ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY created_at) AS n
    FROM orders
    WHERE status = 'paid'
)
SELECT * FROM ranked WHERE n = 1;     -- cannot filter on the window directly

-- 2. month-over-month revenue change
WITH monthly AS (
    SELECT DATE_TRUNC('month', created_at) AS month, SUM(total) AS revenue
    FROM orders WHERE status = 'paid'
    GROUP BY 1
)
SELECT
    month,
    revenue,
    LAG(revenue) OVER (ORDER BY month)                    AS prev_month,
    ROUND(100.0 * (revenue - LAG(revenue) OVER (ORDER BY month))
          / NULLIF(LAG(revenue) OVER (ORDER BY month), 0), 1) AS mom_pct
FROM monthly
ORDER BY month;

-- 3. 7-day rolling average of daily signups
SELECT
    day,
    signups,
    ROUND(AVG(signups) OVER (
        ORDER BY day ROWS BETWEEN 6 PRECEDING AND CURRENT ROW
    ), 1) AS rolling_7d
FROM daily_signups
ORDER BY day;`
    },
    prereq: ['aggregate-functions', 'subqueries-ctes'], next: [],
    related: ['cohorts-retention', 'dashboards-indicators'],
    tools: ['postgres', 'duckdb'],
    useCases: [
      'Deduplicating to "the first/latest row per user".',
      'Month-over-month and week-over-week comparisons.',
      'Rolling averages that smooth noisy daily metrics.',
      'Ranking within a segment without losing the underlying rows.'
    ],
    avoid: [
      'When a plain GROUP BY answers the question — windows are more expensive.',
      'On very large unpartitioned sets without an index supporting the ordering.'
    ],
    mistakes: [
      'Trying to filter on a window function in WHERE. Wrap it in a CTE.',
      'Confusing RANK (skips after ties) with DENSE_RANK (does not) with ROW_NUMBER (never ties).',
      'Forgetting ORDER BY inside OVER and getting a whole-partition aggregate instead of a running one.',
      'Assuming the default frame is what you want — with ORDER BY it is RANGE UNBOUNDED PRECEDING, not the whole partition.'
    ],
    keyTerms: [
      ['window', 'The set of rows a function is computed over for the current row.'],
      ['PARTITION BY', 'Splits rows into independent windows.'],
      ['frame', 'Which rows within the window are in scope — ROWS BETWEEN ...'],
      ['ROW_NUMBER', 'Sequential number; never ties.'],
      ['RANK / DENSE_RANK', 'Tied rows share a rank; RANK then skips, DENSE_RANK does not.'],
      ['LAG / LEAD', 'Value from the previous or next row — the basis of period-over-period.'],
      ['running total', 'Cumulative sum, produced by SUM OVER with an ORDER BY.'],
      ['NTILE', 'Splits rows into N equal buckets — quartiles, deciles.']
    ],
    resources: [
      ['PostgreSQL — window functions tutorial', 'https://www.postgresql.org/docs/current/tutorial-window.html', 'docs'],
      ['PostgreSQL — window function reference', 'https://www.postgresql.org/docs/current/functions-window.html', 'docs'],
      ['Mode — SQL window functions', 'https://mode.com/sql-tutorial/sql-window-functions/', 'tutorial'],
      ['PostgreSQL Exercises — window functions', 'https://pgexercises.com/questions/aggregates/', 'interactive']
    ],
    questions: [
      ['How do you get "the first order per user" and keep the row?', '`ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY created_at)` in a CTE, then filter `WHERE n = 1` in the outer query.'],
      ['Why can you not filter on a window function in WHERE?', 'Window functions are evaluated after WHERE and GROUP BY, so the value does not exist yet. Wrap the query in a CTE and filter outside.'],
      ['What is the difference between RANK and DENSE_RANK?', 'Both give tied rows the same rank. RANK then skips the next values (1,1,3); DENSE_RANK does not (1,1,2).'],
      ['How do you compute a 7-day rolling average?', '`AVG(x) OVER (ORDER BY day ROWS BETWEEN 6 PRECEDING AND CURRENT ROW)`.']
    ],
    interview: {
      s30: 'A window function computes something across related rows without collapsing them, so you keep every row and also get the group-level answer — a rank, a running total, or last month’s value.',
      s90: 'The distinction I care about is that GROUP BY reduces rows and a window function enriches them. That is what makes questions like "each user\'s first purchase", "revenue versus the previous month" and "7-day rolling average" straightforward instead of requiring self-joins. The practical gotcha is that windows are evaluated after WHERE, so you cannot filter on one directly — you wrap it in a CTE and filter outside. In product analytics, LAG for period-over-period and ROW_NUMBER for deduplicating to a first or latest event are the two I reach for most.',
      pm: 'It is the difference between "how many users converted" and "how long each user took to convert, and how that is trending". The second question is usually the more useful one.'
    }
  },

  {
    id: 'null-handling',
    title: 'NULL',
    domain: 'data-sql', tier: 2, priority: 'high',
    summary: 'Not zero, not empty — unknown. And unknown propagates through everything it touches.',
    what: `NULL means "there is no value here". It is not zero, not an empty string, and not false. It is the absence of information.`,
    why: `NULL is the single most common cause of a quietly wrong metric. Averages skip it, changing the denominator. Joins produce it. \`NOT IN\` collapses because of it. Every one of those failures is silent — the query runs and returns a number that is simply wrong.`,
    analogy: `A blank on a form. It does not mean the person earns zero; it means you do not know what they earn. Averaging "blank" as zero would be a lie about the population.`,
    technical: `SQL uses **three-valued logic**: true, false, unknown. Any comparison with NULL yields unknown, and \`WHERE\` keeps only rows that are true. Hence \`= NULL\` never matches; use \`IS NULL\`.

Arithmetic with NULL yields NULL. Aggregates *ignore* NULLs — which is why \`AVG(col)\` averages over non-null rows only, and \`COUNT(col)\` differs from \`COUNT(*)\`.

Tools: \`COALESCE(a, b, c)\` returns the first non-null; \`NULLIF(a, b)\` returns NULL when equal; \`IS DISTINCT FROM\` is a NULL-safe inequality.`,
    diagram: `
   THREE-VALUED LOGIC

   NULL = NULL      -> unknown  (NOT true!)
   NULL <> 5        -> unknown
   NULL IS NULL     -> TRUE     <- the only way to test

   WHERE keeps only TRUE. Unknown rows are dropped.

   AGGREGATES IGNORE NULLS

   salaries: [100, NULL, 200]
   COUNT(*)        -> 3
   COUNT(salary)   -> 2
   SUM(salary)     -> 300
   AVG(salary)     -> 150     (NOT 100 — denominator is 2)

   If you meant "unknown counts as zero", say so:
   AVG(COALESCE(salary, 0))  -> 100`,
    example: {
      language: 'sql',
      caption: 'The same data, three defensible numbers — pick deliberately',
      code: `-- users: 100 rows. 60 have a country, 40 are NULL.
-- 30 of the 60 known are 'IN'.

-- (a) share of users with a KNOWN country who are in India
SELECT ROUND(100.0 * COUNT(*) FILTER (WHERE country = 'IN')
             / NULLIF(COUNT(country), 0), 1)  AS pct_of_known;    -- 50.0

-- (b) share of ALL users who are known to be in India
SELECT ROUND(100.0 * COUNT(*) FILTER (WHERE country = 'IN')
             / NULLIF(COUNT(*), 0), 1)        AS pct_of_all;      -- 30.0

-- (c) treat unknown as its own segment — usually the honest choice
SELECT COALESCE(country, 'unknown') AS country, COUNT(*) AS users
FROM users GROUP BY 1 ORDER BY users DESC;

-- The NOT IN trap
SELECT * FROM users
WHERE user_id NOT IN (SELECT user_id FROM banned);  -- 0 rows if ANY is NULL

SELECT * FROM users u                                -- correct
WHERE NOT EXISTS (SELECT 1 FROM banned b WHERE b.user_id = u.user_id);`
    },
    prereq: ['select-where'], next: [],
    related: ['joins', 'aggregate-functions', 'subqueries-ctes'],
    tools: ['postgres', 'sqlite'],
    useCases: [
      'Deciding, explicitly, whether unknown values belong in a metric’s denominator.',
      'Detecting incomplete instrumentation by counting NULLs.',
      'Writing anti-joins safely.'
    ],
    avoid: [
      'Using NULL to mean "zero" or "false" — store the real value.',
      'Using a magic sentinel like -1 or "N/A" instead of NULL. It hides the problem and corrupts aggregates.'
    ],
    mistakes: [
      '`= NULL` instead of `IS NULL`.',
      '`NOT IN` against a nullable subquery, silently returning nothing.',
      'Reporting an average without stating whether NULLs were excluded.',
      'Assuming an empty string and NULL are the same. They are not.'
    ],
    keyTerms: [
      ['NULL', 'The absence of a value. Unknown, not zero.'],
      ['three-valued logic', 'True, false, unknown. WHERE keeps only true.'],
      ['IS NULL', 'The only valid null test.'],
      ['COALESCE', 'First non-null argument — the standard default-value tool.'],
      ['NULLIF', 'NULL when two values are equal. Guards division by zero.'],
      ['IS DISTINCT FROM', 'NULL-safe comparison; treats NULL as a comparable value.'],
      ['sentinel value', 'A fake stand-in like -1. Corrupts aggregates; avoid.']
    ],
    resources: [
      ['PostgreSQL — comparison functions and operators', 'https://www.postgresql.org/docs/current/functions-comparison.html', 'docs'],
      ['PostgreSQL — COALESCE, NULLIF, GREATEST', 'https://www.postgresql.org/docs/current/functions-conditional.html', 'docs'],
      ['Modern SQL — three-valued logic', 'https://modern-sql.com/concept/three-valued-logic', 'reference']
    ],
    questions: [
      ['Why does `AVG(salary)` change meaning when some salaries are NULL?', 'Aggregates skip NULLs, so the denominator is the count of non-null rows. The result is "average among those we know", which is a different metric from "average across everyone".'],
      ['Why does `NOT IN` break with NULLs?', 'The comparison yields unknown rather than true, and WHERE keeps only true rows, so the whole result is empty. Use `NOT EXISTS`.'],
      ['What are the three defensible ways to report a percentage over a column with NULLs?', 'Over known values only, over all rows with unknown counted as "not it", or by reporting "unknown" as its own explicit segment. All are valid; the mistake is not saying which you chose.']
    ]
  },

  {
    id: 'sql-data-types',
    title: 'SQL Data Types',
    domain: 'data-sql', tier: 2, priority: 'medium',
    summary: 'What kind of value a column holds — and why timestamps and money need special care.',
    what: `Every column declares a type: integers, decimals, text, booleans, timestamps, JSON. The type controls what can be stored, how it sorts, and how it can be indexed.`,
    why: `Two type decisions cause disproportionate pain. Storing money as a float produces rounding drift that eventually shows up in a finance report. Storing timestamps without a timezone produces daily metrics that are wrong for most of your users.`,
    analogy: `Labelled containers. A jug is for liquid, a box is for solids. Pouring soup into a cardboard box technically works for a moment and then does not.`,
    technical: `Numbers: \`INTEGER\`, \`BIGINT\`, \`NUMERIC(p,s)\` (exact — use for money), \`REAL\`/\`DOUBLE PRECISION\` (approximate — never for money).

Text: \`TEXT\` and \`VARCHAR(n)\` are effectively identical in Postgres; the length limit is a constraint, not an optimisation.

Time: \`TIMESTAMPTZ\` stores an absolute instant and converts on display. \`TIMESTAMP\` (without time zone) stores a wall-clock reading with no idea where it came from. **Store UTC, convert at the edge.**

\`JSONB\` stores semi-structured data and can be indexed — useful for event properties whose shape varies, but a poor substitute for real columns you query constantly.`,
    diagram: `
   MONEY
     REAL/FLOAT   19.99 + 0.01 -> 20.000000000000004     drift
     NUMERIC(10,2)19.99 + 0.01 -> 20.00                  exact
     INTEGER      1999 + 1     -> 2000  (cents)          exact + fast

   TIME
     TIMESTAMP    '2026-03-01 09:00'      ...where? unknowable
     TIMESTAMPTZ  '2026-03-01 09:00+05:30' absolute instant

     A "daily signups" chart built on naive timestamps
     silently splits each user's day at the SERVER's midnight.

   SEMI-STRUCTURED
     JSONB {"plan":"pro","utm":"x"}  flexible, indexable
     ...but if you filter on it every day, promote it to a column.`,
    example: {
      language: 'sql',
      caption: 'A schema that will not embarrass you later',
      code: `CREATE TABLE orders (
    order_id     BIGSERIAL PRIMARY KEY,
    user_id      BIGINT NOT NULL REFERENCES users(user_id),

    total_cents  INTEGER      NOT NULL CHECK (total_cents >= 0),  -- exact money
    currency     CHAR(3)      NOT NULL DEFAULT 'INR',

    status       TEXT         NOT NULL
                 CHECK (status IN ('pending','paid','refunded','cancelled')),

    created_at   TIMESTAMPTZ  NOT NULL DEFAULT now(),   -- absolute instant
    properties   JSONB        NOT NULL DEFAULT '{}'     -- variable event data
);

-- Reporting in the user's local day, not the server's
SELECT
    DATE_TRUNC('day', created_at AT TIME ZONE 'Asia/Kolkata') AS local_day,
    COUNT(*)                       AS orders,
    SUM(total_cents) / 100.0       AS revenue
FROM orders
WHERE status = 'paid'
GROUP BY 1 ORDER BY 1 DESC;`
    },
    prereq: ['tables-rows-columns'], next: ['indexes'],
    related: ['data-types', 'numbers'],
    tools: ['postgres', 'sqlite'],
    useCases: [
      'Reviewing a proposed schema before it becomes expensive to change.',
      'Explaining why a daily metric disagrees between two dashboards (timezone).',
      'Deciding whether an event property deserves its own column.'
    ],
    avoid: [
      'Floating point for money, ever.',
      'JSONB for fields you filter or join on constantly.',
      'Naive TIMESTAMP for anything user-facing.'
    ],
    mistakes: [
      'Storing money as a float and discovering the drift during an audit.',
      'Storing local time without a timezone, making cross-region reporting impossible.',
      'Using TEXT for a value with a fixed set of options instead of a CHECK constraint or enum.',
      'Storing numbers as text, which breaks sorting (`"10" < "9"`).'
    ],
    keyTerms: [
      ['NUMERIC / DECIMAL', 'Exact fixed-point arithmetic. Correct for money.'],
      ['TIMESTAMPTZ', 'An absolute instant, timezone-aware. The safe default.'],
      ['JSONB', 'Binary JSON — flexible and indexable.'],
      ['CHECK constraint', 'A rule the database enforces on a column’s values.'],
      ['enum', 'A type restricted to a fixed set of labels.'],
      ['UUID', 'A 128-bit identifier that can be generated anywhere without coordination.'],
      ['minor units', 'Storing money as integer cents to avoid floating point entirely.']
    ],
    resources: [
      ['PostgreSQL — data types', 'https://www.postgresql.org/docs/current/datatype.html', 'docs'],
      ['PostgreSQL — date/time types', 'https://www.postgresql.org/docs/current/datatype-datetime.html', 'docs'],
      ['PostgreSQL — JSON types', 'https://www.postgresql.org/docs/current/datatype-json.html', 'docs'],
      ['Don’t do this — Postgres wiki', 'https://wiki.postgresql.org/wiki/Don%27t_Do_This', 'reference']
    ],
    questions: [
      ['Why is float wrong for money?', 'Binary floating point cannot represent most decimal fractions exactly, so repeated arithmetic drifts. Use NUMERIC or integer minor units.'],
      ['Why does TIMESTAMPTZ matter for a daily metric?', 'Without a timezone, every day boundary is the server’s midnight. Users in other regions get their activity split across the wrong days, and two dashboards using different assumptions will disagree.'],
      ['When should an event property become a real column?', 'When you filter, join or aggregate on it regularly. JSONB is right for variable, rarely-queried properties, not for your core dimensions.']
    ]
  },

  {
    id: 'indexes',
    title: 'Indexes',
    domain: 'data-sql', tier: 2, priority: 'medium',
    summary: 'A lookup structure that turns "scan everything" into "go straight there" — at a cost.',
    what: `An index is a separate data structure the database maintains so it can find rows matching a condition without reading the whole table.`,
    why: `The difference between a query returning in 5 milliseconds and 50 seconds is usually a single index. And understanding the write cost explains why engineers push back on "just add an index" — every index makes every insert and update slower.`,
    analogy: `The index at the back of a book. Without it you read every page to find "photosynthesis". With it you jump to page 214. The index costs paper, and it must be reprinted whenever the book changes.`,
    technical: `A **B-tree** index (the default) supports equality, ranges and sorting. Others: **hash** (equality only), **GIN** (JSONB, arrays, full-text), **GiST** (geometry), and **HNSW/IVFFlat** (vector similarity, via pgvector).

A **composite** index on \`(a, b)\` serves queries filtering on \`a\`, or \`a\` and \`b\` — but not \`b\` alone. Leftmost prefix rule.

Costs: disk space, and slower writes because every index must be updated. An index also cannot help if the query wraps the column in a function (\`WHERE lower(email) = ...\`) unless you build a matching expression index.

\`EXPLAIN ANALYZE\` shows what the planner actually did — the only reliable way to know.`,
    diagram: `
   WITHOUT INDEX              WITH INDEX ON email

   Seq Scan                   Index Scan
   read all 10,000,000 rows   B-tree: ~23 hops
   ~4 s                       ~0.4 ms

   COST OF AN INDEX
     + reads get much faster
     - every INSERT/UPDATE/DELETE must maintain it
     - it consumes disk
   That is why "just add an index" is a trade, not a freebie.

   COMPOSITE (user_id, created_at)  — leftmost prefix rule
     WHERE user_id = 5                          uses it
     WHERE user_id = 5 AND created_at > '...'   uses it
     WHERE created_at > '...'                   CANNOT use it`,
    example: {
      language: 'sql',
      caption: 'Diagnosing with EXPLAIN, then fixing',
      code: `-- 1. What is it actually doing?
EXPLAIN ANALYZE
SELECT * FROM events
WHERE user_id = 42
  AND occurred_at >= CURRENT_DATE - INTERVAL '7 days';
-- Seq Scan on events  (cost=0..184,320  rows=17  actual time=3,912 ms)
--   ^ reading the entire table to return 17 rows

-- 2. Composite index, most selective column first
CREATE INDEX idx_events_user_time ON events (user_id, occurred_at DESC);

-- Index Scan using idx_events_user_time (actual time=0.38 ms)

-- 3. A function on the column defeats a plain index
--    slow:  WHERE lower(email) = 'a@b.com'
CREATE INDEX idx_users_email_lower ON users (lower(email));   -- now it is used

-- 4. Partial index: only what you actually query
CREATE INDEX idx_orders_pending ON orders (created_at)
WHERE status = 'pending';        -- far smaller, far cheaper to maintain`
    },
    prereq: ['sql-data-types'], next: ['transactions'],
    related: ['ann-indexes', 'vector-databases', 'latency-throughput'],
    tools: ['postgres', 'sqlite', 'pgvector'],
    useCases: [
      'Understanding why a dashboard query is slow.',
      'Judging the cost of an "add an index" request during planning.',
      'Recognising the same trade-off when it reappears in vector databases.'
    ],
    avoid: [
      'Indexing every column speculatively — writes degrade and the planner gets worse choices.',
      'Indexing a very low-cardinality column such as a boolean, on its own.',
      'Adding indexes without measuring with EXPLAIN ANALYZE first.'
    ],
    mistakes: [
      'Assuming an index is free. It taxes every write, forever.',
      'Expecting a composite index on (a, b) to help a query filtering only on b.',
      'Wrapping the indexed column in a function and wondering why the index is ignored.',
      'Optimising a query nobody runs.'
    ],
    keyTerms: [
      ['index', 'A structure that speeds lookups at the cost of space and write speed.'],
      ['B-tree', 'Default index type; handles equality, ranges and ordering.'],
      ['composite index', 'An index over several columns; usable left-to-right only.'],
      ['selectivity', 'How much of the table a condition eliminates. High selectivity indexes well.'],
      ['sequential scan', 'Reading every row. Fine on small tables, disastrous on large ones.'],
      ['EXPLAIN ANALYZE', 'Shows the plan the database actually executed, with real timings.'],
      ['partial index', 'An index covering only rows matching a condition.'],
      ['covering index', 'An index containing every column the query needs, so the table is never read.']
    ],
    resources: [
      ['PostgreSQL — indexes', 'https://www.postgresql.org/docs/current/indexes.html', 'docs'],
      ['PostgreSQL — using EXPLAIN', 'https://www.postgresql.org/docs/current/using-explain.html', 'docs'],
      ['Use The Index, Luke — free book', 'https://use-the-index-luke.com/', 'course'],
      ['pgvector — indexing', 'https://github.com/pgvector/pgvector#indexing', 'repo']
    ],
    questions: [
      ['Why is "just add an index" not free?', 'Every index must be updated on every insert, update and delete, and it consumes disk. Reads get faster; writes get slower. It is a trade-off, not a pure win.'],
      ['Why does an index on (user_id, created_at) not help a query filtering only on created_at?', 'B-tree composite indexes are ordered by the leftmost column first. Without a user_id predicate, the index gives no useful ordering for created_at.'],
      ['How is a database index conceptually the same as an ANN index in a vector store?', 'Both trade space and write cost for lookup speed, and both need the query to match the structure they were built for. The ANN version additionally trades exactness for speed.']
    ]
  },

  {
    id: 'normalization',
    title: 'Normalization',
    domain: 'data-sql', tier: 2, priority: 'medium',
    summary: 'Storing each fact exactly once, so it cannot disagree with itself.',
    what: `Normalization is organising tables so that every fact lives in exactly one place. If a customer's address is stored in one table only, it cannot be updated in one place and stale in another.`,
    why: `Duplicated data eventually contradicts itself, and then nobody knows which copy is true. That is a data-quality problem that surfaces as "the two dashboards disagree" and consumes weeks.`,
    analogy: `One master address book instead of everyone keeping their own copy. When someone moves, you update one entry rather than hoping fourteen people update theirs.`,
    technical: `Practically, three forms cover most of it:
- **1NF** — each cell holds a single value; no comma-separated lists.
- **2NF** — no column depends on only part of a composite key.
- **3NF** — no column depends on another non-key column. If \`city\` determines \`state\`, \`state\` does not belong here.

**Denormalization** is the deliberate reverse: duplicating data to avoid joins, accepting the risk of divergence in exchange for read speed. Analytical warehouses are usually denormalized into star schemas on purpose. Normalized for the product, denormalized for analytics, is a very common and correct split.`,
    diagram: `
   DENORMALIZED (one table)
   +---------+------------------+-------------+----------+
   | order_id| customer_email   | customer_tz | product  |
   +---------+------------------+-------------+----------+
   | 1       | ana@example.com  | IST         | Widget   |
   | 2       | ana@example.com  | IST         | Gadget   |   duplicated
   | 3       | ana@example.com  | PST         | Doohickey|   <- now contradicts!
   +---------+------------------+-------------+----------+

   NORMALIZED
   customers                     orders
   +----+---------+-----+        +----+---------+---------+
   | id | email   | tz  |        | id | cust_id | product |
   +----+---------+-----+        +----+---------+---------+
   | 7  | ana@... | IST |        | 1  | 7       | Widget  |
   +----+---------+-----+        | 2  | 7       | Gadget  |
   one fact, one place           +----+---------+---------+

   OLTP  -> normalized   (correctness under writes)
   OLAP  -> star schema  (speed under reads)`,
    example: {
      language: 'sql',
      caption: 'The 1NF violation that makes data unqueryable',
      code: `-- VIOLATES 1NF: multiple values in one cell
CREATE TABLE users_bad (
    user_id INTEGER PRIMARY KEY,
    tags    TEXT          -- 'billing,enterprise,priority'
);
-- "How many enterprise users?" becomes string matching:
--   WHERE tags LIKE '%enterprise%'
-- which also matches 'non-enterprise'. There is no fix.

-- 1NF: one value per cell, one row per fact
CREATE TABLE user_tags (
    user_id INTEGER NOT NULL REFERENCES users(user_id),
    tag     TEXT    NOT NULL,
    PRIMARY KEY (user_id, tag)
);
SELECT COUNT(DISTINCT user_id) FROM user_tags WHERE tag = 'enterprise';

-- Deliberate denormalization for analytics (a star schema fact table)
CREATE TABLE fact_orders (
    order_id      BIGINT,
    order_date    DATE,
    customer_key  BIGINT,
    customer_country TEXT,   -- copied on purpose: avoids a join on every query
    revenue_cents INTEGER
);`
    },
    prereq: ['keys-relationships'], next: ['database-design'],
    related: ['indexes', 'dashboards-indicators'],
    tools: ['postgres'],
    useCases: [
      'Reviewing a schema proposal for facts stored in more than one place.',
      'Explaining why two reports disagree.',
      'Understanding why the warehouse looks different from the product database.'
    ],
    avoid: [
      'Normalizing an analytical warehouse to third normal form — reads become join-heavy and slow.',
      'Normalizing so aggressively that a simple read needs eight joins.'
    ],
    mistakes: [
      'Comma-separated values in a column, which makes accurate counting impossible.',
      'Denormalizing without a mechanism to keep the copies in sync.',
      'Treating normalization as a virtue in itself rather than a tool for write correctness.'
    ],
    keyTerms: [
      ['normalization', 'Structuring so each fact is stored once.'],
      ['denormalization', 'Deliberately duplicating data to speed up reads.'],
      ['1NF', 'One value per cell.'],
      ['3NF', 'No non-key column depends on another non-key column.'],
      ['update anomaly', 'Changing one copy of a duplicated fact and leaving others stale.'],
      ['star schema', 'A central fact table surrounded by dimension tables. The warehouse norm.'],
      ['source of truth', 'The one place a fact is authoritative.']
    ],
    resources: [
      ['PostgreSQL — data definition', 'https://www.postgresql.org/docs/current/ddl.html', 'docs'],
      ['Wikipedia — database normalization', 'https://en.wikipedia.org/wiki/Database_normalization', 'reference'],
      ['Kimball Group — dimensional modelling techniques', 'https://www.kimballgroup.com/data-warehouse-business-intelligence-resources/kimball-techniques/dimensional-modeling-techniques/', 'reference']
    ],
    questions: [
      ['What is an update anomaly?', 'When a fact is stored in several places and one copy is changed, the others become stale and the data contradicts itself.'],
      ['Why are warehouses deliberately denormalized?', 'Analytical queries scan huge volumes and joins are expensive. Duplicating dimension attributes into the fact table trades storage and write complexity for much faster reads.'],
      ['Why is a comma-separated tag column so damaging?', 'It violates 1NF, so accurate filtering and counting are impossible — `LIKE \'%enterprise%\'` also matches `non-enterprise`, and there is no correct workaround.']
    ]
  },

  {
    id: 'transactions',
    title: 'Transactions',
    domain: 'data-sql', tier: 2, priority: 'medium',
    summary: 'A group of changes that either all happen or none do.',
    what: `A transaction wraps several statements so they succeed together or fail together. Debit one account and credit another: both, or neither. Never one.`,
    why: `It is the guarantee that keeps data consistent when things fail halfway. Understanding it explains why some operations are safe to retry and others are not — which matters directly when designing an agent that can take actions.`,
    analogy: `A wedding ceremony. Both people say yes, or nobody is married. There is no state in which one person is married and the other is not.`,
    technical: `**ACID**: Atomicity (all or nothing), Consistency (constraints hold), Isolation (concurrent transactions do not see each other's partial work), Durability (committed means survives a crash).

\`BEGIN\` ... \`COMMIT\` or \`ROLLBACK\`. Isolation levels trade correctness for concurrency: *read committed* (Postgres default) prevents dirty reads; *serializable* prevents everything but costs throughput and may abort transactions you must retry.

Long transactions hold locks and block others. Keep them short, and never wait for a slow external API inside one.`,
    diagram: `
   BEGIN;
     UPDATE accounts SET balance = balance - 100 WHERE id = 1;
     -- crash here?
     UPDATE accounts SET balance = balance + 100 WHERE id = 2;
   COMMIT;

   Crash before COMMIT -> BOTH updates are discarded.
   The money is never in limbo.

   WHY THIS MATTERS FOR AI AGENTS

   agent calls refund_tool
        |
        +-- network timeout: did the refund happen?
        |
        +-- retry blindly  -> possible DOUBLE REFUND
        +-- idempotency key -> the second call is a no-op

   "Can this action be safely retried?" is a transaction question.`,
    example: {
      language: 'sql',
      caption: 'Atomic multi-step change, and the idempotency pattern',
      code: `BEGIN;

INSERT INTO orders (user_id, total_cents, status)
VALUES (42, 4999, 'paid')
RETURNING order_id;

UPDATE inventory
SET quantity = quantity - 1
WHERE sku = 'WIDGET-1' AND quantity > 0;

-- if that matched no row, stock ran out: undo everything
-- ROLLBACK;

COMMIT;


-- Idempotency: makes a retried action safe
CREATE TABLE refunds (
    idempotency_key TEXT PRIMARY KEY,   -- caller-supplied, unique per intent
    order_id        BIGINT NOT NULL,
    amount_cents    INTEGER NOT NULL,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

INSERT INTO refunds (idempotency_key, order_id, amount_cents)
VALUES ('refund-order-991-attempt', 991, 4999)
ON CONFLICT (idempotency_key) DO NOTHING;   -- a retry changes nothing`
    },
    prereq: ['indexes'], next: ['database-design'],
    related: ['agent-failure-modes', 'tool-calling', 'exceptions'],
    tools: ['postgres', 'sqlite'],
    useCases: [
      'Guaranteeing a multi-step change cannot half-complete.',
      'Designing agent tools that are safe to retry after a timeout.',
      'Explaining why an operation cannot simply be replayed.'
    ],
    avoid: [
      'Wrapping a slow external API call inside a transaction — locks are held the whole time.',
      'Long-running analytical queries inside write transactions.'
    ],
    mistakes: [
      'Assuming a failed request means nothing happened. It may have committed before the response was lost.',
      'Retrying a non-idempotent write and duplicating the effect.',
      'Holding a transaction open across user think-time.'
    ],
    keyTerms: [
      ['transaction', 'A group of statements that commit or roll back together.'],
      ['ACID', 'Atomicity, Consistency, Isolation, Durability.'],
      ['COMMIT / ROLLBACK', 'Make changes permanent, or discard them.'],
      ['isolation level', 'How much concurrent transactions may see of each other.'],
      ['lock', 'A hold on a row or table preventing conflicting concurrent changes.'],
      ['deadlock', 'Two transactions each waiting for a lock the other holds.'],
      ['idempotency key', 'A caller-supplied unique id making a repeated request a no-op.']
    ],
    resources: [
      ['PostgreSQL — transactions', 'https://www.postgresql.org/docs/current/tutorial-transactions.html', 'docs'],
      ['PostgreSQL — transaction isolation', 'https://www.postgresql.org/docs/current/transaction-iso.html', 'docs'],
      ['Stripe — idempotent requests', 'https://docs.stripe.com/api/idempotent_requests', 'docs']
    ],
    questions: [
      ['Why does a timeout not mean "it did not happen"?', 'The write may have committed before the response was lost in transit. Without an idempotency key, retrying can duplicate the effect.'],
      ['Why should an agent tool that takes a real-world action be idempotent?', 'Agents retry on failure. If the tool is not idempotent, a retry after a lost response performs the action twice — a double refund, a duplicate email.'],
      ['What does holding a long transaction cost?', 'It holds locks, blocking other transactions, and prevents cleanup of old row versions. Transactions should be short and never span a slow external call.']
    ]
  },

  {
    id: 'database-design',
    title: 'Basic Database Design',
    domain: 'data-sql', tier: 3, priority: 'medium',
    summary: 'Deciding what the tables should be — an act of product thinking, not just engineering.',
    what: `Database design is choosing the entities, their attributes and their relationships. It is where a mental model of the business becomes a structure that either supports the product or fights it.`,
    why: `A schema encodes assumptions. "One user has one account" is a modelling choice that becomes a wall the day you sell to teams. Schema changes on large live tables are slow, risky and sometimes require downtime — which is why this deserves attention before code exists, not after.`,
    analogy: `The floor plan of a building. Moving a wall while people live there is possible but expensive and disruptive. Getting the rooms roughly right on paper costs an afternoon.`,
    technical: `A workable process: list the **nouns** (entities), give each an id, list the **attributes** each genuinely owns, then define **cardinality** between them. Sketch it, then walk your key product questions through it and confirm each is answerable.

Design for change: prefer surrogate keys, add \`created_at\`/\`updated_at\` everywhere, use soft deletes (\`deleted_at\`) where history matters, and start event tables append-only.

Consider **slowly changing dimensions**: if a user changes plan, does the old order still report under the old plan? Storing the plan on the order (a point-in-time snapshot) versus joining to the user's current plan gives different — and both legitimate — answers.`,
    diagram: `
   1. NOUNS            user, order, item, product, event

   2. RELATIONSHIPS    user  1---n  order
                       order 1---n  item
                       item  n---1  product

   3. WALK THE QUESTIONS THROUGH IT
      "revenue by signup month"  -> needs users.created_at    ok
      "revenue by acquisition
       channel"                  -> no such column            GAP
      "what plan were they on
       when they bought?"        -> only current plan stored  GAP

   4. DESIGN FOR CHANGE
      surrogate keys · created_at/updated_at ·
      soft deletes · point-in-time snapshots on facts`,
    example: {
      language: 'sql',
      caption: 'A schema that answers historical questions, not just current ones',
      code: `CREATE TABLE users (
    user_id       BIGSERIAL PRIMARY KEY,
    email         TEXT UNIQUE NOT NULL,
    plan          TEXT NOT NULL DEFAULT 'free',   -- CURRENT plan
    signup_source TEXT,                           -- capture it or lose it forever
    created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
    deleted_at    TIMESTAMPTZ                     -- soft delete
);

-- history, so "what plan were they on in March?" stays answerable
CREATE TABLE user_plan_history (
    user_id    BIGINT NOT NULL REFERENCES users(user_id),
    plan       TEXT   NOT NULL,
    valid_from TIMESTAMPTZ NOT NULL,
    valid_to   TIMESTAMPTZ,                       -- NULL = current
    PRIMARY KEY (user_id, valid_from)
);

CREATE TABLE orders (
    order_id      BIGSERIAL PRIMARY KEY,
    user_id       BIGINT NOT NULL REFERENCES users(user_id),
    total_cents   INTEGER NOT NULL,
    plan_at_purchase TEXT NOT NULL,   -- point-in-time snapshot: never re-writes history
    created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);`
    },
    prereq: ['normalization', 'transactions'], next: [],
    related: ['upstream-downstream', 'event-tracking', 'data-dependencies'],
    tools: ['postgres'],
    useCases: [
      'Reviewing a schema proposal against the questions the business will ask.',
      'Catching a missing attribute before the data is lost forever.',
      'Deciding whether history needs to be preserved for a changing attribute.'
    ],
    avoid: [
      'Designing for hypothetical requirements three years out.',
      'Modelling every conceivable relationship before the product exists.'
    ],
    mistakes: [
      'Not capturing an attribute at the moment it is knowable. You cannot backfill acquisition channel.',
      'Assuming attributes never change, then finding history has been silently overwritten.',
      'Modelling one-to-one where the business is really one-to-many (a user with two workspaces).',
      'Leaving analytics until after launch, then discovering nothing was instrumented.'
    ],
    keyTerms: [
      ['entity', 'A thing the business cares about; usually becomes a table.'],
      ['ERD', 'Entity relationship diagram — the picture of the model.'],
      ['soft delete', 'Marking a row deleted rather than removing it, preserving history.'],
      ['slowly changing dimension', 'An attribute that changes over time and may need history kept.'],
      ['point-in-time snapshot', 'Copying an attribute onto a fact so history stays correct.'],
      ['migration', 'A versioned schema change applied to a live database.'],
      ['backfill', 'Populating a new column for existing rows — only possible if the data exists somewhere.']
    ],
    resources: [
      ['PostgreSQL — DDL reference', 'https://www.postgresql.org/docs/current/ddl.html', 'docs'],
      ['Kimball — dimensional modelling techniques', 'https://www.kimballgroup.com/data-warehouse-business-intelligence-resources/kimball-techniques/dimensional-modeling-techniques/', 'reference'],
      ['dbdiagram.io — sketch schemas', 'https://dbdiagram.io/', 'interactive']
    ],
    questions: [
      ['Why is "we can add that column later" sometimes false?', 'You can add the column, but you cannot backfill data that was never captured. Acquisition channel at signup is knowable only at signup.'],
      ['What is a point-in-time snapshot and why use it?', 'Copying an attribute onto the fact row as it was at the time — the plan at purchase, for example. It keeps historical reporting correct even after the user changes plan.'],
      ['What is the fastest way to sanity-check a schema?', 'Take the five product questions the business asks most and trace each through the model. Any question you cannot answer is a gap you can still fix cheaply.']
    ]
  },

  {
    id: 'sql-for-product',
    title: 'SQL for Product Questions',
    domain: 'data-sql', tier: 3, priority: 'high',
    summary: 'Translating a vague product question into a query, and knowing what the answer does not say.',
    what: `The skill of turning "where are users dropping off?" into a specific, defensible query — and being explicit about every assumption you had to make to write it.`,
    why: `The bottleneck in product analytics is rarely SQL syntax. It is that "active user" means four different things to four people. Writing the query forces the definition into the open, and that is most of the value.`,
    analogy: `Translating a wish into a contract. "I want it to be fast" becomes "p95 under 400ms on 4G". The translation is the work; typing it up is the easy part.`,
    technical: `A repeatable method:
1. **Restate** the question with every ambiguity resolved (which event, which window, which population).
2. **Find the grain** — one row per what?
3. **Write it** as CTEs, one step at a time.
4. **Sanity-check** — do the totals reconcile with a number you already trust?
5. **State the caveats** — what this number excludes, and what it cannot tell you.

Step 5 is what separates an analyst from a query. A funnel shows *where* people drop, never *why*.`,
    diagram: `
   VAGUE                  "Where are users dropping off?"
     |
     v  restate
   PRECISE   Of users who signed up in the last 30 days,
             what share reached each onboarding step,
             counting each user once, at their furthest step?
     |
     v  grain
   ONE ROW PER USER (not per event — that double counts)
     |
     v  write
   signups -> furthest_step -> counts per step
     |
     v  check
   step 1 count == signup count?  if not, instrumentation gap
     |
     v  caveats
   - excludes users who signed up and returned later
   - mobile app v3.2 never fired step_2  <- the "drop" may be a BUG
   - tells you WHERE, never WHY`,
    example: {
      language: 'sql',
      caption: '"Where are users dropping?" — one row per user, at their furthest step',
      code: `WITH cohort AS (
    SELECT user_id, created_at
    FROM users
    WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'
      AND deleted_at IS NULL
),
furthest AS (
    SELECT
        c.user_id,
        MAX(CASE e.event_name
                WHEN 'signup_completed'      THEN 1
                WHEN 'profile_created'       THEN 2
                WHEN 'first_project_created' THEN 3
                WHEN 'first_invite_sent'     THEN 4
                ELSE 0
            END) AS furthest_step          -- one row per user, no double counting
    FROM cohort c
    LEFT JOIN events e
           ON e.user_id = c.user_id
          AND e.occurred_at BETWEEN c.created_at AND c.created_at + INTERVAL '7 days'
    GROUP BY c.user_id
)
SELECT
    step,
    COUNT(*) FILTER (WHERE furthest_step >= step)                       AS reached,
    ROUND(100.0 * COUNT(*) FILTER (WHERE furthest_step >= step)
          / NULLIF((SELECT COUNT(*) FROM cohort), 0), 1)                AS pct_of_cohort
FROM furthest
CROSS JOIN generate_series(1, 4) AS step
GROUP BY step
ORDER BY step;

-- Always reconcile: does step 1 equal the cohort size?
-- If not, signup_completed is not firing for everyone — that is an
-- instrumentation bug, and every downstream percentage is wrong.`
    },
    prereq: ['case-expressions', 'joins'], next: [],
    related: ['funnels', 'event-tracking', 'product-metrics', 'ab-testing'],
    tools: ['postgres', 'duckdb'],
    useCases: [
      'Answering "how many users completed onboarding?" defensibly.',
      'Locating the drop-off step before deciding what to investigate.',
      'Measuring what changed after a feature launch.'
    ],
    avoid: [
      'When the question is "why" — that needs research, session replay or interviews.',
      'When the sample is too small for the difference to mean anything.',
      'When the event was never instrumented. No query can recover data that was not recorded.'
    ],
    mistakes: [
      'Counting events instead of users, and double-counting anyone who retried.',
      'Reporting a funnel without checking that step 1 reconciles with the cohort size.',
      'Presenting a drop-off as user behaviour when it is a tracking bug in one client version.',
      'Omitting the time window, making the number irreproducible next week.'
    ],
    keyTerms: [
      ['grain', 'What one row represents. Get it wrong and every number is wrong.'],
      ['cohort', 'A group defined by a shared starting event, usually a time window.'],
      ['reconciliation', 'Checking a new number against one already trusted.'],
      ['instrumentation gap', 'An event that was never logged, or logged inconsistently.'],
      ['operational definition', 'The exact, queryable version of a fuzzy term like "active".'],
      ['caveat', 'What the number excludes or cannot show. Part of the answer, not an apology.']
    ],
    resources: [
      ['Mode — SQL tutorial for data analysis', 'https://mode.com/sql-tutorial/', 'course'],
      ['PostgreSQL Exercises', 'https://pgexercises.com/', 'interactive'],
      ['Amplitude — behavioural analytics guides', 'https://amplitude.com/blog/product-analytics-guide', 'reference'],
      ['SQL Murder Mystery — practice by solving a case', 'https://mystery.knightlab.com/', 'interactive']
    ],
    questions: [
      ['What is the first thing to check in any funnel query?', 'That step 1 reconciles with the cohort size. If it does not, the event is not firing reliably and every percentage below it is wrong.'],
      ['Why count users rather than events in a funnel?', 'A user who retries fires the event several times. Counting events inflates early steps and understates the drop-off.'],
      ['A funnel shows a 60% drop at step 2. What can you conclude?', 'Only where the drop is, never why. It could be a confusing UI, a slow page, a wrong audience — or an instrumentation bug in one client version. The next step is investigation, not a redesign.']
    ],
    interview: {
      s30: 'I turn a vague product question into a precise, reproducible query — deciding exactly what counts as the action, as a user, and as the time window — and then I state what the number cannot tell you.',
      s90: 'Most of the work is definitional rather than technical. "Where are users dropping off?" has to become "of users who signed up in the last 30 days, what share reached each onboarding step, counting each user once at their furthest step". Writing that forces three decisions into the open that people otherwise disagree about silently. Then I reconcile — if step one does not equal the cohort size, the event is not firing reliably and every number below it is wrong, which is a tracking bug rather than a user-behaviour finding. Finally I present the caveats alongside the number, because a funnel tells you where people leave and never why.',
      pm: 'It means I can answer my own questions in an hour instead of queuing behind a data team, and it means I am much harder to mislead by a dashboard.'
    }
  }
];
