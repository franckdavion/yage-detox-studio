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

// Illustration abstraite d'une carte, teintée selon le moment de la séance
const PALETTES = {
  debut: ["#c98b6b", "#e6c3a8", "#8a9a7b"],
  milieu: ["#8a9a7b", "#b7c2a6", "#c98b6b"],
  fin: ["#7d8a93", "#c9b8c8", "#8a9a7b"],
};
export function cardArt(p, seed = 0) {
  const pal = PALETTES[p.moments?.[0]] || PALETTES.milieu;
  let h = seed;
  for (const ch of p.id) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  const r = (n) => ((h = (h * 1103515245 + 12345) >>> 0) % n);
  const orbs = pal
    .map((c, i) => {
      const size = 90 + r(90);
      return `<span class="orb" style="width:${size}px;height:${size}px;left:${r(200) - 40}px;top:${r(80) - 50}px;background:${c};opacity:${0.55 + i * 0.12}"></span>`;
    })
    .join("");
  return `<div class="card-art" style="background:linear-gradient(135deg, ${pal[1]}, ${pal[0]})">${orbs}<span class="glyph">${esc(p.nom.replace(/^(Le |La |L'|Les )/, "").charAt(0).toUpperCase())}</span></div>`;
}
