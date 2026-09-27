import { Matrix4, Quaternion, Vector3 } from "three";
import type { GlobeContext } from "../engine";
import { easeInOut, slerp } from "../geo";
import { SetPieceAudio } from "./audio";
import { KM } from "./effects";
import {
  SET_PIECES,
  beatAt,
  type SetPieceId,
  type SetPieceMeta,
} from "./catalog";
import { ground, Kit, smooth, type Pose, type SceneDef } from "./kit";
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
  private gradeEl: HTMLDivElement | null = null;
  private skyEl: HTMLDivElement | null = null;
  private skyValue = -1;
  private nightEl: HTMLDivElement | null = null;
  private nightValue = -1;
  private labelsEl: HTMLDivElement | null = null;
  private labelEls: HTMLDivElement[] = [];
  private labelSpots: number[] = [];
  private readonly probe = new Vector3();
  private arc = 0;
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
  private far = 100;
  private clipped = false;
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
    this.kit.stage.visible = !scene.bare;
    this.ctx.scene.add(this.kit.root);
    this.update = scene.build(this.kit);
    this.audio = this.still ? null : new SetPieceAudio(sound);
    const camera = this.ctx.camera;
    this.near = camera.near;
    this.far = camera.far;
    this.clipped = false;
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
      this.kit.pose(scene.camera, 0, this.pose, scene.near);
      const angle = this.dirA
        .copy(this.from)
        .normalize()
        .angleTo(this.dirB.copy(this.pose.position).normalize());
      this.phase = "intro";
      this.phaseU = 0;
      this.phaseLength = 2 + angle * 0.9;
      this.arc = Math.min(0.9, angle * 0.5);
      this.playing = true;
    }
    this.removeTicker = this.ctx.addTicker(this.tick);
    this.grade(true);
    this.sky();
    this.labels();
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

  setSound(enabled: boolean) {
    if (!this.kit || this.still) return;
    this.audio?.dispose();
    this.audio = null;
    if (!enabled || this.phase === "outro") return;
    this.audio = new SetPieceAudio(true);
    if (!this.playing) this.audio.pause();
    if (this.phase !== "run" || !this.scene) return;
    for (const [at, kind, duration, pan] of this.scene.cues) {
      if (kind !== "drone" && kind !== "surf" && kind !== "engine") continue;
      if (at <= this.t && at + duration > this.t)
        this.audio.play(kind, at + duration - this.t, pan, this.scene.pace);
    }
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
      this.audio?.stop();
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
    this.arc = 0.08;
    this.audio?.stop();
    this.grade(false);
  }

  private sky() {
    if (this.skyEl) return;
    const el = document.createElement("div");
    el.setAttribute("aria-hidden", "true");
    el.style.cssText =
      "position:absolute;inset:0;z-index:0;pointer-events:none;opacity:0;background:linear-gradient(to bottom,#11161d 0%,#232b35 22%,#3d434b 42%,#474a4d 100%)";
    this.ctx.container.prepend(el);
    this.skyEl = el;
    this.skyValue = 0;
  }

  private applySky() {
    if (!this.skyEl) return;
    const u = this.phaseU;
    const value =
      this.still || this.phase === "run"
        ? 1
        : this.phase === "intro"
          ? smooth(0.55, 1, u)
          : 1 - smooth(0, 0.45, u);
    const rounded = Math.round(value * 100) / 100;
    if (rounded === this.skyValue) return;
    this.skyValue = rounded;
    this.skyEl.style.opacity = String(rounded);
  }

  private labels() {
    const list = this.scene?.labels;
    const kit = this.kit;
    if (!list?.length || !kit) return;
    const es = document.documentElement.lang.startsWith("es");
    const layer = document.createElement("div");
    layer.setAttribute("aria-hidden", "true");
    layer.style.cssText =
      "position:absolute;inset:0;z-index:5;pointer-events:none;overflow:hidden";
    for (const label of list) {
      const [x, z] = kit.geo(label.at[0], label.at[1]);
      this.labelSpots.push(x, z, label.lift ?? 0.4);
      const el = document.createElement("div");
      el.style.cssText =
        "position:absolute;left:0;top:0;display:flex;flex-direction:column;align-items:center;opacity:0;will-change:transform,opacity";
      const pill = document.createElement("div");
      pill.style.cssText =
        "display:flex;align-items:center;gap:6px;padding:5px 10px 5px 7px;border-radius:999px;background:rgb(11 12 9 / 0.8);border:1px solid rgb(216 174 82 / 0.5);color:#ece6d6;font:600 11px/1 var(--font-mono, monospace);letter-spacing:0.12em;text-transform:uppercase;white-space:nowrap";
      for (const flag of label.flags ?? []) {
        const img = document.createElement("img");
        img.src = `/flags/${flag}.webp`;
        img.alt = "";
        img.style.cssText =
          "height:11px;width:auto;border-radius:2px;box-shadow:0 0 0 1px rgb(0 0 0 / 0.45)";
        pill.append(img);
      }
      pill.append(
        typeof label.text === "string"
          ? label.text
          : es
            ? label.text.es
            : label.text.en
      );
      const stem = document.createElement("div");
      stem.style.cssText =
        "width:1px;height:18px;background:linear-gradient(rgb(216 174 82 / 0.75),rgb(216 174 82 / 0.15))";
      const dot = document.createElement("div");
      dot.style.cssText =
        "width:5px;height:5px;border-radius:50%;background:#d8ae52;box-shadow:0 0 6px rgb(216 174 82 / 0.8)";
      el.append(pill, stem, dot);
      layer.append(el);
      this.labelEls.push(el);
    }
    this.ctx.container.append(layer);
    this.labelsEl = layer;
  }

  private applyLabels() {
    const list = this.scene?.labels;
    const kit = this.kit;
    if (!list || !kit || !this.labelEls.length) return;
    const camera = this.ctx.camera;
    camera.updateMatrixWorld();
    const width = this.ctx.container.clientWidth;
    const height = this.ctx.container.clientHeight;
    const shown = this.still || this.phase === "run" ? 1 : 0;
    for (let i = 0; i < list.length; i++) {
      const label = list[i]!;
      const el = this.labelEls[i]!;
      const fade =
        shown *
        smooth(label.from, label.from + 0.6, this.t) *
        (1 - smooth(label.to - 0.6, label.to, this.t));
      const x = this.labelSpots[i * 3]!;
      const z = this.labelSpots[i * 3 + 1]!;
      this.probe
        .set(x, ground(x, z) + this.labelSpots[i * 3 + 2]!, z)
        .applyMatrix4(kit.root.matrix)
        .project(camera);
      const p = this.probe;
      const visible =
        fade > 0.01 && p.z < 1 && Math.abs(p.x) < 1.1 && Math.abs(p.y) < 1.1;
      el.style.opacity = visible ? fade.toFixed(3) : "0";
      if (!visible) continue;
      const sx = ((p.x + 1) / 2) * width;
      const sy = ((1 - p.y) / 2) * height;
      el.style.transform = `translate(${sx.toFixed(1)}px,${sy.toFixed(1)}px) translate(-50%,-100%)`;
    }
  }

  private applyClip() {
    const clip = this.scene?.clip;
    if (!clip) return;
    const on = this.still || this.phase === "run";
    if (on === this.clipped) return;
    this.clipped = on;
    if (this.scene?.bare) {
      this.ctx.cinematic(true, on);
      if (this.kit) this.kit.stage.visible = on;
    }
    const camera = this.ctx.camera;
    camera.near = on ? clip[0] * KM : NEAR;
    camera.far = on ? clip[1] * KM : this.far;
    camera.updateProjectionMatrix();
  }

  private applyNight() {
    const keys = this.scene?.night;
    if (!keys?.length) return;
    let value = keys[keys.length - 1]![1];
    for (let i = 0; i < keys.length - 1; i++) {
      const [a, va] = keys[i]!;
      const [b, vb] = keys[i + 1]!;
      if (this.t <= a) {
        value = va;
        break;
      }
      if (this.t < b) {
        value = va + (vb - va) * smooth(a, b, this.t);
        break;
      }
    }
    if (!this.still && this.phase !== "run")
      value *=
        this.phase === "intro"
          ? smooth(0.4, 1, this.phaseU)
          : 1 - smooth(0, 0.5, this.phaseU);
    const rounded = Math.round(value * 100) / 100;
    if (rounded === this.nightValue) return;
    this.nightValue = rounded;
    if (!this.nightEl) {
      const el = document.createElement("div");
      el.setAttribute("aria-hidden", "true");
      el.style.cssText =
        "position:absolute;inset:0;z-index:4;pointer-events:none;background:#16244a;mix-blend-mode:multiply;opacity:0";
      this.ctx.container.append(el);
      this.nightEl = el;
    }
    this.nightEl.style.opacity = String(rounded);
  }

  private grade(on: boolean) {
    if (!this.gradeEl) {
      const el = document.createElement("div");
      el.setAttribute("aria-hidden", "true");
      el.style.cssText =
        "position:absolute;inset:0;z-index:5;pointer-events:none;opacity:0;transition:opacity 1.4s ease;background:radial-gradient(ellipse 75% 70% at 50% 42%,transparent 55%,rgb(6 7 5 / 0.62) 100%),linear-gradient(to bottom,rgb(6 7 5 / 0.35),transparent 18%,transparent 78%,rgb(6 7 5 / 0.45))";
      this.ctx.container.append(el);
      this.gradeEl = el;
    }
    const el = this.gradeEl;
    requestAnimationFrame(() => {
      el.style.opacity = on ? "1" : "0";
    });
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
      this.t = Math.min(meta.duration, this.t + dt * (this.scene?.pace ?? 1));
      this.dirty = true;
      const cues = scene.cues;
      while (this.cue < cues.length && cues[this.cue]![0] <= this.t) {
        const cue = cues[this.cue++]!;
        this.audio?.play(cue[1], cue[2], cue[3], scene.pace);
      }
      if (this.t >= meta.duration) this.beginOutro();
    }

    const animating = this.phase !== "run" || this.playing;
    const changed = animating || this.dirty;
    if (changed) {
      kit.begin(this.t);
      this.update(this.t);
      kit.end();
      kit.pose(scene.camera, this.t, this.pose, scene.near);
      this.dirty = false;
    }
    this.place();
    this.applyClip();
    this.applySky();
    this.applyNight();
    this.applyLabels();
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
        far.length() +
          (pose.position.length() - far.length()) * e +
          Math.sin(Math.PI * e) * this.arc
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
    this.gradeEl?.remove();
    this.gradeEl = null;
    this.skyEl?.remove();
    this.skyEl = null;
    this.nightEl?.remove();
    this.nightEl = null;
    this.nightValue = -1;
    this.labelsEl?.remove();
    this.labelsEl = null;
    this.labelEls = [];
    this.labelSpots = [];
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
      camera.far = this.far;
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
