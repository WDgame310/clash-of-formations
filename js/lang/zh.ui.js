// 介面文字：中文（原文）。其他語言請照同樣的 key 翻譯（en.ui.js、fr.ui.js）。
// {name} 是會被代入的變數，請保留；字串裡的 HTML 標籤也請保留。
GAME.I18N.add('zh', {
  ui: {
    // ---------- 共用 ----------
    doc_title: '異陣對決',
    close: '關閉',
    cancel: '取消',
    ok: '確定',
    back: '返回',
    sep_dot: '・', // 項目之間的分隔
    sep_list: '、', // 清單（多個名字）之間的分隔
    p1: '玩家1', // 預設玩家名稱
    p2: '玩家2',
    ai_name: '電腦',
    host_name: '房主',
    guest_name: '挑戰者',
    art_missing: '尚未匯入立繪',
    art_failed: '立繪載入失敗',
    btn_codex: '📚 角色圖鑑',
    btn_rules: '📖 規則說明',
    btn_log: '📜 戰鬥紀錄',
    btn_home: '🏠 回主選單',
    sound_on: '🔊 音效：開',
    sound_off: '🔇 音效：關',
    // 安裝成 App（首頁按鈕列下方）與新版本通知
    pwa_install: '📲 安裝成 App',
    pwa_ios_hint: '📲 在 Safari 按「分享」→「加入主畫面」就能安裝',
    pwa_inapp_hint: '📲 要安裝成 App，請先從右上角或右下角的選單選「用瀏覽器開啟」（iPhone 用 Safari、Android 用 Chrome），再照那裡的提示安裝',
    pwa_updated: '已更新到最新版本，下次開啟時套用',
    // 階段名稱
    phase_ban: '禁用階段',
    phase_draft: '輪抽選角',
    phase_deploy: '盲區佈陣',
    phase_plan: '暗付出招',
    phase_over: '對戰結束',
    // 招式目標
    tgt_enemy: '敵方單體',
    tgt_ally: '我方單體',
    tgt_allyFront: '自身或前排',
    tgt_allyHero: '我方英雄',
    tgt_cell: '敵方格子',
    tgt_self: '自身',
    // 攻擊距離
    rng_melee: '近戰',
    rng_ranged: '遠程',
    rng_back: '繞背',
    // 招式卡標籤
    tag_basic: '基本',
    tag_pre: '預判',
    tag_spd: '速+{n}',
    tag_aoe: '全體',
    // 站位規則（近戰打格子開啟時）：遠程、繞背與【鎖定】招式追著英雄打（繞背仍只打得到後場）
    tag_lock: '鎖定',
    tag_lock_title: '追著英雄打：目標換位也跟著打',
    // 繞背招式的「鎖定」說明：仍只打得到後場
    tag_lock_title_back: '追著英雄打，但只打得到後場：他換到前場（後場還有人）就改打後場其他人',
    passive: '被動【{n}】{d}',
    row_front: '前場',
    row_back: '後場',
    summon: '召喚物',
    undead: '不死生物',

    // ---------- 首頁 ----------
    home_sub: '實體對戰規則・數位版',
    home_logo: '<span>異</span><span>陣</span><span>對</span><span>決</span>', // 標題，每個 <span> 會依序跳出
    home_logo_en: 'CLASH · OF · FORMATIONS',
    home_p1_name: '玩家1 名字',
    home_p2_name: '玩家2 名字',
    mode_hotseat: '同裝置雙人',
    mode_ai: '對戰電腦',
    home_resume: '▶ 繼續上一局（{info}）',
    home_resume_round: '第{n}回合',
    home_resume_online: '▶ 回到連線房間 {code}',
    mode_hotseat_b: '一台裝置・雙人',
    mode_hotseat_s: '輪流操作，秘密階段會提示交換裝置',
    mode_ai_b: '一台裝置・對戰電腦',
    mode_ai_s: '一個人也能練習',
    mode_online_b: '兩台裝置・連線',
    mode_online_s: '同一個 Wi-Fi 下的手機／平板／電腦',

    // ---------- 規則說明 ----------
    rules_title: '規則說明',
    rules_body: `<h2>勝利條件</h2>
      <p>把對手場上的所有角色生命值歸零就獲勝。遊戲最多 15 回合；第 10 回合起進入「死鬥疲勞」，每回合末所有單位受 5 點真實傷害。第 15 回合結束時，剩餘總血量百分比高的一方獲勝。</p>
      <h2>一、禁用與輪抽</h2>
      <p>隨機決定先手。先手禁用 1 名英雄，後手再禁用 1 名（公開）。接著依 <b>1-2-2-2-2-1</b> 的順序選角：先手選 1 名 → 後手連選 2 名 → 先手連選 2 名 → 後手連選 2 名 → 先手連選 2 名 → 後手選最後 1 名，雙方各 5 名。小兵不用選，隨時可以上陣。</p>
      <h2>二、盲區佈陣</h2>
      <p>從自己的 5 名英雄與小兵中，秘密放到 2x2 陣地（前場 2 格、後場 2 格）。Cost 總和不超過 10，最多 4 個單位。雙方同時揭曉。</p>
      <h2>三、暗付出招</h2>
      <p>每回合有 3 點 AP（用不完不保留）。點選自己的角色、選招式、選目標。一個角色同一回合可以用多張不同的招式（例如「閃身＋斬」），但每張招式每回合只能用一次。雙方都確認後同時揭曉。</p>
      <p><b>速度判定：</b>角色速度＋招式附加速度＝總速度，快的先出手；同速則同時結算（被同速對手打倒也照樣出手）。慢的一方若在出手前被擊倒或被冰凍/眩暈，招式失效且 AP 不退還。</p>
      <p><b>預判・防禦類招式</b>（標示「預判」，例如護盾、閃避、嘲吸、禁令）會在所有攻擊之前生效。</p>
      <h2>讓戰鬥更有策略的規則</h2>
      <ul>
        <li>⏳ <b>不能連續兩回合使用</b>：除了標示「基本」的招式，用過的招式下一回合要休息（被沒收、被打斷沒真的出手的不算）。對手的 ⏳ 也看得到，可以預測他這回合不能出什麼。</li>
        <li>🔰 <b>防禦</b>（每個角色都有，1 AP，預判）：本回合受到的傷害減半（真實傷害除外）。</li>
        <li>🔄 <b>換位</b>（每個角色都有，1 AP）：和同一列交換前後位置，可以躲開近戰、把輸出藏到後排。一般規則下換位是預判，在所有攻擊之前生效；開啟下方的「站位規則（數位版）」時，改照速度順序生效。巨人不能換位也不會被換走；被冰凍、眩暈時不能換位。</li>
        <li>💰 <b>儲存 AP</b>：沒用完的 AP 最多 1 點留到下回合（最多 4 AP），可以存起來讓 3AP 大招＋1AP 招式同回合出。</li>
        <li>📊 <b>出手順序</b>：出招畫面中間會顯示預測的出手順序，選了加速招會即時更新。</li>
      </ul>
      <h2>攻擊距離</h2>
      <p><b>近戰</b>只能打敵方前場；敵方前場角色全倒之後才能打後場。<b>遠程</b>可以打任何位置。<b>繞背</b>（影子刺客）優先打後場。召喚物不擋路，但可以被攻擊。愛狗的召喚師在場時，敵人的單體招式會被小狗吸引（刺客除外）。</p>
      <h2>站位規則（數位版）</h2>
      <ol>
        <li><b>近戰要站前排</b>：近戰招式出手時自己必須站在前排，否則落空（AP照扣）；後排角色可以同一回合先換位再出近戰。</li>
        <li><b>近戰打格子</b>：目標被自己人換走，換進來的人挨打；沒人換進來，就打前排其他人。</li>
        <li><b>遠程攻擊追著英雄打</b>（絕對鎖定）；巨人的【鎖定】招式也一樣。繞背攻擊只打後排：目標換到前排的話，改打後排其他人。</li>
        <li><b>換位看速度</b>：換位照速度順序生效，要比出手的人快才換得開；同速來不及。</li>
        <li>嘲吸、小狗照舊優先。</li>
      </ol>
      <p>口訣：「拳頭站前排，拳打格子箭追人，比他快才閃得開。」</p>
      <h2>關鍵字</h2>
      <ul>
        <li>🛡 <b>護盾</b>：先扣護盾；回合結束時清空（特別註明的除外）。</li>
        <li>🔥 <b>灼傷</b>：回合末受到 6 點真實傷害，持續 2 回合。</li>
        <li>🧊 <b>冰凍 / 💫 眩暈</b>：本回合還沒出的招全部失效，被控制方下回合 AP-1。</li>
        <li>🐌 <b>緩速</b>：速度 -2。❄️ <b>寒意</b>：每層速度 -1，3 層變冰凍。</li>
        <li><b>拉扯 / 擊退</b>：把目標拉到前場 / 推到後場（與同列的格子交換位置）。</li>
        <li><b>真實傷害 / 絕對傷害</b>：無視護盾、防禦與減傷。<b>貫穿</b>：無視護盾。</li>
        <li>😩 <b>疲勞</b>：回合末每層扣 5 血。🌀 <b>詛咒</b>：每層受傷 +10%。💔 <b>易傷</b>：受傷增加。</li>
      </ul>
      <h2>回合末</h2>
      <p>召喚物自動攻擊 → 灼傷/疲勞/撕裂/陷阱 → 死鬥疲勞 → 被動效果 → 護盾清空。</p>
      <p class="muted">這是依照實體規則書與角色卡製作的數位版。卡片上沒寫清楚的地方（例如「全場」視為敵方全體、冰凍不會讓角色下回合完全不能動，而是 AP-1），都已直接寫進招式說明裡。</p>`,

    // ---------- 連線大廳 ----------
    lobby_title: '兩台裝置・連線對戰',
    lobby_checking: '正在尋找連線伺服器…',
    lobby_noserver_title: '需要先啟動連線伺服器',
    // {mode} = 首頁「兩台裝置・連線」按鈕的文字
    lobby_noserver_steps: `<li>在電腦上打開遊戲資料夾，雙擊 <b>start-server.bat</b>（需要安裝 Python）。</li>
          <li>黑色視窗會顯示網址，例如 <code>http://192.168.1.23:8000/</code>。</li>
          <li>兩台裝置連同一個 Wi-Fi，用瀏覽器打開那個網址。</li>
          <li>再選一次「{mode}」。</li>`,
    lobby_firewall: '如果 Windows 跳出防火牆提示，請按「允許存取」。',
    lobby_public_warn: '這台電腦的 Wi-Fi 是「公用網路」，Windows 防火牆會擋住其他裝置。請到 <b>設定 → 網路和網際網路 → Wi-Fi → 這個網路</b>，把網路設定檔類型改成「私人」；或在 <b>Windows 安全性 → 防火牆與網路保護 → 允許應用程式通過防火牆</b> 勾選 python.exe 的「私人」。',
    lobby_retry: '重新偵測',
    // 網路版（https 網站）沒有連線伺服器時多一行說明
    lobby_hosted_note: '網路版沒有連線伺服器。兩台裝置連線時，請在連同一個 Wi-Fi 的電腦上執行遊戲資料夾裡的 <b>start-server.bat</b>，兩台裝置都打開它顯示的網址（不是這個網站）。一台裝置的模式不受影響，沒有網路也能玩。',
    lobby_your_name: '你的名字',
    lobby_create: '建立房間',
    lobby_create_sub: '取得房間代碼，給另一台裝置輸入',
    lobby_or: '或',
    lobby_code_ph: '代碼',
    lobby_join: '加入房間',
    lobby_open_url: '另一台裝置請打開：',
    lobby_room_code: '房間代碼',
    lobby_host_hint: '請另一台裝置選「{join}」並輸入這個代碼', // {join} = 「加入房間」按鈕
    lobby_joining: '正在加入房間…',
    lobby_other_url: '另一台裝置的網址：',
    lobby_waiting: '已連線，等待對手…',
    lobby_retrying: '連線中斷，重試中…',
    lobby_leave: '離開房間',
    toast_no_room: '房間不存在或已過期',
    toast_send_fail: '送出失敗，請檢查連線',
    toast_create_fail: '建立房間失敗：{err}',
    toast_code4: '請輸入 4 碼房間代碼',
    toast_spectator: '觀戰中無法開新局',

    // ---------- 遊戲上方標題列 ----------
    tb_round: ' · 第 {n}/{max} 回合', // 接在階段名稱後面
    tb_resolve: '第 {n} 回合・結算',
    net_ok: '已連線',
    net_bad: '連線中斷',

    // ---------- 交換裝置畫面 ----------
    cover_ban: '秘密禁用 1 名英雄',
    cover_deploy: '秘密佈陣',
    cover_plan: '第 {n} 回合・秘密出招',
    cover_hand: '請把裝置交給 {p}',
    cover_nopeek: '{p} 請不要偷看喔！',
    cover_start: '我是 {p}，開始',

    // ---------- 禁用／輪抽 ----------
    os_ban_short: '禁', // 順序條上的一個字
    os_ban: '禁用',
    os_pick: '選角',
    os_title: '{act}・{p}',
    os_title_hero: '{act}・{p}：{hero}',
    ban_turn: '輪到 {p} <b class="red">禁用</b> 1 名英雄',
    ban_wait: '等待 {p} 禁用',
    ban_hint: '先手 {first} 先禁，後手 {second} 再禁；被禁用的英雄本局不能選',
    draft_turn: '輪到 {p} 選角',
    draft_multi: '（連選 {n} 名）',
    draft_wait: '等待 {p} 選角',
    draft_progress: '第 {n} / {total} 選・已禁用：{banned}',
    draft_first: '（先手）',
    ht_banned: '禁用',
    draft_footer: '點英雄可以看完整技能。小兵（Cost 1）不用選，佈陣時隨時可用。',
    modal_ban: '🚫 禁用 {hero}',
    modal_pick: '✅ {p} 選擇 {hero}',

    // ---------- 佈陣 ----------
    deploy_done_wait: '已完成佈陣，等待對手',
    deploy_title: '{p} 秘密佈陣',
    deploy_rule: 'Cost 總和 ≤ {cost}，最多 {units} 個單位',
    deploy_enemy_side: '▲ 敵方在這邊 ▲',
    deploy_cost: 'Cost <b>{n}</b>/{max}',
    deploy_units: '單位 <b>{n}</b>/{max}',
    deploy_hint: '點下方角色放上陣地；點已放的格子再點另一格可以換位置。近戰攻擊只能先打前場。',
    deploy_clear: '清空',
    deploy_submit: '確認佈陣',
    opp_pool: '對手備選：',
    toast_max_units: '最多 {n} 個單位',
    toast_cost_over: 'Cost 會超過 {n}',
    // 站位規則（近戰要站前排開啟時）的佈陣限制與提醒；{giant} = 巨人的名字
    toast_giant_front: '{giant}只能放在前排（他不能換位）',
    deploy_warn_giant_back: '近戰角色放在{giant}正後方，{giant}倒下前都換不到前排，無法出手',
    deploy_warn_melee_many: '近戰英雄比前排格子多：多的那位要先換位才能出手',

    // ---------- 戰場 ----------
    dead: '陣亡',
    snow: '❄️雪陣',
    st_next_round: '（下回合）', // 狀態圖示提示：下回合才生效
    st_sunmark: '曜印',
    st_ink: '墨印',
    st_def: '防禦',
    st_cd_title: '冷卻中：{list}',
    fx_miss: '閃避', // 飄字
    bubble_card: '【{card}】', // 出招時頭上的對話框

    // ---------- 出招 ----------
    why_cant: '現在不能用',
    why_used: '已選擇',
    why_group: '同組二選一',
    why_cd: '⏳ 上回合用過，這回合休息',
    why_ap: 'AP 不足',
    why_notgt: '沒有目標',
    tl_cell: '敵方{slot}',
    tl_all: '敵方全體',
    tl_self: '自身',
    ob_last: '最後',
    ob_title: '出手順序（預判招先生效；敵方 ? ＝ 不知道對方的加速招）',
    plan_sending: '送出中',
    plan_ai_thinking: '電腦思考中',
    plan_wait: '已出招，等待對手',
    plan_opp_ready: '對手已出招 ✓',
    plan_tgt_unit: '🎯 點戰場上<b>發光</b>的角色，作為【{card}】的目標',
    plan_tgt_cell: '🎯 點戰場上<b>發光</b>的格子，作為【{card}】的目標',
    // 站位規則：選近戰目標時的提醒（一般近戰打格子；【鎖定】招式追著英雄打）
    plan_square_hint: '近戰打格子：目標換走的話，換進來的人挨打。',
    plan_lock_hint: '【鎖定】追著你選的英雄打：他換位也躲不掉（嘲吸、小狗仍優先）。',
    // 換位看速度：{fast} 我比他快、換得開的敵方近戰；{slow} 來不及的（名字後面 ? ＝ 對方有加速招）
    swap_hint: '🔄 {unit} 速度 {spd}：換得開 → {fast}；來不及 → {slow}',
    // 後排換上前排、前排有隊友 {mate}：比對方快＝搶進那一格替隊友挨打；來不及＝隊友挨打
    swap_hint_in: '🔄 {unit} 速度 {spd}：搶進前排替 {mate} 挨打 → {fast}；來不及，{mate} 挨打 → {slow}',
    // noWhiff、同列沒有隊友：沒人換進這一格，換完他還是合法目標 → 快慢都躲不掉
    swap_hint_stuck: '🔄 {unit} 速度 {spd}：沒人換進這一格，換了照樣挨打 → {slow}',
    // 接在上面幾行後面：【鎖定】招式（巨人）不管換位快慢都打原目標
    swap_hint_lock: '；鎖定，照打原目標 → {list}',
    // 敵方某張招式的出手速度跟角色本身不同（例如認真一拳蓄力）時，名字後面標出那張招式
    swap_foe_card: '{unit}（{card}）',
    // 後排換位再出近戰，敵方有比他快的冰凍／眩暈招
    plan_interrupt: '可能被打斷',
    plan_interrupt_title: '比他快、帶冰凍／眩暈的敵人：{list}',
    // 換位依速度開啟時，補在換位招式說明下面
    swap_speed_note: '🔄 站位規則：換位改照速度順序生效（不是在所有攻擊之前）。',
    plan_basic_actions: '基本動作（每個角色都有）',
    plan_hint: '👆 點選<b>自己的角色</b>來選擇招式。AP 可以集中在一個角色，也可以分給好幾個角色。',
    plan_chip: '{icon} {unit}【{card}】→ {target} <b>{ap}AP</b>',
    ap_frac: '{n}/{max} AP',
    plan_saved: '含上回合存下 1',
    plan_bank: '剩 {n} → 存 1 到下回合',
    plan_snow: '❄️雪陣：每招+1AP',
    plan_clear: '清除',
    plan_submit: '確認出招（{ap} AP）',
    plan_rest: '本回合休息',
    last_log: '📜 上回合戰報',
    toast_pick_glow: '請點選發光的目標',
    confirm_rest: '本回合不出任何招式（休息）？',

    // ---------- 回合播放 ----------
    card_back: '異', // 招式卡背面的字
    reveal_rest: '休息',
    reveal_title: '同時揭曉！',
    pb_reveal_cap: '雙方翻開招式卡…',
    pb_result: '查看結果 ▶',
    pb_next_round: '下一回合 ▶',
    pb_prev: '上一步',
    pb_toggle: '暫停/播放',
    pb_next: '下一步',
    pb_speed: '速度',
    pb_skip: '跳過',
    pb_log_title: '📜 本回合戰報',

    // ---------- 結束 ----------
    over_draw: '🤝 平手',
    over_win: '🏆 {p} 獲勝！',
    over_you_win: '🏆 你贏了！',
    over_you_lose: '💔 你輸了…',
    over_rematch: '再來一局',

    // ---------- 角色詳細資料（彈出視窗） ----------
    st_left_next: '（下回合生效）',
    st_left_n: '（剩 {n} 回合）',
    st_left_now: '（本回合）',
    st_line: '{i} <b>{n}</b>{extra}：{d}<span class="muted">{left}</span>', // {extra} = 層數、百分比
    live_sunmark: '☀️ <b>曜印</b>：可以使用{card}',
    live_ink: '🖋 <b>墨印</b> x{n}',
    live_def: '🪨 <b>防禦</b> {n}：每次受傷減少',
    live_notire: '已失去輪胎裝甲',
    live_cd: '⏳ <b>冷卻中</b>：{list}（上回合用過，這回合不能用）',
    live_none: '沒有狀態',
    // 召喚物說明：{golem} 移動石像、{card} 石之意志、{big} 巨犬、{bleed} 撕裂
    sm_desc_bat: '回合末隨機攻擊一名敵人，造成4傷。',
    sm_desc_gpirate: '回合末攻擊敵方前場，造成8傷。',
    sm_desc_ship: '回合末使敵方全體下回合受傷+10%。',
    sm_desc_statue: '每尊使{golem}受傷-10%，可用{card}衝撞。',
    sm_desc_dog: '回合末攻擊敵方前場12傷（{big}25傷＋{bleed}）。敵方單體招式會優先鎖定牠。',

    // ---------- 遊戲選單 ----------
    menu_surrender: '🏳️ 投降',
    menu_autosave: '（會自動存檔）',
    log_title: '戰鬥紀錄',
    confirm_surrender: '確定要投降嗎？',

    // ---------- 角色圖鑑 ----------
    cx_title: '角色圖鑑',
    cx_placeholder: '搜尋名字、招式或關鍵字（例：冰凍、真實傷害、召喚、坦克）',
    cx_tab_heroes: '🃏 角色',
    cx_tab_kw: '📖 關鍵字',
    cx_all_f: '全部陣營',
    cx_all_t: '全部類型',
    cx_all_c: '全部 Cost',
    cx_cost: 'Cost {n}',
    cx_all_r: '全部定位',
    cx_count: '{n} 個角色・點卡片看技能、克制與連攜',
    cx_count_q: '{n} 個角色符合「{q}」・點卡片看技能、克制與連攜',
    cx_none: '找不到符合的角色',
    cx_no_kw: '找不到符合的關鍵字',
    cx_wr: '實測 {pct}%',
    cx_strong: '✅ 克制（打得過）',
    cx_weak: '⚠️ 被克制（要小心）',
    cx_combos: '🤝 連攜組合',
    cx_how: '打法：{how}',
    // 關鍵字（名稱 kw_<id>、說明 kw_<id>_d）。
    // 近戰／遠程／繞背／預判／全體／基本 的名稱用上面的 rng_、tag_；眩暈用狀態名稱；防禦／換位用基本動作的招式名稱。
    kw_shield: '護盾',
    kw_shield_d: '先扣護盾再扣血；回合結束時清空（特別註明的除外）。',
    kw_true: '真實傷害',
    kw_true_d: '無視護盾、防禦與減傷（絕對傷害相同）。',
    kw_pierce: '貫穿',
    kw_pierce_d: '無視護盾，但防禦與減傷照算。',
    kw_melee_d: '只能打敵方前場；前場全倒才能打後場。',
    kw_ranged_d: '可以打任何位置。',
    kw_back_d: '優先打後排，無視前排與小狗。',
    kw_pre_d: '在所有攻擊之前生效（護盾、閃避、嘲吸、禁令…）。',
    kw_aoe_d: '打到敵方所有單位（含召喚物）。',
    kw_summon: '召喚',
    kw_summon_d: '召喚物不擋路、不算勝負，但可以被攻擊。',
    kw_pull: '拉扯',
    kw_pull_d: '把後場目標拉到前場（與同列交換位置）。',
    kw_knock: '擊退',
    kw_knock_d: '把前場目標推到後場（撞到人時兩者各受傷）。',
    kw_stun_d: '本回合還沒出的招全部失效，被控制方下回合 AP-1。',
    kw_cd: '不能連續兩回合使用',
    kw_cd_d: '除了「基本」招式，用過的招下一回合要休息（隔一回合就可以）。',
    kw_basic_d: '每個角色的基本攻擊，可以每回合使用，不受冷卻限制。',
    kw_guard_d: '每個角色都有：1 AP，本回合受到的傷害減半（真實傷害除外）。',
    kw_swap_d: '每個角色都有：1 AP，和同一列交換前後位置。一般在攻擊前生效；開啟站位規則時照速度順序生效。',
    kw_lock_d: '站位規則：招式追著出招時選的英雄打，不打格子（嘲吸、小狗仍優先；小狗不吸引繞背）。遠程與巨人的【鎖定】招式不管他換到哪都打得到；繞背招式仍只打得到後場，他換到前場（後場還有人）就改打後場其他人。一般近戰則是打格子。',
    kw_lock_m: '【鎖定】',
    kw_bank: '儲存 AP',
    kw_bank_d: '沒用完的 AP 最多 1 點留到下回合（最多 4 AP）。',
    // ---------- 立繪匯入頁（art/import.html，只在本機使用） ----------
    imp_title: '立繪匯入',
    imp_h1: '角色立繪匯入',
    imp_step1: '點角色旁的「複製提示詞」，貼到你用的 AI 繪圖工具（Midjourney、Stable Diffusion、ChatGPT、Gemini…），或交給畫師參考。建議<b>直式、全身、白底</b>。',
    imp_step2: '把畫好的圖<b>拖進這個頁面</b>（可以一次拖很多張）。檔名用角色代碼或名字（例如 <code>princess.png</code>、<code>朱其小公主.jpg</code>）就會自動對應；也可以拖到某個角色的格子上，或按「選擇圖片」。',
    imp_step3: '程式會自動<b>去掉白底、裁切</b>。在編輯視窗<b>點一下角色的臉</b>（戰場上的圓形頭像會以這裡為中心），調整頭像大小，按「儲存」。',
    imp_style: '共用風格（已包含在每個提示詞裡）',
    imp_neg: '負面提示詞（Stable Diffusion 等工具用）',
    imp_copy_neg: '複製負面提示詞',
    imp_copy_all: '複製全部角色的提示詞',
    imp_back: '← 回遊戲',
    imp_drop: '放開以匯入圖片',
    imp_has: '✓ 已有立繪',
    imp_copy: '複製提示詞',
    imp_pick: '選擇圖片',
    imp_edit: '調整頭像',
    imp_del: '刪除',
    imp_del_confirm: '刪除這個角色的立繪？',
    imp_read_fail: '無法讀取圖片',
    imp_face_hint: '點角色的<b>臉</b>設定頭像中心（紅圈）。背景如果沒去乾淨，調整右邊的「去背容差」。',
    imp_preview: '戰場頭像預覽',
    imp_zoom: '頭像縮放：{n}',
    imp_rb: '自動去背（白底）',
    imp_tol: '去背容差：{n}',
    imp_holes: '也去掉被圍起來的白色背景（例如弓弦內側）',
    imp_save: '儲存',
    imp_no_server: '目前不是透過 start-server.bat 開啟，無法直接存進遊戲：按「儲存」會下載 PNG 與 manifest.js，請放進 art/heroes 與 art 資料夾。',
    imp_save_fail: '儲存失敗：{err}',
    imp_saved: '已儲存 {name} 的立繪',
    imp_downloaded: '已下載 PNG 與 manifest.js',
    imp_unknown: '認不出是哪個角色：請把圖拖到角色的格子上，或改檔名（例如 princess.png）',
    imp_bulk: '匯入 {ok} 張{miss}。可以按「調整頭像」微調臉部位置。',
    imp_bulk_miss: '，{n} 張認不出角色：{files}',
    imp_copied: '已複製',
    imp_copy_fail: '無法自動複製，請手動選取文字',
    imp_copied_all: '已複製全部提示詞',
    imp_copy_fail_all: '無法自動複製',
    imp_prompt_head: '【{name}】', // 「複製全部」時每個角色提示詞前的標題
    imp_srv_ok: '✓ 已連上伺服器：按「儲存」會直接存進遊戲。',
    imp_srv_remote: '⚠ 只有在執行伺服器的那台電腦上（http://localhost:8000/art/import.html）才能存進遊戲。',
    imp_srv_none: '⚠ 沒有偵測到伺服器：請雙擊 <b>start-server.bat</b>，再打開 <a href="http://localhost:8000/art/import.html">http://localhost:8000/art/import.html</a>。也可以繼續使用，儲存時會改成下載檔案。',
    // ---------- 提示模式、我的發現（筆記） ----------
    hints_label: '圖鑑提示',
    hints_guided: '📖 攻略模式',
    hints_challenge: '🎯 挑戰模式',
    hints_guided_d: '圖鑑和選角時顯示克制、被克制、連攜組合與提示。',
    hints_challenge_d: '隱藏克制、連攜與提示，在對戰中自己發現！',
    cx_hidden: '🎯 挑戰模式：克制、被克制、連攜與提示都藏起來了。自己試出來，記在下面的「我的發現」！',
    cx_tab_notes: '📝 我的發現',
    notes_h: '📝 我的發現',
    notes_add: '＋ 新增發現',
    notes_add_hero: '＋ 記下關於{hero}的發現',
    notes_local: '筆記只存在這台裝置的瀏覽器裡。',
    notes_empty: '還沒有筆記。打出好用的組合、找到誰剋誰，就記下來吧！',
    notes_none_q: '沒有符合「{q}」的筆記',
    notes_untitled: '（沒有標題）',
    note_new: '新增發現',
    note_edit_t: '編輯發現',
    note_title: '標題',
    note_title_ph: '例如：冰凍連鎖、鹹魚大爆發',
    note_heroes: '相關角色（點頭像選擇，最多 {n} 個）',
    note_heroes_none: '還沒選角色',
    note_text: '內容',
    note_text_ph: '怎麼搭、什麼時候用、為什麼有效、要小心什麼……',
    note_save: '儲存',
    note_edit: '✏️ 編輯',
    note_del: '🗑 刪除',
    confirm_note_del: '要刪除這則筆記嗎？',
    toast_note_saved: '已儲存到「我的發現」',
    toast_note_deleted: '已刪除',
    toast_note_empty: '寫個標題或內容再儲存吧',
    toast_note_max: '最多選 {n} 個角色',
  },
});
