// 《異陣對決》角色與招式資料
// tgt: self(自身) none(無需目標/全體) enemy(敵方單體) ally(我方單體) allyFront(自身或前排隊友) allyHero(我方英雄) cell(敵方陣地格)
// rng: melee(近戰：需先擊破前場) ranged(遠程：可打任何位置) back(繞背：優先後排)
// pre: 預判/防禦類招式，在所有攻擊之前生效
// buff: 自身強化，同一角色的招式中會最先結算
window.GAME = window.GAME || {};
GAME.DATA = (function () {
  const FACTIONS = {
    '王室': { color: '#e8b84a' },
    '北境': { color: '#5cc0f0' },
    '深淵': { color: '#a56cf2' },
    '聖堂': { color: '#f0dca0' },
    '小兵': { color: '#9aa7b4' },
  };
  const TYPES = { melee: '純近戰', ranged: '遠程/全場', mixed: '混合型', support: '純輔助' };

  const heroes = [
    {
      id: 'swordsman', n: '曜神劍客', f: '王室', cost: 5, hp: 100, spd: 4, type: 'melee', icon: '⚔️',
      passive: { n: '極意', d: '若位於後場且本回合未受傷，下回合速度+2。' },
      cards: [
        { id: 'sw_slash', n: '斬', ap: 1, basic: true, tgt: 'enemy', rng: 'melee', d: '造成15點物理傷害。' },
        { id: 'sw_dash', n: '閃身', ap: 1, spd: 15, pre: true, tgt: 'self', d: '本回合速度+15。閃避比自己慢的敵人的第一次攻擊。若在後排，先衝到同一列的前排。' },
        { id: 'sw_sun', n: '斬日', ap: 2, tgt: 'enemy', rng: 'melee', d: '造成25點傷害，獲得「曜印」。' },
        { id: 'sw_final', n: '終焉・斬日', ap: 3, tgt: 'enemy', rng: 'melee', req: 'sunmark', d: '需要曜印。造成100點絕對傷害（無視護盾與防禦），用後曜印消失。' },
      ],
    },
    {
      id: 'princess', n: '朱其小公主', f: '王室', cost: 5, hp: 90, spd: 5, type: 'ranged', icon: '🏹',
      passive: { n: '驕傲', d: '無視前排阻擋，攻擊可自由指定前後場。' },
      cards: [
        { id: 'pr_fire', n: '火焰箭', ap: 1, tgt: 'enemy', rng: 'ranged', d: '造成8點傷害，附加【灼傷】(每回合末扣6血，持續2回合)。' },
        { id: 'pr_tri', n: '三箭齊發', ap: 1, basic: true, tgt: 'enemy', rng: 'ranged', d: '射3箭，每箭5點傷害。' },
        { id: 'pr_crazy', n: '瘋魔箭法', ap: 1, spd: 5, buff: true, tgt: 'self', d: '本回合速度+5，本回合每招傷害+10。下回合自身受到傷害+20%（易傷）。可與其他箭術同回合使用。' },
        { id: 'pr_blast', n: '魔箭大爆裂', ap: 3, tgt: 'none', aoe: true, d: '對敵方全體造成25點傷害，並強制附加【灼傷】。' },
      ],
    },
    {
      id: 'icequeen', n: '冰雪女王', f: '王室', cost: 5, hp: 100, spd: 4, type: 'mixed', icon: '❄️',
      passive: { n: '絕對零度', d: '對【冰凍】、【緩速】或有【寒意】的敵人傷害+20%。' },
      cards: [
        { id: 'iq_palm', n: '飄雪掌', ap: 1, tgt: 'enemy', rng: 'ranged', d: '造成18點傷害。目標獲得1層【寒意】(每層速度-1，3層轉為【冰凍】)。' },
        { id: 'iq_spike', n: '寒冰刺', ap: 1, basic: true, tgt: 'enemy', rng: 'melee', d: '造成20點傷害。只能指定前場目標。' },
        { id: 'iq_blizzard', n: '暴雪大陣', ap: 3, tgt: 'none', aoe: true, d: '對敵方全體造成20點傷害，並在敵陣放置【雪陣】（敵方下回合每張招式耗AP+1）。' },
      ],
    },
    {
      id: 'wuxing', n: '五行大師', f: '王室', cost: 3, hp: 110, spd: 3, type: 'mixed', icon: '☯️',
      passive: { n: '五行相生', d: '上回合使用過某屬性招式後，本回合使用「不同屬性」的招式數值+30%。' },
      cards: [
        { id: 'wx_metal', n: '金盾', ap: 1, pre: true, tgt: 'self', group: 'a', elem: '金', d: '【金】獲得15點護盾。（與土療二選一）' },
        { id: 'wx_earth', n: '土療', ap: 1, tgt: 'self', group: 'a', elem: '土', d: '【土】恢復自身15點生命。（與金盾二選一）' },
        { id: 'wx_wood', n: '木藤', ap: 1, tgt: 'enemy', rng: 'ranged', group: 'b', elem: '木', d: '【木】造成5點傷害，敵方下回合AP-1。（與水游二選一）' },
        { id: 'wx_water', n: '水游', ap: 1, pre: true, tgt: 'self', group: 'b', elem: '水', d: '【水】閃避下一次受到的傷害。（與木藤二選一）' },
        { id: 'wx_fire', n: '火劈', ap: 2, basic: true, tgt: 'enemy', rng: 'melee', elem: '火', d: '【火】造成16點火焰爆發傷害。' },
      ],
    },
    {
      id: 'hawk', n: '皇室鷹', f: '王室', cost: 3, hp: 85, spd: 6, type: 'ranged', icon: '🦅',
      passive: { n: '制空權', d: '無視前排阻擋，免疫地面陷阱（殺陣、火焰）。' },
      cards: [
        { id: 'hk_claw', n: '鷹爪', ap: 1, basic: true, tgt: 'enemy', rng: 'ranged', group: 'a', d: '造成18點傷害。（與焰羽二選一）' },
        { id: 'hk_flame', n: '焰羽', ap: 2, tgt: 'enemy', rng: 'ranged', group: 'a', d: '花2AP的鷹爪：造成15點傷害並附加【灼傷】。' },
        { id: 'hk_dash', n: '雙翼衝刺', ap: 1, spd: 8, buff: true, tgt: 'self', d: '本回合速度+8。若比所有敵人先出手，本回合傷害+10。' },
        { id: 'hk_elite', n: '菁英飛羽', ap: 2, tgt: 'enemy', rng: 'ranged', d: '造成30點真實傷害（無視護盾與防禦）。' },
      ],
    },
    {
      id: 'giant', n: '巨人', f: '北境', cost: 5, hp: 140, spd: 1, type: 'melee', icon: '🏔️',
      passive: { n: '厚重', d: '免疫位移（拉扯/擊退）。速度永遠判定為最後出手。' },
      cards: [
        { id: 'gt_fist', n: '巨拳', ap: 1, basic: true, tgt: 'enemy', rng: 'melee', d: '造成30點沉重物理傷害。' },
        { id: 'gt_taunt', n: '嘲吸', ap: 2, pre: true, tgt: 'self', d: '絕對防禦：本回合敵方的單體攻擊全部強制轉移到自身，且傷害減半。' },
        { id: 'gt_palm', n: '山掌', ap: 2, tgt: 'enemy', rng: 'melee', lock: true, d: '造成30點傷害並【擊退】（推入後場，若撞到後場單位，兩者各受10傷）。【鎖定】盯上的英雄跑到哪就打到哪（嘲吸、小狗仍優先）。' },
      ],
    },
    {
      id: 'icecap', n: '艾冰團長', f: '北境', cost: 3, hp: 110, spd: 3, type: 'melee', icon: '🧊',
      passive: { n: '穩健', d: '每回合開始時，若位於前場，獲得5點護盾。' },
      cards: [
        { id: 'ic_aura', n: '冰之環繞', ap: 1, pre: true, tgt: 'self', d: '持續2回合。近戰攻擊你的敵人受到5點反傷並【緩速】。' },
        { id: 'ic_chop', n: '劈砍', ap: 1, basic: true, tgt: 'enemy', rng: 'melee', d: '造成10點傷害。若目標【緩速/冰凍/寒意】，傷害變為20。' },
        { id: 'ic_freeze', n: '冰凍', ap: 2, tgt: 'enemy', rng: 'melee', d: '造成10點傷害，目標【冰凍】（打斷本回合未出的招，對方下回合AP-1）。' },
      ],
    },
    {
      id: 'golem', n: '移動石像', f: '北境', cost: 3, hp: 120, spd: 1, type: 'melee', icon: '🗿',
      passive: { n: '石化裝甲', d: '每損失20%生命，固定減傷+2點。' },
      cards: [
        { id: 'gm_slash', n: '重斬', ap: 1, basic: true, tgt: 'enemy', rng: 'melee', d: '造成22點物理傷害，不會被反擊。' },
        { id: 'gm_wake', n: '共鳴甦醒', ap: 2, first: true, tgt: 'self', d: '召喚一尊小石像(20HP)。每尊小石像使自身受傷-10%。' },
        { id: 'gm_will', n: '石之意志', ap: 2, tgt: 'enemy', rng: 'ranged', req: 'statue', d: '所有小石像衝撞目標，每尊造成12點傷害，然後崩碎。' },
      ],
    },
    {
      id: 'monk', n: '破岩武僧', f: '北境', cost: 3, hp: 110, spd: 3, type: 'melee', icon: '🥋',
      passive: { n: '越戰越勇', d: '每張招式成功造成傷害，自身永久獲得2點防禦（上限6；多段攻擊只算一次）。' },
      cards: [
        { id: 'mk_iron', n: '鐵拳', ap: 1, basic: true, tgt: 'enemy', rng: 'melee', d: '造成10點傷害，本回合防禦+5。' },
        { id: 'mk_ten', n: '十連拳', ap: 2, tgt: 'enemy', rng: 'melee', d: '造成10次3點傷害（共30，容易被防禦剋制）。' },
        { id: 'mk_big', n: '大力暴拳', ap: 3, tgt: 'enemy', rng: 'melee', d: '造成40點爆發傷害，無視護盾。' },
      ],
    },
    {
      id: 'smith', n: '造器者', f: '北境', cost: 3, hp: 100, spd: 2, type: 'melee', icon: '🔨',
      passive: { n: '爐火純青', d: '回合末若本回合未受傷，隨機給一名隊友8點護盾（保留到下回合結束）。' },
      cards: [
        { id: 'sm_forge', n: '打鐵', ap: 1, basic: true, tgt: 'enemy', rng: 'melee', d: '造成16點傷害。自身獲得【加持】（下次傷害+5）。' },
        { id: 'sm_guard', n: '打斷', ap: 1, pre: true, tgt: 'ally', d: '為指定隊友打上一面20點的護盾。' },
        { id: 'sm_99', n: '九九鍛', ap: 2, tgt: 'enemy', rng: 'melee', d: '造成15點傷害。全隊武器附魔（下回合全隊每招傷害+10）。' },
      ],
    },
    {
      id: 'fish', n: '鹹魚', f: '深淵', cost: 5, hp: 170, spd: 2, type: 'ranged', icon: '🐟',
      passive: { n: '謎團', d: '身上每有1個負面狀態，自身受到傷害-10%（最多-40%）。' },
      cards: [
        { id: 'fs_mock', n: '鹹魚的嘲笑', ap: 1, pre: true, tgt: 'enemy', rng: 'ranged', d: '預判。目標本回合身上的增益全部轉為【詛咒】（每層受傷+10%）。' },
        { id: 'fs_selfish', n: '自私自利', ap: 1, tgt: 'none', d: '將場上所有單位的負面狀態全部吸到自己身上。' },
        { id: 'fs_iam', n: '我乃鹹魚', ap: 3, tgt: 'none', aoe: true, d: '自身每有1個負面狀態（至少算1個），對敵方全體造成25點真實傷害。之後清空自身負面狀態。' },
      ],
    },
    {
      id: 'eater', n: '煩人的吞食者', f: '深淵', cost: 5, hp: 150, spd: 2, type: 'melee', icon: '😋',
      passive: { n: '無底洞', d: '無法被治療回血，只能靠自身機制回血。' },
      cards: [
        { id: 'et_bite', n: '大口咬', ap: 1, basic: true, tgt: 'enemy', rng: 'melee', d: '造成14點傷害。' },
        { id: 'et_hungry', n: '我餓了', ap: 1, buff: true, tgt: 'none', d: '我方（任一角色）下一次發動的攻擊招式，傷害x2。' },
        { id: 'et_annoy', n: '煩死你', ap: 1, pre: true, tgt: 'enemy', rng: 'ranged', d: '預判。指定一名敵方角色，該角色本回合施放的攻擊傷害x5。搭配【食物我最愛】把這一擊吃掉回血！' },
        { id: 'et_food', n: '食物我最愛', ap: 1, pre: true, tgt: 'self', d: '本回合首次受到的傷害無效，並恢復該傷害2倍的生命。' },
      ],
    },
    {
      id: 'vampire', n: '吸血鬼', f: '深淵', cost: 3, hp: 90, spd: 4, type: 'melee', icon: '🧛',
      passive: { n: '夜之眷屬', d: '回合末，場上每1隻我方蝙蝠為自身恢復1點生命。' },
      cards: [
        { id: 'vp_bite', n: '嗜血撕咬', ap: 1, basic: true, tgt: 'enemy', rng: 'melee', d: '造成20點傷害，並恢復自身5點生命。' },
        { id: 'vp_bat', n: '血化蝙蝠', ap: 1, tgt: 'self', d: '扣自身10血，召喚2隻蝙蝠(6HP，回合末自動攻擊造成4傷)。' },
        { id: 'vp_burst', n: '空血爆發', ap: 2, tgt: 'self', d: '扣自身40血，召喚5隻蝙蝠。' },
      ],
    },
    {
      id: 'judge', n: '審判官', f: '深淵', cost: 3, hp: 90, spd: 3, type: 'ranged', icon: '⚖️',
      passive: { n: '法庭', d: '只要審判官在場，所有單位的暴擊與加速效果無效。' },
      cards: [
        { id: 'jd_equal', n: '規則・均貧', ap: 1, pre: true, tgt: 'none', d: '預判。本回合所有超過15的單次傷害，全部壓縮成5。（敵我皆適用）' },
        { id: 'jd_torture', n: '慢性折磨', ap: 1, tgt: 'enemy', rng: 'ranged', d: '目標獲得1層【疲勞】(回合末每層扣5血，持續3回合)。若目標本回合沒有出招，疊2層。' },
        { id: 'jd_ban', n: '禁令・沒收', ap: 2, pre: true, tgt: 'none', d: '預判。取消敵方本回合AP最高的一張招式，不退還AP。' },
      ],
    },
    {
      id: 'ghost', n: '影鬼', f: '深淵', cost: 3, hp: 85, spd: 5, type: 'ranged', icon: '👻',
      passive: { n: '虛無', d: '若本回合沒有使用任何耗AP招式，強制閃避本回合第一次攻擊。' },
      cards: [
        { id: 'gh_stealth', n: '隱身', ap: 1, pre: true, tgt: 'self', d: '本回合無法被選為目標，並閃避一次實體攻擊（含範圍攻擊）。' },
        { id: 'gh_soul', n: '驚魂下靈', ap: 1, basic: true, tgt: 'enemy', rng: 'ranged', d: '造成10點靈魂傷害（真實傷害，無視護盾與防禦）。' },
        { id: 'gh_orb', n: '命球', ap: 2, tgt: 'enemy', rng: 'ranged', d: '造成22點爆炸傷害。' },
      ],
    },
    {
      id: 'inkmage', n: '墨影咒術師', f: '深淵', cost: 3, hp: 90, spd: 4, type: 'ranged', icon: '🖋️',
      passive: { n: '陣法大師', d: '自身放置的陣法無法被破壞，會一直留在原地直到觸發。' },
      cards: [
        { id: 'ink_fist', n: '黑法長拳', ap: 1, basic: true, first: true, tgt: 'enemy', rng: 'ranged', d: '造成20點傷害。自身獲得1層【墨印】。' },
        { id: 'ink_trap', n: '黑法殺陣', ap: 1, tgt: 'cell', req: 'ink', d: '消耗1墨印。在敵方一格放陷阱，敵人在回合末停留或被位移到此格時受25傷。' },
        { id: 'ink_jail', n: '黑髮牢', ap: 2, tgt: 'cell', req: 'ink', d: '消耗1墨印。鎖定敵方一格，格內敵人戴上【黑髮牢】：自己每回合最多出1AP（本回合還沒出、超過1AP的招失效），直到他出一次攻擊，最多到下回合結束。' },
      ],
    },
    {
      id: 'dogger', n: '愛狗的召喚師', f: '深淵', cost: 3, hp: 80, spd: 3, type: 'support', icon: '🐕',
      passive: { n: '忠犬', d: '開場帶一隻小狗(45HP，回合末攻擊12傷)。敵人的單體招式會優先鎖定小狗。' },
      cards: [
        { id: 'dg_shield', n: '不能傷害狗狗', ap: 1, pre: true, tgt: 'none', req: 'dog', d: '為小狗施加25點護盾。' },
        { id: 'dg_tears', n: '淚汪汪', ap: 1, tgt: 'enemy', rng: 'ranged', d: '目標獲得【不忍心】，下次造成的傷害-50%。' },
        { id: 'dg_mine', n: '這是我的！', ap: 2, tgt: 'none', req: 'dog', d: '小狗變成巨犬（持續2回合），回合末攻擊變為25傷並附加【撕裂】。' },
      ],
    },
    {
      id: 'assassin', n: '影子刺客', f: '深淵', cost: 3, hp: 75, spd: 6, type: 'ranged', icon: '🗡️',
      passive: { n: '繞背', d: '攻擊永遠無視前排與小狗，直接打擊後排目標（後排沒人才打前排）。' },
      cards: [
        { id: 'as_stab', n: '刺', ap: 1, basic: true, tgt: 'enemy', rng: 'back', d: '造成20點傷害。若目標沒有護盾，觸發暴擊造成35傷。' },
        { id: 'as_hide', n: '影藏', ap: 1, pre: true, tgt: 'self', d: '潛入影子，本回合無法被選為目標（範圍攻擊仍會命中）。' },
        { id: 'as_clone', n: '影傀', ap: 2, tgt: 'self', d: '召喚影子分身，為自身完全擋下一次致命攻擊（直到觸發）。' },
      ],
    },
    {
      id: 'onepunch', n: '一拳就贏', f: '聖堂', cost: 5, hp: 65, spd: 5, type: 'melee', icon: '👊',
      passive: { n: '突破極限', d: '沒有防禦招。生命低於30%時，速度強制升至10。' },
      cards: [
        { id: 'op_train', n: '日常鍛鍊', ap: 1, tgt: 'self', d: '恢復自身10點生命，並移除所有負面狀態。' },
        { id: 'op_punch', n: '普通一拳', ap: 1, basic: true, tgt: 'enemy', rng: 'melee', d: '造成20點物理傷害，無視護盾。' },
        { id: 'op_serious', n: '認真一拳', ap: 3, tgt: 'enemy', rng: 'melee', d: '蓄力：這招的速度-2。造成150點絕對傷害。若目標本回合使用了閃避/無敵類招式，此擊落空。' },
      ],
    },
    {
      id: 'pirate', n: '海盜之王', f: '聖堂', cost: 5, hp: 120, spd: 3, type: 'ranged', icon: '🏴‍☠️',
      passive: { n: '海洋霸主', d: '場上存在我方幽靈船時，自身免疫所有負面狀態。' },
      cards: [
        { id: 'pk_hook', n: '無情勾爪', ap: 1, basic: true, tgt: 'enemy', rng: 'ranged', d: '造成18點傷害，附加【拉扯】（將後場目標拉到前場）。' },
        { id: 'pk_crew', n: '海盜出擊', ap: 1, tgt: 'self', d: '召喚2名幽靈海盜(20HP，回合末對敵方前場造成8傷)。' },
        { id: 'pk_ship', n: '召喚幽靈船', ap: 3, tgt: 'self', req: 'noship', d: '在後場召喚幽靈船(50HP)。回合末使敵方全體下回合受傷+10%。' },
      ],
    },
    {
      id: 'michelin', n: '米其林', f: '聖堂', cost: 3, hp: 130, spd: 2, type: 'ranged', icon: '🍽️',
      passive: { n: '輪胎裝甲', d: '常駐受到傷害-10%。' },
      cards: [
        { id: 'mc_review', n: '點評', ap: 1, buff: true, tgt: 'self', d: '隨機獲得1~3星：下回合傷害+20%/+60%/+100%。3星另獲10點護盾（保留到下回合）。' },
        { id: 'mc_wheel', n: '車輪飛擊', ap: 2, basic: true, tgt: 'enemy', rng: 'ranged', d: '丟出1~5個車輪：必定有1個，之後每多1個的機率各45%。第N個造成4x(2^N-1)傷害：4、12、28、60、124。' },
        { id: 'mc_boom', n: '輪爆', ap: 3, tgt: 'none', aoe: true, req: 'tire', d: '對敵方全體造成35點貫穿傷害（無視護盾）。用後永久失去【輪胎裝甲】，輪胎爆掉後就不能再用（每局一次）。' },
      ],
    },
    {
      id: 'pingpong', n: '桌球玩家', f: '聖堂', cost: 3, hp: 90, spd: 4, type: 'ranged', icon: '🏓',
      passive: { n: '大力出奇蹟', d: '每次攻擊有25%機率觸發傷害翻倍。' },
      cards: [
        { id: 'pp_cut', n: '切球', ap: 1, pre: true, tgt: 'self', d: '獲得30點臨時護盾。若成功擋下攻擊，下回合100%暴擊。' },
        { id: 'pp_drive', n: '抽球', ap: 1, basic: true, tgt: 'enemy', rng: 'ranged', d: '造成14點傷害。若與對手同速，此招優先結算。' },
        { id: 'pp_smash', n: '殺球', ap: 2, tgt: 'enemy', rng: 'ranged', d: '造成25點傷害。' },
      ],
    },
    {
      id: 'saint', n: '聖女·愛爾琳', f: '聖堂', cost: 3, hp: 80, spd: 3, type: 'ranged', icon: '😇',
      passive: { n: '聖潔', d: '對不死生物（幽靈海盜、幽靈船、蝙蝠、小石像）傷害翻倍。' },
      cards: [
        { id: 'st_shield', n: '聖光護盾', ap: 1, pre: true, tgt: 'ally', d: '為一名隊友附加20點護盾。' },
        { id: 'st_chant', n: '吟唱', ap: 2, tgt: 'none', d: '為全隊恢復12點生命，並獲得10%減傷（2回合）。' },
        { id: 'st_light', n: '聖光', ap: 3, tgt: 'none', aoe: true, group: 'a', d: '對敵方全體造成15點傷害，並使其中1名敵方角色【眩暈】（打斷未出的招，對方下回合AP-1）。（與聖槍二選一）' },
        { id: 'st_spear', n: '聖槍', ap: 2, basic: true, tgt: 'enemy', rng: 'ranged', group: 'a', d: '造成32點單體傷害。（與聖光二選一）' },
      ],
    },
    {
      id: 'dragon', n: '小龍', f: '聖堂', cost: 3, hp: 90, spd: 4, type: 'mixed', icon: '🐉',
      passive: { n: '龍鱗', d: '免疫【灼傷】。' },
      cards: [
        { id: 'dr_fly', n: '飛行', ap: 1, pre: true, tgt: 'self', d: '飛在空中，本回合免疫所有近戰攻擊。' },
        { id: 'dr_ram', n: '頭衝', ap: 2, basic: true, tgt: 'enemy', rng: 'melee', d: '造成30點傷害。若本回合處於飛行狀態，額外造成15傷。' },
        { id: 'dr_breath', n: '龍息', ap: 2, tgt: 'enemy', rng: 'ranged', d: '造成25點傷害，並在目標格留下火焰2回合（回合末在格內或被位移進來的單位受10傷）。' },
      ],
    },
  ];

  const minions = [
    {
      id: 'm_shield', n: '重裝持盾兵', f: '小兵', cost: 1, hp: 40, spd: 1, type: 'support', icon: '🛡️', minion: true,
      cards: [{ id: 'mn_guard', n: '死守', ap: 1, basic: true, pre: true, tgt: 'allyFront', d: '為自身或前排隊友附加15點護盾。' }],
    },
    {
      id: 'm_star', n: '宮廷觀星者', f: '小兵', cost: 1, hp: 25, spd: 2, type: 'support', icon: '🔭', minion: true,
      cards: [{ id: 'mn_star', n: '星位指引', ap: 2, basic: true, tgt: 'allyHero', d: '使我方指定英雄下回合速度+3。' }],
    },
    {
      id: 'm_gun', n: '市井火槍手', f: '小兵', cost: 1, hp: 30, spd: 3, type: 'ranged', icon: '🎯', minion: true,
      cards: [{ id: 'mn_shoot', n: '精準射擊', ap: 2, basic: true, tgt: 'enemy', rng: 'ranged', d: '造成15點無視護盾的真實傷害。' }],
    },
    {
      id: 'm_cult', n: '深淵獻祭者', f: '小兵', cost: 1, hp: 35, spd: 2, type: 'support', icon: '🕯️', minion: true,
      cards: [{ id: 'mn_sac', n: '黑暗轉移', ap: 0, basic: true, pre: true, tgt: 'self', d: '扣自身20血，本回合我方AP+1（可突破3AP上限）。' }],
    },
  ];

  const summons = {
    bat: { n: '蝙蝠', hp: 6, icon: '🦇', row: 'front', undead: true },
    gpirate: { n: '幽靈海盜', hp: 20, icon: '☠️', row: 'front', undead: true },
    ship: { n: '幽靈船', hp: 50, icon: '⛵', row: 'back', undead: true },
    statue: { n: '小石像', hp: 20, icon: '🪨', row: 'front', undead: true },
    dog: { n: '小狗', hp: 45, icon: '🐶', row: 'front' },
  };

  const statuses = {
    burn: { n: '灼傷', k: 'debuff', i: '🔥', d: '回合末受到6點真實傷害。' },
    chill: { n: '寒意', k: 'debuff', i: '❄️', d: '每層速度-1，疊到3層變成冰凍。' },
    frozen: { n: '冰凍', k: 'debuff', i: '🧊', d: '被冰凍：本回合未出的招失效，下回合AP-1。' },
    stun: { n: '眩暈', k: 'debuff', i: '💫', d: '被眩暈：本回合未出的招失效，下回合AP-1。' },
    slow: { n: '緩速', k: 'debuff', i: '🐌', d: '速度-2。' },
    vuln: { n: '易傷', k: 'debuff', i: '💔', d: '受到的傷害增加。' },
    curse: { n: '詛咒', k: 'debuff', i: '🌀', d: '每層受到的傷害+10%。' },
    fatigue: { n: '疲勞', k: 'debuff', i: '😩', d: '回合末每層扣5血。' },
    pity: { n: '不忍心', k: 'debuff', i: '🥺', d: '下次造成的傷害-50%。' },
    bleed: { n: '撕裂', k: 'debuff', i: '🩸', d: '回合末扣5血。' },
    jail: { n: '黑髮牢', k: 'debuff', i: '⛓️', d: '自己每回合最多出1AP；出一次攻擊就解開，最多到下回合結束。' },
    empower: { n: '加持', k: 'buff', i: '✨', d: '下次傷害+5。' },
    enchant: { n: '附魔', k: 'buff', i: '⚒️', d: '本回合每招傷害+10。' },
    hungry: { n: '我餓了', k: 'buff', i: '🍖', d: '我方下一次攻擊招式傷害x2。' },
    review: { n: '點評', k: 'buff', i: '⭐', d: '本回合傷害提升。' },
    star: { n: '星位', k: 'buff', i: '🌟', d: '速度+3。' },
    focus: { n: '極意', k: 'buff', i: '🌙', d: '速度+2。' },
    iceAura: { n: '冰之環繞', k: 'buff', i: '💠', d: '近戰攻擊者受5反傷並緩速。' },
    waterDodge: { n: '水游', k: 'buff', i: '💧', d: '閃避下一次傷害。' },
    clone: { n: '影傀', k: 'buff', i: '👤', d: '擋下一次致命攻擊。' },
    reduce: { n: '聖佑', k: 'buff', i: '🙏', d: '受到傷害-10%。' },
    critNext: { n: '必殺', k: 'buff', i: '💥', d: '本回合攻擊必定暴擊。' },
    dodge1: { n: '閃身', k: 'buff', i: '💨', d: '閃避比自己慢的敵人的第一次攻擊。' },
    stealth: { n: '隱身', k: 'buff', i: '🌫️', d: '無法被選為目標，閃避一次實體攻擊。' },
    hidden: { n: '影藏', k: 'buff', i: '🕶️', d: '無法被選為目標。' },
    flying: { n: '飛行', k: 'buff', i: '🕊️', d: '免疫近戰攻擊。' },
    taunt: { n: '嘲吸', k: 'buff', i: '🛡️', d: '吸引敵方單體攻擊，傷害減半。' },
    food: { n: '食物我最愛', k: 'buff', i: '🍗', d: '首次受到的傷害無效並回血2倍。' },
    cut: { n: '切球', k: 'buff', i: '🏓', d: '護盾擋下攻擊時，下回合必定暴擊。' },
    ironfist: { n: '鐵拳', k: 'buff', i: '✊', d: '本回合防禦+5。' },
    crazy: { n: '瘋魔', k: 'buff', i: '😤', d: '本回合每招傷害+10。' },
    wing: { n: '先手', k: 'buff', i: '🪶', d: '本回合每招傷害+10。' },
    annoy: { n: '煩死你', k: 'buff', i: '🤬', d: '本回合攻擊傷害x5。' },
    guard: { n: '防禦', k: 'buff', i: '🔰', d: '本回合受到的傷害減半（真實傷害除外）。' },
    bigdog: { n: '巨犬', k: 'buff', i: '🐺', d: '回合末攻擊25傷並撕裂。' },
  };

  // 每個角色都能用的基本動作（和其他招式一樣不能連續兩回合使用）
  const actions = [
    { id: 'x_guard', n: '防禦', ap: 1, pre: true, tgt: 'self', act: true, d: '本回合受到的傷害減半（真實傷害除外）。' },
    { id: 'x_move', n: '換位', ap: 1, pre: true, tgt: 'self', act: true, req: 'move', d: '和同一列的隊友（或空格）交換前後位置，照自己的速度結算：比出手的人快才換得開。巨人不能換位也不會被換走；被冰凍、眩暈時不能換位。' },
  ];

  return { FACTIONS, TYPES, heroes, minions, summons, statuses, actions };
})();
