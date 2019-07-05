import { mocked } from 'ts-jest/utils'
import { VNode, VDir, findFileConflicts } from '../VNode'
import { mkdir, readdir } from '../../utils/promisified'

jest.mock('../../utils/promisified')

class SpyNode extends VNode {
  constructor(name: string) {
    super(name)
    this.serialize = jest.fn()
  }
}

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

describe('VDir', () => {
  // let nodeA: VNode, nodeB: VNode, nodeC: VNode
  // beforeEach(() => {
  //   nodeA = new VNode('node_a')
  //   nodeB = new VNode('node_b')
  //   nodeC = new VNode('node_c')
  // })
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

  describe('#serialize', () => {
    it('should create the directory', async () => {
      let dir = new VDir('dir')

      await dir.serialize('root')

      expect(mkdir).toBeCalledWith(
        'root/dir',
        expect.objectContaining({ recursive: true })
      )
    })

    it("should serialize children under the parent's path", async () => {
      let node = new SpyNode('spy_node')
      let dir = new VDir('dir', [node])

      await dir.serialize('root')

      expect(node.serialize).toHaveBeenCalledWith('root/dir')
    })
  })
})

describe('#findFileConflicts', () => {
  it('should return vnodes that conflict with files', async () => {
    mocked(readdir as any).mockResolvedValueOnce([
      'script.js',
      'src',
      'some.css'
    ])
    mocked(readdir as any).mockResolvedValueOnce(['index.js'])

    let dir = new VDir('root', [
      new VNode('script.js'),
      new VDir('src', [new VNode('index.js')])
    ])

    let conflicts = await findFileConflicts('.', dir)

    expect(conflicts).toContain('root/script.js')
    expect(conflicts).toContain('root/src/index.js')
  })
})
