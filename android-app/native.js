/* Native bridge. Loaded only inside the Android app, after the engine and before the screens.
   It swaps haptics, reminders, the back button and the system bars for their Android versions
   and leaves everything else in the web app alone. */
(function () {
  'use strict';
  var B = window.RevosNative;
  if (!B) return;
  var WEB = 'https://pawanchan07.github.io/revision-os/';
  R.native = true;
  document.documentElement.classList.add('is-native');

  /* ---------- haptics ---------- */
  var BUZZ = { tick: '10', good: '14,50,22', bad: '34', done: '16,60,16,60,48' };
  R.haptic = function (k) { try { if (R.state().haptics !== false) B.vibrate(BUZZ[k] || '10'); } catch (e) {} };

  /* ---------- nudges ----------
     Planned here, delivered by Android alarms. Whenever progress changes, the whole plan is
     rebuilt from the current state, so nothing fires for work that is already done.

     The rules, in order of importance:
       1. The question is the notification. Curiosity does the work, not guilt.
       2. Two a day at most: one mission or review nudge, and one evening streak warning,
          and the warning only when there is a streak worth saving and nothing done today.
       3. A review nudge can be answered from the notification without opening the app.
       4. Silence after you finish. No nudge on a day whose mission is done.
       5. Back off when ignored: days 1, 2, 4 and 7 after you last opened the app, then stop.
       6. Never between 9 pm and 7 am, except the streak warning at 9 pm sharp. */
  var N = R.notify, timer = null, STREAK_HOUR = 21;
  N.supported = function () { return true; };
  N.permission = function () { return B.notifyAllowed() ? 'granted' : (R.state().notify.asked ? 'denied' : 'default'); };
  N.fullAllowed = function () { try { return B.fullScreenAllowed(); } catch (e) { return false; } };
  N.requestFull = function () { try { B.requestFullScreen(); } catch (e) {} };
  // The hour to nudge at: the hour you usually study, if that is known and smart timing is on.
  N.hour = function () {
    var n = R.state().notify, u = n.smart !== false ? R.usualHour() : null, h = u === null ? n.hour : u;
    return Math.max(7, Math.min(20, h));
  };
  function ymd(d) { return d.getFullYear() + '-' + ('0' + (d.getMonth() + 1)).slice(-2) + '-' + ('0' + d.getDate()).slice(-2); }
  function ago(n) { return n <= 0 ? 'today' : n === 1 ? 'yesterday' : n + ' days ago'; }
  // Builds the list of nudges. Returns a promise because review nudges carry the answer text.
  function plan() {
    var S = R.state(), n = S.notify, now = new Date(), hour = N.hour(), m = R.mission(), done = R.missionDone(), streak = R.streak();
    var next = done && m ? R.nextNew(m.id) : m, full = !!n.full && N.fullAllowed(), today = S.log[R.today()], active = !!(today && today.xp);
    var out = [], jobs = [];
    function at(d, h) { return new Date(now.getFullYear(), now.getMonth(), now.getDate() + d, h, 0, 0); }
    function push(id, when, o) { if (when.getTime() > now.getTime() + 60000) { o.id = id; o.at = when.getTime(); out.push(o); } }
    function missionNudge(t, d) {
      return { label: 'Your next discovery', title: t.hook || t.title, body: t.mins + ' min / ' + t.title + (d === 0 && streak >= 1 ? ' / day ' + (streak + 1) : ''), route: '#/c/' + t.id, fs: full };
    }
    [0, 1, 2, 4, 7].forEach(function (d, slot) {
      var when = at(d, hour), day = ymd(when);
      var due = R.FLAT.filter(function (t) { var r = S.c[t.id]; return r && r.s && r.due <= day; }).sort(function (a, b) { return S.c[a.id].due < S.c[b.id].due ? -1 : 1; });
      var topic = d === 0 ? (done ? null : m) : next;
      if (d === 0 && done) return;                                       // rule 4
      if (d === 7) return push(slot + 1, when, { label: 'Paused', title: 'Pausing the nudges', body: 'Your path is saved exactly where you left it. Open the app and they start again.', route: '#/' });
      if (d === 4 && topic) return push(slot + 1, when, { label: 'Still here', title: topic.hook || topic.title, body: 'Four days away. ' + topic.mins + ' minutes gets you moving again.', route: '#/c/' + topic.id });
      if (due.length && (d > 0 || !topic)) {
        // a review you can answer from the notification
        var c = due[0], r = S.c[c.id], days = R.daysBetween(r.last || R.today(), day);
        var o = { label: 'Review', title: 'Can you still explain ' + c.title + '?', body: 'You learned it ' + ago(days) + '.' + (due.length > 1 ? ' ' + (due.length - 1) + ' more due.' : ''), route: '#/review', cid: c.id, fs: false };
        jobs.push(R.topic(c.id).then(function (res) {
          var q = res.t.questions[Math.min(res.t.questions.length - 1, Math.max(0, r.s - 1))];
          if (q) { o.q = q.q; o.a = q.a.replace(/[*`]/g, ''); o.title = q.q; o.body = c.title + ' / learned ' + ago(days) + '. Answer in your head, then check.'; }
        }, function () {}));
        return push(slot + 1, when, o);
      }
      if (topic) push(slot + 1, when, missionNudge(topic, d));
    });
    // rule 2: the streak warning, today only
    if (n.streakSave !== false && streak >= 2 && !active && hour < STREAK_HOUR - 1) {
      var quick = R.dueList()[0] || R.lastLearned() || m;
      if (quick) push(6, at(0, STREAK_HOUR), { label: 'Streak', title: 'Day ' + streak + ' ends at midnight', body: 'Two minutes keeps it alive. One quick recall on ' + quick.title + '.', route: R.dueList().length ? '#/review' : '#/c/' + quick.id + '/recall' });
    }
    return Promise.all(jobs).then(function () { return out; });
  }
  function reschedule(extra) {
    var on = R.state().notify.on && B.notifyAllowed();
    return (on ? plan() : Promise.resolve([])).then(function (list) {
      try { B.schedule(JSON.stringify(list.concat(extra || []))); } catch (e) {}
      return list;
    });
  }
  N.plan = function () { return plan(); };                        // shown on the You screen
  N.mirror = function () { clearTimeout(timer); timer = setTimeout(function () { reschedule(); }, 800); };
  N.enable = function () {
    return new Promise(function (resolve) {
      window.__revosPerm = function (granted) {
        var S = R.state(); S.notify.on = !!granted; S.notify.asked = 1; R.save(); reschedule();
        resolve(granted ? 'granted' : 'denied');
      };
      B.requestNotify();
    });
  };
  N.disable = function () { var S = R.state(); S.notify.on = false; R.save(); reschedule(); };
  // A sample of the real thing in five seconds: the mission nudge, full screen if that is on.
  N.test = function () {
    var S = R.state(), m = R.mission(), full = !!S.notify.full && N.fullAllowed();
    reschedule([{ id: 99, at: Date.now() + 5000, label: 'Your next discovery', title: m ? (m.hook || m.title) : 'Open Revision OS', body: m ? m.mins + ' min / ' + m.title : '', route: m ? '#/c/' + m.id : '#/', fs: full }]);
  };
  // Reviews answered from a notification while the app was closed.
  N.collect = function () {
    var box = [];
    try { box = JSON.parse(B.takeInbox() || '[]'); } catch (e) {}
    var n = 0;
    box.forEach(function (x) { if (x && R.BY_ID[x.cid] && R.rec(x.cid) && R.rec(x.cid).s) { R.grade(x.cid, x.grade === 'good' ? 'good' : 'miss'); n++; } });
    return n;
  };
  R.onSave = N.mirror;

  /* ---------- back button and coming back to the app ---------- */
  window.__revosBack = function () {
    var pal = document.getElementById('pal');
    if (pal && !pal.hidden) { document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' })); return true; }
    var h = location.hash.replace(/^#\/?/, '');
    if (!h) return false;                                           // at the start: Android sends the app to the background
    if (history.length > 1) history.back(); else location.hash = '#/';
    return true;
  };
  window.__revosResume = function () {
    if (!R.INDEX) return;
    var got = N.collect();
    N.mirror();
    if (got && location.hash.replace(/^#\/?/, '') === 'you') window.dispatchEvent(new HashChangeEvent('hashchange'));
    if (!location.hash.replace(/^#\/?/, '')) window.dispatchEvent(new HashChangeEvent('hashchange'));   // a new day may have started
  };

  /* ---------- system bars follow the theme ---------- */
  var applyTheme = R.applyTheme, mq = window.matchMedia('(prefers-color-scheme: dark)');
  R.applyTheme = function () {
    applyTheme();
    var t = R.state().theme || 'system';
    try { B.setBars(t === 'dark' || (t === 'system' && mq.matches)); } catch (e) {}
  };
  if (mq.addEventListener) mq.addEventListener('change', function () { if (R.INDEX) R.applyTheme(); });

  /* ---------- the guide and the map are not packaged: open them in the browser ---------- */
  document.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('a[href^="../"]');
    if (a) { e.preventDefault(); B.open(WEB + a.getAttribute('href').replace(/^\.\.\//, '')); }
  }, true);

  /* ---------- after Android has closed the app, return to the lesson you were in ---------- */
  var boot = R.boot;
  R.boot = function () {
    return boot().then(function () {
      var s = R.state().sess, h = location.hash.replace(/^#\/?/, '');
      if (!h && s && s.id && R.BY_ID[s.id] && R.status(s.id) === 'active' && Date.now() - (s.at || 0) < 30 * 60000) history.replaceState(null, '', '#/c/' + s.id + '/' + (s.stage || 'explore'));
      N.collect();
      N.mirror();
      // First open: ask for notification permission once and turn the daily reminder on.
      // Saying no is remembered, and the switch under You still works either way.
      if (!R.state().notify.asked) setTimeout(function () {
        N.enable().then(function () { if (location.hash.replace(/^#\/?/, '') === 'you') window.dispatchEvent(new HashChangeEvent('hashchange')); });
      }, 1800);
    });
  };
})();
