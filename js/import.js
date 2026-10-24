// Moteur d'ingestion universel : un PDF ou des photos → postures structurées via l'API Claude (vision).
// L'appel part directement du navigateur avec la clé saisie dans le profil (stockée localement).
// Pour un usage public, remplacer API_URL par un petit proxy serverless qui garde la clé côté serveur.
import { state, save } from "./store.js";

const API_URL = "https://api.anthropic.com/v1/messages";

// Comportement du lecteur selon le style détecté
export const STYLE_MODES = {
  yin: "statique",
  restauratif: "statique",
  hatha: "flux",
  vinyasa: "flux",
  ashtanga: "flux",
  power: "flux",
  kundalini: "flux",
  autre: "statique",
};

const PROMPT = `Tu es un expert en pédagogie du yoga. Analyse ce document (livre ou fiches de yoga) et extrais sa structure pédagogique.

1. Détecte le style de yoga dominant parmi : yin, restauratif, hatha, vinyasa, ashtanga, power, kundalini, autre.
2. Extrais chaque posture décrite. Reformule les consignes de manière claire, à la 2e personne du singulier (tutoiement), en français.

Réponds UNIQUEMENT avec un objet JSON valide, sans texte autour, au format :
{
  "titre": "titre du document",
  "style": "yin|restauratif|hatha|vinyasa|ashtanga|power|kundalini|autre",
  "postures": [{
    "id": "identifiant-court-en-kebab-case",
    "sanskrit": "nom sanskrit ou \\"\\"",
    "nom": "nom français",
    "famille": "type de posture",
    "moments": ["debut" | "milieu" | "fin"],
    "niveau": "debutant|intermediaire|avance",
    "themes": ["detox" | "lacher-prise" | "souplesse" | "calme" | "energie"],
    "duree": secondes de tenue conseillées (nombre, ex. 180 pour le yin, 30 pour un style dynamique),
    "respirations": nombre de respirations si style dynamique (sinon omettre),
    "cotes": true si la posture se fait des deux côtés,
    "racines": "points d'appui",
    "meridiens": ["..."],
    "entree": ["étapes pour entrer dans la posture"],
    "optimisation": ["repères courts d'alignement"],
    "adaptations": { "debutant|genoux|dos|hanches|nuque|epaules|chevilles|cyphose|grossesse|tension": "conseil de support" },
    "eviter": ["contraintes parmi la même liste pour lesquelles la posture est déconseillée"],
    "contreIndications": ["..."],
    "bienfaits": { "physiques": [], "mentaux": [], "emotionnels": [], "energetiques": [] },
    "visualisation": "texte de visualisation ou \\"\\"",
    "sortie": ["étapes pour sortir de la posture"]
  }]
}
N'invente rien qui ne soit pas dans le document ; laisse un tableau vide si l'information manque.`;

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(String(r.result).split(",")[1]);
    r.onerror = reject;
    r.readAsDataURL(file);
  });
}

async function toContentBlocks(files) {
  const blocks = [];
  for (const f of files) {
    const data = await fileToBase64(f);
    if (f.type === "application/pdf") {
      blocks.push({ type: "document", source: { type: "base64", media_type: "application/pdf", data } });
    } else if (/^image\/(jpeg|png|gif|webp)$/.test(f.type)) {
      blocks.push({ type: "image", source: { type: "base64", media_type: f.type, data } });
    } else {
      throw new Error(`Format non pris en charge : ${f.name}`);
    }
  }
  return blocks;
}

function parseJSON(text) {
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start < 0 || end < 0) throw new Error("La réponse de l'IA ne contient pas de JSON.");
  return JSON.parse(text.slice(start, end + 1));
}

function normalise(book) {
  const style = STYLE_MODES[book.style] ? book.style : "autre";
  const bookId = "livre-" + Date.now().toString(36);
  const postures = (book.postures || []).map((p, i) => ({
    moments: ["milieu"],
    themes: [],
    entree: [],
    optimisation: [],
    adaptations: {},
    eviter: [],
    contreIndications: [],
    bienfaits: { physiques: [], mentaux: [], emotionnels: [], energetiques: [] },
    sortie: [],
    meridiens: [],
    ...p,
    id: `${bookId}-${p.id || i}`,
    duree: Number(p.duree) || (STYLE_MODES[style] === "flux" ? 30 : 180),
    mode: STYLE_MODES[style],
  }));
  return { id: bookId, titre: book.titre || "Livre importé", auteur: "", style, mode: STYLE_MODES[style], postures };
}

export async function importFiles(files, onLog = () => {}) {
  if (!state.ia.cle) throw new Error("Ajoute d'abord ta clé API dans le Profil.");
  onLog(`Préparation de ${files.length} fichier(s)…`);
  const content = await toContentBlocks(files);
  content.push({ type: "text", text: PROMPT });
  onLog("Analyse par l'IA en cours (cela peut prendre une à deux minutes)…");
  const res = await fetch(API_URL, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": state.ia.cle,
      "anthropic-version": "2023-06-01",
      "anthropic-dangerous-direct-browser-access": "true",
    },
    body: JSON.stringify({
      model: state.ia.modele || "claude-sonnet-5-5",
      max_tokens: 32000,
      messages: [{ role: "user", content }],
    }),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Erreur API (${res.status}) : ${err.slice(0, 300)}`);
  }
  const data = await res.json();
  const text = (data.content || []).filter((b) => b.type === "text").map((b) => b.text).join("");
  const book = normalise(parseJSON(text));
  onLog(`Style détecté : ${book.style} → mode « ${book.mode} ». ${book.postures.length} posture(s) extraite(s).`);
  state.livres.push(book);
  save();
  return book;
}

// Import / export manuel (JSON) — utile sans clé API ou pour partager une bibliothèque
export function importJSON(text) {
  const book = normalise(JSON.parse(text));
  state.livres.push(book);
  save();
  return book;
}

export function removeBook(id) {
  state.livres = state.livres.filter((b) => b.id !== id);
  state.maSeance = state.maSeance.filter((s) => !s.id.startsWith(id));
  save();
}
