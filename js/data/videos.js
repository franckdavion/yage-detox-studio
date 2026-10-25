// Boucles vidéo des exercices (MP4 H.264, sans son, boucle sans coupure).
// Pour ajouter une vidéo : déposer le fichier dans assets/videos/ puis ajouter une ligne ci-dessous.
//   "id-de-l-exercice": "assets/videos/fichier.mp4"                       → même vidéo pour les deux avatars
//   "id-de-l-exercice": { femme: "assets/videos/a.mp4", homme: "assets/videos/b.mp4" }
//   zoom: 1        → agrandissement dans le cercle du lecteur (1,12 par défaut)
//   cadrage: "50% 78%" → point de la vidéo gardé visible quand une carte la recadre (centre par défaut)
//   souffle: true → la vidéo dure un cycle de souffle (inspiration sur les 40 % premiers, expiration ensuite) :
//                   le lecteur la cale sur le souffle de l'utilisateur pendant la tenue.
// Tant qu'un exercice n'a pas de vidéo (ou si le fichier ne se charge pas), le personnage animé s'affiche.
export const VIDEOS = {
  // Démo : mannequin 3D, cycle de 10 s (inspire 4 s = se dérouler, expire 6 s = s'enrouler)
  "pil-roll-up": { src: "assets/videos/pil-roll-up.mp4", souffle: true },
  // Personnage Mixamo (animation « Start Plank ») rendu en 3D : debout -> planche -> debout, 10 s
  "pil-pompes-prep": { src: "assets/videos/pil-pompes-prep.mp4", zoom: 1, cadrage: "50% 72%" },
};

// { src, souffle } pour une posture et un avatar ("femme" | "homme"), ou null
export function videoFor(posture, avatar = "femme") {
  const v = posture?.rendu3d || VIDEOS[posture?.id];
  if (!v) return null;
  if (typeof v === "string") return { src: v, souffle: false, zoom: 1.12, cadrage: "50% 50%" };
  const src = v.src || v[avatar] || v.femme || v.homme;
  return src ? { src, souffle: !!v.souffle, zoom: v.zoom ?? 1.12, cadrage: v.cadrage || "50% 50%" } : null;
}
