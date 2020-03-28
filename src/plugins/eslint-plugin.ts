import { VConfigType, VConfigFile, VPackageJson } from '../vnodes'
import { Plugin, PatchStrategy } from '../types'

export const eslintPlugin: Plugin = {
  name: 'eslint',
  version: '0.1.0',

  async apply(root, { hasPlugin }) {
    let npmPackage = VPackageJson.getOrFail(root)

    await npmPackage.addLatestDevDependencies({
      eslint: '^5.14.0',
      'eslint-config-standard': '^12.0.0',
      'eslint-plugin-import': '^2.16.0',
      'eslint-plugin-node': '^8.0.1',
      'eslint-plugin-promise': '^4.0.1',
      'eslint-plugin-standard': '^4.0.0',
    })

    let conf = {
      root: true,
      parserOptions: {
        sourceType: 'module',
        ecmaVersion: 2018,
      },
      env: {
        node: true,
      } as any,
      extends: ['standard'],
    }

    // Tweak ourself if prettier is also being used
    if (hasPlugin('prettier')) {
      // Add the eslint-config-prettier extension
      await npmPackage.addLatestDevDependencies({
        'eslint-config-prettier': '^4.0.0',
      })

      // Add prettier usage to the config
      conf.extends.push('prettier', 'prettier/standard')
    }

    // Add jest to the environment
    if (hasPlugin('jest')) conf.env.jest = true

    // Add the config file
    root.addChild(new VConfigFile('.eslintrc.yml', VConfigType.yaml, conf))

    // Add a lint script
    npmPackage.addPatch('scripts.link', PatchStrategy.placeholder, 'eslint src')
  },
}
