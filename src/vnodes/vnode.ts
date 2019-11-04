import { trimSlashes } from '../utils'

/**
 * The base class of virual filesystem nodes, doesn't do very much
 * Other things extend this and add functionality
 */
export class VNode {
  name: string
  parent?: VNode

  constructor(name: string) {
    this.name = trimSlashes(name)
    Object.defineProperty(this, 'parent', { enumerable: false, writable: true })
  }

  async writeToFile(path: string): Promise<void> {
    throw new Error('Not implemented')
  }

  async patchFile(path: string): Promise<void> {
    throw new Error('Not implemented')
  }
}
