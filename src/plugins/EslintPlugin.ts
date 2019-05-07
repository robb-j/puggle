import { VDir, VConfigType, VConfigFile } from '../vnodes'
import { Pluginable, PluginArgs } from '../types'
import { VPackageJson } from './NpmPlugin'
import { PrettierPlugin } from './PrettierPlugin'
import { JestPlugin } from '.';

export class EslintPlugin implements Pluginable {
  version = '0.0.0'

  async extendVirtualFileSystem(root: VDir, { hasPlugin }: PluginArgs) {
    let npmPackage = VPackageJson.getPackageOrFail(root)

    // Add required eslint dependencies
    Object.assign(npmPackage.devDependencies, {
      eslint: '^5.14.0',
      'eslint-config-standard': '^12.0.0',
      'eslint-plugin-import': '^2.16.0',
      'eslint-plugin-node': '^8.0.1',
      'eslint-plugin-promise': '^4.0.1',
      'eslint-plugin-standard': '^4.0.0'
    })

    let conf = {
      root: true,
      parserOptions: {
        sourceType: 'module',
        ecmaVersion: 2018
      },
      env: {
        node: true
      } as any,
      extends: ['standard']
    }

    // Tweak ourself if prettier is also being used
    if (hasPlugin(PrettierPlugin)) {
      // Add the eslint-config-prettier extension
      npmPackage.devDependencies['eslint-config-prettier'] = '^4.0.0'

      // Add prettier usage to the config
      conf.extends.push('prettier', 'prettier/standard')
    }
    
    // Add jest to the environment
    if (hasPlugin(JestPlugin)) conf.env.jest = true

    // Add the config file
    root.addChild(new VConfigFile('.eslintrc.yml', VConfigType.yaml, conf))
    
    // Add a lint script
    npmPackage.scripts['lint'] = 'eslint src'
  }
}
