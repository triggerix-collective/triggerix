import type { Action } from '@triggerix/core'
import { actionIf, parallel, sequence, tryCatch } from '@triggerix/schema'
import { describe, expect, it } from 'vitest'
import { validCondition } from '../common/fixtures'

const action1: Action = { type: 'a1' }
const action2: Action = { type: 'a2' }

describe('flow builders', () => {
  it('sequence wraps actions into a sequence node', () => {
    expect(sequence(action1, action2)).toEqual({
      type: 'sequence',
      actions: [action1, action2]
    })
  })

  it('parallel wraps actions into a parallel node', () => {
    expect(parallel(action1, action2)).toEqual({
      type: 'parallel',
      actions: [action1, action2]
    })
  })

  it('tryCatch builds a node with try/catch/finally branches', () => {
    const result = tryCatch({
      try: [action1],
      catch: [action2],
      finally: [action1]
    })
    expect(result).toEqual({
      type: 'tryCatch',
      try: [action1],
      catch: [action2],
      finally: [action1]
    })
  })

  it('tryCatch omits catch and finally when not provided', () => {
    const result = tryCatch({ try: [action1] })
    expect(result).toEqual({
      type: 'tryCatch',
      try: [action1]
    })
    expect(result).not.toHaveProperty('catch')
    expect(result).not.toHaveProperty('finally')
  })

  it('actionIf builds a node with condition/then/else', () => {
    const result = actionIf({
      condition: validCondition,
      then: [action1],
      else: [action2]
    })
    expect(result).toEqual({
      type: 'if',
      condition: validCondition,
      then: [action1],
      else: [action2]
    })
  })

  it('actionIf omits else when not provided', () => {
    const result = actionIf({
      condition: validCondition,
      then: [action1]
    })
    expect(result).toEqual({
      type: 'if',
      condition: validCondition,
      then: [action1]
    })
    expect(result).not.toHaveProperty('else')
  })
})
