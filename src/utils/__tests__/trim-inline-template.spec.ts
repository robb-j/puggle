import { trimInlineTemplate } from '../trim-inline-template'

describe('#trimInlineTemplate', () => {
  it('should trim preceeding lines', () => {
    let result = trimInlineTemplate`
      A
      B
      C
    `
    expect(result).toBe('A\nB\nC\n')
  })

  it('should keep internal nesting', () => {
    let result = trimInlineTemplate`
      A
        B
        C
    `
    expect(result).toBe('A\n  B\n  C\n')
  })

  it('should preserve indent type', () => {
    let result = trimInlineTemplate`
      A
      ${'\t'}B
      ${'\t'}C
    `
    expect(result).toBe('A\n\tB\n\tC\n')
  })
})
