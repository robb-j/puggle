import { join } from 'path'
import { readFile, writeFile } from 'fs-extra'

import { VFile } from './vfile'
import { trimInlineTemplate } from '../utils'
import { PatchStrategy } from '../types'

/**
 * A virtual ignore file, i.e. a .gitignore
 */
export class VIgnoreFile extends VFile {
  rules: string[]
  description: string

  static render(description: string, rules: string[]) {
    return trimInlineTemplate`
      #
      # ${description}
      #
      
      ${rules.join('\n')}
    `
  }

  static readRules(file: string) {
    const isRule = (line: string) => {
      return !line.startsWith('#') && line.length > 0
    }

    return file.split('\n').filter(t => isRule(t.trim()))
  }

  constructor(
    name: string,
    description: string = name,
    rules: string[] = [],
    strategy?: PatchStrategy
  ) {
    super(name, '', strategy)
    this.description = description
    this.rules = rules
  }

  prepareContents() {
    return VIgnoreFile.render(this.description, this.rules)
  }

  async patchFile(basePath: string) {
    if (this.strategy === PatchStrategy.placeholder) return

    const path = join(basePath, this.name)

    const contents = await readFile(path, 'utf8')

    const mergedRules = new Set<string>([
      ...this.rules,
      ...VIgnoreFile.readRules(contents)
    ])

    await writeFile(
      path,
      VIgnoreFile.render(this.description, Array.from(mergedRules))
    )
  }
}
