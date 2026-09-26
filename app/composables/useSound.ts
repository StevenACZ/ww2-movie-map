export type SoundKind = "ww2" | "ww1" | "interwar" | "click" | "whoosh";

const STORAGE_KEY = "ww2_sound";

let ctx: AudioContext | undefined;
let master: GainNode | undefined;
let noiseBuffer: AudioBuffer | undefined;

function audio(): AudioContext | undefined {
  if (typeof window === "undefined") return undefined;
  if (!ctx) {
    const Ctor =
      window.AudioContext ??
      (window as unknown as { webkitAudioContext?: typeof AudioContext })
        .webkitAudioContext;
    if (!Ctor) return undefined;
    ctx = new Ctor();
    master = ctx.createGain();
    master.gain.value = 0.55;
    master.connect(ctx.destination);
    noiseBuffer = ctx.createBuffer(1, ctx.sampleRate * 1.5, ctx.sampleRate);
    const data = noiseBuffer.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
  }
  if (ctx.state === "suspended") void ctx.resume();
  return ctx;
}

function envelope(
  ac: AudioContext,
  at: number,
  peak: number,
  attack: number,
  decay: number
) {
  const gain = ac.createGain();
  gain.gain.setValueAtTime(0.0001, at);
  gain.gain.exponentialRampToValueAtTime(peak, at + attack);
  gain.gain.exponentialRampToValueAtTime(0.0001, at + attack + decay);
  gain.connect(master!);
  return gain;
}

function noise(
  ac: AudioContext,
  at: number,
  opts: {
    type: BiquadFilterType;
    freq: number;
    q?: number;
    peak: number;
    attack: number;
    decay: number;
    sweepTo?: number;
  }
) {
  const src = ac.createBufferSource();
  src.buffer = noiseBuffer!;
  const filter = ac.createBiquadFilter();
  filter.type = opts.type;
  filter.frequency.setValueAtTime(opts.freq, at);
  if (opts.sweepTo)
    filter.frequency.exponentialRampToValueAtTime(
      opts.sweepTo,
      at + opts.attack + opts.decay
    );
  filter.Q.value = opts.q ?? 0.8;
  src
    .connect(filter)
    .connect(envelope(ac, at, opts.peak, opts.attack, opts.decay));
  src.start(at, Math.random() * 0.5);
  src.stop(at + opts.attack + opts.decay + 0.05);
}

function tone(
  ac: AudioContext,
  at: number,
  opts: {
    freq: number;
    to?: number;
    type?: OscillatorType;
    peak: number;
    attack: number;
    decay: number;
  }
) {
  const osc = ac.createOscillator();
  osc.type = opts.type ?? "sine";
  osc.frequency.setValueAtTime(opts.freq, at);
  if (opts.to)
    osc.frequency.exponentialRampToValueAtTime(
      opts.to,
      at + opts.attack + opts.decay
    );
  osc.connect(envelope(ac, at, opts.peak, opts.attack, opts.decay));
  osc.start(at);
  osc.stop(at + opts.attack + opts.decay + 0.05);
  return osc;
}

/** M1 Garand: muffled shot, then the en-bloc clip ping. */
function garand(ac: AudioContext, at: number) {
  noise(ac, at, {
    type: "lowpass",
    freq: 1400,
    sweepTo: 180,
    peak: 0.55,
    attack: 0.004,
    decay: 0.22,
  });
  tone(ac, at, { freq: 90, to: 38, peak: 0.5, attack: 0.004, decay: 0.2 });
  const ping = at + 0.2;
  noise(ac, ping, {
    type: "highpass",
    freq: 3500,
    peak: 0.12,
    attack: 0.002,
    decay: 0.03,
  });
  const partials: [number, number, number][] = [
    [2340, 0.22, 0.75],
    [3910, 0.09, 0.4],
    [6450, 0.05, 0.22],
    [1720, 0.05, 0.3],
  ];
  for (const [freq, peak, decay] of partials) {
    tone(ac, ping, { freq, to: freq * 0.985, peak, attack: 0.003, decay });
  }
}

/** Trench whistle: a pea whistle trill with breath noise. */
function whistle(ac: AudioContext, at: number) {
  const duration = 0.55;
  const osc = ac.createOscillator();
  osc.frequency.value = 2850;
  const lfo = ac.createOscillator();
  lfo.frequency.value = 29;
  const depth = ac.createGain();
  depth.gain.value = 140;
  lfo.connect(depth).connect(osc.frequency);
  const trem = ac.createGain();
  trem.gain.value = 0.6;
  const tremDepth = ac.createGain();
  tremDepth.gain.value = 0.4;
  lfo.connect(tremDepth).connect(trem.gain);
  const env = ac.createGain();
  env.gain.setValueAtTime(0.0001, at);
  env.gain.exponentialRampToValueAtTime(0.16, at + 0.03);
  env.gain.setValueAtTime(0.16, at + duration - 0.1);
  env.gain.exponentialRampToValueAtTime(0.0001, at + duration);
  env.connect(master!);
  osc.connect(trem).connect(env);
  osc.start(at);
  lfo.start(at);
  osc.stop(at + duration + 0.05);
  lfo.stop(at + duration + 0.05);
  noise(ac, at, {
    type: "bandpass",
    freq: 2900,
    q: 6,
    peak: 0.08,
    attack: 0.03,
    decay: duration - 0.03,
  });
}

/** Interwar radio: static sweeping across the dial until a station locks. */
function radio(ac: AudioContext, at: number) {
  noise(ac, at, {
    type: "bandpass",
    freq: 700,
    sweepTo: 2600,
    q: 3,
    peak: 0.16,
    attack: 0.02,
    decay: 0.38,
  });
  tone(ac, at, {
    freq: 2100,
    to: 520,
    type: "sine",
    peak: 0.05,
    attack: 0.02,
    decay: 0.34,
  });
  tone(ac, at + 0.38, {
    freq: 440,
    type: "triangle",
    peak: 0.12,
    attack: 0.01,
    decay: 0.16,
  });
  tone(ac, at + 0.58, {
    freq: 660,
    type: "triangle",
    peak: 0.1,
    attack: 0.01,
    decay: 0.2,
  });
}

/** Typewriter key for interface feedback. */
function click(ac: AudioContext, at: number) {
  noise(ac, at, {
    type: "highpass",
    freq: 2200,
    peak: 0.1,
    attack: 0.001,
    decay: 0.028,
  });
  tone(ac, at, { freq: 190, to: 90, peak: 0.08, attack: 0.001, decay: 0.035 });
}

function whoosh(ac: AudioContext, at: number) {
  noise(ac, at, {
    type: "bandpass",
    freq: 300,
    sweepTo: 1300,
    q: 1.4,
    peak: 0.07,
    attack: 0.25,
    decay: 0.45,
  });
}

const PLAYERS: Record<SoundKind, (ac: AudioContext, at: number) => void> = {
  ww2: garand,
  ww1: whistle,
  interwar: radio,
  click,
  whoosh,
};

export function useSound() {
  const enabled = useState("sound-enabled", () => true);

  function hydrate() {
    try {
      enabled.value = localStorage.getItem(STORAGE_KEY) !== "off";
    } catch {
      enabled.value = true;
    }
  }

  function toggle() {
    enabled.value = !enabled.value;
    try {
      localStorage.setItem(STORAGE_KEY, enabled.value ? "on" : "off");
    } catch {
      /* private mode */
    }
    if (enabled.value) play("click");
  }

  function play(kind: SoundKind) {
    if (!enabled.value) return;
    const ac = audio();
    if (!ac || !master) return;
    PLAYERS[kind](ac, ac.currentTime + 0.01);
  }

  return { enabled, hydrate, toggle, play };
}
