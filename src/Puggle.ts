import prompts from 'prompts'
import { VDir, VConfigType, VConfigFile, findFileConflicts } from './vnodes'
import { lastDirectory, loadPresets, stringifyVNode } from './utils'
import casex from 'casex'
import chalk from 'chalk'
import { Preset, PluginClass, StringKeyed, PuggleConfig } from './types'

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
  params = new Map<string, any>()

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

  async askQuestions<T extends string = string>(
    paramGroup: string,
    questions: Array<prompts.PromptObject<T>>
  ): Promise<prompts.Answers<T>> {
    let config = this.params.get(paramGroup) || {}

    let missing = questions.filter(
      question => config[question.name as string] === undefined
    )

    let rest = await prompts(missing, promptOptions)

    return { ...config, ...(rest as any) }
  }

  storePluginParams(paramGroup: string, config: any) {
    this.params.set(paramGroup, config)
  }

  async run({ path = '.', dryRun = false }: RunOptions) {
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

    const root = new VDir(targetPath, [])
    const args = {
      projectName,
      targetPath,
      puggle: this,
      hasPlugin: (k: PluginClass) => this.hasPlugin(k)
    }

    // Give each plugin a chance to setup
    for (let plugin of this.preset.plugins) {
      await plugin.extendVirtualFileSystem(root, args)
    }

    root.addChild(
      new VConfigFile(
        'puggle.json',
        VConfigType.json,
        this.generatePuggleConfig()
      )
    )

    await this.preset.extendVirtualFileSystem(root, args)

    let conflicts = await findFileConflicts('.', root)

    if (conflicts.length > 0) {
      console.log(
        chalk.bold.red('ERROR'),
        'There are conflicts with existing files:'
      )
      for (let path of conflicts) console.log(chalk.red('⨉'), path)
      process.exit(1)
    }

    if (dryRun) {
      console.log(stringifyVNode(root))
    } else {
      await root.serialize('.')
      console.log(`Initialized into ${projectName}`)
    }
  }

  generatePuggleConfig() {
    let config: PuggleConfig = {
      version: process.env.npm_package_version!,
      preset: {
        name: this.preset.title,
        version: this.preset.version
      },
      plugins: {},
      params: {}
    }

    for (let plugin of this.preset.plugins) {
      const pluginName = formatClassName(plugin, 'Plugin')
      config.plugins[pluginName] = plugin.version
    }

    this.params.forEach((params, groupName) => {
      config.params[groupName] = params
    })

    return config
  }

  async upgrade({ path = '.', dryRun = false }: RunOptions) {
    // Find a local puggle.json or fail
    // Ensure the same preset is available
    // Do nothing if the the preset version hasn't changed
    // Find plugins that have been removed
    // Find the presets that have been added
    // Find the presets that have been updated
    // See if the upgrade can be performed and prompt the user
    // Update the fs
  }
}
