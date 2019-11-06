import prompts from 'prompts'
import { Puggle } from '../types'
import { makeConfig, loadConfig } from './config'
import { VConfigFile, VConfigType, VDir } from '../vnodes'
import { stringifyVNode, findFileConflicts } from '../utils'
import { makePluginContext } from './context'

const promptOptions = {
  onCancel: () => process.exit(1)
}

export const puggle: Puggle = {
  async init(preset, targetPath, options = {}) {
    let { targetName } = await prompts(
      [
        {
          type: 'text',
          name: 'targetName',
          message: 'project name'
        }
      ],
      promptOptions
    )

    if (targetPath === '.') targetPath = process.cwd()

    const config = makeConfig(preset, targetName)
    const vfs = await puggle.generateVfs(preset, targetName, targetPath, config)
    const conflicts = await findFileConflicts('.', vfs)

    if (conflicts.length > 0) {
      console.log('Cannot proceed with conflicts\n-' + conflicts.join('\n-'))
      process.exit(1)
    }

    if (options.dryRun) return console.log(stringifyVNode(vfs))

    let { confirmed } = await prompts({
      type: 'confirm',
      name: 'confirmed',
      message: `Initialize project into '${targetPath}'?`
    })

    if (!confirmed) process.exit(1)

    await vfs.writeToFile('.')
    console.log(`Initialized into ${targetName}`)
  },

  async update(targetPath, presets, options = {}) {
    const oldConfig = loadConfig(targetPath)

    let preset = presets.find(p => p.name === oldConfig.preset.name)!

    if (preset === undefined) {
      console.log(`preset '${oldConfig.preset.name}' not found`)
      process.exit(1)
    }

    let newConfig = makeConfig(preset, oldConfig.projectName)
    newConfig.params = oldConfig.params

    let vfs = await puggle.generateVfs(
      preset,
      oldConfig.projectName,
      targetPath,
      newConfig
    )

    let { confirmed } = await prompts({
      type: 'confirm',
      name: 'confirmed',
      message: `Update project at '${targetPath}'?`
    })

    if (!confirmed) process.exit(1)

    await vfs.patchFile('.')
  },

  async generateVfs(preset, targetName, targetPath, config) {
    const root = new VDir(targetPath, [])

    const ctx = makePluginContext(preset, targetName, targetPath, config)

    for (let plugin of preset.plugins) {
      await plugin.apply(root, ctx)
    }

    await preset.apply(root, ctx)

    root.addChild(new VConfigFile('puggle.json', VConfigType.json, config))

    return root
  }
}
