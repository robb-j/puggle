import { StringKeyed, PatchStrategy } from '../types'
import { VConfigFile, VConfigType } from './vconfig-file'
import { VDir } from './vdir'
import { sortObjectKeys, findLatestDependencies } from '../utils'

export interface NpmPackage {
  [idx: string]: any

  scripts: StringKeyed<string>
  dependencies: StringKeyed<string>
  devDependencies: StringKeyed<string>

  name?: string
  repository?: string
  author?: string
  main?: string
  license?: string
  engines?: StringKeyed<string>
}

export const defaultPackage = {
  name: '',
  description: '',
  version: '0.0.0',
  private: true,
  repository: '',
  author: '',
  license: 'MIT',
  scripts: {
    test: 'echo "Not implemented"; exit 1'
  },
  keywords: [],
  engines: { node: '>=8' } as StringKeyed,
  dependencies: {},
  devDependencies: {}
}

export class VPackageJson extends VConfigFile {
  values: NpmPackage

  static getOrFail(node: VDir): VPackageJson {
    let pkg = node.find('package.json')

    if (!pkg || !(pkg instanceof VPackageJson)) {
      throw new Error('No package.json')
    }

    return pkg
  }

  constructor() {
    super('package.json', VConfigType.json, null, {
      strategy: PatchStrategy.persist
    })
    this.values = { ...defaultPackage }
  }

  writeToFile(path: string) {
    this.values.dependencies = sortObjectKeys(this.values.dependencies)
    this.values.devDependencies = sortObjectKeys(this.values.devDependencies)
    this.values.scripts = sortObjectKeys(this.values.scripts)

    return super.writeToFile(path)
  }

  async addLatestDependencies(dependencies: StringKeyed) {
    this.addPatch(
      'dependencies',
      PatchStrategy.persist,
      await findLatestDependencies(dependencies)
    )
  }

  async addLatestDevDependencies(dependencies: StringKeyed) {
    this.addPatch(
      'devDependencies',
      PatchStrategy.persist,
      await findLatestDependencies(dependencies)
    )
  }
}
