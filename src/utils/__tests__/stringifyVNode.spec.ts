import { stringifyVNode } from '../stringifyVNode'
import { VNode, VDir } from '../../vnodes'
import strip from 'strip-ansi'

class VCustomNode extends VNode {}

describe('#stringifyVNode', () => {
  it('should format a VNode', () => {
    let result = strip(stringifyVNode(new VNode('geoff')))
    expect(result).toMatch(/geoff VNode/)
  })

  it('should format a VDir', () => {
    let result = strip(
      stringifyVNode(
        new VDir('root', [
          new VNode('file_a'),
          new VDir('sub_dir', [new VNode('file_b')])
        ])
      )
    )

    expect(result).toMatch(/^root\/ VDir$/m)
    expect(result).toMatch(/^ └ file_a VNode$/m)
    expect(result).toMatch(/^ └ sub_dir\/ VDir$/m)
    expect(result).toMatch(/^   └ file_b VNode$/m)
  })

  it('should format custom nodes', () => {
    let result = strip(stringifyVNode(new VCustomNode('geoff')))
    expect(result).toMatch(/geoff VCustomNode/)
  })
})
