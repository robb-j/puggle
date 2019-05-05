import { VDir, VConfigFile, VConfigType } from '../vnodes'
import { Pluginable, PluginArgs } from '../Puggle'
import prompts from 'prompts'
// import semver from 'semver'

type StringMap = {
  [idx: string]: string | undefined
}

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
  name: 'my-puggle-project',
  description: 'Setup with puggle',
  version: '0.0.0',
  private: true,
  main: 'src/index.js',
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

  constructor() {
    super('package.json', VConfigType.json, null)
    this.values = { ...defaultPackage }
  }
}

export class NpmPlugin implements Pluginable {
  version = '0.0.0'

  async extendVirtualFileSystem(root: VDir, { projectName }: PluginArgs) {
    let { packageName } = await prompts({
      type: 'text',
      name: 'packageName',
      message: 'package name',
      initial: projectName
    })

    let { repository } = await prompts({
      type: 'text',
      name: 'repository',
      message: 'git repository',
      hint: `$USERNAME/${projectName}`
    })

    let npmPackage = new VPackageJson()
    npmPackage.values.name = packageName
    npmPackage.values.repository = repository

    root.addChild(npmPackage)
  }
}
