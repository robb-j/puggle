/**
 * An ES6 template function to trim the start of each line of a string
 * based on the number of lines whitespace the first line has.
 *
 * For using ES6 templates within a nested block
 * and you want all lines of the string to match the nesting of the first line
 * but when outputted it should have no whitespace before each line
 *
 * ```js
 * console.log(trimLineStart`
 *   Hello, world
 * `)
 * ```
 *
 * Would output 'Hello, world\n'
 */
export function trimLineStart(
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
