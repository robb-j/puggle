import { Preset, PluginArgs } from '../Puggle'
import { VDir, VFile, VIgnoreFile } from '../vnodes'
import { trimInlineTemplate } from '../utils'

import { JestPlugin, NpmPlugin, PrettierPlugin, EslintPlugin } from '../plugins'

const indexTs = (name: string) => trimInlineTemplate`
  // 
  // The app entrypoint
  // 
  
  ;(async () => {
    console.log('Hello, ${name}!')
  })
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

// export class RobbJTsNodePreset implements Preset {
//   version = '0.0.0'
// }
