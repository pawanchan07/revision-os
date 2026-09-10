/**
 * DOMAIN — PRODUCT ANALYTICS + STATISTICS (BUILD.md sections 5 and 27)
 * Descriptive statistics, event analytics, funnels, cohorts, experimentation.
 */
export const topics = [
  {
    id: 'descriptive-statistics',
    title: 'Descriptive Statistics',
    domain: 'analytics', tier: 1, priority: 'high',
    summary: 'Summarising many numbers with a few — and knowing which summary lies.',
    what: `Descriptive statistics compress a pile of numbers into a handful you can hold in your head: a middle (mean, median, mode) and a spread (range, variance, standard deviation).`,
    why: `Every metric on every dashboard is a summary. If you do not know which summary was used, you do not know what the number means. "Average session length is 12 minutes" is compatible with almost every user spending 30 seconds.`,
    analogy: `Describing a crowd. "Average height 5'8"" tells you something. It tells you nothing about whether everyone is 5'8" or half are children and half are basketball players.`,
    technical: `**Mean** is the arithmetic average — sensitive to outliers. **Median** is the middle value — robust. **Mode** is the most common value.

Spread: **range** (max − min), **variance** (average squared distance from the mean), **standard deviation** (its square root, back in the original units).

The decisive question is the **shape** of the distribution. For symmetric data the mean is fine. For the long-tailed distributions that dominate product data — session length, revenue per user, API latency — the median and percentiles are far more honest.`,
    diagram: `
   SAME MEAN, COMPLETELY DIFFERENT REALITY

   A: 10 10 10 10 10        mean 10   median 10   sd 0
   B:  1  1  1  1 46        mean 10   median  1   sd 20

   A dashboard showing "average = 10" cannot tell them apart.

   TYPICAL PRODUCT DATA IS RIGHT-SKEWED

   count
     |*
     |**
     |***
     |****
     |*****___
     |         ‾‾‾‾----____________
     +---------------------------------> session length
       ^      ^                     ^
     median  mean              a few whales
                               drag the mean right

   Report the MEDIAN and the PERCENTILES.`,
    example: {
      language: 'sql',
      caption: 'Never report a mean alone',
      code: `SELECT
    COUNT(*)                                                  AS n,
    ROUND(AVG(session_seconds), 1)                            AS mean,
    PERCENTILE_CONT(0.50) WITHIN GROUP (ORDER BY session_seconds) AS median,
    PERCENTILE_CONT(0.90) WITHIN GROUP (ORDER BY session_seconds) AS p90,
    PERCENTILE_CONT(0.99) WITHIN GROUP (ORDER BY session_seconds) AS p99,
    ROUND(STDDEV(session_seconds), 1)                         AS sd,
    MIN(session_seconds)                                      AS min,
    MAX(session_seconds)                                      AS max
FROM sessions
WHERE started_at >= CURRENT_DATE - INTERVAL '7 days';

-- Result:  n=48,201  mean=720  median=95  p90=1,840  p99=9,600
-- Reading: the typical session is 95 seconds. A small number of very
-- long sessions pull the mean to 720. Reporting "12 minutes average"
-- would describe almost nobody.`
    },
    prereq: [], next: ['distributions', 'percentiles'],
    related: ['numbers', 'ab-testing', 'ai-latency'],
    tools: ['postgres', 'duckdb'],
    useCases: [
      'Summarising any metric honestly on a dashboard.',
      'Spotting that an "average" is being dragged by a handful of outliers.',
      'Describing latency, which is always long-tailed.'
    ],
    avoid: [
      'Mean alone on skewed data — use median plus percentiles.',
      'Any summary on a tiny sample, where individual values dominate.'
    ],
    mistakes: [
      'Reporting a mean without a spread, so nobody can tell whether it is representative.',
      'Averaging an average — the mean of per-group means is not the overall mean unless the groups are equal in size.',
      'Comparing means between two skewed groups and concluding anything.'
    ],
    keyTerms: [
      ['mean', 'Arithmetic average. Sensitive to outliers.'],
      ['median', 'The middle value. Robust to outliers.'],
      ['mode', 'The most frequently occurring value.'],
      ['variance', 'Average squared deviation from the mean.'],
      ['standard deviation', 'Square root of variance; in the same units as the data.'],
      ['skew', 'Asymmetry of a distribution. Product data is usually right-skewed.'],
      ['outlier', 'A value far from the rest. May be real, may be a bug.'],
      ['Simpson’s paradox', 'A trend that reverses when data is split into groups.']
    ],
    resources: [
      ['Khan Academy — summarizing quantitative data', 'https://www.khanacademy.org/math/statistics-probability/summarizing-quantitative-data', 'course'],
      ['Seeing Theory — basic probability, visualised', 'https://seeing-theory.brown.edu/basic-probability/index.html', 'interactive'],
      ['PostgreSQL — aggregate functions', 'https://www.postgresql.org/docs/current/functions-aggregate.html', 'docs']
    ],
    questions: [
      ['When is the median more honest than the mean?', 'Whenever the distribution is skewed — session length, revenue per user, latency. The mean is dragged by a small number of extreme values and stops describing a typical case.'],
      ['Why is a mean without a spread incomplete?', 'Two very different distributions can share a mean. Without a standard deviation or percentiles, the reader cannot tell whether the average describes anyone.'],
      ['Why can you not average a set of averages?', 'Unless every group has the same size, the groups need weighting by their counts. Otherwise a group of 3 counts as much as a group of 3,000.']
    ]
  },

  {
    id: 'distributions',
    title: 'Distributions',
    domain: 'analytics', tier: 2, priority: 'medium',
    summary: 'The shape of your data — which determines which statistics are even valid.',
    what: `A distribution describes how values are spread out: how many are small, how many are large, and where the bulk sits.`,
    why: `The shape decides your method. Normal-ish data behaves under means and standard deviations. Power-law data — which describes most product usage — does not, and applying the wrong toolkit produces confident nonsense.`,
    analogy: `Height versus wealth. Heights cluster tightly around an average, with nobody ten times the mean. Wealth does not: a single person can hold more than a million others combined. Same maths, wildly different behaviour.`,
    technical: `**Normal (Gaussian)** — symmetric bell; mean and standard deviation describe it fully. Rare in raw product data, but sample *means* trend normal thanks to the Central Limit Theorem, which is what makes A/B testing work.

**Right-skewed / log-normal / power-law** — long tail. Typical of revenue per user, session length, and content popularity. Summarise with median and percentiles; consider a log scale.

**Bimodal** — two peaks, usually meaning two populations were accidentally merged (mobile and desktop, free and paid). Splitting them is usually the insight.`,
    diagram: `
   NORMAL                    RIGHT-SKEWED             BIMODAL
      _                       |*                       _     _
    _/ \\_                     |**                    _/ \\_ _/ \\_
   /     \\                    |***_                 /     X     \\
  /       \\                   |    ‾‾--___         /             \\
 ---------------             ---------------      ---------------
   mean = median              median < mean         mean is between
   sd is meaningful           use percentiles       the two peaks —
                                                    i.e. describes
   heights, measurement       revenue, latency,     NOBODY.
   error, sample means        session length
                                                    -> split the groups

   CENTRAL LIMIT THEOREM
   Individual values may be wildly skewed, but the
   AVERAGE of large samples is normally distributed.
   That is why A/B tests on skewed metrics still work.`,
    example: {
      language: 'sql',
      caption: 'Look at the shape before choosing a summary',
      code: `-- A histogram in SQL: bucket, then count
SELECT
    WIDTH_BUCKET(session_seconds, 0, 600, 12) AS bucket,
    (WIDTH_BUCKET(session_seconds, 0, 600, 12) - 1) * 50 AS lower_bound,
    COUNT(*)                                  AS sessions,
    REPEAT('*', (COUNT(*) / 200)::int)        AS bar
FROM sessions
WHERE started_at >= CURRENT_DATE - INTERVAL '7 days'
GROUP BY 1, 2
ORDER BY 1;

--  lower_bound | sessions | bar
--  ------------+----------+---------------------------
--            0 |    18420 | ********************************
--           50 |     9110 | ***************
--          100 |     4980 | ********
--          150 |     2140 | ***
--          ...
--          550 |      310 |
--  Classic right skew. Report the median, never the mean.

-- Bimodal check: is this actually two populations?
SELECT platform,
       PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY session_seconds) AS median
FROM sessions GROUP BY platform;
-- mobile 42s, desktop 310s -> yes. The combined "average" describes nobody.`
    },
    prereq: ['descriptive-statistics'], next: ['percentiles', 'variance-correlation'],
    related: ['ab-testing', 'statistical-significance'],
    tools: ['duckdb', 'postgres'],
    useCases: [
      'Choosing between mean and median defensibly.',
      'Discovering that one metric is really two populations combined.',
      'Explaining why the p99 latency is nothing like the average.'
    ],
    avoid: [
      'Assuming normality because a statistic exists for it.',
      'Fitting a distribution when you only need to look at a histogram.'
    ],
    mistakes: [
      'Treating power-law data with normal-distribution intuitions.',
      'Reporting a single number for a bimodal metric, describing neither group.',
      'Removing outliers because they are inconvenient rather than because they are wrong.'
    ],
    keyTerms: [
      ['normal distribution', 'Symmetric bell curve; fully described by mean and sd.'],
      ['power law / long tail', 'A few very large values dominate the total.'],
      ['log-normal', 'Normal once you take logarithms. Common for durations and revenue.'],
      ['bimodal', 'Two peaks — usually two populations merged by accident.'],
      ['histogram', 'A count of values per bucket. The fastest way to see shape.'],
      ['Central Limit Theorem', 'Sample means tend toward normal regardless of the underlying shape.']
    ],
    resources: [
      ['Seeing Theory — probability distributions', 'https://seeing-theory.brown.edu/probability-distributions/index.html', 'interactive'],
      ['Khan Academy — modeling data distributions', 'https://www.khanacademy.org/math/statistics-probability/modeling-distributions-of-data', 'course'],
      ['PostgreSQL — WIDTH_BUCKET', 'https://www.postgresql.org/docs/current/functions-math.html', 'docs']
    ],
    questions: [
      ['What does a bimodal metric usually mean?', 'That two different populations have been merged — mobile and desktop, free and paid. Splitting them is generally the actual insight.'],
      ['Why does the Central Limit Theorem matter for A/B testing?', 'Individual values may be heavily skewed, but the average of a large sample is approximately normal, which is what the significance maths assumes.'],
      ['What is the fastest way to understand a metric’s shape?', 'Plot a histogram. It takes one query and immediately shows skew, bimodality and outliers that no summary statistic will reveal.']
    ]
  },

  {
    id: 'percentiles',
    title: 'Percentiles',
    domain: 'analytics', tier: 2, priority: 'high',
    summary: 'The value below which a given share of observations fall — how you describe experience honestly.',
    what: `The p90 is the value below which 90% of observations sit. The median is the p50. Percentiles describe the whole distribution rather than collapsing it to one point.`,
    why: `Averages hide the worst experiences, and the worst experiences are what people complain about. "Average latency 200ms" is meaningless if your p99 is 12 seconds — that is one request in a hundred, which at scale is thousands of frustrated users a day.`,
    analogy: `Exam results. "The class average was 70" tells you little. "10% scored below 45" tells you exactly who needs help.`,
    technical: `Percentiles are order statistics — sort and pick a position. In SQL: \`PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY x)\` (interpolated) or \`PERCENTILE_DISC\` (an actual observed value).

Critically, **percentiles do not average**. The mean of two servers' p95s is not the fleet p95. Correct aggregation requires the underlying values or a mergeable sketch (t-digest, HDR histogram).

For AI systems, report p50, p95 and p99 latency and cost. The tail is where timeouts, retries and abandonment live.`,
    diagram: `
   100 REQUESTS, SORTED BY LATENCY

   |‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾|      |
   0ms                                 p50    p95   p99
                                      180ms  1.2s  8.4s
                     mean = 420ms
                     ^ describes nobody in particular

   "Average 420ms" sounds fine.
   1 in 100 users waits 8.4 SECONDS.
   At 1M requests/day that is 10,000 bad experiences.

   PERCENTILES DO NOT AVERAGE

   server A p95 = 200ms
   server B p95 = 400ms
   fleet    p95 != 300ms   <- you need the raw values`,
    example: {
      language: 'sql',
      caption: 'A latency and cost report for an AI feature',
      code: `SELECT
    DATE_TRUNC('day', created_at) AS day,
    COUNT(*)                                                          AS requests,
    PERCENTILE_CONT(0.50) WITHIN GROUP (ORDER BY latency_ms)::int     AS p50,
    PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY latency_ms)::int     AS p95,
    PERCENTILE_CONT(0.99) WITHIN GROUP (ORDER BY latency_ms)::int     AS p99,
    MAX(latency_ms)                                                   AS worst,
    ROUND(PERCENTILE_CONT(0.95)
          WITHIN GROUP (ORDER BY total_tokens)::numeric, 0)           AS p95_tokens,
    ROUND(100.0 * COUNT(*) FILTER (WHERE latency_ms > 5000)
          / NULLIF(COUNT(*), 0), 2)                                   AS pct_over_5s
FROM llm_requests
WHERE created_at >= CURRENT_DATE - INTERVAL '14 days'
GROUP BY 1
ORDER BY 1 DESC;

-- Set SLOs on percentiles, never on the mean:
--   "p95 under 2s"  is a promise about experience.
--   "average under 2s" is a promise about arithmetic.`
    },
    prereq: ['descriptive-statistics'], next: ['variance-correlation'],
    related: ['ai-latency', 'latency-monitoring', 'latency-throughput'],
    tools: ['postgres', 'duckdb', 'opentelemetry'],
    useCases: [
      'Setting a latency SLO for an AI feature.',
      'Reporting cost per request without a single expensive outlier distorting it.',
      'Showing that a "small" tail problem affects thousands of users daily.'
    ],
    avoid: [
      'On very small samples — a p99 over 50 observations is noise.',
      'Averaging pre-computed percentiles from different sources.'
    ],
    mistakes: [
      'Setting an SLO on the mean, which hides the tail entirely.',
      'Averaging percentiles across servers, regions or days.',
      'Reporting only p50 and declaring the system fast.',
      'Ignoring that a p99 timeout usually triggers a retry, which doubles the load.'
    ],
    keyTerms: [
      ['percentile', 'The value below which a given percentage of observations fall.'],
      ['p50 / p95 / p99', 'The standard reporting trio for latency and cost.'],
      ['tail latency', 'The slow end of the distribution — where user pain lives.'],
      ['SLO', 'Service level objective — a target, usually expressed as a percentile.'],
      ['PERCENTILE_CONT / DISC', 'Interpolated versus actual observed value.'],
      ['t-digest', 'A sketch that lets percentiles be merged across sources correctly.']
    ],
    resources: [
      ['PostgreSQL — ordered-set aggregates', 'https://www.postgresql.org/docs/current/functions-aggregate.html#FUNCTIONS-ORDEREDSET-TABLE', 'docs'],
      ['Google SRE Book — service level objectives', 'https://sre.google/sre-book/service-level-objectives/', 'reference'],
      ['Prometheus — histograms and summaries', 'https://prometheus.io/docs/practices/histograms/', 'docs']
    ],
    questions: [
      ['Why set an SLO on p95 rather than the mean?', 'The mean can stay healthy while a substantial minority has an unusable experience. A percentile makes a promise about how many users get a good result.'],
      ['Why can percentiles not be averaged?', 'A percentile is a position in a sorted set, not an additive quantity. Merging requires the underlying values or a mergeable sketch such as a t-digest.'],
      ['Why does tail latency matter more in AI systems than in typical CRUD apps?', 'Generation time varies with output length, so the tail is genuinely long. A p99 timeout usually triggers a retry, which adds load to an already struggling system.']
    ]
  },

  {
    id: 'variance-correlation',
    title: 'Variance & Correlation',
    domain: 'analytics', tier: 2, priority: 'medium',
    summary: 'How much values move, and whether two things move together — which is not the same as causing each other.',
    what: `**Variance** measures how spread out values are. **Correlation** measures whether two variables move together, on a scale from −1 to +1.`,
    why: `Correlation is the most misused number in product work. "Users who use feature X retain better" is a correlation, and acting on it as though it were causation is how teams spend a quarter building something that changes nothing.`,
    analogy: `Ice cream sales and drownings rise together. Neither causes the other. Summer causes both. Every correlation has a lurking "summer" until you rule it out.`,
    technical: `**Pearson's r** measures *linear* association only — a perfect U-shaped relationship has r ≈ 0. **Spearman's rho** works on ranks and catches monotonic non-linear relationships.

r² is the share of variance explained. r = 0.5 means only 25% of the variation is accounted for.

Three reasons two things correlate without one causing the other: **reverse causation** (retention causes usage, not the reverse), **confounding** (a third variable drives both), and **selection effects** (the sample was not random).

Only a randomised experiment settles causation.`,
    diagram: `
   r = +1        r = +0.6       r = 0          r = -0.8     r = 0 (!)
     /             . . .         . . . .          \\ .        .   .
    /            .  .  .        . .  . .           .\\       .     .
   /            . .            . .   .              . \\    .       .
                                                          strong U-shape,
                                                          zero LINEAR r

   "USERS OF FEATURE X RETAIN BETTER"

        Feature X use  ---?--->  Retention

   1. X causes retention          (build more X)
   2. Retention causes X          (engaged users find everything)
   3. Confounder causes both      (team accounts do both)
   4. Selection                   (you only measured survivors)

   Three of four say building more X changes nothing.
   Only an experiment tells you which one you are in.`,
    example: {
      language: 'sql',
      caption: 'Measuring a correlation, then immediately checking for a confounder',
      code: `-- The tempting finding
SELECT CORR(feature_x_uses, days_retained) AS r
FROM user_summary;
-- r = 0.62 — "feature X drives retention!"

-- Check 1: is account type driving both?
SELECT
    account_type,
    COUNT(*)                              AS users,
    ROUND(AVG(feature_x_uses), 1)         AS avg_x_uses,
    ROUND(AVG(days_retained), 1)          AS avg_retained,
    ROUND(CORR(feature_x_uses, days_retained)::numeric, 2) AS r_within_group
FROM user_summary
GROUP BY account_type;

--  account_type | users | avg_x_uses | avg_retained | r_within_group
--  -------------+-------+------------+--------------+---------------
--  team         |  1200 |       14.2 |         88.0 |          0.11
--  individual   | 18400 |        1.1 |         21.0 |          0.09
--
-- The overall r = 0.62 was almost entirely account_type.
-- Within each group the relationship nearly vanishes.
-- This is Simpson's paradox, and it is extremely common.`
    },
    prereq: ['distributions'], next: ['ab-testing'],
    related: ['statistical-significance', 'ai-experimentation', 'product-metrics'],
    tools: ['postgres', 'duckdb'],
    useCases: [
      'Generating hypotheses worth testing experimentally.',
      'Checking whether a headline correlation survives segmentation.',
      'Pushing back on "the data shows X causes Y".'
    ],
    avoid: [
      'As evidence for a build decision on its own.',
      'On non-linear relationships without checking a scatter plot.',
      'On tiny samples, where r is extremely unstable.'
    ],
    mistakes: [
      'Treating correlation as causation. The default error of product analytics.',
      'Not segmenting, and being caught by Simpson’s paradox.',
      'Reporting r without r², overstating how much is explained.',
      'Testing many variable pairs and reporting only the one that correlated — that is fishing.'
    ],
    keyTerms: [
      ['variance', 'Average squared deviation from the mean.'],
      ['correlation (r)', 'Strength and direction of linear association, −1 to +1.'],
      ['r²', 'Share of variance explained. r = 0.5 explains only 25%.'],
      ['confounder', 'A third variable causing both observed variables.'],
      ['reverse causation', 'The effect actually causes the supposed cause.'],
      ['selection bias', 'The sample is not representative of the population.'],
      ['Simpson’s paradox', 'A relationship that reverses or vanishes once you segment.']
    ],
    resources: [
      ['Seeing Theory — regression analysis', 'https://seeing-theory.brown.edu/regression-analysis/index.html', 'interactive'],
      ['Spurious Correlations', 'https://www.tylervigen.com/spurious-correlations', 'reference'],
      ['Khan Academy — correlation and causality', 'https://www.khanacademy.org/math/statistics-probability/describing-relationships-quantitative-data', 'course']
    ],
    questions: [
      ['What are the four explanations for a correlation?', 'X causes Y, Y causes X, a confounder causes both, or selection bias. Only one of them justifies building more X, and only an experiment distinguishes them.'],
      ['What is Simpson’s paradox in product terms?', 'A relationship that appears strong overall but vanishes or reverses within each segment, because segment membership was the real driver.'],
      ['Why report r² alongside r?', 'r overstates intuition. An r of 0.5 sounds substantial but explains only 25% of the variation.']
    ]
  },

  {
    id: 'event-tracking',
    title: 'Event Tracking',
    domain: 'analytics', tier: 1, priority: 'high',
    summary: 'Recording what users do, in a schema consistent enough to answer questions later.',
    what: `An event is a record that something happened: who, what, when, plus properties. \`{user_id, event: "checkout_started", ts, properties: {cart_value: 4999}}\`.`,
    why: `Analytics can only answer questions about things that were recorded. Instrumentation is a product decision made *before* the question is asked, and it cannot be applied retroactively. Undesigned event schemas are the single largest source of unanswerable questions.`,
    analogy: `A ship's log. If nobody wrote down the weather each day, no amount of analysis later will recover it. And if three officers used three different words for "storm", the log is nearly as useless as none.`,
    technical: `A tracking plan defines: event names (a consistent convention such as \`object_action\`), required properties, property types, and who owns each.

Identity is the hard part: **anonymous id** before login, **user id** after, and an **alias/identify** call to stitch the two. Getting this wrong makes acquisition funnels unfixable.

Design principles: name events for what happened, not what you plan to chart; keep the event list small and reusable; put variation in properties, not in event names. \`video_played\` with \`{quality: "hd"}\` beats \`video_played_hd\`.

Server-side tracking is more reliable (ad-blockers, network drops); client-side captures interactions the server never sees. Most products need both.`,
    diagram: `
   BAD PLAN                        GOOD PLAN
   ---------                       ---------
   clicked_blue_button             checkout_started
   ClickedCheckout                   { cart_value, item_count, source }
   checkout-btn-v2                 checkout_completed
   NewCheckoutClicked                { order_id, total, payment_method }

   4 names, 1 meaning,             one event per real thing,
   nothing comparable              variation lives in PROPERTIES
   across versions

   IDENTITY STITCHING

   anon_9f3 ──browse──┐
   anon_9f3 ──signup──┤ identify(anon_9f3 -> user_42)
                      └──> user_42 ──purchase──>

   Without the identify call, the browse and the purchase
   belong to two different "people" and attribution is lost.`,
    example: {
      language: 'json',
      caption: 'A well-formed event, and the plan entry that governs it',
      code: `// The event
{
  "event": "checkout_started",
  "user_id": "user_42",
  "anonymous_id": "anon_9f3",
  "timestamp": "2026-08-21T09:14:03.221Z",
  "properties": {
    "cart_value_cents": 4999,
    "currency": "INR",
    "item_count": 3,
    "source": "cart_page",
    "experiment_variant": "checkout_v2"
  },
  "context": { "platform": "web", "app_version": "3.4.1" }
}

// The tracking-plan entry that makes it trustworthy
{
  "name": "checkout_started",
  "description": "Fired when the user opens the checkout flow.",
  "owner": "growth",
  "required": {
    "cart_value_cents": "integer",
    "item_count": "integer",
    "source": "enum[cart_page,product_page,mini_cart]"
  },
  "fires_on": "server",
  "do_not_include": ["email", "full_name", "card_number"]
}`
    },
    prereq: [], next: ['funnels', 'segmentation'],
    related: ['sql-for-product', 'privacy-pii', 'tables-rows-columns'],
    tools: ['postgres', 'n8n'],
    useCases: [
      'Making a feature measurable before it ships.',
      'Building funnels, retention curves and experiment readouts.',
      'Attributing conversions back to acquisition source.'
    ],
    avoid: [
      'Tracking everything indiscriminately — cost, noise and privacy risk all rise.',
      'Client-side only tracking for anything financially important.',
      'Putting personal data in event properties.'
    ],
    mistakes: [
      'No tracking plan, so four teams invent four names for the same action.',
      'Encoding variation in event names instead of properties, making comparison impossible.',
      'Not stitching anonymous and identified sessions, destroying acquisition attribution.',
      'Shipping a feature and instrumenting it afterwards, losing the launch period forever.',
      'Including PII in properties and creating a compliance problem in the warehouse.'
    ],
    keyTerms: [
      ['event', 'A record that something happened, with properties.'],
      ['tracking plan', 'The governing document of event names, properties and owners.'],
      ['property', 'An attribute of the event. Where variation belongs.'],
      ['anonymous id', 'Identifier before login.'],
      ['identify / alias', 'The call that links an anonymous id to a user id.'],
      ['schema drift', 'Event shape changing over time, breaking historical comparison.'],
      ['server-side tracking', 'Events emitted by the backend. More reliable than the client.']
    ],
    resources: [
      ['Segment — the tracking plan', 'https://segment.com/academy/collecting-data/how-to-create-a-tracking-plan/', 'tutorial'],
      ['Amplitude — data taxonomy', 'https://amplitude.com/docs/data/data-planning-playbook', 'docs'],
      ['OpenTelemetry — semantic conventions', 'https://opentelemetry.io/docs/specs/semconv/', 'docs']
    ],
    questions: [
      ['Why can instrumentation not be added retroactively?', 'Events not recorded at the time simply do not exist. You can start collecting tomorrow, but the launch week is gone permanently.'],
      ['Why should variation live in properties rather than event names?', 'One event with a `quality` property can be compared and rolled up. Four separate event names cannot be aggregated without rewriting every query each time a variant appears.'],
      ['What breaks if anonymous and identified sessions are not stitched?', 'Pre-signup behaviour belongs to a different identity than post-signup behaviour, so acquisition attribution and full-funnel analysis become impossible.']
    ]
  },

  {
    id: 'funnels',
    title: 'Funnels',
    domain: 'analytics', tier: 1, priority: 'high',
    summary: 'A sequence of steps and the share of users who reach each one.',
    what: `A funnel counts how many users reach each step of a defined sequence — visited, signed up, activated, purchased — and therefore where they stop.`,
    why: `It converts "our conversion is bad" into "68% drop between step 2 and step 3". That is the difference between an anxiety and a work item. It is the single most useful analysis in product work.`,
    analogy: `Water through a series of sieves. Each sieve catches some. The one that catches the most is the one worth examining.`,
    technical: `Definition choices that change the numbers significantly:
- **Window** — must the steps happen within an hour, a day, a week? Too tight excludes real conversions; too loose credits unrelated behaviour.
- **Strict or loose order** — must steps happen in sequence, or just all happen?
- **Grain** — count each user once at their furthest step. Counting events double-counts retries.
- **Denominator** — share of the original cohort, or of the previous step? Both are used; state which.

Segment every funnel. An aggregate funnel routinely hides that mobile converts at a third the rate of desktop.`,
    diagram: `
   Visited        ████████████████████████  10,000   100%
   Signed up      ████████████               4,200    42%   (-58%)
   Activated      ███████                    2,900    29%   (-31%)
   Purchased      ██                           780     8%   (-73%)  <-- here

   Two ways to read step 4:
     8% of everyone who visited      (cohort denominator)
     27% of everyone who activated   (step-to-step denominator)
   Both true. Say which one you mean.

   ALWAYS SEGMENT

                 visit -> signup -> activate -> purchase
   desktop        100%     51%       38%         14%
   mobile         100%     36%       21%          3%   <-- the real story
   aggregate      100%     42%       29%          8%   <-- hides it`,
    example: {
      language: 'sql',
      caption: 'A funnel with a window, correct grain and segmentation',
      code: `WITH cohort AS (
    SELECT user_id, created_at, platform
    FROM users
    WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'
),
steps AS (
    SELECT
        c.user_id,
        c.platform,
        MAX(CASE WHEN e.event_name = 'signup_completed'  THEN 1 ELSE 0 END) AS s1,
        MAX(CASE WHEN e.event_name = 'activation_done'   THEN 1 ELSE 0 END) AS s2,
        MAX(CASE WHEN e.event_name = 'purchase_completed'THEN 1 ELSE 0 END) AS s3
    FROM cohort c
    LEFT JOIN events e
           ON e.user_id = c.user_id
          AND e.occurred_at BETWEEN c.created_at
                                AND c.created_at + INTERVAL '7 days'   -- the WINDOW
    GROUP BY c.user_id, c.platform          -- one row per user: correct grain
)
SELECT
    platform,
    COUNT(*)                                            AS visited,
    SUM(s1)                                             AS signed_up,
    SUM(s2)                                             AS activated,
    SUM(s3)                                             AS purchased,
    ROUND(100.0 * SUM(s1) / NULLIF(COUNT(*), 0), 1)     AS pct_signup,
    ROUND(100.0 * SUM(s2) / NULLIF(SUM(s1), 0), 1)      AS pct_signup_to_activate,
    ROUND(100.0 * SUM(s3) / NULLIF(SUM(s2), 0), 1)      AS pct_activate_to_purchase
FROM steps
GROUP BY platform
ORDER BY visited DESC;`
    },
    prereq: ['event-tracking'], next: ['conversion-churn', 'cohorts-retention'],
    related: ['sql-for-product', 'case-expressions', 'activation-adoption'],
    tools: ['postgres', 'duckdb'],
    useCases: [
      'Locating the single worst step in an onboarding flow.',
      'Comparing conversion across platforms, plans or acquisition channels.',
      'Measuring whether a launch actually moved the step it targeted.'
    ],
    avoid: [
      'When the journey is genuinely non-linear — a funnel imposes an order that may not exist.',
      'When you need to know *why*; that requires research, not a chart.',
      'On tiny cohorts, where each user swings the percentage by several points.'
    ],
    mistakes: [
      'Counting events instead of users, inflating early steps.',
      'No time window, so a purchase six months later counts as conversion.',
      'Not reconciling step 1 against the cohort size, and reporting a tracking bug as user behaviour.',
      'Never segmenting, so the aggregate hides the actual problem.',
      'Optimising the biggest drop when a smaller drop sits on far more valuable users.'
    ],
    keyTerms: [
      ['funnel', 'Ordered steps with the share of users reaching each.'],
      ['conversion window', 'How long a user has to complete the next step.'],
      ['step conversion', 'Share of the previous step that advanced.'],
      ['cohort conversion', 'Share of the original population that reached this step.'],
      ['drop-off', 'The share lost between two steps.'],
      ['strict order', 'Steps must occur in sequence to count.']
    ],
    resources: [
      ['Amplitude — funnel analysis', 'https://amplitude.com/docs/analytics/charts/funnel-analysis', 'docs'],
      ['Mixpanel — funnels', 'https://docs.mixpanel.com/docs/reports/funnels', 'docs'],
      ['Reforge — growth loops vs funnels', 'https://www.reforge.com/blog/growth-loops', 'reference']
    ],
    questions: [
      ['What three definitions must a funnel state to be reproducible?', 'The conversion window, whether order is strict, and which denominator each percentage uses.'],
      ['Why segment every funnel?', 'Aggregates hide the real story. A combined 42% conversion can be 51% desktop and 36% mobile, and only the segmented view points at the work.'],
      ['A funnel shows a 73% drop at the final step. What have you learned?', 'Where to look, not what to do. The drop could be price, a broken payment flow, the wrong audience, or an instrumentation gap. The next step is investigation.']
    ],
    interview: {
      s30: 'A funnel is an ordered set of steps and the share of users reaching each. It converts "conversion is bad" into "68% of users drop between activation and purchase", which is something a team can act on.',
      s90: 'The analysis is easy; the definitions are where it goes wrong. You have to fix the conversion window, decide whether order is strict, count each user once at their furthest step rather than counting events, and say which denominator you are using. Then I always reconcile step one against the cohort size — if they disagree, the event is not firing reliably and I am looking at a tracking bug rather than user behaviour. And I never present an unsegmented funnel, because aggregates routinely hide that mobile converts at a third of desktop, which is the actual finding.',
      pm: 'It tells me where to spend the next two weeks. It does not tell me why, so I pair it with session replay or five user interviews before committing to a fix.'
    }
  },

  {
    id: 'cohorts-retention',
    title: 'Cohorts & Retention',
    domain: 'analytics', tier: 2, priority: 'high',
    summary: 'Grouping users by when they started, then tracking whether they come back.',
    what: `A **cohort** is a group defined by a shared starting point, usually a signup week. **Retention** measures what share of each cohort is still active N periods later.`,
    why: `Retention is the closest thing to a truth serum in product analytics. Growth can be bought; retention cannot. A retention curve that flattens above zero means you have found a group of people for whom the product genuinely works. A curve that decays to zero means you have a leaky bucket, and more marketing just pours water in faster.`,
    analogy: `A gym in January. Signups spike. The interesting question is not how many joined, but what share of the January cohort is still coming in March — and whether that share is better than last year's.`,
    technical: `**N-day retention** — active exactly on day N. Strict, spiky, good for daily-use products.
**Unbounded / rolling retention** — active on day N *or later*. Kinder, better for weekly or monthly products.
**Bracket retention** — active within a window (days 7–13). The usual compromise.

Match the period to natural usage frequency: daily retention for a messaging app, monthly for a tax product.

The **shape** matters more than any single number. A curve that flattens indicates a stable core. A curve that keeps declining means no segment has found lasting value. Segment by acquisition channel — cheap channels frequently deliver cohorts that never retain.`,
    diagram: `
   COHORT TABLE (rows = signup week, columns = weeks since)

            W0     W1     W2     W3     W4     W5
   Jan W1  100%   42%    31%    28%    27%    27%   <- flattens: good
   Jan W2  100%   45%    33%    30%    29%     -
   Jan W3  100%   38%    22%    12%     -      -    <- keeps falling: bad
   Jan W4  100%   51%    40%     -      -      -    <- something improved

   Reading COLUMNS shows whether the product is improving
   over successive cohorts.
   Reading ROWS shows the lifecycle of one cohort.

   THE SHAPE IS THE MESSAGE

   100|\\                        100|\\
      | \\                          | \\
      |  \\___________ 27%          |  \\
      |                            |   \\____
      +---------------             +---------\\___ 0%
      product-market fit           leaky bucket
      for SOME segment             more spend = more waste`,
    example: {
      language: 'sql',
      caption: 'A weekly cohort retention table',
      code: `WITH cohorts AS (
    SELECT user_id,
           DATE_TRUNC('week', created_at) AS cohort_week
    FROM users
    WHERE created_at >= CURRENT_DATE - INTERVAL '12 weeks'
),
activity AS (
    SELECT DISTINCT
           c.user_id,
           c.cohort_week,
           DATE_TRUNC('week', e.occurred_at) AS active_week
    FROM cohorts c
    JOIN events e ON e.user_id = c.user_id
    WHERE e.event_name = 'app_opened'
),
sized AS (
    SELECT cohort_week, COUNT(DISTINCT user_id) AS cohort_size
    FROM cohorts GROUP BY 1
)
SELECT
    a.cohort_week,
    s.cohort_size,
    (EXTRACT(EPOCH FROM (a.active_week - a.cohort_week)) / 604800)::int AS weeks_since,
    COUNT(DISTINCT a.user_id)                                           AS retained,
    ROUND(100.0 * COUNT(DISTINCT a.user_id) / s.cohort_size, 1)         AS pct
FROM activity a
JOIN sized s USING (cohort_week)
GROUP BY a.cohort_week, s.cohort_size, weeks_since
ORDER BY a.cohort_week, weeks_since;

-- Then segment by acquisition channel. Cheap channels very often
-- produce cohorts whose curve goes straight to zero.`
    },
    prereq: ['funnels'], next: ['conversion-churn', 'dau-wau-mau'],
    related: ['ltv-cac', 'segmentation', 'window-functions'],
    tools: ['postgres', 'duckdb'],
    useCases: [
      'Judging whether the product has real, durable value for anyone.',
      'Checking whether recent cohorts retain better than older ones after a change.',
      'Comparing acquisition channels on quality rather than volume.'
    ],
    avoid: [
      'On cohorts too small to be stable — the percentages swing wildly.',
      'With a period that does not match natural usage frequency.',
      'As a short-term metric; retention answers arrive weeks late by construction.'
    ],
    mistakes: [
      'Reporting a single retention number instead of the curve. The shape is the finding.',
      'Using daily retention for a product people genuinely need monthly.',
      'Comparing an incomplete recent cohort against a mature one.',
      'Never segmenting by channel, so a bad channel is hidden inside an acceptable average.'
    ],
    keyTerms: [
      ['cohort', 'Users grouped by a shared starting event, usually signup period.'],
      ['retention curve', 'Share of a cohort still active over time.'],
      ['N-day retention', 'Active exactly on day N.'],
      ['rolling retention', 'Active on day N or any time after.'],
      ['flattening', 'The curve levelling off — evidence of a durable core.'],
      ['leaky bucket', 'Retention decaying to zero; acquisition spend is wasted.'],
      ['resurrection', 'A dormant user returning.']
    ],
    resources: [
      ['Amplitude — retention analysis', 'https://amplitude.com/docs/analytics/charts/retention-analysis', 'docs'],
      ['Andrew Chen — the power user curve', 'https://andrewchen.com/power-user-curve/', 'reference'],
      ['Reforge — retention', 'https://www.reforge.com/blog/retention-engagement-growth-silent-killer', 'reference']
    ],
    questions: [
      ['Why is a flattening retention curve the important signal?', 'It shows a segment for whom the product has durable value. A curve that decays to zero means no group stuck, and additional acquisition spend simply leaks out.'],
      ['Why must the retention period match usage frequency?', 'Daily retention on a product genuinely used monthly looks catastrophic while the product is perfectly healthy. The period has to reflect the natural cadence.'],
      ['What does segmenting retention by acquisition channel usually reveal?', 'That cheap channels often produce cohorts that never retain, so the blended average hides a channel that is actively wasting money.']
    ]
  },

  {
    id: 'activation-adoption',
    title: 'Activation & Adoption',
    domain: 'analytics', tier: 2, priority: 'medium',
    summary: 'The moment a user first gets real value, and how widely a feature is actually used.',
    what: `**Activation** is the first time a user experiences the product's core value. **Adoption** is what share of eligible users use a given feature.`,
    why: `Activation is the strongest early predictor of retention, and unlike retention it is measurable within a day rather than a month. That makes it the lever teams can actually iterate against.`,
    analogy: `A gym membership. Signing up is not activation. Finishing a first workout you enjoyed is — and the people who do that in week one are the ones still there in June.`,
    technical: `Define activation empirically, not by opinion: find the early behaviour most strongly associated with later retention, then confirm it with an experiment before treating it as causal. Slack's "2,000 messages sent by a team" is the canonical example.

A good activation metric is early (within the first session or day), behavioural rather than demographic, and moveable by product changes.

Adoption needs a stated **denominator**: of all users, of eligible users, or of users who saw the entry point? The three numbers can differ by an order of magnitude. Track **breadth** (how many use it) and **depth** (how often) separately — a feature used daily by 3% may matter far more than one tried once by 40%.`,
    diagram: `
   SIGNUP ─────► SETUP ─────► FIRST VALUE ─────► HABIT
                                   ^
                              ACTIVATION
                       (measurable in a day, predicts
                        retention measurable in months)

   FINDING THE ACTIVATION METRIC

   behaviour in week 1        retained at week 8
   ---------------------      ------------------
   invited a teammate                62%   <-- strong candidate
   created 3+ projects               58%
   changed avatar                    19%   <-- noise
   base rate (everyone)              21%

   Then EXPERIMENT: if you push users to invite a teammate,
   does retention actually rise? Correlation alone is not enough.

   ADOPTION NEEDS A DENOMINATOR
     of all users            4%
     of eligible users      11%
     of users who saw it    38%   <- same feature, three stories`,
    example: {
      language: 'sql',
      caption: 'Testing candidate activation behaviours against later retention',
      code: `WITH cohort AS (
    SELECT user_id, created_at
    FROM users
    WHERE created_at BETWEEN CURRENT_DATE - INTERVAL '12 weeks'
                         AND CURRENT_DATE - INTERVAL '8 weeks'   -- mature enough
),
week1 AS (
    SELECT c.user_id,
           MAX(CASE WHEN e.event_name = 'teammate_invited' THEN 1 ELSE 0 END) AS invited,
           COUNT(*) FILTER (WHERE e.event_name = 'project_created')           AS projects
    FROM cohort c
    LEFT JOIN events e ON e.user_id = c.user_id
        AND e.occurred_at < c.created_at + INTERVAL '7 days'
    GROUP BY c.user_id
),
week8 AS (
    SELECT DISTINCT c.user_id
    FROM cohort c
    JOIN events e ON e.user_id = c.user_id
        AND e.occurred_at >= c.created_at + INTERVAL '8 weeks'
)
SELECT
    CASE WHEN w1.invited = 1 THEN 'invited a teammate'
         WHEN w1.projects >= 3 THEN 'created 3+ projects'
         ELSE 'neither' END                                  AS week1_behaviour,
    COUNT(*)                                                 AS users,
    ROUND(100.0 * COUNT(w8.user_id) / NULLIF(COUNT(*), 0),1) AS retained_w8_pct
FROM week1 w1
LEFT JOIN week8 w8 USING (user_id)
GROUP BY 1 ORDER BY retained_w8_pct DESC;`
    },
    prereq: ['funnels', 'cohorts-retention'], next: ['dau-wau-mau'],
    related: ['product-metrics', 'north-star-metric', 'ai-adoption'],
    tools: ['postgres'],
    useCases: [
      'Defining an activation metric a team can iterate against weekly.',
      'Reporting feature adoption without overstating it.',
      'Deciding whether onboarding should push a specific behaviour.'
    ],
    avoid: [
      'Declaring an activation metric from intuition without checking it against retention.',
      'Treating a correlated behaviour as causal without an experiment.'
    ],
    mistakes: [
      'Choosing an activation event that is easy to move but does not predict retention — you optimise a vanity number.',
      'Reporting adoption without stating the denominator.',
      'Confusing trial with adoption. Trying once is not using.',
      'Ignoring depth: a feature used daily by a few can matter more than one sampled by many.'
    ],
    keyTerms: [
      ['activation', 'First experience of core value.'],
      ['aha moment', 'The behaviour that best predicts retention.'],
      ['adoption breadth', 'How many eligible users use a feature.'],
      ['adoption depth', 'How often those users use it.'],
      ['eligible population', 'The users who could plausibly use the feature. The honest denominator.'],
      ['time to value', 'How long from signup to first value.']
    ],
    resources: [
      ['Amplitude — north star and activation', 'https://amplitude.com/docs/analytics/charts/funnel-analysis', 'docs'],
      ['Reforge — activation', 'https://www.reforge.com/blog/activation-metrics', 'reference'],
      ['Lenny’s Newsletter — finding your aha moment', 'https://amplitude.com/blog/aha-moment', 'reference']
    ],
    questions: [
      ['How do you find an activation metric rather than assert one?', 'Correlate early behaviours against later retention to shortlist candidates, then run an experiment to check whether pushing the behaviour actually raises retention.'],
      ['Why must adoption state a denominator?', 'Of all users, of eligible users, and of users who saw the entry point can differ by an order of magnitude for the same feature.'],
      ['Why can optimising an activation metric backfire?', 'If the behaviour is correlated but not causal, you can move it substantially with no effect on retention — a vanity metric that consumes a quarter.']
    ]
  },

  {
    id: 'dau-wau-mau',
    title: 'DAU, WAU & MAU',
    domain: 'analytics', tier: 2, priority: 'medium',
    summary: 'Active-user counts over different windows, and the stickiness ratio between them.',
    what: `Daily, weekly and monthly active users: distinct users who performed a qualifying action in that window. **DAU/MAU** is the standard "stickiness" ratio.`,
    why: `These are the headline numbers on most company dashboards, and they are also the easiest to inflate. Everything depends on what "active" means, and that definition is usually chosen once and never questioned.`,
    analogy: `Counting shop visitors. Someone who walks in to use the toilet counts identically to someone who spends an hour and buys something — unless you define "visit" more carefully.`,
    technical: `MAU is *not* the sum of DAUs; it is distinct users over the month. DAU/MAU approximates how many days a month the average active user shows up: 0.5 means roughly 15 days.

Benchmarks vary hugely by category. A messaging app might see 0.5+; a tax product 0.05 and be perfectly healthy. Comparing across categories is meaningless.

The definition of "active" is the entire game. Opening the app is a weak bar; performing a core action is a real one. Escalating the bar makes the number smaller and more honest.

These are **lagging** aggregate counts. They hide composition: MAU can be flat while you churn and replace a third of the base every month.`,
    diagram: `
   MAU  ████████████████████████████████  100,000  distinct in 30 days
   WAU  ██████████████                     42,000
   DAU  ██████                             18,000

   DAU/MAU = 0.18  ->  the average active user shows up
                       roughly 5-6 days per month

   MAU IS NOT THE SUM OF DAUs
     30 days x 18,000 DAU = 540,000 visits
     but only 100,000 distinct people

   FLAT MAU CAN HIDE A CRISIS

   Jan MAU 100k = 100k existing
   Feb MAU 100k =  70k existing + 30k new   <- 30% churned
   Mar MAU 100k =  49k original + 51k new   <- half the base replaced

   The headline never moved. The business changed completely.`,
    example: {
      language: 'sql',
      caption: 'Active users with an explicit, defensible definition of "active"',
      code: `-- "Active" = performed a CORE action, not merely opened the app.
WITH qualifying AS (
    SELECT DISTINCT user_id, DATE(occurred_at) AS day
    FROM events
    WHERE event_name IN ('project_created', 'document_edited', 'message_sent')
      AND occurred_at >= CURRENT_DATE - INTERVAL '60 days'
)
SELECT
    d.day,
    COUNT(DISTINCT q1.user_id)                            AS dau,
    COUNT(DISTINCT q7.user_id)                            AS wau,
    COUNT(DISTINCT q30.user_id)                           AS mau,
    ROUND(100.0 * COUNT(DISTINCT q1.user_id)
          / NULLIF(COUNT(DISTINCT q30.user_id), 0), 1)    AS dau_mau_pct
FROM (SELECT DISTINCT day FROM qualifying) d
LEFT JOIN qualifying q1  ON q1.day  = d.day
LEFT JOIN qualifying q7  ON q7.day  BETWEEN d.day - 6  AND d.day
LEFT JOIN qualifying q30 ON q30.day BETWEEN d.day - 29 AND d.day
GROUP BY d.day
ORDER BY d.day DESC;

-- Always publish alongside: new / retained / resurrected / churned,
-- so a flat MAU cannot hide a third of the base being replaced.`
    },
    prereq: ['cohorts-retention'], next: ['conversion-churn'],
    related: ['product-metrics', 'north-star-metric', 'dashboards-indicators'],
    tools: ['postgres', 'duckdb'],
    useCases: [
      'Reporting overall engagement to leadership.',
      'Tracking stickiness over time for a habit-forming product.',
      'Detecting composition changes when paired with a growth-accounting breakdown.'
    ],
    avoid: [
      'As the primary metric for a product genuinely used infrequently.',
      'For cross-company comparison — the definitions never match.',
      'As a goal without a quality bar, or it will be gamed with notifications.'
    ],
    mistakes: [
      'Defining "active" as opening the app, which counts accidental launches.',
      'Summing DAU to get MAU.',
      'Reporting MAU without growth accounting, so churn hides behind acquisition.',
      'Comparing DAU/MAU across product categories as though the benchmark transferred.'
    ],
    keyTerms: [
      ['DAU / WAU / MAU', 'Distinct active users in a day, week or month.'],
      ['stickiness', 'DAU divided by MAU.'],
      ['qualifying action', 'The event that makes a user count as active.'],
      ['growth accounting', 'Splitting active users into new, retained, resurrected and churned.'],
      ['vanity metric', 'A number that rises without the business improving.']
    ],
    resources: [
      ['Amplitude — active users', 'https://amplitude.com/blog/product-metrics', 'docs'],
      ['Reforge — growth accounting', 'https://www.reforge.com/blog/growth-accounting', 'reference'],
      ['Andrew Chen — DAU/MAU is an important metric, but here is where it fails', 'https://andrewchen.com/dau-mau-is-an-important-metric-but-heres-where-it-fails/', 'reference']
    ],
    questions: [
      ['Why is MAU not the sum of DAUs?', 'MAU counts distinct users over the month. One person active twenty days contributes twenty to the DAU sum but one to MAU.'],
      ['What can a flat MAU hide?', 'Complete replacement of the user base. Heavy churn masked by equal acquisition leaves the headline unchanged while the business deteriorates. Growth accounting exposes it.'],
      ['Why does the definition of "active" matter so much?', 'Counting app opens rewards notifications and accidental launches. Counting a core action produces a smaller number that actually tracks value delivered.']
    ]
  },

  {
    id: 'conversion-churn',
    title: 'Conversion & Churn',
    domain: 'analytics', tier: 2, priority: 'high',
    summary: 'The rate at which users take a desired action, and the rate at which they leave.',
    what: `**Conversion rate** is the share of a population that completed a target action. **Churn** is the share that stopped — cancelled, or went inactive for long enough to count as gone.`,
    why: `These two rates drive the entire business model. Small changes compound: 5% monthly churn means an average customer lifetime of 20 months, while 3% means 33 months — a 65% increase in lifetime value from a two-point change.`,
    analogy: `A bucket with a tap and a hole. Conversion is the tap; churn is the hole. Widening the tap while the hole grows is exhausting and pointless.`,
    technical: `Conversion needs a stated numerator, denominator and window. "12% conversion" without those is not a number.

Churn splits into **voluntary** (they cancelled) and **involuntary** (payment failed) — the latter is often 20–40% of total churn and is a fixable operations problem, not a product one.

**Logo churn** counts customers; **revenue churn** counts money. They diverge sharply when small accounts churn and large ones do not. **Net revenue retention** includes expansion and can exceed 100% even while customers leave.

Lifetime ≈ 1 / churn rate. For non-subscription products, churn requires an inactivity threshold — and that threshold is an assumption, so state it.`,
    diagram: `
   CHURN COMPOUNDS

   monthly churn   avg lifetime   relative LTV
   -------------   ------------   ------------
        1%          100 months        5.0x
        3%           33 months        1.65x
        5%           20 months        1.0x   (baseline)
        8%          12.5 months       0.63x

   Cutting churn 5% -> 3% raises LTV by 65%.
   Usually cheaper than raising conversion by the same amount.

   ALWAYS SPLIT THE CAUSE

   total churn 5.0%
     ├── voluntary   3.2%   product / value problem
     └── involuntary 1.8%   FAILED PAYMENTS
                            -> card retries, dunning emails
                            -> an ops fix, often the cheapest win available

   LOGO vs REVENUE CHURN
     20 of 100 customers left        -> 20% logo churn
     but they were 3% of revenue     ->  3% revenue churn
     Same month. Different stories.`,
    example: {
      language: 'sql',
      caption: 'Monthly churn, split by cause and weighted by revenue',
      code: `WITH monthly AS (
    SELECT
        DATE_TRUNC('month', s.period_start)                    AS month,
        COUNT(*)                                               AS active_start,
        COUNT(*) FILTER (WHERE s.ended_at IS NOT NULL
                           AND s.end_reason = 'cancelled')     AS voluntary,
        COUNT(*) FILTER (WHERE s.ended_at IS NOT NULL
                           AND s.end_reason = 'payment_failed')AS involuntary,
        SUM(s.mrr_cents)                                       AS mrr_start,
        SUM(s.mrr_cents) FILTER (WHERE s.ended_at IS NOT NULL) AS mrr_churned
    FROM subscriptions s
    GROUP BY 1
)
SELECT
    month,
    active_start,
    ROUND(100.0 * (voluntary + involuntary) / NULLIF(active_start,0), 2) AS logo_churn_pct,
    ROUND(100.0 * voluntary   / NULLIF(active_start,0), 2)               AS voluntary_pct,
    ROUND(100.0 * involuntary / NULLIF(active_start,0), 2)               AS involuntary_pct,
    ROUND(100.0 * mrr_churned / NULLIF(mrr_start,0), 2)                  AS revenue_churn_pct,
    ROUND(1.0 / NULLIF((voluntary + involuntary)::numeric
                       / NULLIF(active_start,0), 0), 1)                  AS implied_lifetime_months
FROM monthly
ORDER BY month DESC;`
    },
    prereq: ['funnels', 'cohorts-retention'], next: [],
    related: ['ltv-cac', 'unit-economics', 'pricing'],
    tools: ['postgres'],
    useCases: [
      'Modelling how a churn improvement flows through to lifetime value.',
      'Separating a payments problem from a product problem.',
      'Deciding whether to invest in acquisition or retention next quarter.'
    ],
    avoid: [
      'Monthly churn on a product with an annual contract — the periods do not align.',
      'A single blended churn number across wildly different segments.'
    ],
    mistakes: [
      'Not splitting voluntary from involuntary, and missing the cheapest available win.',
      'Reporting logo churn only, hiding that the departing customers were tiny.',
      'Choosing an inactivity threshold arbitrarily and never stating it.',
      'Quoting a conversion rate with no denominator or window.'
    ],
    keyTerms: [
      ['conversion rate', 'Share of a defined population completing a target action.'],
      ['churn rate', 'Share leaving in a period.'],
      ['voluntary churn', 'The customer chose to leave.'],
      ['involuntary churn', 'Payment failure. Usually fixable with dunning.'],
      ['logo vs revenue churn', 'Counting customers versus counting money.'],
      ['net revenue retention', 'Revenue retained plus expansion; can exceed 100%.'],
      ['dunning', 'The retry-and-notify process for failed payments.']
    ],
    resources: [
      ['ChartMogul — SaaS metrics', 'https://www.reforge.com/blog/opportunity-sizing', 'reference'],
      ['Amplitude — churn analysis', 'https://amplitude.com/docs/analytics/charts/retention-analysis', 'docs'],
      ['a16z — 16 startup metrics', 'https://a16z.com/16-startup-metrics/', 'reference']
    ],
    questions: [
      ['Why split voluntary from involuntary churn?', 'Involuntary churn is failed payments — often 20–40% of the total and fixable with card retries and dunning emails. Treating it as a product problem sends the team after the wrong thing.'],
      ['How does churn relate to customer lifetime?', 'Average lifetime is approximately 1 divided by the churn rate. Reducing monthly churn from 5% to 3% raises lifetime from 20 to 33 months, a 65% increase in LTV.'],
      ['When do logo churn and revenue churn diverge?', 'When the customers leaving are much smaller or much larger than average. Twenty small accounts leaving is 20% logo churn and perhaps 3% revenue churn.']
    ]
  },

  {
    id: 'segmentation',
    title: 'Segmentation',
    domain: 'analytics', tier: 2, priority: 'medium',
    summary: 'Splitting users into meaningful groups, because the average user does not exist.',
    what: `Segmentation divides users into groups that behave differently — by plan, platform, geography, acquisition channel, tenure or observed behaviour — and analyses each separately.`,
    why: `Aggregate metrics routinely describe nobody. A 42% conversion rate can be 51% desktop and 36% mobile, and only the split points at the work. Segmentation is how you find where a problem actually lives.`,
    analogy: `A national weather average. "18 degrees across the country" is true and useless if you are deciding what to wear in Shimla or Chennai.`,
    technical: `Segments come in three flavours: **demographic** (plan, country, company size), **behavioural** (power users, trialists who never activated), and **lifecycle** (new, established, at-risk, dormant).

A useful segment is *sizeable enough to matter*, *different enough to act on*, and *reachable*. A segment you cannot target with a product or campaign change is trivia.

The statistical trap is that slicing enough ways guarantees a "significant" difference by chance. Segment on hypotheses you had beforehand, not on whatever the dashboard happens to highlight.`,
    diagram: `
   AGGREGATE                       SEGMENTED
   ---------                       ---------
   conversion 8%                   enterprise   24%   (n=340)
                                   SMB           9%   (n=4,100)
   "conversion is fine"            self-serve    3%   (n=61,000)
                                   mobile        2%   (n=38,000)

                                   -> three different products' worth
                                      of problems, hidden in one number

   A USEFUL SEGMENT IS
     BIG ENOUGH      moving it changes the business
     DIFFERENT       it genuinely behaves unlike the rest
     REACHABLE       you can actually target it

   THE TRAP
   Slice 20 ways at p<0.05 and one "finding" is pure chance.
   Segment on a hypothesis you held BEFORE looking.`,
    example: {
      language: 'sql',
      caption: 'The same metric across several segment dimensions at once',
      code: `WITH base AS (
    SELECT
        u.user_id,
        u.plan,
        u.platform,
        u.acquisition_channel,
        CASE
            WHEN u.created_at >= CURRENT_DATE - INTERVAL '30 days'  THEN 'new'
            WHEN u.last_seen_at >= CURRENT_DATE - INTERVAL '7 days' THEN 'established'
            WHEN u.last_seen_at >= CURRENT_DATE - INTERVAL '30 days'THEN 'at_risk'
            ELSE 'dormant'
        END                                            AS lifecycle,
        (o.user_id IS NOT NULL)::int                   AS converted
    FROM users u
    LEFT JOIN (SELECT DISTINCT user_id FROM orders WHERE status='paid') o
           USING (user_id)
    WHERE u.deleted_at IS NULL
)
SELECT
    'plan'    AS dimension, plan                AS segment,
    COUNT(*)  AS users,
    ROUND(100.0 * AVG(converted), 1)            AS conversion_pct
FROM base GROUP BY plan
UNION ALL
SELECT 'platform', platform, COUNT(*), ROUND(100.0 * AVG(converted), 1)
FROM base GROUP BY platform
UNION ALL
SELECT 'channel', acquisition_channel, COUNT(*), ROUND(100.0 * AVG(converted), 1)
FROM base GROUP BY acquisition_channel
UNION ALL
SELECT 'lifecycle', lifecycle, COUNT(*), ROUND(100.0 * AVG(converted), 1)
FROM base GROUP BY lifecycle
ORDER BY dimension, conversion_pct DESC;`
    },
    prereq: ['funnels'], next: ['ab-testing'],
    related: ['personas', 'cohorts-retention', 'variance-correlation'],
    tools: ['postgres', 'duckdb'],
    useCases: [
      'Locating which group a problem actually affects.',
      'Deciding who a feature should be built for.',
      'Checking whether an experiment result holds across groups.'
    ],
    avoid: [
      'Segments too small to distinguish signal from noise.',
      'Slicing exploratorily and then presenting the winner as a finding.',
      'Segments you cannot act on.'
    ],
    mistakes: [
      'Reporting an aggregate that describes none of the underlying groups.',
      'Multiple comparisons: enough slices guarantee a spurious "significant" difference.',
      'Segmenting on an attribute that changes over time without fixing the point in time.',
      'Confusing a segment with a persona — one is measured, the other is a narrative.'
    ],
    keyTerms: [
      ['segment', 'A group of users sharing an attribute or behaviour.'],
      ['behavioural segment', 'Defined by what users did, not who they are.'],
      ['lifecycle stage', 'New, established, at-risk, dormant.'],
      ['multiple comparisons', 'Testing many slices inflates the chance of a false finding.'],
      ['actionable segment', 'One you can actually reach and change.'],
      ['cardinality', 'How many distinct values a segment dimension has. High cardinality fragments the data.']
    ],
    resources: [
      ['Amplitude — behavioral cohorts', 'https://amplitude.com/docs/analytics/behavioral-cohorts', 'docs'],
      ['Mixpanel — segmentation', 'https://docs.mixpanel.com/docs/reports/insights', 'docs'],
      ['Reforge — user segmentation', 'https://www.reforge.com/blog/user-segmentation', 'reference']
    ],
    questions: [
      ['Why is an unsegmented metric often misleading?', 'It can describe none of the underlying groups. An 8% average can be 24% enterprise and 2% mobile — three different problems hidden in one number.'],
      ['What makes a segment worth acting on?', 'It must be big enough to matter, genuinely different in behaviour, and reachable by a product or campaign change.'],
      ['What is the multiple-comparisons trap in segmentation?', 'Slicing twenty ways at a 5% threshold produces roughly one spurious "significant" result by chance. Segment on hypotheses formed before looking.']
    ]
  },

  {
    id: 'ab-testing',
    title: 'A/B Testing',
    domain: 'analytics', tier: 3, priority: 'high',
    summary: 'Randomly splitting users to measure whether a change actually caused an effect.',
    what: `An A/B test randomly assigns users to a control or a variant, then compares a chosen metric. Randomisation is the whole point: it makes the two groups comparable on everything except the change.`,
    why: `It is the only routine tool that establishes causation rather than correlation. Without it you are looking at a before/after comparison that is confounded by seasonality, marketing, and every other simultaneous change.`,
    analogy: `A drug trial. Two comparable groups, one difference, one outcome measured. Give the drug to whoever asks for it and you learn nothing — the people who ask are different from the people who do not.`,
    technical: `Decide **before** starting: the primary metric (one), the minimum effect worth detecting (MDE), the significance level (usually 0.05), the power (usually 0.80), and therefore the required sample size and duration.

**p-value** is the probability of seeing this result or more extreme if there were truly no effect. It is *not* the probability the variant is better. A **confidence interval** is more informative — it shows the plausible range of the effect.

Run for whole weeks to absorb weekday effects. Never stop early because it looks significant — **peeking** massively inflates false positives. Cap secondary metrics and correct for multiple comparisons.

Check the **sample ratio mismatch** first: if a 50/50 split arrives 53/47, the assignment is broken and the result is meaningless.`,
    diagram: `
   BEFORE YOU START — all four, written down

   1. primary metric      checkout conversion
   2. MDE                 +1.5pp (smaller is not worth shipping)
   3. alpha / power       0.05 / 0.80
   4. -> sample size      ~24,000 per arm  -> ~14 days

   PEEKING DESTROYS THE MATH

   false-positive rate
     one look at the end          5%
     checking daily for 2 weeks  ~30%   <-- you WILL find a winner
                                            that does not exist

   READ THE INTERVAL, NOT JUST THE p-VALUE

   +0.4pp  [-0.2, +1.0]  p=0.19   inconclusive, not "no effect"
   +2.1pp  [+1.4, +2.8]  p<0.01   ship it
   +2.1pp  [-0.3, +4.5]  p=0.08   promising, underpowered

   FIRST CHECK ALWAYS: sample ratio mismatch
   expected 50/50, observed 53/47 -> assignment is broken, stop.`,
    example: {
      language: 'sql',
      caption: 'Experiment readout, starting with the validity check',
      code: `-- 0. SAMPLE RATIO MISMATCH — check this before reading any result
SELECT variant, COUNT(DISTINCT user_id) AS users,
       ROUND(100.0 * COUNT(DISTINCT user_id)
             / SUM(COUNT(DISTINCT user_id)) OVER (), 2) AS pct
FROM experiment_assignments
WHERE experiment = 'checkout_v2'
GROUP BY variant;
-- expect ~50.00 / 50.00. Anything past ~51/49 at this size is a bug.

-- 1. The readout
WITH assigned AS (
    SELECT DISTINCT user_id, variant, assigned_at
    FROM experiment_assignments
    WHERE experiment = 'checkout_v2'
),
outcome AS (
    SELECT a.user_id, a.variant,
           MAX(CASE WHEN e.event_name = 'purchase_completed' THEN 1 ELSE 0 END) AS converted
    FROM assigned a
    LEFT JOIN events e
           ON e.user_id = a.user_id
          AND e.occurred_at >= a.assigned_at            -- only AFTER assignment
          AND e.occurred_at <  a.assigned_at + INTERVAL '7 days'
    GROUP BY a.user_id, a.variant
)
SELECT
    variant,
    COUNT(*)                                  AS users,
    SUM(converted)                            AS conversions,
    ROUND(100.0 * AVG(converted), 2)          AS conversion_pct,
    -- standard error of a proportion, for a rough 95% interval
    ROUND(100.0 * 1.96 * SQRT(AVG(converted) * (1 - AVG(converted))
                              / COUNT(*)), 2) AS margin_pp
FROM outcome
GROUP BY variant;

-- control  50,120  4,010  8.00%  +/-0.24pp
-- variant  50,004  4,510  9.02%  +/-0.25pp
-- Intervals do not overlap -> a real effect of roughly +1.0pp.`
    },
    prereq: ['variance-correlation', 'segmentation'], next: ['statistical-significance'],
    related: ['ai-experimentation', 'distributions', 'product-metrics'],
    tools: ['postgres'],
    useCases: [
      'Establishing that a change caused an outcome rather than coincided with it.',
      'Validating that a correlated behaviour is actually causal.',
      'Making a ship/no-ship decision defensible.'
    ],
    avoid: [
      'When traffic is too low to reach the required sample in a reasonable time.',
      'For changes too large or too structural to split (a rebrand, a pricing overhaul).',
      'When the effect is expected to take months to appear.',
      'When withholding the change would be unethical or unsafe.'
    ],
    mistakes: [
      'Peeking and stopping at the first significant moment.',
      'Not checking sample ratio mismatch, then analysing a broken experiment.',
      'Reading a non-significant result as "no effect" when it was simply underpowered.',
      'Counting events before assignment, contaminating the measurement.',
      'Testing twelve metrics and reporting the one that won.',
      'Running for five days and absorbing a weekday effect into the result.'
    ],
    keyTerms: [
      ['control / variant', 'The unchanged group and the changed group.'],
      ['randomisation', 'Random assignment — what makes the comparison causal.'],
      ['MDE', 'Minimum detectable effect: the smallest change worth detecting.'],
      ['power', 'Probability of detecting a real effect. Conventionally 0.80.'],
      ['p-value', 'Probability of this result if there were no effect. Not the chance you are right.'],
      ['confidence interval', 'The plausible range of the true effect. More useful than a p-value.'],
      ['peeking', 'Checking repeatedly and stopping when significant. Inflates false positives.'],
      ['sample ratio mismatch', 'Observed split differs from intended — the experiment is broken.'],
      ['novelty effect', 'A short-lived lift purely because the change is new.']
    ],
    resources: [
      ['Evan Miller — sample size calculator', 'https://www.evanmiller.org/ab-testing/sample-size.html', 'interactive'],
      ['Evan Miller — how not to run an A/B test', 'https://www.evanmiller.org/how-not-to-run-an-ab-test.html', 'reference'],
      ['Kohavi et al — Trustworthy Online Controlled Experiments', 'https://experimentguide.com/', 'course'],
      ['Microsoft — A/B testing pitfalls (paper)', 'https://exp-platform.com/Documents/2017-08%20KDDMetricInterpretationPitfalls.pdf', 'paper']
    ],
    questions: [
      ['What does a p-value of 0.03 actually mean?', 'If there were truly no effect, you would see a result this extreme or more about 3% of the time. It is not the probability that the variant is better.'],
      ['Why is peeking so damaging?', 'Each look is another chance to cross the threshold by luck. Checking daily for two weeks pushes the false-positive rate from 5% to roughly 30%.'],
      ['What is sample ratio mismatch and why check it first?', 'The observed split differs from the intended one, which means assignment or logging is broken. If it is present, no downstream result can be trusted.'],
      ['Is a non-significant result the same as no effect?', 'No. It may simply mean the test was underpowered. The confidence interval tells you whether a meaningful effect has been ruled out.']
    ],
    interview: {
      s30: 'An A/B test randomly splits users so the only systematic difference between groups is the change you made. Randomisation is what turns a correlation into a causal claim.',
      s90: 'The discipline is entirely in what you decide before starting: one primary metric, the minimum effect worth shipping, and therefore the sample size and duration. Then the two failure modes I watch for are peeking — checking daily and stopping at the first significant moment pushes the false-positive rate from 5% to about 30% — and sample ratio mismatch, where a 50/50 split arrives 53/47, which means assignment is broken and nothing downstream can be trusted. I read confidence intervals rather than p-values, because "plus 0.4 points, interval minus 0.2 to plus 1.0" tells the team the result is inconclusive rather than negative, and that is a different decision.',
      pm: 'It is how I avoid shipping something that coincided with a good week and calling it a win. It also tells me when not to bother: if we cannot reach the sample size in a sensible time, I would rather decide on judgement and say so honestly.'
    }
  },

  {
    id: 'statistical-significance',
    title: 'Statistical Significance (Practically)',
    domain: 'analytics', tier: 3, priority: 'medium',
    summary: 'Deciding whether a difference is bigger than the noise — and whether it matters.',
    what: `Statistical significance asks whether an observed difference is larger than what random variation alone would plausibly produce. It says nothing about whether the difference is worth caring about.`,
    why: `Two failures are equally expensive: shipping something that did nothing because the numbers looked good, and rejecting something valuable because the test was too small. Understanding the practical version prevents both.`,
    analogy: `Two coin flippers get 52 and 55 heads out of 100. Is one better at flipping? Almost certainly not — that gap is well inside ordinary luck. With 100,000 flips each, the same gap would be extraordinary.`,
    technical: `Significance depends on effect size, sample size and variance. Bigger samples detect smaller effects.

**Statistical significance ≠ practical significance.** With ten million users, a 0.02% lift is significant and worthless. Always ask "what is the smallest effect we would actually act on?" — that is the MDE, and it should be set before the test.

Two error types: **Type I** (false positive — shipping a no-op) and **Type II** (false negative — discarding something real). Which is worse depends on the cost of the change.

Multiple comparisons need correction (Bonferroni, or a false-discovery-rate method). Bayesian approaches report "probability the variant is better", which is what people wrongly assume a p-value means anyway.`,
    diagram: `
   SIGNIFICANCE  =  is it bigger than the noise?
   PRACTICAL     =  do we care?

                 |  not significant   |  significant
   -------------- +--------------------+--------------------
   big effect    |  underpowered:     |  SHIP
                 |  get more data     |
   -------------- +--------------------+--------------------
   tiny effect   |  correctly         |  significant and
                 |  inconclusive      |  IRRELEVANT — do not
                 |                    |  ship complexity for
                 |                    |  a 0.02% lift

   THE TWO ERRORS

   Type I  (false positive)  ship a change that does nothing
                             cost: complexity, misplaced credit
   Type II (false negative)  discard something that worked
                             cost: the opportunity, silently

   Which one you should fear depends on the cost of the change,
   and that is a product judgement, not a statistical one.`,
    example: {
      language: 'python',
      caption: 'Two-proportion test, reported the way a team can act on',
      code: `import math

def compare(control_n, control_c, variant_n, variant_c):
    p1 = control_c / control_n
    p2 = variant_c / variant_n
    diff = p2 - p1

    # pooled standard error for the difference of two proportions
    p_pool = (control_c + variant_c) / (control_n + variant_n)
    se = math.sqrt(p_pool * (1 - p_pool) * (1/control_n + 1/variant_n))
    z = diff / se if se else 0.0

    # 95% interval on the difference (unpooled SE)
    se_d = math.sqrt(p1*(1-p1)/control_n + p2*(1-p2)/variant_n)
    lo, hi = diff - 1.96*se_d, diff + 1.96*se_d

    return {
        "control":  f"{p1*100:.2f}%",
        "variant":  f"{p2*100:.2f}%",
        "lift_pp":  f"{diff*100:+.2f}pp",
        "ci_95":    f"[{lo*100:+.2f}, {hi*100:+.2f}]pp",
        "z":        round(z, 2),
        "significant_at_05": abs(z) > 1.96,
    }

print(compare(50_120, 4_010, 50_004, 4_510))
# lift +1.02pp, CI [+0.68, +1.36]pp, z=5.86, significant -> real and useful

print(compare(1_200, 96, 1_210, 105))
# lift +0.68pp, CI [-1.44, +2.80]pp, z=0.63, NOT significant
# -> underpowered. The interval still allows a +2.8pp win.
#    "No effect" is the wrong conclusion; "we do not know yet" is right.`
    },
    prereq: ['ab-testing'], next: [],
    related: ['distributions', 'ai-experimentation', 'inter-rater-agreement'],
    tools: ['postgres'],
    useCases: [
      'Deciding whether an observed difference justifies a ship decision.',
      'Explaining why a small test cannot settle a question.',
      'Setting a minimum effect worth detecting before a test starts.'
    ],
    avoid: [
      'As the sole input to a decision — cost, risk and strategy matter too.',
      'On metrics with extreme outliers without a robust method.',
      'When the population is not randomised; the maths assumes it is.'
    ],
    mistakes: [
      'Reading a p-value as "the probability the variant is better".',
      'Treating non-significant as proven-no-effect.',
      'Celebrating a significant but commercially irrelevant lift.',
      'Testing many metrics without correcting for multiple comparisons.',
      'Computing significance on a self-selected group rather than a randomised one.'
    ],
    keyTerms: [
      ['significance level (alpha)', 'The false-positive rate you accept, usually 0.05.'],
      ['power', 'Chance of detecting a real effect of the size you care about.'],
      ['effect size', 'How big the difference is. Significance without it is meaningless.'],
      ['Type I / Type II error', 'False positive; false negative.'],
      ['practical significance', 'Whether the effect is large enough to act on.'],
      ['multiple comparisons', 'Testing many things inflates false positives.'],
      ['Bayesian A/B testing', 'Reports the probability one variant is better — usually what people wanted.']
    ],
    resources: [
      ['Seeing Theory — frequentist inference', 'https://seeing-theory.brown.edu/frequentist-inference/index.html', 'interactive'],
      ['Evan Miller — sample size calculator', 'https://www.evanmiller.org/ab-testing/sample-size.html', 'interactive'],
      ['ASA statement on p-values', 'https://www.amstat.org/asa/files/pdfs/p-valuestatement.pdf', 'paper']
    ],
    questions: [
      ['Why is "significant" not the same as "important"?', 'With a large enough sample, a 0.02% lift becomes statistically significant. Whether it is worth the added complexity is a business judgement the statistics cannot make.'],
      ['What should you conclude from a non-significant result?', 'Look at the confidence interval. If it still includes effects you would act on, the test was underpowered and the answer is "we do not know", not "no effect".'],
      ['Which error type should you fear more?', 'It depends on the cost of the change. For a cheap, low-risk tweak a false positive costs little. For an expensive rebuild, a false positive is very costly and you should demand more evidence.']
    ]
  },

  {
    id: 'dashboards-indicators',
    title: 'Dashboards, Leading & Lagging Indicators',
    domain: 'analytics', tier: 2, priority: 'medium',
    summary: 'Presenting metrics so they drive decisions — and knowing which ones you can still influence.',
    what: `A **lagging indicator** reports an outcome that has already happened (revenue, churn). A **leading indicator** moves earlier and predicts it (activation rate, trial starts). A dashboard should show both, and make clear which is which.`,
    why: `Lagging indicators tell you whether you succeeded; only leading indicators let you do anything about it. A dashboard of purely lagging metrics is a rear-view mirror — accurate, and useless for steering.`,
    analogy: `Driving. Your arrival time is lagging: you learn it when it is too late to change. Your current speed and the traffic ahead are leading: you can still act on them.`,
    technical: `A metric earns dashboard space if someone would **do something differently** based on it. Everything else belongs in an ad-hoc query.

Good practice: every metric shows a comparison (versus last period, versus target) because a bare number is uninterpretable; segment the top-level metrics; annotate launches directly on the timeline so a step change has an explanation; and state the freshness, because a stale dashboard read as live is worse than none.

Beware **Goodhart's law**: once a metric becomes a target it stops being a good measure. Pair every metric that can be gamed with a counter-metric — speed of resolution with satisfaction, engagement with complaint rate.`,
    diagram: `
   LEADING                     LAGGING
   (you can still act)         (already happened)

   trial starts        ---->   new revenue
   activation rate     ---->   month-2 retention
   support ticket rate ---->   churn
   p95 latency         ---->   satisfaction score
   eval pass rate      ---->   production incidents

   A DASHBOARD OF ONLY LAGGING METRICS IS A REAR-VIEW MIRROR.

   EVERY METRIC NEEDS A COMPARISON
     "conversion 8.2%"                    uninterpretable
     "conversion 8.2%  (7.4% last week,
                        target 9.0%)"     actionable

   GOODHART'S LAW — pair the gameable ones
     avg handling time   <-> customer satisfaction
     engagement minutes  <-> complaint rate
     eval score          <-> human spot-check agreement`,
    example: {
      language: 'sql',
      caption: 'A dashboard query that carries its own comparison and freshness',
      code: `WITH this_week AS (
    SELECT
        COUNT(DISTINCT user_id) FILTER (WHERE event_name='trial_started')     AS trials,
        COUNT(DISTINCT user_id) FILTER (WHERE event_name='activation_done')   AS activated,
        COUNT(DISTINCT user_id) FILTER (WHERE event_name='purchase_completed')AS purchases,
        MAX(occurred_at)                                                      AS data_through
    FROM events
    WHERE occurred_at >= DATE_TRUNC('week', CURRENT_DATE)
),
last_week AS (
    SELECT
        COUNT(DISTINCT user_id) FILTER (WHERE event_name='trial_started')     AS trials,
        COUNT(DISTINCT user_id) FILTER (WHERE event_name='activation_done')   AS activated,
        COUNT(DISTINCT user_id) FILTER (WHERE event_name='purchase_completed')AS purchases
    FROM events
    WHERE occurred_at >= DATE_TRUNC('week', CURRENT_DATE) - INTERVAL '7 days'
      AND occurred_at <  DATE_TRUNC('week', CURRENT_DATE)
)
SELECT
    'trials (leading)'   AS metric, t.trials    AS value, l.trials    AS prev,
    ROUND(100.0*(t.trials-l.trials)/NULLIF(l.trials,0),1)       AS pct_change,
    t.data_through
FROM this_week t CROSS JOIN last_week l
UNION ALL
SELECT 'activated (leading)', t.activated, l.activated,
       ROUND(100.0*(t.activated-l.activated)/NULLIF(l.activated,0),1), t.data_through
FROM this_week t CROSS JOIN last_week l
UNION ALL
SELECT 'purchases (lagging)', t.purchases, l.purchases,
       ROUND(100.0*(t.purchases-l.purchases)/NULLIF(l.purchases,0),1), t.data_through
FROM this_week t CROSS JOIN last_week l;`
    },
    prereq: ['event-tracking', 'funnels'], next: [],
    related: ['product-metrics', 'north-star-metric', 'tracing', 'ai-metrics'],
    tools: ['postgres', 'duckdb'],
    useCases: [
      'Building a weekly review dashboard a team actually uses.',
      'Choosing an early metric to steer by during a launch.',
      'Pairing a gameable target with a counter-metric.'
    ],
    avoid: [
      'Dashboards nobody has a decision attached to.',
      'Real-time dashboards for metrics that only move monthly.',
      'More than about seven top-level metrics — attention does not scale.'
    ],
    mistakes: [
      'Only lagging metrics, so problems are visible only once they are unfixable.',
      'Numbers without comparison or target, which cannot be interpreted.',
      'No freshness indicator, so a stale pipeline is read as a real decline.',
      'No launch annotations, so every step change starts a fresh investigation.',
      'A single gameable target with no counter-metric.'
    ],
    keyTerms: [
      ['leading indicator', 'Moves early; predicts an outcome; still actionable.'],
      ['lagging indicator', 'Reports an outcome already realised.'],
      ['counter-metric', 'A guard against gaming the primary metric.'],
      ['Goodhart’s law', 'A measure that becomes a target ceases to be a good measure.'],
      ['freshness', 'How current the data is. Must be visible.'],
      ['annotation', 'A marker on the timeline explaining a step change.'],
      ['vanity metric', 'Rises reliably, tells you nothing you can act on.']
    ],
    resources: [
      ['Amplitude — product analytics guide', 'https://amplitude.com/blog/product-analytics-guide', 'reference'],
      ['Google SRE Book — monitoring distributed systems', 'https://sre.google/sre-book/monitoring-distributed-systems/', 'reference'],
      ['Lenny’s Newsletter — the north star metric', 'https://amplitude.com/blog/north-star-metric', 'reference']
    ],
    questions: [
      ['Why does a dashboard need leading indicators?', 'Lagging metrics report outcomes you can no longer influence. Leading metrics move early enough that a team can still change the result.'],
      ['Why must every dashboard number carry a comparison?', 'A bare number is uninterpretable. "8.2%" means nothing without last period or a target beside it.'],
      ['What is a counter-metric and when do you need one?', 'A metric that would degrade if the primary were gamed — satisfaction alongside handling time. You need one whenever the primary metric can be moved without delivering value.']
    ]
  }
];
