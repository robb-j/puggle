import { Preset, PluginArgs } from '../Pluginable'
import { JestPlugin } from '../plugins/JestPlugin'
import { NPMPlugin } from '../plugins/NPMPlugin'
import { PrettierPlugin } from '../plugins/PrettierPlugin'
import { VDir, VFile, VIgnoreFile } from '../VNode'
import { trimLineStart } from '../utils'

const indexJs = (name: string) => trimLineStart`
  // 
  // The app entrypoint
  // 

  ;(async () => {
    console.log('Hello, ${name}!')
  })()
`

const editorconfig = () => trimLineStart`
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

export class RobbJNodePreset implements Preset {
  version = '0.0.0'

  plugins = [new JestPlugin(), new NPMPlugin(), new PrettierPlugin()]

  async extendVirtualFileSystem(root: VDir, { dirname }: PluginArgs) {
    //
    // Add the src directory
    //
    root.children.push(
      new VDir('src', [new VFile('index.js', indexJs(dirname))]),
      new VFile('.editorconfig', editorconfig()),
      new VIgnoreFile('.gitignore', 'Ignore files from git source control', [
        'node_modules',
        'coverage',
        '*.env',
        '.DS_Store'
      ])
    )
  }
}
