# Generators

> This is a [design doc](/design/README.md)

Presets for a specific project setup

```ts
// e.g. published on npm as: puggle-generator-robbj-nodejs
class RobbJNodeJs extends Generator {
  command = 'robb-j:node'

  plugins = [
    TypescriptPlugin,
    NodeJsPlugin,
    NodeJsDockerPlugin,
    PrettierPlugin,
    ESLintPlugin,
    JestPlugin,
  ]

  // Optional?
  async run(path: string) {
    // Ask for relevant info
    let answers = await prompts(['...'])

    // Configure plugins?
    let plugins = await this.createPlugins()
    plugins.prettier.useSemis = false

    // Configure the virtual file system
    let root = await this.createFileSystem(plugins)
    root.addFile('/src', new VFile('cli.ts', `...`))

    // Write the vfs to files
    await root.serialize(path)
  }
}
```

There should be file to remember what was generated, maybe a **puggle.json** file?

```bash
{
  "plugins": {
    "nodejs": {
      "version": "0.1.0",
      "options": {
        "name": "My fancy project",
        "repo": "robb-j/nodejs"
      }
    },
    "jest": {
      "version": "0.2.0",
      "options": {}
    }
  }
}
```
