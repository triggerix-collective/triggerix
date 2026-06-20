/**
 * Valid operators for Condition evaluation (single source of truth)
 */
export const VALID_OPERATORS = ['eq', 'neq', 'gt', 'gte', 'lt', 'lte', 'exists'] as const

/**
 * Binary arithmetic operators
 */
export const BINARY_OPERATORS = ['+', '-', '*', '/', '%'] as const

/**
 * Unary operators
 */
export const UNARY_OPERATORS = ['-', '!'] as const

/**
 * Compare operators (subset of VALID_OPERATORS, excluding 'exists')
 */
export const COMPARE_OPERATORS = ['eq', 'neq', 'gt', 'gte', 'lt', 'lte'] as const

/**
 * Logical operators used by expression system (ExprLogical).
 * Includes 'not' because expressions are a Turing-complete compute domain.
 */
export const LOGICAL_OPERATORS = ['and', 'or', 'not'] as const

/**
 * Condition group types (subset of LOGICAL_OPERATORS; 'not' is intentionally
 * excluded — use reverse comparisons or the expression system instead).
 * Single source of truth for both type narrowing and runtime validation.
 */
export const CONDITION_GROUP_TYPES = ['and', 'or'] as const

/**
 * Operator types for condition evaluation
 */
export type Operator = typeof VALID_OPERATORS[number]

/**
 * Binary arithmetic operator type
 */
export type BinaryOp = typeof BINARY_OPERATORS[number]

/**
 * Unary operator type
 */
export type UnaryOp = typeof UNARY_OPERATORS[number]

/**
 * Compare operator type
 */
export type CompareOp = typeof COMPARE_OPERATORS[number]

/**
 * Logical operator type (expression system)
 */
export type LogicalOp = typeof LOGICAL_OPERATORS[number]

/**
 * Condition group operator type (conditions, not expressions)
 */
export type ConditionGroupOp = typeof CONDITION_GROUP_TYPES[number]

/**
 * Literal value - primitive types
 */
export type Literal = string | number | boolean

/**
 * Reference value - points to a dynamic value
 */
export interface Reference {
  $ref: string
}

/**
 * Value can be a literal, a reference, or an expression
 */
export type Value = Literal | Reference | Expression

/**
 * Event - describes WHEN to trigger
 */
export interface Event {
  type: string
  source?: string
  payload?: Record<string, unknown>
}

/**
 * Condition - describes a single comparison
 */
export interface Condition {
  left: Value
  operator: Operator
  right?: Value
}

/**
 * ConditionGroup - logical grouping of conditions.
 * Supports AND/OR with arbitrary nesting.
 */
export interface ConditionGroup {
  type: ConditionGroupOp
  conditions: ConditionItem[]
}

/**
 * ConditionItem - a single element in a condition array.
 * Top-level condition arrays are flat: non-group items imply implicit AND,
 * explicit groups are evaluated per their type and nesting.
 */
export type ConditionItem = Condition | ConditionGroup

/**
 * Action - describes WHAT to execute
 */
export interface Action {
  type: string
  params?: Record<string, Value>
}

/**
 * Trigger - the top-level construct
 * Events → Conditions → Actions
 *
 * - `events`: OR semantics — trigger fires when any event matches.
 * - `conditions`: flat array with implicit AND between non-group items;
 *   explicit groups (`and`/`or`) are evaluated per their type and may nest.
 */
export interface Trigger {
  id: string
  name?: string
  events: Event[]
  conditions?: ConditionItem[]
  actions: ActionNode[]
}

// Expression System - dynamic computation nodes

/** Expression operand */
export type ExprOperand = Literal | Reference | ExprNode

/** Binary arithmetic expression */
export interface ExprBinary {
  type: 'binary'
  operator: BinaryOp
  left: ExprOperand
  right: ExprOperand
}

/** Unary expression */
export interface ExprUnary {
  type: 'unary'
  operator: UnaryOp
  operand: ExprOperand
}

/** Comparison expression */
export interface ExprCompare {
  type: 'compare'
  operator: CompareOp
  left: ExprOperand
  right: ExprOperand
}

/**
 * Logical expression.
 * `operator` is an explicit literal union (not aliased to `LogicalOp`) so that
 * the expression layer keeps `not` even when condition groups drop it.
 */
export interface ExprLogical {
  type: 'logical'
  operator: 'and' | 'or' | 'not'
  operands: ExprOperand[]
}

/** Function call expression */
export interface ExprCall {
  type: 'call'
  name: string
  args: ExprOperand[]
}

/** String concatenation */
export interface ExprConcat {
  type: 'concat'
  values: ExprOperand[]
}

/** Ternary expression */
export interface ExprTernary {
  type: 'ternary'
  test: ExprOperand
  consequent: ExprOperand
  alternate: ExprOperand
}

/** Union of all expression nodes */
export type ExprNode
  = | ExprBinary
    | ExprUnary
    | ExprCompare
    | ExprLogical
    | ExprCall
    | ExprConcat
    | ExprTernary

/** Expression wrapper */
export interface Expression {
  $expr: ExprNode
}

// Flow Control - composite action nodes

/** Sequential execution */
export interface ActionSequence {
  type: 'sequence'
  actions: ActionNode[]
}

/** Parallel execution */
export interface ActionParallel {
  type: 'parallel'
  actions: ActionNode[]
}

/** Try-catch error handling */
export interface ActionTryCatch {
  type: 'tryCatch'
  try: ActionNode[]
  catch?: ActionNode[]
  finally?: ActionNode[]
}

/**
 * Conditional branching.
 * `condition` mirrors `Trigger.conditions` exactly: a flat array of
 * Condition or ConditionGroup items, evaluated with implicit AND at the top
 * level. ActionIf does not perform the 3-stage (non-group / and / or)
 * prioritization — only the trigger-level entry point does.
 */
export interface ActionIf {
  type: 'if'
  condition: ConditionItem[]
  then: ActionNode[]
  else?: ActionNode[]
}

/** Action node union */
export type ActionNode
  = | Action
    | ActionSequence
    | ActionParallel
    | ActionTryCatch
    | ActionIf

// Type Guards

/**
 * Type guard: check if a value is structurally a ConditionGroup (i.e. has a
 * string `type` field). The `type` value itself is NOT validated here — that's
 * the job of the validator/runtime switch — so this guard remains stable as the
 * group operator set evolves.
 */
export function isConditionGroup(value: unknown): value is ConditionGroup {
  if (value === null || value === undefined || typeof value !== 'object')
    return false
  const t = (value as Record<string, unknown>).type
  return typeof t === 'string'
}
