// 發佈版：由 tools/build_pwa.py 從專案根目錄的 sw.js 產生（版本 b3edf54ee27a），請改範本後重新 build，不要直接改這個檔。
// 異陣對決：Service Worker（安裝成 App 之後，同一台裝置的模式離線也能玩：輪流玩、對戰電腦、圖鑑、筆記）
//
// 兩種版本：
// - 開發版（專案根目錄的這個檔：VERSION = 'dev'、PRECACHE = null）：一律先抓網路，改了檔案重新整理就看得到；
//   連不上伺服器時才拿上次存下的檔案（在 http://localhost 也能試離線）。
// - 發佈版（dist/sw.js，由 tools/build_pwa.py 產生）：寫入 VERSION（所有檔案的雜湊）與 PRECACHE（App 外殼的檔案清單）。
//   安裝時一次下載好，之後直接從手機裡開啟（不用等網路、離線也能玩）。網站換成新版後，瀏覽器發現 sw.js 變了，
//   就在背景下載整套新版、接手（ui.js 收到 controllerchange 會跳「已更新」通知），下次開啟時就是新版。
//
// 各種請求怎麼處理（發佈版）：
// - /api/*（server.py 的兩台裝置連線）、非 GET、Range、範圍外的網址（例如網路對戰的 0.peerjs.com）：完全不碰，直接走網路
// - 開啟遊戲頁面（./ 或 ./index.html）：快取優先。頁面與 js/css 永遠來自「同一版」的快取，不會新舊混用；
//   新版靠上面的 sw.js 更新流程整套換掉。這樣手機在訊號差的地方也能馬上開啟，不用等網路逾時。
// - 外殼檔案（PRECACHE 清單：js、語言檔、css、圖示、manifest）：快取優先。同一個 VERSION 的內容不會變，
//   所以不必在背景重抓；更新一律整套換版。
// - 角色立繪 art/heroes/*：不放進外殼（換版時不用整套重抓，安裝也不會因為一張圖失敗而卡住），另存在跨版本的 ART 快取，
//   之後直接用快取。第一次開啟時首頁的立繪在 sw.js 註冊之前就載入了（不會經過這裡），所以安裝時再照 ART_URLS
//   把還沒存的補存一份（多半直接來自瀏覽器剛下載的快取；最多等 ART_WAIT 毫秒，失敗或太慢都不影響安裝）；
//   之後看到的圖也會順手存起來。網址含 ?v=（換圖時會變），同一張圖存了新版本就刪掉舊版本；最多存 ART_MAX 張。
// - Google Fonts（標題字型）：先給存下的、同時在背景更新（stale-while-revalidate），不透明（opaque）回應也存。
// - 其他同網域的檔案（不在清單裡）：先給存下的、同時在背景更新；遊戲頁以外的其他頁面：先抓網路、斷線用存下的。
'use strict';

const VERSION = 'b3edf54ee27a';   // 由 tools/build_pwa.py 產生
const PRECACHE = [
  ["index.html", "45af34e6ebf11273"],
  ["art/manifest.js", "4ddfd65e57a75b0e"],
  ["art/prompts.js", "f90dc6e281b72347"],
  ["css/cards.css", "89442767484f9080"],
  ["icons/apple-touch-icon.png", "2b2bc5721dc073db"],
  ["icons/favicon-32.png", "843664602ce3ce72"],
  ["icons/favicon-64.png", "2adb8d1ba04e386f"],
  ["icons/icon-192.png", "8a64777a62f6251f"],
  ["icons/icon-512.png", "2b682aa57648338d"],
  ["icons/maskable-512.png", "4d1dec943f0f3d61"],
  ["js/ai.js", "576dfa9e1d8a2fa9"],
  ["js/codex.js", "16bbec13eb20b6dd"],
  ["js/data.js", "9238d8b1a2503779"],
  ["js/engine.js", "01044ce974b19fdf"],
  ["js/fx.js", "f772f062c7a01d09"],
  ["js/i18n.js", "be596b04f02f0e6c"],
  ["js/lang/en.codex.js", "b05a2e8d2407a52f"],
  ["js/lang/en.data.js", "78a53804d89cdd0c"],
  ["js/lang/en.msg.js", "b2f3bd7db43de22e"],
  ["js/lang/en.ui.js", "19667d054f52208b"],
  ["js/lang/fr.codex.js", "6612e07120366296"],
  ["js/lang/fr.data.js", "b0c38e5ecc1cfcfd"],
  ["js/lang/fr.msg.js", "799aa10760ada125"],
  ["js/lang/fr.ui.js", "4034b7caf8b5c26b"],
  ["js/lang/manifest.js", "1ec540c716c06416"],
  ["js/lang/zh.ui.js", "16bb774a51667296"],
  ["js/net.js", "17a8d822a1983990"],
  ["js/p2p.js", "02d68dc21a9f3974"],
  ["js/peerjs.min.js", "7604d8c31bec4f13"],
  ["js/tutorial.js", "57f392809dca9d70"],
  ["js/ui.js", "29413ee40cd684c8"],
  ["manifest.webmanifest", "f2ef1085ddb2bb3a"]
];
const WARM = ["https://fonts.googleapis.com/css2?family=Noto+Serif+TC:wght@900&display=swap&text=%E7%95%B0%E9%99%A3%E5%B0%8D%E6%B1%BA%E7%AC%AC%E5%9B%9E%E5%90%88%E9%A0%90%E5%88%A4%E9%98%B2%E7%A6%A6%E9%80%9F%E5%BA%A6%E5%88%A4%E5%AE%9A%E5%87%BA%E6%8B%9B%E6%9C%AB%E7%B5%90%E7%AE%97%E5%8B%9D%E5%88%A9%E5%B9%B3%E6%89%8B%E4%BD%A0%E8%B4%8F%E4%BA%86%E8%BC%B8%E7%A6%81%E7%94%A8%E9%9A%8E%E6%AE%B5%E8%BC%AA%E6%8A%BD%E9%81%B8%E8%A7%92%E7%9B%B2%E5%8D%80%E4%BD%88%E9%99%A3%E6%9A%97%E4%BB%98%E5%B0%8D%E6%88%B0%E7%B5%90%E6%9D%9F%E5%90%8C%E6%99%82%E6%8F%AD%E6%9B%89%E9%96%8B%E5%A7%8B%E8%AB%8B%E6%8A%8A%E8%A3%9D%E7%BD%AE%E4%BA%A4%E7%B5%A6%E4%B8%8B%E4%B8%80%E4%BA%8C%E4%B8%89%E5%9B%9B%E4%BA%94%E5%85%AD%E4%B8%83%E5%85%AB%E4%B9%9D%E5%8D%81%E3%80%81%EF%BC%81"];
const ART_URLS = [
  "art/heroes/eater.webp?v=1090074117",
  "art/heroes/golem.webp?v=1653427871",
  "art/heroes/fish.webp?v=1162893864",
  "art/heroes/wuxing.webp?v=405941812",
  "art/heroes/princess.webp?v=677368839",
  "art/heroes/giant.webp?v=3699026921",
  "art/heroes/dragon.webp?v=1261566119",
  "art/heroes/pingpong.webp?v=2301271412",
  "art/heroes/michelin.webp?v=2640116040",
  "art/heroes/onepunch.webp?v=784721914",
  "art/heroes/assassin.webp?v=1985030375",
  "art/heroes/dogger.webp?v=4096797674",
  "art/heroes/inkmage.webp?v=2664896719",
  "art/heroes/vampire.webp?v=602921631",
  "art/heroes/ghost.webp?v=3678179387",
  "art/heroes/judge.webp?v=2766776600",
  "art/heroes/smith.webp?v=3228061115",
  "art/heroes/monk.webp?v=2042287323",
  "art/heroes/hawk.webp?v=1037335455",
  "art/heroes/icecap.webp?v=2879881716",
  "art/heroes/icequeen.webp?v=851009688",
  "art/heroes/saint.webp?v=596866244",
  "art/heroes/swordsman.webp?v=1337515242",
  "art/heroes/pirate.webp?v=2262174089",
  "art/heroes/m_cult.webp?v=1272996593",
  "art/heroes/m_gun.webp?v=3131119612",
  "art/heroes/m_shield.webp?v=335581835",
  "art/heroes/m_star.webp?v=3088622265"
];

const SCOPE = self.registration.scope;     // 例如 https://user.github.io/repo/
const BASE = new URL(SCOPE).pathname;      // 例如 /repo/
// 同一個網域可能放好幾個 App（例如 user.github.io/a/ 與 /b/），快取放在同一個儲存空間 → 名稱帶上路徑，只清自己的
const PREFIX = 'yzdj ' + BASE + ' ';
const SHELL = PREFIX + 'shell-' + VERSION;       // App 外殼（隨版本整套更換）
const RUNTIME = PREFIX + 'runtime-' + VERSION;   // 其他零星檔案（換版時一起清掉）
const ART = PREFIX + 'art';                      // 角色立繪（跨版本保留，用 ?v= 區分新舊）
const FONTS = PREFIX + 'fonts';                  // Google Fonts（跨版本保留）
const ART_MAX = 60, FONTS_MAX = 30, RUNTIME_MAX = 100;
const ART_WAIT = 30000;   // 安裝時補存立繪最多等多久（毫秒）

const abs = path => new URL(path, SCOPE).href;

// ---------- 安裝：下載整個 App 外殼 ----------
self.addEventListener('install', ev => {
  self.skipWaiting();   // 下載完立刻接手（不等舊頁面關閉）；頁面不會自己重新整理，下次開啟才是新版
  if (PRECACHE) ev.waitUntil(precache().then(() => Promise.all([warmFonts(), warmArt()])));
});

async function precache() {
  const cache = await caches.open(SHELL);
  // 上次安裝到一半（例如網路斷掉）已經存好的檔案不用重抓：同一個 VERSION 的內容不會變
  const have = new Set((await cache.keys()).map(r => r.url));
  const todo = PRECACHE.filter(([path]) => !have.has(abs(path)));
  let i = 0;
  const worker = async () => {
    while (i < todo.length) {
      const [path, hash] = todo[i++];
      await cache.put(abs(path), await fetchExact(path, hash));
    }
  };
  await Promise.all(Array.from({ length: 6 }, worker));   // 一次抓 6 個
}

// 下載一個外殼檔案，並確認內容就是這一版（比對 build 時算好的雜湊）：
// 先用 no-cache（向伺服器確認，沒變就不重新下載）；內容不對（瀏覽器或 CDN 還留著舊檔）就加 ?__v= 強制重抓一次；
// 還是不對（例如主機自動在 HTML 插入統計程式）就照收，不讓安裝卡住。
async function fetchExact(path, hash) {
  const url = abs(path);
  let res = await fetch(url, { cache: 'no-cache' });
  let body = await okBody(res, url);
  const got = await digest(body);
  if (got && got !== hash) {
    res = await fetch(url + (url.includes('?') ? '&' : '?') + '__v=' + hash, { cache: 'reload' });
    body = await okBody(res, url);
  }
  // 重新包裝成乾淨的回應：去掉轉址標記與 ?__v= 網址（Cloudflare Pages 會把 index.html 轉址到 ./），
  // 只留 Content-Type（body 已經解壓縮，不能帶 Content-Encoding／Content-Length）
  const headers = { 'Content-Type': res.headers.get('Content-Type') || 'application/octet-stream' };
  return new Response(body, { status: 200, statusText: 'OK', headers });
}

async function okBody(res, url) {
  if (!res.ok) throw new Error('precache ' + res.status + ' ' + url);
  return res.arrayBuffer();
}

async function digest(buf) {
  if (!(self.crypto && crypto.subtle)) return '';   // 不能算雜湊就不檢查
  const h = new Uint8Array(await crypto.subtle.digest('SHA-256', buf));
  return Array.from(h.slice(0, 8), b => b.toString(16).padStart(2, '0')).join('');
}

// 標題字型（Google Fonts）：樣式表與字型檔先存起來。只是加分項目：最多等 10 秒，失敗或太慢都不影響安裝
async function warmFonts() {
  if (!WARM.length) return;
  const job = (async () => {
    const cache = await caches.open(FONTS);
    for (const css of WARM) {
      if (await cache.match(css, { ignoreVary: true })) continue;
      const res = await fetch(css, { mode: 'cors', credentials: 'omit' });
      if (!res.ok) continue;
      const text = await res.clone().text();
      await cache.put(css, res);
      for (const m of text.matchAll(/url\((['"]?)(https:\/\/fonts\.gstatic\.com\/[^)'"]+)\1\)/g)) {
        if (await cache.match(m[2], { ignoreVary: true })) continue;
        const font = await fetch(m[2], { mode: 'cors', credentials: 'omit' });
        if (font.ok) await cache.put(m[2], font);
      }
    }
  })();
  await Promise.race([job.catch(() => {}), new Promise(r => setTimeout(r, 10000))]);
}

// 角色立繪：把 ART_URLS 裡還沒存的補存起來（第一次開啟時首頁已經載入過，通常直接來自瀏覽器的快取，不會再下載一次）。
// 只是加分項目：單張失敗就略過，最多等 ART_WAIT；沒補到的圖，之後連網時看到會再存
async function warmArt() {
  if (!ART_URLS.length) return;
  const job = (async () => {
    const cache = await caches.open(ART);
    const have = new Set((await cache.keys()).map(r => r.url));
    const todo = ART_URLS.map(abs).filter(u => !have.has(u));
    let i = 0;
    const worker = async () => {
      while (i < todo.length) {
        const url = todo[i++];
        try {
          const res = await fetch(url);
          if (res.ok && res.type === 'basic') await keepPortrait(cache, new URL(url), res);
        } catch (e) { /* 這張下次再說 */ }
      }
    };
    await Promise.all(Array.from({ length: 4 }, worker));   // 一次抓 4 張
  })();
  await Promise.race([job.catch(() => {}), new Promise(r => setTimeout(r, ART_WAIT))]);
}

// ---------- 啟用：清掉自己的舊版快取，接管已開啟的頁面 ----------
self.addEventListener('activate', ev => {
  ev.waitUntil((async () => {
    const keep = [SHELL, RUNTIME, ART, FONTS];
    for (const name of await caches.keys()) {
      if (name.startsWith(PREFIX) && !keep.includes(name)) await caches.delete(name);
    }
    await self.clients.claim();
  })());
});

// 測試與除錯用：頁面送 'version' 過來就回報目前版本
self.addEventListener('message', ev => {
  if (ev.data !== 'version') return;
  const msg = { type: 'version', version: VERSION };
  if (ev.ports && ev.ports[0]) ev.ports[0].postMessage(msg);
  else if (ev.source) ev.source.postMessage(msg);
});

// ---------- 請求 ----------
self.addEventListener('fetch', ev => {
  const req = ev.request;
  if (req.method !== 'GET') return;
  if (req.cache === 'only-if-cached' && req.mode !== 'same-origin') return;   // 開發者工具的特殊請求
  const url = new URL(req.url);
  if (url.origin === self.location.origin) {
    if (url.pathname.includes('/api/')) return;                        // 兩台裝置連線（server.py）：完全不碰
    if (!url.pathname.startsWith(BASE) || req.headers.has('range')) return;
    if (!PRECACHE) ev.respondWith(networkFirst(ev, RUNTIME));          // 開發版
    else if (req.mode === 'navigate') ev.respondWith(openPage(ev, url));
    else if (url.pathname.startsWith(BASE + 'art/heroes/')) ev.respondWith(portrait(ev, url));
    else ev.respondWith(shellFile(ev));
  } else if (url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com') {
    ev.respondWith(staleWhileRevalidate(ev, FONTS, FONTS_MAX));
  }
});

// 開啟遊戲：./、./index.html（含 ?參數）一律給這一版存好的 index.html
async function openPage(ev, url) {
  const rel = url.pathname.slice(BASE.length);
  if (rel === '' || rel === 'index.html') {
    const hit = await (await caches.open(SHELL)).match(abs('index.html'), { ignoreVary: true });
    if (hit) return hit;
  }
  return networkFirst(ev, RUNTIME);
}

async function shellFile(ev) {
  const hit = await (await caches.open(SHELL)).match(ev.request, { ignoreVary: true });
  return hit || staleWhileRevalidate(ev, RUNTIME, RUNTIME_MAX);
}

// 角色立繪：快取優先；離線又沒看過 → 讓圖片載入失敗（ui.js 會改顯示表情符號）
async function portrait(ev, url) {
  const cache = await caches.open(ART);
  const hit = await cache.match(ev.request, { ignoreVary: true });
  if (hit) return hit;
  let res;
  try { res = await fetch(ev.request); } catch (e) { return Response.error(); }
  if (res.ok && res.type === 'basic') {
    const copy = res.clone();
    ev.waitUntil(keepPortrait(cache, url, copy).catch(() => {}));
  }
  return res;
}

async function keepPortrait(cache, url, res) {
  for (const k of await cache.keys()) {   // 同一張圖的舊版本（?v= 不同）
    const u = new URL(k.url);
    if (u.pathname === url.pathname && u.search !== url.search) await cache.delete(k);
  }
  await cache.put(url.href, res);
  await trim(cache, ART_MAX);
}

// 先給存下的、同時在背景更新；沒存過就等網路
function staleWhileRevalidate(ev, name, max) {
  const req = ev.request;
  const net = fetch(req);
  // 不透明回應（跨網域、沒有 CORS，例如 Google Fonts 的樣式表）看不到狀態碼，也照存
  ev.waitUntil(net.then(res => {
    if (!(res.ok || res.type === 'opaque')) return;
    const copy = res.clone();
    return caches.open(name).then(c => c.put(req, copy).then(() => trim(c, max)));
  }).catch(() => {}));
  return caches.open(name)
    .then(c => c.match(req, { ignoreVary: true }))
    .then(hit => hit || net)
    .catch(() => Response.error());
}

// 先抓網路（成功就存一份）；連不上才用存下的
async function networkFirst(ev, name) {
  const req = ev.request;
  try {
    const res = await fetch(req);
    if (res.ok && res.type === 'basic') {
      const copy = res.clone();
      ev.waitUntil(caches.open(name).then(c => c.put(req, copy).then(() => trim(c, RUNTIME_MAX))).catch(() => {}));
    }
    return res;
  } catch (e) {
    const cache = await caches.open(name);
    const hit = await cache.match(req, { ignoreVary: true }) ||
      (req.mode === 'navigate' ? await cache.match(req, { ignoreVary: true, ignoreSearch: true }) : undefined);
    if (hit) return hit;
    return req.mode === 'navigate' ? offlinePage() : Response.error();
  }
}

async function trim(cache, max) {
  const keys = await cache.keys();   // 依存入順序：先刪最舊的
  for (let i = 0; i < keys.length - max; i++) await cache.delete(keys[i]);
}

function offlinePage() {
  const html = '<!doctype html><html lang="zh-Hant"><meta charset="utf-8">' +
    '<meta name="viewport" content="width=device-width, initial-scale=1"><title>異陣對決</title>' +
    '<body style="margin:0;padding:48px 16px;background:#0b0e1c;color:#e8e6f0;font:16px/1.7 sans-serif;text-align:center">' +
    '<p>目前離線，這個頁面還沒有存在這台裝置上。<br>Offline · Hors ligne</p>' +
    '<p><a style="color:#e8c26b" href="' + SCOPE + '">回到遊戲 · Back to the game · Retour au jeu</a></p></body></html>';
  return new Response(html, { status: 503, headers: { 'Content-Type': 'text/html; charset=utf-8' } });
}
