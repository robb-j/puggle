import { stringifyVNode } from '../stringify-vnode'
import { VNode, VDir } from '../../vnodes'
import pc from 'picocolors'

class VCustomNode extends VNode {}

beforeAll(() => {
  process.env.NO_COLOR = 'true'
})

describe('#stringifyVNode', () => {
  it('should format a VNode', () => {
    let result = stringifyVNode(new VNode('geoff'))
    expect(result).toMatch(/geoff VNode/)
  })

  it('should format a VDir', () => {
    let result = stringifyVNode(
      new VDir('root', [
        new VNode('file_a'),
        new VDir('sub_dir', [new VNode('file_b')]),
      ])
    )

    expect(result).toMatch(/^root\/ VDir$/m)
    expect(result).toMatch(/^ └ file_a VNode$/m)
    expect(result).toMatch(/^ └ sub_dir\/ VDir$/m)
    expect(result).toMatch(/^   └ file_b VNode$/m)
  })

  it('should format custom nodes', () => {
    let result = stringifyVNode(new VCustomNode('geoff'))
    expect(result).toMatch(/geoff VCustomNode/)
  })
})
