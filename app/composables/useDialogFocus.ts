import { nextTick, onBeforeUnmount, onMounted, ref, watch } from "vue";

interface ActiveDialog {
  element: HTMLElement;
  close: () => void;
}

const dialogs: ActiveDialog[] = [];
let previousOverflow = "";

const focusableElements = (element: HTMLElement) =>
  Array.from(
    element.querySelectorAll<HTMLElement>(
      "button, input, select, textarea, a[href], iframe, [tabindex]"
    )
  ).filter(
    (target) =>
      target.tabIndex >= 0 &&
      !target.matches(":disabled") &&
      !target.closest('[inert], [hidden], [aria-hidden="true"]') &&
      target.getClientRects().length > 0 &&
      getComputedStyle(target).visibility === "visible"
  );

const focusDialog = (dialog: ActiveDialog) => {
  (focusableElements(dialog.element)[0] ?? dialog.element).focus({
    preventScroll: true,
  });
};

const handleFocus = (event: FocusEvent) => {
  const dialog = dialogs.at(-1);
  if (dialog && !dialog.element.contains(event.target as Node)) {
    focusDialog(dialog);
  }
};

const handleKeydown = (event: KeyboardEvent) => {
  const dialog = dialogs.at(-1);
  if (!dialog) return;
  if (event.key === "Escape") {
    event.preventDefault();
    event.stopImmediatePropagation();
    dialog.close();
    return;
  }
  if (event.key !== "Tab") return;
  const elements = focusableElements(dialog.element);
  const first = elements[0];
  const last = elements.at(-1);
  const active = document.activeElement;
  if (!first || !last) {
    event.preventDefault();
    dialog.element.focus({ preventScroll: true });
  } else if (
    !dialog.element.contains(active) ||
    active === dialog.element ||
    (event.shiftKey && active === first) ||
    (!event.shiftKey && active === last)
  ) {
    event.preventDefault();
    (event.shiftKey ? last : first).focus({ preventScroll: true });
  }
};

export const useDialogFocus = (isOpen: () => boolean, close: () => void) => {
  const dialog = ref<HTMLElement | null>(null);
  let activeDialog: ActiveDialog | null = null;
  let previousFocus: HTMLElement | null = null;
  let mounted = false;

  const deactivate = () => {
    if (!activeDialog) return;
    const wasTop = dialogs.at(-1) === activeDialog;
    dialogs.splice(dialogs.indexOf(activeDialog), 1);
    activeDialog = null;
    if (dialogs.length === 0) {
      document.removeEventListener("keydown", handleKeydown, true);
      document.removeEventListener("focusin", handleFocus, true);
      document.body.style.overflow = previousOverflow;
    }
    if (wasTop) {
      const parent = dialogs.at(-1);
      if (
        previousFocus?.isConnected &&
        (!parent || parent.element.contains(previousFocus))
      ) {
        previousFocus.focus({ preventScroll: true });
      } else if (parent) {
        focusDialog(parent);
      }
    }
    previousFocus = null;
  };

  const sync = async () => {
    if (!isOpen()) {
      deactivate();
      return;
    }
    await nextTick();
    if (!mounted || !isOpen() || !dialog.value || activeDialog) return;
    previousFocus =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;
    activeDialog = { element: dialog.value, close };
    if (dialogs.length === 0) {
      previousOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      document.addEventListener("keydown", handleKeydown, true);
      document.addEventListener("focusin", handleFocus, true);
    }
    dialogs.push(activeDialog);
    focusDialog(activeDialog);
  };

  watch(isOpen, sync, { flush: "post" });
  onMounted(() => {
    mounted = true;
    void sync();
  });
  onBeforeUnmount(() => {
    mounted = false;
    deactivate();
  });
  return dialog;
};
