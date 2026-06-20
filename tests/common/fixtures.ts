import type { Action, Condition, ConditionGroup, ConditionItem, Event, Trigger } from '@triggerix/core'

/**
 * Valid Event fixture
 */
export const validEvent: Event = { type: 'user.login', source: 'auth' }

/**
 * Valid Condition fixture
 */
export const validCondition: Condition = {
  left: { $ref: 'payload.age' },
  operator: 'gte',
  right: 18
}

/**
 * Valid ConditionGroup fixture
 */
export const validConditionGroup: ConditionGroup = {
  type: 'and',
  conditions: [validCondition]
}

/**
 * Valid flat condition array fixture (ConditionItem[]).
 * Mirrors the shape used by Trigger.conditions and ActionIf.condition.
 */
export const validConditionsArray: ConditionItem[] = [validCondition]

/**
 * Valid Action fixture
 */
export const validAction: Action = {
  type: 'sendEmail',
  params: { to: 'admin@test.com' }
}

/**
 * Valid Trigger fixture
 */
export const validTrigger: Trigger = {
  id: 'trigger-1',
  name: 'Test Trigger',
  events: [validEvent],
  conditions: validConditionsArray,
  actions: [validAction]
}
