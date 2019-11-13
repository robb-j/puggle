import { Plugin, PatchStrategy } from '../types'
import { VIgnoreFile, VPackageJson } from '../vnodes'

export const prettierPlugin: Plugin = {
  name: 'prettier',
  version: '0.2.0',

  async apply(root, { hasPlugin }) {
    let npmPackage = VPackageJson.getOrFail(root)

    await npmPackage.addLatestDevDependencies({
      prettier: '^1.16.4',
      yorkie: '^2.0.0',
      'lint-staged': '^8.1.4'
    })

    const matcher = '*.{js,json,css,md,ts,tsx}'

    // Add a prettier config to the package.json
    npmPackage.addPatch('prettier', PatchStrategy.persist, {
      semi: false,
      singleQuote: true
    })

    //
    // Add a husky config to run lint-staged before commits
    //
    npmPackage.addPatch('gitHooks', PatchStrategy.persist, {
      'pre-commit': 'lint-staged'
    })

    // Add a lint-staged config to run prettier
    npmPackage.addPatch('lint-staged', PatchStrategy.persist, {
      [matcher]: ['prettier --write', 'git add']
    })

    // Add an npm script to run prettier
    npmPackage.addPatch(
      'scripts.prettier',
      PatchStrategy.persist,
      `prettier --write '**/${matcher}'`
    )

    // Add a prettierignore
    const ignoreRules = ['coverage', 'node_modules']
    if (hasPlugin('typescript')) ignoreRules.push('dist')

    root.addChild(
      new VIgnoreFile(
        '.prettierignore',
        'Files for prettier to ignore',
        ignoreRules
      )
    )
  }
}
