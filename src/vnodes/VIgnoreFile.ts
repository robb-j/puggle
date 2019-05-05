import { VFile } from './VFile'
import { trimInlineTemplate } from '../utils'

/**
 * A virtual ignore file, i.e. a .gitignore
 */
export class VIgnoreFile extends VFile {
  rules: string[]
  description: string

  constructor(name: string, description: string = name, rules: string[] = []) {
    super(name)
    this.description = description
    this.rules = rules
  }

  prepareContents() {
    return trimInlineTemplate`
      #
      # ${this.description}
      #
      
      ${this.rules.join('\n')}
    `
  }
}
