import { Pluginable, PluginArgs } from '../types'
import { VDir, VIgnoreFile } from '../vnodes'
import { VPackageJson } from './NpmPlugin'
import { TypeScriptPlugin } from './TypeScriptPlugin'

export class PrettierPlugin implements Pluginable {
  version = '0.0.0'

  async extendVirtualFileSystem(root: VDir, { hasPlugin }: PluginArgs) {
    let npmPackage = VPackageJson.getPackageOrFail(root)

    npmPackage.devDependencies['prettier'] = '^1.16.4'
    npmPackage.devDependencies['husky'] = '^1.3.1'
    npmPackage.devDependencies['lint-staged'] = '^8.1.4'

    const matcher = hasPlugin(TypeScriptPlugin)
      ? '*.{js,json,css,md,ts,tsx}'
      : '*.{js,json,css,md}'

    //
    // Add a prettier config
    //
    npmPackage.values['prettier'] = {
      semi: false,
      singleQuote: true
    }

    //
    // Add a husky config to run lint-staged before commits
    //
    npmPackage.values['husky'] = {
      hooks: {
        'pre-commit': 'lint-staged'
      }
    }

    //
    // Add a lint-staged config to run prettier
    //
    npmPackage.values['lint-staged'] = {
      [matcher]: ['prettier --write', 'git add']
    }

    //
    // Add an npm script to run prettier
    //
    npmPackage.scripts['prettier'] = `prettier --write '**/${matcher}'`

    //
    // Add a prettierignore
    //
    const ignoreRules = ['coverage', 'node_modules']

    if (hasPlugin(TypeScriptPlugin)) ignoreRules.push('dist')

    root.addChild(
      new VIgnoreFile(
        '.prettierignore',
        'Files for prettier to ignore',
        ignoreRules
      )
    )
  }
}
