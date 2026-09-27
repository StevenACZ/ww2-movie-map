import { clamp01, hash, smooth, type Kit } from "../kit";

export function atomicCloud(
  kit: Kit,
  burst: number,
  height: number,
  top: number,
  seed: number
) {
  const noise = Array.from({ length: 420 }, (_, i) =>
    hash(seed * 311 + i * 1.77)
  );
  return (t: number) => {
    const age = t - burst;
    if (age < 0.08) return;
    const grow = smooth(0.08, 2.8, age);
    const crown = height + top * (1 - Math.exp(-age / 9));
    const cap = 0.55 + 3.9 * smooth(0, 20, age);
    const tube = cap * 0.43;
    const heat = 1 - smooth(0.6, 5.5, age);
    const drift = smooth(6, 34, age) * 0.9;
    for (let i = 0; i < 84; i++) {
      const n = noise[i]!;
      const f = (i + n) / 84;
      const a = n * Math.PI * 2 + age * 0.12 + f * 7;
      const neck = (0.4 + Math.abs(f - 0.5) * 0.9 + f * f * 0.9) * grow;
      kit.smoke.push(
        Math.cos(a) * neck * (0.35 + noise[i + 84]! * 0.6) + drift * f,
        0.12 + crown * f,
        Math.sin(a) * neck * 0.8,
        (1.45 + f * 1.25 + noise[i + 168]! * 0.7) * grow,
        0.61 * grow,
        heat * f * 0.45,
        0.49 + f * 0.15 + n * 0.12,
        0.14,
        n
      );
    }
    for (let j = 0; j < 7; j++) {
      for (let i = 0; i < 24; i++) {
        const n = noise[j * 24 + i]!;
        const a = (i / 24) * Math.PI * 2 + n * 0.22;
        const phi = (j / 7) * Math.PI * 2 + age * 0.21 + n * 0.6;
        const radial = cap * 0.82 + Math.cos(phi) * tube;
        const y = crown + Math.sin(phi) * tube * 0.78;
        const below = clamp01(-Math.sin(phi));
        kit.smoke.push(
          Math.cos(a) * radial + drift,
          y,
          Math.sin(a) * radial,
          tube * (1.45 + n * 0.72) * grow,
          0.78 * grow,
          heat * (0.12 + below * 0.4),
          0.76 + Math.sin(phi) * 0.13 + n * 0.06,
          0.03,
          n + age * 0.004
        );
      }
    }
    for (let i = 0; i < 42; i++) {
      const n = noise[i + 230]!;
      const a = i * 2.39996;
      const f = Math.sqrt(n) * 0.85;
      kit.smoke.push(
        Math.cos(a) * cap * f + drift,
        crown + tube * (0.5 + (1 - f) * 0.9),
        Math.sin(a) * cap * f,
        tube * (1.5 + noise[i + 272]! * 0.4) * grow,
        0.76 * grow,
        heat * 0.13,
        0.88,
        0.015,
        n
      );
    }
    for (let i = 0; i < 62; i++) {
      const n = noise[i + 300]!;
      const a = i * 2.39996;
      const r = Math.sqrt(n) * (0.4 + 5.8 * smooth(1, 22, age));
      kit.smoke.push(
        Math.cos(a) * r,
        0.15 + noise[i + 350]! * 0.42,
        Math.sin(a) * r,
        (1.1 + noise[i + 250]! * 1.2) * grow,
        0.52 * grow,
        0,
        0.43 + n * 0.12,
        0.48,
        n
      );
    }
    if (age < 5) {
      const r = 0.6 + age * 2.9;
      kit.glow.ring(0, 0.09, 0, r, 0.045, (1 - age / 5) * 0.35, 1, 0.88, 0.64);
      for (let i = 0; i < 48; i++) {
        const a = (i / 48) * Math.PI * 2;
        kit.smoke.push(
          Math.cos(a) * r,
          0.12,
          Math.sin(a) * r,
          0.4 + age * 0.5,
          smooth(0.1, 0.8, age) * (1 - age / 5) * 0.55,
          0,
          0.65,
          0.2,
          noise[i]!
        );
      }
    }
    if (age > 0.8 && age < 5.5) {
      const u = (age - 0.8) / 4.7;
      for (let i = 0; i < 36; i++) {
        const a = (i / 36) * Math.PI * 2;
        const r = 1.1 + u * 6;
        kit.smoke.push(
          Math.cos(a) * r,
          height + 1.4 + u * 2.1,
          Math.sin(a) * r,
          0.8 + u * 0.7,
          Math.sin(u * Math.PI) * 0.38,
          0,
          0.98,
          0,
          noise[i]!
        );
      }
    }
  };
}
