import type Lenis from "lenis";

export function useLenis() {
  let lenis: Lenis | undefined;
  const router = useRouter();
  let stopAfterEach: (() => void) | undefined;

  onMounted(async () => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const { default: LenisClass } = await import("lenis");
    lenis = new LenisClass({ autoRaf: true, lerp: 0.12, anchors: true });
    stopAfterEach = router.afterEach(() => lenis?.resize());
  });

  onBeforeUnmount(() => {
    stopAfterEach?.();
    lenis?.destroy();
    lenis = undefined;
  });
}
