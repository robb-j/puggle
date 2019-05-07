import { join } from 'path'

import { Preset } from '../types'
import { exec, glob } from './promisified'

export async function loadPresets() {
  const { stdout } = await exec('npm root -g')

  let cwd = stdout.trim()

  const matches = await glob('*/puggle-preset-*', { cwd })

  return Promise.all(
    matches.map(async name => {
      const SomePreset = require(join(cwd, name))
      return new SomePreset() as Preset
    })
  )
}
