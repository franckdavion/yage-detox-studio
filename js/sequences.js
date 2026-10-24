// Générateur de séances thématiques adaptées au profil
import { allPostures, warningsFor } from "./store.js";

const TRANSITION = 60; // secondes estimées pour l'installation et la sortie (Yin)

export function cost(p, duree = p.duree) {
  const transition = p.yeux ? 12 : p.etirement ? 20 : p.mode === "flux" ? 25 : TRANSITION;
  return (duree + transition) * (p.cotes ? 2 : 1);
}

export function totalSeconds(entries) {
  return entries.reduce((s, e) => s + cost(e.posture, e.duree), 0);
}

// theme : clé de THEMES ou "" ; minutes : durée cible ; style : filtre éventuel
export function generate({ theme = "", minutes = 30, style = "" } = {}) {
  const pool = allPostures().filter(
    (p) => warningsFor(p).length === 0 && (!style || p.style === style)
  );
  // Posture finale : Savasana pour le Yin, relaxation finale pour la chaise
  const finale = style === "chaise" ? "chaise-relaxation" : style === "yeux" ? "yeux-palming" : style === "etirements" ? "etir-enfant-bras" : "savasana";
  const savasana = pool.find((p) => p.id === finale);
  const openId = style === "chaise" ? "chaise-assise" : style === "yeux" ? "yeux-installation" : null;
  const rest = pool.filter((p) => p.id !== finale && p.id !== openId);
  const opening = openId ? pool.find((p) => p.id === openId) : null;
  const score = (p) => (theme && p.themes?.includes(theme) ? 10 : 0) + Math.random() * 4;
  const bucket = (m) => rest.filter((p) => p.moments?.[0] === m).sort((a, b) => score(b) - score(a));

  const finalDur = savasana ? (style === "yin" || !style ? 300 : savasana.duree) : 0;
  // Étirements : on équilibre les zones (dos, jambes, hanches, haut du corps)
  if (style === "etirements") {
    const zones = ["dos", "jambes", "hanches", "haut"];
    const out = [];
    let left = minutes * 60 - (savasana ? cost(savasana, finalDur) : 0);
    const pools = zones.map((z) => rest.filter((p) => p.zone === z).sort((a, b) => score(b) - score(a)));
    let added = true;
    while (added) {
      added = false;
      for (const pl of pools) {
        const p = pl.shift();
        if (p && cost(p) <= left) { out.push({ posture: p, duree: p.duree }); left -= cost(p); added = true; }
      }
    }
    // Ordre doux : debout et à genoux d'abord, au sol ensuite
    const order = { debut: 0, milieu: 1, fin: 2 };
    out.sort((a, b) => order[a.posture.moments[0]] - order[b.posture.moments[0]]);
    if (savasana) out.push({ posture: savasana, duree: finalDur });
    return out;
  }
  let budget = minutes * 60 - (savasana ? cost(savasana, finalDur) : 0);
  const chosen = opening ? [{ posture: opening, duree: opening.duree }] : [];
  const take = (list, share) => {
    let local = budget * share;
    for (const p of list) {
      if (chosen.some((c) => c.posture.id === p.id)) continue;
      const c = cost(p);
      if (c <= local || (chosen.length === 0 && c <= budget)) {
        chosen.push({ posture: p, duree: p.duree });
        local -= c;
      }
    }
  };
  const debut = bucket("debut"), milieu = bucket("milieu"), fin = bucket("fin");
  take(debut, 0.3);
  budget = minutes * 60 - totalSeconds(chosen) - (savasana ? cost(savasana, finalDur) : 0);
  take(milieu, 0.65);
  budget = minutes * 60 - totalSeconds(chosen) - (savasana ? cost(savasana, finalDur) : 0);
  take(fin, 1);
  if (savasana) chosen.push({ posture: savasana, duree: finalDur });
  return chosen;
}
