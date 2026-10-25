# Yoga Détox Studio

Application web de yoga interactive : bibliothèque de postures, séances détox et lecteur guidé à la voix, pensé pour pratiquer les yeux fermés.

## Accueil : trois disciplines

À l'ouverture, l'application affiche trois cartes animées : **Yoga** (sérénité & flux : Yin, yoga sur chaise, yoga des yeux et livres importés), **Étirements** (mobilité & récupération) et **Pilates** (contrôle du centre & mobilité de la colonne). Chaque carte ouvre la bibliothèque de sa discipline (`#/yoga`, `#/etirements`, `#/pilates`), strictement filtrée, avec ses séances guidées et ses filtres propres : méthode, moment et bienfait pour le yoga, zone pour les étirements, catégorie pour le Pilates. L'onglet Séances regroupe aussi les programmes par discipline.

Lecteur commun : personnage semi-3D pour toutes les disciplines, avatar femme / homme, vitesse de lecture (0,75× à 1,5×, voix comprise), barre de progression de l'exercice (déplaçable pendant la tenue), onde vocale, lecture / pause / précédent / suivant. Une posture peut aussi fournir un rendu 3D réaliste pré-rendu (`rendu3d: { femme: "…mp4", homme: "…mp4" }`) : le lecteur l'affiche à la place du personnage, synchronisé avec la pause et la vitesse.

## Boucles vidéo (MP4)

Un exercice peut avoir sa boucle vidéo (`<video autoplay loop muted playsinline>`), déclarée dans `js/data/videos.js` et rangée dans `assets/videos/` : elle remplace le personnage animé dans le lecteur, la fiche et la carte de la bibliothèque, suit la pause et la vitesse de lecture, et peut se caler sur le souffle (`souffle: true`). Sans vidéo, ou si le fichier ne se charge pas, le personnage animé s'affiche. Format et procédure : `assets/videos/README.md`.

## Phase 1 — Moteur Yin

- **Bibliothèque** de 25 postures Yin, classées par moment (Début · Ancrage, Milieu · Profondeur, Fin · Intériorisation) et par bienfait (Détox digestion, Lâcher-prise, Souplesse, Calme & sommeil, Énergie). Recherche par nom, bienfait ou méridien.
- **Fiche posture** structurée selon la méthode du livre : entrée, optimisation, adaptabilité, contre-indications, visualisation, bienfaits, sortie, contre-posture.
- **Sélecteur d'adaptabilité** : débutant, genoux, dos, hanches, nuque, épaules, chevilles, cyphose, grossesse, tension. Les conseils de supports s'affichent et les postures déconseillées sont signalées.
- **Lecteur** : installation guidée, minuteur circulaire de 3 à 5 min, animation du souffle (inspire 4 s / expire 6 s, réglable), repères d'optimisation et visualisation lus à voix haute (Web Speech API, voix française), son de cloche entre les phases, gestion des deux côtés, écran maintenu allumé.
- **Séances** : 5 programmes thématiques, générateur de séances selon le thème, la durée et le profil, et composition manuelle (ordre, durées).
- **Mes séances** : enregistre les séances créées avec un nom, puis lance-les, modifie-les, duplique-les ou supprime-les depuis l'onglet dédié (sauvegarde dans le localStorage du navigateur).
- Mode clair / sombre, installable sur mobile (manifest).

## Yoga sur chaise (deuxième méthode)

Séquence de 11 fiches (mise en condition + 10 postures) inspirée du *Petit guide de yoga sur chaise* (Utopies / YesWeGreen, 2021). Les consignes sont reformulées ; ni le texte ni les illustrations du guide ne sont reproduits. Le lecteur passe en mode « flux » (compteur de respirations) et le personnage s'assoit sur une chaise ; pour les mouvements rythmés (bras, dos creux / dos rond), il alterne entre deux positions au rythme exact du souffle. Programmes : « Pause yoga sur chaise » et « Nuque & épaules express ».

## Yoga des yeux (troisième méthode)

19 fiches contre la fatigue oculaire (palming, gym des yeux, mise au point, papillon, massage de l'orbite…) d'après la fiche *Exercices contre la fatigue des yeux* (Académie d'Aix-Marseille) ; consignes reformulées, images non reproduites. Un **visage guide** de face (`js/eyes.js`) anime le regard, les paupières et les mains selon chaque exercice, piloté image par image par le lecteur (pause comprise). Le lecteur compte des répétitions à cadence fixe. Programmes : « Yeux reposés · 5 min », « Pause écran · 2 min », « Gym des yeux complète ».

## Étirements (quatrième méthode)

16 étirements classés par zone (dont le cobra et l'étirement nuque et trapèzes) (dos, jambes, hanches, haut du corps), avec étapes, repères, adaptations, bienfaits et précautions (`js/data/etirements.js`). Le personnage passe en **rendu semi-3D** (dégradés de volume, reflets, ombre portée, tapis en relief, accessoires mur et sangle) et suit les phases installation → respiration et maintien → relâchement, piloté par le lecteur avec guidage vocal. Filtre par zone dans la bibliothèque, générateur qui équilibre les zones. Programmes : « Réveil en douceur », « Dos libéré », « Récupération après l'effort », « Étirements complets ».

Chaque étirement est déclaré avec le **modèle obligatoire** `defineEtirement()` (`js/data/modele-etirement.js`) : identité et zone, bienfaits, étapes synchronisées (texte TTS d'installation, de maintien et de relâchement), paramètres du personnage semi-3D et du minuteur. Le modèle est vérifié au démarrage (alertes « [Modèle étirement] » dans la console). La procédure d'ajout à partir d'un simple nom est décrite dans `CLAUDE.md`.

## Pilates (cinquième méthode)

16 exercices de Pilates au sol (préparation des abdominaux, roll-up, nage, ciseaux, cygne, sirène, ballon…) classés par catégorie : **Core**, **Mobilité**, **Force**, **Stabilité** (`js/data/pilates.js`, fonction `definePilates`). Le lecteur compte les répétitions et le personnage semi-3D alterne entre la position de préparation (inspiration) et le mouvement (expiration), avec des **traînées de mouvement** sur les mains, les pieds et la tête. Pendant la séance : bouton **♀ / ♂** pour changer d'avatar, **visualiseur d'onde** qui s'anime avec la voix et le souffle, consignes vocales synchronisées (« Inspire pour préparer, expire pour… »), barre de progression, lecture / pause / suivant. Programmes : « Pilates découverte », « Centre & dos forts », « Pilates complet ».

## Phase 2 — Ingestion universelle (amorcée)

L'onglet **Importer** envoie un PDF ou des photos à l'API Claude (vision). L'IA détecte le style et extrait les postures au même format que la base Yin. Le lecteur s'adapte :

| Style détecté | Mode du lecteur |
| --- | --- |
| Yin, restauratif | Minuteur statique (tenues longues) |
| Hatha, Vinyasa, Ashtanga, Power, Kundalini | Flux : compteur de respirations |

La clé API est saisie dans **Profil** et reste stockée dans le navigateur. Pour une ouverture au public, il faudra passer par un petit proxy serverless (Cloudflare Worker, par exemple) afin de ne jamais exposer de clé. Il suffit alors de changer `API_URL` dans `js/import.js`.

## Structure

```
index.html              coquille de l'app + navigation
css/styles.css          design system (sauge, terracotta, lin, verre dépoli, clair/sombre)
js/app.js               routeur (#/…) et vues : catalogue, fiche, séances, import, profil
js/player.js            lecteur : phases, minuteur, souffle, voix, cloche
js/tts.js               synthèse vocale française
js/sequences.js         générateur de séances
js/import.js            ingestion IA (PDF / images → JSON)
js/store.js             état persistant (localStorage) et bibliothèque unifiée
js/data/yin-yoga.js     base de données Yin (postures, programmes, principes)
js/data/chaise.js, yeux.js, etirements.js, pilates.js   autres méthodes
js/animation.js         personnage animé (poses, semi-3D, avatars, traînées)
js/eyes.js              visage guide du yoga des yeux
```

Aucune étape de build n'est nécessaire : HTML, CSS et modules JavaScript natifs.

## Lancer en local

```bash
python3 -m http.server 8000
# puis ouvrir http://localhost:8000
```

## Déployer sur GitHub Pages

Settings → Pages → Source : *Deploy from a branch* → `main` / `/ (root)`.

Adresse : https://franckdavion.github.io/yage-detox-studio/
