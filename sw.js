// офлайн-режим «Умняши»: при установке сохраняем все файлы, дальше берём их с устройства
var CACHE = 'umnyasha-cb6c2fa1d5b4';
var FILES = ["dc-lite.js", "icons/icon-180.png", "icons/icon-192.png", "icons/icon-512.png", "icons/icon.svg", "index.html", "manifest.webmanifest", "voice/color-blue-f.mp3", "voice/color-blue-find.mp3", "voice/color-blue.mp3", "voice/color-green-f.mp3", "voice/color-green-find.mp3", "voice/color-green.mp3", "voice/color-orange-f.mp3", "voice/color-orange-find.mp3", "voice/color-orange.mp3", "voice/color-purple-f.mp3", "voice/color-purple-find.mp3", "voice/color-purple.mp3", "voice/color-red-f.mp3", "voice/color-red-find.mp3", "voice/color-red.mp3", "voice/color-yellow-f.mp3", "voice/color-yellow-find.mp3", "voice/color-yellow.mp3", "voice/first-ball.mp3", "voice/first-balloon.mp3", "voice/first-boat.mp3", "voice/first-candy.mp3", "voice/first-car.mp3", "voice/first-cube.mp3", "voice/first-cup.mp3", "voice/first-flower.mp3", "voice/first-gift.mp3", "voice/first-house.mp3", "voice/first-lollipop.mp3", "voice/first-mitten.mp3", "voice/first-pencil.mp3", "voice/first-rocket.mp3", "voice/first-star.mp3", "voice/first-tshirt.mp3", "voice/first-tulip.mp3", "voice/first-umbrella.mp3", "voice/item-ball.mp3", "voice/item-balloon.mp3", "voice/item-boat.mp3", "voice/item-candy.mp3", "voice/item-car.mp3", "voice/item-cube.mp3", "voice/item-cup.mp3", "voice/item-flower.mp3", "voice/item-gift.mp3", "voice/item-house.mp3", "voice/item-lollipop.mp3", "voice/item-mitten.mp3", "voice/item-pencil.mp3", "voice/item-rocket.mp3", "voice/item-star.mp3", "voice/item-tshirt.mp3", "voice/item-tulip.mp3", "voice/item-umbrella.mp3", "voice/letter-a.mp3", "voice/letter-b.mp3", "voice/letter-ch.mp3", "voice/letter-d.mp3", "voice/letter-e.mp3", "voice/letter-f.mp3", "voice/letter-g.mp3", "voice/letter-h.mp3", "voice/letter-i.mp3", "voice/letter-ikr.mp3", "voice/letter-k.mp3", "voice/letter-l.mp3", "voice/letter-m.mp3", "voice/letter-n.mp3", "voice/letter-o.mp3", "voice/letter-p.mp3", "voice/letter-r.mp3", "voice/letter-s.mp3", "voice/letter-sch.mp3", "voice/letter-sh.mp3", "voice/letter-t.mp3", "voice/letter-ts.mp3", "voice/letter-u.mp3", "voice/letter-v.mp3", "voice/letter-ya.mp3", "voice/letter-ye.mp3", "voice/letter-yu.mp3", "voice/letter-z.mp3", "voice/letter-zh.mp3", "voice/praise-1.mp3", "voice/praise-2.mp3", "voice/praise-3.mp3", "voice/praise-4.mp3", "voice/say-count.mp3", "voice/say-find.mp3", "voice/say-less.mp3", "voice/say-math-miss.mp3", "voice/say-math.mp3", "voice/say-mix-less.mp3", "voice/say-mix-more.mp3", "voice/say-more.mp3", "voice/say-next.mp3", "voice/say-num-less.mp3", "voice/say-num-more.mp3", "voice/say-odd.mp3", "voice/say-pairs.mp3", "voice/say-sign.mp3", "voice/say-sort-down.mp3", "voice/say-sort-up.mp3", "voice/try-1.mp3", "voice/try-2.mp3", "voice/try-3.mp3"];
self.addEventListener('install', function (e) {
  e.waitUntil(caches.open(CACHE).then(function (c) { return c.addAll(['./'].concat(FILES)); }).then(function () { return self.skipWaiting(); }));
});
self.addEventListener('activate', function (e) {
  e.waitUntil(caches.keys().then(function (ks) { return Promise.all(ks.filter(function (k) { return k !== CACHE; }).map(function (k) { return caches.delete(k); })); }).then(function () { return self.clients.claim(); }));
});
self.addEventListener('fetch', function (e) {
  if (e.request.method !== 'GET') return;
  e.respondWith(caches.match(e.request, { ignoreSearch: true }).then(function (hit) {
    return hit || fetch(e.request).then(function (res) {
      if (res.ok && (e.request.url.indexOf(self.location.origin) === 0 || e.request.url.indexOf('fonts.g') > 0)) {
        var copy = res.clone(); caches.open(CACHE).then(function (c) { c.put(e.request, copy); });
      }
      return res;
    });
  }));
});
