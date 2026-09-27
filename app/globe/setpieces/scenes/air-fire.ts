import { type Kit, type Sample } from "../kit";

export interface AirShot {
  at: number;
  from: [number, number, number];
  to: [number, number, number];
  impact: boolean;
}

export function wingShot(
  at: number,
  plane: Sample,
  side: number,
  size: number,
  to: [number, number, number],
  impact = true
): AirShot {
  const lateral = side * size * 0.29;
  const forward = size * 0.2;
  const x = lateral * Math.cos(plane.roll);
  const y =
    lateral * Math.sin(plane.roll) * Math.cos(plane.pitch) +
    forward * Math.sin(plane.pitch);
  const z =
    forward * Math.cos(plane.pitch) -
    lateral * Math.sin(plane.roll) * Math.sin(plane.pitch);
  return {
    at,
    from: [
      plane.x + Math.cos(plane.yaw) * x + Math.sin(plane.yaw) * z,
      plane.y + y,
      plane.z - Math.sin(plane.yaw) * x + Math.cos(plane.yaw) * z,
    ],
    to,
    impact,
  };
}

export function airFire(kit: Kit, shots: AirShot[], t: number) {
  for (const shot of shots) {
    const age = t - shot.at;
    if (age < 0 || age > 0.48) continue;
    const [x, y, z] = shot.from;
    const [tx, ty, tz] = shot.to;
    if (age < 0.045)
      kit.glow.disc(x, y, z, 0.055, 1 - age / 0.045, 1, 0.79, 0.38);
    if (age < 0.16) {
      const head = age / 0.16;
      const tail = Math.max(0, head - 0.065);
      kit.tracers.push(
        x + (tx - x) * tail,
        y + (ty - y) * tail,
        z + (tz - z) * tail,
        x + (tx - x) * head,
        y + (ty - y) * head,
        z + (tz - z) * head,
        1,
        0.79,
        0.38,
        0.92
      );
    } else if (shot.impact) {
      const dt = age - 0.16;
      kit.glow.disc(
        tx,
        ty + 0.018,
        tz,
        0.055,
        Math.max(0, 1 - dt / 0.08),
        1,
        0.76,
        0.42
      );
      kit.smoke.push(
        tx + dt * 0.09,
        ty + 0.025 + dt * 0.24,
        tz,
        0.025 + dt * 0.13,
        0.5 * (1 - dt / 0.32),
        0,
        0.62,
        0.5,
        shot.at
      );
    }
  }
}
