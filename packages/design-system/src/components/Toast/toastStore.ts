import type { ComponentType, ReactNode } from "react";
import type { IconOwnProps } from "@farmsapp/icons";

/**
 * Toast queue + timers. Deliberately no React runtime and no DOM: only
 * type-only imports above (erased at build), so this module can be reused by
 * a future React Native adapter. The React side reads it through
 * `subscribe`/`getSnapshot` (the `useSyncExternalStore` contract).
 */

export type ToastIntent = "neutral" | "info" | "success" | "warning" | "danger";

export type ToastDismissReason = "timeout" | "user" | "action" | "api";

export interface ToastAction {
  label: string;
  onPress: (ctx: { id: string }) => void;
  /** Defaults to true: pressing the action closes the toast. */
  closeOnPress?: boolean;
}

export interface ToastOptions {
  /** Reusing the id of a live toast replaces it in place (the only dedupe). */
  id?: string;
  /** Defaults to "neutral". */
  intent?: ToastIntent;
  title?: ReactNode;
  description: ReactNode;
  /** `null` = no icon. Omitted = the adapter picks one from `intent`. */
  icon?: ComponentType<IconOwnProps> | null;
  action?: ToastAction;
  /** ms. Defaults to 6000, or sticky when an `action` is present.
   * `Infinity` = sticky. */
  duration?: number;
  /** Defaults to true. */
  dismissible?: boolean;
  onDismiss?: (ctx: { id: string; reason: ToastDismissReason }) => void;
}

/** "queued" waits for a free slot, "open" is shown and (if finite) counting
 * down, "closing" is playing its exit animation. */
export type ToastState = "queued" | "open" | "closing";

export interface ToastEntry extends ToastOptions {
  id: string;
  state: ToastState;
}

export interface ToastSnapshot {
  readonly toasts: readonly ToastEntry[];
}

export const DEFAULT_TOAST_DURATION = 6000;
export const MAX_VISIBLE_TOASTS = 3;
/** Safety net if the adapter never calls `remove()` (no animationend, e.g.
 * reduced motion or an unmounted Toaster). Slightly above the slow motion
 * token (200ms). */
export const EXIT_FALLBACK_MS = 250;

interface Timing {
  /** Time left on the auto-dismiss countdown. */
  remaining: number;
  /** When the current countdown segment started; 0 = not running. */
  startedAt: number;
  timer: ReturnType<typeof setTimeout> | undefined;
  exitTimer: ReturnType<typeof setTimeout> | undefined;
}

function resolveDuration(options: ToastOptions): number {
  if (options.duration !== undefined) return options.duration;
  return options.action ? Infinity : DEFAULT_TOAST_DURATION;
}

export function createToastStore() {
  let entries: ToastEntry[] = [];
  let snapshot: ToastSnapshot = { toasts: entries };
  const timings = new Map<string, Timing>();
  const listeners = new Set<() => void>();
  let pauseCount = 0;
  let idCounter = 0;

  function emit() {
    // A new object per change: useSyncExternalStore compares by reference.
    snapshot = { toasts: entries };
    listeners.forEach((listener) => listener());
  }

  function timingOf(id: string): Timing {
    let timing = timings.get(id);
    if (!timing) {
      timing = { remaining: 0, startedAt: 0, timer: undefined, exitTimer: undefined };
      timings.set(id, timing);
    }
    return timing;
  }

  function stopCountdown(timing: Timing) {
    if (timing.timer !== undefined) clearTimeout(timing.timer);
    timing.timer = undefined;
    timing.startedAt = 0;
  }

  function startCountdown(entry: ToastEntry) {
    const timing = timingOf(entry.id);
    stopCountdown(timing);
    if (entry.state !== "open" || pauseCount > 0 || !Number.isFinite(timing.remaining)) return;
    timing.startedAt = Date.now();
    timing.timer = setTimeout(() => close(entry.id, "timeout"), timing.remaining);
  }

  /** Bank the elapsed time so a later resume continues, not restarts. */
  function freezeCountdown(timing: Timing) {
    if (timing.startedAt > 0) {
      timing.remaining = Math.max(0, timing.remaining - (Date.now() - timing.startedAt));
    }
    stopCountdown(timing);
  }

  function forget(id: string) {
    const timing = timings.get(id);
    if (timing) {
      stopCountdown(timing);
      if (timing.exitTimer !== undefined) clearTimeout(timing.exitTimer);
    }
    timings.delete(id);
  }

  function open(entry: ToastEntry): ToastEntry {
    const opened: ToastEntry = { ...entry, state: "open" };
    timingOf(opened.id).remaining = resolveDuration(opened);
    return opened;
  }

  /** Move queued toasts into free slots. Closing toasts still hold a slot
   * until removed, so the on-screen count never exceeds the cap. */
  function promoteQueued() {
    let used = entries.filter((e) => e.state !== "queued").length;
    let changed = false;
    entries = entries.map((entry) => {
      if (entry.state === "queued" && used < MAX_VISIBLE_TOASTS) {
        used += 1;
        changed = true;
        const opened = open(entry);
        return opened;
      }
      return entry;
    });
    if (changed) {
      entries.forEach((entry) => {
        if (entry.state === "open" && timingOf(entry.id).startedAt === 0) startCountdown(entry);
      });
    }
  }

  function show(options: ToastOptions): string {
    const id = options.id ?? `toast-${++idCounter}`;
    const existing = entries.find((e) => e.id === id);

    if (existing) {
      // Replace in place. A toast that was mid-exit is revived.
      const timing = timingOf(id);
      if (timing.exitTimer !== undefined) clearTimeout(timing.exitTimer);
      timing.exitTimer = undefined;
      const state: ToastState = existing.state === "queued" ? "queued" : "open";
      let next: ToastEntry = { ...options, id, state };
      if (state === "open") next = open(next);
      entries = entries.map((e) => (e.id === id ? next : e));
      if (state === "open") startCountdown(next);
      emit();
      return id;
    }

    entries = [...entries, { ...options, id, state: "queued" }];
    promoteQueued();
    emit();
    return id;
  }

  /** Merge fields into a live toast. Returns false if there is no such
   * toast (or it is already closing). Restarts the countdown. */
  function update(id: string, partial: Partial<Omit<ToastOptions, "id">>): boolean {
    const existing = entries.find((e) => e.id === id);
    if (!existing || existing.state === "closing") return false;
    let next: ToastEntry = { ...existing, ...partial };
    if (next.state === "open") next = open(next);
    entries = entries.map((e) => (e.id === id ? next : e));
    if (next.state === "open") startCountdown(next);
    emit();
    return true;
  }

  /** Called by the adapter on animationend, or by the fallback timer. */
  function remove(id: string) {
    if (!entries.some((e) => e.id === id)) return;
    forget(id);
    entries = entries.filter((e) => e.id !== id);
    promoteQueued();
    emit();
  }

  function close(id: string, reason: ToastDismissReason) {
    const entry = entries.find((e) => e.id === id);
    if (!entry || entry.state === "closing") return;

    if (entry.state === "queued") {
      // Never shown, so there is nothing to animate out.
      forget(id);
      entries = entries.filter((e) => e.id !== id);
      entry.onDismiss?.({ id, reason });
      emit();
      return;
    }

    const timing = timingOf(id);
    stopCountdown(timing);
    timing.exitTimer = setTimeout(() => remove(id), EXIT_FALLBACK_MS);
    entries = entries.map((e) => (e.id === id ? { ...e, state: "closing" as const } : e));
    entry.onDismiss?.({ id, reason });
    emit();
  }

  /** No id = dismiss everything. `reason` is for the adapter ("user",
   * "action"); callers of the public API get the default "api". */
  function dismiss(id?: string, reason: ToastDismissReason = "api") {
    if (id !== undefined) {
      close(id, reason);
      return;
    }
    entries.map((e) => e.id).forEach((toastId) => close(toastId, reason));
  }

  /** Remove everything immediately, no exit animation. Still fires
   * `onDismiss("api")` for toasts that had not started closing. */
  function clear() {
    const pending = entries.filter((e) => e.state !== "closing");
    Array.from(timings.keys()).forEach(forget);
    entries = [];
    pending.forEach((e) => e.onDismiss?.({ id: e.id, reason: "api" }));
    emit();
  }

  /**
   * Pause every countdown (hover, focus-within, hidden tab...). Each caller
   * gets its own idempotent release function, so independent sources can
   * overlap without one un-pausing another: countdowns resume only when
   * the last release runs.
   */
  function pause(): () => void {
    pauseCount += 1;
    if (pauseCount === 1) {
      entries.forEach((e) => {
        if (e.state === "open") freezeCountdown(timingOf(e.id));
      });
    }
    let released = false;
    return () => {
      if (released) return;
      released = true;
      pauseCount = Math.max(0, pauseCount - 1);
      if (pauseCount === 0) {
        entries.forEach((e) => {
          if (e.state === "open") startCountdown(e);
        });
      }
    };
  }

  function subscribe(listener: () => void): () => void {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  }

  function getSnapshot(): ToastSnapshot {
    return snapshot;
  }

  return { show, update, dismiss, clear, remove, pause, subscribe, getSnapshot };
}

export type ToastStore = ReturnType<typeof createToastStore>;

/** The app-wide store behind `toast.show()`. A module singleton so toasts
 * can be fired from outside React (API clients, interceptors). */
export const toastStore = createToastStore();
