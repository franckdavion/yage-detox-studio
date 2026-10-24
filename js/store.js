// État persistant (localStorage) : profil, séance perso, livres importés, réglages.
import { POSTURES, PROGRAMMES, LIVRE } from "./data/yin-yoga.js";
import { LIVRE_CHAISE, POSTURES_CHAISE, PROGRAMMES_CHAISE } from "./data/chaise.js";

const KEY = "yds.state.v1";
const defaults = {
  contraintes: [],          // ids de CONTRAINTES
  maSeance: [],             // [{ id, duree }]
  livres: [],               // livres importés : { id, titre, style, mode, postures[] }
  voix: { active: true, vitesse: 0.92, voiceURI: "" },
  souffle: { inspire: 4, expire: 6 },
  ia: { cle: "", modele: "claude-sonnet-5-5" },
  lecteurVisuel: "personnage", // "personnage" | "photo"
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
// Livres intégrés à l'application (non supprimables) + livres importés
export const BUILTIN_BOOKS = [baseBook, chaiseBook];

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
  return [...PROGRAMMES, ...PROGRAMMES_CHAISE, ...imported];
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

// --- Ma séance ---
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
