# Consignes du projet — Yoga Détox Studio

Application web statique (HTML, CSS, modules JS natifs, sans build) publiée sur GitHub Pages :
https://franckdavion.github.io/yage-detox-studio/ — toute l'interface est en français, ton zen, tutoiement.

## Règle : ajouter un étirement à partir de son seul nom

Quand l'utilisateur donne simplement le nom d'un nouvel étirement (ex. « Étirement du chat sur le côté »),
générer et intégrer **tout** le contenu en suivant rigoureusement le modèle de
`js/data/modele-etirement.js` (fonction `defineEtirement`). Aucun champ obligatoire ne doit manquer.

### Le modèle (4 blocs obligatoires)

1. **Identité** — `id` (`etir-…`, kebab-case, unique), `nom`, `zone` (`dos` | `jambes` | `hanches` | `haut`),
   `famille` (position + type), `moments`, `themes`, `racines`.
2. **Bienfaits** — `bienfaits` : 2 à 4 phrases courtes et claires.
3. **Étapes synchronisées** — texte exact lu par la synthèse vocale, au tutoiement, phrases courtes terminées par un point :
   - `etapes.installation` : 3 à 5 phrases pour entrer dans l'étirement (lues pendant l'installation) ;
   - `etapes.maintien.respiration` : 1 phrase guidant le souffle (lue au début du maintien) ;
   - `etapes.maintien.reperes` : 2 à 4 repères très courts (affichés et lus pendant la tenue) ;
   - `etapes.maintien.visualisation` : 1 image mentale (lue au milieu du maintien) ;
   - `etapes.relachement` : 1 à 3 phrases pour sortir en douceur (lues pendant le relâchement).
4. **Personnage semi-3D et minuteur**
   - `personnage.depart` / `personnage.posture` : clés de `P` dans `js/animation.js` ;
     `personnage.expiration` pour un mouvement rythmé (alternance au souffle) ; `personnage.accessoire` : `"mur"`, `"sangle"` ou absent ;
   - `minuteur` : `{ duree: 30–45, cotes: true|false }` pour une tenue, ou `{ respirations: N }` pour un mouvement rythmé.
   - Les couleurs (sauge, terracotta, lin) et le rendu semi-3D sont automatiques pour tout `defineEtirement`.

Facultatif : `adaptations` (clés `genoux`, `dos`, `hanches`, `epaules`, `chevilles`, `nuque`, `debutant`…), `precautions`.

### Procédure

1. Ajouter l'appel `defineEtirement({...})` dans `js/data/etirements.js`, dans la section de sa zone.
2. Choisir les poses parmi celles qui existent ; si aucune ne convient, créer une nouvelle pose dans l'objet `P`
   de `js/animation.js` (articulations H, N, P, K1, F1, K2, F2, E1, W1, E2, W2 ; repère 320 × 200, sol à y = 158,
   personnage de profil tourné vers la droite) et la vérifier visuellement.
3. L'ajouter à un programme de `PROGRAMMES_ETIREMENTS` si c'est pertinent (au moins « Étirements complets »).
4. Incrémenter `VERSION` dans `sw.js` et `APP_VERSION` dans `js/app.js`.
5. Tester (aucune alerte « [Modèle étirement] » dans la console, fiche, carte et lecteur corrects), puis commit et push sur `main`.

Poses disponibles : assisJambesTendues, assisTailleur, flexionAvant, papillon, quatrePattes, enfant, coeurFondant, ventre,
sphinx, dosGenouxPlies, dosAllonge, dosPapillon, torsion, jambesMur, escargot, bebeHeureux, debout, cloche, squat, lezard,
pigeon, grenouille, diamant, heros, quadriceps, mollet, brasCroise, triceps, pectoraux, genouxPoitrine, jambeCiel, figure4,
fenteBasse, enfantBras, dosCreux, dosRond, banane (+ poses chaise : chaiseAssis, chaiseBrasHaut…).

### Exemple minimal

```js
defineEtirement({
  id: "etir-flanc-debout",
  nom: "Flanc debout",
  zone: "haut",
  famille: "Debout, étirement latéral",
  moments: ["debut"],
  themes: ["souplesse", "bureau"],
  racines: "Pieds au sol",
  bienfaits: ["Étire les flancs et les côtes", "Libère la respiration"],
  etapes: {
    installation: ["Debout, pieds écartés de la largeur du bassin.", "Lève le bras droit vers le ciel.", "Penche-toi doucement vers la gauche."],
    maintien: {
      respiration: "Respire dans le flanc droit : à chaque inspiration, les côtes s'ouvrent.",
      reperes: ["Bassin stable", "Épaules basses"],
      visualisation: "Ton corps dessine une demi-lune.",
    },
    relachement: ["Reviens au centre en inspirant et redescends le bras."],
  },
  personnage: { depart: "debout", posture: "flancDebout" }, // nouvelle pose à créer dans P (js/animation.js)
  minuteur: { duree: 30, cotes: true },
}),
```

## Autres méthodes

- Yin : `js/data/yin-yoga.js` (photos dans `assets/postures/`, droits confirmés par l'utilisateur).
- Pilates : `js/data/pilates.js` (`definePilates`, poses `pil…` dans `js/animation.js`).
- Yoga sur chaise : `js/data/chaise.js` ; Yoga des yeux : `js/data/yeux.js` + visage guide `js/eyes.js`.
  Pour ces deux guides tiers : contenu reformulé, illustrations non reproduites.
