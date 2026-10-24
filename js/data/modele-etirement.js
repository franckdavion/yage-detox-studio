// =====================================================================
//  MODÈLE OBLIGATOIRE D'UN ÉTIREMENT — Yoga Détox Studio
// =====================================================================
// Tout étirement de la section « Étirements » est déclaré avec defineEtirement().
// Le modèle impose 4 blocs ; la fonction les vérifie et les convertit au format
// commun de l'application (catalogue, fiche, lecteur, personnage, générateur).
//
// defineEtirement({
//   // 1. IDENTITÉ ----------------------------------------------------------
//   id: "etir-xxx",                    // kebab-case, préfixe « etir- », unique
//   nom: "Nom de l'étirement",
//   zone: "dos" | "jambes" | "hanches" | "haut",
//   famille: "Debout, étirement de …",  // position + type, affiché sous le titre
//   moments: ["debut" | "milieu" | "fin"],
//   themes: ["souplesse", "energie", "calme", "detox", "lacher-prise", "bureau"],
//   niveau: "debutant" | "intermediaire" | "avance",       (défaut : debutant)
//
//   // 2. BIENFAITS ---------------------------------------------------------
//   bienfaits: ["Phrase courte et claire", …],            // 2 à 4 éléments
//
//   // 3. ÉTAPES SYNCHRONISÉES (texte exact lu par la synthèse vocale) --------
//   etapes: {
//     installation: ["Phrase TTS 1.", "Phrase TTS 2.", …],  // lues pendant l'entrée
//     maintien: {
//       respiration: "Phrase TTS lue au début du maintien.",
//       reperes: ["Repère court", …],                    // affichés + lus pendant la tenue
//       visualisation: "Image mentale lue au milieu du maintien.",
//     },
//     relachement: ["Phrase TTS 1.", …],                 // lues pendant la sortie
//   },
//
//   // 4. PERSONNAGE SEMI-3D & MINUTEUR ---------------------------------------
//   personnage: {
//     depart: "debout",          // pose de départ   (clé de POSES dans js/animation.js)
//     posture: "quadriceps",     // pose tenue       (clé de POSES)
//     expiration: null,          // pose à l'expiration pour un mouvement rythmé (facultatif)
//     accessoire: null,          // "mur" | "sangle" | null
//   },
//   minuteur: { duree: 30, cotes: true },                // tenue en secondes, côté D puis G
//   // ou, pour un mouvement rythmé : { respirations: 6 } (le lecteur compte les souffles)
//
//   // Facultatif -------------------------------------------------------------
//   adaptations: { genoux: "…", dos: "…", hanches: "…", epaules: "…", debutant: "…" },
//   precautions: ["…"],         // s'ajoutent aux précautions communes
// })
//
// Les couleurs du personnage (sauge, terracotta, lin) et le rendu semi-3D sont
// appliqués automatiquement à tout étirement déclaré avec ce modèle.
// =====================================================================

export const ZONES_VALIDES = ["dos", "jambes", "hanches", "haut"];
export const ACCESSOIRES_VALIDES = [null, "mur", "sangle"];

export const PRECAUTIONS_COMMUNES = [
  "Étire-toi jusqu'à une sensation de tension agréable, jamais jusqu'à la douleur",
  "Pas d'à-coups : on tient la position, on ne rebondit pas",
  "En cas de blessure récente ou de douleur persistante, demande l'avis d'un professionnel de santé",
];

const problemes = [];

function verifier(spec) {
  const err = (m) => problemes.push(`${spec?.id || "(sans id)"} : ${m}`);
  if (!spec.id || !/^etir-[a-z0-9-]+$/.test(spec.id)) err("id manquant ou invalide (attendu : etir-xxx)");
  if (!spec.nom) err("nom manquant");
  if (!ZONES_VALIDES.includes(spec.zone)) err(`zone invalide « ${spec.zone} »`);
  if (!Array.isArray(spec.bienfaits) || spec.bienfaits.length < 1) err("bienfaits : liste requise");
  const e = spec.etapes || {};
  if (!e.installation?.length) err("etapes.installation : au moins une phrase");
  if (!e.maintien?.respiration) err("etapes.maintien.respiration : phrase requise");
  if (!e.maintien?.reperes?.length) err("etapes.maintien.reperes : au moins un repère");
  if (!e.relachement?.length) err("etapes.relachement : au moins une phrase");
  const pe = spec.personnage || {};
  if (!pe.depart || !pe.posture) err("personnage.depart et personnage.posture requis");
  if (!ACCESSOIRES_VALIDES.includes(pe.accessoire ?? null)) err(`accessoire invalide « ${pe.accessoire} »`);
  const m = spec.minuteur || {};
  if (!(m.duree > 0) && !(m.respirations > 0)) err("minuteur : duree (s) ou respirations requis");
}

// Convertit le modèle vers le format commun des postures de l'application
export function defineEtirement(spec) {
  verifier(spec);
  const { etapes = {}, personnage = {}, minuteur = {} } = spec;
  const rythme = minuteur.respirations > 0;
  return {
    etirement: true,
    id: spec.id,
    sanskrit: ({ dos: "Dos", jambes: "Jambes", hanches: "Hanches", haut: "Haut du corps" })[spec.zone] || "",
    nom: spec.nom,
    famille: spec.famille || "",
    zone: spec.zone,
    niveau: spec.niveau || "debutant",
    moments: spec.moments?.length ? spec.moments : ["milieu"],
    themes: spec.themes || ["souplesse"],
    meridiens: [],
    racines: spec.racines || "",
    // 2. Bienfaits (liste simple, affichée telle quelle dans la fiche)
    bienfaitsListe: spec.bienfaits,
    bienfaits: { physiques: spec.bienfaits, mentaux: [], emotionnels: [], energetiques: [] },
    // 3. Étapes synchronisées
    entree: etapes.installation || [],
    optimisation: etapes.maintien?.reperes || [],
    visualisation: etapes.maintien?.visualisation || "",
    sortie: etapes.relachement || [],
    tts: {
      installation: etapes.installation || [],
      maintien: etapes.maintien?.respiration || "",
      relachement: etapes.relachement || [],
    },
    // 4. Personnage semi-3D et minuteur
    personnage: { depart: personnage.depart, posture: personnage.posture, expiration: personnage.expiration || null },
    accessoire: personnage.accessoire || null,
    mode: rythme ? "flux" : "statique",
    duree: rythme ? minuteur.respirations * 10 : minuteur.duree,
    respirations: rythme ? minuteur.respirations : undefined,
    souffle: personnage.expiration ? "alterne" : undefined,
    cotes: !!minuteur.cotes,
    // Facultatif
    adaptations: spec.adaptations || {},
    eviter: spec.eviter || [],
    contreIndications: [...PRECAUTIONS_COMMUNES, ...(spec.precautions || [])],
  };
}

// Vérification au démarrage : signale tout étirement qui ne respecte pas le modèle
// ou qui utilise une pose de personnage inconnue.
export function verifierEtirements(postures, posesDisponibles) {
  const list = [...problemes];
  for (const p of postures) {
    for (const k of [p.personnage?.depart, p.personnage?.posture, p.personnage?.expiration]) {
      if (k && !posesDisponibles.includes(k)) list.push(`${p.id} : pose « ${k} » inconnue dans js/animation.js`);
    }
  }
  if (list.length) console.warn("[Modèle étirement] À corriger :\n- " + list.join("\n- "));
  return list;
}
