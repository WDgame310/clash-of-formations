// 網路對戰（不用 server.py，放在 GitHub Pages 等 https 網站上也能玩）：兩台裝置用 WebRTC 直接連線。
// 用 PeerJS（js/peerjs.min.js，1.5.5 版，MIT 授權，第一次用到時才載入）和它免費的公用伺服器 0.peerjs.com 讓兩台裝置互相找到；
// 找到之後出招直接在兩台裝置之間傳送（無法直連時，經由 PeerJS 內建的公用轉送伺服器）。
//
// 用法跟 net.js 的 Room 一樣：send(msg) → Promise、stop()；所有訊息（含自己送出的）依同樣的順序交給 onMsgs，
// 兩台裝置各自用引擎重播，所以 ui.js 的鎖步邏輯不用改。差別在「誰保存訊息紀錄」：
// - 房主（建立房間的裝置）扮演伺服器：決定訊息順序、保存整份紀錄（存在這台裝置的 localStorage，重新整理也還在）。
//   房主的 PeerJS ID = 'yzdj-v1-' + 房間代碼，所以挑戰者只要知道代碼就連得到。
// - 挑戰者每次連線用隨機 ID，連上後告訴房主「我已經有前 since 則」，房主從那裡補送；斷線就自動重連。
// - 房主的紀錄不見了（清掉資料、換了瀏覽器）但挑戰者還有：房主請挑戰者把紀錄補回來。
//
// 連線上的訊息（JSON）：
//   挑戰者 → 房主：{ k: 'hi', since }           請從第 since 則開始送（之後的新訊息也會送來）
//                  { k: 'send', id, m }         送出一則訊息；id 用來去掉重複（斷線後重送不會變成兩則）
//                  { k: 'restore', from, msgs } 回應 need：把房主缺少的紀錄補回去
//                  { k: 'ping' }                每 4 秒一次；房主回 pong（雙方都靠這個判斷對方還在不在）
//   房主 → 挑戰者：{ k: 'log', from, msgs }     從第 from 則開始的訊息（PeerJS 的 JSON 一次最多約 16 KB，所以分批）
//                  { k: 'ack', id }
//                  { k: 'need', from }          我的紀錄只有 from 則，請補給我
//                  { k: 'pong' }
// 回報給 onStatus(ok, 代碼) 的代碼（ok 為 false 時；ui.js 用 p2p_err_<代碼> 顯示說明）：
//   connecting 連線中、load 載入 PeerJS 失敗、unsupported 瀏覽器沒有 WebRTC、signal 連不上 0.peerjs.com、
//   host_away 房主不在線上、p2p 兩台裝置無法直接連線、id_taken 房間還開在別的分頁或裝置、
//   no_room 剛加入就找不到房間（ui.js 會退回大廳）
(function () {
  const Net = GAME.Net = GAME.Net || {};
  const PREFIX = 'yzdj-v1-';
  const CODE_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';   // 跟 server.py 一樣（沒有 0/O、1/I），32 個字
  const LOG_KEY = 'yzdj_p2p_';            // + 房間代碼：房主的訊息紀錄 { t: 最後更新時間, log: [...] }
  const LOG_TTL = 3 * 24 * 3600 * 1000;   // 3 天沒動的紀錄，建立新房間時順便清掉
  const MAX_LOG = 5000, MAX_MSG = 8000;   // 跟 server.py 一樣最多 5000 則；一則最多 8 KB
  const CHUNK = 12000;                    // 補送紀錄時一批最多 12 KB
  const TICK = 1000, PING = 4000, DEAD = 12000, OPEN_WAIT = 20000, SIGNAL_WAIT = 15000;
  const DELAYS = [1000, 2000, 3000, 5000];   // 重試間隔：越失敗等越久
  const OPTS = { debug: 0 };              // 用 PeerJS 的預設伺服器（0.peerjs.com）與 STUN／TURN 設定
  const SRC = 'js/peerjs.min.js';

  // 外部依賴集中在這裡，測試（tests/net.test.js、tests/ui-smoke.html）換成假的
  const env = {
    Peer: null,   // PeerJS 的 Peer；null = 用 window.Peer（第一次用到時載入 SRC）
    now: () => Date.now(),
    setTimeout: (f, ms) => setTimeout(f, ms),
    clearTimeout: id => clearTimeout(id),
    store: {
      get(k) { try { return JSON.parse(localStorage.getItem(k)); } catch (e) { return null; } },
      set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* 無痕模式、空間滿了：紀錄只在記憶體裡 */ } },
      del(k) { try { localStorage.removeItem(k); } catch (e) { /* ignore */ } },
      keys() { try { return Object.keys(localStorage); } catch (e) { return []; } },
    },
    win: typeof window !== 'undefined' ? window : null,   // 頁面事件（切回前景、網路恢復、離開頁面）；測試時是 null
    rtc: () => typeof RTCPeerConnection !== 'undefined',
  };

  const supported = () => !!env.rtc();
  const peerClass = () => env.Peer || (env.win && env.win.Peer) || null;
  const fail = code => Object.assign(new Error(code), { code });
  function rand(n) {
    const a = new Uint32Array(n);
    if (window.crypto && crypto.getRandomValues) crypto.getRandomValues(a);
    else for (let i = 0; i < n; i++) a[i] = Math.random() * 4294967296;
    return Array.from(a, x => CODE_CHARS[x % CODE_CHARS.length]).join('');
  }
  const enc = typeof TextEncoder !== 'undefined' ? new TextEncoder() : null;
  const size = o => { const s = JSON.stringify(o); return enc ? enc.encode(s).length : s.length * 3; };
  const valid = m => !!m && typeof m === 'object' && !Array.isArray(m) && typeof m.t === 'string' && size(m) <= MAX_MSG;
  // 把 log[from..] 切成好幾批 { k, from, msgs }，每批不超過 CHUNK
  function batches(k, log, from) {
    const out = [];
    let cur = [], bytes = 0, start = from;
    for (let i = from; i < log.length; i++) {
      const n = size(log[i]) + 1;
      if (cur.length && bytes + n > CHUNK) { out.push({ k, from: start, msgs: cur }); cur = []; bytes = 0; start = i; }
      cur.push(log[i]);
      bytes += n;
    }
    if (cur.length) out.push({ k, from: start, msgs: cur });
    return out;
  }

  // ---------- 載入 PeerJS（只有用到網路對戰時才載入；發佈版由 sw.js 預先存好，離線也拿得到檔案） ----------
  let loading = null;
  function load() {
    const P = peerClass();
    if (P) return Promise.resolve(P);
    if (!loading) {
      loading = new Promise((resolve, reject) => {
        const s = document.createElement('script');
        s.src = SRC;
        s.onload = () => (window.Peer ? resolve(window.Peer) : reject(fail('load')));
        s.onerror = () => { s.remove(); reject(fail('load')); };
        document.head.appendChild(s);
      }).catch(e => { loading = null; throw e; });   // 失敗（例如離線又還沒存）之後可以再試
    }
    return loading;
  }

  // ---------- 房主紀錄（localStorage） ----------
  const readLog = code => { const r = env.store.get(LOG_KEY + code); return r && Array.isArray(r.log) ? r.log : null; };
  function cleanup() {
    const now = env.now();
    env.store.keys().filter(k => k.startsWith(LOG_KEY)).forEach(k => {
      const r = env.store.get(k);
      if (!r || !(now - r.t < LOG_TTL)) env.store.del(k);
    });
  }

  // ---------- 建立房間 ----------
  // 用隨機代碼向 PeerJS 伺服器登記房主 ID（代碼被用掉了就換一個），登記成功才把代碼給玩家看。
  // 回傳 { code, peer }：peer 交給 new P2PRoom(code, 'host', …, { peer }) 接手。失敗時 error.code = signal／unsupported／load
  function createWith(P, done) {
    let tries = 0;
    const attempt = () => {
      const code = rand(4);
      let peer = null, over = false;
      const end = (why) => {
        if (over) return;
        over = true;
        env.clearTimeout(timer);
        if (!why) return done(null, { code, peer });
        try { if (peer) peer.destroy(); } catch (e) { /* ignore */ }
        if (why === 'retry') attempt(); else done(fail(why));
      };
      const timer = env.setTimeout(() => end('signal'), SIGNAL_WAIT);
      try { peer = new P(PREFIX + code, OPTS); } catch (e) { return end('unsupported'); }
      peer.on('open', () => end(''));
      peer.on('error', e => {
        const type = e && e.type;
        if (type === 'unavailable-id' && ++tries < 5) end('retry');
        else end(type === 'browser-incompatible' ? 'unsupported' : 'signal');
      });
    };
    attempt();
  }
  function create() {
    if (!supported()) return Promise.reject(fail('unsupported'));
    cleanup();
    return load().then(P => new Promise((resolve, reject) => createWith(P, (err, r) => (err ? reject(err) : resolve(r)))));
  }

  // ---------- 房間 ----------
  // role：'host' 或 'guest'。opts.isNew：剛加入（找不到房主就回報 no_room）；opts.peer：create() 登記好的房主 peer
  function Room(code, role, onMsgs, onStatus, opts) {
    opts = opts || {};
    this.code = code;
    this.role = role === 'host' ? 'host' : 'guest';
    this.onMsgs = onMsgs;
    this.onStatus = onStatus || (() => {});
    this.isNew = !!opts.isNew;
    this.hostId = PREFIX + code;
    this.tag = rand(6);         // 這次開啟的代號：訊息 id 用它開頭，重新整理後不會跟之前的撞到
    this.seq = 0;
    this.stopped = false;
    this.peer = null;
    this.peerAt = 0;
    this.log = [];              // 房主：整份紀錄；挑戰者：收到的紀錄
    this.fails = 0;
    this.retryAt = 0;
    this.why = 'connecting';
    this.sent = { ok: false, why: 'connecting' };   // 上次回報給 onStatus 的狀態（ui.js 一開始就當作「連線中」）
    this.timer = null;
    this.selfTimer = null;
    if (this.role === 'host') {
      this.ids = new Set();
      this.conns = [];
      this.selfAt = 0;
      (readLog(code) || []).forEach(m => { this.log.push(m); if (m && m._id) this.ids.add(m._id); });
      if (this.log.length) this._toSelf();
    } else {
      this.conn = null;
      this.connAt = 0;
      this.lastIn = 0;
      this.lastPing = 0;
      this.outbox = [];
      this.everOpen = false;
    }
    this._bind();
    if (opts.peer) this._use(opts.peer);
    this.timer = env.setTimeout(() => this._tick(), 0);
  }

  Room.prototype.send = function (msg) {
    if (this.stopped) return Promise.reject(fail('stopped'));
    if (!valid(msg)) return Promise.reject(fail('too_big'));
    const id = this.tag + '.' + (++this.seq);
    if (this.role === 'host') {
      if (!this._append(Object.assign({}, msg, { _id: id }))) return Promise.reject(fail('full'));
      return Promise.resolve({ seq: this.log.length });
    }
    // 挑戰者：先排隊，連上房主時送出；房主收到（ack 或在紀錄裡看到）才算完成。斷線期間不會失敗，重新連上會自動重送
    return new Promise(resolve => {
      this.outbox.push({ id, m: msg, resolve });
      this._out({ k: 'send', id, m: msg });
    });
  };

  Room.prototype.stop = function () {
    if (this.stopped) return;
    this.stopped = true;
    env.clearTimeout(this.timer);
    env.clearTimeout(this.selfTimer);
    this._unbind();
    this._kill();
  };

  // 切回前景、網路恢復：不用等重試間隔，馬上檢查
  Room.prototype.wake = function () {
    if (this.stopped) return;
    const now = env.now();
    this.retryAt = 0;
    // 在背景時計時器會被瀏覽器放慢（ping 送得很少）：給對方 5 秒回應，不要一切回前景就判定斷線
    const grace = now - DEAD + 5000;
    if (this.role === 'guest') {
      this.lastIn = Math.max(this.lastIn, grace);
      if (this.conn && this.conn.open) { this.lastPing = now; this._out({ k: 'ping' }); }
    } else this.conns.forEach(c => { c.last = Math.max(c.last, grace); });
    this._report();
    this._tick();
  };

  Room.prototype._bind = function () {
    const w = env.win;
    if (!w || !w.addEventListener) return;
    this._onWake = () => { if (!w.document || w.document.visibilityState !== 'hidden') this.wake(); };
    // 離開頁面（重新整理、關閉分頁）：馬上關掉連線、交還 ID，對方才會立刻知道，重新整理後也能用回同一個房主 ID。
    // 頁面從返回快取（bfcache）回來時 pageshow → wake() 再重新連線
    this._onHide = () => { if (!this.stopped) { this._kill(); this.why = 'connecting'; this.retryAt = Infinity; } };
    w.addEventListener('online', this._onWake);
    w.addEventListener('pageshow', this._onWake);
    w.addEventListener('pagehide', this._onHide);
    if (w.document) w.document.addEventListener('visibilitychange', this._onWake);
  };
  Room.prototype._unbind = function () {
    const w = env.win;
    if (!w || !this._onWake) return;
    w.removeEventListener('online', this._onWake);
    w.removeEventListener('pageshow', this._onWake);
    w.removeEventListener('pagehide', this._onHide);
    if (w.document) w.document.removeEventListener('visibilitychange', this._onWake);
  };

  // 關掉 PeerJS（連帶關掉所有連線）
  Room.prototype._kill = function () {
    const p = this.peer;
    this.peer = null;
    if (this.role === 'host') this.conns = []; else this.conn = null;
    if (p) try { p.destroy(); } catch (e) { /* ignore */ }
  };
  Room.prototype._later = function (min) {
    this.retryAt = env.now() + Math.max(min || 0, DELAYS[Math.min(this.fails, DELAYS.length - 1)]);
    this.fails++;
  };
  Room.prototype._live = function () {
    if (this.role === 'host') return !!(this.peer && this.peer.open) || this.conns.some(c => c.conn.open);
    return !!(this.conn && this.conn.open);
  };
  Room.prototype._report = function () {
    if (this.stopped) return;
    const ok = this._live(), why = ok ? '' : this.why || 'connecting';
    if (ok === this.sent.ok && why === this.sent.why) return;
    this.sent = { ok, why };
    this.onStatus(ok, why);
  };
  Room.prototype._emit = function (msgs) {
    if (this.stopped || !msgs.length) return;
    try { this.onMsgs(msgs); } catch (e) { env.setTimeout(() => { throw e; }, 0); }   // 介面出錯不要弄亂連線的狀態
  };

  // 每秒檢查一次：沒有 peer 就建立、跟 PeerJS 伺服器斷線就重新登記、挑戰者沒連上房主就連
  Room.prototype._tick = function () {
    env.clearTimeout(this.timer);
    this.timer = null;
    if (this.stopped) return;
    try { this._step(); } finally { if (!this.stopped) this.timer = env.setTimeout(() => this._tick(), TICK); }
  };
  Room.prototype._step = function () {
    const now = env.now();
    if (this.peer && this.peer.destroyed) this.peer = null;
    if (!this.peer) {
      if (now < this.retryAt) return this._report();
      if (!supported()) { this.why = 'unsupported'; this._later(60000); return this._report(); }
      const P = peerClass();
      if (!P) return this._loadLib();
      const id = this.role === 'host' ? this.hostId : this.hostId + '-' + rand(8);
      let peer;
      try { peer = new P(id, OPTS); } catch (e) { this.why = 'unsupported'; this._later(60000); return this._report(); }
      this._use(peer);
      return this._report();
    }
    const peer = this.peer;
    // PeerJS 伺服器一直沒回應（已經連上對方時不動它：重建 peer 會連帶切斷對局）
    if (!peer.open && !peer.disconnected && !this._live() && now - this.peerAt > SIGNAL_WAIT) {
      this.why = 'signal';
      this._kill();
      this._later();
      return this._report();
    }
    if (peer.disconnected && now >= this.retryAt) {
      // 跟 PeerJS 伺服器斷線（換網路、伺服器重啟）：已經連上的對方不受影響，重新登記同一個 ID
      this._later();
      this.peerAt = now;
      try { peer.reconnect(); } catch (e) { this._kill(); return this._report(); }
    }
    if (this.role === 'host') this._hostStep(now); else this._guestStep(now);
    this._report();
  };
  Room.prototype._loadLib = function () {
    if (this.loading) return;
    this.loading = true;
    load().then(() => { this.loading = false; this._tick(); },
      () => { this.loading = false; this.why = 'load'; this._later(); this._report(); });
  };

  Room.prototype._use = function (peer) {
    this.peer = peer;
    this.peerAt = env.now();
    const mine = () => peer === this.peer && !this.stopped;
    if (peer.open) { this.fails = 0; this.why = ''; }
    peer.on('open', () => {
      if (!mine()) return;
      this.fails = 0;
      this.retryAt = 0;
      if (this.role === 'host') this.why = '';
      this._report();
      if (this.role === 'guest') this._tick();   // 馬上連房主
    });
    peer.on('connection', conn => {
      if (mine() && this.role === 'host') this._accept(conn);
      else try { conn.close(); } catch (e) { /* ignore */ }
    });
    peer.on('disconnected', () => {
      if (!mine()) return;
      if (!this.why) this.why = 'signal';
      this._later();
      this._report();
    });
    peer.on('close', () => {   // PeerJS 自己放棄了這個 peer（例如登記失敗）：下次檢查時重建
      if (!mine()) return;
      this.peer = null;
      if (this.role === 'host') this.conns = []; else this.conn = null;
      if (!this.why) this.why = 'signal';
      this._report();
    });
    peer.on('error', e => { if (mine()) this._peerError(e && e.type); });
  };
  Room.prototype._peerError = function (type) {
    if (type === 'peer-unavailable') {   // 挑戰者：PeerJS 伺服器上找不到房主
      this._closeConn();
      this.why = this.isNew && !this.everOpen ? 'no_room' : 'host_away';
    } else if (type === 'unavailable-id') {
      // 房主：這個房間的 ID 還被占著（舊分頁還沒放掉，或房間開在別的裝置）；挑戰者的隨機 ID 撞到了：換一個再試
      this.why = this.role === 'host' ? 'id_taken' : 'signal';
    } else if (type === 'browser-incompatible') {
      this.why = 'unsupported';
    } else if (type === 'webrtc') {
      if (this.role === 'guest' && this.conn && !this.conn.open) { this._closeConn(); this.why = 'p2p'; }
    } else {
      this.why = 'signal';   // network、server-error、socket-error、socket-closed、ssl-unavailable…
    }
    this._later(this.why === 'id_taken' ? 3000 : 0);
    this._report();
  };

  // ---------- 挑戰者 ----------
  Room.prototype._out = function (obj) {
    const c = this.conn;
    if (c && c.open) try { c.send(obj); } catch (e) { /* 下次重新連線時再送 */ }
  };
  Room.prototype._closeConn = function () {
    const c = this.conn;
    this.conn = null;
    if (c) try { c.close(); } catch (e) { /* ignore */ }
  };
  Room.prototype._guestStep = function (now) {
    const c = this.conn;
    if (c && c.open) {
      if (now - this.lastIn > DEAD) {   // 房主很久沒回應（多半是關掉、重新整理或斷網了，連線卻還沒斷）：重新連線
        this.why = 'host_away';
        this._closeConn();
      } else if (now - this.lastPing >= PING) {
        this.lastPing = now;
        this._out({ k: 'ping' });
      }
    } else if (c) {
      if (now - this.connAt > OPEN_WAIT) {   // 找得到房主，卻一直連不上：網路擋住了兩台裝置直接連線
        this.why = 'p2p';
        this._closeConn();
        this._later();
      }
    } else if (this.peer.open && now >= this.retryAt) this._connect();
  };
  Room.prototype._connect = function () {
    let conn = null;
    try { conn = this.peer.connect(this.hostId, { reliable: true, serialization: 'json' }); } catch (e) { /* ignore */ }
    if (!conn) return this._later();
    this.conn = conn;
    this.connAt = env.now();
    const mine = () => conn === this.conn && !this.stopped;
    conn.on('open', () => {
      if (!mine()) return;
      const now = env.now();
      this.lastIn = now;
      this.lastPing = now;
      this.fails = 0;
      this.everOpen = true;
      this.why = '';
      this._out({ k: 'hi', since: this.log.length });
      this.outbox.forEach(x => this._out({ k: 'send', id: x.id, m: x.m }));
      this._report();
    });
    conn.on('data', d => { if (mine()) { this.lastIn = env.now(); this._guestData(d); } });
    conn.on('close', () => {
      if (!mine()) return;
      this.conn = null;
      if (!this.why) this.why = 'host_away';
      this._later();
      this._report();
    });
    conn.on('error', () => {
      if (!mine()) return;
      this.why = conn.open ? 'host_away' : 'p2p';
      this._closeConn();
      this._later();
      this._report();
    });
  };
  Room.prototype._guestData = function (d) {
    if (!d || typeof d !== 'object') return;
    if (d.k === 'log' && Array.isArray(d.msgs)) {
      const have = this.log.length, from = d.from | 0;
      if (from > have) return this._out({ k: 'hi', since: have });   // 中間漏了（不應該發生）：請房主從缺的地方重送
      const fresh = d.msgs.slice(have - from);
      if (!fresh.length) return;
      fresh.forEach(m => { this.log.push(m); this._acked(m && m._id); });
      this._emit(fresh);
    } else if (d.k === 'ack') this._acked(d.id);
    else if (d.k === 'need') {   // 房主的紀錄比我少：把它缺的補回去，再重新同步
      batches('restore', this.log, Math.max(0, d.from | 0)).forEach(b => this._out(b));
      this._out({ k: 'hi', since: this.log.length });
    }
  };
  Room.prototype._acked = function (id) {
    if (!id || this.role !== 'guest') return;
    const i = this.outbox.findIndex(x => x.id === id);
    if (i >= 0) this.outbox.splice(i, 1)[0].resolve({ seq: this.log.length });
  };

  // ---------- 房主 ----------
  Room.prototype._to = function (c, obj) {
    if (c.conn.open) try { c.conn.send(obj); } catch (e) { /* 連線壞了：等它斷線後對方會重連 */ }
  };
  // 新增一則訊息：存起來、送給自己的畫面與所有已同步的挑戰者
  Room.prototype._append = function (m) {
    if (this.log.length >= MAX_LOG) return false;
    const i = this.log.length;
    this.log.push(m);
    if (m._id) this.ids.add(m._id);
    env.store.set(LOG_KEY + this.code, { t: env.now(), log: this.log });
    this.conns.forEach(c => { if (c.synced) this._to(c, { k: 'log', from: i, msgs: [m] }); });
    this._toSelf();
    return true;
  };
  // 自己的畫面也照紀錄的順序收：下一輪事件迴圈再交給 onMsgs（跟 server.py 版一樣是非同步的）
  Room.prototype._toSelf = function () {
    if (this.selfTimer) return;
    this.selfTimer = env.setTimeout(() => {
      this.selfTimer = null;
      const msgs = this.log.slice(this.selfAt);
      this.selfAt = this.log.length;
      this._emit(msgs);
    }, 0);
  };
  Room.prototype._accept = function (conn) {
    const c = { conn, synced: false, last: env.now() };
    this.conns.push(c);
    const drop = () => {
      const i = this.conns.indexOf(c);
      if (i >= 0) this.conns.splice(i, 1);
      this._report();
    };
    conn.on('open', () => { c.last = env.now(); this._report(); });
    conn.on('data', d => { if (!this.stopped) { c.last = env.now(); this._hostData(c, d); } });
    conn.on('close', drop);
    conn.on('error', () => { drop(); try { conn.close(); } catch (e) { /* ignore */ } });
  };
  Room.prototype._hostData = function (c, d) {
    if (!d || typeof d !== 'object') return;
    if (d.k === 'hi') {
      const since = Math.max(0, d.since | 0);
      if (since > this.log.length) {   // 對方的紀錄比這台多（這台的資料被清掉了）：請對方補回來
        c.synced = false;
        return this._to(c, { k: 'need', from: this.log.length });
      }
      c.synced = true;
      batches('log', this.log, since).forEach(b => this._to(c, b));
    } else if (d.k === 'send') {
      const id = typeof d.id === 'string' ? d.id.slice(0, 40) : '';
      if (!id || !valid(d.m)) return;
      if (!this.ids.has(id) && !this._append(Object.assign({}, d.m, { _id: id }))) return;   // 紀錄滿了：不回 ack
      this._to(c, { k: 'ack', id });
    } else if (d.k === 'restore') {
      if (c.synced || !Array.isArray(d.msgs) || (d.from | 0) !== this.log.length) return;
      d.msgs.forEach(m => { if (valid(m) && !(m._id && this.ids.has(m._id))) this._append(m); });
    } else if (d.k === 'ping') this._to(c, { k: 'pong' });
  };
  Room.prototype._hostStep = function (now) {
    // 很久沒消息的連線（對方關掉了，連線卻還沒斷）、一直連不上的連線：關掉
    this.conns.slice().forEach(c => {
      if (now - c.last > (c.conn.open ? DEAD : OPEN_WAIT + 5000)) {
        const i = this.conns.indexOf(c);
        if (i >= 0) this.conns.splice(i, 1);
        try { c.conn.close(); } catch (e) { /* ignore */ }
      }
    });
  };

  Net.P2PRoom = Room;
  Net.P2P = {
    env, supported, load, create, createWith,
    forget: code => env.store.del(LOG_KEY + code),   // 房主離開房間：刪掉紀錄
    PREFIX, LOG_KEY,
  };
})();
