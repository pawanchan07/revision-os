/* Revision OS screens. Depends on core.js, visuals.js, challenges.js. */
(function () {
  'use strict';
  var esc = R.esc, inline = R.inline, prose = R.prose, pre = R.pre;
  var main = document.getElementById('main');
  var STAGE_LABEL = { explore: 'Explore', understand: 'Understand', visualize: 'Visualize', test: 'Test', connect: 'Connect', apply: 'Apply', recall: 'Recall', master: 'Master' };
  var STATUS_LABEL = { 'new': 'Unexplored', active: 'In progress', learned: 'Learned', solid: 'Solid', mastered: 'Mastered' };
  var LEVELS = [['TL;DR', '30 seconds'], ['Core idea', 'the mechanism'], ['Under the hood', 'how it is built'], ['Deep dive', 'limits and trade-offs'], ['Expert', 'defend it out loud']];

  /* ================= small pieces ================= */
  function dot(id) { return '<i class="dot" data-s="' + R.status(id) + '"' + (R.isRusty(id) ? ' data-rusty="1"' : '') + '></i>'; }
  function chip(id) {
    var t = R.BY_ID[id];
    if (t) return '<a class="chip" href="#/c/' + id + '">' + dot(id) + esc(t.title) + '</a>';
    if (R.DOMAIN[id]) return '<a class="chip" href="#/d/' + id + '">' + esc(R.DOMAIN[id].title) + '</a>';
    if (R.CMP[id]) return '<a class="chip" href="../guide/#/compare/' + id + '">' + esc(R.CMP[id]) + ' ↗</a>';
    return '';
  }
  function chips(ids) { var h = (ids || []).map(chip).join(''); return h ? '<div class="chips">' + h + '</div>' : ''; }
  function meter(pct, cls) { return '<div class="meter ' + (cls || '') + '"><i style="width:' + Math.max(0, Math.min(100, pct)) + '%"></i></div>'; }
  function pips(n, of) { var s = ''; for (var i = 0; i < of; i++) s += '<i class="' + (i < n ? 'on' : '') + '"></i>'; return '<span class="pips" aria-label="difficulty ' + n + ' of ' + of + '">' + s + '</span>'; }
  function row(t, extra) {
    return '<a class="row" href="#/c/' + t.id + '">' + dot(t.id) + '<span class="row-t"><b>' + esc(t.title) + '</b><small>' + esc(t.summary) + '</small></span><span class="row-x">' + (extra || esc(R.DOMAIN[t.domain].short || R.DOMAIN[t.domain].title)) + '</span></a>';
  }
  function stageProgress(id) {
    return '<span class="segs">' + R.STAGES.map(function (s) { return '<i class="' + (R.stepDone(id, s) ? 'on' : '') + '"></i>'; }).join('') + '</span>';
  }
  var toastTimer;
  function toast(msg) {
    var el = document.getElementById('toast'); el.textContent = msg; el.classList.add('is-on');
    clearTimeout(toastTimer); toastTimer = setTimeout(function () { el.classList.remove('is-on'); }, 1600);
  }
  var xpBuf = 0, xpTimer;
  R.onXp = function (n) { xpBuf += n; clearTimeout(xpTimer); xpTimer = setTimeout(function () { toast('+' + xpBuf + ' XP'); xpBuf = 0; chrome(); }, 250); };
  function chrome() {
    var l = R.level(), st = R.streak(), due = R.dueList().length;
    document.getElementById('hud').innerHTML = '<a href="#/progress" title="Level ' + l.level + ', ' + l.pct + '% to the next">LVL ' + l.level + '</a><a href="#/progress" title="Day streak">' + st + 'D</a>' + (due ? '<a href="#/review" class="hud-due" title="Due for review">' + due + ' DUE</a>' : '');
    var name = (location.hash.replace(/^#\/?/, '').split('/')[0]) || 'home';
    var tab = { c: 'home', review: 'home', d: 'path', hack: 'hack' }[name] || name;
    document.querySelectorAll('.nav a').forEach(function (a) { a.classList.toggle('is-on', a.dataset.tab === tab); });
  }

  /* ================= question components ================= */
  // Each takes (el, done) and calls done(score 0..1) once.
  function qMcq(el, q, options, done) {
    el.innerHTML = '<p class="q">' + q + '</p><div class="opts">' + options.map(function (o, i) { return '<button class="opt" data-i="' + i + '">' + inline(o.t) + '</button>'; }).join('') + '</div><div class="fb" aria-live="polite"></div>';
    el.querySelector('.opts').addEventListener('click', function (e) {
      var b = e.target.closest('.opt'); if (!b || el.dataset.done) return;
      el.dataset.done = 1;
      var o = options[+b.dataset.i];
      el.querySelectorAll('.opt').forEach(function (x, i) { x.disabled = true; if (options[i].ok) x.classList.add('is-right'); });
      if (!o.ok) b.classList.add('is-wrong');
      el.querySelector('.fb').innerHTML = '<p class="' + (o.ok ? 'good' : 'bad') + '">' + (o.ok ? 'Correct.' : 'Not this one.') + ' ' + inline(o.why || '') + '</p>';
      done(o.ok ? 1 : 0);
    });
  }
  function qMatch(el, pairs, done) {
    var defs = R.shuffle(pairs.map(function (p, i) { return i; })), sel = null, left = pairs.length, wrong = 0;
    el.innerHTML = '<p class="q">Match each term to its meaning.</p><div class="match"><div class="match-a">' + pairs.map(function (p, i) { return '<button class="opt" data-term="' + i + '">' + inline(p.term) + '</button>'; }).join('') +
      '</div><div class="match-b">' + defs.map(function (i) { return '<button class="opt" data-def="' + i + '">' + inline(pairs[i].def) + '</button>'; }).join('') + '</div></div><div class="fb" aria-live="polite"><p class="hint">Pick a term, then its meaning.</p></div>';
    el.addEventListener('click', function (e) {
      var a = e.target.closest('[data-term]'), b = e.target.closest('[data-def]');
      if (a && !a.disabled) { el.querySelectorAll('[data-term]').forEach(function (x) { x.classList.remove('is-sel'); }); a.classList.add('is-sel'); sel = a; }
      else if (b && !b.disabled && sel) {
        if (sel.dataset.term === b.dataset.def) { sel.disabled = b.disabled = true; sel.classList.remove('is-sel'); sel.classList.add('is-right'); b.classList.add('is-right'); sel = null; left--; }
        else { wrong++; b.classList.add('is-wrong'); setTimeout(function () { b.classList.remove('is-wrong'); }, 500); }
        if (!left) { var s = Math.max(0, 1 - wrong / pairs.length); el.querySelector('.fb').innerHTML = '<p class="' + (wrong ? 'hint' : 'good') + '">' + (wrong ? 'Done, with ' + wrong + ' wrong ' + (wrong === 1 ? 'try' : 'tries') + '.' : 'All matched first time.') + '</p>'; done(s); }
      }
    });
  }
  function qSort(el, title, items, done) {
    var i = 0, right = 0, log = [];
    function show() {
      if (i >= items.length) {
        el.innerHTML = '<p class="q">Use it, or avoid it?</p><ul class="sortlog">' + log.join('') + '</ul><div class="fb"><p class="' + (right === items.length ? 'good' : 'hint') + '">' + right + ' of ' + items.length + ' right.</p></div>';
        return done(right / items.length);
      }
      el.innerHTML = '<p class="q">Would you reach for <b>' + esc(title) + '</b> here?</p><div class="sortcard">' + inline(items[i].t) + '</div><div class="opts two"><button class="opt" data-a="use">Use it</button><button class="opt" data-a="avoid">Avoid it</button></div><p class="hint">' + (i + 1) + ' of ' + items.length + '</p>';
    }
    el.addEventListener('click', function (e) {
      var b = e.target.closest('[data-a]'); if (!b) return;
      var ok = b.dataset.a === items[i].side; if (ok) right++;
      log.push('<li class="' + (ok ? 'good' : 'bad') + '"><b>' + (items[i].side === 'use' ? 'Use' : 'Avoid') + '</b> ' + inline(items[i].t) + '</li>');
      i++; show();
    });
    show();
  }
  function grader(el, done) {
    el.insertAdjacentHTML('beforeend', '<div class="grade"><span class="lbl">How did you do?</span><button class="opt" data-g="1">Nailed it</button><button class="opt" data-g="0.5">Partly</button><button class="opt" data-g="0">Missed it</button></div>');
    el.querySelector('.grade').addEventListener('click', function (e) {
      var b = e.target.closest('[data-g]'); if (!b || el.dataset.done) return;
      el.dataset.done = 1; el.querySelectorAll('.grade .opt').forEach(function (x) { x.disabled = true; }); b.classList.add('is-sel');
      done(+b.dataset.g);
    });
  }
  function qCard(el, q, a, done) {
    el.innerHTML = '<p class="q">' + inline(q) + '</p><p class="hint">Answer in your head or out loud. Then check.</p><button class="btn ghost" data-a="reveal">Show the answer</button><div class="ans" hidden></div>';
    el.querySelector('[data-a=reveal]').addEventListener('click', function (e) {
      e.target.remove(); var box = el.querySelector('.ans'); box.hidden = false; box.innerHTML = prose(a); grader(el, done);
    });
  }
  function qExplain(el, title, ref, done) {
    el.innerHTML = '<p class="q">Explain <b>' + esc(title) + '</b> without looking. Write it as you would say it to a colleague.</p><textarea class="ta" rows="6" placeholder="What it is, why it exists, how it works, and one example."></textarea><p><button class="btn ghost" data-a="reveal">Compare with the reference</button></p><div class="ans" hidden></div>';
    el.querySelector('[data-a=reveal]').addEventListener('click', function (e) {
      e.target.parentNode.remove(); var box = el.querySelector('.ans'); box.hidden = false;
      box.innerHTML = '<span class="lbl">Reference answer</span>' + prose(ref) + '<p class="hint">Did yours cover the same points? Be strict: missing the mechanism counts as "Partly".</p>'; grader(el, done);
    });
  }

  /* ---- build question items from a concept ---- */
  function others(T, siblings, n) {
    var pool = siblings.filter(function (s) { return s.id !== T.id; });
    if (pool.length < n) pool = pool.concat(R.FLAT.filter(function (s) { return s.id !== T.id && s.domain !== T.domain; }).slice(0, 12));
    return R.shuffle(pool).slice(0, n);
  }
  var make = {
    summary: function (T, sib) { return function (el, done) {
      qMcq(el, 'Which of these describes <b>' + esc(T.title) + '</b>?', R.shuffle([{ t: T.summary, ok: 1 }].concat(others(T, sib, 3).map(function (o) { return { t: o.summary, why: 'That describes ' + o.title + '.' }; }))), done); }; },
    reverse: function (T, sib) { return function (el, done) {
      qMcq(el, 'Which concept is this?<span class="quote">' + inline(T.summary) + '</span>', R.shuffle([{ t: T.title, ok: 1 }].concat(others(T, sib, 3).map(function (o) { return { t: o.title, why: o.title + ': ' + o.summary }; }))), done); }; },
    prereq: function (T) {
      var pre = (T.prereq || []).filter(function (p) { return R.BY_ID[p]; }); if (!pre.length) return null;
      var before = {}; R.before(T.id).forEach(function (b) { before[b.id] = 1; });
      var later = R.shuffle(R.FLAT.filter(function (x) { return x.n > R.BY_ID[T.id].n && !before[x.id] && x.id !== T.id; }).slice(0, 14)).slice(0, 3);
      if (later.length < 2) return null;
      var p = R.BY_ID[pre[Math.floor(Math.random() * pre.length)]];
      return function (el, done) { qMcq(el, 'Which of these do you need to understand <b>before</b> ' + esc(T.title) + '?', R.shuffle([{ t: p.title, ok: 1, why: p.summary }].concat(later.map(function (o) { return { t: o.title, why: 'That builds on this concept, or sits elsewhere in the path.' }; }))), done); };
    },
    match: function (T) {
      if (!T.keyTerms || T.keyTerms.length < 3) return null;
      var pairs = R.shuffle(T.keyTerms).slice(0, 4);
      return function (el, done) { qMatch(el, pairs, done); };
    },
    sort: function (T) {
      if (!T.useCases || !T.avoid || T.useCases.length < 2 || T.avoid.length < 2) return null;
      var strip = function (s) { return s.replace(/^when\s+/i, '').replace(/^./, function (c) { return c.toUpperCase(); }); };
      var items = R.shuffle(T.useCases.slice(0, 3).map(function (t) { return { t: t, side: 'use' }; }).concat(T.avoid.slice(0, 3).map(function (t) { return { t: strip(t), side: 'avoid' }; })));
      return function (el, done) { qSort(el, T.title, items, done); };
    },
    card: function (T, i) {
      var q = T.questions && T.questions[i % Math.max(1, T.questions.length)]; if (!q) return null;
      return function (el, done) { qCard(el, q.q, q.a, done); };
    },
    explain: function (T) {
      var iv = T.interview || {}, ref = iv.s90 || iv.s30 || (T.summary + '\n\n' + T.what);
      return function (el, done) { qExplain(el, T.title, ref, done); };
    }
  };
  // Runs items one after another inside box, then calls finish(scores).
  function runner(box, items, finish) {
    items = items.filter(Boolean);
    var i = 0, scores = [];
    function next() {
      if (i >= items.length) return finish(scores);
      box.innerHTML = '<div class="qhead"><span class="lbl">Question ' + (i + 1) + ' of ' + items.length + '</span><span class="segs">' + items.map(function (_, k) { return '<i class="' + (k < i ? 'on' : '') + '"></i>'; }).join('') + '</span></div><div class="qbody"></div><div class="qfoot"></div>';
      items[i](box.querySelector('.qbody'), function (s) {
        scores.push(s); i++;
        box.querySelector('.qfoot').innerHTML = '<button class="btn" data-a="qnext">' + (i >= items.length ? 'Finish' : 'Next question') + '</button>';
        var b = box.querySelector('[data-a=qnext]'); b.addEventListener('click', next); b.focus();
      });
    }
    next();
  }
  function avg(a) { return a.length ? a.reduce(function (x, y) { return x + y; }, 0) / a.length : 0; }

  /* ================= home ================= */
  function heat(weeks) {
    // columns are weeks, rows are Monday to Sunday, last cell is today
    var S = R.state(), k = R.today(), dow = (new Date().getDay() + 6) % 7, total = (weeks - 1) * 7 + dow + 1, start = R.addDays(k, -(total - 1)), cells = '';
    for (var i = 0; i < total; i++) {
      var day = R.addDays(start, i), log = S.log[day], xp = log ? log.xp : 0, lvl = !xp ? 0 : xp < 30 ? 1 : xp < 80 ? 2 : xp < 160 ? 3 : 4;
      cells += '<i data-l="' + lvl + '" title="' + day + ': ' + xp + ' XP' + (log && log.sec ? ', ' + R.mins(log.sec) + ' min' : '') + '"></i>';
    }
    return '<div class="heat">' + cells + '</div>';
  }
  function pageHome() {
    var S = R.state(), h = new Date().getHours(), greet = h < 5 ? 'Still up' : h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening';
    var tot = R.totals(), lvl = R.level(), streak = R.streak(), due = R.dueList(), weak = R.weakList(), m = R.mission(), done = R.missionDone(), week = R.weekSeconds();
    var date = new Date().toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'short' }).toUpperCase();
    var html = '<div class="wrap"><header class="hero"><div class="lbl"><span class="pulse"></span>REVISION OS / ' + date + '</div><h1>' + greet + ', ' + esc(S.name) + '</h1>' +
      '<div class="hero-meta"><span>Knowledge level <b>' + lvl.level + '</b></span>' + meter(lvl.pct, 'thin') + '<span>' + lvl.into + ' / ' + lvl.span + ' XP</span><span class="sep"></span><span><b>' + streak + '</b> day streak</span></div></header>';

    // mission
    html += '<section class="card mission"><div class="lbl">' + (done ? 'Mission complete' : "Today's mission") + '</div>';
    if (m && !done) {
      var r = R.rec(m.id), started = r && Object.keys(r.steps || {}).length;
      html += '<h2>' + esc(m.hook || m.title) + '</h2><p class="mission-sub">' + esc(m.title) + ' <span class="dim">/ ' + esc(R.DOMAIN[m.domain].title) + '</span></p>' +
        '<div class="mission-meta"><span>Difficulty ' + pips(m.tier + 1, 5) + '</span><span>About ' + m.mins + ' min</span><span>' + stageProgress(m.id) + '</span></div>' +
        '<div class="mission-go"><a class="btn big" href="#/c/' + m.id + '">' + (started ? 'Continue learning' : 'Start learning') + ' <span aria-hidden="true">→</span></a><button class="btn ghost" data-a="swap">Give me another</button></div>';
    } else if (m) {
      var nx = R.nextNew(m.id);
      html += '<h2>' + esc(m.title) + ' is in your system.</h2><p class="mission-sub">It comes back for a quick recall tomorrow. That is how it sticks.</p><div class="mission-go">' +
        (due.length ? '<a class="btn big" href="#/review">Review ' + due.length + ' due</a>' : '') + (nx ? '<a class="btn ' + (due.length ? 'ghost' : 'big') + '" href="#/c/' + nx.id + '">Learn another: ' + esc(nx.title) + '</a>' : '') + '</div>';
    } else html += '<h2>Every concept is learned.</h2><p class="mission-sub">Keep the reviews going and try Hacker mode.</p>';
    html += '</section>';

    // system + review
    html += '<div class="grid2"><section class="card"><div class="lbl">Your system</div>' +
      '<div class="sys"><div class="sys-row"><span>Knowledge</span>' + meter(tot.pct) + '<b>' + tot.pct + '%</b></div>' +
      '<div class="sys-row"><span>This week</span>' + meter(Math.min(100, week / 60 / 120 * 100)) + '<b>' + R.mins(week) + ' min</b></div></div>' +
      '<div class="stats"><a class="stat" href="#/progress"><b>' + tot.learned + '</b><span>learned of ' + tot.total + '</span></a><a class="stat" href="#/progress"><b>' + tot.mastered + '</b><span>mastered</span></a><a class="stat" href="#/progress"><b>' + weak.length + '</b><span>weak areas</span></a></div></section>';
    html += '<section class="card"><div class="lbl">Review queue</div>';
    if (due.length) html += '<p class="big-n">' + due.length + '</p><p class="dim">' + (due.length === 1 ? 'concept is' : 'concepts are') + ' due. ' + (tot.rusty ? tot.rusty + ' getting rusty.' : 'Two minutes each.') + '</p><div class="chips">' + due.slice(0, 4).map(function (t) { return chip(t.id); }).join('') + '</div><p><a class="btn" href="#/review">Start review</a></p>';
    else html += '<p class="big-n">0</p><p class="dim">Nothing is due. Concepts you learn return here after 1, 3, 7, 16 and 35 days.</p>';
    html += '</section></div>';

    // continue
    var doms = R.INDEX.domains.map(function (d) { return { d: d, t: R.totals(d.topics) }; });
    var going = doms.filter(function (x) { return x.t.learned + x.t.active > 0 && x.t.learned < x.t.total; }).sort(function (a, b) { return b.t.pct - a.t.pct; }).slice(0, 4);
    if (going.length < 4) doms.forEach(function (x) { if (going.length < 4 && going.indexOf(x) < 0 && x.t.learned < x.t.total) going.push(x); });
    html += '<section><div class="lbl sec">Continue</div><div class="tiles">' + going.map(function (x) {
      return '<a class="tile" href="#/d/' + x.d.id + '"><b>' + esc(x.d.title) + '</b><span class="dim">' + x.t.learned + ' / ' + x.t.total + '</span>' + meter(x.t.pct, 'thin') + '</a>';
    }).join('') + '</div></section>';

    // activity
    html += '<section class="card"><div class="lbl">Knowledge activity</div><div class="heat-wrap">' + heat(26) + '</div><div class="heat-key"><span class="dim">Less</span><i data-l="0"></i><i data-l="1"></i><i data-l="2"></i><i data-l="3"></i><i data-l="4"></i><span class="dim">More</span></div></section>';

    // discovery + hacker
    var rnd = R.random(true), ch = R.challenges.filter(function (c) { return !S.ch[c.id]; })[0] || R.challenges[0];
    html += '<div class="grid2"><section class="card"><div class="lbl">Random discovery</div><h3 class="disc" id="disc-q">' + esc(rnd.hook || rnd.title) + '</h3><p class="dim" id="disc-t">' + esc(rnd.title) + '</p><p><a class="btn ghost" id="disc-go" href="#/c/' + rnd.id + '">Explore</a> <button class="btn ghost" data-a="surprise">Surprise me</button></p></section>' +
      '<section class="card hack-teaser"><div class="lbl">Hacker mode / ' + esc(ch.kind) + '</div><h3 class="disc">' + esc(ch.title) + '</h3><p class="dim">' + esc(ch.brief.split('. ').slice(0, 2).join('. ')) + '.</p><p><a class="btn ghost" href="#/hack/' + ch.id + '">Investigate</a></p></section></div>';
    html += '<p class="foot dim">Press <kbd>Ctrl</kbd> <kbd>K</kbd> for the command palette. Reading only? <a href="../guide/">Open the plain guide</a>.</p></div>';
    main.innerHTML = html;
    main.querySelector('[data-a=surprise]').addEventListener('click', function () {
      var t = R.random(false); document.getElementById('disc-q').textContent = t.hook || t.title; document.getElementById('disc-t').textContent = t.title; document.getElementById('disc-go').href = '#/c/' + t.id;
    });
    var sw = main.querySelector('[data-a=swap]');
    if (sw) sw.addEventListener('click', function () {
      var pool = R.FLAT.filter(function (t) { return R.status(t.id) === 'new' && t.id !== m.id; });
      if (!pool.length) return;
      var t = pool[Math.floor(Math.random() * Math.min(pool.length, 40))];
      R.state().mission = { date: R.today(), id: t.id }; R.save(); pageHome();
    });
    document.title = 'Revision OS';
  }

  /* ================= concept session ================= */
  function localGraph(T) {
    var pre = (T.prereq || []).filter(function (p) { return R.BY_ID[p]; }).slice(0, 5), nx = (T.next || []).filter(function (p) { return R.BY_ID[p]; }).slice(0, 5);
    function col(ids, label) { return '<div class="lg-col"><span class="lbl">' + label + '</span>' + (ids.length ? ids.map(function (id) { return '<a class="lg-node" href="#/c/' + id + '">' + dot(id) + esc(R.BY_ID[id].title) + '</a>'; }).join('') : '<span class="dim">Nothing. ' + (label === 'Before' ? 'This is a starting point.' : 'This is an end point for now.') + '</span>') + '</div>'; }
    return '<div class="lg">' + col(pre, 'Before') + '<div class="lg-mid"><span class="lg-line"></span><div class="lg-here">' + esc(T.title) + '</div><span class="lg-line"></span></div>' + col(nx, 'Leads to') + '</div>';
  }
  function pageConcept(id, stage) {
    var stub = R.BY_ID[id];
    if (!stub) return notFound();
    stage = R.STAGES.indexOf(stage) > -1 ? stage : null;
    return Promise.all([R.topic(id), R.load('tools.json')]).then(function (res) {
      var T = res[0].t, sib = res[0].siblings, tools = {}; res[1].tools.forEach(function (x) { tools[x.id] = x; });
      if (!stage) {                                    // resume at the first unfinished stage
        stage = R.STAGES.filter(function (s) { return !R.stepDone(id, s); })[0] || 'explore';
        if (R.status(id) !== 'new' && R.status(id) !== 'active') stage = 'understand';
      }
      var d = R.DOMAIN[stub.domain], si = R.STAGES.indexOf(stage), st = R.status(id);
      var html = '<div class="wrap narrow"><div class="crumb"><a href="#/d/' + d.id + '">' + esc(d.title) + '</a><span class="dim"> / concept ' + (d.topics.indexOf(stub) + 1) + ' of ' + d.topics.length + '</span><span class="state" data-s="' + st + '">' + STATUS_LABEL[st] + (R.isRusty(id) ? ', rusty' : '') + '</span></div>' +
        '<h1 class="c-title">' + esc(T.title) + '</h1>' +
        '<nav class="rail" aria-label="Learning stages">' + R.STAGES.map(function (s, i) {
          return '<a href="#/c/' + id + '/' + s + '" class="' + (s === stage ? 'is-on ' : '') + (R.stepDone(id, s) ? 'is-done' : '') + '"><i>' + (i + 1) + '</i><span>' + STAGE_LABEL[s] + '</span></a>';
        }).join('') + '</nav><section class="stage" id="stage"></section>' +
        '<div class="stage-nav">' + (si > 0 ? '<a class="btn ghost" href="#/c/' + id + '/' + R.STAGES[si - 1] + '">Back</a>' : '<span></span>') +
        '<span class="dim sm"><a href="../guide/#/t/' + id + '">Plain reading view ↗</a></span>' +
        (si < R.STAGES.length - 1 ? '<a class="btn" id="go-next" href="#/c/' + id + '/' + R.STAGES[si + 1] + '">' + STAGE_LABEL[R.STAGES[si + 1]] + ' <span aria-hidden="true">→</span></a>' : '<span></span>') + '</div></div>';
      main.innerHTML = html;
      var box = document.getElementById('stage');
      var passive = { explore: 1, understand: 1, visualize: 1, connect: 1 };
      var go = document.getElementById('go-next');
      if (go && passive[stage]) go.addEventListener('click', function () { R.markStep(id, stage); });
      stageView[stage](box, T, sib, tools, stub);
      document.title = T.title + ' / Revision OS';
    });
  }
  var stageView = {
    explore: function (box, T) {
      var iv = T.interview || {};
      box.innerHTML = '<div class="lbl">Explore / before you read anything</div><h2 class="hook">' + inline((T.questions[0] || {}).q || 'What do you already think ' + T.title + ' is?') + '</h2>' +
        '<p class="dim">Take ten seconds and commit to a guess. Guessing first, even wrongly, makes the answer stick.</p>' +
        '<p><button class="btn" data-a="open">I have a guess. Show me.</button></p><div id="ex" hidden>' +
        '<div class="tldr"><span class="lbl">In one line</span><p>' + inline(T.summary) + '</p></div>' +
        (T.analogy ? '<div class="analogy"><span class="lbl">Think of it like this</span>' + prose(T.analogy) + '</div>' : '') +
        (iv.s30 ? '<div class="tldr"><span class="lbl">The 30 second version</span><p>' + inline(iv.s30) + '</p></div>' : '') +
        '<div id="ex-vis"></div></div>';
      box.querySelector('[data-a=open]').addEventListener('click', function (e) {
        e.target.parentNode.remove(); box.querySelector('#ex').hidden = false;
        if (R.flows[T.id]) R.renderFlow(box.querySelector('#ex-vis'), R.flows[T.id]);
      });
    },
    understand: function (box, T, sib, tools) {
      var S = R.state(), iv = T.interview || {};
      function level(n) {
        if (n === 0) return '<div class="tldr"><p>' + inline(T.summary) + '</p></div>' + (iv.s30 ? prose(iv.s30) : prose(T.what.split(/\n{2,}/)[0]));
        if (n === 1) return '<h3>What it is</h3>' + prose(T.what) + '<h3>Why it exists</h3>' + prose(T.why) + (T.analogy ? '<div class="analogy"><span class="lbl">Analogy</span>' + prose(T.analogy) + '</div>' : '');
        if (n === 2) return '<h3>How it actually works</h3>' + prose(T.technical) + (T.diagram ? '<h3>The picture</h3>' + pre(T.diagram) : '') + exampleHtml(T);
        if (n === 3) return '<div class="two"><div><h3>Use it when</h3>' + list(T.useCases) + '</div><div><h3>Avoid it when</h3>' + list(T.avoid) + '</div></div>' +
          (T.mistakes.length ? '<h3>Where people get it wrong</h3>' + list(T.mistakes) : '') +
          (T.keyTerms.length ? '<h3>Words to know</h3><dl class="terms">' + T.keyTerms.map(function (k) { return '<dt>' + inline(k.term) + '</dt><dd>' + inline(k.def) + '</dd>'; }).join('') + '</dl>' : '');
        var tl = (T.tools || []).map(function (x) { return tools[x]; }).filter(Boolean);
        return (iv.s90 ? '<h3>The 90 second answer</h3>' + prose(iv.s90) : '') + (iv.technical ? '<h3>If someone pushes on the technical side</h3>' + prose(iv.technical) : '') + (iv.pm ? '<h3>The product angle</h3>' + prose(iv.pm) : '') + (iv.example ? '<h3>An example to give</h3>' + prose(iv.example) : '') +
          (!iv.s90 && !iv.technical ? '<p class="dim">No expert notes written for this concept yet. Use the sources below.</p>' : '') +
          (tl.length ? '<h3>Tools</h3>' + tl.map(function (x) { return '<p><b>' + esc(x.name) + '.</b> ' + inline(x.what) + ' <a href="' + esc(x.url) + '" target="_blank" rel="noopener noreferrer">Docs ↗</a></p>'; }).join('') : '') +
          (T.resources.length ? '<h3>Go to the source</h3><ul class="links">' + T.resources.map(function (r) { return '<li><span class="kind">' + esc(r.kind || 'link') + '</span><a href="' + esc(r.url) + '" target="_blank" rel="noopener noreferrer">' + esc(r.label) + '</a>' + (r.note ? '<span class="note">' + inline(r.note) + '</span>' : '') + '</li>'; }).join('') + '</ul>' : '');
      }
      function draw(n) {
        S.depth = n; R.save();
        box.innerHTML = '<div class="lbl">Understand / pick your depth</div><div class="depth" role="tablist">' + LEVELS.map(function (l, i) {
          return '<button role="tab" aria-selected="' + (i === n) + '" data-l="' + i + '"><i>L' + (i + 1) + '</i><b>' + l[0] + '</b><span>' + l[1] + '</span></button>';
        }).join('') + '</div><div class="reading">' + level(n) + '</div>' + (n < 4 ? '<p><button class="btn ghost" data-l="' + (n + 1) + '">Go deeper: ' + LEVELS[n + 1][0] + '</button></p>' : '');
      }
      box.addEventListener('click', function (e) { var b = e.target.closest('[data-l]'); if (b) { draw(+b.dataset.l); window.scrollTo(0, box.offsetTop - 80); } });
      draw(Math.min(4, S.depth == null ? 1 : S.depth));
    },
    visualize: function (box, T) {
      box.innerHTML = '<div class="lbl">Visualize / ' + (R.hasVisual(T.id) ? 'move things and watch what changes' : 'the structure, drawn out') + '</div><div id="vis"></div>' +
        (T.diagram ? '<h3>' + (R.hasVisual(T.id) ? 'The full picture' : 'The picture') + '</h3>' + pre(T.diagram) : '') + exampleHtml(T);
      if (R.hasVisual(T.id)) R.mountVisual(box.querySelector('#vis'), T.id);
    },
    test: function (box, T, sib, tools, stub) {
      box.innerHTML = '<div class="lbl">Test / do you have it?</div><div id="run"></div>';
      var items = [make.summary(T, sib), make.match(T)].concat(T.questions.map(function (_, i) { return make.card(T, i); }));
      runner(box.querySelector('#run'), items, function (sc) { finishStage(box.querySelector('#run'), stub.id, 'test', sc); });
    },
    connect: function (box, T, sib, tools, stub) {
      var cmp = (T.related || []).filter(function (r) { return R.CMP[r]; }), rel = (T.related || []).filter(function (r) { return !R.CMP[r]; });
      box.innerHTML = '<div class="lbl">Connect / where this sits</div>' + localGraph(T) + '<p><a class="btn ghost sm" href="#/map/' + T.id + '">See it on the knowledge map</a></p>' +
        (rel.length ? '<h3>Related</h3>' + chips(rel) : '') + (cmp.length ? '<h3>Often confused with</h3>' + chips(cmp) : '') + '<div id="run" class="inset"></div>';
      var q = make.prereq(T);
      if (q) q(box.querySelector('#run'), function () {}); else box.querySelector('#run').remove();
    },
    apply: function (box, T, sib, tools, stub) {
      var ch = R.challenges.filter(function (c) { return c.topics.indexOf(T.id) > -1; })[0];
      box.innerHTML = '<div class="lbl">Apply / make the call</div><div id="run"></div><div id="after"></div>';
      var items = [make.sort(T), make.card(T, T.questions.length - 1)];
      runner(box.querySelector('#run'), items, function (sc) {
        finishStage(box.querySelector('#run'), stub.id, 'apply', sc);
        box.querySelector('#after').innerHTML = (T.mistakes.length ? '<h3>Where people get it wrong</h3>' + list(T.mistakes) : '') +
          (ch ? '<div class="card hack-teaser"><div class="lbl">Hacker mode / ' + esc(ch.kind) + '</div><h3 class="disc">' + esc(ch.title) + '</h3><p class="dim">This concept is part of a full investigation.</p><p><a class="btn ghost" href="#/hack/' + ch.id + '">Investigate</a></p></div>' : '');
      });
    },
    recall: function (box, T, sib, tools, stub) {
      box.innerHTML = '<div class="lbl">Recall / nothing on screen to lean on</div><div id="run"></div>';
      make.explain(T)(box.querySelector('#run'), function (s) { finishStage(box.querySelector('#run'), stub.id, 'recall', [s]); });
    },
    master: function (box, T, sib, tools, stub) {
      box.innerHTML = '<div class="lbl">Master / three questions, two to pass</div><div id="run"></div>';
      var mid = Math.random() < 0.5 ? (make.match(T) || make.sort(T)) : (make.sort(T) || make.match(T));
      var items = [make.reverse(T, sib), mid || make.card(T, 1), make.card(T, Math.floor(Math.random() * T.questions.length))];
      runner(box.querySelector('#run'), items, function (sc) {
        var pass = avg(sc) >= 0.66, run = box.querySelector('#run'), id = stub.id;
        if (pass) {
          R.markStep(id, 'master'); var first = R.learn(id), r = R.rec(id), nx = R.nextNew(id), due = R.dueList().filter(function (t) { return t.id !== id; });
          run.innerHTML = '<div class="result pass"><div class="lbl">Check passed / ' + Math.round(avg(sc) * 100) + '%</div><h2>' + esc(T.title) + ' is ' + (first ? 'now in your system' : 'still solid') + '.</h2>' +
            '<p>It returns for a quick recall on <b>' + new Date(r.due + 'T12:00').toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'short' }) + '</b>, then at wider gaps until it is mastered.</p>' +
            '<div class="unlock">' + ((T.next || []).filter(function (n) { return R.BY_ID[n]; }).length ? '<span class="lbl">Now within reach</span>' + chips(T.next) : '') + '</div>' +
            '<p class="mission-go">' + (nx ? '<a class="btn big" href="#/c/' + nx.id + '">Next concept: ' + esc(nx.title) + '</a>' : '') + (due.length ? '<a class="btn ghost" href="#/review">Review ' + due.length + ' due</a>' : '') + '<a class="btn ghost" href="#/">Back to today</a></p></div>';
        } else {
          run.innerHTML = '<div class="result fail"><div class="lbl">Not yet / ' + Math.round(avg(sc) * 100) + '%</div><h2>Close. Go one level deeper and try again.</h2><p>The check needs two of three. Nothing is lost: your progress on the other stages stays.</p><p class="mission-go"><a class="btn" href="#/c/' + id + '/understand">Back to Understand</a><button class="btn ghost" data-a="retry">Retry the check</button></p></div>';
          run.querySelector('[data-a=retry]').addEventListener('click', function () { stageView.master(box, T, sib, tools, stub); });
        }
        chrome();
      });
    }
  };
  function finishStage(run, id, stage, sc) {
    R.markStep(id, stage);
    var p = Math.round(avg(sc) * 100), nextStage = R.STAGES[R.STAGES.indexOf(stage) + 1];
    run.innerHTML = '<div class="result ' + (p >= 66 ? 'pass' : 'fail') + '"><div class="lbl">' + STAGE_LABEL[stage] + ' done / ' + p + '%</div><p>' + (p >= 85 ? 'Clean. Keep moving.' : p >= 50 ? 'Mostly there. The gaps will come back in review.' : 'Shaky. Worth another pass at Understand before the mastery check.') + '</p>' +
      '<p class="mission-go"><a class="btn" href="#/c/' + id + '/' + nextStage + '">' + STAGE_LABEL[nextStage] + ' →</a>' + (p < 50 ? '<a class="btn ghost" href="#/c/' + id + '/understand">Back to Understand</a>' : '') + '</p></div>';
    chrome();
  }
  function list(items) { return items && items.length ? '<ul>' + items.map(function (i) { return '<li>' + inline(i) + '</li>'; }).join('') + '</ul>' : ''; }
  function exampleHtml(T) {
    var ex = T.example; if (!ex) return '';
    if (typeof ex === 'string') return '<h3>Worked example</h3>' + prose(ex);
    return '<h3>Worked example</h3>' + (ex.intro ? prose(ex.intro) : '') + (ex.caption ? '<p class="cap">' + inline(ex.caption) + '</p>' : '') + (ex.code ? pre(ex.code) : '') + (ex.after ? prose(ex.after) : '');
  }

  /* ================= review ================= */
  function pageReview() {
    var queue = R.dueList().slice(0, 10), i = 0, results = [];
    main.innerHTML = '<div class="wrap narrow"><div class="crumb"><a href="#/">Today</a><span class="dim"> / review</span></div><div id="rv"></div></div>';
    var box = document.getElementById('rv');
    document.title = 'Review / Revision OS';
    function summary() {
      box.innerHTML = '<div class="result pass"><div class="lbl">Review complete</div><h2>' + (results.length ? results.length + (results.length === 1 ? ' concept' : ' concepts') + ' refreshed.' : 'Nothing is due.') + '</h2>' +
        (results.length ? '<div class="rows">' + results.map(function (r) { return '<a class="row" href="#/c/' + r.t.id + '">' + dot(r.t.id) + '<span class="row-t"><b>' + esc(r.t.title) + '</b></span><span class="row-x ' + (r.g === 'miss' ? 'bad' : r.g === 'good' ? 'good' : '') + '">' + (r.g === 'good' ? 'strong' : r.g === 'ok' ? 'holding' : 'slipped') + ', back in ' + r.days + 'd</span></a>'; }).join('') + '</div>' : '<p class="dim">Concepts you learn return here after 1, 3, 7, 16 and 35 days.</p>') +
        '<p class="mission-go"><a class="btn" href="#/">Back to today</a>' + (R.dueList().length ? '<button class="btn ghost" data-a="more">Keep going</button>' : '') + '</p></div>';
      var m = box.querySelector('[data-a=more]'); if (m) m.addEventListener('click', pageReview);
      chrome();
    }
    function next() {
      if (i >= queue.length) return summary();
      var stub = queue[i], r = R.rec(stub.id);
      R.topic(stub.id).then(function (res) {
        var T = res.t, sib = res.siblings, s = r.s;
        var kind = s <= 1 ? 'Quick recall' : s === 2 ? 'Application' : s === 3 ? 'Harder recall' : 'Mastery check';
        var items = s <= 1 ? [make.card(T, 0)] : s === 2 ? [make.sort(T) || make.summary(T, sib), make.card(T, 1)] : s === 3 ? [make.explain(T), make.card(T, 2)] : [make.reverse(T, sib), make.match(T) || make.sort(T), make.explain(T)];
        box.innerHTML = '<div class="rv-head"><span class="lbl">' + (i + 1) + ' of ' + queue.length + ' / ' + kind + '</span><h1 class="c-title">' + esc(T.title) + '</h1><p class="dim">Learned ' + R.daysBetween(r.last || R.today(), R.today()) + ' days ago' + (R.isRusty(stub.id) ? '. Getting rusty.' : '.') + '</p></div><div id="run"></div>';
        runner(box.querySelector('#run'), items, function (sc) {
          var a = avg(sc), g = a >= 0.85 ? 'good' : a >= 0.5 ? 'ok' : 'miss';
          R.grade(stub.id, g);
          results.push({ t: stub, g: g, days: R.daysBetween(R.today(), R.rec(stub.id).due) });
          i++; next();
        });
      });
    }
    next();
  }

  /* ================= path, subject ================= */
  function pagePath() {
    var html = '<div class="wrap"><div class="lbl">Roadmap</div><h1>The path</h1><p class="lede">' + R.FLAT.length + ' concepts in ' + R.INDEX.domains.length + ' subjects. Foundations first, then the AI core, production, product and business. Pick a subject to make it your focus.</p><div class="rows">';
    R.INDEX.domains.forEach(function (d, i) {
      var t = R.totals(d.topics);
      html += '<a class="row" href="#/d/' + d.id + '"><span class="row-n">' + ('0' + (i + 1)).slice(-2) + '</span><span class="row-t"><b>' + esc(d.title) + (R.state().focus === d.id ? ' <span class="tag">focus</span>' : '') + '</b><small>' + esc(d.blurb) + '</small></span><span class="row-x wide">' + t.learned + ' / ' + t.total + meter(t.pct, 'thin') + '</span></a>';
    });
    main.innerHTML = html + '</div></div>';
    document.title = 'The path / Revision OS';
  }
  function pageDomain(id) {
    var d = R.DOMAIN[id]; if (!d) return notFound();
    var t = R.totals(d.topics), S = R.state(), i = R.INDEX.domains.indexOf(d);
    main.innerHTML = '<div class="wrap"><div class="crumb"><a href="#/path">The path</a><span class="dim"> / subject ' + (i + 1) + ' of ' + R.INDEX.domains.length + '</span></div><h1>' + esc(d.title) + '</h1><p class="lede">' + esc(d.blurb) + '</p>' +
      '<div class="sys"><div class="sys-row"><span>Knowledge</span>' + meter(t.pct) + '<b>' + t.pct + '%</b></div></div>' +
      '<p><button class="btn ' + (S.focus === id ? '' : 'ghost') + '" data-a="focus">' + (S.focus === id ? 'This is your focus' : 'Make this my focus') + '</button> <a class="btn ghost" href="#/map/' + d.topics[0].id + '">Show on the map</a></p>' +
      '<div class="rows">' + d.topics.map(function (x) { return row(x, x.mins + ' min ' + pips(x.tier + 1, 5)); }).join('') + '</div></div>';
    main.querySelector('[data-a=focus]').addEventListener('click', function () { S.focus = S.focus === id ? null : id; S.mission = null; R.save(); pageDomain(id); toast(S.focus ? 'Missions now come from ' + d.title : 'Focus cleared'); });
    document.title = d.title + ' / Revision OS';
  }

  /* ================= progress ================= */
  function pageProgress() {
    var S = R.state(), tot = R.totals(), lvl = R.level(), weak = R.weakList().slice(0, 8), m = R.mission();
    var tracks = R.INDEX.tracks.map(function (tr) {
      var list = []; R.INDEX.domains.forEach(function (d) { if (d.track === tr.id) list = list.concat(d.topics); });
      return { tr: tr, t: R.totals(list) };
    }).filter(function (x) { return x.t.total; });
    var fc = []; for (var i = 0; i < 7; i++) { var k = R.addDays(R.today(), i); fc.push(R.FLAT.filter(function (t) { var r = S.c[t.id]; return r && r.s && (i === 0 ? r.due <= k : r.due === k); }).length); }
    var chain = []; var cur = m; while (cur && chain.length < 4) { chain.push(cur); cur = (cur.next || []).map(function (n) { return R.BY_ID[n]; }).filter(function (n) { return n && R.status(n.id) === 'new' && chain.indexOf(n) < 0; })[0]; }
    var maxFc = Math.max.apply(null, fc.concat([1]));
    var html = '<div class="wrap"><div class="lbl">Progress</div><h1>Where you stand</h1>' +
      '<div class="stats big"><div class="stat"><b>' + tot.pct + '%</b><span>knowledge</span></div><div class="stat"><b>' + lvl.level + '</b><span>level, ' + S.xp + ' XP</span></div><div class="stat"><b>' + tot.learned + '</b><span>learned of ' + tot.total + '</span></div><div class="stat"><b>' + tot.mastered + '</b><span>mastered</span></div><div class="stat"><b>' + R.streak() + '</b><span>day streak</span></div></div>' +
      '<div class="grid2"><section class="card"><div class="lbl">Knowledge coverage</div><div class="sys">' + tracks.map(function (x) {
        return '<div class="sys-row"><span>' + esc(x.tr.label) + '</span>' + meter(x.t.pct) + '<b>' + x.t.pct + '%</b></div>';
      }).join('') + '</div><p class="dim sm">Coverage counts how well each concept is holding, not just whether you opened it. Rusty concepts count for less.</p></section>' +
      '<section class="card"><div class="lbl">Recommended next</div>' + (chain.length ? '<div class="chain">' + chain.map(function (t) { return '<a href="#/c/' + t.id + '">' + dot(t.id) + esc(t.title) + '</a>'; }).join('<span aria-hidden="true">→</span>') + '</div>' : '<p class="dim">Everything is learned.</p>') +
      '<div class="lbl" style="margin-top:22px">Weakest concepts</div>' + (weak.length ? '<div class="rows tight">' + weak.map(function (t) { var r = S.c[t.id]; return row(t, (r.lapses ? r.lapses + ' slip' + (r.lapses > 1 ? 's' : '') : 'rusty')); }).join('') + '</div>' : '<p class="dim">None yet. Concepts you miss in review show up here.</p>') + '</section></div>' +
      '<div class="grid2"><section class="card"><div class="lbl">Reviews coming up</div><div class="fc">' + fc.map(function (n, i) { return '<div><i style="height:' + Math.round(n / maxFc * 60 + (n ? 4 : 1)) + 'px"></i><b>' + n + '</b><span>' + (i === 0 ? 'today' : new Date(R.addDays(R.today(), i) + 'T12:00').toLocaleDateString(undefined, { weekday: 'short' })) + '</span></div>'; }).join('') + '</div></section>' +
      '<section class="card"><div class="lbl">Knowledge activity</div><div class="heat-wrap">' + heat(20) + '</div></section></div>' +
      '<section class="card"><div class="lbl">By subject</div><div class="rows tight">' + R.INDEX.domains.map(function (d) { var t = R.totals(d.topics); return '<a class="row" href="#/d/' + d.id + '"><span class="row-t"><b>' + esc(d.title) + '</b></span><span class="row-x wide">' + t.learned + ' / ' + t.total + meter(t.pct, 'thin') + '</span></a>'; }).join('') + '</div></section>' +
      '<section class="card"><div class="lbl">System</div><p class="dim sm">Everything is stored in this browser only. Export a backup before you clear browser data or move to another laptop.</p><p><label class="field">Name <input id="name" value="' + esc(S.name) + '" maxlength="24"></label></p><p><button class="btn ghost" data-a="export">Copy backup</button> <button class="btn ghost" data-a="import">Restore from backup</button> <button class="btn ghost danger" data-a="reset">Reset progress</button></p><div id="sysbox"></div></section></div>';
    main.innerHTML = html;
    document.getElementById('name').addEventListener('change', function (e) { S.name = e.target.value.trim() || 'Pawan'; R.save(); toast('Saved'); });
    main.addEventListener('click', sysClick);
    document.title = 'Progress / Revision OS';
  }
  function sysClick(e) {
    var b = e.target.closest('[data-a]'), box = document.getElementById('sysbox'); if (!b || !box) return;
    if (b.dataset.a === 'export') {
      var text = R.exportState();
      box.innerHTML = '<textarea class="ta" rows="4" readonly>' + esc(text) + '</textarea><p class="dim sm">Copy this text and keep it somewhere safe.</p>';
      box.querySelector('textarea').select();
      if (navigator.clipboard) navigator.clipboard.writeText(text).then(function () { toast('Backup copied'); }, function () {});
    } else if (b.dataset.a === 'import') {
      box.innerHTML = '<textarea class="ta" rows="4" placeholder="Paste a backup here"></textarea><p><button class="btn" data-a="do-import">Restore</button></p>';
    } else if (b.dataset.a === 'do-import') {
      try { R.importState(box.querySelector('textarea').value); toast('Restored'); pageProgress(); chrome(); } catch (err) { box.insertAdjacentHTML('beforeend', '<p class="bad">That is not a valid backup.</p>'); }
    } else if (b.dataset.a === 'reset') {
      box.innerHTML = '<p>This clears all progress, streak and XP in this browser. It cannot be undone.</p><p><button class="btn danger" data-a="do-reset">Yes, reset everything</button> <button class="btn ghost" data-a="cancel">Cancel</button></p>';
    } else if (b.dataset.a === 'do-reset') { R.reset(); toast('Progress reset'); pageProgress(); chrome(); }
    else if (b.dataset.a === 'cancel') box.innerHTML = '';
  }

  /* ================= knowledge map ================= */
  var mapView = null;
  function pageMap(focus) {
    var GA = 2.39996, pos = {}, edges = '', nodes = '', hubs = '';
    R.INDEX.domains.forEach(function (d) {
      d.topics.forEach(function (t, i) { var r = 46 + 15 * Math.sqrt(i + 0.6) * 1.9, a = i * GA; pos[t.id] = [d.x * 1.25 + r * Math.cos(a), d.y * 1.25 + r * Math.sin(a)]; });
    });
    R.FLAT.forEach(function (t) {
      (t.pre || []).forEach(function (p) { if (pos[p]) edges += '<line data-a="' + p + '" data-b="' + t.id + '" x1="' + pos[p][0].toFixed(0) + '" y1="' + pos[p][1].toFixed(0) + '" x2="' + pos[t.id][0].toFixed(0) + '" y2="' + pos[t.id][1].toFixed(0) + '"/>'; });
      var st = R.status(t.id);
      nodes += '<g class="n" data-id="' + t.id + '" data-s="' + st + '"' + (R.isRusty(t.id) ? ' data-rusty="1"' : '') + ' transform="translate(' + pos[t.id][0].toFixed(0) + ' ' + pos[t.id][1].toFixed(0) + ')"><circle r="' + (t.priority === 'high' ? 9 : t.priority === 'low' ? 5 : 7) + '"/><text y="-13">' + esc(t.title) + '</text></g>';
    });
    R.INDEX.domains.forEach(function (d) {
      var t = R.totals(d.topics);
      hubs += '<g class="hub" data-d="' + d.id + '" transform="translate(' + (d.x * 1.25) + ' ' + (d.y * 1.25) + ')"><circle r="30"/><circle class="hub-arc" r="30" pathLength="100" stroke-dasharray="' + t.pct + ' 100" transform="rotate(-90)"/><text class="hub-p" y="5">' + t.pct + '%</text><text class="hub-t" y="36" dy="1em">' + esc(d.short || d.title) + '</text></g>';
    });
    main.innerHTML = '<div class="mapwrap"><svg id="map" class="map" role="img" aria-label="Knowledge map of all concepts"><g id="map-e" class="edges">' + edges + '</g><g>' + hubs + '</g><g>' + nodes + '</g></svg>' +
      '<div class="map-top"><div class="lbl">Knowledge map</div><div class="map-key"><span>' + ['new', 'active', 'learned', 'solid', 'mastered'].map(function (s) { return '<i class="dot" data-s="' + s + '"></i>' + STATUS_LABEL[s]; }).join('</span><span>') + '</span></div></div>' +
      '<div class="map-zoom"><button class="btn sm ghost" data-z="1.3" aria-label="Zoom in">+</button><button class="btn sm ghost" data-z="0.77" aria-label="Zoom out">−</button><button class="btn sm ghost" data-z="0" aria-label="Fit everything">Fit</button></div>' +
      '<aside class="map-card" id="map-card" hidden></aside></div>';
    var svg = document.getElementById('map'), FULL = { x: 180, y: -60, w: 3160, h: 2120 }, vb = mapView || Object.assign({}, FULL), card = document.getElementById('map-card');
    function apply() {
      svg.setAttribute('viewBox', vb.x + ' ' + vb.y + ' ' + vb.w + ' ' + vb.h); svg.classList.toggle('is-close', vb.w < 1500); mapView = vb;
      var r = svg.getBoundingClientRect();                 // keep labels a constant size on screen
      if (r.width) svg.style.setProperty('--k', Math.max(vb.w / r.width, vb.h / r.height).toFixed(3));
    }
    function zoom(f, cx, cy) { var nw = Math.max(420, Math.min(4200, vb.w / f)), k = nw / vb.w; cx = cx == null ? vb.x + vb.w / 2 : cx; cy = cy == null ? vb.y + vb.h / 2 : cy; vb = { x: cx - (cx - vb.x) * k, y: cy - (cy - vb.y) * k, w: nw, h: vb.h * k }; apply(); }
    function pt(e) { var r = svg.getBoundingClientRect(), sc = Math.max(vb.w / r.width, vb.h / r.height); return [vb.x + vb.w / 2 + (e.clientX - r.left - r.width / 2) * sc, vb.y + vb.h / 2 + (e.clientY - r.top - r.height / 2) * sc, sc]; }
    function select(id) {
      var t = R.BY_ID[id]; if (!t) return;
      var up = {}, dn = {}; R.before(id).forEach(function (b) { up[b.id] = 1; }); R.after(id).forEach(function (b) { dn[b.id] = 1; });
      svg.classList.add('has-sel');
      svg.querySelectorAll('.n').forEach(function (n) { var i = n.dataset.id; n.classList.toggle('is-sel', i === id); n.classList.toggle('is-up', !!up[i]); n.classList.toggle('is-dn', !!dn[i]); });
      svg.querySelectorAll('#map-e line').forEach(function (l) { var a = l.dataset.a, b = l.dataset.b; l.classList.toggle('is-on', (b === id || up[b]) && (up[a] || a === id) || (a === id && dn[b])); });
      var st = R.status(id), nUp = Object.keys(up).length;
      card.hidden = false;
      card.innerHTML = '<button class="x" data-a="close" aria-label="Close">×</button><div class="lbl">' + esc(R.DOMAIN[t.domain].title) + '</div><h3>' + esc(t.title) + '</h3><p class="dim">' + esc(t.summary) + '</p><p class="sm"><span class="state" data-s="' + st + '">' + STATUS_LABEL[st] + '</span> ' + t.mins + ' min ' + pips(t.tier + 1, 5) + '</p>' +
        '<p class="sm dim">' + (nUp ? nUp + ' concept' + (nUp > 1 ? 's' : '') + ' come before it (amber). ' : 'A starting point. ') + (Object.keys(dn).length ? Object.keys(dn).length + ' build on it (blue).' : '') + '</p><p><a class="btn" href="#/c/' + id + '">' + (st === 'new' ? 'Start' : 'Open') + '</a></p>';
    }
    var drag = null, moved = 0;
    svg.addEventListener('pointerdown', function (e) { drag = { x: e.clientX, y: e.clientY, vx: vb.x, vy: vb.y }; moved = 0; svg.setPointerCapture(e.pointerId); });
    svg.addEventListener('pointermove', function (e) { if (!drag) return; var r = svg.getBoundingClientRect(), sc = Math.max(vb.w / r.width, vb.h / r.height); moved += Math.abs(e.movementX) + Math.abs(e.movementY); vb.x = drag.vx - (e.clientX - drag.x) * sc; vb.y = drag.vy - (e.clientY - drag.y) * sc; apply(); });
    svg.addEventListener('pointerup', function (e) {
      var was = drag; drag = null; if (!was || moved > 6) return;
      var el = document.elementFromPoint(e.clientX, e.clientY), n = el && el.closest('.n'), hub = el && el.closest('.hub');
      if (n) select(n.dataset.id);
      else if (hub) { var d = R.DOMAIN[hub.dataset.d]; vb = { x: d.x * 1.25 - 330, y: d.y * 1.25 - 240, w: 660, h: 480 }; apply(); }
      else { svg.classList.remove('has-sel'); card.hidden = true; }
    });
    svg.addEventListener('wheel', function (e) { e.preventDefault(); var p = pt(e); zoom(e.deltaY < 0 ? 1.15 : 0.87, p[0], p[1]); }, { passive: false });
    main.querySelector('.map-zoom').addEventListener('click', function (e) { var b = e.target.closest('[data-z]'); if (!b) return; if (b.dataset.z === '0') { vb = Object.assign({}, FULL); apply(); } else zoom(+b.dataset.z); });
    card.addEventListener('click', function (e) { if (e.target.closest('[data-a=close]')) { card.hidden = true; svg.classList.remove('has-sel'); } });
    if (focus && pos[focus]) { vb = { x: pos[focus][0] - 380, y: pos[focus][1] - 270, w: 760, h: 540 }; select(focus); }
    apply();
    document.title = 'Knowledge map / Revision OS';
  }

  /* ================= hacker mode ================= */
  function pageHackList() {
    var S = R.state();
    main.innerHTML = '<div class="wrap"><div class="lbl">Hacker mode</div><h1>Investigations</h1><p class="lede">Real-shaped failures with evidence to read. No definitions to recite. Work out what is going on and decide what to do.</p><div class="cases">' +
      R.challenges.map(function (c) {
        var r = S.ch[c.id];
        return '<a class="card case" href="#/hack/' + c.id + '"><div class="lbl">' + esc(c.kind) + (r ? ' / solved ' + r.score + ' of ' + c.steps.length : '') + '</div><h3>' + esc(c.title) + '</h3><p class="dim">' + esc(c.brief) + '</p><p class="sm dim">' + c.mins + ' min ' + pips(c.level + 1, 5) + ' / ' + c.evidence.length + ' pieces of evidence</p></a>';
      }).join('') + '</div></div>';
    document.title = 'Hacker mode / Revision OS';
  }
  function pageHack(id) {
    var c = R.challenges.filter(function (x) { return x.id === id; })[0]; if (!c) return notFound();
    var step = 0, score = 0, tab = 0;
    main.innerHTML = '<div class="wrap"><div class="crumb"><a href="#/hack">Hacker mode</a><span class="dim"> / ' + esc(c.kind) + '</span></div><h1>' + esc(c.title) + '</h1><p class="lede">' + esc(c.brief) + '</p>' +
      '<div class="case-grid"><section class="card ev"><div class="lbl">Evidence</div><div class="tabs" role="tablist">' + c.evidence.map(function (e, i) { return '<button role="tab" data-t="' + i + '" aria-selected="' + (i === 0) + '">' + esc(e[0]) + '</button>'; }).join('') + '</div><div id="ev"></div></section>' +
      '<section class="card" id="hk"></section></div></div>';
    var ev = document.getElementById('ev'), hk = document.getElementById('hk');
    function showEv(i) { tab = i; ev.innerHTML = pre(c.evidence[i][1]); main.querySelectorAll('.tabs button').forEach(function (b, j) { b.setAttribute('aria-selected', String(j === i)); }); }
    main.querySelector('.tabs').addEventListener('click', function (e) { var b = e.target.closest('[data-t]'); if (b) showEv(+b.dataset.t); });
    function next() {
      if (step >= c.steps.length) {
        var S = R.state(), first = !S.ch[c.id];
        S.ch[c.id] = { score: Math.max(score, (S.ch[c.id] || {}).score || 0), at: R.today() }; if (first) R.award(60); R.save();
        hk.innerHTML = '<div class="lbl">Debrief / ' + score + ' of ' + c.steps.length + ' calls right</div>' + prose(c.debrief) + '<span class="lbl">Concepts behind this case</span>' + chips(c.topics) + '<p class="mission-go"><a class="btn" href="#/hack">More investigations</a><a class="btn ghost" href="#/">Back to today</a></p>';
        return chrome();
      }
      var s = c.steps[step], opts = R.shuffle(s.options.map(function (o) { return { t: o[0], ok: o[1], why: o[2] }; }));
      hk.innerHTML = '<div class="qhead"><span class="lbl">Decision ' + (step + 1) + ' of ' + c.steps.length + '</span><span class="segs">' + c.steps.map(function (_, k) { return '<i class="' + (k < step ? 'on' : '') + '"></i>'; }).join('') + '</span></div><div class="qbody"></div><div class="qfoot"></div>';
      qMcq(hk.querySelector('.qbody'), esc(s.q), opts, function (ok) {
        score += ok; step++;
        hk.querySelector('.qfoot').innerHTML = '<button class="btn">' + (step >= c.steps.length ? 'Read the debrief' : 'Next decision') + '</button>';
        hk.querySelector('.qfoot .btn').addEventListener('click', next);
      });
    }
    showEv(0); next();
    document.title = c.title + ' / Revision OS';
  }

  /* ================= command palette ================= */
  var pal = document.getElementById('pal'), palIn = document.getElementById('pal-in'), palList = document.getElementById('pal-list'), palSel = 0, palItems = [];
  var COMMANDS = [
    ['Continue learning', 'Resume today\'s mission', function () { var m = R.mission(); location.hash = m ? '#/c/' + m.id : '#/'; }],
    ['Learn something new', 'The next concept you are ready for', function () { var t = R.nextNew(); if (t) location.hash = '#/c/' + t.id; }],
    ['Surprise me', 'A random concept', function () { location.hash = '#/c/' + R.random(false).id; }],
    ['Start review', 'Concepts that are due', function () { location.hash = '#/review'; }],
    ['Review weak topics', 'Concepts that slipped or went rusty', function () { open('weak'); }],
    ['Show knowledge map', 'Every concept and how they connect', function () { location.hash = '#/map'; }],
    ['Open roadmap', 'The path, subject by subject', function () { location.hash = '#/path'; }],
    ['Show progress', 'Coverage, weak areas, what is next', function () { location.hash = '#/progress'; }],
    ['Enter hacker mode', 'Investigations', function () { location.hash = '#/hack'; }],
    ['Today', 'Back to the dashboard', function () { location.hash = '#/'; }],
    ['Switch theme', 'Light or dark', function () { theme(); }],
    ['Open the plain guide', 'Reading view of every concept', function () { location.href = '../guide/'; }]
  ];
  var HINTS = ['before transformers', 'related to apis', 'not mastered', 'weak', 'due'];
  function palRender() {
    var q = palIn.value.trim(), html = '';
    palItems = [];
    var cmds = COMMANDS.filter(function (c) { return !q || (c[0] + ' ' + c[1]).toLowerCase().indexOf(q.toLowerCase()) > -1; });
    if (cmds.length) { html += '<div class="pal-h">Commands</div>'; cmds.forEach(function (c) { html += '<button class="pal-i" data-i="' + palItems.length + '"><b>' + c[0] + '</b><span>' + c[1] + '</span></button>'; palItems.push(c[2]); }); }
    if (q) {
      var res = R.query(q);
      html += '<div class="pal-h">' + (res.label ? esc(res.label) + ' / ' + res.items.length : 'Concepts / ' + res.items.length) + '</div>';
      res.items.slice(0, 40).forEach(function (t) { html += '<button class="pal-i" data-i="' + palItems.length + '">' + dot(t.id) + '<b>' + esc(t.title) + '</b><span>' + esc(R.DOMAIN[t.domain].title) + '</span></button>'; palItems.push(function () { location.hash = '#/c/' + t.id; }); });
      if (!res.items.length) html += '<div class="pal-none">No concept matches. Try: ' + HINTS.join(', ') + '.</div>';
    } else html += '<div class="pal-h">Ask it things</div><div class="pal-none">' + HINTS.map(function (h) { return '<button class="chip" data-hint="' + h + '">' + h + '</button>'; }).join('') + '</div>';
    palSel = Math.min(palSel, Math.max(0, palItems.length - 1));
    palList.innerHTML = html; palMark();
  }
  function palMark() { palList.querySelectorAll('.pal-i').forEach(function (b, i) { b.classList.toggle('is-on', i === palSel); if (i === palSel) b.scrollIntoView({ block: 'nearest' }); }); }
  function open(q) { pal.hidden = false; palIn.value = q || ''; palSel = 0; palRender(); palIn.focus(); }
  function close() { pal.hidden = true; }
  function run(i) { var f = palItems[i]; if (f) { close(); f(); } }
  palIn.addEventListener('input', function () { palSel = 0; palRender(); });
  palIn.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowDown') { e.preventDefault(); palSel = Math.min(palItems.length - 1, palSel + 1); palMark(); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); palSel = Math.max(0, palSel - 1); palMark(); }
    else if (e.key === 'Enter') { e.preventDefault(); run(palSel); }
  });
  pal.addEventListener('click', function (e) {
    var i = e.target.closest('.pal-i'), h = e.target.closest('[data-hint]');
    if (i) run(+i.dataset.i); else if (h) { palIn.value = h.dataset.hint; palSel = 0; palRender(); palIn.focus(); } else if (e.target === pal) close();
  });
  document.getElementById('pal-btn').addEventListener('click', function () { open(); });
  document.addEventListener('keydown', function (e) {
    var typing = /input|textarea/i.test((document.activeElement || {}).tagName || '');
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); pal.hidden ? open() : close(); }
    else if (e.key === 'Escape' && !pal.hidden) close();
    else if (e.key === '/' && !typing) { e.preventDefault(); open(); }
  });

  /* ================= theme, routing, boot ================= */
  function theme(set) {
    var S = R.state(); if (set !== true) S.theme = S.theme === 'dark' ? 'light' : 'dark';
    document.documentElement.dataset.theme = S.theme; R.save();
    try { localStorage.setItem('revos:theme', S.theme); } catch (e) {}
  }
  document.getElementById('theme-btn').addEventListener('click', function () { theme(); });
  function notFound() { main.innerHTML = '<div class="wrap narrow"><h1>Not found</h1><p>That screen does not exist. <a href="#/">Back to today</a>.</p></div>'; }
  var token = 0;
  function route() {
    var p = (location.hash || '#/').replace(/^#\/?/, '').split('/'), mine = ++token, job;
    main.removeEventListener('click', sysClick);
    document.body.dataset.view = p[0] || 'home';
    try {
      if (!p[0]) job = pageHome();
      else if (p[0] === 'c') job = pageConcept(decodeURIComponent(p[1] || ''), p[2]);
      else if (p[0] === 'review') job = pageReview();
      else if (p[0] === 'path') job = pagePath();
      else if (p[0] === 'd') job = pageDomain(p[1]);
      else if (p[0] === 'progress') job = pageProgress();
      else if (p[0] === 'map') job = pageMap(p[1]);
      else if (p[0] === 'hack') job = p[1] ? pageHack(p[1]) : pageHackList();
      else job = notFound();
    } catch (err) { job = Promise.reject(err); }
    Promise.resolve(job).then(function () { if (mine === token) { chrome(); window.scrollTo(0, 0); main.focus({ preventScroll: true }); } })
      .catch(function (err) { if (mine === token) main.innerHTML = '<div class="wrap narrow"><h1>Could not load this screen</h1><p>' + esc(err.message || err) + '</p><p><a href="#/">Back to today</a>, or reload.</p></div>'; });
  }
  window.addEventListener('hashchange', route);
  setInterval(function () {                              // time spent learning, counted only on working screens
    var v = document.body.dataset.view;
    if (document.visibilityState === 'visible' && (v === 'c' || v === 'review' || v === 'hack')) R.addTime(15);
  }, 15000);
  R.boot().then(function () { theme(true); route(); }).catch(function (err) {
    main.innerHTML = '<div class="wrap narrow"><h1>Could not start</h1><p>' + esc(err.message || err) + '</p><p>Reload the page. This has to be opened from its web link, not as a file.</p></div>';
  });
})();
