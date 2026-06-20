import {
  BINARY_OPERATORS,
  COMPARE_OPERATORS,
  CONDITION_GROUP_TYPES,
  isConditionGroup,
  LOGICAL_OPERATORS,
  UNARY_OPERATORS,
  VALID_OPERATORS
} from '@triggerix/core'
import { describe, expect, it } from 'vitest'

describe('isConditionGroup', () => {
  it('returns true for a group with type "and"', () => {
    expect(isConditionGroup({ type: 'and', conditions: [] })).toBe(true)
  })

  it('returns true for a group with type "or"', () => {
    expect(isConditionGroup({ type: 'or', conditions: [] })).toBe(true)
  })

  it('returns true for an object with type "not" (type validity is checked elsewhere)', () => {
    // `isConditionGroup` is a structural guard: it only requires a string `type`
    // field. Whether the operator value is supported is the validator's job.
    expect(isConditionGroup({ type: 'not', conditions: [] })).toBe(true)
  })

  it('returns false for null', () => {
    expect(isConditionGroup(null)).toBe(false)
  })

  it('returns false for undefined', () => {
    expect(isConditionGroup(undefined)).toBe(false)
  })

  it('returns false for a number', () => {
    expect(isConditionGroup(42)).toBe(false)
  })

  it('returns false for a string', () => {
    expect(isConditionGroup('string')).toBe(false)
  })

  it('returns false for a plain Condition object', () => {
    expect(isConditionGroup({ operator: 'eq', left: 1, right: 2 })).toBe(false)
  })

  it('returns true for an object with an arbitrary string type (validator rejects unknown values)', () => {
    expect(isConditionGroup({ type: 'unknown', conditions: [] })).toBe(true)
  })
})

describe('operator constants', () => {
  it('vALID_OPERATORS contains all comparison and existence operators', () => {
    expect(VALID_OPERATORS).toContain('eq')
    expect(VALID_OPERATORS).toContain('neq')
    expect(VALID_OPERATORS).toContain('gt')
    expect(VALID_OPERATORS).toContain('gte')
    expect(VALID_OPERATORS).toContain('lt')
    expect(VALID_OPERATORS).toContain('lte')
    expect(VALID_OPERATORS).toContain('exists')
  })

  it('bINARY_OPERATORS contains arithmetic operators', () => {
    expect(BINARY_OPERATORS).toContain('+')
    expect(BINARY_OPERATORS).toContain('-')
    expect(BINARY_OPERATORS).toContain('*')
    expect(BINARY_OPERATORS).toContain('/')
    expect(BINARY_OPERATORS).toContain('%')
  })

  it('uNARY_OPERATORS contains "-" and "!"', () => {
    expect(UNARY_OPERATORS).toContain('-')
    expect(UNARY_OPERATORS).toContain('!')
  })

  it('cOMPARE_OPERATORS does not contain "exists"', () => {
    expect(COMPARE_OPERATORS).not.toContain('exists')
  })

  it('lOGICAL_OPERATORS contains "not" (expression system keeps it)', () => {
    expect(LOGICAL_OPERATORS).toContain('not')
  })

  it('cONDITION_GROUP_TYPES does NOT contain "not"', () => {
    expect(CONDITION_GROUP_TYPES).not.toContain('not')
    expect(CONDITION_GROUP_TYPES).toContain('and')
    expect(CONDITION_GROUP_TYPES).toContain('or')
  })
})
