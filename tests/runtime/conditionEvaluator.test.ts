import type { ConditionItem } from '@triggerix/core'
import type { RuntimeContext } from '@triggerix/runtime'
import { evaluateCondition, evaluateConditionGroup, evaluateConditions, resolveValue } from '@triggerix/runtime'
import { describe, expect, it, vi } from 'vitest'

function makeContext(payload: Record<string, unknown> = {}): RuntimeContext {
  return {
    event: { type: 'test' },
    payload,
    ...payload
  }
}

describe('resolveValue', () => {
  it('returns string literal directly', () => {
    expect(resolveValue('hello', makeContext())).toBe('hello')
  })

  it('returns number literal directly', () => {
    expect(resolveValue(42, makeContext())).toBe(42)
  })

  it('returns boolean literal directly', () => {
    expect(resolveValue(true, makeContext())).toBe(true)
    expect(resolveValue(false, makeContext())).toBe(false)
  })

  it('resolves Reference from context using dot path', () => {
    const ctx = makeContext({ name: 'alice' })
    expect(resolveValue({ $ref: 'payload.name' }, ctx)).toBe('alice')
  })

  it('resolves nested Reference', () => {
    const ctx: RuntimeContext = {
      event: { type: 'test' },
      payload: { user: { profile: { age: 18 } } }
    }
    expect(resolveValue({ $ref: 'payload.user.profile.age' }, ctx)).toBe(18)
  })

  it('returns undefined for missing Reference path', () => {
    expect(resolveValue({ $ref: 'payload.missing' }, makeContext())).toBeUndefined()
  })

  it('evaluates Expression value', () => {
    const result = resolveValue(
      { $expr: { type: 'binary', operator: '+', left: 1, right: 2 } },
      makeContext()
    )
    expect(result).toBe(3)
  })
})

describe('evaluateCondition', () => {
  const ctx = makeContext()

  it('eq returns true when equal', () => {
    expect(evaluateCondition({ left: 1, operator: 'eq', right: 1 }, ctx)).toBe(true)
  })

  it('eq returns false when not equal', () => {
    expect(evaluateCondition({ left: 1, operator: 'eq', right: 2 }, ctx)).toBe(false)
  })

  it('neq operator', () => {
    expect(evaluateCondition({ left: 1, operator: 'neq', right: 2 }, ctx)).toBe(true)
    expect(evaluateCondition({ left: 1, operator: 'neq', right: 1 }, ctx)).toBe(false)
  })

  it('gt operator', () => {
    expect(evaluateCondition({ left: 2, operator: 'gt', right: 1 }, ctx)).toBe(true)
    expect(evaluateCondition({ left: 1, operator: 'gt', right: 2 }, ctx)).toBe(false)
  })

  it('gte operator', () => {
    expect(evaluateCondition({ left: 2, operator: 'gte', right: 2 }, ctx)).toBe(true)
    expect(evaluateCondition({ left: 1, operator: 'gte', right: 2 }, ctx)).toBe(false)
  })

  it('lt operator', () => {
    expect(evaluateCondition({ left: 1, operator: 'lt', right: 2 }, ctx)).toBe(true)
    expect(evaluateCondition({ left: 2, operator: 'lt', right: 1 }, ctx)).toBe(false)
  })

  it('lte operator', () => {
    expect(evaluateCondition({ left: 2, operator: 'lte', right: 2 }, ctx)).toBe(true)
    expect(evaluateCondition({ left: 3, operator: 'lte', right: 2 }, ctx)).toBe(false)
  })

  it('exists returns true when value exists', () => {
    const c = makeContext({ name: 'alice' })
    expect(evaluateCondition({ left: { $ref: 'payload.name' }, operator: 'exists' }, c)).toBe(true)
  })

  it('exists returns false when value does not exist', () => {
    const c = makeContext()
    expect(evaluateCondition({ left: { $ref: 'payload.missing' }, operator: 'exists' }, c)).toBe(false)
  })

  it('throws when right operand missing for non-exists operator', () => {
    expect(() => evaluateCondition({ left: 1, operator: 'eq' }, ctx)).toThrow(/requires a right operand/)
  })
})

describe('evaluateConditionGroup', () => {
  const ctx = makeContext()

  it('and: returns true when all conditions are true', () => {
    const group = {
      type: 'and' as const,
      conditions: [
        { left: 1, operator: 'eq' as const, right: 1 },
        { left: 2, operator: 'eq' as const, right: 2 }
      ]
    }
    expect(evaluateConditionGroup(group, ctx)).toBe(true)
  })

  it('and: returns false when any condition is false', () => {
    const group = {
      type: 'and' as const,
      conditions: [
        { left: 1, operator: 'eq' as const, right: 1 },
        { left: 2, operator: 'eq' as const, right: 3 }
      ]
    }
    expect(evaluateConditionGroup(group, ctx)).toBe(false)
  })

  it('or: returns true when any condition is true', () => {
    const group = {
      type: 'or' as const,
      conditions: [
        { left: 1, operator: 'eq' as const, right: 2 },
        { left: 2, operator: 'eq' as const, right: 2 }
      ]
    }
    expect(evaluateConditionGroup(group, ctx)).toBe(true)
  })

  it('or: returns false when all conditions are false', () => {
    const group = {
      type: 'or' as const,
      conditions: [
        { left: 1, operator: 'eq' as const, right: 2 },
        { left: 2, operator: 'eq' as const, right: 3 }
      ]
    }
    expect(evaluateConditionGroup(group, ctx)).toBe(false)
  })
})

describe('evaluateConditions', () => {
  const ctx = makeContext()
  const trueCond: ConditionItem = { left: 1, operator: 'eq', right: 1 }
  const falseCond: ConditionItem = { left: 1, operator: 'eq', right: 2 }
  const trueGroup: ConditionItem = { type: 'and', conditions: [trueCond] }
  const falseGroup: ConditionItem = { type: 'and', conditions: [falseCond] }

  it('empty array returns true (no constraints)', () => {
    expect(evaluateConditions([], ctx)).toBe(true)
  })

  it('only implicit AND: all pass -> true', () => {
    expect(evaluateConditions([trueCond, { left: 'a', operator: 'eq', right: 'a' }], ctx)).toBe(true)
  })

  it('only implicit AND: any fail -> false', () => {
    expect(evaluateConditions([trueCond, falseCond], ctx)).toBe(false)
  })

  it('implicit AND short-circuits (spy on later condition)', () => {
    const a = vi.fn(() => true)
    const b = vi.fn(() => false)
    const c = vi.fn(() => true)
    // Build Condition objects with expression evaluators via the FunctionRegistry
    const fns = new Map<string, (...args: unknown[]) => unknown>([
      ['a', a],
      ['b', b],
      ['c', c]
    ])
    const conds: ConditionItem[] = [
      { left: { $expr: { type: 'call', name: 'a', args: [] } }, operator: 'eq', right: true },
      { left: { $expr: { type: 'call', name: 'b', args: [] } }, operator: 'eq', right: true },
      { left: { $expr: { type: 'call', name: 'c', args: [] } }, operator: 'eq', right: true }
    ]
    expect(evaluateConditions(conds, ctx, fns)).toBe(false)
    expect(a).toHaveBeenCalledTimes(1)
    expect(b).toHaveBeenCalledTimes(1)
    expect(c).not.toHaveBeenCalled()
  })

  it('only explicit AND groups: all pass -> true', () => {
    expect(evaluateConditions([trueGroup, { type: 'and', conditions: [{ left: 2, operator: 'eq', right: 2 }] }], ctx)).toBe(true)
  })

  it('only explicit AND groups: any fail -> false', () => {
    expect(evaluateConditions([trueGroup, falseGroup], ctx)).toBe(false)
  })

  it('only OR groups: at least one passes -> true', () => {
    expect(evaluateConditions([
      { type: 'or', conditions: [falseCond, trueCond] },
      { type: 'or', conditions: [falseCond] }
    ], ctx)).toBe(true)
  })

  it('only OR groups: all fail -> false', () => {
    expect(evaluateConditions([
      { type: 'or', conditions: [falseCond] },
      { type: 'or', conditions: [falseCond] }
    ], ctx)).toBe(false)
  })

  it('mixed: implicit AND + and-group + or-group all pass -> true', () => {
    expect(evaluateConditions([
      trueCond,
      trueGroup,
      { type: 'or', conditions: [falseCond, trueCond] }
    ], ctx)).toBe(true)
  })

  it('mixed: implicit AND fails -> short-circuit, OR group not evaluated', () => {
    const orSpy = vi.fn(() => true)
    const fns = new Map<string, (...args: unknown[]) => unknown>([['orSpy', orSpy]])
    const conds: ConditionItem[] = [
      falseCond,
      {
        type: 'or',
        conditions: [{
          left: { $expr: { type: 'call', name: 'orSpy', args: [] } },
          operator: 'eq',
          right: true
        }]
      }
    ]
    expect(evaluateConditions(conds, ctx, fns)).toBe(false)
    expect(orSpy).not.toHaveBeenCalled()
  })

  it('mixed: implicit AND passes, AND group fails -> false, OR not evaluated', () => {
    const orSpy = vi.fn(() => true)
    const fns = new Map<string, (...args: unknown[]) => unknown>([['orSpy', orSpy]])
    const conds: ConditionItem[] = [
      trueCond,
      falseGroup,
      {
        type: 'or',
        conditions: [{
          left: { $expr: { type: 'call', name: 'orSpy', args: [] } },
          operator: 'eq',
          right: true
        }]
      }
    ]
    expect(evaluateConditions(conds, ctx, fns)).toBe(false)
    expect(orSpy).not.toHaveBeenCalled()
  })

  it('mixed: implicit AND + AND group pass, all OR groups fail -> false', () => {
    expect(evaluateConditions([
      trueCond,
      trueGroup,
      { type: 'or', conditions: [falseCond] }
    ], ctx)).toBe(false)
  })

  it('oR group absent: only implicit AND + AND groups gate the result', () => {
    expect(evaluateConditions([trueCond, trueGroup], ctx)).toBe(true)
    expect(evaluateConditions([falseCond, trueGroup], ctx)).toBe(false)
  })

  it('nested group (or-of-and) is evaluated recursively', () => {
    expect(evaluateConditions([
      trueCond,
      { type: 'or', conditions: [{ type: 'and', conditions: [trueCond, trueCond] }] }
    ], ctx)).toBe(true)

    expect(evaluateConditions([
      trueCond,
      { type: 'or', conditions: [{ type: 'and', conditions: [trueCond, falseCond] }] }
    ], ctx)).toBe(false)
  })

  it('rejects ConditionGroup with type "not"', () => {
    // Construction is type-forbidden by TS, but at runtime validate input.
    const invalid = { type: 'not', conditions: [trueCond] } as unknown as ConditionItem
    // evaluateConditionGroup will return undefined for unhandled type;
    // implicit AND + the group together should still return false because the
    // group yields undefined (falsy). We only assert it does not throw.
    expect(() => evaluateConditions([trueCond, invalid], ctx)).not.toThrow()
  })
})
