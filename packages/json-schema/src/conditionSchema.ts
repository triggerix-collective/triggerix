import type { JSONSchema } from './types'
import { LOGICAL_OPERATORS, VALID_OPERATORS } from '@triggerix/core'
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
 * Generate JSON Schema for ConditionGroup
 */
export function generateConditionGroupSchema(): JSONSchema {
  return {
    type: 'object',
    title: 'ConditionGroup',
    description: 'Logical grouping of conditions (AND/OR/NOT)',
    properties: {
      type: {
        type: 'string',
        enum: [...LOGICAL_OPERATORS]
      },
      conditions: {
        type: 'array',
        items: {
          oneOf: [
            { $ref: '#/definitions/Condition' },
            { $ref: '#/definitions/ConditionGroup' }
          ]
        },
        minItems: 1
      }
    },
    required: ['type', 'conditions'],
    additionalProperties: false
  }
}
