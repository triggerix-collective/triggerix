import { validateExpression, validateExprNode, validateExprOperand } from '@triggerix/validator'
import { describe, expect, it } from 'vitest'

describe('validateExpression', () => {
  it('should accept a valid wrapped expression', () => {
    const result = validateExpression({
      $expr: { type: 'binary', operator: '+', left: 1, right: 2 }
    })
    expect(result.valid).toBe(true)
  })

  it('should reject null', () => {
    const result = validateExpression(null)
    expect(result.valid).toBe(false)
    expect(result.errors[0].path).toBe('expression')
    expect(result.errors[0].message).toBe('Expression must be an object')
  })

  it('should reject non-object', () => {
    const result = validateExpression('string')
    expect(result.valid).toBe(false)
    expect(result.errors[0].path).toBe('expression')
  })

  it('should reject object missing $expr', () => {
    const result = validateExpression({ foo: 'bar' })
    expect(result.valid).toBe(false)
    expect(result.errors[0].path).toBe('expression')
    expect(result.errors[0].message).toContain('$expr')
  })

  it('should propagate errors from $expr node', () => {
    const result = validateExpression({ $expr: { type: 'unknown' } })
    expect(result.valid).toBe(false)
    expect(result.errors[0].path).toBe('expression.$expr.type')
  })
})

describe('validateExprNode', () => {
  describe('basic structural', () => {
    it('should reject null', () => {
      const result = validateExprNode(null)
      expect(result.valid).toBe(false)
      expect(result.errors[0].path).toBe('expr')
      expect(result.errors[0].message).toBe('ExprNode must be an object')
    })

    it('should reject node without type', () => {
      const result = validateExprNode({})
      expect(result.valid).toBe(false)
      expect(result.errors[0].path).toBe('expr.type')
    })

    it('should reject unknown type', () => {
      const result = validateExprNode({ type: 'mystery' })
      expect(result.valid).toBe(false)
      expect(result.errors[0].path).toBe('expr.type')
      expect(result.errors[0].message).toContain('Unknown ExprNode type')
    })
  })

  describe('binary', () => {
    it('should accept valid binary expression', () => {
      const result = validateExprNode({ type: 'binary', operator: '+', left: 1, right: 2 })
      expect(result.valid).toBe(true)
    })

    it('should reject invalid operator', () => {
      const result = validateExprNode({ type: 'binary', operator: '^', left: 1, right: 2 })
      expect(result.valid).toBe(false)
      expect(result.errors.some(e => e.path === 'expr.operator')).toBe(true)
    })

    it('should reject missing left', () => {
      const result = validateExprNode({ type: 'binary', operator: '+', right: 2 })
      expect(result.valid).toBe(false)
      expect(result.errors.some(e => e.path === 'expr.left')).toBe(true)
    })

    it('should reject missing right', () => {
      const result = validateExprNode({ type: 'binary', operator: '+', left: 1 })
      expect(result.valid).toBe(false)
      expect(result.errors.some(e => e.path === 'expr.right')).toBe(true)
    })
  })

  describe('unary', () => {
    it('should accept valid unary expression', () => {
      const result = validateExprNode({ type: 'unary', operator: '!', operand: true })
      expect(result.valid).toBe(true)
    })

    it('should reject invalid operator', () => {
      const result = validateExprNode({ type: 'unary', operator: '~', operand: 1 })
      expect(result.valid).toBe(false)
      expect(result.errors.some(e => e.path === 'expr.operator')).toBe(true)
    })

    it('should reject missing operand', () => {
      const result = validateExprNode({ type: 'unary', operator: '!' })
      expect(result.valid).toBe(false)
      expect(result.errors.some(e => e.path === 'expr.operand')).toBe(true)
    })
  })

  describe('compare', () => {
    it('should accept valid compare expression', () => {
      const result = validateExprNode({ type: 'compare', operator: 'eq', left: 1, right: 1 })
      expect(result.valid).toBe(true)
    })

    it('should reject invalid operator', () => {
      const result = validateExprNode({ type: 'compare', operator: 'exists', left: 1, right: 1 })
      expect(result.valid).toBe(false)
      const err = result.errors.find(e => e.path === 'expr.operator')
      expect(err?.type).toBe('semantic')
    })

    it('should reject missing left', () => {
      const result = validateExprNode({ type: 'compare', operator: 'eq', right: 1 })
      expect(result.valid).toBe(false)
      expect(result.errors.some(e => e.path === 'expr.left')).toBe(true)
    })

    it('should reject missing right', () => {
      const result = validateExprNode({ type: 'compare', operator: 'eq', left: 1 })
      expect(result.valid).toBe(false)
      expect(result.errors.some(e => e.path === 'expr.right')).toBe(true)
    })
  })

  describe('logical', () => {
    it('should accept valid logical expression', () => {
      const result = validateExprNode({
        type: 'logical',
        operator: 'and',
        operands: [true, false]
      })
      expect(result.valid).toBe(true)
    })

    it('should reject invalid operator', () => {
      const result = validateExprNode({
        type: 'logical',
        operator: 'xor',
        operands: [true]
      })
      expect(result.valid).toBe(false)
      expect(result.errors.some(e => e.path === 'expr.operator')).toBe(true)
    })

    it('should reject when operands is not an array', () => {
      const result = validateExprNode({
        type: 'logical',
        operator: 'and',
        operands: 'oops'
      })
      expect(result.valid).toBe(false)
      expect(result.errors.some(e => e.path === 'expr.operands')).toBe(true)
    })
  })

  describe('call', () => {
    it('should accept valid call expression', () => {
      const result = validateExprNode({ type: 'call', name: 'sum', args: [1, 2] })
      expect(result.valid).toBe(true)
    })

    it('should reject missing name', () => {
      const result = validateExprNode({ type: 'call', args: [] })
      expect(result.valid).toBe(false)
      expect(result.errors.some(e => e.path === 'expr.name')).toBe(true)
    })

    it('should reject empty string name', () => {
      const result = validateExprNode({ type: 'call', name: '', args: [] })
      expect(result.valid).toBe(false)
      expect(result.errors.some(e => e.path === 'expr.name')).toBe(true)
    })

    it('should reject when args is not an array', () => {
      const result = validateExprNode({ type: 'call', name: 'fn', args: 'oops' })
      expect(result.valid).toBe(false)
      expect(result.errors.some(e => e.path === 'expr.args')).toBe(true)
    })
  })

  describe('concat', () => {
    it('should accept valid concat expression', () => {
      const result = validateExprNode({ type: 'concat', values: ['a', 'b'] })
      expect(result.valid).toBe(true)
    })

    it('should reject when values is not an array', () => {
      const result = validateExprNode({ type: 'concat', values: 'nope' })
      expect(result.valid).toBe(false)
      expect(result.errors.some(e => e.path === 'expr.values')).toBe(true)
    })

    it('should propagate operand errors', () => {
      const result = validateExprNode({ type: 'concat', values: [null] })
      expect(result.valid).toBe(false)
      expect(result.errors.some(e => e.path === 'expr.values[0]')).toBe(true)
    })
  })

  describe('ternary', () => {
    it('should accept valid ternary expression', () => {
      const result = validateExprNode({
        type: 'ternary',
        test: true,
        consequent: 1,
        alternate: 2
      })
      expect(result.valid).toBe(true)
    })

    it('should reject missing test', () => {
      const result = validateExprNode({
        type: 'ternary',
        consequent: 1,
        alternate: 2
      })
      expect(result.valid).toBe(false)
      expect(result.errors.some(e => e.path === 'expr.test')).toBe(true)
    })

    it('should reject missing consequent', () => {
      const result = validateExprNode({
        type: 'ternary',
        test: true,
        alternate: 2
      })
      expect(result.valid).toBe(false)
      expect(result.errors.some(e => e.path === 'expr.consequent')).toBe(true)
    })

    it('should reject missing alternate', () => {
      const result = validateExprNode({
        type: 'ternary',
        test: true,
        consequent: 1
      })
      expect(result.valid).toBe(false)
      expect(result.errors.some(e => e.path === 'expr.alternate')).toBe(true)
    })
  })
})

describe('validateExprOperand', () => {
  describe('literals', () => {
    it('should accept string literal', () => {
      expect(validateExprOperand('hello').valid).toBe(true)
    })

    it('should accept number literal', () => {
      expect(validateExprOperand(42).valid).toBe(true)
    })

    it('should accept boolean literal', () => {
      expect(validateExprOperand(true).valid).toBe(true)
      expect(validateExprOperand(false).valid).toBe(true)
    })
  })

  describe('references', () => {
    it('should accept valid reference', () => {
      const result = validateExprOperand({ $ref: 'user.name' })
      expect(result.valid).toBe(true)
    })

    it('should reject empty $ref', () => {
      const result = validateExprOperand({ $ref: '' })
      expect(result.valid).toBe(false)
      expect(result.errors[0].path).toBe('operand.$ref')
    })

    it('should reject non-string $ref', () => {
      const result = validateExprOperand({ $ref: 123 })
      expect(result.valid).toBe(false)
      expect(result.errors[0].path).toBe('operand.$ref')
    })
  })

  describe('expr nodes', () => {
    it('should accept a nested ExprNode', () => {
      const result = validateExprOperand({
        type: 'binary',
        operator: '+',
        left: 1,
        right: 2
      })
      expect(result.valid).toBe(true)
    })

    it('should propagate ExprNode errors', () => {
      const result = validateExprOperand({ type: 'binary', operator: '+', left: 1 })
      expect(result.valid).toBe(false)
      expect(result.errors.some(e => e.path === 'operand.right')).toBe(true)
    })
  })

  describe('invalid operands', () => {
    it('should reject null', () => {
      const result = validateExprOperand(null)
      expect(result.valid).toBe(false)
      expect(result.errors[0].path).toBe('operand')
    })

    it('should reject undefined', () => {
      const result = validateExprOperand(undefined)
      expect(result.valid).toBe(false)
      expect(result.errors[0].path).toBe('operand')
    })

    it('should reject object without $ref or type', () => {
      const result = validateExprOperand({ foo: 'bar' })
      expect(result.valid).toBe(false)
      expect(result.errors[0].path).toBe('operand')
      expect(result.errors[0].message).toContain('literal, reference')
    })
  })
})
