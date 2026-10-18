// fr.data：角色、招式、狀態等法文翻譯（對應 js/data.js；用語依 js/lang/GLOSSARY.md）
GAME.I18N.add('fr', { data: {
  heroes: {
    swordsman: { n: "Lame Solaire", passive: { n: "Concentration", d: "S'il est en seconde ligne et n'a subi aucun dégât cette manche, vitesse +2 à la manche suivante." } },
    princess: { n: "Princesse Vermeille", passive: { n: "Fierté", d: "Ignore le blocage de la première ligne : ses attaques visent librement la première ou la seconde ligne." } },
    icequeen: { n: "Souveraine du Givre", passive: { n: "Zéro absolu", d: "+20 % de dégâts contre les ennemis sous Gel, Ralentissement ou Frisson." } },
    wuxing: { n: "Sage des Cinq Éléments", passive: { n: "Cycle des éléments", d: "Après une carte d'un élément à la manche précédente, les cartes d'un élément « différent » ont +30 % d'effet cette manche." } },
    hawk: { n: "Faucon Royal", passive: { n: "Maîtrise des airs", d: "Ignore le blocage de la première ligne ; immunisé contre les pièges au sol (Piège d'encre noire, feu)." } },
    giant: { n: "Géant des Montagnes", passive: { n: "Inébranlable", d: "Immunisé contre les déplacements (Attraction/Repoussement). Agit toujours en dernier, quelle que soit la vitesse." } },
    icecap: { n: "Commandante des Glaciers", passive: { n: "Solidité", d: "Au début de chaque manche, gagne 5 de Bouclier si elle est en première ligne." } },
    golem: { n: "Golem Errant", passive: { n: "Armure pétrifiée", d: "Pour chaque tranche de 20 % de PV perdus, réduction fixe des dégâts +2." } },
    monk: { n: "Moine Brise-Roc", passive: { n: "Toujours plus fort", d: "Chaque carte qui inflige des dégâts lui donne 2 de défense pour toute la partie (max 6 ; une attaque à plusieurs coups ne compte qu'une fois)." } },
    smith: { n: "Artisane de la Forge", passive: { n: "Feu de forge", d: "En fin de manche, si elle n'a subi aucun dégât cette manche, donne 8 de Bouclier à un allié au hasard (conservé jusqu'à la fin de la manche suivante)." } },
    fish: { n: "Poisson Salé", passive: { n: "Mystère", d: "Chaque effet négatif sur lui réduit de 10 % les dégâts qu'il subit (max -40 %)." } },
    eater: { n: "Dévoreuse Agaçante", passive: { n: "Gouffre sans fond", d: "Ne peut pas être soignée : ne récupère des PV que grâce à ses propres effets." } },
    vampire: { n: "Comte de Sang", passive: { n: "Enfants de la nuit", d: "En fin de manche, chaque chauve-souris alliée en jeu lui rend 1 PV." } },
    judge: { n: "Inquisiteur", passive: { n: "Tribunal", d: "Tant que l'Inquisiteur est en jeu, les coups critiques et les accélérations de toutes les unités sont annulés." } },
    ghost: { n: "Spectre Fantôme", passive: { n: "Néant", d: "S'il n'utilise aucune carte coûtant des PA cette manche, il esquive forcément la première attaque de la manche." } },
    inkmage: { n: "Envoûteuse d'Encre", passive: { n: "Maîtresse des sceaux", d: "Ses pièges ne peuvent pas être détruits et restent en place jusqu'à leur déclenchement." } },
    dogger: { n: "Invocatrice Amie des Chiens", passive: { n: "Chien fidèle", d: "Commence la partie avec un chiot (45 PV, attaque pour 12 dégâts en fin de manche). Les cartes ennemies à cible unique visent le chiot en priorité." } },
    assassin: { n: "Assassin de l'Ombre", passive: { n: "Contournement", d: "Ses attaques ignorent toujours la première ligne et le chiot pour frapper directement la seconde ligne (la première ligne seulement si la seconde est vide)." } },
    onepunch: { n: "Vainqueur en un Coup", passive: { n: "Au-delà des limites", d: "N'a aucune carte de défense. Sous 30 % de PV, sa vitesse passe à 10." } },
    pirate: { n: "Roi des Pirates", passive: { n: "Maître des océans", d: "Tant qu'un vaisseau fantôme allié est en jeu, il est immunisé contre tous les effets négatifs." } },
    michelin: { n: "Critique Étoilé", passive: { n: "Armure de pneus", d: "Dégâts subis -10 % en permanence." } },
    pingpong: { n: "As du Ping-Pong", passive: { n: "Coup de force", d: "Chaque attaque a 25 % de chance de doubler ses dégâts." } },
    saint: { n: "Sainte Aileen", passive: { n: "Pureté sacrée", d: "Dégâts doublés contre les morts-vivants (pirates fantômes, vaisseau fantôme, chauves-souris, petites statues)." } },
    dragon: { n: "Petit Dragon", passive: { n: "Écailles de dragon", d: "Immunisé contre Brûlure." } },
    m_shield: { n: "Porte-Bouclier" },
    m_star: { n: "Astrologue de la Cour" },
    m_gun: { n: "Mousquetaire des Rues" },
    m_cult: { n: "Cultiste des Abysses" },
  },

  cards: {
    // Lame Solaire
    sw_slash: { n: "Entaille", d: "Inflige 15 dégâts physiques." },
    sw_dash: { n: "Pas éclair", d: "Vitesse +15 cette manche. Esquive la première attaque d'un ennemi plus lent que vous. En seconde ligne, il fonce d'abord en première ligne de sa colonne." },
    sw_sun: { n: "Tranche-Soleil", d: "Inflige 25 dégâts et donne la « Marque solaire »." },
    sw_final: { n: "Tranche-Soleil ultime", d: "Nécessite la Marque solaire. Inflige 100 dégâts purs (ignorent Bouclier et défense). La Marque solaire disparaît ensuite." },
    // Princesse Vermeille
    pr_fire: { n: "Flèche enflammée", d: "Inflige 8 dégâts et applique Brûlure (perd 6 PV en fin de manche, pendant 2 manches)." },
    pr_tri: { n: "Triple flèche", d: "Tire 3 flèches de 5 dégâts chacune." },
    pr_crazy: { n: "Tir frénétique", d: "Vitesse +5 et +10 dégâts par carte cette manche. À la manche suivante, vous subissez +20 % de dégâts (Vulnérabilité). Se combine avec les autres tirs de la même manche." },
    pr_blast: { n: "Méga-explosion de flèches", d: "Inflige 25 dégâts à tous les ennemis et leur applique toujours Brûlure." },
    // Souveraine du Givre
    iq_palm: { n: "Paume de neige", d: "Inflige 18 dégâts. La cible gagne 1 cumul de Frisson (vitesse -1 par cumul ; à 3 cumuls, devient Gel)." },
    iq_spike: { n: "Pique de glace", d: "Inflige 20 dégâts. Ne peut viser que la première ligne." },
    iq_blizzard: { n: "Grand blizzard", d: "Inflige 20 dégâts à tous les ennemis et pose un Champ de neige sur leur camp (à la manche suivante, chaque carte ennemie coûte +1 PA)." },
    // Sage des Cinq Éléments
    wx_metal: { n: "Bouclier de métal", d: "[Métal] Gagne 15 de Bouclier. (Au choix avec Soin de terre)" },
    wx_earth: { n: "Soin de terre", d: "[Terre] Rend 15 PV à soi-même. (Au choix avec Bouclier de métal)" },
    wx_wood: { n: "Lianes", d: "[Bois] Inflige 5 dégâts ; l'ennemi a -1 PA à la manche suivante. (Au choix avec Danse de l'eau)" },
    wx_water: { n: "Danse de l'eau", d: "[Eau] Esquive les prochains dégâts subis. (Au choix avec Lianes)" },
    wx_fire: { n: "Frappe de feu", d: "[Feu] Inflige 16 dégâts d'explosion de flammes." },
    // Faucon Royal
    hk_claw: { n: "Serres", d: "Inflige 18 dégâts. (Au choix avec Plume ardente)" },
    hk_flame: { n: "Plume ardente", d: "Des Serres à 2 PA : inflige 15 dégâts et applique Brûlure." },
    hk_dash: { n: "Ruée ailée", d: "Vitesse +8 cette manche. Si vous agissez avant tous les ennemis, +10 dégâts cette manche." },
    hk_elite: { n: "Plumes d'élite", d: "Inflige 30 dégâts purs (ignorent Bouclier et défense)." },
    // Géant des Montagnes
    gt_fist: { n: "Poing géant", d: "Inflige 30 lourds dégâts physiques." },
    gt_taunt: { n: "Provocation", d: "Défense absolue : cette manche, toutes les attaques ennemies à cible unique sont redirigées sur vous, et leurs dégâts sont réduits de moitié." },
    gt_palm: { n: "Paume de la montagne", d: "Inflige 30 dégâts et Repoussement (envoie la cible en seconde ligne ; si elle heurte une unité en seconde ligne, les deux subissent 10 dégâts). Verrouillage : frappe le héros visé où qu'il aille (la Provocation et le Chiot restent prioritaires)." },
    // Commandante des Glaciers
    ic_aura: { n: "Aura de glace", d: "Dure 2 manches. Les ennemis qui vous attaquent en mêlée subissent 5 dégâts renvoyés et Ralentissement." },
    ic_chop: { n: "Taillade", d: "Inflige 10 dégâts. Si la cible a Ralentissement, Gel ou Frisson, les dégâts passent à 20." },
    ic_freeze: { n: "Gel", d: "Inflige 10 dégâts et applique Gel (annule ses cartes pas encore jouées cette manche ; -1 PA à la manche suivante)." },
    // Golem Errant
    gm_slash: { n: "Frappe lourde", d: "Inflige 22 dégâts physiques, sans subir de riposte." },
    gm_wake: { n: "Éveil résonant", d: "Invoque une petite statue (20 PV). Chaque petite statue réduit de 10 % les dégâts que vous subissez." },
    gm_will: { n: "Volonté de pierre", d: "Toutes les petites statues chargent la cible et infligent 12 dégâts chacune, puis se brisent." },
    // Moine Brise-Roc
    mk_iron: { n: "Poing de fer", d: "Inflige 10 dégâts ; défense +5 cette manche." },
    mk_ten: { n: "Rafale de dix poings", d: "Inflige 10 coups de 3 dégâts (30 au total ; la défense la contre facilement)." },
    mk_big: { n: "Poing dévastateur", d: "Inflige 40 dégâts massifs, ignore le Bouclier." },
    // Artisane de la Forge
    sm_forge: { n: "Battre le fer", d: "Inflige 16 dégâts. Vous obtenez Renforcement (prochains dégâts +5)." },
    sm_guard: { n: "Parade forgée", d: "Place un Bouclier de 20 sur un allié choisi." },
    sm_99: { n: "Forge aux 99 coups", d: "Inflige 15 dégâts. Enchante les armes de toute l'équipe (à la manche suivante, +10 dégâts par carte pour toute l'équipe)." },
    // Poisson Salé
    fs_mock: { n: "Moquerie du Poisson Salé", d: "Anticipation. Cette manche, tous les bonus de la cible se changent en Malédiction (+10 % de dégâts subis par cumul)." },
    fs_selfish: { n: "Égoïsme", d: "Attire sur vous tous les effets négatifs de toutes les unités en jeu." },
    fs_iam: { n: "Je suis le Poisson Salé", d: "Pour chaque effet négatif sur vous (compte au moins 1), inflige 25 dégâts purs à tous les ennemis. Retire ensuite tous vos effets négatifs." },
    // Dévoreuse Agaçante
    et_bite: { n: "Grosse bouchée", d: "Inflige 14 dégâts." },
    et_hungry: { n: "J'ai faim !", d: "La prochaine carte d'attaque lancée par votre équipe (n'importe quel personnage) inflige x2 dégâts." },
    et_annoy: { n: "Tu m'énerves !", d: "Anticipation. Choisissez un ennemi : ses attaques lancées cette manche infligent x5 dégâts. Associez-la à [J'adore manger !] pour dévorer ce coup et récupérer des PV !" },
    et_food: { n: "J'adore manger !", d: "Les premiers dégâts subis cette manche sont annulés, et vous récupérez 2 fois leur valeur en PV." },
    // Comte de Sang
    vp_bite: { n: "Morsure sanguinaire", d: "Inflige 20 dégâts et vous rend 5 PV." },
    vp_bat: { n: "Chauves-souris de sang", d: "Vous perdez 10 PV et invoquez 2 chauves-souris (6 PV, attaquent seules en fin de manche pour 4 dégâts)." },
    vp_burst: { n: "Saignée totale", d: "Vous perdez 40 PV et invoquez 5 chauves-souris." },
    // Inquisiteur
    jd_equal: { n: "Règle : Nivellement", d: "Anticipation. Cette manche, tout coup unique de plus de 15 dégâts est réduit à 5. (Pour les deux camps)" },
    jd_torture: { n: "Supplice lent", d: "La cible gagne 1 cumul de Fatigue (perd 5 PV par cumul en fin de manche, pendant 3 manches). Si la cible n'a joué aucune carte cette manche, 2 cumuls." },
    jd_ban: { n: "Interdit : Confiscation", d: "Anticipation. Annule la carte ennemie de cette manche qui coûte le plus de PA, sans rendre les PA." },
    // Spectre Fantôme
    gh_stealth: { n: "Invisibilité", d: "Ne peut pas être ciblé cette manche et esquive une attaque physique (attaques de zone comprises)." },
    gh_soul: { n: "Frayeur spectrale", d: "Inflige 10 dégâts d'âme (dégâts purs, ignorent Bouclier et défense)." },
    gh_orb: { n: "Orbe fatal", d: "Inflige 22 dégâts explosifs." },
    // Envoûteuse d'Encre
    ink_fist: { n: "Poing d'encre noire", d: "Inflige 20 dégâts. Vous gagnez 1 Marque d'encre." },
    ink_trap: { n: "Piège d'encre noire", d: "Consomme 1 Marque d'encre. Pose un piège sur une case ennemie : un ennemi qui s'y trouve en fin de manche, ou qui y est déplacé, subit 25 dégâts." },
    ink_jail: { n: "Prison d'encre", d: "Consomme 1 Marque d'encre. Verrouille une case ennemie : l'ennemi qui s'y trouve est emprisonné et ne peut jouer que 1 PA de cartes par manche (ses cartes pas encore jouées à plus de 1 PA échouent cette manche), jusqu'à sa prochaine attaque et au plus tard jusqu'à la fin de la manche suivante." },
    // Invocatrice Amie des Chiens
    dg_shield: { n: "Touche pas au toutou !", d: "Donne 25 de Bouclier au chiot." },
    dg_tears: { n: "Regard larmoyant", d: "La cible gagne Pitié : ses prochains dégâts infligés sont réduits de 50 %." },
    dg_mine: { n: "C'est à moi !", d: "Le chiot devient un molosse (pendant 2 manches) : son attaque de fin de manche passe à 25 dégâts et applique Saignement." },
    // Assassin de l'Ombre
    as_stab: { n: "Coup de dague", d: "Inflige 20 dégâts. Si la cible n'a pas de Bouclier, coup critique : 35 dégâts." },
    as_hide: { n: "Fondu dans l'ombre", d: "Se cache dans l'ombre : ne peut pas être ciblé cette manche (les attaques de zone touchent quand même)." },
    as_clone: { n: "Pantin d'ombre", d: "Invoque un double d'ombre qui bloque entièrement une attaque mortelle à votre place (reste jusqu'à son déclenchement)." },
    // Vainqueur en un Coup
    op_train: { n: "Entraînement quotidien", d: "Vous rend 10 PV et retire tous vos effets négatifs." },
    op_punch: { n: "Coup de poing normal", d: "Inflige 20 dégâts physiques, ignore le Bouclier." },
    op_serious: { n: "Coup de poing sérieux", d: "Élan : cette carte se résout à vitesse -2. Inflige 150 dégâts purs. Si la cible a utilisé une carte d'esquive ou d'invincibilité cette manche, ce coup échoue." },
    // Roi des Pirates
    pk_hook: { n: "Grappin impitoyable", d: "Inflige 18 dégâts et applique Attraction (tire une cible de seconde ligne en première ligne)." },
    pk_crew: { n: "À l'abordage !", d: "Invoque 2 pirates fantômes (20 PV, infligent 8 dégâts à la première ligne ennemie en fin de manche)." },
    pk_ship: { n: "Appel du vaisseau fantôme", d: "Invoque un vaisseau fantôme (50 PV) en seconde ligne. En fin de manche, tous les ennemis subiront +10 % de dégâts à la manche suivante." },
    // Critique Étoilé
    mc_review: { n: "Critique", d: "Obtient au hasard 1 à 3 étoiles : +20 %/+60 %/+100 % de dégâts à la manche suivante. Avec 3 étoiles, gagne aussi 10 de Bouclier (conservé jusqu'à la manche suivante)." },
    mc_wheel: { n: "Lancer de roues", d: "Lance de 1 à 5 roues : 1 roue garantie, puis 45 % de chance pour chaque roue de plus. La N-ième roue inflige 4x(2^N-1) dégâts : 4, 12, 28, 60, 124." },
    mc_boom: { n: "Pneus éclatés", d: "Inflige 35 dégâts perforants (ignorent le Bouclier) à tous les ennemis. Perd ensuite pour toujours Armure de pneus : une fois les pneus éclatés, la carte ne peut plus servir (une fois par partie)." },
    // As du Ping-Pong
    pp_cut: { n: "Balle coupée", d: "Gagne 30 de Bouclier temporaire. S'il bloque une attaque, coup critique à 100 % à la manche suivante." },
    pp_drive: { n: "Coup lifté", d: "Inflige 14 dégâts. À vitesse égale avec l'adversaire, cette carte se résout en premier." },
    pp_smash: { n: "Smash", d: "Inflige 25 dégâts." },
    // Sainte Aileen
    st_shield: { n: "Bouclier sacré", d: "Donne 20 de Bouclier à un allié." },
    st_chant: { n: "Chant sacré", d: "Rend 12 PV à toute l'équipe et lui donne 10 % de réduction des dégâts (2 manches)." },
    st_light: { n: "Lumière sacrée", d: "Inflige 15 dégâts à tous les ennemis et applique Étourdissement à 1 personnage ennemi (annule ses cartes pas encore jouées ; -1 PA à la manche suivante). (Au choix avec Lance sacrée)" },
    st_spear: { n: "Lance sacrée", d: "Inflige 32 dégâts à une cible. (Au choix avec Lumière sacrée)" },
    // Petit Dragon
    dr_fly: { n: "Vol", d: "S'envole : immunisé contre toutes les attaques de mêlée cette manche." },
    dr_ram: { n: "Coup de tête", d: "Inflige 30 dégâts. Si vous êtes en Vol cette manche, +15 dégâts." },
    dr_breath: { n: "Souffle du dragon", d: "Inflige 25 dégâts et laisse du feu sur la case de la cible pendant 2 manches (les unités sur la case en fin de manche, ou qui y sont déplacées, subissent 10 dégâts)." },
    // Sbires
    mn_guard: { n: "Tenir bon", d: "Donne 15 de Bouclier à soi-même ou à un allié de première ligne." },
    mn_star: { n: "Guidance des étoiles", d: "Le héros allié choisi gagne vitesse +3 à la manche suivante." },
    mn_shoot: { n: "Tir précis", d: "Inflige 15 dégâts purs qui ignorent le Bouclier." },
    mn_sac: { n: "Transfert obscur", d: "Perd 20 PV ; votre équipe gagne +1 PA cette manche (peut dépasser la limite de 3 PA)." },
    // Actions de base (tous les personnages)
    x_guard: { n: "Garde", d: "Les dégâts subis cette manche sont réduits de moitié (sauf les dégâts purs)." },
    x_move: { n: "Permutation", d: "Échange votre place (avant/arrière) avec l'allié de la même colonne, ou avec la case vide ; se résout à votre vitesse : vous n'esquivez que les attaquants plus lents que vous. Le Géant des Montagnes ne peut ni permuter ni être permuté ; impossible de permuter sous Gel ou Étourdissement." },
  },

  statuses: {
    burn: { n: "Brûlure", d: "Subit 6 dégâts purs en fin de manche." },
    chill: { n: "Frisson", d: "Vitesse -1 par cumul ; à 3 cumuls, devient Gel." },
    frozen: { n: "Gel", d: "Gelé : ses cartes pas encore jouées cette manche échouent ; -1 PA à la manche suivante." },
    stun: { n: "Étourdissement", d: "Étourdi : ses cartes pas encore jouées cette manche échouent ; -1 PA à la manche suivante." },
    slow: { n: "Ralentissement", d: "Vitesse -2." },
    vuln: { n: "Vulnérabilité", d: "Subit plus de dégâts." },
    curse: { n: "Malédiction", d: "+10 % de dégâts subis par cumul." },
    fatigue: { n: "Fatigue", d: "Perd 5 PV par cumul en fin de manche." },
    pity: { n: "Pitié", d: "Prochains dégâts infligés -50 %." },
    bleed: { n: "Saignement", d: "Perd 5 PV en fin de manche." },
    jail: { n: "Prison d'encre", d: "1 PA de cartes maximum par manche ; se libère en attaquant, au plus tard à la fin de la manche suivante." },
    empower: { n: "Renforcement", d: "Prochains dégâts +5." },
    enchant: { n: "Enchantement", d: "+10 dégâts par carte cette manche." },
    hungry: { n: "J'ai faim !", d: "La prochaine carte d'attaque de votre équipe inflige x2 dégâts." },
    review: { n: "Critique", d: "Dégâts augmentés cette manche." },
    star: { n: "Guidé par les étoiles", d: "Vitesse +3." },
    focus: { n: "Concentration", d: "Vitesse +2." },
    iceAura: { n: "Aura de glace", d: "Les attaquants en mêlée subissent 5 dégâts renvoyés et Ralentissement." },
    waterDodge: { n: "Danse de l'eau", d: "Esquive les prochains dégâts." },
    clone: { n: "Pantin d'ombre", d: "Bloque une attaque mortelle." },
    reduce: { n: "Protection sacrée", d: "Dégâts subis -10 %." },
    critNext: { n: "Coup critique assuré", d: "Les attaques de cette manche sont toujours des coups critiques." },
    dodge1: { n: "Pas éclair", d: "Esquive la première attaque d'un ennemi plus lent." },
    stealth: { n: "Invisibilité", d: "Ne peut pas être ciblé ; esquive une attaque physique." },
    hidden: { n: "Fondu dans l'ombre", d: "Ne peut pas être ciblé." },
    flying: { n: "Vol", d: "Immunisé contre les attaques de mêlée." },
    taunt: { n: "Provocation", d: "Attire les attaques ennemies à cible unique ; leurs dégâts sont réduits de moitié." },
    food: { n: "J'adore manger !", d: "Les premiers dégâts subis sont annulés et rendent 2 fois leur valeur en PV." },
    cut: { n: "Balle coupée", d: "Si le Bouclier bloque une attaque, coup critique garanti à la manche suivante." },
    ironfist: { n: "Poing de fer", d: "Défense +5 cette manche." },
    crazy: { n: "Frénésie", d: "+10 dégâts par carte cette manche." },
    wing: { n: "Initiative", d: "+10 dégâts par carte cette manche." },
    annoy: { n: "Tu m'énerves !", d: "Dégâts des attaques x5 cette manche." },
    guard: { n: "Garde", d: "Les dégâts subis cette manche sont réduits de moitié (sauf les dégâts purs)." },
    bigdog: { n: "Molosse", d: "Attaque de fin de manche : 25 dégâts et Saignement." },
  },

  summons: {
    bat: "Chauve-souris",
    gpirate: "Pirate fantôme",
    ship: "Vaisseau fantôme",
    statue: "Petite statue",
    dog: "Chiot",
    bigdog: "Molosse",
  },

  factions: { '王室': "Royaume", '北境': "Nord", '深淵': "Abysses", '聖堂': "Sanctuaire", '小兵': "Sbire" },

  types: { melee: "Mêlée", ranged: "Distance", mixed: "Hybride", support: "Soutien" },

  roles: {
    '坦克': "Tank", '爆發': "Burst", '範圍': "Zone", '控制': "Contrôle", '干擾': "Perturbation", '輔助': "Soutien",
    '治療': "Soigneur", '召喚': "Invocateur", '刺客': "Assassin", '速度': "Vitesse", '持續傷害': "Dégâts sur la durée", '資源': "Ressource",
  },
}});
