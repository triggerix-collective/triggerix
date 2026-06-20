import { generateTriggerSchema } from '@triggerix/json-schema'
import { describe, expect, it } from 'vitest'

describe('generateTriggerSchema', () => {
  const schema = generateTriggerSchema()

  describe('top-level metadata', () => {
    it('should include $schema field', () => {
      expect(schema.$schema).toBe('http://json-schema.org/draft-07/schema#')
    })

    it('should include $id field', () => {
      expect(schema.$id).toBe('https://triggerix.dev/schema/trigger.json')
    })

    it('should include title field', () => {
      expect(schema.title).toBe('Triggerix Trigger')
    })

    it('should include description field', () => {
      expect(typeof schema.description).toBe('string')
      expect((schema.description as string).length).toBeGreaterThan(0)
    })

    it('should declare type as object', () => {
      expect(schema.type).toBe('object')
    })

    it('should set additionalProperties to false', () => {
      expect(schema.additionalProperties).toBe(false)
    })
  })

  describe('properties', () => {
    it('should contain id, name, events, conditions, actions', () => {
      const properties = schema.properties as Record<string, unknown>
      expect(properties).toBeDefined()
      expect(properties.id).toBeDefined()
      expect(properties.name).toBeDefined()
      expect(properties.events).toBeDefined()
      expect(properties.conditions).toBeDefined()
      expect(properties.actions).toBeDefined()
    })

    it('should declare events as an array of Event', () => {
      const events = schema.properties?.events as Record<string, unknown>
      expect(events.type).toBe('array')
      const items = events.items as Record<string, unknown>
      expect(items.$ref).toBe('#/definitions/Event')
      expect(events.minItems).toBe(1)
    })

    it('should declare conditions as an array of ConditionItem', () => {
      const conditions = schema.properties?.conditions as Record<string, unknown>
      expect(conditions.type).toBe('array')
      const items = conditions.items as Record<string, unknown>
      expect(items.$ref).toBe('#/definitions/ConditionItem')
    })
  })

  describe('required', () => {
    it('should require id, events, and actions', () => {
      expect(schema.required).toEqual(['id', 'events', 'actions'])
    })
  })

  describe('definitions', () => {
    const expectedKeys = [
      'Event',
      'Condition',
      'ConditionItem',
      'ConditionGroup',
      'Action',
      'ActionNode',
      'ActionSequence',
      'ActionParallel',
      'ActionTryCatch',
      'ActionIf',
      'Value',
      'Expression',
      'ExprNode',
      'ExprOperand',
      'ExprBinary',
      'ExprUnary',
      'ExprCompare',
      'ExprLogical',
      'ExprCall',
      'ExprConcat',
      'ExprTernary'
    ]

    it('should contain all required definition keys', () => {
      const definitions = schema.definitions as Record<string, unknown>
      expect(definitions).toBeDefined()
      for (const key of expectedKeys) {
        expect(definitions[key]).toBeDefined()
      }
    })

    it('should restrict ConditionGroup to and/or (no not)', () => {
      const definitions = schema.definitions as Record<string, unknown>
      const group = definitions.ConditionGroup as Record<string, unknown>
      const typeSchema = group.properties as Record<string, unknown>
      const enumValues = (typeSchema.type as Record<string, unknown>).enum as string[]
      expect(enumValues).toContain('and')
      expect(enumValues).toContain('or')
      expect(enumValues).not.toContain('not')
    })
  })
})
