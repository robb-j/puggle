import { VDir, VConfigFile, VConfigType } from '../vnodes'
import { Pluginable, PluginArgs } from '../types'
import { sortObjectKeys } from '../utils'
import got from 'got'
import semver from 'semver'

type StringMap = {
  [idx: string]: string | undefined
}

const promptOptions = {
  onCancel: () => process.exit(1)
}

const REGISTRY_URL = 'https://registry.npmjs.org/'

export type NPMPackage = {
  [idx: string]: any

  scripts: StringMap
  dependencies: StringMap
  devDependencies: StringMap

  name?: string
  repository?: string
  author?: string
  main?: string
  license?: string
  engines?: StringMap
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
  engines: { node: '>=8' } as StringMap,
  dependencies: {},
  devDependencies: {}
}

export class VPackageJson extends VConfigFile {
  values: NPMPackage

  get scripts() {
    return this.values.scripts
  }

  get dependencies() {
    return this.values.dependencies
  }

  get devDependencies() {
    return this.values.devDependencies
  }

  static getPackageOrFail(node: VDir): VPackageJson {
    let pkg = node.find('package.json')

    if (!pkg || !(pkg instanceof VPackageJson)) {
      throw new Error('No package.json')
    }

    return pkg
  }

  static async getDependencies(dependencies: StringMap) {
    const promises = Object.keys(dependencies).map(async key => {
      return {
        [key]: await this.getVersion(key, dependencies[key]!)
      }
    })

    const versions = await Promise.all(promises)

    return versions.reduce((map, dep) => Object.assign(map, dep), {})
  }

  static async getVersion(
    packageName: string,
    semverRange: string
  ): Promise<string> {
    const npmPackage = await got(REGISTRY_URL + packageName, { json: true })

    const allMatches = Object.keys(npmPackage.body.versions).filter(version =>
      semver.satisfies(version, semverRange)
    )

    if (allMatches.length === 0) {
      throw new Error()
    }

    allMatches.sort((a, b) => {
      if (semver.eq(a, b)) return 0
      else if (semver.gt(a, b)) return -1
      else return 1
    })

    return allMatches[0]
  }

  constructor() {
    super('package.json', VConfigType.json, null)
    this.values = { ...defaultPackage }
  }

  serialize(path: string) {
    this.values.dependencies = sortObjectKeys(this.values.dependencies)
    this.values.devDependencies = sortObjectKeys(this.values.devDependencies)
    this.values.scripts = sortObjectKeys(this.values.scripts)

    return super.serialize(path)
  }

  async addDependencies(dependencies: StringMap) {
    Object.assign(
      this.dependencies,
      await VPackageJson.getDependencies(dependencies)
    )
  }

  async addDevDependencies(dependencies: StringMap) {
    Object.assign(
      this.devDependencies,
      await VPackageJson.getDependencies(dependencies)
    )
  }
}

export class NpmPlugin implements Pluginable {
  version = '0.1.0'

  async extendVirtualFileSystem(
    root: VDir,
    { projectName, puggle }: PluginArgs
  ) {
    let { packageName, packageInfo } = await puggle.askQuestions('npm', [
      {
        type: 'text',
        name: 'packageName',
        message: 'package name',
        initial: projectName
      },
      {
        type: 'text',
        name: 'packageInfo',
        message: 'description',
        initial: 'Setup with puggle'
      }
    ])

    let { repository } = await puggle.askQuestions('npm', [
      {
        type: 'text',
        name: 'repository',
        message: 'git repository',
        initial: ''
      }
    ])

    let npmPackage = new VPackageJson()
    npmPackage.values.name = packageName
    npmPackage.values.description = packageInfo
    npmPackage.values.repository = repository

    root.addChild(npmPackage)

    puggle.storePluginParams('npm', {
      packageName,
      packageInfo,
      repository
    })
  }
}
