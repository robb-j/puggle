import { VDir, VConfig, VConfigType } from '../VNode'
import { Pluginable, PluginArgs } from '../Pluginable'
import { VPackageJson } from './NPMPlugin'

export const defaultJestrc = {}

export const typescriptJestrc = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testPathIgnorePatterns: ['/node_modules/', '/dist/']
}

export class JestPlugin implements Pluginable {
  version = '0.0.0'

  async extendVirtualFileSystem(root: VDir, args: PluginArgs) {
    let npmPackage = VPackageJson.getPackageOrFail(root)

    // Check for typescript
    // let tsconfig = root.find('tsconfig.json') as VConfig

    npmPackage.dependencies['jest'] = '^24.1.0'
  }
}
