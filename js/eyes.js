// Visage guide pour le yoga des yeux : un visage de face, dans le style zen de l'app,
// dont le regard, les paupières et les mains suivent l'exercice en cours.
// Même contrat que le personnage : render({ phase, t, length, breath }) est appelé
// image par image par le lecteur → synchronisation et pause automatiques.

const C = {
  peau: "#f0d3bf", peauOmbre: "#e2bba3", cheveux: "#4b3a31", blanc: "#fbf8f3",
  iris: "#7d8f6e", pupille: "#2f2a25", joue: "#e6a58a", haut: "#c98b6b", main: "#ecc8b1",
};
const f1 = (v) => v.toFixed(1);
const TAU = Math.PI * 2;
const smooth = (u) => 0.5 - 0.5 * Math.cos(Math.PI * Math.min(1, Math.max(0, u)));
const lerp = (a, b, t) => a + (b - a) * t;

// Centres des yeux et géométrie
const EYES = [{ cx: 128, cy: 104 }, { cx: 192, cy: 104 }];
const EW = 19, EH = 11, IRIS = 8, RANGE_X = 9, RANGE_Y = 5;

// Lettres Z, E, N pour l'exercice « écrire sur le mur » (coordonnées normalisées -1..1)
const LETTRES = [
  [[-1, -1], [-0.2, -1], [-1, 1], [-0.2, 1]], // Z
  [[0.6, -1], [0, -1], [0, 0], [0.5, 0], [0, 0], [0, 1], [0.6, 1]], // E (vers la droite)
  [[0.3, 1], [0.3, -1], [1, 1], [1, -1]], // N
].map((l, i) => l.map(([x, y]) => [x * 0.55 + (i - 1) * 0.7, y]));
const TRACE = LETTRES.flat();
function along(path, u) {
  const segs = [];
  let total = 0;
  for (let i = 1; i < path.length; i++) {
    const d = Math.hypot(path[i][0] - path[i - 1][0], path[i][1] - path[i - 1][1]);
    segs.push(d);
    total += d;
  }
  let target = u * total;
  for (let i = 0; i < segs.length; i++) {
    if (target <= segs[i]) {
      const k = segs[i] ? target / segs[i] : 0;
      return [lerp(path[i][0], path[i + 1][0], k), lerp(path[i][1], path[i + 1][1], k)];
    }
    target -= segs[i];
  }
  return path[path.length - 1];
}

// Regard, paupières, mains et cible selon le motif de l'exercice
function motion(motif, t, cycleMs, length) {
  const u = (t % cycleMs) / cycleMs;
  const s = { gx: 0, gy: 0, conv: 0, open: [1, 1], head: [0, 0], hands: null, target: null, label: "" };
  switch (motif) {
    case "vertical": s.gy = -Math.cos(TAU * u); s.label = s.gy < 0 ? "En haut…" : "En bas…"; break;
    case "horizontal": s.gx = -Math.cos(TAU * u); s.label = s.gx > 0 ? "À droite…" : "À gauche…"; break;
    case "diagonale": { const v = -Math.cos(TAU * u); s.gx = v * 0.85; s.gy = -v; s.label = "En diagonale"; break; }
    case "cercle": s.gx = Math.cos(TAU * u); s.gy = Math.sin(TAU * u); s.label = "Un grand cercle"; break;
    case "infini": s.gx = Math.sin(TAU * u); s.gy = Math.sin(TAU * u) * Math.cos(TAU * u) * 1.4; s.label = "Le signe infini"; break;
    case "quatre": {
      const pts = [[0, -1], [1, 0], [0, 1], [-1, 0]];
      const k = Math.floor(u * 4), local = (u * 4) % 1;
      const a = pts[k], b = pts[(k + 1) % 4];
      const m = smooth((local - 0.7) / 0.3); // tenir 70 % du temps, puis glisser
      s.gx = lerp(a[0], b[0], m); s.gy = lerp(a[1], b[1], m);
      s.label = ["Tout en haut", "Tout à droite", "Tout en bas", "Tout à gauche"][k];
      break;
    }
    case "presloin": case "unoeil": {
      const near = smooth(u < 0.5 ? u * 2 : 2 - u * 2); // inspire : approche, expire : éloigne
      s.conv = near; s.gy = 0.35 * near;
      s.target = { type: "doigt", scale: lerp(0.45, 1.25, near) };
      s.label = u < 0.5 ? "Le doigt approche" : "Le doigt s'éloigne";
      if (motif === "unoeil") s.open = [0.04, 1];
      break;
    }
    case "fixation": {
      const closedPhase = length ? t > length * 0.55 : u > 0.55;
      s.gy = 0.2;
      s.target = { type: "bougie" };
      s.open = closedPhase ? [0, 0] : [1, 1];
      s.label = closedPhase ? "Garde l'image en toi" : "Je fixe sans cligner";
      s.noBlink = true;
      break;
    }
    case "stylos": {
      const total = length || cycleMs * 9;
      const spread = 0.25 + 0.75 * Math.min(1, Math.floor((t / total) * 3) / 2);
      const side = Math.cos(TAU * u) > 0 ? 1 : -1;
      s.gx = side * spread * smooth(Math.abs(Math.cos(TAU * u)) * 1.6);
      s.target = { type: "stylos", spread };
      s.label = "Un stylo, puis l'autre";
      break;
    }
    case "ecrire": { const p = along(TRACE, u); s.gx = p[0]; s.gy = p[1]; s.label = "Z · E · N"; break; }
    case "objets": {
      const k = Math.min(4, Math.floor(u * 5)), local = (u * 5) % 1;
      const next = Math.min(4, k + 1);
      const m = k < 4 ? smooth((local - 0.75) / 0.25) : 0;
      s.conv = lerp(1 - k / 4, 1 - next / 4, m);
      s.gy = 0.3 * s.conv;
      s.label = ["Le bout du nez", "Le bras", "Le pouce", "Un objet proche", "Au loin"][k];
      break;
    }
    case "tete": {
      const first = length ? t < length / 2 : true;
      const v = Math.sin(TAU * u);
      s.head = first ? [v * 14, 0] : [0, v * 9];
      s.gx = first ? -v * 0.75 : 0; s.gy = first ? 0 : -v * 0.75;
      s.label = "Le regard reste fixe";
      break;
    }
    case "serrer": {
      const closed = u < 0.6;
      s.open = closed ? [0, 0] : [1, 1];
      s.squeeze = closed ? smooth(u / 0.15) : 0;
      s.label = closed ? "Je serre fort…" : "J'ouvre grand";
      s.noBlink = true;
      break;
    }
    case "papillon": { const o = 0.5 + 0.5 * Math.cos(TAU * u); s.open = [o, o]; s.label = "Comme des ailes de papillon"; s.noBlink = true; break; }
    case "clignements": {
      if (t < 5000) { const o = Math.cos(TAU * ((t % 400) / 400)) > 0 ? 1 : 0.05; s.open = [o, o]; s.label = "Clignements rapides"; }
      else { s.label = "Regard posé"; }
      s.noBlink = true;
      break;
    }
    case "palming": s.open = [0, 0]; s.hands = "palming"; s.label = "Obscurité et chaleur"; s.noBlink = true; break;
    case "massage": s.open = [0, 0]; s.hands = "massage"; s.massage = u; s.label = "Petits cercles très doux"; s.noBlink = true; break;
    default: s.label = "Tête droite, visage détendu";
  }
  return s;
}

function almond(e, open) {
  // Amande : la paupière supérieure descend quand open → 0
  const x0 = e.cx - EW, x1 = e.cx + EW;
  const top = e.cy - EH * 1.25 * open + EH * 0.15 * (1 - open);
  const bottom = e.cy + EH * 0.85;
  return {
    shape: `M${f1(x0)} ${f1(e.cy)}Q${f1(e.cx)} ${f1(top - EH * 0.35 * open)} ${f1(x1)} ${f1(e.cy)}Q${f1(e.cx)} ${f1(bottom)} ${f1(x0)} ${f1(e.cy)}z`,
    lid: `M${f1(x0 - 1)} ${f1(e.cy)}Q${f1(e.cx)} ${f1(top - EH * 0.35 * open)} ${f1(x1 + 1)} ${f1(e.cy)}`,
  };
}

let uid = 0;
export function createEyeGuide(el, posture, { background = true } = {}) {
  const id = "eg" + ++uid;
  const pal = { debut: ["#e9c9b1", "#c98b6b"], milieu: ["#cfd8c2", "#8a9a7b"], fin: ["#d8cfdc", "#8d8fa6"] }[posture.moments?.[0]] || ["#cfd8c2", "#8a9a7b"];
  el.innerHTML = `
    <div class="pose-anim character eye-guide" style="${background ? `background:linear-gradient(135deg, ${pal[0]}, ${pal[1]})` : ""}">
      <svg class="pose-figure" viewBox="40 6 240 200" preserveAspectRatio="xMidYMid meet" role="img" aria-label="Visage guide : ${posture.nom}">
        <defs>
          <linearGradient id="${id}bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${pal[0]}"/><stop offset="1" stop-color="${pal[1]}"/></linearGradient>
          <clipPath id="${id}c0"><path data-k="clip0"/></clipPath>
          <clipPath id="${id}c1"><path data-k="clip1"/></clipPath>
        </defs>
        ${background ? `<circle cx="246" cy="44" r="30" fill="#fbf8f3" opacity=".35"/>` : ""}
        <g data-k="head">
          <path d="M108 206q4-34 52-38q48 4 52 38z" fill="${C.haut}"/>
          <path d="M150 156h20v16q-10 6-20 0z" fill="${C.peauOmbre}"/>
          <ellipse cx="160" cy="34" rx="18" ry="14" fill="${C.cheveux}"/>
          <ellipse cx="160" cy="104" rx="62" ry="70" fill="${C.cheveux}"/>
          <ellipse cx="160" cy="112" rx="54" ry="62" fill="${C.peau}"/>
          <path d="M106 96q6-46 54-50q48 4 54 50q-18-26-54-28q-36 2-54 28z" fill="${C.cheveux}"/>
          <path data-k="brow0" stroke="${C.cheveux}" stroke-width="3" stroke-linecap="round" fill="none"/>
          <path data-k="brow1" stroke="${C.cheveux}" stroke-width="3" stroke-linecap="round" fill="none"/>
          ${[0, 1].map((i) => `
          <path data-k="white${i}" fill="${C.blanc}"/>
          <g clip-path="url(#${id}c${i})">
            <circle data-k="iris${i}" r="${IRIS}" fill="${C.iris}"/>
            <circle data-k="pupil${i}" r="3.6" fill="${C.pupille}"/>
            <circle data-k="glint${i}" r="1.5" fill="#fff" opacity=".9"/>
          </g>
          <path data-k="lid${i}" stroke="${C.cheveux}" stroke-width="2.2" stroke-linecap="round" fill="none"/>`).join("")}
          <path d="M156 118q4 14 8 14" stroke="${C.peauOmbre}" stroke-width="2.4" stroke-linecap="round" fill="none"/>
          <circle cx="118" cy="128" r="8" fill="${C.joue}" opacity=".35"/>
          <circle cx="202" cy="128" r="8" fill="${C.joue}" opacity=".35"/>
          <path data-k="mouth" d="M148 146q12 8 24 0" stroke="#b9786a" stroke-width="2.6" stroke-linecap="round" fill="none"/>
        </g>
        <g data-k="target"></g>
        <g data-k="hands"></g>
      </svg>
      <span class="pose-label" data-k="label"></span>
    </div>`;
  const svg = el.querySelector("svg");
  const k = Object.fromEntries([...svg.querySelectorAll("[data-k]")].map((n) => [n.dataset.k, n]));
  const label = el.querySelector('[data-k="label"]');
  let lastLabel = null, lastTarget = null, lastHands = null;
  const cycleMs = (posture.cycle || 4) * 1000;

  function drawTarget(tg) {
    const key = tg ? `${tg.type}` : "";
    if (key !== lastTarget) {
      lastTarget = key;
      k.target.innerHTML =
        tg?.type === "doigt" ? `<g data-k="finger"><rect x="-7" y="-26" width="14" height="40" rx="7" fill="${C.main}"/><rect x="-14" y="8" width="28" height="30" rx="12" fill="${C.main}"/><path d="M-4 -20h8" stroke="#d9a993" stroke-width="2" stroke-linecap="round"/></g>`
        : tg?.type === "bougie" ? `<g transform="translate(160 200) scale(.8)"><rect x="-9" y="-24" width="18" height="30" rx="3" fill="#fbf3e6"/><path data-k="flame" d="M0 -44q9 10 0 18q-9-8 0-18z" fill="#f1b45d"/><circle cx="0" cy="-34" r="14" fill="#f6d79c" opacity=".35"/></g>`
        : tg?.type === "stylos" ? `<g data-k="pens"><rect data-k="pen0" y="146" width="8" height="64" rx="3" fill="#5f6f53"/><rect data-k="pen1" y="146" width="8" height="64" rx="3" fill="#a8674a"/></g>`
        : "";
    }
    if (tg?.type === "doigt") {
      const f = k.target.querySelector('[data-k="finger"]');
      const near = (tg.scale - 0.45) / 0.8;
      f.setAttribute("transform", `translate(160 ${f1(lerp(198, 156, near))}) scale(${f1(tg.scale)})`);
      f.setAttribute("opacity", f1(0.55 + 0.45 * Math.min(1, tg.scale)));
    }
    if (tg?.type === "stylos") {
      const d = 14 + tg.spread * 70;
      k.target.querySelector('[data-k="pen0"]').setAttribute("x", f1(160 - d - 3.5));
      k.target.querySelector('[data-k="pen1"]').setAttribute("x", f1(160 + d - 3.5));
    }
  }

  function drawHands(mode, s) {
    if (mode !== lastHands) {
      lastHands = mode;
      k.hands.innerHTML =
        mode === "palming" ? `<path d="M76 140q-6-52 46-62q30 0 34 26q2 30-22 50q-30 14-58-14z" fill="${C.main}"/><path d="M244 140q6-52-46-62q-30 0-34 26q-2 30 22 50q30 14 58-14z" fill="${C.main}"/><path d="M112 92q20-8 40 0M168 92q20-8 40 0" stroke="#d9a993" stroke-width="2" fill="none" stroke-linecap="round"/>`
        : mode === "massage" ? `<circle data-k="tip0" r="7" fill="${C.main}"/><circle data-k="tip1" r="7" fill="${C.main}"/><path data-k="fing0" stroke="${C.main}" stroke-width="12" stroke-linecap="round"/><path data-k="fing1" stroke="${C.main}" stroke-width="12" stroke-linecap="round"/>`
        : "";
    }
    if (mode === "massage") {
      // Petits cercles autour de l'orbite, sens inversé à mi-parcours
      const a = TAU * s.massage * 3 * (s.massage > 0.5 ? -1 : 1);
      [0, 1].forEach((i) => {
        const e = EYES[i], side = i ? 1 : -1;
        const x = e.cx + side * 24 + Math.cos(a) * 5, y = e.cy + 4 + Math.sin(a) * 5;
        k.hands.querySelector(`[data-k="tip${i}"]`).setAttribute("cx", f1(x));
        k.hands.querySelector(`[data-k="tip${i}"]`).setAttribute("cy", f1(y));
        k.hands.querySelector(`[data-k="fing${i}"]`).setAttribute("d", `M${f1(x)} ${f1(y)}L${f1(x + side * 26)} ${f1(y + 70)}`);
      });
    }
  }

  function draw(s, breath, t) {
    const [hx, hy] = s.head;
    k.head.setAttribute("transform", `translate(${f1(hx)} ${f1(hy + (breath - 0.5) * 1.6)})`);
    [0, 1].forEach((i) => {
      const e = EYES[i];
      const open = Math.max(0, Math.min(1, s.open[i]));
      const a = almond(e, open);
      k["white" + i].setAttribute("d", a.shape);
      k["clip" + i].setAttribute("d", a.shape);
      k["lid" + i].setAttribute("d", a.lid);
      k["lid" + i].setAttribute("stroke-width", s.squeeze ? f1(2.2 + s.squeeze * 1.6) : "2.2");
      const conv = s.conv * 6 * (i ? -1 : 1);
      const x = e.cx + s.gx * RANGE_X + conv, y = e.cy + s.gy * RANGE_Y;
      k["iris" + i].setAttribute("cx", f1(x)); k["iris" + i].setAttribute("cy", f1(y));
      k["pupil" + i].setAttribute("cx", f1(x)); k["pupil" + i].setAttribute("cy", f1(y));
      k["glint" + i].setAttribute("cx", f1(x + 2.4)); k["glint" + i].setAttribute("cy", f1(y - 2.6));
      const raise = (1 - open) * -2 + (s.squeeze || 0) * 4;
      k["brow" + i].setAttribute("d", `M${f1(e.cx - 16)} ${f1(e.cy - 22 + raise)}Q${f1(e.cx)} ${f1(e.cy - 30 + raise)} ${f1(e.cx + 16)} ${f1(e.cy - 22 + raise)}`);
    });
    drawTarget(s.target);
    drawHands(s.hands, s);
    if (s.target?.type === "bougie") {
      const fl = k.target.querySelector('[data-k="flame"]');
      fl?.setAttribute("transform", `scale(${f1(1 + Math.sin(t / 120) * 0.05)} 1)`);
    }
  }

  const setLabel = (t) => { if (t !== lastLabel) { lastLabel = t; label.textContent = t; } };

  function render({ phase, t = 0, length = 0, breath = null }) {
    const b = breath ?? (Math.sin(t / 1700) + 1) / 2;
    let s;
    if (phase === "tenue") {
      s = motion(posture.motif, t, cycleMs, length);
      setLabel(s.label);
    } else if (phase === "installation") {
      s = motion("neutre", t, cycleMs, 0);
      // Palming : les mains arrivent doucement à la fin de l'installation
      if (posture.motif === "palming" && t > 3000) { s = motion("palming", t, cycleMs, 0); setLabel("Mains chaudes en coque"); }
      else setLabel("Je m'installe, tête droite");
    } else if (phase === "sortie") {
      s = motion("neutre", t, cycleMs, 0);
      if (t < 1500 && (posture.motif === "palming" || posture.motif === "massage")) s.open = [0, 0];
      setLabel("Je relâche le regard");
    } else {
      s = motion("neutre", t, cycleMs, 0);
      setLabel("Namasté");
    }
    // Clignement naturel toutes les ~5 s, sauf exercices où le regard est contrôlé
    if (!s.noBlink && t % 5200 > 5050) s.open = [0.05, 0.05];
    draw(s, b, t);
  }
  render({ phase: "installation", t: 0 });
  return { render, el: svg };
}
