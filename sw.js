// Service worker : permet d'ouvrir l'app et de pratiquer hors connexion.
// Pense à changer VERSION à chaque mise à jour des fichiers pour rafraîchir le cache.
const VERSION = "yds-v3";
const FILES = [
  "./",
  "index.html",
  "manifest.webmanifest",
  "css/styles.css",
  "js/app.js",
  "js/store.js",
  "js/tts.js",
  "js/ui.js",
  "js/player.js",
  "js/sequences.js",
  "js/import.js",
  "js/data/yin-yoga.js",
  "assets/icon.svg",
  "assets/icon-180.png",
  "assets/icon-192.png",
  "assets/icon-512.png",
];

// Photos des postures : mises en cache une par une, une absence ne bloque pas l'installation
const IMAGES = [
  "assets/postures/banane.webp",
  "assets/postures/bebe-heureux.webp",
  "assets/postures/cerf-endormi-support.webp",
  "assets/postures/cerf-endormi.webp",
  "assets/postures/chat-queue.webp",
  "assets/postures/chenille-support.webp",
  "assets/postures/chenille.webp",
  "assets/postures/cloche.webp",
  "assets/postures/coeur-fondant-support.webp",
  "assets/postures/coeur-fondant.webp",
  "assets/postures/cygne-support.webp",
  "assets/postures/cygne.webp",
  "assets/postures/demi-papillon-support.webp",
  "assets/postures/demi-papillon.webp",
  "assets/postures/diamant-support.webp",
  "assets/postures/diamant.webp",
  "assets/postures/double-pigeon-support.webp",
  "assets/postures/double-pigeon.webp",
  "assets/postures/enfant-support.webp",
  "assets/postures/enfant.webp",
  "assets/postures/escargot.webp",
  "assets/postures/grenouille-support.webp",
  "assets/postures/grenouille.webp",
  "assets/postures/guirlande.webp",
  "assets/postures/heros-couche.webp",
  "assets/postures/jambes-mur.webp",
  "assets/postures/lacet-support.webp",
  "assets/postures/lacet.webp",
  "assets/postures/lezard-support.webp",
  "assets/postures/lezard.webp",
  "assets/postures/libellule-support.webp",
  "assets/postures/libellule.webp",
  "assets/postures/papillon-allonge.webp",
  "assets/postures/papillon-support.webp",
  "assets/postures/papillon.webp",
  "assets/postures/savasana.webp",
  "assets/postures/sphinx-support.webp",
  "assets/postures/sphinx.webp",
  "assets/postures/torsion-dos.webp",
];

self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open(VERSION)
      .then((c) => c.addAll(FILES).then(() => Promise.allSettled(IMAGES.map((u) => c.add(u)))))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== VERSION).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  // Ne jamais mettre en cache les appels à l'API IA
  if (url.hostname === "api.anthropic.com") return;
  // Réseau d'abord (pour recevoir les mises à jour), cache en secours hors ligne
  e.respondWith(
    fetch(req)
      .then((res) => {
        if (res.ok && (url.origin === location.origin || url.hostname.includes("fonts.g"))) {
          const copy = res.clone();
          caches.open(VERSION).then((c) => c.put(req, copy));
        }
        return res;
      })
      .catch(() => caches.match(req).then((r) => r || caches.match("index.html")))
  );
});
