import { VDir, VPackageJson } from '../vnodes'
import { Plugin, PatchStrategy } from '../types'

export const jestPlugin: Plugin = {
  name: 'jest',
  version: '0.1.0',

  async apply(root, { hasPlugin }) {
    let npmPackage = VPackageJson.getOrFail(root)

    await npmPackage.addLatestDevDependencies({
      jest: '^24.7.1'
    })

    if (hasPlugin('typescript')) {
      npmPackage.addPatch('jest', PatchStrategy.persist, {
        preset: 'ts-jest',
        testEnvironment: 'node',
        testPathIgnorePatterns: ['/node_modules/', '/dist/']
      })

      await npmPackage.addLatestDevDependencies({
        'ts-jest': '^24.0.1',
        '@types/jest': '^24.0.11'
      })
    }

    npmPackage.addPatch('scripts.test', PatchStrategy.placeholder, 'jest')
    npmPackage.addPatch(
      'scripts.coverage',
      PatchStrategy.placeholder,
      'jest --coverage'
    )
  }
}
