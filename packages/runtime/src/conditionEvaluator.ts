import type { Condition, ConditionGroup, ConditionItem, Expression, Reference, Value } from '@triggerix/core'
import type { FunctionRegistry } from './expressionEvaluator'
import type { RuntimeContext } from './types'
import { isConditionGroup } from '@triggerix/core'
import { evaluateExprNode } from './expressionEvaluator'
import { getNestedValue } from './utils'

/**
 * Resolve a Value to its actual value given a runtime context
 */
export function resolveValue(value: Value, context: RuntimeContext, functions: FunctionRegistry = new Map()): unknown {
  // Literal value
  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
    return value
  }

  // Expression value: { $expr: ... } —— must come before Reference check
  if (value && typeof value === 'object' && '$expr' in value) {
    return evaluateExprNode((value as Expression).$expr, context, functions)
  }

  // Reference value
  if (value && typeof value === 'object' && '$ref' in value) {
    const ref = value as Reference
    return getNestedValue(context as unknown as Record<string, unknown>, ref.$ref)
  }

  return value
}

/**
 * Evaluate a single condition
 */
export function evaluateCondition(condition: Condition, context: RuntimeContext, functions: FunctionRegistry = new Map()): boolean {
  const left = resolveValue(condition.left, context, functions)

  // 'exists' requires no right operand
  if (condition.operator === 'exists') {
    return left !== undefined && left !== null
  }

  // Other operators require right operand
  if (condition.right === undefined) {
    throw new Error(`Operator '${condition.operator}' requires a right operand`)
  }

  const right = resolveValue(condition.right, context, functions)

  switch (condition.operator) {
    case 'eq':
      return left === right
    case 'neq':
      return left !== right
    case 'gt':
      return typeof left === 'number' && typeof right === 'number' && left > right
    case 'gte':
      return typeof left === 'number' && typeof right === 'number' && left >= right
    case 'lt':
      return typeof left === 'number' && typeof right === 'number' && left < right
    case 'lte':
      return typeof left === 'number' && typeof right === 'number' && left <= right
    default:
      return false
  }
}

/**
 * Evaluate a flat condition array (used by `Trigger.conditions` and `ActionIf.condition`).
 *
 * Three-phase evaluation with short-circuit:
 *   1. Non-group items: implicit AND. First false short-circuits the entire array.
 *   2. Explicit `and` groups: every group must pass (internal short-circuit is the group's job).
 *   3. Explicit `or` groups: at least one must pass. If none exist, this phase is a no-op.
 *
 * An empty array returns `true` (no constraints = pass).
 */
export function evaluateConditions(
  items: ConditionItem[],
  context: RuntimeContext,
  functions: FunctionRegistry = new Map()
): boolean {
  if (items.length === 0)
    return true

  // Single-pass partition into three buckets. Reusing two arrays keeps the
  // inner loops branch-free; only the partition loop pays for classification.
  const andGroups: ConditionGroup[] = []
  const orGroups: ConditionGroup[] = []
  let implicitAndIdx = 0
  const implicitAnds: Condition[] = Array.from({ length: items.length })
  let andGroupCount = 0
  let orGroupCount = 0

  for (let i = 0; i < items.length; i++) {
    const item = items[i]
    if (isConditionGroup(item)) {
      if (item.type === 'and') {
        andGroups[andGroupCount++] = item
      }
      else {
        orGroups[orGroupCount++] = item
      }
    }
    else {
      implicitAnds[implicitAndIdx++] = item
    }
  }
  implicitAnds.length = implicitAndIdx

  // Phase 1: implicit AND, short-circuit
  for (let i = 0; i < implicitAnds.length; i++) {
    if (!evaluateCondition(implicitAnds[i], context, functions))
      return false
  }

  // Phase 2: every explicit AND group must pass
  for (let i = 0; i < andGroupCount; i++) {
    if (!evaluateConditionGroup(andGroups[i], context, functions))
      return false
  }

  // Phase 3: at least one explicit OR group must pass (no-op when absent)
  if (orGroupCount === 0)
    return true
  for (let i = 0; i < orGroupCount; i++) {
    if (evaluateConditionGroup(orGroups[i], context, functions))
      return true
  }
  return false
}

/**
 * Evaluate a condition group (AND / OR).
 * 'not' is intentionally not supported; use reverse comparisons or the expression system.
 */
export function evaluateConditionGroup(group: ConditionGroup, context: RuntimeContext, functions: FunctionRegistry = new Map()): boolean {
  switch (group.type) {
    case 'and':
      return group.conditions.every(c => evaluateItem(c, context, functions))
    case 'or':
      return group.conditions.some(c => evaluateItem(c, context, functions))
  }
}

/**
 * Evaluate a condition or condition group (internal recursion for group nesting)
 */
function evaluateItem(item: Condition | ConditionGroup, context: RuntimeContext, functions: FunctionRegistry): boolean {
  if (isConditionGroup(item)) {
    return evaluateConditionGroup(item, context, functions)
  }
  return evaluateCondition(item, context, functions)
}
