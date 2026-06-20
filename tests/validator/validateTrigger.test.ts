import { validateTrigger } from '@triggerix/validator'
import { describe, expect, it } from 'vitest'

describe('validateTrigger', () => {
  describe('valid triggers', () => {
    it('should accept a minimal valid trigger', () => {
      const result = validateTrigger({
        id: 't1',
        events: [{ type: 'click' }],
        actions: [{ type: 'log' }]
      })
      expect(result.valid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    it('should accept a trigger with optional name', () => {
      const result = validateTrigger({
        id: 't1',
        name: 'My Trigger',
        events: [{ type: 'click' }],
        actions: [{ type: 'log' }]
      })
      expect(result.valid).toBe(true)
    })

    it('should accept a trigger with flat condition array', () => {
      const result = validateTrigger({
        id: 't1',
        events: [{ type: 'click' }],
        conditions: [{ left: 1, operator: 'eq', right: 1 }],
        actions: [{ type: 'log' }]
      })
      expect(result.valid).toBe(true)
    })

    it('should accept a trigger with nested condition group', () => {
      const result = validateTrigger({
        id: 't1',
        events: [{ type: 'click' }],
        conditions: [
          { type: 'or', conditions: [{ left: 1, operator: 'eq', right: 1 }] }
        ],
        actions: [{ type: 'log' }]
      })
      expect(result.valid).toBe(true)
    })

    it('should accept multiple events', () => {
      const result = validateTrigger({
        id: 't1',
        events: [{ type: 'click' }, { type: 'init' }],
        actions: [{ type: 'log' }]
      })
      expect(result.valid).toBe(true)
    })

    it('should accept empty conditions array', () => {
      const result = validateTrigger({
        id: 't1',
        events: [{ type: 'click' }],
        conditions: [],
        actions: [{ type: 'log' }]
      })
      expect(result.valid).toBe(true)
    })

    it('should accept multiple actions', () => {
      const result = validateTrigger({
        id: 't1',
        events: [{ type: 'click' }],
        actions: [{ type: 'log' }, { type: 'navigate' }]
      })
      expect(result.valid).toBe(true)
    })
  })

  describe('invalid triggers', () => {
    it('should reject null', () => {
      const result = validateTrigger(null)
      expect(result.valid).toBe(false)
      expect(result.errors[0].path).toBe('trigger')
      expect(result.errors[0].message).toBe('Trigger must be an object')
    })

    it('should reject non-object', () => {
      const result = validateTrigger('not a trigger')
      expect(result.valid).toBe(false)
      expect(result.errors[0].message).toBe('Trigger must be an object')
    })

    it('should reject trigger missing id', () => {
      const result = validateTrigger({
        events: [{ type: 'click' }],
        actions: [{ type: 'log' }]
      })
      expect(result.valid).toBe(false)
      expect(result.errors.some(e => e.path === 'trigger.id')).toBe(true)
    })

    it('should reject trigger with non-string id', () => {
      const result = validateTrigger({
        id: 123,
        events: [{ type: 'click' }],
        actions: [{ type: 'log' }]
      })
      expect(result.valid).toBe(false)
      expect(result.errors.some(e => e.path === 'trigger.id')).toBe(true)
    })

    it('should reject trigger with empty string id', () => {
      const result = validateTrigger({
        id: '',
        events: [{ type: 'click' }],
        actions: [{ type: 'log' }]
      })
      expect(result.valid).toBe(false)
      expect(result.errors.some(e => e.path === 'trigger.id')).toBe(true)
    })

    it('should reject trigger with non-string name', () => {
      const result = validateTrigger({
        id: 't1',
        name: 123,
        events: [{ type: 'click' }],
        actions: [{ type: 'log' }]
      })
      expect(result.valid).toBe(false)
      expect(result.errors.some(e => e.path === 'trigger.name')).toBe(true)
    })

    it('should accept undefined name', () => {
      const result = validateTrigger({
        id: 't1',
        name: undefined,
        events: [{ type: 'click' }],
        actions: [{ type: 'log' }]
      })
      expect(result.valid).toBe(true)
    })

    it('should reject trigger missing events', () => {
      const result = validateTrigger({
        id: 't1',
        actions: [{ type: 'log' }]
      })
      expect(result.valid).toBe(false)
      expect(result.errors.some(e => e.path === 'trigger.events')).toBe(true)
    })

    it('should reject trigger with non-array events', () => {
      const result = validateTrigger({
        id: 't1',
        events: 'not array',
        actions: [{ type: 'log' }]
      })
      expect(result.valid).toBe(false)
      expect(result.errors.some(e => e.path === 'trigger.events')).toBe(true)
    })

    it('should reject trigger with empty events array', () => {
      const result = validateTrigger({
        id: 't1',
        events: [],
        actions: [{ type: 'log' }]
      })
      expect(result.valid).toBe(false)
      const err = result.errors.find(e => e.path === 'trigger.events')
      expect(err?.message).toContain('at least one event')
    })

    it('should propagate errors from invalid event elements', () => {
      const result = validateTrigger({
        id: 't1',
        events: [{ type: 'click' }, { type: '' }],
        actions: [{ type: 'log' }]
      })
      expect(result.valid).toBe(false)
      expect(result.errors.some(e => e.path === 'trigger.events[1].type')).toBe(true)
    })

    it('should reject trigger missing actions', () => {
      const result = validateTrigger({
        id: 't1',
        events: [{ type: 'click' }]
      })
      expect(result.valid).toBe(false)
      expect(result.errors.some(e => e.path === 'trigger.actions')).toBe(true)
    })

    it('should reject trigger with non-array actions', () => {
      const result = validateTrigger({
        id: 't1',
        events: [{ type: 'click' }],
        actions: 'not array'
      })
      expect(result.valid).toBe(false)
      const err = result.errors.find(e => e.path === 'trigger.actions')
      expect(err?.message).toContain('actions array')
    })

    it('should reject trigger with empty actions array', () => {
      const result = validateTrigger({
        id: 't1',
        events: [{ type: 'click' }],
        actions: []
      })
      expect(result.valid).toBe(false)
      const err = result.errors.find(e => e.path === 'trigger.actions')
      expect(err?.message).toContain('at least one action')
    })

    it('should propagate errors from invalid action elements', () => {
      const result = validateTrigger({
        id: 't1',
        events: [{ type: 'click' }],
        actions: [{ type: '' }]
      })
      expect(result.valid).toBe(false)
      expect(result.errors.some(e => e.path.startsWith('trigger.actions[0]'))).toBe(true)
    })

    it('should reject conditions that are not an array', () => {
      const result = validateTrigger({
        id: 't1',
        events: [{ type: 'click' }],
        conditions: 'not array',
        actions: [{ type: 'log' }]
      })
      expect(result.valid).toBe(false)
      expect(result.errors.some(e => e.path === 'trigger.conditions')).toBe(true)
    })

    it('should propagate errors from invalid nested group', () => {
      const result = validateTrigger({
        id: 't1',
        events: [{ type: 'click' }],
        conditions: [{ type: 'or', conditions: [{ left: 1, operator: 'bad', right: 1 }] }],
        actions: [{ type: 'log' }]
      })
      expect(result.valid).toBe(false)
      expect(result.errors.some(e => e.path === 'trigger.conditions[0].conditions[0].operator')).toBe(true)
    })

    it('should reject ConditionGroup with type "not"', () => {
      const result = validateTrigger({
        id: 't1',
        events: [{ type: 'click' }],
        conditions: [{ type: 'not', conditions: [{ left: 1, operator: 'eq', right: 1 }] }],
        actions: [{ type: 'log' }]
      })
      expect(result.valid).toBe(false)
      expect(result.errors.some(e => e.path === 'trigger.conditions[0].type')).toBe(true)
    })
  })
})
