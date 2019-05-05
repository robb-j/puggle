import { removeSurroundingSlashes, mkdir } from '../utils'
import { join } from 'path'

type StringOrStringArray = string | string[]

/**
 * The base class of virual filesystem nodes, doesn't do very much
 * Other things extend this and add functionality
 */
export class VNode {
  name: string
  parent?: VNode

  constructor(name: string) {
    this.name = removeSurroundingSlashes(name)
    Object.defineProperty(this, 'parent', { enumerable: false, writable: true })
  }

  async serialize(path: string): Promise<void> {}

  getRoot(): VDir | undefined {
    let node: VNode | undefined = this

    while (node.parent) node = node.parent

    return node instanceof VDir ? node : undefined
  }
}

/**
 * A virtual directory to hold more virtual nodes
 */
export class VDir extends VNode {
  children = new Array<VNode>()

  constructor(name: string, children = new Array<VNode>()) {
    super(name)
    this.children = children
    for (let child of children) child.parent = this
  }

  /** find a VNode under this directory using a path e.g. src/index.js */
  find(path: StringOrStringArray): VNode | null {
    let name: string
    let rest: string[]

    if (Array.isArray(path)) {
      ;[name, ...rest] = path
    } else {
      ;[name, ...rest] = removeSurroundingSlashes(path).split('/')
    }

    for (let child of this.children) {
      if (child.name !== name) continue
      if (rest.length === 0) return child
      return child instanceof VDir ? child.find(rest) : null
    }

    return null
  }

  /** add a child node to this directory */
  addChild(...nodes: VNode[]) {
    for (let node of nodes) {
      node.parent = this
      this.children.push(node)
    }
  }

  async serialize(path: string) {
    const dir = join(path, this.name)
    await mkdir(dir, { recursive: true })

    await Promise.all(this.children.map(child => child.serialize(dir)))
  }
}
