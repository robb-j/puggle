import { Pluginable, Preset } from './Pluginable'
import prompts from 'prompts'

const promptOptions = {
  onCancel: () => {
    throw new Error('Cancelled')
  }
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

  async run(cwd: string = '.') {
    try {
      let { directory } = await prompts(
        [
          {
            type: 'text',
            name: 'directory'
          }
        ],
        promptOptions
      )

      console.log({ directory })

      // if (path === '.') {
      //   let { confirmed } = await prompts({
      //     type: 'confirm',
      //     name: 'confirmed',
      //     message: 'Use current directory?',
      //     initial: true
      //   }, promptOptions)
      //
      //   if (!confirmed)
      // }
    } catch (error) {
      console.log(error.message)
    }
  }
}

let puggle = new Puggle()
