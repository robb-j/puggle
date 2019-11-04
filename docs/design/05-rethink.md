# Project re-think

> This is a [design doc](/design/README.md)

I want to trim the bloat and add a `puggle update` flow.

## High-level interfaces

I want to simplify and prune the front-facing interface to the app

```ts
interface Plugin {
  name: string
  version: string
  apply(root: VDir, ctx: PluginContext)
}

interface Preset {
  name: string
  version: string
  plugins: Plugin[]
  apply(root: VDir, ctx: PluginContext)
}

interface PluginContext {
  targetName: string
  targetPath: string
  hasPlugin(name: string): boolean
  askQuestions<T extends string>(
    namespace: string,
    questions: Array<prompts.PromptObject<T>>
  ): Promise<prompts.Answers<T>>
}

interface PuggleOptions = {
  dryRun?: boolean
}

interface Puggle {
  init(preset: Preset, path: string, options: PuggleOptions): Promise<void>
  update(path: string, options: PuggleOptions): Promise<void>
  generateVfs(preset: Preset, path: string): VDir
}
```

## Virtual fs

There should be a new method on VNode to patch it's value with the file at a given path.
It stores a `PatchStrategy` which determines what it does

- `persist` will make the vnode keep around even if the file has been modified by the user. So should be used by plugins which "own" a file
- `placeholder` will not attempt to override any user changes. So should be used by plugins which expect the user to change the file.

```ts
enum PatchStrategy {
  persist,
  placeholder
}

interface VNode {
  name: string
  parent?: VNode

  new (name: string): VNode

  writeToFile(basePath: string): Promise<void>
  patchFile(basePath: string): Promise<void>
}

interface VFile extends VNode {
  patch: PatchStrategy

  new (name: string, contents: string, patch: PatchStrategy): VFile
}
```

Config files should have a similar change but on a key-value basis.
This means that part of the file can be templates and others persist.

For example, a package.json's dependencies could persist where as scripts could be templated.

This would change how the plugins applies changes to virtual values.

```ts
enum VConfigType {
  json,
  yaml
}

interface VConfigPatch {
  path: string
  strategy: PatchStrategy
  data: any
}

interface VConfigFile extends VNode {
  type: VConfigType
  patches: VConfigPatch[]

  new (
    name: string,
    type: VConfigType,
    values: any,
    comment: string,
    patch: PatchStrategy
  ): VConfigFile

  addPatch(path: string, strategy: PatchStrategy, data: any)
}
```

A plugin can add these patches like below.

```ts
function apply(root: VDir, ctx: PluginContext) {
  let conf = root.find('myconfig.yml')

  // Add a placeholder name which the user may change
  conf.addPatch('geoff.age', PatchStrategy.placeholder, 42)

  // Add a fixed array "pets" which will persist
  conf.addPatch('geoff.pets', PatchStrategy.persist, [
    { name: 'Sandie', animal: 'Dog' }
  ])
}
```
