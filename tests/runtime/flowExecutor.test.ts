import type { FunctionRegistry, RuntimeContext } from '@triggerix/runtime'
import { ActionRegistry, executeActionNode } from '@triggerix/runtime'
import { describe, expect, it, vi } from 'vitest'

function makeContext(extra: Record<string, unknown> = {}): RuntimeContext {
  return {
    event: { type: 'test' },
    payload: {},
    ...extra
  }
}

const emptyFns: FunctionRegistry = new Map()

describe('executeActionNode - regular Action', () => {
  it('invokes the registered handler with params', async () => {
    const handler = vi.fn()
    const registry = new ActionRegistry()
    registry.register({ type: 'log', handler })

    await executeActionNode(
      { type: 'log', params: { msg: 'hello' } },
      makeContext(),
      registry,
      emptyFns
    )

    expect(handler).toHaveBeenCalledTimes(1)
    expect(handler).toHaveBeenCalledWith({ msg: 'hello' })
  })
})

describe('executeActionNode - sequence', () => {
  it('executes actions in order', async () => {
    const calls: string[] = []
    const a = vi.fn(() => {
      calls.push('a')
    })
    const b = vi.fn(() => {
      calls.push('b')
    })
    const c = vi.fn(() => {
      calls.push('c')
    })

    const registry = new ActionRegistry()
    registry.register({ type: 'a', handler: a })
    registry.register({ type: 'b', handler: b })
    registry.register({ type: 'c', handler: c })

    await executeActionNode(
      {
        type: 'sequence',
        actions: [
          { type: 'a' },
          { type: 'b' },
          { type: 'c' }
        ]
      },
      makeContext(),
      registry,
      emptyFns
    )

    expect(calls).toEqual(['a', 'b', 'c'])
    expect(a).toHaveBeenCalledTimes(1)
    expect(b).toHaveBeenCalledTimes(1)
    expect(c).toHaveBeenCalledTimes(1)
  })
})

describe('executeActionNode - parallel', () => {
  it('executes all actions', async () => {
    const a = vi.fn()
    const b = vi.fn()
    const c = vi.fn()

    const registry = new ActionRegistry()
    registry.register({ type: 'a', handler: a })
    registry.register({ type: 'b', handler: b })
    registry.register({ type: 'c', handler: c })

    await executeActionNode(
      {
        type: 'parallel',
        actions: [
          { type: 'a' },
          { type: 'b' },
          { type: 'c' }
        ]
      },
      makeContext(),
      registry,
      emptyFns
    )

    expect(a).toHaveBeenCalledTimes(1)
    expect(b).toHaveBeenCalledTimes(1)
    expect(c).toHaveBeenCalledTimes(1)
  })
})

describe('executeActionNode - tryCatch', () => {
  it('does not run catch when try succeeds', async () => {
    const tryFn = vi.fn()
    const catchFn = vi.fn()
    const finallyFn = vi.fn()

    const registry = new ActionRegistry()
    registry.register({ type: 'try', handler: tryFn })
    registry.register({ type: 'catch', handler: catchFn })
    registry.register({ type: 'finally', handler: finallyFn })

    await executeActionNode(
      {
        type: 'tryCatch',
        try: [{ type: 'try' }],
        catch: [{ type: 'catch' }],
        finally: [{ type: 'finally' }]
      },
      makeContext(),
      registry,
      emptyFns
    )

    expect(tryFn).toHaveBeenCalledTimes(1)
    expect(catchFn).not.toHaveBeenCalled()
    expect(finallyFn).toHaveBeenCalledTimes(1)
  })

  it('runs catch when try throws', async () => {
    const tryFn = vi.fn(() => {
      throw new Error('boom')
    })
    const catchFn = vi.fn()
    const finallyFn = vi.fn()

    const registry = new ActionRegistry()
    registry.register({ type: 'try', handler: tryFn })
    registry.register({ type: 'catch', handler: catchFn })
    registry.register({ type: 'finally', handler: finallyFn })

    await executeActionNode(
      {
        type: 'tryCatch',
        try: [{ type: 'try' }],
        catch: [{ type: 'catch' }],
        finally: [{ type: 'finally' }]
      },
      makeContext(),
      registry,
      emptyFns
    )

    expect(tryFn).toHaveBeenCalledTimes(1)
    expect(catchFn).toHaveBeenCalledTimes(1)
    expect(finallyFn).toHaveBeenCalledTimes(1)
  })

  it('always runs finally', async () => {
    const finallyFn = vi.fn()
    const registry = new ActionRegistry()
    registry.register({
      type: 'try',
      handler: () => {
        throw new Error('boom')
      }
    })
    registry.register({ type: 'finally', handler: finallyFn })

    await executeActionNode(
      {
        type: 'tryCatch',
        try: [{ type: 'try' }],
        finally: [{ type: 'finally' }]
      },
      makeContext(),
      registry,
      emptyFns
    )

    expect(finallyFn).toHaveBeenCalledTimes(1)
  })
})

describe('executeActionNode - if', () => {
  it('runs then branch when condition is true', async () => {
    const thenFn = vi.fn()
    const elseFn = vi.fn()

    const registry = new ActionRegistry()
    registry.register({ type: 'then', handler: thenFn })
    registry.register({ type: 'else', handler: elseFn })

    await executeActionNode(
      {
        type: 'if',
        condition: [{ left: 1, operator: 'eq', right: 1 }],
        then: [{ type: 'then' }],
        else: [{ type: 'else' }]
      },
      makeContext(),
      registry,
      emptyFns
    )

    expect(thenFn).toHaveBeenCalledTimes(1)
    expect(elseFn).not.toHaveBeenCalled()
  })

  it('runs else branch when condition is false', async () => {
    const thenFn = vi.fn()
    const elseFn = vi.fn()

    const registry = new ActionRegistry()
    registry.register({ type: 'then', handler: thenFn })
    registry.register({ type: 'else', handler: elseFn })

    await executeActionNode(
      {
        type: 'if',
        condition: [{ left: 1, operator: 'eq', right: 2 }],
        then: [{ type: 'then' }],
        else: [{ type: 'else' }]
      },
      makeContext(),
      registry,
      emptyFns
    )

    expect(thenFn).not.toHaveBeenCalled()
    expect(elseFn).toHaveBeenCalledTimes(1)
  })

  it('does nothing when condition is false and no else branch', async () => {
    const thenFn = vi.fn()

    const registry = new ActionRegistry()
    registry.register({ type: 'then', handler: thenFn })

    await executeActionNode(
      {
        type: 'if',
        condition: [{ left: 1, operator: 'eq', right: 2 }],
        then: [{ type: 'then' }]
      },
      makeContext(),
      registry,
      emptyFns
    )

    expect(thenFn).not.toHaveBeenCalled()
  })

  it('supports nested ConditionGroup inside condition array', async () => {
    const thenFn = vi.fn()
    const registry = new ActionRegistry()
    registry.register({ type: 'then', handler: thenFn })

    await executeActionNode(
      {
        type: 'if',
        condition: [
          {
            type: 'and',
            conditions: [
              { left: 1, operator: 'eq', right: 1 },
              { left: 'a', operator: 'eq', right: 'a' }
            ]
          }
        ],
        then: [{ type: 'then' }]
      },
      makeContext(),
      registry,
      emptyFns
    )

    expect(thenFn).toHaveBeenCalledTimes(1)
  })

  it('empty condition array passes (no constraints)', async () => {
    const thenFn = vi.fn()
    const registry = new ActionRegistry()
    registry.register({ type: 'then', handler: thenFn })

    await executeActionNode(
      {
        type: 'if',
        condition: [],
        then: [{ type: 'then' }]
      },
      makeContext(),
      registry,
      emptyFns
    )

    expect(thenFn).toHaveBeenCalledTimes(1)
  })
})
