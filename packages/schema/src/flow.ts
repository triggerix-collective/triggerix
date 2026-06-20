import type {
  ActionIf,
  ActionNode,
  ActionParallel,
  ActionSequence,
  ActionTryCatch,
  ConditionItem
} from '@triggerix/core'

/**
 * Create a sequence flow node (execute actions in order)
 */
export function sequence(...actions: ActionNode[]): ActionSequence {
  return { type: 'sequence', actions }
}

/**
 * Create a parallel flow node (execute actions concurrently)
 */
export function parallel(...actions: ActionNode[]): ActionParallel {
  return { type: 'parallel', actions }
}

/**
 * Create a try/catch/finally flow node
 */
export function tryCatch(options: {
  try: ActionNode[]
  catch?: ActionNode[]
  finally?: ActionNode[]
}): ActionTryCatch {
  return {
    type: 'tryCatch',
    try: options.try,
    ...(options.catch && { catch: options.catch }),
    ...(options.finally && { finally: options.finally })
  }
}

/**
 * Create a conditional branch flow node.
 * `condition` uses the same flat array shape as `Trigger.conditions`:
 * non-group items imply implicit AND; group items (`and`/`or`) are evaluated per type.
 */
export function actionIf(options: {
  condition: ConditionItem[]
  then: ActionNode[]
  else?: ActionNode[]
}): ActionIf {
  return {
    type: 'if',
    condition: options.condition,
    then: options.then,
    ...(options.else && { else: options.else })
  }
}
