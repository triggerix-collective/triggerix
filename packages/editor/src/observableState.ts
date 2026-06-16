/**
 * 提供可观测状态管理的基类
 * 各 preset 继承此类来管理自己的状态，无需重复实现订阅/通知机制
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
