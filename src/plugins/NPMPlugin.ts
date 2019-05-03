import { VDir, VConfig, VConfigType } from '../VNode'
import { Pluginable, PluginArgs } from '../Pluginable'
import prompts from 'prompts'
import semver from 'semver'

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

export class VPackageJson extends VConfig {
  contents: NPMPackage

  constructor() {
    super('package.json', VConfigType.json, null)
    this.contents = { ...defaultPackage }
  }
}

export class NPMPlugin implements Pluginable {
  version = '0.0.0'

  async extendVirtualFileSystem(root: VDir, { dirname }: PluginArgs) {
    let { name } = await prompts({
      type: 'text',
      name: 'name',
      message: 'package name',
      initial: dirname
    })

    let { repository } = await prompts({
      type: 'text',
      name: 'repository',
      message: 'git repository',
      initial: name
    })

    let npmPackage = new VPackageJson()
    npmPackage.contents.name = name
    npmPackage.contents.repository = repository

    root.children.push(npmPackage)
  }
}
