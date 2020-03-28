import { join } from 'path'

import { readFile, writeFile } from 'fs-extra'
import Yaml from 'yaml'

import get from 'lodash.get'
import set from 'lodash.set'
import merge from 'lodash.merge'
import clone from 'lodash.clonedeep'

import { trimInlineTemplate } from '../utils'
import { VFile } from './vfile'
import { PatchStrategy } from '../types'

/**
 * The supported types of config files
 */
export enum VConfigType {
  json = 'json',
  yaml = 'yaml',
}

export interface VConfigPatch {
  path: string
  data: any
  strategy: PatchStrategy
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

  static render(type: VConfigType, values: any, comment?: string) {
    let start = trimInlineTemplate`
      #
      # ${comment}
      #
      
    `

    switch (type) {
      case VConfigType.json:
        return JSON.stringify(values, null, 2)
      case VConfigType.yaml:
        return (comment ? start : '') + Yaml.stringify(values)
    }
  }

  static applyPatches(values: any, patches: VConfigPatch[]) {
    let mergedValues = clone(values)

    const isPrimative = (v: any) =>
      ['string', 'number', 'boolean'].some((type) => typeof v === type)

    for (let patch of patches) {
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
        console.log(`Cannot merge '${typeof value}' and '${typeof patch.data}'`)
      }
    }

    return mergedValues
  }

  constructor(
    name: string,
    type: VConfigType,
    values: any,
    args: { comment?: string; strategy?: PatchStrategy } = {}
  ) {
    super(name, '', args.strategy)
    this.type = type
    this.values = values
    this.comment = args.comment
    this.patches = []
  }

  addPatch(path: string, strategy: PatchStrategy, data: any) {
    this.patches.push({ path, strategy, data })
  }

  prepareContents() {
    return VConfigFile.render(
      this.type,
      VConfigFile.applyPatches(this.values, this.patches),
      this.comment
    )
  }

  async patchFile(basePath: string) {
    if (this.strategy === PatchStrategy.placeholder) return

    let path = join(basePath, this.name)

    let values = Yaml.parse(await readFile(path, 'utf8'))

    let mergedValues = VConfigFile.applyPatches(
      values,
      this.patches.filter((p) => p.strategy === PatchStrategy.persist)
    )

    // Serialize the updated values here ...
    return writeFile(
      path,
      VConfigFile.render(this.type, mergedValues, this.comment)
    )
  }
}
