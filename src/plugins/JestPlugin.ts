import { VDir } from '../vnodes'
import { Pluginable, PluginArgs } from '../types'
import { VPackageJson } from './NpmPlugin'
import { TypescriptPlugin } from './TypescriptPlugin'

export class JestPlugin implements Pluginable {
  version = '0.0.0'

  async extendVirtualFileSystem(root: VDir, { hasPlugin }: PluginArgs) {
    let npmPackage = VPackageJson.getPackageOrFail(root)

    npmPackage.devDependencies['jest'] = '^24.7.1'

    if (hasPlugin(TypescriptPlugin)) {
      npmPackage.values['jest'] = {
        preset: 'ts-jest',
        testEnvironment: 'node',
        testPathIgnorePatterns: ['/node_modules/', '/dist/']
      }

      npmPackage.devDependencies['ts-jest'] = '^24.0.1'
      npmPackage.devDependencies['@types/jest'] = '^24.0.11'
    }

    npmPackage.scripts['test'] = 'jest'
    npmPackage.scripts['coverage'] = 'jest --coverage'
  }
}
