/**
 * Focus trap utility for accessible modals (U7).
 *
 * Keeps keyboard focus inside a modal while it is open and restores focus to
 * the previously-focused element when the trap is released. Also supports
 * closing on Escape (recommended for dialog a11y).
 *
 * Usage:
 *   const release = trapFocus(modalElement, { onEscape: () => modal.hide() });
 *   // when hiding the modal:
 *   release();
 */

const FOCUSABLE_SELECTOR = [
  'a[href]',
  'button:not([disabled])',
  'textarea:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(', ');

/**
 * Trap keyboard focus inside the given container.
 * @param {HTMLElement} container - The modal/overlay element to trap focus in.
 * @param {Object} [options] - Options.
 * @param {Function} [options.onEscape] - Called when Escape is pressed.
 * @returns {Function} release() — removes the trap and restores prior focus.
 */
export function trapFocus(container, options = {}) {
  const previouslyFocused =
    document.activeElement instanceof HTMLElement ? document.activeElement : null;

  const getFocusableElements = () =>
    Array.from(container.querySelectorAll(FOCUSABLE_SELECTOR)).filter(
      (el) => el.offsetParent !== null || el === document.activeElement,
    );

  const onKeyDown = (event) => {
    if (event.key === "Escape" && typeof options.onEscape === "function") {
      event.preventDefault();
      options.onEscape();
      return;
    }

    if (event.key !== "Tab") return;

    const focusable = getFocusableElements();
    if (focusable.length === 0) {
      event.preventDefault();
      return;
    }

    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    const active = document.activeElement;
    const focusEscaped = !container.contains(active);

    if (event.shiftKey && (active === first || focusEscaped)) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && (active === last || focusEscaped)) {
      event.preventDefault();
      first.focus();
    }
  };

  document.addEventListener("keydown", onKeyDown, true);

  return function releaseFocus() {
    document.removeEventListener("keydown", onKeyDown, true);
    if (previouslyFocused && document.contains(previouslyFocused)) {
      previouslyFocused.focus();
    }
  };
}
