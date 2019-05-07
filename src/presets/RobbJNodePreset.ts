import { Preset, PluginArgs } from '../types'
import { VDir, VFile, VIgnoreFile } from '../vnodes'
import { trimInlineTemplate } from '../utils'

import {
  JestPlugin,
  NpmPlugin,
  PrettierPlugin,
  EslintPlugin,
  VPackageJson
} from '../plugins'

const indexJs = (name: string) => trimInlineTemplate`
  //
  // The app entrypoint
  //

  ;(async () => {
    console.log('Hello, ${name}!')
  })()
`

const indexSpecJs = (name: string) => trimInlineTemplate`
  //
  // An example unit test
  //
  
  describe('sample', () => {
    it('should pass', () => {
      expect(1 + 1).toBe(2)
    })
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

export class RobbJNodePreset implements Preset {
  title = 'robb-j:node'
  version = '0.0.0'

  plugins = [
    new NpmPlugin(),
    new JestPlugin(),
    new PrettierPlugin(),
    new EslintPlugin()
  ]

  async extendVirtualFileSystem(root: VDir, { projectName }: PluginArgs) {
    let npmPackage = VPackageJson.getPackageOrFail(root)

    //
    // Tweak the package.json
    //
    npmPackage.dependencies['dotenv'] = '^7.0.0'
    npmPackage.devDependencies['nodemon'] = '^1.18.10'

    npmPackage.values['main'] = 'src/index.js'

    npmPackage.scripts['preversion'] = 'npm run test -s'
    npmPackage.scripts['start'] = 'node -r dotenv/config src/index.js'
    npmPackage.scripts[
      'dev'
    ] = `NODE_ENV=development nodemon -w src -x 'node -r dotenv/config' src/index.js`

    //
    // Add extra files
    //
    root.addChild(
      new VFile('README.md', readme(projectName)),
      new VDir('src', [
        new VDir('__tests__', [
          new VFile('index.spec.js', indexSpecJs(projectName))
        ]),
        new VFile('index.js', indexJs(projectName))
      ]),
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
