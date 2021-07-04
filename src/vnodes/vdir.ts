import { join } from 'path'

import { VNode } from './vnode'
import { trimSlashes } from '../utils'

import { ensureDir } from 'fs-extra'

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
  find(path: string | string[]): VNode | null {
    let name: string
    let rest: string[]

    if (Array.isArray(path)) {
      ;[name, ...rest] = path
    } else {
      ;[name, ...rest] = trimSlashes(path).split('/')
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

  /** Write a directory and its children to the filesystem */
  async writeToFile(basePath: string) {
    const dir = join(basePath, this.name)
    await ensureDir(dir)

    await Promise.all(this.children.map((child) => child.writeToFile(dir)))
  }

  async patchFile(basePath: string): Promise<void> {
    const dir = join(basePath, this.name)
    await ensureDir(dir)

    await Promise.all(this.children.map((child) => child.patchFile(dir)))
  }
}
