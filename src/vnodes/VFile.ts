import { VNode } from './VNode'
import { writeFile } from '../utils'
import { join } from 'path'

/**
 * A virtual file
 *
 * Ideas:
 * - The contents could be set based on the result of some template
 */
export class VFile extends VNode {
  contents: string

  constructor(name: string, contents: string = '') {
    super(name)
    this.contents = contents
  }

  prepareContents(): string {
    return this.contents
  }

  serialize(path: string) {
    // TODO: Merge logic ...
    return writeFile(join(path, this.name), this.prepareContents())
  }
}
