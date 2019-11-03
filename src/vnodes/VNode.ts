import { removeSurroundingSlashes, mkdir, readdir } from '../utils'
import { join } from 'path'
import { StringOrStringArray } from '../types'

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

  async patchNode(path: string): Promise<void> {
    throw new Error('Not implemented')
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

  /** Write a directory and its children to the filesystem */
  async serialize(path: string) {
    const dir = join(path, this.name)
    await mkdir(dir, { recursive: true })

    await Promise.all(this.children.map(child => child.serialize(dir)))
  }

  async patchNode(path: string): Promise<void> {
    const dir = join(path, this.name)
    await mkdir(dir, { recursive: true })

    await Promise.all(this.children.map(child => child.patchNode(dir)))
  }
}

/** Recursively look for virtual nodes that conflict with actual files */
export async function findFileConflicts(basePath: string, directory: VDir) {
  const path = join(basePath, directory.name)

  let contents: Set<string>

  try {
    contents = new Set(await readdir(path))
  } catch (error) {
    // If we failed to read the base directory, there can be no conflicts
    return []
  }

  // A fuzzy test for VDirs
  // -> Takes into account a VDir from another package may fail an "instanceof"
  const isDir = (obj: any) => obj.constructor.name === 'VDir'

  // Create an array to put conflicting files in
  let conflits = new Array<string>()

  // Look through the directory's children to find conflicts
  for (let child of directory.children) {
    if (isDir(child)) {
      //
      // If the child is a directory, recurse and look at it's children
      //
      conflits.push(...(await findFileConflicts(path, child as VDir)))
    } else if (contents.has(child.name)) {
      //
      // If it isn't a directory, check if the file exists
      //
      conflits.push(join(path, child.name))
    }
  }

  // Return the conflics, if there were any
  return conflits
}
