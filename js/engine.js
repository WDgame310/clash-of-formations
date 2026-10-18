// 《異陣對決》規則引擎
// 完全由 state 內的種子亂數驅動：同樣的種子 + 同樣的動作序列 = 同樣的結果，
// 所以雙裝置連線時只需要交換「動作」，兩邊各自計算即可保持同步。
(function () {
  const D = GAME.DATA;
  const DEF = {};
  D.heroes.forEach(h => (DEF[h.id] = h));
  D.minions.forEach(h => (DEF[h.id] = h));
  const CARD = {};
  Object.values(DEF).forEach(h => h.cards.forEach(c => (CARD[c.id] = Object.assign({ owner: h.id }, c))));
  (D.actions || []).forEach(c => (CARD[c.id] = Object.assign({ owner: '*' }, c)));
  // 某個角色可以用的所有招式（自己的招式＋基本動作）
  const cardsOf = key => (DEF[key] ? DEF[key].cards.concat(D.actions || []) : []);
  // 規則開關（新局預設全開；舊的測試可以關掉）
  const ruleOn = (S, k) => !S.rules || S.rules[k] !== false;
  // 選用規則（預設關閉：只有 S.rules[k] === true 才生效；newGame 不放這些 key，一般對局行為完全不變）
  //   meleeFront：近戰招式只能在前排使用（可以同回合先換位）
  //   meleeSquare：近戰單體攻擊瞄準「格子」，目標換走了就打到換進來的人或撲空
  //   swapSpeed：換位不再是預判，改在主要階段依出招者速度結算
  //   noWhiff：近戰打格子時，目標被自己這一方換走而那一格沒人 → 照一般規則改打其他合法目標（不撲空）
  //   dashFront：（需 meleeFront）後排的曜神劍客用閃身時，同時衝到同一列的前排（不算換位、不受換位冷卻限制）
  //   opWindup（數值）：認真一拳的出手速度 = 一拳就贏的速度 − opWindup（S.rules.opWindup > 0 才生效）
  const ruleSet = (S, k) => !!(S.rules && S.rules[k] === true);
  // 數值型選用規則（例如 opWindup: 2）；沒有設定或不是正數時回傳 0
  const ruleNum = (S, k) => { const v = S.rules ? Number(S.rules[k]) : 0; return v > 0 ? v : 0; };
  // 任一站位規則開啟：每個速度組開始時記下位置（同速的位移視為同時發生，不分哪一方先結算）
  const posRules = S => ruleSet(S, 'meleeFront') || ruleSet(S, 'meleeSquare') || ruleSet(S, 'swapSpeed');
  // 這張招式是否在預判階段結算（swapSpeed 開啟時，換位改在主要階段依速度結算）
  const isPre = (S, c) => {
    if (typeof c === 'string') c = CARD[c];
    return !!(c && c.pre && !(c.id === 'x_move' && ruleSet(S, 'swapSpeed')));
  };
  // 招式冷卻：除了標示「基本」的招式，用過的招下一回合不能再用
  const onCooldown = (S, u, c) => ruleOn(S, 'cooldown') && !c.basic && !!(u.data.cd && u.data.cd[c.id] === S.round - 1);
  const ST = D.statuses;
  const MAX_ROUND = 15, FATIGUE_FROM = 10, BASE_AP = 3, MAX_COST = 10, MAX_UNITS = 4, POOL_SIZE = 5;
  const PROTECT = ['dodge1', 'stealth', 'hidden', 'flying', 'waterDodge', 'food', 'taunt'];

  // ---------- 文字樣板（多語系） ----------
  // 引擎產生的所有文字（戰鬥紀錄、錯誤訊息、結束原因…）都從這裡出來。
  // 中文樣板寫在 MSG；其他語言放在 js/lang/<語言>.msg.js 的 msg 區塊（同一個 key）。
  // 名稱一律用 {placeholder} 代入；沒有 GAME.I18N（例如測試頁）時直接用中文樣板。
  const MSG = {
    // 開局
    default_player: '玩家{n}',
    // 狀態
    summon_limit: '召喚物已達上限',
    immune_ship: '{unit} 有幽靈船護佑，免疫【{status}】',
    immune_dragon: '{unit} 龍鱗免疫【{status}】',
    mocked_buff_cursed: '{unit} 被嘲笑，【{status}】變成了【詛咒】',
    mocked_shield_cursed: '{unit} 被嘲笑，護盾變成了【詛咒】',
    got_status: '{target} 被【{status}】',
    controlled: '{unit} 被【{status}】！尚未出的招式失效，對方下回合AP-1',
    chill_gain: '{unit} 獲得1層寒意（共{total}層）',
    // 回復 / 護盾 / 自傷（{why} 是原因：招式名稱或下面的 why_*）
    no_heal_eater: '{unit} 無底洞：無法被治療',
    heal: '{unit} 恢復 {n} 生命',
    heal_why: '{unit} {why}，恢復 {n} 生命',
    shield: '{unit} 獲得 {n} 點護盾',
    shield_why: '{unit} {why}，獲得 {n} 點護盾',
    self_hurt: '{unit} {why}，扣除 {n} 生命',
    why_food_full: '吃得好飽',
    why_steady: '穩健',
    why_bloodthirst: '嗜血',
    why_blood_bat: '化血',
    why_sac: '{card}（本回合AP+1）',
    why_bats: '{n} 隻蝙蝠供血',
    // 閃避
    evade_void: '{target} 虛無：閃避了攻擊',
    evade_flying: '{target} 正在飛行，近戰攻擊無效',
    evade_dash: '{target} 閃身躲開了 {src} 的攻擊',
    evade_stealth: '{target} 隱身閃避了攻擊',
    evade_water: '{target} 水游閃避了傷害',
    food_eat: '{target} 食物我最愛：把 {n} 點傷害吃掉了！',
    clone_block: '{target} 的影傀擋下了致命一擊！',
    // 傷害（*_src：{src} 對 {target} 造成；沒有 _src：{target} 受到傷害。{absorb} 是 dmg_absorbed 或空字串）
    equalize_hit: '規則・均貧：傷害被壓縮成5',
    dmg: '{target} 造成 {n} 點傷害{absorb}',
    dmg_src: '{src} 對 {target} 造成 {n} 點傷害{absorb}',
    dmg_pierce: '{target} 造成 {n} 點貫穿傷害{absorb}',
    dmg_pierce_src: '{src} 對 {target} 造成 {n} 點貫穿傷害{absorb}',
    dmg_true: '{target} 造成 {n} 點真實傷害{absorb}',
    dmg_true_src: '{src} 對 {target} 造成 {n} 點真實傷害{absorb}',
    dmg_absorbed: '（護盾吸收 {n}）',
    ice_aura_counter: '{target} 的冰之環繞反擊！',
    death: '💀 {unit} 倒下了！',
    // 沒有出手者的傷害來源（{src}）
    src_trap: '黑法殺陣',
    src_fire: '龍息火焰',
    src_bump: '撞擊',
    src_deathmatch: '死鬥',
    // 位移 / 陣地
    trap_pulled_in: '{unit} 被拉進黑法殺陣！',
    fire_pushed_in: '{unit} 被推進火焰！',
    giant_immune_move: '{unit} 厚重：免疫位移',
    already_front: '{unit} 已在前場',
    already_back: '{unit} 已在後場',
    giant_block_pull: '{unit} 被 {other} 擋住（厚重：免疫位移），無法被拉到前場',
    giant_block_push: '{unit} 被 {other} 擋住（厚重：免疫位移），無法被擊退',
    pulled_front: '{unit} 被拉到前場',
    pulled_front_swap: '{unit} 被拉到前場，與 {other} 交換位置',
    pushed_back: '{unit} 被擊退到後場',
    pushed_back_swap: '{unit} 被擊退到後場，與 {other} 交換位置',
    slot0: '左前',
    slot1: '右前',
    slot2: '左後',
    slot3: '右後',
    // 目標
    taunt_redirect: '攻擊被 {unit} 的嘲吸吸引過去！',
    no_target: '{unit} 找不到目標，【{card}】失效',
    retarget: '原目標已失效，改為攻擊 {target}',
    untargetable: '{target} 無法被選中，【{card}】落空',
    ally_down: '目標已倒下，【{card}】失效',
    // 站位規則（選用：meleeFront / meleeSquare）
    melee_not_front: '{unit} 不在前排，【{card}】打不到',
    square_empty: '{unit} 的【{card}】撲空了：那一格已經沒人',
    square_hit: '{target} 換到這一格，替 {other} 挨了這一擊',
    // 招式需求（E.REQ_TXT）
    req_sunmark: '需要曜印',
    req_ink: '需要墨印',
    req_dog: '小狗不在場',
    req_statue: '沒有小石像',
    req_noship: '幽靈船已在場',
    req_tire: '輪胎已經爆掉了（每局一次）',
    req_cd: '上回合用過（不能連續兩回合使用）',
    req_move: '不能換位（巨人、或被冰凍／眩暈）',
    req_front: '要在前排才能用近戰（可以同回合先換位）',
    // 閃身衝前排（選用：dashFront）
    dash_front: '{unit} 閃身衝到前排',
    dash_front_giant: '{unit} 被 {other} 擋住（厚重），閃身衝不到前排',
    dash_front_controlled: '{unit} 被控制，閃身衝不到前排',
    // 動作驗證錯誤
    err_bad_action: '動作格式錯誤',
    err_game_over: '遊戲已結束',
    err_not_ban_phase: '現在不是禁用階段',
    err_already_banned: '已經禁用過了',
    err_not_your_ban: '還沒輪到你禁用',
    err_ban_hero_only: '只能禁用英雄',
    err_hero_banned: '此英雄已被禁用',
    err_not_draft_phase: '現在不是選角階段',
    err_not_your_turn: '還沒輪到你',
    err_pick_hero_only: '只能選英雄',
    err_hero_taken: '此英雄已被選走',
    err_not_deploy_phase: '現在不是佈陣階段',
    err_already_deployed: '已經佈陣了',
    err_min_units: '至少要上陣1個單位',
    err_max_units: '最多上陣{n}個單位',
    err_unknown_unit: '未知的角色',
    err_not_in_pool: '只能上陣自己備選池的英雄',
    err_dup_hero: '同一英雄只能上陣一次',
    err_bad_slot: '位置錯誤',
    err_over_cost: 'Cost 總和不得超過{n}',
    err_giant_front: '巨人只能放在前排（他不能換位）',
    err_unknown_action: '未知動作',
    err_not_plan_phase: '現在不是出招階段',
    err_already_planned: '已經出招了',
    err_bad_unit: '角色錯誤',
    err_bad_card: '招式錯誤',
    err_card_req: '【{card}】{reason}',
    err_dup_card: '同一招式每回合只能用一次',
    err_card_group: '【{card}】與同組招式只能二選一',
    err_card_target: '【{card}】目標不合法',
    err_no_ap: 'AP 不足',
    // 禁用 / 選角 / 佈陣 / 結束
    log_ban: '{player} 禁用了 {hero}',
    log_pick: '{player} 選了 {hero}',
    log_lineup: '陣容揭曉！',
    end_surrender: '{player} 投降',
    end_wipe: '{player} 的英雄全滅',
    end_both_wiped: '雙方同歸於盡',
    end_time: '第{round}回合結束，剩餘血量 {p0}% : {p1}%',
    result_draw: '🤝 平手！',
    result_win: '🏆 {player} 獲勝！',
    // 回合流程（round_header 請保留開頭的 ══，介面靠它辨認回合標題）
    round_header: '══ 第 {round} 回合 ══',
    judge_court: '⚖️ 法庭開庭：本回合暴擊與加速無效',
    reveal: '{player} 出招：{list}',
    reveal_rest: '{player} 出招：（休息）',
    reveal_item: '{unit}【{card}】',
    list_sep: '、',
    phase_pre: '— 預判・防禦 —',
    phase_main: '— 速度判定・出招 —',
    phase_end: '— 回合末結算 —',
    card_confiscated: '{unit}【{card}】已被沒收',
    controlled_fail: '{unit} 被控制，招式失效（AP不退還）',
    down_before_act: '{unit} 在出手前倒下，招式失效',
    jail_blocked: '{unit} 被黑髮牢鎖住，【{card}】失效',
    use_card: '{unit} 使用【{card}】',
    // 傷害加成
    hungry_x2: '{unit} 我餓了：傷害x2！',
    annoy_x5: '{unit} 煩死你：傷害x5！',
    pity_half: '{unit} 不忍心下手，傷害減半',
    pingpong_crit: '{unit} 大力出奇蹟：暴擊！',
    // 五行
    elem_boost: '五行相生：{from}生{to}，數值+30%',
    elem_metal: '金',
    elem_wood: '木',
    elem_water: '水',
    elem_fire: '火',
    elem_earth: '土',
    // 各招式
    guard_stance: '{unit} 擺出防禦架勢：本回合受到的傷害減半',
    swap_giant: '巨人推不動，換位失敗',
    swap_controlled: '{unit} 被控制，無法換位',
    swap_front: '{unit} 換到前場',
    swap_front_with: '{unit} 換到前場，和 {other} 交換位置',
    swap_back: '{unit} 換到後場',
    swap_back_with: '{unit} 換到後場，和 {other} 交換位置',
    sunmark_gain: '{unit} 獲得「曜印」',
    no_sunmark: '沒有曜印，招式失效',
    blizzard_snow: '❄️ {player} 的陣地被放置【雪陣】：下回合每張招式耗AP+1',
    wood_vine: '木藤纏繞：{player} 下回合AP-1',
    hawk_first: '{unit} 搶得先手，本回合傷害+10',
    hawk_late: '{unit} 沒能搶到先手',
    summon_statue: '{unit} 召喚了一尊小石像',
    no_statue: '沒有小石像，招式失效',
    statues_shatter: '{n} 尊小石像衝撞後崩碎',
    team_enchant: '全隊武器附魔：下回合每招傷害+10',
    mock_cursed: '{target} 被鹹魚嘲笑！{n} 個增益變成【詛咒】',
    mock_erased: '{target} 被鹹魚嘲笑！{n} 個增益被抹去',
    mock_fresh: '{target} 被鹹魚嘲笑！本回合獲得的增益都會變成詛咒',
    selfish_absorb: '{unit} 吸走了 {n} 個負面狀態（身上共 {total} 個）',
    iam_fish: '我乃鹹魚！{n} 個負面狀態 → 每個敵人受到 {dmg} 真實傷害',
    hungry_ready: '我餓了：我方下一次發動的攻擊招式傷害x2',
    annoy_ready: '{target} 本回合攻擊傷害x5！',
    summon_bats: '召喚了 {n} 隻蝙蝠',
    equalize_on: '⚖️ 規則・均貧：本回合超過15的傷害壓縮成5',
    fatigue_gain: '{target} 獲得 {n} 層疲勞',
    ban_nothing: '敵方沒有可沒收的招式',
    ban_confiscate: '禁令！沒收了 {unit} 的【{card}】',
    ink_gain: '{unit} 獲得1層墨印（共{total}）',
    no_ink: '墨印不足，招式失效',
    trap_set: '在敵方 {slot} 佈下黑法殺陣',
    jailed: '{target} 被黑髮牢鎖住：本回合AP上限1',
    jailed_last: '{target} 被黑髮牢鎖住：AP上限1，直到他出一次攻擊（最多到下回合結束）',
    jail_break: '{unit} 出手攻擊，掙脫了黑髮牢',
    req_jail: '被黑髮牢鎖住：這回合最多出 1 AP',
    jail_empty: '黑髮牢鎖住了空格',
    dog_gone: '小狗不在了',
    tears_pity: '{target} 看到淚汪汪的眼睛，【不忍心】了',
    dog_big: '這是我的！小狗變成了巨犬！',
    stab_crit: '目標沒有護盾：暴擊！',
    clone_summon: '{unit} 召喚影傀，可擋下一次致命攻擊',
    cleanse: '{unit} 移除了所有負面狀態',
    serious_miss: '{target} 用了閃避/無敵，認真一拳落空！',
    summon_gpirates: '召喚了 {n} 名幽靈海盜',
    ship_already: '幽靈船已在場',
    ship_arrive: '⛵ 幽靈船駛入後場！',
    review: '米其林點評：{stars}！下回合傷害+{pct}%',
    review_three: '三星！回合末獲得10點護盾（保留到下回合）',
    wheels: '丟出了 {n} 個車輪！',
    tire_lost: '{unit} 永久失去了輪胎裝甲',
    fire_set: '{slot} 燃起龍息火焰',
    star_speed: '{target} 下回合速度+3',
    // 回合末
    ship_curse: '⛵ 幽靈船詛咒：{player} 全體下回合受傷+10%',
    summon_taunt: '{unit} 的攻擊被 {target} 的嘲吸吸引過去！',
    summon_no_target: '{unit} 找不到可攻擊的目標',
    deathmatch: '☠️ 死鬥疲勞：所有單位受到5點真實傷害',
    smith_shield: '爐火純青：{target} 獲得8點護盾（保留到下回合）',
  };
  // 與 GAME.I18N.fmt 相同：{key} 代入變數；樣板也可以是函式
  function fmt(s, v) {
    if (typeof s === 'function') return s(v || {});
    return String(s).replace(/\{(\w+)\}/g, (m, k) => (v && v[k] !== undefined && v[k] !== null ? v[k] : m));
  }
  // 取得目前語言的文字（找不到翻譯就用中文樣板）
  function M(key, v) { return fmt((GAME.I18N && GAME.I18N.msg(key)) || MSG[key], v); }
  // 五行屬性（資料裡是中文字）
  const ELEM_KEY = { '金': 'metal', '木': 'wood', '水': 'water', '火': 'fire', '土': 'earth' };
  const elemName = e => (ELEM_KEY[e] ? M('elem_' + ELEM_KEY[e]) : e);

  // ---------- 亂數 ----------
  function rnd(S) {
    let t = (S.rng = (S.rng + 0x6d2b79f5) | 0);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }
  const rint = (S, a, b) => a + Math.floor(rnd(S) * (b - a + 1));
  const pick = (S, arr) => (arr.length ? arr[Math.floor(rnd(S) * arr.length)] : null);

  // ---------- 建立新局 ----------
  function newGame(seed, opts) {
    opts = opts || {};
    const S = {
      v: 1, phase: 'ban', rng: seed | 0, round: 0,
      names: opts.names || [M('default_player', { n: 1 }), M('default_player', { n: 2 })],
      bans: [null, null], banned: [], pools: [[], []],
      banOrder: [], banIdx: 0, draftOrder: [], draftIdx: 0,
      deploys: [null, null], plans: [null, null],
      players: [{ ap: BASE_AP, pen: 0, bank: 0, saved: 0 }, { ap: BASE_AP, pen: 0, bank: 0, saved: 0 }],
      // 第三版規則（新局預設全開；舊存檔沒有這些 key 就照舊規則）
      rules: { cooldown: true, bank: true, meleeFront: true, meleeSquare: true, swapSpeed: true, noWhiff: true, dashFront: true, opWindup: 2, jailLast: true },
      sideFx: [{}, {}],
      units: [], cells: [], nextUid: 1,
      events: [], resolved: 0, log: [], winner: null, endReason: '',
    };
    S.first = rnd(S) < 0.5 ? 0 : 1;
    // 先手禁 → 後手禁 → 選角順序 1-2-2-2-2-1（先手 1、後手 2、先手 2、後手 2、先手 2、後手 1）
    const A = S.first, B = 1 - S.first;
    S.banOrder = [A, B];
    S.draftOrder = [A, B, B, A, A, B, B, A, A, B];
    return S;
  }

  // ---------- 小工具 ----------
  const unit = (S, uid) => S.units.find(u => u.uid === uid) || null;
  const alive = (S, side) => S.units.filter(u => u.alive && (side === undefined || u.side === side));
  const grid = (S, side) => alive(S, side).filter(u => !u.sm);
  const at = (S, side, slot) => S.units.find(u => u.alive && !u.sm && u.side === side && u.slot === slot) || null;
  const isFront = u => (u.sm ? u.row === 'front' : u.slot < 2);
  // 顯示用名稱（有 GAME.I18N 時依目前語言；u.n / c.n 只是後備）
  const nm = u => (GAME.I18N ? GAME.I18N.unitName(u) : u.n);
  const cn = c => (GAME.I18N ? GAME.I18N.cardName(c.id) : c.n);
  const sn = k => (GAME.I18N ? GAME.I18N.statusName(k) : ST[k].n);
  const hn = id => (GAME.I18N ? GAME.I18N.heroName(id) : DEF[id].n);
  const judgeOn = S => S.units.some(u => u.alive && u.key === 'judge');

  function stActive(S, s) { return s.from <= S.round && S.round <= s.to; }
  function getSt(S, u, k) { return u.st.find(s => s.k === k && stActive(S, s)) || null; }
  function hasSt(S, u, k) { return !!getSt(S, u, k); }
  function delSt(u, k) { u.st = u.st.filter(s => s.k !== k); }
  // 身上「本回合生效中」的負面狀態（下回合才開始的不算）
  function debuffs(S, u) { return u.st.filter(s => ST[s.k].k === 'debuff' && stActive(S, s)); }
  function untargetable(S, u) { return hasSt(S, u, 'stealth') || hasSt(S, u, 'hidden'); }
  function pirateImmune(S, u) {
    return u.key === 'pirate' && S.units.some(x => x.alive && x.key === 'ship' && x.side === u.side);
  }

  function ev(S, e) {
    if (S.quiet) return; // 模擬/AI 推演時不需要動畫快照與文字紀錄
    e.snap = snap(S);
    S.events.push(e);
    if (e.t) S.log.push(e.t);
  }
  // 模擬統計（只有 S.track 存在時）：站位規則實際發生的次數
  //   swaps 換位成功　meleeFizzle 近戰因不在前排落空　redirect 近戰打到換進格子的另一人
  //   squareMiss 近戰打到空格撲空　lockFollow 遠程／繞背單體招式追著移動過的目標打
  //   meleeFizzle 再依原因細分：fizzleEnemyMove 本回合被敵方位移過　fizzleSwapFail 自己排的換位／閃身衝前排沒成功　fizzleOther 其他
  //   squareRetarget noWhiff：格子空了改打其他目標　lockOn 【鎖定】追著換過位置的目標打　dashFront 閃身衝到前排
  const POS_KEYS = ['swaps', 'meleeFizzle', 'fizzleEnemyMove', 'fizzleSwapFail', 'fizzleOther', 'redirect', 'squareMiss', 'squareRetarget', 'lockFollow', 'lockOn', 'dashFront'];
  const posStats = () => { const o = {}; POS_KEYS.forEach(k => (o[k] = 0)); return o; };
  function trackPos(S, k) {
    if (!S.track) return;
    const P = S.track.pos || (S.track.pos = posStats());
    P[k] = (P[k] || 0) + 1;
  }
  // 站位規則：這個速度組開始時的位置（沒有記錄時用現在的位置；召喚物沒有格子）
  function posOf(S, x) {
    const gp = S.rs && S.rs.gpos;
    return gp && gp[x.uid] !== undefined ? gp[x.uid] : x.slot;
  }
  // 複製狀態（給 AI 推演用）：去掉事件、紀錄與回合暫存
  function clone(S) {
    const c = Object.assign({}, S);
    c.events = []; c.log = []; c.rs = null;
    delete c.track; delete c.lastPlans;
    c.bans = S.bans.slice(); c.banned = S.banned.slice(); c.banOrder = S.banOrder.slice(); c.pools = S.pools.map(x => x.slice());
    c.plans = S.plans.map(x => x && x.slice());
    c.deploys = S.deploys.map(x => x && x.slice());
    c.players = S.players.map(x => Object.assign({}, x));
    c.sideFx = S.sideFx.map(x => Object.assign({}, x));
    c.cells = S.cells.map(x => Object.assign({}, x));
    c.units = S.units.map(u => Object.assign({}, u, { st: u.st.map(x => Object.assign({}, x)), data: Object.assign({}, u.data), r: {} }));
    return c;
  }
  function snap(S) {
    return {
      units: S.units.map(u => ({ uid: u.uid, hp: u.hp, shield: u.shield, alive: u.alive, slot: u.slot, st: u.st.filter(s => stActive(S, s) || s.from > S.round).map(s => ({ k: s.k, st: s.st, from: s.from })), data: Object.assign({}, u.data) })),
      cells: S.cells.map(c => Object.assign({}, c)),
    };
  }

  function makeUnit(S, side, key, slot) {
    const d = DEF[key];
    const u = {
      uid: S.nextUid++, side, key, n: d.n, icon: d.icon, hp: d.hp, maxHp: d.hp, spd: d.spd,
      slot, sm: false, alive: true, shield: 0, st: [], data: {}, r: {}, minion: !!d.minion,
    };
    S.units.push(u);
    return u;
  }
  function makeSummon(S, owner, key) {
    const d = D.summons[key];
    const mine = alive(S, owner.side).filter(u => u.sm);
    if (mine.length >= 12) { ev(S, { k: 'info', t: M('summon_limit') }); return null; }
    const u = {
      uid: S.nextUid++, side: owner.side, key, n: d.n, icon: d.icon, hp: d.hp, maxHp: d.hp, spd: 0,
      slot: null, row: d.row, sm: true, undead: !!d.undead, owner: owner.uid, alive: true, shield: 0, st: [], data: {}, r: {},
    };
    S.units.push(u);
    return u;
  }

  // ---------- 狀態 ----------
  function addSt(S, u, k, o) {
    if (!u.alive) return false;
    o = o || {};
    const def = ST[k];
    const from = o.from === undefined ? S.round : o.from;
    const to = o.to === undefined ? S.round : o.to;
    if (def.k === 'debuff' && pirateImmune(S, u)) { ev(S, { k: 'miss', b: u.uid, t: M('immune_ship', { unit: nm(u), status: sn(k) }) }); return false; }
    if (def.k === 'debuff' && k === 'burn' && u.key === 'dragon') { ev(S, { k: 'miss', b: u.uid, t: M('immune_dragon', { unit: nm(u), status: sn('burn') }) }); return false; }
    if (def.k === 'buff' && u.r.mocked) {
      if (addCurse(S, u, 1)) ev(S, { k: 'status', b: u.uid, t: M('mocked_buff_cursed', { unit: nm(u), status: sn(k) }) });
      return false;
    }
    const ex = u.st.find(s => s.k === k && s.from === from);
    if (ex) {
      ex.to = Math.max(ex.to, to);
      if (o.st) ex.st = (ex.st || 0) + o.st;
      if (o.v !== undefined) ex.v = k === 'vuln' ? (ex.v || 0) + o.v : Math.max(ex.v || 0, o.v);
    } else {
      u.st.push({ k, from, to, st: o.st || 0, v: o.v });
    }
    // 認真一拳：記住「本回合用過閃避/無敵類效果」（即使之後被觸發掉）
    if (PROTECT.includes(k) && from <= S.round && S.round <= to) u.r.protectUsed = true;
    return true;
  }
  // 詛咒也是負面狀態：有幽靈船的海盜之王免疫。回傳是否真的加上
  function addCurse(S, u, n) {
    if (!u.alive || !(n > 0)) return false;
    if (pirateImmune(S, u)) { ev(S, { k: 'miss', b: u.uid, t: M('immune_ship', { unit: nm(u), status: sn('curse') }) }); return false; }
    const ex = u.st.find(s => s.k === 'curse' && s.from === S.round);
    if (ex) ex.st += n; else u.st.push({ k: 'curse', from: S.round, to: S.round + 1, st: n });
    return true;
  }

  // ---------- 回復 / 護盾 ----------
  function heal(S, u, amt, why, force) {
    if (!u.alive || amt <= 0) return 0;
    if (u.key === 'eater' && !force) { ev(S, { k: 'miss', b: u.uid, t: M('no_heal_eater', { unit: nm(u) }) }); return 0; }
    const before = u.hp;
    u.hp = Math.min(u.maxHp, u.hp + Math.round(amt));
    const got = u.hp - before;
    ev(S, { k: 'heal', b: u.uid, n: got, t: M(why ? 'heal_why' : 'heal', { unit: nm(u), why, n: got }) });
    return got;
  }
  function giveShield(S, u, amt, why) {
    if (!u.alive) return;
    amt = Math.round(amt);
    if (u.r.mocked) { if (addCurse(S, u, 1)) ev(S, { k: 'status', b: u.uid, t: M('mocked_shield_cursed', { unit: nm(u) }) }); return; }
    u.shield += amt;
    ev(S, { k: 'shield', b: u.uid, n: amt, t: M(why ? 'shield_why' : 'shield', { unit: nm(u), why, n: amt }) });
  }

  // ---------- 傷害 ----------
  // o.kind: phys(一般) pierce(無視護盾) true(真實：無視護盾、防禦與減傷)
  // o.act: 發動這次傷害的招式（用來讓「一次攻擊」的判定涵蓋整張招式，例如閃身、冰之環繞反傷）
  // 回傳實際扣血量；攻擊被閃避（虛無／飛行／閃身／隱身／水游）時另外設 o.evaded = true，
  // 讓呼叫端分辨「落空」與「命中但 0 傷害」（護盾全吸收、食物我最愛、影傀仍算命中）。
  function dealDamage(S, src, tgt, amt, o) {
    o = o || {};
    const kind = o.kind || 'phys';
    if (!tgt || !tgt.alive) return 0;
    const sName = src ? nm(src) : (o.srcName || '');
    // 閃身／隱身閃避的是「一次攻擊」：同一張招式對這個目標的後續各段也一併落空
    const dodgeAct = () => { if (o.act) (o.act.dodgedBy = o.act.dodgedBy || {})[tgt.uid] = true; };
    // --- 閃避判定 ---
    if (src && tgt.key === 'ghost' && !tgt.sm && !tgt.r.usedAP && !tgt.r.voidUsed) { tgt.r.voidUsed = true; o.evaded = true; ev(S, { k: 'miss', a: src && src.uid, b: tgt.uid, t: M('evade_void', { target: nm(tgt) }) }); return 0; }
    if (o.melee && hasSt(S, tgt, 'flying')) { o.evaded = true; ev(S, { k: 'miss', a: src && src.uid, b: tgt.uid, t: M('evade_flying', { target: nm(tgt) }) }); return 0; }
    if (src && src.side !== tgt.side && hasSt(S, tgt, 'dodge1') && (src.r.speed || 0) < (tgt.r.speed || 0)) {
      delSt(tgt, 'dodge1');
      o.evaded = true; dodgeAct();
      ev(S, { k: 'miss', a: src.uid, b: tgt.uid, t: M('evade_dash', { target: nm(tgt), src: sName }) });
      return 0;
    }
    if (src && kind !== 'true' && hasSt(S, tgt, 'stealth') && !tgt.r.stealthUsed) {
      tgt.r.stealthUsed = true;
      o.evaded = true; dodgeAct();
      ev(S, { k: 'miss', a: src && src.uid, b: tgt.uid, t: M('evade_stealth', { target: nm(tgt) }) });
      return 0;
    }
    if (hasSt(S, tgt, 'waterDodge')) {
      delSt(tgt, 'waterDodge');
      o.evaded = true;
      ev(S, { k: 'miss', a: src && src.uid, b: tgt.uid, t: M('evade_water', { target: nm(tgt) }) });
      return 0;
    }
    // --- 增傷 ---
    if (src && !src.sm) {
      if (src.key === 'icequeen' && (hasSt(S, tgt, 'frozen') || hasSt(S, tgt, 'slow') || hasSt(S, tgt, 'chill'))) amt *= 1.2;
    }
    if (src && src.key === 'saint' && tgt.undead) amt *= 2;
    // 易傷 / 詛咒
    let up = 0;
    tgt.st.forEach(s => {
      if (!stActive(S, s)) return;
      if (s.k === 'vuln') up += s.v || 0;
      if (s.k === 'curse') up += 10 * (s.st || 1);
    });
    amt *= 1 + up / 100;
    // --- 減傷 ---
    if (kind !== 'true') {
      let red = 0;
      if (tgt.key === 'michelin' && !tgt.data.noTire) red += 10;
      if (hasSt(S, tgt, 'reduce')) red += 10;
      if (tgt.key === 'fish') red += Math.min(40, 10 * debuffs(S, tgt).length);
      if (tgt.key === 'golem') red += Math.min(50, 10 * alive(S, tgt.side).filter(x => x.key === 'statue').length);
      amt *= Math.max(0, 1 - red / 100);
      if (hasSt(S, tgt, 'taunt')) amt *= 0.5;
      if (hasSt(S, tgt, 'guard')) amt *= 0.5; // 防禦：其他減傷算完後再減半（不會疊到完全不受傷）
    }
    amt = Math.round(amt);
    if (S.rs && S.rs.equalize && amt > 15) { amt = 5; ev(S, { k: 'info', t: M('equalize_hit') }); }
    // --- 防禦 ---
    if (kind !== 'true') {
      let def = 0;
      if (tgt.key === 'monk') def += tgt.data.def || 0;
      if (hasSt(S, tgt, 'ironfist')) def += 5;
      if (tgt.key === 'golem') def += 2 * Math.floor((tgt.maxHp - tgt.hp) / (tgt.maxHp * 0.2));
      amt = Math.max(0, amt - def);
    }
    // --- 食物我最愛 ---
    if (hasSt(S, tgt, 'food') && !tgt.r.foodUsed && amt > 0) {
      tgt.r.foodUsed = true;
      ev(S, { k: 'miss', a: src && src.uid, b: tgt.uid, t: M('food_eat', { target: nm(tgt), n: amt }) });
      heal(S, tgt, amt * 2, M('why_food_full'), true);
      return 0;
    }
    // --- 護盾 ---
    let absorbed = 0;
    if (kind === 'phys' && tgt.shield > 0) {
      absorbed = Math.min(tgt.shield, amt);
      tgt.shield -= absorbed;
      amt -= absorbed;
      if (absorbed > 0 && hasSt(S, tgt, 'cut') && !tgt.r.cutDone) {
        tgt.r.cutDone = true;
        addSt(S, tgt, 'critNext', { from: S.round + 1, to: S.round + 1 });
      }
    }
    // --- 影傀 ---
    if (amt >= tgt.hp && hasSt(S, tgt, 'clone')) {
      delSt(tgt, 'clone');
      ev(S, { k: 'miss', a: src && src.uid, b: tgt.uid, t: M('clone_block', { target: nm(tgt) }) });
      return 0;
    }
    tgt.hp -= amt;
    if (amt > 0) tgt.r.hurt = true;
    const tag = kind === 'true' ? 'dmg_true' : kind === 'pierce' ? 'dmg_pierce' : 'dmg';
    const shTxt = absorbed ? M('dmg_absorbed', { n: absorbed }) : '';
    if (S.track) {
      const tk = src ? src.key : (o.srcName || 'env');
      S.track.dmg[tk] = (S.track.dmg[tk] || 0) + amt + absorbed;
    }
    ev(S, { k: 'dmg', a: src && src.uid, b: tgt.uid, n: amt, sh: absorbed, t: M(sName ? tag + '_src' : tag, { src: sName, target: nm(tgt), n: amt, absorb: shTxt }) });
    if (src && src.key === 'monk' && src.alive && amt + absorbed > 0 && (src.data.def || 0) < 6 && !(o.act && o.act.monkDef)) {
      if (o.act) o.act.monkDef = true; // 一張招式只加一次防禦
      src.data.def = Math.min(6, (src.data.def || 0) + 2);
    }
    if (tgt.hp <= 0) kill(S, tgt);
    // --- 反傷：冰之環繞（一張近戰招式算一次攻擊，多段攻擊只反傷一次） ---
    if (o.melee && !o.noCounter && src && src.alive && hasSt(S, tgt, 'iceAura') && !(o.act && o.act.countered)) {
      if (o.act) o.act.countered = true;
      ev(S, { k: 'info', t: M('ice_aura_counter', { target: nm(tgt) }) });
      dealDamage(S, null, src, 5, { kind: 'true', srcName: nm(tgt) });
      addSt(S, src, 'slow', { from: S.round, to: S.round + 1 });
    }
    return amt;
  }
  function kill(S, u) {
    u.hp = 0;
    u.alive = false;
    u.shield = 0;
    ev(S, { k: 'death', b: u.uid, t: M('death', { unit: nm(u) }) });
  }
  function selfHurt(S, u, amt, why) {
    if (!u.alive) return;
    u.hp -= amt;
    ev(S, { k: 'dmg', b: u.uid, n: amt, t: M('self_hurt', { unit: nm(u), why, n: amt }) });
    if (u.hp <= 0) kill(S, u);
  }

  // ---------- 控制 ----------
  function control(S, u, k, a) {
    if (!u.alive) return;
    if (!addSt(S, u, k, { from: S.round, to: S.round + 1 })) return;
    u.r.cancelAt = Math.min(u.r.cancelAt === undefined ? 99 : u.r.cancelAt, S.rs.group);
    if (a && !a.penDone) { a.penDone = true; S.players[u.side].pen++; }
    ev(S, { k: 'status', b: u.uid, t: M('controlled', { unit: nm(u), status: sn(k) }) });
  }
  function addChill(S, u, a) {
    if (!u.alive) return;
    if (!addSt(S, u, 'chill', { from: S.round, to: 999, st: 1 })) return;
    const total = u.st.filter(s => s.k === 'chill').reduce((n, s) => n + (s.st || 0), 0);
    ev(S, { k: 'status', b: u.uid, t: M('chill_gain', { unit: nm(u), total }) });
    if (total >= 3) { delSt(u, 'chill'); control(S, u, 'frozen', a); }
  }

  // ---------- 位移 ----------
  function enterCell(S, u) {
    if (!u.alive) return; // 已倒下（例如被撞擊打倒）的單位不會觸發或消耗陷阱
    S.cells.filter(c => c.side === u.side && c.slot === u.slot).forEach(c => {
      if (u.key === 'hawk') return;
      if (c.type === 'trap') { S.cells.splice(S.cells.indexOf(c), 1); ev(S, { k: 'info', t: M('trap_pulled_in', { unit: nm(u) }) }); dealDamage(S, null, u, 25, { srcName: M('src_trap') }); }
      else if (c.type === 'fire') { ev(S, { k: 'info', t: M('fire_pushed_in', { unit: nm(u) }) }); dealDamage(S, null, u, 10, { srcName: M('src_fire') }); }
    });
  }
  // src：造成位移的單位（站位規則用：記錄「被自己這一方移動過」）
  function displace(S, u, dir, bump, src) {
    if (!u.alive || u.sm) return;
    if (u.key === 'giant') { ev(S, { k: 'miss', b: u.uid, t: M('giant_immune_move', { unit: nm(u) }) }); return; }
    if (dir === 'pull' && u.slot < 2) { ev(S, { k: 'info', t: M('already_front', { unit: nm(u) }) }); return; }
    if (dir === 'push' && u.slot >= 2) { ev(S, { k: 'info', t: M('already_back', { unit: nm(u) }) }); return; }
    const to = dir === 'pull' ? u.slot - 2 : u.slot + 2;
    const other = at(S, u.side, to);
    // 厚重：目的格上的巨人不會被換走 → 雙方都不移動；擊退撞上巨人時仍各受撞擊傷
    if (other && other.key === 'giant') {
      ev(S, { k: 'miss', b: other.uid, t: M(dir === 'pull' ? 'giant_block_pull' : 'giant_block_push', { unit: nm(u), other: nm(other) }) });
      if (bump) {
        dealDamage(S, null, u, bump, { srcName: M('src_bump') });
        dealDamage(S, null, other, bump, { srcName: M('src_bump') });
      }
      return;
    }
    if (other) other.slot = u.slot;
    u.slot = to;
    if (src && src.side === u.side) { u.r.ownMove = true; if (other) other.r.ownMove = true; }
    // 統計：本回合被敵方位移過（近戰落空的原因）
    if (src && src.side !== u.side) { u.r.enemyMoved = true; if (other) other.r.enemyMoved = true; }
    ev(S, { k: 'move', b: u.uid, t: M((dir === 'pull' ? 'pulled_front' : 'pushed_back') + (other ? '_swap' : ''), { unit: nm(u), other: other && nm(other) }) });
    if (other && bump) {
      dealDamage(S, null, u, bump, { srcName: M('src_bump') });
      dealDamage(S, null, other, bump, { srcName: M('src_bump') });
    }
    enterCell(S, u);
    if (other && other.alive) enterCell(S, other);
  }

  // ---------- 目標 ----------
  // pos（選用）：取得格子的函式；站位規則結算時傳入「速度組開始時的位置」，同速的位移不影響目標是否合法
  function enemyPool(S, side, rng, pos) {
    const sl = pos || (x => x.slot);
    const front1 = pos ? (x => (x.sm ? x.row === 'front' : sl(x) < 2)) : isFront;
    const es = alive(S, 1 - side);
    const front = es.filter(front1);
    if (rng === 'melee') {
      return grid(S, 1 - side).some(u => sl(u) < 2) ? front : es;
    }
    if (rng === 'back') {
      const back = es.filter(u => !front1(u));
      return back.length ? back : es;
    }
    return es;
  }
  function validTargets(S, u, c, pos) {
    switch (c.tgt) {
      case 'enemy': {
        const dog = alive(S, 1 - u.side).find(x => x.key === 'dog');
        if (dog && c.rng !== 'back') return [dog.uid];
        return enemyPool(S, u.side, c.rng, pos).map(x => x.uid);
      }
      case 'ally': return grid(S, u.side).map(x => x.uid);
      case 'allyFront': return grid(S, u.side).filter(x => x.slot < 2 || x.uid === u.uid).map(x => x.uid);
      case 'allyHero': return grid(S, u.side).filter(x => !x.minion).map(x => x.uid);
      case 'cell': return [0, 1, 2, 3];
      default: return [];
    }
  }
  function enemyTarget(S, a) {
    const u = a.u, c = a.c, es = 1 - u.side;
    const taunter = alive(S, es).find(x => hasSt(S, x, 'taunt'));
    if (taunter) { ev(S, { k: 'info', t: M('taunt_redirect', { unit: nm(taunter) }) }); return taunter; }
    let t = unit(S, a.target);
    // 【鎖定】（巨拳、山掌；只在站位規則開啟時有作用）：嘲吸、小狗照舊優先；
    // 否則出招時盯上的目標還活著、可以被選中 → 不管跑到哪一格都打他（不看格子、不檢查前後排）；倒下了才照一般規則改打
    const lock = c.lock && posRules(S) && !alive(S, es).some(x => x.key === 'dog');
    if (lock && t && t.alive && !untargetable(S, t)) {
      if (!t.sm && t.r.planSlot !== undefined && t.slot !== t.r.planSlot) trackPos(S, 'lockOn');
      return t;
    }
    // 近戰打格子（meleeSquare）：嘲吸照舊優先；小狗、召喚物目標、原地倒下的目標照一般規則
    if (c.rng === 'melee' && ruleSet(S, 'meleeSquare') && !lock) {
      const sq = squareTarget(S, a, t);
      if (sq !== undefined) return sq;
    }
    // 站位規則開啟時，目標是否合法以這個速度組開始時的位置判斷（同速換位／位移不分哪一方先結算）
    const list = validTargets(S, u, c, S.rs && S.rs.gpos ? x => posOf(S, x) : undefined).map(id => unit(S, id));
    if (!t || !t.alive || !list.includes(t)) {
      t = pick(S, list.filter(x => !untargetable(S, x)));
      if (!t) { ev(S, { k: 'miss', t: M('no_target', { unit: nm(u), card: cn(c) }) }); return null; }
      ev(S, { k: 'info', t: M('retarget', { target: nm(t) }) });
    }
    if (untargetable(S, t)) { ev(S, { k: 'miss', b: t.uid, t: M('untargetable', { target: nm(t), card: cn(c) }) }); return null; }
    // 統計：遠程／繞背（絕對鎖定）追著本回合移動過的原目標打
    if (c.rng !== 'melee' && t.uid === a.target && !t.sm && t.r.planSlot !== undefined && t.slot !== t.r.planSlot) trackPos(S, 'lockFollow');
    return t;
  }
  // 近戰單體攻擊瞄準「出招鎖定時目標站的格子」（meleeSquare）。
  // 這是給防守方的：目標自己或隊友換位，換進這一格的人替他挨打（格子空了就撲空）。
  // 位置以出手者這個速度組開始時為準：比出手者快的換位／位移才躲得掉，同速的來不及。
  // 只有目標「被自己這一方移動過」（自己或隊友換位）才算離開格子；被出手方（勾爪、擊退）移走的照一般規則追著打
  // 回傳 undefined：照一般規則（小狗在場、目標是召喚物、目標沒移動但倒下、只被出手方移動過、noWhiff 時格子空了）；null：撲空；否則是實際被打到的單位
  function squareTarget(S, a, t) {
    const u = a.u, c = a.c, es = 1 - u.side;
    if (!t || t.sm || t.side !== es || t.r.planSlot === undefined) return undefined;
    if (alive(S, es).some(x => x.key === 'dog')) return undefined; // 小狗的鎖定優先（照舊）
    const sq = t.r.planSlot;
    let v = t;
    if (posOf(S, t) === sq) {
      if (!t.alive) return undefined; // 原地倒下：照舊隨機改打
    } else {
      if (!t.r.ownMove) return undefined; // 例如我方勾爪把目標拉上前：照舊打目標，不會反而撲空
      v = grid(S, es).find(x => posOf(S, x) === sq) || null;
      if (!v) {
        // noWhiff：那一格沒人 → 不撲空，照一般規則改打其他合法目標
        if (ruleSet(S, 'noWhiff')) { trackPos(S, 'squareRetarget'); return undefined; }
        ev(S, { k: 'miss', a: u.uid, t: M('square_empty', { unit: nm(u), card: cn(c) }) });
        trackPos(S, 'squareMiss');
        return null;
      }
    }
    if (untargetable(S, v)) { ev(S, { k: 'miss', b: v.uid, t: M('untargetable', { target: nm(v), card: cn(c) }) }); return null; }
    if (v !== t) {
      ev(S, { k: 'info', b: v.uid, t: M('square_hit', { target: nm(v), other: nm(t) }) });
      trackPos(S, 'redirect');
    }
    return v;
  }
  function allyTarget(S, a) {
    const t = unit(S, a.target);
    if (!t || !t.alive) { ev(S, { k: 'miss', t: M('ally_down', { card: cn(a.c) }) }); return null; }
    return t;
  }

  // ---------- AP ----------
  function cardCost(S, p, c) {
    const snow = S.sideFx[p].snow;
    return c.ap + (snow && snow === S.round ? 1 : 0);
  }
  function planBudget(S, p, actions) {
    return S.players[p].ap + actions.filter(a => a.card === 'mn_sac').length;
  }

  // ---------- 招式需求 ----------
  // 出招階段預估的速度（角色速度＋這份出招裡自己的招式加速）；結算時的速度在回合開始就定下來，跟這裡一樣
  function previewSpeed(S, u, cards) {
    const prev = S.rs;
    S.rs = { judge: judgeOn(S) };
    try { return unitSpeed(S, u, cards); } finally { S.rs = prev; }
  }
  const planSpeed = (S, u, actions) => previewSpeed(S, u, (actions || []).filter(a => a.uid === u.uid).map(a => CARD[a.card]).filter(Boolean));
  // 近戰需在前排（meleeFront）：看我方這份出招的換位結算完（只算在這張近戰之前生效的），出招者是否站在前排。
  //   現在在後排：一定要有自己的換位。
  //   換位是預判（swapSpeed 關）：同一列每有一個換位就前後對調一次（兩人都換＝沒換）。
  //   swapSpeed：換位目的地固定（鎖定時那一排的另一排），自己的換位一定比自己的近戰先；
  //              隊友的換位要比「這張近戰的出手速度」快才會先把自己換走（同速視為同時，不影響）。
  //              出手速度含單張招式的調整（opWindup：認真一拳比角色本身慢，速度介於兩者之間、甚至同速的隊友換位都會先結算）。
  //   敵方的位移不列入（跟現在就在後排、只能靠敵人拉上前一樣，不允許賭）。
  //   dashFront：後排排了閃身（而且衝得過去）→ 一定會站到前排（閃身是預判，同一列之後的換位不會再把他換回後排）；
  //              反過來，前排角色同一列後排的隊友閃身衝上來 → 自己會被換到後排。
  function meleeFrontOk(S, u, c, actions) {
    if (c.rng !== 'melee' || u.sm || !ruleSet(S, 'meleeFront')) return true;
    const acts = actions || [];
    const swaps = x => acts.some(a => a.uid === x.uid && a.card === 'x_move');
    const dashes = x => ruleSet(S, 'dashFront') && x.slot >= 2 && acts.some(a => a.uid === x.uid && a.card === 'sw_dash') && !dashBlock(S, x);
    if (dashes(u)) return true;
    const own = swaps(u);
    if (u.slot >= 2 && !own) return false;
    const mate = at(S, u.side, u.slot < 2 ? u.slot + 2 : u.slot - 2);
    if (mate && dashes(mate)) return false;
    const mateSwaps = !!mate && swaps(mate);
    let front = u.slot < 2;
    if (ruleSet(S, 'swapSpeed')) {
      if (own) front = !front;
      else if (mateSwaps && planSpeed(S, mate, acts) > planSpeed(S, u, acts) + cardSpeedAdj(S, c)) front = !front;
    } else {
      if (own) front = !front;
      if (mateSwaps) front = !front;
    }
    return front;
  }
  // 閃身衝前排（dashFront）擋不擋得住：'controlled' 被冰凍／眩暈、'giant' 同一列前排是巨人；衝得過去回傳 null
  function dashBlock(S, u) {
    if (hasSt(S, u, 'frozen') || hasSt(S, u, 'stun')) return 'controlled';
    const front = at(S, u.side, u.slot - 2);
    return front && front.key === 'giant' ? 'giant' : null;
  }
  // 黑髮牢新版（jailLast）：被鎖住的角色，這回合自己出的招總共最多 1 AP（獻祭者給的 AP 也一樣）
  function jailOk(S, u, c, actions) {
    if (!ruleSet(S, 'jailLast') || !hasSt(S, u, 'jail')) return true;
    const ids = (actions || []).filter(a => a.uid === u.uid).map(a => a.card);
    if (!ids.includes(c.id)) ids.push(c.id);
    return ids.reduce((n, id) => n + (CARD[id] ? cardCost(S, u.side, CARD[id]) : 0), 0) <= 1;
  }
  function reqOk(S, u, c, actions) {
    if (onCooldown(S, u, c)) return false;
    if (!jailOk(S, u, c, actions)) return false;
    if ((c.id === 'x_guard' && !ruleOn(S, 'guard')) || (c.id === 'x_move' && !ruleOn(S, 'swap'))) return false;
    if (!meleeFrontOk(S, u, c, actions)) return false;
    const mine = (actions || []).filter(a => a.uid === u.uid).map(a => a.card);
    switch (c.req) {
      case 'sunmark': return !!u.data.sunmark;
      case 'ink': return (u.data.ink || 0) + mine.filter(id => id === 'ink_fist').length >= 1 + mine.filter(id => id !== c.id && (id === 'ink_trap' || id === 'ink_jail')).length;
      case 'dog': return alive(S, u.side).some(x => x.key === 'dog');
      case 'statue': return alive(S, u.side).some(x => x.key === 'statue') || mine.includes('gm_wake');
      case 'noship': return !alive(S, u.side).some(x => x.key === 'ship');
      case 'tire': return !u.data.noTire;
      case 'move': {
        if (u.key === 'giant' || hasSt(S, u, 'frozen') || hasSt(S, u, 'stun')) return false;
        const other = at(S, u.side, u.slot < 2 ? u.slot + 2 : u.slot - 2);
        return !(other && other.key === 'giant');
      }
      default: return true;
    }
  }
  // 招式不能用的原因：用 getter，每次讀取都依目前語言（E.REQ_TXT[key] 照常可用）
  const REQ_TXT = {};
  ['sunmark', 'ink', 'dog', 'statue', 'noship', 'tire', 'cd', 'move', 'front', 'jail'].forEach(k =>
    Object.defineProperty(REQ_TXT, k, { enumerable: true, get: () => M('req_' + k) }));
  // reqOk 不通過時的原因（REQ_TXT 的 key）；通過時回傳 null
  function reqWhy(S, u, c, actions) {
    if (reqOk(S, u, c, actions)) return null;
    if (onCooldown(S, u, c)) return 'cd';
    if (!jailOk(S, u, c, actions)) return 'jail';
    return meleeFrontOk(S, u, c, actions) ? c.req : 'front';
  }

  // ---------- 驗證 ----------
  function validate(S, a) {
    if (!a || a.p !== 0 && a.p !== 1) return M('err_bad_action');
    if (S.phase === 'over') return M('err_game_over');
    switch (a.type) {
      case 'ban':
        if (S.phase !== 'ban') return M('err_not_ban_phase');
        if (S.banOrder[S.banIdx] !== a.p) return M(S.bans[a.p] ? 'err_already_banned' : 'err_not_your_ban');
        if (!DEF[a.hero] || DEF[a.hero].minion) return M('err_ban_hero_only');
        if (S.banned.includes(a.hero)) return M('err_hero_banned');
        return null;
      case 'pick':
        if (S.phase !== 'draft') return M('err_not_draft_phase');
        if (S.draftOrder[S.draftIdx] !== a.p) return M('err_not_your_turn');
        if (!DEF[a.hero] || DEF[a.hero].minion) return M('err_pick_hero_only');
        if (S.banned.includes(a.hero)) return M('err_hero_banned');
        if (S.pools[0].includes(a.hero) || S.pools[1].includes(a.hero)) return M('err_hero_taken');
        return null;
      case 'deploy': {
        if (S.phase !== 'deploy') return M('err_not_deploy_phase');
        if (S.deploys[a.p]) return M('err_already_deployed');
        const list = a.units || [];
        if (list.length < 1) return M('err_min_units');
        if (list.length > MAX_UNITS) return M('err_max_units', { n: MAX_UNITS });
        const slots = new Set(), heroes = new Set();
        let cost = 0;
        for (const x of list) {
          const d = DEF[x.key];
          if (!d) return M('err_unknown_unit');
          if (!d.minion) {
            if (!S.pools[a.p].includes(x.key)) return M('err_not_in_pool');
            if (heroes.has(x.key)) return M('err_dup_hero');
            heroes.add(x.key);
          }
          if (![0, 1, 2, 3].includes(x.slot) || slots.has(x.slot)) return M('err_bad_slot');
          // meleeFront：巨人不能換位，放在後排就永遠打不到人 → 只能放前排
          if (x.key === 'giant' && x.slot >= 2 && ruleSet(S, 'meleeFront')) return M('err_giant_front');
          slots.add(x.slot);
          cost += d.cost;
        }
        if (cost > MAX_COST) return M('err_over_cost', { n: MAX_COST });
        return null;
      }
      case 'plan': return validatePlan(S, a.p, a.actions || []);
      case 'surrender': return null;
      default: return M('err_unknown_action');
    }
  }
  function validatePlan(S, p, actions) {
    if (S.phase !== 'plan') return M('err_not_plan_phase');
    if (S.plans[p]) return M('err_already_planned');
    const seen = new Set(), groups = new Set();
    let total = 0;
    for (const a of actions) {
      const u = unit(S, a.uid);
      if (!u || u.side !== p || !u.alive || u.sm) return M('err_bad_unit');
      const c = CARD[a.card];
      if (!c || (c.owner !== u.key && c.owner !== '*')) return M('err_bad_card');
      if (onCooldown(S, u, c)) return M('err_card_req', { card: cn(c), reason: REQ_TXT.cd });
      if (seen.has(u.uid + c.id)) return M('err_dup_card');
      seen.add(u.uid + c.id);
      if (c.group) {
        if (groups.has(u.uid + c.group)) return M('err_card_group', { card: cn(c) });
        groups.add(u.uid + c.group);
      }
      if (!reqOk(S, u, c, actions)) return M('err_card_req', { card: cn(c), reason: REQ_TXT[reqWhy(S, u, c, actions)] });
      total += cardCost(S, p, c);
      if (['enemy', 'ally', 'allyFront', 'allyHero', 'cell'].includes(c.tgt)) {
        if (!validTargets(S, u, c).includes(a.target)) return M('err_card_target', { card: cn(c) });
      }
    }
    if (total > planBudget(S, p, actions)) return M('err_no_ap');
    return null;
  }

  // ---------- 套用動作 ----------
  function apply(S, a) {
    switch (a.type) {
      case 'ban':
        S.bans[a.p] = a.hero;
        S.banned.push(a.hero);
        S.banIdx++;
        S.log.push(M('log_ban', { player: S.names[a.p], hero: hn(a.hero) }));
        if (S.banIdx >= S.banOrder.length) S.phase = 'draft';
        break;
      case 'pick':
        S.pools[a.p].push(a.hero);
        S.draftIdx++;
        S.log.push(M('log_pick', { player: S.names[a.p], hero: hn(a.hero) }));
        if (S.draftIdx >= S.draftOrder.length) S.phase = 'deploy';
        break;
      case 'deploy':
        S.deploys[a.p] = a.units.map(x => ({ key: x.key, slot: x.slot }));
        if (S.deploys[0] && S.deploys[1]) {
          [0, 1].forEach(p => S.deploys[p].forEach(x => {
            const u = makeUnit(S, p, x.key, x.slot);
            if (u.key === 'dogger') makeSummon(S, u, 'dog');
          }));
          S.log.push(M('log_lineup'));
          S.phase = 'plan';
          startRound(S);
        }
        break;
      case 'plan':
        S.plans[a.p] = a.actions.map(x => ({ uid: x.uid, card: x.card, target: x.target }));
        if (S.plans[0] && S.plans[1]) {
          resolveRound(S);
          if (S.phase !== 'over') startRound(S);
        }
        break;
      case 'surrender':
        S.winner = 1 - a.p;
        S.endReason = M('end_surrender', { player: S.names[a.p] });
        S.phase = 'over';
        break;
    }
    return S;
  }

  function startRound(S) {
    S.round++;
    S.plans = [null, null];
    [0, 1].forEach(p => {
      const saved = ruleOn(S, 'bank') ? Math.min(1, S.players[p].bank || 0) : 0;
      S.players[p].ap = Math.max(0, BASE_AP - S.players[p].pen) + saved;
      S.players[p].saved = saved;
      S.players[p].pen = 0;
      S.players[p].bank = 0;
    });
  }

  // ---------- 速度 ----------
  function unitSpeed(S, u, cards) {
    if (u.key === 'giant') return -100;
    const judge = S.rs.judge;
    let base = u.spd;
    if (u.key === 'onepunch' && u.hp < u.maxHp * 0.3 && !judge) base = 10;
    let up = 0, down = 0;
    cards.forEach(c => (up += c.spd || 0));
    if (hasSt(S, u, 'star')) up += 3;
    if (hasSt(S, u, 'focus')) up += 2;
    if (hasSt(S, u, 'slow')) down += 2;
    u.st.forEach(s => { if (s.k === 'chill' && stActive(S, s)) down += s.st || 0; });
    return base + (judge ? 0 : up) - down;
  }
  // 單張招式的出手速度調整：抽球「若與對手同速，此招優先結算」只作用在抽球本身；
  // opWindup：認真一拳要蓄力，比一拳就贏本身慢 opWindup（不是加速，所以審判官的法庭不會取消）
  function cardSpeedAdj(S, c) {
    if (c.id === 'pp_drive') return 0.5;
    if (c.id === 'op_serious') return -ruleNum(S, 'opWindup');
    return 0;
  }
  function actSpeed(S, a) { return a.u.r.speed + cardSpeedAdj(S, a.c); }

  // ---------- 回合結算 ----------
  function resolveRound(S) {
    const R = S.round;
    S.events = [];
    S.rs = { equalize: false, judge: judgeOn(S), group: -1 };
    S.units.forEach(u => (u.r = {}));
    grid(S).forEach(u => (u.r.planSlot = u.slot)); // 出招鎖定時的位置（近戰打格子、統計用）
    ev(S, { k: 'phase', t: M('round_header', { round: R }) });
    if (S.rs.judge) ev(S, { k: 'info', t: M('judge_court') });
    grid(S).forEach(u => { if (u.key === 'icecap' && u.slot < 2) giveShield(S, u, 5, M('why_steady')); });

    const acts = [];
    [0, 1].forEach(p => S.plans[p].forEach((x, i) => {
      const u = unit(S, x.uid), c = CARD[x.card];
      if (!u || !c) return;
      acts.push({ p, u, c, target: x.target, cost: cardCost(S, p, c), i, done: false, cancelled: false });
    }));
    S.rs.acts = acts;
    S.lastPlans = [S.plans[0], S.plans[1]];
    [0, 1].forEach(p => {
      const mine = acts.filter(a => a.p === p);
      const budget = S.players[p].ap + mine.filter(a => a.c.id === 'mn_sac').length;
      S.players[p].bank = Math.min(1, Math.max(0, budget - mine.reduce((n, a) => n + a.cost, 0)));
    });
    acts.forEach(a => {
      a.u.r.cards = (a.u.r.cards || []).concat(a);
      if (a.cost > 0) a.u.r.usedAP = true;
    });
    alive(S).forEach(u => (u.r.speed = u.sm ? 0 : unitSpeed(S, u, (u.r.cards || []).map(a => a.c))));
    // 先手判定
    const actingSpeed = side => Math.max(-999, ...alive(S, side).filter(u => u.r.cards).map(u => u.r.speed));
    alive(S).forEach(u => { u.r.first = u.r.speed > actingSpeed(1 - u.side); });

    // 揭曉
    [0, 1].forEach(p => {
      const list = acts.filter(a => a.p === p);
      ev(S, { k: 'info', t: list.length ? M('reveal', { player: S.names[p], list: list.map(a => M('reveal_item', { unit: nm(a.u), card: cn(a.c) })).join(M('list_sep')) }) : M('reveal_rest', { player: S.names[p] }) });
    });

    const bySpeed = (a, b) => (b.u.r.speed - a.u.r.speed) || (a.p - b.p) || ((a.u.slot || 0) - (b.u.slot || 0)) || (a.i - b.i);
    // 站位規則：記下「這個速度組開始時」的位置。同速的換位／位移視為同時：
    //   近戰打格子來不及閃、目標是否合法、近戰者是否在前排，都以這個位置判斷（不會因為哪一方先結算而不同）
    const markPos = () => {
      if (!posRules(S)) return;
      S.rs.gpos = {};
      grid(S).forEach(u => (S.rs.gpos[u.uid] = u.slot));
    };
    // 預判/防禦階段
    const pre = acts.filter(a => isPre(S, a.c)).sort(bySpeed);
    if (pre.length) ev(S, { k: 'phase', t: M('phase_pre') });
    markPos();
    for (const a of pre) {
      if (a.cancelled) { ev(S, { k: 'miss', a: a.u.uid, t: M('card_confiscated', { unit: nm(a.u), card: cn(a.c) }) }); continue; }
      if (!a.u.alive) continue;
      exec(S, a);
      breakJail(S, a);
    }
    // 主要階段：依每張招式的出手速度分組，同速同時結算
    const mainActs = acts.filter(a => !isPre(S, a.c));
    const speeds = Array.from(new Set(mainActs.map(a => actSpeed(S, a)))).sort((a, b) => b - a);
    if (mainActs.length) ev(S, { k: 'phase', t: M('phase_main') });
    // 同一角色同速度組內的順序：換位（swapSpeed 時才會在主要階段）→ 自身強化／先手招 → 出招順序
    const rank = a => (a.c.id === 'x_move' ? 2 : a.c.buff || a.c.first ? 1 : 0);
    speeds.forEach((sp, gi) => {
      S.rs.group = gi;
      markPos();
      const group = [];
      mainActs.forEach(a => { if (actSpeed(S, a) === sp && !group.includes(a.u)) group.push(a.u); });
      group.sort((a, b) => (a.side - b.side) || (a.slot - b.slot));
      const okAtStart = new Set(group.filter(u => u.alive && !(u.r.cancelAt < gi)));
      group.forEach(u => {
        const list = u.r.cards.filter(a => !isPre(S, a.c) && actSpeed(S, a) === sp).sort((a, b) => (rank(b) - rank(a)) || (a.i - b.i));
        if (!okAtStart.has(u)) {
          if (!u.r.missLogged) {
            u.r.missLogged = true;
            ev(S, { k: 'miss', a: u.uid, t: M(u.alive ? 'controlled_fail' : 'down_before_act', { unit: nm(u) }) });
          }
          return;
        }
        for (const a of list) {
          if (a.cancelled) { ev(S, { k: 'miss', a: u.uid, t: M('card_confiscated', { unit: nm(u), card: cn(a.c) }) }); continue; }
          // 黑髮牢：只限制比上鎖更晚的速度組（同速同時出手不受影響）；AP 上限也算入本回合已出的招（含預判）
          if (u.r.jailed && u.r.jailedAt < gi) {
            const spent = u.r.cards.filter(x => x.done).reduce((n, x) => n + x.cost, 0);
            if (spent + a.cost > 1) { ev(S, { k: 'miss', a: u.uid, t: M('jail_blocked', { unit: nm(u), card: cn(a.c) }) }); continue; }
          }
          if (!u.alive && !okAtStart.has(u)) break;
          exec(S, a);
          breakJail(S, a);
          // swapSpeed：自己換位踩進陷阱／火焰倒下 → 剩下的招式不再出手（跟換位在預判階段時一樣）
          if (a.c.id === 'x_move' && !u.alive) {
            if (list.indexOf(a) < list.length - 1 && !u.r.missLogged) {
              u.r.missLogged = true;
              ev(S, { k: 'miss', a: u.uid, t: M('down_before_act', { unit: nm(u) }) });
            }
            break;
          }
        }
      });
    });
    endPhase(S);
    S.resolved = R;
    S.rs = null;
  }

  // 黑髮牢新版：被鎖的人出了一次攻擊（招式真的打出傷害計算）就掙脫
  function breakJail(S, a) {
    if (!a.prep || !ruleSet(S, 'jailLast') || !a.u.alive || !hasSt(S, a.u, 'jail')) return;
    delSt(a.u, 'jail');
    ev(S, { k: 'status', b: a.u.uid, t: M('jail_break', { unit: nm(a.u) }) });
  }
  // 攻擊招式的倍率（第一次造成傷害時才計算，避免非攻擊招式吃掉增益）
  function prep(S, a) {
    if (a.prep) return;
    a.prep = true;
    const u = a.u;
    let m = 1, flat = 0;
    // 我餓了：狀態掛在吞食者身上，我方任一角色下一次發動的攻擊招式吃到 x2
    const hg = alive(S, u.side).find(x => hasSt(S, x, 'hungry'));
    if (hg) { m *= 2; delSt(hg, 'hungry'); ev(S, { k: 'info', t: M('hungry_x2', { unit: nm(u) }) }); }
    if (hasSt(S, u, 'annoy')) { m *= 5; ev(S, { k: 'info', t: M('annoy_x5', { unit: nm(u) }) }); }
    if (hasSt(S, u, 'pity')) { m *= 0.5; delSt(u, 'pity'); ev(S, { k: 'info', t: M('pity_half', { unit: nm(u) }) }); }
    const rv = getSt(S, u, 'review');
    if (rv) m *= 1 + (rv.v || 0) / 100;
    const emp = getSt(S, u, 'empower');
    if (emp) { flat += 5; delSt(u, 'empower'); }
    if (hasSt(S, u, 'enchant')) flat += 10;
    if (hasSt(S, u, 'crazy')) flat += 10;
    if (hasSt(S, u, 'wing')) flat += 10;
    if (u.key === 'pingpong' && !S.rs.judge && (hasSt(S, u, 'critNext') || rnd(S) < 0.25)) {
      m *= 2;
      ev(S, { k: 'info', t: M('pingpong_crit', { unit: nm(u) }) });
    }
    a.m = m; a.flat = flat; a.first = true;
  }
  // 單體攻擊的一段。結算後 a.evaded 表示這一段是否被閃避（附加效果只在命中時生效）
  function hit(S, a, tgt, base, o) {
    a.evaded = false;
    if (!tgt || !tgt.alive) return 0;
    if (a.dodgedBy && a.dodgedBy[tgt.uid]) { a.evaded = true; return 0; } // 這張招式已被閃身／隱身整招閃掉
    if (a.startAlive && !a.u.alive) return 0; // 出招者在這張招式途中倒下（例如被冰之環繞反傷打倒），剩下的段數不再出手
    prep(S, a);
    const amt = (base + (a.first ? a.flat : 0)) * a.m;
    a.first = false;
    const opt = Object.assign({ melee: a.c.rng === 'melee', act: a }, o || {});
    const dmg = dealDamage(S, a.u, tgt, amt, opt);
    a.evaded = !!opt.evaded;
    return dmg;
  }
  function aoe(S, a, base, o, each) {
    prep(S, a);
    const amt = (base + a.flat) * a.m;
    a.first = false;
    alive(S, 1 - a.u.side).forEach(t => {
      if (!t.alive) return;
      const opt = Object.assign({ aoe: true, act: a }, o || {});
      dealDamage(S, a.u, t, amt, opt);
      if (each && t.alive && !opt.evaded) each(t); // 閃避掉範圍攻擊的目標不吃附加效果
    });
  }

  // ---------- 各招式效果 ----------
  function exec(S, a) {
    const u = a.u, c = a.c, R = S.round;
    a.done = true;
    if (!c.basic) u.data.cd = Object.assign({}, u.data.cd, { [c.id]: R }); // 記錄使用回合（不能連續兩回合使用）
    a.startAlive = u.alive;
    ev(S, { k: 'act', a: u.uid, c: c.id, t: M('use_card', { unit: nm(u), card: cn(c) }) });
    // 近戰需在前排（meleeFront）：出招時不在前排（被更快的擊退、換位失敗…）→ 招式落空，AP 照扣。
    // 位置以這個速度組開始時為準（同速的位移視為同時）；自己在這一組已經換過位的話，以換位後為準
    if (c.rng === 'melee' && !u.sm && ruleSet(S, 'meleeFront') && (S.rs && u.r.selfMoveGroup === S.rs.group ? u.slot : posOf(S, u)) >= 2) {
      ev(S, { k: 'miss', a: u.uid, t: M('melee_not_front', { unit: nm(u), card: cn(c) }) });
      trackPos(S, 'meleeFizzle');
      if (S.track) {
        // 落空原因：被敵方位移過 → 自己排的換位／閃身衝前排沒成功 → 其他
        const planned = (u.r.cards || []).some(x => x.c.id === 'x_move' || (x.c.id === 'sw_dash' && ruleSet(S, 'dashFront') && u.r.planSlot >= 2));
        trackPos(S, u.r.enemyMoved ? 'fizzleEnemyMove' : planned && !u.r.selfMoved ? 'fizzleSwapFail' : 'fizzleOther');
      }
      return;
    }
    // 五行相生
    let E = 1;
    if (c.elem) {
      if (u.data.lastElem && u.data.lastElemRound === R - 1 && u.data.lastElem !== c.elem) {
        E = 1.3;
        ev(S, { k: 'info', t: M('elem_boost', { from: elemName(u.data.lastElem), to: elemName(c.elem) }) });
      }
      u.r.elem = c.elem;
    }
    let t;
    switch (c.id) {
      // 基本動作
      case 'x_guard': if (addSt(S, u, 'guard')) ev(S, { k: 'status', b: u.uid, t: M('guard_stance', { unit: nm(u) }) }); break;
      case 'x_move': {
        const late = ruleSet(S, 'swapSpeed'); // 換位在主要階段依速度結算
        if (S.rs) u.r.selfMoveGroup = S.rs.group; // meleeFront：之後自己的近戰以換位後的位置判斷
        // swapSpeed：目的地在出招鎖定時就決定（鎖定時那一排的另一排）；已經被拉／推過去了就不再換回來
        // dashFront：同一列本回合有人閃身衝前排 → 這一列的換位也一樣以出招鎖定時的位置決定目的地（閃身衝上前的人不會又被換回後排）
        if ((late || u.r.dashCol) && u.r.planSlot !== undefined && (u.slot < 2) !== (u.r.planSlot < 2)) {
          ev(S, { k: 'info', t: M(u.slot < 2 ? 'already_front' : 'already_back', { unit: nm(u) }) });
          break;
        }
        const to = u.slot < 2 ? u.slot + 2 : u.slot - 2;
        const other = at(S, u.side, to);
        if (u.key === 'giant' || (other && other.key === 'giant')) { ev(S, { k: 'miss', b: u.uid, t: M('swap_giant') }); break; }
        // swapSpeed：同一速度組裡才被控制的不影響（同速視為同時，跟其他招式一樣）；更早被控制的整個角色本來就不會出手
        if ((hasSt(S, u, 'frozen') || hasSt(S, u, 'stun')) && !(late && u.r.cancelAt === S.rs.group)) { ev(S, { k: 'miss', b: u.uid, t: M('swap_controlled', { unit: nm(u) }) }); break; }
        if (other) other.slot = u.slot;
        u.slot = to;
        u.r.ownMove = true; // meleeSquare：被自己這一方移動 → 算離開格子
        u.r.selfMoved = true; // 統計：自己的換位成功
        if (other) other.r.ownMove = true;
        ev(S, { k: 'move', b: u.uid, t: M((to < 2 ? 'swap_front' : 'swap_back') + (other ? '_with' : ''), { unit: nm(u), other: other && nm(other) }) });
        trackPos(S, 'swaps');
        enterCell(S, u);
        if (other) enterCell(S, other);
        break;
      }
      // 曜神劍客
      case 'sw_slash': if ((t = enemyTarget(S, a))) hit(S, a, t, 15); break;
      case 'sw_dash':
        addSt(S, u, 'dodge1');
        if (ruleSet(S, 'meleeFront') && ruleSet(S, 'dashFront')) dashForward(S, u);
        break;
      case 'sw_sun':
        if ((t = enemyTarget(S, a))) { hit(S, a, t, 25); }
        if (!u.data.sunmark) { u.data.sunmark = true; ev(S, { k: 'status', b: u.uid, t: M('sunmark_gain', { unit: nm(u) }) }); }
        break;
      case 'sw_final':
        if (!u.data.sunmark) { ev(S, { k: 'miss', t: M('no_sunmark') }); break; }
        // 曜印只在真的出手打向某個單位時才消耗（被閃避也算）；找不到目標、撲空、近戰不在前排落空時保留
        if ((t = enemyTarget(S, a))) { u.data.sunmark = false; hit(S, a, t, 100, { kind: 'true' }); }
        break;
      // 朱其小公主
      case 'pr_fire':
        if ((t = enemyTarget(S, a))) { hit(S, a, t, 8); if (t.alive && !a.evaded) addSt(S, t, 'burn', { to: R + 1 }) && ev(S, { k: 'status', b: t.uid, t: M('got_status', { target: nm(t), status: sn('burn') }) }); }
        break;
      case 'pr_tri':
        if ((t = enemyTarget(S, a))) for (let i = 0; i < 3 && t.alive; i++) hit(S, a, t, 5);
        break;
      case 'pr_crazy':
        addSt(S, u, 'crazy');
        addSt(S, u, 'vuln', { from: R + 1, to: R + 1, v: 20 });
        break;
      case 'pr_blast': aoe(S, a, 25, {}, x => addSt(S, x, 'burn', { to: R + 1 })); break;
      // 冰雪女王
      case 'iq_palm': if ((t = enemyTarget(S, a))) { hit(S, a, t, 18); if (!a.evaded) addChill(S, t, a); } break;
      case 'iq_spike': if ((t = enemyTarget(S, a))) hit(S, a, t, 20); break;
      case 'iq_blizzard':
        aoe(S, a, 20);
        S.sideFx[1 - u.side].snow = R + 1;
        ev(S, { k: 'status', t: M('blizzard_snow', { player: S.names[1 - u.side] }) });
        break;
      // 五行大師
      case 'wx_metal': giveShield(S, u, 15 * E, cn(c)); break;
      case 'wx_earth': heal(S, u, 15 * E, cn(c)); break;
      case 'wx_wood':
        if ((t = enemyTarget(S, a))) {
          hit(S, a, t, 5 * E);
          if (!a.evaded) {
            S.players[t.side].pen++;
            ev(S, { k: 'status', t: M('wood_vine', { player: S.names[t.side] }) });
          }
        }
        break;
      case 'wx_water': addSt(S, u, 'waterDodge', { to: R + 1 }); break;
      case 'wx_fire': if ((t = enemyTarget(S, a))) hit(S, a, t, 16 * E); break;
      // 皇室鷹
      case 'hk_claw': if ((t = enemyTarget(S, a))) hit(S, a, t, 18); break;
      case 'hk_flame': if ((t = enemyTarget(S, a))) { hit(S, a, t, 15); if (t.alive && !a.evaded) addSt(S, t, 'burn', { to: R + 1 }); } break;
      case 'hk_dash':
        if (u.r.first) { addSt(S, u, 'wing'); ev(S, { k: 'status', b: u.uid, t: M('hawk_first', { unit: nm(u) }) }); }
        else ev(S, { k: 'info', t: M('hawk_late', { unit: nm(u) }) });
        break;
      case 'hk_elite': if ((t = enemyTarget(S, a))) hit(S, a, t, 30, { kind: 'true' }); break;
      // 巨人
      case 'gt_fist': if ((t = enemyTarget(S, a))) hit(S, a, t, 30); break;
      case 'gt_taunt': addSt(S, u, 'taunt'); break;
      case 'gt_palm': if ((t = enemyTarget(S, a))) { hit(S, a, t, 30); if (t.alive && !a.evaded) displace(S, t, 'push', 10, u); } break;
      // 艾冰團長
      case 'ic_aura': addSt(S, u, 'iceAura', { to: R + 1 }); break;
      case 'ic_chop':
        if ((t = enemyTarget(S, a))) hit(S, a, t, hasSt(S, t, 'slow') || hasSt(S, t, 'frozen') || hasSt(S, t, 'chill') ? 20 : 10);
        break;
      case 'ic_freeze': if ((t = enemyTarget(S, a))) { hit(S, a, t, 10); if (!a.evaded) control(S, t, 'frozen', a); } break;
      // 移動石像
      case 'gm_slash': if ((t = enemyTarget(S, a))) hit(S, a, t, 22, { noCounter: true }); break;
      case 'gm_wake': if (makeSummon(S, u, 'statue')) ev(S, { k: 'summon', a: u.uid, t: M('summon_statue', { unit: nm(u) }) }); break;
      case 'gm_will': {
        const sts = alive(S, u.side).filter(x => x.key === 'statue');
        if (!sts.length) { ev(S, { k: 'miss', t: M('no_statue') }); break; }
        if ((t = enemyTarget(S, a))) {
          // 石之意志是移動石像的攻擊招式：吃全隊／自身的傷害增益（倍率每尊都算，固定加值只加在第一下）
          prep(S, a);
          sts.forEach(s => {
            if (!t.alive || (a.dodgedBy && a.dodgedBy[t.uid])) return;
            const amt = (12 + (a.first ? a.flat : 0)) * a.m;
            a.first = false;
            dealDamage(S, s, t, amt, { act: a });
          });
        }
        sts.forEach(s => { s.alive = false; s.hp = 0; });
        ev(S, { k: 'info', t: M('statues_shatter', { n: sts.length }) });
        break;
      }
      // 破岩武僧
      case 'mk_iron': addSt(S, u, 'ironfist'); if ((t = enemyTarget(S, a))) hit(S, a, t, 10); break;
      case 'mk_ten': if ((t = enemyTarget(S, a))) for (let i = 0; i < 10 && t.alive; i++) hit(S, a, t, 3); break;
      case 'mk_big': if ((t = enemyTarget(S, a))) hit(S, a, t, 40, { kind: 'pierce' }); break;
      // 造器者
      case 'sm_forge': if ((t = enemyTarget(S, a))) hit(S, a, t, 16); addSt(S, u, 'empower', { to: R + 5 }); break;
      case 'sm_guard': if ((t = allyTarget(S, a))) giveShield(S, t, 20, cn(c)); break;
      case 'sm_99':
        if ((t = enemyTarget(S, a))) hit(S, a, t, 15);
        grid(S, u.side).forEach(x => addSt(S, x, 'enchant', { from: R + 1, to: R + 1 }));
        ev(S, { k: 'status', t: M('team_enchant') });
        break;
      // 鹹魚
      case 'fs_mock':
        if ((t = enemyTarget(S, a))) {
          t.r.mocked = true;
          let n = 0;
          if (t.shield > 0) { t.shield = 0; n++; }
          t.st = t.st.filter(s => { if (ST[s.k].k === 'buff' && stActive(S, s)) { n++; return false; } return true; });
          const cursed = n ? addCurse(S, t, n) : false;
          ev(S, { k: 'status', b: t.uid, t: M(n ? (cursed ? 'mock_cursed' : 'mock_erased') : 'mock_fresh', { target: nm(t), n }) });
        }
        break;
      case 'fs_selfish': {
        let n = 0;
        S.units.forEach(x => {
          if (x === u || !x.alive) return;
          const ds = x.st.filter(s => ST[s.k].k === 'debuff' && s.to >= R);
          if (!ds.length) return;
          x.st = x.st.filter(s => !ds.includes(s));
          if (!pirateImmune(S, u)) ds.forEach(s => { u.st.push(s); n++; });
        });
        ev(S, { k: 'status', b: u.uid, t: M('selfish_absorb', { unit: nm(u), n, total: debuffs(S, u).length }) });
        break;
      }
      case 'fs_iam': {
        const n = Math.max(1, debuffs(S, u).length); // 鹹魚本身就算 1 個
        ev(S, { k: 'info', t: M('iam_fish', { n, dmg: n * 25 }) });
        aoe(S, a, n * 25, { kind: 'true' });
        u.st = u.st.filter(s => ST[s.k].k !== 'debuff');
        break;
      }
      // 煩人的吞食者
      case 'et_hungry':
        if (addSt(S, u, 'hungry', { to: R + 5 })) ev(S, { k: 'status', b: u.uid, t: M('hungry_ready') });
        break;
      case 'et_bite': if ((t = enemyTarget(S, a))) hit(S, a, t, 14); break;
      // 煩死你：讓敵人這回合的攻擊 x5，再用「食物我最愛」吃掉這一擊回血
      case 'et_annoy': if ((t = enemyTarget(S, a))) addSt(S, t, 'annoy') && ev(S, { k: 'status', b: t.uid, t: M('annoy_ready', { target: nm(t) }) }); break;
      case 'et_food': addSt(S, u, 'food'); break;
      // 吸血鬼
      case 'vp_bite': if ((t = enemyTarget(S, a))) { hit(S, a, t, 20); heal(S, u, 5, M('why_bloodthirst')); } break;
      case 'vp_bat':
        selfHurt(S, u, 10, M('why_blood_bat'));
        for (let i = 0; i < 2; i++) makeSummon(S, u, 'bat');
        ev(S, { k: 'summon', a: u.uid, t: M('summon_bats', { n: 2 }) });
        break;
      case 'vp_burst':
        selfHurt(S, u, 40, cn(c));
        for (let i = 0; i < 5; i++) makeSummon(S, u, 'bat');
        ev(S, { k: 'summon', a: u.uid, t: M('summon_bats', { n: 5 }) });
        break;
      // 審判官
      case 'jd_equal': S.rs.equalize = true; ev(S, { k: 'status', t: M('equalize_on') }); break;
      case 'jd_torture':
        if ((t = enemyTarget(S, a))) {
          const n = t.r.cards && t.r.cards.length ? 1 : 2; // 本回合有出招（含 0AP 招式）→ 1 層，沒出招 → 2 層
          if (addSt(S, t, 'fatigue', { to: R + 2, st: n })) ev(S, { k: 'status', b: t.uid, t: M('fatigue_gain', { target: nm(t), n }) });
        }
        break;
      case 'jd_ban': {
        const cand = S.rs.acts.filter(x => x.p !== a.p && !x.done && !x.cancelled);
        if (!cand.length) { ev(S, { k: 'miss', t: M('ban_nothing') }); break; }
        cand.sort((x, y) => (y.cost - x.cost) || (y.u.r.speed - x.u.r.speed));
        cand[0].cancelled = true;
        ev(S, { k: 'status', b: cand[0].u.uid, t: M('ban_confiscate', { unit: nm(cand[0].u), card: cn(cand[0].c) }) });
        break;
      }
      // 影鬼
      case 'gh_stealth': addSt(S, u, 'stealth'); break;
      case 'gh_soul': if ((t = enemyTarget(S, a))) hit(S, a, t, 10, { kind: 'true' }); break;
      case 'gh_orb': if ((t = enemyTarget(S, a))) hit(S, a, t, 22); break;
      // 墨影咒術師
      case 'ink_fist':
        if ((t = enemyTarget(S, a))) hit(S, a, t, 20);
        u.data.ink = (u.data.ink || 0) + 1;
        ev(S, { k: 'status', b: u.uid, t: M('ink_gain', { unit: nm(u), total: u.data.ink }) });
        break;
      case 'ink_trap':
      case 'ink_jail': {
        if (!(u.data.ink > 0)) { ev(S, { k: 'miss', t: M('no_ink') }); break; }
        u.data.ink--;
        const es = 1 - u.side, slot = a.target;
        if (c.id === 'ink_trap') {
          S.cells = S.cells.filter(x => !(x.side === es && x.slot === slot && x.type === 'trap'));
          S.cells.push({ side: es, slot, type: 'trap', from: R, to: 999 });
          ev(S, { k: 'status', t: M('trap_set', { slot: slotName(slot) }) });
        } else {
          S.cells.push({ side: es, slot, type: 'jail', from: R, to: R });
          const v = at(S, es, slot);
          if (v) {
            // 狀態真的加上才上鎖（有幽靈船的海盜之王免疫，addSt 會自己寫紀錄）；記下上鎖時的速度組，同速的對手不受影響
            const last = ruleSet(S, 'jailLast');
            if (addSt(S, v, 'jail', last ? { to: R + 1 } : undefined)) {
              v.r.jailed = true;
              if (v.r.jailedAt === undefined) v.r.jailedAt = S.rs.group;
              ev(S, { k: 'status', b: v.uid, t: M(last ? 'jailed_last' : 'jailed', { target: nm(v) }) });
            }
          } else ev(S, { k: 'miss', t: M('jail_empty') });
        }
        break;
      }
      // 愛狗的召喚師
      case 'dg_shield': {
        const dog = alive(S, u.side).find(x => x.key === 'dog');
        if (dog) giveShield(S, dog, 25, cn(c)); else ev(S, { k: 'miss', t: M('dog_gone') });
        break;
      }
      case 'dg_tears': if ((t = enemyTarget(S, a))) { if (addSt(S, t, 'pity', { to: R + 3 })) ev(S, { k: 'status', b: t.uid, t: M('tears_pity', { target: nm(t) }) }); } break;
      case 'dg_mine': {
        const dog = alive(S, u.side).find(x => x.key === 'dog');
        if (!dog) { ev(S, { k: 'miss', t: M('dog_gone') }); break; }
        // 巨犬是增益：走 addSt，被鹹魚嘲笑時會轉成詛咒
        if (addSt(S, dog, 'bigdog', { to: R + 1 })) {
          dog.n = '巨犬'; dog.icon = '🐺';
          ev(S, { k: 'status', b: dog.uid, t: M('dog_big') });
        }
        break;
      }
      // 影子刺客
      case 'as_stab':
        if ((t = enemyTarget(S, a))) {
          const crit = t.shield <= 0 && !S.rs.judge;
          if (crit) ev(S, { k: 'info', t: M('stab_crit') });
          hit(S, a, t, crit ? 35 : 20);
        }
        break;
      case 'as_hide': addSt(S, u, 'hidden'); break;
      case 'as_clone': addSt(S, u, 'clone', { to: 999 }); ev(S, { k: 'status', b: u.uid, t: M('clone_summon', { unit: nm(u) }) }); break;
      // 一拳就贏
      case 'op_train':
        heal(S, u, 10, cn(c));
        u.st = u.st.filter(s => ST[s.k].k !== 'debuff');
        ev(S, { k: 'status', b: u.uid, t: M('cleanse', { unit: nm(u) }) });
        break;
      case 'op_punch': if ((t = enemyTarget(S, a))) hit(S, a, t, 20, { kind: 'pierce' }); break;
      case 'op_serious':
        if ((t = enemyTarget(S, a))) {
          if (t.r.protectUsed || PROTECT.some(k => hasSt(S, t, k)) || (t.key === 'ghost' && !t.r.usedAP && !t.r.voidUsed)) { ev(S, { k: 'miss', b: t.uid, t: M('serious_miss', { target: nm(t) }) }); break; }
          hit(S, a, t, 150, { kind: 'true' });
        }
        break;
      // 海盜之王
      case 'pk_hook': if ((t = enemyTarget(S, a))) { hit(S, a, t, 18); if (t.alive && !a.evaded) displace(S, t, 'pull', 0, u); } break;
      case 'pk_crew':
        for (let i = 0; i < 2; i++) makeSummon(S, u, 'gpirate');
        ev(S, { k: 'summon', a: u.uid, t: M('summon_gpirates', { n: 2 }) });
        break;
      case 'pk_ship':
        if (alive(S, u.side).some(x => x.key === 'ship')) { ev(S, { k: 'miss', t: M('ship_already') }); break; }
        if (makeSummon(S, u, 'ship')) ev(S, { k: 'summon', a: u.uid, t: M('ship_arrive') });
        break;
      // 米其林
      case 'mc_review': {
        const star = rint(S, 1, 3), pct = [0, 20, 60, 100][star];
        addSt(S, u, 'review', { from: R + 1, to: R + 1, v: pct });
        ev(S, { k: 'status', b: u.uid, t: M('review', { stars: '⭐'.repeat(star), pct }) });
        if (star === 3) { u.data.keepShield = (u.data.keepShield || 0) + 10; ev(S, { k: 'info', t: M('review_three') }); }
        break;
      }
      case 'mc_wheel':
        if ((t = enemyTarget(S, a))) {
          let n = 1;
          while (n < 5 && rnd(S) < 0.45) n++; // 每多一個車輪的機率各 45%
          ev(S, { k: 'info', t: M('wheels', { n }) });
          for (let i = 1; i <= n && t.alive; i++) hit(S, a, t, 4 * (Math.pow(2, i) - 1));
        }
        break;
      case 'mc_boom':
        aoe(S, a, 35, { kind: 'pierce' });
        if (!u.data.noTire) { u.data.noTire = true; ev(S, { k: 'status', b: u.uid, t: M('tire_lost', { unit: nm(u) }) }); }
        break;
      // 桌球玩家
      case 'pp_cut': giveShield(S, u, 30, cn(c)); addSt(S, u, 'cut'); break;
      case 'pp_drive': if ((t = enemyTarget(S, a))) hit(S, a, t, 14); break;
      case 'pp_smash': if ((t = enemyTarget(S, a))) hit(S, a, t, 25); break;
      // 聖女
      case 'st_shield': if ((t = allyTarget(S, a))) giveShield(S, t, 20, cn(c)); break;
      case 'st_chant':
        grid(S, u.side).forEach(x => { heal(S, x, 12, cn(c)); addSt(S, x, 'reduce', { to: R + 1 }); });
        break;
      case 'st_light': {
        // 全體傷害，再從被命中的敵方角色中隨機眩暈 1 名
        const hitList = [];
        aoe(S, a, 15, {}, x => { if (!x.sm) hitList.push(x); });
        const v = pick(S, hitList.filter(x => x.alive));
        if (v) control(S, v, 'stun', a);
        break;
      }
      case 'st_spear': if ((t = enemyTarget(S, a))) hit(S, a, t, 32); break;
      // 小龍
      case 'dr_fly': addSt(S, u, 'flying'); break;
      case 'dr_ram':
        if ((t = enemyTarget(S, a))) hit(S, a, t, hasSt(S, u, 'flying') ? 45 : 30); // 飛行中的頭衝仍是近戰
        break;
      case 'dr_breath':
        if ((t = enemyTarget(S, a))) {
          hit(S, a, t, 25);
          if (!t.sm) {
            // 同一格只會有一團火：再次命中只刷新持續時間，不疊加
            S.cells = S.cells.filter(x => !(x.side === t.side && x.slot === t.slot && x.type === 'fire'));
            S.cells.push({ side: t.side, slot: t.slot, type: 'fire', from: R, to: R + 1 });
            ev(S, { k: 'status', t: M('fire_set', { slot: slotName(t.slot) }) });
          }
        }
        break;
      // 小兵
      case 'mn_guard': if ((t = allyTarget(S, a))) giveShield(S, t, 15, cn(c)); break;
      case 'mn_star': if ((t = allyTarget(S, a))) { addSt(S, t, 'star', { from: R + 1, to: R + 1 }); ev(S, { k: 'status', b: t.uid, t: M('star_speed', { target: nm(t) }) }); } break;
      case 'mn_shoot': if ((t = enemyTarget(S, a))) hit(S, a, t, 15, { kind: 'true' }); break;
      case 'mn_sac': selfHurt(S, u, 20, M('why_sac', { card: cn(c) })); break;
    }
  }
  function slotName(s) { return MSG['slot' + s] === undefined ? undefined : M('slot' + s); }
  // 閃身衝前排（meleeFront + dashFront）：閃身結算時人在後排 → 衝到同一列的前排（和隊友交換或進空格）。
  // 算「自己這一方的移動」（近戰打格子時算離開格子）；不是換位：不受換位冷卻限制、也不會讓換位進入冷卻。
  // 同一列前排是巨人、或自己被冰凍／眩暈時衝不過去（寫紀錄）。
  // 「在後排」以出招鎖定時（回合開始）的位置為準，跟出招檢查 meleeFrontOk 一樣：
  //   回合開始在前排的劍客，就算閃身結算前被同一列的換位（swapSpeed 關時換位也在預判階段）換到後排，也不會再衝回前排，
  //   結果不受點選順序、速度先後影響，也不會把剛換上前的隊友又推回後排。
  function dashForward(S, u) {
    if (u.sm || !u.alive) return;
    if ((u.r.planSlot !== undefined ? u.r.planSlot : u.slot) < 2) return; // 回合開始在前排：閃身只有閃避
    const markCol = () => {
      // 這一列之後的換位以出招鎖定時的位置決定目的地（見 x_move），閃身衝上前的人不會又被換回後排
      u.r.dashCol = true;
      const mate = at(S, u.side, u.slot < 2 ? u.slot + 2 : u.slot - 2);
      if (mate) mate.r.dashCol = true;
    };
    if (u.slot < 2) {
      // 已經在前排：出招時在後排（例如同一列隊友先換位把他換上來）也一樣鎖定這一列
      u.r.selfMoved = true; markCol();
      return;
    }
    const why = dashBlock(S, u);
    if (why) {
      const front = at(S, u.side, u.slot - 2);
      ev(S, { k: 'miss', b: u.uid, t: M(why === 'giant' ? 'dash_front_giant' : 'dash_front_controlled', { unit: nm(u), other: front && nm(front) }) });
      return;
    }
    const to = u.slot - 2, other = at(S, u.side, to);
    if (other) other.slot = u.slot;
    u.slot = to;
    u.r.ownMove = true; u.r.selfMoved = true;
    if (other) other.r.ownMove = true;
    markCol();
    ev(S, { k: 'move', b: u.uid, t: M('dash_front', { unit: nm(u) }) });
    trackPos(S, 'dashFront');
    enterCell(S, u);
    if (other) enterCell(S, other);
  }

  // ---------- 回合末 ----------
  function endPhase(S) {
    const R = S.round;
    S.rs.group = 99;
    ev(S, { k: 'phase', t: M('phase_end') });
    // 召喚物攻擊
    [0, 1].forEach(side => {
      alive(S, side).filter(u => u.sm).forEach(u => {
        if (!u.alive) return;
        const es = 1 - side;
        const egrid = grid(S, es);
        if (!egrid.length) return;
        if (u.key === 'ship') {
          alive(S, es).forEach(x => addSt(S, x, 'vuln', { from: R + 1, to: R + 1, v: 10 }));
          ev(S, { k: 'status', t: M('ship_curse', { player: S.names[es] }) });
          return;
        }
        if (!['bat', 'gpirate', 'dog'].includes(u.key)) return;
        // 召喚物的單體攻擊：和英雄的單體招式一樣會被嘲吸吸走，也選不中影藏／隱身中的單位
        let t = alive(S, es).find(x => hasSt(S, x, 'taunt'));
        if (t) ev(S, { k: 'info', t: M('summon_taunt', { unit: nm(u), target: nm(t) }) });
        else {
          const fr = egrid.filter(x => x.slot < 2);
          const pool = u.key === 'bat' ? egrid : (fr.length ? fr : egrid); // 幽靈海盜、小狗優先打前場
          t = pick(S, pool.filter(x => !untargetable(S, x)));
        }
        if (!t) { ev(S, { k: 'miss', a: u.uid, t: M('summon_no_target', { unit: nm(u) }) }); return; }
        // 淚汪汪：被【不忍心】的召喚物，下一次攻擊傷害減半
        let m = 1;
        if (hasSt(S, u, 'pity')) { m = 0.5; delSt(u, 'pity'); ev(S, { k: 'info', t: M('pity_half', { unit: nm(u) }) }); }
        if (u.key === 'dog' && hasSt(S, u, 'bigdog')) {
          const o = {};
          dealDamage(S, u, t, 25 * m, o);
          if (!o.evaded && t.alive && addSt(S, t, 'bleed', { from: R + 1, to: R + 2 })) ev(S, { k: 'status', b: t.uid, t: M('got_status', { target: nm(t), status: sn('bleed') }) });
        } else dealDamage(S, u, t, (u.key === 'dog' ? 12 : u.key === 'gpirate' ? 8 : 4) * m, {});
      });
    });
    // 持續傷害
    alive(S).forEach(u => {
      const burn = getSt(S, u, 'burn');
      if (burn && u.alive) dealDamage(S, null, u, 6, { kind: 'true', srcName: sn('burn') });
      const fat = u.st.filter(s => s.k === 'fatigue' && stActive(S, s)).reduce((n, s) => n + (s.st || 1), 0);
      if (fat && u.alive) dealDamage(S, null, u, 5 * fat, { kind: 'true', srcName: sn('fatigue') });
      if (hasSt(S, u, 'bleed') && u.alive) dealDamage(S, null, u, 5, { kind: 'true', srcName: sn('bleed') });
    });
    // 陷阱與火焰
    S.cells.slice().forEach(c => {
      if (c.type === 'jail' || !(c.from <= R && R <= c.to)) return;
      const u = at(S, c.side, c.slot);
      if (!u || u.key === 'hawk') return;
      if (c.type === 'trap') { S.cells.splice(S.cells.indexOf(c), 1); dealDamage(S, null, u, 25, { srcName: M('src_trap') }); }
      if (c.type === 'fire') dealDamage(S, null, u, 10, { srcName: M('src_fire') });
    });
    // 死鬥疲勞
    if (R >= FATIGUE_FROM) {
      ev(S, { k: 'info', t: M('deathmatch') });
      alive(S).forEach(u => dealDamage(S, null, u, 5, { kind: 'true', srcName: M('src_deathmatch') }));
    }
    // 被動
    grid(S).forEach(u => {
      if (u.key === 'vampire') {
        const bats = alive(S, u.side).filter(x => x.key === 'bat').length;
        if (bats) heal(S, u, 1 * bats, M('why_bats', { n: bats }));
      }
      if (u.key === 'swordsman' && u.slot >= 2 && !u.r.hurt) addSt(S, u, 'focus', { from: R + 1, to: R + 1 });
      if (u.r.elem) { u.data.lastElem = u.r.elem; u.data.lastElemRound = R; }
    });
    // 護盾消散，之後才給「保留到下回合」的護盾（本回合被鹹魚嘲笑的單位：護盾改為詛咒）
    S.units.forEach(u => (u.shield = 0));
    const keepShield = (t, n, msg) => {
      if (t.r.mocked) {
        if (addCurse(S, t, 1)) ev(S, { k: 'status', b: t.uid, t: M('mocked_shield_cursed', { unit: nm(t) }) });
        return;
      }
      t.shield += n;
      if (msg) ev(S, { k: 'shield', b: t.uid, n, t: msg });
    };
    grid(S).forEach(u => {
      if (u.data.keepShield) { const n = u.data.keepShield; u.data.keepShield = 0; keepShield(u, n); }
      if (u.key === 'smith' && !u.r.hurt) {
        const mates = grid(S, u.side).filter(x => x !== u);
        const t = pick(S, mates.length ? mates : [u]);
        keepShield(t, 8, M('smith_shield', { target: nm(t) }));
      }
    });
    // 狀態到期
    S.units.forEach(u => {
      u.st = u.st.filter(s => s.to > R);
      if (u.key === 'dog' && !u.st.some(s => s.k === 'bigdog') && u.n === '巨犬') { u.n = '小狗'; u.icon = '🐶'; }
    });
    S.cells = S.cells.filter(c => c.to > R);
    // 勝負
    const a0 = grid(S, 0).length, a1 = grid(S, 1).length;
    if (!a0 || !a1) {
      S.phase = 'over';
      S.winner = !a0 && !a1 ? 'draw' : a0 ? 0 : 1;
      S.endReason = S.winner === 'draw' ? M('end_both_wiped') : M('end_wipe', { player: S.names[1 - S.winner] });
    } else if (R >= MAX_ROUND) {
      const pct = p => {
        const us = S.units.filter(u => !u.sm && u.side === p);
        return us.reduce((n, u) => n + Math.max(0, u.hp), 0) / us.reduce((n, u) => n + u.maxHp, 0);
      };
      const p0 = pct(0), p1 = pct(1);
      S.phase = 'over';
      S.winner = Math.abs(p0 - p1) < 1e-9 ? 'draw' : p0 > p1 ? 0 : 1;
      S.endReason = M('end_time', { round: MAX_ROUND, p0: Math.round(p0 * 100), p1: Math.round(p1 * 100) });
    }
    if (S.phase === 'over') ev(S, { k: 'phase', t: S.winner === 'draw' ? M('result_draw') : M('result_win', { player: S.names[S.winner] }) });
  }

  // 公開 API
  GAME.Engine = {
    DEF, CARD, MAX_ROUND, FATIGUE_FROM, MAX_COST, MAX_UNITS, POOL_SIZE, BASE_AP,
    newGame, validate, apply, clone, cardsOf,
    onCooldown: (S, uid, cardId) => { const u = unit(S, uid); return !!(u && onCooldown(S, u, CARD[cardId])); },
    // 出招階段預覽速度（行動順序條用）：角色速度＋這回合選的招式加速
    // cardId（選用）：改回傳那一張招式實際的出手速度（再加上招式自己的調整：抽球 +0.5、opWindup 時認真一拳 −opWindup）
    speedPreview: (S, uid, cardIds, cardId) => {
      const u = unit(S, uid);
      if (!u) return 0;
      const sp = previewSpeed(S, u, (cardIds || []).map(id => CARD[id]).filter(Boolean));
      return cardId && CARD[cardId] ? sp + cardSpeedAdj(S, CARD[cardId]) : sp;
    },
    // 單張招式實際的出手速度預覽（同 speedPreview 帶 cardId）
    cardSpeed: (S, uid, cardIds, cardId) => (unit(S, uid) && CARD[cardId] ? GAME.Engine.speedPreview(S, uid, cardIds, cardId) : 0),
    validTargets: (S, uid, cardId) => { const u = unit(S, uid); return u ? validTargets(S, u, CARD[cardId]) : []; },
    unit, alive, grid, cardCost, planBudget, reqOk: (S, uid, cardId, actions) => reqOk(S, unit(S, uid), CARD[cardId], actions),
    // 招式不能用的原因（E.REQ_TXT 的 key，例如 'front'、'move'）；可以用時回傳 null
    reqWhy: (S, uid, cardId, actions) => reqWhy(S, unit(S, uid), CARD[cardId], actions),
    // 選用規則開關（S.rules[k] === true 才算開）與「這張招式是否在預判階段結算」（cardOrId：招式物件或 id）
    ruleSet, isPre,
    // 站位統計的空白表（模擬用：所有 trackPos key 都是 0）
    posStats,
    REQ_TXT, hasSt, stActive, slotName, judgeOn,
    MSG, // 中文樣板（翻譯用：js/lang/<語言>.msg.js 用同樣的 key）
  };
})();
