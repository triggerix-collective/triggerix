import { validateRule } from '@triggerix/validator'
import { describe, expect, it } from 'vitest'

describe('validateRule', () => {
  describe('valid rules', () => {
    it('should accept a minimal valid rule', () => {
      const result = validateRule({
        id: 'r1',
        event: { type: 'click' },
        actions: [{ type: 'log' }]
      })
      expect(result.valid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    it('should accept a rule with optional name', () => {
      const result = validateRule({
        id: 'r1',
        name: 'My Rule',
        event: { type: 'click' },
        actions: [{ type: 'log' }]
      })
      expect(result.valid).toBe(true)
    })

    it('should accept a rule with conditions', () => {
      const result = validateRule({
        id: 'r1',
        event: { type: 'click' },
        conditions: {
          type: 'and',
          conditions: [{ left: 1, operator: 'eq', right: 1 }]
        },
        actions: [{ type: 'log' }]
      })
      expect(result.valid).toBe(true)
    })

    it('should accept multiple actions', () => {
      const result = validateRule({
        id: 'r1',
        event: { type: 'click' },
        actions: [{ type: 'log' }, { type: 'navigate' }]
      })
      expect(result.valid).toBe(true)
    })
  })

  describe('invalid rules', () => {
    it('should reject null', () => {
      const result = validateRule(null)
      expect(result.valid).toBe(false)
      expect(result.errors[0].path).toBe('rule')
      expect(result.errors[0].message).toBe('Rule must be an object')
    })

    it('should reject non-object', () => {
      const result = validateRule('not a rule')
      expect(result.valid).toBe(false)
      expect(result.errors[0].message).toBe('Rule must be an object')
    })

    it('should reject rule missing id', () => {
      const result = validateRule({
        event: { type: 'click' },
        actions: [{ type: 'log' }]
      })
      expect(result.valid).toBe(false)
      expect(result.errors.some(e => e.path === 'rule.id')).toBe(true)
    })

    it('should reject rule with non-string id', () => {
      const result = validateRule({
        id: 123,
        event: { type: 'click' },
        actions: [{ type: 'log' }]
      })
      expect(result.valid).toBe(false)
      expect(result.errors.some(e => e.path === 'rule.id')).toBe(true)
    })

    it('should reject rule with empty string id', () => {
      const result = validateRule({
        id: '',
        event: { type: 'click' },
        actions: [{ type: 'log' }]
      })
      expect(result.valid).toBe(false)
      expect(result.errors.some(e => e.path === 'rule.id')).toBe(true)
    })

    it('should reject rule with non-string name', () => {
      const result = validateRule({
        id: 'r1',
        name: 123,
        event: { type: 'click' },
        actions: [{ type: 'log' }]
      })
      expect(result.valid).toBe(false)
      expect(result.errors.some(e => e.path === 'rule.name')).toBe(true)
    })

    it('should accept undefined name', () => {
      const result = validateRule({
        id: 'r1',
        name: undefined,
        event: { type: 'click' },
        actions: [{ type: 'log' }]
      })
      expect(result.valid).toBe(true)
    })

    it('should reject rule missing event', () => {
      const result = validateRule({
        id: 'r1',
        actions: [{ type: 'log' }]
      })
      expect(result.valid).toBe(false)
      expect(result.errors.some(e => e.path === 'rule.event')).toBe(true)
    })

    it('should propagate errors from invalid event', () => {
      const result = validateRule({
        id: 'r1',
        event: { type: '' },
        actions: [{ type: 'log' }]
      })
      expect(result.valid).toBe(false)
      expect(result.errors.some(e => e.path === 'rule.event.type')).toBe(true)
    })

    it('should reject rule missing actions', () => {
      const result = validateRule({
        id: 'r1',
        event: { type: 'click' }
      })
      expect(result.valid).toBe(false)
      expect(result.errors.some(e => e.path === 'rule.actions')).toBe(true)
    })

    it('should reject rule with non-array actions', () => {
      const result = validateRule({
        id: 'r1',
        event: { type: 'click' },
        actions: 'not array'
      })
      expect(result.valid).toBe(false)
      const err = result.errors.find(e => e.path === 'rule.actions')
      expect(err?.message).toContain('actions array')
    })

    it('should reject rule with empty actions array', () => {
      const result = validateRule({
        id: 'r1',
        event: { type: 'click' },
        actions: []
      })
      expect(result.valid).toBe(false)
      const err = result.errors.find(e => e.path === 'rule.actions')
      expect(err?.message).toContain('at least one action')
    })

    it('should propagate errors from invalid action elements', () => {
      const result = validateRule({
        id: 'r1',
        event: { type: 'click' },
        actions: [{ type: '' }]
      })
      expect(result.valid).toBe(false)
      expect(result.errors.some(e => e.path.startsWith('rule.actions[0]'))).toBe(true)
    })

    it('should propagate errors from invalid conditions', () => {
      const result = validateRule({
        id: 'r1',
        event: { type: 'click' },
        conditions: { type: 'invalid', conditions: [] },
        actions: [{ type: 'log' }]
      })
      expect(result.valid).toBe(false)
      expect(result.errors.some(e => e.path === 'rule.conditions.type')).toBe(true)
    })
  })
})
