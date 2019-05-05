import { Pluginable, Preset } from './Pluginable'
import prompts from 'prompts'
import { VDir } from './VNode'
import { join } from 'path'

const promptOptions = {
  onCancel: () => process.exit(1)
}

function lastDirectory(path: string) {
  let parts = path.split('/')
  return parts[parts.length - 1] || '/'
}

export class Puggle {
  preset: Preset

  constructor(preset: Preset) {
    this.preset = preset
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
      const args = { projectName, targetPath }

      for (let plugin of this.preset.plugins) {
        await plugin.extendVirtualFileSystem(root, args)
      }

      await this.preset.extendVirtualFileSystem(root, args)

      await root.serialize(join(__dirname, '../test'))
    } catch (error) {
      console.log(error.message)
    }
  }
}
