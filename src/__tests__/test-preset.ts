import { trimInlineTemplate } from '../utils'
import { Preset, Plugin, PatchStrategy } from '../types'
import {
  VFile,
  VNode,
  VIgnoreFile,
  VDir,
  VConfigFile,
  VConfigType
} from '../vnodes'

export const testJsFile = trimInlineTemplate`
  console.log('Hello, world!')
`

export const testIgnore = trimInlineTemplate`
  #
  # ignore
  #

  dist
`

export const testConfig = {
  geoff: {
    name: 'Geoff'
  }
}

export const testPlugin: Plugin = {
  name: 'test-plugin',
  version: '1.2.3',
  async apply(root, ctx) {
    root.addChild(
      new VIgnoreFile('.gitignore', 'ignore', ['dist'], PatchStrategy.persist)
    )
  }
}

export const testPreset: Preset = {
  name: 'test-preset',
  version: '9.8.7',
  plugins: [testPlugin],
  async apply(root, ctx) {
    let conf = new VConfigFile('config.json', VConfigType.yaml, testConfig, {
      comment: 'my config',
      strategy: PatchStrategy.persist
    })

    conf.addPatch('geoff.pets', PatchStrategy.placeholder, [
      { name: 'bonny', animal: 'dog' }
    ])

    conf.addPatch('tim', PatchStrategy.persist, { name: 'Tim' })

    let js = new VDir('src', [
      new VFile('index.js', testJsFile, PatchStrategy.placeholder)
    ])

    root.addChild(conf, js)
  }
}
