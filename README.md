# Puggle

A CLI for bootstrapping and keeping project config up-to-date.

> **WIP** This project is still very much a work-in-progress,
> you shouldn't use this for anything yet.

<!-- toc-head -->

## Table of Contents

- [What is this for?](#what-is-this-for%3F)
- [What's the plan?](#what's-the-plan%3F)
  - [Principles](#principles)

<!-- toc-tail -->

## What is this for?

I make small packages which all have common configuration, usually based on my two template repos:
[robb-j/node-base](https://github.com/robb-j/node-base/)
or [robb-j/ts-node-base](https://github.com/robb-j/ts-node-base/).
I'm also constantly changing or updating the meta tools the projects use, like `prettier`, `eslint` or `jest`.
The tools are updated in the template repo but I have to manually apply these changes to each project I work on.

I want a way of updating this "meta layer" of a project automatically.
This is important when I come back to an older project with a new change or feature,
I don't want to have to remember how that project was configured or spend time updating it to the latest standard.

## What's the plan?

I want to create a virtual filesystem which could be used to bootstrap a project and enable automatic project upgrades.
So I don't have to keep updating the some config files over and over again.

### Principles

- It should be framework and language agnostic, with implementations built ontop of a common base
- It should be compose-able through plugins or generators
- It should allow project upgrades to avoid updating project configs over and over again.

### Ideas

```ts
class JestPlugin extends Plugin {
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

---

> This project was setup with [robb-j/ts-node-base](https://github.com/robb-j/ts-node-base/)
