import { BaseRegistry } from '@triggerix/editor'
import { describe, expect, it } from 'vitest'

describe('baseRegistry', () => {
  describe('events', () => {
    it('should register and retrieve an event by type', () => {
      const registry = new BaseRegistry()
      const def = { type: 'click', label: 'Click Event' }
      registry.registerEvent(def)
      expect(registry.getEvent('click')).toEqual(def)
    })

    it('should return undefined for unknown event type', () => {
      const registry = new BaseRegistry()
      expect(registry.getEvent('unknown')).toBeUndefined()
    })

    it('should return all registered events', () => {
      const registry = new BaseRegistry()
      const def1 = { type: 'click', label: 'Click' }
      const def2 = { type: 'hover', label: 'Hover' }
      registry.registerEvent(def1)
      registry.registerEvent(def2)
      const events = registry.getEvents()
      expect(events).toHaveLength(2)
      expect(events).toContainEqual(def1)
      expect(events).toContainEqual(def2)
    })

    it('should override previous registration when registering with same type', () => {
      const registry = new BaseRegistry()
      registry.registerEvent({ type: 'click', label: 'Old' })
      registry.registerEvent({ type: 'click', label: 'New' })
      expect(registry.getEvent('click')).toEqual({ type: 'click', label: 'New' })
      expect(registry.getEvents()).toHaveLength(1)
    })
  })

  describe('actions', () => {
    it('should register and retrieve an action by type', () => {
      const registry = new BaseRegistry()
      const def = { type: 'log', label: 'Log Action' }
      registry.registerAction(def)
      expect(registry.getAction('log')).toEqual(def)
    })

    it('should return undefined for unknown action type', () => {
      const registry = new BaseRegistry()
      expect(registry.getAction('missing')).toBeUndefined()
    })

    it('should return all registered actions', () => {
      const registry = new BaseRegistry()
      const a = { type: 'log', label: 'Log' }
      const b = { type: 'alert', label: 'Alert' }
      registry.registerAction(a)
      registry.registerAction(b)
      const actions = registry.getActions()
      expect(actions).toHaveLength(2)
      expect(actions).toContainEqual(a)
      expect(actions).toContainEqual(b)
    })

    it('should override previous registration when registering with same type', () => {
      const registry = new BaseRegistry()
      registry.registerAction({ type: 'log', label: 'V1' })
      registry.registerAction({ type: 'log', label: 'V2' })
      expect(registry.getAction('log')).toEqual({ type: 'log', label: 'V2' })
      expect(registry.getActions()).toHaveLength(1)
    })
  })

  describe('conditions', () => {
    it('should register and retrieve a condition by type', () => {
      const registry = new BaseRegistry()
      const def = { type: 'eq', label: 'Equals' }
      registry.registerCondition(def)
      expect(registry.getCondition('eq')).toEqual(def)
    })

    it('should return undefined for unknown condition type', () => {
      const registry = new BaseRegistry()
      expect(registry.getCondition('none')).toBeUndefined()
    })

    it('should return all registered conditions', () => {
      const registry = new BaseRegistry()
      const c1 = { type: 'eq', label: 'Equals' }
      const c2 = { type: 'gt', label: 'Greater Than' }
      registry.registerCondition(c1)
      registry.registerCondition(c2)
      const conditions = registry.getConditions()
      expect(conditions).toHaveLength(2)
      expect(conditions).toContainEqual(c1)
      expect(conditions).toContainEqual(c2)
    })

    it('should override previous registration when registering with same type', () => {
      const registry = new BaseRegistry()
      registry.registerCondition({ type: 'eq', label: 'Old' })
      registry.registerCondition({ type: 'eq', label: 'New' })
      expect(registry.getCondition('eq')).toEqual({ type: 'eq', label: 'New' })
      expect(registry.getConditions()).toHaveLength(1)
    })
  })

  describe('isolation', () => {
    it('should keep events, actions, and conditions independent', () => {
      const registry = new BaseRegistry()
      registry.registerEvent({ type: 'shared', label: 'Event' })
      registry.registerAction({ type: 'shared', label: 'Action' })
      registry.registerCondition({ type: 'shared', label: 'Condition' })

      expect(registry.getEvent('shared')).toEqual({ type: 'shared', label: 'Event' })
      expect(registry.getAction('shared')).toEqual({ type: 'shared', label: 'Action' })
      expect(registry.getCondition('shared')).toEqual({ type: 'shared', label: 'Condition' })
    })
  })
})
