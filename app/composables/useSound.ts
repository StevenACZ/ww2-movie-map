export type SoundKind = "ww2" | "ww1" | "interwar" | "click" | "whoosh";

const STORAGE_KEY = "ww2_sound";

const GAIN: Record<SoundKind, number> = {
  ww1: 0.8,
  interwar: 0.7,
  ww2: 0.85,
  click: 0.45,
  whoosh: 0.5,
};

let ctx: AudioContext | undefined;
let master: GainNode | undefined;
const buffers = new Map<string, Promise<AudioBuffer | null>>();

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
    master.gain.value = 0.7;
    master.connect(ctx.destination);
  }
  if (ctx.state === "suspended") void ctx.resume();
  return ctx;
}

export function loadSample(
  ac: BaseAudioContext,
  name: string
): Promise<AudioBuffer | null> {
  let buffer = buffers.get(name);
  if (!buffer) {
    buffer = fetch(`/audio/${name}.mp3`)
      .then((response) => {
        if (!response.ok) throw new Error(String(response.status));
        return response.arrayBuffer();
      })
      .then((data) => ac.decodeAudioData(data))
      .catch(() => {
        buffers.delete(name);
        return null;
      });
    buffers.set(name, buffer);
  }
  return buffer;
}

export function useSound() {
  const enabled = useState("sound-enabled", () => true);

  function warm() {
    const ac = audio();
    if (!ac) return;
    for (const kind of Object.keys(GAIN)) void loadSample(ac, kind);
  }

  function hydrate() {
    try {
      enabled.value = localStorage.getItem(STORAGE_KEY) !== "off";
    } catch {
      enabled.value = true;
    }
    window.addEventListener(
      "pointerdown",
      () => {
        if (enabled.value) warm();
      },
      { once: true, passive: true }
    );
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
    const out = master;
    void loadSample(ac, kind).then((buffer) => {
      if (!buffer || !enabled.value) return;
      const source = ac.createBufferSource();
      source.buffer = buffer;
      source.playbackRate.value = 0.97 + Math.random() * 0.06;
      const gain = ac.createGain();
      gain.gain.value = GAIN[kind];
      source.connect(gain).connect(out);
      source.start();
    });
  }

  return { enabled, hydrate, toggle, play };
}
