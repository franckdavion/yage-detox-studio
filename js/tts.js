// Guidage vocal — Web Speech API (synthèse vocale native du navigateur, en français)
import { state } from "./store.js";

const synth = typeof window !== "undefined" ? window.speechSynthesis : null;
let voices = [];

function loadVoices() {
  if (!synth) return;
  voices = synth.getVoices().filter((v) => v.lang && v.lang.toLowerCase().startsWith("fr"));
}
if (synth) {
  loadVoices();
  synth.addEventListener?.("voiceschanged", loadVoices);
}

export const ttsSupported = !!synth;

export function frenchVoices() {
  loadVoices();
  return voices;
}

function pickVoice() {
  const list = frenchVoices();
  if (state.voix.voiceURI) {
    const v = list.find((x) => x.voiceURI === state.voix.voiceURI);
    if (v) return v;
  }
  // Préférence pour les voix « naturelles » / de qualité quand elles existent
  return (
    list.find((v) => /natural|neural|premium|enhanced|amélioré/i.test(v.name)) ||
    list.find((v) => v.lang === "fr-FR") ||
    list[0] ||
    null
  );
}

// Lit une liste de phrases à la suite. Renvoie une promesse résolue à la fin (ou à l'annulation).
export function speak(texts, { force = false } = {}) {
  if (!synth || (!state.voix.active && !force)) return Promise.resolve();
  const parts = (Array.isArray(texts) ? texts : [texts]).filter(Boolean);
  if (!parts.length) return Promise.resolve();
  const voice = pickVoice();
  return new Promise((resolve) => {
    let remaining = parts.length;
    parts.forEach((t) => {
      const u = new SpeechSynthesisUtterance(t);
      u.lang = voice?.lang || "fr-FR";
      if (voice) u.voice = voice;
      // La vitesse de lecture du lecteur module aussi la voix, dans des limites naturelles
      const tempo = Math.min(1.25, Math.max(0.85, state.vitesseLecture || 1));
      u.rate = state.voix.vitesse * tempo;
      u.pitch = 0.95;
      const done = () => { if (--remaining === 0) resolve(); };
      u.onend = done;
      u.onerror = done;
      synth.speak(u);
    });
  });
}

export function stopSpeaking() {
  synth?.cancel();
}
export function pauseSpeaking() {
  synth?.pause();
}
export function resumeSpeaking() {
  synth?.resume();
}
export function isSpeaking() {
  return !!synth?.speaking;
}
