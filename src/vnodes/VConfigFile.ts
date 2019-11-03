import Yaml from 'yaml'

import { trimInlineTemplate } from '../utils'
import { VFile } from './VFile'
import { PatchMode } from '../types'
import fs from 'fs'
import { join } from 'path'
import { promisify } from 'util'

import get from 'lodash.get'
import set from 'lodash.set'
import merge from 'lodash.merge'
import clone from 'lodash.clonedeep'

const readFile = promisify(fs.readFile)
const writeFile = promisify(fs.writeFile)

/**
 * The supported types of config files
 */
export enum VConfigType {
  json = 'json',
  yaml = 'yaml'
}

export interface VConfigPatch {
  path: string
  data: any
  mode: PatchMode
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
  patches: VConfigPatch[]

  constructor(
    name: string,
    type: VConfigType,
    values: any,
    args: { comment?: string; patch?: PatchMode } = {}
  ) {
    super(name, '', args.patch)
    this.type = type
    this.values = values
    this.comment = args.comment
    this.patches = []
  }

  addPatch(path: string, mode: PatchMode, data: any) {
    this.patches.push({ path, mode, data })
  }

  render(type: VConfigType, values: any, comment: string = this.name) {
    let start = trimInlineTemplate`
      #
      # ${comment}
      #
      
    `

    switch (type) {
      case VConfigType.json:
        return JSON.stringify(values, null, 2)
      case VConfigType.yaml:
        return start + Yaml.stringify(values)
    }
  }

  prepareContents() {
    return this.render(this.type, this.values, this.comment)
  }

  // patchFile(raw: string) {
  //   if (this.patch === PatchMode.placeholder) return raw

  //   const data = Yaml.parse(raw)

  //   return this.render(
  //     this.type,
  //     merge.recursive(true, data, this.values),
  //     this.comment
  //   )
  // }

  async patchNode(basePath: string) {
    if (this.patch === PatchMode.placeholder) return

    let path = join(basePath, this.name)

    let conf = Yaml.parse(await readFile(path, 'utf8'))

    let mergedValues = clone(this.values)

    const isPrimative = (v: any) =>
      ['string', 'number', 'boolean'].some(type => typeof v === type)

    for (let patch of this.patches) {
      if (patch.mode === PatchMode.placeholder) continue

      let value = get(mergedValues, patch.path)
      if (!value) {
        //
        // Just set the value if it doesn't already exist
        //
        set(mergedValues, patch.path, patch.data)
      } else if (typeof patch.data === 'object' && typeof value === 'object') {
        //
        // Attempt to merge objects (and arrays?)
        //
        merge(value, patch.data)
        // set(mergedValues, patch.path, newValue)
      } else if (isPrimative(value) && isPrimative(patch.data)) {
        //
        // Just set primatives (string, number, boolean)
        //
        set(mergedValues, patch.path, patch.data)
      } else {
        console.log(`Cannot merge ${typeof value} and ${typeof patch.data}`)
      }
    }

    // Serialize the updated values here ...
    return writeFile(path, this.render(this.type, mergedValues, this.comment))
  }
}
