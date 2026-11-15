import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
export const DATA = path.join(ROOT, 'data');
export const SOURCES = path.join(DATA, 'sources');

export const readJson = (p) => JSON.parse(fs.readFileSync(p, 'utf8'));
export const writeJson = (p, obj, pretty = false) =>
  fs.writeFileSync(p, pretty ? JSON.stringify(obj, null, 2) : JSON.stringify(obj));

// Même normalisation que le générateur yugipedia-db de YGO Tools
export const normalize = (s) => String(s || '').toLowerCase().normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]/g, '');
