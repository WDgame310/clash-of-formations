// UI text: English (same keys as js/lang/zh.ui.js).
// Keep every {placeholder} and HTML tag. Terms follow js/lang/GLOSSARY.md; names follow js/lang/en.data.js.
GAME.I18N.add('en', {
  ui: {
    // ---------- Common ----------
    doc_title: "Clash of Formations",
    close: "Close",
    cancel: "Cancel",
    ok: "OK",
    back: "Back",
    sep_dot: " · ", // between items
    sep_list: ", ", // between names in a list
    p1: "Player 1", // default player names
    p2: "Player 2",
    ai_name: "Computer",
    host_name: "Host",
    guest_name: "Challenger",
    art_missing: "No artwork yet",
    art_failed: "Artwork failed to load",
    btn_codex: "📚 Hero Guide",
    btn_rules: "📖 Rules",
    btn_log: "📜 Battle Log",
    btn_home: "🏠 Main Menu",
    sound_on: "🔊 Sound: On",
    sound_off: "🔇 Sound: Off",
    // Install as an app (under the home screen buttons) and new-version notice
    pwa_install: "📲 Install as an app",
    pwa_ios_hint: "📲 To install: in Safari, tap Share → \"Add to Home Screen\"",
    pwa_inapp_hint: "📲 To install as an app, first open this page in your browser: use this app's menu → \"Open in browser\" (Safari on iPhone, Chrome on Android), then follow the tip there",
    pwa_updated: "Updated to the latest version; it applies the next time you open the game",
    // Phase names
    phase_ban: "Ban Phase",
    phase_draft: "Draft",
    phase_deploy: "Blind Deploy",
    phase_plan: "Plan Moves",
    phase_over: "Game Over",
    // Card targets
    tgt_enemy: "One enemy",
    tgt_ally: "One ally",
    tgt_allyFront: "Self or front row",
    tgt_allyHero: "Ally hero",
    tgt_cell: "Enemy square",
    tgt_self: "Self",
    // Attack range
    rng_melee: "Melee",
    rng_ranged: "Ranged",
    rng_back: "Flank",
    // Card tags
    tag_basic: "Basic",
    tag_pre: "Predict",
    tag_spd: "Spd +{n}",
    tag_aoe: "Area",
    // Position rules (when melee hits the square): ranged, flank and Lock-on cards follow the hero (flank still only reaches the back row)
    tag_lock: "Lock-on",
    tag_lock_title: "Follows the hero: still hits the target after it swaps",
    // Lock-on tooltip for flank cards: they can still only reach the back row
    tag_lock_title_back: "Follows the hero, but only reaches the back row: if they move to the front row (and the back row isn't empty), it hits another back-row unit",
    passive: "Passive [{n}]: {d}",
    row_front: "Front row",
    row_back: "Back row",
    summon: "Summon",
    undead: "Undead",

    // ---------- Home ----------
    home_sub: "Tabletop Rules · Digital Edition",
    home_logo: "<span>Clash</span> <span>of</span> <span>Formations</span>", // title; each <span> pops in one after another
    home_logo_en: "異陣對決",
    home_p1_name: "Player 1 name",
    home_p2_name: "Player 2 name",
    mode_hotseat: "Pass & Play",
    mode_ai: "Vs Computer",
    home_resume: "▶ Continue last game ({info})",
    home_resume_round: "Round {n}",
    home_resume_online: "▶ Back to online room {code}",
    mode_hotseat_b: "One device · Two players",
    mode_hotseat_s: "Take turns; you'll be told when to pass the device in secret phases",
    mode_ai_b: "One device · Vs Computer",
    mode_ai_s: "Practice on your own",
    mode_online_b: "Two devices · Online",
    mode_online_s: "Phones / tablets / computers on the same Wi-Fi",

    // ---------- Rules ----------
    rules_title: "Rules",
    rules_body: `<h2>How to Win</h2>
      <p>Bring every character on your opponent's field down to 0 HP to win. A game lasts at most 15 rounds. From round 10, "Sudden Death" begins: at the end of each round, every unit takes 5 true damage. When round 15 ends, the side with the higher percentage of total HP left wins.</p>
      <h2>1. Ban and Draft</h2>
      <p>The first player is chosen at random. The first player bans 1 hero, then the second player bans 1 (bans are public). Then heroes are picked in the order <b>1-2-2-2-2-1</b>: the first player picks 1 → the second player picks 2 → the first player picks 2 → the second player picks 2 → the first player picks 2 → the second player picks the last 1, so each side gets 5. Minions don't need to be picked; they can always be deployed.</p>
      <h2>2. Blind Deploy</h2>
      <p>From your 5 heroes and the minions, secretly place units on your 2x2 formation (2 front-row squares, 2 back-row squares). Total Cost can't be over 10, with at most 4 units. Both sides are revealed at the same time.</p>
      <h2>3. Plan Moves in Secret</h2>
      <p>Each round you have 3 AP (unused AP is not kept). Tap your own character, choose a card, then choose a target. A character can use several different cards in the same round (for example "Sidestep + Slash"), but each card can only be used once per round. When both players confirm, the moves are revealed at the same time.</p>
      <p><b>Speed check:</b> character speed + card speed bonus = total speed, and the faster one acts first. Units with the same speed resolve at the same time (a unit knocked out by an opponent with the same speed still acts). If the slower side is knocked out, Frozen or Stunned before it acts, its cards fail and the AP is not refunded.</p>
      <p><b>Predict and defensive cards</b> (marked "Predict", such as Shield, dodge, Taunt and Decree) take effect before all attacks.</p>
      <h2>Rules That Make Battles More Strategic</h2>
      <ul>
        <li>⏳ <b>Can't be used two rounds in a row</b>: except for cards marked "Basic", a card you used must rest next round (cards that were confiscated or interrupted before they were really used don't count). You can see your opponent's ⏳ too, so you can predict what they can't use this round.</li>
        <li>🔰 <b>Guard</b> (every character has it, 1 AP, Predict): take half damage this round (except true damage).</li>
        <li>🔄 <b>Swap</b> (every character has it, 1 AP): swap front/back places within the same column, so you can dodge melee attacks or hide your damage dealers in the back row. Under the basic rules, Swap is a Predict card and takes effect before all attacks; with the "Position Rules (digital edition)" below, it resolves in speed order instead. The Mountain Giant can't swap or be swapped; units with Freeze or Stun can't swap.</li>
        <li>💰 <b>Save AP</b>: up to 1 unused AP carries over to next round (max 4 AP), so you can save up to play a 3 AP big card + a 1 AP card in the same round.</li>
        <li>📊 <b>Turn order</b>: the middle of the planning screen shows the predicted turn order, and it updates right away when you choose speed-boosting cards.</li>
      </ul>
      <h2>Attack Range</h2>
      <p><b>Melee</b> can only hit the enemy front row; the back row can be hit only after all enemy front-row characters are down. <b>Ranged</b> can hit any position. <b>Flank</b> (Shadow Assassin) hits the back row first. Summons don't block, but they can be attacked. While the Dog-loving Summoner is on the field, enemy single-target cards are drawn to the Puppy (except the Assassin's).</p>
      <h2>Position Rules (digital edition)</h2>
      <ol>
        <li><b>Melee needs the front row</b>: when a melee card resolves, its user must be in the front row, or it misses (the AP is still spent). A back-row character can Swap first and then use a melee card in the same round.</li>
        <li><b>Melee hits the square</b>: if the target is swapped away by its own side, whoever swaps in takes the hit; if nobody swaps in, it hits someone else in the front row.</li>
        <li><b>Ranged attacks follow the hero</b> (full lock-on); the Mountain Giant's Lock-on cards work the same way. Flank attacks only hit the back row: if the target swaps to the front, they hit someone else in the back row.</li>
        <li><b>Swaps go by speed</b>: a Swap resolves in speed order, so you must be faster than the attacker to get away; at equal speed it's too late.</li>
        <li>Taunt and the Puppy still take priority.</li>
      </ol>
      <p>To remember: "Fists stand in front; fists hit squares, arrows chase heroes; only the faster one gets away."</p>
      <h2>Keywords</h2>
      <ul>
        <li>🛡 <b>Shield</b>: damage hits the Shield first; cleared at the end of the round (unless stated otherwise).</li>
        <li>🔥 <b>Burn</b>: take 6 true damage at the end of the round, for 2 rounds.</li>
        <li>🧊 <b>Freeze / 💫 Stun</b>: all cards not yet played this round fail, and the controlled side gets AP -1 next round.</li>
        <li>🐌 <b>Slow</b>: speed -2. ❄️ <b>Chill</b>: speed -1 per stack; 3 stacks turn into Freeze.</li>
        <li><b>Pull / Knockback</b>: pull the target into the front row / push it into the back row (it swaps places with the square in the same column).</li>
        <li><b>True damage</b>: ignores Shield, defense and damage reduction. <b>Piercing</b>: ignores Shield.</li>
        <li>😩 <b>Fatigue</b>: lose 5 HP per stack at the end of the round. 🌀 <b>Curse</b>: +10% damage taken per stack. 💔 <b>Vulnerable</b>: takes more damage.</li>
      </ul>
      <h2>End of Round</h2>
      <p>Summons attack automatically → Burn/Fatigue/Bleed/traps → Sudden Death → passive effects → Shields are cleared.</p>
      <p class="muted">This is a digital version made from the tabletop rulebook and character cards. Anything the cards didn't spell out (for example, "whole field" counts as all enemies, and Freeze doesn't stop a character from acting next round; instead it gives AP -1) is written straight into the card descriptions.</p>`,

    // ---------- Online lobby ----------
    lobby_title: "Two devices · Online battle",
    lobby_checking: "Looking for the game server…",
    lobby_noserver_title: "Start the game server first",
    // {mode} = text of the home screen "Two devices · Online" button
    lobby_noserver_steps: `<li>On the computer, open the game folder and double-click <b>start-server.bat</b> (Python is required).</li>
          <li>A black window will show an address, for example <code>http://192.168.1.23:8000/</code>.</li>
          <li>Connect both devices to the same Wi-Fi and open that address in a browser.</li>
          <li>Choose "{mode}" again.</li>`,
    lobby_firewall: 'If Windows shows a firewall prompt, click "Allow access".',
    lobby_public_warn: "This computer's Wi-Fi is set to <b>Public</b>, so Windows Firewall blocks other devices. Go to <b>Settings → Network &amp; internet → Wi-Fi → this network</b> and set the network profile to <b>Private</b>, or in <b>Windows Security → Firewall &amp; network protection → Allow an app through firewall</b>, tick <b>Private</b> for python.exe.",
    lobby_retry: "Check again",
    // Extra line on the hosted (https) web version, which has no game server
    lobby_hosted_note: "This web version has no game server. To play on two devices, run <b>start-server.bat</b> from the game folder on a computer on the same Wi-Fi, then open the address it shows on both devices (not this website). One-device modes are not affected and work even offline.",
    lobby_your_name: "Your name",
    lobby_create: "Create room",
    lobby_create_sub: "Get a room code to enter on the other device",
    lobby_or: "or",
    lobby_code_ph: "Code",
    lobby_join: "Join room",
    lobby_open_url: "On the other device, open:",
    lobby_room_code: "Room code",
    lobby_host_hint: 'On the other device, choose "{join}" and enter this code', // {join} = the "Join room" button
    lobby_joining: "Joining room…",
    lobby_other_url: "Address for the other device:",
    lobby_waiting: "Connected, waiting for opponent…",
    lobby_retrying: "Connection lost, retrying…",
    lobby_leave: "Leave room",
    toast_no_room: "Room doesn't exist or has expired",
    toast_send_fail: "Couldn't send, please check your connection",
    toast_create_fail: "Couldn't create room: {err}",
    toast_code4: "Please enter the 4-character room code",
    toast_spectator: "Spectators can't start a new game",

    // ---------- Game title bar ----------
    tb_round: " · Round {n}/{max}", // appended after the phase name
    tb_resolve: "Round {n} · Results",
    net_ok: "Connected",
    net_bad: "Disconnected",

    // ---------- Pass-the-device screen ----------
    cover_ban: "Secretly ban 1 hero",
    cover_deploy: "Secret deployment",
    cover_plan: "Round {n} · Secret moves",
    cover_hand: "Pass the device to {p}",
    cover_nopeek: "{p}, no peeking!",
    cover_start: "I'm {p}, start",

    // ---------- Ban / draft ----------
    os_ban_short: "✕", // one symbol on the order strip
    os_ban: "Ban",
    os_pick: "Pick",
    os_title: "{act} · {p}",
    os_title_hero: "{act} · {p}: {hero}",
    ban_turn: '{p}\'s turn to <b class="red">ban</b> 1 hero',
    ban_wait: "Waiting for {p} to ban",
    ban_hint: "First player {first} bans first, then second player {second}; banned heroes can't be picked this game",
    draft_turn: "{p}'s turn to pick",
    draft_multi: " ({n} picks)",
    draft_wait: "Waiting for {p} to pick",
    draft_progress: "Pick {n} / {total} · Banned: {banned}",
    draft_first: " (first)",
    ht_banned: "Banned",
    draft_footer: "Tap a hero to see all their skills. Minions (Cost 1) don't need to be picked; they're always available when deploying.",
    modal_ban: "🚫 Ban {hero}",
    modal_pick: "✅ {p} picks {hero}",

    // ---------- Deploy ----------
    deploy_done_wait: "Deployed, waiting for opponent",
    deploy_title: "{p} deploys in secret",
    deploy_rule: "Total Cost ≤ {cost}, at most {units} units",
    deploy_enemy_side: "▲ Enemy side ▲",
    deploy_cost: "Cost <b>{n}</b>/{max}",
    deploy_units: "Units <b>{n}</b>/{max}",
    deploy_hint: "Tap a character below to place it. Tap a placed square, then another square, to move it. Melee attacks must hit the front row first.",
    deploy_clear: "Clear",
    deploy_submit: "Confirm",
    opp_pool: "Opponent's picks:",
    toast_max_units: "At most {n} units",
    toast_cost_over: "Cost would go over {n}",
    // Position rules (when melee must be in the front row): deploy limit and warnings; {giant} = the Giant's name
    toast_giant_front: "The {giant} can only go in the front row (he can't swap)",
    deploy_warn_giant_back: "A melee character right behind the {giant} can't reach the front row until the {giant} is down, so it can't attack",
    deploy_warn_melee_many: "More melee heroes than front-row squares: the extra one must Swap before it can attack",

    // ---------- Battlefield ----------
    dead: "KO",
    snow: "❄️ Snowfield",
    st_next_round: " (next round)", // status icon tooltip: takes effect next round
    st_sunmark: "Sun Mark",
    st_ink: "Ink Mark",
    st_def: "Defense",
    st_cd_title: "Cooldown: {list}",
    fx_miss: "Dodge", // floating text
    bubble_card: "[{card}]", // speech bubble above the unit when it plays a card

    // ---------- Plan moves ----------
    why_cant: "Can't use this now",
    why_used: "Selected",
    why_group: "Pick one of the pair",
    why_cd: "⏳ Used last round, resting now",
    why_ap: "Not enough AP",
    why_notgt: "No target",
    tl_cell: "Enemy {slot}",
    tl_all: "All enemies",
    tl_self: "Self",
    ob_last: "Last",
    ob_title: "Turn order (Predict cards go first; enemy ? = their speed boosts are unknown)",
    plan_sending: "Sending",
    plan_ai_thinking: "Computer is thinking",
    plan_wait: "Moves sent, waiting for opponent",
    plan_opp_ready: "Opponent is ready ✓",
    plan_tgt_unit: "🎯 Tap a <b>glowing</b> character on the field as the target of [{card}]",
    plan_tgt_cell: "🎯 Tap a <b>glowing</b> square on the field as the target of [{card}]",
    // Position rules: reminder while picking a melee target (normal melee hits the square; Lock-on follows the hero)
    plan_square_hint: "Melee hits the square: if the target swaps away, whoever swaps in takes the hit.",
    plan_lock_hint: "Lock-on follows the hero you picked: swapping away won't save them (Taunt and the Puppy still take priority).",
    // Swaps go by speed: {fast} enemy melee you outspeed (in time); {slow} the ones you don't (? = they have speed-boost cards)
    swap_hint: "🔄 {unit} speed {spd}: in time → {fast}; too late → {slow}",
    // Back-row unit swapping forward while ally {mate} is in front: faster = steps into the square and takes the hit for them; too late = {mate} is hit
    swap_hint_in: "🔄 {unit} speed {spd}: steps in and takes the hit for {mate} → {fast}; too late, {mate} is hit → {slow}",
    // noWhiff, nobody in the same column: no one steps into the square and the unit is still a legal target → Swap doesn't dodge
    swap_hint_stuck: "🔄 {unit} speed {spd}: nobody steps into the square, so the Swap doesn't dodge → {slow}",
    // Appended to the lines above: Lock-on cards (Giant) hit their original target however fast the Swap is
    swap_hint_lock: "; Lock-on, still hits its target → {list}",
    // When one enemy card resolves at a different speed than the character (e.g. a wind-up), its name is added
    swap_foe_card: "{unit} ({card})",
    // Back-row unit swaps then uses melee while a faster enemy has a Freeze/Stun card
    plan_interrupt: "may be interrupted",
    plan_interrupt_title: "Faster enemies with Freeze/Stun: {list}",
    // Shown under the Swap card when swaps go by speed
    swap_speed_note: "🔄 Position rules: Swap resolves in speed order instead (not before all attacks).",
    plan_basic_actions: "Basic actions (every character has them)",
    plan_hint: "👆 Tap <b>your own character</b> to choose cards. You can spend all your AP on one character or share it among several.",
    plan_chip: "{icon} {unit} [{card}] → {target} <b>{ap} AP</b>",
    ap_frac: "{n}/{max} AP",
    plan_saved: "Includes 1 saved from last round",
    plan_bank: "{n} left → save 1 for next round",
    plan_snow: "❄️ Snowfield: +1 AP per card",
    plan_clear: "Clear",
    plan_submit: "Confirm moves ({ap} AP)",
    plan_rest: "Rest this round",
    last_log: "📜 Last round's report",
    toast_pick_glow: "Tap a glowing target",
    confirm_rest: "Play no cards this round (rest)?",

    // ---------- Round playback ----------
    card_back: "異", // decorative emblem on the card back
    reveal_rest: "Rest",
    reveal_title: "Reveal!",
    pb_reveal_cap: "Both sides flip their cards…",
    pb_result: "See results ▶",
    pb_next_round: "Next round ▶",
    pb_prev: "Prev",
    pb_toggle: "Pause/Play",
    pb_next: "Next",
    pb_speed: "Speed",
    pb_skip: "Skip",
    pb_log_title: "📜 This round's report",

    // ---------- Game over ----------
    over_draw: "🤝 Draw",
    over_win: "🏆 {p} wins!",
    over_you_win: "🏆 You win!",
    over_you_lose: "💔 You lose…",
    over_rematch: "Rematch",

    // ---------- Unit details (popup) ----------
    st_left_next: " (starts next round)",
    st_left_n: " ({n} rounds left)",
    st_left_now: " (this round)",
    st_line: '{i} <b>{n}</b>{extra}: {d}<span class="muted">{left}</span>', // {extra} = stacks, percentage
    live_sunmark: "☀️ <b>Sun Mark</b>: can use {card}",
    live_ink: "🖋 <b>Ink Mark</b> x{n}",
    live_def: "🪨 <b>Defense</b> {n}: reduces every hit",
    live_notire: "Tire Armor lost",
    live_cd: "⏳ <b>Cooldown</b>: {list} (used last round, can't be used this round)",
    live_none: "No statuses",
    // Summon descriptions: {golem} Wandering Golem, {card} Will of Stone, {big} Big Dog, {bleed} Bleed
    sm_desc_bat: "At the end of the round, attacks a random enemy for 4 damage.",
    sm_desc_gpirate: "At the end of the round, attacks the enemy front row for 8 damage.",
    sm_desc_ship: "At the end of the round, all enemies take +10% damage next round.",
    sm_desc_statue: "Each one reduces the damage {golem} takes by 10%; can ram enemies with {card}.",
    sm_desc_dog: "At the end of the round, attacks the enemy front row for 12 damage ({big}: 25 damage + {bleed}). Enemy single-target cards lock onto it first.",

    // ---------- Game menu ----------
    menu_surrender: "🏳️ Surrender",
    menu_autosave: " (auto-saves)",
    log_title: "Battle Log",
    confirm_surrender: "Are you sure you want to surrender?",

    // ---------- Hero Guide ----------
    cx_title: "Hero Guide",
    cx_placeholder: "Search names, cards or keywords (e.g. Freeze, true damage, summon, tank)",
    cx_tab_heroes: "🃏 Heroes",
    cx_tab_kw: "📖 Keywords",
    cx_all_f: "All factions",
    cx_all_t: "All types",
    cx_all_c: "All Costs",
    cx_cost: "Cost {n}",
    cx_all_r: "All roles",
    cx_count: "{n} characters · tap a card for skills, counters and combos",
    cx_count_q: '{n} characters match "{q}" · tap a card for skills, counters and combos',
    cx_none: "No matching characters",
    cx_no_kw: "No matching keywords",
    cx_wr: "Win rate {pct}%",
    cx_strong: "✅ Strong against",
    cx_weak: "⚠️ Weak against (be careful)",
    cx_combos: "🤝 Combos",
    cx_how: "How to play: {how}",
    // Keywords (name kw_<id>, description kw_<id>_d).
    // Melee / Ranged / Flank / Predict / Area / Basic names come from rng_ and tag_; Stun uses the status name; Guard / Swap use the basic action card names.
    kw_shield: "Shield",
    kw_shield_d: "Damage hits the Shield before HP; cleared at the end of the round (unless stated otherwise).",
    kw_true: "True damage",
    kw_true_d: "Ignores Shield, defense and damage reduction.",
    kw_pierce: "Piercing",
    kw_pierce_d: "Ignores Shield, but defense and damage reduction still apply.",
    kw_melee_d: "Can only hit the enemy front row; the back row can be hit once the front row is all down.",
    kw_ranged_d: "Can hit any position.",
    kw_back_d: "Hits the back row first, ignoring the front row and the Puppy.",
    kw_pre_d: "Takes effect before all attacks (Shield, dodge, Taunt, Decree…).",
    kw_aoe_d: "Hits all enemy units (including summons).",
    kw_summon: "Summon",
    kw_summon_d: "Summons don't block and don't count toward winning, but they can be attacked.",
    kw_pull: "Pull",
    kw_pull_d: "Pulls a back-row target into the front row (swapping places in the same column).",
    kw_knock: "Knockback",
    kw_knock_d: "Pushes a front-row target into the back row (if it bumps into someone, both take damage).",
    kw_stun_d: "All cards not yet played this round fail, and the controlled side gets AP -1 next round.",
    kw_cd: "Can't be used two rounds in a row",
    kw_cd_d: 'Except for "Basic" cards, a card you used must rest next round (you can use it again the round after).',
    kw_basic_d: "Each character's basic attack: usable every round, with no cooldown.",
    kw_guard_d: "Every character has it: 1 AP, take half damage this round (except true damage).",
    kw_swap_d: "Every character has it: 1 AP, swap front/back places in the same column. Normally before attacks; with the position rules, in speed order.",
    kw_lock_d: "Position rules: the card follows the hero you picked instead of hitting a square (Taunt and the Puppy still take priority; the Puppy doesn't draw flank cards). Ranged cards and the Mountain Giant's Lock-on cards hit them wherever they move; flank cards still only reach the back row, so if the target moves to the front row (and the back row isn't empty), they hit another back-row unit. Normal melee hits the square instead.",
    kw_lock_m: "lock-on",
    kw_bank: "Save AP",
    kw_bank_d: "Up to 1 unused AP carries over to next round (max 4 AP).",
    // ---------- Portrait importer (art/import.html, local use only) ----------
    imp_title: "Portrait Importer",
    imp_h1: "Character Portrait Importer",
    imp_step1: "Click \"Copy prompt\" next to a character and paste it into your AI image tool (Midjourney, Stable Diffusion, ChatGPT, Gemini…), or give it to an artist for reference. <b>Portrait orientation, full body, white background</b> works best.",
    imp_step2: "<b>Drag the finished images onto this page</b> (you can drop many at once). Name each file after the character's code or name (e.g. <code>princess.png</code>, <code>Vermilion Princess.jpg</code>) and it is matched automatically; you can also drop an image on a character's box, or click \"Choose image\".",
    imp_step3: "The page automatically <b>removes the white background and crops</b> the image. In the editor, <b>click the character's face</b> (the round portrait on the battlefield is centered there), adjust the portrait zoom, then click \"Save\".",
    imp_style: "Shared style (already included in every prompt)",
    imp_neg: "Negative prompt (for Stable Diffusion and similar tools)",
    imp_copy_neg: "Copy negative prompt",
    imp_copy_all: "Copy prompts for all characters",
    imp_back: "← Back to the game",
    imp_drop: "Drop to import images",
    imp_has: "✓ Has artwork",
    imp_copy: "Copy prompt",
    imp_pick: "Choose image",
    imp_edit: "Adjust portrait",
    imp_del: "Delete",
    imp_del_confirm: "Delete this character's artwork?",
    imp_read_fail: "Couldn't read the image",
    imp_face_hint: "Click the character's <b>face</b> to set the portrait center (red circle). If the background isn't fully removed, adjust \"Background tolerance\" on the right.",
    imp_preview: "Battlefield portrait preview",
    imp_zoom: "Portrait zoom: {n}",
    imp_rb: "Remove background automatically (white)",
    imp_tol: "Background tolerance: {n}",
    imp_holes: "Also remove enclosed white areas (e.g. inside a bowstring)",
    imp_save: "Save",
    imp_no_server: "This page wasn't opened through start-server.bat, so it can't save straight into the game: \"Save\" downloads the PNG and manifest.js instead. Put them in the art/heroes and art folders.",
    imp_save_fail: "Save failed: {err}",
    imp_saved: "Saved {name}'s artwork",
    imp_downloaded: "Downloaded the PNG and manifest.js",
    imp_unknown: "Couldn't tell which character this is: drop the image on the character's box, or rename the file (e.g. princess.png)",
    imp_bulk: "Imported {ok} image(s){miss}. Click \"Adjust portrait\" to fine-tune the face position.",
    imp_bulk_miss: "; {n} didn't match any character: {files}",
    imp_copied: "Copied",
    imp_copy_fail: "Couldn't copy automatically; please select the text by hand",
    imp_copied_all: "Copied all prompts",
    imp_copy_fail_all: "Couldn't copy automatically",
    imp_prompt_head: "[{name}]",
    imp_srv_ok: "✓ Connected to the server: \"Save\" stores artwork straight into the game.",
    imp_srv_remote: "⚠ Artwork can only be saved into the game on the computer running the server (http://localhost:8000/art/import.html).",
    imp_srv_none: "⚠ No server detected: double-click <b>start-server.bat</b>, then open <a href=\"http://localhost:8000/art/import.html\">http://localhost:8000/art/import.html</a>. You can also keep going here; saving will download the files instead.",
    // ---------- Hint mode, My Discoveries (notes) ----------
    hints_label: "Hero Guide hints",
    hints_guided: "📖 Guided",
    hints_challenge: "🎯 Challenge",
    hints_guided_d: "The Hero Guide and the draft show counters, weaknesses, combos and tips.",
    hints_challenge_d: "Counters, combos and tips are hidden: discover them yourself in battle!",
    cx_hidden: "🎯 Challenge mode: counters, weaknesses, combos and tips are hidden. Find them out yourself and write them down in \"My Discoveries\" below!",
    cx_tab_notes: "📝 My Discoveries",
    notes_h: "📝 My Discoveries",
    notes_add: "+ New discovery",
    notes_add_hero: "+ Note a discovery about {hero}",
    notes_local: "Notes are saved only in this device's browser.",
    notes_empty: "No notes yet. When you find a combo that works or spot who counters whom, write it down!",
    notes_none_q: "No notes match \"{q}\"",
    notes_untitled: "(Untitled)",
    note_new: "New discovery",
    note_edit_t: "Edit discovery",
    note_title: "Title",
    note_title_ph: "e.g. Freeze chain, Salted Fish blowout",
    note_heroes: "Characters involved (tap portraits, up to {n})",
    note_heroes_none: "No characters yet",
    note_text: "Notes",
    note_text_ph: "How to pair them, when to play it, why it works, what to watch out for…",
    note_save: "Save",
    note_edit: "✏️ Edit",
    note_del: "🗑 Delete",
    confirm_note_del: "Delete this note?",
    toast_note_saved: "Saved to My Discoveries",
    toast_note_deleted: "Deleted",
    toast_note_empty: "Add a title or some text first",
    toast_note_max: "Up to {n} characters",
  },
});
