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

  /* ---------- reminders ----------
     Planned here, scheduled by Android as alarms. Whenever progress changes, the next seven
     days are re-planned from the current state, so a reminder never fires for a mission that
     is already done. No background work, no polling, no server. */
  var N = R.notify, timer = null;
  N.supported = function () { return true; };
  N.permission = function () { return B.notifyAllowed() ? 'granted' : (R.state().notify.asked ? 'denied' : 'default'); };
  function ymd(d) { return d.getFullYear() + '-' + ('0' + (d.getMonth() + 1)).slice(-2) + '-' + ('0' + d.getDate()).slice(-2); }
  function plan() {
    var S = R.state(), n = S.notify, now = new Date(), out = [], m = R.mission(), done = R.missionDone(), streak = R.streak();
    var next = done && m ? R.nextNew(m.id) : m;                    // what tomorrow's mission is likely to be
    for (var d = 0; d < 7; d++) {
      var at = new Date(now.getFullYear(), now.getMonth(), now.getDate() + d, n.hour, 0, 0);
      if (at.getTime() < now.getTime() + 60000) continue;
      var day = ymd(at), due = R.FLAT.filter(function (t) { var r = S.c[t.id]; return r && r.s && r.due <= day; });
      var topic = d === 0 ? (done ? null : m) : next, msg = null;
      if (d >= 4 && topic) msg = ['Something interesting is waiting', topic.hook || topic.title, '#/c/' + topic.id];
      else if (topic) msg = [(d === 0 && streak >= 1 ? 'Day ' + (streak + 1) + '. ' : '') + 'Your next mission is ready', topic.mins + ' minutes. ' + (topic.hook || topic.title) + (due.length ? ' Also ' + due.length + ' due for review.' : ''), '#/c/' + topic.id];
      else if (due.length) msg = [due.length === 1 ? 'One concept is due' : due.length + ' concepts are due', 'Can you still explain ' + due[0].title + '?', '#/review'];
      if (msg) out.push({ id: d + 1, at: at.getTime(), title: msg[0], body: msg[1], route: msg[2] });
    }
    return out;
  }
  function reschedule(extra) {
    var on = R.state().notify.on && B.notifyAllowed();
    try { B.schedule(JSON.stringify((on ? plan() : []).concat(extra || []))); } catch (e) {}
  }
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
  N.test = function () {
    var m = R.mission();
    reschedule([{ id: 99, at: Date.now() + 5000, title: 'Your next mission is ready', body: m ? m.mins + ' minutes. ' + (m.hook || m.title) : 'Open Revision OS', route: m ? '#/c/' + m.id : '#/' }]);
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
    N.mirror();
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
      N.mirror();
    });
  };
})();
