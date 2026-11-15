/* Revision Guide. A plain reader over the same content as the map.
   No framework, no build step. Data comes from ./data (see build.mjs). */
(function () {
  'use strict';

  var KEY = 'prep-map:v1';          // shared with the map, so progress carries across both
  var LAST = 'guide:last';
  var main = document.getElementById('main');
  var side = document.getElementById('side');
  var scrim = document.getElementById('scrim');
  var menuBtn = document.getElementById('menu-btn');

  var INDEX = null;                 // { domains: [{id,title,blurb,topics:[...]}], comparisons }
  var FLAT = [];                    // every topic stub in reading order
  var BY_ID = {};                   // topic id -> stub (with .domain, .n)
  var DOMAIN = {};                  // domain id -> domain
  var CMP = {};                     // comparison id -> title
  var cache = {};                   // url -> parsed json
  var openDomains = {};

  var KIND = { docs: 'Docs', tutorial: 'Tutorial', video: 'Video', course: 'Course', paper: 'Paper',
    repo: 'Code', interactive: 'Hands-on', reference: 'Reference', article: 'Article' };
  var STATUS = [['not-started', 'Not started'], ['learning', 'Learning'], ['review', 'Revise again'], ['completed', 'Done']];

  /* ---------------- storage ---------------- */
  function read() {
    try { return JSON.parse(localStorage.getItem(KEY) || '{}') || {}; } catch (e) { return {}; }
  }
  function write(fn) {
    var s = read(); fn(s);
    try { localStorage.setItem(KEY, JSON.stringify(s)); } catch (e) {}
  }
  function statusOf(id) { var s = read().status || {}; return s[id] || 'not-started'; }
  function isDone(st) { return st === 'completed' || st === 'mastered'; }
  function setStatus(id, st) {
    write(function (s) {
      s.status = s.status || {};
      if (st === 'not-started') delete s.status[id]; else s.status[id] = st;
    });
  }
  function noteOf(id) { var n = read().notes || {}; return n[id] || ''; }
  function setNote(id, text) {
    write(function (s) { s.notes = s.notes || {}; if (text.trim()) s.notes[id] = text; else delete s.notes[id]; });
  }

  /* ---------------- text ---------------- */
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function inline(text) {
    var s = esc(text);
    s = s.replace(/`([^`]+)`/g, '<code>$1</code>');
    s = s.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
    s = s.replace(/(^|[\s(])\*([^*\n]+)\*/g, '$1<em>$2</em>');
    s = s.replace(/\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');
    return s;
  }
  // Paragraphs, with runs of "- item" or "1. item" lines turned into real lists.
  function prose(text) {
    var out = [];
    String(text == null ? '' : text).split(/\n{2,}/).forEach(function (block) {
      var lines = block.trim().split('\n'), buf = [], list = null;
      function flushP() { if (buf.length) { out.push('<p>' + buf.map(inline).join('<br>') + '</p>'); buf = []; } }
      function flushL() { if (list) { out.push('<' + list.tag + '>' + list.items.map(function (i) { return '<li>' + inline(i) + '</li>'; }).join('') + '</' + list.tag + '>'); list = null; } }
      lines.forEach(function (line) {
        var b = /^\s*[-•]\s+(.*)$/.exec(line), n = /^\s*\d+[.)]\s+(.*)$/.exec(line);
        if (b || n) {
          var tag = b ? 'ul' : 'ol';
          flushP();
          if (list && list.tag !== tag) flushL();
          if (!list) list = { tag: tag, items: [] };
          list.items.push((b || n)[1]);
        } else if (list && /^\s{2,}\S/.test(line)) {
          list.items[list.items.length - 1] += ' ' + line.trim();
        } else { flushL(); if (line.trim()) buf.push(line.trim()); }
      });
      flushP(); flushL();
    });
    return out.join('');
  }
  function pre(text) { return '<pre>' + esc(String(text).replace(/^\n+|\s+$/g, '')) + '</pre>'; }
  function list(items) {
    return items && items.length ? '<ul>' + items.map(function (i) { return '<li>' + inline(i) + '</li>'; }).join('') + '</ul>' : '';
  }
  function host(url) { try { return new URL(url).hostname.replace(/^www\./, ''); } catch (e) { return ''; } }

  /* ---------------- data ---------------- */
  function load(url) {
    if (cache[url]) return Promise.resolve(cache[url]);
    return fetch(url).then(function (r) {
      if (!r.ok) throw new Error('Could not load ' + url + ' (' + r.status + ')');
      return r.json();
    }).then(function (j) { cache[url] = j; return j; });
  }
  function domainTopics(id) { return load('data/d/' + id + '.json'); }

  /* ---------------- progress numbers ---------------- */
  function counts() {
    var st = read().status || {}, done = 0, learning = 0, review = 0;
    FLAT.forEach(function (t) {
      var s = st[t.id];
      if (isDone(s)) done++; else if (s === 'learning') learning++; else if (s === 'review') review++;
    });
    return { done: done, learning: learning, review: review, total: FLAT.length };
  }
  function domainDone(d) {
    var st = read().status || {};
    return d.topics.filter(function (t) { return isDone(st[t.id]); }).length;
  }
  function nextUp() {
    var st = read().status || {}, last = null;
    try { last = localStorage.getItem(LAST); } catch (e) {}
    if (last && BY_ID[last] && !isDone(st[last])) return BY_ID[last];
    for (var i = 0; i < FLAT.length; i++) if (!isDone(st[FLAT[i].id])) return FLAT[i];
    return null;
  }

  /* ---------------- sidebar ---------------- */
  function renderSide(route) {
    var st = read().status || {};
    var h = '<a class="side-link' + (route.name === 'home' ? ' is-current' : '') + '" href="#/">Overview</a>';
    h += '<a class="side-link' + (route.name === 'review' ? ' is-current' : '') + '" href="#/review">To revise</a>';
    h += '<div class="side-label">The path</div>';
    INDEX.domains.forEach(function (d, i) {
      var done = domainDone(d), open = openDomains[d.id];
      h += '<div class="dom' + (open ? ' is-open' : '') + (done === d.topics.length ? ' is-complete' : '') + '">' +
        '<button class="dom-head" data-dom="' + d.id + '" aria-expanded="' + (open ? 'true' : 'false') + '">' +
        '<span class="dom-num">' + (i + 1) + '</span><span class="dom-title">' + esc(d.title) + '</span>' +
        '<span class="dom-count">' + done + '/' + d.topics.length + '</span></button><div class="dom-topics">';
      if (open) d.topics.forEach(function (t) {
        h += '<a class="side-topic' + (route.name === 'topic' && route.id === t.id ? ' is-current' : '') + '" href="#/t/' + t.id + '">' +
          '<span class="dot" data-s="' + (st[t.id] || '') + '"></span><span>' + esc(t.title) + '</span></a>';
      });
      h += '</div></div>';
    });
    h += '<div class="side-label">Reference</div>';
    h += '<a class="side-link' + (route.name === 'compare' ? ' is-current' : '') + '" href="#/compare">Comparisons (' + INDEX.comparisons.length + ')</a>';
    h += '<a class="side-link' + (route.name === 'tools' ? ' is-current' : '') + '" href="#/tools">Tools (' + INDEX.tools + ')</a>';
    h += '<a class="side-link" href="../os/">Open Revision OS</a>';
    h += '<a class="side-link" href="../">Open the map</a>';
    side.innerHTML = h;
    var cur = side.querySelector('.side-topic.is-current');
    if (cur && cur.scrollIntoView) {
      var r = cur.getBoundingClientRect(), sr = side.getBoundingClientRect();
      if (r.top < sr.top + 40 || r.bottom > sr.bottom - 40) side.scrollTop += r.top - sr.top - sr.height / 3;
    }
    var c = counts();
    document.getElementById('top-progress').innerHTML = '<b>' + c.done + '</b> / ' + c.total + '<span> done</span>';
  }
  side.addEventListener('click', function (e) {
    var b = e.target.closest('.dom-head');
    if (b) { openDomains[b.dataset.dom] = !openDomains[b.dataset.dom]; renderSide(parse()); return; }
    if (e.target.closest('a')) closeMenu();
  });
  function closeMenu() { side.classList.remove('is-open'); scrim.hidden = true; menuBtn.setAttribute('aria-expanded', 'false'); }
  menuBtn.addEventListener('click', function () {
    var open = !side.classList.contains('is-open');
    side.classList.toggle('is-open', open); scrim.hidden = !open; menuBtn.setAttribute('aria-expanded', String(open));
  });
  scrim.addEventListener('click', closeMenu);

  /* ---------------- pages ---------------- */
  function topicChip(id) {
    var t = BY_ID[id];
    if (t) return '<a class="chip" href="#/t/' + id + '"><span class="dot" data-s="' + statusOf(id) + '"></span>' + esc(t.title) + '</a>';
    if (DOMAIN[id]) return '<a class="chip" href="#/d/' + id + '">' + esc(DOMAIN[id].title) + '</a>';
    if (CMP[id]) return '<a class="chip" href="#/compare/' + id + '">' + esc(CMP[id]) + '</a>';
    return '';
  }
  function chips(ids) { var h = (ids || []).map(topicChip).join(''); return h ? '<div class="chips">' + h + '</div>' : ''; }
  function row(t, n) {
    return '<a class="row" href="#/t/' + t.id + '"><span class="n">' + n + '</span><span class="dot" data-s="' + statusOf(t.id) + '"></span>' +
      '<span class="t"><b>' + esc(t.title) + '</b><small>' + esc(t.summary) + '</small></span></a>';
  }

  function pageHome() {
    var c = counts(), up = nextUp(), pct = c.total ? Math.round(100 * c.done / c.total) : 0;
    var h = '<div class="col"><h1>Revision Guide</h1>' +
      '<p class="lead">' + c.total + ' topics across ' + INDEX.domains.length + ' subjects, in one reading order. Read a topic, test yourself, mark it done.</p>' +
      '<div class="bar" role="img" aria-label="' + pct + ' percent done"><i style="width:' + pct + '%"></i></div>' +
      '<div class="stats"><div><b>' + pct + '%</b><span>complete</span></div><div><b>' + c.done + '</b><span>done</span></div>' +
      '<div><b>' + c.learning + '</b><span>learning</span></div><div><b>' + c.review + '</b><span>to revise</span></div>' +
      '<div><b>' + (c.total - c.done) + '</b><span>left</span></div></div>';
    if (up) h += '<p><a class="btn" href="#/t/' + up.id + '">' + (c.done || c.learning ? 'Continue' : 'Start') + ': ' + esc(up.title) + '</a></p>';
    else h += '<p><b>Every topic is marked done.</b> Go through <a href="#/review">To revise</a> or reopen any subject below.</p>';
    h += '<div class="how"><ol><li>Read the topic top to bottom. Each one follows the same order: what it is, why it exists, how it works, an example.</li>' +
      '<li>Answer the "Test yourself" questions before opening the answers.</li>' +
      '<li>Mark it <b>Done</b> if you could explain it to someone, or <b>Revise again</b> if not. Anything marked Revise again collects under <a href="#/review">To revise</a>.</li></ol></div>';
    h += '<h2>The path</h2><div class="rows">';
    INDEX.domains.forEach(function (d, i) {
      var done = domainDone(d), p = Math.round(100 * done / d.topics.length);
      h += '<a class="row" href="#/d/' + d.id + '"><span class="n">' + (i + 1) + '</span><span class="t"><b>' + esc(d.title) + '</b><small>' + esc(d.blurb) + '</small></span>' +
        '<span class="c">' + done + ' / ' + d.topics.length + '<div class="bar"><i style="width:' + p + '%"></i></div></span></a>';
    });
    h += '</div></div>';
    main.innerHTML = h;
    document.title = 'Revision Guide';
  }

  function pageDomain(id) {
    var d = DOMAIN[id];
    if (!d) return notFound();
    openDomains[id] = true;
    var i = INDEX.domains.indexOf(d), done = domainDone(d);
    var h = '<div class="col"><div class="crumb"><a href="#/">Overview</a> · Subject ' + (i + 1) + ' of ' + INDEX.domains.length + '</div>' +
      '<h1>' + esc(d.title) + '</h1><p class="lead">' + esc(d.blurb) + '</p>' +
      '<p class="hint">' + done + ' of ' + d.topics.length + ' topics done</p><div class="rows">';
    d.topics.forEach(function (t, n) { h += row(t, n + 1); });
    h += '</div><div class="pn">' +
      (i > 0 ? '<a href="#/d/' + INDEX.domains[i - 1].id + '"><small>Previous subject</small>' + esc(INDEX.domains[i - 1].title) + '</a>' : '<span></span>') +
      (i < INDEX.domains.length - 1 ? '<a href="#/d/' + INDEX.domains[i + 1].id + '" style="text-align:right"><small>Next subject</small>' + esc(INDEX.domains[i + 1].title) + '</a>' : '<span></span>') +
      '</div></div>';
    main.innerHTML = h;
    document.title = d.title + ' · Revision Guide';
  }

  function pageReview() {
    var st = read().status || {};
    var rev = FLAT.filter(function (t) { return st[t.id] === 'review'; });
    var lrn = FLAT.filter(function (t) { return st[t.id] === 'learning'; });
    var h = '<div class="col"><div class="crumb"><a href="#/">Overview</a></div><h1>To revise</h1>';
    if (!rev.length && !lrn.length) h += '<p class="lead">Nothing here yet. Topics you mark "Revise again" or "Learning" show up on this page.</p>';
    if (rev.length) { h += '<h2>Revise again (' + rev.length + ')</h2><div class="rows">' + rev.map(function (t, n) { return row(t, n + 1); }).join('') + '</div>'; }
    if (lrn.length) { h += '<h2>Still learning (' + lrn.length + ')</h2><div class="rows">' + lrn.map(function (t, n) { return row(t, n + 1); }).join('') + '</div>'; }
    main.innerHTML = h + '</div>';
    document.title = 'To revise · Revision Guide';
  }

  function pageTopic(id) {
    var stub = BY_ID[id];
    if (!stub) return notFound();
    openDomains[stub.domain] = true;
    try { localStorage.setItem(LAST, id); } catch (e) {}
    return Promise.all([domainTopics(stub.domain), load('data/tools.json')]).then(function (res) {
      var t = res[0].filter(function (x) { return x.id === id; })[0];
      var toolById = {}; res[1].tools.forEach(function (x) { toolById[x.id] = x; });
      var d = DOMAIN[stub.domain], di = INDEX.domains.indexOf(d), ti = d.topics.indexOf(stub);
      var prev = FLAT[stub.n - 1], next = FLAT[stub.n + 1];
      var h = '<article class="col">';
      h += '<div class="crumb"><a href="#/d/' + d.id + '">' + (di + 1) + '. ' + esc(d.title) + '</a> · Topic ' + (ti + 1) + ' of ' + d.topics.length +
        (t.priority === 'high' ? ' · <span class="tag high">High priority</span>' : '') + '</div>';
      h += '<h1>' + esc(t.title) + '</h1><p class="lead">' + inline(t.summary) + '</p>';
      h += statusButtons(id);
      if (t.prereq && t.prereq.length) h += '<p class="before">Read first if these are new to you:</p>' + chips(t.prereq);

      h += '<h2>What it is</h2>' + prose(t.what);
      h += '<h2>Why it exists</h2>' + prose(t.why);
      if (t.analogy) h += '<h2>Think of it like this</h2><div class="analogy">' + prose(t.analogy) + '</div>';
      h += '<h2>How it actually works</h2>' + prose(t.technical);
      if (t.diagram) h += '<h2>The picture</h2>' + pre(t.diagram);
      if (t.example) {
        h += '<h2>Worked example</h2>';
        if (typeof t.example === 'string') h += prose(t.example);
        else {
          if (t.example.intro) h += prose(t.example.intro);
          if (t.example.caption) h += '<p class="pre-cap">' + inline(t.example.caption) + '</p>';
          if (t.example.code) h += pre(t.example.code);
          if (t.example.after) h += prose(t.example.after);
        }
      }
      if ((t.useCases && t.useCases.length) || (t.avoid && t.avoid.length)) {
        h += '<h2>When to use it, and when not to</h2><div class="two"><div><h3>Use it when</h3>' + list(t.useCases) +
          '</div><div><h3>Avoid it when</h3>' + list(t.avoid) + '</div></div>';
      }
      if (t.mistakes && t.mistakes.length) h += '<h2>Mistakes people make</h2>' + list(t.mistakes);
      if (t.keyTerms && t.keyTerms.length) {
        h += '<h2>Words to know</h2><dl class="terms">' + t.keyTerms.map(function (k) {
          return '<dt>' + inline(k.term) + '</dt><dd>' + inline(k.def) + '</dd>';
        }).join('') + '</dl>';
      }
      if (t.questions && t.questions.length) {
        h += '<h2>Test yourself</h2><p class="hint">Answer in your head or out loud first, then open the answer.</p>' +
          t.questions.map(function (q) {
            return '<details class="qa"><summary>' + inline(q.q) + '</summary><div class="ans">' + prose(q.a) + '</div></details>';
          }).join('');
      }
      if (t.interview) {
        var iv = t.interview, parts = [['s30', 'In 30 seconds'], ['s90', 'In 90 seconds'], ['technical', 'If they push on the technical side'], ['pm', 'The product angle'], ['example', 'An example to give']];
        h += '<h2>Say it out loud</h2><div class="say">' + parts.map(function (p) {
          return iv[p[0]] ? '<h3>' + p[1] + '</h3>' + prose(iv[p[0]]) : '';
        }).join('') + '</div>';
      }
      var tools = (t.tools || []).map(function (x) { return toolById[x]; }).filter(Boolean);
      if (tools.length) {
        h += '<h2>Tools for this</h2>' + tools.map(function (x) {
          return '<div class="tool-row"><b><a href="#/tools/' + x.id + '">' + esc(x.name) + '</a></b> <span>' + inline(x.what) + '</span></div>';
        }).join('');
      }
      if (t.resources && t.resources.length) {
        h += '<h2>Go deeper</h2><ul class="links">' + t.resources.map(function (r) {
          return '<li><span class="kind">' + (KIND[r.kind] || 'Link') + '</span><a href="' + esc(r.url) + '" target="_blank" rel="noopener noreferrer">' + esc(r.label) + '</a> <span class="host">' + esc(host(r.url)) + '</span>' +
            (r.note ? '<span class="note">' + inline(r.note) + '</span>' : '') + '</li>';
        }).join('') + '</ul>';
      }
      var nx = chips(t.next), rel = chips(t.related);
      if (nx || rel) {
        h += '<h2>Connected topics</h2>';
        if (nx) h += '<h3>Leads to</h3>' + nx;
        if (rel) h += '<h3>Related</h3>' + rel;
      }
      h += '<div class="notes-wrap"><h2>Your notes</h2><textarea class="notes" id="notes" placeholder="Write what you want to remember. Saved in this browser.">' + esc(noteOf(id)) + '</textarea><div class="saved" id="saved"></div></div>';

      h += '<div class="next-bar">' + statusButtons(id) + '<p style="margin-top:16px">' +
        (next ? '<button class="btn" id="done-next">Mark done and go to next</button>' : '<button class="btn" id="done-next">Mark done</button>') + '</p>' +
        '<div class="pn">' + (prev ? '<a href="#/t/' + prev.id + '"><small>Previous</small>' + esc(prev.title) + '</a>' : '<span></span>') +
        (next ? '<a href="#/t/' + next.id + '" style="text-align:right"><small>Next</small>' + esc(next.title) + '</a>' : '<span></span>') + '</div></div>';
      h += '</article>';
      main.innerHTML = h;
      document.title = t.title + ' · Revision Guide';

      var notes = document.getElementById('notes'), saved = document.getElementById('saved'), timer;
      notes.addEventListener('input', function () {
        clearTimeout(timer);
        timer = setTimeout(function () { setNote(id, notes.value); saved.textContent = 'Saved'; setTimeout(function () { saved.textContent = ''; }, 1500); }, 400);
      });
      document.getElementById('done-next').addEventListener('click', function () {
        setStatus(id, 'completed');
        if (next) location.hash = '#/t/' + next.id; else route();
      });
    });
  }
  function statusButtons(id) {
    var cur = statusOf(id); if (cur === 'mastered') cur = 'completed';
    return '<div class="status" role="group" aria-label="Your status on this topic">' + STATUS.map(function (s) {
      return '<button data-set="' + s[0] + '" data-s="' + s[0] + '" data-topic="' + id + '" aria-pressed="' + (cur === s[0]) + '">' + s[1] + '</button>';
    }).join('') + '</div>';
  }
  main.addEventListener('click', function (e) {
    var b = e.target.closest('button[data-set]');
    if (!b) return;
    setStatus(b.dataset.topic, b.dataset.set);
    main.querySelectorAll('.status button').forEach(function (x) { x.setAttribute('aria-pressed', String(x.dataset.set === b.dataset.set)); });
    renderSide(parse());
  });

  function pageCompare(focus) {
    return load('data/comparisons.json').then(function (cs) {
      var h = '<div class="col"><div class="crumb"><a href="#/">Overview</a></div><h1>Comparisons</h1>' +
        '<p class="lead">The pairs people mix up, side by side.</p><div class="chips">' +
        cs.map(function (c) { return '<a class="chip" href="#/compare/' + c.id + '">' + esc(c.title) + '</a>'; }).join('') + '</div>';
      cs.forEach(function (c) {
        h += '<section id="c-' + c.id + '"><h2>' + esc(c.title) + '</h2>' + prose(c.summary) +
          '<div class="table-wrap"><table><thead><tr><th></th><th>' + esc(c.a.label) + '</th><th>' + esc(c.b.label) + '</th></tr></thead><tbody>' +
          '<tr><td>In short</td><td>' + inline(c.a.tagline || '') + '</td><td>' + inline(c.b.tagline || '') + '</td></tr>' +
          (c.axes || []).map(function (x) { return '<tr><td>' + esc(x.label) + '</td><td>' + inline(x.a) + '</td><td>' + inline(x.b) + '</td></tr>'; }).join('') +
          '</tbody></table></div>' +
          (c.verdict ? '<div class="verdict"><h3 style="margin-top:0">How to choose</h3>' + prose(c.verdict) + '</div>' : '') +
          (c.diagram ? '<h3>The picture</h3>' + pre(c.diagram) : '') +
          (c.topics && c.topics.length ? '<h3>Read the topics</h3>' + chips(c.topics) : '') + '</section>';
      });
      main.innerHTML = h + '</div>';
      document.title = 'Comparisons · Revision Guide';
      if (focus) { var el = document.getElementById('c-' + focus); if (el) el.scrollIntoView(); }
    });
  }

  function pageTools(focus) {
    return load('data/tools.json').then(function (data) {
      var HOSTING = { local: 'Runs on your machine', cloud: 'Hosted service', both: 'Local or hosted', 'self-hosted': 'Self-hosted' };
      var h = '<div class="col"><div class="crumb"><a href="#/">Overview</a></div><h1>Tools</h1>' +
        '<p class="lead">What each tool is for, when to reach for it, and what else does the same job.</p>';
      data.groups.forEach(function (g) {
        var ts = data.tools.filter(function (x) { return x.group === g.id; });
        if (!ts.length) return;
        h += '<h2>' + esc(g.label) + '</h2><p class="hint">' + esc(g.blurb) + '</p>';
        ts.forEach(function (x) {
          h += '<section id="tool-' + x.id + '"><h3>' + esc(x.name) + (x.hosting ? ' <span class="tag">' + esc(HOSTING[x.hosting] || x.hosting) + '</span>' : '') + '</h3>' +
            '<p>' + inline(x.what) + '</p>' +
            (x.why ? '<p><b>Why it matters.</b> ' + inline(x.why) + '</p>' : '') +
            (x.when ? '<p><b>When to use it.</b> ' + inline(x.when) + '</p>' : '') +
            (x.alternatives && x.alternatives.length ? '<p><b>Alternatives.</b> ' + x.alternatives.map(esc).join(', ') + '</p>' : '') +
            (x.pmNote ? '<p><b>For a PM.</b> ' + inline(x.pmNote) + '</p>' : '') +
            (x.url ? '<p><a href="' + esc(x.url) + '" target="_blank" rel="noopener noreferrer">Official docs</a> <span class="host">' + esc(host(x.url)) + '</span></p>' : '') + '</section>';
        });
      });
      main.innerHTML = h + '</div>';
      document.title = 'Tools · Revision Guide';
      if (focus) { var el = document.getElementById('tool-' + focus); if (el) el.scrollIntoView(); }
    });
  }

  function notFound() {
    main.innerHTML = '<div class="col"><h1>Not found</h1><p>That page does not exist. <a href="#/">Back to the overview</a>.</p></div>';
  }

  /* ---------------- routing ---------------- */
  function parse() {
    var p = (location.hash || '#/').replace(/^#\/?/, '').split('/');
    if (!p[0]) return { name: 'home' };
    if (p[0] === 't') return { name: 'topic', id: decodeURIComponent(p[1] || '') };
    if (p[0] === 'd') return { name: 'domain', id: p[1] };
    if (p[0] === 'review') return { name: 'review' };
    if (p[0] === 'compare') return { name: 'compare', id: p[1] };
    if (p[0] === 'tools') return { name: 'tools', id: p[1] };
    return { name: '404' };
  }
  var token = 0;
  function route() {
    var r = parse(), mine = ++token, keepScroll = false;
    var job;
    try {
      if (r.name === 'home') job = pageHome();
      else if (r.name === 'topic') job = pageTopic(r.id);
      else if (r.name === 'domain') job = pageDomain(r.id);
      else if (r.name === 'review') job = pageReview();
      else if (r.name === 'compare') { job = pageCompare(r.id); keepScroll = !!r.id; }
      else if (r.name === 'tools') { job = pageTools(r.id); keepScroll = !!r.id; }
      else job = notFound();
    } catch (err) { job = Promise.reject(err); }
    Promise.resolve(job).then(function () {
      if (mine !== token) return;
      renderSide(r);
      if (!keepScroll) window.scrollTo(0, 0);
    }).catch(function (err) {
      if (mine !== token) return;
      main.innerHTML = '<div class="col"><h1>Could not load this page</h1><p>' + esc(err.message || err) + '</p><p><a href="#/">Back to the overview</a>, or reload.</p></div>';
      renderSide(r);
    });
  }
  window.addEventListener('hashchange', route);

  /* ---------------- search ---------------- */
  var input = document.getElementById('search'), box = document.getElementById('search-results'), active = -1;
  function search(q) {
    q = q.trim().toLowerCase();
    if (!q) { box.hidden = true; return; }
    var words = q.split(/\s+/), hits = [];
    FLAT.forEach(function (t) {
      var title = t.title.toLowerCase(), rest = (t.summary + ' ' + t.terms).toLowerCase(), score = 0;
      for (var i = 0; i < words.length; i++) {
        var w = words[i];
        if (title.indexOf(w) === 0) score += 6; else if (title.indexOf(w) > -1) score += 4;
        else if (rest.indexOf(w) > -1) score += 1; else return;
      }
      hits.push([score, t]);
    });
    hits.sort(function (a, b) { return b[0] - a[0] || a[1].n - b[1].n; });
    active = -1;
    box.innerHTML = hits.length ? hits.slice(0, 12).map(function (h) {
      return '<a href="#/t/' + h[1].id + '">' + esc(h[1].title) + '<small>' + esc(DOMAIN[h[1].domain].title) + '</small></a>';
    }).join('') : '<div class="none">No topic matches that.</div>';
    box.hidden = false;
  }
  input.addEventListener('input', function () { search(input.value); });
  input.addEventListener('focus', function () { if (input.value) search(input.value); });
  input.addEventListener('keydown', function (e) {
    var links = box.querySelectorAll('a');
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      if (!links.length) return;
      e.preventDefault();
      active = (active + (e.key === 'ArrowDown' ? 1 : -1) + links.length) % links.length;
      links.forEach(function (a, i) { a.classList.toggle('is-active', i === active); });
      links[active].scrollIntoView({ block: 'nearest' });
    } else if (e.key === 'Enter' && links.length) {
      location.hash = links[Math.max(active, 0)].getAttribute('href'); input.value = ''; box.hidden = true; input.blur();
    } else if (e.key === 'Escape') { box.hidden = true; input.blur(); }
  });
  box.addEventListener('click', function (e) { if (e.target.closest('a')) { input.value = ''; box.hidden = true; } });
  document.addEventListener('click', function (e) { if (!e.target.closest('.search')) box.hidden = true; });
  document.addEventListener('keydown', function (e) {
    if (e.key === '/' && !/input|textarea/i.test(document.activeElement.tagName)) { e.preventDefault(); input.focus(); }
  });

  /* ---------------- theme ---------------- */
  document.getElementById('theme-btn').addEventListener('click', function () {
    var root = document.documentElement;
    var dark = root.dataset.theme ? root.dataset.theme === 'dark' : window.matchMedia('(prefers-color-scheme: dark)').matches;
    root.dataset.theme = dark ? 'light' : 'dark';
    try { localStorage.setItem('guide:theme', root.dataset.theme); } catch (e) {}
  });

  /* ---------------- boot ---------------- */
  load('data/index.json').then(function (idx) {
    INDEX = idx;
    idx.domains.forEach(function (d) {
      DOMAIN[d.id] = d;
      d.topics.forEach(function (t) { t.domain = d.id; t.n = FLAT.length; FLAT.push(t); BY_ID[t.id] = t; });
    });
    idx.comparisons.forEach(function (c) { CMP[c.id] = c.title; });
    route();
  }).catch(function (err) {
    main.innerHTML = '<div class="col"><h1>Could not load the guide</h1><p>' + esc(err.message || err) + '</p><p>Reload the page. If you opened this as a file on your computer, it has to be opened from the web link instead.</p></div>';
  });
})();
