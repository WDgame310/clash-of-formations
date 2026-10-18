// 雙裝置連線：透過 server.py 的房間轉發訊息（長輪詢）。
// 兩台裝置收到完全相同順序的訊息，各自用引擎重播，因此狀態一致。
(function () {
  const base = location.protocol.startsWith('http') ? '' : null;

  async function api(path, body) {
    const res = await fetch(path, body === undefined ? { cache: 'no-store' } : {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body), cache: 'no-store',
    });
    if (!res.ok) throw new Error((await res.text()) || res.status);
    return res.json();
  }

  async function available() {
    if (base === null) return false;
    try { const r = await api('/api/ping'); return !!r.ok; } catch (e) { return false; }
  }

  function Room(code, onMsgs, onStatus) {
    this.code = code;
    this.since = 0;
    this.stopped = false;
    this.onMsgs = onMsgs;
    this.onStatus = onStatus || (() => {});
    this.loop();
  }
  Room.prototype.loop = async function () {
    while (!this.stopped) {
      try {
        const r = await api(`/api/poll?room=${encodeURIComponent(this.code)}&since=${this.since}`);
        if (this.stopped) break;
        this.onStatus(true);
        if (r.msgs && r.msgs.length) {
          this.since = r.next;
          this.onMsgs(r.msgs);
        }
      } catch (e) {
        if (this.stopped) break;
        this.onStatus(false, String(e.message || e));
        await new Promise(res => setTimeout(res, 1500));
      }
    }
  };
  Room.prototype.send = function (msg) {
    return api(`/api/send?room=${encodeURIComponent(this.code)}`, msg).catch(e => {
      this.onStatus(false, String(e.message || e));
      throw e;
    });
  };
  Room.prototype.stop = function () { this.stopped = true; };

  GAME.Net = {
    available,
    create: () => api('/api/create', {}),
    info: () => api('/api/info'),
    Room,
  };
})();
