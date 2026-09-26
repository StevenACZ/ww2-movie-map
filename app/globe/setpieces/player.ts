import { Matrix4, Quaternion, Vector3 } from "three";
import type { GlobeContext } from "../engine";
import { easeInOut, slerp } from "../geo";
import { SetPieceAudio } from "./audio";
import {
  SET_PIECES,
  beatAt,
  type SetPieceId,
  type SetPieceMeta,
} from "./catalog";
import { Kit, smooth, type Pose, type SceneDef } from "./kit";
import { SCENES } from "./scenes";

export interface PlayerHooks {
  frame(t: number, duration: number): void;
  beat(index: number): void;
  state(playing: boolean): void;
  end(): void;
}

type Phase = "intro" | "run" | "outro";

const NEAR = 0.0005;
const WORLD_UP = new Vector3(0, 1, 0);
const ORIGIN = new Vector3();
const END_DISTANCE = 1.42;
const LIFT = 0.12;

export class SetPiecePlayer {
  private kit: Kit | null = null;
  private meta: SetPieceMeta | null = null;
  private scene: SceneDef | null = null;
  private update: ((t: number) => void) | null = null;
  private audio: SetPieceAudio | null = null;
  private removeTicker: (() => void) | null = null;
  private flashEl: HTMLDivElement | null = null;
  private flashValue = 0;
  private phase: Phase = "run";
  private phaseU = 0;
  private phaseLength = 1;
  private t = 0;
  private playing = false;
  private dirty = true;
  private beat = -1;
  private step = 0;
  private cue = 0;
  private near = 0.01;
  private readonly still: boolean;
  private readonly pose: Pose = {
    position: new Vector3(),
    quaternion: new Quaternion(),
    target: new Vector3(),
  };
  private readonly from = new Vector3();
  private readonly end = new Vector3();
  private readonly dirA = new Vector3();
  private readonly dirB = new Vector3();
  private readonly look = new Vector3();
  private readonly lookUp = new Vector3();
  private readonly matrix = new Matrix4();

  constructor(
    private readonly ctx: GlobeContext,
    private readonly hooks: PlayerHooks
  ) {
    this.still = ctx.reducedMotion;
  }

  start(id: SetPieceId, sound: boolean) {
    if (this.kit) this.finish(false);
    const meta = SET_PIECES.find((entry) => entry.id === id);
    const scene = SCENES[id];
    if (!meta || !scene) return;
    this.meta = meta;
    this.scene = scene;
    this.kit = new Kit(scene.anchor, scene.scale ?? 1, scene.capacity);
    this.ctx.scene.add(this.kit.root);
    this.update = scene.build(this.kit);
    this.audio = this.still ? null : new SetPieceAudio(sound);
    const camera = this.ctx.camera;
    this.near = camera.near;
    camera.near = NEAR;
    const width = this.ctx.container.clientWidth || 1;
    const height = this.ctx.container.clientHeight || 1;
    camera.setViewOffset(width, height, 0, height * LIFT, width, height);
    camera.updateProjectionMatrix();
    this.ctx.cinematic(true);
    this.from.copy(camera.position);
    this.end.copy(this.kit.up).multiplyScalar(END_DISTANCE);
    this.t = this.still ? meta.stills[0]! : 0;
    this.step = 0;
    this.beat = -1;
    this.cue = 0;
    this.dirty = true;
    if (this.still) {
      this.phase = "run";
      this.playing = false;
    } else {
      this.kit.pose(scene.camera, 0, this.pose);
      const angle = this.dirA
        .copy(this.from)
        .normalize()
        .angleTo(this.dirB.copy(this.pose.position).normalize());
      this.phase = "intro";
      this.phaseU = 0;
      this.phaseLength = 2 + angle * 0.9;
      this.playing = true;
    }
    this.removeTicker = this.ctx.addTicker(this.tick);
    this.hooks.state(this.playing);
  }

  toggle() {
    if (!this.kit) return;
    if (this.still) {
      this.next();
      return;
    }
    if (this.phase === "outro") return;
    this.playing = !this.playing;
    if (this.playing) this.audio?.resume();
    else this.audio?.pause();
    this.dirty = true;
    this.hooks.state(this.playing);
  }

  next() {
    if (!this.meta) return;
    if (!this.still) return;
    if (this.step >= this.meta.beats.length - 1) {
      this.close();
      return;
    }
    this.step++;
    this.t = this.meta.stills[this.step]!;
    this.dirty = true;
  }

  previous() {
    if (!this.meta || !this.still || this.step === 0) return;
    this.step--;
    this.t = this.meta.stills[this.step]!;
    this.dirty = true;
  }

  replay() {
    if (!this.meta) return;
    this.step = 0;
    this.t = this.still ? this.meta.stills[0]! : 0;
    this.cue = 0;
    this.dirty = true;
    if (this.phase === "outro") this.phase = "run";
    if (!this.still) {
      this.playing = true;
      this.audio?.resume();
      this.hooks.state(true);
    }
  }

  close() {
    if (!this.kit) return;
    if (this.still || this.phase === "intro") {
      this.finish(true);
      return;
    }
    if (this.phase === "outro") return;
    this.beginOutro();
  }

  dispose() {
    this.finish(false);
  }

  private beginOutro() {
    this.phase = "outro";
    this.phaseU = 0;
    this.phaseLength = 1.8;
    this.audio?.pause();
  }

  private tick = (_now: number, dt: number): boolean => {
    const kit = this.kit;
    const meta = this.meta;
    const scene = this.scene;
    if (!kit || !meta || !scene || !this.update) return false;
    if (this.phase === "intro") {
      this.phaseU = Math.min(1, this.phaseU + dt / this.phaseLength);
      if (this.phaseU >= 1) this.phase = "run";
    } else if (this.phase === "outro") {
      this.phaseU = Math.min(1, this.phaseU + dt / this.phaseLength);
    } else if (this.playing) {
      this.t = Math.min(meta.duration, this.t + dt);
      this.dirty = true;
      const cues = scene.cues;
      while (this.cue < cues.length && cues[this.cue]![0] <= this.t) {
        const cue = cues[this.cue++]!;
        this.audio?.play(cue[1], cue[2]);
      }
      if (this.t >= meta.duration) this.beginOutro();
    }

    const animating = this.phase !== "run" || this.playing;
    const changed = animating || this.dirty;
    if (changed) {
      kit.begin(this.t);
      this.update(this.t);
      kit.end();
      kit.pose(scene.camera, this.t, this.pose);
      this.dirty = false;
    }
    this.place();
    this.applyFlash(this.still ? 0 : kit.flash);

    const beat = this.still ? this.step : beatAt(meta, this.t);
    if (beat !== this.beat) {
      this.beat = beat;
      this.hooks.beat(beat);
    }
    this.hooks.frame(this.t, meta.duration);

    if (this.phase === "outro" && this.phaseU >= 1) {
      this.finish(true);
      return true;
    }
    return changed;
  };

  private place() {
    const camera = this.ctx.camera;
    const pose = this.pose;
    if (this.phase === "run") {
      camera.position.copy(pose.position);
      camera.quaternion.copy(pose.quaternion);
      return;
    }
    const intro = this.phase === "intro";
    const u = intro ? this.phaseU : 1 - this.phaseU;
    const e = easeInOut(u);
    const far = intro ? this.from : this.end;
    this.dirA.copy(far).normalize();
    this.dirB.copy(pose.position).normalize();
    slerp(this.dirA, this.dirB, e, camera.position);
    camera.position
      .normalize()
      .multiplyScalar(
        far.length() + (pose.position.length() - far.length()) * e
      );
    const w = smooth(0.2, 1, u);
    this.look.copy(ORIGIN).lerp(pose.target, w);
    this.lookUp.copy(WORLD_UP).lerp(this.kit!.up, w).normalize();
    this.matrix.lookAt(camera.position, this.look, this.lookUp);
    camera.quaternion.setFromRotationMatrix(this.matrix);
  }

  private applyFlash(value: number) {
    if (value === this.flashValue) return;
    this.flashValue = value;
    if (!this.flashEl) {
      if (value <= 0) return;
      const el = document.createElement("div");
      el.setAttribute("aria-hidden", "true");
      el.style.cssText =
        "position:absolute;inset:0;z-index:6;pointer-events:none;background:#fffaf0;opacity:0";
      this.ctx.container.append(el);
      this.flashEl = el;
    }
    this.flashEl.style.opacity = value.toFixed(3);
  }

  private teardown() {
    this.removeTicker?.();
    this.removeTicker = null;
    this.kit?.dispose();
    this.kit = null;
    this.update = null;
    this.audio?.dispose();
    this.audio = null;
    this.flashEl?.remove();
    this.flashEl = null;
    this.flashValue = 0;
  }

  private finish(notify: boolean) {
    const active = !!this.kit;
    const camera = this.ctx.camera;
    if (active) {
      if (this.still || this.phase !== "outro") {
        camera.position.copy(this.end);
        camera.lookAt(0, 0, 0);
      }
      camera.near = this.near;
      camera.clearViewOffset();
      camera.updateProjectionMatrix();
    }
    this.teardown();
    this.meta = null;
    this.scene = null;
    if (!active) return;
    this.ctx.cinematic(false);
    if (notify) this.hooks.end();
  }
}
