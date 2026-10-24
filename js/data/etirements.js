// Section « Étirements » — chaque étirement suit le modèle obligatoire de
// js/data/modele-etirement.js (identité, bienfaits, étapes synchronisées TTS,
// personnage semi-3D et minuteur). Pour en ajouter un : voir CLAUDE.md.
import { defineEtirement } from "./modele-etirement.js";

export const LIVRE_ETIREMENTS = {
  "id": "etirements",
  "titre": "Étirements",
  "auteur": "Yoga Détox Studio",
  "style": "etirements",
  "mode": "statique"
};

export const ZONES = {
  "dos": {
    "label": "Dos",
    "emoji": "🌿"
  },
  "jambes": {
    "label": "Jambes",
    "emoji": "🦵"
  },
  "hanches": {
    "label": "Hanches",
    "emoji": "🌀"
  },
  "haut": {
    "label": "Haut du corps",
    "emoji": "💪"
  }
};

export const POSTURES_ETIREMENTS = [
  // ---------- DOS ----------
  defineEtirement({
    // 1. Identité
    id: "etir-chat-vache",
    nom: "Chat et vache",
    zone: "dos",
    famille: "À quatre pattes, mobilisation de la colonne",
    moments: ["debut"],
    themes: ["souplesse", "energie"],
    racines: "Mains et genoux",
    // 2. Bienfaits
    bienfaits: ["Assouplit toute la colonne vertébrale", "Réveille le dos en douceur", "Synchronise le mouvement et la respiration"],
    // 3. Étapes synchronisées (texte lu par la synthèse vocale)
    etapes: {
      installation: [
        "Mets-toi à quatre pattes : mains sous les épaules, genoux sous les hanches.",
        "À l'inspiration, creuse doucement le dos, poitrine vers l'avant, regard légèrement vers le haut.",
        "À l'expiration, arrondis le dos vers le plafond, menton vers la poitrine, nombril vers la colonne.",
        "Enchaîne lentement au rythme de ton souffle.",
      ],
      maintien: {
        respiration: "Laisse ton souffle guider le mouvement : inspire, dos creux ; expire, dos rond.",
        reperes: ["Inspire : dos creux", "Expire : dos rond", "Le mouvement part du bassin"],
        visualisation: "Ta colonne ondule comme une vague, du bassin jusqu'à la tête.",
      },
      relachement: [
        "Reviens au dos plat, puis assieds-toi sur les talons.",
      ],
    },
    // 4. Personnage semi-3D et minuteur
    personnage: { depart: "quatrePattes", posture: "dosCreux", expiration: "dosRond" },
    minuteur: { respirations: 6 },
    adaptations: {"genoux":"Glisse une couverture pliée sous les genoux.", "dos":"Réduis l'amplitude et reste dans une zone confortable."},
  }),
  defineEtirement({
    // 1. Identité
    id: "etir-genoux-poitrine",
    nom: "Genoux à la poitrine",
    zone: "dos",
    famille: "Allongé, flexion des hanches",
    moments: ["debut", "fin"],
    themes: ["calme", "detox"],
    racines: "Dos et bassin au sol",
    // 2. Bienfaits
    bienfaits: ["Détend le bas du dos", "Masse les organes du ventre", "Apaise", "Sentiment de cocon"],
    // 3. Étapes synchronisées (texte lu par la synthèse vocale)
    etapes: {
      installation: [
        "Allonge-toi sur le dos, genoux pliés, pieds au sol.",
        "Ramène les genoux vers la poitrine et entoure-les de tes bras.",
        "Laisse le bas du dos s'élargir et s'étaler au sol.",
        "Respire calmement ; tu peux bercer doucement les genoux de droite à gauche.",
      ],
      maintien: {
        respiration: "Respire dans le bas du dos : à chaque expiration, il s'étale un peu plus au sol.",
        reperes: ["Les épaules restent au sol", "La nuque est longue", "Le bas du dos s'étale"],
        visualisation: "Imagine ton dos qui s'enfonce dans un sable chaud.",
      },
      relachement: [
        "Repose un pied puis l'autre au sol, genoux pliés.",
      ],
    },
    // 4. Personnage semi-3D et minuteur
    personnage: { depart: "dosGenouxPlies", posture: "genouxPoitrine" },
    minuteur: { duree: 40, cotes: false },
    adaptations: {"genoux":"Tiens l'arrière des cuisses plutôt que les genoux."},
  }),
  defineEtirement({
    // 1. Identité
    id: "etir-torsion-allongee",
    nom: "Torsion allongée",
    zone: "dos",
    famille: "Allongé, torsion",
    moments: ["fin"],
    themes: ["detox", "calme"],
    racines: "Omoplates au sol",
    // 2. Bienfaits
    bienfaits: ["Détend la colonne et le bas du dos", "Stimule la digestion", "Relâche les tensions"],
    // 3. Étapes synchronisées (texte lu par la synthèse vocale)
    etapes: {
      installation: [
        "Allongé sur le dos, ramène les genoux vers la poitrine.",
        "Ouvre les bras en croix, paumes vers le sol.",
        "Laisse descendre les genoux vers la droite, sans forcer.",
        "Tourne doucement la tête vers la gauche et respire dans la torsion.",
      ],
      maintien: {
        respiration: "Inspire en allongeant la colonne, expire en laissant les genoux devenir plus lourds.",
        reperes: ["Les deux épaules restent au sol", "Les genoux sont lourds", "Expire pour relâcher un peu plus"],
        visualisation: "Tu essores doucement une serviette, puis tu la laisses se détendre.",
      },
      relachement: [
        "Ramène les genoux au centre en inspirant, puis change de côté.",
      ],
    },
    // 4. Personnage semi-3D et minuteur
    personnage: { depart: "dosGenouxPlies", posture: "torsion" },
    minuteur: { duree: 40, cotes: true },
    adaptations: {"dos":"Place un coussin sous les genoux."},
    precautions: ["Prudence en cas de hernie discale"],
  }),
  defineEtirement({
    // 1. Identité
    id: "etir-enfant-bras",
    nom: "Enfant, bras allongés",
    zone: "dos",
    famille: "À genoux, flexion avant",
    moments: ["fin"],
    themes: ["calme", "lacher-prise"],
    racines: "Genoux, mains et front",
    // 2. Bienfaits
    bienfaits: ["Étire le dos, les épaules et les flancs", "Calme le mental", "Lâcher-prise"],
    // 3. Étapes synchronisées (texte lu par la synthèse vocale)
    etapes: {
      installation: [
        "À genoux, gros orteils joints, assieds-toi sur les talons.",
        "Avance les mains loin devant toi en gardant les fesses vers les talons.",
        "Pose le front au sol ou sur un coussin.",
        "À chaque expiration, laisse les aisselles descendre un peu plus.",
      ],
      maintien: {
        respiration: "Respire dans le dos : à chaque expiration, tes aisselles descendent un peu plus vers le sol.",
        reperes: ["Les mains poussent loin devant", "Les fesses restent vers les talons", "La nuque est relâchée"],
        visualisation: "Ton dos s'allonge comme une plage à marée basse.",
      },
      relachement: [
        "Ramène les mains vers les genoux et redresse-toi lentement.",
      ],
    },
    // 4. Personnage semi-3D et minuteur
    personnage: { depart: "quatrePattes", posture: "enfantBras" },
    minuteur: { duree: 45, cotes: false },
    adaptations: {"genoux":"Coussin entre les mollets et les cuisses.", "hanches":"Écarte les genoux plus largement."},
  }),
  defineEtirement({
    // 1. Identité
    id: "etir-cobra",
    nom: "Cobra",
    zone: "dos",
    famille: "Sur le ventre, extension de la colonne",
    moments: ["milieu"],
    themes: ["energie", "souplesse"],
    racines: "Bassin et mains au sol",
    // 2. Bienfaits
    bienfaits: ["Étire les abdominaux et l'avant du buste", "Assouplit la colonne en extension", "Contrebalance la position assise"],
    // 3. Étapes synchronisées (texte lu par la synthèse vocale)
    etapes: {
      installation: [
        "Allonge-toi sur le ventre, mains sous les épaules, coudes près du corps.",
        "Allonge les jambes, dessus des pieds au sol.",
        "Inspire et décolle doucement la poitrine en poussant dans les mains.",
        "Garde les coudes légèrement pliés et les épaules loin des oreilles.",
      ],
      maintien: {
        respiration: "Inspire en ouvrant la poitrine, expire en relâchant les fessiers et les épaules.",
        reperes: ["Le pubis reste au sol", "Les épaules descendent", "La nuque prolonge la colonne"],
        visualisation: "Ton buste s'élève comme un serpent qui se réchauffe au soleil.",
      },
      relachement: [
        "Redescends vertèbre par vertèbre et pose la joue au sol.",
      ],
    },
    // 4. Personnage semi-3D et minuteur
    personnage: { depart: "ventre", posture: "cobra" },
    minuteur: { duree: 30, cotes: false },
    adaptations: {"dos":"Reste sur les avant-bras, comme le sphinx.", "debutant":"Décolle à peine la poitrine, sans tendre les bras."},
    eviter: ["grossesse"],
    precautions: ["À éviter pendant la grossesse et en cas de douleur lombaire aiguë"],
  }),
  // ---------- JAMBES ----------
  defineEtirement({
    // 1. Identité
    id: "etir-ischios-assis",
    nom: "Arrière des cuisses, assis",
    zone: "jambes",
    famille: "Assis, flexion avant",
    moments: ["milieu"],
    themes: ["souplesse"],
    racines: "Ischions au sol",
    // 2. Bienfaits
    bienfaits: ["Étire les ischio-jambiers et les mollets", "Détend le bas du dos", "Calme"],
    // 3. Étapes synchronisées (texte lu par la synthèse vocale)
    etapes: {
      installation: [
        "Assis, tends la jambe droite devant toi et plie la gauche, plante du pied contre l'intérieur de la cuisse.",
        "Grandis-toi à l'inspiration.",
        "À l'expiration, penche-toi vers l'avant depuis les hanches, dos long.",
        "Pose les mains là où c'est confortable, sur la jambe ou au sol.",
      ],
      maintien: {
        respiration: "Inspire en grandissant le dos, expire en te penchant à peine plus loin, sans forcer.",
        reperes: ["Le dos reste long", "Le mouvement part des hanches", "Pointe du pied vers le ciel"],
        visualisation: "Ta jambe est une rivière, ton buste glisse doucement à sa surface.",
      },
      relachement: [
        "Redresse-toi en inspirant, puis change de jambe.",
      ],
    },
    // 4. Personnage semi-3D et minuteur
    personnage: { depart: "assisJambesTendues", posture: "flexionAvant" },
    minuteur: { duree: 40, cotes: true },
    adaptations: {"dos":"Assieds-toi sur un coussin pour basculer plus facilement le bassin.", "debutant":"Plie légèrement le genou de la jambe tendue."},
  }),
  defineEtirement({
    // 1. Identité
    id: "etir-quadriceps",
    nom: "Quadriceps debout",
    zone: "jambes",
    famille: "Debout, étirement de l'avant de la cuisse",
    moments: ["milieu"],
    themes: ["souplesse", "energie"],
    racines: "Un pied au sol",
    // 2. Bienfaits
    bienfaits: ["Étire les quadriceps et l'avant de la hanche", "Améliore l'équilibre"],
    // 3. Étapes synchronisées (texte lu par la synthèse vocale)
    etapes: {
      installation: [
        "Debout, tiens-toi à un mur ou au dossier d'une chaise si besoin.",
        "Plie la jambe droite et attrape la cheville avec la main droite.",
        "Rapproche le talon de la fesse, genoux côte à côte.",
        "Rentre légèrement le ventre et bascule le bassin vers l'avant pour sentir l'étirement.",
      ],
      maintien: {
        respiration: "Respire calmement, ventre légèrement rentré, et sens l'avant de la cuisse s'allonger.",
        reperes: ["Les genoux restent côte à côte", "Le bassin bascule doucement", "La jambe d'appui est souple"],
        visualisation: "Tu es un flamant rose, stable et léger sur une jambe.",
      },
      relachement: [
        "Relâche la cheville doucement et repose le pied, puis change de jambe.",
      ],
    },
    // 4. Personnage semi-3D et minuteur
    personnage: { depart: "debout", posture: "quadriceps" },
    minuteur: { duree: 30, cotes: true },
    adaptations: {"genoux":"Utilise une sangle autour de la cheville pour ne pas trop plier le genou.", "debutant":"Garde une main sur un appui."},
  }),
  defineEtirement({
    // 1. Identité
    id: "etir-mollets",
    nom: "Mollets au mur",
    zone: "jambes",
    famille: "Debout, fente face au mur",
    moments: ["debut"],
    themes: ["souplesse", "energie"],
    racines: "Mains au mur, pieds au sol",
    // 2. Bienfaits
    bienfaits: ["Étire les mollets et le tendon d'Achille", "Soulage les jambes lourdes"],
    // 3. Étapes synchronisées (texte lu par la synthèse vocale)
    etapes: {
      installation: [
        "Face à un mur, pose les mains à hauteur d'épaules.",
        "Recule la jambe droite, talon bien au sol, pointe du pied vers le mur.",
        "Plie le genou avant et avance le bassin vers le mur.",
        "Garde la jambe arrière tendue : l'étirement se sent dans le mollet.",
      ],
      maintien: {
        respiration: "Inspire en restant grand, expire en laissant le talon arrière peser vers le sol.",
        reperes: ["Talon arrière au sol", "Jambe arrière tendue", "Bassin vers le mur"],
        visualisation: "Imagine que tu pousses doucement un mur pour le faire reculer.",
      },
      relachement: [
        "Ramène le pied arrière à côté de l'autre, puis change de jambe.",
      ],
    },
    // 4. Personnage semi-3D et minuteur
    personnage: { depart: "debout", posture: "mollet", accessoire: "mur" },
    minuteur: { duree: 30, cotes: true },
    adaptations: {"chevilles":"Rapproche le pied arrière du mur."},
  }),
  defineEtirement({
    // 1. Identité
    id: "etir-jambe-ciel",
    nom: "Jambe au ciel avec sangle",
    zone: "jambes",
    famille: "Allongé, ischio-jambiers",
    moments: ["milieu", "fin"],
    themes: ["souplesse", "calme"],
    racines: "Dos et jambe au sol",
    // 2. Bienfaits
    bienfaits: ["Étire l'arrière de la cuisse sans charger le dos", "Détente"],
    // 3. Étapes synchronisées (texte lu par la synthèse vocale)
    etapes: {
      installation: [
        "Allongé sur le dos, place une sangle, une ceinture ou une serviette sous le pied droit.",
        "Monte la jambe droite vers le ciel en tenant la sangle à deux mains.",
        "Garde l'autre jambe allongée au sol, ou pliée si c'est plus confortable.",
        "À chaque expiration, rapproche un peu la jambe, sans décoller le bassin.",
      ],
      maintien: {
        respiration: "Inspire, le bassin reste lourd ; expire, rapproche doucement la jambe de toi.",
        reperes: ["Bassin au sol", "Épaules détendues", "Pied fléchi vers toi"],
        visualisation: "Ta jambe est un mât qui s'élève vers le ciel.",
      },
      relachement: [
        "Plie le genou, repose le pied au sol, puis change de jambe.",
      ],
    },
    // 4. Personnage semi-3D et minuteur
    personnage: { depart: "dosAllonge", posture: "jambeCiel", accessoire: "sangle" },
    minuteur: { duree: 40, cotes: true },
    adaptations: {"dos":"Garde la jambe au sol pliée, pied à plat.", "debutant":"Plie légèrement le genou de la jambe levée."},
  }),
  // ---------- HANCHES ----------
  defineEtirement({
    // 1. Identité
    id: "etir-fente-basse",
    nom: "Fente basse (psoas)",
    zone: "hanches",
    famille: "À genoux, ouverture de l'avant de la hanche",
    moments: ["milieu"],
    themes: ["souplesse", "energie"],
    racines: "Pied avant et genou arrière",
    // 2. Bienfaits
    bienfaits: ["Étire le psoas et les fléchisseurs de hanche", "Contrebalance la position assise", "Ancrage"],
    // 3. Étapes synchronisées (texte lu par la synthèse vocale)
    etapes: {
      installation: [
        "Depuis quatre pattes, avance le pied droit entre les mains.",
        "Pose le genou gauche au sol, loin derrière.",
        "Redresse le buste, mains sur la cuisse avant.",
        "Avance doucement le bassin vers l'avant : l'étirement se sent à l'avant de la hanche gauche.",
      ],
      maintien: {
        respiration: "Inspire en grandissant le buste, expire en laissant le bassin descendre un peu plus.",
        reperes: ["Le genou avant reste au-dessus de la cheville", "Le buste est droit", "Le ventre est légèrement engagé"],
        visualisation: "Ton bassin descend comme un ascenseur qui se pose en douceur.",
      },
      relachement: [
        "Reviens à quatre pattes, puis change de jambe.",
      ],
    },
    // 4. Personnage semi-3D et minuteur
    personnage: { depart: "quatrePattes", posture: "fenteBasse" },
    minuteur: { duree: 40, cotes: true },
    adaptations: {"genoux":"Couverture pliée sous le genou au sol.", "debutant":"Pose les mains sur des blocs ou une chaise."},
  }),
  defineEtirement({
    // 1. Identité
    id: "etir-figure-quatre",
    nom: "Le chiffre 4",
    zone: "hanches",
    famille: "Allongé, rotation externe de hanche",
    moments: ["milieu", "fin"],
    themes: ["souplesse", "calme"],
    racines: "Dos au sol",
    // 2. Bienfaits
    bienfaits: ["Étire les fessiers et le piriforme", "Peut soulager une gêne sciatique légère", "Relâche les tensions accumulées dans les hanches"],
    // 3. Étapes synchronisées (texte lu par la synthèse vocale)
    etapes: {
      installation: [
        "Allongé sur le dos, genoux pliés, pieds au sol.",
        "Pose la cheville droite sur le genou gauche, pied droit fléchi.",
        "Décolle le pied gauche et attrape l'arrière de la cuisse gauche.",
        "Rapproche doucement les jambes de toi : l'étirement se sent dans la fesse droite.",
      ],
      maintien: {
        respiration: "Respire dans la fesse étirée : à chaque expiration, relâche un peu plus la hanche.",
        reperes: ["Pied fléchi pour protéger le genou", "Tête et épaules au sol", "Respire dans la fesse"],
        visualisation: "Ta hanche s'ouvre comme une porte qui pivote sans bruit.",
      },
      relachement: [
        "Repose les deux pieds au sol, puis change de côté.",
      ],
    },
    // 4. Personnage semi-3D et minuteur
    personnage: { depart: "dosGenouxPlies", posture: "figure4" },
    minuteur: { duree: 40, cotes: true },
    adaptations: {"genoux":"Garde le pied gauche au sol et pousse doucement le genou droit vers l'extérieur.", "hanches":"Reste avec le pied d'appui au sol."},
  }),
  defineEtirement({
    // 1. Identité
    id: "etir-papillon",
    nom: "Papillon assis",
    zone: "hanches",
    famille: "Assis, ouverture des adducteurs",
    moments: ["debut"],
    themes: ["souplesse", "calme"],
    racines: "Ischions au sol",
    // 2. Bienfaits
    bienfaits: ["Étire l'intérieur des cuisses et ouvre les hanches", "Apaise"],
    // 3. Étapes synchronisées (texte lu par la synthèse vocale)
    etapes: {
      installation: [
        "Assis, rapproche les plantes des pieds et laisse les genoux s'ouvrir sur les côtés.",
        "Tiens les pieds avec les mains et grandis-toi.",
        "À l'expiration, penche-toi légèrement vers l'avant, dos long.",
      ],
      maintien: {
        respiration: "Inspire en allongeant le dos, expire en laissant les genoux devenir lourds.",
        reperes: ["Dos long", "Genoux lourds, sans forcer", "Épaules basses"],
        visualisation: "Tes genoux sont les ailes d'un papillon qui se pose.",
      },
      relachement: [
        "Redresse-toi, rapproche les genoux avec les mains et allonge les jambes.",
      ],
    },
    // 4. Personnage semi-3D et minuteur
    personnage: { depart: "assisTailleur", posture: "papillon" },
    minuteur: { duree: 45, cotes: false },
    adaptations: {"hanches":"Glisse des coussins sous les genoux.", "dos":"Assieds-toi sur un coussin."},
  }),
  // ---------- HAUT DU CORPS ----------
  defineEtirement({
    // 1. Identité
    id: "etir-epaule-croisee",
    nom: "Épaule, bras croisé",
    zone: "haut",
    famille: "Debout, étirement de l'arrière de l'épaule",
    moments: ["debut"],
    themes: ["bureau", "souplesse"],
    racines: "Pieds au sol",
    // 2. Bienfaits
    bienfaits: ["Étire l'arrière de l'épaule et le haut du dos"],
    // 3. Étapes synchronisées (texte lu par la synthèse vocale)
    etapes: {
      installation: [
        "Debout ou assis, dos droit.",
        "Tends le bras droit devant toi puis amène-le à l'horizontale devant la poitrine.",
        "Avec la main gauche, rapproche doucement le bras droit de toi, au-dessus du coude.",
        "Garde l'épaule droite basse, loin de l'oreille.",
      ],
      maintien: {
        respiration: "Respire calmement, épaule basse, et laisse l'arrière de l'épaule s'ouvrir à chaque expiration.",
        reperes: ["L'épaule reste basse", "Le bras reste à l'horizontale", "Pression douce"],
        visualisation: "Tu enlaces un grand arbre d'un seul bras.",
      },
      relachement: [
        "Relâche le bras le long du corps, puis change de côté.",
      ],
    },
    // 4. Personnage semi-3D et minuteur
    personnage: { depart: "debout", posture: "brasCroise" },
    minuteur: { duree: 30, cotes: true },
    adaptations: {"epaules":"Tiens le bras plus bas et appuie très légèrement."},
  }),
  defineEtirement({
    // 1. Identité
    id: "etir-triceps",
    nom: "Triceps, main dans le dos",
    zone: "haut",
    famille: "Debout, étirement de l'arrière du bras",
    moments: ["milieu"],
    themes: ["bureau", "souplesse"],
    racines: "Pieds au sol",
    // 2. Bienfaits
    bienfaits: ["Étire les triceps et les flancs", "Ouvre l'épaule"],
    // 3. Étapes synchronisées (texte lu par la synthèse vocale)
    etapes: {
      installation: [
        "Lève le bras droit vers le ciel.",
        "Plie le coude et laisse la main descendre entre les omoplates.",
        "Avec la main gauche, guide doucement le coude droit vers l'arrière.",
        "Garde la tête droite et le cou détendu.",
      ],
      maintien: {
        respiration: "Inspire en grandissant la colonne, expire en relâchant le coude un peu plus loin.",
        reperes: ["La tête ne s'incline pas", "Le coude pointe vers le ciel", "Les côtes restent basses"],
        visualisation: "Ton coude dessine le sommet d'une montagne.",
      },
      relachement: [
        "Relâche la main, déroule le bras vers le ciel puis redescends-le. Change de côté.",
      ],
    },
    // 4. Personnage semi-3D et minuteur
    personnage: { depart: "debout", posture: "triceps" },
    minuteur: { duree: 30, cotes: true },
    adaptations: {"epaules":"Tiens une serviette dans la main du dessus et attrape-la avec l'autre main dans le dos."},
  }),
  defineEtirement({
    // 1. Identité
    id: "etir-pectoraux",
    nom: "Ouverture de la poitrine",
    zone: "haut",
    famille: "Debout, mains jointes dans le dos",
    moments: ["milieu"],
    themes: ["bureau", "energie"],
    racines: "Pieds au sol",
    // 2. Bienfaits
    bienfaits: ["Étire les pectoraux et l'avant des épaules", "Corrige la posture voûtée", "Redonne de l'élan", "Ouvre le cœur"],
    // 3. Étapes synchronisées (texte lu par la synthèse vocale)
    etapes: {
      installation: [
        "Debout, croise les doigts dans le dos.",
        "Ramène les omoplates l'une vers l'autre et vers le bas.",
        "Éloigne doucement les mains du dos et ouvre la poitrine vers l'avant.",
        "Garde le menton parallèle au sol.",
      ],
      maintien: {
        respiration: "Inspire en ouvrant la poitrine, expire en gardant les épaules basses et détendues.",
        reperes: ["Omoplates rapprochées", "Poitrine ouverte", "Nuque longue"],
        visualisation: "Ta poitrine s'ouvre comme une fenêtre au soleil levant.",
      },
      relachement: [
        "Décroise doucement les doigts et relâche les bras.",
      ],
    },
    // 4. Personnage semi-3D et minuteur
    personnage: { depart: "debout", posture: "pectoraux" },
    minuteur: { duree: 30, cotes: false },
    adaptations: {"epaules":"Tiens une serviette entre les mains plutôt que de croiser les doigts."},
  }),
  defineEtirement({
    // 1. Identité
    id: "etir-nuque-laterale",
    nom: "Nuque et trapèzes",
    zone: "haut",
    famille: "Assis, inclinaison latérale de la tête",
    moments: ["debut", "fin"],
    themes: ["bureau", "calme"],
    racines: "Ischions au sol",
    // 2. Bienfaits
    bienfaits: ["Relâche le haut des trapèzes", "Soulage la nuque après les écrans", "Apaise"],
    // 3. Étapes synchronisées (texte lu par la synthèse vocale)
    etapes: {
      installation: [
        "Assieds-toi droit, épaules relâchées.",
        "Laisse l'oreille droite descendre vers l'épaule droite.",
        "Pose la main droite sur le côté de la tête, sans tirer.",
        "Laisse l'épaule gauche descendre vers le sol.",
      ],
      maintien: {
        respiration: "Respire dans le côté du cou étiré : à chaque expiration, l'épaule opposée descend un peu plus.",
        reperes: ["La main pèse à peine", "L'épaule opposée descend", "Le menton reste droit"],
        visualisation: "Ton épaule est un poids qui glisse doucement vers le sol.",
      },
      relachement: [
        "Retire la main, ramène la tête au centre en inspirant, puis change de côté.",
      ],
    },
    // 4. Personnage semi-3D et minuteur
    personnage: { depart: "assisTailleur", posture: "nuqueLaterale" },
    minuteur: { duree: 30, cotes: true },
    adaptations: {"nuque":"Ne pose pas la main : laisse seulement le poids de la tête agir."},
  }),
];

export const PROGRAMMES_ETIREMENTS = [
  {
    "id": "etir-reveil",
    "titre": "Réveil en douceur · 8 min",
    "description": "Pour démarrer la journée : colonne, mollets, épaules et poitrine.",
    "theme": "energie",
    "postures": [
      "etir-chat-vache",
      "etir-mollets",
      "etir-nuque-laterale",
      "etir-epaule-croisee",
      "etir-pectoraux",
      "etir-genoux-poitrine"
    ]
  },
  {
    "id": "etir-dos",
    "titre": "Dos libéré",
    "description": "Une séquence douce pour délier tout le dos après une longue journée.",
    "theme": "calme",
    "postures": [
      "etir-chat-vache",
      "etir-genoux-poitrine",
      "etir-cobra",
      "etir-torsion-allongee",
      "etir-figure-quatre",
      "etir-enfant-bras"
    ]
  },
  {
    "id": "etir-recup",
    "titre": "Récupération après l'effort",
    "description": "Après la course, le vélo ou le renforcement : mollets, cuisses, hanches et dos.",
    "theme": "souplesse",
    "postures": [
      "etir-mollets",
      "etir-quadriceps",
      "etir-ischios-assis",
      "etir-fente-basse",
      "etir-cobra",
      "etir-figure-quatre",
      "etir-genoux-poitrine"
    ]
  },
  {
    "id": "etir-complet",
    "titre": "Étirements complets",
    "description": "Les 16 étirements, du dos au haut du corps.",
    "theme": "souplesse",
    "postures": [
      "etir-chat-vache",
      "etir-nuque-laterale",
      "etir-papillon",
      "etir-mollets",
      "etir-epaule-croisee",
      "etir-ischios-assis",
      "etir-quadriceps",
      "etir-fente-basse",
      "etir-triceps",
      "etir-pectoraux",
      "etir-cobra",
      "etir-jambe-ciel",
      "etir-figure-quatre",
      "etir-genoux-poitrine",
      "etir-torsion-allongee",
      "etir-enfant-bras"
    ]
  }
];
