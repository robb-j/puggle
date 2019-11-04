import { join } from 'path'

import { promisify } from 'util'

const glob = promisify(require('glob'))
const exec = promisify(require('child_process').exec)

export async function loadPresets() {
  const { stdout } = await exec('npm root -g')

  let cwd = stdout.trim()

  const matches = await glob('*/puggle-preset-*', { cwd })

  return matches.map((name: string) => require(join(cwd, name)))
}
