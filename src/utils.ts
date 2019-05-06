import fs from 'fs'
import { promisify } from 'util'

/**
 * An ES6 template function to trim the start of each line of a string
 * based on the number of lines whitespace the first line has.
 *
 * For using ES6 templates within a nested block
 * and you want all lines of the string to match the nesting of the first line
 * but when outputted it should have no whitespace before each line
 *
 * ```js
 * console.log(trimInlineTemplate`
 *   Hello, world
 * `)
 * ```
 *
 * Would output 'Hello, world\n'
 */
export function trimInlineTemplate(
  strings: TemplateStringsArray,
  ...args: any[]
): string {
  let output = []

  for (let i = 0; i < strings.length - 1; i++) {
    output.push(strings[i])
    output.push(args[i])
  }

  output.push(strings[strings.length - 1])

  let str = output.join('')

  let [, match] = str.match(/^\n(\s+)/) || ([] as string[])

  if (!match) return str

  let replacer = new RegExp(`^${match[0]}{0,${match.length}}`, 'gm')

  return str.replace(/^\n/, '').replace(replacer, '')
}

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

/** fs.readFile but with promises */
export const readFile = promisify(fs.readFile)

/** fs.writeFile but with promises */
export const writeFile = promisify(fs.writeFile)

/** fs.mkdir but with promises */
export const mkdir = promisify(fs.mkdir)

type StringKeyed = { [idx: string]: any }

/** Sort an object's keys alphabetically */
export function sortObjectKeys<T extends StringKeyed>(input: T): T {
  const output: T = {} as any

  let keys = Object.keys(input)
  keys.sort()

  for (const key of keys) {
    output[key] = input[key]
  }

  return output
}
