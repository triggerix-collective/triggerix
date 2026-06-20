import type { Condition, ConditionGroup, ConditionItem } from '@triggerix/core'

/**
 * Define a single condition
 */
export function defineCondition(condition: Condition): Condition {
  return condition
}

/**
 * Define a condition group (AND / OR only).
 * `not` is intentionally not supported at the group level; use reverse
 * comparisons or the expression system for negation.
 */
export function defineConditionGroup(group: ConditionGroup): ConditionGroup {
  return group
}

/**
 * Define a flat condition array (used by `Trigger.conditions` and `ActionIf.condition`).
 * Pure identity helper for DSL readability and to anchor the array type at call sites.
 */
export function defineConditions(...items: ConditionItem[]): ConditionItem[] {
  return items
}
