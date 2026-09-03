const actionListeners = new Set<() => void>();

/** Sends the touch/keyboard-equivalent use intent to the active scene without owning gameplay rules. */
export function requestWorldAction(): void {
  for (const listener of actionListeners) listener();
}

/** Registers one active scene action listener and returns its teardown callback. */
export function subscribeWorldAction(listener: () => void): () => void {
  actionListeners.add(listener);
  return () => actionListeners.delete(listener);
}
