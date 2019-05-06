import Yaml from 'yaml'
import nestedGet from 'lodash.get'
import nestedSet from 'lodash.set'

import { trimInlineTemplate } from '../utils'
import { VFile } from './VFile'

/**
 * The supported types of config files
 */
export enum VConfigType {
  json,
  yaml
}

/**
 * A virtual config file, a file with some potentially updatable data
 *
 * Ideas:
 * - Provide merging / updating so plugins can alter configs if they want
 */
export class VConfigFile extends VFile {
  values: any
  type: VConfigType
  comment?: string

  constructor(
    name: string,
    type: VConfigType,
    values: any,
    args: { comment?: string } = {}
  ) {
    super(name)
    this.type = type
    this.values = values
    this.comment = args.comment
  }

  prepareContents() {
    let comment = trimInlineTemplate`
    #
    # ${this.comment || this.name}
    #
    
    `

    switch (this.type) {
      case VConfigType.json:
        return JSON.stringify(this.values, null, 2)
      case VConfigType.yaml:
        return comment + Yaml.stringify(this.values)
    }
  }

  read(path: string) {
    return nestedGet(this.values, path)
  }

  write(path: string, value: any) {
    return nestedSet(this.values, path, value)
  }
}