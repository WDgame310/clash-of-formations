// 每個角色的繪圖提示詞（給 AI 繪圖工具或畫師用），以及卡片上的英文副標。
// 風格參考：日系／韓系手遊角色立繪（全身、動態姿勢、厚塗賽璐璐、發光特效、白底）。
window.GAME = window.GAME || {};
GAME.ART_PROMPTS = (function () {
  const STYLE = 'anime gacha game character splash art, full body, dynamic action pose, high quality cel shading with soft painterly highlights, crisp clean line art, intricate detailed costume, vibrant glowing magic effects and motion streaks, plain pure white background, single character centered, no text, no logo, no watermark, no frame';
  const NEGATIVE = 'text, watermark, logo, signature, frame, border, card, multiple characters, cropped body, background scenery, blurry, lowres, extra fingers, deformed hands, bad anatomy';
  const PALETTE = {
    '王室': 'royal palette of crimson, gold and white',
    '北境': 'northern palette of icy blue, steel and white fur',
    '深淵': 'abyssal palette of deep purple, black and crimson, eerie atmosphere',
    '聖堂': 'holy palette of white, gold and sky blue, radiant light',
    '小兵': 'practical muted colors with one accent color',
  };
  const H = {
    swordsman: { en: 'Solar Blade', d: 'young male swordsman of the sun god, spiky golden hair, sharp amber eyes, white and gold armored long coat with a sun crest, drawing a long katana wreathed in blazing sunfire, a glowing sun sigil on the back of his hand, iaido draw pose' },
    princess: { en: 'Vermilion Princess', d: 'proud young princess archer, long vermilion twin tails, small golden tiara, smug confident smile, red and gold royal battle dress with armored bodice, golden longbow drawn with a flaming arrow, swirling fire embers' },
    icequeen: { en: 'Frost Sovereign', d: 'elegant ice queen, long flowing pale blue hair, crystalline ice crown, cold calm gaze, white and blue royal gown with frost-crystal shoulder pieces, one palm thrust forward releasing a snowstorm, ice spikes and snowflakes swirling' },
    wuxing: { en: 'Five Elements Sage', d: 'cool martial arts sage, long black hair tied back, flowing taoist robe in five colors, yin-yang emblem, five glowing elemental orbs (metal, wood, water, fire, earth) orbiting him, one hand in a mudra, the other holding a jade talisman' },
    hawk: { en: 'Royal Hawk', d: 'majestic giant royal hawk in golden feathered armor, wings fully spread, razor feather blades glowing, flames trailing from the wing tips, fierce golden eyes, diving attack pose' },
    giant: { en: 'Mountain Giant', d: 'colossal muscular northern giant, rugged face with a braided beard, rocky stone-like skin patches, heavy white fur cloak and iron bracers, huge clenched fist cracking the air with shockwaves, debris flying, low angle heroic pose' },
    icecap: { en: 'Glacier Commander', d: 'stern female knight commander, short white hair with a scar on the cheek, heavy ice-blue plate armor with fur trim, glacial halberd in one hand and a frost shield, a ring of swirling frost crystals around her' },
    golem: { en: 'Wandering Golem', d: 'ancient stone golem guardian with glowing blue runes carved into its body, mossy cracked stone plates, massive stone fists, three small floating stone statue minions orbiting it' },
    monk: { en: 'Rockbreaker Monk', d: 'muscular young monk martial artist, shaved head, wooden prayer beads, bandaged fists, torn orange and grey monk robe tied at the waist, mid flurry of punches shattering boulders, rock fragments and impact rings' },
    smith: { en: 'Forge Artisan', d: 'cheerful young blacksmith girl, messy brown hair with goggles on her head, leather apron over a work outfit, giant glowing forge hammer over her shoulder, sparks and floating enchanted weapons around her' },
    fish: { en: 'Salted Fish', d: 'lazy sleepy young man wearing an oversized hoodie shaped like a giant salted fish, half-closed eyes and a smug grin, holding a dried fish like a sword, purple curse marks and debuff runes swirling around him, comedic but cool' },
    eater: { en: 'Pesky Devourer', d: 'mischievous gluttonous monster girl with a wide toothy grin and long tongue, short purple hair, oversized jacket, a huge abyssal fanged maw opening on her hood, holding a giant drumstick, playful annoying pose' },
    vampire: { en: 'Blood Count', d: 'aristocratic vampire nobleman, slicked silver-white hair, crimson eyes, black and red high-collar coat with a cape, swarm of bats bursting from his cape, blood magic swirling from his clawed hand' },
    judge: { en: 'Inquisitor', d: 'stern inquisitor in long black and gold judicial robes, blindfold over the eyes, golden scales of justice floating beside, a heavy gavel in hand, golden chains and law sigils glowing around' },
    ghost: { en: 'Phantom Wraith', d: 'ethereal ghost girl with translucent pale body fading into mist, long white hair floating, hollow glowing cyan eyes, tattered shroud, blue soul flames orbiting her, half invisible' },
    inkmage: { en: 'Ink Hexer', d: 'mysterious ink sorceress in a black and violet hanfu, long black hair with a hairpin, giant calligraphy brush as a weapon, splashes of black ink forming chains, cages and glowing sigils around her' },
    dogger: { en: 'Dog-loving Summoner', d: 'cheerful girl summoner with a ponytail and paw-print hoodie, hugging a fluffy shiba puppy, behind her a huge spectral wolf version of the puppy glowing, magic summoning circle under her feet' },
    assassin: { en: 'Shadow Assassin', d: 'masked shadow assassin, dark hooded outfit with crimson scarf, twin curved daggers, crouching lunge pose, several shadow clones splitting off behind him, purple smoke' },
    onepunch: { en: 'One-Punch Winner', d: 'bored-looking young martial artist with messy dark hair, plain training tracksuit with rolled sleeves, bandaged fist, throwing a single punch that releases a gigantic shockwave, clouds splitting behind him' },
    pirate: { en: 'Pirate King', d: 'charismatic pirate king, tricorne hat with a skull emblem, long captain coat, iron hook hand swinging a chained grappling hook, spectral ghost ship sails rising behind him, ghostly green flames' },
    michelin: { en: 'Star Critic', d: 'flamboyant food critic chef knight, white chef coat over armor made of stacked rubber wheel rings, three golden stars floating above, throwing spinning wheels that glow, confident gourmet pose' },
    pingpong: { en: 'Table Tennis Ace', d: 'energetic sporty girl table tennis player, short ponytail, sporty jersey and skirt, smashing a glowing ping pong ball with a paddle, speed lines and a fiery ball trail' },
    saint: { en: 'Saint Aileen', d: 'holy maiden saint, long golden hair, gentle eyes, white and gold nun paladin dress with flowing ribbons, halo of light, holding a radiant holy lance, light feathers and healing glow around her' },
    dragon: { en: 'Little Dragon', d: 'small cute but fierce young dragon with red scales and golden horns, wings spread wide while flying, breathing a stream of fire, embers everywhere' },
    m_shield: { en: 'Shield Guard', d: 'heavily armored foot soldier with a full helmet, giant tower shield planted in front, defensive stance, blue protective barrier glowing' },
    m_star: { en: 'Court Stargazer', d: 'young court astrologer in starry navy robes and a pointed hat, holding a brass telescope, constellation lines and stars glowing around' },
    m_gun: { en: 'Street Musketeer', d: 'scrappy street musketeer with a bandana and patched coat, aiming a long flintlock rifle, muzzle flash and smoke' },
    m_cult: { en: 'Abyss Cultist', d: 'hooded abyss cultist in tattered purple robes, face hidden in shadow, holding a black candle with purple flame, dark ritual circle and floating runes' },
  };
  const out = {};
  [...GAME.DATA.heroes, ...GAME.DATA.minions].forEach(h => {
    const x = H[h.id];
    out[h.id] = { en: x.en, prompt: `${STYLE}, ${x.d}, ${PALETTE[h.f]}` };
  });
  out._negative = NEGATIVE;
  out._style = STYLE;
  return out;
})();
