// Lecteur de séance : installation guidée → tenue minutée avec souffle → sortie → posture suivante.
// Deux modes : « statique » (Yin, minuteur long) et « flux » (styles dynamiques, compteur de respirations).
import { state, save, matchedAdaptations } from "./store.js";
import { speak, stopSpeaking, pauseSpeaking, resumeSpeaking, isSpeaking } from "./tts.js";
import { esc, fmt, icon, postureFigure } from "./ui.js";
import { createCharacter } from "./animation.js";
import { videoFor } from "./data/videos.js";

const ROOT = () => document.getElementById("player-root");
// Vitesse de lecture : accélère ou ralentit le tempo (minuteur, souffle, personnage, voix)
const SPEEDS = [0.75, 1, 1.25, 1.5];
const speed = () => (SPEEDS.includes(state.vitesseLecture) ? state.vitesseLecture : 1);
const fmtSpeed = (v) => `${String(v).replace(".", ",")}×`;
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
        <div class="row" style="gap:6px">
        <button class="icon-btn speed-btn" data-act="speed" aria-label="Vitesse de lecture" title="Vitesse de lecture">${fmtSpeed(speed())}</button>
        <button class="icon-btn avatar-btn" data-act="avatar" aria-label="Changer d'avatar (femme / homme)" title="Avatar femme / homme">${state.avatar === "homme" ? "♂" : "♀"}</button>
        <button class="icon-btn" data-act="visual" aria-label="Basculer personnage / photo" title="Personnage ou photo">${icon(state.lecteurVisuel === "photo" ? "person" : "image")}</button>
        <button class="icon-btn" data-act="voice" aria-label="Activer ou couper la voix">${icon(state.voix.active ? "voice" : "mute")}</button>
        </div>
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
        <div class="voicewave" data-ref="wave" aria-hidden="true">${"<span></span>".repeat(18)}</div>
        <p class="cue-text" data-ref="cue" aria-live="polite"></p>
        <div class="ptimeline">
          <div class="pt-bar" data-ref="bar" role="slider" tabindex="0" aria-label="Progression de l'exercice" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0">
            <div class="pt-fill" data-ref="fill"></div><div class="pt-knob" data-ref="knob"></div>
          </div>
          <div class="pt-times"><span data-ref="tcur">0:00</span><span class="muted" data-ref="tlabel"></span><span data-ref="ttot">—</span></div>
        </div>
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
      if (a === "speed") {
        const i = SPEEDS.indexOf(speed());
        state.vitesseLecture = SPEEDS[(i + 1) % SPEEDS.length];
        save();
        b.textContent = fmtSpeed(speed());
        if (this.video) this.video.playbackRate = speed();
      }
      if (a === "avatar") {
        state.avatar = state.avatar === "homme" ? "femme" : "homme";
        save();
        b.textContent = state.avatar === "homme" ? "♂" : "♀";
        this.refs.visual.dataset.key = "";
        this.setVisual(this.phase === "fin" ? "sortie" : this.phase);
        this.renderCharacter();
      }
      if (a === "visual") {
        state.lecteurVisuel = state.lecteurVisuel === "photo" ? "personnage" : "photo";
        save();
        b.innerHTML = icon(state.lecteurVisuel === "photo" ? "person" : "image");
        this.refs.visual.dataset.key = "";
        this.setVisual(this.phase === "fin" ? "sortie" : this.phase);
        this.renderCharacter();
      }
      if (a === "voice") {
        state.voix.active = !state.voix.active;
        b.innerHTML = icon(state.voix.active ? "voice" : "mute");
        if (!state.voix.active) stopSpeaking();
      }
    });
    // Barre de progression : toucher / glisser pour se déplacer dans la tenue
    const bar = this.refs.bar;
    const seekFromEvent = (e) => {
      const r = bar.getBoundingClientRect();
      this.seekTo(Math.min(1, Math.max(0, (e.clientX - r.left) / r.width)));
    };
    bar.addEventListener("pointerdown", (e) => {
      if (this.phase !== "tenue") return;
      bar.setPointerCapture?.(e.pointerId);
      seekFromEvent(e);
      const move = (ev) => seekFromEvent(ev);
      const up = () => { bar.removeEventListener("pointermove", move); bar.removeEventListener("pointerup", up); bar.removeEventListener("pointercancel", up); };
      bar.addEventListener("pointermove", move);
      bar.addEventListener("pointerup", up);
      bar.addEventListener("pointercancel", up);
    });
    bar.addEventListener("keydown", (e) => {
      if (this.phase !== "tenue" || !this.phaseLength) return;
      const step = 10000 / this.phaseLength;
      if (e.key === "ArrowRight") { e.preventDefault(); e.stopPropagation(); this.seekTo(this.elapsed / this.phaseLength + step); }
      if (e.key === "ArrowLeft") { e.preventDefault(); e.stopPropagation(); this.seekTo(this.elapsed / this.phaseLength - step); }
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

  // Visuel au cœur du minuteur : le personnage illustré (par défaut), piloté image par image
  // par le lecteur — il suit donc exactement les phases, le souffle et la pause — ou la photo du livre.
  setVisual(phase) {
    const { posture, cote } = this.step;
    const v = this.refs.visual;
    v.classList.toggle("mirror", cote === "gauche");
    const usePhoto = state.lecteurVisuel === "photo" && posture.image;
    // Boucle vidéo MP4 (rendu 3D pré-calculé), quand l'exercice en a une
    const vid = usePhoto ? null : videoFor(posture, state.avatar);
    const render3d = vid?.src;
    this.videoSouffle = !!vid?.souffle;
    const key = `${posture.id}:${usePhoto ? "photo" : render3d ? "video" : "perso"}:${state.avatar}`;
    if (v.dataset.key === key) return;
    v.dataset.key = key;
    this.character = null;
    this.video = null;
    const toCharacter = () => {
      this.video = null;
      this.character = createCharacter(v, posture, { aspect: 1.05 });
      this.renderCharacter();
    };
    if (render3d) {
      v.innerHTML = `<video class="dial-video" style="--vzoom:${vid.zoom}" src="${esc(render3d)}" autoplay loop muted playsinline preload="auto" aria-hidden="true"></video>`;
      this.video = v.querySelector("video");
      this.video.playbackRate = speed();
      if (this.paused) this.video.pause();
      this.video.addEventListener("error", () => { if (v.dataset.key === key) toCharacter(); }, { once: true });
    } else if (!usePhoto) toCharacter();
    else {
      v.innerHTML = postureFigure(posture, { cls: "dial-art" });
      // Photo introuvable : le personnage prend le relais
      v.querySelector("img")?.addEventListener("error", () => { if (v.dataset.key === key) toCharacter(); }, { once: true });
    }
  }

  renderCharacter() {
    if (!this.character) return;
    this.character.render({
      phase: this.phase,
      t: this.elapsed,
      length: this.phase === "tenue" ? this.phaseLength : 0,
      breath: this.phase === "tenue" ? this.breathEased : null,
      inhale: this.phase === "tenue" ? this.inhaling : null,
    });
  }

  destroy() {
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
      // Répétitions à cadence fixe (yoga des yeux) ou respirations (chaise, styles dynamiques)
      if (posture.cycle) return (posture.repetitions || 5) * posture.cycle * 1000;
      const n = posture.respirations || 5;
      return n * (this.breathIn + this.breathOut);
    }
    return (duree || posture.duree || 180) * 1000;
  }

  // --- Phases ---
  startPhase(phase) {
    this.phase = phase;
    if (this.video && phase !== "tenue") this.video.playbackRate = speed();
    this.elapsed = 0;
    this.spoken = new Set();
    stopSpeaking();
    const { posture, cote } = this.step;
    const r = this.refs;
    this.renderProgress();
    r.name.textContent = posture.nom;
    if (phase !== "fin") this.setVisual(phase);
    this.renderCharacter();
    r.sub.textContent = posture.sanskrit + (cote ? ` · côté ${cote}` : "");
    const next = this.steps[this.index + 1];
    r.nextup.textContent = next ? `Ensuite : ${next.posture.nom}${next.cote ? " (côté " + next.cote + ")" : ""}` : "Dernière posture";

    if (phase === "installation") {
      r.phase.textContent = "Installation";
      chime(520);
      const second = cote === "gauche";
      const adapt = matchedAdaptations(posture).map(([, t]) => t);
      const lines = second
        ? [posture.secondCote || `Côté gauche. Reprends ${posture.nom} en miroir.`, "Prends le temps de bien t'installer."]
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
      r.phase.textContent = posture.mode === "flux" ? (posture.cycle ? "Exercice · répétitions" : "Flux · respirations") : "Tenue";
      chime(660);
      this.phaseLength = this.holdMs();
      this.waitingVoice = false;
      r.cue.textContent = posture.optimisation?.[0] || "Respire lentement par le nez.";
      // Texte de maintien du modèle (étirements) ou consigne générique
      this.speakSeq([posture.tts?.maintien || "Reste ici. Relâche les muscles et laisse le souffle s'allonger."]);
      if (posture.tts?.maintien) r.cue.textContent = posture.tts.maintien;
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
      if (!this.character) {
        r.visual.dataset.key = "";
        r.visual.innerHTML = '<div class="dial-namaste">🙏</div>';
      }
      this.renderCharacter();
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
    this.el.classList.toggle("paused", this.paused);
    if (this.paused) pauseSpeaking(); else resumeSpeaking();
    if (this.video) this.paused ? this.video.pause() : this.video.play().catch(() => {});
  }

  // --- Boucle d'animation ---
  loop = (now) => {
    const dt = now - this.last;
    this.last = now;
    if (!this.paused && this.phase !== "fin") {
      this.elapsed += dt * speed();
      this.update();
    }
    this.raf = requestAnimationFrame(this.loop);
  };

  update() {
    this.updateTimer();
    this.syncVideo();
    this.renderCharacter();
    this.updateWave();
    this.updateTimeline();
  }

  // Vidéo calée sur le souffle : inspiration = 40 % premiers de la boucle, expiration = le reste
  syncVideo() {
    const vd = this.video;
    if (!vd || !this.videoSouffle || this.phase !== "tenue" || !vd.duration || vd.readyState < 2) return;
    const cycle = this.breathIn + this.breathOut;
    const t = this.elapsed % cycle;
    const D = vd.duration, split = 0.4 * D;
    const target = t < this.breathIn ? (t / this.breathIn) * split : split + ((t - this.breathIn) / this.breathOut) * (D - split);
    // Vitesse ajustée pour suivre le souffle réglé par l'utilisateur, recalage si l'écart devient visible
    const rate = (t < this.breathIn ? split / (this.breathIn / 1000) : (D - split) / (this.breathOut / 1000)) * speed();
    if (Math.abs(vd.playbackRate - rate) > 0.02) vd.playbackRate = Math.min(4, Math.max(0.25, rate));
    let diff = Math.abs(vd.currentTime - target);
    diff = Math.min(diff, D - diff);
    if (diff > 0.25) vd.currentTime = target;
  }

  // Barre de progression de l'exercice en cours (tenue : déplaçable ; installation / sortie : indicative)
  updateTimeline() {
    const r = this.refs;
    const labels = { installation: "Installation", tenue: this.step.posture.mode === "flux" ? "Exercice" : "Tenue", sortie: "Sortie", fin: "" };
    const total = this.phase === "tenue" ? this.phaseLength : this.phaseLength || 0;
    const ratio = total ? Math.min(1, this.elapsed / total) : 0;
    r.fill.style.transform = `scaleX(${ratio.toFixed(4)})`;
    r.knob.style.left = `${(ratio * 100).toFixed(2)}%`;
    r.bar.classList.toggle("seekable", this.phase === "tenue");
    r.bar.setAttribute("aria-valuenow", Math.round(ratio * 100));
    r.tcur.textContent = fmt(Math.floor(this.elapsed / 1000));
    r.ttot.textContent = total ? fmt(Math.round(total / 1000)) : "…";
    r.tlabel.textContent = labels[this.phase] || "";
  }

  // Se déplacer dans la tenue : les consignes déjà passées ne sont pas relues
  seekTo(ratio) {
    if (this.phase !== "tenue" || !this.phaseLength) return;
    ratio = Math.min(0.999, Math.max(0, ratio));
    this.elapsed = ratio * this.phaseLength;
    stopSpeaking();
    for (const [rr, k] of [[0.22, "o1"], [0.4, "visu"], [0.65, "o2"], [0.82, "o3"]]) if (ratio >= rr) this.spoken.add(k);
    const cycle = this.breathIn + this.breathOut;
    const c = Math.floor(this.elapsed / cycle);
    const inhale = this.elapsed % cycle < this.breathIn;
    for (let i = 0; i < c; i++) { this.spoken.add(`b${i}i`); this.spoken.add(`b${i}e`); }
    this.spoken.add(`b${c}i`);
    if (!inhale) this.spoken.add(`b${c}e`);
    if (this.phaseLength - this.elapsed < 15000) this.spoken.add("end");
    this.update();
  }

  // Visualiseur d'onde : s'anime quand la voix parle, ondule doucement au rythme du souffle sinon
  updateWave() {
    const bars = this.refs.wave?.children;
    if (!bars) return;
    const talking = isSpeaking();
    const b = this.phase === "tenue" ? this.breathEased ?? 0.5 : 0.35;
    const t = this.elapsed / 1000;
    for (let i = 0; i < bars.length; i++) {
      const wave = (Math.sin(t * 2.2 + i * 0.55) + 1) / 2;
      const h = talking ? 0.25 + 0.75 * Math.abs(Math.sin(t * 9 + i * 1.7) * Math.cos(t * 4.3 + i)) : 0.12 + 0.35 * b * wave;
      bars[i].style.transform = `scaleY(${h.toFixed(3)})`;
    }
    this.refs.wave.classList.toggle("talking", talking);
  }

  updateTimer() {
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
      this.breathEased = (1 - Math.cos(Math.PI * this.breathPhase)) / 2;
      this.inhaling = inhale;
      r.visual.style.transitionDuration = r.orb.style.transitionDuration;
      const amp = this.character ? 0.012 : 0.035;
      r.visual.style.transform = `scale(${inhale ? 1 + amp : 1 - amp})`;
      if (posture.mode === "flux") {
        const per = posture.cycle ? posture.cycle * 1000 : cycle;
        const tot = posture.cycle ? posture.repetitions || 5 : posture.respirations || 5;
        const n = Math.min(tot, Math.floor(this.elapsed / per) + 1);
        r.time.classList.remove("word");
        r.time.textContent = `${n}/${tot}`;
      } else {
        r.time.classList.remove("word");
        r.time.textContent = fmt(Math.ceil(left / 1000));
      }
      // Guidage du souffle à voix haute sur les trois premiers cycles
      const c = Math.floor(this.elapsed / cycle);
      const key = `b${c}${inhale ? "i" : "e"}`;
      const rythme = posture.souffle === "alterne"; // mouvement guidé à chaque respiration
      if ((rythme ? c < (posture.respirations || 5) : c > 0 && c < 4) && !this.spoken.has(key)) {
        this.spoken.add(key);
        // Pilates : consigne complète sur les deux premières respirations, puis rappel court
        const sc = posture.souffleCues;
        if (sc) speak(c < 2 ? (inhale ? sc.inspire : sc.expire) : inhale ? "Inspire." : "Expire.");
        else speak(inhale ? "Inspire…" : "Expire, longuement…");
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
