import { join } from 'path'

import { promisify } from 'util'
import prompts = require('prompts')
import { Preset } from '../types'

const glob = promisify(require('glob'))
const exec = promisify(require('child_process').exec)

export async function loadPresets() {
  const { stdout } = await exec('npm root -g')

  let cwd = stdout.trim()

  const matches = await glob('*/puggle-preset-*', { cwd })

  return matches.map((name: string) => require(join(cwd, name))).flat()
}

export async function pickPreset(presets: Preset[]): Promise<Preset> {
  const choiceify = (p: Preset) => ({
    title: p.name,
    value: p.name
  })

  let { chosenName } = await prompts({
    type: 'select',
    name: 'chosenName',
    message: 'preset',
    choices: presets.map(choiceify)
  })

  let chosen = presets.find(p => p.name === chosenName)

  if (!chosen) throw new Error('No preset chosen')

  return chosen
}

export const presetify = (p: Preset) => p
