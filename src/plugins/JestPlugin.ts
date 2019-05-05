import { VDir } from '../vnodes'
import { Pluginable, PluginArgs } from '../Puggle'
import { VPackageJson } from './NPMPlugin'
import { TypescriptPlugin } from './TypescriptPlugin'

export class JestPlugin implements Pluginable {
  version = '0.0.0'

  async extendVirtualFileSystem(root: VDir, { puggle }: PluginArgs) {
    let npmPackage = VPackageJson.getPackageOrFail(root)

    npmPackage.dependencies['jest'] = '^24.1.0'

    if (puggle.hasPlugin(TypescriptPlugin)) {
      npmPackage.values['jest'] = {
        preset: 'ts-jest',
        testEnvironment: 'node',
        testPathIgnorePatterns: ['/node_modules/', '/dist/']
      }

      npmPackage.devDependencies['ts-jest'] = '^24.0.1'
      npmPackage.devDependencies['@types/jest'] = '^24.0.6'
    }

    npmPackage.scripts['test'] = 'jest'
    npmPackage.scripts['coverage'] = 'jest --coverage'
  }
}
