// fr.ui：介面文字的法文翻譯（對應 js/lang/zh.ui.js，同一個 key；用語依 js/lang/GLOSSARY.md）
GAME.I18N.add('fr', {
  ui: {
    // ---------- Commun ----------
    doc_title: "Le Choc des Formations",
    close: "Fermer",
    cancel: "Annuler",
    ok: "OK",
    back: "Retour",
    sep_dot: " · ",
    sep_list: ", ",
    p1: "Joueur 1",
    p2: "Joueur 2",
    ai_name: "Ordinateur",
    host_name: "Hôte",
    guest_name: "Challenger",
    art_missing: "Illustration à venir",
    art_failed: "Illustration non chargée",
    btn_codex: "📚 Encyclopédie",
    btn_rules: "📖 Règles",
    btn_log: "📜 Journal de combat",
    btn_home: "🏠 Menu principal",
    sound_on: "🔊 Son : activé",
    sound_off: "🔇 Son : coupé",
    // Installer l'application (sous les boutons de l'accueil) et avis de nouvelle version
    pwa_install: "📲 Installer l'application",
    pwa_ios_hint: "📲 Pour installer : dans Safari, touchez Partager → « Sur l'écran d'accueil »",
    pwa_inapp_hint: "📲 Pour l'installer comme application, ouvrez d'abord cette page dans votre navigateur : menu de cette appli → « Ouvrir dans le navigateur » (Safari sur iPhone, Chrome sur Android), puis suivez l'indication",
    pwa_updated: "Mis à jour vers la dernière version, appliquée à la prochaine ouverture",
    // Phases
    phase_ban: "Bannissement",
    phase_draft: "Choix des héros",
    phase_deploy: "Déploiement secret",
    phase_plan: "Actions secrètes",
    phase_over: "Fin de la partie",
    // Cibles des cartes
    tgt_enemy: "Un ennemi",
    tgt_ally: "Un allié",
    tgt_allyFront: "Soi ou 1re ligne",
    tgt_allyHero: "Héros allié",
    tgt_cell: "Case ennemie",
    tgt_self: "Soi-même",
    // Portée
    rng_melee: "Mêlée",
    rng_ranged: "Distance",
    rng_back: "Contournement",
    // Étiquettes des cartes
    tag_basic: "De base",
    tag_pre: "Anticipation",
    tag_spd: "Vitesse +{n}",
    tag_aoe: "Zone",
    // Règles de placement (quand la mêlée frappe la case) : les cartes à distance, de contournement et à Verrouillage suivent le héros (le contournement n'atteint toujours que la seconde ligne)
    tag_lock: "Verrouillage",
    tag_lock_title: "Suit le héros : frappe la cible même si elle permute",
    // Infobulle Verrouillage des cartes de contournement : elles n'atteignent toujours que la seconde ligne
    tag_lock_title_back: "Suit le héros, mais n'atteint que la seconde ligne : s'il passe en première ligne (et que la seconde ligne n'est pas vide), la carte frappe une autre unité de seconde ligne",
    passive: "Passif [{n}] : {d}",
    row_front: "1re ligne", // étiquette verticale étroite à côté des rangées
    row_back: "2e ligne",
    summon: "Invocation",
    undead: "Mort-vivant",

    // ---------- Accueil ----------
    home_sub: "Jeu de cartes · version numérique",
    home_logo: "<span>Le</span> <span>Choc</span> <span>des</span> <span>Formations</span>",
    home_logo_en: "異陣對決",
    home_p1_name: "Nom du joueur 1",
    home_p2_name: "Nom du joueur 2",
    mode_hotseat: "2 joueurs, 1 appareil",
    mode_ai: "Contre l'ordinateur",
    home_resume: "▶ Reprendre la partie ({info})",
    home_resume_round: "Manche {n}",
    home_resume_online: "▶ Revenir au salon {code}",
    mode_hotseat_b: "1 appareil · 2 joueurs",
    mode_hotseat_s: "Chacun son tour ; un écran indique quand se passer l'appareil pendant les phases secrètes",
    mode_ai_b: "1 appareil · contre l'ordinateur",
    mode_ai_s: "Pour s'entraîner en solo",
    mode_online_b: "2 appareils · en réseau",
    mode_online_s: "Chacun sur son téléphone, sa tablette ou son ordinateur, par Internet",

    // ---------- Règles ----------
    rules_title: "Règles",
    rules_body: `<h2>Conditions de victoire</h2>
      <p>Mettez à 0 les PV de tous les personnages adverses pour gagner. Une partie dure 15 manches au maximum ; à partir de la manche 10 commence le « Combat à mort » : à la fin de chaque manche, toutes les unités subissent 5 dégâts purs. À la fin de la manche 15, le camp qui a le plus haut pourcentage de PV restants gagne.</p>
      <h2>1. Bannissement et choix des héros</h2>
      <p>Le premier joueur est tiré au sort. Le premier joueur bannit 1 héros, puis le second joueur en bannit 1 (à découvert). On choisit ensuite les héros dans l'ordre <b>1-2-2-2-2-1</b> : le premier joueur en choisit 1 → le second en choisit 2 d'affilée → le premier 2 d'affilée → le second 2 d'affilée → le premier 2 d'affilée → le second choisit le dernier. Chaque joueur a ainsi 5 héros. Les sbires n'ont pas besoin d'être choisis : ils peuvent toujours être déployés.</p>
      <h2>2. Déploiement secret</h2>
      <p>Parmi vos 5 héros et les sbires, placez en secret vos unités sur votre terrain de 2x2 (2 cases en première ligne, 2 cases en seconde ligne). Coût total de 10 maximum, 4 unités maximum. Les deux camps révèlent leur formation en même temps.</p>
      <h2>3. Actions secrètes</h2>
      <p>Chaque manche, vous avez 3 PA (jusqu'à 1 PA non dépensé est gardé pour la manche suivante ; voir « Mettre de côté des PA » ci-dessous). Touchez un de vos personnages, choisissez une carte, puis une cible. Un personnage peut jouer plusieurs cartes différentes dans la même manche (par exemple « Pas éclair + Entaille »), mais chaque carte ne peut être jouée qu'une fois par manche. Quand les deux joueurs ont validé, tout est révélé en même temps.</p>
      <p><b>Vitesse :</b> vitesse du personnage + bonus de vitesse de la carte = vitesse totale ; le plus rapide agit en premier. À vitesse égale, les actions se résolvent en même temps (un personnage mis K.O. par un adversaire aussi rapide agit quand même). Si le plus lent est mis K.O. ou subit Gel/Étourdissement avant d'agir, sa carte échoue et les PA ne sont pas rendus.</p>
      <p>Les <b>cartes d'Anticipation et de défense</b> (marquées « Anticipation » : Bouclier, esquive, Provocation, Interdit…) s'appliquent avant toutes les attaques.</p>
      <h2>Des règles pour plus de stratégie</h2>
      <ul>
        <li>⏳ <b>Inutilisable deux manches de suite</b> : sauf les cartes marquées « De base », une carte jouée doit se reposer à la manche suivante (une carte confisquée ou interrompue avant d'agir ne compte pas). Les ⏳ de l'adversaire sont visibles aussi : vous pouvez deviner ce qu'il ne pourra pas jouer cette manche.</li>
        <li>🔰 <b>Garde</b> (tous les personnages, 1 PA, Anticipation) : les dégâts subis cette manche sont réduits de moitié (sauf les dégâts purs).</li>
        <li>🔄 <b>Permutation</b> (tous les personnages, 1 PA) : échange sa place avant/arrière avec la case de la même colonne. Pratique pour esquiver la mêlée ou cacher un attaquant en seconde ligne. La Permutation se résout dans l'ordre de vitesse : il faut être plus rapide que l'attaquant pour lui échapper (voir les « Règles de placement » ci-dessous). Le Géant des Montagnes ne peut ni permuter ni être permuté ; impossible de permuter sous Gel ou Étourdissement.</li>
        <li>💰 <b>Mettre de côté des PA</b> : jusqu'à 1 PA non dépensé est gardé pour la manche suivante (4 PA maximum). Pratique pour jouer une grosse carte à 3 PA + une carte à 1 PA dans la même manche.</li>
        <li>📊 <b>Ordre d'action</b> : au milieu de l'écran de choix des actions, l'ordre d'action prévu s'affiche et se met à jour dès que vous choisissez une carte qui donne de la vitesse.</li>
      </ul>
      <h2>Portée des attaques</h2>
      <p>La <b>mêlée</b> ne peut viser que la première ligne ennemie ; la seconde ligne ne peut être visée qu'une fois toute la première ligne K.O. La <b>distance</b> peut viser n'importe quelle position. Le <b>contournement</b> (Assassin de l'Ombre) vise d'abord la seconde ligne. Les invocations ne bloquent pas le passage, mais peuvent être attaquées. Quand l'Invocatrice Amie des Chiens est en jeu, les cartes ennemies à cible unique sont attirées par le chiot (sauf celles de l'Assassin de l'Ombre).</p>
      <h2>Règles de placement (version numérique)</h2>
      <ol>
        <li><b>La mêlée se joue en première ligne</b> : quand une carte de mêlée se résout, son utilisateur doit être en première ligne, sinon elle échoue (les PA sont quand même dépensés). Un personnage en seconde ligne peut d'abord permuter, puis jouer une carte de mêlée dans la même manche.</li>
        <li><b>La mêlée frappe la case</b> : si la cible est permutée par son propre camp, celui qui prend sa place encaisse le coup ; si personne ne la remplace, le coup frappe un autre personnage de première ligne.</li>
        <li><b>Les attaques à distance suivent le héros</b> (verrouillage total) ; les cartes à Verrouillage du Géant des Montagnes aussi. Les attaques de contournement ne frappent que la seconde ligne : si la cible passe en première ligne, elles frappent quelqu'un d'autre en seconde ligne.</li>
        <li><b>Les permutations suivent la vitesse</b> : une Permutation se résout dans l'ordre de vitesse ; il faut être plus rapide que l'attaquant pour lui échapper. À vitesse égale, c'est trop tard.</li>
        <li>La Provocation et le Chiot restent prioritaires.</li>
      </ol>
      <p>Pour s'en souvenir : « Les poings en première ligne ; les poings frappent la case, les flèches suivent le héros ; seul le plus rapide s'échappe. »</p>
      <h2>Mots-clés</h2>
      <ul>
        <li>🛡 <b>Bouclier</b> : absorbe les dégâts avant les PV ; disparaît en fin de manche (sauf mention contraire).</li>
        <li>🔥 <b>Brûlure</b> : subit 6 dégâts purs en fin de manche, pendant 2 manches.</li>
        <li>🧊 <b>Gel / 💫 Étourdissement</b> : toutes les cartes pas encore jouées cette manche échouent ; le camp touché a -1 PA à la manche suivante.</li>
        <li>🐌 <b>Ralentissement</b> : vitesse -2. ❄️ <b>Frisson</b> : vitesse -1 par cumul ; à 3 cumuls, devient Gel.</li>
        <li><b>Attraction / Repoussement</b> : tire la cible en première ligne / la renvoie en seconde ligne (elle échange sa place avec la case de la même colonne).</li>
        <li><b>Dégâts purs</b> : ignorent Bouclier, défense et réduction des dégâts. <b>Perforant</b> : ignore le Bouclier.</li>
        <li>😩 <b>Fatigue</b> : perd 5 PV par cumul en fin de manche. 🌀 <b>Malédiction</b> : +10 % de dégâts subis par cumul. 💔 <b>Vulnérabilité</b> : subit plus de dégâts.</li>
      </ul>
      <h2>Fin de manche</h2>
      <p>Attaques automatiques des invocations → Brûlure/Fatigue/Saignement/pièges → Combat à mort → effets passifs → les Boucliers disparaissent.</p>
      <p class="muted">Cette version numérique suit le livret de règles et les cartes personnages du jeu physique. Les points flous des cartes (par exemple « tout le terrain » compte comme « tous les ennemis », et Gel n'empêche pas d'agir à la manche suivante : il retire 1 PA) sont directement précisés dans le texte des cartes.</p>`,

    // ---------- Salon en réseau ----------
    lobby_title: "2 appareils · partie en réseau",
    lobby_checking: "Vérification des modes de connexion…",
    lobby_noserver_title: "Lancez d'abord le serveur de connexion",
    // {mode} = texte du bouton « 2 appareils · en réseau » de l'accueil
    lobby_noserver_steps: `<li>Sur l'ordinateur, ouvrez le dossier du jeu et double-cliquez sur <b>start-server.bat</b> (Python doit être installé).</li>
          <li>Une fenêtre noire affiche une adresse, par exemple <code>http://192.168.1.23:8000/</code>.</li>
          <li>Connectez les deux appareils au même Wi-Fi et ouvrez cette adresse dans le navigateur.</li>
          <li>Choisissez à nouveau « {mode} ».</li>`,
    lobby_firewall: "Si Windows affiche une alerte du pare-feu, cliquez sur « Autoriser l'accès ».",
    lobby_public_warn: "Le Wi-Fi de cet ordinateur est en réseau <b>public</b> : le pare-feu Windows bloque les autres appareils. Allez dans <b>Paramètres → Réseau et Internet → Wi-Fi → ce réseau</b> et choisissez le profil <b>Privé</b>, ou dans <b>Sécurité Windows → Pare-feu et protection du réseau → Autoriser une application via le pare-feu</b>, cochez <b>Privé</b> pour python.exe.",
    lobby_retry: "Réessayer",
    lobby_your_name: "Votre nom",
    lobby_create: "Créer un salon",
    lobby_create_sub: "Obtenez un code à saisir sur l'autre appareil",
    lobby_or: "ou",
    lobby_code_ph: "Code",
    lobby_join: "Rejoindre",
    lobby_open_url: "Sur l'autre appareil, ouvrez :",
    lobby_room_code: "Code du salon",
    lobby_host_hint: "Sur l'autre appareil, choisissez « {join} » et saisissez ce code",
    lobby_joining: "Connexion au salon…",
    lobby_other_url: "Adresse pour l'autre appareil :",
    lobby_waiting: "Connecté, en attente de l'adversaire…",
    lobby_retrying: "Connexion perdue, nouvelle tentative…",
    lobby_leave: "Quitter le salon",
    toast_no_room: "Ce salon n'existe pas ou a expiré",
    toast_send_fail: "Échec de l'envoi, vérifiez la connexion",
    toast_create_fail: "Impossible de créer le salon : {err}",
    toast_code4: "Saisissez un code de salon à 4 caractères",
    toast_spectator: "Impossible de lancer une partie en tant que spectateur",

    // ---------- Jeu en ligne (js/p2p.js : connexion directe via PeerJS, sans serveur de jeu) ----------
    net_pick_p2p: "🌐 Internet",
    net_pick_lan: "📶 Même Wi-Fi",
    net_pick_p2p_d: "Jouez de n'importe où avec une connexion Internet",
    net_pick_lan_d: "Via le serveur de jeu de cet ordinateur ; pas besoin d'Internet",
    lobby_create_sub_p2p: "Obtenez un code de salon à envoyer à l'autre joueur",
    // {mode} = le bouton « 2 appareils » de l'accueil, {join} = le bouton « Rejoindre »
    lobby_host_hint_p2p: "Demandez à l'autre joueur d'ouvrir l'adresse ci-dessous sur son appareil, de choisir « {mode} » → « {join} » et de saisir ce code",
    lobby_p2p_note: "Le jeu en ligne utilise le service gratuit PeerJS (0.peerjs.com) pour que les deux appareils se trouvent ; les coups passent ensuite directement de l'un à l'autre (ou par le serveur relais de PeerJS si la connexion directe est impossible). PeerJS voit les adresses IP des deux appareils. Certains réseaux d'entreprise, d'école ou d'opérateur mobile bloquent ce type de connexion.",
    lobby_lan_title: "Pas d'Internet ? Utilisez un ordinateur du même Wi-Fi comme serveur de jeu",
    p2p_connected: "Connecté à l'hôte, démarrage…",
    // État de la connexion et raisons d'une déconnexion (codes renvoyés par js/p2p.js)
    p2p_err_connecting: "Connexion…",
    p2p_err_load: "Impossible de charger le module en ligne. Vérifiez la connexion Internet et réessayez.",
    p2p_err_unsupported: "Ce navigateur ne permet pas le jeu en ligne (WebRTC non pris en charge). Utilisez une version récente de Chrome, Edge, Safari ou Firefox.",
    p2p_err_signal: "Impossible de joindre le service de mise en relation (0.peerjs.com). Vérifiez que l'appareil est connecté à Internet ; le service peut aussi être momentanément indisponible. Nouvel essai automatique.",
    p2p_err_host_away: "L'appareil de l'hôte est hors ligne pour l'instant (écran verrouillé, autre appli ouverte ou rechargement). La connexion reprendra automatiquement à son retour.",
    p2p_err_p2p: "Les deux appareils n'arrivent pas à se connecter directement : un réseau d'entreprise, d'école ou d'opérateur mobile le bloque peut-être. Essayez de mettre les deux en Wi-Fi (ou l'un en données mobiles) et de désactiver tout VPN. Nouvel essai automatique.",
    p2p_err_id_taken: "Ce salon est encore ouvert dans un autre onglet ou sur un autre appareil. Fermez-le d'abord ; nouvel essai automatique.",
    toast_no_room_p2p: "Salon introuvable : vérifiez le code et demandez à l'hôte de rester sur l'écran du salon",
    // Vérification de la version et de l'état de la partie entre les deux appareils ({host} / {guest} / {v} = code de version à 8 caractères)
    lobby_version: "Version du jeu {v}",
    ver_old: "ancienne version",
    ver_mismatch: "Les deux appareils n'ont pas la même version du jeu (hôte {host}, joueur qui rejoint {guest}) : la partie ne peut pas commencer. Sur les deux appareils, fermez complètement l'appli puis rouvrez-la (ou rechargez la page) pour la mettre à jour ; ensuite l'hôte crée un nouveau salon et l'autre joueur le rejoint avec le nouveau code.",
    ver_updated: "Cet appareil a mis à jour le jeu après le début de la partie : elle ne peut pas continuer (les deux appareils calculeraient des résultats différents). Créez un nouveau salon.",
    desync_warn: "Les deux appareils ont calculé des états de partie différents ({when}) : la partie ne peut pas continuer. Mettez à jour les deux appareils (fermez puis rouvrez l'appli), puis créez un nouveau salon.",
    desync_at_start: "au début",
    desync_at_round: "après la manche {n}",
    toast_game_blocked: "Cette partie ne peut pas continuer ; créez un nouveau salon",
    // ---------- Tutoriel débutant (une partie contre l'ordinateur, avec une carte de coach qui explique chaque étape) ----------
    mode_tut_b: "Tutoriel débutant",
    mode_tut_s: "Première fois ? Jouez une partie contre l'ordinateur avec un coach",
    tut_title: "Tutoriel",
    tut_next: "Suivant",
    tut_skip: "Arrêter le tutoriel",
    tut_done: "Terminer le tutoriel",
    tut_bye: "Tutoriel terminé, amusez-vous bien ! Vous pouvez le relancer à tout moment depuis l'accueil",
    tut_intro: "Place à une <b>partie complète</b> ! Elle compte quatre étapes : <b>Bannissement → Sélection → Placement secret → Manches</b>. Vous êtes le camp bleu en bas ; mettez K.O. tous les personnages adverses pour gagner.",
    tut_ban: "<b>Bannissement</b> : chaque joueur retire 1 héros, que personne ne pourra choisir pendant cette partie. Touchez une carte pour voir ses coups, puis « 🚫 Bannir ». Conseil : bannissez l'adversaire que vous craignez le plus.",
    tut_draft: "<b>Sélection</b> : choisissez des héros à tour de rôle, dans l'ordre affiché en haut, 5 chacun. Le nombre en haut à gauche d'une carte est son <b>coût</b> : votre équipe sur le terrain coûte au plus 10, on prend donc souvent une vedette à 5 et quelques héros à 3.",
    tut_draft2: "Regardez le type sous chaque carte : un héros de <b>mêlée</b> doit être en 1re ligne pour attaquer et ne touche que la 1re ligne ; un héros à <b>distance</b> touche n'importe où. Mettez des héros de mêlée solides devant et des tireurs derrière, jusqu'à en avoir 5.",
    tut_deploy: "<b>Placement secret</b> : touchez les personnages de la liste pour les placer. Les deux cases du haut sont la <b>1re ligne</b>, celles du bas la <b>2e ligne</b>. Coût total 10 au maximum, 4 personnages au plus. La 1re ligne protège la 2e : placez les plus solides devant ; les sbires à 1 peuvent toujours compléter. Touchez « Valider » quand c'est prêt.",
    tut_plan: "<b>Coups</b> : vous avez <b>3 PA</b> par manche (les points en haut). Touchez un de vos personnages (la rangée bleue en bas), choisissez une carte (le nombre est son coût en PA), puis touchez une cible. Vous pouvez préparer des coups pour plusieurs personnages.",
    tut_speed: "La <b>barre d'ordre</b> au milieu : les plus rapides agissent en premier. Si un ennemi plus rapide vous met K.O. d'abord, votre carte échoue ; à vitesse égale, tout se résout au même instant. Agir en premier compte !",
    tut_submit: "Chaque personnage a aussi deux actions de base : 🔰 <b>Garde</b> (divise par deux les dégâts subis) et 🔄 <b>Permutation</b> (échange 1re et 2e ligne). Quand c'est prêt, touchez « Valider » : les deux camps sont révélés en même temps.",
    tut_playback: "<b>Résolution</b> : les coups se jouent un par un, dans l'ordre de vitesse. Utilisez ▶ / ⏭ pour avancer, ou « Passer » pour voir directement le résultat, puis le bouton du bas pour revenir aux coups.",
    tut_round2: "Manche 2. Les cartes marquées ⏳ sont en <b>récupération</b> : une carte qui n'est pas « de base » ne peut pas servir deux manches de suite. Jusqu'à 1 PA non dépensé est gardé de la manche précédente. Après avoir choisi un personnage, touchez ⓘ pour voir ses états.",
    tut_finish: "Vous connaissez les bases ! Terminez cette partie. Ensuite, consultez « {rules} » et « {codex} » depuis l'accueil pour découvrir chaque héros, ou utilisez « {online} » pour jouer avec un ami.",
    // Bataille d'entraînement (js/tutorial.js) : {giant}{princess}{shield}{gun} = noms des personnages, {fire}{fist}{guard}{shoot}{crazy}{tri} = noms des cartes ; chiffres vérifiés par tests/tutorial.test.js
    tut_title_p: "Tutoriel · Entraînement",
    tut_match: "Jouer une partie complète",
    tut_p_intro: "D'abord, une <b>bataille d'entraînement</b> ! Votre {giant} (1re ligne) et votre {princess} (2e ligne) affrontent le {shield} (1re ligne) et le {gun} (2e ligne) de l'ordinateur. Mettez-les K.O. tous les deux pour gagner. Sur chaque personnage, ❤ indique les PV et ⚡ la vitesse : <b>les plus rapides agissent en premier</b>.",
    tut_p_r1: "<b>Manche 1</b> : vous avez 3 PA par manche. ① La {princess} utilise [{fire}] sur le {gun} (1 PA : 8 dégâts + brûlure). Elle attaque <b>à distance</b> : elle atteint la 2e ligne. ② Le {giant} utilise [{fist}] sur le {shield} (1 PA : 30 dégâts). Il combat <b>en mêlée</b> : il ne touche que la 1re ligne. Le PA restant est gardé pour la manche suivante.",
    tut_p_pb: "Les coups des deux camps sont révélés en même temps, puis résolus <b>dans l'ordre de vitesse</b>, une carte à la fois. À la fin, touchez le bouton du bas : le coach vous expliquera ce qui s'est passé.",
    tut_p_why1: "<b>Ce qui vient de se passer</b> : ① Les cartes d'Anticipation passent en premier : le {shield} a utilisé [{guard}] pour se donner 15 de bouclier. ② Puis chacun agit selon sa vitesse : {princess} (5) → {gun} (3) → {giant} (1). ③ [{fire}] a infligé 8 : {gun} 30 → 22, et il brûle. ④ [{shoot}] inflige des <b>dégâts purs</b> (ignorent bouclier et défense) : {princess} 90 → 75. ⑤ [{fist}] a infligé 30, mais le <b>bouclier a d'abord absorbé</b> 15 : {shield} 40 → 25. ⑥ En fin de manche, la <b>brûlure</b> inflige encore 6 : {gun} 22 → 16.",
    tut_p_r2: "<b>Manche 2</b> : [{fire}] affiche ⏳, elle se repose cette manche (une carte qui n'est pas « de base » ne peut pas servir deux manches de suite). Le {gun} n'a plus que 16 PV et une vitesse de 3 : <b>mettez-le K.O. avant qu'il agisse, et sa carte échoue</b> ! ① La {princess} utilise d'abord [{crazy}] (vitesse +5 et +10 dégâts sur chaque carte cette manche) ② puis [{tri}] sur le {gun} ③ Le {giant} utilise de nouveau [{fist}] sur le {shield}. Cela fait 3 PA, et vous en avez 4 (1 gardé de la manche précédente).",
    tut_p_why2: "<b>Ce qui vient de se passer</b> : la {princess} est passée à une vitesse de 10 et a agi en premier. [{tri}] : première flèche 5 + 10 = 15, deuxième flèche 5. Le {gun} est tombé avant d'agir : <b>sa carte a échoué</b> et la {princess} n'a subi aucun dégât. [{guard}] a de nouveau bloqué 15 : {shield} 25 → 10. Le prix à payer : [{crazy}] fait subir à la {princess} 20 % de dégâts en plus à la manche suivante.",
    tut_p_r3: "<b>Manche 3</b> : il ne reste que le {shield} (10 PV), mais il se protège de 15 de bouclier à chaque manche. <b>Retirez le bouclier avec votre personnage rapide, puis achevez avec le lent</b> : ① la {princess} (vitesse 5) utilise [{fire}] sur le {shield} ② le {giant} (vitesse 1) utilise [{fist}] sur le {shield}.",
    tut_p_done: "<b>Vous avez gagné !</b> [{guard}] : 15 de bouclier → [{fire}] inflige 8 au bouclier (il en reste 7) → [{fist}] inflige 30 : le bouclier en bloque 7 et le {shield} subit 23 dégâts et tombe. Vous avez appris les PA, l'ordre de vitesse, l'Anticipation, les boucliers, les dégâts purs, la brûlure, la récupération, et l'intérêt de frapper le premier. Ensuite, jouez une <b>partie complète</b> (bannissement, sélection, placement) avec le coach.",
    tut_p_do_unit: "Touchez {unit} pour utiliser [{card}]",
    tut_p_do_card: "Touchez [{card}]",
    tut_p_do_target: "Touchez la cible : {unit}",
    tut_p_do_submit: "Tout est prêt : touchez « Valider »",
    tut_p_do_extra: "Il y a un coup en trop : touchez ✕ pour le retirer. Pendant l'entraînement, suivez les coups du coach",
    tut_p_do_cancel: "Ce n'est pas la bonne carte : touchez « Annuler »",
    tut_p_wrong: "Pendant l'entraînement, suivez les coups indiqués par le coach",
    tut_more: "Détails",
    tut_less: "Masquer les détails",

    // ---------- Barre de titre ----------
    tb_round: " · Manche {n}/{max}",
    tb_resolve: "Manche {n} · Résolution",
    net_ok: "Connecté",
    net_bad: "Connexion perdue",

    // ---------- Écran de passage de l'appareil ----------
    cover_ban: "Bannissez 1 héros en secret",
    cover_deploy: "Déploiement secret",
    cover_plan: "Manche {n} · Actions secrètes",
    cover_hand: "Passez l'appareil à {p}",
    cover_nopeek: "{p}, interdit de regarder !",
    cover_start: "Je suis {p} : commencer",

    // ---------- Bannissement / choix ----------
    os_ban_short: "✕",
    os_ban: "Bannir",
    os_pick: "Choisir",
    os_title: "{act} · {p}",
    os_title_hero: "{act} · {p} : {hero}",
    ban_turn: "À {p} de <b class=\"red\">bannir</b> 1 héros",
    ban_wait: "{p} choisit un héros à bannir",
    ban_hint: "Le premier joueur ({first}) bannit d'abord, puis le second joueur ({second}) ; un héros banni ne peut pas être choisi pendant la partie",
    draft_turn: "À {p} de choisir",
    draft_multi: " ({n} d'affilée)",
    draft_wait: "{p} est en train de choisir",
    draft_progress: "Choix {n} / {total} · Bannis : {banned}",
    draft_first: " (premier joueur)",
    ht_banned: "Banni",
    draft_footer: "Touchez un héros pour voir toutes ses compétences. Les sbires (coût 1) n'ont pas besoin d'être choisis : ils sont toujours disponibles au déploiement.",
    modal_ban: "🚫 Bannir {hero}",
    modal_pick: "✅ {p} choisit {hero}",

    // ---------- Déploiement ----------
    deploy_done_wait: "Déploiement terminé, en attente de l'adversaire",
    deploy_title: "{p} : déploiement secret",
    deploy_rule: "Coût total ≤ {cost}, {units} unités maximum",
    deploy_enemy_side: "▲ L'ennemi est de ce côté ▲",
    deploy_cost: "Coût <b>{n}</b>/{max}",
    deploy_units: "Unités <b>{n}</b>/{max}",
    deploy_hint: "Touchez un personnage ci-dessous pour le placer ; touchez une case occupée puis une autre case pour les échanger. Les attaques de mêlée doivent d'abord viser la première ligne.",
    deploy_clear: "Vider",
    deploy_submit: "Valider",
    opp_pool: "Héros adverses :",
    toast_max_units: "{n} unités maximum",
    toast_cost_over: "Le coût dépasserait {n}",
    // Règles de placement (quand la mêlée doit être en première ligne) : limite et alertes du déploiement ; {giant} = nom du Géant
    toast_giant_front: "Le {giant} ne peut aller qu'en première ligne (il ne peut pas permuter)",
    deploy_warn_giant_back: "Un personnage de mêlée juste derrière le {giant} ne pourra pas passer en première ligne tant que le {giant} est debout : il ne pourra pas attaquer",
    deploy_warn_melee_many: "Plus de héros de mêlée que de cases en première ligne : celui en trop devra d'abord permuter pour attaquer",

    // ---------- Terrain ----------
    dead: "K.O.",
    snow: "❄️ Champ de neige",
    st_next_round: " (manche suivante)",
    st_sunmark: "Marque solaire",
    st_ink: "Marque d'encre",
    st_def: "Défense",
    st_cd_title: "En récupération : {list}",
    fx_miss: "Esquive",
    bubble_card: "[{card}]",
    bubble_simul: "⚡ Même instant",

    // ---------- Choix des actions ----------
    why_cant: "Inutilisable pour le moment",
    why_used: "Déjà choisie",
    why_group: "Une seule des deux",
    why_cd: "⏳ Jouée la manche précédente : au repos cette manche",
    why_ap: "PA insuffisants",
    why_notgt: "Aucune cible",
    tl_cell: "Case ennemie {slot}",
    tl_all: "Tous les ennemis",
    tl_self: "Soi-même",
    ob_last: "Dernier",
    ob_title: "Ordre d'action (Anticipation en premier ; ? = bonus de vitesse ennemis inconnus)",
    plan_sending: "Envoi en cours",
    plan_ai_thinking: "L'ordinateur réfléchit",
    plan_wait: "Actions validées, en attente de l'adversaire",
    plan_opp_ready: "Adversaire prêt ✓",
    plan_tgt_unit: "🎯 Touchez un personnage <b>lumineux</b> sur le terrain comme cible de [{card}]",
    plan_tgt_cell: "🎯 Touchez une case <b>lumineuse</b> sur le terrain comme cible de [{card}]",
    // Règles de placement : rappel au choix d'une cible de mêlée (la mêlée normale frappe la case ; le Verrouillage suit le héros)
    plan_square_hint: "La mêlée frappe la case : si la cible permute, celui qui prend sa place encaisse le coup.",
    plan_lock_hint: "Le Verrouillage suit le héros choisi : permuter ne le sauvera pas (la Provocation et le Chiot restent prioritaires).",
    // Les permutations suivent la vitesse : {fast} mêlées ennemies plus lentes (à temps) ; {slow} les autres (? = cartes de vitesse possibles)
    swap_hint: "🔄 {unit} vitesse {spd} : à temps → {fast} ; trop tard → {slow}",
    // Unité de seconde ligne qui permute vers l'avant, allié {mate} devant : plus rapide = prend sa case et encaisse le coup à sa place ; trop tard = {mate} est touché
    swap_hint_in: "🔄 {unit} vitesse {spd} : prend la place de {mate} et encaisse le coup → {fast} ; trop tard, {mate} est touché → {slow}",
    // noWhiff, personne dans la même colonne : personne ne prend la case et l'unité reste une cible valide → la Permutation n'esquive pas
    swap_hint_stuck: "🔄 {unit} vitesse {spd} : personne ne prend sa case, la Permutation n'esquive pas → {slow}",
    // Ajouté aux lignes ci-dessus : les cartes à Verrouillage (Géant) frappent leur cible d'origine quelle que soit la vitesse
    swap_hint_lock: " ; Verrouillage, frappe quand même sa cible → {list}",
    // Quand une carte ennemie se résout à une autre vitesse que le personnage (ex. une charge), son nom est ajouté
    swap_foe_card: "{unit} ({card})",
    // Un personnage en seconde ligne permute puis joue une mêlée alors qu'un ennemi plus rapide a une carte de Gel/Étourdissement
    plan_interrupt: "peut être interrompu",
    plan_interrupt_title: "Ennemis plus rapides avec Gel/Étourdissement : {list}",
    // Affiché sous la carte Permutation quand les permutations suivent la vitesse
    swap_speed_note: "🔄 Règles de placement : la Permutation se résout dans l'ordre de vitesse (et non avant toutes les attaques).",
    plan_basic_actions: "Actions de base (tous les personnages)",
    plan_hint: "👆 Touchez <b>un de vos personnages</b> pour choisir ses cartes. Vous pouvez dépenser tous vos PA sur un seul personnage ou les répartir entre plusieurs.",
    plan_chip: "{icon} {unit} [{card}] → {target} <b>{ap} PA</b>",
    ap_frac: "{n}/{max} PA",
    plan_saved: "dont 1 PA mis de côté",
    plan_bank: "reste {n} → 1 PA mis de côté",
    plan_snow: "❄️ Champ de neige : +1 PA par carte",
    plan_clear: "Effacer",
    plan_submit: "Valider ({ap} PA)",
    plan_rest: "Passer la manche",
    last_log: "📜 Journal de la manche précédente",
    toast_pick_glow: "Touchez une cible lumineuse",
    confirm_rest: "Ne jouer aucune carte cette manche (repos) ?",

    // ---------- Résolution de la manche ----------
    card_back: "異",
    reveal_rest: "Repos",
    reveal_title: "Révélation !",
    pb_reveal_cap: "Les deux camps retournent leurs cartes…",
    pb_result: "Voir le résultat ▶",
    pb_next_round: "Manche suivante ▶",
    pb_prev: "Précédent",
    pb_toggle: "Pause/Lecture",
    pb_next: "Suivant",
    pb_speed: "Vitesse",
    pb_skip: "Passer",
    pb_log_title: "📜 Journal de la manche",

    // ---------- Fin ----------
    over_draw: "🤝 Match nul",
    over_win: "🏆 {p} gagne !",
    over_you_win: "🏆 Vous avez gagné !",
    over_you_lose: "💔 Vous avez perdu…",
    over_rematch: "Rejouer",

    // ---------- Fiche du personnage (fenêtre) ----------
    st_left_next: " (actif à la manche suivante)",
    st_left_n: " (encore {n} manches)",
    st_left_now: " (cette manche)",
    st_line: "{i} <b>{n}</b>{extra} : {d}<span class=\"muted\">{left}</span>",
    live_sunmark: "☀️ <b>Marque solaire</b> : {card} disponible",
    live_ink: "🖋 <b>Marque d'encre</b> x{n}",
    live_def: "🪨 <b>Défense</b> {n} : réduit les dégâts de chaque coup reçu",
    live_notire: "Armure de pneus perdue",
    live_cd: "⏳ <b>En récupération</b> : {list} (inutilisable deux manches de suite)",
    live_none: "Aucun statut",
    // Invocations : {golem} Golem Errant, {card} Volonté de pierre, {big} Molosse, {bleed} Saignement
    sm_desc_bat: "En fin de manche, attaque un ennemi au hasard et inflige 4 dégâts.",
    sm_desc_gpirate: "En fin de manche, attaque la première ligne ennemie et inflige 8 dégâts.",
    sm_desc_ship: "En fin de manche, tous les ennemis subiront +10 % de dégâts à la manche suivante.",
    sm_desc_statue: "Chacune réduit de 10 % les dégâts subis par {golem} ; {card} les fait charger.",
    sm_desc_dog: "En fin de manche, attaque la première ligne ennemie pour 12 dégâts ({big} : 25 dégâts + {bleed}). Les cartes ennemies à cible unique le visent en priorité.",

    // ---------- Menu de la partie ----------
    menu_surrender: "🏳️ Abandonner",
    menu_autosave: " (sauvegarde auto)",
    log_title: "Journal de combat",
    confirm_surrender: "Voulez-vous vraiment abandonner ?",

    // ---------- Encyclopédie ----------
    cx_title: "Encyclopédie",
    cx_placeholder: "Chercher un nom, une carte ou un mot-clé (ex. : Gel, dégâts purs, invocation, tank)",
    cx_tab_heroes: "🃏 Personnages",
    cx_tab_kw: "📖 Mots-clés",
    cx_all_f: "Toutes factions",
    cx_all_t: "Tous types",
    cx_all_c: "Tous coûts",
    cx_cost: "Coût {n}",
    cx_all_r: "Tous rôles",
    cx_count: "{n} personnage(s) · touchez une carte pour voir compétences, forces, faiblesses et combos",
    cx_count_q: "{n} personnage(s) pour « {q} » · touchez une carte pour voir compétences, forces, faiblesses et combos",
    cx_none: "Aucun personnage trouvé",
    cx_no_kw: "Aucun mot-clé trouvé",
    cx_wr: "{pct} % de victoires",
    cx_strong: "✅ Fort contre (avantage)",
    cx_weak: "⚠️ Faible contre (prudence)",
    cx_combos: "🤝 Combos",
    cx_how: "Tactique : {how}",
    // Mots-clés (nom kw_<id>, description kw_<id>_d).
    // Mêlée / Distance / Contournement / Anticipation / Zone / De base reprennent rng_ et tag_ ; Étourdissement vient des statuts ; Garde / Permutation viennent des actions de base.
    kw_shield: "Bouclier",
    kw_shield_d: "Absorbe les dégâts avant les PV ; disparaît en fin de manche (sauf mention contraire).",
    kw_true: "Dégâts purs",
    kw_true_d: "Ignorent Bouclier, défense et réduction des dégâts.",
    kw_pierce: "Perforant",
    kw_pierce_d: "Ignore le Bouclier, mais la défense et la réduction des dégâts s'appliquent.",
    kw_melee_d: "Ne peut viser que la première ligne ennemie ; la seconde ligne seulement quand toute la première ligne est K.O.",
    kw_ranged_d: "Peut viser n'importe quelle position.",
    kw_back_d: "Vise d'abord la seconde ligne, en ignorant la première ligne et le chiot.",
    kw_pre_d: "S'applique avant toutes les attaques (Bouclier, esquive, Provocation, Interdit…).",
    kw_aoe_d: "Touche toutes les unités ennemies (invocations comprises).",
    kw_summon: "Invocation",
    kw_summon_d: "Les invocations ne bloquent pas le passage et ne comptent pas pour la victoire, mais elles peuvent être attaquées.",
    kw_summon_m: 'invoqu', // mots à chercher dans les textes des cartes (Invoque, Invocation…)
    kw_pull: "Attraction",
    kw_pull_d: "Tire une cible de seconde ligne en première ligne (elle échange sa place avec la case de la même colonne).",
    kw_knock: "Repoussement",
    kw_knock_d: "Envoie une cible de première ligne en seconde ligne (si elle heurte une unité, les deux subissent des dégâts).",
    kw_stun_d: "Toutes les cartes pas encore jouées cette manche échouent ; le camp touché a -1 PA à la manche suivante.",
    kw_cd: "Inutilisable deux manches de suite",
    kw_cd_d: "Sauf les cartes « De base », une carte jouée doit se reposer à la manche suivante (elle redevient jouable la manche d'après).",
    kw_basic_d: "Attaque de base de chaque personnage : utilisable à chaque manche, sans récupération.",
    kw_guard_d: "Pour tous les personnages : 1 PA, les dégâts subis cette manche sont réduits de moitié (sauf les dégâts purs).",
    kw_swap_d: "Pour tous les personnages : 1 PA, échange sa place avant/arrière avec la case de la même colonne. Normalement avant les attaques ; avec les règles de placement, dans l'ordre de vitesse.",
    kw_lock_d: "Règles de placement : la carte suit le héros choisi au lieu de frapper une case (la Provocation et le Chiot restent prioritaires ; le Chiot n'attire pas les cartes de contournement). Les cartes à distance et les cartes à Verrouillage du Géant des Montagnes le frappent où qu'il aille ; les cartes de contournement n'atteignent toujours que la seconde ligne : si la cible passe en première ligne (et que la seconde ligne n'est pas vide), elles frappent une autre unité de seconde ligne. La mêlée normale, elle, frappe la case.",
    kw_lock_m: "verrouillage",
    kw_bank: "Mettre de côté des PA",
    kw_bank_d: "Jusqu'à 1 PA non dépensé est gardé pour la manche suivante (4 PA maximum).",
    // ---------- Importation des illustrations (art/import.html, usage local uniquement) ----------
    imp_title: "Importation des illustrations",
    imp_h1: "Importer les illustrations des personnages",
    imp_step1: "Cliquez sur « Copier le prompt » à côté d'un personnage et collez-le dans votre outil de dessin IA (Midjourney, Stable Diffusion, ChatGPT, Gemini…), ou donnez-le à un illustrateur comme référence. Idéalement : <b>format portrait, en pied, fond blanc</b>.",
    imp_step2: "<b>Glissez les images terminées sur cette page</b> (plusieurs à la fois si vous voulez). Nommez chaque fichier d'après le code ou le nom du personnage (par ex. <code>princess.png</code>, <code>Princesse Vermeille.jpg</code>) et il sera associé automatiquement ; vous pouvez aussi déposer une image sur la case d'un personnage, ou cliquer sur « Choisir une image ».",
    imp_step3: "La page <b>supprime le fond blanc et recadre</b> l'image automatiquement. Dans l'éditeur, <b>cliquez sur le visage du personnage</b> (le portrait rond du champ de bataille sera centré là), réglez le zoom du portrait, puis cliquez sur « Enregistrer ».",
    imp_style: "Style commun (déjà inclus dans chaque prompt)",
    imp_neg: "Prompt négatif (pour Stable Diffusion et outils similaires)",
    imp_copy_neg: "Copier le prompt négatif",
    imp_copy_all: "Copier les prompts de tous les personnages",
    imp_back: "← Retour au jeu",
    imp_drop: "Relâchez pour importer les images",
    imp_has: "✓ Illustration présente",
    imp_copy: "Copier le prompt",
    imp_pick: "Choisir une image",
    imp_edit: "Ajuster le portrait",
    imp_del: "Supprimer",
    imp_del_confirm: "Supprimer l'illustration de ce personnage ?",
    imp_read_fail: "Impossible de lire l'image",
    imp_face_hint: "Cliquez sur le <b>visage</b> du personnage pour centrer le portrait (cercle rouge). Si le fond n'est pas entièrement supprimé, réglez « Tolérance du détourage » à droite.",
    imp_preview: "Aperçu du portrait en combat",
    imp_zoom: "Zoom du portrait : {n}",
    imp_rb: "Détourage automatique (fond blanc)",
    imp_tol: "Tolérance du détourage : {n}",
    imp_holes: "Supprimer aussi les zones blanches fermées (par ex. à l'intérieur d'une corde d'arc)",
    imp_save: "Enregistrer",
    imp_no_server: "Cette page n'a pas été ouverte via start-server.bat et ne peut pas enregistrer directement dans le jeu : « Enregistrer » télécharge le PNG et manifest.js. Placez-les dans les dossiers art/heroes et art.",
    imp_save_fail: "Échec de l'enregistrement : {err}",
    imp_saved: "Illustration de {name} enregistrée",
    imp_downloaded: "PNG et manifest.js téléchargés",
    imp_unknown: "Personnage non reconnu : déposez l'image sur la case du personnage, ou renommez le fichier (par ex. princess.png)",
    imp_bulk: "{ok} image(s) importée(s){miss}. Cliquez sur « Ajuster le portrait » pour affiner la position du visage.",
    imp_bulk_miss: " ; {n} sans personnage correspondant : {files}",
    imp_copied: "Copié",
    imp_copy_fail: "Copie automatique impossible ; sélectionnez le texte à la main",
    imp_copied_all: "Tous les prompts ont été copiés",
    imp_copy_fail_all: "Copie automatique impossible",
    imp_prompt_head: "[{name}]",
    imp_srv_ok: "✓ Connecté au serveur : « Enregistrer » enregistre directement dans le jeu.",
    imp_srv_remote: "⚠ On ne peut enregistrer dans le jeu que sur l'ordinateur qui fait tourner le serveur (http://localhost:8000/art/import.html).",
    imp_srv_none: "⚠ Aucun serveur détecté : double-cliquez sur <b>start-server.bat</b>, puis ouvrez <a href=\"http://localhost:8000/art/import.html\">http://localhost:8000/art/import.html</a>. Vous pouvez aussi continuer ici ; l'enregistrement téléchargera alors les fichiers.",
    // ---------- Mode d'aide, Mes découvertes (notes) ----------
    hints_label: "Aides de l'encyclopédie",
    hints_guided: "📖 Guidé",
    hints_challenge: "🎯 Défi",
    hints_guided_d: "L'encyclopédie et le draft affichent forces, faiblesses, combos et conseils.",
    hints_challenge_d: "Forces, combos et conseils sont cachés : à vous de les découvrir en jouant !",
    cx_hidden: "🎯 Mode Défi : forces, faiblesses, combos et conseils sont cachés. Découvrez-les vous-même et notez-les dans « Mes découvertes » ci-dessous !",
    cx_tab_notes: "📝 Mes découvertes",
    notes_h: "📝 Mes découvertes",
    notes_add: "+ Nouvelle découverte",
    notes_add_hero: "+ Noter une découverte sur {hero}",
    notes_local: "Les notes sont enregistrées uniquement dans le navigateur de cet appareil.",
    notes_empty: "Aucune note pour l'instant. Quand vous trouvez un combo efficace ou qui contre qui, notez-le !",
    notes_none_q: "Aucune note pour « {q} »",
    notes_untitled: "(Sans titre)",
    note_new: "Nouvelle découverte",
    note_edit_t: "Modifier la découverte",
    note_title: "Titre",
    note_title_ph: "ex. : chaîne de Gel, explosion du Poisson Salé",
    note_heroes: "Personnages concernés (touchez les portraits, {n} max.)",
    note_heroes_none: "Aucun personnage",
    note_text: "Contenu",
    note_text_ph: "Comment les associer, quand le jouer, pourquoi ça marche, à quoi faire attention…",
    note_save: "Enregistrer",
    note_edit: "✏️ Modifier",
    note_del: "🗑 Supprimer",
    confirm_note_del: "Supprimer cette note ?",
    toast_note_saved: "Enregistré dans Mes découvertes",
    toast_note_deleted: "Supprimé",
    toast_note_empty: "Ajoutez d'abord un titre ou un texte",
    toast_note_max: "{n} personnages maximum",
  },
});
