//
// Integration tests
//

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
import { puggle } from '../puggle'
import { writeFile, ensureDir } from 'fs-extra'
import prompts from 'prompts'
import yaml from 'yaml'
import { mocked } from 'ts-jest/utils'

const testJsFile = trimInlineTemplate`
  console.log('Hello, world!')
`

const testIgnore = trimInlineTemplate`
  #
  # ignore
  #

  dist
`

const testConfig = {
  geoff: {
    name: 'Geoff'
  }
}

const testPlugin: Plugin = {
  name: 'test-plugin',
  version: '1.2.3',
  async apply(root, ctx) {
    root.addChild(new VIgnoreFile('.gitignore', 'ignore', ['dist']))
  }
}

const testPreset: Preset = {
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

const testOpts = {
  silent: true
}

jest.mock('fs-extra')
jest.mock('yaml')

describe('puggle init', () => {
  beforeEach(() => {
    prompts.inject(['project-name', true])
  })

  it('should write files from plugins', async () => {
    await puggle.init(testPreset, 'root', testOpts)

    expect(writeFile).toBeCalledWith('root/.gitignore', expect.any(String))
  })

  it('should render files', async () => {
    await puggle.init(testPreset, 'root', testOpts)

    expect(writeFile).toBeCalledWith('root/.gitignore', testIgnore)
  })

  it('should create files from the preset', async () => {
    await puggle.init(testPreset, 'root', testOpts)

    expect(writeFile).toBeCalledWith('root/src/index.js', testJsFile)
  })

  it('should create directories', async () => {
    await puggle.init(testPreset, 'root', testOpts)

    expect(ensureDir).toBeCalledWith('root/src')
  })

  it('should apply config patches', async () => {
    await puggle.init(testPreset, 'root', testOpts)

    expect(yaml.stringify).toBeCalledWith({
      geoff: {
        name: 'Geoff',
        pets: [{ name: 'bonny', animal: 'dog' }]
      },
      tim: {
        name: 'Tim'
      }
    })
  })
})
