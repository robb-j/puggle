import { Pluginable, PluginArgs } from '../types'
import { VDir, VIgnoreFile } from '../vnodes'
import { NpmPlugin } from './NpmPlugin'
import { JestPlugin } from './JestPlugin'
import { TypeScriptPlugin } from './TypeScriptPlugin'

export class GitPlugin implements Pluginable {
  version = '0.1.0'

  async extendVirtualFileSystem(root: VDir, { hasPlugin }: PluginArgs) {
    let toIgnore = ['*.env', '.DS_Store']

    if (hasPlugin(NpmPlugin)) toIgnore.push('node_modules')
    if (hasPlugin(JestPlugin)) toIgnore.push('coverage')
    if (hasPlugin(TypeScriptPlugin)) toIgnore.push('dist')

    root.addChild(
      new VIgnoreFile(
        '.gitignore',
        'Files to ignore from git source control',
        toIgnore
      )
    )
  }
}
