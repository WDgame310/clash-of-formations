// 電腦對手：簡單的啟發式 AI（使用 Math.random，不影響引擎的同步亂數）
(function () {
  const E = GAME.Engine;
  const R = arr => arr[Math.floor(Math.random() * arr.length)];
  const shuffle = arr => { const a = arr.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const heroIds = () => GAME.DATA.heroes.map(h => h.id);
  const taken = S => S.banned.concat(S.pools[0], S.pools[1], S.bans.filter(Boolean));
  const power = id => { const d = E.DEF[id]; return d.cost * 10 + d.hp / 10 + d.spd * 2 + Math.random() * 25; };
  // 依分數由高到低排序：每個項目只擲一次亂數（比較函式裡擲亂數，亂數用量會隨瀏覽器的排序方式改變，模擬就無法重現）
  const byScore = (arr, score) => arr.map(x => [x, score(x)]).sort((a, b) => b[1] - a[1]).map(x => x[0]);

  function ban(S, p) {
    const list = heroIds().filter(id => !taken(S).includes(id));
    return byScore(list, power)[Math.floor(Math.random() * 4)];
  }

  function pick(S, p) {
    const list = heroIds().filter(id => !taken(S).includes(id));
    const mine = S.pools[p];
    const fives = mine.filter(id => E.DEF[id].cost === 5).length;
    return byScore(list, id => power(id) - (E.DEF[id].cost === 5 && fives >= 2 ? 40 : 0))[0];
  }

  function deploy(S, p) {
    const pool = S.pools[p];
    const minions = GAME.DATA.minions.map(m => m.id);
    let best = null, bestScore = -1;
    for (let mask = 1; mask < 1 << pool.length; mask++) {
      const hs = pool.filter((_, i) => mask & (1 << i));
      if (hs.length > 4) continue;
      let cost = hs.reduce((n, id) => n + E.DEF[id].cost, 0);
      if (cost > E.MAX_COST) continue;
      const team = hs.slice();
      while (team.length < 4 && cost < E.MAX_COST) { team.push(R(minions)); cost++; }
      const score = team.reduce((n, id) => n + power(id), 0);
      if (score > bestScore) { bestScore = score; best = team; }
    }
    return place(best, S);
  }
  // 純近戰英雄：所有指定敵人的招式都是近戰（小兵、沒有攻擊招式的不算）
  function pureMelee(id) {
    const d = E.DEF[id];
    if (!d || d.minion) return false;
    const atk = d.cards.filter(c => c.tgt === 'enemy');
    return atk.length > 0 && atk.every(c => c.rng === 'melee');
  }
  // 適合站前排的程度（不含亂數）：血厚的近戰最高，輔助與小兵最低
  function frontScore(id) { const d = E.DEF[id]; return d.hp + (d.type === 'melee' ? 60 : 0) - (d.type === 'support' || d.minion ? 40 : 0); }
  // 排位置：前排放血厚的近戰，後排放遠程與輔助
  //   巨人一定放前排（他不能換位）
  //   S（選用）有 meleeFront 時：巨人同一列的後排不放純近戰（巨人推不動，後排的近戰永遠換不上前排）；真的排不開（例如巨人＋3 個純近戰）才放
  function place(keys, S) {
    const order = byScore(keys, id => frontScore(id) + Math.random() * 10);
    const slots = order.map((key, i) => ({ key, slot: i }));
    const at = n => slots.find(x => x.slot === n);
    const gt = slots.find(x => x.key === 'giant');
    if (gt && gt.slot >= 2) { const f = at(1); f.slot = gt.slot; gt.slot = 1; }
    if (gt && S && E.ruleSet(S, 'meleeFront')) {
      const behind = at(gt.slot + 2);
      if (behind && pureMelee(behind.key)) {
        // 優先換到另一列的後排（空格或非純近戰），其次和另一列前排的非純近戰交換
        const ob = 3 - gt.slot, of = 1 - gt.slot;
        const b2 = at(ob), f2 = at(of);
        if (!b2 || !pureMelee(b2.key)) { if (b2) b2.slot = behind.slot; behind.slot = ob; }
        else if (!f2) behind.slot = of;
        else if (!pureMelee(f2.key)) { f2.slot = behind.slot; behind.slot = of; }
      }
    }
    return slots.sort((a, b) => a.slot - b.slot);
  }

  function chooseTarget(S, uid, card) {
    const list = E.validTargets(S, uid, card.id);
    if (!list.length) return undefined;
    if (card.tgt === 'cell') {
      const es = 1 - E.unit(S, uid).side;
      const occ = E.grid(S, es).map(u => u.slot);
      return occ.length ? R(occ) : R(list);
    }
    const units = list.map(id => E.unit(S, id));
    // 煩死你：挑最可能打吞食者、打得最痛的敵人（打得到他的英雄優先）
    if (card.id === 'et_annoy') {
      const me = E.unit(S, uid);
      const reach = e => !e.sm && E.DEF[e.key].cards.some(c => c.tgt === 'enemy' && (c.rng !== 'melee' || me.slot < 2));
      const score = e => (e.sm ? 0 : E.DEF[e.key].cost + (E.DEF[e.key].minion ? 0 : 2)) + (reach(e) ? 3 : 0) + Math.random() * 3;
      return byScore(units, score)[0].uid;
    }
    if (card.tgt === 'enemy') {
      // 偶爾完全隨機，讓推演有更多不同的候選；其餘時間優先打有價值、血少的目標（英雄比召喚物重要）
      if (Math.random() < 0.25) return R(units).uid;
      const score = u => (u.sm ? 0.8 : 2 + E.DEF[u.key].cost) * (1.6 - u.hp / u.maxHp) * (0.6 + Math.random());
      return byScore(units, score)[0].uid;
    }
    // 友方：給血少的
    units.sort((a, b) => a.hp / a.maxHp - b.hp / b.maxHp);
    if (card.id === 'mn_star') {
      const strong = units.filter(u => !u.minion).sort((a, b) => E.DEF[b.key].cost - E.DEF[a.key].cost);
      return (strong[0] || units[0]).uid;
    }
    return units[0].uid;
  }

  // 換位的權重：規則都關時維持原本的 0.35
  //   meleeFront：後排的近戰角色很想換到前排（換位＋近戰的組合才會進到推演候選）
  //   meleeSquare + swapSpeed：前排角色換位閃近戰，要比每個「近戰打得到他」的敵人都快才閃得掉：
  //     比較快且血量低於 60% → 1.0、比較快但血還多 → 0.5、沒有比較快（或根本沒有近戰打得到他）→ 0.1
  //     速度只用自己這份出招的預覽速度、敵人只看基本速度（E.speedPreview，不偷看對手出招）
  //     巨人的【鎖定】近戰（巨拳、山掌）換位閃不掉（站位規則開啟時盯上的人跑到哪就打到哪），不算威脅
  //   只有 meleeSquare：前排血量低於一半時，偶爾換位閃開瞄準這一格的近戰
  function moveWeight(S, u, actions) {
    const front = u.slot < 2;
    const melee = E.DEF[u.key].cards.some(x => x.rng === 'melee' && x.tgt === 'enemy');
    if (E.ruleSet(S, 'meleeFront') && !front && melee) return 2.5;
    if (front && E.ruleSet(S, 'meleeSquare') && E.ruleSet(S, 'swapSpeed')) {
      const mine = (actions || []).filter(a => a.uid === u.uid).map(a => a.card);
      const sp = E.speedPreview(S, u.uid, mine);
      // 這裡 meleeSquare 開著（站位規則開啟），【鎖定】一定有作用
      const threats = E.grid(S, 1 - u.side).filter(e => E.DEF[e.key].cards.some(c =>
        c.tgt === 'enemy' && c.rng === 'melee' && !c.lock && E.validTargets(S, e.uid, c.id).includes(u.uid)));
      if (!threats.length || !threats.every(e => sp > E.speedPreview(S, e.uid, []))) return 0.1;
      return u.hp < u.maxHp * 0.6 ? 1.0 : 0.5;
    }
    if (E.ruleSet(S, 'meleeSquare') && front && u.hp < u.maxHp * 0.5) return 0.7;
    return 0.35;
  }
  // 近戰需在前排：加上這張招式後，我方已經排好的近戰是否仍然合法
  // （自己換到後排、同一列隊友的換位把前排的人換走、加速招讓隊友的換位變成比較快…都會讓近戰落空，引擎會擋下）
  function keepsMelee(S, u, c, actions) {
    if (!E.ruleSet(S, 'meleeFront') || !(c.id === 'x_move' || c.spd)) return true;
    const after = actions.concat([{ uid: u.uid, card: c.id }]);
    return actions.every(a => E.CARD[a.card].rng !== 'melee' || E.reqOk(S, a.uid, a.card, after));
  }

  function cardWeight(S, u, c, actions) {
    const d = c.d || '';
    let w = 1;
    // 吞食者：煩死你要搭食物我最愛才划算，兩張常常一起出
    const mine = (actions || []).filter(a => a.uid === u.uid).map(a => a.card);
    if (c.id === 'et_annoy') return mine.includes('et_food') ? 5 : 0.8;
    if (c.id === 'et_food') return mine.includes('et_annoy') ? 6 : 1.5;
    if (c.id === 'x_guard') return u.hp < u.maxHp * 0.6 ? 0.8 : 0.3;
    if (!keepsMelee(S, u, c, actions || [])) return 0;
    if (c.id === 'x_move') return moveWeight(S, u, actions || []);
    // dashFront：後排劍客的閃身也會衝到前排（同換位一樣是「上前＋近戰」的入口，另外還能閃避）
    if (c.id === 'sw_dash' && u.slot >= 2 && E.ruleSet(S, 'meleeFront') && E.ruleSet(S, 'dashFront')) return 2.5;
    if (c.tgt === 'enemy' || c.aoe) w += 3;
    if (/真實|絕對/.test(d)) w += 1;
    if (c.ap === 3) w += 3;
    if (c.pre) w += 0.5;
    if (c.id === 'mn_sac' && u.hp <= 20) w = 0;
    if (c.id === 'fs_iam') w = 1 + 2 * u.st.filter(s => GAME.DATA.statuses[s.k].k === 'debuff').length;
    if (c.id === 'op_train' && u.hp > u.maxHp * 0.7) w = 0.2;
    if (c.id === 'wx_earth' && u.hp > u.maxHp * 0.8) w = 0.2;
    if (c.id === 'gt_taunt' && u.hp < u.maxHp * 0.3) w = 0.2;
    return w;
  }

  // 隨機但有權重的出招（也拿來當推演時的候選方案與對手模型）
  function randomPlan(S, p) {
    // 對手可能已經出招了；推測對手出招時要當作還沒出招來檢查
    if (S.plans[p]) S = Object.assign({}, S, { plans: S.plans.map((x, i) => (i === p ? null : x)) });
    let best = [];
    for (let attempt = 0; attempt < 40; attempt++) {
      const actions = [];
      const units = shuffle(E.grid(S, p));
      // 獻祭者有血就先獻祭
      units.filter(u => u.key === 'm_cult' && u.hp > 25 && Math.random() < 0.6).forEach(u => actions.push({ uid: u.uid, card: 'mn_sac' }));
      for (let step = 0; step < 6; step++) {
        const spent = actions.reduce((n, a) => n + E.cardCost(S, p, E.CARD[a.card]), 0);
        const left = E.planBudget(S, p, actions) - spent;
        if (left <= 0) break;
        // 偶爾故意留 1 AP 存到下回合
        if (left === 1 && actions.length && Math.random() < 0.2) break;
        const opts = [];
        units.forEach(u => E.cardsOf(u.key).forEach(c => {
          if (c.id === 'mn_sac') return;
          if (E.cardCost(S, p, c) > left) return;
          if (actions.some(a => a.uid === u.uid && (a.card === c.id || (c.group && E.CARD[a.card].group === c.group)))) return;
          if (!E.reqOk(S, u.uid, c.id, actions)) return;
          const w = cardWeight(S, u, c, actions);
          if (w > 0) opts.push({ u, c, w });
        }));
        if (!opts.length) break;
        let r = Math.random() * opts.reduce((n, o) => n + o.w, 0);
        const o = opts.find(x => (r -= x.w) <= 0) || opts[0];
        const target = chooseTarget(S, o.u.uid, o.c);
        if (['enemy', 'ally', 'allyFront', 'allyHero', 'cell'].includes(o.c.tgt) && target === undefined) continue;
        actions.push({ uid: o.u.uid, card: o.c.id, target });
      }
      if (!E.validate(S, { type: 'plan', p, actions })) {
        const used = actions.reduce((n, a) => n + E.cardCost(S, p, E.CARD[a.card]), 0);
        if (used >= E.planBudget(S, p, actions) || attempt > 20) return actions;
        if (actions.length > best.length) best = actions;
      }
    }
    return best;
  }

  // ---------- 推演式 AI：每個候選出招都實際模擬一回合，挑結果最好的 ----------
  const SUMMON_WORTH = { bat: 0.6, gpirate: 0.8, ship: 3, statue: 1.2, dog: 1.5 };
  function worth(u) { return u.sm ? (SUMMON_WORTH[u.key] || 1) : 2 + E.DEF[u.key].cost; }
  function sideValue(S, side) {
    let v = 0;
    S.units.forEach(u => {
      if (u.side !== side || !u.alive) return;
      const w = worth(u), f = Math.max(0, u.hp) / u.maxHp;
      v += u.sm ? w * f : w * (0.35 + 0.65 * f);
      v += Math.min(u.shield, 30) / 100 * w * 0.3;
      if (u.data.sunmark) v += 2;
      if (u.data.ink) v += 0.6 * Math.min(u.data.ink, 2);
      // 鹹魚靠負面狀態發動「我乃鹹魚」與「謎團」，對它來說負面狀態是資源
      const debuffWorth = u.key === 'fish' ? 0.5 : -0.35;
      // 黑髮牢新版會鎖到下回合：被鎖的英雄放不出大招，比一般負面狀態更傷
      u.st.forEach(s => { if (s.to >= S.round) v += GAME.DATA.statuses[s.k].k === 'buff' ? 0.25 : s.k === 'jail' && !u.sm && E.ruleSet(S, 'jailLast') && u.key !== 'fish' ? -1.2 : debuffWorth; });
    });
    return v;
  }
  function evaluate(S, p) {
    if (S.phase === 'over') return S.winner === p ? 1000 : S.winner === 'draw' ? 0 : -1000;
    return sideValue(S, p) - sideValue(S, 1 - p) + 0.8 * (S.players[p].ap - S.players[1 - p].ap);
  }
  function simulate(S, p, mine, theirs) {
    const c = E.clone(S);
    c.quiet = true;
    c.plans = [null, null];
    c.rng = (c.rng ^ Math.floor(Math.random() * 2147483647)) | 0; // 推演用不同的骰子，不能偷看真正的結果
    const a = { type: 'plan', p, actions: mine }, b = { type: 'plan', p: 1 - p, actions: theirs };
    E.apply(c, E.validate(c, a) ? { type: 'plan', p, actions: [] } : a);
    E.apply(c, E.validate(c, b) ? { type: 'plan', p: 1 - p, actions: [] } : b);
    return c;
  }
  const planKey = pl => pl.map(a => a.uid + a.card + ':' + a.target).sort().join('|');
  function plan(S, p, opts) {
    opts = opts || {};
    const K = opts.cands || 16, M = opts.opps || 4;
    const seen = new Set(), cands = [];
    const add = pl => { const k = planKey(pl); if (!seen.has(k)) { seen.add(k); cands.push(pl); } };
    add([]);
    for (let i = 0; i < K * 3 && cands.length < K + 1; i++) add(randomPlan(S, p));
    const opps = Array.from({ length: M }, () => randomPlan(S, 1 - p));
    let best = cands[0], bestScore = -Infinity;
    cands.forEach(pl => {
      const scores = opps.map(o => evaluate(simulate(S, p, pl, o), p));
      const mean = scores.reduce((n, x) => n + x, 0) / scores.length;
      const score = 0.75 * mean + 0.25 * Math.min(...scores);
      if (score > bestScore) { bestScore = score; best = pl; }
    });
    return best;
  }

  GAME.AI = { ban, pick, deploy, place, plan, randomPlan, evaluate, pureMelee, frontScore, moveWeight };
})();
