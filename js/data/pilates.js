// Méthode « Pilates » — 15 exercices au tapis, au rythme du souffle.
// Principe : on inspire pour préparer, on expire pour bouger. Le lecteur compte les répétitions
// (une répétition = une respiration) et le personnage alterne entre la position de préparation
// (inspiration) et la position de mouvement (expiration), avec des traînées de mouvement.

export const LIVRE_PILATES = {
  id: "pilates",
  titre: "Pilates",
  auteur: "Yoga Détox Studio",
  style: "pilates",
  mode: "flux",
};

export const CATEGORIES_PILATES = {
  core: { label: "Core", emoji: "◎" },
  mobilite: { label: "Mobilité", emoji: "〰️" },
  force: { label: "Force", emoji: "▲" },
  stabilite: { label: "Stabilité", emoji: "◆" },
};

const PRECAUTIONS = [
  "Garde la nuque longue et le ventre engagé tout au long du mouvement",
  "Diminue l'amplitude plutôt que de forcer ; arrête-toi en cas de douleur",
  "Grossesse, douleur lombaire ou blessure récente : demande l'avis d'un professionnel",
];

// Modèle d'un exercice Pilates → format commun de l'application
function definePilates(s) {
  return {
    pilates: true,
    id: s.id,
    nom: s.nom,
    sanskrit: s.nomEn,
    famille: s.famille,
    zone: s.categorie,
    niveau: s.niveau || "debutant",
    moments: s.moments,
    themes: s.themes,
    meridiens: [],
    racines: s.racines,
    mode: "flux",
    respirations: s.repetitions,
    duree: s.repetitions * 10,
    souffle: "alterne",
    cotes: !!s.cotes,
    secondCote: s.secondCote,
    bienfaitsListe: s.bienfaits,
    bienfaits: { physiques: s.bienfaits, mentaux: [], emotionnels: [], energetiques: [] },
    entree: s.etapes.installation,
    optimisation: s.etapes.reperes,
    visualisation: s.etapes.visualisation || "",
    sortie: s.etapes.relachement,
    // Consignes vocales calées sur chaque respiration
    souffleCues: s.etapes.souffle,
    tts: { maintien: `${s.etapes.souffle.inspire} ${s.etapes.souffle.expire}` },
    personnage: { depart: s.personnage.depart, posture: s.personnage.preparation, expiration: s.personnage.mouvement },
    adaptations: s.adaptations || {},
    eviter: s.eviter || [],
    contreIndications: [...PRECAUTIONS, ...(s.precautions || [])],
  };
}

export const POSTURES_PILATES = [
  definePilates({
    id: "pil-torsion-colonne", nom: "Torsion de la colonne", nomEn: "Spine Twist",
    famille: "Assis, rotation du buste", categorie: "mobilite", moments: ["debut"], themes: ["souplesse", "detox"],
    racines: "Ischions au sol", repetitions: 6, cotes: true, secondCote: "Change de côté : tourne maintenant vers la gauche.",
    bienfaits: ["Mobilise la colonne en rotation", "Étire le haut du dos", "Améliore la posture assise"],
    etapes: {
      installation: [
        "Assieds-toi, jambes allongées devant toi, écartées de la largeur des hanches, pieds fléchis.",
        "Grandis-toi depuis le sommet du crâne et ouvre les bras à l'horizontale.",
      ],
      souffle: { inspire: "Inspire pour grandir.", expire: "Expire et tourne le buste vers la droite, en deux petites impulsions." },
      reperes: ["Le bassin ne bouge pas", "Grandis avant de tourner", "Les bras restent dans l'alignement des épaules"],
      visualisation: "Ta colonne est une vis qui s'élève en tournant.",
      relachement: ["Reviens au centre et laisse descendre les bras."],
    },
    personnage: { depart: "assisJambesTendues", preparation: "pilAssisBras", mouvement: "pilAssisTorsion" },
    adaptations: { dos: "Assieds-toi sur un coussin et plie légèrement les genoux.", hanches: "Croise les jambes en tailleur." },
  }),
  definePilates({
    id: "pil-nage-prep", nom: "Préparation à la nage", nomEn: "Swimming Prep",
    famille: "Sur le ventre, extension", categorie: "force", moments: ["milieu"], themes: ["energie"],
    racines: "Bassin et ventre au sol", repetitions: 6, cotes: true, secondCote: "Change : bras gauche et jambe droite.",
    bienfaits: ["Renforce le dos et les fessiers", "Développe la coordination", "Stabilise le bassin"],
    etapes: {
      installation: [
        "Allonge-toi sur le ventre, bras allongés devant toi, jambes tendues.",
        "Pose le front sur un petit coussin et rentre doucement le nombril vers la colonne.",
      ],
      souffle: { inspire: "Inspire pour allonger tout le corps.", expire: "Expire et soulève le bras droit et la jambe gauche, sans cambrer." },
      reperes: ["Allonge plus que tu ne lèves", "Le bassin reste au sol", "Regard vers le tapis, nuque longue"],
      visualisation: "On tire doucement tes doigts et tes orteils dans deux directions opposées.",
      relachement: ["Repose bras et jambes, et tourne la tête sur le côté pour te détendre."],
    },
    personnage: { depart: "ventre", preparation: "pilVentreBras", mouvement: "pilNage" },
    adaptations: { dos: "Lève seulement le bras, ou seulement la jambe." },
  }),
  definePilates({
    id: "pil-cote-rotation", nom: "Rotation couché sur le côté", nomEn: "Side Kick",
    famille: "Allongé sur le côté, jambe du dessus", categorie: "stabilite", moments: ["milieu"], themes: ["souplesse"],
    racines: "Hanche et coude au sol", repetitions: 8, cotes: true,
    bienfaits: ["Renforce les fessiers et les abducteurs", "Stabilise le bassin", "Mobilise la hanche"],
    etapes: {
      installation: [
        "Allonge-toi sur le côté droit, la tête dans la main droite, la main gauche posée devant toi.",
        "Avance légèrement les deux jambes pour former un angle avec le buste.",
        "Monte la jambe du dessus à hauteur de hanche.",
      ],
      souffle: { inspire: "Inspire et balance la jambe vers l'avant, deux petits battements.", expire: "Expire et emmène la jambe vers l'arrière, en allongeant." },
      reperes: ["Le buste reste immobile", "La taille ne s'affaisse pas", "Mouvement fluide et contrôlé"],
      visualisation: "Ta jambe est un balancier d'horloge, ton buste reste immobile.",
      relachement: ["Repose la jambe sur l'autre et roule sur le dos avant de changer de côté."],
    },
    personnage: { depart: "pilCote", preparation: "pilCoteAvant", mouvement: "pilCoteArriere" },
    adaptations: { epaules: "Pose la tête sur le bras allongé plutôt que dans la main." },
  }),
  definePilates({
    id: "pil-abdos-prep", nom: "Préparation abdominale", nomEn: "Ab Prep",
    famille: "Allongé, enroulement du haut du dos", categorie: "core", moments: ["debut"], themes: ["energie"],
    racines: "Dos et pieds au sol", repetitions: 8,
    bienfaits: ["Réveille les abdominaux profonds", "Apprend à enrouler la colonne vertèbre par vertèbre", "Protège le bas du dos"],
    etapes: {
      installation: [
        "Allonge-toi sur le dos, genoux pliés, pieds à plat, largeur de bassin.",
        "Croise les mains derrière la tête, coudes ouverts dans ton champ de vision.",
      ],
      souffle: { inspire: "Inspire pour préparer.", expire: "Expire et enroule la tête et les épaules, vertèbre par vertèbre." },
      reperes: ["Le menton reste à distance de la poitrine", "Le bas du dos reste posé", "Les mains soutiennent la tête sans tirer"],
      visualisation: "Ton buste s'enroule comme une vague qui se forme.",
      relachement: ["Déroule doucement jusqu'au sol et relâche la nuque."],
    },
    personnage: { depart: "dosGenouxPlies", preparation: "pilDosMainsTete", mouvement: "pilEnroule" },
    adaptations: { nuque: "Garde la tête posée et engage seulement le ventre." },
  }),
  definePilates({
    id: "pil-etirement-jambe", nom: "Étirement de jambe isolée", nomEn: "Single Leg Stretch",
    famille: "Allongé, enroulé, alternance des jambes", categorie: "core", moments: ["milieu"], themes: ["energie"],
    racines: "Bas du dos au sol", repetitions: 8, niveau: "intermediaire",
    bienfaits: ["Renforce la ceinture abdominale", "Développe la coordination", "Mobilise les hanches"],
    etapes: {
      installation: [
        "Allongé sur le dos, ramène les genoux vers la poitrine.",
        "Enroule la tête et les épaules, mains sur les tibias.",
      ],
      souffle: { inspire: "Inspire et ramène le genou droit, jambe gauche allongée.", expire: "Expire et change de jambe, en gardant le buste enroulé." },
      reperes: ["Le buste reste enroulé et immobile", "La jambe tendue reste à la hauteur que tu contrôles", "Le bas du dos colle au tapis"],
      visualisation: "Tes jambes pédalent lentement sur un vélo invisible.",
      relachement: ["Ramène les deux genoux à la poitrine et pose la tête."],
    },
    personnage: { depart: "dosGenouxPlies", preparation: "pilTable", mouvement: "pilJambeIsolee" },
    adaptations: { nuque: "Laisse la tête au sol.", dos: "Allonge la jambe plus haut, vers le plafond." },
  }),
  definePilates({
    id: "pil-roulement-obliques", nom: "Roulement arrière des obliques", nomEn: "Oblique Roll Back",
    famille: "Assis, enroulement arrière avec rotation", categorie: "core", moments: ["milieu"], themes: ["detox"],
    racines: "Ischions et pieds au sol", repetitions: 6, cotes: true,
    bienfaits: ["Renforce les obliques", "Mobilise le bas du dos", "Développe le contrôle de l'enroulement"],
    etapes: {
      installation: [
        "Assieds-toi, genoux pliés, pieds au sol, bras tendus devant toi.",
        "Arrondis légèrement le bas du dos en reculant le bassin.",
      ],
      souffle: { inspire: "Inspire et grandis-toi.", expire: "Expire, recule à mi-chemin en ouvrant le bras droit derrière toi." },
      reperes: ["Le dos reste arrondi", "Le regard suit la main qui s'ouvre", "Les pieds restent au sol"],
      visualisation: "Ton buste s'ouvre comme une porte qui pivote doucement.",
      relachement: ["Reviens assis en ramenant le bras devant, puis change de côté."],
    },
    personnage: { depart: "pilAssisGenoux", preparation: "pilAssisGenouxBras", mouvement: "pilRoulementArriere" },
    adaptations: { dos: "Recule moins loin et tiens l'arrière des cuisses." },
  }),
  definePilates({
    id: "pil-brasse-prep", nom: "Préparation à la brasse", nomEn: "Breaststroke Prep",
    famille: "Sur le ventre, extension du haut du dos", categorie: "force", moments: ["milieu"], themes: ["energie"],
    racines: "Bassin au sol", repetitions: 6,
    bienfaits: ["Renforce les muscles du haut du dos", "Ouvre la poitrine", "Contrebalance la position assise"],
    etapes: {
      installation: [
        "Allonge-toi sur le ventre, bras le long du corps, paumes vers le sol.",
        "Pose le front au sol et engage doucement le ventre.",
      ],
      souffle: { inspire: "Inspire et allonge la colonne.", expire: "Expire et soulève légèrement la tête et la poitrine, bras qui glissent vers les pieds." },
      reperes: ["Les omoplates glissent vers le bas", "Le regard reste au sol", "On allonge avant de monter"],
      visualisation: "Tu glisses à la surface de l'eau comme un nageur.",
      relachement: ["Redescends lentement et repose le front."],
    },
    personnage: { depart: "ventre", preparation: "pilVentreBrasCorps", mouvement: "pilBrasse" },
    adaptations: { dos: "Soulève à peine la poitrine." },
  }),
  definePilates({
    id: "pil-flexion-laterale", nom: "Préparation à la flexion latérale", nomEn: "Side Bend Prep",
    famille: "Assis sur le côté, élévation latérale", categorie: "stabilite", moments: ["milieu"], themes: ["energie"],
    racines: "Une main et les jambes", repetitions: 6, cotes: true, niveau: "intermediaire",
    bienfaits: ["Renforce les obliques et les épaules", "Stabilise le bassin", "Étire les flancs"],
    etapes: {
      installation: [
        "Assieds-toi sur la hanche droite, genoux pliés, pieds l'un devant l'autre.",
        "Pose la main droite au sol sous l'épaule.",
      ],
      souffle: { inspire: "Inspire pour préparer.", expire: "Expire et soulève les hanches, bras libre vers le ciel." },
      reperes: ["L'épaule d'appui est stable", "Le corps forme une ligne", "Le cou reste long"],
      visualisation: "Ton corps dessine un arc-en-ciel.",
      relachement: ["Repose doucement les hanches et secoue le poignet avant de changer de côté."],
    },
    personnage: { depart: "pilAssisCote", preparation: "pilAssisCote", mouvement: "pilFlexionLaterale" },
    adaptations: { epaules: "Reste sur l'avant-bras plutôt que sur la main." },
    eviter: ["epaules"],
  }),
  definePilates({
    id: "pil-ballon", nom: "Le ballon", nomEn: "Rolling Like a Ball",
    famille: "Assis en boule, roulade arrière", categorie: "core", moments: ["milieu"], themes: ["energie", "lacher-prise"],
    racines: "Équilibre sur les ischions", repetitions: 6, niveau: "intermediaire",
    bienfaits: ["Masse la colonne vertébrale", "Développe le contrôle et l'équilibre", "Renforce les abdominaux"],
    etapes: {
      installation: [
        "Assieds-toi en boule, genoux contre la poitrine, mains sur les tibias.",
        "Trouve ton équilibre en arrière des ischions, pieds légèrement décollés.",
      ],
      souffle: { inspire: "Inspire et roule en arrière jusqu'aux omoplates.", expire: "Expire et reviens en équilibre, sans poser les pieds." },
      reperes: ["Garde la même forme de boule", "Ne roule jamais sur la nuque", "Le ventre initie le retour"],
      visualisation: "Tu es un ballon qui roule doucement et revient en équilibre.",
      relachement: ["Pose les pieds au sol et relâche les bras."],
    },
    personnage: { depart: "pilBoule", preparation: "pilBouleArriere", mouvement: "pilBoule" },
    adaptations: { dos: "Reste en équilibre sans rouler." },
    eviter: ["dos", "nuque"],
    precautions: ["À éviter en cas de problème de cervicales ou de dos"],
  }),
  definePilates({
    id: "pil-ciseaux", nom: "Les ciseaux", nomEn: "Scissors",
    famille: "Allongé, jambes en ciseaux", categorie: "core", moments: ["milieu"], themes: ["souplesse", "energie"],
    racines: "Bas du dos au sol", repetitions: 8, niveau: "intermediaire",
    bienfaits: ["Renforce les abdominaux", "Étire l'arrière des cuisses", "Développe la stabilité du bassin"],
    etapes: {
      installation: [
        "Allongé sur le dos, monte les deux jambes tendues vers le ciel.",
        "Enroule la tête et les épaules.",
      ],
      souffle: { inspire: "Inspire et ouvre les jambes en ciseaux, une vers toi, une vers le sol.", expire: "Expire et change de jambe, en contrôlant." },
      reperes: ["Le bassin reste immobile", "Les jambes restent longues", "Le bas du dos reste au sol"],
      visualisation: "Tes jambes sont les lames de grands ciseaux qui coupent l'air.",
      relachement: ["Plie les genoux vers la poitrine et repose la tête."],
    },
    personnage: { depart: "dosGenouxPlies", preparation: "pilJambesCiel", mouvement: "pilCiseaux" },
    adaptations: { dos: "Garde les genoux légèrement pliés.", nuque: "Laisse la tête au sol." },
  }),
  definePilates({
    id: "pil-cygne-prep", nom: "Préparation au plongeon du cygne", nomEn: "Swan Prep",
    famille: "Sur le ventre, extension de la colonne", categorie: "mobilite", moments: ["milieu"], themes: ["energie", "souplesse"],
    racines: "Bassin et mains", repetitions: 6,
    bienfaits: ["Assouplit la colonne en extension", "Renforce les extenseurs du dos", "Ouvre la poitrine"],
    etapes: {
      installation: [
        "Allonge-toi sur le ventre, mains sous les épaules, coudes près du corps.",
        "Jambes allongées, largeur de bassin, ventre légèrement engagé.",
      ],
      souffle: { inspire: "Inspire et soulève la tête, puis la poitrine, en poussant doucement dans les mains.", expire: "Expire et redescends vertèbre par vertèbre." },
      reperes: ["Le regard monte en dernier", "Les épaules restent basses", "Les hanches restent au sol"],
      visualisation: "Ton buste s'élève comme le cou d'un cygne.",
      relachement: ["Repose le front et recule en posture de l'enfant."],
    },
    personnage: { depart: "ventre", preparation: "pilVentreMains", mouvement: "pilCygne" },
    adaptations: { dos: "Reste sur les avant-bras, comme le sphinx." },
    eviter: ["grossesse"],
  }),
  definePilates({
    id: "pil-cercles-hanches", nom: "Roulements des hanches", nomEn: "Hip Circles",
    famille: "Assis en appui sur les avant-bras, cercles des jambes", categorie: "core", moments: ["milieu"], themes: ["energie"],
    racines: "Avant-bras et ischions", repetitions: 6, niveau: "intermediaire",
    bienfaits: ["Renforce les abdominaux et les obliques", "Mobilise les hanches", "Stabilise les épaules"],
    etapes: {
      installation: [
        "Assieds-toi en appui sur les avant-bras, buste incliné vers l'arrière.",
        "Monte les jambes jointes, genoux pliés ou tendus.",
      ],
      souffle: { inspire: "Inspire et dessine la première moitié d'un cercle avec les jambes.", expire: "Expire et termine le cercle en remontant." },
      reperes: ["Les épaules restent loin des oreilles", "Petit cercle contrôlé", "La poitrine reste ouverte"],
      visualisation: "Tes pieds tracent un cercle sur un grand tableau.",
      relachement: ["Repose les pieds au sol et allonge-toi sur le dos."],
    },
    personnage: { depart: "pilAppuiAvantBras", preparation: "pilAppuiJambesHaut", mouvement: "pilAppuiJambesBas" },
    adaptations: { dos: "Garde les genoux pliés et fais de tout petits cercles." },
    eviter: ["dos"],
  }),
  definePilates({
    id: "pil-pompes-prep", nom: "Préparation aux pompes", nomEn: "Push-up Prep",
    famille: "Planche, à genoux ou sur les pieds", categorie: "force", moments: ["milieu"], themes: ["energie"],
    racines: "Mains et pieds", repetitions: 6,
    bienfaits: ["Renforce les bras, les épaules et le centre", "Apprend à garder la colonne neutre", "Améliore la posture"],
    etapes: {
      installation: [
        "Depuis quatre pattes, pose les mains sous les épaules.",
        "Recule les jambes une à une pour former une planche, ou garde les genoux au sol.",
      ],
      souffle: { inspire: "Inspire et fléchis légèrement les coudes vers l'arrière.", expire: "Expire et repousse le sol en restant gainé." },
      reperes: ["Le corps forme une ligne", "Les coudes restent près du corps", "Le ventre est engagé"],
      visualisation: "Ton corps est une planche de bois, solide et légère.",
      relachement: ["Pose les genoux et viens en posture de l'enfant."],
    },
    personnage: { depart: "quatrePattes", preparation: "pilPlancheBas", mouvement: "pilPlanche" },
    adaptations: { debutant: "Garde les genoux au sol.", epaules: "Mains sur le bord d'une chaise ou contre un mur." },
  }),
  definePilates({
    id: "pil-chat", nom: "Pose du chat", nomEn: "Cat Stretch",
    famille: "À quatre pattes, flexion et extension", categorie: "mobilite", moments: ["debut", "fin"], themes: ["souplesse", "calme"],
    racines: "Mains et genoux", repetitions: 6,
    bienfaits: ["Mobilise toute la colonne", "Relâche le dos", "Coordonne souffle et mouvement"],
    etapes: {
      installation: ["Mets-toi à quatre pattes, mains sous les épaules, genoux sous les hanches, dos neutre."],
      souffle: { inspire: "Inspire et allonge la colonne, dos neutre.", expire: "Expire et arrondis le dos, vertèbre par vertèbre, en commençant par le coccyx." },
      reperes: ["Le mouvement part du bassin", "La tête suit la colonne", "Les bras restent tendus"],
      visualisation: "Un chat qui s'étire au réveil.",
      relachement: ["Reviens au dos neutre puis assieds-toi sur les talons."],
    },
    personnage: { depart: "quatrePattes", preparation: "quatrePattes", mouvement: "dosRond" },
    adaptations: { genoux: "Couverture sous les genoux." },
  }),
  definePilates({
    id: "pil-sirene", nom: "La sirène", nomEn: "The Mermaid",
    famille: "Assis, flexion latérale", categorie: "mobilite", moments: ["fin"], themes: ["souplesse", "calme"],
    racines: "Ischions au sol", repetitions: 5, cotes: true,
    bienfaits: ["Étire les flancs et le dos", "Ouvre la cage thoracique", "Apaise en fin de séance"],
    etapes: {
      installation: [
        "Assieds-toi, jambes pliées sur le côté gauche.",
        "Pose la main gauche sur les chevilles et lève le bras droit.",
      ],
      souffle: { inspire: "Inspire et grandis-toi vers le ciel.", expire: "Expire et penche-toi vers la gauche, comme une vague." },
      reperes: ["Les deux ischions restent au sol", "Le bras dessine un grand arc", "Le cou reste détendu"],
      visualisation: "Une sirène qui s'étire sur un rocher au soleil.",
      relachement: ["Reviens au centre, pose les mains et change de côté."],
    },
    personnage: { depart: "pilAssisCote", preparation: "pilSireneHaut", mouvement: "pilSirene" },
    adaptations: { hanches: "Assieds-toi en tailleur." },
  }),
];

export const PROGRAMMES_PILATES = [
  {
    id: "pil-decouverte",
    titre: "Pilates découverte · 10 min",
    description: "Les fondamentaux : centre, colonne et respiration, accessibles aux débutants.",
    theme: "energie",
    postures: ["pil-chat", "pil-abdos-prep", "pil-torsion-colonne", "pil-nage-prep", "pil-sirene"],
  },
  {
    id: "pil-centre",
    titre: "Centre & dos forts",
    description: "Une séance tonique pour la ceinture abdominale et les muscles du dos.",
    theme: "energie",
    postures: ["pil-abdos-prep", "pil-etirement-jambe", "pil-roulement-obliques", "pil-brasse-prep", "pil-cygne-prep", "pil-chat"],
  },
  {
    id: "pil-complet",
    titre: "Pilates complet · 15 exercices",
    description: "Le programme complet, du réveil de la colonne à la sirène.",
    theme: "energie",
    postures: [
      "pil-chat", "pil-abdos-prep", "pil-etirement-jambe", "pil-ciseaux", "pil-ballon", "pil-roulement-obliques",
      "pil-torsion-colonne", "pil-cercles-hanches", "pil-cote-rotation", "pil-flexion-laterale", "pil-nage-prep",
      "pil-brasse-prep", "pil-cygne-prep", "pil-pompes-prep", "pil-sirene",
    ],
  },
];
