# Puggle

[![Build Status](https://circleci.com/gh/robb-j/puggle.svg?style=svg)](https://circleci.com/gh/robb-j/puggle)
[![Coverage Status](https://coveralls.io/repos/github/robb-j/puggle/badge.svg?branch=master)](https://coveralls.io/github/robb-j/puggle?branch=master)

A CLI for bootstrapping and then also keeping project tooling config up-to-date.

> **WIP** This project is still very much a work-in-progress,
> you shouldn't use this for anything yet.

<!-- toc-head -->

## Table of contents

- [What is this for?](#what-is-this-for)
- [What's the plan?](#whats-the-plan)
  - [Principles](#principles)

<!-- toc-tail -->

## What is puggle for?

When you work on lots of smaller packages, you end up making project templates
to spin up projects faster and faster.
The issue arrises when you come back to an older project,
the tooling is outdated or different so you have to spend time
refreshing your memory, updating dependencies and re-testing.

I made puggle to solve this problem, to quickly bootstrap a project
with the ability to auto-update it later when the template changes.

## What's the plan?

- [x] Create a virtual file system to construct template projects
- [x] Use plugins to modify the virtual file system
- [x] Group plugins and config together to form a preset
- [x] Create a project from a global puggle/presets
- [ ] Provide support for versioning presets and plugins
- [ ] Provide a cli to inspect a puggle project and update it

## Design Principles

- It should be framework and language agnostic, with implementations built ontop of a common base
- It should be compose-able through plugins to share functionality
- It should allow project upgrades to avoid updating project configs over and over again
- It should be developer agnostic, you have your own presets not mine

## What does it look like?

Heres a sample of what the final CLI should be like

**Creating a new project**

```
puggle init .

choose your preset:
* robb-j:node
* robb-j:node-cli
> robb-j:ts-node
> robb-j:ts-node-cli

project path: .
project name: my-project

package name: my-fancy-project
package description: My fancy puggle project
package repo: robb-j/my-fancy-project

Initialized at: my-project
```

**Updating an existing project**

```
puggle update

3 updates are available:
- 0.1.0 > 1.0.0 – puggle-generator-robbj-node
- 0.1.0 > 1.0.0 – puggle-plugin-docker
- 0.1.0 > 1.0.0 – puggle-plugin-prettier

1 plugin was removed:
- puggle-plugin-mocha (0.4.2)

1 plugin was added:
- puggle-plugin-jest (1.0.0)

Continue: (Y/n): Y

There are 1 redundant files:
- mocha.opts
```

## How does it work

You have `puggle` installed globally:

```bash
npm i -g puggle
```

You also instal your own presets globally,
thats where puggle looks for presets.

```bash
npm i -g @robb_j/puggle-preset-node
```

A preset is an npm module that exports a class
that implements [Preset](/src/types.ts).

You can write presets in JavaScript or TypeScript,
TypeScript will make sure you implement the protocol correctly.
This example is in JavaScript.

```js
const {
  NpmPlugin,
  PrettierPlugin,
  JestPlugin,
  VPackageJson,
  VFile,
  VIgnoreFile,
  VDir
} = require('puggle')

const readme = name => `
# ${name}

> Coming soon ...
`

const indexJs = name => `
// App entrypoint

console.log('Hello, ${name}!')
`

module.exports = class MyNewPreset {
  constructor() {
    this.title = 'geoff:node'
    this.version = '0.1.0'
    this.plugins = [new NpmPlugin(), new JestPlugin(), new PrettierPlugin()]
  }

  /** Takes a VDir and PluginArgs (see src/types.ts) */
  async extendVirtualFileSystem(root, args) {
    let npmPackage = VPackageJson.getPackageOrFail(root)

    // Set the package's main script
    npmPackage.values['main'] = 'src/index.js'

    // Add npm dependencies
    // -> .dependencies is a shorthand for .values.dependencies
    npmPackage.dependencies['dotenv'] = '^7.0.0'

    // Add package scripts
    // -> .scripts is a shorthand for .values.scripts
    npmPackage.scripts['start'] = 'node -r dotenv/config src/index.js'

    // Add some template files, adds:
    // -> readme.md
    // -> src/index.js
    // -> .gitignore
    root.addChild(
      new VFile('README.md', readme(args.projectName)),
      new VDir('src', [new VFile('index.js', indexJs(args.projectName))]),
      new VIgnoreFile('.gitignore', 'Git ignored files', [
        'node_modules',
        '*.env',
        '.DS_Store'
      ])
    )
  }
}
```

### Preset development

To test your preset locally:

```bash
# Create a directory for your preset and go into it
mkdir my-preset
cd my-reset

# Create your preset file
touch index.js

# Make an empty package.json
npm init

# Add puggle as a dependency
npm i puggle

# 1. Edit your preset in index.js
# 2. Set your package name to something
#   - Presets must start with puggle-preset-
#   - Preferably user namespaced, e.g. @robb_j/puggle-preset-test

# To test locally, link the module
npm link

# Try to run it with puggle and you should see it there
puggle

# Remember to unlink it when you're finished
# -> You have to be in the same directory
npm unlink
```

### Virtual files

Puggle works by manipulating virtual files and then writing them all to disk at once.
There are a few built-in ones you should know about.

All virtual nodes only exist in memory until `#serialize` is called.

#### VNode

This is the base node, which all other nodes inherit from,
pretty useless by itself.

```js
const { VNode } = require('puggle')

let node = new VNode('some_abstract_node')
```

#### VDir

This one represents a virtual directory, so you nest files like a real file system.

It has a method, `#addChild`, to add new children to the directory.
You should always use this to add new nodes as it sets `node.parent`.
It currently doesn't support multiple nested nodes at once,
you need to manually create all of your `VDirs` for now.

It has a `#find` method which is for querying child nodes.
You can query any level under the directory, e.g. `src/config/init.js`.

```js
const { VNode, VDir } = require('puggle')

let dir = new VDir('src', [
  new VNode('child_a'),
  new VNode('child_b'),
  new VDir('__tests__', [new VNode('child_c')])
])

// Add a new child
dir.addChild(new VNode('child_d'))

// Find a child
dir.find('child_a')
dir.find('__tests__/child_c')
```

#### VFile

A basic text file, it has its name and contents as strings.
It exposes `#prepareContents` for subclasses so they can dynamically set the contents.

```js
const { VFile } = require('puggle')

let indexJs = new VFile(
  'index.js',
  `
// Some complicated javascript
console.log('Hello, world!')
`
)
```

#### VConfigFile

A configuration file, currently `json` and `yaml` are supported.
It's a subclass of `VFile` and works by serializing on demand in `#prepareContents`.

Presets and plugins can easily update `.values` and the final values are written to the file.

Also yaml files can optionally add a comment to the top of the file
by passing `{ comment: '...' }` to the constructor.

```js
const { VConfigFile, VConfigType } = require('puggle')

let json = new VConfigFile('data.json', VConfigType.json, {
  url: 'https://google.co.uk'
})

let opts = { comment: 'My fancy yaml file' }

let yaml = new VConfigFile(
  'config.yaml',
  VConfigType.yaml,
  {
    name: 'geoff'
  },
  opts
)
```

#### VIgnoreFile

A file for ignoring things, e.g. a `gitignore`.
You pass it a set of rules and a friendly comment to explain the file.
Also useful for `.npmignore`, `.prettierignore` or others.

```js
const { VIgnoreFile } = require('puggle')

let ignore = new VIgnoreFile('.gitignore', 'Files for git to ignore', [
  'node_modules',
  'coverage',
  '*.env',
  '.DS_Store'
])
```

#### VPackageJson

A virtual package json which is actually just a wrapper of `VConfigFile`.
This one is added by `NpmPlugin` and may be moved out of this repo at some point.

It also sorts `scripts`, `dependencies` and `devDependencies` on serialize,
it made sense to me at the time.

It has a static method, `VPackageJson.getPackageOrFail`
to quickly find a `package.json` from a `VDir`
or throw an error if there isn't one.

For TypeScript convenience it override's `VConfigFile.values` to give types.

```js
const { VPackageJson } = require('puggle')

let pkg = new VPackageJson()

// Easy access to set package scripts (wraps .values.scripts)
pkg.scripts['start'] = 'node -r dotenv/config src/index.js'

// Easy access to add production dependencies (wraps .values.dependencies)
pkg.dependencies['dotenv'] = '^v7.0.0'

// Easy access to add development dependencies (wraps .values.devDependencies)
pkg.devDependencies
```

### Preset publishing

Once your happy with your preset, publish it to npm
then install it globally on your dev machine.

For naming, I use user namespaced packages because these presets
are for my code and my coding style.
You do have to publish a bit differently to do that though

For example: `@robb_j/puggle-preset-test`,
not: `puggle-preset-test`

```bash
# Create a version of your plugin
npm version minor

# Publish to npm with a package like @robb_j/puggle-preset-test
npm publish --access=public

# Add your package globally to you dev machine
npm i -g @robb_j/puggle-preset-test

# Test puggle sees it
puggle
```

## Making Plugins

You can, theoretically, do everything you need for a template in a preset.
But when you have a few you'll want to refactor out commonalities.
Enter Plugins.

You'll be familiar with plugins as they're simpler that presets,
they share the same interface, [Pluginable](src/types.ts).
More specifically they share `#extendVirtualFileSystem`.
All a plugin is is a class that implements that method,
there are just a few extra concerns with interoperability.

The way I think about plugins is that they should add a specific feature to your preset
and then be responsible for all configuration of that feature.
For example the jest plugin should add `ts-jest` if TypeScript is being used.
This is what the `args.hasPlugin` method is for.
You can use it to asset what other plugins your plugin is being ran with.

To install a plugin all you have to do is create an instance of it in your preset,
just like the sample preset above.

For more info see the [default plugins](src/plugins)

---

> This project was setup with [robb-j/ts-node-base](https://github.com/robb-j/ts-node-base/)
