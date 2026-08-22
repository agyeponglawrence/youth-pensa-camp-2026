/* ================================================================
   Youth & Pensa Camp 2026 — offline shell
   ----------------------------------------------------------------
   The page installs to a home screen, so tapping that icon with no
   signal has to give something better than a dinosaur. This caches
   the shell — the page, the three fonts, the icons — so a repeat
   visit is instant and costs no data.

   Deliberately NOT cached: the six audio summaries, ~59 MB. Filling
   a teenager's phone without asking is not a feature. They are not
   intercepted at all, so range requests and seeking behave exactly
   as they do without a service worker.

   Navigations are network-first. That matters: cache-first on HTML
   is how a service worker strands everyone on a version from three
   weeks ago with no way to update. Online readers always get the
   live page; the cache is only the fallback.
   ================================================================ */

const VERSION = "ypc2026-v1";
const SHELL = [
  "./",
  "./index.html",
  "./manifest.webmanifest",
  "./fonts/karla.woff2",
  "./fonts/fraunces.woff2",
  "./fonts/jetbrains-mono.woff2",
  "./icon-192.png",
  "./icon-512.png",
  "./icon-maskable-512.png"
];

self.addEventListener("install", e=>{
  e.waitUntil((async()=>{
    const c = await caches.open(VERSION);
    /* one bad URL must not fail the whole install */
    await Promise.allSettled(SHELL.map(u=> c.add(new Request(u, {cache:"reload"}))));
    self.skipWaiting();
  })());
});

self.addEventListener("activate", e=>{
  e.waitUntil((async()=>{
    const keys = await caches.keys();
    await Promise.all(keys.filter(k=> k !== VERSION).map(k=> caches.delete(k)));
    await self.clients.claim();
  })());
});

self.addEventListener("fetch", e=>{
  const req = e.request;
  if(req.method !== "GET") return;

  const url = new URL(req.url);
  if(url.origin !== location.origin) return;        /* nothing third-party to cache */
  if(url.pathname.startsWith("/audio/")) return;    /* stream it, never store it */

  /* HTML: network first, fall back to the cached copy when offline */
  if(req.mode === "navigate"){
    e.respondWith((async()=>{
      try{
        const fresh = await fetch(req);
        const c = await caches.open(VERSION);
        c.put("./index.html", fresh.clone());
        return fresh;
      }catch(err){
        const c = await caches.open(VERSION);
        return (await c.match("./index.html")) || (await c.match("./")) || Response.error();
      }
    })());
    return;
  }

  /* everything else in the shell: cache first, refill in the background */
  e.respondWith((async()=>{
    const c = await caches.open(VERSION);
    const hit = await c.match(req);
    if(hit) return hit;
    try{
      const fresh = await fetch(req);
      if(fresh.ok && fresh.type === "basic") c.put(req, fresh.clone());
      return fresh;
    }catch(err){
      return hit || Response.error();
    }
  })());
});
