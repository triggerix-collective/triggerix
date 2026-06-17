import { ObservableState } from '@triggerix/editor'
import { describe, expect, it, vi } from 'vitest'

class TestState extends ObservableState<number> {
  update(value: number) {
    this.setState(() => value)
  }
}

describe('observableState', () => {
  describe('constructor', () => {
    it('should initialize with the provided state', () => {
      const state = new TestState(42)
      expect(state.getState()).toBe(42)
    })
  })

  describe('getState', () => {
    it('should return the current state', () => {
      const state = new TestState(1)
      expect(state.getState()).toBe(1)
      state.update(2)
      expect(state.getState()).toBe(2)
    })
  })

  describe('setState (via subclass update)', () => {
    it('should update the state', () => {
      const state = new TestState(0)
      state.update(100)
      expect(state.getState()).toBe(100)
    })

    it('should notify listeners after update', () => {
      const state = new TestState(0)
      const listener = vi.fn()
      state.onChange(listener)
      state.update(5)
      expect(listener).toHaveBeenCalledTimes(1)
    })
  })

  describe('onChange', () => {
    it('should register a listener that gets notified on state change', () => {
      const state = new TestState(0)
      const listener = vi.fn()
      state.onChange(listener)
      state.update(1)
      expect(listener).toHaveBeenCalledTimes(1)
    })

    it('should return an unsubscribe function that stops notifications', () => {
      const state = new TestState(0)
      const listener = vi.fn()
      const unsubscribe = state.onChange(listener)
      state.update(1)
      expect(listener).toHaveBeenCalledTimes(1)

      unsubscribe()
      state.update(2)
      expect(listener).toHaveBeenCalledTimes(1)
    })

    it('should notify multiple listeners', () => {
      const state = new TestState(0)
      const listener1 = vi.fn()
      const listener2 = vi.fn()
      const listener3 = vi.fn()
      state.onChange(listener1)
      state.onChange(listener2)
      state.onChange(listener3)

      state.update(10)
      expect(listener1).toHaveBeenCalledTimes(1)
      expect(listener2).toHaveBeenCalledTimes(1)
      expect(listener3).toHaveBeenCalledTimes(1)
    })
  })

  describe('dispose', () => {
    it('should clear all listeners and prevent further notifications', () => {
      const state = new TestState(0)
      const listener1 = vi.fn()
      const listener2 = vi.fn()
      state.onChange(listener1)
      state.onChange(listener2)

      state.dispose()
      state.update(99)

      expect(listener1).not.toHaveBeenCalled()
      expect(listener2).not.toHaveBeenCalled()
    })
  })
})
