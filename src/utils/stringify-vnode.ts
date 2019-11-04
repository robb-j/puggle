import { VNode, VDir } from '../vnodes'
import chalk from 'chalk'

function indentString(input: string, depth: number) {
  let str = ''
  for (let i = 0; i < depth; i++) str += '  '
  return str + input
}

const dirSeperator = chalk.grey(' └ ')

export function stringifyVNode(node: VNode, depth = 0): string {
  //
  // Short circuit if the method was overriden
  //
  const { children } = node as any

  //
  // Stringify a directory
  //
  if (Array.isArray(children)) {
    const stringifiedChildren = children
      .map(child =>
        indentString(dirSeperator + stringifyVNode(child, depth + 1), depth)
      )
      .join('\n')

    return `${node.name}/ ${chalk.gray(
      node.constructor.name
    )}\n${stringifiedChildren}`
  }

  //
  // Stringify a single node
  //
  return `${node.name} ${chalk.grey(node.constructor.name)}`
}
