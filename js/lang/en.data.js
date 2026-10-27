// English: hero, minion, card, status and label translations (see js/i18n.js).
// Numbers, AP costs and durations must match js/data.js exactly. Terms follow js/lang/GLOSSARY.md.
GAME.I18N.add('en', { data: {
  heroes: {
    // ---- Royal ----
    swordsman: { n: "Solar Blade", passive: { n: "Inner Focus", d: "If in the back row and not damaged this round, speed +2 next round." } },
    princess: { n: "Vermilion Princess", passive: { n: "Pride", d: "Ignores front-row blocking; attacks can freely target the front row or back row." } },
    icequeen: { n: "Frost Sovereign", passive: { n: "Absolute Zero", d: "+20% damage to enemies with Freeze, Slow or Chill." } },
    wuxing: { n: "Five Elements Sage", passive: { n: "Elemental Cycle", d: "After using a card of one element last round, cards of a different element get +30% to their values this round." } },
    hawk: { n: "Royal Hawk", passive: { n: "Air Superiority", d: "Ignores front-row blocking; immune to ground traps (Hex Trap, fire)." } },
    // ---- North ----
    giant: { n: "Mountain Giant", passive: { n: "Heavyweight", d: "Immune to displacement (Pull/Knockback). Always counts as the slowest, so he acts last." } },
    icecap: { n: "Glacier Commander", passive: { n: "Steadfast", d: "At the start of each round, gain a 5-point Shield if in the front row." } },
    golem: { n: "Wandering Golem", passive: { n: "Stone Armor", d: "For every 20% HP lost, gain +2 flat damage reduction." } },
    monk: { n: "Rockbreaker Monk", passive: { n: "Battle Hardened", d: "Each card that deals damage permanently gives you +2 defense (max 6; a multi-hit attack counts once)." } },
    smith: { n: "Forge Artisan", passive: { n: "Master Craft", d: "At the end of the round, if not damaged this round, give a random ally an 8-point Shield (lasts until the end of next round)." } },
    // ---- Abyss ----
    fish: { n: "Salted Fish", passive: { n: "Mystery", d: "For each debuff on you, take 10% less damage (up to -40%)." } },
    eater: { n: "Pesky Devourer", passive: { n: "Bottomless Pit", d: "Can't be healed; can only recover HP through its own abilities." } },
    vampire: { n: "Blood Count", passive: { n: "Children of the Night", d: "At the end of the round, heal 1 HP for each of your Bats on the field." } },
    judge: { n: "Inquisitor", passive: { n: "Courtroom", d: "While the Inquisitor is on the field, critical hits and speed boosts have no effect for all units." } },
    ghost: { n: "Phantom Wraith", passive: { n: "Void", d: "If you use no cards that cost AP this round, you automatically dodge the first attack this round." } },
    inkmage: { n: "Ink Hexer", passive: { n: "Trap Master", d: "Traps you place can't be destroyed; they stay in place until triggered." } },
    dogger: { n: "Dog-loving Summoner", passive: { n: "Loyal Pup", d: "Starts with a Puppy (45 HP; attacks for 12 damage at the end of the round). Enemy single-target cards lock onto the Puppy first." } },
    assassin: { n: "Shadow Assassin", passive: { n: "Flank", d: "Attacks always ignore the front row and the Puppy and hit back-row targets directly (only hits the front row if the back row is empty)." } },
    // ---- Sanctum ----
    onepunch: { n: "One-Punch Winner", passive: { n: "Beyond Limits", d: "Has no defensive cards. When HP is below 30%, speed is forced up to 10." } },
    pirate: { n: "Pirate King", passive: { n: "Ruler of the Seas", d: "While your Ghost Ship is on the field, immune to all debuffs." } },
    michelin: { n: "Star Critic", passive: { n: "Tire Armor", d: "Always takes 10% less damage." } },
    pingpong: { n: "Table Tennis Ace", passive: { n: "Power Works Wonders", d: "Each attack has a 25% chance to deal double damage." } },
    saint: { n: "Saint Aileen", passive: { n: "Holy Purity", d: "Deals double damage to undead (Ghost Pirates, Ghost Ship, Bats, Little Statues)." } },
    dragon: { n: "Little Dragon", passive: { n: "Dragon Scales", d: "Immune to Burn." } },
    // ---- Minions ----
    m_shield: { n: "Shield Guard" },
    m_star: { n: "Court Stargazer" },
    m_gun: { n: "Street Musketeer" },
    m_cult: { n: "Abyss Cultist" },
  },

  cards: {
    // Solar Blade
    sw_slash: { n: "Slash", d: "Deal 15 physical damage." },
    sw_dash: { n: "Sidestep", d: "Speed +15 this round. Dodge the first attack from an enemy slower than you. If in the back row, first dash to the front of your column." },
    sw_sun: { n: "Sunslayer", d: "Deal 25 damage and gain a Sun Mark." },
    sw_final: { n: "Finale: Sunslayer", d: "Requires a Sun Mark. Deal 100 true damage (ignores Shield and defense). The Sun Mark is used up." },
    // Vermilion Princess
    pr_fire: { n: "Fire Arrow", d: "Deal 8 damage and apply Burn (lose 6 HP at the end of each round, for 2 rounds)." },
    pr_tri: { n: "Triple Shot", d: "Fire 3 arrows, 5 damage each." },
    pr_crazy: { n: "Frenzy Archery", d: "Speed +5 this round, and each card deals +10 damage this round. Next round you take +20% damage (Vulnerable). Can be used with other arrow cards in the same round." },
    pr_blast: { n: "Arcane Arrow Blast", d: "Deal 25 damage to all enemies and always apply Burn." },
    // Frost Sovereign
    iq_palm: { n: "Snowdrift Palm", d: "Deal 18 damage. The target gains 1 stack of Chill (speed -1 per stack; 3 stacks turn into Freeze)." },
    iq_spike: { n: "Ice Spike", d: "Deal 20 damage. Can only target the front row." },
    iq_blizzard: { n: "Blizzard Field", d: "Deal 20 damage to all enemies and place a Snowfield on the enemy side (each enemy card costs +1 AP next round)." },
    // Five Elements Sage
    wx_metal: { n: "Metal Shield", d: "[Metal] Gain a 15-point Shield. (Pick one: this or Earth Mend.)" },
    wx_earth: { n: "Earth Mend", d: "[Earth] Restore 15 HP to yourself. (Pick one: this or Metal Shield.)" },
    wx_wood: { n: "Wood Vines", d: "[Wood] Deal 5 damage; the enemy gets AP -1 next round. (Pick one: this or Water Flow.)" },
    wx_water: { n: "Water Flow", d: "[Water] Dodge the next damage you take. (Pick one: this or Wood Vines.)" },
    wx_fire: { n: "Fire Chop", d: "[Fire] Deal 16 fire burst damage." },
    // Royal Hawk
    hk_claw: { n: "Talon", d: "Deal 18 damage. (Pick one: this or Flame Feather.)" },
    hk_flame: { n: "Flame Feather", d: "A 2 AP Talon: deal 15 damage and apply Burn." },
    hk_dash: { n: "Wing Dash", d: "Speed +8 this round. If you act before every enemy, +10 damage this round." },
    hk_elite: { n: "Elite Plume", d: "Deal 30 true damage (ignores Shield and defense)." },
    // Mountain Giant
    gt_fist: { n: "Giant Fist", d: "Deal 30 heavy physical damage." },
    gt_taunt: { n: "Taunt", d: "Total defense: this round, all enemy single-target attacks are forced onto you, and their damage is halved." },
    gt_palm: { n: "Mountain Palm", d: "Deal 30 damage and Knockback (push into the back row; if it bumps into a back-row unit, both take 10 damage). Lock-on: hits the hero you picked wherever they move (Taunt and the Puppy still take priority)." },
    // Glacier Commander
    ic_aura: { n: "Frost Aura", d: "Lasts 2 rounds. Enemies that hit you with melee attacks take 5 damage back and get Slow." },
    ic_chop: { n: "Cleave", d: "Deal 10 damage. If the target has Slow/Freeze/Chill, deal 20 instead." },
    ic_freeze: { n: "Freeze", d: "Deal 10 damage and Freeze the target (cancels its unplayed cards this round; the opponent gets AP -1 next round)." },
    // Wandering Golem
    gm_slash: { n: "Heavy Slash", d: "Deal 22 physical damage. Can't be countered." },
    gm_wake: { n: "Resonant Awakening", d: "Summon a Little Statue (20 HP). Each Little Statue reduces the damage you take by 10%." },
    gm_will: { n: "Will of Stone", d: "All Little Statues ram the target for 12 damage each, then crumble." },
    // Rockbreaker Monk
    mk_iron: { n: "Iron Fist", d: "Deal 10 damage; defense +5 this round." },
    mk_ten: { n: "Ten-Hit Combo", d: "Hit 10 times for 3 damage each (30 total; easily blunted by defense)." },
    mk_big: { n: "Mighty Smash", d: "Deal 40 burst damage, ignoring Shield." },
    // Forge Artisan
    sm_forge: { n: "Hammer Time", d: "Deal 16 damage. Gain Empower (next damage +5)." },
    sm_guard: { n: "Quick Shield", d: "Forge a 20-point Shield onto a chosen ally." },
    sm_99: { n: "Ninefold Forge", d: "Deal 15 damage. Enchant the whole team's weapons (next round, every team card deals +10 damage)." },
    // Salted Fish
    fs_mock: { n: "Salty Sneer", d: "Predict. All of the target's buffs this round turn into Curse (each stack: +10% damage taken)." },
    fs_selfish: { n: "Selfish", d: "Pull every debuff from all units on the field onto yourself." },
    fs_iam: { n: "I Am Salted Fish", d: "For each debuff on you (counts as at least 1), deal 25 true damage to all enemies. Then clear your debuffs." },
    // Pesky Devourer
    et_bite: { n: "Big Bite", d: "Deal 14 damage." },
    et_hungry: { n: "I'm Hungry", d: "The next attack card used by your team (any character) deals x2 damage." },
    et_annoy: { n: "Pester", d: "Predict. Choose an enemy; its attacks this round deal x5 damage. Pair it with [I Love Food] to eat that hit and heal!" },
    et_food: { n: "I Love Food", d: "The first damage you take this round is negated, and you heal 2 times that amount." },
    // Blood Count
    vp_bite: { n: "Bloodthirsty Bite", d: "Deal 20 damage and heal yourself 5 HP." },
    vp_bat: { n: "Blood Bats", d: "Lose 10 HP to summon 2 Bats (6 HP; they auto-attack for 4 damage at the end of the round)." },
    vp_burst: { n: "Bloodletting Burst", d: "Lose 40 HP to summon 5 Bats." },
    // Inquisitor
    jd_equal: { n: "Rule: Equal Shares", d: "Predict. This round, every single hit over 15 damage is reduced to 5. (Affects both sides.)" },
    jd_torture: { n: "Slow Torment", d: "The target gains 1 stack of Fatigue (lose 5 HP per stack at the end of the round, for 3 rounds). If the target played no cards this round, apply 2 stacks." },
    jd_ban: { n: "Decree: Confiscate", d: "Predict. Cancel the enemy's highest-AP card this round; its AP is not refunded." },
    // Phantom Wraith
    gh_stealth: { n: "Invisibility", d: "Can't be targeted this round, and dodge one physical attack (including area attacks)." },
    gh_soul: { n: "Soul Scare", d: "Deal 10 soul damage (true damage, ignores Shield and defense)." },
    gh_orb: { n: "Doom Orb", d: "Deal 22 explosive damage." },
    // Ink Hexer
    ink_fist: { n: "Hex Fist", d: "Deal 20 damage. Gain 1 Ink Mark." },
    ink_trap: { n: "Hex Trap", d: "Spend 1 Ink Mark. Set a trap on an enemy square; an enemy standing there at the end of the round, or moved onto it, takes 25 damage." },
    ink_jail: { n: "Black Hair Cage", d: "Spend 1 Ink Mark. Lock an enemy square; the enemy in it is caged: it can play at most 1 AP of cards per round (its unplayed cards costing more than 1 AP this round fail) until it makes an attack, at most until the end of next round." },
    // Dog-loving Summoner
    dg_shield: { n: "Don't Hurt the Doggy!", d: "Give the Puppy a 25-point Shield." },
    dg_tears: { n: "Puppy Eyes", d: "The target gets Pity: its next damage is reduced by 50%." },
    dg_mine: { n: "That's Mine!", d: "The Puppy becomes a Big Dog (for 2 rounds); its end-of-round attack becomes 25 damage and applies Bleed." },
    // Shadow Assassin
    as_stab: { n: "Stab", d: "Deal 20 damage. If the target has no Shield, it's a critical hit for 35 damage." },
    as_hide: { n: "Shadow Hide", d: "Slip into the shadows; can't be targeted this round (area attacks still hit)." },
    as_clone: { n: "Shadow Decoy", d: "Summon a shadow clone that fully blocks one lethal attack for you (lasts until triggered)." },
    // One-Punch Winner
    op_train: { n: "Daily Training", d: "Restore 10 HP to yourself and remove all debuffs." },
    op_punch: { n: "Normal Punch", d: "Deal 20 physical damage, ignoring Shield." },
    op_serious: { n: "Serious Punch", d: "Wind-up: this card resolves at speed -2. Deal 150 true damage. Misses if the target used a dodge or invincibility card this round." },
    // Pirate King
    pk_hook: { n: "Ruthless Hook", d: "Deal 18 damage and apply Pull (drags a back-row target into the front row)." },
    pk_crew: { n: "Pirates, Attack!", d: "Summon 2 Ghost Pirates (20 HP; deal 8 damage to the enemy front row at the end of the round)." },
    pk_ship: { n: "Summon Ghost Ship", d: "Summon a Ghost Ship (50 HP) in the back row. At the end of the round, all enemies take +10% damage next round." },
    // Star Critic
    mc_review: { n: "Review", d: "Randomly get 1-3 stars: damage +20%/+60%/+100% next round. 3 stars also gives a 10-point Shield (kept until next round)." },
    mc_wheel: { n: "Flying Wheels", d: "Throw 1-5 wheels: always at least 1, and each extra wheel has a 45% chance. Wheel N deals 4x(2^N-1) damage: 4, 12, 28, 60, 124." },
    mc_boom: { n: "Tire Blowout", d: "Deal 35 piercing damage to all enemies (ignores Shield). Afterward, permanently lose Tire Armor; once the tire blows, this can't be used again (once per match)." },
    // Table Tennis Ace
    pp_cut: { n: "Backspin Block", d: "Gain a 30-point temporary Shield. If it blocks an attack, you get a 100% critical hit next round." },
    pp_drive: { n: "Topspin Drive", d: "Deal 14 damage. If tied in speed with the opponent, this card resolves first." },
    pp_smash: { n: "Smash", d: "Deal 25 damage." },
    // Saint Aileen
    st_shield: { n: "Holy Shield", d: "Give an ally a 20-point Shield." },
    st_chant: { n: "Chant", d: "Restore 12 HP to the whole team and grant 10% damage reduction (2 rounds)." },
    st_light: { n: "Holy Light", d: "Deal 15 damage to all enemies and Stun 1 of them (cancels its unplayed cards; the opponent gets AP -1 next round). (Pick one: this or Holy Spear.)" },
    st_spear: { n: "Holy Spear", d: "Deal 32 single-target damage. (Pick one: this or Holy Light.)" },
    // Little Dragon
    dr_fly: { n: "Fly", d: "Take to the air; immune to all melee attacks this round." },
    dr_ram: { n: "Headbutt", d: "Deal 30 damage. If Flying this round, deal 15 extra damage." },
    dr_breath: { n: "Dragon Breath", d: "Deal 25 damage and leave fire on the target's square for 2 rounds (units in the square at the end of the round, or moved into it, take 10 damage)." },
    // Minions
    mn_guard: { n: "Hold the Line", d: "Give yourself or a front-row ally a 15-point Shield." },
    mn_star: { n: "Star Guidance", d: "A chosen ally hero gets speed +3 next round." },
    mn_shoot: { n: "Precise Shot", d: "Deal 15 true damage that ignores Shield." },
    mn_sac: { n: "Dark Transfer", d: "Lose 20 HP; your team gets AP +1 this round (can go over the 3 AP cap)." },
    // Basic actions (every unit)
    x_guard: { n: "Guard", d: "Take half damage this round (except true damage)." },
    x_move: { n: "Swap", d: "Swap front/back places with the ally (or empty square) in the same column; resolves at your own speed, so you only get out of the way of attackers slower than you. The Mountain Giant can't swap or be swapped; units with Freeze or Stun can't swap." },
  },

  statuses: {
    burn: { n: "Burn", d: "Take 6 true damage at the end of the round." },
    chill: { n: "Chill", d: "Speed -1 per stack; at 3 stacks it turns into Freeze." },
    frozen: { n: "Freeze", d: "Frozen: unplayed cards this round fail; AP -1 next round." },
    stun: { n: "Stun", d: "Stunned: unplayed cards this round fail; AP -1 next round." },
    slow: { n: "Slow", d: "Speed -2." },
    vuln: { n: "Vulnerable", d: "Takes more damage." },
    curse: { n: "Curse", d: "+10% damage taken per stack." },
    fatigue: { n: "Fatigue", d: "Lose 5 HP per stack at the end of the round." },
    pity: { n: "Pity", d: "Next damage dealt -50%." },
    bleed: { n: "Bleed", d: "Lose 5 HP at the end of the round." },
    jail: { n: "Black Hair Cage", d: "Can play at most 1 AP of cards per round; breaks when it attacks, at most until the end of next round." },
    empower: { n: "Empower", d: "Next damage +5." },
    enchant: { n: "Enchant", d: "Each card deals +10 damage this round." },
    hungry: { n: "I'm Hungry", d: "Your team's next attack card deals x2 damage." },
    review: { n: "Review", d: "Damage boosted this round." },
    star: { n: "Star Sign", d: "Speed +3." },
    focus: { n: "Inner Focus", d: "Speed +2." },
    iceAura: { n: "Frost Aura", d: "Melee attackers take 5 damage back and get Slow." },
    waterDodge: { n: "Water Flow", d: "Dodge the next damage." },
    clone: { n: "Shadow Decoy", d: "Blocks one lethal attack." },
    reduce: { n: "Blessing", d: "Damage taken -10%." },
    critNext: { n: "Sure Crit", d: "Attacks this round are guaranteed critical hits." },
    dodge1: { n: "Sidestep", d: "Dodge the first attack from an enemy slower than you." },
    stealth: { n: "Invisibility", d: "Can't be targeted; dodges one physical attack." },
    hidden: { n: "Shadow Hide", d: "Can't be targeted." },
    flying: { n: "Flying", d: "Immune to melee attacks." },
    taunt: { n: "Taunt", d: "Draws enemy single-target attacks; their damage is halved." },
    food: { n: "I Love Food", d: "The first damage taken is negated and heals 2x." },
    cut: { n: "Backspin Block", d: "If the Shield blocks an attack, guaranteed critical hit next round." },
    ironfist: { n: "Iron Fist", d: "Defense +5 this round." },
    crazy: { n: "Frenzy", d: "Each card deals +10 damage this round." },
    wing: { n: "First Strike", d: "Each card deals +10 damage this round." },
    annoy: { n: "Pester", d: "Attacks deal x5 damage this round." },
    guard: { n: "Guard", d: "Take half damage this round (except true damage)." },
    bigdog: { n: "Big Dog", d: "Attacks for 25 damage and Bleed at the end of the round." },
  },

  summons: {
    bat: "Bat",
    gpirate: "Ghost Pirate",
    ship: "Ghost Ship",
    statue: "Little Statue",
    dog: "Puppy",
    bigdog: "Big Dog",
  },

  factions: { '王室': "Royal", '北境': "North", '深淵': "Abyss", '聖堂': "Sanctum", '小兵': "Minion" },

  types: { melee: "Melee", ranged: "Ranged", mixed: "Hybrid", support: "Support" },

  roles: {
    '坦克': "Tank", '爆發': "Burst", '範圍': "Area", '控制': "Control", '干擾': "Disrupt", '輔助': "Support",
    '治療': "Healer", '召喚': "Summoner", '刺客': "Assassin", '速度': "Speed", '持續傷害': "Damage over time", '資源': "Resource",
  },
}});
