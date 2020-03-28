import { Plugin } from '../types'
import { VDir, VIgnoreFile } from '../vnodes'

export const gitPlugin: Plugin = {
  name: 'git',
  version: '0.1.0',

  async apply(root, { hasPlugin }) {
    let toIgnore = ['*.env', '.DS_Store']

    if (hasPlugin('npm')) toIgnore.push('node_modules')
    if (hasPlugin('jest')) toIgnore.push('coverage')
    if (hasPlugin('typescript')) toIgnore.push('dist')

    root.addChild(
      new VIgnoreFile(
        '.gitignore',
        'Files to ignore from git source control',
        toIgnore
      )
    )
  },
}
