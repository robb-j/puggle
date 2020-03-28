import { Preset, PatchStrategy } from '../types'
import { trimInlineTemplate } from '../utils'
import { VFile, VDir, VIgnoreFile, VPackageJson } from '../vnodes'
import {
  npmPlugin,
  jestPlugin,
  prettierPlugin,
  eslintPlugin,
  gitPlugin,
  dockerPlugin,
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

export const testPreset: Preset = {
  name: 'robb-j:node',
  version: '0.1.0',

  plugins: [
    gitPlugin,
    npmPlugin,
    jestPlugin,
    prettierPlugin,
    eslintPlugin,
    dockerPlugin,
  ],

  async apply(root: VDir, { targetName }) {
    let npmPackage = VPackageJson.getOrFail(root)

    await Promise.all([
      npmPackage.addLatestDependencies({ dotenv: '^8.0.0' }),
      npmPackage.addLatestDevDependencies({ nodemon: '^1.19.1' }),
    ])

    npmPackage.addPatch('main', PatchStrategy.placeholder, 'src/index.js')

    npmPackage.addPatch(
      'scripts.start',
      PatchStrategy.placeholder,
      'node -r dotenv/config src/index.js'
    )
    npmPackage.addPatch(
      'scripts.dev',
      PatchStrategy.placeholder,
      `NODE_ENV=development nodemon -w src -x 'node -r dotenv/config' src/index.js`
    )

    root.addChild(
      new VFile('README.md', readme(targetName)),
      new VDir('src', [
        new VDir('__tests__', [new VFile('index.spec.js', indexSpecJs())]),
        new VFile('index.js', indexJs(targetName)),
      ]),
      new VFile('.editorconfig', editorconfig()),
      new VIgnoreFile('.gitignore', 'Ignore files from git source control', [
        'node_modules',
        'coverage',
        '*.env',
        '.DS_Store',
      ])
    )
  },
}
