import { loadSample } from "~/composables/useSound";
import type { Cue } from "./kit";

type Kind = Cue[1];

const SAMPLE: Record<Kind, string> = {
  boom: "sp-boom",
  far: "sp-far",
  rumble: "sp-rumble",
  drone: "sp-drone",
};

const DRONE_LOOP = [0.2, 8.2] as const;

const LEVEL: Record<Kind, number> = {
  boom: 0.9,
  far: 0.65,
  rumble: 1,
  drone: 0.35,
};

export class SetPieceAudio {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private readonly samples = new Map<Kind, AudioBuffer>();

  constructor(enabled: boolean) {
    if (!enabled || typeof window === "undefined") return;
    const Ctor =
      window.AudioContext ??
      (window as unknown as { webkitAudioContext?: typeof AudioContext })
        .webkitAudioContext;
    if (!Ctor) return;
    this.ctx = new Ctor();
    this.master = this.ctx.createGain();
    this.master.gain.value = 0.8;
    this.master.connect(this.ctx.destination);
    for (const kind of Object.keys(SAMPLE) as Kind[]) {
      void loadSample(this.ctx, SAMPLE[kind]).then((buffer) => {
        if (buffer) this.samples.set(kind, buffer);
      });
    }
  }

  play(kind: Kind, level: number) {
    const ac = this.ctx;
    const buffer = this.samples.get(kind);
    if (!ac || !this.master || !buffer) return;
    if (ac.state === "suspended") void ac.resume();
    const at = ac.currentTime + 0.02;
    const source = ac.createBufferSource();
    source.buffer = buffer;
    const gain = ac.createGain();
    source.connect(gain).connect(this.master);
    if (kind === "drone") {
      const peak = LEVEL.drone;
      source.loop = true;
      source.loopStart = DRONE_LOOP[0];
      source.loopEnd = DRONE_LOOP[1];
      gain.gain.setValueAtTime(0.0001, at);
      gain.gain.exponentialRampToValueAtTime(peak, at + 1.5);
      gain.gain.setValueAtTime(peak, at + Math.max(1.6, level - 1.5));
      gain.gain.exponentialRampToValueAtTime(0.0001, at + level);
      source.start(at);
      source.stop(at + level + 0.1);
      return;
    }
    source.playbackRate.value = 0.92 + Math.random() * 0.16;
    gain.gain.value = LEVEL[kind] * level;
    source.start(at);
  }

  pause() {
    if (this.ctx?.state === "running") void this.ctx.suspend();
  }

  resume() {
    if (this.ctx?.state === "suspended") void this.ctx.resume();
  }

  dispose() {
    void this.ctx?.close();
    this.ctx = null;
    this.master = null;
    this.samples.clear();
  }
}
