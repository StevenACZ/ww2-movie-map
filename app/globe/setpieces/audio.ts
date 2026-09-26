import type { Cue } from "./kit";

export class SetPieceAudio {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private noise: AudioBuffer | null = null;

  constructor(enabled: boolean) {
    if (!enabled || typeof window === "undefined") return;
    const Ctor =
      window.AudioContext ??
      (window as unknown as { webkitAudioContext?: typeof AudioContext })
        .webkitAudioContext;
    if (!Ctor) return;
    this.ctx = new Ctor();
    this.master = this.ctx.createGain();
    this.master.gain.value = 0.4;
    this.master.connect(this.ctx.destination);
    this.noise = this.ctx.createBuffer(
      1,
      this.ctx.sampleRate * 3,
      this.ctx.sampleRate
    );
    const data = this.noise.getChannelData(0);
    let last = 0;
    for (let i = 0; i < data.length; i++) {
      last = last * 0.96 + (Math.random() * 2 - 1) * 0.04;
      data[i] = last * 6;
    }
  }

  play(kind: Cue[1], level: number) {
    const ac = this.ctx;
    if (!ac || !this.master || !this.noise) return;
    if (ac.state === "suspended") void ac.resume();
    const at = ac.currentTime + 0.02;
    if (kind === "drone") {
      this.drone(ac, at, level);
      return;
    }
    const long = kind === "rumble" ? 7 : kind === "far" ? 4 : 2.6;
    const peak =
      (kind === "far" ? 0.35 : kind === "rumble" ? 0.55 : 0.75) * level;
    const src = ac.createBufferSource();
    src.buffer = this.noise;
    const filter = ac.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(kind === "far" ? 220 : 420, at);
    filter.frequency.exponentialRampToValueAtTime(60, at + long);
    const gain = ac.createGain();
    gain.gain.setValueAtTime(0.0001, at);
    gain.gain.exponentialRampToValueAtTime(
      peak,
      at + (kind === "rumble" ? 0.6 : 0.03)
    );
    gain.gain.exponentialRampToValueAtTime(0.0001, at + long);
    src.connect(filter).connect(gain).connect(this.master);
    src.start(at);
    src.stop(at + long + 0.1);
    const osc = ac.createOscillator();
    osc.frequency.setValueAtTime(kind === "rumble" ? 42 : 70, at);
    osc.frequency.exponentialRampToValueAtTime(28, at + long * 0.8);
    const body = ac.createGain();
    body.gain.setValueAtTime(0.0001, at);
    body.gain.exponentialRampToValueAtTime(peak * 0.8, at + 0.05);
    body.gain.exponentialRampToValueAtTime(0.0001, at + long * 0.8);
    osc.connect(body).connect(this.master);
    osc.start(at);
    osc.stop(at + long);
  }

  private drone(ac: AudioContext, at: number, seconds: number) {
    const filter = ac.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = 320;
    const gain = ac.createGain();
    gain.gain.setValueAtTime(0.0001, at);
    gain.gain.exponentialRampToValueAtTime(0.09, at + 1.5);
    gain.gain.setValueAtTime(0.09, at + Math.max(1.6, seconds - 1.5));
    gain.gain.exponentialRampToValueAtTime(0.0001, at + seconds);
    filter.connect(gain).connect(this.master!);
    for (const freq of [58, 61.5, 116]) {
      const osc = ac.createOscillator();
      osc.type = "sawtooth";
      osc.frequency.value = freq;
      osc.connect(filter);
      osc.start(at);
      osc.stop(at + seconds + 0.1);
    }
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
    this.noise = null;
  }
}
