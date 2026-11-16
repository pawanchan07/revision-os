/* Revision OS core: data, saved state, review scheduling, XP, activity, search.
   Plain script, no build step. Everything hangs off one global, R. */
var R = (function () {
  'use strict';
  var KEY = 'revos:v2';
  var DATA = '../guide/data/';
  var INTERVALS = [0, 1, 3, 7, 16, 35, 75];           // days until the next review, by stage
  var STAGES = ['explore', 'understand', 'visualize', 'test', 'connect', 'apply', 'recall', 'master'];
  var R = { STAGES: STAGES, INTERVALS: INTERVALS, FLAT: [], BY_ID: {}, DOMAIN: {}, INDEX: null, visuals: {}, flows: {}, challenges: [] };

  /* ---------- dates ---------- */
  function key(d) { return d.getFullYear() + '-' + ('0' + (d.getMonth() + 1)).slice(-2) + '-' + ('0' + d.getDate()).slice(-2); }
  R.today = function () { return key(new Date()); };
  R.addDays = function (k, n) { var p = k.split('-'); var d = new Date(+p[0], +p[1] - 1, +p[2] + n); return key(d); };
  R.daysBetween = function (a, b) { var x = a.split('-'), y = b.split('-'); return Math.round((new Date(+y[0], +y[1] - 1, +y[2]) - new Date(+x[0], +x[1] - 1, +x[2])) / 864e5); };

  /* ---------- state ---------- */
  var S;
  function fresh() { return { name: 'Pawan', theme: 'system', haptics: true, budget: 10, sess: null, notify: { on: false, hour: 19, quietFrom: 22, quietTo: 7, smart: true, streakSave: true, full: false }, focus: null, depth: 2, c: {}, log: {}, xp: 0, mission: null, ch: {}, notes: {} }; }
  function loadState() {
    try { S = Object.assign(fresh(), JSON.parse(localStorage.getItem(KEY) || '{}')); } catch (e) { S = fresh(); }
    if (!S.migrated) {                                // bring over statuses from the map and the guide
      try {
        var old = JSON.parse(localStorage.getItem('prep-map:v1') || '{}');
        Object.keys(old.status || {}).forEach(function (id) {
          var st = old.status[id];
          if (S.c[id]) return;
          if (st === 'completed' || st === 'mastered') S.c[id] = { s: st === 'mastered' ? 3 : 1, due: R.today(), last: R.today(), lapses: 0, steps: {} };
          else S.c[id] = { s: 0, steps: { explore: 1 } };
        });
        Object.keys(old.notes || {}).forEach(function (id) { if (!S.notes[id]) S.notes[id] = old.notes[id]; });
      } catch (e) {}
      S.migrated = 1;
    }
  }
  var saveTimer;
  R.save = function () {
    clearTimeout(saveTimer);
    saveTimer = setTimeout(function () { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) {} if (R.onSave) R.onSave(); }, 120);
  };
  R.state = function () { return S; };
  R.rec = function (id) { return S.c[id]; };
  R.exportState = function () { return JSON.stringify(S); };
  R.importState = function (text) { var j = JSON.parse(text); if (!j || typeof j.c !== 'object') throw new Error('Not a Revision OS backup'); S = Object.assign(fresh(), j); R.save(); };
  R.reset = function () { S = fresh(); S.migrated = 1; R.save(); };

  /* ---------- concept state ---------- */
  // new | active | learned | solid | mastered, plus due / rusty flags
  R.status = function (id) {
    var r = S.c[id];
    if (!r) return 'new';
    if (!r.s) return 'active';
    return r.s >= 5 ? 'mastered' : r.s >= 3 ? 'solid' : 'learned';
  };
  R.isDue = function (id) { var r = S.c[id]; return !!(r && r.s && r.due <= R.today()); };
  R.isRusty = function (id) { var r = S.c[id]; return !!(r && r.s && R.daysBetween(r.due, R.today()) > 2); };
  R.strength = function (id) {
    var r = S.c[id]; if (!r) return 0;
    if (!r.s) return 0.1;
    var base = [0, 0.4, 0.55, 0.7, 0.85, 1, 1][r.s];
    return R.isRusty(id) ? base * 0.7 : base;
  };
  R.stepDone = function (id, step) { var r = S.c[id]; return !!(r && r.steps && r.steps[step]); };
  R.markStep = function (id, step) {
    var r = S.c[id] || (S.c[id] = { s: 0, steps: {} });
    r.steps = r.steps || {};
    if (!r.steps[step]) { r.steps[step] = 1; R.award(5); }
    R.save();
  };
  R.learn = function (id) {                           // passed the mastery check for the first time
    var r = S.c[id] || (S.c[id] = { steps: {} });
    var first = !r.s;
    if (first) { r.s = 1; r.lapses = r.lapses || 0; r.first = Date.now(); R.award(40); R.bump('learned'); }
    r.last = R.today(); r.due = R.addDays(R.today(), INTERVALS[r.s]);
    mirror(id); R.save();
    return first;
  };
  R.grade = function (id, g) {                        // g: good | ok | miss
    var r = S.c[id]; if (!r || !r.s) return;
    if (g === 'good') r.s = Math.min(6, r.s + 1);
    else if (g === 'miss') { r.s = Math.max(1, r.s - 1); r.lapses = (r.lapses || 0) + 1; }
    r.grade = g; r.last = R.today();
    r.due = R.addDays(R.today(), g === 'miss' ? 1 : INTERVALS[r.s]);
    R.award(g === 'miss' ? 5 : 15); R.bump('reviewed');
    mirror(id); R.save();
  };
  function mirror(id) {                               // keep the map and the guide in step
    try {
      var old = JSON.parse(localStorage.getItem('prep-map:v1') || '{}'); old.status = old.status || {};
      old.status[id] = S.c[id].s >= 5 ? 'mastered' : 'completed';
      localStorage.setItem('prep-map:v1', JSON.stringify(old));
    } catch (e) {}
  }

  /* ---------- xp, level, activity ---------- */
  function day() { var k = R.today(); return S.log[k] || (S.log[k] = { xp: 0, sec: 0, learned: 0, reviewed: 0 }); }
  R.award = function (n) {
    S.xp += n; day().xp += n;
    var h = new Date().getHours(); S.hours = S.hours || {}; S.hours[h] = (S.hours[h] || 0) + 1;      // when you tend to study
    R.save(); if (R.onXp) R.onXp(n);
  };
  // The hour you most often study at, once there is enough history to say. Null before that.
  R.usualHour = function () {
    var hs = S.hours || {}, best = null, total = 0;
    Object.keys(hs).forEach(function (h) { total += hs[h]; if (best === null || hs[h] > hs[best]) best = h; });
    return total >= 40 && best !== null ? +best : null;
  };
  R.bump = function (k) { day()[k]++; };
  R.addTime = function (sec) { day().sec += sec; R.save(); };
  R.level = function () {
    var lvl = Math.floor(Math.sqrt(S.xp / 50)) + 1, lo = 50 * (lvl - 1) * (lvl - 1), hi = 50 * lvl * lvl;
    return { level: lvl, into: S.xp - lo, span: hi - lo, pct: Math.round(100 * (S.xp - lo) / (hi - lo)) };
  };
  R.streak = function () {
    var k = R.today(), n = 0;
    if (!(S.log[k] && S.log[k].xp)) k = R.addDays(k, -1);
    while (S.log[k] && S.log[k].xp) { n++; k = R.addDays(k, -1); }
    return n;
  };
  R.weekSeconds = function () {
    var k = R.today(), t = 0;
    for (var i = 0; i < 7; i++) { if (S.log[k]) t += S.log[k].sec || 0; k = R.addDays(k, -1); }
    return t;
  };

  /* ---------- numbers for the dashboard ---------- */
  R.totals = function (list) {
    list = list || R.FLAT;
    var o = { total: list.length, learned: 0, mastered: 0, active: 0, due: 0, rusty: 0, strength: 0 };
    list.forEach(function (t) {
      var st = R.status(t.id);
      if (st !== 'new' && st !== 'active') o.learned++;
      if (st === 'mastered') o.mastered++;
      if (st === 'active') o.active++;
      if (R.isDue(t.id)) o.due++;
      if (R.isRusty(t.id)) o.rusty++;
      o.strength += R.strength(t.id);
    });
    o.pct = o.total ? Math.round(100 * o.strength / o.total) : 0;
    o.fine = o.total ? (100 * o.strength / o.total).toFixed(1) : '0';      // one decimal, for showing small gains
    return o;
  };
  R.dueList = function () {
    return R.FLAT.filter(function (t) { return R.isDue(t.id); }).sort(function (a, b) { return S.c[a.id].due < S.c[b.id].due ? -1 : 1; });
  };
  R.weakList = function () {
    return R.FLAT.filter(function (t) { var r = S.c[t.id]; return r && r.s && (r.lapses || r.grade === 'miss' || R.isRusty(t.id)); })
      .sort(function (a, b) { return (S.c[b.id].lapses || 0) - (S.c[a.id].lapses || 0); });
  };
  R.mission = function () {
    var m = S.mission, k = R.today();
    var cur = R.currentSubject(), moved = m && cur && R.BY_ID[m.id] && R.BY_ID[m.id].domain !== cur && (S.int[cur].at > (m.at || 0)) && R.status(m.id) === 'new' && !m.pinned;
    if (m && m.date === k && R.BY_ID[m.id] && !moved) return R.BY_ID[m.id];
    var p = R.pick();
    if (p) { S.mission = { date: k, id: p.t.id, why: p.why, at: Date.now() }; R.save(); }
    return p && p.t;
  };
  R.missionDone = function () { var m = S.mission; return !!(m && m.date === R.today() && S.c[m.id] && S.c[m.id].s); };
  R.random = function (onlyNew) {
    var pool = R.FLAT.filter(function (t) { return t.hook && (!onlyNew || R.status(t.id) === 'new'); });
    if (!pool.length) pool = R.FLAT;
    return pool[Math.floor(Math.random() * pool.length)];
  };
  // every concept that has to come before this one, nearest first
  R.before = function (id) {
    var seen = {}, out = [], q = [id];
    while (q.length) { var cur = R.BY_ID[q.shift()]; if (!cur) continue;
      (cur.pre || []).forEach(function (p) { if (!seen[p] && R.BY_ID[p]) { seen[p] = 1; out.push(R.BY_ID[p]); q.push(p); } }); }
    return out;
  };
  R.after = function (id) { return R.FLAT.filter(function (t) { return (t.pre || []).indexOf(id) > -1 || ((R.BY_ID[id] || {}).next || []).indexOf(t.id) > -1; }); };


  /* ---------- choosing what to learn ---------- */
  // Interest: which subjects you have been opening lately. Nothing here is a commitment.
  // Open a concept anywhere and the next missions and nudges lean that way.
  R.touch = function (domain) {
    S.int = S.int || {};
    var x = S.int[domain] || (S.int[domain] = { n: 0, at: 0 });
    x.n = Math.min(12, x.n + 1); x.at = Date.now();
    R.save();
  };
  R.interest = function (domain) {
    var x = (S.int || {})[domain]; if (!x) return 0;
    var days = (Date.now() - x.at) / 864e5;
    return Math.min(1, x.n / 3) * Math.exp(-days / 6);                 // fades over about two weeks
  };
  R.currentSubject = function () {
    var best = null, at = 0; Object.keys(S.int || {}).forEach(function (d) { if (S.int[d].at > at && R.DOMAIN[d]) { at = S.int[d].at; best = d; } });
    return best;
  };
  R.lastLearned = function () {
    var best = null;
    Object.keys(S.c).forEach(function (id) { var r = S.c[id]; if (r.s && r.first && R.BY_ID[id] && (!best || r.first > S.c[best].first)) best = id; });
    return best ? R.BY_ID[best] : null;
  };
  function has(id) { return !!(S.c[id] && S.c[id].s); }
  // Locked is a hint, never a wall: something it builds on is not learned yet.
  R.locked = function (id) { var t = R.BY_ID[id]; return R.status(id) === 'new' && (t.pre || []).some(function (p) { return R.BY_ID[p] && !has(p); }); };
  // Scores every unlearned concept on readiness, focus, momentum, importance and difficulty.
  R.pick = function (skip) {
    var active = R.FLAT.filter(function (t) { return R.status(t.id) === 'active' && t.id !== skip; });
    if (active.length) return { t: active[0], why: 'You started this one. Finish it.' };
    var last = R.lastLearned(), cur = R.currentSubject(), best = null, bs = -1e9, why = '';
    R.FLAT.forEach(function (t) {
      if (R.status(t.id) !== 'new' || t.id === skip) return;
      var pre = (t.pre || []).filter(function (p) { return R.BY_ID[p]; }), known = pre.filter(has).length, missing = pre.length - known;
      var follows = last && ((last.next || []).indexOf(t.id) > -1 || pre.indexOf(last.id) > -1);
      var here = t.domain === cur, into = R.interest(t.domain);
      // where you are now counts most, then anything you have shown interest in, then what flows on
      var sc = (here ? 9 : 0) + into * 6 + (t.domain === S.focus ? 5 : 0) + (follows ? 4 : 0) + known * 2 - missing * (here ? 2 : 5) + (t.priority === 'high' ? 1.5 : 0) - t.tier * 0.6 - t.n * 0.0005;
      if (sc > bs) {
        bs = sc; best = t;
        why = follows ? 'Follows directly from ' + last.title + '.' : here ? 'More from ' + R.DOMAIN[t.domain].title + ', where you have been lately.' : t.domain === S.focus ? 'Next in your focus, ' + R.DOMAIN[t.domain].title + '.' : into > 0.2 ? 'Back to ' + R.DOMAIN[t.domain].title + '.' : known ? 'Builds on ' + known + (known === 1 ? ' thing' : ' things') + ' you already know.' : 'A clean starting point. Nothing needed first.';
      }
    });
    return best ? { t: best, why: why } : null;
  };
  R.nextNew = function (skip) { var p = R.pick(skip); return p ? p.t : null; };

  /* ---------- time budgets ---------- */
  R.BUDGETS = [[2, 'Quick recall'], [5, 'Micro lesson'], [10, 'Daily mission'], [20, 'Deep session'], [45, 'Expert session']];
  R.budget = function () { return S.budget || 10; };
  R.setBudget = function (n) { S.budget = n; R.save(); };
  R.planStages = function () { return R.budget() <= 5 ? ['explore', 'understand', 'test'] : STAGES; };
  R.depthTarget = function () { var b = R.budget(); return b <= 5 ? 1 : b <= 10 ? 2 : b <= 20 ? 3 : 4; };

  /* ---------- session memory, haptics, theme ---------- */
  R.sess = function (patch) { if (patch === null) S.sess = null; else if (patch) S.sess = Object.assign(S.sess || {}, patch, { at: Date.now() }); R.save(); return S.sess; };
  var BUZZ = { tick: 8, good: [12, 40, 18], bad: 30, done: [14, 50, 14, 50, 40] };
  R.haptic = function (k) { try { if (S.haptics !== false && navigator.vibrate) navigator.vibrate(BUZZ[k] || 8); } catch (e) {} };
  R.applyTheme = function () {
    var t = S.theme || 'system', el = document.documentElement;
    if (t === 'system') el.removeAttribute('data-theme'); else el.setAttribute('data-theme', t);
    try { localStorage.setItem('revos:theme', t); } catch (e) {}
  };

  /* ---------- search as a navigator ---------- */
  function find(name) {
    name = name.trim().toLowerCase(); if (!name) return null;
    var best = null, score = 0;
    R.FLAT.forEach(function (t) {
      var title = t.title.toLowerCase(), s = title === name ? 9 : title.indexOf(name) === 0 ? 6 : title.indexOf(name) > -1 ? 4 : t.id.replace(/-/g, ' ').indexOf(name) > -1 ? 3 : 0;
      if (s > score) { score = s; best = t; }
    });
    return best;
  }
  function text(q) {
    var words = q.toLowerCase().split(/\s+/).filter(Boolean), hits = [];
    R.FLAT.forEach(function (t) {
      var title = t.title.toLowerCase(), rest = (t.summary + ' ' + t.terms + ' ' + R.DOMAIN[t.domain].title + ' ' + R.DOMAIN[t.domain].track).toLowerCase(), sc = 0;
      for (var i = 0; i < words.length; i++) {
        var w = words[i];
        if (title.indexOf(w) === 0) sc += 6; else if (title.indexOf(w) > -1) sc += 4; else if (rest.indexOf(w) > -1) sc += 1; else return;
      }
      hits.push([sc, t]);
    });
    return hits.sort(function (a, b) { return b[0] - a[0] || a[1].n - b[1].n; }).map(function (h) { return h[1]; });
  }
  // Returns { label, items }. Understands a few plain-English shapes before falling back to text search.
  R.query = function (q) {
    var s = q.trim().toLowerCase().replace(/[?.!]+$/, ''), m, t;
    if (!s) return { label: '', items: [] };
    if ((m = /(?:before|prerequisites? (?:for|of)|need(?:ed)? (?:for|before)|know before)\s+(.+)$/.exec(s)) && (t = find(m[1])))
      return { label: 'What comes before ' + t.title, items: R.before(t.id) };
    if ((m = /(?:after|next after|leads? from|follows?)\s+(.+)$/.exec(s)) && (t = find(m[1])))
      return { label: 'Where ' + t.title + ' leads', items: R.after(t.id) };
    if ((m = /(?:related to|about|connected to|like)\s+(.+)$/.exec(s))) {
      t = find(m[1]);
      var rel = t ? [t].concat((t.rel || []).concat(t.next || [], t.pre || []).map(function (i) { return R.BY_ID[i]; }).filter(Boolean)) : [];
      var more = text(m[1]).filter(function (x) { return rel.indexOf(x) < 0; });
      return { label: 'Related to ' + m[1], items: rel.concat(more) };
    }
    if (/not mastered|haven'?t mastered|unmastered/.test(s)) return { label: 'Not mastered yet', items: R.FLAT.filter(function (x) { return R.status(x.id) !== 'mastered'; }) };
    if (/not learned|haven'?t learned|unlearned|not started|^new$/.test(s)) return { label: 'Not learned yet', items: R.FLAT.filter(function (x) { var st = R.status(x.id); return st === 'new' || st === 'active'; }) };
    if (/^mastered$|what i know|i have mastered/.test(s)) return { label: 'Mastered', items: R.FLAT.filter(function (x) { return R.status(x.id) === 'mastered'; }) };
    if (/weak|rusty|struggl|forgot/.test(s)) return { label: 'Weak and rusty', items: R.weakList() };
    if (/^due|to review|review today/.test(s)) return { label: 'Due for review', items: R.dueList() };
    if (/in progress|started|unfinished/.test(s)) return { label: 'In progress', items: R.FLAT.filter(function (x) { return R.status(x.id) === 'active'; }) };
    return { label: '', items: text(s) };
  };

  /* ---------- loading ---------- */
  var cache = {};
  R.load = function (file) {
    if (cache[file]) return Promise.resolve(cache[file]);
    return fetch(DATA + file).then(function (r) { if (!r.ok) throw new Error('Could not load ' + file + ' (' + r.status + ')'); return r.json(); })
      .then(function (j) { cache[file] = j; return j; });
  };
  R.topic = function (id) {                           // full concept plus its subject siblings
    var stub = R.BY_ID[id];
    if (!stub) return Promise.reject(new Error('No concept called ' + id));
    return R.load('d/' + stub.domain + '.json').then(function (list) {
      return { t: list.filter(function (x) { return x.id === id; })[0], siblings: list };
    });
  };
  R.boot = function () {
    loadState();
    return R.load('index.json').then(function (idx) {
      R.INDEX = idx;
      idx.domains.forEach(function (d) {
        R.DOMAIN[d.id] = d;
        d.topics.forEach(function (t) { t.domain = d.id; t.n = R.FLAT.length; R.FLAT.push(t); R.BY_ID[t.id] = t; });
      });
      R.CMP = {}; idx.comparisons.forEach(function (c) { R.CMP[c.id] = c.title; });
    });
  };

  /* ---------- text helpers ---------- */
  R.esc = function (s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); };
  R.inline = function (text) {
    var s = R.esc(text);
    s = s.replace(/`([^`]+)`/g, '<code>$1</code>').replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
      .replace(/(^|[\s(])\*([^*\n]+)\*/g, '$1<em>$2</em>')
      .replace(/\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');
    return s;
  };
  R.prose = function (text) {
    var out = [];
    String(text == null ? '' : text).split(/\n{2,}/).forEach(function (block) {
      var buf = [], list = null;
      function fp() { if (buf.length) { out.push('<p>' + buf.map(R.inline).join('<br>') + '</p>'); buf = []; } }
      function fl() { if (list) { out.push('<' + list.tag + '>' + list.items.map(function (i) { return '<li>' + R.inline(i) + '</li>'; }).join('') + '</' + list.tag + '>'); list = null; } }
      block.trim().split('\n').forEach(function (line) {
        var b = /^\s*[-•]\s+(.*)$/.exec(line), n = /^\s*\d+[.)]\s+(.*)$/.exec(line);
        if (b || n) { var tag = b ? 'ul' : 'ol'; fp(); if (list && list.tag !== tag) fl(); if (!list) list = { tag: tag, items: [] }; list.items.push((b || n)[1]); }
        else if (list && /^\s{2,}\S/.test(line)) list.items[list.items.length - 1] += ' ' + line.trim();
        else { fl(); if (line.trim()) buf.push(line.trim()); }
      });
      fp(); fl();
    });
    return out.join('');
  };
  R.pre = function (text) { return '<pre>' + R.esc(String(text).replace(/^\n+|\s+$/g, '')) + '</pre>'; };
  R.shuffle = function (a) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)), x = a[i]; a[i] = a[j]; a[j] = x; } return a; };
  R.mins = function (sec) { return Math.round(sec / 60); };
  return R;
})();
