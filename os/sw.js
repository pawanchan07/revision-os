/* Revision OS service worker: offline copy of the app and its content, and the daily reminder. */
var V = 'revos-v3';
var SHELL = ['./', 'index.html', 'app.css', 'core.js', 'visuals.js', 'challenges.js', 'deep.js', 'notify.js', 'app.js', 'manifest.json', 'icon-192.png', 'icon-512.png',
  '../guide/data/index.json', '../guide/data/tools.json'];

self.addEventListener('install', function (e) { e.waitUntil(caches.open(V).then(function (c) { return c.addAll(SHELL); }).then(function () { return self.skipWaiting(); })); });
self.addEventListener('activate', function (e) {
  e.waitUntil(caches.keys().then(function (keys) { return Promise.all(keys.filter(function (k) { return k.indexOf('revos-v') === 0 && k !== V; }).map(function (k) { return caches.delete(k); })); }).then(function () { return self.clients.claim(); }));
});
// Serve from the cache at once and refresh the copy in the background.
self.addEventListener('fetch', function (e) {
  var req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== location.origin) return;
  e.respondWith(caches.open(V).then(function (c) {
    return c.match(req, { ignoreSearch: true }).then(function (hit) {
      var net = fetch(req).then(function (res) { if (res && res.ok) c.put(req, res.clone()); return res; }).catch(function () { return hit; });
      return hit || net;
    });
  }));
});

/* ---------- reminders ---------- */
function note() { return caches.open('revos-note').then(function (c) { return c.match('note'); }).then(function (r) { return r ? r.json() : null; }).catch(function () { return null; }); }
function ymd(d) { return d.getFullYear() + '-' + ('0' + (d.getMonth() + 1)).slice(-2) + '-' + ('0' + d.getDate()).slice(-2); }
// Picks at most one message. Returns null when staying quiet is the right call.
function choose(n, now, force) {
  if (!n || (!n.on && !force)) return null;
  var h = now.getHours(), quiet = n.quietFrom > n.quietTo ? (h >= n.quietFrom || h < n.quietTo) : (h >= n.quietFrom && h < n.quietTo);
  if (!force && (quiet || h < n.hour || n.shown === ymd(now))) return null;
  var stale = n.today !== ymd(now), done = n.missionDone && !stale;
  var idle = n.lastActive ? Math.round((now - new Date(n.lastActive + 'T12:00')) / 864e5) : 99;
  if (!force && done && !n.due) return null;                       // nothing useful to say today
  if (idle >= 4) return { title: 'Something interesting is waiting', body: n.mission ? n.mission.hook || n.mission.title : 'Pick up where you left off.', url: n.mission ? '#/c/' + n.mission.id : '#/' };
  if (!done && n.mission) return { title: (n.streak >= 2 ? 'Day ' + (n.streak + 1) + '. ' : '') + 'Your next mission is ready', body: n.mission.mins + ' minutes. ' + (n.mission.hook || n.mission.title), url: '#/c/' + n.mission.id };
  if (n.due) return { title: n.due === 1 ? 'One concept is due' : n.due + ' concepts are due', body: 'You learned ' + n.dueTitle + (n.dueDays ? ' ' + n.dueDays + ' days ago' : '') + '. Can you still explain it?', url: '#/review' };
  if (n.weakTitle) return { title: 'One weak spot', body: n.weakTitle + ' keeps slipping. Two minutes fixes that.', url: '#/review' };
  return null;
}
function remind(force) {
  return note().then(function (n) {
    var m = choose(n, new Date(), force); if (!m) return;
    n.shown = ymd(new Date());
    return caches.open('revos-note').then(function (c) { return c.put('note', new Response(JSON.stringify(n))); }).then(function () {
      return self.registration.showNotification(m.title, { body: m.body, tag: 'revos-daily', renotify: false, icon: 'icon-192.png', badge: 'icon-192.png',
        data: { url: (n.base || './') + m.url }, actions: [{ action: 'open', title: 'Start' }, { action: 'later', title: 'Not now' }] });
    });
  });
}
self.addEventListener('periodicsync', function (e) { if (e.tag === 'revos-daily') e.waitUntil(remind(false)); });
self.addEventListener('message', function (e) { if (e.data && e.data.type === 'test-reminder') e.waitUntil(remind(true)); });
self.addEventListener('notificationclick', function (e) {
  e.notification.close();
  if (e.action === 'later') return;
  var url = e.notification.data && e.notification.data.url;
  e.waitUntil(self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function (list) {
    for (var i = 0; i < list.length; i++) if ('focus' in list[i]) { list[i].navigate(url); return list[i].focus(); }
    return self.clients.openWindow(url);
  }));
});
