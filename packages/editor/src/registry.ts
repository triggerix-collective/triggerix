import type { BaseItemDef } from './types'

/**
 * 通用类型安全注册表
 * 各 preset 可扩展 ItemDef，添加自己的字段（如 template/slots/ports 等）
 */
export class BaseRegistry<
  TEventDef extends BaseItemDef = BaseItemDef,
  TActionDef extends BaseItemDef = BaseItemDef,
  TConditionDef extends BaseItemDef = BaseItemDef
> {
  protected events = new Map<string, TEventDef>()
  protected actions = new Map<string, TActionDef>()
  protected conditions = new Map<string, TConditionDef>()

  registerEvent(def: TEventDef): void {
    this.events.set(def.type, def)
  }

  registerAction(def: TActionDef): void {
    this.actions.set(def.type, def)
  }

  registerCondition(def: TConditionDef): void {
    this.conditions.set(def.type, def)
  }

  getEvent(type: string): TEventDef | undefined {
    return this.events.get(type)
  }

  getAction(type: string): TActionDef | undefined {
    return this.actions.get(type)
  }

  getCondition(type: string): TConditionDef | undefined {
    return this.conditions.get(type)
  }

  getEvents(): TEventDef[] {
    return [...this.events.values()]
  }

  getActions(): TActionDef[] {
    return [...this.actions.values()]
  }

  getConditions(): TConditionDef[] {
    return [...this.conditions.values()]
  }
}
