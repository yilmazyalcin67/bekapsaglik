// BEKAPSAĞLIK — internetsiz çalışma için önbellek. Hiçbir veri dışarı gönderilmez.
const KASA = "bekapsaglik-v4";
const DOSYALAR = ["./", "./index.html", "./manifest.json", "./ikon-180.png", "./ikon-192.png", "./ikon-512.png", "./ikon-512-maskable.png", "./zxing_okuyucu.js", "./zxing_reader.wasm", "./ilac_listesi.json"];
self.addEventListener("install", e => { e.waitUntil(caches.open(KASA).then(c => c.addAll(DOSYALAR)).then(() => self.skipWaiting())); });
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== KASA).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
// Önce ağ (güncelleme gelsin), ağ yoksa önbellek
self.addEventListener("fetch", e => {
  if(e.request.method !== "GET") return;
  e.respondWith(fetch(e.request).then(r => { const k = r.clone(); caches.open(KASA).then(c => c.put(e.request, k)); return r; })
    .catch(() => caches.match(e.request, {ignoreSearch:true}).then(r => r || caches.match("./index.html"))));
});
self.addEventListener("notificationclick", e => {
  e.notification.close();
  e.waitUntil(self.clients.matchAll({type:"window", includeUncontrolled:true}).then(cs => {
    for(const c of cs){ if("focus" in c) return c.focus(); }
    return self.clients.openWindow("./index.html");
  }));
});
