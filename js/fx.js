// 畫面特效、平滑更新（DOM morph + FLIP）與音效
(function () {
  const reduced = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ================= DOM morph：只更新有變的地方，讓 CSS 過場動畫能正常播放 =================
  const keyOf = n => (n.nodeType === 1 ? n.getAttribute('data-key') : null);
  function patchAttrs(d, v) {
    for (const a of Array.from(d.attributes)) if (!v.hasAttribute(a.name)) d.removeAttribute(a.name);
    for (const a of Array.from(v.attributes)) {
      if (d.getAttribute(a.name) !== a.value) {
        d.setAttribute(a.name, a.value);
        if (a.name === 'value' && 'value' in d) d.value = a.value;
      }
    }
  }
  function patch(d, v) {
    if (d.nodeType !== 1) { if (d.nodeValue !== v.nodeValue) d.nodeValue = v.nodeValue; return; }
    patchAttrs(d, v);
    children(d, v);
  }
  function children(dom, vdom) {
    const keyed = new Map();
    for (const n of Array.from(dom.childNodes)) { const k = keyOf(n); if (k !== null) keyed.set(k, n); }
    let i = 0;
    for (const v of Array.from(vdom.childNodes)) {
      const cur = dom.childNodes[i] || null;
      const k = keyOf(v);
      if (k !== null && keyed.has(k)) {
        const m = keyed.get(k);
        keyed.delete(k);
        if (m !== cur) dom.insertBefore(m, cur);
        patch(m, v);
      } else if (cur && k === null && keyOf(cur) === null && cur.nodeType === v.nodeType && cur.nodeName === v.nodeName) {
        patch(cur, v);
      } else {
        dom.insertBefore(v, cur);
      }
      i++;
    }
    while (dom.childNodes.length > i) dom.removeChild(dom.childNodes[i]);
  }
  function morph(root, html) {
    const t = document.createElement('template');
    t.innerHTML = html;
    children(root, t.content);
  }

  // FLIP：記錄位置 → 更新 → 從舊位置滑到新位置
  function measure(root) {
    const m = new Map();
    root.querySelectorAll('[data-flip]').forEach(el => m.set(el.getAttribute('data-flip'), el.getBoundingClientRect()));
    return m;
  }
  function flip(root, before) {
    if (reduced || !before) return;
    root.querySelectorAll('[data-flip]').forEach(el => {
      const r0 = before.get(el.getAttribute('data-flip'));
      if (!r0) return;
      const r1 = el.getBoundingClientRect();
      const dx = r0.left - r1.left, dy = r0.top - r1.top;
      if (Math.abs(dx) + Math.abs(dy) < 3) return;
      el.animate([{ transform: `translate(${dx}px,${dy}px)` }, { transform: 'translate(0,0)' }], { duration: 450, easing: 'cubic-bezier(.2,.8,.2,1)' });
    });
  }

  // ================= 特效圖層 =================
  let layer = null;
  function L() {
    if (!layer) { layer = document.createElement('div'); layer.id = 'fx'; document.body.appendChild(layer); }
    return layer;
  }
  function center(el) {
    const r = el.getBoundingClientRect();
    return { x: r.left + r.width / 2, y: r.top + r.height / 2, r };
  }
  function spawn(cls, html, x, y, life) {
    const d = document.createElement('div');
    d.className = cls;
    d.innerHTML = html;
    d.style.left = x + 'px';
    d.style.top = y + 'px';
    L().appendChild(d);
    setTimeout(() => d.remove(), life || 1200);
    return d;
  }
  const recent = new WeakMap();
  function float(el, html, cls) {
    if (!el) return;
    const c = center(el);
    const now = Date.now(), last = recent.get(el) || { t: 0, n: 0 };
    const n = now - last.t < 700 ? last.n + 1 : 0;
    recent.set(el, { t: now, n });
    spawn('fx-float ' + (cls || ''), html, c.x + (n % 2 ? 1 : -1) * Math.min(n, 3) * 14, c.r.top + c.r.height * 0.3 - n * 16, 1300);
  }
  function projectile(from, to, glyph, dur) {
    if (!from || !to || reduced) return;
    const a = center(from), b = center(to);
    const d = spawn('fx-proj', glyph, a.x, a.y, dur + 60);
    const arc = Math.min(90, Math.hypot(b.x - a.x, b.y - a.y) * 0.25);
    const ang = Math.atan2(b.y - a.y, b.x - a.x) * 180 / Math.PI;
    const frames = [];
    for (let i = 0; i <= 8; i++) {
      const t = i / 8;
      const x = (b.x - a.x) * t, y = (b.y - a.y) * t - Math.sin(Math.PI * t) * arc;
      frames.push({ transform: `translate(-50%,-50%) translate(${x}px,${y}px) rotate(${ang}deg) scale(${0.8 + 0.5 * Math.sin(Math.PI * t)})` });
    }
    d.animate(frames, { duration: dur, easing: 'cubic-bezier(.35,0,.6,1)', fill: 'forwards' });
    // 拖尾
    for (let k = 1; k <= 3; k++) {
      const tr = spawn('fx-proj trail', glyph, a.x, a.y, dur + 60);
      tr.style.opacity = String(0.45 - k * 0.12);
      tr.animate(frames, { duration: dur, delay: k * 35, easing: 'cubic-bezier(.35,0,.6,1)', fill: 'forwards' });
    }
  }
  function lunge(el, to) {
    if (!el || !to || reduced) return;
    const a = center(el), b = center(to);
    const dx = (b.x - a.x) * 0.38, dy = (b.y - a.y) * 0.38;
    el.animate([
      { transform: 'translate(0,0) scale(1)', zIndex: 5 },
      { transform: `translate(${-dx * 0.12}px,${-dy * 0.12}px) scale(1.04)`, offset: 0.25, zIndex: 5 },
      { transform: `translate(${dx}px,${dy}px) scale(1.1)`, offset: 0.55, zIndex: 5 },
      { transform: 'translate(0,0) scale(1)', zIndex: 5 },
    ], { duration: 520, easing: 'cubic-bezier(.3,.7,.4,1)' });
  }
  function impact(el, power) {
    if (!el) return;
    if (!reduced) {
      const s = Math.min(10, 3 + power / 8);
      el.animate([
        { transform: 'translate(0,0)', filter: 'brightness(2.6) saturate(.4)' },
        { transform: `translate(${-s}px,${s / 3}px)`, filter: 'brightness(1.6)' },
        { transform: `translate(${s}px,${-s / 3}px)` },
        { transform: `translate(${-s / 2}px,0)` },
        { transform: 'translate(0,0)', filter: 'none' },
      ], { duration: 380, easing: 'ease-out' });
    }
  }
  function slash(el, color) {
    if (!el || reduced) return;
    const c = center(el);
    const d = spawn('fx-slash', '', c.x, c.y, 500);
    if (color) d.style.setProperty('--sc', color);
  }
  function ring(el, cls) {
    if (!el) return;
    const c = center(el);
    const d = spawn('fx-ring ' + (cls || ''), '', c.x, c.y, 800);
    d.style.width = c.r.width * 1.1 + 'px';
    d.style.height = c.r.height * 1.1 + 'px';
  }
  function particles(el, glyph, n, spread, cls) {
    if (!el || reduced) return;
    const c = center(el);
    for (let i = 0; i < n; i++) {
      const p = spawn('fx-particle ' + (cls || ''), glyph, c.x, c.y, 1000);
      const ang = Math.random() * Math.PI * 2, dist = spread * (0.5 + Math.random() * 0.6);
      const up = cls === 'rise' ? -40 - Math.random() * 40 : 0;
      p.animate([
        { transform: 'translate(-50%,-50%) scale(.4)', opacity: 1 },
        { transform: `translate(calc(-50% + ${Math.cos(ang) * dist}px), calc(-50% + ${Math.sin(ang) * dist + up}px)) scale(1)`, opacity: 0 },
      ], { duration: 700 + Math.random() * 300, easing: 'cubic-bezier(.2,.7,.3,1)', fill: 'forwards' });
    }
  }
  function wave(el, cls) {
    if (!el || reduced) return;
    const r = el.getBoundingClientRect();
    const d = spawn('fx-wave ' + (cls || ''), '', r.left + r.width / 2, r.top + r.height / 2, 800);
    d.style.width = r.width + 'px';
    d.style.height = r.height + 'px';
  }
  function bubble(el, text) {
    if (!el) return;
    const c = center(el);
    spawn('fx-bubble', text, c.x, c.r.top, 1100);
  }
  function banner(text) {
    const d = spawn('fx-banner', `<span>${text}</span>`, window.innerWidth / 2, window.innerHeight * 0.42, 1300);
    return d;
  }
  function shake(el, s) {
    if (!el || reduced) return;
    s = s || 6;
    el.animate([
      { transform: 'translate(0,0)' }, { transform: `translate(${s}px,${-s / 2}px)` }, { transform: `translate(${-s}px,${s / 2}px)` },
      { transform: `translate(${s / 2}px,${s / 3}px)` }, { transform: 'translate(0,0)' },
    ], { duration: 360 });
  }
  function confetti() {
    if (reduced) return;
    const cv = document.createElement('canvas');
    cv.className = 'fx-confetti';
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    cv.width = innerWidth * dpr; cv.height = innerHeight * dpr;
    L().appendChild(cv);
    const g = cv.getContext('2d');
    g.scale(dpr, dpr);
    const colors = ['#ffcc4d', '#ff7a7a', '#4fc3f7', '#4cd07d', '#c39bff', '#ffffff'];
    const ps = Array.from({ length: 160 }, () => ({
      x: innerWidth / 2 + (Math.random() - 0.5) * 120, y: innerHeight * 0.35,
      vx: (Math.random() - 0.5) * 14, vy: -6 - Math.random() * 10, r: Math.random() * 6.28, vr: (Math.random() - 0.5) * 0.4,
      w: 6 + Math.random() * 6, h: 3 + Math.random() * 5, c: colors[(Math.random() * colors.length) | 0],
    }));
    const t0 = performance.now();
    (function tick(t) {
      const el = t - t0;
      g.clearRect(0, 0, innerWidth, innerHeight);
      ps.forEach(p => {
        p.vy += 0.28; p.vx *= 0.99; p.x += p.vx; p.y += p.vy; p.r += p.vr;
        g.save(); g.translate(p.x, p.y); g.rotate(p.r); g.globalAlpha = Math.max(0, 1 - el / 3800);
        g.fillStyle = p.c; g.fillRect(-p.w / 2, -p.h / 2, p.w, p.h); g.restore();
      });
      if (el < 3800) requestAnimationFrame(tick); else cv.remove();
    })(t0);
  }

  // ================= 音效（WebAudio 合成，不需要音檔） =================
  const SFX = {
    on: true, ctx: null, out: null,
    init() {
      if (!this.ctx) {
        const C = window.AudioContext || window.webkitAudioContext;
        if (!C) return false;
        this.ctx = new C();
        this.out = this.ctx.createGain();
        this.out.gain.value = 0.55;
        this.out.connect(this.ctx.destination);
      }
      if (this.ctx.state === 'suspended') this.ctx.resume();
      return true;
    },
    tone(f, d, o) {
      o = o || {};
      const c = this.ctx, t = c.currentTime + (o.delay || 0);
      const osc = c.createOscillator(), g = c.createGain();
      osc.type = o.type || 'sine';
      osc.frequency.setValueAtTime(f, t);
      if (o.to) osc.frequency.exponentialRampToValueAtTime(o.to, t + d);
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(o.vol || 0.12, t + 0.012);
      g.gain.exponentialRampToValueAtTime(0.0001, t + d);
      osc.connect(g); g.connect(this.out);
      osc.start(t); osc.stop(t + d + 0.03);
    },
    noise(d, o) {
      o = o || {};
      const c = this.ctx, t = c.currentTime + (o.delay || 0);
      if (!this.nbuf) {
        this.nbuf = c.createBuffer(1, c.sampleRate, c.sampleRate);
        const ch = this.nbuf.getChannelData(0);
        for (let i = 0; i < ch.length; i++) ch[i] = Math.random() * 2 - 1;
      }
      const src = c.createBufferSource(), f = c.createBiquadFilter(), g = c.createGain();
      src.buffer = this.nbuf;
      f.type = o.type || 'lowpass';
      f.frequency.setValueAtTime(o.freq || 1000, t);
      if (o.to) f.frequency.exponentialRampToValueAtTime(o.to, t + d);
      g.gain.setValueAtTime(o.vol || 0.3, t);
      g.gain.exponentialRampToValueAtTime(0.0001, t + d);
      src.connect(f); f.connect(g); g.connect(this.out);
      src.start(t); src.stop(t + d + 0.03);
    },
    play(n) {
      if (!this.on || !this.init()) return;
      try {
        switch (n) {
          case 'click': this.tone(660, 0.05, { type: 'triangle', vol: 0.05 }); break;
          case 'select': this.tone(520, 0.06, { type: 'triangle', vol: 0.06 }); this.tone(780, 0.09, { type: 'triangle', vol: 0.05, delay: 0.04 }); break;
          case 'swing': this.noise(0.18, { type: 'bandpass', freq: 600, to: 2500, vol: 0.18 }); break;
          case 'shoot': this.noise(0.22, { type: 'highpass', freq: 1500, to: 5000, vol: 0.12 }); this.tone(900, 0.15, { type: 'sine', to: 400, vol: 0.04 }); break;
          case 'magic': this.tone(660, 0.35, { to: 1320, vol: 0.06 }); this.tone(990, 0.4, { to: 1980, vol: 0.04, delay: 0.06 }); this.noise(0.4, { type: 'bandpass', freq: 3000, vol: 0.06 }); break;
          case 'hit': this.noise(0.13, { freq: 900, vol: 0.4 }); this.tone(170, 0.12, { type: 'square', to: 70, vol: 0.07 }); break;
          case 'big': this.noise(0.35, { freq: 600, to: 120, vol: 0.6 }); this.tone(120, 0.35, { type: 'sawtooth', to: 40, vol: 0.12 }); break;
          case 'heal': [523, 659, 784].forEach((f, i) => this.tone(f, 0.25, { vol: 0.07, delay: i * 0.07 })); break;
          case 'shield': this.tone(300, 0.28, { type: 'triangle', to: 700, vol: 0.09 }); break;
          case 'miss': this.noise(0.25, { type: 'bandpass', freq: 2500, to: 600, vol: 0.15 }); break;
          case 'death': this.tone(260, 0.7, { type: 'sawtooth', to: 50, vol: 0.1 }); this.noise(0.5, { freq: 400, to: 80, vol: 0.3 }); break;
          case 'phase': this.tone(196, 0.9, { vol: 0.1 }); this.tone(294, 0.9, { vol: 0.05 }); this.tone(392, 0.9, { vol: 0.03, delay: 0.05 }); break;
          case 'status': this.tone(440, 0.16, { type: 'square', to: 300, vol: 0.04 }); break;
          case 'summon': this.tone(330, 0.3, { type: 'triangle', to: 990, vol: 0.08 }); this.noise(0.3, { type: 'bandpass', freq: 1200, vol: 0.06 }); break;
          case 'reveal': for (let i = 0; i < 4; i++) this.noise(0.06, { type: 'highpass', freq: 2500, vol: 0.12, delay: i * 0.09 }); break;
          case 'pick': this.tone(700, 0.08, { type: 'triangle', vol: 0.07 }); this.tone(1050, 0.12, { type: 'triangle', vol: 0.06, delay: 0.06 }); break;
          case 'ban': this.tone(220, 0.25, { type: 'square', to: 110, vol: 0.06 }); break;
          case 'win': [523, 659, 784, 1046].forEach((f, i) => this.tone(f, 0.35, { type: 'triangle', vol: 0.09, delay: i * 0.12 })); break;
          case 'lose': [392, 330, 262].forEach((f, i) => this.tone(f, 0.4, { type: 'triangle', vol: 0.08, delay: i * 0.18 })); break;
        }
      } catch (e) { /* 音效失敗不影響遊戲 */ }
    },
  };

  GAME.FX = { morph, measure, flip, float, projectile, lunge, impact, slash, ring, particles, wave, bubble, banner, shake, confetti, reduced };
  GAME.SFX = SFX;
})();
