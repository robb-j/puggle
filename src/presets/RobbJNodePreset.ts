import { Preset, PluginArgs } from '../types'
import { VDir, VFile, VIgnoreFile } from '../vnodes'
import { trimInlineTemplate } from '../utils'

import { JestPlugin, NpmPlugin, PrettierPlugin, EslintPlugin } from '../plugins'

const indexJs = (name: string) => trimInlineTemplate`
  // 
  // The app entrypoint
  // 

  ;(async () => {
    console.log('Hello, ${name}!')
  })()
`

const editorconfig = () => trimInlineTemplate`
  #
  # Editor config, for sharing IDE preferences (https://editorconfig.org)
  #
  
  
  root = true

  [*]
  charset = utf-8
  indent_style = space
  indent_size = 2
  end_of_line = lf
  insert_final_newline = true
`

const readme = (name: string) => trimInlineTemplate`
  # ${name}
  
  Coming soon...
  
  ---
  
  > This project was set up by [puggle](https://npm.im/puggle)
`

export class RobbJNodePreset implements Preset {
  version = '0.0.0'

  plugins = [
    new NpmPlugin(),
    new JestPlugin(),
    new PrettierPlugin(),
    new EslintPlugin()
  ]

  async extendVirtualFileSystem(root: VDir, { projectName }: PluginArgs) {
    //
    // Add extra files
    //
    root.addChild(
      new VFile('README.md', readme(projectName)),
      new VDir('src', [new VFile('index.js', indexJs(projectName))]),
      new VFile('.editorconfig', editorconfig()),
      new VIgnoreFile('.gitignore', 'Ignore files from git source control', [
        'node_modules',
        'coverage',
        'dist',
        '*.env',
        '.DS_Store'
      ])
    )
  }
}
