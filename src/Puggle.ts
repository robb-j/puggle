import prompts from 'prompts'
import { VDir, VConfigType, VConfigFile, VNode } from './vnodes'
import { lastDirectory, loadPresets, stringifyVNode } from './utils'
import casex from 'casex'
import chalk from 'chalk'
import { Preset, PluginClass } from './types'

export type RunOptions = {
  path?: string
  dryRun?: boolean
}

const promptOptions = {
  onCancel: () => process.exit(1)
}

function formatClassName(object: any, extension: string) {
  return casex(
    object.constructor.name.replace(new RegExp(`${extension}$`), ''),
    'ca-se'
  )
}

export class Puggle {
  preset: Preset

  static async runFromEnvironment(options: RunOptions) {
    try {
      const presets = await loadPresets()

      if (presets.length === 0) {
        throw new Error('No presets found, install them with: npm i -g')
      }

      let choices = presets.map(p => ({
        title: p.title,
        value: p.title
      }))

      const { chosenPreset } = await prompts(
        {
          type: 'select',
          name: 'chosenPreset',
          message: 'Pick a preset',
          choices
        },
        promptOptions
      )

      let preset = presets.find(p => p.title === chosenPreset)!

      const puggle = new Puggle(preset)
      await puggle.run(options)
    } catch (error) {
      console.log(chalk.red('⨉'), error.message)
    }
  }

  constructor(preset: Preset) {
    this.preset = preset
  }

  hasPlugin(pluginClass: PluginClass): boolean {
    return this.preset.plugins.some(plugin => plugin instanceof pluginClass)
  }

  async run({ path = '', dryRun = false }: RunOptions) {
    const { targetPath } = await prompts(
      {
        type: 'text',
        name: 'targetPath',
        message: 'path (or "." for current directory)',
        initial: path
      },
      promptOptions
    )

    const { projectName } = await prompts(
      {
        type: 'text',
        name: 'projectName',
        message: 'name',
        initial: lastDirectory(targetPath === '.' ? process.cwd() : targetPath)
      },
      promptOptions
    )

    const root = new VDir(path, [])
    const args = {
      projectName,
      targetPath,
      puggle: this,
      hasPlugin: (k: PluginClass) => this.hasPlugin(k)
    }

    let pluginVersions: { [idx: string]: string } = {}

    // Give each plugin a chance to setup
    for (let plugin of this.preset.plugins) {
      await plugin.extendVirtualFileSystem(root, args)

      const pluginName = formatClassName(plugin, 'Plugin')
      pluginVersions[pluginName] = plugin.version
    }

    root.addChild(
      new VConfigFile('puggle.json', VConfigType.json, {
        version: process.env.npm_package_version,
        preset: {
          name: this.preset.title,
          version: this.preset.version
        },
        plugins: pluginVersions
      })
    )

    await this.preset.extendVirtualFileSystem(root, args)

    if (dryRun) {
      console.log(stringifyVNode(root))
    } else {
      await root.serialize('.')
      console.log(`Initialized into ${projectName}`)
    }
  }
}
