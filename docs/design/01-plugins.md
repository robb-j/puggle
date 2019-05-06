# Plugins

> This is a [design doc](/design/README.md)

Logically grouped sets of virtual fs changes

```ts
class JestPlugin extends Plugin {
  version = '0.2.0'

  async extendFileSystem(root: VNode) {
    let package = root.find('package.json')

    // Fail if not an npm based project
    if (!(package instanceof VPackageJson)) return

    // Register new npm dependancies
    package.write('devDependencies', {
      jest: '^24.1.0'
    })

    // Conditionally add typescript-jest dependancies
    if (root.uses(TypescriptPlugin)) {
      package.write('devDependencies', {
        '@types/jest': '^24.0.6',
        'ts-jest': '^23.10.5'
      })

      // Add jest config jest config (in the package.json)
      package.write('jest', {
        preset: 'ts-jest',
        testEnvironment: 'node',
        testPathIgnorePatterns: ['/node_modules/', '/dist/']
      })
    }
  }
}

const prettierignore = `
#
# Files for prettier to ignore
#

dist
coverage
`

class PrettierPlugin extends Plugin {
  version = '0.1.0'

  async extendFileSystem(root: VNode) {
    let package = VPackageJson.getPackageOrFail(root)

    package.write('devDependencies', {
      prettier: '1.16.4',
      'lint-staged': '^8.1.4',
      husky: '^1.3.1'
    })

    // Determine the matcher based on if using typescript or not
    const matcher = root.uses(TypescriptPlugin)
      ? '*.{js,ts,tsx,json,css,md}'
      : '*.{js,json,css,md}'

    // Add husky pre-commit hook (to run lint-staged)
    package.write('husky', {
      hooks: {
        'pre-commit': 'lint-staged'
      }
    })

    // Add lint-staged config to run prettier
    package.write('lint-staged', {
      [matcher]: ['prettier --write', 'git add']
    })

    // Add a prettier script to
    package.write('scripts', {
      prettier: `prettier --write '**/${matcher}'`
    })

    // Add the prettier ignore
    root.addFile('/', new VFile('.prettierignore', prettierignore))

    // Add the prettier config
    // -> Maybe a custom CosmiConfig file which can be in package.json
    //    or in a seperate file
    root.addFile('/', new VCosmiConfig('.prettierrc.yml', 'yaml', {
      semi: false
      singleQuote: true
    }))
  }
}
```
