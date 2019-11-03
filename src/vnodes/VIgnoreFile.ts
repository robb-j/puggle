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

  render(description: string, rules: string[]) {
    return trimInlineTemplate`
    #
    # ${description}
    #
    
    ${rules.join('\n')}
  `
  }

  prepareContents() {
    return this.render(this.description, this.rules)
  }

  patchFile(data: string) {
    const rules = new Set<string>()

    for (let line of data.split('\n')) {
      if (line.trimLeft().startsWith('#')) continue
      rules.add(line)
    }

    return this.render(this.description, Array.from(rules))
  }
}
