import type { JSONSchema } from './types'
import { generateActionSchema } from './actionSchema'
import { generateConditionGroupSchema, generateConditionItemSchema, generateConditionSchema } from './conditionSchema'
import { generateEventSchema } from './eventSchema'
import {
  generateExprBinarySchema,
  generateExprCallSchema,
  generateExprCompareSchema,
  generateExprConcatSchema,
  generateExpressionSchema,
  generateExprLogicalSchema,
  generateExprNodeSchema,
  generateExprOperandSchema,
  generateExprTernarySchema,
  generateExprUnarySchema
} from './expressionSchema'
import {
  generateActionIfSchema,
  generateActionNodeSchema,
  generateActionParallelSchema,
  generateActionSequenceSchema,
  generateActionTryCatchSchema
} from './flowSchema'
import { generateValueSchema } from './valueSchema'

/**
 * Generate the complete JSON Schema for a Triggerix Trigger
 */
export function generateTriggerSchema(): JSONSchema {
  return {
    $schema: 'http://json-schema.org/draft-07/schema#',
    $id: 'https://triggerix.dev/schema/trigger.json',
    title: 'Triggerix Trigger',
    description: 'A language-agnostic ECA trigger: Events (OR) → Conditions (flat array) → Actions',
    type: 'object',
    properties: {
      id: {
        type: 'string',
        description: 'Unique trigger identifier'
      },
      name: {
        type: 'string',
        description: 'Human-readable trigger name'
      },
      events: {
        type: 'array',
        description: 'Events that activate this trigger. OR semantics: fires when any event matches.',
        items: { $ref: '#/definitions/Event' },
        minItems: 1
      },
      conditions: {
        type: 'array',
        description: 'Conditions: non-group items imply implicit AND; group items use explicit and/or with arbitrary nesting.',
        items: { $ref: '#/definitions/ConditionItem' }
      },
      actions: {
        type: 'array',
        items: { $ref: '#/definitions/ActionNode' },
        minItems: 1
      }
    },
    required: ['id', 'events', 'actions'],
    additionalProperties: false,
    definitions: {
      Event: generateEventSchema(),
      Condition: generateConditionSchema(),
      ConditionItem: generateConditionItemSchema(),
      ConditionGroup: generateConditionGroupSchema(),
      Action: generateActionSchema(),
      ActionNode: generateActionNodeSchema(),
      ActionSequence: generateActionSequenceSchema(),
      ActionParallel: generateActionParallelSchema(),
      ActionTryCatch: generateActionTryCatchSchema(),
      ActionIf: generateActionIfSchema(),
      Value: generateValueSchema(),
      Expression: generateExpressionSchema(),
      ExprNode: generateExprNodeSchema(),
      ExprOperand: generateExprOperandSchema(),
      ExprBinary: generateExprBinarySchema(),
      ExprUnary: generateExprUnarySchema(),
      ExprCompare: generateExprCompareSchema(),
      ExprLogical: generateExprLogicalSchema(),
      ExprCall: generateExprCallSchema(),
      ExprConcat: generateExprConcatSchema(),
      ExprTernary: generateExprTernarySchema()
    }
  }
}
