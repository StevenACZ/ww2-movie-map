import {
  BufferGeometry,
  DynamicDrawUsage,
  Float32BufferAttribute,
  LineBasicMaterial,
  LineSegments,
  Vector3,
} from "three";

const CAPACITY = 96;
const LIFE = 0.18;

export class AirCombatEffects {
  private readonly geometry = new BufferGeometry();
  private readonly material = new LineBasicMaterial({
    color: 0xffd78c,
    transparent: true,
    opacity: 0.75,
    depthWrite: false,
  });
  readonly mesh = new LineSegments(this.geometry, this.material);
  private readonly positions = new Float32Array(CAPACITY * 6);
  private readonly origins = new Float32Array(CAPACITY * 3);
  private readonly velocities = new Float32Array(CAPACITY * 3);
  private readonly births = new Float64Array(CAPACITY).fill(-100);
  private readonly lifetimes = new Float32Array(CAPACITY);
  private readonly lengths = new Float32Array(CAPACITY);
  private readonly side = new Vector3();
  private cursor = 0;
  private time = 0;
  private enabled = true;

  constructor() {
    this.geometry.setAttribute(
      "position",
      new Float32BufferAttribute(this.positions, 3).setUsage(DynamicDrawUsage)
    );
    this.geometry.setDrawRange(0, 0);
    this.mesh.frustumCulled = false;
    this.mesh.renderOrder = 6;
  }

  begin(time: number, still: boolean) {
    if (still || time < this.time) this.births.fill(-100);
    this.time = time;
    this.enabled = !still;
    this.mesh.visible = !still;
  }

  fire(
    position: Vector3,
    forward: Vector3,
    radius: number,
    scale: number,
    time: number,
    seed: number
  ) {
    if (!this.enabled || (time + seed * 3) % 1.7 > 0.28) return;
    const tick = Math.floor(time * 18);
    this.side.crossVectors(forward, position).normalize();
    for (let wing = -1; wing <= 1; wing += 2) {
      const slot = this.cursor % CAPACITY;
      const offset = slot * 3;
      const previous = (this.cursor + CAPACITY - 4) % CAPACITY;
      if (Math.floor(this.births[previous]! * 18) === tick && wing === -1)
        return;
      this.cursor++;
      this.births[slot] = time;
      this.lifetimes[slot] = LIFE;
      this.lengths[slot] = scale * 0.16;
      this.origins[offset] =
        position.x * radius +
        this.side.x * scale * 0.3 * wing +
        forward.x * scale * 0.18;
      this.origins[offset + 1] =
        position.y * radius +
        this.side.y * scale * 0.3 * wing +
        forward.y * scale * 0.18;
      this.origins[offset + 2] =
        position.z * radius +
        this.side.z * scale * 0.3 * wing +
        forward.z * scale * 0.18;
      this.velocities[offset] = forward.x * scale * 13;
      this.velocities[offset + 1] = forward.y * scale * 13;
      this.velocities[offset + 2] = forward.z * scale * 13;
      const muzzle = this.cursor++ % CAPACITY;
      this.births[muzzle] = time;
      this.lifetimes[muzzle] = 0.035;
      this.lengths[muzzle] = scale * 0.08;
      for (let axis = 0; axis < 3; axis++) {
        this.origins[muzzle * 3 + axis] = this.origins[offset + axis]!;
        this.velocities[muzzle * 3 + axis] =
          this.velocities[offset + axis]! * 0.001;
      }
    }
  }

  flush() {
    let count = 0;
    for (let i = 0; i < CAPACITY; i++) {
      const age = this.time - this.births[i]!;
      if (!this.enabled || age < 0 || age > this.lifetimes[i]!) continue;
      const source = i * 3;
      const target = count++ * 6;
      const speed =
        Math.hypot(
          this.velocities[source]!,
          this.velocities[source + 1]!,
          this.velocities[source + 2]!
        ) || 1;
      for (let axis = 0; axis < 3; axis++) {
        const velocity = this.velocities[source + axis]!;
        this.positions[target + axis] =
          this.origins[source + axis]! + velocity * age;
        this.positions[target + axis + 3] =
          this.positions[target + axis]! +
          (velocity / speed) *
            this.lengths[i]! *
            (1 - age / this.lifetimes[i]!);
      }
    }
    this.geometry.setDrawRange(0, count * 2);
    this.geometry.getAttribute("position").needsUpdate = true;
  }

  dispose() {
    this.geometry.dispose();
    this.material.dispose();
  }
}
