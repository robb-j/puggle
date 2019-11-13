//
// Integration test for puggle.init
//

import { puggle, makeConfig } from '../puggle'
import { writeFile, ensureDir } from 'fs-extra'
import prompts from 'prompts'
import yaml from 'yaml'

import { testJsFile, testIgnore, testPreset } from './test-preset'
import { mocked } from 'ts-jest/utils'

const testOpts = {
  silent: true
}

const testProjectName = 'project-name'

jest.mock('fs-extra')
jest.mock('yaml')

describe('puggle init', () => {
  beforeEach(() => {
    prompts.inject([testProjectName, true])
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

  it('should add a puggle.json', async () => {
    await puggle.init(testPreset, 'root', testOpts)

    let config = JSON.stringify(
      makeConfig(testPreset, testProjectName),
      null,
      2
    )
    expect(writeFile).toBeCalledWith('root/puggle.json', config)
  })
})
