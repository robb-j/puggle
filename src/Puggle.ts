import prompts from 'prompts'
import { VDir, VConfigType, VConfigFile } from './vnodes'
import { join } from 'path'
import { lastDirectory } from './utils'
import casex from 'casex'

const promptOptions = {
  onCancel: () => process.exit(1)
}

export interface PluginClass {
  new (...args: any[]): Pluginable
}

export type PluginArgs = {
  puggle: Puggle
  targetPath: string
  projectName: string
  // previousPluginVersions: { [idx: string]: string | undefined }
}

export interface Pluginable {
  version: string

  extendVirtualFileSystem(root: VDir, args: PluginArgs): Promise<void>
}

export interface Preset extends Pluginable {
  plugins: Pluginable[]
}

function formatClassName(object: any, extension: string) {
  return casex(
    object.constructor.name.replace(new RegExp(`${extension}$`), ''),
    'ca-se'
  )
}

function getPluginName(plugin: Pluginable) {
  return formatClassName(plugin, 'Plugin')
}

export class Puggle {
  preset: Preset

  constructor(preset: Preset) {
    this.preset = preset
  }

  hasPlugin(pluginClass: PluginClass): boolean {
    return this.preset.plugins.some(plugin => plugin instanceof pluginClass)
  }

  async run(initialPath = '.') {
    try {
      let { targetPath } = await prompts(
        {
          type: 'text',
          name: 'targetPath',
          message: 'path (or "." for current directory)',
          initial: initialPath
        },
        promptOptions
      )

      let { projectName } = await prompts(
        {
          type: 'text',
          name: 'projectName',
          message: 'name',
          initial: lastDirectory(
            targetPath === '.' ? process.cwd() : targetPath
          )
        },
        promptOptions
      )

      const root = new VDir('.', [])
      const args = {
        projectName,
        targetPath,
        puggle: this,
        plugins: this.preset.plugins
      }

      let pluginVersions: { [idx: string]: string } = {}

      // Give each plugin a chance to setup
      for (let plugin of this.preset.plugins) {
        await plugin.extendVirtualFileSystem(root, args)

        let pluginName = formatClassName(plugin, 'Plugin')
        pluginVersions[pluginName] = plugin.version
      }

      root.addChild(
        new VConfigFile('puggle.json', VConfigType.json, {
          version: process.env.npm_package_version,
          preset: {
            name: formatClassName(this.preset, 'Preset'),
            version: this.preset.version
          },
          plugins: pluginVersions
        })
      )

      await this.preset.extendVirtualFileSystem(root, args)

      await root.serialize(join(__dirname, '../test', projectName))
    } catch (error) {
      console.log(error.message)
    }
  }
}
