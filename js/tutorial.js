// 新手教學的練習戰：固定的陣容，每回合玩家照教練的提示出招、電腦照劇本出招，所以結果每次都一樣，
// 教練（js/ui.js 的 TUT_P）才能用實際的數字說明發生了什麼。數字由 tests/tutorial.test.js 檢查，改了這裡或平衡數值要一起看。
//   玩家（藍方，下方）：巨人（前場）、朱其小公主（後場）
//   電腦：重裝持盾兵（前場）、市井火槍手（後場）
(function () {
  const PRACTICE = {
    seed: 11,
    units: [
      [{ key: 'giant', slot: 0 }, { key: 'princess', slot: 2 }],
      [{ key: 'm_shield', slot: 0 }, { key: 'm_gun', slot: 2 }],
    ],
    // 每回合的出招：[出招者, 招式, 目標]（用角色代碼；練習戰裡每種角色只有一個）
    rounds: [
      // 第 1 回合：火焰箭射後場的火槍手（遠程打得到後場）、巨拳打前場的持盾兵（近戰只打得到前場）
      { me: [['princess', 'pr_fire', 'm_gun'], ['giant', 'gt_fist', 'm_shield']],
        foe: [['m_shield', 'mn_guard', 'm_shield'], ['m_gun', 'mn_shoot', 'princess']] },
      // 第 2 回合：火焰箭冷卻中 → 瘋魔箭法＋三箭齊發，在火槍手出手前把牠打倒
      { me: [['princess', 'pr_crazy'], ['princess', 'pr_tri', 'm_gun'], ['giant', 'gt_fist', 'm_shield']],
        foe: [['m_shield', 'mn_guard', 'm_shield'], ['m_gun', 'mn_shoot', 'princess']] },
      // 第 3 回合：公主（快）先打掉一部分護盾，巨人（慢）收尾
      { me: [['princess', 'pr_fire', 'm_shield'], ['giant', 'gt_fist', 'm_shield']],
        foe: [['m_shield', 'mn_guard', 'm_shield']] },
    ],
  };

  // 建立練習戰的局面：直接佈好陣，從第 1 回合出招開始（跳過禁用、輪抽）
  function build(E, names) {
    const S = E.newGame(PRACTICE.seed, { names });
    S.phase = 'deploy';
    S.pools = PRACTICE.units.map(list => list.filter(x => !E.DEF[x.key].minion).map(x => x.key));
    E.apply(S, { type: 'deploy', p: 0, units: PRACTICE.units[0] });
    E.apply(S, { type: 'deploy', p: 1, units: PRACTICE.units[1] });
    return S;
  }
  // 第 r 回合（1 起算）p 方的出招 → 引擎的 actions（{ uid, card, target }）；超過劇本的回合是空的
  function plan(E, S, r, p) {
    const round = PRACTICE.rounds[r - 1];
    if (!round) return [];
    const uidOf = key => (S.units.find(u => u.key === key && !u.sm) || {}).uid;
    return (p === 0 ? round.me : round.foe).map(([who, card, target]) => ({ uid: uidOf(who), card, target: target ? uidOf(target) : undefined }));
  }

  GAME.TUTORIAL = { PRACTICE, ROUNDS: PRACTICE.rounds.length, build, plan };
})();
