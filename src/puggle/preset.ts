import { join } from 'path'

import { promisify } from 'util'
import prompts from 'prompts'
import { Preset } from '../types'
import { promptsExitProcess } from '../utils'

const glob = promisify(require('glob'))
const exec = promisify(require('child_process').exec)

export async function loadPresets(): Promise<Preset[]> {
  const { stdout } = await exec('npm root -g')

  let cwd = stdout.trim()

  const matches: string[] = await glob('*/puggle-preset*', { cwd })

  const modules = matches.map((name: string) => require(join(cwd, name)))

  return modules.reduce((all, preset) => {
    return all.concat(Array.isArray(preset) ? preset : [preset])
  }, [])
}

export async function pickPreset(presets: Preset[]): Promise<Preset> {
  const choiceify = (p: Preset) => ({
    title: p.name,
    value: p.name,
  })

  let { chosenName } = await prompts(
    {
      type: 'select',
      name: 'chosenName',
      message: 'preset',
      choices: presets.map(choiceify),
    },
    promptsExitProcess
  )

  let chosen = presets.find((p) => p.name === chosenName)

  if (!chosen) throw new Error('No preset chosen')

  return chosen
}

export const presetify = (p: Preset) => p
