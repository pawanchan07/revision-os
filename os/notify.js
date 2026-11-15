/* Reminders. The page decides what is worth saying and leaves a small note for the
   service worker, which shows at most one reminder a day when the browser wakes it.
   If notifications are off or unsupported, nothing here runs and the app is unaffected. */
(function () {
  'use strict';
  var N = R.notify = {};
  N.supported = function () { return 'Notification' in window && 'serviceWorker' in navigator; };
  N.permission = function () { return N.supported() ? Notification.permission : 'unsupported'; };
  // The note the service worker reads. No personal data beyond concept titles.
  N.plan = function () {
    var S = R.state(), n = S.notify || {}, m = R.mission(), due = R.dueList(), weak = R.weakList(), last = Object.keys(S.log).sort().pop();
    return { on: !!n.on, hour: n.hour, quietFrom: n.quietFrom, quietTo: n.quietTo, today: R.today(), missionDone: R.missionDone(),
      mission: m ? { id: m.id, title: m.title, hook: m.hook, mins: m.mins } : null,
      due: due.length, dueId: due[0] ? due[0].id : null, dueTitle: due[0] ? due[0].title : null,
      dueDays: due[0] && S.c[due[0].id].last ? R.daysBetween(S.c[due[0].id].last, R.today()) : 0,
      weakTitle: weak[0] ? weak[0].title : null, streak: R.streak(), lastActive: last || null, base: location.href.split('#')[0] };
  };
  N.mirror = function () {
    if (!('caches' in window)) return;
    caches.open('revos-note').then(function (c) { return c.put('note', new Response(JSON.stringify(N.plan()))); }).catch(function () {});
  };
  N.enable = function () {
    if (!N.supported()) return Promise.resolve('unsupported');
    return Notification.requestPermission().then(function (p) {
      var S = R.state(); S.notify.on = p === 'granted'; R.save(); N.mirror();
      if (p !== 'granted') return p;
      return navigator.serviceWorker.ready.then(function (reg) {
        if (!reg.periodicSync) return 'granted-no-schedule';
        return reg.periodicSync.register('revos-daily', { minInterval: 6 * 3600 * 1000 }).then(function () { return 'granted'; }, function () { return 'granted-no-schedule'; });
      });
    });
  };
  N.disable = function () {
    var S = R.state(); S.notify.on = false; R.save(); N.mirror();
    if (navigator.serviceWorker) navigator.serviceWorker.ready.then(function (reg) { if (reg.periodicSync) reg.periodicSync.unregister('revos-daily').catch(function () {}); });
  };
  N.test = function () {
    if (!navigator.serviceWorker) return;
    N.mirror();
    navigator.serviceWorker.ready.then(function (reg) { if (reg.active) reg.active.postMessage({ type: 'test-reminder' }); });
  };
  R.onSave = N.mirror;
})();
