import { mocked } from 'ts-jest/utils'
import { VNode } from '../vnode'

describe('VNode', () => {
  describe('#constructor', () => {
    it('should set the name', () => {
      let node = new VNode('test')
      expect(node.name).toBe('test')
    })

    it('should make the parent un-enumerable', () => {
      let node = new VNode('test')
      let props = Object.getOwnPropertyDescriptor(node, 'parent')
      expect(props).toHaveProperty('enumerable', false)
    })

    it('should sanitize path names', () => {
      let node = new VNode('/test/')
      expect(node.name).toBe('test')
    })
  })
})
