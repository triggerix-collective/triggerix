import {
  defineAction,
  defineCondition,
  defineConditionGroup,
  defineEvent,
  defineRule
} from '@triggerix/schema'
import { describe, expect, it } from 'vitest'
import {
  validAction,
  validCondition,
  validConditionGroup,
  validEvent,
  validRule
} from '../common/fixtures'

describe('define helpers', () => {
  it('defineEvent returns the input as-is', () => {
    expect(defineEvent(validEvent)).toBe(validEvent)
  })

  it('defineCondition returns the input as-is', () => {
    expect(defineCondition(validCondition)).toBe(validCondition)
  })

  it('defineConditionGroup returns the input as-is', () => {
    expect(defineConditionGroup(validConditionGroup)).toBe(validConditionGroup)
  })

  it('defineAction returns the input as-is', () => {
    expect(defineAction(validAction)).toBe(validAction)
  })

  it('defineRule returns the input as-is', () => {
    expect(defineRule(validRule)).toBe(validRule)
  })
})
