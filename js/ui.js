// 《異陣對決》介面
(function () {
  const E = GAME.Engine, D = GAME.DATA, AI = GAME.AI, Net = GAME.Net, FX = GAME.FX, SFX = GAME.SFX;
  // 多語系：介面文字用 t('key', { 變數 })，文字放在 js/lang/<語言>.ui.js
  const I = GAME.I18N;
  const t = (k, v) => I.t(k, v);
  const app = document.getElementById('app');
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const LS = {
    get(k) { try { return JSON.parse(localStorage.getItem(k)); } catch (e) { return null; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* 無痕模式等 */ } },
    del(k) { try { localStorage.removeItem(k); } catch (e) { /* ignore */ } },
  };
  const K_LOCAL = 'yzdj_local_v1', K_ONLINE = 'yzdj_online_v1', K_NAMES = 'yzdj_names_v1', K_CID = 'yzdj_cid_v1', K_SOUND = 'yzdj_sound_v1', K_SPEED = 'yzdj_speed_v1';
  // 提示模式（guided 攻略：顯示克制與連攜／challenge 挑戰：隱藏）與「我的發現」筆記，都只存在這台裝置
  const K_HINTS = 'yzdj_hints_v1', K_NOTES = 'yzdj_notes_v1';
  // 大廳上次選的連線方式（'p2p' 網路／'lan' 同一個 Wi-Fi 的 server.py）
  const K_NET = 'yzdj_net_v1';
  // 只屬於這個分頁的資料（sessionStorage）：連線中的房間每個分頁各記一份，同一台電腦開兩個分頁測試、重新整理時不會互相蓋掉
  const SS = {
    get(k) { try { return JSON.parse(sessionStorage.getItem(k)); } catch (e) { return null; } },
    set(k, v) { try { sessionStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* ignore */ } },
    del(k) { try { sessionStorage.removeItem(k); } catch (e) { /* ignore */ } },
  };
  // 連線中的房間：這個分頁的（重新整理後）優先，其次是這台裝置最後一次的（App 關掉再開）
  const savedOnline = () => SS.get(K_ONLINE) || LS.get(K_ONLINE);
  function saveOnline(on) { LS.set(K_ONLINE, on); SS.set(K_ONLINE, on); }
  function clearOnline() { LS.del(K_ONLINE); SS.del(K_ONLINE); }
  const rand32 = () => {
    if (window.crypto && crypto.getRandomValues) return crypto.getRandomValues(new Uint32Array(1))[0] | 0;
    return (Math.random() * 4294967296) | 0;
  };
  // 階段、目標、距離的名稱（隨語言切換，所以用函式取）
  const PHASE = ['ban', 'draft', 'deploy', 'plan', 'over'];
  const phaseName = k => (PHASE.includes(k) ? t('phase_' + k) : '');
  const TGT_TXT = ['enemy', 'ally', 'allyFront', 'allyHero', 'cell', 'self'];
  const tgtName = k => (TGT_TXT.includes(k) ? t('tgt_' + k) : '');
  const RNG_TXT = ['melee', 'ranged', 'back'];
  const rngName = k => (RNG_TXT.includes(k) ? t('rng_' + k) : undefined);
  // 分隔符號：清單用「、」，項目之間用「・」
  const SEP = () => t('sep_dot'), LIST = arr => arr.join(t('sep_list'));
  // 類型標籤：小兵顯示陣營「小兵」，英雄顯示類型
  const typeLabel = d => (d.minion ? I.factionName('小兵') : I.typeName(d.type));
  // 預設玩家名稱：如果名字還是某個語言的預設名稱（玩家1、電腦…），就顯示目前語言的版本
  const defName = i => t(i ? 'p2' : 'p1');
  const DEF_NAME_KEYS = [['p1', 'host_name'], ['p2', 'ai_name', 'guest_name']];
  const locName = (n, i) => {
    const k = (DEF_NAME_KEYS[i] || []).find(key => Object.keys(I.LANGS).some(l => (((I.packs[l] || {}).ui || {})[key]) === n));
    return k ? t(k) : n;
  };
  const fixNames = names => names.map(locName);
  const GLYPH = {
    pr_fire: '🔥', pr_tri: '➶', iq_palm: '❄️', wx_wood: '🌿', hk_claw: '🪶', hk_flame: '🔥', hk_elite: '🪶',
    gm_will: '🪨', jd_torture: '⚖️', gh_soul: '👻', gh_orb: '🔮', ink_fist: '🖋️', dg_tears: '💧', as_stab: '🗡️',
    pk_hook: '⚓', mc_wheel: '⚙️', pp_drive: '🏓', pp_smash: '🏓', st_spear: '🔱', dr_breath: '🔥', mn_shoot: '💥',
    fs_mock: '🐟', bat: '🦇', gpirate: '☠️', statue: '🪨',
  };
  const AOE_CLS = { pr_blast: 'fire', iq_blizzard: 'ice', fs_iam: 'abyss', mc_boom: 'fire', st_light: 'holy' };

  const ui = {
    screen: 'home', mode: null, sides: [], S: null, seed: 0, names: [defName(0), defName(1)], actions: [],
    coverKey: null, modal: null, plan: null, sel: null, targeting: null, dep: null,
    pb: null, pbSpeed: LS.get(K_SPEED) || 1, playedResolved: 0, aiTimer: null, toastTimer: null, busy: false,
    room: null, role: null, cid: null, on: null, netOk: true, netErr: '', lobby: {}, celebrated: null,
    cx: { q: '', tab: 'heroes', f: '', t: '', c: '', r: '' }, cxBack: 'home',
    hints: LS.get(K_HINTS) === 'challenge' ? 'challenge' : 'guided', note: null, noteSeq: 0,
  };
  const guided = () => ui.hints !== 'challenge';
  SFX.on = LS.get(K_SOUND) !== false;
  // 每個分頁一個玩家 ID（同一台電腦開兩個分頁也能測試）
  try { ui.cid = sessionStorage.getItem(K_CID); } catch (e) { /* ignore */ }
  if (!ui.cid) ui.cid = 'c' + (rand32() >>> 0).toString(36);
  try { sessionStorage.setItem(K_CID, ui.cid); } catch (e) { /* ignore */ }
  const saved = LS.get(K_NAMES);
  if (saved && saved.length === 2) ui.names = fixNames(saved);

  // ================= 共用 =================
  function toast(msg) {
    let el = document.getElementById('toast');
    if (!el) { el = document.createElement('div'); el.id = 'toast'; document.body.appendChild(el); }
    el.textContent = msg;
    el.className = 'show';
    clearTimeout(ui.toastTimer);
    ui.toastTimer = setTimeout(() => (el.className = ''), 2200);
  }
  // ---------- 安裝成 App（PWA）----------
  // 放在 https 網站（GitHub Pages、Netlify、Cloudflare Pages）上時：註冊 Service Worker（sw.js）讓單機模式離線也能玩、
  // 首頁顯示「安裝成 App」按鈕（Android／電腦版 Chrome、Edge）或 iPhone 的「加入主畫面」提示；有新版本時跳通知。
  const LOCAL_HOSTS = ['localhost', '127.0.0.1', '[::1]', '::1'];
  const pwa = {
    prompt: null,       // beforeinstallprompt 事件（瀏覽器說可以安裝時才會有）
    installed: false,   // 這次已經安裝完成
    // 已經是從主畫面開啟的 App
    standalone: (() => { try { return matchMedia('(display-mode: standalone)').matches || matchMedia('(display-mode: fullscreen)').matches || navigator.standalone === true; } catch (e) { return false; } })(),
    // iPhone／iPad（iPadOS 會假裝是 Mac，用觸控點數判斷）：沒有安裝按鈕，只能從「分享」→「加入主畫面」
    ios: /iphone|ipad|ipod/i.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1),
    // App 內建的瀏覽器（LINE、Facebook、Instagram、微信、Android 的 WebView）：沒有「加入主畫面」也不能安裝，
    // 要先改用 Safari／Chrome 開啟同一個網址
    inapp: /\bLine\/|FBAN|FBAV|FB_IAB|Instagram|MicroMessenger|KAKAOTALK|; wv\)/i.test(navigator.userAgent),
    // 放在 https 網站上（不是本機、也不是區網的 server.py）：iPhone、App 內建瀏覽器的安裝提示只在網站版顯示
    hosted: location.protocol === 'https:' && !LOCAL_HOSTS.includes(location.hostname),
  };
  function registerSW() {
    if (!('serviceWorker' in navigator)) return;
    if (location.protocol !== 'https:' && !LOCAL_HOSTS.includes(location.hostname)) return;   // 區網 http、直接開檔案：不用
    const sw = navigator.serviceWorker;
    // 原本就有舊版 SW 在控制 → 之後換成新版才算「更新」；第一次安裝不通知
    const hadController = !!sw.controller;
    let notified = false;
    sw.addEventListener('controllerchange', () => {
      if (!hadController || notified) return;
      notified = true;
      toast(t('pwa_updated'));   // 不強制重新整理（可能正在對局），下次開啟就是新版
    });
    // 瀏覽器每次開啟時會自己檢查新版；手機上的 App 常常只是從背景切回來（不會重新開啟），
    // 所以切回前景、且距離上次檢查超過 30 分鐘時，再主動檢查一次
    const watch = r => {
      let last = Date.now();
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState !== 'visible' || Date.now() - last < 30 * 60 * 1000) return;
        last = Date.now();
        r.update().catch(() => { /* 離線：下次再說 */ });
      });
    };
    const reg = () => { try { sw.register('./sw.js', { scope: './' }).then(watch, () => { /* 沒有 sw.js 也照常玩 */ }); } catch (e) { /* ignore */ } };
    if (document.readyState === 'complete') reg(); else window.addEventListener('load', reg);
  }
  window.addEventListener('beforeinstallprompt', ev => {
    ev.preventDefault();   // 不讓瀏覽器自己跳出橫幅，改用首頁的按鈕
    pwa.prompt = ev;
    if (ui.screen === 'home' && !ui.modal) render();
  });
  window.addEventListener('appinstalled', () => {
    pwa.prompt = null;
    pwa.installed = true;
    if (ui.screen === 'home' && !ui.modal) render();
  });
  async function installApp() {
    const ev = pwa.prompt;
    if (!ev) return;
    pwa.prompt = null;   // 每個事件只能 prompt() 一次
    try {
      ev.prompt();
      const r = await ev.userChoice;
      if (r && r.outcome === 'accepted') pwa.installed = true;
    } catch (e) { /* ignore */ }
    if (ui.screen === 'home') render();
  }
  // 首頁按鈕列下方：可以安裝 → 按鈕；App 內建瀏覽器的網站版 → 先改用瀏覽器開啟；iPhone 的網站版 → 加入主畫面提示；
  // 已經是 App 或已安裝 → 不顯示
  function installLine() {
    if (pwa.standalone || pwa.installed) return '';
    if (pwa.prompt) return `<div class="pwa-line"><button class="btn" data-act="install">${t('pwa_install')}</button></div>`;
    if (pwa.inapp && pwa.hosted) return `<p class="pwa-hint" data-hint="inapp">${t('pwa_inapp_hint')}</p>`;
    if (pwa.ios && pwa.hosted) return `<p class="pwa-hint" data-hint="ios">${t('pwa_ios_hint')}</p>`;
    return '';
  }

  const pname = p => esc(ui.S ? locName(ui.S.names[p], p) : ui.names[p]);
  const pTag = p => `<span class="ptag p${p}">${pname(p)}</span>`;
  const uel = uid => app.querySelector(`[data-uid="${uid}"]`);

  // ---------- 立繪：卡片與圓形頭像 ----------
  const FAC_KEY = { '王室': 'royal', '北境': 'north', '深淵': 'abyss', '聖堂': 'temple', '小兵': 'minion' };
  const FAC_ICON = { '王室': '♛', '北境': '❄', '深淵': '☾', '聖堂': '✦', '小兵': '⚔' };
  const artOf = id => (GAME.ART || {})[id];
  const artSrc = a => a.src + (a.v ? '?v=' + a.v : '');
  // 載入失敗的立繪網址（例如離線又還沒存到這台裝置）：畫面重畫時照樣顯示表情符號／佔位圖，不會變回空白圓圈
  const failedArt = new Set();
  const artFailedPh = () => `<div class="hc-ph"><b>❔</b><small>${t('art_failed')}</small></div>`;
  const rarity = d => (d.cost >= 5 ? 'ssr' : d.cost >= 3 ? 'sr' : 'r');
  function heroCard(d, o) {
    o = o || {};
    const a = artOf(d.id);
    // 副標：中文版顯示英文稱號；其他語言顯示原本的中文名字
    const sub = I.lang === 'zh' ? (((GAME.ART_PROMPTS || {})[d.id] || {}).en || '') : d.n;
    const name = I.heroName(d.id);
    const ph = `<div class="hc-ph"><b>${d.icon}</b>${o.big ? `<small>${t('art_missing')}</small>` : ''}</div>`;
    const img = a && (failedArt.has(artSrc(a)) ? artFailedPh() :
      `<img class="hc-img" src="${artSrc(a)}" alt="${esc(name)}" style="--ar:${a.ar || 0.6};--fx:${a.fx === undefined ? 0.5 : a.fx};--fy:${a.fy === undefined ? 0.25 : a.fy}">`);
    return `<div class="hcard r-${rarity(d)} ${o.cls || ''}" ${o.attrs || ''} style="--fc:${D.FACTIONS[d.f].color};--i:${o.i || 0}">
      <div class="hc-in">
        <div class="hc-art bg-${FAC_KEY[d.f]}">${img || ph}</div>
        <div class="hc-cost">${d.cost}</div><div class="hc-rar">${rarity(d).toUpperCase()}</div>
        <div class="hc-plate"><span class="hc-fac">${FAC_ICON[d.f]}</span><div class="hc-name">${esc(name)}</div><div class="hc-en">${esc(sub)}</div></div>
        <div class="hc-stats"><span>❤ ${d.hp}</span><span>⚡ ${d.spd}</span><span class="ty">${typeLabel(d)}</span></div>
      </div>${o.extra || ''}</div>`;
  }
  // 圓形頭像：有立繪就依臉部位置裁切，沒有就用表情符號
  function face(key, icon, cls, style) {
    const a = artOf(key);
    const st = style ? ` style="${style}"` : '';
    if (!a) return `<span class="medal ${cls || ''}"${st}><i class="fb">${icon}</i></span>`;
    const fz = a.fz || 3, ar = a.ar || 0.6, fx = a.fx === undefined ? 0.5 : a.fx, fy = a.fy === undefined ? 0.2 : a.fy;
    const pos = `height:${(fz * 100).toFixed(1)}%;left:calc(50% - ${(fx * fz * ar * 100).toFixed(1)}%);top:calc(50% - ${(fy * fz * 100).toFixed(1)}%)`;
    const broken = failedArt.has(artSrc(a)) ? ' broken' : '';
    return `<span class="medal art${broken} ${cls || ''}"${st}><img src="${artSrc(a)}" alt="" style="${pos}"><i class="fb">${icon}</i></span>`;
  }
  // 立繪載入失敗時改顯示表情符號：記下網址（之後重畫畫面時 face()／heroCard() 照樣產生 broken／佔位圖，
  // 不然 FX.morph 會把 broken 拿掉、圖片又不會重新載入 → 變成空白圓圈），再直接改目前畫面上的這一個
  document.addEventListener('error', ev => {
    const img = ev.target;
    if (!img || img.tagName !== 'IMG') return;
    const src = img.getAttribute('src');
    if (src && (img.classList.contains('hc-img') || (img.parentNode && img.parentNode.classList.contains('art')))) failedArt.add(src);
    if (img.parentNode && img.parentNode.classList.contains('art')) img.parentNode.classList.add('broken');
    if (img.classList.contains('hc-img')) img.outerHTML = artFailedPh();
  }, true);
  // 網路恢復：失敗的立繪重新載入一次（還是失敗就又會記下來、改回表情符號）
  window.addEventListener('online', () => {
    if (!failedArt.size) return;
    failedArt.clear();
    app.querySelectorAll('.medal.art.broken').forEach(m => {
      m.classList.remove('broken');
      const img = m.querySelector('img');
      if (img) img.src = img.getAttribute('src');
    });
  });

  function need(p) {
    const S = ui.S;
    if (!S) return false;
    switch (S.phase) {
      case 'ban': return S.banOrder[S.banIdx] === p;
      case 'draft': return S.draftOrder[S.draftIdx] === p;
      case 'deploy': return !S.deploys[p];
      case 'plan': return !S.plans[p];
      default: return false;
    }
  }
  function actor() {
    const s = ui.sides.find(need);
    return s === undefined ? null : s;
  }
  const secret = () => ['deploy', 'plan'].includes(ui.S.phase);

  function saveLocal() {
    if (ui.mode === 'online' || !ui.S) return;
    LS.set(K_LOCAL, { mode: ui.mode, seed: ui.seed, names: ui.S.names, actions: ui.actions, meta: { round: ui.S.round, phase: ui.S.phase } });
  }

  function applied(a) {
    if (a.type === 'pick') SFX.play('pick');
    else if (a.type === 'ban') SFX.play('ban');
    else if (a.type === 'deploy' || a.type === 'plan') SFX.play('select');
  }
  function dispatch(a) {
    const err = E.validate(ui.S, a);
    if (err) { toast(err); return false; }
    if (ui.mode === 'online') {
      ui.busy = true;
      ui.room.send({ t: 'act', a, cid: ui.cid }).catch(() => { ui.busy = false; toast(t('toast_send_fail')); render(); });
      render();
      return true;
    }
    E.apply(ui.S, a);
    ui.actions.push(a);
    applied(a);
    saveLocal();
    afterApply();
    return true;
  }
  function afterApply() {
    const S = ui.S;
    if (S.resolved > ui.playedResolved && S.events.length) startPlayback();
    render();
    maybeAI();
  }

  function maybeAI() {
    if (ui.mode !== 'ai' || ui.pb || !ui.S || ui.aiTimer) return;
    if (!need(1)) return;
    ui.aiTimer = setTimeout(() => {
      ui.aiTimer = null;
      const S = ui.S;
      if (!need(1) || ui.pb) return;
      let a;
      if (S.phase === 'ban') a = { type: 'ban', p: 1, hero: AI.ban(S, 1) };
      else if (S.phase === 'draft') a = { type: 'pick', p: 1, hero: AI.pick(S, 1) };
      else if (S.phase === 'deploy') a = { type: 'deploy', p: 1, units: AI.deploy(S, 1) };
      else if (S.phase === 'plan') a = { type: 'plan', p: 1, actions: AI.plan(S, 1) };
      if (!a || E.validate(S, a)) { if (S.phase !== 'plan') return; a = { type: 'plan', p: 1, actions: [] }; }
      E.apply(S, a); ui.actions.push(a); if (a.type === 'pick') SFX.play('pick'); saveLocal(); afterApply();
    }, ui.S.phase === 'draft' ? 800 : 450);
  }

  // ================= 開始遊戲 =================
  function readNames() {
    const n0 = document.getElementById('n0'), n1 = document.getElementById('n1');
    if (n0) ui.names[0] = (n0.value || '').trim().slice(0, 10) || defName(0);
    if (n1) ui.names[1] = (n1.value || '').trim().slice(0, 10) || defName(1);
    LS.set(K_NAMES, ui.names);
  }
  function resetTransient() {
    ui.coverKey = null; ui.modal = null; ui.plan = null; ui.sel = null; ui.targeting = null; ui.dep = null;
    ui.pb = null; ui.busy = false; ui.celebrated = null;
    clearTimeout(ui.pbTimer); clearTimeout(ui.aiTimer); ui.aiTimer = null;
  }
  function startLocal(mode) {
    readNames();
    resetTransient();
    ui.mode = mode;
    ui.sides = mode === 'hotseat' ? [0, 1] : [0];
    ui.seed = rand32();
    const names = mode === 'ai' ? [ui.names[0], t('ai_name')] : ui.names.slice();
    ui.S = E.newGame(ui.seed, { names });
    ui.actions = [];
    ui.playedResolved = 0;
    ui.screen = 'game';
    saveLocal();
    render();
    maybeAI();
  }
  function resumeLocal() {
    const sv = LS.get(K_LOCAL);
    if (!sv) return;
    resetTransient();
    ui.mode = sv.mode;
    ui.sides = sv.mode === 'hotseat' ? [0, 1] : [0];
    ui.seed = sv.seed;
    ui.S = E.newGame(sv.seed, { names: sv.names });
    ui.actions = [];
    for (const a of sv.actions) { if (E.validate(ui.S, a)) break; E.apply(ui.S, a); ui.actions.push(a); }
    ui.playedResolved = ui.S.resolved;
    ui.celebrated = ui.S.phase === 'over' ? ui.seed : null;
    ui.screen = 'game';
    render();
    maybeAI();
  }

  // ================= 連線 =================
  function leaveRoom() {
    if (ui.room) ui.room.stop();
    ui.room = null;
  }
  // net：'lan'（server.py，同一個 Wi-Fi）或 'p2p'（網路對戰，js/p2p.js）；peer：網路對戰建立房間時已經登記好的房主 peer
  function joinRoom(code, role, myName, isNew, cid, net, peer) {
    leaveRoom();
    resetTransient();
    if (cid) ui.cid = cid;
    net = net === 'p2p' ? 'p2p' : 'lan';
    ui.mode = 'online';
    ui.role = role;
    ui.on = { code, net, hello: null, guest: null, catchingUp: true };
    ui.S = null;
    ui.sides = [];
    ui.screen = 'lobby';
    ui.lobby.step = 'room';
    saveOnline({ code, role, name: myName, cid: ui.cid, net });
    if (net === 'p2p') { ui.netOk = false; ui.netErr = 'connecting'; }
    const onStatus = (ok, err) => {
      const changed = ok !== ui.netOk || (err || '') !== ui.netErr;
      ui.netOk = ok; ui.netErr = err || '';
      if (!ok && (/房間不存在|404/.test(ui.netErr) || ui.netErr === 'no_room')) {
        leaveRoom(); clearOnline(); toast(t(net === 'p2p' ? 'toast_no_room_p2p' : 'toast_no_room')); backToMenu(); return;
      }
      if (changed) render();
    };
    ui.room = net === 'p2p' ? new Net.P2PRoom(code, role, onMsgs, onStatus, { isNew, peer }) : new Net.Room(code, onMsgs, onStatus);
    if (isNew && role === 'host') ui.room.send({ t: 'hello', name: myName, seed: rand32(), cid: ui.cid });
    if (isNew && role === 'guest') ui.room.send({ t: 'join', name: myName, cid: ui.cid });
    render();
  }
  function onMsgs(msgs) {
    for (const m of msgs) {
      if (m.t === 'hello' && !ui.on.hello) { ui.on.hello = m; ui.seed = m.seed; }
      else if (m.t === 'join' && ui.on.hello && !ui.on.guest) {
        ui.on.guest = m;
        newOnlineGame(ui.on.hello.seed);
      } else if (m.t === 'act' && ui.S) {
        if (!E.validate(ui.S, m.a)) { E.apply(ui.S, m.a); if (!ui.on.catchingUp) applied(m.a); }
      } else if (m.t === 'newgame' && ui.on.guest) {
        newOnlineGame(m.seed);
      }
    }
    ui.busy = false;
    if (ui.on.catchingUp) {
      ui.on.catchingUp = false;
      if (ui.S) { ui.playedResolved = ui.S.resolved; if (ui.S.phase === 'over') ui.celebrated = ui.seed; }
    }
    if (ui.S) {
      ui.screen = 'game';
      if (ui.S.resolved > ui.playedResolved && ui.S.events.length) startPlayback();
    }
    render();
  }
  function newOnlineGame(seed) {
    resetTransient();
    ui.seed = seed;
    ui.S = E.newGame(seed, { names: [ui.on.hello.name || t('host_name'), ui.on.guest.name || t('guest_name')] });
    ui.playedResolved = 0;
    if (ui.on.hello.cid === ui.cid) ui.sides = [0];
    else if (ui.on.guest.cid === ui.cid) ui.sides = [1];
    else ui.sides = [];
  }

  // ================= 回合播放 =================
  function startPlayback() {
    clearTimeout(ui.pbTimer);
    ui.playedResolved = ui.S.resolved;
    ui.pb = { events: ui.S.events, i: 0, auto: true, done: false, stage: 'reveal', plans: ui.S.lastPlans };
    ui.sel = null; ui.targeting = null; ui.plan = null;
    window.scrollTo({ top: 0, behavior: 'smooth' });
    SFX.play('reveal');
    ui.pbTimer = setTimeout(() => pbBegin(), 2600 / ui.pbSpeed);
  }
  function pbBegin() {
    if (!ui.pb || ui.pb.stage !== 'reveal') return;
    clearTimeout(ui.pbTimer);
    ui.pb.stage = 'events';
    pbShow(0, true);
  }
  const holdFor = (e, next) => {
    if (e.k === 'dmg' && next && next.k === 'dmg' && next.a === e.a && e.a !== undefined) return 300;
    return { phase: 1000, act: 650, dmg: 750, heal: 650, shield: 600, miss: 700, death: 1050, status: 700, move: 750, summon: 750 }[e.k] || 850;
  };
  function cardOf(i) {
    const evs = ui.pb.events, e = evs[i];
    for (let j = i - 1; j >= 0; j--) {
      if (evs[j].k === 'act') return evs[j].a === e.a ? { id: evs[j].c, at: j } : null;
    }
    return null;
  }
  // 出手前的動作（衝刺、飛行道具、範圍波），回傳需要等多久才命中
  function fxLead(i) {
    const e = ui.pb.events[i];
    if (e.k !== 'dmg' || e.a === undefined || e.a === null) return 0;
    const src = E.unit(ui.S, e.a), tgtEl = uel(e.b), srcEl = uel(e.a);
    if (!src || !tgtEl || !srcEl) return 0;
    const card = src.sm ? null : cardOf(i);
    const c = card && E.CARD[card.id];
    const firstOfCard = !card || !ui.pb.events.slice(card.at + 1, i).some(x => x.k === 'dmg' && x.a === e.a);
    if (c && c.aoe) {
      if (!firstOfCard) return 0;
      const side = app.querySelector(`.side[data-side="${1 - src.side}"]`);
      FX.wave(side, AOE_CLS[c.id]);
      SFX.play('magic');
      return 420;
    }
    if (!firstOfCard) { FX.projectile(srcEl, tgtEl, GLYPH[c && c.id] || '✦', 180); return 160; }
    const melee = src.sm ? src.key === 'dog' : (c ? c.rng === 'melee' : false);
    if (melee) { FX.lunge(srcEl, tgtEl); SFX.play('swing'); return 280; }
    FX.projectile(srcEl, tgtEl, GLYPH[(c && c.id)] || GLYPH[src.key] || '✦', 380);
    SFX.play('shoot');
    return 380;
  }
  // 命中後的效果
  function fxHit(e, prevSnap) {
    const el = e.b !== undefined && e.b !== null ? uel(e.b) : null;
    switch (e.k) {
      case 'phase':
        FX.banner(esc(e.t.replace(/[═—]/g, '').trim()));
        SFX.play('phase');
        break;
      case 'act': {
        const a = uel(e.a), c = E.CARD[e.c];
        if (a && c) { FX.bubble(a, t('bubble_card', { card: I.cardName(c.id) })); FX.ring(a, 'act'); }
        SFX.play('click');
        break;
      }
      case 'dmg': {
        if (!el) break;
        const big = e.n >= 35;
        FX.impact(el, e.n);
        const src = e.a !== undefined && e.a !== null ? E.unit(ui.S, e.a) : null;
        if (src && !src.sm) {
          const d = E.DEF[src.key];
          if (d && (d.type === 'melee' || src.key === 'assassin')) FX.slash(el, D.FACTIONS[d.f].color);
        }
        if (e.n > 0 || !e.sh) FX.float(el, `-${e.n}`, big ? 'dmg big' : 'dmg');
        if (e.sh) FX.float(el, `🛡-${e.sh}`, 'shield small');
        FX.particles(el, '✦', big ? 10 : 5, big ? 70 : 45, 'spark');
        if (big) FX.shake(app.querySelector('.board'), 7);
        SFX.play(big ? 'big' : 'hit');
        break;
      }
      case 'heal': if (el) { FX.float(el, `+${e.n}`, 'heal'); FX.particles(el, '✚', 6, 40, 'rise heal'); } SFX.play('heal'); break;
      case 'shield': if (el) { FX.ring(el, 'shield'); FX.float(el, `🛡+${e.n}`, 'shield'); } SFX.play('shield'); break;
      case 'miss': if (el) FX.float(el, t('fx_miss'), 'miss'); SFX.play('miss'); break;
      case 'death': if (el) { FX.particles(el, '💀', 1, 10, 'rise'); FX.particles(el, '✦', 14, 80, 'dark'); FX.shake(app.querySelector('.board'), 5); } SFX.play('death'); break;
      case 'summon': SFX.play('summon'); break;
      case 'move': SFX.play('swing'); break;
    }
    // 新出現的狀態圖示
    const cur = e.snap;
    if (prevSnap && cur) {
      let any = false;
      cur.units.forEach(u => {
        if (!u.alive) return;
        const before = prevSnap.units.find(x => x.uid === u.uid);
        const had = new Set(before ? before.st.map(s => s.k + ':' + s.from) : []);
        u.st.forEach(s => {
          if (had.has(s.k + ':' + s.from)) return;
          const def = D.statuses[s.k];
          if (!def) return;
          const x = uel(u.uid);
          if (x) { FX.float(x, `${def.i}${I.statusName(s.k)}`, 'status ' + def.k); any = true; }
        });
      });
      if (any && e.k !== 'dmg') SFX.play('status');
    }
  }
  function pbShow(i, animate) {
    const pb = ui.pb;
    if (!pb) return;
    clearTimeout(ui.pbTimer);
    i = Math.max(0, Math.min(pb.events.length - 1, i));
    const lead = animate ? fxLead(i) : 0;
    ui.pbTimer = setTimeout(() => {
      if (ui.pb !== pb) return;
      const prevSnap = pb.events[pb.i] && pb.events[pb.i].snap;
      pb.i = i;
      if (i >= pb.events.length - 1) { pb.done = true; pb.auto = false; }
      render();
      if (animate) fxHit(pb.events[i], i === 0 ? null : prevSnap);
      if (pb.auto) ui.pbTimer = setTimeout(() => pbShow(i + 1, true), holdFor(pb.events[i], pb.events[i + 1]) / ui.pbSpeed);
    }, lead / ui.pbSpeed);
  }
  function endPlayback() {
    clearTimeout(ui.pbTimer);
    ui.pb = null;
    render();
    maybeAI();
  }

  // ================= 繪製 =================
  function screenKey() {
    if (ui.screen !== 'game' || !ui.S) return ui.screen + (ui.screen === 'lobby' ? ':' + ui.lobby.step : '');
    const S = ui.S, a = actor();
    if (!ui.pb && ui.mode === 'hotseat' && a !== null && secret() && ui.coverKey !== `${S.phase}:${S.round}:${a}`) return `cover:${S.phase}:${S.round}:${a}`;
    if (S.phase === 'plan' || S.phase === 'over' || ui.pb) return `game:${ui.seed}:board`;
    return `game:${ui.seed}:${S.phase}`;
  }
  function render() {
    document.title = t('doc_title');
    let html = '';
    if (ui.screen === 'home') html = renderHome();
    else if (ui.screen === 'rules') html = renderRules();
    else if (ui.screen === 'codex') html = renderCodex();
    else if (ui.screen === 'lobby') html = renderLobby();
    else if (ui.screen === 'game') html = renderGame();
    const key = screenKey();
    const changed = key !== ui.lastKey;
    let out = `<div class="screen" data-key="${esc(key)}">${html}</div>`;
    if (ui.modal) out += `<div class="modal-bg" data-key="modal-${ui.modal.type}" data-act="closeModal"><div class="modal" data-act="noop">${renderModal()}${ui.modal.type === 'note' ? '' : `<button class="btn close" data-act="closeModal">${t('close')}</button>`}</div></div>`;
    const before = changed ? null : FX.measure(app);
    FX.morph(app, out);
    FX.flip(app, before);
    if (changed) { ui.lastKey = key; window.scrollTo(0, 0); }
    const sheet = app.querySelector('.sheet');
    const h = sheet && getComputedStyle(sheet).position === 'fixed' ? sheet.offsetHeight : 0;
    document.documentElement.style.setProperty('--sheet-h', h + 'px');
    const log = app.querySelector('.pb-log');
    if (log) log.scrollTop = log.scrollHeight;
    const ml = app.querySelector('.modal .log-list');
    if (ml && ui.modal && !ui.modal.scrolled) { ml.scrollTop = ml.scrollHeight; ui.modal.scrolled = true; }
    celebrate();
  }
  function celebrate() {
    const S = ui.S;
    if (!S || S.phase !== 'over' || ui.pb || ui.screen !== 'game' || ui.celebrated === ui.seed) return;
    ui.celebrated = ui.seed;
    const me = ui.sides.length === 1 ? ui.sides[0] : null;
    if (S.winner === 'draw') return SFX.play('phase');
    if (me !== null && S.winner !== me) return SFX.play('lose');
    FX.confetti();
    SFX.play('win');
  }

  // ---------- 首頁 ----------
  // 語言選擇（首頁上方與遊戲選單）
  function langPicker() {
    return `<div class="cx-filters lang-pick"><div style="justify-content:center">${Object.keys(I.LANGS).map(l => `<button class="cx-filter ${l === I.lang ? 'on' : ''}" data-act="lang" data-l="${l}" lang="${l === 'zh' ? 'zh-Hant' : l}">${I.LANGS[l]}</button>`).join('')}</div></div>`;
  }
  // 提示模式：攻略（圖鑑與選角顯示克制、連攜與提示）／挑戰（全部藏起來，自己在對戰中發現）
  function hintPicker() {
    const b = v => `<button class="cx-filter ${ui.hints === v ? 'on' : ''}" data-act="hints" data-v="${v}">${t('hints_' + v)}</button>`;
    return `<div class="hint-pick"><div class="hint-h">${t('hints_label')}</div><div class="cx-filters"><div>${b('guided')}${b('challenge')}</div></div><small>${t('hints_' + ui.hints + '_d')}</small></div>`;
  }
  function renderHome() {
    const sv = LS.get(K_LOCAL), on = savedOnline();
    const modeName = { hotseat: t('mode_hotseat'), ai: t('mode_ai') };
    const canResume = sv && sv.meta && sv.meta.phase !== 'over';
    const parade = D.heroes.concat(D.heroes).map(h => face(h.id, h.icon, '', `--fc:${D.FACTIONS[h.f].color}`)).join('');
    const info = canResume ? `${modeName[sv.mode] || ''}${SEP()}${phaseName(sv.meta.phase)}${sv.meta.round ? SEP() + t('home_resume_round', { n: sv.meta.round }) : ''}` : '';
    return `<div class="home">
      ${langPicker()}
      <div class="logo">
        <div class="logo-sub">${t('home_sub')}</div>
        <h1 class="logo-title">${t('home_logo')}</h1>
        <div class="logo-en">${t('home_logo_en')}</div>
      </div>
      <div class="parade"><div class="parade-track">${parade}</div></div>
      <div class="names">
        <label>${t('home_p1_name')}<input id="n0" maxlength="10" value="${esc(ui.names[0])}"></label>
        <label>${t('home_p2_name')}<input id="n1" maxlength="10" value="${esc(ui.names[1])}"></label>
      </div>
      ${canResume ? `<button class="btn primary" data-act="resume">${t('home_resume', { info })}</button>` : ''}
      ${on ? `<button class="btn primary" data-act="resumeOnline">${t('home_resume_online', { code: esc(on.code) })}</button>` : ''}
      ${hintPicker()}
      <div class="mode-grid">
        <button class="mode-btn" data-act="start" data-mode="hotseat"><span class="mode-ic">👥</span><b>${t('mode_hotseat_b')}</b><small>${t('mode_hotseat_s')}</small></button>
        <button class="mode-btn" data-act="start" data-mode="ai"><span class="mode-ic">🤖</span><b>${t('mode_ai_b')}</b><small>${t('mode_ai_s')}</small></button>
        <button class="mode-btn" data-act="lobby"><span class="mode-ic">📱</span><b>${t('mode_online_b')}</b><small>${t('mode_online_s')}</small></button>
      </div>
      <div class="btn-row">
        <button class="btn" data-act="codex">${t('btn_codex')}</button>
        <button class="btn" data-act="rules">${t('btn_rules')}</button>
        <button class="btn" data-act="sound">${SFX.on ? t('sound_on') : t('sound_off')}</button>
      </div>
      ${installLine()}
    </div>`;
  }

  // ---------- 規則 ----------
  function renderRules() {
    return `<div class="page rules">
      <div class="topbar"><button class="icon-btn" data-act="back">←</button><div class="title">${t('rules_title')}</div><span></span></div>
      ${t('rules_body')}
      <button class="btn" data-act="back">${t('back')}</button>
    </div>`;
  }

  // ---------- 連線大廳 ----------
  // 開伺服器的電腦連的是「公用網路」：防火牆會擋住其他裝置，提醒怎麼改（只在這台電腦上顯示）
  function netWarn(L) {
    const local = ['localhost', '127.0.0.1', '[::1]'].includes(location.hostname);
    return L.publicNet && local ? `<div class="dwarn"><div>⚠ ${t('lobby_public_warn')}</div></div>` : '';
  }
  function renderLobby() {
    const L = ui.lobby;
    let body = '';
    if (L.step === 'checking') body = `<div class="spinner"></div><p class="center muted">${t('lobby_checking')}</p>`;
    else if (L.step === 'noserver') {
      // 瀏覽器不能網路對戰（沒有 WebRTC）、也找不到連線伺服器：說明怎麼用同一個 Wi-Fi 的電腦開 start-server.bat
      body = `<div class="card-box">
        <h3>${t('lobby_noserver_title')}</h3>
        <p class="hosted-note">${t('p2p_err_unsupported')}</p>
        <ol>
          ${t('lobby_noserver_steps', { mode: t('mode_online_b') })}
        </ol>
        <p class="muted">${t('lobby_firewall')}</p>
      </div>
      <button class="btn" data-act="lobby">${t('lobby_retry')}</button>`;
    } else if (L.step === 'menu') {
      // 網路（p2p）與同一個 Wi-Fi（server.py）都可以用時，上方可以切換；網站版只有網路對戰，Wi-Fi 的玩法收在下方說明裡
      const p2p = L.net === 'p2p';
      const pick = v => `<button class="cx-filter ${L.net === v ? 'on' : ''}" data-act="netPick" data-v="${v}">${t('net_pick_' + v)}</button>`;
      body = `${L.server && L.p2p ? `<div class="cx-filters net-pick"><div>${pick('p2p')}${pick('lan')}</div><small>${t('net_pick_' + L.net + '_d')}</small></div>` : ''}
        <label class="field">${t('lobby_your_name')}<input id="myname" maxlength="10" value="${esc(ui.names[0])}"></label>
        <button class="mode-btn wide" data-act="createRoom"${L.busy ? ' disabled' : ''}><span class="mode-ic">🏠</span><b>${t('lobby_create')}</b><small>${t(p2p ? 'lobby_create_sub_p2p' : 'lobby_create_sub')}</small></button>
        <div class="or">${t('lobby_or')}</div>
        <div class="join-row"><input id="roomcode" maxlength="4" placeholder="${esc(t('lobby_code_ph'))}" autocapitalize="characters" autocomplete="off"><button class="btn primary" data-act="joinRoom"${L.busy ? ' disabled' : ''}>${t('lobby_join')}</button></div>
        ${L.busy ? `<div class="spinner"></div><p class="center muted">${t('p2p_err_connecting')}</p>` : ''}
        ${L.err ? `<div class="dwarn"><div>⚠ ${t('p2p_err_' + L.err)}</div></div>` : ''}
        ${p2p ? `<p class="net-note">${t('lobby_p2p_note')}</p>` : `${L.urls && L.urls.length ? `<p class="muted center">${t('lobby_open_url')}<br>${L.urls.map(u => `<code>${esc(u)}</code>`).join('<br>')}</p>` : ''}
        ${netWarn(L)}`}
        ${L.server ? '' : lanHelp()}`;
    } else if (L.step === 'room') {
      const on = ui.on || {};
      const p2p = on.net === 'p2p', host = ui.role === 'host';
      // 網路對戰：房主畫面顯示這個網站的網址，對手用自己的裝置打開、輸入代碼
      const site = location.href.split(/[?#]/)[0];
      const status = !p2p ? (ui.netOk ? t('lobby_waiting') : t('lobby_retrying'))
        : ui.netOk ? (host ? t('lobby_waiting') : t('p2p_connected')) : p2pWhy() ? t('lobby_retrying') : t('p2p_err_connecting');
      body = `<div class="card-box center">
        <div class="muted">${t('lobby_room_code')}</div>
        <div class="room-code">${esc(on.code).split('').map(ch => `<span>${ch}</span>`).join('')}</div>
        <p>${!host ? t('lobby_joining') : p2p ? t('lobby_host_hint_p2p', { mode: t('mode_online_b'), join: t('lobby_join') }) : t('lobby_host_hint', { join: t('lobby_join') })}</p>
        ${p2p && host ? `<p><code class="site-url">${esc(site)}</code></p>` : ''}
        ${!p2p && L.urls && L.urls.length ? `<p class="muted">${t('lobby_other_url')}<br>${L.urls.map(u => `<code>${esc(u)}</code>`).join('<br>')}</p>` : ''}
        ${p2p ? p2pWarn() : netWarn(L)}
        <div class="spinner"></div>
        <p class="muted">${status}</p>
      </div>
      <button class="btn" data-act="leaveRoom">${t('lobby_leave')}</button>`;
    }
    return `<div class="page lobby">
      <div class="topbar"><button class="icon-btn" data-act="home">←</button><div class="title">${t('lobby_title')}</div><span></span></div>
      ${body}
    </div>`;
  }
  // 大廳：檢查有沒有同一個 Wi-Fi 的連線伺服器（server.py）、瀏覽器能不能網路對戰（WebRTC）
  async function openLobby() {
    readNames();
    ui.screen = 'lobby';
    const L = ui.lobby = { step: 'checking' };
    render();
    const server = await Net.available();
    if (ui.lobby !== L) return;
    L.server = server;
    L.p2p = !!(Net.P2P && Net.P2P.supported());
    if (server) { try { const info = await Net.info(); L.urls = info.urls; L.publicNet = !!info.publicNet; } catch (e) { /* ignore */ } }
    if (ui.lobby !== L) return;
    // 兩種都可以：用上次選的（第一次用 Wi-Fi 伺服器，跟以前一樣）
    L.net = !L.p2p ? 'lan' : !server ? 'p2p' : LS.get(K_NET) === 'p2p' ? 'p2p' : 'lan';
    L.checked = true;
    L.step = server || L.p2p ? 'menu' : 'noserver';
    render();
  }
  // 回到大廳選單（離開房間、找不到房間）；從首頁直接回到房間時還沒檢查過連線方式，就重新檢查
  function backToMenu() {
    ui.screen = 'lobby';
    if (ui.lobby.checked) { ui.lobby.step = 'menu'; ui.lobby.busy = false; render(); } else openLobby();
  }
  // 網路對戰沒有連線伺服器：「同一個 Wi-Fi、不需要網際網路」的玩法收在可以展開的說明裡
  const lanHelp = () => `<details class="lan-help"><summary>${t('lobby_lan_title')}</summary><ol>${t('lobby_noserver_steps', { mode: t('mode_online_b') })}</ol><p class="muted">${t('lobby_firewall')}</p></details>`;
  // 網路對戰的連線狀態：js/p2p.js 回報的代碼 → p2p_err_<代碼> 的說明（connecting 只是連線中，不顯示說明框）
  const P2P_WHY = ['load', 'unsupported', 'signal', 'host_away', 'p2p', 'id_taken'];
  const p2pWhy = () => (ui.mode === 'online' && ui.on && ui.on.net === 'p2p' && !ui.netOk && P2P_WHY.includes(ui.netErr) ? ui.netErr : '');
  const p2pWarn = () => { const w = p2pWhy(); return w ? `<div class="dwarn"><div>⚠ ${t('p2p_err_' + w)}</div></div>` : ''; };

  // ---------- 遊戲 ----------
  function topbar() {
    const S = ui.S;
    const r = S.round ? t('tb_round', { n: S.round, max: E.MAX_ROUND }) + (S.round >= E.FATIGUE_FROM ? ' ☠️' : '') : '';
    const title = ui.pb ? t('tb_resolve', { n: S.resolved }) : phaseName(S.phase) + r;
    const net = ui.mode === 'online' ? `<span class="net-dot ${ui.netOk ? 'ok' : 'bad'}" title="${esc(ui.netOk ? t('net_ok') : t('net_bad'))}"></span>` : '';
    // 網路對戰斷線時，標題列下方說明原因（房主離線、網路擋住直接連線…）
    const why = p2pWhy();
    return `<div class="topbar"><button class="icon-btn" data-act="menu">☰</button><div class="title">${title}</div><span class="tb-right">${net}<button class="icon-btn" data-act="sound">${SFX.on ? '🔊' : '🔇'}</button></span></div>`
      + (why ? `<div class="dwarn net-banner"><div>⚠ ${t('p2p_err_' + why)}</div></div>` : '');
  }
  function renderGame() {
    const S = ui.S;
    if (!S) return '';
    if (ui.pb) return topbar() + renderPlayback();
    const a = actor();
    if (ui.mode === 'hotseat' && a !== null && secret()) {
      const key = `${S.phase}:${S.round}:${a}`;
      if (ui.coverKey !== key) return renderCover(a, key);
    }
    let body = '';
    if (S.phase === 'ban' || S.phase === 'draft') body = renderBanDraft(a);
    else if (S.phase === 'deploy') body = renderDeploy(a);
    else if (S.phase === 'plan') body = renderPlan(a);
    else if (S.phase === 'over') body = renderOver();
    return topbar() + body;
  }
  function renderCover(p, key) {
    const what = { ban: t('cover_ban'), deploy: t('cover_deploy'), plan: t('cover_plan', { n: ui.S.round }) }[ui.S.phase];
    return `<div class="cover p${p}">
      <div class="cover-box">
        <div class="cover-icon">🙈</div>
        <h2>${t('cover_hand', { p: pTag(p) })}</h2>
        <p class="cover-what">${what}</p>
        <p class="muted">${t('cover_nopeek', { p: pname(1 - p) })}</p>
        <button class="btn primary big" data-act="uncover" data-cover="${key}"><b>${t('cover_start', { p: pname(p) })}</b></button>
      </div>
    </div>`;
  }

  // ---------- 禁用 / 輪抽 ----------
  function heroTile(h, cls, extra, i) {
    return heroCard(h, { cls, extra, i, attrs: `data-key="h-${h.id}" data-act="hero" data-id="${h.id}"` });
  }
  // 禁用／選角順序條：禁 禁 | 1 | 2 2 | 1 1 | 2 2 | 1 1 | 2
  function orderStrip() {
    const S = ui.S;
    const steps = S.banOrder.map((p, i) => ({ p, ban: true, hero: S.banned[i] }));
    const seen = [0, 0];
    S.draftOrder.forEach(p => steps.push({ p, hero: S.pools[p][seen[p]++] }));
    const cur = S.phase === 'ban' ? S.banIdx : S.phase === 'draft' ? S.banOrder.length + S.draftIdx : steps.length;
    let html = '', prev = null;
    steps.forEach((x, i) => {
      if (prev && (prev.p !== x.p || prev.ban !== x.ban)) html += '<span class="os-sep"></span>';
      const d = x.hero && E.DEF[x.hero];
      const label = d ? d.icon : x.ban ? t('os_ban_short') : (x.p === S.first ? '1' : '2');
      const act = t(x.ban ? 'os_ban' : 'os_pick');
      const tip = d ? t('os_title_hero', { act, p: pname(x.p), hero: esc(I.heroName(d.id)) }) : t('os_title', { act, p: pname(x.p) });
      html += `<span class="os-step p${x.p} ${x.ban ? 'ban' : ''} ${i < cur ? 'done' : ''} ${i === cur ? 'cur' : ''}" data-key="os${i}" title="${tip}">${label}</span>`;
      prev = x;
    });
    return `<div class="order-strip">${html}</div>`;
  }
  function renderBanDraft(a) {
    const S = ui.S;
    let head = '';
    const banned = LIST(S.banned.map(id => E.DEF[id].icon + esc(I.heroName(id)))) || '—';
    if (S.phase === 'ban') {
      const cur = S.banOrder[S.banIdx];
      head = `<div class="banner ${a === null ? 'wait' : ''}">${a !== null ? t('ban_turn', { p: pTag(cur) }) : t('ban_wait', { p: pTag(cur) }) + '<span class="dots"></span>'}<small>${t('ban_hint', { first: pTag(S.first), second: pTag(1 - S.first) })}</small>${orderStrip()}</div>`;
    } else {
      const cur = S.draftOrder[S.draftIdx];
      const slots = p => Array.from({ length: E.POOL_SIZE }, (_, i) => {
        const id = S.pools[p][i];
        return id ? `<span class="pslot filled" data-key="ps${p}-${i}" data-act="hero" data-id="${id}" style="--fc:${D.FACTIONS[E.DEF[id].f].color}" title="${esc(I.heroName(id))}">${face(id, E.DEF[id].icon)}</span>` : `<span class="pslot" data-key="ps${p}-${i}-e"></span>`;
      }).join('');
      const left = S.draftOrder.slice(S.draftIdx).findIndex(p => p !== cur);
      const picksNow = left === -1 ? S.draftOrder.length - S.draftIdx : left;
      head = `<div class="banner ${a === null ? 'wait' : ''}">${a !== null ? t('draft_turn', { p: pTag(cur) }) + (picksNow > 1 ? t('draft_multi', { n: picksNow }) : '') : t('draft_wait', { p: pTag(cur) }) + '<span class="dots"></span>'}<small>${t('draft_progress', { n: S.draftIdx + 1, total: S.draftOrder.length, banned })}</small>${orderStrip()}</div>
        <div class="pools">${[0, 1].map(p => `<div class="pool ${cur === p ? 'turn' : ''} p${p}"><div class="pool-name">${pTag(p)}${p === S.first ? `<small class="muted">${t('draft_first')}</small>` : ''}</div><div class="pool-slots">${slots(p)}</div></div>`).join('')}</div>`;
    }
    const tiles = D.heroes.map((h, i) => {
      let cls = '', extra = '';
      if (S.banned.includes(h.id)) { cls = 'banned'; extra = `<div class="ht-mark">${t('ht_banned')}</div>`; }
      else if (S.pools[0].includes(h.id)) { cls = 'taken p0'; extra = `<div class="ht-mark p0">${pname(0)}</div>`; }
      else if (S.pools[1].includes(h.id)) { cls = 'taken p1'; extra = `<div class="ht-mark p1">${pname(1)}</div>`; }
      return heroTile(h, cls, extra, i);
    }).join('');
    return `<div class="page">${head}<div class="hero-grid">${tiles}</div>
      <p class="muted center small">${t('draft_footer')}</p></div>`;
  }

  // ---------- 佈陣 ----------
  function renderDeploy(a) {
    const S = ui.S;
    if (a === null) {
      return `<div class="page"><div class="banner wait">${t('deploy_done_wait')}<span class="dots"></span></div>${oppPoolInfo(ui.sides[0] === undefined ? 0 : ui.sides[0])}</div>`;
    }
    const key = `${a}`;
    if (!ui.dep || ui.dep.key !== key) ui.dep = { key, slots: [null, null, null, null], sel: null, ids: [null, null, null, null], n: 0 };
    const dep = ui.dep;
    const placed = dep.slots.filter(Boolean);
    const cost = placed.reduce((n, k) => n + E.DEF[k].cost, 0);
    const cell = s => {
      const k = dep.slots[s];
      if (!k) return `<div class="dcell empty ${dep.sel === s ? 'sel' : ''}" data-key="ds${s}" data-act="dslot" data-slot="${s}"><span>＋ ${E.slotName(s)}</span></div>`;
      const d = E.DEF[k];
      return `<div class="dcell ${dep.sel === s ? 'sel' : ''}" data-key="ds${s}" data-act="dslot" data-slot="${s}" style="--fc:${D.FACTIONS[d.f].color}">
        <div class="dcell-in" data-key="dk${dep.ids[s]}" data-flip="dk${dep.ids[s]}">${face(d.id, d.icon)}<div class="uname">${esc(I.heroName(d.id))}</div><div class="small muted">💰${d.cost} ❤️${d.hp} ⚡${d.spd}</div></div>
        <button class="x" data-act="dremove" data-slot="${s}">✕</button></div>`;
    };
    const tile = (d, used) => `<div class="rtile ${used ? 'used' : ''} ${d.minion ? 'minion' : ''}" data-key="r-${d.id}" style="--fc:${D.FACTIONS[d.f].color}">
        <button class="rmain" data-act="dadd" data-key2="${d.id}" ${used ? 'disabled' : ''}>${face(d.id, d.icon, 'sm')}<b>${esc(I.heroName(d.id))}</b><small>💰${d.cost} ❤️${d.hp} ⚡${d.spd}${SEP()}${typeLabel(d)}</small></button>
        <button class="rinfo" data-act="hero" data-id="${d.id}">ⓘ</button></div>`;
    const roster = S.pools[a].map(id => tile(E.DEF[id], dep.slots.includes(id))).join('') + D.minions.map(d => tile(d, false)).join('');
    const pct = Math.min(100, cost / E.MAX_COST * 100);
    return `<div class="page">
      <div class="banner">${t('deploy_title', { p: pTag(a) })}<small>${t('deploy_rule', { cost: E.MAX_COST, units: E.MAX_UNITS })}</small></div>
      <div class="deploy-wrap">
        <div>
          <div class="dir-label">${t('deploy_enemy_side')}</div>
          <div class="dgrid">
            <div class="drow-label">${t('row_front')}</div>${cell(0)}${cell(1)}
            <div class="drow-label">${t('row_back')}</div>${cell(2)}${cell(3)}
          </div>
          ${deployWarns(dep.slots)}
          <div class="meter"><div class="meter-bar"><i style="width:${pct}%" class="${cost > E.MAX_COST ? 'bad' : cost === E.MAX_COST ? 'full' : ''}"></i></div><span>${t('deploy_cost', { n: cost, max: E.MAX_COST })}</span><span>${t('deploy_units', { n: placed.length, max: E.MAX_UNITS })}</span></div>
          <p class="muted small center">${t('deploy_hint')}</p>
          ${oppPoolInfo(a)}
        </div>
        <div class="roster">${roster}</div>
      </div>
      <div class="btn-row sticky">
        <button class="btn" data-act="dclear">${t('deploy_clear')}</button>
        <button class="btn primary" data-act="dsubmit" ${placed.length && cost <= E.MAX_COST ? '' : 'disabled'}>${t('deploy_submit')}</button>
      </div>
    </div>`;
  }
  function oppPoolInfo(p) {
    const S = ui.S, o = 1 - p;
    return `<div class="opp-pool"><span class="muted">${t('opp_pool')}</span>${S.pools[o].map(id => `<span class="chip" data-act="hero" data-id="${id}">${E.DEF[id].icon}${esc(I.heroName(id))}</span>`).join('')}</div>`;
  }

  // ---------- 戰場 ----------
  function viewUnits(sn) {
    if (!sn) return ui.S.units;
    return sn.units.map(su => Object.assign({}, ui.S.units.find(u => u.uid === su.uid), su));
  }
  // 這回合因為「不能連續兩回合使用」而不能出的招
  function cooldownCards(u, round) {
    if (!u.data || !u.data.cd || u.sm || !ui.S || (ui.S.rules && ui.S.rules.cooldown === false)) return [];
    return E.cardsOf(u.key).filter(c => !c.basic && u.data.cd[c.id] === round - 1);
  }
  function statusBadges(u, round) {
    const out = [];
    (u.st || []).forEach(s => {
      const def = D.statuses[s.k];
      if (!def) return;
      const future = s.from > round;
      out.push(`<span class="st ${def.k} ${future ? 'future' : ''}" title="${esc(I.statusName(s.k))}${future ? t('st_next_round') : ''}">${def.i}${s.st > 1 ? `<sub>${s.st}</sub>` : ''}</span>`);
    });
    const d = u.data || {};
    if (d.sunmark) out.push(`<span class="st buff" title="${esc(t('st_sunmark'))}">☀️</span>`);
    if (d.ink) out.push(`<span class="st buff" title="${esc(t('st_ink'))}">🖋<sub>${d.ink}</sub></span>`);
    if (d.def) out.push(`<span class="st buff" title="${esc(t('st_def'))}">🪨<sub>${d.def}</sub></span>`);
    const cds = cooldownCards(u, round);
    if (cds.length) out.push(`<span class="st cd" title="${esc(t('st_cd_title', { list: LIST(cds.map(c => I.cardName(c.id))) }))}">⏳<sub>${cds.length}</sub></span>`);
    return out.join('');
  }
  // o: { bottom, cells, plan, sel, targets:Set, cellTargets:Set, ev, round, mid, overlay }
  function boardHTML(units, o) {
    const S = ui.S, top = 1 - o.bottom;
    const ev = o.ev || {};
    const cellFx = (side, slot) => (o.cells || []).filter(c => c.side === side && c.slot === slot && c.from <= o.round && o.round <= c.to)
      .map(c => ({ trap: '🕸️', fire: '🔥', jail: '⛓️' }[c.type])).join('');
    const planFor = uid => (o.plan ? o.plan.actions.filter(a => a.uid === uid).map(a => I.cardName(a.card)) : []);
    const cls = u => [
      o.sel === u.uid ? 'sel' : '',
      o.targets && o.targets.has(u.uid) ? 'tgt' : '',
      ev.a === u.uid ? 'actor' : '',
      ev.b === u.uid ? 'focus' : '',
      u.shield > 0 ? 'shielded' : '',
    ].join(' ');
    const cell = (side, slot) => {
      const here = units.filter(u => !u.sm && u.side === side && u.slot === slot);
      const u = here.find(x => x.alive) || here[0];
      const fx = cellFx(side, slot);
      const ctgt = o.cellTargets && side === top && o.cellTargets.has(slot) ? 'tgt' : '';
      const fxHtml = fx ? `<div class="cellfx">${fx}</div>` : '';
      if (!u) return `<div class="cell empty ${ctgt}" data-key="e${side}${slot}" data-act="cell" data-side="${side}" data-slot="${slot}"><span class="muted small">${E.slotName(slot)}</span>${fxHtml}</div>`;
      const d = E.DEF[u.key];
      if (!u.alive) return `<div class="cell dead ${ctgt}" data-key="u${u.uid}" data-flip="u${u.uid}" data-act="cell" data-side="${side}" data-slot="${slot}" data-uid="${u.uid}"><div class="medal">🪦</div><div class="cinfo"><div class="uname">${esc(I.unitName(u))}</div><div class="small muted">${t('dead')}</div></div>${fxHtml}</div>`;
      const pct = Math.max(0, u.hp / u.maxHp * 100);
      const shPct = Math.min(100 - pct, u.shield / u.maxHp * 100);
      const plans = planFor(u.uid);
      return `<div class="cell ${cls(u)} ${ctgt} ${pct < 30 ? 'danger' : ''}" data-key="u${u.uid}" data-flip="u${u.uid}" data-act="cell" data-side="${side}" data-slot="${slot}" data-uid="${u.uid}" style="--fc:${D.FACTIONS[d.f].color}">
        ${face(u.key, u.icon)}
        <div class="cinfo">
          <div class="uhead"><span class="uname">${esc(I.unitName(u))}</span><span class="uspd">⚡${u.spd}</span></div>
          <div class="hpbar"><b class="ghost" style="width:${pct}%"></b><i style="width:${pct}%" class="${pct < 30 ? 'low' : ''}"></i>${u.shield ? `<s style="left:${pct}%;width:${Math.max(3, shPct)}%"></s>` : ''}</div>
          <div class="hptxt"><b>${u.hp}</b>/${u.maxHp}${u.shield ? ` <span class="sh">🛡${u.shield}</span>` : ''}</div>
          <div class="sts">${statusBadges(u, o.round)}</div>
        </div>
        ${plans.length ? `<div class="plan-chips">${plans.map(esc).join(SEP())}</div>` : ''}
        ${fxHtml}
      </div>`;
    };
    const summons = side => {
      const list = units.filter(u => u.sm && u.side === side && u.alive);
      return `<div class="summons">${list.map(u => `<div class="tok ${cls(u)}" data-key="u${u.uid}" data-flip="u${u.uid}" data-act="cell" data-side="${side}" data-uid="${u.uid}" title="${esc(I.unitName(u))}"><span class="tok-ic">${u.icon}</span><small>${u.hp}${u.shield ? '<em>+' + u.shield + '</em>' : ''}</small>${statusBadges(u, o.round) ? `<i class="tok-st">${statusBadges(u, o.round)}</i>` : ''}</div>`).join('')}</div>`;
    };
    const head = side => {
      const snow = S.sideFx[side].snow === o.round ? `<span class="snow">${t('snow')}</span>` : '';
      return `<div class="side-head">${pTag(side)}${snow}${o.headExtra ? o.headExtra(side) : ''}</div>`;
    };
    return `<div class="board" data-key="board">
      <div class="side top" data-side="${top}">${head(top)}${summons(top)}
        <div class="row" data-label="${esc(t('row_back'))}">${cell(top, 2)}${cell(top, 3)}</div>
        <div class="row" data-label="${esc(t('row_front'))}">${cell(top, 0)}${cell(top, 1)}</div>
      </div>
      ${o.mid || '<div class="vs" data-key="vs"><span>VS</span></div>'}
      <div class="side bottom" data-side="${o.bottom}">
        <div class="row" data-label="${esc(t('row_front'))}">${cell(o.bottom, 0)}${cell(o.bottom, 1)}</div>
        <div class="row" data-label="${esc(t('row_back'))}">${cell(o.bottom, 2)}${cell(o.bottom, 3)}</div>
        ${summons(o.bottom)}${head(o.bottom)}
      </div>
      ${o.overlay || ''}
    </div>`;
  }

  // ---------- 站位規則（選用）的提示 ----------
  // 規則一律透過引擎的 ruleSet 讀 ui.S.rules（現在預設關閉，之後可能預設開啟），開或關畫面都要正常。
  // 這些提示只是輔助：引擎函式缺少或出錯時一律當作「沒有提示」，不能讓畫面壞掉。
  const safe = (f, d) => { try { return f(); } catch (e) { return d; } };
  const rOn = k => safe(() => !!(ui.S && E.ruleSet && E.ruleSet(ui.S, k)), false);
  // 速度顯示：巨人「永遠最後出手」顯示「最後」
  const spdTxt = n => (n < 0 ? t('ob_last') : String(n));
  // 會打斷出招的控制招（data.js 招式說明寫【冰凍】／【眩暈】的）；飄雪掌只有目標已有 2 層寒意時才會變成冰凍
  const CTRL_CARDS = { ic_freeze: 'freeze', st_light: 'stun', iq_palm: 'chill' };
  const chillOf = u => (u.st || []).filter(s => s.k === 'chill').reduce((n, s) => n + (s.st || 0), 0);
  const isMeleeHero = k => { const d = k && E.DEF[k]; return !!(d && !d.minion && d.type === 'melee'); };
  // 敵方角色這回合可能用的加速招（冷卻中的不算；審判官在場時加速無效）
  const spdCards = f => safe(() => (E.judgeOn && E.judgeOn(ui.S) ? [] : E.cardsOf(f.key).filter(c => c.spd && !E.onCooldown(ui.S, f.uid, c.id))), []);
  // 敵方的基本速度（狀態算進去；加速招要揭曉才知道）與可能的最高速度
  const baseSpd = f => safe(() => E.speedPreview(ui.S, f.uid, []), f.spd);
  const maxSpd = f => safe(() => E.speedPreview(ui.S, f.uid, spdCards(f).map(c => c.id)), f.spd);
  // 我方：這份出招裡這個角色選的招式算進去的速度；cardId 有給時算那張招式自己的出手速度（例如認真一拳蓄力）
  const myCardsOf = uid => (ui.plan ? ui.plan.actions.filter(x => x.uid === uid).map(x => x.card) : []);
  const mySpd = (u, cardId) => safe(() => {
    const cards = myCardsOf(u.uid);
    return cardId && E.cardSpeed ? E.cardSpeed(ui.S, u.uid, cards, cardId) : E.speedPreview(ui.S, u.uid, cards);
  }, u.spd);
  const mateOf = (S, u) => E.grid(S, u.side).find(x => x.slot === (u.slot < 2 ? u.slot + 2 : u.slot - 2)) || null;
  // 敵方角色這回合用得出這張招式嗎（冷卻、招式需求；meleeFront 時後排的近戰要先換得了位）
  function foeCanUse(S, f, id) {
    return safe(() => {
      const back = f.slot >= 2 && E.CARD[id].rng === 'melee' && rOn('meleeFront');
      if (back && !E.reqOk(S, f.uid, 'x_move', [])) return false;
      return E.reqOk(S, f.uid, id, back ? [{ uid: f.uid, card: 'x_move' }] : []);
    }, true);
  }
  // 打得到 ids 其中一人的敵方近戰招式：[{ f: 敵方角色, c: 招式 }]
  function meleeReach(S, me, ids) {
    const out = [];
    E.grid(S, 1 - me).forEach(f => E.cardsOf(f.key).forEach(c => {
      if (c.rng === 'melee' && c.tgt === 'enemy' && foeCanUse(S, f, c.id) && E.validTargets(S, f.uid, c.id).some(id => ids.includes(id))) out.push({ f, c });
    }));
    return out;
  }
  // 站位規則任一開啟（同引擎的 posRules）
  const posOn = () => rOn('meleeFront') || rOn('meleeSquare') || rOn('swapSpeed');
  // 【鎖定】有沒有作用（同引擎 enemyTarget：站位規則任一開啟、挨打的那一方沒有活著的小狗）→ 追著原目標打，換位快慢都躲不掉
  const lockOn = (S, c, side) => !!(c && c.lock) && posOn() && safe(() => !E.alive(S, side).some(x => x.key === 'dog'), true);
  // 敵方單張招式的出手速度（opWindup 時認真一拳比角色本身慢）；對方的加速招看不到，所以不算
  const foeCardSpd = (f, id) => safe(() => (E.cardSpeed ? E.cardSpeed(ui.S, f.uid, [], id) : baseSpd(f)), baseSpd(f));
  // U1 資料（swapHints 與測試用）：我方每個排了換位的角色一筆
  //   mode 'away'：前排換到後排（或後排換進沒人的前排）。比對方快＝換得開（同列隊友換進這一格替他挨打）；同速或比較慢＝來不及
  //   mode 'in'  ：後排換上前排、而且前排有隊友（mate）。這時打得到的其實是隊友：比對方快＝搶進那一格替隊友挨打；來不及＝隊友挨打
  //   mode 'stuck'：noWhiff、同列沒有隊友，換完他還是那張近戰的合法目標（前排只剩他、或從後排換上前排）→ 快慢都躲不掉，全列在 slow
  //   lock：【鎖定】招式（巨人）追著原目標打，快慢都一樣，另外列
  //   fast／slow 每一項 { uid, spd, html }；card 有值＝那張招式的出手速度跟角色本身不同、而且分到另一邊（例如 opWindup 的認真一拳）
  //   比的是對方的基本速度（嚴格大於才算快）；對方有加速招的標「?」
  function swapData(S, me) {
    const rows = [], seen = new Set();
    (ui.plan ? ui.plan.actions : []).forEach(x => {
      if (x.card !== 'x_move' || seen.has(x.uid)) return;
      seen.add(x.uid);
      const u = E.unit(S, x.uid);
      if (!u || !u.alive || u.sm) return;
      const mate = mateOf(S, u), sp = mySpd(u);
      // noWhiff：沒人換進這一格時對方照一般規則改打 → 換完他還是合法目標（前排只剩他、或從後排換上前排）就躲不掉
      const stuck = !mate && rOn('noWhiff') && !(u.slot < 2 && E.grid(S, me).some(v => v !== u && v.slot < 2));
      const row = { uid: u.uid, mode: stuck ? 'stuck' : u.slot >= 2 && mate ? 'in' : 'away', mate: mate ? mate.uid : null, spd: sp, fast: [], slow: [], lock: [] };
      const byFoe = new Map();
      meleeReach(S, me, mate ? [u.uid, mate.uid] : [u.uid]).forEach(({ f, c }) => byFoe.set(f, (byFoe.get(f) || []).concat([c])));
      byFoe.forEach((cards, f) => {
        // 躲不掉（stuck）時一律列在來不及那一邊
        const beats = cs => !stuck && sp > cs;
        const base = baseSpd(f), baseFast = beats(base), q = spdCards(f).length ? '?' : '', name = esc(I.unitName(f));
        if (cards.some(c => lockOn(S, c, me))) row.lock.push({ uid: f.uid, html: name });
        let plain = false;
        const odd = new Map();
        cards.filter(c => !lockOn(S, c, me)).forEach(c => {
          const cs = foeCardSpd(f, c.id);
          if (beats(cs) === baseFast) plain = true;
          else odd.set(cs, (odd.get(cs) || []).concat([c]));
        });
        if (plain) row[baseFast ? 'fast' : 'slow'].push({ uid: f.uid, spd: base, html: `${name}⚡${spdTxt(base)}${q}` });
        odd.forEach((cs2, cs) => row[beats(cs) ? 'fast' : 'slow'].push({
          uid: f.uid, card: cs2.map(c => c.id).join(), spd: cs,
          html: `${t('swap_foe_card', { unit: name, card: LIST(cs2.map(c => I.cardName(c.id))) })}⚡${spdTxt(cs)}${q}`,
        }));
      });
      rows.push(row);
    });
    return rows;
  }
  // U1 換位看速度（meleeSquare＋swapSpeed）：出招面板裡每個排了換位的角色一行
  function swapHints(S, me) {
    if (!ui.plan || !rOn('meleeSquare') || !rOn('swapSpeed')) return '';
    return safe(() => {
      const ls = arr => (arr.length ? LIST(arr.map(x => x.html)) : '—');
      const lines = swapData(S, me).map(r => {
        const args = { unit: esc(I.unitName(E.unit(S, r.uid))), spd: spdTxt(r.spd), fast: ls(r.fast), slow: ls(r.slow) };
        const main = r.mode === 'in' ? t('swap_hint_in', Object.assign(args, { mate: esc(I.unitName(E.unit(S, r.mate))) }))
          : t(r.mode === 'stuck' ? 'swap_hint_stuck' : 'swap_hint', args);
        return `<div>${main}${r.lock.length ? t('swap_hint_lock', { list: ls(r.lock) }) : ''}</div>`;
      });
      return lines.length ? `<div class="swap-hints" data-key="swap-hints">${lines.join('')}</div>` : '';
    }, '');
  }
  // U3 換位＋近戰可能被打斷（meleeFront）：後排角色排了換位（或 dashFront 時曜神劍客的閃身）再出近戰，
  //   而敵方有可能比這張近戰快（算上對方可能的加速）、又帶著冰凍／眩暈招的角色 → 在這張近戰旁邊提醒
  function interruptWarn(S, me, u, c) {
    if (!u || u.sm || !c || c.rng !== 'melee' || u.slot < 2 || !rOn('meleeFront')) return '';
    return safe(() => {
      const mine = myCardsOf(u.uid);
      const dash = u.key === 'swordsman' && mine.includes('sw_dash') && rOn('dashFront');
      if (!dash && !mine.includes('x_move')) return '';
      // 換位是預判（swapSpeed 關）或閃身衝前排：對方出手時他已經在前排，打前排的近戰控制也打得到他
      const preMove = dash || !rOn('swapSpeed');
      const sp = mySpd(u, c.id), chill = chillOf(u);
      const who = E.grid(S, 1 - me).filter(f => maxSpd(f) > sp && E.cardsOf(f.key).some(k => {
        const kind = CTRL_CARDS[k.id];
        if (!kind || (kind === 'chill' && chill < 2) || !foeCanUse(S, f, k.id)) return false;
        if (k.aoe) return true;
        const list = E.validTargets(S, f.uid, k.id);
        if (list.includes(u.uid)) return true;
        return k.rng === 'melee' && preMove && list.some(id => { const v = E.unit(S, id); return v && !v.sm && v.side === me && v.slot < 2; });
      }));
      return who.length ? ` <em class="pc-warn" title="${esc(t('plan_interrupt_title', { list: LIST(who.map(f => I.unitName(f))) }))}">⚠ ${t('plan_interrupt')}</em>` : '';
    }, '');
  }
  // U4 佈陣（meleeFront）：巨人只能放前排（引擎有這條驗證就用引擎的訊息）
  const giantBack = (key, slot) => key === 'giant' && slot >= 2 && rOn('meleeFront');
  function giantFrontMsg(p, slot) {
    const err = safe(() => (E.MSG && 'err_giant_front' in E.MSG ? E.validate(ui.S, { type: 'deploy', p, units: [{ key: 'giant', slot }] }) : null), null);
    return err || t('toast_giant_front', { giant: I.heroName('giant') });
  }
  // 佈陣提醒（只提醒不擋）：純近戰英雄放在巨人正後方；純近戰英雄比前排格子多
  function deployWarns(slots) {
    if (!rOn('meleeFront')) return '';
    return safe(() => {
      const out = [];
      if ([0, 1].some(s => slots[s] === 'giant' && isMeleeHero(slots[s + 2]))) out.push(t('deploy_warn_giant_back', { giant: esc(I.heroName('giant')) }));
      if (slots.filter(isMeleeHero).length > 2) out.push(t('deploy_warn_melee_many'));
      return out.length ? `<div class="dwarn" data-key="dwarn">${out.map(s => `<div>⚠ ${s}</div>`).join('')}</div>` : '';
    }, '');
  }

  // ---------- 出招 ----------
  function planSpent(p) {
    return ui.plan.actions.reduce((n, a) => n + E.cardCost(ui.S, p, E.CARD[a.card]), 0);
  }
  // 招式卡上的標籤（基本、預判、加速、距離、全體；出招時另外顯示目標類型）
  function cardTags(c, withTgt) {
    const tags = [];
    if (c.basic) tags.push(`<span class="tag basic">${t('tag_basic')}</span>`);
    // 換位在「換位依速度」規則下不是預判
    if (ui.S ? E.isPre(ui.S, c) : c.pre) tags.push(`<span class="tag pre">${t('tag_pre')}</span>`);
    if (c.spd) tags.push(`<span class="tag spd">${t('tag_spd', { n: c.spd })}</span>`);
    if (c.rng) tags.push(`<span class="tag">${rngName(c.rng)}</span>`);
    // U2 近戰打格子（meleeSquare）：遠程、繞背與【鎖定】招式追著英雄打，另外標「鎖定」；一般近戰照舊只標「近戰」
    //   繞背仍只打得到後場：目標換到前場（後場還有人）時引擎會改打後場其他人，說明另外寫
    if ((c.lock || c.rng === 'ranged' || c.rng === 'back') && rOn('meleeSquare')) {
      tags.push(`<span class="tag lock" title="${esc(t(c.rng === 'back' && !c.lock ? 'tag_lock_title_back' : 'tag_lock_title'))}">${t('tag_lock')}</span>`);
    }
    if (c.aoe) tags.push(`<span class="tag aoe">${t('tag_aoe')}</span>`);
    else if (withTgt && tgtName(c.tgt) && c.tgt !== 'enemy') tags.push(`<span class="tag">${tgtName(c.tgt)}</span>`);
    return tags.join('');
  }
  function cardBlock(S, p, u, c) {
    const acts = ui.plan.actions;
    const used = acts.some(a => a.uid === u.uid && a.card === c.id);
    const grp = c.group && acts.some(a => a.uid === u.uid && a.card !== c.id && E.CARD[a.card].group === c.group);
    const cost = E.cardCost(S, p, c);
    const left = E.planBudget(S, p, acts) - planSpent(p);
    let why = '';
    if (used) why = t('why_used');
    else if (grp) why = t('why_group');
    else if (E.onCooldown(S, u.uid, c.id)) why = t('why_cd');
    else if (!E.reqOk(S, u.uid, c.id, acts.concat([{ uid: u.uid, card: c.id }]))) why = E.REQ_TXT[E.reqWhy(S, u.uid, c.id, acts.concat([{ uid: u.uid, card: c.id }]))] || t('why_cant');
    else if (cost > left && c.id !== 'mn_sac') why = t('why_ap');
    else if (['enemy', 'ally', 'allyFront', 'allyHero'].includes(c.tgt) && !E.validTargets(S, u.uid, c.id).length) why = t('why_notgt');
    // 換位依速度（swapSpeed）：換位的說明寫「在所有攻擊之前生效」，補一句現在照速度順序
    const note = c.id === 'x_move' && rOn('swapSpeed') ? `<small class="cb-note">${t('swap_speed_note')}</small>` : '';
    return `<button class="card-btn ${why ? 'off' : ''} ${used ? 'used' : ''}" data-key="cb-${c.id}" data-act="card" data-id="${c.id}" ${why ? 'disabled' : ''}>
      <span class="cost">${cost}</span>
      <span class="cb-main"><span class="cb-title"><b>${I.cardName(c.id)}</b>${cardTags(c, true)}</span><small>${I.cardDesc(c.id)}</small>${note}${why ? `<em>${why}</em>` : ''}</span>
    </button>`;
  }
  function targetLabel(a) {
    const c = E.CARD[a.card];
    if (c.tgt === 'cell') return t('tl_cell', { slot: E.slotName(a.target) });
    if (a.target === undefined || a.target === null) return c.aoe ? t('tl_all') : t('tl_self');
    const tu = E.unit(ui.S, a.target);
    return tu ? I.unitName(tu) : '?';
  }
  // 預測這回合的出手順序：我方算上已選招式的加速，敵方只知道基本速度（招式要揭曉才知道）
  function orderBar(me) {
    const S = ui.S;
    const acts = ui.plan ? ui.plan.actions : [];
    // 換位依速度（swapSpeed）：換位在自己的速度出手，順序條上標 🔄
    const swapSpd = rOn('swapSpeed');
    const list = E.grid(S).map(u => {
      const mine = u.side === me;
      const cards = mine ? acts.filter(x => x.uid === u.uid).map(x => x.card) : [];
      return { u, mine, sp: E.speedPreview(S, u.uid, cards), boosted: cards.some(id => E.CARD[id].spd), swap: swapSpd && cards.includes('x_move') };
    }).sort((x, y) => (y.sp - x.sp) || (x.mine === y.mine ? 0 : x.mine ? -1 : 1));
    const items = list.map(x => `<div class="ob-u ${x.mine ? 'me' : 'foe'} ${x.boosted ? 'up' : ''}" data-key="ob-${x.u.uid}" data-flip="ob-${x.u.uid}" title="${esc(I.unitName(x.u))}">
        ${face(x.u.key, x.u.icon, 'ob', `--fc:${D.FACTIONS[E.DEF[x.u.key].f].color}`)}<b>${x.sp < 0 ? t('ob_last') : x.sp}${x.mine ? '' : '?'}</b>${x.swap ? '<i class="ob-sw">🔄</i>' : ''}</div>`).join('<i class="ob-arrow">›</i>');
    return `<div class="order-bar" data-key="vs"><div class="ob-title">${t('ob_title')}</div><div class="ob-list">${items}</div></div>`;
  }
  function renderPlan(a) {
    const S = ui.S;
    const bottom = a !== null ? a : (ui.sides.length ? ui.sides[0] : 0);
    if (a === null) {
      return `<div class="game-wrap">${boardHTML(S.units, { bottom, cells: S.cells, round: S.round })}
        <div class="panel sheet" data-key="sheet-wait"><div class="banner wait">${ui.busy ? t('plan_sending') : ui.mode === 'ai' ? t('plan_ai_thinking') : t('plan_wait')}<span class="dots"></span></div>${lastRoundLog()}</div></div>`;
    }
    const key = `${S.round}:${a}`;
    if (!ui.plan || ui.plan.key !== key) { ui.plan = { key, actions: [] }; ui.sel = null; ui.targeting = null; }
    if (ui.sel && !(E.unit(S, ui.sel) || {}).alive) ui.sel = null;
    const budget = E.planBudget(S, a, ui.plan.actions), spent = planSpent(a);
    let targets = null, cellTargets = null;
    if (ui.targeting) {
      const c = E.CARD[ui.targeting.card];
      const list = E.validTargets(S, ui.targeting.uid, c.id);
      if (c.tgt === 'cell') cellTargets = new Set(list); else targets = new Set(list);
    }
    const bankOn = !S.rules || S.rules.bank !== false;
    const pips = Array.from({ length: Math.max(budget, spent) }, (_, i) => `<i data-key="pip${i}" class="${i < spent ? (i < budget ? 'on' : 'over') : ''}"></i>`).join('');
    const oppTxt = S.plans[1 - a] ? `<span class="ready">${t('plan_opp_ready')}</span>` : '';
    let main = '';
    if (ui.targeting) {
      const c = E.CARD[ui.targeting.card];
      // U2 近戰打格子（meleeSquare）：選近戰目標時提醒「打的是格子」；【鎖定】招式則是追著英雄打
      const sq = c.rng === 'melee' && rOn('meleeSquare') ? `<div class="hint sq" data-key="hint-sq">${t(c.lock ? 'plan_lock_hint' : 'plan_square_hint')}</div>` : '';
      main = `<div class="hint glow" data-key="hint-t"><span>${t(c.tgt === 'cell' ? 'plan_tgt_cell' : 'plan_tgt_unit', { card: I.cardName(c.id) })}</span>
        <button class="btn small" data-act="cancelTarget">${t('cancel')}</button></div>${sq}`;
    } else if (ui.sel) {
      const u = E.unit(S, ui.sel), d = E.DEF[u.key], pa = I.passive(u.key);
      main = `<div class="unit-head" data-key="uh-${u.uid}">${face(u.key, u.icon, 'sm', `--fc:${D.FACTIONS[d.f].color}`)}<b>${esc(I.unitName(u))}</b><span class="muted">❤️${u.hp}/${u.maxHp} ⚡${u.spd}</span>
          <button class="btn small" data-act="unitInfo" data-uid="${u.uid}">ⓘ</button><button class="btn small" data-act="deselect">✕</button></div>
        ${pa ? `<div class="passive" data-key="pa-${u.uid}">${t('passive', { n: pa.n, d: pa.d })}</div>` : ''}
        <div class="cards" data-key="cards-${u.uid}">${d.cards.map(c => cardBlock(S, a, u, c)).join('')}
          <div class="cards-sub">${t('plan_basic_actions')}</div>${(D.actions || []).map(c => cardBlock(S, a, u, c)).join('')}</div>`;
    } else {
      main = `<div class="hint" data-key="hint-0">${t('plan_hint')}</div>`;
    }
    const chips = ui.plan.actions.map((x, i) => {
      const u = E.unit(S, x.uid), c = E.CARD[x.card];
      return `<span class="pchip" data-key="pc-${x.uid}-${x.card}"><span>${t('plan_chip', { icon: u.icon, unit: esc(I.unitName(u)), card: I.cardName(c.id), target: esc(targetLabel(x)), ap: E.cardCost(S, a, c) })}${interruptWarn(S, a, u, c)}</span><button data-act="unplan" data-i="${i}">✕</button></span>`;
    }).join('');
    const panel = `<div class="panel sheet ${ui.targeting ? 'mini' : ''}" data-key="sheet-plan">
      <div class="ap-row"><span>${pTag(a)}</span><span class="pips">${pips}</span><span class="${spent > budget ? 'bad' : ''}">${t('ap_frac', { n: spent, max: budget })}</span>${S.players[a].saved ? `<span class="saved">${t('plan_saved')}</span>` : ''}${bankOn && spent < budget ? `<span class="saved next">${t('plan_bank', { n: budget - spent })}</span>` : ''}${S.sideFx[a].snow === S.round ? `<span class="snow">${t('plan_snow')}</span>` : ''}${oppTxt}</div>
      ${chips && !ui.targeting ? `<div class="pchips">${chips}</div>${swapHints(S, a)}` : ''}
      ${main}
      ${ui.targeting ? '' : `<div class="btn-row">
        <button class="btn" data-act="clearPlan" ${ui.plan.actions.length ? '' : 'disabled'}>${t('plan_clear')}</button>
        <button class="btn primary" data-act="submitPlan">${ui.plan.actions.length ? t('plan_submit', { ap: spent }) : t('plan_rest')}</button>
      </div>`}
      ${ui.targeting || ui.sel ? '' : lastRoundLog()}
    </div>`;
    return `<div class="game-wrap">${boardHTML(S.units, { bottom, cells: S.cells, plan: { actions: ui.plan.actions }, sel: ui.sel, targets, cellTargets, round: S.round, mid: orderBar(a) })}${panel}</div>`;
  }
  function lastRoundLog() {
    const S = ui.S;
    if (!S.events.length) return '';
    return `<details class="lastlog" data-key="lastlog"><summary>${t('last_log')}</summary><div class="log-list">${S.events.filter(e => e.t).map(e => `<div class="lg ${e.k}">${esc(e.t)}</div>`).join('')}</div></details>`;
  }

  // ---------- 播放 ----------
  function revealOverlay(bottom) {
    const pb = ui.pb, S = ui.S;
    const lane = (p, cls) => {
      const list = (pb.plans && pb.plans[p]) || [];
      const cards = list.length ? list.map((x, i) => {
        const u = E.unit(S, x.uid), c = E.CARD[x.card];
        return `<div class="rcard" style="--i:${i}"><div class="rc-in"><div class="rc-back">${t('card_back')}</div><div class="rc-front" ${u ? `style="--fc:${D.FACTIONS[E.DEF[u.key] ? E.DEF[u.key].f : '小兵'].color}"` : ''}><span class="cost">${E.cardCost(S, p, c)}</span>${u ? face(u.key, u.icon, 'xs') : ''}<b>${I.cardName(c.id)}</b><small>${u ? esc(I.unitName(u)) : ''}</small></div></div></div>`;
      }).join('') : `<div class="rc-rest">${t('reveal_rest')}</div>`;
      return `<div class="rlane ${cls}"><div class="rlane-name">${pTag(p)}</div><div class="rcards">${cards}</div></div>`;
    };
    return `<div class="reveal" data-key="reveal-${S.resolved}" data-act="pbSkipReveal">
      ${lane(1 - bottom, 'top')}
      <div class="reveal-title">${t('reveal_title')}</div>
      ${lane(bottom, 'bottom')}
    </div>`;
  }
  function renderPlayback() {
    const pb = ui.pb;
    const bottom = ui.mode === 'hotseat' ? 0 : (ui.sides.length ? ui.sides[0] : 0);
    const e = pb.events[pb.stage === 'reveal' ? 0 : pb.i];
    const shown = pb.stage === 'reveal' ? [] : pb.events.slice(0, pb.i + 1).filter(x => x.t);
    const mid = `<div class="pb-bar" data-key="vs">
      <div class="cap ${pb.stage === 'reveal' ? 'phase' : e.k}">${pb.stage === 'reveal' ? t('pb_reveal_cap') : esc(e.t || '')}</div>
      <div class="pbc">
        ${pb.done ? `<button class="btn primary small go" data-act="pbClose">${ui.S.phase === 'over' ? t('pb_result') : t('pb_next_round')}</button>` : `
        <button class="pbtn" data-act="pbPrev" title="${esc(t('pb_prev'))}">⏮</button>
        <button class="pbtn" data-act="pbToggle" title="${esc(t('pb_toggle'))}">${pb.auto ? '⏸' : '▶'}</button>
        <button class="pbtn" data-act="pbNext" title="${esc(t('pb_next'))}">⏭</button>
        <button class="pbtn" data-act="pbSpeed" title="${esc(t('pb_speed'))}">${ui.pbSpeed}x</button>
        <button class="pbtn wide" data-act="pbEnd">${t('pb_skip')}</button>`}
      </div>
      <div class="pb-progress"><i style="width:${pb.stage === 'reveal' ? 0 : ((pb.i + 1) / pb.events.length * 100)}%"></i></div>
    </div>`;
    const board = boardHTML(viewUnits(e.snap), { bottom, cells: e.snap.cells, ev: pb.stage === 'reveal' ? {} : e, round: ui.S.resolved, mid, overlay: pb.stage === 'reveal' ? revealOverlay(bottom) : '' });
    return `<div class="game-wrap">${board}
      <div class="panel" data-key="pb-panel">
        <div class="panel-title">${t('pb_log_title')}</div>
        <div class="pb-log log-list">${shown.map((x, i) => `<div class="lg ${x.k} ${i === shown.length - 1 ? 'cur' : ''}">${esc(x.t)}</div>`).join('')}</div>
      </div>
    </div>`;
  }

  // ---------- 結束 ----------
  function renderOver() {
    const S = ui.S;
    const w = S.winner;
    const me = ui.sides.length === 1 ? ui.sides[0] : null;
    let title = w === 'draw' ? t('over_draw') : t('over_win', { p: pname(w) });
    let cls = 'win';
    if (me !== null && w !== 'draw') { title = w === me ? t('over_you_win') : t('over_you_lose'); cls = w === me ? 'win' : 'lose'; }
    const bottom = me !== null ? me : 0;
    return `<div class="game-wrap">${boardHTML(S.units, { bottom, cells: [], round: S.round })}
      <div class="panel sheet over-panel ${cls}" data-key="sheet-over">
        <h2>${title}</h2>
        <p>${esc(S.endReason)}</p>
        <div class="btn-row">
          <button class="btn" data-act="showLog">${t('btn_log')}</button>
          <button class="btn primary" data-act="rematch">${t('over_rematch')}</button>
        </div>
        <button class="btn" data-act="home">${t('btn_home')}</button>
      </div></div>`;
  }

  // ---------- 彈出視窗 ----------
  function heroDetail(id, unitObj) {
    const d = E.DEF[id], pa = I.passive(id);
    const card = c => `<div class="dcard"><div class="dc-head"><span class="cost">${c.ap}</span><b>${I.cardName(c.id)}</b>${cardTags(c, false)}</div><div class="dc-d">${I.cardDesc(c.id)}</div></div>`;
    let live = '';
    if (unitObj) {
      const u = unitObj, round = ui.S.round;
      const sts = (u.st || []).map(s => {
        const def = D.statuses[s.k];
        const left = s.to >= 900 ? '' : s.from > round ? t('st_left_next') : s.to > round ? t('st_left_n', { n: s.to - round + 1 }) : t('st_left_now');
        const extra = `${s.st > 1 ? ' x' + s.st : ''}${s.v ? ` ${s.v}%` : ''}`;
        return `<li>${t('st_line', { i: def.i, n: I.statusName(s.k), extra, d: I.statusDesc(s.k), left })}</li>`;
      });
      if (u.data.sunmark) sts.push(`<li>${t('live_sunmark', { card: I.cardName('sw_final') })}</li>`);
      if (u.data.ink) sts.push(`<li>${t('live_ink', { n: u.data.ink })}</li>`);
      if (u.data.def) sts.push(`<li>${t('live_def', { n: u.data.def })}</li>`);
      if (u.data.noTire) sts.push(`<li>${t('live_notire')}</li>`);
      const cds = cooldownCards(u, round);
      if (cds.length) sts.push(`<li>${t('live_cd', { list: LIST(cds.map(c => I.cardName(c.id))) })}</li>`);
      const pct = Math.max(0, u.hp / u.maxHp * 100);
      live = `<div class="live"><div class="hpbar big"><i style="width:${pct}%" class="${pct < 30 ? 'low' : ''}"></i></div><div>❤️ ${u.hp}/${u.maxHp}${u.shield ? ` 🛡${u.shield}` : ''}${SEP()}${u.sm ? t('summon') : E.slotName(u.slot)}${SEP()}${pname(u.side)}</div>${sts.length ? `<ul>${sts.join('')}</ul>` : `<div class="muted">${t('live_none')}</div>`}</div>`;
    }
    return `<div class="detail" style="--fc:${D.FACTIONS[d.f].color}">
      ${heroCard(d, { cls: 'big', big: true })}
      ${live}
      ${pa ? `<div class="passive">${t('passive', { n: pa.n, d: pa.d })}</div>` : ''}
      ${d.cards.map(card).join('')}
      ${codexInfo(id)}
    </div>`;
  }
  const SUMMON_DESC = ['bat', 'gpirate', 'ship', 'statue', 'dog'];
  function renderModal() {
    const m = ui.modal;
    if (m.type === 'hero') {
      const S = ui.S, a = S ? actor() : null;
      let btn = '';
      if (S && a !== null && !E.DEF[m.id].minion && !ui.pb) {
        if (S.phase === 'ban' && !E.validate(S, { type: 'ban', p: a, hero: m.id })) btn =`<button class="btn danger big" data-act="doBan" data-id="${m.id}"><b>${t('modal_ban', { hero: esc(I.heroName(m.id)) })}</b></button>`;
        if (S.phase === 'draft' && !E.validate(S, { type: 'pick', p: a, hero: m.id })) btn = `<button class="btn primary big" data-act="doPick" data-id="${m.id}"><b>${t('modal_pick', { p: pname(a), hero: esc(I.heroName(m.id)) })}</b></button>`;
      }
      return heroDetail(m.id) + btn;
    }
    if (m.type === 'unit') {
      const u = E.unit(ui.S, m.uid);
      if (!u) return '';
      if (u.sm) {
        const s = D.summons[u.key];
        // 召喚物說明（裡面提到的角色、招式、狀態名稱用變數代入）
        const ds = SUMMON_DESC.includes(u.key) ? t('sm_desc_' + u.key, { golem: I.heroName('golem'), card: I.cardName('gm_will'), big: I.summonName('bigdog'), bleed: I.statusName('bleed') }) : '';
        return `<div class="detail"><div class="d-head"><span class="medal lg">${u.icon}</span><div><h3>${esc(I.unitName(u))}</h3><div class="muted">${t('summon')}${SEP()}❤️${u.hp}/${u.maxHp}${u.shield ? ' 🛡' + u.shield : ''}${s.undead ? SEP() + t('undead') : ''}</div></div></div><p>${ds}</p>
          <div class="sts big">${statusBadges(u, ui.S.round)}</div></div>`;
      }
      return heroDetail(u.key, u);
    }
    if (m.type === 'codex') return heroDetail(m.id);
    if (m.type === 'menu') {
      return `<div class="menu">
        ${langPicker()}
        <button class="btn" data-act="showLog">${t('btn_log')}</button>
        <button class="btn" data-act="codexFromGame">${t('btn_codex')}</button>
        <button class="btn" data-act="rulesFromGame">${t('btn_rules')}</button>
        <button class="btn" data-act="sound">${SFX.on ? t('sound_on') : t('sound_off')}</button>
        ${ui.S && ui.S.phase !== 'over' && ui.sides.length ? `<button class="btn danger" data-act="surrender">${t('menu_surrender')}</button>` : ''}
        <button class="btn" data-act="home">${t('btn_home')}${ui.mode !== 'online' ? t('menu_autosave') : ''}</button>
      </div>`;
    }
    if (m.type === 'log') return `<h3>${t('log_title')}</h3><div class="log-list tall">${ui.S.log.map(line => `<div class="lg ${/^══/.test(line) ? 'phase' : ''}">${esc(line)}</div>`).join('')}</div>`;
    if (m.type === 'confirm') return `<p class="confirm-text">${t(m.key)}</p><div class="btn-row"><button class="btn" data-act="closeModal">${t('cancel')}</button><button class="btn danger" data-act="${m.yes}"${m.id ? ` data-id="${esc(m.id)}"` : ''}>${t('ok')}</button></div>`;
    if (m.type === 'note') return renderNoteEditor();
    return '';
  }

  // ================= 角色圖鑑 =================
  const ALL_UNITS = D.heroes.concat(D.minions);
  const CX = () => GAME.CODEX || { roles: {}, summary: {}, tips: {}, counters: {}, combos: [] };
  const ROLE_LIST = ['坦克', '爆發', '範圍', '控制', '干擾', '輔助', '治療', '召喚', '刺客', '速度', '持續傷害', '資源'];
  const KW_STATUS = ['burn', 'chill', 'frozen', 'slow', 'vuln', 'curse', 'fatigue', 'pity', 'bleed'];
  // 關鍵字：名稱與說明放在語言檔（kw_<id>、kw_<id>_d）；和招式標籤、狀態、基本動作同名的直接共用那些名稱
  function keywords() {
    const K = (id, i, n) => ({ id, i, n: n || t('kw_' + id), d: t('kw_' + id + '_d') });
    return [
      K('shield', '🛡'),
      K('true', '🎯'),
      K('pierce', '🗡'),
      K('melee', '👊', rngName('melee')),
      K('ranged', '🏹', rngName('ranged')),
      K('back', '🌒', rngName('back')),
      K('pre', '🔮', t('tag_pre')),
      K('aoe', '💥', t('tag_aoe')),
      K('summon', '✨'),
      K('pull', '🪝'),
      K('knock', '💨'),
      K('stun', '💫', I.statusName('stun')),
      K('cd', '⏳'),
      K('basic', '♾️', t('tag_basic')),
      K('guard', '🔰', I.cardName('x_guard')),
      K('swap', '🔄', I.cardName('x_move')),
      K('lock', '🔒', t('tag_lock')),
      K('bank', '💰'),
    ].concat(KW_STATUS.map(k => ({ id: k, i: D.statuses[k].i, n: I.statusName(k), d: I.statusDesc(k) })));
  }
  const artEn = id => ((GAME.ART_PROMPTS || {})[id] || {}).en || '';
  // 目前語言的角色文字（名字、陣營、類型、定位、說明、被動、招式）；關鍵字比對只用這些
  function unitTextLoc(d) {
    const C = CX(), pa = I.passive(d.id);
    return [I.heroName(d.id), I.factionName(d.f), typeLabel(d), (C.roles[d.id] || []).map(I.roleName).join(' '),
      I.codex('summary', d.id, C.summary[d.id] || ''), guided() ? I.codex('tips', d.id, C.tips[d.id] || '') : '',
      pa ? pa.n + pa.d : '', d.cards.map(c => I.cardName(c.id) + ' ' + I.cardDesc(c.id) + (c.pre ? ' ' + t('tag_pre') : '') + (c.aoe ? ' ' + t('tag_aoe') : '') + (c.rng ? ' ' + rngName(c.rng) : '')).join(' ')].join(' ').toLowerCase();
  }
  // 搜尋用：再加上中文名字、id 與英文稱號，任何語言都能搜得到
  function unitText(d) {
    return [unitTextLoc(d), d.n, d.id, artEn(d.id)].join(' ').toLowerCase();
  }
  function heroChip(id, why, wr) {
    const d = E.DEF[id];
    if (!d) return '';
    return `<button class="cx-chip" data-act="cxHero" data-id="${id}" style="--fc:${D.FACTIONS[d.f].color}">${face(id, d.icon, 'xs')}<span><b>${esc(I.heroName(id))}</b>${why ? `<small>${esc(why)}</small>` : ''}</span>${wr ? `<em>${t('cx_wr', { pct: Math.round(wr * 100) })}</em>` : ''}</button>`;
  }
  // 克制、被克制、連攜（圖鑑與選角時的詳細資料都會顯示）
  function codexInfo(id) {
    const C = CX();
    const roles = C.roles[id] || [];
    // 克制理由的翻譯 key 是「克制方|被克制方」
    const strong = (C.counters[id] || []).map(x => ({ id: x.id, why: I.codex('why', `${id}|${x.id}`, x.why), wr: x.wr }));
    const weak = [];
    Object.entries(C.counters).forEach(([k, list]) => list.forEach(x => { if (x.id === id) weak.push({ id: k, why: I.codex('why', `${k}|${id}`, x.why), wr: x.wr }); }));
    // 連攜的翻譯 key 是 ids 以 + 連接，回傳 { name, why, how }；沒翻譯就用中文
    const combos = (C.combos || []).filter(c => c.ids.includes(id)).map(c => {
      const tr = I.codex('combos', c.ids.join('+'), null) || {};
      return { ids: c.ids, name: tr.name || c.name, why: tr.why || c.why, how: tr.how || c.how };
    });
    const summary = I.codex('summary', id, C.summary[id]), tips = I.codex('tips', id, C.tips[id]);
    const show = guided(), hidden = !show && (tips || strong.length || weak.length || combos.length);
    const mine = notes().filter(n => n.heroes.includes(id));
    return `<div class="cx-info">
      ${roles.length ? `<div class="cx-roles">${roles.map(r => `<span class="cx-role">${esc(I.roleName(r))}</span>`).join('')}</div>` : ''}
      ${summary ? `<p class="cx-sum">${esc(summary)}</p>` : ''}
      ${show && tips ? `<div class="cx-tip">💡 ${esc(tips)}</div>` : ''}
      ${hidden ? `<div class="cx-tip cx-hidden">${t('cx_hidden')}</div>` : ''}
      ${show && strong.length ? `<h4>${t('cx_strong')}</h4><div class="cx-chips">${strong.map(x => heroChip(x.id, x.why, x.wr)).join('')}</div>` : ''}
      ${show && weak.length ? `<h4>${t('cx_weak')}</h4><div class="cx-chips">${weak.map(x => heroChip(x.id, x.why)).join('')}</div>` : ''}
      ${show && combos.length ? `<h4>${t('cx_combos')}</h4>${combos.map(c => `<div class="cx-combo"><b>${esc(c.name)}</b><div class="cx-chips">${c.ids.filter(x => x !== id).map(x => heroChip(x)).join('')}</div><p>${esc(c.why)}</p>${c.how ? `<p class="muted small">${t('cx_how', { how: esc(c.how) })}</p>` : ''}</div>`).join('')}` : ''}
      <h4>${t('notes_h')}</h4>
      ${mine.map(n => noteCard(n, id)).join('')}
      <button class="btn small note-add" data-act="noteNew" data-hero="${id}">${t('notes_add_hero', { hero: esc(I.heroName(id)) })}</button>
    </div>`;
  }

  // ---------- 我的發現：自己記下的組合與克制（只存在這台裝置的瀏覽器） ----------
  const NOTE_MAX_HEROES = 5;
  const notes = () => (LS.get(K_NOTES) || []).filter(n => n && n.id);
  const saveNotes = list => LS.set(K_NOTES, list);
  function noteCard(n, here) {
    let date = '';
    try { date = new Date(n.ts).toLocaleDateString(I.lang === 'zh' ? 'zh-TW' : I.lang); } catch (e) { /* ignore */ }
    const others = (n.heroes || []).filter(id => id !== here && E.DEF[id]);
    return `<div class="note" data-key="note-${esc(n.id)}">
      <div class="note-h"><b>${esc(n.title || t('notes_untitled'))}</b><small>${date}</small></div>
      ${others.length ? `<div class="note-heroes">${others.map(id => heroChip(id)).join('')}</div>` : ''}
      ${n.text ? `<p>${esc(n.text).replace(/\n/g, '<br>')}</p>` : ''}
      <div class="note-act"><button class="cx-filter" data-act="noteEdit" data-id="${esc(n.id)}">${t('note_edit')}</button><button class="cx-filter" data-act="noteDel" data-id="${esc(n.id)}">${t('note_del')}</button></div>
    </div>`;
  }
  function renderNoteEditor() {
    const n = ui.note;
    if (!n) return '';
    const picks = ALL_UNITS.map(d => `<button class="note-pick ${n.heroes.includes(d.id) ? 'on' : ''}" data-act="notePick" data-id="${d.id}" title="${esc(I.heroName(d.id))}" style="--fc:${D.FACTIONS[d.f].color}">${face(d.id, d.icon, 'xs')}</button>`).join('');
    return `<div class="note-ed" data-key="ned-${n.key}">
      <h3>${t(n.id ? 'note_edit_t' : 'note_new')}</h3>
      <label class="field">${t('note_title')}<input id="note-title" maxlength="40" value="${esc(n.title)}" placeholder="${esc(t('note_title_ph'))}" autocomplete="off"></label>
      <div class="field">${t('note_heroes', { n: NOTE_MAX_HEROES })}
        <div class="note-sel">${n.heroes.map(id => `<button class="chip" data-act="notePick" data-id="${id}">${E.DEF[id].icon} ${esc(I.heroName(id))} ✕</button>`).join('') || `<span class="small">${t('note_heroes_none')}</span>`}</div>
        <div class="note-picks">${picks}</div>
      </div>
      <label class="field">${t('note_text')}<textarea id="note-text" maxlength="600" rows="5" placeholder="${esc(t('note_text_ph'))}">${esc(n.text)}</textarea></label>
      <div class="btn-row"><button class="btn" data-act="noteCancel">${t('cancel')}</button><button class="btn primary" data-act="noteSave">${t('note_save')}</button></div>
    </div>`;
  }
  function openNote(n, heroes) {
    ui.note = { key: ++ui.noteSeq, id: n ? n.id : null, title: n ? n.title || '' : '', text: n ? n.text || '' : '', heroes: n ? (n.heroes || []).filter(id => E.DEF[id]) : heroes || [],
      back: ui.modal && ui.modal.type !== 'note' && ui.modal.type !== 'confirm' ? ui.modal : null };
    ui.modal = { type: 'note' };
    SFX.play('click');
    render();
    const m = app.querySelector('.modal');
    if (m) m.scrollTop = 0;
  }
  // 重畫之前先記下輸入中的標題與內容
  function syncNote() {
    const ti = document.getElementById('note-title'), tx = document.getElementById('note-text');
    if (ti) ui.note.title = ti.value;
    if (tx) ui.note.text = tx.value;
  }
  function closeNote() {
    ui.modal = (ui.note && ui.note.back) || null;
    ui.note = null;
    render();
  }
  function renderCodex() {
    const cx = ui.cx;
    const q = (cx.q || '').trim().toLowerCase();
    const C = CX();
    const chip = (k, v, label) => `<button class="cx-filter ${cx[k] === v ? 'on' : ''}" data-act="cxFilter" data-k="${k}" data-v="${v}">${label || v}</button>`;
    let body;
    if (cx.tab === 'kw') {
      const list = keywords().filter(k => !q || (k.n + k.d).toLowerCase().includes(q));
      const texts = ALL_UNITS.map(d => ({ d, txt: unitTextLoc(d) }));
      body = `<div class="cx-kws">${list.map(k => {
        // 語言檔可以用 kw_<id>_m 指定比對用的字根（用 | 分隔），例如法文 invoqu 同時對到 Invoque／Invocation
        const mk = `kw_${k.id}_m`, m = t(mk), terms = (m === mk ? k.n : m).toLowerCase().split('|');
        const users = texts.filter(x => terms.some(s => x.txt.includes(s))).map(x => x.d);
        return `<div class="cx-kw" data-key="kw-${k.id}"><div class="cx-kw-h"><span>${k.i}</span><b>${k.n}</b></div><p>${k.d}</p>${users.length ? `<div class="cx-chips">${users.map(d => heroChip(d.id)).join('')}</div>` : ''}</div>`;
      }).join('') || `<p class="muted center">${t('cx_no_kw')}</p>`}</div>`;
    } else if (cx.tab === 'notes') {
      const hay = n => [n.title, n.text].concat((n.heroes || []).map(id => `${I.heroName(id)} ${(E.DEF[id] || {}).n || ''} ${id}`)).join(' ').toLowerCase();
      const list = notes().filter(n => !q || hay(n).includes(q));
      body = `<button class="btn primary" data-act="noteNew">${t('notes_add')}</button>
        <p class="muted small center">${t('notes_local')}</p>
        <div class="notes">${list.map(n => noteCard(n)).join('') || `<p class="muted center">${q ? t('notes_none_q', { q: esc(cx.q) }) : t('notes_empty')}</p>`}</div>`;
    } else {
      const list = ALL_UNITS.filter(d => (!q || unitText(d).includes(q)) && (!cx.f || d.f === cx.f) && (!cx.t || (d.minion ? '小兵' : D.TYPES[d.type]) === cx.t) &&
        (!cx.c || String(d.cost) === cx.c) && (!cx.r || (C.roles[d.id] || []).includes(cx.r)));
      body = `<div class="cx-filters">
          <div>${chip('f', '', t('cx_all_f'))}${['王室', '北境', '深淵', '聖堂', '小兵'].map(v => chip('f', v, I.factionName(v))).join('')}</div>
          <div>${chip('t', '', t('cx_all_t'))}${Object.keys(D.TYPES).map(k => chip('t', D.TYPES[k], I.typeName(k))).join('')}${chip('c', '', t('cx_all_c'))}${['5', '3', '1'].map(v => chip('c', v, t('cx_cost', { n: v }))).join('')}</div>
          <div>${chip('r', '', t('cx_all_r'))}${ROLE_LIST.map(v => chip('r', v, I.roleName(v))).join('')}</div>
        </div>
        <p class="muted small">${q ? t('cx_count_q', { n: list.length, q: esc(cx.q) }) : t('cx_count', { n: list.length })}</p>
        <div class="hero-grid">${list.map((d, i) => heroCard(d, { i, attrs: `data-key="cx-${d.id}" data-act="cxHero" data-id="${d.id}"` })).join('') || `<p class="muted">${t('cx_none')}</p>`}</div>`;
    }
    return `<div class="page codex">
      <div class="topbar"><button class="icon-btn" data-act="cxBack">←</button><div class="title">${t('cx_title')}</div><span></span></div>
      <div class="cx-search"><input id="cxq" type="search" placeholder="${esc(t('cx_placeholder'))}" value="${esc(cx.q || '')}" autocomplete="off"></div>
      <div class="cx-tabs"><button class="${!['kw', 'notes'].includes(cx.tab) ? 'on' : ''}" data-act="cxTab" data-v="heroes">${t('cx_tab_heroes')}</button><button class="${cx.tab === 'kw' ? 'on' : ''}" data-act="cxTab" data-v="kw">${t('cx_tab_kw')}</button><button class="${cx.tab === 'notes' ? 'on' : ''}" data-act="cxTab" data-v="notes">${t('cx_tab_notes')}</button></div>
      ${hintPicker()}
      ${body}
    </div>`;
  }

  // ================= 互動 =================
  function onCell(el) {
    const S = ui.S;
    const uid = el.dataset.uid ? +el.dataset.uid : null;
    const side = +el.dataset.side, slot = el.dataset.slot !== undefined ? +el.dataset.slot : null;
    const a = actor();
    if (!ui.pb && S.phase === 'plan' && a !== null) {
      if (ui.targeting) {
        const c = E.CARD[ui.targeting.card];
        const list = E.validTargets(S, ui.targeting.uid, c.id);
        if (c.tgt === 'cell') {
          if (side === 1 - a && slot !== null && list.includes(slot)) return addPlan(ui.targeting.uid, c.id, slot);
        } else if (uid !== null && list.includes(uid)) return addPlan(ui.targeting.uid, c.id, uid);
        return toast(t('toast_pick_glow'));
      }
      const u = uid !== null ? E.unit(S, uid) : null;
      if (u && u.side === a && u.alive && !u.sm) { ui.sel = ui.sel === uid ? null : uid; SFX.play('click'); return render(); }
    }
    if (uid !== null) { ui.modal = { type: 'unit', uid }; render(); }
  }
  function addPlan(uid, card, target) {
    ui.plan.actions.push({ uid, card, target });
    ui.targeting = null;
    SFX.play('select');
    render();
    if (target !== undefined && target !== null) {
      const el = typeof target === 'number' && E.unit(ui.S, target) && E.CARD[card].tgt !== 'cell' ? uel(target) : null;
      if (el) FX.ring(el, 'target');
    }
  }
  function onCard(id) {
    const c = E.CARD[id];
    if (['enemy', 'ally', 'allyFront', 'allyHero', 'cell'].includes(c.tgt)) {
      const list = E.validTargets(ui.S, ui.sel, id);
      if (list.length === 1 && c.tgt !== 'cell') return addPlan(ui.sel, id, list[0]);
      ui.targeting = { uid: ui.sel, card: id };
      SFX.play('click');
      return render();
    }
    addPlan(ui.sel, id, undefined);
  }

  const H = {
    noop() {},
    start: el => startLocal(el.dataset.mode),
    resume: resumeLocal,
    resumeOnline() {
      const on = savedOnline();
      if (on) joinRoom(on.code, on.role, on.name, false, on.cid, on.net);
    },
    rules() { ui.screen = 'rules'; ui.rulesBack = 'home'; render(); },
    rulesFromGame() { ui.modal = null; ui.screen = 'rules'; ui.rulesBack = 'game'; render(); },
    codex() { ui.screen = 'codex'; ui.cxBack = 'home'; render(); },
    codexFromGame() { ui.modal = null; ui.screen = 'codex'; ui.cxBack = 'game'; render(); },
    cxBack() { ui.modal = null; ui.screen = ui.cxBack === 'game' && ui.S ? 'game' : 'home'; render(); },
    cxTab(el) { ui.cx.tab = el.dataset.v; render(); },
    cxFilter(el) { ui.cx[el.dataset.k] = el.dataset.v; SFX.play('click'); render(); },
    cxHero(el) { ui.modal = { type: 'codex', id: el.dataset.id }; SFX.play('click'); render(); const m = app.querySelector('.modal'); if (m) m.scrollTop = 0; },
    back() { ui.screen = ui.rulesBack === 'game' && ui.S ? 'game' : 'home'; render(); },
    sound() { SFX.on = !SFX.on; LS.set(K_SOUND, SFX.on); if (SFX.on) SFX.play('select'); render(); },
    hints(el) {
      if (ui.screen === 'home') readNames();
      ui.hints = el.dataset.v === 'challenge' ? 'challenge' : 'guided';
      LS.set(K_HINTS, ui.hints);
      SFX.play('click');
      render();
    },
    // 我的發現
    noteNew(el) { openNote(null, el.dataset.hero ? [el.dataset.hero] : []); },
    noteEdit(el) { const n = notes().find(x => x.id === el.dataset.id); if (n) openNote(n); },
    noteDel(el) {
      ui.modal = { type: 'confirm', key: 'confirm_note_del', yes: 'noteDelYes', id: el.dataset.id, back: ui.modal && ui.modal.type !== 'confirm' ? ui.modal : null };
      render();
    },
    noteDelYes(el) {
      saveNotes(notes().filter(n => n.id !== el.dataset.id));
      ui.modal = (ui.modal && ui.modal.back) || null;
      toast(t('toast_note_deleted'));
      render();
    },
    notePick(el) {
      syncNote();
      const hs = ui.note.heroes, id = el.dataset.id, i = hs.indexOf(id);
      if (i >= 0) hs.splice(i, 1);
      else if (hs.length >= NOTE_MAX_HEROES) return toast(t('toast_note_max', { n: NOTE_MAX_HEROES }));
      else hs.push(id);
      SFX.play('click');
      render();
    },
    noteCancel: closeNote,
    noteSave() {
      syncNote();
      const n = ui.note, title = n.title.trim().slice(0, 40), text = n.text.trim().slice(0, 600);
      if (!title && !text) return toast(t('toast_note_empty'));
      const list = notes();
      const rec = { id: n.id || 'n' + Date.now().toString(36) + (rand32() >>> 0).toString(36), title, text, heroes: n.heroes.slice(), ts: Date.now() };
      const i = list.findIndex(x => x.id === rec.id);
      if (i >= 0) list[i] = rec; else list.unshift(rec);
      saveNotes(list);
      SFX.play('select');
      toast(t('toast_note_saved'));
      closeNote();
    },
    // 切換語言：首頁先記下輸入中的名字；預設名稱跟著換成新語言
    lang(el) {
      if (ui.screen === 'home') readNames();
      I.setLang(el.dataset.l);
      ui.names = fixNames(ui.names);
      SFX.play('click');
      render();
    },
    home() {
      ui.modal = null;
      if (ui.mode !== 'online') saveLocal();
      leaveRoom();
      clearTimeout(ui.pbTimer); clearTimeout(ui.aiTimer); ui.aiTimer = null;
      ui.pb = null;
      ui.screen = 'home';
      render();
    },
    lobby: openLobby,
    install: installApp,
    async createRoom() {
      const L = ui.lobby;
      if (L.busy) return;
      const n = (document.getElementById('myname').value || '').trim().slice(0, 10) || t('host_name');
      ui.names[0] = n; LS.set(K_NAMES, ui.names);
      if (L.net === 'p2p') {
        // 網路對戰：先向 PeerJS 伺服器登記房間（1～3 秒），成功才顯示代碼
        L.busy = true; L.err = '';
        render();
        try {
          const r = await Net.P2P.create();
          L.busy = false;
          if (ui.lobby !== L || ui.screen !== 'lobby' || L.step !== 'menu') { r.peer.destroy(); return; }   // 等待時已經離開大廳
          joinRoom(r.code, 'host', n, true, null, 'p2p', r.peer);
        } catch (e) {
          L.busy = false; L.err = e.code || 'signal';
          if (ui.lobby === L && ui.screen === 'lobby') render();
        }
        return;
      }
      try { const r = await Net.create(); joinRoom(r.code, 'host', n, true); }
      catch (e) { toast(t('toast_create_fail', { err: e.message })); }
    },
    joinRoom() {
      if (ui.lobby.busy) return;
      const code = (document.getElementById('roomcode').value || '').trim().toUpperCase();
      const n = (document.getElementById('myname').value || '').trim().slice(0, 10) || t('guest_name');
      if (code.length !== 4) return toast(t('toast_code4'));
      joinRoom(code, 'guest', n, true, null, ui.lobby.net);
    },
    leaveRoom() {
      // 網路對戰的房主離開房間：房間就關了，刪掉這台裝置保存的訊息紀錄
      if (ui.on && ui.on.net === 'p2p' && ui.role === 'host' && Net.P2P) Net.P2P.forget(ui.on.code);
      leaveRoom(); clearOnline(); backToMenu();
    },
    netPick(el) {
      const L = ui.lobby, name = document.getElementById('myname');
      if (name) ui.names[0] = name.value.trim().slice(0, 10) || ui.names[0];
      L.net = el.dataset.v === 'p2p' ? 'p2p' : 'lan';
      L.err = '';
      LS.set(K_NET, L.net);
      SFX.play('click');
      render();
    },
    menu() { ui.modal = { type: 'menu' }; render(); },
    closeModal(el, ev) {
      if (ev.target !== el || (ui.modal && ui.modal.type === 'note')) return;
      ui.modal = (ui.modal && ui.modal.back) || null;
      render();
    },
    showLog() { ui.modal = { type: 'log' }; render(); },
    surrender() { ui.modal = { type: 'confirm', key: 'confirm_surrender', yes: 'doSurrender' }; render(); },
    doSurrender() {
      ui.modal = null;
      const p = actor() !== null ? actor() : ui.sides[0];
      dispatch({ type: 'surrender', p });
    },
    rematch() {
      if (ui.mode === 'online') {
        if (!ui.sides.length) return toast(t('toast_spectator'));
        ui.room.send({ t: 'newgame', seed: rand32() });
        return;
      }
      LS.del(K_LOCAL);
      const names = ui.S.names;
      ui.names = ui.mode === 'ai' ? [names[0], ui.names[1]] : names.slice();
      const mode = ui.mode;
      ui.screen = 'home';
      render();
      startLocal(mode);
    },
    uncover(el) { ui.coverKey = el.dataset.cover; SFX.play('select'); render(); },
    hero(el) { ui.modal = { type: 'hero', id: el.dataset.id }; SFX.play('click'); render(); },
    doBan(el) { const a = actor(); ui.modal = null; dispatch({ type: 'ban', p: a, hero: el.dataset.id }); },
    doPick(el) { const a = actor(); ui.modal = null; dispatch({ type: 'pick', p: a, hero: el.dataset.id }); },
    // 佈陣
    dadd(el) {
      const dep = ui.dep, key = el.dataset.key2;
      const empty = [0, 1, 2, 3].find(s => !dep.slots[s]);
      if (empty === undefined) return toast(t('toast_max_units', { n: E.MAX_UNITS }));
      const cost = dep.slots.filter(Boolean).reduce((n, k) => n + E.DEF[k].cost, 0) + E.DEF[key].cost;
      if (cost > E.MAX_COST) return toast(t('toast_cost_over', { n: E.MAX_COST }));
      const s = dep.sel !== null && !dep.slots[dep.sel] ? dep.sel : empty;
      // 站位規則（meleeFront）：巨人不能放後排
      if (giantBack(key, s)) { dep.sel = null; render(); return toast(giantFrontMsg(actor(), s)); }
      dep.slots[s] = key;
      dep.ids[s] = ++dep.n;
      dep.sel = null;
      SFX.play('pick');
      render();
    },
    dslot(el) {
      const dep = ui.dep, s = +el.dataset.slot;
      if (dep.sel === null) { dep.sel = s; SFX.play('click'); }
      else if (dep.sel === s) { dep.sel = null; }
      else if (giantBack(dep.slots[dep.sel], s) || giantBack(dep.slots[s], dep.sel)) {
        // 交換後巨人會到後排（meleeFront）：擋下
        const to = dep.slots[dep.sel] === 'giant' ? s : dep.sel;
        dep.sel = null;
        render();
        return toast(giantFrontMsg(actor(), to));
      } else {
        [dep.slots[s], dep.slots[dep.sel]] = [dep.slots[dep.sel], dep.slots[s]];
        [dep.ids[s], dep.ids[dep.sel]] = [dep.ids[dep.sel], dep.ids[s]];
        dep.sel = null;
        SFX.play('swing');
      }
      render();
    },
    dremove(el) { const s = +el.dataset.slot; ui.dep.slots[s] = null; ui.dep.ids[s] = null; ui.dep.sel = null; render(); },
    dclear() { ui.dep.slots = [null, null, null, null]; ui.dep.ids = [null, null, null, null]; ui.dep.sel = null; render(); },
    dsubmit() {
      const a = actor();
      const units = ui.dep.slots.map((key, slot) => key && { key, slot }).filter(Boolean);
      if (dispatch({ type: 'deploy', p: a, units })) ui.dep = null;
    },
    // 出招
    cell: onCell,
    card: el => onCard(el.dataset.id),
    cancelTarget() { ui.targeting = null; render(); },
    deselect() { ui.sel = null; render(); },
    unplan(el) { ui.plan.actions.splice(+el.dataset.i, 1); SFX.play('click'); render(); },
    clearPlan() { ui.plan.actions = []; ui.targeting = null; render(); },
    unitInfo(el) { ui.modal = { type: 'unit', uid: +el.dataset.uid }; render(); },
    submitPlan() {
      if (!ui.plan.actions.length) {
        ui.modal = { type: 'confirm', key: 'confirm_rest', yes: 'submitPlanYes' };
        return render();
      }
      H.submitPlanYes();
    },
    submitPlanYes() {
      ui.modal = null;
      const a = actor();
      const actions = ui.plan.actions.map(x => ({ uid: x.uid, card: x.card, target: x.target }));
      if (dispatch({ type: 'plan', p: a, actions })) { ui.sel = null; ui.targeting = null; }
      else render();
    },
    // 播放
    pbSkipReveal() { pbBegin(); },
    pbPrev() { if (ui.pb.stage !== 'events') return; ui.pb.auto = false; ui.pb.done = false; pbShow(ui.pb.i - 1, false); },
    pbNext() { if (ui.pb.stage !== 'events') return pbBegin(); ui.pb.auto = false; pbShow(ui.pb.i + 1, true); },
    pbToggle() {
      const pb = ui.pb;
      if (pb.stage !== 'events') return pbBegin();
      pb.auto = !pb.auto;
      if (pb.auto) pbShow(pb.i + 1, true); else { clearTimeout(ui.pbTimer); render(); }
    },
    pbSpeed() { ui.pbSpeed = ui.pbSpeed === 1 ? 2 : ui.pbSpeed === 2 ? 4 : 1; LS.set(K_SPEED, ui.pbSpeed); render(); },
    pbEnd() { const pb = ui.pb; clearTimeout(ui.pbTimer); pb.stage = 'events'; pb.auto = false; pb.i = pb.events.length - 1; pb.done = true; render(); },
    pbClose: endPlayback,
  };

  app.addEventListener('click', ev => {
    const el = ev.target.closest('[data-act]');
    if (!el || el.disabled) return;
    const fn = H[el.dataset.act];
    if (!fn) return;
    if (el.dataset.act !== 'closeModal') ev.stopPropagation();
    fn(el, ev);
  });
  app.addEventListener('input', ev => {
    if (ev.target.id === 'cxq') { ui.cx.q = ev.target.value; render(); }
  });
  app.addEventListener('keydown', ev => {
    if (ev.key === 'Enter' && ev.target.id === 'roomcode') H.joinRoom();
  });
  document.addEventListener('keydown', ev => {
    if (ev.key === 'Escape') {
      if (ui.modal && ui.modal.type === 'note') closeNote();
      else if (ui.modal) { ui.modal = (ui.modal.back) || null; render(); }
      else if (ui.targeting) { ui.targeting = null; render(); }
      else if (ui.sel) { ui.sel = null; render(); }
    } else if (ui.pb && (ev.key === ' ' || ev.key === 'ArrowRight')) {
      ev.preventDefault();
      if (ui.pb.done) endPlayback(); else H.pbNext();
    }
  });
  window.addEventListener('resize', () => { if (ui.screen === 'game') render(); });

  // 測試用
  // test.swapData／test.cardTags：在指定局面、指定的我方出招下算換位速度提示的資料、招式標籤（暫時借用 ui.S／ui.plan，算完還原）
  function withState(S, actions, f) {
    const keep = [ui.S, ui.plan];
    ui.S = S; ui.plan = { key: 'test', actions: actions || [] };
    try { return f(); } finally { ui.S = keep[0]; ui.plan = keep[1]; }
  }
  const test = {
    swapData: (S, me, actions) => withState(S, actions, () => swapData(S, me)),
    swapHints: (S, me, actions) => withState(S, actions, () => swapHints(S, me)),
    cardTags: (S, id) => withState(S, [], () => cardTags(E.CARD[id], false)),
  };
  GAME.UI = { ui, render, test, pwa };
  render();
  registerSW();
})();
