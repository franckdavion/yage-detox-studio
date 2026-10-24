// Petites aides d'interface partagées
export const esc = (s = "") =>
  String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

export const fmt = (sec) => {
  const m = Math.floor(sec / 60);
  const s = Math.max(0, sec % 60);
  return `${m}:${String(s).padStart(2, "0")}`;
};

export const minutes = (sec) => `${Math.round(sec / 60)} min`;

const ICONS = {
  close: '<path d="M6 6l12 12M18 6L6 18"/>',
  play: '<path d="M8 5l11 7-11 7z" fill="currentColor" stroke="none"/>',
  pause: '<path d="M8 5v14M16 5v14" stroke-width="2.4"/>',
  next: '<path d="M6 5l9 7-9 7zM18 5v14"/>',
  prev: '<path d="M18 5l-9 7 9 7zM6 5v14"/>',
  voice: '<path d="M4 9v6h4l5 4V5L8 9zM16.5 8.5a5 5 0 0 1 0 7M19 6a8.5 8.5 0 0 1 0 12"/>',
  mute: '<path d="M4 9v6h4l5 4V5L8 9zM17 9l5 6M22 9l-5 6"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  check: '<path d="M5 12l5 5 9-10"/>',
  back: '<path d="M15 5l-7 7 7 7"/>',
  up: '<path d="M6 15l6-6 6 6"/>',
  down: '<path d="M6 9l6 6 6-6"/>',
  trash: '<path d="M5 7h14M10 7V5h4v2M7 7l1 12h8l1-12"/>',
  listen: '<path d="M4 14v-2a8 8 0 0 1 16 0v2M4 14h3v5H4zM17 14h3v5h-3z"/>',
};
export const icon = (name) =>
  `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[name] || ""}</svg>`;

let toastTimer;
export function toast(msg) {
  const t = document.getElementById("toast");
  t.textContent = msg;
  t.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove("show"), 2200);
}

// ---------- Images des postures ----------
// Une figure = illustration vectorielle zen (toujours présente, en fond) + photo par-dessus si elle existe.
// Si la photo manque ou ne charge pas, elle est retirée et l'illustration reste visible : jamais d'image cassée.
const PALETTES = {
  debut: { a: "#e9c9b1", b: "#c98b6b", sun: "#f6e3d3" },
  milieu: { a: "#cfd8c2", b: "#8a9a7b", sun: "#eef1e6" },
  fin: { a: "#d8cfdc", b: "#8d8fa6", sun: "#f1ecf3" },
};

// Pictogrammes au trait, par famille de posture (sol à y=152)
const FIGURES = {
  assise: '<circle cx="160" cy="76" r="11"/><path d="M160 89v38M160 100l-20 24M160 100l20 24M126 150q34-26 68 0q-34 10-68 0z"/>',
  avant: '<circle cx="206" cy="128" r="10"/><path d="M122 150q12-48 76-24M120 152h118M165 118l46 26"/>',
  arriere: '<circle cx="221" cy="97" r="10"/><path d="M104 152h82q22-10 30-44M213 118v34"/>',
  genoux: '<circle cx="128" cy="140" r="10"/><path d="M134 152h62M194 150q2-40-56-24M150 132l-34 18"/>',
  torsion: '<circle cx="88" cy="146" r="10"/><path d="M100 150h70l26-22 20 24M118 150l-14-30"/>',
  inversion: '<circle cx="88" cy="146" r="10"/><path d="M100 150h72V68M116 150l-18-22M150 150l18-22"/>',
  allongee: '<circle cx="84" cy="146" r="10"/><path d="M96 150h132M118 150l-6 10M150 150l6 10"/>',
  debout: '<circle cx="160" cy="142" r="10"/><path d="M172 152v-52q-14 4-14 32M148 118h24"/>',
};
function categorie(p) {
  const f = `${p.famille || ""} ${p.nom || ""}`.toLowerCase();
  if (/inversion|mur/.test(f)) return "inversion";
  if (/torsion/.test(f)) return "torsion";
  if (/relaxation|cadavre|latéral allongé/.test(f)) return "allongee";
  if (/debout/.test(f)) return "debout";
  if (/genoux|enfant/.test(f)) return "genoux";
  if (/arrière/.test(f)) return "arriere";
  if (/avant/.test(f)) return "avant";
  return "assise";
}

export function zenIllustration(p) {
  const pal = PALETTES[p.moments?.[0]] || PALETTES.milieu;
  const id = "g" + (p.id || "x").replace(/[^a-z0-9]/gi, "");
  return `<svg class="zen-art" viewBox="0 0 320 200" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
    <defs><linearGradient id="${id}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${pal.a}"/><stop offset="1" stop-color="${pal.b}"/></linearGradient></defs>
    <rect width="320" height="200" fill="url(#${id})"/>
    <circle cx="236" cy="62" r="38" fill="${pal.sun}" opacity=".55"/>
    <circle cx="236" cy="62" r="54" fill="none" stroke="${pal.sun}" stroke-opacity=".3"/>
    <path d="M0 160q80-26 160-6t160-12V200H0z" fill="#fbf8f3" opacity=".22"/>
    <path d="M0 176q90-18 180-2t140-6V200H0z" fill="#fbf8f3" opacity=".28"/>
    <g class="zen-figure" fill="none" stroke="#fbf8f3" stroke-width="5" stroke-linecap="round" stroke-linejoin="round">${FIGURES[categorie(p)]}</g>
  </svg>`;
}

// variant : true pour la version « avec supports » ; cls : classes de taille
export function postureFigure(p, { variant = false, cls = "" } = {}) {
  const src = variant ? p.imageVariante?.src : p.image;
  const alt = variant ? `${p.nom} — ${p.imageVariante?.legende || "variante"}` : p.nom;
  return `<div class="pfig ${cls}">${zenIllustration(p)}${
    src ? `<img class="pfig-photo" src="${esc(src)}" alt="${esc(alt)}" loading="lazy" decoding="async" />` : ""
  }</div>`;
}

// À appeler une fois : gère chargement et erreurs de toutes les photos (y compris celles ajoutées plus tard)
export function installImageFallbacks(root = document) {
  root.addEventListener("load", (e) => {
    const img = e.target;
    if (img.classList?.contains("pfig-photo")) {
      img.classList.add("loaded");
      img.parentElement?.classList.add("has-photo");
    }
  }, true);
  root.addEventListener("error", (e) => {
    const img = e.target;
    if (img.classList?.contains("pfig-photo")) img.remove();
  }, true);
}
