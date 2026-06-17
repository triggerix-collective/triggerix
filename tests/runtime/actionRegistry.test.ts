import { ActionRegistry } from '@triggerix/runtime'
import { describe, expect, it, vi } from 'vitest'

describe('actionRegistry', () => {
  it('register + has: returns true after registering', () => {
    const registry = new ActionRegistry()
    expect(registry.has('log')).toBe(false)

    registry.register({ type: 'log', handler: vi.fn() })
    expect(registry.has('log')).toBe(true)
  })

  it('execute: invokes the registered handler with params', async () => {
    const handler = vi.fn()
    const registry = new ActionRegistry()
    registry.register({ type: 'log', handler })

    await registry.execute('log', { msg: 'hello' })

    expect(handler).toHaveBeenCalledTimes(1)
    expect(handler).toHaveBeenCalledWith({ msg: 'hello' })
  })

  it('execute: throws when action type is not registered', async () => {
    const registry = new ActionRegistry()
    await expect(registry.execute('missing')).rejects.toThrow(
      'Action not registered: missing'
    )
  })

  it('list: returns all registered action types', () => {
    const registry = new ActionRegistry()
    registry.register({ type: 'a', handler: vi.fn() })
    registry.register({ type: 'b', handler: vi.fn() })
    registry.register({ type: 'c', handler: vi.fn() })

    const list = registry.list()
    expect(list).toHaveLength(3)
    expect(list).toEqual(expect.arrayContaining(['a', 'b', 'c']))
  })

  it('list: returns empty array when nothing registered', () => {
    const registry = new ActionRegistry()
    expect(registry.list()).toEqual([])
  })
})
