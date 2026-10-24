// Yoga Détox Studio — routeur et vues
import { CONTRAINTES, MOMENTS, THEMES, PRINCIPES } from "./data/yin-yoga.js";
import {
  state, save, books, allPostures, getPosture, allProgrammes,
  toggleContrainte, warningsFor, matchedAdaptations, inSeance, toggleSeance, BUILTIN_BOOKS,
  savedSeances, getSeance, saveSeance, deleteSeance, duplicateSeance, editSeance, seanceEntries,
} from "./store.js";
import { esc, icon, toast, minutes, postureFigure, installImageFallbacks } from "./ui.js";
import { openPlayer, closePlayer } from "./player.js";
import { mountPoseAnimation, createCharacter, POSES } from "./animation.js";
import { verifierEtirements } from "./data/modele-etirement.js";
import { ZONES, POSTURES_ETIREMENTS } from "./data/etirements.js";
import { speak, stopSpeaking, ttsSupported, frenchVoices } from "./tts.js";
import { generate, totalSeconds } from "./sequences.js";
import { importFiles, importJSON, removeBook } from "./import.js";

export const APP_VERSION = "11 · modèle étirements";
// Contrôle au démarrage : chaque étirement respecte le modèle (console du navigateur)
verifierEtirements(POSTURES_ETIREMENTS, POSES);
const view = document.getElementById("view");
installImageFallbacks();
const filters = { moment: "", theme: "", q: "", adapte: false, livre: "", zone: "" };
const label = (id) => CONTRAINTES.find((c) => c.id === id)?.label || id;
const NIVEAUX = { debutant: "Débutant", intermediaire: "Intermédiaire", avance: "Avancé" };

// ---------- Routeur ----------
const routes = [
  [/^#?\/?$/, renderCatalogue, "catalogue"],
  [/^#\/posture\/(.+)$/, renderPosture, "catalogue"],
  [/^#\/seances$/, renderSeances, "seances"],
  [/^#\/mes-seances$/, renderMesSeances, "mes-seances"],
  [/^#\/importer$/, renderImport, "importer"],
  [/^#\/profil$/, renderProfil, "profil"],
];
let stopViewAnims = [];
function router() {
  closePlayer(); // changer de page ferme le lecteur (bouton retour du téléphone, liens…)
  stopSpeaking();
  stopViewAnims.forEach((f) => f());
  stopViewAnims = [];
  const h = location.hash || "#/";
  for (const [re, fn, tab] of routes) {
    const m = h.match(re);
    if (m) {
      document.querySelectorAll(".tabbar a").forEach((a) => a.classList.toggle("active", a.dataset.tab === tab));
      fn(...m.slice(1).map(decodeURIComponent));
      window.scrollTo(0, 0);
      return;
    }
  }
  renderCatalogue();
}
window.addEventListener("hashchange", router);

// ---------- Catalogue ----------
function postureCard(p) {
  const warn = warningsFor(p);
  const added = inSeance(p.id);
  return `
    <a class="card glass" href="#/posture/${encodeURIComponent(p.id)}">
      <button class="add-fab ${added ? "in" : ""}" data-add="${esc(p.id)}" aria-label="${added ? "Retirer de" : "Ajouter à"} ma séance">${icon(added ? "check" : "plus")}</button>
      ${p.etirement && !p.image ? `<div class="pfig card-art" data-char="${esc(p.id)}"></div>` : postureFigure(p, { cls: "card-art" })}
      <div class="card-body">
        <span class="eyebrow">${esc(p.sanskrit)}</span>
        <h3>${esc(p.nom)}</h3>
        <span class="muted" style="font-size:.86rem">${esc(p.famille || "")}</span>
        <div class="card-meta">
          <span class="tag">${p.mode === "flux" ? (p.cycle ? `${p.repetitions || 5} fois` : `${p.respirations || 5} resp.`) : p.duree < 120 ? `${p.duree} s` : minutes(p.duree)}${p.cotes ? " × 2" : ""}</span>
          ${p.zone ? `<span class="tag ok">${ZONES[p.zone]?.emoji || ""} ${ZONES[p.zone]?.label || ""}</span>` : `<span class="tag">${NIVEAUX[p.niveau] || ""}</span>`}
          ${warn.length ? `<span class="tag warn">À éviter : ${esc(warn.map(label).join(", "))}</span>` : ""}
          ${!warn.length && matchedAdaptations(p).length ? `<span class="tag ok">Adaptation proposée</span>` : ""}
        </div>
      </div>
    </a>`;
}

function chip(group, value, text, pressed) {
  return `<button class="chip" data-filter="${group}" data-value="${esc(value)}" aria-pressed="${pressed}">${esc(text)}</button>`;
}

function renderCatalogue() {
  const hour = new Date().getHours();
  const hello = hour < 12 ? "Bonjour" : hour < 18 ? "Bel après-midi" : "Bonsoir";
  const suggestion = hour >= 19 ? "soiree-sommeil" : hour < 11 ? "debutant-doux" : "detox-digestion";
  const prog = allProgrammes().find((p) => p.id === suggestion);
  const bookList = books();
  view.innerHTML = `
    <section class="hero glass">
      <span class="eyebrow">${hello}</span>
      <h1>Ralentir, respirer,<br/>se déposer.</h1>
      <p class="muted">${esc(PRINCIPES.tenue)}</p>
      <div class="row">
        <button class="btn" data-play-prog="${prog.id}">${icon("play")} ${esc(prog.titre)} · ${minutes(totalSeconds(progEntries(prog)))}</button>
        <a class="btn ghost" href="#/seances">Composer ma séance</a>
      </div>
    </section>

    <section class="section">
      <div class="section-head"><h2>Mes méthodes</h2></div>
      <div class="methods">
        ${bookList.map((b) => `<button class="method glass ${filters.livre === b.id ? "on" : ""}" data-method="${esc(b.id)}">
          <span class="method-icon">${b.style === "chaise" ? "🪑" : b.style === "yin" ? "🌙" : b.style === "yeux" ? "👁️" : b.style === "etirements" ? "🤸" : "📖"}</span>
          <span class="method-txt"><strong>${esc(b.titre)}</strong>
            <span class="muted">${b.postures.length} fiches · ${b.style === "yeux" ? "contre la fatigue des écrans" : b.style === "etirements" ? "par zone, personnage 3D" : b.mode === "flux" ? "au rythme du souffle" : "tenues longues"}</span></span>
          ${b.id === "etirements" ? '<span class="tag ok">Nouveau</span>' : ""}
        </button>`).join("")}
      </div>
      ${savedSeances().length ? `<div class="section-head" style="margin-top:20px"><h2>Mes séances</h2><a class="muted" href="#/mes-seances">Tout voir</a></div>
      <div class="filters">${savedSeances().slice(0, 6).map((s) => `<button class="chip saved-chip" data-play-saved="${s.id}">${icon("play")} ${esc(s.nom)}</button>`).join("")}</div>` : ""}
      ${bookList.some((b) => b.id === "yoga-chaise") ? `<div class="row" style="margin-top:12px">
        <button class="btn terra small" data-play-prog="chaise-complete">${icon("play")} Pause yoga sur chaise</button>
        <button class="btn ghost small" data-play-prog="chaise-express">Nuque & épaules · 5 min</button>
        <button class="btn ghost small" data-play-prog="yeux-reposes">👁️ Yeux reposés · 5 min</button>
        <button class="btn ghost small" data-play-prog="etir-reveil">🤸 Réveil en douceur</button>
      </div>` : ""}
    </section>

    <section class="section">
      <input class="search" type="search" placeholder="Rechercher une posture, un bienfait, un méridien…" value="${esc(filters.q)}" id="q" />
      <div class="filters" style="margin-top:12px">
        ${chip("moment", "", "Tous les moments", !filters.moment)}
        ${Object.entries(MOMENTS).map(([k, m]) => chip("moment", k, `${m.label} · ${m.sous}`, filters.moment === k)).join("")}
      </div>
      <div class="filters" style="margin-top:8px">
        ${chip("theme", "", "Tous les bienfaits", !filters.theme)}
        ${Object.entries(THEMES).map(([k, t]) => chip("theme", k, `${t.emoji} ${t.label}`, filters.theme === k)).join("")}
      </div>
      ${bookList.length > 1 ? `<div class="filters" style="margin-top:8px">${chip("livre", "", "Tous les livres", !filters.livre)}${bookList.map((b) => chip("livre", b.id, b.titre, filters.livre === b.id)).join("")}</div>` : ""}
      ${filters.livre === "etirements" ? `<div class="filters" style="margin-top:8px">${chip("zone", "", "Toutes les zones", !filters.zone)}${Object.entries(ZONES).map(([k, z]) => chip("zone", k, `${z.emoji} ${z.label}`, filters.zone === k)).join("")}</div>` : ""}
      <label class="toggle-line" style="margin-top:12px">
        <input type="checkbox" id="adapte" ${filters.adapte ? "checked" : ""} />
        Masquer les postures déconseillées pour mon profil
        ${state.contraintes.length ? `<span class="muted">(${state.contraintes.length} contrainte${state.contraintes.length > 1 ? "s" : ""})</span>` : `<a href="#/profil" class="muted">définir</a>`}
      </label>
    </section>
    <div id="results"></div>`;
  renderResults();

  view.querySelector("#q").addEventListener("input", (e) => { filters.q = e.target.value; renderResults(); });
  view.querySelector("#adapte").addEventListener("change", (e) => { filters.adapte = e.target.checked; renderResults(); });
  view.onclick = onCatalogueClick;
  view.onchange = null;
}

function onCatalogueClick(e) {
  const m = e.target.closest("[data-method]");
  if (m) {
    filters.livre = filters.livre === m.dataset.method ? "" : m.dataset.method;
    filters.zone = "";
    renderCatalogue();
    document.getElementById("results")?.scrollIntoView({ behavior: "smooth", block: "start" });
    return;
  }
  const f = e.target.closest("[data-filter]");
  if (f && f.dataset.filter === "livre") {
    filters.livre = f.dataset.value;
    filters.zone = "";
    renderCatalogue();
    return;
  }
  if (f) {
    filters[f.dataset.filter] = f.dataset.value;
    view.querySelectorAll(`[data-filter="${f.dataset.filter}"]`).forEach((c) => c.setAttribute("aria-pressed", c.dataset.value === f.dataset.value));
    renderResults();
  }
  handleCommon(e);
}

function matches(p) {
  if (filters.moment && !p.moments?.includes(filters.moment)) return false;
  if (filters.theme && !p.themes?.includes(filters.theme)) return false;
  if (filters.livre && p.livre !== filters.livre) return false;
  if (filters.zone && p.zone !== filters.zone) return false;
  if (filters.adapte && warningsFor(p).length) return false;
  if (filters.q) {
    const hay = [p.nom, p.sanskrit, p.famille, ...(p.meridiens || []), ...Object.values(p.bienfaits || {}).flat()].join(" ").toLowerCase();
    if (!filters.q.toLowerCase().split(/\s+/).every((w) => hay.includes(w))) return false;
  }
  return true;
}

function renderResults() {
  const box = document.getElementById("results");
  if (!box) return;
  const list = allPostures().filter(matches);
  if (!list.length) {
    box.innerHTML = `<div class="empty glass section"><p class="muted">Aucune posture ne correspond à ces filtres.</p></div>`;
    return;
  }
  const groups = filters.moment ? [filters.moment] : Object.keys(MOMENTS);
  box.innerHTML = groups
    .map((m) => {
      const items = list.filter((p) => p.moments?.[0] === m || (filters.moment && p.moments?.includes(m)));
      if (!items.length) return "";
      return `<section class="section">
        <div class="section-head"><h2>${MOMENTS[m].label} <span class="muted serif" style="font-style:italic">· ${MOMENTS[m].sous}</span></h2><span class="muted">${items.length}</span></div>
        <div class="grid">${items.map(postureCard).join("")}</div>
      </section>`;
    })
    .join("");
  // Étirements : illustration semi-3D du personnage dans la posture finale
  box.querySelectorAll("[data-char]").forEach((el) => {
    const p = getPosture(el.dataset.char);
    if (p) createCharacter(el, p).render({ phase: "tenue", t: 0, breath: 0.5 });
  });
}

// Actions communes : ajout à la séance, lancement de programme
function handleCommon(e) {
  const add = e.target.closest("[data-add]");
  if (add) {
    e.preventDefault();
    e.stopPropagation();
    const added = toggleSeance(add.dataset.add);
    add.classList.toggle("in", added);
    add.innerHTML = icon(added ? "check" : "plus");
    toast(added ? "Ajoutée à ta séance" : "Retirée de ta séance");
    return true;
  }
  const ps = e.target.closest("[data-play-saved]");
  if (ps) {
    const s = getSeance(ps.dataset.playSaved);
    if (s) openPlayer(seanceEntries(s), { titre: s.nom });
    return true;
  }
  const pp = e.target.closest("[data-play-prog]");
  if (pp) {
    const prog = allProgrammes().find((p) => p.id === pp.dataset.playProg);
    openPlayer(progEntries(prog), { titre: prog.titre });
    return true;
  }
  return false;
}

function progEntries(prog) {
  return prog.postures.map((id) => getPosture(id)).filter(Boolean).map((p) => ({ posture: p, duree: p.duree }));
}

// ---------- Fiche posture ----------
function renderPosture(id) {
  const p = getPosture(id);
  if (!p) { view.innerHTML = `<div class="empty glass section">Posture introuvable. <a href="#/">Retour</a></div>`; return; }
  const warn = warningsFor(p);
  const b = p.bienfaits || {};
  const benef = p.bienfaitsListe
    ? `<ul>${p.bienfaitsListe.map((x) => `<li>${esc(x)}</li>`).join("")}</ul>`
    : [["Physiques", b.physiques], ["Mentaux", b.mentaux], ["Émotionnels", b.emotionnels], ["Énergétiques", b.energetiques]]
    .filter(([, l]) => l?.length)
    .map(([t, l]) => `<div><span class="eyebrow">${t}</span><ul>${l.map((x) => `<li>${esc(x)}</li>`).join("")}</ul></div>`).join("");
  const adapts = Object.entries(p.adaptations || {});
  const contraintesUtiles = [...new Set([...adapts.map(([c]) => c), ...(p.eviter || [])])];

  view.innerHTML = `
    <a class="back" href="#/">${icon("back")} Bibliothèque</a>
    <section class="detail-hero glass">
      <div class="hero-art-wrap" style="position:relative">
        ${postureFigure(p, { cls: "hero-art" })}
        ${p.image ? "" : `<span class="visually-hidden">Animation</span>`}
        <div class="hero-switch" role="group" aria-label="Affichage" ${p.image ? "" : "hidden"}>
          <button data-hero="photo" aria-pressed="true">Photo</button>
          <button data-hero="anim" aria-pressed="false">Animation</button>
        </div>
      </div>
      <span class="eyebrow">${esc(p.famille || "")}</span>
      <h1>${esc(p.nom)}</h1>
      <div class="sanskrit">${esc(p.sanskrit)}</div>
      <div class="facts">
        <div class="fact"><b>Tenue</b>${p.mode === "flux" ? (p.cycle ? `${p.repetitions || 5} répétitions` : `${p.respirations || 5} respirations`) : p.duree < 120 ? `${p.duree} secondes` : minutes(p.duree)}${p.cotes ? " par côté" : ""}</div>
        <div class="fact"><b>${p.zone ? "Zone" : "Moment"}</b>${p.zone ? `${ZONES[p.zone]?.emoji} ${ZONES[p.zone]?.label}` : (p.moments || []).map((m) => MOMENTS[m]?.label).join(", ")}</div>
        <div class="fact"><b>Niveau</b>${NIVEAUX[p.niveau] || "—"}</div>
        <div class="fact"><b>Racines</b>${esc(p.racines || "—")}</div>
      </div>
      ${warn.length ? `<div class="alert">Déconseillée pour ton profil (${esc(warn.map(label).join(", "))}). Choisis une adaptation ou une autre posture.</div>` : ""}
    </section>

    <div class="detail-grid">
      <section class="panel glass">
        <div class="section-head"><h2>Entrer dans la posture</h2>
          ${ttsSupported ? `<button class="btn ghost small" id="listen">${icon("listen")} Écouter</button>` : ""}</div>
        <div class="entry-anim" id="entry-anim"></div>
        <ol class="steps">${(p.entree || []).map((s) => `<li><span>${esc(s)}</span></li>`).join("")}</ol>
      </section>
      <section class="panel glass">
        <h2>Optimisation</h2>
        <div class="cues">${(p.optimisation || []).map((o) => `<div class="cue">${esc(o)}</div>`).join("") || '<p class="muted">—</p>'}</div>
      </section>
    </div>

    <section class="panel glass section">
      <h2>Adaptabilité</h2>
      <p class="muted" style="font-size:.9rem">Coche tes contraintes : les conseils de supports s'affichent pour toi.</p>
      <div class="filters" style="flex-wrap:wrap;margin-top:10px">
        ${(contraintesUtiles.length ? contraintesUtiles : CONTRAINTES.map((c) => c.id)).map((c) => `<button class="chip" data-contrainte="${c}" aria-pressed="${state.contraintes.includes(c)}">${esc(label(c))}</button>`).join("")}
      </div>
      ${p.imageVariante ? `<figure class="variant-fig">${postureFigure(p, { variant: true, cls: "variant-art" })}<figcaption class="muted">${esc(p.imageVariante.legende)}</figcaption></figure>` : ""}
      <div class="adapt-list">
        ${adapts.map(([c, t]) => `<div class="adapt ${state.contraintes.includes(c) ? "match" : ""}"><b>${esc(label(c))}</b>${esc(t)}</div>`).join("") || '<p class="muted">Aucune adaptation particulière dans le livre.</p>'}
      </div>
      ${p.contreIndications?.length ? `<h3 style="margin-top:18px">Contre-indications & vigilance</h3><ul>${p.contreIndications.map((c) => `<li>${esc(c)}</li>`).join("")}</ul>` : ""}
    </section>

    ${p.visualisation ? `<section class="panel glass section"><span class="eyebrow">Visualisation</span><p class="quote" style="margin-top:8px">${esc(p.visualisation)}</p></section>` : ""}

    <section class="panel glass section"><h2>Bienfaits</h2><div class="benefits">${benef}</div>
      ${p.meridiens?.length ? `<div class="card-meta" style="margin-top:14px"><span class="eyebrow" style="margin-right:4px">Méridiens</span>${p.meridiens.map((m) => `<span class="tag">${esc(m)}</span>`).join("")}</div>` : ""}
    </section>

    <section class="panel glass section"><h2>Sortir de la posture</h2>
      <ol class="steps">${(p.sortie || []).map((s) => `<li><span>${esc(s)}</span></li>`).join("")}</ol>
      ${p.contrePosture && getPosture(p.contrePosture) ? `<p class="muted" style="margin-top:12px">Contre-posture conseillée : <a href="#/posture/${p.contrePosture}">${esc(getPosture(p.contrePosture).nom)}</a></p>` : ""}
    </section>

    <div class="sticky-actions glass">
      <button class="btn" id="practice">${icon("play")} Pratiquer</button>
      <button class="btn ghost" data-add="${esc(p.id)}">${inSeance(p.id) ? "Retirer de ma séance" : "Ajouter à ma séance"}</button>
    </div>`;

  stopViewAnims.forEach((f) => f());
  stopViewAnims = [mountPoseAnimation(view.querySelector("#entry-anim"), p, { mode: "boucle" })];
  // Sans photo (ex. yoga sur chaise) : le personnage animé occupe directement l'image principale
  if (!p.image) stopViewAnims.push(mountPoseAnimation(view.querySelector(".hero-art"), p, { mode: "boucle" }));
  view.querySelector("#practice").onclick = () => openPlayer([{ posture: p, duree: p.duree }], { titre: "Pratique libre" });
  view.querySelector("#listen")?.addEventListener("click", () => {
    stopSpeaking();
    speak([p.nom, ...(p.entree || []), ...matchedAdaptations(p).map(([, t]) => "Pour toi : " + t)], { force: true });
  });
  view.onclick = (e) => {
    const c = e.target.closest("[data-contrainte]");
    if (c) { toggleContrainte(c.dataset.contrainte); renderPosture(id); return; }
    const hs = e.target.closest("[data-hero]");
    if (hs) {
      const wrap = view.querySelector(".hero-art-wrap");
      wrap.querySelectorAll("[data-hero]").forEach((b) => b.setAttribute("aria-pressed", b === hs));
      const slot = wrap.querySelector(".hero-art");
      if (hs.dataset.hero === "anim") {
        stopViewAnims.push(mountPoseAnimation(slot, p, { mode: "boucle" }));
      } else {
        slot.outerHTML = postureFigure(p, { cls: "hero-art" });
      }
      return;
    }
    const add = e.target.closest("[data-add]");
    if (add) { const added = toggleSeance(add.dataset.add); add.textContent = added ? "Retirer de ma séance" : "Ajouter à ma séance"; toast(added ? "Ajoutée à ta séance" : "Retirée"); }
  };
}

// ---------- Séances ----------
function renderSeances() {
  const mine = state.maSeance.map((s) => ({ posture: getPosture(s.id), duree: s.duree })).filter((e) => e.posture);
  view.innerHTML = `
    <section class="section">
      <span class="eyebrow">Programmes</span>
      <h1 style="margin-top:4px">Séances guidées</h1>
    </section>
    <section class="section grid">
      ${allProgrammes().map((pr) => {
        const entries = progEntries(pr);
        const flagged = entries.filter((e) => warningsFor(e.posture).length);
        return `<div class="prog glass">
          <span class="eyebrow">${THEMES[pr.theme]?.emoji || ""} ${esc(THEMES[pr.theme]?.label || "")}</span>
          <h3>${esc(pr.titre)}</h3>
          <p class="muted" style="font-size:.9rem">${esc(pr.description)}</p>
          <div class="dots">${entries.map((e) => `<span${warningsFor(e.posture).length ? ' style="color:var(--warn)"' : ""}>${esc(e.posture.nom)}</span>`).join("")}</div>
          ${flagged.length ? `<p style="font-size:.8rem;color:var(--warn)">${flagged.length} posture(s) déconseillée(s) pour ton profil : génère plutôt une séance adaptée.</p>` : ""}
          <div class="row" style="margin-top:6px"><button class="btn small" data-play-prog="${pr.id}">${icon("play")} ${minutes(totalSeconds(entries))}</button></div>
        </div>`;
      }).join("")}
    </section>

    <section class="section glass panel">
      <h2>Générer une séance adaptée</h2>
      <p class="muted" style="font-size:.9rem">Construite selon le thème, la durée et les contraintes de ton profil, du moment d'ancrage jusqu'à Savasana.</p>
      <div class="detail-grid" style="grid-template-columns:1fr 1fr;margin-top:0">
        <div class="form-row"><label for="g-theme">Thème</label>
          <select id="g-theme"><option value="">Équilibrée</option>${Object.entries(THEMES).map(([k, t]) => `<option value="${k}">${t.emoji} ${t.label}</option>`).join("")}</select></div>
        <div class="form-row"><label for="g-style">Style</label>
          <select id="g-style">${books().map((b) => `<option value="${esc(b.style)}">${esc(b.titre)}</option>`).join("")}</select></div>
        <div class="form-row"><label for="g-min">Durée</label>
          <select id="g-min">${[5, 10, 20, 30, 45, 60, 75].map((m) => `<option ${m === 45 ? "selected" : ""}>${m}</option>`).join("")}</select></div>
      </div>
      <div class="row" style="margin-top:14px"><button class="btn terra" id="gen">Générer dans « Ma séance »</button></div>
    </section>

    <section class="section glass panel" id="builder">
      <div class="section-head"><h2>${state.edition ? "Modifier ma séance" : "Créer ma séance"}</h2><span class="muted">${mine.length ? minutes(totalSeconds(mine)) : ""}</span></div>
      ${state.edition ? `<p class="edit-banner">${icon("edit")} Tu modifies « ${esc(state.edition.nom)} »</p>` : ""}
      ${mine.length ? `<ul class="seq-list">${mine.map((e, i) => `
        <li class="seq-item">
          <div><strong>${esc(e.posture.nom)}</strong>${e.posture.cotes ? ' <span class="muted">· 2 côtés</span>' : ""}
            ${warningsFor(e.posture).length ? ' <span class="tag warn">à adapter</span>' : ""}</div>
          <div class="tools">
            ${e.posture.mode === "flux" ? "" : `<select data-dur="${i}" aria-label="Durée">${[60, 120, 180, 240, 300, 420, 600].map((s) => `<option value="${s}" ${s === e.duree ? "selected" : ""}>${s / 60} min</option>`).join("")}</select>`}
            <button data-move="${i}" data-dir="-1" aria-label="Monter">${icon("up")}</button>
            <button data-move="${i}" data-dir="1" aria-label="Descendre">${icon("down")}</button>
            <button data-del="${i}" aria-label="Retirer">${icon("trash")}</button>
          </div>
        </li>`).join("")}</ul>
        <div class="save-box">
          <label for="seance-nom">Nom de la séance</label>
          <input id="seance-nom" maxlength="60" autocomplete="off" placeholder="ex : Détox matinale douce" value="${esc(state.edition?.nom || "")}" />
          <div class="row">
            <button class="btn" id="save-seance">${icon("heart")} ${state.edition ? "Mettre à jour la séance" : "Enregistrer la séance"}</button>
            ${state.edition ? `<button class="btn ghost small" id="save-copy">${icon("copy")} Enregistrer une copie</button>` : ""}
          </div>
        </div>
        <div class="row" style="margin-top:14px">
          <button class="btn ghost" id="play-mine">${icon("play")} Lancer sans enregistrer</button>
          <button class="btn ghost small" id="clear-mine">${state.edition ? "Annuler la modification" : "Vider"}</button>
        </div>`
      : `<p class="muted">Ajoute des postures depuis la bibliothèque avec le bouton +, ou génère une séance ci-dessus.</p>`}
    </section>`;

  view.onclick = (e) => {
    if (handleCommon(e)) return;
    const mv = e.target.closest("[data-move]");
    if (mv) {
      const i = +mv.dataset.move, j = i + +mv.dataset.dir;
      if (j >= 0 && j < state.maSeance.length) { [state.maSeance[i], state.maSeance[j]] = [state.maSeance[j], state.maSeance[i]]; save(); renderSeances(); }
    }
    const del = e.target.closest("[data-del]");
    if (del) { state.maSeance.splice(+del.dataset.del, 1); save(); renderSeances(); }
  };
  view.onchange = (e) => {
    const d = e.target.closest("[data-dur]");
    if (d) { state.maSeance[+d.dataset.dur].duree = +d.value; save(); renderSeances(); }
  };
  view.querySelector("#gen").onclick = () => {
    const seq = generate({ theme: view.querySelector("#g-theme").value, minutes: +view.querySelector("#g-min").value, style: view.querySelector("#g-style").value });
    state.maSeance = seq.map((e) => ({ id: e.posture.id, duree: e.duree }));
    save();
    renderSeances();
    toast(`Séance de ${seq.length} postures générée`);
  };
  view.querySelector("#play-mine")?.addEventListener("click", () => openPlayer(mine, { titre: state.edition?.nom || "Ma séance" }));
  view.querySelector("#clear-mine")?.addEventListener("click", () => { state.maSeance = []; state.edition = null; save(); renderSeances(); });
  const nomInput = view.querySelector("#seance-nom");
  const doSave = (asCopy) => {
    const date = new Date().toLocaleDateString("fr-FR", { day: "numeric", month: "long" });
    const nom = (nomInput.value || "").trim() || `Ma séance du ${date}`;
    const s = saveSeance(nom, asCopy ? null : state.edition?.id);
    state.maSeance = [];
    state.edition = null;
    save();
    toast(asCopy ? `Copie « ${s.nom} » enregistrée` : `« ${s.nom} » enregistrée dans Mes séances`);
    location.hash = "#/mes-seances";
  };
  view.querySelector("#save-seance")?.addEventListener("click", () => doSave(false));
  view.querySelector("#save-copy")?.addEventListener("click", () => doSave(true));
  nomInput?.addEventListener("keydown", (e) => { if (e.key === "Enter") doSave(false); });
  if (sessionStorage.getItem("yds.scrollBuilder")) {
    sessionStorage.removeItem("yds.scrollBuilder");
    requestAnimationFrame(() => view.querySelector("#builder")?.scrollIntoView({ block: "start" }));
  }
}

// ---------- Mes séances ----------
function renderMesSeances() {
  const list = savedSeances();
  const dateFr = (t) => new Date(t).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" });
  view.innerHTML = `
    <section class="section">
      <span class="eyebrow">Mon carnet</span>
      <h1 style="margin-top:4px">Mes séances</h1>
      <p class="muted" style="margin-top:8px">${list.length ? `${list.length} séance${list.length > 1 ? "s" : ""} enregistrée${list.length > 1 ? "s" : ""} sur cet appareil.` : "Tes séances personnalisées, prêtes à être lancées en un geste."}</p>
    </section>
    ${list.length ? `<section class="section saved-grid">
      ${list.map((s) => {
        const entries = seanceEntries(s);
        const total = totalSeconds(entries);
        const styles = [...new Set(entries.map((e) => e.posture.style))];
        const flagged = entries.filter((e) => warningsFor(e.posture).length).length;
        return `<article class="saved glass" data-id="${s.id}">
          <div class="saved-strip">${entries.slice(0, 4).map((e) => postureFigure(e.posture, { cls: "mini-art" })).join("")}${entries.length > 4 ? `<span class="saved-more">+${entries.length - 4}</span>` : ""}</div>
          <div class="saved-body">
            <h3>${esc(s.nom)}</h3>
            <p class="muted" style="font-size:.86rem">${entries.length} posture${entries.length > 1 ? "s" : ""} · ${minutes(total)} · ${styles.map((st) => (st === "chaise" ? "🪑 Chaise" : st === "yin" ? "🌙 Yin" : st === "yeux" ? "👁️ Yeux" : st === "etirements" ? "🤸 Étirements" : esc(st))).join(" + ")}</p>
            <div class="dots">${entries.map((e) => `<span>${esc(e.posture.nom)}</span>`).join("")}</div>
            ${flagged ? `<p style="font-size:.8rem;color:var(--warn)">${flagged} posture(s) à adapter à ton profil</p>` : ""}
            <p class="muted" style="font-size:.75rem">Modifiée le ${dateFr(s.modifieLe)}</p>
            <div class="row saved-actions">
              <button class="btn small" data-act="play">${icon("play")} Lancer</button>
              <button class="btn ghost small" data-act="edit">${icon("edit")} Modifier</button>
              <button class="icon-btn" data-act="copy" aria-label="Dupliquer">${icon("copy")}</button>
              <button class="icon-btn" data-act="ask-del" aria-label="Supprimer">${icon("trash")}</button>
            </div>
            <div class="confirm" hidden>
              <span>Supprimer cette séance ?</span>
              <button class="btn small terra" data-act="del">Supprimer</button>
              <button class="btn ghost small" data-act="cancel">Garder</button>
            </div>
          </div>
        </article>`;
      }).join("")}
    </section>` : `<section class="section glass panel empty-saved">
      <div class="empty-orb" aria-hidden="true"></div>
      <h2>Aucune séance enregistrée</h2>
      <p class="muted">Compose une séance (ou génère-la), donne-lui un nom puis touche « Enregistrer la séance ».</p>
      <div class="row" style="justify-content:center;margin-top:14px"><a class="btn" href="#/seances">${icon("plus")} Créer une séance</a></div>
    </section>`}
    ${list.length ? `<div class="row" style="margin-top:18px"><a class="btn ghost" href="#/seances">${icon("plus")} Créer une nouvelle séance</a></div>` : ""}`;

  view.onchange = null;
  view.onclick = (e) => {
    const b = e.target.closest("[data-act]");
    if (!b) return;
    const card = b.closest(".saved");
    const s = getSeance(card?.dataset.id);
    if (!s) return;
    const a = b.dataset.act;
    if (a === "play") {
      const entries = seanceEntries(s);
      if (entries.length) openPlayer(entries, { titre: s.nom });
      else toast("Cette séance ne contient plus de posture");
    }
    if (a === "edit") {
      editSeance(s.id);
      sessionStorage.setItem("yds.scrollBuilder", "1");
      location.hash = "#/seances";
    }
    if (a === "copy") { duplicateSeance(s.id); toast("Séance dupliquée"); renderMesSeances(); }
    if (a === "ask-del") { card.querySelector(".confirm").hidden = false; card.querySelector(".saved-actions").hidden = true; }
    if (a === "cancel") { card.querySelector(".confirm").hidden = true; card.querySelector(".saved-actions").hidden = false; }
    if (a === "del") { deleteSeance(s.id); toast("Séance supprimée"); renderMesSeances(); }
  };
}

// ---------- Import ----------
function renderImport() {
  view.innerHTML = `
    <section class="section">
      <span class="eyebrow">Moteur d'ingestion</span>
      <h1 style="margin-top:4px">Ajouter un livre</h1>
      <p class="muted" style="margin-top:8px;max-width:60ch">Importe un PDF ou des photos de fiches. L'IA détecte le style (Yin, Hatha, Vinyasa…), extrait postures, consignes, adaptations et visualisations, puis adapte le lecteur : minuteur long pour le Yin, compteur de respirations pour les styles dynamiques.</p>
    </section>
    <section class="section glass panel">
      <label class="drop" id="drop" for="file">
        <strong>Dépose ton PDF ou tes photos ici</strong><br/>
        <span class="muted" style="font-size:.9rem">ou touche pour choisir · PDF, JPG, PNG, WEBP</span>
        <input type="file" id="file" class="visually-hidden" accept="application/pdf,image/*" multiple />
      </label>
      ${state.ia.cle ? "" : `<p class="alert">Ajoute ta clé API Claude dans le <a href="#/profil">Profil</a> pour activer l'analyse.</p>`}
      <div class="log" id="log"></div>
    </section>
    <section class="section glass panel">
      <h2>Bibliothèque</h2>
      <ul class="seq-list" style="margin-top:10px">
        ${books().map((b, i) => `<li class="seq-item"><div><strong>${esc(b.titre)}</strong><br/><span class="muted" style="font-size:.85rem">${esc(b.style)} · ${b.postures.length} postures · lecteur ${b.mode === "flux" ? "flux / respirations" : "minuteur statique"}</span></div>
          <div class="tools">${i < BUILTIN_BOOKS.length ? '<span class="tag">Intégré</span>' : `<button data-rm="${b.id}" aria-label="Supprimer">${icon("trash")}</button>`}</div></li>`).join("")}
      </ul>
      <details style="margin-top:14px"><summary class="muted">Importer un fichier JSON (sans IA)</summary>
        <input type="file" id="json" accept="application/json" style="margin-top:10px" /></details>
    </section>`;

  const log = view.querySelector("#log");
  const run = async (files) => {
    if (!files.length) return;
    log.innerHTML = '<span class="spinner"></span> ';
    try {
      const book = await importFiles([...files], (m) => (log.innerHTML = `<span class="spinner"></span> ${esc(m)}`));
      log.textContent = `✓ « ${book.titre} » ajouté : ${book.postures.length} postures, style ${book.style}.`;
      setTimeout(renderImport, 1800);
    } catch (err) {
      log.textContent = "⚠ " + err.message;
    }
  };
  const drop = view.querySelector("#drop");
  view.querySelector("#file").onchange = (e) => run(e.target.files);
  ["dragenter", "dragover"].forEach((t) => drop.addEventListener(t, (e) => { e.preventDefault(); drop.classList.add("over"); }));
  ["dragleave", "drop"].forEach((t) => drop.addEventListener(t, (e) => { e.preventDefault(); drop.classList.remove("over"); }));
  drop.addEventListener("drop", (e) => run(e.dataTransfer.files));
  view.querySelector("#json").onchange = async (e) => {
    try { const b = importJSON(await e.target.files[0].text()); toast(`${b.postures.length} postures ajoutées`); renderImport(); }
    catch (err) { toast("JSON invalide"); }
  };
  view.onclick = (e) => {
    const rm = e.target.closest("[data-rm]");
    if (rm && confirm("Supprimer ce livre de ta bibliothèque ?")) { removeBook(rm.dataset.rm); renderImport(); }
  };
}

// ---------- Profil ----------
function renderProfil() {
  const voices = frenchVoices();
  view.innerHTML = `
    <section class="section"><span class="eyebrow">Réglages</span><h1 style="margin-top:4px">Mon profil</h1></section>
    <section class="section glass panel">
      <h2>Mes contraintes</h2>
      <p class="muted" style="font-size:.9rem">Elles personnalisent les conseils de supports, signalent les postures à éviter et guident le générateur de séances.</p>
      <div class="filters" style="flex-wrap:wrap;margin-top:12px">
        ${CONTRAINTES.map((c) => `<button class="chip" data-contrainte="${c.id}" aria-pressed="${state.contraintes.includes(c.id)}">${esc(c.label)}</button>`).join("")}
      </div>
    </section>
    <section class="section glass panel">
      <h2>Guidage vocal & souffle</h2>
      ${ttsSupported ? "" : '<p class="alert">La synthèse vocale n\'est pas disponible dans ce navigateur.</p>'}
      <label class="toggle-line" style="margin-top:8px"><input type="checkbox" id="v-on" ${state.voix.active ? "checked" : ""}/> Lire les consignes à voix haute</label>
      <div class="form-row"><label for="v-voice">Voix</label>
        <select id="v-voice"><option value="">Automatique</option>${voices.map((v) => `<option value="${esc(v.voiceURI)}" ${v.voiceURI === state.voix.voiceURI ? "selected" : ""}>${esc(v.name)}</option>`).join("")}</select></div>
      <div class="form-row"><label for="v-rate">Vitesse de lecture : <span id="v-rate-l">${state.voix.vitesse}</span></label>
        <input type="range" id="v-rate" min="0.7" max="1.2" step="0.02" value="${state.voix.vitesse}"/></div>
      <div class="detail-grid" style="grid-template-columns:1fr 1fr;margin-top:0">
        <div class="form-row"><label for="b-in">Inspiration (s)</label><input type="number" id="b-in" min="2" max="10" value="${state.souffle.inspire}"/></div>
        <div class="form-row"><label for="b-out">Expiration (s)</label><input type="number" id="b-out" min="2" max="14" value="${state.souffle.expire}"/></div>
      </div>
      <div class="row" style="margin-top:12px"><button class="btn ghost small" id="v-test">${icon("listen")} Tester la voix</button></div>
      <h3 style="margin-top:20px">Principes de respiration</h3>
      <ul class="muted" style="font-size:.92rem">${PRINCIPES.respiration.map((r) => `<li>${esc(r)}</li>`).join("")}</ul>
    </section>
    <section class="section glass panel">
      <h2>Analyse IA (import)</h2>
      <p class="muted" style="font-size:.9rem">Clé API Claude utilisée uniquement pour l'import de livres. Elle reste stockée dans ce navigateur et n'est jamais envoyée ailleurs qu'à l'API d'Anthropic.</p>
      <div class="form-row"><label for="ia-key">Clé API</label><input type="password" id="ia-key" autocomplete="off" placeholder="sk-ant-…" value="${esc(state.ia.cle)}"/></div>
      <div class="form-row"><label for="ia-model">Modèle</label><input id="ia-model" value="${esc(state.ia.modele)}"/></div>
    </section>
    <section class="section glass panel">
      <h2>Données</h2>
      <p class="muted" style="font-size:.85rem;margin-bottom:10px">Version de l'application : ${APP_VERSION}</p>
      <div class="row"><button class="btn ghost small" id="export">Exporter ma bibliothèque (JSON)</button></div>
    </section>`;

  view.onclick = (e) => {
    const c = e.target.closest("[data-contrainte]");
    if (c) { toggleContrainte(c.dataset.contrainte); c.setAttribute("aria-pressed", state.contraintes.includes(c.dataset.contrainte)); }
  };
  const bind = (sel, fn, ev = "change") => view.querySelector(sel)?.addEventListener(ev, (e) => { fn(e.target); save(); });
  bind("#v-on", (t) => (state.voix.active = t.checked));
  bind("#v-voice", (t) => (state.voix.voiceURI = t.value));
  bind("#v-rate", (t) => { state.voix.vitesse = +t.value; view.querySelector("#v-rate-l").textContent = t.value; }, "input");
  bind("#b-in", (t) => (state.souffle.inspire = Math.min(10, Math.max(2, +t.value || 4))));
  bind("#b-out", (t) => (state.souffle.expire = Math.min(14, Math.max(2, +t.value || 6))));
  bind("#ia-key", (t) => (state.ia.cle = t.value.trim()));
  bind("#ia-model", (t) => (state.ia.modele = t.value.trim() || "claude-sonnet-5-5"));
  view.querySelector("#v-test").onclick = () => { stopSpeaking(); speak("Inspire profondément… et expire longuement.", { force: true }); };
  view.querySelector("#export").onclick = () => {
    const blob = new Blob([JSON.stringify({ livres: state.livres, maSeance: state.maSeance, contraintes: state.contraintes }, null, 2)], { type: "application/json" });
    const a = Object.assign(document.createElement("a"), { href: URL.createObjectURL(blob), download: "yoga-detox-studio.json" });
    a.click();
  };
}

// ---------- Thème ----------
document.getElementById("theme-toggle").onclick = () => {
  const dark = document.documentElement.dataset.theme !== "dark";
  document.documentElement.dataset.theme = dark ? "dark" : "light";
  try { localStorage.setItem("yds.theme", dark ? "dark" : "light"); } catch {}
};

router();
