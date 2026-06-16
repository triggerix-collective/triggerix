import type { Rule } from '@triggerix/core'

/**
 * 所有编辑器实现必须满足的通用接口
 * War3 editor、Workflow editor、Form editor 都实现此接口
 */
export interface Editor<TState = unknown> {
  /** 获取当前编辑状态 */
  getState: () => TState
  /** 订阅状态变更 */
  onChange: (listener: () => void) => () => void
  /** 序列化为标准 Rule JSON */
  toRule: (ruleId?: string) => Rule
  /** 重置编辑器状态 */
  reset: () => void
  /** 销毁编辑器，释放资源 */
  dispose: () => void
}

/**
 * 所有注册项的基础定义
 */
export interface BaseItemDef {
  type: string
  label: string
}

/**
 * 通用 Preset 接口
 * 各 preset 库导出符合此接口的对象，用于批量注入定义
 */
export interface Preset<TEditor extends Editor> {
  name: string
  setup: (editor: TEditor) => void
}
