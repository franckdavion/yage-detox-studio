// Lecteur de séance : installation guidée → tenue minutée avec souffle → sortie → posture suivante.
// Deux modes : « statique » (Yin, minuteur long) et « flux » (styles dynamiques, compteur de respirations).
import { state, matchedAdaptations } from "./store.js";
import { speak, stopSpeaking, pauseSpeaking, resumeSpeaking } from "./tts.js";
import { esc, fmt, icon, postureFigure } from "./ui.js";
import { mountPoseAnimation } from "./animation.js";

const ROOT = () => document.getElementById("player-root");
const RING = 2 * Math.PI * 46;

// Transforme une liste [{posture, duree}] en étapes, avec les deux côtés si nécessaire
function expand(entries) {
  const out = [];
  for (const { posture, duree } of entries) {
    if (posture.cotes) {
      out.push({ posture, duree, cote: "droit" });
      out.push({ posture, duree, cote: "gauche" });
    } else out.push({ posture, duree });
  }
  return out;
}

let current = null;

export function openPlayer(entries, { titre = "" } = {}) {
  closePlayer();
  current = new Session(expand(entries), titre);
  current.mount();
}

export function closePlayer() {
  if (current) current.destroy();
  current = null;
}

class Session {
  constructor(steps, titre) {
    this.steps = steps;
    this.titre = titre;
    this.index = 0;
    this.phase = "installation"; // installation | tenue | sortie | fin
    this.paused = false;
    this.elapsed = 0;            // ms écoulées dans la phase en cours
    this.phaseLength = 0;        // ms (0 = attendre la fin de la voix)
    this.last = performance.now();
    this.spoken = new Set();
    this.waitingVoice = false;
    this.breathIn = state.souffle.inspire * 1000;
    this.breathOut = state.souffle.expire * 1000;
    this.wakeLock = null;
  }

  get step() { return this.steps[this.index]; }

  mount() {
    const el = document.createElement("div");
    el.className = "player";
    el.setAttribute("role", "dialog");
    el.setAttribute("aria-label", "Lecteur de séance");
    el.innerHTML = `
      <div class="player-top">
        <button class="icon-btn" data-act="close" aria-label="Fermer le lecteur">${icon("close")}</button>
        <span class="eyebrow">${esc(this.titre)}</span>
        <button class="icon-btn" data-act="voice" aria-label="Activer ou couper la voix">${icon(state.voix.active ? "voice" : "mute")}</button>
      </div>
      <div class="player-progress">${this.steps.map(() => "<span></span>").join("")}</div>
      <div class="player-main">
        <div class="player-title">
          <div class="phase" data-ref="phase"></div>
          <h2 data-ref="name"></h2>
          <div class="muted serif" data-ref="sub" style="font-style:italic;font-size:1.1rem"></div>
        </div>
        <div class="dial">
          <svg viewBox="0 0 100 100" aria-hidden="true">
            <circle class="track" cx="50" cy="50" r="46" fill="none" stroke-width="1.5"/>
            <circle class="prog-ring" data-ref="ring" cx="50" cy="50" r="46" fill="none" stroke-width="2.5" stroke-linecap="round"
              stroke-dasharray="${RING}" stroke-dashoffset="${RING}"/>
          </svg>
          <div class="center">
            <div class="breath-orb" data-ref="orb"></div>
            <div class="dial-visual" data-ref="visual"></div>
          </div>
        </div>
        <div class="dial-readout">
          <div class="dial-time" data-ref="time">—</div>
          <div class="dial-breath" data-ref="breath"></div>
        </div>
        <p class="cue-text" data-ref="cue" aria-live="polite"></p>
        <div class="controls">
          <button class="ctrl" data-act="prev" aria-label="Posture précédente">${icon("prev")}</button>
          <button class="ctrl main" data-act="toggle" aria-label="Pause / lecture">${icon("pause")}</button>
          <button class="ctrl" data-act="next" aria-label="Étape suivante">${icon("next")}</button>
        </div>
        <div class="next-up muted" data-ref="nextup"></div>
      </div>`;
    ROOT().appendChild(el);
    this.el = el;
    this.refs = Object.fromEntries([...el.querySelectorAll("[data-ref]")].map((n) => [n.dataset.ref, n]));
    el.addEventListener("click", (e) => {
      const b = e.target.closest("[data-act]");
      if (!b) return;
      const a = b.dataset.act;
      if (a === "close") closePlayer();
      if (a === "toggle") this.togglePause();
      if (a === "next") this.skip();
      if (a === "prev") this.back();
      if (a === "voice") {
        state.voix.active = !state.voix.active;
        b.innerHTML = icon(state.voix.active ? "voice" : "mute");
        if (!state.voix.active) stopSpeaking();
      }
    });
    this.onKey = (e) => {
      if (e.key === "Escape") closePlayer();
      if (e.key === " ") { e.preventDefault(); this.togglePause(); }
      if (e.key === "ArrowRight") this.skip();
    };
    document.addEventListener("keydown", this.onKey);
    document.body.style.overflow = "hidden";
    this.requestWakeLock();
    this.startPhase("installation");
    this.raf = requestAnimationFrame(this.loop);
  }

  // Visuel au cœur du minuteur : animation d'entrée pendant l'installation,
  // photo (ou, à défaut, silhouette qui respire) pendant la tenue et la sortie.
  setVisual(phase) {
    const { posture, cote } = this.step;
    const v = this.refs.visual;
    v.classList.toggle("mirror", cote === "gauche");
    const wantsAnim = phase === "installation" || !posture.image;
    const key = `${posture.id}:${wantsAnim ? phase === "installation" ? "entree" : "tenue" : "photo"}`;
    if (v.dataset.key === key) return;
    v.dataset.key = key;
    this.stopAnim?.();
    this.stopAnim = null;
    const holdAnim = () => (this.stopAnim = mountPoseAnimation(v, posture, { mode: "tenue", breath: () => this.breathPhase ?? 0.5 }));
    if (phase === "installation") this.stopAnim = mountPoseAnimation(v, posture, { mode: "boucle" });
    else if (!posture.image) holdAnim();
    else {
      v.innerHTML = postureFigure(posture, { cls: "dial-art" });
      // Photo introuvable : on bascule sur la silhouette animée
      v.querySelector("img")?.addEventListener("error", () => { if (v.dataset.key === key) holdAnim(); }, { once: true });
    }
  }

  destroy() {
    this.stopAnim?.();
    cancelAnimationFrame(this.raf);
    stopSpeaking();
    document.removeEventListener("keydown", this.onKey);
    document.body.style.overflow = "";
    this.wakeLock?.release?.().catch(() => {});
    this.el?.remove();
  }

  async requestWakeLock() {
    try { this.wakeLock = await navigator.wakeLock?.request("screen"); } catch {}
  }

  // --- Durées ---
  holdMs() {
    const { posture, duree } = this.step;
    if (posture.mode === "flux") {
      const n = posture.respirations || 5;
      return n * (this.breathIn + this.breathOut);
    }
    return (duree || posture.duree || 180) * 1000;
  }

  // --- Phases ---
  startPhase(phase) {
    this.phase = phase;
    this.elapsed = 0;
    this.spoken = new Set();
    stopSpeaking();
    const { posture, cote } = this.step;
    const r = this.refs;
    this.renderProgress();
    r.name.textContent = posture.nom;
    if (phase !== "fin") this.setVisual(phase);
    r.sub.textContent = posture.sanskrit + (cote ? ` · côté ${cote}` : "");
    const next = this.steps[this.index + 1];
    r.nextup.textContent = next ? `Ensuite : ${next.posture.nom}${next.cote ? " (côté " + next.cote + ")" : ""}` : "Dernière posture";

    if (phase === "installation") {
      r.phase.textContent = "Installation";
      chime(520);
      const second = cote === "gauche";
      const adapt = matchedAdaptations(posture).map(([, t]) => t);
      const lines = second
        ? [`Côté gauche. Reprends ${posture.nom} en miroir.`, "Prends le temps de bien t'installer."]
        : [`${posture.nom}.`, ...posture.entree, ...adapt.map((t) => "Pour toi : " + t)];
      r.cue.textContent = second ? "Même posture, de l'autre côté, en miroir." : posture.entree[0];
      this.cueQueue = second ? [] : posture.entree.slice(1);
      this.phaseLength = state.voix.active ? 0 : (second ? 15000 : 30000);
      this.waitingVoice = state.voix.active;
      if (state.voix.active) {
        this.speakSeq(lines).then(() => {
          if (this.phase === "installation") { this.waitingVoice = false; this.phaseLength = this.elapsed + 4000; }
        });
      }
      this.setTimeDisplay("Prépare-toi");
    }
    if (phase === "tenue") {
      r.phase.textContent = posture.mode === "flux" ? "Flux · respirations" : "Tenue";
      chime(660);
      this.phaseLength = this.holdMs();
      this.waitingVoice = false;
      r.cue.textContent = posture.optimisation?.[0] || "Respire lentement par le nez.";
      this.speakSeq(["Reste ici. Relâche les muscles et laisse le souffle s'allonger."]);
    }
    if (phase === "sortie") {
      r.phase.textContent = "Sortie";
      chime(440);
      const lines = this.step.posture.sortie || ["Sors doucement de la posture."];
      r.cue.textContent = lines[0];
      this.phaseLength = state.voix.active ? 0 : 15000;
      this.waitingVoice = state.voix.active;
      if (state.voix.active) {
        this.speakSeq(["Sors doucement de la posture.", ...lines, "Prends un moment pour ressentir."]).then(() => {
          if (this.phase === "sortie") { this.waitingVoice = false; this.phaseLength = this.elapsed + 6000; }
        });
      }
      this.setTimeDisplay("Ressens");
    }
    if (phase === "fin") {
      r.phase.textContent = "Fin de séance";
      this.stopAnim?.();
      this.stopAnim = null;
      r.visual.dataset.key = "";
      r.visual.innerHTML = '<div class="dial-namaste">🙏</div>';
      r.name.textContent = "Namasté";
      r.sub.textContent = "Merci pour cette pratique";
      r.cue.textContent = "Garde quelques instants ce calme avec toi avant de reprendre tes activités.";
      r.nextup.textContent = "";
      this.setTimeDisplay("🙏");
      r.breath.textContent = "";
      r.ring.style.strokeDashoffset = 0;
      chime(392, 2.4);
      this.speakSeq(["La séance est terminée. Garde ce calme avec toi. Namasté."]);
    }
  }

  speakSeq(lines) {
    return speak(lines);
  }

  advance() {
    if (this.phase === "installation") return this.startPhase("tenue");
    if (this.phase === "tenue") return this.startPhase("sortie");
    if (this.phase === "sortie") {
      if (this.index < this.steps.length - 1) {
        this.index++;
        return this.startPhase("installation");
      }
      return this.startPhase("fin");
    }
  }

  skip() { if (this.phase !== "fin") this.advance(); }
  back() {
    if (this.phase === "installation" && this.index > 0) this.index--;
    this.startPhase("installation");
  }

  togglePause() {
    this.paused = !this.paused;
    const b = this.el.querySelector('[data-act="toggle"]');
    b.innerHTML = icon(this.paused ? "play" : "pause");
    if (this.paused) pauseSpeaking(); else resumeSpeaking();
  }

  // --- Boucle d'animation ---
  loop = (now) => {
    const dt = now - this.last;
    this.last = now;
    if (!this.paused && this.phase !== "fin") {
      this.elapsed += dt;
      this.update();
    }
    this.raf = requestAnimationFrame(this.loop);
  };

  update() {
    const r = this.refs;
    if (this.phase === "tenue") {
      const total = this.phaseLength;
      const left = Math.max(0, total - this.elapsed);
      const ratio = Math.min(1, this.elapsed / total);
      r.ring.style.strokeDashoffset = RING * (1 - ratio);
      const { posture } = this.step;
      // Souffle
      const cycle = this.breathIn + this.breathOut;
      const t = this.elapsed % cycle;
      const inhale = t < this.breathIn;
      r.breath.textContent = inhale ? "Inspire" : "Expire";
      r.orb.style.transitionDuration = (inhale ? this.breathIn : this.breathOut) + "ms";
      r.orb.style.transform = `scale(${inhale ? 1 : 0.72})`;
      this.breathPhase = inhale ? t / this.breathIn : 1 - (t - this.breathIn) / this.breathOut;
      r.visual.style.transitionDuration = r.orb.style.transitionDuration;
      r.visual.style.transform = `scale(${inhale ? 1.035 : 0.965})`;
      if (posture.mode === "flux") {
        const n = Math.min(posture.respirations || 5, Math.floor(this.elapsed / cycle) + 1);
        r.time.classList.remove("word");
        r.time.textContent = `${n}/${posture.respirations || 5}`;
      } else {
        r.time.classList.remove("word");
        r.time.textContent = fmt(Math.ceil(left / 1000));
      }
      // Guidage du souffle à voix haute sur les trois premiers cycles
      const c = Math.floor(this.elapsed / cycle);
      const key = `b${c}${inhale ? "i" : "e"}`;
      if (c > 0 && c < 4 && !this.spoken.has(key)) {
        this.spoken.add(key);
        speak(inhale ? "Inspire…" : "Expire, longuement…");
      }
      // Repères d'optimisation, visualisation, annonce de fin
      const opt = posture.optimisation || [];
      this.cueAt(0.22, "o1", opt[1] || opt[0]);
      this.cueAt(0.4, "visu", posture.visualisation, true);
      this.cueAt(0.65, "o2", opt[2] || "Si les sensations s'intensifient, réfugie-toi dans ton souffle.");
      this.cueAt(0.82, "o3", opt[3] || "Relâche encore un peu les épaules et la mâchoire.");
      if (total > 40000 && left < 15000) this.cueOnce("end", "Encore quelques respirations. Prépare-toi à sortir doucement.");
      if (left <= 0) this.advance();
    } else {
      // Installation / sortie : avancer quand la voix a terminé (ou après le délai sans voix)
      r.ring.style.strokeDashoffset = RING;
      r.orb.style.transitionDuration = "3000ms";
      r.orb.style.transform = "scale(0.85)";
      r.visual.style.transitionDuration = "1500ms";
      r.visual.style.transform = "scale(1)";
      r.breath.textContent = "";
      if (this.phase === "installation" && !state.voix.active && this.cueQueue?.length) {
        const per = this.phaseLength / (this.cueQueue.length + 1);
        const i = Math.floor(this.elapsed / per) - 1;
        if (i >= 0 && this.cueQueue[i]) r.cue.textContent = this.cueQueue[i];
      }
      // Garde-fou : certains navigateurs ne signalent jamais la fin de la voix
      if (this.waitingVoice && this.elapsed > 150000) this.waitingVoice = false, this.phaseLength = this.elapsed;
      if (!this.waitingVoice && this.phaseLength && this.elapsed >= this.phaseLength) this.advance();
    }
  }

  cueAt(ratio, key, text, poetic = false) {
    if (!text || this.spoken.has(key)) return;
    if (this.elapsed / this.phaseLength >= ratio) this.cueOnce(key, text, poetic);
  }
  cueOnce(key, text) {
    if (this.spoken.has(key)) return;
    this.spoken.add(key);
    this.refs.cue.textContent = text;
    speak(text);
  }

  setTimeDisplay(t) { this.refs.time.textContent = t; this.refs.time.classList.add("word"); }

  renderProgress() {
    [...this.el.querySelectorAll(".player-progress span")].forEach((s, i) => {
      s.className = i < this.index ? "done" : i === this.index ? "now" : "";
    });
  }
}

// Son de cloche doux (Web Audio)
let actx;
function chime(freq = 528, len = 1.8) {
  try {
    actx = actx || new (window.AudioContext || window.webkitAudioContext)();
    const t = actx.currentTime;
    [1, 2.01, 3.02].forEach((h, i) => {
      const o = actx.createOscillator();
      const g = actx.createGain();
      o.type = "sine";
      o.frequency.value = freq * h;
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(0.12 / (i + 1), t + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, t + len);
      o.connect(g).connect(actx.destination);
      o.start(t);
      o.stop(t + len + 0.1);
    });
  } catch {}
}
