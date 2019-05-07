import { join } from 'path'

import { StringKeyed } from '../types'
import { exec, glob } from './promisified'

export * from './promisified'
export * from './trimInlineTemplate'

/**
 * Get the last directory in a path
 */
export function lastDirectory(path: string) {
  let parts = path.split('/')
  return parts[parts.length - 1] || '/'
}

/**
 * Remove preceding or trailing slashes from a string
 */
export const removeSurroundingSlashes = (input: string) => {
  return input.replace(/^\/+/, '').replace(/\/+$/, '')
}

/**
 * Sort an object's keys alphabetically
 */
export function sortObjectKeys<T extends StringKeyed>(input: T): T {
  const output: T = {} as any

  let keys = Object.keys(input)
  keys.sort()

  for (const key of keys) {
    output[key] = input[key]
  }

  return output
}

export async function loadPresets() {
  const { stdout } = await exec('npm root -g')

  let cwd = stdout.trim()

  const matches = await glob('*/puggle-preset-*', { cwd })

  return matches.map(name => {
    const Preset = require(join(cwd, name))
    return new Preset()
  })
}
