import { Preset, PluginArgs } from '../types'
import { trimInlineTemplate } from '../utils'
import { VFile, VDir, VIgnoreFile } from '../vnodes'
import {
  NpmPlugin,
  JestPlugin,
  PrettierPlugin,
  EslintPlugin,
  VPackageJson,
  GitPlugin,
  DockerPlugin
} from '../plugins'

const indexJs = (name: string) => trimInlineTemplate`
  //
  // The app entrypoint
  //

  ;(async () => {
    console.log('Hello, ${name}!')
  })()
`

const indexSpecJs = () => trimInlineTemplate`
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

export class TestPreset implements Preset {
  title = 'robb-j:node'
  version = '0.1.0'

  plugins = [
    new GitPlugin(),
    new NpmPlugin(),
    new JestPlugin(),
    new PrettierPlugin(),
    new EslintPlugin(),
    new DockerPlugin()
  ]

  async extendVirtualFileSystem(root: VDir, { projectName }: PluginArgs) {
    let npmPackage = VPackageJson.getPackageOrFail(root)

    await Promise.all([
      npmPackage.addDependencies({ dotenv: '^8.0.0' }),
      npmPackage.addDevDependencies({ nodemon: '^1.19.1' })
    ])

    npmPackage.values['main'] = 'src/index.js'
    npmPackage.scripts['start'] = 'node -r dotenv/config src/index.js'
    npmPackage.scripts[
      'dev'
    ] = `NODE_ENV=development nodemon -w src -x 'node -r dotenv/config' src/index.js`

    root.addChild(
      new VFile('README.md', readme(projectName)),
      new VDir('src', [
        new VDir('__tests__', [new VFile('index.spec.js', indexSpecJs())]),
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
