import { VDir } from '../vnodes'
import { Pluginable, PluginArgs } from '../types'
import { VPackageJson } from './NpmPlugin'
import { TypeScriptPlugin } from './TypeScriptPlugin'

export class JestPlugin implements Pluginable {
  version = '0.1.0'

  async extendVirtualFileSystem(root: VDir, { hasPlugin }: PluginArgs) {
    let npmPackage = VPackageJson.getPackageOrFail(root)

    npmPackage.devDependencies['jest'] = '^24.7.1'

    if (hasPlugin(TypeScriptPlugin)) {
      npmPackage.values['jest'] = {
        preset: 'ts-jest',
        testEnvironment: 'node',
        testPathIgnorePatterns: ['/node_modules/', '/dist/']
      }

      await npmPackage.addDevDependencies({
        'ts-jest': '^24.0.1',
        '@types/jest': '^24.0.11'
      })
    }

    npmPackage.scripts['test'] = 'jest'
    npmPackage.scripts['coverage'] = 'jest --coverage'
  }
}
