import { VNode } from './VNode'
import { writeFile } from '../utils'
import { PatchMode } from '../types'
import { join } from 'path'

/**
 * A virtual file
 *
 * Ideas:
 * - The contents could be set based on the result of some template
 */
export class VFile extends VNode {
  contents: string
  patch: PatchMode

  constructor(name: string, contents: string = '', patch = PatchMode.persist) {
    super(name)
    this.contents = contents
    this.patch = patch
  }

  prepareContents(): string {
    return this.contents
  }

  serialize(path: string) {
    // TODO: Merge logic ...
    return writeFile(join(path, this.name), this.prepareContents())
  }

  async patchNode(path: string) {
    if (this.patch === PatchMode.persist) {
      return this.serialize(path)
    }
  }
}
