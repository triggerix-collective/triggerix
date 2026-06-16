/**
 * Observable state base class with subscribe/notify mechanism.
 */
export class ObservableState<T> {
  private state: T
  private listeners = new Set<() => void>()

  constructor(initialState: T) {
    this.state = initialState
  }

  getState(): T {
    return this.state
  }

  protected setState(updater: (prev: T) => T): void {
    this.state = updater(this.state)
    this.notify()
  }

  onChange(listener: () => void): () => void {
    this.listeners.add(listener)
    return () => this.listeners.delete(listener)
  }

  protected notify(): void {
    this.listeners.forEach(fn => fn())
  }

  dispose(): void {
    this.listeners.clear()
  }
}
