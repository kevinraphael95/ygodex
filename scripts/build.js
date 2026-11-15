// Fusionne cards-db + yugipedia-db + card-notes -> data/pokedex-db.json
import path from 'node:path';
import { DATA, SOURCES, readJson, writeJson, normalize } from './common.js';

const cards = readJson(path.join(SOURCES, 'cards-db.json'));
const yugi = readJson(path.join(SOURCES, 'yugipedia-db.json'));
const notes = readJson(path.join(DATA, 'card-notes.json'));

// yugipedia-db : une carte apparaît sous plusieurs clés -> on dédoublonne par titre de page,
// puis on indexe par passcode (quand il existe) et par nom EN normalisé (sinon).
const unique = new Map();
for (const c of Object.values(yugi)) if (c) unique.set(c.title || c.en || c.fr, c);
const byId = new Map(), byName = new Map();
for (const c of unique.values()) {
  if (c.id) byId.set(String(c.id), c);
  for (const n of [c.en, c.title]) { const k = normalize(n); if (k && !byName.has(k)) byName.set(k, c); }
}

const split = (s) => (s ? String(s).split(/\s*[;\n]\s*/).map((x) => x.trim()).filter(Boolean) : []);
let joinedById = 0, joinedByName = 0;
const out = {};

for (const [id, c] of Object.entries(cards)) {
  let y = byId.get(id);
  if (y) joinedById++;
  else { y = byName.get(normalize(c.en)); if (y) joinedByName++; }
  const n = notes[id] || {};
  out[id] = {
    id,
    name: { en: c.en, fr: c.fr || null },          // repli EN géré côté site
    type: c.type, frameType: c.frameType, race: c.race, attribute: c.attribute,
    atk: c.atk, def: c.def, level: c.level, linkval: c.linkval, scale: c.scale,
    linkmarkers: c.linkmarkers,
    desc: { en: c.desc_en, fr: c.desc_fr || null },
    img: c.img_cropped, imgFull: c.img_full,
    // Données Yugipedia
    archetype: y?.archetype || null,
    archseries: split(y?.archseries),
    supports: split(y?.supports),
    antiSupports: split(y?.anti_supports),
    supportsArchetypes: split(y?.supports_archetypes),
    effectTypes: split(y?.effect_types),
    ocgStatus: y?.ocg_status || null,
    tcgStatus: y?.tcg_status || null,
    // Tes notes
    tags: n.tags || [],
    howToPlay: n.how_to_play || null,
    synergies: n.synergies || [],
    combos: n.combos || [],
    noted: Boolean(notes[id]),
  };
}

const result = { generated: new Date().toISOString(), count: Object.keys(out).length, cards: out };
writeJson(path.join(DATA, 'pokedex-db.json'), result);
console.log(`✅ pokedex-db.json : ${result.count} cartes`);
console.log(`   jointure Yugipedia : ${joinedById} par passcode, ${joinedByName} par nom, ${result.count - joinedById - joinedByName} sans correspondance`);
console.log(`   ${Object.keys(notes).length} fiche(s) de notes appliquée(s)`);
