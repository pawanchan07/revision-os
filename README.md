# Revision OS — Preparation Map

I am Pawan. I built this while teaching myself AI, product and data at the same
time, because I had written several long guides for myself and then could not
remember what was in them. Reading a guide once is not learning it. I needed
something that showed me the whole landscape at once, let me click any topic and
be reminded in ninety seconds, and told me honestly what I had not touched yet.
So the map is the point, not the pages.

## What is inside and how to use it

```
node serve.js 4173      # or double-click start.bat
```

Then open <http://localhost:4173>. It has to be served rather than opened
directly — ES modules will not load over `file://`. `serve.js` is a ~70-line Node
static server with zero dependencies. No CDN, no framework, no build step, no
deployment.

You land on the map: **25 domains, 308 topics**, laid out so you can see how they
connect. Click any topic and a revision panel opens with what it is, why it
exists, what problem it solves, a plain analogy, the technical meaning, how it
connects to neighbouring topics, which tools apply, and what to learn next. You
can jump between topics without losing the overall map.

It is built to answer five questions quickly:

- What am I learning?
- How does everything connect?
- What have I already covered?
- What should I revise?
- If someone asks me about this topic, do I actually understand it?

Three scripts keep the content honest:

```
node lint-content.mjs   # imports every module - the real syntax gate
node check.mjs          # coverage, dangling refs, link and tool checks
node linkcheck.mjs      # HEAD-checks the 669 external URLs (needs network)
```

## Who this might help

Anyone learning several connected subjects at once and losing the shape of it.
Self-learners who have read plenty and retained less than they hoped. It works
best if you replace my topics with yours — the content lives in
`app/data/topics/`, one plain JS file per domain, and `check.mjs` will tell you
when you have broken a reference.

## How I built it

Vanilla JavaScript ES modules, hand-written CSS, no dependencies at all. Built
with Claude as a working partner across six stages: I set the spec, it drafted, I
broke it and sent it back. `BUILD.md` is the original spec and `CHECKPOINT.md` is
the honest build log — including the day I found `node --check` silently passing a
real ES-module syntax error and had to write a proper gate instead.

---

Built by **Pawanchander Komuravelli** · [pawanchander.com](https://pawanchander.com) · [thebackbench.in](https://thebackbench.in)

Shared as a learning artifact, not a polished product. It is my revision system,
published in case the shape of it is useful to you.
