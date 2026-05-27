"use client";

type WebKitWindow = Window & {
  webkitAudioContext?: typeof AudioContext;
};

let audioContext: AudioContext | null = null;
let drawOscillator: OscillatorNode | null = null;
let drawGainNode: GainNode | null = null;
let keepAliveAudio: HTMLAudioElement | null = null;
let keepAliveAudioUrl: string | null = null;
let isPrimed = false;

const SILENT_GAIN = 0.00002;
const DRAW_GAIN = 0.4;

export const isIPhoneAudioDevice = () => {
  if (typeof navigator === "undefined") return false;
  return /iPhone|iPod/.test(navigator.userAgent);
};

const writeString = (view: DataView, offset: number, value: string) => {
  for (let index = 0; index < value.length; index += 1) {
    view.setUint8(offset + index, value.charCodeAt(index));
  }
};

const createKeepAliveWavUrl = () => {
  const sampleRate = 44100;
  const durationSeconds = 0.75;
  const samples = Math.floor(sampleRate * durationSeconds);
  const bytesPerSample = 2;
  const channels = 1;
  const dataSize = samples * channels * bytesPerSample;
  const buffer = new ArrayBuffer(44 + dataSize);
  const view = new DataView(buffer);

  writeString(view, 0, "RIFF");
  view.setUint32(4, 36 + dataSize, true);
  writeString(view, 8, "WAVE");
  writeString(view, 12, "fmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, channels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * channels * bytesPerSample, true);
  view.setUint16(32, channels * bytesPerSample, true);
  view.setUint16(34, 16, true);
  writeString(view, 36, "data");
  view.setUint32(40, dataSize, true);

  for (let index = 0; index < samples; index += 1) {
    const sample = Math.sin((2 * Math.PI * 19500 * index) / sampleRate);
    view.setInt16(44 + index * 2, Math.round(sample * 6), true);
  }

  return URL.createObjectURL(new Blob([buffer], { type: "audio/wav" }));
};

const ensureKeepAliveAudio = () => {
  if (typeof window === "undefined") return null;
  if (keepAliveAudio) return keepAliveAudio;

  keepAliveAudioUrl = createKeepAliveWavUrl();
  keepAliveAudio = new Audio(keepAliveAudioUrl);
  keepAliveAudio.loop = true;
  keepAliveAudio.preload = "auto";
  keepAliveAudio.controls = false;
  keepAliveAudio.muted = false;
  keepAliveAudio.volume = 1;
  keepAliveAudio.setAttribute("playsinline", "true");
  keepAliveAudio.setAttribute("webkit-playsinline", "true");

  return keepAliveAudio;
};

const playKeepAliveAudio = () => {
  const audio = ensureKeepAliveAudio();
  if (!audio) return;
  if (!audio.paused && !audio.ended) return;

  audio.currentTime = 0;
  void audio.play().catch((error) => {
    console.warn("iPhone keep-alive audio play failed:", error);
  });
};

const getAudioContext = () => {
  if (typeof window === "undefined") return null;
  if (audioContext) return audioContext;

  const AudioContextConstructor =
    window.AudioContext || (window as WebKitWindow).webkitAudioContext;

  if (!AudioContextConstructor) return null;
  audioContext = new AudioContextConstructor();
  return audioContext;
};

const resumeContext = (context: AudioContext) => {
  if (context.state !== "running") {
    void context.resume().catch((error) => {
      console.warn("iPhone audio resume failed:", error);
    });
  }
};

const ensureAudioGraph = () => {
  const context = getAudioContext();
  if (!context) return null;

  resumeContext(context);

  if (!drawOscillator || !drawGainNode) {
    drawOscillator = context.createOscillator();
    drawGainNode = context.createGain();

    drawOscillator.type = "sine";
    drawOscillator.frequency.setValueAtTime(440, context.currentTime);
    drawGainNode.gain.setValueAtTime(SILENT_GAIN, context.currentTime);

    drawOscillator.connect(drawGainNode);
    drawGainNode.connect(context.destination);
    drawOscillator.start();
  }

  return context;
};

export const primeIPhoneAudio = () => {
  playKeepAliveAudio();

  const context = ensureAudioGraph();
  if (!context || !drawGainNode) return false;

  const now = context.currentTime;
  drawGainNode.gain.cancelScheduledValues(now);
  drawGainNode.gain.setValueAtTime(SILENT_GAIN, now);
  drawGainNode.gain.linearRampToValueAtTime(0.18, now + 0.012);
  drawGainNode.gain.setTargetAtTime(SILENT_GAIN, now + 0.07, 0.02);
  isPrimed = true;

  return context.state === "running";
};

export const playIPhoneDrawTone = (frequency: number) => {
  playKeepAliveAudio();

  const context = ensureAudioGraph();
  if (!context || !drawOscillator || !drawGainNode) return false;

  const now = context.currentTime;
  drawOscillator.frequency.cancelScheduledValues(now);
  drawOscillator.frequency.setValueAtTime(frequency, now);
  drawGainNode.gain.cancelScheduledValues(now);
  drawGainNode.gain.setValueAtTime(DRAW_GAIN, now);
  isPrimed = true;

  return context.state === "running";
};

export const stopIPhoneDrawTone = () => {
  if (!audioContext || !drawGainNode) return;

  const now = audioContext.currentTime;
  drawGainNode.gain.cancelScheduledValues(now);
  drawGainNode.gain.setTargetAtTime(SILENT_GAIN, now, 0.015);
};

export const isIPhoneAudioPrimed = () => {
  return Boolean(isPrimed && audioContext?.state === "running");
};
