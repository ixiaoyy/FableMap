/** Keeps keyboard Tab focus inside a currently open dialog; callers own initial and restored focus. */
export function trapDialogTab(event: KeyboardEvent, root: HTMLElement | null): void {
  if (event.key !== "Tab" || !root) return;
  const controls = Array.from(root.querySelectorAll<HTMLElement>(
    'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), [tabindex="0"]',
  )).filter((element) => element.offsetParent !== null);
  if (controls.length === 0) {
    event.preventDefault();
    root.focus();
    return;
  }
  const first = controls[0]!;
  const last = controls[controls.length - 1]!;
  if (event.shiftKey && (document.activeElement === first || document.activeElement === root)) {
    event.preventDefault();
    last.focus();
  } else if (!event.shiftKey && (document.activeElement === last || document.activeElement === root)) {
    event.preventDefault();
    first.focus();
  }
}
