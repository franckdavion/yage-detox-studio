// Animations des postures : une silhouette articulée passe de la position de départ
// à la posture finale, puis « respire » dans la tenue. Boucle douce, vue de profil.
// Aucune dépendance : SVG + requestAnimationFrame.
import { zenIllustration } from "./ui.js";
import { createEyeGuide } from "./eyes.js";

// Articulations : H tête, N épaules, P bassin, K/F genou/pied (jambe 1 et 2), E/W coude/main (bras 1 et 2)
// Repère 320 × 200, sol à y = 158.
const P = {
  assisJambesTendues: { H: [128, 70], N: [130, 90], P: [130, 146], K1: [176, 150], F1: [226, 154], K2: [172, 152], F2: [222, 156], E1: [142, 116], W1: [152, 142], E2: [138, 118], W2: [146, 144] },
  assisTailleur: { H: [160, 68], N: [160, 88], P: [160, 144], K1: [196, 146], F1: [168, 156], K2: [126, 146], F2: [154, 156], E1: [174, 114], W1: [190, 138], E2: [146, 114], W2: [130, 138] },
  flexionAvant: { H: [198, 132], N: [180, 120], P: [130, 148], K1: [176, 150], F1: [226, 154], K2: [172, 152], F2: [222, 156], E1: [200, 138], W1: [218, 150], E2: [196, 140], W2: [212, 152] },
  papillon: { H: [196, 128], N: [182, 116], P: [140, 148], K1: [178, 134], F1: [168, 156], K2: [174, 140], F2: [166, 157], E1: [190, 140], W1: [172, 154], E2: [186, 142], W2: [168, 155] },
  quatrePattes: { H: [212, 104], N: [196, 112], P: [122, 114], K1: [122, 156], F1: [84, 157], K2: [126, 156], F2: [88, 157], E1: [196, 134], W1: [196, 156], E2: [200, 134], W2: [200, 156] },
  enfant: { H: [196, 150], N: [176, 146], P: [112, 138], K1: [150, 156], F1: [96, 157], K2: [154, 156], F2: [100, 157], E1: [150, 154], W1: [120, 156], E2: [154, 155], W2: [124, 157] },
  coeurFondant: { H: [206, 150], N: [186, 148], P: [122, 110], K1: [122, 156], F1: [84, 157], K2: [126, 156], F2: [88, 157], E1: [222, 152], W1: [254, 154], E2: [224, 154], W2: [258, 156] },
  ventre: { H: [224, 148], N: [206, 152], P: [140, 152], K1: [100, 155], F1: [60, 155], K2: [102, 156], F2: [62, 156], E1: [212, 156], W1: [236, 156], E2: [214, 156], W2: [238, 157] },
  sphinx: { H: [218, 102], N: [202, 118], P: [140, 152], K1: [100, 155], F1: [60, 155], K2: [102, 156], F2: [62, 156], E1: [202, 156], W1: [234, 156], E2: [204, 156], W2: [236, 157] },
  dosGenouxPlies: { H: [78, 150], N: [96, 152], P: [162, 152], K1: [190, 124], F1: [212, 155], K2: [194, 126], F2: [216, 156], E1: [118, 155], W1: [140, 156], E2: [120, 156], W2: [142, 157] },
  dosAllonge: { H: [78, 150], N: [96, 152], P: [162, 152], K1: [200, 154], F1: [240, 154], K2: [202, 155], F2: [242, 156], E1: [118, 155], W1: [142, 156], E2: [120, 156], W2: [144, 157] },
  dosPapillon: { H: [78, 140], N: [96, 142], P: [162, 152], K1: [196, 132], F1: [184, 156], K2: [200, 140], F2: [186, 157], E1: [118, 150], W1: [142, 156], E2: [120, 151], W2: [144, 157] },
  torsion: { H: [74, 146], N: [96, 152], P: [162, 152], K1: [190, 146], F1: [212, 156], K2: [192, 150], F2: [214, 157], E1: [100, 128], W1: [96, 104], E2: [130, 150], W2: [176, 148] },
  jambesMur: { H: [78, 150], N: [96, 152], P: [166, 150], K1: [168, 108], F1: [170, 62], K2: [172, 108], F2: [174, 62], E1: [112, 140], W1: [126, 128], E2: [114, 142], W2: [128, 130] },
  escargot: { H: [72, 152], N: [94, 148], P: [106, 100], K1: [76, 106], F1: [92, 82], K2: [80, 108], F2: [96, 84], E1: [114, 136], W1: [108, 114], E2: [116, 138], W2: [110, 116] },
  bebeHeureux: { H: [78, 148], N: [96, 150], P: [162, 152], K1: [150, 116], F1: [168, 84], K2: [154, 118], F2: [172, 86], E1: [128, 116], W1: [162, 88], E2: [130, 118], W2: [166, 90] },
  debout: { H: [160, 38], N: [160, 56], P: [160, 106], K1: [160, 132], F1: [160, 158], K2: [164, 132], F2: [166, 158], E1: [158, 80], W1: [158, 104], E2: [162, 80], W2: [162, 104] },
  cloche: { H: [150, 150], N: [154, 134], P: [166, 104], K1: [162, 132], F1: [160, 158], K2: [166, 132], F2: [166, 158], E1: [148, 146], W1: [158, 140], E2: [152, 148], W2: [162, 142] },
  squat: { H: [158, 80], N: [160, 98], P: [150, 142], K1: [186, 124], F1: [170, 158], K2: [182, 128], F2: [166, 158], E1: [178, 116], W1: [168, 104], E2: [174, 118], W2: [166, 106] },
  lezard: { H: [226, 120], N: [208, 126], P: [148, 140], K1: [200, 118], F1: [204, 157], K2: [110, 156], F2: [64, 157], E1: [212, 142], W1: [214, 157], E2: [214, 144], W2: [218, 157] },
  pigeon: { H: [232, 146], N: [212, 148], P: [150, 146], K1: [196, 146], F1: [168, 156], K2: [110, 156], F2: [60, 156], E1: [236, 154], W1: [262, 155], E2: [238, 155], W2: [264, 156] },
  grenouille: { H: [214, 140], N: [196, 136], P: [122, 132], K1: [126, 156], F1: [92, 156], K2: [130, 156], F2: [96, 156], E1: [196, 156], W1: [220, 156], E2: [198, 156], W2: [224, 157] },
  diamant: { H: [160, 62], N: [160, 80], P: [158, 140], K1: [196, 156], F1: [150, 157], K2: [198, 157], F2: [152, 158], E1: [170, 108], W1: [186, 134], E2: [172, 110], W2: [188, 136] },
  heros: { H: [80, 142], N: [98, 146], P: [150, 150], K1: [200, 156], F1: [154, 157], K2: [202, 157], F2: [156, 158], E1: [118, 152], W1: [140, 155], E2: [120, 153], W2: [142, 156] },
  // --- Sur chaise (assise à droite du dossier, regard vers la droite) ---
  chaiseAssis: { H: [128, 50], N: [128, 68], P: [124, 106], K1: [164, 108], F1: [168, 156], K2: [160, 110], F2: [164, 157], E1: [136, 88], W1: [156, 104], E2: [134, 90], W2: [152, 106] },
  chaiseBrasHaut: { H: [130, 50], N: [128, 68], P: [124, 106], K1: [164, 108], F1: [168, 156], K2: [160, 110], F2: [164, 157], E1: [136, 40], W1: [134, 16], E2: [132, 42], W2: [132, 18] },
  chaiseMainsCoeur: { H: [130, 50], N: [128, 68], P: [124, 106], K1: [164, 108], F1: [168, 156], K2: [160, 110], F2: [164, 157], E1: [142, 92], W1: [146, 76], E2: [140, 94], W2: [144, 78] },
  chaiseBrasDevant: { H: [138, 58], N: [130, 70], P: [124, 106], K1: [164, 108], F1: [168, 156], K2: [160, 110], F2: [164, 157], E1: [152, 70], W1: [176, 70], E2: [150, 72], W2: [174, 72] },
  chaiseLateral: { H: [118, 54], N: [124, 70], P: [124, 106], K1: [164, 108], F1: [168, 156], K2: [160, 110], F2: [164, 157], E1: [118, 44], W1: [104, 24], E2: [116, 46], W2: [102, 26] },
  chaiseNuque: { H: [140, 66], N: [130, 72], P: [124, 106], K1: [164, 108], F1: [168, 156], K2: [160, 110], F2: [164, 157], E1: [146, 56], W1: [132, 54], E2: [144, 58], W2: [130, 56] },
  chaiseCoeur: { H: [132, 48], N: [130, 66], P: [124, 106], K1: [164, 108], F1: [168, 156], K2: [160, 110], F2: [164, 157], E1: [114, 84], W1: [108, 100], E2: [116, 86], W2: [110, 102] },
  chaiseDosCreux: { H: [142, 48], N: [134, 68], P: [124, 106], K1: [164, 108], F1: [168, 156], K2: [160, 110], F2: [164, 157], E1: [150, 90], W1: [162, 106], E2: [148, 92], W2: [160, 108] },
  chaiseDosRond: { H: [150, 84], N: [140, 74], P: [122, 106], K1: [164, 108], F1: [168, 156], K2: [160, 110], F2: [164, 157], E1: [154, 92], W1: [162, 106], E2: [152, 94], W2: [160, 108] },
  chaiseTorsion: { H: [124, 50], N: [126, 68], P: [124, 106], K1: [164, 108], F1: [168, 156], K2: [160, 110], F2: [164, 157], E1: [112, 88], W1: [104, 108], E2: [140, 90], W2: [158, 104] },
  chaiseSciatique: { H: [140, 54], N: [134, 70], P: [124, 106], K1: [154, 94], F1: [164, 110], K2: [160, 110], F2: [164, 157], E1: [148, 90], W1: [154, 96], E2: [146, 94], W2: [162, 108] },
  chaiseRelax: { H: [164, 128], N: [154, 104], P: [122, 106], K1: [164, 108], F1: [168, 156], K2: [160, 110], F2: [164, 157], E1: [162, 128], W1: [164, 152], E2: [160, 130], W2: [162, 154] },
  banane: { H: [70, 138], N: [92, 146], P: [162, 152], K1: [200, 148], F1: [238, 140], K2: [202, 150], F2: [240, 142], E1: [70, 120], W1: [52, 108], E2: [74, 122], W2: [56, 110] },
};

// Départ → arrivée par posture (repli : par famille)
const PAR_POSTURE = {
  papillon: ["assisTailleur", "papillon"],
  "papillon-allonge": ["assisTailleur", "dosPapillon"],
  banane: ["dosAllonge", "banane"],
  escargot: ["dosGenouxPlies", "escargot"],
  "coeur-fondant": ["quatrePattes", "coeurFondant"],
  "jambes-mur": ["dosGenouxPlies", "jambesMur"],
  diamant: ["assisJambesTendues", "diamant"],
  sphinx: ["ventre", "sphinx"],
  "double-pigeon": ["assisJambesTendues", "assisTailleur"],
  grenouille: ["quatrePattes", "grenouille"],
  "bebe-heureux": ["dosAllonge", "bebeHeureux"],
  chenille: ["assisJambesTendues", "flexionAvant"],
  lezard: ["quatrePattes", "lezard"],
  "cerf-endormi": ["assisTailleur", "papillon"],
  "demi-papillon": ["assisJambesTendues", "flexionAvant"],
  "heros-couche": ["diamant", "heros"],
  cygne: ["quatrePattes", "pigeon"],
  savasana: ["dosGenouxPlies", "dosAllonge"],
  lacet: ["quatrePattes", "papillon"],
  libellule: ["assisJambesTendues", "flexionAvant"],
  guirlande: ["debout", "squat"],
  enfant: ["quatrePattes", "enfant"],
  cloche: ["debout", "cloche"],
  "torsion-dos": ["dosGenouxPlies", "torsion"],
  "chat-queue": ["dosGenouxPlies", "torsion"],
  // Chaise : [départ, posture, posture à l'expiration (facultatif, pour les mouvements rythmés)]
  "chaise-assise": ["chaiseAssis", "chaiseAssis"],
  "chaise-ouverture-bras": ["chaiseAssis", "chaiseBrasHaut", "chaiseMainsCoeur"],
  "chaise-trapezes": ["chaiseAssis", "chaiseBrasDevant"],
  "chaise-etirement-haut": ["chaiseAssis", "chaiseBrasHaut", "chaiseAssis"],
  "chaise-lateral": ["chaiseAssis", "chaiseLateral"],
  "chaise-nuque": ["chaiseAssis", "chaiseNuque"],
  "chaise-coeur": ["chaiseAssis", "chaiseCoeur"],
  "chaise-dos-creux-rond": ["chaiseAssis", "chaiseDosCreux", "chaiseDosRond"],
  "chaise-torsion": ["chaiseAssis", "chaiseTorsion"],
  "chaise-sciatique": ["chaiseAssis", "chaiseSciatique"],
  "chaise-relaxation": ["chaiseAssis", "chaiseRelax"],
};
const PAR_FAMILLE = [
  [/inversion|mur/, ["dosGenouxPlies", "jambesMur"]],
  [/torsion/, ["dosGenouxPlies", "torsion"]],
  [/debout/, ["debout", "cloche"]],
  [/relaxation|allong/, ["dosGenouxPlies", "dosAllonge"]],
  [/genoux|enfant/, ["quatrePattes", "enfant"]],
  [/arrière/, ["ventre", "sphinx"]],
  [/avant/, ["assisJambesTendues", "flexionAvant"]],
];
export function posesFor(p) {
  const pair = PAR_POSTURE[p.id] || (p.chaise ? ["chaiseAssis", "chaiseBrasHaut"] : null) || PAR_FAMILLE.find(([re]) => re.test(`${p.famille || ""}`.toLowerCase()))?.[1] || ["assisJambesTendues", "assisTailleur"];
  return pair.map((k) => P[k]);
}

const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const lerp = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
function mix(a, b, t) {
  const o = {};
  for (const k in a) o[k] = lerp(a[k], b[k], t);
  return o;
}

// Durées du cycle (ms) : pause départ, transition, tenue qui respire, retour
const T = { debut: 900, entree: 2600, tenue: 4200, retour: 1300 };
const CYCLE = T.debut + T.entree + T.tenue + T.retour;

// ---------- Personnage illustré ----------
// Couleurs du personnage : peau poudrée, haut terracotta, legging sauge, tapis lin.
const C = {
  peau: "#f0d3bf", peauOmbre: "#ddb59c", cheveux: "#4b3a31", haut: "#c98b6b", hautOmbre: "#b07457",
  legging: "#7d8f6e", leggingOmbre: "#66775a", tapis: "#5f6f53", joue: "#e6a58a",
};
const N2 = (v) => { const l = Math.hypot(v[0], v[1]) || 1; return [v[0] / l, v[1] / l]; };
const f1 = (v) => v.toFixed(1);
const seg = (...pts) => "M" + pts.map((q) => `${f1(q[0])} ${f1(q[1])}`).join("L");

// Crée le personnage dans `el` et renvoie un contrôleur piloté de l'extérieur (par le lecteur)
// ou par sa propre horloge (fiche). Rien ne bouge tant que render() n'est pas appelé : la pause est naturelle.
export function createCharacter(el, posture, { background = true, aspect = 1.5 } = {}) {
  // Yoga des yeux : visage de face dont le regard suit l'exercice
  if (posture.yeux) return createEyeGuide(el, posture, { background });
  const [start, end, exhalePose] = posesFor(posture);
  // Variante « plus profonde » de la posture finale, atteinte progressivement pendant la tenue
  const deep = {};
  for (const k in end) deep[k] = [...end[k]];
  for (const k of ["H", "N", "E1", "E2", "W1", "W2"]) deep[k] = [end[k][0] + (end.H[0] > end.P[0] ? 3 : -3) * (k === "H" ? 1 : 0.6), end[k][1] + 3.5];

  el.innerHTML = `
    <div class="pose-anim character">
      ${background ? zenIllustration({ ...posture, famille: "__aucune__" }).replace('class="zen-art"', 'class="zen-art no-figure"') : ""}
      <svg class="pose-figure" preserveAspectRatio="xMidYMid meet" role="img" aria-label="Personnage illustrant ${posture.nom}">
        <circle data-k="aura" r="40" fill="#fbf8f3" opacity=".25"/>
        <rect data-k="mat" rx="2.5" height="5" fill="${C.tapis}" opacity=".35"/>
        ${posture.chaise ? `<g class="chair" stroke-linecap="round" stroke-linejoin="round">
          <path d="M100 116L94 158M140 116L146 158M106 116L110 152" stroke="#a8927c" stroke-width="3.5" fill="none"/>
          <path d="M96 111q-6-30-2-58q2-6 8-5q5 1 5 7q-3 28 2 56z" fill="#e7ddd0" stroke="#cbbba8" stroke-width="1.5"/>
          <rect x="94" y="109" width="54" height="8" rx="4" fill="#e7ddd0" stroke="#cbbba8" stroke-width="1.5"/>
        </g>` : ""}
        <g stroke-linecap="round" stroke-linejoin="round" fill="none">
          <path data-k="leg2" stroke="${C.leggingOmbre}" stroke-width="11"/>
          <path data-k="arm2" stroke="${C.peauOmbre}" stroke-width="7"/>
          <circle data-k="foot2" r="4.2" fill="${C.peauOmbre}" stroke="none"/>
          <circle data-k="hand2" r="3.6" fill="${C.peauOmbre}" stroke="none"/>
          <path data-k="torso" stroke="${C.haut}" stroke-width="17"/>
          <circle data-k="hips" r="9" fill="${C.legging}" stroke="none"/>
          <path data-k="leg1" stroke="${C.legging}" stroke-width="11.5"/>
          <circle data-k="foot1" r="4.4" fill="${C.peau}" stroke="none"/>
          <path data-k="neck" stroke="${C.peau}" stroke-width="6"/>
          <path data-k="arm1" stroke="${C.peau}" stroke-width="7.5"/>
          <circle data-k="hand1" r="3.8" fill="${C.peau}" stroke="none"/>
        </g>
        <circle data-k="bun" r="6" fill="${C.cheveux}"/>
        <circle data-k="hair" r="12" fill="${C.cheveux}"/>
        <circle data-k="head" r="10.5" fill="${C.peau}"/>
        <circle data-k="cheek" r="2.6" fill="${C.joue}" opacity=".55"/>
        <path data-k="eye" stroke="${C.cheveux}" stroke-width="1.4" stroke-linecap="round" fill="none"/>
      </svg>
      <span class="pose-label" data-k="label"></span>
    </div>`;
  const svg = el.querySelector(".pose-figure");
  // Cadrage automatique
  const pts = [...Object.values(start), ...Object.values(end), ...(exhalePose ? Object.values(exhalePose) : []), ...(posture.chaise ? [[92, 48], [148, 158]] : [])];
  const xs = pts.map((q) => q[0]), ys = pts.map((q) => q[1]);
  const x0 = Math.min(...xs) - 26, x1 = Math.max(...xs) + 26, y0 = Math.min(...ys) - 28, y1 = 168;
  let w = Math.max(x1 - x0, 130), h = Math.max(y1 - y0, 90);
  const cx = (x0 + x1) / 2;
  if (w / h < aspect) w = h * aspect; else h = w / aspect;
  svg.setAttribute("viewBox", `${f1(cx - w / 2)} ${f1(y1 - h)} ${f1(w)} ${f1(h)}`);
  const k = Object.fromEntries([...svg.querySelectorAll("[data-k]")].map((n) => [n.dataset.k, n]));
  const label = el.querySelector('[data-k="label"]');
  k.mat.setAttribute("x", f1(x0 + 6)); k.mat.setAttribute("y", "158.5"); k.mat.setAttribute("width", f1(x1 - x0 - 12));
  let lastLabel = null;

  function draw(j, { breath = 0.5, blink = false, aura = 0.25 } = {}) {
    // Torse courbe, cou, membres
    const up = N2([j.N[0] - j.P[0], j.N[1] - j.P[1]]);
    const neck = [j.N[0] + up[0] * 4, j.N[1] + up[1] * 4];
    const mid = lerp(j.N, j.P, 0.5);
    const per = [-up[1], up[0]];
    const chest = (breath - 0.5) * 2.2; // la poitrine s'ouvre à l'inspiration
    const c = [mid[0] + per[0] * (4 + chest), mid[1] + per[1] * (4 + chest)];
    k.torso.setAttribute("d", `M${f1(j.N[0])} ${f1(j.N[1])}Q${f1(c[0])} ${f1(c[1])} ${f1(j.P[0])} ${f1(j.P[1])}`);
    k.torso.setAttribute("stroke-width", f1(17 + chest * 0.8));
    k.neck.setAttribute("d", seg(neck, lerp(neck, j.H, 0.55)));
    k.leg1.setAttribute("d", seg(j.P, j.K1, j.F1));
    k.leg2.setAttribute("d", seg(j.P, j.K2, j.F2));
    k.arm1.setAttribute("d", seg(j.N, j.E1, j.W1));
    k.arm2.setAttribute("d", seg(j.N, j.E2, j.W2));
    const at = (n, q) => { n.setAttribute("cx", f1(q[0])); n.setAttribute("cy", f1(q[1])); };
    at(k.hips, j.P); at(k.foot1, j.F1); at(k.foot2, j.F2); at(k.hand1, j.W1); at(k.hand2, j.W2); at(k.head, j.H);
    // Orientation du visage : perpendiculaire au cou, du côté des jambes
    const hd = N2([j.H[0] - j.N[0], j.H[1] - j.N[1]]);
    const legs = [j.F1[0] - j.P[0], j.F1[1] - j.P[1] - 0.3 * Math.hypot(j.F1[0] - j.P[0], j.F1[1] - j.P[1])];
    let face = [hd[1], -hd[0]];
    if (face[0] * legs[0] + face[1] * legs[1] < 0) face = [-face[0], -face[1]];
    at(k.bun, [j.H[0] - face[0] * 10 + hd[0] * 3, j.H[1] - face[1] * 10 + hd[1] * 3]);
    // Cheveux : disque légèrement décalé vers l'arrière, le visage le recouvre en croissant
    at(k.hair, [j.H[0] - face[0] * 2.6 - hd[0] * 1.2, j.H[1] - face[1] * 2.6 - hd[1] * 1.2]);
    at(k.head, [j.H[0] + face[0] * 1.6, j.H[1] + face[1] * 1.6]);
    // Visage : œil fermé (sérénité) ; clignement = trait plus fin
    const eye = [j.H[0] + face[0] * 6 + hd[0] * 2, j.H[1] + face[1] * 6 + hd[1] * 2];
    const side = [-hd[0] * 2.6, -hd[1] * 2.6];
    k.eye.setAttribute("d", blink ? seg([eye[0] + side[0], eye[1] + side[1]], [eye[0] - side[0], eye[1] - side[1]])
      : `M${f1(eye[0] + side[0])} ${f1(eye[1] + side[1])}Q${f1(eye[0] + face[0] * 1.6)} ${f1(eye[1] + face[1] * 1.6)} ${f1(eye[0] - side[0])} ${f1(eye[1] - side[1])}`);
    at(k.cheek, [j.H[0] + face[0] * 6 - hd[0] * 3.5, j.H[1] + face[1] * 6 - hd[1] * 3.5]);
    // Aura de respiration autour du buste
    at(k.aura, mid);
    k.aura.setAttribute("r", f1(30 + breath * 14));
    k.aura.setAttribute("opacity", aura.toFixed(2));
  }

  const breatheOn = (pose, b, amp = 1) => {
    const o = { ...pose };
    const lift = (b - 0.5) * 2.6 * amp;
    for (const q of ["H", "N", "E1", "E2"]) o[q] = [pose[q][0], pose[q][1] - lift];
    return o;
  };
  const setLabel = (t) => { if (t !== lastLabel) { lastLabel = t; label.textContent = t; } };
  const softBreath = (t) => (Math.sin(t / 1700) + 1) / 2;

  // État piloté : phase ("installation" | "tenue" | "sortie" | "fin"), t (ms dans la phase),
  // length (durée totale de la phase si connue), breath (0 → expiré, 1 → inspiré)
  function render({ phase, t = 0, length = 0, breath = null, inhale = null }) {
    const blink = phase !== "fin" && t % 6200 > 6050;
    if (phase === "installation") {
      const T0 = 1400, T1 = 4600;
      if (t < T0) { draw(start, { breath: softBreath(t), blink }); setLabel("Je m'installe"); }
      else if (t < T0 + T1) { draw(mix(start, end, ease((t - T0) / T1)), { breath: 0.5, blink }); setLabel("J'entre doucement"); }
      else { const b = softBreath(t); draw(breatheOn(end, b, 0.6), { breath: b, blink, aura: 0.2 + b * 0.1 }); setLabel("Je trouve mon confort"); }
    } else if (phase === "tenue") {
      const b = breath ?? softBreath(t);
      const melt = length ? ease(Math.min(1, t / length)) : 0; // on « fond » peu à peu dans la posture
      // Mouvement rythmé (chaise) : la posture « expiration » et la posture « inspiration » alternent avec le souffle
      const held = exhalePose ? mix(exhalePose, end, b) : mix(end, deep, melt);
      draw(breatheOn(held, b, exhalePose ? 0.4 : 1.3), { breath: b, blink, aura: 0.18 + b * 0.22 });
      setLabel((inhale ?? b > 0.5) ? "J'inspire…" : "J'expire…");
    } else if (phase === "sortie") {
      const T1 = 4200;
      if (t < T1) { draw(mix(end, start, ease(t / T1)), { breath: 0.5 }); setLabel("Je sors en douceur"); }
      else { const b = softBreath(t); draw(breatheOn(start, b, 0.5), { breath: b, aura: 0.25 }); setLabel("Je ressens"); }
    } else {
      const b = softBreath(t);
      draw(breatheOn(start, b, 0.4), { breath: b, aura: 0.35 }); setLabel("Namasté");
    }
  }
  render({ phase: "installation", t: 0 });
  return { render, el: svg };
}

const reduced = () => matchMedia("(prefers-reduced-motion: reduce)").matches;

// Animation autonome (fiche posture) : le personnage enchaîne entrée, tenue et sortie en boucle.
// Renvoie une fonction d'arrêt.
export function mountPoseAnimation(el, posture, { mode = "boucle", breath = null } = {}) {
  const ch = createCharacter(el, posture);
  if (reduced()) { ch.render({ phase: "tenue", t: 0, breath: 0.5 }); return () => {}; }
  const D = { installation: 7500, tenue: 7000, sortie: 5200 };
  const order = ["installation", "tenue", "sortie"];
  const total = D.installation + D.tenue + D.sortie;
  let raf, t0 = performance.now();
  const frame = (now) => {
    const t = now - t0;
    if (mode === "tenue") ch.render({ phase: "tenue", t, length: 0, breath: breath ? breath() : null });
    else {
      let r = t % total, ph = order[0];
      for (const o of order) { if (r < D[o]) { ph = o; break; } r -= D[o]; }
      ch.render({ phase: ph, t: r, length: ph === "tenue" ? 0 : D[ph] });
    }
    raf = requestAnimationFrame(frame);
  };
  raf = requestAnimationFrame(frame);
  const io = "IntersectionObserver" in window ? new IntersectionObserver(([e]) => {
    cancelAnimationFrame(raf);
    if (e.isIntersecting) raf = requestAnimationFrame(frame);
  }) : null;
  io?.observe(el);
  return () => { cancelAnimationFrame(raf); io?.disconnect(); };
}
