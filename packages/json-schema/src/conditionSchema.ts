import type { JSONSchema } from './types'
import { CONDITION_GROUP_TYPES, VALID_OPERATORS } from '@triggerix/core'
import { generateValueSchema } from './valueSchema'

/**
 * Generate JSON Schema for Operator
 */
export function generateOperatorSchema(): JSONSchema {
  return {
    type: 'string',
    enum: [...VALID_OPERATORS]
  }
}

/**
 * Generate JSON Schema for Condition
 */
export function generateConditionSchema(): JSONSchema {
  return {
    type: 'object',
    title: 'Condition',
    description: 'A single comparison condition',
    properties: {
      left: generateValueSchema(),
      operator: generateOperatorSchema(),
      right: generateValueSchema()
    },
    required: ['left', 'operator'],
    additionalProperties: false
  }
}

/**
 * Generate JSON Schema for a single ConditionItem (Condition or ConditionGroup).
 * Used inside condition arrays of `Trigger.conditions` and `ActionIf.condition`.
 */
export function generateConditionItemSchema(): JSONSchema {
  return {
    oneOf: [
      { $ref: '#/definitions/Condition' },
      { $ref: '#/definitions/ConditionGroup' }
    ]
  }
}

/**
 * Generate JSON Schema for ConditionGroup (AND/OR only; `not` is intentionally absent).
 */
export function generateConditionGroupSchema(): JSONSchema {
  return {
    type: 'object',
    title: 'ConditionGroup',
    description: 'Logical grouping of conditions (AND/OR). `not` is not supported here — use reverse comparisons or the expression system.',
    properties: {
      type: {
        type: 'string',
        enum: [...CONDITION_GROUP_TYPES]
      },
      conditions: {
        type: 'array',
        items: { $ref: '#/definitions/ConditionItem' },
        minItems: 1
      }
    },
    required: ['type', 'conditions'],
    additionalProperties: false
  }
}
