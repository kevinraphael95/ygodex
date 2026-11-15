// Télécharge les bases générées par YGO Tools (une seule source de vérité).
import fs from 'node:fs';
import path from 'node:path';
import { SOURCES } from './common.js';

const REPO = 'kevinraphael95/ygo_outil_fr';   // <- dépôt YGO Tools
const BRANCH = 'main';
const FILES = ['cards-db.json', 'yugipedia-db.json'];

fs.mkdirSync(SOURCES, { recursive: true });
for (const f of FILES) {
  const url = `https://raw.githubusercontent.com/${REPO}/${BRANCH}/data/${f}`;
  process.stdout.write(`↓ ${f} ... `);
  const res = await fetch(url);
  if (!res.ok) { console.error(`HTTP ${res.status} (${url})`); process.exit(1); }
  const text = await res.text();
  JSON.parse(text); // vérifie que c'est du JSON valide
  fs.writeFileSync(path.join(SOURCES, f), text);
  console.log(`${(text.length / 1048576).toFixed(1)} Mo`);
}
