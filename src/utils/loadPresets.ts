// import Module from 'module'
import { join, relative } from 'path'

import { exec, glob } from './promisified'

export async function loadPresets() {
  const { stdout } = await exec('npm root -g')

  let cwd = stdout.trim()

  // const relativeRequire = Module.createRequireFromPath(cwd)

  const matches = await glob('*/puggle-preset-*', { cwd })

  return Promise.all(
    matches.map(async name => {
      let path = join(cwd, name)

      // console.log(path)
      // console.log(require.resolve(path))
      // console.log(require.resolve.paths(path))

      const Preset = require(path)
      return new Preset()
    })
  )
}
