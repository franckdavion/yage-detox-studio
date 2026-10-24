# Yoga Détox Studio

Application web de yoga interactive : bibliothèque de postures, séances détox et lecteur guidé à la voix, pensé pour pratiquer les yeux fermés.

## Phase 1 — Moteur Yin (cette version)

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

14 étirements fondamentaux classés par zone (dos, jambes, hanches, haut du corps), avec étapes, repères, adaptations, bienfaits et précautions (`js/data/etirements.js`). Le personnage passe en **rendu semi-3D** (dégradés de volume, reflets, ombre portée, tapis en relief, accessoires mur et sangle) et suit les phases installation → respiration et maintien → relâchement, piloté par le lecteur avec guidage vocal. Filtre par zone dans la bibliothèque, générateur qui équilibre les zones. Programmes : « Réveil en douceur », « Dos libéré », « Étirements complets ».

Chaque étirement est déclaré avec le **modèle obligatoire** `defineEtirement()` (`js/data/modele-etirement.js`) : identité et zone, bienfaits, étapes synchronisées (texte TTS d'installation, de maintien et de relâchement), paramètres du personnage semi-3D et du minuteur. Le modèle est vérifié au démarrage (alertes « [Modèle étirement] » dans la console). La procédure d'ajout à partir d'un simple nom est décrite dans `CLAUDE.md`.

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
