import { loadSample } from "~/composables/useSound";
import type { Cue } from "./kit";

type Kind = Cue[1];
type Pending = {
  kind: Kind;
  level: number;
  pan?: number;
  pace: number;
  at: number;
};

const SAMPLE: Record<Kind, string> = {
  boom: "sp-boom",
  far: "sp-far",
  rumble: "sp-rumble",
  drone: "sp-drone",
  surf: "sp-surf-1940",
  engine: "sp-launch-1940",
  flyby: "sp-merlin-1940",
  gunfire: "sp-gunfire",
  "heavy-prop": "sp-heavy-prop",
  blast: "sp-blast",
  "blast-tail": "sp-blast-tail",
};

const LOOPS: Partial<Record<Kind, readonly [number, number]>> = {
  drone: [0.2, 8.2],
  surf: [0.2, 14.2],
  engine: [0.2, 14.2],
  "heavy-prop": [0.2, 14.2],
};

const LEVEL: Record<Kind, number> = {
  boom: 0.9,
  far: 0.65,
  rumble: 1,
  drone: 0.35,
  surf: 0.32,
  engine: 0.24,
  flyby: 0.7,
  gunfire: 0.8,
  "heavy-prop": 0.32,
  blast: 0.95,
  "blast-tail": 0.42,
};

export class SetPieceAudio {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private paused = false;
  private pending: Pending[] = [];
  private readonly sources = new Set<AudioBufferSourceNode>();
  private readonly samples = new Map<Kind, AudioBuffer>();

  constructor(enabled: boolean) {
    if (!enabled || typeof window === "undefined") return;
    const Ctor =
      window.AudioContext ??
      (window as unknown as { webkitAudioContext?: typeof AudioContext })
        .webkitAudioContext;
    if (!Ctor) return;
    const ac = new Ctor();
    this.ctx = ac;
    this.master = ac.createGain();
    this.master.gain.value = 0.8;
    this.master.connect(ac.destination);
    if (ac.state === "suspended") void ac.resume();
    for (const kind of Object.keys(SAMPLE) as Kind[]) {
      void loadSample(ac, SAMPLE[kind]).then((buffer) => {
        if (!buffer || this.ctx !== ac) return;
        this.samples.set(kind, buffer);
        this.flush();
      });
    }
  }

  play(kind: Kind, level: number, pan?: number, pace = 1) {
    if (!this.ctx || level <= 0) return;
    this.pending.push({ kind, level, pan, pace, at: this.ctx.currentTime });
    this.flush();
  }

  private flush() {
    if (this.paused || !this.ctx) return;
    const ready = this.pending.filter((cue) => this.samples.has(cue.kind));
    this.pending = this.pending.filter((cue) => !this.samples.has(cue.kind));
    for (const cue of ready) this.start(cue);
  }

  private start(cue: Pending) {
    const ac = this.ctx;
    const buffer = this.samples.get(cue.kind);
    if (!ac || !this.master || !buffer) return;
    const loop = LOOPS[cue.kind];
    const elapsed = Math.max(0, ac.currentTime - cue.at);
    const duration = loop
      ? cue.level / Math.max(0.01, cue.pace)
      : buffer.duration;
    const remaining = duration - elapsed;
    if (remaining <= 0) return;
    const at = ac.currentTime + 0.02;
    const source = ac.createBufferSource();
    source.buffer = buffer;
    const gain = ac.createGain();
    source.connect(gain);
    let panner: StereoPannerNode | undefined;
    if (cue.pan !== undefined) {
      panner = ac.createStereoPanner();
      const pan = Math.max(-1, Math.min(1, cue.pan));
      panner.pan.setValueAtTime(pan, at);
      if (cue.kind === "flyby")
        panner.pan.linearRampToValueAtTime(-pan, at + remaining);
      gain.connect(panner).connect(this.master);
    } else gain.connect(this.master);
    this.sources.add(source);
    source.onended = () => {
      this.sources.delete(source);
      source.disconnect();
      gain.disconnect();
      panner?.disconnect();
    };
    if (loop) {
      const peak = LEVEL[cue.kind];
      const fade = Math.min(1.5, remaining / 3);
      source.loop = true;
      source.loopStart = loop[0];
      source.loopEnd = loop[1];
      gain.gain.setValueAtTime(0.0001, at);
      gain.gain.exponentialRampToValueAtTime(peak, at + fade);
      gain.gain.setValueAtTime(peak, at + remaining - fade);
      gain.gain.exponentialRampToValueAtTime(0.0001, at + remaining);
      source.start(at, loop[0] + (elapsed % (loop[1] - loop[0])));
      source.stop(at + remaining);
    } else {
      if (cue.kind === "boom" || cue.kind === "far" || cue.kind === "rumble")
        source.playbackRate.value = 0.92 + Math.random() * 0.16;
      gain.gain.value = LEVEL[cue.kind] * cue.level;
      source.start(at, elapsed);
    }
  }

  pause() {
    this.paused = true;
    if (this.ctx) void this.ctx.suspend();
  }

  resume() {
    this.paused = false;
    if (this.ctx) void this.ctx.resume();
    this.flush();
  }

  stop() {
    this.pending = [];
    for (const source of this.sources) source.stop();
    this.sources.clear();
  }

  dispose() {
    this.stop();
    void this.ctx?.close();
    this.ctx = null;
    this.master = null;
    this.samples.clear();
  }
}
