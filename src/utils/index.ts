import { StringKeyed } from '../types'

export * from './promisified'
export * from './trimInlineTemplate'
export * from './loadPresets'
export * from './stringifyVNode'

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
  const output = {} as any

  let keys = Object.keys(input)
  keys.sort()

  for (let key of keys) {
    output[key] = input[key]
  }

  return output
}
