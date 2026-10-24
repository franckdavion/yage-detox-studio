// État persistant (localStorage) : profil, séance perso, livres importés, réglages.
import { POSTURES, PROGRAMMES, LIVRE } from "./data/yin-yoga.js";
import { LIVRE_CHAISE, POSTURES_CHAISE, PROGRAMMES_CHAISE } from "./data/chaise.js";
import { LIVRE_YEUX, POSTURES_YEUX, PROGRAMMES_YEUX } from "./data/yeux.js";

const KEY = "yds.state.v1";
const defaults = {
  contraintes: [],          // ids de CONTRAINTES
  maSeance: [],             // [{ id, duree }]
  livres: [],               // livres importés : { id, titre, style, mode, postures[] }
  voix: { active: true, vitesse: 0.92, voiceURI: "" },
  souffle: { inspire: 4, expire: 6 },
  ia: { cle: "", modele: "claude-sonnet-5-5" },
  lecteurVisuel: "personnage", // "personnage" | "photo"
  seancesPerso: [],         // séances enregistrées : { id, nom, postures: [{ id, duree }], creeLe, modifieLe }
  edition: null,            // séance en cours de modification dans le créateur : { id, nom }
};

function load() {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? { ...defaults, ...JSON.parse(raw) } : structuredClone(defaults);
  } catch {
    return structuredClone(defaults);
  }
}

export const state = load();

export function save() {
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch (e) {
    console.warn("Sauvegarde impossible", e);
  }
}

// --- Bibliothèque unifiée (livre de base + livres importés) ---
const baseBook = { ...LIVRE, mode: "statique", postures: POSTURES };
const chaiseBook = { ...LIVRE_CHAISE, postures: POSTURES_CHAISE };
const yeuxBook = { ...LIVRE_YEUX, postures: POSTURES_YEUX };
// Livres intégrés à l'application (non supprimables) + livres importés
export const BUILTIN_BOOKS = [baseBook, chaiseBook, yeuxBook];

export function books() {
  return [...BUILTIN_BOOKS, ...state.livres];
}

export function allPostures() {
  return books().flatMap((b) =>
    b.postures.map((p) => ({ ...p, livre: b.id, style: b.style, mode: p.mode || b.mode || "statique" }))
  );
}

export function getPosture(id) {
  return allPostures().find((p) => p.id === id);
}

export function allProgrammes() {
  const imported = state.livres.flatMap((b) => b.programmes || []);
  return [...PROGRAMMES, ...PROGRAMMES_CHAISE, ...PROGRAMMES_YEUX, ...imported];
}

// --- Profil d'adaptabilité ---
export function hasContrainte(id) {
  return state.contraintes.includes(id);
}
export function toggleContrainte(id) {
  const i = state.contraintes.indexOf(id);
  if (i >= 0) state.contraintes.splice(i, 1);
  else state.contraintes.push(id);
  save();
}
// Contraintes du profil pour lesquelles la posture est déconseillée
export function warningsFor(p) {
  return (p.eviter || []).filter((c) => state.contraintes.includes(c));
}
// Conseils d'adaptation correspondant au profil
export function matchedAdaptations(p) {
  return Object.entries(p.adaptations || {}).filter(([c]) => state.contraintes.includes(c));
}

// --- Mes séances enregistrées (persistées dans localStorage avec le reste de l'état) ---
export function savedSeances() {
  return state.seancesPerso;
}
export function getSeance(id) {
  return state.seancesPerso.find((s) => s.id === id);
}
// Enregistre la séance du créateur. Avec un id existant : mise à jour ; sinon : nouvelle séance.
export function saveSeance(nom, id = null) {
  const now = Date.now();
  const postures = state.maSeance.map((s) => ({ id: s.id, duree: s.duree }));
  const existing = id && getSeance(id);
  if (existing) {
    Object.assign(existing, { nom, postures, modifieLe: now });
    save();
    return existing;
  }
  const seance = { id: "s" + now.toString(36), nom, postures, creeLe: now, modifieLe: now };
  state.seancesPerso.unshift(seance);
  save();
  return seance;
}
export function deleteSeance(id) {
  state.seancesPerso = state.seancesPerso.filter((s) => s.id !== id);
  if (state.edition?.id === id) state.edition = null;
  save();
}
export function duplicateSeance(id) {
  const s = getSeance(id);
  if (!s) return null;
  const now = Date.now();
  const copy = { ...structuredClone(s), id: "s" + now.toString(36), nom: `${s.nom} (copie)`, creeLe: now, modifieLe: now };
  state.seancesPerso.splice(state.seancesPerso.indexOf(s) + 1, 0, copy);
  save();
  return copy;
}
// Charge une séance enregistrée dans le créateur pour la modifier
export function editSeance(id) {
  const s = getSeance(id);
  if (!s) return;
  state.maSeance = s.postures.map((p) => ({ ...p }));
  state.edition = { id: s.id, nom: s.nom };
  save();
}
// Postures d'une séance enregistrée (celles d'un livre supprimé sont ignorées)
export function seanceEntries(s) {
  return s.postures.map((x) => ({ posture: getPosture(x.id), duree: x.duree })).filter((e) => e.posture);
}

// --- Ma séance (créateur) ---
export function inSeance(id) {
  return state.maSeance.some((s) => s.id === id);
}
export function toggleSeance(id) {
  const i = state.maSeance.findIndex((s) => s.id === id);
  if (i >= 0) state.maSeance.splice(i, 1);
  else {
    const p = getPosture(id);
    state.maSeance.push({ id, duree: p?.duree || 180 });
  }
  save();
  return i < 0;
}
