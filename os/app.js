/* Revision OS screens, version 3. Same engine (core.js), new body.
   Mobile first: one action per screen, a focused session, colour that follows the subject. */
(function () {
  'use strict';
  var esc = R.esc, inline = R.inline, prose = R.prose, pre = R.pre;
  var main = document.getElementById('main');
  var STAGE = { explore: 'Explore', understand: 'Understand', visualize: 'Visualize', test: 'Test', connect: 'Connect', apply: 'Apply', recall: 'Recall', master: 'Master' };
  var STATE = { 'new': 'New', locked: 'Locked', active: 'In progress', learned: 'Learned', solid: 'Solid', mastered: 'Mastered', due: 'Review due', weak: 'Weak' };
  var LEVELS = [['Surface', 'the idea in 30 seconds'], ['Mechanism', 'what it is and why it exists'], ['Implementation', 'how it is actually built'], ['Theory', 'assumptions, failures, trade-offs'], ['Expert', 'the level you defend out loud']];
  // One colour pair per track. Everything else in the palette stays constant.
  var TINT = { ai: ['#8f7dff', '#49c4ff'], programming: ['#22d3a6', '#4aa3ff'], data: ['#3fd0ee', '#6a7dff'], product: ['#ff7d5c', '#ffb648'], strategy: ['#f266ad', '#ff9c52'],
    business: ['#3fd092', '#e6c84c'], economics: ['#e9bb4d', '#5ccb8f'], tools: ['#8090ff', '#48d2ca'], evaluation: ['#a9db4f', '#31c9a3'], production: ['#ff9142', '#f15b7d'] };
  var ICON = {
    'new': '<circle cx="8" cy="8" r="4.6" fill="none" stroke="currentColor" stroke-width="1.8"/>',
    locked: '<rect x="4" y="7.4" width="8" height="5.6" rx="1.4" fill="currentColor"/><path d="M5.8 7.4V5.6a2.2 2.2 0 0 1 4.4 0v1.8" fill="none" stroke="currentColor" stroke-width="1.6"/>',
    active: '<circle cx="8" cy="8" r="5" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M8 3a5 5 0 0 1 0 10z" fill="currentColor"/>',
    learned: '<path d="M3.6 8.6l2.8 2.8 6-6.4" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>',
    solid: '<circle cx="8" cy="8" r="6.2" fill="currentColor"/><path d="M5 8.3l2.1 2.1L11.2 6" fill="none" stroke="var(--bg)" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"/>',
    mastered: '<path d="M8 1.4l1.9 4.1 4.5.5-3.3 3 .9 4.4L8 11.2l-4 2.2.9-4.4-3.3-3 4.5-.5z" fill="currentColor"/>',
    due: '<circle cx="8" cy="8" r="5.6" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M8 4.8V8l2.2 1.6" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>',
    weak: '<path d="M2.5 10.5l2.8-5 2.7 5 2.7-5 2.8 5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>',
    bolt: '<path d="M9.2 1.5L3.5 9h3.6l-.8 5.5L12.5 7H8.8z" fill="currentColor"/>',
    flame: '<path d="M8 1.2c.4 2.3 3.6 3.6 3.6 7.2A3.7 3.7 0 0 1 8 14.8a3.7 3.7 0 0 1-3.6-3.9c0-1.6.9-2.6 1.6-3.4.2 1 .7 1.6 1.3 1.8C7 7 6.9 3.600 8 1.200z" fill="currentColor"/>'
  };
  function svg(name, size) { return '<svg viewBox="0 0 16 16" width="' + (size || 16) + '" height="' + (size || 16) + '" aria-hidden="true">' + ICON[name] + '</svg>'; }
  function stateOf(id) { return R.isRusty(id) ? 'weak' : R.isDue(id) ? 'due' : R.locked(id) ? 'locked' : R.status(id); }
  function st(id, size) { var s = stateOf(id); return '<i class="st" data-s="' + s + '" title="' + STATE[s] + '">' + svg(s, size) + '</i>'; }
  function tint(track) { var c = TINT[track] || TINT.ai; return '--c1:' + c[0] + ';--c2:' + c[1] + ';'; }
  function trackOf(id) { var t = R.BY_ID[id]; return t ? R.DOMAIN[t.domain].track : 'ai'; }
  function setTint(track) { var c = TINT[track] || TINT.ai; document.body.style.setProperty('--c1', c[0]); document.body.style.setProperty('--c2', c[1]); }

  /* ================= shared pieces ================= */
  function chip(id) {
    var t = R.BY_ID[id];
    if (t) return '<a class="chip" href="#/c/' + id + '">' + st(id, 13) + esc(t.title) + '</a>';
    if (R.DOMAIN[id]) return '<a class="chip" href="#/d/' + id + '">' + esc(R.DOMAIN[id].title) + '</a>';
    if (R.CMP[id]) return '<a class="chip" href="../guide/#/compare/' + id + '">' + esc(R.CMP[id]) + ' ↗</a>';
    return '';
  }
  function chips(ids) { var h = (ids || []).map(chip).join(''); return h ? '<div class="chips">' + h + '</div>' : ''; }
  function meter(pct, cls) { return '<div class="meter ' + (cls || '') + '"><i style="width:' + Math.max(0, Math.min(100, pct)) + '%"></i></div>'; }
  function ring(pct, size, inner) {
    var r = size / 2 - 4, c = 2 * Math.PI * r;
    return '<span class="ring" style="width:' + size + 'px;height:' + size + 'px"><svg viewBox="0 0 ' + size + ' ' + size + '" aria-hidden="true"><circle class="ring-bg" cx="' + size / 2 + '" cy="' + size / 2 + '" r="' + r + '"/><circle class="ring-fg" cx="' + size / 2 + '" cy="' + size / 2 + '" r="' + r + '" stroke-dasharray="' + (c * pct / 100).toFixed(1) + ' ' + c.toFixed(1) + '" transform="rotate(-90 ' + size / 2 + ' ' + size / 2 + ')"/></svg><b>' + inner + '</b></span>';
  }
  function pips(n, of) { var s = ''; for (var i = 0; i < of; i++) s += '<i class="' + (i < n ? 'on' : '') + '"></i>'; return '<span class="pips" aria-label="difficulty ' + n + ' of ' + of + '">' + s + '</span>'; }
  function row(t, extra) {
    return '<a class="row" href="#/c/' + t.id + '">' + st(t.id) + '<span class="row-t"><b>' + esc(t.title) + '</b><small>' + esc(t.summary) + '</small></span><span class="row-x">' + (extra || esc(R.DOMAIN[t.domain].short || R.DOMAIN[t.domain].title)) + '</span></a>';
  }
  function list(items) { return items && items.length ? '<ul>' + items.map(function (i) { return '<li>' + inline(i) + '</li>'; }).join('') + '</ul>' : ''; }
  function avg(a) { return a.length ? a.reduce(function (x, y) { return x + y; }, 0) / a.length : 0; }
  var toastTimer;
  function toast(msg) { var el = document.getElementById('toast'); el.textContent = msg; el.classList.add('is-on'); clearTimeout(toastTimer); toastTimer = setTimeout(function () { el.classList.remove('is-on'); }, 1700); }
  var xpBuf = 0, xpTimer;
  R.onXp = function (n) { xpBuf += n; clearTimeout(xpTimer); xpTimer = setTimeout(function () { toast('+' + xpBuf + ' XP'); xpBuf = 0; chrome(); }, 300); };
  function chrome() {
    var l = R.level(), due = R.dueList().length;
    document.getElementById('hud').innerHTML = '<a href="#/you" class="hud-streak" title="Day streak">' + svg('flame', 13) + R.streak() + '</a><a href="#/you" title="Level ' + l.level + '">LV ' + l.level + '</a>' + (due ? '<a href="#/review" class="hud-due" title="Due for review">' + svg('due', 13) + due + '</a>' : '');
    var name = (location.hash.replace(/^#\/?/, '').split('/')[0]) || 'home', tab = { d: 'path', progress: 'you' }[name] || name;
    document.querySelectorAll('.nav a').forEach(function (a) { a.classList.toggle('is-on', a.dataset.tab === tab); });
  }

  /* ================= question components ================= */
  // Each calls done(score 0..1) once. Wrong answers explain themselves and allow one more try.
  function qMcq(el, q, options, done, single) {
    var tries = 0, over = false;
    el.innerHTML = '<p class="q">' + q + '</p><div class="opts">' + options.map(function (o, i) { return '<button class="opt" data-i="' + i + '"><span class="opt-k">' + 'ABCD'[i] + '</span><span>' + inline(o.t) + '</span></button>'; }).join('') + '</div><div class="fb" aria-live="polite"></div>';
    el.querySelector('.opts').addEventListener('click', function (e) {
      var b = e.target.closest('.opt'); if (!b || over || b.disabled) return;
      var o = options[+b.dataset.i], fb = el.querySelector('.fb'); tries++;
      if (o.ok) {
        over = true; b.classList.add('is-right'); el.querySelectorAll('.opt').forEach(function (x) { x.disabled = true; });
        fb.innerHTML = '<div class="verdict good"><b>' + svg('learned', 14) + (tries === 1 ? 'Correct' : 'Got it') + '</b><p>' + inline(o.why || '') + '</p></div>';
        R.haptic('good'); done(tries === 1 ? 1 : 0.5);
      } else {
        b.classList.add('is-wrong'); b.disabled = true; R.haptic('bad');
        var last = single || tries >= 2;
        fb.innerHTML = '<div class="verdict bad"><b>' + svg('weak', 14) + 'Not this one</b><p>' + inline(o.why || '') + '</p>' + (last ? '' : '<p class="hint">Read that, then try again.</p>') + '</div>';
        if (last) { over = true; el.querySelectorAll('.opt').forEach(function (x, i) { x.disabled = true; if (options[i].ok) x.classList.add('is-right'); }); done(0); }
      }
    });
  }
  function qMatch(el, pairs, done) {
    var defs = R.shuffle(pairs.map(function (p, i) { return i; })), sel = null, left = pairs.length, wrong = 0;
    el.innerHTML = '<p class="q">Match each term to its meaning.</p><div class="match"><div class="match-a">' + pairs.map(function (p, i) { return '<button class="opt" data-term="' + i + '">' + inline(p.term) + '</button>'; }).join('') +
      '</div><div class="match-b">' + defs.map(function (i) { return '<button class="opt" data-def="' + i + '">' + inline(pairs[i].def) + '</button>'; }).join('') + '</div></div><div class="fb" aria-live="polite"><p class="hint">Tap a term, then its meaning.</p></div>';
    el.addEventListener('click', function (e) {
      var a = e.target.closest('[data-term]'), b = e.target.closest('[data-def]');
      if (a && !a.disabled) { el.querySelectorAll('[data-term]').forEach(function (x) { x.classList.remove('is-sel'); }); a.classList.add('is-sel'); sel = a; R.haptic('tick'); }
      else if (b && !b.disabled && sel) {
        if (sel.dataset.term === b.dataset.def) { sel.disabled = b.disabled = true; sel.classList.remove('is-sel'); sel.classList.add('is-right'); b.classList.add('is-right'); sel = null; left--; R.haptic('tick'); }
        else { wrong++; b.classList.add('is-wrong'); R.haptic('bad'); setTimeout(function () { b.classList.remove('is-wrong'); }, 500); }
        if (!left) { el.querySelector('.fb').innerHTML = '<div class="verdict ' + (wrong ? '' : 'good') + '"><b>' + (wrong ? 'Matched, with ' + wrong + ' wrong ' + (wrong === 1 ? 'try' : 'tries') : svg('learned', 14) + 'All matched first time') + '</b></div>'; R.haptic('good'); done(Math.max(0, 1 - wrong / pairs.length)); }
      }
    });
  }
  function qSort(el, title, items, done) {
    var i = 0, right = 0, log = [];
    function show() {
      if (i >= items.length) {
        el.innerHTML = '<p class="q">Use it, or avoid it?</p><ul class="sortlog">' + log.join('') + '</ul><div class="fb"><div class="verdict ' + (right === items.length ? 'good' : '') + '"><b>' + right + ' of ' + items.length + ' right</b></div></div>';
        return done(right / items.length);
      }
      el.innerHTML = '<p class="q">Would you reach for <b>' + esc(title) + '</b> here?</p><div class="sortcard">' + inline(items[i].t) + '</div><div class="opts two"><button class="opt big" data-a="use">Use it</button><button class="opt big" data-a="avoid">Avoid it</button></div><p class="hint">' + (i + 1) + ' of ' + items.length + '</p>';
    }
    el.addEventListener('click', function (e) {
      var b = e.target.closest('[data-a]'); if (!b) return;
      var ok = b.dataset.a === items[i].side; if (ok) right++; R.haptic(ok ? 'tick' : 'bad');
      log.push('<li class="' + (ok ? 'good' : 'bad') + '"><b>' + (items[i].side === 'use' ? 'Use' : 'Avoid') + '</b> ' + inline(items[i].t) + '</li>');
      i++; show();
    });
    show();
  }
  function grader(el, done) {
    el.insertAdjacentHTML('beforeend', '<div class="grade"><span class="lbl">Be honest. How did you do?</span><div class="opts three"><button class="opt" data-g="1">Nailed it</button><button class="opt" data-g="0.5">Partly</button><button class="opt" data-g="0">Missed it</button></div></div>');
    el.querySelector('.grade').addEventListener('click', function (e) {
      var b = e.target.closest('[data-g]'); if (!b || el.dataset.done) return;
      el.dataset.done = 1; el.querySelectorAll('.grade .opt').forEach(function (x) { x.disabled = true; }); b.classList.add('is-sel');
      R.haptic(+b.dataset.g ? 'good' : 'tick'); done(+b.dataset.g);
    });
  }
  function qCard(el, q, a, done) {
    el.innerHTML = '<p class="q">' + inline(q) + '</p><p class="hint">Answer in your head or out loud. Then check.</p><button class="btn ghost wide" data-a="reveal">Show the answer</button><div class="ans" hidden></div>';
    el.querySelector('[data-a=reveal]').addEventListener('click', function (e) { e.target.remove(); var box = el.querySelector('.ans'); box.hidden = false; box.innerHTML = prose(a); grader(el, done); });
  }
  function qExplain(el, title, ref, done) {
    el.innerHTML = '<p class="q">Explain <b>' + esc(title) + '</b> without looking.</p><p class="hint">Write it the way you would say it to a colleague: what it is, why it exists, how it works, one example.</p><textarea class="ta" rows="6" placeholder="Type, or say it out loud"></textarea><button class="btn ghost wide" data-a="reveal">Compare with the reference</button><div class="ans" hidden></div>';
    el.querySelector('[data-a=reveal]').addEventListener('click', function (e) {
      e.target.remove(); var box = el.querySelector('.ans'); box.hidden = false;
      box.innerHTML = '<span class="lbl">Reference answer</span>' + prose(ref) + '<p class="hint">Missing the mechanism counts as "Partly".</p>'; grader(el, done);
    });
  }
  // A scenario: evidence first, then a chain of decisions, each explained.
  function qScenario(el, sc, done, pickOne) {
    var steps = pickOne ? [sc.steps[Math.floor(Math.random() * sc.steps.length)]] : sc.steps, i = 0, scores = [];
    el.innerHTML = '<div class="scene"><span class="lbl">' + svg('bolt', 12) + ' Situation</span><p>' + inline(sc.setup) + '</p></div><div class="scene-q"></div>';
    function next() {
      var s = steps[i], box = el.querySelector('.scene-q');
      box.innerHTML = (steps.length > 1 ? '<span class="lbl">Decision ' + (i + 1) + ' of ' + steps.length + '</span>' : '') + '<div class="scene-body"></div><div class="scene-next"></div>';
      qMcq(box.querySelector('.scene-body'), esc(s.q), R.shuffle(s.options.map(function (o) { return { t: o[0], ok: o[1], why: o[2] }; })), function (v) {
        scores.push(v); i++;
        if (i >= steps.length) return done(avg(scores));
        box.querySelector('.scene-next').innerHTML = '<button class="btn wide">Next decision</button>';
        box.querySelector('.scene-next .btn').addEventListener('click', next);
      });
    }
    next();
  }

  /* ---- build question items from a concept ---- */
  function others(T, siblings, n) {
    var pool = siblings.filter(function (s) { return s.id !== T.id; });
    if (pool.length < n) pool = pool.concat(R.FLAT.filter(function (s) { return s.id !== T.id && s.domain !== T.domain; }).slice(0, 12));
    return R.shuffle(pool).slice(0, n);
  }
  var make = {
    summary: function (T, sib) { return function (el, done) {
      qMcq(el, 'Which of these describes <b>' + esc(T.title) + '</b>?', R.shuffle([{ t: T.summary, ok: 1, why: 'That is the one-line version.' }].concat(others(T, sib, 3).map(function (o) { return { t: o.summary, why: 'That describes ' + o.title + '.' }; }))), done); }; },
    reverse: function (T, sib) { return function (el, done) {
      qMcq(el, 'Which concept is this?<span class="quote">' + inline(T.summary) + '</span>', R.shuffle([{ t: T.title, ok: 1, why: 'Yes.' }].concat(others(T, sib, 3).map(function (o) { return { t: o.title, why: o.title + ': ' + o.summary }; }))), done); }; },
    prereq: function (T) {
      var pre = (T.prereq || []).filter(function (p) { return R.BY_ID[p]; }); if (!pre.length) return null;
      var before = {}; R.before(T.id).forEach(function (b) { before[b.id] = 1; });
      var later = R.shuffle(R.FLAT.filter(function (x) { return x.n > R.BY_ID[T.id].n && !before[x.id] && x.id !== T.id; }).slice(0, 14)).slice(0, 3);
      if (later.length < 2) return null;
      var p = R.BY_ID[pre[Math.floor(Math.random() * pre.length)]];
      return function (el, done) { qMcq(el, 'Which of these do you need <b>before</b> ' + esc(T.title) + '?', R.shuffle([{ t: p.title, ok: 1, why: p.summary }].concat(later.map(function (o) { return { t: o.title, why: 'That builds on this concept, or sits elsewhere on the path.' }; }))), done); };
    },
    match: function (T) { if (!T.keyTerms || T.keyTerms.length < 3) return null; var pairs = R.shuffle(T.keyTerms).slice(0, 4); return function (el, done) { qMatch(el, pairs, done); }; },
    sort: function (T) {
      if (!T.useCases || !T.avoid || T.useCases.length < 2 || T.avoid.length < 2) return null;
      var strip = function (s) { return s.replace(/^when\s+/i, '').replace(/^./, function (c) { return c.toUpperCase(); }); };
      var items = R.shuffle(T.useCases.slice(0, 3).map(function (t) { return { t: t, side: 'use' }; }).concat(T.avoid.slice(0, 3).map(function (t) { return { t: strip(t), side: 'avoid' }; })));
      return function (el, done) { qSort(el, T.title, items, done); };
    },
    card: function (T, i) { var q = T.questions && T.questions[i % Math.max(1, T.questions.length)]; return q ? function (el, done) { qCard(el, q.q, q.a, done); } : null; },
    explain: function (T) { var iv = T.interview || {}, ref = iv.s90 || iv.s30 || (T.summary + '\n\n' + T.what); return function (el, done) { qExplain(el, T.title, ref, done); }; },
    scenario: function (T, one) { var d = R.deep[T.id], sc = d && d.scenarios && d.scenarios[0]; return sc ? function (el, done) { qScenario(el, sc, done, one); } : null; }
  };
  // Runs items one at a time. With a key, it remembers which question you were on.
  function runner(box, items, finish, key) {
    items = items.filter(Boolean);
    var saved = (R.sess() || {}).q, i = 0, scores = [];
    if (key && saved && saved.key === key && saved.i < items.length) { i = saved.i; scores = saved.scores.slice(); }
    function next() {
      if (key) R.sess({ q: { key: key, i: i, scores: scores } });
      if (i >= items.length) { if (key) R.sess({ q: null }); return finish(scores); }
      box.innerHTML = '<div class="qhead"><span class="lbl">Question ' + (i + 1) + ' of ' + items.length + '</span><span class="segs">' + items.map(function (_, k) { return '<i class="' + (k < i ? 'on' : k === i ? 'cur' : '') + '"></i>'; }).join('') + '</span></div><div class="qbody"></div><div class="qfoot"></div>';
      items[i](box.querySelector('.qbody'), function (s) {
        scores.push(s); i++;
        if (key) R.sess({ q: { key: key, i: i, scores: scores } });
        box.querySelector('.qfoot').innerHTML = '<button class="btn wide" data-a="qnext">' + (i >= items.length ? 'Finish' : 'Next question') + '</button>';
        var b = box.querySelector('[data-a=qnext]'); b.addEventListener('click', next); b.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      });
    }
    next();
  }

  /* ================= today ================= */
  function heat(weeks) {
    var S = R.state(), k = R.today(), dow = (new Date().getDay() + 6) % 7, total = (weeks - 1) * 7 + dow + 1, start = R.addDays(k, -(total - 1)), cells = '';
    for (var i = 0; i < total; i++) {
      var day = R.addDays(start, i), log = S.log[day], xp = log ? log.xp : 0, lvl = !xp ? 0 : xp < 30 ? 1 : xp < 80 ? 2 : xp < 160 ? 3 : 4;
      cells += '<i data-l="' + lvl + '" title="' + day + ': ' + xp + ' XP' + (log && log.sec ? ', ' + R.mins(log.sec) + ' min' : '') + '"></i>';
    }
    return '<div class="heat">' + cells + '</div>';
  }
  function trail(m) {
    var d = R.DOMAIN[m.domain], idx = d.topics.indexOf(m), from = Math.max(0, idx - 3), slice = d.topics.slice(from, from + 9);
    return '<section class="trail" style="' + tint(d.track) + '"><div class="trail-head"><span class="lbl">Your path</span><a href="#/d/' + d.id + '">' + esc(d.title) + ' ›</a></div><div class="trail-line">' + slice.map(function (t) {
      return '<a class="tnode' + (t.id === m.id ? ' is-here' : '') + '" data-s="' + stateOf(t.id) + '" href="#/c/' + t.id + '" title="' + esc(t.title) + '"><span class="tnode-b">' + svg(t.id === m.id ? 'bolt' : stateOf(t.id), 15) + '</span><span class="tnode-t">' + esc(t.title) + '</span></a>';
    }).join('') + '</div></section>';
  }
  function heroCard(kind, title, why, extra, href, cta, track, under, meta) {
    return '<section class="hero" style="' + tint(track) + '"><span class="hero-tag">' + svg('bolt', 13) + ' ' + R.budget() + ' minutes <i>/</i> ' + kind + '</span><span class="lbl hero-lbl">Your next discovery</span><h1>' + esc(title) + '</h1>' + (why ? '<p class="hero-why">' + esc(why) + '</p>' : '') + (extra || '') +
      '<a class="cta" href="' + href + '">' + cta + '<span aria-hidden="true">→</span></a>' + (meta ? '<span class="hero-meta">' + meta + '</span>' : '') + (under || '') + '</section>';
  }
  function pageHome() {
    var S = R.state(), h = new Date().getHours(), greet = h < 5 ? 'Still up' : h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening';
    var tot = R.totals(), lvl = R.level(), streak = R.streak(), due = R.dueList(), weak = R.weakList(), m = R.mission(), done = R.missionDone(), b = R.budget(), last = R.lastLearned();
    // an unfinished session outranks today's pick: you return exactly where you stopped
    var sess = S.sess, resume = sess && R.BY_ID[sess.id] && R.status(sess.id) === 'active' ? R.BY_ID[sess.id] : null, why = (S.mission && S.mission.why) || '';
    if (resume && b !== 2) { m = resume; done = false; why = 'You stopped at ' + STAGE[sess.stage || 'explore'] + '. Pick it up from there.'; }
    setTint(m ? trackOf(m.id) : 'ai');
    var html = '<div class="home"><header class="h-top"><a class="streak' + (streak ? ' is-lit' : '') + '" href="#/you">' + svg('flame', 18) + '<b>DAY ' + streak + '</b></a><div class="h-greet"><span class="dim">' + greet + ',</span> ' + esc(S.name) + '</div><a class="lvl" href="#/you" title="Level ' + lvl.level + ', ' + lvl.pct + '% to the next">' + ring(lvl.pct, 44, lvl.level) + '</a></header>';
    html += '<div class="budget" role="radiogroup" aria-label="How long do you have?">' + R.BUDGETS.map(function (x) { return '<button role="radio" aria-checked="' + (x[0] === b) + '" data-b="' + x[0] + '"><b>' + x[0] + '</b><span>min</span></button>'; }).join('') + '</div>';

    // the one action
    var kind = R.BUDGETS.filter(function (x) { return x[0] === b; })[0][1], hero = '';
    if (b === 2) {
      if (due.length) hero = heroCard(kind, 'Can you still explain ' + due[0].title + '?', due.length === 1 ? 'One concept wants a second look.' : due.length + ' concepts want a second look. Two of them fit in two minutes.', '', '#/review', 'Start recall', trackOf(due[0].id));
      else if (last) hero = heroCard(kind, 'Can you still explain ' + last.title + '?', 'No notes. Just you and what stuck.', '', '#/c/' + last.id + '/recall', 'Try it', trackOf(last.id));
      else if (m) hero = heroCard(kind, m.hook || m.title, 'Nothing to recall yet. Take a first look at ' + m.title + '.', '', '#/c/' + m.id + '/explore', 'Take a look', trackOf(m.id));
    } else if (m && !done) {
      var r = R.rec(m.id), started = r && Object.keys(r.steps || {}).length, know = (m.pre || []).filter(function (p) { return R.BY_ID[p]; }).slice(0, 3);
      var knows = know.length ? '<div class="knows"><span class="lbl">Builds on</span>' + know.map(function (p) { var ok = R.rec(p) && R.rec(p).s; return '<span class="know' + (ok ? ' ok' : '') + '">' + svg(ok ? 'learned' : 'new', 12) + esc(R.BY_ID[p].title) + '</span>'; }).join('') + '<span class="lbl">Next</span><span class="know next">' + esc(m.title) + '</span></div>' : '<div class="knows"><span class="lbl">Today</span><span class="know next">' + esc(m.title) + '</span></div>';
      hero = heroCard(kind, m.hook || m.title, why, knows, '#/c/' + m.id, started ? 'Continue' : 'Start', trackOf(m.id), '<button class="link" data-a="swap">Not today. Show me something else</button>', R.planStages().length + ' steps');
    } else if (m) {
      var nx = R.nextNew(m.id);
      hero = '<section class="hero is-done" style="' + tint(trackOf(m.id)) + '"><span class="hero-tag">' + svg('mastered', 13) + ' Mission complete</span><h1>' + esc(m.title) + ' is in your system.</h1><p class="hero-why">It comes back tomorrow for a quick recall. That is how it sticks.</p>' +
        (due.length ? '<a class="cta" href="#/review">Review ' + due.length + ' due</a>' : nx ? '<a class="cta" href="#/c/' + nx.id + '">Go again<small>' + esc(nx.title) + '</small></a>' : '') + (due.length && nx ? '<a class="link" href="#/c/' + nx.id + '">Or learn another: ' + esc(nx.title) + '</a>' : '') + '</section>';
    } else hero = '<section class="hero"><h1>Every concept is learned.</h1><p class="hero-why">Keep the reviews going and take on the investigations.</p><a class="cta" href="#/hack">Open hacker mode</a></section>';
    html += hero;
    if (m) html += trail(m);

    // secondary, short
    var rnd = R.random(true), ch = R.challenges.filter(function (c) { return !S.ch[c.id]; })[0] || R.challenges[0];
    html += '<div class="quick">' +
      (due.length && b !== 2 ? '<a class="qcard is-due" href="#/review"><span class="lbl">' + svg('due', 12) + ' Review due</span><b>' + due.length + (due.length === 1 ? ' concept' : ' concepts') + '</b><span class="dim">About ' + Math.max(2, due.length * 2) + ' min</span></a>' : '') +
      (weak.length ? '<a class="qcard is-weak" href="#/review"><span class="lbl">' + svg('weak', 12) + ' Needs attention</span><b>' + esc(weak[0].title) + '</b><span class="dim">' + (weak.length > 1 ? 'and ' + (weak.length - 1) + ' more' : 'slipped in review') + '</span></a>' : '') +
      '<button class="qcard is-surprise" data-a="surprise" style="' + tint(trackOf(rnd.id)) + '"><span class="lbl">' + svg('bolt', 12) + ' Surprise me</span><b>' + esc(rnd.hook || rnd.title) + '</b><span class="dim">' + esc(rnd.title) + '</span></button>' +
      '<a class="qcard is-hack" href="#/hack/' + ch.id + '"><span class="lbl">' + svg('bolt', 12) + ' ' + esc(ch.kind) + '</span><b>' + esc(ch.title) + '</b><span class="dim">' + ch.mins + ' min investigation</span></a></div>';
    html += '<section class="pulse-row"><a href="#/you"><b>' + tot.pct + '%</b><span>knowledge</span></a><a href="#/you"><b>' + tot.learned + '</b><span>learned</span></a><a href="#/you"><b>' + tot.mastered + '</b><span>mastered</span></a><a href="#/you"><b>' + R.mins(R.weekSeconds()) + '</b><span>min this week</span></a></section>';
    html += '<section class="act"><span class="lbl">Last 16 weeks</span><div class="heat-wrap">' + heat(16) + '</div></section></div>';
    main.innerHTML = html;
    main.querySelector('.budget').addEventListener('click', function (e) { var x = e.target.closest('[data-b]'); if (x) { R.setBudget(+x.dataset.b); R.haptic('tick'); pageHome(); } });
    var rid = rnd.id;
    main.querySelector('[data-a=surprise]').addEventListener('click', function () { location.hash = '#/c/' + rid; });
    var sw = main.querySelector('[data-a=swap]');
    if (sw) sw.addEventListener('click', function () {
      var pool = R.FLAT.filter(function (x) { return R.status(x.id) === 'new' && !R.locked(x.id) && x.id !== m.id; });
      var t = pool[Math.floor(Math.random() * Math.min(pool.length, 30))]; if (!t) return;
      S.mission = { date: R.today(), id: t.id, why: 'You asked for something else.' }; R.save(); pageHome();
    });
    var here = main.querySelector('.tnode.is-here'); if (here) here.parentNode.scrollLeft = here.offsetLeft - here.parentNode.offsetLeft - 90;
    document.title = 'Revision OS';
  }

  /* ================= the session ================= */
  function localGraph(T) {
    var p = (T.prereq || []).filter(function (x) { return R.BY_ID[x]; }).slice(0, 5), nx = (T.next || []).filter(function (x) { return R.BY_ID[x]; }).slice(0, 5);
    function col(ids, label, empty) { return '<div class="lg-col"><span class="lbl">' + label + '</span>' + (ids.length ? ids.map(function (id) { return '<a class="lg-node" href="#/c/' + id + '">' + st(id, 14) + esc(R.BY_ID[id].title) + '</a>'; }).join('') : '<span class="dim sm">' + empty + '</span>') + '</div>'; }
    return '<div class="lg">' + col(p, 'Before', 'A starting point.') + '<div class="lg-here"><span class="lbl">You are here</span>' + esc(T.title) + '</div>' + col(nx, 'Leads to', 'An end point for now.') + '</div>';
  }
  var lastStageIdx = -1, lastConcept = null;
  function pageConcept(id, stage) {
    var stub = R.BY_ID[id];
    if (!stub) return notFound();
    stage = R.STAGES.indexOf(stage) > -1 ? stage : null;
    return Promise.all([R.topic(id), R.load('tools.json')]).then(function (res) {
      var T = res[0].t, sib = res[0].siblings, tools = {}; res[1].tools.forEach(function (x) { tools[x.id] = x; });
      var plan = R.planStages(), learned = R.status(id) !== 'new' && R.status(id) !== 'active';
      if (!stage) {
        var sess = R.sess();
        stage = sess && sess.id === id && sess.stage ? sess.stage : (learned ? 'understand' : plan.filter(function (s) { return !R.stepDone(id, s); })[0] || 'explore');
      }
      if (plan.indexOf(stage) < 0) plan = R.STAGES;
      var d = R.DOMAIN[stub.domain], si = R.STAGES.indexOf(stage), pi = plan.indexOf(stage), nextStage = plan[pi + 1], prevStage = plan[pi - 1];
      var dir = lastConcept === id && lastStageIdx > si ? 'back' : 'fwd'; lastStageIdx = si; lastConcept = id;
      if ((R.sess() || {}).id !== id) R.sess(null);
      R.sess({ id: id, stage: stage });
      setTint(d.track);
      var passive = { explore: 1, understand: 1, visualize: 1, connect: 1 }[stage];
      var html = '<div class="sess" data-stage="' + stage + '"><header class="sess-top"><a class="sess-x" href="#/" aria-label="Leave the session">×</a><div class="beam" role="navigation" aria-label="Stages">' + R.STAGES.map(function (s, i) {
        return '<a href="#/c/' + id + '/' + s + '" class="' + (i < si || R.stepDone(id, s) ? 'is-done ' : '') + (s === stage ? 'is-on' : '') + (plan.indexOf(s) < 0 ? ' is-off' : '') + '" aria-label="' + STAGE[s] + '"><i></i></a>';
      }).join('') + '</div><span class="sess-n">' + (si + 1) + '<i>/8</i></span></header>' +
        '<div class="sess-body"><aside class="sess-path"><span class="lbl">' + esc(d.title) + '</span>' + d.topics.map(function (t) { return '<a href="#/c/' + t.id + '" class="' + (t.id === id ? 'is-on' : '') + '">' + st(t.id, 13) + esc(t.title) + '</a>'; }).join('') + '</aside>' +
        '<div class="sess-main"><div class="stage-tag"><b>' + STAGE[stage] + '</b><span>' + esc(T.title) + '</span></div><section class="stage is-' + dir + '" id="stage"></section></div>' +
        '<aside class="sess-ctx"><span class="lbl">Where this sits</span>' + localGraph(T) + (T.keyTerms.length ? '<span class="lbl">Words to know</span><dl class="terms sm">' + T.keyTerms.slice(0, 5).map(function (k) { return '<dt>' + inline(k.term) + '</dt><dd>' + inline(k.def) + '</dd>'; }).join('') + '</dl>' : '') +
        ((T.related || []).length ? '<span class="lbl">Related</span>' + chips(T.related.slice(0, 5)) : '') + '</aside></div>' +
        '<footer class="sess-foot"' + (passive ? '' : ' hidden') + '>' + (prevStage ? '<a class="btn ghost" href="#/c/' + id + '/' + prevStage + '" aria-label="Back to ' + STAGE[prevStage] + '">‹</a>' : '') +
        (nextStage ? '<a class="cta" id="go-next" href="#/c/' + id + '/' + nextStage + '">Continue<small>' + STAGE[nextStage] + '</small></a>' : '<a class="cta" id="go-next" href="#/">Done</a>') + '</footer></div>';
      main.innerHTML = html;
      var go = document.getElementById('go-next');
      if (go && passive) go.addEventListener('click', function () { R.markStep(id, stage); R.haptic('tick'); });
      stageView[stage](document.getElementById('stage'), T, sib, tools, stub, { plan: plan, next: nextStage });
      document.title = T.title + ' / Revision OS';
    });
  }
  function showFoot(on) { var f = main.querySelector('.sess-foot'); if (f) f.hidden = !on; }
  function exampleHtml(T) {
    var ex = T.example; if (!ex) return '';
    if (typeof ex === 'string') return '<h3>Worked example</h3>' + prose(ex);
    return '<h3>Worked example</h3>' + (ex.intro ? prose(ex.intro) : '') + (ex.caption ? '<p class="cap">' + inline(ex.caption) + '</p>' : '') + (ex.code ? pre(ex.code) : '') + (ex.after ? prose(ex.after) : '');
  }
  function levelHtml(n, T, tools) {
    var iv = T.interview || {}, D = R.deep[T.id];
    if (n === 0) return '<p class="surface">' + inline(T.summary) + '</p>' + (iv.s30 ? prose(iv.s30) : '') + (T.analogy ? '<div class="analogy"><span class="lbl">Think of it like this</span>' + prose(T.analogy) + '</div>' : '');
    if (n === 1) return '<h3>What it is</h3>' + prose(T.what) + '<h3>Why it exists</h3>' + prose(T.why);
    if (n === 2) return '<h3>How it actually works</h3>' + prose(T.technical) + (T.diagram ? '<h3>The picture</h3>' + pre(T.diagram) : '') + exampleHtml(T);
    if (n === 3) return (D ? '<h3>What it assumes</h3>' + list(D.assumptions) + '<h3>What happens when those fail</h3>' + list(D.failure) + '<h3>Trade-offs</h3>' + list(D.tradeoffs) +
        '<h3>What people get wrong</h3><div class="myths">' + D.misconceptions.map(function (m) { return '<div class="myth"><p class="myth-a">' + inline(m[0]) + '</p><p class="myth-b">' + inline(m[1]) + '</p></div>'; }).join('') + '</div>' : '') +
      '<div class="two"><div><h3>Use it when</h3>' + list(T.useCases) + '</div><div><h3>Avoid it when</h3>' + list(T.avoid) + '</div></div>' + (T.mistakes.length ? '<h3>Common mistakes</h3>' + list(T.mistakes) : '') +
      (!D && T.keyTerms.length ? '<h3>Words to know</h3><dl class="terms">' + T.keyTerms.map(function (k) { return '<dt>' + inline(k.term) + '</dt><dd>' + inline(k.def) + '</dd>'; }).join('') + '</dl>' : '');
    var tl = (T.tools || []).map(function (x) { return tools[x]; }).filter(Boolean);
    return (D ? prose(D.expert) + '<h3>Where it shows up</h3>' + list(D.realWorld) + '<h3>Where the simple version breaks</h3>' + list(D.edge) : '') +
      (iv.s90 ? '<h3>The 90 second answer</h3>' + prose(iv.s90) : '') + (iv.technical ? '<h3>If someone pushes on the technical side</h3>' + prose(iv.technical) : '') + (iv.pm ? '<h3>The product angle</h3>' + prose(iv.pm) : '') + (iv.example ? '<h3>An example to give</h3>' + prose(iv.example) : '') +
      (!D && !iv.s90 && !iv.technical ? '<p class="dim">Expert notes for this concept are not written yet. The sources below are the way deeper for now.</p>' : '') +
      (tl.length ? '<h3>Tools</h3>' + tl.map(function (x) { return '<p><b>' + esc(x.name) + '.</b> ' + inline(x.what) + ' <a href="' + esc(x.url) + '" target="_blank" rel="noopener noreferrer">Docs ↗</a></p>'; }).join('') : '') +
      (T.resources.length ? '<h3>Go to the source</h3><ul class="links">' + T.resources.map(function (r) { return '<li><span class="kind">' + esc(r.kind || 'link') + '</span><a href="' + esc(r.url) + '" target="_blank" rel="noopener noreferrer">' + esc(r.label) + '</a>' + (r.note ? '<span class="note">' + inline(r.note) + '</span>' : '') + '</li>'; }).join('') + '</ul>' : '');
  }
  var stageView = {
    explore: function (box, T) {
      showFoot(false);
      box.innerHTML = '<span class="lbl">Before I explain anything</span><h2 class="hook">' + inline((T.questions[0] || {}).q || 'What do you think ' + T.title + ' is?') + '</h2><p class="dim">Commit to a guess. A wrong guess still makes the answer stick better than no guess.</p>' +
        '<button class="cta" data-a="open">I have my guess</button><div id="ex" hidden><p class="surface">' + inline(T.summary) + '</p>' + (T.analogy ? '<div class="analogy"><span class="lbl">Think of it like this</span>' + prose(T.analogy) + '</div>' : '') + '<p class="dim">Was your guess close? Next, the mechanism.</p></div>';
      box.querySelector('[data-a=open]').addEventListener('click', function (e) { e.target.remove(); var ex = box.querySelector('#ex'); ex.hidden = false; ex.classList.add('reveal'); R.haptic('tick'); showFoot(true); });
    },
    understand: function (box, T, sib, tools, stub) {
      var sess = R.sess() || {}, shown = sess.id === stub.id && sess.depth != null ? sess.depth : 0, target = R.depthTarget();
      box.innerHTML = '<div class="descent"><div class="gauge" aria-hidden="true">' + LEVELS.map(function (l, i) { return '<i data-l="' + i + '"><b>' + (i + 1) + '</b></i>'; }).join('') + '</div><div class="levels" id="levels"></div></div><div id="deeper"></div>';
      var levels = box.querySelector('#levels'), deeper = box.querySelector('#deeper');
      function add(n, scroll) {
        var el = document.createElement('section'); el.className = 'lvl reveal'; el.dataset.l = n;
        el.innerHTML = '<header><span class="lvl-n">Level ' + (n + 1) + '</span><b>' + LEVELS[n][0] + '</b><span class="dim">' + LEVELS[n][1] + '</span></header><div class="reading">' + levelHtml(n, T, tools) + '</div>';
        levels.appendChild(el);
        box.querySelectorAll('.gauge i').forEach(function (g, i) { g.classList.toggle('on', i <= n); });
        document.body.dataset.depth = n;
        if (scroll) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
      function button() {
        var n = levels.children.length;
        deeper.innerHTML = n < 5 ? '<button class="btn deeper" data-a="deeper"><span>Go deeper</span><b>' + LEVELS[n][0] + '</b><small>' + LEVELS[n][1] + (n <= target ? '' : ' / beyond today\'s ' + R.budget() + ' min') + '</small><i aria-hidden="true">↓</i></button>' : '<p class="dim bottom">That is the bottom. You have everything written on this concept.</p>';
      }
      for (var i = 0; i <= Math.min(4, shown); i++) add(i, false);
      button();
      deeper.addEventListener('click', function (e) {
        if (!e.target.closest('[data-a=deeper]')) return;
        var n = levels.children.length; add(n, true); R.sess({ depth: n }); R.haptic('tick'); button();
      });
    },
    visualize: function (box, T) {
      box.innerHTML = '<span class="lbl">' + (R.hasVisual(T.id) ? 'Move things. Watch what changes.' : 'The structure, drawn out') + '</span><div id="vis"></div>' + (T.diagram ? '<details class="more"' + (R.hasVisual(T.id) ? '' : ' open') + '><summary>' + (R.hasVisual(T.id) ? 'The full diagram' : 'Diagram') + '</summary>' + pre(T.diagram) + '</details>' : '') + (T.example ? '<details class="more"><summary>Worked example</summary>' + exampleHtml(T).replace('<h3>Worked example</h3>', '') + '</details>' : '');
      if (R.hasVisual(T.id)) R.mountVisual(box.querySelector('#vis'), T.id);
    },
    test: function (box, T, sib, tools, stub, ctx) {
      box.innerHTML = '<div id="run"></div>';
      runner(box.querySelector('#run'), [make.summary(T, sib), make.match(T)].concat(T.questions.slice(0, 3).map(function (_, i) { return make.card(T, i); })), function (sc) { finishStage(box.querySelector('#run'), stub.id, 'test', sc, ctx); }, stub.id + ':test');
    },
    connect: function (box, T, sib, tools, stub) {
      var cmp = (T.related || []).filter(function (r) { return R.CMP[r]; }), rel = (T.related || []).filter(function (r) { return !R.CMP[r]; });
      box.innerHTML = '<span class="lbl">Where this sits in what you know</span>' + localGraph(T) + (rel.length ? '<h3>Related</h3>' + chips(rel) : '') + (cmp.length ? '<h3>Often confused with</h3>' + chips(cmp) : '') + '<p><a class="btn ghost sm" href="#/map/' + T.id + '">Open on the knowledge map</a></p><div id="run" class="inset"></div>';
      var q = make.prereq(T); if (q) q(box.querySelector('#run'), function () {}); else box.querySelector('#run').remove();
    },
    apply: function (box, T, sib, tools, stub, ctx) {
      var ch = R.challenges.filter(function (c) { return c.topics.indexOf(T.id) > -1; })[0], sc = make.scenario(T);
      box.innerHTML = '<div id="run"></div><div id="after"></div>';
      runner(box.querySelector('#run'), sc ? [sc] : [make.sort(T), make.card(T, T.questions.length - 1)], function (s) {
        finishStage(box.querySelector('#run'), stub.id, 'apply', s, ctx);
        if (ch) box.querySelector('#after').innerHTML = '<a class="qcard is-hack" href="#/hack/' + ch.id + '"><span class="lbl">' + svg('bolt', 12) + ' ' + esc(ch.kind) + '</span><b>' + esc(ch.title) + '</b><span class="dim">This concept is part of a full investigation</span></a>';
      }, stub.id + ':apply');
    },
    recall: function (box, T, sib, tools, stub, ctx) {
      box.innerHTML = '<div id="run"></div>';
      make.explain(T)(box.querySelector('#run'), function (s) { finishStage(box.querySelector('#run'), stub.id, 'recall', [s], ctx); });
    },
    master: function (box, T, sib, tools, stub) {
      box.innerHTML = '<span class="lbl" id="m-lbl">Three questions. Two to pass.</span><div id="run"></div>';
      var mid = make.scenario(T, true) || (Math.random() < 0.5 ? (make.match(T) || make.sort(T)) : (make.sort(T) || make.match(T)));
      runner(box.querySelector('#run'), [make.reverse(T, sib), mid || make.card(T, 1), make.card(T, Math.floor(Math.random() * T.questions.length))], function (sc) {
        var pass = avg(sc) >= 0.66, run = box.querySelector('#run'), id = stub.id, lb = box.querySelector('#m-lbl');
        if (lb) lb.remove();
        if (!pass) {
          run.innerHTML = '<div class="result fail"><span class="lbl">Not yet / ' + Math.round(avg(sc) * 100) + '%</span><h2>Close. One level deeper, then try again.</h2><p class="dim">The check needs two of three. Nothing is lost.</p><a class="cta" href="#/c/' + id + '/understand">Back to Understand</a><button class="link" data-a="retry">Retry the check now</button></div>';
          run.querySelector('[data-a=retry]').addEventListener('click', function () { stageView.master(box, T, sib, tools, stub); });
          return;
        }
        var before = R.totals().fine, d = R.DOMAIN[stub.domain];
        R.markStep(id, 'master'); var first = R.learn(id), r = R.rec(id), nx = R.nextNew(id), after = R.totals(), dNow = R.totals(d.topics).learned, unlocked = (T.next || []).filter(function (n) { return R.BY_ID[n] && !R.locked(n) && R.status(n) === 'new'; });
        R.sess(null); R.haptic('done');
        run.innerHTML = '<div class="won"><div class="won-fx" aria-hidden="true"><i></i><i></i><i></i><span>' + svg('mastered', 34) + '</span></div><span class="lbl">Check passed / ' + Math.round(avg(sc) * 100) + '%</span><h2>' + esc(T.title) + (first ? ' is in your system.' : ' is still solid.') + '</h2>' +
          '<div class="won-stats"><div><b>' + before + '% <i>→</i> ' + after.fine + '%</b><span>knowledge</span></div><div><b>' + dNow + ' / ' + d.topics.length + '</b><span>' + esc(d.short || d.title) + '</span></div><div><b>' + new Date(r.due + 'T12:00').toLocaleDateString(undefined, { weekday: 'short', day: 'numeric' }) + '</b><span>comes back</span></div></div>' +
          (unlocked.length ? '<div class="unlock"><span class="lbl">Now within reach</span><div class="chips">' + unlocked.map(function (n, i) { return '<a class="chip pop" style="animation-delay:' + (0.5 + i * 0.12) + 's" href="#/c/' + n + '">' + svg('new', 13) + esc(R.BY_ID[n].title) + '</a>'; }).join('') + '</div></div>' : '') +
          (nx ? '<a class="cta" href="#/c/' + nx.id + '">Next concept<small>' + esc(nx.title) + '</small></a>' : '') +
          '<a class="btn ghost wide" href="#/c/' + id + '/understand" data-a="deeper">Go one step deeper on this</a><a class="link" href="#/">Done for today</a></div>';
        run.querySelector('[data-a=deeper]').addEventListener('click', function () { R.sess({ id: id, stage: 'understand', depth: Math.min(4, R.depthTarget() + 1) }); });
        chrome();
      }, stub.id + ':master');
    }
  };
  function finishStage(run, id, stage, sc, ctx) {
    R.markStep(id, stage); R.haptic('good');
    var p = Math.round(avg(sc) * 100), nextStage = ctx && ctx.next, micro = !nextStage;
    run.innerHTML = '<div class="result ' + (p >= 66 ? 'pass' : 'fail') + '"><span class="lbl">' + STAGE[stage] + ' done / ' + p + '%</span><h2>' + (p >= 85 ? 'Clean.' : p >= 50 ? 'Mostly there.' : 'Shaky.') + '</h2><p class="dim">' + (p >= 85 ? 'Keep moving.' : p >= 50 ? 'The gaps come back in review.' : 'Worth another pass at Understand before the mastery check.') + '</p>' +
      (micro ? '<p>That is the micro lesson. The concept stays in progress until you pass the mastery check.</p><a class="cta" href="#/c/' + id + '/visualize" data-a="full">Keep going<small>finish the mission</small></a><a class="link" href="#/">Done for now</a>'
        : '<a class="cta" href="#/c/' + id + '/' + nextStage + '">Continue<small>' + STAGE[nextStage] + '</small></a>' + (p < 50 ? '<a class="link" href="#/c/' + id + '/understand">Back to Understand</a>' : '')) + '</div>';
    var full = run.querySelector('[data-a=full]'); if (full) full.addEventListener('click', function () { R.setBudget(10); });
    chrome();
  }

  /* ================= review ================= */
  function pageReview() {
    var limit = R.budget() === 2 ? 2 : 10, queue = R.dueList().slice(0, limit), i = 0, results = [];
    setTint('strategy');
    main.innerHTML = '<div class="sess" data-stage="review"><header class="sess-top"><a class="sess-x" href="#/" aria-label="Leave review">×</a><div class="beam">' + queue.map(function () { return '<a><i></i></a>'; }).join('') + '</div><span class="sess-n" id="rv-n"></span></header><div class="sess-body"><div class="sess-main"><div id="rv"></div></div></div></div>';
    var box = document.getElementById('rv');
    document.title = 'Review / Revision OS';
    function summary() {
      box.innerHTML = '<div class="result pass"><span class="lbl">Review complete</span><h2>' + (results.length ? results.length + (results.length === 1 ? ' concept' : ' concepts') + ' refreshed.' : 'Nothing is due.') + '</h2>' +
        (results.length ? '<div class="rows">' + results.map(function (r) { return '<a class="row" href="#/c/' + r.t.id + '">' + st(r.t.id) + '<span class="row-t"><b>' + esc(r.t.title) + '</b></span><span class="row-x">' + (r.g === 'good' ? 'strong' : r.g === 'ok' ? 'holding' : 'slipped') + ' / ' + r.days + 'd</span></a>'; }).join('') + '</div>' : '<p class="dim">Concepts you learn return here after 1, 3, 7, 16 and 35 days.</p>') +
        '<a class="cta" href="#/">Back to today</a>' + (R.dueList().length ? '<button class="link" data-a="more">Keep going</button>' : '') + '</div>';
      var m = box.querySelector('[data-a=more]'); if (m) m.addEventListener('click', pageReview);
      chrome();
    }
    function next() {
      main.querySelectorAll('.beam a').forEach(function (a, k) { a.className = k < i ? 'is-done' : k === i ? 'is-on' : ''; });
      if (i >= queue.length) { document.getElementById('rv-n').textContent = ''; return summary(); }
      document.getElementById('rv-n').innerHTML = (i + 1) + '<i>/' + queue.length + '</i>';
      var stub = queue[i], r = R.rec(stub.id); setTint(trackOf(stub.id));
      R.topic(stub.id).then(function (res) {
        var T = res.t, sib = res.siblings, s = r.s;
        var kind = s <= 1 ? 'Quick recall' : s === 2 ? 'Application' : s === 3 ? 'Harder recall' : 'Mastery check';
        var items = s <= 1 ? [make.card(T, 0)] : s === 2 ? [make.scenario(T, true) || make.sort(T) || make.summary(T, sib), make.card(T, 1)] : s === 3 ? [make.explain(T), make.card(T, 2)] : [make.reverse(T, sib), make.scenario(T, true) || make.match(T) || make.sort(T), make.explain(T)];
        box.innerHTML = '<div class="stage-tag"><b>' + kind + '</b><span>' + esc(T.title) + '</span></div><p class="dim">Learned ' + R.daysBetween(r.last || R.today(), R.today()) + ' days ago' + (R.isRusty(stub.id) ? '. Getting rusty.' : '.') + '</p><section class="stage is-fwd"><div id="run"></div></section>';
        runner(box.querySelector('#run'), items, function (sc) {
          var a = avg(sc), g = a >= 0.85 ? 'good' : a >= 0.5 ? 'ok' : 'miss';
          R.grade(stub.id, g); results.push({ t: stub, g: g, days: R.daysBetween(R.today(), R.rec(stub.id).due) }); i++; next();
        });
      });
    }
    next();
  }

  /* ================= worlds and journeys ================= */
  function pagePath() {
    setTint('ai');
    var S = R.state(), html = '<div class="wrap"><span class="lbl">Worlds</span><h1>' + R.INDEX.domains.length + ' subjects, ' + R.FLAT.length + ' concepts</h1><p class="lede">Each subject is a path. Pick one to make it your focus, and missions will come from there.</p><div class="worlds">';
    R.INDEX.domains.forEach(function (d, i) {
      var t = R.totals(d.topics);
      html += '<a class="world' + (S.focus === d.id ? ' is-focus' : '') + (t.learned === t.total ? ' is-complete' : '') + '" href="#/d/' + d.id + '" style="' + tint(d.track) + '">' + ring(Math.round(100 * t.learned / t.total), 52, t.learned) + '<span class="world-t"><small>' + ('0' + (i + 1)).slice(-2) + (S.focus === d.id ? ' / focus' : '') + '</small><b>' + esc(d.title) + '</b><span class="dim">' + t.learned + ' of ' + t.total + (t.due ? ' / ' + t.due + ' due' : '') + '</span></span></a>';
    });
    main.innerHTML = html + '</div></div>';
    document.title = 'Worlds / Revision OS';
  }
  function pageDomain(id) {
    var d = R.DOMAIN[id]; if (!d) return notFound();
    var t = R.totals(d.topics), S = R.state(), i = R.INDEX.domains.indexOf(d), open = d.topics.filter(function (x) { var s = R.status(x.id); return s === 'active' || s === 'new'; }), cur = open.filter(function (x) { return !R.locked(x.id); })[0] || open[0];
    setTint(d.track);
    main.innerHTML = '<div class="wrap narrow"><a class="back" href="#/path">‹ Worlds</a><header class="world-head">' + ring(Math.round(100 * t.learned / t.total), 72, t.learned + '/' + t.total) + '<div><span class="lbl">Subject ' + (i + 1) + ' of ' + R.INDEX.domains.length + '</span><h1>' + esc(d.title) + '</h1><p class="dim">' + esc(d.blurb) + '</p></div></header>' +
      '<p class="world-acts">' + (cur ? '<a class="cta sm" href="#/c/' + cur.id + '">' + (t.learned ? 'Continue' : 'Start') + '<small>' + esc(cur.title) + '</small></a>' : '') + '<button class="btn ghost" data-a="focus">' + (S.focus === id ? 'Your focus' : 'Make this my focus') + '</button></p>' +
      '<div class="journey">' + d.topics.map(function (x, k) {
        var s = stateOf(x.id);
        return '<a class="jnode' + (cur && x.id === cur.id ? ' is-here' : '') + '" data-s="' + s + '" data-side="' + ['a', 'b', 'c', 'b'][k % 4] + '" href="#/c/' + x.id + '"><span class="jnode-b">' + svg(cur && x.id === cur.id ? 'bolt' : s, 20) + '</span><span class="jnode-t"><b>' + esc(x.title) + '</b><small>' + STATE[s] + ' / ' + x.mins + ' min</small></span></a>';
      }).join('') + '</div></div>';
    main.querySelector('[data-a=focus]').addEventListener('click', function () { S.focus = S.focus === id ? null : id; S.mission = null; R.save(); pageDomain(id); toast(S.focus ? 'Missions now come from ' + d.title : 'Focus cleared'); });
    document.title = d.title + ' / Revision OS';
  }

  /* ================= you ================= */
  function pageYou() {
    setTint('ai');
    var S = R.state(), tot = R.totals(), lvl = R.level(), weak = R.weakList().slice(0, 6), m = R.mission(), N = R.notify, n = S.notify, perm = N.permission();
    var tracks = R.INDEX.tracks.map(function (tr) { var l = []; R.INDEX.domains.forEach(function (d) { if (d.track === tr.id) l = l.concat(d.topics); }); return { tr: tr, t: R.totals(l) }; }).filter(function (x) { return x.t.total; });
    var fc = []; for (var i = 0; i < 7; i++) { var k = R.addDays(R.today(), i); fc.push(R.FLAT.filter(function (t) { var r = S.c[t.id]; return r && r.s && (i === 0 ? r.due <= k : r.due === k); }).length); }
    var maxFc = Math.max.apply(null, fc.concat([1])), chain = [], cur = m;
    while (cur && chain.length < 4) { chain.push(cur); cur = (cur.next || []).map(function (x) { return R.BY_ID[x]; }).filter(function (x) { return x && R.status(x.id) === 'new' && chain.indexOf(x) < 0; })[0]; }
    var deepN = Object.keys(R.deep).length, visN = R.FLAT.filter(function (t) { return R.hasVisual(t.id); }).length;
    function seg(name, val, opts) { return '<div class="seg" role="radiogroup" data-seg="' + name + '">' + opts.map(function (o) { return '<button role="radio" aria-checked="' + (o[0] === val) + '" data-v="' + o[0] + '">' + o[1] + '</button>'; }).join('') + '</div>'; }
    function hourLabel(x) { return (x % 12 || 12) + (x < 12 ? ' am' : ' pm'); }
    var hours = []; for (var hh = 7; hh <= 20; hh++) hours.push('<option value="' + hh + '"' + (n.hour === hh ? ' selected' : '') + '>' + hourLabel(hh) + '</option>');
    main.innerHTML = '<div class="wrap"><header class="you-head">' + ring(lvl.pct, 84, lvl.level) + '<div><span class="lbl">Level ' + lvl.level + ' / ' + S.xp + ' XP</span><h1>' + esc(S.name) + '</h1><p class="dim">' + (lvl.span - lvl.into) + ' XP to level ' + (lvl.level + 1) + ' / ' + R.streak() + ' day streak</p></div></header>' +
      '<section class="pulse-row big"><div><b>' + tot.pct + '%</b><span>knowledge</span></div><div><b>' + tot.learned + '</b><span>learned of ' + tot.total + '</span></div><div><b>' + tot.mastered + '</b><span>mastered</span></div><div><b>' + R.mins(R.weekSeconds()) + '</b><span>min this week</span></div></section>' +
      '<div class="grid2"><section class="card"><span class="lbl">Knowledge coverage</span><div class="sys">' + tracks.map(function (x) { return '<div class="sys-row" style="' + tint(x.tr.id) + '"><span>' + esc(x.tr.label) + '</span>' + meter(x.t.pct, 'tinted') + '<b>' + x.t.pct + '%</b></div>'; }).join('') + '</div><p class="dim sm">Counts how well each concept is holding, not whether you opened it.</p></section>' +
      '<section class="card"><span class="lbl">Recommended next</span>' + (chain.length ? '<div class="chain">' + chain.map(function (t) { return '<a href="#/c/' + t.id + '">' + st(t.id, 13) + esc(t.title) + '</a>'; }).join('<i aria-hidden="true">→</i>') + '</div>' : '<p class="dim">Everything is learned.</p>') +
      '<span class="lbl gap">Needs attention</span>' + (weak.length ? '<div class="rows tight">' + weak.map(function (t) { var r = S.c[t.id]; return row(t, r.lapses ? r.lapses + (r.lapses > 1 ? ' slips' : ' slip') : 'rusty'); }).join('') + '</div>' : '<p class="dim">Nothing weak. Concepts you miss in review show up here.</p>') + '</section></div>' +
      '<div class="grid2"><section class="card"><span class="lbl">Reviews coming up</span><div class="fc">' + fc.map(function (c, i) { return '<div><i style="height:' + Math.round(c / maxFc * 56 + (c ? 4 : 1)) + 'px"></i><b>' + c + '</b><span>' + (i === 0 ? 'today' : new Date(R.addDays(R.today(), i) + 'T12:00').toLocaleDateString(undefined, { weekday: 'short' })) + '</span></div>'; }).join('') + '</div></section>' +
      '<section class="card"><span class="lbl">Activity</span><div class="heat-wrap">' + heat(20) + '</div></section></div>' +
      '<section class="card"><span class="lbl">Nudges</span>' + (perm === 'unsupported' ? '<p class="dim">This browser does not support notifications.</p>' : perm === 'denied' ? '<p class="dim">Notifications are blocked for this app. Allow them in Android settings, then come back.</p>' :
        '<div class="set"><span>Daily nudge<small>The question is the notification. Silent once today is done.</small></span><button class="switch" role="switch" aria-label="Daily nudge" aria-checked="' + !!(n.on && perm === 'granted') + '" data-a="notify"><i></i></button></div>' +
        (n.on && perm === 'granted' ? (R.native ?
          '<div class="set"><span>Learn my time<small>' + (R.usualHour() === null ? 'Not enough history yet. Using the time below.' : 'You usually study around ' + hourLabel(R.usualHour()) + '.') + '</small></span><button class="switch" role="switch" aria-label="Learn my time" aria-checked="' + (n.smart !== false) + '" data-a="smart"><i></i></button></div>' : '') +
          '<div class="set"><span>Nudge at</span><select data-set="hour" aria-label="Nudge time">' + hours.join('') + '</select></div>' +
          (R.native ? '<div class="set"><span>Streak warning at 9 pm<small>Only with a streak of 2 or more and nothing done that day.</small></span><button class="switch" role="switch" aria-label="Streak warning" aria-checked="' + (n.streakSave !== false) + '" data-a="streaksave"><i></i></button></div>' +
          '<div class="set"><span>Full-screen mission<small>' + (n.full && !N.fullAllowed() ? 'Waiting for permission. Tap to open Android settings and allow it.' : 'Takes the whole screen when the phone is locked or idle. A banner when you are using it.') + '</small></span><button class="switch" role="switch" aria-label="Full-screen mission" aria-checked="' + !!(n.full && N.fullAllowed()) + '" data-a="fullscreen"><i></i></button></div>' +
          '<div id="plan"></div>' : '') +
          '<p><button class="btn ghost sm" data-a="notify-test">Send a test nudge</button></p>' : '') +
        '<p class="dim sm">' + (R.native ? 'Two a day at most. After four days away they slow down, and after seven they stop until you open the app. Android can deliver a nudge some minutes late.' : 'Stays silent once today\'s mission is done and nothing is due. The browser decides the exact minute.') + '</p>') + '</section>' +
      '<section class="card"><span class="lbl">Look and feel</span><div class="set"><span>Theme</span>' + seg('theme', S.theme || 'system', [['system', 'System'], ['light', 'Light'], ['dark', 'Dark']]) + '</div><div class="set"><span>Vibration on answers and mastery</span><button class="switch" role="switch" aria-label="Vibration" aria-checked="' + (S.haptics !== false) + '" data-a="haptics"><i></i></button></div><div class="set"><span>Name</span><input id="name" aria-label="Your name" value="' + esc(S.name) + '" maxlength="24"></div></section>' +
      '<section class="card"><span class="lbl">Content depth</span><p class="dim sm">' + deepN + ' concepts have the hand-written deep layer: assumptions, failure modes, trade-offs, expert notes and scenario questions. ' + visN + ' have an interactive visual. The rest use the base content.</p></section>' +
      '<section class="card"><span class="lbl">Your data</span><p class="dim sm">Progress lives in this browser only. Copy a backup before clearing browser data or changing device.</p><p class="acts"><button class="btn ghost sm" data-a="export">Copy backup</button><button class="btn ghost sm" data-a="import">Restore</button><button class="btn ghost sm danger" data-a="reset">Reset progress</button></p><div id="sysbox"></div></section>' +
      '<p class="foot dim sm"><a href="../guide/">Plain reading guide</a> / <a href="../">Original map</a></p></div>';
    document.getElementById('name').addEventListener('change', function (e) { S.name = e.target.value.trim() || 'Pawan'; R.save(); toast('Saved'); });
    var hr = main.querySelector('[data-set=hour]'); if (hr) hr.addEventListener('change', function () { n.hour = +hr.value; R.save(); toast('Saved'); });
    // what is actually queued, so the behaviour is never a mystery
    var planBox = document.getElementById('plan');
    if (planBox && N.plan) N.plan().then(function (list) {
      if (!planBox.isConnected) return;
      planBox.innerHTML = '<span class="lbl gap">Coming up</span>' + (list.length ? '<div class="rows tight">' + list.sort(function (a, b) { return a.at - b.at; }).map(function (x) {
        var d = new Date(x.at);
        return '<div class="row"><span class="row-t"><b>' + esc(x.title) + '</b><small>' + esc(x.label) + (x.fs ? ' / full screen' : '') + (x.q ? ' / answer from the notification' : '') + '</small></span><span class="row-x">' + d.toLocaleDateString(undefined, { weekday: 'short' }) + ' ' + hourLabel(d.getHours()) + '</span></div>';
      }).join('') + '</div>' : '<p class="dim sm">Nothing queued. Today is done.</p>');
    });
    main.addEventListener('click', youClick);
    document.title = 'You / Revision OS';
    return true;
  }
  function youClick(e) {
    var S = R.state(), b = e.target.closest('[data-a]'), sg = e.target.closest('[data-seg] [data-v]'), box = document.getElementById('sysbox');
    if (sg) { S.theme = sg.dataset.v; R.save(); R.applyTheme(); pageYou(); return; }
    if (!b || !box) return;
    var a = b.dataset.a;
    if (a === 'haptics') { S.haptics = S.haptics === false; R.save(); R.haptic('good'); pageYou(); }
    else if (a === 'notify') { if (S.notify.on) { R.notify.disable(); pageYou(); } else R.notify.enable().then(function (r) { toast(r === 'granted' ? 'Reminders on' : r === 'granted-no-schedule' ? 'On. Install the app for daily reminders' : 'Notifications were not allowed'); pageYou(); }); }
    else if (a === 'notify-test') { R.notify.test(); toast(R.native ? 'Coming in 5 seconds. Lock the phone to see it full screen' : 'Sent. Check your notifications'); }
    else if (a === 'smart') { S.notify.smart = S.notify.smart === false; R.save(); pageYou(); }
    else if (a === 'streaksave') { S.notify.streakSave = S.notify.streakSave === false; R.save(); pageYou(); }
    else if (a === 'fullscreen') {
      if (S.notify.full && R.notify.fullAllowed()) S.notify.full = false;
      else { S.notify.full = true; if (!R.notify.fullAllowed()) { R.notify.requestFull(); toast('Allow it for Revision OS, then come back'); } }
      R.save(); pageYou();
    }
    else if (a === 'export') { var text = R.exportState(); box.innerHTML = '<textarea class="ta" rows="4" readonly>' + esc(text) + '</textarea>'; box.querySelector('textarea').select(); if (navigator.clipboard) navigator.clipboard.writeText(text).then(function () { toast('Backup copied'); }, function () {}); }
    else if (a === 'import') box.innerHTML = '<textarea class="ta" rows="4" placeholder="Paste a backup here"></textarea><p><button class="btn sm" data-a="do-import">Restore</button></p>';
    else if (a === 'do-import') { try { R.importState(box.querySelector('textarea').value); R.applyTheme(); toast('Restored'); pageYou(); chrome(); } catch (err) { box.insertAdjacentHTML('beforeend', '<p class="bad">That is not a valid backup.</p>'); } }
    else if (a === 'reset') box.innerHTML = '<p>This clears all progress, streak and XP in this browser. It cannot be undone.</p><p class="acts"><button class="btn sm danger" data-a="do-reset">Yes, reset everything</button><button class="btn ghost sm" data-a="cancel">Cancel</button></p>';
    else if (a === 'do-reset') { R.reset(); toast('Progress reset'); pageYou(); chrome(); }
    else if (a === 'cancel') box.innerHTML = '';
  }

  /* ================= knowledge map ================= */
  var mapView = null;
  function pageMap(focus) {
    setTint('ai');
    if (!focus && window.innerWidth < 600 && !mapView) { var mm = R.mission(); focus = mm && mm.id; }   // small screens open on your neighbourhood
    var GA = 2.39996, pos = {}, edges = '', nodes = '', hubs = '';
    R.INDEX.domains.forEach(function (d) { d.topics.forEach(function (t, i) { var r = 46 + 15 * Math.sqrt(i + 0.6) * 1.9, a = i * GA; pos[t.id] = [d.x * 1.25 + r * Math.cos(a), d.y * 1.25 + r * Math.sin(a)]; }); });
    R.FLAT.forEach(function (t) {
      (t.pre || []).forEach(function (p) { if (pos[p]) edges += '<line data-a="' + p + '" data-b="' + t.id + '" x1="' + pos[p][0].toFixed(0) + '" y1="' + pos[p][1].toFixed(0) + '" x2="' + pos[t.id][0].toFixed(0) + '" y2="' + pos[t.id][1].toFixed(0) + '"/>'; });
      var c = TINT[R.DOMAIN[t.domain].track];
      nodes += '<g class="n" data-id="' + t.id + '" data-s="' + stateOf(t.id) + '" style="--c1:' + c[0] + '" transform="translate(' + pos[t.id][0].toFixed(0) + ' ' + pos[t.id][1].toFixed(0) + ')"><circle r="' + (t.priority === 'high' ? 9 : t.priority === 'low' ? 5 : 7) + '"/><text dy="-1.2em">' + esc(t.title) + '</text></g>';
    });
    R.INDEX.domains.forEach(function (d) {
      var t = R.totals(d.topics), c = TINT[d.track];
      hubs += '<g class="hub" data-d="' + d.id + '" style="--c1:' + c[0] + '" transform="translate(' + (d.x * 1.25) + ' ' + (d.y * 1.25) + ')"><circle r="30"/><circle class="hub-arc" r="30" pathLength="100" stroke-dasharray="' + t.pct + ' 100" transform="rotate(-90)"/><text class="hub-p" y="5">' + t.pct + '%</text><text class="hub-t" y="36" dy="1em">' + esc(d.short || d.title) + '</text></g>';
    });
    main.innerHTML = '<div class="mapwrap"><svg id="map" class="map" role="img" aria-label="Knowledge map of all concepts"><g id="map-e" class="edges">' + edges + '</g><g>' + hubs + '</g><g>' + nodes + '</g></svg>' +
      '<div class="map-top"><span class="lbl">Knowledge map</span><div class="map-key">' + ['new', 'active', 'learned', 'mastered', 'due', 'weak'].map(function (s) { return '<span><i class="st" data-s="' + s + '">' + svg(s, 12) + '</i>' + STATE[s] + '</span>'; }).join('') + '</div></div>' +
      '<div class="map-zoom"><button class="btn sm ghost" data-z="1.3" aria-label="Zoom in">+</button><button class="btn sm ghost" data-z="0.77" aria-label="Zoom out">−</button><button class="btn sm ghost" data-z="0">All</button></div><aside class="map-card" id="map-card" hidden></aside></div>';
    var el = document.getElementById('map'), FULL = { x: 180, y: -60, w: 3160, h: 2120 }, vb = mapView || Object.assign({}, FULL), card = document.getElementById('map-card');
    function apply() {
      el.setAttribute('viewBox', vb.x + ' ' + vb.y + ' ' + vb.w + ' ' + vb.h); el.classList.toggle('is-close', vb.w < 1500); mapView = vb;
      var r = el.getBoundingClientRect(); if (r.width) el.style.setProperty('--k', Math.max(vb.w / r.width, vb.h / r.height).toFixed(3));
    }
    function zoom(f, cx, cy) { var nw = Math.max(380, Math.min(4200, vb.w / f)), k = nw / vb.w; cx = cx == null ? vb.x + vb.w / 2 : cx; cy = cy == null ? vb.y + vb.h / 2 : cy; vb = { x: cx - (cx - vb.x) * k, y: cy - (cy - vb.y) * k, w: nw, h: vb.h * k }; apply(); }
    function pt(x, y) { var r = el.getBoundingClientRect(), sc = Math.max(vb.w / r.width, vb.h / r.height); return [vb.x + vb.w / 2 + (x - r.left - r.width / 2) * sc, vb.y + vb.h / 2 + (y - r.top - r.height / 2) * sc]; }
    function select(id) {
      var t = R.BY_ID[id]; if (!t) return;
      var up = {}, dn = {}; R.before(id).forEach(function (b) { up[b.id] = 1; }); R.after(id).forEach(function (b) { dn[b.id] = 1; });
      el.classList.add('has-sel');
      el.querySelectorAll('.n').forEach(function (n) { var i = n.dataset.id; n.classList.toggle('is-sel', i === id); n.classList.toggle('is-up', !!up[i]); n.classList.toggle('is-dn', !!dn[i]); });
      el.querySelectorAll('#map-e line').forEach(function (l) { var a = l.dataset.a, b = l.dataset.b; l.classList.toggle('is-on', (b === id || up[b]) && (up[a] || a === id) || (a === id && dn[b])); });
      var s = stateOf(id), nUp = Object.keys(up).length, nDn = Object.keys(dn).length;
      card.hidden = false; card.style.cssText = tint(R.DOMAIN[t.domain].track);
      card.innerHTML = '<button class="x" data-a="close" aria-label="Close">×</button><span class="lbl">' + esc(R.DOMAIN[t.domain].title) + '</span><h3>' + esc(t.title) + '</h3><p class="dim">' + esc(t.summary) + '</p><p class="sm"><i class="st" data-s="' + s + '">' + svg(s, 13) + '</i> ' + STATE[s] + ' / ' + t.mins + ' min</p><p class="sm dim">' + (nUp ? nUp + ' before it. ' : 'A starting point. ') + (nDn ? nDn + ' build on it.' : '') + '</p><a class="cta sm" href="#/c/' + id + '">' + (R.status(id) === 'new' ? 'Start' : 'Open') + '</a>';
    }
    var ptrs = {}, drag = null, moved = 0, pinch = 0;
    el.addEventListener('pointerdown', function (e) { ptrs[e.pointerId] = [e.clientX, e.clientY]; drag = { x: e.clientX, y: e.clientY, vx: vb.x, vy: vb.y }; moved = 0; pinch = 0; try { el.setPointerCapture(e.pointerId); } catch (x) {} });
    el.addEventListener('pointermove', function (e) {
      if (!ptrs[e.pointerId]) return; ptrs[e.pointerId] = [e.clientX, e.clientY];
      var ids = Object.keys(ptrs), r = el.getBoundingClientRect(), sc = Math.max(vb.w / r.width, vb.h / r.height);
      if (ids.length === 2) {                               // pinch to zoom
        var a = ptrs[ids[0]], b = ptrs[ids[1]], dist = Math.hypot(a[0] - b[0], a[1] - b[1]);
        if (pinch) { var c = pt((a[0] + b[0]) / 2, (a[1] + b[1]) / 2); zoom(dist / pinch, c[0], c[1]); }
        pinch = dist; moved = 99; drag = null;
      } else if (drag) { if (Math.abs(e.clientX - drag.x) + Math.abs(e.clientY - drag.y) > 6) moved = 7; vb.x = drag.vx - (e.clientX - drag.x) * sc; vb.y = drag.vy - (e.clientY - drag.y) * sc; apply(); }
    });
    el.addEventListener('pointerup', function (e) {
      delete ptrs[e.pointerId]; pinch = 0;
      var was = drag; drag = null; if (!was || moved > 6) return;
      var hit = document.elementFromPoint(e.clientX, e.clientY), n = hit && hit.closest('.n'), hub = hit && hit.closest('.hub');
      if (n) select(n.dataset.id);
      else if (hub) { var d = R.DOMAIN[hub.dataset.d]; vb = { x: d.x * 1.25 - 330, y: d.y * 1.25 - 260, w: 660, h: 520 }; apply(); }
      else { el.classList.remove('has-sel'); card.hidden = true; }
    });
    el.addEventListener('pointercancel', function (e) { delete ptrs[e.pointerId]; drag = null; pinch = 0; });
    el.addEventListener('wheel', function (e) { e.preventDefault(); var p = pt(e.clientX, e.clientY); zoom(e.deltaY < 0 ? 1.15 : 0.87, p[0], p[1]); }, { passive: false });
    main.querySelector('.map-zoom').addEventListener('click', function (e) { var b = e.target.closest('[data-z]'); if (!b) return; if (b.dataset.z === '0') { vb = Object.assign({}, FULL); apply(); } else zoom(+b.dataset.z); });
    card.addEventListener('click', function (e) { if (e.target.closest('[data-a=close]')) { card.hidden = true; el.classList.remove('has-sel'); } });
    if (focus && pos[focus]) { var w = Math.min(760, Math.max(420, window.innerWidth * 1.1)); vb = { x: pos[focus][0] - w / 2, y: pos[focus][1] - w * 0.42, w: w, h: w * 0.84 }; select(focus); }
    apply();
    document.title = 'Knowledge map / Revision OS';
  }

  /* ================= hacker mode ================= */
  function pageHackList() {
    setTint('production');
    var S = R.state();
    main.innerHTML = '<div class="wrap"><span class="lbl">' + svg('bolt', 12) + ' Hacker mode</span><h1>Investigations</h1><p class="lede">Something broke. You get the evidence, not the answer. Work out what is going on and decide what to do.</p><div class="cases">' +
      R.challenges.map(function (c) { var r = S.ch[c.id]; return '<a class="case' + (r ? ' is-solved' : '') + '" href="#/hack/' + c.id + '"><span class="lbl">' + esc(c.kind) + (r ? ' / solved ' + r.score + ' of ' + c.steps.length : '') + '</span><h3>' + esc(c.title) + '</h3><p class="dim">' + esc(c.brief) + '</p><span class="sm dim">' + c.mins + ' min ' + pips(c.level + 1, 5) + ' ' + c.evidence.length + ' pieces of evidence</span></a>'; }).join('') + '</div></div>';
    document.title = 'Hacker mode / Revision OS';
  }
  function pageHack(id) {
    var c = R.challenges.filter(function (x) { return x.id === id; })[0]; if (!c) return notFound();
    setTint('production');
    var step = 0, score = 0;
    main.innerHTML = '<div class="wrap"><a class="back" href="#/hack">‹ Investigations</a><span class="lbl">' + svg('bolt', 12) + ' ' + esc(c.kind) + '</span><h1>' + esc(c.title) + '</h1><p class="lede">' + esc(c.brief) + '</p>' +
      '<div class="case-grid"><section class="card ev"><span class="lbl">Evidence</span><div class="tabs" role="tablist">' + c.evidence.map(function (e, i) { return '<button role="tab" data-t="' + i + '" aria-selected="' + (i === 0) + '">' + esc(e[0]) + '</button>'; }).join('') + '</div><div id="ev"></div></section><section class="card" id="hk"></section></div></div>';
    var ev = document.getElementById('ev'), hk = document.getElementById('hk');
    function showEv(i) { ev.innerHTML = pre(c.evidence[i][1]); main.querySelectorAll('.tabs button').forEach(function (b, j) { b.setAttribute('aria-selected', String(j === i)); }); }
    main.querySelector('.tabs').addEventListener('click', function (e) { var b = e.target.closest('[data-t]'); if (b) showEv(+b.dataset.t); });
    function next() {
      if (step >= c.steps.length) {
        var S = R.state(), first = !S.ch[c.id];
        S.ch[c.id] = { score: Math.max(score, (S.ch[c.id] || {}).score || 0), at: R.today() }; if (first) R.award(60); R.save(); R.haptic('done');
        hk.innerHTML = '<span class="lbl">Debrief / ' + score + ' of ' + c.steps.length + ' calls right</span>' + prose(c.debrief) + '<span class="lbl gap">Concepts behind this case</span>' + chips(c.topics) + '<a class="cta" href="#/hack">More investigations</a><a class="link" href="#/">Back to today</a>';
        return chrome();
      }
      var s = c.steps[step];
      hk.innerHTML = '<div class="qhead"><span class="lbl">Decision ' + (step + 1) + ' of ' + c.steps.length + '</span><span class="segs">' + c.steps.map(function (_, k) { return '<i class="' + (k < step ? 'on' : k === step ? 'cur' : '') + '"></i>'; }).join('') + '</span></div><div class="qbody"></div><div class="qfoot"></div>';
      qMcq(hk.querySelector('.qbody'), esc(s.q), R.shuffle(s.options.map(function (o) { return { t: o[0], ok: o[1], why: o[2] }; })), function (ok) {
        score += ok ? 1 : 0; step++;
        hk.querySelector('.qfoot').innerHTML = '<button class="btn wide">' + (step >= c.steps.length ? 'Read the debrief' : 'Next decision') + '</button>';
        hk.querySelector('.qfoot .btn').addEventListener('click', next);
      }, true);
    }
    showEv(0); next();
    document.title = c.title + ' / Revision OS';
  }

  /* ================= command palette ================= */
  var pal = document.getElementById('pal'), palIn = document.getElementById('pal-in'), palList = document.getElementById('pal-list'), palSel = 0, palItems = [];
  function withBudget(n) { return function () { R.setBudget(n); if (location.hash === '#/' || !location.hash) route(); else location.hash = '#/'; }; }
  var COMMANDS = [
    ['Continue learning', 'Resume today\'s mission', function () { var m = R.mission(); location.hash = m ? '#/c/' + m.id : '#/'; }],
    ['Learn something new', 'The next concept you are ready for', function () { var t = R.nextNew(); if (t) location.hash = '#/c/' + t.id; }],
    ['Surprise me', 'A random concept', function () { location.hash = '#/c/' + R.random(false).id; }],
    ['I have 2 minutes', 'Quick recall', withBudget(2)], ['I have 5 minutes', 'Micro lesson', withBudget(5)], ['I have 10 minutes', 'Daily mission', withBudget(10)], ['I have 20 minutes', 'Deep session', withBudget(20)], ['I have 45 minutes', 'Expert session', withBudget(45)],
    ['Start review', 'Concepts that are due', function () { location.hash = '#/review'; }],
    ['Review weak topics', 'Concepts that slipped or went rusty', function () { open('weak'); }],
    ['Show knowledge map', 'Every concept and how they connect', function () { location.hash = '#/map'; }],
    ['Open worlds', 'All subjects and their paths', function () { location.hash = '#/path'; }],
    ['Show progress', 'Coverage, weak areas, settings', function () { location.hash = '#/you'; }],
    ['Enter hacker mode', 'Investigations', function () { location.hash = '#/hack'; }],
    ['Today', 'Back to the start', function () { location.hash = '#/'; }],
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
      res.items.slice(0, 40).forEach(function (t) { html += '<button class="pal-i" data-i="' + palItems.length + '">' + st(t.id, 14) + '<b>' + esc(t.title) + '</b><span>' + esc(R.DOMAIN[t.domain].title) + '</span></button>'; palItems.push(function () { location.hash = '#/c/' + t.id; }); });
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
    var typing = /input|textarea|select/i.test((document.activeElement || {}).tagName || '');
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); pal.hidden ? open() : close(); }
    else if (e.key === 'Escape' && !pal.hidden) close();
    else if (e.key === '/' && !typing) { e.preventDefault(); open(); }
  });

  /* ================= routing and boot ================= */
  function notFound() { main.innerHTML = '<div class="wrap narrow"><h1>Not found</h1><p>That screen does not exist.</p><a class="cta sm" href="#/">Back to today</a></div>'; }
  var token = 0;
  function route() {
    var p = (location.hash || '#/').replace(/^#\/?/, '').split('/'), mine = ++token, job;
    main.removeEventListener('click', youClick);
    if (p[0] === 'go') { var m = R.mission(); return location.replace(m ? '#/c/' + m.id : '#/'); }             // app shortcuts
    if (p[0] === 'surprise') return location.replace('#/c/' + R.random(false).id);
    if (p[0] === 'progress') return location.replace('#/you');
    document.body.dataset.view = p[0] || 'home'; delete document.body.dataset.depth;
    try {
      if (!p[0]) job = pageHome();
      else if (p[0] === 'c') job = pageConcept(decodeURIComponent(p[1] || ''), p[2]);
      else if (p[0] === 'review') job = pageReview();
      else if (p[0] === 'path') job = pagePath();
      else if (p[0] === 'd') job = pageDomain(p[1]);
      else if (p[0] === 'you') job = pageYou();
      else if (p[0] === 'map') job = pageMap(p[1]);
      else if (p[0] === 'hack') job = p[1] ? pageHack(p[1]) : pageHackList();
      else job = notFound();
    } catch (err) { job = Promise.reject(err); }
    Promise.resolve(job).then(function () { if (mine === token) { chrome(); window.scrollTo(0, 0); main.focus({ preventScroll: true }); } })
      .catch(function (err) { if (mine === token) main.innerHTML = '<div class="wrap narrow"><h1>Could not load this screen</h1><p>' + esc(err.message || err) + '</p><p class="dim">If you are offline, this concept has not been saved to the device yet.</p><a class="cta sm" href="#/">Back to today</a><button class="link" onclick="location.reload()">Try again</button></div>'; });
  }
  window.addEventListener('hashchange', route);
  setInterval(function () { var v = document.body.dataset.view; if (document.visibilityState === 'visible' && (v === 'c' || v === 'review' || v === 'hack')) R.addTime(15); }, 15000);
  window.addEventListener('offline', function () { toast('Offline. Saved content still works'); });
  R.boot().then(function () {
    R.applyTheme(); route(); R.notify.mirror();
    if ('serviceWorker' in navigator && !R.native) navigator.serviceWorker.register('sw.js').then(function () {
      // once idle, save every subject to the device so the whole app works offline
      navigator.serviceWorker.ready.then(function () { setTimeout(function () { R.INDEX.domains.forEach(function (d, i) { setTimeout(function () { fetch('../guide/data/d/' + d.id + '.json').catch(function () {}); }, 300 * i); }); }, 2500); });
    }).catch(function () {});
  }).catch(function (err) {
    main.innerHTML = '<div class="wrap narrow"><h1>Could not start</h1><p>' + esc(err.message || err) + '</p><p class="dim">Check your connection and reload. After the first load the app works offline.</p><button class="cta sm" onclick="location.reload()">Reload</button></div>';
  });
})();
