import { join } from 'path'
import { writeFile } from 'fs-extra'

import { VNode } from './vnode'
import { PatchStrategy } from '../types'

/**
 * A virtual file
 *
 * Ideas:
 * - The contents could be set based on the result of some template
 */
export class VFile extends VNode {
  contents: string
  strategy: PatchStrategy

  constructor(
    name: string,
    contents: string = '',
    strategy = PatchStrategy.persist
  ) {
    super(name)
    this.contents = contents
    this.strategy = strategy
  }

  prepareContents(): string {
    return this.contents
  }

  async writeToFile(basePath: string) {
    const path = join(basePath, this.name)
    return writeFile(path, this.prepareContents())
  }

  async patchFile(basePath: string) {
    if (this.strategy === PatchStrategy.persist) {
      return this.writeToFile(basePath)
    }
  }
}
