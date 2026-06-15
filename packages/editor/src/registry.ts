import type { ActionDef, ConditionDef, EventDef, ToolDef } from './types'

export class Registry {
  private events = new Map<string, EventDef>()
  private actions = new Map<string, ActionDef>()
  private conditions = new Map<string, ConditionDef>()
  private tools = new Map<string, ToolDef>()

  registerEvent(def: EventDef): void {
    if (this.events.has(def.type)) {
      console.warn(`Event type '${def.type}' is already registered. Overwriting.`)
    }
    this.events.set(def.type, def)
  }

  registerAction(def: ActionDef): void {
    if (this.actions.has(def.type)) {
      console.warn(`Action type '${def.type}' is already registered. Overwriting.`)
    }
    this.actions.set(def.type, def)
  }

  registerCondition(def: ConditionDef): void {
    if (this.conditions.has(def.type)) {
      console.warn(`Condition type '${def.type}' is already registered. Overwriting.`)
    }
    this.conditions.set(def.type, def)
  }

  registerTool(name: string, def: ToolDef): void {
    if (this.tools.has(name)) {
      console.warn(`Tool '${name}' is already registered. Overwriting.`)
    }
    this.tools.set(name, def)
  }

  getEvent(type: string): EventDef | undefined {
    return this.events.get(type)
  }

  getAction(type: string): ActionDef | undefined {
    return this.actions.get(type)
  }

  getCondition(type: string): ConditionDef | undefined {
    return this.conditions.get(type)
  }

  getTool(name: string): ToolDef | undefined {
    return this.tools.get(name)
  }

  getEvents(): EventDef[] {
    return Array.from(this.events.values())
  }

  getActions(): ActionDef[] {
    return Array.from(this.actions.values())
  }

  getConditions(): ConditionDef[] {
    return Array.from(this.conditions.values())
  }

  getTools(): Map<string, ToolDef> {
    return new Map(this.tools)
  }
}
