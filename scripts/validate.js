// Vérifie card-notes.json : passcodes, tags autorisés, synergies, combos.
import path from 'node:path';
import { DATA, SOURCES, readJson } from './common.js';

const cards = readJson(path.join(SOURCES, 'cards-db.json'));
const notes = readJson(path.join(DATA, 'card-notes.json'));
const tagsDef = readJson(path.join(DATA, 'tags.json'));
const allowed = new Set(Object.values(tagsDef).flat());

const errors = [];
const err = (id, msg) => errors.push(`[${id}${cards[id] ? ' ' + cards[id].en : ''}] ${msg}`);
const isList = (v) => Array.isArray(v);

for (const [id, n] of Object.entries(notes)) {
  if (!cards[id]) { err(id, 'passcode absent de cards-db.json'); continue; }
  if (n.tags !== undefined) {
    if (!isList(n.tags)) err(id, '"tags" doit être une liste');
    else for (const t of n.tags) if (!allowed.has(t)) err(id, `tag inconnu : "${t}" (à ajouter dans tags.json ?)`);
  }
  if (n.how_to_play !== undefined && typeof n.how_to_play !== 'string') err(id, '"how_to_play" doit être du texte');
  if (n.synergies !== undefined) {
    if (!isList(n.synergies)) err(id, '"synergies" doit être une liste de passcodes');
    else for (const s of n.synergies) if (!cards[s]) err(id, `synergie inconnue : ${s}`);
  }
  if (n.combos !== undefined) {
    if (!isList(n.combos)) err(id, '"combos" doit être une liste');
    else n.combos.forEach((c, i) => {
      if (!c.title) err(id, `combo #${i + 1} sans titre`);
      if (!isList(c.steps) || !c.steps.length) err(id, `combo #${i + 1} : "steps" vide ou invalide`);
      for (const s of c.cards || []) if (!cards[s]) err(id, `combo #${i + 1} : carte inconnue ${s}`);
    });
  }
}

if (errors.length) {
  console.error(`❌ ${errors.length} erreur(s) :\n` + errors.map((e) => '  - ' + e).join('\n'));
  process.exit(1);
}
console.log(`✅ ${Object.keys(notes).length} fiche(s) de notes valides.`);
