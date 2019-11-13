import { VNode } from '../vnode'
import { VDir } from '../vdir'
import { ensureDir } from 'fs-extra'

jest.mock('fs-extra')

class SpyNode extends VNode {
  constructor(name: string) {
    super(name)
    this.writeToFile = jest.fn()
    this.patchFile = jest.fn()
  }
}

describe('VDir', () => {
  describe('#constructor', () => {
    it('should store its children', () => {
      let node = new VNode('node')
      let dir = new VDir('dir', [node])
      expect(dir.children).toContain(node)
    })

    it("should set the children's parent", () => {
      let node = new VNode('node')
      let dir = new VDir('dir', [node])
      expect(node.parent).toBe(dir)
    })
  })

  describe('#find', () => {
    it('should find a direct child node', () => {
      let node = new VNode('node')
      let dir = new VDir('dir', [node])

      let result = dir.find('node')
      expect(result).toBe(node)
    })

    it('should find nested children', () => {
      let node = new VNode('node')
      let dirC = new VDir('dir_c', [node])
      let dirB = new VDir('dir_b', [dirC])
      let dirA = new VDir('dir_a', [dirB])

      let result = dirA.find('dir_b/dir_c/node')
      expect(result).toBe(node)
    })
  })

  describe('#addChild', () => {
    it('should store the child', () => {
      let node = new VNode('node')
      let dir = new VDir('dir')

      dir.addChild(node)
      expect(dir.children).toContain(node)
    })

    it("should set the child's parent", () => {
      let node = new VNode('node')
      let dir = new VDir('dir')

      dir.addChild(node)
      expect(node.parent).toBe(dir)
    })
  })

  describe('#writeToFile', () => {
    it('should create the directory', async () => {
      let dir = new VDir('dir')

      await dir.writeToFile('root')

      expect(ensureDir).toBeCalledWith('root/dir')
    })

    it("should writeToFile children under the parent's path", async () => {
      let node = new SpyNode('spy_node')
      let dir = new VDir('dir', [node])

      await dir.writeToFile('root')

      expect(node.writeToFile).toHaveBeenCalledWith('root/dir')
    })
  })
})
