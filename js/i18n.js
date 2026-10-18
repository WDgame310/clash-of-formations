// 多語系：中文（原文）、English、Français
// - 介面文字：GAME.I18N.t('key', { 變數 })，文字放在 js/lang/<語言>.ui.js 的 ui 區塊
// - 戰鬥紀錄：引擎內建中文樣板，其他語言放在 js/lang/<語言>.msg.js 的 msg 區塊（同一個 key）
// - 角色與招式資料：中文來自 js/data.js；其他語言放在 js/lang/<語言>.data.js 的 data 區塊
// - 圖鑑：中文來自 js/codex.js；其他語言放在 js/lang/<語言>.codex.js 的 codex 區塊
// 找不到翻譯時一律退回中文。樣板用 {name} 代入變數。
window.GAME = window.GAME || {};
GAME.I18N = (function () {
  const LANGS = { zh: '中文', en: 'English', fr: 'Français' };
  const KEY = 'yzdj_lang_v1';
  const packs = { zh: {}, en: {}, fr: {} };

  function guess() {
    if (window.I18N_FORCE && LANGS[window.I18N_FORCE]) return window.I18N_FORCE;   // 測試頁固定語言
    try { const s = localStorage.getItem(KEY); if (s && LANGS[s]) return s; } catch (e) { /* ignore */ }
    const n = ((navigator.languages && navigator.languages[0]) || navigator.language || 'zh').toLowerCase();
    if (n.startsWith('zh')) return 'zh';
    if (n.startsWith('fr')) return 'fr';
    if (n.startsWith('en')) return 'en';
    return 'zh';
  }
  let lang = guess();

  function merge(a, b) {
    Object.keys(b).forEach(k => {
      if (b[k] && typeof b[k] === 'object' && !Array.isArray(b[k])) { a[k] = a[k] || {}; merge(a[k], b[k]); }
      else a[k] = b[k];
    });
    return a;
  }
  // 查詢結果快取起來：AI 推演時每秒會產生大量文字，每次都拆路徑太慢
  const cache = {};
  function add(l, part) { if (!packs[l]) packs[l] = {}; merge(packs[l], part); delete cache[l]; }
  function get(l, path) {
    const c = cache[l] || (cache[l] = new Map());
    if (c.has(path)) return c.get(path);
    let o = packs[l];
    for (const p of path.split('.')) { if (o == null) break; o = o[p]; }
    if (o === null) o = undefined;
    c.set(path, o);
    return o;
  }
  function fmt(s, v) {
    if (typeof s === 'function') return s(v || {});
    return String(s).replace(/\{(\w+)\}/g, (m, k) => (v && v[k] !== undefined && v[k] !== null ? v[k] : m));
  }

  // 介面文字
  function t(key, v) {
    let s = get(lang, 'ui.' + key);
    if (s === undefined) s = get('zh', 'ui.' + key);
    if (s === undefined) return key;
    return fmt(s, v);
  }
  // 引擎戰鬥紀錄：中文由引擎自己提供；其他語言找得到就回傳樣板
  function msg(key) { return lang === 'zh' ? undefined : get(lang, 'msg.' + key); }

  // ---------- 資料 ----------
  const D = () => GAME.DATA;
  let UIX = null, CIX = null;
  function index() {
    UIX = {}; CIX = {};
    D().heroes.concat(D().minions).forEach(h => { UIX[h.id] = h; h.cards.forEach(c => { CIX[c.id] = c; }); });
    (D().actions || []).forEach(c => { CIX[c.id] = c; });
  }
  const zhUnit = id => { if (!UIX) index(); return UIX[id]; };
  const zhCard = id => { if (!CIX) index(); return CIX[id]; };
  const tr = (path) => (lang === 'zh' ? undefined : get(lang, 'data.' + path));
  function heroName(id) { return tr(`heroes.${id}.n`) || (zhUnit(id) || {}).n || id; }
  function passive(id) {
    const z = (zhUnit(id) || {}).passive;
    if (!z) return null;
    return { n: tr(`heroes.${id}.passive.n`) || z.n, d: tr(`heroes.${id}.passive.d`) || z.d };
  }
  function cardName(id) { return tr(`cards.${id}.n`) || (zhCard(id) || {}).n || id; }
  function cardDesc(id) { return tr(`cards.${id}.d`) || (zhCard(id) || {}).d || ''; }
  function statusName(k) { return tr(`statuses.${k}.n`) || (D().statuses[k] || {}).n || k; }
  function statusDesc(k) { return tr(`statuses.${k}.d`) || (D().statuses[k] || {}).d || ''; }
  function summonName(k) { return tr(`summons.${k}`) || (D().summons[k] || {}).n || (k === 'bigdog' ? '巨犬' : k); }
  function factionName(f) { return tr(`factions.${f}`) || f; }
  function typeName(type) { return tr(`types.${type}`) || D().TYPES[type] || type; }
  function roleName(r) { return tr(`roles.${r}`) || r; }
  // 戰場上的單位名稱（召喚物、變成巨犬的小狗都會處理）
  function unitName(u) {
    if (!u) return '';
    if (u.sm) {
      if (u.key === 'dog' && u.st && u.st.some(s => s.k === 'bigdog')) return summonName('bigdog');
      return summonName(u.key);
    }
    return heroName(u.key);
  }
  // 圖鑑文字：summary / tips 用角色 id；why 用 'a|b'；combos 用 ids 以 + 連接
  function codex(section, id, zh) { return (lang === 'zh' ? undefined : get(lang, `codex.${section}.${id}`)) || zh; }

  function setLang(l, o) {
    if (!LANGS[l]) return;
    lang = l;
    if (!o || o.save !== false) try { localStorage.setItem(KEY, l); } catch (e) { /* ignore */ }
    document.documentElement.lang = l === 'zh' ? 'zh-Hant' : l;
  }
  if (typeof document !== 'undefined') document.documentElement.lang = lang === 'zh' ? 'zh-Hant' : lang;

  return {
    LANGS, add, t, msg, fmt, setLang, packs,
    get lang() { return lang; },
    heroName, passive, cardName, cardDesc, statusName, statusDesc, summonName, factionName, typeName, roleName, unitName, codex,
  };
})();
