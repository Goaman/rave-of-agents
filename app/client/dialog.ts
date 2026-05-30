// A small modal-dialog layer for the console, replacing the browser's native
// `confirm()`/`alert()` (which are blocking, unstyled, and can't match the app
// chrome). Two public entry points:
//
//   confirmDialog(opts) -> Promise<boolean>   — a yes/no prompt; resolves true
//                                               when confirmed, false otherwise.
//   showError(opts)      -> Promise<void>      — a single-button error dialog.
//
// Plus installGlobalErrorHandlers(), which routes otherwise-unhandled runtime
// errors and promise rejections into showError() so nothing fails silently.
//
// Dialogs are queued (a signal-backed list) and rendered by <DialogHost/>, which
// is mounted once at the app root. Authored with solid-js/html like the rest of
// the client.

import html from "solid-js/html";
import { createSignal } from "solid-js";

type DialogKind = "confirm" | "error";

interface DialogState {
  id: number;
  kind: DialogKind;
  title: string;
  message: string;
  detail?: string; // optional secondary text (e.g. an error stack)
  confirmLabel: string;
  cancelLabel?: string; // undefined → single-button dialog (errors)
  danger: boolean;
  resolve: (ok: boolean) => void;
}

const [dialogs, setDialogs] = createSignal<DialogState[]>([]);
let seq = 0;

function push(d: Omit<DialogState, "id">): void {
  setDialogs((list) => [...list, { ...d, id: ++seq }]);
}

// Resolve a dialog's promise and remove it from the queue.
function close(id: number, ok: boolean): void {
  const d = dialogs().find((x) => x.id === id);
  setDialogs((list) => list.filter((x) => x.id !== id));
  d?.resolve(ok);
}

// A themed replacement for window.confirm(). Resolves true on confirm.
export function confirmDialog(opts: {
  title?: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  danger?: boolean;
}): Promise<boolean> {
  return new Promise((resolve) => {
    push({
      kind: "confirm",
      title: opts.title ?? "Please confirm",
      message: opts.message,
      confirmLabel: opts.confirmLabel ?? "Confirm",
      cancelLabel: opts.cancelLabel ?? "Cancel",
      danger: opts.danger ?? false,
      resolve,
    });
  });
}

// A themed replacement for window.alert(), aimed at surfacing errors.
export function showError(opts: {
  title?: string;
  message: string;
  detail?: string;
}): Promise<void> {
  return new Promise((resolve) => {
    // Collapse duplicate error dialogs so a repeating failure can't stack up
    // dozens of identical modals.
    const dup = dialogs().some(
      (d) => d.kind === "error" && d.message === opts.message && d.detail === opts.detail,
    );
    if (dup) {
      resolve();
      return;
    }
    push({
      kind: "error",
      title: opts.title ?? "Something went wrong",
      message: opts.message,
      detail: opts.detail,
      confirmLabel: "Dismiss",
      cancelLabel: undefined,
      danger: false,
      resolve: () => resolve(),
    });
  });
}

// Route uncaught errors + unhandled promise rejections into an error dialog,
// so a failure anywhere in the app becomes visible instead of only hitting the
// console. Call once at startup.
export function installGlobalErrorHandlers(): void {
  window.addEventListener("error", (e: ErrorEvent) => {
    const err = e.error;
    void showError({
      message: e.message || "An unexpected error occurred.",
      detail: err instanceof Error ? err.stack : undefined,
    });
  });
  window.addEventListener("unhandledrejection", (e: PromiseRejectionEvent) => {
    const r = e.reason;
    void showError({
      title: "Unhandled error",
      message: r instanceof Error ? r.message : String(r ?? "Unknown error"),
      detail: r instanceof Error ? r.stack : undefined,
    });
  });
}

// A single modal. Escape cancels (resolves false / dismiss); Enter confirms.
// Clicking the dimmed backdrop cancels too. The confirm button is auto-focused
// so the keyboard works without a click first.
function DialogModal(d: DialogState) {
  const onKey = (e: KeyboardEvent) => {
    if (e.key === "Escape") {
      e.preventDefault();
      close(d.id, false);
    } else if (e.key === "Enter") {
      e.preventDefault();
      close(d.id, true);
    }
  };
  return html`
    <div class="dialog-overlay"
      onKeyDown=${onKey}
      onClick=${(e: MouseEvent) => {
        if (e.target === e.currentTarget) close(d.id, false);
      }}>
      <div class="dialog ${d.kind}" role="dialog" aria-modal="true">
        <div class="dialog-title">${d.kind === "error" ? "⚠ " : ""}${d.title}</div>
        <div class="dialog-message">${d.message}</div>
        ${d.detail ? html`<pre class="dialog-detail">${d.detail}</pre>` : ""}
        <div class="dialog-actions">
          ${d.cancelLabel
            ? html`<button onClick=${() => close(d.id, false)}>${d.cancelLabel}</button>`
            : ""}
          <button class=${d.danger ? "dialog-confirm danger" : "dialog-confirm primary"}
            ref=${(el: HTMLButtonElement) => queueMicrotask(() => el.focus())}
            onClick=${() => close(d.id, true)}>${d.confirmLabel}</button>
        </div>
      </div>
    </div>
  `;
}

// Mounted once at the app root. `display: contents` (see styles.css) keeps this
// wrapper out of the layout; each queued dialog renders its own fixed overlay.
export function DialogHost() {
  return html`<div class="dialog-layer">
    ${() => dialogs().map((d) => DialogModal(d))}
  </div>`;
}
