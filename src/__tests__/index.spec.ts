import * as exported from '../index'

describe('Exported Modules', () => {
  it('should export plugins', () => {
    expect(exported.DockerPlugin).toBeDefined()
  })

  it('should export utils', () => {
    expect(exported.lastDirectory).toBeDefined()
  })

  it('should export vnodes', () => {
    expect(exported.VNode).toBeDefined()
  })

  it('should export Puggle', () => {
    expect(exported.Puggle).toBeDefined()
  })
})
