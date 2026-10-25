# Boucles vidéo des exercices

Chaque exercice peut afficher une boucle vidéo MP4 à la place du personnage animé
(lecteur, fiche et carte de la bibliothèque). Sans vidéo, le personnage animé reste affiché.

## Ajouter une vidéo

1. Dépose le fichier ici, nommé d'après l'identifiant de l'exercice : `pil-roll-up.mp4`,
   ou `pil-roll-up-femme.mp4` et `pil-roll-up-homme.mp4` s'il existe deux avatars.
2. Déclare-la dans `js/data/videos.js` :
   ```js
   "pil-roll-up": { src: "assets/videos/pil-roll-up.mp4", souffle: true },
   // ou, avec deux avatars :
   "etir-cobra": { femme: "assets/videos/etir-cobra-femme.mp4", homme: "assets/videos/etir-cobra-homme.mp4" },
   ```
3. Change `VERSION` dans `sw.js` et `APP_VERSION` dans `js/app.js`, puis publie.

Les identifiants des exercices sont dans `js/data/*.js` (champ `id`).

## Format recommandé

| Réglage | Valeur |
| --- | --- |
| Conteneur / codec | MP4, H.264 (profil High), `yuv420p`, option `+faststart` |
| Son | aucun (piste audio supprimée) |
| Taille | 720 × 540 ou 720 × 720, 24 à 30 images/s |
| Poids | 1 à 4 Mo par boucle |
| Boucle | première et dernière image identiques (pas de saut) |
| Cadrage | personnage centré de profil, tapis entier visible, fond uni sauge |

Avec `souffle: true`, la vidéo dure exactement un cycle de souffle : les 40 % premiers
correspondent à l'inspiration, le reste à l'expiration. Le lecteur la cale alors sur le
souffle réglé par l'utilisateur (Profil) et sur la vitesse de lecture.

Exemple de conversion avec ffmpeg :

```bash
ffmpeg -i source.mov -an -vf "scale=720:-2,fps=30" -c:v libx264 -profile:v high -pix_fmt yuv420p -crf 24 -movflags +faststart pil-roll-up.mp4
```

## Vidéos actuelles

| Fichier | Exercice | Origine |
| --- | --- | --- |
| `pil-roll-up.mp4` | Enroulé complet (Roll-Up) | Personnage Mixamo posé os par os (mouvement créé), calé sur le souffle |
| `pil-pompes-prep.mp4` | Préparation aux pompes | Personnage Mixamo, animation « Start Plank » |
| `etir-epaule-croisee.mp4` | Épaule, bras croisé | Personnage Mixamo, animation d'étirement (GLB) |

Les fichiers sources (.fbx, .glb) ne sont pas publiés : seules les vidéos rendues le sont (conditions Mixamo).
