# Puggle

[![Build Status](https://circleci.com/gh/robb-j/puggle.svg?style=svg)](https://circleci.com/gh/robb-j/puggle)
[![Coverage Status](https://coveralls.io/repos/github/robb-j/puggle/badge.svg?branch=master)](https://coveralls.io/github/robb-j/puggle?branch=master)

A CLI for bootstrapping and keeping project tooling up-to-date.

<!-- toc-head -->

## Table of contents

- [About](#about)
- [How it works](#how-it-works)
  - [Usage](#usage)
- [A simple preset](#a-simple-preset)
- [Design principles](#design-principles)
- [Making presets](#making-presets)
  - [Virtual files](#virtual-files)
    - [Placeholder vs persist](#placeholder-vs-persist)
    - [VFile](#vfile)
    - [VDir](#vdir)
    - [VConfigFile](#vconfigfile)
    - [VIgnoreFile](#vignorefile)
    - [VPackageJson](#vpackagejson)
  - [Publishing presets](#publishing-presets)
- [A full example](#a-full-example)
- [Types](#types)
- [Future work & ideas](#future-work--ideas)

<!-- toc-tail -->

## About

When you work on lots of packages, you end up making project templates
to spin up projects faster and faster.
The issue arises when you come back to an older project,
the tooling is outdated, has vunrebilities or is deprecated.
Then you have to spend time refreshing your memory on the setup,
manually updating dependencies and re-testing everything again.

I made puggle to solve this problem, to quickly bootstrap a project
with the ability to auto-upgrade it later when the template changes.

My idea is that you have your source code then you use puggle to hoist the meta-packages around it.
For example, adding `prettier` or moving from `husky` to `yorkie`

## How it works

You setup presets in puggle which are a programatic way of bootstrapping directories.
This creates a virtual version of your desired directory and then it gets written to disk.

When you come to update a project,
puggle re-generates that virtual directory and differentially updates they files it can.

### Usage

Using a preset to setup a project

```bash
# Install puggle globally
npm install -g puggle

# Initialize a project into a new folder 'new-project'
puggle init new-project
```

Upon returning to a project later and wanting to update it:

```bash
# Go to the project - it will have a puggle.json
cd to/your/project

# Run the update
puggle update
```

## A simple preset

Below is a simple preset, it adds a folder called `src` and puts an `index.js` in it.

```js
const { VDir, VFile } = require('puggle')

const indexJs = (name) => `
// App entrypoint
console.log('Hello, ${name}!')
`

module.exports = {
  name: 'robb-j:sample',
  version: '0.1.2',

  plugins: [],

  async apply(root, { targetName }) {
    // Create a virtual file and fill it with a template
    const file = new VFile('index.js', indexJs(targetName))

    // Create a directory and put the file in it
    const dir = new VDir('src', [file])

    // Add the directory (and its file) to the virtual directory
    root.addChild(dir)
  },
}
```

## Design principles

- Be framework and language agnostic, with implementations built ontop of a common base
- Be composable with plugins to share functionality
- Allow seamless-ish upgrades to avoid updating project configs over and over again
- Be developer agnostics, you have your own presets and I have mine.

## Making presets

Here's how to create and test a preset locally

```bash
# Create a directory for your preset and go into it
mkdir my-preset
cd my-preset

# Create your preset file
touch index.js

# Make an empty package.json
npm init

# Add puggle as a global dependency
npm i -g puggle

# 1. Edit your preset in index.js
# 2. Set your package name to something
#   - Presets must start with puggle-preset
#   - Preferably user namespaced, e.g. @robb_j/puggle-preset-test
#   - See "Publishing presets" below for more info

# To test locally, link the module
npm link

# Try to run it with puggle and you should see it there
puggle

# Remember to unlink it when you're finished
# -> You have to be in the same directory as your package.json
npm unlink
```

### Virtual files

Puggle works by creating and manipulating virtual files then writting them all
to disk at once.
There are are several types of files you can make, they all inherit from `VNode`.

#### Placeholder vs persist

Nodes are added as either `PatchStrategy.placeholder` or `PatchStrategy.persist`,
this is used to determine how puggle update works.

- `persist` - the value of the virtual file will always overwrite any local changes since `puggle init`
- `placeholder` - any local changes will always be kept

#### VFile

This is a basic text file, it has a name and its contents as strings and a `PatchStrategy`.
The default strategy is always `placeholder`, you have to opt-in to persist changes.

```js
const { VFile } = require('puggle')

const fileContents = `
// Some complicated javascript
console.log('Hello, world!')
`

let indexJs = new VFile('index.js', fileContents, PatchStrategy.persist)
```

#### VDir

This type of node represents a directory which you can add files to, like in a real file system.

It has a method, `#addChild`, which you use to add other files/directories to it.
You should always use this to add new nodes (it internally sets `node.parent`).

It has a `#find` method which you can use to retrieve child nodes,
e.g. to look for `src/config/init.js`.

```js
const { VFile, VDir } = require('puggle')

let dir = new VDir('src', [
  new VFile('.env', 'SECRET=pyjamas'),
  new VFile('.gitignore', '.env'),
  new VDir('src', [new VNode('hello.txt', 'hi')]),
])

// Add a new child
dir.addChild(new VNode('README.md', '> coming soon'))

// Find a child
dir.find('.env')
dir.find('src/hello.txt')
```

#### VConfigFile

This represents some form of configuration file, currently `json` and `yaml` are supported.

Yaml files can optionally have a comment too which is inserted at the top.

```js
const { VConfigFile, VConfigType } = require('puggle')

const json = new VConfigFile('data.json', VConfigType.json, {
  url: 'https://duck.com',
})

const yaml = new VConfigFile(
  'config.yaml',
  VConfigType.yaml,
  { name: 'geoff' },
  { comment: 'All about geoff' }
)
```

**patches**

Config files have two ways of storing their data, there is the initial value you
pass to it and patches that can be applied later.
This allows you to have both `placeholder` and `persist`-ed content in the same file.

When running `puggle update` it will make sure the `persit`-ed patches are kept in your file,
while the `placeholder` patches will prefer local changes.

```js
// A base config file with an empty person object
const config = new VConfigFile('data.json', VConfigType.json, {
  person: {},
})

// This patch will be persit on "puggle update"
// -> e.g. If you changes the name to jim, "puggle update" would set it back to geoff
// -> It will merge objects together using lodash.merge
config.addPatch('person', PatchStrategy.persist, { name: 'geoff' })

// This patch will keep local changes after a "puggle init"
// -> e.g. if it was changes to 43, it would still be 43 after a "puggle update"
// -> You can use dot.notation to set values, this uses lodash.get
config.addPatch('person.age', PatchStrategy.palceholder, 42)
```

#### VIgnoreFile

This represents an ignore file like a `.gitignore`.
You pass it a set of rules and a friendly comment to explain the file.
Also useful for `.npmignore`, `.prettierignore` or others.

It automatically merges changes from existing files when doing `puggle update`.

```js
const { VIgnoreFile } = require('puggle')

let ignore = new VIgnoreFile('.gitignore', 'Files for git to ignore', [
  'node_modules',
  'coverage',
  '*.env',
  '.DS_Store',
])
```

#### VPackageJson

This represents a `package.json`.
It is basically a `VConfigFile` with some useful npm-related helper methods.

It also sorts `scripts`, `dependencies` and `devDependencies` alphabetically on serialize,
it made sense at the time.

```js
const { VPackageJson } = require('puggle')

let pkg = new VPackageJson()

// Set the 'main' value of the package
// -> This will force it to stay as this value
pkg.addPatch('main', PatchStrategy.persist, 'src/index.js')

// Add a placeholder patch for a lint command
// -> Lets you customise the lint command later and your change is kept
pkg.addPatch('scripts', PatchStrategy.placeholder, {
  lint: 'eslint src',
})

// Add a dependancy
// -> Finds the latest version that matches your semver range
// -> IMPORTANT: this is asynchronous! It goes away to the api to fetch the version(s)
// -> There is also #addLatestDevDependencies which is the same
// -> These marked as a PatchStrategy.persist
// -> You can pass multiple packages
await pkg.addLatestDependencies({
  dotenv: '^8.x',
})
```

You can also use it from `npmPlugin`:

```js
const { VPackageJson, npmPlugin } = require('puggle')

module.exports = {
  name: 'my-preset',
  version: '1.2.3',
  plugins: [npmPlugin],
  apply(root) {
    // Get the package.json which has already been added
    const pkg = VPackageJson.getOrFail(root)
  },
}
```

Npm plugin also asks extra questions to the user to fill in bits of the `VPackageJson`.
These values get stored in the generated `puggle.json`
so they don't need to be asked again when you do a `puggle update`

### Publishing presets

Once you're happy with your preset, publish it to npm registry
then install it globally on your dev machine.

For naming, `puggle` will pick up any packages that match the glob `*/puggle-preset*`, so you could call it:

- `@org/puggle-presets`
- `@user/puggle-preset-nodejs`
- `puggle-preset-geoff`

I'd reccomend using user-namespaced packages
as presets should represent a user/orgs personal preferences.

For example: `@robb_j/puggle-presets`, not: `puggle-preset-test`.

You need to have your package.json's `main` set to a script which has

```js
// Export the preset
module.exports = {
  name: 'preset',
  /* your_preset_here */
}

// Or, you can export an array of presets
module.exports = [
  { name: 'preset-a' /* your_preset_here */ },
  { name: 'preset-b' /* your_preset_here */ },
]
```

To publish a user-namespaced preset, follow below:

```bash
# Create a version of your plugin
npm version minor

# Publish to npm with a package like @robb_j/puggle-preset-test
npm publish --access=public

# Add your package globally to you dev machine
npm i -g @robb_j/puggle-preset-test

# Test puggle sees it
puggle test-dir
```

## A full example

For a full example, check out my personal presets:

- [robb-j/puggle-presets](https://github.com/robb-j/puggle-presets)

## Types

There is a `presetify` function which you can use to infer types onto your preset.
Without fully using typescript you can use your IDE's type support to help making presets.

It'll infer the type of the preset and the arguments to `#apply` too.

```js
const { presetify } = require('puggle')

module.exports = presetify({
  /* type-hinting goodness */
})
```

Puggle is written in TypeScript and you have the actual types too,
if you want to write your preset in TypeScript.

## Future work & ideas

**override PatchStrategy.persist**

Some way of locking a file in `puggle.json` so that the local version is peristed, overriding a `PatchStrategy.persist`

```json
{
  "persistFiles": [
    // Persist a specific file
    "src/somefile.js",

    // Persit a key on a VConfigFile ?
    "package.json#prettier.semi",
    { "config": "package.json", "key": "prettier.semi" },
    ["package.json", "prettier.semi"]
  ]
}
```

**streamline nested directories**

Create multiple directories at once with `new VDir('some/nested/dir')` type syntax ~ or even from a `VFile`

**preview a puggle update**

Generate a preview of what `puggle update` will do

```
puggle update

Will create these files:
• src/new-file.txt

These files are obsolete:
• old-config.yml

Will patch package.json
• pretter.useSemi: true => false
```

**preview PatchStrategy.placeholder**

Some way of comparing the files/values from `PatchStrategy.placeholder`
with the live files, so you can manually update files.

**extract npm & node.js logic into its own module**

Extract VPackageJson and npmPlugin into a node module, making the core language-agnostic

**document plugins and questions**

Document how plugins work and how to ask questions in `puggle init`

**in-project generators**

```bash
puggle add route
> route name: new-route
# added src/routes/general/new-route.ts
# added src/routes/general/__test__/new-route.spec.ts
```

```ts
interface Generator {
  name: string
  apply(root: VDir, ctx: PluginContext)
}

interface PresetChanges extends Preset {
  generators: Generator[]
}
```

**integrate with post-install binaries**

Run `npm install` or `git init` after you've done a `puggle init` or `puggle update`.
It should come from the preset rather than a default.
e.g. you could have a custom first-commit message for your repo.

**move to use standard-version and commitlint**

When this moves to 1.x, move to use [standard-version](https://www.npmjs.com/package/standard-version)
and [commitlint](https://www.npmjs.com/package/commitlint)
to automatically version based on commits and generate changelogs.

---

> This project was setup with [robb-j/ts-node-base](https://github.com/robb-j/ts-node-base/)
