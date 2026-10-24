// Animations des postures : une silhouette articulée passe de la position de départ
// à la posture finale, puis « respire » dans la tenue. Boucle douce, vue de profil.
// Aucune dépendance : SVG + requestAnimationFrame.
import { zenIllustration } from "./ui.js";

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
function posesFor(p) {
  const pair = PAR_POSTURE[p.id] || PAR_FAMILLE.find(([re]) => re.test(`${p.famille || ""}`.toLowerCase()))?.[1] || ["assisJambesTendues", "assisTailleur"];
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

function pathFor(j) {
  const L = (...pts) => "M" + pts.map((p) => p.map((v) => v.toFixed(1)).join(" ")).join("L");
  // Colonne légèrement courbe
  const mid = lerp(j.N, j.P, 0.5);
  const dx = j.P[1] - j.N[1], dy = -(j.P[0] - j.N[0]);
  const len = Math.hypot(dx, dy) || 1;
  const c = [mid[0] + (dx / len) * 6, mid[1] + (dy / len) * 6];
  return {
    spine: `M${j.N[0].toFixed(1)} ${j.N[1].toFixed(1)}Q${c[0].toFixed(1)} ${c[1].toFixed(1)} ${j.P[0].toFixed(1)} ${j.P[1].toFixed(1)}`,
    leg1: L(j.P, j.K1, j.F1),
    leg2: L(j.P, j.K2, j.F2),
    arm1: L(j.N, j.E1, j.W1),
    arm2: L(j.N, j.E2, j.W2),
  };
}

const reduced = () => matchMedia("(prefers-reduced-motion: reduce)").matches;

// Monte l'animation dans `el`. Options : mode "boucle" (entrée + tenue) ou "tenue" (respiration seule).
// Renvoie une fonction d'arrêt.
export function mountPoseAnimation(el, posture, { mode = "boucle", background = true, breath = null } = {}) {
  const [start, end] = posesFor(posture);
  el.innerHTML = `
    <div class="pose-anim">
      ${background ? zenIllustration({ ...posture, famille: "__aucune__" }).replace('class="zen-art"', 'class="zen-art no-figure"') : ""}
      <svg class="pose-figure" viewBox="0 0 320 200" preserveAspectRatio="xMidYMid meet" aria-label="Animation : comment entrer dans ${posture.nom}" role="img">
        <ellipse class="pose-shadow" cx="160" cy="160" rx="90" ry="4"/>
        <g class="far" fill="none" stroke-linecap="round" stroke-linejoin="round">
          <path data-k="leg2"/><path data-k="arm2"/>
        </g>
        <g class="near" fill="none" stroke-linecap="round" stroke-linejoin="round">
          <path data-k="spine"/><path data-k="leg1"/><path data-k="arm1"/>
        </g>
        <circle data-k="head" r="10"/>
      </svg>
      <span class="pose-label" data-k="label"></span>
    </div>`;
  const svg = el.querySelector(".pose-figure");
  // Cadrage automatique : la silhouette remplit l'espace, quelle que soit la posture
  const pts = [...Object.values(start), ...Object.values(end)];
  const xs = pts.map((q) => q[0]), ys = pts.map((q) => q[1]);
  let x0 = Math.min(...xs) - 22, x1 = Math.max(...xs) + 22, y0 = Math.min(...ys) - 22, y1 = 166;
  let w = Math.max(x1 - x0, 150), h = Math.max(y1 - y0, 96);
  const cx = (x0 + x1) / 2;
  if (w / h < 1.6) { w = h * 1.6; }
  svg.setAttribute("viewBox", `${(cx - w / 2).toFixed(1)} ${(y1 - h).toFixed(1)} ${w.toFixed(1)} ${h.toFixed(1)}`);
  svg.querySelector(".pose-shadow").setAttribute("rx", (w * 0.32).toFixed(1));
  svg.querySelector(".pose-shadow").setAttribute("cx", cx.toFixed(1));
  const parts = Object.fromEntries([...svg.querySelectorAll("[data-k]")].map((n) => [n.dataset.k, n]));
  const label = el.querySelector('[data-k="label"]');
  const draw = (j) => {
    const p = pathFor(j);
    for (const k of ["spine", "leg1", "leg2", "arm1", "arm2"]) parts[k].setAttribute("d", p[k]);
    parts.head.setAttribute("cx", j.H[0].toFixed(1));
    parts.head.setAttribute("cy", j.H[1].toFixed(1));
  };

  if (reduced()) { draw(end); label.textContent = "Posture finale"; return () => {}; }

  let raf, t0 = performance.now(), lastLabel = "";
  const setLabel = (t) => { if (t !== lastLabel) { lastLabel = t; label.textContent = t; } };
  const frame = (now) => {
    const t = (now - t0) % CYCLE;
    let j;
    // Respiration : le buste se soulève très légèrement
    const breathe = (pose, amp = 1) => {
      const phase = breath ? breath() : (Math.sin((now - t0) / 1600) + 1) / 2;
      const o = { ...pose };
      const lift = (phase - 0.5) * 2.4 * amp;
      for (const k of ["H", "N", "E1", "E2"]) o[k] = [pose[k][0], pose[k][1] - lift];
      return o;
    };
    if (mode === "tenue") { j = breathe(end, 1.2); setLabel(""); }
    else if (t < T.debut) { j = start; setLabel("Départ"); }
    else if (t < T.debut + T.entree) { j = mix(start, end, ease((t - T.debut) / T.entree)); setLabel("J'entre doucement"); }
    else if (t < T.debut + T.entree + T.tenue) { j = breathe(end); setLabel("Je tiens et je respire"); }
    else { j = mix(end, start, ease((t - T.debut - T.entree - T.tenue) / T.retour)); setLabel("Je sors en douceur"); }
    draw(j);
    raf = requestAnimationFrame(frame);
  };
  raf = requestAnimationFrame(frame);
  // Pause automatique hors écran pour économiser la batterie
  const io = "IntersectionObserver" in window ? new IntersectionObserver(([e]) => {
    cancelAnimationFrame(raf);
    if (e.isIntersecting) raf = requestAnimationFrame(frame);
  }) : null;
  io?.observe(el);
  return () => { cancelAnimationFrame(raf); io?.disconnect(); };
}
