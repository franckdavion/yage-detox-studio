// Générateur de séances thématiques adaptées au profil
import { allPostures, warningsFor } from "./store.js";

const TRANSITION = 60; // secondes estimées pour l'installation et la sortie

export function cost(p, duree = p.duree) {
  return (duree + TRANSITION) * (p.cotes ? 2 : 1);
}

export function totalSeconds(entries) {
  return entries.reduce((s, e) => s + cost(e.posture, e.duree), 0);
}

// theme : clé de THEMES ou "" ; minutes : durée cible ; style : filtre éventuel
export function generate({ theme = "", minutes = 30, style = "" } = {}) {
  const pool = allPostures().filter(
    (p) => warningsFor(p).length === 0 && (!style || p.style === style)
  );
  const savasana = pool.find((p) => p.id === "savasana");
  const rest = pool.filter((p) => p.id !== "savasana");
  const score = (p) => (theme && p.themes?.includes(theme) ? 10 : 0) + Math.random() * 4;
  const bucket = (m) => rest.filter((p) => p.moments?.[0] === m).sort((a, b) => score(b) - score(a));

  let budget = minutes * 60 - (savasana ? cost(savasana, 300) : 0);
  const chosen = [];
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
  budget = minutes * 60 - totalSeconds(chosen) - (savasana ? cost(savasana, 300) : 0);
  take(milieu, 0.65);
  budget = minutes * 60 - totalSeconds(chosen) - (savasana ? cost(savasana, 300) : 0);
  take(fin, 1);
  if (savasana) chosen.push({ posture: savasana, duree: 300 });
  return chosen;
}
