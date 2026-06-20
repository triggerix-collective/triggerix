import { validateCondition, validateConditionGroup, validateConditionItems } from '@triggerix/validator'
import { describe, expect, it } from 'vitest'

describe('validateCondition', () => {
  describe('valid conditions', () => {
    it('should accept a basic eq condition with string operands', () => {
      const result = validateCondition({
        left: 'hello',
        operator: 'eq',
        right: 'world'
      })
      expect(result.valid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    it('should accept a condition with reference left and exists operator (no right)', () => {
      const result = validateCondition({
        left: { $ref: 'x' },
        operator: 'exists'
      })
      expect(result.valid).toBe(true)
    })

    it('should accept all known operators', () => {
      const operators = ['eq', 'neq', 'gt', 'gte', 'lt', 'lte']
      for (const op of operators) {
        const result = validateCondition({ left: 1, operator: op, right: 1 })
        expect(result.valid).toBe(true)
      }
    })
  })

  describe('invalid conditions', () => {
    it('should reject null', () => {
      const result = validateCondition(null)
      expect(result.valid).toBe(false)
      expect(result.errors[0].path).toBe('condition')
      expect(result.errors[0].message).toBe('Condition must be an object')
    })

    it('should reject empty object', () => {
      const result = validateCondition({})
      expect(result.valid).toBe(false)
      expect(result.errors.some(e => e.path === 'condition.left')).toBe(true)
      expect(result.errors.some(e => e.path === 'condition.operator')).toBe(true)
    })

    it('should reject condition without left', () => {
      const result = validateCondition({ operator: 'eq', right: 1 })
      expect(result.valid).toBe(false)
      expect(result.errors.some(e => e.path === 'condition.left')).toBe(true)
    })

    it('should reject invalid operator', () => {
      const result = validateCondition({ left: 1, operator: 'foo', right: 1 })
      expect(result.valid).toBe(false)
      const opError = result.errors.find(e => e.path === 'condition.operator')
      expect(opError).toBeDefined()
      expect(opError?.type).toBe('semantic')
    })

    it('should reject non-string operator', () => {
      const result = validateCondition({ left: 1, operator: 42, right: 1 })
      expect(result.valid).toBe(false)
      expect(result.errors.some(e => e.path === 'condition.operator')).toBe(true)
    })
  })
})

describe('validateConditionGroup', () => {
  describe('valid groups', () => {
    it('should accept a basic and group', () => {
      const result = validateConditionGroup({
        type: 'and',
        conditions: [{ left: 1, operator: 'eq', right: 1 }]
      })
      expect(result.valid).toBe(true)
    })

    it('should accept or group with multiple conditions', () => {
      const result = validateConditionGroup({
        type: 'or',
        conditions: [
          { left: 1, operator: 'eq', right: 1 },
          { left: 'a', operator: 'neq', right: 'b' }
        ]
      })
      expect(result.valid).toBe(true)
    })

    it('should accept nested condition group', () => {
      const result = validateConditionGroup({
        type: 'and',
        conditions: [
          {
            type: 'or',
            conditions: [{ left: 1, operator: 'eq', right: 1 }]
          }
        ]
      })
      expect(result.valid).toBe(true)
    })
  })

  describe('invalid groups', () => {
    it('should reject null', () => {
      const result = validateConditionGroup(null)
      expect(result.valid).toBe(false)
      expect(result.errors[0].path).toBe('conditions')
      expect(result.errors[0].message).toBe('ConditionGroup must be an object')
    })

    it('should reject invalid group type', () => {
      const result = validateConditionGroup({ type: 'invalid', conditions: [] })
      expect(result.valid).toBe(false)
      expect(result.errors.some(e => e.path === 'conditions.type')).toBe(true)
    })

    it('should reject type "not" (no longer supported)', () => {
      const result = validateConditionGroup({
        type: 'not',
        conditions: [{ left: 1, operator: 'eq', right: 1 }]
      })
      expect(result.valid).toBe(false)
      const err = result.errors.find(e => e.path === 'conditions.type')
      expect(err?.message).toContain('not')
    })

    it('should reject when conditions is not an array', () => {
      const result = validateConditionGroup({ type: 'and', conditions: 'not array' })
      expect(result.valid).toBe(false)
      expect(result.errors.some(e => e.path === 'conditions.conditions')).toBe(true)
    })

    it('should propagate errors from nested invalid condition', () => {
      const result = validateConditionGroup({
        type: 'and',
        conditions: [{ left: 1, operator: 'bad', right: 1 }]
      })
      expect(result.valid).toBe(false)
      expect(result.errors.some(e => e.path === 'conditions.conditions[0].operator')).toBe(true)
    })

    it('should propagate errors from nested invalid condition group', () => {
      const result = validateConditionGroup({
        type: 'and',
        conditions: [{ type: 'or', conditions: 'bad' }]
      })
      expect(result.valid).toBe(false)
      expect(
        result.errors.some(e => e.path === 'conditions.conditions[0].conditions')
      ).toBe(true)
    })
  })
})

describe('validateConditionItems', () => {
  describe('valid arrays', () => {
    it('should accept an empty array (no constraints)', () => {
      const result = validateConditionItems([])
      expect(result.valid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    it('should accept a single condition', () => {
      const result = validateConditionItems([{ left: 1, operator: 'eq', right: 1 }])
      expect(result.valid).toBe(true)
    })

    it('should accept a single group', () => {
      const result = validateConditionItems([{
        type: 'and',
        conditions: [{ left: 1, operator: 'eq', right: 1 }]
      }])
      expect(result.valid).toBe(true)
    })

    it('should accept a mix of conditions and groups', () => {
      const result = validateConditionItems([
        { left: 1, operator: 'eq', right: 1 },
        { type: 'or', conditions: [{ left: 1, operator: 'eq', right: 1 }] }
      ])
      expect(result.valid).toBe(true)
    })

    it('should accept deeply nested groups', () => {
      const result = validateConditionItems([
        {
          type: 'and',
          conditions: [
            { type: 'or', conditions: [
              { type: 'and', conditions: [{ left: 1, operator: 'eq', right: 1 }] }
            ] }
          ]
        }
      ])
      expect(result.valid).toBe(true)
    })
  })

  describe('invalid arrays', () => {
    it('should reject non-array', () => {
      const result = validateConditionItems('not array')
      expect(result.valid).toBe(false)
      expect(result.errors[0].message).toBe('Conditions must be an array')
    })

    it('should reject null', () => {
      const result = validateConditionItems(null)
      expect(result.valid).toBe(false)
      expect(result.errors[0].message).toBe('Conditions must be an array')
    })

    it('should reject arrays containing "not" groups', () => {
      const result = validateConditionItems([
        { type: 'not', conditions: [{ left: 1, operator: 'eq', right: 1 }] }
      ])
      expect(result.valid).toBe(false)
      expect(result.errors.some(e => e.path === 'conditions[0].type')).toBe(true)
    })

    it('should reject arrays with invalid condition elements', () => {
      const result = validateConditionItems([{ left: 1, operator: 'bad', right: 1 }])
      expect(result.valid).toBe(false)
      expect(result.errors.some(e => e.path === 'conditions[0].operator')).toBe(true)
    })

    it('should report path for each invalid item', () => {
      const result = validateConditionItems([
        { left: 1, operator: 'eq', right: 1 },
        { left: 1, operator: 'bad', right: 1 },
        { type: 'or', conditions: [{ left: 1, operator: 'eq', right: 1 }] },
        { left: 1, operator: 'bad2', right: 1 }
      ])
      expect(result.valid).toBe(false)
      expect(result.errors.some(e => e.path === 'conditions[1].operator')).toBe(true)
      expect(result.errors.some(e => e.path === 'conditions[3].operator')).toBe(true)
    })
  })
})
